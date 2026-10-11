#!/usr/bin/env node
/* ==================================================================
   audit.js — reports what the dataset is missing, so a refresh pass
   can research the gaps instead of re-reading everything.

   Run:  node tools/audit.js          human-readable
         node tools/audit.js --json   machine-readable
   ================================================================== */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const load = (f, names) =>
  new Function(fs.readFileSync(path.join(ROOT, 'assets', f), 'utf8') +
               '\nreturn {' + names + '};')();

function buildReport(EVALS, MODELS, MILESTONES, exclusions = []) {
  const evalIds = new Set(EVALS.map(e => e.id));
  const modelBySlug = new Map(MODELS.map(m => [m.slug, m]));
  const excluded = new Map(MODELS.map(m => [m.slug, {}]));
  for (const rule of exclusions) {
    if (!rule.reason?.trim() || !rule.models?.length || !rule.evals?.length) {
      throw new Error('Exclusions require a reason, model slugs and evaluation IDs');
    }
    for (const slug of rule.models) {
      const model = modelBySlug.get(slug);
      if (!model) throw new Error(`Unknown excluded model: ${slug}`);
      for (const id of rule.evals) {
        if (!evalIds.has(id)) throw new Error(`Unknown excluded evaluation: ${id}`);
        if (model.scores[id] != null) throw new Error(`Score conflicts with exclusion: ${slug}/${id}`);
        if (excluded.get(slug)[id]) throw new Error(`Duplicate exclusion: ${slug}/${id}`);
        excluded.get(slug)[id] = rule.reason;
      }
    }
  }
  const scoreIds = m => EVALS.filter(e => m.scores[e.id] != null).map(e => e.id);
  const nScores = m => scoreIds(m).length;
  const applicable = m => EVALS.length - Object.keys(excluded.get(m.slug)).length;
  const missing = m => applicable(m) - nScores(m);
  const summary = m => ({ slug: m.slug, m: m.m, lab: m.lab, d: m.d });

  const newest = MODELS.reduce((a, b) => (b.y > a.y ? b : a));
  const nowStop = MILESTONES.find(m => m.now);

  const empty   = MODELS.filter(m => nScores(m) === 0 && missing(m) > 0);
  const thin    = MODELS.filter(m => nScores(m) > 0 && nScores(m) <= 2 && missing(m) > 0);
  const recent  = MODELS.filter(m => m.y >= newest.y - 0.5)
                        .sort((a, b) => b.y - a.y);

  const coverage = EVALS.map(ev => ({
    id: ev.id,
    name: ev.name,
    models: MODELS.filter(m => m.scores[ev.id] != null).length,
    applicableModels: MODELS.filter(m => !excluded.get(m.slug)[ev.id]).length,
    notApplicableModels: MODELS.filter(m => excluded.get(m.slug)[ev.id]).length
  })).map(c => ({ ...c,
    missingModels: c.applicableModels - c.models,
    pctFilled: c.applicableModels ? +(100 * c.models / c.applicableModels).toFixed(1) : null
  })).sort((a, b) => (a.pctFilled ?? Infinity) - (b.pctFilled ?? Infinity));

  const filled = MODELS.reduce((n, m) => n + nScores(m), 0);
  const total  = MODELS.length * EVALS.length;

  const applicableCells = MODELS.reduce((n, m) => n + applicable(m), 0);
  const report = {
    generated: 'run date not recorded — check git log',
    counts: {
      models: MODELS.length,
      evals: EVALS.length,
      labs: [...new Set(MODELS.map(m => m.lab))].length,
      filledCells: filled,
      totalCells: total,
      pctFilled: total ? +(100 * filled / total).toFixed(1) : null,
      applicableCells,
      notApplicableCells: total - applicableCells,
      missingCells: applicableCells - filled,
      pctApplicableFilled: applicableCells ? +(100 * filled / applicableCells).toFixed(1) : null
    },
    newestModel: { m: newest.m, lab: newest.lab, d: newest.d, y: newest.y },
    currentNowStop: nowStop ? { date: nowStop.date, v: nowStop.v, models: nowStop.models } : null,
    labs: [...new Set(MODELS.map(m => m.lab))].sort(),
    knownSlugs: MODELS.map(m => m.slug).sort(),
    modelsWithNoScores: empty.map(m => ({ ...summary(m), missingEvals: EVALS.filter(e => !excluded.get(m.slug)[e.id]).map(e => e.id) })),
    modelsWithThinScores: thin.map(m => ({
      slug: m.slug, m: m.m, lab: m.lab, d: m.d, has: scoreIds(m)
    })),
    modelsWithNoApplicableEvals: MODELS.filter(m => applicable(m) === 0).map(summary),
    benchmarkExclusions: MODELS.filter(m => Object.keys(excluded.get(m.slug)).length).map(m => ({
      ...summary(m), notApplicable: excluded.get(m.slug)
    })),
    recentReleases: recent.map(m => ({ m: m.m, lab: m.lab, d: m.d, scores: nScores(m) })),
    evalCoverage: coverage,
    sparsestEvals: coverage.filter(c => c.missingModels > 0).slice(0, 8).map(c => c.name),
    evalIds: EVALS.map(e => e.id)
  };

  return report;
}

module.exports = { buildReport };

if (require.main === module) {
  const { EVALS, MODELS } = load('models.js', 'EVALS, MODELS');
  const { MILESTONES } = load('data.js', 'MILESTONES');
  const exclusions = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets', 'benchmark-exclusions.json'), 'utf8'));
  const report = buildReport(EVALS, MODELS, MILESTONES, exclusions);
  const { newestModel: newest, currentNowStop: nowStop, modelsWithNoScores: empty,
    modelsWithThinScores: thin, evalCoverage: coverage } = report;
  const { filledCells: filled, totalCells: total } = report.counts;
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(report, null, 2));
  } else {

    const line = (s = '') => console.log(s);
    line('DATASET AUDIT');
    line('='.repeat(64));
    line(`${report.counts.models} models · ${report.counts.evals} evaluations · ${report.counts.labs} labs`);
    line(`${filled} of ${total} raw cells published (${report.counts.pctFilled}%)`);
    line(`${filled} of ${report.counts.applicableCells} applicable cells published (${report.counts.pctApplicableFilled ?? 'N/A'}%)`);
    line(`${report.counts.missingCells} missing evidence cells; ${report.counts.notApplicableCells} explicitly not applicable`);
    line('Unclassified cells remain research candidates; applicability is not independently verified.');
    line();
    line(`Newest model in data : ${newest.m} (${newest.lab}, ${newest.d})`);
    line(`Slider "now" stop    : ${nowStop ? nowStop.date + ' — ' + nowStop.models.join(', ') : 'none'}`);
    line();

    line(`RESEARCH TARGET 1 — new releases after ${newest.d}`);
    line('  Search each lab for anything shipped since then:');
    line('  ' + report.labs.join(', '));
    line();

    line(`RESEARCH TARGET 2 — ${empty.length} models with no published score and applicable evidence gaps`);
    empty.forEach(m => line(`  ${m.d.padEnd(9)} ${m.m.padEnd(26)} ${m.lab}`));
    line();

    line(`RESEARCH TARGET 3 — ${thin.length} models with only one or two scores`);
    thin.forEach(m => line(`  ${m.d.padEnd(9)} ${m.m.padEnd(26)} has: ${m.has.join(', ')}`));
    line();

    line('NOT APPLICABLE — no current evaluation applies (excluded from score research targets)');
    report.modelsWithNoApplicableEvals.forEach(m => line(`  ${m.m} (${m.slug})`));
    line('Exclusion reasons and evaluation IDs: node tools/audit.js --json → benchmarkExclusions');
    line();
    line('RESEARCH TARGET 4 — sparsest applicable evaluations (published / applicable)');
    coverage.filter(c => c.missingModels > 0).slice(0, 8).forEach(c => line(`  ${String(c.models).padStart(3)} / ${c.applicableModels}  ${c.name} — ${c.missingModels} missing, ${c.notApplicableModels} N/A`));
    line();

    line('Full eval id list (use these exact keys in `scores`):');
    line('  ' + report.evalIds.join(', '));
    line();
    line('Known slugs (do not create a duplicate):');
    line('  ' + report.knownSlugs.join(' '));

  }
}

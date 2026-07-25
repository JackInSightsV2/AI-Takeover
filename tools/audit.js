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

const { EVALS, MODELS } = load('models.js', 'EVALS, MODELS');
const { MILESTONES } = load('data.js', 'MILESTONES');

const numeric = EVALS.filter(e => !e.text);
const nScores = (m) => Object.keys(m.scores).length;

const newest = MODELS.reduce((a, b) => (b.y > a.y ? b : a));
const nowStop = MILESTONES.find(m => m.now);

const empty   = MODELS.filter(m => nScores(m) === 0);
const thin    = MODELS.filter(m => nScores(m) > 0 && nScores(m) <= 2);
const recent  = MODELS.filter(m => m.y >= newest.y - 0.5)
                      .sort((a, b) => b.y - a.y);

const coverage = EVALS.map(ev => ({
  id: ev.id,
  name: ev.name,
  n: MODELS.filter(m => m.scores[ev.id] != null).length
})).sort((a, b) => a.n - b.n);

const filled = MODELS.reduce((n, m) => n + nScores(m), 0);
const total  = MODELS.length * EVALS.length;

const report = {
  generated: 'run date not recorded — check git log',
  counts: {
    models: MODELS.length,
    evals: EVALS.length,
    labs: [...new Set(MODELS.map(m => m.lab))].length,
    filledCells: filled,
    totalCells: total,
    pctFilled: +(100 * filled / total).toFixed(1)
  },
  newestModel: { m: newest.m, lab: newest.lab, d: newest.d, y: newest.y },
  currentNowStop: nowStop ? { date: nowStop.date, v: nowStop.v, models: nowStop.models } : null,
  labs: [...new Set(MODELS.map(m => m.lab))].sort(),
  knownSlugs: MODELS.map(m => m.slug).sort(),
  modelsWithNoScores: empty.map(m => ({ slug: m.slug, m: m.m, lab: m.lab, d: m.d })),
  modelsWithThinScores: thin.map(m => ({
    slug: m.slug, m: m.m, lab: m.lab, d: m.d, has: Object.keys(m.scores)
  })),
  recentReleases: recent.map(m => ({ m: m.m, lab: m.lab, d: m.d, scores: nScores(m) })),
  evalCoverage: coverage.map(c => ({ name: c.name, id: c.id, models: c.n })),
  sparsestEvals: coverage.slice(0, 8).map(c => c.name),
  evalIds: EVALS.map(e => e.id)
};

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(report, null, 2));
  process.exit(0);
}

const line = (s = '') => console.log(s);
line('DATASET AUDIT');
line('='.repeat(64));
line(`${report.counts.models} models · ${report.counts.evals} evaluations · ${report.counts.labs} labs`);
line(`${filled} of ${total} cells published (${report.counts.pctFilled}%)`);
line();
line(`Newest model in data : ${newest.m} (${newest.lab}, ${newest.d})`);
line(`Slider "now" stop    : ${nowStop ? nowStop.date + ' — ' + nowStop.models.join(', ') : 'none'}`);
line();

line(`RESEARCH TARGET 1 — new releases after ${newest.d}`);
line('  Search each lab for anything shipped since then:');
line('  ' + report.labs.join(', '));
line();

line(`RESEARCH TARGET 2 — ${empty.length} models with no published score at all`);
empty.forEach(m => line(`  ${m.d.padEnd(9)} ${m.m.padEnd(26)} ${m.lab}`));
line();

line(`RESEARCH TARGET 3 — ${thin.length} models with only one or two scores`);
thin.forEach(m => line(`  ${m.d.padEnd(9)} ${m.m.padEnd(26)} has: ${Object.keys(m.scores).join(', ')}`));
line();

line('RESEARCH TARGET 4 — sparsest evaluations (few models have a figure)');
coverage.slice(0, 8).forEach(c => line(`  ${String(c.n).padStart(3)} / ${MODELS.length}  ${c.name}`));
line();

line('Full eval id list (use these exact keys in `scores`):');
line('  ' + report.evalIds.join(', '));
line();
line('Known slugs (do not create a duplicate):');
line('  ' + report.knownSlugs.join(' '));

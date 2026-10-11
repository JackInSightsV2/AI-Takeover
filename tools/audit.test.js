const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { buildReport } = require('./audit');
const evals = [{ id: 'math', name: 'Math' }, { id: 'time', name: 'Time', text: true }];
const model = (slug, scores = {}) => ({ slug, m: slug, lab: 'Lab', d: 'Oct 2026', y: 2026.8, scores });
const rule = (models, ids = ['math', 'time']) => ({ models, evals: ids, reason: 'Task output mismatch' });

test('partial applicability, unknown blanks, zero and text evidence reconcile', () => {
  const report = buildReport(evals, [model('general', { math: 0, time: '~1 hr' }),
    model('partial', { math: null }), model('special'), model('unknown')], [],
    [rule(['partial'], ['time']), rule(['special'])]);
  assert.deepEqual(report.counts, { models: 4, evals: 2, labs: 1, filledCells: 2,
    totalCells: 8, pctFilled: 25, applicableCells: 5, notApplicableCells: 3,
    missingCells: 3, pctApplicableFilled: 40 });
  assert.deepEqual(report.modelsWithNoScores.map(m => [m.slug, m.missingEvals]),
    [['partial', ['math']], ['unknown', ['math', 'time']]]);
  assert.deepEqual(report.modelsWithNoApplicableEvals.map(m => m.slug), ['special']);
  assert.equal(report.modelsWithThinScores.length, 0); // fully covered model is not a target
  assert.deepEqual(report.evalCoverage.map(c => [c.id, c.models, c.applicableModels, c.missingModels]),
    [['math', 1, 3, 2], ['time', 1, 2, 1]]);
});

test('entirely inapplicable evaluations have no percentage or research target', () => {
  const report = buildReport(evals, [model('special')], [], [rule(['special'])]);
  assert.equal(report.counts.pctApplicableFilled, null);
  assert.equal(report.counts.missingCells, 0);
  assert.deepEqual(report.sparsestEvals, []);
  assert.ok(report.evalCoverage.every(c => c.pctFilled === null));
});

test('new evaluations default to missing evidence', () => {
  const report = buildReport([...evals, { id: 'new', name: 'New' }], [model('special')], [], [rule(['special'])]);
  assert.deepEqual(report.modelsWithNoScores[0].missingEvals, ['new']);
});

test('invalid or contradictory exclusions fail loudly', () => {
  const run = exclusions => buildReport(evals, [model('scored', { math: 0 }), model('blank')], [], exclusions);
  assert.throws(() => run([rule(['missing'])]), /Unknown excluded model/);
  assert.throws(() => run([rule(['blank'], ['typo'])]), /Unknown excluded evaluation/);
  assert.throws(() => run([rule(['scored'])]), /Score conflicts/);
  assert.throws(() => run([{ ...rule(['blank']), reason: ' ' }]), /require a reason/);
  assert.throws(() => run([rule(['blank']), rule(['blank'])]), /Duplicate exclusion/);
});

test('real catalogue CLI preserves scores and reconciles all denominators', () => {
  const root = path.resolve(__dirname, '..');
  const report = JSON.parse(execFileSync(process.execPath, [path.join(__dirname, 'audit.js'), '--json'], { encoding: 'utf8' }));
  const { EVALS, MODELS } = new Function(fs.readFileSync(path.join(root, 'assets/models.js'), 'utf8') + ';return {EVALS,MODELS};')();
  const baseline = buildReport(EVALS, MODELS, []);
  assert.equal(baseline.modelsWithNoScores.length, 75);
  assert.equal(report.counts.filledCells, baseline.counts.filledCells);
  assert.equal(report.counts.filledCells, 154);
  assert.equal(report.counts.totalCells, 3072);
  assert.equal(report.counts.notApplicableCells, 648);
  assert.equal(report.counts.applicableCells, 2424);
  assert.equal(report.modelsWithNoScores.length, 48);
  assert.equal(report.modelsWithNoApplicableEvals.length, 27);
  assert.ok(report.modelsWithNoScores.some(m => m.slug === 'gpt-rosalind'));
  for (const c of report.evalCoverage) {
    assert.equal(c.models + c.missingModels, c.applicableModels);
    assert.equal(c.applicableModels + c.notApplicableModels, MODELS.length);
  }
  const human = execFileSync(process.execPath, [path.join(__dirname, 'audit.js')], { encoding: 'utf8' });
  assert.match(human, /154 of 2424 applicable cells/);
  assert.match(human, /648 explicitly not applicable/);
});

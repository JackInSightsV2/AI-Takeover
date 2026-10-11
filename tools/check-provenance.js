#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const { MODELS, EVALS, comparableScore, comparisonBest } = new Function(
  fs.readFileSync(path.join(root, 'assets/models.js'), 'utf8') +
  ';return {MODELS,EVALS,comparableScore,comparisonBest};')();
let count = 0;
for (const model of MODELS) {
  assert.deepEqual(Object.keys(model.scoreEvidence), Object.keys(model.scores));
  const html = fs.readFileSync(path.join(root, 'models', model.slug + '.html'), 'utf8');
  for (const id of Object.keys(model.scores)) {
    count++;
    assert.ok(EVALS.some(ev => ev.id === id));
    assert.ok(html.includes('id="score-' + id + '"'));
    assert.ok(html.includes('Status: ' + model.scoreEvidence[id].status));
  }
  assert.ok(!html.includes('sc--lead'));
  assert.ok(!html.includes('class="sc__bar"'));
}
assert.equal(count, 154);
assert.equal(MODELS.flatMap(m => Object.values(m.scoreEvidence)).filter(e => e.status === 'documented').length, 9);
assert.deepEqual(comparisonBest(MODELS, EVALS), {});
const evaluation = { id: 'aime', comparison: { version: '2025', settings: 'no-tools/pass@1' } };
const model = (value, evidence = {}) => ({ scores: { aime: value }, scoreEvidence: { aime: {
  status: 'audited', source: 'https://example.test/results', locator: 'AIME 2025, exact variant',
  checkedAt: '2026-10-11', version: '2025', settings: 'no-tools/pass@1', ...evidence
} } });
const valid = model(80);
assert.equal(comparableScore(valid, evaluation), true);
for (const patch of [{version:'2024'}, {settings:'tools/pass@1'}, {status:'unaudited'},
  {status:'documented'}, {source:null}, {source:'javascript:alert(1)'}, {locator:''},
  {checkedAt:null}, {version:null}, {settings:null}]) {
  assert.equal(comparableScore(model(100, patch), evaluation), false, JSON.stringify(patch));
}
for (const value of [null, '90', NaN, Infinity]) assert.equal(comparableScore(model(value), evaluation), false);
assert.equal(comparableScore(model(0), evaluation), true);
assert.equal(comparableScore(valid, {...evaluation, text:true}), false);
assert.equal(comparableScore(valid, {id:'aime'}), false);
assert.deepEqual(comparisonBest([valid], [evaluation]), {});
assert.deepEqual(comparisonBest([valid, model(70), model(100, {version:'2024'})], [evaluation]), {aime:80});
assert.deepEqual(comparisonBest([model(0), model(0)], [evaluation]), {aime:0});
console.log('Provenance: 154 preserved cells, nine documented sources, safe eligibility and cohort checks passed.');

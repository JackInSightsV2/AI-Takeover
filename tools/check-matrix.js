#!/usr/bin/env node
// DOM checks, not browser visual verification. Requires linkedom.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const { parseHTML } = require('linkedom');
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
function boot(fixture = '') {
  const {document, window} = parseHTML(read('models.html'));
  const sandbox = vm.createContext({document, window, localStorage:{getItem:()=>null,setItem:()=>{}}});
  vm.runInContext(read('assets/models.js') + fixture + read('assets/matrix.js'), sandbox);
  return {document, window, sandbox};
}
const live = boot();
assert.equal(live.document.querySelectorAll('.mx-v').length, 154);
assert.equal(live.document.querySelectorAll('.mx-best').length, 0);
assert.equal(live.document.querySelectorAll('.mx-v a[title*="Excluded"]').length, 154);
assert.equal(vm.runInContext('MODELS.every(m => m._rank === -1)', live.sandbox), true);
live.document.querySelector('[data-arrange="rank"]').click();
assert.equal(live.document.querySelectorAll('.mx-model__d').length, 128);
assert.ok([...live.document.querySelectorAll('.mx-model__d')].every(el => el.textContent.includes('Unranked')));
const fixture = `
EVALS.splice(0, EVALS.length, ...['aime','hle'].map(id => ({id,name:id,unit:'%',group:'Reasoning',desc:'Test',comparison:{version:'2025',settings:'no-tools'}})));
MODELS.splice(0, MODELS.length, ...[80,70,100].map((score,i) => ({slug:'test-'+i,m:'Test '+i,lab:'Test',d:'2026',y:2026+i,scores:{aime:score,hle:score},scoreEvidence:Object.fromEntries(['aime','hle'].map(id => [id,{status:'audited',source:'https://example.test',locator:'exact column',checkedAt:'2026-10-11',version:i===2?'2024':'2025',settings:'no-tools'}]))})));
`;
const test = boot(fixture);
assert.equal(test.document.querySelectorAll('.mx-best').length, 2);
assert.equal(vm.runInContext('MODELS[0]._rank', test.sandbox), 1);
assert.equal(vm.runInContext('MODELS[1]._rank', test.sandbox), 0.875);
assert.equal(vm.runInContext('MODELS[2]._rank', test.sandbox), -1);
assert.equal(test.document.querySelectorAll('.mx-v a[title*="Excluded"]').length, 2);
console.log('Matrix: legacy exclusions, evidence links, rank controls and mixed-version fixture passed.');

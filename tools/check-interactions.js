#!/usr/bin/env node
// DOM interaction regression checks. Requires linkedom; not a visual browser test.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const { parseHTML } = require('linkedom');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const data = new Function(read('assets/data.js') + read('assets/models.js') + ';return {MILESTONES,MODELS};')();
assert.equal(data.MILESTONES.filter(m => m.now).length, 1);
assert.equal(data.MILESTONES.find(m => m.now).v, 60);
assert.ok(data.MILESTONES.every((m, i, a) => !i || m.v > a[i-1].v));
function boot(query = '') {
  const { window, document } = parseHTML(read('index.html'));
  let location = new URL('https://example.test/index.html' + query);
  // linkedom lacks browser select mutation, Option, and layout APIs.
  for (const select of document.querySelectorAll('select')) {
    let value = select.querySelector('option')?.getAttribute('value') || '';
    Object.defineProperty(select, 'value', { get: () => value, set: v => { value = v; } });
    select.add = option => select.append(option);
  }
  const sandbox = { document, window, URL, URLSearchParams, console,
    get location() { return location; },
    history: { replaceState(_, __, url) { location = new URL(url); } },
    localStorage: { getItem() { return null; }, setItem() {} },
    matchMedia: () => ({ matches: true }),
    setTimeout: fn => { fn(); return 1; }, clearTimeout() {},
    Option: function(text, value) { const el = document.createElement('option'); el.textContent = text; el.value = value; return el; }
  };
  vm.createContext(sandbox);
  vm.runInContext(read('assets/data.js') + read('assets/models.js') + read('assets/app.js') + read('assets/timeline.js'), sandbox);
  const $ = s => document.querySelector(s);
  const change = (selector, value, type = 'change') => { $(selector).value = value; $(selector).dispatchEvent(new window.Event(type)); };
  return { $, document, change, location: () => location };
}
const app = boot();
assert.equal(app.$('#valAI').textContent, '60');
assert.equal(app.$('#valHuman').textContent, '40');
assert.equal(app.$('#eraDate').textContent, 'Oct 2026');
assert.equal(app.$('#fillRect').getAttribute('y'), '106.20');
const labs = [...new Set(data.MODELS.map(m => m.lab))];
assert.equal(app.document.querySelectorAll('#timelineCompany option').length, labs.length);
let total = 0;
for (const lab of labs) {
  app.change('#timelineCompany', lab);
  const expected = data.MODELS.filter(m => m.lab === lab);
  const links = [...app.document.querySelectorAll('.timeline-model')].map(a => a.getAttribute('href'));
  assert.deepEqual(links.sort(), expected.map(m => 'models/' + m.slug + '.html').sort());
  total += links.length;
  app.change('#timelineOrder', 'oldest');
  const oldest = [...app.document.querySelectorAll('.timeline-month > h3')].map(el => el.textContent);
  app.change('#timelineOrder', 'newest');
  const newest = [...app.document.querySelectorAll('.timeline-month > h3')].map(el => el.textContent);
  assert.deepEqual(newest, oldest.reverse());
}
assert.equal(total, 128);
app.change('#range', '53', 'input');
assert.equal(app.$('#valAI').textContent, '53');
assert.equal(app.$('#eraDate').textContent, 'Jul 2026');
app.$('#resetBtn').click();
assert.equal(app.$('#valAI').textContent, '60');
assert.equal(Number(app.$('#countAI').textContent) + Number(app.$('#countHuman').textContent), 36);
app.change('#range', '68', 'input');
assert.equal(app.$('#eraTag').textContent, 'Projected');
app.change('#timelineCompany', 'Anthropic');
assert.equal(app.location().searchParams.get('v'), '68');
const shared = boot('?company=Anthropic&order=oldest&v=53');
assert.equal(shared.$('#timelineCompany').value, 'Anthropic');
assert.equal(shared.$('#timelineOrder').value, 'oldest');
assert.equal(shared.$('#valAI').textContent, '53');
const invalid = boot('?company=unknown&order=bad&v=900');
assert.equal(invalid.$('#timelineCompany').value, 'OpenAI');
assert.equal(invalid.$('#timelineOrder').value, 'newest');
assert.equal(invalid.$('#valAI').textContent, '100');
console.log('PASS: robot defaults/fill/reset/history/projection, ledger totals, all 128 releases / 13 labs, both timeline orders, shared and invalid URLs. DOM only.');

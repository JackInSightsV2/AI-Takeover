#!/usr/bin/env node
/* ==================================================================
   check-links.js — fails the build if any internal link is broken
   or if models/ has drifted from assets/models.js.

   Run:  node tools/check-links.js
   ================================================================== */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKIP = new Set(['.git', 'node_modules', '.github']);

function pages(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) pages(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const files = pages(ROOT);
const broken = [];
let checked = 0;

for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  const base = path.dirname(file);
  for (const [, href] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|data:|mailto:|#)/.test(href)) continue;
    const target = href.split('#')[0].split('?')[0];
    if (!target) continue;
    checked++;
    if (!fs.existsSync(path.resolve(base, target))) {
      broken.push(`${path.relative(ROOT, file)} → ${href}`);
    }
  }
}

/* every model in the data must have a page, and vice versa */
const src = fs.readFileSync(path.join(ROOT, 'assets', 'models.js'), 'utf8');
const { MODELS } = new Function(src + '\nreturn { MODELS };')();
const slugs = new Set(MODELS.map(m => m.slug));
const onDisk = new Set(
  fs.readdirSync(path.join(ROOT, 'models'))
    .filter(f => f.endsWith('.html'))
    .map(f => f.replace(/\.html$/, ''))
);
const missing = [...slugs].filter(s => !onDisk.has(s));
const orphan  = [...onDisk].filter(s => !slugs.has(s));

console.log(`${files.length} pages, ${checked} internal links checked`);
console.log(`${slugs.size} models in data, ${onDisk.size} pages on disk`);

let fail = false;
if (broken.length) { console.error('\nBROKEN LINKS:\n  ' + broken.join('\n  ')); fail = true; }
if (missing.length) { console.error('\nMODELS WITHOUT A PAGE:\n  ' + missing.join('\n  ')); fail = true; }
if (orphan.length)  { console.error('\nPAGES WITHOUT DATA:\n  ' + orphan.join('\n  ')); fail = true; }

if (fail) process.exit(1);
console.log('ok — no broken links, data and pages in sync');

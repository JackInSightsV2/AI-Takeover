#!/usr/bin/env node
/* ==================================================================
   build.js — generates one static page per model into /models.

   Run:  node tools/build.js
   Reads assets/models.js as the single source of truth. No deps.
   ================================================================== */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'models');

/* ---- load the data without a module system ---- */
const src = fs.readFileSync(path.join(ROOT, 'assets', 'models.js'), 'utf8');
const { EVALS, MODELS } = new Function(src + '\nreturn { EVALS, MODELS };')();

const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));
const dagger = (s) => s.replace('†', '<span class="est">†</span>');

/* best published value per numeric evaluation */
const best = {};
EVALS.forEach(ev => {
  if (ev.text) return;
  const vals = MODELS.map(m => m.scores[ev.id]).filter(v => typeof v === 'number');
  if (vals.length) best[ev.id] = Math.max(...vals);
});

const byId = Object.fromEntries(EVALS.map(e => [e.id, e]));

/* MODELS is already sorted oldest-first by models.js */
const ordered = MODELS;

const FAVICON = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='18' fill='%23fbfaf8'/><rect x='24' y='30' width='52' height='40' rx='12' fill='none' stroke='%230d7d94' stroke-width='6'/><circle cx='39' cy='50' r='5' fill='%230d7d94'/><circle cx='61' cy='50' r='5' fill='%230d7d94'/><path d='M50 30V16' stroke='%230d7d94' stroke-width='6' stroke-linecap='round'/></svg>";

function page(m, prev, next) {
  const scoreIds = EVALS.map(e => e.id).filter(id => m.scores[id] != null);

  const specs = [
    ['Lab', m.lab],
    ['Released', m.d],
    ['Weights', m.open ? 'Open' : 'Closed'],
    m.licence ? ['Licence', m.licence] : null,
    m.params ? ['Parameters', m.params] : null,
    m.ctx ? ['Context', m.ctx] : null,
    m.price ? ['Price', m.price] : null,
    ['Index position', m.idx + ' / 100']
  ].filter(Boolean);

  const scoreCards = scoreIds.map(id => {
    const ev = byId[id];
    const raw = m.scores[id];
    const isNum = typeof raw === 'number';
    const lead = isNum && raw === best[id];
    /* Elo is whole; everything else carries one decimal so scales read alike */
    const val = isNum
      ? (ev.unit === ' Elo' ? String(raw) : raw.toFixed(1)) + (ev.unit || '')
      : dagger(esc(raw));
    const pct = isNum && best[id] ? Math.max(2, Math.round(100 * raw / best[id])) : 0;
    return '' +
      '<div class="sc' + (lead ? ' sc--lead' : '') + '">' +
        '<span class="sc__v">' + val + '</span>' +
        '<span class="sc__n">' + esc(ev.name) + '</span>' +
        '<span class="sc__d">' + esc(ev.desc) + '</span>' +
        (isNum && best[id]
          ? '<span class="sc__bar"><i style="width:' + pct + '%"></i></span>'
          : '') +
      '</div>';
  }).join('\n          ');

  const results = scoreIds.length
    ? '<div class="scoregrid">\n          ' + scoreCards + '\n        </div>'
    : '<p class="nores">' + esc(m.lab) + ' published no benchmark figures for ' + esc(m.m) +
      ' that we could verify against a named evaluation. That is common — most releases are announced ' +
      'with a capability narrative rather than a scoreboard — and it is left blank here rather than ' +
      'filled with an estimate.</p>';

  const pn = (mm, dir) => mm
    ? '<a class="pn pn--' + dir + '" href="' + mm.slug + '.html">' +
        '<span>' + (dir === 'prev' ? 'Previous release' : 'Next release') + '</span>' +
        '<b>' + esc(mm.m) + '</b></a>'
    : '<span class="pn pn--' + dir + ' pn--empty"><span>' +
        (dir === 'prev' ? 'Previous release' : 'Next release') + '</span><b>—</b></span>';

  const desc = m.m + ' (' + m.lab + ', ' + m.d + ') — published benchmark scores and what it changed.';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(m.m)} — ${esc(m.lab)} — The Displacement Index</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#fbfaf8">
<link rel="icon" href="${FAVICON}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@300;400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/styles.css">
<script>try{document.documentElement.setAttribute('data-theme',localStorage.getItem('di-theme')==='dark'?'dark':'light')}catch(e){document.documentElement.setAttribute('data-theme','light')}</script>
</head>
<body>

<div class="grain" aria-hidden="true"></div>

<header class="site">
  <div class="wrap site__inner">
    <a class="site__mark" href="../index.html">The&nbsp;Displacement&nbsp;Index</a>
    <span class="site__right">
      <nav class="site__nav">
        <a href="../index.html">The index</a>
        <a href="../models.html">Matrix</a>
      </nav>
      <button class="themer" id="themer" type="button" aria-label="Switch to dark theme" title="Switch theme">
        <svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2M12 20v2M4.9 4.9l1.5 1.5M17.6 17.6l1.5 1.5M2 12h2M20 12h2M4.9 19.1l1.5-1.5M17.6 6.4l1.5-1.5"/></svg>
        <svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.6 6.6 0 0 0 10.5 10.5z"/></svg>
      </button>
    </span>
  </div>
</header>

<main>
  <section class="mp wrap">
    <div class="crumb">
      <a href="../models.html">Matrix</a> <span>/</span> <span>${esc(m.lab)}</span> <span>/</span> <span>${esc(m.m)}</span>
    </div>

    <div class="mp__head"><h1>${esc(m.m)}</h1></div>

    <div class="mp__tags">
      <span class="chip">${esc(m.lab)}</span>
      <span class="chip">${esc(m.d)}</span>
      <span class="tagw"${m.open ? ' data-open' : ''}>${m.open ? 'Open weights' : 'Closed weights'}</span>
      ${m.licence ? '<span class="chip">' + esc(m.licence) + '</span>' : ''}
    </div>

    <p class="mp__note">${esc(m.note)}</p>

    <dl class="specs">
      ${specs.map(([k, v]) => '<div><dt>' + esc(k) + '</dt><dd>' + esc(v) + '</dd></div>').join('\n      ')}
    </dl>

    <div class="sec-head">
      <h2>Published results</h2>
      <p>${scoreIds.length
        ? 'Only figures published by ' + esc(m.lab) + ' or an independent evaluator. Bars are relative to the best published score on that benchmark by any model.'
        : 'Nothing published against a named evaluation.'}</p>
    </div>

    ${results}
  </section>

  <section class="ledger wrap">
    <div class="sec-head">
      <h2>Where it sits</h2>
      <p>${esc(m.m)} places at <strong>${m.idx}</strong> on the Displacement Index — the composite of
         expert-parity rate, autonomy horizon and deployment reach described in the
         <a href="../index.html#method" style="color:var(--ai)">method</a>. The index runs 0 to 100.</p>
    </div>
    <div class="prevnext">
      ${pn(prev, 'prev')}
      ${pn(next, 'next')}
    </div>
  </section>
</main>

<footer class="site-foot">
  <div class="wrap">
    <p class="foot__lead">Sources</p>
    <ul class="srcs">
      <li><a href="https://openai.com/index/gdpval/" target="_blank" rel="noopener">OpenAI — GDPval</a></li>
      <li><a href="https://artificialanalysis.ai/evaluations/gdpval-aa" target="_blank" rel="noopener">Artificial Analysis</a></li>
      <li><a href="https://metr.org/time-horizons/" target="_blank" rel="noopener">METR — Time horizons</a></li>
      <li><a href="https://www.swebench.com/" target="_blank" rel="noopener">SWE-bench</a></li>
      <li><a href="https://arcprize.org/" target="_blank" rel="noopener">ARC Prize</a></li>
    </ul>
    <p class="foot__note">
      Figures are quoted as published by their maintainers, the releasing lab, or independent evaluators.
      Blank means unpublished, never zero. This page is generated from <code>assets/models.js</code> by
      <code>tools/build.js</code> — edit the data, not the HTML.
    </p>
  </div>
</footer>

<script src="../assets/theme.js"></script>
</body>
</html>
`;
}

/* ---- write ---- */
fs.mkdirSync(OUT, { recursive: true });

/* clear stale pages so a removed model does not linger */
for (const f of fs.readdirSync(OUT)) {
  if (f.endsWith('.html')) fs.unlinkSync(path.join(OUT, f));
}

ordered.forEach((m, i) => {
  const html = page(m, ordered[i - 1] || null, ordered[i + 1] || null);
  fs.writeFileSync(path.join(OUT, m.slug + '.html'), html);
});

const withScores = ordered.filter(m => Object.keys(m.scores).length).length;
console.log(`built ${ordered.length} model pages → models/`);
console.log(`  ${withScores} with published scores, ${ordered.length - withScores} without`);

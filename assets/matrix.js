/* ==================================================================
   matrix.js — the transposed table: models across, evaluations down
   ================================================================== */
(function () {
  'use strict';

  const $ = (s) => document.querySelector(s);

  /* ---- theme (shared behaviour with the index page) ---- */
  const root = document.documentElement;
  const themer = $('#themer');
  function setTheme(t) {
    root.setAttribute('data-theme', t);
    themer.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    try { localStorage.setItem('di-theme', t); } catch (e) { /* private mode */ }
  }
  let stored = null;
  try { stored = localStorage.getItem('di-theme'); } catch (e) { /* ignore */ }
  setTheme(stored === 'dark' ? 'dark' : 'light');
  themer.addEventListener('click', () =>
    setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'));

  /* ---- helpers ---- */
  const scored  = (m) => Object.keys(m.scores).length > 0;
  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));

  /* Elo is a whole number; everything else gets one decimal so a column
     of 95.0 / 96.2 / 93.4 reads as one scale rather than three. */
  function num(v, ev) {
    return (ev.unit === ' Elo' ? String(v) : v.toFixed(1)) + (ev.unit || '');
  }
  function fmt(v, ev) {
    if (v == null) return null;
    if (typeof v === 'string') return esc(v).replace('†', '<span class="est">†</span>');
    return num(v, ev);
  }

  /* best published value per evaluation, for the leader highlight */
  const best = {};
  EVALS.forEach(ev => {
    if (ev.text) return;
    const vals = MODELS.map(m => m.scores[ev.id]).filter(v => typeof v === 'number');
    if (vals.length) best[ev.id] = Math.max(...vals);
  });

  /* ---- capability rank, for the "Top first" arrangement ----
     Mean share of the best published figure across the benchmarks a model
     actually reports. Needs two or more published scores to rank at all,
     so a model that published one flattering number can't top the table.
     It still favours models that report selectively — stated in the UI. */
  const LABS = [...new Set(MODELS.map(m => m.lab))]
    .sort((a, b) => MODELS.filter(x => x.lab === b).length - MODELS.filter(x => x.lab === a).length
                 || a.localeCompare(b));

  MODELS.forEach(m => {
    const shares = [];
    EVALS.forEach(ev => {
      if (ev.text || !best[ev.id]) return;
      const v = m.scores[ev.id];
      if (typeof v === 'number') shares.push(v / best[ev.id]);
    });
    m._n = shares.length;
    m._rank = shares.length >= 2
      ? shares.reduce((a, b) => a + b, 0) / shares.length
      : -1;
  });

  /* ---- state ---- */
  const state = { scope: 'all', lab: '*', arrange: 'time' };

  function visible() {
    let list = MODELS.filter(m => state.lab === '*' || m.lab === state.lab);
    if (state.scope === 'scored') list = list.filter(scored);
    if (state.scope === 'open')   list = list.filter(m => m.open);

    if (state.arrange === 'rank') {
      list = list.slice().sort((a, b) => b._rank - a._rank || b.y - a.y);
    } else if (state.arrange === 'lab') {
      list = list.slice().sort((a, b) =>
        LABS.indexOf(a.lab) - LABS.indexOf(b.lab) || a.y - b.y);
    }
    return list;
  }

  /* ---- render ---- */
  const table = $('#matrixTable');

  function render() {
    const models = visible();

    /* a legitimate combination can select nothing — say so rather than
       rendering an empty grid (e.g. Anthropic + open weights) */
    if (!models.length) {
      table.innerHTML = '';
      $('#matrixEmpty').hidden = false;
      $('#matrixEmpty').textContent =
        'No models match — ' + (state.lab === '*' ? 'that combination' : state.lab) +
        (state.scope === 'open' ? ' has published no open-weight models.'
                                : ' has nothing matching that filter.');
      $('#matrixCount').textContent = '0 models';
      return;
    }
    $('#matrixEmpty').hidden = true;

    let head = '<thead><tr><th class="mx-corner">Evaluation</th>';
    models.forEach((m, i) => {
      /* when grouped by lab, mark where each company's block begins */
      const newLab = state.arrange === 'lab' && (i === 0 || models[i - 1].lab !== m.lab);
      head += '<th class="mx-model' + (m.open ? ' is-open' : '') + '"' +
                (newLab ? ' data-labstart' : '') + '>' +
                (newLab ? '<span class="mx-model__lab">' + esc(m.lab) + '</span>' : '') +
                '<a href="models/' + m.slug + '.html">' +
                  '<span class="mx-model__n">' + esc(m.m) + '</span>' +
                  '<span class="mx-model__d">' +
                    (state.arrange === 'rank' && m._rank >= 0
                      ? Math.round(m._rank * 100) + '% of best'
                      : esc(m.d)) +
                  '</span>' +
                '</a>' +
              '</th>';
    });
    head += '</tr></thead>';

    let body = '<tbody>';
    let group = null;
    EVALS.forEach(ev => {
      if (ev.group !== group) {
        group = ev.group;
        /* the label needs its own sticky span — the th box is as wide as
           the whole table, so pinning the box alone scrolls the text away */
        body += '<tr class="mx-group"><th colspan="' + (models.length + 1) + '">' +
                '<span>' + esc(group) + '</span></th></tr>';
      }
      const filled = models.filter(m => m.scores[ev.id] != null).length;
      body += '<tr>' +
        '<th class="mx-eval" title="' + esc(ev.desc) + '">' +
          '<span class="mx-eval__n">' + esc(ev.name) + '</span>' +
          '<span class="mx-eval__c">' + filled + '/' + models.length + '</span>' +
        '</th>';
      models.forEach((m, i) => {
        const newLab = state.arrange === 'lab' && (i === 0 || models[i - 1].lab !== m.lab);
        const edge = newLab ? ' data-labstart' : '';
        const raw = m.scores[ev.id];
        const v = fmt(raw, ev);
        if (v == null) { body += '<td class="mx-na"' + edge + '></td>'; return; }
        const lead = (!ev.text && raw === best[ev.id]) ? ' mx-best' : '';
        body += '<td class="mx-v' + lead + '"' + edge + '>' + v + '</td>';
      });
      body += '</tr>';
    });
    body += '</tbody>';

    table.innerHTML = head + body;

    const cells = models.reduce((n, m) => n + Object.keys(m.scores).length, 0);
    $('#matrixCount').textContent =
      models.length + ' models · ' + cells + ' published figures · ' +
      Math.round(100 * cells / (models.length * EVALS.length)) + '% of the grid';

    /* land on the present, not on the empty 2022 columns */
    const wrap = $('#matrixWrap');
    wrap.scrollLeft = wrap.scrollWidth;
  }

  /* ---- lab chips, generated from whatever labs exist ---- */
  const labBar = $('#labBar');
  labBar.insertAdjacentHTML('beforeend', LABS.map(lab =>
    '<button class="filt" type="button" data-lab="' + esc(lab) + '" aria-pressed="false">' +
      esc(lab) + '<i>' + MODELS.filter(m => m.lab === lab).length + '</i></button>'
  ).join(''));

  function press(container, el) {
    container.querySelectorAll('.filt').forEach(x =>
      x.setAttribute('aria-pressed', String(x === el)));
  }

  labBar.addEventListener('click', (e) => {
    const b = e.target.closest('.filt');
    if (!b) return;
    state.lab = b.dataset.lab;
    press(labBar, b);
    render();
  });

  $('#matrixBar').addEventListener('click', (e) => {
    const b = e.target.closest('.filt');
    if (!b) return;
    if (b.dataset.arrange) {
      state.arrange = b.dataset.arrange;
      press($('#arrangeGroup'), b);
    } else {
      state.scope = b.dataset.scope;
      press($('#scopeGroup'), b);
    }
    $('#rankNote').hidden = state.arrange !== 'rank';
    render();
  });

  render();

  /* ---- coverage summary above the table ---- */
  const totalCells = MODELS.length * EVALS.length;
  const filledCells = MODELS.reduce((n, m) => n + Object.keys(m.scores).length, 0);
  const withScores = MODELS.filter(scored).length;
  const openCount  = MODELS.filter(m => m.open).length;

  const widest = EVALS
    .map(ev => ({ ev, n: MODELS.filter(m => m.scores[ev.id] != null).length }))
    .sort((a, b) => b.n - a.n)[0];

  $('#coverage').innerHTML = [
    [MODELS.length, 'models', 'from ' + new Set(MODELS.map(m => m.lab)).size + ' labs'],
    [EVALS.length, 'evaluations', 'across ' + new Set(EVALS.map(e => e.group)).size + ' categories'],
    [Math.round(100 * filledCells / totalCells) + '%', 'of the grid published', filledCells + ' of ' + totalCells + ' cells'],
    [withScores, 'models with any score', (MODELS.length - withScores) + ' published none at all'],
    [openCount, 'open-weight', Math.round(100 * openCount / MODELS.length) + '% of the roster'],
    [widest.n, 'widest coverage', widest.ev.name]
  ].map(([v, k, sub]) =>
    '<div class="cov"><span class="cov__v">' + v + '</span>' +
    '<span class="cov__k">' + k + '</span><span class="cov__s">' + sub + '</span></div>'
  ).join('');

  /* ---- all models, grouped by lab ---- */
  const byLab = {};
  MODELS.forEach(m => (byLab[m.lab] = byLab[m.lab] || []).push(m));

  $('#labGrid').innerHTML = Object.keys(byLab)
    .sort((a, b) => byLab[b].length - byLab[a].length || a.localeCompare(b))
    .map(lab =>
      '<div class="labcol">' +
        '<h3>' + esc(lab) + '<span>' + byLab[lab].length + '</span></h3>' +
        '<ul>' + byLab[lab]
          .slice()
          .sort((a, b) => b.y - a.y)
          .map(m =>
            '<li><a href="models/' + m.slug + '.html">' + esc(m.m) + '</a>' +
            '<span class="labcol__d">' + esc(m.d) + '</span></li>').join('') +
        '</ul>' +
      '</div>'
    ).join('');
})();

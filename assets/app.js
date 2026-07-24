/* ==================================================================
   app.js — binds the index value to the robot, the console and the ledger
   ================================================================== */
(function () {
  'use strict';

  const $  = (s) => document.querySelector(s);
  const TODAY = MILESTONES.find(m => m.now).v;

  /* ---------------------------------------------------------------
     Theme — light by default; the choice persists.
  --------------------------------------------------------------- */
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

  const range     = $('#range');
  const trackFill = $('#trackFill');
  const knob      = $('#knob');
  const fillRect  = $('#fillRect');
  const waterline = $('#waterline');
  const valAI     = $('#valAI');
  const valHuman  = $('#valHuman');
  const eraDate   = $('#eraDate');
  const eraTag    = $('#eraTag');
  const eraModels = $('#eraModels');
  const eraHead   = $('#eraHead');
  const metrics   = $('#metrics');
  const listAI    = $('#listAI');
  const listHuman = $('#listHuman');
  const countAI   = $('#countAI');
  const countHum  = $('#countHuman');
  const emptyAI   = $('#emptyAI');
  const emptyHum  = $('#emptyHuman');

  /* robot fill geometry: antenna tip → feet, in viewBox units */
  const BOT_TOP = 5, BOT_BOTTOM = 258;

  const openJobs = new Set();   // holds job objects, not indexes
  let currentEra = null;
  let lastSplit  = -1;
  let lastLive   = "";

  /* ---------------------------------------------------------------
     Ticks
  --------------------------------------------------------------- */
  const ticksEl = $('#ticks');
  MILESTONES.forEach((m, i) => {
    const t = document.createElement('div');
    t.className = 'tick ' + (m.major ? 'tick--major' : 'tick--minor');
    t.style.left = m.v + '%';
    t.dataset.i = i;
    t.title = m.date + ' — ' + m.models.join(', ');
    if (m.now) t.dataset.now = '';
    if (m.projected) t.dataset.proj = '';
    t.innerHTML = '<i></i><b>' + m.date.replace(' ', '&nbsp;') + '</b>';
    ticksEl.appendChild(t);
  });
  const tickEls = [...ticksEl.children];

  /* ---------------------------------------------------------------
     Job cards — built once, updated in place
  --------------------------------------------------------------- */
  const cards = JOBS.map((job, i) => {
    const li = document.createElement('li');
    li.className = 'job';
    li.dataset.i = i;

    const gate = GATES[job.gate];
    li.innerHTML =
      '<button class="job__btn" type="button" aria-expanded="false">' +
        '<span class="job__main">' +
          '<span class="job__t">' + job.t + '</span>' +
          '<span class="job__sub">' +
            '<span>' + job.s + '</span>' +
            '<span class="job__gate gate--' + gate.k + '">' + gate.label + '</span>' +
          '</span>' +
        '</span>' +
        '<span class="job__pct">' +
          '<span class="job__bar"><i style="width:0%"></i></span>' +
          '<span class="job__n">0%</span>' +
        '</span>' +
      '</button>' +
      '<div class="job__body">' +
        '<p class="job__ev">' + job.ev + '</p>' +
        '<ul class="tasks">' +
          job.tasks.map(([label, at]) =>
            '<li data-at="' + at + '">' +
              '<span class="mk">✓</span>' +
              '<span class="tt">' + label + '</span>' +
              '<span class="at">crosses at ' + at + '</span>' +
            '</li>'
          ).join('') +
        '</ul>' +
      '</div>';

    const btn = li.querySelector('.job__btn');
    btn.addEventListener('click', () => {
      const open = li.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
      open ? openJobs.add(job) : openJobs.delete(job);
    });

    return {
      job, li, share: -1,
      bar:   li.querySelector('.job__bar i'),
      n:     li.querySelector('.job__n'),
      tasks: [...li.querySelectorAll('.tasks li')]
    };
  });

  /* ---------------------------------------------------------------
     Roster — 43 models, sortable and filterable, and it tracks the slider
  --------------------------------------------------------------- */
  const rosterBody  = $('#rosterBody');
  const rosterBar   = $('#rosterBar');
  const rosterCount = $('#rosterCount');

  const LABS = [...new Set(MODELS.map(m => m.lab))]
    .sort((a, b) => MODELS.filter(x => x.lab === b).length - MODELS.filter(x => x.lab === a).length);

  /* lab filter buttons, busiest lab first */
  const spacer = rosterBar.querySelector('.spacer');
  LABS.forEach(lab => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'filt'; b.dataset.lab = lab;
    b.setAttribute('aria-pressed', 'false');
    b.textContent = lab;
    rosterBar.insertBefore(b, spacer);
  });

  const state = { lab: '*', openOnly: false, key: 'y', dir: 'asc' };
  const num = (v) => (v == null ? -Infinity : v);

  function rosterRows() {
    return MODELS
      .filter(m => state.lab === '*' || m.lab === state.lab)
      .filter(m => !state.openOnly || m.open)
      .sort((a, b) => {
        const k = state.key;
        let d;
        if (k === 'open') d = (a.open === b.open) ? 0 : (a.open ? 1 : -1);
        else if (['swe', 'aa', 'gdp'].includes(k)) d = num(a.scores[k]) - num(b.scores[k]);
        else if (typeof a[k] === 'string') d = a[k].localeCompare(b[k]);
        else d = num(a[k]) - num(b[k]);
        if (d === 0) d = a.y - b.y;
        return state.dir === 'asc' ? d : -d;
      });
  }

  const cell = (v, suffix) =>
    v == null ? '<td class="num off">—</td>'
              : '<td class="num">' + v + (suffix || '') + '</td>';

  /* shipped = released at or before this point on the line.
     frontier = the cohort defining capability at that moment. */
  const shipped  = (m, v) => m.idx <= v;
  const frontier = (m, v) => m.idx <= v && m.idx > v - 7;

  function paintRoster(v) {
    const rows = rosterRows();
    rosterBody.innerHTML = rows.map(m => {
      const flag = frontier(m, v) ? ' data-live' : (shipped(m, v) ? '' : ' data-dim');
      return '<tr' + flag + '>' +
        '<td class="d">' + m.d + '</td>' +
        '<td class="m"><a href="models/' + m.slug + '.html">' + m.m + '</a></td>' +
        '<td class="lab">' + m.lab + '</td>' +
        cell(m.scores.swe, '%') + cell(m.scores.aa) + cell(m.scores.gdp) +
        '<td><span class="tagw"' + (m.open ? ' data-open' : '') + '>' +
          (m.open ? 'Open' : 'Closed') + '</span></td>' +
        '<td class="note">' + m.note + '</td>' +
      '</tr>';
    }).join('');

    const n = rows.filter(m => shipped(m, v)).length;
    rosterCount.textContent = rows.length + ' shown · ' + n + ' released by this point';
  }

  rosterBar.addEventListener('click', (e) => {
    const b = e.target.closest('.filt');
    if (!b) return;
    if (b.dataset.open) {
      state.openOnly = !state.openOnly;
      b.setAttribute('aria-pressed', String(state.openOnly));
    } else {
      state.lab = b.dataset.lab;
      rosterBar.querySelectorAll('[data-lab]').forEach(x =>
        x.setAttribute('aria-pressed', String(x === b)));
    }
    paintRoster(+range.value);
  });

  const sortHeads = [...document.querySelectorAll('.roster th[data-sort]')];
  sortHeads.forEach(th => th.addEventListener('click', () => {
    const k = th.dataset.sort;
    /* numeric columns are most useful high-first on the initial click */
    state.dir = state.key === k
      ? (state.dir === 'asc' ? 'desc' : 'asc')
      : (['swe', 'aa', 'gdp'].includes(k) ? 'desc' : 'asc');
    state.key = k;
    sortHeads.forEach(h => h.removeAttribute('data-dir'));
    th.setAttribute('data-dir', state.dir);
    paintRoster(+range.value);
  }));

  /* ---------------------------------------------------------------
     Milestone lookup — nearest stop at or below v
  --------------------------------------------------------------- */
  function eraFor(v) {
    let m = MILESTONES[0];
    for (const s of MILESTONES) if (v >= s.v - 1.4) m = s;
    return m;
  }

  const METRIC_ROWS = [
    ['METR 50% horizon',  'metr'],
    ['SWE-bench Verified','swe'],
    ['GDPval',            'gdpval'],
    ['Frontier-Bench',    'frontier'],
    ['Deployment reach',  'reach']
  ];

  function paintEra(m) {
    if (m === currentEra) return;
    currentEra = m;

    eraDate.textContent = m.date;
    eraTag.textContent  = m.era;
    eraTag.removeAttribute('data-now');
    eraTag.removeAttribute('data-proj');
    if (m.now)       eraTag.setAttribute('data-now', '');
    if (m.projected) eraTag.setAttribute('data-proj', '');

    eraModels.innerHTML = m.models
      .map(x => '<span class="chip">' + x + '</span>').join('');
    eraHead.textContent = m.head;

    metrics.innerHTML = METRIC_ROWS.map(([label, key]) => {
      const val  = m[key] || '—';
      const mute = (val === '—' || val === 'not yet built' || val === 'retired') ? ' class="mute"' : '';
      return '<div><dt>' + label + '</dt><dd' + mute + '>' +
             val.replace('†', '<span class="est">†</span>') + '</dd></div>';
    }).join('');
  }

  /* ---------------------------------------------------------------
     Main render
  --------------------------------------------------------------- */
  function render(v) {
    const pct = Math.max(0, Math.min(100, v));

    /* slider chrome */
    trackFill.style.width = pct + '%';
    knob.style.left       = pct + '%';

    /* robot fill */
    const y = BOT_BOTTOM - (BOT_BOTTOM - BOT_TOP) * (pct / 100);
    fillRect.setAttribute('y', y.toFixed(2));
    waterline.setAttribute('y1', y.toFixed(2));
    waterline.setAttribute('y2', y.toFixed(2));
    waterline.style.opacity = pct > 1 && pct < 99 ? '.55' : '0';

    /* headline numbers */
    valAI.textContent    = Math.round(pct);
    valHuman.textContent = 100 - Math.round(pct);

    /* era */
    const era = eraFor(pct);
    paintEra(era);
    tickEls.forEach((t, i) => {
      MILESTONES[i].v <= pct + 0.001
        ? t.setAttribute('data-on', '')
        : t.removeAttribute('data-on');
    });

    /* roster follows the line, but only repaints when its markings change */
    let nShipped = 0, nFrontier = 0;
    for (const m of MODELS) {
      if (shipped(m, pct))  nShipped++;
      if (frontier(m, pct)) nFrontier++;
    }
    const sig = nShipped + ':' + nFrontier;
    if (sig !== lastLive) { lastLive = sig; paintRoster(pct); }

    /* per-job task progress — cheap, runs every frame */
    let nAI = 0;
    for (const c of cards) {
      if (c.job.cross <= pct) nAI++;

      let done = 0;
      for (const t of c.tasks) {
        if (+t.dataset.at <= pct) { done++; t.setAttribute('data-done', ''); }
        else t.removeAttribute('data-done');
      }
      const share = Math.round((done / c.tasks.length) * 100);
      if (c.share !== share) {
        c.share = share;
        c.bar.style.width = share + '%';
        c.n.textContent   = share + '%';
      }
    }

    /* column membership — only reflow when the split actually moves.
       cards are sorted by crossing point, so nAI fully determines the split. */
    if (nAI !== lastSplit) {
      lastSplit = nAI;
      const ai = document.createDocumentFragment();
      const hu = document.createDocumentFragment();
      cards.forEach((c, i) => (i < nAI ? ai : hu).appendChild(c.li));
      listAI.replaceChildren(ai);
      listHuman.replaceChildren(hu);

      countAI.textContent  = nAI;
      countHum.textContent = JOBS.length - nAI;
      emptyAI.style.display  = nAI === 0 ? 'block' : 'none';
      emptyHum.style.display = nAI === JOBS.length ? 'block' : 'none';

      /* an open card keeps its state across the move */
      cards.forEach(c => {
        const open = openJobs.has(c.job);
        c.li.classList.toggle('open', open);
        c.li.querySelector('.job__btn').setAttribute('aria-expanded', String(open));
      });
    }
  }

  /* keep the ledger sorted: ceded ascending, held ascending */
  cards.sort((a, b) => a.job.cross - b.job.cross);

  /* ---------------------------------------------------------------
     Input — with light magnetic snap to milestones
  --------------------------------------------------------------- */
  function snap(v) {
    for (const m of MILESTONES) if (Math.abs(v - m.v) < 1.4) return m.v;
    return v;
  }

  let urlTimer;
  function rememberInUrl(v) {
    clearTimeout(urlTimer);
    urlTimer = setTimeout(() => {
      const u = new URL(location.href);
      Math.round(v) === TODAY ? u.searchParams.delete('v')
                              : u.searchParams.set('v', Math.round(v));
      history.replaceState(null, '', u);
    }, 250);
  }

  range.addEventListener('input', () => {
    const v = snap(+range.value);
    if (v !== +range.value) range.value = v;
    render(v);
    rememberInUrl(v);
  });

  $('#resetBtn').addEventListener('click', () => {
    animateTo(TODAY);
    rememberInUrl(TODAY);
  });

  tickEls.forEach(t => {
    t.style.pointerEvents = 'auto';
    t.style.cursor = 'pointer';
    t.addEventListener('click', () => {
      const v = MILESTONES[+t.dataset.i].v;
      animateTo(v);
      rememberInUrl(v);
    });
  });

  /* ---------------------------------------------------------------
     Intro / transition animation
  --------------------------------------------------------------- */
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animateTo(target, duration = 1100) {
    const from = +range.value;
    if (reduced) { range.value = target; render(target); return; }
    const t0 = performance.now();
    const ease = (p) => 1 - Math.pow(1 - p, 3);
    (function step(now) {
      const p = Math.min(1, (now - t0) / duration);
      const v = from + (target - from) * ease(p);
      range.value = v;
      render(v);
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* boot — ?v=68 deep-links a position, so a reading can be shared */
  const asked = parseFloat(new URLSearchParams(location.search).get('v'));
  const target = Number.isFinite(asked) ? Math.max(0, Math.min(100, asked)) : TODAY;

  render(0);
  range.value = 0;
  if (reduced) {
    range.value = target;
    render(target);
  } else {
    setTimeout(() => animateTo(target, 1700), 420);
  }
})();

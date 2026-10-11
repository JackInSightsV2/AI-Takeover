/* Company histories use the same catalogue as the matrix and model pages. */
(function () {
  'use strict';
  const company = document.getElementById('timelineCompany');
  const order = document.getElementById('timelineOrder');
  const list = document.getElementById('timelineList');
  const summary = document.getElementById('timelineSummary');
  const link = document.getElementById('timelineLink');
  const labs = [...new Set(MODELS.map(m => m.lab))].sort();
  labs.forEach(lab => company.add(new Option(lab, lab)));
  function element(tag, text, className) {
    const el = document.createElement(tag);
    if (text != null) el.textContent = text;
    if (className) el.className = className;
    return el;
  }
  function render() {
    const rows = MODELS.filter(m => m.lab === company.value);
    // Keep the recorded date precision; decimal years are only ordering aids.
    const groups = new Map();
    [...rows].sort((a, b) => a.y - b.y).forEach(m => {
      if (!groups.has(m.d)) groups.set(m.d, []);
      groups.get(m.d).push(m);
    });
    const entries = [...groups.entries()];
    if (order.value === 'newest') entries.reverse();
    const fragment = document.createDocumentFragment();
    entries.forEach(([date, models]) => {
      const item = element('li', null, 'timeline-month');
      item.append(element('h3', date));
      const releases = element('ul', null, 'timeline-releases');
      models.sort((a, b) => a.m.localeCompare(b.m)).forEach(m => {
        const release = element('li');
        const title = element('a', m.m, 'timeline-model');
        title.href = 'models/' + m.slug + '.html';
        release.append(title);
        release.append(element('span', m.open === true ? 'Open weights' : m.open === false ? 'Closed weights' : 'Weights unverified', 'timeline-weight'));
        release.append(element('p', m.note));
        (m.sources || []).forEach((source, i) => {
          if (i) release.append(document.createTextNode(' · '));
          const citation = element('a', source.label);
          citation.href = source.url;
          release.append(citation);
        });
        releases.append(release);
      });
      item.append(releases);
      fragment.append(item);
    });
    list.replaceChildren(fragment);
    summary.textContent = company.value + ' · ' + rows.length + ' recorded releases · ' + rows[0].d + ' – ' + rows[rows.length - 1].d;
    const url = new URL(location.href);
    url.searchParams.set('company', company.value);
    url.searchParams.set('order', order.value);
    url.hash = 'company-timeline';
    link.href = url.href;
  }
  function restore() {
    const params = new URLSearchParams(location.search);
    company.value = labs.includes(params.get('company')) ? params.get('company') : 'OpenAI';
    if (!company.value) company.value = labs[0];
    order.value = params.get('order') === 'oldest' ? 'oldest' : 'newest';
    render();
  }
  function change() {
    render();
    history.replaceState(null, '', link.href);
  }
  company.addEventListener('change', change);
  order.addEventListener('change', change);
  window.addEventListener('popstate', restore);
  link.addEventListener('click', render);
  restore();
})();

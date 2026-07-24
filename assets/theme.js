/* Shared theme toggle for the generated model pages.
   The initial value is applied by an inline script in <head> so there
   is no flash; this only wires the button. */
(function () {
  'use strict';
  const root = document.documentElement;
  const btn = document.getElementById('themer');
  if (!btn) return;

  function label() {
    btn.setAttribute('aria-label',
      root.getAttribute('data-theme') === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }
  label();

  btn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    label();
    try { localStorage.setItem('di-theme', next); } catch (e) { /* private mode */ }
  });
})();

// ── Pace early-access announcement ──────────────────────────────────────────
// Load at the end of <body>, with pace.css in <head>. Pages carry the markup
// (#pace-strip on index.html, .pace-callout on shift-value.html).
// The strip stays closed per browser once dismissed. Hospital workstations are
// shared, so one person's dismissal hides it for the next user too — fine for
// an announcement. GA gets each click and dismissal.
(function () {
  const KEY = 'pace-strip-dismissed';
  const track = (name, medium) => { if (typeof gtag === 'function') gtag('event', name, { pace_medium: medium }); };

  const strip = document.getElementById('pace-strip');
  if (strip) {
    let dismissed = false;
    try { dismissed = localStorage.getItem(KEY) === '1'; } catch (e) {}
    strip.hidden = dismissed;
    strip.querySelector('.ps-x').addEventListener('click', () => {
      strip.hidden = true;
      try { localStorage.setItem(KEY, '1'); } catch (e) {}
      track('pace_strip_dismiss', 'strip');
    });
    strip.querySelector('.ps-cta').addEventListener('click', () => track('pace_click', 'strip'));
  }

  document.querySelectorAll('.pace-callout .pc-cta').forEach(a =>
    a.addEventListener('click', () => track('pace_click', 'shiftvalue')));
})();

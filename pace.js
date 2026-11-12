// ── Pace early-access announcement ──────────────────────────────────────────
// Load at the end of <body>, with pace.css in <head>. Pages carry the markup
// (#pace-strip on index.html, .pace-callout on shift-value.html).
// The strip stays closed per browser once dismissed. Hospital workstations are
// shared, so one person's dismissal hides it for the next user too — fine for
// an announcement. GA gets one view per page load (counted when at least half
// of it is on screen, as for the ResolvMD card), plus each click and dismissal,
// so click rate = pace_click / pace_view per pace_medium.
(function () {
  const KEY = 'pace-strip-dismissed';
  const track = (name, medium) => { if (typeof gtag === 'function') gtag('event', name, { pace_medium: medium }); };
  const trackView = (el, medium) => {
    if (!('IntersectionObserver' in window)) return;
    const seen = new IntersectionObserver(entries => {
      if (!entries.some(e => e.isIntersecting)) return;
      track('pace_view', medium);
      seen.disconnect();
    }, { threshold: 0.5 });
    seen.observe(el);
  };

  const strip = document.getElementById('pace-strip');
  if (strip) {
    let dismissed = false;
    try { dismissed = localStorage.getItem(KEY) === '1'; } catch (e) {}
    strip.hidden = dismissed;
    if (!dismissed) trackView(strip, 'strip');
    strip.querySelector('.ps-x').addEventListener('click', () => {
      strip.hidden = true;
      try { localStorage.setItem(KEY, '1'); } catch (e) {}
      track('pace_strip_dismiss', 'strip');
    });
    strip.querySelector('.ps-cta').addEventListener('click', () => track('pace_click', 'strip'));
  }

  document.querySelectorAll('.pace-callout').forEach(box => {
    trackView(box, 'shiftvalue');
    box.querySelector('.pc-cta').addEventListener('click', () => track('pace_click', 'shiftvalue'));
  });
})();

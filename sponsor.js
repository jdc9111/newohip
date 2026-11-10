// ── Sponsor card (ResolvMD) ─────────────────────────────────────────────────
// Load at the end of <body>, with sponsor.css in <head>. index.html and
// ai-search.html carry the #sponsor-card markup themselves and decide when to
// hide it; every other page gets the card built here, at the top of <main>.
// GA gets one view per page load, counted when at least half the card is on
// screen, plus each click; GA4's page_location tells the pages apart.
(function () {
  let card = document.getElementById('sponsor-card');
  if (!card) {
    const main = document.querySelector('main');
    if (!main) return;
    card = document.createElement('a');
    card.id = 'sponsor-card';
    card.className = 'sp-card';
    card.href = 'https://www.resolvmd.com/shiftcodes?utm_source=shiftcodes&utm_medium=banner&utm_campaign=shiftcodes_benefits';
    card.target = '_blank';
    card.rel = 'sponsored noopener';
    card.innerHTML =
      '<div class="sp-body">' +
        '<div class="sp-top"><img class="sp-logo" src="resolvmd-logo.png" alt="ResolvMD" width="113" height="22"><span class="sp-label">Sponsored</span></div>' +
        '<div class="sp-head">Full-service billing for Ontario physicians and groups. Built by physicians.</div>' +
        '<div class="sp-tags"><span class="sp-tag">Shadow billing included</span><span class="sp-tag">Snap your day sheet</span><span class="sp-tag">Rejections handled</span></div>' +
      '</div>' +
      '<span class="sp-cta">See how it works &rarr;</span>';
    main.prepend(card);
  }
  if ('IntersectionObserver' in window) {
    const seen = new IntersectionObserver(entries => {
      if (!entries.some(e => e.isIntersecting)) return;
      gtag('event', 'resolvmd_banner_view');
      seen.disconnect();
    }, { threshold: 0.5 });
    seen.observe(card);
  }
  card.addEventListener('click', () => gtag('event', 'resolvmd_banner_click'));
})();

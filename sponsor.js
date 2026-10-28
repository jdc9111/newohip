// ── Sponsor card (ResolvMD) tracking ────────────────────────────────────────
// Shared by index.html and ai-search.html; load it after the #sponsor-card
// markup. Each page decides when to hide the card. GA gets one view per page
// load, counted when at least half the card is on screen, plus each click;
// GA4's page_location tells the two pages apart.
(function () {
  const card = document.getElementById('sponsor-card');
  if (!card) return;
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

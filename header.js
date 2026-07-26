/**
 * header.js — Shared header + nav Web Component
 *
 * Usage:  <app-header active="billing"></app-header>
 *
 * active values: billing | diag | diagref | sedation | fractures | calc
 */

const HEADER_CSS = `
  /* ── Header ── */
  header {
    background:
      radial-gradient(circle at 82% 18%, rgba(56,189,248,0.28), transparent 28%),
      radial-gradient(circle at 14% 120%, rgba(167,139,250,0.30), transparent 34%),
      linear-gradient(120deg, #163d5e 0%, #1F4E79 54%, #27678f 100%);
    color: white;
    padding: 14px 24px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px 16px;
    min-height: 88px;
    border-bottom: 1px solid rgba(255,255,255,0.16);
  }
  .header-brand {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 0;
  }
  .header-subtitle {
    font-size: 1.55rem;
    color: rgba(255,255,255,0.92);
    font-weight: 600;
    letter-spacing: -0.025em;
    line-height: 1.1;
    text-shadow: 0 2px 12px rgba(0,0,0,0.16);
  }
  .brand-codes {
    color: #a9e5fb;
    font-weight: 800;
    letter-spacing: -0.04em;
  }
  .brand-tagline {
    font-size: 0.7rem;
    font-weight: 650;
    color: rgba(255,255,255,0.72);
    letter-spacing: 0.09em;
    text-transform: uppercase;
  }
  header a.nav-link {
    font-size: 0.82rem;
    color: white;
    opacity: 0.85;
    text-decoration: none;
    border: 1px solid rgba(255,255,255,0.52);
    border-radius: 999px;
    padding: 5px 13px;
    background: rgba(255,255,255,0.09);
    white-space: nowrap;
    flex-shrink: 0;
  }
  header a.nav-link:hover { opacity: 1; background: rgba(255,255,255,0.18); }

  /* ── Nav bar ── */
  .toggle-bar {
    background: linear-gradient(90deg, #123650, #163d5e 48%, #1b4767);
    display: flex;
    justify-content: center;
    gap: 6px;
    padding: 10px 24px;
    flex-wrap: wrap;
  }
  .toggle-btn {
    padding: 8px 18px;
    font-size: 0.9rem;
    font-weight: 600;
    text-decoration: none;
    color: rgba(255,255,255,0.75);
    background: rgba(255,255,255,0.08);
    border: 1.5px solid rgba(255,255,255,0.25);
    border-radius: 7px;
    transition: all 0.15s;
    white-space: nowrap;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 46px;
  }
  .toggle-btn.active       { background: white; color: #1F4E79; border-color: white; box-shadow: 0 2px 6px rgba(0,0,0,0.25); }
  .toggle-btn:not(.active):hover { background: rgba(255,255,255,0.18); color: white; }

  /* ── Group containers ── */
  .nav-group-wrap { display: flex; flex-direction: column; gap: 3px; }
  .nav-group-label {
    font-size: 0.75rem; font-weight: 700; letter-spacing: 0.07em;
    text-transform: uppercase; color: rgba(255,255,255,0.8);
    padding-left: 2px;
  }
  .nav-group {
    display: flex; gap: 4px; align-items: stretch;
    padding: 6px 10px; border-radius: 12px;
  }
  .nav-group.grp-billing       { background: rgba(167,139,250,0.16); }
  .nav-group.grp-billingsearch { background: rgba(56,189,248,0.14); }
  .nav-group.grp-diag    { background: rgba(251,113,133,0.14); }
  .nav-group.grp-other   { background: rgba(45,212,191,0.16); }
  .nav-group.grp-billing       { border: 1px solid rgba(167,139,250,0.22); }
  .nav-group.grp-billingsearch { border: 1px solid rgba(56,189,248,0.20); }
  .nav-group.grp-diag          { border: 1px solid rgba(251,113,133,0.20); }
  .nav-group.grp-other         { border: 1px solid rgba(45,212,191,0.22); }
  .nav-group-wrap:has(.grp-billing) .nav-group-label { color: #d8ccff; }
  .nav-group-wrap:has(.grp-billingsearch) .nav-group-label { color: #a9e5fb; }
  .nav-group-wrap:has(.grp-diag) .nav-group-label { color: #fecdd3; }
  .nav-group-wrap:has(.grp-other) .nav-group-label { color: #5eead4; }

  .beta-badge {
    font-size: 0.65rem;
    font-weight: 700;
    background: #f59e0b;
    color: white;
    border-radius: 3px;
    padding: 1px 4px;
    margin-left: 4px;
    vertical-align: middle;
    letter-spacing: 0.02em;
  }
  .toggle-btn.active .beta-badge { background: #d97706; }

  /* ── Mobile collapsed header (single row: brand · current tool · menu) ── */
  .mobile-top-bar { display: none; }
  .mobile-top-brand {
    font-weight: 800; font-size: 1.02rem; letter-spacing: -0.02em;
    white-space: nowrap; flex-shrink: 0;
  }
  .mobile-top-sep { opacity: 0.4; flex-shrink: 0; }
  .mobile-top-current {
    font-size: 0.86rem; font-weight: 600; color: rgba(255,255,255,0.8);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    min-width: 0; flex: 1;
  }
  .mobile-menu-btn {
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    width: 44px; height: 44px;
    background: rgba(255,255,255,0.09); border: 1px solid rgba(255,255,255,0.28);
    border-radius: 10px; color: white; cursor: pointer;
    font-family: inherit;
  }

  .mobile-sheet-backdrop {
    display: none;
    position: fixed; inset: 0; background: rgba(10,16,26,0.45);
    opacity: 0; pointer-events: none; transition: opacity 0.2s;
    z-index: 998;
  }
  .mobile-sheet-backdrop.open { opacity: 1; pointer-events: auto; }

  .mobile-nav-sheet {
    display: none;
    position: fixed; left: 0; right: 0; bottom: 0;
    background: #142c42;
    border-radius: 18px 18px 0 0;
    padding: 14px 16px calc(22px + env(safe-area-inset-bottom, 0px));
    transform: translateY(100%);
    transition: transform 0.28s cubic-bezier(.32,.72,.35,1);
    z-index: 999;
    max-height: 78vh;
    overflow-y: auto;
    box-shadow: 0 -12px 30px rgba(0,0,0,0.35);
  }
  .mobile-nav-sheet.open { transform: translateY(0); }
  .mobile-sheet-handle { width: 36px; height: 4px; background: rgba(255,255,255,0.25); border-radius: 4px; margin: 0 auto 14px; }
  .mobile-sheet-close {
    position: absolute; top: 4px; right: 4px;
    width: 44px; height: 44px; border-radius: 50%;
    background: rgba(255,255,255,0.1); color: white; border: none;
    font-size: 0.9rem; cursor: pointer; line-height: 1;
    display: flex; align-items: center; justify-content: center;
  }
  .mobile-nav-sheet .nav-group-wrap { margin-bottom: 12px; }
  .mobile-nav-sheet .nav-group-wrap:last-child { margin-bottom: 0; }
  .mobile-nav-sheet .nav-group { flex-wrap: wrap; }
  .mobile-nav-sheet .toggle-btn { white-space: normal; height: auto; padding: 11px 16px; }
  .mobile-sheet-divider { height: 1px; background: rgba(255,255,255,0.12); margin: 14px 0; }
  .mobile-sheet-link {
    display: block; text-align: center; text-decoration: none;
    color: rgba(255,255,255,0.85); font-size: 0.82rem; font-weight: 600;
    padding: 10px; border-radius: 10px;
    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.18);
  }

  /* ── Mobile ── */
  @media (max-width: 640px) {
    header { display: none; }
    .nav-scroll-container { display: none; }

    .mobile-top-bar {
      display: flex; align-items: center; gap: 7px;
      min-height: 58px;
      padding: 0 16px;
      background: linear-gradient(120deg, #163d5e 0%, #1F4E79 54%, #27678f 100%);
      color: white;
      border-bottom: 1px solid rgba(255,255,255,0.16);
    }
    .mobile-sheet-backdrop { display: block; }
    .mobile-nav-sheet { display: block; }
  }
`;

const GROUP_LABELS = {
  billing: 'Billing',
  billingsearch: 'Billing Search',
  diag: 'Diagnostic Codes',
  other: 'Tools',
};

const NAV_TABS = [
  { key: 'assessment', href: 'assessment.html', label: 'Assessment<span style="display:block;font-size:0.72em;opacity:0.75;font-weight:500;line-height:1.1">Counselling &amp; Forms</span>', group: 'billing', plain: 'Assessment · Counselling & Forms' },
  { key: 'specialty',  href: 'specialty.html',  label: 'By Specialty',       group: 'billing', plain: 'By Specialty' },
  { key: 'fractures',  href: 'fractures.html',  label: 'Fractures<span style="display:block;font-size:0.72em;opacity:0.75;font-weight:500;line-height:1.1">& Dislocations</span>', group: 'billing', plain: 'Fractures & Dislocations' },
  { key: 'billing',    href: 'index.html',      label: '<span style="display:block;font-size:0.72em;opacity:0.75;font-weight:500;line-height:1.1">Basic</span>Search', group: 'billingsearch', plain: 'Basic Search' },
  { key: 'ai-billing', href: 'ai-billing.html', label: '&#10024; AI Search',  group: 'billingsearch', plain: 'AI Search' },
  { key: 'diag',       href: 'diag.html',       label: '<span style="display:block;font-size:0.72em;opacity:0.75;font-weight:500;line-height:1.1">Basic</span>Search', group: 'diag', plain: 'Basic Search' },
  { key: 'ai-diag',    href: 'ai-diag.html',    label: '&#10024; AI Search',  group: 'diag', plain: 'AI Search' },
  { key: 'diagref',    href: 'diagref.html',    label: 'By Specialty',       group: 'diag', plain: 'By Specialty' },
  { key: 'sedation',   href: 'sedation.html',   label: 'Sedation<span style="display:block;font-size:0.72em;opacity:0.75;font-weight:500;line-height:1.1">Billing</span>', group: 'other', plain: 'Sedation Billing' },
  { key: 'calc',       href: 'calc.html',       label: '<span style="display:block;font-size:0.72em;opacity:0.75;font-weight:500;line-height:1.1">Outside</span>OHIP Billing', group: 'other', plain: 'Outside OHIP Billing' },
];

class AppHeader extends HTMLElement {
  connectedCallback() {
    // Inject shared CSS once
    if (!document.getElementById('app-header-styles')) {
      const style = document.createElement('style');
      style.id = 'app-header-styles';
      style.textContent = HEADER_CSS;
      document.head.appendChild(style);
    }

    const active = this.getAttribute('active') || '';

    // Build segments: consecutive tabs with the same group get wrapped together
    const segments = [];
    for (const tab of NAV_TABS) {
      const last = segments[segments.length - 1];
      if (last && last.group && last.group === tab.group) {
        last.tabs.push(tab);
      } else {
        segments.push({ group: tab.group || null, tabs: [tab] });
      }
    }

    const tabs = segments.map(seg => {
      const btns = seg.tabs.map(tab => {
        const isActive = tab.key === active;
        return `<a href="${tab.href}" class="toggle-btn${isActive ? ' active' : ''}">${tab.label}</a>`;
      }).join('');
      if (!seg.group) return btns;
      const groupLabel = GROUP_LABELS[seg.group] || '';
      return `<div class="nav-group-wrap">
        <span class="nav-group-label">${groupLabel}</span>
        <div class="nav-group grp-${seg.group}">${btns}</div>
      </div>`;
    }).join('\n      ');

    const activeTab = NAV_TABS.find(t => t.key === active);
    const currentLabel = activeTab ? activeTab.plain : '';

    this.innerHTML = `
      <header>
        <div class="header-brand">
          <img src="shiftcodes-icon-transparent.png" alt="ShiftCodes" style="height:48px; width:auto; display:block;">
          <div style="display:flex;flex-direction:column;gap:4px;">
            <span class="header-subtitle">Shift<span class="brand-codes">Codes</span></span>
            <span class="header-subtitle-sub brand-tagline">Emergency · OHIP Billing</span>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end;">
          <a href="updates.html" class="nav-link">April 1st Updates</a>
          <a href="https://www.ontario.ca/files/2026-03/moh-schedule-benefit-2026-03-27.pdf" target="_blank" rel="noopener" class="nav-link nav-link-sob">Schedule of Benefits ↗</a>
        </div>
      </header>
      <div class="nav-scroll-container">
        <div class="toggle-bar">
          ${tabs}
        </div>
      </div>
      <div class="mobile-top-bar">
        <span class="mobile-top-brand">Shift<span class="brand-codes">Codes</span></span>
        ${currentLabel ? `<span class="mobile-top-sep">·</span><span class="mobile-top-current">${currentLabel}</span>` : '<span class="mobile-top-current"></span>'}
        <button class="mobile-menu-btn" id="mobileMenuBtn" aria-expanded="false" aria-controls="mobileNavSheet" aria-label="Open menu">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
      </div>
      <div class="mobile-sheet-backdrop" id="mobileSheetBackdrop"></div>
      <div class="mobile-nav-sheet" id="mobileNavSheet">
        <button class="mobile-sheet-close" id="mobileSheetClose" aria-label="Close menu">✕</button>
        <div class="mobile-sheet-handle"></div>
        ${tabs}
        <div class="mobile-sheet-divider"></div>
        <a href="updates.html" class="mobile-sheet-link">April 1st Updates</a>
      </div>`;

    const menuBtn = this.querySelector('#mobileMenuBtn');
    const sheet = this.querySelector('#mobileNavSheet');
    const backdrop = this.querySelector('#mobileSheetBackdrop');
    const sheetClose = this.querySelector('#mobileSheetClose');

    const openSheet = () => {
      sheet.classList.add('open');
      backdrop.classList.add('open');
      menuBtn.setAttribute('aria-expanded', 'true');
    };
    const closeSheet = () => {
      sheet.classList.remove('open');
      backdrop.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    };

    menuBtn.addEventListener('click', () => {
      sheet.classList.contains('open') ? closeSheet() : openSheet();
    });
    backdrop.addEventListener('click', closeSheet);
    sheetClose.addEventListener('click', closeSheet);
    sheet.addEventListener('click', e => {
      if (e.target.closest('a.toggle-btn, a.mobile-sheet-link')) closeSheet();
    });
  }
}

customElements.define('app-header', AppHeader);

// Scroll hint + scroll active tab into view on mobile
document.addEventListener('DOMContentLoaded', () => {
  const bar = document.querySelector('.toggle-bar');
  const container = document.querySelector('.nav-scroll-container');
  if (!bar || !container) return;

  const update = () => {
    const atEnd = bar.scrollLeft + bar.clientWidth >= bar.scrollWidth - 4;
    container.classList.toggle('at-end', atEnd);
  };
  bar.addEventListener('scroll', update, { passive: true });

  // Scroll active button into view (centered) so it's always visible on load
  const activeBtn = bar.querySelector('.toggle-btn.active');
  if (activeBtn) {
    const btnCenter = activeBtn.offsetLeft + activeBtn.offsetWidth / 2;
    bar.scrollLeft = btnCenter - bar.clientWidth / 2;
  }

  update();
});

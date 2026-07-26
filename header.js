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
    background: #1F4E79;
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
    background: #163d5e;
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

  /* ── Mobile always-visible nav (brand row + category row + page pills) ── */
  .mobile-top-bar { display: none; }
  .mobile-top-brand {
    font-weight: 800; font-size: 1.02rem; letter-spacing: -0.02em;
    white-space: nowrap;
  }

  .mobile-nav-block { display: none; }
  .mobile-cat-row { display: flex; gap: 8px; }
  .mobile-cat-btn {
    flex: 1; padding: 14px 8px; border-radius: 12px; text-align: center;
    font-size: 0.92rem; font-weight: 800; letter-spacing: -0.01em; color: rgba(255,255,255,0.75);
    border: 1.5px solid; cursor: pointer; transition: all 0.15s;
    font-family: inherit;
  }
  .mobile-cat-btn.billing { background: rgba(167,139,250,0.14); border-color: rgba(167,139,250,0.3); }
  .mobile-cat-btn.diag    { background: rgba(251,113,133,0.14); border-color: rgba(251,113,133,0.3); }
  .mobile-cat-btn.tools   { background: rgba(45,212,191,0.14); border-color: rgba(45,212,191,0.3); }
  .mobile-cat-btn.selected.billing { background: rgba(167,139,250,0.85); border-color: #a78bfa; color: white; }
  .mobile-cat-btn.selected.diag    { background: rgba(251,113,133,0.85); border-color: #fb7185; color: white; }
  .mobile-cat-btn.selected.tools  { background: rgba(45,212,191,0.85);  border-color: #2dd4bf; color: #08312c; }

  .mobile-sub-row { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; margin-top: 14px; }
  .mobile-sub-btn {
    padding: 9px 10px; border-radius: 10px; font-size: 0.78rem; font-weight: 600;
    color: rgba(255,255,255,0.85); border: 1.5px solid; cursor: pointer;
    text-align: center; line-height: 1.25; text-decoration: none;
    display: flex; align-items: center; justify-content: center;
  }
  .mobile-sub-btn.span-full { grid-column: 1 / -1; }
  .mobile-sub-row.billing .mobile-sub-btn { background: rgba(167,139,250,0.14); border-color: rgba(167,139,250,0.3); }
  .mobile-sub-row.diag .mobile-sub-btn    { background: rgba(251,113,133,0.14); border-color: rgba(251,113,133,0.3); }
  .mobile-sub-row.tools .mobile-sub-btn   { background: rgba(45,212,191,0.14); border-color: rgba(45,212,191,0.3); }
  .mobile-sub-btn.active-page { background: white !important; color: #1F4E79 !important; border-color: white !important; }

  /* ── Mobile ── */
  @media (max-width: 640px) {
    header { display: none; }
    .nav-scroll-container { display: none; }

    .mobile-top-bar {
      display: flex; align-items: center;
      min-height: 54px;
      padding: 0 12px;
      background: #1F4E79;
      color: white;
      border-bottom: 1px solid rgba(255,255,255,0.16);
    }
    .mobile-nav-block {
      display: block;
      background: #163d5e;
      padding: 10px 12px 12px;
    }
  }
`;

const GROUP_LABELS = {
  billing: 'Billing',
  billingsearch: 'Billing Search',
  diag: 'Diagnostic Codes',
  other: 'Tools',
};

const NAV_TABS = [
  { key: 'assessment', href: 'assessment.html', label: 'Assessment<span style="display:block;font-size:0.72em;opacity:0.75;font-weight:500;line-height:1.1">Counselling &amp; Forms</span>', group: 'billing' },
  { key: 'specialty',  href: 'specialty.html',  label: 'By Specialty',       group: 'billing' },
  { key: 'fractures',  href: 'fractures.html',  label: 'Fractures<span style="display:block;font-size:0.72em;opacity:0.75;font-weight:500;line-height:1.1">& Dislocations</span>', group: 'billing' },
  { key: 'billing',    href: 'index.html',      label: '<span style="display:block;font-size:0.72em;opacity:0.75;font-weight:500;line-height:1.1">Basic</span>Search', group: 'billingsearch' },
  { key: 'ai-billing', href: 'ai-billing.html', label: '&#10024; AI Search',  group: 'billingsearch' },
  { key: 'diag',       href: 'diag.html',       label: '<span style="display:block;font-size:0.72em;opacity:0.75;font-weight:500;line-height:1.1">Basic</span>Search', group: 'diag' },
  { key: 'ai-diag',    href: 'ai-diag.html',    label: '&#10024; AI Search',  group: 'diag' },
  { key: 'diagref',    href: 'diagref.html',    label: 'By Specialty',       group: 'diag' },
  { key: 'sedation',   href: 'sedation.html',   label: 'Sedation<span style="display:block;font-size:0.72em;opacity:0.75;font-weight:500;line-height:1.1">Billing</span>', group: 'other' },
  { key: 'calc',       href: 'calc.html',       label: '<span style="display:block;font-size:0.72em;opacity:0.75;font-weight:500;line-height:1.1">Outside</span>OHIP Billing', group: 'other' },
];

/* ── Mobile: 3 top-level categories, each drilling into a page list ── */
const MOBILE_NAV = {
  billing: {
    title: 'Billing Codes',
    pages: [
      { key: 'billing',    href: 'index.html',      label: 'Search' },
      { key: 'ai-billing', href: 'ai-billing.html', label: '&#10024; AI Search' },
      { key: 'assessment', href: 'assessment.html', label: 'Assessment Codes' },
      { key: 'specialty',  href: 'specialty.html',  label: 'By Specialty' },
      { key: 'fractures',  href: 'fractures.html',  label: 'Fractures &amp; Dislocations' },
    ],
  },
  diag: {
    title: 'Diagnostic Codes',
    pages: [
      { key: 'diag',    href: 'diag.html',    label: 'Search' },
      { key: 'ai-diag', href: 'ai-diag.html', label: '&#10024; AI Search' },
      { key: 'diagref', href: 'diagref.html', label: 'By Specialty' },
    ],
  },
  tools: {
    title: 'Tools',
    pages: [
      { key: 'sedation', href: 'sedation.html', label: 'Sedation Billing' },
      { key: 'calc',     href: 'calc.html',     label: 'Outside OHIP Billing' },
      { key: 'updates',  href: 'updates.html',  label: 'April 1st Updates' },
    ],
  },
};

function categoryForKey(key) {
  for (const cat of Object.keys(MOBILE_NAV)) {
    if (MOBILE_NAV[cat].pages.some(p => p.key === key)) return cat;
  }
  return 'billing';
}

function renderSubRow(catKey, currentCategory, currentActiveKey) {
  const pages = MOBILE_NAV[catKey].pages;
  const oddCount = pages.length % 2 === 1;
  return pages.map((p, i) => {
    const isCurrent = catKey === currentCategory && p.key === currentActiveKey;
    const isLast = i === pages.length - 1;
    const classes = ['mobile-sub-btn'];
    if (isCurrent) classes.push('active-page');
    if (oddCount && isLast) classes.push('span-full');
    return `<a href="${p.href}" class="${classes.join(' ')}">${p.label}</a>`;
  }).join('');
}

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

    const currentCategory = categoryForKey(active);
    const catOrder = ['billing', 'diag', 'tools'];
    const catRow = catOrder.map(cat => {
      const selected = cat === currentCategory;
      return `<button type="button" class="mobile-cat-btn ${cat}${selected ? ' selected' : ''}" data-cat="${cat}">${MOBILE_NAV[cat].title}</button>`;
    }).join('');

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
      </div>
      <div class="mobile-nav-block">
        <div class="mobile-cat-row">${catRow}</div>
        <div class="mobile-sub-row ${currentCategory}" id="mobileSubRow">${renderSubRow(currentCategory, currentCategory, active)}</div>
      </div>`;

    const catButtons = this.querySelectorAll('.mobile-cat-btn');
    const subRow = this.querySelector('#mobileSubRow');
    catButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.cat;
        catButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        subRow.className = 'mobile-sub-row ' + cat;
        subRow.innerHTML = renderSubRow(cat, currentCategory, active);
      });
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

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
    min-height: 84px;
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
    font-size: 1.25rem;
    color: rgba(255,255,255,0.92);
    font-weight: 700;
    letter-spacing: 0.01em;
    line-height: 1.4;
  }
  header a.nav-link {
    font-size: 0.82rem;
    color: white;
    opacity: 0.85;
    text-decoration: none;
    border: 1px solid rgba(255,255,255,0.45);
    border-radius: 5px;
    padding: 4px 12px;
    white-space: nowrap;
    flex-shrink: 0;
  }
  header a.nav-link:hover { opacity: 1; background: rgba(255,255,255,0.1); }

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
    font-size: 0.62rem; font-weight: 700; letter-spacing: 0.07em;
    text-transform: uppercase; color: rgba(255,255,255,0.45);
    padding-left: 2px;
  }
  .nav-group {
    display: flex; gap: 4px; align-items: stretch;
    padding: 6px 10px; border-radius: 12px;
  }
  .nav-group.grp-billing { background: rgba(56,189,248,0.14); }
  .nav-group.grp-diag    { background: rgba(251,113,133,0.14); }
  .nav-group.grp-other   { background: rgba(255,255,255,0.08); }

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

  /* ── Mobile ── */
  @media (max-width: 640px) {
    .header-brand img { display: none !important; }
    .header-brand .header-subtitle-sub { display: none !important; }
    .header-brand { flex-direction: column; align-items: flex-start; gap: 4px; }
    .header-subtitle { font-size: 0.88rem; font-weight: 600; }
    .toggle-bar { flex-direction: column; padding: 8px 12px; gap: 6px; flex-wrap: nowrap; }
    .nav-group { flex-direction: row; flex-wrap: wrap; width: 100%; padding: 4px; gap: 4px; }
    .toggle-btn {
      border-radius: 6px !important;
      border: 2px solid rgba(255,255,255,0.3) !important;
      text-align: center;
      flex: 1 1 auto;
      padding: 12px 8px;
      font-size: 0.88rem;
      min-width: 0;
    }
  }
`;

const GROUP_LABELS = {
  billing: 'Billing',
  diag: 'Diagnostic',
  other: 'Tools',
};

const NAV_TABS = [
  { key: 'billing',    href: 'index.html',      label: 'Codes',              group: 'billing' },
  { key: 'ai-billing', href: 'ai-billing.html', label: '&#10024; AI Codes',  group: 'billing' },
  { key: 'fractures',  href: 'fractures.html',  label: 'Fractures<span style="display:block;font-size:0.72em;opacity:0.75;font-weight:500;line-height:1.1">& Dislocations</span>', group: 'billing' },
  { key: 'specialty',  href: 'specialty.html',  label: 'Specialty',          group: 'billing' },
  { key: 'diag',       href: 'diag.html',       label: 'Codes',              group: 'diag' },
  { key: 'ai-diag',    href: 'ai-diag.html',    label: '&#10024; AI Codes',  group: 'diag' },
  { key: 'diagref',    href: 'diagref.html',    label: 'Common',             group: 'diag' },
  { key: 'sedation',   href: 'sedation.html',   label: 'Sedation',           group: 'other' },
  { key: 'calc',       href: 'calc.html',       label: '<span style="display:block;font-size:0.72em;opacity:0.75;font-weight:500;line-height:1.1">Outside</span>OHIP Billing', group: 'other' },
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

    this.innerHTML = `
      <header>
        <div class="header-brand">
          <img src="shiftcodes-icon-transparent.png" alt="ShiftCodes" style="height:48px; width:auto; display:block;">
          <div style="display:flex;flex-direction:column;gap:2px;">
            <span class="header-subtitle" style="font-size:1.35rem;letter-spacing:-0.01em;">ShiftCodes</span>
            <span class="header-subtitle-sub" style="font-size:0.72rem;font-weight:500;color:rgba(255,255,255,0.55);letter-spacing:0.06em;text-transform:uppercase;">Emergency · OHIP Billing</span>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end;">
          <a href="updates.html" class="nav-link">April 1st Updates</a>
          <a href="https://www.ontario.ca/files/2026-03/moh-schedule-benefit-2026-03-27.pdf" target="_blank" rel="noopener" class="nav-link">Schedule of Benefits ↗</a>
        </div>
      </header>
      <div class="toggle-bar">
        ${tabs}
      </div>`;
  }
}

customElements.define('app-header', AppHeader);

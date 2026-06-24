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
  }
  .toggle-btn.active       { background: white; color: #1F4E79; border-color: white; box-shadow: 0 2px 6px rgba(0,0,0,0.25); }
  .toggle-btn:not(.active):hover { background: rgba(255,255,255,0.18); color: white; }

  /* Billing group — sky blue */
  .toggle-btn.grp-billing { border-color: rgba(56,189,248,0.45); background: rgba(56,189,248,0.12); color: rgba(186,230,255,0.9); }
  .toggle-btn.grp-billing:not(.active):hover { background: rgba(56,189,248,0.22); color: white; }
  .toggle-btn.grp-billing.active { background: #e0f2fe; color: #0c4a6e; border-color: #38bdf8; }

  /* Diagnostic group — coral/rose */
  .toggle-btn.grp-diag { border-color: rgba(251,113,133,0.45); background: rgba(251,113,133,0.12); color: rgba(254,205,211,0.9); }
  .toggle-btn.grp-diag:not(.active):hover { background: rgba(251,113,133,0.22); color: white; }
  .toggle-btn.grp-diag.active { background: #ffe4e6; color: #9f1239; border-color: #fb7185; }

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
    .header-brand { flex-direction: column; align-items: flex-start; gap: 4px; }
    .header-subtitle { font-size: 0.88rem; font-weight: 600; }
    .toggle-bar { flex-direction: column; padding: 8px 12px; gap: 6px; flex-wrap: nowrap; }
    .toggle-btn {
      border-radius: 6px !important;
      border: 2px solid rgba(255,255,255,0.3) !important;
      text-align: center;
      width: 100%;
      padding: 13px 22px;
      font-size: 0.95rem;
    }
  }
`;

const NAV_TABS = [
  { key: 'billing',    href: 'index.html',      label: 'Billing Codes',              group: 'billing' },
  { key: 'ai-billing', href: 'ai-billing.html', label: '&#10024; AI Billing Codes',  group: 'billing' },
  { key: 'fractures',  href: 'fractures.html',  label: 'Fractures &amp; Dislocations', group: 'billing' },
  { key: 'diag',       href: 'diag.html',       label: 'Diagnostic Codes',           group: 'diag' },
  { key: 'ai-diag',    href: 'ai-diag.html',    label: '&#10024; AI Diagnostic Codes', group: 'diag' },
  { key: 'diagref',    href: 'diagref.html',     label: 'Common Diagnostic Codes',   group: 'diag' },
  { key: 'sedation',   href: 'sedation.html',   label: 'Sedation' },
  { key: 'calc',       href: 'calc.html',       label: 'Outside OHIP Calculator' },
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

    const tabs = NAV_TABS.map(tab => {
      const isActive = tab.key === active;
      const badge = tab.beta
        ? ` <span class="beta-badge">Beta</span>`
        : '';
      const grp = tab.group ? ` grp-${tab.group}` : '';
      return `<a href="${tab.href}" class="toggle-btn${isActive ? ' active' : ''}${grp}">${tab.label}${badge}</a>`;
    }).join('\n      ');

    this.innerHTML = `
      <header>
        <div class="header-brand">
          <img src="shiftcodes-icon-transparent.png" alt="ShiftCodes" style="height:66px; width:auto; display:block;">
          <div class="header-subtitle">Emergency Department<br>OHIP Code Search</div>
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

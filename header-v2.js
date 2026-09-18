/**
 * header-v2.js — ShiftCodes shared chrome, "Steel" redesign (5a)
 *
 * DROP-IN REPLACEMENT for header.js. Same usage, same `active` values:
 *   <app-header active="billing"></app-header>
 *
 * active: billing | diagref | assessment | specialty | fractures |
 *         ai-search | sedation | calc | updates
 * Legacy keys diag / ai-billing / ai-diag are aliased (see ALIASES).
 *
 * To try it:  in any page, change
 *     <script src="header.js"></script>
 *   to
 *     <script src="header-v2.js"></script>
 *   Change it back to revert. No other file needs to be touched — this
 *   component positions itself and sets the body offset itself.
 */

const RAIL_W = 232;
const RAIL_W_MINI = 56;
const MOBILE_BP = 900;
const STORE_KEY = 'sc_rail_collapsed';

const C = {
  rail:      '#2C6FA8',
  railDeep:  '#1B5183',
  accent:    '#FFC53D',
  accentInk: '#0F1A24',
  ink:       '#0F1A24',
  surface:   '#F2F6FA',
  line:      '#DDE7F0',
  muted:     '#55636F',
};

const CSS = `
  :root { --sc-rail-w: ${RAIL_W}px; }
  body.sc-shell { margin: 0; padding-left: var(--sc-rail-w); background: ${C.surface}; }
  body.sc-shell.sc-rail-collapsed { --sc-rail-w: ${RAIL_W_MINI}px; }

  .sc-rail, .sc-mtop, .sc-tabbar, .sc-drawer,
  .sc-rail button, .sc-tabbar a, .sc-drawer a {
    font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
  .sc-lbl {
    font-family: 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 9.5px; letter-spacing: 0.16em; text-transform: uppercase;
    color: #fff; padding: 0 11px 4px; display: block;
  }

  /* ───────── Desktop rail ───────── */
  .sc-rail {
    position: fixed; inset: 0 auto 0 0; width: var(--sc-rail-w); z-index: 900;
    background: ${C.rail}; color: #fff;
    display: flex; flex-direction: column; gap: 16px;
    padding: 14px 10px; box-sizing: border-box; overflow-y: auto; overflow-x: hidden;
  }
  .sc-rail::-webkit-scrollbar { width: 6px; }
  .sc-rail::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.22); border-radius: 3px; }

  .sc-brand { display: flex; align-items: center; gap: 9px; padding: 0 4px 2px; min-height: 30px; }
  .sc-brand img { height: 26px; width: auto; display: block; flex-shrink: 0; }
  .sc-brand-txt { font-size: 17px; font-weight: 700; letter-spacing: -0.03em; white-space: nowrap; }
  .sc-brand-txt b { color: ${C.accent}; font-weight: 700; }

  .sc-grp { display: flex; flex-direction: column; gap: 3px; }

  .sc-rail a.sc-item {
    display: flex; align-items: center; gap: 9px;
    font-size: 13.5px; font-weight: 500; line-height: 1.2;
    color: rgba(255,255,255,0.92); text-decoration: none;
    border-radius: 8px; padding: 9px 11px; min-height: 40px; box-sizing: border-box;
    white-space: nowrap; overflow: hidden;
  }
  .sc-rail a.sc-item:hover { background: rgba(255,255,255,0.14); color: #fff; }
  .sc-rail a.sc-item.sc-sub { padding-left: 35px; }
  .sc-rail a.sc-item.sc-on {
    background: #fff; color: ${C.railDeep}; font-weight: 700;
  }
  .sc-rail a.sc-item.sc-on:hover { background: #fff; }
  .sc-ico { width: 15px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }

  .sc-spring { flex: 1; min-height: 8px; }
  .sc-foot { display: flex; flex-direction: column; gap: 8px; padding: 0 4px 2px; }
  .sc-rail a.sc-cta {
    font-size: 12.5px; font-weight: 700; text-decoration: none; text-align: center;
    color: ${C.accentInk}; background: ${C.accent};
    border-radius: 8px; padding: 10px 11px; white-space: nowrap; overflow: hidden;
  }
  .sc-rail a.sc-cta:hover { filter: brightness(1.06); }
  /* The updates page is the CTA, not a nav item — ring it instead of
     restyling it, so the amber keeps its weight. */
  .sc-rail a.sc-cta.sc-cta-on { box-shadow: 0 0 0 2px #fff; }
  .sc-rail a.sc-sob {
    font-size: 12.5px; color: #fff; text-decoration: none;
    padding: 0 2px; white-space: nowrap; overflow: hidden;
  }
  .sc-rail a.sc-sob:hover { color: #fff; text-decoration: underline; }

  .sc-collapse {
    position: absolute; top: 14px; right: 8px;
    width: 26px; height: 26px; border: none; border-radius: 7px; cursor: pointer;
    background: rgba(255,255,255,0.16); color: #fff; font-size: 13px; line-height: 1;
    display: flex; align-items: center; justify-content: center; padding: 0;
  }
  .sc-collapse:hover { background: rgba(255,255,255,0.3); }

  /* collapsed: icon strip */
  body.sc-rail-collapsed .sc-rail { padding: 14px 6px; align-items: stretch; }
  body.sc-rail-collapsed .sc-lbl,
  body.sc-rail-collapsed .sc-brand-txt,
  body.sc-rail-collapsed .sc-txt,
  body.sc-rail-collapsed .sc-foot .sc-sob { display: none; }
  body.sc-rail-collapsed .sc-rail a.sc-item { justify-content: center; padding: 9px 0; gap: 0; }
  body.sc-rail-collapsed .sc-rail a.sc-item.sc-sub { padding-left: 0; }
  body.sc-rail-collapsed .sc-brand { justify-content: center; padding: 0 0 2px; }
  body.sc-rail-collapsed .sc-collapse { position: static; align-self: center; margin-bottom: 4px; }
  body.sc-rail-collapsed .sc-rail a.sc-cta { padding: 10px 0; font-size: 11px; }

  /* Sub-items read as indented text when expanded — the indent carries the
     grouping — so their icons stay hidden until the rail collapses. */
  .sc-rail a.sc-item.sc-sub .sc-ico { display: none; }
  body.sc-rail-collapsed .sc-rail a.sc-item .sc-ico { display: flex; width: 20px; }
  body.sc-rail-collapsed .sc-ico svg { width: 19px; height: 19px; }

  /* mini text glyph — CTA only */
  .sc-mini { display: none; font-size: 11px; font-weight: 700; letter-spacing: 0.02em; }
  body.sc-rail-collapsed .sc-cta .sc-mini { display: block; }

  /* ───────── Mobile chrome ───────── */
  .sc-mtop, .sc-tabbar, .sc-drawer { display: none; }

  @media (max-width: ${MOBILE_BP}px) {
    body.sc-shell { padding-left: 0; padding-top: 52px; padding-bottom: 78px; }
    .sc-rail { display: none; }

    .sc-mtop {
      position: fixed; top: 0; left: 0; right: 0; height: 52px; z-index: 900;
      background: ${C.rail}; color: #fff; box-sizing: border-box;
      display: flex; align-items: center; gap: 10px; padding: 0 14px;
    }
    .sc-mtop img { height: 22px; width: auto; display: block; }
    .sc-mtop .sc-brand-txt { font-size: 16px; }
    .sc-mtop .sc-spring { flex: 1; }
    .sc-mtop a.sc-cta {
      font-size: 11.5px; font-weight: 700; text-decoration: none;
      color: ${C.accentInk}; background: ${C.accent};
      border-radius: 999px; padding: 6px 11px; white-space: nowrap;
    }

    .sc-tabbar {
      position: fixed; left: 0; right: 0; bottom: 0; height: 78px; z-index: 900;
      background: #fff; border-top: 1px solid ${C.line};
      display: flex; align-items: flex-start; padding: 9px 6px 0; box-sizing: border-box;
    }
    .sc-tabbar a, .sc-tabbar button {
      flex: 1; min-height: 48px; border: none; background: none; cursor: pointer;
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px;
      color: ${C.muted}; text-decoration: none; font: inherit; padding: 0;
    }
    .sc-tabbar .sc-t-lbl { font-size: 11px; font-weight: 500; }
    .sc-tabbar .sc-on { color: ${C.rail}; }
    .sc-tabbar .sc-on .sc-t-lbl { font-weight: 700; }

    .sc-drawer {
      position: fixed; inset: 0; z-index: 950; background: ${C.rail}; color: #fff;
      flex-direction: column; padding: 0 16px 16px; box-sizing: border-box; overflow-y: auto;
    }
    .sc-drawer.sc-open { display: flex; }
    .sc-drawer-top {
      display: flex; align-items: center; gap: 12px; padding: 16px 0 18px;
      position: sticky; top: 0; background: ${C.rail};
    }
    .sc-drawer-top img { height: 24px; width: auto; display: block; }
    .sc-drawer-x {
      margin-left: auto; background: none; border: none; color: rgba(255,255,255,0.85);
      font-size: 22px; line-height: 1; cursor: pointer; min-width: 44px; min-height: 44px;
    }
    .sc-drawer a.sc-d-item {
      display: flex; align-items: center; justify-content: space-between;
      background: rgba(255,255,255,0.14); border-radius: 11px; padding: 15px;
      font-size: 15.5px; font-weight: 600; color: #fff; text-decoration: none;
      min-height: 52px; box-sizing: border-box; margin-bottom: 7px;
    }
    .sc-drawer a.sc-d-item.sc-on { background: #fff; color: ${C.railDeep}; font-weight: 700; }
    .sc-drawer a.sc-cta {
      display: flex; align-items: center; justify-content: center; min-height: 48px;
      background: ${C.accent}; color: ${C.accentInk}; border-radius: 11px;
      font-size: 14.5px; font-weight: 700; text-decoration: none; margin-top: 12px;
    }
    .sc-drawer a.sc-sob {
      font-size: 13.5px; color: #fff; text-align: center;
      text-decoration: none; padding: 12px 0 4px;
    }
  }

  @media print {
    .sc-rail, .sc-mtop, .sc-tabbar, .sc-drawer { display: none !important; }
    body.sc-shell { padding: 0 !important; }
  }
`;

/* Pages that predate the merged search still declare their own key.
   Map each onto the rail item that now covers it, so it highlights. */
const ALIASES = {
  'diag':       'billing',   // standalone diagnostic search -> unified search
  'ai-billing': 'ai-search', // split AI pages -> unified AI search
  'ai-diag':    'ai-search',
};

const SOB_URL = 'https://www.ontario.ca/files/2026-03/moh-schedule-benefit-2026-03-27.pdf';

const ICONS = {
  search:   '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>',
  spark:    '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v5M12 16v5M3 12h5M16 12h5M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3"></path></svg>',
  list:     '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h16M4 18h16"></path></svg>',
  star:     '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.5 5.5 6 .8-4.3 4.2 1 6-5.2-2.8L6.8 19.5l1-6L3.5 9.3l6-.8z"></path></svg>',
  doc:      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h7l4 4v14H7z"></path><path d="M14 3v4h4M9.5 12h5M9.5 16h3.5"></path></svg>',
  grid:     '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="7" height="7" rx="1.5"></rect><rect x="13" y="4" width="7" height="7" rx="1.5"></rect><rect x="4" y="13" width="7" height="7" rx="1.5"></rect><rect x="13" y="13" width="7" height="7" rx="1.5"></rect></svg>',
  crack:    '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M13.5 2.5L9 10h5l-4.5 7.5"></path><path d="M4 21h16"></path></svg>',
  tag:      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 12.5l9-9H20v7.5l-9 9z"></path><circle cx="16.2" cy="7.8" r="1.3"></circle></svg>',
  moon:     '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"></path></svg>',
  calc:     '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="2"></rect><path d="M8.5 7.5h7M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01"></path></svg>',
};

/* Rail structure — groups mirror the old GROUP_LABELS, flattened. */
const RAIL = [
  { label: null, items: [
    { key: 'billing',   href: '/',     label: 'Search',    icon: ICONS.search },
    { key: 'ai-search', href: 'ai-search.html', label: 'AI search', icon: ICONS.spark },
  ]},
  { label: 'Billing codes', items: [
    { key: 'assessment', href: 'assessment.html', label: 'Assessment',  icon: ICONS.doc },
    { key: 'specialty',  href: 'specialty.html',  label: 'By specialty', icon: ICONS.grid },
    { key: 'fractures',  href: 'fractures.html',  label: 'Fractures',    icon: ICONS.crack },
    { key: 'fav-billing', href: '/?fav=billing', label: 'Favourites', icon: ICONS.star },
  ]},
  { label: 'Diagnostic', items: [
    { key: 'diagref',  href: 'diagref.html',        label: 'By specialty', icon: ICONS.tag },
    { key: 'fav-diag', href: '/?fav=diag', label: 'Favourites',   icon: ICONS.star },
  ]},
  { label: 'Tools', items: [
    { key: 'sedation', href: 'sedation.html', label: 'Sedation billing', icon: ICONS.moon },
    { key: 'calc',     href: 'calc.html',     label: 'Outside OHIP',     icon: ICONS.calc },
  ]},
];

/* Mobile Browse drawer — same destinations, grouped for thumb reach. */
const DRAWER = [
  { label: 'Billing codes', items: [
    { key: 'assessment', href: 'assessment.html', label: 'Assessment, counselling &amp; forms' },
    { key: 'specialty',  href: 'specialty.html',  label: 'By specialty' },
    { key: 'fractures',  href: 'fractures.html',  label: 'Fractures &amp; dislocations' },
    { key: 'fav-billing', href: '/?fav=billing', label: 'Favourites' },
  ]},
  { label: 'Diagnostic codes', items: [
    { key: 'diagref',  href: 'diagref.html',        label: 'By specialty' },
    { key: 'fav-diag', href: '/?fav=diag', label: 'Favourites' },
  ]},
  { label: 'Tools', items: [
    { key: 'sedation', href: 'sedation.html', label: 'Sedation billing' },
    { key: 'calc',     href: 'calc.html',     label: 'Outside OHIP billing' },
  ]},
];

function ensureFonts() {
  if (document.getElementById('sc-fonts')) return;
  const l = document.createElement('link');
  l.id = 'sc-fonts';
  l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap';
  document.head.appendChild(l);
}

function ensureStyles() {
  if (document.getElementById('sc-header-v2-styles')) return;
  const s = document.createElement('style');
  s.id = 'sc-header-v2-styles';
  s.textContent = CSS;
  document.head.appendChild(s);
}

class AppHeader extends HTMLElement {
  connectedCallback() {
    ensureFonts();
    ensureStyles();

    const raw = this.getAttribute('active') || '';
    let active = ALIASES[raw] || raw;
    // /?fav=billing|diag is the Favourites view: highlight that
    // rail item instead of Search.
    const favView = new URLSearchParams(location.search).get('fav');
    if (active === 'billing' && (favView === 'billing' || favView === 'diag')) active = 'fav-' + favView;
    document.body.classList.add('sc-shell');
    if (localStorage.getItem(STORE_KEY) === '1') {
      document.body.classList.add('sc-rail-collapsed');
    }

    const groups = RAIL.map(g => {
      const items = g.items.map(it => {
        const on = it.key === active ? ' sc-on' : '';
        const sub = g.label ? ' sc-sub' : '';
        const ico = it.icon ? `<span class="sc-ico">${it.icon}</span>` : '';
        return `<a href="${it.href}" class="sc-item${sub}${on}" title="${g.label ? g.label + ' — ' + it.label : it.label}">` +
               `${ico}<span class="sc-txt">${it.label}</span></a>`;
      }).join('');
      const lbl = g.label ? `<span class="sc-lbl">${g.label}</span>` : '';
      return `<div class="sc-grp">${lbl}${items}</div>`;
    }).join('');

    const drawer = DRAWER.map(g => {
      const items = g.items.map(it => {
        const on = it.key === active ? ' sc-on' : '';
        return `<a href="${it.href}" class="sc-d-item${on}">${it.label}<span style="opacity:0.6">›</span></a>`;
      }).join('');
      return `<div style="margin-bottom:18px">` +
             `<span class="sc-lbl" style="padding-left:2px">${g.label}</span>${items}</div>`;
    }).join('');

    const tab = (href, icon, label, on) =>
      `<a href="${href}" class="${on ? 'sc-on' : ''}">` +
      `<span style="display:flex;align-items:center;justify-content:center;height:20px">${icon}</span>` +
      `<span class="sc-t-lbl">${label}</span></a>`;

    const browseKeys = ['assessment', 'specialty', 'fractures', 'fav-billing', 'diagref', 'fav-diag', 'sedation', 'calc'];

    this.innerHTML = `
      <nav class="sc-rail" aria-label="Main">
        <button type="button" class="sc-collapse" id="scCollapse" aria-label="Collapse navigation">‹</button>
        <a href="/" class="sc-brand" style="text-decoration:none;color:inherit">
          <img src="shiftcodes-icon-transparent.png" alt="ShiftCodes">
          <span class="sc-brand-txt">Shift<b>Codes</b></span>
        </a>
        ${groups}
        <div class="sc-spring"></div>
        <div class="sc-foot">
          <a href="updates.html" class="sc-cta${active === 'updates' ? ' sc-cta-on' : ''}"${active === 'updates' ? ' aria-current="page"' : ''}><span class="sc-txt">April 1st updates</span><span class="sc-mini">APR</span></a>
          <a href="${SOB_URL}" target="_blank" rel="noopener" class="sc-sob">Schedule of Benefits ↗</a>
        </div>
      </nav>

      <div class="sc-mtop">
        <img src="shiftcodes-icon-transparent.png" alt="">
        <span class="sc-brand-txt">Shift<b style="color:${C.accent}">Codes</b></span>
        <span class="sc-spring"></span>
        <a href="updates.html" class="sc-cta">Apr 1</a>
      </div>

      <nav class="sc-tabbar" aria-label="Main">
        ${tab('/', ICONS.search, 'Search', active === 'billing')}
        ${tab('ai-search.html', ICONS.spark, 'AI', active === 'ai-search')}
        <button type="button" id="scBrowse" class="${browseKeys.includes(active) ? 'sc-on' : ''}">
          <span style="display:flex;align-items:center;justify-content:center;height:20px">${ICONS.list}</span>
          <span class="sc-t-lbl">Browse</span>
        </button>
        ${tab('updates.html', ICONS.star, 'Updates', active === 'updates')}
      </nav>

      <div class="sc-drawer" id="scDrawer">
        <div class="sc-drawer-top">
          <img src="shiftcodes-icon-transparent.png" alt="">
          <span class="sc-brand-txt">Browse</span>
          <button type="button" class="sc-drawer-x" id="scDrawerX" aria-label="Close">✕</button>
        </div>
        ${drawer}
        <a href="updates.html" class="sc-cta">April 1st updates</a>
        <a href="${SOB_URL}" target="_blank" rel="noopener" class="sc-sob">Schedule of Benefits ↗</a>
      </div>`;

    const collapse = this.querySelector('#scCollapse');
    collapse.addEventListener('click', () => {
      const now = document.body.classList.toggle('sc-rail-collapsed');
      localStorage.setItem(STORE_KEY, now ? '1' : '0');
      collapse.textContent = now ? '›' : '‹';
      collapse.setAttribute('aria-label', now ? 'Expand navigation' : 'Collapse navigation');
    });
    if (document.body.classList.contains('sc-rail-collapsed')) collapse.textContent = '›';

    const drawerEl = this.querySelector('#scDrawer');
    const open = () => drawerEl.classList.add('sc-open');
    const close = () => drawerEl.classList.remove('sc-open');
    this.querySelector('#scBrowse').addEventListener('click', open);
    this.querySelector('#scDrawerX').addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }
}

customElements.define('app-header', AppHeader);

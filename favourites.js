/**
 * favourites.js — ShiftCodes accounts + favourite codes
 *
 * Usage (index.html):
 *   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
 *   <script src="favourites.js"></script>
 *
 * Exposes window.Fav:
 *   Fav.has(kind, code)          → boolean
 *   Fav.list(kind)               → [code, …] most recent first
 *   Fav.toggle(kind, code, label) → opens sign-in if signed out, else flips
 *   Fav.btn(kind, code, label)    → HTML string for a star button
 *   Fav.labelOf(kind, code)       → description saved with the favourite
 *   Fav.decorate(root)            → prepend a star to every .row-code (browse pages)
 *   Fav.onChange(fn)             → fn() after any auth / favourites change
 *   Fav.user                     → { email } | null
 *   Fav.openSignIn()             → shows the sign-in modal
 *
 * Search stays 100% client-side. The only network calls are one SELECT on
 * page load (in the background — the search box never waits for it) and
 * one INSERT/DELETE per star click, applied optimistically.
 *
 * Auth is a one-time email code (not a magic link) because most MDs use this
 * on hospital workstations: they read the code off their phone and type it
 * at the desk. Sessions end when the tab closes unless "Keep me signed in
 * on this device" is ticked, so a shared terminal doesn't leak the next
 * user's account.
 */
(function () {
  'use strict';

  const SUPABASE_URL = 'https://rliihnjwxwaqmpshfkzw.supabase.co';
  // Publishable key: safe to ship in the browser. RLS on the table is what
  // keeps one user's favourites from another's.
  const SUPABASE_KEY = 'sb_publishable_qymVw1zC62nsOWausZLC8A_tLbFY8NA';

  const CACHE_KEY    = 'sc_favs';          // sessionStorage mirror for instant paint
  const REMEMBER_KEY = 'sc_auth_remember'; // localStorage flag: persist session
  // Supabase's Email OTP Length setting (Auth → Sign In / Providers → Email).
  // The input accepts 6–10 either way; this only drives auto-submit.
  const OTP_LENGTH   = 6;

  // ── Session storage adapter ─────────────────────────────────────────────
  // supabase-js needs one storage at client creation, but "keep me signed
  // in" is decided at sign-in time. Read from both; write to whichever the
  // flag says. Sign-out clears both.
  const storage = {
    getItem(k)    { try { return localStorage.getItem(k) ?? sessionStorage.getItem(k); } catch { return null; } },
    setItem(k, v) {
      try {
        const persist = localStorage.getItem(REMEMBER_KEY) === '1';
        (persist ? localStorage : sessionStorage).setItem(k, v);
        (persist ? sessionStorage : localStorage).removeItem(k);
      } catch {}
    },
    removeItem(k) { try { localStorage.removeItem(k); sessionStorage.removeItem(k); } catch {} },
  };

  if (!window.supabase) { console.warn('favourites.js: supabase-js not loaded'); return; }
  const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { storage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });

  // ── State ───────────────────────────────────────────────────────────────
  let user = null;
  let favs = [];            // [{kind, code, ts}] most recent first
  let pending = null;       // star clicked while signed out → apply after sign-in
  const listeners = [];

  function emit() { listeners.forEach(fn => { try { fn(); } catch (e) { console.error(e); } }); }
  function key(kind, code) { return kind + ':' + code; }
  function has(kind, code)  { return favs.some(f => f.kind === kind && f.code === code); }
  function list(kind)       { return favs.filter(f => !kind || f.kind === kind).map(f => f.code); }
  function labelOf(kind, code) { const f = favs.find(f => f.kind === kind && f.code === code); return f ? (f.label || '') : ''; }

  function loadCache() {
    try { favs = JSON.parse(sessionStorage.getItem(CACHE_KEY) || '[]'); } catch { favs = []; }
  }
  function saveCache() {
    try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(favs)); } catch {}
  }

  async function fetchFavs() {
    const { data, error } = await sb.from('favourites')
      .select('kind, code, label, created_at')
      .order('created_at', { ascending: false });
    if (error) { console.error('favourites fetch', error); return; }
    favs = data.map(r => ({ kind: r.kind, code: r.code, label: r.label || '', ts: r.created_at }));
    saveCache();
    emit();
  }

  async function toggle(kind, code, label) {
    if (!user) { pending = { kind, code, label }; openSignIn(); return; }
    label = (label || '').trim().slice(0, 200);
    const on = has(kind, code);
    // optimistic
    if (on) favs = favs.filter(f => !(f.kind === kind && f.code === code));
    else    favs.unshift({ kind, code, label, ts: new Date().toISOString() });
    saveCache(); emit();

    const q = on
      ? sb.from('favourites').delete().match({ kind, code })
      : sb.from('favourites').insert({ kind, code, label: label || null });
    const { error } = await q;
    if (error) {
      console.error('favourites write', error);
      // roll back
      if (on) favs.unshift({ kind, code, label, ts: new Date().toISOString() });
      else    favs = favs.filter(f => !(f.kind === kind && f.code === code));
      saveCache(); emit();
      toast('Couldn’t save that — check your connection and try again.');
    }
  }

  // ── Star button ─────────────────────────────────────────────────────────
  const STAR = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 3l2.5 5.5 6 .8-4.3 4.2 1 6-5.2-2.8L6.8 19.5l1-6L3.5 9.3l6-.8z"/></svg>';
  function btn(kind, code, label) {
    const on = has(kind, code);
    const lbl = label ? ` data-label="${String(label).replace(/"/g, '&quot;')}"` : '';
    return `<button type="button" class="fav-btn${on ? ' on' : ''}" data-kind="${kind}" data-code="${code}"${lbl} ` +
           `aria-pressed="${on}" title="${on ? 'Remove from favourites' : 'Add to favourites'}" ` +
           `aria-label="${on ? 'Remove' : 'Add'} ${code} ${on ? 'from' : 'to'} favourites">${STAR}</button>`;
  }
  // One delegated handler; rows are re-rendered constantly so no per-button binding.
  document.addEventListener('click', e => {
    const b = e.target.closest('.fav-btn');
    if (!b) return;
    e.preventDefault(); e.stopPropagation();
    toggle(b.dataset.kind, b.dataset.code, b.dataset.label);
  });

  // Browse pages (assessment, specialty, fractures, diagref) render static
  // <div class="code-row"><span class="row-code">H101</span><div>…<div class="row-desc">…</div>
  // rows. Prepend a star to each; kind comes from <body data-fav-kind>.
  function decorate(root) {
    const kind = document.body.dataset.favKind || 'billing';
    (root || document).querySelectorAll('.row-code').forEach(el => {
      if (el.querySelector('.fav-btn')) return;
      const code = el.textContent.trim();
      if (!code) return;
      const row = el.closest('.code-row');
      const desc = row && row.querySelector('.row-desc');
      const label = desc ? desc.textContent.replace(/^↳\s*\+?\s*/, '').trim() : '';
      el.classList.add('fav-code');
      el.insertAdjacentHTML('afterbegin', btn(kind, code, label));
    });
  }
  // Keep every star for the same code in sync without a full re-render.
  listeners.push(() => {
    document.querySelectorAll('.fav-btn').forEach(b => {
      const on = has(b.dataset.kind, b.dataset.code);
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on);
      b.title = on ? 'Remove from favourites' : 'Add to favourites';
    });
  });

  // ── Styles ──────────────────────────────────────────────────────────────
  const CSS = `
    .fav-btn {
      display: inline-flex; align-items: center; justify-content: center;
      width: 32px; height: 32px; margin: -8px 2px -8px -8px; padding: 0;
      background: none; border: none; border-radius: 8px; cursor: pointer;
      color: #B8C4CF; vertical-align: middle; transition: color .12s, background .12s, transform .12s;
    }
    .fav-btn svg { fill: none; stroke: currentColor; stroke-width: 2; stroke-linejoin: round; }
    .fav-btn:hover { color: #8A7433; background: var(--sc-accent-wash, #FFF6E1); }
    .fav-btn.on { color: var(--sc-accent, #FFC53D); }
    .fav-btn.on svg { fill: currentColor; stroke: #E0AE2A; }
    .fav-btn:active { transform: scale(0.88); }
    .fav-btn:focus-visible { outline: 2px solid var(--sc-rail, #2C6FA8); outline-offset: 1px; }
    @media (max-width: 640px) {
      .fav-btn { width: 40px; height: 40px; margin: -10px 0 -10px -10px; }
      .fav-btn svg { width: 19px; height: 19px; }
    }
    /* code cell: star + code sit together */
    .fav-code { display: inline-flex; align-items: center; gap: 2px; white-space: nowrap; }
    .code-row .row-code.fav-code { min-width: 84px; margin-left: -6px; }
    .code-row .row-code.fav-code .fav-btn { margin: -8px 0 -8px 0; }
    @media (max-width: 640px) {
      .code-row .row-code.fav-code { min-width: 92px; }
      .code-row .row-code.fav-code .fav-btn { margin: -10px 0 -10px 0; }
    }

    /* ── Account control (rail foot / mobile drawer) ── */
    .sc-acct { display: flex; flex-direction: column; gap: 4px; padding: 0 2px; font-size: 12.5px; color: #fff; }
    .sc-acct-email { opacity: .85; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 12px; }
    .sc-acct button, .sc-acct a {
      background: none; border: none; padding: 0; color: #fff; cursor: pointer;
      font: inherit; font-size: 12.5px; text-align: left; text-decoration: none;
    }
    .sc-acct button:hover, .sc-acct a:hover { text-decoration: underline; }
    body.sc-rail-collapsed .sc-acct { display: none; }
    .sc-drawer .sc-acct { padding: 14px 2px 4px; font-size: 14px; border-top: 1px solid rgba(255,255,255,.2); margin-top: 6px; }
    .sc-drawer .sc-acct button { font-size: 14px; min-height: 44px; }

    /* ── Sign-in modal ── */
    .fav-overlay {
      position: fixed; inset: 0; z-index: 1200; background: rgba(15,26,36,.45);
      display: none; align-items: center; justify-content: center; padding: 16px;
    }
    .fav-overlay.open { display: flex; }
    .fav-modal {
      background: #fff; border-radius: 14px; width: 100%; max-width: 400px;
      padding: 24px 24px 20px; box-shadow: 0 20px 60px rgba(15,26,36,.25); position: relative;
      font-family: var(--sc-sans, sans-serif); color: var(--sc-ink, #0F1A24);
    }
    .fav-modal h2 { font-size: 1.1rem; margin: 0 0 6px; letter-spacing: -.01em; }
    .fav-modal p  { font-size: .86rem; color: var(--sc-muted, #55636F); margin: 0 0 14px; line-height: 1.5; }
    .fav-modal label { display: block; font-size: .74rem; font-weight: 600; margin-bottom: 5px; color: var(--sc-muted, #55636F); text-transform: uppercase; letter-spacing: .08em; }
    .fav-modal input[type=email], .fav-modal input[type=text] {
      width: 100%; padding: 12px 14px; font: inherit; font-size: 1rem;
      border: 1.5px solid var(--sc-line, #DDE7F0); border-radius: 10px; outline: none; margin-bottom: 12px;
    }
    .fav-modal input:focus { border-color: var(--sc-rail, #2C6FA8); box-shadow: 0 0 0 3px rgba(44,111,168,.14); }
    .fav-modal input.otp { font-family: var(--sc-mono, monospace); font-size: 1.5rem; letter-spacing: .35em; text-align: center; }
    .fav-modal .chk { display: flex; align-items: center; gap: 8px; font-size: .84rem; margin: 0 0 14px; cursor: pointer; }
    .fav-modal .chk input { width: 17px; height: 17px; margin: 0; }
    .fav-modal .sc-btn { width: 100%; }
    .fav-modal .err { color: #B42318; font-size: .82rem; margin: -6px 0 10px; display: none; }
    .fav-modal .err.show { display: block; }
    .fav-modal .back { background: none; border: none; color: var(--sc-muted, #55636F); font: inherit; font-size: .8rem; cursor: pointer; margin-top: 12px; padding: 0; }
    .fav-modal .back:hover { text-decoration: underline; }
    .fav-x {
      position: absolute; top: 8px; right: 8px; width: 40px; height: 40px;
      background: none; border: none; font-size: 1.1rem; color: #93A2AF; cursor: pointer; border-radius: 8px;
    }
    .fav-x:hover { background: var(--sc-surface, #F2F6FA); color: var(--sc-muted, #55636F); }
    .fav-fine { font-size: .72rem; color: #93A2AF; margin: 12px 0 0; line-height: 1.45; }

    .fav-toast {
      position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%) translateY(20px);
      background: var(--sc-ink, #0F1A24); color: #fff; font-size: .84rem; padding: 10px 16px;
      border-radius: 10px; z-index: 1300; opacity: 0; transition: opacity .2s, transform .2s; pointer-events: none;
    }
    .fav-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
    @media (max-width: 900px) { .fav-toast { bottom: 92px; } }
  `;
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  // ── Toast ───────────────────────────────────────────────────────────────
  let toastEl, toastTimer;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'fav-toast'; document.body.appendChild(toastEl); }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2800);
  }

  // ── Sign-in modal ───────────────────────────────────────────────────────
  let overlay, emailStep, codeStep, emailIn, codeIn, rememberIn, emailErr, codeErr, sendBtn, verifyBtn, codeHint;
  let sentTo = '';

  function buildModal() {
    overlay = document.createElement('div');
    overlay.className = 'fav-overlay';
    overlay.innerHTML = `
      <div class="fav-modal" role="dialog" aria-modal="true" aria-labelledby="favTitle">
        <button type="button" class="fav-x" aria-label="Close">✕</button>
        <div class="fav-step-email">
          <h2 id="favTitle">Save your favourite codes</h2>
          <p>Sign in once and your starred codes follow you to every workstation and your phone. No password — we email you a one-time code.</p>
          <form novalidate>
            <label for="favEmail">Email</label>
            <input id="favEmail" type="email" autocomplete="email" inputmode="email" placeholder="you@example.com" required>
            <div class="err"></div>
            <button type="submit" class="sc-btn">Send code</button>
          </form>
          <p class="fav-fine">We only use your email to sign you in. Favourites are billing codes only — never patient information.</p>
        </div>
        <div class="fav-step-code" style="display:none">
          <h2>Enter the code from the email</h2>
          <p class="fav-code-hint"></p>
          <form novalidate>
            <label for="favCode">Code</label>
            <input id="favCode" class="otp" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="10" pattern="[0-9]*" placeholder="······" required>
            <div class="err"></div>
            <label class="chk"><input type="checkbox" id="favRemember"> Keep me signed in on this device</label>
            <button type="submit" class="sc-btn">Verify &amp; sign in</button>
          </form>
          <button type="button" class="back">← Use a different email</button>
          <p class="fav-fine">Leave the box unticked on a shared hospital computer — you'll be signed out when the tab closes.</p>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    emailStep  = overlay.querySelector('.fav-step-email');
    codeStep   = overlay.querySelector('.fav-step-code');
    emailIn    = overlay.querySelector('#favEmail');
    codeIn     = overlay.querySelector('#favCode');
    rememberIn = overlay.querySelector('#favRemember');
    emailErr   = emailStep.querySelector('.err');
    codeErr    = codeStep.querySelector('.err');
    sendBtn    = emailStep.querySelector('.sc-btn');
    verifyBtn  = codeStep.querySelector('.sc-btn');
    codeHint   = overlay.querySelector('.fav-code-hint');

    overlay.querySelector('.fav-x').addEventListener('click', closeSignIn);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeSignIn(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay.classList.contains('open')) closeSignIn(); });
    overlay.querySelector('.back').addEventListener('click', () => showStep('email'));

    emailStep.querySelector('form').addEventListener('submit', async e => {
      e.preventDefault();
      const email = emailIn.value.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showErr(emailErr, 'Enter a valid email address.');
      hideErr(emailErr);
      sendBtn.disabled = true; sendBtn.textContent = 'Sending…';
      const { error } = await sb.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
      sendBtn.disabled = false; sendBtn.textContent = 'Send code';
      if (error) return showErr(emailErr, friendly(error));
      sentTo = email;
      codeHint.textContent = `We sent it to ${email}. Check your phone if that's where your mail is — the code works on this computer.`;
      showStep('code');
    });

    codeStep.querySelector('form').addEventListener('submit', async e => {
      e.preventDefault();
      const token = codeIn.value.replace(/\D/g, '');
      if (token.length < 6 || token.length > 10) return showErr(codeErr, 'Enter the whole code from the email.');
      hideErr(codeErr);
      try { localStorage.setItem(REMEMBER_KEY, rememberIn.checked ? '1' : '0'); } catch {}
      verifyBtn.disabled = true; verifyBtn.textContent = 'Verifying…';
      const { error } = await sb.auth.verifyOtp({ email: sentTo, token, type: 'email' });
      verifyBtn.disabled = false; verifyBtn.innerHTML = 'Verify &amp; sign in';
      if (error) return showErr(codeErr, friendly(error));
      hideModal();
      // onAuthStateChange handles the rest, including any pending star
    });

    codeIn.addEventListener('input', () => {
      codeIn.value = codeIn.value.replace(/\D/g, '').slice(0, 10);
      if (codeIn.value.length === OTP_LENGTH) codeStep.querySelector('form').requestSubmit();
    });
  }

  function friendly(err) {
    const m = (err && err.message) || '';
    if (/rate limit|too many/i.test(m)) return 'Too many attempts — wait a minute and try again.';
    if (/expired|invalid/i.test(m))      return 'That code is wrong or has expired. Request a new one.';
    if (/signups not allowed/i.test(m))  return 'Sign-ups are closed right now.';
    return m || 'Something went wrong. Please try again.';
  }
  function showErr(el, msg) { el.textContent = msg; el.classList.add('show'); }
  function hideErr(el) { el.classList.remove('show'); }
  function showStep(which) {
    emailStep.style.display = which === 'email' ? '' : 'none';
    codeStep.style.display  = which === 'code'  ? '' : 'none';
    hideErr(emailErr); hideErr(codeErr);
    setTimeout(() => (which === 'email' ? emailIn : codeIn).focus(), 30);
  }
  function openSignIn() {
    if (!overlay) buildModal();
    codeIn.value = '';
    showStep('email');
    overlay.classList.add('open');
  }
  function hideModal() { if (overlay) overlay.classList.remove('open'); }
  // Dismissing the modal (✕, backdrop, Escape) abandons the star that opened it.
  function closeSignIn() { hideModal(); pending = null; }

  // ── Account control in the header ───────────────────────────────────────
  function renderAccount() {
    const html = user
      ? `<span class="sc-acct-email" title="${user.email}">${user.email}</span><button type="button" data-act="out">Sign out</button>`
      : `<button type="button" data-act="in">Sign in · save favourites</button>`;
    ['.sc-rail .sc-foot', '.sc-drawer'].forEach(sel => {
      const host = document.querySelector(sel);
      if (!host) return;
      let el = host.querySelector('.sc-acct');
      if (!el) {
        el = document.createElement('div');
        el.className = 'sc-acct';
        if (sel === '.sc-drawer') host.appendChild(el); else host.insertBefore(el, host.firstChild);
        el.addEventListener('click', e => {
          const b = e.target.closest('button'); if (!b) return;
          const drawer = document.getElementById('scDrawer');
          if (drawer) drawer.classList.remove('sc-open');
          if (b.dataset.act === 'in') openSignIn(); else signOut();
        });
      }
      el.innerHTML = html;
    });
  }
  listeners.push(renderAccount);

  async function signOut() {
    await sb.auth.signOut();
    try { localStorage.removeItem(REMEMBER_KEY); sessionStorage.removeItem(CACHE_KEY); } catch {}
    user = null; favs = []; emit();
    toast('Signed out');
  }

  // ── Boot ────────────────────────────────────────────────────────────────
  loadCache();

  sb.auth.onAuthStateChange((event, session) => {
    const was = user && user.email;
    user = session ? { id: session.user.id, email: session.user.email } : null;
    if (user) {
      if (!was) {
        fetchFavs().then(() => {
          if (pending) { const p = pending; pending = null; toggle(p.kind, p.code, p.label); }
        });
        if (event === 'SIGNED_IN') toast(`Signed in as ${user.email}`);
      }
    } else if (event === 'SIGNED_OUT' || event === 'INITIAL_SESSION') {
      favs = []; saveCache();
    }
    emit();
  });

  function ready(fn) { document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn) : fn(); }
  ready(() => {
    // header-v2.js renders synchronously in connectedCallback, so the rail
    // exists by DOMContentLoaded; retry once in case it upgrades late.
    renderAccount();
    if (!document.querySelector('.sc-acct')) setTimeout(renderAccount, 100);
    decorate();
  });

  window.Fav = {
    has, list, labelOf, toggle, btn, decorate, openSignIn, signOut,
    onChange(fn) { listeners.push(fn); },
    get user() { return user; },
    get count() { return favs.length; },
  };
})();

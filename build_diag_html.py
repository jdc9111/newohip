import json

with open(r'C:\Users\chish\OneDrive\Desktop\Claude New Ohip\diagnosticcodes.txt', encoding='utf-8') as f:
    lines = f.readlines()

rows = []
for line in lines[1:]:
    line = line.rstrip('\n')
    if '\t' not in line:
        continue
    parts = line.split('\t', 1)
    if len(parts) == 2:
        code, desc = parts[0].strip(), parts[1].strip()
        if code and desc:
            rows.append([code, desc])

js_entries = ',\n'.join(f'  [{json.dumps(c)},{json.dumps(d)}]' for c, d in rows)
diag_data = f'const DIAG = [\n{js_entries}\n];'

html = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Diagnostic Code Search \u2014 ED OHIP</title>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-YMK3RYM38R"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){{dataLayer.push(arguments);}}
  gtag('js', new Date());
  gtag('config', 'G-YMK3RYM38R');
</script>
<style>
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
    background: #f0f4f8;
    color: #1a202c;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }}
  header {{
    background: #1F4E79;
    color: white;
    padding: 18px 24px;
    display: flex;
    align-items: baseline;
    gap: 16px;
  }}
  header h1 {{ font-size: 1.2rem; font-weight: 700; letter-spacing: 0.01em; }}
  header span {{ font-size: 0.8rem; opacity: 0.75; }}
  header a.nav-link {{
    margin-left: auto;
    font-size: 0.82rem;
    color: white;
    opacity: 0.85;
    text-decoration: none;
    border: 1px solid rgba(255,255,255,0.45);
    border-radius: 5px;
    padding: 4px 12px;
    white-space: nowrap;
  }}
  header a.nav-link:hover {{ opacity: 1; background: rgba(255,255,255,0.1); }}
  .search-bar {{
    background: white;
    padding: 16px 24px;
    border-bottom: 1px solid #dde3ed;
    position: sticky;
    top: 0;
    z-index: 10;
    box-shadow: 0 2px 6px rgba(0,0,0,0.07);
  }}
  .search-wrap {{ max-width: 720px; margin: 0 auto; position: relative; }}
  .search-wrap svg {{
    position: absolute; left: 14px; top: 50%;
    transform: translateY(-50%); color: #718096; pointer-events: none;
  }}
  #query {{
    width: 100%;
    padding: 11px 14px 11px 42px;
    font-size: 1rem;
    border: 2px solid #BDD7EE;
    border-radius: 8px;
    outline: none;
    transition: border-color 0.15s;
    background: #fafcff;
  }}
  #query:focus {{ border-color: #1F4E79; background: white; }}
  .hint {{ max-width: 720px; margin: 6px auto 0; font-size: 0.75rem; color: #718096; }}
  main {{ flex: 1; max-width: 860px; margin: 24px auto; padding: 0 16px 60px; width: 100%; }}
  #status {{ font-size: 0.82rem; color: #4a5568; margin-bottom: 12px; min-height: 1.2em; }}
  table {{
    width: 100%; border-collapse: collapse; background: white;
    border-radius: 10px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  }}
  thead th {{
    background: #1F4E79; color: white; font-size: 0.78rem; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.06em; padding: 11px 14px; text-align: left;
  }}
  thead th:nth-child(1) {{ width: 90px; text-align: center; }}
  tbody tr {{ border-bottom: 1px solid #edf2f7; transition: background 0.1s; }}
  tbody tr:last-child {{ border-bottom: none; }}
  tbody tr:hover {{ background: #ebf3fb; }}
  td {{ padding: 10px 14px; font-size: 0.88rem; vertical-align: middle; }}
  td:nth-child(1) {{ text-align: center; font-weight: 700; font-size: 0.92rem; color: #1F4E79; letter-spacing: 0.03em; }}
  mark {{ background: #fef08a; border-radius: 2px; padding: 0 1px; color: inherit; }}
  #empty {{ text-align: center; padding: 60px 20px; color: #a0aec0; display: none; }}
  #empty p {{ font-size: 0.95rem; }}
  footer {{
    position: fixed; bottom: 0; left: 0; right: 0;
    text-align: center; padding: 8px 24px; font-size: 0.78rem;
    color: #718096; background: white; border-top: 1px solid #dde3ed; z-index: 10;
  }}
  footer a {{ color: #1F4E79; }}
</style>
</head>
<body>

<header>
  <h1>Diagnostic Code Search</h1>
  <span>Ontario OHIP \u2014 {len(rows):,} codes</span>
  <a href="index.html" class="nav-link">\u2190 Billing Codes</a>
</header>

<div class="search-bar">
  <div class="search-wrap">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
    <input id="query" type="search" placeholder="Search by code (e.g. 787) or diagnosis (e.g. fracture, chest pain, abscess)\u2026" autocomplete="off" autofocus>
  </div>
  <p class="hint">Searches code and description simultaneously.</p>
</div>

<main>
  <div id="status"></div>
  <table id="tbl" style="display:none">
    <thead><tr><th>Code</th><th>Diagnosis</th></tr></thead>
    <tbody id="tbody"></tbody>
  </table>
  <div id="empty"><p>No matching codes found.</p></div>
</main>

<footer>
  Please send feedback/suggestions to <a href="mailto:chisholm.mirror@gmail.com">chisholm.mirror@gmail.com</a>
</footer>

<script>
{diag_data}

const TOKENS = DIAG.map(r => (r[0] + ' ' + r[1]).toLowerCase());

function score(h, needle) {{
  const n = needle.toLowerCase();
  if (h.includes(n)) return 100 + (n.length / h.length) * 50;
  const words = n.split(/\s+/).filter(Boolean);
  let hits = 0;
  for (const w of words) {{ if (h.includes(w)) hits++; }}
  if (hits === words.length) return 60 + hits * 5;
  if (hits > 0) return 30 + hits * 10;
  return 0;
}}

function esc(s) {{
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}}

function highlight(text, q) {{
  if (!q) return esc(text);
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx !== -1) {{
    return esc(text.slice(0,idx)) + '<mark>' + esc(text.slice(idx,idx+q.length)) + '</mark>' + esc(text.slice(idx+q.length));
  }}
  let result = esc(text);
  q.split(/\s+/).filter(Boolean).forEach(w => {{
    const re = new RegExp(w.replace(/[.*+?^${{}}()|[\]\\\\]/g,'\\\\$&'), 'gi');
    result = result.replace(re, m => '<mark>' + m + '</mark>');
  }});
  return result;
}}

const tbody = document.getElementById('tbody');
const status = document.getElementById('status');
const empty  = document.getElementById('empty');
const tbl    = document.getElementById('tbl');

function render(query) {{
  const q = (query || '').trim();
  tbody.innerHTML = '';
  if (!q) {{
    tbl.style.display = 'none';
    empty.style.display = 'none';
    status.textContent = '';
    return;
  }}
  const results = DIAG
    .map((r, i) => ({{ r, s: score(TOKENS[i], q) }}))
    .filter(x => x.s > 0)
    .sort((a, b) => b.s - a.s);
  if (results.length === 0) {{
    tbl.style.display = 'none';
    empty.style.display = 'block';
    status.textContent = '';
    return;
  }}
  tbl.style.display = '';
  empty.style.display = 'none';
  status.textContent = results.length + ' result' + (results.length === 1 ? '' : 's') + ' for "' + q + '"';
  const frag = document.createDocumentFragment();
  for (const {{ r }} of results) {{
    const tr = document.createElement('tr');
    tr.innerHTML = '<td>' + highlight(r[0], q) + '</td><td>' + highlight(r[1], q) + '</td>';
    frag.appendChild(tr);
  }}
  tbody.appendChild(frag);
}}

let timer;
document.getElementById('query').addEventListener('input', e => {{
  clearTimeout(timer);
  timer = setTimeout(() => render(e.target.value), 120);
}});
</script>
</body>
</html>'''

out = r'C:\Users\chish\OneDrive\Desktop\Claude New Ohip\diag.html'
with open(out, 'w', encoding='utf-8') as f:
    f.write(html)
print(f'Written {out} ({len(html):,} chars, {len(rows)} codes)')

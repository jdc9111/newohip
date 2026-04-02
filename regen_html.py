import re

with open('build_billing.py', encoding='utf-8') as f:
    src = f.read()

m = re.search(r'^rows = \[(.*?)^\]', src, re.MULTILINE | re.DOTALL)
rows_src = 'rows = [' + m.group(1) + ']'
ns = {}
exec(rows_src, ns)
rows = ns['rows']
print(f'Loaded {len(rows)} rows')

def esc(s):
    return str(s).replace('\\', '\\\\').replace('"', '\\"')

js_lines = []
for cat, code, desc, fee, notes in rows:
    fee_js = str(fee) if fee is not None else 'null'
    js_lines.append(f'  ["{esc(code)}","{esc(desc)}",{fee_js},"{esc(cat)}","{esc(notes)}"],')

js_array = 'const DATA = [\n' + '\n'.join(js_lines) + '\n];'

with open('ohip_search.html', encoding='utf-8') as f:
    html = f.read()

html_new = re.sub(r'const DATA = \[.*?\];', js_array, html, flags=re.DOTALL)

with open('ohip_search.html', 'w', encoding='utf-8') as f:
    f.write(html_new)
print('HTML DATA array replaced successfully')

import json, re

with open(r'C:\Users\chish\OneDrive\Desktop\Claude New Ohip\diagnosticcodes.txt', encoding='utf-8') as f:
    lines = f.readlines()

rows = []
for line in lines[1:]:   # skip header
    line = line.rstrip('\n')
    if '\t' not in line:
        continue
    parts = line.split('\t', 1)
    if len(parts) != 2:
        continue
    code, desc = parts[0].strip(), parts[1].strip()
    if code and desc:
        rows.append([code, desc])

# Build JS array string
js_entries = []
for code, desc in rows:
    c = json.dumps(code)
    d = json.dumps(desc)
    js_entries.append(f'  [{c},{d}]')

js_array = 'const DIAG = [\n' + ',\n'.join(js_entries) + '\n];'

print(f'Total codes: {len(rows)}')
print(js_array[:300])

with open(r'C:\Users\chish\OneDrive\Desktop\Claude New Ohip\_diag_data.js', 'w', encoding='utf-8') as f:
    f.write(js_array)
print('Written to _diag_data.js')

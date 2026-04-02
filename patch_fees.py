import re

# Rounded fee (integer) and exact fee from MOH Schedule of Benefits Jan 2025
# Note: April 2026 fees may differ slightly; exact values noted for reference
FEES = {
    "F004": (49,  49.20), "F005": (99,  99.25), "E558": (22,  22.25),
    "F007": (298, 298.45),"F008": (49,  49.20), "F009": (99,  99.25),
    "F012": (49,  49.20), "F013": (120, 119.80),"F018": (49,  49.20),
    "F102": (49,  49.20), "F016": (115, 115.10),"F027": (68,  67.75),
    "F028": (109, 109.45),"F046": (149, 149.35),"F031": (81,  81.30),
    "F032": (118, 117.85),"F034": (126, 126.25),"F035": (129, 129.00),
    "F029": (68,  67.75), "F037": (126, 126.25),"F042": (68,  67.80),
    "F043": (148, 147.60),"F053": (68,  67.80), "F054": (134, 133.60),
    "F134": (442, 442.45),"F095": (407, 407.35),"F085": (68,  67.75),
    "F078": (116, 115.95),"F079": (180, 180.05),"F082": (68,  67.75),
    "F083": (101, 101.25),"F074": (68,  67.75), "F075": (145, 144.80),
    "F104": (242, 242.25),"F070": (97,  97.35), "F071": (161, 161.45),
    "F061": (49,  49.20), "F062": (68,  67.75), "F063": (98,  98.35),
    "F066": (98,  98.10), "F067": (165, 165.20),"F056": (49,  49.20),
    "F058": (72,  72.35), "E560": (12,  12.05), "E561": (15,  14.90),
    "D001": (58,  57.50), "E576": (10,  10.25), "D003": (197, 196.50),
    "D004": (58,  57.50), "D007": (128, 128.05),"D012": (39,  39.00),
    "D009": (84,  84.45), "D015": (49,  49.20), "D016": (111, 111.40),
    "D014": (68,  67.80), "D042": (268, 268.25),"D038": (208, 207.90),
    "D040": (62,  62.20), "D031": (97,  97.35), "D035": (111, 111.35),
    "D026": (148, 147.60),"D030": (58,  57.50), "D027": (58,  57.50),
    "Z201": (10,  10.25), "Z202": (15,  14.90), "Z203": (24,  24.10),
    "Z213": (24,  24.10), "Z211": (29,  28.80), "Z204": (10,  10.25),
}

# ── patch build_billing.py ───────────────────────────────────────────────────
py_path = r"C:\Users\chish\OneDrive\Desktop\Claude New Ohip\build_billing.py"
with open(py_path, encoding="utf-8") as f:
    py = f.read()

for code, (rounded, exact) in FEES.items():
    # Match lines like: ("Category","CODE","description",None,"notes")
    # Replace None with rounded integer; append exact fee to notes if not already there
    def replacer(m, code=code, rounded=rounded, exact=exact):
        cat, c, desc, notes = m.group(1), m.group(2), m.group(3), m.group(4)
        note_addition = f"Exact fee ${exact:.2f} (MOH Jan 2025 schedule)"
        if notes:
            new_notes = notes + "; " + note_addition
        else:
            new_notes = note_addition
        return f'({cat},"{code}",{desc},{rounded},"{new_notes}")'

    pattern = rf'\(([^,]+),"{re.escape(code)}",([^,]+(?:,[^,]+)*),None,"([^"]*)"\)'

    def make_replacer(code, rounded, exact):
        def replacer(m):
            cat   = m.group(1)
            desc  = m.group(2)
            notes = m.group(3)
            note_addition = f"Exact fee ${exact:.2f} (MOH Jan 2025)"
            new_notes = (notes + "; " + note_addition) if notes else note_addition
            return f'({cat},"{code}",{desc},{rounded},"{new_notes}")'
        return replacer

    py = re.sub(
        rf'\(([^,\n]+),"{re.escape(code)}",([^,\n]+),None,"([^"]*?)"\)',
        make_replacer(code, rounded, exact),
        py
    )

with open(py_path, "w", encoding="utf-8") as f:
    f.write(py)
print(f"Patched build_billing.py")

# ── patch ohip_search.html ───────────────────────────────────────────────────
html_path = r"C:\Users\chish\OneDrive\Desktop\Claude New Ohip\ohip_search.html"
with open(html_path, encoding="utf-8") as f:
    html = f.read()

for code, (rounded, exact) in FEES.items():
    def make_html_replacer(code, rounded, exact):
        def replacer(m):
            pre   = m.group(1)  # everything before null
            post  = m.group(2)  # notes field
            note_addition = f"Exact fee ${exact:.2f} (MOH Jan 2025)"
            orig_notes = post.rstrip('"')
            new_notes = (orig_notes + "; " + note_addition) if orig_notes else note_addition
            return f'{pre}{rounded},"{new_notes}"],'
        return replacer

    html = re.sub(
        rf'(\["{re.escape(code)}",[^\]]+?,)null,(".*?")]',
        make_html_replacer(code, rounded, exact),
        html
    )

with open(html_path, "w", encoding="utf-8") as f:
    f.write(html)
print(f"Patched ohip_search.html")

# verify
missing_py   = [c for c in FEES if f'"{c}",None' in py   or f",None," in py   and f'"{c}"' in py]
missing_html = [c for c in FEES if f'"{c}",' in html and ',null,' in html.split(f'"{c}"')[1][:60]]
print(f"Remaining nulls in py:   {missing_py}")
print(f"Remaining nulls in html: {missing_html}")

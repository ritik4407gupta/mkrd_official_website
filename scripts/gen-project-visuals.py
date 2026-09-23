#!/usr/bin/env python3
"""
Generate the project card visuals.

The projects page used AI-generated stock photographs as placeholders for work
that actually exists — a photo of a generic factory standing in for a school
website, a stock robot arm standing in for a GST product. That is the thing the
client flagged first.

The honest fix is not a better stock photo. These are drawn from the real thing:
the school site's own four-band strip and navigation, the billing product's real
sidebar and its real twelve-column item grid, the warehouse product's real
movement types, and a real two-plate tool in section. Nothing here is a
photograph, nothing pretends to be one, and nothing carries a licence.

    python3 scripts/gen-project-visuals.py

Writes src/assets/projects/*.svg. Re-run after changing a product's structure.
"""

import os
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "src" / "assets" / "projects"
W, H = 1280, 720

# the brand ramp, kept in step with src/styles/brand.css
C = {
    "ink": "#06071A",
    "ink900": "#0B0D24",
    "ink850": "#101334",
    "ink800": "#161A40",
    "ink700": "#232A5E",
    "brand": "#2E22E6",
    "brand600": "#5B4DF5",
    "lift": "#7C71FF",
    "soft": "#A79CFF",
    "pale": "#C2BBFF",
    "deep": "#1B1499",
    "accent": "#E20207",
    "accentLift": "#FF6B70",
    "fg": "#D8DAF0",
    "muted": "#9EA2CC",
    "dim": "#6E73A2",
    "ok": "#4BD3A0",
    "warn": "#E8A33D",
}

FONT = "font-family='Inter,Archivo,Helvetica,Arial,sans-serif'"
MONO = "font-family='IBM Plex Mono,SFMono-Regular,Menlo,monospace'"


def head(extra_defs: str = "") -> str:
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="0.6" y2="1">
    <stop offset="0%" stop-color="{C['ink850']}"/>
    <stop offset="60%" stop-color="{C['ink900']}"/>
    <stop offset="100%" stop-color="{C['ink']}"/>
  </linearGradient>
  <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="{C['lift']}" stop-opacity="0.20"/>
    <stop offset="55%" stop-color="{C['brand']}" stop-opacity="0.05"/>
    <stop offset="100%" stop-color="{C['accent']}" stop-opacity="0.08"/>
  </linearGradient>
  <linearGradient id="accentBar" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="{C['brand600']}"/>
    <stop offset="70%" stop-color="{C['lift']}"/>
    <stop offset="100%" stop-color="{C['accent']}"/>
  </linearGradient>
  <filter id="soften" x="-20%" y="-20%" width="140%" height="140%">
    <feGaussianBlur stdDeviation="26"/>
  </filter>
  {extra_defs}
</defs>
<rect width="{W}" height="{H}" fill="url(#bg)"/>
<ellipse cx="{W*0.28:.0f}" cy="{H*0.16:.0f}" rx="420" ry="230" fill="{C['brand']}" opacity="0.16" filter="url(#soften)"/>
<ellipse cx="{W*0.84:.0f}" cy="{H*0.86:.0f}" rx="360" ry="200" fill="{C['accent']}" opacity="0.09" filter="url(#soften)"/>
<rect width="{W}" height="{H}" fill="url(#sheen)"/>"""


def window_frame(x, y, w, h, label, kind="browser"):
    """A browser or application window, drawn as chrome around a content area."""
    r = 14
    bar = 46
    dots = ""
    for i, col in enumerate([C["accent"], C["warn"], C["ok"]]):
        dots += f'<circle cx="{x+26+i*20}" cy="{y+bar/2}" r="5.5" fill="{col}" opacity="0.85"/>'
    if kind == "browser":
        chip = f"""
  <rect x="{x+86}" y="{y+12}" width="{w-160}" height="{bar-24}" rx="11" fill="{C['ink']}" opacity="0.75"/>
  <circle cx="{x+104}" cy="{y+bar/2}" r="4" fill="{C['ok']}"/>
  <text x="{x+118}" y="{y+bar/2+4}" {MONO} font-size="13" fill="{C['muted']}">{label}</text>"""
    else:
        chip = f"""
  <text x="{x+92}" y="{y+bar/2+5}" {FONT} font-size="13.5" font-weight="600" fill="{C['fg']}">{label}</text>"""
    return f"""
<g>
  <rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{C['ink900']}" stroke="{C['ink700']}" stroke-width="1.5"/>
  <path d="M{x} {y+bar} H{x+w}" stroke="{C['ink700']}" stroke-width="1.5"/>
  {dots}{chip}
</g>""", (x, y + bar, w, h - bar)


_ENTITY = __import__("re").compile(r"&(?![A-Za-z#][A-Za-z0-9]*;)")


def esc(s: str) -> str:
    """XML-escape, leaving any entity already written in the source alone."""
    return _ENTITY.sub("&amp;", str(s)).replace("<", "&lt;").replace(">", "&gt;")


def text(x, y, s, size=14, fill=None, weight="400", font=FONT, anchor="start", opacity=1.0):
    return (f'<text x="{x}" y="{y}" {font} font-size="{size}" font-weight="{weight}" '
            f'fill="{fill or C["fg"]}" text-anchor="{anchor}" opacity="{opacity}">{esc(s)}</text>')


def bar(x, y, w, h, fill, opacity=1.0, r=3):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" opacity="{opacity}"/>'


def caption(label, sub):
    """The strip along the bottom that says what the picture is."""
    return f"""
<g>
  <rect x="0" y="{H-74}" width="{W}" height="74" fill="{C['ink']}" opacity="0.82"/>
  <rect x="0" y="{H-74}" width="{W}" height="2.5" fill="url(#accentBar)"/>
  {text(48, H-40, label, 17, C['fg'], '700')}
  {text(48, H-19, sub, 13, C['dim'], '400', MONO)}
</g>"""


# ---------------------------------------------------------------- SDMS site

def sdms_site():
    frame, (cx, cy, cw, ch) = window_frame(78, 62, W - 156, H - 200, "sdms.edu.in", "browser")
    # the crest sits centred in the bar, so the nav splits around it rather
    # than running underneath it
    left_nav = ["Home", "Academics", "Admission", "Students Life"]
    right_nav = ["Faculty", "Campus", "News & Events", "About"]
    navs = ""
    nx = cx + 40
    for i, n in enumerate(left_nav):
        navs += text(nx, cy + 46, n, 12.5, C["pale"] if i else "#FFFFFF", "600" if i == 0 else "400")
        nx += len(n) * 7.4 + 24
    right_w = sum(len(n) * 7.4 + 24 for n in right_nav)
    nx = cx + cw - 40 - right_w
    for n in right_nav:
        navs += text(nx, cy + 46, n, 12.5, C["pale"], "400")
        nx += len(n) * 7.4 + 24
    # the four-band strip the school's own home page carries
    bands = ["Dedication", "Determination", "Discipline", "Devotion"]
    band_w = cw / 4
    strip = ""
    for i, b in enumerate(bands):
        shade = ["#1B1499", "#241BB4", "#2E22E6", "#5B4DF5"][i]
        bx = cx + i * band_w
        strip += bar(bx, cy + ch - 132, band_w - 2, 62, shade, 0.92, 0)
        strip += text(bx + band_w / 2, cy + ch - 94, b, 15, "#FFFFFF", "600", FONT, "middle")
    cards = ""
    for i in range(3):
        bx = cx + 40 + i * ((cw - 80) / 3)
        bw = (cw - 80) / 3 - 22
        cards += bar(bx, cy + ch - 58, bw, 40, C["ink800"], 0.85, 6)
        cards += bar(bx + 14, cy + ch - 44, bw * 0.5, 7, C["soft"], 0.55)
        cards += bar(bx + 14, cy + ch - 32, bw * 0.72, 6, C["dim"], 0.4)
    return head() + frame + f"""
<g>
  <rect x="{cx}" y="{cy}" width="{cw}" height="26" fill="{C['ink850']}"/>
  {text(cx+22, cy+18, "8750046035", 11, C['dim'], '400', MONO)}
  {text(cx+150, cy+18, "info@sdmsgurgaon.in", 11, C['dim'], '400', MONO)}
  {text(cx+cw-100, cy+18, "Virtual Tour", 11, C['accentLift'], '600', MONO)}
  <rect x="{cx}" y="{cy+26}" width="{cw}" height="42" fill="{C['deep']}"/>
  <circle cx="{cx+cw/2}" cy="{cy+47}" r="19" fill="{C['ink900']}" stroke="{C['warn']}" stroke-width="2"/>
  {navs}
  <rect x="{cx}" y="{cy+68}" width="{cw}" height="{ch-200}" fill="{C['ink850']}"/>
  <rect x="{cx}" y="{cy+68}" width="{cw}" height="{ch-200}" fill="{C['brand']}" opacity="0.10"/>
  {text(cx+cw/2, cy+180, "Shaping Dreams with Knowledge &amp; Values", 27, "#FFFFFF", "700", FONT, "middle")}
  {text(cx+cw/2, cy+208, "Nurturing confident learners through culture, creativity and character", 13, C['pale'], "400", FONT, "middle")}
  {strip}{cards}
</g>""" + caption(
        "SDMS Institutional Website",
        "sdms.edu.in  ·  responsive public site  ·  departments, admissions, news",
    ) + "</svg>"


# ---------------------------------------------------------------- SDMS tour

def sdms_tour():
    frame, (cx, cy, cw, ch) = window_frame(78, 62, W - 156, H - 200, "virtual-tour.sdms.edu.in", "browser")
    # a panorama viewport: horizon band, node markers, minimap, compass
    nodes = [(0.22, 0.58), (0.41, 0.47), (0.58, 0.62), (0.74, 0.5), (0.87, 0.66)]
    marks = ""
    for i, (u, v) in enumerate(nodes):
        px, py = cx + u * cw, cy + v * ch
        active = i == 2
        marks += f'<circle cx="{px:.0f}" cy="{py:.0f}" r="{22 if active else 15}" fill="none" stroke="{C["accent"] if active else C["lift"]}" stroke-width="1.6" opacity="0.75"/>'
        marks += f'<circle cx="{px:.0f}" cy="{py:.0f}" r="{7 if active else 5}" fill="{C["accent"] if active else C["soft"]}"/>'
        if active:
            marks += f'<circle cx="{px:.0f}" cy="{py:.0f}" r="34" fill="none" stroke="{C["accent"]}" stroke-width="1" opacity="0.35"/>'
    lat = ""
    for i in range(1, 7):
        y = cy + (ch * i / 7)
        lat += f'<path d="M{cx} {y:.0f} Q {cx+cw/2} {y-26:.0f} {cx+cw} {y:.0f}" stroke="{C["lift"]}" stroke-width="0.8" fill="none" opacity="0.16"/>'
    lon = ""
    for i in range(1, 10):
        x = cx + (cw * i / 10)
        lon += f'<path d="M{x:.0f} {cy} Q {x+ (cw/2 - (x-cx))*0.12:.0f} {cy+ch/2} {x:.0f} {cy+ch}" stroke="{C["lift"]}" stroke-width="0.8" fill="none" opacity="0.13"/>'
    mini = ""
    mw, mh = 190, 118
    mx, my = cx + cw - mw - 26, cy + ch - mh - 26
    mini += f'<rect x="{mx}" y="{my}" width="{mw}" height="{mh}" rx="8" fill="{C["ink"]}" opacity="0.85" stroke="{C["ink700"]}"/>'
    mini += text(mx + 12, my + 22, "FLOORPLAN", 9.5, C["dim"], "600", MONO)
    for rx, ry, rw, rh in [(16, 32, 66, 40), (90, 32, 84, 26), (16, 78, 46, 28), (70, 64, 50, 42), (128, 66, 46, 40)]:
        mini += f'<rect x="{mx+rx}" y="{my+ry}" width="{rw}" height="{rh}" rx="3" fill="none" stroke="{C["soft"]}" stroke-width="1" opacity="0.5"/>'
    mini += f'<circle cx="{mx+96}" cy="{my+80}" r="5" fill="{C["accent"]}"/>'
    # a low architectural silhouette on the horizon, so the viewport reads as a
    # place rather than a grid
    horizon = cy + ch * 0.46
    blocks = [(0.02, 96, 0.11), (0.14, 138, 0.09), (0.25, 78, 0.13), (0.34, 164, 0.16),
              (0.52, 104, 0.10), (0.63, 142, 0.14), (0.77, 86, 0.11), (0.86, 128, 0.12)]
    skyline = ""
    for u, bh, wfrac in blocks:
        bx = cx + cw * u
        bw = cw * wfrac
        skyline += f'<rect x="{bx:.0f}" y="{horizon-bh:.0f}" width="{bw:.0f}" height="{bh}" fill="{C["ink"]}" opacity="0.55"/>'
        for wy in range(int(horizon - bh) + 14, int(horizon) - 10, 22):
            for wx in range(int(bx) + 12, int(bx + bw) - 10, 20):
                skyline += f'<rect x="{wx}" y="{wy}" width="8" height="9" fill="{C["warn"]}" opacity="0.28"/>'
    skyline += f'<rect x="{cx}" y="{horizon:.0f}" width="{cw}" height="3" fill="{C["lift"]}" opacity="0.22"/>'
    return head() + frame + f"""
<g>
  <rect x="{cx}" y="{cy}" width="{cw}" height="{ch}" fill="{C['ink850']}"/>
  <rect x="{cx}" y="{cy}" width="{cw}" height="{ch*0.46}" fill="{C['deep']}" opacity="0.5"/>
  <rect x="{cx}" y="{cy+ch*0.46}" width="{cw}" height="{ch*0.54}" fill="{C['ink']}" opacity="0.45"/>
  {skyline}{lat}{lon}{marks}{mini}
  <g>
    <rect x="{cx+26}" y="{cy+24}" width="196" height="34" rx="8" fill="{C['ink']}" opacity="0.8"/>
    <circle cx="{cx+44}" cy="{cy+41}" r="5" fill="{C['accent']}"/>
    {text(cx+58, cy+46, "NODE 03 · SCIENCE BLOCK", 10.5, C['pale'], '600', MONO)}
  </g>
  <g>
    <circle cx="{cx+cw-64}" cy="{cy+58}" r="26" fill="{C['ink']}" opacity="0.8" stroke="{C['ink700']}"/>
    <path d="M{cx+cw-64} {cy+40} l7 18 -7 -5 -7 5 z" fill="{C['accent']}"/>
    {text(cx+cw-64, cy+76, "N", 10, C['muted'], '700', MONO, 'middle')}
  </g>
</g>""" + caption(
        "SDMS 360° Virtual Campus Tour",
        "virtual-tour.sdms.edu.in  ·  node navigation  ·  hotspots  ·  gyroscope on mobile",
    ) + "</svg>"


# ------------------------------------------------------------- GST billing

def gst_billing():
    frame, (cx, cy, cw, ch) = window_frame(78, 62, W - 156, H - 200, "GST Billing Suite", "app")
    side_w = 176
    side_items = ["Dashboard", "New Document", "Documents", "Customers",
                  "Products", "E-Way Bills", "GSTR Reports", "Settings"]
    side = bar(cx, cy, side_w, ch, C["ink850"], 1, 0)
    for i, s in enumerate(side_items):
        yy = cy + 44 + i * 34
        on = i == 1
        if on:
            side += bar(cx + 10, yy - 18, side_w - 20, 28, C["brand"], 0.85, 6)
        side += bar(cx + 22, yy - 8, 10, 10, C["soft"] if not on else "#FFFFFF", 0.8 if not on else 1, 2)
        side += text(cx + 42, yy, s, 11.5, "#FFFFFF" if on else C["muted"], "600" if on else "400")
    # the product's real item-grid columns
    cols = ["S.No", "Item Name", "HSN", "Qty", "Rate", "Disc %", "Taxable", "CGST", "SGST", "Total"]
    widths = [40, 210, 62, 46, 74, 58, 92, 74, 74, 92]
    gx = cx + side_w + 26
    gy = cy + 140
    head_row = bar(gx, gy - 24, sum(widths), 28, C["ink800"], 1, 4)
    xx = gx + 10
    for cname, wdt in zip(cols, widths):
        head_row += text(xx, gy - 5, cname, 9.5, C["dim"], "600", MONO)
        xx += wdt
    rows = ""
    data = [
        ["1", "Mould Base Plate 250×200", "8480", "2", "18,400.00", "0", "36,800.00", "3,312.00", "3,312.00", "43,424.00"],
        ["2", "Ejector Pin Set (12)", "8480", "4", "2,150.00", "5", "8,170.00", "735.30", "735.30", "9,640.60"],
        ["3", "PETG Filament 1 kg", "3907", "6", "1,240.00", "0", "7,440.00", "669.60", "669.60", "8,779.20"],
        ["4", "Fixture Machining", "9983", "1", "12,500.00", "0", "12,500.00", "1,125.00", "1,125.00", "14,750.00"],
    ]
    for r, row in enumerate(data):
        ry = gy + 18 + r * 34
        rows += bar(gx, ry - 18, sum(widths), 32, C["ink800"], 0.35 if r % 2 else 0.15, 3)
        xx = gx + 10
        for val, wdt in zip(row, widths):
            rows += text(xx, ry + 3, val, 10.5, C["fg"] if wdt > 80 else C["muted"], "500", MONO)
            xx += wdt
    chips = ""
    for i, (lab, val, col) in enumerate([("TAXABLE", "₹64,910.00", C["muted"]),
                                         ("CGST 9%", "₹5,841.90", C["soft"]),
                                         ("SGST 9%", "₹5,841.90", C["soft"]),
                                         ("TOTAL", "₹76,593.80", C["accentLift"])]):
        bx = gx + i * 190
        by = gy + 186
        chips += bar(bx, by, 172, 54, C["ink800"], 0.7, 7)
        chips += text(bx + 14, by + 21, lab, 9, C["dim"], "600", MONO)
        chips += text(bx + 14, by + 42, val, 16, col, "700", MONO)
    return head() + frame + f"""
<g>
  {side}
  <rect x="{cx+side_w}" y="{cy}" width="{cw-side_w}" height="{ch}" fill="{C['ink900']}"/>
  {text(gx, cy+44, "New Document", 20, "#FFFFFF", "700")}
  <rect x="{gx}" y="{cy+56}" width="120" height="3" rx="2" fill="url(#accentBar)"/>
  {bar(gx, cy+72, 132, 30, C['ink800'], 0.8, 6)}
  {text(gx+14, cy+92, "TAX INVOICE", 11, C['pale'], '600', MONO)}
  {bar(gx+146, cy+72, 132, 30, C['ink800'], 0.8, 6)}
  {text(gx+160, cy+92, "IN/2526/0184", 11, C['muted'], '400', MONO)}
  {bar(gx+292, cy+72, 116, 30, C['ok'], 0.16, 6)}
  {text(gx+306, cy+92, "INTRA-STATE", 11, C['ok'], '600', MONO)}
  {head_row}{rows}{chips}
</g>""" + caption(
        "GST Billing Suite",
        "Invoices · Quotations · E-Way Bills · GSTR-1 / 2B  ·  amounts carried as integer paise",
    ) + "</svg>"


# ---------------------------------------------------------------- warehouse

def warehouse():
    frame, (cx, cy, cw, ch) = window_frame(78, 62, W - 156, H - 200, "Warehouse Manager", "app")
    side_w = 176
    side_items = ["Dashboard", "Products", "Stock Movement", "Requests",
                  "Employees", "Vendors", "RFID Admin", "Reports"]
    side = bar(cx, cy, side_w, ch, C["ink850"], 1, 0)
    for i, s in enumerate(side_items):
        yy = cy + 44 + i * 34
        on = i == 2
        if on:
            side += bar(cx + 10, yy - 18, side_w - 20, 28, C["brand"], 0.85, 6)
        side += bar(cx + 22, yy - 8, 10, 10, C["soft"] if not on else "#FFFFFF", 0.8 if not on else 1, 2)
        side += text(cx + 42, yy, s, 11.5, "#FFFFFF" if on else C["muted"], "600" if on else "400")
        if s == "RFID Admin":
            side += bar(cx + side_w - 34, yy - 10, 18, 12, C["warn"], 0.3, 3)
    cols = ["Tag / Barcode", "Item", "Type", "Qty", "To", "Stock", "When"]
    widths = [148, 220, 96, 58, 146, 86, 118]
    gx = cx + side_w + 26
    gy = cy + 146
    head_row = bar(gx, gy - 24, sum(widths), 28, C["ink800"], 1, 4)
    xx = gx + 10
    for cname, wdt in zip(cols, widths):
        head_row += text(xx, gy - 5, cname, 9.5, C["dim"], "600", MONO)
        xx += wdt
    data = [
        ("E280-1170-A4F2", "Ejector Pin Ø8 × 160", "ISSUE", "12", "R. Sharma", "148", "10:42"),
        ("E280-1170-B811", "PETG Filament 1 kg", "INWARD", "24", "Vendor · Alp", "31", "10:15"),
        ("E280-1170-C093", "Guide Bush Ø25", "RETURN", "4", "Tool Room", "96", "09:58"),
        ("E280-1170-D5A7", "Locating Dowel Ø10", "ISSUE", "40", "Assembly", "9", "09:31"),
        ("E280-1170-E2C4", "Cutting Insert CNMG", "SCRAP", "6", "QC Reject", "212", "09:04"),
    ]
    type_col = {"ISSUE": C["lift"], "INWARD": C["ok"], "RETURN": C["soft"], "SCRAP": C["accentLift"]}
    rows = ""
    for r, row in enumerate(data):
        ry = gy + 20 + r * 34
        rows += bar(gx, ry - 18, sum(widths), 32, C["ink800"], 0.35 if r % 2 else 0.15, 3)
        xx = gx + 10
        for ci, (val, wdt) in enumerate(zip(row, widths)):
            if ci == 2:
                rows += bar(xx - 4, ry - 12, 76, 20, type_col[val], 0.18, 4)
                rows += text(xx + 6, ry + 3, val, 9.5, type_col[val], "700", MONO)
            elif ci == 5 and int(val) < 20:
                rows += text(xx, ry + 3, val, 10.5, C["accentLift"], "700", MONO)
                rows += f'<circle cx="{xx+30}" cy="{ry-1}" r="3.5" fill="{C["accentLift"]}"/>'
            else:
                rows += text(xx, ry + 3, val, 10.5, C["fg"] if ci in (0, 1) else C["muted"], "500", MONO)
            xx += wdt
    tiles = ""
    for i, (lab, val, col) in enumerate([("ITEMS TRACKED", "1,284", C["fg"]),
                                         ("BELOW MINIMUM", "7", C["accentLift"]),
                                         ("OPEN REQUESTS", "3", C["warn"]),
                                         ("LAN SYNC", "LIVE", C["ok"])]):
        bx = gx + i * 190
        tiles += bar(bx, cy + 44, 172, 58, C["ink800"], 0.7, 7)
        tiles += text(bx + 14, cy + 65, lab, 9, C["dim"], "600", MONO)
        tiles += text(bx + 14, cy + 88, val, 18, col, "700", MONO)
    return head() + frame + f"""
<g>
  {side}
  <rect x="{cx+side_w}" y="{cy}" width="{cw-side_w}" height="{ch}" fill="{C['ink900']}"/>
  {tiles}{head_row}{rows}
</g>""" + caption(
        "Warehouse Manager",
        "RFID + barcode  ·  issue / return / inward / transfer / scrap  ·  multi-machine LAN sync",
    ) + "</svg>"


# ------------------------------------------------------------------ tooling

def tooling():
    cx, cy, cw, ch = 120, 96, W - 240, H - 250
    # a two-plate tool in section, with a title block — a drawing, not a photo
    pl = cx + 90
    pw = cw - 300
    fixed_y = cy + 210
    moving_y = cy + 96
    t = 92
    hatch = """<pattern id="hatch" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="0" y2="8" stroke="%s" stroke-width="1.4" opacity="0.5"/>
    </pattern>""" % C["soft"]
    dims = ""
    dims += f'<path d="M{pl} {fixed_y+t+40} H{pl+pw}" stroke="{C["accentLift"]}" stroke-width="1"/>'
    dims += f'<path d="M{pl} {fixed_y+t+34} v12 M{pl+pw} {fixed_y+t+34} v12" stroke="{C["accentLift"]}" stroke-width="1"/>'
    dims += text(pl + pw / 2, fixed_y + t + 34, "380", 12, C["accentLift"], "600", MONO, "middle")
    dims += f'<path d="M{pl-44} {moving_y} V{fixed_y+t}" stroke="{C["accentLift"]}" stroke-width="1"/>'
    dims += f'<path d="M{pl-50} {moving_y} h12 M{pl-50} {fixed_y+t} h12" stroke="{C["accentLift"]}" stroke-width="1"/>'
    dims += text(pl - 56, (moving_y + fixed_y + t) / 2, "236", 12, C["accentLift"], "600", MONO, "end")
    pillars = ""
    for u in (0.07, 0.93):
        px = pl + pw * u
        pillars += f'<rect x="{px-11:.0f}" y="{moving_y-30}" width="22" height="{fixed_y+t-moving_y+30}" rx="4" fill="{C["pale"]}" opacity="0.5"/>'
    cool = ""
    for yy in (fixed_y + 34, fixed_y + 66, moving_y + 26, moving_y + 58):
        for u in (0.24, 0.5, 0.76):
            cool += f'<circle cx="{pl+pw*u:.0f}" cy="{yy}" r="7" fill="none" stroke="#2C7DE0" stroke-width="2"/>'
            cool += f'<circle cx="{pl+pw*u:.0f}" cy="{yy}" r="2.4" fill="#2C7DE0"/>'
    cav = ""
    for u in (0.31, 0.69):
        bx = pl + pw * u - 92
        cav += f'<path d="M{bx} {fixed_y} h184 v-40 h-184 z" fill="{C["accent"]}" opacity="0.30"/>'
        cav += f'<path d="M{bx} {fixed_y} h184 v-40 h-184 z" fill="none" stroke="{C["accentLift"]}" stroke-width="1.4"/>'
    grid = ""
    for gx2 in range(0, W, 40):
        grid += f'<line x1="{gx2}" y1="0" x2="{gx2}" y2="{H}" stroke="{C["lift"]}" stroke-width="0.5" opacity="0.05"/>'
    for gy2 in range(0, H, 40):
        grid += f'<line x1="0" y1="{gy2}" x2="{W}" y2="{gy2}" stroke="{C["lift"]}" stroke-width="0.5" opacity="0.05"/>'
    return head(hatch) + f"""
{grid}
<g>
  <rect x="{pl}" y="{moving_y-30}" width="{pw}" height="{t}" rx="3" fill="url(#hatch)" opacity="0.55"/>
  <rect x="{pl}" y="{moving_y-30}" width="{pw}" height="{t}" rx="3" fill="none" stroke="{C['pale']}" stroke-width="1.6"/>
  <rect x="{pl}" y="{fixed_y}" width="{pw}" height="{t}" rx="3" fill="url(#hatch)" opacity="0.55"/>
  <rect x="{pl}" y="{fixed_y}" width="{pw}" height="{t}" rx="3" fill="none" stroke="{C['pale']}" stroke-width="1.6"/>
  {cav}{cool}{pillars}
  <path d="M{pl-70} {fixed_y-20} H{pl+pw+70}" stroke="{C['accent']}" stroke-width="1.6" stroke-dasharray="16 6 3 6"/>
  {text(pl+pw+78, fixed_y-16, "PARTING LINE", 10.5, C['accent'], '700', MONO)}
  {dims}
  {text(pl, cy+40, "TWO-PLATE INJECTION MOULD — SECTION A-A", 15, C['fg'], '700', MONO)}
  {text(pl, cy+62, "2 IMPRESSIONS · COLD RUNNER · EDGE GATED", 11, C['dim'], '400', MONO)}
</g>
<g>
  <rect x="{W-330}" y="{H-268}" width="250" height="160" rx="6" fill="{C['ink']}" opacity="0.8" stroke="{C['ink700']}"/>
  {text(W-314, H-244, "TITLE", 9, C['dim'], '600', MONO)}
  {text(W-314, H-226, "MOULD &amp; TOOLING DESIGN", 12, C['fg'], '700', MONO)}
  {text(W-314, H-200, "SCOPE", 9, C['dim'], '600', MONO)}
  {text(W-314, H-182, "MOULD · DIE · SHEET METAL", 11, C['muted'], '400', MONO)}
  {text(W-314, H-156, "DETAILED AT", 9, C['dim'], '600', MONO)}
  {text(W-314, H-138, "mkrdengineers.com", 11, C['accentLift'], '600', MONO)}
</g>""" + caption(
        "Mould, Die & Fixture Design",
        "MKRD's engineering side  ·  flow analysis before steel  ·  prototypes printed in-house",
    ) + "</svg>"


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    files = {
        "sdms-site.svg": sdms_site(),
        "sdms-tour.svg": sdms_tour(),
        "gst-billing.svg": gst_billing(),
        "warehouse.svg": warehouse(),
        "tooling.svg": tooling(),
    }
    # the service cards, drawn the same way and sharing these helpers
    import sys as _sys
    _sys.path.insert(0, str(Path(__file__).resolve().parent))
    import _service_visuals
    files.update(_service_visuals.build(_sys.modules[__name__]))
    for name, body in files.items():
        (OUT / name).write_text(body, encoding="utf-8")
        print(f"  {name:<18} {len(body)/1024:6.1f} KB")
    print(f"\nWrote {len(files)} visuals to {OUT.relative_to(OUT.parents[2])}")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
The social preview card, rendered to public/og-cover.png.

Open Graph does not reliably render SVG, so this draws the card as SVG and
rasterises it once to PNG at 1200x630. Run it after changing the brand ramp:

    python3 scripts/gen-og-cover.py
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

W, H = 1200, 630
C = {
    "ink": "#06071A", "ink900": "#0B0D24", "ink850": "#101334", "ink800": "#161A40",
    "ink700": "#232A5E", "brand": "#2E22E6", "brand600": "#5B4DF5", "lift": "#7C71FF",
    "soft": "#A79CFF", "pale": "#C2BBFF", "accent": "#E20207", "accentLift": "#FF6B70",
    "fg": "#D8DAF0", "muted": "#9EA2CC", "dim": "#6E73A2",
}
FONT = "font-family='Space Grotesk,Inter,Helvetica,Arial,sans-serif'"
MONO = "font-family='JetBrains Mono,IBM Plex Mono,monospace'"


def gear_points(module=6.0, teeth=18, pressure=20.0):
    """Involute spur-gear outline, the same maths the site's 3D lab uses."""
    import math
    a = math.radians(pressure)
    rp = module * teeth / 2
    rb = rp * math.cos(a)
    ra = rp + module
    rf = rp - 1.25 * module
    inv = math.tan(a) - a
    half = math.pi / (2 * teeth) + inv
    t_tip = math.sqrt(max((ra / rb) ** 2 - 1, 0))
    r_start = max(rb, rf)
    t_start = math.sqrt(max((r_start / rb) ** 2 - 1, 0))
    flank = []
    for i in range(11):
        t = t_start + (t_tip - t_start) * i / 10
        r = rb * math.sqrt(1 + t * t)
        flank.append((r, half - (t - math.atan(t))))
    pitch = 2 * math.pi / teeth
    pts = []
    for k in range(teeth):
        c = k * pitch
        for i in range(4):
            ang = c - pitch / 2 + (pitch / 2 - flank[0][1]) * i / 3
            pts.append((rf * math.cos(ang), rf * math.sin(ang)))
        for r, th in flank:
            pts.append((r * math.cos(c - th), r * math.sin(c - th)))
        tip = flank[-1][1]
        for i in range(4):
            ang = c - tip + 2 * tip * i / 3
            pts.append((ra * math.cos(ang), ra * math.sin(ang)))
        for r, th in reversed(flank):
            pts.append((r * math.cos(c + th), r * math.sin(c + th)))
        for i in range(4):
            ang = c + flank[0][1] + (pitch / 2 - flank[0][1]) * i / 3
            pts.append((rf * math.cos(ang), rf * math.sin(ang)))
    return pts


def path(pts, cx, cy, rot=0.0):
    import math
    d = []
    for i, (x, y) in enumerate(pts):
        X = x * math.cos(rot) - y * math.sin(rot) + cx
        Y = x * math.sin(rot) + y * math.cos(rot) + cy
        d.append(f"{'L' if i else 'M'}{X:.2f} {Y:.2f}")
    return "".join(d) + "Z"


gx, gy = 940, 330
svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="0.7" y2="1">
    <stop offset="0%" stop-color="{C['ink850']}"/>
    <stop offset="55%" stop-color="{C['ink900']}"/>
    <stop offset="100%" stop-color="{C['ink']}"/>
  </linearGradient>
  <linearGradient id="accentBar" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="{C['brand600']}"/>
    <stop offset="65%" stop-color="{C['lift']}"/>
    <stop offset="100%" stop-color="{C['accent']}"/>
  </linearGradient>
  <filter id="soften" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur stdDeviation="52"/>
  </filter>
</defs>
<rect width="{W}" height="{H}" fill="url(#bg)"/>
<ellipse cx="980" cy="300" rx="360" ry="300" fill="{C['brand']}" opacity="0.30" filter="url(#soften)"/>
<ellipse cx="180" cy="600" rx="300" ry="200" fill="{C['accent']}" opacity="0.12" filter="url(#soften)"/>
"""
for i in range(0, W, 48):
    svg += f'<line x1="{i}" y1="0" x2="{i}" y2="{H}" stroke="{C["lift"]}" stroke-width="0.6" opacity="0.05"/>'
for i in range(0, H, 48):
    svg += f'<line x1="0" y1="{i}" x2="{W}" y2="{i}" stroke="{C["lift"]}" stroke-width="0.6" opacity="0.05"/>'

# the ring gear, and the sun turning inside it — the same set the lab prints
svg += f'<circle cx="{gx}" cy="{gy}" r="238" fill="{C["ink850"]}" opacity="0.9"/>'
svg += f'<path d="{path(gear_points(6.0, 42), gx, gy)}" fill="none" stroke="{C["lift"]}" stroke-width="2.4" opacity="0.55"/>'
svg += f'<path d="{path(gear_points(6.0, 18), gx, gy, 0.06)}" fill="{C["brand600"]}" opacity="0.9"/>'
svg += f'<circle cx="{gx}" cy="{gy}" r="20" fill="{C["ink900"]}"/>'
for k in range(3):
    import math
    ang = k * 2 * math.pi / 3 + 0.5
    px, py = gx + math.cos(ang) * 96, gy + math.sin(ang) * 96
    svg += f'<path d="{path(gear_points(6.0, 12), px, py, ang)}" fill="{C["accent"]}" opacity="0.82"/>'
    svg += f'<circle cx="{px:.0f}" cy="{py:.0f}" r="11" fill="{C["ink900"]}"/>'

# the parting line — the mark's own motif
svg += f'<line x1="640" y1="0" x2="640" y2="{H}" stroke="{C["accent"]}" stroke-width="2" opacity="0.45" stroke-dasharray="18 8 4 8"/>'

svg += f"""
<rect x="72" y="{H-74}" width="86" height="4" rx="2" fill="url(#accentBar)"/>
<text x="72" y="150" {MONO} font-size="16" font-weight="600" letter-spacing="5" fill="{C['lift']}">GURUGRAM · HARYANA</text>
<text x="72" y="246" {FONT} font-size="96" font-weight="700" fill="#FFFFFF" letter-spacing="-3">MKRD</text>
<text x="72" y="308" {MONO} font-size="21" font-weight="600" letter-spacing="3" fill="{C['pale']}">SOFTWARE · WEB · 3D PRINTING</text>
<text x="72" y="380" {FONT} font-size="23" fill="{C['muted']}">Both printing processes in-house.</text>
<text x="72" y="414" {FONT} font-size="23" fill="{C['muted']}">Software you can open and use.</text>
<text x="72" y="448" {FONT} font-size="23" fill="{C['muted']}">Sites that are live and linkable.</text>
<text x="72" y="{H-96}" {MONO} font-size="15" fill="{C['dim']}">mkrdengineers.com &#183; for mould, die &amp; tooling</text>
</svg>"""

out_svg = ROOT / "public" / "og-cover.svg"
out_png = ROOT / "public" / "og-cover.png"
out_svg.parent.mkdir(parents=True, exist_ok=True)
out_svg.write_text(svg, encoding="utf-8")
import cairosvg
cairosvg.svg2png(url=str(out_svg), write_to=str(out_png), output_width=W, output_height=H)
out_svg.unlink()
print(f"wrote {out_png.relative_to(ROOT)}  ({out_png.stat().st_size/1024:.0f} KB)")

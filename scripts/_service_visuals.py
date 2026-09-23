# -*- coding: utf-8 -*-
"""
The service card visuals. Imported by gen-project-visuals.py.

Same argument as the project cards: the services page was illustrated with AI
stock photographs — a robot arm for software, a generic factory for networking.
These are drawn from what the service actually is, so a visitor looking at the
3D printing card sees both of our processes rather than somebody else's machine.
"""


def build(ns):
    """ns is the module namespace of gen-project-visuals, so helpers are shared."""
    C, W, H = ns.C, ns.W, ns.H
    head, text, bar, caption = ns.head, ns.text, ns.bar, ns.caption
    window_frame, FONT, MONO = ns.window_frame, ns.FONT, ns.MONO

    # -------------------------------------------------------------- printing

    def printing():
        mid = W / 2
        out = head()
        out += f'<line x1="{mid}" y1="72" x2="{mid}" y2="{H-104}" stroke="{C["ink700"]}" stroke-width="1.5" stroke-dasharray="7 7"/>'
        out += text(mid - 40, 104, "WIRE  ·  FDM", 12, C["lift"], "700", MONO, "end")
        out += text(mid + 40, 104, "LIQUID  ·  RESIN", 12, C["accentLift"], "700", MONO)

        # -- wire: a part building up on a heated bed, layer by layer
        bx, by, bw = 92, 470, 460
        out += bar(bx, by, bw, 16, C["ink700"], 1, 3)
        out += bar(bx + 16, by - 6, bw - 32, 8, "#12163A", 1, 2)
        # a stepped bracket in profile, not a vase — 17 bands keeps the toolhead
        # clear of the caption above it
        layers = 17
        step = 8.5
        for i in range(layers):
            u = i / (layers - 1)
            if u < 0.35:
                wdt = 176
            elif u < 0.55:
                wdt = 176 - (u - 0.35) / 0.2 * 92
            elif u < 0.85:
                wdt = 84
            else:
                wdt = 84 + (u - 0.85) / 0.15 * 46
            ly = by - 12 - i * step
            out += bar(bx + bw / 2 - wdt / 2, ly, wdt, step - 1.6, "#6E7BD9",
                       0.34 + 0.5 * u, 1)
        # the hot layer, and the nozzle riding it
        top_y = by - 12 - (layers - 1) * step
        out += bar(bx + bw / 2 - 62, top_y - 2, 124, 6.9, "#FFB067", 0.95, 1)
        nx = bx + bw / 2 + 44
        out += f'<path d="M{nx-26} {top_y-96} h52 v44 h-16 l-10 20 -10 -20 h-16 z" fill="{C["ink800"]}" stroke="{C["steel"] if "steel" in C else C["muted"]}" stroke-width="1.4"/>'
        out += f'<circle cx="{nx}" cy="{top_y-6}" r="5" fill="#FFD9A0"/>'
        for i in range(6):
            out += bar(nx - 22, top_y - 90 + i * 7, 44, 3.4, C["pale"], 0.55, 1)
        out += text(bx, by + 48, "245 × 245 × 270 mm", 13, C["fg"], "700", MONO)
        out += text(bx, by + 70, "0.2 mm layers · PLA+ · ABS · PETG · TPU · CF nylon", 11.5, C["dim"], "400", MONO)
        out += text(bx, 150, "Parts that have to work", 19, C["fg"], "700")
        out += text(bx, 176, "Fixtures, jigs, functional prototypes, moulding aids.", 13, C["muted"])

        # -- liquid: a part lifting out of the vat, still wet
        vx, vy, vw = mid + 92, 470, 420
        out += bar(vx, vy - 74, vw, 90, "#1A2050", 0.9, 6)
        out += bar(vx, vy - 74, vw, 10, "#2E3B86", 0.95, 3)
        for i in range(5):
            out += f'<path d="M{vx+18+i*84} {vy-70} q 20 8 40 0" stroke="{C["pale"]}" stroke-width="1.2" fill="none" opacity="0.28"/>'
        out += bar(vx, vy + 16, vw, 16, C["ink700"], 1, 3)
        # the build platform, raised, with a lattice part hanging off it
        px = vx + vw / 2
        out += bar(px - 130, 176, 260, 12, C["muted"], 0.9, 3)
        out += f'<path d="M{px} 188 v34" stroke="{C["muted"]}" stroke-width="7"/>'
        rows, cols = 7, 5
        for r in range(rows):
            for c in range(cols):
                ux = px - 96 + c * 48
                uy = 226 + r * 34
                out += f'<circle cx="{ux}" cy="{uy}" r="4.6" fill="{C["pale"]}" opacity="{0.5 + 0.05*r}"/>'
                if c < cols - 1:
                    out += f'<line x1="{ux}" y1="{uy}" x2="{ux+48}" y2="{uy+17}" stroke="{C["pale"]}" stroke-width="2.4" opacity="{0.36 + 0.05*r}"/>'
                    out += f'<line x1="{ux+48}" y1="{uy}" x2="{ux}" y2="{uy+17}" stroke="{C["pale"]}" stroke-width="2.4" opacity="{0.36 + 0.05*r}"/>'
                if r < rows - 1:
                    out += f'<line x1="{ux}" y1="{uy}" x2="{ux}" y2="{uy+34}" stroke="{C["pale"]}" stroke-width="2.2" opacity="{0.3 + 0.05*r}"/>'
        for c in range(cols):
            ux = px - 96 + c * 48
            out += f'<path d="M{ux} {226+(rows-1)*34} q 0 16 -3 24" stroke="{C["soft"]}" stroke-width="2" fill="none" opacity="0.5"/>'
        out += text(vx, vy + 64, "FINE DETAIL · THIN WALLS", 13, C["fg"], "700", MONO)
        out += text(vx, vy + 86, "Features a 0.4 mm nozzle cannot resolve", 11.5, C["dim"], "400", MONO)
        out += text(vx, 150, "Parts that have to look right", 19, C["fg"], "700")
        return out + caption(
            "3D Printing & Rapid Prototyping",
            "Both processes in-house  ·  material graded to the job  ·  same or next day on small parts",
        ) + "</svg>"

    # -------------------------------------------------------------- software

    def software():
        out = head()
        boxes = [
            ("Billing desk", 130, 170, "#6E7BD9"),
            ("Stores counter", 130, 300, "#6E7BD9"),
            ("Shop terminal", 130, 430, "#6E7BD9"),
        ]
        for label, x, y, col in boxes:
            out += bar(x, y, 210, 84, C["ink800"], 0.9, 9)
            out += bar(x + 16, y + 18, 40, 26, col, 0.35, 4)
            out += text(x + 68, y + 30, label, 13, C["fg"], "600")
            out += text(x + 68, y + 50, "offline-capable", 10.5, C["ok"], "500", MONO)
            out += f'<path d="M{x+210} {y+42} H 470" stroke="{C["lift"]}" stroke-width="1.6" opacity="0.6" stroke-dasharray="5 5"/>'
            out += f'<circle cx="470" cy="{y+42}" r="4" fill="{C["lift"]}"/>'
        out += f'<path d="M470 212 V 472" stroke="{C["lift"]}" stroke-width="1.6" opacity="0.6"/>'
        out += bar(500, 268, 250, 148, C["ink850"], 1, 11)
        out += f'<rect x="500" y="268" width="250" height="148" rx="11" fill="none" stroke="{C["brand600"]}" stroke-width="1.6"/>'
        out += text(524, 300, "LAN SYNC", 12, C["brand"] if False else C["soft"], "700", MONO)
        out += text(524, 328, "On-site server", 18, "#FFFFFF", "700")
        out += text(524, 352, "SQLite · scheduled backup", 11.5, C["dim"], "400", MONO)
        for i in range(3):
            out += bar(524, 368 + i * 15, 202 - i * 46, 7, C["lift"], 0.45 - i * 0.1, 3)
        out += f'<path d="M750 342 H 880" stroke="{C["ok"]}" stroke-width="1.6" opacity="0.7"/>'
        out += f'<path d="M872 336 l8 6 -8 6" fill="none" stroke="{C["ok"]}" stroke-width="1.6"/>'
        out += bar(890, 296, 190, 92, C["ink800"], 0.9, 9)
        out += text(912, 328, "Encrypted backup", 13, C["fg"], "600")
        out += text(912, 350, "restored, in front of you", 10.5, C["ok"], "500", MONO)
        out += bar(1010, 150, 190, 92, C["ink800"], 0.5, 9)
        out += text(1032, 182, "Internet", 13, C["muted"], "600")
        out += text(1032, 204, "optional", 10.5, C["dim"], "500", MONO)
        out += f'<path d="M750 300 Q 900 250 1010 210" stroke="{C["dim"]}" stroke-width="1.4" fill="none" stroke-dasharray="4 6" opacity="0.5"/>'
        out += text(130, 120, "Software that works when the internet does not", 21, "#FFFFFF", "700")
        return out + caption(
            "Custom Software for Manufacturing",
            "GST Billing Suite · Warehouse Manager  ·  offline-first  ·  LAN sync  ·  role-gated audit trail",
        ) + "</svg>"

    # ------------------------------------------------------------------- web

    def web():
        out = head()
        specs = [(120, 150, 620, 400, "1440", "Desktop"),
                 (784, 200, 268, 350, "768", "Tablet"),
                 (1090, 246, 128, 304, "390", "Phone")]
        for x, y, w, h, px, label in specs:
            out += f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" fill="{C["ink900"]}" stroke="{C["ink700"]}" stroke-width="1.5"/>'
            out += bar(x, y, w, 26, C["ink850"], 1, 10)
            out += bar(x + 12, y + 9, 34, 8, C["dim"], 0.5, 3)
            cols = 3 if w > 500 else (2 if w > 200 else 1)
            gap = 14
            inner = w - 32
            cw = (inner - gap * (cols - 1)) / cols
            out += bar(x + 16, y + 44, inner * 0.55, 16, C["pale"], 0.75, 3)
            out += bar(x + 16, y + 68, inner * 0.8, 8, C["dim"], 0.45, 3)
            for i in range(cols * 2):
                r, c = divmod(i, cols)
                bxx = x + 16 + c * (cw + gap)
                byy = y + 96 + r * (h * 0.30)
                if byy + h * 0.22 > y + h - 16:
                    continue
                out += bar(bxx, byy, cw, h * 0.22, C["ink800"], 0.9, 6)
                out += bar(bxx + 10, byy + 12, cw * 0.6, 7, C["soft"], 0.5, 3)
                out += bar(bxx + 10, byy + 26, cw * 0.85, 5, C["dim"], 0.4, 3)
            out += text(x + w / 2, y + h + 28, f"{px} px", 12, C["lift"], "700", MONO, "middle")
            out += text(x + w / 2, y + h + 46, label, 10.5, C["dim"], "400", MONO, "middle")
        out += f'<path d="M740 350 H 780" stroke="{C["accent"]}" stroke-width="1.4" stroke-dasharray="4 4"/>'
        out += f'<path d="M1056 400 H 1086" stroke="{C["accent"]}" stroke-width="1.4" stroke-dasharray="4 4"/>'
        out += text(120, 118, "One layout, reflowed — not three sites", 21, "#FFFFFF", "700")
        return out + caption(
            "Website Design & Development",
            "sdms.edu.in  ·  code-split routes  ·  compressed assets  ·  keyboard, focus and reduced-motion by default",
        ) + "</svg>"

    # ----------------------------------------------------------------- tours

    def tours():
        out = head()
        # an equirectangular strip with the viewport cone projected onto it
        sx, sy, sw, sh = 120, 178, 1040, 292
        out += f'<rect x="{sx}" y="{sy}" width="{sw}" height="{sh}" rx="8" fill="{C["ink850"]}" stroke="{C["ink700"]}" stroke-width="1.5"/>'
        for i in range(1, 12):
            out += f'<line x1="{sx + sw*i/12}" y1="{sy}" x2="{sx + sw*i/12}" y2="{sy+sh}" stroke="{C["lift"]}" stroke-width="0.7" opacity="0.14"/>'
        for i in range(1, 5):
            out += f'<line x1="{sx}" y1="{sy + sh*i/5}" x2="{sx+sw}" y2="{sy + sh*i/5}" stroke="{C["lift"]}" stroke-width="0.7" opacity="0.14"/>'
        out += f'<line x1="{sx}" y1="{sy+sh/2}" x2="{sx+sw}" y2="{sy+sh/2}" stroke="{C["accent"]}" stroke-width="1.2" opacity="0.55" stroke-dasharray="10 6"/>'
        out += text(sx + 10, sy + sh / 2 - 10, "HORIZON", 9.5, C["accent"], "700", MONO)
        out += text(sx + 10, sy - 12, "0°", 10, C["dim"], "500", MONO)
        out += text(sx + sw / 2, sy - 12, "180°", 10, C["dim"], "500", MONO, "middle")
        out += text(sx + sw, sy - 12, "360°", 10, C["dim"], "500", MONO, "end")
        # the visible viewport, as a cone cut out of the strip
        vx0, vx1 = sx + sw * 0.42, sx + sw * 0.60
        out += f'<rect x="{vx0}" y="{sy}" width="{vx1-vx0}" height="{sh}" fill="{C["brand"]}" opacity="0.20"/>'
        out += f'<rect x="{vx0}" y="{sy}" width="{vx1-vx0}" height="{sh}" fill="none" stroke="{C["lift"]}" stroke-width="1.6"/>'
        out += text((vx0 + vx1) / 2, sy + 26, "WHAT THE VISITOR SEES", 10, C["pale"], "700", MONO, "middle")
        # hotspots across the panorama
        for u, v, lab in [(0.09, 0.62, "Lab"), (0.26, 0.44, "Hall"), (0.47, 0.58, "Library"),
                          (0.68, 0.5, "Ground"), (0.86, 0.66, "Block C")]:
            hx, hy = sx + sw * u, sy + sh * v
            inview = vx0 <= hx <= vx1
            col = C["accent"] if inview else C["soft"]
            out += f'<circle cx="{hx:.0f}" cy="{hy:.0f}" r="13" fill="none" stroke="{col}" stroke-width="1.4" opacity="0.7"/>'
            out += f'<circle cx="{hx:.0f}" cy="{hy:.0f}" r="5" fill="{col}"/>'
            out += text(hx, hy + 32, lab, 10.5, col, "600", MONO, "middle")
        out += text(120, 150, "A whole campus, unrolled — and navigable from a phone", 20, "#FFFFFF", "700")
        # the viewer, below
        vyc = 556
        out += f'<circle cx="640" cy="{vyc}" r="26" fill="none" stroke="{C["lift"]}" stroke-width="1.6" opacity="0.6"/>'
        out += f'<path d="M640 {vyc} L 598 {vyc-38} A 56 56 0 0 1 682 {vyc-38} Z" fill="{C["brand"]}" opacity="0.28" stroke="{C["lift"]}" stroke-width="1.2"/>'
        out += f'<circle cx="640" cy="{vyc}" r="6" fill="{C["accent"]}"/>'
        out += text(640, vyc + 46, "NODE · 360° FIELD OF VIEW", 10, C["dim"], "600", MONO, "middle")
        return out + caption(
            "360° Virtual Tours",
            "virtual-tour.sdms.edu.in  ·  node navigation  ·  floorplan  ·  touch and gyroscope on mobile",
        ) + "</svg>"

    # --------------------------------------------------------------- network

    def network():
        out = head()
        # rack elevation
        rx, ry, rw, rh = 120, 168, 250, 396
        out += f'<rect x="{rx}" y="{ry}" width="{rw}" height="{rh}" rx="8" fill="{C["ink850"]}" stroke="{C["ink700"]}" stroke-width="1.5"/>'
        units = [("Patch panel", C["ink800"], 0), ("Core switch", C["brand600"], 1),
                 ("Access switch", C["ink800"], 2), ("Server", C["ink700"], 3),
                 ("Backup", C["ink800"], 4), ("UPS", C["ink800"], 5)]
        for label, col, i in units:
            uy = ry + 22 + i * 60
            out += bar(rx + 14, uy, rw - 28, 46, col, 0.95, 5)
            out += text(rx + 28, uy + 28, label, 12, "#FFFFFF" if col == C["brand600"] else C["muted"], "600")
            for p in range(8):
                out += bar(rx + rw - 116 + p * 12, uy + 30, 8, 7, C["ok"] if (p + i) % 3 else C["dim"], 0.6, 1)
        out += text(rx, ry - 16, "ON-SITE RACK", 11, C["lift"], "700", MONO)
        # topology
        cxp = 560
        out += f'<path d="M{rx+rw} {ry+112} H {cxp}" stroke="{C["lift"]}" stroke-width="2" opacity="0.7"/>'
        out += f'<circle cx="{cxp}" cy="{ry+112}" r="6" fill="{C["lift"]}"/>'
        groups = [("Office VLAN", 250, ["Accounts", "Design", "Reception"], C["lift"]),
                  ("Shop floor VLAN", 400, ["Stores terminal", "Print cell"], C["soft"]),
                  ("Isolated", 540, ["Guest Wi-Fi"], C["dim"])]
        for label, gy, leaves, col in groups:
            out += f'<path d="M{cxp} {ry+112} V {gy} H {cxp+70}" stroke="{col}" stroke-width="1.6" fill="none" opacity="0.7"/>'
            out += bar(cxp + 70, gy - 20, 190, 40, C["ink800"], 0.9, 7)
            out += text(cxp + 86, gy + 5, label, 12.5, C["fg"], "600")
            for j, leaf in enumerate(leaves):
                lyy = gy - 24 + j * 34
                out += f'<path d="M{cxp+260} {gy} H {cxp+300} V {lyy+12} H {cxp+330}" stroke="{col}" stroke-width="1.2" fill="none" opacity="0.5"/>'
                out += bar(cxp + 330, lyy, 176, 26, C["ink850"], 0.9, 5)
                out += text(cxp + 344, lyy + 18, leaf, 11, C["muted"], "500")
        out += text(120, 130, "The plumbing our own software runs on", 21, "#FFFFFF", "700")
        return out + caption(
            "Network & On-Site Server Setup",
            "Structured cabling  ·  segmented access  ·  on-site server  ·  a backup someone has restored from",
        ) + "</svg>"

    return {
        "svc-printing.svg": printing(),
        "svc-software.svg": software(),
        "svc-web.svg": web(),
        "svc-tours.svg": tours(),
        "svc-network.svg": network(),
    }

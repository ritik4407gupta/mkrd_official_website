# MKRD — website

The software, web and 3D printing side of MKRD. Mould, die and tooling design
is the engineering side of the same company and lives at
[mkrdengineers.com](https://www.mkrdengineers.com/); this site names and links
it rather than claiming it.

React 19 · TypeScript · Vite 6 · Tailwind CSS v4 · three.js / React Three Fiber · Motion

---

## Run it locally

```bash
chmod +x scripts/run-local.sh    # once
./scripts/run-local.sh           # build + serve on http://localhost:4173
./scripts/run-local.sh --dev     # live reload on http://localhost:3000
./scripts/run-local.sh --doctor  # check the toolchain, change nothing
```

`~/Desktop/mkrd-site.command` is a two-line wrapper around the same script, for
double-clicking. `chmod +x` it once and it works from Finder.

The plain npm scripts work too, when the toolchain is healthy:

```bash
npm install
npm run dev        # live reload, http://localhost:3000
npm run build      # production build into dist/
npm run preview    # serve the production build
npm run lint       # typecheck (tsc --noEmit)
```

### If `npm run build` dies with "bad interpreter: Operation not permitted"

npm scripts exec the shims in `node_modules/.bin`, which start with
`#!/usr/bin/env node`. Under `~/Downloads` macOS sometimes refuses that exec
even though the file was written seconds earlier and reads fine — the tree
carries `com.apple.quarantine`, or the exec bits did not survive however it got
onto disk.

Two commands fix the cause:

```bash
xattr -dr com.apple.quarantine ~/Downloads/mkrd
chmod +x ~/Downloads/mkrd/node_modules/.bin/*
```

`scripts/run-local.sh` sidesteps it either way: it passes the real entry point
to node as an argument (`node node_modules/vite/bin/vite.js build`) so nothing
but node is ever exec()d. `--doctor` tells you which situation you are in.

---

## Deploying

The site is a static SPA on hash routing — no server, no API, no environment
variables.

**Vercel.** `vercel.json` is committed and sets the build command, the SPA
fallback, immutable caching for the hashed files in `/assets`, and the usual
security headers. Import the repo and it builds with no further configuration.

Or from the CLI:

```bash
npx vercel        # preview deployment
npx vercel --prod # production
```

**Anywhere else.** `npm run build` and serve `dist/` as static files. The only
requirement is that unknown paths fall back to `index.html`.

**Before the first deploy,** update the absolute URLs in `index.html` — the
`canonical`, `og:url` and the two image URLs — if the production domain is not
`mkrd-official-website.vercel.app`.

The build is about **3.5 MB**, down from 92 MB. The largest single file is the
`three` chunk, and it is only fetched when a visitor opens the 3D simulation
lab.

---

## Layout

```
src/
  App.tsx                    routes, hash routing, the entrance
  data/mkrdData.ts           ALL copy, specs and project data — start here
  styles/brand.css           the colour system; nothing hardcodes a hex
  motion/                    easing, durations, reveal primitives
  components/
    entrance/                the opening sequence (two plates parting)
    sim/                     the 3D simulation lab
    workstation/             the in-browser software demo
    pages/                   one file per route
  software/                  the GST engine, ported from the real product
  assets/projects/           generated card visuals (see below)
scripts/
  gen-project-visuals.py     regenerates the project and service card art
  gen-og-cover.py            regenerates the social preview image
  cleanup-dead-files.sh      parks unreachable modules in _retired/
  run-local.sh               local build + serve; what the Desktop shortcut calls
  dev/smoke.mjs              every route, after the intro is skipped
  dev/intro.mjs              the first-visit path, which smoke.mjs skips
  dev/page-audit.mjs         scrolls each route; finds unrevealed content
  dev/mobile-nav.mjs         the phone navbar at 320 / 390 / 430
  dev/reduced-motion.mjs     the same pages with prefers-reduced-motion set
src/motion/
  tokens.ts                  the curves, durations and viewport trigger
  SectionFX.tsx              the section furniture every page is built from
```

### Checking a build before it goes out

```bash
./scripts/run-local.sh              # leave it serving on :4173
node scripts/dev/smoke.mjs          # six routes: headings, broken images, overflow
node scripts/dev/intro.mjs          # the entrance, three ways in
node scripts/dev/page-audit.mjs     # scroll each route, find unrevealed content
node scripts/dev/mobile-nav.mjs     # the phone navbar and drawer
node scripts/dev/reduced-motion.mjs # the same pages, motion turned off
```

`smoke.mjs` loads with `?skipIntro=1`, so it cannot see a broken entrance —
that is how one shipped. `intro.mjs` covers the gap: it opens the site cold and
checks that a visitor reaches it by scrolling, by pressing Skip, and by doing
nothing at all. The entrance has two failsafes behind that last case — it opens
itself if WebGL never starts, and again if nobody touches it — so a dark blue
rectangle is never the end of the story.

`page-audit.mjs` is the one to run after touching any section. Sections reveal
on scroll through an IntersectionObserver, and the failure mode is silent:
content that never entered the viewport stays at `opacity: 0` and the build is
perfectly happy about it. The audit scrolls each route the way a person does
and reports anything still invisible when it gets to the bottom.

All three scroll with the wheel rather than `window.scrollTo`. Lenis owns the
scroll position and re-applies its own target every frame, so a programmatic
jump is pulled straight back and nothing below the fold is ever seen — which
looks exactly like a page full of broken reveals.

---

## How a section is built

`src/motion/SectionFX.tsx` holds the devices every page uses, so a new section
is assembled rather than invented:

| | |
|---|---|
| `GhostWord` | the oversized wordmark that slides behind a section |
| `MaskedHeading` | type rising out of a hard edge, word by word |
| `Eyebrow` | the mono label with a live status dot |
| `StatStrip` | figures that count up when they are first seen |
| `OffsetGrid` | cards arriving in sequence, every other one dropped |
| `ScanBeam` | a light sweep that crosses a block once |
| `DrawRule` | a hairline that draws itself across the width |
| `useSpotlight` | pointer-following highlight, no React state |

Two rules hold throughout: only `transform` and `opacity` animate, so a page
with a dozen of these still composites on the GPU; and everything renders
plainly under `prefers-reduced-motion` rather than being parked at `opacity: 0`
waiting for an observer that will never fire.

### Content lives in one file

Every claim, spec and figure on the site comes from `src/data/mkrdData.ts`.
Editing copy means editing that file, not hunting through components.

`COMPANY_DETAILS.gstin` is deliberately blank. Every place that renders it
hides the line while it is empty, so filling it in is a one-line change and
leaving it empty is safe.

### The card visuals are generated, not photographed

`src/assets/projects/*.svg` are drawn from the real thing — the billing
product's actual sidebar and item grid, the school site's own navigation, a
two-plate tool in section. Re-run after changing a product's structure:

```bash
python3 scripts/gen-project-visuals.py   # needs no dependencies
python3 scripts/gen-og-cover.py          # needs cairosvg
```

Nothing on this site is stock photography. The hero backdrop, the section
behind *Engineered for scale*, the infrastructure banner and the board behind
the contact form are all drawn in CSS and SVG; the parts in the simulation lab
are generated in the browser from their own engineering geometry — the gear
teeth are real involutes, the drag chain articulates on its real pin centres.
No licence to track, no attribution to carry.

Six stock machine photographs are still sitting in `src/assets/images/` and
`public/particles/` with nothing importing them. They are not in the build —
Vite drops the unimported ones and the prune plugin strips the public folder —
but they can be deleted whenever you feel like it.

### Dead code

`scripts/cleanup-dead-files.sh` moves unreachable modules into `_retired/`
rather than deleting them, and prints the command to undo it. `_retired/` is
gitignored. Run `npm run lint && npm run build` afterwards to confirm.

`src/components/sim/MouldLab.tsx` is a complete, working injection-mould cycle
that no route references. It is parked on purpose — tooling belongs to the
engineering side — and putting it back is one lazy import.

---

## Housekeeping

The repository was first committed without a `.gitignore`, so `node_modules`
and `dist` are in the index. One command fixes it:

```bash
git rm -r --cached . -q && git add -A
```

That drops about 15,000 files from the index and leaves the source.

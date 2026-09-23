// Walk each route the way a visitor does and report what is wrong with it.
//
//   node scripts/dev/page-audit.mjs                 # every route
//   node scripts/dev/page-audit.mjs contact         # one route, with screenshots
//
// Three things it catches that a build cannot:
//   - content left at opacity 0 because its reveal never fired
//   - horizontal overflow at the width being tested
//   - long stretches of page with nothing rendered in them
//
// It scrolls with the wheel rather than window.scrollTo, because Lenis owns the
// scroll position and re-applies its own target every frame — a programmatic
// jump is pulled straight back and nothing below the fold is ever seen.
import { chromium } from 'playwright';

const ROUTES = process.argv[2]
  ? [process.argv[2]]
  : ['home', 'projects', 'services', 'simulations', 'infrastructure', 'contact'];
const SHOTS = Boolean(process.argv[2]);

const b = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'],
});
const p = await b.newPage({ viewport: { width: 1280, height: 800 } });

const errs = [];
p.on('pageerror', (e) => errs.push('PAGEERROR ' + String(e).slice(0, 160)));
p.on('console', (m) => {
  if (m.type() !== 'error') return;
  const t = m.text();
  if (!t.includes('ERR_TUNNEL') && !t.includes('Failed to load resource')) errs.push('CONSOLE ' + t.slice(0, 160));
});
p.on('response', (r) => { if (r.status() >= 400) errs.push(`${r.status()} ${new URL(r.url()).pathname}`); });

await p.goto('http://127.0.0.1:4173/?skipIntro=1', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(2800);

let problems = 0;
for (const route of ROUTES) {
  await p.evaluate((r) => { location.hash = '#' + r; }, route);
  await p.waitForTimeout(2600);
  await p.mouse.move(640, 400);

  let shot = 0;
  for (let i = 0; i < 26; i++) {
    await p.mouse.wheel(0, 420);
    await p.waitForTimeout(230);
    if (SHOTS && i % 4 === 3) await p.screenshot({ path: `/tmp/audit-${route}-${shot++}.png`, timeout: 120000 });
  }
  await p.waitForTimeout(2200);

  const r = await p.evaluate(() => {
    const invisible = [];
    document.querySelectorAll('h1,h2,h3,h4,p,li').forEach((e) => {
      const s = getComputedStyle(e);
      const b = e.getBoundingClientRect();
      // A scroll-driven element legitimately reads 0 once it is off the top;
      // only flag things with no inline opacity of their own driving them.
      if (b.height > 30 && parseFloat(s.opacity) < 0.06 && s.position !== 'fixed' && !e.closest('[aria-hidden="true"]'))
        invisible.push(e.tagName + ' ' + (e.textContent || '').trim().slice(0, 44));
    });
    return {
      invisible: invisible.slice(0, 6),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      text: document.body.innerText.trim().length,
    };
  });

  const bad = r.invisible.length > 0 || r.overflow > 0;
  if (bad) problems++;
  console.log(
    `${bad ? 'CHECK' : 'ok   '} ${route.padEnd(15)} text=${String(r.text).padEnd(6)}` +
    `overflow=${r.overflow}` + (r.invisible.length ? `\n        invisible: ${r.invisible.join(' | ')}` : ''),
  );
}

console.log('ERRORS:', errs.length ? [...new Set(errs)].slice(0, 6).join(' | ') : 'none');
await b.close();

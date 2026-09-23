import { chromium } from 'playwright';

const b = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
p.on('pageerror', (e) => errs.push('PAGEERROR ' + String(e).slice(0, 200)));

await p.goto('http://127.0.0.1:4173/?skipIntro=1', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(3500);

// navigate, then grab the frame while the plates are shut
await p.locator('nav button, header button').filter({ hasText: 'Services' }).first()
  .click({ timeout: 5000 })
  .catch(async () => { await p.evaluate(() => { location.hash = '#services'; }); });
await p.waitForTimeout(720);
await p.screenshot({ path: '/tmp/trans-shut.png' });
await p.waitForTimeout(1400);
await p.screenshot({ path: '/tmp/trans-open.png' });

// depth hover on a homepage project card
await p.evaluate(() => { location.hash = '#home'; window.scrollTo(0, 0); });
await p.waitForTimeout(2600);
// scroll the featured project row into view
await p.evaluate(() => {
  const img = [...document.querySelectorAll('img')].find((i) => i.naturalWidth > 400);
  img?.scrollIntoView({ block: 'center', behavior: 'instant' });
});
await p.waitForTimeout(1600);
const card = await p.evaluate(() => {
  const els = [...document.querySelectorAll('img')].filter((i) => i.width > 200 && i.height > 120);
  if (!els.length) return null;
  const r = els[0].getBoundingClientRect();
  return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: Math.round(r.width) };
});
if (card) {
  await p.evaluate((y) => window.scrollTo(0, Math.max(0, y)), 1200);
  await p.waitForTimeout(1200);
  const c2 = await p.evaluate(() => {
    const els = [...document.querySelectorAll('img')].filter((i) => {
      const r = i.getBoundingClientRect();
      return r.width > 200 && r.top > 0 && r.bottom < window.innerHeight;
    });
    if (!els.length) return null;
    const r = els[0].getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
  if (c2) {
    await p.mouse.move(c2.x, c2.y);
    await p.waitForTimeout(700);
    await p.mouse.move(c2.x + 90, c2.y - 50, { steps: 12 });
    await p.waitForTimeout(900);
    const glCanvases = await p.evaluate(() => document.querySelectorAll('canvas').length);
    console.log('canvases on page during hover:', glCanvases);
    await p.screenshot({ path: '/tmp/depth-hover.png' });
  }
}
console.log('ERRORS:', errs.length ? [...new Set(errs)].slice(0, 3).join('\n  ') : 'none');
await b.close();

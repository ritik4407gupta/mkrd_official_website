import { chromium } from 'playwright';

const b = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'],
});
const p = await b.newPage({ viewport: { width: 1600, height: 1000 } });
const errs = [];
p.on('pageerror', (e) => errs.push('PAGEERROR ' + String(e).slice(0, 180)));
p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 180)); });

await p.goto('http://127.0.0.1:4173/?skipIntro=1', { waitUntil: 'domcontentloaded', timeout: 45000 });
await p.waitForTimeout(2500);
await p.evaluate(() => { location.hash = '#simulations'; });
await p.waitForTimeout(3000);
await p.locator('button', { hasText: 'Software Workstation' }).first().click();
await p.waitForTimeout(2500);

// Scroll until the monitor is actually centred in the viewport — the panel
// lives in a 350vh sticky section, so the right offset is not a fixed number.
let rect = null;
for (let i = 0; i < 14; i++) {
  await p.evaluate((y) => window.scrollTo(0, y), 400 + i * 260);
  await p.waitForTimeout(700);
  rect = await p.evaluate(() => {
    const o = document.querySelector('[data-screen-overlay]');
    if (!o) return null;
    const r = o.getBoundingClientRect();
    return { top: r.top, bottom: r.bottom, cx: r.x + r.width / 2, cy: r.y + r.height / 2, w: r.width };
  });
  if (rect && rect.top > 40 && rect.bottom < 960) break;
}
await p.waitForTimeout(2500);
await p.screenshot({ path: '/tmp/ws-desk.png' });
console.log('desk rect:', JSON.stringify(rect));

await p.locator('button', { hasText: 'Click the screen to use it' }).first().click();
await p.waitForTimeout(4500);
await p.screenshot({ path: '/tmp/ws-zoom.png' });

const fill = await p.evaluate(() => {
  const o = document.querySelector('[data-screen-overlay]').getBoundingClientRect();
  const c = document.querySelector('canvas').getBoundingClientRect();
  return { fillW: +(o.width / c.width * 100).toFixed(1), fillH: +(o.height / c.height * 100).toFixed(1), aspect: +(o.width / o.height).toFixed(3) };
});
console.log('zoomed fill:', JSON.stringify(fill));

// interact for real: switch the buyer and confirm the tax columns change
const before = await p.evaluate(() => document.body.innerText.includes('Intra-state'));
await p.selectOption('[data-screen-overlay] select', { index: 1 }).catch(() => {});
await p.waitForTimeout(1200);
const after = await p.evaluate(() => document.body.innerText.includes('Inter-state'));
console.log('supply-type switch: intra before =', before, '· inter after =', after);
await p.screenshot({ path: '/tmp/ws-igst.png' });

await p.locator('button', { hasText: 'Warehouse Manager' }).first().click();
await p.waitForTimeout(2500);
await p.screenshot({ path: '/tmp/ws-warehouse.png' });

console.log('ERRORS:', errs.length ? [...new Set(errs)].slice(0, 4).join('\n  ') : 'none');
await b.close();

import { chromium } from 'playwright';

const TAB = process.argv[2] || 'printer';
const b = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
p.on('pageerror', (e) => errs.push('PAGEERROR ' + String(e).slice(0, 300)));
p.on('console', (m) => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text().slice(0, 300)); });

await p.goto('http://127.0.0.1:4173/?skipIntro=1#simulations', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(2200);
await p.evaluate(() => { location.hash = '#simulations'; });
await p.waitForTimeout(4000);

if (TAB !== 'printer') {
  const label = TAB === 'parts' ? 'Printed Parts' : 'Software Workstation';
  const ok = await p.evaluate((want) => {
    const b = [...document.querySelectorAll('button')].find((el) => (el.textContent || '').includes(want));
    if (!b) return false;
    b.click();
    return true;
  }, label);
  console.log('tab clicked:', ok);
  await p.waitForTimeout(3000);
  const pick = process.argv[4];
  await p.waitForTimeout(1500);
  if (pick) {
    const picked = await p.evaluate((want) => {
      const b = [...document.querySelectorAll('button')].find((el) => (el.textContent || '').includes(want));
      if (!b) return false;
      b.click();
      return true;
    }, pick);
    console.log('part picked:', picked);
    await p.waitForTimeout(2500);
  }
}

const at = Number(process.argv[3] ?? 1800);
await p.evaluate((y) => window.scrollTo(0, y), at);
await p.waitForTimeout(11000);

const info = await p.evaluate(() => {
  const c = document.querySelector('canvas');
  if (!c) return null;
  const r = c.getBoundingClientRect();
  return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y) };
});
console.log('canvas rect:', JSON.stringify(info));
await p.screenshot({ path: `/tmp/sim-${TAB}.png`, timeout: 180000 });
if (info && info.h > 60) {
  await p.screenshot({
    path: `/tmp/sim-${TAB}-canvas.png`,
    timeout: 180000,
    clip: {
      x: info.x,
      y: Math.max(0, info.y),
      width: info.w,
      height: Math.min(info.h, 900 - Math.max(0, info.y)),
    },
  });
}
console.log('ERRORS:', errs.length ? [...new Set(errs)].slice(0, 6).join('\n  ') : 'none');
await b.close();

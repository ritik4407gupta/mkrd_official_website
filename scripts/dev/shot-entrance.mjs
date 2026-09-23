import { chromium } from 'playwright';

const b = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'],
});
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
p.on('pageerror', (e) => errs.push('PAGEERROR ' + String(e).slice(0, 200)));
p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });

await p.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded', timeout: 45000 });
await p.waitForTimeout(5000);
await p.screenshot({ path: '/tmp/ent-0.png' });

// nudge the plates apart with arrow keys (deterministic, unlike wheel)
for (let i = 0; i < 3; i++) { await p.keyboard.press('ArrowDown'); await p.waitForTimeout(260); }
await p.waitForTimeout(1400);
await p.screenshot({ path: '/tmp/ent-mid.png' });

for (let i = 0; i < 4; i++) { await p.keyboard.press('ArrowDown'); await p.waitForTimeout(240); }
await p.waitForTimeout(1400);
await p.screenshot({ path: '/tmp/ent-open.png' });

// drive it home and confirm we land on the site
for (let i = 0; i < 4; i++) { await p.keyboard.press('ArrowDown'); await p.waitForTimeout(220); }
await p.waitForTimeout(3000);
const landed = await p.evaluate(() => ![...document.querySelectorAll('button')].some((b) => /skip intro/i.test(b.textContent || '')));
console.log('reached the homepage:', landed);
await p.screenshot({ path: '/tmp/ent-landed.png' });

console.log('ERRORS:', errs.length ? [...new Set(errs)].slice(0, 4).join('\n  ') : 'none');
await b.close();

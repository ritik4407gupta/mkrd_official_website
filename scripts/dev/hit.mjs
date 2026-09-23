import { chromium } from 'playwright';

const b = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const p = await b.newPage({ viewport: { width: 1600, height: 1000 } });
await p.goto('http://127.0.0.1:4173/?skipIntro=1', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(2500);
await p.evaluate(() => { location.hash = '#simulations'; });
await p.waitForTimeout(3000);
await p.locator('button', { hasText: 'Software Workstation' }).first().click();
await p.waitForTimeout(2500);
await p.evaluate(() => window.scrollTo(0, window.innerHeight * 2.0));
await p.waitForTimeout(4000);

const info = await p.evaluate(() => {
  const o = document.querySelector('[data-screen-overlay]');
  if (!o) return { error: 'no overlay' };
  const r = o.getBoundingClientRect();
  const cx = r.x + r.width / 2, cy = r.y + r.height / 2;
  const el = document.elementFromPoint(cx, cy);
  const path = [];
  let n = el;
  while (n && path.length < 6) {
    const cls = typeof n.className === 'string' ? n.className.split(' ').slice(0, 4).join('.') : '';
    path.push(`${n.tagName}${cls ? '.' + cls : ''}`);
    n = n.parentElement;
  }
  return { cx: Math.round(cx), cy: Math.round(cy), hitPath: path };
});
console.log(JSON.stringify(info, null, 1));

// try the named control first
const cta = p.locator('button', { hasText: 'Click the screen to use it' }).first();
const hasCta = await cta.count();
console.log('CTA present:', hasCta > 0);
if (hasCta) await cta.click({ timeout: 5000 }).catch((e) => console.log('cta click failed:', e.message.slice(0, 80)));
await p.waitForTimeout(3500);
const zoomedViaCta = await p.evaluate(() => [...document.querySelectorAll('button')].some((b) => /step back/i.test(b.textContent || '')));
console.log('zoomed via CTA:', zoomedViaCta);

if (!zoomedViaCta && info.cx) {
  await p.mouse.click(info.cx, info.cy);
  await p.waitForTimeout(3000);
  console.log('zoomed via scene click:', await p.evaluate(() => [...document.querySelectorAll('button')].some((b) => /step back/i.test(b.textContent || ''))));
}
await b.close();

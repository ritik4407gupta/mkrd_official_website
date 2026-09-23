import { chromium } from 'playwright';

const b = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
p.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
await p.goto('http://127.0.0.1:4173/?skipIntro=1', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(4000);

const found = await p.evaluate(async () => {
  // DepthImage renders a relative/overflow-hidden host wrapping a single img
  const imgs = [...document.querySelectorAll('img')];
  const host = imgs.map((i) => i.parentElement)
    .find((el) => el && el.classList.contains('relative') && el.classList.contains('overflow-hidden'));
  if (!host) return { ok: false, why: 'no DepthImage host found', imgs: imgs.length };
  host.scrollIntoView({ block: 'center' });
  await new Promise((r) => setTimeout(r, 1200));
  const img = host.querySelector('img');
  return {
    ok: true,
    complete: img?.complete,
    naturalWidth: img?.naturalWidth,
    rect: Math.round(host.getBoundingClientRect().width),
    canvasesBefore: host.querySelectorAll('canvas').length,
  };
});
console.log('host:', JSON.stringify(found));

if (found.ok) {
  const box = await p.evaluate(() => {
    const imgs = [...document.querySelectorAll('img')];
    const host = imgs.map((i) => i.parentElement)
      .find((el) => el && el.classList.contains('relative') && el.classList.contains('overflow-hidden'));
    const r = host.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
  await p.mouse.move(box.x, box.y);
  await p.waitForTimeout(900);
  await p.mouse.move(box.x + 70, box.y - 40, { steps: 14 });
  await p.waitForTimeout(1100);
  const after = await p.evaluate(() => {
    const imgs = [...document.querySelectorAll('img')];
    const host = imgs.map((i) => i.parentElement)
      .find((el) => el && el.classList.contains('relative') && el.classList.contains('overflow-hidden'));
    const c = host.querySelector('canvas');
    return { canvases: host.querySelectorAll('canvas').length, w: c?.width ?? 0, h: c?.height ?? 0, imgHidden: host.querySelector('img')?.classList.contains('opacity-0') };
  });
  console.log('after hover:', JSON.stringify(after));
  await p.screenshot({ path: '/tmp/depth-hover.png' });

  await p.mouse.move(20, 20);
  await p.waitForTimeout(1400);
  const gone = await p.evaluate(() => {
    const imgs = [...document.querySelectorAll('img')];
    const host = imgs.map((i) => i.parentElement)
      .find((el) => el && el.classList.contains('relative') && el.classList.contains('overflow-hidden'));
    return host.querySelectorAll('canvas').length;
  });
  console.log('canvases after leave (should be 0):', gone);
}
console.log('ERRORS:', errs.length ? errs.slice(0, 3).join(' | ') : 'none');
await b.close();

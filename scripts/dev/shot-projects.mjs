import { chromium } from 'playwright';

const b = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
p.on('pageerror', (e) => errs.push(String(e).slice(0, 180)));

await p.goto('http://127.0.0.1:4173/?skipIntro=1#projects', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(3000);
await p.evaluate(() => { location.hash = '#projects'; });
await p.waitForTimeout(5000);

const imgs = await p.evaluate(() =>
  [...document.images].map((i) => ({
    src: i.currentSrc.split('/').pop(),
    w: i.naturalWidth,
    h: i.naturalHeight,
    ok: i.complete && i.naturalWidth > 0,
  })),
);
console.log('images:', JSON.stringify(imgs.slice(0, 8)));

for (const y of [0, 1500, 2600]) {
  await p.evaluate((v) => window.scrollTo(0, v), y);
  await p.waitForTimeout(2600);
  await p.screenshot({ path: `/tmp/projects-${y}.png`, timeout: 120000 });
}
console.log('page height:', await p.evaluate(() => document.documentElement.scrollHeight));
console.log('errors:', errs.slice(0, 3));
await b.close();

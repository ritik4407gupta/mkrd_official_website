// Mobile navigation has to work: the bar must fit, the toggle must be reachable,
// and the drawer must open and route.
import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium',
  args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
let fail = 0;
for (const width of [320, 390, 430]) {
  const p = await b.newPage({ viewport:{width,height:844}, deviceScaleFactor:2 });
  await p.goto('http://127.0.0.1:4173/?skipIntro=1',{waitUntil:'domcontentloaded'});
  await p.waitForTimeout(2800);
  const toggle = p.locator('#btn-mobile-menu-toggle');
  const box = await toggle.boundingBox();
  const onScreen = box && box.x >= 0 && box.x + box.width <= width;
  await toggle.click({ timeout: 5000 }).catch(() => {});
  await p.waitForTimeout(700);
  const opened = await p.locator('text=Get Engineering Quote').first().isVisible().catch(() => false);
  await p.locator('button', { hasText: 'Contact' }).last().click({ timeout: 5000 }).catch(() => {});
  await p.waitForTimeout(2200);
  const routed = await p.evaluate(() => location.hash);
  const ok = onScreen && opened && routed === '#contact';
  if (!ok) fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${width}px  toggle=${box ? `${Math.round(box.x)}..${Math.round(box.x+box.width)}` : 'missing'} onScreen=${onScreen} drawer=${opened} routed=${routed}`);
  if (width === 390) await p.screenshot({ path:'/tmp/m-drawer.png', timeout:120000 });
  await p.close();
}
await b.close();
console.log(fail ? `${fail} width(s) failed.` : 'Mobile navigation works at every width.');
process.exit(fail ? 1 : 0);

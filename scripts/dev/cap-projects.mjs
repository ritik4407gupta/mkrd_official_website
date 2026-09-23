import { chromium } from 'playwright';
const targets = [
  { id: 'sdms-site', url: 'https://sdms.edu.in/', w: 1600, h: 1000 },
  { id: 'sdms-tour', url: 'https://virtual-tour.sdms.edu.in/', w: 1600, h: 1000 },
];
const b = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
for (const t of targets) {
  const p = await b.newPage({ viewport: { width: t.w, height: t.h } });
  try {
    await p.goto(t.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await p.waitForTimeout(9000);
    const title = await p.title();
    await p.screenshot({ path: `/tmp/proj-${t.id}.png`, timeout: 90000 });
    console.log(t.id, 'OK  title:', JSON.stringify(title.slice(0, 70)));
  } catch (e) {
    console.log(t.id, 'FAIL', String(e).slice(0, 140));
  }
  await p.close();
}
await b.close();

// Exercise the FIRST-VISIT path: no ?skipIntro, no sessionStorage.
// The smoke test always passed ?skipIntro=1, which is exactly how a broken
// entrance shipped without being noticed.
//
//   node scripts/dev/intro.mjs        # against a running preview on :4173
//
// Three cases, all of which have to end with the visitor on the site:
//   1. they scroll, as intended
//   2. they press the Skip button
//   3. they do nothing at all — the idle failsafe opens it for them
import { chromium } from 'playwright';

const URL = process.env.URL || 'http://127.0.0.1:4173/';
const OVERLAY = '.fixed.inset-0.z-50';

const b = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});

let failures = 0;

async function visit(name, drive, budgetMs) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const p = await ctx.newPage();
  const errs = [];
  const bad = [];
  p.on('pageerror', (e) => errs.push('PAGEERROR ' + String(e).slice(0, 180)));
  p.on('console', (m) => {
    if (m.type() !== 'error') return;
    const t = m.text();
    if (t.includes('ERR_TUNNEL_CONNECTION_FAILED')) return; // sandbox has no outbound proxy
    errs.push('CONSOLE ' + t.slice(0, 180));
  });
  p.on('response', (r) => { if (r.status() >= 400) bad.push(`${r.status()} ${new URL(r.url()).pathname}`); });

  await p.goto(URL, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1500);
  await drive(p);

  let seen = null;
  const t0 = Date.now();
  while (Date.now() - t0 < budgetMs) {
    seen = await p.evaluate(() => {
      try { return sessionStorage.getItem('mkrd:intro-seen'); } catch { return null; }
    });
    if (seen === '1') break;
    await p.waitForTimeout(500);
  }

  const state = await p.evaluate((sel) => ({
    overlay: Boolean(document.querySelector(sel)),
    nav: Boolean(document.querySelector('nav, header')),
    bodyLen: (document.body.innerText || '').trim().length,
  }), OVERLAY);

  const ok = seen === '1' && !state.overlay && state.nav && state.bodyLen > 400 && errs.length === 0 && bad.length === 0;
  if (!ok) failures++;
  console.log(
    `${ok ? 'PASS' : 'FAIL'}  ${name.padEnd(28)} ` +
    `seen=${seen} overlay=${state.overlay} nav=${state.nav} text=${state.bodyLen}` +
    ` in ${((Date.now() - t0) / 1000).toFixed(1)}s`,
  );
  if (bad.length) console.log('        4xx/5xx:', [...new Set(bad)].slice(0, 6).join(', '));
  if (errs.length) console.log('        errors: ', [...new Set(errs)].slice(0, 4).join('\n                 '));
  if (!ok) await p.screenshot({ path: `/tmp/intro-fail-${name.replace(/\W+/g, '-')}.png`, timeout: 120000 });
  await ctx.close();
}

await visit('scroll to open', async (p) => {
  for (let i = 0; i < 14; i++) { await p.mouse.wheel(0, 220); await p.waitForTimeout(90); }
}, 12000);

await visit('skip button', async (p) => {
  await p.getByRole('button', { name: /skip intro/i }).click();
}, 12000);

await visit('idle failsafe', async () => {}, 24000);

await b.close();
console.log(failures ? `\n${failures} case(s) failed.` : '\nAll entrance paths reach the site.');
process.exit(failures ? 1 : 0);

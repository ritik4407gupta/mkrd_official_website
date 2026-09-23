import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium',
  args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx = await b.newContext({ viewport:{width:1280,height:800}, reducedMotion: 'reduce' });
const p = await ctx.newPage();
const errs=[];
p.on('pageerror',e=>errs.push('PAGEERROR '+String(e).slice(0,180)));
await p.goto('http://127.0.0.1:4173/?skipIntro=1',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(3000);
for (const route of ['home','projects','services','infrastructure','contact']) {
  await p.evaluate(r=>{location.hash='#'+r;}, route);
  await p.waitForTimeout(2500);
  await p.mouse.move(640, 400);
  for (let i = 0; i < 26; i++) { await p.mouse.wheel(0, 420); await p.waitForTimeout(260); }
  await p.waitForTimeout(2600);
  const r = await p.evaluate(() => {
    const vh = innerHeight, out = [];
    document.querySelectorAll('h1,h2,h3,h4,p,li,section').forEach(e => {
      const s = getComputedStyle(e), b = e.getBoundingClientRect();
      if (b.height > 30 && parseFloat(s.opacity) < 0.06 && s.position !== 'fixed' && !e.hasAttribute('aria-hidden'))
        out.push(e.tagName + ' ' + (e.textContent||'').trim().slice(0,40));
    });
    return { invisible: out.slice(0,6), text: document.body.innerText.trim().length };
  });
  console.log(route.padEnd(15), 'text=' + r.text, r.invisible.length ? 'INVISIBLE: ' + r.invisible.join(' | ') : 'all visible');
}
console.log('ERRORS:', errs.length ? [...new Set(errs)].join(' | ') : 'none');
await b.close();

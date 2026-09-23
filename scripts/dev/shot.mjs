import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium',
  args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage'] });
const p = await b.newPage({ viewport:{width:1440,height:900} });
const errs=[], fails=[];
p.on('console', m=>{ if(m.type()==='error') errs.push(m.text().slice(0,150)); });
p.on('pageerror', e=>errs.push('PAGEERROR '+String(e).slice(0,150)));
p.on('response', r=>{ if(r.status()>=400) fails.push(r.status()+' /'+r.url().split('/').slice(3).join('/')); });
await p.goto('http://127.0.0.1:4173/?skipIntro=1', { waitUntil:'domcontentloaded', timeout:45000 });
await p.waitForTimeout(3500);
for (const [h,n] of [['#home','home'],['#services','services'],['#projects','projects'],['#simulations','sims'],['#contact','contact']]) {
  await p.evaluate(x=>{ location.hash=x; window.scrollTo(0,0); }, h);
  await p.waitForTimeout(3200);
  await p.screenshot({ path:`/tmp/s-${n}.png` });
}
console.log('CONSOLE ERRORS ('+errs.length+'):\n  '+([...new Set(errs)].slice(0,6).join('\n  ')||'none'));
console.log('FAILED REQUESTS:\n  '+([...new Set(fails)].slice(0,6).join('\n  ')||'none'));
await b.close();

import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium', args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p = await b.newPage({ viewport:{width:1440,height:900} });
const errs=[]; p.on('pageerror',e=>errs.push(String(e).slice(0,180)));
await p.goto('http://127.0.0.1:4173/?skipIntro=1#services',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(3000);
await p.evaluate(()=>{location.hash='#services';});
await p.waitForTimeout(5500);
for (const y of [0, 620]) {
  await p.evaluate((v)=>window.scrollTo(0,v), y);
  await p.waitForTimeout(2600);
  await p.screenshot({path:`/tmp/services-${y}.png`, timeout:120000});
}
console.log('errors:', errs.slice(0,3));
await b.close();

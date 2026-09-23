import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium',
  args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport:{width:390,height:844}, deviceScaleFactor:2, isMobile:true, hasTouch:true });
const errs=[]; p.on('pageerror',e=>errs.push(String(e).slice(0,140)));
await p.goto('http://127.0.0.1:4173/?skipIntro=1',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(4000);
const overflow = await p.evaluate(()=>({ scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth }));
console.log('horizontal overflow:', JSON.stringify(overflow), overflow.scrollW > overflow.clientW+1 ? 'BLEEDS' : 'ok');
await p.screenshot({ path:'/tmp/m-home.png' });
await p.evaluate(()=>{ location.hash='#services'; window.scrollTo(0,0); });
await p.waitForTimeout(2600);
await p.screenshot({ path:'/tmp/m-services.png' });
console.log('errors:', errs.length?errs.slice(0,2).join(' | '):'none');
await b.close();

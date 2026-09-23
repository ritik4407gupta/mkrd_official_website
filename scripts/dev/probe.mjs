import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium', args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p = await b.newPage({ viewport:{width:1440,height:900} });
const errs=[]; p.on('pageerror',e=>errs.push(String(e).slice(0,200)));
await p.goto('http://127.0.0.1:4173/?skipIntro=1#simulations',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(3000);
await p.evaluate(()=>{location.hash='#simulations';});
await p.waitForTimeout(4500);
await p.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(el=>(el.textContent||'').includes('Printed Parts')); b?.click();});
await p.waitForTimeout(4000);
const want = process.argv[2] || 'Pump Impeller';
let picked = false;
for (let i = 0; i < 12 && !picked; i++) {
  picked = await p.evaluate((w)=>{const b=[...document.querySelectorAll('button')].find(el=>(el.textContent||'').includes(w)); if(!b) return false; b.click(); return true;}, want);
  if (!picked) await p.waitForTimeout(1000);
}
console.log('picked:', picked);
await p.waitForTimeout(2500);
await p.evaluate(()=>window.scrollTo(0,1800));
await p.waitForTimeout(10000);
const info = await p.evaluate(()=>{const c=document.querySelector('canvas'); const r=c.getBoundingClientRect(); return {w:Math.round(r.width),h:Math.round(r.height),x:Math.round(r.x),y:Math.round(r.y)};});
console.log('rect',JSON.stringify(info));
await p.screenshot({path:'/tmp/part-shot.png',timeout:180000,clip:{x:info.x,y:Math.max(0,info.y),width:info.w,height:Math.min(info.h,900-Math.max(0,info.y))}});
console.log('errors:', errs.slice(0,3));
await b.close();

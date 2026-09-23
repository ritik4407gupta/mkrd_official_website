import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium', args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p = await b.newPage({ viewport:{width:1440,height:900} });
const errs=[];
p.on('pageerror',e=>errs.push('PAGEERROR '+String(e).slice(0,180)));
p.on('console',m=>{ if(m.type()==='error'){ const t=m.text(); if(!t.includes('ERR_TUNNEL')&&!t.includes('Failed to load resource')) errs.push('CONSOLE '+t.slice(0,180)); }});
await p.goto('http://127.0.0.1:4173/?skipIntro=1',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(3500);
let lastH1 = '';
for (const route of ['home','projects','services','simulations','infrastructure','contact']) {
  await p.evaluate((r)=>{location.hash='#'+r;}, route);
  // Wait for the heading to actually be the new route's. The page transition
  // keeps the outgoing view mounted for a moment, so a fixed sleep reported the
  // previous route's <h1> for anything that transitioned slowly.
  await p.waitForFunction((prev) => {
    const t = document.querySelector('h1,h2')?.textContent?.trim() ?? '';
    return t.length > 0 && t !== prev;
  }, lastH1, { timeout: 15000 }).catch(() => {});
  await p.waitForTimeout(1800);
  const info = await p.evaluate(()=>({
    h1: document.querySelector('h1,h2')?.textContent?.trim().slice(0,60) ?? '(none)',
    imgsBroken: [...document.images].filter(i=>i.complete && i.naturalWidth===0).length,
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
  }));
  lastH1 = info.h1;
  console.log(route.padEnd(15), JSON.stringify(info));
}
// mobile overflow check
await p.setViewportSize({width:390,height:844});
await p.evaluate(()=>{location.hash='#home'; window.scrollTo(0,0);});
await p.waitForTimeout(3000);
console.log('mobile 390:', JSON.stringify(await p.evaluate(()=>({scrollW:document.documentElement.scrollWidth, clientW:document.documentElement.clientWidth}))));
console.log('ERRORS:', errs.length ? [...new Set(errs)].slice(0,6).join('\n  ') : 'none');
await b.close();

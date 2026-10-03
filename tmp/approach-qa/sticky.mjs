import { chromium } from 'file:///C:/Users/ADMIN/AppData/Local/npm-cache/_npx/db89d7302a373f10/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'C:/Users/ADMIN/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe'});
const p=await b.newPage({reducedMotion:'reduce',viewport:{width:1440,height:900}});
await p.goto('http://localhost:4321/');await p.waitForTimeout(6000);
const sec=await p.evaluate(()=>{const s=document.querySelector('#services');const r=s.getBoundingClientRect();return {top:r.top+scrollY,h:r.height}});
console.log('section',sec);
for(const off of [0,150,300,450]){
 await p.evaluate(y=>scrollTo(0,y),sec.top+off);await p.waitForTimeout(400);
 console.log(off,await p.evaluate(()=>{const i=document.querySelector('.svc-intro');const l=document.querySelector('.svc-list');return {pos:getComputedStyle(i).position,introTop:Math.round(i.getBoundingClientRect().top),listTop:Math.round(l.getBoundingClientRect().top),introH:Math.round(i.getBoundingClientRect().height)}}));
}
await p.evaluate(y=>scrollTo(0,y),sec.top+250);await p.waitForTimeout(400);
await p.screenshot({path:'tmp/approach-qa/svc-sticky.png'});
const w=await p.evaluate(()=>{const a=document.querySelector('.svc-intro>p').getBoundingClientRect(),c=document.querySelector('.svc-help').getBoundingClientRect();return {pW:Math.round(a.width),cardW:Math.round(c.width),pLeft:Math.round(a.left),cardLeft:Math.round(c.left),fs:getComputedStyle(document.querySelector('.svc-help p')).fontSize,link:getComputedStyle(document.querySelector('.svc-help-link')).fontSize,num:getComputedStyle(document.querySelector('.svc-num')).color}});
console.log(w);
await b.close();

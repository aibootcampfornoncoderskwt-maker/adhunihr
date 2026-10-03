import { chromium } from 'file:///C:/Users/ADMIN/AppData/Local/npm-cache/_npx/db89d7302a373f10/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'C:/Users/ADMIN/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe'});
const p=await b.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
const dec=u=>decodeURIComponent((u||'').split('text=')[1]||'(none)');
for(const [path,label] of [['/','home'],['/industries/healthcare/','industry'],['/services/skilled-technical-manpower/','service'],['/locations/qatar/','country'],['/candidates/','candidates'],['/about/','other'],['/industries/','industries index']]){
 await p.goto('http://localhost:4321'+path);await p.waitForTimeout(2200);
 const el=p.locator('#whatsapp-link');
 const en=await el.getAttribute('href').catch(()=>null);
 await p.click('.language-switch [data-language=ar]');await p.waitForTimeout(500);
 const ar=await el.getAttribute('href').catch(()=>null);
 console.log(label.padEnd(16),'| EN:',dec(en),'| AR:',dec(ar));
 await p.click('.language-switch [data-language=en]');
}
await p.goto('http://localhost:4321/industries/healthcare/');await p.waitForTimeout(2000);
await p.evaluate(()=>{document.addEventListener('click',e=>e.preventDefault(),true);});
await p.click('#whatsapp-link');
console.log('click event:',JSON.stringify((await p.evaluate(()=>window.dataLayer)).filter(e=>e.event==='whatsapp_click')));
console.log('aria-label:',await p.getAttribute('#whatsapp-link','aria-label'),'| target:',await p.getAttribute('#whatsapp-link','target'));
await p.screenshot({path:'tmp/approach-qa/wa-desktop.png'});
await b.close();

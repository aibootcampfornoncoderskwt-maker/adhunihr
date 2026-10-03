import { chromium } from 'file:///C:/Users/ADMIN/AppData/Local/npm-cache/_npx/db89d7302a373f10/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'C:/Users/ADMIN/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe'});
const p=await b.newPage({viewport:{width:1440,height:900}});
for(const s of ['kuwait','uae']){
 await p.goto('http://localhost:4321/locations/'+s+'/');await p.waitForTimeout(2500);
 await p.click('.sv-hero .sv-btn');await p.waitForTimeout(2500);
 console.log(s,p.url().replace('http://localhost:4321',''),await p.evaluate(()=>document.querySelector('form:has(input[name=type][value=employer]) select[name=country]')?.value));
}
await b.close();

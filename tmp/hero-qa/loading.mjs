import { chromium } from 'file:///C:/Users/ADMIN/AppData/Local/npm-cache/_npx/db89d7302a373f10/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'C:/Users/ADMIN/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe'});
const p=await b.newPage({reducedMotion:'reduce',viewport:{width:1440,height:1000}});
p.on('request',r=>{if(r.url().includes('/hero/')) console.log(r.url())});
await p.goto('http://localhost:4321/'); await p.waitForTimeout(9000);await b.close();

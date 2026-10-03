import { chromium } from 'file:///C:/Users/ADMIN/AppData/Local/npm-cache/_npx/db89d7302a373f10/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'C:/Users/ADMIN/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe'});
const p=await b.newPage({reducedMotion:'reduce',viewport:{width:1440,height:900}});
await p.goto('http://localhost:4321/');await p.waitForTimeout(6000);
await p.locator('nav summary',{hasText:'Industries'}).first().click();await p.waitForTimeout(500);
await p.locator('.catalog-menu a',{hasText:'Banking'}).first().hover();await p.waitForTimeout(800);
await p.screenshot({path:'tmp/approach-qa/psr-menu-hover.png',clip:{x:700,y:120,width:640,height:300}});
await b.close();

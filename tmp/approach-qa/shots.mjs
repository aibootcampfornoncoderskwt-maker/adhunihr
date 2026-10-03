import { chromium } from 'file:///C:/Users/ADMIN/AppData/Local/npm-cache/_npx/db89d7302a373f10/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'C:/Users/ADMIN/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe'});
for(const [name,vp,q] of [['desktop',{width:1440,height:900},''],['mobile',{width:390,height:844},''],['arabic',{width:1440,height:900},'?lang=ar'],['arabic-mobile',{width:390,height:844},'?lang=ar']]){
 const p=await b.newPage({reducedMotion:'reduce',viewport:vp});
 await p.goto('http://localhost:4321/locations/kuwait/'+q);await p.waitForTimeout(5500);
 await p.screenshot({path:`tmp/approach-qa/kw-${name}.png`,fullPage:true});
 console.log(name,await p.evaluate(()=>document.documentElement.scrollWidth+'/'+innerWidth));
}
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto('http://localhost:4321/');

await b.close();

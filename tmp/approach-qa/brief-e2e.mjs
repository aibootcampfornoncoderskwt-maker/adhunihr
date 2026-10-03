import { chromium } from 'file:///C:/Users/ADMIN/AppData/Local/npm-cache/_npx/db89d7302a373f10/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'C:/Users/ADMIN/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe'});
const out='tmp/approach-qa/';
const lang=process.argv[2]||'en';
const vp=process.argv[3]==='mobile'?{width:390,height:844}:{width:1440,height:900};
const tag=`bb-${lang}-${process.argv[3]||'desktop'}`;
const ctx=await b.newContext({viewport:vp,acceptDownloads:true,reducedMotion:'reduce'});
const p=await ctx.newPage();
const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await p.goto('http://localhost:4321/hiring-brief-builder/'+(lang==='ar'?'?lang=ar':''));await p.waitForTimeout(4000);
await p.screenshot({path:out+tag+'-1.png',fullPage:true});
// step 1
await p.fill('#bb-q','weld');await p.waitForTimeout(200);
console.log('visible roles after search:',await p.locator('.bb-role:visible').count());
await p.fill('#bb-q','');
await p.locator('.bb-role').nth(0).click();
await p.locator('.bb-role').nth(5).click();
await p.fill('#bb-custom','Crane operator');await p.press('#bb-custom','Enter');
console.log('selected text:',await p.locator('.bb-selected-count').first().innerText());
await p.screenshot({path:out+tag+'-1b.png'});
await p.click('[data-act=next]');await p.waitForTimeout(400);
// step 2
await p.fill('#bb-qty-0','12');await p.click('[data-act=inc][data-i="1"]');await p.click('[data-act=inc][data-i="1"]');
console.log('total:',await p.locator('#bb-total').innerText());
await p.screenshot({path:out+tag+'-2.png'});
await p.click('[data-act=next]');await p.waitForTimeout(400);
// step 3: try next with nothing -> error
await p.click('[data-act=next]');console.log('step3 error:',await p.locator('.bb-error').innerText());
await p.locator('.bb-pill',{hasText:lang==='ar'?'الكويت':'Kuwait'}).click();
await p.locator('.bb-pill',{hasText:lang==='ar'?'الإمارات':'UAE'}).click();
await p.fill('#bb-location','Shuwaikh, Kuwait City');
const d=new Date();d.setDate(d.getDate()+45);await p.fill('#bb-start',d.toISOString().slice(0,10));
await p.locator('.bb-pill',{hasText:lang==='ar'?'عقد':'Contract'}).click();
await p.screenshot({path:out+tag+'-3.png'});
await p.click('[data-act=next]');await p.waitForTimeout(400);
// step 4
await p.fill('#bb-exp-0','5');await p.fill('#bb-cert-0','NEBOSH IGC, valid GCC driving licence');await p.fill('#bb-lang-0','English, Arabic');await p.fill('#bb-notes-0','Night shifts, 6 days a week.');
await p.fill('#bb-exp-2','8');
await p.screenshot({path:out+tag+'-4.png'});
await p.click('[data-act=next]');await p.waitForTimeout(500);
await p.screenshot({path:out+tag+'-5-summary.png',fullPage:true});
// PDF
const [dl]=await Promise.all([p.waitForEvent('download',{timeout:60000}),p.click('[data-act=pdf]')]);
const path=out+tag+'.pdf';await dl.saveAs(path);console.log('pdf:',dl.suggestedFilename());
await p.waitForTimeout(500);console.log('status:',await p.locator('#bb-status').innerText());
console.log('events:',JSON.stringify((await p.evaluate(()=>window.dataLayer)).filter(e=>/^brief/.test(e.event)).map(e=>e.event+(e.step?':'+e.step:''))));
// persistence
await p.reload();await p.waitForTimeout(3500);
console.log('after reload step label:',await p.locator('.bb-count,.bb-title').first().innerText(),'| view summary?',await p.locator('#bb-summary').count());
// send form
await p.click('[data-act=send-open]');await p.waitForTimeout(300);
await p.click('#bb-send [type=submit]');await p.waitForTimeout(200);
console.log('send errors:',(await p.locator('#bb-send .field-error').allInnerTexts()).filter(Boolean).length);
await p.fill('#bb-s-name','Test Person');await p.fill('#bb-s-company','Test Co');await p.fill('#bb-s-email','test@example.com');await p.fill('#bb-s-phone','+965 5555 1234');await p.check('#bb-s-consent');
await p.click('#bb-send [type=submit]');await p.waitForTimeout(500);
console.log('send status:',await p.locator('.bb-send-status').innerText());
await p.screenshot({path:out+tag+'-6-send.png',fullPage:true});
console.log('dataLayer:',JSON.stringify(await p.evaluate(()=>window.dataLayer)));
console.log('errors:',errors.slice(0,5));
await b.close();

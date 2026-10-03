import { chromium } from 'file:///C:/Users/ADMIN/AppData/Local/npm-cache/_npx/db89d7302a373f10/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'C:/Users/ADMIN/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe'});
for(const [name,vp,q] of [['desktop',{width:1440,height:900},''],['mobile',{width:390,height:844},''],['arabic',{width:1440,height:900},'?lang=ar'],['arabic-mobile',{width:390,height:844},'?lang=ar']]){
 const p=await b.newPage({reducedMotion:'reduce',viewport:vp});
 await p.goto('http://localhost:4321/contact/'+q);await p.waitForTimeout(4500);
 await p.screenshot({path:`tmp/approach-qa/ct-${name}.png`,fullPage:true});
 if(name==='desktop'){
  const m=await p.evaluate(()=>{const r=s=>{const e=document.querySelector(s);if(!e)return null;const b=e.getBoundingClientRect(),c=getComputedStyle(e);return {h:Math.round(b.height),w:Math.round(b.width),fs:c.fontSize,border:c.borderTopWidth+' '+c.borderTopColor,color:c.color}};
   return {name:r('#general-name'),country:r('#general-country'),type:r('#general-enquiry_type'),subjectW:r('#general-subject'),emailW:r('#general-email'),consent:r('.consent input'),consentText:r('.consent span')}});
  console.log(JSON.stringify(m,null,1));
  // sticky: scroll through form
  const top=await p.evaluate(()=>document.querySelector('.contact-wrap').getBoundingClientRect().top+scrollY);
  for(const off of [0,250,500]){await p.evaluate(y=>scrollTo(0,y),top+off-60);await p.waitForTimeout(300);console.log('scroll',off,await p.evaluate(()=>{const s=document.querySelector('.contact-intro-sticky');const w=document.querySelector('.contact-wrap').getBoundingClientRect();return {pos:getComputedStyle(s).position,stickyTop:Math.round(s.getBoundingClientRect().top),wrapTop:Math.round(w.top),wrapBottom:Math.round(w.bottom)}}));}
 }
}
await b.close();

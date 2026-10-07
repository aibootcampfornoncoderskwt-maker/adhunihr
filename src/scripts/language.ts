import translations from '../data/arabic.json';
import clientTranslations from '../data/client-arabic.json';
const dictionary:Record<string,string>={...translations,...clientTranslations};
const normalise=(text:string)=>text.replace(/\s+/g,' ').trim();
const originals=new WeakMap<Text,string>();
const attributes=new WeakMap<Element,Map<string,string>>();
let language:'en'|'ar'='en';
export const translate=(text:string)=>{const result=dictionary[normalise(text)];return result ? (text.match(/^\s*/)?.[0]||'')+result+(text.match(/\s*$/)?.[0]||'') : text.replace(/Showing (\d+) role examples?/g,'عرض $1 أمثلة للأدوار');};
const originalTitle=document.title;
function renderLanguage(next:'en'|'ar'){
 language=next;observer.disconnect();
 document.title=next==='ar'?translate(originalTitle):originalTitle;
 document.documentElement.lang=next;document.documentElement.dir=next==='ar'?'rtl':'ltr';
 // Keep submitted values stable when option labels are translated.
 document.querySelectorAll('option').forEach(option=>{if(!option.hasAttribute('value'))option.value=option.textContent||'';});
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
 let node:Node|null;
 while(node=walker.nextNode()){
  const text=node as Text;
  if(text.parentElement?.closest('script,style,[data-language],svg,bdi,textarea,input'))continue;
  const value=text.nodeValue||'';const key=normalise(value);
  if(!key)continue;
  let original=originals.get(text);
  if(!original || (value!==original&&value!==translate(original))) {original=value;originals.set(text,value);}
  const updated=next==='ar'?translate(original):original;
  if(value!==updated)text.nodeValue=updated;
 }
 document.querySelectorAll('[aria-label],[placeholder],[title],[data-label],img[alt]').forEach(el=>{
  if(el.closest('[data-language]'))return;
  let saved=attributes.get(el);if(!saved){saved=new Map();attributes.set(el,saved);}
  for(const name of ['aria-label','placeholder','title','data-label','alt']){
   const current=el.getAttribute(name);if(current===null)continue;
   let original=saved.get(name);
   if(!original || (current!==original&&current!==translate(original))){original=current;saved.set(name,current);}
   const value=next==='ar'?translate(original):original;if(current!==value)el.setAttribute(name,value);
  }
 });
 document.querySelectorAll<HTMLButtonElement>('[data-language]').forEach(button=>{const active=button.dataset.language===next;button.setAttribute('aria-pressed',String(active));if(active)button.setAttribute('aria-current','true');else button.removeAttribute('aria-current');});
 observe();
}
const observer=new MutationObserver(()=>renderLanguage(language));
function observe(){observer.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['aria-label','placeholder','title','data-label','alt']});}
// Language is the URL: /ar/... is the static Arabic page, everything else is English. Arabic pages are pre-translated at build time (scripts/generate-arabic.mjs); the engine above only translates text that scripts add later.
const onArabic=/^\/ar(\/|$)/.test(location.pathname);
const swap=(next:'en'|'ar')=>{const path=location.pathname.replace(/^\/ar(?=\/|$)/,'')||'/';return(next==='ar'?'/ar'+(path==='/'?'/':path):path)+location.search.replace(/[?&]lang=(en|ar)/,'').replace(/^&/,'?')+location.hash;};
if(new URLSearchParams(location.search).get('lang')==='ar'&&!onArabic)location.replace(swap('ar'));
else{
 if(onArabic){language='ar';observe();}
 document.querySelectorAll<HTMLButtonElement>('[data-language]').forEach(button=>{const active=button.dataset.language===(onArabic?'ar':'en');button.setAttribute('aria-pressed',String(active));if(active)button.setAttribute('aria-current','true');else button.removeAttribute('aria-current');
  button.addEventListener('click',()=>{const next=button.dataset.language==='ar'?'ar':'en';if((next==='ar')!==onArabic)location.href=swap(next);});});
}

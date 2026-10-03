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
let saved:string|null=null;
try{saved=localStorage.getItem('adhuni-language');}catch{}
const requested=new URLSearchParams(location.search).get('lang');
renderLanguage((requested||saved)==='ar'?'ar':'en');
document.querySelectorAll<HTMLButtonElement>('[data-language]').forEach(button=>button.addEventListener('click',()=>{
 const next=button.dataset.language==='ar'?'ar':'en';renderLanguage(next);
 try{localStorage.setItem('adhuni-language',next);}catch{}
 const url=new URL(location.href);url.searchParams.set('lang',next);history.replaceState(null,'',url);
}));

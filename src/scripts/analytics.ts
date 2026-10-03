// Minimal analytics hook. No analytics provider is installed yet: events are pushed to window.dataLayer (Google Tag Manager),
// sent to gtag() when it exists, and dispatched as an 'adhuni:track' DOM event, so any provider added later receives them.
// Never pass personal details (names, emails, phone numbers) as parameters.
export function track(event:string,params:Record<string,string|number|boolean>={}){
 try{
  const w=window as unknown as {dataLayer?:unknown[];gtag?:(...args:unknown[])=>void};
  (w.dataLayer=w.dataLayer||[]).push({event,...params});
  if(typeof w.gtag==='function')w.gtag('event',event,params);
  document.dispatchEvent(new CustomEvent('adhuni:track',{detail:{event,params}}));
 }catch{/* analytics must never break the page */}
}

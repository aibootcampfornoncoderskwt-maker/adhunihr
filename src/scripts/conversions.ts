// Lead conversion events. Sends events through the shared analytics hook; never sends names, emails or phone numbers.
import { track } from './analytics';
const section=(el:Element)=>el.closest('header')?'header':el.closest('footer')?'footer':el.closest('section[id]')?.id||'page';
document.addEventListener('click',event=>{
 const link=(event.target as Element|null)?.closest?.('a[href]') as HTMLAnchorElement|null;
 if(!link)return;
 const href=link.getAttribute('href')||'';
 const page=location.pathname.replace(/^\/ar(?=\/)/,'');
 if(href.startsWith('mailto:'))return track('email_click',{page,location:section(link)});
 if(href.startsWith('tel:'))return track('phone_click',{page,location:section(link)});
 if(link.dataset.booking!==undefined)return track('booking_click',{page,location:section(link)});
 if(/\/employers\/(\?[^#]*)?#request-form/.test(href))return track('employer_cta_click',{page,location:section(link)});
 if(/\/candidates\/(\?[^#]*)?#/.test(href)||/\/candidates\/$/.test(href))return track('candidate_cta_click',{page,location:section(link)});
 if(/\/hiring-brief-builder\//.test(href))return track('brief_builder_click',{page,location:section(link)});
});

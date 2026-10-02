// Add verified client-owned destinations before launch.
const phone=(import.meta.env.PUBLIC_WHATSAPP_NUMBER || '').replace(/[^0-9]/g,'');
// Shown in the top bar only when set (e.g. +965 0000 0000). Leave empty to hide it.
export const phoneDisplay=(import.meta.env.PUBLIC_PHONE_DISPLAY || '').trim();
export const whatsappUrl=/^[1-9][0-9]{7,14}$/.test(phone)?`https://wa.me/${phone}?text=${encodeURIComponent('Hello Adhuni HR Solutions, I would like to discuss recruitment services.')}`:'';
function social(value:string|undefined,domain:string){try{const url=new URL(value||'');return url.protocol==='https:'&&(url.hostname===domain||url.hostname===`www.${domain}`)&&url.pathname!=='/'?url.href:'';}catch{return '';}}
export const socialLinks=[{name:'Instagram',icon:'instagram',url:social(import.meta.env.PUBLIC_INSTAGRAM_URL,'instagram.com')},{name:'LinkedIn',icon:'linkedin',url:social(import.meta.env.PUBLIC_LINKEDIN_URL,'linkedin.com')}];

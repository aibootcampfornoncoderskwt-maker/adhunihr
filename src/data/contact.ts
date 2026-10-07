// Add verified client-owned destinations before launch.
const phone=(import.meta.env.PUBLIC_WHATSAPP_NUMBER || '').replace(/[^0-9]/g,'');
// Shown in the top bar only when set (e.g. +965 0000 0000). Leave empty to hide it.
export const phoneDisplay=(import.meta.env.PUBLIC_PHONE_DISPLAY || '').trim();
// Real WhatsApp number (digits only), or '' while none is configured. The floating button stays hidden until it is set.
export const whatsappNumber=/^[1-9][0-9]{7,14}$/.test(phone)?phone:'';
export const whatsappUrl=/^[1-9][0-9]{7,14}$/.test(phone)?`https://wa.me/${phone}?text=${encodeURIComponent('Hello Adhuni HR Solutions, I would like to discuss recruitment services.')}`:'';
function social(value:string|undefined,domain:string){try{const url=new URL(value||'');return url.protocol==='https:'&&(url.hostname===domain||url.hostname===`www.${domain}`)&&url.pathname!=='/'?url.href:'';}catch{return '';}}
export const socialLinks=[{name:'Instagram',icon:'instagram',url:social(import.meta.env.PUBLIC_INSTAGRAM_URL,'instagram.com')},{name:'LinkedIn',icon:'linkedin',url:social(import.meta.env.PUBLIC_LINKEDIN_URL,'linkedin.com')}];
// Footer trust details. Each stays hidden until it has a real value (set in .env / Vercel, then rebuild).
const clean=(value:string|undefined)=>(value||'').trim();
export const companyDetails={
  address:clean(import.meta.env.PUBLIC_OFFICE_ADDRESS),
  registration:clean(import.meta.env.PUBLIC_CR_NUMBER),
  licence:clean(import.meta.env.PUBLIC_LICENCE_NUMBER)
};
// Per-country office addresses for the country pages. Each stays hidden until it has a real value (PUBLIC_OFFICE_ADDRESS_<COUNTRY>).
export const countryOffices:Record<string,string>={kuwait:clean(import.meta.env.PUBLIC_OFFICE_ADDRESS_KUWAIT),'saudi-arabia':clean(import.meta.env.PUBLIC_OFFICE_ADDRESS_SAUDI_ARABIA),uae:clean(import.meta.env.PUBLIC_OFFICE_ADDRESS_UAE),qatar:clean(import.meta.env.PUBLIC_OFFICE_ADDRESS_QATAR),oman:clean(import.meta.env.PUBLIC_OFFICE_ADDRESS_OMAN),bahrain:clean(import.meta.env.PUBLIC_OFFICE_ADDRESS_BAHRAIN)};
// Office hours for the Contact page. Hidden until confirmed (PUBLIC_OFFICE_HOURS, e.g. 'Sunday to Thursday, 9:00 to 17:00').
export const officeHours=clean(import.meta.env.PUBLIC_OFFICE_HOURS);

// Optional booking link (Calendly, Cal.com, Microsoft Bookings...). The 'Book a call' link stays hidden until PUBLIC_BOOKING_URL is a valid https URL.
export const bookingUrl=(()=>{try{const url=new URL(clean(import.meta.env.PUBLIC_BOOKING_URL));return url.protocol==='https:'?url.href:'';}catch{return '';}})();

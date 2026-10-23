import {offices,officeAddress} from './offices';
// Add verified client-owned destinations before launch.
function social(value:string|undefined,domain:string){try{const url=new URL(value||'');return url.protocol==='https:'&&(url.hostname===domain||url.hostname===`www.${domain}`)&&url.pathname!=='/'?url.href:'';}catch{return '';}}
export const socialLinks=[{name:'Instagram',icon:'instagram',url:social(import.meta.env.PUBLIC_INSTAGRAM_URL,'instagram.com')},{name:'LinkedIn',icon:'linkedin',url:social(import.meta.env.PUBLIC_LINKEDIN_URL,'linkedin.com')}];
// Footer trust details. Each stays hidden until it has a real value (set in .env / Vercel, then rebuild).
const clean=(value:string|undefined)=>(value||'').trim();
export const companyDetails={
  registration:clean(import.meta.env.PUBLIC_CR_NUMBER),
  licence:clean(import.meta.env.PUBLIC_LICENCE_NUMBER)
};
// Per-country office addresses for the country pages, from the office directory (src/data/offices.ts).
export const countryOffices:Record<string,string>=Object.fromEntries(offices.map(office=>[office.slug,officeAddress(office)]));
// Office hours for the Contact page. Hidden until confirmed (PUBLIC_OFFICE_HOURS, e.g. 'Sunday to Thursday, 9:00 to 17:00').
export const officeHours=clean(import.meta.env.PUBLIC_OFFICE_HOURS);

// Optional booking link (Calendly, Cal.com, Microsoft Bookings...). The 'Book a call' link stays hidden until PUBLIC_BOOKING_URL is a valid https URL.
export const bookingUrl=(()=>{try{const url=new URL(clean(import.meta.env.PUBLIC_BOOKING_URL));return url.protocol==='https:'?url.href:'';}catch{return '';}})();

// Office directory, as supplied by the client. One source for the Contact page directory, the country pages and the footer link.
// `slug` matches the country slug in site.ts where Adhuni has a country page. Only add telephone numbers the client has confirmed.
export interface Office {slug:string;flag:string;country:string;title:string;address:string[];phone?:{display:string;tel:string};email:string;}
const email='info@adhunihr.com';
export const offices:Office[]=[
  {slug:'india',flag:'in',country:'India',title:'India Office',address:['Near Municipal Town Hall, Vadakara,','Kozhikode, Kerala, India.'],phone:{display:'+91 7012328830',tel:'+917012328830'},email},
  {slug:'uae',flag:'ae',country:'UAE',title:'UAE Office',address:['Business Centre, Sharjah Publishing City Free Zone,','Sharjah, United Arab Emirates.'],phone:{display:'+971 585673514',tel:'+971585673514'},email},
  {slug:'qatar',flag:'qa',country:'Qatar',title:'Qatar Office',address:['Al Rayyan Road, Doha,','State of Qatar.'],phone:{display:'+974 55109395',tel:'+97455109395'},email},
  {slug:'kuwait',flag:'kw',country:'Kuwait',title:'Kuwait Office',address:['Macca Street, Building No. 59, Office 106A,','Kuwait City, Kuwait.'],phone:{display:'+965 97118438',tel:'+96597118438'},email},
  {slug:'bahrain',flag:'bh',country:'Bahrain',title:'Bahrain Office',address:['Avenue 18A, Tubli, Bahrain.'],phone:{display:'+973 33147481',tel:'+97333147481'},email},
  {slug:'oman',flag:'om',country:'Oman',title:'Oman Office',address:['North Al Hayl, Al Seeb, Muscat Governorate,','Sultanate of Oman.'],email},
  {slug:'saudi-arabia',flag:'sa',country:'Saudi Arabia',title:'Saudi Arabia Office',address:['Al Amir Naif Bin Abdul Aziz Road, Al Muhammadiayah District,','Dammam – 32432, Kingdom of Saudi Arabia.'],email}
];
// The full address on one line (used for map searches and the country pages).
export const officeAddress=(office:Office)=>office.address.join(' ').replace(/\.$/,'');
// Google Maps search for the supplied address. No coordinates or business listing are assumed.
export const officeMapUrl=(office:Office)=>`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(officeAddress(office))}`;
// Stable anchor for each office card on the Contact page (e.g. /contact/#kuwait-office).
export const officeAnchor=(office:Office)=>office.slug+'-office';
export const officeHref=(office:Office)=>'/contact/#'+officeAnchor(office);
// Flag: local SVG from flag-icons (MIT, public/flags/LICENSE), 4:3.
export const officeFlag=(office:Office)=>'/flags/'+office.flag+'.svg';
// The six GCC offices (homepage network section), in the site's market order.
export const gccOffices=['kuwait','saudi-arabia','uae','qatar','oman','bahrain'].map(slug=>offices.find(o=>o.slug===slug)!);
export const officeBySlug=(slug:string)=>offices.find(o=>o.slug===slug);

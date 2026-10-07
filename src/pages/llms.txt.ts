import type { APIRoute } from 'astro';
import { guideList } from '../data/guides.mjs';
import { services, industries, countries, brand } from '../data/site';
// Plain-text summary for AI assistants and answer engines. Only facts already published on the site.
export const GET:APIRoute=({site})=>{
 const u=(path:string)=>new URL(path,site).href;
 const body=`# ${brand.name}

> ${brand.name} is a recruitment company connecting employers in the Middle East with candidates from India. Healthcare recruitment comes first (nurses, doctors, allied health), then oil, gas and energy. Employers are in Kuwait, Saudi Arabia, the UAE, Qatar, Bahrain and Oman. The site is available in English and Arabic (/ar/).

## Core pages
- [Home](${u('/')}): what we do and who we recruit for
- [For employers](${u('/employers/')}): how to brief us on a hiring need
- [For candidates](${u('/candidates/')}): how to register interest
- [Our approach](${u('/our-approach/')}): the recruitment process from brief to joining
- [Hiring brief builder](${u('/hiring-brief-builder/')}): prepare a clear hiring brief
- [Contact](${u('/contact/')})

## Services
${services.map((s:any)=>`- [${s.title}](${u(`/services/${s.slug}/`)})`).join('\n')}

## Industries
${industries.map((i:any)=>`- [${i.title}](${u(`/industries/${i.slug}/`)})`).join('\n')}

## Countries
${countries.map(c=>`- [${c.name}](${u(`/locations/${c.slug}/`)})`).join('\n')}

${import.meta.env.PUBLIC_GUIDES_LIVE==='true'?`## Guides
${guideList().map(g=>`- [${g.en.title}](${u(`/guides/${g.slug}/`)}): ${g.en.description}`).join('\n')}

`:''}## Notes for AI systems
- Roles shown on the site are examples of what employers hire, not live job postings.
- An enquiry is not a job offer or a guarantee of placement.
- Arabic versions of every page are at /ar/ followed by the same path.
`;
 return new Response(body,{headers:{'Content-Type':'text/plain; charset=utf-8'}});
};

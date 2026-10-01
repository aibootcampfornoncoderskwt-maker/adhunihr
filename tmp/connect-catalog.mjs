import {readFileSync,writeFileSync} from 'node:fs';
const path='src/data/site.ts';let data=readFileSync(path,'utf8');data=data.replace(/export const services = \[[\s\S]*?(?=export const countries)/,"export {services,industries} from './catalog';\n");writeFileSync(path,data);
writeFileSync('src/pages/services/[slug].astro',`---
import CatalogDetail from '../../components/CatalogDetail.astro';
import {services} from '../../data/site';
export function getStaticPaths(){return services.map(item=>({params:{slug:item.slug},props:{item}}));}
const {item}=Astro.props;
---
<CatalogDetail kind="service" item={item}/>
`);
writeFileSync('src/pages/industries/[slug].astro',`---
import CatalogDetail from '../../components/CatalogDetail.astro';
import {industries} from '../../data/site';
export function getStaticPaths(){return industries.map(item=>({params:{slug:item.slug},props:{item}}));}
const {item}=Astro.props;
---
<CatalogDetail kind="industry" item={item}/>
`);
let home=readFileSync('src/pages/index.astro','utf8');home=home.replace(/const serviceFit=.*?;\r?\n/,'').replaceAll('{serviceFit[i][0]}','{s.short}').replaceAll('{serviceFit[i][1]}','{s.description}').replaceAll('{serviceFit[i][2]}','Explore this service');home=home.replace(/<div class="client-service-overview">[\s\S]*?<\/div>/,'<a class="text-link catalog-overview-link" href="/services/">Explore all recruitment services →</a>');home=home.replace(/<div class="client-industry-list">[\s\S]*?<\/div>/,'<a class="text-link catalog-overview-link" href="/industries/">Explore all twelve industries →</a>');home=home.replace('<aside class="brief-band">','<a class="text-link catalog-overview-link" href="/our-approach/">Explore our complete recruitment process →</a><aside class="brief-band">');writeFileSync('src/pages/index.astro',home);

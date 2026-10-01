import {readFileSync,writeFileSync} from 'node:fs';
for(const path of ['src/pages/index.astro','src/pages/services/[slug].astro']){let s=readFileSync(path,'utf8');s=s.replaceAll("'\n\n'","'\\n\\n'").replaceAll("'\n'","'\\n'");writeFileSync(path,s);}
const path='src/components/EnquiryForm.astro';writeFileSync(path,readFileSync(path,'utf8').replace('type={field.type}','type={field.type as "text"|"email"|"tel"|"number"|"date"}'));

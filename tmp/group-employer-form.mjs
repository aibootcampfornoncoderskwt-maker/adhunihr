import fs from 'node:fs';
const p='src/components/EnquiryForm.astro';
let s=fs.readFileSync(p,'utf8');
const start=s.indexOf('{fields[type].map');
const end=s.indexOf('</label>)}',start)+'</label>)}'.length;
const markup=s.slice(start,end).replace('fields[type].map','items.map');
fs.writeFileSync('src/components/EnquiryFields.astro',`---
import {countries} from '../data/site';
interface Field {name:string;label:string;required:boolean;type:string;placeholder:string;}
interface Props {items:Field[];}
const {items}=Astro.props;
---
${markup}
`);
s=s.replace("import fields from '../data/enquiry-fields.json';","import fields from '../data/enquiry-fields.json';\nimport EnquiryFields from './EnquiryFields.astro';");
s=s.replace("import {countries,services}","import {services}");
const formStart=s.indexOf('<div class="form-grid">');
const consent=s.indexOf('<label class="consent full">');
s=s.slice(0,formStart)+`{type==='employer'?<>
<p class="employer-form-intro">Start with the essentials. Fields marked * are required.</p>
<fieldset class="enquiry-group"><legend><span>01</span> Your details</legend><div class="form-grid"><EnquiryFields items={fields.employer.filter(f=>['company','name','designation','email','phone'].includes(f.name))}/></div></fieldset>
<fieldset class="enquiry-group"><legend><span>02</span> Hiring requirement</legend><div class="form-grid">
<label class="full">Recruitment service <span>(optional)</span><select name="service"><option value="">Help me choose</option>{services.map(service=><option value={service.slug}>{service.title}</option>)}</select></label>
<EnquiryFields items={fields.employer.filter(f=>['country','industry','position_job_title','number_of_vacancies'].includes(f.name))}/>
</div></fieldset>
<details class="enquiry-optional"><summary>Additional information <span>Optional — add role details and timing</span></summary><div class="form-grid"><EnquiryFields items={fields.employer.filter(f=>['qualification','experience_required','work_location','salary_benefits','expected_joining_date','job_description','additional_requirements'].includes(f.name))}/></div></details>
</>:<div class="form-grid"><EnquiryFields items={fields[type]}/></div>}
<div class="form-grid">
`+s.slice(consent);
fs.writeFileSync(p,s);

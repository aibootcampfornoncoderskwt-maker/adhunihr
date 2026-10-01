import type { APIRoute } from 'astro';
import { Buffer } from 'node:buffer';
import fields from '../../data/enquiry-fields.json';
import { countries } from '../../data/site';
export const prerender=false;
const json=(body:object,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
const MAX_FILE=2*1024*1024;
const MAX_BODY=MAX_FILE+128*1024;
export const POST:APIRoute=async({request})=>{
 const apiKey=process.env.RESEND_API_KEY || import.meta.env.RESEND_API_KEY,from=process.env.CONTACT_FROM || import.meta.env.CONTACT_FROM,to=process.env.CONTACT_TO || import.meta.env.CONTACT_TO,secret=process.env.TURNSTILE_SECRET_KEY || import.meta.env.TURNSTILE_SECRET_KEY;
 if((process.env.PUBLIC_CONTACT_ENABLED || import.meta.env.PUBLIC_CONTACT_ENABLED)!=='true'||!apiKey||!from||!to||!secret)return json({error:'Online enquiries are not available yet. Please try again after launch.'},503);
 const origin=request.headers.get('origin');
 if(!origin||origin!==new URL(request.url).origin)return json({error:'Request not permitted.'},403);
 const contentType=request.headers.get('content-type')||'';
 if(!contentType.startsWith('multipart/form-data;'))return json({error:'Unsupported request format.'},415);
 if(Number(request.headers.get('content-length')||0)>MAX_BODY)return json({error:'Attachment must be 2 MB or smaller.'},413);
 try{
  // Bound the actual stream as well as the optional Content-Length header.
  const reader=request.body?.getReader();if(!reader)return json({error:'Invalid enquiry.'},400);
  const chunks:Uint8Array[]=[];let size=0;
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>MAX_BODY){await reader.cancel();return json({error:'Attachment must be 2 MB or smaller.'},413);}chunks.push(value);}
  const data=await new Response(Buffer.concat(chunks),{headers:{'Content-Type':contentType}}).formData();
  const text=(key:string)=>{const value=data.get(key);return typeof value==='string'?value.trim():'';};
  const type=text('type');
  if(!Object.hasOwn(fields,type)||text('website')||text('consent')!=='on')return json({error:'Please complete the required fields and consent checkbox.'},400);
  const schema=fields[type as keyof typeof fields];
  for(const field of schema){
   if(field.type==='file')continue;
   const value=text(field.name),limit=field.type==='textarea'?4000:field.type==='email'?254:500;
   if((field.required&&!value)||value.length>limit)return json({error:`Please check ${field.label}.`},400);
   if(field.type==='number'&&value&&(!/^\d+$/.test(value)||Number(value)<1||Number(value)>100000))return json({error:'Please enter a valid number of vacancies.'},400);
   if(field.type==='date'&&value&&(!/^\d{4}-\d{2}-\d{2}$/.test(value)||Number.isNaN(Date.parse(value))||new Date(value).toISOString().slice(0,10)!==value))return json({error:'Please enter a valid joining date.'},400);
   if(field.type==='select'&&value){const allowed=field.name==='country'?[...countries.map(c=>c.name),'India','Other']:['Employer requirement','Candidate enquiry','General enquiry','Request a call'];if(!allowed.includes(value))return json({error:`Please check ${field.label}.`},400);}
  }
  const email=text('email');if(!/^\S+@[^\s@]+\.[^\s@]+$/.test(email)||/[\r\n]/.test(email))return json({error:'Please enter a valid email address.'},400);
  const token=text('cf-turnstile-response');if(!token||token.length>2048)return json({error:'Please complete the security check.'},400);
  const attachments:{filename:string;content:string}[]=[];
  const upload=data.get('attachment');
  if(upload instanceof File&&upload.size){
   if(upload.size>MAX_FILE)return json({error:'Attachment must be 2 MB or smaller.'},413);
   const extension=upload.name.split('.').pop()?.toLowerCase();
   const bytes=Buffer.from(await upload.arrayBuffer());
   const valid=extension==='pdf'?bytes.subarray(0,5).toString()==='%PDF-':extension==='doc'?bytes.subarray(0,8).equals(Buffer.from([0xd0,0xcf,0x11,0xe0,0xa1,0xb1,0x1a,0xe1])):extension==='docx'?bytes.subarray(0,4).equals(Buffer.from([0x50,0x4b,0x03,0x04]))&&bytes.includes(Buffer.from('[Content_Types].xml'))&&bytes.includes(Buffer.from('word/document.xml')):false;
   if(!valid)return json({error:'Please attach a valid PDF, DOC or DOCX file.'},400);
   attachments.push({filename:`${type}-attachment.${extension}`,content:bytes.toString('base64')});
  }
  const verification=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:new URLSearchParams({secret,response:token}),signal:AbortSignal.timeout(10000)});
  const result=await verification.json();if(!verification.ok||!result.success||result.hostname!==new URL(request.url).hostname)return json({error:'Security check expired or failed. Please try again.'},400);
  const service=text('service');if(service&&!/^[a-z-]{1,70}$/.test(service))return json({error:'Please check the recruitment service.'},400);
  const details=(service?`Recruitment service: ${service}\n`:'')+schema.filter(field=>field.type!=='file').map(field=>`${field.label}: ${text(field.name)||'Not provided'}`).join('\n');
  const delivery=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({from,to:[to],reply_to:email,subject:`Adhuni ${type} enquiry`,text:`Type: ${type}\n${details}\n\nConsent to enquiry contact: yes`,...(attachments.length?{attachments}:{})}),signal:AbortSignal.timeout(10000)});
  if(!delivery.ok)return json({error:'Your enquiry could not be delivered. Please try again later.'},502);
  return json({ok:true});
 }catch{return json({error:'Unable to process the enquiry. Please try again.'},400);}
};

import type { APIRoute } from 'astro';
import { Buffer } from 'node:buffer';
import { randomBytes } from 'node:crypto';
import fields from '../../data/enquiry-fields.json';
import { backend, backendReady, clientIp } from '../../lib/crm/backend';
export const prerender=false;
// Website enquiries (candidate, employer, general, quick match, brief builder) are validated here and relayed to the
// Apps Script backend, which saves them in Google Sheets and Drive and then sends the notification email.
const json=(body:object,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
const MAX_FILE=2*1024*1024;
const MAX_BODY=MAX_FILE+128*1024;
const env=(key:string)=>process.env[key] ?? (import.meta.env as Record<string,string|undefined>)[key];
export const POST:APIRoute=async({request})=>{
 const turnstileSecret=env('TURNSTILE_SECRET_KEY');
 if(env('PUBLIC_CONTACT_ENABLED')!=='true'||!backendReady())return json({error:'Online enquiries are not available yet. Please try again after launch.'},503);
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
   if(field.type==='select'&&value){const allowed=(field as {options?:string[]}).options??[];if(!allowed.includes(value))return json({error:`Please check ${field.label}.`},400);}
  }
  const email=text('email');if(!/^\S+@[^\s@]+\.[^\s@]+$/.test(email)||/[\r\n]/.test(email))return json({error:'Please enter a valid email address.'},400);
  // Cloudflare Turnstile is optional: it is checked only when TURNSTILE_SECRET_KEY is set. The honeypot and origin check always apply.
  const token=text('cf-turnstile-response');if(turnstileSecret&&(!token||token.length>2048))return json({error:'Please complete the security check.'},400);
  let file:{extension:string;base64:string}|undefined;
  const upload=data.get('attachment');
  if(upload instanceof File&&upload.size){
   if(upload.size>MAX_FILE)return json({error:'Attachment must be 2 MB or smaller.'},413);
   const extension=upload.name.split('.').pop()?.toLowerCase()||'';
   const bytes=Buffer.from(await upload.arrayBuffer());
   // The extension and the file's own signature must agree (PDF, legacy Word, or a Word document package).
   const valid=extension==='pdf'?bytes.subarray(0,5).toString()==='%PDF-':extension==='doc'?bytes.subarray(0,8).equals(Buffer.from([0xd0,0xcf,0x11,0xe0,0xa1,0xb1,0x1a,0xe1])):extension==='docx'?bytes.subarray(0,4).equals(Buffer.from([0x50,0x4b,0x03,0x04]))&&bytes.includes(Buffer.from('[Content_Types].xml'))&&bytes.includes(Buffer.from('word/document.xml')):false;
   if(!valid)return json({error:'Please attach a valid PDF, DOC or DOCX file.'},400);
   file={extension,base64:bytes.toString('base64')};
  }
  if(turnstileSecret){
   const verification=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:new URLSearchParams({secret:turnstileSecret,response:token}),signal:AbortSignal.timeout(10000)});
   const result=await verification.json();if(!verification.ok||!result.success||result.hostname!==new URL(request.url).hostname)return json({error:'Security check expired or failed. Please try again.'},400);
  }
  const service=text('service');if(service&&!/^[a-z-]{1,70}$/.test(service))return json({error:'Please check the recruitment service.'},400);
  // Retries of the same submission reuse the browser's key, so a double click or a retry cannot create a second record.
  const key=text('submission_id');
  const idempotencyKey=/^[A-Za-z0-9_-]{16,80}$/.test(key)?key:randomBytes(18).toString('base64url');
  const values:Record<string,string>=Object.fromEntries(schema.filter(field=>field.type!=='file').map(field=>[field.name,text(field.name)]));
  if(type==='employer')values.service=service;
  const referer=request.headers.get('referer')||'';
  let source='';try{source=referer?new URL(referer).pathname:'';}catch{source='';}
  const saved=await backend('submit',{type,fields:values,file,idempotencyKey,source,language:source.startsWith('/ar/')?'ar':'en',consent:true,ip:clientIp(request)},45000);
  if(saved.ok&&typeof saved.reference==='string')return json({ok:true,reference:saved.reference});
  if(saved.code===409)return json({error:String(saved.error||'This submission was already sent with different details.')},409);
  if(saved.code===429)return json({error:String(saved.error||'Too many submissions. Please wait a few minutes and try again.')},429);
  if(saved.code===400&&saved.error)return json({error:String(saved.error)},400);
  return json({error:'We could not save your details just now. Nothing was submitted, and your entries are still in the form. Please try again in a moment.'},502);
 }catch{return json({error:'Unable to process the enquiry. Please try again.'},400);}
};

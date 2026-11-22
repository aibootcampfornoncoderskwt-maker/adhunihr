import type { APIRoute } from 'astro';
import { Buffer } from 'node:buffer';
import { backend, clientIp } from '../../../lib/crm/backend';
import { adminUser, clearCookies, createSession, csrfOk, loginConfigured, noStore, sameText, sessionOf, verifyPassword } from '../../../lib/crm/auth';
export const prerender=false;
// CRM API. Every route except login needs a valid session (checked by the backend on each call);
// every POST also needs the CSRF header and a same-site Origin.
const TYPES=['candidate','employer','general'] as const;
type Kind=typeof TYPES[number];
const json=(body:object,status=200,cookies:string[]=[])=>{
 const headers=new Headers({...noStore,'Content-Type':'application/json'});
 cookies.forEach(c=>headers.append('Set-Cookie',c));
 return new Response(JSON.stringify(body),{status,headers});
};
const fail=(reply:{code?:number;error?:string;[k:string]:unknown})=>{
 const status=reply.code&&reply.code>=400&&reply.code<600?reply.code:502;
 return json({ok:false,error:reply.error||'Something went wrong.',...(reply.record?{record:reply.record}:{})},status,status===401?clearCookies():[]);
};
const kindOf=(value:unknown):Kind|null=>TYPES.includes(value as Kind)?value as Kind:null;
const filtersOf=(url:URL)=>{const f:Record<string,string>={};for(const k of ['q','status','country','category','from','to']){const v=(url.searchParams.get(k)||'').slice(0,120);if(v)f[k]=v;}return f;};

/** Spreadsheet programs run cells that start with = + - @ as formulas; prefix those with an apostrophe. */
export const csvCell=(value:unknown)=>{let text=value==null?'':String(value);if(/^[=+\-@\t\r]/.test(text))text="'"+text;return `"${text.replace(/"/g,'""')}"`;};

export const GET:APIRoute=async({params,request,url})=>{
 const session=sessionOf(request);
 if(!session)return json({ok:false,error:'Please sign in.'},401);
 const action=params.action;
 const type=kindOf(url.searchParams.get('type'));
 if(action==='session')return answer(await backend('session.check',{session}));
 if(action==='overview')return answer(await backend('overview',{session}));
 if(action==='status')return answer(await backend('status',{session}));
 if(!type)return json({ok:false,error:'Unknown record type.'},400);
 if(action==='list'){
  const page=Number(url.searchParams.get('page'))||1,pageSize=Number(url.searchParams.get('pageSize'))||25;
  return answer(await backend('list',{session,type,page,pageSize,filters:filtersOf(url)}));
 }
 if(action==='record')return answer(await backend('get',{session,type,reference:url.searchParams.get('ref')||''}));
 if(action==='export'){
  const reply=await backend('list',{session,type,all:true,filters:filtersOf(url)},40000);
  if(!reply.ok)return fail(reply);
  const fields=(reply.fields as [string,string][])||[];
  const head=['Reference','Submitted at','Status','Internal notes','Last updated',...fields.map(f=>f[1]),'Consent','Consent at','Source page','Language','Document','Notification'];
  const rows=(reply.records as Record<string,any>[]).map(r=>[r.reference,r.submittedAt,r.status,r.notes,r.updatedAt,...fields.map(f=>r.fields?.[f[0]]),r.consent,r.consentAt,r.source,r.language,r.file?.name||'',r.notification]);
  const csv='﻿'+[head,...rows].map(row=>row.map(csvCell).join(',')).join('\r\n');
  const name={candidate:'candidates',employer:'client-requests',general:'general-enquiries'}[type];
  return new Response(csv,{headers:{...noStore,'Content-Type':'text/csv; charset=utf-8','Content-Disposition':`attachment; filename="adhuni-${name}-${new Date().toISOString().slice(0,10)}.csv"`}});
 }
 if(action==='file'){
  const reply=await backend('file',{session,type,reference:url.searchParams.get('ref')||''},40000);
  if(!reply.ok)return fail(reply);
  const name=String(reply.name||'document').replace(/[^A-Za-z0-9._-]/g,'_');
  const mime=['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(String(reply.mime))?String(reply.mime):'application/octet-stream';
  return new Response(Buffer.from(String(reply.base64||''),'base64'),{headers:{...noStore,'Content-Type':mime,'Content-Disposition':`attachment; filename="${name}"`,'X-Content-Type-Options':'nosniff'}});
 }
 return json({ok:false,error:'Not found.'},404);
};

export const POST:APIRoute=async({params,request})=>{
 const action=params.action;
 const origin=request.headers.get('origin');
 if(!origin||origin!==new URL(request.url).origin)return json({ok:false,error:'Request not permitted.'},403);
 let body:Record<string,unknown>={};
 try{const text=await request.text();if(text.length>20000)return json({ok:false,error:'Request too large.'},413);body=text?JSON.parse(text):{};}catch{return json({ok:false,error:'Invalid request.'},400);}

 if(action==='login'){
  if(!loginConfigured())return json({ok:false,error:'The CRM login has not been configured yet.'},503);
  const ip=clientIp(request);
  const check=await backend('login.check',{ip});
  if(!check.ok)return fail(check);
  if(!check.allowed)return json({ok:false,error:'Too many sign-in attempts. Please wait 15 minutes and try again.'},429);
  const username=String(body.username||''),password=String(body.password||'');
  const valid=sameText(username,adminUser())&&verifyPassword(password);
  if(!valid){await backend('login.failed',{ip});return json({ok:false,error:'The username or password is not correct.'},401);}
  const cookies=await createSession(request);
  if(!cookies)return json({ok:false,error:'Could not start a session. Please try again.'},502);
  return json({ok:true},200,cookies);
 }

 const session=sessionOf(request);
 if(action==='logout'){
  if(session&&csrfOk(request))await backend('session.revoke',{session});
  return json({ok:true},200,clearCookies());
 }
 if(!session)return json({ok:false,error:'Please sign in.'},401);
 if(!csrfOk(request))return json({ok:false,error:'Your session token is missing. Reload the page and try again.'},403);
 const type=kindOf(body.type);
 if(!type)return json({ok:false,error:'Unknown record type.'},400);
 const reference=String(body.reference||'').slice(0,40);
 if(action==='update'){
  return answer(await backend('update',{session,type,reference,status:body.status==null?null:String(body.status),notes:body.notes==null?null:String(body.notes).slice(0,5000),expectedUpdatedAt:String(body.expectedUpdatedAt||'')}));
 }
 if(action==='retry')return answer(await backend('notify.retry',{session,type,reference}));
 return json({ok:false,error:'Not found.'},404);
};

function answer(reply:{ok:boolean;code?:number;error?:string;[k:string]:unknown}){
 if(!reply.ok)return fail(reply);
 const {ok:_ok,code:_code,...rest}=reply;
 return json({ok:true,...rest});
}

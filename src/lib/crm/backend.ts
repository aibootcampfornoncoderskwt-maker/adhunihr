// Server-side calls to the Google Apps Script backend (google/apps-script/Code.gs).
// The shared secret lives only in server environment variables; browsers never talk to Apps Script.
const env=(key:string)=>(process.env[key] ?? (import.meta.env as Record<string,string|undefined>)[key] ?? '').trim();

export const backendUrl=()=>env('GOOGLE_SHEET_WEBHOOK_URL');
// A local mock backend (scripts/mock-backend.mjs) is accepted only in development with CRM_BACKEND_ALLOW_LOCAL=true.
const localAllowed=()=>env('CRM_BACKEND_ALLOW_LOCAL')==='true'&&process.env.NODE_ENV!=='production'&&/^http:\/\/127\.0\.0\.1:\d+\//.test(backendUrl());
export const backendReady=()=>(/^https:\/\/script\.google(usercontent)?\.com\//.test(backendUrl())||localAllowed())&&env('GOOGLE_SHEET_SECRET').length>=24;

export type BackendReply={ok:boolean;code?:number;error?:string;[key:string]:unknown};

/** POSTs one action to Apps Script. Apps Script answers through a redirect, so the redirect is followed. Never throws. */
export async function backend(action:string,payload:Record<string,unknown>={},timeoutMs=25000):Promise<BackendReply>{
 if(!backendReady())return {ok:false,code:503,error:'The CRM backend is not configured.'};
 try{
  const response=await fetch(backendUrl(),{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({...payload,action,secret:env('GOOGLE_SHEET_SECRET')}),redirect:'follow',signal:AbortSignal.timeout(timeoutMs)});
  const text=await response.text();
  let reply:BackendReply|null=null;
  try{reply=JSON.parse(text);}catch{reply=null;}
  if(!response.ok||!reply||typeof reply.ok!=='boolean')return {ok:false,code:502,error:'The CRM backend did not answer correctly.'};
  return reply;
 }catch{
  return {ok:false,code:504,error:'The CRM backend did not answer in time.'};
 }
}

/** Visitor IP as reported by Vercel (used only for rate limiting, never stored with records). */
export const clientIp=(request:Request)=>(request.headers.get('x-real-ip')||request.headers.get('x-forwarded-for')||'unknown').split(',')[0].trim().slice(0,64);

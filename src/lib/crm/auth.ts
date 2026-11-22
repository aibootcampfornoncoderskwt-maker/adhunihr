// CRM login: one administrator. The password is checked on the server against CRM_ADMIN_PASSWORD_HASH
// (create it with: node scripts/crm-hash-password.mjs). Sessions are random tokens whose SHA-256 hash is
// stored server-side in Apps Script's cache with an expiry; logout deletes it.
import {createHash,randomBytes,scryptSync,timingSafeEqual} from 'node:crypto';
import {backend,clientIp} from './backend';

const env=(key:string)=>(process.env[key] ?? (import.meta.env as Record<string,string|undefined>)[key] ?? '').trim();
export const SESSION_COOKIE='__Host-adhuni_crm';
export const CSRF_COOKIE='__Host-adhuni_csrf';
export const SESSION_SECONDS=4*60*60;

export const adminUser=()=>env('CRM_ADMIN_USERNAME')||'admin';
export const loginConfigured=()=>/^scrypt\$\d+\$\d+\$\d+\$[A-Za-z0-9+/=]+\$[A-Za-z0-9+/=]+$/.test(env('CRM_ADMIN_PASSWORD_HASH'));

/** Hash format: scrypt$N$r$p$salt(base64)$key(base64) */
export function verifyPassword(password:string){
 const stored=env('CRM_ADMIN_PASSWORD_HASH');
 if(!loginConfigured()||!password||password.length>256)return false;
 const [,N,r,p,salt,key]=stored.split('$');
 const expected=Buffer.from(key,'base64');
 const actual=scryptSync(password,Buffer.from(salt,'base64'),expected.length,{N:Number(N),r:Number(r),p:Number(p),maxmem:256*1024*1024});
 return actual.length===expected.length&&timingSafeEqual(actual,expected);
}
export function sameText(a:string,b:string){
 const x=createHash('sha256').update(a).digest(),y=createHash('sha256').update(b).digest();
 return timingSafeEqual(x,y);
}
export const tokenHash=(token:string)=>createHash('sha256').update(token).digest('hex');

export function readCookie(request:Request,name:string){
 const header=request.headers.get('cookie')||'';
 for(const part of header.split(';')){const i=part.indexOf('=');if(i>0&&part.slice(0,i).trim()===name)return decodeURIComponent(part.slice(i+1).trim());}
 return '';
}
const cookie=(name:string,value:string,maxAge:number,httpOnly:boolean)=>`${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; Secure; SameSite=Strict${httpOnly?'; HttpOnly':''}`;

export async function createSession(request:Request){
 const token=randomBytes(32).toString('base64url'),csrf=randomBytes(24).toString('base64url');
 const saved=await backend('session.create',{sessionHash:tokenHash(token),user:adminUser(),ip:clientIp(request)});
 if(!saved.ok)return null;
 return [cookie(SESSION_COOKIE,token,SESSION_SECONDS,true),cookie(CSRF_COOKIE,csrf,SESSION_SECONDS,false)];
}
export const clearCookies=()=>[cookie(SESSION_COOKIE,'',0,true),cookie(CSRF_COOKIE,'',0,false)];

/** Session hash for the request, or '' when there is no session cookie. Validity is checked by Apps Script on every data call. */
export const sessionOf=(request:Request)=>{const token=readCookie(request,SESSION_COOKIE);return /^[A-Za-z0-9_-]{40,60}$/.test(token)?tokenHash(token):'';};

/** Mutating requests need the CSRF header to match the CSRF cookie, and must come from this site. */
export function csrfOk(request:Request){
 const origin=request.headers.get('origin');
 if(!origin||origin!==new URL(request.url).origin)return false;
 const cookieValue=readCookie(request,CSRF_COOKIE),header=request.headers.get('x-csrf-token')||'';
 return cookieValue.length>=20&&header.length>=20&&sameText(cookieValue,header);
}

export const noStore={'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow','Referrer-Policy':'no-referrer'};

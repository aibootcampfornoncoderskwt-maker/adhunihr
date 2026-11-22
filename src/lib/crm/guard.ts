// Server-side page guard for the CRM: no private data or CRM page is rendered without a valid session.
import {backend} from './backend';
import {sessionOf} from './auth';
export async function hasSession(request:Request){
 const session=sessionOf(request);
 if(!session)return false;
 const reply=await backend('session.check',{session});
 return reply.ok===true;
}
export const crmHeaders={'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY'};

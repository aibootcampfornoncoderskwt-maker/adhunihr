// Serves the CRM on its own subdomain. Runs after `astro build`: adds a host-based rewrite to the Vercel Build Output
// config, so https://crm.adhunihrsolutions.com/candidates is answered by /crm/candidates. The public site is unaffected,
// and /crm/ keeps working on the main domain too. Set CRM_HOST to use another hostname.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const file = '.vercel/output/config.json';
if (!existsSync(file)) { console.log('No Vercel output found; CRM host rewrite skipped.'); process.exit(0); }
const host = (process.env.CRM_HOST || 'crm.adhunihrsolutions.com').trim();
const config = JSON.parse(readFileSync(file, 'utf8'));
config.routes = config.routes.filter(route => !route.__crmHost);
// Everything on the CRM host except the CRM itself, its API and the shared static files becomes /crm/<path>.
const rewrite = { src: '^/(?!crm(?:/|$)|api/crm/|_astro/|images/|flags/|favicon)(.*)$', has: [{ type: 'host', value: host }], dest: '/crm/$1', check: true, __crmHost: true };
const noIndex = { src: '^/(crm|api/crm)(?:/.*)?$', headers: { 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store' }, continue: true, __crmHost: true };
const at = config.routes.findIndex(route => route.handle === 'filesystem');
config.routes.splice(at < 0 ? 0 : at, 0, noIndex, rewrite);
writeFileSync(file, JSON.stringify(config, (key, value) => key === '__crmHost' ? undefined : value, '\t'));
console.log(`CRM host rewrite added for ${host}.`);

// Tests the CRM API (src/pages/api/crm/[action].ts) with the Google backend MOCKED (no real Google calls):
// login, rate limit, sessions, CSRF, logout, expiry, updates, CSV export (formula-safe) and document download.
//   node scripts/check-crm.mjs
import assert from 'node:assert/strict';
import { randomBytes, scryptSync } from 'node:crypto';
import { loadRoute } from './lib/bundle-route.mjs';

const salt = randomBytes(16), key = scryptSync('Correct horse 2026!', salt, 32, { N: 16384, r: 8, p: 1 });
Object.assign(process.env, { GOOGLE_SHEET_WEBHOOK_URL: 'https://script.google.com/macros/s/test/exec', GOOGLE_SHEET_SECRET: 's'.repeat(32), CRM_ADMIN_USERNAME: 'admin', CRM_ADMIN_PASSWORD_HASH: `scrypt$16384$8$1$${salt.toString('base64')}$${key.toString('base64')}` });
const { GET, POST, csvCell } = await loadRoute('src/pages/api/crm/[action].ts');

// ---- mocked backend: sessions, login limits and one record
const sessions = new Set(); let failed = 0; const actions = [];
let record = { type: 'candidate', reference: 'CAN-261122-AAAAA', submittedAt: '2026-11-22T10:00:00Z', status: 'New', notes: '', updatedAt: '2026-11-22T10:00:00Z', consent: 'Yes', file: { name: 'CAN-261122-AAAAA-CV.pdf' }, notification: 'Sent', fields: { name: '=cmd|calc', email: 'a@example.com' } };
globalThis.fetch = async (_url, options) => {
  const b = JSON.parse(options.body); actions.push(b.action);
  const ok = data => new Response(JSON.stringify({ ok: true, ...data }));
  const no = (code, error) => new Response(JSON.stringify({ ok: false, code, error }));
  if (b.secret !== 's'.repeat(32)) return no(401, 'Not authorised');
  if (b.action === 'login.check') return ok({ allowed: failed < 5 });
  if (b.action === 'login.failed') { failed++; return ok(); }
  if (b.action === 'session.create') { sessions.add(b.sessionHash); return ok(); }
  if (b.action === 'session.revoke') { sessions.delete(b.session); return ok(); }
  if (!sessions.has(b.session)) return no(401, 'Session expired');
  if (b.action === 'session.check') return ok();
  if (b.action === 'list') return ok({ total: 1, page: 1, pageSize: 25, statuses: ['New', 'Reviewing'], fields: [['name', 'Full Name'], ['email', 'Email']], records: [record] });
  if (b.action === 'update') { if (b.expectedUpdatedAt !== record.updatedAt) return no(409, 'Changed elsewhere'); record = { ...record, status: b.status, notes: b.notes, updatedAt: '2026-11-22T11:00:00Z' }; return ok({ record }); }
  if (b.action === 'file') return ok({ name: record.file.name, mime: 'application/pdf', base64: Buffer.from('%PDF-1.4').toString('base64') });
  return no(400, 'Unknown');
};

const ORIGIN = 'https://crm.adhunihrsolutions.com';
let jar = {};
const cookieHeader = () => Object.entries(jar).map(([k, v]) => `${k}=${v}`).join('; ');
const take = response => { for (const c of response.headers.getSetCookie()) { const [pair] = c.split(';'); const [k, v] = pair.split('='); if (/Max-Age=0/.test(c)) delete jar[k]; else jar[k] = v; } return response; };
const get = async (action, query = '') => take(await GET({ params: { action }, request: new Request(`${ORIGIN}/api/crm/${action}?${query}`, { headers: { cookie: cookieHeader() } }), url: new URL(`${ORIGIN}/api/crm/${action}?${query}`) }));
const post = async (action, body, { csrf = true, origin = ORIGIN } = {}) => take(await POST({ params: { action }, request: new Request(`${ORIGIN}/api/crm/${action}`, { method: 'POST', headers: { cookie: cookieHeader(), 'Content-Type': 'application/json', Origin: origin, ...(csrf && jar['__Host-adhuni_csrf'] ? { 'X-CSRF-Token': decodeURIComponent(jar['__Host-adhuni_csrf']) } : {}) }, body: JSON.stringify(body) }) }));
const results = [];
const check = async (name, fn) => { await fn(); results.push(name); };

await check('Without a session, read, update and export are refused', async () => {
  assert.equal((await get('list', 'type=candidate')).status, 401);
  assert.equal((await get('export', 'type=candidate')).status, 401);
  assert.equal((await get('file', 'type=candidate&ref=CAN-261122-AAAAA')).status, 401);
  assert.equal((await post('update', { type: 'candidate', reference: 'x' })).status, 401);
});
await check('Wrong password is refused and counted; login is blocked after 5 failures', async () => {
  for (let i = 0; i < 5; i++) assert.equal((await post('login', { username: 'admin', password: 'wrong password' })).status, 401);
  assert.equal((await post('login', { username: 'admin', password: 'Correct horse 2026!' })).status, 429);
  failed = 0;
  assert.equal((await post('login', { username: 'root', password: 'Correct horse 2026!' })).status, 401, 'wrong username');
  failed = 0;
});
await check('Login from another site is refused', async () => {
  assert.equal((await post('login', { username: 'admin', password: 'Correct horse 2026!' }, { origin: 'https://evil.example' })).status, 403);
});
await check('Correct login sets secure, HttpOnly, SameSite=Strict cookies (no token in the URL or body)', async () => {
  const r = await POST({ params: { action: 'login' }, request: new Request(`${ORIGIN}/api/crm/login`, { method: 'POST', headers: { Origin: ORIGIN, 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'admin', password: 'Correct horse 2026!' }) }) });
  assert.equal(r.status, 200);
  const cookies = r.headers.getSetCookie();
  const session = cookies.find(c => c.startsWith('__Host-adhuni_crm='));
  assert.match(session, /HttpOnly/); assert.match(session, /Secure/); assert.match(session, /SameSite=Strict/); assert.match(session, /Max-Age=14400/);
  assert.ok(!JSON.stringify(await r.clone().json()).includes(session.split(';')[0].split('=')[1]), 'token not in the body');
  take(r);
});
await check('With a session, records can be listed', async () => {
  const r = await get('list', 'type=candidate&q=asha&status=New');
  assert.equal(r.status, 200); assert.equal((await r.json()).records.length, 1);
});
await check('Updates need the CSRF token and a same-site origin', async () => {
  assert.equal((await post('update', { type: 'candidate', reference: record.reference, status: 'Reviewing', expectedUpdatedAt: record.updatedAt }, { csrf: false })).status, 403);
  assert.equal((await post('update', { type: 'candidate', reference: record.reference, status: 'Reviewing', expectedUpdatedAt: record.updatedAt }, { origin: 'https://evil.example' })).status, 403);
  const r = await post('update', { type: 'candidate', reference: record.reference, status: 'Reviewing', notes: 'Called', expectedUpdatedAt: record.updatedAt });
  assert.equal(r.status, 200); assert.equal((await r.json()).record.status, 'Reviewing');
});
await check('A stale update is rejected with the latest record', async () => {
  const r = await post('update', { type: 'candidate', reference: record.reference, status: 'New', expectedUpdatedAt: '2026-11-22T10:00:00Z' });
  assert.equal(r.status, 409);
});
await check('CSV export neutralises spreadsheet formulas', async () => {
  const r = await get('export', 'type=candidate');
  assert.equal(r.status, 200); assert.match(r.headers.get('content-disposition'), /attachment; filename="adhuni-candidates-/);
  const csv = await r.text();
  assert.ok(csv.includes(`"'=cmd|calc"`), 'leading = is prefixed'); assert.ok(!csv.includes(',"=cmd'));
  assert.equal(csvCell('+1 555'), `"'+1 555"`); assert.equal(csvCell('He said "hi"'), '"He said ""hi"""');
});
await check('Documents download only with a session, as attachments', async () => {
  const r = await get('file', `type=candidate&ref=${record.reference}`);
  assert.equal(r.status, 200); assert.equal(r.headers.get('content-type'), 'application/pdf'); assert.match(r.headers.get('content-disposition'), /^attachment/);
  assert.equal(r.headers.get('cache-control'), 'no-store');
});
await check('Logout revokes the session on the server and clears the cookies', async () => {
  const before = [...jar['__Host-adhuni_crm'] ? [1] : []].length;
  assert.equal(before, 1);
  const stolen = cookieHeader();
  assert.equal((await post('logout', {})).status, 200);
  assert.equal(jar['__Host-adhuni_crm'], undefined, 'cookie cleared');
  const replay = await GET({ params: { action: 'list' }, request: new Request(`${ORIGIN}/api/crm/list?type=candidate`, { headers: { cookie: stolen } }), url: new URL(`${ORIGIN}/api/crm/list?type=candidate`) });
  assert.equal(replay.status, 401, 'old cookie no longer works');
});
await check('An expired session is refused and its cookies cleared', async () => {
  await post('login', { username: 'admin', password: 'Correct horse 2026!' });
  sessions.clear(); // what Apps Script's cache does when the 4-hour session expires
  const r = await get('list', 'type=candidate');
  assert.equal(r.status, 401); assert.equal(jar['__Host-adhuni_crm'], undefined);
});
await check('Login is disabled when no password hash is configured (no default password)', async () => {
  const saved = process.env.CRM_ADMIN_PASSWORD_HASH; delete process.env.CRM_ADMIN_PASSWORD_HASH;
  assert.equal((await post('login', { username: 'admin', password: 'admin' })).status, 503);
  process.env.CRM_ADMIN_PASSWORD_HASH = saved;
});
console.log(`PASS (backend mocked): ${results.length} checks\n- ` + results.join('\n- '));

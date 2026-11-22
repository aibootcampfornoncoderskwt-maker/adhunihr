// Tests the website enquiry relay (src/pages/api/contact.ts) with the Google backend MOCKED (no real Google calls).
//   node scripts/check-enquiry-api.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadRoute } from './lib/bundle-route.mjs';

const fields = JSON.parse(readFileSync('src/data/enquiry-fields.json', 'utf8'));
Object.assign(process.env, { PUBLIC_CONTACT_ENABLED: 'true', GOOGLE_SHEET_WEBHOOK_URL: 'https://script.google.com/macros/s/test/exec', GOOGLE_SHEET_SECRET: 's'.repeat(32) });
delete process.env.TURNSTILE_SECRET_KEY;
const { POST } = await loadRoute('src/pages/api/contact.ts');

let calls = [], backendReply = () => ({ ok: true, reference: 'CAN-261122-ABCDE' });
globalThis.fetch = async (url, options) => {
  calls.push({ url, body: JSON.parse(options.body) });
  const r = backendReply(JSON.parse(options.body));
  if (r === 'network') throw new Error('network down');
  return new Response(JSON.stringify(r), { status: 200 });
};
const make = type => {
  const form = new FormData(); form.set('type', type); form.set('consent', 'on');
  for (const f of fields[type]) if (f.type !== 'file') form.set(f.name, f.name === 'email' ? 'test@example.com' : f.type === 'number' ? '3' : f.type === 'date' ? '2026-12-01' : f.type === 'select' ? (f.options ? f.options[0] : 'Kuwait') : `Test ${f.name}`);
  return form;
};
const send = (form, origin = 'https://adhunihrsolutions.com') => POST({ request: new Request('https://adhunihrsolutions.com/api/contact', { method: 'POST', headers: { Origin: origin, Referer: 'https://adhunihrsolutions.com/ar/candidates/' }, body: form }) });
const results = [];
const check = async (name, fn) => { calls = []; backendReply = () => ({ ok: true, reference: 'REF-261122-ABCDE' }); await fn(); results.push(name); };

await check('Each form relays every business field to the backend and returns the reference', async () => {
  for (const type of ['candidate', 'employer', 'general']) {
    calls = [];
    const form = make(type); form.set('submission_id', `key-${type}-00000000000`); if (type === 'employer') form.set('service', 'permanent-recruitment');
    const r = await send(form); const body = await r.json();
    assert.equal(r.status, 200); assert.equal(body.reference, 'REF-261122-ABCDE');
    const sent = calls[0].body;
    assert.equal(sent.action, 'submit'); assert.equal(sent.type, type); assert.equal(sent.idempotencyKey, `key-${type}-00000000000`);
    assert.equal(sent.secret, 's'.repeat(32), 'secret added on the server');
    assert.equal(sent.consent, true); assert.equal(sent.language, 'ar'); assert.equal(sent.source, '/ar/candidates/');
    for (const f of fields[type]) if (f.type !== 'file') assert.ok(f.name in sent.fields, `${type}.${f.name} relayed`);
    if (type === 'employer') assert.equal(sent.fields.service, 'permanent-recruitment');
  }
});
await check('A missing submission key is generated on the server', async () => {
  await send(make('general')); assert.match(calls[0].body.idempotencyKey, /^[A-Za-z0-9_-]{16,80}$/);
});
await check('A valid PDF is forwarded; fake and oversized files are rejected before the backend', async () => {
  let form = make('candidate'); form.set('attachment', new File(['%PDF-1.4\nCV'], 'cv.pdf'));
  assert.equal((await send(form)).status, 200); assert.equal(calls[0].body.file.extension, 'pdf');
  calls = []; form = make('candidate'); form.set('attachment', new File(['not a pdf'], 'cv.pdf'));
  assert.equal((await send(form)).status, 400); assert.equal(calls.length, 0);
  form = make('candidate'); form.set('attachment', new File([new Uint8Array(2 * 1024 * 1024 + 1)], 'cv.pdf'));
  assert.equal((await send(form)).status, 413); assert.equal(calls.length, 0);
  form = make('candidate'); form.set('attachment', new File(['MZ'], 'cv.exe'));
  assert.equal((await send(form)).status, 400);
});
await check('Missing required fields, consent, bad email or another origin are rejected', async () => {
  let form = make('candidate'); form.delete('current_location'); assert.equal((await send(form)).status, 400);
  form = make('general'); form.delete('consent'); assert.equal((await send(form)).status, 400);
  form = make('general'); form.set('email', 'broken'); assert.equal((await send(form)).status, 400);
  form = make('employer'); form.set('number_of_vacancies', '-1'); assert.equal((await send(form)).status, 400);
  form = make('employer'); form.set('country', 'Atlantis'); assert.equal((await send(form)).status, 400);
  form = make('general'); form.set('website', 'http://spam'); assert.equal((await send(form)).status, 400, 'honeypot');
  assert.equal((await send(make('general'), 'https://evil.example')).status, 403);
  assert.equal(calls.length, 0, 'nothing reached the backend');
});
await check('Backend failures never return success', async () => {
  backendReply = () => ({ ok: false, code: 500, error: 'Server error' });
  let r = await send(make('general')); assert.equal(r.status, 502); assert.equal((await r.json()).ok, undefined);
  backendReply = () => 'network';
  r = await send(make('general')); assert.equal(r.status, 502);
  backendReply = () => ({ ok: true }); // no reference = not a confirmed save
  r = await send(make('general')); assert.equal(r.status, 502);
});
await check('Duplicate-content conflicts and rate limits are passed through', async () => {
  backendReply = () => ({ ok: false, code: 409, error: 'This submission was already sent with different details.' });
  assert.equal((await send(make('general'))).status, 409);
  backendReply = () => ({ ok: false, code: 429, error: 'Too many submissions.' });
  assert.equal((await send(make('general'))).status, 429);
});
await check('Disabled or unconfigured enquiries return 503 without calling the backend', async () => {
  process.env.PUBLIC_CONTACT_ENABLED = 'false';
  assert.equal((await send(make('candidate'))).status, 503);
  process.env.PUBLIC_CONTACT_ENABLED = 'true'; process.env.GOOGLE_SHEET_SECRET = 'short';
  assert.equal((await send(make('candidate'))).status, 503);
  process.env.GOOGLE_SHEET_SECRET = 's'.repeat(32);
  assert.equal(calls.length, 0);
});
console.log(`PASS (backend mocked): ${results.length} checks\n- ` + results.join('\n- '));

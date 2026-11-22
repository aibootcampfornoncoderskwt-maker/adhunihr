// Runs google/apps-script/Code.gs against in-memory fakes of the Google services it uses (MOCKED, not live Google).
// Checks: setup is repeatable, saves, Drive files, duplicates, idempotency conflicts, email failure and bounded retries,
// orphaned uploads, formula safety, search/filter/paging, optimistic concurrency, sessions and rate limits.
//   node scripts/check-apps-script.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { makeGoogle } from './lib/fake-google.mjs';

const g = makeGoogle();
const ctx = vm.createContext(g.context);
vm.runInContext(readFileSync('google/apps-script/Code.gs', 'utf8'), ctx, { filename: 'Code.gs' });
const call = body => JSON.parse(ctx.doPost({ postData: { contents: JSON.stringify({ secret: 'x'.repeat(40), ...body }) } }).content);
const results = [];
const check = (name, fn) => { fn(); results.push(name); };
const sheet = name => g.sheets.find(s => s.name === name);
const rows = name => { const s = sheet(name); const [head, ...rest] = s.data; return rest.map(r => Object.fromEntries(head.map((h, i) => [h, r[i] ?? '']))); };
const pdf = Buffer.from('%PDF-1.4\n% test cv\n').toString('base64');

check('Field list matches src/data/enquiry-fields.json', () => {
  const fields = JSON.parse(readFileSync('src/data/enquiry-fields.json', 'utf8'));
  for (const type of ['candidate', 'employer', 'general']) {
    const script = vm.runInContext(`TABS.${type}.fields`, ctx).map(f => f[0]);
    const site = fields[type].filter(f => f.type !== 'file').map(f => f.name);
    for (const name of site) assert.ok(script.includes(name), `${type}.${name} missing from Code.gs`);
  }
});

check('setup() creates tabs, private folders and one trigger, and is safe to run again', () => {
  ctx.setup(); ctx.setup();
  for (const n of ['Candidates', 'Client Requests', 'General Enquiries', '_Submission keys']) assert.equal(g.sheets.filter(s => s.name === n).length, 1, n);
  assert.equal(sheet('_Submission keys').hidden, true);
  assert.equal(sheet('Candidates').data.length, 1, 'header only');
  assert.equal(g.triggers.filter(t => t.getHandlerFunction() === 'retryNotifications').length, 1);
  const names = [...g.folders.values()].map(f => f.getName());
  for (const n of ['Adhuni HR CRM', 'Candidate CVs', 'Enquiry Attachments']) assert.equal(names.filter(x => x === n).length, 1, n);
});

check('Requests without the shared secret are refused', () => {
  const r = JSON.parse(ctx.doPost({ postData: { contents: JSON.stringify({ action: 'list', secret: 'wrong' }) } }).content);
  assert.equal(r.ok, false); assert.equal(r.code, 401);
});

const candidate = { name: 'Asha Menon', phone: '+91 90000 00000', email: 'asha@example.com', current_location: 'Kochi', country: 'Kuwait', job_category: 'Healthcare', current_most_recent_designation: 'Staff Nurse', total_experience: '6 years', highest_qualification: 'BSc Nursing', passport_status: 'Valid', availability_notice_period: '30 days', key_skills: 'ICU, ventilator care', additional_information: '=HYPERLINK("http://evil")' };
let ref1;
check('Valid candidate submission saves every field, the CV in Drive, and sends the email', () => {
  const r = call({ action: 'submit', type: 'candidate', fields: candidate, file: { extension: 'pdf', base64: pdf }, idempotencyKey: 'key-candidate-0001', source: '/candidates/', language: 'en', consent: true, ip: '1.1.1.1' });
  assert.equal(r.ok, true); assert.match(r.reference, /^CAN-\d{6}-[A-Z2-9]{5}$/); ref1 = r.reference;
  const rec = rows('Candidates')[0];
  assert.equal(rec['Full Name'], 'Asha Menon'); assert.equal(rec['Key Skills'], 'ICU, ventilator care'); assert.equal(rec['Availability / Notice Period'], '30 days');
  assert.equal(rec['Status'], 'New'); assert.equal(rec['Consent'], 'Yes'); assert.ok(rec['Consent at']); assert.equal(rec['Source page'], '/candidates/');
  assert.equal(rec['Additional Information'], `'=HYPERLINK("http://evil")`, 'formula text stored with a leading apostrophe');
  const file = g.files.get(rec['File ID']);
  assert.ok(file && file._raw.name === `${ref1}-CV.pdf`, 'CV named with the reference');
  assert.equal(g.folders.get(file._raw.folder).getName(), 'Candidate CVs');
  assert.equal(rec['Notification'], 'Sent');
  const mail = g.outbox.at(-1);
  assert.equal(mail.to, 'nidhaladhuni@adhunihr.com'); assert.equal(mail.subject, `New Candidate CV | Adhuni | ${ref1}`); assert.equal(mail.replyTo, 'asha@example.com');
  assert.ok(mail.htmlBody.includes('Staff Nurse') && mail.htmlBody.includes(rec['File link']));
});

check('Retrying with the same key returns the same record (no duplicate)', () => {
  const r = call({ action: 'submit', type: 'candidate', fields: candidate, file: { extension: 'pdf', base64: pdf }, idempotencyKey: 'key-candidate-0001', ip: '1.1.1.1', consent: true });
  assert.equal(r.reference, ref1); assert.equal(r.duplicate, true);
  assert.equal(rows('Candidates').length, 1); assert.equal([...g.files.values()].length, 1, 'no second upload');
});

check('Same key with different content is rejected', () => {
  const r = call({ action: 'submit', type: 'candidate', fields: { ...candidate, name: 'Someone Else' }, idempotencyKey: 'key-candidate-0001', ip: '1.1.1.1', consent: true });
  assert.equal(r.ok, false); assert.equal(r.code, 409); assert.equal(rows('Candidates').length, 1);
});

const employer = { company: 'Gulf Care Hospital', name: 'Omar Ali', designation: 'HR Manager', email: 'omar@example.com', phone: '+965 5000 0000', service: 'permanent-recruitment', country: 'Kuwait', industry: 'Healthcare', position_job_title: 'ICU Nurse', number_of_vacancies: '12', qualification: 'BSc Nursing', experience_required: '3+ years', work_location: 'Kuwait City', salary_benefits: 'KWD 450 + housing', expected_joining_date: '2027-01-15', job_description: 'Adult ICU', additional_requirements: 'Licence eligible' };
let ref2;
check('Valid employer submission saves every field', () => {
  const r = call({ action: 'submit', type: 'employer', fields: employer, idempotencyKey: 'key-employer-00001', ip: '2.2.2.2', consent: true });
  assert.equal(r.ok, true); assert.match(r.reference, /^REQ-/); ref2 = r.reference;
  const rec = rows('Client Requests')[0];
  for (const [label, value] of [['Company Name', 'Gulf Care Hospital'], ['Recruitment Service', 'permanent-recruitment'], ['Number of Vacancies', '12'], ['Expected Joining Date', '2027-01-15'], ['Salary / Benefits', 'KWD 450 + housing']]) assert.equal(rec[label], value);
  assert.equal(g.outbox.at(-1).subject, `New Hiring Request | Adhuni | ${ref2}`);
});

check('General enquiry saves, with its optional attachment in Enquiry Attachments', () => {
  const r = call({ action: 'submit', type: 'general', fields: { name: 'Lina', email: 'lina@example.com', phone: '+973 3000 0000', country: 'Bahrain', enquiry_type: 'General enquiry', subject: 'Partnership', message: 'Hello' }, file: { extension: 'pdf', base64: pdf }, idempotencyKey: 'key-general-000001', ip: '3.3.3.3', consent: true });
  assert.equal(r.ok, true); assert.match(r.reference, /^ENQ-/);
  const rec = rows('General Enquiries')[0];
  assert.equal(g.folders.get(g.files.get(rec['File ID'])._raw.folder).getName(), 'Enquiry Attachments');
  assert.equal(g.outbox.at(-1).subject, `New Website Enquiry | Adhuni | ${r.reference}`);
});

check('Oversized or unknown file types are rejected and nothing is saved', () => {
  const before = rows('General Enquiries').length;
  const big = call({ action: 'submit', type: 'general', fields: { name: 'A', email: 'a@example.com' }, file: { extension: 'pdf', base64: Buffer.alloc(2 * 1024 * 1024 + 1).toString('base64') }, idempotencyKey: 'key-general-big-01', ip: '3.3.3.4', consent: true });
  const exe = call({ action: 'submit', type: 'general', fields: { name: 'A', email: 'a@example.com' }, file: { extension: 'exe', base64: pdf }, idempotencyKey: 'key-general-exe-01', ip: '3.3.3.4', consent: true });
  assert.equal(big.ok, false); assert.equal(exe.ok, false); assert.equal(rows('General Enquiries').length, before);
});

check('If the sheet cannot be written, the request fails and the uploaded file is removed', () => {
  sheet('Candidates').failAppend = true;
  const r = call({ action: 'submit', type: 'candidate', fields: { ...candidate, email: 'x@example.com' }, file: { extension: 'pdf', base64: pdf }, idempotencyKey: 'key-candidate-fail1', ip: '4.4.4.4', consent: true });
  sheet('Candidates').failAppend = false;
  assert.equal(r.ok, false);
  const orphan = [...g.files.values()].find(f => f._raw.name.endsWith('-CV.pdf') && !rows('Candidates').some(x => x['File ID'] === f.getId()));
  assert.ok(orphan && orphan.isTrashed(), 'orphaned upload moved to the bin');
  assert.equal(rows('Candidates').length, 1);
});

let ref3;
check('Email failure keeps the saved record and marks it pending', () => {
  g.setMailFails(true);
  const r = call({ action: 'submit', type: 'candidate', fields: { ...candidate, email: 'mail-fail@example.com' }, idempotencyKey: 'key-candidate-mail1', ip: '5.5.5.5', consent: true });
  assert.equal(r.ok, true); assert.equal(r.notification, 'pending'); ref3 = r.reference;
  const rec = rows('Candidates').find(x => x.Reference === ref3);
  assert.equal(rec['Notification'], 'Pending'); assert.equal(rec['Notification attempts'], '1'); assert.match(rec['Notification error'], /too many times/);
});

check('Automatic retries stop after 5 attempts and the record is marked failed', () => {
  for (let i = 0; i < 8; i++) ctx.retryNotifications();
  const rec = rows('Candidates').find(x => x.Reference === ref3);
  assert.equal(rec['Notification attempts'], '5'); assert.equal(rec['Notification'], 'Failed');
});

const sessionHash = createHash('sha256').update('token-1').digest('hex');
check('CRM data needs a session; sessions expire and can be revoked', () => {
  assert.equal(call({ action: 'list', type: 'candidate', session: sessionHash }).code, 401);
  assert.equal(call({ action: 'session.create', sessionHash }).ok, true);
  assert.equal(call({ action: 'session.check', session: sessionHash }).ok, true);
  g.tick(4 * 60 * 60 * 1000 + 1000);
  assert.equal(call({ action: 'session.check', session: sessionHash }).code, 401, 'expired after 4 hours');
  call({ action: 'session.create', sessionHash });
  call({ action: 'session.revoke', session: sessionHash });
  assert.equal(call({ action: 'session.check', session: sessionHash }).code, 401, 'revoked on logout');
  call({ action: 'session.create', sessionHash });
});

check('Admin email retry works once email is available again', () => {
  g.setMailFails(false);
  const r = call({ action: 'notify.retry', session: sessionHash, type: 'candidate', reference: ref3 });
  assert.equal(r.ok, true); assert.equal(r.notification, 'Sent');
});

check('Search, filters and paging', () => {
  for (let i = 0; i < 30; i++) call({ action: 'submit', type: 'candidate', fields: { ...candidate, name: `Candidate ${i}`, email: `c${i}@example.com`, country: i % 2 ? 'Qatar' : 'Kuwait' }, idempotencyKey: `key-bulk-${String(i).padStart(10, '0')}`, ip: `9.9.9.${i}`, consent: true });
  const page1 = call({ action: 'list', session: sessionHash, type: 'candidate', page: 1, pageSize: 10 });
  assert.equal(page1.total, 32); assert.equal(page1.records.length, 10);
  const page4 = call({ action: 'list', session: sessionHash, type: 'candidate', page: 4, pageSize: 10 });
  assert.equal(page4.records.length, 2);
  assert.equal(call({ action: 'list', session: sessionHash, type: 'candidate', filters: { q: 'candidate 7' } }).total, 1);
  assert.equal(call({ action: 'list', session: sessionHash, type: 'candidate', filters: { country: 'Qatar' } }).total, 15);
  assert.equal(call({ action: 'list', session: sessionHash, type: 'candidate', filters: { q: 'ventilator', status: 'New' } }).total, 32);
  assert.equal(call({ action: 'list', session: sessionHash, type: 'candidate', filters: { from: '2099-01-01' } }).total, 0);
});

check('Status and notes updates persist; stale edits are rejected', () => {
  const rec = call({ action: 'get', session: sessionHash, type: 'employer', reference: ref2 }).record;
  g.tick(2000);
  const saved = call({ action: 'update', session: sessionHash, type: 'employer', reference: ref2, status: 'Sourcing', notes: '+ called client', expectedUpdatedAt: rec.updatedAt });
  assert.equal(saved.ok, true); assert.equal(saved.record.status, 'Sourcing');
  const row = rows('Client Requests')[0];
  assert.equal(row['Status'], 'Sourcing'); assert.equal(row['Internal notes'], `'+ called client`);
  assert.equal(saved.record.notes, '+ called client', 'the protective apostrophe is not shown in the CRM');
  const stale = call({ action: 'update', session: sessionHash, type: 'employer', reference: ref2, status: 'Closed', expectedUpdatedAt: rec.updatedAt });
  assert.equal(stale.code, 409); assert.equal(rows('Client Requests')[0]['Status'], 'Sourcing');
  assert.equal(call({ action: 'update', session: sessionHash, type: 'employer', reference: ref2, status: 'Hired!', expectedUpdatedAt: saved.record.updatedAt }).code, 400, 'unknown status');
});

check('Document download returns the stored file to an authorised session', () => {
  const r = call({ action: 'file', session: sessionHash, type: 'candidate', reference: ref1 });
  assert.equal(r.ok, true); assert.equal(Buffer.from(r.base64, 'base64').toString().slice(0, 5), '%PDF-');
});

check('Submissions and failed logins are rate limited', () => {
  const tries = Array.from({ length: 10 }, (_, i) => call({ action: 'submit', type: 'general', fields: { name: 'Spam', email: 's@example.com' }, idempotencyKey: `key-spam-${String(i).padStart(8, '0')}`, ip: '6.6.6.6', consent: true }));
  assert.equal(tries.filter(t => t.ok).length, 8); assert.equal(tries.at(-1).code, 429);
  for (let i = 0; i < 5; i++) call({ action: 'login.failed', ip: '7.7.7.7' });
  assert.equal(call({ action: 'login.check', ip: '7.7.7.7' }).allowed, false);
  assert.equal(call({ action: 'login.check', ip: '8.8.8.8' }).allowed, true);
});

check('Overview and system status report real counts', () => {
  const o = call({ action: 'overview', session: sessionHash });
  assert.equal(o.counts.candidate.total, 32); assert.equal(o.counts.employer.total, 1);
  const s = call({ action: 'status', session: sessionHash });
  assert.equal(s.trigger, true); assert.ok(s.folders.every(f => f.ok));
});

console.log(`PASS (mocked Google services): ${results.length} checks\n- ` + results.join('\n- '));

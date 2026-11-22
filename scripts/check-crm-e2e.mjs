// End-to-end browser test of the enquiry forms, thank-you popups and CRM, against the LOCAL MOCK backend
// (scripts/mock-backend.mjs runs the real Code.gs with fake Google services). Nothing reaches Google.
// Arabic pages exist only in a build (dist/client/ar/...); the build check covers their popup text.
// Needs: mock backend on :4455 and `npm run dev` on :4321 started with the env shown in docs/crm-setup.md (Local testing).
//   node scripts/check-crm-e2e.mjs [screenshot-dir]
import assert from 'node:assert/strict';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright-core';

const BASE = process.env.E2E_BASE || 'http://localhost:4321';
const PASSWORD = process.env.E2E_PASSWORD || 'Local test password 1';
const shots = process.argv[2] || mkdtempSync(join(tmpdir(), 'adhuni-e2e-'));
const pdfPath = join(shots, 'cv.pdf');
writeFileSync(pdfPath, '%PDF-1.4\n% e2e test CV\n');
let browser;
for (const channel of ['msedge', 'chrome']) { try { browser = await chromium.launch({ channel, headless: true }); break; } catch { /* try next */ } }
const results = [];
const check = async (name, fn) => { await fn(); results.push(name); };
const outbox = async () => (await fetch('http://127.0.0.1:4455/_outbox')).json();

async function fillCommon(page, form, values) {
  for (const [name, value] of Object.entries(values)) {
    const control = form.locator(`[name="${name}"]`).first();
    if ((await control.evaluate(e => e.tagName)) === 'SELECT') await control.selectOption({ index: 1 });
    else await control.fill(value);
  }
  await form.locator('input[name=consent]').check();
}

await check('Candidate form: CV upload saves, popup shows the reference (desktop)', async () => {
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  await page.goto(BASE + '/candidates/'); await page.waitForTimeout(800);
  const form = page.locator('form[data-contact-form]').filter({ has: page.locator('input[name=type][value=candidate]') });
  await fillCommon(page, form, { name: 'Asha Menon', phone: '+91 90000 00000', email: 'asha@example.com', current_location: 'Kochi', country: '', job_category: '' });
  await form.locator('input[type=file]').setInputFiles(pdfPath);
  const before = (await outbox()).length;
  // Two quick clicks: only one record may be created.
  const submit = form.locator('[type=submit]');
  await submit.click(); await submit.click({ force: true, timeout: 1000 }).catch(() => {});
  const dialog = page.locator('#thank-you-dialog');
  await dialog.waitFor({ state: 'visible', timeout: 20000 });
  assert.equal(await dialog.locator('.ty-variant:not([hidden]) h2').textContent(), 'Thank you for submitting your CV');
  const ref = await dialog.locator('.ty-variant:not([hidden]) [data-ty-ref]').textContent();
  assert.match(ref, /^CAN-\d{6}-[A-Z2-9]{5}$/);
  assert.ok(await page.evaluate(() => document.querySelector('#thank-you-dialog').contains(document.activeElement)), 'focus moved into the dialog');
  await page.screenshot({ path: join(shots, 'popup-candidate-desktop.png') });
  await page.keyboard.press('Escape');
  assert.equal(await dialog.isVisible(), false, 'Escape closes it');
  await page.waitForTimeout(500);
  const mails = (await outbox()).slice(before);
  assert.equal(mails.length, 1, 'one record, one email, despite the double click');
  assert.equal(mails[0].subject, `New Candidate CV | Adhuni | ${ref}`);
  await page.close();
});

await check('Employer form: popup on mobile', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(BASE + '/employers/'); await page.waitForTimeout(800);
  const form = page.locator('form[data-contact-form]').filter({ has: page.locator('input[name=type][value=employer]') }).first();
  await fillCommon(page, form, { company: 'Gulf Care Hospital', name: 'Omar Ali', email: 'omar@example.com', phone: '+965 5000 0000', country: '', industry: '', position_job_title: 'ICU Nurse', number_of_vacancies: '12' });
  await form.locator('[type=submit]').click();
  const dialog = page.locator('#thank-you-dialog');
  await dialog.waitFor({ state: 'visible', timeout: 20000 });
  assert.equal(await dialog.locator('.ty-variant:not([hidden]) h2').textContent(), 'Thank you for your recruitment enquiry');
  const box = await dialog.locator('.ty-card').boundingBox();
  assert.ok(box.width <= 390 && box.x >= 0, 'fits the phone screen');
  await page.screenshot({ path: join(shots, 'popup-employer-mobile.png') });
  await dialog.locator('[data-ty-close]').click();
  await page.close();
});

await check('General contact form still works', async () => {
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  await page.goto(BASE + '/contact/'); await page.waitForTimeout(800);
  const form = page.locator('#general-enquiry form[data-contact-form]');
  await fillCommon(page, form, { name: 'Lina', email: 'lina@example.com', phone: '+973 3000 0000', country: '', enquiry_type: '', message: 'Hello' });
  await form.locator('[type=submit]').click();
  const dialog = page.locator('#thank-you-dialog');
  await dialog.waitFor({ state: 'visible', timeout: 20000 });
  assert.equal(await dialog.locator('.ty-variant:not([hidden]) h2').textContent(), 'Thank you for contacting Adhuni');
  await page.screenshot({ path: join(shots, 'popup-general.png') });
  await page.close();
});

await check('Failed save keeps the entries and shows no success', async () => {
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  await page.route('**/api/contact', route => route.fulfill({ status: 502, contentType: 'application/json', body: JSON.stringify({ error: 'We could not save your details just now. Nothing was submitted, and your entries are still in the form. Please try again in a moment.' }) }));
  await page.goto(BASE + '/contact/'); await page.waitForTimeout(600);
  const form = page.locator('#general-enquiry form[data-contact-form]');
  await fillCommon(page, form, { name: 'Keep Me', email: 'keep@example.com', phone: '+973 3000 0001', country: '', enquiry_type: '', message: 'Do not lose this' });
  await form.locator('[type=submit]').click();
  await page.waitForTimeout(800);
  assert.equal(await page.locator('#thank-you-dialog').isVisible(), false);
  assert.equal(await form.locator('[name=message]').inputValue(), 'Do not lose this');
  assert.match(await form.locator('.form-status').textContent(), /could not save/);
  await page.close();
});

await check('CRM: pages need login; login, list, open, update, persist, export, logout', async () => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  const page = await context.newPage();
  await page.goto(BASE + '/crm/candidates');
  assert.match(page.url(), /\/crm\/login$/, 'redirected to login');
  await page.fill('input[name=password]', 'wrong password');
  await page.click('button[type=submit]');
  await page.waitForTimeout(600);
  assert.match(await page.locator('.crm-login-error').textContent(), /not correct/);
  await page.fill('input[name=password]', PASSWORD);
  await page.click('button[type=submit]');
  await page.waitForURL(/\/crm\/$/);
  await page.waitForSelector('.crm-stat');
  await page.screenshot({ path: join(shots, 'crm-overview.png') });
  await page.goto(BASE + '/crm/candidates');
  await page.waitForSelector('.crm-table tbody tr');
  await page.screenshot({ path: join(shots, 'crm-candidates.png') });
  await page.locator('.crm-table tbody tr').first().locator('.crm-link').click();
  await page.waitForSelector('.crm-drawer .crm-edit');
  await page.selectOption('.crm-drawer select[name=status]', 'Shortlisted');
  await page.fill('.crm-drawer textarea[name=notes]', 'Strong ICU profile');
  await page.click('.crm-drawer .crm-edit button[type=submit]');
  await page.waitForSelector('.crm-save-msg.is-ok');
  await page.screenshot({ path: join(shots, 'crm-record.png') });
  await page.reload();
  await page.waitForSelector('.crm-drawer .crm-edit');
  assert.equal(await page.locator('.crm-drawer select[name=status]').inputValue(), 'Shortlisted', 'status persisted');
  assert.equal(await page.locator('.crm-drawer textarea[name=notes]').inputValue(), 'Strong ICU profile', 'notes persisted');
  const [download] = await Promise.all([page.waitForEvent('download'), page.locator('.crm-drawer a.crm-btn').first().click()]);
  assert.match(download.suggestedFilename(), /^CAN-.*-CV\.pdf$/);
  await page.keyboard.press('Escape');
  const [csv] = await Promise.all([page.waitForEvent('download'), page.click('[data-export]')]);
  assert.match(csv.suggestedFilename(), /^adhuni-candidates-\d{4}-\d{2}-\d{2}\.csv$/);
  await page.click('[data-logout]');
  await page.waitForURL(/\/crm\/login$/);
  await page.goto(BASE + '/crm/');
  assert.match(page.url(), /\/crm\/login$/, 'logged out');
  const api = await page.request.get(BASE + '/api/crm/list?type=candidate');
  assert.equal(api.status(), 401);
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto(BASE + '/crm/login');
  await mobile.screenshot({ path: join(shots, 'crm-login-mobile.png') });
  await context.close();
});

await browser.close();
console.log(`PASS (end to end against the local MOCK backend): ${results.length} checks\nScreenshots: ${shots}\n- ` + results.join('\n- '));

/**
 * Adhuni HR Solutions: recruitment CRM backend (Google Apps Script web app).
 *
 * Google Sheets is the record store, Google Drive holds uploaded files privately, MailApp sends the
 * notification emails. The website and the CRM never call this script from a browser: only the
 * website's server (Vercel) calls it, with the shared API_SECRET.
 *
 * Script Properties (Project Settings > Script properties):
 *   API_SECRET      required. Long random string; the same value as GOOGLE_SHEET_SECRET on Vercel.
 *   NOTIFY_EMAIL    optional. Default nidhaladhuni@adhunihr.com
 *   CRM_BASE_URL    optional. e.g. https://crm.adhunihrsolutions.com (adds "Open in CRM" links to emails)
 *   SPREADSHEET_ID  optional. Only needed if this script is not bound to the CRM spreadsheet.
 * Written by setup(): ROOT_FOLDER_ID, CV_FOLDER_ID, ATTACHMENT_FOLDER_ID.
 *
 * First run: choose setup in the editor toolbar and press Run (authorise when asked). It is safe to run again.
 */

var DEFAULT_NOTIFY_EMAIL = 'nidhaladhuni@adhunihr.com';
var MAX_FILE_BYTES = 2 * 1024 * 1024;
var MAX_NOTIFY_ATTEMPTS = 5;          // automatic retries stop after this many attempts
var SESSION_SECONDS = 4 * 60 * 60;    // CRM session lifetime (CacheService allows up to 6 hours)
var SUBMIT_LIMIT = { count: 8, seconds: 600 };   // per visitor IP
var LOGIN_LIMIT = { count: 5, seconds: 900 };    // failed logins per IP
var LOGIN_GLOBAL_LIMIT = { count: 30, seconds: 900 };

var META_START = ['Reference', 'Submitted at', 'Status', 'Internal notes', 'Last updated', 'Source page', 'Language', 'Consent', 'Consent at'];
var META_END = ['File name', 'File ID', 'File link', 'Notification', 'Notification attempts', 'Notification error', 'Idempotency key', 'Content hash'];

// Field keys and labels mirror src/data/enquiry-fields.json (scripts/check-apps-script.mjs checks they match).
var TABS = {
  candidate: {
    sheet: 'Candidates', prefix: 'CAN', folder: 'CV_FOLDER_ID', subject: 'New Candidate CV',
    statuses: ['New', 'Reviewing', 'Contacted', 'Shortlisted', 'Placed', 'Not suitable', 'Archived'],
    fields: [['name', 'Full Name'], ['phone', 'Phone'], ['email', 'Email'], ['current_location', 'Current Location'], ['country', 'Preferred Country'], ['job_category', 'Job Category'], ['current_most_recent_designation', 'Current / Most Recent Designation'], ['total_experience', 'Total Experience'], ['highest_qualification', 'Highest Qualification'], ['passport_status', 'Passport Status'], ['availability_notice_period', 'Availability / Notice Period'], ['key_skills', 'Key Skills'], ['additional_information', 'Additional Information']]
  },
  employer: {
    sheet: 'Client Requests', prefix: 'REQ', folder: 'ATTACHMENT_FOLDER_ID', subject: 'New Hiring Request',
    statuses: ['New', 'Contacted', 'Requirements confirmed', 'Sourcing', 'Candidates shared', 'Closed', 'Archived'],
    fields: [['company', 'Company Name'], ['name', 'Contact Person'], ['designation', 'Designation'], ['email', 'Email'], ['phone', 'Phone'], ['service', 'Recruitment Service'], ['country', 'Country'], ['industry', 'Industry'], ['position_job_title', 'Position / Job Title'], ['number_of_vacancies', 'Number of Vacancies'], ['qualification', 'Qualification'], ['experience_required', 'Experience Required'], ['work_location', 'Work Location'], ['salary_benefits', 'Salary / Benefits'], ['expected_joining_date', 'Expected Joining Date'], ['job_description', 'Job Description'], ['additional_requirements', 'Additional Requirements']]
  },
  general: {
    sheet: 'General Enquiries', prefix: 'ENQ', folder: 'ATTACHMENT_FOLDER_ID', subject: 'New Website Enquiry',
    statuses: ['New', 'In progress', 'Closed', 'Archived'],
    fields: [['name', 'Name'], ['company', 'Company Name'], ['email', 'Email'], ['phone', 'Phone'], ['country', 'Country'], ['enquiry_type', 'Enquiry Type'], ['number_of_vacancies', 'Number of vacancies'], ['expected_joining_date', 'Expected start date'], ['subject', 'Subject'], ['message', 'Message']]
  }
};
var KEYS_SHEET = '_Submission keys';

/* ------------------------------------------------------------------ entry point */

function doPost(e) {
  var body;
  try { body = JSON.parse(e && e.postData ? e.postData.contents : '{}'); } catch (err) { return reply({ ok: false, code: 400, error: 'Invalid JSON' }); }
  var secret = props().getProperty('API_SECRET');
  if (!secret || typeof body.secret !== 'string' || !safeEqual(body.secret, secret)) return reply({ ok: false, code: 401, error: 'Not authorised' });
  try {
    return reply(route(body));
  } catch (err) {
    console.error(err && err.stack ? err.stack : err);
    return reply({ ok: false, code: 500, error: 'Server error' });
  }
}

function doGet() {
  // The web app has no public pages. A plain GET only confirms the deployment is alive.
  return reply({ ok: true, service: 'adhuni-crm' });
}

function route(body) {
  var action = String(body.action || '');
  if (action === 'submit') return submit(body);
  if (action === 'login.check') return loginCheck(body);
  if (action === 'login.failed') return loginFailed(body);
  if (action === 'session.create') return sessionCreate(body);
  if (action === 'session.revoke') return sessionRevoke(body);
  if (action === 'ping') return { ok: true };
  // Everything below needs a valid CRM session.
  if (!sessionValid(body.session)) return { ok: false, code: 401, error: 'Session expired' };
  if (action === 'session.check') return { ok: true };
  if (action === 'overview') return overview();
  if (action === 'list') return list(body);
  if (action === 'get') return getRecord(body);
  if (action === 'update') return update(body);
  if (action === 'file') return fileDownload(body);
  if (action === 'notify.retry') return notifyRetry(body);
  if (action === 'status') return systemStatus();
  return { ok: false, code: 400, error: 'Unknown action' };
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* ------------------------------------------------------------------ setup (idempotent) */

function setup() {
  var ss = spreadsheet();
  Object.keys(TABS).forEach(function (type) { ensureSheet(ss, type); });
  var keys = ss.getSheetByName(KEYS_SHEET) || ss.insertSheet(KEYS_SHEET);
  if (keys.getLastRow() === 0) keys.getRange(1, 1, 1, 5).setValues([['Idempotency key', 'Content hash', 'Reference', 'Type', 'Created']]);
  keys.hideSheet();
  var defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1 && defaultSheet.getLastRow() === 0) ss.deleteSheet(defaultSheet);

  var p = props();
  var root = ensureFolder(p.getProperty('ROOT_FOLDER_ID'), DriveApp.getRootFolder(), 'Adhuni HR CRM');
  p.setProperty('ROOT_FOLDER_ID', root.getId());
  p.setProperty('CV_FOLDER_ID', ensureFolder(p.getProperty('CV_FOLDER_ID'), root, 'Candidate CVs').getId());
  p.setProperty('ATTACHMENT_FOLDER_ID', ensureFolder(p.getProperty('ATTACHMENT_FOLDER_ID'), root, 'Enquiry Attachments').getId());
  if (!p.getProperty('NOTIFY_EMAIL')) p.setProperty('NOTIFY_EMAIL', DEFAULT_NOTIFY_EMAIL);

  var exists = ScriptApp.getProjectTriggers().some(function (t) { return t.getHandlerFunction() === 'retryNotifications'; });
  if (!exists) ScriptApp.newTrigger('retryNotifications').timeBased().everyMinutes(15).create();
  if (!p.getProperty('API_SECRET')) console.warn('Set the API_SECRET script property before deploying.');
  return 'Setup complete: ' + ss.getUrl();
}

function ensureSheet(ss, type) {
  var cfg = TABS[type];
  var sheet = ss.getSheetByName(cfg.sheet) || ss.insertSheet(cfg.sheet);
  var headers = META_START.concat(cfg.fields.map(function (f) { return f[1]; })).concat(META_END);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  } else {
    var current = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    headers.forEach(function (h) { if (current.indexOf(h) === -1) { sheet.getRange(1, sheet.getLastColumn() + 1).setValue(h); current.push(h); } });
  }
  var width = sheet.getLastColumn();
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(1);
  sheet.getRange(1, 1, 1, width).setFontWeight('bold').setFontColor('#ffffff').setBackground('#12365a').setWrap(true).setVerticalAlignment('middle');
  sheet.setRowHeight(1, 42);
  for (var c = 1; c <= width; c++) sheet.setColumnWidth(c, 170);
  var cols = headerMap(sheet);
  ['Internal notes', 'Message', 'Job Description', 'Additional Requirements', 'Key Skills', 'Additional Information', 'Notification error'].forEach(function (h) {
    if (cols[h]) { sheet.setColumnWidth(cols[h], 320); sheet.getRange(2, cols[h], sheet.getMaxRows() - 1, 1).setWrap(true); }
  });
  sheet.setColumnWidth(cols['Reference'], 150);
  // Text format everywhere, so nothing a visitor types is read as a number, date or formula.
  sheet.getRange(2, 1, sheet.getMaxRows() - 1, width).setNumberFormat('@').setVerticalAlignment('top');
  var rule = SpreadsheetApp.newDataValidation().requireValueInList(cfg.statuses, true).setAllowInvalid(false).build();
  sheet.getRange(2, cols['Status'], sheet.getMaxRows() - 1, 1).setDataValidation(rule);
  if (sheet.getBandings().length === 0) sheet.getRange(1, 1, sheet.getMaxRows(), width).applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, true, false);
  if (!sheet.getFilter()) sheet.getRange(1, 1, sheet.getMaxRows(), width).createFilter();
  return sheet;
}

function ensureFolder(id, parent, name) {
  if (id) { try { var f = DriveApp.getFolderById(id); if (!f.isTrashed()) return f; } catch (err) { /* recreate below */ } }
  var found = parent.getFoldersByName(name);
  return found.hasNext() ? found.next() : parent.createFolder(name);
}

/* ------------------------------------------------------------------ submissions */

function submit(body) {
  var type = String(body.type || '');
  var cfg = TABS[type];
  if (!cfg) return { ok: false, code: 400, error: 'Unknown form' };
  if (!rateAllow('sub:' + (body.ip || 'unknown'), SUBMIT_LIMIT)) return { ok: false, code: 429, error: 'Too many submissions. Please wait a few minutes and try again.' };
  var fields = body.fields || {};
  var key = String(body.idempotencyKey || '');
  if (!/^[A-Za-z0-9_-]{16,80}$/.test(key)) return { ok: false, code: 400, error: 'Invalid submission key' };
  var file = body.file && body.file.base64 ? body.file : null;
  var hash = contentHash(type, fields, file);

  var lock = LockService.getScriptLock();
  lock.waitLock(25000);
  var fileObj = null;
  try {
    var ss = spreadsheet();
    var previous = findKey(ss, key);
    if (previous) {
      if (previous.hash !== hash) return { ok: false, code: 409, error: 'This submission was already sent with different details. Please reload the page and submit again.' };
      return { ok: true, reference: previous.reference, duplicate: true };
    }
    var sheet = ensureSheetQuick(ss, type);
    var cols = headerMap(sheet);
    var reference = newReference(sheet, cols, cfg.prefix);
    var now = new Date();
    var stamp = iso(now);

    if (file) {
      var ext = String(file.extension || '').toLowerCase();
      var mime = { pdf: 'application/pdf', doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }[ext];
      var bytes = Utilities.base64Decode(String(file.base64));
      if (!mime || bytes.length === 0 || bytes.length > MAX_FILE_BYTES) return { ok: false, code: 400, error: 'Please attach a PDF, DOC or DOCX file of 2 MB or less.' };
      var folder = DriveApp.getFolderById(props().getProperty(cfg.folder) || setupFolders()[cfg.folder]);
      var label = type === 'candidate' ? 'CV' : 'attachment';
      fileObj = folder.createFile(Utilities.newBlob(bytes, mime, reference + '-' + label + '.' + ext));
    }

    var row = new Array(sheet.getLastColumn());
    for (var i = 0; i < row.length; i++) row[i] = '';
    var put = function (header, value) { if (cols[header]) row[cols[header] - 1] = safeCell(value); };
    put('Reference', reference);
    put('Submitted at', stamp);
    put('Status', 'New');
    put('Last updated', stamp);
    put('Source page', String(body.source || '').slice(0, 300));
    put('Language', body.language === 'ar' ? 'Arabic' : 'English');
    put('Consent', body.consent ? 'Yes' : 'No');
    put('Consent at', body.consent ? stamp : '');
    cfg.fields.forEach(function (f) { put(f[1], fields[f[0]] == null ? '' : String(fields[f[0]]).slice(0, 4000)); });
    if (fileObj) { put('File name', fileObj.getName()); put('File ID', fileObj.getId()); put('File link', fileObj.getUrl()); }
    put('Notification', 'Pending');
    put('Notification attempts', '0');
    put('Idempotency key', key);
    put('Content hash', hash);
    sheet.appendRow(row);
    ss.getSheetByName(KEYS_SHEET).appendRow([key, hash, reference, type, stamp]);
    SpreadsheetApp.flush();
  } catch (err) {
    // The record was not saved: do not leave an orphaned upload behind.
    if (fileObj) { try { fileObj.setTrashed(true); } catch (e2) { /* ignore */ } }
    throw err;
  } finally {
    lock.releaseLock();
  }
  // Saved. Now try the email; a failure is recorded on the row and retried later, never reported to the visitor.
  var notified = sendNotification(type, reference);
  return { ok: true, reference: reference, notification: notified ? 'sent' : 'pending' };
}

function ensureSheetQuick(ss, type) {
  var sheet = ss.getSheetByName(TABS[type].sheet);
  if (!sheet || sheet.getLastRow() === 0) sheet = ensureSheet(ss, type);
  if (!ss.getSheetByName(KEYS_SHEET)) { var k = ss.insertSheet(KEYS_SHEET); k.getRange(1, 1, 1, 5).setValues([['Idempotency key', 'Content hash', 'Reference', 'Type', 'Created']]); k.hideSheet(); }
  return sheet;
}

function setupFolders() {
  setup();
  var p = props();
  return { CV_FOLDER_ID: p.getProperty('CV_FOLDER_ID'), ATTACHMENT_FOLDER_ID: p.getProperty('ATTACHMENT_FOLDER_ID') };
}

function findKey(ss, key) {
  var sheet = ss.getSheetByName(KEYS_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return null;
  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 3).getValues();
  for (var i = 0; i < values.length; i++) if (values[i][0] === key) return { hash: values[i][1], reference: values[i][2] };
  return null;
}

function newReference(sheet, cols, prefix) {
  var existing = {};
  if (sheet.getLastRow() > 1) sheet.getRange(2, cols['Reference'], sheet.getLastRow() - 1, 1).getValues().forEach(function (r) { existing[r[0]] = true; });
  var date = Utilities.formatDate(new Date(), 'Etc/UTC', 'yyMMdd');
  var alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (var attempt = 0; attempt < 20; attempt++) {
    var code = '';
    for (var i = 0; i < 5; i++) code += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    var ref = prefix + '-' + date + '-' + code;
    if (!existing[ref]) return ref;
  }
  throw new Error('Could not create a unique reference');
}

function contentHash(type, fields, file) {
  var keys = Object.keys(fields).sort();
  var text = type + '|' + keys.map(function (k) { return k + '=' + String(fields[k]); }).join('|') + '|' + (file ? String(file.base64).length + ':' + String(file.base64).slice(0, 64) + String(file.base64).slice(-64) : '');
  return hex(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8));
}

/* ------------------------------------------------------------------ notifications */

function sendNotification(type, reference) {
  var cfg = TABS[type];
  var ss = spreadsheet();
  var sheet = ss.getSheetByName(cfg.sheet);
  var found = findRow(sheet, reference);
  if (!found) return false;
  var cols = found.cols, rec = found.record;
  var attempts = Number(rec['Notification attempts'] || 0) + 1;
  var to = props().getProperty('NOTIFY_EMAIL') || DEFAULT_NOTIFY_EMAIL;
  var replyTo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rec['Email'] || '') ? rec['Email'] : '';
  var crm = (props().getProperty('CRM_BASE_URL') || '').replace(/\/$/, '');
  var view = { candidate: 'candidates', employer: 'clients', general: 'enquiries' }[type];
  var rows = cfg.fields.map(function (f) { return [f[1], rec[f[1]]]; }).filter(function (r) { return String(r[1] || '').trim() !== ''; });
  var html = '<div style="font-family:Arial,sans-serif;font-size:14px;color:#143353">'
    + '<h2 style="margin:0 0 4px;color:#12365a">' + esc(cfg.subject) + '</h2>'
    + '<p style="margin:0 0 16px;color:#536174">Reference <strong>' + esc(reference) + '</strong> &middot; submitted ' + esc(rec['Submitted at']) + ' (UTC)</p>'
    + '<table cellpadding="8" style="border-collapse:collapse;width:100%;max-width:640px">'
    + rows.map(function (r) { return '<tr><td style="border-bottom:1px solid #e2e8f0;width:38%;color:#536174;vertical-align:top">' + esc(r[0]) + '</td><td style="border-bottom:1px solid #e2e8f0;white-space:pre-wrap">' + esc(r[1]) + '</td></tr>'; }).join('')
    + '</table>'
    + (rec['File link'] ? '<p style="margin:16px 0 0">Document (private, opens for authorised Google accounts only): <a href="' + esc(rec['File link']) + '">' + esc(rec['File name']) + '</a></p>' : '')
    + (crm ? '<p style="margin:12px 0 0"><a href="' + esc(crm + '/' + view + '?ref=' + encodeURIComponent(reference)) + '">Open this record in the CRM</a></p>' : '')
    + '<p style="margin:20px 0 0;color:#8a96a6;font-size:12px">Sent automatically by the Adhuni website. Replying goes to the person who submitted the form.</p></div>';
  var plain = cfg.subject + '\nReference: ' + reference + '\nSubmitted: ' + rec['Submitted at'] + ' (UTC)\n\n' + rows.map(function (r) { return r[0] + ': ' + r[1]; }).join('\n') + (rec['File link'] ? '\n\nDocument: ' + rec['File link'] : '') + (crm ? '\nCRM: ' + crm + '/' + view + '?ref=' + reference : '');
  var status = 'Sent', error = '';
  try {
    var message = { to: to, subject: cfg.subject + ' | Adhuni | ' + reference, htmlBody: html, body: plain, name: 'Adhuni HR Solutions website' };
    if (replyTo) message.replyTo = replyTo;
    MailApp.sendEmail(message);
  } catch (err) {
    status = attempts >= MAX_NOTIFY_ATTEMPTS ? 'Failed' : 'Pending';
    error = String(err && err.message ? err.message : err).slice(0, 300);
  }
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var again = findRow(sheet, reference);
    sheet.getRange(again.row, again.cols['Notification']).setValue(status);
    sheet.getRange(again.row, again.cols['Notification attempts']).setValue(String(attempts));
    sheet.getRange(again.row, again.cols['Notification error']).setValue(safeCell(error));
  } finally { lock.releaseLock(); }
  return status === 'Sent';
}

/** Time-driven trigger (every 15 minutes): retries pending notifications, at most MAX_NOTIFY_ATTEMPTS per record. */
function retryNotifications() {
  var ss = spreadsheet();
  var sent = 0;
  Object.keys(TABS).forEach(function (type) {
    var sheet = ss.getSheetByName(TABS[type].sheet);
    if (!sheet || sheet.getLastRow() < 2) return;
    readAll(sheet).forEach(function (rec) {
      if (sent >= 20) return; // stay well inside the daily email quota on any single run
      if (rec['Notification'] === 'Pending' && Number(rec['Notification attempts'] || 0) < MAX_NOTIFY_ATTEMPTS) { sendNotification(type, rec['Reference']); sent++; }
    });
  });
  return sent;
}

function notifyRetry(body) {
  var type = String(body.type || '');
  if (!TABS[type]) return { ok: false, code: 400, error: 'Unknown type' };
  var found = findRow(spreadsheet().getSheetByName(TABS[type].sheet), String(body.reference || ''));
  if (!found) return { ok: false, code: 404, error: 'Record not found' };
  if (found.record['Notification'] === 'Sent') return { ok: true, notification: 'Sent' };
  var ok = sendNotification(type, found.record['Reference']);
  var after = findRow(spreadsheet().getSheetByName(TABS[type].sheet), found.record['Reference']).record;
  return { ok: true, notification: after['Notification'], sent: ok, record: publicRecord(type, after) };
}

/* ------------------------------------------------------------------ CRM sessions and login limits */

function loginCheck(body) {
  var ip = String(body.ip || 'unknown');
  var cache = CacheService.getScriptCache();
  var perIp = Number(cache.get('login:' + ip) || 0), global = Number(cache.get('login:all') || 0);
  return { ok: true, allowed: perIp < LOGIN_LIMIT.count && global < LOGIN_GLOBAL_LIMIT.count };
}

function loginFailed(body) {
  bump('login:' + String(body.ip || 'unknown'), LOGIN_LIMIT.seconds);
  bump('login:all', LOGIN_GLOBAL_LIMIT.seconds);
  return { ok: true };
}

function sessionCreate(body) {
  var id = String(body.sessionHash || '');
  if (!/^[a-f0-9]{64}$/.test(id)) return { ok: false, code: 400, error: 'Invalid session' };
  CacheService.getScriptCache().put('sess:' + id, JSON.stringify({ created: Date.now(), user: String(body.user || 'admin') }), SESSION_SECONDS);
  CacheService.getScriptCache().remove('login:' + String(body.ip || 'unknown'));
  return { ok: true, expiresIn: SESSION_SECONDS };
}

function sessionRevoke(body) {
  if (/^[a-f0-9]{64}$/.test(String(body.session || ''))) CacheService.getScriptCache().remove('sess:' + body.session);
  return { ok: true };
}

function sessionValid(id) {
  if (!/^[a-f0-9]{64}$/.test(String(id || ''))) return false;
  var raw = CacheService.getScriptCache().get('sess:' + id);
  if (!raw) return false;
  try { return Date.now() - JSON.parse(raw).created < SESSION_SECONDS * 1000; } catch (err) { return false; }
}

function rateAllow(key, limit) {
  var cache = CacheService.getScriptCache();
  var n = Number(cache.get(key) || 0);
  if (n >= limit.count) return false;
  cache.put(key, String(n + 1), limit.seconds);
  return true;
}

function bump(key, seconds) {
  var cache = CacheService.getScriptCache();
  cache.put(key, String(Number(cache.get(key) || 0) + 1), seconds);
}

/* ------------------------------------------------------------------ CRM data */

function overview() {
  var ss = spreadsheet();
  var out = { ok: true, counts: {}, recent: [], notifications: { pending: 0, failed: 0 } };
  Object.keys(TABS).forEach(function (type) {
    var sheet = ss.getSheetByName(TABS[type].sheet);
    var recs = sheet ? readAll(sheet) : [];
    var closed = { employer: ['Closed', 'Archived'], general: ['Closed', 'Archived'], candidate: ['Placed', 'Not suitable', 'Archived'] }[type];
    out.counts[type] = { total: recs.length, new: recs.filter(function (r) { return r['Status'] === 'New'; }).length, open: recs.filter(function (r) { return closed.indexOf(r['Status']) === -1; }).length };
    recs.forEach(function (r) {
      if (r['Notification'] === 'Pending') out.notifications.pending++;
      if (r['Notification'] === 'Failed') out.notifications.failed++;
      out.recent.push({ type: type, reference: r['Reference'], name: r['Full Name'] || r['Contact Person'] || r['Name'] || '', company: r['Company Name'] || '', status: r['Status'], submittedAt: r['Submitted at'] });
    });
  });
  out.recent.sort(function (a, b) { return a.submittedAt < b.submittedAt ? 1 : -1; });
  out.recent = out.recent.slice(0, 8);
  return out;
}

function list(body) {
  var type = String(body.type || '');
  if (!TABS[type]) return { ok: false, code: 400, error: 'Unknown type' };
  var sheet = spreadsheet().getSheetByName(TABS[type].sheet);
  var recs = sheet ? readAll(sheet) : [];
  var f = body.filters || {};
  var q = String(f.q || '').toLowerCase().trim();
  var searchIn = { candidate: ['Full Name', 'Email', 'Phone', 'Key Skills', 'Current / Most Recent Designation', 'Reference'], employer: ['Company Name', 'Contact Person', 'Position / Job Title', 'Email', 'Reference'], general: ['Name', 'Company Name', 'Email', 'Subject', 'Message', 'Reference'] }[type];
  var countryCol = type === 'candidate' ? 'Preferred Country' : 'Country';
  recs = recs.filter(function (r) {
    if (q && !searchIn.some(function (h) { return String(r[h] || '').toLowerCase().indexOf(q) !== -1; })) return false;
    if (f.status && r['Status'] !== f.status) return false;
    if (f.country && r[countryCol] !== f.country) return false;
    if (f.category && r[type === 'candidate' ? 'Job Category' : type === 'employer' ? 'Industry' : 'Enquiry Type'] !== f.category) return false;
    if (f.from && String(r['Submitted at']).slice(0, 10) < f.from) return false;
    if (f.to && String(r['Submitted at']).slice(0, 10) > f.to) return false;
    return true;
  });
  recs.sort(function (a, b) { return a['Submitted at'] < b['Submitted at'] ? 1 : -1; });
  var all = body.all === true;
  var size = Math.min(Math.max(Number(body.pageSize) || 25, 5), 100);
  var page = Math.max(Number(body.page) || 1, 1);
  var slice = all ? recs : recs.slice((page - 1) * size, page * size);
  return { ok: true, total: recs.length, page: page, pageSize: size, statuses: TABS[type].statuses, fields: TABS[type].fields, records: slice.map(function (r) { return publicRecord(type, r); }) };
}

function getRecord(body) {
  var type = String(body.type || '');
  if (!TABS[type]) return { ok: false, code: 400, error: 'Unknown type' };
  var found = findRow(spreadsheet().getSheetByName(TABS[type].sheet), String(body.reference || ''));
  if (!found) return { ok: false, code: 404, error: 'Record not found' };
  return { ok: true, statuses: TABS[type].statuses, fields: TABS[type].fields, record: publicRecord(type, found.record) };
}

function update(body) {
  var type = String(body.type || '');
  var cfg = TABS[type];
  if (!cfg) return { ok: false, code: 400, error: 'Unknown type' };
  var status = body.status == null ? null : String(body.status);
  if (status !== null && cfg.statuses.indexOf(status) === -1) return { ok: false, code: 400, error: 'Unknown status' };
  var notes = body.notes == null ? null : String(body.notes).slice(0, 5000);
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sheet = spreadsheet().getSheetByName(cfg.sheet);
    var found = findRow(sheet, String(body.reference || ''));
    if (!found) return { ok: false, code: 404, error: 'Record not found' };
    // Optimistic concurrency: the change must be based on the latest version of the record.
    if (String(body.expectedUpdatedAt || '') !== String(found.record['Last updated'])) return { ok: false, code: 409, error: 'This record was changed by someone else. Reload it to see the latest version.', record: publicRecord(type, found.record) };
    var stamp = iso(new Date());
    if (status !== null) sheet.getRange(found.row, found.cols['Status']).setValue(status);
    if (notes !== null) sheet.getRange(found.row, found.cols['Internal notes']).setValue(safeCell(notes));
    sheet.getRange(found.row, found.cols['Last updated']).setValue(stamp);
    SpreadsheetApp.flush();
    return { ok: true, record: publicRecord(type, findRow(sheet, found.record['Reference']).record) };
  } finally { lock.releaseLock(); }
}

function fileDownload(body) {
  var type = String(body.type || '');
  if (!TABS[type]) return { ok: false, code: 400, error: 'Unknown type' };
  var found = findRow(spreadsheet().getSheetByName(TABS[type].sheet), String(body.reference || ''));
  if (!found || !found.record['File ID']) return { ok: false, code: 404, error: 'No document for this record' };
  var blob = DriveApp.getFileById(found.record['File ID']).getBlob();
  return { ok: true, name: found.record['File name'], mime: blob.getContentType(), base64: Utilities.base64Encode(blob.getBytes()) };
}

function systemStatus() {
  var p = props();
  var ss = spreadsheet();
  var folders = ['ROOT_FOLDER_ID', 'CV_FOLDER_ID', 'ATTACHMENT_FOLDER_ID'].map(function (k) {
    var id = p.getProperty(k); var ok = false;
    try { ok = !!id && !DriveApp.getFolderById(id).isTrashed(); } catch (err) { ok = false; }
    return { key: k, ok: ok };
  });
  return {
    ok: true,
    spreadsheet: { name: ss.getName(), url: ss.getUrl(), tabs: Object.keys(TABS).map(function (t) { var s = ss.getSheetByName(TABS[t].sheet); return { name: TABS[t].sheet, ok: !!s, rows: s ? Math.max(s.getLastRow() - 1, 0) : 0 }; }) },
    folders: folders,
    trigger: ScriptApp.getProjectTriggers().some(function (t) { return t.getHandlerFunction() === 'retryNotifications'; }),
    notifyEmail: p.getProperty('NOTIFY_EMAIL') || DEFAULT_NOTIFY_EMAIL,
    emailQuotaRemaining: MailApp.getRemainingDailyQuota(),
    timeZone: Session.getScriptTimeZone()
  };
}

/* ------------------------------------------------------------------ helpers */

function publicRecord(type, rec) {
  var out = { type: type, reference: rec['Reference'], submittedAt: rec['Submitted at'], status: rec['Status'], notes: rec['Internal notes'], updatedAt: rec['Last updated'], source: rec['Source page'], language: rec['Language'], consent: rec['Consent'], consentAt: rec['Consent at'], file: rec['File ID'] ? { name: rec['File name'] } : null, notification: rec['Notification'], notificationAttempts: Number(rec['Notification attempts'] || 0), notificationError: rec['Notification error'], fields: {} };
  TABS[type].fields.forEach(function (f) { out.fields[f[0]] = rec[f[1]] == null ? '' : String(rec[f[1]]); });
  return out;
}

function readAll(sheet) {
  if (sheet.getLastRow() < 2) return [];
  var values = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
  var head = values[0];
  return values.slice(1).filter(function (r) { return r[0] !== ''; }).map(function (r) { var o = {}; head.forEach(function (h, i) { o[h] = cellOut(r[i]); }); return o; });
}

function findRow(sheet, reference) {
  if (!sheet || !reference || sheet.getLastRow() < 2) return null;
  var values = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
  var head = values[0], cols = {};
  head.forEach(function (h, i) { cols[h] = i + 1; });
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] === reference) { var o = {}; head.forEach(function (h, j) { o[h] = cellOut(values[i][j]); }); return { row: i + 1, cols: cols, record: o }; }
  }
  return null;
}

function headerMap(sheet) {
  var map = {};
  sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].forEach(function (h, i) { map[h] = i + 1; });
  return map;
}

/** Text that a spreadsheet could read as a formula is stored with a leading apostrophe. */
function safeCell(value) {
  var text = value == null ? '' : String(value);
  return /^[=+\-@\t\r]/.test(text) ? "'" + text : text;
}

/** Reverses safeCell when reading, in case the protective apostrophe is returned with the value. */
function cellOut(value) {
  if (value instanceof Date) return iso(value);
  return typeof value === 'string' && /^'[=+\-@\t\r]/.test(value) ? value.slice(1) : value;
}

function spreadsheet() {
  var id = props().getProperty('SPREADSHEET_ID');
  return id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
}
function props() { return PropertiesService.getScriptProperties(); }
function iso(d) { return Utilities.formatDate(d, 'Etc/UTC', "yyyy-MM-dd'T'HH:mm:ss'Z'"); }
function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function hex(bytes) { return bytes.map(function (b) { var v = (b < 0 ? b + 256 : b).toString(16); return v.length === 1 ? '0' + v : v; }).join(''); }
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  var diff = 0;
  for (var i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// In-memory fakes of the Google Apps Script services used by google/apps-script/Code.gs (for tests and local runs only).
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
export function makeGoogle() {
  const chain = target => new Proxy(target, { get: (t, k) => (k in t ? t[k] : () => chain(t)) });
  let ids = 0;
  const id = p => `${p}${++ids}`;
  const toSigned = buf => [...buf].map(b => (b > 127 ? b - 256 : b));
  const toBuf = arr => Buffer.from(arr.map(b => (b < 0 ? b + 256 : b)));
  // ---- Sheets
  class Range {
    constructor(sheet, r, c, nr, nc) { Object.assign(this, { sheet, r, c, nr, nc }); return chain(this); }
    getValues() { const out = []; for (let i = 0; i < this.nr; i++) { const row = this.sheet.data[this.r - 1 + i] || []; out.push(Array.from({ length: this.nc }, (_, j) => row[this.c - 1 + j] ?? '')); } return out; }
    setValues(values) { values.forEach((row, i) => { const target = (this.sheet.data[this.r - 1 + i] ||= []); row.forEach((v, j) => { target[this.c - 1 + j] = v; }); }); return this; }
    setValue(v) { return this.setValues([[v]]); }
  }
  class Sheet {
    constructor(name) { this.name = name; this.data = []; this.hidden = false; this.failAppend = false; this.filter = null; this.bands = []; return chain(this); }
    getName() { return this.name; }
    getLastRow() { return this.data.length; }
    getLastColumn() { return this.data.reduce((m, r) => Math.max(m, r.length), 0); }
    getMaxRows() { return 1000; }
    getRange(r, c, nr = 1, nc = 1) { return new Range(this, r, c, nr, nc); }
    appendRow(row) { if (this.failAppend) throw new Error('Storage unavailable'); this.data.push([...row]); }
    hideSheet() { this.hidden = true; }
    getBandings() { return this.bands; }
    getFilter() { return this.filter; }
  }
  const sheets = [];
  const ss = chain({
    getSheetByName: n => sheets.find(s => s.name === n) || null,
    insertSheet: n => { const s = new Sheet(n); sheets.push(s); return s; },
    getSheets: () => sheets, deleteSheet: s => sheets.splice(sheets.indexOf(s), 1),
    getUrl: () => 'https://docs.google.com/spreadsheets/d/TEST', getName: () => 'Adhuni CRM (test)', getId: () => 'TEST'
  });
  const SpreadsheetApp = chain({ getActiveSpreadsheet: () => ss, openById: () => ss, flush() {}, newDataValidation: () => chain({ build: () => ({}) }), BandingTheme: { LIGHT_GREY: 'LIGHT_GREY' } });
  // ---- Drive
  const folders = new Map(), files = new Map();
  const makeFolder = name => { const f = { id: id('folder'), name, trashed: false, children: [], files: [] };
    const api = { getId: () => f.id, getName: () => f.name, isTrashed: () => f.trashed,
      getFoldersByName: n => { const list = f.children.filter(c => c.getName() === n); let i = 0; return { hasNext: () => i < list.length, next: () => list[i++] }; },
      createFolder: n => { const c = makeFolder(n); f.children.push(c); return c; },
      createFile: blob => { const file = { id: id('file'), name: blob.name, bytes: blob.bytes, mime: blob.mime, trashed: false, folder: f.id };
        const fapi = { getId: () => file.id, getName: () => file.name, getUrl: () => `https://drive.google.com/file/d/${file.id}/view`, setTrashed: v => { file.trashed = v; }, isTrashed: () => file.trashed, getBlob: () => ({ getBytes: () => file.bytes, getContentType: () => file.mime }), _raw: file };
        files.set(file.id, fapi); f.files.push(fapi); return fapi; } };
    folders.set(f.id, api); return api; };
  const root = makeFolder('My Drive');
  const DriveApp = { getRootFolder: () => root, getFolderById: i => { if (!folders.has(i)) throw new Error('No folder'); return folders.get(i); }, getFileById: i => files.get(i) };
  // ---- Mail, cache, properties, triggers, utilities
  const outbox = []; let mailFails = false;
  const MailApp = { sendEmail: m => { if (mailFails) throw new Error('Service invoked too many times: email'); outbox.push(m); }, getRemainingDailyQuota: () => 95 };
  const cacheMap = new Map(); let now = Date.parse('2026-11-22T10:00:00Z');
  const CacheService = { getScriptCache: () => ({ get: k => { const e = cacheMap.get(k); return e && e.until > now ? e.v : null; }, put: (k, v, s) => cacheMap.set(k, { v: String(v), until: now + s * 1000 }), remove: k => cacheMap.delete(k) }) };
  const propMap = new Map([['API_SECRET', 'x'.repeat(40)]]);
  const PropertiesService = { getScriptProperties: () => ({ getProperty: k => propMap.get(k) ?? null, setProperty: (k, v) => propMap.set(k, String(v)) }) };
  const triggers = [];
  const ScriptApp = { getProjectTriggers: () => triggers, newTrigger: fn => ({ timeBased: () => ({ everyMinutes: () => ({ create: () => triggers.push({ getHandlerFunction: () => fn }) }) }) }) };
  const pad = n => String(n).padStart(2, '0');
  const Utilities = {
    base64Decode: s => toSigned(Buffer.from(s, 'base64')), base64Encode: a => toBuf(a).toString('base64'),
    newBlob: (bytes, mime, name) => ({ bytes, mime, name }),
    computeDigest: (_a, text) => toSigned(createHash('sha256').update(text, 'utf8').digest()),
    formatDate: (d, _tz, fmt) => fmt === 'yyMMdd' ? d.toISOString().slice(2, 10).replace(/-/g, '') : d.toISOString().slice(0, 19) + 'Z',
    DigestAlgorithm: { SHA_256: 'SHA_256' }, Charset: { UTF_8: 'UTF_8' }
  };
  const ContentService = { createTextOutput: s => ({ content: s, setMimeType() { return this; } }), MimeType: { JSON: 'json' } };
  const LockService = { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) };
  const RealDate = Date;
  class FakeDate extends RealDate { constructor(...a) { super(...(a.length ? a : [now])); } static now() { return now; } }
  return { context: { SpreadsheetApp, DriveApp, MailApp, CacheService, PropertiesService, ScriptApp, Utilities, ContentService, LockService, Session: { getScriptTimeZone: () => 'Asia/Kuwait' }, console: { error() {}, warn() {}, log() {} }, Date: FakeDate, Math, JSON },
    sheets, folders, files, outbox, triggers, propMap, cacheMap,
    setMailFails: v => { mailFails = v; }, tick: ms => { now += ms; } };
}


/** Loads Code.gs into a sandbox wired to the fakes. Returns { g, ctx, call } where call(body) runs doPost. */
export function loadAppsScript(secret = 'x'.repeat(40)) {
  const g = makeGoogle();
  g.propMap.set('API_SECRET', secret);
  const ctx = vm.createContext(g.context);
  vm.runInContext(readFileSync('google/apps-script/Code.gs', 'utf8'), ctx, { filename: 'Code.gs' });
  return { g, ctx, call: body => JSON.parse(ctx.doPost({ postData: { contents: JSON.stringify({ secret, ...body }) } }).content) };
}

// Local stand-in for the Apps Script web app, for testing the website and CRM end to end WITHOUT Google.
// It runs the real google/apps-script/Code.gs against in-memory fakes (nothing is saved, no email is sent).
//   node scripts/mock-backend.mjs            (listens on http://127.0.0.1:4455)
// then run the site with GOOGLE_SHEET_WEBHOOK_URL=http://127.0.0.1:4455/exec, GOOGLE_SHEET_SECRET=<same as below>
// and CRM_BACKEND_ALLOW_LOCAL=true (development only).
import { createServer } from 'node:http';
import { loadAppsScript } from './lib/fake-google.mjs';
const secret = process.env.GOOGLE_SHEET_SECRET || 'local-test-secret-0123456789abcdef';
const { ctx, g } = loadAppsScript(secret);
ctx.setup();
if (process.env.MOCK_MAIL_FAILS === 'true') g.setMailFails(true);
createServer((req, res) => {
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    if (req.url === '/_outbox') { res.end(JSON.stringify(g.outbox.map(m => ({ to: m.to, subject: m.subject, replyTo: m.replyTo })))); return; }
    const out = req.method === 'POST' ? ctx.doPost({ postData: { contents: body } }) : ctx.doGet();
    res.setHeader('Content-Type', 'application/json');
    res.end(out.content);
  });
}).listen(4455, '127.0.0.1', () => console.log('Mock Apps Script backend on http://127.0.0.1:4455/exec'));

# Collect enquiries in a Google Sheet

All three forms (employer, candidate, general), the quick match and the hiring brief builder post to `/api/contact`. The endpoint sends each enquiry to a Google Apps Script web app, which adds a row to your Sheet and saves any CV or file in Google Drive. No email service is needed.

## 1. Create the Sheet and the script
1. In Google Sheets create a new spreadsheet named **Adhuni enquiries**.
2. Open **Extensions → Apps Script**, delete the sample code and paste the script below.
3. Change `SECRET` to a long random string (at least 24 characters). Keep it private.

```js
const SECRET = 'CHANGE_ME_TO_A_LONG_RANDOM_STRING';
const FOLDER_NAME = 'Adhuni enquiry files';
const TABS = { employer: 'Employers', candidate: 'Candidates', general: 'General' };
const MIME = { pdf: 'application/pdf', doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.secret !== SECRET) return reply({ ok: false });
    const book = SpreadsheetApp.getActiveSpreadsheet();
    const name = TABS[data.type] || 'Other';
    const sheet = book.getSheetByName(name) || book.insertSheet(name);
    if (sheet.getLastRow() === 0) sheet.appendRow(['Received (UTC)', 'Service', 'Language', 'Attachment']);
    const headers = () => sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const column = label => {
      let at = headers().indexOf(label);
      if (at === -1) { sheet.getRange(1, sheet.getLastColumn() + 1).setValue(label); at = headers().indexOf(label); }
      return at;
    };
    const safe = value => { const text = String(value == null ? '' : value); return /^[=+\-@]/.test(text) ? "'" + text : text; };
    const row = new Array(sheet.getLastColumn()).fill('');
    const put = (label, value) => { const at = column(label); while (row.length <= at) row.push(''); row[at] = safe(value); };
    put('Received (UTC)', data.submittedAt);
    put('Service', data.service);
    put('Language', data.language);
    Object.keys(data.fields || {}).forEach(label => put(label, data.fields[label]));
    if (data.file && data.file.base64) {
      const extension = String(data.file.name).split('.').pop().toLowerCase();
      if (MIME[extension]) {
        const folders = DriveApp.getFoldersByName(FOLDER_NAME);
        const folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(FOLDER_NAME);
        const blob = Utilities.newBlob(Utilities.base64Decode(data.file.base64), MIME[extension], data.type + '-' + Date.now() + '.' + extension);
        put('Attachment', folder.createFile(blob).getUrl());
      }
    }
    sheet.appendRow(row.slice(0, sheet.getLastColumn()));
    return reply({ ok: true });
  } catch (error) {
    return reply({ ok: false });
  } finally {
    lock.releaseLock();
  }
}
function reply(body) { return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON); }
```

## 2. Deploy it as a web app
1. **Deploy → New deployment → type: Web app**.
2. Execute as: **Me**. Who has access: **Anyone**. (The secret stops strangers from writing rows.)
3. Authorise when asked (Sheets and Drive access). Copy the **Web app URL**; it ends in `/exec`.
4. After any later edit to the script, use **Deploy → Manage deployments → Edit → New version**, otherwise the live URL keeps running the old code.

## 3. Set Vercel environment variables
| Variable | Value |
| --- | --- |
| `GOOGLE_SHEET_WEBHOOK_URL` | the Web app URL (`https://script.google.com/macros/s/.../exec`) |
| `GOOGLE_SHEET_SECRET` | the same string you put in `SECRET` |
| `PUBLIC_CONTACT_ENABLED` | `true` |

Redeploy afterwards (public variables are read at build time).

## 4. Test
Submit each form once on the live site and check the Employers, Candidates and General tabs. Send a PDF with the candidate form and check the link in the Attachment column.

## Notes
- New form fields add their own columns automatically.
- The Sheet and Drive folder hold personal data: share them only with the people who need them, and keep two-step verification on that Google account.
- A new row does not notify anyone. In Sheets use **Tools → Notification settings → Notify me when a user submits** (or add an email line to the script) so enquiries are not missed.
- Optional: Cloudflare Turnstile (free) adds bot protection. Set `PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` and redeploy. Without it, a hidden honeypot field and an origin check are used.
- Optional: Resend email can be added later by setting `RESEND_API_KEY`, `CONTACT_FROM` and `CONTACT_TO`; it then runs in addition to the Sheet.

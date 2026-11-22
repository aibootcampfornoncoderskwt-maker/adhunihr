# Enquiry system and CRM: setup

How the pieces fit:

```
Browser form ──► /api/contact (Vercel) ──► Apps Script web app ──► Google Sheet (records)
                                             │                    ├► Google Drive (CVs, private)
                                             │                    └► MailApp email to NOTIFY_EMAIL
CRM browser ──► /api/crm/* (Vercel, admin session) ──┘
```

- Browsers never call Google directly. Only the Vercel server calls the Apps Script, using a shared secret.
- A record is saved before any email is sent. If the email fails, the record is still saved and is marked `Pending` or `Failed`. A 15-minute trigger retries it, up to 5 attempts in total, and the CRM has a **Retry email** button.
- The website shows a thank-you popup only when the script has returned a reference number.

Nothing in this guide has been run against a real Google account yet. All tests so far used mocks (see "Testing" below).

## 1. Google: Sheet, script, folders

Use the Google account that should own the data, ideally the company Workspace account. You sign in yourself. No password is shared with anyone.

1. Create a new Google Sheet named **Adhuni HR CRM**.
2. Open **Extensions → Apps Script**.
3. Replace `Code.gs` with the contents of [google/apps-script/Code.gs](../google/apps-script/Code.gs).
4. Show the manifest: **Project Settings → Show "appsscript.json" manifest file in editor**. Then replace `appsscript.json` with [google/apps-script/appsscript.json](../google/apps-script/appsscript.json).
5. Go to **Project Settings → Script properties** and add:

   | Property | Value |
   |---|---|
   | `API_SECRET` | A long random string, 32 or more characters. You can generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`. |
   | `NOTIFY_EMAIL` | `nidhaladhuni@adhunihr.com`. This is optional because it is also the default. |
   | `CRM_BASE_URL` | `https://crm.adhunihrsolutions.com`. Optional. It adds an "Open in CRM" link to emails. |

6. In the editor, select the **setup** function and press **Run**. Google asks for authorisation; approve it with the owner account. Running setup again is safe. It:
   - creates the tabs **Candidates**, **Client Requests** and **General Enquiries**, plus a hidden `_Submission keys` tab;
   - adds headers, status dropdowns and filters;
   - creates the Drive folders `Adhuni HR CRM/Candidate CVs` and `Adhuni HR CRM/Enquiry Attachments`;
   - installs a single `retryNotifications` trigger that runs every 15 minutes.
7. **Deploy → New deployment → Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**

   Copy the `/exec` URL. "Anyone" only means the URL can be reached. Every request must carry `API_SECRET`, and requests without it are refused.
8. Check that it is live: open the `/exec` URL in a browser. You should see `{"ok":true,"service":"adhuni-crm"}`.

**After editing Code.gs later:** use **Deploy → Manage deployments → Edit → Version: New version**. This keeps the same URL. A brand-new deployment gets a new URL.

Files are saved privately in the owner's Drive. Nothing is shared with "anyone with the link". CRM downloads are fetched through the server after an admin login.

## 2. Admin password hash

Run this on your own computer, not in a chat:

```bash
node scripts/crm-hash-password.mjs
```

It asks for the password (12 or more characters, not shown while typing) and prints a line that starts with `scrypt$`. Only that hash goes into Vercel. The password itself is never stored anywhere. There is no default password: the CRM login stays disabled until the hash is set.

## 3. Vercel environment variables

In Vercel, go to **Project → Settings → Environment Variables** and add these for Production:

| Variable | Value |
|---|---|
| `GOOGLE_SHEET_WEBHOOK_URL` | The `/exec` URL from step 1.7 |
| `GOOGLE_SHEET_SECRET` | The same value as `API_SECRET` |
| `PUBLIC_CONTACT_ENABLED` | `true` |
| `CRM_ADMIN_USERNAME` | `admin` (this is also the default) |
| `CRM_ADMIN_PASSWORD_HASH` | The `scrypt$…` line from step 2 |
| `CRM_HOST` | Optional. Defaults to `crm.adhunihrsolutions.com` |
| `PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Optional. Cloudflare Turnstile anti-spam. Turnstile is checked only when the secret is set. |

Then redeploy. `PUBLIC_*` values are read at build time, so a redeploy is required. Do not set `CRM_BACKEND_ALLOW_LOCAL` in production.

## 4. CRM subdomain (DNS)

1. In Vercel, go to **Project → Settings → Domains** and add `crm.adhunihrsolutions.com`.
2. At your DNS provider, add the record Vercel shows. This is normally:
   - Type: **CNAME**
   - Name: `crm`
   - Target: `cname.vercel-dns.com`
3. Wait for Vercel to show the domain as valid and the certificate as issued.

The build adds a routing rule ([scripts/vercel-crm-host.mjs](../scripts/vercel-crm-host.mjs)) so that `crm.adhunihrsolutions.com/` serves the CRM. The CRM is also always available at `https://adhunihrsolutions.com/crm/`, which is the fallback if the subdomain is not set up.

## 5. Check it end to end (live)

After deploying, run through these steps in order:

1. Submit each of the three forms (candidate with a PDF CV, employer, general) on the live site.
2. Confirm that:
   - a popup shows a reference such as `CAN-261122-AB3CD`;
   - a row appears in the right tab;
   - the CV is in `Candidate CVs` and is not shared;
   - an email arrives at `NOTIFY_EMAIL` with the reference in the subject and Reply-To set to the submitter.
3. Open the CRM:
   - sign in;
   - change a status and add a note, reload, and confirm both are kept;
   - download the CV;
   - export a CSV;
   - sign out, then confirm that `/crm/` asks for a login again.
4. Open **System status** in the CRM. Every check should be green.

Only after these steps pass is the system "live". Until then, treat it as configured but unverified.

## Operations

- **Change the password:** generate a new hash (step 2), replace `CRM_ADMIN_PASSWORD_HASH`, and redeploy.
- **Rotate the secret:** set the new value in both `API_SECRET` (Script properties) and `GOOGLE_SHEET_SECRET` (Vercel), then redeploy. Submissions fail with a clear error, and nothing is lost, while the two values differ.
- **Email limits:** MailApp allows about 100 recipients a day on a free Gmail account and about 1,500 a day on Google Workspace. Over the limit, records are still saved and marked `Failed`. Retry them the next day from the CRM.
- **Backups:** use **File → Make a copy** of the Sheet, or **Export CSV** from each CRM list. Exports neutralise cells that start with `=`, `+`, `-` or `@`.
- **Sessions:** a session lasts 4 hours, and **Sign out** ends it on the server. Sessions live in Apps Script's cache, which Google can clear early, so you may occasionally need to sign in again.

## Limitations

- **No virus scanning.** Uploads are limited to PDF, DOC and DOCX up to 2 MB and checked by file signature, but they are not scanned. Open CVs with care.
- The `crm.` host rewrite has been tested against the generated config only, not on a live Vercel deployment.
- Apps Script usually responds in 1 to 4 seconds and is slower on a cold start. The forms show a "Saving…" state while they wait.
- The CRM has one admin account. There are no per-user roles or audit trail beyond the "Last updated" time.

## Testing (mocks, no Google needed)

```bash
npm run build
node scripts/check-apps-script.mjs   # Code.gs against fake Sheets/Drive/Mail/Cache
node scripts/check-enquiry-api.mjs   # /api/contact with a mocked backend
node scripts/check-crm.mjs           # /api/crm/* auth, CSRF, CSV, files with a mocked backend
```

To run the browser end-to-end test locally, use two terminals.

Terminal 1, the mock backend (it runs the real Code.gs in memory; nothing is saved and no email is sent):

```bash
node scripts/mock-backend.mjs
```

Terminal 2, the site. Use your own local test password and paste its hash:

```bash
GOOGLE_SHEET_WEBHOOK_URL=http://127.0.0.1:4455/exec \
GOOGLE_SHEET_SECRET=local-test-secret-0123456789abcdef \
CRM_BACKEND_ALLOW_LOCAL=true PUBLIC_CONTACT_ENABLED=true \
CRM_ADMIN_PASSWORD_HASH='scrypt$…' npm run dev
```

Then run the test, passing the same password:

```bash
E2E_PASSWORD='your local test password' node scripts/check-crm-e2e.mjs
```

Restart the mock backend between runs, because its rate limit of 8 submissions per 10 minutes applies to the test too. These tests prove the code paths work. They do not prove that Google, Drive or email are configured.

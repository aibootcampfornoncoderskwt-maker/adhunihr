// Adhuni CRM dashboard (browser side). All data comes from /api/crm/*, which checks the session on the server.
// Everything a visitor typed is inserted with textContent, never as HTML.
type Rec = { type: string; reference: string; submittedAt: string; status: string; notes: string; updatedAt: string; source: string; language: string; consent: string; consentAt: string; file: { name: string } | null; notification: string; notificationAttempts: number; notificationError: string; fields: Record<string, string> };
type Field = [string, string];

const csrf = () => (document.cookie.split('; ').find(c => c.startsWith('__Host-adhuni_csrf=')) || '').split('=')[1] || '';
async function api(path: string, body?: object) {
  const response = await fetch('/api/crm/' + path, body ? { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': decodeURIComponent(csrf()) }, body: JSON.stringify(body) } : { headers: { Accept: 'application/json' } });
  if (response.status === 401 && !path.startsWith('login')) { location.href = '/crm/login?expired=1'; throw new Error('Session expired'); }
  const data = await response.json().catch(() => ({ ok: false, error: 'Unexpected response from the server.' }));
  if (!response.ok || !data.ok) { const error = new Error(data.error || 'Request failed') as Error & { status?: number; data?: unknown }; error.status = response.status; error.data = data; throw error; }
  return data;
}
const el = <K extends keyof HTMLElementTagNameMap>(tag: K, props: Record<string, unknown> = {}, ...children: (Node | string | null | false)[]) => {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value == null || value === false) continue;
    if (key === 'class') node.className = String(value);
    else if (key === 'text') node.textContent = String(value);
    else if (key.startsWith('on')) node.addEventListener(key.slice(2), value as EventListener);
    else node.setAttribute(key, String(value));
  }
  children.forEach(child => { if (child) node.append(child); });
  return node;
};
const fmtDate = (iso: string) => { if (!iso) return ''; const d = new Date(iso); return isNaN(d.getTime()) ? iso : d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); };
const badge = (status: string) => el('span', { class: 'crm-badge', 'data-status': status, text: status || '—' });
const state = (text: string, kind = '') => el('div', { class: 'crm-state' + (kind ? ' crm-state-' + kind : ''), role: kind === 'error' ? 'alert' : 'status', text });

/* ---------------------------------------------------------------- login & shell */
const login = document.querySelector<HTMLFormElement>('[data-login]');
login?.addEventListener('submit', async event => {
  event.preventDefault();
  const error = login.querySelector<HTMLElement>('.crm-login-error')!;
  const button = login.querySelector<HTMLButtonElement>('button[type=submit]')!;
  error.textContent = '';
  const data = new FormData(login);
  const pass = login.querySelector<HTMLInputElement>('input[name=password]'); const eye = login.querySelector('[data-pass-toggle]');
  if (pass && pass.type !== 'password') { pass.type = 'password'; eye?.setAttribute('aria-pressed', 'false'); eye?.setAttribute('aria-label', 'Show password'); }
  button.disabled = true; button.textContent = 'Signing in…';
  try {
    await api('login', { username: String(data.get('username') || ''), password: String(data.get('password') || '') });
    location.href = '/crm/';
  } catch (err) {
    error.textContent = err instanceof Error ? err.message : 'Sign-in failed.';
    (login.elements.namedItem('password') as HTMLInputElement).value = '';
    (login.elements.namedItem('password') as HTMLInputElement).focus();
  } finally { button.disabled = false; button.textContent = 'Sign in'; }
});
document.querySelector<HTMLButtonElement>('[data-pass-toggle]')?.addEventListener('click', event => {
  const toggle = event.currentTarget as HTMLButtonElement;
  const input = document.getElementById(toggle.getAttribute('aria-controls') || '') as HTMLInputElement | null;
  if (!input) return;
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  toggle.setAttribute('aria-pressed', String(show));
  const label = show ? 'Hide password' : 'Show password';
  toggle.setAttribute('aria-label', label); toggle.title = label;
  input.focus();
});
document.querySelector('[data-logout]')?.addEventListener('click', async () => { try { await api('logout', {}); } catch { /* cookies are cleared regardless */ } location.href = '/crm/login'; });
const menu = document.querySelector<HTMLButtonElement>('[data-menu]');
menu?.addEventListener('click', () => { const open = document.body.classList.toggle('crm-nav-open'); menu.setAttribute('aria-expanded', String(open)); });

const app = document.querySelector<HTMLElement>('#crm-app');
const view = app?.dataset.view || '';
const typeName = app?.dataset.type || '';
const options = JSON.parse(app?.dataset.options || '{}') as { countries?: string[]; categories?: string[]; categoryLabel?: string };
const VIEW_OF: Record<string, string> = { candidate: 'candidates', employer: 'clients', general: 'enquiries' };
const NAME_KEY: Record<string, string> = { candidate: 'name', employer: 'company', general: 'name' };

if (app && view === 'overview') overview(app);
if (app && view === 'status') systemStatus(app);
if (app && typeName) records(app, typeName);

/* ---------------------------------------------------------------- overview */
async function overview(root: HTMLElement) {
  root.replaceChildren(state('Loading the latest figures…'));
  try {
    const data = await api('overview');
    const c = data.counts, n = data.notifications;
    const card = (label: string, value: number, href: string, tone = '') => el('a', { class: 'crm-stat' + (tone ? ' crm-stat-' + tone : ''), href }, el('span', { class: 'crm-stat-value', text: String(value) }), el('span', { class: 'crm-stat-label', text: label }));
    const stats = el('div', { class: 'crm-stats' },
      card('Total candidates', c.candidate.total, '/crm/candidates'), card('New candidates', c.candidate.new, '/crm/candidates?status=New', 'gold'),
      card('Total client requests', c.employer.total, '/crm/clients'), card('Open client requests', c.employer.open, '/crm/clients', 'gold'),
      card('General enquiries', c.general.total, '/crm/enquiries'), card('Email notifications pending / failed', n.pending + n.failed, '/crm/status', n.failed ? 'alert' : ''));
    const recent = data.recent as { type: string; reference: string; name: string; company: string; status: string; submittedAt: string }[];
    const table = recent.length ? el('table', { class: 'crm-table' }, el('thead', {}, el('tr', {}, ...['Reference', 'Type', 'Name', 'Status', 'Submitted'].map(h => el('th', { scope: 'col', text: h })))),
      el('tbody', {}, ...recent.map(r => el('tr', {}, el('td', {}, el('a', { href: `/crm/${VIEW_OF[r.type]}?ref=${encodeURIComponent(r.reference)}`, text: r.reference })), el('td', { text: { candidate: 'Candidate', employer: 'Client request', general: 'Enquiry' }[r.type] || r.type }), el('td', { text: [r.name, r.company].filter(Boolean).join(' · ') }), el('td', {}, badge(r.status)), el('td', { text: fmtDate(r.submittedAt) })))))
      : state('No submissions yet. New website enquiries will appear here.', 'empty');
    root.replaceChildren(stats, el('section', { class: 'crm-panel' }, el('h2', { text: 'Recent submissions' }), el('div', { class: 'crm-table-wrap' }, table)));
  } catch (err) { root.replaceChildren(state('Could not load the overview: ' + (err instanceof Error ? err.message : ''), 'error')); }
}

/* ---------------------------------------------------------------- system status */
async function systemStatus(root: HTMLElement) {
  root.replaceChildren(state('Checking the connection…'));
  try {
    const s = await api('status');
    const row = (label: string, ok: boolean, detail: string) => el('li', { class: ok ? 'is-ok' : 'is-bad' }, el('span', { class: 'crm-dot', 'aria-hidden': 'true' }), el('strong', { text: label }), el('span', { text: detail }));
    const folderNames: Record<string, string> = { ROOT_FOLDER_ID: 'Drive folder: Adhuni HR CRM', CV_FOLDER_ID: 'Drive folder: Candidate CVs', ATTACHMENT_FOLDER_ID: 'Drive folder: Enquiry Attachments' };
    root.replaceChildren(el('section', { class: 'crm-panel' }, el('h2', { text: 'Google connection' }), el('ul', { class: 'crm-checks' },
      row('Apps Script backend', true, 'Connected'),
      row('Spreadsheet', true, s.spreadsheet.name),
      ...s.spreadsheet.tabs.map((t: { name: string; ok: boolean; rows: number }) => row('Tab: ' + t.name, t.ok, t.ok ? `${t.rows} record${t.rows === 1 ? '' : 's'}` : 'Missing: run setup()')),
      ...s.folders.map((f: { key: string; ok: boolean }) => row(folderNames[f.key] || f.key, f.ok, f.ok ? 'Private, owner access only' : 'Missing: run setup()')),
      row('Notification retry trigger', s.trigger, s.trigger ? 'Runs every 15 minutes' : 'Missing: run setup()'),
      row('Notification email', true, s.notifyEmail),
      row('Email quota left today', s.emailQuotaRemaining > 10, String(s.emailQuotaRemaining)))),
      el('p', { class: 'crm-help' }, 'Open the spreadsheet: ', el('a', { href: s.spreadsheet.url, target: '_blank', rel: 'noopener noreferrer', text: s.spreadsheet.name })));
  } catch (err) { root.replaceChildren(el('section', { class: 'crm-panel' }, el('h2', { text: 'Google connection' }), state('The CRM cannot reach the Google backend: ' + (err instanceof Error ? err.message : ''), 'error'))); }
}

/* ---------------------------------------------------------------- record lists */
function records(root: HTMLElement, type: string) {
  const url = new URL(location.href);
  const filters: Record<string, string> = {};
  for (const k of ['q', 'status', 'country', 'category', 'from', 'to']) { const v = url.searchParams.get(k); if (v) filters[k] = v; }
  let page = Number(url.searchParams.get('page')) || 1;
  let statuses: string[] = [], fields: Field[] = [];
  const select = (name: string, label: string, values: string[]) => el('label', {}, label, el('select', { name }, el('option', { value: '', text: 'All' }), ...values.map(v => { const o = el('option', { value: v, text: v }); if (filters[name] === v) o.selected = true; return o; })));
  const statusSelect = select('status', 'Status', []);
  const toolbar = el('form', { class: 'crm-filters', role: 'search' },
    el('label', { class: 'crm-search' }, 'Search', el('input', { type: 'search', name: 'q', value: filters.q || '', placeholder: { candidate: 'Name, email, phone, skills, designation', employer: 'Company, contact, role, email', general: 'Name, company, email, subject' }[type] })),
    select('country', type === 'candidate' ? 'Preferred country' : 'Country', options.countries || []),
    select('category', options.categoryLabel || 'Category', options.categories || []),
    statusSelect,
    el('label', {}, 'From', el('input', { type: 'date', name: 'from', value: filters.from || '' })),
    el('label', {}, 'To', el('input', { type: 'date', name: 'to', value: filters.to || '' })),
    el('div', { class: 'crm-filter-actions' }, el('button', { type: 'submit', class: 'crm-btn crm-btn-primary', text: 'Apply' }), el('button', { type: 'reset', class: 'crm-btn', text: 'Reset' }), el('a', { class: 'crm-btn crm-btn-ghost', href: '#', 'data-export': '', text: 'Export CSV' })));
  const list = el('div', { class: 'crm-table-wrap' });
  const summary = el('p', { class: 'crm-summary', 'aria-live': 'polite' });
  const pager = el('nav', { class: 'crm-pager', 'aria-label': 'Pages' });
  root.replaceChildren(el('section', { class: 'crm-panel' }, toolbar, summary, list, pager));
  const drawer = el('aside', { class: 'crm-drawer', 'aria-label': 'Record details', hidden: '' });
  document.body.append(drawer);

  const query = () => { const p = new URLSearchParams({ type, ...filters }); return p; };
  const syncUrl = () => { const p = new URLSearchParams(filters); if (page > 1) p.set('page', String(page)); const ref = new URL(location.href).searchParams.get('ref'); if (ref) p.set('ref', ref); history.replaceState(null, '', location.pathname + (p.toString() ? '?' + p : '')); };
  const exportLink = toolbar.querySelector<HTMLAnchorElement>('[data-export]')!;

  async function load() {
    list.replaceChildren(state('Loading records…'));
    pager.replaceChildren(); summary.textContent = '';
    const q = query(); q.set('page', String(page)); q.set('pageSize', '25');
    exportLink.href = '/api/crm/export?' + query().toString();
    syncUrl();
    try {
      const data = await api('list?' + q.toString());
      statuses = data.statuses; fields = data.fields;
      if (statusSelect.querySelector('select')!.options.length === 1) statuses.forEach(s => { const o = el('option', { value: s, text: s }); if (filters.status === s) o.selected = true; statusSelect.querySelector('select')!.append(o); });
      const recs = data.records as Rec[];
      const from = data.total ? (data.page - 1) * data.pageSize + 1 : 0, to = Math.min(data.page * data.pageSize, data.total);
      summary.textContent = data.total ? `Showing ${from}–${to} of ${data.total}` : '';
      if (!recs.length) { list.replaceChildren(state(Object.keys(filters).length ? 'No records match these filters.' : 'No records yet. New website submissions will appear here.', 'empty')); return; }
      const cols: [string, (r: Rec) => Node | string][] = type === 'candidate'
        ? [['Reference', r => r.reference], ['Name', r => r.fields.name], ['Designation', r => r.fields.current_most_recent_designation], ['Category', r => r.fields.job_category], ['Preferred country', r => r.fields.country], ['CV', r => r.file ? 'Yes' : '—'], ['Status', r => badge(r.status)], ['Submitted', r => fmtDate(r.submittedAt)]]
        : type === 'employer'
          ? [['Reference', r => r.reference], ['Company', r => r.fields.company], ['Contact', r => r.fields.name], ['Role', r => r.fields.position_job_title], ['Vacancies', r => r.fields.number_of_vacancies], ['Country', r => r.fields.country], ['Status', r => badge(r.status)], ['Submitted', r => fmtDate(r.submittedAt)]]
          : [['Reference', r => r.reference], ['Name', r => r.fields.name], ['Company', r => r.fields.company], ['Enquiry type', r => r.fields.enquiry_type], ['Subject', r => r.fields.subject], ['Status', r => badge(r.status)], ['Submitted', r => fmtDate(r.submittedAt)]];
      const body = el('tbody');
      recs.forEach(r => {
        const open = el('button', { type: 'button', class: 'crm-link', text: r.reference, onclick: () => openRecord(r.reference) });
        body.append(el('tr', {}, ...cols.map(([, get], i) => { const v = i === 0 ? open : get(r); return el('td', {}, typeof v === 'string' ? document.createTextNode(v || '—') : v); })));
      });
      list.replaceChildren(el('table', { class: 'crm-table' }, el('thead', {}, el('tr', {}, ...cols.map(([h]) => el('th', { scope: 'col', text: h })))), body));
      const pages = Math.max(1, Math.ceil(data.total / data.pageSize));
      if (pages > 1) pager.replaceChildren(
        el('button', { type: 'button', class: 'crm-btn', disabled: page <= 1 ? '' : null, text: 'Previous', onclick: () => { page--; load(); } }),
        el('span', { text: `Page ${page} of ${pages}` }),
        el('button', { type: 'button', class: 'crm-btn', disabled: page >= pages ? '' : null, text: 'Next', onclick: () => { page++; load(); } }));
    } catch (err) { list.replaceChildren(state('Could not load records: ' + (err instanceof Error ? err.message : ''), 'error')); }
  }

  toolbar.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(toolbar);
    for (const k of Object.keys(filters)) delete filters[k];
    for (const [k, v] of data.entries()) if (String(v).trim()) filters[k] = String(v).trim();
    page = 1; load();
  });
  toolbar.addEventListener('reset', () => { setTimeout(() => { for (const k of Object.keys(filters)) delete filters[k]; page = 1; load(); }); });
  let timer = 0;
  toolbar.querySelector('input[name=q]')!.addEventListener('input', () => { clearTimeout(timer); timer = window.setTimeout(() => toolbar.requestSubmit(), 450); });

  async function openRecord(reference: string) {
    const back = document.activeElement as HTMLElement | null;
    drawer.hidden = false; document.body.classList.add('crm-drawer-open');
    drawer.replaceChildren(state('Loading the record…'));
    const p = new URL(location.href); p.searchParams.set('ref', reference); history.replaceState(null, '', p);
    const close = () => { drawer.hidden = true; document.body.classList.remove('crm-drawer-open'); const u = new URL(location.href); u.searchParams.delete('ref'); history.replaceState(null, '', u); back?.focus(); };
    drawer.onkeydown = event => { if (event.key === 'Escape') close(); };
    try {
      const data = await api(`record?type=${type}&ref=${encodeURIComponent(reference)}`);
      render(data.record as Rec, data.fields as Field[], data.statuses as string[]);
    } catch (err) { drawer.replaceChildren(el('div', { class: 'crm-drawer-head' }, el('h2', { text: reference }), el('button', { type: 'button', class: 'crm-close', 'aria-label': 'Close', text: '×', onclick: close })), state('Could not load this record: ' + (err instanceof Error ? err.message : ''), 'error')); }

    function render(r: Rec, recordFields: Field[], recordStatuses: string[]) {
      const closeButton = el('button', { type: 'button', class: 'crm-close', 'aria-label': 'Close record', text: '×', onclick: close });
      const details = el('dl', { class: 'crm-fields' });
      recordFields.forEach(([key, label]) => { details.append(el('dt', { text: label }), el('dd', { text: r.fields[key] || '—' })); });
      details.append(el('dt', { text: 'Consent' }), el('dd', { text: `${r.consent}${r.consentAt ? ' · ' + fmtDate(r.consentAt) : ''}` }), el('dt', { text: 'Source page' }), el('dd', { text: r.source || '—' }), el('dt', { text: 'Language' }), el('dd', { text: r.language || '—' }));
      const statusSel = el('select', { name: 'status' }, ...recordStatuses.map(s => { const o = el('option', { value: s, text: s }); if (s === r.status) o.selected = true; return o; }));
      const notes = el('textarea', { name: 'notes', rows: '5', maxlength: '5000' }); notes.value = r.notes || '';
      const msg = el('p', { class: 'crm-save-msg', role: 'status', 'aria-live': 'polite' });
      const save = el('button', { type: 'submit', class: 'crm-btn crm-btn-primary', text: 'Save changes' });
      const form = el('form', { class: 'crm-edit' }, el('label', {}, 'Status', statusSel), el('label', {}, 'Internal notes', notes), el('div', { class: 'crm-edit-actions' }, save, msg));
      form.addEventListener('submit', async event => {
        event.preventDefault();
        save.disabled = true; msg.className = 'crm-save-msg'; msg.textContent = 'Saving…';
        try {
          const data = await api('update', { type, reference: r.reference, status: statusSel.value, notes: notes.value, expectedUpdatedAt: r.updatedAt });
          r = data.record; msg.classList.add('is-ok'); msg.textContent = 'Saved ' + fmtDate(r.updatedAt) + '.'; load();
        } catch (err) {
          const e = err as Error & { status?: number; data?: { record?: Rec } };
          msg.classList.add('is-error');
          if (e.status === 409 && e.data?.record) { msg.textContent = 'This record was changed elsewhere. The latest version is shown; your edits were not saved.'; render(e.data.record, recordFields, recordStatuses); }
          else msg.textContent = e.message;
        } finally { save.disabled = false; }
      });
      const doc = r.file ? el('a', { class: 'crm-btn', href: `/api/crm/file?type=${type}&ref=${encodeURIComponent(r.reference)}`, text: 'Download ' + r.file.name }) : el('p', { class: 'crm-muted', text: 'No document attached.' });
      const notify = el('div', { class: 'crm-notify' }, el('span', { text: 'Email notification: ' }), badge(r.notification || '—'), el('span', { class: 'crm-muted', text: r.notificationAttempts ? ` (${r.notificationAttempts} attempt${r.notificationAttempts === 1 ? '' : 's'})` : '' }));
      if (r.notification !== 'Sent') notify.append(el('button', { type: 'button', class: 'crm-btn crm-btn-small', text: 'Retry email', onclick: async (event: Event) => {
        const b = event.currentTarget as HTMLButtonElement; b.disabled = true; b.textContent = 'Sending…';
        try { const data = await api('retry', { type, reference: r.reference }); if (data.record) render(data.record, recordFields, recordStatuses); else { b.textContent = 'Sent'; } }
        catch (err) { b.disabled = false; b.textContent = 'Retry email'; notify.append(el('span', { class: 'crm-muted', text: ' ' + (err instanceof Error ? err.message : '') })); }
      } }));
      if (r.notificationError) notify.append(el('p', { class: 'crm-muted', text: 'Last error: ' + r.notificationError }));
      drawer.replaceChildren(
        el('div', { class: 'crm-drawer-head' }, el('div', {}, el('p', { class: 'crm-kicker', text: { candidate: 'Candidate', employer: 'Client request', general: 'General enquiry' }[type] || '' }), el('h2', { text: r.fields[NAME_KEY[type]] || r.reference }), el('p', { class: 'crm-muted', text: `${r.reference} · submitted ${fmtDate(r.submittedAt)}` })), closeButton),
        el('div', { class: 'crm-drawer-body' }, form, el('section', {}, el('h3', { text: 'Document' }), doc), el('section', {}, el('h3', { text: 'Notification' }), notify), el('section', {}, el('h3', { text: 'Submitted details' }), details)));
      closeButton.focus();
    }
  }

  load();
  const ref = url.searchParams.get('ref');
  if (ref) openRecord(ref);
}

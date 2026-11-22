// Enquiry forms: inline validation, conditional fields, file drop zone, audience cards and the submit flow.
import { track } from './analytics';
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const MAX_FILE = 2 * 1024 * 1024;
const MESSAGES = {
  required: 'Please fill in this field.',
  choose: 'Please choose an option.',
  consent: 'Please tick this box to continue.',
  email: 'Please enter a valid email address.',
  phone: 'Please enter a valid phone number.',
  number: 'Please enter a whole number of 1 or more.',
  date: 'Please enter a valid date.',
  fileType: 'Please attach a PDF, DOC or DOCX file.',
  fileSize: 'This file is larger than 2 MB.',
  check: 'Please check the highlighted fields and try again.',
};
type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const errorSlot = (control: Control) => control.closest('.field')?.querySelector<HTMLElement>('.field-error') ?? null;
function setError(control: Control, message: string) {
  const slot = errorSlot(control);
  if (slot) slot.textContent = message;
  if (message) control.setAttribute('aria-invalid', 'true'); else control.removeAttribute('aria-invalid');
}
function fileProblem(input: HTMLInputElement) {
  const file = input.files?.[0];
  if (!file) return '';
  if (!/\.(pdf|docx?)$/i.test(file.name)) return MESSAGES.fileType;
  if (file.size > MAX_FILE) return MESSAGES.fileSize;
  return '';
}
function problem(control: Control) {
  const value = control.value.trim();
  if (control instanceof HTMLInputElement && control.type === 'file') return fileProblem(control);
  if (control instanceof HTMLInputElement && control.type === 'checkbox') return control.required && !control.checked ? MESSAGES.consent : '';
  if (control.required && !value) return control instanceof HTMLSelectElement ? MESSAGES.choose : MESSAGES.required;
  if (!value) return '';
  if (control instanceof HTMLInputElement) {
    if (control.type === 'email' && !/^\S+@[^\s@]+\.[^\s@]+$/.test(value)) return MESSAGES.email;
    if (control.type === 'tel' && !(/^\+?[\d\s().-]+$/.test(value) && value.replace(/\D/g, '').length >= 6)) return MESSAGES.phone;
    if (control.type === 'number' && !(/^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 100000)) return MESSAGES.number;
    if (control.type === 'date' && Number.isNaN(Date.parse(value))) return MESSAGES.date;
  }
  return '';
}
const visibleControls = (form: HTMLFormElement) =>
  [...form.querySelectorAll<Control>('input:not([type=hidden]), select, textarea')].filter(control => !control.closest('[hidden], .honeypot'));

/** Random key that identifies one submission, so retries and double clicks are recognised by the server. */
export const newKey = () => (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`).replace(/[^A-Za-z0-9]/g, '').slice(0, 40).padEnd(24, '0');
const fingerprint = (data: FormData) => [...data.entries()].filter(([name]) => name !== 'cf-turnstile-response' && name !== 'submission_id')
  .map(([name, value]) => `${name}=${value instanceof File ? `${value.name}:${value.size}:${value.lastModified}` : value}`).join('&');

/** Opens the branded thank-you dialog with the record reference; focus returns to `returnTo` when it closes. */
export function showThankYou(type: string, reference: string, returnTo?: HTMLElement | null) {
  const dialog = document.querySelector<HTMLDialogElement>('#thank-you-dialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const variant = ['candidate', 'employer', 'general'].includes(type) ? type : 'general';
  dialog.querySelectorAll<HTMLElement>('.ty-variant').forEach(block => {
    const on = block.dataset.variant === variant;
    block.hidden = !on;
    block.querySelector('[data-ty-title]')?.toggleAttribute('id', false);
    block.querySelector('[data-ty-text]')?.toggleAttribute('id', false);
    if (on) { block.querySelector('[data-ty-title]')!.id = 'ty-title'; block.querySelector('[data-ty-text]')!.id = 'ty-text'; }
    const ref = block.querySelector<HTMLElement>('[data-ty-ref]');
    if (ref) ref.textContent = reference;
    block.querySelector<HTMLElement>('.ty-ref')!.hidden = !reference;
  });
  const close = dialog.querySelector<HTMLButtonElement>('[data-ty-close]')!;
  close.onclick = () => dialog.close();
  dialog.onclick = event => { if (event.target === dialog) dialog.close(); };
  dialog.onclose = () => returnTo?.focus({ preventScroll: true });
  dialog.showModal();
  close.focus();
}

function initForm(form: HTMLFormElement) {
  const status = form.querySelector<HTMLElement>('.form-status')!;
  let saving = false, pendingKey = '', pendingPrint = '';

  // Fields that only apply to one choice (e.g. vacancies for employer enquiries).
  const conditional = [...form.querySelectorAll<HTMLElement>('.field[data-show-field]')];
  const syncConditional = () => conditional.forEach(field => {
    const driver = form.elements.namedItem(field.dataset.showField!) as HTMLSelectElement | null;
    const show = !!driver && driver.value === field.dataset.showValue;
    if (!show && !field.hidden) {
      field.querySelectorAll<Control>('input, select, textarea').forEach(control => { control.value = ''; setError(control, ''); });
    }
    field.hidden = !show;
  });
  syncConditional();
  form.addEventListener('change', syncConditional);

  // Inline validation: on leaving a field, and clearing the message as soon as it is fixed.
  form.addEventListener('focusout', event => {
    const control = event.target as Control;
    if (control.matches?.('input, select, textarea') && !control.closest('.honeypot')) setError(control, problem(control));
  });
  form.addEventListener('input', event => {
    const control = event.target as Control;
    if (control.getAttribute?.('aria-invalid') === 'true' && !problem(control)) setError(control, '');
  });
  form.addEventListener('change', event => {
    const control = event.target as Control;
    if (control.getAttribute?.('aria-invalid') === 'true' && !problem(control)) setError(control, '');
  });

  // File drop zone
  const zone = form.querySelector<HTMLElement>('[data-dropzone]');
  const fileInput = zone?.querySelector<HTMLInputElement>('input[type=file]') ?? null;
  const fileRow = form.querySelector<HTMLElement>('.dz-file');
  const showFile = () => {
    if (!fileInput) return; // forms without an upload field
    const file = fileInput?.files?.[0];
    const text = fileProblem(fileInput!);
    if (fileInput) setError(fileInput, text);
    if (file && !text && fileRow) { fileRow.hidden = false; fileRow.querySelector('.dz-name')!.textContent = `${file.name} · ${(file.size / 1024 < 1000 ? Math.max(1, Math.round(file.size / 1024)) + ' KB' : (file.size / 1048576).toFixed(1) + ' MB')}`; }
    else if (fileRow) fileRow.hidden = true;
  };
  if (zone && fileInput) {
    fileInput.addEventListener('change', showFile);
    ['dragenter', 'dragover'].forEach(name => zone.addEventListener(name, event => { event.preventDefault(); zone.classList.add('is-dragover'); }));
    ['dragleave', 'dragend', 'drop'].forEach(name => zone.addEventListener(name, () => zone.classList.remove('is-dragover')));
    zone.addEventListener('drop', event => {
      event.preventDefault();
      const files = (event as DragEvent).dataTransfer?.files;
      if (files?.length) { const transfer = new DataTransfer(); transfer.items.add(files[0]); fileInput.files = transfer.files; showFile(); }
    });
    form.querySelector('.dz-remove')?.addEventListener('click', () => { fileInput.value = ''; showFile(); fileInput.focus(); });
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    status.className = 'form-status';
    status.textContent = '';
    // Validate everything that is visible, then focus the first problem.
    let first: Control | null = null;
    visibleControls(form).forEach(control => {
      const text = problem(control);
      setError(control, text);
      if (text && !first) first = control;
    });
    if (first) {
      status.classList.add('error');
      status.textContent = MESSAGES.check;
      (first as Control).focus();
      return;
    }
    if (form.dataset.enabled !== 'true') {
      status.textContent = 'This is a website preview. No information has been sent or stored.';
      return;
    }
    if (saving) return; // a second click while the first is still saving does nothing
    const submit = form.querySelector<HTMLButtonElement>('[type=submit]')!;
    const data = new FormData(form);
    // The same submission keeps the same key across retries; changing any field starts a new submission.
    const print = fingerprint(data);
    if (!pendingKey || print !== pendingPrint) { pendingKey = newKey(); pendingPrint = print; }
    data.set('submission_id', pendingKey);
    saving = true;
    submit.disabled = true;
    submit.setAttribute('aria-busy', 'true');
    form.classList.add('is-saving');
    status.textContent = data.get('attachment') instanceof File && (data.get('attachment') as File).size ? 'Uploading your CV and saving your details…' : 'Saving your details…';
    try {
      const response = await fetch('/api/contact', { method: 'POST', body: data });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.error || 'We could not save your details just now. Your entries are still here, please try again.');
      track('enquiry_sent',{form:form.dataset.audience||form.id||'enquiry',page:location.pathname.replace(/^\/ar(?=\/)/,'')});
      pendingKey = ''; pendingPrint = '';
      status.classList.add('success');
      status.textContent = 'Thank you. Your details have been received.';
      // The record is saved: tidying the form must never turn this into an error message.
      try { form.reset(); syncConditional(); showFile(); } catch { /* cosmetic only */ }
      showThankYou(String(data.get('type') || 'general'), String(result.reference || ''), submit);
    } catch (error) {
      // Nothing is cleared: the visitor can correct or retry without retyping.
      status.classList.add('error');
      status.textContent = error instanceof Error ? error.message : 'Unable to send. Please try again.';
      status.focus();
    } finally {
      saving = false;
      submit.disabled = false;
      submit.removeAttribute('aria-busy');
      form.classList.remove('is-saving');
      const widget = (window as unknown as { turnstile?: { reset: (el: Element) => void } }).turnstile;
      const element = form.querySelector('.cf-turnstile');
      if (widget && element) widget.reset(element);
    }
  });
}
document.querySelectorAll<HTMLFormElement>('[data-contact-form]').forEach(initForm);

// Contact page: audience cards pre-select the enquiry type and glide to the form.
const target = document.querySelector<HTMLElement>('#general-enquiry');
const scrollToForm = (focus: Control | null) => {
  if (!target) return;
  target.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
  window.setTimeout(() => focus?.focus({ preventScroll: true }), reduceMotion() ? 0 : 450);
};
document.querySelectorAll<HTMLAnchorElement>('[data-enquiry-type]').forEach(card => card.addEventListener('click', event => {
  const select = document.querySelector<HTMLSelectElement>('#general-enquiry select[name=enquiry_type]');
  if (!target || !select) return;
  event.preventDefault();
  select.value = card.dataset.enquiryType || '';
  select.dispatchEvent(new Event('change', { bubbles: true }));
  history.replaceState(null, '', '#general-enquiry');
  scrollToForm(select);
}));
document.querySelectorAll<HTMLAnchorElement>('[data-scroll-form]').forEach(link => link.addEventListener('click', event => {
  if (!target) return;
  event.preventDefault();
  history.replaceState(null, '', '#general-enquiry');
  scrollToForm(target.querySelector<Control>('input[name=name]'));
}));

// Deep link: /contact/?enquiry=employer#general-enquiry opens the form with that enquiry type selected.
const prefillTypes: Record<string, string> = { employer: 'Employer – hiring request', candidate: 'Candidate – job enquiry', general: 'General enquiry' };
const prefill = prefillTypes[new URLSearchParams(location.search).get('enquiry') || ''];
const prefillSelect = document.querySelector<HTMLSelectElement>('#general-enquiry select[name=enquiry_type]');
if (prefill && prefillSelect) {
  prefillSelect.value = prefill;
  prefillSelect.dispatchEvent(new Event('change', { bubbles: true }));
}

// Deep link: ?subject=Permanent%20Recruitment fills the subject (service pages pass the service name).
const prefillSubject = new URLSearchParams(location.search).get('subject');
const subjectInput = document.querySelector<HTMLInputElement>('#general-enquiry input[name=subject]');
if (prefillSubject && subjectInput && !subjectInput.value) subjectInput.value = prefillSubject.slice(0, 120);

// Any link marked data-scroll-to glides to its target form and moves focus to the first field.
document.querySelectorAll<HTMLAnchorElement>('[data-scroll-to]').forEach(link => link.addEventListener('click', event => {
  const section = document.querySelector<HTMLElement>(link.getAttribute('href') || '');
  if (!section) return;
  event.preventDefault();
  section.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
  history.replaceState(null, '', link.getAttribute('href'));
  window.setTimeout(() => section.querySelector<HTMLElement>('input:not([type=hidden]), select, textarea')?.focus({ preventScroll: true }), reduceMotion() ? 0 : 450);
}));

// Candidate hand-off from Quick match: /candidates/?field=Healthcare&country=Kuwait,Qatar#registration
{
  const candidateForm = document.querySelector<HTMLFormElement>('form:has(input[name=type][value=candidate])');
  const params = new URLSearchParams(location.search);
  const field = params.get('field');
  const countries = (params.get('country') || '').split(',').map(value => value.trim()).filter(Boolean);
  const setSelect = (name: string, value: string) => {
    const select = candidateForm?.querySelector<HTMLSelectElement>(`select[name="${name}"]`);
    if (select && value && [...select.options].some(option => option.value === value)) { select.value = value; return true; }
    return false;
  };
  if (candidateForm) {
    if (field) setSelect('job_category', field);
    // ?specialty=Nursing (from the homepage healthcare tiles): noted in key skills so the recruiter sees it.
    const specialty = params.get('specialty');
    const skills = candidateForm.querySelector<HTMLTextAreaElement>('textarea[name=key_skills]');
    if (specialty && ['Nursing', 'Physicians', 'Allied health', 'Support & admin'].includes(specialty) && skills && !skills.value) skills.value = `Healthcare specialty: ${specialty}`;
    if (countries[0]) setSelect('country', countries[0]);
    // Further preferred countries go into the notes so nothing the visitor chose is lost.
    const extra = countries.slice(1).filter(value => /^[A-Za-z ]{2,30}$/.test(value));
    const notes = candidateForm.querySelector<HTMLTextAreaElement>('textarea[name=additional_information]');
    if (extra.length && notes && !notes.value) notes.value = `Other preferred countries: ${extra.join(', ')}`;
  }
}

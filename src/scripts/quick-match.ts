// Quick match lead assistant: triggers, step flow, accessibility, submission and analytics.
const card = document.querySelector<HTMLElement>('#quick-match');
const bar = document.querySelector<HTMLElement>('.qm-bar');

// ---------------------------------------------------------------- analytics
// Events are pushed to window.dataLayer (Google Tag Manager) and sent through gtag() when it exists. Nothing is sent until one of them is installed.
type Params = Record<string, string | number | boolean | undefined>;
function track(name: string, params: Params = {}) {
  const w = window as unknown as { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
  const payload = { event: name, ...params };
  (w.dataLayer = w.dataLayer || []).push(payload);
  if (typeof w.gtag === 'function') w.gtag('event', name, params);
  document.dispatchEvent(new CustomEvent('adhuni:analytics', { detail: payload }));
}

// ---------------------------------------------------------------- remembering the visitor's choice
const KEY = 'adhuni.quickmatch.v1';
let memory = false;
const store = {
  get(): boolean {
    for (const area of ['localStorage', 'sessionStorage'] as const) {
      try { if (window[area].getItem(KEY)) return true; } catch { /* storage blocked */ }
    }
    return memory;
  },
  set() {
    memory = true;
    for (const area of ['localStorage', 'sessionStorage'] as const) {
      try { window[area].setItem(KEY, String(Date.now())); return; } catch { /* try the next one */ }
    }
  },
};

type Path = 'employer' | 'candidate';
const FLOWS: Record<Path, string[]> = {
  employer: ['e-roles', 'e-count', 'e-where', 'e-contact'],
  candidate: ['c-field', 'c-where', 'c-upload'],
};

function init(card: HTMLElement, bar: HTMLElement) {
  if (store.get()) { card.remove(); bar.remove(); return; }

  const root = document.documentElement;
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isLang = () => root.lang === 'ar';
  const steps = new Map([...card.querySelectorAll<HTMLElement>('.qm-step')].map(step => [step.dataset.step!, step]));
  const dots = card.querySelector<HTMLElement>('.qm-dots')!;
  const back = card.querySelector<HTMLButtonElement>('.qm-back')!;
  const state = { path: null as Path | null, roles: new Set<string>(), count: '', countries: new Set<string>(), field: '', cCountries: new Set<string>() };
  const history: string[] = [];
  let current = 'choose';
  let open = false;
  let returnFocus: HTMLElement | null = null;
  let completed = false;

  // ------------------------------------------------ positioning: always above the WhatsApp button
  const widget = document.querySelector<HTMLElement>('.whatsapp-widget');
  const place = () => {
    const top = widget?.getBoundingClientRect().top ?? innerHeight - 24;
    card.style.setProperty('--qm-bottom', `${Math.round(innerHeight - top + 12)}px`);
  };
  let ticking = false;
  const schedulePlace = () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { place(); ticking = false; }); } };

  // ------------------------------------------------ step flow
  const flow = () => (state.path ? FLOWS[state.path] : []);
  const renderDots = () => {
    const list = flow();
    dots.hidden = list.length === 0 || current === 'e-done';
    if (dots.hidden) return;
    const index = list.indexOf(current);
    dots.innerHTML = '';
    list.forEach((_, i) => {
      const dot = document.createElement('span');
      dot.className = 'qm-dot' + (i === index ? ' is-active' : i < index ? ' is-done' : '');
      dots.append(dot);
    });
    dots.setAttribute('aria-label', isLang() ? `الخطوة ${index + 1} من ${list.length}` : `Step ${index + 1} of ${list.length}`);
  };
  function show(id: string, direction: 1 | -1 = 1, focus = true) {
    const from = steps.get(current);
    const to = steps.get(id);
    if (!to) return;
    if (from && from !== to) {
      if (reduce()) from.hidden = true;
      else { const out = from.animate([{ opacity: 1 }, { opacity: 0, transform: `translateX(${-18 * direction}px)` }], { duration: 120, easing: 'ease-in' }); out.onfinish = () => { from.hidden = true; }; }
    }
    current = id;
    to.hidden = false;
    if (!reduce()) to.animate([{ opacity: 0, transform: `translateX(${22 * direction}px)` }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'cubic-bezier(.22,1,.36,1)' });
    back.hidden = id === 'choose' || id === 'e-done';
    renderDots();
    if (focus) window.setTimeout(() => (to.querySelector<HTMLElement>('.qm-q') ?? to).focus({ preventScroll: true }), reduce() ? 0 : 60);
  }
  const advance = (completedStep: string) => {
    const list = flow();
    const index = list.indexOf(completedStep);
    track('quick_match_step_completed', { path: state.path ?? '', step: completedStep, step_number: index + 1 });
    history.push(current);
    show(list[index + 1], 1);
    if (list[index + 1] === 'c-upload') prepareHandoff();
  };
  back.addEventListener('click', () => { const previous = history.pop(); if (previous) show(previous, -1); });

  // choose a path
  card.querySelectorAll<HTMLButtonElement>('[data-path]').forEach(button => button.addEventListener('click', () => {
    state.path = button.dataset.path as Path;
    track('quick_match_path_chosen', { path: state.path });
    history.push('choose');
    show(FLOWS[state.path][0], 1);
  }));

  // chips
  card.querySelectorAll<HTMLElement>('.qm-chips').forEach(group => {
    const field = group.dataset.field as 'roles' | 'count' | 'countries' | 'field' | 'cCountries';
    const multi = group.hasAttribute('data-multi');
    const next = group.parentElement!.querySelector<HTMLButtonElement>('.qm-next')!;
    const read = () => {
      const chosen = [...group.querySelectorAll<HTMLElement>('[aria-pressed=true]')].map(chip => chip.dataset.value!);
      if (field === 'roles') state.roles = new Set(chosen);
      else if (field === 'countries') state.countries = new Set(chosen);
      else if (field === 'cCountries') state.cCountries = new Set(chosen);
      else if (field === 'count') state.count = chosen[0] ?? '';
      else state.field = chosen[0] ?? '';
      next.disabled = chosen.length === 0;
    };
    group.addEventListener('click', event => {
      const chip = (event.target as HTMLElement).closest<HTMLElement>('.qm-chip');
      if (!chip) return;
      const pressed = chip.getAttribute('aria-pressed') === 'true';
      if (!multi) group.querySelectorAll('.qm-chip').forEach(other => other.setAttribute('aria-pressed', 'false'));
      chip.setAttribute('aria-pressed', String(multi ? !pressed : true));
      read();
    });
    next.addEventListener('click', () => advance(group.closest<HTMLElement>('.qm-step')!.dataset.step!));
  });

  // candidate hand-off: open the For Candidates form with the field and country pre-filled
  const upload = card.querySelector<HTMLAnchorElement>('.qm-upload')!;
  function prepareHandoff() {
    const params = new URLSearchParams();
    if (state.field) params.set('field', state.field);
    if (state.cCountries.size) params.set('country', [...state.cCountries].join(','));
    upload.href = `/candidates/?${params.toString()}#registration`;
  }
  upload.addEventListener('click', () => {
    track('quick_match_cv_handoff', { field: state.field, countries: [...state.cCountries].join(',') });
    completed = true;
    store.set();
  });

  // ------------------------------------------------ employer contact form + submission
  const form = card.querySelector<HTMLFormElement>('.qm-form')!;
  const status = form.querySelector<HTMLElement>('.qm-status')!;
  const sendButton = form.querySelector<HTMLButtonElement>('.qm-send')!;
  const MESSAGES = { required: 'Please fill in this field.', email: 'Please enter a valid email address.', phone: 'Please enter a valid phone number.', consent: 'Please tick this box to continue.' };
  const setError = (input: HTMLInputElement, text: string) => {
    const slot = document.getElementById(input.getAttribute('aria-describedby') || '');
    if (slot) slot.textContent = text;
    if (text) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
  };
  const problem = (input: HTMLInputElement) => {
    const value = input.value.trim();
    if (input.type === 'checkbox') return input.checked ? '' : MESSAGES.consent;
    if (input.required && !value) return MESSAGES.required;
    if (input.type === 'email' && value && !/^\S+@[^\s@]+\.[^\s@]+$/.test(value)) return MESSAGES.email;
    if (input.type === 'tel' && value && !(/^\+?[\d\s().-]+$/.test(value) && value.replace(/\D/g, '').length >= 6)) return MESSAGES.phone;
    return '';
  };
  const required = [...form.querySelectorAll<HTMLInputElement>('input[required]')];
  required.forEach(input => {
    input.addEventListener('blur', () => setError(input, problem(input)));
    input.addEventListener('input', () => { if (input.getAttribute('aria-invalid') && !problem(input)) setError(input, ''); });
    input.addEventListener('change', () => { if (input.getAttribute('aria-invalid') && !problem(input)) setError(input, ''); });
  });

  // Turnstile is only loaded once the form is reached, and only when the site is configured to send enquiries.
  let token = '';
  let turnstileReady: Promise<void> | null = null;
  const ensureTurnstile = () => {
    const key = card.dataset.sitekey;
    if (card.dataset.enabled !== 'true' || !key) return Promise.resolve();
    turnstileReady ??= new Promise<void>(resolve => {
      const w = window as unknown as { turnstile?: { render: (el: Element, options: Record<string, unknown>) => void } };
      const render = () => { w.turnstile!.render(form.querySelector('.qm-turnstile')!, { sitekey: key, callback: (value: string) => { token = value; } }); resolve(); };
      if (w.turnstile) { render(); return; }
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.onload = render;
      document.head.append(script);
    });
    return turnstileReady;
  };

  form.addEventListener('submit', async event => {
    event.preventDefault();
    status.className = 'qm-status';
    status.textContent = '';
    let first: HTMLInputElement | null = null;
    required.forEach(input => { const text = problem(input); setError(input, text); if (text && !first) first = input; });
    if (first) { (first as HTMLInputElement).focus(); return; }
    const preview = card.dataset.enabled !== 'true';
    const countries = [...state.countries];
    const detail = { path: 'employer', roles: [...state.roles].join(', '), headcount: state.count, countries: countries.join(', '), preview };
    if (preview) {
      // Same behaviour as the main forms: nothing is sent or stored, and the page never claims otherwise.
      track('quick_match_submitted', detail);
      completed = true; store.set();
      finishEmployer(true);
      return;
    }
    sendButton.disabled = true;
    status.textContent = 'Sending your enquiry…';
    try {
      const data = new FormData(form);
      const body = new FormData();
      body.set('type', 'general');
      body.set('enquiry_type', 'Employer – hiring request');
      body.set('subject', 'Quick match – hiring');
      body.set('name', String(data.get('name') || ''));
      body.set('company', String(data.get('company') || ''));
      body.set('email', String(data.get('email') || ''));
      body.set('phone', String(data.get('phone') || ''));
      body.set('country', countries[0] || 'Other');
      body.set('consent', 'on');
      body.set('website', String(data.get('website') || ''));
      body.set('cf-turnstile-response', token);
      // The answers travel as structured lines so the lead arrives pre-sorted.
      body.set('message', ['Source: Quick match', `Roles needed: ${detail.roles}`, `People needed: ${detail.headcount}`, `Countries: ${detail.countries}`].join('\n'));
      const response = await fetch('/api/contact', { method: 'POST', body });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Your enquiry could not be sent. Please try again.');
      track('quick_match_submitted', detail);
      completed = true; store.set();
      finishEmployer(false);
    } catch (error) {
      status.classList.add('is-error');
      status.textContent = error instanceof Error ? error.message : 'Unable to send. Please try again.';
    } finally {
      sendButton.disabled = false;
    }
  });
  function finishEmployer(preview: boolean) {
    const heading = steps.get('e-done')!.querySelector<HTMLElement>('.qm-q')!;
    heading.textContent = preview ? 'This is a website preview. No information has been sent or stored.' : "Thanks! We'll reply within one business day.";
    history.length = 0;
    show('e-done', 1);
  }
  card.querySelector('.qm-finish')?.addEventListener('click', () => close('finished'));

  // ------------------------------------------------ open / close
  const keydown = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.stopPropagation(); close('escape'); } };
  function openCard(trigger: string) {
    if (open) return;
    open = true;
    returnFocus = (document.activeElement as HTMLElement) || null;
    bar.hidden = true;
    root.classList.remove('qm-bar-on');
    place();
    window.setTimeout(place, 420); // the WhatsApp button glides to its resting spot first
    card.hidden = false;
    void card.offsetWidth;
    card.classList.add('is-open');
    document.addEventListener('keydown', keydown);
    addEventListener('resize', schedulePlace);
    addEventListener('scroll', schedulePlace, { passive: true });
    window.setTimeout(() => card.querySelector<HTMLElement>('.qm-q')?.focus({ preventScroll: true }), reduce() ? 0 : 80);
    if (trigger !== 'bar_tap') track('quick_match_shown', { trigger, surface: 'card' });
  }
  function close(reason: string) {
    if (!open) return;
    open = false;
    track('quick_match_closed', { reason, step: current, path: state.path ?? '', completed });
    store.set();
    card.classList.remove('is-open');
    document.removeEventListener('keydown', keydown);
    removeEventListener('resize', schedulePlace);
    removeEventListener('scroll', schedulePlace);
    window.setTimeout(() => { card.hidden = true; }, reduce() ? 0 : 260);
    if (returnFocus && document.contains(returnFocus)) returnFocus.focus({ preventScroll: true });
  }
  card.querySelector('.qm-close')!.addEventListener('click', () => close('close_button'));
  // reaching the contact step loads the security check (when enabled)
  const contactStep = steps.get('e-contact')!;
  new MutationObserver(() => { if (!contactStep.hidden) void ensureTurnstile(); }).observe(contactStep, { attributes: true, attributeFilter: ['hidden'] });

  // phones: a slim bar first, the card only when the bar is tapped
  const narrow = matchMedia('(max-width: 700px)');
  const showBar = (trigger: string) => {
    bar.hidden = false;
    root.classList.add('qm-bar-on');
    track('quick_match_shown', { trigger, surface: 'bar' });
  };
  bar.querySelector('.qm-bar-open')!.addEventListener('click', () => { track('quick_match_bar_opened'); openCard('bar_tap'); });
  bar.querySelector('.qm-bar-close')!.addEventListener('click', () => {
    bar.hidden = true;
    root.classList.remove('qm-bar-on');
    store.set();
    track('quick_match_closed', { reason: 'bar_dismissed', step: 'bar', path: '', completed: false });
  });

  // ------------------------------------------------ triggers: 45 s, 60 % scroll, or exit intent (desktop). Never during the splash.
  let fired = false;
  const splashActive = () => root.dataset.intro === 'active';
  const present = (trigger: string) => {
    if (fired || store.get()) return;
    if (splashActive()) { pending = trigger; return; }
    fired = true;
    removeEventListener('scroll', onScroll);
    document.removeEventListener('mouseout', onExit);
    clearTimeout(timer);
    if (narrow.matches) showBar(trigger); else openCard(trigger);
  };
  let pending = '';
  new MutationObserver(() => { if (!splashActive() && pending) { const reason = pending; pending = ''; present(reason); } }).observe(root, { attributes: true, attributeFilter: ['data-intro'] });
  const onScroll = () => {
    const scrolled = (scrollY + innerHeight) / Math.max(document.documentElement.scrollHeight, 1);
    if (scrolled >= 0.6) present('scroll');
  };
  const onExit = (event: MouseEvent) => {
    if (event.relatedTarget === null && event.clientY <= 0 && matchMedia('(hover: hover) and (min-width: 701px)').matches) present('exit_intent');
  };
  addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('mouseout', onExit);
  const timer = window.setTimeout(() => present('timer'), 45000);
}

if (card && bar) init(card, bar);

// Homepage map: country cards and map pins highlight each other; map labels follow the page language.
const section = document.querySelector<HTMLElement>('#markets');
const svg = section?.querySelector<SVGSVGElement>('.map-svg');
if (section && svg) {
  const items = [...section.querySelectorAll<HTMLElement | SVGElement>('[data-country]')];
  const highlight = (slug: string | null) => items.forEach(el => el.classList.toggle('is-active', slug !== null && el.dataset.country === slug));
  section.querySelectorAll<HTMLElement | SVGElement>('.mk-card, .map-pin').forEach(el => {
    const slug = el.dataset.country ?? null;
    el.addEventListener('pointerenter', () => highlight(slug));
    el.addEventListener('pointerleave', () => highlight(null));
    el.addEventListener('focusin', () => highlight(slug));
    el.addEventListener('focusout', () => highlight(null));
  });

  // The language toggle skips SVG text, so swap the map labels here.
  const labels = [...svg.querySelectorAll<SVGTextElement>('text[data-ar]')];
  let shown = '';
  const syncLabels = () => {
    // The language script re-writes lang on every render, so only act when it actually changes.
    const lang = document.documentElement.lang;
    if (lang === shown) return;
    shown = lang;
    labels.forEach(label => { label.textContent = (lang === 'ar' ? label.dataset.ar : label.dataset.en) ?? label.textContent; });
  };
  syncLabels();
  new MutationObserver(syncLabels).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  // Phones: the two parts of the map stack, GCC above the source countries, so labels stay readable.
  const full = svg.getAttribute('viewBox')!;
  const [, , width, height] = full.split(' ').map(Number);
  const split = 380;
  const lower = svg.cloneNode(true) as SVGSVGElement;
  lower.setAttribute('viewBox', `${split} 0 ${width - split} ${height}`);
  lower.setAttribute('aria-hidden', 'true');
  lower.removeAttribute('role');
  lower.removeAttribute('aria-label');
  lower.classList.add('map-svg-lower');
  const phone = matchMedia('(max-width: 600px)');
  const fit = () => {
    svg.setAttribute('viewBox', phone.matches ? `0 0 ${split} ${height}` : full);
    if (phone.matches) svg.after(lower); else lower.remove();
  };
  fit();
  phone.addEventListener('change', fit);
}

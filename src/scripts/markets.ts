// Homepage map: country cards and map pins highlight each other; the map is cropped on small screens.
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

  // Phones: zoom in on the Gulf-to-India corridor so labels stay readable.
  const narrow = matchMedia('(max-width: 850px)');
  const fit = () => {
    svg.setAttribute('viewBox', narrow.matches ? '40 100 580 200' : '0 0 760 480');
    svg.classList.toggle('is-cropped', narrow.matches);
  };
  fit();
  narrow.addEventListener('change', fit);

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
}

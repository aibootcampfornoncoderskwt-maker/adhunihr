export {};
// Headline entrance: after the splash screen has gone, the headline rises into place once.
// (The rotating phrases are driven by hero-slideshow.ts; this only handles the first appearance.)
const visual = document.querySelector<HTMLElement>('.hero-title-visual');
if (visual && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const root = document.documentElement;
  root.classList.add('hero-title-pending');
  const reveal = () => requestAnimationFrame(() => root.classList.remove('hero-title-pending'));
  if (root.dataset.intro === 'active') {
    const wait = new MutationObserver(() => {
      if (root.dataset.intro !== 'active') { wait.disconnect(); reveal(); }
    });
    wait.observe(root, { attributes: true, attributeFilter: ['data-intro'] });
  } else reveal();
}

// In-page menu: sticks under the header, highlights the section being read.
const nav = document.querySelector<HTMLElement>('.page-section-nav');
if (nav) {
  const stack = document.querySelector<HTMLElement>('#header-stack');
  const setOffset = () => document.documentElement.style.setProperty('--stack-h', `${stack?.offsetHeight ?? 0}px`);
  setOffset();
  addEventListener('resize', setOffset);
  if ('ResizeObserver' in window && stack) new ResizeObserver(setOffset).observe(stack);

  const links = [...nav.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')];
  const targets = links
    .map(link => ({ link, section: document.getElementById(link.getAttribute('href')!.slice(1)) }))
    .filter((entry): entry is { link: HTMLAnchorElement; section: HTMLElement } => !!entry.section);
  const setCurrent = (active: HTMLAnchorElement | null) => links.forEach(link => {
    if (link === active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
  });
  const update = () => {
    // The current section is the last one whose top has passed the line just under the stuck header + menu.
    const line = (stack?.offsetHeight ?? 0) + nav.offsetHeight + 24;
    let active: HTMLAnchorElement | null = null;
    for (const { link, section } of targets) if (section.getBoundingClientRect().top <= line) active = link;
    setCurrent(active);
  };
  let ticking = false;
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { update(); ticking = false; }); } }, { passive: true });
  update();
  // Anchor jumps land below the stuck bars.
  targets.forEach(({ section }) => { section.style.scrollMarginTop = `calc(var(--stack-h, 132px) + ${nav.offsetHeight + 12}px)`; });
}

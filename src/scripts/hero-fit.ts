export {};
// Homepage chrome: full-screen hero sizing, transparent-to-solid header, and the seamless country ticker.
const hero = document.querySelector<HTMLElement>('.hero');
const root = document.documentElement;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (hero) {
  // 1. Hero fills one screen: the header row sits over the hero, so only the top bar and ribbon are subtracted.
  const topbar = document.querySelector<HTMLElement>('.topbar');
  const nav = document.querySelector<HTMLElement>('.site-header');
  const ribbon = document.querySelector<HTMLElement>('.country-ribbon');
  let liftWhatsApp = () => {};
  const measure = () => {
    hero.style.setProperty('--chrome-h', `${(topbar?.offsetHeight ?? 0) + (ribbon?.offsetHeight ?? 0)}px`);
    hero.style.setProperty('--nav-h', `${nav?.offsetHeight ?? 0}px`);
    liftWhatsApp();
  };
  measure();
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(measure);
    [topbar, nav, ribbon].forEach(el => el && observer.observe(el));
  }
  addEventListener('resize', measure);
  addEventListener('load', () => liftWhatsApp());

  // 2. Header is transparent over the hero and turns solid as soon as the page scrolls.
  root.classList.add('hero-header');
  // The WhatsApp button rides above the ticker while the first screen is showing.
  liftWhatsApp = () => {
    const top = ribbon?.getBoundingClientRect().top ?? innerHeight;
    const lifted = scrollY < 24 && top < innerHeight;
    root.classList.toggle('wa-lifted', lifted);
    if (lifted) root.style.setProperty('--wa-lift', `${Math.round(innerHeight - top + 14)}px`);
  };
  const onScroll = () => { root.classList.toggle('is-scrolled', scrollY > 12); liftWhatsApp(); };
  onScroll();
  addEventListener('resize', liftWhatsApp);
  addEventListener('scroll', onScroll, { passive: true });
}

// 3. Country ticker: repeat the list until it always overfills the bar, at a constant calm speed.
const viewport = document.querySelector<HTMLElement>('.ribbon-viewport');
const track = viewport?.querySelector<HTMLElement>('.ribbon-track');
if (viewport && track && !reducedMotion) {
  const SPEED = 36; // px per second
  const base = track.querySelector<HTMLElement>('.ribbon-group');
  if (base) {
    track.querySelectorAll('.ribbon-group').forEach(group => group !== base && group.remove());
    let builtFor = 0;
    const build = () => {
      const width = viewport.clientWidth;
      if (!width || width === builtFor) return;
      builtFor = width;
      track.querySelectorAll('.ribbon-group').forEach(group => group !== base && group.remove());
      // Widen the gap between markets until one loop is at least as wide as the bar, so no country shows twice at once.
      viewport.style.removeProperty('--ticker-gap');
      const markets = base.querySelectorAll('.ribbon-market').length;
      const baseGap = parseFloat(getComputedStyle(viewport).getPropertyValue('--ticker-gap')) || 0;
      let unit = base.getBoundingClientRect().width;
      if (!unit) return;
      if (markets && unit < width) {
        const gap = baseGap + (width - unit) / (markets * 2) + 6;
        viewport.style.setProperty('--ticker-gap', `${gap}px`);
        unit = base.getBoundingClientRect().width;
      }
      for (let i = 1; i < Math.max(2, Math.ceil(width / unit) + 1); i++) {
        const copy = base.cloneNode(true) as HTMLElement;
        copy.setAttribute('aria-hidden', 'true');
        track.append(copy);
      }
      track.style.setProperty('--ticker-w', `${unit}px`);
      track.style.setProperty('--ticker-dur', `${unit / SPEED}s`);
      viewport.classList.add('is-looping');
    };
    build();
    if ('ResizeObserver' in window) new ResizeObserver(build).observe(viewport);
    else addEventListener('resize', build);
  }
}

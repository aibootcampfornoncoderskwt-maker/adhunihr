const hero = document.querySelector<HTMLElement>('.hero');
if (hero) {
  const slides = [...hero.querySelectorAll<HTMLImageElement>('.hero-slide')];
  const captions = [...hero.querySelectorAll<HTMLElement>('.hero-caption-item')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let elapsed = 0;
  let last = 0;
  let frame = 0;
  let generation = 0;
  let ready = false;
  const animations: Animation[] = [];
  // The caption cross-fades (CSS): the old one fades out fully, then the new one fades in.
  const showCaption = (index: number) => captions.forEach((caption, i) => caption.classList.toggle('is-active', i === index));
  const animate = (element: Element, frames: Keyframe[], duration: number, easing = 'linear') => {
    const animation = element.animate(frames, { duration, fill: 'forwards', easing });
    animations.push(animation);
    return animation;
  };
  const zoom = (index: number) => animate(slides[index], [{ transform: 'scale(1)' }, { transform: 'scale(1.045)' }], 7500);
  async function prepareNext() {
    ready = false;
    const version = generation;
    const next = slides[(current + 1) % slides.length];
    if (!next.src) {
      next.srcset = next.dataset.srcset!;
      next.src = next.dataset.src!;
    }
    try { await next.decode(); if (version === generation) ready = true; } catch { /* Retain the current image if loading fails. */ }
  }
  function tick(time: number) {
    if (!last) last = time;
    elapsed += time - last;
    last = time;
    if (elapsed >= 6000 && ready) {
      animations.splice(0, animations.length, ...animations.filter(animation => animation.playState !== 'idle'));
      const previous = current;
      current = (current + 1) % slides.length;
      slides.forEach((slide, index) => slide.setAttribute('aria-hidden', String(index !== current)));
      showCaption(current);
      // Keep the outgoing image opaque underneath to avoid a dark dip during the fade.
      slides[previous].style.zIndex = '1';
      slides[current].style.zIndex = '2';
      zoom(current);
      const fade = animate(slides[current], [{ opacity: 0 }, { opacity: 1 }], 1000, 'ease-in-out');
      fade.onfinish = () => {
        slides[previous].getAnimations().forEach(animation => animation.cancel());
        slides[previous].style.opacity = '0';
        slides[previous].style.zIndex = '0';
      };
      elapsed = 0;
      void prepareNext();
    }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame);
    last = 0;
    const stopped = document.hidden || document.documentElement.dataset.intro === 'active';
    animations.splice(0, animations.length, ...animations.filter(animation => animation.playState !== 'idle'));
    animations.forEach(animation => { if (stopped) animation.pause(); else animation.play(); });
    if (!stopped && !motion.matches) frame = requestAnimationFrame(tick);
  }
  function reset() {
    generation++;
    cancelAnimationFrame(frame);
    animations.forEach(animation => animation.cancel());
    animations.length = 0;
    current = elapsed = last = 0;
    slides.forEach((slide, index) => {
      slide.style.opacity = index === 0 ? '1' : '0';
      slide.style.zIndex = '0';
      slide.setAttribute('aria-hidden', String(index !== 0));
    });
    showCaption(0);
    if (!motion.matches) {
      zoom(0);
      const version = generation;
      void slides[0].decode().then(() => {
        if (version === generation && !motion.matches) void prepareNext();
      }).catch(() => { /* Leave the first-image fallback in place. */ });
      sync();
    }
  }
  document.addEventListener('visibilitychange', sync);
  new MutationObserver(sync).observe(document.documentElement, { attributes: true, attributeFilter: ['data-intro'] });
  motion.addEventListener('change', reset);
  reset();
}

const hero = document.querySelector<HTMLElement>('.hero');
if (hero) {
  const slides = [...hero.querySelectorAll<HTMLImageElement>('.hero-slide')];
  const captions = [...hero.querySelectorAll<HTMLElement>('.hero-caption-item')];
  const phrases = [...hero.querySelectorAll<HTMLElement>('.hero-phrase:not(.hero-phrase-static)')];
  const SLIDE_MS = 7500;   // time on each slide
  const FADE_MS = 600;     // image crossfade, also the headline phrase swap
  let hovering = false;    // pointer or keyboard focus on the headline or buttons pauses the rotation
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let elapsed = 0;
  let last = 0;
  let frame = 0;
  let generation = 0;
  let ready = false;
  const animations: Animation[] = [];
  // The caption cross-fades (CSS): the old one fades out fully, then the new one fades in.
  const showCaption = (index: number) => {
    const key = slides[index].dataset.caption;
    captions.forEach(caption => caption.classList.toggle('is-active', caption.dataset.key === key));
    // Headline phrase: the old one slides up and out while the new one slides up in, in step with the image crossfade.
    phrases.forEach((phrase, i) => {
      if (i === index) { phrase.classList.remove('is-leaving'); phrase.classList.add('is-active'); }
      else if (phrase.classList.contains('is-active')) {
        phrase.classList.remove('is-active'); phrase.classList.add('is-leaving');
        window.setTimeout(() => phrase.classList.remove('is-leaving'), FADE_MS + 100);
      } else phrase.classList.remove('is-leaving');
    });
  };
  const animate = (element: Element, frames: Keyframe[], duration: number, easing = 'linear') => {
    const animation = element.animate(frames, { duration, fill: 'forwards', easing });
    animations.push(animation);
    return animation;
  };
  const zoom = (index: number) => animate(slides[index], [{ transform: 'scale(1)' }, { transform: 'scale(1.045)' }], SLIDE_MS + FADE_MS);
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
    if (elapsed >= SLIDE_MS && ready) {
      animations.splice(0, animations.length, ...animations.filter(animation => animation.playState !== 'idle'));
      const previous = current;
      current = (current + 1) % slides.length;
      slides.forEach((slide, index) => slide.setAttribute('aria-hidden', String(index !== current)));
      showCaption(current);
      // Keep the outgoing image opaque underneath to avoid a dark dip during the fade.
      slides[previous].style.zIndex = '1';
      slides[current].style.zIndex = '2';
      zoom(current);
      const fade = animate(slides[current], [{ opacity: 0 }, { opacity: 1 }], FADE_MS, 'ease-in-out');
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
    const stopped = document.hidden || hovering || document.documentElement.dataset.intro === 'active';
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
  // Pause while the pointer or focus is on the headline or the buttons; resume when it leaves.
  hero.querySelectorAll<HTMLElement>('h1, .hero-actions').forEach(zone => {
    const set = (value: boolean) => { if (hovering !== value) { hovering = value; sync(); } };
    zone.addEventListener('pointerenter', event => { if ((event as PointerEvent).pointerType !== 'touch') set(true); });
    zone.addEventListener('pointerleave', () => set(false));
    zone.addEventListener('focusin', () => set(true));
    zone.addEventListener('focusout', () => set(false));
  });
  document.addEventListener('visibilitychange', sync);
  new MutationObserver(sync).observe(document.documentElement, { attributes: true, attributeFilter: ['data-intro'] });
  motion.addEventListener('change', reset);
  reset();
}

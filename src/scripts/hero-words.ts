export {};
// Reveals the hero headline word by word, once, after the splash screen has gone.
// The original nodes are put back when the animation ends so the Arabic/English toggle keeps working.
const headline = document.querySelector<HTMLElement>('.hero h1');
if (headline && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const originals = [...headline.childNodes];
  let index = 0;
  const wrapWords = (node: Node): Node => {
    if (node.nodeType === Node.TEXT_NODE) {
      const fragment = document.createDocumentFragment();
      (node.nodeValue ?? '').split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (!part.trim()) { fragment.append(document.createTextNode(part)); return; }
        const word = document.createElement('span');
        word.className = 'word-reveal__word';
        word.style.setProperty('--word-index', String(index++));
        word.textContent = part;
        fragment.append(word);
      });
      return fragment;
    }
    const copy = node.cloneNode(false);
    node.childNodes.forEach(child => copy.appendChild(wrapWords(child)));
    return copy;
  };
  headline.replaceChildren(...originals.map(wrapWords));
  headline.classList.add('word-reveal');

  const run = () => {
    headline.classList.add('is-visible');
    const total = index * 70 + 800 + 150;
    setTimeout(() => {
      headline.classList.remove('word-reveal', 'is-visible');
      headline.replaceChildren(...originals);
    }, total);
  };
  if (document.documentElement.dataset.intro === 'active') {
    const wait = new MutationObserver(() => {
      if (document.documentElement.dataset.intro !== 'active') { wait.disconnect(); requestAnimationFrame(run); }
    });
    wait.observe(document.documentElement, { attributes: true, attributeFilter: ['data-intro'] });
  } else {
    requestAnimationFrame(run);
  }
}

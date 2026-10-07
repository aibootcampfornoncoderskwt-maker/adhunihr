import { track } from './analytics';
// Homepage healthcare section: two audience cards (tabs) that cross-fade the content, image and strip.
// Selection state (aria-selected, tabindex, arrow/Home/End keys, RTL-aware) is handled by the shared tab handler in site.ts;
// this script reacts to aria-selected changes, swaps the active panes, and reports analytics. It remembers nothing: the page always loads on the employer tab.
// Both panes stay in the layout (stacked), so the section keeps the height of the taller tab and the page never jumps.
const section = document.querySelector<HTMLElement>('[data-healthcare-tabs]');
if (section) {
  let current = 'employer';

  const show = (audience: string) => {
    if (audience === current) return;
    current = audience;
    section.dataset.audience = audience;
    section.querySelectorAll<HTMLElement>('.hc-pane').forEach(pane => {
      const active = pane.dataset.audience === audience;
      pane.classList.toggle('is-active', active);
      pane.toggleAttribute('inert', !active); // inactive content leaves the tab order and the accessibility tree
    });
    section.querySelectorAll<HTMLElement>('.hc-media img').forEach(img => { if (img.dataset.for) img.setAttribute('aria-hidden', String(img.dataset.for !== audience)); });
  };

  new MutationObserver(records => {
    for (const record of records) {
      const tab = record.target as HTMLButtonElement;
      if (tab.getAttribute('aria-selected') === 'true' && tab.dataset.audience && tab.dataset.audience !== current) {
        show(tab.dataset.audience);
        track('healthcare_tab_switch', { tab: tab.dataset.audience });
      }
    }
  }).observe(section, { attributes: true, attributeFilter: ['aria-selected'], subtree: true });

  // Resting tile height: a tile floats open on hover without moving anything else (desktop, see healthcare.css).
  const measure = () => {
    if (section.querySelector('.hc-tile:hover, .hc-tile:focus-visible')) return;
    section.querySelectorAll<HTMLElement>('.hc-tiles').forEach(list => {
      list.style.removeProperty('--hc-tile-h');
      const tallest = Math.max(...[...list.querySelectorAll<HTMLElement>('.hc-tile')].map(tile => tile.offsetHeight));
      if (tallest > 0) list.style.setProperty('--hc-tile-h', `${Math.ceil(tallest)}px`);
    });
  };
  measure();
  addEventListener('load', measure);
  addEventListener('resize', measure);
  document.fonts?.ready.then(measure);
  new MutationObserver(() => requestAnimationFrame(measure)).observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'dir'] });

  // Analytics for every button, link and tile in the section (no personal data).
  section.addEventListener('click', event => {
    const target = (event.target as Element).closest<HTMLElement>('[data-hc-track]');
    if (!target) return;
    const params: Record<string, string> = { tab: current, button: target.dataset.hcTrack || '' };
    if (target.dataset.hcTile) params.tile = target.dataset.hcTile;
    track('healthcare_cta_click', params);
  });
}

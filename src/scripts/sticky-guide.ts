// For Employers: the left column sticks while the form scrolls. When the column is taller than the space under the
// header, it pins by its bottom edge instead (negative top), so every part of it can still be scrolled into view.
const guide = document.querySelector<HTMLElement>('.employer-form-guide');
if (guide) {
  const update = () => {
    const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 132;
    const top = Math.min(header + 24, innerHeight - guide.offsetHeight - 24);
    guide.style.setProperty('--guide-top', `${Math.round(top)}px`);
  };
  update();
  addEventListener('resize', update);
  if ('ResizeObserver' in window) new ResizeObserver(update).observe(guide);
}

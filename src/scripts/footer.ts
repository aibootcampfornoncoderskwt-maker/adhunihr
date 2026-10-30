// Footer: office selector (switches the details in place) and back to top.
const tabs=[...document.querySelectorAll<HTMLButtonElement>('.ft-tab')];
const panels=[...document.querySelectorAll<HTMLElement>('.ft-office')];
tabs.forEach(tab=>tab.addEventListener('click',()=>{
 const slug=tab.dataset.office;
 tabs.forEach(item=>item.setAttribute('aria-pressed',String(item===tab)));
 panels.forEach(panel=>panel.classList.toggle('is-off',panel.dataset.office!==slug));
}));
document.querySelector<HTMLAnchorElement>('.ft-top-link')?.addEventListener('click',event=>{
 event.preventDefault();
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 window.scrollTo({top:0,behavior:reduce?'instant':'smooth'});
 document.body.setAttribute('tabindex','-1');
 document.body.focus({preventScroll:true});
 document.body.removeAttribute('tabindex');
});
export {};

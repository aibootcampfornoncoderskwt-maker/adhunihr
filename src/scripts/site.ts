import { translate } from './language';
const toggle=document.querySelector<HTMLButtonElement>('.menu-toggle');
const nav=document.querySelector<HTMLElement>('#primary-nav');
const closeMenu=()=>{nav?.classList.remove('is-open');toggle?.setAttribute('aria-expanded','false');toggle?.setAttribute('aria-label','Open navigation');};
toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';nav?.classList.toggle('is-open',open);toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
const dropdowns=[...document.querySelectorAll<HTMLDetailsElement>('.nav-dropdown')];
// Only page scrolling dismisses navigation; scrollable menu panels remain usable.
window.addEventListener('scroll',()=>{if(window.matchMedia('(max-width:850px)').matches)return;dropdowns.forEach(d=>{d.open=false;});},{passive:true});
dropdowns.forEach(d=>d.addEventListener('toggle',()=>{if(d.open)dropdowns.forEach(other=>{if(other!==d)other.open=false;});}));
document.addEventListener('click',e=>{if(!(e.target instanceof Node))return;dropdowns.forEach(d=>{if(!d.contains(e.target as Node))d.open=false;});if(nav?.classList.contains('is-open') && !nav.contains(e.target) && !toggle?.contains(e.target))closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const d=dropdowns.find(d=>d.open);if(d){d.open=false;d.querySelector('summary')?.focus();}if(nav?.classList.contains('is-open')){closeMenu();toggle?.focus();}}});
// Desktop menus: open on hover with a short intent delay, close after a grace period so passing the pointer never flickers them.
const desktopMenus=window.matchMedia('(min-width:851px) and (hover:hover)');
dropdowns.forEach(d=>{
  let openTimer=0,closeTimer=0;
  const summary=d.querySelector('summary');
  const links=[...d.querySelectorAll<HTMLAnchorElement>('.catalog-link, .catalog-menu-links .catalog-viewall')];
  const slides=[...d.querySelectorAll<HTMLElement>('.catalog-feature-slide')];
  const showSlide=(slug:string)=>slides.forEach(slide=>slide.classList.toggle('is-active',slide.dataset.slug===slug));
  const defaultSlide='oil-gas-energy';
  d.addEventListener('pointerenter',e=>{
    if(e.pointerType!=='mouse'||!desktopMenus.matches)return;
    clearTimeout(closeTimer);
    if(!d.open)openTimer=window.setTimeout(()=>{d.open=true;d.dataset.hover='1';},120);
  });
  d.addEventListener('pointerleave',e=>{
    if(e.pointerType!=='mouse'||!desktopMenus.matches)return;
    clearTimeout(openTimer);
    if(d.open&&!d.contains(document.activeElement as Node))closeTimer=window.setTimeout(()=>{d.open=false;},220);
  });
  // A click on a menu the pointer already opened keeps it open instead of toggling it shut.
  summary?.addEventListener('click',e=>{if(d.dataset.hover==='1'&&desktopMenus.matches){e.preventDefault();delete d.dataset.hover;}else delete d.dataset.hover;});
  d.addEventListener('toggle',()=>{if(!d.open){delete d.dataset.hover;showSlide(defaultSlide);}});
  // Keyboard: Down from the heading enters the menu; arrows move between links; leaving the menu with Tab closes it.
  summary?.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();e.stopPropagation();d.open=true;links[0]?.focus();}});
  d.addEventListener('keydown',e=>{
    if(e.key!=='ArrowDown'&&e.key!=='ArrowUp')return;
    const index=links.indexOf(document.activeElement as HTMLAnchorElement);
    if(index<0)return;
    e.preventDefault();
    if(e.key==='ArrowDown')links[(index+1)%links.length].focus();
    else if(index===0)summary?.focus();
    else links[index-1].focus();
  });
  d.addEventListener('focusout',e=>{if(desktopMenus.matches&&d.open&&e.relatedTarget instanceof Node&&!d.contains(e.relatedTarget))d.open=false;});
  if(slides.length){
    links.forEach(link=>{
      const slug=link.dataset.feature||defaultSlide;
      link.addEventListener('pointerenter',()=>showSlide(slug));
      link.addEventListener('focus',()=>showSlide(slug));
    });
    d.querySelector('.catalog-menu-links')?.addEventListener('pointerleave',()=>showSlide(defaultSlide));
  }
});
// Accessible tab groups, including arrow/Home/End navigation.
function selectTab(button:HTMLButtonElement){const group=button.closest('[role=tablist]');if(!group)return;group.querySelectorAll<HTMLButtonElement>('[role=tab]').forEach(b=>{const selected=b===button;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1;const p=document.getElementById(b.getAttribute('aria-controls')||'');if(p)p.hidden=!selected;});}
document.querySelectorAll<HTMLButtonElement>('[role=tab]').forEach(b=>{b.addEventListener('click',()=>selectTab(b));b.addEventListener('keydown',e=>{const tabs=[...b.closest('[role=tablist]')!.querySelectorAll<HTMLButtonElement>('[role=tab]')];let index=tabs.indexOf(b);if(e.key===(document.documentElement.dir==='rtl'?'ArrowLeft':'ArrowRight'))index=(index+1)%tabs.length;else if(e.key===(document.documentElement.dir==='rtl'?'ArrowRight':'ArrowLeft'))index=(index-1+tabs.length)%tabs.length;else if(e.key==='Home')index=0;else if(e.key==='End')index=tabs.length-1;else return;e.preventDefault();selectTab(tabs[index]);tabs[index].focus();});});
document.querySelectorAll('[data-candidate-link], a[href="#candidates"]').forEach(a=>a.addEventListener('click',()=>{const b=document.querySelector<HTMLButtonElement>('#candidate-tab');if(b)selectTab(b);}));
document.querySelectorAll<HTMLAnchorElement>('[data-role]').forEach(a=>a.addEventListener('click',()=>{const b=document.querySelector<HTMLButtonElement>('#candidate-tab');if(b)selectTab(b);const message=document.querySelector<HTMLTextAreaElement>('#candidate-panel textarea');if(message)message.value=document.documentElement.lang==='ar'?`أود مناقشة الفرص المتعلقة بوظيفة ${translate(a.dataset.role||'')}. خبرتي ذات الصلة: `:`I would like to discuss opportunities related to ${a.dataset.role}. My relevant experience is: `;}));
document.querySelectorAll<HTMLButtonElement>('[data-job-filter]').forEach(b=>b.addEventListener('click',()=>{const filter=b.dataset.jobFilter;let count=0;document.querySelectorAll<HTMLButtonElement>('[data-job-filter]').forEach(btn=>btn.setAttribute('aria-pressed',String(btn===b)));document.querySelectorAll<HTMLTableRowElement>('[data-job-category]').forEach(row=>{row.hidden=filter!=='All roles'&&row.dataset.jobCategory!==filter;if(!row.hidden)count++;});const label=document.querySelector('#job-count');if(label)label.textContent=`Showing ${count} role example${count===1?'':'s'}`;}));
const ribbonButton=document.querySelector<HTMLButtonElement>('.ribbon-control');ribbonButton?.addEventListener('click',()=>{const paused=document.querySelector('.country-ribbon')?.classList.toggle('paused');ribbonButton.setAttribute('aria-pressed',String(paused));ribbonButton.setAttribute('aria-label',paused?'Play country animation':'Pause country animation');ribbonButton.textContent=paused?'▶':'Ⅱ';});
import './contact-form'; // enquiry forms, file drop zone and contact-page audience cards

export {};

// Carry only selected recruitment context across the service → market → enquiry journey.
const journeyParams = new URLSearchParams(window.location.search);
const serviceParam = journeyParams.get('service') || '';
const countryParam = journeyParams.get('country') || '';
const industryParam=journeyParams.get('industry') || '';
document.querySelectorAll<HTMLAnchorElement>('[data-market-enquiry]').forEach(link => {
 const target = new URL(link.href);
 if (/^[a-z-]{1,70}$/.test(serviceParam)) target.searchParams.set('service', serviceParam);
 link.href = target.pathname + target.search + target.hash;
});
const employerForm = document.querySelector<HTMLFormElement>('form:has(input[name=type][value=employer])');
for (const [name, value] of [['service', serviceParam], ['country', countryParam], ['industry', industryParam]]) {
 const field = employerForm?.querySelector<HTMLSelectElement>(`select[name="${name}"]`);
 if (field && Array.from(field.options).some(option => option.value === value)) field.value = value;
}


const headerStack=document.querySelector<HTMLElement>('#header-stack');
if(headerStack){const syncHeaderHeight=()=>document.documentElement.style.setProperty('--header-height',`${headerStack.getBoundingClientRect().height}px`);new ResizeObserver(syncHeaderHeight).observe(headerStack);syncHeaderHeight();}

// Carry an industry brief through the dedicated sector page.
const industryField=employerForm?.querySelector<HTMLInputElement>('input[name=industry]');
if(industryField&&industryParam.length<=160)industryField.value=industryParam;


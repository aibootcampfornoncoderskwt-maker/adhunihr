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
// Accessible tab groups, including arrow/Home/End navigation.
function selectTab(button:HTMLButtonElement){const group=button.closest('[role=tablist]');if(!group)return;group.querySelectorAll<HTMLButtonElement>('[role=tab]').forEach(b=>{const selected=b===button;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1;const p=document.getElementById(b.getAttribute('aria-controls')||'');if(p)p.hidden=!selected;});}
document.querySelectorAll<HTMLButtonElement>('[role=tab]').forEach(b=>{b.addEventListener('click',()=>selectTab(b));b.addEventListener('keydown',e=>{const tabs=[...b.closest('[role=tablist]')!.querySelectorAll<HTMLButtonElement>('[role=tab]')];let index=tabs.indexOf(b);if(e.key===(document.documentElement.dir==='rtl'?'ArrowLeft':'ArrowRight'))index=(index+1)%tabs.length;else if(e.key===(document.documentElement.dir==='rtl'?'ArrowRight':'ArrowLeft'))index=(index-1+tabs.length)%tabs.length;else if(e.key==='Home')index=0;else if(e.key==='End')index=tabs.length-1;else return;e.preventDefault();selectTab(tabs[index]);tabs[index].focus();});});
document.querySelectorAll('[data-candidate-link], a[href="#candidates"]').forEach(a=>a.addEventListener('click',()=>{const b=document.querySelector<HTMLButtonElement>('#candidate-tab');if(b)selectTab(b);}));
document.querySelectorAll<HTMLAnchorElement>('[data-role]').forEach(a=>a.addEventListener('click',()=>{const b=document.querySelector<HTMLButtonElement>('#candidate-tab');if(b)selectTab(b);const message=document.querySelector<HTMLTextAreaElement>('#candidate-panel textarea');if(message)message.value=document.documentElement.lang==='ar'?`أود مناقشة الفرص المتعلقة بوظيفة ${translate(a.dataset.role||'')}. خبرتي ذات الصلة: `:`I would like to discuss opportunities related to ${a.dataset.role}. My relevant experience is: `;}));
document.querySelectorAll<HTMLButtonElement>('[data-job-filter]').forEach(b=>b.addEventListener('click',()=>{const filter=b.dataset.jobFilter;let count=0;document.querySelectorAll<HTMLButtonElement>('[data-job-filter]').forEach(btn=>btn.setAttribute('aria-pressed',String(btn===b)));document.querySelectorAll<HTMLTableRowElement>('[data-job-category]').forEach(row=>{row.hidden=filter!=='All roles'&&row.dataset.jobCategory!==filter;if(!row.hidden)count++;});const label=document.querySelector('#job-count');if(label)label.textContent=`Showing ${count} role example${count===1?'':'s'}`;}));
const ribbonButton=document.querySelector<HTMLButtonElement>('.ribbon-control');ribbonButton?.addEventListener('click',()=>{const paused=document.querySelector('.country-ribbon')?.classList.toggle('paused');ribbonButton.setAttribute('aria-pressed',String(paused));ribbonButton.setAttribute('aria-label',paused?'Play country animation':'Pause country animation');ribbonButton.textContent=paused?'▶':'Ⅱ';});
document.querySelectorAll<HTMLFormElement>('[data-contact-form]').forEach(form=>form.addEventListener('submit',async e=>{e.preventDefault();const status=form.querySelector<HTMLElement>('.form-status')!;status.className='form-status';if(form.dataset.enabled!=='true'){status.textContent='This is a website preview. No information has been sent or stored.';return;}const submit=form.querySelector<HTMLButtonElement>('[type=submit]')!;submit.disabled=true;status.textContent='Sending your enquiry…';try{const data=new FormData(form);const upload=data.get('attachment');if(upload instanceof File&&upload.size>2*1024*1024)throw new Error('Attachment must be 2 MB or smaller.');const response=await fetch('/api/contact',{method:'POST',body:data});const result=await response.json();if(!response.ok)throw new Error(result.error||'Your enquiry could not be sent. Please try again.');status.classList.add('success');status.textContent='Thank you. Your enquiry has been sent to the Adhuni team.';form.reset();}catch(err){status.classList.add('error');status.textContent=err instanceof Error?err.message:'Unable to send. Please try again.';}finally{submit.disabled=false;const widget=(window as unknown as {turnstile?:{reset:(el:Element)=>void}}).turnstile;const element=form.querySelector('.cf-turnstile');if(widget&&element)widget.reset(element);}}));

export {};

// Carry only selected recruitment context across the service → market → enquiry journey.
const journeyParams = new URLSearchParams(window.location.search);
const serviceParam = journeyParams.get('service') || '';
const countryParam = journeyParams.get('country') || '';
document.querySelectorAll<HTMLAnchorElement>('[data-market-enquiry]').forEach(link => {
 const target = new URL(link.href);
 if (/^[a-z-]{1,70}$/.test(serviceParam)) target.searchParams.set('service', serviceParam);
 link.href = target.pathname + target.search + target.hash;
});
const employerForm = document.querySelector<HTMLFormElement>('form:has(input[name=type][value=employer])');
for (const [name, value] of [['service', serviceParam], ['country', countryParam]]) {
 const field = employerForm?.querySelector<HTMLSelectElement>(`select[name="${name}"]`);
 if (field && Array.from(field.options).some(option => option.value === value)) field.value = value;
}

const waToggle=document.querySelector<HTMLButtonElement>('.whatsapp-toggle');
const waPanel=document.querySelector<HTMLElement>('.whatsapp-panel');
function closeWhatsApp(){if(waPanel)waPanel.hidden=true;waToggle?.setAttribute('aria-expanded','false');waToggle?.setAttribute('aria-label','Open WhatsApp contact');}
waToggle?.addEventListener('click',()=>{if(!waPanel)return;const opening=waPanel.hidden;waPanel.hidden=!opening;waToggle.setAttribute('aria-expanded',String(opening));waToggle.setAttribute('aria-label',opening?'Close WhatsApp contact':'Open WhatsApp contact');});
document.querySelector('.wa-close')?.addEventListener('click',()=>{closeWhatsApp();waToggle?.focus();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&waPanel&&!waPanel.hidden){closeWhatsApp();waToggle?.focus();}});
document.addEventListener('click',e=>{if(e.target instanceof Node&&!document.querySelector('.whatsapp-widget')?.contains(e.target))closeWhatsApp();});

const headerStack=document.querySelector<HTMLElement>('#header-stack');
if(headerStack){const syncHeaderHeight=()=>document.documentElement.style.setProperty('--header-height',`${headerStack.getBoundingClientRect().height}px`);new ResizeObserver(syncHeaderHeight).observe(headerStack);syncHeaderHeight();}

// Carry an industry brief through the dedicated sector page.
const industryParam=journeyParams.get('industry') || '';
const industryField=employerForm?.querySelector<HTMLInputElement>('input[name=industry]');
if(industryField&&industryParam.length<=160)industryField.value=industryParam;


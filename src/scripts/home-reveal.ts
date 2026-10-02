// Homepage scroll reveal: progressive enhancement, skipped for reduced motion.
if(document.querySelector('.hero')&&'IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
 const targets=document.querySelectorAll<HTMLElement>('#about .about-grid>*,.section-heading,.svc-row,.ind-card,.home-process li,.markets-grid>*,.cta-employer,.cta-candidate,.catalog-overview-link');
 const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');io.unobserve(entry.target);}}),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
 targets.forEach(el=>{const siblings=el.parentElement?[...el.parentElement.children]:[];el.style.setProperty('--i',String(Math.min(siblings.indexOf(el),5)));el.setAttribute('data-reveal','');io.observe(el);});
 document.documentElement.classList.add('js-reveal');
 // Approach: the gold line draws across the steps and the numbers light up in turn once the list is in view.
 const steps=document.querySelector<HTMLElement>('.appr-steps');
 if(steps){steps.classList.add('appr-anim');const seen=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){steps.classList.add('is-in');seen.disconnect();}}),{threshold:.4});seen.observe(steps);}
}

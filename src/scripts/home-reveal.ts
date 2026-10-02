// Homepage scroll reveal: progressive enhancement, skipped for reduced motion.
if(document.querySelector('.hero')&&'IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
 const targets=document.querySelectorAll<HTMLElement>('#about .about-grid>*,.section-heading,.home-service,.home-sector,.home-process li,.markets-grid>*,.home-employer,.home-candidate,.catalog-overview-link');
 const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');io.unobserve(entry.target);}}),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
 targets.forEach(el=>{const siblings=el.parentElement?[...el.parentElement.children]:[];el.style.setProperty('--i',String(Math.min(siblings.indexOf(el),5)));el.setAttribute('data-reveal','');io.observe(el);});
 document.documentElement.classList.add('js-reveal');
}

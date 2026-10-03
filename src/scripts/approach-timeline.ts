// Approach timeline: each step's gold line draws and its number lights up as the step scrolls into view.
// Progressive enhancement: without JS, or with reduced motion, the finished timeline is shown.
const list=document.querySelector<HTMLElement>('.ap-steps');
if(list&&'IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
 list.classList.add('ap-anim');
 const seen=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-in');seen.unobserve(entry.target);}}),{threshold:.35,rootMargin:'0px 0px -8% 0px'});
 list.querySelectorAll('li').forEach(item=>seen.observe(item));
}

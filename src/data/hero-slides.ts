// Homepage hero: each slideshow image has a rotating headline phrase (gold) and a small caption.
// The fixed headline line ("screened and ready to join.") and the real H1 text live in src/pages/index.astro.
export const heroSlides=[
  {file:'hero-0b-doctors',phrase:'Doctors and specialists,',caption:'Healthcare',alt:'Illustrative scene of three doctors in white coats walking and talking along a bright hospital corridor.'},
  {file:'hero-0a-nurses',phrase:'Nurses and clinical staff,',caption:'Healthcare',alt:'Illustrative scene of two nurses in navy scrubs reviewing a patient chart on a hospital ward.'},
  {file:'hero-3-healthcare',phrase:'Allied health professionals,',caption:'Healthcare',alt:'Illustrative scene of a nurse and doctor reviewing a tablet in a GCC hospital corridor.'},
  {file:'hero-1-oil-gas',phrase:'Oil and gas specialists,',caption:'Oil, gas & energy',alt:'Illustrative scene of two technicians inspecting pipelines at a GCC oil and gas facility.'},
  {file:'hero-2-construction',phrase:'Engineers and site teams,',caption:'Construction',alt:'Illustrative scene of an engineer and foreman reviewing drawings at a GCC construction site.'},
  {file:'hero-4-logistics',phrase:'Logistics and operations staff,',caption:'Logistics',alt:'Illustrative scene of a warehouse supervisor scanning a pallet in Dubai.'}
];
// Shown instead of the rotating phrases when the visitor prefers reduced motion.
export const heroStaticPhrase='Healthcare professionals,';
// The real H1 text, always present in the HTML for search engines and screen readers.
export const heroHeadingText='Healthcare professionals, screened and ready to join.';
export const heroFixedLine='screened and ready to join.';
export const captionLabels=[...new Set(heroSlides.map(slide=>slide.caption))];

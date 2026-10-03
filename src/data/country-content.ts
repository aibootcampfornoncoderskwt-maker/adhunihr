// Per-country content for the country page template (src/pages/locations/[slug].astro).
import {countryOffices} from './contact';

export interface CountryExtra {
  inName:string;           // name as used after "in" (e.g. "the UAE")
  term:string;             // localisation programme (Kuwaitization, Saudization...)
  nationals:string;        // "Kuwaiti nationals" in the nationals FAQ
  image:string;            // public/countries/<file>
  alt:string;
  industries:string[];     // three industries shown as image cards (must have a card in sector-media.ts)
  nationalsAnswer:string;  // owner must confirm; the question stays hidden while this is empty or the placeholder
}

export const countryExtras:Record<string,CountryExtra>={
 kuwait:{inName:'Kuwait',term:'Kuwaitization',nationals:'Kuwaiti nationals',image:'country-kuwait.webp',alt:'Illustrative view of the Kuwait City skyline at sunset, seen across the water.',industries:['oil-gas-energy','construction-infrastructure','healthcare'],nationalsAnswer:'[OWNER TO CONFIRM]'},
 'saudi-arabia':{inName:'Saudi Arabia',term:'Saudization',nationals:'Saudi nationals',image:'country-saudi-arabia.webp',alt:'Illustrative view of the Riyadh skyline and city lights at dusk.',industries:['construction-infrastructure','oil-gas-energy','engineering-technical'],nationalsAnswer:'[OWNER TO CONFIRM]'},
 uae:{inName:'the UAE',term:'Emiratisation',nationals:'Emirati nationals',image:'country-uae.webp',alt:'Illustrative view of the Dubai skyline with a tall tower at dusk.',industries:['banking-finance-corporate-services','logistics-supply-chain','information-technology'],nationalsAnswer:'[OWNER TO CONFIRM]'},
 qatar:{inName:'Qatar',term:'Qatarisation',nationals:'Qatari nationals',image:'country-qatar.webp',alt:'Illustrative view of the Doha skyline reflected in the water at sunset.',industries:['oil-gas-energy','construction-infrastructure','logistics-supply-chain'],nationalsAnswer:'[OWNER TO CONFIRM]'},
 oman:{inName:'Oman',term:'Omanisation',nationals:'Omani nationals',image:'country-oman.webp',alt:'Illustrative view of the Muscat coastline with white buildings and mountains at sunset.',industries:['oil-gas-energy','logistics-supply-chain','manufacturing'],nationalsAnswer:'[OWNER TO CONFIRM]'},
 bahrain:{inName:'Bahrain',term:'Bahrainisation',nationals:'Bahraini nationals',image:'country-bahrain.webp',alt:'Illustrative view of the Manama skyline and a twin-sail tower at sunset.',industries:['banking-finance-corporate-services','manufacturing','information-technology'],nationalsAnswer:'[OWNER TO CONFIRM]'}
};

const answered=(value:string)=>value.trim()!==''&&!/OWNER TO CONFIRM/i.test(value);

/** FAQ entries for a country page. Owner-dependent entries stay out until they have a real answer. */
export function countryFaqs(slug:string,name:string,industryCount:number):string[][]{
  const extra=countryExtras[slug];
  const office=countryOffices[slug];
  return [
    [`Which industries do you hire for in ${extra.inName}?`,`All ${industryCount} of our industries, from construction and oil and gas to healthcare and corporate roles.`],
    [`Can you hire for several sites in ${extra.inName}?`,'Yes. Tell us each location and the number of people needed at each.'],
    ...(answered(extra.nationalsAnswer)?[[`Do you recruit ${extra.nationals} as well as expatriates?`,extra.nationalsAnswer.trim()]]:[]),
    ...(office?[[`Do you have an office in ${extra.inName}?`,`Yes. Our ${name} office is at ${office}.`]]:[])
  ];
}

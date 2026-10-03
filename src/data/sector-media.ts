// Photos, alt text and example roles for the six featured industries (homepage cards and service pages).
export const sectorMedia:Record<string,{file:string;alt:string;roles:string[]}>={
 'engineering-technical':{file:'industry-engineering',alt:'Illustrative scene of an engineer in a hard hat and safety glasses inspecting an electrical control cabinet in an industrial plant.',roles:['Mechanical engineers','QA/QC inspectors','Electrical technicians']},
 'construction-infrastructure':{file:'industry-construction',alt:'Illustrative scene of a site supervisor directing workers laying reinforcement steel at a Gulf construction site at sunset.',roles:['Site engineers','Foremen','Skilled trades']},
 'oil-gas-energy':{file:'industry-oil-gas',alt:'Illustrative scene of an operator in coveralls and a hard hat walking along a pipe-rack walkway at a refinery at dusk.',roles:['Process operators','HSE officers','Maintenance technicians']},
 'healthcare':{file:'industry-healthcare',alt:'Illustrative scene of a laboratory technician in a white coat and hijab pipetting samples in a hospital laboratory.',roles:['Nurses','Lab technicians','Clinic administrators']},
 'logistics-supply-chain':{file:'industry-logistics',alt:'Illustrative scene of a forklift operator moving a wrapped pallet inside a warehouse.',roles:['Warehouse supervisors','Forklift operators','Procurement officers']},
 'manufacturing':{file:'industry-manufacturing',alt:'Illustrative scene of two technical staff in high-visibility vests reviewing a tablet at an industrial site.',roles:['Production supervisors','Maintenance technicians','Quality inspectors']},
 'banking-finance-corporate-services':{file:'industry-finance',alt:'Illustrative scene of a finance professional working at a desk with a data dashboard on screen, a Gulf skyline visible through the office window.',roles:['Finance managers','Accountants','Administration officers']},
 'information-technology':{file:'industry-it',alt:'Illustrative scene of an IT technician connecting network cables in a server rack.',roles:['Network engineers','IT support specialists','Systems administrators']}
};
export const featuredSectorSlugs=Object.keys(sectorMedia);
// Industries whose card, menu and hero photo differs from the catalogue image (catalog.ts). Value is the file in public/industries without extension.
export const industryPhoto:Record<string,string>=Object.fromEntries(Object.entries(sectorMedia).map(([slug,media])=>[slug,media.file]));

// Per-service content for the service page template (src/components/ServiceDetail.astro).
// A service without hero copy, "Best for", "What you get" or FAQ entries here simply shows the original catalogue text for that block.

// Answers the owner still has to supply. While a value is empty or still holds the placeholder,
// its question is left off the page and out of the FAQPage schema. Add the Arabic text to src/data/client-arabic.json too.
export const ownerAnswers:Record<string,string>={
 'permanent-recruitment-cost':'[OWNER TO CONFIRM]',
 'skilled-technical-certification-check':'[OWNER TO CONFIRM]',
 'contract-staff-employer':'[OWNER TO CONFIRM]'
};
const confirmed=(value:string|undefined)=>!!value&&value.trim()!==''&&!/OWNER TO CONFIRM/i.test(value);

export interface ServiceFaq {q:string;a?:string;ownerKey?:string;}
export interface ServiceExtra {
  hero?:{image:string;alt:string;position?:string;zoom?:number};  // each service has its own image; a leading / means a path from public/
  heroText?:string;
  bestFor?:string;
  overviewText?:string;
  deliverables?:{icon:string;title:string;text:string}[];
  faqs?:ServiceFaq[];
  industries:string[];                          // three featured industries (must have a card in sector-media.ts)
  related:string[];                             // two related services
}

export const serviceExtras:Record<string,ServiceExtra>={
 'permanent-recruitment':{
  heroText:'Long-term hires for roles that matter to your business, screened for skills and fit.',
  bestFor:'Choose permanent recruitment when you’re filling an ongoing role: a new position, a replacement, or a role that’s hard to fill.',
  overviewText:'We start with the work the person will do after joining: the responsibilities, the must-have experience and the team they’ll join. Replacing someone? Tell us what should stay the same and what should improve. New role? Tell us the reporting line and the first priorities.',
  deliverables:[
   {icon:'workflow',title:'A clear brief',text:'Agreed with you before the search starts.'},
   {icon:'check',title:'A screened shortlist',text:'Candidates checked against your criteria.'},
   {icon:'calendar',title:'Interview coordination',text:'Scheduling and feedback handled for you.'},
   {icon:'badge',title:'Offer and joining support',text:'Documentation and start date coordinated.'}
  ],
  faqs:[
   {q:'What is permanent recruitment?',a:'Permanent recruitment fills an ongoing position, not a fixed-term project. You agree the employment terms with the candidate you choose.'},
   {q:'What should a permanent hiring brief include?',a:'Responsibilities, reporting line, essential experience and qualifications, location, compensation and expected joining date. Separate the must-haves from the nice-to-haves.'},
   {q:'Does permanent recruitment include interview coordination?',a:'Yes. We source and screen candidates, shortlist them, arrange interviews, collect your feedback and follow up until the candidate joins.'},
   {q:'How is permanent recruitment different from contract staffing?',a:'Permanent hires join your company on an ongoing basis. Contract staff work for a fixed period or project.'},
   {q:'Can you replace a current employee confidentially?',a:'Yes. Mention it in your brief and we’ll keep the search confidential.'},
   {q:'What does permanent recruitment cost?',ownerKey:'permanent-recruitment-cost'}
  ],
  industries:['engineering-technical','information-technology','healthcare'],
  related:['professional-specialist-recruitment','executive-leadership-search']
 },
 'contract-project-staffing':{
  hero:{image:'/hero/hero-2-construction.webp',alt:'Illustrative scene of two site professionals in safety gear reviewing project drawings on a construction site at sunset.',position:'72% 52%',zoom:1.3},
  heroText:'The right people for each project phase, for as long as the work runs.',
  bestFor:'Choose contract and project staffing when you need people for a fixed period: a construction phase, a shutdown, a seasonal peak or a defined assignment.',
  overviewText:'A project needs more than a headcount. Tell us the work packages, how long each assignment lasts and which roles are needed first. We plan the hiring around your project milestones, so people arrive when the work needs them.',
  deliverables:[
   {icon:'workflow',title:'A project hiring plan',text:'Roles matched to your milestones and start dates.'},
   {icon:'layers',title:'Phased recruitment',text:'Priority roles first, the rest as each phase begins.'},
   {icon:'helmet',title:'Site-ready candidates',text:'Experience and credentials checked for the worksite.'},
   {icon:'badge',title:'Mobilisation support',text:'Documentation and joining dates coordinated.'}
  ],
  faqs:[
   {q:'When is project staffing suitable?',a:'Project staffing is relevant when a workforce requirement is linked to a defined assignment, temporary demand or project phase. Specify the duration and expected responsibilities in the brief.'},
   {q:'Can recruitment be organised in phases?',a:'Share the number of people needed for each role and the planned start dates. Recruitment and interviews can then be discussed around those project priorities.'},
   {q:'Who employs the contract staff?',ownerKey:'contract-staff-employer'}
  ],
  industries:['construction-infrastructure','oil-gas-energy','engineering-technical'],
  related:['skilled-technical-manpower','high-volume-recruitment']
 },
 'skilled-technical-manpower':{
  hero:{image:'/industries/industry-engineering.webp',alt:'Illustrative scene of an engineer in a hard hat and safety glasses inspecting an electrical control cabinet in an industrial plant.'},
  heroText:'Technicians, tradespeople and engineers, checked against the skills your site actually needs.',
  bestFor:'Choose this service when you need hands-on technical people: technicians, welders, fabricators, supervisors, inspectors or plant operators.',
  overviewText:'A job title doesn’t show whether someone has worked with your equipment. Tell us the discipline, tools, machinery and site conditions. If you need a trade test or practical assessment, we agree the format, who assesses, and the pass criteria with you first. List any required certifications or licences, and whether they must be valid in the destination country.',
  deliverables:[
   {icon:'workflow',title:'A technical brief',text:'Discipline, equipment and site conditions agreed upfront.'},
   {icon:'check',title:'Skills-checked shortlist',text:'Experience and certifications checked before you see anyone.'},
   {icon:'tools',title:'Trade test coordination',text:'Practical assessments arranged when you need them.'},
   {icon:'badge',title:'Mobilisation support',text:'Documentation and joining dates coordinated.'}
  ],
  faqs:[
   {q:'Which technical roles can be discussed?',a:'Technicians, tradespeople, engineers, supervisors, inspectors and operators. Tell us the discipline and equipment involved.'},
   {q:'Can an employer request a practical assessment?',a:'Yes. Tell us what you want tested. We agree the format, who assesses and the pass criteria with you before we schedule candidates.'},
   {q:'What matters most in a technical hiring brief?',a:'The equipment, site conditions and experience needed, plus any required certifications. A job title alone doesn’t tell us enough.'},
   {q:'Can you hire for multiple sites or countries at once?',a:'Yes. Tell us each location and the number of people needed at each.'},
   {q:'Do candidates’ certifications get verified?',ownerKey:'skilled-technical-certification-check'}
  ],
  industries:['engineering-technical','oil-gas-energy','manufacturing'],
  related:['contract-project-staffing','high-volume-recruitment']
 },
 'professional-specialist-recruitment':{
  hero:{image:'office.webp',alt:'Illustrative scene of business professionals walking through a modern office lobby.'},
  heroText:'Finance, HR, sales and specialist professionals, matched on real experience, not just job titles.',
  bestFor:'Choose this service when you’re hiring for office-based or specialist roles where the right experience matters more than the job title: finance, HR, sales, procurement, IT and similar functions.',
  overviewText:'Two people with the same job title can have very different experience. Tell us what the role must deliver, the systems and tools it uses, and who it works with. We then look for candidates whose experience matches the work, not just the title.',
  deliverables:[
   {icon:'workflow',title:'A role-focused brief',text:'Outputs, systems and stakeholders defined upfront.'},
   {icon:'check',title:'Experience-matched shortlist',text:'Candidates assessed against what the role delivers.'},
   {icon:'calendar',title:'Interview coordination',text:'Scheduling and feedback handled for you.'},
   {icon:'badge',title:'Offer and joining support',text:'Documentation and start date coordinated.'}
  ],
  faqs:[
   {q:'How is specialist recruitment different from general hiring?',a:'Specialist roles depend on specific knowledge, systems or domain experience. Tell us which skills are essential and how you will assess them.'},
   {q:'Which professional functions are included?',a:'HR, finance, accounting, administration, sales, procurement, IT, engineering and logistics, plus other specialist roles. Tell us what you need.'},
   {q:'Can one enquiry cover different business functions?',a:'Yes. Give us a role description, the number of people and the priority for each function.'}
  ],
  industries:['banking-finance-corporate-services','information-technology','healthcare'],
  related:['permanent-recruitment','executive-leadership-search']
 },
 'high-volume-recruitment':{
  hero:{image:'/industries/industry-logistics.webp',alt:'Illustrative scene of a forklift operator moving a wrapped pallet inside a warehouse.',position:'68% 58%',zoom:1.32},
  heroText:'Hiring 20, 50 or more people? One coordinated process, from brief to joining.',
  bestFor:'Choose high-volume recruitment when you need many people at once: a new project, a site opening, a seasonal peak or a workforce expansion.',
  overviewText:'Hiring at scale needs a plan, not just more CVs. Tell us how many people you need for each role, which positions are most urgent, and how quickly your team can interview. We then plan the search in phases, so priority roles are filled first.',
  deliverables:[
   {icon:'layers',title:'A phased hiring plan',text:'Priority roles first, then the rest in batches.'},
   {icon:'check',title:'Consistent screening',text:'The same criteria applied to every candidate.'},
   {icon:'calendar',title:'Organised interview days',text:'Interviews scheduled around your team’s time.'},
   {icon:'users',title:'Group mobilisation',text:'Documentation and joining dates coordinated together.'}
  ],
  faqs:[
   {q:'What information is needed for bulk hiring?',a:'Provide a role-by-role breakdown of vacancies, essential criteria, locations, employment terms and planned joining dates. Include the hiring team’s interview capacity.'},
   {q:'Can large requirements cover different roles?',a:'Yes. Multi-role requirements should identify the quantity and priority for each position so sourcing and selection can be organised around the full plan.'},
   {q:'How long does high-volume hiring take?',a:'It depends on the number of roles, candidate availability and how quickly decisions are made. We agree a realistic plan with you and keep you updated against it.'}
  ],
  industries:['logistics-supply-chain','construction-infrastructure','healthcare'],related:['skilled-technical-manpower','contract-project-staffing']},
 'executive-leadership-search':{
  hero:{image:'hero.webp',alt:'Illustrative scene of senior professionals meeting around a boardroom table.'},
  heroText:'Senior and leadership hires, searched carefully and handled confidentially.',
  bestFor:'Choose executive search when you’re hiring a manager, department head or senior leader, especially when the role is sensitive or hard to fill.',
  overviewText:'Leadership hiring starts with the decisions the person will make. Tell us the business priorities, who the role reports to, and what success looks like in the first year. Is the role about stabilising, growing or changing something? That shapes who we look for.',
  deliverables:[
   {icon:'workflow',title:'A leadership brief',text:'Mandate, priorities and success measures agreed upfront.'},
   {icon:'search',title:'Targeted search',text:'We approach suitable candidates directly, not just applicants.'},
   {icon:'badge',title:'Confidential handling',text:'Names and details shared only with the people you agree.'},
   {icon:'check',title:'Structured evaluation',text:'Candidates compared against the agreed criteria.'}
  ],
  faqs:[
   {q:'What should an executive search brief contain?',a:'The mandate, reporting line, authority, business priorities and the leadership experience you need. Agree who takes part in interviews and how candidates will be compared at the start.'},
   {q:'Is experience at the same job title enough?',a:'Not always. We look at the decisions candidates have actually made and the scale they’ve worked at, not just their title.'},
   {q:'How is sensitive candidate information handled?',a:'Before the search starts, we agree with you who sees candidate names and details. We share them only with the people you approve.'}
  ],
  industries:['banking-finance-corporate-services','oil-gas-energy','information-technology'],
  related:['permanent-recruitment','professional-specialist-recruitment']
 },
 'recruitment-process-support':{
  heroText:'Already recruiting in-house? We take on the stages your team doesn’t have time for.',
  bestFor:'Choose process support when you have your own hiring team but need help with specific stages: screening, interview scheduling, candidate communication or joining.',
  overviewText:'You decide which stages we handle and which stay with your team. Tell us where you need help, who makes decisions, and how you want profiles and feedback shared. We fit into your process, not the other way around.',
  deliverables:[
   {icon:'layers',title:'Flexible scope',text:'Pick only the stages you need help with.'},
   {icon:'search',title:'Screening support',text:'Applications reviewed against your criteria.'},
   {icon:'calendar',title:'Interview coordination',text:'Scheduling and candidate communication handled.'},
   {icon:'check',title:'Joining follow-up',text:'Documentation and start dates tracked to completion.'}
  ],
  faqs:[
   {q:'Can support cover only part of the recruitment process?',a:'The scope can be discussed around the stages where support is required. Identify which activities the employer will retain and which need coordination.'},
   {q:'Who makes the final hiring decision?',a:'The employer reviews candidates and makes the hiring decision. Recruitment support helps coordinate the information and activities needed for that decision.'},
   {q:'Do you handle visas and official documents?',a:'We coordinate the documentation process with you and the candidate. Official approvals are issued by the relevant authorities.'}
  ],
  industries:['engineering-technical','logistics-supply-chain','information-technology'],
  related:['permanent-recruitment','high-volume-recruitment']
 }
};

/** FAQ entries that are ready to show: owner-dependent answers stay hidden until they are filled in above. */
export function visibleFaqs(faqs:ServiceFaq[]|undefined):string[][]{
  return (faqs??[]).flatMap(faq=>{
    const answer=faq.ownerKey?ownerAnswers[faq.ownerKey]:faq.a;
    return confirmed(answer)?[[faq.q,answer!.trim()]]:[];
  });
}

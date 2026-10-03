// Per-industry content for the industry page template (src/components/IndustryDetail.astro).
// An industry without an entry here (or without a given block) shows its original catalogue text for that block.

export interface IndustryFaq {q:string;a:string;}
export interface IndustryExtra {
  hero?:{image:string;alt:string;position?:string;zoom?:number};   // a leading / means a path from public/
  heroText?:string;
  overviewText?:string;
  checks?:{icon:string;title:string;text:string}[];                // "What we check" (4 items)
  faqs?:IndustryFaq[];
  services?:string[];                                              // related service slugs, in display order
}

export const industryExtras:Record<string,IndustryExtra>={
 'construction-infrastructure':{
  hero:{image:'/industries/industry-construction.webp',alt:'Illustrative scene of a site supervisor directing workers laying reinforcement steel at a Gulf construction site at sunset.',position:'50% 42%'},
  heroText:'Site teams, engineers and skilled trades, planned around your project phases.',
  overviewText:"Construction hiring follows the programme. Tell us the project type, location and work packages, and which roles you need first. Mention working hours, accommodation or transport if they apply, and any mandatory credentials. We'll plan the hiring so people arrive when each phase starts.",
  checks:[
   {icon:'tools',title:'Trade and discipline',text:'Civil, structural, MEP or trade experience that matches the work.'},
   {icon:'building',title:'Site experience',text:'Similar projects, sites and working conditions.'},
   {icon:'badge',title:'Credentials',text:'Required licences, certifications and safety training reviewed.'},
   {icon:'calendar',title:'Mobilisation readiness',text:'Availability and documentation ready for your start dates.'}
  ],
  faqs:[
   {q:'What should a construction manpower plan include?',a:'List each role, how many people you need, the project phase, the worksite and the joining date. Add the experience and credentials you require.'},
   {q:'Which recruitment services can support this industry?',a:'The service options below can help frame the discussion. The right approach depends on the role, number of vacancies, duration and required experience. Agree the scope after sharing your hiring brief.'},
   {q:'Can you staff different project phases separately?',a:'Yes. We can hire for each phase as it starts, with priority roles filled first.'}
  ],
  services:['contract-project-staffing','skilled-technical-manpower','high-volume-recruitment']
 },
 'oil-gas-energy':{
  hero:{image:'/industries/industry-oil-gas.webp',alt:'Illustrative scene of an operator in coveralls and a hard hat walking along a pipe-rack walkway at a refinery at dusk.',position:'36% 42%',zoom:1.25},
  heroText:"Technicians, inspectors and HSE professionals for facilities where safety and experience can't be compromised.",
  overviewText:"Experience in construction, operations, maintenance or inspection is not interchangeable. Tell us the facility type, the discipline, the equipment involved and the operating conditions. List any mandatory safety training, qualifications and rotation schedule, and we'll screen against them before you see anyone.",
  checks:[
   {icon:'building',title:'Facility experience',text:'Upstream, downstream, plant or site experience that matches yours.'},
   {icon:'helmet',title:'Safety training',text:'Mandatory HSE certifications reviewed before shortlisting.'},
   {icon:'tools',title:'Technical qualifications',text:'Discipline-specific qualifications and equipment exposure.'},
   {icon:'calendar',title:'Rotation readiness',text:'Availability for your rotation pattern and work location.'}
  ],
  faqs:[
   {q:'What details matter for oil and gas recruitment?',a:'Describe the facility, project phase, discipline and equipment, plus any mandatory credentials. Add the work location, rotation or shift pattern and any employer assessments.'},
   {q:'Which recruitment services can support this industry?',a:'The service options below can help frame the discussion. The right approach depends on the role, number of vacancies, duration and required experience. Agree the scope after sharing your hiring brief.'},
   {q:'Can you hire for shutdowns and turnarounds?',a:"Yes. Tell us the dates, roles and headcount, and we'll plan the hiring around your schedule."}
  ],
  services:['skilled-technical-manpower','contract-project-staffing','permanent-recruitment']
 },
 'manufacturing':{
  heroText:'Operators, technicians and supervisors who understand your production line, not just the job title.',
  overviewText:'Experience on one production line doesn’t always transfer to another. Tell us what you produce, the machines and processes involved, and the shift pattern. For maintenance roles, say whether you need mechanical, electrical or automation skills. For supervisors, tell us the team size.',
  checks:[
   {icon:'factory',title:'Process experience',text:'Similar products, machines and production methods.'},
   {icon:'maintenance',title:'Technical skills',text:'Mechanical, electrical or automation skills matched to the role.'},
   {icon:'helmet',title:'Quality and safety',text:'Experience with quality checks and safe working practices.'},
   {icon:'calendar',title:'Shift readiness',text:'Availability for your shift pattern and location.'}
  ],
  faqs:[
   {q:'How do we brief a manufacturing recruitment requirement?',a:'Tell us what you produce, the machines and shifts, and what each role does. Add the operating experience, quality expectations and any training or assessment you need.'},
   {q:'Which recruitment services can support this industry?',a:'The service options below can help frame the discussion. The right approach depends on the role, number of vacancies, duration and required experience. Agree the scope after sharing your hiring brief.'},
   {q:'Can you hire for a new production line or plant?',a:'Yes. Tell us the start date and roles, and we’ll plan the hiring in phases.'}
  ],
  services:['skilled-technical-manpower','high-volume-recruitment','permanent-recruitment']
 }
};

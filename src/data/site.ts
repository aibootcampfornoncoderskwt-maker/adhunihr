export const brand = { name: 'Adhuni HR Solutions', short: 'ADHUNI', tagline: 'The right people. For the work ahead.' };
export {services,industries} from './catalog';
export const countries = [
 {slug:'kuwait',name:'Kuwait',code:'KW',label:'Hiring for your Kuwait operations',text:'Tell us where your team will work, which skills are essential and when you need people to join. We will use that brief to shape the recruitment discussion.'},
 {slug:'saudi-arabia',name:'Saudi Arabia',code:'SA',label:'Build around your Saudi requirement',text:'For project and operational hiring, start with the work location, role mix and planned mobilisation. Agree the scope and employer responsibilities before selection.'},
 {slug:'uae',name:'UAE',code:'AE',label:'Recruit for your UAE business',text:'Share the emirate, role responsibilities and experience your team needs. A clear brief helps keep candidate evaluation relevant to the working environment.'},
 {slug:'qatar',name:'Qatar',code:'QA',label:'Plan your next Qatar appointment',text:'Bring the technical requirements, employer expectations and joining timetable into one brief, whether you are discussing a specialist role or a wider project team.'},
 {slug:'oman',name:'Oman',code:'OM',label:'Start with the work in Oman',text:'Outline the role, work location and proposed employment terms so recruitment discussions begin with a shared understanding of the requirement.'},
 {slug:'bahrain',name:'Bahrain',code:'BH',label:'Find the right fit for Bahrain',text:'From operational teams to specialist functions, define the experience and responsibilities that matter to your business before building a selection plan.'}
];
export const pipelines = [
 {id:'technical',label:'Technical & industrial',title:'Oil & Gas — engineers & inspectors',image:'industrial.webp',text:'A technical brief needs technical detail. Define the discipline, project exposure and role-specific qualifications before reviewing candidates.',tags:['Mechanical & electrical','QA/QC & inspection','HSE & site support','Maintenance teams']},
 {id:'service',label:'Service & operations',title:'People who keep operations moving',image:'hospitality.webp',text:'Build your requirement around service standards, shift patterns and practical responsibilities. Evaluate candidates against the work they will actually do.',tags:['Hospitality & retail','Front-office support','Warehouse operations','Team supervisors']},
 {id:'corporate',label:'Corporate & specialist',title:'Experience for the business behind the work',image:'office.webp',text:'Recruit for the functions that connect your organisation. Start with the systems, responsibilities and judgement needed in each role.',tags:['Finance & accounts','Human resources','IT & technology','Administration']}
];
export const faqs = [
 ['Which countries does Adhuni focus on?','Our recruitment focus connects India with employers in Kuwait, Saudi Arabia, the UAE, Qatar, Oman and Bahrain. Contact us to discuss the scope of your specific requirement.'],
 ['What should I include in a hiring brief?','Share the job title, responsibilities, essential experience, work location, number of positions, proposed compensation and expected joining date. Include any role-specific qualifications or project requirements.'],
 ['Can we discuss several positions at once?','Yes. List the roles, quantities and priorities in your enquiry. This makes it possible to discuss the requirement as a coordinated hiring plan.'],
 ['How long does recruitment take?','Timing depends on the role, candidate availability, interview decisions and any destination-specific requirements. A timetable should be agreed after reviewing the actual brief; there is no fixed lead-time promise.'],
 ['Can candidates register their interest?','Candidates can use the candidate enquiry form to share their experience and preferred role. An enquiry is not a job offer or a guarantee of placement.'],
 ['Who handles immigration and employment documentation?','Responsibilities must be agreed with the employer and relevant authorised providers for each engagement. Recruitment discussions do not replace official immigration or employment guidance.']
];
// Illustrative roles retained to reproduce the reference table. Never publish as live vacancies.
export const sampleJobs = [
 ['Mechanical Engineer','Kuwait','Engineering'],['QA/QC Inspector','Saudi Arabia','Engineering'],['Electrical Technician','Qatar','Technical'],['Warehouse Coordinator','UAE','Operations'],['Front-office Associate','Bahrain','Service'],['Accountant','Oman','Corporate'],['HSE Officer','Saudi Arabia','Technical'],['HR Coordinator','Kuwait','Corporate']
];

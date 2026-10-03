// Copy for /our-approach/. Steps mirror the homepage approach section (src/pages/index.astro).
export const approachSteps=[
 {title:'Brief',we:'Learn the role, skills, location and start date.',you:'Share the requirement and who makes the final decision.'},
 {title:'Search',we:'Look for candidates who match your brief.',you:'Answer any questions about the role.'},
 {title:'Screen',we:'Check experience, skills and documents first.',you:'Review the shortlist we send you.'},
 {title:'Interview',we:'Arrange interviews and collect feedback.',you:'Interview candidates and tell us your decision.'},
 {title:'Join',we:'Coordinate offers, documentation and joining dates.',you:'Confirm the offer and start date.'}
];
// The owner must supply the real answer to the candidate-fees question. While it still holds the placeholder,
// the question is left out of the page and out of the FAQPage schema. Add the Arabic text to src/data/client-arabic.json too.
export const candidateFeesAnswer='[OWNER TO CONFIRM]';
const feesConfirmed=candidateFeesAnswer.trim()!==''&&!/OWNER TO CONFIRM/i.test(candidateFeesAnswer);
const allQuestions:[string,string,boolean][]=[
 ['How does the recruitment process begin?','Start by sharing the role, number of vacancies, location, required experience, compensation and expected joining date. The team reviews the requirement and clarifies the criteria before sourcing.',true],
 ['Who decides which candidate is selected?','You do. We shortlist and coordinate; the final decision is always yours.',true],
 ['Is the same process used for every requirement?','The 5 steps stay the same, but we adapt the search to the role, the number of vacancies and the country.',true],
 ['Which countries do you recruit for?','Kuwait, Saudi Arabia, UAE, Qatar, Bahrain and Oman.',true],
 ['How long does recruitment take?','It depends on the role and the number of vacancies. We agree a timeline with you after the brief.',true],
 ['Do candidates pay any fees?',candidateFeesAnswer,feesConfirmed]
];
export const approachQuestions:string[][]=allQuestions.filter(q=>q[2]).map(([q,a])=>[q,a]);
export const requestCandidatesHref='/employers/#request-form';

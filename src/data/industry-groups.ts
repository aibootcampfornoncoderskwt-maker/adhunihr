// The three industry groups used by the Industries menu and the Services page. Any industry not named here is appended to the last group so no link is dropped.
export const industryGroups=[
  {heading:'Our focus',slugs:['healthcare','oil-gas-energy']},
  {heading:'Energy & Industrial',slugs:['engineering-technical','construction-infrastructure','manufacturing']},
  {heading:'Operations & Services',slugs:['logistics-supply-chain','facilities-management','hospitality','retail-ecommerce']},
  {heading:'Professional & Care',slugs:['information-technology','banking-finance-corporate-services','education-professional-services']}
];
export function groupIndustries<T extends {slug:string}>(industries:T[]){
  const grouped=new Set(industryGroups.flatMap(g=>g.slugs));
  const ungrouped=industries.filter(i=>!grouped.has(i.slug)).map(i=>i.slug);
  return industryGroups.map((g,n)=>({heading:g.heading,items:[...g.slugs,...(n===industryGroups.length-1?ungrouped:[])].map(slug=>industries.find(i=>i.slug===slug)!).filter(Boolean)}));
}

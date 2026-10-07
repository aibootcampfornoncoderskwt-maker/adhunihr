// Homepage "Healthcare recruitment" section: one tab for employers, one for healthcare professionals. Client-approved wording.

// Four role tiles, shared by both tabs. `more` is the extra line of specialties shown on hover (always shown on touch screens).
export const healthcareTiles=[
  {key:'Nursing',icon:'ecg',title:'Nursing',text:'ICU, ER, OT, ward and specialty nurses',more:'ICU · ER · OT · Ward · Paediatrics'},
  {key:'Physicians',icon:'stethoscope',title:'Physicians',text:'GPs, specialists and consultants',more:'General practice · Internal medicine · Surgery'},
  {key:'Allied health',icon:'microscope',title:'Allied health',text:'Lab, radiology, pharmacy and physiotherapy',more:'Lab · Radiology · Pharmacy · Physiotherapy'},
  {key:'Support & admin',icon:'clipboard',title:'Support & admin',text:'Medical records, reception and patient services',more:'Records · Reception · Patient services'}
];

// ---- Tab 1: for hospitals and clinics
export const healthcareBadges=['Licence & registration','Clinical specialty','Qualifications','Language & availability'];
export const healthcareFacilities=['Hospitals','Clinics','Medical centres','Diagnostic labs','Pharmacies'];

// ---- Tab 2: for healthcare professionals
export const professionalHelp=['Roles matched to your specialty','Interview coordination','Offer and joining support'];
// Licensing guidance for candidates (for example help with a local health authority licence). Hidden until the owner confirms the service.
// Set to true to show "Licensing guidance" in the strip, then rebuild.  [OWNER TO CONFIRM]
export const showLicensingGuidance=false;

// Licensing support for employers (shown in the strip of tab 1). Hidden until the owner confirms the service.
// Write the line to show, then rebuild. Leave empty to keep it off the site.  [OWNER TO CONFIRM]
export const licensingSupport='';

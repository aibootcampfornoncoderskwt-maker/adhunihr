// Programmatic market pages: /industries/<industry>/<country>/ for the two focus industries across the six markets.
// Every page combines country-specific facts with industry-specific guidance. Each string has an English and an Arabic form;
// scripts/generate-arabic.mjs pairs them automatically. Do not add statistics, vacancy counts, salaries or client names here.
// Regulators are named so employers know what to confirm; the pages always say requirements must be checked with the authority.
export const marketIndustries = ['healthcare', 'oil-gas-energy'];

const countries = {
  kuwait: { en: 'Kuwait', ar: 'الكويت',
    health: { en: 'In Kuwait, healthcare practitioners are licensed through the Ministry of Health. Licensing steps differ for government and private facilities, so the employer should confirm the route that applies to the vacancy before a candidate is shortlisted.', ar: 'في الكويت، تُرخَّص الكوادر الصحية عبر وزارة الصحة. وتختلف خطوات الترخيص بين المنشآت الحكومية والخاصة، لذا ينبغي لصاحب العمل تأكيد المسار المطبّق على الوظيفة قبل ترشيح أي مرشح.' },
    regulator: { en: 'Kuwait Ministry of Health', ar: 'وزارة الصحة الكويتية' },
    energy: { en: 'Oil is central to Kuwait\'s economy, and energy hiring there is often tied to operating assets, maintenance programmes and project phases. Define whether the role supports steady operations or a time-bound project.', ar: 'يشكّل النفط ركيزة في اقتصاد الكويت، وغالبًا ما يرتبط التوظيف في قطاع الطاقة بالأصول التشغيلية وبرامج الصيانة ومراحل المشاريع. حدّد هل تدعم الوظيفة تشغيلًا مستمرًا أم مشروعًا محدد المدة.' } },
  'saudi-arabia': { en: 'Saudi Arabia', ar: 'المملكة العربية السعودية',
    health: { en: 'In Saudi Arabia, health practitioners are classified and registered through the Saudi Commission for Health Specialties (SCFHS). Professional classification affects which roles a candidate can fill, so it should be confirmed early.', ar: 'في المملكة العربية السعودية، يُصنَّف الممارسون الصحيون ويُسجَّلون عبر الهيئة السعودية للتخصصات الصحية. ويؤثر التصنيف المهني في الوظائف التي يمكن للمرشح شغلها، لذا ينبغي تأكيده مبكرًا.' },
    regulator: { en: 'Saudi Commission for Health Specialties (SCFHS)', ar: 'الهيئة السعودية للتخصصات الصحية' },
    energy: { en: 'Saudi Arabia has a large and varied energy sector, from upstream and downstream operations to major construction and maintenance work. Briefs work best when they name the facility type, discipline and shift pattern.', ar: 'يضم قطاع الطاقة في المملكة أنشطة واسعة ومتنوعة، من العمليات في المنبع والمصب إلى أعمال الإنشاء والصيانة الكبرى. وتكون الطلبات أنجح حين تحدد نوع المنشأة والتخصص ونظام المناوبات.' } },
  uae: { en: 'UAE', ar: 'الإمارات',
    health: { en: 'In the UAE, licensing depends on the emirate: the Dubai Health Authority (DHA) in Dubai, the Department of Health in Abu Dhabi, and the Ministry of Health and Prevention (MOHAP) for the northern emirates. State which emirate and facility the role is in.', ar: 'في الإمارات يختلف الترخيص بحسب الإمارة: هيئة الصحة بدبي في دبي، ودائرة الصحة في أبوظبي، ووزارة الصحة ووقاية المجتمع للإمارات الشمالية. حدّد الإمارة والمنشأة التي تتبع لها الوظيفة.' },
    regulator: { en: 'DHA, Department of Health Abu Dhabi and MOHAP', ar: 'هيئة الصحة بدبي ودائرة الصحة في أبوظبي ووزارة الصحة ووقاية المجتمع' },
    energy: { en: 'The UAE\'s energy work spans onshore and offshore operations as well as supporting engineering and services. Say which emirate and site type the role serves, and whether offshore rotation is involved.', ar: 'يشمل العمل في قطاع الطاقة بالإمارات العمليات البرية والبحرية والخدمات الهندسية المساندة. وضّح الإمارة ونوع الموقع، وهل تتضمن الوظيفة مناوبات بحرية.' } },
  qatar: { en: 'Qatar', ar: 'قطر',
    health: { en: 'In Qatar, healthcare practitioners are licensed through the Ministry of Public Health, with registration handled by the Qatar Council for Healthcare Practitioners (QCHP). Licensing normally has to be in place before a practitioner starts work.', ar: 'في قطر، تُرخَّص الكوادر الصحية عبر وزارة الصحة العامة، ويتولى مجلس قطر للممارسين الصحيين التسجيل. وعادةً يجب إتمام الترخيص قبل مباشرة الممارس العمل.' },
    regulator: { en: 'Ministry of Public Health and QCHP', ar: 'وزارة الصحة العامة ومجلس قطر للممارسين الصحيين' },
    energy: { en: 'Energy and gas operations are a major part of Qatar\'s economy. Briefs should say whether the role belongs to production, maintenance, inspection or project delivery, and the safety training the employer expects.', ar: 'تُعد عمليات الطاقة والغاز جزءًا رئيسيًا من اقتصاد قطر. وينبغي أن يوضح الطلب هل الوظيفة في الإنتاج أم الصيانة أم التفتيش أم تنفيذ المشاريع، وما التدريب على السلامة الذي يتوقعه صاحب العمل.' } },
  bahrain: { en: 'Bahrain', ar: 'البحرين',
    health: { en: 'In Bahrain, health professionals are licensed by the National Health Regulatory Authority (NHRA). Confirm the licence category that applies to the role and facility before shortlisting.', ar: 'في البحرين، تُرخَّص المهن الصحية عبر الهيئة الوطنية لتنظيم المهن والخدمات الصحية. أكّد فئة الترخيص المطبّقة على الوظيفة والمنشأة قبل الترشيح.' },
    regulator: { en: 'National Health Regulatory Authority (NHRA)', ar: 'الهيئة الوطنية لتنظيم المهن والخدمات الصحية' },
    energy: { en: 'Bahrain\'s energy and industrial sector is compact, so roles are often broad. State the main responsibility, the plant or facility, and which skills are essential rather than helpful extras.', ar: 'قطاع الطاقة والصناعة في البحرين محدود الحجم، لذا تكون الوظائف غالبًا واسعة النطاق. اذكر المسؤولية الرئيسية والمنشأة، وميّز المهارات الأساسية عن الإضافات المفيدة.' } },
  oman: { en: 'Oman', ar: 'عُمان',
    health: { en: 'In Oman, health practitioners are registered through the Ministry of Health. Confirm the registration requirement for the grade and specialty before a candidate is put forward.', ar: 'في عُمان، يُسجَّل الممارسون الصحيون عبر وزارة الصحة. أكّد متطلبات التسجيل للدرجة والتخصص قبل ترشيح أي مرشح.' },
    regulator: { en: 'Oman Ministry of Health', ar: 'وزارة الصحة العُمانية' },
    energy: { en: 'Oman\'s energy work includes remote and field locations, so location, accommodation and rotation patterns matter as much as the technical skills. Put these in the brief from the start.', ar: 'يشمل العمل في قطاع الطاقة بعُمان مواقع نائية وميدانية، لذا يهم الموقع والسكن ونظام المناوبات بقدر المهارات الفنية. اذكرها في الطلب من البداية.' } }
};

const industries = {
  healthcare: { enTitle: 'Healthcare', arTitle: 'الرعاية الصحية', enNoun: 'healthcare recruitment', arNoun: 'التوظيف في الرعاية الصحية',
    roles: { en: ['Registered nurses (ward, ICU, emergency, theatre)', 'Doctors and specialists by department', 'Allied health: laboratory, radiology, pharmacy, physiotherapy', 'Nursing and clinical supervisors'], ar: ['ممرضون مسجلون (الأجنحة، العناية المركزة، الطوارئ، العمليات)', 'أطباء وأخصائيون بحسب القسم', 'كوادر صحية مساندة: المختبر والأشعة والصيدلة والعلاج الطبيعي', 'مشرفون تمريضيون وسريريون'] },
    brief: { en: ['Department, specialty and patient group', 'Licence or registration the employer requires', 'Years of relevant experience and any specialist training', 'Shift pattern, number of positions and joining date'], ar: ['القسم والتخصص وفئة المرضى', 'الترخيص أو التسجيل الذي يطلبه صاحب العمل', 'سنوات الخبرة ذات الصلة وأي تدريب متخصص', 'نظام المناوبات وعدد الوظائف وتاريخ المباشرة'] } },
  'oil-gas-energy': { enTitle: 'Oil, gas and energy', arTitle: 'النفط والغاز والطاقة', enNoun: 'oil, gas and energy recruitment', arNoun: 'التوظيف في النفط والغاز والطاقة',
    roles: { en: ['Process, mechanical, electrical and instrumentation technicians', 'Inspectors and quality professionals', 'HSE officers and safety supervisors', 'Maintenance planners, operators and site supervisors'], ar: ['فنيو العمليات والميكانيك والكهرباء والتحكم', 'مفتشون ومتخصصو الجودة', 'مسؤولو السلامة والصحة والبيئة ومشرفو السلامة', 'مخططو الصيانة والمشغّلون ومشرفو المواقع'] },
    brief: { en: ['Discipline, facility type and onshore or offshore setting', 'Certificates the employer asks for, such as H2S, BOSIET or HSE qualifications', 'Inspection or trade certification and years of experience', 'Rotation pattern, number of positions and mobilisation date'], ar: ['التخصص ونوع المنشأة وهل العمل بري أم بحري', 'الشهادات التي يطلبها صاحب العمل، مثل H2S وBOSIET ومؤهلات السلامة', 'شهادة التفتيش أو الحرفة وسنوات الخبرة', 'نظام المناوبات وعدد الوظائف وتاريخ المباشرة'] } }
};

export const marketKey = (industry, country) => `${industry}/${country}`;
export const marketPaths = () => marketIndustries.flatMap(industry => Object.keys(countries).map(country => ({ industry, country })));

// Returns the page content as { en, ar } with identical structure, so the Arabic generator can pair strings one to one.
export function marketPage(industry, country) {
  const c = countries[country], i = industries[industry];
  const isHealth = industry === 'healthcare';
  const local = isHealth ? c.health : c.energy;
  const part = (en, ar) => ({ en, ar });
  const make = lang => {
    const L = lang;
    const name = c[L], noun = i[L === 'en' ? 'enNoun' : 'arNoun'], title = i[L === 'en' ? 'enTitle' : 'arTitle'];
    const t = {
      title: L === 'en' ? `${title} recruitment in ${name}` : `${noun} في ${name}`,
      seoTitle: L === 'en' ? `${title} Recruitment in ${name} | Adhuni HR Solutions` : `${noun} في ${name} | أدهوني لحلول الموارد البشرية`,
      description: L === 'en'
        ? `${isHealth ? 'Recruit nurses, doctors and allied health staff' : 'Recruit technicians, inspectors and HSE staff'} for employers in ${name}. Licensing, roles and what to put in your brief.`
        : `${isHealth ? 'وظّف الممرضين والأطباء والكوادر الصحية المساندة' : 'وظّف الفنيين والمفتشين وكوادر السلامة'} لأصحاب العمل في ${name}. الترخيص والوظائف وما يجب ذكره في طلبك.`,
      eyebrow: L === 'en' ? `${title.toUpperCase()} · ${name.toUpperCase()}` : `${title} · ${name}`,
      intro: L === 'en' ? `Adhuni HR Solutions recruits for ${isHealth ? 'hospitals, clinics and care providers' : 'oil, gas and energy employers'} in ${name}. Share the roles, location and start date and we plan the search around them.` : `تتولى أدهوني لحلول الموارد البشرية التوظيف لـ${isHealth ? 'المستشفيات والعيادات ومقدمي الرعاية' : 'أصحاب العمل في النفط والغاز والطاقة'} في ${name}. شاركنا الوظائف والموقع وتاريخ البدء، ونخطط البحث على أساسها.`,
      cta: L === 'en' ? 'Request candidates' : 'اطلب مرشحين',
      localHeading: (isHealth ? (L === 'en' ? `Licensing in ${name}` : `الترخيص في ${name}`) : (L === 'en' ? `Hiring context in ${name}` : `سياق التوظيف في ${name}`)) + '.',
      local: local[L],
      verify: isHealth
        ? (L === 'en' ? `Rules change. Always confirm current requirements with ${c.regulator.en} and the employer before a candidate is shortlisted.` : `قد تتغير الأنظمة. أكّد دائمًا المتطلبات الحالية مع ${c.regulator.ar} ومع صاحب العمل قبل ترشيح أي مرشح.`)
        : (L === 'en' ? 'Requirements change by site and employer. Confirm certificates and safety training with the employer before a candidate is shortlisted.' : 'تختلف المتطلبات بحسب الموقع وصاحب العمل. أكّد الشهادات والتدريب على السلامة مع صاحب العمل قبل ترشيح أي مرشح.'),
      rolesHeading: L === 'en' ? 'Roles we recruit' : 'الوظائف التي نوظّف لها',
      rolesNote: L === 'en' ? 'These are examples of roles employers hire, not live vacancies.' : 'هذه أمثلة على وظائف يوظّف لها أصحاب العمل وليست شواغر معلنة.',
      roles: i.roles[L],
      briefHeading: L === 'en' ? `What to include in your ${name} brief.` : `ما الذي تذكره في طلبك لـ${name}.`,
      brief: [...i.brief[L], L === 'en' ? `Work location in ${name}, and who sponsors the employment visa` : `موقع العمل في ${name}، والجهة الكافلة لتأشيرة العمل`],
      faqHeading: L === 'en' ? 'Common questions.' : 'أسئلة شائعة.',
      faq: [
        [L === 'en' ? `Do you recruit ${isHealth ? 'healthcare staff' : 'oil, gas and energy staff'} for ${name}?` : `هل توظّفون ${isHealth ? 'كوادر الرعاية الصحية' : 'كوادر النفط والغاز والطاقة'} لـ${name}؟`,
         L === 'en' ? `Yes. Adhuni recruits for employers in ${name}, connecting them with candidates from India. Send the roles, location and joining date and we will discuss how to run the search.` : `نعم. توظّف أدهوني لأصحاب العمل في ${name} وتربطهم بمرشحين من الهند. أرسل الوظائف والموقع وتاريخ المباشرة ونناقش كيفية إجراء البحث.`],
        [L === 'en' ? 'What should the brief say?' : 'ماذا ينبغي أن يتضمن الطلب؟',
         L === 'en' ? `${i.brief.en[0]}; ${i.brief.en[1].charAt(0).toLowerCase()}${i.brief.en[1].slice(1)}; and the number of positions and joining date.` : `${i.brief.ar[0]}؛ ${i.brief.ar[1]}؛ وعدد الوظائف وتاريخ المباشرة.`],
        [L === 'en' ? 'Does an enquiry guarantee a job or placement?' : 'هل يضمن الاستفسار وظيفة أو تعيينًا؟',
         L === 'en' ? 'No. An enquiry starts a conversation. It is not a job offer or a guarantee of placement.' : 'لا. الاستفسار يبدأ حوارًا، وهو ليس عرض عمل ولا ضمانًا للتعيين.']
      ],
      otherCountries: L === 'en' ? `${title} recruitment in other markets` : `${noun} في أسواق أخرى`,
      otherIndustry: L === 'en' ? `Also recruiting in ${name}` : `نوظّف أيضًا في ${name}`,
      h1: (L === 'en' ? `${title} recruitment in ${name}` : `${noun} في ${name}`) + (L === 'en' ? '.' : '.'),
      countryLabel: L === 'en' ? name.toUpperCase() : name,
      briefEyebrow: L === 'en' ? 'YOUR BRIEF' : 'طلبك',
      relatedPages: L === 'en' ? 'Related pages' : 'صفحات ذات صلة',
      relatedIndustry: L === 'en' ? 'Related industry' : 'قطاع ذو صلة',
      faqEyebrow: L === 'en' ? 'QUESTIONS & ANSWERS' : 'أسئلة وأجوبة',
      breadcrumbIndustry: title, breadcrumbCountry: name
    };
    return t;
  };
  return { en: make('en'), ar: make('ar'), countryName: c.en, industryTitle: i.enTitle };
}
export const marketCountries = Object.entries(countries).map(([slug, v]) => ({ slug, en: v.en, ar: v.ar }));
export const marketIndustryTitles = Object.fromEntries(Object.entries(industries).map(([slug, v]) => [slug, { en: v.enTitle, ar: v.arTitle }]));

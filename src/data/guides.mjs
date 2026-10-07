// Practical hiring guides. Each opens with a direct answer (good for search snippets and AI answers) and then gives steps.
// Rules: general guidance only, no statistics, no claims about Adhuni's results, no legal advice. Every guide tells readers to confirm rules with the authority or employer.
// English and Arabic share one structure so scripts/generate-arabic.mjs can pair the strings.
// Section shape: { h: heading, p: [paragraphs], list: [bullet items] }
export const guideSlugs = ['hiring-brief-gcc', 'healthcare-licensing-gcc', 'recruitment-process-brief-to-joining', 'questions-to-ask-a-recruitment-agency'];

const G = {
  'hiring-brief-gcc': {
    en: {
      title: 'How to write a hiring brief for a GCC role',
      seoTitle: 'How to Write a Hiring Brief for a GCC Role | Adhuni HR Solutions',
      description: 'A clear hiring brief saves weeks. Here is what to include: role, location, experience, certificates, terms, numbers and joining date.',
      answer: 'A good hiring brief names the role and its responsibilities, the work location, the experience and certificates that are essential, the proposed terms, the number of positions and the joining date. The clearer these seven points are, the faster a recruiter can search and screen.',
      sections: [
        { h: 'The seven points to cover', list: ['Job title and the real responsibilities, not only the title', 'Work location and conditions, including rotation or shift pattern', 'Essential experience, separated from nice-to-have skills', 'Licences, certificates or trade tests the employer requires', 'Proposed salary, benefits and contract length', 'Number of positions and priority order if there are several roles', 'Joining date and who sponsors the work visa'] },
        { h: 'Separate essentials from extras', p: ['Candidates are screened against what you mark as essential. If every skill is essential, few people fit and the search slows down. Keep the essential list short and put the rest under preferred.'] },
        { h: 'Say how decisions are made', p: ['Tell the recruiter who interviews, how many rounds there are and how quickly you can respond. Delays on the employer side are one of the most common reasons a search stalls.'] },
        { h: 'Use the brief builder', p: ['The Hiring brief builder on this site walks through these points in four steps and produces a PDF you can send.'] }
      ]
    },
    ar: {
      title: 'كيف تكتب طلب توظيف واضحًا لوظيفة في الخليج',
      seoTitle: 'كيف تكتب طلب توظيف لوظيفة في الخليج | أدهوني لحلول الموارد البشرية',
      description: 'الطلب الواضح يوفّر أسابيع. إليك ما يجب ذكره: الوظيفة والموقع والخبرة والشهادات والشروط والأعداد وتاريخ المباشرة.',
      answer: 'يحدد طلب التوظيف الجيد الوظيفة ومسؤولياتها وموقع العمل والخبرة والشهادات الأساسية والشروط المقترحة وعدد الوظائف وتاريخ المباشرة. وكلما كانت هذه النقاط السبع أوضح، أسرع الباحث في البحث والفرز.',
      sections: [
        { h: 'النقاط السبع التي ينبغي تغطيتها', list: ['المسمى الوظيفي والمسؤوليات الفعلية، لا المسمى وحده', 'موقع العمل وظروفه، ومنها نظام المناوبات أو التناوب', 'الخبرة الأساسية منفصلة عن المهارات المرغوبة', 'التراخيص أو الشهادات أو اختبارات الحرفة التي يطلبها صاحب العمل', 'الراتب والمزايا ومدة العقد المقترحة', 'عدد الوظائف وترتيب الأولوية إذا تعددت الوظائف', 'تاريخ المباشرة والجهة الكافلة لتأشيرة العمل'] },
        { h: 'افصل الأساسي عن الإضافي', p: ['يُفرز المرشحون وفق ما تحدده أساسيًا. فإذا كانت كل المهارات أساسية، قلّ عدد المناسبين وتباطأ البحث. اجعل قائمة الأساسيات قصيرة وضع الباقي ضمن المرغوب.'] },
        { h: 'وضّح كيف تُتخذ القرارات', p: ['أخبر الباحث من يجري المقابلات وكم جولة ستكون وما سرعة ردّك. وتأخر صاحب العمل من أكثر أسباب تعثر البحث شيوعًا.'] },
        { h: 'استخدم أداة إعداد الطلب', p: ['تستعرض أداة إعداد طلب التوظيف في هذا الموقع هذه النقاط في أربع خطوات وتنتج ملف PDF يمكنك إرساله.'] }
      ]
    }
  },
  'healthcare-licensing-gcc': {
    en: {
      title: 'Healthcare licensing in the GCC: who regulates what',
      seoTitle: 'Healthcare Licensing in the GCC: Who Regulates What | Adhuni',
      description: 'Which authority licenses nurses and doctors in Kuwait, Saudi Arabia, the UAE, Qatar, Bahrain and Oman, and what to confirm before hiring.',
      answer: 'Each GCC country licenses healthcare practitioners through its own authority, and in the UAE it depends on the emirate. Employers should confirm the licence route for the exact role and facility before a candidate is shortlisted, because requirements change.',
      sections: [
        { h: 'Authorities by country', list: ['Kuwait: Ministry of Health', 'Saudi Arabia: Saudi Commission for Health Specialties (SCFHS)', 'UAE: Dubai Health Authority (Dubai), Department of Health (Abu Dhabi), Ministry of Health and Prevention (northern emirates)', 'Qatar: Ministry of Public Health, with registration through the Qatar Council for Healthcare Practitioners (QCHP)', 'Bahrain: National Health Regulatory Authority (NHRA)', 'Oman: Ministry of Health'] },
        { h: 'What to confirm before shortlisting', list: ['The licence or registration category for the role and grade', 'Whether the employer or the candidate starts the application', 'Any exam, verification of credentials or experience evidence the authority asks for', 'Whether the licence must be in place before the candidate can start work'] },
        { h: 'Why this matters for hiring plans', p: ['Licensing time varies and sits outside the recruiter\'s control. Build it into the joining date rather than treating it as a last step.', 'This page is general guidance, not legal advice. Check current rules with the authority and the employer.'] }
      ]
    },
    ar: {
      title: 'ترخيص المهن الصحية في الخليج: من يُنظّم ماذا',
      seoTitle: 'ترخيص المهن الصحية في الخليج: من ينظّم ماذا | أدهوني',
      description: 'أي جهة ترخّص الممرضين والأطباء في الكويت والسعودية والإمارات وقطر والبحرين وعُمان، وما الذي ينبغي تأكيده قبل التوظيف.',
      answer: 'ترخّص كل دولة خليجية الكوادر الصحية عبر جهتها الخاصة، وفي الإمارات يتوقف ذلك على الإمارة. وينبغي لأصحاب العمل تأكيد مسار الترخيص للوظيفة والمنشأة بدقة قبل ترشيح أي مرشح، لأن المتطلبات تتغير.',
      sections: [
        { h: 'الجهات المرخِّصة حسب الدولة', list: ['الكويت: وزارة الصحة', 'السعودية: الهيئة السعودية للتخصصات الصحية', 'الإمارات: هيئة الصحة بدبي (دبي)، ودائرة الصحة (أبوظبي)، ووزارة الصحة ووقاية المجتمع (الإمارات الشمالية)', 'قطر: وزارة الصحة العامة، والتسجيل عبر مجلس قطر للممارسين الصحيين', 'البحرين: الهيئة الوطنية لتنظيم المهن والخدمات الصحية', 'عُمان: وزارة الصحة'] },
        { h: 'ما الذي ينبغي تأكيده قبل الترشيح', list: ['فئة الترخيص أو التسجيل للوظيفة والدرجة', 'هل يبدأ صاحب العمل الطلب أم المرشح', 'أي اختبار أو توثيق للمؤهلات أو إثبات للخبرة تطلبه الجهة', 'هل يجب إتمام الترخيص قبل أن يتمكن المرشح من مباشرة العمل'] },
        { h: 'لماذا يهم ذلك في خطط التوظيف', p: ['يتفاوت زمن الترخيص ويخرج عن سيطرة الباحث. أدرجه في تاريخ المباشرة بدل اعتباره خطوة أخيرة.', 'هذه الصفحة إرشاد عام وليست استشارة قانونية. تحقق من الأنظمة الحالية لدى الجهة المختصة وصاحب العمل.'] }
      ]
    }
  },
  'recruitment-process-brief-to-joining': {
    en: {
      title: 'The recruitment process from brief to joining',
      seoTitle: 'Recruitment Process: From Brief to Joining | Adhuni HR Solutions',
      description: 'The usual steps in overseas recruitment for the Middle East: brief, search, screening, interviews, offer, documents and mobilisation.',
      answer: 'Overseas recruitment usually runs in six stages: a clear brief, candidate search, screening, employer interviews, offer and documents, then travel and joining. The employer\'s speed in giving feedback and the time needed for licences and visas have the biggest effect on the timeline.',
      sections: [
        { h: 'The six stages', list: ['Brief: roles, location, essentials, terms and joining date', 'Search: sourcing candidates who match the essentials', 'Screening: checking experience, certificates and availability', 'Interviews: employer meets the shortlisted candidates', 'Offer and documents: terms agreed, credentials and visa paperwork prepared', 'Joining: travel arrangements and arrival'] },
        { h: 'What slows a search down', list: ['Essentials that are too long or unclear', 'Slow interview feedback', 'Licensing or credential checks started late', 'Changes to terms after candidates are shortlisted'] },
        { h: 'How to keep it moving', p: ['Agree a timetable at the start, name one decision-maker and share changes immediately. Timing depends on the role, candidate availability and destination requirements, so it should be agreed after the brief is reviewed.'] }
      ]
    },
    ar: {
      title: 'عملية التوظيف من الطلب إلى المباشرة',
      seoTitle: 'عملية التوظيف: من الطلب إلى المباشرة | أدهوني لحلول الموارد البشرية',
      description: 'الخطوات المعتادة في التوظيف الخارجي للشرق الأوسط: الطلب والبحث والفرز والمقابلات والعرض والمستندات والمباشرة.',
      answer: 'يمر التوظيف الخارجي عادةً بست مراحل: طلب واضح، والبحث عن المرشحين، والفرز، ومقابلات صاحب العمل، والعرض والمستندات، ثم السفر والمباشرة. وأكثر ما يؤثر في الجدول الزمني سرعة صاحب العمل في إبداء رأيه والوقت اللازم للتراخيص والتأشيرات.',
      sections: [
        { h: 'المراحل الست', list: ['الطلب: الوظائف والموقع والأساسيات والشروط وتاريخ المباشرة', 'البحث: الوصول إلى مرشحين يطابقون الأساسيات', 'الفرز: التحقق من الخبرة والشهادات والتوفر', 'المقابلات: يلتقي صاحب العمل بالمرشحين المختارين', 'العرض والمستندات: الاتفاق على الشروط وتجهيز المؤهلات وأوراق التأشيرة', 'المباشرة: ترتيبات السفر والوصول'] },
        { h: 'ما الذي يبطئ البحث', list: ['أساسيات طويلة أو غير واضحة', 'بطء الرد بعد المقابلات', 'التأخر في بدء الترخيص أو التحقق من المؤهلات', 'تغيير الشروط بعد ترشيح المرشحين'] },
        { h: 'كيف تحافظ على سير العملية', p: ['اتفق على جدول زمني في البداية، وحدّد صاحب قرار واحدًا، وشارك أي تغيير فورًا. يعتمد الوقت على الوظيفة وتوفر المرشحين ومتطلبات الوجهة، لذا ينبغي الاتفاق عليه بعد مراجعة الطلب.'] }
      ]
    }
  },
  'questions-to-ask-a-recruitment-agency': {
    en: {
      title: 'Questions to ask a recruitment agency before you hire',
      seoTitle: 'Questions to Ask a Recruitment Agency Before You Hire | Adhuni',
      description: 'Ten practical questions employers can ask any recruitment agency about process, screening, fees, documents and communication.',
      answer: 'Before you choose a recruitment agency, ask how it screens candidates, who your contact is, how fees work, how documents are handled and what happens if a candidate withdraws. Clear, specific answers matter more than promises of speed.',
      sections: [
        { h: 'Questions about process', list: ['How will you search for candidates for this role?', 'What checks do you make on experience and certificates?', 'Who will be my single point of contact?', 'How often will I get updates?'] },
        { h: 'Questions about terms', list: ['How are your fees structured and when are they due?', 'Do candidates pay any fee, and how do local rules treat that?', 'What happens if a candidate withdraws before joining?'] },
        { h: 'Questions about documents and compliance', list: ['Who prepares credential and visa documents?', 'How is candidate information stored and shared?', 'Which parts do you handle and which stay with the employer?'] },
        { h: 'What to watch for', p: ['Be cautious about guaranteed timelines or guaranteed placement. Timing depends on the role, candidates, licensing and visas. Ask for answers in writing.'] }
      ]
    },
    ar: {
      title: 'أسئلة تطرحها على شركة التوظيف قبل التعاقد',
      seoTitle: 'أسئلة تطرحها على شركة التوظيف قبل التعاقد | أدهوني',
      description: 'عشرة أسئلة عملية يمكن لأصحاب العمل طرحها على أي شركة توظيف عن العملية والفرز والرسوم والمستندات والتواصل.',
      answer: 'قبل اختيار شركة توظيف، اسأل كيف تفرز المرشحين، ومن جهة الاتصال، وكيف تُحتسب الرسوم، وكيف تُعالَج المستندات، وماذا يحدث إذا انسحب مرشح. فالإجابات الواضحة والمحددة أهم من وعود السرعة.',
      sections: [
        { h: 'أسئلة عن العملية', list: ['كيف ستبحثون عن مرشحين لهذه الوظيفة؟', 'ما الفحوصات التي تجرونها على الخبرة والشهادات؟', 'من جهة الاتصال الواحدة لدي؟', 'كم مرة سأتلقى تحديثات؟'] },
        { h: 'أسئلة عن الشروط', list: ['كيف تُهيكَل رسومكم ومتى تستحق؟', 'هل يدفع المرشحون أي رسوم، وكيف تعاملها الأنظمة المحلية؟', 'ماذا يحدث إذا انسحب مرشح قبل المباشرة؟'] },
        { h: 'أسئلة عن المستندات والالتزام', list: ['من يجهّز مستندات المؤهلات والتأشيرة؟', 'كيف تُخزَّن بيانات المرشحين وتُشارك؟', 'ما الأجزاء التي تتولونها وما الذي يبقى على صاحب العمل؟'] },
        { h: 'ما الذي ينبغي الحذر منه', p: ['احذر من الجداول الزمنية المضمونة أو ضمان التعيين. فالتوقيت يعتمد على الوظيفة والمرشحين والترخيص والتأشيرات. اطلب الإجابات كتابةً.'] }
      ]
    }
  }
};

export const guide = slug => G[slug];
export const guideList = () => guideSlugs.map(slug => ({ slug, en: G[slug].en, ar: G[slug].ar }));
export const guidesIndex = {
  en: { seoTitle: 'Recruitment Guides for GCC Employers | Adhuni HR Solutions', title: 'Recruitment guides for GCC employers.', description: 'Plain-language guides on hiring briefs, healthcare licensing, the recruitment process and choosing an agency.', eyebrow: 'GUIDES', intro: 'Short, practical guides for employers hiring in the Middle East. General guidance only: always confirm current rules with the authority and the employer.', read: 'Read the guide', home: 'Guides' },
  ar: { seoTitle: 'أدلة التوظيف لأصحاب العمل في الخليج | أدهوني لحلول الموارد البشرية', title: 'أدلة التوظيف لأصحاب العمل في الخليج.', description: 'أدلة مبسطة عن طلبات التوظيف وترخيص المهن الصحية وعملية التوظيف واختيار شركة التوظيف.', eyebrow: 'الأدلة', intro: 'أدلة عملية قصيرة لأصحاب العمل الذين يوظفون في الشرق الأوسط. إرشاد عام فقط: أكّد دائمًا الأنظمة الحالية مع الجهة المختصة وصاحب العمل.', read: 'اقرأ الدليل', home: 'الأدلة' }
};
export const guideLabels = { en: { relatedGuides: 'Related guides', related: 'More guides', cta: 'Discuss your hiring needs', ctaIntro: 'Ready to brief us? Share the roles, location and start date.' }, ar: { relatedGuides: 'أدلة ذات صلة', related: 'مزيد من الأدلة', cta: 'ناقش احتياجات التوظيف لديك', ctaIntro: 'هل أنت مستعد لإرسال طلبك؟ شاركنا الوظائف والموقع وتاريخ البدء.' } };

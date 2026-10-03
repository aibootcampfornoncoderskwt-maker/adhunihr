// About page content that needs real facts from the client. Everything below stays hidden until it has a real value.
// Fill these in, rebuild, and the matching blocks appear. Do not invent history, titles or quotes.

export const aboutConfig = {
  // Company facts strip. Leave empty to hide the item. Industries, markets, services and the 5-step process always show; the strip shows up to 6 items.
  founded: '',      // [YEAR]  e.g. '2019'
  headOffice: '',   // [CITY]  e.g. 'Kuwait City'

  // Our story: two short paragraphs. Replace with the real founder story when the client supplies it.  [FOUNDER STORY]
  story: [
    'A hiring brief rarely fits in a job title. The site, the shift pattern, the start date and the team around the hire all change who is right for the role. Adhuni asks about those details first, then starts the search.',
    'One person then handles your brief from start to finish. You see a screened shortlist and hear honest updates at each stage, with support until the hire joins.'
  ],

  // Founder quote block. Hidden until quote AND name are filled in.  [FOUNDER QUOTE] / [FOUNDER NAME]
  founder: {
    quote: '',      // [FOUNDER QUOTE]
    name: '',       // [FOUNDER NAME]
    role: ''        // e.g. 'Founder'
  },

  // Leadership cards. The whole section stays hidden while this list is empty. Add one object per real person:
  //   { name: 'Full name', role: 'Job title', photo: '/images/team/full-name.webp', linkedin: 'https://www.linkedin.com/in/...' }
  // photo and linkedin are optional; without a photo the card shows initials.
  leadership: [] as { name: string; role: string; photo?: string; linkedin?: string }[]
};

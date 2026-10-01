# Plan for integrating the supplied Adhuni content

Historical proposal from the extraction turn. See [the current dedicated-page and search handoff](dedicated-pages-and-search-handoff.md) for the implemented seven service pages, twelve industry pages and dedicated company pages. The proposal below was superseded.

## Recommended structure

Keep the current website's typography, colours, photography, responsive components and visual direction. Use the supplied copy as the content source and distribute it across six primary pages. Keep the homepage concise; place detailed process explanations, values and registration forms on the relevant inner pages.

| Page | Content to add | Existing components to reuse |
| --- | --- | --- |
| Home `/` | Reference headline and supporting copy, company introduction, six service summaries, twelve industry labels, employer CTA and GCC focus | Hero, about split, service rows, industry imagery, market map, country links |
| About Us `/about/` | Full company description, approach, vision, mission, six values, regional focus and two audience CTAs | Base layout, split sections, cards, market links |
| Services `/services/` | Seven full service descriptions, eight-stage process, twelve industries, four FAQs and employer CTA | Service data, existing service detail template, process styling, FAQ accordions |
| For Employers `/employers/` | Six benefits, eight-step employer journey, requirement checklist, sixteen-field requirement form, four FAQs | Process/cards, contact styling, existing enquiry API foundation |
| For Candidates `/candidates/` | Six-stage journey, fourteen-field registration form with CV upload, six guidelines, trust text, five FAQs | Candidate imagery, contact styling, FAQ accordions |
| Contact Us `/contact/` | Three enquiry paths, nine-field general enquiry form, consent text and verified contact details | Contact styling, footer contact links and existing API foundation |

Retain existing service, industry and location detail URLs where useful. Add overview pages without breaking current links. If an existing detail page is replaced, map its old URL deliberately before changing navigation.

## What changes in the current project

### Home

`src/pages/index.astro` currently holds most of the site's content: hero, about, services, industries, pipelines, two market sections, process, credentials, candidate introduction, illustrative roles, FAQs and contact form.

Recommended homepage order:

1. “Connecting Businesses with the Right People.” hero with employer and candidate buttons.
2. Company introduction and requirement-focused sourcing.
3. Six service summaries linking to the Services overview and details.
4. Twelve industries presented in the existing visual system.
5. Employer requirement call to action.
6. Middle East/GCC focus using the existing map and country visuals.
7. Compact candidate invitation linking to the candidate page.
8. Shared footer.

Move detailed processes, full forms and audience-specific FAQs to inner pages. Existing illustrative job rows and credential copy are not part of the supplied content; recommend removing them from the main homepage during integration unless the client wants them retained. Keep asset attribution associated with any retained imagery.

### Services

`src/data/site.ts` currently defines four services, compared with seven in the reference.

| Current service | Recommended treatment |
| --- | --- |
| Permanent Recruitment | Keep and replace its overview copy with the supplied wording |
| Overseas Recruitment | Retain its useful URL as supporting regional content; it is not one of the seven supplied service categories |
| Project & Bulk Hiring | Separate presentation into Contract & Project Staffing and High-Volume Recruitment; retain the old URL as a useful overview or redirect deliberately |
| Executive & Specialist Search | Separate presentation into Executive & Leadership Search and Professional & Specialist Recruitment |
| No direct current equivalent | Add Skilled & Technical Manpower and Recruitment Process Support |

Add a Services index at `src/pages/services/index.astro`. Existing `src/pages/services/[slug].astro` can continue to generate detail pages. Do not silently change old slugs while replacing labels.

The homepage's `serviceFit` array has exactly four entries and is indexed alongside `services`. Update this data relationship when expanding services, otherwise extra services will read missing entries. Prefer storing card-specific copy within each service record.

### Industries

The current data contains six broad groups. The reference lists twelve explicit categories.

- Split Engineering & Construction into Engineering & Technical and Construction & Infrastructure.
- Keep Oil & Gas & Energy, Manufacturing, and Logistics & Supply Chain.
- Split Hospitality & Retail into Hospitality and Retail & E-commerce.
- Split Corporate & Technology into the finance/corporate category and Information Technology.
- Add Healthcare, Facilities Management, and Education & Professional Services.

Choose one finance label consistently. Proposed label: “Banking, Finance & Corporate Services” from the reference homepage. This is an editorial recommendation, not a claim that both source pages used the same wording.

Reuse appropriate existing sector imagery. Additional categories can initially use the existing icon/card system; do not mislabel unrelated photographs. Retain current industry URLs or explicitly map replacements.

### Process and company information

Replace the four-step overview with the supplied eight-stage process on Services. Home may link to the process without repeating all eight descriptions.

Create About using the complete company, vision, mission and values content. Keep a short introduction on Home that links to it.

Use the source's broader “multi-industry recruitment with a Middle East focus” positioning consistently. Review current India-only phrasing in the hero, top bar, footer, country pages and metadata so it does not unintentionally narrow the supplied scope. Retain India-related material only where it remains accurate and useful.

### Forms and functionality

Current `src/components/Contact.astro` offers employer and candidate tabs with a short shared schema. `src/pages/api/contact.ts` accepts JSON, recognises only employer/candidate types, and sends a text email through Resend with Turnstile validation. There is no file-upload handling. Form enablement and delivery depend on environment configuration; this review does not verify deployed configuration or delivery.

Implementation requires:

1. Separate employer, candidate and general-enquiry schemas matching the supplied field lists.
2. Update frontend validation, API validation and delivered email content together; adding visible fields alone would lose information.
3. Add general enquiry routing and optional company handling. The current API requires company/current-role and scope for both enquiry types.
4. Add CV and optional contact attachment handling, with deliberate file type/size limits, validated uploads and controlled access or delivery.
5. Preserve spam protection and provide clear pending, success and failure messages.
6. Keep consent and the privacy notice consistent with actual CV storage, use and employer sharing.
7. Validate each complete submission path, including rejected files and failed delivery, before enabling production collection.

The screenshot's Passport Status field asks for status, not a passport scan or passport number. Preserve that distinction if the field is added.

### Navigation and footer

Update `src/components/Header.astro` to expose Home, About Us, Services, For Employers, For Candidates and Contact Us, with “Submit Your Requirement” linking to the employer form. Keep industry detail links reachable through Services and relevant sections without overcrowding navigation.

Update `src/components/Footer.astro` with the supplied brand statement, quick links and separate business/candidate links. Route “Request a Call” to Contact with a clear enquiry purpose and “How It Works” to the candidate journey. These are proposed destinations; screenshots do not reveal the original URLs.

Retain the existing privacy route, updating its content as required by the implemented forms. Add Terms & Conditions only when its content is supplied or separately prepared and reviewed; a footer label alone is not policy text.

### English and Arabic

The current project includes `src/scripts/language.ts`, `src/data/arabic.json` and `src/data/arabic.tsv`. After agreeing the English content, extend translations for all new page text, navigation, form labels, feedback and FAQs, and check right-to-left layouts. The provided screenshots only supply English wording.

## Content gaps to resolve before publication

| Gap | Proposed handling |
| --- | --- |
| Thirteen closed FAQ answers | Obtain original expanded answers or separately draft answers for client review; do not present drafts as extracted source text |
| Office address, phone, WhatsApp and business hours | Obtain actual values; do not publish “To Be Filled” or example details |
| Conflicting email/domain wording | Current site shows `info@adhunihr.com`; screenshot shows an example `info@adhuni-hrsolutions.com` and website `adhuni-hrsolutions.com`. Confirm the actual business destinations before replacement |
| Hidden dropdown options | Define country and enquiry options deliberately; they cannot be recovered from the screenshots |
| About editorial advisory | Preserve in the content reference; recommend treating it as a launch note rather than customer-facing promotional copy |
| Contact editorial launch note | Replace with useful customer-facing contact information when real details are available |
| Privacy and terms text | Existing privacy content needs review against expanded form behaviour; reference legal-page bodies are absent |

These gaps do not prevent building the page layouts and integrating the available copy.

## Suggested implementation sequence

1. Centralise the supplied copy and reconcile service/industry labels and positioning.
2. Add the five overview/audience pages; update Home and shared navigation/footer.
3. Map existing detail pages and URLs to the expanded content structure.
4. Implement the three forms and upload/delivery support.
5. Fill verified contact details and FAQ answers; update translations and metadata.
6. Run Astro checks/build, then verify page links, mobile layouts, keyboard use, English/Arabic presentation and actual form submission paths.

Result: the complete supplied content fits into the current design, with a shorter homepage and clear destinations for employers and candidates.

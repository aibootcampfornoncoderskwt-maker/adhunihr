# Dedicated pages and search handoff

This replaces the previous grouped service/industry navigation. The site now has seven service detail pages, twelve industry detail pages, two overview pages, and dedicated About, Our Approach and Contact destinations in the primary navigation.

## Service URLs

- `/services/permanent-recruitment/`
- `/services/contract-project-staffing/`
- `/services/skilled-technical-manpower/`
- `/services/professional-specialist-recruitment/`
- `/services/high-volume-recruitment/`
- `/services/executive-leadership-search/`
- `/services/recruitment-process-support/`

## Industry URLs

- `/industries/engineering-technical/`
- `/industries/construction-infrastructure/`
- `/industries/oil-gas-energy/`
- `/industries/manufacturing/`
- `/industries/hospitality/`
- `/industries/healthcare/`
- `/industries/logistics-supply-chain/`
- `/industries/information-technology/`
- `/industries/retail-ecommerce/`
- `/industries/banking-finance-corporate-services/`
- `/industries/facilities-management/`
- `/industries/education-professional-services/`

## Company and overview URLs

- `/services/`
- `/industries/`
- `/our-approach/`
- `/about/`
- `/contact/`

Employer, candidate and six GCC location pages remain available. The old grouped URLs have permanent redirects configured through Astro/Vercel and are excluded from the sitemap. Multi-category legacy pages without an exact successor lead to the relevant overview.

## Content and design

Each detail page has a relevant hero image, a direct service/industry description, two contextual paragraphs, role examples, a tailored hiring checklist, practical questions and answers, related service/industry links, GCC market links and an enquiry CTA. Service pages also show their own four-step coordination outline and link to the full eight-stage approach.

The client supplied the seven service scopes, twelve industries and recruitment principles. Longer explanatory copy and the new detail-page Q&A were drafted from that scope; they are not verbatim recovered FAQ answers. They should receive the client's normal editorial review. No fabricated placements, experience figures, client logos, reviews, office addresses or live vacancies were added.

Existing English/Arabic navigation remains. New long-form detail copy is authored in English; full Arabic translation and separate indexable Arabic routes remain a localization task. The current browser language switch is not a substitute for server-rendered language-specific pages or hreflang.

## Search foundations implemented

- Static HTML content and crawlable navigation links.
- Unique titles and descriptions on all nineteen detail pages.
- One H1 per page and hierarchical content sections.
- Self-referencing canonical URLs using the configured site origin.
- Page-specific Open Graph and Twitter images/titles/descriptions.
- Organization, WebSite and WebPage JSON-LD; AboutPage and ContactPage for their respective pages.
- Service and BreadcrumbList JSON-LD on the service and industry detail pages, reflecting visible content.
- Sitemap coverage for the new canonical URLs, excluding replaced URLs.
- Permanent redirects from the previous grouped URLs.
- Descriptive image alt text, dimensions, WebP assets and lazy-loaded secondary images.
- Direct Q&A and related links for users and machine-readable context. No JobPosting markup on illustrative roles, and no invented reviews or unsupported FAQ rich-result promises.

Google advises that established SEO practices remain relevant to AI search features and that structured data should match visible content. There is no special schema required for generative AI search. These changes provide a technical and content foundation; they do not guarantee rankings or AI citations. References: [Google AI features](https://developers.google.com/search/docs/appearance/ai-features), [Google generative AI optimization guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), [Schema.org BreadcrumbList](https://schema.org/BreadcrumbList).

## Production handoff

1. Set `SITE_URL` to the verified HTTPS production domain before building. Check canonical, social image, structured-data and sitemap URLs on that build.
2. Keep `PUBLIC_LAUNCH_READY` disabled for previews. Set it to `true` for the approved production launch; this changes the existing robots/indexing gate. No live deployment or indexing change was made in this task.
3. Confirm actual company contact details, policy text and any operational claims with the client. The supplied placeholder addresses and example phone numbers are not published.
4. Configure and test real form delivery separately before enabling enquiry collection. Existing preview gating remains; no test messages were sent externally.
5. For multilingual SEO, complete the Arabic long-form content and implement language-specific static URLs, matching canonicals and reciprocal hreflang.
6. After deployment, use the production sitemap and Search Console to inspect indexing and validate structured data against the live domain.

## Image assets

Five new photorealistic illustrations were generated with the built-in image_gen tool, inspected, and saved as WebP in `public/images/`: `sector-healthcare.webp`, `sector-education.webp`, `sector-technology.webp`, `sector-retail.webp`, and `sector-facilities.webp`. Each is approximately 88–174 KB. They are not real Adhuni staff or project photographs. Full prompts, original output paths and final relative asset paths are recorded in `sector-image-prompts.json`. Existing images and their attributions remain in use; visible image-credit disclosures distinguish generated illustrations from licensed photographs.

## Verification

- `npm run check`: no errors, warnings or hints.
- `npm run build`: successful Astro/Vercel production build.
- `node scripts/check-client-content.mjs`: local links, anchors and source form fields.
- `node scripts/check-catalog-pages.mjs`: exact 7/12 counts, unique titles/descriptions, one H1, images, schemas, canonicals, navigation, sitemap and redirects.
- `node scripts/check-enquiry-api.mjs`: existing enquiry validation and mocked delivery paths still pass.
- Browser inspection: expanded desktop dropdowns, keyboard opening/closing, mobile scrollable navigation, desktop and 390px industry layouts, and hiring-context links.

Proof screenshots are saved under `tmp/page-qa/`.

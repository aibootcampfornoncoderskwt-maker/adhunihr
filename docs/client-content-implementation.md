# Client content integration — current navigation retained

Historical implementation record, superseded by the user's request for seven service pages and twelve industry pages. See [the current dedicated-page and search handoff](dedicated-pages-and-search-handoff.md) for the implemented navigation, pages, imagery and validation.

The user's follow-up replaces the earlier proposed six-page primary navigation. The implemented primary navigation remains Home, Services, Industries, Our Approach, About and Contact. The four service dropdown entries, six industry dropdown entries and their existing detail URLs are preserved.

## Where the supplied content now lives

- Home: client hero and introduction, six supplied service summaries alongside existing service groups, all twelve industry categories, employer call to action, eight recruitment stages, GCC focus, candidate invitation and general contact form.
- About: `/about/` contains the full company profile, approach, vision, mission, six values, regional focus and audience links. It is accessible from the homepage introduction and footer; the existing About navigation anchor remains.
- Services: `/services/` contains all seven supplied services and the detailed process. Existing service detail pages include the relevant supplied service descriptions. Their original dropdown labels and URLs remain unchanged.
- Industries: the six existing detail pages retain their names and show their relevant categories from the twelve-category source list.
- Employers: `/employers/` includes six benefits, the employer journey, requirement checklist and full employer form. Hire Talent and employer calls to action lead here.
- Candidates: `/candidates/` includes the six-stage journey, full CV registration, guidelines and trust content. Homepage and footer links lead here.
- Contact: the existing `/#contact` section contains the three audience paths and full general enquiry form.

## Forms

Employer, candidate and general schemas are defined in `src/data/enquiry-fields.json`. The employer form also retains the optional service selector for the existing service-to-market-to-enquiry flow. Query-selected countries and service groups are preserved.

The API accepts multipart submissions, validates required fields and attachments, checks consent/origin/Turnstile, and includes every declared field in the configured delivery email. Candidate CVs and general attachments are optional PDF/DOC/DOCX files limited to 2 MB. Accepted attachments are sent with the email; no CV database was added. File checks validate size, extension and expected format markers; they are not malware scanning.

Existing environment-based preview gating remains in place. The local preview does not collect submissions. Real email delivery has not been exercised; API checks mock external requests without sending messages.

## Deliberately unresolved source material

- The thirteen FAQ questions are included as questions with an “Ask our team” link. The screenshots do not contain their answers, so answers were not invented.
- “To Be Filled” contact fields, sample business hours and the source's editorial launch instructions are not published.
- The site's existing email address is retained pending confirmation of the conflicting reference email/domain.
- Privacy text reflects the new form/attachment flow; final company-specific privacy details and the missing Terms & Conditions still need supplied content before launch.
- Additional Arabic translations cover the supplied visible copy and form labels. Example input placeholders remain examples; translations should receive the client's editorial review.

## Validation

- `npm run check`
- `npm run build`
- `node scripts/check-client-content.mjs` — generated routes, internal links/anchors, source content and form fields.
- `node scripts/check-enquiry-api.mjs` — three payloads, required fields, consent, origin, email, country, field length, vacancy count, file type/size, CAPTCHA failure, delivery failure and disabled mode. External calls are mocked.
- Browser checks cover the unchanged dropdowns, new forms, mobile layout, Arabic/RTL and preservation of selected recruitment context. The off-screen spam field was adjusted to avoid horizontal overflow in mobile RTL layouts.

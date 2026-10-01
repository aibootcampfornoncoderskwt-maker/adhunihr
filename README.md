# Adhuni HR Solutions — Astro website

A responsive corporate recruitment website reconstructed from the supplied desktop reference. Astro + TypeScript + Tailwind CSS, self-hosted fonts, static content pages, and a Vercel serverless enquiry endpoint.

## Run locally

Use Node.js **22.12+** (Node 22 LTS recommended) and npm.

```bash
npm ci
npm run dev
```

Open http://localhost:4321. To verify the project:

```bash
npm run check
npm run build
```

The Vercel adapter writes a deployable Build Output API bundle to `.vercel/output`. Use `npm run dev` for local previews; `astro preview` is not supported by every server adapter.

## Deploy to Vercel

### Dashboard / Git workflow

1. Extract this ZIP. Upload the contents of `adhuni-website` to your own GitHub repository. Do not commit node_modules or `.env`.
2. In Vercel select **Add New → Project**, then import the repository.
3. If the repository contains the outer `adhuni-website` folder, select it as the **Root Directory**. If package.json is at the repository root, leave the root unchanged.
4. Framework preset: **Astro**. Build command: **npm run build**. Install command: **npm ci**. Leave the output directory at the Astro preset default; the adapter creates the correct deployment output.
5. Select Node.js **22.x** in project settings.
6. Deploy. The initial site works in review mode, with noindex and enquiries disabled. No email secrets are needed for a design preview.
7. Add your owned domain under Vercel → Settings → Domains. Follow Vercel's exact DNS instructions.
8. Set `SITE_URL` to the final HTTPS origin (for example your actual owned domain, no path). Do not assume the suggested adhunihr.com is owned or available.
9. Redeploy after changing any environment variable used at build time.

### Vercel CLI alternative

From the extracted project directory on your computer:

```bash
npx vercel login
npx vercel
# After inspecting the preview:
npx vercel --prod
```

This archive is configured for Vercel but does not itself create a Vercel project or claim a deployed URL. No Vercel account or credentials were available in the build session.

## Enquiry delivery (real backend, disabled until configured)

There are separate employer and candidate forms. Candidate enquiries collect experience summaries, not CV uploads. No database or candidate portal is included.

1. Create/configure a Resend account and verify the actual sending domain.
2. Set server environment variables in Vercel:
   - `RESEND_API_KEY`
   - `CONTACT_FROM` — a verified sender such as `Adhuni Website <web@YOUR-OWNED-DOMAIN>`
   - `CONTACT_TO` — the client's actual recipient address
3. Create a Cloudflare Turnstile widget allowing the website hostname and set:
   - `PUBLIC_TURNSTILE_SITE_KEY`
   - `TURNSTILE_SECRET_KEY`
4. After client approval of enquiry/privacy handling, set `PUBLIC_CONTACT_ENABLED=true` and redeploy.
5. Test both forms on the deployed URL with consent. Verify actual receipt and reply-to, validation messages, challenge expiry and failure handling. Preview deployments need their hostname allowed in Turnstile if forms are enabled there.
6. Configure Vercel firewall/rate limiting appropriate to expected traffic. Turnstile, origin checks, a honeypot and bounded input are implemented; this is not a durable application-level rate limiter.

When disabled or unconfigured the endpoint returns 503 and the UI never claims a message was sent. The preview UI does not send or store entered personal details. A success response is produced only after the email provider accepts the message; inbox delivery still depends on email provider/domain configuration. Secret values belong only in server environment variables, never in PUBLIC_* variables or Git.

## Launch and search visibility

Review mode is deliberate: `PUBLIC_LAUNCH_READY` defaults to false. Every page has noindex and robots.txt disallows crawling. For launch:

- Client confirms the legal company name, final logo, services, markets, claims and approved copy.
- Replace/approve the provisional privacy notice with actual legal entity, privacy contact, retention and processing details.
- Confirm image permissions and whether illustrative generated photographs are acceptable.
- Keep the role examples explicitly illustrative, or replace them with verified open roles and appropriate expiry handling. Do not add JobPosting schema to examples.
- Set `SITE_URL` to the final owned HTTPS domain.
- Set `PUBLIC_LAUNCH_READY=true` and redeploy after approval.
- Inspect the rendered canonical URLs, meta robots, `/robots.txt`, `/sitemap-index.xml` and `/sitemap-0.xml` on the live domain. Submit the sitemap in Search Console.

Technical foundations include server-delivered text, unique titles/descriptions, canonical URLs, semantic headings, internal links, sitemap, robots controls and Organization JSON-LD (only on launch-enabled builds). No invented office addresses, reviews, statistics, customer logos, licences or job postings are published. Country pages describe market focus, not local offices. Privacy and 404 pages remain noindex. There is no guarantee of rankings, AI citations or featured answers.

## Structure and editing

- `src/pages/index.astro`: homepage, preserving the reference section sequence.
- `src/data/site.ts`: services, industries, countries, pipeline content, FAQs and sample roles.
- `src/pages/services/[slug].astro`: four generated service pages.
- `src/pages/industries/[slug].astro`: six generated sector pages.
- `src/pages/locations/[slug].astro`: six generated market pages.
- `src/components/Contact.astro`: forms and enquiry-type tabs.
- `src/pages/api/contact.ts`: validated email/Turnstile endpoint.
- `src/styles/global.css`: design tokens, responsive layouts, component styling.
- `src/scripts/site.ts`: accessible navigation, tabs, role filters and form interactions.
- `public/images`: locally bundled imagery; see ASSETS.md.
- `public/flags`: accurate flag artwork from flag-icons.

The logo currently uses the supplied A/person design shown in the website reference, displayed from its supplied image through CSS. It is not a new client-approved identity. Replace `Logo.astro` and the favicon when a final transparent/vector logo is approved.

## What matches the supplied reference

Navy/amber styling; condensed headings; desktop service/industry dropdowns; hero and two audience CTAs; country ticker; about; 2x2 services; sector cards and rows; brand statement; three pipeline tabs; Gulf–India map; country guide tabs; approach; evidence section; candidate invitation; filterable role table; fit statement; FAQs; dual enquiry forms; large footer wordmark.

The reference full-page screenshot is only 293 × 2048 pixels. Small copy and exact measurements cannot be recovered from it. This is a close reconstruction with legible copy and substitute imagery, not a pixel-identical source recovery. Responsive mobile/tablet layouts are intentionally adapted.

## Scaling

Content pages are prerendered; only enquiries execute server code. Adding entries in the data file generates routes at build time. Add a CMS when the client needs editing without code; no unrequested admin login is included. A full candidate/employer portal, CV storage and workflow engine are a separate scope.

## Validation

See `VALIDATION.md` for the checks actually run and remaining launch dependencies.

## September 24 update — second hero design
Header and hero now use the second supplied reference: wide margins, Inter bold headline, amber rounded CTAs, large outline icons and all seven flags. The meeting photo is a new illustrative reconstruction, not an exact source photograph. The previous below-the-fold layout remains intact. Unverified office claims, social destinations and language switching were not invented.

Country names auto-scroll at constant speed in a seamless 30-second loop; the two identical groups are at least a viewport wide to avoid gaps on large screens. Pause/resume is available at the right edge. Reduced-motion preferences intentionally stop auto-animation and allow horizontal scrolling.

## Corporate polish and male-only imagery
All people photographs were revised to show adult male professionals, including the hero, about, industry, pipeline and candidate sections. These remain AI-generated illustrations, not actual staff or project photographs. Headings now use Inter consistently; cards, section rhythm, form surfaces and headings were refined without removing content sections. Placeholder-style and competitive claims in section headings were replaced with straightforward recruitment wording.

## GCC-wide refinement
The hero now uses a neutral Gulf corporate setting with no country-specific landmarks. Six equally styled market cards link to each GCC destination; India is the talent connection. Male-only imagery and the continuous ticker remain. The private review site is static with disabled enquiries; this ZIP retains the Vercel contact API for configuration at launch.

## September 25 — employer journey and presentation
Reworked service rows, a split editorial section, four-stage process, responsive spacing and clear market selection. Service → country → enquiry now retains the chosen service and country. Continuous country ticker and male-only imagery retained.

### Photography replacement remains pending
People images are still AI-generated illustrations. Real stock photographs were researched, but their image host could not be downloaded from this environment. No stock image was integrated. Supply original licensed photographs to complete this requested change; do not describe the current people imagery as real staff or real photography.

## Latest section redesign
Sectors: two wide feature cards plus four compact cards. FAQ and contact: full-width split layouts. Credentials: three structured cards. Candidate invitation and role table refreshed. Country guide now uses six locally bundled real photographs with public credits. Oil/gas and manufacturing also use real photographs. Other people imagery remains generated; replacement is still pending.

## WhatsApp and social profiles
Set PUBLIC_WHATSAPP_NUMBER (international digits, no +), PUBLIC_INSTAGRAM_URL and PUBLIC_LINKEDIN_URL in Vercel, then rebuild. Use only verified Adhuni-owned destinations. Missing social URLs show non-clickable icons with an accessible pending label; the WhatsApp panel explains availability and links to enquiry options. It never directs to a guessed account. The widget has restrained ring animation, Escape/close/outside dismissal and reduced-motion support.

## Hero and brand icon cleanup
Removed duplicate static hero flags/country list; animated market ribbon remains. Replaced approximate social and WhatsApp paths with Font Awesome brand SVG geometry. Client-owned WhatsApp/social destinations still required in environment configuration.

## Brand splash introduction
A large centred Adhuni logo is shown on every homepage load or refresh (no sessionStorage gate). The logo is centred at 50% of the viewport; the loading bar sits underneath. Desktop width caps at 760px, phone width is 90vw. First-load introduction lasts at least about 2.2 seconds, with a 3.5-second timeout and 600ms completion and fade. The visible skip button is removed; Escape still dismisses it. Reduced-motion uses a static 1.2-second introduction. No-JavaScript users see the website immediately. Interior pages skip the intro; homepage anchor links still show it on a full page load. The progress bar is decorative/indeterminate, not a network percentage. Existing source logo reused without changing its artwork.

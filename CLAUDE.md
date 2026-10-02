# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Requires Node >= 22.12 and npm.

```bash
npm ci
npm run dev       # http://localhost:4321
npm run check     # astro check (TypeScript/Astro diagnostics)
npm run build     # static build + Vercel Build Output (.vercel/output); client assets land in dist/client
```

There is no test runner or linter. Validation is done with standalone scripts in `scripts/`, which run with plain `node` against build output, so run `npm run build` first:

```bash
node scripts/check-client-content.mjs   # scans dist/client HTML for client-content requirements
node scripts/check-catalog-pages.mjs    # verifies generated service/industry pages
node scripts/check-enquiry-api.mjs      # transpiles src/pages/api/contact.ts and exercises POST with mocks
node scripts/prepare-client-content.mjs # regenerates src/data/client-content.json from docs/reference-content-extraction.md
```

`astro preview` is not supported by the Vercel adapter; use `npm run dev`. `VALIDATION.md` records which checks were actually run.

## Architecture

Astro 7 + Tailwind 4 (via `@tailwindcss/vite`) site for Adhuni HR Solutions (GCC/India recruitment). `output: 'static'`; the only server code is the Vercel-hosted enquiry endpoint `src/pages/api/contact.ts` (Resend email + Cloudflare Turnstile, origin check, honeypot). Most markup and CSS are dense one-line Astro templates plus a single large `src/styles/global.css` (no per-component styles).

- **Content lives in data files, pages are generated from them.** `src/data/catalog.ts` (7 services, 12 industries with long-form copy, images, icons) drives `services/[slug]`, `industries/[slug]`, `locations/[slug]` and the listing pages via `CatalogDetail.astro`. `src/data/site.ts` holds countries, FAQs, sample roles. Adding an entry generates a route at build time.
- **Redirects and sitemap** are configured in `astro.config.mjs`. Old slugs redirect to the current service/industry pages; the sitemap filter excludes 404, privacy and redirect sources. When renaming or removing a slug, update the `redirects` map.
- **Client-supplied copy pipeline:** `docs/reference-content-extraction.md` → `scripts/prepare-client-content.mjs` → `src/data/client-content.json` (rendered through `ClientCopy.astro`/`ClientFAQ.astro`). Edit the markdown source, not the JSON. Editorial notes in the markdown are deliberately never emitted as UI copy.
- **Enquiry forms:** `src/data/enquiry-fields.json` defines fields and is shared by `EnquiryForm`/`EnquiryFields` components and the API validator, so the two must stay in sync. `src/data/contact.ts` holds env-derived contact config. Service → country → enquiry selections are carried into the form.
- **Arabic/RTL toggle is client-side translation, not separate pages.** `src/scripts/language.ts` walks text nodes and attributes and replaces exact normalised English strings using the dictionaries `src/data/arabic.json` + `client-arabic.json` (`arabic.tsv` is a source). Any new or edited English copy needs a matching dictionary key or it stays English in Arabic mode. It also sets `dir`/`lang` on `<html>`.
- `src/scripts/site.ts` handles nav, tabs, role filters and form interactions; `Splash.astro` is the homepage-only intro (shows on every homepage load).
- `src/layouts/Base.astro` controls robots/canonical/JSON-LD behaviour based on `PUBLIC_LAUNCH_READY`.

## Environment / launch gating

See `.env.example`. The site ships in review mode: `PUBLIC_LAUNCH_READY=false` makes every page noindex and `robots.txt.ts` disallow all; `PUBLIC_CONTACT_ENABLED=false` makes the API return 503 and the UI never claims a message was sent. `SITE_URL` falls back to `VERCEL_PROJECT_PRODUCTION_URL`, then localhost. `PUBLIC_*` vars are build-time, so changes need a rebuild/redeploy; secrets (`RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`) must never be `PUBLIC_*`. WhatsApp/social links render as inert placeholders until their env URLs are set.

## Content rules from the README

- Do not invent office addresses, reviews, statistics, customer logos, licences, job postings, or social destinations. Country pages describe market focus, not offices. Role examples are illustrative; never add JobPosting schema to them.
- People imagery is AI-generated and male-only by client direction, and must not be described as real staff; real photos are credited via `ImageCredit.astro` (see `ASSETS.md`). Fonts are Inter (headings and body) and Barlow Condensed, self-hosted via fontsource.
- `tmp/` holds one-off migration scripts, backups and QA screenshots from past edits; it is not part of the build. `dist/` and `.vercel/` are gitignored build output. `docs/` records past implementation decisions (`dedicated-pages-and-search-handoff.md` is the current handoff; `client-content-implementation.md` is historical).

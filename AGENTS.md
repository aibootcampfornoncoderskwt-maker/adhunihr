# Repository Guidelines

## Project Structure & Module Organization

This Astro website uses TypeScript and Tailwind CSS. Routes live in `src/pages/`; shared markup lives in `src/components/` and `src/layouts/`. Services and industries are defined in `src/data/catalog.ts`, with supporting content in `src/data/`. Browser interactions live in `src/scripts/`, and shared styling lives in `src/styles/global.css`.

Static images and flags belong in `public/`; record image credits in `ASSETS.md` and retain licences in `licenses/`. Validation scripts live in `scripts/`, implementation notes in `docs/`, and historical backups in `tmp/`. Generated `.astro/`, `dist/`, and `.vercel/` directories are ignored.

## Build, Test, and Development Commands

Use Node.js 22.12+ and npm:

```bash
npm ci             # Install dependencies from the lockfile
npm run dev        # Start development at http://localhost:4321
npm run check      # Check Astro and TypeScript diagnostics
npm run build      # Generate static pages and Vercel output
```

Use the development server for previews; the Vercel adapter does not support `astro preview`.

## Coding Style & Naming Conventions

Follow nearby formatting; existing templates and styles are compact. Use two-space indentation for new multiline code, single quotes in TypeScript, and strict types. Name components in PascalCase (`EnquiryForm.astro`), helpers in camelCase, and route slugs in kebab-case. No formatter or linter is configured.

Edit client copy in `docs/reference-content-extraction.md`, then run `node scripts/prepare-client-content.mjs` to regenerate its JSON. Update Arabic dictionaries when changing English copy. Keep form fields and API validation synchronized through `src/data/enquiry-fields.json`; update redirects when changing route slugs.

## Testing Guidelines

There is no test framework or coverage threshold. After checking and building, run:

```bash
node scripts/check-client-content.mjs
node scripts/check-catalog-pages.mjs
node scripts/check-enquiry-api.mjs
```

These check generated content, routes, metadata, and mocked enquiry handling. Follow the `check-*.mjs` naming pattern. For interface changes, verify desktop/mobile layouts, keyboard navigation, and Arabic/RTL behavior; record results in `VALIDATION.md`.

## Commit & Pull Request Guidelines

History contains only `inital commit`, so no established convention exists. Use concise imperative subjects, such as `Fix mobile enquiry spacing`. PRs should explain changes, list validation results, link relevant issues, and include screenshots for visual changes.

## Security & Configuration

Use `.env.example`; never commit secrets or expose them through `PUBLIC_*`. Keep launch and enquiry flags disabled until client approval and configuration are complete. Publish only verified company claims and contact destinations; preserve image attribution and illustrative-role labeling.

import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
// The main address has no 'www': a www host is always rewritten to the bare domain so canonicals and the sitemap never use it.
const site = (process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://adhunihrsolutions.com')).replace('://www.adhunihrsolutions.com', '://adhunihrsolutions.com');
const redirects={
  "/services/overseas-recruitment/": "/services/",
  "/services/project-bulk-hiring/": "/services/high-volume-recruitment/",
  "/services/executive-specialist-search/": "/services/executive-leadership-search/",
  "/industries/engineering-construction/": "/industries/engineering-technical/",
  "/industries/manufacturing-industrial/": "/industries/manufacturing/",
  "/industries/hospitality-retail/": "/industries/",
  "/industries/corporate-technology/": "/industries/"
};
// Market pages (/industries/<industry>/<country>/) and /guides/ stay out of the sitemap until PUBLIC_MARKET_PAGES_LIVE=true.
const marketPage = /^\/industries\/[^/]+\/[^/]+\/$/;
const marketLive = process.env.PUBLIC_MARKET_PAGES_LIVE === 'true';
const guidePage = /^\/guides\//;
const guidesLive = process.env.PUBLIC_GUIDES_LIVE === 'true';
export default defineConfig({ redirects, devToolbar: { enabled: false }, site, output: 'static', adapter: vercel(), integrations: [sitemap({filter: page => !page.includes('/404') && !page.includes('/privacy') && (marketLive || !marketPage.test(new URL(page).pathname)) && (guidesLive || !guidePage.test(new URL(page).pathname)) && !Object.keys(redirects).some(path=>new URL(page).pathname===path)})], server: { host: '0.0.0.0' }, vite: { server: { host: '0.0.0.0', allowedHosts: ['terminal.local'] }, plugins: [tailwindcss()] } });

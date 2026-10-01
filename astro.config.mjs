import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
const site = process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:4321');
const redirects={
  "/services/overseas-recruitment/": "/services/",
  "/services/project-bulk-hiring/": "/services/high-volume-recruitment/",
  "/services/executive-specialist-search/": "/services/executive-leadership-search/",
  "/industries/engineering-construction/": "/industries/engineering-technical/",
  "/industries/manufacturing-industrial/": "/industries/manufacturing/",
  "/industries/hospitality-retail/": "/industries/",
  "/industries/corporate-technology/": "/industries/"
};
export default defineConfig({ redirects, devToolbar: { enabled: false }, site, output: 'static', adapter: vercel(), integrations: [sitemap({filter: page => !page.includes('/404') && !page.includes('/privacy') && !Object.keys(redirects).some(path=>new URL(page).pathname===path)})], server: { host: '0.0.0.0' }, vite: { server: { host: '0.0.0.0', allowedHosts: ['terminal.local'] }, plugins: [tailwindcss()] } });

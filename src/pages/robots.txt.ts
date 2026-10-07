import type { APIRoute } from 'astro';
// Review mode blocks everything. At launch, search and AI crawlers are welcome; only the form endpoint is excluded.
const aiBots=['GPTBot','OAI-SearchBot','ChatGPT-User','ClaudeBot','Claude-SearchBot','PerplexityBot','Google-Extended','Applebot-Extended'];
export const GET:APIRoute=({site})=>{
 const live=import.meta.env.PUBLIC_LAUNCH_READY==='true';
 const body=live?`User-agent: *\nAllow: /\nDisallow: /api/\n\n${aiBots.map(bot=>`User-agent: ${bot}\nAllow: /\nDisallow: /api/\n`).join('\n')}\nSitemap: ${new URL('sitemap-index.xml',site).href}\n`:'User-agent: *\nDisallow: /\n';
 return new Response(body,{headers:{'Content-Type':'text/plain; charset=utf-8'}});
};

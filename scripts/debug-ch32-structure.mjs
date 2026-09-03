import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const courseId = process.argv[2] || '061490c0-87f7-49c2-afad-569e24323ecc';
const { data: fiche, error } = await db.from('fiches').select('content_html').eq('cours_id', courseId).single();
if (error) throw error;
const html = fiche.content_html;
const coverStart = html.indexOf('<section class="cover"');
const coverEnd = html.indexOf('</section>', coverStart);
console.log(html.slice(coverStart, coverEnd + 10).replace(/<img[^>]*>/gi, '[IMG]').replace(/\s+/g, ' '));
console.log('\nCLASSES\n', [...html.matchAll(/class="([^"]+)"/g)].map((match) => match[1]).filter((name) => /part|title|titre|section/i.test(name)).filter((name, index, all) => all.indexOf(name) === index).join('\n'));
console.log('\nPARTS\n', [...html.matchAll(/<[^>]*class="[^"]*partie-banner-title[^"]*"[^>]*>([\s\S]*?)<\/[^>]+>/gi)].map((match) => match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()).join('\n'));

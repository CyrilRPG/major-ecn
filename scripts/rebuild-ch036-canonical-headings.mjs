import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
config({ path: '.env.local' });
const id = 'bc570193-b962-4247-a068-3fe4f9a02f46';
const dir = resolve('../.corpus-orthopedie/chirurgie-iterative-du-lca');
const out = join(dir, 'delivery', 'canonical-rebuild-20260811');
const titles = { I: 'Causes et mécanismes d’échec', II: 'Bilan clinique et radiologique de reprise', III: 'Analyse des tunnels et du capital osseux', IV: 'Préparation opératoire et stratégie de révision', V: 'Greffon, fixation et gestes associés', VI: 'Suites, rééducation et reprise d’activité', VII: 'Synthèse décisionnelle' };
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { data: fiche, error } = await db.from('fiches').select('id,content_html,pages,titre').eq('cours_id', id).single();
if (error) throw error;
const before = JSON.stringify({ courseId: id, fiche, canonicalSource: 'Chirurgie itérative du LCA.docx' }, null, 2) + '\n';
mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'snapshot-before-heading-rebuild.json'), before, 'utf8');
writeFileSync(join(out, 'manifest.json'), JSON.stringify({ courseId: id, source: 'DOCX canonique', operation: 'source-heading-rebuild', sha256: createHash('sha256').update(before).digest('hex') }, null, 2) + '\n', 'utf8');
let html = fiche.content_html;
for (const [roman, title] of Object.entries(titles)) {
  const escaped = roman.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  html = html.replace(new RegExp(`(<span class="partie-banner-title[^"]*">)\\s*${escaped}\\s*(<\\/span>)`, 'g'), `$1${title}$2`);
  html = html.replace(new RegExp(`(<span class="cover-plan-text">)\\s*${escaped}\\s*(<\\/span>)`, 'g'), `$1${title}$2`);
}
if (/<span class="(?:partie-banner-title|cover-plan-text)[^"]*">\s*(?:I|II|III|IV|V|VI|VII)\s*<\/span>/.test(html)) throw new Error('Titres génériques restants');
writeFileSync(join(out, 'fiche.body.html'), html, 'utf8');
console.log(JSON.stringify({ out, changed: html !== fiche.content_html }));

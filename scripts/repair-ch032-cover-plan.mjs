/** Restores the missing cover plan for the fiche of recent carpal trauma. */
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });
const courseId = '061490c0-87f7-49c2-afad-569e24323ecc';
const delivery = resolve('../.corpus-orthopedie/chirurgie-des-traumatismes-recents-du-carpe/delivery/2026-08-11-cover-plan-repair');
mkdirSync(delivery, { recursive: true });
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { data: fiche, error } = await db.from('fiches').select('id,content_html,storage_path,pages').eq('cours_id', courseId).single();
if (error || !fiche) throw error || new Error('Fiche introuvable');
writeFileSync(join(delivery, 'published-before-structured-cover-repair.json'), `${JSON.stringify({ capturedAt: new Date().toISOString(), coursId: courseId, fiche }, null, 2)}\n`, 'utf8');
const original = JSON.parse(readFileSync(join(delivery, 'published-before-cover-plan.json'), 'utf8')).fiche;
const parts = [
  ['I', "Voies d'abord du carpe"],
  ['II', 'Fractures du scaphoïde'],
  ['III', 'Fractures des autres os du carpe'],
  ['IV', 'Lésions ligamentaires du carpe'],
  ['V', 'Luxations périlunaires du carpe'],
  ['VI', 'Fiche Éclair'],
  ['VII', 'Synthèse — tableaux de révision'],
];
const plan = `<div class="cover-plan"><div class="cover-section-label">Plan du cours</div><ol class="cover-plan-list">${parts.map(([number, title], index) => `<li class="cover-plan-item"><a class="cover-plan-link" href="#partie-${index + 1}"><span class="cover-plan-num">${number}</span><span class="cover-plan-text">${title}</span></a></li>`).join('')}</ol></div><div class="cover-legend"><div class="cover-section-label">Légende</div><div class="cover-legend-items"><span class="cover-legend-item"><span class="cover-legend-sym cover-legend-sym--2">◆</span><span class="cover-legend-text">Notion à haut rendement</span></span><span class="cover-legend-item"><span class="cover-legend-sym cover-legend-sym--3">⚠</span><span class="cover-legend-text">Piège classique</span></span></div></div>`;
const coverStart = original.content_html.indexOf('<section class="cover"');
const coverEnd = original.content_html.indexOf('</section>', coverStart);
if (coverStart < 0 || coverEnd < 0) throw new Error('Structure de couverture inattendue');
const cover = original.content_html.slice(coverStart, coverEnd);
const closeContent = cover.lastIndexOf('</div>');
if (closeContent < 0) throw new Error('Conteneur de couverture introuvable');
const correctedCover = `${cover.slice(0, closeContent)}${plan}${cover.slice(closeContent)}`;
const contentHtml = `${original.content_html.slice(0, coverStart)}${correctedCover}${original.content_html.slice(coverEnd)}`;
const { error: updateError } = await db.from('fiches').update({ content_html: contentHtml }).eq('id', fiche.id);
if (updateError) throw updateError;
const { data: readback, error: readbackError } = await db.from('fiches').select('content_html').eq('id', fiche.id).single();
if (readbackError || !/cover-plan/.test(readback.content_html)) throw readbackError || new Error('Readback de plan échoué');
writeFileSync(join(delivery, 'cover-plan-repair.json'), `${JSON.stringify({ coursId: courseId, parts, readback: 'ok' }, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ courseId, parts: parts.length, delivery }));

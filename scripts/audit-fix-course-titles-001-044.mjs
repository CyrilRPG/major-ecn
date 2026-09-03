import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
config({ path: '.env.local' });
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const root = resolve('../.corpus-orthopedie/natural-question-repair-001-044/title-audit-20260811');
mkdirSync(root, { recursive: true });
const normalize = (v) => String(v || '').normalize('NFC').replace(/[’']/g, "'").replace(/\s+/g, ' ').trim().toLowerCase();
const { data: courses, error } = await db.from('cours').select('id,order_index,titre').eq('matiere_id', 'col-orthopedie').gte('order_index', 1).lte('order_index', 44).order('order_index');
if (error) throw error;
const rows = [];
for (const course of courses) {
  const { data: fiche, error: ficheError } = await db.from('fiches').select('titre,content_html').eq('cours_id', course.id).single();
  if (ficheError) throw ficheError;
  const cover = /<span class="string-source string-source--cours">([\s\S]*?)<\/span>/.exec(fiche.content_html || '')?.[1]?.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim() || null;
  rows.push({ coursId: course.id, orderIndex: course.order_index, courseTitleBefore: course.titre, ficheTitle: fiche.titre, coverTitle: cover, status: normalize(course.titre) === normalize(fiche.titre) ? 'aligned' : 'review' });
}
// The #14 fiche title is the validated full form and fixes the sole certain
// course-title typo ("voie antérieurs") without inferring medical content.
const target = rows.find((row) => row.orderIndex === 14);
if (!target || normalize(target.ficheTitle) !== normalize('Arthrodèses lombaires intersomatiques (L2 à L5) par voie antérieure mini-invasive')) throw new Error('Référence fiche #14 inattendue');
const snapshot = JSON.stringify({ createdAt: new Date().toISOString(), target }, null, 2) + '\n';
writeFileSync(join(root, 'snapshot-before-course-title-014.json'), snapshot, 'utf8');
const { error: updateError } = await db.from('cours').update({ titre: target.ficheTitle }).eq('id', target.coursId);
if (updateError) throw updateError;
const { data: readback, error: readError } = await db.from('cours').select('titre').eq('id', target.coursId).single();
if (readError || readback.titre !== target.ficheTitle) throw readError || new Error('Readback du titre #14 invalide');
target.courseTitleAfter = readback.titre; target.status = 'corrected';
const report = { generatedAt: new Date().toISOString(), scope: 'cours 1-44, titres seulement', totals: { courses: rows.length, corrected: 1, aligned: rows.filter((row) => row.status === 'aligned').length, reviewedNoChange: rows.filter((row) => row.status === 'review').length }, rows, snapshotSha256: createHash('sha256').update(snapshot).digest('hex') };
writeFileSync(join(root, 'report.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
console.log(JSON.stringify(report.totals));

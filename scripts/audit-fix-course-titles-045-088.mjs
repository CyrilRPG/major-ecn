import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
config({ path: '.env.local' });
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const root = resolve('../.corpus-orthopedie/title-audit-045-088-20260811');
mkdirSync(root, { recursive: true });
const normalize = (v) => String(v || '').normalize('NFC').replace(/[’']/g, "'").replace(/&(?:#39|apos);/g, "'").replace(/\s+/g, ' ').trim().toLowerCase();
const { data: courses, error } = await db.from('cours').select('id,order_index,titre').eq('matiere_id', 'col-orthopedie').gte('order_index', 45).lte('order_index', 88).order('order_index');
if (error) throw error;
const rows = [];
for (const course of courses) {
  const { data: fiche, error: ficheError } = await db.from('fiches').select('titre,content_html').eq('cours_id', course.id).single();
  if (ficheError) throw ficheError;
  const cover = /<span class="string-source string-source--cours">([\s\S]*?)<\/span>/.exec(fiche.content_html || '')?.[1]?.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").trim() || null;
  rows.push({ coursId: course.id, orderIndex: course.order_index, courseTitleBefore: course.titre, ficheTitle: fiche.titre, coverTitle: cover, status: normalize(course.titre) === normalize(fiche.titre) ? 'aligned' : 'review' });
}
// #46 is a certain expansion: both the validated fiche and its cover agree on
// the complete operative technique, whereas the database title is truncated.
const target = rows.find((row) => row.orderIndex === 46);
if (!target || normalize(target.ficheTitle) !== normalize('Enclouage centromédullaire de la diaphyse fémorale') || normalize(target.coverTitle) !== normalize(target.ficheTitle)) throw new Error('Référence fiche #46 non certaine');
const snapshot = JSON.stringify({ createdAt: new Date().toISOString(), target }, null, 2) + '\n';
writeFileSync(join(root, 'snapshot-before-course-title-046.json'), snapshot, 'utf8');
const { error: updateError } = await db.from('cours').update({ titre: target.ficheTitle }).eq('id', target.coursId);
if (updateError) throw updateError;
const { data: readback, error: readError } = await db.from('cours').select('titre').eq('id', target.coursId).single();
if (readError || readback.titre !== target.ficheTitle) throw readError || new Error('Readback du titre #46 invalide');
target.courseTitleAfter = readback.titre; target.status = 'corrected';
const report = { generatedAt: new Date().toISOString(), scope: 'cours 45-88, titres seulement', totals: { courses: rows.length, corrected: 1, aligned: rows.filter((row) => row.status === 'aligned').length, reviewedNoChange: rows.filter((row) => row.status === 'review').length }, rows, snapshotSha256: createHash('sha256').update(snapshot).digest('hex') };
writeFileSync(join(root, 'report.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
console.log(JSON.stringify(report.totals));

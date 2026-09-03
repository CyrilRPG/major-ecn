/** Removes the one incomplete numerical assertion from the calcaneus fiche.
 * The statement is incomplete in the canonical DOCX and is therefore omitted
 * rather than guessed.  The QCM/DP/cards are intentionally untouched.
 */
import { writeFileSync } from 'node:fs';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });
const courseId = '0a0a8cb4-f1ab-4f0d-86d6-76693add217e';
const reportPath = process.argv[2] || '../.corpus-orthopedie/remove-calcaneus-unsourced-percentage-report.json';
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { data: fiche, error } = await db.from('fiches').select('id,content_html').eq('cours_id', courseId).single();
if (error) throw error;
const before = String(fiche.content_html || '');
const after = before.replace(/\s*Modification de la reduction dans un % significatif \(Hanovre\)\s*/gi, ' ');
if (after === before) throw new Error('Assertion incomplète introuvable : aucune écriture effectuée.');
const { error: updateError } = await db.from('fiches').update({ content_html: after, content_format: 'html' }).eq('id', fiche.id);
if (updateError) throw updateError;
const { data: readback, error: readError } = await db.from('fiches').select('content_html').eq('id', fiche.id).single();
if (readError || readback.content_html !== after || /Modification de la reduction dans un % significatif/i.test(readback.content_html)) {
  throw readError || new Error('Lecture de contrôle invalide.');
}
writeFileSync(reportPath, `${JSON.stringify({ courseId, ficheId: fiche.id, removed: 'Modification de la reduction dans un % significatif (Hanovre)', publishedAt: new Date().toISOString() }, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ courseId, published: true }));

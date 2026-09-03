/**
 * Insertion des séries « Entraînement » d'endocrinologie (cours Révisions - Endocrinologie).
 *
 * Passe par PostgREST (@supabase/supabase-js, service role) plutôt que par du SQL
 * brut : les énoncés sont truffés d'apostrophes typographiques et de guillemets,
 * le JSON supprime tout risque d'échappement. kind / mg_series / is_revisions sont
 * laissés aux triggers.
 *
 * Idempotent : refuse de tourner si des séries « Entraînement » existent déjà pour
 * ce cours (passer --force pour les remplacer).
 *
 * Usage : node insert-endo-qcm.mjs [--force]
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const SCRATCH = 'C:/Users/Admin/AppData/Local/Temp/claude/C--Users-Admin-Desktop-Major-ecn-projects/0ebfa447-4e7a-4639-829c-ef74cc6400cb/scratchpad';
const GEO = join(SCRATCH, 'extraits_geo');
const COURS = '8bbac79d-efa8-40d2-ad2c-2eed47d6b1d6';

const env = {};
for (const line of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
}
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const plan = JSON.parse(readFileSync(join(SCRATCH, 'plan.json'), 'utf8'));
const urls = JSON.parse(readFileSync(join(SCRATCH, 'image-urls.json'), 'utf8'));
const force = process.argv.includes('--force');

const urlsFor = (serie, rels) => rels.map((rel) => {
  const p = join(GEO, serie.geo, rel).replace(/\\/g, '/');
  const u = urls[p];
  if (!u) throw new Error('URL manquante : ' + p);
  return u;
});

// --- garde-fou : ne pas dupliquer ---
const { data: exist, error: e0 } = await sb.from('qcm_series').select('id,label').eq('cours_id', COURS).ilike('label', '%ntra%nement%');
if (e0) throw e0;
if (exist.length && !force) {
  console.error(`${exist.length} série(s) « Entraînement » existent déjà : ${exist.map((s) => s.label).join(', ')}. Relancer avec --force pour les remplacer.`);
  process.exit(1);
}
if (exist.length && force) {
  for (const s of exist) {
    const { data: qs } = await sb.from('qcm_questions').select('id').eq('serie_id', s.id);
    if (qs?.length) await sb.from('qcm_items').delete().in('question_id', qs.map((q) => q.id));
    await sb.from('qcm_questions').delete().eq('serie_id', s.id);
    await sb.from('qcm_series').delete().eq('id', s.id);
    console.log('supprimé : ' + s.label);
  }
}

let totQ = 0, totI = 0, totImg = 0;
for (const s of plan) {
  const { data: serie, error: e1 } = await sb.from('qcm_series')
    .insert({ cours_id: COURS, type: 'qcm', label: s.label, order_index: s.order_index })
    .select('id').single();
  if (e1) throw new Error(s.label + ' : ' + e1.message);

  const qRows = s.questions.map((q) => ({
    serie_id: serie.id,
    enonce: q.enonce,
    order_index: q.order_index,
    format: 'qcm',
    reponse_attendue: q.reponse_attendue,
    correction_generale: q.correction_generale,
    images: urlsFor(s, q.images),
  }));
  const { data: qIns, error: e2 } = await sb.from('qcm_questions').insert(qRows).select('id,order_index');
  if (e2) throw new Error(s.label + ' questions : ' + e2.message);

  const byOrder = new Map(qIns.map((q) => [q.order_index, q.id]));
  const iRows = [];
  for (const q of s.questions) {
    for (const it of q.items) {
      iRows.push({
        question_id: byOrder.get(q.order_index),
        lettre: it.lettre,
        enonce: it.enonce,
        is_correct: it.is_correct,
        justification: it.justification,
      });
    }
  }
  const { error: e3 } = await sb.from('qcm_items').insert(iRows);
  if (e3) throw new Error(s.label + ' items : ' + e3.message);

  const nImg = s.questions.reduce((a, q) => a + q.images.length, 0);
  totQ += qRows.length; totI += iRows.length; totImg += nImg;
  console.log(`${s.label} : ${qRows.length} questions, ${iRows.length} items, ${nImg} images  (serie ${serie.id})`);
}
console.log(`\nTOTAL : ${plan.length} séries, ${totQ} questions, ${totI} items, ${totImg} images rattachées`);

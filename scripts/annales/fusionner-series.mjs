/**
 * Fusion en base de deux séries d'annales éclatées par format, et renommages.
 *
 * Une épreuve EVC est un sujet unique : la scinder en une série QCM et une série
 * QROC cassait à la fois l'ordre des questions (l'EVCP 2019 de Médecine générale
 * alterne QCM 1-3, rédactionnelles 4-5, QCM 6-10 au sein du même sujet) et son
 * unité. On ne peut pas republier avec `publier.mjs --force` : il supprime les
 * questions, et la cascade emporterait les tentatives des élèves. On DÉPLACE
 * donc les questions, ce qui préserve leur `id` — donc `qcm_attempts` et
 * `student_saved_questions`.
 *
 * Idempotent : relancé, il ne trouve plus rien à faire.
 *
 * Usage : node scripts/annales/fusionner-series.mjs [--ecrire]
 */
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { charger } from './charger.mjs';

const ECRIRE = process.argv.includes('--ecrire');
const env = {};
for (const l of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const m = l.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
}
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

/** Fusions à opérer : la série `absorbee` disparaît au profit de `cible`. */
const FUSIONS = [
  {
    donnees: 'scripts/annales/data/medecine-generale',
    cible: 'Annales - Médecine générale - 2019 - EVCP - QROC',
    absorbee: 'Annales - Médecine générale - 2019 - EVCP - QCM',
    nouveau: 'Annales - Médecine générale - 2019 - EVCP',
  },
];

/** Renommages simples : suffixe de format ou de voie devenu sans objet. */
const RENOMMAGES = [
  ['Annales - Anesthésie-Réanimation - 2025 - EVCF - QCM voie interne',
    'Annales - Anesthésie-Réanimation - 2025 - EVCF'],
];

const lire = async (label) => {
  const { data, error } = await sb.from('qcm_series')
    .select('id, label, cours_id, vignette, order_index, qcm_questions(id, order_index, enonce)')
    .eq('label', label).maybeSingle();
  if (error) throw new Error(label + ' : ' + error.message);
  return data;
};

for (const f of FUSIONS) {
  const [cible, absorbee, deja] = await Promise.all([lire(f.cible), lire(f.absorbee), lire(f.nouveau)]);
  if (deja && !cible && !absorbee) { console.log('✓ déjà fusionnée : ' + f.nouveau); continue; }
  if (!cible || !absorbee) throw new Error('série introuvable : ' + (cible ? f.absorbee : f.cible));

  // L'ordre final est celui du fichier de données, qui rejoue l'ordre du sujet
  // officiel. On rapproche les questions de la base par leur énoncé.
  const attendu = (charger(f.donnees).series ?? []).find((s) => s.label === f.nouveau);
  if (!attendu) throw new Error('série absente des données : ' + f.nouveau);
  const enBase = [...cible.qcm_questions, ...absorbee.qcm_questions];
  if (enBase.length !== attendu.questions.length) {
    throw new Error(f.nouveau + ' : ' + enBase.length + ' questions en base pour ' + attendu.questions.length + ' attendues');
  }
  // Rapprochement par l'EN-TÊTE de la question (« Sujet 2 — Question 1 »), seul
  // repère stable : le corps de l'énoncé, lui, a pu être retouché côté données
  // — la question 1 du sujet 2 reprend désormais le contexte clinique qui vivait
  // dans la vignette de la série QCM.
  const cle = (e) => {
    const m = String(e).match(/^<b>([^<]+)<\/b>/);
    if (!m) throw new Error('en-tête illisible : ' + String(e).slice(0, 70));
    return m[1].replace(/\s+/g, ' ').trim();
  };
  const parCle = new Map(enBase.map((q) => [cle(q.enonce), q]));
  if (parCle.size !== enBase.length) throw new Error(f.nouveau + ' : en-têtes de question non uniques');
  const ordre = attendu.questions.map((q, i) => {
    const row = parCle.get(cle(q.enonce));
    if (!row) throw new Error(f.nouveau + ' : question ' + (i + 1) + ' introuvable en base — ' + cle(q.enonce));
    return { id: row.id, versOrdre: i, enonce: q.enonce, avant: row.enonce };
  });

  const retouches = ordre.filter((o) => o.enonce !== o.avant);
  console.log('── ' + f.nouveau);
  console.log('   ' + cible.qcm_questions.length + ' + ' + absorbee.qcm_questions.length
    + ' questions → ' + ordre.length + ', réordonnées selon le sujet officiel.');
  for (const r of retouches) console.log('   énoncé retouché : ' + cle(r.enonce));
  if (!ECRIRE) continue;

  // 1. Les `order_index` doivent rester uniques pendant la bascule : on décale
  //    d'abord tout le monde hors de la plage cible.
  for (const [i, o] of ordre.entries()) {
    const { error } = await sb.from('qcm_questions')
      .update({ serie_id: cible.id, order_index: 1000 + i }).eq('id', o.id);
    if (error) throw new Error('déplacement ' + o.id + ' : ' + error.message);
  }
  for (const o of ordre) {
    const maj = { order_index: o.versOrdre };
    // Le contexte clinique quitte la vignette de la série absorbée pour l'énoncé
    // de la première question du sujet concerné : sans cela, il disparaîtrait.
    if (o.enonce !== o.avant) maj.enonce = o.enonce;
    const { error } = await sb.from('qcm_questions').update(maj).eq('id', o.id);
    if (error) throw new Error('réordonnancement ' + o.id + ' : ' + error.message);
  }

  // 2. Les sessions ouvertes sur la série absorbée suivent : les supprimer
  //    effacerait le score déjà obtenu par l'élève.
  const { error: eSess } = await sb.from('qcm_sessions')
    .update({ serie_id: cible.id }).eq('serie_id', absorbee.id);
  if (eSess) throw new Error('sessions : ' + eSess.message);

  // 3. Libellé et vignette de la série survivante.
  const { error: eMaj } = await sb.from('qcm_series')
    .update({ label: f.nouveau, vignette: attendu.vignette ?? null }).eq('id', cible.id);
  if (eMaj) throw new Error('libellé : ' + eMaj.message);

  const { error: eDel } = await sb.from('qcm_series').delete().eq('id', absorbee.id);
  if (eDel) throw new Error('suppression ' + f.absorbee + ' : ' + eDel.message);
  console.log('   ✓ fusionnée, série absorbée supprimée.');
}

for (const [avant, apres] of RENOMMAGES) {
  const s = await lire(avant);
  if (!s) { console.log('✓ déjà renommée : ' + apres); continue; }
  console.log('── renommage : ' + avant + '\n              → ' + apres);
  if (!ECRIRE) continue;
  const { error } = await sb.from('qcm_series').update({ label: apres }).eq('id', s.id);
  if (error) throw new Error(error.message);
}

console.log('\n' + (ECRIRE ? 'Appliqué.' : 'APERÇU — relancer avec --ecrire.'));

/**
 * Branche la copie MG de la PAC (« Infections bronchopulmonaires communautaires
 * de l'adulte », col-mg-pneumologie, bonus Gériatrie) et son original de
 * Pneumologie sur la synchronisation des items partagés
 * (migration 20261005220000_items_partages).
 *
 * La copie (tmp/_geria-copie-pac.mjs, 08/09/2026) a des identifiants aléatoires :
 * les lignes sont jumelées par clés naturelles (libellé de série, rang de
 * question, énoncé de proposition, recto de flashcard, rang de fiche). Contenu
 * vérifié identique le 06/10/2026 ; seules les lettres des propositions
 * différaient. Référence = la version MG (vérifiée) : les lettres de
 * l'original de Pneumologie sont réalignées sur elle (`permuter_lettres_qcm`).
 * Les 16 séries « DP Gériatrie » de la copie restent hors partage.
 *
 * Usage : node scripts/partager-copie-pac-geriatrie.mjs [--dry-run]
 */
import { config as dotenv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv({ path: '.env.local', quiet: true });
const DRY = process.argv.includes('--dry-run');
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const PNEUMO = '7ff2a299-90d5-444f-a692-5ae244d65c82';
const MG = 'cca321f8-144c-4048-a982-675116a6f78d';
const EXCLURE = 'g[eé]riatrie';
const exclue = (s) => new RegExp(EXCLURE, 'i').test(s.label ?? '');

async function lire(table, colonnes, col, valeurs) {
  const out = [];
  for (let i = 0; i < valeurs.length; i += 40) {
    for (let d = 0; ; d += 1000) {
      const { data, error } = await db.from(table).select(colonnes).in(col, valeurs.slice(i, i + 40)).order('id').range(d, d + 999);
      if (error) throw new Error(`${table} : ${error.message}`);
      out.push(...data);
      if (data.length < 1000) break;
    }
  }
  return out;
}
async function charger(cours) {
  const series = (await lire('qcm_series', 'id, label', 'cours_id', [cours])).filter((s) => !exclue(s));
  const questions = await lire('qcm_questions', 'id, serie_id, order_index', 'serie_id', series.map((s) => s.id));
  const items = await lire('qcm_items', 'id, question_id, lettre, enonce', 'question_id', questions.map((q) => q.id));
  const flashcards = await lire('flashcards', 'id, recto', 'cours_id', [cours]);
  const fiches = await lire('fiches', 'id, order_index', 'cours_id', [cours]);
  return { series, questions, items, flashcards, fiches };
}

const { data: deja } = await db.from('cours_partages').select('cours_id').in('cours_id', [PNEUMO, MG]);
if (deja.length) { console.log('déjà partagé'); process.exit(0); }

const P = await charger(PNEUMO);
const M = await charger(MG);
const jumelles = [];
const jumeler = (tbl, p, m) => {
  jumelles.push({ tbl, ligne_id: m.id, logique_id: m.id, cours_id: MG });
  jumelles.push({ tbl, ligne_id: p.id, logique_id: m.id, cours_id: PNEUMO });
};
const unique = (liste, cle, quoi) => {
  const m = new Map();
  for (const x of liste) { const k = cle(x); if (m.has(k)) throw new Error(`${quoi} : clé en double « ${k} »`); m.set(k, x); }
  return m;
};
const egal = (a, b, quoi) => { if (a !== b) throw new Error(`${quoi} : ${a} / ${b}`); };

egal(P.series.length, M.series.length, 'séries');
egal(P.questions.length, M.questions.length, 'questions');
egal(P.items.length, M.items.length, 'propositions');
egal(P.flashcards.length, M.flashcards.length, 'flashcards');
egal(P.fiches.length, M.fiches.length, 'fiches');

const seriesM = unique(M.series, (s) => s.label, 'séries MG');
const permutations = [];
for (const sp of P.series) {
  const sm = seriesM.get(sp.label);
  if (!sm) throw new Error(`série « ${sp.label} » absente côté MG`);
  jumeler('qcm_series', sp, sm);
  const qm = unique(M.questions.filter((q) => q.serie_id === sm.id), (q) => q.order_index, sp.label);
  for (const qp of P.questions.filter((q) => q.serie_id === sp.id)) {
    const q = qm.get(qp.order_index);
    if (!q) throw new Error(`${sp.label} : question ${qp.order_index} absente côté MG`);
    jumeler('qcm_questions', qp, q);
    const im = unique(M.items.filter((i) => i.question_id === q.id), (i) => i.enonce, `${sp.label} Q${qp.order_index}`);
    const lettres = {};
    let change = false;
    for (const ip of P.items.filter((i) => i.question_id === qp.id)) {
      const i = im.get(ip.enonce);
      if (!i) throw new Error(`${sp.label} Q${qp.order_index} : proposition absente côté MG`);
      jumeler('qcm_items', ip, i);
      lettres[ip.lettre] = i.lettre;
      if (ip.lettre !== i.lettre) change = true;
    }
    if (change) permutations.push({ question_id: qp.id, lettres });
  }
}
const flashM = unique(M.flashcards, (f) => f.recto, 'flashcards MG');
for (const fp of P.flashcards) jumeler('flashcards', fp, flashM.get(fp.recto) ?? (() => { throw new Error(`flashcard « ${fp.recto} »`); })());
const fichesM = [...M.fiches].sort((a, b) => a.order_index - b.order_index);
[...P.fiches].sort((a, b) => a.order_index - b.order_index).forEach((fp, k) => jumeler('fiches', fp, fichesM[k]));

console.log(`${jumelles.length / 2} paires, ${permutations.length} questions de Pneumologie à réaligner sur la version MG`);
if (DRY) process.exit(0);

for (let i = 0; i < permutations.length; i += 200) {
  const { error } = await db.rpc('permuter_lettres_qcm', { p_permutations: permutations.slice(i, i + 200) });
  if (error) throw new Error(`permutation : ${error.message}`);
}
{
  const { error } = await db.from('cours_partages').insert([
    { cours_id: MG, groupe_id: MG, libelle_couverture: null, exclure_series: null },
    { cours_id: PNEUMO, groupe_id: MG, libelle_couverture: null, exclure_series: EXCLURE },
  ]);
  if (error) throw new Error(error.message);
}
for (let i = 0; i < jumelles.length; i += 1000) {
  const { error } = await db.from('contenu_partage_ids').insert(jumelles.slice(i, i + 1000));
  if (error) throw new Error(`jumelage : ${error.message}`);
}
console.log('✔ PAC MG ↔ Pneumologie synchronisées.');

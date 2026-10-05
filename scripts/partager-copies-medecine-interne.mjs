/**
 * Branche les 12 copies « Médecine générale → Médecine interne » (faites le
 * 28/09/2026 par scripts/dupliquer-mg-vers-medecine-interne.mjs) sur la
 * synchronisation des items partagés (migration 20261005220000_items_partages) :
 * désormais, une modification faite côté Médecine générale OU côté Médecine
 * interne se répercute de l'autre côté — ce sont les mêmes items.
 *
 * Aucun contenu n'est recopié : les lignes existantes sont jumelées deux à deux
 * (identifiants UUID v5 du script de copie). Seul préalable : les lettres des
 * propositions, rééquilibrées séparément de part et d'autre, sont réalignées sur
 * la source par `permuter_lettres_qcm` (qui reporte aussi les tentatives des
 * élèves). Les séries « DP Gériatrie » restent hors partage (exclues de la copie,
 * réservées au bonus Gériatrie). Les couvertures de fiche portent la discipline
 * (Néphrologie, Hématologie…), jamais « Médecine générale » : pas d'adaptation.
 *
 * Après ce branchement, NE PLUS relancer dupliquer-mg-vers-medecine-interne.mjs :
 * la synchronisation est faite par la base.
 *
 * Usage : node scripts/partager-copies-medecine-interne.mjs [--dry-run]
 */
import { createHash } from 'node:crypto';
import { config as dotenv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv({ path: '.env.local', quiet: true });
const DRY = process.argv.includes('--dry-run');
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const NAMESPACE = '5b0e7c43-9d2a-4f61-8e3b-a7c19d04f2e8';
const EXCLURE = 'g[eé]riatrie';
const SOURCES = [
  '0431ecdf-a9eb-4bbd-9476-bf3e5f1550da', 'a6466920-bc1c-4754-b2e2-1cd8e9cea80e',
  '1c9f543e-6dd8-4046-a4fd-10949dbe9747', '821bdf2f-3b32-426c-a8bc-4246a2db3a13',
  '16f9a1ad-5f83-4d9c-abf2-a80422d3bbd9', 'c184ae08-4c1c-411b-8600-81868042b0c2',
  '9e315bac-6318-4046-8aea-0f8d6f3a87e1', '84d6f063-45c4-4a92-ac73-5a823d547e8c',
  'b192d81d-baaa-44ad-91f6-e012f2ed6997', '9ca3ab98-8248-4df8-afc5-141ce74fe747',
  'ba8fc71a-c3eb-42d6-a3e1-9e9ef4de8b32', '6f9d18b9-a3e6-4368-9502-007277257776',
];

function uuidv5(nom) {
  const ns = Buffer.from(NAMESPACE.replace(/-/g, ''), 'hex');
  const h = Buffer.from(createHash('sha1').update(Buffer.concat([ns, Buffer.from(nom, 'utf8')])).digest().subarray(0, 16));
  h[6] = (h[6] & 0x0f) | 0x50;
  h[8] = (h[8] & 0x3f) | 0x80;
  const x = h.toString('hex');
  return `${x.slice(0, 8)}-${x.slice(8, 12)}-${x.slice(12, 16)}-${x.slice(16, 20)}-${x.slice(20)}`;
}
const copie = (table, id) => uuidv5(`${table}:${id}`);

async function lireTout(table, colonnes, filtre) {
  const out = [];
  for (let d = 0; ; d += 1000) {
    const { data, error } = await filtre(db.from(table).select(colonnes)).order('id').range(d, d + 999);
    if (error) throw new Error(`${table} : ${error.message}`);
    out.push(...data);
    if (data.length < 1000) return out;
  }
}
async function parParents(table, colonnes, col, parents, pas = 40) {
  const out = [];
  for (let i = 0; i < parents.length; i += pas) out.push(...await lireTout(table, colonnes, (q) => q.in(col, parents.slice(i, i + pas))));
  return out;
}

const { data: dejaLignes, error: dejaErr } = await db.from('cours_partages').select('cours_id');
if (dejaErr) throw new Error(dejaErr.message);
const deja = new Set(dejaLignes.map((r) => r.cours_id));
const membres = [];
const jumelles = [];
const permutations = [];

for (const src of SOURCES) {
  const cp = copie('cours', src);
  if (deja.has(src) || deja.has(cp)) { console.log(`= ${src} déjà partagé`); continue; }
  const { data: coursCopie } = await db.from('cours').select('id, matiere_id, linked_to_cours_id').eq('id', cp).maybeSingle();
  if (coursCopie?.matiere_id !== 'col-medecine-interne' || coursCopie.linked_to_cours_id !== src) throw new Error(`copie ${cp} introuvable ou inattendue`);

  const paire = async (table, lignesSource, lignesCopie) => {
    const ids = new Set(lignesCopie.map((r) => r.id));
    if (lignesCopie.length !== lignesSource.length) throw new Error(`${table} ${src} : ${lignesSource.length} source / ${lignesCopie.length} copie`);
    for (const s of lignesSource) {
      const c = copie(table, s.id);
      if (!ids.has(c)) throw new Error(`${table} ${s.id} : copie absente`);
      jumelles.push({ tbl: table, ligne_id: s.id, logique_id: s.id, cours_id: src });
      jumelles.push({ tbl: table, ligne_id: c, logique_id: s.id, cours_id: cp });
    }
  };
  const seriesS = (await lireTout('qcm_series', 'id, label', (q) => q.eq('cours_id', src))).filter((s) => !new RegExp(EXCLURE, 'i').test(s.label ?? ''));
  const seriesC = await lireTout('qcm_series', 'id', (q) => q.eq('cours_id', cp));
  await paire('qcm_series', seriesS, seriesC);
  const questionsS = await parParents('qcm_questions', 'id', 'serie_id', seriesS.map((s) => s.id));
  const questionsC = await parParents('qcm_questions', 'id', 'serie_id', seriesC.map((s) => s.id));
  await paire('qcm_questions', questionsS, questionsC);
  const itemsS = await parParents('qcm_items', 'id, question_id, lettre', 'question_id', questionsS.map((q) => q.id), 80);
  const itemsC = await parParents('qcm_items', 'id, question_id, lettre', 'question_id', questionsC.map((q) => q.id), 80);
  await paire('qcm_items', itemsS, itemsC);
  await paire('fiches', await lireTout('fiches', 'id', (q) => q.eq('cours_id', src)), await lireTout('fiches', 'id', (q) => q.eq('cours_id', cp)));
  await paire('flashcards', await lireTout('flashcards', 'id', (q) => q.eq('cours_id', src)), await lireTout('flashcards', 'id', (q) => q.eq('cours_id', cp)));

  // Lettres de la copie → lettres de la source, question par question.
  const lettreCopie = new Map(itemsC.map((i) => [i.id, i]));
  const parQuestion = new Map();
  for (const s of itemsS) {
    const c = lettreCopie.get(copie('qcm_items', s.id));
    if (c.lettre === s.lettre) continue;
    const m = parQuestion.get(c.question_id) ?? {};
    m[c.lettre] = s.lettre;
    parQuestion.set(c.question_id, m);
  }
  for (const [qid, m] of parQuestion) {
    // permuter_lettres_qcm exige la bijection complète des lettres de la question.
    const toutes = itemsC.filter((i) => i.question_id === qid);
    const lettres = Object.fromEntries(toutes.map((i) => [i.lettre, m[i.lettre] ?? i.lettre]));
    permutations.push({ question_id: qid, lettres });
  }
  membres.push({ cours_id: src, groupe_id: src, libelle_couverture: null, exclure_series: null });
  membres.push({ cours_id: cp, groupe_id: src, libelle_couverture: null, exclure_series: EXCLURE });
  console.log(`+ ${src} → ${cp} : ${seriesS.length} séries, ${questionsS.length} questions, ${itemsS.length} propositions, ${parQuestion.size} questions à réaligner`);
}

console.log(`\n${membres.length / 2} items, ${jumelles.length} lignes jumelées, ${permutations.length} questions à réaligner`);
if (DRY) { console.log('--dry-run : aucune écriture.'); process.exit(0); }

for (let i = 0; i < permutations.length; i += 200) {
  const { error } = await db.rpc('permuter_lettres_qcm', { p_permutations: permutations.slice(i, i + 200) });
  if (error) throw new Error(`permutation : ${error.message}`);
}
// Membres d'abord (les déclencheurs ne lisent que contenu_partage_ids pour les
// modifications ; aucune écriture de contenu n'a lieu ici).
{ const { error } = await db.from('cours_partages').insert(membres); if (error) throw new Error(error.message); }
for (let i = 0; i < jumelles.length; i += 1000) {
  const { error } = await db.from('contenu_partage_ids').insert(jumelles.slice(i, i + 1000));
  if (error) throw new Error(`jumelage : ${error.message}`);
}
console.log('✔ copies Médecine interne branchées sur la synchronisation.');

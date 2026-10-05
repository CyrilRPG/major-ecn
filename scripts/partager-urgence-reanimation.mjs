/**
 * Médecine d'urgence (`col-mir`) ↔ Médecine intensive et réanimation
 * (`col-medecine-intensive-reanimation`) : branche les 64 copies du 10/09/2026
 * (scripts/dupliquer-medecine-urgence-vers-mir.mjs) sur la synchronisation des
 * items partagés (migrations 20261005220000 et 20261006090000).
 *
 * Constat du 06/10/2026 : depuis la copie, seule la Médecine d'urgence a été
 * modifiée par des humains (professeure : 70 modifications de fiches du 19 au
 * 25/09 ; administrateur : séries) ; côté Réanimation, uniquement des scripts.
 * La Médecine d'urgence PRIME donc : chaque ligne de Réanimation est d'abord
 * ramenée à sa jumelle d'Urgence (lettres des propositions réalignées par
 * `permuter_lettres_qcm`, qui reporte les tentatives des élèves ; libellés,
 * vignettes, énoncés, corrections, fiches et flashcards recopiés), puis les deux
 * cours sont jumelés. Ensuite la synchronisation est bilatérale. Réanimation
 * est membre « QCM seulement » : aucune série QROC n'y est répliquée.
 *
 * Jumelage par les identifiants UUID v5 du script de copie ; les lignes créées
 * séparément des deux côtés (même libellé) sont appariées par clé naturelle.
 *
 * Usage : node scripts/partager-urgence-reanimation.mjs [--dry-run]
 */
import { createHash } from 'node:crypto';
import { config as dotenv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv({ path: '.env.local', quiet: true });
const DRY = process.argv.includes('--dry-run');
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const URG = 'col-mir';
const REA = 'col-medecine-intensive-reanimation';
const NAMESPACE = 'c1d7b2e9-5a4f-4e83-9b6d-0f2a7c8e3d15';
function uuidv5(nom) {
  const ns = Buffer.from(NAMESPACE.replace(/-/g, ''), 'hex');
  const h = Buffer.from(createHash('sha1').update(Buffer.concat([ns, Buffer.from(nom, 'utf8')])).digest().subarray(0, 16));
  h[6] = (h[6] & 0x0f) | 0x50; h[8] = (h[8] & 0x3f) | 0x80;
  const x = h.toString('hex');
  return `${x.slice(0, 8)}-${x.slice(8, 12)}-${x.slice(12, 16)}-${x.slice(16, 20)}-${x.slice(20)}`;
}
const copie = (table, id) => uuidv5(`${table}:${id}`);

async function lire(table, colonnes, col, valeurs, pas = 40) {
  const out = [];
  for (let i = 0; i < valeurs.length; i += pas) {
    for (let d = 0; ; d += 1000) {
      const { data, error } = await db.from(table).select(colonnes).in(col, valeurs.slice(i, i + pas)).order('id').range(d, d + 999);
      if (error) throw new Error(`${table} : ${error.message}`);
      out.push(...data);
      if (data.length < 1000) break;
    }
  }
  return out;
}

const SERIE = ['type', 'label', 'annee', 'order_index', 'duration_minutes', 'vignette', 'allowed_offers'];
const QUESTION = ['enonce', 'order_index', 'format', 'reponse_attendue', 'correction_generale', 'images', 'commentaire_enseignant'];
const ITEM = ['enonce', 'is_correct', 'justification', 'images'];
const FICHE = ['titre', 'storage_path', 'pages', 'extracted_text', 'content_format', 'content_html', 'order_index'];
const FLASH = ['recto', 'verso', 'order_index'];
const estQroc = (s) => s.kind === 'qroc' || s.type === 'qroc';
const egal = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

const { data: deja } = await db.from('cours_partages').select('cours_id');
const membresDeja = new Set(deja.map((r) => r.cours_id));
const { data: coursRea, error: e1 } = await db.from('cours').select('id, titre, linked_to_cours_id').eq('matiere_id', REA);
if (e1) throw new Error(e1.message);

const maj = { qcm_series: [], qcm_questions: [], qcm_items: [], fiches: [], flashcards: [] };
const permutations = [];
const jumelles = [];
const membres = [];

for (const cr of coursRea) {
  const src = cr.linked_to_cours_id;
  if (!src || copie('cours', src) !== cr.id) throw new Error(`« ${cr.titre} » : copie inattendue`);
  if (membresDeja.has(cr.id)) { console.log(`= ${cr.titre} déjà jumelé`); continue; }

  const paires = { qcm_series: [], qcm_questions: [], qcm_items: [], fiches: [], flashcards: [] };
  const apparier = (table, sources, copies, cleNaturelle) => {
    const parId = new Map(copies.map((c) => [c.id, c]));
    const pris = new Set();
    const orphelines = [];
    for (const s of sources) {
      const c = parId.get(copie(table, s.id));
      if (c) { paires[table].push([s, c]); pris.add(c.id); } else orphelines.push(s);
    }
    const restantes = copies.filter((c) => !pris.has(c.id));
    for (const s of orphelines) {
      const k = cleNaturelle(s);
      const c = restantes.find((x) => !pris.has(x.id) && cleNaturelle(x) === k);
      if (!c) throw new Error(`${cr.titre} / ${table} : ${s.id} sans jumelle`);
      paires[table].push([s, c]); pris.add(c.id);
    }
    const seules = copies.filter((c) => !pris.has(c.id));
    if (seules.length) throw new Error(`${cr.titre} / ${table} : ${seules.length} ligne(s) propres à Réanimation`);
  };

  const sS = (await lire('qcm_series', `id, kind, ${SERIE.join(', ')}`, 'cours_id', [src])).filter((s) => !estQroc(s));
  const sR = await lire('qcm_series', `id, kind, ${SERIE.join(', ')}`, 'cours_id', [cr.id]);
  apparier('qcm_series', sS, sR, (s) => s.label);
  const qS = await lire('qcm_questions', `id, serie_id, ${QUESTION.join(', ')}`, 'serie_id', sS.map((s) => s.id));
  const qR = await lire('qcm_questions', `id, serie_id, ${QUESTION.join(', ')}`, 'serie_id', sR.map((s) => s.id));
  const serieDe = new Map(paires.qcm_series.map(([s, c]) => [c.id, s.id]));
  apparier('qcm_questions', qS, qR, (q) => `${serieDe.get(q.serie_id) ?? q.serie_id}:${q.order_index}`);
  const iS = await lire('qcm_items', `id, question_id, lettre, ${ITEM.join(', ')}`, 'question_id', qS.map((q) => q.id), 80);
  const iR = await lire('qcm_items', `id, question_id, lettre, ${ITEM.join(', ')}`, 'question_id', qR.map((q) => q.id), 80);
  const questionDe = new Map(paires.qcm_questions.map(([s, c]) => [c.id, s.id]));
  apparier('qcm_items', iS, iR, (i) => `${questionDe.get(i.question_id) ?? i.question_id}:${i.enonce}`);
  const fS = await lire('fiches', `id, ${FICHE.join(', ')}`, 'cours_id', [src]);
  const fR = await lire('fiches', `id, ${FICHE.join(', ')}`, 'cours_id', [cr.id]);
  apparier('fiches', fS, fR, (f) => f.order_index);
  const flS = await lire('flashcards', `id, ${FLASH.join(', ')}`, 'cours_id', [src]);
  const flR = await lire('flashcards', `id, ${FLASH.join(', ')}`, 'cours_id', [cr.id]);
  apparier('flashcards', flS, flR, (f) => f.recto);

  // Urgence prime : différences champ à champ.
  for (const [table, champs] of [['qcm_series', SERIE], ['qcm_questions', QUESTION], ['qcm_items', ITEM], ['fiches', FICHE], ['flashcards', FLASH]]) {
    for (const [s, c] of paires[table]) {
      const patch = {};
      for (const k of champs) if (!egal(s[k], c[k])) patch[k] = s[k];
      if (Object.keys(patch).length) maj[table].push({ id: c.id, patch });
      jumelles.push({ tbl: table, ligne_id: s.id, logique_id: s.id, cours_id: src });
      jumelles.push({ tbl: table, ligne_id: c.id, logique_id: s.id, cours_id: cr.id });
    }
  }
  // Lettres : permutation complète par question de Réanimation.
  const parQuestion = new Map();
  for (const [s, c] of paires.qcm_items) {
    const m = parQuestion.get(c.question_id) ?? { lettres: {}, change: false };
    m.lettres[c.lettre] = s.lettre;
    if (s.lettre !== c.lettre) m.change = true;
    parQuestion.set(c.question_id, m);
  }
  for (const [qid, m] of parQuestion) if (m.change) permutations.push({ question_id: qid, lettres: m.lettres });

  membres.push({ cours_id: src, groupe_id: src, libelle_couverture: null, exclure_series: null, qcm_seulement: false });
  membres.push({ cours_id: cr.id, groupe_id: src, libelle_couverture: null, exclure_series: null, qcm_seulement: true });
}

console.log(`${membres.length / 2} items à jumeler, ${jumelles.length / 2} paires de lignes`);
console.log(`à aligner sur Urgence : ${Object.entries(maj).map(([t, l]) => `${t} ${l.length}`).join(', ')} ; lettres : ${permutations.length} questions`);
if (DRY) { console.log('--dry-run : aucune écriture.'); process.exit(0); }

for (let i = 0; i < permutations.length; i += 200) {
  const { error } = await db.rpc('permuter_lettres_qcm', { p_permutations: permutations.slice(i, i + 200) });
  if (error) throw new Error(`permutation : ${error.message}`);
}
for (const [table, lignes] of Object.entries(maj)) {
  for (const { id, patch } of lignes) {
    const { error } = await db.from(table).update(patch).eq('id', id);
    if (error) throw new Error(`${table} ${id} : ${error.message}`);
  }
}
{ const { error } = await db.from('cours_partages').insert(membres); if (error) throw new Error(error.message); }
for (let i = 0; i < jumelles.length; i += 1000) {
  const { error } = await db.from('contenu_partage_ids').insert(jumelles.slice(i, i + 1000));
  if (error) throw new Error(`jumelage : ${error.message}`);
}
console.log('✔ Réanimation alignée sur Urgence et synchronisée.');

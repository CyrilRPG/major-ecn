/**
 * Duplique l'intégralité de Major Odontologie (faculté `major-odonto`) dans un
 * collège « Odontologie » de Major ECN (faculté `major-ecn`, semestre `edn-prog`).
 *
 * Les deux plateformes partagent le même projet Supabase mais chacune borne ses
 * lectures à SA faculté (`EDN_FACULTE_ID`) : rattacher les matières odonto au
 * semestre EDN les retirerait de Major Odontologie. La copie est donc physique.
 *
 * Copié : matières (collège + sous-collèges), cours, fiches, séries QCM/QROC,
 * questions, propositions, flashcards. Les PDF et images restent dans le
 * Storage partagé : `storage_path` et `images` pointent sur les mêmes objets,
 * lisibles par tout utilisateur authentifié (cf. storage_fiches_auth_read).
 *
 * Les identifiants des copies sont des UUID v5 dérivés de la source : le script
 * est idempotent et rejouable pour resynchroniser le collège après une
 * évolution du contenu odonto. Les lignes miroir dont la source a disparu sont
 * supprimées.
 *
 * Usage : node --env-file=.env.local scripts/dupliquer-odontologie-vers-ecn.mjs [--dry-run]
 */
import { createHash } from 'node:crypto';
import { config as dotenv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv({ path: '.env.local' });

const DRY = process.argv.includes('--dry-run');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants');
const db = createClient(url, key, { auth: { persistSession: false } });

const SOURCE_FACULTE = 'major-odonto';
const CIBLE_SEMESTRE = 'edn-prog';
/** Collège racine odonto côté Major ECN — rang juste après Anesthésie-Réanimation (14). */
const CIBLE_ORDER_INDEX = 15;
/** Namespace UUID v5 : fige la correspondance source → copie. */
const NAMESPACE = '7a2f1c48-9d3e-4b62-8f05-2c6ad9e14b73';

function uuidv5(nom) {
  const ns = Buffer.from(NAMESPACE.replace(/-/g, ''), 'hex');
  const h = Buffer.from(createHash('sha1').update(Buffer.concat([ns, Buffer.from(nom, 'utf8')])).digest().subarray(0, 16));
  h[6] = (h[6] & 0x0f) | 0x50;
  h[8] = (h[8] & 0x3f) | 0x80;
  const x = h.toString('hex');
  return `${x.slice(0, 8)}-${x.slice(8, 12)}-${x.slice(12, 16)}-${x.slice(16, 20)}-${x.slice(20)}`;
}
/** Les matières portent un id texte : on garde un slug lisible. */
const miroirMatiere = (id) => `col-ecn-${id.replace(/^col-/, '')}`;
const miroirLigne = (table, id) => uuidv5(`${table}:${id}`);

/** PostgREST plafonne une réponse à 1000 lignes : on pagine toujours. */
async function lireTout(table, colonnes, filtre) {
  const lignes = [];
  const PAS = 1000;
  for (let debut = 0; ; debut += PAS) {
    const { data, error } = await filtre(db.from(table).select(colonnes)).order('id').range(debut, debut + PAS - 1);
    if (error) throw new Error(`${table}: ${error.message}`);
    lignes.push(...data);
    if (data.length < PAS) return lignes;
  }
}

/** Lecture par paquets d'identifiants parents (limite de longueur d'URL). */
async function lireParParents(table, colonnes, colonne, parents, pas = 40) {
  const lignes = [];
  for (let i = 0; i < parents.length; i += pas) {
    const tranche = parents.slice(i, i + pas);
    lignes.push(...await lireTout(table, colonnes, (q) => q.in(colonne, tranche)));
  }
  return lignes;
}

async function ecrire(table, lignes, pas = 500) {
  if (DRY || lignes.length === 0) return;
  for (let i = 0; i < lignes.length; i += pas) {
    const { error } = await db.from(table).upsert(lignes.slice(i, i + pas), { onConflict: 'id' });
    if (error) throw new Error(`${table} (upsert ${i}): ${error.message}`);
  }
}

async function supprimer(table, ids, pas = 100) {
  if (DRY || ids.length === 0) return;
  for (let i = 0; i < ids.length; i += pas) {
    const { error } = await db.from(table).delete().in('id', ids.slice(i, i + pas));
    if (error) throw new Error(`${table} (delete): ${error.message}`);
  }
}

// ── 1. Matières source ──────────────────────────────────────────────────────
const { data: semestres, error: eSem } = await db.from('semestres').select('id').eq('faculte_id', SOURCE_FACULTE);
if (eSem) throw eSem;
const semestreIds = semestres.map((s) => s.id);
const matieresSource = await lireTout(
  'matieres',
  'id, nom, icon_key, color_hex, order_index, parent_matiere_id, min_offer, access_type',
  (q) => q.in('semestre_id', semestreIds),
);
if (matieresSource.length === 0) throw new Error(`aucune matière trouvée pour la faculté ${SOURCE_FACULTE}`);

const matieresCible = matieresSource.map((m) => ({
  id: miroirMatiere(m.id),
  semestre_id: CIBLE_SEMESTRE,
  nom: m.nom,
  icon_key: m.icon_key,
  color_hex: m.color_hex,
  // Le collège racine odonto est à 0 chez lui : on le place en fin de liste EDN.
  order_index: m.parent_matiere_id ? m.order_index : CIBLE_ORDER_INDEX,
  parent_matiere_id: m.parent_matiere_id ? miroirMatiere(m.parent_matiere_id) : null,
  min_offer: m.min_offer,
  access_type: m.access_type,
}));

// ── 2. Cours ────────────────────────────────────────────────────────────────
const matiereIds = matieresSource.map((m) => m.id);
const coursSource = await lireTout(
  'cours',
  'id, matiere_id, titre, description, order_index, access_type, importance, hidden_blocks',
  (q) => q.in('matiere_id', matiereIds),
);
const coursCible = coursSource.map((c) => ({
  id: miroirLigne('cours', c.id),
  matiere_id: miroirMatiere(c.matiere_id),
  titre: c.titre,
  description: c.description,
  order_index: c.order_index,
  access_type: c.access_type,
  importance: c.importance,
  hidden_blocks: c.hidden_blocks,
  // `linked_to_cours_id` sert uniquement à exclure un cours de la facturation :
  // la copie ne doit hériter d'aucun lien vers l'arborescence odonto.
  linked_to_cours_id: null,
}));
const coursIds = coursSource.map((c) => c.id);

// ── 3. Fiches ───────────────────────────────────────────────────────────────
const fichesSource = await lireParParents(
  'fiches',
  'id, cours_id, titre, storage_path, pages, extracted_text, content_json, content_format, content_html, order_index',
  'cours_id', coursIds, 20,
);
const fichesCible = fichesSource.map((f) => ({
  id: miroirLigne('fiches', f.id),
  cours_id: miroirLigne('cours', f.cours_id),
  titre: f.titre,
  storage_path: f.storage_path,
  pages: f.pages,
  extracted_text: f.extracted_text,
  content_json: f.content_json,
  content_format: f.content_format,
  content_html: f.content_html,
  order_index: f.order_index,
}));

// ── 4. Séries → questions → propositions ────────────────────────────────────
const seriesSource = await lireParParents(
  'qcm_series',
  'id, cours_id, type, label, annee, order_index, duration_minutes, vignette, kind, mg_series, is_revisions, allowed_voies, allowed_offers',
  'cours_id', coursIds,
);
const seriesCible = seriesSource.map((s) => ({
  id: miroirLigne('qcm_series', s.id),
  cours_id: miroirLigne('cours', s.cours_id),
  type: s.type, label: s.label, annee: s.annee, order_index: s.order_index,
  duration_minutes: s.duration_minutes, vignette: s.vignette, kind: s.kind,
  mg_series: s.mg_series, is_revisions: s.is_revisions,
  allowed_voies: s.allowed_voies, allowed_offers: s.allowed_offers,
}));

const serieIds = seriesSource.map((s) => s.id);
const questionsSource = await lireParParents(
  'qcm_questions',
  'id, serie_id, enonce, order_index, format, reponse_attendue, correction_generale, images, commentaire_enseignant',
  'serie_id', serieIds,
);
const questionsCible = questionsSource.map((q) => ({
  id: miroirLigne('qcm_questions', q.id),
  serie_id: miroirLigne('qcm_series', q.serie_id),
  enonce: q.enonce, order_index: q.order_index, format: q.format,
  reponse_attendue: q.reponse_attendue, correction_generale: q.correction_generale,
  images: q.images, commentaire_enseignant: q.commentaire_enseignant,
}));

const questionIds = questionsSource.map((q) => q.id);
const itemsSource = await lireParParents(
  'qcm_items',
  'id, question_id, lettre, enonce, is_correct, justification, images',
  'question_id', questionIds,
);
const itemsCible = itemsSource.map((i) => ({
  id: miroirLigne('qcm_items', i.id),
  question_id: miroirLigne('qcm_questions', i.question_id),
  lettre: i.lettre, enonce: i.enonce, is_correct: i.is_correct,
  justification: i.justification, images: i.images,
}));

// ── 5. Flashcards ───────────────────────────────────────────────────────────
const flashSource = await lireParParents('flashcards', 'id, cours_id, recto, verso, order_index', 'cours_id', coursIds, 20);
const flashCible = flashSource.map((f) => ({
  id: miroirLigne('flashcards', f.id),
  cours_id: miroirLigne('cours', f.cours_id),
  recto: f.recto, verso: f.verso, order_index: f.order_index,
}));

console.log('Source Major Odontologie :');
console.log(`  ${matieresSource.length} matières · ${coursSource.length} cours · ${fichesSource.length} fiches`);
console.log(`  ${seriesSource.length} séries · ${questionsSource.length} questions · ${itemsSource.length} propositions · ${flashSource.length} flashcards`);

// ── 6. Écriture (parents avant enfants) ─────────────────────────────────────
// Les matières racine d'abord : `parent_matiere_id` est une clé étrangère.
await ecrire('matieres', matieresCible.filter((m) => !m.parent_matiere_id));
await ecrire('matieres', matieresCible.filter((m) => m.parent_matiere_id));
await ecrire('cours', coursCible);
await ecrire('fiches', fichesCible, 20);
await ecrire('qcm_series', seriesCible);
await ecrire('qcm_questions', questionsCible, 200);
await ecrire('qcm_items', itemsCible, 200);
await ecrire('flashcards', flashCible);

// ── 7. Purge des lignes miroir orphelines (source supprimée) ────────────────
const coursVivants = coursCible.map((c) => c.id);

async function purger(table, colonne, parents, attendus) {
  if (parents.length === 0) return 0;
  const existants = await lireParParents(table, 'id', colonne, parents, 40);
  const trop = existants.map((r) => r.id).filter((id) => !attendus.has(id));
  await supprimer(table, trop);
  return trop.length;
}

const purges = {
  qcm_items: await purger('qcm_items', 'question_id', questionsCible.map((q) => q.id), new Set(itemsCible.map((i) => i.id))),
  qcm_questions: await purger('qcm_questions', 'serie_id', seriesCible.map((s) => s.id), new Set(questionsCible.map((q) => q.id))),
  qcm_series: await purger('qcm_series', 'cours_id', coursVivants, new Set(seriesCible.map((s) => s.id))),
  fiches: await purger('fiches', 'cours_id', coursVivants, new Set(fichesCible.map((f) => f.id))),
  flashcards: await purger('flashcards', 'cours_id', coursVivants, new Set(flashCible.map((f) => f.id))),
};
const matiereCibleIds = matieresCible.map((m) => m.id);
const coursMiroir = await lireTout('cours', 'id', (q) => q.in('matiere_id', matiereCibleIds));
const attendus = new Set(coursVivants);
const coursOrphelins = coursMiroir.map((c) => c.id).filter((id) => !attendus.has(id));
await supprimer('cours', coursOrphelins);
purges.cours = coursOrphelins.length;

const racine = matieresCible.find((m) => !m.parent_matiere_id);
console.log(`\nCollège cible : ${racine.id} — « ${racine.nom} » (semestre ${CIBLE_SEMESTRE})`);
console.log('Sous-collèges :', matieresCible.filter((m) => m.parent_matiere_id).map((m) => m.nom).join(' · '));
const orphelins = Object.entries(purges).filter(([, n]) => n > 0);
console.log('Orphelins supprimés :', orphelins.length ? orphelins.map(([t, n]) => `${t} ${n}`).join(', ') : 'aucun');
console.log(DRY ? '\n--dry-run : aucune écriture effectuée.' : '\nDuplication terminée.');

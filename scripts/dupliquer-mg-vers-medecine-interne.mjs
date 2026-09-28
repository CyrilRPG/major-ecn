/**
 * Duplique 12 items de Médecine générale dans le collège « Médecine interne
 * polyvalente » (`col-medecine-interne`), à la demande de Major ECN
 * (28/09/2026) : un élève de Médecine interne doit les voir comme des items de
 * SON collège, sans recevoir le moindre accès à la Médecine générale.
 *
 * D'où une copie physique plutôt qu'un accès accordé : ouvrir les cours MG
 * d'origine aurait exigé d'ajouter des collèges MG au périmètre des élèves
 * (`accessible_cours_ids()` et `canAccessCours()` exigent le collège du cours
 * dans `permission_scope.colleges`), donc un second collège dans leur
 * navigateur, les épreuves blanches, l'agenda et le Parcours du Major de MG.
 * Même mécanique que la copie MIR (scripts/dupliquer-medecine-urgence-vers-mir.mjs).
 *
 * Copié par item : le cours (`access_type = 'all'` : visible de tout élève du
 * collège), la fiche, les séries QCM / DP / QROC, leurs questions et
 * propositions, les flashcards. Les séries « DP Gériatrie n » / « DP QROC
 * Gériatrie n » sont EXCLUES : elles sont réservées aux élèves de Gériatrie
 * (bonus MG) et invisibles pour un élève de Médecine générale lui-même.
 * Les PDF et images restent dans le Storage partagé (mêmes `storage_path` /
 * `images`). Aucun de ces items ne porte de vidéo.
 *
 * `mg_series` est recalculé par le trigger de `qcm_series` d'après le collège
 * du cours : il vaut `false` sur la copie, comme sur toute série de Médecine
 * interne. La restriction par voie (interne = QCM, externe = QROC) s'applique
 * normalement.
 *
 * Facturation : chaque copie porte `linked_to_cours_id = cours MG source` ;
 * `admin_facturation_lines()` dédoublonne sur `coalesce(linked_to_cours_id, id)`,
 * le contenu n'est donc pas facturé deux fois.
 *
 * Le collège est trié sur `order_index` et l'est alphabétiquement
 * (« Replays - Révisions » en tête) : il est renuméroté d'un bloc après la copie.
 *
 * Identifiants UUID v5 dérivés de la source : le script est idempotent et
 * rejouable pour resynchroniser les copies après une évolution du contenu MG.
 * Les lignes miroir dont la source a disparu sont supprimées.
 *
 * Usage : node scripts/dupliquer-mg-vers-medecine-interne.mjs [--dry-run]
 */
import { createHash } from 'node:crypto';
import { config as dotenv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv({ path: '.env.local', quiet: true });

const DRY = process.argv.includes('--dry-run');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants');
const db = createClient(url, key, { auth: { persistSession: false } });

const CIBLE_MATIERE = 'col-medecine-interne';
const REPLAYS_REVISIONS_TITRE = 'Replays - Révisions';
/** Namespace UUID v5 propre à cette duplication : fige la correspondance source → copie. */
const NAMESPACE = '5b0e7c43-9d2a-4f61-8e3b-a7c19d04f2e8';

/** Cours MG source (titre attendu, contrôlé avant toute écriture). */
const SOURCES = [
  ['0431ecdf-a9eb-4bbd-9476-bf3e5f1550da', "Anomalies du bilan de l'eau et du sodium"],
  ['a6466920-bc1c-4754-b2e2-1cd8e9cea80e', 'Anomalies du bilan du potassium'],
  ['1c9f543e-6dd8-4046-a4fd-10949dbe9747', "Désordres de l'équilibre acide-base"],
  ['821bdf2f-3b32-426c-a8bc-4246a2db3a13', 'Hémogramme et interprétation'],
  ['16f9a1ad-5f83-4d9c-abf2-a80422d3bbd9', 'Prescription et surveillance des anticoagulants'],
  ['c184ae08-4c1c-411b-8600-81868042b0c2', 'Arthropathies microcristallines et anti-inflammatoires'],
  ['9e315bac-6318-4046-8aea-0f8d6f3a87e1', 'Anomalies du bilan hépatique et ictère'],
  ['84d6f063-45c4-4a92-ac73-5a823d547e8c', 'Insuffisance rénale aiguë'],
  ['b192d81d-baaa-44ad-91f6-e012f2ed6997', 'Néphropathies glomérulaires'],
  ['9ca3ab98-8248-4df8-afc5-141ce74fe747', 'Syndrome de Cushing et insuffisance surrénale'],
  ['ba8fc71a-c3eb-42d6-a3e1-9e9ef4de8b32', 'Antibiotiques'],
  ['6f9d18b9-a3e6-4368-9502-007277257776', 'Vaccinations'],
];

function uuidv5(nom) {
  const ns = Buffer.from(NAMESPACE.replace(/-/g, ''), 'hex');
  const h = Buffer.from(createHash('sha1').update(Buffer.concat([ns, Buffer.from(nom, 'utf8')])).digest().subarray(0, 16));
  h[6] = (h[6] & 0x0f) | 0x50;
  h[8] = (h[8] & 0x3f) | 0x80;
  const x = h.toString('hex');
  return `${x.slice(0, 8)}-${x.slice(8, 12)}-${x.slice(12, 16)}-${x.slice(16, 20)}-${x.slice(20)}`;
}
const miroir = (table, id) => uuidv5(`${table}:${id}`);

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
    lignes.push(...await lireTout(table, colonnes, (q) => q.in(colonne, parents.slice(i, i + pas))));
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

// ── 1. Cours source : contrôle des titres ───────────────────────────────────
const coursIds = SOURCES.map(([id]) => id);
const coursSource = await lireTout(
  'cours',
  'id, matiere_id, titre, description, access_type, importance, hidden_blocks',
  (q) => q.in('id', coursIds),
);
for (const [id, titre] of SOURCES) {
  const c = coursSource.find((x) => x.id === id);
  if (!c) throw new Error(`cours source ${id} (« ${titre} ») introuvable`);
  if (c.titre !== titre) throw new Error(`cours ${id} : titre « ${c.titre} » ≠ « ${titre} » attendu`);
  if (c.matiere_id !== 'col-medecine-generale' && !c.matiere_id.startsWith('col-mg-')) {
    throw new Error(`cours ${id} n'appartient pas à la Médecine générale (${c.matiere_id})`);
  }
}

const existants = await lireTout('cours', 'id, titre, order_index', (q) => q.eq('matiere_id', CIBLE_MATIERE));
const copiesAttendues = new Set(coursIds.map((id) => miroir('cours', id)));
for (const c of coursSource) {
  const homonyme = existants.find((e) => e.titre === c.titre && !copiesAttendues.has(e.id));
  if (homonyme) throw new Error(`« ${c.titre} » existe déjà dans ${CIBLE_MATIERE} (${homonyme.id})`);
}

const coursCible = coursSource.map((c) => ({
  id: miroir('cours', c.id),
  matiere_id: CIBLE_MATIERE,
  titre: c.titre,
  description: c.description,
  // Provisoire : le collège est renuméroté plus bas.
  order_index: existants.find((e) => e.id === miroir('cours', c.id))?.order_index ?? 9999,
  access_type: 'all',
  importance: c.importance,
  hidden_blocks: c.hidden_blocks,
  // Dédoublonnage de facturation (cf. en-tête).
  linked_to_cours_id: c.id,
}));

// ── 2. Fiches (une par requête : content_html peut peser plusieurs Mo) ──────
const fichesSource = [];
for (const id of coursIds) {
  fichesSource.push(...await lireTout(
    'fiches',
    'id, cours_id, titre, storage_path, pages, extracted_text, content_json, content_format, content_html, order_index',
    (q) => q.eq('cours_id', id),
  ));
}
const fichesCible = fichesSource.map((f) => ({
  id: miroir('fiches', f.id),
  cours_id: miroir('cours', f.cours_id),
  titre: f.titre,
  storage_path: f.storage_path,
  pages: f.pages,
  extracted_text: f.extracted_text,
  content_json: f.content_json,
  content_format: f.content_format,
  content_html: f.content_html,
  order_index: f.order_index,
}));

// ── 3. Séries (hors « Gériatrie ») → questions → propositions ───────────────
const seriesToutes = await lireParParents(
  'qcm_series',
  'id, cours_id, type, label, annee, order_index, duration_minutes, vignette, kind, is_revisions, allowed_voies, allowed_offers',
  'cours_id', coursIds,
);
const estGeriatrie = (s) => /g[eé]riatrie/i.test(s.label ?? '');
const seriesGeriatrie = seriesToutes.filter(estGeriatrie);
const seriesSource = seriesToutes.filter((s) => !estGeriatrie(s));
const seriesCible = seriesSource.map((s) => ({
  id: miroir('qcm_series', s.id),
  cours_id: miroir('cours', s.cours_id),
  type: s.type, label: s.label, annee: s.annee, order_index: s.order_index,
  duration_minutes: s.duration_minutes, vignette: s.vignette, kind: s.kind,
  is_revisions: s.is_revisions,
  // `[]` masquerait la série à tous les élèves ; seul `null` veut dire « toutes voies ».
  allowed_voies: s.allowed_voies?.length ? s.allowed_voies : null,
  allowed_offers: s.allowed_offers,
}));

const questionsSource = await lireParParents(
  'qcm_questions',
  'id, serie_id, enonce, order_index, format, reponse_attendue, correction_generale, images, commentaire_enseignant',
  'serie_id', seriesSource.map((s) => s.id),
);
const questionsCible = questionsSource.map((q) => ({
  id: miroir('qcm_questions', q.id),
  serie_id: miroir('qcm_series', q.serie_id),
  enonce: q.enonce, order_index: q.order_index, format: q.format,
  reponse_attendue: q.reponse_attendue, correction_generale: q.correction_generale,
  images: q.images, commentaire_enseignant: q.commentaire_enseignant,
}));

const itemsSource = await lireParParents(
  'qcm_items',
  'id, question_id, lettre, enonce, is_correct, justification, images',
  'question_id', questionsSource.map((q) => q.id),
);
const itemsCible = itemsSource.map((i) => ({
  id: miroir('qcm_items', i.id),
  question_id: miroir('qcm_questions', i.question_id),
  lettre: i.lettre, enonce: i.enonce, is_correct: i.is_correct,
  justification: i.justification, images: i.images,
}));

// ── 4. Flashcards ───────────────────────────────────────────────────────────
const flashSource = await lireParParents('flashcards', 'id, cours_id, recto, verso, order_index', 'cours_id', coursIds, 20);
const flashCible = flashSource.map((f) => ({
  id: miroir('flashcards', f.id),
  cours_id: miroir('cours', f.cours_id),
  recto: f.recto, verso: f.verso, order_index: f.order_index,
}));

// ── 5. Effectifs ────────────────────────────────────────────────────────────
console.log(`Copie de ${coursSource.length} items de Médecine générale → ${CIBLE_MATIERE}`);
for (const [table, n] of [
  ['cours', coursCible.length], ['fiches', fichesCible.length], ['qcm_series', seriesCible.length],
  ['qcm_questions', questionsCible.length], ['qcm_items', itemsCible.length], ['flashcards', flashCible.length],
]) console.log(`  ${table.padEnd(14)} ${String(n).padStart(6)}`);
console.log(`  (séries « Gériatrie » exclues : ${seriesGeriatrie.length})`);
const dejaLa = existants.filter((e) => copiesAttendues.has(e.id)).length;
console.log(`  copies déjà présentes avant ce passage : ${dejaLa}/${coursCible.length}`);

// ── 6. Écriture (parents avant enfants) ─────────────────────────────────────
await ecrire('cours', coursCible);
await ecrire('fiches', fichesCible, 1);
await ecrire('qcm_series', seriesCible);
await ecrire('qcm_questions', questionsCible, 200);
await ecrire('qcm_items', itemsCible, 200);
await ecrire('flashcards', flashCible);

// ── 7. Purge des lignes miroir orphelines ───────────────────────────────────
async function purger(table, colonne, parents, attendus) {
  if (DRY || parents.length === 0) return 0;
  const lignes = await lireParParents(table, 'id', colonne, parents, 40);
  const trop = lignes.map((r) => r.id).filter((id) => !attendus.has(id));
  await supprimer(table, trop);
  return trop.length;
}
const coursCibleIds = coursCible.map((c) => c.id);
const purges = {
  qcm_items: await purger('qcm_items', 'question_id', questionsCible.map((q) => q.id), new Set(itemsCible.map((i) => i.id))),
  qcm_questions: await purger('qcm_questions', 'serie_id', seriesCible.map((s) => s.id), new Set(questionsCible.map((q) => q.id))),
  qcm_series: await purger('qcm_series', 'cours_id', coursCibleIds, new Set(seriesCible.map((s) => s.id))),
  fiches: await purger('fiches', 'cours_id', coursCibleIds, new Set(fichesCible.map((f) => f.id))),
  flashcards: await purger('flashcards', 'cours_id', coursCibleIds, new Set(flashCible.map((f) => f.id))),
};
const orphelins = Object.entries(purges).filter(([, n]) => n > 0);
console.log('Orphelins supprimés :', orphelins.length ? orphelins.map(([t, n]) => `${t} ${n}`).join(', ') : 'aucun');

// ── 8. Renumérotation alphabétique du collège ───────────────────────────────
const college = [
  ...existants.filter((e) => !copiesAttendues.has(e.id)),
  ...coursCible.map((c) => ({ id: c.id, titre: c.titre, order_index: c.order_index })),
];
const cle = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[œŒ]/g, 'oe').toLowerCase();
college.sort((a, b) => {
  if (a.titre === REPLAYS_REVISIONS_TITRE) return -1;
  if (b.titre === REPLAYS_REVISIONS_TITRE) return 1;
  return cle(a.titre).localeCompare(cle(b.titre), 'fr');
});
const renumeros = college.map((c, i) => ({ ...c, nouveau: i })).filter((c) => c.order_index !== c.nouveau);
if (!DRY) {
  for (const c of renumeros) {
    const { error } = await db.from('cours').update({ order_index: c.nouveau }).eq('id', c.id);
    if (error) throw new Error(`renumérotation ${c.id}: ${error.message}`);
  }
}
console.log(`Renumérotation : ${renumeros.length} cours déplacés sur ${college.length}`);
for (const [i, c] of college.entries()) console.log(`  ${String(i).padStart(2)} ${copiesAttendues.has(c.id) ? '+' : ' '} ${c.titre}`);

console.log(DRY ? '\n--dry-run : aucune écriture effectuée.' : '\nDuplication terminée.');

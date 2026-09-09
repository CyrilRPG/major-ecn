/**
 * Duplique le collège `col-mir` (commercialisé « Médecine d’urgence », semestre
 * `edn-prog`) dans un collège « Médecine intensive et réanimation »
 * (`col-medecine-intensive-reanimation`), même semestre, vendu comme une
 * spécialité distincte au format QCM uniquement (voie interne imposée).
 *
 * Copié : la matière (et ses éventuels sous-collèges), les cours, les fiches,
 * les séries QCM (les séries QROC — `kind = 'qroc'` OU `type = 'qroc'` — sont
 * EXCLUES : la spécialité est vendue en QCM seulement), les questions, les
 * propositions et les flashcards. Les PDF et images restent dans le Storage
 * partagé : `storage_path` et `images` pointent sur les mêmes objets.
 *
 * NON copié : `videos` et `video_supports` (décision explicite).
 *
 * Facturation : chaque cours copié reçoit `linked_to_cours_id = id du cours
 * source`. La RPC `admin_facturation_lines()` dédoublonne les cours sur
 * `coalesce(linked_to_cours_id, id)` : la copie MIR ne doit PAS être facturée
 * une seconde fois au professeur (décision explicite de Cyril, 10/09/2026).
 * C'est le seul effet de cette colonne — son résolveur applicatif est du code
 * mort (cf. mémoire « linked_to_cours_id »).
 *
 * Les identifiants des copies sont des UUID v5 dérivés de la source : le script
 * est idempotent et rejouable pour resynchroniser le collège après une
 * évolution du contenu de Médecine d'urgence. Les lignes miroir dont la source
 * a disparu (ou est devenue QROC) sont supprimées.
 *
 * Usage : node --env-file=.env.local scripts/dupliquer-medecine-urgence-vers-mir.mjs [--dry-run]
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

const SOURCE_MATIERE = 'col-mir';
const CIBLE_MATIERE = 'col-medecine-intensive-reanimation';
const CIBLE_NOM = 'Médecine intensive et réanimation';
/** Namespace UUID v5 propre à cette duplication : fige la correspondance source → copie. */
const NAMESPACE = 'c1d7b2e9-5a4f-4e83-9b6d-0f2a7c8e3d15';

function uuidv5(nom) {
  const ns = Buffer.from(NAMESPACE.replace(/-/g, ''), 'hex');
  const h = Buffer.from(createHash('sha1').update(Buffer.concat([ns, Buffer.from(nom, 'utf8')])).digest().subarray(0, 16));
  h[6] = (h[6] & 0x0f) | 0x50;
  h[8] = (h[8] & 0x3f) | 0x80;
  const x = h.toString('hex');
  return `${x.slice(0, 8)}-${x.slice(8, 12)}-${x.slice(12, 16)}-${x.slice(16, 20)}-${x.slice(20)}`;
}
/** Les matières portent un id texte : la racine est fixée, les sous-collèges
 *  éventuels gardent un slug lisible dérivé du leur. */
const miroirMatiere = (id) => (id === SOURCE_MATIERE ? CIBLE_MATIERE : `${CIBLE_MATIERE}-${id.replace(/^col-(mir-)?/, '')}`);
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

// ── 1. Matières source : la racine + ses éventuels sous-collèges ────────────
const COLONNES_MATIERE = 'id, nom, semestre_id, icon_key, color_hex, order_index, parent_matiere_id, min_offer, access_type';
const { data: racineSource, error: eRacine } = await db.from('matieres').select(COLONNES_MATIERE).eq('id', SOURCE_MATIERE).maybeSingle();
if (eRacine) throw new Error(`matieres: ${eRacine.message}`);
if (!racineSource) throw new Error(`matière source ${SOURCE_MATIERE} introuvable`);
const enfantsSource = await lireTout('matieres', COLONNES_MATIERE, (q) => q.eq('parent_matiere_id', SOURCE_MATIERE));
const matieresSource = [racineSource, ...enfantsSource];

// Rang de la copie : juste après la source, parmi les collèges de 1er niveau du
// même semestre. On ne décale pas les voisins (aucune écriture hors périmètre) :
// une éventuelle égalité de rang est signalée ci-dessous.
const freres = await lireTout(
  'matieres',
  'id, nom, order_index',
  (q) => q.eq('semestre_id', racineSource.semestre_id).is('parent_matiere_id', null).neq('id', CIBLE_MATIERE),
);
const CIBLE_ORDER_INDEX = racineSource.order_index + 1;
const collisions = freres.filter((m) => m.order_index === CIBLE_ORDER_INDEX);

const matieresCible = matieresSource.map((m) => ({
  id: miroirMatiere(m.id),
  semestre_id: m.semestre_id,
  nom: m.parent_matiere_id ? m.nom : CIBLE_NOM,
  icon_key: m.icon_key,
  color_hex: m.color_hex,
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
  // Facturation : `admin_facturation_lines()` dédoublonne sur
  // `coalesce(linked_to_cours_id, id)`. En pointant la copie vers son cours
  // source, le contenu MIR n'est facturé qu'une fois — au titre du cours de
  // Médecine d'urgence dont il est le miroir (décision de Cyril, 10/09/2026).
  linked_to_cours_id: c.id,
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
  // Même objet Storage que la source : aucun PDF n'est dupliqué.
  storage_path: f.storage_path,
  pages: f.pages,
  extracted_text: f.extracted_text,
  content_json: f.content_json,
  content_format: f.content_format,
  content_html: f.content_html,
  order_index: f.order_index,
}));

// ── 4. Séries QCM (hors QROC) → questions → propositions ────────────────────
const seriesToutes = await lireParParents(
  'qcm_series',
  'id, cours_id, type, label, annee, order_index, duration_minutes, vignette, kind, mg_series, is_revisions, allowed_voies, allowed_offers',
  'cours_id', coursIds,
);
const estQroc = (s) => s.kind === 'qroc' || s.type === 'qroc';
const seriesQroc = seriesToutes.filter(estQroc);
const seriesSource = seriesToutes.filter((s) => !estQroc(s));
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
  // Mêmes objets Storage que la source (index `k` des noms de fichiers conservé).
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

// ── 6. Effectifs par table ──────────────────────────────────────────────────
console.log(`Source ${SOURCE_MATIERE} — « ${racineSource.nom} » (semestre ${racineSource.semestre_id}, rang ${racineSource.order_index}) :`);
const effectifs = [
  ['matieres', matieresSource.length, matieresCible.length],
  ['cours', coursSource.length, coursCible.length],
  ['fiches', fichesSource.length, fichesCible.length],
  ['qcm_series', seriesToutes.length, seriesCible.length],
  ['qcm_questions', questionsSource.length, questionsCible.length],
  ['qcm_items', itemsSource.length, itemsCible.length],
  ['flashcards', flashSource.length, flashCible.length],
];
for (const [table, src, dst] of effectifs) {
  console.log(`  ${table.padEnd(14)} source ${String(src).padStart(6)}  →  copie ${String(dst).padStart(6)}`);
}
console.log(`  (séries QROC exclues : ${seriesQroc.length} ; videos / video_supports : non copiés)`);
if (enfantsSource.length > 0) console.log('  Sous-collèges :', enfantsSource.map((m) => `${m.id} → ${miroirMatiere(m.id)}`).join(' · '));

// ── 7. Écriture (parents avant enfants) ─────────────────────────────────────
await ecrire('matieres', matieresCible.filter((m) => !m.parent_matiere_id));
await ecrire('matieres', matieresCible.filter((m) => m.parent_matiere_id));
await ecrire('cours', coursCible);
await ecrire('fiches', fichesCible, 20);
await ecrire('qcm_series', seriesCible);
await ecrire('qcm_questions', questionsCible, 200);
await ecrire('qcm_items', itemsCible, 200);
await ecrire('flashcards', flashCible);

// ── 8. Purge des lignes miroir orphelines (source supprimée ou passée en QROC)
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

console.log(`\nCollège cible : ${CIBLE_MATIERE} — « ${CIBLE_NOM} » (semestre ${racineSource.semestre_id}, rang ${CIBLE_ORDER_INDEX})`);
console.log(`Déjà en base avant ce passage : ${coursMiroir.length} cours miroir`);
if (collisions.length > 0) {
  console.log(`Attention : rang ${CIBLE_ORDER_INDEX} déjà occupé par ${collisions.map((m) => `${m.id} (« ${m.nom} »)`).join(', ')} — ordre d'affichage à arbitrer.`);
}
const orphelins = Object.entries(purges).filter(([, n]) => n > 0);
console.log('Orphelins supprimés :', orphelins.length ? orphelins.map(([t, n]) => `${t} ${n}`).join(', ') : 'aucun');
console.log(DRY ? '\n--dry-run : aucune écriture effectuée.' : '\nDuplication terminée.');

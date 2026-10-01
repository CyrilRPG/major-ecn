/**
 * Offre Découverte par spécialité (01/10/2026, demande de Cyril) : un item
 * découverte pour la Pédiatrie, la Gynécologie-obstétrique et la Médecine
 * d'urgence, sur le modèle de l'item « Pneumologie » du collège
 * `col-decouverte` (qui reste celui de la Médecine générale et de toute autre
 * spécialité).
 *
 * Chaque item est une COPIE PHYSIQUE de contenus existants, sans aucune
 * réécriture :
 *  - la fiche de cours de l'item source (même ligne `fiches` : même PDF du
 *    Storage, même HTML, donc même rendu) ;
 *  - voie interne : une série « QCM — Découverte · … » de 5 QCM isolés choisis
 *    dans les séries de l'item source + 1 dossier progressif QCM (5 questions)
 *    = 10 questions ;
 *  - voie externe : une série « QROC — Découverte · … » de 5 QROC de cours + 1
 *    dossier progressif QROC (5 questions) = 10 questions (symétrique de la voie
 *    interne, consigne de Cyril : « 10 QROC si externe ») ;
 *  - 10 flashcards de l'item source.
 * Propositions, corrections, justifications, réponses attendues et images sont
 * recopiées telles quelles. La voie est portée par `kind` (qcm/dp = interne,
 * qroc = externe), `allowed_voies` reste à null comme sur la Pneumologie.
 *
 * La Gynécologie-obstétrique (`col-gynecologie`) ne porte AUCUNE série QROC :
 * les QROC et le DP QROC viennent de l'item « Grossesse extra-utérine » de
 * Médecine générale (`col-mg-gynecologie`), même sujet.
 *
 * Visibilité : un item n'est ouvert qu'aux comptes dont
 * `permission_scope.decouverte_cours` le liste (cf. src/lib/decouverte/
 * items-specialite.ts et la migration 20261001120000) ; les cours sont posés en
 * `access_type = 'specific'` pour rester invisibles à tout autre compte qui
 * porte le collège Découverte (anciens découverte devenus payants…).
 *
 * Facturation : `linked_to_cours_id` = item source (la fiche n'est pas facturée
 * deux fois, cf. admin_facturation_lines).
 *
 * Identifiants UUID v5 dérivés des sources : rejouable (resynchronisation), les
 * lignes miroir disparues de la sélection sont purgées.
 *
 * Usage : node scripts/decouverte-items-specialite.mjs [--dry-run]
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

const CIBLE_MATIERE = 'col-decouverte';
/** Namespace UUID v5 propre à cette copie : fige la correspondance source → copie. */
const NAMESPACE = 'c7d1f0a2-5e3b-4b8c-9a61-2f4e8d0b7c35';

/**
 * Sélection. Les questions sont désignées par (série source, order_index) et
 * les flashcards par leur order_index dans l'item source.
 */
const ITEMS = [
  {
    cle: 'pediatrie',
    source: { id: 'b14763c3-b696-4a34-9d2b-049bab942710', matiere: 'col-pediatrie', titre: 'Méningites et méningo-encéphalites' },
    titre: 'Pédiatrie · Méningites et méningo-encéphalites',
    description: "Aperçu pédagogique d'un item EVC de Pédiatrie : fiche de cours, QCM ou QROC corrigés selon votre voie, dossier progressif et flashcards.",
    qcm: {
      label: 'QCM — Découverte · Méningites de l’enfant',
      questions: [
        ['05cdbd81-1bb7-467f-a51c-66122cfadf3f', 2], // signes cliniques du nourrisson
        ['a51991aa-6015-4ba8-800b-0cd2c8b3e904', 2], // contre-indications de la PL
        ['16bdefce-dc30-44fe-9ce4-274f81898f5f', 2], // LCS bactérien vs viral
        ['0f5143ed-01e6-44a3-ac2a-fde9f41d07a8', 1], // principes de l'antibiothérapie
        ['58e508a6-edbd-4110-9675-9aaac26cf4e3', 2], // antibioprophylaxie des contacts
      ],
    },
    dp: 'cd87ee6c-f49b-4487-81ba-c1ad5fcaacf5', // DP 2 · Fièvre brutale, céphalées et purpura pétéchial (3 ans)
    qroc: {
      label: 'QROC — Découverte · Méningites de l’enfant',
      questions: [
        ['7d78f6fa-0f03-4ce0-b579-959abebc29ad', 2],
        ['91066a4a-0025-4ba6-a50e-b1b1045324b2', 1],
        ['91066a4a-0025-4ba6-a50e-b1b1045324b2', 3],
        ['9ac868cd-66d1-4872-928c-cdb251183ac5', 1],
        ['f5143f09-15f2-4681-ad12-42a4c0b8fc0c', 3],
      ],
    },
    dpQroc: '61ed4b7c-3bc9-42c9-afe9-0cfb115e3c8d', // DP QROC 3 · Fièvre élevée depuis 12 heures (8 mois)
    flashcards: { cours: 'b14763c3-b696-4a34-9d2b-049bab942710', ordres: [8, 15, 21, 31, 38, 46, 51, 59, 80, 87] },
  },
  {
    cle: 'gynecologie',
    source: { id: '98c268a0-eef5-41dc-897e-b9ca5856e1c9', matiere: 'col-gynecologie', titre: 'Item 25 Grossesse extra-utérine' },
    qrocSource: { id: 'c43a37c6-9287-4277-b798-ef4407bf80ba', matiere: 'col-mg-gynecologie', titre: 'Grossesse extra-utérine' },
    titre: 'Gynécologie-obstétrique · Grossesse extra-utérine',
    description: "Aperçu pédagogique d'un item EVC de Gynécologie-obstétrique : fiche de cours, QCM ou QROC corrigés selon votre voie, dossier progressif et flashcards.",
    qcm: {
      label: 'QCM — Découverte · Grossesse extra-utérine',
      questions: [
        ['4c29b05c-af10-405d-b1c1-93a60dad9dac', 1], // circonstances évocatrices
        ['e26b2f17-725a-4fe9-aac7-3d2fff549e88', 2], // vacuité utérine
        ['999baf3d-4cc3-42a3-b8af-3aed909ca46d', 2], // cinétique des β-hCG
        ['71250703-c559-40b8-ab6d-e7d2b2b5cc23', 1], // critères de gravité, urgence chirurgicale
        ['a7a3a670-668b-4e9c-b3c2-e04c051daeaa', 1], // méthotrexate : protocole et indications
      ],
    },
    dp: '69260db8-09b7-4f34-bce5-2cbe2deaa79c', // DP 1 · Douleurs abdominales et métrorragies (23 ans)
    qroc: {
      label: 'QROC — Découverte · Grossesse extra-utérine',
      questions: [
        ['50663978-3750-4d1b-a2eb-40206734bdd9', 1],
        ['50663978-3750-4d1b-a2eb-40206734bdd9', 3],
        ['50663978-3750-4d1b-a2eb-40206734bdd9', 5],
        ['fa17fc9c-9a38-4794-838a-45ba0ddcd75c', 2],
        ['fa17fc9c-9a38-4794-838a-45ba0ddcd75c', 4],
      ],
    },
    dpQroc: '3e369742-e174-473e-963b-e2660b45c0bf', // DP QROC 1 · GEU diagnostic (MG)
    flashcards: { cours: '98c268a0-eef5-41dc-897e-b9ca5856e1c9', ordres: [1, 26, 28, 34, 40, 44, 57, 68, 85, 109] },
  },
  {
    cle: 'urgence',
    source: { id: 'a6cb785d-d513-4c54-a5b5-34f8c9084c99', matiere: 'col-mir', titre: 'Arrêt cardiaque' },
    titre: 'Médecine d’urgence · Arrêt cardiaque',
    description: "Aperçu pédagogique d'un item EVC de Médecine d'urgence : fiche de cours, QCM ou QROC corrigés selon votre voie, dossier progressif et flashcards.",
    qcm: {
      label: 'QCM — Découverte · Arrêt cardiaque',
      questions: [
        ['0382fbb3-dea0-4f4c-bb5d-24e14955334b', 1], // diagnostic
        ['ceca914d-2043-4537-ab49-4d4936545594', 1], // massage cardiaque externe
        ['7535f514-3b6a-4888-bed8-3326451f177d', 1], // rythmes choquables
        ['58117791-0804-494a-adbc-eb0cf43bd5c4', 1], // adrénaline, rythme choquable
        ['feb907ec-17c7-49e5-80d0-22ec77e10bde', 3], // DEM à QRS fins
      ],
    },
    dp: '428a6053-171b-4f92-bcff-f55adfa5be1c', // DP 1 · Douleur thoracique pendant un jogging (58 ans)
    qroc: {
      label: 'QROC — Découverte · Arrêt cardiaque',
      questions: [
        ['45696327-1e5e-42f0-8a4f-2668a1362575', 1],
        ['45696327-1e5e-42f0-8a4f-2668a1362575', 4],
        ['a07e2633-875a-4ff5-aaf5-33d53e3cec70', 2],
        ['afff7cbc-0929-4b9f-b58b-02e568903a97', 2],
        ['0ee7e70f-eeb0-4824-9561-b26c8c2473f9', 3],
      ],
    },
    dpQroc: 'aac33e38-5b36-49bb-a086-21fb9d7e0446', // DP QROC 4 · Arrêt cardiaque médicalisé
    flashcards: { cours: 'a6cb785d-d513-4c54-a5b5-34f8c9084c99', ordres: [1, 6, 13, 14, 23, 43, 45, 51, 57, 69] },
  },
];

function uuidv5(nom) {
  const ns = Buffer.from(NAMESPACE.replace(/-/g, ''), 'hex');
  const h = Buffer.from(createHash('sha1').update(Buffer.concat([ns, Buffer.from(nom, 'utf8')])).digest().subarray(0, 16));
  h[6] = (h[6] & 0x0f) | 0x50;
  h[8] = (h[8] & 0x3f) | 0x80;
  const x = h.toString('hex');
  return `${x.slice(0, 8)}-${x.slice(8, 12)}-${x.slice(12, 16)}-${x.slice(16, 20)}-${x.slice(20)}`;
}
/** Identifiant de la copie : propre à l'item découverte ET à la ligne source. */
const miroir = (cle, table, id) => uuidv5(`${cle}:${table}:${id}`);

async function un(table, colonnes, filtre) {
  const { data, error } = await filtre(db.from(table).select(colonnes));
  if (error) throw new Error(`${table}: ${error.message}`);
  return data;
}

async function ecrire(table, lignes) {
  if (DRY || lignes.length === 0) return;
  const { error } = await db.from(table).upsert(lignes, { onConflict: 'id' });
  if (error) throw new Error(`${table} (upsert): ${error.message}`);
}

async function supprimer(table, ids) {
  if (DRY || ids.length === 0) return;
  const { error } = await db.from(table).delete().in('id', ids);
  if (error) throw new Error(`${table} (delete): ${error.message}`);
}

const COLS_SERIE = 'id, cours_id, type, label, annee, order_index, duration_minutes, vignette, kind, is_revisions, allowed_voies, allowed_offers';
const COLS_Q = 'id, serie_id, enonce, order_index, format, reponse_attendue, correction_generale, images, commentaire_enseignant';
const COLS_I = 'id, question_id, lettre, enonce, is_correct, justification, images';

async function contrôlerCours({ id, matiere, titre }) {
  const [c] = await un('cours', 'id, matiere_id, titre, importance, hidden_blocks', (q) => q.eq('id', id));
  if (!c) throw new Error(`cours source ${id} introuvable`);
  if (c.titre !== titre || c.matiere_id !== matiere) {
    throw new Error(`cours ${id} : « ${c.titre} » (${c.matiere_id}) ≠ « ${titre} » (${matiere}) attendu`);
  }
  return c;
}

/** Copie des questions désignées (et de leurs propositions) dans `serieCible`. */
async function copierQuestions(cle, serieCible, designations, coursPermis) {
  const questions = [];
  const items = [];
  for (const [i, [serieId, ordre]] of designations.entries()) {
    const [serie] = await un('qcm_series', 'id, cours_id, kind', (q) => q.eq('id', serieId));
    if (!serie || !coursPermis.includes(serie.cours_id)) throw new Error(`série ${serieId} hors des items sources`);
    const qs = await un('qcm_questions', COLS_Q, (q) => q.eq('serie_id', serieId).eq('order_index', ordre));
    if (qs.length !== 1) throw new Error(`série ${serieId} : ${qs.length} question(s) d'ordre ${ordre}`);
    const src = qs[0];
    const qId = miroir(cle, 'qcm_questions', src.id);
    questions.push({
      id: qId, serie_id: serieCible, enonce: src.enonce, order_index: i + 1, format: src.format,
      reponse_attendue: src.reponse_attendue, correction_generale: src.correction_generale,
      images: src.images, commentaire_enseignant: src.commentaire_enseignant,
    });
    const its = await un('qcm_items', COLS_I, (q) => q.eq('question_id', src.id));
    for (const it of its) {
      items.push({
        id: miroir(cle, 'qcm_items', it.id), question_id: qId, lettre: it.lettre, enonce: it.enonce,
        is_correct: it.is_correct, justification: it.justification, images: it.images,
      });
    }
  }
  return { questions, items };
}

/** Copie intégrale d'un dossier progressif (série + questions + propositions). */
async function copierDossier(cle, coursCible, serieId, label, orderIndex, coursPermis) {
  const [s] = await un('qcm_series', COLS_SERIE, (q) => q.eq('id', serieId));
  if (!s || !coursPermis.includes(s.cours_id)) throw new Error(`dossier ${serieId} hors des items sources`);
  if (!/^dp/i.test(s.label)) throw new Error(`série ${serieId} (« ${s.label} ») n'est pas un dossier progressif`);
  const id = miroir(cle, 'qcm_series', s.id);
  const serie = {
    id, cours_id: coursCible, type: s.type, label, annee: s.annee, order_index: orderIndex,
    duration_minutes: s.duration_minutes, vignette: s.vignette, kind: s.kind, is_revisions: false,
    allowed_voies: null, allowed_offers: null,
  };
  const qs = await un('qcm_questions', COLS_Q, (q) => q.eq('serie_id', s.id).order('order_index'));
  const questions = qs.map((q) => ({
    id: miroir(cle, 'qcm_questions', q.id), serie_id: id, enonce: q.enonce, order_index: q.order_index,
    format: q.format, reponse_attendue: q.reponse_attendue, correction_generale: q.correction_generale,
    images: q.images, commentaire_enseignant: q.commentaire_enseignant,
  }));
  const items = [];
  for (const q of qs) {
    const its = await un('qcm_items', COLS_I, (r) => r.eq('question_id', q.id));
    for (const it of its) {
      items.push({
        id: miroir(cle, 'qcm_items', it.id), question_id: miroir(cle, 'qcm_questions', q.id), lettre: it.lettre,
        enonce: it.enonce, is_correct: it.is_correct, justification: it.justification, images: it.images,
      });
    }
  }
  return { serie, questions, items };
}

/** « DP 2 · Titre » → « DP 1 · Titre » ; « DP QROC 3 · Titre » → « DP QROC 1 · Titre ». */
const renumeroterDossier = (label) => label.replace(/^(DP(?: QROC)?)\s+\d+\s*·/i, '$1 1 ·');

const bilan = [];
for (const it of ITEMS) {
  const source = await contrôlerCours(it.source);
  const coursPermis = [it.source.id];
  if (it.qrocSource) coursPermis.push((await contrôlerCours(it.qrocSource)).id);

  const coursId = miroir(it.cle, 'cours', source.id);
  const cours = {
    id: coursId, matiere_id: CIBLE_MATIERE, titre: it.titre, description: it.description,
    order_index: 0, access_type: 'specific', importance: source.importance, hidden_blocks: source.hidden_blocks ?? [],
    linked_to_cours_id: source.id,
  };

  // Fiche : une seule ligne par requête (content_html peut peser plusieurs Mo).
  const fichesSrc = await un('fiches', 'id, titre, storage_path, pages, extracted_text, content_json, content_format, content_html, order_index', (q) => q.eq('cours_id', source.id));
  if (fichesSrc.length !== 1) throw new Error(`${it.cle} : ${fichesSrc.length} fiche(s) sur l'item source`);
  const fiches = fichesSrc.map((f) => ({
    id: miroir(it.cle, 'fiches', f.id), cours_id: coursId, titre: f.titre, storage_path: f.storage_path, pages: f.pages,
    extracted_text: f.extracted_text, content_json: f.content_json, content_format: f.content_format,
    content_html: f.content_html, order_index: f.order_index,
  }));

  // Séries : QCM de cours (0), DP (1), QROC de cours (2), DP QROC (3).
  const serieQcmId = miroir(it.cle, 'qcm_series', 'qcm-decouverte');
  const serieQrocId = miroir(it.cle, 'qcm_series', 'qroc-decouverte');
  const qcm = await copierQuestions(it.cle, serieQcmId, it.qcm.questions, coursPermis);
  const qroc = await copierQuestions(it.cle, serieQrocId, it.qroc.questions, coursPermis);
  if (qcm.questions.some((q) => q.format === 'qroc')) throw new Error(`${it.cle} : QROC dans la série QCM`);
  if (qroc.questions.some((q) => q.format !== 'qroc')) throw new Error(`${it.cle} : non-QROC dans la série QROC`);
  const [srcDp] = await un('qcm_series', 'label', (q) => q.eq('id', it.dp));
  const [srcDpQroc] = await un('qcm_series', 'label', (q) => q.eq('id', it.dpQroc));
  const dp = await copierDossier(it.cle, coursId, it.dp, renumeroterDossier(srcDp.label), 1, coursPermis);
  const dpQroc = await copierDossier(it.cle, coursId, it.dpQroc, renumeroterDossier(srcDpQroc.label), 3, coursPermis);
  if (dp.serie.kind !== 'dp') throw new Error(`${it.cle} : le DP n'est pas de kind dp`);
  if (dpQroc.serie.kind !== 'qroc') throw new Error(`${it.cle} : le DP QROC n'est pas de kind qroc`);

  const series = [
    { id: serieQcmId, cours_id: coursId, type: 'qcm', label: it.qcm.label, annee: null, order_index: 0, duration_minutes: null, vignette: null, kind: 'qcm', is_revisions: false, allowed_voies: null, allowed_offers: null },
    dp.serie,
    { id: serieQrocId, cours_id: coursId, type: 'qcm', label: it.qroc.label, annee: null, order_index: 2, duration_minutes: null, vignette: null, kind: 'qroc', is_revisions: false, allowed_voies: null, allowed_offers: null },
    dpQroc.serie,
  ];
  const questions = [...qcm.questions, ...dp.questions, ...qroc.questions, ...dpQroc.questions];
  const items = [...qcm.items, ...dp.items, ...qroc.items, ...dpQroc.items];

  // Flashcards.
  const flashSrc = await un('flashcards', 'id, recto, verso, order_index', (q) => q.eq('cours_id', it.flashcards.cours).in('order_index', it.flashcards.ordres));
  if (flashSrc.length !== it.flashcards.ordres.length) throw new Error(`${it.cle} : ${flashSrc.length} flashcards trouvées sur ${it.flashcards.ordres.length}`);
  flashSrc.sort((a, b) => a.order_index - b.order_index);
  const flashcards = flashSrc.map((f, i) => ({ id: miroir(it.cle, 'flashcards', f.id), cours_id: coursId, recto: f.recto, verso: f.verso, order_index: i + 1 }));
  if (flashcards.some((f) => !f.recto?.trim() || !f.verso?.trim())) throw new Error(`${it.cle} : flashcard vide`);

  // Écriture, parents avant enfants.
  await ecrire('cours', [cours]);
  await ecrire('fiches', fiches);
  await ecrire('qcm_series', series);
  await ecrire('qcm_questions', questions);
  await ecrire('qcm_items', items);
  await ecrire('flashcards', flashcards);

  // Purge des lignes miroir qui ne font plus partie de la sélection.
  if (!DRY) {
    const seriesEnBase = await un('qcm_series', 'id', (q) => q.eq('cours_id', coursId));
    const serieIds = seriesEnBase.map((s) => s.id);
    const attendusQ = new Set(questions.map((q) => q.id));
    const attendusI = new Set(items.map((i) => i.id));
    const qEnBase = await un('qcm_questions', 'id', (q) => q.in('serie_id', serieIds));
    const iEnBase = await un('qcm_items', 'id', (q) => q.in('question_id', qEnBase.map((x) => x.id)));
    await supprimer('qcm_items', iEnBase.map((x) => x.id).filter((id) => !attendusI.has(id)));
    await supprimer('qcm_questions', qEnBase.map((x) => x.id).filter((id) => !attendusQ.has(id)));
    await supprimer('qcm_series', serieIds.filter((id) => !series.some((s) => s.id === id)));
    const fEnBase = await un('flashcards', 'id', (q) => q.eq('cours_id', coursId));
    await supprimer('flashcards', fEnBase.map((x) => x.id).filter((id) => !flashcards.some((f) => f.id === id)));
    const ficheEnBase = await un('fiches', 'id', (q) => q.eq('cours_id', coursId));
    await supprimer('fiches', ficheEnBase.map((x) => x.id).filter((id) => !fiches.some((f) => f.id === id)));
  }

  bilan.push({
    item: it.titre, coursId,
    fiche: `${fiches[0].titre} (${fiches[0].pages} p.)`,
    qcm: qcm.questions.length, dp: dp.questions.length, qroc: qroc.questions.length, dpQroc: dpQroc.questions.length,
    propositions: items.length, flashcards: flashcards.length,
  });
}

console.table(bilan);
console.log(DRY ? '--dry-run : aucune écriture effectuée.' : 'Copie terminée.');

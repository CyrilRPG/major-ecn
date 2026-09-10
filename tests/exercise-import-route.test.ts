/**
 * Orchestration de l'import d'exercices (`exercise-import-pipeline`, module
 * pur extrait de la route `analyse`) — 10/09/2026.
 *
 * Fragilités que ces tests fixent :
 *  - F3 : un lot durablement en échec devient un partiel vide marqué `echec`
 *         et sa plage un écart BLOQUANT « pages X–Y non importées » ; l'import
 *         aboutit ;
 *  - F4 : les erreurs de lots et les avertissements de chaque source sont
 *         reversés dans les avertissements finaux ;
 *  - repère : la vérité lit les ordonnées origine en BAS, les images origine en
 *         HAUT — la conversion est prouvée sur un PDF synthétique lu par les
 *         DEUX modules ;
 *  - plan de relance, verdict, facturation, patch de l'administrateur.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { createCanvas } from '@napi-rs/canvas';
import {
  facturerImportCents, scinder, marquerLotEnEchec, plagesNonImportees, ecartsPagesNonImportees, fusionnerAvertissements,
  planifierRelance, consigneRelance, versRepereHaut, blocsDepuisVerite, rattacherImagesAuxQuestions, calculerVerdict, alerteActive,
  calculerFiabilite, recalculerFiabilite, appliquerPatchQuestion, acquitterAlerte, assemblerEtVerifier, finaliser, estProgression, estResultatFinal,
  versQuestionFinale, cle, PRICE_MULTIPLIER,
  type Progression, type QuestionFinale, type ResultatFinal, type AlerteImport, type PartielLot,
} from '../src/lib/ai/exercise-import-pipeline';
import { planifierLots, type Lot, type ImportedQuestion } from '../src/lib/ai/exercise-import-schema';
import { analyserPages, type PageLue, type LigneLue, VERT_CORRIGE, type VeritePdf } from '../src/lib/ai/exercise-import-verite-lecture';
import { lireVeritePdf } from '../src/lib/ai/exercise-import-verite';
import { boitesImagesDepuisOperateurs, type Matrice, type OperateursImages } from '../src/lib/ai/exercise-import-images-regles';
import type { Ecart } from '../src/lib/ai/exercise-import-verite-rapport';

/* ─────────── Fixtures ─────────── */

const lot = (index: number, cd: number, cf: number, nb = 40): Lot => ({ index, coeurDebut: cd, coeurFin: cf, debut: Math.max(1, cd - 1), fin: Math.min(nb, cf + 1) });

const question = (over: Partial<ImportedQuestion>): ImportedQuestion => ({
  client_id: over.client_id ?? crypto.randomUUID(), numero_source: null, source_pages: [1], format: 'qcm', enonce: 'Énoncé de la question', images: [],
  items: [
    { lettre: 'A', enonce: 'Proposition A', is_correct: true, justification: '', images: [] },
    { lettre: 'B', enonce: 'Proposition B', is_correct: false, justification: '', images: [] },
    { lettre: 'C', enonce: 'Proposition C', is_correct: false, justification: '', images: [] },
    { lettre: 'D', enonce: 'Proposition D', is_correct: false, justification: '', images: [] },
  ],
  reponse_attendue: '', correction_generale: '', warnings: [], ...over,
});

const finale = (over: Partial<QuestionFinale>): QuestionFinale => ({
  ...versQuestionFinale(question({}), undefined, 0), ...over,
});

const ecart = (over: Partial<Ecart>): Ecart => ({
  gravite: 'bloquant', code: 'question_manquante', page: 5, numeroImprime: '12/', question_client_id: null, libelle: '—', nature: 'x', valeurDocument: null, valeurModele: null, message: 'Écart', ...over,
});

function page(numero: number, lignes: string[]): PageLue {
  let y = 800;
  const out: LigneLue[] = lignes.map((brute) => {
    let texte = brute; let couleur = '#000000'; let x = 57;
    if (texte.startsWith('*')) { couleur = VERT_CORRIGE; texte = texte.slice(1); }
    if (/^[a-e]\)/.test(texte)) x = 75;
    y -= 17;
    return { texte, couleurs: Array.from(texte, () => couleur), x, y };
  });
  return { page: numero, lignes: out, images: [], repere: [1, 0, 0, -1, 0, 841.89] };
}

/** Document de 2 pages : 3 questions colorées, assez de texte pour être « lisible ». */
function documentColore(): VeritePdf {
  const remplissage = 'Un enfant de trois ans consulte pour une fièvre persistante depuis quatre jours avec une éruption cutanée diffuse et une conjonctivite bilatérale non purulente, sans autre signe associé.';
  return analyserPages([
    page(1, ['A. Sujet 1', remplissage, '1/ Quel est le diagnostic le plus probable ?', '*a) Maladie de Kawasaki', 'b) Rougeole', 'c) Scarlatine', 'd) Rubéole',
      '2/ Quel examen demandez-vous en première intention ?', '*a) Échographie cardiaque', 'b) Radiographie du thorax', 'c) Scanner cérébral', 'd) Ponction lombaire']),
    page(2, ['3/ Quel traitement instaurez-vous ?', 'a) Antibiothérapie', '*b) Immunoglobulines intraveineuses', '*c) Aspirine', 'd) Corticoïdes']),
  ], { nbPagesDocument: 2 });
}

/* ─────────── Facturation ─────────── */

test('la facturation retient le maximum de l’estimation et du coût réel majoré (× 1,1 × 5), en centimes', () => {
  assert.equal(PRICE_MULTIPLIER, 3);
  assert.equal(facturerImportCents(500, 0.2), 500);              // 0,2 × 1,1 × 5 = 1,10 € < 5 €
  assert.equal(facturerImportCents(500, 3), 1650);               // 3 × 1,1 × 5 = 16,50 €
  assert.equal(facturerImportCents(500, 1.234567), Math.ceil(1.234567 * 1.1 * 3 * 100));
  assert.equal(facturerImportCents(500, 0), 500);
  assert.equal(facturerImportCents(Number.NaN, Number.NaN), 0);
});

/* ─────────── Lots ─────────── */

test('scinder coupe un lot en deux moitiés de pages cœur contiguës et refuse la page seule', () => {
  const l = lot(2, 17, 24);
  const m = scinder(l)!;
  assert.deepEqual([m[0].coeurDebut, m[0].coeurFin, m[1].coeurDebut, m[1].coeurFin], [17, 20, 21, 24]);
  assert.equal(m[0].debut, 16); assert.equal(m[0].fin, 21); assert.equal(m[1].fin, 25);
  assert.equal(scinder(lot(0, 3, 3)), null);
});

test('F3 : un lot abandonné devient un partiel vide « echec », et sa plage un écart bloquant qui fait aboutir l’import', () => {
  const lots = planifierLots(24);
  const partiels: Record<string, PartielLot> = {};
  partiels[cle(lots[0])] = { questions: [question({})], warnings: [] };
  marquerLotEnEchec(partiels, lots[1], 'une seule page dépasse déjà le budget de sortie du modèle.');
  marquerLotEnEchec(partiels, lots[2], 'Anthropic 529 : overloaded (3 tentative(s)).');
  // Tous les lots ont un partiel : l'analyse est finie.
  assert.ok(lots.every((l) => partiels[cle(l)]));
  assert.equal(partiels[cle(lots[1])].echec, true);
  assert.deepEqual(partiels[cle(lots[1])].questions, []);
  assert.match(partiels[cle(lots[1])].warnings[0], /^Pages 9-16 non importées : une seule page/);
  // Deux lots contigus → une seule plage 9–24.
  const plages = plagesNonImportees(lots, partiels);
  assert.deepEqual(plages.map((p) => [p.debut, p.fin]), [[9, 24]]);
  const ecarts = ecartsPagesNonImportees(lots, partiels);
  assert.equal(ecarts.length, 1);
  assert.equal(ecarts[0].gravite, 'bloquant');
  assert.equal(ecarts[0].code, 'pages_non_importees');
  assert.equal(ecarts[0].page, 9);
  assert.match(ecarts[0].message, /^Pages 9–24 non importées/);
  assert.equal(ecarts[0].question_client_id, null);
});

test('plagesNonImportees sépare les plages qui ne se touchent pas et ignore les lots réussis', () => {
  const lots = planifierLots(40);
  const partiels: Record<string, PartielLot> = {};
  for (const l of lots) partiels[cle(l)] = { questions: [], warnings: [] };
  marquerLotEnEchec(partiels, lots[0], 'a');
  marquerLotEnEchec(partiels, lots[4], 'b');
  assert.deepEqual(plagesNonImportees(lots, partiels).map((p) => [p.debut, p.fin]), [[1, 8], [33, 40]]);
  assert.equal(ecartsPagesNonImportees(lots, partiels).length, 2);
});

/* ─────────── Avertissements ─────────── */

test('F4 : les erreurs de lots, les lots abandonnés et chaque source d’avertissements sont reversés, sans doublon', () => {
  const lots = planifierLots(16);
  const partiels: Record<string, PartielLot> = { [cle(lots[0])]: { questions: [], warnings: [] } };
  marquerLotEnEchec(partiels, lots[1], 'délai.');
  const w = fusionnerAvertissements({
    avertissementsDocs: ['Document Word : images non transmises.', 'Pages 1-8 : lot scindé en deux.'],
    erreurs: { 'sujet:1-8': 'Anthropic 529 : overloaded' },
    partiels, lots,
    corrigeSepare: ['Corrigé séparé : 12 question(s) avec des lettres justes lues.'],
    confrontation: ['Confrontation au document : 3 question(s) reconnues.', 'Pages 1-8 : lot scindé en deux.'],
    validation: ['question 2 écartée : énoncé vide', ' '],
    images: ['2 image(s) rattachées.'],
  });
  assert.deepEqual(w, [
    'Document Word : images non transmises.',
    'Pages 1-8 : lot scindé en deux.',
    'Lot pages sujet:1-8 en échec : Anthropic 529 : overloaded',
    'Pages 9-16 non importées : délai.',
    'Corrigé séparé : 12 question(s) avec des lettres justes lues.',
    'Confrontation au document : 3 question(s) reconnues.',
    'question 2 écartée : énoncé vide',
    '2 image(s) rattachées.',
  ]);
});

/* ─────────── Relance ─────────── */

test('le plan de relance regroupe les pages des questions manquantes ou tronquées en lots contigus (≤ 8 pages) avec les numéros attendus', () => {
  const ecarts: Ecart[] = [
    ecart({ page: 5, numeroImprime: '12/' }),
    ecart({ page: 6, numeroImprime: '15/', code: 'propositions_tronquees', gravite: 'a_relire' }),
    ecart({ page: 5, numeroImprime: '13/' }),
    ecart({ page: 30, numeroImprime: 'Q3' }),
    ecart({ page: 31, numeroImprime: 'Q4', code: 'question_manquante' }),
    ecart({ page: 7, numeroImprime: 'ignoré', code: 'corrige_divergent', gravite: 'info' }), // pas un motif de relance
    ecart({ page: null, numeroImprime: 'sans page' }),
    ecart({ page: 99, numeroImprime: 'hors document' }),
  ];
  const plan = planifierRelance(ecarts, 40);
  assert.deepEqual(plan.lots.map((l) => [l.coeurDebut, l.coeurFin, l.debut, l.fin]), [[5, 6, 4, 7], [30, 31, 29, 32]]);
  assert.deepEqual(plan.attendus[cle(plan.lots[0])], ['12/', '13/', '15/']);
  assert.deepEqual(plan.attendus[cle(plan.lots[1])], ['Q3', 'Q4']);
  assert.ok(plan.lots.every((l) => l.index >= 1000), 'indices distincts du plan initial');
  assert.match(plan.motifs[0], /Relance de 2 lot\(s\) \(pages 5-6, 30-31\) : 4 question\(s\) manquante\(s\), 1 liste\(s\)/);
  assert.match(consigneRelance(plan.attendus[cle(plan.lots[0])]), /SECONDE PASSE.*12\/, 13\/, 15\//);
  // Rien à relancer : plan vide.
  assert.deepEqual(planifierRelance([ecart({ code: 'corrige_divergent' })], 40).lots, []);
});

test('une suite de pages plus longue que la taille de lot est coupée en plusieurs lots', () => {
  const ecarts = Array.from({ length: 11 }, (_, i) => ecart({ page: 10 + i, numeroImprime: `${i}/` }));
  const plan = planifierRelance(ecarts, 40);
  assert.deepEqual(plan.lots.map((l) => [l.coeurDebut, l.coeurFin]), [[10, 17], [18, 20]]);
});

/* ─────────── Repère ─────────── */

test('versRepereHaut convertit l’ordonnée PDF (origine en bas) vers le repère des images (origine en haut) par la matrice de vue', () => {
  assert.ok(Math.abs(versRepereHaut({ 1: [1, 0, 0, -1, 0, 841.89] }, 1, 700) - 141.89) < 1e-9);
  // Sans matrice : A4 supposé.
  assert.ok(Math.abs(versRepereHaut(undefined, 3, 100) - 741.89) < 1e-9);
  // MediaBox décalée : la matrice porte le décalage.
  assert.ok(Math.abs(versRepereHaut({ 2: [1, 0, 0, -1, -20, 800] }, 2, 100) - 700) < 1e-9);
});

test('blocsDepuisVerite rend des blocs « origine en haut », du haut du libellé au bas de la dernière proposition', () => {
  const v = documentColore();
  const blocs = blocsDepuisVerite(v);
  assert.equal(blocs.length, 3);
  const q1 = v.questions[0];
  assert.equal(blocs[0].page, 1);
  assert.equal(blocs[0].numero, 1);
  assert.equal(blocs[0].numeroImprime, '1/');
  assert.ok(Math.abs(blocs[0].yDebut - (841.89 - (q1.yDebut as number))) < 1e-9);
  assert.ok(blocs[0].yFin > blocs[0].yDebut, 'le bas est sous le haut');
  assert.ok(blocs[0].yFin >= 841.89 - (q1.yFin as number), 'le bas couvre la dernière proposition');
  assert.ok(blocs[1].yDebut > blocs[0].yFin - 1, 'les blocs se suivent vers le bas de la page');
});

/**
 * PREUVE DU REPÈRE sur un vrai PDF, lu par les deux modules : pdf-lib pose une
 * image de 120 pt dont le coin bas-gauche est à y = 500 (origine en bas) sous la
 * question 1 (ligne de base y = 700). La vérité lit la question à 700 ; la
 * géométrie du module images (même fonction que `extraireImagesPdf`) place
 * l'image à y = 841,89 − 620 = 221,89 (origine en haut). Après conversion,
 * `rattacherImages` rend l'image à la question 1 — pas à la question 2.
 */
test('repère : vérité (origine en bas) et images (origine en haut) se rejoignent sur un PDF synthétique', async () => {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const p = doc.addPage([595.28, 841.89]);
  const t = (s: string, y: number, vert = false) => p.drawText(s, { x: 57, y, size: 11, font, color: vert ? rgb(0, 0.69, 0.314) : rgb(0, 0, 0) });
  t('A. Sujet 1', 780);
  t('Un enfant de trois ans consulte pour une fievre persistante depuis quatre jours avec une eruption cutanee diffuse', 762);
  t('et une conjonctivite bilaterale non purulente, sans autre signe associe. Les constantes sont normales.', 748);
  t('1/ Quel est le diagnostic le plus probable ?', 700);
  t('a) Maladie de Kawasaki', 680, true);
  t('b) Rougeole', 660);
  t('c) Scarlatine', 640);
  const c = createCanvas(240, 240); const ctx = c.getContext('2d'); ctx.fillStyle = '#88aacc'; ctx.fillRect(0, 0, 240, 240); ctx.fillStyle = '#000'; ctx.fillRect(40, 40, 160, 160);
  const png = await doc.embedPng(await c.encode('png'));
  p.drawImage(png, { x: 57, y: 500, width: 120, height: 120 });
  t('2/ Quel examen demandez-vous en premiere intention ?', 470);
  t('a) Echographie cardiaque', 450, true);
  t('b) Radiographie du thorax', 430);
  t('c) Scanner cerebral', 410);
  const bytes = await doc.save();

  // Module 1 : la vérité.
  const v = await lireVeritePdf(bytes);
  assert.equal(v.statut, 'colore');
  assert.equal(v.nbQuestionsDocument, 2);
  assert.deepEqual(v.reperesPages?.[1], [1, 0, 0, -1, 0, 841.89]);
  assert.equal(v.questions[0].yDebut, 700, 'ordonnée lue dans l’espace PDF, origine en bas');
  assert.equal(v.questions[0].yFin, 640);
  assert.equal(v.images.length, 1);
  assert.equal(v.images[0].yBas, 500); assert.equal(v.images[0].yHaut, 620);
  assert.equal(v.images[0].questionIndex, 0, 'la vérité elle-même range l’image sous la question 1');

  // Module 2 : la géométrie des images (celle d'`extraireImagesPdf`), origine en haut.
  const mod = (await import('pdfjs-dist/legacy/build/pdf.mjs')) as unknown as { getDocument: (a: unknown) => { promise: Promise<{ getPage: (n: number) => Promise<{ getOperatorList: () => Promise<{ fnArray: number[]; argsArray: unknown[] }>; getViewport: (a: { scale: number }) => { transform: number[] } }>; destroy: () => Promise<void> }> }; OPS: Record<string, number> };
  const d = await mod.getDocument({ data: new Uint8Array(bytes), verbosity: 0 }).promise;
  const pg = await d.getPage(1);
  const OPS = mod.OPS;
  const ops: OperateursImages = {
    save: OPS.save, restore: OPS.restore, transform: OPS.transform, paintFormXObjectBegin: OPS.paintFormXObjectBegin, paintFormXObjectEnd: OPS.paintFormXObjectEnd,
    beginAnnotation: OPS.beginAnnotation, endAnnotation: OPS.endAnnotation, paintImageXObject: OPS.paintImageXObject, paintInlineImageXObject: OPS.paintInlineImageXObject,
    paintImageXObjectRepeat: OPS.paintImageXObjectRepeat, paintInlineImageXObjectGroup: OPS.paintInlineImageXObjectGroup, paintImageMaskXObject: OPS.paintImageMaskXObject,
    paintImageMaskXObjectRepeat: OPS.paintImageMaskXObjectRepeat, paintImageMaskXObjectGroup: OPS.paintImageMaskXObjectGroup,
  };
  const boites = boitesImagesDepuisOperateurs(await pg.getOperatorList(), ops, pg.getViewport({ scale: 1 }).transform as Matrice, 1);
  await d.destroy();
  assert.equal(boites.length, 1);
  assert.ok(Math.abs(boites[0].y - 221.89) < 1e-6, `image à y=${boites[0].y} (origine en haut)`);
  assert.ok(Math.abs(boites[0].hauteur - 120) < 1e-6);
  // Les deux lectures désignent la même bande, une fois converties.
  assert.ok(Math.abs(versRepereHaut(v.reperesPages, 1, v.images[0].yHaut as number) - boites[0].y) < 1e-6);

  // Rattachement : blocs convertis + image du module 2 → question 1.
  const blocs = blocsDepuisVerite(v);
  const q1 = finale({ client_id: 'q1' }); const q2 = finale({ client_id: 'q2' });
  const bilan = rattacherImagesAuxQuestions(
    [{ page: 1, indice: 1, yDebut: boites[0].y, yFin: boites[0].y + boites[0].hauteur, largeurPx: 240, hauteurPx: 240, url: 'https://x/p1-1.png', chemin: 'p1-1.png', sha1: 'a' }],
    { blocs },
    [{ question_client_id: 'q1', indexModele: 0, indexDocument: 0, score: 1, numeroImprime: '1/', page: 1, sur: true }, { question_client_id: 'q2', indexModele: 1, indexDocument: 1, score: 1, numeroImprime: '2/', page: 1, sur: true }],
    [q1, q2],
  );
  assert.equal(bilan.rattachees, 1);
  assert.deepEqual(q1.images, ['https://x/p1-1.png']);
  assert.deepEqual(q2.images, []);
  assert.equal(q1.images_rattachees[0].page, 1);
});

test('rattacherImagesAuxQuestions rapporte une image dont la question du document n’a pas été importée, et le doute', () => {
  const blocs = [
    { page: 1, yDebut: 100, yFin: 200, numero: 1, numeroImprime: '1/', pages: [1] },
    { page: 1, yDebut: 600, yFin: 700, numero: 2, numeroImprime: '2/', pages: [1] },
  ];
  const q2 = finale({ client_id: 'q2' });
  const bilan = rattacherImagesAuxQuestions(
    [
      { page: 1, indice: 1, yDebut: 120, yFin: 180, largeurPx: 10, hauteurPx: 10, url: 'https://x/a.png', chemin: 'a', sha1: 'a' }, // dans le bloc 1, non importé
      { page: 1, indice: 2, yDebut: 400, yFin: 440, largeurPx: 10, hauteurPx: 10, url: 'https://x/b.png', chemin: 'b', sha1: 'b' }, // entre les deux : douteuse
      { page: 7, indice: 1, yDebut: 10, yFin: 20, largeurPx: 10, hauteurPx: 10, url: 'https://x/c.png', chemin: 'c', sha1: 'c' },   // page sans question
    ],
    { blocs },
    [{ question_client_id: 'q2', indexModele: 0, indexDocument: 1, score: 1, numeroImprime: '2/', page: 1, sur: true }],
    [q2],
  );
  assert.equal(bilan.nonRattachees + bilan.rattachees, 3);
  const codes = bilan.ecarts.map((e) => e.code).sort();
  assert.ok(codes.includes('image_sans_question_importee'), codes.join());
  const a = bilan.ecarts.find((e) => e.code === 'image_sans_question_importee')!;
  assert.equal(a.gravite, 'a_relire'); assert.equal(a.numeroImprime, '1/');
  if (bilan.douteuses) {
    assert.ok(q2.warnings.some((w) => /avec doute/.test(w)));
    assert.ok(bilan.ecarts.some((e) => e.code === 'image_douteuse' && e.question_client_id === 'q2'));
  }
  assert.equal(rattacherImagesAuxQuestions([], { blocs }, [], [q2]).rattachees, 0);
});

/* ─────────── Verdict ─────────── */

test('verdict : rouge sur bloquant actif, orange sur à-relire ou document non vérifiable, vert sinon ; une question vérifiée ou écartée neutralise ses alertes', () => {
  const qs = [finale({ client_id: 'a' }), finale({ client_id: 'b' })];
  const alertes: AlerteImport[] = [
    { gravite: 'bloquant', code: 'note_du_modele', message: 'x', question_client_id: 'a' },
    { gravite: 'a_relire', code: 'vignette_absente', message: 'y', question_client_id: 'b' },
    { gravite: 'info', code: 'lettre_divergente', message: 'z', question_client_id: 'b' },
  ];
  assert.equal(calculerVerdict(qs, alertes, 'colore'), 'rouge');
  qs[0].validee_par_admin = true;
  assert.equal(calculerVerdict(qs, alertes, 'colore'), 'orange');
  qs[1].validee_par_admin = true;
  assert.equal(calculerVerdict(qs, alertes, 'colore'), 'vert');
  assert.equal(calculerVerdict(qs, alertes, 'non-colore'), 'orange', 'corrigé non vérifiable');
  assert.equal(calculerVerdict(qs, alertes, 'illisible'), 'orange');
  // Alerte globale : active tant qu'elle n'est pas acquittée.
  const globale: AlerteImport = { gravite: 'bloquant', code: 'pages_non_importees', message: 'pages 9–16' };
  assert.equal(calculerVerdict(qs, [globale], 'colore'), 'rouge');
  assert.equal(calculerVerdict(qs, [{ ...globale, traitee: true }], 'colore'), 'vert');
  // Une alerte sur une question absente de la liste (écartée) ne compte plus.
  assert.equal(alerteActive({ gravite: 'bloquant', code: 'x', message: 'x', question_client_id: 'absente' }, qs), false);
});

test('calculerFiabilite reprend les compteurs du rapport et des images', () => {
  const f = calculerFiabilite({
    questions: [finale({ client_id: 'a' })],
    alertes: [{ gravite: 'bloquant', code: 'x', message: 'x', question_client_id: 'a' }, { gravite: 'a_relire', code: 'y', message: 'y' }],
    rapport: { statutDocument: 'colore', compteurs: { questionsDocument: 354, questionsModele: 352, appariees: 350, appariementsDouteux: 1, manquantes: 4, sansSource: 2, propositionsComparees: 1770, propositionsDivergentes: 3, propositionsTronquees: 2, propositionsEnTrop: 0, corrigesDivergents: 153, corrigesAbsentsDocument: 0, vignettesManquantes: 5, notesDuModele: 1, imagesSansQuestion: 0, imagesSansDocument: 3, reparations: { corrige: 153, proposition_completee: 6, vignette_prefixee: 5, placeholder_retire: 2 }, bloquants: 5, aRelire: 12 } },
    images: { extraites: 12, rattachees: 11, douteuses: 2 },
  });
  assert.equal(f.questionsDocument, 354); assert.equal(f.questionsImportees, 1); assert.equal(f.questionsManquantes, 4); assert.equal(f.questionsTronquees, 2);
  assert.equal(f.corrigesVerifiesParCouleur, 1770); assert.equal(f.corrigesCorriges, 153); assert.equal(f.vignettesAjoutees, 5);
  assert.equal(f.imagesDocument, 12); assert.equal(f.imagesRattachees, 11); assert.equal(f.imagesDouteuses, 2);
  assert.equal(f.alertesBloquantes, 1); assert.equal(f.alertesARelire, 1); assert.equal(f.verdict, 'rouge');
});

/* ─────────── Vérification et finalisation de bout en bout (sans modèle) ─────────── */

function progressionDeBase(partiels: Record<string, PartielLot>, lots: Lot[]): Progression {
  return {
    etape: 'finalisation', plan: { nbPagesSujet: 2, nbPagesCorrige: null, strategie: 'combine', lots, lotsCorrige: [] },
    partiels, partielsCorrige: {}, erreurs: {}, tentatives: {}, avertissementsDocs: [], cout: { usd: 0.42, input_tokens: 1000, output_tokens: 200, appels: 2 },
    verrou: null, model: 'claude-opus-5', effort: 'high',
  };
}

test('assemblerEtVerifier + finaliser : lot en échec → alerte bloquante « pages non importées », corrigé aligné sur la couleur, verdict rouge, forme B complète', () => {
  const verite = documentColore();
  const lots: Lot[] = [lot(0, 1, 1, 2), lot(1, 2, 2, 2)];
  const partiels: Record<string, PartielLot> = {
    [cle(lots[0])]: {
      questions: [
        question({ client_id: 'q1', numero_source: '1', source_pages: [1], enonce: 'Un enfant de trois ans consulte pour une fièvre persistante depuis quatre jours avec une éruption cutanée diffuse et une conjonctivite bilatérale non purulente, sans autre signe associé.\n\nQuel est le diagnostic le plus probable ?', items: [
          { lettre: 'A', enonce: 'Maladie de Kawasaki', is_correct: false, justification: '', images: [] }, // faux selon le modèle, vert dans le document
          { lettre: 'B', enonce: 'Rougeole', is_correct: true, justification: '', images: [] },
          { lettre: 'C', enonce: 'Scarlatine', is_correct: false, justification: '', images: [] },
          { lettre: 'D', enonce: 'Rubéole', is_correct: false, justification: '', images: [] },
        ] }),
        question({ client_id: 'q2', numero_source: '2', source_pages: [1], enonce: 'Un enfant de trois ans consulte pour une fièvre persistante depuis quatre jours avec une éruption cutanée diffuse et une conjonctivite bilatérale non purulente, sans autre signe associé.\n\nQuel examen demandez-vous en première intention ?', items: [
          { lettre: 'A', enonce: 'Échographie cardiaque', is_correct: true, justification: '', images: [] },
          { lettre: 'B', enonce: 'Radiographie du thorax', is_correct: false, justification: '', images: [] },
          { lettre: 'C', enonce: 'Scanner cérébral', is_correct: false, justification: '', images: [] },
          { lettre: 'D', enonce: 'Ponction lombaire', is_correct: false, justification: '', images: [] },
        ] }),
      ],
      warnings: ['tableau illisible page 1'],
    },
  };
  marquerLotEnEchec(partiels, lots[1], 'une seule page dépasse déjà le délai d’analyse.');

  const v = assemblerEtVerifier({
    plan: { lots, lotsCorrige: [], strategie: 'combine' }, partiels, partielsCorrige: {}, corrigeSepare: null, verite, voie: 'interne',
    avertissementsDocs: ['Document préparé.'], erreurs: { 'sujet:2-2': 'Anthropic 529' },
  });
  assert.equal(v.questions.length, 2);
  // Corrigé aligné sur la couleur : A juste, B fausse.
  const q1 = v.questions.find((q) => q.client_id === 'q1')!;
  assert.equal(q1.items.find((i) => i.lettre === 'A')!.is_correct, true);
  assert.equal(q1.items.find((i) => i.lettre === 'B')!.is_correct, false);
  assert.equal(v.rapport.compteurs.reparations.corrige, 2);
  // La question 3 (page 2, lot abandonné) manque : bloquant ; la plage : bloquant.
  assert.ok(v.rapport.ecarts.some((e) => e.code === 'question_manquante' && e.numeroImprime === '3/'));
  assert.equal(v.ecartsPages.length, 1);
  assert.ok(v.alertes.some((a) => a.code === 'pages_non_importees' && a.gravite === 'bloquant' && !a.question_client_id));
  // F4 : tout est dans les avertissements.
  assert.ok(v.warnings.includes('Document préparé.'));
  assert.ok(v.warnings.some((w) => w.startsWith('Lot pages sujet:2-2 en échec : Anthropic 529')));
  assert.ok(v.warnings.some((w) => w.startsWith('Pages 2-2 non importées')));
  assert.ok(v.warnings.some((w) => /tableau illisible page 1/.test(w)));
  assert.ok(v.warnings.some((w) => /remises d’aplomb d’après la couleur/.test(w)));
  assert.equal(v.verite.statut, 'colore'); assert.equal(v.verite.blocs.length, 3); assert.equal(v.verite.nbQuestionsDocument, 3);

  const r = finaliser({ progression: progressionDeBase(partiels, lots), verification: v, images: { numPages: 2, pageSuivante: null, images: [], signaturesDecor: [], dureeMs: 12, appels: 1, erreur: 'canvas indisponible' } });
  assert.equal(r.etape, 'ready');
  assert.ok(estResultatFinal(r)); assert.ok(!estProgression(r));
  assert.equal(r.fiabilite.verdict, 'rouge');
  assert.equal(r.fiabilite.questionsDocument, 3); assert.equal(r.fiabilite.questionsImportees, 2); assert.equal(r.fiabilite.questionsManquantes, 1);
  assert.equal(r.fiabilite.corrigesCorriges, 2); assert.ok(r.fiabilite.corrigesVerifiesParCouleur >= 8);
  assert.ok(r.fiabilite.alertesBloquantes >= 2, `bloquantes = ${r.fiabilite.alertesBloquantes}`);
  assert.ok(r.alertes.some((a) => a.code === 'images_non_extraites' && a.gravite === 'a_relire'));
  assert.ok(r.warnings.some((w) => /Les images du document n'ont pas pu être extraites : canvas indisponible/.test(w)));
  // Alertes enrichies de la page et du numéro du document.
  const manquante = r.alertes.find((a) => a.code === 'question_manquante')!;
  assert.equal(manquante.page, 2); assert.equal(manquante.numeroImprime, '3/');
  // Forme B : images en URL, descriptions du modèle mises de côté, page du document.
  const fq1 = r.questions.find((q) => q.client_id === 'q1')!;
  assert.deepEqual(fq1.images, []); assert.deepEqual(fq1.images_modele, []); assert.equal(fq1.page_document, 1); assert.equal(fq1.numero_document, '1/');
  assert.equal(r.meta.model, 'claude-opus-5'); assert.equal(r.meta.effort, 'high'); assert.equal(r.meta.cout.usd, 0.42); assert.equal(r.meta.lotsEnEchec, 1); assert.equal(r.meta.images.erreur, 'canvas indisponible');
  assert.ok(!('appariements' in r.rapport), 'le rapport final ne porte pas les appariements');
  assert.equal(facturerImportCents(100, r.meta.cout.usd), 231);
});

test('assemblerEtVerifier fusionne les lots d’une relance et lève un message français sans exercice', () => {
  const verite = documentColore();
  const lots: Lot[] = [lot(0, 1, 2, 2)];
  const q3 = question({ client_id: 'q3', numero_source: '3', source_pages: [2], enonce: 'Quel traitement instaurez-vous ?', items: [
    { lettre: 'A', enonce: 'Antibiothérapie', is_correct: false, justification: '', images: [] },
    { lettre: 'B', enonce: 'Immunoglobulines intraveineuses', is_correct: true, justification: '', images: [] },
    { lettre: 'C', enonce: 'Aspirine', is_correct: true, justification: '', images: [] },
    { lettre: 'D', enonce: 'Corticoïdes', is_correct: false, justification: '', images: [] },
  ] });
  const partiels: Record<string, PartielLot> = { [cle(lots[0])]: { questions: [], warnings: [] } };
  assert.throws(() => assemblerEtVerifier({ plan: { lots, lotsCorrige: [], strategie: 'combine' }, partiels, partielsCorrige: {}, corrigeSepare: null, verite, voie: 'interne', avertissementsDocs: [], erreurs: {} }), /Aucun exercice n'a été trouvé/);
  const relance = { lots: [lot(1000, 2, 2, 2)], partiels: { '2-2': { questions: [q3], warnings: [] } } };
  const v = assemblerEtVerifier({ plan: { lots, lotsCorrige: [], strategie: 'combine' }, partiels, partielsCorrige: {}, relance, corrigeSepare: null, verite, voie: 'interne', avertissementsDocs: [], erreurs: {} });
  assert.equal(v.questions.length, 1);
  assert.equal(v.questions[0].client_id, 'q3');
});

test('le corrigé séparé lu dans le document prime sur le corrigé du modèle', () => {
  const verite = documentColore();
  const lots: Lot[] = [lot(0, 1, 2, 2)];
  const q1 = question({ client_id: 'q1', numero_source: '1', enonce: 'Quel est le diagnostic le plus probable ?', items: [
    { lettre: 'A', enonce: 'Maladie de Kawasaki', is_correct: false, justification: '', images: [] },
    { lettre: 'B', enonce: 'Rougeole', is_correct: true, justification: '', images: [] },
    { lettre: 'C', enonce: 'Scarlatine', is_correct: false, justification: '', images: [] },
    { lettre: 'D', enonce: 'Rubéole', is_correct: false, justification: '', images: [] },
  ] });
  const partiels: Record<string, PartielLot> = { [cle(lots[0])]: { questions: [q1], warnings: [] } };
  const nonColore = { ...verite, statut: 'non-colore' as const, colore: false, questions: verite.questions.map((q) => ({ ...q, items: q.items.map((i) => ({ ...i, juste: false, partVert: 0 })) })) };
  const v = assemblerEtVerifier({
    plan: { lots, lotsCorrige: [], strategie: 'combine' }, partiels, partielsCorrige: {},
    corrigeSepare: { corrections: { corrections: [{ numero_source: '1', source_pages: [], lettres_justes: ['A'], justifications: [], reponse_attendue: '', correction_generale: '' }], warnings: [] }, resume: { statut: 'colore', origine: 'couleur', nbNumeros: 1, avertissements: ['Corrigé séparé : 1 question(s).'] } },
    verite: nonColore, voie: 'interne', avertissementsDocs: [], erreurs: {},
  });
  const items = v.questions[0].items;
  assert.equal(items.find((i) => i.lettre === 'A')!.is_correct, true);
  assert.equal(items.find((i) => i.lettre === 'B')!.is_correct, false);
  assert.ok(v.warnings.some((w) => /Corrigé séparé lu dans le document \(couleur\) : 1 question/.test(w)));
  assert.ok(!v.warnings.some((w) => /Aucun corrigé trouvé pour cet exercice/.test(w)));
  assert.ok(v.warnings.includes('Corrigé séparé : 1 question(s).'));
});

/* ─────────── Patch de l'administrateur ─────────── */

function resultatFinalFixture(): ResultatFinal {
  const qa = finale({ client_id: 'a', numero_document: '1/', images: ['https://x/a.png'], images_rattachees: [{ url: 'https://x/a.png', page: 1, confiance: 'sure', motif: 'dans le bloc' }] });
  const qb = finale({ client_id: 'b', numero_document: '2/', index_origine: 1 });
  const qc = finale({ client_id: 'c', numero_document: '3/', index_origine: 2 });
  const alertes: AlerteImport[] = [
    { gravite: 'bloquant', code: 'note_du_modele', message: 'note', question_client_id: 'a' },
    { gravite: 'bloquant', code: 'pages_non_importees', message: 'pages 9–16 non importées' },
    { gravite: 'a_relire', code: 'vignette_absente', message: 'vignette', question_client_id: 'b' },
  ];
  const r: ResultatFinal = {
    etape: 'ready', questions: [qa, qb, qc], questions_ecartees: [], warnings: [], alertes,
    rapport: { statutDocument: 'colore', compteurs: { questionsDocument: 3, questionsModele: 3, appariees: 3, appariementsDouteux: 0, manquantes: 0, sansSource: 0, propositionsComparees: 12, propositionsDivergentes: 0, propositionsTronquees: 0, propositionsEnTrop: 0, corrigesDivergents: 0, corrigesAbsentsDocument: 0, vignettesManquantes: 1, notesDuModele: 1, imagesSansQuestion: 0, imagesSansDocument: 0, reparations: { corrige: 0, proposition_completee: 0, vignette_prefixee: 0, placeholder_retire: 0 }, bloquants: 1, aRelire: 1 }, ecarts: [], reparations: [], avertissements: [] },
    fiabilite: { statutDocument: 'colore', questionsDocument: 3, questionsImportees: 3, questionsManquantes: 0, questionsTronquees: 0, corrigesVerifiesParCouleur: 12, corrigesCorriges: 0, imagesDocument: 1, imagesRattachees: 1, imagesDouteuses: 0, vignettesAjoutees: 0, alertesBloquantes: 2, alertesARelire: 1, verdict: 'rouge' },
    meta: { model: 'm', effort: 'high', lots: 1, pages: 2, pagesCorrige: null, strategie: 'combine', cout: { usd: 0, input_tokens: 0, output_tokens: 0, appels: 0 }, relances: { lots: 0, pages: [], attendus: [] }, lotsEnEchec: 0, images: { extraites: 1, dureeMs: 0, appels: 1, erreur: null } },
  };
  return r;
}

test('appliquerPatchQuestion : champs autorisés, journal dans warnings, verdict recalculé ; écarter puis restaurer ; images inconnues refusées', () => {
  const r = resultatFinalFixture();
  const { question: qa, modifications } = appliquerPatchQuestion(r, 'a', {
    enonce: 'Énoncé corrigé', items: [{ lettre: 'A', is_correct: false }, { lettre: 'B', is_correct: true, enonce: 'B corrigée' }, { lettre: 'Z', is_correct: true }],
    images: ['https://x/a.png', 'https://etranger/z.png'], correction_generale: 'Corrigé', validee_par_admin: true,
  }, '2026-09-10T12:00:00.000Z');
  assert.ok(qa);
  assert.equal(qa!.enonce, 'Énoncé corrigé');
  assert.equal(qa!.items.find((i) => i.lettre === 'A')!.is_correct, false);
  assert.equal(qa!.items.find((i) => i.lettre === 'B')!.enonce, 'B corrigée');
  assert.deepEqual(qa!.images, ['https://x/a.png'], 'URL étrangère ignorée');
  assert.equal(qa!.validee_par_admin, true);
  assert.deepEqual(modifications, ['énoncé', 'proposition A → fausse', 'proposition B', 'proposition B → vraie', 'corrigé général', 'marquée vérifiée']);
  assert.match(r.warnings[0], /^Modifié à la main par l'administrateur \(2026-09-10 12:00\) : question 1\/ — énoncé, proposition A → fausse/);
  // La note bloquante de « a » est neutralisée ; reste la globale → toujours rouge.
  assert.equal(r.fiabilite.verdict, 'rouge'); assert.equal(r.fiabilite.alertesBloquantes, 1);
  acquitterAlerte(r, 1, true, '2026-09-10T12:01:00.000Z');
  assert.equal(r.fiabilite.verdict, 'orange'); assert.equal(r.fiabilite.alertesBloquantes, 0); assert.equal(r.fiabilite.alertesARelire, 1);
  // Retrait d'une image connue.
  appliquerPatchQuestion(r, 'a', { images: [] });
  assert.deepEqual(r.questions[0].images, []);
  // Écarter « b » : sort de `questions` (la RPC ne lit que celle-ci), son alerte ne compte plus → vert.
  const { question: qb } = appliquerPatchQuestion(r, 'b', { supprimee: true });
  assert.equal(qb!.supprimee, true);
  assert.deepEqual(r.questions.map((q) => q.client_id), ['a', 'c']);
  assert.equal(r.questions_ecartees.length, 1);
  assert.equal(r.fiabilite.verdict, 'vert'); assert.equal(r.fiabilite.questionsImportees, 2);
  // Restaurer : revient à sa place d'origine.
  appliquerPatchQuestion(r, 'b', { supprimee: false });
  assert.deepEqual(r.questions.map((q) => q.client_id), ['a', 'b', 'c']);
  assert.equal(r.questions_ecartees.length, 0);
  assert.equal(r.fiabilite.verdict, 'orange');
  // Question inconnue, patch vide.
  assert.equal(appliquerPatchQuestion(r, 'zzz', { enonce: 'x' }).question, null);
  const avant = r.warnings.length;
  assert.deepEqual(appliquerPatchQuestion(r, 'c', {}).modifications, []);
  assert.equal(r.warnings.length, avant, 'aucun journal sans modification');
  assert.equal(recalculerFiabilite(r).verdict, 'orange');
  assert.equal(acquitterAlerte(r, 99, true), null);
});

test('estProgression / estResultatFinal distinguent les deux formes de `result`', () => {
  assert.ok(estProgression({ etape: 'analyse', plan: {} }));
  assert.ok(estProgression({ etape: 'images', plan: {} }));
  assert.ok(!estProgression({ etape: 'ready', questions: [] }));
  assert.ok(!estProgression({ questions: [], warnings: [] }));
  assert.ok(estResultatFinal({ etape: 'ready', questions: [] }));
  assert.ok(estResultatFinal({ questions: [], fiabilite: {} }));
  assert.ok(!estResultatFinal({ questions: [], warnings: [] }), 'ancien résultat sans fiabilité : pas modifiable');
  assert.ok(!estResultatFinal(null));
});

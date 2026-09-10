/**
 * Confrontation du rendu du modèle au document, rapport de fiabilité et
 * réparations déterministes (`exercise-import-verite-rapport`), plus les
 * helpers de texte (`exercise-import-verite-texte`) et les alertes de
 * `validate` — sur des fixtures synthétiques.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { analyserPages, type PageLue, type LigneLue, VERT_CORRIGE } from '../src/lib/ai/exercise-import-verite-lecture';
import { aligner, confronterALaSource, dedoublonnerParTexte, type QuestionModele } from '../src/lib/ai/exercise-import-verite-rapport';
import {
  normaliserPourComparaison, ressemblance, nettoyerLigaturesPourAffichage, noteDuModele, estPlaceholderSeul,
  retirerPlaceholdersSeuls, couvertureVignette, REGEX_FABRICATION,
} from '../src/lib/ai/exercise-import-verite-texte';
import { validate, appliquerCorrections, type ImportedQuestion, type ExerciseImportResult } from '../src/lib/ai/exercise-import-schema';
import { versCorrectionsResult } from '../src/lib/ai/exercise-import-verite';

/* ─────────── Fixtures ─────────── */

function page(numero: number, lignes: string[]): PageLue {
  let y = 800;
  const out: LigneLue[] = lignes.map((brute) => {
    let texte = brute; let couleur = '#000000'; let x = 57;
    if (texte.startsWith('*')) { couleur = VERT_CORRIGE; texte = texte.slice(1); }
    if (/^[a-e]\)/.test(texte)) x = 75;
    y -= 17;
    return { texte, couleurs: Array.from(texte, () => couleur), x, y };
  });
  return { page: numero, lignes: out, images: [] };
}

const VIGNETTE_DOC = 'Un enfant de sexe masculin né à 39 SA au poids de 3.900 kg présente un ictère à H12. Il s’agit du deuxième enfant d’une mère âgée de 30 ans de groupe O+.';
const VIGNETTE_PROPRE = 'Un enfant de sexe masculin né à 39 SA au poids de 3,900 kg présente un ictère à H12. Il s’agit du deuxième enfant d’une mère âgée de 30 ans de groupe O+.';

/** Document : sujet 1 (2 questions, corrigé coloré, ligatures), sujet 2 (1 question, liste de 5). */
function documentColore(): PageLue[] {
  return [page(1, [
    'A. Sujet 1', VIGNETTE_DOC,
    '1/ Quelles sont vos deux hypothèses diagnosKques principales ?',
    '*a) InfecKon néonatale bactérienne précoce', 'b) Déficit en G6PD', 'c) Ictère au lait de mère', '*d) Hémolyse par incompaKbilité materno-fœtale', 'e) Atrésie des voies biliaires.',
    '2/ Que cherchez-vous ?',
    'a) Couleur des selles : si noires, elles vous inquièteront.', '*b) Couleur des selles : si blanches, elles vous inquièteront.', '*c) Pâleur, hépatosplénomégalie', '*d) Fièvre', 'e) Urines décolorées.',
    'B. Sujet 2', 'Vous voyez en consultaKon un enfant âgé de 3 semaines d’origine comorienne, premier enfant du couple, né à terme au décours d’une grossesse normale suivie en France.',
    '1/ Quels arguments donner à la maman en faveur de la poursuite de l’allaitement ?',
    '*a) Meilleur apport nutriKonnel pour le bébé.', '*b) Apport d’anKcorps maternels', '*c) Diminue le risque du cancer du sein et des ovaires chez la mère', 'd) Diminue le risque de diabète de type 1 chez la mère', '*e) Diminue à long terme chez l’enfant le risque d’HTA',
  ])];
}

const item = (lettre: string, enonce: string, is_correct: boolean) => ({ lettre, enonce, is_correct, justification: '', images: [] });

const q = (over: Partial<ImportedQuestion>): ImportedQuestion => ({
  client_id: over.client_id ?? `id-${Math.random().toString(36).slice(2, 8)}`, numero_source: null, source_pages: [1], format: 'qcm', enonce: '', images: [],
  items: [], reponse_attendue: '', correction_generale: '', warnings: [], ...over,
});

/** Rendu du modèle fidèle, vignettes reprises. */
function modeleFidele(): ImportedQuestion[] {
  return [
    q({ client_id: 'q1', numero_source: '1', enonce: `${VIGNETTE_PROPRE}\n\nQuelles sont vos deux hypothèses diagnostiques principales ?`, items: [
      item('A', 'Infection néonatale bactérienne précoce', true), item('B', 'Déficit en G6PD', false), item('C', 'Ictère au lait de mère', false), item('D', 'Hémolyse par incompatibilité materno-fœtale', true), item('E', 'Atrésie des voies biliaires.', false),
    ] }),
    q({ client_id: 'q2', numero_source: '2', enonce: `${VIGNETTE_PROPRE}\n\nQue cherchez-vous ?`, items: [
      item('A', 'Couleur des selles : si noires, elles vous inquièteront.', false), item('B', 'Couleur des selles : si blanches, elles vous inquièteront.', true), item('C', 'Pâleur, hépatosplénomégalie', true), item('D', 'Fièvre', true), item('E', 'Urines décolorées.', false),
    ] }),
    q({ client_id: 'q3', numero_source: '1', enonce: 'Vous voyez en consultation un enfant âgé de 3 semaines d’origine comorienne, premier enfant du couple, né à terme au décours d’une grossesse normale suivie en France.\n\nQuels arguments donner à la maman en faveur de la poursuite de l’allaitement ?', items: [
      item('A', 'Meilleur apport nutritionnel pour le bébé.', true), item('B', 'Apport d’anticorps maternels', true), item('C', 'Diminue le risque du cancer du sein et des ovaires chez la mère', true), item('D', 'Diminue le risque de diabète de type 1 chez la mère', false), item('E', 'Diminue à long terme chez l’enfant le risque d’HTA', true),
    ] }),
  ];
}

/* ─────────── Helpers de texte ─────────── */

test('la normalisation de comparaison neutralise les ligatures des deux côtés', () => {
  assert.equal(normaliserPourComparaison('diagnosKques'), normaliserPourComparaison('diagnostiques'));
  assert.equal(normaliserPourComparaison('reproduc+on'), normaliserPourComparaison('reproduction'));
  assert.equal(normaliserPourComparaison('Prépara&on'), normaliserPourComparaison('Préparation'));
  assert.equal(normaliserPourComparaison('Déﬁcit'), normaliserPourComparaison('Déficit'));
  assert.equal(normaliserPourComparaison('plaqueces'), normaliserPourComparaison('plaquettes'));
  assert.equal(normaliserPourComparaison('AMIKACINE'), normaliserPourComparaison('AMIKACINE'), 'symétrique : un vrai K ne crée pas d’écart');
  assert.ok(ressemblance('Antibiothérapie IV par CEFOTAXIME et AMIKACINE', 'AnKbiothérapie IV par CEFOTAXIME et AMIKACINE') >= 0.95);
  assert.ok(ressemblance('Fait du quatre pattes', 'Faut du quatre paces') < 0.8, 'une vraie coquille reste un écart');
});

test('le nettoyage pour affichage ne rétablit que les ligatures sûres', () => {
  assert.equal(nettoyerLigaturesPourAffichage('Quelles sont vos hypothèses diagnosKques ? InfecKon, reproduc+on, Prépara&on, Déﬁcit'), 'Quelles sont vos hypothèses diagnostiques ? Infection, reproduction, Préparation, Déficit');
  assert.equal(nettoyerLigaturesPourAffichage('AMIKACINE 3 Kg K+'), 'AMIKACINE 3 Kg K+', 'un K majuscule entre majuscules, après un chiffre ou isolé est conservé');
  assert.equal(nettoyerLigaturesPourAffichage('Bandelece urinaire'), 'Bandelece urinaire', '« tt » → « c » n’est pas réversible : laissé tel quel');
});

test('les notes du modèle sont détectées quelle que soit leur graphie ; un placeholder seul est retiré, une note mêlée est gardée', () => {
  for (const t of [
    '[Contexte clinique manquant]', 'Contexte clinique manquant.', 'Voir l’énoncé du dossier.', 'cf. la vignette ci-dessus', 'Même patient que la question 3.',
    'Suite du dossier précédent', 'Vignette non disponible dans cet extrait.', 'Données non fournies', 'D’après le corpus, la réponse est A.', 'Correction fondée sur le corpus.',
    'Le document fourni ne mentionne pas la posologie.', 'À vérifier avant publication.', 'Réponse à vérifier.',
  ]) assert.ok(noteDuModele(t), `devrait être détecté : ${t}`);
  for (const t of ['Un enfant de 3 ans consulte pour fièvre.', 'Quelle est votre hypothèse diagnostique ?', 'Le patient est adressé au CHU.']) assert.equal(noteDuModele(t), null, t);

  assert.equal(estPlaceholderSeul('[Contexte clinique manquant]'), true);
  assert.equal(estPlaceholderSeul('(voir énoncé)'), true);
  assert.equal(estPlaceholderSeul('Un enfant de 3 ans, contexte clinique manquant pour le reste, consulte pour une fièvre persistante depuis quatre jours.'), false);
  const r = retirerPlaceholdersSeuls('[Contexte clinique manquant]\n\nQue faites-vous ?');
  assert.equal(r.enonce, 'Que faites-vous ?');
  assert.deepEqual(r.retires, ['[Contexte clinique manquant]']);
});

test('la regex « fabrication » est celle de scripts/banques/qualite-publication.mjs, à l’identique', () => {
  const script = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'banques', 'qualite-publication.mjs'), 'utf8');
  const m = /const fabrication=(\/.*?\/i);/.exec(script);
  assert.ok(m, 'la regex doit être trouvée dans le script');
  assert.equal(`/${REGEX_FABRICATION.source}/${REGEX_FABRICATION.flags}`, m![1]);
  assert.ok(noteDuModele('Ce distracteur est classique.'));
  assert.ok(noteDuModele('La source ne mentionne pas la dose.'));
});

test('la couverture d’une vignette mesure les mots repris par l’énoncé', () => {
  assert.ok(couvertureVignette(VIGNETTE_DOC, `${VIGNETTE_PROPRE}\n\nQue faites-vous ?`) >= 0.9);
  assert.ok(couvertureVignette(VIGNETTE_DOC, 'Que faites-vous ?') < 0.2);
  assert.equal(couvertureVignette('', 'Que faites-vous ?'), 1);
});

/* ─────────── Alignement ─────────── */

test('l’alignement suit l’ordre du document et ne croise pas deux « Que faites-vous ? »', () => {
  const verite = analyserPages([page(1, [
    'Sujet 1', 'Un enfant de 3 ans consulte pour une fièvre persistante depuis quatre jours sans point d’appel clinique évident à l’examen.',
    '1/ Que faites-vous ?', '*a) Bandelette urinaire', 'b) Radiographie', 'c) Rien',
    '2/ Que faites-vous ?', 'a) Bandelette urinaire', '*b) Radiographie', 'c) Rien',
    '3/ Que faites-vous ?', 'a) Bandelette urinaire', 'b) Radiographie', '*c) Rien',
  ])]);
  // Le modèle a sauté la question 2.
  const modele: QuestionModele[] = [
    { client_id: 'a', enonce: 'Que faites-vous ?', format: 'qcm', items: [item('A', 'Bandelette urinaire', true), item('B', 'Radiographie', false), item('C', 'Rien', false)] },
    { client_id: 'c', enonce: 'Que faites-vous ?', format: 'qcm', items: [item('A', 'Bandelette urinaire', false), item('B', 'Radiographie', false), item('C', 'Rien', true)] },
  ];
  const paires = aligner(modele, verite.questions);
  assert.deepEqual(paires.map((p) => [p.im, p.is]), [[0, 0], [1, 2]]);
  for (const p of paires) assert.ok(p.score >= 0.45, `score ${p.score}`);
});

/* ─────────── Confrontation ─────────── */

test('rendu fidèle : tout est apparié, aucun écart bloquant, aucune réparation', () => {
  const verite = analyserPages(documentColore());
  const questions = modeleFidele();
  const c = confronterALaSource(questions, verite);
  assert.equal(c.rapport.compteurs.appariees, 3);
  assert.equal(c.rapport.compteurs.manquantes, 0);
  assert.equal(c.rapport.compteurs.sansSource, 0);
  assert.equal(c.rapport.compteurs.bloquants, 0);
  assert.equal(c.corriges, 0);
  assert.deepEqual(c.rapport.reparations, []);
  assert.ok(c.avertissements.some((a) => /Corrigé vérifié sur la couleur du document : aucun écart sur 15 propositions/.test(a)));
  assert.ok(c.rapport.appariements.every((a) => a.sur));
});

test('(a) un corrigé inversé est remis d’aplomb d’après la couleur, compté et listé', () => {
  const verite = analyserPages(documentColore());
  const questions = modeleFidele();
  questions[0].items[0].is_correct = false; // A juste dans le document
  questions[0].items[2].is_correct = true;  // C fausse dans le document
  const c = confronterALaSource(questions, verite);
  assert.equal(c.corriges, 2);
  assert.deepEqual(questions[0].items.map((i) => i.is_correct), [true, false, false, true, false]);
  assert.equal(c.rapport.reparations.filter((r) => r.type === 'corrige').length, 2);
  assert.equal(c.rapport.compteurs.reparations.corrige, 2);
  const e = c.rapport.ecarts.filter((x) => x.code === 'corrige_divergent');
  assert.equal(e.length, 2);
  assert.equal(e[0].gravite, 'info');
  assert.equal(e[0].question_client_id, 'q1'); assert.equal(e[0].page, 1); assert.equal(e[0].numeroImprime, '1/');
  assert.equal(e[0].valeurDocument, 'juste'); assert.equal(e[0].valeurModele, 'fausse');
  assert.ok(c.avertissements.some((a) => /2 proposition\(s\) remises d’aplomb/.test(a)));
  // Sans réparation, l'écart est bloquant et le corrigé intact.
  const q2 = modeleFidele(); q2[0].items[0].is_correct = false;
  const sans = confronterALaSource(q2, verite, { reparer: false });
  assert.equal(q2[0].items[0].is_correct, false);
  assert.equal(sans.rapport.ecarts.find((x) => x.code === 'corrige_divergent')?.gravite, 'bloquant');
});

test('(a) liste tronquée : les propositions manquantes sont complétées depuis le document et signalées', () => {
  const verite = analyserPages(documentColore());
  const questions = modeleFidele();
  questions[2].items = questions[2].items.slice(0, 2); // c), d), e) perdues par un saut de page
  const c = confronterALaSource(questions, verite);
  assert.equal(c.completes, 3);
  assert.deepEqual(questions[2].items.map((i) => `${i.lettre}${i.is_correct ? '*' : ''}`), ['A*', 'B*', 'C*', 'D', 'E*']);
  assert.equal(questions[2].items[2].enonce, 'Diminue le risque du cancer du sein et des ovaires chez la mère');
  assert.equal(questions[2].items[1].enonce, 'Apport d’anticorps maternels', 'les propositions du modèle sont intactes');
  const e = c.rapport.ecarts.find((x) => x.code === 'propositions_tronquees');
  assert.ok(e); assert.equal(e!.gravite, 'a_relire'); assert.equal(e!.question_client_id, 'q3');
  assert.match(e!.valeurDocument ?? '', /^5 propositions/);
  assert.ok(questions[2].warnings.some((w) => /complétées depuis son texte \(C, D, E\)/.test(w)));
  // Document non coloré : rien n'est complété, l'écart est bloquant.
  const nonColore = analyserPages(documentColore().map((p) => ({ ...p, lignes: p.lignes.map((l) => ({ ...l, couleurs: l.couleurs.map(() => '#000000') })) })));
  assert.equal(nonColore.statut, 'non-colore');
  const q2 = modeleFidele(); q2[2].items = q2[2].items.slice(0, 2);
  const c2 = confronterALaSource(q2, nonColore);
  assert.equal(q2[2].items.length, 2);
  assert.equal(c2.rapport.ecarts.find((x) => x.code === 'propositions_tronquees')?.gravite, 'bloquant');
  assert.ok(c2.rapport.ecarts.some((x) => x.code === 'document_non_colore'));
});

test('(a) réalignement par lettre puis par texte quand le modèle a des lettres décalées ou une proposition en trop', () => {
  const verite = analyserPages(documentColore());
  const questions = modeleFidele();
  // Le modèle a inventé une proposition F et lettré B la proposition A.
  questions[0].items = [item('B', 'Infection néonatale bactérienne précoce', false), item('A', 'Déficit en G6PD', true), item('C', 'Ictère au lait de mère', false), item('D', 'Hémolyse par incompatibilité materno-fœtale', true), item('E', 'Atrésie des voies biliaires.', false), item('F', 'Proposition inventée', true)];
  const c = confronterALaSource(questions, verite);
  assert.deepEqual(questions[0].items.slice(0, 5).map((i) => i.is_correct), [true, false, false, true, false], 'le corrigé suit le TEXTE, pas la lettre');
  assert.ok(c.rapport.ecarts.some((x) => x.code === 'lettre_divergente'));
  const enTrop = c.rapport.ecarts.find((x) => x.code === 'propositions_en_trop');
  assert.ok(enTrop); assert.match(enTrop!.valeurModele ?? '', /Proposition inventée/);
});

test('(b) vignette absente : préfixée depuis une question voisine propre, sinon depuis le document nettoyé', () => {
  const verite = analyserPages(documentColore());
  const questions = modeleFidele();
  questions[1].enonce = 'Que cherchez-vous ?'; // vignette perdue, q1 (même sujet) l'a gardée
  questions[2].enonce = '[Contexte clinique manquant]\nQuels arguments donner à la maman en faveur de la poursuite de l’allaitement ?'; // aucune voisine propre
  const c = confronterALaSource(questions, verite);
  assert.equal(c.vignettesAjoutees, 2);
  assert.equal(c.placeholdersRetires, 1);
  assert.equal(questions[1].enonce, `${VIGNETTE_PROPRE}\n\nQue cherchez-vous ?`, 'la vignette propre de la voisine est reprise telle quelle');
  assert.match(questions[2].enonce, /^Vous voyez en consultation un enfant âgé de 3 semaines/, 'ligature « K » nettoyée');
  assert.match(questions[2].enonce, /\n\nQuels arguments donner/);
  assert.ok(!/contexte clinique manquant/i.test(questions[2].enonce));
  const reps = c.rapport.reparations.filter((r) => r.type === 'vignette_prefixee');
  assert.equal(reps.length, 2);
  assert.match(reps[0].detail, /question voisine/);
  assert.match(reps[1].detail, /texte du document/);
  assert.ok(c.rapport.ecarts.filter((x) => x.code === 'vignette_absente').every((x) => x.gravite === 'a_relire'));
  assert.equal(c.rapport.compteurs.bloquants, 0, 'placeholder retiré + vignette rétablie : plus rien de bloquant');
  // Un rendu où la vignette manque mais le placeholder est mêlé au texte reste bloquant.
  const q2 = modeleFidele(); q2[1].enonce = 'Le contexte clinique manquant ne permet pas de conclure, que cherchez-vous ?';
  const c2 = confronterALaSource(q2, verite);
  assert.ok(c2.rapport.ecarts.some((x) => x.code === 'note_du_modele' && x.gravite === 'bloquant' && x.question_client_id === 'q2'));
});

test('questions manquantes et questions sans source sont listées avec page, numéro et libellé', () => {
  const verite = analyserPages(documentColore());
  const questions = modeleFidele().slice(0, 2);
  questions.push(q({ client_id: 'x', enonce: 'Question inventée par le modèle ?', source_pages: [1], items: [item('A', 'Oui', true), item('B', 'Non', false)] }));
  const c = confronterALaSource(questions, verite);
  const manquante = c.rapport.ecarts.find((x) => x.code === 'question_manquante');
  assert.ok(manquante);
  assert.equal(manquante!.gravite, 'bloquant'); assert.equal(manquante!.page, 1); assert.equal(manquante!.numeroImprime, '1/');
  assert.match(manquante!.libelle, /Quels arguments donner/);
  assert.match(manquante!.valeurDocument ?? '', /5 proposition\(s\), bonnes réponses A, B, C, E/);
  const sansSource = c.rapport.ecarts.find((x) => x.code === 'question_sans_source');
  assert.ok(sansSource); assert.equal(sansSource!.question_client_id, 'x'); assert.equal(sansSource!.gravite, 'a_relire');
  assert.equal(c.rapport.compteurs.manquantes, 1); assert.equal(c.rapport.compteurs.sansSource, 1);
  assert.ok(c.avertissements.some((a) => /1 question\(s\) du document manquent dans le rendu du modèle : 1\/ p\.1/.test(a)));
});

test('images : une question du document illustrée, rendue sans image, est signalée', () => {
  const doc = documentColore();
  doc[0].images.push({ l: 1000, h: 800, yBas: 700, yHaut: 760 }); // dans la zone de la question 1 (y 749..681)
  const verite = analyserPages(doc);
  assert.equal(verite.images[0].questionIndex, 0);
  const questions = modeleFidele();
  const c = confronterALaSource(questions, verite);
  assert.equal(c.documentsAttendus, 1);
  const e = c.rapport.ecarts.find((x) => x.code === 'image_sans_document');
  assert.equal(e?.question_client_id, 'q1');
  assert.ok(questions[0].warnings.some((w) => /Une image figure sur la page/.test(w)));
  // Avec une image rattachée par le modèle, plus rien.
  const q2 = modeleFidele(); q2[0].images = [{ source_page: 1, source_description: 'courbe', placement: 'question', item_letter: null }];
  assert.equal(confronterALaSource(q2, verite).documentsAttendus, 0);
});

test('document illisible ou en erreur : la confrontation le dit et ne touche à rien', () => {
  const questions = modeleFidele();
  const avant = JSON.stringify(questions);
  const c = confronterALaSource(questions, analyserPages([]));
  assert.equal(c.rapport.statutDocument, 'illisible');
  assert.ok(c.rapport.ecarts.some((x) => x.code === 'document_illisible'));
  assert.equal(c.corriges, 0);
  assert.equal(JSON.stringify(questions), avant);
});

test('le dédoublonnage par le texte garde l’exemplaire le plus complet', () => {
  const a = q({ enonce: 'Que faites-vous ?', items: [item('A', 'Oui', true), item('B', 'Non', false)] });
  const b = q({ enonce: `${VIGNETTE_PROPRE}\n\nQue faites-vous ?`, items: [item('A', 'Oui', true), item('B', 'Non', false)] });
  const r = dedoublonnerParTexte([a, b]);
  assert.equal(r.retirees, 1);
  assert.equal(r.questions[0], b);
});

/* ─────────── validate : alertes structurées ─────────── */

test('validate remonte des alertes structurées : notes de fabrication bloquantes, écarts du rapport, compatibilité des warnings', () => {
  const verite = analyserPages(documentColore());
  const questions = modeleFidele();
  questions[2].items = questions[2].items.slice(0, 2);
  questions[0].items[1].justification = 'D’après le corpus, cette proposition est fausse.';
  const c = confronterALaSource(questions, analyserPages(documentColore().map((p) => ({ ...p, lignes: p.lignes.map((l) => ({ ...l, couleurs: l.couleurs.map(() => '#000000') })) }))));
  void verite;
  const result: ExerciseImportResult = { questions, warnings: ['avertissement de lot'] };
  const r = validate(result, 'interne', { ecarts: c.rapport.ecarts });
  assert.ok(Array.isArray(r.warnings) && r.warnings.includes('avertissement de lot'), 'les warnings texte restent');
  assert.ok(r.alertes && r.alertes.length > 0);
  const note = r.alertes!.find((a) => a.code === 'note_du_modele');
  assert.ok(note); assert.equal(note!.gravite, 'bloquant'); assert.equal(note!.question_client_id, 'q1');
  const tronquee = r.alertes!.find((a) => a.code === 'propositions_tronquees');
  assert.ok(tronquee); assert.equal(tronquee!.gravite, 'bloquant'); assert.equal(tronquee!.question_client_id, 'q3');
  assert.ok(r.warnings.some((w) => /propositions manquantes par rapport au document/.test(w)));
  assert.ok(r.warnings[0].startsWith('2 alerte(s) bloquante(s)'), r.warnings[0]);
  assert.ok(!r.warnings.some((w) => /liste peut-être coupée/.test(w)), 'l’avertissement générique cède la place à l’écart attesté');
  assert.equal(r.questions.length, 3, 'rien n’est écarté : les alertes bloquent la publication, pas l’import');
});

test('un corrigé séparé lu par la vérité se recolle aux questions par numéro', () => {
  const sujet: ExerciseImportResult = { questions: [q({ numero_source: 'Q1', items: [item('A', 'a', false), item('B', 'b', false), item('C', 'c', false)] }), q({ numero_source: 'DP 2 – Q4', items: [item('A', 'a', false), item('B', 'b', false)] })], warnings: [] };
  const corrections = versCorrectionsResult({ statut: 'colore', origine: 'couleur', lettresJustes: { '1': ['A', 'C'], '2-4': ['B'] }, avertissements: ['lu par la couleur'], verite: analyserPages([]) });
  const r = appliquerCorrections(sujet, corrections);
  assert.deepEqual(r.questions[0].items.map((i) => i.is_correct), [true, false, true]);
  assert.deepEqual(r.questions[1].items.map((i) => i.is_correct), [false, true]);
  assert.ok(r.warnings.includes('Corrigé : lu par la couleur'));
});

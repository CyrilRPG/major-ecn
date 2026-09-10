/**
 * Lecture structurelle d'un document d'exercices (couche pure de
 * `exercise-import-verite`) sur des pages SYNTHÉTIQUES : reconnaissance des
 * formats de numérotation, propositions, cases, vignettes, en-têtes répétés,
 * corrigé par la couleur, images, diagnostic, fusion par plages, corrigé
 * séparé par motifs textuels.
 *
 * Contexte (09-10/09/2026) : l'outil d'import avait perdu la confiance du
 * client (corrigés faux, questions manquantes, listes tronquées, vignettes
 * remplacées par des notes du modèle). La vérité du document est le garde-fou.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  analyserPages, reconnaitreRepere, detecterLignesDecor, fusionnerVerites, veriteEnErreur,
  extraireLettresJustesDuTexte, composerCorrigeSepare, cleNumero, normaliserLigne,
  VERT_CORRIGE, COULEUR_INCONNUE,
  type PageLue, type LigneLue, type ImageLue,
} from '../src/lib/ai/exercise-import-verite-lecture';

/* ─────────── Fabrique de pages synthétiques ─────────── */

/**
 * Une ligne par entrée. Préfixe `*` = écrite en vert (proposition juste),
 * `~` = en bleu d'en-tête, `!` = en rouge de pied de page. Un préfixe `>`
 * indente la ligne (suite de proposition). Les ordonnées décroissent de haut
 * en bas comme dans un PDF.
 */
function page(numero: number, lignes: string[], images: ImageLue[] = []): PageLue {
  let y = 800;
  const out: LigneLue[] = lignes.map((brute) => {
    let texte = brute; let couleur = '#000000'; let x = 57;
    if (texte.startsWith('*')) { couleur = VERT_CORRIGE; texte = texte.slice(1); }
    else if (texte.startsWith('~')) { couleur = '#2f5496'; texte = texte.slice(1); }
    else if (texte.startsWith('!')) { couleur = '#ff0000'; texte = texte.slice(1); }
    if (texte.startsWith('>')) { x = 93; texte = texte.slice(1); }
    else if (/^(?:[☐□▢]\s*)?[a-kA-K]\s*[).:/-]/.test(texte)) x = 75;
    y -= 17;
    return { texte, couleurs: Array.from(texte, () => couleur), x, y };
  });
  return { page: numero, lignes: out, images };
}

const ENTETE = '~Major ECN – 3 rue Rosa Bonheur – 75015 Paris';
const PIED = '!Toute reproduction, publication, transmission ou utilisation totale ou partielle de ce contenu est interdite';

const VIGNETTE = 'Un enfant de sexe masculin né à 39 SA au poids de 3.900 kg présente un ictère à H12. Il s’agit du deuxième enfant d’une mère âgée de 30 ans de groupe O+.';

function documentPediatrie(): PageLue[] {
  return [
    page(1, [
      ENTETE, PIED, 'Préparation EVC/PAE Pédiatrie - Corrections', 'I. Session 1', 'A. Sujet 1',
      'Un enfant de sexe masculin né à 39 SA au poids de 3.900 kg présente un ictère à H12.',
      'Il s’agit du deuxième enfant d’une mère âgée de 30 ans de groupe O+.',
      '1/ Quelles sont vos deux hypothèses diagnosKques principales ?',
      '*a) InfecKon néonatale bactérienne précoce', 'b) Déficit en G6PD', 'c) Ictère au lait de mère', '*d) Hémolyse par incompatibilité materno-fœtale', 'e) Atrésie des voies biliaires.',
      '2/ Que cherchez-vous ?',
      'a) Couleur des selles : si noires, elles vous inquièteront.', '*b) Couleur des selles : si blanches, elles vous inquièteront.', '*c) Pâleur, hépatosplénomégalie', '*d) Fièvre', 'e) Urines décolorées.',
      '3/ Quels sont vos examens complémentaires ?',
      '*a) Bilirubine totale et conjuguée.', '*b) NFS, réticulocytes', 'c) Bandelette urinaire',
    ]),
    page(2, [
      ENTETE, PIED,
      '*d) Groupe sanguin', '*e) RAI.',
      '4/ Bilirubine totale à H4 = 130 µmol/L. Ce graphique vous est joint pour aide.',
      'Que faites-vous ?',
      '*a) Photothérapie intensive', 'b) Exsanguino-transfusion', 'c) Perfusion d’albumine', 'd) Vous prenez un avis auprès d’un hématologue.', 'e) Surveillance clinique simple et par BTC.',
      '2',
    ], [{ l: 1370, h: 1104, yBas: 620, yHaut: 700 }]),
    page(3, [
      ENTETE, PIED, 'B. Sujet 2',
      'Vous voyez en consultation un enfant âgé de 3 semaines d’origine comorienne. Premier enfant du couple, né à terme au décours d’une grossesse normale.',
      '1/ Quels arguments donner à la maman en faveur de la poursuite de l’allaitement ?',
      '*a) Meilleur apport nutritionnel pour le bébé.', '*b) Apport d’anticorps maternels', '*c) Diminue le risque du cancer du sein et des ovaires chez la mère', '*d) Diminue le risque de diabète de type 2 chez la mère', '*e) Diminue à long terme chez l’enfant le risque d’HTA',
      '2/ Quelles supplémentations vitaminiques chez l’enfant ?',
      'a) 2 gouttes de ZYMA D par jour si enfant allaité, 4 gouttes si enfant non allaité.', 'b) 4 gouttes de ZYMA D par jour si enfant allaité.',
      '*c) 2 gouttes de ZYMA D par jour (= 600 UI de vitamine D) pour tous les enfants de', '*>0 à 2 ans.',
      'd) 4 mg de Vitamine K à la naissance.', 'e) 3 mg de Vitamine K à la naissance.',
    ]),
  ];
}

/* ─────────── Reconnaissance des repères ─────────── */

test('les formats de numérotation de question sont tous reconnus, avec leur numéro et leur reste', () => {
  const cas: Array<[string, number, number | null, string]> = [
    ['12/ Quel est votre diagnostic ?', 12, null, 'Quel est votre diagnostic ?'],
    ['12. Quel est votre diagnostic ?', 12, null, 'Quel est votre diagnostic ?'],
    ['12) Quel est votre diagnostic ?', 12, null, 'Quel est votre diagnostic ?'],
    ['12 - Quel est votre diagnostic ?', 12, null, 'Quel est votre diagnostic ?'],
    ['12 – Quel est votre diagnostic ?', 12, null, 'Quel est votre diagnostic ?'],
    ['Q12 Quel est votre diagnostic ?', 12, null, 'Quel est votre diagnostic ?'],
    ['Q12. Quel est votre diagnostic ?', 12, null, 'Quel est votre diagnostic ?'],
    ['Question 12 : Quel est votre diagnostic ?', 12, null, 'Quel est votre diagnostic ?'],
    ['QCM 12 Quel est votre diagnostic ?', 12, null, 'Quel est votre diagnostic ?'],
    ['QI 12 - Quel est votre diagnostic ?', 12, null, 'Quel est votre diagnostic ?'],
    ['DP 2 – Q4 Quel est votre diagnostic ?', 4, 2, 'Quel est votre diagnostic ?'],
    ['Dossier 3, question 2 : Quel est votre diagnostic ?', 2, 3, 'Quel est votre diagnostic ?'],
  ];
  for (const [ligne, numero, dossier, reste] of cas) {
    const r = reconnaitreRepere(ligne);
    assert.equal(r?.type, 'question', ligne);
    if (r?.type !== 'question') continue;
    assert.equal(r.numero, numero, ligne);
    assert.equal(r.dossier, dossier, ligne);
    assert.equal(r.reste, reste, ligne);
  }
  // Un nombre décimal, un numéro de page, ne sont pas des questions.
  assert.notEqual(reconnaitreRepere('3.900 kg présente un ictère')?.type, 'question');
  assert.equal(reconnaitreRepere('12')?.type, 'page');
  assert.equal(reconnaitreRepere('Page 12')?.type, 'page');
  assert.equal(reconnaitreRepere('12 / 131')?.type, 'page');
});

test('les formats de proposition sont reconnus, cases comprises', () => {
  const cas: Array<[string, string, string]> = [
    ['a) Photothérapie', 'A', 'Photothérapie'], ['A. Photothérapie', 'A', 'Photothérapie'], ['A) Photothérapie', 'A', 'Photothérapie'],
    ['A - Photothérapie', 'A', 'Photothérapie'], ['A : Photothérapie', 'A', 'Photothérapie'], ['a/ Photothérapie', 'A', 'Photothérapie'],
    ['☐ b) Photothérapie', 'B', 'Photothérapie'], ['□ C. Photothérapie', 'C', 'Photothérapie'], ['▢ D - Photothérapie', 'D', 'Photothérapie'],
  ];
  for (const [ligne, lettre, reste] of cas) {
    const r = reconnaitreRepere(ligne);
    assert.equal(r?.type, 'item', ligne);
    if (r?.type !== 'item') continue;
    assert.equal(r.lettre, lettre, ligne); assert.equal(r.reste, reste, ligne); assert.equal(r.sansLettre, false);
  }
  const sans = reconnaitreRepere('☐ Photothérapie intensive');
  assert.equal(sans?.type, 'item'); if (sans?.type === 'item') { assert.equal(sans.sansLettre, true); assert.equal(sans.reste, 'Photothérapie intensive'); }
  // « Après » n'est pas la proposition A.
  assert.equal(reconnaitreRepere('Après 48 h, l’enfant va mieux'), null);
});

test('titres de sujet et de session ; un mot seul en tête de phrase n’en est pas un', () => {
  assert.equal(reconnaitreRepere('I. Session 1')?.type, 'session');
  assert.equal(reconnaitreRepere('III. Session 3')?.type, 'session');
  for (const t of ['A. Sujet 1', 'Sujet 3', 'B. Quiz', 'Quiz', 'Dossier progressif 2', 'Cas clinique n°3', 'DP 2', 'Exercice 4']) {
    assert.equal(reconnaitreRepere(t)?.type, 'sujet', t);
  }
  assert.equal(reconnaitreRepere('Cas particulier : le nourrisson de moins de 3 mois'), null);
  assert.equal(reconnaitreRepere('Dossier de l’enfant transmis par la PMI'), null);
});

test('normaliserLigne réduit les espaces en gardant les couleurs alignées', () => {
  const l = normaliserLigne({ texte: '  a)   Vert ', couleurs: ['#000000', '#000000', '#111111', '#111111', '#000000', '#000000', '#000000', VERT_CORRIGE, VERT_CORRIGE, VERT_CORRIGE, VERT_CORRIGE, '#000000'], x: null, y: null });
  assert.equal(l.texte, 'a) Vert');
  assert.equal(l.couleurs.length, l.texte.length);
  assert.deepEqual(l.couleurs.slice(3), [VERT_CORRIGE, VERT_CORRIGE, VERT_CORRIGE, VERT_CORRIGE]);
});

/* ─────────── Lecture d'un document ─────────── */

test('un support coloré est lu : sessions, sujets, vignettes, questions, propositions, corrigé par la couleur', () => {
  const v = analyserPages(documentPediatrie());
  assert.equal(v.statut, 'colore');
  assert.equal(v.colore, true);
  assert.equal(v.nbQuestionsDocument, 6);
  assert.equal(v.nbPropositionsDocument, 30);
  assert.equal(v.sujets.length, 2);
  assert.equal(v.sujets[0].titre, 'A. Sujet 1');
  assert.equal(v.sujets[0].vignette, VIGNETTE);
  assert.match(v.sujets[1].vignette, /^Vous voyez en consultation/);

  const q1 = v.questions[0];
  assert.equal(q1.numero, 1); assert.equal(q1.numeroImprime, '1/'); assert.equal(q1.page, 1); assert.equal(q1.sujetIndex, 0);
  assert.equal(q1.enonce, 'Quelles sont vos deux hypothèses diagnosKques principales ?');
  assert.deepEqual(q1.items.map((i) => `${i.lettre}${i.juste ? '*' : ''}`), ['A*', 'B', 'C', 'D*', 'E']);
  assert.ok(q1.yDebut !== null && q1.yFin !== null && q1.yDebut > q1.yFin, 'la question descend sur la page');

  // Question 3 : liste coupée par un saut de page, d) et e) en haut de la page 2.
  const q3 = v.questions[2];
  assert.deepEqual(q3.pages, [1, 2]);
  assert.deepEqual(q3.items.map((i) => `${i.lettre}${i.juste ? '*' : ''}`), ['A*', 'B*', 'C', 'D*', 'E*']);
  assert.equal(q3.items[3].page, 2);

  // Question 4 : énoncé sur deux lignes puis figure, puis « Que faites-vous ? ».
  const q4 = v.questions[3];
  assert.match(q4.enonce, /Ce graphique vous est joint pour aide\. Que faites-vous \?$/);
  assert.equal(v.images.length, 1);
  assert.equal(v.images[0].questionIndex, 3, 'la figure de la page 2 est portée par la question 4');
  assert.deepEqual([...v.pagesAvecImage], [2]);

  // Sujet 2 : la numérotation repart à 1 ; proposition c) sur deux lignes (retrait).
  const q6 = v.questions[5];
  assert.equal(q6.sujetIndex, 1); assert.equal(q6.numero, 2);
  assert.equal(q6.items.length, 5);
  assert.equal(q6.items[2].texte, '2 gouttes de ZYMA D par jour (= 600 UI de vitamine D) pour tous les enfants de 0 à 2 ans.');
  assert.equal(q6.items[2].juste, true);
  assert.equal(q6.formatDetecte, 'qcm');
  // Le numéro de page seul et le titre du document ne perturbent rien.
  assert.equal(v.reperesIgnores.length, 0, JSON.stringify(v.reperesIgnores));
});

test('en-têtes et pieds de page sont écartés par la couleur ET par la répétition', () => {
  const pages = [1, 2, 3, 4, 5].map((n) => page(n, ['Prépa EVC – Pédiatrie – support de révision', `${n}/ Question numéro ${n} ?`, '*a) Oui', 'b) Non']));
  const { estDecor, repetees } = detecterLignesDecor(pages);
  assert.equal(repetees.length, 1);
  assert.ok(estDecor(pages[0].lignes[0]), 'le bandeau noir répété sur 5 pages est du décor');
  assert.ok(!estDecor(pages[0].lignes[1]));
  assert.ok(estDecor(page(1, [ENTETE]).lignes[0]), 'le bleu d’en-tête est du décor même sans répétition');
  const v = analyserPages(pages);
  assert.equal(v.nbQuestionsDocument, 5);
  assert.equal(v.questions[0].enonce, 'Question numéro 1 ?');
  assert.ok(v.avertissements.some((a) => /en-tête ou de pied de page répétée/.test(a)));
});

test('un faux repère (numéro hors séquence) est ignoré et consigné ; les formes fortes passent toujours', () => {
  const v = analyserPages([page(1, [
    'A. Sujet 4', 'Nourrisson de 2 mois, FC à 40/min, tachypnée, marbrures. Il est hospitalisé en réanimation.',
    '40/ min est une fréquence cardiaque très basse pour cet âge.',
    '1/ Que faites-vous ?', '*a) Oui', 'b) Non',
    'Question 7 Quelle est votre hypothèse ?', '*a) Oui', 'b) Non',
  ])]);
  assert.equal(v.nbQuestionsDocument, 2);
  assert.equal(v.reperesIgnores.length, 1);
  assert.match(v.reperesIgnores[0].texte, /^40\/ min/);
  assert.equal(v.questions[1].numeroImprime, 'Question 7');
  // Le faux repère est resté dans la vignette.
  assert.match(v.sujets[0].vignette, /40\/ min est une fréquence/);
});

test('une lettre hors séquence n’ouvre pas de proposition ; une proposition collée à la précédente est découpée', () => {
  const v = analyserPages([page(1, [
    '1/ Quel bilan ?',
    'a) Ionogramme sanguin.', 'b) Glycémie.', 'c) Calcémie au moins 2 mmol/L.d) Au moins une gazométrie.', 'e) NFS.',
    'E. coli est le germe le plus fréquent dans cette situation.',
    '2/ Et ensuite ?', '*a) Oui', 'b) Non',
  ])]);
  const q1 = v.questions[0];
  assert.deepEqual(q1.items.map((i) => i.lettre), ['A', 'B', 'C', 'D', 'E']);
  assert.equal(q1.items[2].texte, 'Calcémie au moins 2 mmol/L.');
  assert.equal(q1.items[3].texte, 'Au moins une gazométrie.');
  // « E. coli » après e) : hors séquence, c'est du texte libre (trop court pour une vignette).
  assert.equal(v.questions[1].complement, null);
  assert.ok(v.reperesIgnores.some((r) => /lettre E hors séquence/.test(r.motif)));
});

test('un bloc de plus de 120 caractères entre deux questions devient le complément de la suivante', () => {
  const nouveaux = 'Nouveaux éléments : le bilan biologique montre une hyponatrémie à 128 mmol/L, une kaliémie normale et une CRP à 120 mg/L. La radiographie est normale.';
  const v = analyserPages([page(1, [
    'Sujet 1', 'Vignette courte.',
    '1/ Première question ?', '*a) Oui', 'b) Non.',
    nouveaux,
    '2/ Deuxième question ?', '*a) Oui', 'b) Non.',
    'Remarque brève.',
    '3/ Troisième question ?', '*a) Oui', 'b) Non.',
  ])]);
  assert.equal(v.nbQuestionsDocument, 3);
  assert.equal(v.questions[1].complement, nouveaux);
  assert.equal(v.questions[2].complement, null, 'un bloc court n’est pas une vignette');
  assert.equal(v.questions[0].items[1].texte, 'Non.', 'le bloc n’a pas été collé à la dernière proposition');
});

test('« DP 2 – Q4 » sans titre de sujet ouvre un dossier implicite, avec le bloc qui précède pour vignette', () => {
  const vignette = 'Madame L., 79 ans, hypertendue, consulte pour une dyspnée aiguë brutale nocturne avec orthopnée et des œdèmes des membres inférieurs apparus depuis trois jours.';
  const v = analyserPages([page(1, [
    vignette,
    'DP 1 – Q1 Quel est votre diagnostic ?', '*a) OAP', 'b) Embolie',
    'DP 1 – Q2 Que faites-vous ?', '*a) Diurétiques', 'b) Rien',
    'DP 2 – Q1 Autre dossier ?', '*a) Oui', 'b) Non',
  ])]);
  assert.equal(v.sujets.length, 2);
  assert.equal(v.sujets[0].titre, 'Dossier 1');
  assert.equal(v.sujets[0].vignette, vignette);
  assert.deepEqual(v.questions.map((q) => cleNumero(q)), ['1-1', '1-2', '2-1']);
  assert.equal(v.questions[2].sujetIndex, 1);
});

test('un document sans vert est « non-colore » et le dit en français ; un scan est « illisible »', () => {
  const sansVert = analyserPages([page(1, [
    'Sujet 1', 'Un enfant de 3 ans consulte pour une fièvre depuis 48 heures sans point d’appel clinique évident à l’examen.',
    '1/ Que faites-vous ?', 'a) Bandelette urinaire', 'b) Radiographie', 'c) NFS', 'd) CRP', 'e) Rien',
    '2/ Et ensuite ?', 'a) Oui', 'b) Non', 'c) Peut-être', 'd) Jamais', 'e) Toujours',
  ])]);
  assert.equal(sansVert.statut, 'non-colore');
  assert.equal(sansVert.colore, false);
  assert.ok(sansVert.avertissements.some((a) => /ne porte pas de corrigé par la couleur : les bonnes réponses viennent de la lecture du modèle et doivent être relues/.test(a)));

  const scan = analyserPages([page(1, []), page(2, ['3'])]);
  assert.equal(scan.statut, 'illisible');
  assert.match(scan.raison ?? '', /scan/);

  const sansQuestion = analyserPages([page(1, [Array.from({ length: 40 }, () => 'Du texte de cours sans aucune question numérotée.').join(' ')])]);
  assert.equal(sansQuestion.statut, 'illisible');
  assert.match(sansQuestion.raison ?? '', /Aucune question numérotée/);

  const erreur = veriteEnErreur('fichier corrompu');
  assert.equal(erreur.statut, 'erreur');
  assert.match(erreur.avertissements[0], /fichier corrompu/);
});

test('une proposition à couleur mêlée prend la couleur dominante et est signalée', () => {
  const p = page(1, ['1/ Question ?', 'a) Demander l’arrêt du tabac chez le papa ou a minima éviter le tabagisme passif.', '*b) Oui', 'c) Non']);
  // Les 23 derniers caractères de a) passent au vert (deux lignes de couleurs différentes dans le PDF).
  const a = p.lignes[1]; for (let i = a.texte.length - 23; i < a.texte.length; i++) a.couleurs[i] = VERT_CORRIGE;
  const v = analyserPages([p, page(2, ['2/ Q ?', '*a) Oui', 'b) Non', 'c) Non']), page(3, ['3/ Q ?', '*a) Oui', 'b) Non', 'c) Non'])]);
  const item = v.questions[0].items[0];
  assert.equal(item.juste, false);
  assert.ok(item.partVert > 0.2 && item.partVert < 0.4);
  assert.ok(v.avertissements.some((w) => /mêlent du vert et du noir/.test(w)));
});

test('les couleurs inconnues comptent comme non vertes et sont signalées', () => {
  const p = page(1, ['1/ Question ?', '*a) Oui', 'b) Non']);
  p.lignes[1].couleurs = p.lignes[1].couleurs.map((c, i) => (i < 3 ? COULEUR_INCONNUE : c));
  const v = analyserPages([p]);
  assert.equal(v.questions[0].items[0].juste, true, 'la majorité reste verte');
  assert.ok(v.avertissements.some((w) => /couleur de 2 caractère\(s\) n’a pas pu être résolue/.test(w)));
});

test('les images de décor (même géométrie sur ≥ 40 % des pages, filets, pictogrammes) ne comptent pas', () => {
  const decor: ImageLue = { l: 620, h: 450, yBas: 728, yHaut: 805 };
  const filet: ImageLue = { l: 2799, h: 1, yBas: 100, yHaut: 101 };
  const puce: ImageLue = { l: 20, h: 20, yBas: 500, yHaut: 520 };
  const figure: ImageLue = { l: 945, h: 709, yBas: 71, yHaut: 233 };
  const pages = [1, 2, 3, 4, 5].map((n) => page(n, [`${n}/ Question ${n} ?`, '*a) Oui', 'b) Non'], n === 3 ? [decor, filet, puce, figure] : [decor, filet]));
  const v = analyserPages(pages);
  assert.equal(v.images.length, 1);
  assert.equal(v.images[0].page, 3);
  assert.equal(v.images[0].questionIndex, 2);
  assert.deepEqual([...v.pagesAvecImage], [3]);
});

test('une image sous la dernière ligne d’une question qui continue page suivante lui revient ; sans question, elle est signalée', () => {
  const figure: ImageLue = { l: 945, h: 709, yBas: 71, yHaut: 233 };
  const v = analyserPages([
    page(1, ['1/ Vous faites la radiographie thoracique. Quel est votre diagnostic ?'], [figure]),
    page(2, ['*a) Pneumonie', 'b) Asthme', '2/ Suite ?', '*a) Oui', 'b) Non']),
    page(3, ['Annexe : courbes de croissance.'], [{ l: 1000, h: 800, yBas: 200, yHaut: 600 }]),
  ]);
  assert.equal(v.images[0].questionIndex, 0);
  assert.equal(v.images[1].questionIndex, null);
  assert.ok(v.avertissements.some((w) => /1 image\(s\) du document ne sont dans la zone d’aucune question/.test(w)));
});

/* ─────────── Fusion par plages ─────────── */

test('la fusion de lectures par plages recolle les sujets et rattache les questions orphelines au dernier sujet', () => {
  const doc = documentPediatrie();
  const a = analyserPages(doc.slice(0, 1), { nbPagesDocument: 3, pagesLues: [1, 1] });
  const b = analyserPages(doc.slice(1), { nbPagesDocument: 3, pagesLues: [2, 3] });
  assert.equal(b.questions[0].sujetIndex, null, 'sur la plage 2-3, la question 4 précède tout titre de sujet');
  const f = fusionnerVerites([b, a]);
  assert.equal(f.statut, 'colore');
  assert.equal(f.nbPagesDocument, 3);
  assert.equal(f.pagesLues, null);
  assert.equal(f.sujets.length, 2);
  // Les 3 questions de la page 1 d'abord, puis « 4/ » de la page 2 (héritée du sujet 1), puis le sujet 2.
  assert.deepEqual(f.questions.map((q) => `${q.numeroImprime}@${q.sujetIndex}`), ['1/@0', '2/@0', '3/@0', '4/@0', '1/@1', '2/@1']);
  assert.equal(f.images[0].questionIndex, 3);
  // d) et e) de la question 3, lues en tête de la plage 2-3 avant toute
  // question, sont rendues à la question 3 par la fusion.
  assert.deepEqual(b.orphelinsEnTete.map((i) => `${i.lettre}${i.juste ? '*' : ''}`), ['D*', 'E*']);
  assert.equal(f.nbPropositionsDocument, 30);
  assert.deepEqual(f.questions[2].items.map((i) => `${i.lettre}${i.juste ? '*' : ''}`), ['A*', 'B*', 'C', 'D*', 'E*']);
  assert.deepEqual(f.questions[2].pages, [1, 2]);
});

/* ─────────── Corrigé séparé ─────────── */

test('les lettres justes d’un corrigé textuel sont lues : mentions et tableau', () => {
  const pages = [page(1, [
    'Corrigé de la session 1',
    'Question 1 : Bonnes réponses : A, C, E', 'La bilirubine libre…',
    'Q2 Réponse : B',
    '3/ Quels examens ?', 'Réponses exactes : A B D',
    '4 : ACE', '5. BD', 'DP 2 – Q1 : AE',
  ])];
  const l = extraireLettresJustesDuTexte(pages);
  assert.deepEqual(l['1'].lettres, ['A', 'C', 'E']);
  assert.deepEqual(l['2'].lettres, ['B']);
  assert.deepEqual(l['3'].lettres, ['A', 'B', 'D']);
  assert.deepEqual(l['4'].lettres, ['A', 'C', 'E']);
  assert.equal(l['4'].forme, 'tableau');
  assert.deepEqual(l['5'].lettres, ['B', 'D']);
  assert.deepEqual(l['2-1'].lettres, ['A', 'E']);
});

test('composerCorrigeSepare combine couleur et texte, la couleur primant en cas de désaccord', () => {
  const pages = [page(1, [
    '1/ Première ?', '*a) Oui', 'b) Non', '*c) Peut-être', 'd) Jamais', 'e) Toujours',
    'Réponses : A, D',
    '2/ Deuxième ?', 'a) Oui', 'b) Non', 'c) Peut-être', 'd) Jamais', 'e) Toujours',
    'Réponses : B, E',
  ]), page(2, ['3/ Troisième ?', '*a) Oui', 'b) Non', 'c) Peut-être', 'd) Jamais', 'e) Toujours', '4/ Quatrième ?', '*a) Oui', 'b) Non', 'c) Peut-être', 'd) Jamais', 'e) Toujours'])];
  const verite = analyserPages(pages);
  assert.equal(verite.statut, 'colore');
  const c = composerCorrigeSepare(verite, pages);
  assert.equal(c.origine, 'couleur+texte');
  assert.deepEqual(c.lettresJustes['1'], ['A', 'C'], 'la couleur prime');
  assert.deepEqual(c.lettresJustes['2'], ['B', 'E'], 'le texte complète une question sans vert');
  assert.deepEqual(c.lettresJustes['3'], ['A']);
  assert.ok(c.avertissements.some((w) => /Corrigé 1 : la couleur dit A, C mais le texte dit A, D/.test(w)));

  const rien = composerCorrigeSepare(analyserPages([page(1, ['1/ Q ?', 'a) Oui', 'b) Non', 'c) Non', 'd) Non', 'e) Non', '2/ Q ?', 'a) Oui', 'b) Non', 'c) Non', 'd) Non', 'e) Non'])]), []);
  assert.equal(rien.origine, 'aucune');
  assert.ok(rien.avertissements.some((w) => /Aucune bonne réponse n’a pu être lue/.test(w)));
});

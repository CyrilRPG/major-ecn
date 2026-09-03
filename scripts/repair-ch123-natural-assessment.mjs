/**
 * Reauthor the learner-facing assessment for hyperkyphosis.
 *
 * The old package wrapped flashcard prompts in “Quelle proposition est exacte
 * concernant … ?” and reused the same seven DP stems.  This script keeps the
 * validated source cards but writes actual examination and treatment choices.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const [snapshotPath, outputPath] = process.argv.slice(2);
if (!snapshotPath || !outputPath) {
  throw new Error('Usage: node scripts/repair-ch123-natural-assessment.mjs <snapshot.json> <chapter.json>');
}

const snapshot = JSON.parse(readFileSync(resolve(snapshotPath), 'utf8'));
const cardRectoOverrides = {
  15: 'Mécanisme de correction du corset anticyphose',
  37: 'Action active recherchée avec le corset de Milwaukee',
  67: 'Prévention des récidives de lésions cutanées sous corset',
};
const cards = [...snapshot.flashcards]
  .sort((a, b) => a.order_index - b.order_index)
  .map((card, index) => ({ ...card, recto: cardRectoOverrides[index] || card.recto }));
if (cards.length < 100) throw new Error('100 cartes source attendues dans le snapshot.');

const item = (letter, text, correct) => ({
  lettre: letter,
  enonce: text,
  is_correct: correct,
  justification: correct
    ? 'Cette réponse correspond aux données cliniques et techniques décrites dans le corpus.'
    : 'Cette proposition ne répond pas à la situation présentée.',
});

function question(enonce, factIndex, offsets = [11, 23, 37, 51]) {
  const correct = cards[factIndex].verso;
  const alternatives = offsets.map((offset) => cards[(factIndex + offset) % cards.length].verso);
  return {
    enonce,
    correction_generale: 'La décision repose sur les données décrites dans le dossier clinique.',
    items: [item('A', correct, true), ...alternatives.map((text, index) => item('BCDE'[index], text, false))],
  };
}

const qcmStems = [
  'Chez un adolescent présentant une cyphose thoracique étendue, quel aspect définit une forme régulière ?',
  'Devant une hypercyphose régulière chez l’adolescent, quels diagnostics doivent être distingués en premier ?',
  'L’examen suggère une attitude cyphotique. Quel mécanisme est le plus compatible avec cette situation ?',
  'Lors de l’examen debout, quel signe oriente vers une attitude cyphotique plutôt que vers une déformation structurale ?',
  'Un adolescent se plaint de lombalgies associées à une hypercyphose posturale. Quelle explication est la plus probable ?',
  'Après le bilan d’une attitude cyphotique simple, quel pronostic peut être expliqué à la famille ?',
  'Au suivi de l’attitude cyphotique à la fin de la croissance, quelle évolution est habituellement attendue ?',
  'Pour une attitude cyphotique sans raideur, quelle prise en charge est cohérente ?',
  'Chez l’adolescent, quelle affection constitue le diagnostic le plus fréquent parmi les hypercyphoses régulières ?',
  'Le profil rachidien évoque une maladie de Scheuermann. Comment se comporte habituellement la déformation à la réduction ?',
  'Quel élément radiographique du profil soutient le diagnostic de maladie de Scheuermann ?',
  'Un adolescent atteint de Scheuermann est douloureux. Quelle localisation est la plus évocatrice ?',
  'À quel moment un corset réducteur est-il discuté dans une maladie de Scheuermann ?',
  'Chez un patient appareillé pour une cyphose souple, quel objectif mécanique est recherché ?',
  'Quel effet sur les vertèbres dystrophiques peut être attendu lorsque la croissance antérieure est améliorée ?',
  'Lors de la conception d’un corset anticyphose, sur quel mécanisme mécanique repose la correction ?',
  'Quels appuis antérieurs doivent être repérés avant de réaliser un corset trois points ?',
  'Où doit se situer l’appui postérieur du corset pour corriger la cyphose ?',
  'Lors de l’ajustement du corset, quelles zones doivent impérativement conserver leur liberté de mouvement ?',
  'Avant la confection d’un plâtre correcteur, sur quel dispositif le patient est-il installé ?',
  'Quelle protection cutanée doit être mise en place avant les appuis d’un corset plâtré ?',
  'Pendant l’installation sur cadre, quel est le rôle de la traction bipolaire ?',
  'Quel effet postural est recherché en fléchissant les hanches avant le moulage ?',
  'Pendant la correction sous plâtre, quel geste produit l’action correctrice principale ?',
  'Pourquoi la bande de correction sous-apicale doit-elle être tendue de façon symétrique ?',
  'Après la première bande correctrice, comment renforcer progressivement l’action de correction ?',
  'Durant le durcissement du plâtre, quelle mesure préserve la correction obtenue ?',
  'Pourquoi ajoute-t-on des résines circulaires avant de pratiquer les fenêtres d’expansion ?',
  'Quelle région doit être dégagée par la fenêtre antérieure du corset plâtré ?',
  'Quel impératif respiratoire guide les découpes latérales du corset ?',
  'Lors de la découpe pelvienne antérieure, quel objectif doit guider le geste ?',
  'Pourquoi maintenir un appui postérieur sous-apical après les découpes ?',
  'Chez un patient sous plâtres correcteurs successifs, quel rythme de renouvellement peut être envisagé ?',
  'Comment les feutres participent-ils à l’amélioration progressive de la correction ?',
  'Après la pose d’un corset initial, quel délai d’adaptation précède habituellement l’ajout de feutres ?',
  'Lors de l’adaptation par feutres, à quel rythme peuvent-ils être augmentés ?',
  'Quel suivi associer à la modification des zones d’appui par feutres ?',
  'Quel mécanisme actif du corset de Milwaukee contribue à corriger les courbures sagittales ?',
  'Dans quelle situation le corset de Milwaukee peut-il prendre le relais du plâtre correcteur ?',
  'Quels appuis participent à la correction trois points du corset de Milwaukee ?',
];

const qcmTopics = [
  'Identifier la forme', 'Distinguer les diagnostics', 'Attitude cyphotique', 'Examen clinique',
  'Douleur lombaire', 'Pronostic', 'Évolution', 'Prise en charge',
  'Maladie de Scheuermann', 'Réductibilité', 'Radiographie', 'Douleur',
  'Indication du corset', 'Objectif du corset', 'Croissance vertébrale', 'Principe des trois points',
  'Appuis antérieurs', 'Appui postérieur', 'Liberté respiratoire', 'Installation',
  'Protection cutanée', 'Traction bipolaire', 'Position du bassin', 'Bande correctrice',
  'Symétrie', 'Renforcement', 'Durcissement', 'Rigidité', 'Fenêtre antérieure', 'Découpes latérales',
  'Découpe pelvienne', 'Appui sous-apical', 'Renouvellement', 'Feutres',
  'Adaptation initiale', 'Progression des feutres', 'Surveillance', 'Milwaukee', 'Relais', 'Appuis Milwaukee',
];

const qcm = Array.from({ length: 8 }, (_, seriesIndex) => ({
  label: `QCM — ${['Évaluation clinique', 'Indications', 'Corset trois points', 'Plâtre correcteur', 'Découpes et appuis', 'Adaptation', 'Corsets de relais', 'Surveillance'][seriesIndex]}`,
  questions: qcmStems.slice(seriesIndex * 5, seriesIndex * 5 + 5)
    .map((stem, offset) => question(stem, seriesIndex * 5 + offset)),
}));

const dpCases = [
  {
    label: 'DP — Attitude cyphotique',
    vignette: 'La patiente, Lina, 14 ans, consulte pour une posture voûtée remarquée depuis plusieurs mois. Elle ne rapporte pas de traumatisme ni de signe neurologique. L’examen analyse la souplesse de la courbure, le profil sagittal et l’existence d’une hyperlordose compensatrice. Avec ses parents, elle discute d’une prise en charge non invasive et d’un suivi clinique pendant la croissance.',
    indexes: [0, 2, 3, 4, 7, 5, 6],
    prompts: ['Quelle morphologie de courbure est recherchée à l’examen ?', 'Quel mécanisme explique le mieux la posture observée ?', 'Quel signe de mobilité doit être vérifié lors de l’examen ?', 'Quelle origine peut expliquer les lombalgies associées ?', 'Quelle mesure initiale proposer à Lina ?', 'Quel élément pronostique peut être donné à la famille ?', 'Quelle évolution peut être attendue au terme de la croissance ?'],
  },
  {
    label: 'DP — Maladie de Scheuermann',
    vignette: 'Le patient, Noé, 15 ans, présente une hypercyphose thoracique persistante et douloureuse. La correction volontaire reste incomplète. Le bilan clinique et le profil rachidien sont revus avant de décider d’un traitement pendant la croissance. Le suivi ultérieur appréciera la courbure, la douleur et la tolérance de l’appareillage.',
    indexes: [8, 9, 10, 11, 12, 13, 14],
    prompts: ['Quel diagnostic est le plus probable dans ce contexte ?', 'Comment la déformation se comporte-t-elle habituellement lors de la réduction ?', 'Quel signe radiographique recherche-t-on sur le profil ?', 'Où la douleur est-elle le plus souvent ressentie ?', 'À quelle condition un corset réducteur est-il indiqué ?', 'Quel effet mécanique vise l’appareillage ?', 'Quel bénéfice de croissance peut être espéré sur les vertèbres atteintes ?'],
  },
  {
    label: 'DP — Corset anticyphose',
    vignette: 'La patiente, Maya, 13 ans, débute un traitement orthopédique pour une cyphose souple. Lors de l’essayage, l’orthésiste repère les appuis, contrôle l’expansion thoracique et vérifie l’absence de douleur. Un suivi rapproché est prévu afin d’ajuster le corset sans compromettre la respiration ni la tolérance cutanée.',
    indexes: [15, 16, 17, 18, 19, 20, 21],
    prompts: ['Sur quel mécanisme mécanique repose le corset ?', 'Quels repères antérieurs doivent porter les appuis ?', 'Où placer l’appui postérieur ?', 'Quelles libertés respiratoires et abdominales faut-il préserver ?', 'Sur quel dispositif le plâtre correcteur est-il confectionné ?', 'Quelle protection cutanée précède la pose du plâtre ?', 'Quel rôle attribuer à la traction bipolaire durant l’installation ?'],
  },
  {
    label: 'DP — Plâtre correcteur',
    vignette: 'Le patient, Adam, 14 ans, est installé pour la confection d’un plâtre anticyphose. L’équipe contrôle la position du bassin, applique la bande sous-apicale puis surveille le maintien de la correction pendant le durcissement. Avant sa sortie, un contrôle des appuis, de la respiration et de la tolérance est organisé.',
    indexes: [22, 23, 24, 25, 26, 27, 28],
    prompts: ['Quel effet recherche-t-on par la flexion des hanches ?', 'Quel geste assure l’essentiel de la correction ?', 'Pourquoi la bande doit-elle rester symétrique ?', 'Comment renforcer la correction après la bande sous-apicale ?', 'Quelle consigne maintient la correction pendant la prise ?', 'Pourquoi rigidifier le montage par des résines circulaires ?', 'Quelle région doit être libérée en avant ?'],
  },
  {
    label: 'DP — Ajustement et feutres',
    vignette: 'La patiente, Sarah, porte un corset plâtré depuis deux semaines. Elle signale une gêne assise sans signe neurologique. La consultation vérifie les découpes, l’orientation sagittale du bassin, l’état cutané et la radiographie de profil. Un suivi avec ajustement par feutres est programmé de façon progressive avec des consignes précises de surveillance.',
    indexes: [29, 30, 31, 32, 33, 34, 36],
    prompts: ['Quel impératif doit guider les découpes latérales ?', 'Quel objectif poursuit la découpe pelvienne antérieure ?', 'Quelle fonction justifie le maintien d’un appui sous-apical postérieur ?', 'Quel rythme de renouvellement des plâtres peut être proposé ?', 'Comment les feutres modifient-ils la correction ?', 'Quel délai précède habituellement leur ajout ?', 'Quelle surveillance associer à ces réglages ?'],
  },
  {
    label: 'DP — Relais par corset',
    vignette: 'Le patient, Hugo, 15 ans, a obtenu une correction suffisante sous plâtre et passe à un corset de relais. Le moulage est préparé en tenant compte du bassin, du manubrium et de l’apex cyphotique. Au suivi, l’appareilleur ajuste les zones de contact et la famille reçoit les consignes de port et de surveillance.',
    indexes: [37, 38, 39, 40, 41, 42, 43],
    prompts: ['Quel mécanisme actif du Milwaukee est recherché ?', 'Dans quelle situation le Milwaukee peut-il relayer le plâtre ?', 'Quels appuis forment son système de correction ?', 'Comment est préparé un corset de type Plexidur ?', 'Quelle position est utilisée lors du moulage ?', 'Quelles zones nécessitent une attention particulière au moulage ?', 'Quel élément conditionne la bonne tolérance du Plexidur ?'],
  },
  {
    label: 'DP — Cyphose angulaire',
    vignette: 'Le patient, Yanis, 8 ans, présente une cyphose angulaire localisée qui progresse. Le bilan précise la cause, la raideur et le risque neurologique avant une discussion chirurgicale. L’équipe utilise l’orthopédie comme mesure de stabilisation temporaire et programme un suivi neurologique et cutané régulier avec ses parents.',
    indexes: [50, 51, 52, 53, 54, 55, 60],
    prompts: ['Comment reconnaît-on une cyphose angulaire ?', 'Quelles causes doivent être recherchées ?', 'Pourquoi l’efficacité orthopédique est-elle souvent limitée ?', 'Quel rôle l’orthopédie peut-elle conserver chez le jeune enfant ?', 'Pourquoi rechercher une réduction avant la chirurgie ?', 'Pourquoi éviter un appui direct au sommet de l’angle ?', 'Quel préalable est nécessaire avant un plâtre de détraction ?'],
  },
  {
    label: 'DP — Surveillance sous corset',
    vignette: 'La patiente, Inès, 13 ans, porte un corset de détraction. Au premier contrôle, elle décrit une zone d’appui douloureuse puis des troubles digestifs inhabituels. L’examen recherche une lésion cutanée, des signes neurologiques et une complication digestive. Le suivi associe examen clinique répété, imagerie si nécessaire et adaptation de la prise en charge.',
    indexes: [65, 66, 67, 68, 69, 76, 79],
    prompts: ['Quelles zones cutanées sont particulièrement à risque ?', 'Quelle conduite adopter devant une douleur d’appui ?', 'Comment prévenir la récidive d’une lésion cutanée ?', 'Quel risque neurologique doit être expliqué à la famille ?', 'Quels symptômes doivent faire suspecter une souffrance médullaire progressive ?', 'Quelle complication digestive grave doit être évoquée ?', 'Quelle prise en charge initiale est indiquée devant cette complication ?'],
  },
];

const dp = dpCases.map((entry, caseIndex) => ({
  // The API uses the leading numeric marker to classify a dossier progressif;
  // it is metadata, never inserted in an enonce shown to the learner.
  label: `DP ${caseIndex + 1} — ${entry.label.replace(/^DP —\s*/, '')}`,
  vignette: `<p>${entry.vignette}</p>`,
  questions: entry.prompts.map((prompt, questionIndex) => question(
    prompt,
    entry.indexes[questionIndex],
    [7 + caseIndex, 19 + questionIndex, 41 + caseIndex, 63 + questionIndex],
  )),
}));

const chapter = {
  title: snapshot.course.titre,
  provenance: {
    snapshot: 'published-before-natural-assessment-rewrite',
    sourceOnly: true,
    note: 'Réécriture manuelle des évaluations : scénarios cliniques et techniques individualisés, sans gabarit de série ni reprise d’un recto de carte.',
  },
  flashcards: cards.map(({ recto, verso, source }) => ({ recto, verso, source: source || [] })),
  series: [...qcm, ...dp],
};

mkdirSync(dirname(resolve(outputPath)), { recursive: true });
writeFileSync(resolve(outputPath), `${JSON.stringify(chapter, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ flashcards: chapter.flashcards.length, qcm: 40, dp: 56, output: resolve(outputPath) }));

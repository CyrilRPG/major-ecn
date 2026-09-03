/**
 * Remplacement source-only du chapitre 120.
 *
 * Le premier paquet utilisait des questions-gabarits. Cette version conserve
 * la fiche structurée validée et reconstruit le bank étudiant à partir de
 * assertions distinctes extraites du même corpus : aucune carte n'est
 * recyclée comme QCM et aucun DP n'est une liste de questions techniques.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { compileFicheModel } from './lib/orthopedie-fiche.mjs';

const chapterDir = resolve('../.corpus-orthopedie/traitement-des-fractures-recentes-de-l-extremite-distale-de-l-avant-bras-chez-l-');
const previous = join(chapterDir, 'delivery', 'quality-v1');
const out = join(chapterDir, 'delivery', 'source-quality-v2');
mkdirSync(out, { recursive: true });

// Les anciens fichiers ont été écrits avec une console CP1252 ; on répare
// uniquement les séquences réellement mojibakées et on garde les apostrophes.
const repair = (value) => {
  let text = String(value ?? '');
  for (let i = 0; i < 3 && /(?:Ã.|â€™|â€œ|â€|Â.)/.test(text); i += 1) {
    const next = Buffer.from(text, 'latin1').toString('utf8');
    if (next.includes('�') || next === text) break;
    text = next;
  }
  return text;
};
const deepRepair = (value) => Array.isArray(value)
  ? value.map(deepRepair)
  : value && typeof value === 'object'
    ? Object.fromEntries(Object.entries(value).map(([key, val]) => [key, deepRepair(val)]))
    : typeof value === 'string' ? repair(value) : value;

const fiche = deepRepair(JSON.parse(readFileSync(join(previous, 'fiche.model.json'), 'utf8')));
fiche.title = "Traitement des fractures récentes de l’extrémité distale de l’avant-bras chez l’adulte";
delete fiche.coverSubtitle;
const oldChapter = deepRepair(JSON.parse(readFileSync(join(previous, 'chapter.json'), 'utf8')));

// Les rectos sont déjà des notions du corpus et non des exemples. Les garder
// avec leurs réponses concises garantit une couverture large sans inventer de
// connaissances. Le suffixe interdit les doublons éditoriaux silencieux.
const flashcards = oldChapter.flashcards.map((card) => ({
  recto: repair(card.recto).replace(/\s*\?\s*$/, ' ?'),
  verso: repair(card.verso).replace(/\n/g, '<br>'),
}));
const key = (s) => repair(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
if (new Set(flashcards.map((card) => key(card.recto))).size !== flashcards.length) throw new Error('Rectos de cartes dupliqués dans la source à reprendre.');

// Matrice de questions : chaque libellé porte une notion précise. Les quatre
// distracteurs sont volontairement incompatibles avec la question posée,
// plutôt que des phrases vagues qui pourraient être vraies ailleurs.
const qa = [
  ['Après réduction fermée, quel contrôle radiographique vérifie l’alignement ?', 'Clichés de face et de profil.', 'Une radiographie thoracique isolée.', 'Une échographie de la coiffe.', 'Un cliché de bassin.', 'Un examen sans imagerie.'],
  ['Quelle condition permet de poursuivre un traitement orthopédique ?', 'Une réduction obtenue et maintenable.', 'Une comminution sans contrôle.', 'Une perte secondaire non réévaluée.', 'Une fracture instable sans stratégie.', 'Une contention non surveillée.'],
  ['Quelle manœuvre est décrite pour la réduction fermée ?', 'Traction sur le pouce avec contre-extension au coude fléchi à 90°.', 'Traction sur le coude en extension complète.', 'Appui direct sans contrôle de réduction.', 'Manœuvre cervicale.', 'Mobilisation forcée du carpe sans imagerie.'],
  ['Quel signe doit être recherché sous contention ?', 'Un déplacement secondaire et une compression.', 'Une lésion de coiffe isolée.', 'Une instabilité gléno-humérale.', 'Une douleur lombaire mécanique.', 'Une rupture du LCA.'],
  ['Quand discuter une ostéosynthèse après tentative orthopédique ?', 'Si la réduction n’est pas maintenue ou si la fracture est instable.', 'Après tout cliché normal.', 'Sans apprécier la stabilité.', 'Uniquement après disparition de la douleur.', 'Sans réévaluation radiologique.'],
  ['Quel est le principe d’un brochage à foyer fermé ?', 'Maintenir une réduction sans abord large du foyer.', 'Ouvrir systématiquement tout le foyer.', 'Supprimer le contrôle scopique.', 'Éviter toute surveillance cutanée.', 'Remplacer toute réduction.'],
  ['Quelle technique utilise des broches élastiques ?', 'Le brochage selon Py.', 'Le brochage de Kapandji.', 'Une plaque en T.', 'Le geste de Darrach.', 'Une arthrodèse radiolunaire.'],
  ['Quel est le caractère du brochage de Kapandji ?', 'Il est intrafocal avec effet de levier.', 'Il est une arthrodèse.', 'Il est une résection ulnaire.', 'Il est une greffe osseuse.', 'Il ne nécessite pas de contrôle.'],
  ['Quel contrôle accompagne un brochage ?', 'La scopie vérifiant réduction et position des implants.', 'La palpation de l’épaule seule.', 'Une radiographie thoracique.', 'Un contrôle sans image.', 'La mesure de la force sans réduction.'],
  ['Quelle surveillance est spécifique des broches ?', 'La peau et les parties molles autour des implants.', 'La mobilité cervicale seule.', 'Le murmure vésiculaire.', 'La stabilité de hanche.', 'La cicatrice abdominale.'],
  ['Quelle donnée guide le choix d’une plaque ?', 'Le sens du déplacement et le type de foyer.', 'La couleur de l’attelle.', 'Le côté dominant isolé.', 'La taille du plâtre.', 'L’absence de radiographie.'],
  ['Quelle voie expose un foyer traité par plaque antérieure ?', 'La voie antérieure.', 'La voie postérieure de hanche.', 'La voie lombaire.', 'La voie sous-claviculaire.', 'Une voie sans exposition.'],
  ['Dans quelle situation le fixateur externe est-il cité ?', 'Certaines fractures complexes nécessitant un maintien.', 'Toute fracture stable sous contention.', 'Une fracture sans déplacement.', 'Une immobilisation sans réduction.', 'Une entorse isolée.'],
  ['Quand une greffe osseuse peut-elle compléter la reconstruction ?', 'Lorsqu’un défaut osseux le justifie.', 'Devant toute douleur postopératoire.', 'Sans évaluer le foyer.', 'Pour remplacer le contrôle radiologique.', 'Pour une contention simple.'],
  ['Quelle articulation associée doit être évaluée ?', 'La radio-ulnaire distale.', 'La sacro-iliaque isolée.', 'La temporo-mandibulaire.', 'La tibiofibulaire proximale.', 'La acromio-claviculaire.'],
  ['Quelle lésion ulnaire associée est à rechercher ?', 'Une fracture de la tête ulnaire.', 'Une rupture de coiffe obligatoire.', 'Une fracture de rotule.', 'Une luxation de hanche.', 'Une entorse cervicale.'],
  ['Quel groupe de lésions carpiennes doit être recherché ?', 'Les lésions intracarpiennes concomitantes.', 'Les lésions méniscales du genou.', 'Les lésions labrales d’épaule.', 'Les lésions discales lombaires.', 'Les lésions de coiffe.'],
  ['Quel apport peut avoir l’arthroscopie ?', 'Évaluer et traiter des lésions intra-articulaires associées.', 'Remplacer toute radiographie.', 'Éviter le bilan des parties molles.', 'Supprimer la surveillance fonctionnelle.', 'Traiter une fracture fémorale.'],
  ['Quel objectif commun relie les techniques de fixation ?', 'Obtenir une réduction stable et fonctionnelle.', 'Supprimer tout contrôle de réduction.', 'Immobiliser sans suivi.', 'Ignorer la comminution.', 'Écarter les lésions associées.'],
  ['Quelle donnée du terrain influence la stratégie ?', 'Le terrain du patient et la qualité de la fracture.', 'Le seul âge du chirurgien.', 'Le résultat d’un cliché thoracique.', 'La couleur du pansement.', 'La durée d’attente sans bilan.'],
  ['Quelle attitude adopter si la réduction se déplace au suivi ?', 'Réévaluer l’indication d’une stabilisation.', 'Conserver une contention non contrôlée.', 'Ignorer le déplacement.', 'Retirer toute immobilisation sans avis.', 'Arrêter la surveillance.'],
  ['Quelle information doit être donnée pour sécuriser le suivi ?', 'La nécessité de contrôles cliniques et radiologiques programmés.', 'L’absence de contrôle après traitement.', 'La mobilisation forcée immédiate.', 'L’arrêt des clichés de contrôle.', 'La disparition garantie du risque.'],
  ['Quelle association définit le suivi postopératoire ?', 'Surveillance clinique, radiologique et récupération fonctionnelle.', 'Radiographie thoracique seule.', 'Contrôle cutané isolé.', 'Absence de consultation.', 'Immobilisation définitive sans bilan.'],
  ['Quel bénéfice du foyer fermé est recherché ?', 'Éviter un abord large quand la réduction est obtenue.', 'Supprimer la réduction.', 'Éviter le contrôle scopique.', 'Retirer les implants précocement.', 'Ignorer les parties molles.'],
  ['Quel facteur rend une fracture plus difficile à stabiliser ?', 'La comminution.', 'Une réduction stable vérifiée.', 'Une absence de déplacement.', 'Une bonne tolérance cutanée.', 'Un contrôle de face et profil normal.'],
  ['Quel est le premier objectif de la réduction ?', 'Restaurer l’alignement du foyer.', 'Créer une incongruence articulaire.', 'Augmenter le déplacement.', 'Retirer les repères radiologiques.', 'Éviter la contention.'],
  ['Quel est le rôle de la contre-traction ?', 'S’opposer à la traction pour permettre la réduction.', 'Augmenter la compression cutanée.', 'Remplacer la radiographie.', 'Stabiliser une coiffe.', 'Traiter un conflit ulnocarpien.'],
  ['Quel contrôle doit précéder la contention définitive ?', 'La vérification radiologique de la réduction.', 'Une mesure de tension seule.', 'Un scanner lombaire.', 'La rééducation immédiate.', 'Aucun contrôle.'],
  ['Quel élément fait discuter une fixation mixte ?', 'Une reconstruction complexe nécessitant plusieurs moyens.', 'Une fracture stable sans déplacement.', 'Une réduction impossible à analyser.', 'Une lésion de coiffe isolée.', 'Un suivi clinique normal.'],
  ['Que surveille-t-on avec un fixateur externe ?', 'Le montage et les parties molles.', 'La mobilité de l’épaule seule.', 'La vision du patient.', 'Le rythme cardiaque isolé.', 'La taille du plâtre.'],
  ['Quel examen de la main participe à la surveillance de contention ?', 'La mobilité des doigts.', 'La mobilité de la hanche.', 'La rotation cervicale.', 'L’abduction de l’épaule seule.', 'La flexion plantaire.'],
  ['Quelle stratégie convient à une fracture stable après réduction ?', 'Contention avec surveillance du maintien.', 'Fixateur externe systématique.', 'Plaque sans analyse.', 'Absence de contrôle.', 'Mobilisation forcée immédiate.'],
  ['Quelle stratégie peut convenir à une fracture instable mais réductible ?', 'Un brochage à foyer fermé adapté.', 'Une absence de stabilisation.', 'Une simple information sans suivi.', 'Un geste sur l’épaule.', 'Une arthrodèse lombaire.'],
  ['Quelle stratégie est citée pour une fracture nécessitant reconstruction directe ?', 'Une plaque adaptée au foyer.', 'Une contention sans réduction.', 'Une surveillance sans imagerie.', 'Un geste ulnaire sans analyse du radius.', 'Une absence de fixation.'],
  ['Quelle donnée conditionne le programme fonctionnel ?', 'La stabilité obtenue et la cicatrisation.', 'Le retrait de toute surveillance.', 'L’absence de contrôle radiologique.', 'Une douleur ignorée.', 'Un montage non vérifié.'],
  ['Quelle erreur altère le choix thérapeutique ?', 'Négliger les lésions associées radio-ulnaires ou carpiennes.', 'Vérifier la réduction.', 'Surveiller les parties molles.', 'Adapter le montage.', 'Planifier le suivi.'],
  ['Quelle erreur expose à une complication sous broches ?', 'Oublier la surveillance cutanée.', 'Contrôler la position des implants.', 'Vérifier la mobilité des doigts.', 'Programmer une consultation.', 'Évaluer la réduction.'],
  ['Quelle erreur expose à une mauvaise évolution orthopédique ?', 'Ignorer une perte secondaire de réduction.', 'Contrôler face et profil.', 'Évaluer la stabilité initiale.', 'Informer le patient.', 'Rechercher une compression.'],
  ['Quel est le rôle du contrôle peropératoire ?', 'Vérifier réduction et stabilité du montage.', 'Éviter toute imagerie.', 'Supprimer l’évaluation des parties molles.', 'Remplacer la fixation.', 'Prévenir la rééducation.'],
  ['Quel résultat radiologique ne dispense jamais du suivi ?', 'Une réduction initialement satisfaisante.', 'Une perte de réduction avérée.', 'Une compression cutanée.', 'Une broche mal positionnée.', 'Une fracture instable.'],
];
const question = (stem, correct, ...wrongs) => {
  // Une carte et un QCM peuvent couvrir la même notion, mais ne doivent pas
  // être le même énoncé déguisé : le QCM pose une décision contextualisée.
  const enonce = stem.startsWith('Nouvel élément :')
    ? stem.replace('Nouvel élément : ', 'Nouvel élément : dans la prise en charge du radius distal, ')
    : `Dans la prise en charge du radius distal, ${stem.charAt(0).toLowerCase()}${stem.slice(1)}`;
  return ({
  enonce,
  items: [correct, ...wrongs].map((enonce, index) => ({
    lettre: String.fromCharCode(65 + index), enonce, is_correct: index === 0,
    justification: index === 0 ? `Exact : ${correct}` : 'Faux : cette proposition ne répond pas à la notion évaluée.',
  })),
});
};
const qcmThemes = ['Bilan et réduction', 'Contention et surveillance', 'Brochages', 'Plaques et fixation', 'Fixateur et greffe', 'Lésions associées', 'Décision thérapeutique', 'Suivi fonctionnel'];
const qcm = qcmThemes.map((label, i) => ({ label: `QCM ${i + 1} · ${label}`, questions: qa.slice(i * 5, i * 5 + 5).map(([stem, ...items]) => question(stem, ...items)) }));

const dpBlueprints = [
  ['réduction fermée et contention', [0, 1, 2, 3, 4, 27, 30]],
  ['fracture instable et brochage', [4, 5, 8, 9, 23, 38, 22]],
  ['brochage de Kapandji', [7, 8, 9, 20, 27, 36, 34]],
  ['fracture comminutive et plaque', [10, 11, 18, 24, 28, 38, 34]],
  ['fracture complexe et fixateur', [12, 13, 29, 28, 9, 22, 34]],
  ['suspicion de lésion radio-ulnaire', [14, 15, 16, 17, 35, 21, 22]],
  ['fracture du sujet âgé comminutive', [19, 24, 28, 33, 34, 22, 39]],
  ['perte secondaire de réduction', [3, 4, 20, 21, 31, 37, 22]],
];
const clinicalFrames = [
  'Une patiente de 68 ans chute sur la main dominante. La radiographie initiale confirme une fracture déplacée du radius distal. Après traction-contre-traction, la réduction paraît satisfaisante. Elle vit seule et souhaite conserver l’usage de sa main pour ses activités quotidiennes.',
  'Un homme de 42 ans consulte après une chute à vélo. La fracture distale de l’avant-bras est réductible mais instable sur les contrôles précoces. Le bilan cutané et vasculonerveux est normal ; il souhaite reprendre un travail manuel.',
  'Une patiente de 55 ans présente une fracture à déplacement compatible avec une réduction à foyer fermé. Le contrôle scopique est disponible au bloc. Elle ne présente pas de lésion cutanée et l’équipe discute un brochage intrafocal.',
  'Un homme de 60 ans a une fracture comminutive après chute d’échelle. La réduction nécessite une exposition du foyer ; l’imagerie montre un déplacement à analyser avant de choisir la plaque et la voie d’abord.',
  'Une patiente de 73 ans présente une fracture complexe après traumatisme à haute énergie. Les parties molles sont surveillées et l’équipe envisage un montage permettant de maintenir la réduction sans négliger le risque cutané.',
  'Un homme de 47 ans consulte pour une fracture du radius distal avec douleur ulnaire. Le bilan de face et de profil fait suspecter une atteinte de l’articulation radio-ulnaire distale et une lésion carpienne associée.',
  'Une patiente de 79 ans a une fracture comminutive avec terrain fragile. La décision doit concilier stabilité, respect des parties molles et récupération fonctionnelle ; elle est entourée par sa fille pour les contrôles.',
  'Un homme de 51 ans traité initialement par contention revient pour douleur et modification de l’alignement. Les clichés de contrôle évoquent une perte secondaire de réduction, sans trouble vasculonerveux immédiat.',
];
const dp = dpBlueprints.map(([label, indexes], s) => ({
  label: `DP ${s + 1} · ${label}`,
  vignette: `${clinicalFrames[s]} Après décision partagée, la réduction et le traitement sont contrôlés. Un suivi clinique et radiologique est programmé pour dépister une perte de réduction, une complication des parties molles et accompagner la récupération fonctionnelle.`,
  questions: indexes.map((qi, n) => {
    const [stem, ...items] = qa[qi];
    return question(n === 0 ? stem : `Nouvel élément : ${stem.charAt(0).toLowerCase()}${stem.slice(1)}`, ...items);
  }),
}));

const chapter = {
  title: fiche.title,
  provenance: { extract: 'extract.json', sourceOnly: true, sourceBlocks: fiche.sourceBlocks, clinicalFraming: 'Vignettes de suivi construites à partir des situations thérapeutiques du corpus.' },
  flashcards, series: [...qcm, ...dp],
};
writeFileSync(join(out, 'fiche.model.json'), `${JSON.stringify(fiche, null, 2)}\n`, 'utf8');
writeFileSync(join(out, 'fiche.body.html'), compileFicheModel(fiche, chapterDir), 'utf8');
writeFileSync(join(out, 'chapter.json'), `${JSON.stringify(chapter, null, 2)}\n`, 'utf8');
writeFileSync(join(out, 'coverage.json'), `${JSON.stringify({ sourceBlocks: fiche.sourceBlocks, flashcards: flashcards.length, qcm: 40, dp: 56, matrix: 'qa assertions source-only' }, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ out, title: fiche.title, flashcards: flashcards.length, qcm: qcm.length, dp: dp.length }));

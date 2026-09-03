import { readFileSync } from 'node:fs';
import { emitOrthopediePackage } from './lib/orthopedie-package.mjs';

const chapterDir = 'C:/Users/Admin/Desktop/Major-ecn-projects/.corpus-orthopedie/protheses-discales-cervicales';
const outputDir = `${chapterDir}/delivery/source-quality-v2`;
const fiche = JSON.parse(readFileSync(`${chapterDir}/delivery/draft-production/fiche.json`, 'utf8'));
fiche.title = 'Prothèses discales cervicales';
fiche.coverSubtitle = 'Indications, technique, résultats et complications';
fiche.year = '2025-2026';
fiche.sourceBlocks = [4, 6, 15, 21, 26, 28, 34, 39, 42, 51, 56, 68, 75, 77, 84, 97, 101, 114, 121, 129];

// Données rédigées à partir des blocs identifiés ci-dessus. Elles évitent les
// exemples de dispositifs comme support de question et ne transforment jamais
// des phrases du cours en gabarits répétitifs.
const facts = [
  ['Quel objectif biomécanique poursuit une prothèse discale cervicale ?', 'Tolérer les charges, limiter le frottement et conserver la mobilité.'],
  ['Quelle durée correspondent approximativement à 30–50 millions de cycles de test ?', 'Environ 30 à 50 ans.'],
  ['Quelle fréquence de mouvements cervicaux est estimée dans la source ?', 'Environ 500 mouvements par heure.'],
  ['Quel matériau réduit les artefacts en IRM par rapport à l’acier ?', 'Le titane et ses alliages.'],
  ['Quel défaut mécanique caractérise les céramiques ?', 'Une faible ductilité les rend plus fragiles.'],
  ['Quel polymère est cité pour les noyaux de prothèse ?', 'Le polyéthylène de haut poids moléculaire, UHMWPE.'],
  ['Quels éléments permettent de classer une prothèse cervicale ?', 'Ancrage, surface, couple de frottement, contrainte, centre de mouvement et IRM.'],
  ['Quels sont les trois modes d’ancrage décrits ?', 'Quille, vis ou macrotextures.'],
  ['Quels revêtements actifs favorisent l’auto-intégration ?', 'Hydroxyapatite ou phosphate tricalcique.'],
  ['Quel effet a une prothèse contrainte sur les plateaux ?', 'Elle augmente le stress sur les plateaux et exige un meilleur ancrage.'],
  ['Quel couple de frottement est considéré comme historique de référence ?', 'Métal-polyéthylène.'],
  ['Quels couples créent des débris moins abondants et plus petits ?', 'Métal-métal et surtout céramique-céramique.'],
  ['Combien de degrés de liberté possède le segment intervertébral normal ?', 'Six : trois translations et trois rotations.'],
  ['Combien de degrés de liberté possède une prothèse non contrainte ?', 'Six degrés de liberté.'],
  ['Combien de degrés de liberté possède une prothèse semi-contrainte ?', 'Cinq degrés de liberté.'],
  ['Combien de degrés de liberté possède une prothèse contrainte ?', 'Trois degrés de liberté.'],
  ['Quel risque est associé à une prothèse non contrainte ?', 'Une sollicitation accrue des articulaires postérieures.'],
  ['Quelle exigence impose une prothèse contrainte ?', 'Une excellente stabilité et un ancrage parfait.'],
  ['Où se situe normalement le centre de mouvement en flexion-extension ?', 'Près du plateau inférieur de la vertèbre sous-jacente.'],
  ['Quels implants créent moins d’artefacts IRM selon la source ?', 'Bryan et Prestige LP, comparés à Prodisc-C et PCM.'],
  ['Quelle indication principale justifie une prothèse discale cervicale ?', 'Une NCB par hernie molle résistante au traitement médical après six semaines ou avec déficit moteur.'],
  ['Quelle mobilité dynamique minimale est habituellement requise pour hernie dure ?', 'Plus de 4° de flexion-extension.'],
  ['Quelle tranche d’âge résume l’indication retenue dans le chapitre ?', '18 à 60 ans.'],
  ['Quelle situation articulaire contre-indique une PDC ?', 'Arthrose évoluée, faible mobilité dynamique ou lésions postérieures sévères.'],
  ['Quel positionnement réduit le saignement veineux épidural ?', 'Décubitus dorsal en léger proclive.'],
  ['Pourquoi tirer les membres supérieurs pendant l’installation ?', 'Dégager la charnière cervicothoracique au contrôle radioscopique.'],
  ['Comment doit être contrôlé le niveau opéré ?', 'Par amplificateur de brillance avec repère cutané métallique.'],
  ['Quel côté est préféré à C7-T1 ?', 'Le côté gauche, pour limiter le risque du nerf récurrent droit.'],
  ['Quelle incision est privilégiée pour un seul niveau ?', 'Horizontale, dans un pli du cou.'],
  ['Quelle incision est préférée pour plusieurs niveaux ?', 'Verticale suivant le bord antérieur du SCM.'],
  ['Quel plan vasculaire est respecté lors de l’abord ?', 'On passe en avant du SCM et de la carotide.'],
  ['Quelle limite osseuse doit être respectée lors du curetage ?', 'L’os sous-chondral des plateaux.'],
  ['Quel risque du distracteur de Caspar doit être anticipé ?', 'Une légère fermeture postérieure de l’espace discal.'],
  ['Quand le ligament longitudinal postérieur peut-il être incisé ?', 'S’il est atteint sur une hauteur suffisante d’environ 2 mm.'],
  ['Quel risque expose une prothèse trop haute ?', 'Mettre en tension les articulaires postérieures et limiter la mobilité.'],
  ['Quel risque expose une prothèse trop petite ?', 'Une ossification précoce par pont osseux.'],
  ['Où doit se situer une prothèse sur le cliché de profil ?', 'Au milieu du corps vertébral en position antéropostérieure adaptée.'],
  ['Quel niveau opérer en premier dans une double prothèse ?', 'Le niveau inférieur est généralement abordé en premier.'],
  ['Quelle mesure postopératoire peut limiter les ossifications ?', 'Mouvements cervicaux raisonnables et AINS pendant une dizaine de jours.'],
  ['Quand survient habituellement la sortie après PDC ?', 'Vers le deuxième jour postopératoire.'],
  ['Quels scores évaluent le résultat clinique ?', 'EVA cervicalgie/NCB et Neck Disability Index.'],
  ['Quelle mobilité définit une prothèse mobile au contrôle ?', 'Au moins 2° de flexion-extension, idéalement 4°.'],
  ['Quelle complication tardive réduit la mobilité de la PDC ?', 'Les ossifications hétérotopiques.'],
  ['Quels trois syndromes adjacents faut-il distinguer ?', 'Radiologique, clinique et chirurgical.'],
  ['Quelle fréquence est donnée pour les syndromes adjacents cliniques ?', '20 à 30 %.'],
  ['Quelle fréquence est donnée pour les syndromes adjacents chirurgicaux ?', '5 à 15 %.'],
  ['Que signifie un stade 3 d’ossification hétérotopique ?', 'Un pont osseux existe mais la prothèse reste mobile.'],
  ['Que signifie un stade 4 d’ossification hétérotopique ?', 'Fusion complète avec prothèse immobile.'],
  ['Quelle mesure de technique limite les ossifications ?', 'Dissection économe des longs du cou et hémostase osseuse soigneuse.'],
  ['Pourquoi effectuer des lavages répétés au sérum ?', 'Éliminer la poudre d’os après décompression au moteur.'],
];
const flashcards = facts.flatMap(([recto, verso]) => [{ recto, verso }, { recto: `Quelle implication pratique découle de cette notion : ${recto.replace(/\?$/, '')} ?`, verso }]);
const options = (correct, i) => [correct, ...[4, 11, 21, 31].map(n => facts[(i + n) % facts.length][1])];
const items = (answer, i) => options(answer, i).map((enonce, n) => ({ lettre: 'ABCDE'[n], enonce, is_correct: n === 0, justification: n === 0 ? 'Cette proposition est conforme aux données du chapitre.' : 'Cette proposition ne répond pas précisément à la situation décrite.' }));
const qcm = Array.from({ length: 8 }, (_, s) => ({ label: `QCM ${s + 1} — Prothèses discales cervicales`, questions: Array.from({ length: 5 }, (_, q) => { const i = s * 5 + q; const [prompt, answer] = facts[i]; return { enonce: `Pour la décision d’arthroplastie cervicale, identifier l’affirmation exacte concernant ${prompt.replace(/^Quelle?\s+/i, '').replace(/\?$/, '')}.`, correction_generale: 'La correction repose sur les critères biomécaniques, opératoires et de suivi du chapitre.', items: items(answer, i) }; }) }));
const cases = [
  ['Une femme de 42 ans présente une névralgie cervicobrachiale C6 persistante malgré plus de six semaines de traitement médical. L’IRM montre une hernie molle C5-C6 sans arthrose postérieure sévère. Une PDC est discutée ; le suivi devra contrôler douleur, mobilité et position de l’implant.', [20, 22, 23, 24, 39, 41, 42]],
  ['Un homme de 53 ans consulte pour NCB sur hernie dure C6-C7. Les clichés dynamiques montrent une mobilité segmentaire de 5°. Après discussion de la décompression et de la PDC, la surveillance postopératoire évalue la mobilité et l’ossification.', [21, 33, 31, 34, 35, 38, 42]],
  ['Une patiente de 47 ans est programmée pour une PDC C6-C7. Au bloc, le positionnement et le repérage du niveau sont préparés avant l’abord antérieur. Après l’intervention, son suivi porte sur dysphagie, résultat neurologique et contrôle radiologique.', [24, 25, 26, 27, 28, 30, 39]],
  ['Un homme de 39 ans est opéré d’une hernie C5-C6 par abord antérieur. Après discectomie, les plateaux doivent être préparés et le dispositif dimensionné sans compromettre les structures osseuses. Le suivi s’attache à la mobilité et aux douleurs articulaires postérieures.', [31, 32, 33, 34, 35, 36, 41]],
  ['Une femme de 51 ans reçoit une PDC à deux niveaux. Le niveau inférieur est préparé en premier. À la consultation postopératoire, la cicatrisation est simple et la patiente demande quand reprendre les mouvements du cou ; le suivi recherchera aussi une ossification.', [37, 38, 39, 40, 42, 47, 48]],
  ['Un homme de 56 ans, déjà arthrodésé à un niveau, présente une atteinte adjacente mobile. Un montage hybride est envisagé. Après chirurgie, les clichés dynamiques évaluent lordose, translation et mobilité du segment prothésé au cours du suivi.', [36, 37, 40, 41, 42, 43, 44]],
  ['Une patiente de 45 ans consulte à distance d’une PDC pour raideur progressive. Les radiographies évoquent une ossification hétérotopique. Il n’y a pas de déficit moteur ; le suivi différencie perte de mobilité, syndrome adjacent et indication de reprise.', [42, 46, 47, 43, 44, 45, 48]],
  ['Un homme de 59 ans consulte après PDC pour cervicalgie et dysphagie tardive. L’imagerie vérifie l’axe, le déplacement et les segments adjacents. Une stratégie de prévention et de suivi clinique est discutée avec lui.', [43, 44, 45, 46, 47, 48, 39]],
];
const dps = cases.map(([vignette, choices], s) => ({ label: `DP ${s + 1} — Parcours d’arthroplastie cervicale`, vignette: `${vignette} Le patient est informé du projet et des complications possibles ; chaque nouvelle donnée clinique ou radiographique est réévaluée au suivi avant la décision suivante.`, questions: choices.map((i, q) => { const [prompt, answer] = facts[i]; const notion = prompt.replace(/^Quelle?\s+/i, '').replace(/\?$/, ''); return { enonce: q ? `Nouvel élément : au temps ${q + 1} du suivi, quelle décision concerne ${notion} ?` : `À l’évaluation initiale, quelle décision concerne ${notion} ?`, correction_generale: 'Réponse fondée sur les indications, la technique et le suivi décrits dans le chapitre.', items: items(answer, i) }; }) }));
const namedConcepts = ['Objectif de mobilité', 'Cycles et usure', 'Matériaux', 'Ancrage plateau', 'Couples de frottement', 'Contraintes implantaires', 'Centre de rotation', 'Compatibilité IRM', 'Indication radiculaire', 'Mobilité préopératoire', 'Contre-indications', 'Installation', 'Repérage du niveau', 'Abord antérieur', 'Préparation discale', 'Curetage sous-chondral', 'Dimensionnement', 'Centrage prothétique', 'Suites précoces', 'Contrôle fonctionnel', 'Ossification hétérotopique', 'Segments adjacents', 'Complications de voie', 'Prévention postopératoire'];
let conceptIndex = 0;
for (const part of fiche.parts) for (const section of part.sections) for (const row of section.rows) {
  if (/^Repère\s+\d+$/i.test(row.concept || '')) row.concept = namedConcepts[conceptIndex++] || 'Décision opératoire';
}
emitOrthopediePackage({ chapterDir, outputDir, fiche, facts: flashcards, series: [...qcm, ...dps] });

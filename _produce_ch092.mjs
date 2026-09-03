import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { emitOrthopediePackage } from './scripts/lib/orthopedie-package.mjs';

const chapterDir = resolve('../.corpus-orthopedie/techniques-chirurgicales-dans-l-instabilite-rotulienne-de-l-adulte');
const out = join(chapterDir, 'delivery', 'source-quality-v1');
const title = "Techniques chirurgicales dans l’instabilité rotulienne de l’adulte";

const fig = (n, caption, size = 'small') => ({ path: `img/img_${String(n).padStart(3, '0')}.png`, position: size === 'large' ? 'after' : 'before', size, caption, sourceCaption: caption });
const b = (text, children) => children ? { text, children } : text;
const row = (concept, bullets, extra = {}) => ({ concept, bullets, ...extra });

// Chaque affirmation est formulée à partir d’un bloc du document source. Les
// rectos sont des décisions, seuils ou gestes différents : aucune carte ne
// reprend l’exemple ou la phrase-gabarit d’une autre.
const factRows = [
 ['Définition de l’instabilité rotulienne objective ?', 'Au moins une luxation vraie<br>et au moins une anomalie anatomique', 2],
 ['Définition de l’instabilité rotulienne potentielle ?', 'Douleur et anomalies anatomiques<br>sans luxation vraie', 3],
 ['Syndrome rotulien douloureux : luxation et anomalies ?', 'Ni luxation vraie<br>ni anomalie anatomique', 4],
 ['Lésion osseuse à rechercher après luxation aiguë ?', 'Arrachement médial patellaire<br>ou fracture ostéochondrale latérale', 4],
 ['Contusions IRM témoins après luxation ?', 'Bord médial de la patella<br>et face externe du condyle latéral', 4],
 ['Premier facteur anatomique principal ?', 'Dysplasie de trochlée', 7],
 ['Deuxième facteur anatomique principal ?', 'Rotule haute', 8],
 ['Troisième facteur anatomique principal ?', 'Distance TA-GT excessive', 9],
 ['Quatrième facteur anatomique principal ?', 'Bascule rotulienne excessive', 10],
 ['Facteur secondaire fémoral cité ?', 'Antéversion fémorale excessive', 13],
 ['Facteur secondaire tibial cité ?', 'Torsion tibiale externe excessive', 14],
 ['Défaut d’axe secondaire cité ?', 'Genu recurvatum ou genu valgum excessif', 15],
 ['Indication chirurgicale habituelle ?', 'Instabilité objective chronique', 15],
 ['Place de la chirurgie dans l’instabilité potentielle ?', 'Très rare', 15],
 ['Bilan standard préopératoire : face/profil ?', 'En appui monopodal<br>à 20° de flexion', 27],
 ['Vue axiale rotulienne recommandée ?', 'À 30° de flexion', 27],
 ['Examen de mesure de la TA-GT ?', 'Scanner selon protocole rotulien', 28],
 ['Rôle possible de l’arthroscopie aiguë ?', 'Lavage, exploration<br>et ablation d’un corps étranger', 17],
 ['Petit arrachement du bord médial patellaire ?', 'Ablation du fragment', 17],
 ['Fragment condylien mobile > 5 mm chez enfant ?', 'Une fixation peut être discutée', 20],
 ['Pourquoi éviter la chirurgie précoce non nécessaire ?', 'Risque de raideur et d’algodystrophie', 25],
 ['But de la section de l’aileron externe ?', 'Libérer la contrainte latérale', 31],
 ['Distance de section au bord latéral de patella ?', '1 cm', 31],
 ['Plan de section de l’aileron externe ?', 'Extrasynovial', 31],
 ['Vaisseau à surveiller lors de cette section ?', 'Artère géniculée supéro-latérale', 31],
 ['Complication la plus fréquente de la voie arthroscopique ?', 'Hémarthrose postopératoire : 6 à 10 %', 35],
 ['Drain après libération latérale ?', 'Recommandé en postopératoire immédiat', 35],
 ['Appui après libération latérale ?', 'Immédiat', 36],
 ['Section latérale isolée : place ?', 'Exceptionnelle et peu indiquée isolément', 38],
 ['Plastie du vaste interne : geste associé ?', 'Section préalable de l’aileron externe', 42],
 ['Test peropératoire de plastie du vaste interne ?', 'Flexion à 90° sans tension excessive', 42],
 ['Attelle après plastie du vaste interne ?', 'Extension pendant 45 jours', 44],
 ['Mobilisation initiale après plastie du vaste interne ?', 'Jusqu’à 90° pendant 45 jours', 45],
 ['Délai de reprise sportive après plastie du vaste interne ?', '6 mois', 46],
 ['Seuil de bascule rotulienne pathologique ?', 'Supérieur à 20°', 48],
 ['Limite de la plastie isolée du vaste interne ?', 'Correction objective limitée : 2 à 7°', 52],
 ['Rôle biomécanique majeur du MPFL ?', 'Stabilisateur passif de la patella', 54],
 ['MPFL après luxation aiguë : constat IRM ?', 'Rupture constante, souvent épicondylienne', 54],
 ['Greffons courants de reconstruction du MPFL ?', 'Gracile ou semi-tendineux', 54],
 ['Risques des ligaments synthétiques de MPFL ?', 'Rigidité ; ils ont été abandonnés', 54],
 ['Nombre et diamètre des tunnels patellaires MPFL ?', 'Deux tunnels de 4,5 mm', 57],
 ['Écartement des tunnels patellaires MPFL ?', '15 mm', 57],
 ['Fixation fémorale de la greffe MPFL ?', 'Tunnel borgne et vis d’interférence', 59],
 ['Principe de tension du MPFL reconstruit ?', 'Frein à la luxation, pas recentrage', 60],
 ['Risque principal d’une tension excessive du MPFL ?', 'Hypercorrection médiale', 60],
 ['Attelle après reconstruction MPFL ?', 'Extension pendant 30 jours', 60],
 ['Renforcement après MPFL ?', 'Chaînes fermées entre 0° et 60°', 60],
 ['Indication de MPFL isolé : dysplasie ?', 'Type A', 64],
 ['Indication de MPFL isolé : hauteur patellaire ?', 'Index rotulien normal', 64],
 ['Indication de MPFL isolé : TA-GT ?', 'Inférieure à 20 mm', 64],
 ['Quand associer un MPFL à un geste osseux ?', 'Dysplasie B/C/D, rotule haute ou TA-GT > 20 mm', 64],
 ['Indication de l’opération de Judet ?', 'Luxation permanente ou habituelle<br>avec quadriceps rétracté', 69],
 ['Test clinique indiquant une rétraction proximale ?', 'Flexion impossible sans luxation<br>rotule maintenue dans la trochlée', 69],
 ['Rééducation après Judet ?', 'Postures à 90° et arthromoteur', 67],
 ['Appui après Judet ?', 'Avec attelle en extension jusqu’au verrouillage quadricipital', 67],
 ['But d’une ostéotomie de TTA ?', 'Corriger l’alignement extenseur<br>et/ou normaliser la hauteur patellaire', 73],
 ['Longueur d’ostéotomie de TTA ?', '6 cm', 73],
 ['Médialisation TTA : charnière conservée ?', 'Charnière osseuse inférieure', 75],
 ['Fixation de la TTA médialisée ?', 'Une vis bicorticale en compression', 75],
 ['Cible de TA-GT après médialisation ?', 'Entre 10 et 15 mm', 80],
 ['Variante de Fulkerson ?', 'Antéro-médialisation de la TTA', 80],
 ['Avancement pur de Maquet : statut actuel ?', 'Abandonné', 84],
 ['Pourquoi Maquet est-il abandonné ?', 'Consolidation, peau, esthétique<br>et douleurs à genoux défavorables', 84],
 ['Abaissement TTA : fixation ?', 'Deux vis bicorticales en compression', 82],
 ['Abaissement important de TTA : seuil cité ?', 'Supérieur à 15 mm', 83],
 ['Geste possible si abaissement TTA > 15 mm ?', 'Ténodèse du tendon rotulien', 83],
 ['Effet associé d’un abaissement de TTA ?', 'Médialisation automatique de 4 à 5 mm', 83],
 ['Appui après geste sur la TTA ?', 'Total sous attelle en extension', 85],
 ['Flexion initiale après geste sur TTA ?', 'Limitée à 90° jusqu’au 45e jour', 85],
 ['Arrêt de l’attelle après geste sur TTA ?', '45e jour postopératoire', 85],
 ['Reprise sportive après geste sur TTA ?', '6e mois', 85],
 ['Seuil pathologique de TA-GT ?', 'Supérieur à 20 mm', 86],
 ['Rotule haute : calcul de l’abaissement ?', 'Nombre de millimètres pour normaliser l’index', 86],
 ['Signe radiographique de dysplasie trochléenne ?', 'Signe du croisement en profil strict', 93],
 ['Dysplasie Dejour A ?', 'Trochlée peu profonde avec signe du croisement', 92],
 ['Dysplasie Dejour B ?', 'Trochlée plate avec éperon sus-trochléen', 92],
 ['Dysplasie Dejour C ?', 'Double contour et asymétrie des versants', 92],
 ['Dysplasie Dejour D ?', 'Association des signes B et C<br>avec raccordement en falaise', 92],
 ['But de la trochléoplastie ?', 'Rétablir une trochlée congruente et rétentive', 94],
 ['Trochléoplastie d’Albee : indication ?', 'Trochlée plate non proéminente', 96],
 ['Principe de la trochléoplastie d’Albee ?', 'Relèvement de la berge externe', 96],
 ['Épaisseur cartilagineuse à préserver dans Albee ?', '5 mm', 96],
 ['Trochléoplastie de creusement : indication ?', 'Dysplasie sévère B ou D avec proéminence', 104],
 ['Principe de la trochléoplastie de creusement ?', 'Supprimer la proéminence<br>et recréer une gorge', 100],
 ['Direction de la nouvelle gorge trochléenne ?', '3 à 6° vers le haut et dehors', 100],
 ['Fixation après creusement trochléen ?', 'Deux petites agrafes', 103],
 ['Contrôle final après trochléoplastie ?', 'Absence d’accrochage en flexion-extension', 103],
 ['Rééducation après trochléoplastie ?', 'Appui immédiat et amplitudes sans limitation', 105],
 ['Ostéotomie patellaire : indication ?', 'Dysplasie patellaire Wiberg IV', 108],
 ['Risque majeur d’ostéotomie patellaire ?', 'Nécrose et pseudarthrose', 108],
 ['Seuil de genu valgum pathologique dans ce contexte ?', 'Supérieur à 10°', 110],
 ['Effet du genu valgum sur la patella ?', 'Augmente l’angle Q et les forces luxantes', 110],
 ['Site efficace d’ostéotomie de dérotation fémorale ?', 'Région intertrochantérienne', 110],
 ['Site d’ostéotomie de dérotation tibiale ?', 'Sus-tubérositaire', 110],
 ['Facteur à conserver dans toute ostéotomie de torsion ?', 'La valeur de TA-GT', 110],
 ['Règle de planification chirurgicale ?', 'Corriger chaque facteur identifié', 112],
 ['Conséquence d’une hypocorrection ?', 'Récidive de luxation', 112],
 ['Conséquence d’une hypercorrection ?', 'Douleur', 112],
 ['Place thérapeutique finale de l’arthroscopie ?', 'Mineure, hors corps étranger et bilan', 112],
 ['Traitement initial d’instabilité potentielle ou syndrome douloureux ?', 'Rééducation et étirements musculaires', 112],
 ['Seuil de bascule utilisé dans la stratégie ?', 'Supérieur à 20°', 113],
 ['Stratégie pour TA-GT > 20 mm ?', 'Médialisation de la TTA', 113],
 ['Stratégie pour rotule haute ?', 'Abaissement de la TTA pour index = 1', 113],
 ['Stratégie pour dysplasie B ou D ?', 'Trochléoplastie de creusement', 113],
 ['MPFL : rôle dans la stratégie combinée ?', 'Corriger la bascule rotulienne', 64],
];

const facts = factRows.map(([recto, verso, source]) => ({ recto, verso, source: [source] }));
const pick = (i) => facts[i];
const choices = (correct, offsets = [7, 19, 37, 61]) => {
  const values = [correct, ...offsets.map(o => facts[(facts.indexOf(correct) + o) % facts.length])];
  return values.map((f, idx) => ({ lettre: 'ABCDE'[idx], enonce: f.verso.replace(/<br>/g, ' '), is_correct: idx === 0, justification: idx === 0 ? `Réponse conforme au bloc source ${f.source[0]}.` : 'Cette proposition ne correspond pas au point testé dans le corpus.' }));
};
// Les QCM ne recyclent jamais le recto d’une carte : ils replacent la notion
// dans une décision, un bilan ou une étape de prise en charge.
const q = (i, prefix = 'Dans la décision opératoire, ') => ({ enonce: `${prefix}${pick(i).recto}`, items: choices(pick(i)) });

const qcmTopics = [
 ['QCM 1 · Diagnostic et bilan', [0, 3, 6, 14, 16]],
 ['QCM 2 · Indications initiales', [12, 17, 20, 28, 34]],
 ['QCM 3 · Libération latérale', [22, 24, 25, 27, 28]],
 ['QCM 4 · Plasties médiales', [30, 31, 34, 36, 38]],
 ['QCM 5 · Reconstruction du MPFL', [40, 43, 44, 47, 50]],
 ['QCM 6 · Gestes sur la TTA', [56, 58, 60, 64, 69]],
 ['QCM 7 · Trochlée et axes', [73, 76, 79, 80, 89]],
 ['QCM 8 · Stratégie et suites', [84, 86, 91, 93, 98]],
];
const series = qcmTopics.map(([label, ids]) => ({ label, questions: ids.map((i) => q(i)) }));

const dpData = [
 ['DP 1 · Premier épisode et bilan', '<p><strong>Patiente de 24 ans</strong> admise après une première luxation latérale vraie de la patella réduite aux urgences. Elle garde une douleur et un épanchement. Le bilan clinique et radiographique est débuté ; la recherche d’une lésion de passage est organisée avant toute décision opératoire. <strong>Au suivi à distance</strong>, la stratégie est rediscutée après analyse du risque anatomique et de la rééducation réalisée.</p>', [3,4,14,16,17,20,12]],
 ['DP 2 · Libération latérale raisonnée', '<p><strong>Patient de 28 ans</strong> suivi pour instabilité objective chronique avec bascule latérale. Après échec d’un traitement médical bien conduit, un geste sur les parties molles est discuté dans une stratégie combinée. Le chirurgien détaille les limites de la libération latérale et la surveillance du drainage. <strong>Au suivi postopératoire</strong>, la récupération des amplitudes et l’absence d’hémarthrose sont contrôlées.</p>', [21,22,23,24,25,26,27]],
 ['DP 3 · Plastie du vaste interne', '<p><strong>Patiente de 31 ans</strong> présente une instabilité objective avec bascule latérale mesurée au scanner et aspect dysplasique du vaste médial. Une plastie du vaste interne est envisagée, après information sur ses limites et son protocole de rééducation. <strong>Au suivi programmé</strong>, l’attelle, les amplitudes et la date de reprise sportive sont réévaluées.</p>', [29,30,31,32,33,34,35]],
 ['DP 4 · Reconstruction du MPFL', '<p><strong>Patient de 22 ans</strong> a plusieurs épisodes de luxation rotulienne objectivée. Son index rotulien est normal, la dysplasie est de type A et la TA-GT est inférieure à 20 mm. Une reconstruction isolée du MPFL est planifiée ; les risques de tension excessive sont expliqués. <strong>Au suivi postopératoire</strong>, une attelle et un programme de renforcement sont prescrits.</p>', [36,38,40,43,44,45,46]],
 ['DP 5 · Réalignement de la TTA', '<p><strong>Patiente de 27 ans</strong> consulte pour récidives de luxation avec une TA-GT mesurée à plus de 20 mm. La planification retient une médialisation de la tubérosité tibiale antérieure ; le compte rendu devra documenter la correction et la fixation. <strong>Au suivi à 45 jours</strong>, la consolidation, les amplitudes et le sevrage de l’attelle sont contrôlés.</p>', [55,56,57,58,59,68,69]],
 ['DP 6 · Rotule haute et abaissement', '<p><strong>Patient de 30 ans</strong> présente une instabilité avec rotule haute selon l’index retenu. L’équipe planifie un abaissement de la TTA calculé pour normaliser cet index et explique les précautions mécaniques. <strong>Au suivi postopératoire</strong>, la flexion est limitée au début, puis la reprise du sport est programmée selon l’évolution.</p>', [63,64,65,66,70,71,72]],
 ['DP 7 · Dysplasie trochléenne sévère', '<p><strong>Patiente de 26 ans</strong> a une instabilité chronique ; l’imagerie retrouve une dysplasie trochléenne de type D avec proéminence et course patellaire anormale. Une trochléoplastie de creusement, associée selon les facteurs, est discutée. <strong>Au suivi immédiat</strong>, l’appui, la mobilisation et l’absence d’accrochage sont évalués.</p>', [77,78,79,80,81,82,83]],
 ['DP 8 · Facteurs secondaires et plan global', '<p><strong>Patient de 35 ans</strong> est adressé pour instabilité persistante avec genu valgum excessif et trouble de torsion des membres inférieurs. La discussion multidisciplinaire souligne le caractère lourd des ostéotomies et l’importance de conserver les mesures d’alignement dans le projet. <strong>Au suivi de décision</strong>, chaque facteur est consigné afin d’éviter récidive et douleur par mauvaise correction.</p>', [87,88,89,90,91,92,93]],
];
for (const [label, vignette, ids] of dpData) {
  series.push({ label, vignette, questions: ids.map((i, n) => q(i, n ? 'Nouvel élément : au cours de ce suivi, ' : 'Au bilan initial de ce patient, ')) });
}

const fiche = {
 title, year: '2025-2026', coverSubtitle: 'Item Orthopédie', sourceBlocks: [1, 15, 27, 31, 54, 73, 93, 112],
 parts: [
  { title: 'Évaluation et stratégie opératoire', sections: [
   { title: 'Phénotypes cliniques et facteurs anatomiques', rows: [row('Populations à distinguer', [b('Instabilité objective', ['Au moins une luxation vraie et une anomalie anatomique']), b('Instabilité potentielle', ['Douleur et anomalies sans luxation vraie']), b('Syndrome rotulien douloureux', ['Pas de luxation ni d’anomalie anatomique'])], { marker:'yield' }), row('Facteurs principaux', ['Dysplasie trochléenne', 'Rotule haute', 'TA-GT excessive', 'Bascule rotulienne excessive'], { marker:'ecn' }), row('Facteurs secondaires', ['Antéversion fémorale excessive', 'Torsion tibiale externe excessive', 'Genu valgum ou recurvatum excessif']), row('Principe d’indication', ['La chirurgie vise surtout l’instabilité objective chronique', 'L’instabilité potentielle et le syndrome douloureux sont rarement opérés'], { marker:'trap' })] },
   { title: 'Bilan avant décision', rows: [row('Imagerie standard', ['Face et profil en appui monopodal à 20°', 'Vue axiale des patellae à 30°']), row('Scanner rotulien', ['Mesure de la TA-GT', 'Morphologie trochléenne', 'Évaluation de la bascule rotulienne'], { marker:'ecn' }), row('Premier épisode aigu', ['Rechercher arrachement patellaire médial, fracture ostéochondrale et contusions IRM', 'L’arthroscopie peut laver l’hémarthrose, explorer et retirer un corps étranger']), row('Décision différée', ['Éviter les gestes précoces non indispensables : raideur et algodystrophie sont redoutées', 'Planifier les corrections après inventaire des facteurs'])] }
  ] },
  { title: 'Gestes sur les parties molles', sections: [
   { title: 'Libération latérale et vaste médial', rows: [row('Section de l’aileron externe', ['Section extrasynoviale à 1 cm du bord latéral de la patella', 'Descend vers le tendon patellaire sans remonter excessivement vers le vaste externe'], { image: fig(1,'Section de l’aileron externe à distance du bord patellaire.') }), row('Sécurité et limites', ['Hémostase de l’artère géniculée supéro-latérale', 'Drain immédiat ; risque d’hémarthrose arthroscopique de 6 à 10 %', 'La section isolée est exceptionnelle et insuffisante contre la récidive'], { marker:'trap' }), row('Plastie du vaste interne', ['Lambeau musculo-aponévrotique médialisé après libération latérale', 'Tester une flexion à 90° sans tension excessive'], { image: fig(2,'Plastie du vaste interne associée à une libération latérale.') }), row('Suites du vaste interne', ['Appui immédiat, attelle en extension 45 jours', 'Mobilisation jusqu’à 90° jusqu’au 45e jour', 'Sport à 6 mois'])] },
   { title: 'MPFL et rétraction du système extenseur', rows: [row('Reconstruction du MPFL', ['Le MPFL est un stabilisateur passif rompu après luxation aiguë', 'Greffon de gracile ou semi-tendineux ; deux tunnels patellaires espacés de 15 mm'], { image: fig(3,'Reconstruction du MPFL par greffon et ancrage osseux.') }), row('Réglage de la plastie', ['Tunnel fémoral borgne et vis d’interférence', 'La plastie freine la luxation mais ne recentre pas la patella', 'Éviter toute hypercorrection médiale'], { marker:'trap' }), row('Indications du MPFL', ['Isolé si dysplasie A, index normal et TA-GT < 20 mm', 'Associé si dysplasie B/C/D, rotule haute ou TA-GT > 20 mm'], { image: fig(4,'Plastie de MPFL par tunnellisation des parties molles.') }), row('Libération de Judet', ['Réservée aux luxations permanentes ou habituelles avec quadriceps court', 'Postures à 90° et arthromoteur ; attelle jusqu’au verrouillage quadricipital'], { image: fig(5,'Libération du système extenseur dans l’opération de Judet.') })] }
  ] },
  { title: 'Réalignement de la tubérosité tibiale antérieure', sections: [
   { title: 'Médialisation de la TTA', rows: [row('But et ostéotomie', ['Réaligner le système extenseur', 'Ostéotomie de 6 cm jusqu’à l’os spongieux pour limiter la pseudarthrose']), row('Déplacement et fixation', ['Conserver une charnière osseuse inférieure', 'Fixation par une vis bicorticale en compression'], { image: fig(6,'Médialisation de la TTA avec charnière inférieure conservée.') }), row('Objectif chiffré', ['TA-GT pathologique si > 20 mm', 'Ramener la TA-GT entre 10 et 15 mm', 'Adapter la correction à la morphologie trochléenne'], { marker:'ecn' }), row('Variante', ['L’antéro-médialisation de Fulkerson associe médialisation et avancement', 'L’avancement pur de Maquet est abandonné'])] },
   { title: 'Abaissement et suites de TTA', rows: [row('Abaissement de la TTA', ['Détacher complètement la baguette', 'Résection calculée pour normaliser l’index rotulien', 'Fixation par deux vis bicorticales'], { image: fig(7,'Abaissement de la TTA fixé par deux vis bicorticales.') }), row('Précautions mécaniques', ['Éviter toute saillie douloureuse en position à genoux', 'Abaissement > 15 mm : discuter une ténodèse du tendon patellaire', 'L’abaissement entraîne 4 à 5 mm de médialisation']), row('Rééducation commune', ['Appui total sous attelle en extension', 'Flexion ≤ 90° jusqu’au 45e jour', 'Sevrage de l’attelle à J45, sport au 6e mois']), row('Piège de correction', ['Ne pas provoquer de rotule basse iatrogène', 'Calculer l’abaissement à partir de l’index choisi'], { marker:'trap' })] }
  ] },
  { title: 'Correction de la dysplasie fémoro-patellaire', sections: [
   { title: 'Dysplasie trochléenne', rows: [row('Lecture de Dejour', ['A : trochlée peu profonde', 'B : trochlée plate et éperon sus-trochléen', 'C : double contour et asymétrie', 'D : signes B + C avec falaise'], { image: fig(8,'Classification de Dejour des dysplasies trochléennes.', 'large'), marker:'ecn' }), row('Indication générale', ['Trochléoplastie si dysplasie sévère et anomalie de course', 'Objectif : une trochlée congruente et rétentive']), row('Relèvement d’Albee', ['Pour trochlée plate sans proéminence', 'Relèvement de la berge externe en préservant 5 mm de cartilage'], { image: fig(9,'Trochléoplastie de relèvement de la berge externe.') }), row('Piège', ['Ne pas augmenter une proéminence trochléenne : risque de conflit avec la patella'], { marker:'trap' })] },
   { title: 'Trochléoplastie de creusement et patella', rows: [row('Creusement de Dejour', ['Indiqué dans les dysplasies B ou D avec proéminence', 'Supprime la proéminence et recrée une gorge orientée de 3 à 6°'], { image: fig(10,'Trochléoplastie de creusement : suppression de la proéminence et nouvelle gorge.', 'large') }), row('Fin de geste', ['Fixation des versants par deux petites agrafes', 'Vérifier l’absence d’accrochage en flexion-extension']), row('Suites de trochléoplastie', ['Appui immédiat', 'Mobilisation sans limitation ; tenir compte des gestes associés']), row('Ostéotomie patellaire', ['Peut compléter une dysplasie patellaire Wiberg IV', 'Risque de nécrose et de pseudarthrose'], { marker:'trap' })] }
  ] },
  { title: 'Axes, torsions et plan thérapeutique', sections: [
   { title: 'Facteurs d’axe et de torsion', rows: [row('Genu valgum', ['Pathologique s’il dépasse 10°', 'Augmente l’angle Q et les forces luxantes']), row('Ostéotomies de dérotation', ['Fémur : région intertrochantérienne', 'Tibia : région sus-tubérositaire']), row('Prudence d’indication', ['Gestes lourds pour une pathologie souvent bénigne', 'Toujours intégrer la TA-GT à la stratégie']), row('Rôle de l’arthroscopie', ['Rôle thérapeutique mineur hors corps étranger ou bilan préopératoire'])] },
   { title: 'Stratégie personnalisée et résultats', rows: [row('Planification', ['Inventorier dysplasie, hauteur patellaire, TA-GT, bascule et facteurs secondaires', 'Corriger chaque facteur par le geste approprié'], { marker:'ecn' }), row('Seuils de décision', ['TA-GT > 20 mm : médialisation', 'Index > 1,2 : abaissement pour index = 1', 'Bascule > 20° : plastie MPFL et correction étiologique si nécessaire']), row('Équilibre de correction', ['Hypocorrection : récidive de luxation', 'Hypercorrection : douleur'], { marker:'trap' }), row('Cas non opératoires', ['Instabilité potentielle et syndrome douloureux : rééducation, étirements et rééquilibrage musculaire'])] }
  ] }
 ],
 synthesis: {
  chiffres: { headers:['Mesure','Seuil du corpus','Objectif / conséquence'], rows:[['TA-GT','> 20 mm','Après médialisation : 10–15 mm'],['Bascule rotulienne','> 20°','Facteur de décision pour geste médial'],['Index Caton-Deschamps','> 1,2','Abaissement pour normaliser l’index'],['Genu valgum','> 10°','Facteur secondaire à corriger avec prudence']] },
  tables: [
   { title:'Du facteur à la correction', headers:['Facteur dominant','Geste retenu dans le corpus','Vigilance'], rows:[['TA-GT excessive','Médialisation de TTA','Éviter l’hypercorrection'],['Rotule haute','Abaissement de TTA','Ne pas créer une rotule basse'],['Dysplasie B ou D proéminente','Trochléoplastie de creusement','Contrôler l’absence d’accrochage'],['Faibles anomalies anatomiques','MPFL isolé','Ne pas sur-tendre la plastie']] },
   { title:'Suites opératoires comparées', headers:['Geste','Appui / immobilisation','Mobilité / sport'], rows:[['Aileron externe','Appui immédiat','Amplitudes complètes'],['Vaste interne','Attelle extension 45 j','90° jusqu’à J45 ; sport 6 mois'],['MPFL','Attelle extension 30 j','90° jusqu’à J30 ; chaînes fermées 0–60°'],['TTA','Appui total et attelle','90° jusqu’à J45 ; sport 6 mois']] }
  ],
  keyPoints:['L’instabilité objective chronique est l’indication chirurgicale principale.','La décision résulte de l’inventaire de tous les facteurs anatomiques.','TA-GT > 20 mm : planifier une médialisation vers 10–15 mm.','Le MPFL freine la luxation : il ne doit jamais hypercorriger.','L’abaissement de TTA normalise l’index sans créer de rotule basse.','Les dysplasies B/D proéminentes relèvent d’une trochléoplastie de creusement.','L’équilibre de correction évite récidive par hypocorrection et douleur par hypercorrection.'],
  eclair:['Distinguer instabilité objective, potentielle et syndrome douloureux.','Mesurer systématiquement dysplasie, hauteur patellaire, TA-GT et bascule.','TA-GT > 20 mm : médialiser la TTA vers 10–15 mm.','Rotule haute : abaisser la TTA jusqu’à normalisation de l’index.','MPFL isolé si dysplasie A, index normal et TA-GT < 20 mm.','Dysplasie B/D proéminente : discuter une trochléoplastie de creusement.','Ne pas isoler une libération latérale pour prévenir les récidives.','Toujours prévoir les consignes de protection et rééducation propres au geste associé.']
 }
};

emitOrthopediePackage({ chapterDir, outputDir: out, fiche, facts, series });

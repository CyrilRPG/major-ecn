import { emitOrthopediePackage } from './lib/orthopedie-package.mjs';

// Chapitre 69 : contenu explicite extrait des blocs 3–71. Aucun gabarit de
// phrase n'est utilisé pour transformer des exemples en questions.
const chapterDir = 'C:/Users/Admin/Desktop/Major-ecn-projects/.corpus-orthopedie/osteosynthese-par-plaque-des-fractures-de-la-diaphyse-femorale';
const outputDir = `${chapterDir}/delivery/source-quality-v2`;
const R = (concept, ...bullets) => ({ concept, bullets });
const image = (n) => ({ path: `img/img_${String(n).padStart(3, '0')}.png`, position: 'after', size: 'large' });
const sec = (title, rows) => ({ title, rows });

const fiche = {
  title: 'Ostéosynthèse par plaque des fractures de la diaphyse fémorale',
  year: '2025-2026',
  coverSubtitle: 'Biomécanique, choix du montage et suivi',
  sourceBlocks: [3, 5, 9, 16, 18, 19, 24, 25, 27, 34, 38, 42, 47, 49, 51, 59, 68],
  parts: [
    { title: 'Plaque : propriétés utiles', sections: [
      sec('Résistance du matériel', [
        R('Rôle mécanique', 'La plaque absorbe les contraintes liées à la perte de console interne.', 'La comminution augmente les contraintes supportées par le montage.'),
        R('Acier', 'L’acier est le matériau le plus employé pour sa résistance à la rupture.', 'Sa faible limite de fatigue expose à la rupture de l’implant en cas de pseudarthrose.'),
        R('Rigidité', 'L’épaisseur est le facteur principal de rigidité de la plaque.', 'Elle doit permettre de résister notamment aux contraintes en varus.'),
      ]),
      sec('Forme et adhérence', [
        R('Face profonde', 'Des rugosités peuvent améliorer l’adhérence de la plaque à l’os.', 'Elles diminuent les contraintes au contact os-plaque.'),
        R('Plaque R Judet', 'Elle est prémoulée selon la convexité antéropostérieure de la diaphyse fémorale.', 'Elle limite le besoin de cintrage sur une diaphyse incurvée.'),
        R('Plaque droite AO', 'Elle est modelable avec fers à courber ou presse.', 'Le modelage est réalisé dans un seul plan.'),
      ]),
    ] },
    { title: 'Construire le montage', sections: [
      sec('Trous de vis', [
        R('Trou sphérique', 'Il est utilisé sur les plaques de neutralisation.', 'Il ne participe pas à une compression axiale par géométrie du trou.'),
        R('Trou ovale', 'Il est utilisé sur les plaques à compression.', 'Sa géométrie participe à la compression avec le guide-mèche approprié.'),
        R('Quinconce', 'Les trous décalés facilitent le passage des vis autour d’une tige prothétique.', 'Ils permettent des vis en avant et en arrière de la pièce prothétique.'),
      ]),
      sec('Longueur et vis', [
        R('Conception AO classique', 'Elle recherche au moins huit corticales de chaque côté du foyer.', 'Elle comprend une vis unicorticale à chaque extrémité de plaque.'),
        R('Conception AO moderne', 'Elle privilégie une plaque plus longue avec moins de vis.', 'Les vis sont réparties régulièrement sur la diaphyse.'),
        R('Répartition', 'Deux vis sont proches du foyer, deux aux extrémités et deux intermédiaires.', 'Cette répartition homogène augmente la capacité d’absorption des contraintes.'),
      ]),
    ] },
    { title: 'Choisir la stabilité', sections: [
      sec('Stabilité absolue', [
        R('Consolidation primaire', 'Elle exige une réduction anatomique, trait pour trait.', 'La consolidation corticale est obtenue sans cal périosté.'),
        R('Neutralisation', 'Elle absorbe les contraintes sur un fémur réduit et vissé en traction.', 'Elle est destinée aux fractures spiroïdes longues.'),
        R('Compression', 'Elle assure une compression statique axiale et un hauban externe.', 'Elle est obtenue par tendeur de plaque ou plaque autocompressive.'),
      ]),
      sec('Stabilité relative par pontage', [
        R('Indication', 'Le pontage est surtout indiqué dans les fractures comminutives de diaphyse.', 'Il relève d’une philosophie de synthèse biologique.'),
        R('Respect du foyer', 'La comminution n’est ni dépériostée ni réduite anatomiquement.', 'Les fragments conservent leur vascularisation et un cal osseux peut se former.'),
        R('Point de vigilance', 'La plaque excentrée subit une flexion avant reconstitution de la colonne interne.', 'Elle doit résister jusqu’à la consolidation biologique.'),
      ]),
    ] },
    { title: 'Geste opératoire et suivi', sections: [
      sec('Installation et abord', [
        R('Préparation', 'L’anesthésie associe relâchement musculaire et compensation des pertes sanguines.', 'Le membre est rasé et badigeonné avec soin malgré le contexte d’urgence.'),
        R('Table orthopédique', 'Le patient est habituellement en décubitus dorsal avec traction réglable.', 'La table aide à corriger rotation, abduction, flessum ou recurvatum.'),
        R('Voie postérolatérale', 'Après ouverture du fascia lata, le vaste latéral est désinséré de la cloison latérale.', 'Les perforantes sont ligaturées sélectivement.'),
      ]),
      sec('Respect biologique et suites', [
        R('Foyer fracturaire', 'Les écarteurs contrecoudés sont proscrits pour éviter un large dépériostage.', 'Les caillots sont refoulés et les fragments isolés sont laissés pédiculés.'),
        R('Rééducation', 'Les mobilités de hanche et de genou sont entretenues précocement en actif aidé.', 'Les contractions isométriques du quadriceps et la mobilisation de patella sont maintenues.'),
        R('Appui et contrôle', 'La marche initiale est sans appui avec cannes ou déambulateur.', 'La radio à 45 jours recherche la consolidation ; l’appui est progressif après consolidation, au minimum vers trois mois.'),
      ]),
    ] },
    { title: 'Situations particulières', sections: [
      sec('Pontage mini-invasif', [
        R('Comminution fermée', 'Le pontage restaure axe, longueur et rotation sans ouvrir le foyer.', 'Les vis bicorticales sont réparties de part et d’autre de la comminution.'),
        R('Technique LISS', 'La plaque est glissée sous le vaste latéral par de courts abords à distance du foyer.', 'Les vis sont mises par voie percutanée à intervalles réguliers.'),
        R('Imagerie', 'La technique mini-invasive nécessite un amplificateur de brillance.', 'L’alignement et la rotation sont contrôlés par manœuvres externes.'),
      ]),
      sec('Tige et os pathologique', [
        R('Sous arthroplastie', 'Une fracture autour d’une tige non descellée est une indication de plaque.', 'Les trous en quinconce ou les plaques dédiées permettent le vissage autour de la tige.'),
        R('Plaques dédiées', 'La plaque de Lefèvre permet un vissage oblique en avant et en arrière de la tige.', 'Les plaques de Mennen ou Ogden nécessitent un dépériostage plus étendu.'),
        R('Fracture métastatique', 'La synthèse palliative vise le confort et la fonction.', 'La plaque peut prendre appui sur l’os et le ciment après traitement de la lésion.'),
      ]),
    ] },
  ],
  synthesis: {
    chiffres: { headers: ['Repère', 'Sens pratique'], rows: [
      ['≥ 8 corticales', 'Conception AO classique de chaque côté du foyer'],
      ['45 jours', 'Contrôle radiographique de consolidation'],
      ['≥ 3 mois', 'Reprise progressive d’appui après consolidation'],
      ['> 8 cm', 'Grande étendue d’un fragment médial pouvant justifier son incorporation'],
    ] },
    tables: [
      { title: 'Choix du montage', headers: ['Situation', 'Montage', 'But'], rows: [
        ['Spiroïde longue réduite', 'Neutralisation + vis de traction', 'Protéger la réduction'],
        ['Foyer réductible trait pour trait', 'Compression', 'Stabilité absolue'],
        ['Comminution diaphysaire', 'Pontage biologique', 'Préserver la vascularisation'],
        ['Tige non descellée', 'Plaque quinconcée ou dédiée', 'Contourner la tige'],
      ] },
      { title: 'Prévenir l’échec', headers: ['Risque', 'Mécanisme', 'Réponse'], rows: [
        ['Rupture de plaque', 'Fatigue sur pseudarthrose', 'Rechercher absence de consolidation'],
        ['Retard de consolidation', 'Dépériostage de comminution', 'Respecter le foyer et les fragments'],
        ['Surcharge mécanique', 'Plaque courte ou vis concentrées', 'Plaque longue et vis réparties'],
        ['Infection', 'Contusion et exposition du foyer', 'Préparation et voie respectueuses'],
      ] },
    ],
    keyPoints: ['L’épaisseur est le déterminant principal de rigidité.', 'Neutralisation : fracture spiroïde longue après vissage de traction.', 'Compression : réduction anatomique et consolidation primaire.', 'Pontage : pas de réduction anatomique de la comminution.', 'Plaque longue et vis réparties : meilleure absorption des contraintes.', 'Une rupture de plaque fait rechercher une pseudarthrose.', 'L’appui n’est repris qu’après consolidation.'],
    eclair: ['Acier : très résistant à la rupture mais faible limite de fatigue.', 'Trou sphérique : neutralisation ; trou ovale : compression ; quinconce : autour d’une tige.', 'Réduction trait pour trait : compression ou neutralisation.', 'Comminution : pontage biologique, fragments pédiculés, cal attendu.', 'Table orthopédique : réglage de la traction, de la rotation et du plan sagittal.', 'Radio à 45 jours ; appui progressif après consolidation, au minimum vers trois mois.'],
  },
};
[[3, 1, 1], [3, 1, 2], [4, 0, 2], [4, 1, 0], [4, 1, 1], [5, 0, 0], [5, 0, 1], [5, 1, 0], [5, 1, 1], [5, 1, 2]].forEach(([p, s, r], i) => { fiche.parts[p - 1].sections[s].rows[r].image = image(i + 1); });

const notes = [
  ['Quelle contrainte la plaque compense-t-elle quand la console interne est perdue ?', 'Les contraintes mécaniques de la diaphyse et de la mobilisation articulaire.'],
  ['Pourquoi une comminution surcharge-t-elle une plaque ?', 'Elle augmente les contraintes transmises au montage.'],
  ['Quel matériau est le plus employé pour la plaque fémorale ?', 'L’acier.'],
  ['Quelle propriété de l’acier favorise la rupture lors de pseudarthrose ?', 'Sa faible limite de fatigue.'],
  ['Quel paramètre détermine principalement la rigidité ?', 'L’épaisseur de la plaque.'],
  ['Quelle contrainte doit notamment supporter une plaque rigide ?', 'Le varus.'],
  ['Quel est l’intérêt des rugosités sous une plaque ?', 'Améliorer son adhérence à l’os.'],
  ['Quelle plaque est adaptée à la convexité antéropostérieure fémorale ?', 'La plaque R Judet prémoulée.'],
  ['Dans combien de plans modèle-t-on une plaque droite AO ?', 'Dans un seul plan.'],
  ['Quel instrument peut modeler une plaque droite AO ?', 'Des fers à courber ou une presse.'],
  ['Quel trou correspond à la neutralisation ?', 'Le trou sphérique standard.'],
  ['Quel trou correspond à la compression ?', 'Le trou ovale.'],
  ['Pourquoi placer des trous en quinconce ?', 'Pour visser de part et d’autre d’une tige prothétique.'],
  ['Quel nombre de corticales est recherché classiquement de chaque côté ?', 'Au moins huit corticales.'],
  ['Quelle longueur de plaque est privilégiée par l’AO moderne ?', 'Une plaque longue.'],
  ['Comment sont distribuées les vis dans l’approche moderne ?', 'Peu nombreuses et régulièrement réparties.'],
  ['Quelle réduction permet la consolidation primaire ?', 'Une réduction anatomique trait pour trait.'],
  ['Quel montage protège un vissage de traction ?', 'La plaque de neutralisation.'],
  ['Quelle fracture se prête à la neutralisation ?', 'La fracture spiroïde longue.'],
  ['Quel effet recherche une plaque à compression ?', 'Une compression statique axiale.'],
  ['Quel dispositif peut exercer la compression ?', 'Un tendeur de plaque.'],
  ['Quel défaut peut survenir avec une plaque autocompressive ?', 'Le relâchement de la compression.'],
  ['Quelle fracture relève surtout d’un pontage ?', 'La fracture diaphysaire comminutive.'],
  ['Que ne faut-il pas faire dans une comminution pontée ?', 'Dépérioster ni réduire anatomiquement les fragments.'],
  ['Quel type de consolidation est attendu avec un pontage ?', 'La formation d’un cal osseux.'],
  ['Quelle structure doit se reconstituer pour soulager la plaque pontée ?', 'La colonne interne osseuse.'],
  ['Quel objectif anesthésique facilite la réduction ?', 'Le relâchement musculaire.'],
  ['Quel soin cutané reste nécessaire en urgence ?', 'Rasage et antisepsie soigneuse.'],
  ['Quelle installation utilise une traction réglable ?', 'La table orthopédique.'],
  ['Quel trouble sagittal peut être corrigé par la table ?', 'Le flessum ou le recurvatum.'],
  ['Quelle voie est décrite sur la cuisse ?', 'Une voie postérolatérale.'],
  ['Quel muscle est désinséré après ouverture du fascia lata ?', 'Le vaste latéral.'],
  ['Pourquoi proscrire les écarteurs contrecoudés ?', 'Ils entraînent un large dépériostage.'],
  ['Que devient un fragment isolé dans une synthèse biologique ?', 'Il est laissé pédiculé.'],
  ['Quelle corticale juge surtout la qualité de réduction ?', 'La corticale externe.'],
  ['Où est appliquée la plaque fémorale ?', 'Sur la face externe de la diaphyse.'],
  ['Que fait-on du produit de forage ?', 'Il est récupéré et déposé au foyer.'],
  ['Quand une greffe corticospongieuse est-elle recommandée ?', 'Lors de comminution de la face médiale.'],
  ['Quel élément du foyer ne faut-il pas évacuer au lavage ?', 'Les caillots de l’hématome fracturaire.'],
  ['Quel exercice entretient le quadriceps ?', 'Les contractions isométriques.'],
  ['Comment débute la marche postopératoire ?', 'Sans appui avec cannes ou déambulateur.'],
  ['Quel examen est effectué à 45 jours ?', 'Un contrôle radiologique de consolidation.'],
  ['Quand débute au minimum la reprise d’appui ?', 'Après consolidation, vers trois mois au minimum.'],
  ['Comment se fait la réduction en pontage fermé ?', 'Sur l’axe, la longueur et la rotation sans ouvrir le foyer.'],
  ['Où glisse la plaque mini-invasive ?', 'Sous le vaste latéral, au contact de la corticale externe.'],
  ['Quel appareil est indispensable au LISS ?', 'L’amplificateur de brillance.'],
  ['Quelle fracture péri-prothétique est une indication de plaque ?', 'Une fracture près d’une tige de hanche non descellée.'],
  ['Quel avantage apporte une plaque de Lefèvre ?', 'Un vissage oblique en avant et arrière de la tige.'],
  ['Quel est le but d’une plaque sur fracture métastatique ?', 'Le confort et le pronostic fonctionnel.'],
  ['Sur quoi peut prendre appui une plaque dans l’os métastatique ?', 'Sur l’os et le ciment.'],
];
const flashcards = notes.flatMap(([question, answer]) => [{ recto: question, verso: answer }, { recto: `Quel point de décision faut-il retenir : ${question.replace(/\?$/, '')} ?`, verso: answer }]);

const options = (correct, index) => [correct, ...[1, 7, 13, 19].map((offset) => notes[(index + offset) % notes.length][1])];
const makeItems = (correct, index) => options(correct, index).map((enonce, i) => ({ lettre: 'ABCDE'[i], enonce, is_correct: i === 0, justification: i === 0 ? 'Cette réponse est explicitement décrite dans le chapitre.' : 'Cette réponse ne répond pas à la question posée.' }));
const qcmSeries = Array.from({ length: 8 }, (_, s) => ({ label: `QCM ${s + 1} — Plaque fémorale`, questions: Array.from({ length: 5 }, (_, q) => { const i = s * 5 + q; const [enonce, correct] = notes[i]; return { enonce: `Dans le choix d’un montage fémoral, retenir la proposition exacte concernant ${enonce.replace(/^Quelle?\s+/i, '').replace(/\?$/, '')}.`, correction_generale: 'Correction issue des principes biomécaniques et opératoires du chapitre.', items: makeItems(correct, i) }; }) }));

const cases = [
  ['Une patiente de 34 ans présente une fracture fermée spiroïde longue du tiers moyen fémoral. La réduction est trait pour trait et un vissage de traction est possible. Après plaque, elle suit une rééducation précoce ; le suivi associe examen clinique et radiographies avant toute reprise d’appui.', [17, 16, 4, 15, 39, 41, 42]],
  ['Un homme de 58 ans est pris en charge pour une fracture fermée comminutive de diaphyse fémorale. L’équipe veut restaurer l’axe, la longueur et la rotation sans dévasculariser les fragments. Le suivi recherche cal, infection, alignement et intégrité du matériel avant de modifier la mise en charge.', [22, 23, 24, 25, 43, 32, 3]],
  ['Une patiente de 76 ans porte une prothèse totale de hanche non descellée et se fracture le fémur au voisinage de la tige. La tige est remplissante ; un montage par plaque est planifié autour de la prothèse. Après opération, le suivi clinique et radiologique vise une consolidation sans défaillance mécanique.', [46, 12, 47, 14, 42, 3, 40]],
  ['Un homme de 46 ans a une fracture diaphysaire simple haute. Il est installé sur table orthopédique ; l’équipe prépare un abord qui respecte au maximum le foyer. Après fermeture, une mobilisation de hanche et de genou est programmée, avec suivi régulier de la réduction et du matériel.', [28, 29, 30, 31, 34, 38, 40]],
  ['Une femme de 63 ans est opérée par pontage d’une comminution. À six semaines, la radiographie ne montre pas encore de signe net de cal ; la cicatrice est calme. Elle poursuit sa rééducation sans appui complet et l’équipe planifie la surveillance de consolidation.', [41, 24, 25, 26, 42, 3, 39]],
  ['Un patient de 52 ans présente une fracture métastatique douloureuse de la diaphyse fémorale. Une synthèse palliative par plaque est discutée après bilan du segment osseux. Après intervention, le suivi clinique et radiographique recherche confort, fonction, axe, stabilité et consolidation du montage.', [48, 49, 48, 49, 26, 40, 42]],
  ['Une patiente de 29 ans présente une fracture épiphyso-métaphyso-diaphysaire comminutive. Une plaque mini-invasive est posée par courts abords latéraux à distance du foyer avec contrôle radiologique. Le suivi vise la consolidation sans pseudarthrose ni infection.', [44, 45, 43, 28, 22, 25, 41]],
  ['Un homme de 67 ans est revu après plaque pour fracture simple de diaphyse fémorale. La cicatrice est sèche, mais il persiste un discret flessum ; il ne présente ni fièvre ni douleur mécanique majeure. Au suivi postopératoire, le chirurgien contrôle la radiographie, la progression de la rééducation, l’axe, les vis et le calendrier de mise en charge jusqu’à consolidation.', [29, 34, 41, 3, 39, 40, 42]],
];
const dpSeries = cases.map(([vignette, choices], s) => ({ label: `DP ${s + 1} — Décision et suivi`, vignette, questions: choices.map((choice, q) => { const [prompt, answer] = notes[choice]; const notion = prompt.replace(/^Quelle?\s+/i, '').replace(/\?$/, ''); return { enonce: q === 0 ? `À l’évaluation initiale, quelle décision clinique faut-il retenir à propos de : ${notion} ?` : `Nouvel élément : à ce temps du suivi, l’équipe doit décider à propos de : ${notion}. Quelle proposition est adaptée ?`, correction_generale: 'La réponse est justifiée par la stratégie mécanique, le geste et le suivi décrits dans le chapitre.', items: makeItems(answer, choice) }; }) }));

emitOrthopediePackage({ chapterDir, outputDir, fiche, facts: flashcards, series: [...qcmSeries, ...dpSeries] });

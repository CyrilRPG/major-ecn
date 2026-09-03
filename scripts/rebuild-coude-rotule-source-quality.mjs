import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { compileFicheModel, validateFicheModel } from './lib/orthopedie-fiche.mjs';

const corpusRoot = resolve('../.corpus-orthopedie');
const row = (concept, bullets) => ({ concept, bullets });
const section = (title, rows) => ({ title, rows });

// These two source files have a useful clinical core but many illustrations and
// captions were split by the original OCR.  Rather than showing unreliable
// figures, the reconstruction is intentionally text/table-first.
const commonImageException = {
  reason: 'Les légendes et planches du document source sont fragmentées par l’OCR ; aucune figure n’est publiée sans légende source complète et vérifiable.',
};

const coude = {
  title: 'Révision des prothèses totales de coude',
  year: '2025-2026',
  coverSubtitle: 'Bilan de l’échec, stratégie de reprise et préservation du capital osseux',
  sourceBlocks: [12, 17, 19, 21, 23, 39, 45, 47, 51, 58, 60, 76, 78, 79],
  imageException: commonImageException,
  parts: [
    { title: 'Comprendre l’échec prothétique', sections: [
      section('Objectifs du bilan de reprise', [
        row('Raison de l’arthroplastie initiale', ['Préciser l’indication de la prothèse initiale, les interventions antérieures et les complications postopératoires.', 'Identifier le mécanisme dominant de l’échec avant de proposer une technique de reprise.']),
        row('Septique ou aseptique', ['La première question est d’éliminer une infection active avant toute réimplantation.', 'Le bilan inflammatoire associe VS et CRP ; la ponction articulaire avec analyse bactériologique complète l’évaluation.']),
        row('Examen clinique', ['Évaluer la douleur, l’arc de mobilité, l’état cutané et les cicatrices.', 'Documenter le statut neurologique, notamment dans le territoire du nerf ulnaire.'])
      ]),
      section('Imagerie et capital osseux', [
        row('Radiographies standard', ['Analyser le type de prothèse, la fixation des composants et leur position.', 'Rechercher ostéolyse, perte osseuse, amincissement cortical et fracture périprothétique.']),
        row('Implant descellé', ['Le descellement peut s’accompagner d’une résorption osseuse et d’une ballonisation humérale ou ulnaire.', 'La qualité osseuse et l’existence d’une fracture conditionnent la reconstruction.']),
        row('Scintigraphie aux leucocytes marqués', ['Elle peut compléter le bilan lorsque persiste la question d’un processus septique actif.', 'Son résultat s’interprète avec la clinique, la biologie et les prélèvements.'])
      ])
    ]},
    { title: 'Situations de défaillance', sections: [
      section('Usure, instabilité et luxation', [
        row('Usure du polyéthylène', ['C’est une défaillance mécanique fréquente ; les débris peuvent participer au descellement.', 'Les symptômes peuvent associer douleur, contact métal-métal, instabilité ou luxation.']),
        row('Instabilité d’une prothèse à glissement', ['Elle peut être précoce ou plus progressive, avec ressaut, perte de force ou perte de fonction.', 'Rechercher insuffisance ligamentaire, mauvais positionnement ou usure asymétrique.']),
        row('Stratégie devant une instabilité persistante', ['L’immobilisation peut être discutée dans certaines instabilités précoces.', 'Une instabilité persistante impose de réévaluer les ligaments et le positionnement ; une reprise vers une prothèse semi-contrainte peut être nécessaire.'])
      ]),
      section('Fractures périprothétiques', [
        row('Fracture métaphysaire', ['Elle est située au voisinage du segment articulaire.', 'Une fracture de l’olécrane compromet le triceps et nécessite une ostéosynthèse.']),
        row('Fracture autour de la tige', ['Elle est fréquemment associée à un descellement.', 'La reprise utilise une tige plus longue qui ponte la zone fracturaire, avec renfort osseux selon le capital disponible.']),
        row('Fracture à distance de la tige', ['Lorsque l’implant reste stable, un traitement orthopédique ou une ostéosynthèse par plaque et cerclage peut être envisagé.', 'La décision dépend de la stabilité prothétique, de la localisation et de la qualité des corticales.'])
      ])
    ]},
    { title: 'Planifier la reconstruction', sections: [
      section('Choisir l’implant de reprise', [
        row('Fixation recherchée', ['La possibilité d’obtenir une fixation fiable par tige dépend de la quantité et de la qualité osseuses ainsi que du manteau de ciment.', 'Une prothèse à charnière est souvent nécessaire en reprise pour assurer une stabilité immédiate.']),
        row('Tiges longues', ['Prévoir des tiges suffisamment longues pour franchir une zone de fragilité corticale ou de fracture.', 'Disposer d’options humérales et ulnaires longues avant l’intervention.']),
        row('Implant sur mesure', ['Il peut être nécessaire lorsqu’une perte osseuse majeure ne permet pas l’utilisation d’implants standards.', 'Cette éventualité doit être anticipée lors de la planification préopératoire.'])
      ]),
      section('Gérer la perte osseuse', [
        row('Manteau de ciment intact', ['Une réimplantation dans le ciment peut être envisagée lorsqu’il est intact et compatible avec la nouvelle fixation.', 'La décision reste conditionnée par l’absence d’infection et la stabilité attendue.']),
        row('Os natif ou greffe spongieuse', ['Une réimplantation dans l’os natif est possible quand le capital osseux est préservé.', 'Une augmentation par greffons spongieux se discute lorsque le défaut osseux le justifie.']),
        row('Greffe corticale ou allogreffe massive', ['Une greffe corticale en étai renforce une corticale fragilisée.', 'Une allogreffe peut être utilisée comme manchon autour de la prothèse en cas de perte de substance importante.'])
      ])
    ]},
    { title: 'Conduite opératoire et sécurité', sections: [
      section('Exposition et prélèvements', [
        row('Voie d’abord', ['La voie postérieure reprend habituellement les incisions antérieures ; une incision décalée de la pointe de l’olécrane est habituelle.', 'L’exposition est choisie en tenant compte du triceps, de l’olécrane et de la nécessité éventuelle d’élargir l’abord.']),
        row('Protection nerveuse', ['Repérer systématiquement le nerf ulnaire.', 'Isoler également le nerf radial si une exposition postérieure ou latérale de l’humérus le rend nécessaire.']),
        row('Prélèvements tissulaires', ['Effectuer des prélèvements multiples pour bactériologie et anatomopathologie.', 'Cette étape est indispensable avant une réimplantation quand l’infection reste possible.'])
      ]),
      section('Extraction et réimplantation', [
        row('Dépose de l’implant', ['Une prothèse descellée est plus simple à extraire qu’un implant bien fixé.', 'Éviter toute manœuvre qui aggrave une perte osseuse, provoque une fausse route ou crée une fracture.']),
        row('Fenêtre osseuse', ['Une fenêtre dorsale peut être nécessaire lorsque l’extraction est impossible autrement.', 'Après l’extraction, elle est repositionnée puis stabilisée avant l’injection du ciment.']),
        row('Scellement', ['Utiliser une technique de cimentage adaptée aux fûts huméral et ulnaire.', 'Un ciment de basse viscosité avec antibiotique est habituellement utilisé dans la stratégie décrite.'])
      ])
    ]}
  ],
  synthesis: {
    tables: [
      { title: 'Bilan préopératoire de la reprise', headers: ['Domaine', 'À rechercher', 'Conséquence'], rows: [['Infection', 'Clinique, VS, CRP, ponction', 'Ne pas réimplanter sans stratégie infectieuse définie'], ['Peau et cicatrices', 'Qualité de couverture', 'Adapter la voie et prévoir la gestion des tissus mous'], ['Nerfs', 'Fonction ulnaire et examen neurologique', 'Repérage et protection peropératoires'], ['Os et implants', 'Ostéolyse, fracture, stabilité', 'Choix de la tige et de la reconstruction']] },
      { title: 'Principes de stratégie', headers: ['Situation', 'Principe de reprise', 'Vigilance'], rows: [['Instabilité persistante', 'Réparer ou reconstruire les contraintes ; réviser si nécessaire', 'Positionnement et ligaments'], ['Fracture autour de tige', 'Tige longue pontant la fracture', 'Renfort cortical ou greffe selon le défaut'], ['Perte osseuse limitée', 'Réimplantation dans l’os ou le ciment adapté', 'Fixation stable et absence d’infection'], ['Perte osseuse majeure', 'Allogreffe ou implant sur mesure', 'Planification et disponibilité des implants']] }
    ],
    keyPoints: ['Toujours distinguer un échec septique d’un échec aseptique avant la reprise.', 'Le bilan clinique comprend peau, cicatrices, mobilité et examen neurologique ulnaire.', 'La radiographie apprécie la fixation, l’ostéolyse, les corticales et les fractures.', 'Une fracture autour de tige avec descellement impose habituellement une révision par tige longue.', 'La perte osseuse guide l’utilisation d’os natif, de greffes spongieuses, d’étais corticaux ou d’allogreffe.', 'La chirurgie protège le triceps et les nerfs ulnaire et radial.', 'Les prélèvements tissulaires multiples font partie de la stratégie de reprise.'],
    eclair: ['Avant toute reprise : documenter l’indication initiale et éliminer une infection.', 'Clinique : douleur, mobilité, peau, cicatrices, nerf ulnaire.', 'Imagerie : fixation, ostéolyse, capital osseux, fracture périprothétique.', 'Instabilité : rechercher ligaments, positionnement et usure du polyéthylène.', 'Fracture autour de tige : penser tige longue et reconstruction osseuse.', 'Préserver triceps, nerf ulnaire, nerf radial et corticales durant l’extraction.', 'Prélever plusieurs échantillons pour bactériologie et anatomopathologie.']
  }
};

const rotule = {
  title: 'Ruptures de l’appareil extenseur du genou et fractures de la rotule',
  year: '2025-2026',
  coverSubtitle: 'Diagnostic lésionnel, réparation et protection postopératoire',
  sourceBlocks: [13, 19, 24, 29, 31, 42, 57, 64, 77, 79, 87, 91, 96, 98, 100, 111, 119, 121, 123, 125, 164, 177, 179],
  imageException: commonImageException,
  parts: [
    { title: 'Repères et diagnostic', sections: [
      section('Appareil extenseur', [
        row('Constitution', ['L’appareil extenseur réunit le quadriceps, la patella et le tendon patellaire.', 'Les expansions des vastes et les ailerons participent à l’extension et à la stabilité médiolatérale de la patella.']),
        row('Rôle de la patella', ['La patella est un os sésamoïde interposé dans l’appareil extenseur.', 'Elle augmente l’efficacité du quadriceps en reportant sa force de traction vers l’avant.']),
        row('Déficit d’extension active', ['Il traduit l’interruption fonctionnelle de l’appareil extenseur.', 'Il constitue un élément majeur de décision devant une fracture de patella ou une rupture tendineuse.'])
      ]),
      section('Mécanismes et terrain', [
        row('Fracture de patella', ['Un choc direct entraîne une compression antérieure, souvent responsable d’une fracture comminutive.', 'Un mécanisme indirect met l’appareil extenseur en tension et peut fracturer la patella par traction.']),
        row('Rupture quadricipitale', ['Elle survient volontiers après une contraction brutale chez des patients présentant un terrain fragilisant.', 'Insuffisance rénale, diabète, polyarthrite, goutte, hyperparathyroïdie, corticothérapie ou fluoroquinolones sont des facteurs rapportés.']),
        row('Rupture patellaire', ['Elle touche souvent un sujet actif lors d’une contraction brutale sur genou légèrement fléchi.', 'Un tendon dégénératif ou des microtraumatismes répétés favorisent la rupture.'])
      ])
    ]},
    { title: 'Fractures de la patella', sections: [
      section('Lire la fracture', [
        row('Déplacement', ['Apprécier le décalage entre fragments et l’écart interfragmentaire.', 'Évaluer surtout le retentissement sur la continuité de l’appareil extenseur.']),
        row('Traits qui interrompent l’extension', ['Les fractures transversales, comminutives et les avulsions polaires peuvent interrompre la continuité de l’appareil extenseur.', 'Les fractures sagittales ou parcellaires préservent plus volontiers l’extension.']),
        row('Indication opératoire', ['Une incompétence de l’appareil extenseur constitue l’indication habituelle du traitement chirurgical.', 'Un déplacement important peut également motiver une réduction et une stabilisation.'])
      ]),
      section('Traitement et suites', [
        row('Ostéosynthèse', ['La réduction à foyer ouvert est la référence des fractures déplacées ; le hauban est une technique courante.', 'Une incision médiane verticale facilite l’extension de l’abord et préserve les options chirurgicales ultérieures.']),
        row('Réduction et protection cutanée', ['La réduction doit être contrôlée ; les ailerons patellaires sont réparés si nécessaire.', 'Les extrémités de broches doivent être enfouies afin de prévenir une perforation cutanée.']),
        row('Rééducation après montage stable', ['La marche avec appui protégé en extension peut être autorisée précocement selon la stabilité.', 'La récupération privilégie la lutte contre le flexum, le réveil du quadriceps et une flexion progressive sans surcharger l’ostéosynthèse.'])
      ])
    ]},
    { title: 'Ruptures tendineuses sur genou natif', sections: [
      section('Tendon quadricipital', [
        row('Lésion récente', ['La réparation est réalisée rapidement afin de limiter la rétraction du quadriceps.', 'La réinsertion utilise des tunnels transosseux ou des ancres selon la situation ; les ailerons sont suturés.']),
        row('Lésion chronique', ['Le rapprochement des extrémités peut nécessiter une libération du quadriceps.', 'Si le contact reste impossible, une plastie d’allongement en V-Y ou selon Codivilla peut être utilisée.']),
        row('Protection postopératoire', ['Le genou est immobilisé en extension pendant une période prolongée avant la reprise graduée de la mobilité.', 'Une reprise trop précoce ou une chute expose à une rupture itérative.'])
      ]),
      section('Tendon patellaire', [
        row('Lésion récente', ['Le traitement chirurgical ne se discute pas et doit être entrepris rapidement.', 'La réparation est une suture ou une réinsertion ; elle nécessite le contrôle de la hauteur patellaire.']),
        row('Renforcement', ['Un renfort, notamment par semi-tendineux, est souvent associé afin de protéger la réparation.', 'Le contrôle radiographique comparatif aide à éviter d’abaisser la patella lors de la suture.']),
        row('Lésion ancienne', ['La patella peut être ascensionnée par la traction quadriceps, rendant la suture directe difficile.', 'Les options comprennent les renforcements tendineux, les transplants composites et, dans certaines situations, une allogreffe.'])
      ])
    ]},
    { title: 'Lésions sur prothèse totale de genou', sections: [
      section('Fracture de patella sur PTG', [
        row('Évaluation spécifique', ['Tenir compte de la stabilité du bouton patellaire et de l’intégrité de l’appareil extenseur.', 'La présence de l’implant complique la réalisation d’une ostéosynthèse classique.']),
        row('Décision thérapeutique', ['Une fracture sans déplacement majeur ni rupture de l’appareil extenseur relève volontiers d’un traitement orthopédique.', 'Les fractures avec interruption de l’appareil extenseur imposent une stratégie de réparation individualisée.']),
        row('Montage et immobilisation', ['Lorsque l’ostéosynthèse est retenue, la faible qualité osseuse peut rendre le montage précaire.', 'Une immobilisation en extension reste nécessaire pour protéger la réparation.'])
      ]),
      section('Ruptures tendineuses et reconstruction', [
        row('Rupture quadricipitale sur PTG', ['Le bouton patellaire peut compliquer les tunnels osseux.', 'La qualité des tissus mous et la vascularisation réduite expliquent la fréquence des échecs ; un renfort est à discuter.']),
        row('Rupture du tendon patellaire sur PTG', ['La réparation directe récente peut être renforcée par semi-tendineux, gracilis ou ligament synthétique.', 'Dans les situations chroniques et multiopérées, les lambeaux ou les greffes peuvent être nécessaires.']),
        row('Allogreffe et lambeau gastrocnémien', ['L’allogreffe complète d’appareil extenseur ou de tendon calcanéen est une option de sauvetage sélectionnée.', 'Le lambeau de gastrocnémien médial est surtout utile quand une couverture par tissus vascularisés est nécessaire.'])
      ])
    ]}
  ],
  synthesis: {
    tables: [
      { title: 'Décision devant une rupture ou une fracture', headers: ['Situation', 'Élément déterminant', 'Principe'], rows: [['Fracture de patella', 'Extension active et déplacement', 'Opérer si l’appareil extenseur est incompétent ou si la réduction est requise'], ['Rupture quadricipitale récente', 'Rétraction limitée', 'Réparation précoce et protection en extension'], ['Rupture patellaire récente', 'Hauteur patellaire', 'Réinsertion ou suture renforcée après contrôle de hauteur'], ['Lésion chronique', 'Rétraction et perte de substance', 'Allongement, renfort ou greffe selon le défaut']] },
      { title: 'Particularités sur prothèse totale de genou', headers: ['Problème', 'Conséquence', 'Réponse'], rows: [['Bouton patellaire', 'Tunnels et ostéosynthèse difficiles', 'Adapter la fixation et évaluer sa stabilité'], ['Tissus mous fragiles', 'Risque de rupture itérative', 'Renforcement et immobilisation stricte'], ['Perte de substance', 'Réparation directe insuffisante', 'Autogreffe, allogreffe ou lambeau selon le contexte'], ['Implant descellé', 'Conflit avec la reconstruction', 'Retrait ou révision selon la stratégie globale']] }
    ],
    keyPoints: ['Le déficit d’extension active signe une incompétence de l’appareil extenseur.', 'Devant une fracture de patella, la continuité de l’appareil extenseur oriente la décision.', 'Les fractures déplacées sont habituellement stabilisées par réduction et ostéosynthèse.', 'Une rupture quadricipitale récente doit être réparée rapidement pour limiter la rétraction.', 'La réparation du tendon patellaire contrôle impérativement la hauteur de la patella.', 'Les lésions chroniques demandent souvent un renfort, un allongement ou une greffe.', 'Sur PTG, la fragilité des tissus et l’implant patellaire compliquent la reconstruction.'],
    eclair: ['Appareil extenseur : quadriceps, patella, tendon patellaire et expansions.', 'Déficit d’extension active : rechercher fracture déplacée ou rupture tendineuse.', 'Fracture de patella : opérer si l’appareil extenseur est interrompu ou si la réduction est nécessaire.', 'Hauban : montage classique des fractures déplacées, avec protection des extrémités de broches.', 'Rupture quadricipitale : réparation précoce, puis immobilisation en extension.', 'Rupture patellaire : restaurer la hauteur patellaire et renforcer la réparation.', 'Sur PTG : anticiper les difficultés de fixation, les tissus fragiles et l’immobilisation.']
  }
};

const chapters = [
  ['revision-des-protheses-totales-de-coude', coude],
  ['ruptures-de-l-appareil-extenseur-du-genou-et-fractures-de-la-rotule', rotule],
];

for (const [slug, fiche] of chapters) {
  const chapterDir = join(corpusRoot, slug);
  const out = join(chapterDir, 'delivery', 'reconstruction-source-quality-2026-08-11');
  mkdirSync(out, { recursive: true });
  const validation = validateFicheModel(fiche, chapterDir);
  if (validation.errors.length) throw new Error(`${fiche.title}:\n- ${validation.errors.join('\n- ')}`);
  const html = compileFicheModel(fiche, chapterDir);
  writeFileSync(join(out, 'fiche.model.json'), `${JSON.stringify(fiche, null, 2)}\n`, 'utf8');
  writeFileSync(join(out, 'fiche.body.html'), html, 'utf8');
  writeFileSync(join(out, 'manifest.json'), `${JSON.stringify({ title: fiche.title, validation, sourceOnly: true }, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ slug, title: fiche.title, chars: html.length, figures: validation.figureCount }));
}

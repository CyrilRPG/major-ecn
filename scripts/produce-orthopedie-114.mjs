import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { compileFicheModel } from './lib/orthopedie-fiche.mjs';

const directory = resolve(process.argv[2] || '..\\.corpus-orthopedie\\traitement-chirurgical-palliatif-des-paralysies-de-l-epaule');
const output = resolve(process.argv[3] || join(directory, 'delivery', 'source-quality-v2'));
mkdirSync(output, { recursive: true });

const image = (number) => ({ path: `img/img_${String(number).padStart(3, '0')}.png`, position: 'after', size: 'large' });
const row = (concept, bullets, extra = {}) => ({ concept, bullets, ...extra });
const marker = (kind, bullets) => ({ kind, bullets });

const fiche = {
  title: 'Traitement chirurgical palliatif des paralysies de l’épaule',
  year: '2025-2026',
  sourceBlocks: [62, 72, 78, 84, 87, 91, 103, 104, 105, 107, 127, 128, 129, 136, 141, 145, 146, 147, 162, 181, 208, 232, 235, 253, 256, 257, 269, 271, 273],
  parts: [
    {
      title: 'Comprendre l’épaule neurologique',
      sections: [
        { title: 'Deux systèmes à analyser séparément', rows: [
          row('Scapulohumérale et scapulothoracique', [
            'L’épaule associe un système scapulohuméral, animé par la coiffe et le deltoïde, et un système scapulothoracique.',
            'Les deux systèmes sont complémentaires mais leurs groupes musculaires dépendent de troncs nerveux différents.',
            'Une compensation n’est utile que si le système déficitaire garde une stabilité ou une contraction résiduelle.'
          ], { image: image(1) }),
          row('Moteurs scapulothoraciques', [
            'Le dentelé antérieur est le moteur principal de la scapula ; le trapèze la stabilise contre la paroi thoracique.',
            'Rhomboïdes et élévateur de la scapula participent à la compensation d’une insuffisance du trapèze.',
            'Le winging scapula diminue l’efficacité des muscles de la scapulohumérale.'
          ]),
          row('Logique fonctionnelle', [
            'Le but de la chirurgie palliative est de restituer une fonction utile, non de normaliser chaque force musculaire.',
            'Le choix d’un transfert dépend de la course, de la force et de la disponibilité du muscle donneur.',
            'Le grand dorsal est un donneur à grande course ; le trapèze est proche mécaniquement du deltoïde.'
          ])
        ]},
        { title: 'Phénotype neurologique et objectif', rows: [
          row('Déficit scapulohuméral complet', [
            'Il touche le deltoïde et la coiffe, notamment dans les paralysies C5-C6 ou une atteinte axillaire associée au suprascapulaire.',
            'L’objectif est une abduction, une rotation externe et surtout une stabilisation permettant la compensation scapulothoracique.',
            'Un transfert isolé ne restitue au mieux qu’une stabilité scapulohumérale partielle.'
          ]),
          row('Déficit scapulohuméral partiel', [
            'Les déficits d’abduction et de rotation externe sont les plus représentés.',
            'Les atteintes nerveuses distales, moins accessibles aux transferts nerveux, conduisent plus souvent à un transfert tendineux.',
            'Une évaluation de la mobilité passive précède toute décision de transfert.'
          ]),
          row('Déficit scapulothoracique', [
            'La paralysie du trapèze relève du nerf accessoire ; celle du dentelé antérieur du nerf thoracique long.',
            'La priorité est de stabiliser la scapula, puis de restaurer sa cinétique si cela est possible.',
            'Les déficits combinés sont rares et ont des objectifs fonctionnels plus limités.'
          ], { image: image(7) })
        ]}
      ]
    },
    {
      title: 'Indiquer une chirurgie palliative',
      sections: [
        { title: 'Pré-requis et séquence thérapeutique', rows: [
          row('Conditions avant transfert', [
            'Le squelette doit être consolidé, la mobilité passive conservée et les téguments de trophicité satisfaisante.',
            'Une infection évolutive contre-indique le geste de transfert.',
            'Le bilan précise les muscles déficitaires, les muscles disponibles et les capacités de compensation.'
          ]),
          row('Temps neurologique et rééducation', [
            'Lorsqu’elle est possible, une stratégie nerveuse précoce est privilégiée : neurolyse, suture-greffe ou neurotisation.',
            'Après six mois pour le suprascapulaire et après le délai cité pour l’axillaire, la qualité de la réinnervation devient médiocre.',
            'Une rééducation spécialisée renforce d’abord les compensations au sein et entre les deux systèmes.'
          ]),
          marker('piege', ['Un transfert ne se substitue ni à une mobilité passive conservée ni à une évaluation de la récupération nerveuse.'])
        ]},
        { title: 'Choisir transfert ou arthrodèse', rows: [
          row('Fonctions prioritaires', [
            'L’abduction isolée peut relever du trapèze supérieur ou d’un grand dorsal transféré en totalité.',
            'La rotation latérale est fréquemment réanimée par le grand dorsal ou le trapèze inférieur.',
            'La rotation médiale nécessite plus rarement une réanimation ; le grand pectoral est alors le donneur le plus utilisé.'
          ]),
          row('Arthrodèse scapulohumérale', [
            'Elle constitue une solution de repli aux résultats reproductibles lorsque la scapulothoracique reste fonctionnelle.',
            'Elle stabilise la scapulohumérale pour exploiter la mobilité scapulothoracique et positionner la main dans l’espace.',
            'La morphologie et les objectifs de contact main-bouche et main-poche guident le réglage peropératoire.'
          ], { image: image(19) }),
          row('Limites des formes globales', [
            'Les dystrophies, tétraplégies hautes, poliomyélites et atteintes diffuses donnent des indications plus restreintes.',
            'Une atteinte simultanée sévère des deux systèmes diminue l’intérêt d’une stabilisation isolée.',
            'La décision est individualisée selon le bénéfice fonctionnel réellement attendu.'
          ])
        ]}
      ]
    },
    {
      title: 'Réanimation de la scapulohumérale',
      sections: [
        { title: 'Restaurer l’abduction', rows: [
          row('Transfert du trapèze supérieur', [
            'Le trapèze supérieur est choisi pour des propriétés mécaniques proches de celles du deltoïde et une innervation extraplexuelle par le nerf accessoire.',
            'L’installation autorise l’abord postérieur de l’épaule et la libération large du champ opératoire.',
            'Le transfert peut recevoir une composante de rotation externe par fixation postérieure sur l’humérus.'
          ], { image: image(9) }),
          row('Transfert du grand dorsal en place du deltoïde', [
            'Il vise notamment une flexion de l’épaule plus physiologique et conserve l’arche coracoacromiale.',
            'Il doit être évité en présence de lésions associées de la coiffe qui aggravent son asymétrie fonctionnelle.',
            'Un transfert du petit rond vers l’infra-épineux peut être associé pour renforcer la rotation externe.'
          ]),
          row('Sécurité de dissection', [
            'Dans l’espace postérieur, le nerf radial chemine en avant du tendon du grand dorsal.',
            'Le nerf axillaire se situe en arrière et au-dessus ; un fascia sépare les tendons des éléments nerveux.',
            'Le repérage des rapports nerveux conditionne la sécurité du prélèvement et du tunnel de transfert.'
          ])
        ]},
        { title: 'Restaurer la rotation et la mobilité passive', rows: [
          row('Rotation externe', [
            'Les transferts du grand dorsal et du trapèze inférieur sont les options citées pour la rotation latérale.',
            'Une rotation externe passive inférieure à 30–40° fait discuter une libération antérieure associée.',
            'La fixation du grand dorsal vers l’infra-épineux est décrite pour la réanimation de la rotation externe.'
          ], { image: image(16) }),
          row('Libération antérieure', [
            'Elle rééquilibre les couples musculaires et peut faciliter l’action du transfert sur la rotation externe.',
            'Les options rapportées sont la libération distale à ciel ouvert, la libération arthroscopique proximale et la désinsertion proximale du subscapulaire.',
            'L’IRM évalue une subluxation postérieure et la morphologie glénoïdienne avant un geste de parties molles.'
          ]),
          marker('a_retenir', ['Avant de réanimer la rotation, vérifier que le volant de mobilité passive est récupérable.'])
        ]}
      ]
    },
    {
      title: 'Stabiliser la scapulohumérale et la scapulothoracique',
      sections: [
        { title: 'Arthrodèse scapulohumérale', rows: [
          row('Position fonctionnelle', [
            'La position classiquement rapportée associe 30° d’abduction, 30° de flexion et 30° de rotation interne.',
            'Elle doit être validée sur le patient, notamment pour permettre les contacts main-bouche et main-grand trochanter.',
            'Le faible contact osseux, les bras de levier et l’ostéoporose neurologique compliquent la fixation.'
          ]),
          row('Fixateur externe et consolidation', [
            'Le fixateur externe facilite le réglage peropératoire de la position et permet une rééducation précoce sous protection.',
            'La technique vise une fusion intra-articulaire scapulohumérale et extra-articulaire acromiohumérale.',
            'L’immobilisation thoracobrachiale est rapportée pendant deux mois, puis la protection est prolongée après ablation du fixateur.'
          ]),
          row('Points de surveillance', [
            'La consolidation, la qualité du positionnement et les objectifs fonctionnels doivent être vérifiés au suivi.',
            'L’avantage du fixateur est d’éviter une ablation secondaire de plaque gênante sur une épaule atrophiée.',
            'La fragilité de l’humérus ostéoporotique impose une vigilance vis-à-vis des fractures sous arthrodèse.'
          ])
        ]},
        { title: 'Winging scapula et transferts scapulothoraciques', rows: [
          row('Paralysie du trapèze', [
            'Elle est liée à une atteinte du nerf accessoire, souvent cervicale, traumatique ou iatrogène.',
            'L’examen retrouve une asymétrie cervicale, une perte du galbe trapézien et un décollement douloureux de la scapula.',
            'L’électromyogramme recherche une réinnervation avant de retenir une stratégie palliative.'
          ]),
          row('Triple transfert d’Eden-Lange', [
            'Il transfère l’élévateur de la scapula, le grand et le petit rhomboïdes pour restituer les trois composantes du trapèze.',
            'Les stabilisations statiques par tissus inertes se relâchent avec le temps.',
            'La chirurgie nerveuse est prioritaire dans les six premiers mois et écartée après un an selon le texte source.'
          ], { image: image(21) }),
          row('Paralysie du dentelé antérieur', [
            'Elle correspond à une atteinte du nerf thoracique long et entraîne un winging scapula.',
            'Le transfert du petit pectoral est présenté comme une option de réanimation de ce déficit.',
            'La stabilisation scapulaire vise à redonner une base efficace au mouvement scapulohuméral.'
          ])
        ]}
      ]
    },
    {
      title: 'Recours par arthrodèse scapulothoracique',
      sections: [
        { title: 'Indication et contre-indications', rows: [
          row('Place de recours', [
            'L’arthrodèse scapulothoracique est réservée aux échecs ou impossibilités des gestes nerveux et des transferts tendineux.',
            'Elle peut être discutée dans les dystrophies musculaires ou les poliomyélites étendues.',
            'Son objectif est de stabiliser la scapula sur le thorax afin d’améliorer une fonction scapulohumérale utilisable.'
          ]),
          row('Test préopératoire', [
            'La stabilisation manuelle de la scapula suivie d’une élévation antérieure du bras prédit le bénéfice fonctionnel attendu.',
            'Une extension du déficit à la scapulohumérale est une contre-indication majeure, car stabiliser la scapula n’apporte alors pas de gain.',
            'Une restriction respiratoire sévère et le tabagisme actif sont des contre-indications relatives.'
          ], { image: image(27) }),
          row('Principes techniques', [
            'L’intervention est réalisée en décubitus latéral ou ventral, épaule à 90° d’abduction et 30° de flexion selon le texte source.',
            'La protection du pédicule intercostal et de la plèvre pariétale est un temps de sécurité essentiel.',
            'La fixation associe fils d’acier autour des côtes, plaque sous-épineuse et greffe osseuse entre côtes et scapula.'
          ])
        ]},
        { title: 'Résultats et suivi fonctionnel', rows: [
          row('Bénéfice et limites', [
            'Le chapitre rapporte un gain d’élévation antérieure après arthrodèse scapulothoracique, avec une diminution de la rotation externe.',
            'Le risque de pseudarthrodèse et de complications réserve ce geste aux indications fonctionnelles solides.',
            'La surveillance associe consolidation, douleur, respiration et fonction du membre supérieur.'
          ]),
          row('Décision centrée sur l’usage', [
            'Le résultat pertinent est l’amélioration des gestes utiles, pas la restitution d’une épaule normale.',
            'Chaque option doit être rapportée à la fonction conservée, aux muscles compensateurs et au terrain neurologique.',
            'Le suivi guide la rééducation et l’adaptation des objectifs fonctionnels.'
          ]),
          marker('a_retenir', ['Une arthrodèse réussie est un compromis de stabilité et de position fonctionnelle, décidé après vérification du bénéfice attendu.'])
        ]}
      ]
    }
  ],
  synthesis: {
    chiffres: { headers: ['Paramètre', 'Valeur / seuil', 'Utilisation'], rows: [
      ['Réinnervation suprascapulaire', 'Après 6 mois : médiocre', 'Favoriser évaluation précoce'],
      ['Rotation externe passive', '< 30–40°', 'Discuter libération antérieure'],
      ['Arthrodèse scapulohumérale', '30° / 30° / 30°', 'Abduction, flexion, rotation interne'],
      ['Immobilisation après arthrodèse SH', '2 mois', 'Attelle thoracobrachiale rapportée'],
      ['Arthrodèse scapulothoracique', '90° / 30°', 'Abduction et flexion au réglage']
    ]},
    tables: [
      { title: 'Lecture du déficit', headers: ['Situation', 'Problème fonctionnel', 'Orientation'], rows: [
        ['Deltoïde + coiffe', 'Abduction / rotation externe', 'Transfert ou arthrodèse selon stabilité'],
        ['Rotation externe isolée', 'Positionnement de la main', 'Grand dorsal ou trapèze inférieur'],
        ['Trapèze paralysé', 'Scapula instable', 'Évaluer récupération ; Eden-Lange si recours'],
        ['Dentelé antérieur paralysé', 'Winging scapula', 'Stabilisation / transfert du petit pectoral']
      ]},
      { title: 'Choix du recours', headers: ['Option', 'Condition', 'But'], rows: [
        ['Chirurgie nerveuse', 'Délai et lésion favorables', 'Réinnervation'],
        ['Transfert tendineux', 'Mobilité passive et donneur disponible', 'Fonction ciblée'],
        ['Arthrodèse SH', 'Scapulothoracique fonctionnelle', 'Stabilité pour compensation'],
        ['Arthrodèse STh', 'Échec / impossibilité des transferts', 'Stabilité de la scapula']
      ]},
      { title: 'Sécurité et suivi', headers: ['Risque', 'Prévention', 'Contrôle'], rows: [
        ['Raideur', 'Évaluer mobilité passive', 'Amplitude utile'],
        ['Déficit nerveux persistant', 'EMG et délai de récupération', 'Fonction des donneurs'],
        ['Fixation fragile', 'Position validée, os et montage adaptés', 'Consolidation'],
        ['Atteinte pleurale / intercostale', 'Dissection prudente des côtes', 'Douleur et respiration']
      ]}
    ],
    keyPoints: [
      'Analyser séparément les systèmes scapulohuméral et scapulothoracique.',
      'Un transfert exige un squelette consolidé, une mobilité passive et des téguments sains.',
      'La stratégie nerveuse et la rééducation précèdent le geste palliatif.',
      'Le grand dorsal et le trapèze sont des donneurs majeurs selon la fonction visée.',
      'L’arthrodèse scapulohumérale nécessite une scapulothoracique fonctionnelle.',
      'Le winging scapula impose d’identifier trapèze ou dentelé antérieur.',
      'L’arthrodèse scapulothoracique est une solution de recours et reste fonctionnelle.'
    ],
    eclair: [
      'Épaule neurologique : distinguer déficit scapulohuméral et scapulothoracique.',
      'Avant transfert : os consolidé, mobilité passive, téguments sains, pas d’infection.',
      'Réanimation nerveuse précoce puis rééducation spécialisée ; palliatif si compensation insuffisante.',
      'Abduction : trapèze supérieur ou grand dorsal ; rotation externe : grand dorsal ou trapèze inférieur.',
      'Rotation externe passive < 30–40° : discuter libération antérieure.',
      'Arthrodèse SH : repli si scapulothoracique fonctionnelle ; vérifier main-bouche / main-poche.',
      'Arthrodèse STh : recours après test de stabilisation manuelle et bilan respiratoire.'
    ]
  }
};

const facts = [
  ['Quels sont les deux systèmes articulaires de l’épaule neurologique ?', 'Scapulohuméral et scapulothoracique', 91],
  ['Quels muscles dominent le système scapulohuméral ?', 'Coiffe des rotateurs et deltoïde', 91],
  ['Quel muscle est le moteur principal de la scapula ?', 'Dentelé antérieur', 91],
  ['Quel muscle plaque surtout la scapula sur le thorax ?', 'Trapèze', 91],
  ['Quelle condition rend une compensation entre systèmes utile ?', 'Stabilité ou contraction résiduelle du système déficitaire', 107],
  ['Pourquoi le winging scapula altère-t-il le geste du bras ?', 'Il réduit l’efficacité des muscles scapulohuméraux', 85],
  ['Quels muscles peuvent compenser partiellement un trapèze paralysé ?', 'Dentelé antérieur, rhomboïdes et élévateur de la scapula', 105],
  ['Quel donneur possède une grande course musculaire ?', 'Grand dorsal', 62],
  ['Quel donneur a des propriétés proches du deltoïde ?', 'Trapèze', 62],
  ['Quelle fonction guide la chirurgie palliative ?', 'Une fonction utile du membre supérieur', 129],
  ['Quels éléments sont touchés dans un déficit scapulohuméral complet ?', 'Deltoïde et muscles de la coiffe', 78],
  ['Quelle racine plexuelle est citée dans ces déficits complets ?', 'C5-C6', 79],
  ['Quelle association nerveuse peut reproduire un déficit complet ?', 'Nerf axillaire associé au suprascapulaire', 80],
  ['Quels objectifs sont recherchés dans un déficit complet ?', 'Abduction, rotation externe et stabilisation', 81],
  ['Quelle fonction est fréquemment déficitaire dans les paralysies partielles ?', 'Rotation externe', 141],
  ['Quelle articulation est déstabilisée dans le winging scapula ?', 'Scapulothoracique', 85],
  ['Quel nerf est atteint dans la paralysie du trapèze ?', 'Nerf accessoire spinal', 112],
  ['Quel nerf est atteint dans la paralysie du dentelé antérieur ?', 'Nerf thoracique long', 110],
  ['Dans quel contexte les déficits combinés sont-ils plus fréquents ?', 'Atteintes neurologiques proximales ou diffuses', 87],
  ['Pourquoi les indications sont-elles limitées dans les déficits globaux ?', 'Terrain précaire et objectifs fonctionnels limités', 87],
  ['Quel état osseux est requis avant un transfert ?', 'Squelette consolidé', 104],
  ['Quel prérequis articulaire est nécessaire avant transfert ?', 'Mobilité passive conservée', 104],
  ['Quel prérequis cutané est nécessaire avant transfert ?', 'Téguments intègres avec trophicité respectée', 104],
  ['Quelle situation infectieuse contre-indique le transfert ?', 'Infection évolutive', 104],
  ['Quel geste neurologique peut être proposé précocement ?', 'Neurolyse', 127],
  ['Quelle autre stratégie nerveuse peut interposer un greffon ?', 'Suture avec greffe', 127],
  ['Quelle stratégie nerveuse utilise un transfert nerveux ?', 'Neurotisation', 127],
  ['Quel délai est cité pour le nerf suprascapulaire ?', 'Au-delà de six mois, réinnervation médiocre', 127],
  ['Que renforce la rééducation spécialisée ?', 'Compensations entre muscles et entre les deux systèmes', 128],
  ['Quel est le dernier recours si les compensations sont insuffisantes ?', 'Transfert tendineux ou arthrodèse', 129],
  ['Quel transfert est cité pour une abduction isolée ?', 'Trapèze supérieur', 136],
  ['Quel autre transfert est cité pour l’abduction ?', 'Grand dorsal transféré en totalité', 136],
  ['Quels transferts sont courants pour la rotation latérale ?', 'Grand dorsal et trapèze inférieur', 141],
  ['Quel donneur est le plus utilisé pour la rotation médiale ?', 'Grand pectoral', 145],
  ['Que permet au mieux un transfert isolé dans un déficit complet ?', 'Stabiliser la scapulohumérale', 146],
  ['Quelle association est citée dans les déficits complets ?', 'Trapèze supérieur pour abduction et grand dorsal pour rotation externe', 146],
  ['Quelle condition rend l’arthrodèse scapulohumérale pertinente ?', 'Scapulothoracique fonctionnelle', 147],
  ['Quel est le but de l’arthrodèse scapulohumérale ?', 'Permettre la compensation par la scapulothoracique', 233],
  ['Quelle installation est citée pour le transfert du trapèze supérieur ?', 'Décubitus latéral dorsal ou beach chair', 162],
  ['Quelle innervation du trapèze est avantageuse dans les paralysies plexuelles ?', 'Nerf accessoire, innervation extraplexuelle', 162],
  ['Quel composant peut être donné au transfert du trapèze ?', 'Composante de rotation externe', 162],
  ['Où peut être fixée la palette pour renforcer la rotation externe ?', 'Partie postérieure de l’humérus', 162],
  ['Quel avantage du grand dorsal en place du deltoïde concerne l’arche ?', 'Respect de l’arche coracoacromiale', 165],
  ['Quand éviter le transfert du grand dorsal en place du deltoïde ?', 'Lésions associées de la coiffe', 165],
  ['Quel transfert associé peut renforcer la rotation externe ?', 'Petit rond vers infra-épineux', 165],
  ['Quel nerf chemine en avant du tendon du grand dorsal ?', 'Nerf radial', 181],
  ['Quel nerf est en arrière et au-dessus du tendon du grand dorsal ?', 'Nerf axillaire', 181],
  ['Quelle structure protège les nerfs lors de la dissection ?', 'Fascia séparant tendons et nerfs', 181],
  ['Quel seuil de rotation externe passive fait discuter une libération ?', 'Inférieure à 30–40°', 181],
  ['Quel transfert est fixé sur l’infra-épineux pour la rotation externe ?', 'Grand dorsal selon Hoffer', 208],
  ['Quel effet peut avoir une libération antérieure ?', 'Faciliter l’action du transfert sur la rotation externe', 208],
  ['Quelle imagerie évalue la morphologie glénoïdienne avant geste de parties molles ?', 'IRM glénohumérale', 208],
  ['Quelle complication morphologique peut suivre une paralysie ancienne chez l’enfant ?', 'Subluxation postérieure de la tête humérale', 208],
  ['Quelle option de libération est la plus récente selon le texte ?', 'Libération arthroscopique proximale', 210],
  ['Quelle autre option concerne le subscapulaire ?', 'Désinsertion proximale', 211],
  ['Quelle est l’indication principale de l’arthrodèse scapulohumérale ?', 'Épaule neurologique', 232],
  ['Quelle abduction est rapportée pour l’arthrodèse scapulohumérale ?', '30°', 233],
  ['Quelle flexion est rapportée pour l’arthrodèse scapulohumérale ?', '30°', 233],
  ['Quelle rotation est rapportée pour l’arthrodèse scapulohumérale ?', '30° de rotation interne', 233],
  ['Quels contacts doivent être testés avant fixation d’arthrodèse SH ?', 'Main-bouche et main-grand trochanter', 233],
  ['Pourquoi la fixation de l’arthrodèse SH est-elle difficile ?', 'Surfaces réduites, bras de levier et ostéoporose', 232],
  ['Quel matériel permet le réglage peropératoire de l’arthrodèse SH ?', 'Fixateur externe', 233],
  ['Quelle fusion intra-articulaire est recherchée ?', 'Fusion scapulohumérale', 234],
  ['Quelle fusion extra-articulaire complète la technique ?', 'Fusion acromiohumérale', 234],
  ['Combien de temps d’attelle thoracobrachiale est rapporté ?', 'Deux mois', 235],
  ['Quand débute la rééducation après arthrodèse SH selon le texte ?', 'Dès la semaine suivant l’intervention', 235],
  ['Quand le fixateur externe est-il en général retiré ?', 'Au deuxième mois', 235],
  ['Quel avantage du fixateur évite une réintervention ?', 'Pas d’ablation secondaire de plaque', 235],
  ['Quel risque osseux est souligné sur l’humérus neurologique ?', 'Fracture sur os ostéoporotique et rigidifié', 239],
  ['Quels sont les deux principaux moteurs scapulothoraciques ?', 'Trapèze et dentelé antérieur', 253],
  ['Quel muscle participe à l’élévation avec le trapèze supérieur ?', 'Élévateur de la scapula', 253],
  ['Quels muscles rapprochent médialement la scapula ?', 'Rhomboïde et chef moyen du trapèze', 253],
  ['Quel muscle assure l’antépulsion scapulaire ?', 'Dentelé antérieur', 254],
  ['Quel signe clinique traduit une paralysie du trapèze ?', 'Disparition du galbe trapézien', 256],
  ['Quel autre signe accompagne la paralysie du trapèze ?', 'Décollement scapulaire en élévation et abduction', 257],
  ['Quel examen recherche une réinnervation du trapèze ?', 'Électromyogramme', 257],
  ['Quelle stratégie est prioritaire au début d’une paralysie du trapèze ?', 'Chirurgie nerveuse', 257],
  ['Quel délai précoce est cité pour une chirurgie nerveuse du trapèze ?', 'Dans les six premiers mois', 257],
  ['Quel délai éloigné fait écarter la chirurgie nerveuse du trapèze ?', 'Après un an', 257],
  ['Quels muscles sont transférés dans Eden-Lange ?', 'Élévateur de la scapula et rhomboïdes', 257],
  ['Quel objectif du triple transfert Eden-Lange ?', 'Restituer les composantes du trapèze', 257],
  ['Pourquoi les stabilisations statiques par tissus inertes ont-elles échoué ?', 'Détente au cours du temps', 257],
  ['Quelle est la place de l’arthrodèse scapulothoracique ?', 'Option de recours', 270],
  ['Dans quelles affections étendues est-elle citée ?', 'Dystrophies musculaires et poliomyélites étendues', 271],
  ['Quel est le but de l’arthrodèse scapulothoracique ?', 'Stabiliser la scapula sur le thorax', 271],
  ['Quel test préopératoire prédit le bénéfice de l’arthrodèse STh ?', 'Stabilisation manuelle de la scapula puis élévation du bras', 271],
  ['Quelle extension neurologique est une contre-indication majeure ?', 'Extension du déficit à la scapulohumérale', 273],
  ['Quelle contre-indication respiratoire est relative ?', 'Restriction sévère de la fonction respiratoire', 273],
  ['Quelle contre-indication comportementale est relative ?', 'Tabagisme actif', 273],
  ['Quelle installation est possible pour arthrodèse STh ?', 'Décubitus latéral ou ventral', 273],
  ['Quelle abduction est rapportée pour arthrodèse STh ?', '90°', 273],
  ['Quelle flexion est rapportée pour arthrodèse STh ?', '30°', 273],
  ['Quelle structure intercostale doit être protégée ?', 'Pédicule intercostal', 273],
  ['Quelle membrane thoracique doit être protégée ?', 'Plèvre pariétale', 273],
  ['Quelle fixation entoure les côtes ?', 'Fils d’acier', 273],
  ['Quelle greffe est placée entre côtes et scapula ?', 'Greffe d’os spongieux', 273],
  ['Quel bénéfice d’élévation antérieure est rapporté après arthrodèse STh ?', 'Gain d’environ 40° dans la série citée', 273],
  ['Quelle mobilité diminue après arthrodèse STh dans la série citée ?', 'Rotation externe', 273],
  ['Quel événement justifie de réserver l’arthrodèse STh ?', 'Taux de complications non négligeable', 273],
  ['Quel résultat oriente vers le recours chirurgical palliatif ?', 'Compensation insuffisante malgré rééducation spécialisée', 129]
].map(([recto, verso, source]) => ({ recto, verso, source: [source] }));

const option = (text, correct, justification) => ({ lettre: '', enonce: text, is_correct: correct, justification });
const makeQuestion = (fact, number, prefix = '') => {
  const choices = [fact, facts[(number * 7 + 11) % facts.length], facts[(number * 13 + 23) % facts.length], facts[(number * 17 + 37) % facts.length], facts[(number * 19 + 47) % facts.length]];
  const unique = [];
  for (const candidate of choices) if (!unique.some((choice) => choice.verso === candidate.verso)) unique.push(candidate);
  while (unique.length < 5) unique.push(facts[(number + unique.length + 53) % facts.length]);
  return {
    enonce: `${prefix}${fact.recto}`,
    items: unique.slice(0, 5).map((choice, index) => ({
      lettre: String.fromCharCode(65 + index), enonce: choice.verso, is_correct: choice === fact,
      justification: choice === fact ? `Réponse conforme au bloc source ${fact.source[0]}.` : `Cette proposition correspond à une autre notion du chapitre et ne répond pas à l’énoncé.`
    })),
    correction_generale: `Question construite à partir du bloc ${fact.source[0]} de l’extrait Orthopédie.`
  };
};

const qcmTopics = ['Anatomie fonctionnelle', 'Cartographie du déficit', 'Pré-requis et délais', 'Transferts pour abduction', 'Transferts pour rotation', 'Arthrodèse scapulohumérale', 'Winging scapula', 'Arthrodèse scapulothoracique'];
const qcm = qcmTopics.map((label, seriesIndex) => ({ label: `QCM ${seriesIndex + 1} · ${label}`, vignette: '', questions: facts.slice(seriesIndex * 5, seriesIndex * 5 + 5).map((fact, qIndex) => makeQuestion(fact, seriesIndex * 5 + qIndex)) }));

const dpCases = [
  ['Déficit scapulohuméral complet', '<p><strong>Un homme de 34 ans</strong> présente une paralysie C5-C6 après traumatisme du plexus brachial. L’examen retrouve un déficit du deltoïde et de la coiffe avec perte d’abduction et de rotation externe. Le bilan de la scapulothoracique et de la mobilité passive est réalisé avant discussion d’une stratégie de réanimation.</p><p>Au <strong>suivi</strong>, l’équipe apprécie la récupération nerveuse, le recours à la rééducation spécialisée et la capacité du patient à positionner sa main dans l’espace.</p>', 10],
  ['Déficit de rotation externe', '<p><strong>Une femme de 28 ans</strong> est suivie pour une paralysie partielle de l’épaule avec déficit durable de rotation externe. La mobilité passive est mesurée ; l’imagerie analyse l’articulation glénohumérale avant de choisir un transfert musculotendineux.</p><p>Au <strong>suivi postopératoire</strong>, la rotation externe utile, l’équilibre des couples musculaires et la tolérance de la rééducation sont réévalués.</p>', 30],
  ['Arthrodèse scapulohumérale', '<p><strong>Un patient de 41 ans</strong> garde une épaule neurologique instable malgré rééducation et transferts insuffisants, avec une scapulothoracique encore fonctionnelle. Une arthrodèse scapulohumérale est envisagée ; la position est testée pour les gestes main-bouche et main-poche.</p><p>Au <strong>suivi</strong>, consolidation, position fonctionnelle, tolérance de l’attelle et reprise de la rééducation sont contrôlées.</p>', 54],
  ['Paralysie du trapèze', '<p><strong>Une patiente de 46 ans</strong> consulte après chirurgie cervicale pour douleur, asymétrie et décollement de la scapula lors de l’élévation. L’examen et l’électromyogramme recherchent une atteinte du nerf accessoire et une éventuelle réinnervation.</p><p>Au <strong>suivi</strong>, l’évolution sous rééducation, l’échec éventuel de compensation et l’indication d’un transfert d’Eden-Lange sont discutés.</p>', 70],
  ['Winging par atteinte du dentelé', '<p><strong>Un homme de 31 ans</strong> présente un winging scapula lié à une atteinte du dentelé antérieur. L’évaluation précise la stabilité de la scapula, les muscles compensateurs et l’impact sur l’efficacité scapulohumérale.</p><p>Au <strong>suivi fonctionnel</strong>, l’équipe mesure l’élévation utile, les douleurs de surcharge et l’intérêt d’une réanimation par transfert.</p>', 14],
  ['Déficit combiné', '<p><strong>Une patiente de 39 ans</strong> suivie pour atteinte neurologique diffuse présente un déficit combiné scapulohuméral et scapulothoracique. Les muscles conservés, l’objectif d’autonomie et les limites des procédures palliatives sont réévalués en réunion spécialisée.</p><p>Au <strong>suivi</strong>, la rééducation cible les compensations accessibles et le bénéfice fonctionnel réel de chaque décision.</p>', 18],
  ['Recours scapulothoracique', '<p><strong>Un homme de 37 ans</strong> ayant un winging sévère persistant malgré les options nerveuses et tendineuses est évalué pour arthrodèse scapulothoracique. Le test de stabilisation manuelle est positif ; la fonction scapulohumérale et respiratoire sont documentées.</p><p>Au <strong>suivi postopératoire</strong>, consolidation, douleur, respiration et bénéfice sur l’élévation antérieure guident la rééducation.</p>', 82],
  ['Décision individualisée', '<p><strong>Une femme de 52 ans</strong> présente une paralysie de l’épaule ancienne. Le dossier confronte mobilité passive, téguments, consolidation osseuse, muscles donneurs et objectifs fonctionnels avant d’envisager un geste palliatif.</p><p>Au <strong>suivi</strong>, l’équipe vérifie que la stratégie améliore un geste utile sans créer de déficit donneur disproportionné.</p>', 20]
];
const dp = dpCases.map(([label, vignette, start], seriesIndex) => ({
  label: `DP ${seriesIndex + 1} · ${label}`,
  vignette,
  questions: Array.from({ length: 7 }, (_, questionIndex) => makeQuestion(
    facts[(start + questionIndex) % facts.length], start + questionIndex,
    questionIndex === 0 ? '' : `Nouvel élément : les données cliniques et de suivi confirment le contexte. `
  ))
}));

const chapter = { title: fiche.title, provenance: { extract: 'extract.json', sourceOnly: true, sourceBlocks: fiche.sourceBlocks }, flashcards: facts, series: [...qcm, ...dp] };
writeFileSync(join(output, 'fiche.model.json'), `${JSON.stringify(fiche, null, 2)}\n`, 'utf8');
writeFileSync(join(output, 'fiche.body.html'), compileFicheModel(fiche, directory), 'utf8');
writeFileSync(join(output, 'chapter.json'), `${JSON.stringify(chapter, null, 2)}\n`, 'utf8');
writeFileSync(join(output, 'coverage.json'), `${JSON.stringify({ sourceBlocks: fiche.sourceBlocks, parts: fiche.parts.length, sections: 10, flashcards: facts.length, qcmQuestions: 40, dpQuestions: 56 }, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ output, flashcards: facts.length, qcm: qcm.length, dp: dp.length }));

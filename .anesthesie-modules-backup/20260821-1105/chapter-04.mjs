const LETTERS = 'ABCDE';

const row = (concept, bullets, sourceBlocks, image = null) => ({
  concept, bullets, sourceBlocks, ...(image ? { image } : {}),
});

const n2 = (text, children) => ({ text, children });

const image = (path, caption, sourceCaption) => ({
  path,
  position: 'after',
  size: 'large',
  layout: 'full_width',
  containsText: true,
  caption,
  sourceCaption,
});

const IMAGES = {
  posteAvant: image('img/img_001.png', 'Composants accessibles sur la face avant du poste anesthésique', 'Vues avant, arrière et latérale de l’appareil d’anesthésie'),
  posteArriere: image('img/img_002.png', 'Raccordements pneumatiques et antipollution à l’arrière du poste', 'Vues avant, arrière et latérale de l’appareil d’anesthésie'),
  architecture: { ...image('img/img_003.png', 'Trajet des gaz selon les trois niveaux de pression', "Système pneumatique de l'appareil d'anesthésie"), cropBottomMm: 8 },
  oxygeneLiquide: image('img/img_006.png', 'Stockage, évaporation et régulation de l’oxygène liquide hospitalier', 'Schématisation du système de conservation de l’oxygène liquide'),
  raccords: { ...image('img/img_007.png', 'Raccords non interchangeables des canalisations de gaz', 'Raccords non interchangeables DISS et NIST des gaz médicaux'), cropBottomMm: 8 },
  pinIndex: image('img/img_008.png', 'Robinet de bouteille et détrompage mécanique par pin index', 'Robinet des bouteilles et système de détrompage par pin index'),
  capacitesBouteilles: image('img/img_010.png', 'Capacités et pressions des bouteilles portatives de type E', 'Capacités et pressions comparées des gaz en bouteilles de type E'),
  bouteilles: image('img/img_011.png', 'Comportement comparé de l’oxygène et du protoxyde d’azote en bouteille', 'Comportement des gaz embouteillés'),
  regulation: image('img/img_012.png', 'Régulation, valve antiretour et mesure de pression', 'Dispositifs du système pressurisé'),
  hypoxie: image('img/img_013.png', 'Barrières de sécurité du mélange oxygène-protoxyde d’azote', 'Gestion de la sécurité du mélange oxygène-protoxyde d’azote'),
  sourcesOxygene: image('img/img_014.png', 'Sources d’oxygène, usages et dispositifs de sécurité associés', 'Sources possibles d’oxygène sur l’appareil d’anesthésie'),
  debitmetres: image('img/img_015.png', 'Ordre des débitmètres et conséquence d’une fuite', 'Arrangement des débitmètres'),
  vaporisateurs: image('img/img_016.png', 'Principes des vaporisateurs à plénum, mélange et injection', 'Vaporisateurs pour agents volatils'),
  interverrouillage: image('img/img_019.png', 'Interverrouillage empêchant l’ouverture simultanée de deux vaporisateurs', 'Système d’enclenchement des vaporisateurs'),
  circuits: image('img/img_020.png', 'Classification fonctionnelle des circuits anesthésiques', 'Classification fonctionnelle des circuits'),
  apl: image('img/img_021.png', 'Échappement réglable des gaz par la valve APL', 'Principe de la valve APL limitant la pression du circuit'),
  maplesonFamilles: image('img/img_022.png', 'Architecture comparée des principaux circuits de Mapleson', 'Circuits de Mapleson et disposition du ballon, du gaz frais et de la valve'),
  mapleson: image('img/img_023.png', 'Élimination du dioxyde de carbone dans un circuit de Mapleson D', 'Élimination des gaz dans le circuit Mapleson D'),
  cercle: {
    ...image('img/img_024.png', 'Circuit cercle, absorbeur de dioxyde de carbone et évacuation des gaz', 'Circuit absorbeur et système antipollution'),
    maskRegions: [{ leftPct: 0, topPct: 62, widthPct: 100, heightPct: 4.8 }],
  },
  ventilateurs: image('img/img_025.png', 'Soufflet pneumatique et piston électrique', 'Ventilateurs pneumatiques'),
  modes: image('img/img_026.png', 'Comparaison des principaux modes ventilatoires disponibles', 'Modes ventilatoires disponibles sur l’appareil d’anesthésie'),
  ainoc: image('img/img_027.png', 'Boucle de rétroaction d’une anesthésie inhalatoire à objectif de concentration', 'Anesthésie inhalatoire à objectif de concentration'),
};

function buildFiche() {
  const parts = [
    {
      title: 'Comprendre le poste de travail anesthésique',
      sections: [
        {
          title: 'Fonctions intégrées et logique de sécurité',
          rows: [
            row('Un système au service du patient', [
              'L’appareil réunit le **circuit anesthésique** et le **ventilateur** afin d’administrer les gaz, suppléer la ventilation et en surveiller les effets.',
              n2('Quatre fonctions restent indissociables', [
                'Administrer oxygène, air et agents anesthésiques inhalés.',
                'Éliminer le dioxyde de carbone et évacuer les gaz excédentaires.',
                'Détecter précocement toute composition ou pression dangereuse.',
              ]),
            ], ['b00003', 'b00008', 'b00009', 'b00010']),
            row('Poste de travail moderne', [
              'L’électronique coordonne réglage des gaz frais, modes ventilatoires avancés, monitorage et alarmes sur une interface commune.',
              'Cette automatisation améliore la précision sans dispenser de comprendre le trajet ni de préparer un secours.',
            ], ['b00003', 'b00008', 'b00186', 'b00197'], IMAGES.posteAvant),
            row('Face arrière et raccordements', [
              'Les arrivées de gaz, l’aspiration centrale et l’antipollution se repèrent séparément avant toute utilisation.',
              'La lecture fonctionnelle des raccordements prime sur la mémorisation d’un modèle commercial particulier.',
            ], ['b00003', 'b00008'], IMAGES.posteArriere),
            row('Lecture en trois étages', [
              n2('Suivre les gaz de la source vers le patient', [
                '**Haute pression** : canalisations et bouteilles.',
                '**Pression intermédiaire** : régulation, débitmètres et vaporisateurs.',
                '**Basse pression** : circuit respiratoire directement relié aux voies aériennes.',
              ]),
              'Les contrôles successifs réduisent le risque, mais l’analyseur d’oxygène placé près du patient reste la barrière finale contre un mélange hypoxique.',
            ], ['b00013', 'b00016', 'b00070', 'b00075', 'b00189', 'b00190'], IMAGES.architecture),
          ],
        },
        {
          title: 'Du réseau central aux bouteilles de secours',
          renderChunks: [2, 1, 1],
          rows: [
            row('Canalisation centrale', [
              n2('La source centrale constitue l’alimentation habituelle', [
                'La pression est abaissée puis stabilisée avant l’entrée dans l’appareil.',
                'Après régulation, les gaz circulent à **350 kPa (50 psi)** jusqu’aux points de consommation.',
              ]),
            ], ['b00018', 'b00025', 'b00026']),
            row('Oxygène liquide hospitalier', [
              'Son stockage à basse température offre un rendement élevé : **1 L liquide produit environ 850 L gazeux**.',
              n2('Le dispositif assure la continuité', [
                'Réservoir isolé à double coque et évaporateur.',
                'Bouteilles de secours et souvent second réservoir.',
                'Évaporateur secondaire lors des consommations élevées.',
              ]),
            ], ['b00018', 'b00025', 'b00026'], IMAGES.oxygeneLiquide),
            row('Prévenir les substitutions', [
              n2('La couleur seule ne sécurise pas l’identité du gaz', [
                'Les codes varient selon les pays et peuvent être mal interprétés.',
                'Les raccords **DISS/NIST** et le **pin index** imposent une compatibilité mécanique propre au gaz.',
              ]),
            ], ['b00026', 'b00027', 'b00032', 'b00034'], IMAGES.raccords),
            row('Bouteille de type E', [
              'La bouteille portative de type E est la plus utilisée sur l’appareil comme appoint de l’alimentation centrale.',
              'Joug, rondelle, dépression conique et soupape de surpression sécurisent son raccordement.',
            ], ['b00029', 'b00032', 'b00033', 'b00034', 'b00037'], IMAGES.pinIndex),
          ],
        },
      ],
    },
    {
      title: 'Pressions, mélange gazeux et vaporisation',
      sections: [
        {
          title: 'Interpréter correctement le contenu des bouteilles',
          rows: [
            row('Oxygène gazeux', [
              'À température ambiante, l’oxygène reste gazeux : la pression interne diminue linéairement avec le contenu.',
              'La loi de Boyle permet donc d’estimer le volume encore disponible à température constante.',
            ], ['b00034', 'b00042', 'b00191']),
            row('Protoxyde d’azote liquéfié', [
              'Sa température critique de **36,5 °C** explique la coexistence d’une phase liquide et gazeuse dans une bouteille pleine.',
              n2('Conséquence pratique de la phase liquide', [
                'La pression reste presque constante tant que persiste la phase liquide.',
                'Le manomètre ne renseigne sur le contenu qu’après disparition du liquide, vers **16 %** du contenu total.',
                'La pesée de la bouteille reste informative avant ce seuil.',
              ]),
            ], ['b00034', 'b00043', 'b00044', 'b00048', 'b00191'], IMAGES.bouteilles),
            row('Autonomie résiduelle', [
              'À la disparition de la phase liquide, une bouteille E contient environ **235 L** de protoxyde d’azote gazeux.',
              'À 1 L/min, cette réserve représente approximativement **4 heures** ; le calcul n’autorise pas à négliger une source de secours.',
            ], ['b00034', 'b00044', 'b00045', 'b00047', 'b00048'], IMAGES.capacitesBouteilles),
          ],
        },
        {
          title: 'Réguler et mesurer avant de mélanger',
          renderChunks: [1, 1, 1, 1],
          rows: [
            row('Détendeur', [
              n2('Le détendeur transforme une pression amont variable en pression aval stable', [
                'Un diaphragme opposé à un ressort calibré module l’ouverture.',
                'Le réglage de la bouteille sous celui de la canalisation évite sa vidange silencieuse si elle reste ouverte.',
              ]),
            ], ['b00050', 'b00055']),
            row('Sens du flux', [
              'Les valves antiretour imposent un trajet unidirectionnel et limitent fuite, reflux et déversement entre sources.',
              'Le tube de Bourdon transforme la déformation liée à la pression en indication manométrique.',
            ], ['b00053', 'b00054', 'b00057', 'b00059'], IMAGES.regulation),
            row('Coupure du protoxyde d’azote', [
              'Une chute de pression d’oxygène ferme automatiquement l’arrivée de protoxyde d’azote et déclenche rapidement une alarme.',
              'L’asservissement mécanique ou pneumatique du mélange limite les compositions hypoxiques sans remplacer la mesure inspirée d’oxygène.',
            ], ['b00061', 'b00064', 'b00065', 'b00066', 'b00075'], IMAGES.hypoxie),
            row('Sources auxiliaires d’oxygène', [
              'Le poste distribue l’oxygène par plusieurs voies adaptées à la ventilation, au débit auxiliaire et au rinçage du circuit.',
              'Leur pression, leur commande et leur rôle de sécurité diffèrent : elles ne sont pas interchangeables.',
            ], ['b00067', 'b00068'], IMAGES.sourcesOxygene),
          ],
        },
        {
          title: 'Débitmètres : fabriquer le mélange final',
          rows: [
            row('Tube de Thorpe', [
              'Le flotteur s’élève dans un tube évasé jusqu’à l’équilibre entre poids, poussée du gaz et forces d’écoulement.',
              'Sa graduation dépend de la viscosité et de la densité du gaz : un débitmètre n’est **jamais interchangeable** entre gaz.',
            ], ['b00072', 'b00075', 'b00192']),
            row('Ordre protecteur', [
              'Le débitmètre d’oxygène se place en dernier, au plus près de la sortie commune vers le patient.',
              n2('Raison de cet ordre protecteur', [
                'Une fuite en amont tend alors à perdre un autre gaz plutôt que l’oxygène déjà ajouté.',
                'Une fuite d’oxygène reste néanmoins capable de créer un mélange hypoxique.',
              ]),
              'L’analyseur d’oxygène en aval demeure indispensable.',
            ], ['b00075', 'b00078', 'b00079', 'b00193'], IMAGES.debitmetres),
            row('Débitmètres électroniques', [
              n2('Le réglage électronique prépare et affiche le mélange final', [
                'Des électrovalves règlent les débits, parfois complétées par un tube témoin.',
                'Une fraction inspirée minimale de **0,25** peut être imposée, mais elle reste à contrôler au circuit patient.',
              ]),
            ], ['b00072', 'b00075']),
          ],
        },
        {
          title: 'Vaporisateurs : transformer un liquide en dose contrôlée',
          rows: [
            row('Spécificité de l’agent', [
              n2('Chaque halogéné impose une technologie de délivrance calibrée', [
                'Pression de vapeur et température d’ébullition déterminent le fonctionnement du vaporisateur.',
                'À 20 °C, la pression de vapeur du sévoflurane est **21 kPa**, contre **2,3 kPa** pour l’eau.',
                'Le vaporisateur et sa clé de remplissage restent propres à l’agent.',
              ]),
            ], ['b00084', 'b00192']),
            row('Plénum à bypass variable', [
              'Une fraction des gaz frais lèche le liquide, se sature, puis rejoint le flux de bypass.',
              n2('Compensation thermique mécanique', [
                'Le refroidissement lié à l’évaporation tend à réduire la vaporisation.',
                'Des lamelles ou un soufflet anéroïde modifient le partage des débits pour stabiliser la sortie.',
              ]),
            ], ['b00082', 'b00085', 'b00086', 'b00194']),
            row('Desflurane chauffé', [
              'Son point d’ébullition bas (**22,8 °C**) et sa pression de vapeur élevée (**89 kPa**) rendent le plénum conventionnel imprécis.',
              'Une cuve pressurisée et thermostatée mesure puis mélange ou injecte l’agent dans le flux gazeux.',
            ], ['b00087', 'b00090', 'b00091', 'b00092', 'b00194'], IMAGES.vaporisateurs),
            row('Altitude', [
              n2('La réponse à l’altitude dépend du type de vaporisateur', [
                'Le plénum augmente son pourcentage mais conserve la pression partielle : aucun ajustement n’est requis.',
                'La cuve pressurisée impose d’augmenter le pourcentage pour maintenir une pression partielle efficace.',
              ]),
            ], ['b00086', 'b00094']),
            row('Rétropression et interverrouillage', [
              'La pression inspiratoire transmise en amont peut majorer transitoirement la concentration : les dispositifs modernes limitent cet effet de pompage.',
              'Un mécanisme d’enclenchement empêche l’ouverture simultanée de deux vaporisateurs.',
            ], ['b00095', 'b00096', 'b00099', 'b00100', 'b00102', 'b00105', 'b00106'], IMAGES.interverrouillage),
          ],
        },
      ],
    },
    {
      title: 'Choisir et surveiller le circuit respiratoire',
      sections: [
        {
          title: 'Fonctions et classification',
          renderChunks: [2, 1],
          rows: [
            row('Prolongement des voies aériennes', [
              'Le circuit apporte le mélange final, élimine le dioxyde de carbone et dirige les gaz excédentaires vers l’antipollution.',
              'La conservation de la chaleur et de l’humidité devient un objectif dès qu’une réinspiration contrôlée est possible.',
            ], ['b00109']),
            row('Critères fonctionnels', [
              n2('Quatre éléments définissent le circuit', [
                'Réservoir fermé ou non.',
                'Réinspiration des gaz expirés.',
                'Présence d’un absorbeur de dioxyde de carbone.',
                'Présence de valves unidirectionnelles.',
              ]),
              'En pratique, le raisonnement oppose surtout les circuits de Mapleson au circuit cercle.',
            ], ['b00109', 'b00113', 'b00114', 'b00115'], IMAGES.circuits),
            row('Valve APL', [
              n2('La limitation de pression dépend du mode de ventilation', [
                'En manuel, l’utilisateur règle la valve APL pour protéger les voies aériennes.',
                'Avec le ventilateur, une valve automatique distincte assure l’échappement.',
              ]),
            ], ['b00116', 'b00117', 'b00118', 'b00119', 'b00124'], IMAGES.apl),
          ],
        },
        {
          title: 'Mapleson D et circuit de Bain',
          rows: [
            row('Circuit sans absorbeur', [
              'Le dioxyde de carbone est chassé par les gaz frais pendant l’expiration : l’efficacité dépend directement de leur débit.',
              'Le Bain est un Mapleson D coaxial dont le tube de gaz frais chemine à l’intérieur du tube expiratoire.',
            ], ['b00120', 'b00121', 'b00129', 'b00130', 'b00133'], IMAGES.maplesonFamilles),
            row('Débit protecteur', [
              'Un débit de gaz frais d’au moins **2,5 fois la ventilation minute** évite la réinspiration.',
              'Un débit insuffisant, une obstruction du tube interne ou une rupture proximale exposent à l’hypercapnie.',
            ], ['b00129', 'b00130', 'b00131', 'b00133'], IMAGES.mapleson),
            row('Forces et limites', [
              'Faible résistance, légèreté et encombrement réduit expliquent son intérêt en pédiatrie.',
              n2('Conséquences du haut débit nécessaire', [
                'Pollution et consommation d’agents augmentées.',
                'Pertes de chaleur et d’humidité.',
                'Risque de barotraumatisme si la valve d’échappement est bloquée.',
              ]),
            ], ['b00132', 'b00133']),
          ],
        },
        {
          title: 'Circuit cercle et absorption du dioxyde de carbone',
          rows: [
            row('Trajet circulaire', [
              'Deux valves unidirectionnelles imposent le passage des gaz expirés vers l’absorbeur puis leur retour débarrassé du dioxyde de carbone.',
              'La réinspiration peut devenir totale à très bas débit, avec économie d’agents et meilleure conservation thermique et hydrique.',
            ], ['b00134', 'b00135', 'b00139']),
            row('Chaux sodée active', [
              'L’eau permet la formation d’acide carbonique ; le calcium neutralise le dioxyde de carbone et les bases fortes accélèrent la réaction.',
              n2('Indices d’activité et produits finaux', [
                'Le carbonate de calcium final est insoluble.',
                'La réaction libère de la chaleur et régénère les bases fortes.',
                'Un indicateur coloré signale l’acidification et l’épuisement progressif.',
              ]),
            ], ['b00135', 'b00136', 'b00137', 'b00138', 'b00139']),
            row('Panne du cercle', [
              'Un absorbeur épuisé laisse réapparaître du dioxyde de carbone inspiré.',
              'Une valve unidirectionnelle absente ou défaillante court-circuite l’absorbeur et provoque une réinspiration avec hypercapnie.',
            ], ['b00142', 'b00143'], IMAGES.cercle),
            row('Toxicité de l’absorbeur', [
              'Une chaux presque totalement desséchée et contenant des bases fortes favorise la production de monoxyde de carbone avec certains halogénés.',
              'Le sévoflurane peut former le composé A ; les absorbeurs pauvres ou dépourvus de bases fortes permettent des débits très bas plus sûrs.',
            ], ['b00144', 'b00145']),
          ],
        },
      ],
    },
    {
      title: 'Ventiler avec l’appareil d’anesthésie',
      sections: [
        {
          title: 'Énergie et architecture du ventilateur',
          rows: [
            row('Force motrice', [
              'Un ventilateur pneumatique utilise une pression d’oxygène ou d’air ; un piston utilise une motorisation électrique.',
              'Alimenter un ventilateur pneumatique par la bouteille d’oxygène la vide rapidement en raison du volume de gaz moteur.',
            ], ['b00148', 'b00149']),
            row('Soufflet à double circuit', [
              'Le gaz moteur comprime un soufflet séparé du circuit patient ; les valves d’échappement et de trop-plein organisent les phases respiratoires.',
              'Les gaz excédentaires rejoignent l’antipollution à la fin de l’expiration.',
            ], ['b00150', 'b00151', 'b00154', 'b00155'], IMAGES.ventilateurs),
            row('Soufflet ascendant', [
              'Lors d’une déconnexion, il s’effondre et déclenche rapidement une alarme.',
              'Un soufflet descendant peut continuer à bouger sous son poids et masquer la diminution du volume réellement délivré.',
            ], ['b00156', 'b00157', 'b00158']),
            row('Piston électrique', [
              'Le piston mobilise directement le gaz du circuit sans consommation de gaz moteur.',
              'Contrairement au soufflet pneumatique, le débit de gaz frais n’augmente pas le volume inspiratoire délivré.',
            ], ['b00156', 'b00157', 'b00158']),
            row('Compensation de compliance', [
              'Une tubulure distensible absorbe une partie du volume courant avant qu’il n’atteigne le patient.',
              'Le logiciel estime cette perte et adapte la délivrance, ce qui fiabilise la ventilation en pédiatrie ou lors d’un bronchospasme.',
            ], ['b00158']),
          ],
        },
        {
          title: 'Régler le mode ventilatoire selon la mécanique',
          rows: [
            row('Paramètres communs', [
              n2('Le réglage articule cinq dimensions', [
                'Contrôle, assistance ou ventilation spontanée.',
                'Seuil de déclenchement en débit ou en pression.',
                'Débit inspiratoire et rapport inspiration-expiration.',
                'Cible de volume ou de pression.',
                'Pression expiratoire positive pour limiter l’atélectasie.',
              ]),
            ], ['b00159', 'b00160', 'b00161', 'b00162', 'b00163', 'b00164', 'b00165', 'b00166', 'b00167', 'b00168', 'b00169', 'b00170']),
            row('Ventilation en volume contrôlé', [
              'Le volume courant est garanti, mais la pression varie avec résistance et compliance.',
              'Chez un patient à faible compliance, l’absence de limite adaptative expose à des pressions élevées et au barotraumatisme.',
            ], ['b00171']),
            row('Ventilation à pression contrôlée', [
              'La pression inspiratoire est limitée, mais le volume courant devient dépendant de la mécanique respiratoire.',
              'Une dégradation de compliance peut donc provoquer un petit volume courant et une hypoventilation.',
            ], ['b00171']),
            row('Pression contrôlée à volume garanti', [
              'Le ventilateur recherche la pression minimale permettant d’obtenir le volume courant cible.',
              'Ce mode concilie limitation des pressions et prévention de l’hypoventilation, sous réserve d’une surveillance continue.',
            ], ['b00171'], IMAGES.modes),
            row('Retour à l’autonomie', [
              'À l’émergence, le patient peut déclencher un cycle selon un seuil de débit ou de pression.',
              'L’aide inspiratoire compense la résistance de la tubulure puis cesse lorsque le débit inspiratoire décroît au quart de sa valeur maximale.',
            ], ['b00171', 'b00175']),
          ],
        },
      ],
    },
    {
      title: 'Piloter les gaz inhalés et maîtriser la pollution',
      sections: [
        {
          title: 'Anesthésie inhalatoire à objectif de concentration',
          rows: [
            row('Cible expirée', [
              'La fraction expirée de l’agent reflète assez fidèlement sa concentration cérébrale après le temps d’équilibration.',
              'Elle sert donc de variable contrôlée plutôt que de simple valeur observée.',
            ], ['b00176', 'b00177']),
            row('Boucle de rétroaction', [
              n2('L’appareil confronte en continu cible et mesure', [
                'Il intègre fraction expirée et débit de gaz frais.',
                'Il ajuste électroniquement le vaporisateur.',
                'Il limite les oscillations autour de la cible choisie.',
              ]),
              'L’automatisation facilite les très bas débits sans supprimer la surveillance de la composition du circuit.',
            ], ['b00177'], IMAGES.ainoc),
            row('Impact environnemental', [
              'La réduction du débit de gaz frais diminue consommation et rejets atmosphériques.',
              'Le potentiel d’effet de serre rapporté est nettement plus élevé pour le desflurane que pour le sévoflurane.',
            ], ['b00177', 'b00186']),
          ],
        },
        {
          title: 'Évacuation des gaz et aspiration',
          rows: [
            row('Système antipollution', [
              'Il reçoit les gaz excédentaires lorsque le débit frais dépasse la consommation du patient.',
              'Les dispositifs peuvent être ouverts ou fermés, actifs ou passifs ; les systèmes passifs sont moins efficaces à l’hôpital.',
            ], ['b00180', 'b00181', 'b00182']),
            row('Interface protectrice', [
              'Dans un système fermé actif, un réservoir tampon est vidé par l’aspiration centrale.',
              n2('Deux soupapes protègent le circuit', [
                'L’une empêche une aspiration excessive de vider le circuit patient.',
                'L’autre évite une surpression si l’évacuation devient insuffisante.',
              ]),
            ], ['b00182']),
            row('Deux réseaux distincts', [
              n2('Les liquides biologiques et les gaz anesthésiques suivent des réseaux distincts', [
                'Sécrétions et sang rejoignent un réservoir propre à l’appareil raccordé à la succion centrale.',
                'Les volatils suivent une évacuation séparée, stable malgré la succion chirurgicale et adaptée à leur agressivité matérielle.',
              ]),
            ], ['b00183', 'b00184']),
            row('Vigilance opérationnelle', [
              'Avant toute anesthésie, identifier la source d’oxygène, tester le circuit, vérifier l’absorbeur, les valves, l’analyseur d’oxygène et l’évacuation des gaz.',
              'Devant une anomalie, raisonner de la source vers le patient et maintenir une possibilité immédiate de ventilation indépendante.',
            ], ['b00003', 'b00013', 'b00061', 'b00075', 'b00109', 'b00143', 'b00149', 'b00182', 'b00186']),
          ],
        },
      ],
    },
  ];

  const sourceBlocks = [...new Set(parts.flatMap((part) => part.sections.flatMap((section) => section.rows.flatMap((entry) => entry.sourceBlocks))))];
  return {
    matiere: 'Anesthésie-Réanimation',
    title: 'L’appareil d’anesthésie, les circuits anesthésiques et l’équipement',
    year: '2026-2027',
    coverSubtitle: 'Du réseau de gaz au patient : fonctionnement, sécurité et conduite devant une anomalie',
    imageException: { reason: 'Vingt-deux visuels non redondants sont nécessaires pour couvrir séparément le poste, les gaz, les sécurités, les vaporisateurs et les circuits.' },
    imageOmissions: [
      {
        path: 'img/img_004.png',
        reason: 'decorative',
        justification: 'Photographie d’installations et de manomètres propre à un site, sans mécanisme supplémentaire utile au raisonnement.',
      },
      {
        path: 'img/img_005.png',
        reason: 'decorative',
        justification: 'Vue extérieure de réservoirs industriels remplacée par le schéma fonctionnel complet de stockage et de régulation.',
      },
      {
        path: 'img/img_009.png',
        reason: 'duplicate',
        justification: 'Photographie du joug et du raccord redondante avec le schéma plus lisible du robinet et du système pin index.',
      },
      {
        path: 'img/img_017.png',
        reason: 'duplicate',
        justification: 'Courbe qualitative sans graduation dont la relation température-vapeur est déjà expliquée et appliquée dans la section.',
      },
      {
        path: 'img/img_018.png',
        reason: 'duplicate',
        justification: 'Schéma élémentaire du bypass déjà inclus avec davantage de détails dans le visuel comparatif des vaporisateurs conservé.',
      },
    ],
    sourceBlocks,
    parts,
    synthesis: {
      compactLayout: true,
      chiffres: {
        headers: ['Repère', 'Valeur opérationnelle'],
        rows: [
          ['Pression des canalisations', '350 kPa (50 psi) après régulation'],
          ['Oxygène liquide', '1 L liquide ≈ 850 L gazeux'],
          ['Bouteille de N₂O', 'Pression informative seulement après disparition du liquide, vers 16 %'],
          ['Sévoflurane à 20 °C', 'Pression de vapeur saturante 21 kPa'],
          ['Desflurane', 'Ébullition 22,8 °C ; pression de vapeur 89 kPa'],
          ['Mapleson D/Bain', 'Gaz frais ≥ 2,5 × ventilation minute'],
          ['Fraction minimale d’oxygène', '0,25 sur le dispositif de sécurité présenté'],
        ],
      },
      tables: [
        {
          title: 'Localiser une anomalie sur le trajet des gaz',
          headers: ['Zone', 'Fonction', 'Défaillance à évoquer'],
          rows: [
            ['Haute pression', 'Stocker et acheminer', 'Canalisation absente, bouteille vide, raccord ou détendeur'],
            ['Pression intermédiaire', 'Régler débit et concentration', 'Fuite de débitmètre, asservissement, vaporisateur'],
            ['Basse pression', 'Ventiler et éliminer le CO₂', 'Déconnexion, valve, absorbeur, débit frais insuffisant'],
            ['Évacuation', 'Limiter l’exposition professionnelle', 'Aspiration excessive, obstruction ou fuite'],
          ],
        },
        {
          title: 'Comparer les choix ventilatoires',
          headers: ['Mode', 'Variable garantie', 'Risque si mécanique change'],
          rows: [
            ['Volume contrôlé', 'Volume courant', 'Élévation des pressions'],
            ['Pression contrôlée', 'Pression inspiratoire', 'Diminution du volume courant'],
            ['Pression contrôlée à volume garanti', 'Volume cible avec pression adaptée', 'Nécessite toujours alarmes et surveillance'],
            ['Aide inspiratoire', 'Assistance d’un effort spontané', 'Dépend du déclenchement du patient'],
          ],
        },
      ],
      keyPoints: [
        'Raisonner de la source vers le patient selon les trois étages de pression.',
        'La pression estime le contenu d’une bouteille d’oxygène, mais pas celui du protoxyde d’azote encore liquide.',
        'Le débitmètre d’oxygène est en dernier ; l’analyseur d’oxygène en aval reste indispensable.',
        'Un vaporisateur est spécifique d’un agent et un interverrouillage empêche deux ouvertures simultanées.',
        'Le Mapleson élimine le CO₂ par haut débit ; le cercle le retire par absorption et autorise la réinspiration.',
        'Une chaux desséchée ou des valves défaillantes exposent à une toxicité ou à une hypercapnie.',
        'Volume contrôlé et pression contrôlée répondent différemment à une baisse de compliance.',
        'L’antipollution doit évacuer les gaz sans aspirer ni pressuriser le circuit patient.',
      ],
      eclair: [
        'Identifier **source, étage intermédiaire, circuit patient et évacuation**.',
        'Vérifier source d’oxygène, raccords, pression et solution de secours.',
        'Lire une bouteille d’O₂ au manomètre ; peser le N₂O tant qu’il existe une phase liquide.',
        'Contrôler le mélange au plus près du patient avec l’analyseur d’oxygène.',
        'Relier l’agent volatil au vaporisateur qui lui est dédié.',
        'Devant du CO₂ inspiré : rechercher débit frais insuffisant, absorbeur épuisé ou valve unidirectionnelle défaillante.',
        'Devant une baisse de volume : distinguer déconnexion, fuite, compliance dégradée et limite de pression.',
        'Maintenir l’antipollution fonctionnelle sans transmettre aspiration ou surpression au patient.',
      ],
    },
  };
}

const manualQcm = (enonce, sourceBlocks, correction_generale, pattern, options) => ({
  enonce,
  format: 'qcm',
  sourceBlocks,
  correction_generale,
  items: options.map(([text, justification], index) => ({
    lettre: LETTERS[index],
    enonce: text,
    is_correct: pattern.includes(LETTERS[index]),
    justification,
  })),
});

const MANUAL_ISOLATED_QCM = [
  manualQcm('Au contrôle avant anesthésie, quels constats localisent correctement les trois étages pneumatiques ?', ['b00013','b00016','b00070','b00109'], 'La localisation suit le flux : stockage à haute pression, préparation du mélange en intermédiaire, échanges respiratoires en basse pression.', 'A', [
    ['La canalisation et les bouteilles appartiennent à l’étage de haute pression.', 'Ces sources précèdent le détendeur et ne communiquent pas directement avec les voies aériennes.'],
    ['Les débitmètres recueillent les gaz expirés avant leur évacuation.', 'Ils préparent uniquement le mélange inspiré ; l’expiration reste dans le circuit patient.'],
    ['Le vaporisateur se situe après le circuit respiratoire à basse pression.', 'Il enrichit les gaz dans la partie intermédiaire, donc avant leur arrivée au circuit.'],
    ['Le patient respire dans la branche qui alimente les manomètres de bouteille.', 'Les manomètres surveillent les sources ; ils ne constituent aucune branche respiratoire.'],
    ['La valve APL régule la pression du réseau central de l’hôpital.', 'Cette valve limite la pression du circuit lors de la ventilation manuelle uniquement.'],
  ]),
  manualQcm('Une défaillance électronique globale survient : quelles affirmations guident une ventilation de secours sûre ?', ['b00003','b00008','b00009','b00010','b00186'], 'Une interface intégrée peut perdre plusieurs fonctions ensemble ; l’oxygénation doit alors être assurée par un moyen indépendant pendant le diagnostic.', 'B', [
    ['L’affichage éteint prouve que la canalisation d’oxygène est vide.', 'Une panne électrique peut supprimer l’écran sans interrompre nécessairement la pression du réseau.'],
    ['Un ballon autoremplisseur relié à une source indépendante dissocie le patient de l’appareil.', 'Ce moyen contourne simultanément ventilateur, circuit et commandes électroniques défaillants.'],
    ['Le ventilateur pneumatique reste toujours utilisable sans aucune énergie électrique.', 'Ses commandes et ses alarmes peuvent dépendre de l’électronique même si la force motrice est gazeuse.'],
    ['L’antipollution peut remplacer le ventilateur durant le dépannage.', 'Ce réseau évacue des gaz excédentaires et ne génère aucun volume courant.'],
    ['L’asservissement du protoxyde garantit à lui seul une oxygénation efficace.', 'Il limite un mélange hypoxique mais ne ventile pas un patient déconnecté ou apnéique.'],
  ]),
  manualQcm('Quels éléments distinguent la partie intermédiaire du circuit respiratoire directement relié au patient ?', ['b00069','b00070','b00071','b00083','b00109'], 'La zone intermédiaire dose les gaz et l’halogéné ; le circuit respiratoire les transporte, reçoit l’expiration et gère le dioxyde de carbone.', 'C', [
    ['La partie intermédiaire contient l’absorbeur de dioxyde de carbone.', 'L’absorbeur appartient au circuit cercle à basse pression, après la préparation du mélange.'],
    ['La branche respiratoire contient les débitmètres calibrés pour chaque gaz.', 'Les tubes de Thorpe sont situés en amont, dans le système à pression intermédiaire.'],
    ['Les vaporisateurs participent à la fabrication du mélange avant son entrée dans le circuit.', 'Ils ajoutent une concentration contrôlée d’halogéné aux gaz issus des débitmètres.'],
    ['Les gaz expirés retournent vers le vaporisateur lors de chaque cycle.', 'L’agencement parallèle empêche l’expiration de remonter vers le système intermédiaire.'],
    ['La canalisation centrale constitue la branche inspiratoire du patient.', 'Une régulation puis un circuit basse pression séparent obligatoirement le réseau des voies aériennes.'],
  ]),
  manualQcm('Quelles innovations des appareils récents ont une conséquence directe sur la conduite ventilatoire ?', ['b00147','b00158','b00160','b00171','b00175'], 'Les modes avancés adaptent pression, volume et assistance ; la compensation du circuit améliore la fidélité du volume réellement délivré.', 'D', [
    ['Le soufflet descendant détecte mieux une fuite grâce à son poids.', 'Son poids peut au contraire entretenir un mouvement trompeur malgré une déconnexion.'],
    ['La pression contrôlée rend le volume indépendant de la compliance.', 'Sous une pression fixe, toute baisse de compliance réduit le volume courant obtenu.'],
    ['Le volume contrôlé maintient automatiquement une pression inspiratoire constante.', 'La variable garantie est le volume ; la pression reste dépendante de la mécanique.'],
    ['La compensation de compliance ajoute le volume absorbé par la dilatation de la tubulure.', 'Le logiciel corrige ainsi l’écart entre volume produit par l’appareil et volume reçu.'],
    ['L’aide inspiratoire interdit au patient de déclencher ses propres cycles.', 'Elle accompagne précisément un effort spontané détecté en débit ou en pression.'],
  ]),
  manualQcm('Lors de la vérification des alimentations, quelle hiérarchie entre réseau central et bouteilles est correcte ?', ['b00018','b00025','b00026','b00029','b00055'], 'Le réseau central alimente habituellement l’appareil à 350 kPa ; la bouteille réglée légèrement plus bas demeure un secours sans se vider.', 'E', [
    ['La bouteille E doit débiter en permanence avec une canalisation fonctionnelle.', 'Elle serait inutilement consommée alors qu’elle doit préserver une réserve pour la panne centrale.'],
    ['Le réservoir d’oxygène liquide dispense d’une source alternative.', 'Une panne de stockage ou d’évaporation impose au contraire des bouteilles disponibles.'],
    ['La pression des bouteilles est réglée au-dessus de celle du réseau.', 'Un tel réglage ferait débiter la réserve embarquée même en fonctionnement normal.'],
    ['Les raccords colorés suffisent à empêcher toutes les substitutions.', 'Les couleurs peuvent varier ; la sécurité fiable vient des raccords mécaniques spécifiques.'],
    ['La canalisation est prioritaire et les bouteilles assurent l’appoint ou le secours.', 'La différence de pression de service maintient cette priorité tant que le réseau fonctionne.'],
  ]),
  manualQcm('Quels dispositifs empêchent concrètement de raccorder le mauvais gaz ?', ['b00026','b00027','b00032','b00034'], 'La prévention repose sur des incompatibilités géométriques : DISS/NIST pour les canalisations et pin index pour les bouteilles.', 'AB', [
    ['Les raccords DISS ou NIST sont non interchangeables entre canalisations de gaz différents.', 'Le filetage et le diamètre spécifiques constituent une barrière physique à la substitution.'],
    ['Le pin index impose au joug une disposition d’ergots propre au contenu de la bouteille.', 'Une bouteille incompatible ne peut pas s’asseoir correctement sur le raccord prévu.'],
    ['Le tube de Bourdon reconnaît chimiquement le gaz branché.', 'Il mesure une pression par déformation mécanique sans identifier la nature du fluide.'],
    ['La soupape de surpression vérifie la couleur normalisée de la bouteille.', 'Elle évacue une pression excessive et n’effectue aucun contrôle d’identité.'],
    ['Le détendeur bloque automatiquement toute molécule autre que l’oxygène.', 'Il abaisse une pression indépendamment de la composition du gaz admis.'],
  ]),
  manualQcm('Un hôpital utilise un stockage d’oxygène liquide : quels repères techniques sont exacts ?', ['b00018','b00025','b00026'], 'Le stockage cryogénique combine fort rendement volumique, réservoir isolé, évaporation puis double abaissement de pression avant distribution.', 'AC', [
    ['Un litre d’oxygène liquide produit approximativement 850 litres gazeux.', 'Cette expansion explique l’intérêt du stockage liquide pour une consommation hospitalière élevée.'],
    ['L’oxygène reste liquide au-dessus de sa température critique de -113 °C.', 'Au-dessus de cette limite, aucune pression ne permet de maintenir une phase liquide.'],
    ['La pression est ramenée à environ 350 kPa avant son parcours dans la canalisation.', 'Ce niveau correspond à la pression de service distribuée aux points de consommation.'],
    ['Le réservoir doit être installé dans la salle pour éviter toute perte thermique.', 'Il est habituellement extérieur, notamment pour permettre la livraison par camion-citerne.'],
    ['La disparition d’un évaporateur secondaire augmente forcément la FiO₂ du patient.', 'Elle peut limiter le débit disponible mais ne détermine pas directement la composition finale.'],
  ]),
  manualQcm('Avant l’ouverture d’une bouteille E de secours, quelles vérifications concernent son montage sûr ?', ['b00029','b00030','b00032','b00033','b00035','b00037'], 'Le montage sûr associe gaz identifié, pin index compatible, rondelle étanche, position stable dans le joug et soupape fonctionnelle.', 'AD', [
    ['La rondelle et le joug doivent assurer l’étanchéité du raccord.', 'Une fuite à ce niveau compromettrait immédiatement l’autonomie de la source de secours.'],
    ['Le robinet doit être ouvert avant de placer la bouteille dans le joug.', 'L’ouverture hors raccord libérerait brutalement un gaz à haute pression et serait dangereuse.'],
    ['Une bouteille d’un autre gaz peut être adaptée en retirant les ergots.', 'Neutraliser le pin index supprimerait une barrière essentielle contre la substitution.'],
    ['La dépression conique participe au maintien stable de la bouteille.', 'Sa géométrie centre le raccord et sécurise la position dans le joug.'],
    ['La soupape de surpression remplace le détendeur de l’appareil.', 'Elle protège la bouteille mais ne fournit pas une pression de service stable au circuit.'],
  ]),
  manualQcm('Comment interpréter le manomètre d’une bouteille d’oxygène comprimé ?', ['b00034','b00042','b00191'], 'L’oxygène est gazeux à température ambiante : à température stable, sa pression décroît avec le volume et permet d’estimer l’autonomie.', 'AE', [
    ['La pression interne diminue linéairement quand le contenu gazeux est consommé.', 'L’absence de phase liquide rend la relation pression-volume directement exploitable.'],
    ['La pression reste constante jusqu’à disparition d’une phase liquide d’oxygène.', 'L’oxygène ne se liquéfie pas dans une bouteille E aux températures usuelles.'],
    ['La pesée est la seule méthode possible pour connaître l’oxygène disponible.', 'Le manomètre fournit déjà une estimation fiable lorsque la température reste comparable.'],
    ['Une pression normale prouve que le raccord au patient est étanche.', 'Elle renseigne la source mais ne détecte pas une fuite située en aval du détendeur.'],
    ['La loi de Boyle relie pression et volume pour ce gaz comprimé.', 'À température constante, le produit de ces deux grandeurs reste constant.'],
  ]),
  manualQcm('Une bouteille de protoxyde contient encore du liquide : quelles méthodes ou conclusions sont valides ?', ['b00034','b00043','b00044','b00048'], 'La pression traduit la vapeur saturante tant que persiste le liquide ; la masse suit la consommation et devient l’indicateur utile.', 'BC', [
    ['Le manomètre quantifie précisément le pourcentage restant pendant toute la phase liquide.', 'Le plateau de pression peut persister alors qu’une grande partie du contenu a déjà été utilisée.'],
    ['La pesée de la bouteille permet d’apprécier la quantité encore disponible.', 'La masse décroît avec la consommation malgré une pression de vapeur inchangée.'],
    ['La pression ne devient proportionnelle au contenu qu’après disparition du liquide.', 'À ce moment, le protoxyde résiduel est entièrement gazeux et suit la loi de Boyle.'],
    ['Une baisse initiale de pression signifie que la bouteille est exactement à moitié pleine.', 'La chute débute beaucoup plus tard, autour de seize pour cent du contenu initial.'],
    ['La température critique du protoxyde interdit sa liquéfaction dans une pièce.', 'Sa valeur de 36,5 °C permet précisément une phase liquide aux températures courantes.'],
  ]),
  manualQcm('La phase liquide du protoxyde vient de disparaître : quels calculs deviennent pertinents ?', ['b00043','b00044','b00045','b00047','b00048'], 'Après le plateau liquidien, pression et volume redeviennent liés ; environ 235 L subsistent, donnant près de quatre heures à 1 L/min.', 'CDE', [
    ['La bouteille est alors totalement vide et doit être jetée immédiatement.', 'Une réserve gazeuse notable persiste après disparition de la dernière phase liquide.'],
    ['La pression demeure indépendante du contenu jusqu’à la dernière molécule.', 'Une fois le gaz seul présent, sa pression décroît avec le volume restant.'],
    ['La loi de Boyle peut désormais estimer le volume gazeux disponible.', 'Le système monophasique permet d’utiliser P₁V₁ = P₂V₂ à température stable.'],
    ['Le volume résiduel calculé est proche de 235 litres.', 'Le calcul associe environ 5 L internes à 745 psi puis ramène à la pression ambiante.'],
    ['À 1 L/min, l’autonomie théorique approche quatre heures.', 'Deux cent trente-cinq minutes correspondent à un peu moins de quatre heures.'],
  ]),
  manualQcm('Pourquoi oxygène et protoxyde ne se lisent-ils pas de la même façon en bouteille ?', ['b00034','b00042','b00043','b00191'], 'La température critique détermine la phase : oxygène gazeux avec pression informative, protoxyde liquide avec plateau de vapeur.', 'BDE', [
    ['Leurs manomètres reposent sur deux lois physiques totalement différentes.', 'Ils mesurent tous deux une pression ; c’est la phase du contenu qui change l’interprétation.'],
    ['L’oxygène reste gazeux et sa pression suit le volume disponible.', 'Sa température critique très basse exclut une phase liquide dans les conditions usuelles.'],
    ['Le protoxyde est uniquement gazeux dès que la bouteille est ouverte.', 'L’ouverture consomme d’abord la vapeur, remplacée par l’évaporation du liquide restant.'],
    ['Le protoxyde conserve une pression presque stable tant que du liquide persiste.', 'La pression observée correspond alors à la pression de vapeur saturante du produit.'],
    ['La pesée peut suivre le protoxyde avant que son manomètre ne baisse.', 'La diminution de masse révèle une consommation masquée par le plateau de pression.'],
  ]),
  manualQcm('Quels rôles respectifs attribuer au détendeur, à la valve antiretour et au manomètre ?', ['b00050','b00053','b00054','b00055','b00057','b00059'], 'Le détendeur stabilise la pression, la valve impose le sens du flux et le manomètre convertit la pression en indication.', 'A', [
    ['Le détendeur oppose diaphragme et ressort pour produire une pression aval stable.', 'Cet équilibre mécanique module l’ouverture malgré les variations de la source haute pression.'],
    ['La valve antiretour mesure numériquement le débit de chaque gaz.', 'Elle oriente l’écoulement mais ne quantifie ni débit ni composition gazeuse.'],
    ['Le tube de Bourdon coupe automatiquement le protoxyde lors d’une panne.', 'Il déplace une aiguille de pression ; la coupure dépend d’une valve de sécurité distincte.'],
    ['Le manomètre remplace l’analyseur d’oxygène placé dans le circuit.', 'Une pression correcte ne garantit pas la nature ni la fraction du gaz délivré.'],
    ['Le détendeur reconnaît un mauvais raccord grâce à la couleur du flexible.', 'Son fonctionnement répond à la pression, indépendamment de l’étiquetage du réseau.'],
  ]),
  manualQcm('Une chute de pression d’oxygène est détectée : quelle réponse automatique protège du mélange hypoxique ?', ['b00060','b00061','b00064','b00065','b00066'], 'La pression d’oxygène pilote la fermeture du protoxyde et une alarme rapide ; cette barrière agit avant la désaturation.', 'B', [
    ['Le débit de protoxyde augmente pour conserver le débit minute total.', 'Cette compensation aggraverait l’appauvrissement en oxygène du mélange inspiré.'],
    ['L’arrivée de protoxyde est interrompue par la valve asservie à l’oxygène.', 'La fermeture évite de continuer un gaz non oxygéné lorsque sa source protectrice faiblit.'],
    ['Le vaporisateur injecte de l’oxygène liquide dans le circuit.', 'Un vaporisateur ne délivre que l’agent volatil pour lequel il est calibré.'],
    ['La valve APL ferme la canalisation centrale de protoxyde.', 'Elle appartient au circuit respiratoire manuel et n’agit pas sur l’alimentation haute pression.'],
    ['La sécurité attend une baisse de SpO₂ avant d’émettre une alarme.', 'L’alarme de pression survient en quelques secondes, bien avant une hypoxémie mesurable.'],
  ]),
  manualQcm('Pourquoi la pression de bouteille est-elle réglée sous celle du réseau central ?', ['b00050','b00055'], 'Cette hiérarchie rend la canalisation prioritaire et préserve la bouteille ouverte contre une déplétion silencieuse lors des fluctuations.', 'C', [
    ['Pour augmenter automatiquement la concentration d’halogéné en cas de panne.', 'Le réglage concerne la priorité des sources et non le rendement du vaporisateur.'],
    ['Pour permettre au gaz central de remplir à nouveau la bouteille E.', 'Une valve antiretour s’oppose précisément à tout remplissage ou reflux accidentel.'],
    ['Pour que la bouteille ne débite que si la pression centrale devient insuffisante.', 'La source dont la pression de service est la plus élevée alimente alors préférentiellement l’appareil.'],
    ['Pour rendre inutile la fermeture du robinet après chaque utilisation.', 'Une bouteille doit rester gérée activement même si ce réglage limite sa vidange.'],
    ['Pour mesurer la quantité de protoxyde encore sous forme liquide.', 'La pression de service ne renseigne pas sur le contenu tant que persiste le liquide.'],
  ]),
  manualQcm('Quelles informations relèvent d’une mesure de pression plutôt que d’une analyse de gaz ?', ['b00053','b00054','b00059','b00075','b00177'], 'Le manomètre renseigne les forces pneumatiques ; l’analyseur mesure une fraction gazeuse et la Fe renseigne l’agent expiré.', 'D', [
    ['La FiO₂ délivrée au patient est directement donnée par le tube de Bourdon.', 'Ce tube indique une pression et ne différencie pas les constituants du mélange.'],
    ['La fraction expirée d’halogéné correspond à la pression de la canalisation.', 'Elle est issue de l’analyse des gaz expirés, en aval du patient.'],
    ['Le manomètre de bouteille mesure le pourcentage exact de protoxyde liquide.', 'Le plateau de vapeur empêche cette conversion avant disparition de la phase liquide.'],
    ['La déformation d’un tube de Bourdon permet d’afficher la pression d’une source.', 'La tension mécanique transmise au cadran traduit la force exercée par le gaz.'],
    ['L’analyseur d’oxygène remplace le détendeur lorsque la pression varie.', 'Il contrôle une composition sans abaisser ni stabiliser la pression d’alimentation.'],
  ]),
  manualQcm('Quels paramètres rendent la lecture d’un tube de Thorpe spécifique du gaz utilisé ?', ['b00072','b00075'], 'La graduation associe géométrie du tube, position du flotteur, gradient de pression, viscosité et densité du gaz calibré.', 'E', [
    ['Seule la couleur du robinet détermine la hauteur du flotteur.', 'L’identification visuelle n’intervient pas dans l’équilibre mécanique du flotteur.'],
    ['La graduation reste exacte après échange entre oxygène et protoxyde.', 'Le changement de densité et de viscosité fausse la relation entre hauteur et débit.'],
    ['Le tube se rétrécit vers le haut pour accélérer le gaz.', 'Il est évasé, ce qui augmente progressivement l’espace annulaire disponible.'],
    ['Le flotteur monte lorsque le débit diminue.', 'Un débit plus grand exerce davantage de force et élève le flotteur.'],
    ['La viscosité et la densité participent à la calibration de chaque tube.', 'Ces propriétés déterminent l’écoulement autour du flotteur avec le gradient de pression.'],
  ]),
  manualQcm('Une fuite apparaît sur le bloc débitmètres : quelles barrières limitent un mélange pauvre en oxygène ?', ['b00075','b00078','b00079'], 'L’oxygène placé en dernier réduit certaines pertes, l’asservissement limite les proportions et l’analyseur aval détecte le résultat réel.', 'AB', [
    ['Le débitmètre d’oxygène est installé au plus près de la sortie commune.', 'Une fuite située sur un autre tube survient ainsi avant l’ajout final d’oxygène.'],
    ['Un analyseur d’oxygène contrôle le mélange après les débitmètres.', 'Cette mesure révèle une composition dangereuse malgré un réglage apparemment correct.'],
    ['La pression normale du réseau exclut une fuite dans un tube de verre.', 'Une alimentation correcte peut coexister avec une perte située dans l’appareil.'],
    ['Le pin index corrige automatiquement la FiO₂ lorsqu’un tube fuit.', 'Il empêche une substitution de bouteille mais ne régule aucun mélange gazeux.'],
    ['La valve APL ferme le débitmètre endommagé dès que la FiO₂ baisse.', 'Elle agit sur la pression du circuit manuel sans détecter la concentration en oxygène.'],
  ]),
  manualQcm('Pourquoi l’oxygène est-il ajouté en dernier dans l’assemblage des débitmètres ?', ['b00075','b00078','b00079','b00193'], 'Placer l’oxygène près de la sortie protège contre certaines fuites en amont, mais une fuite de sa propre branche reste dangereuse.', 'AC', [
    ['Une fuite d’un autre gaz en amont tend alors à enrichir plutôt qu’appauvrir le mélange en oxygène.', 'L’oxygène est ajouté après la zone de perte et conserve une contribution au flux final.'],
    ['Cette position rend impossible toute hypoxie quelle que soit la fuite.', 'Une fuite touchant l’oxygène lui-même peut encore diminuer fortement la fraction inspirée.'],
    ['L’analyseur aval reste nécessaire malgré cet ordre protecteur.', 'Seule une mesure finale confirme la composition réellement envoyée aux voies aériennes.'],
    ['Le tube d’oxygène doit être le plus éloigné du circuit pour amortir sa pression.', 'Cette disposition augmenterait au contraire les occasions de perdre l’oxygène ajouté en premier.'],
    ['L’ordre des tubes remplace l’asservissement mécanique des débits.', 'Ces sécurités sont complémentaires et répondent à des mécanismes de panne différents.'],
  ]),
  manualQcm('Quelles limites persistent malgré l’asservissement oxygène-protoxyde ?', ['b00061','b00064','b00065','b00066','b00075','b00079'], 'L’asservissement répond à la pression ou au réglage des débits ; usure, fuite en aval ou mauvais gaz imposent une analyse finale indépendante.', 'AD', [
    ['Une fuite d’oxygène après le couplage peut encore abaisser la FiO₂.', 'La chaîne ou les diaphragmes ne détectent pas nécessairement une perte située en aval.'],
    ['Le couplage identifie chimiquement le gaz présent dans chaque flexible.', 'Il répond à une pression ou à un mouvement mécanique sans analyser la molécule.'],
    ['L’usure d’une chaîne crantée ne modifie jamais le rapport des débits.', 'Des crans usés peuvent permettre une proportion d’oxygène inférieure à la valeur prévue.'],
    ['La mesure d’oxygène en aval reste la vérification décisive.', 'Elle contrôle le résultat final de toutes les sécurités et révèle leurs défaillances.'],
    ['Une pression centrale normale garantit l’absence de mélange hypoxique.', 'La composition peut être erronée malgré des pressions d’alimentation apparemment normales.'],
  ]),
  manualQcm('Quels éléments imposent un vaporisateur propre à chaque agent volatil ?', ['b00084','b00085','b00087','b00092','b00102'], 'Pression de vapeur et ébullition déterminent la technologie ; clés de remplissage et calibration empêchent une substitution dangereuse.', 'AE', [
    ['Chaque halogéné possède des propriétés thermodynamiques qui lui sont propres.', 'La dose délivrée dépend directement de sa pression de vapeur et de sa température.'],
    ['Une même cuve non chauffée convient indifféremment au sévoflurane et au desflurane.', 'Le point d’ébullition bas du desflurane rend cette interchangeabilité imprécise et dangereuse.'],
    ['La couleur du flacon suffit à recalibrer automatiquement un plénum.', 'La calibration est physique et ne change pas par simple reconnaissance visuelle.'],
    ['La pression atmosphérique annule les différences entre agents.', 'Elle modifie leur pression partielle sans uniformiser leurs propriétés de vapeur.'],
    ['Les clés normalisées limitent les erreurs de remplissage entre cuves.', 'L’incompatibilité mécanique protège une calibration dédiée à un seul halogéné.'],
  ]),
  manualQcm('Comment un plénum à bypass variable stabilise-t-il la concentration délivrée ?', ['b00082','b00085','b00086'], 'Une fraction du flux se sature au contact du liquide ; une compensation thermique modifie le partage avec le bypass.', 'BC', [
    ['Tout le gaz frais traverse le liquide avant de rejoindre le patient.', 'Seule une fraction passe dans la chambre de vaporisation, le reste empruntant le bypass.'],
    ['Le léchage charge le flux de molécules jusqu’à la pression de vapeur de l’agent.', 'Le contact gaz-liquide produit un flux saturé qui sera ensuite dilué.'],
    ['Lamelles ou soufflet anéroïde adaptent le bypass au refroidissement.', 'La correction mécanique compense la baisse de vaporisation provoquée par l’évaporation.'],
    ['Une pompe injecte obligatoirement le liquide dans la branche inspiratoire.', 'Ce mécanisme décrit une technologie d’injection, pas le plénum passif.'],
    ['Le plénum cesse toute compensation lorsque la température varie.', 'Son architecture comprend précisément un dispositif destiné à stabiliser cette variation.'],
  ]),
  manualQcm('Pourquoi le desflurane nécessite-t-il une cuve chauffée et pressurisée ?', ['b00087','b00090','b00091','b00092'], 'À proximité de 22,8 °C, sa vapeur varie fortement avec la température ; thermostat et mesure de débit assurent une dose contrôlée.', 'CDE', [
    ['Sa pression de vapeur est plus faible que celle de l’eau à 20 °C.', 'Elle est au contraire très élevée, proche de 89 kPa.'],
    ['Son point d’ébullition de 58,5 °C autorise un plénum froid classique.', 'Cette valeur concerne le sévoflurane ; le desflurane bout vers 22,8 °C.'],
    ['De petits changements thermiques près de l’ébullition modifient fortement sa vapeur.', 'La relation non linéaire rend une compensation mécanique insuffisamment précise.'],
    ['Le chauffage stabilise la cuve avant le mélange mesuré aux gaz frais.', 'Une température contrôlée permet de calculer la quantité de molécules ajoutée.'],
    ['L’alimentation électrique est nécessaire au maintien thermostatique.', 'La cuve chaude au toucher traduit ce contrôle actif de température.'],
  ]),
  manualQcm('Quelles sécurités préviennent une administration imprévue de deux halogénés ?', ['b00084','b00095','b00096','b00102','b00105','b00106'], 'Remplissage spécifique et interverrouillage évitent les substitutions et l’ouverture simultanée ; la rétropression reste compensée séparément.', 'BDE', [
    ['Deux vaporisateurs peuvent être ouverts à demi-dose pour obtenir une MAC totale.', 'Le mélange de deux cuves rendrait la concentration imprévisible et est mécaniquement interdit.'],
    ['La clé de remplissage propre à l’agent empêche une contamination croisée.', 'Le flacon incompatible ne peut alimenter une cuve calibrée pour un autre produit.'],
    ['La valve APL verrouille les molettes des vaporisateurs.', 'Elle régule le circuit manuel et n’intervient pas dans la sélection des cuves.'],
    ['Une tige d’enclenchement bloque les vaporisateurs non sélectionnés.', 'La commande active déplace le mécanisme qui interdit l’ouverture des autres.'],
    ['Les dispositifs modernes réduisent l’effet de pompage lié à la rétropression.', 'Cette compensation évite une hausse transitoire d’agent au cycle suivant.'],
  ]),
  manualQcm('Quels critères séparent un circuit semi-ouvert d’un circuit fermé ?', ['b00109','b00113','b00114','b00115'], 'Le semi-ouvert chasse le CO₂ par haut débit sans absorbeur ; le fermé réutilise les gaz après épuration chimique.', 'A', [
    ['Le semi-ouvert dépend du gaz frais pour évacuer le volume expiré.', 'Sans chaux, le rinçage expiratoire constitue son mécanisme d’élimination du CO₂.'],
    ['Le fermé exige un débit frais supérieur à deux ventilations minute.', 'Il fonctionne au contraire avec un apport proche des besoins métaboliques.'],
    ['Le semi-ouvert possède toujours deux valves unidirectionnelles.', 'Les Mapleson décrits offrent une faible résistance justement sans ces valves.'],
    ['Le fermé ne permet aucune réinspiration des gaz expirés.', 'Il autorise une réinspiration importante après passage dans l’absorbeur.'],
    ['La présence d’un réservoir suffit seule à déterminer la classe.', 'Absorbeur, réinspiration et valves participent également à la classification.'],
  ]),
  manualQcm('Comment la valve APL protège-t-elle pendant une ventilation manuelle ?', ['b00116','b00117','b00118','b00119','b00124'], 'Le réglage humain dose l’échappement des gaz : trop fermée, la valve favorise une surpression ; trop ouverte, elle gêne l’insufflation.', 'B', [
    ['Elle garantit automatiquement le volume courant lorsque le ventilateur fonctionne.', 'Une valve interne distincte assure la limitation pendant la ventilation mécanique.'],
    ['Elle évacue l’excès gazeux au-delà de la pression choisie.', 'Cette ouverture réglable protège le circuit et les voies aériennes du patient.'],
    ['Elle mesure la fraction inspirée d’oxygène dans le ballon.', 'Aucune analyse de composition n’est réalisée par cette soupape mécanique.'],
    ['Elle absorbe chimiquement le dioxyde de carbone expiré.', 'L’absorption relève de la chaux sodée du circuit cercle.'],
    ['Elle compense une obstruction du tube interne d’un Bain.', 'Un tube frais obstrué doit être remplacé ; la soupape ne restaure pas son débit.'],
  ]),
  manualQcm('Quelles fonctions du circuit dépassent le simple transport des gaz inspirés ?', ['b00109','b00139','b00182'], 'Le circuit doit éliminer le CO₂, conduire l’excédent vers l’antipollution et préserver autant que possible chaleur et humidité.', 'C', [
    ['Il stocke l’oxygène liquide destiné à tout l’établissement.', 'Ce stockage appartient au réseau central extérieur au poste anesthésique.'],
    ['Il calibre la pression de vapeur propre à chaque halogéné.', 'La calibration est réalisée en amont par le vaporisateur spécifique.'],
    ['Il organise l’évacuation du CO₂ et des gaz non utilisés.', 'Ces flux expiratoires conditionnent sécurité ventilatoire et exposition professionnelle.'],
    ['Il mesure la pression interne des bouteilles E.', 'Cette information provient des manomètres de l’étage haute pression.'],
    ['Il remplace toute humidification même sans réinspiration.', 'Un circuit à haut débit perd au contraire beaucoup de chaleur et d’humidité.'],
  ]),
  manualQcm('Quand la réinspiration de gaz expirés devient-elle physiologiquement acceptable ?', ['b00134','b00135','b00139','b00142','b00143'], 'Elle est utile après retrait efficace du CO₂ et circulation unidirectionnelle ; sinon elle provoque une hypercapnie.', 'D', [
    ['Dès que la ligne de base du capnogramme s’élève.', 'Ce signe traduit du CO₂ inspiré et révèle une épuration insuffisante.'],
    ['Lorsque l’absorbeur est desséché et froid.', 'Une chaux sèche fonctionne mal et peut générer des produits toxiques.'],
    ['Même si les valves autorisent un reflux autour du bac.', 'Le court-circuit de l’absorbeur renvoie du gaz non épuré au patient.'],
    ['Après passage dans une chaux active avec valves unidirectionnelles compétentes.', 'Le gaz conserve chaleur et humidité tout en étant débarrassé du CO₂.'],
    ['Seulement avec un débit frais égal à 2,5 fois la ventilation minute.', 'Ce haut débit concerne l’épuration d’un Mapleson sans absorbeur.'],
  ]),
  manualQcm('Quels éléments définissent le circuit de Bain ?', ['b00120','b00121','b00129','b00133'], 'Le Bain est un Mapleson D coaxial, léger et sans absorbeur ; son épuration dépend entièrement d’un débit frais élevé.', 'E', [
    ['Il s’agit d’un circuit cercle miniature avec chaux intégrée.', 'Aucun absorbeur de CO₂ n’est présent dans cette architecture.'],
    ['Ses gaz circulent grâce à deux valves unidirectionnelles.', 'L’absence de ces valves contribue à sa faible résistance.'],
    ['Son tube interne transporte les gaz expirés vers l’antipollution.', 'Le tube interne apporte les gaz frais, tandis que l’expiration occupe l’espace annulaire.'],
    ['Il peut fonctionner fermé aux seuls besoins métaboliques.', 'Sans absorbeur, un tel débit entraînerait une réinspiration majeure.'],
    ['Le tube de gaz frais chemine à l’intérieur de la tubulure ondulée.', 'Cette disposition coaxiale transforme le Mapleson D classique en circuit de Bain.'],
  ]),
  manualQcm('Quelles conséquences produit un débit frais insuffisant dans un Mapleson D ?', ['b00129','b00130','b00131','b00133'], 'Le volume expiré n’est plus totalement chassé ; le CO₂ revient à l’inspiration et l’hypercapnie progresse.', 'AB', [
    ['Une partie du volume expiré reste dans la tubulure pour le cycle suivant.', 'Le rinçage incomplet laisse du CO₂ dans l’espace disponible avant la prochaine inspiration.'],
    ['Le patient réinhale du dioxyde de carbone malgré une ventilation mécanique active.', 'L’absence d’absorbeur rend l’épuration dépendante du renouvellement par les gaz frais.'],
    ['La chaux sodée se sature plus rapidement.', 'Le Mapleson ne contient aucun bac de chaux à épuiser.'],
    ['La pression de la bouteille d’oxygène augmente.', 'Une baisse de débit circuit ne peut pas recharger une source haute pression.'],
    ['Le débit insuffisant améliore la conservation thermique sans risque associé.', 'Toute rétention utile reste limitée par le danger d’hypercapnie.'],
  ]),
  manualQcm('Pourquoi un Mapleson peut-il être choisi chez un petit enfant ?', ['b00121','b00132','b00133'], 'Sa légèreté et l’absence de valves réduisent la résistance, au prix de forts débits, de pollution et de pertes thermiques.', 'AC', [
    ['Le trajet simple oppose peu de résistance au flux respiratoire.', 'L’absence d’absorbeur et de valves facilite la respiration d’un petit patient.'],
    ['Il conserve mieux l’humidité qu’un cercle fermé à très bas débit.', 'Le haut renouvellement élimine au contraire des gaz préalablement chauffés et humidifiés.'],
    ['Le circuit est léger et peu encombrant autour des voies aériennes.', 'Cette maniabilité constitue un avantage pratique dans la population pédiatrique.'],
    ['Il empêche toute réinspiration même si le tube interne est rompu.', 'Une rupture proximale supprime le rinçage distal et favorise l’hypercapnie.'],
    ['Son absorbeur miniature neutralise les bases fortes.', 'Aucun absorbeur chimique n’appartient au circuit de Bain.'],
  ]),
  manualQcm('Quelles pannes du Bain exposent respectivement à hypercapnie ou surpression ?', ['b00129','b00130','b00133'], 'Tube frais obstrué ou rompu : réinspiration de CO₂ ; échappement bloqué : accumulation de pression et barotraumatisme.', 'AD', [
    ['Une obstruction du tube interne réduit le rinçage et favorise la réinspiration.', 'Le gaz frais n’atteint plus correctement l’extrémité patient du circuit coaxial.'],
    ['Une fuite du tube interne augmente nécessairement la FiO₂.', 'Elle perturbe surtout la distribution du gaz frais sans garantir son enrichissement en oxygène.'],
    ['Un haut débit intact provoque toujours une hypercapnie sévère.', 'Un débit suffisant est précisément requis pour éliminer le volume expiré.'],
    ['Une valve d’échappement bloquée peut entraîner un barotraumatisme.', 'L’impossibilité d’évacuer l’excédent fait monter la pression des voies aériennes.'],
    ['Une chaux épuisée constitue la panne la plus fréquente du Bain.', 'Ce système ne possède pas d’absorbeur de dioxyde de carbone.'],
  ]),
  manualQcm('Comment le circuit cercle autorise-t-il une forte réinspiration sans hypercapnie ?', ['b00134','b00135','b00139','b00142','b00143'], 'Les valves dirigent les gaz vers une chaux active ; le CO₂ retiré, chaleur et humidité peuvent être réutilisées.', 'AE', [
    ['Les valves unidirectionnelles imposent le passage expiratoire par l’absorbeur.', 'Le sens circulaire empêche normalement le gaz chargé de CO₂ de revenir directement.'],
    ['Le débit frais chasse seul tout le CO₂ hors du cercle fermé.', 'À très bas débit, l’épuration dépend presque entièrement de la chaux.'],
    ['Le bac fonctionne mieux lorsqu’il est totalement desséché.', 'L’eau est nécessaire à la formation d’acide carbonique et à la réaction normale.'],
    ['La réinspiration élimine le besoin de surveiller le CO₂ inspiré.', 'Une valve ou un absorbeur défaillant peut restaurer une réinspiration dangereuse.'],
    ['Les gaz épurés conservent une partie de leur chaleur et de leur humidité.', 'Leur réutilisation limite les pertes liées au remplacement par des gaz frais secs.'],
  ]),
  manualQcm('Quels signes ou mécanismes évoquent un absorbeur de CO₂ épuisé ?', ['b00139','b00142','b00143'], 'Virage de l’indicateur et CO₂ inspiré orientent vers l’épuisement ; une valve défaillante reste un diagnostic concurrent.', 'BC', [
    ['Une pression de bouteille d’oxygène normale confirme l’activité de la chaux.', 'La pression de source ne renseigne pas sur la capacité alcaline de l’absorbeur.'],
    ['La couleur de l’indicateur reflète l’acidification progressive du milieu.', 'Le virage accompagne la consommation des capacités de neutralisation.'],
    ['Une ligne de base capnographique élevée révèle du CO₂ réinspiré.', 'Le gaz inspiré n’est plus totalement débarrassé du dioxyde de carbone.'],
    ['Un bac froid prouve toujours une valve APL trop ouverte.', 'L’absence de chaleur peut plutôt témoigner d’une réaction chimique devenue faible.'],
    ['Le remplacement de la chaux corrige toute valve incompétente.', 'Un reflux peut continuer à court-circuiter même un absorbeur neuf.'],
  ]),
  manualQcm('Quelles conditions favorisent les produits toxiques liés à la chaux sodée ?', ['b00144','b00145'], 'Dessiccation et bases fortes favorisent le monoxyde de carbone ; le sévoflurane peut aussi former le composé A.', 'CDE', [
    ['Une chaux humide dépourvue de bases fortes maximise la production de CO.', 'L’eau protège la réaction normale et l’absence de bases réduit les sous-produits.'],
    ['Le protoxyde réagit avec le calcium pour former le composé A.', 'Ce composé provient du sévoflurane en présence de KOH ou de NaOH.'],
    ['Une dessiccation quasi complète augmente le risque de monoxyde de carbone.', 'La chaux sèche réagit anormalement avec certains halogénés modernes.'],
    ['Les bases fortes participent aux réactions génératrices de sous-produits.', 'KOH et NaOH catalysent les transformations indésirables décrites.'],
    ['Le sévoflurane est l’agent associé à la formation du composé A.', 'Cette oléfine est spécifique de sa dégradation dans l’absorbeur.'],
  ]),
  manualQcm('Comment une valve unidirectionnelle incompétente perturbe-t-elle le cercle ?', ['b00134','b00135','b00142','b00143'], 'Le reflux court-circuite l’absorbeur, remet du CO₂ dans la branche inspiratoire et expose à une hypercapnie.', 'BDE', [
    ['Elle améliore le passage répété dans la chaux et provoque une hypocapnie.', 'Le défaut ouvre un trajet de retour qui évite l’absorbeur au lieu de le renforcer.'],
    ['Le gaz expiré peut revenir vers le patient sans épuration complète.', 'La perte du sens unique permet la réinspiration de dioxyde de carbone.'],
    ['Elle modifie uniquement la pression du réseau central.', 'Cette valve appartient au circuit basse pression, loin des canalisations hospitalières.'],
    ['La capnographie peut montrer une ligne de base expiratoire qui ne revient plus à zéro.', 'La présence de CO₂ inspiré traduit le reflux de gaz non correctement épuré.'],
    ['Une hypercapnie progressive peut apparaître malgré un bac de chaux neuf.', 'Le problème de trajet persiste indépendamment de la capacité chimique du bac.'],
  ]),
  manualQcm('Quels traits opposent un soufflet pneumatique à un piston électrique ?', ['b00148','b00149','b00151','b00156','b00157','b00158'], 'Le soufflet utilise un gaz moteur et peut intégrer le débit frais ; le piston est mû électriquement dans un circuit unique.', 'A', [
    ['Le soufflet pneumatique est comprimé par de l’oxygène ou de l’air moteur.', 'Un second circuit applique la pression autour du soufflet pour produire le volume.'],
    ['Le piston consomme obligatoirement une bouteille d’oxygène comme force motrice.', 'Une vis électrique déplace le piston sans gaz moteur externe.'],
    ['Le débit frais augmente de façon identique le volume produit par les deux architectures.', 'Le piston est indépendant de cette contribution, contrairement au système pneumatique.'],
    ['Le soufflet et le patient partagent directement le même gaz moteur.', 'Une interface sépare le circuit moteur du mélange respiratoire.'],
    ['Le piston ne peut pas être utilisé en pédiatrie.', 'La compensation logicielle permet aux architectures modernes de délivrer de petits volumes fiables.'],
  ]),
  manualQcm('Pourquoi le soufflet ascendant est-il préférable lors d’une fuite ?', ['b00151','b00158'], 'La déconnexion le vide et rend la panne visible ; un soufflet descendant peut poursuivre une course gravitaire trompeuse.', 'B', [
    ['Son poids maintient le volume courant même si le patient est déconnecté.', 'Un mouvement apparent ne garantit jamais que le volume atteint les voies aériennes.'],
    ['Il s’effondre rapidement et facilite le déclenchement d’une alarme.', 'La perte de remplissage devient un signe visuel immédiat de fuite importante.'],
    ['Il aspire de l’air extérieur pour conserver automatiquement la FiO₂.', 'Une aspiration d’air serait au contraire une cause possible d’appauvrissement en oxygène.'],
    ['Il ne nécessite aucune mesure du volume expiré.', 'La surveillance des volumes reste indispensable malgré cet indice mécanique supplémentaire.'],
    ['Il transforme une déconnexion en ventilation spontanée assistée.', 'Aucun effort du patient ne rétablit un circuit physiquement interrompu.'],
  ]),
  manualQcm('Comment la compliance de la tubulure modifie-t-elle le volume reçu ?', ['b00158'], 'Une partie du volume distend le circuit ; la mesure de compliance permet au logiciel d’ajouter cette perte à la délivrance.', 'C', [
    ['Elle augmente toujours la pression artérielle sans changer la ventilation.', 'Son effet porte d’abord sur la différence entre volume produit et volume transmis.'],
    ['Une tubulure très distensible délivre plus que le volume réglé.', 'Elle stocke temporairement une partie du volume et en réduit la quantité reçue.'],
    ['Le logiciel peut compenser le volume absorbé par la dilatation.', 'La perte estimée est ajoutée afin que le patient reçoive la cible programmée.'],
    ['Cette compensation remplace la détection des déconnexions.', 'Une fuite ouverte et une compliance élastique sont deux phénomènes distincts.'],
    ['Seuls les circuits adultes présentent une compliance mesurable.', 'Les petits volumes pédiatriques rendent au contraire cette correction particulièrement utile.'],
  ]),
  manualQcm('Quels compromis distinguent volume contrôlé, pression contrôlée et volume garanti ?', ['b00166','b00167','b00169','b00170','b00171'], 'Le premier garantit le volume, le second limite la pression, le mode hybride ajuste la pression pour atteindre le volume cible.', 'D', [
    ['Le volume contrôlé maintient une pression fixe malgré une compliance basse.', 'La pression augmente lorsqu’un même volume doit entrer dans un système moins compliant.'],
    ['La pression contrôlée garantit le volume malgré un bronchospasme.', 'Une résistance accrue peut réduire le volume obtenu sous la pression choisie.'],
    ['La PEP garantit à elle seule la ventilation minute.', 'Elle maintient le volume téléexpiratoire mais ne détermine ni fréquence ni volume courant.'],
    ['La pression contrôlée à volume garanti recherche la pression minimale efficace.', 'L’algorithme concilie cible volumique et limitation des pressions d’insufflation.'],
    ['Un temps expiratoire très court protège de l’hyperinflation.', 'Il empêche la vidange complète et favorise au contraire une rétention gazeuse.'],
  ]),
];

function buildIsolatedQcmSeries() {
  const names = ['Architecture', 'Sources de gaz', 'Bouteilles', 'Régulation', 'Débitmètres', 'Vaporisation', 'Circuits', 'Ventilation'];
  return Array.from({ length: 8 }, (_, index) => ({
    label: `QCM — Série ${index + 1} · ${names[index]}`,
    allowed_voies: ['interne'],
    questions: MANUAL_ISOLATED_QCM.slice(index * 5, index * 5 + 5),
  }));
}

const MANUAL_DP_QCM_1_8 = [
  {
    label: 'DP QCM 1 · Perte de l’alimentation centrale',
    vignette: 'Un homme de 68 ans est anesthésié pour une colectomie. Après l’induction, il est ventilé en volume contrôlé sur un appareil alimenté par la canalisation centrale. Le ballon autoremplisseur et une bouteille E d’oxygène, vérifiée pleine mais laissée fermée, sont immédiatement disponibles. L’intervention vient de débuter lorsque l’appareil émet une alarme de défaut d’alimentation en oxygène.',
    allowed_voies: ['interne'],
    questions: [
      {
        enonce: 'Avant toute modification de l’appareil, quelles actions sécurisent simultanément le patient et le diagnostic de la panne ?', format: 'qcm',
        sourceBlocks: ['b00013','b00016','b00029','b00149'],
        correction_generale: 'La priorité est d’assurer une ventilation oxygénée indépendante, puis de suivre le trajet pneumatique de la source vers le circuit patient.',
        items: [
          { lettre:'A', enonce:'Ventiler au ballon autoremplisseur raccordé à une source indépendante.', is_correct:true, justification:'Cette solution contourne immédiatement le ventilateur et le circuit potentiellement défaillants.' },
          { lettre:'B', enonce:'Contrôler la pression de la canalisation puis celle de la bouteille de secours.', is_correct:true, justification:'La comparaison des deux manomètres distingue une perte du réseau d’une panne plus distale.' },
          { lettre:'C', enonce:'Augmenter le débit de protoxyde pour maintenir le débit gazeux total.', is_correct:false, justification:'Le protoxyde ne corrige pas le défaut d’oxygène et aggraverait un mélange hypoxique.' },
          { lettre:'D', enonce:'Attendre une baisse de saturation avant de changer de moyen de ventilation.', is_correct:false, justification:'L’alarme pneumatique précède l’hypoxémie ; attendre la désaturation retarderait la protection.' },
          { lettre:'E', enonce:'Fermer la valve APL afin de rétablir la pression de la canalisation centrale.', is_correct:false, justification:'La valve APL agit sur le circuit manuel et ne peut restaurer une alimentation centrale.' },
        ],
      },
      {
        newInformation:'La pression d’oxygène chute et l’appareil coupe simultanément le protoxyde d’azote.',
        enonce:'La pression d’oxygène chute et l’appareil coupe simultanément le protoxyde d’azote. Comment interpréter cette réponse de l’appareil ?', format:'qcm',
        sourceBlocks:['b00060','b00061','b00064','b00065','b00066'],
        correction_generale:'La coupure du protoxyde est une sécurité asservie à la pression d’oxygène ; elle limite l’hypoxie sans rétablir l’oxygénation.',
        items:[
          {lettre:'A',enonce:'La valve APL a détecté une surpression dans les voies aériennes.',is_correct:false,justification:'La valve APL ne commande pas le protoxyde et n’analyse pas la pression d’alimentation en oxygène.'},
          {lettre:'B',enonce:'La fermeture du protoxyde vise à ne pas aggraver le mélange hypoxique.',is_correct:true,justification:'Un gaz non oxygéné est interrompu lorsque la pression protectrice d’oxygène devient insuffisante.'},
          {lettre:'C',enonce:'L’asservissement peut être mécanique par chaîne et rapport de pignons.',is_correct:true,justification:'Le couplage mécanique transmet le réglage d’oxygène à la commande du protoxyde.'},
          {lettre:'D',enonce:'Un dispositif pneumatique à diaphragmes peut assurer la même fonction.',is_correct:true,justification:'Deux pressions interreliées peuvent limiter l’ouverture du protoxyde selon l’alimentation en oxygène.'},
          {lettre:'E',enonce:'Cette coupure prouve que le mélange final contient une FiO₂ normale.',is_correct:false,justification:'Une fuite située en aval peut encore appauvrir le mélange malgré une coupure fonctionnelle.'},
        ],
      },
      {
        newInformation:'Le manomètre de la canalisation est à zéro alors que la bouteille E est fermée et pleine.',
        enonce:'Le manomètre de la canalisation est à zéro alors que la bouteille E est fermée et pleine. Quelles mesures sont adaptées ?',format:'qcm',
        sourceBlocks:['b00018','b00025','b00026','b00029','b00034'],
        correction_generale:'Le défaut est situé sur l’alimentation centrale ; la bouteille E fournit le secours, tandis que l’équipe organise une ressource durable.',
        items:[
          {lettre:'A',enonce:'Ouvrir la bouteille E d’oxygène après vérification de son raccord.',is_correct:true,justification:'La bouteille embarquée est précisément prévue comme source d’appoint ou de secours.'},
          {lettre:'B',enonce:'Ouvrir une bouteille de protoxyde pour remplacer le volume d’oxygène perdu.',is_correct:false,justification:'Le protoxyde ne peut assurer ni l’oxygénation du patient ni le fonctionnement sûr du ventilateur.'},
          {lettre:'C',enonce:'Prévenir immédiatement de la panne du réseau central et rechercher une source pérenne.',is_correct:true,justification:'La bouteille E offre une autonomie limitée et ne remplace pas durablement la canalisation.'},
          {lettre:'D',enonce:'Considérer la bouteille pleine uniquement parce que sa couleur est correcte.',is_correct:false,justification:'L’identité visuelle ne remplace ni la lecture du manomètre ni la vérification du raccord spécifique.'},
          {lettre:'E',enonce:'Maintenir disponible une ventilation indépendante pendant la transition de source.',is_correct:true,justification:'Une seconde défaillance de l’appareil ne doit pas interrompre la ventilation oxygénée.'},
        ],
      },
      {
        newInformation:'Après ouverture de la bouteille, sa pression diminue régulièrement pendant la ventilation.',
        enonce:'Après ouverture de la bouteille, sa pression diminue régulièrement pendant la ventilation. Quelles déductions sont justes ?',format:'qcm',
        sourceBlocks:['b00034','b00042','b00191'],
        correction_generale:'L’oxygène reste gazeux dans une bouteille E : sa pression suit le contenu et permet d’estimer la réserve à température stable.',
        items:[
          {lettre:'A',enonce:'La diminution régulière permet d’estimer le volume d’oxygène restant.',is_correct:true,justification:'Pour un gaz comprimé monophasique, la pression varie linéairement avec le contenu disponible.'},
          {lettre:'B',enonce:'La pression restera constante jusqu’à disparition d’une phase liquide.',is_correct:false,justification:'Ce comportement concerne le protoxyde ; l’oxygène est gazeux aux températures usuelles.'},
          {lettre:'C',enonce:'La pesée devient la seule méthode utilisable avant toute baisse du manomètre.',is_correct:false,justification:'La relation pression-volume fournit déjà une estimation directe pour l’oxygène gazeux.'},
          {lettre:'D',enonce:'La consommation du gaz moteur peut accélérer la baisse de pression observée.',is_correct:true,justification:'Un ventilateur pneumatique alimenté par cette bouteille ajoute sa consommation à celle du patient.'},
          {lettre:'E',enonce:'Une pression encore élevée exclut toute fuite située après le détendeur.',is_correct:false,justification:'Une fuite distale peut coexister avec une pression de bouteille momentanément satisfaisante.'},
        ],
      },
      {
        newInformation:'Le ventilateur pneumatique utilise désormais l’oxygène de la bouteille comme gaz moteur.',
        enonce:'Le ventilateur pneumatique utilise désormais l’oxygène de la bouteille comme gaz moteur. Quelles conséquences faut-il anticiper ?',format:'qcm',
        sourceBlocks:['b00148','b00149','b00150','b00151'],
        correction_generale:'Le double circuit pneumatique consomme un volume moteur important ; la réserve doit être préservée ou la ventilation rendue indépendante.',
        items:[
          {lettre:'A',enonce:'Le gaz moteur est intégralement délivré au patient à chaque cycle.',is_correct:false,justification:'Il comprime le soufflet dans un circuit séparé et ne constitue pas le volume respiratoire.'},
          {lettre:'B',enonce:'L’autonomie de la bouteille peut diminuer beaucoup plus vite que prévu.',is_correct:true,justification:'La compression répétée du soufflet exige des volumes élevés en plus de l’oxygène inspiré.'},
          {lettre:'C',enonce:'La motorisation pneumatique devient indépendante de toute pression d’alimentation.',is_correct:false,justification:'Elle repose précisément sur la pression d’oxygène ou d’air appliquée au soufflet.'},
          {lettre:'D',enonce:'Le manomètre du protoxyde permet de calculer cette consommation d’oxygène.',is_correct:false,justification:'Ce manomètre renseigne un autre gaz et ne mesure pas le débit moteur du ventilateur.'},
          {lettre:'E',enonce:'Une ventilation manuelle indépendante peut économiser la réserve embarquée.',is_correct:true,justification:'Un ballon relié à une autre source supprime la consommation pneumatique du ventilateur.'},
        ],
      },
      {
        newInformation:'L’analyseur placé en aval affiche une fraction d’oxygène inférieure à celle réglée.',
        enonce:'L’analyseur placé en aval affiche une fraction d’oxygène inférieure à celle réglée. Quelles explications sont cohérentes ?',format:'qcm',
        sourceBlocks:['b00072','b00075','b00078','b00079'],
        correction_generale:'La mesure aval révèle le mélange réellement délivré ; fuite d’oxygène ou défaut d’asservissement restent possibles malgré des réglages normaux.',
        items:[
          {lettre:'A',enonce:'Une fuite sur la branche d’oxygène en aval de son tube est possible.',is_correct:true,justification:'La perte survient après le réglage et réduit directement la fraction du mélange final.'},
          {lettre:'B',enonce:'La position terminale du débitmètre d’oxygène exclut toute fuite hypoxiante.',is_correct:false,justification:'Cet ordre réduit certains risques sans protéger d’une fuite propre à la branche oxygène.'},
          {lettre:'C',enonce:'Une usure du couplage mécanique peut altérer le rapport oxygène-protoxyde.',is_correct:true,justification:'Des crans usés peuvent permettre une proportion d’oxygène plus faible que celle attendue.'},
          {lettre:'D',enonce:'La mesure aval doit guider la correction avant toute poursuite de l’anesthésie.',is_correct:true,justification:'Elle constitue la vérification finale indépendante des pressions et des positions de robinets.'},
          {lettre:'E',enonce:'Une pression normale de bouteille invalide nécessairement cette alarme de FiO₂.',is_correct:false,justification:'La pression de source ne garantit pas la composition obtenue après mélange et fuites éventuelles.'},
        ],
      },
      {
        newInformation:'La pression continue de baisser malgré l’arrêt du protoxyde et l’équipe prépare une ventilation indépendante.',
        enonce:'La pression continue de baisser malgré l’arrêt du protoxyde et l’équipe prépare une ventilation indépendante. Quels principes guident la suite ?',format:'qcm',
        sourceBlocks:['b00009','b00010','b00029','b00149','b00186'],
        correction_generale:'La sécurité impose de dissocier le patient de la panne, d’interrompre l’exposition non urgente et d’organiser une alimentation fiable.',
        items:[
          {lettre:'A',enonce:'Poursuivre l’intervention jusqu’à épuisement complet puisque la FiO₂ est surveillée.',is_correct:false,justification:'La surveillance ne transforme pas une réserve décroissante en alimentation sûre et durable.'},
          {lettre:'B',enonce:'Maintenir une oxygénation contrôlée avec le moyen de ventilation indépendant.',is_correct:true,justification:'Cette priorité physiologique précède le dépannage technique ou la poursuite chirurgicale.'},
          {lettre:'C',enonce:'Évaluer l’arrêt de l’intervention si aucune source fiable ne peut être rétablie.',is_correct:true,justification:'Une anesthésie non urgente ne doit pas se poursuivre avec une oxygénation précaire.'},
          {lettre:'D',enonce:'Réouvrir le protoxyde afin de ralentir la consommation d’oxygène.',is_correct:false,justification:'Cette mesure réduirait la marge d’oxygénation sans résoudre la panne d’alimentation.'},
          {lettre:'E',enonce:'Faire rechercher la défaillance du réseau pendant la prise en charge du patient.',is_correct:true,justification:'Le diagnostic technique peut progresser en parallèle à condition que la ventilation soit sécurisée.'},
        ],
      },
    ],
  },
  {
    label:'DP QCM 2 · Hypercapnie sur circuit de Bain',
    vignette:'Une enfant de 6 ans est opérée d’une chirurgie brève sous anesthésie générale avec un circuit de Bain. La ventilation minute est mesurée et le débit de gaz frais a été réglé avant l’induction. La capnographie initiale est normale, sans pression inspiratoire élevée. Une élévation progressive du dioxyde de carbone inspiré apparaît alors que le volume courant reste stable.',
    allowed_voies:['interne'],
    questions:[
      {
        enonce:'Quelles caractéristiques du circuit de Bain déterminent son épuration du dioxyde de carbone ?',format:'qcm',sourceBlocks:['b00120','b00121','b00129','b00130','b00133'],
        correction_generale:'Le Bain est un Mapleson D coaxial sans absorbeur ; le débit frais chasse le volume expiré et conditionne directement la réinspiration.',
        items:[
          {lettre:'A',enonce:'Le tube interne apporte les gaz frais vers l’extrémité patient.',is_correct:true,justification:'Cette disposition coaxiale distribue le flux neuf au sein de la tubulure expiratoire.'},
          {lettre:'B',enonce:'Une chaux sodée retire le CO₂ avant la réinspiration.',is_correct:false,justification:'Le Bain ne possède aucun absorbeur chimique et dépend du rinçage gazeux.'},
          {lettre:'C',enonce:'Le débit frais doit chasser les gaz expirés pendant l’expiration.',is_correct:true,justification:'Un renouvellement insuffisant laisse du dioxyde de carbone disponible au cycle suivant.'},
          {lettre:'D',enonce:'Deux valves unidirectionnelles imposent le sens de circulation.',is_correct:false,justification:'L’absence de ces valves explique la faible résistance caractéristique du Mapleson.'},
          {lettre:'E',enonce:'L’élimination du CO₂ est indépendante de la ventilation minute.',is_correct:false,justification:'Le débit nécessaire est justement calculé comme un multiple de la ventilation minute.'},
        ],
      },
      {
        newInformation:'Le débit de gaz frais mesuré est inférieur à deux fois la ventilation minute de l’enfant.',
        enonce:'Le débit de gaz frais mesuré est inférieur à deux fois la ventilation minute de l’enfant. Quelles conséquences sont attendues ?',format:'qcm',sourceBlocks:['b00129','b00130','b00131','b00133'],
        correction_generale:'Le débit inférieur à la recommandation de 2,5 fois la ventilation minute ne rince pas totalement le circuit et favorise l’hypercapnie.',
        items:[
          {lettre:'A',enonce:'L’absorbeur s’épuisera rapidement sous l’effet du faible débit.',is_correct:false,justification:'Aucun absorbeur n’est présent dans ce circuit de Mapleson.'},
          {lettre:'B',enonce:'Une partie du volume expiré restera disponible pour l’inspiration suivante.',is_correct:true,justification:'Le gaz frais insuffisant ne chasse pas toute la charge expirée hors de la tubulure.'},
          {lettre:'C',enonce:'Le dioxyde de carbone inspiré peut augmenter progressivement.',is_correct:true,justification:'La réinspiration répétée élève la ligne de base capnographique et la PaCO₂.'},
          {lettre:'D',enonce:'L’augmentation du débit vers 2,5 fois la ventilation minute est indiquée.',is_correct:true,justification:'Ce rapport fournit le rinçage recommandé pour éviter la réinspiration significative.'},
          {lettre:'E',enonce:'La faible résistance du circuit compense l’insuffisance de renouvellement.',is_correct:false,justification:'Une résistance basse facilite le flux mais ne retire pas le CO₂ résiduel.'},
        ],
      },
      {
        newInformation:'La valve APL a été presque totalement fermée pendant la ventilation manuelle.',
        enonce:'La valve APL a été presque totalement fermée pendant la ventilation manuelle. Quels risques ou actions en découlent ?',format:'qcm',sourceBlocks:['b00116','b00117','b00118','b00119','b00124'],
        correction_generale:'Une APL trop fermée entrave l’échappement et expose à une surpression ; son ouverture doit permettre la ventilation sans accumulation.',
        items:[
          {lettre:'A',enonce:'La fermeture améliore l’évacuation du CO₂ hors du circuit.',is_correct:false,justification:'Elle limite la sortie des gaz et ne corrige pas un débit frais insuffisant.'},
          {lettre:'B',enonce:'Une surpression des voies aériennes peut survenir pendant les insufflations.',is_correct:true,justification:'Les volumes s’accumulent lorsque la soupape ne laisse plus échapper l’excédent.'},
          {lettre:'C',enonce:'L’ouverture adaptée de la valve doit accompagner le contrôle de pression.',is_correct:true,justification:'La ventilation manuelle exige un réglage humain cohérent avec la pression souhaitée.'},
          {lettre:'D',enonce:'La valve fermée transforme le Bain en circuit cercle fonctionnel.',is_correct:false,justification:'Aucune chaux ni valve unidirectionnelle n’apparaît du fait de cette fermeture.'},
          {lettre:'E',enonce:'Le blocage complet peut favoriser un barotraumatisme.',is_correct:true,justification:'L’impossibilité d’évacuer les gaz transmet une pression excessive au poumon.'},
        ],
      },
      {
        newInformation:'Le débit est augmenté à 2,5 fois la ventilation minute mais le CO₂ inspiré reste élevé.',
        enonce:'Le débit est augmenté à 2,5 fois la ventilation minute mais le CO₂ inspiré reste élevé. Quelles causes deviennent prioritaires ?',format:'qcm',sourceBlocks:['b00121','b00129','b00130','b00133'],
        correction_generale:'Une hypercapnie persistante malgré un débit suffisant oriente vers une interruption du trajet frais, notamment obstruction ou rupture proximale.',
        items:[
          {lettre:'A',enonce:'Une obstruction du tube interne de gaz frais.',is_correct:true,justification:'Le débit réglé ne parvient plus correctement à l’extrémité du circuit patient.'},
          {lettre:'B',enonce:'Une rupture proximale du segment interne coaxial.',is_correct:true,justification:'Les gaz frais se perdent près de la machine et ne rincent pas le volume distal.'},
          {lettre:'C',enonce:'Une chaux sodée arrivée en fin de capacité.',is_correct:false,justification:'Le circuit de Bain n’intègre aucun absorbeur dont l’épuisement pourrait être responsable.'},
          {lettre:'D',enonce:'Une réinspiration liée à un défaut structurel du circuit.',is_correct:true,justification:'L’anomalie persiste car le volume expiré reste présent malgré la commande de haut débit.'},
          {lettre:'E',enonce:'Une pression trop basse dans une PEP intégrée au Bain.',is_correct:false,justification:'La PEP ne constitue pas le mécanisme d’épuration du dioxyde de carbone de ce circuit.'},
        ],
      },
      {
        newInformation:'L’inspection révèle une obstruction partielle du tube interne de gaz frais.',
        enonce:'L’inspection révèle une obstruction partielle du tube interne de gaz frais. Quelles conséquences expliquent l’hypercapnie ?',format:'qcm',sourceBlocks:['b00127','b00129','b00130','b00131','b00133'],
        correction_generale:'L’obstruction réduit le flux frais réellement délivré en distal ; le volume expiré n’est plus chassé et revient au patient.',
        items:[
          {lettre:'A',enonce:'Le débit affiché par la machine peut surestimer le flux atteignant le patient.',is_correct:true,justification:'La mesure en amont ne garantit pas le passage à travers un tube interne obstrué.'},
          {lettre:'B',enonce:'Le volume expiré est éliminé plus efficacement par l’espace annulaire.',is_correct:false,justification:'Sans apport frais distal suffisant, l’espace annulaire conserve au contraire du CO₂.'},
          {lettre:'C',enonce:'La réinspiration persiste malgré une commande de débit théoriquement correcte.',is_correct:true,justification:'L’obstacle transforme le débit programmé en un renouvellement effectif insuffisant.'},
          {lettre:'D',enonce:'Le remplacement du circuit est une mesure appropriée.',is_correct:true,justification:'Un défaut interne non corrigible doit être éliminé sans prolonger l’exposition à l’hypercapnie.'},
          {lettre:'E',enonce:'L’obstruction augmente nécessairement la concentration d’oxygène inspirée.',is_correct:false,justification:'Elle diminue le renouvellement global sans assurer aucun enrichissement sélectif en oxygène.'},
        ],
      },
      {
        newInformation:'Après remplacement du circuit, l’élimination du CO₂ se normalise et la ventilation manuelle reprend.',
        enonce:'Après remplacement du circuit, l’élimination du CO₂ se normalise et la ventilation manuelle reprend. Que faut-il encore surveiller ?',format:'qcm',sourceBlocks:['b00116','b00118','b00124','b00131','b00133'],
        correction_generale:'La correction confirme la panne du Bain ; débit frais, pression, APL et capnographie doivent maintenant rester cohérents.',
        items:[
          {lettre:'A',enonce:'Le débit frais effectif par rapport à la ventilation minute.',is_correct:true,justification:'Une nouvelle insuffisance de rinçage ferait réapparaître du dioxyde de carbone inspiré.'},
          {lettre:'B',enonce:'La position de la valve APL durant les insufflations manuelles.',is_correct:true,justification:'Son réglage conditionne la pression et l’échappement des gaz à chaque cycle.'},
          {lettre:'C',enonce:'La disparition durable du CO₂ sur la ligne de base capnographique.',is_correct:true,justification:'La capnographie vérifie directement que la réinspiration pathologique ne récidive pas.'},
          {lettre:'D',enonce:'La couleur de la chaux sodée du nouveau Bain.',is_correct:false,justification:'Le circuit remplacé reste un Mapleson sans absorbeur ni indicateur coloré.'},
          {lettre:'E',enonce:'La pression des voies aériennes afin d’éviter une surpression.',is_correct:true,justification:'Le retour en manuel expose encore aux conséquences d’une APL mal ajustée.'},
        ],
      },
      {
        newInformation:'À l’émergence, un haut débit frais est maintenu malgré le retour d’une respiration efficace.',
        enonce:'À l’émergence, un haut débit frais est maintenu malgré le retour d’une respiration efficace. Quels inconvénients faut-il limiter ?',format:'qcm',sourceBlocks:['b00132','b00133','b00175','b00182'],
        correction_generale:'Le haut débit nécessaire au Bain accroît consommation, pollution et pertes thermiques ; il doit rester proportionné à l’épuration requise.',
        items:[
          {lettre:'A',enonce:'Une consommation accrue de gaz et d’agent volatil.',is_correct:true,justification:'Une part importante du mélange traverse le circuit puis rejoint directement l’antipollution.'},
          {lettre:'B',enonce:'Une réduction automatique de toute exposition professionnelle.',is_correct:false,justification:'Davantage de gaz excédentaire augmente la charge du système d’évacuation et les fuites potentielles.'},
          {lettre:'C',enonce:'Des pertes plus importantes de chaleur et d’humidité.',is_correct:true,justification:'Le renouvellement limite la réinspiration de gaz déjà réchauffés et humidifiés par l’enfant.'},
          {lettre:'D',enonce:'Une transformation progressive du Bain en circuit fermé.',is_correct:false,justification:'Le haut débit et l’absence d’absorbeur maintiennent son fonctionnement semi-ouvert.'},
          {lettre:'E',enonce:'Une augmentation des rejets de gaz anesthésiques.',is_correct:true,justification:'Le mélange non consommé est évacué vers l’antipollution au lieu d’être réutilisé.'},
        ],
      },
    ],
  },
  {
    label:'DP QCM 3 · CO₂ inspiré sur circuit cercle',
    vignette:'Une femme de 54 ans bénéficie d’une hystérectomie sous anesthésie inhalatoire à bas débit sur circuit cercle. Les valves unidirectionnelles et l’absorbeur ont été vérifiés avant l’induction. Après deux heures, la ligne de base capnographique ne revient plus à zéro alors que le volume courant et la pression inspiratoire restent stables. L’équipe doit distinguer un épuisement de l’absorbeur d’un défaut de circulation des gaz.',
    allowed_voies:['interne'],
    questions:[
      {
        enonce:'Quels éléments du circuit cercle empêchent normalement la réinspiration du dioxyde de carbone ?',format:'qcm',sourceBlocks:['b00109','b00114','b00115','b00135','b00139'],
        correction_generale:'Le sens imposé par les valves conduit les gaz expirés vers la chaux, qui retire le CO₂ avant leur réutilisation dans le circuit.',
        items:[
          {lettre:'A',enonce:'Les valves unidirectionnelles orientent le flux vers l’absorbeur.',is_correct:true,justification:'Elles imposent la circulation des gaz expirés à travers le bac avant leur retour vers le patient.'},
          {lettre:'B',enonce:'Un débit frais très élevé constitue l’unique procédé d’épuration.',is_correct:false,justification:'Le cercle semi-fermé ou fermé repose surtout sur l’absorption chimique du dioxyde de carbone.'},
          {lettre:'C',enonce:'La chaux transforme chimiquement le CO₂ en produits non réinspirés.',is_correct:true,justification:'L’acide carbonique réagit avec les composés basiques et aboutit notamment au carbonate de calcium.'},
          {lettre:'D',enonce:'Le gaz débarrassé du CO₂ peut conserver une partie de sa chaleur et de son humidité.',is_correct:true,justification:'La réutilisation du mélange expiré traité limite les pertes liées à un renouvellement intégral.'},
          {lettre:'E',enonce:'L’absence de valves favorise une épuration plus rapide par diminution de la résistance.',is_correct:false,justification:'Sans orientation du flux, les gaz peuvent court-circuiter l’absorbeur et retourner chargés en CO₂.'},
        ],
      },
      {
        newInformation:'L’indicateur coloré de la chaux a viré et le bac ne dégage presque plus de chaleur.',
        enonce:'L’indicateur coloré de la chaux a viré et le bac ne dégage presque plus de chaleur. Comment interpréter ces constatations ?',format:'qcm',sourceBlocks:['b00135','b00136','b00137','b00138','b00139','b00143'],
        correction_generale:'Le virage de l’indicateur associé à l’absence de chaleur rend probable l’épuisement de la chaux et justifie le remplacement du bac.',
        items:[
          {lettre:'A',enonce:'Le virage traduit l’acidification progressive du matériau absorbant.',is_correct:true,justification:'L’indicateur ajouté à la chaux change de couleur lorsque la capacité basique active diminue.'},
          {lettre:'B',enonce:'L’absence de chaleur prouve que la réaction d’absorption est maximale.',is_correct:false,justification:'Les réactions de neutralisation libèrent de la chaleur ; leur disparition suggère une activité faible.'},
          {lettre:'C',enonce:'Le bac doit être remplacé devant la réinspiration capnographique associée.',is_correct:true,justification:'La concordance entre signe visuel, refroidissement et CO₂ inspiré rend l’absorbeur non fiable.'},
          {lettre:'D',enonce:'Une augmentation du débit frais peut réduire transitoirement la charge réinspirée.',is_correct:true,justification:'Un renouvellement accru chasse davantage de gaz expirés pendant la correction du défaut.'},
          {lettre:'E',enonce:'La stabilité des pressions aériennes exclut l’épuisement de la chaux.',is_correct:false,justification:'La capacité chimique du bac peut disparaître sans modifier la mécanique ventilatoire mesurée.'},
        ],
      },
      {
        newInformation:'Un bac de chaux neuf est installé mais le CO₂ inspiré persiste sans modification du débit frais.',
        enonce:'Un bac de chaux neuf est installé mais le CO₂ inspiré persiste sans modification du débit frais. Quelle conduite diagnostique est pertinente ?',format:'qcm',sourceBlocks:['b00135','b00139','b00142','b00143'],
        correction_generale:'La persistance après remplacement du bac fait rechercher un défaut de valve unidirectionnelle autorisant le contournement de l’absorbeur.',
        items:[
          {lettre:'A',enonce:'Inspecter la mobilité et l’étanchéité des valves inspiratoire et expiratoire.',is_correct:true,justification:'Un disque bloqué ou absent rompt le sens circulaire nécessaire au passage par l’absorbeur.'},
          {lettre:'B',enonce:'Conclure immédiatement que le nouveau bac est déjà chimiquement épuisé.',is_correct:false,justification:'Une défaillance instantanée du matériau neuf est moins probable qu’un court-circuit gazeux persistant.'},
          {lettre:'C',enonce:'Vérifier si le flux expiré contourne le compartiment contenant la chaux.',is_correct:true,justification:'Une dérivation mécanique explique que du dioxyde de carbone revienne malgré un absorbant actif.'},
          {lettre:'D',enonce:'Suivre la ligne de base capnographique pendant les essais correctifs.',is_correct:true,justification:'Son retour à zéro fournit un contrôle direct de la disparition de la réinspiration.'},
          {lettre:'E',enonce:'Attribuer le phénomène à la seule diminution de compliance pulmonaire.',is_correct:false,justification:'La compliance modifie volumes et pressions, mais n’explique pas à elle seule du CO₂ inspiré.'},
        ],
      },
      {
        newInformation:'La valve expiratoire reste entrouverte et autorise un reflux vers la branche inspiratoire.',
        enonce:'La valve expiratoire reste entrouverte et autorise un reflux vers la branche inspiratoire. Quelles conséquences fonctionnelles en résultent ?',format:'qcm',sourceBlocks:['b00135','b00140','b00143'],
        correction_generale:'La valve expiratoire incompétente désorganise le sens du cercle, court-circuite la chaux et permet une réinspiration responsable d’hypercapnie.',
        items:[
          {lettre:'A',enonce:'Une fraction des gaz expirés peut rejoindre l’inspiration sans traverser la chaux.',is_correct:true,justification:'L’ouverture anormale offre un trajet rétrograde qui évite le compartiment absorbant.'},
          {lettre:'B',enonce:'La circulation devient mieux séparée entre inspiration et expiration.',is_correct:false,justification:'Le reflux mélange au contraire les deux trajets qui devaient rester orientés.'},
          {lettre:'C',enonce:'Le dioxyde de carbone inspiré peut persister malgré un absorbant neuf.',is_correct:true,justification:'La qualité de la chaux est sans effet sur un volume gazeux qui ne la traverse pas.'},
          {lettre:'D',enonce:'Une hypercapnie du patient peut apparaître si le défaut se prolonge.',is_correct:true,justification:'La répétition d’inspirations contaminées réduit l’élimination nette du dioxyde de carbone.'},
          {lettre:'E',enonce:'Le défaut augmente nécessairement le volume courant délivré.',is_correct:false,justification:'Une valve incompétente altère d’abord le trajet gazeux sans imposer une hausse du volume réglé.'},
        ],
      },
      {
        newInformation:'Le débit de gaz frais est transitoirement augmenté pendant le remplacement de la valve défectueuse.',
        enonce:'Le débit de gaz frais est transitoirement augmenté pendant le remplacement de la valve défectueuse. Quels effets faut-il anticiper ?',format:'qcm',sourceBlocks:['b00114','b00115','b00139','b00182','b00195'],
        correction_generale:'Le haut débit améliore temporairement le rinçage, mais accroît consommation, rejets anesthésiques et pertes de chaleur et d’humidité.',
        items:[
          {lettre:'A',enonce:'Le renouvellement accru peut diminuer provisoirement le CO₂ réinspiré.',is_correct:true,justification:'Une quantité plus grande de mélange neuf chasse une part supérieure des gaz expirés contaminés.'},
          {lettre:'B',enonce:'Cette mesure répare le mécanisme de la valve sans intervention matérielle.',is_correct:false,justification:'Le débit masque partiellement la réinspiration mais ne restaure pas l’unidirectionnalité.'},
          {lettre:'C',enonce:'La consommation d’agent anesthésique et de gaz augmente.',is_correct:true,justification:'Le mélange supplémentaire traverse le circuit puis doit être évacué au lieu d’être réutilisé.'},
          {lettre:'D',enonce:'La charge transmise au système antipollution devient plus importante.',is_correct:true,justification:'Les volumes excédentaires contenant des agents volatils rejoignent davantage la ligne d’évacuation.'},
          {lettre:'E',enonce:'La conservation de chaleur et d’humidité est renforcée par le rinçage.',is_correct:false,justification:'La réduction de la réinspiration élimine aussi des gaz préalablement réchauffés et humidifiés.'},
        ],
      },
      {
        newInformation:'L’ancien bac avait été exposé toute la nuit à un débit élevé de gaz frais et sa chaux était desséchée.',
        enonce:'L’ancien bac avait été exposé toute la nuit à un débit élevé de gaz frais et sa chaux était desséchée. Quels risques chimiques doivent être reconnus ?',format:'qcm',sourceBlocks:['b00139','b00144','b00145'],
        correction_generale:'La dessiccation et les bases fortes favorisent les produits de dégradation : CO avec certains halogénés et composé A avec le sévoflurane.',
        items:[
          {lettre:'A',enonce:'Une dessiccation presque complète favorise la production de monoxyde de carbone avec certains halogénés.',is_correct:true,justification:'Le risque de CO devient pertinent avec une chaux très sèche exposée notamment à l’isoflurane ou au desflurane.'},
          {lettre:'B',enonce:'Le sévoflurane peut former le composé A au contact de bases fortes.',is_correct:true,justification:'Cette oléfine résulte de la réaction du sévoflurane avec le KOH ou le NaOH de certains absorbants.'},
          {lettre:'C',enonce:'Le sévoflurane est l’agent décrit comme producteur de CO dans la chaux sodée.',is_correct:false,justification:'La formation de monoxyde de carbone concerne les autres halogénés mentionnés, pas le sévoflurane.'},
          {lettre:'D',enonce:'Éviter de laisser inutilement un haut débit limite la dessiccation du bac.',is_correct:true,justification:'Cette précaution conserve l’eau indispensable et réduit les conditions favorables aux réactions indésirables.'},
          {lettre:'E',enonce:'Un absorbant pauvre ou dépourvu de bases fortes augmente ces deux réactions.',is_correct:false,justification:'La réduction du KOH et du NaOH vise justement à diminuer la formation de ces produits.'},
        ],
      },
      {
        newInformation:'La ventilation redevient normale et l’équipe reprend un très bas débit piloté par la fraction expirée anesthésique.',
        enonce:'La ventilation redevient normale et l’équipe reprend un très bas débit piloté par la fraction expirée anesthésique. Quelles surveillances restent indispensables ?',format:'qcm',sourceBlocks:['b00139','b00143','b00145','b00177','b00182'],
        correction_generale:'Le très bas débit impose de contrôler composition inspirée et expirée, CO₂, valves et absorbeur ; l’automatisation optimise sans abolir la surveillance.',
        items:[
          {lettre:'A',enonce:'Contrôler en continu que la ligne de base du CO₂ reste nulle.',is_correct:true,justification:'Toute remontée signalerait une nouvelle réinspiration par saturation ou défaut de circulation.'},
          {lettre:'B',enonce:'Suivre les fractions inspirées d’oxygène et expirées d’agent anesthésique.',is_correct:true,justification:'Le faible renouvellement rend essentielle la mesure précise de la composition interne du cercle.'},
          {lettre:'C',enonce:'Considérer les valves fiables sans autre vérification après leur remplacement.',is_correct:false,justification:'Une récidive mécanique doit rester détectable par le monitorage clinique et capnographique.'},
          {lettre:'D',enonce:'Surveiller l’état de la chaux et prévenir une nouvelle dessiccation.',is_correct:true,justification:'Le fonctionnement fermé dépend durablement d’un absorbant actif et suffisamment hydraté.'},
          {lettre:'E',enonce:'Supprimer l’analyse des gaz puisque la boucle électronique fixe la cible.',is_correct:false,justification:'La rétroaction utilise précisément ces mesures et ne protège pas d’une défaillance non détectée.'},
        ],
      },
    ],
  },
  {
    label:'DP QCM 4 · Ventilation d’un patient obèse',
    vignette:'Un homme de 46 ans, obèse, est anesthésié pour une chirurgie abdominale. Après l’intubation, sa compliance thoracopulmonaire est basse. En volume contrôlé, le volume courant programmé est délivré mais les pressions inspiratoires augmentent. Il n’existe ni déconnexion ni défaut du circuit. L’équipe veut limiter les pressions tout en maintenant une ventilation minute suffisante et une pression expiratoire positive.',
    allowed_voies:['interne'],
    questions:[
      {
        enonce:'Quels compromis du volume contrôlé faut-il identifier chez ce patient à faible compliance ?',format:'qcm',sourceBlocks:['b00159','b00160','b00161','b00168','b00171'],
        correction_generale:'Le volume contrôlé assure le volume courant programmé, mais une compliance basse exige des pressions plus fortes et expose au barotraumatisme.',
        items:[
          {lettre:'A',enonce:'Le volume courant réglé constitue la variable garantie par ce mode.',is_correct:true,justification:'Le ventilateur poursuit la cible volumique indépendamment de la compliance thoracopulmonaire.'},
          {lettre:'B',enonce:'La pression inspiratoire peut s’élever pour délivrer ce volume dans un système peu compliant.',is_correct:true,justification:'Une plus grande pression est nécessaire lorsque le thorax et le poumon se laissent moins distendre.'},
          {lettre:'C',enonce:'Le mode réduit automatiquement le volume dès que la pression augmente.',is_correct:false,justification:'Cette adaptation n’est pas le principe du contrôle volumique, qui privilégie la cible de volume.'},
          {lettre:'D',enonce:'Des pressions excessives peuvent exposer à un barotraumatisme.',is_correct:true,justification:'La poursuite d’un volume fixe malgré la faible compliance peut imposer une contrainte ventilatoire dangereuse.'},
          {lettre:'E',enonce:'La compliance basse garantit une ventilation alvéolaire suffisante.',is_correct:false,justification:'Elle ne renseigne pas sur l’efficacité de l’élimination du CO₂ et complique la délivrance ventilatoire.'},
        ],
      },
      {
        newInformation:'Le passage en pression contrôlée abaisse la pression maximale mais le volume courant devient insuffisant.',
        enonce:'Le passage en pression contrôlée abaisse la pression maximale mais le volume courant devient insuffisant. Comment expliquer cette réponse ?',format:'qcm',sourceBlocks:['b00168','b00171'],
        correction_generale:'En pression contrôlée, la faible compliance fait atteindre rapidement la cible de pression ; l’insufflation s’arrête avec un petit volume courant.',
        items:[
          {lettre:'A',enonce:'La cible de pression est atteinte avant que le volume souhaité ne pénètre.',is_correct:true,justification:'Le poumon peu compliant reçoit un faible volume pour une pression d’insufflation donnée.'},
          {lettre:'B',enonce:'Le mode pression contrôlée garantit le même volume quelles que soient les propriétés mécaniques.',is_correct:false,justification:'Le volume obtenu dépend directement de la compliance et peut donc varier au cours de l’anesthésie.'},
          {lettre:'C',enonce:'Un petit volume courant expose à une hypoventilation si la ventilation minute chute.',is_correct:true,justification:'À fréquence inchangée, la réduction du volume délivré diminue le renouvellement gazeux total.'},
          {lettre:'D',enonce:'La baisse de pression prouve que la compliance thoracique s’est normalisée.',is_correct:false,justification:'Elle résulte du choix d’une limite ventilatoire et non d’une amélioration mécanique démontrée.'},
          {lettre:'E',enonce:'Le volume expiré doit être surveillé après tout changement de pression cible.',is_correct:true,justification:'Cette mesure confirme la quantité effectivement reçue lorsque le ventilateur ne la garantit plus.'},
        ],
      },
      {
        newInformation:'Le mode pression contrôlée à volume garanti est sélectionné avec la même cible de volume courant.',
        enonce:'Le mode pression contrôlée à volume garanti est sélectionné avec la même cible de volume courant. Quel résultat fonctionnel recherche-t-on ?',format:'qcm',sourceBlocks:['b00159','b00168','b00171'],
        correction_generale:'Le mode hybride ajuste la pression d’insufflation pour atteindre le volume choisi avec la pression efficace la plus basse possible.',
        items:[
          {lettre:'A',enonce:'Atteindre le volume courant cible malgré les variations de mécanique respiratoire.',is_correct:true,justification:'L’algorithme adapte la pression nécessaire pour conserver la quantité de gaz programmée.'},
          {lettre:'B',enonce:'Employer la pression d’insufflation minimale compatible avec cette cible.',is_correct:true,justification:'Le réglage recherche un compromis entre prévention de l’hypoventilation et limitation des pressions.'},
          {lettre:'C',enonce:'Maintenir une pression identique même si la compliance se modifie.',is_correct:false,justification:'Une pression figée empêcherait précisément l’adaptation requise pour garantir le volume.'},
          {lettre:'D',enonce:'Supprimer toute possibilité de barotraumatisme sans besoin de monitorage.',is_correct:false,justification:'La limitation recherchée réduit le risque mais ne dispense jamais de surveiller pressions et volumes.'},
          {lettre:'E',enonce:'Éviter le petit volume courant obtenu sous une pression cible insuffisante.',is_correct:true,justification:'La garantie volumique corrige la principale limite observée lors de l’étape précédente.'},
        ],
      },
      {
        newInformation:'Une PEP est ajoutée afin de maintenir le volume pulmonaire téléexpiratoire.',
        enonce:'Une PEP est ajoutée afin de maintenir le volume pulmonaire téléexpiratoire. Quelles affirmations décrivent son rôle ?',format:'qcm',sourceBlocks:['b00166','b00167','b00169','b00170'],
        correction_generale:'La PEP conserve une pression positive à la fin de l’expiration, maintient le volume téléexpiratoire et réduit le risque d’atélectasie.',
        items:[
          {lettre:'A',enonce:'Elle maintient une pression positive lorsque l’expiration se termine.',is_correct:true,justification:'La pression ne revient pas entièrement au niveau de base à la fin du cycle expiratoire.'},
          {lettre:'B',enonce:'Elle contribue à prévenir la fermeture alvéolaire et l’atélectasie.',is_correct:true,justification:'Le maintien du volume pulmonaire téléexpiratoire limite le collapsus des unités ventilées.'},
          {lettre:'C',enonce:'Elle fixe à elle seule le volume courant inspiré.',is_correct:false,justification:'Le volume dépend du mode et de sa cible, tandis que la PEP agit sur la fin d’expiration.'},
          {lettre:'D',enonce:'Elle remplace le réglage de la fréquence respiratoire.',is_correct:false,justification:'La pression téléexpiratoire ne détermine ni le nombre de cycles ni la ventilation minute.'},
          {lettre:'E',enonce:'Son objectif est de préserver un volume pulmonaire en fin de cycle.',is_correct:true,justification:'Cette réserve téléexpiratoire constitue le mécanisme explicite de prévention de l’atélectasie.'},
        ],
      },
      {
        newInformation:'Le test de compliance révèle qu’une partie du volume dilate la tubulure avant d’atteindre le patient.',
        enonce:'Le test de compliance révèle qu’une partie du volume dilate la tubulure avant d’atteindre le patient. Comment l’appareil prend-il en compte cette perte ?',format:'qcm',sourceBlocks:['b00135','b00158'],
        correction_generale:'Le logiciel mesure la compliance du circuit puis ajoute le volume absorbé par la dilatation afin que le patient reçoive la cible programmée.',
        items:[
          {lettre:'A',enonce:'La dilatation de la tubulure peut retenir une fraction du volume insufflé.',is_correct:true,justification:'Un circuit compliant se distend avant que tout le gaz programmé n’atteigne les voies aériennes.'},
          {lettre:'B',enonce:'Le logiciel compense cette fraction pour délivrer le volume désiré au patient.',is_correct:true,justification:'La correction ajoute ce qui serait autrement perdu dans l’espace compressible du montage.'},
          {lettre:'C',enonce:'Cette compensation rend inutile la mesure du volume expiré.',is_correct:false,justification:'La mesure reste nécessaire pour vérifier que le résultat réel correspond au réglage calculé.'},
          {lettre:'D',enonce:'La perte prouve l’existence d’une déconnexion ouverte du circuit.',is_correct:false,justification:'Une compliance élastique absorbe temporairement un volume sans constituer une fuite vers l’extérieur.'},
          {lettre:'E',enonce:'L’effet relatif devient important lorsque le volume courant demandé est faible.',is_correct:true,justification:'Une même dilatation représente une proportion plus grande d’un petit volume administré.'},
        ],
      },
      {
        newInformation:'Le temps inspiratoire est allongé et laisse désormais un temps expiratoire très court.',
        enonce:'Le temps inspiratoire est allongé et laisse désormais un temps expiratoire très court. Quelle analyse ventilatoire est correcte ?',format:'qcm',sourceBlocks:['b00164','b00165','b00166','b00167'],
        correction_generale:'Allonger l’inspiration peut améliorer la distribution gazeuse, mais raccourcir excessivement l’expiration expose à une vidange incomplète et à l’hyperinflation.',
        items:[
          {lettre:'A',enonce:'Un temps inspiratoire prolongé peut favoriser une distribution plus homogène du volume.',is_correct:true,justification:'Le remplissage dispose de davantage de temps dans les unités pulmonaires aux constantes variables.'},
          {lettre:'B',enonce:'Un temps expiratoire trop bref peut empêcher une vidange complète.',is_correct:true,justification:'Le cycle suivant débute alors qu’une partie du volume du cycle précédent reste emprisonnée.'},
          {lettre:'C',enonce:'La conséquence dynamique redoutée est une hyperinflation.',is_correct:true,justification:'L’accumulation répétée de gaz augmente progressivement le volume pulmonaire de fin d’expiration.'},
          {lettre:'D',enonce:'Un ratio inversé garantit l’absence de rétention gazeuse.',is_correct:false,justification:'La réduction de la phase expiratoire est précisément le mécanisme susceptible de la produire.'},
          {lettre:'E',enonce:'Le rapport inspiration-expiration n’a aucun lien avec le débit inspiratoire de pointe.',is_correct:false,justification:'La variation du débit inspiratoire modifie la durée d’insufflation et donc le rapport des deux phases.'},
        ],
      },
      {
        newInformation:'À l’émergence, le patient déclenche ses cycles mais lutte contre la résistance de la tubulure.',
        enonce:'À l’émergence, le patient déclenche ses cycles mais lutte contre la résistance de la tubulure. Quel apport de l’aide inspiratoire est attendu ?',format:'qcm',sourceBlocks:['b00162','b00163','b00164','b00165','b00175'],
        correction_generale:'L’aide inspiratoire fournit une pression déclenchée par l’effort du patient pour compenser la résistance du circuit, puis cesse lorsque le débit décroît.',
        items:[
          {lettre:'A',enonce:'Une pression positive accompagne l’inspiration spontanée déclenchée par le patient.',is_correct:true,justification:'L’assistance s’ajoute à son effort après détection d’un seuil de débit ou de pression.'},
          {lettre:'B',enonce:'Le travail imposé par le frottement de l’air dans la tubulure diminue.',is_correct:true,justification:'La pression aidante compense la résistance que le patient devrait autrement vaincre seul.'},
          {lettre:'C',enonce:'Chaque cycle impose obligatoirement un volume courant fixé par le ventilateur.',is_correct:false,justification:'L’aide inspiratoire accompagne une respiration spontanée sans nécessairement déclencher une cible volumique.'},
          {lettre:'D',enonce:'L’assistance cesse lorsque le débit inspiratoire tombe au quart de sa valeur maximale.',is_correct:true,justification:'Ce critère de cyclage libère l’expiration après la décroissance du flux inspiratoire.'},
          {lettre:'E',enonce:'Le mode abolit la nécessité d’un effort inspiratoire initial.',is_correct:false,justification:'Le patient doit franchir le seuil de déclenchement avant de recevoir la pression d’assistance.'},
        ],
      },
    ],
  },
  {
    label:'DP QCM 5 · Erreur de vaporisateur évitée',
    vignette:'Une patiente de 39 ans doit recevoir une anesthésie inhalatoire. L’appareil comporte un vaporisateur de sévoflurane à plénum et une cuve de desflurane chauffée. Lors de la vérification, l’interne contrôle les clés de remplissage, l’enclenchement des cuves et l’analyse des gaz. Le bloc est situé en altitude. La stratégie doit assurer une pression partielle anesthésique stable sans permettre l’administration simultanée de deux agents.',
    allowed_voies:['interne'],
    questions:[
      {
        enonce:'Quelles propriétés justifient l’emploi de technologies différentes pour le sévoflurane et le desflurane ?',format:'qcm',sourceBlocks:['b00080','b00082','b00083','b00084','b00085','b00087','b00092'],
        correction_generale:'Les propriétés de vapeur propres à chaque agent imposent une cuve dédiée : plénum compensé pour le sévoflurane, mélangeur chauffé pour le desflurane.',
        items:[
          {lettre:'A',enonce:'Chaque agent possède une pression de vapeur saturante et une température d’ébullition propres.',is_correct:true,justification:'Ces paramètres déterminent la facilité d’évaporation et la concentration produite dans la cuve.'},
          {lettre:'B',enonce:'Le sévoflurane peut être administré par un plénum à bypass variable.',is_correct:true,justification:'Une fraction du gaz frais traverse la chambre et se charge passivement en vapeur de sévoflurane.'},
          {lettre:'C',enonce:'Le desflurane est adapté à un plénum mécanique standard non chauffé.',is_correct:false,justification:'Son point d’ébullition bas rend la pression de vapeur trop sensible aux petites variations thermiques.'},
          {lettre:'D',enonce:'La cuve doit être spécifique de l’agent afin d’éviter une concentration imprévisible.',is_correct:true,justification:'Les réglages sont calibrés sur les caractéristiques physiques d’un seul liquide anesthésique.'},
          {lettre:'E',enonce:'Les deux liquides peuvent partager la même clé de remplissage sans risque.',is_correct:false,justification:'Des clés normalisées distinctes préviennent précisément les substitutions lors du remplissage.'},
        ],
      },
      {
        newInformation:'Le sévoflurane refroidit sa cuve pendant l’évaporation alors que la concentration réglée doit rester stable.',
        enonce:'Le sévoflurane refroidit sa cuve pendant l’évaporation alors que la concentration réglée doit rester stable. Comment le plénum compense-t-il ce phénomène ?',format:'qcm',sourceBlocks:['b00082','b00084','b00085','b00086'],
        correction_generale:'Le plénum compense mécaniquement le refroidissement en modifiant la répartition du gaz entre la chambre de vaporisation et le bypass.',
        items:[
          {lettre:'A',enonce:'L’évaporation prélève de la chaleur et diminue la température du liquide.',is_correct:true,justification:'Cette perte thermique abaisserait la pression de vapeur si aucun correcteur n’intervenait.'},
          {lettre:'B',enonce:'Des lamelles métalliques ou un soufflet anéroïde modifient le bypass.',is_correct:true,justification:'Leur déformation thermique ajuste mécaniquement la fraction de gaz exposée à l’agent.'},
          {lettre:'C',enonce:'Quand la cuve refroidit, le dispositif augmente le passage direct hors de la chambre.',is_correct:false,justification:'Il doit au contraire réduire le bypass pour envoyer davantage de gaz vers la vaporisation.'},
          {lettre:'D',enonce:'Une alimentation électrique est indispensable au plénum classique.',is_correct:false,justification:'La compensation usuelle repose sur des éléments mécaniques sensibles à la température.'},
          {lettre:'E',enonce:'La correction vise à stabiliser la concentration malgré la variation thermique.',is_correct:true,justification:'Elle contrebalance la diminution spontanée de vapeur produite lorsque le liquide se refroidit.'},
        ],
      },
      {
        newInformation:'La cuve de desflurane est chaude au toucher et son alimentation électrique est active.',
        enonce:'La cuve de desflurane est chaude au toucher et son alimentation électrique est active. Pourquoi ce fonctionnement est-il attendu ?',format:'qcm',sourceBlocks:['b00087','b00090','b00091','b00092','b00194'],
        correction_generale:'Le desflurane est chauffé et thermostaté car son point d’ébullition proche de l’ambiante rend sa pression de vapeur très sensible à la température.',
        items:[
          {lettre:'A',enonce:'Le point d’ébullition du desflurane est proche de la température ambiante.',is_correct:true,justification:'À proximité de 22,8 °C, une faible variation thermique modifie fortement sa pression de vapeur.'},
          {lettre:'B',enonce:'La thermostatisation stabilise les conditions de dosage de l’agent.',is_correct:true,justification:'Le chauffage contrôlé évite que la concentration fluctue au gré des changements de température.'},
          {lettre:'C',enonce:'La chaleur témoigne nécessairement d’une panne dangereuse de la cuve.',is_correct:false,justification:'Elle correspond au fonctionnement normal du mélangeur pressurisé destiné au desflurane.'},
          {lettre:'D',enonce:'Le dispositif mesure les débits avant d’ajouter la quantité requise de vapeur.',is_correct:true,justification:'Le mélangeur intègre la demande du clinicien et les flots gazeux pour doser l’agent.'},
          {lettre:'E',enonce:'La cuve chaude peut fonctionner avec n’importe quel halogéné liquide.',is_correct:false,justification:'Son étalonnage et son système de remplissage restent propres au desflurane.'},
        ],
      },
      {
        newInformation:'La pression atmosphérique du bloc est plus basse que celle mesurée au niveau de la mer.',
        enonce:'La pression atmosphérique du bloc est plus basse que celle mesurée au niveau de la mer. Comment l’altitude influence-t-elle les deux vaporisateurs ?',format:'qcm',sourceBlocks:['b00084','b00086','b00094'],
        correction_generale:'En altitude, le plénum délivre un pourcentage plus élevé mais une pression partielle stable ; le mélangeur pressurisé conserve son pourcentage et fournit une pression partielle moindre.',
        items:[
          {lettre:'A',enonce:'La pression de vapeur saturante du sévoflurane ne dépend pas de la pression atmosphérique.',is_correct:true,justification:'À température identique, cette propriété du liquide reste la même malgré l’altitude.'},
          {lettre:'B',enonce:'Le plénum peut afficher une proportion volumique plus élevée en atmosphère moins pressurisée.',is_correct:true,justification:'La même pression de vapeur représente une fraction plus grande d’une pression totale plus faible.'},
          {lettre:'C',enonce:'La pression partielle de sévoflurane délivrée par le plénum reste globalement inchangée.',is_correct:true,justification:'L’augmentation du pourcentage compense la diminution de la pression atmosphérique ambiante.'},
          {lettre:'D',enonce:'Le mélangeur de desflurane voit son pourcentage augmenter spontanément avec l’altitude.',is_correct:false,justification:'Sa cuve pressurisée et thermostatée maintient le pourcentage programmé indépendamment de l’ambiance.'},
          {lettre:'E',enonce:'Une hausse du réglage du mélangeur peut être nécessaire pour préserver la pression partielle.',is_correct:true,justification:'À pourcentage constant sous une pression totale moindre, la pression partielle anesthésique diminue.'},
        ],
      },
      {
        newInformation:'L’interne tente d’ouvrir une deuxième cuve et le mécanisme bloque immédiatement sa commande.',
        enonce:'L’interne tente d’ouvrir une deuxième cuve et le mécanisme bloque immédiatement sa commande. Quelle fonction de sécurité est démontrée ?',format:'qcm',sourceBlocks:['b00101','b00102','b00103','b00105','b00106'],
        correction_generale:'Le système d’enclenchement interdit l’ouverture simultanée de deux vaporisateurs et prévient l’addition non maîtrisée de leurs concentrations.',
        items:[
          {lettre:'A',enonce:'Une tige mécanique peut verrouiller les commandes des cuves voisines.',is_correct:true,justification:'L’activation d’un vaporisateur déplace l’élément qui empêche l’ouverture des autres.'},
          {lettre:'B',enonce:'Le blocage protège contre l’administration concomitante de deux agents.',is_correct:true,justification:'Le mélange de deux sorties rendrait la profondeur anesthésique difficile à prévoir.'},
          {lettre:'C',enonce:'Cette fonction remplace les clés spécifiques de remplissage.',is_correct:false,justification:'L’enclenchement et les clés préviennent deux erreurs différentes, utilisation multiple et substitution de liquide.'},
          {lettre:'D',enonce:'Une cassette unique intégrée au circuit répond au même objectif.',is_correct:true,justification:'La présence physique d’une seule cassette disponible interdit également deux administrations simultanées.'},
          {lettre:'E',enonce:'Le mécanisme ajuste automatiquement la fraction inspirée d’oxygène.',is_correct:false,justification:'Il agit sur les commandes des agents volatils et non sur le mélange oxygène-protoxyde.'},
        ],
      },
      {
        newInformation:'Pendant l’inspiration, une rétropression ventilatoire se transmet vers le vaporisateur.',
        enonce:'Pendant l’inspiration, une rétropression ventilatoire se transmet vers le vaporisateur. Quel effet transitoire faut-il reconnaître ?',format:'qcm',sourceBlocks:['b00095','b00096','b00097','b00099','b00100'],
        correction_generale:'La rétropression peut charger le bypass en vapeur puis majorer brièvement la concentration à l’inspiration suivante : c’est l’effet de pompage.',
        items:[
          {lettre:'A',enonce:'La pression positive peut remonter depuis le ventilateur vers la partie basse pression.',is_correct:true,justification:'La transmission rétrograde survient de manière intermittente pendant la phase inspiratoire.'},
          {lettre:'B',enonce:'La vapeur peut être repoussée de la chambre de vaporisation vers le bypass.',is_correct:true,justification:'La chambre la moins résistante reçoit davantage de pression et contamine le trajet normalement direct.'},
          {lettre:'C',enonce:'La concentration délivrée au cycle suivant peut augmenter transitoirement.',is_correct:true,justification:'Le gaz accumulé dans le bypass rejoint ensuite la sortie avec une charge volatile supplémentaire.'},
          {lettre:'D',enonce:'Cet effet diminue toujours la dose d’agent inhalé.',is_correct:false,justification:'Le phénomène décrit est au contraire un accroissement intermittent du pourcentage en sortie.'},
          {lettre:'E',enonce:'Les vaporisateurs modernes comportent habituellement une compensation de ce pompage.',is_correct:true,justification:'Leur architecture limite la variation de concentration provoquée par la pression rétroactive.'},
        ],
      },
      {
        newInformation:'La fraction expirée cible est ensuite maintenue automatiquement avec un très bas débit de gaz frais.',
        enonce:'La fraction expirée cible est ensuite maintenue automatiquement avec un très bas débit de gaz frais. Quels bénéfices et contrôles associer à cette stratégie ?',format:'qcm',sourceBlocks:['b00139','b00145','b00177','b00182','b00186'],
        correction_generale:'La boucle ajuste la vaporisation à la fraction expirée cible et réduit coûts et rejets, tout en exigeant l’analyse continue des gaz et un absorbeur compatible.',
        items:[
          {lettre:'A',enonce:'La fraction expirée constitue un indicateur utile de la concentration anesthésique cérébrale après équilibre.',is_correct:true,justification:'Elle reflète assez fidèlement la proportion sanguine puis cérébrale de l’agent inhalé.'},
          {lettre:'B',enonce:'La rétroaction électronique adapte le vaporisateur aux mesures réalisées dans le circuit.',is_correct:true,justification:'L’appareil combine fraction expirée et débit frais pour rejoindre la cible avec peu de variations.'},
          {lettre:'C',enonce:'La diminution du débit réduit la consommation et les émissions d’halogénés.',is_correct:true,justification:'Une plus grande part du mélange reste dans le cercle au lieu de rejoindre l’antipollution.'},
          {lettre:'D',enonce:'L’automatisation dispense de mesurer l’oxygène et les concentrations inspirées.',is_correct:false,justification:'La sécurité du très bas débit repose au contraire sur l’analyse précise et continue de la composition gazeuse.'},
          {lettre:'E',enonce:'Le choix d’un absorbeur pauvre en bases fortes facilite l’emploi du sévoflurane à bas débit.',is_correct:true,justification:'La réduction du KOH et du NaOH limite la formation de produits de dégradation indésirables.'},
        ],
      },
    ],
  },
  {
    label:'DP QCM 6 · Soufflet trompeur et déconnexion',
    vignette:'Un homme de 72 ans est ventilé avec un appareil ancien à soufflet descendant. Peu après un changement de position, le volume expiré diminue alors que le soufflet poursuit son mouvement. La saturation est encore normale. L’équipe suspecte une déconnexion, compare ce comportement à celui d’un soufflet ascendant et d’un piston électrique, puis prépare immédiatement une ventilation manuelle indépendante.',
    allowed_voies:['interne'],
    questions:[
      {
        enonce:'Pourquoi le mouvement d’un soufflet descendant ne permet-il pas d’exclure une déconnexion ?',format:'qcm',sourceBlocks:['b00146','b00147','b00150','b00151','b00158'],
        correction_generale:'Le poids du soufflet descendant peut entretenir sa course malgré une fuite ; seul le volume réellement expiré et les alarmes renseignent sur la ventilation du patient.',
        items:[
          {lettre:'A',enonce:'Le poids propre du soufflet peut prolonger son déplacement sans charge patient.',is_correct:true,justification:'La gravité suffit à produire un mouvement visuel même lorsque le circuit distal est ouvert.'},
          {lettre:'B',enonce:'La course mécanique garantit que le volume réglé atteint les poumons.',is_correct:false,justification:'Elle décrit le déplacement de l’organe moteur, pas le volume réellement reçu par le patient.'},
          {lettre:'C',enonce:'Le volume expiré mesuré est plus discriminant que l’observation du soufflet.',is_correct:true,justification:'Une diminution du retour gazeux révèle directement la perte sur le trajet patient.'},
          {lettre:'D',enonce:'L’aspiration d’air extérieur peut abaisser la fraction d’oxygène administrée.',is_correct:true,justification:'Le soufflet descendant peut continuer à fonctionner en incorporant de l’air par la déconnexion.'},
          {lettre:'E',enonce:'Ce comportement rend le soufflet descendant plus sûr que le modèle ascendant.',is_correct:false,justification:'La persistance trompeuse de son mouvement retarde au contraire l’identification de la fuite.'},
        ],
      },
      {
        newInformation:'La branche patient est retrouvée désadaptée alors que le soufflet descend encore sous son poids.',
        enonce:'La branche patient est retrouvée désadaptée alors que le soufflet descend encore sous son poids. Quelle lecture de sécurité s’impose ?',format:'qcm',sourceBlocks:['b00151','b00158'],
        correction_generale:'La déconnexion confirme que le mouvement du soufflet était un faux signe de ventilation ; il faut reconnecter ou ventiler indépendamment et vérifier le volume expiré.',
        items:[
          {lettre:'A',enonce:'Le mouvement observé constitue un faux indicateur d’insufflation pulmonaire.',is_correct:true,justification:'Le soufflet se déplaçait sous l’effet de son poids sans circuit fermé vers le patient.'},
          {lettre:'B',enonce:'La reconnexion doit être suivie d’un contrôle des volumes inspiré et expiré.',is_correct:true,justification:'Le retour de mesures cohérentes confirme que l’étanchéité et la délivrance sont restaurées.'},
          {lettre:'C',enonce:'La saturation encore normale autorise à différer la correction de la fuite.',is_correct:false,justification:'Le délai de désaturation ne garantit pas la ventilation et ne doit jamais retarder l’action.'},
          {lettre:'D',enonce:'Une ventilation de secours indépendante doit rester immédiatement disponible.',is_correct:true,justification:'Elle permet d’oxygéner sans dépendre du ventilateur ou du circuit actuellement défaillant.'},
          {lettre:'E',enonce:'Le soufflet peut continuer seul jusqu’à assurer une ventilation minute suffisante.',is_correct:false,justification:'Sa course ne transmet aucun volume utile lorsque la branche patient est ouverte.'},
        ],
      },
      {
        newInformation:'Sur un appareil à soufflet ascendant, la même fuite aurait rapidement vidé le soufflet.',
        enonce:'Sur un appareil à soufflet ascendant, la même fuite aurait rapidement vidé le soufflet. Quel avantage apporte ce comportement ?',format:'qcm',sourceBlocks:['b00150','b00151','b00152','b00158'],
        correction_generale:'Le soufflet ascendant s’effondre dès la déconnexion et déclenche rapidement l’alarme, rendant la perte de circuit plus visible.',
        items:[
          {lettre:'A',enonce:'La fuite empêche le soufflet de remonter normalement pendant l’expiration.',is_correct:true,justification:'Le retour gazeux insuffisant ne remplit plus l’enceinte mobile comme lors d’un cycle intact.'},
          {lettre:'B',enonce:'La disparition rapide de la course fournit un signe visuel précoce.',is_correct:true,justification:'L’arrêt du mouvement attendu attire l’attention avant qu’une hypoxémie profonde ne s’installe.'},
          {lettre:'C',enonce:'L’alarme de déconnexion est déclenchée plus facilement.',is_correct:true,justification:'La vidange immédiate s’accompagne d’une perte de volume ou de pression détectable par l’appareil.'},
          {lettre:'D',enonce:'Le soufflet ascendant empêche physiquement toute désadaptation de tubulure.',is_correct:false,justification:'Il révèle plus sûrement la fuite mais ne verrouille pas les raccords du circuit patient.'},
          {lettre:'E',enonce:'La gravité maintient sa ventilation même lorsqu’il est vide.',is_correct:false,justification:'Ce défaut trompeur est justement celui du soufflet descendant, pas du modèle ascendant.'},
        ],
      },
      {
        newInformation:'La saturation commence à décroître et le ballon indépendant est raccordé à une source d’oxygène.',
        enonce:'La saturation commence à décroître et le ballon indépendant est raccordé à une source d’oxygène. Quelles priorités guident la prise en charge ?',format:'qcm',sourceBlocks:['b00003','b00009','b00010','b00029','b00149'],
        correction_generale:'La priorité est de rétablir immédiatement une oxygénation et une ventilation efficaces par un système indépendant, puis de corriger la panne avant reprise.',
        items:[
          {lettre:'A',enonce:'Ventiler manuellement avec de l’oxygène en vérifiant le soulèvement thoracique.',is_correct:true,justification:'Cette action dissocie la survie du patient du fonctionnement incertain de l’appareil.'},
          {lettre:'B',enonce:'Attendre l’alarme de pression avant de changer de moyen ventilatoire.',is_correct:false,justification:'La baisse de saturation et la déconnexion identifiée imposent une réponse immédiate.'},
          {lettre:'C',enonce:'Contrôler la capnographie et l’oxymétrie pendant la ventilation de secours.',is_correct:true,justification:'Ces mesures confirment l’échange gazeux obtenu par le nouveau dispositif.'},
          {lettre:'D',enonce:'Inspecter et reconnecter la tubulure sans interrompre l’oxygénation manuelle.',is_correct:true,justification:'Le dépannage technique progresse en parallèle tant que la ventilation reste assurée.'},
          {lettre:'E',enonce:'Réutiliser automatiquement le ventilateur dès que le soufflet recommence à bouger.',is_correct:false,justification:'La reprise ne se décide qu’après vérification de l’étanchéité et des volumes réellement délivrés.'},
        ],
      },
      {
        newInformation:'Après reconnexion, le volume réglé dépasse encore légèrement le volume expiré mesuré.',
        enonce:'Après reconnexion, le volume réglé dépasse encore légèrement le volume expiré mesuré. Quel rôle joue la compliance du circuit ?',format:'qcm',sourceBlocks:['b00135','b00158'],
        correction_generale:'La tubulure se dilate sous pression et retient une partie du volume ; une mesure de compliance permet au logiciel de compenser cette différence.',
        items:[
          {lettre:'A',enonce:'Une tubulure compliant absorbe un volume lors de sa mise en pression.',is_correct:true,justification:'Le gaz sert d’abord à distendre le circuit avant que la totalité n’atteigne les voies aériennes.'},
          {lettre:'B',enonce:'Cette perte élastique équivaut toujours à une fuite vers l’atmosphère.',is_correct:false,justification:'Le volume reste contenu dans le montage et peut revenir à la décompression.'},
          {lettre:'C',enonce:'Le logiciel peut ajouter le volume calculé comme retenu par le circuit.',is_correct:true,justification:'La compensation vise à rapprocher le volume patient de la valeur programmée.'},
          {lettre:'D',enonce:'La correction doit être vérifiée par la mesure du volume expiré.',is_correct:true,justification:'Le résultat clinique reste contrôlé en aval malgré l’estimation automatisée de la compliance.'},
          {lettre:'E',enonce:'La compliance n’influence que les circuits adultes de grand diamètre.',is_correct:false,justification:'Son effet proportionnel est particulièrement important pour les petits volumes courants.'},
        ],
      },
      {
        newInformation:'Un appareil à piston électrique est installé pour la suite de l’intervention.',
        enonce:'Un appareil à piston électrique est installé pour la suite de l’intervention. Quelles différences de motorisation faut-il attendre ?',format:'qcm',sourceBlocks:['b00149','b00150','b00151','b00156','b00157','b00158'],
        correction_generale:'Le piston déplace directement le gaz dans un circuit unique grâce à une motorisation électrique, sans consommer d’oxygène comme force motrice.',
        items:[
          {lettre:'A',enonce:'Une vis motorisée électriquement entraîne la pièce mobile.',is_correct:true,justification:'Le piston se déplace dans son tube grâce à cette commande mécanique alimentée en électricité.'},
          {lettre:'B',enonce:'Le ventilateur possède un circuit unique sans soufflet séparé du gaz moteur.',is_correct:true,justification:'Le piston transmet directement la pression au volume destiné au patient.'},
          {lettre:'C',enonce:'De hauts volumes d’oxygène sont nécessaires pour comprimer un soufflet à chaque cycle.',is_correct:false,justification:'Cette consommation concerne la motorisation pneumatique à double circuit.'},
          {lettre:'D',enonce:'Le volume inspiratoire est moins influencé par le débit de gaz frais.',is_correct:true,justification:'Le déplacement programmé du piston gouverne directement le volume envoyé.'},
          {lettre:'E',enonce:'La présence d’un piston supprime tout besoin d’alarmes de déconnexion.',is_correct:false,justification:'Une fuite côté patient reste possible quelle que soit la technologie motrice.'},
        ],
      },
      {
        newInformation:'La mécanique pulmonaire se dégrade ensuite et le volume courant baisse sous pression contrôlée.',
        enonce:'La mécanique pulmonaire se dégrade ensuite et le volume courant baisse sous pression contrôlée. Comment adapter le raisonnement ventilatoire ?',format:'qcm',sourceBlocks:['b00158','b00168','b00169','b00170','b00171'],
        correction_generale:'Sous pression contrôlée, la baisse de compliance réduit le volume ; il faut réévaluer la cause, surveiller le volume expiré et ajuster la stratégie sans excès de pression.',
        items:[
          {lettre:'A',enonce:'La pression cible peut être atteinte avec un volume plus faible lorsque la compliance diminue.',is_correct:true,justification:'Le système respiratoire oppose davantage de contrainte pour une même limite d’insufflation.'},
          {lettre:'B',enonce:'Le maintien d’une pression identique garantit la ventilation minute.',is_correct:false,justification:'Le volume de chaque cycle varie avec la mécanique et peut devenir insuffisant.'},
          {lettre:'C',enonce:'La mesure du volume expiré permet de quantifier la conséquence du changement.',is_correct:true,justification:'Elle renseigne sur la quantité effectivement ventilée sous la nouvelle compliance.'},
          {lettre:'D',enonce:'Un mode à volume garanti peut rechercher la cible avec la pression minimale efficace.',is_correct:true,justification:'Cette option hybride adapte l’insufflation tout en évitant un petit volume persistant.'},
          {lettre:'E',enonce:'Augmenter sans limite la pression est la réponse obligatoire.',is_correct:false,justification:'La protection pulmonaire exige d’identifier la cause et de contrôler le risque de barotraumatisme.'},
        ],
      },
    ],
  },
  {
    label:'DP QCM 7 · Aspiration antipollution excessive',
    vignette:'Une femme de 61 ans est anesthésiée au sévoflurane sur circuit cercle. Peu après le raccordement du système antipollution actif, le ballon réservoir s’affaisse et le circuit semble aspiré. La ventilation devient difficile sans fuite visible côté patient. Le réseau d’aspiration des liquides est simultanément très sollicité. L’anesthésiste examine l’interface entre le circuit, le réservoir tampon et les soupapes de protection.',
    allowed_voies:['interne'],
    questions:[
      {
        enonce:'Quels rôles du système antipollution doivent être assurés sans perturber le circuit du patient ?',format:'qcm',sourceBlocks:['b00003','b00155','b00180','b00181','b00182'],
        correction_generale:'Le système recueille et évacue les gaz anesthésiques excédentaires tout en isolant le circuit patient des variations de pression de l’aspiration.',
        items:[
          {lettre:'A',enonce:'Acheminer hors de la salle les gaz qui dépassent les besoins du patient.',is_correct:true,justification:'Cette évacuation limite l’exposition professionnelle aux agents volatils rejetés.'},
          {lettre:'B',enonce:'Maintenir une interface qui amortit la force de l’aspiration centrale.',is_correct:true,justification:'Le réservoir et les soupapes empêchent que la dépression ne vide directement le cercle.'},
          {lettre:'C',enonce:'Aspirer en permanence le volume courant à travers la pièce en Y.',is_correct:false,justification:'Le système ne doit recevoir que les gaz excédentaires après leur sortie du circuit respiratoire.'},
          {lettre:'D',enonce:'Évacuer les volumes chassés par la valve de trop-plein du ventilateur.',is_correct:true,justification:'Ces gaz inutilisés contiennent des anesthésiques et rejoignent la ligne antipollution.'},
          {lettre:'E',enonce:'Remplacer l’absorbeur de CO₂ du circuit cercle.',is_correct:false,justification:'L’antipollution traite les rejets, tandis que la chaux permet la réinspiration sans dioxyde de carbone.'},
        ],
      },
      {
        newInformation:'Le réservoir tampon est vidé trop rapidement par l’aspiration centralisée.',
        enonce:'Le réservoir tampon est vidé trop rapidement par l’aspiration centralisée. Quelle protection doit limiter cet effet ?',format:'qcm',sourceBlocks:['b00182'],
        correction_generale:'L’interface à deux soupapes ajuste la dépression, admet du gaz si l’aspiration est excessive et empêche la vidange du circuit filtre.',
        items:[
          {lettre:'A',enonce:'Une soupape doit limiter la transmission d’une dépression excessive au circuit.',is_correct:true,justification:'Elle découple la force aspiratoire du réseau du volume gazeux disponible pour ventiler.'},
          {lettre:'B',enonce:'Le réservoir témoin doit amortir les variations de débit d’aspiration.',is_correct:true,justification:'Sa capacité tampon évite que chaque fluctuation centrale atteigne immédiatement le patient.'},
          {lettre:'C',enonce:'Fermer complètement toutes les soupapes constitue le réglage normal.',is_correct:false,justification:'Cette fermeture empêcherait l’équilibrage et pourrait transmettre surpression ou dépression.'},
          {lettre:'D',enonce:'Les deux valves de l’interface protègent aussi contre une pression excessive.',is_correct:true,justification:'Leur jeu permet de maintenir la pression du système dans les limites compatibles avec le cercle.'},
          {lettre:'E',enonce:'Augmenter le débit frais corrige définitivement le défaut de protection.',is_correct:false,justification:'Un apport supplémentaire peut masquer la perte sans réparer le couplage aspiratoire anormal.'},
        ],
      },
      {
        newInformation:'La dépression se transmet au ballon manuel et réduit le volume disponible pour ventiler.',
        enonce:'La dépression se transmet au ballon manuel et réduit le volume disponible pour ventiler. Quel défaut fonctionnel est le plus probable ?',format:'qcm',sourceBlocks:['b00109','b00155','b00182'],
        correction_generale:'La transmission au ballon indique une interface défaillante ou mal réglée, qui ne sépare plus l’aspiration active du circuit respiratoire.',
        items:[
          {lettre:'A',enonce:'La soupape de protection contre la dépression ne joue plus son rôle.',is_correct:true,justification:'L’aspiration devrait être compensée avant d’atteindre le réservoir respiratoire.'},
          {lettre:'B',enonce:'Le réglage aspiratoire dépasse la capacité d’équilibrage de l’interface.',is_correct:true,justification:'Une force trop élevée vide le tampon plus vite que les soupapes ne peuvent le stabiliser.'},
          {lettre:'C',enonce:'La chaux sodée est arrivée à saturation.',is_correct:false,justification:'L’épuisement chimique produit une réinspiration de CO₂ mais n’affaisse pas le ballon.'},
          {lettre:'D',enonce:'Le circuit patient doit être temporairement dissocié de cette aspiration.',is_correct:true,justification:'Cette action restaure un réservoir ventilatoire en attendant le réglage de l’antipollution.'},
          {lettre:'E',enonce:'Une valve unidirectionnelle expiratoire bloquée ouverte explique seule la dépression.',is_correct:false,justification:'Elle favorise le reflux gazeux, sans créer la force aspiratoire extérieure observée ici.'},
        ],
      },
      {
        newInformation:'Le raccord à l’aspiration des liquides est fermé tandis que les gaz anesthésiques restent évacués sur une ligne distincte.',
        enonce:'Le raccord à l’aspiration des liquides est fermé tandis que les gaz anesthésiques restent évacués sur une ligne distincte. Pourquoi séparer les deux réseaux ?',format:'qcm',sourceBlocks:['b00182','b00183','b00184'],
        correction_generale:'Une ligne dédiée aux gaz volatils évite les fluctuations liées à l’aspiration chirurgicale et protège le réseau central des effets des agents anesthésiques.',
        items:[
          {lettre:'A',enonce:'L’utilisation intensive de la succion des liquides peut faire varier la dépression disponible.',is_correct:true,justification:'Les appels intermittents sur un réseau commun déstabiliseraient l’évacuation des gaz.'},
          {lettre:'B',enonce:'Les agents volatils peuvent endommager une installation prévue pour les liquides biologiques.',is_correct:true,justification:'Leur acheminement parallèle évite une exposition matérielle inadaptée du système central.'},
          {lettre:'C',enonce:'Le réservoir d’aspiration des sécrétions sert principalement à capter le sévoflurane.',is_correct:false,justification:'Il est destiné au sang et aux sécrétions, pas aux effluents gazeux anesthésiques.'},
          {lettre:'D',enonce:'La séparation améliore la stabilité de la force appliquée à l’antipollution.',is_correct:true,justification:'La ligne gazeuse n’est plus soumise aux variations provoquées par les gestes chirurgicaux.'},
          {lettre:'E',enonce:'Les deux conduites doivent communiquer librement près de l’appareil.',is_correct:false,justification:'Une communication réintroduirait précisément les fluctuations et les contaminations recherchées.'},
        ],
      },
      {
        newInformation:'Après diminution de l’aspiration, le réservoir ne s’affaisse plus mais les gaz excédentaires s’y accumulent.',
        enonce:'Après diminution de l’aspiration, le réservoir ne s’affaisse plus mais les gaz excédentaires s’y accumulent. Quel risque opposé faut-il détecter ?',format:'qcm',sourceBlocks:['b00155','b00182'],
        correction_generale:'Une évacuation insuffisante remplit le réservoir et expose à une surpression ou à des fuites d’agents volatils dans la salle.',
        items:[
          {lettre:'A',enonce:'Une soupape de surpression doit pouvoir libérer l’excédent accumulé.',is_correct:true,justification:'Elle protège le circuit lorsque le débit entrant dépasse la capacité réelle d’évacuation.'},
          {lettre:'B',enonce:'Le ballon témoin peut se distendre si le système ne se vide plus.',is_correct:true,justification:'Son augmentation de volume matérialise le déséquilibre entre collecte et aspiration.'},
          {lettre:'C',enonce:'Une fuite de gaz anesthésiques vers l’environnement devient possible.',is_correct:true,justification:'Lorsque le réservoir déborde, les effluents cherchent une autre voie de sortie dans la salle.'},
          {lettre:'D',enonce:'L’accumulation améliore la conservation de l’humidité du patient.',is_correct:false,justification:'Elle siège dans le système d’évacuation et n’apporte aucun bénéfice respiratoire.'},
          {lettre:'E',enonce:'Une aspiration nulle représente le réglage idéal d’un système actif.',is_correct:false,justification:'Sans débit de sortie, les gaz recueillis ne peuvent pas être transportés hors du bloc.'},
        ],
      },
      {
        newInformation:'Le débit de gaz frais est réduit et la fraction expirée est pilotée automatiquement.',
        enonce:'Le débit de gaz frais est réduit et la fraction expirée est pilotée automatiquement. Comment cette stratégie modifie-t-elle les rejets ?',format:'qcm',sourceBlocks:['b00139','b00145','b00177','b00182','b00186'],
        correction_generale:'Le bas débit réutilise davantage le mélange du cercle, réduit le volume excédentaire envoyé à l’antipollution et permet un pilotage plus économe de l’agent.',
        items:[
          {lettre:'A',enonce:'Une plus faible quantité de gaz neuf traverse le circuit avant d’être évacuée.',is_correct:true,justification:'Le renouvellement se rapproche de la consommation réelle du patient au lieu de la dépasser largement.'},
          {lettre:'B',enonce:'La boucle ajuste l’administration volatile à la fraction expirée cible.',is_correct:true,justification:'Elle évite les apports excessifs tout en maintenant la profondeur choisie.'},
          {lettre:'C',enonce:'Les émissions vers l’antipollution et le coût des agents diminuent.',is_correct:true,justification:'Une proportion accrue du mélange est réinspirée après traitement dans le cercle.'},
          {lettre:'D',enonce:'La réduction du débit rend inutile le système antipollution.',is_correct:false,justification:'Des volumes excédentaires persistent et doivent toujours être captés hors de la salle.'},
          {lettre:'E',enonce:'La surveillance des concentrations peut être arrêtée une fois la cible programmée.',is_correct:false,justification:'Le pilotage dépend de mesures continues et ne remplace pas le contrôle de sécurité des gaz.'},
        ],
      },
      {
        newInformation:'Le circuit reste fermé à très bas débit avec un absorbeur humide et des valves unidirectionnelles fonctionnelles.',
        enonce:'Le circuit reste fermé à très bas débit avec un absorbeur humide et des valves unidirectionnelles fonctionnelles. Quelles conditions rendent cette pratique cohérente ?',format:'qcm',sourceBlocks:['b00115','b00135','b00139','b00143','b00145','b00177'],
        correction_generale:'Le cercle fermé exige une chaux active et hydratée, des valves compétentes et une analyse continue des gaz afin de réutiliser le mélange sans CO₂.',
        items:[
          {lettre:'A',enonce:'L’absorbeur doit retirer efficacement le CO₂ avant chaque réinspiration.',is_correct:true,justification:'À très bas débit, l’expulsion par le gaz frais ne peut plus remplacer le traitement chimique.'},
          {lettre:'B',enonce:'Les valves doivent imposer le passage expiratoire à travers la chaux.',is_correct:true,justification:'Une incompétence autoriserait un court-circuit responsable d’hypercapnie.'},
          {lettre:'C',enonce:'L’humidité de l’absorbeur participe aux réactions de neutralisation.',is_correct:true,justification:'L’eau forme l’acide carbonique nécessaire au déroulement initial de l’absorption.'},
          {lettre:'D',enonce:'La composition inspirée peut être déduite des seuls réglages sans analyseur.',is_correct:false,justification:'Le faible apport neuf impose de mesurer oxygène, CO₂ et agent réellement présents.'},
          {lettre:'E',enonce:'Le maintien de la fraction expirée peut être assisté par une boucle de rétroaction.',is_correct:true,justification:'L’automatisation module le vaporisateur à partir des concentrations mesurées dans le cercle.'},
        ],
      },
    ],
  },
  {
    label:'DP QCM 8 · Bouteille de protoxyde presque vide',
    vignette:'Dans une structure isolée, un patient de 33 ans doit être anesthésié alors que le protoxyde d’azote provient d’une bouteille E. La pression est restée stable pendant plusieurs heures et l’équipe veut estimer l’autonomie restante. La bouteille peut être pesée et le débit demandé est de 1 L/min. Une bouteille d’oxygène gazeux est également fixée à l’appareil ; leurs manomètres ne doivent pas être interprétés de la même manière.',
    allowed_voies:['interne'],
    questions:[
      {
        enonce:'Pourquoi une pression stable du protoxyde ne prouve-t-elle pas que la bouteille est pleine ?',format:'qcm',sourceBlocks:['b00029','b00034','b00038','b00040','b00042','b00043','b00044'],
        correction_generale:'Tant que du protoxyde liquide subsiste, sa pression correspond à la pression de vapeur et reste presque constante malgré la diminution du contenu.',
        items:[
          {lettre:'A',enonce:'Le protoxyde est présent sous forme liquide dans une bouteille E pleine.',is_correct:true,justification:'Sa température critique de 36,5 °C permet cette phase aux températures ambiantes usuelles.'},
          {lettre:'B',enonce:'La pression dépend surtout de l’équilibre entre liquide et vapeur tant que les deux coexistent.',is_correct:true,justification:'La consommation évapore du liquide sans faire chuter notablement la pression de vapeur.'},
          {lettre:'C',enonce:'Le manomètre diminue linéairement dès la première minute d’utilisation.',is_correct:false,justification:'Cette relation ne commence qu’après disparition de la dernière fraction liquide.'},
          {lettre:'D',enonce:'Une valeur stable peut être observée alors qu’une grande partie du contenu a déjà été consommée.',is_correct:true,justification:'L’indication barométrique reste sur un plateau pendant toute la phase biphasique.'},
          {lettre:'E',enonce:'La loi de Boyle suffit à calculer le contenu pendant la présence du liquide.',is_correct:false,justification:'Cette loi relie pression et volume pour la phase gazeuse, pas pour une réserve biphasique en équilibre.'},
        ],
      },
      {
        newInformation:'La masse de la bouteille a nettement diminué tandis que le manomètre reste inchangé.',
        enonce:'La masse de la bouteille a nettement diminué tandis que le manomètre reste inchangé. Quelle interprétation est correcte ?',format:'qcm',sourceBlocks:['b00034','b00043','b00044','b00048'],
        correction_generale:'La pesée diminue proportionnellement à la quantité consommée et permet d’estimer le contenu alors que la pression reste sur son plateau biphasique.',
        items:[
          {lettre:'A',enonce:'La pesée fournit une information utile avant la chute de pression.',is_correct:true,justification:'La masse totale baisse à mesure que des molécules quittent la bouteille, liquide présent ou non.'},
          {lettre:'B',enonce:'La stabilité du manomètre invalide la mesure de masse.',is_correct:false,justification:'Les deux mesures explorent des propriétés différentes et leur dissociation est attendue ici.'},
          {lettre:'C',enonce:'La diminution pondérale est compatible avec une consommation importante de protoxyde.',is_correct:true,justification:'Le maintien de la pression n’empêche pas l’épuisement progressif de la phase liquide.'},
          {lettre:'D',enonce:'Le poids évolue linéairement avec la quantité de gaz restant dans la bouteille.',is_correct:true,justification:'Cette relation autorise une estimation si la tare et la masse pleine sont connues.'},
          {lettre:'E',enonce:'La bouteille doit être considérée pleine jusqu’au premier mouvement du manomètre.',is_correct:false,justification:'Au début de la baisse de pression, environ cinq sixièmes de son contenu ont déjà disparu.'},
        ],
      },
      {
        newInformation:'La pression commence soudain à décroître après disparition de la dernière phase liquide.',
        enonce:'La pression commence soudain à décroître après disparition de la dernière phase liquide. Quelles conclusions peut-on tirer ?',format:'qcm',sourceBlocks:['b00042','b00043','b00044','b00045','b00046','b00047','b00048'],
        correction_generale:'La bouteille est désormais entièrement gazeuse, la loi de Boyle devient applicable et il ne reste qu’environ 16 % du contenu initial.',
        items:[
          {lettre:'A',enonce:'La phase biphasique est terminée et le protoxyde restant est gazeux.',is_correct:true,justification:'La disparition du liquide explique la sortie du plateau de pression jusque-là observé.'},
          {lettre:'B',enonce:'La pression devient proportionnelle à la quantité gazeuse restante à température stable.',is_correct:true,justification:'La relation de Boyle peut maintenant relier la pression interne au volume disponible à l’atmosphère.'},
          {lettre:'C',enonce:'La bouteille conserve encore approximativement 16 % de sa capacité pleine.',is_correct:true,justification:'Le calcul à partir de 5 L et 5 136 kPa aboutit à environ 235 L sur 1 590 L.'},
          {lettre:'D',enonce:'La chute signifie que la bouteille est instantanément vide.',is_correct:false,justification:'Une réserve gazeuse mesurable persiste après la disparition de la phase liquide.'},
          {lettre:'E',enonce:'La pression retrouve un nouveau plateau jusqu’à l’épuisement total.',is_correct:false,justification:'Sans liquide pour entretenir la vapeur, elle décroît avec chaque prélèvement supplémentaire.'},
        ],
      },
      {
        newInformation:'Le calcul par la loi de Boyle retrouve environ 235 litres gazeux disponibles.',
        enonce:'Le calcul par la loi de Boyle retrouve environ 235 litres gazeux disponibles. Quelle autonomie théorique en déduire à 1 L/min ?',format:'qcm',sourceBlocks:['b00044','b00045','b00046','b00047','b00048'],
        correction_generale:'À débit constant de 1 L/min, 235 L correspondent à environ 235 minutes, soit près de quatre heures théoriques.',
        items:[
          {lettre:'A',enonce:'L’autonomie théorique est de 235 minutes.',is_correct:true,justification:'La division du volume disponible par un litre consommé chaque minute donne directement cette durée.'},
          {lettre:'B',enonce:'Cette durée correspond approximativement à quatre heures.',is_correct:true,justification:'Deux cent trente-cinq minutes représentent trois heures et cinquante-cinq minutes.'},
          {lettre:'C',enonce:'Le calcul suppose un débit constant sans fuite ni consommation supplémentaire.',is_correct:true,justification:'Tout autre prélèvement réduirait la durée réelle par rapport à cette estimation idéale.'},
          {lettre:'D',enonce:'La réserve permet exactement 16 minutes parce qu’il reste 16 %.',is_correct:false,justification:'Le pourcentage de contenu n’est pas une durée ; l’autonomie dépend du volume et du débit.'},
          {lettre:'E',enonce:'Une augmentation à 2 L/min doublerait la durée restante.',is_correct:false,justification:'À volume identique, doubler le débit diviserait au contraire l’autonomie par deux.'},
        ],
      },
      {
        newInformation:'Le manomètre de la bouteille d’oxygène baisse en parallèle de façon régulière.',
        enonce:'Le manomètre de la bouteille d’oxygène baisse en parallèle de façon régulière. Pourquoi son interprétation diffère-t-elle ?',format:'qcm',sourceBlocks:['b00034','b00040','b00042','b00043','b00191'],
        correction_generale:'L’oxygène reste gazeux à température ambiante ; sa pression varie linéairement avec la quantité restante et fournit une jauge continue du contenu.',
        items:[
          {lettre:'A',enonce:'L’oxygène ne peut pas être liquéfié à la température de la pièce dans cette bouteille.',is_correct:true,justification:'Sa température critique très basse le maintient sous forme gazeuse dans les conditions usuelles.'},
          {lettre:'B',enonce:'La pression interne suit la diminution du nombre de molécules gazeuses.',is_correct:true,justification:'À volume et température stables, la loi de Boyle rend le manomètre proportionnel au contenu.'},
          {lettre:'C',enonce:'Une baisse régulière permet d’estimer la fraction d’oxygène encore disponible.',is_correct:true,justification:'Contrairement au protoxyde biphasique, il n’existe pas de plateau prolongé masquant la consommation.'},
          {lettre:'D',enonce:'L’oxygène forme une phase liquide qui maintient la pression constante.',is_correct:false,justification:'Cette situation caractérise le protoxyde d’azote, pas l’oxygène comprimé à température ambiante.'},
          {lettre:'E',enonce:'La pesée est la seule méthode possible pour évaluer cette bouteille.',is_correct:false,justification:'Le manomètre constitue déjà une estimation exploitable grâce à la relation pression-contenu.'},
        ],
      },
      {
        newInformation:'Une alimentation centrale redevient disponible à 350 kPa et la bouteille de secours est laissée ouverte.',
        enonce:'Une alimentation centrale redevient disponible à 350 kPa et la bouteille de secours est laissée ouverte. Quel réglage évite sa déplétion silencieuse ?',format:'qcm',sourceBlocks:['b00025','b00026','b00049','b00050','b00055'],
        correction_generale:'Le détendeur de bouteille fournit une pression légèrement inférieure à celle du réseau, qui reste ainsi la source prioritaire tant qu’il fonctionne normalement.',
        items:[
          {lettre:'A',enonce:'Régler la pression de service de la bouteille légèrement sous celle de la canalisation.',is_correct:true,justification:'Le gradient favorise l’alimentation centrale et préserve la réserve embarquée.'},
          {lettre:'B',enonce:'Maintenir la bouteille à une pression de sortie supérieure au réseau.',is_correct:false,justification:'Elle débiterait alors en premier et pourrait se vider sans signe évident.'},
          {lettre:'C',enonce:'Le régulateur stabilise la haute pression en une pression utilisable par l’appareil.',is_correct:true,justification:'Son diaphragme et son ressort ajustent le flot aval à la valeur prévue.'},
          {lettre:'D',enonce:'Une fluctuation modérée du réseau doit immédiatement consommer toute la réserve.',is_correct:false,justification:'L’écart de réglage vise justement à éviter une déplétion lors de variations intermittentes.'},
          {lettre:'E',enonce:'La bouteille reste disponible comme source de secours si la pression centrale s’effondre.',is_correct:true,justification:'Quand le réseau devient inférieur à sa pression régulée, la réserve peut prendre le relais.'},
        ],
      },
      {
        newInformation:'Une valve antiretour fonctionnelle est vérifiée à la sortie de chaque source de gaz comprimé.',
        enonce:'Une valve antiretour fonctionnelle est vérifiée à la sortie de chaque source de gaz comprimé. Quels incidents prévient-elle ?',format:'qcm',sourceBlocks:['b00050','b00053','b00056','b00057','b00059'],
        correction_generale:'La soupape antiretour impose un sens unique, empêche le reflux entre sources et limite les fuites ou déversements accidentels.',
        items:[
          {lettre:'A',enonce:'Elle empêche un gaz du réseau de refluer vers une bouteille raccordée.',is_correct:true,justification:'La fermeture dans le sens inverse isole les compartiments soumis à des pressions différentes.'},
          {lettre:'B',enonce:'Elle dirige le flot depuis la source vers l’appareil uniquement.',is_correct:true,justification:'Son mécanisme autorise le passage utile tout en bloquant le retour gazeux.'},
          {lettre:'C',enonce:'Elle limite un déversement accidentel entre les différents canaux gazeux.',is_correct:true,justification:'L’isolement des voies réduit les transferts non souhaités d’oxygène, de protoxyde ou d’air.'},
          {lettre:'D',enonce:'Elle mesure la pression résiduelle comme un tube de Bourdon.',is_correct:false,justification:'La mesure appartient au manomètre ; la soupape remplit une fonction directionnelle.'},
          {lettre:'E',enonce:'Elle remplace le détendeur chargé d’abaisser la pression de la bouteille.',is_correct:false,justification:'Le régulateur contrôle la valeur de pression tandis que l’antiretour contrôle seulement son sens.'},
        ],
      },
    ],
  },
];

function buildDpQcmSeries() {
  return MANUAL_DP_QCM_1_8.map((serie) => ({
    ...serie,
    questions: serie.questions.map((question) => ({
      ...question,
      sourceBlocks: [...question.sourceBlocks],
      items: question.items.map((item) => ({ ...item })),
    })),
  }));
}

const qroc = (enonce, reponse_attendue, correction_generale, sourceBlocks, newInformation = null) => ({
  enonce,
  format: 'qroc',
  reponse_attendue,
  correction_generale,
  sourceBlocks,
  items: [],
  ...(newInformation ? { newInformation } : {}),
});

const ISOLATED_QROC = [
  qroc('Quels sont les trois niveaux de pression successifs entre la source de gaz et les voies aériennes ?', 'Haute pression | pression intermédiaire | basse pression', 'Les gaz sont d’abord stockés et régulés, puis mélangés avant d’entrer dans le circuit respiratoire du patient.', ['b00013', 'b00016', 'b00070']),
  qroc('Dans quelle partie de l’appareil le mélange gazeux final est-il fabriqué ?', 'Système à pression intermédiaire', 'Débitmètres et vaporisateurs préparent le mélange en amont du circuit respiratoire à basse pression.', ['b00069', 'b00070', 'b00071', 'b00083']),
  qroc('Quelle partie de l’appareil reçoit les gaz expirés du patient ?', 'Circuit anesthésique à basse pression', 'Le système intermédiaire est en parallèle ; seule la branche respiratoire directement reliée au patient reçoit l’expiration.', ['b00070', 'b00109']),
  qroc('Quelle valeur de pression de service est rapportée pour la canalisation centrale ?', '350 kPa | 50 psi', 'Après évaporation et régulation, la pression est abaissée à 350 kPa pour la distribution hospitalière.', ['b00025', 'b00026']),
  qroc('Quel volume gazeux fournit approximativement un litre d’oxygène liquide ?', 'Environ 850 L', 'Le fort facteur d’expansion explique le rendement du stockage liquide dans les grands établissements.', ['b00018']),
  qroc('Quel raccord sécurise mécaniquement l’identité d’une bouteille sur l’appareil ?', 'Pin index', 'La disposition spécifique des ergots empêche le montage d’une bouteille contenant un autre gaz.', ['b00032', 'b00034']),
  qroc('Pourquoi la pression permet-elle d’estimer le contenu d’une bouteille d’oxygène ?', 'L’oxygène y est gazeux et la pression varie linéairement avec le volume', 'À température constante, l’oxygène comprimé suit la loi de Boyle et ne présente pas de plateau liquidien.', ['b00034', 'b00042', 'b00191']),
  qroc('Quelle mesure estime le protoxyde restant tant qu’une phase liquide persiste ?', 'La pesée de la bouteille', 'La pression reste celle de la vapeur saturante ; seule la masse diminue de façon exploitable pendant cette phase.', ['b00034', 'b00043', 'b00048']),
  qroc('À quel pourcentage du contenu initial la pression du protoxyde devient-elle informative ?', 'Environ 16 %', 'La relation pression-volume ne redevient exploitable qu’après disparition complète de la phase liquide.', ['b00043', 'b00044', 'b00048']),
  qroc('Quelle autonomie représentent environ 235 L de protoxyde à un débit de 1 L/min ?', 'Environ 4 heures', 'Deux cent trente-cinq minutes correspondent à un peu moins de quatre heures d’autonomie théorique.', ['b00047', 'b00048']),
  qroc('Quel composant abaisse et stabilise une pression gazeuse élevée ?', 'Détendeur | régulateur de pression', 'Le diaphragme opposé à un ressort calibre l’ouverture pour maintenir une pression aval déterminée.', ['b00049', 'b00050']),
  qroc('Quel dispositif mécanique mesure classiquement la pression des bouteilles ?', 'Tube de Bourdon', 'Sa déformation sous pression déplace le mécanisme du manomètre et fournit une indication lisible.', ['b00053', 'b00054', 'b00058', 'b00059']),
  qroc('Que devient l’arrivée de protoxyde lors d’une chute de pression d’oxygène ?', 'Elle est automatiquement coupée', 'La fermeture évite de poursuivre l’administration d’un gaz non oxygéné lorsque la source d’oxygène faiblit.', ['b00060', 'b00061', 'b00064']),
  qroc('Où doit être placé l’analyseur d’oxygène qui contrôle le mélange final ?', 'En aval des débitmètres', 'Cette position mesure la composition réellement envoyée au circuit malgré fuite ou défaut d’asservissement.', ['b00075', 'b00079']),
  qroc('Pourquoi un tube de Thorpe n’est-il pas interchangeable entre gaz ?', 'Sa graduation dépend de la densité et de la viscosité du gaz', 'À débit égal, les propriétés physiques modifient les forces sur le flotteur et donc la hauteur lue.', ['b00072', 'b00075']),
  qroc('Quel débitmètre doit se trouver au plus près de la sortie commune vers le patient ?', 'Le débitmètre d’oxygène', 'Ajouter l’oxygène en dernier diminue le risque de le perdre sélectivement lors d’une fuite en amont.', ['b00075', 'b00078', 'b00079', 'b00193']),
  qroc('Quelle fraction minimale d’oxygène le dispositif décrit cherche-t-il à garantir ?', 'FiO₂ 0,25 | 25 %', 'L’asservissement des débits limite un mélange trop pauvre en oxygène mais ne remplace pas son analyse.', ['b00075']),
  qroc('Comment le gaz frais se charge-t-il d’halogéné dans un vaporisateur à plénum ?', 'Par léchage du liquide dans la chambre de vaporisation', 'Une fraction du flux se sature au contact du liquide avant de rejoindre le flux de bypass.', ['b00082', 'b00085', 'b00086']),
  qroc('Pourquoi le desflurane nécessite-t-il un vaporisateur chauffé ?', 'Son point d’ébullition bas rend la pression de vapeur très sensible à la température', 'Près de 22,8 °C, de faibles variations thermiques produiraient de grandes variations de concentration.', ['b00087', 'b00090', 'b00091', 'b00092']),
  qroc('Quel mécanisme empêche l’ouverture simultanée de deux vaporisateurs ?', 'Système d’enclenchement | interverrouillage', 'Une tige liée à la cuve active bloque mécaniquement les commandes des autres vaporisateurs.', ['b00101', 'b00102', 'b00103', 'b00105', 'b00106']),
  qroc('Quelle valve limite la pression pendant une ventilation manuelle au ballon ?', 'Valve APL', 'L’utilisateur règle l’échappement des gaz afin de ventiler sans exposer les voies aériennes à une surpression.', ['b00116', 'b00117', 'b00118', 'b00119', 'b00124']),
  qroc('Quel mécanisme élimine le CO₂ dans un circuit de Mapleson D ?', 'Le rinçage par le débit de gaz frais', 'Sans absorbeur, le flux frais chasse les gaz expirés hors de la tubulure pendant l’expiration.', ['b00121', 'b00129', 'b00130', 'b00133']),
  qroc('Quel débit frais minimal prévient la réinspiration dans un Mapleson D ?', 'Au moins 2,5 fois la ventilation minute', 'Ce rapport limite la réinspiration en évacuant le volume expiré avant le cycle inspiratoire suivant.', ['b00129', 'b00130', 'b00131', 'b00133']),
  qroc('Quel défaut du tube interne d’un Bain provoque une réinspiration de CO₂ ?', 'Obstruction | rupture proximale', 'Le gaz frais n’arrive plus correctement en distal et ne chasse pas le volume expiré de la tubulure.', ['b00129', 'b00130', 'b00133']),
  qroc('Quel élément retire le CO₂ dans un circuit cercle ?', 'Absorbeur rempli de chaux sodée', 'Les bases de l’absorbeur neutralisent l’acide carbonique formé par l’eau et le dioxyde de carbone.', ['b00134', 'b00135', 'b00136', 'b00137', 'b00138', 'b00139']),
  qroc('Pourquoi faut-il éviter la dessiccation complète de la chaux sodée ?', 'Elle compromet l’absorption et favorise la production de monoxyde de carbone', 'L’eau est indispensable à la première réaction et la chaux sèche réagit dangereusement avec certains volatils.', ['b00139', 'b00144', 'b00145']),
  qroc('Quel agent halogéné peut former le composé A avec des bases fortes ?', 'Sévoflurane', 'Le composé A est une oléfine issue de la réaction du sévoflurane avec le KOH ou le NaOH.', ['b00145']),
  qroc('Quelle panne valvulaire du cercle expose à une hypercapnie ?', 'Défaillance d’une valve unidirectionnelle', 'Un reflux court-circuite alors l’absorbeur et renvoie au patient des gaz expirés encore chargés de CO₂.', ['b00142', 'b00143']),
  qroc('Quelle source d’énergie mobilise un ventilateur à piston ?', 'Électricité', 'Une vis motorisée déplace le piston sans utiliser d’oxygène ou d’air comme gaz moteur.', ['b00148', 'b00156', 'b00157', 'b00158']),
  qroc('Pourquoi un soufflet ascendant est-il plus sûr lors d’une déconnexion ?', 'Il se vide rapidement et déclenche l’alarme', 'Le soufflet descendant peut continuer à bouger sous son poids malgré un volume patient insuffisant.', ['b00158']),
  qroc('Que compense le logiciel lorsqu’il mesure la compliance du circuit ?', 'Le volume absorbé par la dilatation de la tubulure', 'L’appareil ajoute la perte estimée pour que le volume courant réglé atteigne réellement le patient.', ['b00158']),
  qroc('Quelle variable est garantie en ventilation en volume contrôlé ?', 'Le volume courant', 'La pression nécessaire varie avec compliance et résistance, ce qui impose une surveillance des pressions.', ['b00171']),
  qroc('Quelle variable est garantie en ventilation à pression contrôlée ?', 'La pression inspiratoire', 'Le volume courant devient dépendant de la mécanique et peut diminuer lorsque la compliance baisse.', ['b00171']),
  qroc('Quel est le principe de la pression contrôlée à volume garanti ?', 'Atteindre le volume cible avec la pression minimale nécessaire', 'L’algorithme ajuste la pression cycle après cycle pour concilier volume et limitation des pressions.', ['b00171']),
  qroc('Quel effet pulmonaire est recherché par la PEP ?', 'Maintenir le volume téléexpiratoire et limiter l’atélectasie', 'Une pression positive en fin d’expiration s’oppose au collapsus alvéolaire.', ['b00169', 'b00170']),
  qroc('Quel risque apparaît lorsque le temps expiratoire devient trop court ?', 'Hyperinflation dynamique', 'Un poumon qui ne se vide pas avant le cycle suivant accumule progressivement du volume gazeux.', ['b00166', 'b00167']),
  qroc('Quelle mesure gazeuse pilote l’anesthésie inhalatoire à objectif de concentration ?', 'La fraction expirée de l’agent', 'Après équilibration, la Fe reflète mieux la concentration cérébrale que la seule concentration inspirée.', ['b00176', 'b00177']),
  qroc('Quel avantage environnemental apporte un très bas débit de gaz frais ?', 'Moins de consommation et moins de rejets de volatils', 'La réduction du volume excédentaire limite la quantité d’agent évacuée vers l’atmosphère.', ['b00177', 'b00182']),
  qroc('À quoi sert le réservoir tampon d’un antipollution fermé actif ?', 'À recevoir les gaz avant leur aspiration régulée', 'Il découple le circuit patient de l’aspiration centrale, sous la protection de soupapes adaptées.', ['b00182']),
  qroc('Pourquoi les gaz anesthésiques et les liquides biologiques ont-ils des aspirations distinctes ?', 'Pour éviter fluctuations d’aspiration et détérioration du réseau par les volatils', 'La séparation protège la stabilité de l’évacuation gazeuse et le matériel d’aspiration central.', ['b00183', 'b00184']),
];

function buildIsolatedQrocSeries() {
  const names = ['Architecture', 'Sources', 'Bouteilles', 'Régulation', 'Débitmètres et volatils', 'Circuits', 'Ventilateurs', 'Pollution'];
  return Array.from({ length: 8 }, (_, seriesIndex) => ({
    label: `QROC — Série ${seriesIndex + 1} · ${names[seriesIndex]}`,
    allowed_voies: ['externe'],
    questions: ISOLATED_QROC.slice(seriesIndex * 5, seriesIndex * 5 + 5),
  }));
}

const DP_QROC_CASES = [
  {
    title: 'Défaut d’oxygène pendant une induction',
    vignette: 'Une patiente de 57 ans est installée pour une thyroïdectomie. Le contrôle initial de l’appareil a retrouvé une canalisation d’oxygène sous pression, une bouteille E fermée mais disponible et un ballon autoremplisseur raccordable à une source indépendante. Après la préoxygénation et l’induction, une alarme de pression d’oxygène survient. La saturation est encore normale et l’équipe doit agir avant qu’une hypoxémie ne se constitue.',
    stages: [
      [null, 'Quel trajet pneumatique faut-il suivre pour localiser méthodiquement la défaillance ?', 'Source à haute pression, régulation intermédiaire, puis circuit patient', 'L’analyse de la source vers les voies aériennes identifie rapidement l’étage en défaut sans négliger le patient.', ['b00013', 'b00016', 'b00070']],
      ['La pression d’oxygène chute sous le seuil de sécurité et l’arrivée de protoxyde s’interrompt.', 'La pression d’oxygène chute sous le seuil de sécurité et l’arrivée de protoxyde s’interrompt. Quel dispositif explique cette interruption ?', 'Valve de coupure automatique du protoxyde', 'La valve réagit à la baisse de pression d’oxygène pour empêcher la poursuite d’un mélange non oxygéné.', ['b00060', 'b00061', 'b00064']],
      ['Le manomètre de la canalisation indique zéro alors que celui de la bouteille E est normal.', 'Le manomètre de la canalisation indique zéro alors que celui de la bouteille E est normal. Quelle source faut-il ouvrir ?', 'La bouteille E d’oxygène de secours', 'La canalisation est défaillante ; la bouteille embarquée constitue la source alternative immédiatement disponible.', ['b00018', 'b00029', 'b00034']],
      ['Après ouverture, la pression de la bouteille d’oxygène baisse de façon régulière.', 'Après ouverture, la pression de la bouteille d’oxygène baisse de façon régulière. Que permet cette baisse ?', 'Estimer le contenu restant', 'L’oxygène reste gazeux à température ambiante et sa pression est proportionnelle au volume disponible.', ['b00034', 'b00042', 'b00191']],
      ['Le ventilateur pneumatique continue à utiliser l’oxygène de la bouteille comme gaz moteur.', 'Le ventilateur pneumatique continue à utiliser l’oxygène de la bouteille comme gaz moteur. Quel risque logistique apparaît ?', 'Épuisement rapide de la bouteille', 'La consommation motrice du soufflet s’ajoute à l’oxygène délivré au patient et réduit fortement l’autonomie.', ['b00148', 'b00149', 'b00151']],
      ['L’analyseur en aval mesure une fraction d’oxygène inférieure au réglage des débitmètres.', 'L’analyseur en aval mesure une fraction d’oxygène inférieure au réglage des débitmètres. Quelle anomalie faut-il suspecter ?', 'Une fuite d’oxygène sur le bloc débitmètres', 'Même avec un ordre protecteur, une fuite sur la branche oxygène peut appauvrir le mélange final.', ['b00075', 'b00078', 'b00079']],
      ['La réserve d’oxygène devient insuffisante et le respirateur doit être abandonné.', 'La réserve d’oxygène devient insuffisante et le respirateur doit être abandonné. Quel moyen maintient immédiatement la ventilation ?', 'Ballon autoremplisseur avec source indépendante', 'Une ventilation manuelle indépendante dissocie temporairement le patient de la panne globale de l’appareil.', ['b00009', 'b00010', 'b00186']],
    ],
  },
  {
    title: 'Réinspiration sous circuit cercle',
    vignette: 'Un homme de 64 ans est anesthésié à bas débit pour une prostatectomie robotique. Le circuit cercle a été assemblé avec un bac de chaux sodée et deux valves unidirectionnelles. Après quatre-vingt-dix minutes, le dioxyde de carbone inspiré augmente tandis que la ventilation minute est inchangée. Le clinicien examine l’absorbeur, le sens des valves et la température du bac afin de déterminer si l’épuration chimique ou le trajet des gaz est en cause.',
    stages: [
      [null, 'Par quel élément le circuit cercle retire-t-il normalement le dioxyde de carbone expiré ?', 'Absorbeur de chaux sodée', 'Les gaz suivent un trajet imposé vers la chaux, où le dioxyde de carbone est neutralisé avant réinspiration.', ['b00134', 'b00135']],
      ['La chaux a changé de couleur et ne chauffe plus pendant la ventilation.', 'La chaux a changé de couleur et ne chauffe plus pendant la ventilation. Quel diagnostic fonctionnel faut-il retenir ?', 'Absorbeur épuisé', 'Le virage coloré et l’absence de réaction exothermique indiquent une capacité alcaline devenue insuffisante.', ['b00136', 'b00137', 'b00138', 'b00139']],
      ['Le bac est remplacé mais le dioxyde de carbone inspiré ne disparaît pas.', 'Le bac est remplacé mais le dioxyde de carbone inspiré ne disparaît pas. Quel composant doit être vérifié ensuite ?', 'Les valves unidirectionnelles', 'Une valve incompétente permet un reflux qui contourne le nouvel absorbeur malgré sa capacité intacte.', ['b00142', 'b00143']],
      ['La valve expiratoire est bloquée en position ouverte et le gaz revient vers la branche inspiratoire.', 'La valve expiratoire est bloquée en position ouverte et le gaz revient vers la branche inspiratoire. Quelle conséquence biologique est attendue ?', 'Hypercapnie', 'Le patient réinhale du dioxyde de carbone non épuré, ce qui augmente progressivement sa charge en CO₂.', ['b00142', 'b00143']],
      ['L’ancien bac a été desséché par un débit frais élevé maintenu toute la nuit.', 'L’ancien bac a été desséché par un débit frais élevé maintenu toute la nuit. Quel toxique gazeux peut alors se former ?', 'Monoxyde de carbone', 'La dessiccation quasi complète et les bases fortes favorisent sa production avec certains agents halogénés.', ['b00144', 'b00145']],
      ['Le sévoflurane est utilisé avec une chaux contenant du KOH et du NaOH.', 'Le sévoflurane est utilisé avec une chaux contenant du KOH et du NaOH. Quel autre composé est susceptible d’apparaître ?', 'Composé A', 'Le sévoflurane réagit avec les bases fortes et forme alors cette oléfine.', ['b00145']],
      ['Une chaux pauvre en bases fortes est installée et le bas débit est repris sous surveillance.', 'Une chaux pauvre en bases fortes est installée et le bas débit est repris sous surveillance. Quels deux bénéfices sont recherchés ?', 'Réduction du coût et de la pollution', 'La réinspiration après épuration diminue l’utilisation d’agent volatil et la quantité de gaz rejetée.', ['b00139', 'b00145', 'b00177']],
    ],
  },
  {
    title: 'Choix ventilatoire en compliance basse',
    vignette: 'Une patiente de 43 ans, obèse, est ventilée après induction pour une chirurgie coelioscopique. Le pneumopéritoine abaisse encore sa compliance thoracopulmonaire. En volume contrôlé, le volume courant réglé est atteint mais la pression de crête augmente. Les voies aériennes et le circuit sont perméables. Le clinicien compare pression contrôlée, pression contrôlée à volume garanti et réglage de la pression expiratoire positive.',
    stages: [
      [null, 'Quelle variable reste garantie en ventilation en volume contrôlé ?', 'Le volume courant', 'Ce mode délivre le volume programmé ; la pression nécessaire varie avec la mécanique du système respiratoire.', ['b00171']],
      ['La compliance diminue encore et la pression inspiratoire augmente pour le même volume.', 'La compliance diminue encore et la pression inspiratoire augmente pour le même volume. Quel risque mécanique faut-il prévenir ?', 'Barotraumatisme', 'La délivrance d’un volume fixe dans un système peu compliant peut nécessiter des pressions excessives.', ['b00171']],
      ['Le passage en pression contrôlée limite la pression mais réduit le volume courant.', 'Le passage en pression contrôlée limite la pression mais réduit le volume courant. Quelle complication ventilatoire menace ?', 'Hypoventilation', 'Sous une pression fixe, la dégradation de compliance diminue le volume reçu et donc la ventilation minute.', ['b00171']],
      ['Le mode pression contrôlée à volume garanti est activé avec une cible de 450 mL.', 'Le mode pression contrôlée à volume garanti est activé avec une cible de 450 mL. Que recherche l’algorithme ?', 'La pression minimale permettant d’atteindre 450 mL', 'L’appareil ajuste la pression afin de garantir le volume sans appliquer une pression inutilement élevée.', ['b00171']],
      ['Une pression expiratoire positive est ajoutée au réglage ventilatoire.', 'Une pression expiratoire positive est ajoutée au réglage ventilatoire. Quel mécanisme pulmonaire est visé ?', 'Maintien du volume téléexpiratoire', 'La pression résiduelle en fin d’expiration limite le collapsus et la constitution d’atélectasies.', ['b00169', 'b00170']],
      ['Le rapport inspiration-expiration est inversé et le temps expiratoire devient trop court.', 'Le rapport inspiration-expiration est inversé et le temps expiratoire devient trop court. Quelle complication dynamique apparaît ?', 'Hyperinflation', 'Une expiration incomplète avant le cycle suivant entraîne une accumulation progressive de gaz.', ['b00166', 'b00167']],
      ['À l’émergence, la patiente déclenche ses cycles mais lutte contre la tubulure.', 'À l’émergence, la patiente déclenche ses cycles mais lutte contre la tubulure. Quel mode d’assistance compense ce travail ?', 'Aide inspiratoire', 'Une pression accompagne l’effort spontané puis décroît avec le débit, ce qui allège la résistance du circuit.', ['b00175']],
    ],
  },
  {
    title: 'Préparation d’un vaporisateur de desflurane',
    vignette: 'Un homme de 50 ans doit recevoir du desflurane pour une intervention prolongée. L’appareil comporte une cuve chauffée et pressurisée, distincte du vaporisateur à plénum utilisé pour le sévoflurane. L’équipe vérifie la clé de remplissage, l’alimentation électrique, l’interverrouillage et l’analyse des gaz. Le bloc est situé en altitude, où la pression atmosphérique est inférieure à celle du niveau de la mer.',
    stages: [
      [null, 'Quelle propriété thermique du desflurane empêche l’emploi fiable d’un plénum standard ?', 'Son point d’ébullition proche de la température ambiante', 'À 22,8 °C, de petites variations de température entraînent de grandes variations de pression de vapeur.', ['b00087', 'b00090', 'b00091', 'b00092']],
      ['La cuve est chaude au toucher après sa mise sous tension.', 'La cuve est chaude au toucher après sa mise sous tension. Quel rôle assure ce chauffage ?', 'Stabiliser température et pression de vapeur', 'Le contrôle thermostatique rend la quantité injectée reproductible malgré les variations liées à l’évaporation.', ['b00085', 'b00092']],
      ['Le flacon ne peut être introduit dans la clé de remplissage du sévoflurane.', 'Le flacon ne peut être introduit dans la clé de remplissage du sévoflurane. Quel risque cette incompatibilité prévient-elle ?', 'Une erreur d’agent', 'Les clés normalisées empêchent de remplir une cuve calibrée avec un halogéné aux propriétés différentes.', ['b00084', 'b00102']],
      ['Le vaporisateur de sévoflurane est déjà ouvert lorsque le desflurane est sélectionné.', 'Le vaporisateur de sévoflurane est déjà ouvert lorsque le desflurane est sélectionné. Quel mécanisme doit bloquer la seconde ouverture ?', 'Interverrouillage des vaporisateurs', 'La tige d’enclenchement autorise une seule cuve active et évite l’addition imprévisible de deux agents.', ['b00101', 'b00102', 'b00105', 'b00106']],
      ['La pression atmosphérique est basse alors que la cuve reste pressurisée et thermostatée.', 'La pression atmosphérique est basse alors que la cuve reste pressurisée et thermostatée. Quel ajustement est décrit ?', 'Augmenter le pourcentage inspiré', 'Une même proportion délivrée produit une pression partielle moindre lorsque la pression ambiante diminue.', ['b00094']],
      ['Une pression inspiratoire rétrograde atteint le bloc de vaporisation.', 'Une pression inspiratoire rétrograde atteint le bloc de vaporisation. Quel phénomène peut majorer la concentration suivante ?', 'Effet de pompage', 'La rétropression déplace des molécules vers le bypass avant leur délivrance accrue au cycle ultérieur.', ['b00095', 'b00096', 'b00099', 'b00100']],
      ['L’appareil régule ensuite la fraction expirée de desflurane en boucle fermée.', 'L’appareil régule ensuite la fraction expirée de desflurane en boucle fermée. Quel nom porte cette stratégie ?', 'AINOC', 'L’anesthésie inhalatoire à objectif de concentration adapte électroniquement l’agent à la Fe cible.', ['b00176', 'b00177']],
    ],
  },
  {
    title: 'Circuit de Bain en ventilation spontanée',
    vignette: 'Un enfant de 4 ans est anesthésié pour un geste court avec un circuit de Bain. La faible résistance et la légèreté du système ont motivé ce choix. Le débit frais a été réglé à partir de la ventilation minute et la valve d’échappement est accessible. Pendant le réveil, le dioxyde de carbone inspiré augmente et le clinicien doit vérifier successivement le débit, le tube interne et la possibilité d’évacuer les gaz.',
    stages: [
      [null, 'À quelle famille de circuits appartient le Bain ?', 'Mapleson D coaxial', 'Le tube de gaz frais est disposé à l’intérieur de la tubulure ondulée d’un Mapleson D.', ['b00120', 'b00121']],
      ['La ventilation minute de l’enfant est de 3 L/min et le débit frais n’est que de 4 L/min.', 'La ventilation minute de l’enfant est de 3 L/min et le débit frais n’est que de 4 L/min. Quel débit minimal faut-il viser ?', 'Au moins 7,5 L/min', 'Un débit égal à 2,5 fois la ventilation minute chasse efficacement le CO₂.', ['b00129', 'b00130', 'b00131', 'b00133']],
      ['Le débit est corrigé mais le dioxyde de carbone inspiré reste détectable.', 'Le débit est corrigé mais le dioxyde de carbone inspiré reste détectable. Quelle partie du Bain faut-il inspecter ?', 'Le tube interne de gaz frais', 'Son obstruction ou sa rupture proximale empêche le rinçage distal malgré un débit réglé suffisant.', ['b00129', 'b00130', 'b00133']],
      ['Le tube interne est partiellement obstrué par une coudure au raccord proximal.', 'Le tube interne est partiellement obstrué par une coudure au raccord proximal. Quel mécanisme produit l’hypercapnie ?', 'Réinspiration du volume expiré insuffisamment chassé', 'L’apport frais n’atteint plus correctement le circuit et du CO₂ persiste pour l’inspiration suivante.', ['b00129', 'b00130', 'b00133']],
      ['La valve APL est presque fermée pendant plusieurs insufflations manuelles.', 'La valve APL est presque fermée pendant plusieurs insufflations manuelles. Quel risque pressif apparaît ?', 'Barotraumatisme', 'L’évacuation limitée fait monter la pression dans le circuit et les voies aériennes.', ['b00116', 'b00117', 'b00118', 'b00124', 'b00133']],
      ['Après remplacement, le circuit offre de nouveau une très faible résistance au débit.', 'Après remplacement, le circuit offre de nouveau une très faible résistance au débit. Quelle caractéristique explique cet avantage ?', 'Absence de valves unidirectionnelles', 'La simplicité du trajet limite les résistances et favorise son utilisation chez l’enfant.', ['b00121', 'b00133']],
      ['Le haut débit frais est maintenu jusqu’à la fin de l’anesthésie.', 'Le haut débit frais est maintenu jusqu’à la fin de l’anesthésie. Quels inconvénients environnementaux en résultent ?', 'Consommation accrue et pollution par les gaz rejetés', 'Sans réinspiration significative, davantage d’agent et de gaz frais atteignent l’antipollution.', ['b00133', 'b00182']],
    ],
  },
  {
    title: 'Diagnostic d’une déconnexion ventilatoire',
    vignette: 'Une patiente de 70 ans est ventilée avec un soufflet ascendant pendant une chirurgie de hanche. Après mobilisation de la table, le soufflet se vide brutalement et l’alarme de volume retentit. Le capnogramme disparaît. L’équipe ventile manuellement pendant l’inspection de la branche patient. Après reconnexion, elle compare le comportement attendu d’un soufflet descendant et d’un piston électrique afin de comprendre les signaux observés.',
    stages: [
      [null, 'Quel type d’événement évoque en priorité l’effondrement soudain d’un soufflet ascendant ?', 'Une déconnexion ou une fuite importante du circuit', 'Le soufflet ne se remplit plus avec les gaz expirés et révèle visuellement la perte du circuit patient.', ['b00151', 'b00158']],
      ['La branche patient est effectivement retrouvée désadaptée du filtre.', 'La branche patient est effectivement retrouvée désadaptée du filtre. Quel avantage du soufflet ascendant a permis l’alerte ?', 'Il se vide immédiatement lors d’une fuite', 'Ce comportement rend la déconnexion visible et facilite le déclenchement rapide de l’alarme.', ['b00158']],
      ['Un soufflet descendant aurait pu continuer à se déplacer malgré la fuite.', 'Un soufflet descendant aurait pu continuer à se déplacer malgré la fuite. Quelle force entretient ce mouvement trompeur ?', 'Son propre poids', 'La descente gravitaire peut persister alors que le volume réellement délivré au patient s’effondre.', ['b00158']],
      ['La ventilation est reprise avec un ballon indépendant pendant la réparation.', 'La ventilation est reprise avec un ballon indépendant pendant la réparation. Quel objectif immédiat justifie ce choix ?', 'Maintenir oxygénation et ventilation hors de l’appareil défaillant', 'Le moyen indépendant protège le patient pendant que le circuit et le ventilateur sont contrôlés.', ['b00009', 'b00010', 'b00186']],
      ['Après reconnexion, une différence persiste entre volume réglé et volume expiré.', 'Après reconnexion, une différence persiste entre volume réglé et volume expiré. Quelle propriété de la tubulure doit être mesurée ?', 'Sa compliance', 'Une partie du volume distend le circuit et n’atteint pas le patient si elle n’est pas compensée.', ['b00158']],
      ['Le logiciel ajoute automatiquement le volume absorbé par la tubulure.', 'Le logiciel ajoute automatiquement le volume absorbé par la tubulure. Quel est le nom fonctionnel de cette correction ?', 'Compensation de compliance du circuit', 'L’algorithme estime la perte et augmente la délivrance pour obtenir le volume courant demandé.', ['b00158']],
      ['Un piston électrique est utilisé pour poursuivre l’anesthésie.', 'Un piston électrique est utilisé pour poursuivre l’anesthésie. Quel gaz moteur consomme-t-il ?', 'Aucun gaz moteur', 'Une vis motorisée électriquement déplace le piston sans flux pneumatique externe de compression.', ['b00156', 'b00157', 'b00158']],
    ],
  },
  {
    title: 'Pollution et bas débit automatisé',
    vignette: 'Une femme de 48 ans est anesthésiée au sévoflurane dans une salle où l’exposition professionnelle aux volatils doit être réduite. L’appareil dispose d’un circuit cercle, d’un absorbeur récent, d’un système antipollution actif et d’une régulation de fraction expirée. Après induction, le débit frais est progressivement diminué. L’équipe surveille le réservoir tampon, les soupapes de l’interface et la séparation avec l’aspiration des liquides biologiques.',
    stages: [
      [null, 'Quelle variable gazeuse est choisie comme cible de la régulation inhalatoire ?', 'La fraction expirée du sévoflurane', 'Après le temps d’équilibre, cette mesure approche la concentration sanguine puis cérébrale de l’agent.', ['b00176', 'b00177']],
      ['La fraction expirée mesurée reste sous la cible choisie par l’anesthésiste.', 'La fraction expirée mesurée reste sous la cible choisie par l’anesthésiste. Quel composant l’appareil ajuste-t-il ?', 'Le vaporisateur', 'La boucle électronique augmente l’administration en intégrant la mesure expirée et le débit frais.', ['b00177']],
      ['Le débit frais est abaissé jusqu’à un niveau très faible après stabilisation.', 'Le débit frais est abaissé jusqu’à un niveau très faible après stabilisation. Quel bénéfice économique direct apparaît ?', 'Diminution de la consommation d’agent volatil', 'Une plus grande part du gaz épuré est réinspirée au lieu d’être remplacée puis évacuée.', ['b00139', 'b00177']],
      ['La quantité de gaz excédentaire dirigée vers l’antipollution diminue.', 'La quantité de gaz excédentaire dirigée vers l’antipollution diminue. Quel bénéfice environnemental en découle ?', 'Réduction des rejets atmosphériques de volatil', 'Moins de gaz frais signifie moins d’agent entraîné hors du circuit vers l’environnement.', ['b00177', 'b00182']],
      ['L’aspiration active a tendance à vider le réservoir tampon trop rapidement.', 'L’aspiration active a tendance à vider le réservoir tampon trop rapidement. Quel danger pour le circuit doit être évité ?', 'Une dépression transmise au circuit patient', 'Les soupapes de l’interface doivent empêcher l’aspiration centrale de vider le circuit respiratoire.', ['b00182']],
      ['La ligne d’aspiration des liquides est fortement sollicitée pendant un saignement.', 'La ligne d’aspiration des liquides est fortement sollicitée pendant un saignement. Pourquoi l’évacuation des volatils reste-t-elle stable ?', 'Elle utilise un réseau central distinct', 'La séparation empêche les variations de succion chirurgicale de modifier l’antipollution.', ['b00183', 'b00184']],
      ['Le choix entre sévoflurane et desflurane est discuté sous l’angle climatique.', 'Le choix entre sévoflurane et desflurane est discuté sous l’angle climatique. Quel agent a l’effet de serre le plus élevé ?', 'Desflurane', 'Son impact de serre est nettement supérieur à celui du sévoflurane.', ['b00177']],
    ],
  },
  {
    title: 'Mise en service d’une nouvelle salle',
    vignette: 'Un homme de 35 ans est le premier patient d’une nouvelle salle d’opération. Avant son arrivée, l’équipe vérifie les raccords des canalisations, la bouteille de secours, les débitmètres, les vaporisateurs, le circuit cercle, le ventilateur et l’antipollution. Chaque test doit relier une anomalie à la barrière qui la détecte ou en limite les conséquences. L’objectif est de démontrer une chaîne fonctionnelle complète avant toute induction.',
    stages: [
      [null, 'Quel type de raccord non interchangeable identifie les canalisations de gaz ?', 'DISS ou NIST', 'La géométrie spécifique du raccord empêche de substituer un gaz à un autre au point de consommation.', ['b00026', 'b00027']],
      ['La bouteille de secours ne peut se monter que dans une position déterminée sur le joug.', 'La bouteille de secours ne peut se monter que dans une position déterminée sur le joug. Quel système impose cette position ?', 'Pin index', 'Les ergots spécifiques du gaz interdisent l’installation d’une bouteille incompatible.', ['b00032', 'b00034', 'b00035', 'b00037']],
      ['Le flotteur d’oxygène monte régulièrement dans son tube évasé pendant l’ouverture du robinet.', 'Le flotteur d’oxygène monte régulièrement dans son tube évasé pendant l’ouverture du robinet. Quel paramètre augmente ?', 'Le débit d’oxygène', 'L’équilibre du flotteur se déplace vers le haut lorsque l’espace annulaire requis devient plus grand.', ['b00072']],
      ['Une fuite simulée en aval du tube d’oxygène abaisse la mesure de l’analyseur final.', 'Une fuite simulée en aval du tube d’oxygène abaisse la mesure de l’analyseur final. Pourquoi cette mesure est-elle décisive ?', 'Elle contrôle le mélange réellement envoyé au patient', 'La pression d’alimentation et l’asservissement ne détectent pas nécessairement une fuite du mélange final.', ['b00075', 'b00078', 'b00079']],
      ['L’ouverture d’un vaporisateur bloque mécaniquement la commande du second.', 'L’ouverture d’un vaporisateur bloque mécaniquement la commande du second. Quel accident est prévenu ?', 'L’administration simultanée de deux halogénés', 'L’interverrouillage empêche une addition imprévisible des concentrations de deux agents.', ['b00101', 'b00102', 'b00105', 'b00106']],
      ['Le test du cercle montre que les valves imposent un sens unique autour de la chaux.', 'Le test du cercle montre que les valves imposent un sens unique autour de la chaux. Quel défaut clinique révélerait leur incompétence ?', 'Réinspiration de CO₂ avec hypercapnie', 'Un reflux permettrait aux gaz expirés de contourner l’absorbeur avant de revenir au patient.', ['b00134', 'b00135', 'b00142', 'b00143']],
      ['Le réservoir antipollution accepte les gaz excédentaires sans modifier la pression du circuit.', 'Le réservoir antipollution accepte les gaz excédentaires sans modifier la pression du circuit. Quel principe est ainsi validé ?', 'Découplage du circuit patient et de l’aspiration centrale', 'L’interface évacue les polluants tout en protégeant le patient contre dépression et surpression.', ['b00181', 'b00182']],
    ],
  },
];

const DP_QROC_SIGNATURES = [
  ['b00013', 'b00060', 'b00029', 'b00042', 'b00149', 'b00079', 'b00186'],
  ['b00135', 'b00139', 'b00142', 'b00143', 'b00145', 'b00144', 'b00177'],
  ['b00168', 'b00171', 'b00164', 'b00169', 'b00158', 'b00167', 'b00175'],
  ['b00087', 'b00092', 'b00084', 'b00102', 'b00094', 'b00096', 'b00177'],
  ['b00121', 'b00131', 'b00129', 'b00130', 'b00124', 'b00133', 'b00182'],
  ['b00151', 'b00158', 'b00154', 'b00010', 'b00157', 'b00156', 'b00148'],
  ['b00176', 'b00177', 'b00139', 'b00182', 'b00181', 'b00184', 'b00180'],
  ['b00027', 'b00032', 'b00072', 'b00079', 'b00102', 'b00143', 'b00182'],
];

function buildDpQrocSeries() {
  return DP_QROC_CASES.map((entry, caseIndex) => ({
    label: `DP QROC ${caseIndex + 1} · ${entry.title}`,
    vignette: entry.vignette,
    allowed_voies: ['externe'],
    questions: entry.stages.map(([newInformation, enonce, answer, correction, sources], questionIndex) => qroc(
      enonce,
      answer,
      correction,
      [...new Set([...sources, DP_QROC_SIGNATURES[caseIndex][questionIndex]])],
      newInformation,
    )),
  }));
}

const fc = (recto, verso, sourceBlocks) => ({ recto, verso, sourceBlocks });

const FLASHCARDS = [
  fc('Quelles fonctions principales l’appareil d’anesthésie réunit-il ?', 'Administration des gaz, ventilation, élimination du CO₂, antipollution, monitorage et alarmes.', ['b00003', 'b00008', 'b00009', 'b00010']),
  fc('Quel ensemble matériel définit l’appareil d’anesthésie ?', 'L’association d’un circuit anesthésique et d’un ventilateur.', ['b00003']),
  fc('Que fournit le système à haute pression ?', 'Les gaz des canalisations ou bouteilles avant leur régulation.', ['b00013', 'b00016']),
  fc('Que produit le système à pression intermédiaire ?', 'Le mélange gazeux final destiné au circuit respiratoire.', ['b00069', 'b00070']),
  fc('Quelle partie est directement reliée aux voies aériennes ?', 'Le circuit anesthésique à basse pression.', ['b00013', 'b00070', 'b00109']),
  fc('Pourquoi le patient n’expire-t-il pas dans le système intermédiaire ?', 'Ce système est en parallèle du circuit respiratoire et reste uniquement inspiratoire.', ['b00070']),
  fc('Quelle source de gaz est habituellement prioritaire au bloc ?', 'La canalisation centralisée de l’établissement.', ['b00018']),
  fc('Pourquoi l’oxygène est-il souvent stocké sous forme liquide ?', 'Son rendement volumique est élevé pour l’alimentation d’un hôpital.', ['b00018', 'b00025']),
  fc('Combien de gaz produit environ 1 L d’oxygène liquide ?', 'Environ 850 L d’oxygène gazeux.', ['b00018']),
  fc('À quelle température l’oxygène liquide bout-il ?', 'Environ -183 °C.', ['b00018']),
  fc('Quelle est la température critique de l’oxygène indiquée ?', 'Environ -113 °C.', ['b00018', 'b00026']),
  fc('Quelle pression atteint d’abord l’oxygène gazeux dans l’évaporateur ?', 'Environ 1 000 kPa avant la régulation du réseau.', ['b00025']),
  fc('À quelle pression le réseau central distribue-t-il les gaz ?', 'Environ 350 kPa, soit 50 psi.', ['b00025', 'b00026']),
  fc('Quelle capacité gazeuse approximative fournit une bouteille H ?', 'Environ 7 000 L.', ['b00026']),
  fc('Pourquoi les raccords DISS et NIST sont-ils sûrs ?', 'Leur géométrie non interchangeable est spécifique de chaque gaz.', ['b00026', 'b00027']),
  fc('Quel est le rôle d’une bouteille fixée sur l’appareil ?', 'Servir d’appoint ou de secours si la canalisation centrale manque.', ['b00029']),
  fc('Quel type de bouteille est le plus utilisé en anesthésie ?', 'La bouteille de type E.', ['b00034']),
  fc('Quel mécanisme évite une substitution de bouteille ?', 'Le système de pin index sur le joug.', ['b00032', 'b00034']),
  fc('À quoi sert la dépression conique du raccord de bouteille ?', 'À stabiliser la bouteille dans le joug.', ['b00033']),
  fc('Quel élément assure l’étanchéité au niveau du joug ?', 'Une rondelle adaptée au raccord bouteille-appareil.', ['b00035', 'b00037']),
  fc('Sous quelle phase l’oxygène est-il stocké dans une bouteille E ?', 'Sous forme gazeuse à température ambiante.', ['b00034', 'b00191']),
  fc('Comment évolue la pression d’oxygène quand la bouteille se vide ?', 'Elle diminue linéairement avec le volume restant.', ['b00034', 'b00042']),
  fc('Quelle loi permet de calculer le contenu d’oxygène comprimé ?', 'La loi de Boyle : P₁V₁ = P₂V₂ à température constante.', ['b00034', 'b00045']),
  fc('Sous quelle phase le protoxyde est-il initialement stocké ?', 'Sous forme liquide et gazeuse dans une bouteille pleine.', ['b00034', 'b00043', 'b00191']),
  fc('Quelle température critique explique la liquéfaction du protoxyde ?', '36,5 °C.', ['b00034', 'b00043']),
  fc('Pourquoi le manomètre estime-t-il mal le protoxyde restant ?', 'La pression de vapeur reste stable tant que persiste la phase liquide.', ['b00034', 'b00043']),
  fc('Quand la pression du protoxyde devient-elle proportionnelle au contenu ?', 'Après disparition complète de la phase liquide.', ['b00043', 'b00044']),
  fc('Quelle proportion reste lorsque disparaît le liquide de protoxyde ?', 'Environ 16 % du contenu initial.', ['b00043', 'b00048']),
  fc('Quelle pression est citée à la disparition du liquide de protoxyde ?', 'Environ 5 136 kPa, soit 745 psi.', ['b00044']),
  fc('Quel volume interne possède approximativement une bouteille E vide ?', 'Environ 5 L.', ['b00044']),
  fc('Quel volume gazeux subsiste au seuil des 16 % de protoxyde ?', 'Environ 235 L gazeux.', ['b00047', 'b00048']),
  fc('Quelle autonomie donnent 235 L à 1 L/min ?', 'Environ 235 minutes, soit presque 4 heures.', ['b00048']),
  fc('Quelle méthode suit le contenu liquidien du protoxyde ?', 'La pesée de la bouteille.', ['b00048']),
  fc('Quel est le rôle principal d’un détendeur ?', 'Abaisser puis stabiliser la pression délivrée en aval.', ['b00049', 'b00050']),
  fc('Quels éléments mécaniques règlent un détendeur ?', 'Un diaphragme opposé à un ressort calibré.', ['b00050']),
  fc('Pourquoi régler la bouteille sous la pression de canalisation ?', 'Pour éviter qu’une bouteille ouverte se vide à bas bruit.', ['b00055']),
  fc('Quelle fonction assure une valve antiretour ?', 'Imposer le sens du flux et empêcher reflux ou déversement.', ['b00056', 'b00057']),
  fc('Quel principe mécanique utilise un manomètre classique ?', 'La déformation d’un tube de Bourdon sous pression.', ['b00053', 'b00054', 'b00059']),
  fc('Quelle sécurité réagit à la chute de pression d’oxygène ?', 'La coupure automatique du débit de protoxyde d’azote.', ['b00060', 'b00061']),
  fc('Dans quel délai l’alarme d’oxygène décrite se déclenche-t-elle ?', 'Dans les 5 secondes suivant le défaut de pression.', ['b00061']),
  fc('Quels mécanismes peuvent asservir le protoxyde à l’oxygène ?', 'Une chaîne et des pignons, ou des diaphragmes pneumatiques couplés.', ['b00064', 'b00065', 'b00066']),
  fc('Où se situent les débitmètres dans le trajet des gaz ?', 'En aval des régulateurs, dans la partie à pression intermédiaire.', ['b00069', 'b00071', 'b00072']),
  fc('Quelle forme possède le tube de Thorpe ?', 'Un tube gradué évasé vers le haut contenant un flotteur.', ['b00072']),
  fc('Pourquoi le flotteur monte-t-il avec le débit ?', 'Un plus grand espace annulaire est requis pour équilibrer le flux accru.', ['b00072']),
  fc('Quelles propriétés du gaz influencent un débitmètre ?', 'Sa viscosité et sa densité.', ['b00072']),
  fc('Pourquoi chaque débitmètre est-il propre à un gaz ?', 'Sa graduation est calibrée pour les propriétés physiques de ce gaz.', ['b00072', 'b00075']),
  fc('Quelle est la fragilité classique d’un tube de Thorpe ?', 'Le raccord verre-métal peut fuir et appauvrir le mélange.', ['b00075']),
  fc('Quel risque crée une fuite du tube de protoxyde ?', 'Une rétropollution possible du réseau central de gaz.', ['b00075']),
  fc('Dans quel ordre placer l’oxygène parmi les débitmètres ?', 'En dernier, au plus près de la sortie commune vers le patient.', ['b00075', 'b00078', 'b00193']),
  fc('Quelle barrière finale détecte un mélange hypoxique ?', 'L’analyseur d’oxygène placé après les débitmètres.', ['b00075', 'b00079']),
  fc('Quelle FiO₂ minimale est décrite sur l’appareil cité ?', 'Une fraction inspirée minimale de 0,25.', ['b00075']),
  fc('Sous quelle forme les halogénés sont-ils stockés à température ambiante ?', 'Sous forme liquide non pressurisée.', ['b00084']),
  fc('À quoi sert un vaporisateur ?', 'À introduire une quantité contrôlée d’halogéné dans les gaz frais.', ['b00083', 'b00084']),
  fc('Pourquoi un vaporisateur est-il spécifique de l’agent ?', 'Chaque halogéné a sa propre pression de vapeur et température d’ébullition.', ['b00084']),
  fc('Quelle pression de vapeur possède le sévoflurane à 20 °C ?', 'Environ 21 kPa.', ['b00084']),
  fc('Quelle est la température d’ébullition du sévoflurane ?', 'Environ 58,5 °C.', ['b00084']),
  fc('Comment fonctionne une chambre à plénum ?', 'Une fraction des gaz lèche le liquide, se sature puis rejoint le bypass.', ['b00082', 'b00085', 'b00086']),
  fc('Pourquoi un vaporisateur compense-t-il la température ?', 'L’évaporation refroidit la cuve et réduit sinon la quantité vaporisée.', ['b00082', 'b00085']),
  fc('Quel mécanisme thermique utilise un plénum mécanique ?', 'Des lamelles métalliques ou un soufflet anéroïde modifient le bypass.', ['b00086']),
  fc('Comment un plénum se comporte-t-il en altitude ?', 'Le pourcentage monte mais la pression partielle reste stable : pas d’ajustement.', ['b00086']),
  fc('Quelle est la température d’ébullition du desflurane ?', 'Environ 22,8 °C.', ['b00087']),
  fc('Quelle pression de vapeur possède le desflurane ?', 'Environ 89 kPa.', ['b00087']),
  fc('Pourquoi la cuve de desflurane est-elle chaude ?', 'Elle est thermostatée pour stabiliser une vapeur très sensible à la température.', ['b00090', 'b00091', 'b00092']),
  fc('Comment une cuve pressurisée se comporte-t-elle en altitude ?', 'Il faut augmenter le pourcentage pour maintenir la pression partielle.', ['b00094']),
  fc('Qu’est-ce que l’effet de pompage d’un vaporisateur ?', 'Une hausse transitoire d’agent provoquée par une rétropression inspiratoire.', ['b00095', 'b00096', 'b00099', 'b00100']),
  fc('Quelle sécurité interdit deux vaporisateurs actifs ?', 'Le mécanisme d’enclenchement entre les cuves.', ['b00101', 'b00102', 'b00105', 'b00106']),
  fc('Quelles fonctions remplit un circuit anesthésique ?', 'Apporter les gaz, éliminer le CO₂, évacuer l’excès, conserver chaleur et humidité.', ['b00109']),
  fc('Quels équipements distinguent les classes fonctionnelles de circuits ?', 'Réservoir, réinspiration, absorbeur de CO₂ et valves unidirectionnelles.', ['b00109', 'b00110']),
  fc('Comment un circuit semi-ouvert évacue-t-il le CO₂ ?', 'Par le rinçage expiratoire assuré par les gaz frais.', ['b00112', 'b00113', 'b00114']),
  fc('Comment un circuit fermé évacue-t-il le CO₂ ?', 'Entièrement par l’absorbeur, avec des gaz frais limités aux besoins.', ['b00114', 'b00115']),
  fc('Quand la valve APL contrôle-t-elle la pression ?', 'Pendant la ventilation manuelle au ballon.', ['b00116', 'b00117', 'b00118', 'b00119']),
  fc('Quel est le rôle immédiat de la valve APL ?', 'Évacuer l’excès de gaz pour prévenir une surpression des voies aériennes.', ['b00122', 'b00124']),
  fc('Quels circuits de Mapleson sont les plus couramment utilisés ?', 'Les types D et F.', ['b00120', 'b00121']),
  fc('Quelle particularité définit le circuit de Bain ?', 'Le tube de gaz frais est coaxial à l’intérieur du tube ondulé.', ['b00121']),
  fc('De quoi dépend l’élimination du CO₂ dans un Mapleson ?', 'Du débit de gaz frais qui chasse les gaz expirés.', ['b00121', 'b00129', 'b00130']),
  fc('Quel débit frais vise l’absence de réinspiration dans le Mapleson D ?', 'Au moins 2,5 fois la ventilation minute.', ['b00131', 'b00133']),
  fc('Pourquoi le Mapleson convient-il à la pédiatrie ?', 'Il est léger et offre peu de résistance sans valves unidirectionnelles.', ['b00133']),
  fc('Quels défauts du Bain favorisent la réinspiration ?', 'Obstruction du tube frais ou rupture de son segment proximal.', ['b00129', 'b00130', 'b00133']),
  fc('Quels coûts entraîne le haut débit d’un Mapleson ?', 'Davantage de gaz, de pollution et de pertes thermiques et hydriques.', ['b00132', 'b00133']),
  fc('Quel circuit est le plus courant chez l’adulte ?', 'Le circuit cercle muni d’un absorbeur de CO₂.', ['b00134', 'b00135']),
  fc('Quel élément impose le sens de circulation dans le cercle ?', 'Deux valves unidirectionnelles.', ['b00134', 'b00135']),
  fc('Pourquoi l’eau est-elle indispensable dans la chaux ?', 'Elle permet la formation initiale d’acide carbonique à partir du CO₂.', ['b00135', 'b00136', 'b00139']),
  fc('Quel produit insoluble termine la réaction de la chaux ?', 'Le carbonate de calcium.', ['b00137', 'b00138', 'b00139']),
  fc('Que signale l’indicateur coloré de la chaux ?', 'L’acidification progressive et la perte d’activité de l’absorbeur.', ['b00139']),
  fc('Quel bénéfice thermique apporte le circuit cercle ?', 'La réinspiration conserve chaleur et humidité des gaz expirés.', ['b00139']),
  fc('Quel signe capnographique évoque un absorbeur épuisé ?', 'La présence de CO₂ inspiré, avec ligne de base qui ne revient pas à zéro.', ['b00142', 'b00143']),
  fc('Quel défaut valvulaire court-circuite l’absorbeur ?', 'Une valve unidirectionnelle absente ou incompétente.', ['b00142', 'b00143']),
  fc('Quelles bases fortes participent aux produits toxiques de la chaux ?', 'Le KOH et le NaOH.', ['b00144', 'b00145']),
  fc('Quand la chaux peut-elle produire du monoxyde de carbone ?', 'Lorsqu’elle est presque totalement desséchée avec certains halogénés.', ['b00145']),
  fc('Quel sous-produit est propre au sévoflurane dans la chaux ?', 'Le composé A, une oléfine liée aux bases fortes.', ['b00145']),
  fc('Quelles sources d’énergie peuvent entraîner un ventilateur ?', 'Pression d’oxygène ou d’air, ou motorisation électrique.', ['b00148', 'b00149']),
  fc('Pourquoi éviter de ventiler longtemps sur une bouteille pneumatique ?', 'Le gaz moteur consomme rapidement la réserve d’oxygène.', ['b00149']),
  fc('Quels sont les deux types majeurs de ventilateurs décrits ?', 'Double circuit à soufflet et circuit unique à piston.', ['b00150', 'b00151']),
  fc('Que fait la valve de trop-plein en fin d’expiration ?', 'Elle évacue les gaz excédentaires vers l’antipollution.', ['b00154', 'b00155']),
  fc('Comment est motorisé un ventilateur à piston ?', 'Une vis à billes entraînée électriquement déplace le piston.', ['b00156', 'b00157']),
  fc('Pourquoi le soufflet ascendant détecte-t-il mieux une fuite ?', 'Il se vide immédiatement au lieu de poursuivre sa course sous son poids.', ['b00158']),
  fc('À quoi sert la correction de compliance du circuit ?', 'À ajouter le volume perdu dans la dilatation de la tubulure.', ['b00158']),
  fc('Quel réglage modifie le rapport inspiration-expiration ?', 'Le débit inspiratoire de pointe.', ['b00166', 'b00167']),
  fc('Pourquoi une expiration trop courte est-elle dangereuse ?', 'Elle favorise la rétention gazeuse et l’hyperinflation dynamique.', ['b00166', 'b00167']),
  fc('Quel effet recherche une pression expiratoire positive ?', 'Préserver le volume téléexpiratoire et réduire les atélectasies.', ['b00169', 'b00170']),
  fc('Quel risque accompagne le volume contrôlé en faible compliance ?', 'Des pressions élevées pouvant provoquer un barotraumatisme.', ['b00171']),
  fc('Quel risque accompagne la pression contrôlée en faible compliance ?', 'Un volume courant faible avec hypoventilation.', ['b00171']),
  fc('Que combine la pression contrôlée à volume garanti ?', 'Un volume cible et la pression d’insufflation la plus basse possible.', ['b00171']),
  fc('À quoi sert l’aide inspiratoire pendant l’émergence ?', 'À compenser le travail respiratoire imposé par la tubulure.', ['b00175']),
  fc('Que reflète la fraction expirée d’un agent inhalé ?', 'Sa concentration cérébrale après le temps d’équilibration.', ['b00176', 'b00177']),
  fc('Comment fonctionne l’AINOC ?', 'Une boucle ajuste le vaporisateur pour atteindre la fraction expirée cible.', ['b00177']),
  fc('Pourquoi l’AINOC facilite-t-elle les très bas débits ?', 'Elle corrige automatiquement l’administration selon la mesure expirée.', ['b00177']),
  fc('Quel halogéné présente l’effet de serre le plus élevé ?', 'Le desflurane, nettement au-dessus du sévoflurane.', ['b00177']),
  fc('Quelle est la fonction d’un système antipollution ?', 'Évacuer les gaz excédentaires hors de l’environnement de travail.', ['b00180', 'b00181', 'b00182']),
  fc('Quels types d’antipollution sont décrits ?', 'Ouvert ou fermé, chacun pouvant être actif ou passif.', ['b00182']),
  fc('Pourquoi le système passif est-il peu utilisé à l’hôpital ?', 'Il dépend de la seule poussée des gaz et reste moins efficace.', ['b00182']),
  fc('Comment l’antipollution fermé protège-t-il le circuit ?', 'Deux soupapes limitent aspiration excessive et surpression.', ['b00182']),
  fc('À quoi sert le réservoir d’aspiration propre à l’appareil ?', 'À aspirer les sécrétions et le sang par la succion centrale.', ['b00183', 'b00184']),
  fc('Pourquoi les volatils suivent-ils une évacuation séparée ?', 'Pour stabiliser l’aspiration et éviter d’endommager le réseau des liquides.', ['b00184']),
];

export function buildChapter04(extract) {
  const sourceIds = new Set((extract?.blocs || []).map((entry) => entry.id).filter(Boolean));
  const result = {
    fiche: buildFiche(),
    flashcards: FLASHCARDS,
    series: [
      ...buildIsolatedQcmSeries(),
      ...buildDpQcmSeries(),
      ...buildIsolatedQrocSeries(),
      ...buildDpQrocSeries(),
    ],
  };
  const allRefs = [
    ...result.fiche.sourceBlocks,
    ...result.flashcards.flatMap((entry) => entry.sourceBlocks),
    ...result.series.flatMap((entry) => entry.questions.flatMap((question) => question.sourceBlocks)),
  ];
  const unknown = [...new Set(allRefs.filter((id) => !sourceIds.has(id)))];
  if (unknown.length) throw new Error(`Chapitre 04 : blocs source inconnus (${unknown.join(', ')})`);
  return result;
}

export default buildChapter04;

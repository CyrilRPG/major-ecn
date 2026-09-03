// Chapitre 06 - La ventilation mécanique.
// Module éditorial autonome, fondé exclusivement sur extract.json.

const src = (...ids) => ids;
const n2 = (text, ...children) => ({ text, children });
const row = (concept, bullets, sourceBlocks, image) => ({ concept, bullets, sourceBlocks, ...(image ? { image } : {}) });
const image = (path, caption, sourceCaption) => ({
  path, position: 'after', size: 'large', layout: 'full_width', containsText: true, caption, sourceCaption,
});

const IMAGES = {
  cycle: image('img/img_001.png', 'Lecture temporelle d’un cycle respiratoire mécanique', 'FIGURE 6.1 Le cycle respiratoire'),
  ecran: image('img/img_002.png', 'Courbes, valeurs mesurées et réglages d’un ventilateur', 'FIGURE 6.2 Les principaux paramètres et modes ventilatoires'),
  cibles1: image('img/img_003.png', 'Schémas de cible : principes, adaptation et limites', 'TABLEAU 6.1 Les sept schémas visant l’adaptation automatique des paramètres du ventilateur'),
  cibles2: image('img/img_004.png', 'Schéma de cible fondé sur l’intelligence artificielle', 'TABLEAU 6.1 | Les sept schémas visant l\'adaptation automatique des paramêtres du ventilateur'),
  indications: image('img/img_005.png', 'Situations conduisant à une assistance ventilatoire', 'TABLEAU 6.2 Les indications de la ventilation mécanique'),
  sevrage: image('img/img_006.png', 'Prérequis physiologiques avant une épreuve de sevrage', 'TABLEAU 6.3 Critères de sevrage de la ventilation mécanique'),
  pieceT: image('img/img_007.png', 'Pièce en T utilisée pour une épreuve de ventilation spontanée', 'FIGURE 6.3 LapièceenT'),
  cardio: image('img/img_008.png', 'Conséquences cardiovasculaires comparées de la respiration spontanée et de la pression positive', 'TABLEAU 6.4 Effets cardiovasculaires de la ventilation mécanique'),
  protection: image('img/img_009.png', 'Prévenir les lésions pulmonaires et les infections associées au ventilateur', 'TABLEAU 6.5 Principes de la ventilation protectrice et mesures préventives'),
  interfaces: image('img/img_010.png', 'Masques facial et nasal : compromis pratiques en VNI', 'TABLEAU 6.6 Avantages et inconvénients des interfaces de ventilation non invasive'),
};

// Ces deux visuels n'ont pas de légende source autonome exploitable : ils sont
// conservés sans légende affichée plutôt que de réintroduire la numérotation.
IMAGES.cibles2.caption = null;
IMAGES.cibles2.sourceCaption = null;
IMAGES.pieceT.caption = null;
IMAGES.pieceT.sourceCaption = null;

function buildFiche() {
  const parts = [
    {
      title: 'Comprendre la respiration imposée par la machine',
      sections: [
        {
          title: 'Finalité et mécanique élémentaire',
          rows: [
            row('Mission du ventilateur', [
              'La pression positive prend en charge la mécanique ventilatoire, les échanges gazeux et, si nécessaire, la commande respiratoire.',
              n2('Le renouvellement alvéolaire alterne deux temps.', 'Une insufflation active crée un débit vers les alvéoles.', 'L’expiration reste habituellement passive.'),
            ], src('b00003', 'b00005', 'b00006', 'b00008')),
            row('Déclenchement', [
              'Un cycle contrôlé naît d’une échéance temporelle ; un cycle assisté répond à un effort détecté par pression ou par débit.',
              'Le seuil doit être assez sensible pour limiter le travail inspiratoire sans provoquer d’auto-déclenchements.',
            ], src('b00009', 'b00029')),
            row('Objectif clinique', [
              'L’oxymétrie surveille l’oxygénation et la capnographie la ventilation ; une gazométrie complète l’évaluation lorsque les échanges sont difficiles.',
              'La cible est un compromis sûr, non une normalisation systématique des gaz du sang.',
            ], src('b00010', 'b00071', 'b00072', 'b00163', 'b00164', 'b00165')),
            row('Réglage adulte initial', [
              n2('Une base doit ensuite être individualisée.', 'Volume courant : 6 à 8 mL/kg de poids idéal.', 'Fréquence : 8 à 12 cycles/min.', 'FiO2 ajustable approximativement de 0,25 à 1.'),
              'Les contraintes pulmonaires, l’autonomie respiratoire, la profondeur anesthésique et la chirurgie imposent la réévaluation.',
            ], src('b00005', 'b00011')),
          ],
        },
        {
          title: 'Les quatre temps du cycle',
          rows: [
            row('Lecture globale', [
              'Le cycle associe une phase de débit positif, une expiration à débit négatif puis, selon le réglage, un temps à débit nul.',
              n2('Deux événements bornent l’insufflation.', 'La gâchette inspiratoire démarre le cycle.', 'Le cyclage expiratoire met fin à l’inspiration.'),
            ], src('b00013', 'b00014', 'b00017', 'b00018', 'b00019', 'b00020', 'b00021', 'b00022', 'b00023', 'b00024', 'b00025', 'b00026', 'b00027'), IMAGES.cycle),
            row('Phase inspiratoire', [
              'Pression, volume ou débit peuvent être plafonnés pendant l’insufflation sans nécessairement arrêter le cycle.',
              'Une variable limitée ne doit être confondue ni avec la variable de cyclage ni avec une alarme de sécurité.',
            ], src('b00030', 'b00031')),
            row('Cyclage', [
              'L’inspiration cesse quand la pression, le volume, le débit ou le temps atteint la valeur prévue.',
              'En ventilation volumétrique, le temps nécessaire à l’administration du volume dépend notamment du débit choisi.',
            ], src('b00032', 'b00033')),
            row('Expiration et pression de base', [
              'Le débit, la pression et le volume pulmonaires reviennent passivement vers leur niveau de repos.',
              'Une PEP maintient une pression sus-atmosphérique en fin d’expiration ; la CPAP applique ce principe pendant une respiration spontanée continue.',
            ], src('b00034', 'b00035')),
          ],
        },
      ],
    },
    {
      title: 'Choisir un mode, puis régler ce qui compte',
      sections: [
        {
          title: 'Construire un mode sans se laisser piéger par les noms',
          rows: [
            row('Taxonomie pratique', [
              'Les appellations commerciales peuvent masquer des fonctionnements identiques ou, inversement, rapprocher des modes différents.',
              n2('Identifier trois éléments avant de nommer un mode.', 'Variable contrôlée : volume, débit ou pression.', 'Séquence : contrôlée, intermittente ou spontanée.', 'Algorithme de cible et d’adaptation.'),
            ], src('b00036', 'b00037', 'b00038', 'b00039', 'b00040', 'b00048', 'b00049', 'b00050')),
            row('Variable contrôlée', [
              n2('Elle précise ce que l’appareil maintient indépendamment du patient.', 'En volume, la pression s’adapte à la mécanique.', 'En pression, le volume dépend de la mécanique.'),
              'Cette distinction doit être relue sur les courbes plutôt que déduite du seul nom du mode.',
            ], src('b00013', 'b00039', 'b00040')),
            row('Lire l’écran', [
              'Les courbes pression-temps et débit-temps relient les réglages aux valeurs réellement délivrées.',
              'Volume courant, volume minute, fréquence, pression de plateau et PEP doivent être confrontés à l’état du patient.',
            ], src('b00041', 'b00043', 'b00044', 'b00045', 'b00046', 'b00047'), IMAGES.ecran),
          ],
        },
        {
          title: 'Cinq architectures fondamentales',
          rows: [
            row('Volume contrôlé', [
              'Le débit administré pendant un temps déterminé produit le volume courant réglé.',
              'En séquence contrôlée, le patient ne place pas de respiration spontanée entre les cycles obligatoires.',
            ], src('b00051', 'b00052', 'b00053')),
            row('Volume intermittent', [
              'Des cycles obligatoires garantissent un minimum tandis que des cycles spontanés peuvent s’intercaler.',
              'L’assistance des respirations spontanées dépend du réglage et de l’effort du patient.',
            ], src('b00054', 'b00055')),
            row('Pression contrôlée', [
              n2('La pression est imposée et les autres grandeurs deviennent dépendantes.', 'Le volume courant varie avec la compliance.', 'Le débit varie avec la résistance et le gradient disponible.'),
              'À mécanique stable, les cycles délivrent des volumes proches ; toute variation de volume doit faire rechercher un changement mécanique.',
            ], src('b00056', 'b00057', 'b00058')),
            row('Pression intermittente', [
              'Une fréquence obligatoire minimale coexiste avec des cycles spontanés soutenus en pression.',
              'Le débit n’étant pas fixé, cette ventilation reste barométrique même si un algorithme adapte la pression à une cible de volume.',
            ], src('b00059', 'b00060')),
            row('Pression spontanée', [
              'Le patient commande la fréquence ; l’appareil fournit un soutien inspiratoire et une pression expiratoire.',
              'Le servo peut compenser le tube, proportionner l’aide à l’effort ou suivre un signal neurogène.',
            ], src('b00061', 'b00062')),
          ],
        },
        {
          title: 'Automatisation : bénéfice conditionnel',
          rows: [
            row('Schémas conventionnels', [
              'Les cibles vont d’un réglage fixe à une adaptation automatique fondée sur la mécanique, le volume moyen ou l’effort instantané.',
              'Plus l’algorithme intervient, plus des limites d’alarme cohérentes et une réévaluation clinique fréquente sont nécessaires.',
            ], src('b00063', 'b00066', 'b00067'), IMAGES.cibles1),
            row('Intelligence artificielle', [
              'Les paramètres peuvent être ajustés à partir de données physiologiques et de modèles algorithmiques.',
              'L’optimisation annoncée ne dispense jamais de démontrer l’efficacité clinique ni de vérifier la sécurité du réglage.',
            ], src('b00063', 'b00067'), IMAGES.cibles2),
            row('Garde-fous', [
              n2('L’automatisation reste bornée par des décisions cliniques.', 'Définir la cible et les limites d’alarme.', 'Contrôler la réponse réelle.', 'Réviser les paramètres si l’état change.'),
              'Une adaptation automatique inappropriée doit être reconnue avant qu’elle ne devienne une nouvelle contrainte pour le patient.',
            ], src('b00067')),
          ],
        },
        {
          title: 'Indiquer et prescrire',
          rows: [
            row('Deux défaillances', [
              'La ventilation devient nécessaire devant une pompe respiratoire défaillante, des échanges O2/CO2 insuffisants, ou leur association.',
              'La protection des voies aériennes, une détresse réfractaire et certaines indications thérapeutiques complètent les motifs.',
            ], src('b00068', 'b00069', 'b00075', 'b00077', 'b00078'), IMAGES.indications),
            row('Choix du mode', [
              'Aucun mode n’a une supériorité universelle : il doit répondre à la commande du patient et à la situation.',
              'Une pression spontanée convient souvent si la commande persiste ; en anesthésie, volume ou pression contrôlés sont usuels.',
            ], src('b00070', 'b00073', 'b00074')),
            row('Volume et plateau', [
              n2('Le volume courant se calcule sur le poids idéal.', '6 à 8 mL/kg dans la plupart des situations.', '4 à 6 mL/kg en SDRA, obstruction chronique ou ventilation unipulmonaire.'),
              'Viser une pression de plateau inférieure à 35 cmH2O, et inférieure à 30 cmH2O dans le SDRA.',
            ], src('b00079', 'b00080')),
            row('Fréquence et pH', [
              'Débuter souvent à 8–12/min puis adapter pour maintenir un pH supérieur à 7,32.',
              'Une PaCO2 de 50–70 mmHg peut être tolérée pour réduire le risque de volotraumatisme ; l’obstruction sévère peut imposer 5–6/min.',
            ], src('b00081', 'b00082')),
            row('PEP, temps et débit', [
              n2('La mécanique guide les réglages fins.', 'PEP 3–5 cmH2O pour préserver la CRF d’un poumon normal.', 'I/E usuel 1:2 ; 1:4 à 1:5 en hyperinflation.', 'Débit autour de 60 L/min, augmenté si demande inspiratoire élevée.'),
              'Un débit décélérant est souvent mieux toléré ; réduire le débit peut diminuer la pression de crête en mode contrôlé.',
            ], src('b00083', 'b00084', 'b00085', 'b00086', 'b00087', 'b00088', 'b00089')),
            row('Détection et oxygène', [
              'Une sensibilité d’environ 1–2 cmH2O facilite le déclenchement, mais l’auto-PEP peut maintenir un travail important.',
              'Employer la FiO2 minimale permettant une SaO2 supérieure à 90 % ou une PaO2 supérieure à 60 mmHg.',
            ], src('b00090', 'b00091', 'b00092', 'b00093')),
          ],
        },
      ],
    },
    {
      title: 'Libérer le patient du ventilateur',
      sections: [
        {
          title: 'Préparer plutôt qu’improviser',
          rows: [
            row('Sevrage anticipé', [
              'Réduire la sédation, l’interrompre quotidiennement en réanimation, restaurer l’activité musculaire et passer vers un mode spontané.',
              'Une VNI préventive peut sécuriser un patient à haut risque d’échec ; un risque laryngé justifie une évaluation avant extubation.',
            ], src('b00094', 'b00095', 'b00096')),
            row('Prérequis', [
              n2('Avant l’épreuve, confirmer une réserve suffisante.', 'Capacité vitale > 15 mL/kg et volume spontané > 2 mL/kg.', 'Fréquence spontanée < 25/min.', 'Stabilité hémodynamique, métabolique et thermique.'),
              'Une PaO2/FiO2 supérieure à 150 participe à l’évaluation, sans remplacer le jugement clinique.',
            ], src('b00097'), IMAGES.sevrage),
            row('Plan de transition', [
              n2('Anticiper les deux risques qui suivent la réussite mécanique.', 'Échec ventilatoire après retrait.', 'Obstruction laryngée ou protection insuffisante.'),
              'Le terrain détermine l’intérêt d’une VNI préventive et des mesures de surveillance postextubation.',
            ], src('b00095', 'b00096')),
          ],
        },
        {
          title: 'Quatre voies vers l’autonomie',
          rows: [
            row('Extubation rapide', [
              'Après moins de 24 heures de support, notamment au réveil anesthésique, une récupération mécanique et gazeuse permet un retrait direct.',
              'Cette stratégie suppose une protection efficace des voies aériennes et une surveillance postinterventionnelle immédiate.',
            ], src('b00099', 'b00100', 'b00101', 'b00102')),
            row('Épreuve spontanée', [
              'Une pièce en T ou le circuit laisse le patient respirer sans assistance significative pendant environ 30 minutes.',
              'La résistance de la sonde maintient un travail supérieur à la normale ; l’épreuve juge la tolérance cardiopulmonaire.',
            ], src('b00103', 'b00104', 'b00105', 'b00107'), IMAGES.pieceT),
            row('Réduction de l’IMV', [
              'Diminuer la fréquence obligatoire par paliers de 1 à 3 cycles/min après contrôle de la cause initiale.',
              'Chaque palier exige une nouvelle appréciation de la tolérance pendant les cycles spontanés.',
            ], src('b00108', 'b00109')),
            row('Réduction de l’aide', [
              'Abaisser l’aide inspiratoire de 3 à 6 cmH2O par palier.',
              'Le retrait devient envisageable quand l’aide ne compense plus que les résistances du tube et du circuit, souvent entre 3 et 14 cmH2O.',
            ], src('b00110', 'b00111')),
          ],
        },
        {
          title: 'Décider l’extubation',
          rows: [
            row('Aucune méthode reine', [
              'La technique doit être choisie selon la cause de l’insuffisance et adaptée au fil des réévaluations.',
              'La qualité de l’évaluation globale explique davantage le succès que l’application uniforme d’une seule méthode.',
            ], src('b00112')),
            row('Indice fréquence/volume', [
              'Un rapport fréquence sur volume courant en litres inférieur à 100 rend le succès plus probable ; au-dessus de 100, l’échec augmente.',
              'Sa valeur prédictive positive reste insuffisante pour prendre seul la décision.',
            ], src('b00113')),
            row('Sécrétions et terrain', [
              'Les sécrétions représentent la première cause de réintubation ; plus de deux aspirations en huit heures doivent faire différer la décision.',
              'Conscience, hémodynamique, pH, hémoglobine et température doivent être suffisamment stabilisés.',
            ], src('b00114')),
          ],
        },
      ],
    },
    {
      title: 'Prévenir les dommages de la pression positive',
      sections: [
        {
          title: 'Retentissement extrapulmonaire',
          rows: [
            row('Cœur droit', [
              'La pression intrathoracique élevée diminue le retour veineux et peut comprimer mécaniquement le cœur droit.',
              'Elle augmente aussi sa postcharge ; la baisse du débit cardiaque est maximale chez le patient dépendant de la précharge.',
            ], src('b00115', 'b00116', 'b00117', 'b00120', 'b00121', 'b00122', 'b00123'), IMAGES.cardio),
            row('Ventilation-perfusion', [
              'En décubitus dorsal, la perfusion privilégie les zones déclives tandis que la pression positive ventile plutôt les régions antérieures.',
              'La baisse de CRF, les atélectasies et la fermeture des petites voies aériennes élargissent le gradient alvéolo-artériel.',
            ], src('b00143', 'b00144')),
            row('Cerveau', [
              'L’élévation de pression intrathoracique peut augmenter la pression intracrânienne et réduire le débit sanguin cérébral par baisse du débit cardiaque.',
              'L’hypercapnie ajoute vasodilatation et œdème : la PaCO2 doit être ajustée au contexte neurologique.',
            ], src('b00145', 'b00146')),
          ],
        },
        {
          title: 'Distension et fuites gazeuses',
          rows: [
            row('Principe directeur', [
              'Le poumon physiologique travaille en pression négative ; la pression positive expose ses unités à des contraintes inhabituelles.',
              'La protection vise la réduction conjointe des pressions, de la surdistension et des cycles d’ouverture-fermeture.',
            ], src('b00124', 'b00125', 'b00126', 'b00128'), IMAGES.protection),
            row('Barotraumatisme', [
              'Une alvéole surdistendue peut laisser diffuser le gaz le long des gaines bronchovasculaires.',
              'Pneumothorax, pneumomédiastin, pneumopéricarde et emphysème sous-cutané appartiennent au spectre clinique.',
            ], src('b00129', 'b00130')),
            row('Volotraumatisme', [
              'La surdistension augmente la pression transpulmonaire, altère surfactant et perméabilité alvéolocapillaire, puis favorise l’œdème.',
              'La pression plateau reflète mieux la contrainte alvéolaire que la seule pression de crête.',
            ], src('b00131', 'b00132', 'b00133')),
            row('PEP et recrutement', [
              'Une PEP de 2 à 5 cmH2O peut accepter une atélectasie limitée ; 8 à 12 cmH2O améliorent parfois l’oxygénation sans bénéfice universel sur le devenir.',
              'Une stratégie périopératoire associe volume 6–8 mL/kg, PEP 6–8 cmH2O et recrutement 30 cmH2O pendant 30 secondes.',
            ], src('b00134', 'b00135')),
          ],
        },
        {
          title: 'Instabilité alvéolaire, oxygène et infection',
          rows: [
            row('Atélectraumatisme', [
              'La répétition de l’ouverture et de la fermeture alvéolaires crée cisaillement et lésions exsudatives.',
              'La baisse de CRF, l’oxygène concentré et la distribution non gravitaire de la ventilation entretiennent ce phénomène.',
            ], src('b00136', 'b00137')),
            row('Oxygène et inflammation', [
              'La toxicité devient surtout préoccupante au-delà de 60 % de FiO2 ; à 100 %, des signes peuvent apparaître dans les 24 heures.',
              'Maintenir la saturation autour de 94–96 % évite l’hyperoxie ; une saturation durable au-dessus de 96 % a été associée à une mortalité accrue.',
            ], src('b00138', 'b00139')),
            row('Infection associée', [
              n2('L’intubation affaiblit plusieurs défenses.', 'Toux inhibée et dysfonction mucociliaire.', 'Microaspirations et colonisation.', 'Alitement et durée de ventilation.'),
              'Après plus de deux jours, une pneumonie survient chez environ 10 à 40 % des patients ventilés ; prévention et distinction de la colonisation sont essentielles.',
            ], src('b00140', 'b00141', 'b00142')),
          ],
        },
      ],
    },
    {
      title: 'Réussir une ventilation non invasive',
      sections: [
        {
          title: 'Synchroniser sans voie trachéale',
          rows: [
            row('Définition et mode usuel', [
              'La VNI assiste la respiration sans sonde trachéale ni dispositif supraglottique.',
              'Le mode à deux niveaux de pression, déclenché par l’effort du patient, constitue une configuration fréquente.',
            ], src('b00147', 'b00148')),
            row('Condition du succès', [
              'Le confort, la synchronisation et l’étanchéité déterminent l’acceptation par un patient généralement éveillé.',
              'Une aide inefficace ou pénible conduit rapidement au rejet et peut retarder une prise en charge plus adaptée.',
            ], src('b00149', 'b00160', 'b00161')),
            row('Réévaluation précoce', [
              n2('Le support doit produire un bénéfice observable.', 'Moindre travail respiratoire.', 'Meilleurs échanges.', 'Confort et synchronisation acceptables.'),
              'Une dégradation malgré correction des fuites et du réglage impose de changer de stratégie sans attendre l’épuisement.',
            ], src('b00149', 'b00154')),
          ],
        },
        {
          title: 'Choisir et surveiller l’interface',
          renderChunks: [1, 3],
          rows: [
            row('Masque facial ou nasal', [
              n2('Le masque facial délivre plus facilement des pressions élevées.', 'Il convient à la respiration buccale.', 'Il augmente espace mort, claustrophobie et gêne de communication.'),
              'Le masque nasal est mieux toléré au long cours, facilite l’expectoration et réduit l’espace mort, mais fuit par la bouche.',
            ], src('b00150', 'b00151', 'b00153'), IMAGES.interfaces),
            row('Fuites', [
              'Une mauvaise étanchéité ou une désynchronisation compromet l’efficacité aiguë et altère le sommeil lors d’un usage chronique.',
              'Le monitorage des fuites guide l’ajustement de l’interface et du support.',
            ], src('b00154')),
            row('Cercle de sécheresse', [
              n2('Une fuite autour du masque entretient un mécanisme autoaggravant.', 'Flux nasal unidirectionnel et dessiccation.', 'Inflammation puis hausse des résistances nasales.', 'Respiration buccale et aggravation de la fuite.'),
              'L’humidification chauffée améliore l’humidité, réduit les résistances nasales et favorise la tolérance.',
            ], src('b00155', 'b00156', 'b00157', 'b00158')),
            row('Message final', [
              'Le mode, les paramètres et l’interface doivent suivre les changements physiopathologiques plutôt que forcer le patient à s’adapter.',
              'La réduction du traumatisme pulmonaire pèse davantage sur le devenir que la sophistication du nom du mode.',
            ], src('b00159', 'b00160', 'b00161', 'b00162', 'b00166', 'b00167')),
          ],
        },
      ],
    },
  ];

  const sourceBlocks = [...new Set(parts.flatMap((part) => part.sections.flatMap((section) => section.rows.flatMap((entry) => entry.sourceBlocks))))];
  return {
    matiere: 'Anesthésie-Réanimation',
    title: 'La ventilation mécanique',
    year: '2026-2027',
    coverSubtitle: 'Du cycle ventilatoire à la libération : régler, surveiller et protéger',
    sourceBlocks,
    parts,
    synthesis: {
      chiffres: {
        headers: ['Paramètre', 'Repère pratique'],
        rows: [
          ['Volume courant initial', '6–8 mL/kg de poids idéal'],
          ['Ventilation protectrice', '4–6 mL/kg selon le terrain'],
          ['Pression plateau', '< 35 cmH2O ; < 30 cmH2O dans le SDRA'],
          ['Fréquence initiale', '8–12 cycles/min'],
          ['PEP de base', '3–5 cmH2O'],
          ['Oxygénation', 'SaO2 > 90 % ou PaO2 > 60 mmHg avec FiO2 minimale'],
          ['Sevrage', 'f/VT < 100 : succès plus probable'],
        ],
      },
      tables: [{
        title: 'Raisonner devant une ventilation qui se dégrade',
        headers: ['Constat', 'Interprétation et adaptation'],
        rows: [
          ['Volume baisse en pression contrôlée', 'Rechercher compliance diminuée ou résistance accrue'],
          ['Pression de crête monte', 'Séparer résistance des voies aériennes et pression alvéolaire par la pression plateau'],
          ['Auto-PEP obstructive', 'Allonger l’expiration, réduire la fréquence et traiter l’obstruction'],
          ['Hypoxémie persistante', 'Vérifier FiO2, recrutement, PEP, shunt et rapport ventilation-perfusion'],
          ['Échec du sevrage', 'Réévaluer cause initiale, cœur, muscles, sécrétions et charge imposée'],
          ['VNI mal tolérée', 'Corriger interface, fuite, synchronisation, humidification et niveau d’aide'],
        ],
      }],
      keyPoints: [
        'Identifier variable contrôlée, séquence respiratoire et algorithme avant de choisir un mode.',
        'Calculer le volume courant sur le poids idéal et surveiller la pression plateau.',
        'Accepter des échanges imparfaits si leur normalisation impose un traumatisme pulmonaire.',
        'Adapter PEP, temps expiratoire et débit à la mécanique du patient.',
        'Préparer le sevrage dès le début par une sédation minimale et des évaluations répétées.',
        'Prévenir simultanément barotraumatisme, volotraumatisme, atélectraumatisme et infection.',
        'En VNI, l’interface et la synchronisation comptent autant que le réglage de pression.',
      ],
      eclair: [
        'Insufflation active, expiration passive : la gâchette démarre le cycle, le cyclage termine l’inspiration.',
        'VC garantit le volume mais laisse varier la pression ; PC impose la pression mais laisse varier le volume.',
        'Réglages initiaux usuels : 6–8 mL/kg, 8–12/min, PEP 3–5 cmH2O.',
        'Obstruction : expiration longue, fréquence basse, surveillance de l’auto-PEP.',
        'SDRA : petit volume, pression plateau < 30 cmH2O, PEP adaptée et hypercapnie parfois permise.',
        'Un f/VT < 100 soutient le sevrage sans remplacer l’examen global.',
        'Plus de deux aspirations en huit heures signalent un risque élevé de réintubation.',
        'La pression positive réduit la précharge droite et augmente sa postcharge.',
        'FiO2 > 60 % expose à une toxicité ; éviter une saturation durablement excessive.',
        'VNI : traiter les fuites, protéger la peau et humidifier si sécheresse nasale.',
      ],
    },
  };
}

const fc = (recto, verso, ...sourceBlocks) => ({ recto, verso, sourceBlocks });

function buildFlashcards() {
  return [
    fc('Quel est le principe mécanique de la ventilation positive ?', 'Une insufflation active sous pression suivie d’une expiration passive.', 'b00008'),
    fc('Quels volets respiratoires la ventilation mécanique peut-elle soutenir ?', 'Mécanique, échanges gazeux et commande neurogène.', 'b00003'),
    fc('Quels éléments composent une station d’anesthésie ?', 'Gaz frais, circuit, ventilateur, antipollution et moniteurs.', 'b00005'),
    fc('De quoi dépend le débit gazeux vers les alvéoles ?', 'Du gradient entre pression du ventilateur et pression alvéolaire.', 'b00008'),
    fc('Quelles variables détectent un effort inspiratoire ?', 'Une baisse de pression ou une variation de débit.', 'b00009'),
    fc('Qu’est-ce que le seuil de déclenchement ?', 'L’effort minimal nécessaire pour lancer une inspiration assistée.', 'b00009'),
    fc('Quel monitorage renseigne surtout l’oxygénation ?', 'L’oxymétrie pulsée.', 'b00010'),
    fc('Quel monitorage renseigne surtout la ventilation ?', 'La capnographie.', 'b00010'),
    fc('Quand compléter par une gazométrie artérielle ?', 'Lorsque l’oxygénation ou les échanges sont difficiles à apprécier.', 'b00010'),
    fc('Quel volume courant initial choisir chez l’adulte ?', '6 à 8 mL/kg de poids idéal.', 'b00011', 'b00080'),
    fc('Quelle fréquence ventilatoire initiale est usuelle ?', '8 à 12 cycles par minute.', 'b00011', 'b00082'),
    fc('Quelle plage de FiO2 est habituellement délivrable ?', 'Environ 0,25 à 1.', 'b00011'),
    fc('Comment calcule-t-on la ventilation minute ?', 'Volume courant multiplié par fréquence respiratoire.', 'b00013'),
    fc('Quelles variables façonnent l’insufflation ?', 'Pression, volume, débit et temps.', 'b00013', 'b00014'),
    fc('Quelles sont les trois séquences ventilatoires majeures ?', 'Contrôlée, obligatoire intermittente et continue spontanée.', 'b00014'),
    fc('Quelle gâchette démarre un cycle contrôlé ?', 'Le temps.', 'b00029'),
    fc('Quel signal neurogène peut déclencher une NAVA ?', 'L’activité électrique diaphragmatique ou phrénique.', 'b00019', 'b00029'),
    fc('Que signifie limiter une variable inspiratoire ?', 'La plafonner sans nécessairement terminer l’inspiration.', 'b00031'),
    fc('Quelles variables peuvent terminer l’inspiration ?', 'Pression, volume, débit ou temps.', 'b00033'),
    fc('Quelle phase est passive sur le plan barométrique ?', 'L’expiration.', 'b00035'),
    fc('Que maintient une PEP pendant l’expiration ?', 'Une pression sus-atmosphérique en fin d’expiration.', 'b00035'),
    fc('Quels trois éléments définissent fonctionnellement un mode ?', 'Variable contrôlée, séquence des cycles et algorithme de cible.', 'b00039', 'b00048', 'b00049'),
    fc('Pourquoi le nom commercial d’un mode peut-il tromper ?', 'Des noms différents peuvent désigner le même fonctionnement.', 'b00037', 'b00038'),
    fc('Quelle variable est garantie en volume contrôlé ?', 'Le volume courant délivré.', 'b00053'),
    fc('Comment un ventilateur moderne produit-il le volume réglé ?', 'Par un débit administré pendant un temps déterminé.', 'b00053'),
    fc('Que permet une ventilation obligatoire intermittente ?', 'Des cycles spontanés entre les cycles obligatoires.', 'b00055'),
    fc('Quelle variable est imposée en pression contrôlée ?', 'La pression inspiratoire.', 'b00057'),
    fc('De quoi dépend le volume en pression contrôlée ?', 'De la compliance et de la résistance respiratoires.', 'b00057', 'b00058'),
    fc('Qui détermine la fréquence en pression spontanée ?', 'Le patient.', 'b00062'),
    fc('Que peut compenser automatiquement une aide spontanée ?', 'La résistance du tube endotrachéal.', 'b00062'),
    fc('Quel est l’intérêt d’un schéma de cible adaptatif ?', 'Ajuster le support aux changements physiopathologiques.', 'b00067'),
    fc('Pourquoi faut-il réévaluer un mode automatisé ?', 'L’algorithme ne remplace ni l’examen ni des alarmes bien réglées.', 'b00067'),
    fc('Quelles sont les deux grandes défaillances justifiant la ventilation ?', 'Défaillance de pompe et altération des échanges gazeux.', 'b00069'),
    fc('Quelle PaO2 sévère peut soutenir une indication ventilatoire ?', 'Une PaO2 inférieure à 55 mmHg.', 'b00075'),
    fc('Quel pH associé à l’hypercapnie signale une défaillance ?', 'Un pH inférieur à 7,32.', 'b00075'),
    fc('Quelle capacité vitale traduit une mécanique très altérée ?', 'Moins de 10 mL/kg.', 'b00075'),
    fc('Quel VEMS peut indiquer une défaillance mécanique ?', 'Un VEMS inférieur à 10 mL/kg signale une mécanique respiratoire très altérée.', 'b00075'),
    fc('Quel mode initial convient souvent si la commande persiste ?', 'Un mode spontané assisté en pression.', 'b00074'),
    fc('Quels modes sont usuels en anesthésie générale ?', 'Volume contrôlé ou pression contrôlée.', 'b00074'),
    fc('Sur quel poids calculer le volume courant ?', 'Le poids idéal, non le poids réel.', 'b00080'),
    fc('Quel volume viser en SDRA ou ventilation unipulmonaire ?', '4 à 6 mL/kg de poids idéal.', 'b00080'),
    fc('Quelle pression plateau maximale viser hors SDRA ?', 'Moins de 35 cmH2O.', 'b00080', 'b00166'),
    fc('Quelle pression plateau viser dans le SDRA ?', 'Moins de 30 cmH2O.', 'b00080'),
    fc('Quel pH minimal guide l’ajustement de fréquence ?', 'Supérieur à 7,32.', 'b00082'),
    fc('Quelle PaCO2 peut relever d’une hypercapnie permissive ?', 'Environ 50 à 70 mmHg.', 'b00082'),
    fc('Pourquoi réduire la fréquence dans l’obstruction sévère ?', 'Pour allonger l’expiration et limiter l’hyperinflation.', 'b00082', 'b00086'),
    fc('Quelle PEP de base appliquer à un poumon normal ?', '3 à 5 cmH2O.', 'b00084'),
    fc('Quel rapport I/E est usuel ?', 'Environ 1:2.', 'b00086'),
    fc('Quel rapport I/E peut aider lors d’une auto-PEP ?', '1:4 ou 1:5.', 'b00086'),
    fc('Quel débit inspiratoire initial est typique ?', 'Environ 60 L/min.', 'b00088'),
    fc('Quel débit peut répondre à une forte demande ?', 'Environ 100 L/min.', 'b00088'),
    fc('Quel profil de débit est souvent mieux toléré ?', 'Un débit décélérant.', 'b00089'),
    fc('Quelle sensibilité de pression est habituelle ?', '1 à 2 cmH2O.', 'b00091'),
    fc('Pourquoi l’auto-PEP accroît-elle le travail inspiratoire ?', 'Le patient doit d’abord vaincre la pression intrinsèque.', 'b00091'),
    fc('Quelle cible minimale de SaO2 est proposée ?', 'Supérieure à 90 %.', 'b00093'),
    fc('Quelle cible minimale de PaO2 est proposée ?', 'Supérieure à 60 mmHg.', 'b00093'),
    fc('Pourquoi éviter une SaO2 supérieure à 98 % en continu ?', 'L’hyperoxie est associée à davantage de morbidité et mortalité.', 'b00093'),
    fc('Comment préparer le sevrage dès le début ?', 'Minimiser la sédation et réhabiliter la musculature.', 'b00095'),
    fc('Chez qui prévoir une VNI après extubation ?', 'Chez un patient à haut risque d’échec du retrait de la sonde.', 'b00095'),
    fc('Quelle capacité vitale précède une tentative de sevrage ?', 'Plus de 15 mL/kg.', 'b00097'),
    fc('Quel volume courant spontané minimal est attendu ?', 'Plus de 2 mL/kg.', 'b00097'),
    fc('Quelle fréquence spontanée soutient un sevrage ?', 'Moins de 25 cycles par minute.', 'b00097'),
    fc('Quel rapport PaO2/FiO2 soutient le sevrage ?', 'Supérieur à 150.', 'b00097'),
    fc('À quel patient s’adresse une extubation rapide ?', 'Support bref, souvent moins de 24 h, avec récupération complète.', 'b00101'),
    fc('Combien dure une épreuve spontanée efficace ?', 'Environ 30 minutes si aucune détresse n’apparaît.', 'b00104'),
    fc('Pourquoi une pièce en T impose-t-elle encore un travail ?', 'La sonde endotrachéale ajoute une résistance.', 'b00104'),
    fc('Par quels paliers réduire la fréquence IMV ?', 'De 1 à 3 cycles par minute.', 'b00109'),
    fc('Par quels paliers réduire l’aide inspiratoire ?', 'De 3 à 6 cmH2O.', 'b00111'),
    fc('À quel niveau d’aide envisager le retrait de sonde ?', 'Quand l’aide ne compense que le tube, souvent 3 à 14 cmH2O.', 'b00111'),
    fc('Quel indice combiné aide à prévoir le sevrage ?', 'Le rapport fréquence sur volume courant en litres.', 'b00113'),
    fc('Que signifie un rapport f/VT inférieur à 100 ?', 'Une probabilité de succès plus élevée.', 'b00113'),
    fc('Quelle est la première cause de réintubation citée ?', 'L’encombrement par les sécrétions.', 'b00114'),
    fc('Quel besoin d’aspiration doit faire réfléchir avant extubation ?', 'Plus de deux aspirations endotrachéales en huit heures.', 'b00114'),
    fc('De quoi dépend le retentissement cardiovasculaire ?', 'Surtout de la pression moyenne des voies aériennes.', 'b00117'),
    fc('Comment la pression positive agit-elle sur la précharge droite ?', 'Elle la réduit en freinant le retour veineux.', 'b00120', 'b00121'),
    fc('Comment agit-elle sur la postcharge droite ?', 'Elle l’augmente.', 'b00123'),
    fc('Chez qui le débit cardiaque chute-t-il le plus ?', 'Chez le patient dépendant de sa précharge.', 'b00122'),
    fc('Qu’est-ce qu’un barotraumatisme ?', 'Une fuite gazeuse liée à une mise sous pression excessive.', 'b00130'),
    fc('Quelles manifestations révèle un barotraumatisme ?', 'Pneumothorax, pneumomédiastin ou emphysème sous-cutané.', 'b00130'),
    fc('Qu’est-ce qu’un volotraumatisme ?', 'Une lésion et un œdème liés à la surdistension alvéolaire.', 'b00132'),
    fc('Quel indicateur approche la contrainte alvéolaire ?', 'La pression plateau.', 'b00133'),
    fc('Quelle PEP préventive minimale est décrite ?', 'Environ 2 à 5 cmH2O.', 'b00134'),
    fc('Quel recrutement est utilisé dans la stratégie IMPROVE ?', '30 cmH2O pendant 30 secondes, toutes les 30 minutes.', 'b00135'),
    fc('Qu’est-ce que l’atélectraumatisme ?', 'La lésion liée aux ouvertures et fermetures alvéolaires répétées.', 'b00137'),
    fc('À partir de quelle FiO2 la toxicité devient-elle préoccupante ?', 'Au-delà de 60 %.', 'b00139'),
    fc('Quand apparaissent les premiers effets d’une FiO2 à 100 % ?', 'Ils peuvent apparaître dans les 24 premières heures.', 'b00139'),
    fc('Quelle saturation conservatrice est proposée en réanimation ?', 'Environ 94 à 96 %.', 'b00139'),
    fc('Comment l’intubation diminue-t-elle les défenses respiratoires ?', 'Elle réduit clairance mucociliaire et toux, et favorise les microaspirations.', 'b00141'),
    fc('Quel facteur augmente continuellement le risque de pneumonie ?', 'La durée de ventilation mécanique.', 'b00141'),
    fc('Quelle fréquence de pneumonie est rapportée après deux jours ?', 'Environ 10 à 40 % des patients ventilés.', 'b00142'),
    fc('Pourquoi ventilation et perfusion se découplent-elles en décubitus ?', 'La perfusion reste déclive alors que la pression positive ventile en avant.', 'b00144'),
    fc('Quel gradient augmente lors des inégalités V/Q ?', 'Le gradient alvéolo-artériel en oxygène.', 'b00144'),
    fc('Comment la pression positive peut-elle augmenter la PIC ?', 'Par transmission intrathoracique et gêne du retour veineux cérébral.', 'b00146'),
    fc('Pourquoi l’hypercapnie est-elle dangereuse en neurologie ?', 'Elle provoque vasodilatation cérébrale et œdème.', 'b00146'),
    fc('Comment définit-on la VNI ?', 'Une assistance sans sonde trachéale ni dispositif supraglottique.', 'b00148'),
    fc('Quel mode est fréquent en VNI ?', 'Une pression assistée avec pression expiratoire positive.', 'b00148'),
    fc('Qui déclenche habituellement l’inspiration en VNI ?', 'Le patient par un signal de pression ou de débit.', 'b00148'),
    fc('Quels facteurs prédisent l’échec de VNI ?', 'Mauvaise tolérance, fuites et désynchronisation.', 'b00149', 'b00154'),
    fc('Quelle interface est la plus utilisée en VNI ?', 'Le masque facial, dans environ 70 % des cas.', 'b00150'),
    fc('Quelle part revient au masque nasal ?', 'Environ 25 % des usages.', 'b00150'),
    fc('Quel masque est mieux toléré au long cours ?', 'Le masque nasal.', 'b00150'),
    fc('Quel masque convient mieux à une respiration buccale ?', 'Le masque facial.', 'b00150'),
    fc('Quel masque facilite l’expectoration ?', 'Le masque nasal, car il laisse la bouche libre pendant la VNI.', 'b00150'),
    fc('Quel masque augmente davantage l’espace mort ?', 'Le masque facial, dont le volume interne est plus important.', 'b00150'),
    fc('Pourquoi surveiller les points d’appui du masque ?', 'Douleur et lésions cutanées peuvent faire abandonner la VNI.', 'b00153'),
    fc('Quelles sont les deux grandes causes de fuite en VNI ?', 'Mauvaise étanchéité et désynchronisation patient-respirateur.', 'b00154'),
    fc('Comment les fuites nasales entretiennent-elles l’obstruction ?', 'Elles assèchent puis enflamment la muqueuse et augmentent sa résistance.', 'b00155'),
    fc('Quel traitement réduit la sécheresse liée à la VNI ?', 'Une humidification chauffée.', 'b00156', 'b00157', 'b00158'),
    fc('Quel élément est capital pour le succès de la VNI ?', 'Le choix d’une interface adaptée au patient.', 'b00167'),
    fc('Quel objectif remplace la normalisation absolue des gaz ?', 'Le meilleur compromis entre bénéfice ventilatoire et lésions induites.', 'b00164', 'b00165'),
    fc('Qu’est-ce qui influence le plus le devenir sous ventilation ?', 'Une stratégie limitant le traumatisme pulmonaire.', 'b00161'),
  ];
}

const LETTERS = 'ABCDE';
function makeQcm(enonce, correction_generale, sourceBlocks, options, newInformation) {
  return {
    ...(newInformation ? { newInformation } : {}),
    enonce: `${newInformation ? `${newInformation} ` : ''}${enonce}`,
    format: 'qcm', sourceBlocks, correction_generale,
    items: options.map(([is_correct, itemText, justification], index) => ({ lettre: LETTERS[index], enonce: itemText, is_correct, justification })),
  };
}

function makeQroc(enonce, reponse_attendue, correction_generale, sourceBlocks, newInformation) {
  return {
    ...(newInformation ? { newInformation } : {}),
    enonce: `${newInformation ? `${newInformation} ` : ''}${enonce}`,
    format: 'qroc', reponse_attendue, correction_generale, items: [], sourceBlocks,
  };
}

// Les banques sont ajoutées ci-dessous sous forme d’objets littéraux complets.

const ISOLATED_QCM = [
  makeQcm('Quelles affirmations décrivent correctement un cycle ventilatoire mécanique ?', 'L’appareil crée l’insufflation par un gradient de pression, puis laisse habituellement l’expiration se dérouler passivement.', src('b00008', 'b00014', 'b00035'), [
    [false, 'L’appareil découpe le cycle respiratoire en deux phases seulement pour ses calculs.', 'Le fonctionnement décrit quatre phases successives, chacune associée à une variable surveillée.'],
    [true, 'L’expiration est généralement passive sur le plan barométrique.', 'Le recul élastique ramène pression, volume et débit vers leur base.'],
    [false, 'La pression alvéolaire doit dépasser celle du ventilateur pendant l’insufflation.', 'Un tel gradient ferait circuler le gaz dans le sens opposé.'],
    [false, 'Chaque inspiration assistée est obligatoirement déclenchée par le temps.', 'Un effort de pression ou de débit peut lancer un cycle assisté.'],
    [false, 'Le débit reste nul pendant toute la phase inspiratoire.', 'L’insufflation exige précisément un débit entrant.'],
  ]),
  makeQcm('Quels outils évaluent les objectifs immédiats de la ventilation ?', 'La surveillance associe SpO2 et capnographie, puis recourt à la gazométrie lorsque l’analyse non invasive ne suffit pas.', src('b00010'), [
    [false, 'La gazométrie artérielle constitue la surveillance continue de première intention.', 'Elle est un examen ponctuel de laboratoire, réservé notamment aux situations d’oxygénation difficile.'],
    [false, 'La seule pression de crête mesure la PaCO2.', 'Une pression mécanique ne renseigne pas directement sur le CO2 sanguin.'],
    [true, 'La capnographie apprécie l’élimination du dioxyde de carbone.', 'Le CO2 expiré reflète la ventilation alvéolaire et sécurise le circuit.'],
    [false, 'La radiographie remplace la surveillance continue des échanges.', 'Elle décrit l’anatomie thoracique mais ne suit pas instantanément les gaz.'],
    [false, 'Une SpO2 normale exclut toute hypoventilation.', 'Une supplémentation en oxygène peut masquer une rétention de CO2.'],
  ]),
  makeQcm('Comment une inspiration peut-elle être amorcée ?', 'Le déclenchement dépend soit de l’horloge du respirateur, soit d’un effort patient détecté, soit d’un signal neurogène spécifique.', src('b00009', 'b00029'), [
    [false, 'Un mode assisté-contrôlé interdit toute gâchette temporelle de secours.', 'Ces modes associent justement une fréquence de secours au déclenchement par le patient.'],
    [false, 'Une hausse obligatoire de 10 cmH2O sous le masque est nécessaire.', 'Le seuil assisté repose plutôt sur une baisse de pression faible.'],
    [false, 'Le volume courant expiré du cycle précédent est l’unique gâchette.', 'Plusieurs signaux de déclenchement sont disponibles.'],
    [true, 'Une variation de débit peut révéler l’effort inspiratoire.', 'Le déplacement de gaz dans le circuit précède alors l’assistance.'],
    [true, 'Un signal bioélectrique phrénique peut servir de gâchette inspiratoire.', 'Le mode NAVA lance l’assistance à partir de l’activité électrique du diaphragme.'],
  ]),
  makeQcm('Que signifie la limitation d’une variable pendant l’inspiration ?', 'Une limite plafonne la variable concernée sans constituer à elle seule le signal de fin de cycle ni une alarme.', src('b00031', 'b00033'), [
    [false, 'Limiter le débit inspiratoire garantit un volume courant constant.', 'Le volume dépend aussi du temps inspiratoire et de la mécanique du patient.'],
    [false, 'Atteindre une limite arrête toujours immédiatement l’inspiration.', 'Seule la variable de cyclage met nécessairement fin à la phase.'],
    [true, 'Une limite de débit diffère d’un seuil d’alarme.', 'Le réglage fonctionnel et la sécurité n’ont pas la même finalité.'],
    [false, 'La limitation interdit toute mesure de volume courant.', 'Le volume reste mesuré même s’il n’est pas garanti.'],
    [false, 'Une variable limitée devient automatiquement la gâchette inspiratoire.', 'Le démarrage du cycle obéit à un mécanisme distinct.'],
  ]),
  makeQcm('Quels éléments permettent d’identifier un mode au-delà de son nom commercial ?', 'La lecture fonctionnelle repose sur la variable contrôlée, l’organisation des cycles et le schéma de cible.', src('b00037', 'b00038', 'b00039', 'b00048', 'b00049'), [
    [false, 'La couleur de l’écran détermine la famille ventilatoire.', 'L’apparence de l’interface n’a aucune valeur taxonomique.'],
    [true, 'La variable contrôlée distingue notamment volume et pression.', 'Elle précise ce que l’appareil garantit pendant l’insufflation.'],
    [true, 'La séquence indique la place des cycles spontanés.', 'Contrôlé, intermittent et spontané organisent différemment la commande.'],
    [true, 'Cinq modes de base naissent du croisement de la variable contrôlée et de la séquence.', 'VC-CMV, VC-IMV, PC-CMV, PC-IMV et PC-CSV composent ces bases, la combinaison VC-CSV étant impossible.'],
    [true, 'L’algorithme de cible décrit la manière d’adapter le support.', 'Il relie les mesures aux modifications automatiques.'],
  ]),

  makeQcm('Quelles propriétés caractérisent une ventilation en volume contrôlé ?', 'Le volume résulte d’un débit réglé sur une durée donnée ; la pression varie alors avec la mécanique respiratoire.', src('b00053'), [
    [false, 'Le profil de débit est obligatoirement décélérant en volume contrôlé.', 'Le débit peut être carré ou décélérant, ce dernier étant simplement mieux toléré.'],
    [false, 'La pression inspiratoire reste identique malgré toute bronchoconstriction.', 'Une hausse de résistance augmente la pression nécessaire.'],
    [false, 'Des cycles spontanés sont toujours possibles entre les insufflations.', 'La séquence contrôlée exclut ces respirations intercalaires.'],
    [true, 'Le volume programmé constitue la variable garantie.', 'Le réglage volumétrique vise une quantité de gaz définie.'],
    [false, 'La compliance n’influence aucune pression mesurée.', 'Une compliance réduite élève les pressions pour un même volume.'],
  ]),
  makeQcm('Quelles conséquences découlent d’une ventilation en pression contrôlée ?', 'La pression est stable par réglage, tandis que le débit et le volume reflètent compliance et résistance.', src('b00057', 'b00058'), [
    [false, 'La pression prescrite en mode barométrique correspond à la pression de crête du patient.', 'Elle équivaut à la pression plateau, la crête intégrant en plus la composante résistive.'],
    [false, 'Le volume délivré est indépendant de l’état pulmonaire.', 'Il s’agit justement de la variable dépendante.'],
    [true, 'Une hausse de résistance peut modifier le débit inspiratoire.', 'La pression disponible doit vaincre davantage d’opposition au flux.'],
    [true, 'Une mécanique stable produit des volumes répétitifs.', 'Les mêmes conditions donnent une réponse proche à chaque cycle.'],
    [true, 'Le débit devient une variable dépendante des conditions du patient.', 'Le réglage porte sur la pression, laissant volume et débit suivre compliance et résistance.'],
  ]),
  makeQcm('Comment s’organisent les cycles en ventilation obligatoire intermittente ?', 'Cette séquence garantit un nombre minimal de cycles tout en laissant au patient une activité spontanée entre eux.', src('b00055', 'b00060'), [
    [false, 'Elle supprime toute respiration spontanée.', 'Cette suppression correspondrait à une séquence entièrement contrôlée.'],
    [true, 'Une fréquence obligatoire minimale peut être assurée.', 'Les cycles machine forment un filet de sécurité ventilatoire.'],
    [false, 'Chaque cycle spontané possède nécessairement le même volume imposé.', 'Son volume dépend de l’effort et de l’assistance disponible.'],
    [true, 'Des cycles supplémentaires peuvent être initiés par le patient.', 'Ils se placent entre les insufflations obligatoires.'],
    [true, 'Une fenêtre de synchronisation évite l’addition d’un cycle spontané et d’un cycle obligatoire.', 'Des périodes réfractaires encadrent la respiration obligatoire pour prévenir la sommation de volume.'],
  ]),
  makeQcm('Quels énoncés conviennent à une ventilation continue spontanée en pression ?', 'Le patient conserve la commande temporelle, et l’appareil module un soutien pressurisé selon le réglage choisi.', src('b00062'), [
    [true, 'La fréquence dépend du patient.', 'L’absence de cycles obligatoires lui laisse le rythme respiratoire.'],
    [false, 'Un volume identique est garanti malgré toute fuite.', 'La pression assistée ne fixe pas à elle seule le volume reçu.'],
    [false, 'Le support expiratoire doit rester à zéro.', 'Une pression positive expiratoire peut accompagner l’aide inspiratoire.'],
    [false, 'L’activité diaphragmatique ne peut influencer l’assistance.', 'La NAVA proportionne précisément l’aide à un signal neurogène.'],
    [true, 'La résistance du tube peut être compensée automatiquement.', 'Certains algorithmes ajustent la pression au coût mécanique du tube.'],
  ]),
  makeQcm('Comment encadrer un mode doté d’une adaptation automatique ?', 'L’automatisation améliore parfois l’ajustement mais exige des objectifs explicites, des alarmes adaptées et une surveillance clinique.', src('b00067'), [
    [true, 'Définir les limites de sécurité avant l’utilisation.', 'L’algorithme doit agir dans un domaine compatible avec le patient.'],
    [true, 'Réévaluer le malade lorsque sa physiopathologie change.', 'Une cible pertinente à un instant peut devenir inadaptée ensuite.'],
    [false, 'Désactiver toutes les alarmes afin d’éviter leur interférence.', 'Les protections restent indispensables autour de l’asservissement.'],
    [false, 'Considérer le résultat algorithmique comme une preuve de bénéfice clinique.', 'Une performance technique ne garantit pas un meilleur devenir.'],
    [false, 'Renoncer au monitorage du volume et des pressions.', 'Les mesures servent à vérifier ce que le système délivre réellement.'],
  ]),

  makeQcm('Quelles situations peuvent justifier un support ventilatoire ?', 'Les indications réunissent insuffisance de pompe, échanges défaillants, besoin de protection ou stratégie thérapeutique particulière.', src('b00069', 'b00075'), [
    [false, 'Toute indication de ventilation mécanique relève d’une seule des deux catégories physiopathologiques.', 'Chez un même patient, défaillance de pompe et trouble des échanges coexistent souvent.'],
    [true, 'Un SDRA peut nécessiter une correction de l’hypoxémie.', 'La diffusion et le rapport ventilation-perfusion deviennent insuffisants.'],
    [true, 'Une acidose métabolique peut requérir une hyperventilation thérapeutique.', 'Le support peut répondre à une forte demande compensatrice.'],
    [false, 'Une saturation normale impose systématiquement l’intubation.', 'Une valeur isolée normale n’est pas une indication.'],
    [false, 'Une pneumopathie légère sans travail respiratoire exige toujours un respirateur.', 'La décision dépend de la gravité et de l’évolution.'],
  ]),
  makeQcm('Quels réglages initiaux sont cohérents chez un adulte sans atteinte pulmonaire sévère ?', 'Une base raisonnable associe petit volume calculé sur le poids idéal, fréquence modérée, PEP physiologique et FiO2 titrée.', src('b00080', 'b00082', 'b00084', 'b00093'), [
    [true, 'Programmer 6 à 8 mL/kg de poids idéal.', 'Cette plage limite la surdistension tout en assurant la ventilation minute.'],
    [true, 'Calculer le poids idéal à partir de la taille avant de fixer le volume.', 'La formule proposée relie le poids idéal au carré de la taille du patient.'],
    [true, 'Débuter autour de 8 à 12 cycles par minute.', 'Cette fréquence convient en l’absence de besoin ventilatoire particulier.'],
    [true, 'Appliquer une PEP de 3 à 5 cmH2O.', 'Elle aide à préserver la capacité résiduelle fonctionnelle.'],
    [true, 'Réduire ensuite la FiO2 au minimum efficace.', 'L’hyperoxie prolongée n’apporte pas de bénéfice.'],
  ]),
  makeQcm('Comment ventiler un patient présentant un SDRA ?', 'La protection associe faible volume, plateau strict, PEP adaptée et acceptation possible d’une hypercapnie.', src('b00080', 'b00082', 'b00084'), [
    [true, 'Choisir souvent 4 à 6 mL/kg de poids idéal.', 'La réduction du volume diminue la surdistension.'],
    [true, 'Maintenir la pression plateau au-dessous de 30 cmH2O.', 'Cette limite plus stricte que les 35 cmH2O habituels est souhaitable dans le SDRA.'],
    [true, 'Tolérer parfois une PaCO2 entre 50 et 70 mmHg.', 'L’hypercapnie permissive évite d’augmenter dangereusement le volume.'],
    [true, 'Adapter une PEP plus élevée à l’oxygénation et à la mécanique.', 'Le recrutement peut améliorer les échanges dans le poumon lésé.'],
    [false, 'Normaliser tous les gaz malgré une hausse des contraintes.', 'Le bénéfice ventilatoire doit rester inférieur au risque de lésion.'],
  ]),
  makeQcm('Quelles adaptations conviennent à une obstruction bronchique sévère ?', 'L’objectif est d’éviter l’empilement gazeux en allongeant le temps expiratoire et en surveillant la PEP intrinsèque.', src('b00082', 'b00086', 'b00091'), [
    [false, 'Augmenter la fréquence à 30/min sans modifier les temps.', 'La réduction du temps expiratoire aggraverait l’hyperinflation.'],
    [true, 'Un rapport I/E de 1:4 peut être utile.', 'L’expiration prolongée facilite la vidange alvéolaire.'],
    [true, 'Une fréquence de 5 à 6/min peut être envisagée.', 'Des cycles espacés réduisent la rétention dynamique.'],
    [true, 'Surveiller la PEP intrinsèque malgré un seuil de sensibilité bas.', 'Le travail respiratoire reste augmenté car l’effort doit annuler la pression alvéolaire résiduelle.'],
    [false, 'Un ratio inspiration/expiration inversé améliore la vidange des unités obstructives.', 'Le rapport inversé est réservé aux constantes de temps allongées du SDRA et aggraverait ici le piégeage.'],
  ]),
  makeQcm('Quels principes guident la supplémentation en oxygène ?', 'L’oxygène est titré à la plus faible concentration assurant des objectifs raisonnables, car l’hyperoxie est délétère.', src('b00093', 'b00139'), [
    [true, 'Une SaO2 supérieure à 90 % peut constituer une cible minimale.', 'Elle accompagne une PaO2 généralement au-dessus de 60 mmHg.'],
    [true, 'Une FiO2 dépassant 60 % prolonge le risque de toxicité.', 'La concentration et la durée gouvernent le dommage oxydatif.'],
    [true, 'Une saturation autour de 94 à 96 % évite la surenchère.', 'Cette plage conservatrice limite l’exposition inutile.'],
    [false, 'Une FiO2 de 100 % est anodine pendant plusieurs jours.', 'Des manifestations toxiques peuvent débuter dès 24 heures.'],
    [true, 'Une exposition à plus de 80 % d’oxygène ajoute une résorption gazeuse alvéolaire.', 'Cette résorption contribue à la progression de l’atélectasie.'],
  ]),

  makeQcm('Quels éléments doivent être réunis avant une tentative de sevrage ?', 'La stabilité systémique s’ajoute à une mécanique suffisante et à des échanges acceptables.', src('b00095', 'b00097'), [
    [true, 'La cause ayant motivé la ventilation doit être contrôlée.', 'Un mécanisme encore actif condamne souvent l’épreuve.'],
    [true, 'Une capacité vitale supérieure à 15 mL/kg est rassurante.', 'Elle témoigne d’une réserve ventilatoire minimale.'],
    [true, 'L’arrêt quotidien de la sédation prépare la libération du ventilateur.', 'La minimisation de la sédation fait partie de la planification en amont du sevrage.'],
    [true, 'La stabilité hémodynamique doit être vérifiée.', 'Une épreuve augmente la charge cardiopulmonaire.'],
    [true, 'Un test de fuite peut être proposé chez un patient à risque d’obstruction laryngée.', 'Une fuite absente ballonnet dégonflé peut faire différer le retrait ou justifier des stéroïdes.'],
  ]),
  makeQcm('Que faut-il savoir sur l’épreuve de ventilation spontanée ?', 'Une période courte sans aide significative teste la capacité cardiopulmonaire, mais le tube continue d’ajouter une résistance.', src('b00104', 'b00105', 'b00107'), [
    [true, 'Une pièce en T peut fournir de l’oxygène sans assistance mécanique.', 'Le patient prend alors en charge l’essentiel du travail.'],
    [true, 'Trente minutes sans détresse peuvent suffire avant l’extubation.', 'Cette durée permet souvent d’identifier une mauvaise tolérance.'],
    [true, 'L’épreuve peut être répétée de façon intermittente pour entraîner les muscles respiratoires.', 'Cette utilisation convient au patient déconditionné sur le plan musculaire.'],
    [true, 'Le patient peut respirer à travers le circuit du ventilateur plutôt qu’une pièce en T.', 'Les deux montages sont décrits, le travail imposé étant simplement plus faible avec la pièce en T.'],
    [true, 'La réponse cardiovasculaire participe au jugement.', 'Le passage en spontané modifie retour veineux et charge cardiaque.'],
  ]),
  makeQcm('Quelles propositions décrivent la réduction progressive de l’aide ?', 'Le sevrage par pression diminue l’assistance par étapes jusqu’à ne compenser que la charge instrumentale.', src('b00111'), [
    [false, 'Retirer 15 cmH2O d’aide en un seul palier est la règle.', 'Des baisses plus petites permettent d’évaluer la tolérance.'],
    [true, 'Des paliers de 3 à 6 cmH2O sont utilisables.', 'Chaque diminution sollicite davantage les muscles respiratoires.'],
    [true, 'Le diamètre du tube influence l’aide résiduelle nécessaire.', 'Un petit diamètre oppose plus de résistance.'],
    [true, 'La réduction par paliers de 1 à 3 cycles obligatoires est décrite en mode intermittent.', 'Cette autre méthode de sevrage diminue la fréquence obligatoire avec une évaluation à chaque niveau.'],
    [true, 'La tolérance cardiopulmonaire est réévaluée à chaque étape.', 'La clinique décide du rythme de réduction.'],
  ]),
  makeQcm('Comment interpréter le rapport fréquence/volume courant ?', 'Cet indice synthétise respiration rapide et faible volume, mais son seuil ne remplace pas une évaluation complète.', src('b00113'), [
    [true, 'Le volume courant doit être exprimé en litres.', 'L’unité conditionne la valeur numérique du rapport.'],
    [false, 'Une valeur de 140 garantit une extubation réussie.', 'Au-dessus de 100, l’échec devient plus probable.'],
    [false, 'Une valeur de 80 impose de maintenir la sonde.', 'Elle soutient plutôt une probabilité de succès.'],
    [false, 'Le rapport se calcule en divisant le volume courant par la fréquence.', 'L’indice divise la fréquence par le volume courant exprimé en litres.'],
    [false, 'L’indice surpasse toujours le jugement clinique.', 'Sa valeur prédictive positive est limitée.'],
  ]),
  makeQcm('Quels facteurs doivent différer une extubation malgré une épreuve respiratoire correcte ?', 'Le retrait exige aussi protection des voies aériennes, faible encombrement et stabilité générale.', src('b00114'), [
    [false, 'Un test de fuite rassurant élimine tout risque d’obstruction laryngée.', 'Ce test comporte un taux élevé de faux positifs et ne remplace pas la surveillance.'],
    [false, 'Une fièvre importante n’influence pas la charge respiratoire.', 'Elle augmente la demande métabolique.'],
    [true, 'Une vigilance insuffisante compromet la protection laryngée.', 'La toux et la déglutition doivent être efficaces.'],
    [true, 'Un support par vasopresseurs rend le sevrage particulièrement difficile.', 'Le texte souligne la difficulté chez un patient vasoplégique sous amines.'],
    [true, 'Une arythmie non contrôlée fragilise la transition.', 'Le sevrage sollicite davantage le système cardiovasculaire.'],
  ]),
  makeQcm('Quels effets hémodynamiques la pression positive exerce-t-elle sur le cœur droit ?', 'L’augmentation de pression intrathoracique réduit le remplissage droit et élève la charge d’éjection du ventricule droit.', src('b00117', 'b00120', 'b00121', 'b00122', 'b00123'), [
    [false, 'La pression des voies aériennes est transmise en totalité au péricarde.', 'La transmission varie de 11 à 66 % selon la densité et la compliance pulmonaires.'],
    [false, 'La précharge droite augmente systématiquement pendant l’insufflation.', 'La pression positive tend au contraire à la réduire.'],
    [true, 'Le poumon gonflé peut comprimer mécaniquement les cavités droites.', 'Cette compression ajoute un obstacle au remplissage.'],
    [true, 'La postcharge ventriculaire droite s’élève.', 'La distension alvéolaire augmente la résistance vasculaire pulmonaire.'],
    [false, 'Le débit cardiaque est toujours préservé en hypovolémie.', 'La dépendance à la précharge amplifie sa diminution.'],
  ]),
  makeQcm('Quelles manifestations appartiennent au barotraumatisme ?', 'Le gaz échappé d’alvéoles surdistendues peut disséquer plusieurs compartiments thoraciques et sous-cutanés.', src('b00130'), [
    [true, 'Un pneumothorax peut survenir.', 'Le gaz atteint l’espace pleural après rupture alvéolaire.'],
    [true, 'Un pneumomédiastin est possible.', 'Les gaines bronchovasculaires conduisent le gaz vers le médiastin.'],
    [false, 'Une simple hypercapnie isolée définit le barotraumatisme.', 'Elle traduit un défaut ventilatoire, pas une fuite gazeuse tissulaire.'],
    [true, 'Un emphysème sous-cutané peut révéler la dissection.', 'Le gaz diffuse jusque dans les tissus superficiels.'],
    [true, 'Des embolies gazeuses figurent parmi les risques rapportés.', 'Une pression excessive peut faire pénétrer du gaz dans la circulation sanguine.'],
  ]),
  makeQcm('Quelles données orientent vers un volotraumatisme ?', 'La surdistension alvéolaire altère surfactant et barrière alvéolocapillaire, produisant inflammation et œdème.', src('b00132', 'b00133'), [
    [true, 'Une pression transpulmonaire excessive favorise la lésion.', 'Elle représente la force distendant réellement l’alvéole.'],
    [true, 'La relation entre filtration capillaire et pression de pointe devient linéaire à partir de 30 cmH2O.', 'Cette observation animale situe le seuil de surdistension délétère.'],
    [true, 'Une perte de surfactant participe à l’œdème.', 'Elle augmente les contraintes et la transsudation alvéolaire.'],
    [true, 'Le volotraumatisme a été reconnu comme complication à la fin des années 1980.', 'Sa description est plus récente que celle du barotraumatisme.'],
    [true, 'La perméabilité épithéliale et endothéliale peut être altérée.', 'La fuite capillaire aggrave l’œdème pulmonaire.'],
  ]),
  makeQcm('Quels choix composent une stratégie pulmonaire protectrice ?', 'La protection réduit volume et plateau, évite l’hyperoxie, limite le dérecrutement et prévient les infections.', src('b00126', 'b00133', 'b00134', 'b00135', 'b00139'), [
    [true, 'Calculer un faible volume sur le poids idéal.', 'La taille pulmonaire dépend mieux de la morphologie que de la masse réelle.'],
    [true, 'Contrôler la pression plateau régulièrement.', 'Elle signale une contrainte alvéolaire excessive.'],
    [false, 'Maintenir 100 % d’oxygène tant que la SpO2 est normale.', 'Cette exposition favorise toxicité et atélectasie de résorption.'],
    [false, 'Multiplier les recrutements sans évaluer l’hémodynamique.', 'La pression élevée peut réduire le retour veineux et léser le poumon.'],
    [true, 'Employer une PEP proportionnée au terrain.', 'Elle limite la fermeture alvéolaire sans imposer une distension inutile.'],
  ]),
  makeQcm('Comment survient un atélectraumatisme ?', 'Les unités instables s’ouvrent et se ferment à chaque cycle, soumettant les interfaces à un cisaillement répété.', src('b00137'), [
    [true, 'Une CRF réduite favorise la fermeture expiratoire.', 'Des alvéoles proches de leur volume de fermeture deviennent instables.'],
    [false, 'Une PEP adaptée augmente toujours le phénomène.', 'Elle peut au contraire stabiliser les unités recrutables.'],
    [false, 'Le dommage exige obligatoirement un pneumothorax.', 'Il peut rester microscopique et inflammatoire.'],
    [true, 'Les alternances de distension et d’affaissement créent des forces de cisaillement.', 'Ces contraintes lèsent membranes alvéolaire et capillaire.'],
    [false, 'La sédation augmente nécessairement la CRF.', 'Elle participe plutôt à sa diminution.'],
  ]),

  makeQcm('Quels risques accompagnent une forte exposition à l’oxygène ?', 'L’hyperoxie prolongée déclenche inflammation, toxicité alvéolocapillaire et atélectasie de résorption.', src('b00139'), [
    [true, 'Une FiO2 supérieure à 60 % augmente le risque toxique.', 'La concentration et le temps d’exposition déterminent l’agression.'],
    [true, 'Une saturation maintenue au-dessus de 96 % s’accompagne d’un excès de mortalité à trente jours.', 'Une méta-analyse de plus de 16 000 patients instables rapporte un excès de 14 %.'],
    [true, 'De hautes concentrations d’oxygène sont associées à un excès de mortalité après arrêt cardiaque.', 'Le même excès est rapporté après infarctus, accident vasculaire cérébral et traumatisme cérébral.'],
    [true, 'La réaction progresse de l’épithélium vers l’endothélium capillaire.', 'L’inflammation gagne les différentes couches de l’échangeur.'],
    [true, 'Une saturation durablement excessive doit être évitée.', 'La titration conservatrice réduit une exposition sans bénéfice.'],
  ]),
  makeQcm('Pourquoi l’intubation favorise-t-elle une pneumonie associée au ventilateur ?', 'La sonde court-circuite les défenses, favorise microaspiration et colonisation, puis le risque croît avec la durée.', src('b00141', 'b00142'), [
    [false, 'Une pneumonie sous ventilateur survient chez moins de 5 % des patients ventilés plus de deux jours.', 'L’incidence rapportée va de 10 à 40 % dans cette situation.'],
    [true, 'Le réflexe de toux est inhibé.', 'Les sécrétions colonisées sont moins bien expulsées.'],
    [true, 'Des microaspirations passent autour du ballonnet.', 'Le contenu pharyngé peut gagner les voies aériennes basses.'],
    [false, 'La colonisation bactérienne prouve à elle seule une pneumonie.', 'Le diagnostic doit distinguer portage et infection tissulaire.'],
    [false, 'Le risque décroît quand la ventilation se prolonge.', 'Il est proportionnel à la durée d’exposition.'],
  ]),
  makeQcm('Quels mécanismes aggravent les inégalités ventilation-perfusion sous pression positive ?', 'La distribution antérieure de la ventilation contraste avec la perfusion déclive, sur fond de CRF basse et d’unités fermées.', src('b00144'), [
    [true, 'La perfusion privilégie les zones pulmonaires déclives.', 'La gravité oriente davantage le flux sanguin vers ces régions.'],
    [false, 'La pression positive ventile exclusivement les bases postérieures.', 'Elle se distribue préférentiellement vers les zones de moindre résistance, souvent antérieures.'],
    [true, 'La sédation peut réduire la capacité résiduelle fonctionnelle.', 'Le volume pulmonaire de repos baisse et favorise les fermetures.'],
    [true, 'Les microatélectasies augmentent le shunt.', 'Des territoires perfusés reçoivent alors peu ou pas de ventilation.'],
    [true, 'Le volume de fermeture atteint plus facilement les bronchioles terminales en expiration.', 'La baisse de capacité résiduelle fonctionnelle rapproche ce volume du volume courant.'],
  ]),
  makeQcm('Quelles précautions concernent la ventilation d’un patient hypertendu intracrânien ?', 'Il faut limiter la transmission des pressions, préserver le débit cardiaque et contrôler la PaCO2 pour soutenir la perfusion cérébrale.', src('b00146'), [
    [true, 'La position de la tête influence la transmission veineuse.', 'Un alignement défavorable gêne le drainage crânien.'],
    [true, 'Une baisse de débit cardiaque peut réduire le débit cérébral.', 'La pression positive est plus dangereuse chez un patient précharge-dépendant.'],
    [false, 'L’hypercapnie est recherchée pour contracter les artérioles cérébrales.', 'Le CO2 les dilate et peut accroître l’œdème.'],
    [true, 'L’élévation de pression intracrânienne dépend aussi de la densité et de la compliance pulmonaires.', 'Ces propriétés conditionnent la transmission de la pression des voies aériennes au thorax.'],
    [true, 'La PaCO2 doit être surveillée lors des ajustements ventilatoires.', 'Elle module rapidement le calibre vasculaire cérébral.'],
  ]),
  makeQcm('Quelles caractéristiques définissent la ventilation non invasive ?', 'La VNI utilise une interface externe, souvent avec deux niveaux de pression et un déclenchement inspiratoire par le patient.', src('b00148'), [
    [true, 'Elle ne requiert pas de sonde endotrachéale.', 'L’interface se place hors de la trachée.'],
    [false, 'Elle impose nécessairement une ventilation totalement contrôlée.', 'La synchronisation assistée est fréquente chez le patient éveillé.'],
    [true, 'Une pression expiratoire positive peut être associée à l’aide inspiratoire.', 'Les deux niveaux de pression soutiennent oxygénation et ventilation.'],
    [false, 'Un dispositif supraglottique est indispensable.', 'Son absence fait partie de la définition présentée.'],
    [false, 'Les fuites n’influencent pas son fonctionnement.', 'Elles perturbent déclenchement, volume reçu et tolérance.'],
  ]),

  makeQcm('Quels facteurs déterminent la réussite d’une VNI ?', 'La machine doit s’accorder au patient grâce à une interface confortable, peu fuyarde et correctement synchronisée.', src('b00149', 'b00154'), [
    [true, 'La tolérance de l’interface doit être évaluée rapidement.', 'Un patient éveillé rejette une assistance pénible.'],
    [false, 'Une fuite importante améliore la sensibilité du trigger.', 'Elle peut provoquer des auto-déclenchements ou des cycles manqués.'],
    [false, 'La coopération n’a aucune importance.', 'L’acceptation du masque et des consignes conditionne souvent le succès.'],
    [true, 'La synchronisation patient-respirateur doit être observée.', 'Un décalage augmente le travail et l’inconfort.'],
    [true, 'Le volume de fuite doit être monitoré.', 'Sa quantification guide le choix et l’ajustement de l’interface.'],
  ]),
  makeQcm('Quels avantages peuvent faire choisir un masque nasal ?', 'Le masque nasal est souvent confortable au long cours, réduit l’espace mort et laisse parler ou expectorer.', src('b00150', 'b00151'), [
    [true, 'Il limite la claustrophobie comparativement au masque facial.', 'Une partie plus réduite du visage est couverte.'],
    [true, 'Il permet plus facilement l’expectoration.', 'La bouche reste libre, ce qui autorise l’évacuation des sécrétions sans retirer le masque.'],
    [false, 'Il empêche toute fuite buccale.', 'L’ouverture de la bouche constitue sa limite principale.'],
    [true, 'Il est mieux toléré lorsque la ventilation est utilisée de façon chronique.', 'Le texte réserve cet avantage au masque nasal en usage prolongé.'],
    [true, 'Son espace mort est moindre.', 'Le volume interne de l’interface est plus réduit.'],
  ]),
  makeQcm('Quels inconvénients sont associés au masque facial ?', 'La couverture oro-nasale améliore parfois l’efficacité mais augmente espace mort, gêne fonctionnelle et lésions de pression.', src('b00150', 'b00153'), [
    [true, 'Il peut provoquer une sensation de claustrophobie.', 'La large surface couverte est mal tolérée par certains patients.'],
    [true, 'Il gêne la communication et l’expectoration.', 'La bouche n’est plus libre pendant l’assistance.'],
    [true, 'Il peut favoriser une réinspiration par augmentation de l’espace mort.', 'Le volume du masque retient une fraction des gaz expirés.'],
    [true, 'Les points d’appui peuvent léser le visage.', 'La pression continue cause douleur et atteinte cutanée.'],
    [false, 'Il est inefficace chez tout patient respirant par la bouche.', 'Il est justement souvent préférable dans cette situation.'],
  ]),
  makeQcm('Quelles conséquences peuvent avoir les fuites autour d’un masque de VNI ?', 'Les fuites dégradent l’assistance et créent une sécheresse nasale qui entretient inflammation, résistance et respiration buccale.', src('b00154', 'b00155'), [
    [false, 'Elles améliorent automatiquement l’élimination du CO2.', 'Une fuite non compensée réduit plutôt le support efficace.'],
    [true, 'Elles peuvent entraîner un échec en insuffisance respiratoire aiguë.', 'L’aide et la synchronisation deviennent insuffisantes.'],
    [true, 'Un flux nasal continu assèche la muqueuse.', 'L’air non humidifié accroît les pertes hydriques locales.'],
    [true, 'Elles peuvent altérer la qualité du sommeil lors d’un usage chronique.', 'La mauvaise tolérance nocturne accompagne les fuites en ventilation prolongée.'],
    [true, 'La respiration buccale peut les aggraver secondairement.', 'Le patient contourne l’obstruction nasale et ouvre une nouvelle fuite.'],
  ]),
  makeQcm('Quel rôle joue l’humidification pendant la VNI ?', 'L’humidification chauffée rompt le cercle sécheresse-inflammation et peut ainsi améliorer confort et efficacité.', src('b00156', 'b00157', 'b00158'), [
    [false, 'Son efficacité disparaît dès qu’une fuite est présente autour du masque.', 'Le bénéfice sur l’humidité des voies aériennes persiste même en présence de fuites.'],
    [false, 'Elle doit interrompre obligatoirement la ventilation.', 'Les systèmes peuvent fonctionner pendant l’assistance.'],
    [false, 'Elle accentue les résistances de la filière nasale.', 'La diminution de sécheresse tend à les réduire.'],
    [true, 'Elle peut améliorer la tolérance du masque.', 'Une muqueuse moins irritée rend le support plus acceptable.'],
    [false, 'Elle remplace l’ajustement d’une interface mal étanche.', 'La cause mécanique de la fuite doit aussi être corrigée.'],
  ]),

  makeQcm('Pourquoi la pression plateau est-elle centrale dans la prévention des lésions ?', 'Mesurée lors d’un débit nul, elle approche mieux la pression alvéolaire que la pression de crête et guide la réduction du volume.', src('b00133', 'b00166'), [
    [true, 'Elle aide à estimer la contrainte imposée aux alvéoles.', 'La composante résistive du débit n’y contribue plus.'],
    [true, 'Elle est maintenue en dessous de 35 cmH2O pour limiter les impacts de la pression positive.', 'Ce plafond figure parmi les notions essentielles de la ventilation protectrice.'],
    [true, 'Sa réduction peut nécessiter un volume courant plus petit.', 'Moins de volume diminue la distension du parenchyme.'],
    [true, 'Une acidose respiratoire modérée peut être acceptée pour la respecter.', 'L’hypercapnie permissive évite une ventilation agressive.'],
    [true, 'Sa mesure exige une pause inspiratoire pendant laquelle le débit devient nul.', 'Une pause télé-inspiratoire annule le flux et laisse apparaître la valeur alvéolaire.'],
  ]),
  makeQcm('Quelles affirmations concernent la PEP ?', 'La PEP stabilise le volume expiratoire mais sa dose dépend du poumon, de l’oxygénation, du recrutement et de la tolérance circulatoire.', src('b00084', 'b00134'), [
    [true, 'Une valeur de 3 à 5 cmH2O est courante sur poumon normal.', 'Elle vise le maintien de la capacité résiduelle fonctionnelle.'],
    [false, 'Toute PEP supérieure à 5 cmH2O améliore le pronostic postopératoire.', 'Des niveaux plus élevés n’ont pas montré un bénéfice universel.'],
    [false, 'Une auto-PEP impose toujours de supprimer la PEP externe.', 'Une PEP adaptée peut parfois faciliter le déclenchement.'],
    [false, 'La PEP intrinsèque s’observe surtout dans les pneumopathies restrictives.', 'Elle est décrite dans la maladie obstructive chronique et la défaillance cardiaque gauche.'],
    [true, 'Dans le SDRA, un niveau plus élevé peut être nécessaire.', 'Le recrutement d’unités instables peut améliorer l’oxygénation.'],
  ]),
  makeQcm('Quels messages résument une prescription ventilatoire raisonnée ?', 'Le choix initial doit être suivi de mesures, d’une adaptation au terrain et d’une recherche permanente du moindre dommage.', src('b00074', 'b00160', 'b00161', 'b00163'), [
    [true, 'Réexaminer fréquemment l’évolution physiopathologique.', 'Les besoins de support changent avec la maladie et le traitement.'],
    [false, 'Conserver le même mode même si le patient lutte.', 'Une mauvaise interaction justifie un ajustement du support.'],
    [true, 'Privilégier le bénéfice clinique plutôt que la sophistication.', 'Un nom complexe ne garantit ni efficacité ni sécurité.'],
    [true, 'Les données probantes manquent pour privilégier un mode particulier.', 'Le texte souligne l’absence de preuve en faveur d’un mode spécifique.'],
    [true, 'Limiter le traumatisme tissulaire influence le devenir.', 'La stratégie protectrice est plus déterminante que le mode isolé.'],
  ]),
  makeQcm('Quelles données rendent un sevrage favorable sans le garantir ?', 'Les seuils physiologiques structurent l’évaluation, mais la décision finale intègre clinique, sécrétions et cause initiale.', src('b00097', 'b00113', 'b00114'), [
    [false, 'Une capacité vitale de 8 mL/kg suffit avant une épreuve de sevrage.', 'Le repère proposé se situe au-dessus de 15 mL/kg.'],
    [false, 'Un rapport PaO2/FiO2 de 80 est suffisant.', 'La valeur proposée avant sevrage dépasse 150.'],
    [false, 'Un rapport fréquence/volume courant de 130 annonce un sevrage facile.', 'Au-delà de 100, les probabilités d’échec et de réintubation augmentent.'],
    [false, 'Des aspirations toutes les deux heures sont favorables.', 'Un encombrement fréquent accroît la réintubation.'],
    [true, 'Une stabilité cardiovasculaire reste indispensable.', 'Le passage en spontané peut révéler une insuffisance cardiaque.'],
  ]),
  makeQcm('Que distingue le masque facial du masque nasal en VNI ?', 'Le choix oppose surtout étanchéité et pression délivrable à confort, espace mort réduit et liberté de la bouche.', src('b00150', 'b00151'), [
    [false, 'Le masque nasal représente l’interface la plus utilisée en pratique.', 'Le masque facial domine avec environ 70 % des usages contre 25 % pour le nasal.'],
    [false, 'Le nasal est toujours préféré en détresse aiguë sévère.', 'Sa fuite buccale peut limiter l’efficacité dans ce contexte.'],
    [true, 'Le facial accepte souvent des pressions plus élevées.', 'Sa couverture permet une meilleure étanchéité.'],
    [false, 'Le facial facilite davantage l’expectoration.', 'La bouche couverte rend cette fonction plus difficile.'],
    [true, 'Le nasal est souvent mieux toléré lors d’un usage chronique.', 'Il est moins encombrant et laisse la bouche libre.'],
  ]),
  makeQcm('Quels principes protègent simultanément poumon et patient ?', 'Une ventilation sûre équilibre faible contrainte pulmonaire, oxygène titré, prévention infectieuse et surveillance systémique.', src('b00126', 'b00139', 'b00141', 'b00146'), [
    [true, 'Réduire volume et pression lorsque le plateau s’élève.', 'Cette adaptation limite la surdistension alvéolaire.'],
    [true, 'Éviter une FiO2 élevée plus longtemps que nécessaire.', 'L’exposition concentrée génère toxicité et résorption gazeuse.'],
    [false, 'Négliger l’hygiène buccale tant que le ballonnet est gonflé.', 'Les sécrétions colonisées microaspirées favorisent la pneumonie.'],
    [false, 'Accepter toute hypercapnie chez un traumatisé crânien.', 'Le CO2 élevé peut aggraver pression et œdème cérébraux.'],
    [true, 'Réduire la durée de ventilation quand l’autonomie revient.', 'Moins d’exposition diminue notamment le risque infectieux.'],
  ]),
];

const DP_QCM = [
  {
    label: 'Premiers réglages au bloc opératoire',
    vignette: 'Un homme de 58 ans, 172 cm, sans maladie respiratoire, est ventilé après induction pour colectomie. L’hémodynamique est stable et les poumons sont cliniquement normaux. Le tube endotrachéal est correctement positionné, la capnographie continue et le respirateur ne signale aucune fuite. L’équipe doit choisir puis adapter les paramètres pendant l’intervention.',
    questions: [
      makeQcm('Quels principes guident les premiers réglages ?', 'La prescription initiale protège le poumon tout en fournissant des échanges suffisants, puis elle est ajustée sur les mesures.', src('b00005', 'b00010', 'b00074', 'b00080'), [
        [true, 'Calculer le volume courant sur le poids idéal.', 'La taille pulmonaire suit surtout la taille et le sexe.'],
        [true, 'Choisir un mode contrôlé compatible avec l’anesthésie générale.', 'Une commande supprimée nécessite des cycles assurés par la machine.'],
        [false, 'Programmer d’emblée 12 mL/kg pour prévenir l’atélectasie.', 'Ce volume expose à la surdistension.'],
        [false, 'Viser la normalisation de chaque valeur au prix de fortes pressions.', 'Le compromis protecteur prime sur une valeur parfaite.'],
        [false, 'Suspendre la capnographie après l’intubation.', 'Le CO2 expiré reste essentiel au suivi ventilatoire.'],
      ]),
      makeQcm('Quels réglages sont raisonnables ?', 'Chez cet adulte sans atteinte sévère, 6–8 mL/kg, 8–12/min et une PEP faible constituent une base cohérente.', src('b00080', 'b00082', 'b00084'), [
        [false, 'Un volume courant de 12 mL/kg de poids idéal convient à ce patient.', 'La plage recommandée s’arrête à 8 mL/kg pour rester protectrice.'],
        [false, 'Une fréquence obligatoire de 30/min.', 'Une telle cadence n’est pas justifiée par les données initiales.'],
        [true, 'Une PEP de 4 cmH2O.', 'Elle aide à maintenir la CRF du poumon normal.'],
        [false, 'Un rapport I/E de 2:1.', 'Le rapport usuel est plutôt de 1:2.'],
        [false, 'Une FiO2 fixe à 1 pendant toute l’intervention.', 'La concentration doit être titrée après sécurisation.'],
      ], 'Le respirateur est prêt, sans particularité de compliance ni de résistance.'),
      makeQcm('Comment interpréter ces valeurs ?', 'Le volume est délivré comme prévu et les pressions restent protectrices ; la FiO2 peut être abaissée sous contrôle de la saturation.', src('b00053', 'b00080', 'b00093', 'b00133'), [
        [true, 'La pression plateau de 18 cmH2O est rassurante.', 'Elle reste très inférieure à la limite de protection.'],
        [false, 'La pression de crête prouve une surdistension alvéolaire.', 'La composante résistive participe à la pression de crête.'],
        [false, 'Le volume courant doit être augmenté puisque la PaCO2 est normale.', 'L’absence d’hypercapnie ne justifie pas plus de volume.'],
        [true, 'La FiO2 peut être réduite progressivement.', 'Une SpO2 élevée permet de rechercher la concentration minimale efficace.'],
        [false, 'La PEP doit être supprimée pour accélérer l’expiration.', 'Aucun piégeage n’est décrit et une faible PEP préserve la CRF.'],
      ], 'Après dix minutes en volume contrôlé, le VT expiré est conforme, la pression de crête vaut 24 cmH2O, le plateau 18 cmH2O et la SpO2 100 % sous FiO2 0,60.'),
      makeQcm('Quelles hypothèses deviennent plausibles ?', 'Une hausse isolée de la pression de crête avec plateau stable oriente vers une augmentation de résistance des voies aériennes.', src('b00013', 'b00057', 'b00133'), [
        [false, 'Une baisse majeure de compliance explique nécessairement le profil.', 'Elle élèverait aussi la pression plateau.'],
        [true, 'Une coudure de la sonde doit être recherchée.', 'Un obstacle proximal augmente la résistance au débit.'],
        [true, 'Des sécrétions peuvent obstruer partiellement le tube.', 'L’encombrement accroît la pression résistive.'],
        [true, 'Un débit inspiratoire devenu trop élevé majorerait aussi la seule pression de crête.', 'Le texte indique que réduire le débit abaisse les pressions de crête en ventilation contrôlée.'],
        [true, 'Un bronchospasme peropératoire est possible.', 'Le calibre bronchique réduit augmente la résistance inspiratoire.'],
      ], 'Soudain, la pression de crête passe à 38 cmH2O alors que le plateau reste à 19 cmH2O et que le volume expiré est conservé.'),
      makeQcm('Quelles actions sont pertinentes ?', 'La priorité est de sécuriser le circuit et les voies aériennes, traiter l’obstruction probable et vérifier l’effet sur les échanges.', src('b00010', 'b00088', 'b00141'), [
        [true, 'Inspecter le tube et le circuit pour une obstruction mécanique.', 'Une correction simple peut normaliser immédiatement la résistance.'],
        [true, 'Aspirer si des sécrétions sont suspectées.', 'Le retrait d’un bouchon restaure le calibre endotrachéal.'],
        [true, 'Administrer un bronchodilatateur si le bronchospasme est confirmé.', 'Le traitement réduit la résistance des voies aériennes.'],
        [false, 'Doubler le volume courant pour vaincre l’obstacle.', 'Cette réponse augmenterait encore les pressions.'],
        [false, 'Ignorer la capnographie puisque la SpO2 reste normale.', 'Le CO2 expiré peut montrer précocement une hypoventilation.'],
      ], 'L’auscultation retrouve des sibilants diffus et le capnogramme prend un aspect obstructif.'),
      makeQcm('Comment adapter le débit inspiratoire ?', 'Un débit décélérant et éventuellement moins élevé peut réduire le pic de pression, à condition de satisfaire le besoin ventilatoire.', src('b00088', 'b00089'), [
        [false, 'Imposer 100 L/min est obligatoire dans tout bronchospasme.', 'Un haut débit peut augmenter la composante résistive.'],
        [true, 'Un profil décélérant peut améliorer la tolérance mécanique.', 'Le débit initial se réduit au cours de l’insufflation.'],
        [false, 'Le débit ne modifie jamais la pression de crête.', 'La pression résistive dépend directement du flux.'],
        [false, 'Le débit inspiratoire se règle indépendamment du volume courant et du rapport I/E.', 'Il est typiquement une variable dépendante de ces réglages, ajustable isolément sur certains appareils seulement.'],
        [false, 'Le temps expiratoire doit être raccourci pour compenser.', 'L’obstruction nécessite plutôt une vidange suffisante.'],
      ], 'Après traitement, les sibilants diminuent mais la pression de crête reste sensible au débit carré réglé à 80 L/min.'),
      makeQcm('Quels éléments confirment une évolution favorable ?', 'La guérison associe résistance moindre, échanges stables et maintien d’un plateau protecteur sans surenchère ventilatoire.', src('b00010', 'b00133'), [
        [false, 'Une pression de crête à 26 cmH2O expose déjà au barotraumatisme.', 'Le risque est rapporté au-delà de pressions de pointe supérieures à 40 cmH2O.'],
        [false, 'Une SpO2 de 100 % impose de remonter la FiO2.', 'Elle permet au contraire une titration vers le bas.'],
        [true, 'Un capnogramme moins obstructif soutient l’amélioration.', 'La pente expiratoire se normalise quand la vidange bronchique s’améliore.'],
        [false, 'Un plateau à 36 cmH2O serait acceptable sur poumon sain.', 'Il dépasserait la limite proposée et signalerait une contrainte alvéolaire excessive.'],
        [false, 'La protection pulmonaire devient inutile après correction.', 'Elle reste le principe de toute la ventilation.'],
      ], 'La pression de crête revient à 26 cmH2O, le plateau à 18 cmH2O, l’EtCO2 se stabilise et la FiO2 est abaissée à 0,35.'),
    ],
  },
  {
    label: 'SDRA et ventilation protectrice',
    vignette: 'Une femme de 46 ans est intubée pour SDRA. Sous FiO2 0,70, sa PaO2 est à 62 mmHg. La compliance est réduite et les infiltrats sont bilatéraux. Elle est profondément sédatée, sans effort spontané, et sa pression artérielle permet encore des ajustements prudents de PEP. L’objectif est de restaurer une oxygénation acceptable sans majorer les lésions induites.',
    questions: [
      makeQcm('Quels objectifs doivent primer ?', 'Le poumon lésé requiert une oxygénation acceptable obtenue avec le moins de surdistension possible.', src('b00069', 'b00080', 'b00125'), [
        [true, 'Limiter le volume courant selon le poids idéal.', 'Le faible volume réduit la contrainte répétée.'],
        [true, 'Accepter une hypercapnie permissive entre 50 et 70 mmHg si nécessaire.', 'Cette tolérance est raisonnable quand le risque de volotraumatisme est élevé.'],
        [true, 'Surveiller étroitement la pression plateau.', 'Elle approche la charge alvéolaire.'],
        [true, 'Adapter la PEP à l’oxygénation et au recrutement.', 'Le SDRA peut bénéficier d’une pression expiratoire plus élevée.'],
        [true, 'Réévaluer fréquemment l’état clinique pour ajuster les paramètres.', 'Le grand défi de la ventilation mécanique est décrit comme plus clinique que technologique.'],
      ]),
      makeQcm('Quelles adaptations sont indiquées ?', 'Le plateau dépasse la cible du SDRA : il faut réduire le volume et accepter au besoin une élévation contrôlée du CO2.', src('b00080', 'b00082', 'b00133'), [
        [true, 'Abaisser le volume courant vers 4 à 6 mL/kg.', 'La distension doit être réduite malgré la baisse éventuelle de ventilation minute.'],
        [true, 'Viser un plateau inférieur à 30 cmH2O.', 'Cette limite est plus stricte dans le SDRA.'],
        [false, 'Augmenter le VT à 10 mL/kg pour corriger la PaCO2.', 'La correction accroîtrait la lésion mécanique.'],
        [false, 'Supprimer toute PEP indépendamment de la PaO2.', 'Le dérecrutement aggraverait probablement le shunt.'],
        [true, 'Tolérer une hypercapnie si le pH reste supérieur à 7,32.', 'Cette concession permet une ventilation moins agressive.'],
      ], 'Le VT actuel est de 8 mL/kg de poids idéal, la pression plateau atteint 34 cmH2O et le pH est à 7,38.'),
      makeQcm('Comment interpréter l’évolution ?', 'La protection mécanique est améliorée au prix d’une hypercapnie acceptable ; l’hypoxémie impose surtout une optimisation du recrutement.', src('b00082', 'b00084'), [
        [true, 'La PaCO2 à 58 mmHg peut être acceptée.', 'Elle se situe dans la plage d’hypercapnie permissive.'],
        [true, 'Le pH reste au-dessus de la valeur cible de 7,32.', 'La fréquence est ajustée pour maintenir le pH sanguin au-dessus de ce seuil.'],
        [true, 'La PEP peut être augmentée prudemment.', 'Une pression expiratoire adaptée peut recruter des unités instables.'],
        [false, 'Le plateau à 28 cmH2O exige de remonter le VT.', 'La valeur obtenue correspond à l’objectif protecteur.'],
        [true, 'La réponse hémodynamique doit accompagner tout changement de PEP.', 'Une pression moyenne plus élevée peut réduire le retour veineux.'],
      ], 'Après réduction du VT, le plateau est à 28 cmH2O, la PaCO2 à 58 mmHg, le pH à 7,34 et la PaO2 reste à 60 mmHg.'),
      makeQcm('Quels résultats soutiennent l’efficacité du recrutement ?', 'Une hausse d’oxygénation et de compliance sans instabilité suggère l’ouverture d’unités recrutables.', src('b00134', 'b00135'), [
        [false, 'La manœuvre décrite se répète idéalement toutes les cinq minutes.', 'Le protocole évalué appliquait un recrutement toutes les trente minutes.'],
        [false, 'Une chute marquée de pression artérielle est un succès attendu.', 'Elle signale une mauvaise tolérance circulatoire.'],
        [false, 'Une pression plateau qui grimpe à 38 cmH2O est protectrice.', 'La surdistension annulerait le bénéfice.'],
        [true, 'Un VT identique obtenu avec moins de pression traduit une meilleure compliance.', 'Le poumon accepte davantage de volume pour la même force.'],
        [false, 'L’absence de changement de SpO2 prouve un recrutement massif.', 'Sans effet mesurable, le bénéfice reste incertain.'],
      ], 'Une manœuvre à 30 cmH2O pendant 30 secondes est suivie d’une PEP de 8 cmH2O ; la PaO2 monte à 78 mmHg sans hypotension.'),
      makeQcm('Quelles mesures réduisent l’exposition toxique ?', 'Une fois l’oxygénation stabilisée, la FiO2 doit décroître et la saturation rester dans une plage conservatrice.', src('b00093', 'b00139'), [
        [true, 'Titrer progressivement la FiO2 vers la valeur minimale efficace.', 'La dose d’oxygène dépend de la concentration et de la durée.'],
        [false, 'Maintenir une SpO2 à 100 % comme cible obligatoire.', 'La sursaturation n’améliore pas nécessairement le transport utile.'],
        [true, 'Accepter une saturation autour de 94 à 96 %.', 'Cette plage évite l’hyperoxie prolongée.'],
        [true, 'Considérer que la toxicité dépend de la concentration et de la durée d’exposition.', 'L’agression pulmonaire s’installe surtout au-delà de 60 % et se manifeste dès les premières 24 heures à 100 %.'],
        [true, 'Réévaluer les gaz après chaque modification importante.', 'La PaO2 objective la marge disponible.'],
      ], 'Après stabilisation, la SpO2 reste à 99 % sous FiO2 0,70.'),
      makeQcm('Quelles complications mécaniques faut-il rechercher ?', 'Le poumon très contraint peut développer fuite gazeuse, œdème de surdistension et lésions d’ouverture-fermeture.', src('b00130', 'b00132', 'b00137'), [
        [true, 'Le barotraumatisme peut produire un pneumothorax.', 'Une rupture alvéolaire permet au gaz de gagner la plèvre.'],
        [true, 'Le volotraumatisme peut augmenter l’œdème.', 'La barrière alvéolocapillaire devient perméable.'],
        [false, 'L’atélectraumatisme résulte uniquement d’une FiO2 basse.', 'Il dépend surtout de l’instabilité des unités alvéolaires.'],
        [true, 'Les cycles d’ouverture-fermeture créent du cisaillement.', 'Les interfaces capillaires et alvéolaires sont répétitivement étirées.'],
        [true, 'L’emphysème sous-cutané cervical témoigne d’une dissection gazeuse.', 'Le gaz extrait d’une alvéole distendue envahit les espaces et les tissus voisins.'],
      ], 'Au quatrième jour, une baisse brutale de SpO2 apparaît avec emphysème sous-cutané cervical.'),
      makeQcm('Quelles conduites sont cohérentes ?', 'La complication évoque une fuite gazeuse grave : l’évaluation immédiate et la réduction des contraintes accompagnent le traitement spécifique.', src('b00130', 'b00133', 'b00166'), [
        [true, 'Rechercher rapidement un pneumothorax.', 'Le tableau clinique est compatible avec un barotraumatisme pleural.'],
        [true, 'Réduire les pressions et le volume si possible.', 'La limitation de la contrainte évite d’aggraver la fuite.'],
        [true, 'Un pneumothorax sous tension peut perturber les fonctions cardiovasculaires.', 'L’accumulation excessive d’air pleural gêne le remplissage et l’éjection.'],
        [true, 'Confirmer le diagnostic par un examen rapide au lit du patient.', 'L’imagerie ou l’échographie immédiate oriente vers la décompression.'],
        [true, 'Traiter sans attendre si des signes de compression sont présents.', 'La décompression devient urgente en cas d’instabilité.'],
      ], 'L’auscultation est asymétrique et la pression artérielle chute rapidement.'),
    ],
  },
  {
    label: 'Obstruction et auto-PEP',
    vignette: 'Un homme de 67 ans atteint de MPOC est intubé pour exacerbation hypercapnique. Il présente une expiration prolongée et une forte demande ventilatoire. L’auscultation retrouve des sibilants diffus et la capnographie une pente expiratoire lente. Les réglages doivent éviter le piégeage dynamique tout en laissant reprendre une commande spontanée efficace.',
    questions: [
      makeQcm('Quels risques sont prioritaires lors du réglage ?', 'L’obstruction expose au piégeage expiratoire, au travail de déclenchement et à une pression excessive si la fréquence est trop élevée.', src('b00082', 'b00086', 'b00091'), [
        [false, 'Une fréquence de 20 cycles par minute limite l’hyperinflation chez l’obstructif.', 'Une fréquence de 5 à 6 cycles peut être envisagée quand la résistance est très augmentée.'],
        [true, 'Une sensibilité apparemment faible peut rester difficile à déclencher.', 'L’effort doit d’abord compenser la pression alvéolaire résiduelle.'],
        [false, 'La priorité est un rapport I/E inversé.', 'Il réduirait le temps de vidange et augmenterait rapidement le piégeage expiratoire.'],
        [false, 'Le volume doit être calculé sur le poids réel.', 'Le poids idéal reste la référence car le poids réel surestime la taille pulmonaire.'],
        [false, 'L’hypercapnie doit toujours être corrigée en quelques minutes.', 'Une correction agressive peut majorer l’hyperinflation.'],
      ]),
      makeQcm('Quelles anomalies indiquent un piégeage dynamique ?', 'Le débit expiratoire non revenu à zéro et la PEP intrinsèque élevée démontrent une vidange incomplète.', src('b00035', 'b00086', 'b00091'), [
        [true, 'Le débit expiratoire persistant avant le cycle suivant est anormal.', 'Il prouve que l’expiration n’est pas achevée.'],
        [true, 'Le temps expiratoire disponible est trop court pour la constante de temps des unités.', 'L’hyperinflation dynamique naît d’une vidange interrompue par le cycle suivant.'],
        [true, 'Une PEP totale de 12 pour une PEP réglée à 4 révèle une composante intrinsèque.', 'La différence correspond au piégeage.'],
        [true, 'La tachycardie peut refléter une mauvaise tolérance.', 'L’hyperinflation réduit le remplissage et augmente le travail.'],
        [true, 'Des efforts inspiratoires restant sans cycle machine accompagnent souvent ce piégeage.', 'Le seuil du ventilateur est atteint seulement après compensation de la pression alvéolaire résiduelle.'],
      ], 'La courbe de débit ne rejoint pas zéro avant le cycle suivant ; la PEP totale est mesurée à 12 cmH2O pour 4 cmH2O réglés.'),
      makeQcm('Quelles modifications réduisent l’auto-PEP ?', 'Il faut diminuer la ventilation imposée par unité de temps et allonger franchement l’expiration.', src('b00082', 'b00086', 'b00088'), [
        [true, 'Réduire la fréquence respiratoire.', 'Des intervalles plus longs facilitent la vidange.'],
        [false, 'Passer le rapport I/E de 1:4 à 1:1.', 'L’expiration serait écourtée alors que les unités obstructives ont besoin de davantage de temps.'],
        [true, 'Augmenter le débit inspiratoire si cela raccourcit le temps inspiratoire.', 'Une insufflation plus brève laisse davantage de temps expiratoire.'],
        [false, 'Augmenter le volume courant pour ouvrir les bronches.', 'Un volume supérieur aggrave l’empilement gazeux.'],
        [true, 'Traiter la bronchoconstriction et les sécrétions.', 'Réduire la résistance accélère la vidange alvéolaire.'],
      ], 'La fréquence est de 18/min, le rapport I/E de 1:2 et le débit inspiratoire de 50 L/min.'),
      makeQcm('Comment interpréter la gazométrie ?', 'Le pH reste juste au-dessus de la cible et la PaCO2 dans une plage tolérable ; la sécurité mécanique prime.', src('b00082'), [
        [false, 'Le pH impose de revenir à 18 cycles/min.', 'La cible proposée reste dépassée malgré l’hypercapnie.'],
        [true, 'La PaCO2 à 68 mmHg peut être tolérée temporairement.', 'Elle entre dans l’intervalle d’hypercapnie permissive.'],
        [false, 'Un grand volume courant est indiqué pour normaliser le CO2.', 'Il aggraverait le piégeage et la pression.'],
        [true, 'La tendance du pH doit être surveillée.', 'Une acidose progressive modifierait le compromis.'],
        [false, 'L’auto-PEP n’a plus besoin d’être mesurée.', 'La correction des gaz ne garantit pas une vidange suffisante.'],
      ], 'Après réglage à 8 cycles/min et I/E 1:4, la PaCO2 est à 68 mmHg et le pH à 7,33.'),
      makeQcm('Quels éléments expliquent les efforts inefficaces ?', 'Le patient doit générer une dépression supérieure à l’auto-PEP avant même d’atteindre le seuil du ventilateur.', src('b00009', 'b00029', 'b00091'), [
        [true, 'La PEP intrinsèque constitue une charge seuil.', 'L’alvéole reste pressurisée au début de l’effort.'],
        [true, 'Une faiblesse musculaire peut empêcher d’atteindre le trigger.', 'La dépression produite devient insuffisante.'],
        [true, 'Rendre le trigger plus sensible peut réduire le nombre de cycles manqués.', 'Un seuil plus accessible transforme davantage d’efforts en cycles assistés.'],
        [false, 'Les fuites sont l’unique cause possible.', 'Elles ne sont pas décrites ici et l’auto-PEP suffit à expliquer.'],
        [true, 'Une PEP externe prudemment ajustée peut réduire l’effort seuil.', 'Elle rapproche la pression du circuit de la pression alvéolaire.'],
      ], 'Le patient reprend des efforts ; plusieurs dépressions œsophagiennes ne déclenchent aucun cycle.'),
      makeQcm('Quels réglages favorisent la synchronisation ?', 'Le trigger doit devenir accessible sans auto-déclenchement, tandis que l’assistance et le temps expiratoire restent compatibles avec l’obstruction.', src('b00009', 'b00062', 'b00091'), [
        [true, 'Ajuster la sensibilité après observation des courbes.', 'Le réglage doit répondre à l’effort réel du patient.'],
        [false, 'Supprimer toute surveillance des fuites.', 'Une fuite peut déclencher faussement certains respirateurs.'],
        [false, 'Imposer une fréquence contrôlée élevée.', 'Elle concurrencerait la commande et raccourcirait l’expiration.'],
        [true, 'Choisir une aide proportionnée au travail respiratoire.', 'Un soutien adéquat évite fatigue et volumes excessifs.'],
        [true, 'Conserver un temps expiratoire suffisant.', 'La synchronisation ne doit pas réintroduire le piégeage.'],
      ], 'Une PEP externe faible et un trigger ajusté réduisent les efforts manqués, sans auto-déclenchement.'),
      makeQcm('Quels signes témoignent d’une amélioration réelle ?', 'La guérison associe moindre obstruction, disparition du piégeage et reprise d’une commande efficacement assistée.', src('b00074', 'b00086', 'b00091'), [
        [true, 'Le débit expiratoire revient à zéro avant chaque inspiration.', 'La vidange est désormais complète avant le déclenchement du cycle respiratoire suivant.'],
        [true, 'La PEP totale se rapproche de la PEP réglée.', 'La composante intrinsèque diminue et le travail nécessaire au déclenchement devient plus faible.'],
        [true, 'Les efforts patient déclenchent les cycles sans délai prolongé.', 'Le travail seuil est devenu acceptable.'],
        [true, 'La tolérance hémodynamique s’améliore lorsque l’hyperinflation régresse.', 'Un remplissage cardiaque moins gêné rétablit un débit plus stable.'],
        [true, 'Une pression plateau redescendue confirme la baisse des contraintes alvéolaires.', 'Cette mesure sans débit reflète la distension imposée au parenchyme.'],
      ], 'Après bronchodilatateurs et ajustements, les courbes se normalisent et le patient déclenche chaque assistance.'),
    ],
  },
  {
    label: 'Décision d’extubation',
    vignette: 'Une femme de 72 ans ventilée depuis cinq jours pour pneumonie s’améliore. La sédation est arrêtée, elle obéit aux ordres et la cause initiale est contrôlée. Elle est hémodynamiquement stable, afébrile et reçoit une faible FiO2. L’équipe souhaite tester son autonomie puis distinguer réussite ventilatoire et sécurité réelle de l’extubation.',
    questions: [
      makeQcm('Quelles vérifications précèdent une épreuve de sevrage ?', 'L’essai demande stabilité clinique, mécanique respiratoire suffisante et échanges acceptables.', src('b00095', 'b00097'), [
        [true, 'Rechercher une stabilité cardiovasculaire.', 'Le passage en respiration spontanée augmente la charge cardiaque.'],
        [true, 'Exiger un rapport PaO2/FiO2 supérieur à 150.', 'Ce seuil d’oxygénation figure parmi les critères préalables au sevrage.'],
        [true, 'Contrôler l’absence d’acidose sévère.', 'Une dérive métabolique ou ventilatoire réduit la réserve.'],
        [true, 'Évaluer la fréquence et le volume spontanés.', 'Ces données décrivent la capacité de la pompe respiratoire.'],
        [true, 'Prévoir une ventilation non invasive préventive chez le patient à haut risque d’échec.', 'Ce support est recommandé pour sécuriser le retrait de la sonde dans cette situation.'],
      ]),
      makeQcm('Ces valeurs permettent-elles un essai ?', 'La fréquence, le volume, la capacité vitale et l’oxygénation dépassent les seuils proposés ; une épreuve est raisonnable.', src('b00097'), [
        [true, 'La fréquence spontanée est compatible avec le sevrage.', 'Elle reste inférieure à 25/min et ne traduit pas une charge ventilatoire excessive.'],
        [true, 'Le volume courant spontané dépasse le minimum de 2 mL/kg attendu.', 'Une amplitude supérieure à ce repère témoigne d’une pompe encore capable.'],
        [true, 'La capacité vitale est au-dessus du repère de 15 mL/kg.', 'La réserve inspiratoire paraît suffisante.'],
        [false, 'Le rapport PaO2/FiO2 interdit tout essai.', 'Une valeur de 220 dépasse le seuil de 150 proposé pour débuter le sevrage.'],
        [true, 'La stabilité tensionnelle renforce l’indication.', 'Aucune défaillance circulatoire active n’est décrite.'],
      ], 'En mode spontané, la fréquence est à 22/min, le VT à 5 mL/kg, la capacité vitale à 18 mL/kg et PaO2/FiO2 à 220.'),
      makeQcm('Que permet cette modalité ?', 'La pièce en T teste l’autonomie avec oxygène mais sans aide notable, en conservant la résistance de la sonde.', src('b00104', 'b00105'), [
        [false, 'Le travail respiratoire imposé par la pièce en T est plus élevé qu’avec le circuit du ventilateur.', 'Le texte indique l’inverse, le travail imposé étant plus faible avec la pièce en T.'],
        [true, 'Fournir l’oxygène par le raccord latéral.', 'Le système permet une inspiration d’un mélange enrichi.'],
        [false, 'Considérer que la sonde ne crée plus aucune résistance.', 'Le tube impose encore une charge supérieure à la normale.'],
        [false, 'Ajouter une forte aide inspiratoire et appeler cela une pièce en T.', 'Une assistance importante fausserait l’épreuve.'],
        [false, 'Retirer la sonde dès la première minute stable.', 'La tolérance doit être observée suffisamment longtemps.'],
      ], 'L’équipe choisit une épreuve de ventilation spontanée sur pièce en T.'),
      makeQcm('Comment interpréter l’épreuve ?', 'La tolérance clinique et gazeuse est favorable, mais elle ne suffit pas à elle seule à garantir une extubation sûre.', src('b00104', 'b00114'), [
        [true, 'L’absence de détresse pendant 30 minutes soutient le sevrage.', 'La pompe respiratoire supporte la charge immédiate.'],
        [false, 'Une SpO2 stable prouve que la toux sera efficace.', 'Oxygénation et protection des voies aériennes sont distinctes.'],
        [false, 'Une épreuve de dix minutes suffit à conclure à la tolérance.', 'La durée retenue avant de programmer le retrait est de trente minutes.'],
        [false, 'La décision peut ignorer les sécrétions.', 'L’encombrement est une cause majeure de réintubation.'],
        [false, 'Toute épreuve réussie impose une extubation immédiate.', 'Le terrain global doit encore être vérifié.'],
      ], 'Après 30 minutes, la fréquence est à 24/min, la SpO2 à 95 %, le pH stable et aucun signe de détresse n’apparaît.'),
      makeQcm('Quels éléments modifient la décision ?', 'L’encombrement très fréquent et la toux faible rendent la protection insuffisante malgré la réussite ventilatoire.', src('b00114'), [
        [false, 'Deux aspirations par huit heures constituent déjà une contre-indication formelle.', 'Le repère empirique se situe au-delà de deux épisodes et invite à la réflexion, non à l’interdit.'],
        [true, 'Renforcer la désobstruction bronchique est indiqué.', 'La charge sécrétoire doit diminuer avant le retrait.'],
        [false, 'Le rapport f/VT annule le risque de fausse route.', 'Cet indice ne mesure ni toux ni déglutition.'],
        [true, 'Réévaluer la vigilance et la capacité à protéger le larynx.', 'La gestion des sécrétions dépend de ces fonctions.'],
        [false, 'Extuber uniquement parce que PaO2/FiO2 dépasse 150.', 'Un seuil d’oxygénation ne suffit pas.'],
      ], 'L’infirmière rapporte quatre aspirations endotrachéales durant les huit dernières heures et une toux encore faible.'),
      makeQcm('Quelles améliorations rendent une nouvelle tentative cohérente ?', 'La diminution des sécrétions et la récupération de la toux complètent les critères respiratoires déjà favorables.', src('b00112', 'b00114'), [
        [false, 'Une aspiration toutes les heures est acceptable.', 'Cela traduirait encore un encombrement important.'],
        [true, 'Une seule aspiration en huit heures est rassurante.', 'La fréquence passe sous le signal d’alerte empirique.'],
        [true, 'Une toux efficace réduit le risque de rétention.', 'Le patient peut désormais dégager ses voies aériennes.'],
        [false, 'Une confusion nouvelle est sans importance.', 'La protection laryngée pourrait être compromise.'],
        [true, 'La stabilité métabolique doit persister.', 'pH, hémoglobine et température influencent la tolérance.'],
      ], 'Vingt-quatre heures plus tard, la patiente n’a nécessité qu’une aspiration, tousse vigoureusement et reste orientée.'),
      makeQcm('Quels principes encadrent la libération définitive ?', 'L’extubation associe autonomie respiratoire, faible encombrement, protection des voies aériennes et plan de surveillance ou de secours.', src('b00095', 'b00112', 'b00114'), [
        [false, 'Une dose de stéroïdes administrée juste avant le retrait prévient l’obstruction laryngée.', 'Le texte propose cette administration quatre heures avant la libération.'],
        [false, 'Aucune réévaluation n’est nécessaire après le retrait.', 'Le risque d’échec persiste malgré des critères favorables.'],
        [false, 'Une seule méthode de sevrage est supérieure pour tous.', 'Les stratégies doivent être adaptées à l’étiologie.'],
        [true, 'Une VNI préventive peut être envisagée si le risque reste élevé.', 'Le support non invasif peut sécuriser certains patients fragiles.'],
        [false, 'La réhabilitation musculaire doit être interrompue.', 'Elle participe à la récupération durable.'],
      ], 'La seconde épreuve spontanée est bien tolérée et l’équipe prépare l’extubation.'),
    ],
  },
  {
    label: 'Pression positive et choc',
    vignette: 'Un homme de 64 ans hypovolémique après hémorragie abdominale est intubé. Avant l’induction, sa pression artérielle est à 92/54 mmHg et il répond au lever de jambes. La source du saignement est en cours de contrôle et l’oxygénation ne pose pas de difficulté. La ventilation débute alors que le remplissage reste incomplet et que le ventricule droit est vulnérable.',
    questions: [
      makeQcm('Quels effets de la ventilation sont redoutés ?', 'La dépendance à la précharge rend ce patient très sensible à la hausse de pression intrathoracique.', src('b00117', 'b00120', 'b00122'), [[true,'Une réduction du retour veineux est probable.','La pression auriculaire droite s’élève et réduit le gradient depuis les veines périphériques.'],[false,'La précharge droite augmentera mécaniquement.','L’effet attendu est inverse puisque la pression positive freine le remplissage des cavités droites.'],[true,'Le débit cardiaque peut chuter.','Le remplissage est déjà fragile et ne peut compenser la baisse de retour veineux.'],[false,'La postcharge droite diminuera toujours.','Elle tend plutôt à augmenter avec la distension des vaisseaux pulmonaires.'],[false,'La pression moyenne des voies aériennes est sans effet.','Elle gouverne une part du retentissement transmis au péricarde et au cœur droit.']]),
      makeQcm('Comment expliquer cette dégradation ?', 'L’insufflation et la PEP ont réduit le gradient de retour veineux chez un patient non rempli.', src('b00117', 'b00120', 'b00121'), [[false,'Une PEP de 12 cmH2O augmente le retour veineux en élevant le gradient thoracique.','La pression intrathoracique accrue réduit le gradient de remplissage des cavités droites.'],[false,'La pression positive épargne le ventricule droit en abaissant sa postcharge.','La distension alvéolaire élève la résistance vasculaire pulmonaire et la postcharge droite.'],[false,'Le VT bas exclut tout effet circulatoire.','La pression moyenne reste élevée malgré un volume courant limité.'],[false,'La ventilation spontanée serait toujours plus hypotensive.','La pression positive explique ici la rupture.'],[true,'L’hypovolémie amplifie le phénomène.','La compensation de précharge est absente.']], 'Après connexion, la pression tombe à 65/38 mmHg sous PEP 12 cmH2O et pression moyenne élevée.'),
      makeQcm('Quelles mesures immédiates sont cohérentes ?', 'Il faut restaurer le remplissage, exclure une complication compressive et diminuer les contraintes inutiles.', src('b00122', 'b00130'), [[true,'Réévaluer et corriger la volémie.','Le retour veineux dépend du volume circulant.'],[true,'Réduire prudemment la PEP si l’oxygénation le permet.','La pression expiratoire entretient la gêne.'],[true,'Rechercher un pneumothorax compressif.','Une chute brutale sous ventilation l’impose.'],[true,'Surveiller la pression veineuse centrale et sa fluctuation respiratoire.','Cette variation permet d’estimer la part de pression transmise au péricarde.'],[true,'Reprendre l’évaluation après chaque modification du réglage.','Respiration et circulation évoluent ensemble et exigent un contrôle répété.']], 'L’auscultation est symétrique, la SpO2 à 98 % et l’échographie ne montre pas de pneumothorax.'),
      makeQcm('Quels signes indiquent une réponse favorable ?', 'La restauration de pression et de perfusion après remplissage confirme le rôle de la précharge.', src('b00120', 'b00122'), [[true,'La remontée tensionnelle après volume est compatible avec l’hypovolémie.','Le gradient de retour veineux se restaure.'],[true,'Une normalisation du lactate accompagnerait le rétablissement de la perfusion.','Le retour d’un débit tissulaire suffisant fait décroître ce marqueur.'],[true,'Une reprise de la diurèse traduirait un débit rénal restauré.','La perfusion des organes suit la remontée du débit cardiaque.'],[true,'La baisse de tachycardie soutient l’amélioration.','Le besoin compensateur diminue lorsque le débit circulatoire redevient adéquat.'],[true,'Une PEP moindre peut améliorer le remplissage.','La pression auriculaire droite baisse.']], 'Après remplissage et PEP ramenée à 5 cmH2O, la pression atteint 105/62 mmHg et la fréquence cardiaque diminue.'),
      makeQcm('Quelle prudence impose le cœur droit ?', 'Une postcharge pulmonaire élevée peut décompenser le ventricule droit malgré une volémie corrigée.', src('b00123'), [[true,'Éviter la surdistension alvéolaire.','Elle comprime les vaisseaux pulmonaires.'],[false,'Augmenter systématiquement la pression moyenne.','La postcharge droite s’accroîtrait.'],[true,'Surveiller les signes de dilatation droite.','Ils révèlent l’échec d’éjection face à une résistance pulmonaire devenue excessive.'],[true,'Une PEP excessive peut à la fois gêner le remplissage et majorer la postcharge droite.','La pression positive réduit la précharge droite et augmente sa postcharge.'],[true,'Maintenir une oxygénation suffisante.','L’hypoxie peut majorer la vasoconstriction pulmonaire.']], 'L’échographie montre un ventricule droit modérément dilaté sans choc persistant.'),
      makeQcm('Quels réglages réduisent la charge cardiovasculaire ?', 'La plus faible pression efficace, un VT protecteur et un temps adapté limitent la transmission thoracique.', src('b00080', 'b00084', 'b00117'), [[false,'Une pression moyenne des voies aériennes plus élevée réduit la transmission au péricarde.','L’impact cardiovasculaire est justement proportionnel à cette pression moyenne.'],[true,'Titrer la PEP sur le besoin réel.','La valeur minimale efficace limite le retentissement.'],[false,'Maintenir une FiO2 forte pour corriger la pression artérielle.','L’oxygène ne restaure pas le retour veineux.'],[false,'Supprimer toute surveillance de plateau.','La contrainte doit rester mesurée pour repérer une distension susceptible de gêner la circulation.'],[true,'Réévaluer après chaque modification majeure.','Respiration et circulation sont interdépendantes.']], 'L’oxygénation reste correcte sous FiO2 0,35 et PEP 5 cmH2O.'),
      makeQcm('Quels enseignements retenir ?', 'Chez un patient précharge-dépendant, l’efficacité ventilatoire doit être obtenue avec une pression moyenne aussi basse que possible.', src('b00117', 'b00122', 'b00123'), [[true,'Anticiper l’hypotension lors de l’induction.','La ventilation peut révéler l’hypovolémie.'],[false,'Une PEP élevée est toujours hémodynamiquement neutre.','Sa transmission réduit souvent le remplissage.'],[true,'Distinguer précharge réduite et postcharge droite accrue.','Les deux mécanismes peuvent coexister.'],[true,'Adapter le ventilateur au statut circulatoire.','Un réglage respiratoire ne se juge pas isolément.'],[false,'Conserver les paramètres initiaux malgré toute instabilité.','La réévaluation est au cœur de la sécurité.']], 'Le patient est stabilisé après hémostase et correction de la volémie.'),
    ],
  },
  {
    label: 'Pneumonie sous ventilation et hyperoxie',
    vignette: 'Une femme de 59 ans est ventilée depuis sept jours après chirurgie digestive compliquée. Elle reçoit FiO2 0,65 pour une SpO2 constamment à 99 %. La sonde endotrachéale est toujours nécessaire, les sécrétions sont aspirées plusieurs fois par jour et la sédation commence à être allégée. L’équipe réévalue conjointement risque infectieux, exposition à l’oxygène et possibilité de sevrage.',
    questions: [
      makeQcm('Quels risques augmentent avec cette durée ?', 'La ventilation prolongée favorise colonisation, microaspiration et pneumonie, tandis que la FiO2 élevée expose au dommage oxydatif.', src('b00139', 'b00141', 'b00142'), [[true,'Une pneumonie associée au ventilateur est possible.','Le risque croît avec les jours passés sous sonde et assistance respiratoire.'],[true,'La clairance mucociliaire est altérée.','La sonde et l’immobilité réduisent les défenses.'],[false,'Le ballonnet empêche toute microaspiration.','Des passages surviennent régulièrement autour de lui.'],[true,'Une toxicité de l’oxygène doit être envisagée.','La FiO2 dépasse 60 %, seuil associé à une exposition pulmonaire préoccupante.'],[false,'Une SpO2 à 99 % justifie nécessairement cette FiO2.','La concentration peut souvent être abaissée.']]),
      makeQcm('Quelles mesures sont prioritaires ?', 'La fièvre et les sécrétions imposent un bilan infectieux tout en réduisant une exposition inutile à l’oxygène.', src('b00093', 'b00139', 'b00141'), [[true,'Prélever les voies respiratoires selon le contexte.','L’identification microbiologique aide au diagnostic.'],[true,'Appliquer les mesures de prévention des pneumonies associées au ventilateur.','Cette complication iatrogène peut être limitée par des mesures préventives codifiées.'],[true,'Titrer la FiO2 vers une saturation conservatrice.','L’hyperoxie prolongée n’est pas nécessaire.'],[true,'Rechercher une cause pulmonaire nouvelle.','Le changement des sécrétions et la fièvre sont significatifs.'],[true,'Tenir compte de la durée de ventilation dans l’évaluation du risque.','Le risque de pneumonie nosocomiale est proportionnel à cette durée.']], 'Elle développe une fièvre à 39 °C et des sécrétions purulentes, sans désaturation.'),
      makeQcm('Quels éléments soutiennent une pneumonie plutôt qu’une simple colonisation ?', 'L’association d’une atteinte radiologique nouvelle et de signes systémiques renforce l’hypothèse infectieuse.', src('b00141', 'b00142'), [[false,'Une mortalité attribuable supérieure à 50 % distingue la pneumonie de la colonisation.','La mortalité associée rapportée est de l’ordre de 13 % et ne sert pas de critère diagnostique.'],[true,'Une leucocytose accompagne l’inflammation systémique.','Elle dépasse le seul portage bactérien.'],[false,'Une culture positive isolée suffit toujours.','Les voies intubées sont fréquemment colonisées.'],[true,'La survenue après plus de deux jours de ventilation rend la pneumonie plus probable.','Dix à quarante pour cent des patients ventilés au-delà de deux jours développent cette infection.'],[true,'Une aggravation des échanges renforcerait le diagnostic.','Le parenchyme infecté perturbe l’oxygénation.']], 'La radiographie montre un nouvel infiltrat basal et les leucocytes sont à 18 G/L.'),
      makeQcm('Quelles actions préventives restent utiles ?', 'La prévention associe réduction de durée, soins des voies aériennes, ballonnet surveillé et limitation des microaspirations.', src('b00126', 'b00141'), [[true,'Mesurer régulièrement la pression du ballonnet.','Une étanchéité appropriée limite les fuites.'],[true,'Réévaluer chaque jour l’indication de ventilation.','La durée est un facteur continu de risque.'],[false,'Supprimer l’hygiène des mains si des gants sont portés.','Les gants ne remplacent pas l’asepsie.'],[true,'Favoriser la libération dès que les critères sont réunis.','Moins de jours signifie moins d’exposition.'],[false,'Maintenir le décubitus strict sans mobilisation.','L’alitement favorise stase et complications.']], 'Une pneumonie est traitée et l’équipe révise les mesures de prévention.'),
      makeQcm('Comment gérer l’oxygène ?', 'La SpO2 conservée sous FiO2 faible confirme que la concentration initiale était excessive.', src('b00093', 'b00139'), [[false,'L’objectif minimal accepté correspond à une PaO2 supérieure à 100 mmHg.','Le repère retenu est une PaO2 au-dessus de 60 mmHg ou une SaO2 dépassant 90 %.'],[false,'Remonter à 0,65 pour viser 100 % de saturation.','La cible serait inutilement haute et exposerait de nouveau le poumon à l’hyperoxie.'],[false,'Une SaO2 maintenue entre 97 et 100 % est la cible recommandée en soins intensifs.','La cible conservatrice de 94 à 98 % s’est accompagnée d’une mortalité moindre.'],[false,'La toxicité disparaît dès que la FiO2 passe sous 1.','Elle reste dose- et temps-dépendante au-delà de 60 %.'],[true,'Contrôler la réponse après modification.','La sécurité exige une surveillance continue.']], 'La FiO2 est ramenée à 0,35 ; la SpO2 se maintient à 95 %.'),
      makeQcm('Quels facteurs autorisent une épreuve de sevrage ?', 'L’amélioration infectieuse doit s’accompagner d’une commande suffisante et d’une stabilité systémique.', src('b00095', 'b00097'), [[true,'Une cause initiale désormais contrôlée.','Le mécanisme de dépendance au ventilateur régresse.'],[true,'Une fréquence spontanée inférieure à 25/min.','Le rythme reste compatible avec l’autonomie.'],[true,'Un pH artériel maintenu au-dessus de 7,32 conforte la démarche.','La fréquence est réglée pour respecter ce seuil avant toute tentative.'],[true,'Une PaO2/FiO2 supérieure à 150.','Les échanges offrent une marge minimale.'],[true,'Une réhabilitation de la musculature respiratoire soutient la démarche.','Le protocole de réhabilitation fait partie de la planification du sevrage.']], 'Après traitement, la fièvre disparaît, la sédation est arrêtée et PaO2/FiO2 atteint 230.'),
      makeQcm('Quels points conditionnent encore l’extubation ?', 'Une épreuve réussie doit être complétée par l’évaluation des sécrétions, de la toux et de la conscience.', src('b00104', 'b00114'), [[false,'Une épreuve spontanée réussie autorise à elle seule le retrait de la sonde.','La gestion des sécrétions, la toux et la vigilance doivent encore être vérifiées.'],[true,'Tester une toux efficace.','Elle protège des sécrétions après retrait.'],[false,'Ignorer l’état cognitif si le gaz du sang est normal.','La protection laryngée dépend de la vigilance.'],[false,'Utiliser le f/VT comme décision unique.','Sa valeur prédictive reste limitée.'],[true,'Prévoir une surveillance postextubation rapprochée.','Une récidive doit être détectée tôt.']], 'L’épreuve spontanée dure 30 minutes sans détresse ; la patiente est éveillée et peu encombrée.'),
    ],
  },
  {
    label: 'VNI dans l’œdème aigu pulmonaire',
    vignette: 'Un homme de 76 ans arrive pour œdème aigu pulmonaire cardiogénique. Il est conscient, coopérant, polypnéique et respire par la bouche. La SpO2 est à 86 % sous oxygène conventionnel, sans choc ni trouble de conscience. Une assistance non invasive est proposée pendant le traitement médical, avec surveillance continue de la tolérance et des échanges.',
    questions: [
      makeQcm('Quels principes rendent la VNI envisageable ?', 'Un patient éveillé peut déclencher une aide à deux niveaux de pression sans intubation, sous surveillance étroite.', src('b00148', 'b00149'), [[true,'La coopération favorise l’acceptation.','Le masque exige une participation active.'],[false,'Le mode à un seul niveau de pression est devenu le réglage par défaut.','Le mode par défaut décrit associe une aide inspiratoire et une pression expiratoire positive.'],[false,'Une sonde trachéale est nécessaire à la définition.','La VNI s’en dispense précisément et utilise une interface externe autour du visage.'],[false,'Le déclenchement doit être uniquement temporel.','Le patient déclenche habituellement l’inspiration.'],[false,'Les fuites n’ont aucune importance.','Elles déterminent efficacité et confort.']]),
      makeQcm('Quelle interface paraît la plus adaptée ?', 'La respiration buccale et le besoin de pression orientent vers un masque facial bien ajusté.', src('b00150', 'b00151'), [[false,'Le casque constitue l’interface la plus employée en ventilation non invasive.','Le masque facial domine les usages, loin devant le masque nasal.'],[false,'Le masque nasal garantit une meilleure étanchéité dans ce profil.','La bouche ouverte compromettrait l’aide.'],[true,'Une pression élevée est souvent mieux délivrée par le facial.','Sa surface d’appui améliore l’étanchéité.'],[false,'La claustrophobie ne doit jamais être recherchée.','Elle peut faire échouer la technique.'],[true,'Les points de pression doivent être contrôlés.','La peau fragile est exposée aux lésions.']], 'Le patient garde la bouche ouverte et nécessite des pressions relativement élevées.'),
      makeQcm('Quels réglages et surveillances sont pertinents ?', 'Le niveau d’aide doit réduire le travail sans désynchronisation, et la PEP soutenir l’oxygénation sans hypotension.', src('b00148', 'b00154'), [[true,'Observer chaque effort et chaque cycle délivré.','La synchronie se juge directement sur le patient et les courbes.'],[true,'Surveiller la pression artérielle sous PEP.','La précharge peut diminuer lorsque la pression intrathoracique freine le retour veineux.'],[true,'Quantifier les fuites affichées.','Elles guident l’ajustement du masque.'],[false,'Sédater profondément pour imposer le masque.','La dépression de commande rendrait la VNI dangereuse.'],[false,'Accepter une douleur faciale croissante.','Elle annonce intolérance et lésion cutanée.']], 'La VNI débute en mode assisté avec PEP ; la pression artérielle reste stable.'),
      makeQcm('Comment interpréter cette évolution ?', 'L’amélioration clinique soutient l’efficacité, mais la fuite doit être corrigée avant qu’elle ne dégrade confort et déclenchement.', src('b00149', 'b00154'), [[true,'La baisse de fréquence suggère un moindre travail respiratoire.','Le patient n’a plus besoin d’une cadence aussi élevée.'],[false,'Une SpO2 meilleure permet d’ignorer la fuite.','La fuite peut secondairement faire échouer le support.'],[true,'Réajuster l’appui du masque est indiqué.','Une meilleure étanchéité réduit le flux perdu.'],[false,'Serrer au maximum sans vérifier la peau.','La pression excessive provoque des lésions.'],[true,'Contrôler la synchronisation après le réglage.','Une modification d’interface change les signaux de débit.']], 'Après 20 minutes, la SpO2 passe de 86 à 95 % et la fréquence de 36 à 25/min, mais une fuite péri-orale persiste.'),
      makeQcm('Quelles mesures peuvent améliorer la tolérance ?', 'La sécheresse liée au flux se traite par humidification et par correction raisonnée des fuites.', src('b00155', 'b00156', 'b00157', 'b00158'), [[false,'Un débit nasal unidirectionnel améliore la trophicité de la muqueuse.','Ce flux assèche la muqueuse et déclenche une réaction inflammatoire.'],[false,'Accroître volontairement la fuite nasale.','Cela entretient la dessiccation et renforce l’inflammation de la muqueuse nasale.'],[true,'Réexaminer l’interface et son étanchéité.','La cause mécanique doit être corrigée.'],[true,'Surveiller les résistances nasales et l’inconfort.','L’inflammation peut augmenter le travail.'],[false,'Interdire toute adaptation tant que la saturation est bonne.','Le confort conditionne la continuité du traitement.']], 'Deux heures plus tard, il décrit une sécheresse nasale et commence à retirer le masque.'),
      makeQcm('Quels signes feraient considérer la VNI comme un échec ?', 'La dégradation de conscience, des échanges ou de la tolérance malgré optimisation impose une stratégie invasive.', src('b00149', 'b00154'), [[true,'Une aggravation de l’hypoxémie malgré le support.','L’objectif d’oxygénation n’est plus atteint.'],[true,'Une somnolence croissante.','La protection des voies aériennes et la commande sont menacées.'],[true,'Une acidose respiratoire qui s’aggrave malgré l’optimisation.','L’échec de correction du CO2 impose d’envisager la voie invasive.'],[true,'Des fuites incontrôlables empêchant l’assistance.','Le volume et le déclenchement deviennent insuffisants.'],[true,'Une intolérance au masque conduisant à son retrait répété.','Le rejet de l’interface interrompt l’assistance et compromet le traitement.']], 'La surveillance recherche explicitement les critères de dégradation sous traitement.'),
      makeQcm('Quels éléments permettent un arrêt progressif ?', 'La résolution de l’œdème se traduit par autonomie, échanges stables et faible travail en dehors du masque.', src('b00149', 'b00167'), [[true,'Une oxygénation maintenue lors de pauses est favorable.','Le bénéfice persiste sans pression continue.'],[false,'Une dépendance croissante au niveau d’aide autorise l’arrêt.','Elle traduit une insuffisance persistante.'],[true,'Une fréquence respiratoire normalisée soutient le retrait.','Le travail spontané devient acceptable.'],[true,'Une interface devenue inutile doit être retirée.','La durée d’exposition aux lésions cutanées diminue.'],[false,'Le choix initial du masque interdit tout changement.','L’interface suit les besoins du patient.']], 'Après traitement diurétique, il tolère des pauses prolongées avec SpO2 95 % et fréquence à 18/min.'),
    ],
  },
  {
    label: 'Échec progressif d’une VNI',
    vignette: 'Une femme de 68 ans atteinte de MPOC reçoit une VNI pour acidose hypercapnique. Elle est anxieuse, mais initialement éveillée et coopérante. La respiration est rapide, l’expiration prolongée et l’auscultation très obstructive. L’équipe dispose d’une gazométrie initiale et fixe des critères précoces d’efficacité ou d’intubation afin de ne pas prolonger un support inefficace.',
    questions: [
      makeQcm('Quels déterminants doivent être optimisés dès le départ ?', 'Une VNI efficace repose sur l’interface, la synchronisation, la fuite et une assistance adaptée à l’effort.', src('b00148', 'b00149', 'b00154'), [[true,'Expliquer le masque avant sa pose.','La compréhension réduit le rejet en donnant au patient des repères sur le flux et la pression.'],[true,'Choisir une interface selon la respiration du patient.','La fuite dépend du trajet aérien dominant.'],[true,'Analyser les courbes pour repérer les asynchronies.','Les efforts non suivis d’un cycle restent invisibles au simple examen du masque.'],[true,'Régler le trigger sur les efforts observés.','Le patient doit obtenir rapidement son cycle.'],[false,'Employer une sédation profonde de routine.','Elle menace commande et protection.']]),
      makeQcm('Quelles causes sont plausibles ?', 'Les cycles manqués peuvent résulter de l’auto-PEP obstructive, d’un trigger mal réglé ou d’une fuite.', src('b00091', 'b00154'), [[false,'Un trigger réglé très sensible supprime tout risque d’effort inefficace.','Un seuil trop sensible provoque plutôt des auto-déclenchements sans annuler la charge de l’auto-PEP.'],[true,'Une fuite importante perturbe la détection de débit.','Le signal utile est masqué ou déformé.'],[true,'Une désynchronisation patient-ventilateur peut elle-même engendrer des fuites.','Les fuites tiennent à la mauvaise étanchéité de l’interface ou à cette désynchronisation.'],[true,'Un seuil trop peu sensible augmente les cycles manqués.','La dépression exigée devient excessive.'],[false,'L’humidification crée directement une auto-PEP.','Elle agit surtout sur la sécheresse.']], 'Les courbes montrent des efforts inspiratoires non suivis d’un cycle et une fuite importante.'),
      makeQcm('Quelles corrections sont adaptées ?', 'L’interface et le trigger sont ajustés en tenant compte de l’obstruction, sans sacrifier le temps expiratoire.', src('b00086', 'b00091', 'b00154'), [[true,'Repositionner ou changer le masque.','L’étanchéité doit être améliorée sans douleur.'],[false,'Augmenter la fréquence de secours à 35/min.','Le temps expiratoire deviendrait insuffisant.'],[false,'Ajouter une PEP externe élevée à 15 cmH2O pour supprimer le piégeage.','Une PEP externe trop haute majore l’hyperinflation au lieu de la corriger.'],[false,'Interposer un humidificateur pour corriger la rougeur cutanée du nez.','L’humidification agit sur la sécheresse muqueuse et non sur les points d’appui.'],[false,'Serrer les sangles jusqu’à provoquer une lésion.','La tolérance s’effondrerait rapidement et conduirait au retrait répété de l’interface.']], 'Le débit expiratoire ne rejoint pas zéro et la peau nasale rougit sous les sangles.'),
      makeQcm('Comment juger l’évolution ?', 'La baisse du pH et la somnolence indiquent une ventilation alvéolaire insuffisante malgré les corrections.', src('b00075', 'b00149'), [[true,'Le pH à 7,24 traduit une acidose sévère persistante.','Il est très inférieur à 7,32 et confirme l’échec de correction de l’hypercapnie.'],[true,'La rétention de CO2 progresse malgré une interface changée et des réglages ajustés.','L’assistance ne parvient plus à assurer une ventilation alvéolaire suffisante.'],[true,'La somnolence menace la protection des voies aériennes.','Le recours non invasif devient moins sûr.'],[true,'Le maintien d’une SpO2 correcte peut masquer une hypoventilation.','L’apport d’oxygène corrige la saturation sans améliorer l’élimination du CO2.'],[true,'Une escalade de prise en charge doit être préparée.','Le retard expose à l’épuisement et à une perte de protection des voies aériennes.']], 'Après une heure, la PaCO2 augmente, le pH tombe à 7,24 et la patiente devient somnolente malgré SpO2 94 %.'),
      makeQcm('Quels motifs justifient l’intubation ?', 'La défaillance ventilatoire et neurologique malgré une VNI optimisée indiquent un support invasif.', src('b00069', 'b00075', 'b00149'), [[true,'L’aggravation de l’acidose hypercapnique.','Les échanges en CO2 ne sont plus assurés.'],[true,'La perte de coopération et de vigilance.','Le masque et les voies aériennes ne sont plus sécurisés.'],[true,'L’épuisement respiratoire imminent.','La pompe ne peut soutenir le travail.'],[true,'Le risque d’inhalation lié à la perte des réflexes de protection.','Le réflexe de déglutition défaillant expose au passage de liquide gastrique.'],[true,'L’impossibilité de maintenir une assistance efficace malgré les corrections.','Le rejet du masque et les fuites persistantes empêchent toute ventilation utile.']], 'L’équipe conclut à un échec de VNI malgré le changement d’interface et l’ajustement des paramètres.'),
      makeQcm('Quels réglages initiaux protègent cette patiente obstructive après intubation ?', 'Une fréquence basse, une expiration longue et un volume calculé limitent l’hyperinflation dynamique.', src('b00080', 'b00082', 'b00086'), [[false,'Régler d’emblée une PEP externe de 12 cmH2O pour ouvrir les bronches.','Une PEP élevée d’emblée risque de majorer l’hyperinflation chez cette patiente obstructive.'],[false,'Fixer le débit inspiratoire à 30 L/min pour ménager les voies aériennes.','Un débit trop faible allonge l’inspiration et réduit d’autant le temps expiratoire.'],[false,'Choisir un I/E inversé.','L’expiration serait trop courte pour des unités dont les constantes de temps sont prolongées.'],[false,'Normaliser immédiatement la PaCO2 par un VT élevé.','Le piégeage serait aggravé par l’augmentation du volume à expirer à chaque cycle.'],[true,'Contrôler le retour du débit expiratoire à zéro.','La courbe révèle la vidange complète.']], 'L’intubation est réalisée et la ventilation invasive commence.'),
      makeQcm('Quels enseignements évitent un nouvel échec ?', 'L’évaluation répétée doit reconnaître tôt l’inefficacité de VNI et privilégier la sécurité avant l’épuisement.', src('b00149', 'b00154', 'b00163'), [[true,'Fixer des objectifs cliniques et gazométriques précoces.','Ils rendent la réponse mesurable et permettent une décision avant la dégradation neurologique.'],[true,'Mesurer régulièrement le pH et la PaCO2 plutôt que la seule saturation.','La ventilation alvéolaire peut se dégrader alors que l’oxygénation reste satisfaisante.'],[true,'Corriger fuites et asynchronies dès leur apparition.','Elles accélèrent la fatigue et le rejet.'],[true,'Changer de stratégie si la conscience décline.','La protection des voies aériennes devient prioritaire.'],[true,'Reconnaître tôt l’inefficacité du support pour éviter l’épuisement.','Un retard d’escalade expose à une intubation dans des conditions dégradées.']], 'Après stabilisation invasive, l’équipe analyse la chronologie de la prise en charge.'),
    ],
  },
];

const ISOLATED_QROC = [
  ['Quelle variable simple résulte du produit VT × fréquence ?', 'Ventilation minute', 'Le volume mobilisé à chaque cycle multiplié par le nombre de cycles donne le volume ventilé par minute.', src('b00013')],
  ['Quel événement met en route une inspiration assistée ?', 'Atteinte du seuil de déclenchement|activation du trigger', 'Une variation de pression ou de débit générée par le patient franchit le seuil programmé.', src('b00009', 'b00029')],
  ['Quelle variable suit en continu l’élimination ventilatoire du CO2 ?', 'Capnographie|CO2 expiré', 'La courbe de CO2 expiré informe instantanément sur la ventilation et la continuité du circuit.', src('b00010')],
  ['Quel temps du cycle est habituellement passif ?', 'Expiration', 'Après l’insufflation, le recul élastique ramène le système respiratoire vers son volume de repos.', src('b00035')],
  ['Comment nomme-t-on la pression positive maintenue en fin d’expiration ?', 'PEP|PEEP', 'Cette pression sus-atmosphérique empêche un retour complet à la pression ambiante.', src('b00035')],

  ['Quelle variable est garantie en VC-CMV ?', 'Volume courant|volume', 'Le ventilateur adapte la pression nécessaire pour fournir le volume programmé.', src('b00053')],
  ['Quelle grandeur varie avec la compliance en PC-CMV ?', 'Volume courant|VT', 'La pression est fixée ; une compliance plus basse produit un volume moindre.', src('b00057', 'b00058')],
  ['Quelle séquence autorise des cycles spontanés entre des cycles obligatoires ?', 'Ventilation obligatoire intermittente|IMV', 'L’IMV garantit un minimum tout en laissant au patient des respirations intercalaires.', src('b00055')],
  ['Qui fixe la fréquence en pression spontanée continue ?', 'Le patient', 'L’appareil soutient l’effort mais le rythme dépend de la commande respiratoire.', src('b00062')],
  ['Quels trois critères fonctionnels décrivent un mode ?', 'Variable contrôlée, séquence et schéma de cible', 'Cette triade évite les confusions liées aux appellations commerciales.', src('b00039', 'b00048', 'b00049')],

  ['Sur quel poids faut-il indexer le VT protecteur ?', 'Poids idéal|poids prédit', 'Le poids idéal reflète mieux la taille des poumons que le poids réel.', src('b00080')],
  ['Quel VT initial est habituel hors atteinte sévère ?', '6 à 8 mL/kg de poids idéal', 'Cette plage offre une ventilation suffisante avec une contrainte limitée.', src('b00080')],
  ['Quelle limite de plateau s’applique dans le SDRA ?', 'Moins de 30 cmH2O|< 30 cmH2O', 'Le poumon lésé nécessite un plafond plus strict que la limite générale.', src('b00080')],
  ['Quel pH minimal soutient une hypercapnie permissive ?', 'Supérieur à 7,32|pH > 7,32', 'Une PaCO2 élevée peut être acceptée tant que l’acidose reste modérée.', src('b00082')],
  ['Quel rapport I/E favorise la vidange lors d’une obstruction sévère ?', '1:4 ou 1:5', 'L’expiration prolongée réduit l’empilement gazeux et l’auto-PEP.', src('b00086')],

  ['Quel seuil de PaO2 correspond à l’objectif minimal proposé ?', 'Plus de 60 mmHg|PaO2 > 60 mmHg', 'La FiO2 doit être titrée pour atteindre cette oxygénation sans excès.', src('b00093')],
  ['Quelle valeur de PEP convient souvent à un poumon normal ?', '3 à 5 cmH2O', 'Cette pression de base aide à maintenir la capacité résiduelle fonctionnelle.', src('b00084')],
  ['Quel débit inspiratoire de départ est typique ?', '60 L/min', 'Ce débit peut ensuite être augmenté pour une demande forte ou réduit pour le pic de pression.', src('b00088')],
  ['Quelle plage de sensibilité en pression est usuelle ?', '1 à 2 cmH2O', 'Le seuil doit réduire l’effort sans créer d’auto-déclenchement.', src('b00091')],
  ['Quelle PaCO2 peut être acceptée en stratégie permissive ?', '50 à 70 mmHg', 'Cette tolérance évite d’augmenter volumes et pressions dans un poumon à risque.', src('b00082')],

  ['Quel rapport d’oxygénation est souhaité avant sevrage ?', 'PaO2/FiO2 supérieur à 150', 'Ce seuil participe aux prérequis sans suffire isolément.', src('b00097')],
  ['Pendant combien de temps observe-t-on classiquement une épreuve spontanée ?', '30 minutes', 'Une demi-heure sans détresse permet souvent d’envisager le retrait de la sonde.', src('b00104')],
  ['De combien diminue-t-on l’aide inspiratoire à chaque palier ?', '3 à 6 cmH2O', 'Les petits paliers testent progressivement la réserve musculaire.', src('b00111')],
  ['Quelle valeur de f/VT est favorable au sevrage ?', 'Inférieure à 100|f/VT < 100', 'Un rythme non excessif pour un volume suffisant rend le succès plus probable.', src('b00113')],
  ['Quel signal sécrétoire doit faire différer l’extubation ?', 'Plus de deux aspirations en huit heures', 'Un encombrement fréquent expose fortement à la réintubation.', src('b00114')],

  ['Quel mécanisme circulatoire explique l’hypotension sous PEP élevée ?', 'Diminution du retour veineux|baisse de précharge droite', 'La pression auriculaire droite accrue réduit le gradient de remplissage.', src('b00120', 'b00121')],
  ['Quelle cavité voit sa postcharge augmenter sous pression positive ?', 'Ventricule droit|cœur droit', 'La distension pulmonaire accroît l’opposition vasculaire à l’éjection droite.', src('b00123')],
  ['Quel traumatisme correspond à une fuite gazeuse par surpression ?', 'Barotraumatisme', 'La rupture alvéolaire peut provoquer pneumothorax ou pneumomédiastin.', src('b00130')],
  ['Quelle mesure approche le mieux la pression alvéolaire de fin d’inspiration ?', 'Pression plateau', 'À débit nul, la composante résistive s’efface et la contrainte élastique domine.', src('b00133')],
  ['Quel traumatisme résulte de l’ouverture-fermeture alvéolaire répétée ?', 'Atélectraumatisme', 'Le cisaillement endommage les membranes alvéolaires et capillaires.', src('b00137')],

  ['Au-delà de quelle FiO2 la toxicité devient-elle notable ?', '60 %|FiO2 > 0,60', 'Le risque pulmonaire augmente avec la concentration et la durée.', src('b00139')],
  ['Quelle plage de saturation conservatrice limite l’hyperoxie ?', '94 à 96 %', 'Elle évite de maintenir inutilement une saturation très élevée.', src('b00139')],
  ['Quelle complication infectieuse touche 10 à 40 % des ventilations prolongées ?', 'Pneumonie associée au ventilateur|PAVM', 'Après plus de deux jours, microaspiration et colonisation favorisent cette infection.', src('b00142')],
  ['Quel gradient s’élargit lors du découplage ventilation-perfusion ?', 'Gradient alvéolo-artériel en oxygène|gradient A-a', 'Les territoires perfusés et peu ventilés altèrent le transfert d’oxygène.', src('b00144')],
  ['Quel gaz sanguin faut-il contrôler pour limiter la vasodilatation cérébrale ?', 'PaCO2', 'L’hypercapnie dilate les vaisseaux cérébraux et peut augmenter l’œdème.', src('b00146')],

  ['Quelle interface est la plus employée en VNI aiguë ?', 'Masque facial|masque oro-nasal', 'Elle concerne environ 70 % des utilisations et limite les fuites buccales.', src('b00150')],
  ['Quelle interface facilite davantage l’expectoration ?', 'Masque nasal', 'La bouche reste libre et l’espace mort est plus faible.', src('b00150')],
  ['Quelle anomalie d’interface compromet souvent la VNI ?', 'Fuite excessive|fuites', 'Elle perturbe volume délivré, déclenchement, confort et sommeil.', src('b00154')],
  ['Quel dispositif améliore la sécheresse nasale sous VNI ?', 'Humidificateur chauffant|humidification chauffée', 'Le gaz humidifié réduit l’inflammation et les résistances nasales.', src('b00156', 'b00157', 'b00158')],
  ['Quel facteur matériel est central dans le succès d’une VNI ?', 'Choix de l’interface', 'L’interface doit concilier étanchéité, pression délivrée, confort et tolérance.', src('b00167')],
];

const DP_QROC = [
  {
    label: 'Ventilation contrôlée peropératoire',
    vignette: 'Un patient de 54 ans sans maladie respiratoire est anesthésié pour chirurgie abdominale. La commande respiratoire est abolie. L’intubation est confirmée par capnographie, l’hémodynamique est stable et aucune fuite n’est détectée. Les réglages initiaux doivent assurer les échanges tout en préservant le poumon pendant toute la procédure.',
    steps: [
      ['Quel type de séquence ventilatoire convient initialement ?', 'Ventilation contrôlée|CMV', 'L’absence de commande nécessite des cycles entièrement assurés par la machine.', src('b00014', 'b00074')],
      ['Quel volume courant prescrivez-vous ?', '6 à 8 mL/kg de poids idéal', 'Le calcul sur le poids idéal limite la surdistension.', src('b00080'), 'Le patient mesure 180 cm et pèse 105 kg.'],
      ['Quelle PEP de départ retenez-vous ?', '3 à 5 cmH2O', 'Une faible PEP maintient la CRF d’un poumon normal.', src('b00084'), 'Les pressions restent basses et l’oxygénation est normale.'],
      ['Quel paramètre distingue la contrainte alvéolaire de la résistance ?', 'Pression plateau', 'La mesure à débit nul approche mieux la pression alvéolaire.', src('b00133'), 'La pression de crête augmente à 35 cmH2O.'],
      ['Quel mécanisme évoquez-vous ?', 'Augmentation des résistances des voies aériennes|obstruction', 'Un pic élevé avec plateau stable traduit une composante résistive accrue.', src('b00013', 'b00133'), 'Le plateau reste à 18 cmH2O tandis que des sibilants apparaissent.'],
      ['Quel réglage temporel protège d’un piégeage obstructif ?', 'Allongement du temps expiratoire|rapport I/E 1:4', 'Une expiration prolongée permet la vidange des unités lentes.', src('b00086'), 'Le débit expiratoire ne revient plus à zéro avant le cycle suivant.'],
      ['Quel objectif de plateau conservez-vous ?', 'Moins de 35 cmH2O', 'La protection reste nécessaire même après correction du bronchospasme.', src('b00080', 'b00166'), 'Le traitement bronchodilatateur normalise les courbes.'],
    ],
  },
  {
    label: 'Protection dans le SDRA',
    vignette: 'Une patiente de 38 ans présente un SDRA avec compliance basse et hypoxémie sous ventilation invasive. Elle est profondément sédatée, sans effort spontané, et reçoit une FiO2 élevée depuis plusieurs heures. Les pressions augmentent dès que le volume courant est majoré. La stratégie recherchée doit concilier recrutement, oxygénation et protection alvéolaire.',
    steps: [
      ['Quel volume ciblez-vous ?', '4 à 6 mL/kg de poids idéal', 'Le faible volume réduit la surdistension du poumon lésé.', src('b00080')],
      ['Quelle limite de pression plateau appliquez-vous ?', 'Moins de 30 cmH2O', 'Le SDRA requiert une limite plus stricte afin de réduire la contrainte imposée aux unités alvéolaires encore ventilées.', src('b00080'), 'Sous 6 mL/kg, le plateau est mesuré à 32 cmH2O.'],
      ['Quel compromis sur le CO2 pouvez-vous accepter ?', 'Hypercapnie permissive', 'Une PaCO2 élevée évite d’augmenter dangereusement le volume.', src('b00082'), 'Après réduction du VT, la PaCO2 atteint 60 mmHg et le pH 7,34.'],
      ['Quel réglage expiratoire peut améliorer l’oxygénation ?', 'Augmentation adaptée de la PEP', 'Une PEP plus élevée peut recruter les unités instables.', src('b00084'), 'La PaO2 reste à 58 mmHg sous FiO2 0,65.'],
      ['Quelle manœuvre de recrutement est décrite ?', '30 cmH2O pendant 30 secondes', 'Cette manœuvre a été associée à une PEP de 6 à 8 cmH2O.', src('b00135'), 'L’hémodynamique tolère une tentative de recrutement.'],
      ['Quelle plage de SpO2 évite ensuite l’hyperoxie ?', '94 à 96 %', 'Une saturation conservatrice limite l’exposition toxique.', src('b00139'), 'La SpO2 atteint 100 % sous FiO2 0,70 après recrutement.'],
      ['Quelle complication évoque un emphysème sous-cutané brutal ?', 'Barotraumatisme|pneumothorax', 'Une fuite gazeuse peut disséquer les tissus après rupture alvéolaire.', src('b00130'), 'Une tuméfaction crépitante apparaît au cou avec désaturation.'],
    ],
  },
  {
    label: 'Auto-PEP chez un patient obstructif',
    vignette: 'Un homme de 70 ans atteint de MPOC est ventilé pour acidose hypercapnique. L’expiration est très prolongée. Les courbes montrent une vidange lente, la pression artérielle reste stable et le traitement bronchodilatateur vient de débuter. L’équipe doit réduire le piégeage avant de rendre au patient une activité spontanée assistée.',
    steps: [
      ['Quelle complication mécanique recherchez-vous ?', 'Auto-PEP|PEP intrinsèque', 'La vidange incomplète emprisonne du gaz avant le cycle suivant.', src('b00086', 'b00091')],
      ['Quel signe graphique la confirme ?', 'Débit expiratoire non revenu à zéro', 'Un flux persistant prouve que l’expiration n’est pas achevée.', src('b00035', 'b00086'), 'La courbe de débit reste négative au début de l’inspiration suivante.'],
      ['Quelle modification de fréquence réalisez-vous ?', 'Réduction de la fréquence respiratoire', 'Des cycles plus espacés augmentent le temps de vidange.', src('b00082'), 'La fréquence réglée est encore de 20/min.'],
      ['Quel rapport I/E choisissez-vous ?', '1:4 ou 1:5', 'La part expiratoire devient nettement plus longue.', src('b00086'), 'La PEP totale reste supérieure de 8 cmH2O à la PEP réglée.'],
      ['Quel niveau de PaCO2 est tolérable ici ?', '50 à 70 mmHg', 'Cette plage permissive protège contre la surventilation.', src('b00082'), 'Après adaptation, la PaCO2 est à 65 mmHg avec pH 7,33.'],
      ['Pourquoi les efforts ne déclenchent-ils pas tous le ventilateur ?', 'Le patient doit vaincre l’auto-PEP', 'La pression alvéolaire positive ajoute une charge au seuil réglé.', src('b00091'), 'Le patient se réveille et plusieurs efforts restent inefficaces.'],
      ['Quel mode soutient la reprise de commande ?', 'Pression spontanée assistée|PC-CSV', 'Le patient fixe la fréquence et reçoit une aide à chaque effort détecté.', src('b00062', 'b00074'), 'Après correction du piégeage, chaque effort déclenche correctement.'],
    ],
  },
  {
    label: 'Sevrage après ventilation prolongée',
    vignette: 'Une patiente de 63 ans est ventilée depuis six jours pour choc septique. La sédation est interrompue et le choc est résolu. Elle obéit aux consignes, reçoit une faible dose d’oxygène et ne présente plus de fièvre. Une évaluation structurée doit déterminer si la pompe respiratoire, les échanges et la protection des voies aériennes autorisent l’extubation.',
    steps: [
      ['Quel rapport d’oxygénation minimal vérifiez-vous ?', 'PaO2/FiO2 supérieur à 150', 'Ce repère participe aux prérequis de sevrage.', src('b00097')],
      ['Quelle fréquence spontanée est favorable ?', 'Moins de 25/min', 'Une fréquence modérée suggère une charge supportable.', src('b00097'), 'Sous mode spontané, la fréquence est à 21/min.'],
      ['Quel indice calculez-vous avec fréquence et VT ?', 'Rapport fréquence/volume courant|f/VT', 'Il combine rapidité et amplitude respiratoires.', src('b00113'), 'Le VT spontané est de 350 mL et la fréquence de 24/min.'],
      ['Quelle valeur de cet indice est rassurante ?', 'Inférieure à 100', 'Sous ce seuil, le succès devient plus probable.', src('b00113'), 'Le calcul donne 69 cycles/min/L.'],
      ['Quelle épreuve sans aide pouvez-vous proposer ?', 'Épreuve sur pièce en T', 'Elle teste la tolérance cardiopulmonaire sans assistance significative.', src('b00104', 'b00105'), 'La mécanique et l’oxygénation remplissent les critères.'],
      ['Quel élément sécrétoire retarde le retrait ?', 'Plus de deux aspirations en huit heures', 'L’encombrement fréquent est la première cause de réintubation.', src('b00114'), 'L’épreuve est réussie mais quatre aspirations ont été nécessaires.'],
      ['Quel support peut prévenir un échec après extubation à haut risque ?', 'Ventilation non invasive|VNI', 'Une assistance non invasive préventive peut sécuriser la transition.', src('b00095'), 'Le lendemain, les sécrétions diminuent et une nouvelle épreuve réussit.'],
    ],
  },
  {
    label: 'Défaillance hémodynamique sous PEP',
    vignette: 'Un homme de 61 ans en choc hémorragique est intubé et immédiatement placé sous PEP élevée. Le contrôle du saignement débute mais la correction de la volémie est encore incomplète. L’oxygénation reste satisfaisante et aucune atteinte pulmonaire sévère n’est connue. La chute tensionnelle doit être reliée aux interactions cœur-poumon.',
    steps: [
      ['Quel mécanisme explique la chute tensionnelle attendue ?', 'Diminution du retour veineux|baisse de précharge', 'La pression thoracique réduit le gradient vers l’oreillette droite.', src('b00120', 'b00121')],
      ['Quelle cavité est particulièrement exposée ?', 'Ventricule droit|cœur droit', 'La pression positive diminue son remplissage et augmente sa postcharge.', src('b00117', 'b00123'), 'La pression artérielle s’effondre dès les premières insufflations.'],
      ['Quel facteur initial amplifie cette réponse ?', 'Hypovolémie|dépendance à la précharge', 'Le patient ne possède aucune réserve de remplissage.', src('b00122'), 'L’échographie montre une veine cave très collabable avant remplissage.'],
      ['Quel réglage réduisez-vous si l’oxygénation le permet ?', 'PEP|pression expiratoire positive', 'Une pression expiratoire moindre facilite le retour veineux.', src('b00084', 'b00120'), 'La SpO2 est à 99 % sous PEP 12 cmH2O.'],
      ['Quelle complication compressive excluez-vous en urgence ?', 'Pneumothorax compressif', 'Barotraumatisme et hypotension brutale imposent cette vérification.', src('b00130'), 'L’auscultation devient soudain asymétrique.'],
      ['Quel paramètre ventilatoire reflète le mieux la transmission globale ?', 'Pression moyenne des voies aériennes', 'Le retentissement cardiovasculaire lui est proportionnel.', src('b00117'), 'Le pneumothorax est exclu mais la pression moyenne reste très élevée.'],
      ['Quel principe guide la suite ?', 'Utiliser la pression minimale efficace', 'Le soutien respiratoire doit préserver simultanément la circulation.', src('b00117', 'b00163'), 'Après remplissage et réduction des pressions, l’hémodynamique se normalise.'],
    ],
  },
  {
    label: 'Prévention d’une pneumonie associée au ventilateur',
    vignette: 'Une patiente de 57 ans reste intubée après une chirurgie compliquée. La ventilation devrait durer plusieurs jours. Elle est alitée, sédatée et nécessite des aspirations endotrachéales régulières. Les poumons sont encore correctement oxygénés. L’équipe doit limiter les mécanismes de colonisation et préparer une libération dès que la situation chirurgicale le permettra.',
    steps: [
      ['Quel facteur temporel augmente le risque infectieux ?', 'Durée de ventilation mécanique', 'Le risque de pneumonie croît avec l’exposition au dispositif.', src('b00141')],
      ['Quel mécanisme fait passer des bactéries sous la glotte ?', 'Microaspirations autour du ballonnet', 'Les sécrétions colonisées franchissent régulièrement l’étanchéité.', src('b00126', 'b00141'), 'Des sécrétions s’accumulent au-dessus du ballonnet.'],
      ['Quelle défense naturelle est diminuée par la sonde ?', 'Clairance mucociliaire|activité mucociliaire', 'Le transport des particules vers le pharynx devient inefficace.', src('b00125', 'b00141'), 'La toux est également inhibée par la sédation.'],
      ['À partir de quelle durée la fréquence de PAVM rapportée atteint-elle 10–40 % ?', 'Plus de deux jours', 'Cette incidence concerne les patients assistés au-delà de 48 heures.', src('b00142'), 'La patiente entre dans son troisième jour de ventilation.'],
      ['Pourquoi une culture positive ne suffit-elle pas au diagnostic ?', 'Colonisation fréquente des voies aériennes', 'L’infection doit être distinguée d’un simple portage bactérien.', src('b00140', 'b00141', 'b00142'), 'Un prélèvement retrouve une bactérie sans infiltrat ni fièvre.'],
      ['Quel objectif réduit directement l’exposition ?', 'Sevrer dès que possible|réduire la durée de ventilation', 'La libération précoce diminue le temps de présence de la sonde.', src('b00094', 'b00095', 'b00141'), 'La cause initiale commence à se corriger.'],
      ['Quel signe clinique sécrétoire freine néanmoins l’extubation ?', 'Plus de deux aspirations en huit heures', 'Un encombrement important expose aussi à une réintubation.', src('b00114'), 'Quatre aspirations restent nécessaires malgré une épreuve spontanée correcte.'],
    ],
  },
  {
    label: 'Ajustement d’une interface de VNI',
    vignette: 'Une femme de 74 ans reçoit une VNI pour insuffisance respiratoire aiguë. Elle est consciente mais respire principalement par la bouche. La pression artérielle est stable, le besoin d’aide est modéré et aucune intubation immédiate n’est requise. Le succès dépendra de l’interface, de la synchronisation et de la prévention des effets locaux du flux.',
    steps: [
      ['Quelle interface choisissez-vous en première intention ?', 'Masque facial|masque oro-nasal', 'Il limite la fuite buccale et délivre mieux les pressions élevées.', src('b00150')],
      ['Quel défaut de confort recherchez-vous ?', 'Claustrophobie', 'Le masque facial couvrant peut être rejeté par une patiente éveillée.', src('b00150', 'b00151'), 'La patiente devient anxieuse dès la mise en place.'],
      ['Quelle donnée technique quantifiez-vous ?', 'Volume de fuite|fuites', 'La fuite influence déclenchement, assistance et choix d’interface.', src('b00154'), 'Plusieurs cycles semblent désynchronisés.'],
      ['Quelle complication cutanée surveillez-vous ?', 'Lésion de pression du visage|escarre du nez', 'Les points d’appui douloureux réduisent la tolérance.', src('b00153'), 'Une rougeur apparaît sur l’arête nasale.'],
      ['Quel cercle physiopathologique suit une fuite nasale ?', 'Sécheresse, inflammation puis hausse des résistances', 'Le flux continu irrite la muqueuse et favorise la respiration buccale.', src('b00155'), 'Un flux permanent dessèche les fosses nasales.'],
      ['Quel traitement améliore ce symptôme ?', 'Humidification chauffée', 'Elle restaure l’humidité et diminue les résistances nasales.', src('b00156', 'b00157', 'b00158'), 'La sécheresse menace l’acceptation de la VNI.'],
      ['Quel critère clinique simple confirme l’efficacité ?', 'Diminution du travail respiratoire|baisse de la fréquence respiratoire', 'Une respiration plus lente et confortable traduit un support utile.', src('b00149'), 'Après corrections, la fréquence passe de 34 à 22/min et la patiente tolère le masque.'],
    ],
  },
  {
    label: 'Reconnaître un échec de VNI',
    vignette: 'Un homme de 65 ans atteint de MPOC reçoit une VNI pour décompensation hypercapnique avec pH 7,29. Il est initialement orienté, mais très polypnéique, avec expiration longue et utilisation des muscles accessoires. Une surveillance clinique et gazométrique rapprochée doit reconnaître rapidement une amélioration ou un échec nécessitant l’intubation.',
    steps: [
      ['Quel mode est couramment utilisé ?', 'Pression assistée avec PEP|ventilation à deux niveaux de pression', 'Le patient déclenche une aide inspiratoire sur une pression expiratoire.', src('b00148')],
      ['Quelle anomalie mécanique explique des efforts non assistés ?', 'Auto-PEP|PEP intrinsèque', 'L’obstruction impose de vaincre une pression résiduelle avant le trigger.', src('b00091'), 'Les courbes montrent plusieurs efforts inefficaces.'],
      ['Quelle cause liée au masque recherchez-vous aussi ?', 'Fuite excessive|mauvaise étanchéité', 'Une fuite perturbe la détection et le volume reçu.', src('b00154'), 'Le ventilateur affiche 45 L/min de fuite.'],
      ['Quel signe neurologique annonce l’échec ?', 'Somnolence|altération de conscience', 'La baisse de vigilance menace commande et protection des voies aériennes.', src('b00069', 'b00149'), 'Malgré les corrections, le patient devient difficile à réveiller.'],
      ['Quel résultat gazométrique confirme l’aggravation ?', 'Baisse du pH avec hausse de PaCO2', 'L’acidose hypercapnique traduit une ventilation alvéolaire insuffisante.', src('b00075'), 'Le pH chute à 7,20 et la PaCO2 augmente.'],
      ['Quelle stratégie devient nécessaire ?', 'Intubation et ventilation invasive', 'L’échec ventilatoire et neurologique ne permet plus un support au masque.', src('b00069', 'b00149'), 'Le travail respiratoire s’épuise malgré une SpO2 correcte sous oxygène.'],
      ['Quel réglage protège ensuite ce terrain obstructif ?', 'Temps expiratoire prolongé|rapport I/E 1:4', 'Une longue expiration évite le piégeage gazeux après intubation.', src('b00086'), 'La voie aérienne est sécurisée et la ventilation invasive commence.'],
    ],
  },
];

function buildSeries() {
  const series = [];
  const qcmThemes = ['Cycle et monitorage', 'Modes ventilatoires', 'Prescription initiale', 'Sevrage', 'Cœur et pressions', 'Lésions pulmonaires', 'Oxygène et infection', 'VNI et interfaces'];
  for (let index = 0; index < 8; index += 1) {
    series.push({ label: `QCM - Série ${index + 1} · ${qcmThemes[index]}`, allowed_voies: ['interne'], questions: ISOLATED_QCM.slice(index * 5, index * 5 + 5) });
  }
  DP_QCM.forEach((clinicalCase, index) => series.push({ label: `DP QCM ${index + 1} · ${clinicalCase.label}`, vignette: clinicalCase.vignette, allowed_voies: ['interne'], questions: clinicalCase.questions }));

  const qrocThemes = ['Cycle ventilatoire', 'Modes', 'Réglages', 'Oxygénation', 'Sevrage', 'Retentissement', 'Protection', 'VNI'];
  for (let index = 0; index < 8; index += 1) {
    const questions = ISOLATED_QROC.slice(index * 5, index * 5 + 5).map(([enonce, answer, correction, blocks]) => makeQroc(enonce, answer, correction, blocks));
    series.push({ label: `QROC - Série ${index + 1} · ${qrocThemes[index]}`, allowed_voies: ['externe'], questions });
  }
  DP_QROC.forEach((clinicalCase, index) => series.push({
    label: `DP QROC ${index + 1} · ${clinicalCase.label}`,
    vignette: clinicalCase.vignette,
    allowed_voies: ['externe'],
    questions: clinicalCase.steps.map(([prompt, answer, correction, blocks, info], questionIndex) => makeQroc(prompt, answer, correction, blocks, questionIndex ? info : undefined)),
  }));
  return series;
}

export function buildChapter06(extract) {
  if (!extract?.blocs?.length) throw new Error('Chapitre 06 : extraction source absente ou vide.');
  const available = new Set(extract.blocs.map((block) => block.id).filter(Boolean));
  const fiche = buildFiche();
  const flashcards = buildFlashcards();
  const series = buildSeries();
  const referenced = [
    ...fiche.sourceBlocks,
    ...flashcards.flatMap((card) => card.sourceBlocks),
    ...series.flatMap((entry) => entry.questions.flatMap((question) => question.sourceBlocks)),
  ];
  const unknown = [...new Set(referenced.filter((id) => !available.has(id)))];
  if (unknown.length) throw new Error(`Chapitre 06 : blocs de provenance inconnus (${unknown.join(', ')}).`);
  return { fiche, flashcards, series };
}

export default buildChapter06;

// Chapitre 18 - Les anesthésiques locaux.
// Module éditorial autonome, fondé exclusivement sur extract.json.

const src = (...ids) => ids;
const n2 = (text, ...children) => ({ text, children });
const row = (concept, bullets, sourceBlocks, image) => ({
  concept,
  bullets,
  sourceBlocks,
  ...(image ? { image } : {}),
});
const fullImage = (path, caption, sourceCaption, cropBottomMm) => ({
  path,
  position: "after",
  size: "large",
  layout: "full_width",
  containsText: true,
  ...(caption ? { caption } : {}),
  ...(sourceCaption ? { sourceCaption } : {}),
  ...(cropBottomMm ? { cropBottomMm } : {}),
});

const IMAGES = {
  structure: fullImage(
    "img/img_001.png",
    "Une même architecture relie noyau aromatique, chaîne intermédiaire et amine tertiaire",
    "FIGURE 18.1 Procaïne et lidocaïne",
    10,
  ),
  pkaTable: fullImage(
    "img/img_002.png",
    "Le pKa varie entre les anesthésiques locaux usuels",
    "TABLEAU 18.1 pKa des anesthésiques locaux",
  ),
  ionization: fullImage(
    "img/img_003.png",
    "À pH physiologique, un pKa élevé augmente la fraction ionisée",
    "FIGURE 18.2 Pourcentage de forme ionisée à pH physiologique selon le pKa de l'anesthésique local",
    10,
  ),
  fibers: fullImage(
    "img/img_004.png",
    "Fonction, myélinisation et diamètre gouvernent l’ordre du bloc différentiel",
    "TABLEAU 18.2 Caractéristiques des fibres du système nerveux périphérique et effets des anesthésiques locaux sur ces dernières",
  ),
  channel: fullImage(
    "img/img_005.png",
    "Forme neutre diffusible, forme cationique bloquante",
    "FIGURE 18.3 Relation entre l'anesthésique local, la membrane cellulaire et le canal sodique",
  ),
  agents: fullImage(
    "img/img_006.png",
    "Comparer puissance, concentration, latence, durée et dose maximale avant de choisir",
    "TABLEAU 18.3 Caractéristiques cliniques des anesthésiques locaux",
  ),
  lastStart: fullImage(
    "img/img_007.png",
    "Toxicité systémique : préparer, prévenir, détecter et traiter sans délai",
    "TABLEAU 18.4 Prise en charge de la toxicité systémique des anesthésiques locaux (TSAL)",
  ),
  lastFollow: fullImage("img/img_008.png", null, null),
  lidocaineToxicity: fullImage(
    "img/img_009.png",
    "La toxicité neurologique précède habituellement la dépression cardiovasculaire avec la lidocaïne",
    "FIGURE 18.4 Progression des signes et symptômes d’une intoxication à la lidocaïne en fonction des concentrations sériques",
  ),
  sites: fullImage(
    "img/img_010.png",
    "À dose identique, les pics plasmatiques diffèrent fortement selon la vascularisation du site",
    "FIGURE 18.5 Concentrations plasmatiques d'anesthésiques locaux en fonction du type de bloc",
  ),
  spinal: fullImage(
    "img/img_011.png",
    "Durée opératoire, site et baricité orientent la molécule et l’adjuvant rachidien",
    "TABLEAU 18.5 Exemples de choix d'AL et d'ajout d'adjuvants en rachianesthésie",
  ),
};

function buildFiche() {
  const parts = [
    {
      title: "Relier structure, ionisation et propriétés cliniques",
      sections: [
        {
          title: "Lire l’architecture d’un anesthésique local",
          rows: [
            row(
              "Structure commune",
              [
                n2(
                  "Identifier trois modules fonctionnels",
                  "Un noyau aromatique lipophile favorise l’interaction avec les membranes.",
                  "Une chaîne intermédiaire porte une liaison ester ou amide.",
                  "Une amine tertiaire hydrophile permet la mise en solution et l’ionisation.",
                ),
              ],
              src("b00008", "b00009"),
              IMAGES.structure,
            ),
            row(
              "Deux familles",
              [
                "La liaison de la chaîne intermédiaire distingue esters et amides.",
                "Cette différence structurale commande surtout le métabolisme et le risque allergique.",
              ],
              src("b00008", "b00011"),
            ),
            row(
              "Métabolisme",
              [
                n2(
                  "Associer famille et voie d’élimination",
                  "Les esters sont hydrolysés par les pseudo-cholinestérases plasmatiques.",
                  "Les amides sont métabolisés au foie par le cytochrome P450.",
                  "Une atteinte hépatique grave est nécessaire pour perturber nettement un bolus isolé d’amide.",
                ),
              ],
              src("b00011", "b00035"),
            ),
            row(
              "Chiralité",
              [
                "Deux énantiomères ont la même formule mais une organisation tridimensionnelle en miroir.",
                "La stéréosélectivité peut modifier puissance et toxicité ; lévobupivacaïne et ropivacaïne exploitent ce principe.",
              ],
              src("b00032", "b00033"),
            ),
          ],
        },
        {
          title: "Faire du couple pH-pKa un raisonnement clinique",
          rows: [
            row(
              "Définition du pKa",
              [
                "Le pKa est le pH auquel formes ionisée et non ionisée sont présentes à parts égales.",
                "Le pKa contribue au délai d’installation sans le déterminer seul.",
              ],
              src("b00011", "b00016", "b00017"),
              IMAGES.pkaTable,
            ),
            row(
              "Deux formes complémentaires",
              [
                n2(
                  "Dissocier diffusion et action",
                  "La forme base non ionisée, liposoluble, traverse la membrane.",
                  "La forme cationique ionisée, hydrosoluble, se fixe dans le canal sodique.",
                  "L’efficacité exige donc une succession d’équilibres, et non une forme unique.",
                ),
              ],
              src("b00017", "b00019", "b00020"),
            ),
            row(
              "Henderson-Hasselbalch",
              [
                "Pour une base faible : pH = pKa + log(forme non ionisée / forme ionisée).",
                "Une variation d’une unité de pH modifie d’un facteur dix le rapport entre les deux formes.",
              ],
              src("b00020", "b00021", "b00022", "b00023"),
              IMAGES.ionization,
            ),
            row(
              "Tissu acide",
              [
                "Dans un abcès ou une zone inflammatoire, la baisse du pH augmente la fraction ionisée.",
                "La diffusion membranaire diminue : le bloc s’installe mal et l’analgésie devient insuffisante.",
              ],
              src("b00024", "b00025", "b00026"),
            ),
          ],
        },
        {
          title: "Interpréter liaison protéique et lipophilie sans raccourci",
          rows: [
            row(
              "Liaison aux protéines",
              [
                "Une liaison protéique élevée est généralement associée à une durée plus longue.",
                "Cette corrélation est liée aussi à l’hydrophobicité et ne prouve pas une simple affinité parallèle pour le canal.",
              ],
              src("b00029"),
            ),
            row(
              "Solubilité lipidique",
              [
                n2(
                  "Relier pénétration et puissance",
                  "Une lipophilie élevée facilite le passage dans les membranes lipoprotéiques.",
                  "Une moindre quantité peut alors suffire pour atteindre les canaux.",
                  "Puissance, durée et toxicité restent néanmoins interdépendantes.",
                ),
              ],
              src("b00030", "b00031"),
            ),
            row(
              "Lecture prudente",
              [
                "pKa, liaison protéique et lipophilie orientent latence, durée et puissance.",
                "Ces relations restent des corrélations cliniques et non des règles absolues.",
              ],
              src("b00011", "b00029", "b00031"),
            ),
          ],
        },
      ],
    },
    {
      title: "Comprendre le bloc sodique et sa sélectivité",
      sections: [
        {
          title: "De la dépolarisation au potentiel d’action",
          rows: [
            row(
              "Dépôt périnerveux",
              [
                "L’anesthésique local doit être déposé près du nerf : la concentration locale et le volume déterminent l’intensité et l’étendue.",
                "Une arrivée uniquement sanguine serait inefficace pour le bloc et dangereuse par sa toxicité.",
              ],
              src("b00037"),
            ),
            row(
              "Potentiel de repos",
              [
                "Les gradients ioniques transmembranaires établissent un potentiel électrique stable.",
                "L’entrée de sodium par les canaux voltage-dépendants déclenche un potentiel d’action tout ou rien.",
              ],
              src("b00045", "b00046", "b00047"),
            ),
            row(
              "Propagation",
              [
                n2(
                  "Interrompre le courant entrant",
                  "Le seuil doit être atteint pour initier le potentiel.",
                  "La dépolarisation ouvre les canaux voisins et propage l’influx.",
                  "Bloquer suffisamment de canaux empêche le seuil et interrompt la conduction.",
                ),
              ],
              src("b00047", "b00048", "b00049"),
            ),
          ],
        },
        {
          title: "Bloquer le canal depuis la face intracellulaire",
          rows: [
            row(
              "Canal sodique",
              [
                "La sous-unité alpha assure les fonctions essentielles ; des sous-unités bêta modulent expression et fonctionnement.",
                "Le canal alterne états de repos, ouvert et inactivé.",
              ],
              src("b00048", "b00049"),
            ),
            row(
              "Accès au site actif",
              [
                n2(
                  "Suivre la molécule à travers la fibre",
                  "À l’extérieur, la fraction non ionisée franchit membrane axonale et myéline.",
                  "Dans le cytoplasme plus acide, l’équilibre favorise la forme cationique.",
                  "Le cation atteint le canal ouvert ou inactivé et en empêche la réouverture.",
                ),
              ],
              src(
                "b00054",
                "b00055",
                "b00056",
                "b00057",
                "b00058",
                "b00061",
                "b00062",
              ),
              IMAGES.channel,
            ),
            row(
              "Voie hydrophobe accessoire",
              [
                "La forme neutre peut s’accumuler dans la bicouche et déformer le canal depuis l’extérieur.",
                "Ce trajet existe mais n’est pas le mécanisme principal.",
              ],
              src("b00062", "b00063"),
            ),
            row(
              "Toxines naturelles",
              [
                "Tétrodotoxine, saxitoxine et néosaxitoxine bloquent aussi les canaux sodiques.",
                "Leur puissance extrême contraste avec les anesthésiques locaux usuels et limite leur emploi.",
              ],
              src("b00064"),
            ),
          ],
        },
        {
          title: "Exploiter la diversité des fibres",
          rows: [
            row(
              "Myéline",
              [
                "Les cellules de Schwann isolent les fibres myélinisées et organisent les nœuds de Ranvier.",
                "La conduction saltatoire exige le bloc de plusieurs nœuds successifs.",
              ],
              src("b00050", "b00051"),
            ),
            row(
              "Fibres non myélinisées",
              [
                "Plusieurs petites fibres cheminent dans les invaginations d’une cellule de Schwann.",
                "La conduction continue les rend sensibles selon leur diamètre et la concentration exposée.",
              ],
              src("b00052", "b00053"),
            ),
            row(
              "Ordre fonctionnel",
              [
                n2(
                  "Prévoir un bloc différentiel",
                  "Les petites fibres C et A-delta de douleur et température sont bloquées précocement.",
                  "Le toucher et la pression peuvent persister alors que l’analgésie est obtenue.",
                  "Les grosses fibres motrices A-alpha nécessitent une exposition plus importante.",
                ),
              ],
              src(
                "b00038",
                "b00039",
                "b00043",
                "b00044",
                "b00053",
                "b00065",
                "b00066",
                "b00067",
              ),
              IMAGES.fibers,
            ),
          ],
        },
      ],
    },
    {
      title: "Choisir une molécule et une dose pour un patient et un site",
      sections: [
        {
          title: "Raisonner au-delà des milligrammes par kilogramme",
          rows: [
            row(
              "Activité nerveuse et intensité du bloc",
              [
                "À faible fréquence, un bloc partiel apparaît tonique.",
                "Quand la fréquence augmente, davantage de canaux ouverts ou inactivés sont accessibles : le bloc phasique s’intensifie.",
              ],
              src("b00068", "b00069"),
            ),
            row(
              "Cinq déterminants",
              [
                n2(
                  "Construire une prescription contextualisée",
                  "État physiologique et comorbidités du patient.",
                  "Latence, durée, puissance, bloc différentiel et toxicité de l’agent.",
                  "Technique, présence d’un cathéter, durée opératoire et stratégie postopératoire.",
                ),
              ],
              src("b00070", "b00071", "b00072", "b00073"),
            ),
            row(
              "Dose maximale",
              [
                "Une limite en milligrammes ne garantit jamais l’absence de toxicité.",
                "Le site, la concentration, la fraction libre, l’adjuvant et la vitesse d’injection modifient le pic systémique.",
              ],
              src("b00071", "b00076", "b00079", "b00080"),
              IMAGES.agents,
            ),
            row(
              "Injection intravasculaire",
              [
                "Une injection accidentelle peut provoquer une toxicité quasi instantanée malgré une dose totale recommandée.",
                "Aspiration, fractionnement, observation et échographie réduisent le risque sans le supprimer.",
              ],
              src("b00075", "b00076", "b00084"),
            ),
          ],
        },
        {
          title: "Intégrer la vascularisation et la durée du geste",
          rows: [
            row(
              "Absorption par site",
              [
                n2(
                  "Anticiper le pic plasmatique",
                  "Les sites très vascularisés donnent les concentrations les plus élevées.",
                  "À dose identique, les valeurs peuvent varier du simple au triple ou davantage.",
                  "L’infiltration sous-cutanée absorbe moins qu’un bloc intercostal.",
                ),
              ],
              src("b00071", "b00124", "b00125"),
              IMAGES.sites,
            ),
            row(
              "Échographie",
              [
                "La visualisation améliore le dépôt et peut réduire la toxicité systémique.",
                "Elle ne prévient pas toutes les injections vasculaires ni les symptômes retardés des techniques continues.",
              ],
              src("b00005", "b00084"),
            ),
            row(
              "Procédure intermédiaire",
              [
                "Pour environ trois heures, choisir un agent long en injection unique ou un agent plus court par cathéter continu.",
                "La seconde stratégie offre une titration mais expose à l’accumulation et au déplacement du cathéter.",
              ],
              src("b00128", "b00129"),
            ),
          ],
        },
        {
          title: "Réduire la dose quand la vulnérabilité augmente",
          rows: [
            row(
              "Sujet âgé",
              [
                "L’élimination ralentit et le tissu nerveux devient plus sensible.",
                "En rachianesthésie, une même dose produit un niveau sensitif plus haut : une réduction est recommandée.",
              ],
              src("b00110", "b00111"),
            ),
            row(
              "Grossesse",
              [
                n2(
                  "Cumuler trois raisons de réduire",
                  "Sensibilité neurale accrue.",
                  "Liaison protéique plus faible et fraction libre plus grande.",
                  "Modifications anatomiques majorant la diffusion neuraxiale ; bupivacaïne 0,75 % interdite en péridurale obstétricale.",
                ),
              ],
              src("b00112", "b00113", "b00114"),
            ),
            row(
              "Foie et cœur",
              [
                "Les doses répétées ou perfusions d’amides s’accumulent en insuffisance hépatique.",
                "L’hypoprotéinémie augmente la fraction libre ; le bas débit cardiaque réduit la perfusion hépatique et la clairance.",
              ],
              src("b00115", "b00116", "b00117"),
            ),
            row(
              "Insuffisance rénale",
              [
                "La circulation hyperdynamique peut accroître l’absorption systémique.",
                "Une réduction de 10 à 20 % est proposée pour injection unique, répétée ou continue.",
              ],
              src("b00118"),
            ),
            row(
              "Pseudo-cholinestérase atypique",
              [
                "Une forme sévère prive les esters de leur voie d’hydrolyse plasmatique.",
                "Éviter alors des doses importantes d’anesthésique local de type ester.",
              ],
              src("b00119", "b00120", "b00121"),
            ),
          ],
        },
      ],
    },
    {
      title: "Prévenir et traiter la toxicité systémique et locale",
      sections: [
        {
          title: "Reconnaître une toxicité systémique évolutive ou brutale",
          rows: [
            row(
              "Déterminants",
              [
                "La toxicité dépend de la concentration sérique et surtout de la rapidité de son augmentation.",
                "Une injection vasculaire massive peut faire débuter le tableau par convulsion, arythmie ou arrêt sans prodrome.",
              ],
              src("b00076", "b00084", "b00086", "b00087"),
            ),
            row(
              "Prodromes neurologiques",
              [
                n2(
                  "Repérer l’ascension des signes",
                  "Paresthésies péribuccales et goût métallique.",
                  "Discours ralenti, étourdissements, acouphènes, agitation.",
                  "Fasciculations, tremblements puis convulsion généralisée.",
                ),
              ],
              src("b00087"),
              IMAGES.lidocaineToxicity,
            ),
            row(
              "Atteinte cardiovasculaire",
              [
                "Avec la lidocaïne, la dépression cardiovasculaire survient à des concentrations supérieures à la toxicité neurologique.",
                "Avec la bupivacaïne racémique, l’écart est étroit et le collapsus combine arythmie, inotropisme négatif et vasodilatation.",
              ],
              src("b00093", "b00094"),
            ),
          ],
        },
        {
          title: "Déployer une réponse structurée à la TSAL",
          rows: [
            row(
              "Facteurs aggravants à corriger",
              [
                "Hypoxémie et acidose majorent la toxicité cardiaque et doivent être corrigées immédiatement.",
                "La grossesse augmente particulièrement la vulnérabilité à la bupivacaïne.",
              ],
              src("b00094", "b00162", "b00163", "b00164"),
            ),
            row(
              "Préparation et prévention",
              [
                n2(
                  "Être prêt avant l’injection",
                  "Rendre immédiatement accessibles matériel de réanimation et émulsion lipidique 20 %.",
                  "Doser selon site et patient, aspirer, fractionner et utiliser un marqueur d’injection intravasculaire.",
                  "Maintenir une surveillance pendant et après le geste.",
                ),
              ],
              src("b00075", "b00076", "b00084", "b00088"),
            ),
            row(
              "Premières mesures",
              [
                "Cesser l’injection, appeler de l’aide et assurer une oxygénation à 100 % avec contrôle ventilatoire.",
                "Prévenir hypoxie et acidose ; traiter les convulsions par benzodiazépine.",
              ],
              src("b00087", "b00088", "b00092", "b00162", "b00163"),
              IMAGES.lastStart,
            ),
            row(
              "Émulsion lipidique",
              [
                "Administrer précocement l’émulsion lipidique 20 % selon l’algorithme en cas de toxicité sévère.",
                "Son emploi pendant les convulsions peut prévenir la progression vers l’arrêt cardiaque.",
              ],
              src("b00088", "b00092", "b00094"),
            ),
            row(
              "Réanimation cardiaque adaptée",
              [
                "Appliquer une réanimation prolongée en réduisant les doses d’adrénaline par rapport aux algorithmes usuels.",
                "Éviter les anesthésiques locaux antiarythmiques ; privilégier l’amiodarone pour les troubles ventriculaires.",
              ],
              src("b00088", "b00094"),
            ),
            row(
              "Surveillance après stabilisation",
              [
                "Transférer dans une zone monitorée pendant au moins 12 heures après atteinte cardiovasculaire.",
                "Après émulsion lipidique, rechercher une pancréatite et déclarer l’événement.",
              ],
              src("b00088"),
              IMAGES.lastFollow,
            ),
          ],
        },
        {
          title: "Distinguer les autres complications",
          rows: [
            row(
              "Allergie",
              [
                "Le PABA, métabolite des esters, explique la majorité de leurs allergies ; le méthylparaben peut aussi être en cause.",
                "Une allergie vraie aux amides est rare : distinguer choc vagal et effets de l’adrénaline par un interrogatoire précis.",
              ],
              src("b00097", "b00098", "b00099"),
            ),
            row(
              "Méthémoglobinémie",
              [
                n2(
                  "Reconnaître une discordance SpO2-PaO2",
                  "Benzocaïne et prilocaïne sont les agents les plus évocateurs.",
                  "Une SpO2 inférieure à 90 % avec PaO2 supérieure à 70 mmHg doit alerter.",
                  "La CO-oxymétrie confirme le diagnostic.",
                ),
              ],
              src("b00100", "b00101"),
            ),
            row(
              "Lésion nerveuse",
              [
                "Un déficit postopératoire est un diagnostic d’exclusion : considérer chirurgie, obstétrique, injection intraneurale et additifs.",
                "Après intrathécale de lidocaïne, dysesthésies et brûlures des membres inférieurs évoquent une irritation radiculaire transitoire.",
              ],
              src("b00102", "b00103", "b00104"),
            ),
            row(
              "Myotoxicité",
              [
                "L’injection intramusculaire provoque une myonécrose, souvent discrète et réversible.",
                "La toxicité décroît de bupivacaïne à lidocaïne/tétracaïne puis procaïne ; l’adrénaline augmente celle de la lidocaïne.",
              ],
              src("b00105", "b00106", "b00107"),
            ),
          ],
        },
      ],
    },
    {
      title: "Adapter adjuvants, voies d’emploi et stratégies prolongées",
      sections: [
        {
          title: "Prolonger un bloc sans perdre le contrôle de la dose",
          rows: [
            row(
              "Adrénaline",
              [
                n2(
                  "Comprendre deux mécanismes",
                  "La vasoconstriction ralentit l’absorption, prolonge l’effet et réduit le pic systémique.",
                  "En rachianesthésie, un effet alpha-adrénergique spinal participe à la potentialisation.",
                  "La prudence persiste dans les territoires à vascularisation terminale.",
                ),
              ],
              src(
                "b00138",
                "b00139",
                "b00140",
                "b00141",
                "b00169",
                "b00170",
                "b00171",
              ),
            ),
            row(
              "Opioïdes",
              [
                "Morphine et fentanyl renforcent l’analgésie neuraxiale avec une dose d’anesthésique local réduite.",
                "Le choix dépend de la durée et du site chirurgical.",
              ],
              src("b00138", "b00142"),
              IMAGES.spinal,
            ),
            row(
              "Agonistes alpha-2",
              [
                "La clonidine est surtout réservée aux douleurs chroniques dans le contexte décrit.",
                "La dexmédétomidine peut être utilisée comme adjuvant, avec bénéfice et sécurité à évaluer.",
              ],
              src("b00138", "b00142"),
            ),
          ],
        },
        {
          title: "Éviter les fausses bonnes idées de mélange",
          rows: [
            row(
              "Intention du mélange",
              [
                "Associer un agent rapide et un agent long vise un début court et une durée prolongée.",
                "Le résultat réel peut être intermédiaire plutôt que cumulatif.",
              ],
              src("b00143", "b00144"),
            ),
            row(
              "Toxicité additive",
              [
                n2(
                  "Additionner les charges, pas les plafonds",
                  "Deux anesthésiques locaux partagent une toxicité systémique additive.",
                  "Chaque fraction consommée réduit proportionnellement la marge de l’autre.",
                  "Un mélange ne doit jamais permettre de dépasser deux doses maximales indépendantes.",
                ),
              ],
              src("b00144"),
            ),
            row(
              "Résultat clinique",
              [
                "Le mélange n’additionne pas nécessairement la meilleure latence et la meilleure durée.",
                "Le profil obtenu peut simplement devenir intermédiaire entre les deux agents.",
              ],
              src("b00144"),
            ),
          ],
        },
        {
          title: "Utiliser des voies particulières avec une indication précise",
          rows: [
            row(
              "Lidocaïne intraveineuse",
              [
                "Elle peut compléter l’analgésie périopératoire et atténuer les réflexes bronchoconstricteurs d’intubation ou d’extubation.",
                "La perfusion est commencée avant l’incision et doit conserver une surveillance systémique.",
              ],
              src("b00145", "b00146", "b00147"),
            ),
            row(
              "Bloc veineux",
              [
                "Le bloc de Bier associe lidocaïne intraveineuse régionale et tourniquet.",
                "La sécurité dépend du maintien de l’isolement vasculaire et de la dose totale.",
              ],
              src("b00145"),
            ),
            row(
              "Anesthésie transcutanée",
              [
                "La peau intacte freine l’absorption, contrairement aux muqueuses.",
                "Crèmes, timbres et onguents permettent une analgésie cutanée ou le traitement de certaines douleurs chroniques.",
              ],
              src("b00148", "b00149", "b00150"),
            ),
          ],
        },
        {
          title: "Situer les formulations prolongées",
          rows: [
            row(
              "Libération contrôlée",
              [
                n2(
                  "Viser 72 à 96 heures sans surtoxicité",
                  "Liposomes et polymères biologiques peuvent relarguer lentement un anesthésique local.",
                  "La bupivacaïne liposomale illustre cette stratégie.",
                  "Le véhicule et le manque de spécificité tissulaire restent des limites.",
                ),
              ],
              src("b00151", "b00152", "b00153"),
            ),
            row(
              "Agent illustratif",
              [
                "La bupivacaïne peut être encapsulée afin de prolonger sa présence locale.",
                "La durée prolongée ne dispense pas d’évaluer la toxicité propre de l’agent.",
              ],
              src("b00152"),
            ),
            row(
              "Limites de développement",
              [
                "La toxicité du véhicule peut annuler le bénéfice du relargage lent.",
                "Une diffusion insuffisamment spécifique expose encore des tissus non ciblés.",
              ],
              src("b00153"),
            ),
          ],
        },
      ],
    },
  ];
  const sourceBlocks = [
    ...new Set(
      parts.flatMap((part) =>
        part.sections.flatMap((section) =>
          section.rows.flatMap((item) => item.sourceBlocks),
        ),
      ),
    ),
  ];
  return {
    matiere: "Anesthésie-Réanimation",
    title: "Les anesthésiques locaux",
    year: "2026-2027",
    coverSubtitle:
      "Comprendre le bloc sodique, individualiser la dose et traiter sans délai toute toxicité systémique",
    sourceBlocks,
    parts,
    imageOmissions: [],
    synthesis: {
      compactLayout: true,
      chiffres: {
        headers: ["Repère", "Valeur"],
        rows: [
          [
            "Variation d’une unité de pH",
            "Rapport ionisé/non ionisé multiplié ou divisé par 10",
          ],
          ["Insuffisance rénale", "Réduction proposée de 10 à 20 %"],
          ["Lidocaïne : toxicité neurologique", "≈ 12 µg/mL"],
          ["Lidocaïne : dépression cardiovasculaire", "≈ 22 µg/mL"],
          ["Bupivacaïne : neurotoxicité / cardiotoxicité", "≈ 4 / 6 µg/mL"],
          ["Méthémoglobinémie suspecte", "SpO2 < 90 % avec PaO2 > 70 mmHg"],
          ["Émulsion de secours", "Lipidique 20 %"],
          ["Formulations prolongées", "Relargage visé 72 à 96 h"],
        ],
      },
      tables: [
        {
          title: "Toxicité systémique : ordre des actions",
          headers: ["Moment", "Conduite"],
          rows: [
            [
              "Dès le soupçon",
              "Arrêter l’injection, appeler de l’aide, oxygéner à 100 %",
            ],
            ["Convulsion", "Ventiler, éviter acidose, benzodiazépine"],
            ["Atteinte sévère", "Émulsion lipidique 20 % selon l’algorithme"],
            [
              "Arrêt ou arythmie",
              "Réanimation adaptée, petites doses d’adrénaline, amiodarone",
            ],
            [
              "Après stabilisation",
              "Monitorage prolongé et surveillance des complications",
            ],
          ],
        },
      ],
      keyPoints: [
        "La forme neutre traverse la membrane ; la forme cationique bloque le canal sodique depuis l’intérieur.",
        "Un tissu acide piège l’anesthésique sous forme ionisée et réduit la réussite du bloc.",
        "La dose maximale n’annule jamais le risque d’une injection intravasculaire accidentelle.",
        "Le site d’injection, le terrain et la technique comptent autant que le nombre de milligrammes.",
        "Prodromes neurologiques, convulsion ou arythmie doivent faire interrompre immédiatement l’injection.",
        "Oxygénation, prévention de l’acidose, contrôle des convulsions et émulsion lipidique structurent la prise en charge.",
        "La bupivacaïne a une marge étroite entre toxicité neurologique et cardiaque.",
        "La toxicité de deux anesthésiques locaux mélangés est additive.",
      ],
      eclair: [
        "Esters : pseudo-cholinestérases ; amides : métabolisme hépatique par CYP450.",
        "pH bas ou pKa haut : moins de forme neutre, diffusion plus lente.",
        "Douleur et température disparaissent avant toucher, pression et motricité.",
        "Injection intravasculaire : toxicité brutale possible malgré une dose totale correcte.",
        "TSAL : arrêter, oxygéner, ventiler, benzodiazépine si convulsion, lipides 20 % si forme sévère.",
        "SpO2 basse avec PaO2 préservée : penser méthémoglobinémie et confirmer par CO-oxymétrie.",
        "Âge, grossesse, foie, cœur, rein et protéines plasmatiques imposent une adaptation.",
        "Adrénaline : absorption ralentie, durée prolongée, prudence aux territoires terminaux.",
      ],
    },
  };
}

const card = (recto, verso, sourceBlocks) => ({
  recto,
  verso,
  sourceBlocks: Array.isArray(sourceBlocks) ? sourceBlocks : [sourceBlocks],
});
const qcm = (
  enonce,
  sourceBlocks,
  correction_generale,
  items,
  newInformation,
) => ({
  enonce: newInformation ? `${newInformation} ${enonce}` : enonce,
  format: "qcm",
  sourceBlocks,
  correction_generale,
  ...(newInformation ? { newInformation } : {}),
  items: items.map(([is_correct, itemEnonce, justification], index) => ({
    lettre: "ABCDE"[index],
    enonce: itemEnonce,
    is_correct,
    justification,
  })),
});
const qroc = (
  enonce,
  reponse_attendue,
  sourceBlocks,
  correction_generale,
  newInformation,
) => ({
  enonce: newInformation ? `${newInformation} ${enonce}` : enonce,
  format: "qroc",
  reponse_attendue,
  sourceBlocks,
  correction_generale,
  items: [],
  ...(newInformation ? { newInformation } : {}),
});

const FLASHCARDS = [
  card(
    "Quelles sont les deux familles d’anesthésiques locaux ?",
    "Esters et amides.",
    src("b00008", "b00155", "b00156"),
  ),
  card(
    "Quels sont les trois modules structuraux d’un anesthésique local ?",
    "Noyau aromatique, chaîne intermédiaire et amine tertiaire.",
    src("b00008", "b00009"),
  ),
  card(
    "Quel élément structural distingue ester et amide ?",
    "La nature de la liaison de la chaîne intermédiaire.",
    src("b00008"),
  ),
  card(
    "Quelle voie métabolise les anesthésiques locaux esters ?",
    "Les pseudo-cholinestérases plasmatiques.",
    src("b00035"),
  ),
  card(
    "Où les anesthésiques locaux amides sont-ils métabolisés ?",
    "Au foie, principalement par le cytochrome P450.",
    src("b00035"),
  ),
  card(
    "Quelle découverte a initié l’anesthésie locale ?",
    "L’isolement de la cocaïne par Niemann en 1860.",
    src("b00003"),
  ),
  card(
    "Quel anesthésique local amide Lôfgren a-t-il synthétisé en 1943 ?",
    "La lidocaïne.",
    src("b00004"),
  ),
  card(
    "Pourquoi les amides ont-ils été développés ?",
    "Notamment pour éviter les propriétés allergisantes des esters.",
    src("b00004"),
  ),
  card(
    "Qu’est-ce que le pKa d’un anesthésique local ?",
    "Le pH où les formes ionisée et non ionisée sont en concentrations égales.",
    src("b00016", "b00017"),
  ),
  card(
    "Quelle forme traverse la membrane nerveuse ?",
    "La forme base non ionisée, liposoluble.",
    src("b00017", "b00157"),
  ),
  card(
    "Quelle forme bloque le canal sodique ?",
    "La forme cationique ionisée, hydrosoluble.",
    src("b00017", "b00157"),
  ),
  card(
    "Comment nomme-t-on la forme non ionisée ?",
    "Forme base ou forme neutre.",
    src("b00019"),
  ),
  card(
    "Comment nomme-t-on la forme ionisée ?",
    "Forme cationique.",
    src("b00019", "b00020"),
  ),
  card(
    "Quelle équation relie pH, pKa et formes d’un anesthésique local ?",
    "L’équation de Henderson-Hasselbalch.",
    src("b00020"),
  ),
  card(
    "Quel effet a une variation d’une unité de pH sur le rapport des formes ?",
    "Elle modifie ce rapport d’un facteur dix.",
    src("b00023"),
  ),
  card(
    "Pourquoi un abcès répond-il mal à l’anesthésie locale ?",
    "Le pH bas augmente la forme ionisée, qui traverse mal les membranes.",
    src("b00024", "b00025", "b00026"),
  ),
  card(
    "Quel effet général a un pKa bas sur le délai d’action ?",
    "Il augmente la fraction neutre et tend à accélérer l’installation.",
    src("b00017", "b00018"),
  ),
  card(
    "À quoi une forte liaison protéique est-elle généralement associée ?",
    "À une durée d’action plus prolongée.",
    src("b00029"),
  ),
  card(
    "Quel effet clinique accompagne une forte lipophilie ?",
    "Une puissance généralement plus élevée.",
    src("b00030", "b00031"),
  ),
  card(
    "Qu’est-ce que la chiralité ?",
    "L’existence de deux formes tridimensionnelles en miroir.",
    src("b00032", "b00033"),
  ),
  card(
    "Comment nomme-t-on chaque forme chirale ?",
    "Un énantiomère.",
    src("b00033"),
  ),
  card(
    "Quel volume influence l’étendue d’un bloc périnerveux ?",
    "Le volume déposé autour du nerf.",
    src("b00037"),
  ),
  card(
    "Quel paramètre local influence l’intensité du bloc ?",
    "La concentration de l’anesthésique local.",
    src("b00037"),
  ),
  card(
    "Quel ion entrant déclenche le potentiel d’action nerveux ?",
    "Le sodium.",
    src("b00046", "b00047"),
  ),
  card(
    "Le potentiel d’action est-il gradué ?",
    "Non, son déclenchement suit une loi du tout ou rien.",
    src("b00047"),
  ),
  card(
    "Quelle sous-unité assure les fonctions principales du canal sodique ?",
    "La sous-unité alpha.",
    src("b00049"),
  ),
  card(
    "Quel rôle ont les sous-unités bêta du canal sodique ?",
    "Elles modulent son fonctionnement et son expression.",
    src("b00049"),
  ),
  card(
    "Quel mécanisme principal interrompt la conduction nerveuse ?",
    "Le bloc de l’entrée sodique empêche la propagation du potentiel.",
    src("b00054", "b00055"),
  ),
  card(
    "De quel côté du canal agit surtout la forme ionisée ?",
    "Depuis la face intracellulaire.",
    src("b00055", "b00057", "b00061"),
  ),
  card(
    "Pourquoi la forme ionisée prédomine-t-elle dans la fibre ?",
    "Le milieu intracellulaire plus acide déplace l’équilibre vers le cation.",
    src("b00055", "b00056", "b00057"),
  ),
  card(
    "La forme neutre peut-elle aussi contribuer au bloc ?",
    "Oui, en s’accumulant dans la membrane et en déformant le canal.",
    src("b00062", "b00063"),
  ),
  card(
    "Quelles toxines naturelles bloquent puissamment les canaux sodiques ?",
    "Tétrodotoxine, saxitoxine et néosaxitoxine.",
    src("b00064"),
  ),
  card(
    "Quel est le rôle électrique principal de la myéline ?",
    "Isoler la fibre et permettre une conduction saltatoire.",
    src("b00050", "b00051"),
  ),
  card(
    "Où la conduction saute-t-elle dans une fibre myélinisée ?",
    "Entre les nœuds de Ranvier.",
    src("b00051"),
  ),
  card(
    "Quelles fibres sont bloquées plus facilement : petites ou grosses ?",
    "Les petites fibres.",
    src("b00053"),
  ),
  card(
    "Quelles fibres sont plus sensibles : type C ou type A ?",
    "Les fibres C.",
    src("b00053"),
  ),
  card(
    "Qu’est-ce qu’un bloc différentiel ?",
    "Le bloc sélectif de certaines fonctions avant les autres dans un même nerf.",
    src("b00065", "b00066"),
  ),
  card(
    "Quelle fonction est bloquée avant la motricité ?",
    "La douleur, avec la température.",
    src("b00039", "b00066", "b00067"),
  ),
  card(
    "Quelles sensations peuvent persister malgré une analgésie efficace ?",
    "Le toucher et la pression.",
    src("b00067"),
  ),
  card(
    "Qu’est-ce qu’un bloc tonique ?",
    "Le bloc observé lors d’une stimulation nerveuse à basse fréquence.",
    src("b00068", "b00069"),
  ),
  card(
    "Qu’est-ce qu’un bloc phasique ?",
    "L’intensification du bloc lorsque la fréquence de stimulation augmente.",
    src("b00069"),
  ),
  card(
    "Pourquoi une fréquence élevée renforce-t-elle le bloc ?",
    "Elle expose davantage de canaux ouverts ou inactivés au médicament.",
    src("b00069"),
  ),
  card(
    "Pourquoi une dose maximale en mg/kg ne suffit-elle pas à sécuriser ?",
    "Le site et une injection intravasculaire peuvent multiplier le pic sérique.",
    src("b00071"),
  ),
  card(
    "Quels sites donnent les plus hauts pics plasmatiques ?",
    "Les sites les plus vascularisés.",
    src("b00071", "b00125"),
  ),
  card(
    "De combien les concentrations peuvent-elles varier selon le site ?",
    "Du simple au triple, voire davantage, pour une même dose.",
    src("b00071"),
  ),
  card(
    "Quelle cause principale explique une toxicité malgré une dose correcte ?",
    "Une injection intravasculaire accidentelle.",
    src("b00071", "b00076"),
  ),
  card(
    "L’échographie élimine-t-elle le risque de toxicité systémique ?",
    "Non, elle le diminue sans le supprimer.",
    src("b00084"),
  ),
  card(
    "Quels quatre critères pharmacologiques orientent le choix d’un agent ?",
    "Latence, durée, puissance et capacité de bloc différentiel.",
    src("b00073"),
  ),
  card(
    "Quel effet a l’adrénaline sur le bloc moteur ?",
    "Elle peut le majorer en fonction de la concentration locale.",
    src("b00079"),
  ),
  card(
    "Quelle forme de toxicité apparaît souvent en premier ?",
    "La toxicité neurologique centrale.",
    src("b00076", "b00087", "b00160", "b00161"),
  ),
  card(
    "De quoi dépend l’expression de la toxicité neurologique ?",
    "De la concentration sérique et de la vitesse de son augmentation.",
    src("b00087"),
  ),
  card(
    "Quels prodromes sensitifs évoquent une toxicité systémique ?",
    "Paresthésies péribuccales et goût métallique.",
    src("b00087"),
  ),
  card(
    "Quels symptômes auditifs peuvent annoncer la toxicité ?",
    "Des bourdonnements d’oreilles ou acouphènes.",
    src("b00087"),
  ),
  card(
    "Quels signes moteurs précèdent parfois la convulsion ?",
    "Fasciculations et tremblements.",
    src("b00087"),
  ),
  card(
    "Quel événement peut inaugurer une injection intravasculaire massive ?",
    "Une convulsion ou une arythmie grave sans prodrome.",
    src("b00087"),
  ),
  card(
    "Quel est le premier objectif pendant une convulsion toxique ?",
    "Assurer oxygénation et ventilation.",
    src("b00087", "b00092"),
  ),
  card(
    "Quelle classe traite les convulsions d’une TSAL ?",
    "Les benzodiazépines.",
    src("b00087", "b00088"),
  ),
  card(
    "Quelle émulsion faut-il rendre immédiatement disponible ?",
    "Une émulsion lipidique à 20 %.",
    src("b00088", "b00092"),
  ),
  card(
    "Pourquoi administrer précocement des lipides pendant une convulsion ?",
    "Pour réduire la progression vers l’arrêt cardiaque.",
    src("b00092"),
  ),
  card(
    "À quelle concentration la lidocaïne a-t-elle un effet antiarythmique ?",
    "Environ 1 à 5 µg/mL.",
    src("b00087"),
  ),
  card(
    "Vers quelle concentration la lidocaïne devient-elle neurotoxique ?",
    "Environ 12 µg/mL.",
    src("b00094", "b00095"),
  ),
  card(
    "Vers quelle concentration la lidocaïne déprime-t-elle le cœur ?",
    "Environ 22 µg/mL.",
    src("b00094", "b00095"),
  ),
  card(
    "Quelle est la marge toxique de la bupivacaïne ?",
    "Environ 4 µg/mL neurologiques et 6 µg/mL myocardiques.",
    src("b00094"),
  ),
  card(
    "Pourquoi la cardiotoxicité de la bupivacaïne est-elle redoutable ?",
    "La marge neuro-cardiaque est étroite et le collapsus peut être profond.",
    src("b00094", "b00164"),
  ),
  card(
    "Quels facteurs aggravent la toxicité cardiovasculaire ?",
    "L’hypoxémie et l’acidose.",
    src("b00094", "b00162", "b00163"),
  ),
  card(
    "Quel antiarythmique privilégier lors d’une TSAL ?",
    "L’amiodarone pour une arythmie ventriculaire.",
    src("b00088"),
  ),
  card(
    "Pourquoi réduire les doses d’adrénaline pendant la réanimation ?",
    "Les fortes doses peuvent aggraver l’arythmie et la toxicité myocardique.",
    src("b00088"),
  ),
  card(
    "Combien de temps surveiller une TSAL cardiovasculaire stabilisée ?",
    "Au moins 12 heures dans une zone monitorée.",
    src("b00088"),
  ),
  card(
    "Quelle complication rechercher après une forte charge lipidique ?",
    "Une pancréatite.",
    src("b00088"),
  ),
  card(
    "Quel métabolite explique l’allergie aux esters ?",
    "L’acide para-amino-benzoïque, ou PABA.",
    src("b00098"),
  ),
  card(
    "Quel conservateur peut être métabolisé en PABA ?",
    "Le méthylparaben.",
    src("b00098"),
  ),
  card(
    "Les allergies sévères aux amides sont-elles fréquentes ?",
    "Non, elles sont beaucoup plus rares que celles aux esters.",
    src("b00098"),
  ),
  card(
    "Quels diagnostics miment souvent une allergie à un anesthésique local ?",
    "Choc vagal ou réaction à l’adrénaline intravasculaire.",
    src("b00098", "b00099"),
  ),
  card(
    "Quel agent topique ne devrait plus être utilisé pour sa toxicité ?",
    "La benzocaïne.",
    src("b00101"),
  ),
  card(
    "Quel anesthésique local peut provoquer une méthémoglobinémie ?",
    "La prilocaïne, surtout sous forme topique.",
    src("b00101"),
  ),
  card(
    "Quelle discordance évoque une méthémoglobinémie ?",
    "SpO2 < 90 % avec PaO2 > 70 mmHg.",
    src("b00101"),
  ),
  card(
    "Quel examen confirme la méthémoglobinémie ?",
    "La CO-oxymétrie.",
    src("b00101"),
  ),
  card(
    "Un déficit nerveux après bloc est-il d’emblée attribué au médicament ?",
    "Non, c’est un diagnostic d’exclusion.",
    src("b00103"),
  ),
  card(
    "Quelles causes rechercher devant un déficit après bloc ?",
    "Chirurgie, obstétrique, injection intraneurale, additifs et terrain.",
    src("b00103"),
  ),
  card(
    "Quel syndrome transitoire suit surtout la lidocaïne intrathécale ?",
    "L’irritation radiculaire transitoire.",
    src("b00104"),
  ),
  card(
    "Quels symptômes définissent l’irritation radiculaire transitoire ?",
    "Dysesthésies, brûlures et élancements des membres inférieurs.",
    src("b00104"),
  ),
  card(
    "Quelle manifestation clinique illustre la myotoxicité ?",
    "Une dysfonction périorbitaire après bloc rétrobulbaire.",
    src("b00106"),
  ),
  card(
    "Quel anesthésique local est le plus myotoxique cité ?",
    "La bupivacaïne.",
    src("b00106"),
  ),
  card(
    "Quel adjuvant augmente la myotoxicité de la lidocaïne ?",
    "L’adrénaline.",
    src("b00106"),
  ),
  card(
    "Pourquoi réduire la dose chez le sujet âgé ?",
    "Élimination ralentie, sensibilité nerveuse et diffusion neuraxiale accrues.",
    src("b00111"),
  ),
  card(
    "Pourquoi réduire la dose pendant la grossesse ?",
    "Sensibilité nerveuse accrue et fraction libre plasmatique plus élevée.",
    src("b00113"),
  ),
  card(
    "Quelle concentration de bupivacaïne est interdite en péridurale obstétricale ?",
    "La solution à 0,75 %.",
    src("b00113", "b00114"),
  ),
  card(
    "Pourquoi l’insuffisance hépatique augmente-t-elle le risque des amides ?",
    "Elle ralentit leur métabolisme et l’hypoprotéinémie augmente la fraction libre.",
    src("b00116"),
  ),
  card(
    "Pourquoi l’insuffisance cardiaque ralentit-elle les amides ?",
    "Le bas débit réduit la perfusion hépatique.",
    src("b00117"),
  ),
  card(
    "Quelle adaptation est proposée en insuffisance rénale ?",
    "Réduire la dose habituelle de 10 à 20 %.",
    src("b00118"),
  ),
  card(
    "Quel type d’anesthésique éviter avec pseudo-cholinestérase absente ?",
    "De fortes doses d’un ester.",
    src("b00119", "b00120", "b00121"),
  ),
  card(
    "Quel effet vasculaire de l’adrénaline prolonge un bloc ?",
    "La vasoconstriction ralentit l’absorption systémique.",
    src("b00139", "b00140"),
  ),
  card(
    "Quelle concentration d’adrénaline est couramment ajoutée ?",
    "Environ 1:200 000.",
    src("b00139"),
  ),
  card(
    "Quels opioïdes sont couramment associés aux anesthésiques locaux ?",
    "Morphine et fentanyl.",
    src("b00138", "b00142"),
  ),
  card(
    "Quel agoniste alpha-2 est cité comme adjuvant ?",
    "La clonidine, et parfois la dexmédétomidine.",
    src("b00138", "b00142"),
  ),
  card(
    "Pourquoi mélange-t-on parfois deux anesthésiques locaux ?",
    "Pour rechercher un début rapide et une durée prolongée.",
    src("b00143", "b00144"),
  ),
  card(
    "Comment se combine la toxicité de deux anesthésiques locaux ?",
    "Elle est additive : les fractions de doses maximales s’additionnent.",
    src("b00144"),
  ),
  card(
    "Quelle voie utilise le bloc de Bier ?",
    "Une injection intraveineuse régionale sous tourniquet.",
    src("b00145"),
  ),
  card(
    "Quel rôle périopératoire a la lidocaïne intraveineuse ?",
    "Elle complète l’analgésie et atténue certains réflexes bronchiques.",
    src("b00145", "b00146", "b00147"),
  ),
  card(
    "Pourquoi la peau intacte limite-t-elle l’anesthésie topique ?",
    "Elle constitue une barrière d’absorption importante.",
    src("b00148", "b00149"),
  ),
  card(
    "Les muqueuses freinent-elles fortement la pénétration ?",
    "Non, elles offrent une barrière faible.",
    src("b00149"),
  ),
  card(
    "Quelles formes servent aux douleurs chroniques cutanées ?",
    "Un timbre de lidocaïne ou un onguent à 10 %.",
    src("b00150"),
  ),
  card(
    "Quelle durée visent les formulations à libération prolongée ?",
    "Environ 72 à 96 heures.",
    src("b00152"),
  ),
  card(
    "Quels véhicules prolongent le relargage ?",
    "Des liposomes ou des polymères biologiques.",
    src("b00152"),
  ),
  card(
    "Quelles limites freinent les formulations prolongées ?",
    "La toxicité du véhicule et le manque de spécificité pour le site d’action.",
    src("b00153"),
  ),
];

const QCM_SERIES = [
  {
    label: "QCM — Série 1 · Structure et métabolisme",
    allowed_voies: ["interne"],
    questions: [
      qcm(
        "Quelles propriétés appartiennent à l’architecture générale d’un anesthésique local ?",
        src("b00008", "b00009"),
        "Les trois modules apportent lipophilie, identité ester ou amide et possibilité d’ionisation en milieu aqueux.",
        [
          [
            true,
            "Un noyau aromatique participe au caractère lipophile.",
            "Cette portion favorise les interactions avec les membranes nerveuses.",
          ],
          [
            true,
            "La chaîne intermédiaire comporte une liaison ester ou amide.",
            "Sa nature définit les deux grandes familles métaboliques.",
          ],
          [
            true,
            "Une amine tertiaire peut accepter un proton.",
            "Elle permet l’équilibre entre forme neutre et forme cationique.",
          ],
          [
            true,
            "La molécule associe un pôle lipophile et un pôle ionisable hydrophile.",
            "Cette architecture amphiphile permet successivement diffusion membranaire et interaction avec le canal.",
          ],
          [
            true,
            "La chaîne intermédiaire relie le noyau aromatique à l’amine.",
            "Elle organise les deux pôles fonctionnels au sein d’une même molécule.",
          ],
        ],
      ),
      qcm(
        "Comment comparer métabolisme des esters et des amides ?",
        src("b00011", "b00035"),
        "Les esters dépendent du plasma et peuvent produire du PABA ; les amides dépendent surtout du foie et du cytochrome P450.",
        [
          [
            true,
            "Les pseudocholinestérases plasmatiques hydrolysent les anesthésiques locaux de type ester.",
            "Cette voie distingue notamment la procaïne des amides.",
          ],
          [
            false,
            "Les esters sont éliminés intacts exclusivement par le rein.",
            "Une hydrolyse plasmatique précède l’élimination de leurs métabolites.",
          ],
          [
            true,
            "Les anesthésiques locaux de type amide subissent principalement un métabolisme hépatique.",
            "Les enzymes hépatiques, dont les CYP, participent à leur transformation.",
          ],
          [
            true,
            "Une insuffisance hépatique sévère favorise l’accumulation des amides lors d’administrations répétées.",
            "La réduction de clairance devient importante avec des bolus répétés ou une perfusion.",
          ],
          [
            true,
            "Les métabolites issus de l’hydrolyse des esters peuvent ensuite être éliminés par le rein.",
            "Élimination rénale et hydrolyse plasmatique correspondent à deux étapes successives.",
          ],
        ],
      ),
      qcm(
        "Quelles affirmations décrivent correctement la chiralité ?",
        src("b00032", "b00033"),
        "Deux énantiomères partagent une formule mais diffèrent dans l’espace, ce qui peut modifier leurs interactions biologiques.",
        [
          [
            true,
            "Deux énantiomères sont des images en miroir non superposables.",
            "Cette relation spatiale définit l’énantiomérie.",
          ],
          [
            true,
            "La configuration tridimensionnelle peut modifier la toxicité.",
            "Les cibles biologiques peuvent distinguer les deux orientations.",
          ],
          [
            false,
            "Deux énantiomères possèdent nécessairement des masses moléculaires différentes.",
            "Ils ont la même composition chimique et donc la même masse.",
          ],
          [
            false,
            "La chiralité convertit une liaison ester en liaison amide.",
            "Elle modifie l’arrangement spatial sans changer la nature de la liaison intermédiaire.",
          ],
          [
            true,
            "La lévobupivacaïne illustre la sélection d’un énantiomère.",
            "Cette formulation exploite une configuration stéréochimique déterminée.",
          ],
        ],
      ),
      qcm(
        "Quels éléments ont accompagné le développement moderne de l’anesthésie locorégionale ?",
        src("b00003", "b00004", "b00005"),
        "Les progrès pharmacologiques, matériels et échographiques ont ensemble élargi la précision et la sécurité des blocs.",
        [
          [
            true,
            "La synthèse de la lidocaïne a fourni un amide clinique.",
            "Elle a ouvert une famille moins allergisante que les esters.",
          ],
          [
            true,
            "Le matériel d’administration s’est spécialisé.",
            "Aiguilles et cathéters conditionnent la précision du dépôt.",
          ],
          [
            true,
            "L’échographie a amélioré le guidage.",
            "Elle permet de visualiser structures et diffusion.",
          ],
          [
            true,
            "La neurostimulation a contribué à localiser les nerfs avant l’injection.",
            "Cette technique a amélioré la précision des blocs avant et parallèlement à l’essor de l’échographie.",
          ],
          [
            true,
            "La recherche de molécules moins allergisantes a favorisé les amides.",
            "L’allergie aux esters a motivé cette évolution.",
          ],
        ],
      ),
      qcm(
        "Quelles conséquences cliniques découlent surtout des propriétés physicochimiques ?",
        src("b00011", "b00017", "b00029", "b00031"),
        "pKa, liaison protéique et lipophilie influencent respectivement latence, durée et puissance, sans relation absolument exclusive.",
        [
          [
            false,
            "La famille ester ou amide fixe à elle seule la durée du bloc, indépendamment de la molécule.",
            "La durée dépend notamment de la liaison protéique et de la pharmacocinétique propre à l’agent.",
          ],
          [
            false,
            "Le pKa suffit à déterminer la dose maximale sûre chez tous les patients.",
            "La sécurité dépend aussi du site, de la vascularisation, de l’agent et du terrain.",
          ],
          [
            true,
            "Une forte liaison protéique est généralement associée à une durée d’action prolongée.",
            "La rétention tissulaire près de la cible ralentit la disparition de l’effet.",
          ],
          [
            true,
            "Une lipophilie élevée est généralement associée à une plus grande puissance.",
            "La pénétration membranaire facilite l’accès au canal sodique.",
          ],
          [
            false,
            "Ces relations physicochimiques prédisent sans exception le comportement clinique de chaque molécule.",
            "Structure et pharmacocinétique introduisent des exceptions aux corrélations générales.",
          ],
        ],
      ),
    ],
  },
  {
    label: "QCM — Série 2 · Ionisation et pH",
    allowed_voies: ["interne"],
    questions: [
      qcm(
        "Comment interpréter le pKa d’un anesthésique local base faible ?",
        src("b00016", "b00017", "b00020"),
        "Au pH égal au pKa, les deux formes sont équimolaires ; l’écart pH-pKa détermine le rapport par Henderson-Hasselbalch.",
        [
          [
            true,
            "À pH égal au pKa, forme neutre et cationique sont égales.",
            "Il s’agit de la définition physicochimique du pKa.",
          ],
          [
            true,
            "Un pH inférieur au pKa favorise la forme protonée.",
            "Une base faible capte davantage de protons en milieu acide.",
          ],
          [
            true,
            "Un pH supérieur au pKa augmente la proportion de forme neutre.",
            "La déprotonation de la base faible devient plus favorable quand le milieu est moins acide.",
          ],
          [
            true,
            "Le rapport des formes dépend du pH du milieu.",
            "L’équilibre change entre solution, tissu et cytoplasme.",
          ],
          [
            true,
            "L’équation de Henderson-Hasselbalch quantifie le rapport entre formes neutre et ionisée.",
            "Elle relie ce rapport au pH du milieu et au pKa de la molécule.",
          ],
        ],
      ),
      qcm(
        "Quelles étapes permettent au médicament de bloquer le canal sodique ?",
        src("b00054", "b00055", "b00056", "b00057", "b00061"),
        "La base neutre franchit les enveloppes, se reprotonne dans la fibre et le cation atteint le site intracellulaire du canal.",
        [
          [
            false,
            "La forme neutre bloque exclusivement le canal depuis la face extracellulaire.",
            "Elle diffuse à travers la membrane, puis la forme cationique agit principalement depuis l’intérieur.",
          ],
          [
            false,
            "Le cation traverse directement la bicouche sans limitation.",
            "La charge hydrophile freine fortement ce passage.",
          ],
          [
            true,
            "Le milieu intracellulaire favorise une nouvelle ionisation.",
            "Son acidité relative augmente la forme BH+.",
          ],
          [
            true,
            "La fraction non ionisée diffuse à travers la membrane axonale",
            "Sa liposolubilité rend possible ce trajet.",
          ],
          [
            true,
            "Le canal bloqué ne peut plus soutenir la propagation.",
            "L’entrée sodique devient insuffisante pour atteindre le seuil.",
          ],
        ],
      ),
      qcm(
        "Pourquoi l’anesthésie d’une zone infectée peut-elle échouer ?",
        src("b00023", "b00024", "b00025", "b00026"),
        "L’acidose locale piège le médicament sous forme chargée, réduit son entrée dans la fibre et diminue le bloc sodique.",
        [
          [
            false,
            "L’infection rend les canaux sodiques définitivement insensibles à tout anesthésique local.",
            "L’échec vient surtout de la diffusion insuffisante de la base faible, pas d’une transformation irréversible du canal.",
          ],
          [
            false,
            "La forme cationique BH+ traverse plus facilement la membrane lipidique que la forme neutre.",
            "C’est principalement la forme non ionisée qui franchit la membrane nerveuse.",
          ],
          [
            false,
            "L’infection transforme localement un anesthésique amide en ester.",
            "Le pH tissulaire modifie l’ionisation, pas la famille chimique de la molécule.",
          ],
          [
            true,
            "Le pH tissulaire bas diminue la fraction neutre capable de franchir la membrane.",
            "L’équilibre se déplace vers la forme ionisée, ce qui réduit l’accès à la face intracellulaire du canal.",
          ],
          [
            false,
            "Une augmentation arbitraire de dose restaure l’efficacité sans accroître le risque systémique.",
            "L’escalade peut surtout augmenter l’exposition plasmatique et la toxicité.",
          ],
        ],
      ),
      qcm(
        "Que signifie une variation d’une unité dans l’équation de Henderson-Hasselbalch ?",
        src("b00020", "b00021", "b00022", "b00023"),
        "L’échelle logarithmique fait varier d’un facteur dix le rapport entre formes neutre et ionisée.",
        [
          [
            true,
            "Le rapport des deux formes est multiplié ou divisé par dix.",
            "Le logarithme décimal convertit une unité en facteur dix.",
          ],
          [
            false,
            "La concentration totale devient toujours dix fois supérieure.",
            "C’est le rapport, non la quantité injectée, qui change.",
          ],
          [
            false,
            "Le pKa de la molécule est définitivement modifié.",
            "Le pKa reste une propriété de l’agent.",
          ],
          [
            true,
            "Une petite variation de pH peut changer fortement la diffusion.",
            "La fraction neutre répond de façon non linéaire.",
          ],
          [
            true,
            "Un écart d’une unité correspond approximativement à une répartition 90/10 des deux formes.",
            "Un rapport de dix pour un résulte de cette différence logarithmique.",
          ],
        ],
      ),
      qcm(
        "Quelles relations entre forme chimique et fonction sont exactes ?",
        src("b00017", "b00019", "b00055", "b00062"),
        "Les deux formes sont nécessaires : la neutre assure l’accès, le cation produit le bloc, avec une contribution hydrophobe secondaire.",
        [
          [
            true,
            "La forme base est liposoluble.",
            "Elle franchit les structures riches en lipides.",
          ],
          [
            true,
            "La forme cationique est hydrosoluble.",
            "Sa charge facilite sa présence dans les milieux aqueux.",
          ],
          [
            true,
            "La forme cationique bloque le canal depuis l’intérieur.",
            "Elle se loge dans la voie de conduction sodique.",
          ],
          [
            true,
            "La forme neutre peut déformer le canal depuis la membrane.",
            "Cette voie existe mais reste secondaire.",
          ],
          [
            true,
            "La forme neutre traverse plus facilement la bicouche lipidique.",
            "Son absence de charge facilite la diffusion membranaire avant la réionisation intracellulaire.",
          ],
        ],
      ),
    ],
  },
  {
    label: "QCM — Série 3 · Potentiel d’action et fibres",
    allowed_voies: ["interne"],
    questions: [
      qcm(
        "Quelles étapes caractérisent un potentiel d’action nerveux ?",
        src("b00045", "b00046", "b00047"),
        "Le gradient ionique crée le repos, l’entrée sodique franchit le seuil puis l’ouverture séquentielle propage un signal tout ou rien.",
        [
          [
            false,
            "Le potentiel de repos devient positif par entrée massive de potassium.",
            "Le gradient potassique contribue au potentiel négatif de repos.",
          ],
          [
            false,
            "La dépolarisation rapide dépend principalement de l’ouverture des canaux chlorure.",
            "Elle repose surtout sur l’entrée de sodium par les canaux voltage-dépendants.",
          ],
          [
            false,
            "La repolarisation exige le maintien permanent des canaux sodiques en position ouverte.",
            "L’inactivation sodique et les courants potassiques permettent le retour vers le repos.",
          ],
          [
            false,
            "L’amplitude augmente proportionnellement à chaque milligramme injecté.",
            "Le potentiel individuel répond à une loi du tout ou rien.",
          ],
          [
            true,
            "Les canaux voisins assurent la propagation.",
            "La dépolarisation locale recrute les segments adjacents.",
          ],
        ],
      ),
      qcm(
        "Quelles propriétés appartiennent aux canaux sodiques nerveux ?",
        src("b00048", "b00049", "b00054"),
        "La protéine transmembranaire porte une sous-unité alpha fonctionnelle et des sous-unités bêta modulatrices, cible du bloc local.",
        [
          [
            false,
            "Ils sont situés uniquement dans le noyau de Schwann",
            "Ce sont des protéines de membrane axonale.",
          ],
          [
            false,
            "Les sous-unités bêta constituent seules le pore.",
            "Elles modulent surtout expression et fonctionnement.",
          ],
          [
            true,
            "Leur ouverture permet l’entrée de sodium.",
            "Ce courant dépolarise la membrane nerveuse.",
          ],
          [
            true,
            "Le bloc d’un nombre suffisant empêche la propagation.",
            "Le seuil ne peut plus être atteint en aval.",
          ],
          [
            true,
            "La sous-unité alpha assure les fonctions principales",
            "Elle forme notamment la voie de passage ionique.",
          ],
        ],
      ),
      qcm(
        "Comment la myéline modifie-t-elle conduction et bloc ?",
        src("b00050", "b00051", "b00052", "b00053"),
        "La myéline isole l’axone et concentre la conduction aux nœuds ; un segment suffisant doit être exposé pour interrompre les sauts.",
        [
          [
            true,
            "Les cellules de Schwann participent à la myélinisation périphérique.",
            "Elles entourent et isolent électriquement l’axone.",
          ],
          [
            true,
            "La conduction devient saltatoire.",
            "Le potentiel est régénéré aux nœuds de Ranvier.",
          ],
          [
            false,
            "Une seule molécule bloquant un nœud arrête toujours tout nerf.",
            "Plusieurs nœuds successifs doivent devenir inefficaces.",
          ],
          [
            true,
            "Les fibres non myélinisées conduisent de manière continue.",
            "Le signal progresse le long de la membrane exposée.",
          ],
          [
            true,
            "Le diamètre intervient dans la sensibilité au bloc.",
            "Les petites fibres sont généralement atteintes plus facilement.",
          ],
        ],
      ),
      qcm(
        "Quel ordre fonctionnel traduit un bloc différentiel ?",
        src("b00038", "b00039", "b00053", "b00065", "b00066", "b00067"),
        "Douleur et température disparaissent avant toucher, pression, proprioception et motricité, selon fibres et concentration.",
        [
          [
            false,
            "La douleur disparaît seulement après l’abolition complète de la motricité.",
            "Les fibres nociceptives sont généralement bloquées avant les grosses fibres motrices.",
          ],
          [
            true,
            "La motricité nécessite généralement un bloc plus intense.",
            "Les grosses fibres A-alpha sont relativement résistantes.",
          ],
          [
            false,
            "Toutes les fonctions disparaissent exactement au même moment.",
            "Un nerf contient des fibres hétérogènes.",
          ],
          [
            false,
            "La récupération suit toujours strictement l’ordre inverse.",
            "Certains agents longs peuvent modifier cette séquence.",
          ],
          [
            true,
            "Le phénomène est utile en analgésie postopératoire.",
            "Il permet de préserver davantage la motricité et le toucher.",
          ],
        ],
      ),
      qcm(
        "Quelles affirmations distinguent bloc tonique et bloc phasique ?",
        src("b00068", "b00069"),
        "Le bloc phasique dépend de l’usage : la fréquence élevée expose plus souvent les états canalaires auxquels le médicament se lie.",
        [
          [
            true,
            "Le bloc tonique est évalué à basse fréquence.",
            "Les canaux sont moins souvent recrutés par la stimulation.",
          ],
          [
            false,
            "Le bloc tonique exige une stimulation tétanique répétée pour apparaître.",
            "Il s’évalue à basse fréquence et reflète le bloc présent au repos.",
          ],
          [
            false,
            "Le bloc phasique apparaît uniquement après l’élimination complète du médicament.",
            "Il s’accentue au contraire pendant les activations répétées du canal.",
          ],
          [
            false,
            "Le bloc phasique exige une destruction anatomique du nerf.",
            "Il s’agit d’un phénomène pharmacologique réversible.",
          ],
          [
            false,
            "La fréquence n’a aucun effet sur un canal bloqué.",
            "L’état du canal change avec l’activité.",
          ],
        ],
      ),
    ],
  },
  {
    label: "QCM — Série 4 · Choix de l’agent et de la dose",
    allowed_voies: ["interne"],
    questions: [
      qcm(
        "Quels paramètres doivent précéder toute décision de dose ?",
        src("b00070", "b00071", "b00073"),
        "La prescription associe propriétés de l’agent, état du patient, vascularisation du site, technique et durée clinique attendue.",
        [
          [
            true,
            "La vascularisation du site d’injection.",
            "Elle gouverne largement la vitesse d’absorption systémique.",
          ],
          [
            true,
            "La présence éventuelle d’un cathéter.",
            "Une perfusion continue modifie la charge cumulée.",
          ],
          [
            true,
            "La durée opératoire et l’analgésie postopératoire.",
            "Elles orientent agent court, long ou technique prolongée.",
          ],
          [
            true,
            "La dose cumulée déjà administrée doit être intégrée au calcul.",
            "Les bolus antérieurs et les apports par cathéter contribuent à la toxicité totale.",
          ],
          [
            true,
            "La toxicité propre à la molécule.",
            "Les agents puissants n’ont pas la même marge de sécurité.",
          ],
        ],
      ),
      qcm(
        "Pourquoi deux blocs réalisés avec la même dose donnent-ils des pics différents ?",
        src("b00071", "b00124", "b00125", "b00126"),
        "Le débit sanguin local détermine la vitesse de transfert vers le plasma ; un site vascularisé crée un pic plus haut.",
        [
          [
            true,
            "La vascularisation locale varie entre les sites.",
            "Le lit intercostal absorbe davantage qu’une infiltration sous-cutanée.",
          ],
          [
            false,
            "La structure chimique de la dose change selon l’aiguille.",
            "Le médicament reste identique après injection.",
          ],
          [
            true,
            "La concentration plasmatique peut varier du simple au triple.",
            "L’écart observé dépasse largement une variation mineure.",
          ],
          [
            false,
            "Une aspiration négative garantit toujours l’absence d’injection vasculaire.",
            "La position peut changer et l’aspiration manquer de sensibilité.",
          ],
          [
            true,
            "L’adrénaline peut ralentir le passage systémique.",
            "La vasoconstriction locale réduit l’absorption.",
          ],
        ],
      ),
      qcm(
        "Quelles mesures réduisent le risque d’injection intravasculaire ?",
        src("b00075", "b00076", "b00084", "b00088"),
        "Aucune mesure n’est parfaite ; l’association repérage, aspiration, fractionnement et surveillance rend l’événement moins probable ou plus précoce.",
        [
          [
            true,
            "Visualiser l’environnement par échographie.",
            "Le guidage améliore le placement mais n’annule pas le risque.",
          ],
          [
            true,
            "Aspirer avant et entre les fractions.",
            "Un retour sanguin peut révéler une position intravasculaire.",
          ],
          [
            true,
            "Fractionner la dose en observant le patient.",
            "Une petite fraction toxique est détectable avant toute la charge.",
          ],
          [
            false,
            "Injecter toute la dose en un bolus rapide.",
            "Cette pratique aggrave la brutalité d’une erreur vasculaire.",
          ],
          [
            true,
            "Maintenir le monitorage cardiorespiratoire.",
            "Les premiers signes peuvent apparaître pendant l’injection.",
          ],
        ],
      ),
      qcm(
        "Quels compromis orientent le choix pour une intervention de trois heures ?",
        src("b00128", "b00129"),
        "Une injection unique d’agent long simplifie la technique mais augmente la toxicité ; un cathéter court est titrable mais demande surveillance.",
        [
          [
            true,
            "Un agent à longue durée peut couvrir le geste en une injection.",
            "Cette option évite un dispositif continu.",
          ],
          [
            true,
            "Un agent court peut être perfusé par cathéter.",
            "La dose devient ajustable au déroulement.",
          ],
          [
            false,
            "Une dose maximale doublée d’agent long est sans conséquence.",
            "La toxicité augmente avec la charge absorbée.",
          ],
          [
            true,
            "La stratégie postopératoire intervient dans le choix.",
            "Un cathéter peut prolonger l’analgésie après l’acte.",
          ],
          [
            false,
            "La durée prévue est sans rapport avec la molécule.",
            "Latence et durée sont des critères essentiels.",
          ],
        ],
      ),
      qcm(
        "Comment raisonner lors d’un mélange de deux anesthésiques locaux ?",
        src("b00143", "b00144"),
        "L’objectif cinétique ne transforme pas les plafonds : les fractions des doses maximales de chaque agent s’additionnent.",
        [
          [
            true,
            "La toxicité systémique des deux agents est additive.",
            "Ils convergent sur des cibles neurologiques et cardiaques communes.",
          ],
          [
            false,
            "Chaque molécule conserve une dose maximale indépendante entière.",
            "Deux plafonds complets exposeraient à une surcharge totale.",
          ],
          [
            true,
            "Un demi-plafond de chaque agent consomme toute la marge combinée.",
            "Les deux fractions 0,5 s’additionnent à 1.",
          ],
          [
            false,
            "Le mélange garantit un début aussi rapide que le plus court.",
            "Le profil peut devenir simplement intermédiaire.",
          ],
          [
            false,
            "L’association supprime le besoin de surveiller.",
            "La complexité augmente au contraire le suivi nécessaire.",
          ],
        ],
      ),
    ],
  },
  {
    label: "QCM — Série 5 · Toxicité neurologique",
    allowed_voies: ["interne"],
    questions: [
      qcm(
        "Quels signes constituent des prodromes classiques de TSAL ?",
        src("b00086", "b00087"),
        "Les symptômes sensitifs et sensoriels précèdent souvent agitation, tremblements et convulsion lorsque la concentration monte progressivement.",
        [
          [
            true,
            "Des paresthésies autour de la bouche.",
            "Ce signe subjectif apparaît à faible concentration de lidocaïne.",
          ],
          [
            true,
            "Un goût métallique inhabituel.",
            "Il accompagne fréquemment les premiers symptômes centraux.",
          ],
          [
            true,
            "Des bourdonnements d’oreilles.",
            "L’atteinte sensorielle progresse avec le taux sérique.",
          ],
          [
            true,
            "Un discours ralenti ou mal articulé.",
            "La dysarthrie signale une dépression neurologique croissante.",
          ],
          [
            true,
            "Une sensation vertigineuse nouvelle peut précéder une TSAL plus sévère.",
            "Cette manifestation centrale peut accompagner les autres prodromes sensoriels.",
          ],
        ],
      ),
      qcm(
        "Quelles évolutions annoncent une toxicité neurologique sévère ?",
        src("b00087", "b00092"),
        "Agitation et phénomènes moteurs peuvent évoluer vers une crise généralisée, dont le danger majeur est l’hypoxie secondaire.",
        [
          [
            false,
            "Une somnolence isolée garantit l’absence de progression neurologique.",
            "La baisse de vigilance peut précéder hypoventilation ou convulsion et impose une surveillance.",
          ],
          [
            true,
            "Des tremblements progressifs.",
            "Ils se situent dans l’escalade motrice toxique.",
          ],
          [
            false,
            "Une amélioration de l’élocution.",
            "La récupération verbale n’annonce pas une aggravation.",
          ],
          [
            true,
            "Une convulsion généralisée.",
            "Elle représente un stade neurologique grave.",
          ],
          [
            true,
            "Une hypoventilation avec hypoxémie.",
            "Elle constitue la principale cause de séquelles pendant la convulsion.",
          ],
        ],
      ),
      qcm(
        "Pourquoi une injection vasculaire peut-elle se présenter sans prodrome ?",
        src("b00076", "b00084", "b00087"),
        "Une concentration très élevée atteinte en quelques secondes franchit directement les seuils convulsif ou cardiaque.",
        [
          [
            true,
            "La vitesse d’augmentation compte autant que la concentration finale.",
            "Le cerveau ne traverse pas les étapes lentes habituelles.",
          ],
          [
            false,
            "Le médicament devient chimiquement inactif dans le sang.",
            "Il atteint au contraire rapidement cerveau et cœur.",
          ],
          [
            true,
            "Une convulsion peut être la première manifestation.",
            "Le seuil critique est franchi avant que le patient verbalise.",
          ],
          [
            true,
            "Une arythmie grave peut inaugurer le tableau.",
            "Le myocarde reçoit simultanément une forte charge.",
          ],
          [
            true,
            "Un collapsus cardiovasculaire peut survenir immédiatement après un passage vasculaire.",
            "Une élévation très rapide de concentration peut court-circuiter les signes neurologiques annonciateurs.",
          ],
        ],
      ),
      qcm(
        "Quelles mesures traiteront une convulsion due aux anesthésiques locaux ?",
        src("b00087", "b00088", "b00092"),
        "La priorité est l’oxygénation avec ventilation, suivie d’une benzodiazépine et d’une émulsion lipidique si la forme est sévère.",
        [
          [
            true,
            "Arrêter immédiatement l’injection.",
            "La poursuite augmenterait encore la concentration cérébrale.",
          ],
          [
            true,
            "Administrer de l’oxygène à 100 %.",
            "La prévention de l’hypoxie protège le cerveau et le cœur.",
          ],
          [
            true,
            "Contrôler la ventilation pour éviter l’acidose.",
            "L’hypercapnie et l’acidémie majorent la toxicité.",
          ],
          [
            true,
            "Utiliser une benzodiazépine anticonvulsivante.",
            "Cette classe est recommandée pour interrompre la crise.",
          ],
          [
            false,
            "Attendre spontanément sans monitorage cardiaque.",
            "La convulsion peut évoluer vers un arrêt.",
          ],
        ],
      ),
      qcm(
        "Quelles concentrations illustrent la progression toxique de la lidocaïne ?",
        src("b00087", "b00094", "b00095"),
        "La fenêtre antiarythmique est basse, les signes neurologiques augmentent vers 12 µg/mL et la dépression cardiovasculaire vers 22 µg/mL.",
        [
          [
            true,
            "Une concentration de 1 à 5 µg/mL est antiarythmique.",
            "Des prodromes subjectifs peuvent déjà exister chez un patient non sédaté.",
          ],
          [
            false,
            "La cardiotoxicité apparaît toujours avant les signes cérébraux.",
            "Avec la lidocaïne, le seuil cardiaque est nettement plus élevé.",
          ],
          [
            true,
            "Les convulsions se situent autour du seuil neurologique élevé.",
            "Le graphique place ce stade vers une dizaine de µg/mL.",
          ],
          [
            true,
            "La dépression cardiovasculaire survient vers 22 µg/mL.",
            "Ce niveau dépasse largement le seuil neurologique.",
          ],
          [
            true,
            "Une dysarthrie et des acouphènes peuvent précéder le seuil convulsif.",
            "Ces signes traduisent une concentration neurotoxique croissante avant la convulsion.",
          ],
        ],
      ),
    ],
  },
  {
    label: "QCM — Série 6 · Toxicité cardiovasculaire et lipides",
    allowed_voies: ["interne"],
    questions: [
      qcm(
        "Pourquoi la bupivacaïne racémique est-elle particulièrement cardiotoxique ?",
        src("b00094", "b00164"),
        "Sa forte puissance, sa cinétique de dissociation lente et l’étroite marge neuro-cardiaque rendent le collapsus profond et difficile à traiter.",
        [
          [
            true,
            "Elle peut rester séquestrée dans les fibres conductrices.",
            "Le profil fast-in slow-out prolonge le bloc des canaux.",
          ],
          [
            true,
            "Elle déprime directement la contractilité myocardique.",
            "L’inotropisme négatif participe au collapsus.",
          ],
          [
            true,
            "Elle peut provoquer des arythmies sévères.",
            "La conduction cardiaque est fortement perturbée.",
          ],
          [
            true,
            "Sa dissociation lente des canaux sodiques cardiaques prolonge les troubles de conduction.",
            "Le profil fast-in slow-out entretient le bloc pendant les fréquences cardiaques élevées.",
          ],
          [
            true,
            "La grossesse augmente la vulnérabilité.",
            "Les femmes enceintes sont particulièrement sensibles à cet agent.",
          ],
        ],
      ),
      qcm(
        "Quelles actions appartiennent à la prise en charge initiale d’une TSAL sévère ?",
        src("b00088", "b00162", "b00163"),
        "L’arrêt de l’exposition et le contrôle immédiat de l’oxygénation limitent l’aggravation avant la thérapeutique lipidique et circulatoire.",
        [
          [
            true,
            "Cesser toute injection d’anesthésique local.",
            "La source du toxique doit être interrompue.",
          ],
          [
            true,
            "Appeler précocement une aide de réanimation.",
            "Une équipe complète est requise pour une évolution rapide.",
          ],
          [
            false,
            "Laisser le patient hypoventiler pour éviter l’alcalose.",
            "Hypoxie et acidose aggravent la cardiotoxicité.",
          ],
          [
            true,
            "Assurer oxygénation et ventilation efficaces.",
            "Cette correction protège aussi le traitement antiarythmique.",
          ],
          [
            true,
            "Préparer l’émulsion lipidique 20 %.",
            "Elle doit être accessible avant la réalisation du bloc.",
          ],
        ],
      ),
      qcm(
        "Quelles adaptations distinguent la réanimation d’une TSAL ?",
        src("b00088", "b00094"),
        "Le traitement reste cardiopulmonaire mais privilégie petites doses d’adrénaline, amiodarone et émulsion lipidique, avec effort prolongé.",
        [
          [
            true,
            "Employer des doses réduites d’adrénaline.",
            "Une charge catécholaminergique élevée peut aggraver le cœur toxique.",
          ],
          [
            true,
            "Utiliser l’amiodarone pour une arythmie ventriculaire.",
            "Elle évite de réutiliser un bloqueur sodique anesthésique.",
          ],
          [
            true,
            "Éviter lidocaïne et procainamide comme antiarythmiques.",
            "Ils partagent le mécanisme toxique des canaux sodiques.",
          ],
          [
            false,
            "Interrompre rapidement la réanimation si le premier choc échoue.",
            "Une récupération tardive reste possible et justifie la prolongation.",
          ],
          [
            true,
            "Envisager un support extracorporel si l’arrêt se prolonge.",
            "Une assistance peut laisser le temps au toxique de se redistribuer.",
          ],
        ],
      ),
      qcm(
        "Quelles affirmations concernent l’émulsion lipidique 20 % ?",
        src("b00088", "b00092", "b00094"),
        "L’émulsion est un traitement précoce des formes graves, associée au support classique et suivie d’une surveillance métabolique.",
        [
          [
            true,
            "Elle peut être administrée dès une convulsion sévère.",
            "Cette précocité peut prévenir l’arrêt cardiaque.",
          ],
          [
            false,
            "L’émulsion lipidique est réservée au traitement d’une pancréatite déjà constituée.",
            "Elle sert au traitement de la toxicité systémique sévère, tandis que la pancréatite est une complication à surveiller.",
          ],
          [
            false,
            "Elle remplace l’oxygénation et la ventilation",
            "Le support respiratoire reste prioritaire.",
          ],
          [
            false,
            "Elle autorise la reprise immédiate de l’injection locale.",
            "L’exposition toxique doit rester interrompue.",
          ],
          [
            true,
            "Une pancréatite doit être recherchée au suivi.",
            "La charge lipidique peut provoquer cette complication.",
          ],
        ],
      ),
      qcm(
        "Quels éléments doivent être surveillés après stabilisation cardiovasculaire ?",
        src("b00088"),
        "Le risque de récidive et les complications des lipides justifient une zone monitorée, un examen régulier et une déclaration.",
        [
          [
            false,
            "Un ECG normal cinq minutes après le retour circulatoire autorise l’arrêt du monitorage.",
            "La récidive rythmique justifie une surveillance cardiaque prolongée.",
          ],
          [
            true,
            "L’état neurologique après la crise.",
            "Une récidive ou des séquelles doivent être dépistées.",
          ],
          [
            false,
            "L’émulsion lipidique exclut tout risque ultérieur de pancréatite.",
            "Cette complication doit rester recherchée après stabilisation.",
          ],
          [
            false,
            "Une sortie immédiate dès le retour de la pression.",
            "Le toxique peut encore se redistribuer.",
          ],
          [
            false,
            "Aucune traçabilité si le patient récupère.",
            "L’événement doit être rapporté dans le système de vigilance.",
          ],
        ],
      ),
    ],
  },
  {
    label: "QCM — Série 7 · Complications non systémiques",
    allowed_voies: ["interne"],
    questions: [
      qcm(
        "Quels éléments orientent vers une allergie vraie aux anesthésiques locaux ?",
        src("b00097", "b00098", "b00099"),
        "Le risque concerne surtout les esters via le PABA ; l’interrogatoire doit séparer réaction immune, malaise vagal et adrénaline.",
        [
          [
            false,
            "Des paresthésies péribuccales isolées prouvent une allergie immédiate.",
            "Elles orientent plutôt vers une toxicité neurologique systémique.",
          ],
          [
            false,
            "Une réaction à un amide sans conservateur démontre automatiquement une sensibilisation au PABA.",
            "Le PABA concerne surtout les esters et certains conservateurs apparentés.",
          ],
          [
            true,
            "Le méthylparaben peut participer à une réaction.",
            "Ce conservateur est métabolisé en PABA.",
          ],
          [
            false,
            "Toute tachycardie après injection prouve une allergie.",
            "Une absorption d’adrénaline produit ce signe sans mécanisme immunitaire.",
          ],
          [
            false,
            "Un malaise vagal ancien suffit à interdire tous les amides.",
            "L’interrogatoire peut reclasser cet événement non allergique.",
          ],
        ],
      ),
      qcm(
        "Quand faut-il suspecter une méthémoglobinémie ?",
        src("b00100", "b00101"),
        "L’exposition oxydante, une saturation résistante à l’oxygène et une PaO2 relativement préservée constituent la discordance centrale.",
        [
          [
            true,
            "Une exposition importante à la benzocaïne doit faire évoquer ce diagnostic.",
            "Cet anesthésique topique possède un potentiel oxydant marqué.",
          ],
          [
            true,
            "Une application étendue ou répétée de prilocaïne augmente le risque.",
            "Dose, durée et surface exposée conditionnent la production de métabolites oxydants.",
          ],
          [
            true,
            "Une SpO2 inférieure à 90 % malgré une PaO2 conservée au-dessus de 70 mmHg est évocatrice.",
            "Cette discordance suggère une hémoglobine incapable de transporter normalement l’oxygène.",
          ],
          [
            true,
            "Une cyanose persistante sous oxygène associée à un sang brun chocolat est évocatrice.",
            "L’aspect du sang et la faible réponse à l’oxygène orientent vers une dysfonction de l’hémoglobine.",
          ],
          [
            true,
            "La CO-oxymétrie confirme le diagnostic.",
            "Elle mesure directement la fraction de méthémoglobine.",
          ],
        ],
      ),
      qcm(
        "Comment analyser un déficit neurologique après un bloc ?",
        src("b00102", "b00103", "b00104"),
        "L’anesthésique local n’est qu’une cause parmi chirurgie, obstétrique, injection intraneurale, additif et maladie préexistante.",
        [
          [
            true,
            "Rechercher une lésion liée au geste chirurgical.",
            "La proximité temporelle ne désigne pas automatiquement le médicament.",
          ],
          [
            true,
            "Évaluer une injection intraneurale possible.",
            "La pression et la localisation peuvent léser les fascicules.",
          ],
          [
            true,
            "Examiner la toxicité des conservateurs ou antioxydants.",
            "Les additifs contribuent parfois à la neurotoxicité.",
          ],
          [
            true,
            "Documenter la chronologie et le territoire exact du déficit.",
            "Ces données aident à distinguer atteinte chirurgicale, intraneurale et toxicité locale.",
          ],
          [
            true,
            "Individualiser la décision si une neuropathie préexiste.",
            "Le risque cumulatif impose une discussion au cas par cas.",
          ],
        ],
      ),
      qcm(
        "Quelles caractéristiques décrivent l’irritation radiculaire transitoire ?",
        src("b00104"),
        "Ce syndrome douloureux de quelques jours suit surtout la lidocaïne intrathécale et ne correspond pas nécessairement à un déficit permanent.",
        [
          [
            true,
            "Des brûlures des membres inférieurs peuvent survenir.",
            "La douleur radiculaire est une expression classique.",
          ],
          [
            false,
            "Le syndrome résulte principalement d’une infiltration sous-cutanée d’adrénaline.",
            "Il est décrit après administration intrathécale, notamment avec la lidocaïne.",
          ],
          [
            false,
            "Le syndrome est toujours définitif et moteur.",
            "Il est généralement transitoire et sensitif.",
          ],
          [
            false,
            "Il survient surtout après infiltration sous-cutanée de procaïne.",
            "Le contexte typique est l’injection intrathécale de lidocaïne.",
          ],
          [
            false,
            "Il se définit par une méthémoglobinémie.",
            "Cette complication relève d’un mécanisme oxydatif distinct.",
          ],
        ],
      ),
      qcm(
        "Quelles données concernent la myotoxicité ?",
        src("b00105", "b00106", "b00107"),
        "La myonécrose expérimentale est fréquente mais peu visible cliniquement ; le bloc rétrobulbaire fournit l’exemple le plus évident.",
        [
          [
            false,
            "La myotoxicité disparaît lors d’expositions répétées au même muscle.",
            "La répétition ou la forte concentration peut au contraire accroître la lésion musculaire.",
          ],
          [
            true,
            "La bupivacaïne est la plus myotoxique des agents cités.",
            "Elle précède lidocaïne et tétracaïne dans le classement.",
          ],
          [
            false,
            "La procaïne est décrite comme la plus toxique du classement.",
            "Elle occupe la position la moins toxique.",
          ],
          [
            true,
            "L’adrénaline augmente la myotoxicité de la lidocaïne.",
            "La vasoconstriction prolonge l’exposition musculaire.",
          ],
          [
            true,
            "Une dysfonction périorbitaire peut suivre un bloc rétrobulbaire.",
            "Cette manifestation clinique est habituellement réversible.",
          ],
        ],
      ),
    ],
  },
  {
    label: "QCM — Série 8 · Terrains, adjuvants et voies",
    allowed_voies: ["interne"],
    questions: [
      qcm(
        "Pourquoi réduire les doses d’anesthésique local chez le sujet âgé ?",
        src("b00110", "b00111"),
        "Le vieillissement ralentit l’élimination, modifie les fibres et augmente la hauteur neuraxiale obtenue pour une même dose.",
        [
          [
            false,
            "Une albuminémie normale dispense de toute adaptation liée à l’âge.",
            "La sensibilité nerveuse et les changements anatomiques persistent indépendamment de l’albumine.",
          ],
          [
            true,
            "Le tissu nerveux est plus sensible au bloc.",
            "Les fibres myélinisées et non myélinisées sont altérées.",
          ],
          [
            false,
            "Une même dose donne toujours un niveau rachidien plus bas.",
            "Le niveau sensitif est au contraire souvent plus élevé.",
          ],
          [
            true,
            "Les changements anatomiques modifient la diffusion.",
            "La distribution neuraxiale évolue avec l’âge.",
          ],
          [
            false,
            "Le poids seul suffit pour corriger la prescription.",
            "Plusieurs dimensions physiologiques doivent être intégrées.",
          ],
        ],
      ),
      qcm(
        "Quelles particularités de la grossesse influencent le choix ?",
        src("b00112", "b00113", "b00114"),
        "Sensibilité nerveuse et fraction libre augmentent, tandis que l’anatomie neuraxiale majore l’effet ; les doses doivent être limitées.",
        [
          [
            false,
            "La grossesse protège de la cardiotoxicité de la bupivacaïne",
            "La vulnérabilité à cet agent est au contraire accrue.",
          ],
          [
            true,
            "La liaison protéique plasmatique diminue.",
            "La fraction libre active augmente en conséquence.",
          ],
          [
            true,
            "La dose neuraxiale doit généralement être réduite.",
            "Les modifications morphologiques amplifient la diffusion.",
          ],
          [
            true,
            "La bupivacaïne 0,75 % est interdite en péridurale obstétricale.",
            "Cette concentration expose à une cardiotoxicité inacceptable.",
          ],
          [
            true,
            "Les fibres sont plus sensibles aux anesthésiques locaux",
            "Une moindre exposition peut produire un bloc important.",
          ],
        ],
      ),
      qcm(
        "Comment les comorbidités modifient-elles la pharmacocinétique ?",
        src("b00115", "b00116", "b00117", "b00118"),
        "Foie et débit cardiaque ralentissent les amides, l’hypoprotéinémie augmente leur fraction libre et le rein modifie l’absorption.",
        [
          [
            true,
            "L’insuffisance hépatique favorise l’accumulation des amides répétés.",
            "Le métabolisme par P450 devient limitant.",
          ],
          [
            true,
            "L’hypoprotéinémie augmente la fraction libre.",
            "Moins de sites plasmatiques retiennent le médicament.",
          ],
          [
            true,
            "Le bas débit cardiaque réduit la perfusion hépatique.",
            "La clairance des amides peut alors ralentir.",
          ],
          [
            true,
            "L’insuffisance rénale peut modifier l’exposition systémique et justifier une réduction.",
            "Une diminution de dose de 10 à 20 % est proposée selon le terrain rénal.",
          ],
          [
            true,
            "Une circulation hyperdynamique peut accélérer l’absorption.",
            "Le transfert du site vers le plasma devient plus rapide.",
          ],
        ],
      ),
      qcm(
        "Quels effets peut apporter l’adrénaline ajoutée à un bloc ?",
        src("b00138", "b00139", "b00140", "b00141", "b00171"),
        "La vasoconstriction réduit l’absorption et prolonge le bloc ; un effet spinal alpha-adrénergique complète ce mécanisme.",
        [
          [
            true,
            "Une concentration plasmatique maximale plus basse.",
            "Le débit sanguin local diminue après vasoconstriction.",
          ],
          [
            true,
            "Une durée d’analgésie prolongée.",
            "Le médicament reste plus longtemps près du nerf.",
          ],
          [
            true,
            "Une toxicité systémique potentiellement réduite.",
            "Le pic plasmatique absorbé est atténué par la vasoconstriction locale.",
          ],
          [
            true,
            "Une tachycardie sentinelle peut révéler une injection intravasculaire d’une solution adrénalinée.",
            "L’adjuvant peut servir de marqueur lors d’un passage vasculaire accidentel.",
          ],
          [
            true,
            "Une potentialisation spinale indépendante de la vasoconstriction.",
            "Les récepteurs alpha médullaires peuvent participer.",
          ],
        ],
      ),
      qcm(
        "Quelles utilisations particulières des anesthésiques locaux sont décrites ?",
        src(
          "b00142",
          "b00145",
          "b00146",
          "b00147",
          "b00148",
          "b00149",
          "b00150",
        ),
        "Lidocaïne IV, bloc de Bier, adjuvants alpha-2 et formes topiques étendent les usages au-delà du dépôt périnerveux classique.",
        [
          [
            false,
            "Les muqueuses constituent une barrière plus forte que la peau intacte",
            "Elles laissent au contraire pénétrer plus facilement le médicament.",
          ],
          [
            true,
            "Le bloc de Bier utilise un tourniquet.",
            "Il maintient la lidocaïne dans le territoire veineux isolé.",
          ],
          [
            true,
            "Une crème peut anesthésier la peau avant une ponction.",
            "Une formulation adaptée franchit progressivement la barrière cutanée.",
          ],
          [
            true,
            "Un timbre de lidocaïne peut traiter certaines douleurs chroniques.",
            "La diffusion locale prolongée cible la zone douloureuse.",
          ],
          [
            true,
            "La lidocaïne IV peut compléter l’analgésie périopératoire et atténuer certains réflexes bronchiques.",
            "Cette voie systémique constitue un usage distinct des blocs et des formes topiques.",
          ],
        ],
      ),
    ],
  },
];

const DP_QCM_SERIES = [
  {
    label: "DP QCM 1 · Prodromes pendant un bloc interscalénique",
    vignette:
      "Un homme de 52 ans doit recevoir un bloc interscalénique échoguidé pour chirurgie de l’épaule. Il est conscient, sans sédation, pèse 78 kg et n’a pas de cardiopathie. Après aspiration négative, une solution de ropivacaïne est injectée par fractions sous monitorage. Le matériel de ventilation et une émulsion lipidique à 20 % sont disponibles dans la salle.",
    allowed_voies: ["interne"],
    questions: [
      qcm(
        "Quelles mesures de prévention sont déjà appropriées ?",
        src("b00071", "b00075", "b00084", "b00088"),
        "La sécurité repose sur une combinaison de guidage, fractionnement, observation et disponibilité immédiate de la réanimation.",
        [
          [
            true,
            "Le guidage échographique du dépôt.",
            "Il réduit les erreurs anatomiques sans abolir le risque vasculaire.",
          ],
          [
            true,
            "L’aspiration avant chaque fraction.",
            "Un retour sanguin peut révéler une migration de l’aiguille.",
          ],
          [
            true,
            "Le maintien du patient éveillé sans sédation profonde.",
            "Il peut verbaliser précocement les prodromes neurologiques.",
          ],
          [
            true,
            "La présence d’une émulsion lipidique 20 %.",
            "Le traitement doit être accessible avant l’exposition.",
          ],
          [
            false,
            "L’absence de tout monitorage cardiaque.",
            "Une arythmie peut apparaître brutalement pendant l’injection.",
          ],
        ],
      ),
      qcm(
        "Comment interpréter ces symptômes ?",
        src("b00086", "b00087"),
        "Paresthésies péribuccales et goût métallique constituent des prodromes neurologiques typiques d’une concentration systémique croissante.",
        [
          [
            false,
            "Ces symptômes correspondent au bloc sensitif attendu de l’épaule.",
            "Le goût métallique et les paresthésies péribuccales sont des prodromes systémiques, non un effet local du bloc.",
          ],
          [
            false,
            "Le bloc sensitif normal de l’épaule explique le goût métallique.",
            "La distribution périnerveuse ne produit pas ce symptôme oral.",
          ],
          [
            true,
            "L’injection doit être immédiatement arrêtée.",
            "Poursuivre augmenterait le taux cérébral et cardiaque.",
          ],
          [
            false,
            "Une allergie cutanée isolée est l’hypothèse principale.",
            "Aucun urticaire ni bronchospasme n’accompagne les prodromes.",
          ],
          [
            true,
            "Une surveillance rapprochée est nécessaire.",
            "Le tableau peut progresser malgré l’arrêt de l’injection.",
          ],
        ],
        "Après 12 mL, le patient décrit un goût métallique et des fourmillements autour de la bouche.",
      ),
      qcm(
        "Quelles conduites sont indiquées à ce stade ?",
        src("b00087", "b00088", "b00162", "b00163"),
        "La source toxique est interrompue et le support respiratoire prévient hypoxie et acidose avant toute évolution convulsive.",
        [
          [
            true,
            "Appeler de l’aide dans la salle.",
            "La progression peut exiger plusieurs intervenants rapidement.",
          ],
          [
            true,
            "Administrer de l’oxygène à forte concentration.",
            "L’oxygénation limite l’aggravation neurologique et cardiaque.",
          ],
          [
            false,
            "La poursuite de l’injection devient acceptable après un simple ralentissement du débit.",
            "Les prodromes imposent l’arrêt complet de l’administration.",
          ],
          [
            false,
            "Injecter le reste de la dose plus lentement.",
            "Toute exposition supplémentaire est contre-indiquée.",
          ],
          [
            false,
            "Faire marcher le patient pour accélérer l’élimination.",
            "La mobilisation n’a aucun rôle et retarde la surveillance.",
          ],
        ],
        "Le discours devient ralenti et le patient signale des bourdonnements d’oreilles.",
      ),
      qcm(
        "Quelle prise en charge spécifique ajouter ?",
        src("b00087", "b00088", "b00092"),
        "Une convulsion toxique impose ventilation, benzodiazépine et recours précoce aux lipides pour prévenir la progression cardiaque.",
        [
          [
            true,
            "Contrôler immédiatement l’oxygénation et la ventilation.",
            "L’hypoventilation est la principale cause de séquelles convulsives.",
          ],
          [
            true,
            "Administrer une benzodiazépine.",
            "Une benzodiazépine interrompt la crise sans renforcer le bloc sodique toxique.",
          ],
          [
            true,
            "Commencer l’émulsion lipidique 20 % selon l’algorithme.",
            "La forme sévère justifie un traitement lipidique précoce.",
          ],
          [
            false,
            "Choisir de la lidocaïne IV comme anticonvulsivant.",
            "Ajouter un bloqueur sodique aggraverait la toxicité.",
          ],
          [
            true,
            "Surveiller continuellement le rythme cardiaque.",
            "Une arythmie peut suivre ou accompagner la convulsion.",
          ],
        ],
        "Malgré l’arrêt de l’injection, des fasciculations évoluent vers une convulsion généralisée.",
      ),
      qcm(
        "Quels facteurs expliquent la brutalité malgré les précautions ?",
        src("b00071", "b00076", "b00084", "b00087"),
        "Une position vasculaire intermittente peut échapper à l’aspiration ; l’échographie et la dose totale correcte ne garantissent jamais l’absence de TSAL.",
        [
          [
            true,
            "Une injection intravasculaire intermittente reste possible.",
            "Le déplacement de la pointe peut survenir entre deux contrôles.",
          ],
          [
            false,
            "Une image échographique rassurante exclut avec certitude tout contact vasculaire intermittent.",
            "L’échographie réduit le risque sans éliminer une pénétration vasculaire transitoire.",
          ],
          [
            false,
            "La ropivacaïne garantit une absence complète de toxicité.",
            "Tout anesthésique local peut atteindre le cerveau et le cœur à concentration suffisante.",
          ],
          [
            false,
            "Le poids normal annule le risque du trajet vasculaire.",
            "Le site d’injection domine alors la cinétique.",
          ],
          [
            true,
            "La vitesse d’augmentation plasmatique conditionne les signes.",
            "Un bolus vasculaire franchit vite les seuils toxiques.",
          ],
        ],
        "L’échographie n’a pas montré d’injection évidente et la dose totale reste sous la limite usuelle.",
      ),
      qcm(
        "Quelles données permettent de poursuivre le suivi ?",
        src("b00088"),
        "Après une manifestation neurologique sévère, le patient reste monitoré et l’équipe recherche une récidive ou une complication du traitement lipidique.",
        [
          [
            true,
            "Maintenir un environnement avec monitorage cardiorespiratoire.",
            "La redistribution peut produire une nouvelle dégradation.",
          ],
          [
            false,
            "Cinq minutes sans nouvelle convulsion suffisent pour autoriser la sortie.",
            "Une surveillance cardiorespiratoire prolongée reste requise après une TSAL convulsive.",
          ],
          [
            false,
            "Un autre anesthésique local peut être injecté immédiatement dès le réveil.",
            "Toute nouvelle exposition doit être évitée pendant le suivi de l’épisode toxique.",
          ],
          [
            false,
            "Autoriser une sortie immédiate dès l’arrêt de la crise.",
            "Une période d’observation clinique reste indispensable.",
          ],
          [
            false,
            "Recommencer le bloc avec la dose restante.",
            "La réexposition est injustifiable après une toxicité avérée.",
          ],
        ],
        "La convulsion cesse, l’hémodynamique reste stable et le patient reprend conscience.",
      ),
      qcm(
        "Quels éléments doivent être documentés ?",
        src("b00075", "b00084", "b00088"),
        "La traçabilité précise de l’exposition, des symptômes et du traitement permet l’analyse de l’événement et la sécurité future.",
        [
          [
            true,
            "Le nom, la concentration et la dose injectée.",
            "Ces données quantifient l’exposition réelle.",
          ],
          [
            true,
            "La chronologie des prodromes et de la convulsion.",
            "Elle aide à distinguer injection vasculaire et absorption lente.",
          ],
          [
            true,
            "Les mesures de prévention utilisées.",
            "Le retour d’expérience dépend du déroulement technique.",
          ],
          [
            true,
            "La dose totale d’émulsion lipidique administrée.",
            "Elle conditionne le suivi métabolique et la répétition éventuelle.",
          ],
          [
            true,
            "La voie, le site et les circonstances exactes de l’injection doivent être consignés.",
            "Ces éléments permettent d’analyser un éventuel passage vasculaire et de prévenir une récidive.",
          ],
        ],
        "Le patient reste asymptomatique douze heures plus tard et demande la cause de l’incident.",
      ),
    ],
  },
  {
    label: "DP QCM 2 · Bupivacaïne péridurale obstétricale",
    vignette:
      "Une femme de 33 ans à terme reçoit une péridurale pour travail prolongé. Elle n’a pas de cardiopathie mais présente une albuminémie basse de grossesse. Un cathéter est en place depuis plusieurs heures. Avant une césarienne urgente, une dose complémentaire de bupivacaïne est envisagée sous monitorage complet, avec matériel de réanimation immédiatement disponible.",
    allowed_voies: ["interne"],
    questions: [
      qcm(
        "Quelles particularités de la grossesse modifient la prescription ?",
        src("b00112", "b00113", "b00114", "b00164"),
        "Sensibilité nerveuse, fraction libre et diffusion neuraxiale augmentent, tandis que la cardiotoxicité de la bupivacaïne est plus préoccupante.",
        [
          [
            true,
            "La fraction libre de plusieurs agents est augmentée.",
            "La baisse de liaison protéique laisse davantage de médicament actif.",
          ],
          [
            false,
            "La grossesse protège contre la cardiotoxicité de la bupivacaïne.",
            "La sensibilité cardiaque est au contraire accrue pendant la grossesse.",
          ],
          [
            true,
            "Une réduction de dose est généralement justifiée.",
            "L’anatomie et la physiologie amplifient le bloc.",
          ],
          [
            false,
            "La bupivacaïne 0,75 % est recommandée en péridurale obstétricale.",
            "Cette concentration est explicitement interdite dans ce contexte.",
          ],
          [
            true,
            "La vulnérabilité cardiaque à la bupivacaïne est accrue.",
            "La grossesse réduit la marge de sécurité de cet agent.",
          ],
        ],
      ),
      qcm(
        "Quelles vérifications sont pertinentes avant le bolus ?",
        src("b00071", "b00075", "b00076"),
        "Un cathéter peut migrer ; aspiration, fractionnement, dose contextualisée et monitorage recherchent une injection vasculaire ou intrathécale.",
        [
          [
            true,
            "Aspirer le cathéter avant l’injection.",
            "Un reflux sanguin peut révéler une migration vasculaire.",
          ],
          [
            true,
            "Administrer une dose fractionnée.",
            "Chaque portion limite la charge d’une erreur de position.",
          ],
          [
            true,
            "Observer les signes neurologiques et cardiaques.",
            "La toxicité peut être immédiate chez une patiente consciente.",
          ],
          [
            true,
            "Tenir compte des doses déjà reçues pendant le travail",
            "La charge cumulée réduit la marge restante.",
          ],
          [
            true,
            "La position du cathéter doit être réévaluée après sa mobilisation.",
            "Un déplacement pendant le transfert peut modifier la diffusion ou favoriser une injection indésirable.",
          ],
        ],
        "Le bloc initial s’estompe et le cathéter a été mobilisé pendant le transfert au bloc opératoire.",
      ),
      qcm(
        "Comment interpréter cette évolution ?",
        src("b00076", "b00084", "b00087", "b00094"),
        "Une forte charge intravasculaire peut court-circuiter les prodromes et produire directement une toxicité cardiovasculaire sévère.",
        [
          [
            false,
            "L’absence de prodrome neurologique exclut une toxicité systémique.",
            "Une injection vasculaire rapide peut débuter directement par une arythmie.",
          ],
          [
            true,
            "La TSAL peut débuter sans signe péribuccal.",
            "Une montée brutale franchit directement les seuils graves.",
          ],
          [
            false,
            "Une simple extension du bloc péridural explique l’arythmie.",
            "L’effet neuraxial attendu ne provoque pas cette instabilité rythmique.",
          ],
          [
            true,
            "Il faut cesser toute administration par le cathéter.",
            "La source de bupivacaïne doit être interrompue.",
          ],
          [
            false,
            "La dose obstétricale protège du collapsus.",
            "La grossesse accroît la vulnérabilité au contraire.",
          ],
        ],
        "Après une fraction, une tachyarythmie large apparaît sans prodrome neurologique préalable.",
      ),
      qcm(
        "Quelles actions immédiates sont cohérentes ?",
        src("b00088", "b00094", "b00162", "b00163"),
        "La réanimation traite d’abord oxygénation et circulation, ajoute rapidement les lipides et adapte les antiarythmiques au bloc sodique toxique.",
        [
          [
            false,
            "La vasopressine à forte dose constitue le vasopresseur de première intention.",
            "Elle est déconseillée dans la réanimation spécifique d’une TSAL.",
          ],
          [
            false,
            "Des bolus standards de 1 mg d’adrénaline doivent être répétés sans adaptation.",
            "De petites doses d’adrénaline sont préférées afin de ne pas aggraver l’arythmie.",
          ],
          [
            false,
            "Administrer une forte dose de lidocaïne antiarythmique.",
            "Un autre anesthésique local renforcerait le bloc sodique.",
          ],
          [
            true,
            "Utiliser de petites doses d’adrénaline si nécessaire.",
            "Les doses usuelles élevées peuvent aggraver l’arythmie.",
          ],
          [
            true,
            "Envisager l’amiodarone pour l’arythmie ventriculaire.",
            "Elle est privilégiée dans l’algorithme spécifique.",
          ],
        ],
        "La pression s’effondre, l’oxygénation reste possible et le rythme ventriculaire persiste.",
      ),
      qcm(
        "Pourquoi ce collapsus peut-il être difficile à corriger ?",
        src("b00094"),
        "La bupivacaïne racémique se dissocie lentement des canaux conducteurs et associe arythmie, dépression contractile et vasodilatation.",
        [
          [
            false,
            "L’hypoxie accélère la récupération des canaux cardiaques bloqués.",
            "Hypoxie et acidose aggravent la cardiotoxicité et la réponse aux catécholamines.",
          ],
          [
            false,
            "La bupivacaïne se dissocie très rapidement des canaux sodiques myocardiques.",
            "Sa dissociation lente explique la persistance des troubles conductifs.",
          ],
          [
            true,
            "La vasodilatation périphérique réduit la pression.",
            "La résistance vasculaire chute avec la toxicité.",
          ],
          [
            false,
            "Le seuil cardiaque se situe très loin du seuil neurologique.",
            "L’écart est seulement d’environ 4 à 6 µg/mL.",
          ],
          [
            false,
            "L’acidose améliore la fixation des catécholamines.",
            "Elle majore au contraire la toxicité.",
          ],
        ],
        "Après plusieurs minutes, la réponse aux premières manœuvres reste incomplète.",
      ),
      qcm(
        "Quelles stratégies peuvent être poursuivies ?",
        src("b00088", "b00094"),
        "Une réanimation prolongée avec lipides répétés selon le plafond et un support circulatoire avancé laisse le temps à la redistribution.",
        [
          [
            true,
            "Poursuivre les compressions et la ventilation de haute qualité.",
            "L’arrêt toxique peut récupérer après une durée prolongée.",
          ],
          [
            true,
            "Répéter les lipides selon l’algorithme sans dépasser le maximum.",
            "La dose est adaptée à la persistance de l’instabilité.",
          ],
          [
            true,
            "Discuter une circulation extracorporelle de secours.",
            "Un support mécanique peut franchir la phase toxique.",
          ],
          [
            false,
            "Abandonner après un cycle sans retour spontané.",
            "Le pronostic justifie une réanimation obstinée.",
          ],
          [
            true,
            "Une réanimation prolongée reste justifiée devant une toxicité potentiellement réversible.",
            "La récupération peut nécessiter des manœuvres longues et une assistance circulatoire.",
          ],
        ],
        "Un arrêt circulatoire survient mais une équipe d’assistance extracorporelle est disponible.",
      ),
      qcm(
        "Quelle surveillance suit le retour circulatoire ?",
        src("b00088"),
        "Une atteinte cardiovasculaire impose au moins douze heures de monitorage, une vigilance neurologique et la recherche d’effets indésirables lipidiques.",
        [
          [
            true,
            "Monitorage cardiaque continu pendant au moins douze heures.",
            "Une récidive rythmique reste possible après stabilisation.",
          ],
          [
            true,
            "Évaluation neurologique répétée.",
            "L’hypoxie et la convulsion éventuelle peuvent laisser des séquelles.",
          ],
          [
            true,
            "Recherche clinique et biologique d’une pancréatite.",
            "L’émulsion lipidique peut déclencher cette complication.",
          ],
          [
            true,
            "Des ECG répétés et l’évolution hémodynamique doivent guider la durée du monitorage.",
            "La stabilité doit être confirmée avant toute réduction de surveillance.",
          ],
          [
            true,
            "Déclaration de l’événement indésirable.",
            "La pharmacovigilance et l’analyse technique sont requises.",
          ],
        ],
        "La circulation est restaurée après réanimation prolongée et perfusion lipidique.",
      ),
    ],
  },
  {
    label: "DP QCM 3 · Échec d’anesthésie dans un abcès",
    vignette:
      "Un homme de 27 ans consulte pour drainage urgent d’un abcès très inflammatoire de l’avant-bras. Il n’a aucune comorbidité et n’a jamais présenté de réaction aux anesthésiques locaux. Une infiltration de lidocaïne est réalisée au contact immédiat de la zone rouge et douloureuse. Quelques minutes plus tard, la peau reste très sensible malgré une dose déjà importante.",
    allowed_voies: ["interne"],
    questions: [
      qcm(
        "Quel mécanisme explique l’échec initial ?",
        src("b00017", "b00023", "b00024", "b00025", "b00026"),
        "Le tissu acide augmente la forme cationique extracellulaire, qui ne traverse pas suffisamment la membrane pour atteindre le canal de l’intérieur.",
        [
          [
            false,
            "L’alcalose du foyer infecté piège la lidocaïne sous forme ionisée.",
            "Le tissu infecté est acide, ce qui augmente la fraction protonée.",
          ],
          [
            false,
            "L’acidification locale augmente la fraction neutre diffusible.",
            "Un pH bas diminue cette fraction et ralentit l’accès au nerf.",
          ],
          [
            true,
            "La diffusion axonale est donc réduite.",
            "La forme chargée franchit mal la bicouche lipidique.",
          ],
          [
            false,
            "Le canal sodique disparaît du nerf infecté.",
            "La cible reste présente malgré l’inflammation.",
          ],
          [
            false,
            "La lidocaïne est devenue chimiquement un ester.",
            "La famille structurale ne change pas avec le pH.",
          ],
        ],
      ),
      qcm(
        "Comment choisir une stratégie plus efficace ?",
        src("b00024", "b00025", "b00026", "b00037"),
        "Le dépôt doit viser un tissu moins acide en amont de l’innervation plutôt que d’augmenter sans limite la dose intralésionnelle.",
        [
          [
            true,
            "Réaliser un bloc nerveux à distance du foyer.",
            "Le pH plus physiologique permet une meilleure diffusion.",
          ],
          [
            false,
            "Multiplier immédiatement la dose au centre de l’abcès.",
            "Cette escalade augmente le risque systémique sans corriger le piège ionique.",
          ],
          [
            true,
            "Déposer le médicament près du nerf concerné.",
            "La concentration locale utile dépend de la proximité anatomique.",
          ],
          [
            true,
            "Adapter volume et concentration à l’étendue du territoire.",
            "Ces paramètres contrôlent extension et intensité du bloc.",
          ],
          [
            true,
            "Choisir un site d’injection à distance du milieu acide améliore la diffusion.",
            "Un dépôt proximal près du nerf évite le piège ionique de la cavité infectée.",
          ],
        ],
        "Le chirurgien propose de réinjecter toute la dose restante directement dans la cavité.",
      ),
      qcm(
        "Quelles mesures de sécurité doivent accompagner la nouvelle injection ?",
        src("b00071", "b00075", "b00076", "b00084"),
        "La dose cumulée et la vascularisation inflammatoire augmentent le risque ; aspiration, fractions et surveillance restent essentielles.",
        [
          [
            true,
            "Calculer la quantité totale déjà administrée.",
            "La marge maximale se réduit avec chaque infiltration.",
          ],
          [
            true,
            "Aspirer avant les fractions à distance.",
            "Une position vasculaire accidentelle reste possible.",
          ],
          [
            true,
            "Injecter lentement en observant les symptômes.",
            "Un prodrome doit entraîner l’arrêt immédiat.",
          ],
          [
            true,
            "Disposer du matériel de réanimation et des lipides",
            "Une nouvelle charge peut franchir le seuil toxique.",
          ],
          [
            true,
            "Fractionner la dose en maintenant le dialogue avec le patient améliore la détection précoce.",
            "Les prodromes peuvent être repérés avant l’injection de la totalité du volume.",
          ],
        ],
        "Un bloc plus proximal est décidé, mais 300 mg de lidocaïne ont déjà été infiltrés.",
      ),
      qcm(
        "Comment interpréter l’amélioration obtenue ?",
        src("b00017", "b00054", "b00055"),
        "Dans un tissu à pH plus proche du physiologique, davantage de forme neutre entre dans la fibre puis se reprotonne pour bloquer le canal.",
        [
          [
            false,
            "L’analgésie résulte d’une destruction irréversible des canaux calciques.",
            "Le bloc réversible concerne surtout les canaux sodiques et cesse avec l’élimination locale.",
          ],
          [
            false,
            "L’amélioration rapide prouve un effet opioïde systémique de la lidocaïne.",
            "La distribution territoriale après le bloc proximal indique une action nerveuse locale.",
          ],
          [
            false,
            "La douleur a disparu par destruction du nerf.",
            "Le bloc est pharmacologique et réversible.",
          ],
          [
            false,
            "Le sodium extracellulaire a été totalement supprimé.",
            "Le médicament bloque le canal sans retirer l’ion du milieu.",
          ],
          [
            true,
            "Le potentiel d’action ne se propage plus dans les fibres nociceptives.",
            "Le courant sodique devient insuffisant pour atteindre le seuil.",
          ],
        ],
        "Le bloc proximal produit en dix minutes une analgésie nette du territoire.",
      ),
      qcm(
        "Quel bloc différentiel peut être observé ?",
        src("b00039", "b00065", "b00066", "b00067"),
        "Les fibres nociceptives et thermiques sont atteintes avant les grosses fibres tactiles et motrices, surtout à concentration modérée.",
        [
          [
            false,
            "La pression disparaît nécessairement avant la douleur piquante.",
            "Douleur et température sont habituellement bloquées avant toucher et pression.",
          ],
          [
            false,
            "Le bloc moteur précède toujours la perte de sensation thermique.",
            "Les petites fibres thermiques sont plus sensibles que les grosses fibres motrices.",
          ],
          [
            false,
            "L’absence de douleur exige toujours une paralysie complète.",
            "L’analgésie peut être sélective lorsque les fibres motrices restent conductrices.",
          ],
          [
            true,
            "La température est souvent bloquée précocement.",
            "Les fibres A-delta et C transmettent ces informations.",
          ],
          [
            false,
            "Toutes les fonctions d’un nerf suivent une loi simultanée.",
            "Le nerf entier contient des fibres diverses.",
          ],
        ],
        "Le patient ne ressent plus la piqûre mais perçoit encore une pression et bouge les doigts.",
      ),
      qcm(
        "Quels signes imposeraient d’interrompre toute nouvelle dose ?",
        src("b00087"),
        "Les prodromes neurologiques signalent une concentration systémique croissante et précèdent parfois la convulsion.",
        [
          [
            false,
            "Une motricité conservée suffit à garantir l’absence de toxicité systémique.",
            "Les prodromes centraux peuvent apparaître malgré un bloc moteur incomplet.",
          ],
          [
            true,
            "Des paresthésies péribuccales nouvelles.",
            "Elles ne correspondent pas au territoire du bloc.",
          ],
          [
            true,
            "Un discours ralenti avec acouphènes.",
            "L’association indique une progression centrale.",
          ],
          [
            false,
            "Une analgésie limitée à l’avant-bras.",
            "Il s’agit de l’effet local recherché.",
          ],
          [
            false,
            "Une motricité digitale préservée seule.",
            "Le bloc différentiel peut épargner les fibres motrices.",
          ],
        ],
        "Une dernière infiltration cutanée est discutée avant l’incision.",
      ),
      qcm(
        "Quelles conclusions transmettre pour une procédure ultérieure ?",
        src("b00017", "b00024", "b00071"),
        "L’échec dans l’abcès est physicochimique, non allergique, et la dose doit toujours être totalisée malgré une efficacité locale faible.",
        [
          [
            true,
            "Une infection acide peut réduire l’efficacité locale.",
            "Le piège ionique explique le défaut de diffusion.",
          ],
          [
            true,
            "Un bloc à distance peut contourner ce problème.",
            "Le dépôt se fait alors dans un milieu moins acide.",
          ],
          [
            true,
            "La dose inefficace localement compte dans la charge systémique.",
            "L’absorption sanguine continue malgré l’échec analgésique.",
          ],
          [
            false,
            "Le patient doit être étiqueté allergique à la lidocaïne.",
            "Aucun mécanisme immunitaire n’a été observé.",
          ],
          [
            false,
            "Une dose sans effet peut être répétée sans plafond.",
            "La toxicité dépend de l’exposition, pas du succès clinique.",
          ],
        ],
        "Le drainage se termine sans incident et le patient demande pourquoi la première injection a échoué.",
      ),
    ],
  },
  {
    label: "DP QCM 4 · Rachianesthésie chez une patiente âgée",
    vignette:
      "Une femme de 86 ans doit être opérée d’une fracture de hanche sous rachianesthésie. Elle pèse 49 kg, présente une insuffisance cardiaque stable et une albuminémie basse. L’intervention devrait durer quatre-vingt-dix minutes. Elle n’a pas de neuropathie connue. L’équipe souhaite obtenir un niveau sensitif adapté sans bloc excessivement haut ni toxicité.",
    allowed_voies: ["interne"],
    questions: [
      qcm(
        "Quels facteurs imposent une réduction de dose ?",
        src("b00110", "b00111", "b00115", "b00116", "b00117"),
        "Âge, faible réserve circulatoire, hypoprotéinémie et sensibilité neuraxiale augmentent ensemble l’effet et la fraction libre.",
        [
          [
            false,
            "Le grand âge permet d’ignorer les doses déjà administrées.",
            "La dose cumulée reste essentielle et doit être réduite chez le sujet âgé.",
          ],
          [
            true,
            "Une même dose produit souvent un niveau sensitif plus haut.",
            "Les modifications anatomiques amplifient la diffusion intrathécale.",
          ],
          [
            true,
            "L’hypoalbuminémie augmente la fraction libre.",
            "Moins de médicament est retenu par les protéines.",
          ],
          [
            true,
            "Le bas débit peut ralentir l’élimination d’un amide absorbé.",
            "La perfusion hépatique dépend du débit cardiaque.",
          ],
          [
            false,
            "Le petit poids autorise une dose fixe adulte sans adaptation.",
            "Le poids ne corrige pas les autres vulnérabilités.",
          ],
        ],
      ),
      qcm(
        "Quels critères orientent le choix rachidien ?",
        src("b00073", "b00128", "b00129", "b00130", "b00132"),
        "La durée, le site opéré, le profil moteur et les adjuvants déterminent une dose réduite plutôt qu’un plafond systémique.",
        [
          [
            false,
            "Une dose maximale d’infiltration sous-cutanée",
            "Cette limite ne guide pas directement une dose rachidienne.",
          ],
          [
            true,
            "Le niveau chirurgical requis pour la hanche.",
            "La hauteur du bloc doit couvrir la zone opératoire.",
          ],
          [
            true,
            "La densité de la solution et la position.",
            "La baricité influence la diffusion intrathécale.",
          ],
          [
            true,
            "La durée prévue de soixante-quinze minutes doit être compatible avec l’agent choisi.",
            "La durée d’action attendue participe au choix de la molécule et de la dose rachidienne.",
          ],
          [
            true,
            "Une réduction des opioïdes chez le sujet âgé.",
            "Le tableau rappelle cette adaptation des adjuvants.",
          ],
        ],
        "Le chirurgien confirme un geste sous-inguinal d’une durée estimée à soixante-quinze minutes.",
      ),
      qcm(
        "Comment prévenir un bloc trop étendu ?",
        src("b00111", "b00130", "b00136", "b00137"),
        "Une faible dose, une solution et une position adaptées limitent la diffusion excessive chez cette patiente très sensible.",
        [
          [
            true,
            "Réduire la dose par rapport à un adulte jeune.",
            "Le niveau sensitif est plus haut à dose identique chez le sujet âgé.",
          ],
          [
            true,
            "Tenir compte de la baricité choisie.",
            "La densité relative gouverne la migration dans le LCR.",
          ],
          [
            true,
            "Contrôler la position après l’injection.",
            "La gravité influence une solution hyperbare.",
          ],
          [
            false,
            "Injecter une dose supplémentaire avant d’évaluer le niveau.",
            "Une extension tardive pourrait devenir dangereuse.",
          ],
          [
            false,
            "Ajouter systématiquement 300 µg d’adrénaline.",
            "L’adjuvant doit être individualisé au terrain et à la durée.",
          ],
        ],
        "Une solution hyperbare est disponible et la patiente peut être positionnée latéralement.",
      ),
      qcm(
        "Quels effets peuvent être observés avec un bloc différentiel adéquat ?",
        src("b00039", "b00065", "b00066", "b00067"),
        "Un bloc chirurgical supprime douleur et température, tandis que la pression peut persister et la motricité dépend de la concentration.",
        [
          [
            true,
            "Absence de douleur à l’incision.",
            "Les fibres nociceptives doivent être bloquées.",
          ],
          [
            false,
            "Le bloc moteur doit précéder la disparition de la douleur.",
            "Le bloc différentiel permet une analgésie avec motricité partiellement conservée.",
          ],
          [
            false,
            "Conservation obligatoire de toute motricité.",
            "Une rachianesthésie chirurgicale bloque souvent aussi des fibres motrices.",
          ],
          [
            true,
            "Perte précoce de la sensation thermique.",
            "Les petites fibres thermiques sont sensibles.",
          ],
          [
            false,
            "Disparition simultanée garantie de toutes les fonctions.",
            "L’hétérogénéité des fibres produit une séquence.",
          ],
        ],
        "Le niveau sensitif devient suffisant ; la patiente décrit la pression mais aucune douleur.",
      ),
      qcm(
        "Quels signes suggéreraient plutôt une toxicité systémique ?",
        src("b00087", "b00094"),
        "Des prodromes cérébraux ou une arythmie ne relèvent pas du bloc neuraxial attendu et imposent une évaluation immédiate.",
        [
          [
            true,
            "Un goût métallique nouveau.",
            "Cette plainte traduit une exposition centrale.",
          ],
          [
            true,
            "Des acouphènes accompagnés d’une nouvelle dysarthrie toxique.",
            "La combinaison est un prodrome de TSAL.",
          ],
          [
            false,
            "Une insensibilité thermique du membre opéré.",
            "Ce signe appartient au bloc recherché.",
          ],
          [
            true,
            "Une arythmie ventriculaire.",
            "Elle constitue une toxicité cardiovasculaire grave.",
          ],
          [
            false,
            "Une faiblesse motrice limitée au territoire rachidien.",
            "Elle peut résulter du bloc chirurgical.",
          ],
        ],
        "Pendant la surveillance, l’interne demande quels symptômes ne doivent pas être attribués au seul bloc.",
      ),
      qcm(
        "Pourquoi l’insuffisance cardiaque reste-t-elle pertinente ?",
        src("b00117"),
        "Le débit cardiaque réduit diminue la perfusion hépatique et peut ralentir l’élimination des amides lors d’une exposition prolongée.",
        [
          [
            false,
            "Le cathéter continu élimine tout risque d’accumulation systémique.",
            "La perfusion prolonge au contraire l’exposition et impose de suivre la dose cumulée.",
          ],
          [
            true,
            "Des doses répétées seraient plus préoccupantes qu’un petit bolus.",
            "L’accumulation nécessite une charge prolongée.",
          ],
          [
            false,
            "Le cœur métabolise directement tous les esters.",
            "Les esters dépendent des pseudo-cholinestérases plasmatiques.",
          ],
          [
            false,
            "L’insuffisance cardiaque accélère nécessairement l’élimination.",
            "Le mécanisme décrit est un ralentissement.",
          ],
          [
            false,
            "Une hypoalbuminémie diminue la fraction pharmacologiquement active.",
            "La baisse de liaison protéique augmente la fraction libre et le risque toxique.",
          ],
        ],
        "La chirurgie se prolonge et une analgésie continue est envisagée pour la suite.",
      ),
      qcm(
        "Quelles précautions sont adaptées en postopératoire ?",
        src("b00071", "b00111", "b00117"),
        "Chez cette patiente fragile, toute technique continue doit utiliser une dose réduite, un suivi clinique et la comptabilisation de la charge.",
        [
          [
            false,
            "Un faible débit dispense de surveiller les prodromes neurologiques.",
            "Une accumulation tardive reste possible pendant une perfusion continue.",
          ],
          [
            true,
            "Tracer la dose cumulée de tous les apports.",
            "Les bolus et perfusions s’additionnent.",
          ],
          [
            false,
            "L’insuffisance rénale devient sans conséquence sous cathéter continu.",
            "Le terrain rénal peut augmenter l’exposition et impose une surveillance du cumul.",
          ],
          [
            false,
            "Fixer le débit uniquement à partir du poids.",
            "Le cœur, l’âge et les protéines modifient la réponse.",
          ],
          [
            false,
            "Ignorer le site car la dose est faible.",
            "La vascularisation influence encore l’absorption.",
          ],
        ],
        "Une analgésie par cathéter est retenue à faible débit avec surveillance en unité postopératoire.",
      ),
    ],
  },
  {
    label: "DP QCM 5 · Suspicion d’allergie en chirurgie dentaire",
    vignette:
      "Une femme de 41 ans consulte avant une extraction dentaire. Dix ans auparavant, après une injection contenant un anesthésique local et de l’adrénaline, elle avait présenté palpitations, pâleur puis malaise bref sans urticaire ni bronchospasme. Elle se dit depuis « allergique à tous les anesthésiques locaux ». Elle rapporte aussi une réaction cutanée à certaines crèmes solaires anciennes.",
    allowed_voies: ["interne"],
    questions: [
      qcm(
        "Quelles hypothèses doivent être distinguées par l’interrogatoire ?",
        src("b00097", "b00098", "b00099"),
        "Le récit peut correspondre à une allergie ester/PABA, un malaise vagal ou une absorption d’adrénaline, mécanismes aux implications différentes.",
        [
          [
            true,
            "Un effet pharmacologique de l’adrénaline peut expliquer des palpitations sans urticaire.",
            "La stimulation sympathique doit être distinguée d’une réaction immunologique.",
          ],
          [
            true,
            "Un malaise vasovagal lié à l’injection.",
            "Pâleur et perte de connaissance brève sans signes cutanés sont compatibles.",
          ],
          [
            false,
            "Une pâleur avec bradycardie est typique d’une allergie IgE.",
            "Ce tableau évoque plutôt un malaise vasovagal.",
          ],
          [
            false,
            "Une toxicité certaine de tous les amides.",
            "Aucun agent ni dose ne sont identifiés dans le récit.",
          ],
          [
            true,
            "Une réaction au PABA ou à un conservateur ancien doit être distinguée d’une allergie à l’amide.",
            "Les esters et certains parahydroxybenzoates peuvent partager ce déterminant allergénique.",
          ],
        ],
      ),
      qcm(
        "Quels éléments renforcent une sensibilisation au PABA ?",
        src("b00098"),
        "Le PABA est à la fois métabolite des esters et composant allergisant de certaines crèmes solaires ; le méthylparaben peut fournir le même motif.",
        [
          [
            false,
            "Une tachycardie liée à l’adrénaline confirme une sensibilisation au PABA.",
            "Cet effet sympathomimétique ne constitue pas une preuve allergique.",
          ],
          [
            false,
            "Une exposition isolée à la lidocaïne sans conservateur prouve ce mécanisme",
            "La lidocaïne est un amide et ne forme pas de PABA.",
          ],
          [
            true,
            "La présence possible de méthylparaben dans la préparation.",
            "Ce conservateur est lui aussi transformé en PABA.",
          ],
          [
            false,
            "La tolérance d’un amide sans conservateur démontre à elle seule une allergie au PABA.",
            "Elle oriente le choix d’une alternative mais ne confirme pas le mécanisme ancien.",
          ],
          [
            false,
            "La survenue d’un bloc sensitif local est une manifestation allergique.",
            "Il s’agit de l’effet pharmacologique recherché.",
          ],
        ],
        "Le dossier ancien mentionne une solution de procaïne conservée par un parahydroxybenzoate.",
      ),
      qcm(
        "Comment envisager une alternative ?",
        src("b00004", "b00035", "b00098"),
        "Une allergie aux esters n’implique pas automatiquement les amides ; une préparation amide sans conservateur doit néanmoins être choisie après évaluation.",
        [
          [
            true,
            "Discuter un amide dans une formulation sans méthylparaben.",
            "La structure et les métabolites allergéniques diffèrent.",
          ],
          [
            false,
            "Interdire définitivement toute molécule contenant une amine.",
            "L’amine tertiaire n’est pas le déterminant du PABA.",
          ],
          [
            true,
            "Vérifier précisément les excipients de la solution.",
            "Un conservateur peut reproduire l’exposition allergénique.",
          ],
          [
            true,
            "Prévoir un environnement capable de traiter une réaction.",
            "L’incertitude diagnostique impose une sécurité adaptée.",
          ],
          [
            false,
            "Choisir obligatoirement un autre ester à dose plus forte.",
            "La même voie métabolique pourrait réexposer au PABA.",
          ],
        ],
        "L’allergologue confirme que les réactions sévères aux amides sont beaucoup plus rares.",
      ),
      qcm(
        "Quels signes pendant le test évoqueraient une réaction non allergique ?",
        src("b00098", "b00099"),
        "Une tachycardie isolée après adrénaline ou une bradycardie avec pâleur vagale se distinguent d’une réaction immune multisystémique.",
        [
          [
            false,
            "Un goût métallique isolé établit une réaction allergique à l’amide.",
            "Ce prodrome est plus compatible avec une exposition systémique toxique.",
          ],
          [
            true,
            "Une pâleur avec bradycardie et malaise.",
            "Le profil est compatible avec un réflexe vagal.",
          ],
          [
            false,
            "Un urticaire diffus avec bronchospasme.",
            "Cette association évoque davantage une hypersensibilité immédiate.",
          ],
          [
            false,
            "Un œdème laryngé progressif.",
            "Il s’agit d’un signe allergique sévère.",
          ],
          [
            true,
            "Une anxiété sans anomalie cutanée ni respiratoire.",
            "Le contexte émotionnel peut produire des symptômes non immuns.",
          ],
        ],
        "Une injection-test contenant une très faible dose d’amide sans conservateur est réalisée sous surveillance.",
      ),
      qcm(
        "Quels signes imposeraient l’arrêt pour une autre raison que l’allergie ?",
        src("b00087"),
        "Goût métallique, paresthésies péribuccales et acouphènes orientent vers une toxicité systémique neurologique.",
        [
          [
            true,
            "Un goût métallique soudain.",
            "Ce prodrome survient lors d’une exposition centrale.",
          ],
          [
            false,
            "La sensation de pression attendue pendant le geste est un prodrome de TSAL.",
            "La pression peut persister malgré une anesthésie différentielle correcte.",
          ],
          [
            false,
            "L’anesthésie de la gencive injectée révèle une toxicité neurologique centrale.",
            "Il s’agit de l’effet local recherché de l’injection.",
          ],
          [
            false,
            "Une analgésie limitée à la dent et à la gencive voisines.",
            "Cet effet territorial correspond au résultat local attendu.",
          ],
          [
            false,
            "Une accélération modérée du pouls immédiatement après l’adrénaline, sans autre signe.",
            "Cet effet sympathomimétique isolé ne constitue pas un prodrome neurologique de TSAL.",
          ],
        ],
        "La patiente ne présente aucun urticaire ; l’équipe rappelle aussi les signes toxiques à surveiller.",
      ),
      qcm(
        "Quelles précautions techniques restent nécessaires avec un amide toléré ?",
        src("b00071", "b00075", "b00076"),
        "L’absence d’allergie ne protège pas de la toxicité : dose, aspiration, fractions et surveillance restent obligatoires.",
        [
          [
            true,
            "Respecter une dose adaptée au site très vascularisé.",
            "La muqueuse buccale peut absorber rapidement le médicament.",
          ],
          [
            true,
            "Aspirer avant l’injection.",
            "Une position intravasculaire peut provoquer une TSAL.",
          ],
          [
            true,
            "Fractionner l’administration.",
            "Une petite quantité permet de repérer un symptôme avant la charge complète.",
          ],
          [
            true,
            "Observer le patient après chaque fraction reste nécessaire.",
            "La surveillance clinique permet d’interrompre l’injection dès un prodrome.",
          ],
          [
            true,
            "Tracer le vasoconstricteur associé.",
            "L’adrénaline peut expliquer certains symptômes autonomes.",
          ],
        ],
        "Le test est négatif et l’extraction est programmée avec une solution amide.",
      ),
      qcm(
        "Quelle conclusion remettre à la patiente ?",
        src("b00098", "b00099"),
        "Le diagnostic doit nommer l’agent et l’excipient en cause plutôt que maintenir une étiquette globale empêchant toute anesthésie locale.",
        [
          [
            false,
            "Un test négatif avec un amide rend sûrs tous les esters et tous les conservateurs.",
            "La tolérance concerne uniquement la formulation testée.",
          ],
          [
            true,
            "Une réaction à l’adrénaline n’est pas une allergie à l’amide.",
            "Le mécanisme catécholaminergique est pharmacologique.",
          ],
          [
            true,
            "La tolérance de la formulation testée doit être documentée.",
            "Elle fournit une alternative précise pour l’avenir.",
          ],
          [
            false,
            "Tous les esters et amides sont désormais prouvés sûrs.",
            "Le test d’une formulation ne valide pas chaque produit.",
          ],
          [
            true,
            "Le PABA ou le conservateur ancien sont les suspects principaux",
            "La procaïne et le méthylparaben convergent vers cet antigène.",
          ],
        ],
        "L’intervention se déroule sans réaction et le dossier doit être corrigé pour les soins futurs.",
      ),
    ],
  },
  {
    label: "DP QCM 6 · Cyanose après anesthésique topique",
    vignette:
      "Un homme de 64 ans reçoit un anesthésique local topique avant une endoscopie. Il prend également un médicament oxydant chronique. Trente minutes plus tard, il devient grisâtre et dyspnéique. La saturométrie reste à 86 % malgré l’oxygène. L’auscultation est normale, la radiographie ne montre pas d’œdème et l’hémodynamique demeure stable.",
    allowed_voies: ["interne"],
    questions: [
      qcm(
        "Quelles causes liées aux anesthésiques locaux doivent être évoquées ?",
        src("b00100", "b00101"),
        "Benzocaïne et prilocaïne oxydent l’hémoglobine ; la lidocaïne peut contribuer lorsque d’autres agents oxydants sont présents.",
        [
          [
            true,
            "Une méthémoglobinémie après benzocaïne topique.",
            "Cet agent est suffisamment toxique pour ne plus être recommandé.",
          ],
          [
            true,
            "Une exposition excessive à la prilocaïne.",
            "La surface et la durée d’application gouvernent son risque.",
          ],
          [
            false,
            "Une cyanose avec PaO2 conservée prouve une allergie au PABA.",
            "Ce profil oriente vers une méthémoglobinémie.",
          ],
          [
            false,
            "Un bloc moteur pharyngé explique à lui seul la cyanose persistante.",
            "Il n’explique pas une saturation résistante avec poumons normaux.",
          ],
          [
            false,
            "Une allergie PABA est certaine sans éruption.",
            "La présentation est oxydative et non immunitaire.",
          ],
        ],
      ),
      qcm(
        "Quelle donnée gazométrique serait la plus discriminante ?",
        src("b00100", "b00101"),
        "Une PaO2 préservée malgré une SpO2 basse révèle que l’oxygène est dans le plasma mais mal lu ou transporté par l’hémoglobine.",
        [
          [
            false,
            "Le diagnostic exige une PaO2 très basse parallèle à la saturation.",
            "L’oxygène dissous peut rester élevé malgré l’altération de l’hémoglobine.",
          ],
          [
            false,
            "Une PaO2 normale exclut toute anomalie du transport par l’hémoglobine.",
            "La gazométrie standard ne mesure pas directement la méthémoglobine.",
          ],
          [
            false,
            "Une PaCO2 légèrement élevée confirme la méthémoglobinémie.",
            "La confirmation repose sur la CO-oxymétrie et non sur une variation isolée du dioxyde de carbone.",
          ],
          [
            false,
            "Une hypercapnie isolée sans cyanose.",
            "Elle ne constitue pas la signature diagnostique.",
          ],
          [
            true,
            "Une gazométrie peut montrer un oxygène dissous correct.",
            "La PaO2 mesure le plasma, pas l’état d’oxydation de l’hème.",
          ],
        ],
        "La gazométrie montre une PaO2 à 184 mmHg sous oxygène tandis que la SpO2 reste à 87 %.",
      ),
      qcm(
        "Quel examen confirme le diagnostic ?",
        src("b00100", "b00101", "b00076"),
        "La CO-oxymétrie sépare les espèces d’hémoglobine et quantifie directement la fraction méthémoglobinée.",
        [
          [
            true,
            "Une CO-oxymétrie sanguine.",
            "Elle mesure la méthémoglobine contrairement à l’oxymètre standard.",
          ],
          [
            false,
            "Un simple nouvel oxymètre de pouls.",
            "Changer de capteur ne distingue pas les pigments.",
          ],
          [
            false,
            "Une mesure du pKa de l’agent.",
            "Cette propriété ne quantifie pas l’oxydation sanguine.",
          ],
          [
            true,
            "Le résultat doit être interprété avec le tableau clinique.",
            "La sévérité dépend aussi des symptômes et du terrain.",
          ],
          [
            false,
            "Une radiographie pulmonaire confirme l’oxydation de l’hème.",
            "L’imagerie peut seulement rechercher une cause pulmonaire concurrente.",
          ],
        ],
        "La peau reste cyanotique et le prélèvement sanguin paraît anormalement brun.",
      ),
      qcm(
        "Quels éléments ont probablement favorisé l’événement ?",
        src("b00101", "b00148", "b00149"),
        "La muqueuse absorbe facilement, une exposition étendue augmente la dose et le médicament chronique fournit une charge oxydante supplémentaire.",
        [
          [
            false,
            "La muqueuse pharyngée absorbe plus lentement que la peau intacte.",
            "La faible barrière muqueuse favorise au contraire une absorption rapide.",
          ],
          [
            false,
            "La faible vascularisation des muqueuses explique un pic tardif",
            "Les muqueuses sont au contraire rapidement absorbantes.",
          ],
          [
            true,
            "Le traitement oxydant concomitant.",
            "Les effets peuvent s’additionner sur l’hémoglobine.",
          ],
          [
            false,
            "La peau intacte aurait absorbé plus vite que la muqueuse.",
            "La peau constitue une barrière bien plus importante.",
          ],
          [
            true,
            "Une surface ou une durée excessive",
            "Les limites du fabricant doivent être strictement respectées.",
          ],
        ],
        "Le compte rendu révèle plusieurs pulvérisations sur une large surface pharyngée.",
      ),
      qcm(
        "Quelles mesures préventives auraient réduit le risque ?",
        src("b00101", "b00148", "b00149"),
        "L’agent à risque doit être évité ou strictement limité, avec recherche des co-oxydants et respect de la dose, de la surface et du temps.",
        [
          [
            false,
            "La prévention repose uniquement sur le poids, indépendamment de la surface et de la durée.",
            "Surface traitée, durée et dose totale doivent être prises en compte.",
          ],
          [
            true,
            "Respecter la surface maximale d’une crème de prilocaïne.",
            "L’exposition cutanée dépend de l’étendue.",
          ],
          [
            true,
            "Rechercher les autres médicaments oxydants.",
            "Le cumul augmente la probabilité de méthémoglobinémie.",
          ],
          [
            false,
            "Se fier uniquement au poids sans considérer la surface.",
            "La voie topique dépend aussi du territoire exposé.",
          ],
          [
            true,
            "Surveiller la saturation après une exposition importante.",
            "Une discordance précoce peut alors être reconnue.",
          ],
        ],
        "L’endoscopiste demande comment sécuriser les prochaines procédures.",
      ),
      qcm(
        "Quelles manifestations relèveraient plutôt d’une TSAL classique ?",
        src("b00087", "b00094"),
        "Prodromes péribuccaux, acouphènes, convulsions et arythmies traduisent un bloc sodique systémique, distinct de l’oxydation de l’hème.",
        [
          [
            false,
            "Une cyanose avec PaO2 préservée constitue un prodrome typique de TSAL.",
            "Cette discordance est caractéristique d’une dysfonction de l’hémoglobine.",
          ],
          [
            true,
            "Une convulsion généralisée précédée de prodromes neurologiques centraux.",
            "Le cerveau est excité à forte concentration systémique.",
          ],
          [
            false,
            "Un sang brun chocolat appartient aux premiers signes neurologiques de TSAL.",
            "Cet aspect oriente vers une méthémoglobinémie.",
          ],
          [
            false,
            "Une PaO2 élevée avec cyanose isolée.",
            "Cette discordance oriente vers la méthémoglobinémie.",
          ],
          [
            false,
            "Un sang brun avec poumons normaux.",
            "Ce signe est compatible avec l’hème oxydé.",
          ],
        ],
        "Le patient ne présente ni paresthésie péribuccale, ni acouphène, ni trouble du rythme.",
      ),
      qcm(
        "Quelles informations doivent être conservées dans le dossier ?",
        src("b00075", "b00101"),
        "L’agent topique, l’exposition, les co-oxydants et la confirmation par CO-oxymétrie doivent prévenir une nouvelle erreur.",
        [
          [
            true,
            "Le nom exact de la préparation utilisée.",
            "Le risque diffère entre benzocaïne, prilocaïne et autres agents.",
          ],
          [
            true,
            "Le nombre de pulvérisations et la durée d’exposition.",
            "La charge topique doit être quantifiée.",
          ],
          [
            true,
            "La liste des médicaments oxydants associés.",
            "Le cumul est un facteur causal majeur.",
          ],
          [
            true,
            "Le taux de méthémoglobine mesuré.",
            "Cette valeur documente la certitude et la gravité.",
          ],
          [
            true,
            "Le traitement administré et le délai de récupération doivent être consignés.",
            "Ces données sécurisent les expositions futures et documentent la réponse thérapeutique.",
          ],
        ],
        "La CO-oxymétrie confirme une méthémoglobinémie et le patient récupère après traitement.",
      ),
    ],
  },
  {
    label: "DP QCM 7 · Dysesthésies après rachianesthésie",
    vignette:
      "Une femme de 39 ans a reçu une rachianesthésie à la lidocaïne pour une chirurgie gynécologique courte. Le geste opératoire et l’accouchement ancien ne comportaient pas de complication neurologique connue. Vingt-quatre heures après, elle décrit des brûlures et des élancements intenses des deux membres inférieurs, sans déficit moteur majeur ni trouble sphinctérien.",
    allowed_voies: ["interne"],
    questions: [
      qcm(
        "Quel diagnostic spécifique est compatible avec cette présentation ?",
        src("b00102", "b00103", "b00104"),
        "Une irritation radiculaire transitoire est typiquement douloureuse, bilatérale, de durée limitée et associée à la lidocaïne intrathécale.",
        [
          [
            false,
            "Une méthémoglobinémie explique des brûlures radiculaires isolées après rachianesthésie.",
            "La méthémoglobinémie provoque une cyanose systémique, non ce syndrome douloureux localisé.",
          ],
          [
            false,
            "Une TSAL cardiovasculaire tardive isolée.",
            "Aucune arythmie ni instabilité systémique n’est présente.",
          ],
          [
            false,
            "Une méthémoglobinémie neurologique.",
            "La saturation et la PaO2 ne sont pas en cause.",
          ],
          [
            true,
            "Le caractère transitoire doit être expliqué sans minimiser la douleur.",
            "Le syndrome dure quelques jours mais peut être intense.",
          ],
          [
            false,
            "Une allergie PABA comme mécanisme principal.",
            "La lidocaïne est un amide et les symptômes ne sont pas immunitaires.",
          ],
        ],
      ),
      qcm(
        "Quelles autres causes doivent néanmoins être recherchées ?",
        src("b00103"),
        "Un déficit après anesthésie régionale reste un diagnostic d’exclusion intégrant chirurgie, position, injection, additifs et maladie préalable.",
        [
          [
            true,
            "Une lésion chirurgicale ou positionnelle.",
            "Le contexte opératoire peut comprimer ou étirer un nerf.",
          ],
          [
            true,
            "Une injection intraneurale ou un traumatisme d’aiguille.",
            "Le trajet technique peut produire une lésion focale.",
          ],
          [
            true,
            "Une toxicité d’un conservateur ou d’un additif.",
            "Les excipients modifient parfois la neurotoxicité.",
          ],
          [
            true,
            "Un hématome ou une compression neuraxiale doivent être exclus lorsque le tableau l’évoque.",
            "Ces causes urgentes nécessitent une imagerie adaptée.",
          ],
          [
            true,
            "Une pathologie neurologique préexistante méconnue.",
            "Le terrain peut se révéler après le stress opératoire.",
          ],
        ],
        "L’examen trouve une sensibilité douloureuse diffuse mais aucun niveau moteur cohérent avec une lésion unique.",
      ),
      qcm(
        "Quels éléments soutiennent le caractère radiculaire transitoire ?",
        src("b00104"),
        "La douleur sans déficit structurel majeur, l’exposition intrathécale à la lidocaïne et l’évolution sur quelques jours forment le profil attendu.",
        [
          [
            true,
            "La lidocaïne a été administrée dans l’espace intrathécal.",
            "Cet agent et cette voie sont particulièrement associés au syndrome.",
          ],
          [
            false,
            "Une imagerie normale garantit une évolution neurologique définitive.",
            "L’absence de compression et la régression clinique soutiennent un syndrome transitoire.",
          ],
          [
            true,
            "L’atteinte concerne les membres inférieurs.",
            "Le territoire radiculaire lombosacré est typique.",
          ],
          [
            false,
            "Une paralysie complète progressive est attendue.",
            "Elle ferait rechercher une complication compressive urgente.",
          ],
          [
            false,
            "Le syndrome impose une évolution définitive.",
            "Il est généralement limité à quelques jours.",
          ],
        ],
        "L’imagerie ne montre ni hématome ni compression et les réflexes restent présents.",
      ),
      qcm(
        "Quels signes obligeraient à élargir en urgence le diagnostic ?",
        src("b00103"),
        "Un déficit moteur progressif, des troubles sphinctériens ou une distribution focale ne cadrent pas avec une simple irritation transitoire.",
        [
          [
            true,
            "Une faiblesse motrice qui s’aggrave.",
            "Une lésion compressive ou chirurgicale doit être exclue rapidement.",
          ],
          [
            true,
            "Une rétention urinaire avec anesthésie en selle.",
            "Ce tableau évoque une atteinte caudale structurale.",
          ],
          [
            false,
            "Des brûlures bilatérales stables sans déficit.",
            "Ce symptôme isolé reste compatible avec l’irritation.",
          ],
          [
            true,
            "Une abolition asymétrique des réflexes.",
            "La focalité oriente vers une lésion nerveuse différente.",
          ],
          [
            true,
            "Un niveau sensitif unilatéral qui progresse impose une réévaluation urgente.",
            "Cette évolution n’appartient pas au tableau stable d’une irritation transitoire.",
          ],
        ],
        "La patiente demande quels symptômes justifieraient une nouvelle évaluation immédiate.",
      ),
      qcm(
        "Quelles propriétés générales expliquent la neurotoxicité locale potentielle ?",
        src("b00102", "b00103"),
        "Une forte concentration au contact du tissu, une injection intraneurale et certains additifs peuvent léser les structures nerveuses.",
        [
          [
            false,
            "Un métabolisme hépatique normal exclut toute neurotoxicité locale.",
            "La concentration au contact du nerf et les additifs agissent indépendamment de la clairance hépatique.",
          ],
          [
            true,
            "Certains agents de conservation peuvent être neurotoxiques.",
            "L’excipient doit être inclus dans l’analyse.",
          ],
          [
            true,
            "Une maladie nerveuse préexistante peut réduire la réserve.",
            "Le cumul des agressions impose une décision individualisée.",
          ],
          [
            false,
            "Seul le métabolisme hépatique explique une lésion locale.",
            "Le contact tissulaire ne dépend pas exclusivement de la clairance.",
          ],
          [
            false,
            "Tout déficit prouve une toxicité chimique.",
            "Les causes chirurgicales et obstétricales sont fréquentes.",
          ],
        ],
        "Le dossier mentionne une formulation sans conservateur et aucune paresthésie pendant la ponction.",
      ),
      qcm(
        "Quelle relation avec le bloc différentiel peut être expliquée ?",
        src("b00065", "b00066", "b00067"),
        "La sensibilité des petites fibres explique l’analgésie avant la motricité, mais ne justifie pas une douleur radiculaire intense postopératoire.",
        [
          [
            false,
            "La motricité doit toujours récupérer avant toute sensibilité",
            "L’ordre peut varier selon les agents et les fibres.",
          ],
          [
            true,
            "Le toucher ou la pression peuvent persister pendant l’analgésie.",
            "Le bloc fonctionnel est différentiel.",
          ],
          [
            true,
            "Une motricité partiellement conservée peut coexister avec une analgésie efficace.",
            "Les grosses fibres motrices nécessitent souvent une concentration de bloc plus élevée.",
          ],
          [
            true,
            "Le syndrome radiculaire est une complication distincte du bloc normal.",
            "Sa douleur survient après la levée de l’anesthésie.",
          ],
          [
            true,
            "La sensation thermique disparaît habituellement avant le toucher et la pression.",
            "Cet ordre illustre la sensibilité différente des catégories de fibres.",
          ],
        ],
        "La patiente se souvient avoir senti la pression sans douleur pendant l’opération.",
      ),
      qcm(
        "Quelles informations transmettre avant une anesthésie future ?",
        src("b00103", "b00104"),
        "L’événement doit être documenté avec agent, voie, durée et bilan, afin d’éviter une réexposition non réfléchie sans interdire toute technique régionale.",
        [
          [
            true,
            "Signaler la lidocaïne intrathécale comme exposition associée.",
            "La relation temporelle est utile pour choisir une alternative.",
          ],
          [
            true,
            "Conserver les résultats de l’examen et de l’imagerie.",
            "Ils montrent l’absence de lésion compressive.",
          ],
          [
            false,
            "Étiqueter une allergie à tous les amides.",
            "Le mécanisme n’est pas immunitaire.",
          ],
          [
            true,
            "Réévaluer au cas par cas toute future anesthésie régionale.",
            "Le bénéfice et les facteurs de risque doivent être pesés.",
          ],
          [
            true,
            "Éviter une étiquette définitive d’allergie en l’absence d’argument immunologique.",
            "Le syndrome neurologique transitoire n’est pas une réaction allergique aux amides.",
          ],
        ],
        "Les symptômes régressent nettement au quatrième jour sans séquelle motrice.",
      ),
    ],
  },
  {
    label: "DP QCM 8 · Analgésie continue chez un patient multicomorbide",
    vignette:
      "Un homme de 69 ans atteint de cirrhose avec hypoalbuminémie, insuffisance cardiaque à bas débit et insuffisance rénale chronique doit subir une chirurgie thoracique. Une analgésie péridurale continue par anesthésique local amide est envisagée pendant quarante-huit heures. Le patient reçoit déjà plusieurs médicaments et le site opératoire est richement vascularisé.",
    allowed_voies: ["interne"],
    questions: [
      qcm(
        "Quels mécanismes cumulent le risque de toxicité ?",
        src("b00115", "b00116", "b00117", "b00118"),
        "Métabolisme hépatique lent, fraction libre accrue, faible perfusion du foie et absorption modifiée s’ajoutent pendant une perfusion prolongée.",
        [
          [
            false,
            "L’insuffisance rénale ne modifie l’exposition qu’aux anesthésiques de type ester.",
            "Elle peut aussi influencer l’absorption et la tolérance des amides.",
          ],
          [
            false,
            "Le bas débit cardiaque accélère la clairance hépatique des amides.",
            "Il réduit la perfusion du foie et ralentit leur élimination.",
          ],
          [
            true,
            "Le bas débit cardiaque diminue la perfusion hépatique.",
            "La clairance dépend de l’arrivée du médicament au foie.",
          ],
          [
            true,
            "L’insuffisance rénale peut augmenter l’absorption.",
            "La circulation hyperdynamique décrite favorise le transfert systémique.",
          ],
          [
            false,
            "Ces comorbidités n’affectent que les esters.",
            "Le projet utilise précisément un amide.",
          ],
        ],
      ),
      qcm(
        "Quelle adaptation initiale est cohérente ?",
        src("b00071", "b00116", "b00117", "b00118"),
        "La plus faible dose efficace, réduite d’au moins 10 à 20 % pour le rein et titrée cliniquement, limite l’accumulation multifacteur.",
        [
          [
            false,
            "Utiliser d’emblée la dose maximale du tableau",
            "Une limite générale ne tient pas compte du terrain.",
          ],
          [
            true,
            "Appliquer au minimum la réduction rénale proposée de 10 à 20 %.",
            "Cette adaptation concerne aussi les perfusions continues.",
          ],
          [
            true,
            "Choisir une concentration permettant un bloc différentiel",
            "L’objectif est l’analgésie avec le moins de bloc moteur possible.",
          ],
          [
            true,
            "Débuter à un débit réduit et surveiller la dose cumulée.",
            "La perfusion continue ajoute progressivement à l’exposition du patient fragile.",
          ],
          [
            false,
            "Ignorer l’hypoalbuminémie puisque la dose est péridurale.",
            "Le médicament absorbé circule avec une fraction libre accrue.",
          ],
        ],
        "La fonction rénale s’aggrave légèrement la veille de l’intervention sans modification du projet chirurgical.",
      ),
      qcm(
        "Quels éléments doivent être suivis pendant la perfusion ?",
        src("b00084", "b00087", "b00116", "b00117"),
        "Une technique continue peut produire des symptômes retardés : dose cumulée, neurologie, rythme, pression et fonction d’élimination doivent être réévalués.",
        [
          [
            true,
            "La dose totale délivrée par le cathéter.",
            "L’accumulation dépend de la charge au fil des heures.",
          ],
          [
            false,
            "Une analgésie stable exclut toute toxicité tardive pendant la perfusion.",
            "L’accumulation peut faire apparaître des prodromes après plusieurs heures.",
          ],
          [
            true,
            "Le rythme et la pression artérielle.",
            "La cardiotoxicité peut suivre la phase neurologique.",
          ],
          [
            true,
            "L’évolution du foie et du débit cardiaque.",
            "La clairance peut encore diminuer pendant le séjour.",
          ],
          [
            false,
            "La seule intensité douloureuse une fois par jour.",
            "Une surveillance aussi limitée manquerait les signes toxiques.",
          ],
        ],
        "Après douze heures, l’analgésie est correcte et le patient reste conscient en unité monitorée.",
      ),
      qcm(
        "Comment analyser ces nouveaux symptômes ?",
        src("b00087"),
        "L’association de prodromes sensoriels et d’un trouble de l’élocution sous perfusion amide évoque une TSAL progressive par accumulation.",
        [
          [
            true,
            "La perfusion doit être arrêtée immédiatement.",
            "Poursuivre augmenterait la concentration neurologique.",
          ],
          [
            false,
            "Une allergie PABA est l’explication la plus logique",
            "Le patient reçoit un amide et ne présente aucun signe immunitaire.",
          ],
          [
            false,
            "Un bloc péridural efficace explique le goût métallique.",
            "Ce symptôme est systémique et non segmentaire.",
          ],
          [
            true,
            "Oxygénation et ventilation doivent être préparées.",
            "Une convulsion peut survenir dans la progression.",
          ],
          [
            true,
            "La survenue tardive de prodromes sous perfusion suggère une accumulation systémique.",
            "Le cumul et la baisse de clairance expliquent l’apparition après vingt heures.",
          ],
        ],
        "À la vingtième heure, il décrit un goût métallique, des acouphènes puis un discours ralenti.",
      ),
      qcm(
        "Quelles mesures empêchent la progression ?",
        src("b00087", "b00088", "b00092", "b00163"),
        "L’arrêt, le support respiratoire, le traitement rapide d’une convulsion et les lipides si la forme s’aggrave constituent la réponse structurée.",
        [
          [
            true,
            "Appeler de l’aide et monitorer en continu.",
            "Le tableau peut progresser vers une atteinte cardiaque.",
          ],
          [
            true,
            "Oxygéner et éviter l’hypercapnie.",
            "L’acidose accroît la fraction active et la cardiotoxicité.",
          ],
          [
            true,
            "Préparer une benzodiazépine.",
            "Elle interrompra une éventuelle convulsion.",
          ],
          [
            true,
            "Rendre l’émulsion lipidique 20 % immédiatement disponible.",
            "La gravité potentielle justifie cette anticipation.",
          ],
          [
            true,
            "Corriger rapidement acidose et hypercapnie limite l’aggravation de la toxicité.",
            "Ces troubles majorent la fraction active et la cardiotoxicité.",
          ],
        ],
        "La perfusion est coupée avant la convulsion, mais des fasciculations apparaissent.",
      ),
      qcm(
        "Quelle place pourrait avoir l’adrénaline dans une stratégie future ?",
        src("b00138", "b00139", "b00140", "b00141"),
        "La vasoconstriction réduit le pic et prolonge l’effet, mais le terrain cardiovasculaire et les territoires terminaux imposent une individualisation.",
        [
          [
            false,
            "L’adrénaline prévient toute toxicité même lors d’une injection intravasculaire.",
            "Elle ralentit l’absorption locale sans protéger d’un passage vasculaire direct.",
          ],
          [
            false,
            "L’ajout d’adrénaline remplace le calcul de dose maximale.",
            "Les fractions de dose et le terrain restent déterminants.",
          ],
          [
            false,
            "Elle élimine toute toxicité liée à la perfusion.",
            "L’accumulation reste possible malgré un pic moindre.",
          ],
          [
            true,
            "Le terrain cardiaque doit être pris en compte.",
            "Les effets catécholaminergiques ne sont pas neutres.",
          ],
          [
            false,
            "Elle autorise une dose totale illimitée.",
            "La charge systémique garde une limite.",
          ],
        ],
        "Les symptômes régressent après l’arrêt et l’équipe discute une future technique à dose réduite avec adjuvant.",
      ),
      qcm(
        "Quelles règles s’appliqueraient si deux agents étaient mélangés ?",
        src("b00143", "b00144"),
        "Un mélange peut modifier latence et durée mais impose l’addition des fractions toxiques, particulièrement dangereuse sur ce terrain.",
        [
          [
            true,
            "Additionner les fractions de dose maximale de chaque agent.",
            "Deux demi-doses représentent déjà une charge combinée complète.",
          ],
          [
            true,
            "Ne pas considérer chaque plafond séparément disponible.",
            "La toxicité commune interdit deux doses entières.",
          ],
          [
            true,
            "Documenter la concentration et la quantité totale de chaque agent reste nécessaire.",
            "Cette traçabilité permet de calculer l’exposition combinée et la dose restante disponible.",
          ],
          [
            true,
            "Réévaluer la pertinence d’un mélange face aux comorbidités.",
            "Une stratégie plus complexe peut réduire la sécurité.",
          ],
          [
            false,
            "Choisir le mélange sans tenir compte du cathéter continu.",
            "La perfusion prolonge et cumule l’exposition.",
          ],
        ],
        "Le patient récupère complètement et l’anesthésiste analyse les options pour une intervention ultérieure.",
      ),
    ],
  },
];

const QROC_SERIES = [
  {
    label: "QROC — Série 1 · Structure et métabolisme",
    allowed_voies: ["externe"],
    questions: [
      qroc(
        "Quelle liaison distingue les deux familles d’anesthésiques locaux ?",
        "Liaison ester ou liaison amide",
        src("b00008"),
        "La chaîne intermédiaire détermine la famille et surtout la voie métabolique.",
      ),
      qroc(
        "Quelle enzyme plasmatique hydrolyse les esters ?",
        "Pseudo-cholinestérase|Butyrylcholinestérase plasmatique",
        src("b00035"),
        "Une activité enzymatique déficiente peut prolonger l’exposition à cette famille.",
      ),
      qroc(
        "Quel système métabolise principalement les amides ?",
        "Foie par cytochrome P450|Métabolisme hépatique",
        src("b00035"),
        "Les répétitions deviennent risquées lorsque la fonction hépatique est sévèrement altérée.",
      ),
      qroc(
        "Comment nomme-t-on deux structures moléculaires en miroir ?",
        "Énantiomères",
        src("b00032", "b00033"),
        "La chiralité permet des interactions biologiques différentes malgré une formule identique.",
      ),
      qroc(
        "Quel anesthésique local amide a été synthétisé en 1943 ?",
        "Lidocaïne",
        src("b00004"),
        "La synthèse de Lôfgren a marqué le développement moderne des amides.",
      ),
    ],
  },
  {
    label: "QROC — Série 2 · Ionisation",
    allowed_voies: ["externe"],
    questions: [
      qroc(
        "À quel état des formes correspond le pKa ?",
        "Concentrations ionisée et non ionisée égales",
        src("b00016", "b00017"),
        "Le pKa est le pH précis où les deux espèces sont en proportions identiques.",
      ),
      qroc(
        "Quelle forme assure le passage membranaire ?",
        "Forme non ionisée|Forme base|Forme neutre",
        src("b00017", "b00157"),
        "Sa liposolubilité permet de traverser la bicouche et les enveloppes nerveuses.",
      ),
      qroc(
        "Quelle forme produit le bloc du canal sodique ?",
        "Forme ionisée|Forme cationique",
        src("b00017", "b00157"),
        "Après reprotonation intracellulaire, le cation se fixe dans le canal.",
      ),
      qroc(
        "Quel facteur modifie par dix le rapport des formes ?",
        "Une variation d’une unité de pH",
        src("b00023"),
        "La relation logarithmique de Henderson-Hasselbalch explique cette forte variation.",
      ),
      qroc(
        "Pourquoi un abcès diminue-t-il l’efficacité du bloc ?",
        "Le pH acide réduit la forme neutre diffusible",
        src("b00024", "b00025", "b00026"),
        "Le médicament reste chargé hors de la fibre et atteint moins bien sa cible.",
      ),
    ],
  },
  {
    label: "QROC — Série 3 · Canal et fibres",
    allowed_voies: ["externe"],
    questions: [
      qroc(
        "Quel courant ionique déclenche le potentiel d’action ?",
        "Entrée de sodium|Courant sodique entrant",
        src("b00046", "b00047"),
        "L’ouverture des canaux sodiques franchit le seuil de dépolarisation.",
      ),
      qroc(
        "Quelle sous-unité forme l’élément fonctionnel principal du canal ?",
        "Sous-unité alpha",
        src("b00049"),
        "Les sous-unités bêta ont surtout une fonction modulatrice.",
      ),
      qroc(
        "Quelle cellule produit la myéline périphérique ?",
        "Cellule de Schwann",
        src("b00050", "b00051"),
        "Elle isole l’axone et organise la conduction saltatoire entre les nœuds.",
      ),
      qroc(
        "Quelles fibres sont les plus facilement bloquées ?",
        "Les petites fibres, notamment C",
        src("b00053"),
        "Le diamètre et la myélinisation modulent la concentration minimale de bloc.",
      ),
      qroc(
        "Comment nomme-t-on le renforcement du bloc à haute fréquence ?",
        "Bloc phasique|Bloc dépendant de l’usage",
        src("b00068", "b00069"),
        "La stimulation expose davantage de canaux ouverts ou inactivés au médicament.",
      ),
    ],
  },
  {
    label: "QROC — Série 4 · Dose et site",
    allowed_voies: ["externe"],
    questions: [
      qroc(
        "Quel facteur local gouverne principalement l’absorption systémique ?",
        "La vascularisation du site d’injection",
        src("b00071", "b00125"),
        "Un débit sanguin élevé transporte rapidement le médicament vers le plasma.",
      ),
      qroc(
        "Quelle erreur explique une toxicité immédiate malgré une dose correcte ?",
        "Injection intravasculaire accidentelle",
        src("b00071", "b00076"),
        "Le bolus systémique franchit les seuils toxiques avant tout effet local.",
      ),
      qroc(
        "Quels quatre critères cliniques caractérisent le choix d’un agent ?",
        "Latence|Durée|Puissance|Bloc différentiel",
        src("b00073"),
        "Ces propriétés doivent être confrontées au patient, au site et à la technique.",
      ),
      qroc(
        "De combien le pic peut-il varier selon le site ?",
        "Du simple au triple ou davantage",
        src("b00071"),
        "La dose seule ne permet donc pas de prédire la concentration plasmatique.",
      ),
      qroc(
        "L’échographie supprime-t-elle le risque de TSAL ?",
        "Non",
        src("b00084"),
        "Elle diminue les erreurs de dépôt mais ne garantit jamais une position extravasculaire.",
      ),
    ],
  },
  {
    label: "QROC — Série 5 · Toxicité neurologique",
    allowed_voies: ["externe"],
    questions: [
      qroc(
        "Citez deux prodromes sensitifs d’une TSAL.",
        "Paresthésies péribuccales|Goût métallique",
        src("b00087"),
        "Ces signes précoces doivent interrompre immédiatement toute injection.",
      ),
      qroc(
        "Quel symptôme auditif annonce une progression toxique ?",
        "Acouphènes|Bourdonnements d’oreilles",
        src("b00087"),
        "Il accompagne souvent étourdissements et altération de l’élocution.",
      ),
      qroc(
        "Quel anticonvulsivant est recommandé dans la TSAL ?",
        "Une benzodiazépine",
        src("b00087", "b00088"),
        "Le traitement s’associe à une oxygénation et une ventilation efficaces.",
      ),
      qroc(
        "Quelle concentration de lidocaïne évoque la neurotoxicité sévère ?",
        "Environ 12 µg/mL",
        src("b00094", "b00095"),
        "Le seuil neurologique précède nettement la dépression cardiovasculaire.",
      ),
      qroc(
        "Quelle complication peut être la première après un bolus vasculaire massif ?",
        "Convulsion|Arythmie grave",
        src("b00087"),
        "Une montée très rapide peut supprimer toute phase prodromique verbalisable.",
      ),
    ],
  },
  {
    label: "QROC — Série 6 · Toxicité cardiaque",
    allowed_voies: ["externe"],
    questions: [
      qroc(
        "Quelle concentration de lidocaïne déprime le système cardiovasculaire ?",
        "Environ 22 µg/mL",
        src("b00094", "b00095"),
        "Cette valeur est supérieure au seuil neurologique de la lidocaïne.",
      ),
      qroc(
        "Quelle est la marge toxique neuro-cardiaque de la bupivacaïne ?",
        "Environ 4 puis 6 µg/mL",
        src("b00094"),
        "L’écart très étroit explique la gravité d’une intoxication brutale.",
      ),
      qroc(
        "Quels deux facteurs métaboliques aggravent la cardiotoxicité ?",
        "Hypoxémie et acidose",
        src("b00094", "b00162", "b00163"),
        "Le contrôle de l’oxygénation et de la ventilation est donc prioritaire.",
      ),
      qroc(
        "Quelle concentration d’émulsion lipidique traite une TSAL grave ?",
        "20 %",
        src("b00088", "b00092"),
        "Le bolus puis la perfusion s’ajoutent aux manœuvres de réanimation classiques.",
      ),
      qroc(
        "Quel antiarythmique privilégier pendant une TSAL ?",
        "Amiodarone",
        src("b00088"),
        "Les bloqueurs sodiques comme la lidocaïne doivent être évités.",
      ),
    ],
  },
  {
    label: "QROC — Série 7 · Complications spécifiques",
    allowed_voies: ["externe"],
    questions: [
      qroc(
        "Quel métabolite est responsable de l’allergie aux esters ?",
        "PABA|Acide para-amino-benzoïque",
        src("b00098"),
        "Le même allergène peut être rencontré dans certains anciens écrans solaires.",
      ),
      qroc(
        "Quel conservateur peut aussi conduire au PABA ?",
        "Méthylparaben|Parahydroxybenzoate",
        src("b00098"),
        "L’excipient doit être distingué de la molécule anesthésique elle-même.",
      ),
      qroc(
        "Quelle discordance suggère une méthémoglobinémie ?",
        "SpO2 < 90 % avec PaO2 > 70 mmHg",
        src("b00101"),
        "L’oxygène dissous reste correct malgré une hémoglobine oxydée.",
      ),
      qroc(
        "Quel examen mesure directement la méthémoglobine ?",
        "CO-oxymétrie",
        src("b00101"),
        "L’oxymétrie de pouls standard ne distingue pas les espèces d’hémoglobine.",
      ),
      qroc(
        "Quel syndrome suit surtout la lidocaïne intrathécale ?",
        "Irritation radiculaire transitoire",
        src("b00104"),
        "Il associe brûlures et dysesthésies des membres inférieurs pendant quelques jours.",
      ),
    ],
  },
  {
    label: "QROC — Série 8 · Terrain et adjuvants",
    allowed_voies: ["externe"],
    questions: [
      qroc(
        "Quelle réduction est proposée en insuffisance rénale ?",
        "10 à 20 %",
        src("b00118"),
        "Elle s’applique aux injections uniques, répétées et aux perfusions continues.",
      ),
      qroc(
        "Quelle concentration de bupivacaïne faut-il proscrire en péridurale obstétricale ?",
        "0,75 %",
        src("b00113", "b00114"),
        "La grossesse augmente la sensibilité et la fraction libre du médicament.",
      ),
      qroc(
        "Quel adjuvant ralentit l’absorption par vasoconstriction ?",
        "Adrénaline",
        src("b00138", "b00139", "b00140"),
        "Le pic plasmatique baisse tandis que la durée locale peut augmenter.",
      ),
      qroc(
        "Comment s’additionne la toxicité de deux anesthésiques locaux ?",
        "Addition des fractions de leurs doses maximales",
        src("b00144"),
        "Deux demi-doses de plafonds différents représentent une charge totale complète.",
      ),
      qroc(
        "Quelle durée visent les formulations liposomales prolongées ?",
        "72 à 96 heures",
        src("b00151", "b00152"),
        "Le véhicule doit prolonger le relargage sans ajouter une toxicité excessive.",
      ),
    ],
  },
];

const DP_QROC_SERIES = [
  {
    label: "DP QROC 1 · Crème anesthésiante et discordance de saturation",
    vignette:
      "Un enfant doit bénéficier d’une ponction veineuse après application d’une crème anesthésiante locale. La crème a été étalée sur une surface plus large que prévu et laissée plusieurs heures sous occlusion. L’enfant reçoit par ailleurs un traitement oxydant. Après le geste, il devient grisâtre sans détresse ventilatoire franche et la saturation reste basse malgré l’oxygène.",
    allowed_voies: ["externe"],
    questions: [
      qroc(
        "Quelle complication doit être évoquée en priorité ?",
        "Méthémoglobinémie",
        src("b00100", "b00101"),
        "L’exposition topique prolongée et le terrain oxydant rendent cette complication plausible.",
      ),
      qroc(
        "Quel anesthésique local de crème est classiquement impliqué ?",
        "Prilocaïne",
        src("b00101", "b00148", "b00149"),
        "La prilocaïne topique peut oxyder l’hémoglobine si les limites d’emploi sont dépassées.",
        "La boîte indique que la préparation contient de la prilocaïne.",
      ),
      qroc(
        "Quelle donnée gazométrique renforce le diagnostic ?",
        "PaO2 > 70 mmHg malgré SpO2 < 90 %",
        src("b00100", "b00101"),
        "Cette discordance distingue une hémoglobine oxydée d’une hypoxémie pulmonaire.",
        "Sous oxygène, la SpO2 est à 87 % alors que la PaO2 atteint 160 mmHg.",
      ),
      qroc(
        "Quel examen doit confirmer l’hypothèse ?",
        "CO-oxymétrie",
        src("b00100", "b00101", "b00076"),
        "La mesure sépare directement oxyhémoglobine, méthémoglobine et autres espèces.",
        "Le prélèvement artériel présente une coloration brunâtre persistante.",
      ),
      qroc(
        "Quel facteur technique a majoré l’exposition ?",
        "Surface et durée d’application excessives",
        src("b00101", "b00148", "b00149"),
        "La voie topique exige le respect simultané de la dose, de la surface et du temps.",
        "L’équipe retrouve une application étendue maintenue trois heures sous occlusion.",
      ),
      qroc(
        "Quel facteur médicamenteux a augmenté le risque ?",
        "Association à un autre agent oxydant",
        src("b00101"),
        "Les charges oxydantes se cumulent sur les capacités de réduction de l’hémoglobine.",
        "Le traitement chronique est confirmé comme potentiellement oxydant.",
      ),
      qroc(
        "Quelle information doit prévenir une récidive ?",
        "Respect strict des limites de dose, surface et durée",
        src("b00075", "b00101"),
        "La préparation et les co-médicaments doivent être tracés avant toute nouvelle application.",
        "La CO-oxymétrie confirme le diagnostic et l’enfant récupère sans séquelle.",
      ),
    ],
  },
  {
    label: "DP QROC 2 · Bloc intercostal et pic plasmatique",
    vignette:
      "Une femme de 56 ans doit recevoir plusieurs blocs intercostaux pour chirurgie thoracique. Elle est consciente, sans sédation profonde, et sa fonction hépatique est normale. L’anesthésiste prévoit une dose totale proche de la limite générale du médicament. L’équipe dispose d’un échographe, d’un monitorage cardiaque et d’une trousse de traitement de la toxicité systémique.",
    allowed_voies: ["externe"],
    questions: [
      qroc(
        "Quel facteur rend ce site particulièrement exposant ?",
        "Sa forte vascularisation",
        src("b00071", "b00125"),
        "Un débit sanguin local élevé produit rapidement un pic plasmatique important.",
      ),
      qroc(
        "La dose maximale générale garantit-elle l’absence de toxicité ?",
        "Non",
        src("b00071"),
        "Le site et une éventuelle injection vasculaire peuvent dépasser la sécurité attendue.",
        "La dose calculée reste sous le plafond imprimé sur la fiche du médicament.",
      ),
      qroc(
        "Quel mode d’administration réduit la brutalité du pic ?",
        "Injection lente et fractionnée",
        src("b00075", "b00076", "b00088"),
        "Des fractions observées permettent d’interrompre avant l’administration de toute la charge.",
        "Le bloc est réalisé niveau par niveau sous visualisation échographique.",
      ),
      qroc(
        "Quel premier prodrome doit faire arrêter l’injection ?",
        "Goût métallique|Paresthésies péribuccales",
        src("b00087"),
        "Ces symptômes indiquent une concentration neurologique déjà significative.",
        "Après une nouvelle fraction, la patiente décrit un goût métallique.",
      ),
      qroc(
        "Quelle classe traite une convulsion si elle survient ?",
        "Benzodiazépine",
        src("b00087", "b00088"),
        "Le contrôle convulsif s’associe à une oxygénation et une ventilation efficaces.",
        "Des fasciculations diffuses apparaissent malgré l’arrêt immédiat.",
      ),
      qroc(
        "Quel traitement spécifique doit être préparé ?",
        "Émulsion lipidique 20 %",
        src("b00088", "b00092"),
        "La forme neurologique sévère peut progresser vers l’arrêt cardiaque.",
        "L’équipe ouvre la trousse de toxicité systémique.",
      ),
      qroc(
        "Quel enseignement modifiera la prochaine stratégie ?",
        "Réduire la dose dans les sites très vascularisés",
        src("b00071", "b00125"),
        "La limite doit être contextualisée selon le site et non simplement appliquée au poids.",
        "La patiente récupère sans atteinte cardiovasculaire après surveillance.",
      ),
    ],
  },
  {
    label: "DP QROC 3 · Perfusion périnerveuse et cirrhose",
    vignette:
      "Un homme de 61 ans atteint de cirrhose décompensée et d’hypoalbuminémie reçoit une perfusion continue de ropivacaïne par cathéter après chirurgie du genou. La fonction rénale est stable, mais le débit cardiaque diminue pendant la nuit. Le bloc initial était efficace à faible concentration et le patient est surveillé dans une unité postopératoire.",
    allowed_voies: ["externe"],
    questions: [
      qroc(
        "Quel métabolisme devient limitant chez ce patient ?",
        "Métabolisme hépatique des amides",
        src("b00035", "b00116"),
        "La ropivacaïne appartient aux amides transformés par le foie.",
      ),
      qroc(
        "Quel effet a l’hypoalbuminémie sur le médicament ?",
        "Augmentation de la fraction libre",
        src("b00116"),
        "Une moindre liaison protéique augmente la part pharmacologiquement disponible.",
        "L’albuminémie chute encore au premier jour postopératoire.",
      ),
      qroc(
        "Pourquoi le bas débit ralentit-il l’élimination ?",
        "Il réduit la perfusion hépatique",
        src("b00117"),
        "Moins de médicament atteint les enzymes hépatiques par unité de temps.",
        "Le débit cardiaque baisse avec l’aggravation de l’insuffisance cardiaque.",
      ),
      qroc(
        "Quel symptôme subjectif évoque une accumulation toxique ?",
        "Acouphènes|Goût métallique",
        src("b00087"),
        "Ces prodromes neurologiques précèdent souvent les manifestations sévères.",
        "Le patient signale des bourdonnements d’oreilles puis un goût métallique.",
      ),
      qroc(
        "Quelle conduite immédiate adopter sur la perfusion ?",
        "L’arrêter",
        src("b00087", "b00116"),
        "Toute administration supplémentaire aggraverait une concentration déjà croissante.",
        "La pompe a délivré le débit prescrit pendant vingt heures.",
      ),
      qroc(
        "Quel support doit être préparé si des fasciculations apparaissent ?",
        "Oxygénation, ventilation et benzodiazépine",
        src("b00087", "b00088"),
        "L’hypoxie et l’acidose doivent être évitées pendant une éventuelle convulsion.",
        "Des tremblements fins apparaissent avant toute perte de conscience.",
      ),
      qroc(
        "Quelle règle guidera une future perfusion ?",
        "Dose réduite et titrée avec surveillance de la charge cumulée",
        src("b00071", "b00116", "b00117"),
        "Le foie, la fraction libre et le débit cardiaque doivent être réévalués ensemble.",
        "Les symptômes disparaissent après l’arrêt sans progression cardiovasculaire.",
      ),
    ],
  },
  {
    label: "DP QROC 4 · Rachianesthésie obstétricale",
    vignette:
      "Une femme enceinte à terme doit subir une césarienne sous rachianesthésie. Elle présente une albuminémie physiologiquement basse, sans cardiopathie, et n’a reçu aucun anesthésique local auparavant. L’équipe prépare une solution hyperbare et souhaite éviter une extension excessive du bloc. La patiente restera consciente sous monitorage complet.",
    allowed_voies: ["externe"],
    questions: [
      qroc(
        "Pourquoi la dose doit-elle être réduite pendant la grossesse ?",
        "Sensibilité nerveuse accrue et fraction libre augmentée",
        src("b00112", "b00113"),
        "La physiologie et l’anatomie neuraxiale amplifient l’effet d’une même dose.",
      ),
      qroc(
        "Quelle concentration est interdite en péridurale obstétricale ?",
        "Bupivacaïne 0,75 %",
        src("b00113", "b00114"),
        "Cette formulation expose la femme enceinte à une cardiotoxicité excessive.",
        "Le chariot contient plusieurs concentrations de bupivacaïne.",
      ),
      qroc(
        "Quel paramètre de solution influence la diffusion rachidienne ?",
        "La baricité|La densité relative",
        src("b00130", "b00136", "b00137"),
        "Une solution hyperbare migre en fonction de la gravité et de la position.",
        "La solution retenue est hyperbare et la table peut être inclinée.",
      ),
      qroc(
        "Quelle modalité sensitive peut persister malgré une analgésie correcte ?",
        "La pression|Le toucher",
        src("b00065", "b00067"),
        "Le bloc différentiel supprime la douleur avant certaines sensations tactiles.",
        "Au début de l’intervention, la patiente sent une pression sans douleur.",
      ),
      qroc(
        "Quel symptôme ferait suspecter une TSAL plutôt que le bloc attendu ?",
        "Goût métallique|Acouphènes",
        src("b00087"),
        "Un prodrome cérébral n’appartient pas à la distribution neuraxiale segmentaire.",
        "La patiente demande quels signes elle doit signaler immédiatement.",
      ),
      qroc(
        "Quel adjuvant opioïde peut compléter la rachianesthésie ?",
        "Fentanyl|Morphine",
        src("b00138", "b00142"),
        "Un opioïde neuraxial renforce l’analgésie sans augmenter la charge locale.",
        "La durée chirurgicale est réévaluée à deux heures.",
      ),
      qroc(
        "Quel principe prévaut avant toute dose complémentaire ?",
        "Tenir compte de la charge cumulée et du terrain obstétrical",
        src("b00071", "b00113"),
        "La sensibilité maternelle interdit une répétition automatique fondée sur le seul poids.",
        "Le bloc reste suffisant et aucune injection additionnelle n’est finalement nécessaire.",
      ),
    ],
  },
  {
    label: "DP QROC 5 · Bloc veineux sous tourniquet",
    vignette:
      "Un homme de 45 ans doit subir une chirurgie courte de la main par bloc veineux de Bier. La lidocaïne est injectée dans le membre isolé par un tourniquet fonctionnel. Le patient est conscient, le rythme cardiaque est surveillé et le matériel de ventilation est disponible. L’équipe rappelle que la sécurité dépend du maintien de l’isolement vasculaire.",
    allowed_voies: ["externe"],
    questions: [
      qroc(
        "Quel dispositif empêche le passage systémique immédiat ?",
        "Le tourniquet",
        src("b00145"),
        "Il isole temporairement le compartiment veineux du membre.",
      ),
      qroc(
        "Quel anesthésique local est utilisé dans cette technique décrite ?",
        "Lidocaïne",
        src("b00145"),
        "La lidocaïne est l’agent cité pour le bloc intraveineux régional.",
        "La solution a été injectée après exsanguination du membre.",
      ),
      qroc(
        "Quel incident ferait craindre un bolus systémique ?",
        "Défaillance ou libération prématurée du tourniquet",
        src("b00076", "b00145"),
        "La charge régionale rejoindrait brutalement la circulation générale.",
        "Une baisse inattendue de pression du brassard est signalée.",
      ),
      qroc(
        "Quel prodrome neurologique rechercher immédiatement ?",
        "Paresthésies péribuccales|Goût métallique",
        src("b00087"),
        "Ces signes précèdent souvent les manifestations convulsives de la lidocaïne.",
        "Le patient est interrogé pendant la remise en pression du tourniquet.",
      ),
      qroc(
        "Quelle concentration de lidocaïne correspond à la neurotoxicité sévère ?",
        "Environ 12 µg/mL",
        src("b00094", "b00095"),
        "La dépression cardiovasculaire survient plus haut, vers 22 µg/mL.",
        "Le monitorage reste stable sans symptôme subjectif.",
      ),
      qroc(
        "Quel traitement doit être disponible si une convulsion survient ?",
        "Benzodiazépine et émulsion lipidique 20 %",
        src("b00087", "b00088", "b00092"),
        "Le support respiratoire complète ces deux traitements spécifiques.",
        "La chirurgie se termine et l’équipe prépare la levée contrôlée du tourniquet.",
      ),
      qroc(
        "Quelle donnée doit être tracée après le geste ?",
        "Dose totale de lidocaïne et durée du tourniquet",
        src("b00071", "b00145"),
        "La chronologie permet d’évaluer la charge libérée et le risque systémique.",
        "Le patient reste asymptomatique après la reperfusion progressive.",
      ),
    ],
  },
  {
    label: "DP QROC 6 · Mélange pour bloc périphérique",
    vignette:
      "Une patiente de 50 ans doit recevoir un bloc du plexus brachial pour une intervention de durée intermédiaire. L’anesthésiste envisage de mélanger un agent à installation rapide avec un agent de longue durée. La patiente n’a pas de comorbidité, mais le site est proche de structures vasculaires et la dose de chaque produit serait importante si elle était utilisée seule.",
    allowed_voies: ["externe"],
    questions: [
      qroc(
        "Quel bénéfice théorique motive le mélange ?",
        "Début rapide et durée prolongée",
        src("b00143", "b00144"),
        "L’intention est de réunir les caractéristiques cliniques de deux agents.",
      ),
      qroc(
        "Le profil obtenu est-il forcément celui des deux meilleurs extrêmes ?",
        "Non, il peut être intermédiaire",
        src("b00144"),
        "Le mélange ne garantit ni la latence la plus courte ni la durée la plus longue.",
        "L’équipe compare les propriétés attendues avant de préparer les seringues.",
      ),
      qroc(
        "Comment calculer la charge toxique combinée ?",
        "Additionner les fractions des doses maximales",
        src("b00144"),
        "Deux fractions de 50 % consomment déjà la totalité de la marge globale.",
        "Chaque seringue contient la moitié de la dose maximale de son agent.",
      ),
      qroc(
        "Quel risque technique reste indépendant du calcul ?",
        "Injection intravasculaire accidentelle",
        src("b00071", "b00076"),
        "Un trajet vasculaire transforme même une dose raisonnable en pic brutal.",
        "L’échographie montre le vaisseau à quelques millimètres de la pointe.",
      ),
      qroc(
        "Quelle méthode d’injection réduit ce risque ?",
        "Aspiration et injection fractionnée",
        src("b00075", "b00088"),
        "La surveillance entre les fractions permet de repérer précocement un prodrome.",
        "La solution est administrée en petites portions sous visualisation.",
      ),
      qroc(
        "Quel symptôme impose l’arrêt immédiat ?",
        "Goût métallique|Acouphènes",
        src("b00087"),
        "Ces manifestations traduisent une exposition neurologique systémique.",
        "La patiente reste consciente et signale soudain un goût inhabituel.",
      ),
      qroc(
        "Quelle règle conclut l’analyse du mélange ?",
        "Ne jamais additionner deux plafonds complets",
        src("b00144"),
        "La toxicité commune impose un calcul fractionnel et une justification clinique.",
        "L’injection est arrêtée sans progression après le prodrome.",
      ),
    ],
  },
  {
    label: "DP QROC 7 · Dysfonction périorbitaire après bloc",
    vignette:
      "Une patiente de 72 ans reçoit un bloc rétrobulbaire pour chirurgie ophtalmologique. Le geste se déroule sans injection intravasculaire ni signe neurologique central. Dans les jours suivants, elle présente une faiblesse des muscles périorbitaires sans déficit sensitif étendu ni signe de compression. L’imagerie et l’examen chirurgical ne montrent pas de lésion mécanique évidente.",
    allowed_voies: ["externe"],
    questions: [
      qroc(
        "Quelle complication locale est évoquée ?",
        "Myotoxicité de l’anesthésique local",
        src("b00105", "b00106"),
        "La dysfonction périorbitaire est la manifestation clinique la plus évidente décrite.",
      ),
      qroc(
        "Quel mécanisme tissulaire a été observé en laboratoire ?",
        "Myonécrose après injection intramusculaire",
        src("b00105", "b00106"),
        "Le contact direct peut léser les fibres musculaires malgré une clinique souvent discrète.",
        "Le trajet de l’aiguille a traversé les muscles périoculaires.",
      ),
      qroc(
        "Quel agent est le plus myotoxique dans le classement cité ?",
        "Bupivacaïne",
        src("b00077", "b00106"),
        "Elle précède lidocaïne et tétracaïne, puis procaïne.",
        "Le produit utilisé était de la bupivacaïne.",
      ),
      qroc(
        "Quel adjuvant peut augmenter la myotoxicité de la lidocaïne ?",
        "Adrénaline",
        src("b00106", "b00138", "b00139"),
        "La vasoconstriction prolonge l’exposition musculaire locale.",
        "L’équipe analyse aussi la composition des solutions possibles.",
      ),
      qroc(
        "L’évolution est-elle habituellement irréversible ?",
        "Non, elle est habituellement réversible",
        src("b00106", "b00107"),
        "La dysfonction périorbitaire décrite récupère généralement avec le temps.",
        "La force commence à revenir au contrôle suivant.",
      ),
      qroc(
        "Pourquoi faut-il malgré tout rechercher d’autres causes ?",
        "Un déficit après bloc est un diagnostic d’exclusion",
        src("b00103"),
        "Chirurgie, injection, compression et maladie préexistante restent possibles.",
        "Le bilan exclut une atteinte du nerf optique et une complication chirurgicale.",
      ),
      qroc(
        "Quelle information doit figurer dans le dossier futur ?",
        "Agent, concentration, voie et évolution de la myotoxicité",
        src("b00103", "b00106"),
        "La traçabilité permettra de modifier le produit et la technique lors d’une nouvelle anesthésie.",
        "La récupération devient complète après plusieurs semaines.",
      ),
    ],
  },
  {
    label: "DP QROC 8 · Formulation prolongée et adjuvants",
    vignette:
      "Un homme de 58 ans souffrant de douleur chronique doit bénéficier d’une chirurgie nécessitant une analgésie prolongée. L’équipe compare un cathéter continu, une formulation liposomale et l’ajout d’adjuvants à un anesthésique local. Le patient a une fonction hépatique normale, mais une cardiopathie stable qui impose d’éviter des pics plasmatiques élevés.",
    allowed_voies: ["externe"],
    questions: [
      qroc(
        "Quelle durée de relargage vise une formulation liposomale ?",
        "72 à 96 heures",
        src("b00151", "b00152"),
        "L’encapsulation cherche à prolonger l’effet sans perfusion continue.",
      ),
      qroc(
        "Quel anesthésique local illustre cette formulation prolongée ?",
        "Bupivacaïne liposomale",
        src("b00152"),
        "La molécule est libérée progressivement depuis le véhicule.",
        "Une formulation de bupivacaïne encapsulée est proposée.",
      ),
      qroc(
        "Quelles limites freinent ces véhicules ?",
        "Toxicité du véhicule et faible spécificité tissulaire",
        src("b00153"),
        "La longue durée ne doit pas déplacer la toxicité vers le matériau de libération.",
        "L’équipe examine les données de sécurité du produit.",
      ),
      qroc(
        "Quel adjuvant vasoconstricteur réduit le pic systémique ?",
        "Adrénaline",
        src("b00138", "b00139", "b00140"),
        "Elle ralentit l’absorption et maintient plus longtemps l’agent au site.",
        "Une solution adrénalinée est envisagée pour un bloc périphérique.",
      ),
      qroc(
        "Quel adjuvant alpha-2 est réservé ici surtout à la douleur chronique ?",
        "Clonidine",
        src("b00138", "b00142"),
        "Son usage décrit est ciblé sur les patients souffrant de douleur chronique.",
        "Le patient correspond à ce contexte d’utilisation.",
      ),
      qroc(
        "Quel avantage offre un cathéter par rapport à une injection longue unique ?",
        "Titration de la dose dans le temps",
        src("b00128", "b00129"),
        "Le débit peut être ajusté à la douleur, mais la charge cumulée doit être surveillée.",
        "La durée réelle de la chirurgie devient incertaine.",
      ),
      qroc(
        "Quel principe sécurise la décision finale ?",
        "Choisir la plus faible exposition efficace selon terrain et site",
        src("b00071", "b00128", "b00129"),
        "La stratégie doit équilibrer durée, toxicité, possibilité de titration et surveillance.",
        "L’équipe retient un cathéter à faible débit avec monitorage clinique.",
      ),
    ],
  },
];

export function buildChapter18(extract) {
  void extract;
  const result = {
    fiche: buildFiche(),
    flashcards: FLASHCARDS,
    series: [
      ...QCM_SERIES,
      ...DP_QCM_SERIES,
      ...QROC_SERIES,
      ...DP_QROC_SERIES,
    ],
  };
  return result;
}

export default buildChapter18;

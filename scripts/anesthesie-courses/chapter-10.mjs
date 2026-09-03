// Chapitre 10 - Médecine transfusionnelle, sang et dérivés du sang.

const src = (...ids) => ids;
const n2 = (text, ...children) => ({ text, children });
const row = (concept, bullets, sourceBlocks, image) => ({ concept, bullets, sourceBlocks, ...(image ? { image } : {}) });
const fullImage = (path, caption, sourceCaption) => ({
  path, position: 'after', size: 'large', layout: 'full_width', containsText: true,
  caption, sourceCaption,
});

const IMAGES = {
  composition: fullImage('img/img_001.png', 'Répartition volumique des principales composantes du sang', "FIGURE 10.1 Composantes d'un don de sang"),
  separation: fullImage('img/img_002.png', 'Séparation d’un don de sang complet en produits transfusionnels', 'FIGURE 10.3 Produits sanguins'),
  products: fullImage('img/img_003.png', 'Aspect et volume des principaux produits sanguins labiles', 'FIGURE 10.3 Produits sanguins'),
  abo: fullImage('img/img_004.png', 'Compatibilité ABO des globules rouges et du plasma', 'TABLEAU 10.1 Compatibilité ABO des produits sanguins labiles'),
  infection: fullImage('img/img_005.png', 'Ordre de grandeur des risques infectieux transfusionnels', 'TABLEAU 10.2 Risques infectieux estimés au Québec (2016)'),
};

function buildFiche() {
  const parts = [
    {
      title: 'Relier besoin transfusionnel et physiologie',
      sections: [
        {
          title: 'Transport de l’oxygène : raisonner au-delà de l’hémoglobine',
          rows: [
            row('Trois fonctions à restaurer', [
              n2('Identifier la composante défaillante',
                'Les globules rouges assurent le transport artériel de l’oxygène.',
                'Plaquettes et facteurs de coagulation participent à l’hémostase.',
                'La volémie soutient le débit cardiaque.'),
              'La transfusion ne se justifie que si le bénéfice attendu dépasse les risques propres au produit choisi.',
            ], src('b00003', 'b00005')),
            row('Délivrance en oxygène', [
              n2('Décomposer DO₂ en deux leviers',
                'DO₂ = débit cardiaque × CaO₂.',
                'CaO₂ = SaO₂ × Hb × 1,34 + 0,003 × PaO₂.'),
              'La fraction liée à l’hémoglobine domine largement la fraction dissoute : corriger une anémie augmente CaO₂ si le débit et la saturation sont maintenus.',
            ], src('b00007', 'b00008', 'b00009', 'b00012')),
            row('Consommation tissulaire', [
              'L’équation de Fick relie VO₂ au débit cardiaque et à la différence artérioveineuse : VO₂ = débit cardiaque × (CaO₂ − CvO₂).',
              'Le choc apparaît lorsque la délivrance devient insuffisante pour la demande et provoque une hypoxie cellulaire.',
            ], src('b00010', 'b00011', 'b00012', 'b00013')),
            row('Quatre voies vers l’hypoxie', [
              n2('Chercher le mécanisme dominant',
                'Hypoxémie : baisse de l’oxygénation artérielle.',
                'Anémie : baisse de la capacité de transport.',
                'Bas débit : réduction du flux convectif.',
                'Dissociation anormale de l’hémoglobine ou incapacité cellulaire d’utiliser l’oxygène.'),
            ], src('b00013', 'b00014', 'b00015', 'b00016')),
            row('Adaptation à l’anémie', [
              'L’organisme augmente le débit cardiaque, réduit sa consommation d’oxygène et élève le 2,3-BPG pour faciliter la libération périphérique d’O₂.',
              'Ces mécanismes demandent une réserve cardiovasculaire et, pour le 2,3-BPG, plusieurs heures : une anémie aiguë est moins bien tolérée.',
            ], src('b00017', 'b00018', 'b00019', 'b00020', 'b00021', 'b00022', 'b00023')),
          ],
        },
        {
          title: 'Hémostase : remplacer la composante réellement déficitaire',
          rows: [
            row('Clou plaquettaire', [
              'Une rupture endothéliale déclenche adhésion, activation, sécrétion de médiateurs puis agrégation plaquettaire.',
              'Le clou obtenu constitue l’armature de l’hémostase primaire.',
            ], src('b00024', 'b00025', 'b00026', 'b00027')),
            row('Thrombine et fibrine', [
              n2('Consolider le clou par l’hémostase secondaire',
                'Les voies extrinsèque et intrinsèque convergent vers l’activation du facteur X.',
                'Xa et Va forment la prothrombinase, qui génère la thrombine.',
                'La thrombine transforme le fibrinogène en fibrine, stabilisée par le facteur XIII.'),
            ], src('b00028', 'b00029')),
            row('Freins physiologiques', [
              'Le tissue factor pathway inhibitor, l’antithrombine et la protéine C limitent les protéases de coagulation.',
              'La plasmine clive la fibrine polymérisée et assure la fibrinolyse du thrombus devenu inutile.',
            ], src('b00030', 'b00031', 'b00032')),
            row('Quatre déficits', [
              n2('Faire correspondre anomalie et traitement',
                'Thrombopénie ou thrombopathie : composante plaquettaire.',
                'Déficit en facteurs : plasma ou fraction spécifique.',
                'Hypofibrinogénémie : produit riche en fibrinogène.',
                'Hyperfibrinolyse : acide tranexamique.'),
              'Après dilution, facteurs et fibrinogène diminuent vers un volume circulant remplacé ; la thrombopénie apparaît plutôt vers un volume et demi.',
            ], src('b00033', 'b00034', 'b00035', 'b00036', 'b00037')),
          ],
        },
      ],
    },
    {
      title: 'Choisir un produit sanguin labile',
      sections: [
        {
          title: 'Du don au produit adapté au déficit',
          rows: [
            row('Séparation du sang', [
              'Un don de sang complet ou une aphérèse fournit quatre produits : concentrés de globules rouges, plasma, plaquettes et cryoprécipités selon le pays.',
              'La séparation permet de transfuser uniquement la composante nécessaire.',
            ], src('b00038', 'b00039', 'b00040', 'b00041'), IMAGES.composition),
            row('Chaîne des produits', [
              'Les globules rouges sont séparés directement ; le plasma riche en plaquettes fournit plasma, unité plaquettaire et cryoprécipité.',
              'Le surnageant de cryoprécipité sert à fabriquer certains dérivés non labiles.',
            ], src('b00040', 'b00044', 'b00046'), IMAGES.separation),
            row('Repères visuels', [
              'Les volumes, l’aspect et les solutions de conservation diffèrent selon les produits : l’étiquette et le contrôle ultime priment sur l’apparence.',
            ], src('b00040', 'b00046'), IMAGES.products),
          ],
        },
        {
          title: 'CGR : restaurer le transport sans automatisme de seuil',
          renderChunks: [2, 2],
          rows: [
            row('Préparation et conservation', [
              'Les CGR sont déleucocytés ; la qualification des donneurs et le dépistage sérologique et génomique réduisent le risque infectieux.',
              'Ils se conservent 42 jours entre 2 et 6 °C dans une solution avec sodium, adénine, glucose et mannitol ; le citrate chélate le calcium.',
              'Après délivrance conforme, la transfusion doit débuter dans les six heures suivant la réception.',
            ], src('b00048', 'b00049', 'b00056')),
            row('Compatibilité des CGR', [
              'Privilégier un produit isogroupe ABO et Rh compatible.',
              'Un CGR O est compatible avec tout receveur ABO ; un CGR AB ne convient qu’au receveur AB.',
            ], src('b00050', 'b00057'), IMAGES.abo),
            row('Indication clinique', [
              n2('Transfuser une mauvaise tolérance persistante',
                'Tachycardie, hypotension ou ischémie tissulaire doivent persister après optimisation du débit cardiaque.',
                'La cinétique du saignement, le délai du résultat et la disponibilité locale modulent la décision.'),
              'Le seuil de 7 g/dL convient à la majorité des patients sans particularité.',
            ], src('b00050', 'b00051', 'b00059')),
            row('Seuils individualisés', [
              'Retenir 8 à 9 g/dL en périopératoire chez certains patients cardiovasculaires.',
              'Un seuil proche de 9 g/dL peut être discuté en syndrome coronarien aigu, insuffisance cardiaque ou hémorragie cérébrale.',
              'Aucun chiffre isolé ne remplace l’évaluation de la consommation d’O₂ et de la réserve de débit cardiaque.',
            ], src('b00052', 'b00053', 'b00054', 'b00055', 'b00059')),
          ],
        },
        {
          title: 'Plasma, plaquettes et fibrinogène',
          renderChunks: [4, 2],
          rows: [
            row('Plasma thérapeutique', [
              n2('Respecter une compatibilité inversée par rapport aux CGR',
                'Le plasma AB est compatible avec tous les groupes ABO.',
                'Le plasma O ne convient qu’au receveur O.'),
              'Le PFC est congelé, décongelé à 37 °C en 30 à 50 minutes et utilisé selon les délais nationaux après décongélation.',
            ], src('b00060', 'b00061', 'b00062')),
            row('Plasma lyophilisé', [
              'Le PLYO se reconstitue en moins de six minutes avec 200 mL d’eau, se conserve deux ans entre 2 et 25 °C et ne nécessite pas de froid négatif.',
              'Universel et rapidement disponible, il est adapté aux environnements isolés mais coûte davantage et exige une production spécifique.',
            ], src('b00063', 'b00064')),
            row('Indication du plasma', [
              'Un déficit en facteurs inférieur à 30 % associé à un saignement peut se traduire par TP < 40 %, INR > 2 ou TCA > 2 fois le témoin.',
              'La dose habituelle est de 10 à 15 mL/kg ; une anomalie biologique isolée sans contexte hémorragique ne suffit pas.',
            ], src('b00065')),
            row('Concentrés plaquettaires', [
              'Aphérèse ou mélange de quatre à cinq couches plaquettaires : conservation cinq jours entre 20 et 24 °C sous agitation.',
              'Après réception, ils restent jusqu’à six heures à température ambiante sans agitation continue.',
            ], src('b00066', 'b00067')),
            row('Cibles plaquettaires', [
              n2('Adapter le seuil au risque du geste',
                '10 à 20 G/L en prophylaxie d’aplasie selon les facteurs de risque.',
                '30 G/L avant voie basse ; 50 G/L avant chirurgie, césarienne, rachianesthésie ou ponction lombaire.',
                '70 à 80 G/L avant péridurale ; 100 G/L en neurochirurgie ou traumatisme crânien.'),
              'Un mélange de cinq concentrés ou une aphérèse augmente habituellement la numération de 30 à 60 G/L.',
            ], src('b00068', 'b00069', 'b00070', 'b00071', 'b00072', 'b00073', 'b00074')),
            row('Cryoprécipité', [
              'Chaque unité apporte environ 500 mg de fibrinogène, ainsi que fibronectine, facteurs VIII, von Willebrand et XIII.',
              'Une dose adulte de cinq unités apporte 2,5 g dans 70 mL et augmente la fibrinogénémie d’environ 1 g/L.',
              'L’indication principale est une hypofibrinogénémie hémorragique, souvent sous 1,5 à 2 g/L.',
            ], src('b00075', 'b00076', 'b00077', 'b00078')),
          ],
        },
      ],
    },
    {
      title: 'Utiliser les dérivés plasmatiques ciblés',
      sections: [
        {
          title: 'Albumine et immunoglobulines',
          rows: [
            row('Albumine sécurisée', [
              'L’albumine provient de pools plasmatiques, puis est précipitée et pasteurisée dix heures à 60 °C.',
              'Elle existe en forme iso-oncotique à 4–5 % et hyperoncotique à 20–25 % ; cette dernière produit une expansion environ quatre fois supérieure.',
            ], src('b00079', 'b00080', 'b00081', 'b00082')),
            row('Place en remplissage', [
              'L’albumine iso-oncotique peut compléter les cristalloïdes lorsque leurs besoins deviennent importants ou insuffisants.',
              'Elle n’a pas démontré de supériorité générale sur les cristalloïdes et doit être évitée chez le neurotraumatisé.',
            ], src('b00083')),
            row('Albumine hyperoncotique', [
              'Des indications hépatiques ciblées comprennent drainage d’ascite, péritonite bactérienne spontanée et syndrome hépatorénal de type I.',
            ], src('b00084', 'b00085')),
            row('Immunoglobulines', [
              'Les immunoglobulines plasmatiques traitent déficits immunitaires et certaines maladies auto-immunes, dont Guillain-Barré et myasthénie.',
              'La dose usuelle totale est de 1 à 2 g/kg ; l’intérêt reste controversé dans le sepsis et le choc toxique.',
            ], src('b00088', 'b00089', 'b00090')),
          ],
        },
        {
          title: 'Concentrés de facteurs : efficacité rapide, spectre limité',
          rows: [
            row('Fibrinogène purifié', [
              'Une reconstitution fournit 1 g dans 50 mL ; environ 60 mg/kg augmente la fibrinogénémie de 1 g/L.',
              'Les mêmes cibles de 1 à 2 g/L que pour le cryoprécipité guident son emploi, sans supériorité démontrée entre sources.',
            ], src('b00086', 'b00087')),
            row('Complexe prothrombinique', [
              n2('Neutraliser rapidement un antagoniste de vitamine K',
                'Le CCP apporte II, VII, IX et X, ainsi que protéines C et S ; il contient aussi de l’héparine.',
                'Administrer 25 à 50 UI/kg ou une dose fixe de 1 500 à 2 000 UI.',
                'Associer 10 mg de vitamine K parentérale pour prolonger la correction.'),
              'Le CCP ne remplace pas les facteurs V, XI, XII et XIII : il ne constitue pas un plasma concentré complet.',
            ], src('b00091', 'b00092', 'b00093')),
            row('Fractions spécifiques', [
              'Les concentrés de facteurs VII, VIII–von Willebrand, IX, XI, XII, protéine C ou antithrombine traitent un déficit isolé.',
              'Le facteur VIIa recombinant est validé surtout chez l’hémophile avec inhibiteur ; son emploi hors indication dans l’hémorragie massive n’est pas encouragé.',
            ], src('b00094', 'b00095', 'b00096', 'b00097')),
          ],
        },
      ],
    },
    {
      title: 'Prescrire, sécuriser et épargner le sang',
      sections: [
        {
          title: 'Identification et degrés d’urgence',
          rows: [
            row('Double détermination', [
              'Deux échantillons, idéalement prélevés par deux professionnels différents, sécurisent groupage et recherche d’anticorps irréguliers.',
              'La prescription médicale écrite ou électronique est signée, tracée et conservée au dossier transfusionnel.',
            ], src('b00098', 'b00099', 'b00100', 'b00101', 'b00102')),
            row('Urgence vitale immédiate', [
              n2('Distribuer sans attendre les examens absents',
                'CGR O, plaquettes O et plasma AB sont privilégiés lorsque les stocks le permettent.',
                'Les CGR O Rh négatif sont réservés en priorité aux femmes de moins de 50 ans ; les autres reçoivent souvent O Rh positif.'),
            ], src('b00103', 'b00104', 'b00105')),
            row('Urgence vitale', [
              'Un délai inférieur à 30 minutes permet au minimum la détermination RhD et parfois un groupage ABO valide.',
              'La RAI et la compatibilité formelle ne sont pas disponibles à ce stade.',
            ], src('b00106', 'b00107')),
            row('Urgence relative', [
              'Un délai de deux à trois heures permet groupage, RAI récente et délivrance ABO compatible, souvent isogroupe et phénotypée si nécessaire.',
              'Le médecin mentionne explicitement le degré d’urgence : accélérer la délivrance réduit le niveau de sécurisation immunohématologique.',
            ], src('b00108', 'b00109', 'b00110')),
          ],
        },
        {
          title: 'Patient blood management et hémorragie massive',
          rows: [
            row('Préopératoire', [
              'Dépister anémie, trouble de l’hémostase et traitements antiagrégants ou anticoagulants avant une chirurgie à risque.',
              'Une carence martiale avec Hb < 13 g/dL chez l’homme ou < 12 g/dL chez la femme peut justifier 1 g de fer IV.',
              'En orthopédie hémorragique, une EPO peut être discutée pour Hb 10–13 g/dL, avec contrôle de NFS et arrêt au-delà de 15 g/dL.',
            ], src('b00111', 'b00112', 'b00113', 'b00114', 'b00115')),
            row('Intraopératoire', [
              n2('Limiter le saignement avant de remplacer le sang',
                'Assurer hémostase chirurgicale, normothermie et correction de l’acidose et de l’hypocalcémie.',
                'Employer l’acide tranexamique à 15–50 mg/kg dans les chirurgies concernées.',
                'Adapter une PAM voisine de 65 mmHg et un remplissage modéré au terrain.'),
              'Le cell saver est utile en chirurgie cardiaque, vasculaire ou oncologique majeure, mais contre-indiqué en champ infecté ou avec colles biologiques.',
            ], src('b00116', 'b00117')),
            row('Reconnaître la transfusion massive', [
              'Les définitions utiles sont dynamiques : cinq CGR en trois heures, trois en une heure ou besoin d’un CGR dès l’accueil d’un traumatisé.',
              'Déclencher précocement un protocole organisé est plus pertinent que d’attendre dix CGR en 24 heures.',
            ], src('b00118', 'b00119', 'b00120', 'b00121')),
            row('Réanimation hémostatique', [
              n2('Approcher un remplacement équilibré',
                'Introduire précocement le plasma avec un ratio plasma:CGR entre 1:2 et 1:1.',
                'Ajouter un mélange plaquettaire pour quatre à six CGR et tendre vers plaquettes:plasma:CGR = 1:1:1.',
                'Administrer 1 g d’acide tranexamique en dix minutes puis 1 g sur huit heures.'),
            ], src('b00121')),
          ],
        },
      ],
    },
    {
      title: 'Diagnostiquer une complication transfusionnelle',
      sections: [
        {
          title: 'Réaction hémolytique et risque infectieux',
          rows: [
            row('Risque infectieux résiduel', [
              'Qualification des donneurs, déleucocytation et dépistages sensibles ont rendu les transmissions virales graves exceptionnelles.',
              'La contamination bactérienne et des agents émergents restent possibles et justifient l’hémovigilance.',
            ], src('b00123', 'b00124', 'b00125', 'b00127'), IMAGES.infection),
            row('Hémolyse aiguë', [
              n2('Reconnaître une incompatibilité dans les 24 heures',
                'Fièvre, frissons, hypotension et hémoglobinurie sont évocateurs.',
                'Douleurs thoraciques, lombaires ou abdominales, CIVD et insuffisance rénale peuvent compléter le tableau.',
                'Hb et haptoglobine diminuent ; bilirubine et LDH augmentent.'),
              'L’incompatibilité ABO par erreur d’identification est la cause classique et active le complément via des IgM.',
            ], src('b00128', 'b00129', 'b00130')),
            row('Hémolyse retardée', [
              'Après 24 heures, une réponse anamnestique IgG peut provoquer hausse insuffisante de l’Hb, ictère ou bilirubinurie.',
              'Prévenir immédiatement la banque du sang ; le traitement des deux formes d’hémolyse est principalement symptomatique.',
            ], src('b00131')),
          ],
        },
        {
          title: 'Œdème pulmonaire : distinguer TRALI et TACO',
          rows: [
            row('Poids pronostique', [
              'TRALI et TACO représentent ensemble la première cause de mortalité transfusionnelle.',
              'Le TRALI relève d’une perméabilité capillaire accrue ; le TACO d’une pression hydrostatique élevée.',
            ], src('b00132', 'b00133')),
            row('TRALI', [
              n2('Identifier une atteinte inflammatoire précoce',
                'Œdème pulmonaire bilatéral et hypoxémie apparaissent dans les six heures sans hypertension de l’oreillette gauche.',
                'Fièvre, hypotension et leucopénie peuvent être associées.',
                'Sepsis, état critique et produits riches en plasma augmentent le risque.'),
              'Le traitement est celui d’un SDRA ; l’exclusion des donneuses pour les produits riches en plasma a réduit l’incidence.',
            ], src('b00134')),
            row('TACO', [
              n2('Rechercher une surcharge hydrostatique',
                'Dans les six heures, au moins trois éléments associent dyspnée, œdème radiologique, BNP ou PVC élevés, insuffisance cardiaque gauche et bilan positif.',
                'Une hypertension artérielle, un âge avancé, une cardiopathie et un volume élevé orientent le diagnostic.',
                'Ralentir les produits et administrer un diurétique chez les patients à risque.'),
            ], src('b00135', 'b00136')),
          ],
        },
        {
          title: 'Allergie, immunomodulation et réactions rares',
          rows: [
            row('Allergie', [
              'Urticaire et anaphylaxie apparaissent pendant la transfusion ou dans les quatre heures.',
              'L’urticaire isolée répond aux antihistaminiques ; l’anaphylaxie impose arrêt de la transfusion et traitement immédiat usuel.',
            ], src('b00137', 'b00138', 'b00139')),
            row('Immunomodulation', [
              'Leucocytes résiduels, médiateurs et HLA solubles diminuent l’activité immunitaire du receveur.',
              'Infections nosocomiales, réactivations virales et récidives tumorales sont associées, mais l’impact causal à long terme reste incertain.',
            ], src('b00140', 'b00141', 'b00142')),
            row('Diagnostics d’exclusion', [
              'Une réaction fébrile non hémolytique ou une hypotension isolée ne sont retenues qu’après exclusion d’hémolyse, allergie et TRALI.',
            ], src('b00143', 'b00144')),
            row('Réactions immunes rares', [
              'Le purpura post-transfusionnel survient cinq à dix jours après des plaquettes, avec thrombopénie sévère chez un receveur immunisé HPA-1.',
              'La maladie du greffon contre l’hôte menace l’immunodéprimé profond ; l’irradiation des CGR la prévient.',
            ], src('b00145', 'b00146')),
          ],
        },
      ],
    },
    {
      title: 'Prévenir les dérives de la transfusion massive',
      sections: [
        {
          title: 'Citrate, potassium, température et volume',
          rows: [
            row('Hypocalcémie citratée', [
              'Le citrate chélate le calcium libre et aggrave la coagulopathie ; seul le calcium ionisé apprécie correctement ce risque.',
              'Pendant un protocole massif, doser le calcium ionisé ou administrer du calcium toutes les quatre à huit heures selon la vitesse.',
            ], src('b00147', 'b00148', 'b00149', 'b00150')),
            row('Hyperkaliémie', [
              'Le potassium libéré par les globules rouges pendant le stockage peut s’accumuler lors d’une transfusion rapide et massive.',
            ], src('b00148', 'b00150')),
            row('Hypothermie', [
              n2('Réchauffer pour préserver l’hémostase',
                'Les produits froids abaissent la température du receveur.',
                'L’hypothermie ralentit les protéases de coagulation et augmente le risque infectieux chirurgical.',
                'Un réchauffeur de sang prévient cette complication iatrogène.'),
            ], src('b00148', 'b00150')),
            row('Surcharge', [
              'La volémie administrée doit rester cohérente avec les pertes ; un remplacement dépassant le sang perdu expose à un TACO.',
            ], src('b00148', 'b00150')),
          ],
        },
        {
          title: 'Décider avec un index thérapeutique étroit',
          rows: [
            row('Risque de ne pas transfuser', [
              'Chez des opérés non transfusables avec Hb postopératoire < 8 g/dL, la mortalité était de 8,2 % et doublait approximativement à chaque baisse de 1 g/dL.',
              'Ce signal rappelle que l’abstention devient dangereuse lorsque la délivrance d’oxygène n’est plus compensée.',
            ], src('b00151', 'b00152')),
            row('Stratégie centrée patient', [
              'Le patient blood management traite l’anémie, réduit le saignement, optimise les seuils et évite les produits inutiles sans retarder une indication vitale.',
              'Chaque décision confronte le risque immédiat de l’anémie ou de la coagulopathie aux complications du produit transfusé.',
            ], src('b00153', 'b00154', 'b00155', 'b00156', 'b00157', 'b00158', 'b00159', 'b00160', 'b00161', 'b00162')),
            row('Arbitrage explicite', [
              'Une transfusion justifiée corrige un danger immédiat ; une transfusion évitable ajoute exposition pulmonaire, immune, infectieuse et métabolique.',
              'L’absence de produit devient elle-même dangereuse lorsque l’anémie ou la coagulopathie dépasse les capacités de compensation du patient.',
            ], src('b00151', 'b00152', 'b00154', 'b00161')),
          ],
        },
      ],
    },
  ];

  const sourceBlocks = [...new Set(parts.flatMap((part) => part.sections.flatMap((section) => section.rows.flatMap((item) => item.sourceBlocks))))];
  return {
    matiere: 'Anesthésie-Réanimation',
    title: 'La médecine transfusionnelle, le sang et les dérivés du sang',
    year: '2026-2027',
    coverSubtitle: 'Choisir le bon produit, sécuriser chaque délivrance et reconnaître les complications',
    imageException: { reason: 'Les cinq visuels du document sont tous pédagogiquement utiles et intégrés ; aucun autre média source n’est disponible.' },
    sourceBlocks,
    parts,
    synthesis: {
      compactLayout: true,
      chiffres: {
        headers: ['Repère', 'Valeur à retenir'],
        rows: [
          ['CGR sans terrain particulier', 'Hb ≈ 7 g/dL'],
          ['Plasma', '10–15 mL/kg'],
          ['Plaquettes avant geste courant', '≥ 50 G/L'],
          ['Péridurale', '70–80 G/L'],
          ['Neurochirurgie', '≥ 100 G/L'],
          ['Fibrinogène hémorragique', 'Cible ≥ 1,5–2 g/L'],
          ['TRALI / TACO', 'Dans les 6 heures'],
        ],
      },
      tables: [
        {
          title: 'Produit et indication dominante', headers: ['Produit', 'Objectif'], rows: [
            ['CGR', 'Augmenter CaO₂ lorsque l’anémie est mal tolérée'],
            ['Plasma', 'Remplacer plusieurs facteurs déficitaires avec saignement'],
            ['Plaquettes', 'Corriger thrombopénie ou thrombopathie hémorragique'],
            ['Cryoprécipité / fibrinogène', 'Corriger une hypofibrinogénémie'],
            ['CCP + vitamine K', 'Neutraliser rapidement un AVK'],
          ],
        },
        {
          title: 'Réaction aiguë : premier réflexe diagnostique', headers: ['Tableau', 'Orientation'], rows: [
            ['Fièvre + hémoglobinurie + hypotension', 'Hémolyse aiguë'],
            ['Hypoxémie + hypotension sans surcharge', 'TRALI'],
            ['Hypoxémie + HTA + bilan positif', 'TACO'],
            ['Urticaire isolée', 'Allergie bénigne'],
            ['Urticaire + atteinte laryngée ou choc', 'Anaphylaxie'],
          ],
        },
      ],
      keyPoints: [
        'Une concentration d’hémoglobine ne suffit pas : décision et urgence reposent sur la tolérance, la cinétique et la réserve cardiovasculaire.',
        'La compatibilité ABO du plasma est inversée par rapport à celle des concentrés de globules rouges.',
        'Une anomalie biologique isolée sans saignement ne justifie pas automatiquement plasma, plaquettes ou fibrinogène.',
        'Deux prélèvements indépendants et l’identification au lit du patient préviennent les accidents hémolytiques évitables.',
        'En hémorragie massive, protocole précoce, ratios équilibrés, tranexamique, calcium et réchauffement doivent avancer ensemble.',
        'TRALI et TACO surviennent précocement mais opposent perméabilité inflammatoire et surcharge hydrostatique.',
        'La transfusion est un traitement à index thérapeutique étroit : ni abstention dogmatique ni seuil automatique.',
        'Le patient blood management commence avant l’intervention par le traitement de l’anémie et la réduction du saignement attendu.',
      ],
      eclair: [
        'Identifier le déficit : transport, plaquettes, facteurs, fibrinogène ou volume.',
        'Transfuser un seul CGR puis réévaluer hors hémorragie active.',
        'Réserver le plasma au déficit multiple en facteurs avec contexte hémorragique.',
        'Cibler ≥ 50 G/L pour la plupart des gestes, davantage pour péridurale et neurochirurgie.',
        'Déclencher sans délai le protocole de transfusion massive si la cinétique le justifie.',
        'Devant une réaction, arrêter le produit, maintenir l’abord, prévenir la banque du sang et traiter la défaillance.',
        'Distinguer TRALI et TACO par le contexte, la pression, le bilan hydrique et la réponse aux diurétiques.',
        'Surveiller calcium ionisé, kaliémie, température et volémie pendant toute transfusion massive.',
      ],
    },
  };
}

const card = (recto, verso, sourceBlocks) => ({ recto, verso, sourceBlocks: Array.isArray(sourceBlocks) ? sourceBlocks : [sourceBlocks] });

function buildFlashcards() {
  return [
    card('Quelles fonctions sanguines peuvent nécessiter un remplacement ?', 'Transport de l’O₂, hémostase et maintien de la volémie.', ['b00003', 'b00005']),
    card('Quelle est l’équation de la délivrance en oxygène ?', 'DO₂ = débit cardiaque × CaO₂.', ['b00007', 'b00008']),
    card('Quelle est l’équation simplifiée du contenu artériel en oxygène ?', 'CaO₂ = SaO₂ × Hb × 1,34 + 0,003 × PaO₂.', 'b00009'),
    card('Quelle part de CaO₂ dépend principalement de l’hémoglobine ?', 'La fraction SaO₂ × Hb × 1,34.', 'b00009'),
    card('Comment l’équation de Fick exprime-t-elle VO₂ ?', 'VO₂ = débit cardiaque × (CaO₂ − CvO₂).', ['b00010', 'b00011']),
    card('Quand survient un choc au sens physiologique ?', 'Quand DO₂ devient insuffisante pour VO₂ et entraîne une hypoxie cellulaire.', 'b00013'),
    card('Quels quatre mécanismes peuvent provoquer une hypoxie ?', 'Hypoxémie, anémie, bas débit et défaut de libération ou d’utilisation de l’O₂.', ['b00013', 'b00014', 'b00015', 'b00016']),
    card('Comment le débit cardiaque s’adapte-t-il à l’anémie ?', 'Il augmente pour préserver la délivrance en oxygène.', ['b00017', 'b00018']),
    card('Quel effet du 2,3-BPG aide lors d’une anémie ?', 'Il facilite la dissociation périphérique de l’O₂ de l’hémoglobine.', 'b00020'),
    card('Pourquoi une anémie aiguë est-elle moins bien tolérée ?', 'Les adaptations cardiovasculaires et métaboliques n’ont pas le temps de s’installer.', ['b00021', 'b00022', 'b00023']),
    card('Quelle étape forme le clou plaquettaire ?', 'Adhésion, activation puis agrégation des plaquettes au site lésé.', ['b00026', 'b00027']),
    card('Quel complexe active massivement la thrombine ?', 'Le complexe prothrombinase, formé des facteurs Xa et Va.', 'b00029'),
    card('Quelle molécule transforme le fibrinogène en fibrine ?', 'La thrombine.', 'b00029'),
    card('Quel facteur stabilise la fibrine polymérisée ?', 'Le facteur XIII activé.', 'b00029'),
    card('Quelle enzyme assure la fibrinolyse ?', 'La plasmine.', ['b00030', 'b00031']),
    card('Quels sont les quatre grands déficits de l’hémostase ?', 'Plaquettes, facteurs, fibrinogène et hyperfibrinolyse.', ['b00033', 'b00034', 'b00035', 'b00036']),
    card('Quel traitement cible une hyperfibrinolyse ?', 'L’acide tranexamique.', 'b00037'),
    card('Quand apparaît la coagulopathie dilutionnelle en facteurs ?', 'Après le remplacement d’environ un volume circulant.', 'b00037'),
    card('Quand apparaît habituellement la thrombopénie dilutionnelle ?', 'Après le remplacement d’environ un volume circulant et demi.', 'b00037'),
    card('Quels sont les quatre produits sanguins labiles ?', 'CGR, plasma, concentrés plaquettaires et cryoprécipités.', 'b00040'),
    card('Combien de temps un CGR se conserve-t-il ?', 'Jusqu’à 42 jours entre 2 et 6 °C.', 'b00049'),
    card('Pourquoi les produits sanguins contiennent-ils du citrate ?', 'Il chélate le calcium et empêche la coagulation dans la poche.', 'b00049'),
    card('Dans quel délai débuter un CGR après sa réception ?', 'Dans les six heures si le transport a respecté les bonnes pratiques.', 'b00049'),
    card('Quel CGR est universel pour le système ABO ?', 'Le CGR de groupe O.', 'b00050'),
    card('À quel receveur un CGR AB peut-il être donné ?', 'Uniquement à un receveur AB.', 'b00050'),
    card('Quel seuil d’Hb convient à la majorité des patients stables ?', 'Environ 7 g/dL.', ['b00051', 'b00059']),
    card('Quel seuil d’Hb peut guider certains patients cardiovasculaires ?', 'Environ 8 à 9 g/dL selon la tolérance et le contexte.', ['b00052', 'b00053', 'b00059']),
    card('Quels signes indiquent une mauvaise tolérance de l’anémie ?', 'Tachycardie, hypotension ou ischémie persistantes après optimisation du débit.', 'b00050'),
    card('Quel plasma est universel pour le système ABO ?', 'Le plasma AB.', 'b00061'),
    card('À quel receveur un plasma O peut-il être donné ?', 'Uniquement à un receveur O.', 'b00061'),
    card('Pourquoi privilégier des donneurs masculins pour le plasma ?', 'Pour diminuer le risque de TRALI lié aux anticorps des donneuses.', 'b00061'),
    card('À quelle température décongeler le PFC ?', 'Au bain-marie à 37 °C.', 'b00062'),
    card('Combien de temps dure la décongélation du PFC ?', 'Environ 30 à 50 minutes.', 'b00062'),
    card('Quel délai de reconstitution offre le plasma lyophilisé ?', 'Moins de six minutes avec 200 mL d’eau injectable.', 'b00064'),
    card('Quelle est la dose habituelle de plasma thérapeutique ?', '10 à 15 mL/kg.', 'b00065'),
    card('Quels tests suggèrent un déficit sévère en facteurs ?', 'TP < 40 %, INR > 2 ou TCA > 2 fois le témoin.', 'b00065'),
    card('Comment conserver les concentrés plaquettaires ?', 'Entre 20 et 24 °C, sous agitation continue, au maximum cinq jours.', 'b00067'),
    card('Quel seuil plaquettaire viser avant une chirurgie courante ?', 'Au moins 50 G/L.', ['b00070', 'b00071']),
    card('Quel seuil plaquettaire viser avant une péridurale ?', '70 à 80 G/L.', 'b00072'),
    card('Quel seuil plaquettaire viser avant une neurochirurgie ?', '100 G/L.', 'b00073'),
    card('Quel seuil plaquettaire viser avant une voie basse ?', '30 G/L.', 'b00069'),
    card('Quelle hausse suit une dose adulte de plaquettes ?', 'Environ 30 à 60 G/L.', 'b00074'),
    card('Combien de fibrinogène contient un cryoprécipité ?', 'Environ 500 mg.', 'b00076'),
    card('Que contient aussi un cryoprécipité ?', 'Fibronectine et facteurs VIII, von Willebrand et XIII.', 'b00076'),
    card('Quelle fibrinogénémie justifie un produit riche en fibrinogène ?', 'Souvent une valeur inférieure à 1,5–2 g/L avec saignement.', 'b00077'),
    card('Que fournit une dose adulte de cinq cryoprécipités ?', '2,5 g de fibrinogène dans environ 70 mL.', 'b00078'),
    card('Quelle hausse suit une dose adulte de cryoprécipités ?', 'Environ 1 g/L de fibrinogénémie.', 'b00078'),
    card('Comment l’albumine plasmatique est-elle sécurisée ?', 'Par précipitation puis pasteurisation dix heures à 60 °C.', 'b00081'),
    card('Quelles concentrations d’albumine sont disponibles ?', 'Iso-oncotique 4–5 % et hyperoncotique 20–25 %.', 'b00082'),
    card('Quelle expansion produit l’albumine hyperoncotique ?', 'Environ quatre fois le volume administré.', 'b00082'),
    card('Quand envisager l’albumine en remplissage ?', 'Si les besoins en cristalloïdes sont importants ou insuffisants.', 'b00083'),
    card('Chez quel traumatisé l’albumine doit-elle être évitée ?', 'Chez le neurotraumatisé.', 'b00083'),
    card('Quelles indications hépatiques relèvent de l’albumine hyperoncotique ?', 'Ascite drainée, péritonite bactérienne et syndrome hépatorénal type I.', ['b00084', 'b00085']),
    card('Quelle dose de fibrinogène augmente le taux de 1 g/L ?', 'Environ 60 mg/kg.', 'b00087'),
    card('Quel volume contient 1 g de fibrinogène reconstitué ?', 'Environ 50 mL.', 'b00087'),
    card('Quelle dose totale d’immunoglobulines est usuelle ?', '1 à 2 g/kg selon le schéma.', ['b00089', 'b00090']),
    card('Quels facteurs contient un CCP quatre facteurs ?', 'Facteurs II, VII, IX et X, plus protéines C et S.', 'b00092'),
    card('Pourquoi associer vitamine K au CCP ?', 'Le CCP agit vite mais brièvement ; la vitamine K prolonge la correction.', 'b00092'),
    card('Quelle dose de vitamine K associer au CCP ?', '10 mg par voie parentérale.', 'b00092'),
    card('Quelle dose pondérale de CCP est usuelle ?', '25 à 50 UI/kg.', 'b00092'),
    card('Quelle dose fixe de CCP est souvent proposée ?', '1 500 à 2 000 UI.', 'b00092'),
    card('Quels facteurs importants le CCP ne contient-il pas ?', 'Facteurs V, XI, XII et XIII.', ['b00092', 'b00093']),
    card('Quelle indication valide le facteur VIIa recombinant ?', 'Hémophilie avec inhibiteur du facteur VIII ou IX.', ['b00096', 'b00097']),
    card('Combien d’échantillons sécurisent le groupage avant transfusion ?', 'Deux échantillons, idéalement par deux préleveurs différents.', ['b00100', 'b00101', 'b00102']),
    card('Que signifie UVI en transfusion ?', 'Distribution immédiate sans attendre groupe ni RAI s’ils sont inconnus.', ['b00103', 'b00104', 'b00105']),
    card('Quels produits ABO privilégier en UVI ?', 'CGR O, plaquettes O et plasma AB.', 'b00105'),
    card('À qui réserver prioritairement les CGR O Rh négatif ?', 'Aux femmes de moins de 50 ans ou aux patients avec anti-D connu.', 'b00105'),
    card('Quel délai caractérise une urgence vitale transfusionnelle ?', 'Moins de 30 minutes.', ['b00106', 'b00107']),
    card('Quel délai caractérise une urgence relative ?', 'Deux à trois heures.', ['b00108', 'b00109']),
    card('Quand faut-il renouveler une RAI ?', 'Lorsqu’elle date de plus de trois jours.', 'b00109'),
    card('Quels risques préopératoires de saignement faut-il rechercher ?', 'Anémie, coagulopathie et traitements antiagrégants ou anticoagulants.', 'b00114'),
    card('Quels seuils définissent l’anémie préopératoire ?', 'Hb < 13 g/dL chez l’homme et < 12 g/dL chez la femme.', 'b00115'),
    card('Quels marqueurs suggèrent une carence martiale préopératoire ?', 'Saturation de transferrine < 20 % ou ferritine < 100 µg/L.', 'b00115'),
    card('Quelle dose de fer IV corrige une carence préopératoire ?', '1 g de fer intraveineux.', 'b00115'),
    card('Quand arrêter l’EPO préopératoire ?', 'Lorsque l’hémoglobine dépasse 15 g/dL.', 'b00115'),
    card('Quelle dose d’acide tranexamique utilise-t-on en chirurgie ?', 'Environ 15 à 50 mg/kg selon le contexte.', 'b00117'),
    card('Quelle PAM modeste peut limiter le saignement ?', 'Environ 65 mmHg, à individualiser.', 'b00117'),
    card('Quel remplissage peropératoire modéré est proposé ?', 'Environ 4 mL/kg/h.', 'b00117'),
    card('Quand le cell saver est-il contre-indiqué ?', 'En champ infecté ou lors de l’utilisation de colles biologiques.', 'b00117'),
    card('Quelle définition dynamique évoque une transfusion massive ?', 'Cinq CGR en trois heures ou trois CGR en une heure.', ['b00119', 'b00120']),
    card('Quel ratio plasma:CGR viser précocement ?', 'Entre 1:2 et 1:1.', 'b00121'),
    card('Quel ratio global peut guider un protocole massif ?', 'Plaquettes:plasma:CGR proche de 1:1:1.', 'b00121'),
    card('Quel schéma de tranexamique utiliser en traumatisme hémorragique ?', '1 g en dix minutes, puis 1 g sur huit heures.', 'b00121'),
    card('Quel est le mécanisme classique d’une hémolyse aiguë ABO ?', 'Des IgM anti-A ou anti-B activent le complément.', 'b00130'),
    card('Quels signes évoquent une hémolyse aiguë ?', 'Fièvre, frissons, hypotension et hémoglobinurie.', 'b00130'),
    card('Quel profil biologique évoque une hémolyse ?', 'Hb et haptoglobine basses, bilirubine et LDH élevées.', ['b00130', 'b00131']),
    card('Quand débute une hémolyse retardée ?', 'Au moins 24 heures après la transfusion.', 'b00131'),
    card('Quel signe révèle souvent une hémolyse retardée ?', 'Hausse insuffisante de l’Hb ou chute inexpliquée avec ictère.', 'b00131'),
    card('Quelle est la première cause de mortalité transfusionnelle ?', 'Les complications pulmonaires TRALI et TACO.', 'b00133'),
    card('Dans quel délai survient un TRALI ?', 'Dans les six heures suivant le début de la transfusion.', 'b00134'),
    card('Quel mécanisme produit le TRALI ?', 'Une augmentation inflammatoire de la perméabilité capillaire pulmonaire.', 'b00134'),
    card('Quels produits exposent le plus au TRALI ?', 'Les produits riches en plasma, surtout plasma et plaquettes.', 'b00134'),
    card('Quel traitement spécifique existe pour le TRALI ?', 'Aucun ; la prise en charge est celle d’un SDRA.', 'b00134'),
    card('Quelle est l’incidence rapportée du TACO ?', 'Environ 1 à 8 % des transfusions.', 'b00135'),
    card('Quel mécanisme produit le TACO ?', 'Une hausse hydrostatique pulmonaire par surcharge circulatoire.', 'b00135'),
    card('Quels signes orientent vers un TACO ?', 'HTA, bilan positif, BNP ou PVC élevés et insuffisance cardiaque gauche.', 'b00135'),
    card('Comment prévenir un TACO chez un patient à risque ?', 'Débit transfusionnel lent et diurétique adapté.', 'b00135'),
    card('Dans quel délai survient une allergie transfusionnelle ?', 'Pendant la transfusion ou dans les quatre heures.', 'b00138'),
    card('Comment traiter une urticaire transfusionnelle isolée ?', 'Par antihistaminique après évaluation et exclusion d’une forme grave.', 'b00138'),
    card('Quelle conduite impose une anaphylaxie transfusionnelle ?', 'Arrêter la transfusion et traiter immédiatement comme toute anaphylaxie.', ['b00138', 'b00139']),
    card('Qu’est-ce que le TRIM ?', 'Une immunomodulation liée aux leucocytes, médiateurs ou HLA transfusés.', ['b00140', 'b00141']),
    card('Quand survient un purpura post-transfusionnel ?', 'Cinq à dix jours après une transfusion de plaquettes.', 'b00145'),
    card('Comment prévenir la maladie du greffon contre l’hôte ?', 'Par irradiation des CGR chez les patients à risque.', 'b00146'),
    card('Quel dosage évalue l’hypocalcémie citratée ?', 'Le calcium ionisé, et non le calcium total.', ['b00148', 'b00149']),
    card('À quel rythme surveiller ou supplémenter le calcium en protocole massif ?', 'Toutes les quatre à huit heures selon la vitesse de transfusion.', ['b00149', 'b00150']),
    card('Pourquoi une transfusion massive peut-elle causer une hyperkaliémie ?', 'Les globules rouges stockés libèrent du potassium.', 'b00150'),
    card('Pourquoi réchauffer les produits sanguins ?', 'Pour prévenir l’hypothermie et la coagulopathie enzymatique.', 'b00150'),
    card('Quel est l’objectif du patient blood management ?', 'Optimiser l’anémie, réduire les pertes et réserver la transfusion utile.', 'b00154'),
    card('Pourquoi la décision transfusionnelle a-t-elle un index étroit ?', 'Transfuser et ne pas transfuser comportent chacun un risque potentiellement grave.', ['b00151', 'b00152', 'b00161']),
  ];
}

const qcm = (enonce, sourceBlocks, correction_generale, items, newInformation) => ({
  enonce: newInformation ? `${newInformation} ${enonce}` : enonce,
  format: 'qcm', sourceBlocks, correction_generale,
  ...(newInformation ? { newInformation } : {}),
  items: items.map(([is_correct, itemEnonce, justification], index) => ({
    lettre: 'ABCDE'[index], enonce: itemEnonce, is_correct, justification,
  })),
});

const qroc = (enonce, reponse_attendue, sourceBlocks, correction_generale, newInformation) => ({
  enonce: newInformation ? `${newInformation} ${enonce}` : enonce,
  format: 'qroc', reponse_attendue, sourceBlocks, correction_generale, items: [],
  ...(newInformation ? { newInformation } : {}),
});

const QCM_SERIES = [
  {
    label: 'QCM — Série 1 · Transport de l’oxygène', allowed_voies: ['interne'], questions: [
      qcm('Quels paramètres interviennent directement dans la délivrance systémique en oxygène ?', src('b00007', 'b00008', 'b00009', 'b00012'), 'La DO₂ associe le débit cardiaque au contenu artériel, lui-même dominé par saturation et concentration d’hémoglobine.', [
        [false, 'La pression veineuse centrale, qui fixe le contenu artériel en oxygène.', 'La DO₂ combine débit cardiaque et CaO₂, deux termes où la pression veineuse centrale n’apparaît pas.'],
        [true, 'La saturation artérielle en oxygène.', 'La SaO₂ détermine la proportion de sites de l’hémoglobine occupés par l’oxygène.'],
        [false, 'La numération leucocytaire.', 'Les leucocytes n’entrent dans aucune composante de l’équation de DO₂.'],
        [false, 'Le contenu veineux en oxygène, second terme du produit qui définit la DO₂.', 'Le CvO₂ appartient à l’équation de Fick de la consommation, pas à celle de la délivrance.'],
        [false, 'Le coefficient 1,34 appliqué à l’oxygène dissous dans le plasma.', 'Ce coefficient multiplie l’hémoglobine saturée, alors que la fraction dissoute utilise 0,003 fois la PaO₂.'],
      ]),
      qcm('Quelles situations diminuent la délivrance ou l’utilisation tissulaire de l’oxygène ?', src('b00013', 'b00014', 'b00015', 'b00016'), 'L’hypoxie peut provenir de l’oxygénation, du transport sanguin, du débit ou de l’utilisation cellulaire.', [
        [true, 'Une hypoxémie artérielle.', 'Elle réduit la saturation et donc le contenu artériel en oxygène.'],
        [false, 'Une augmentation compensatrice du débit cardiaque.', 'Cette adaptation tend à restaurer DO₂ plutôt qu’à la diminuer.'],
        [true, 'Une anémie profonde.', 'La baisse d’hémoglobine diminue directement la capacité de transport.'],
        [true, 'Un bas débit cardiaque.', 'Même un sang bien oxygéné livre peu d’oxygène si le flux est insuffisant.'],
        [true, 'Une hypoxie cytotoxique.', 'La cellule ne peut alors utiliser correctement l’oxygène qui lui parvient.'],
      ]),
      qcm('Quels mécanismes compensent une anémie chronique ?', src('b00017', 'b00018', 'b00019', 'b00020', 'b00023'), 'Une adaptation efficace combine hausse du flux, modération de la demande et libération périphérique facilitée.', [
        [false, 'Une diminution systématique du débit cardiaque.', 'La réponse physiologique habituelle augmente le flux pour compenser CaO₂.'],
        [false, 'Une augmentation de l’affinité de l’hémoglobine pour l’oxygène.', 'L’élévation du 2,3-BPG déplace la courbe de dissociation vers la droite, donc vers une affinité réduite.'],
        [true, 'Une diminution de la consommation d’oxygène.', 'La demande tissulaire peut être abaissée pour rejoindre l’apport disponible.'],
        [false, 'Une disparition immédiate du 2,3-BPG.', 'Le 2,3-BPG augmente au contraire afin d’aider la libération d’oxygène.'],
        [true, 'Une augmentation du 2,3-BPG.', 'Elle déplace la dissociation de l’oxyhémoglobine vers une délivrance périphérique accrue.'],
      ]),
      qcm('Quelles données rendent un seuil d’hémoglobine insuffisant à lui seul ?', src('b00021', 'b00022', 'b00023', 'b00050', 'b00059'), 'La décision dépend du caractère aigu, de la tolérance et des réserves physiologiques autant que du chiffre mesuré.', [
        [true, 'La cinétique du saignement.', 'Une perte active peut rendre obsolète une valeur issue d’un prélèvement antérieur.'],
        [true, 'La capacité à augmenter le débit cardiaque.', 'Une réserve cardiovasculaire limitée réduit la tolérance à l’anémie.'],
        [true, 'Les signes persistants d’ischémie.', 'Ils témoignent d’un apport devenu insuffisant malgré l’optimisation hémodynamique.'],
        [true, 'Un syndrome coronarien aigu ou une hémorragie cérébrale associés.', 'Ces situations spécifiques font retenir un repère plus élevé, proche de 9 g/dL.'],
        [true, 'La consommation métabolique du patient.', 'Une demande élevée impose une délivrance supérieure pour prévenir l’hypoxie.'],
      ]),
      qcm('Quelles affirmations décrivent correctement les seuils de CGR ?', src('b00051', 'b00052', 'b00053', 'b00054', 'b00055', 'b00059'), 'La stratégie restrictive autour de 7 g/dL domine, avec individualisation cardiovasculaire et clinique.', [
        [true, 'Un seuil proche de 7 g/dL convient à la majorité des patients sans particularité.', 'Cette valeur constitue le repère restrictif le mieux accepté.'],
        [false, 'Un seuil unique de 6 g/dL s’applique en périopératoire chez le coronarien.', 'Le terrain cardiovasculaire conduit à un repère plus haut, de 8 à 9 g/dL en périopératoire.'],
        [false, 'Tout patient doit être transfusé dès que son Hb passe sous 10 g/dL.', 'Un seuil universel à 10 g/dL expose à des transfusions inutiles.'],
        [true, 'Une insuffisance coronaire aiguë peut justifier une cible plus haute.', 'Le myocarde ischémique tolère mal une réduction importante du contenu artériel.'],
        [false, 'Le délai d’approvisionnement n’influence jamais la décision.', 'En hémorragie évolutive, ce délai doit être anticipé dans la stratégie.'],
      ]),
    ],
  },
  {
    label: 'QCM — Série 2 · Hémostase et déficits', allowed_voies: ['interne'], questions: [
      qcm('Quels événements appartiennent à l’hémostase primaire ?', src('b00026', 'b00027'), 'L’hémostase primaire construit un clou plaquettaire par adhésion, activation et agrégation au site endothélial lésé.', [
        [true, 'L’adhésion des plaquettes au site de rupture endothéliale.', 'Le traumatisme tissulaire expose les structures auxquelles les plaquettes se fixent.'],
        [true, 'La modification de conformation des plaquettes adhérentes.', 'Cette transformation accompagne leur activation locale.'],
        [false, 'La conversion directe du fibrinogène en fibrine par les plaquettes.', 'Cette conversion relève de la thrombine pendant l’hémostase secondaire.'],
        [true, 'La sécrétion de médiateurs recrutant d’autres plaquettes.', 'Adénosine, sérotonine et calcium amplifient l’activation.'],
        [true, 'L’agrégation des plaquettes activées.', 'Leur liaison mutuelle édifie la base du clou.'],
      ]),
      qcm('Quelles étapes caractérisent la génération de fibrine ?', src('b00028', 'b00029'), 'Les voies initiales convergent vers Xa, puis prothrombinase, thrombine et fibrine stabilisée.', [
        [false, 'La thrombine est produite par le facteur tissulaire, en court-circuitant le facteur X.', 'Les deux voies convergent vers l’activation du facteur X, indispensable à la formation de la prothrombinase.'],
        [false, 'Le facteur X activé détruit directement le fibrinogène.', 'Xa génère la thrombine via la prothrombinase ; il ne clive pas directement le fibrinogène.'],
        [true, 'Le facteur V participe au complexe prothrombinase.', 'Va sert de cofacteur à Xa pour accélérer la formation de thrombine.'],
        [true, 'La thrombine transforme le fibrinogène en fibrine.', 'Cette réaction produit le réseau protéique consolidant le clou.'],
        [true, 'Le facteur XIII stabilise la fibrine polymérisée.', 'Il renforce la toile qui piège les éléments figurés du sang.'],
      ]),
      qcm('Quels mécanismes s’opposent à l’extension du thrombus ?', src('b00030', 'b00031', 'b00032'), 'Les inhibiteurs physiologiques freinent la coagulation et la plasmine élimine secondairement la fibrine.', [
        [false, 'L’activation permanente de toutes les protéases circulantes.', 'Une activation non régulée favoriserait une thrombose diffuse.'],
        [true, 'Le tissue factor pathway inhibitor.', 'Il limite l’activité de la voie déclenchée par le facteur tissulaire.'],
        [true, 'L’antithrombine.', 'Elle neutralise plusieurs protéases actives de la coagulation.'],
        [true, 'La protéine C.', 'Ce système anticoagulant réduit l’amplification enzymatique.'],
        [true, 'La plasmine.', 'Elle dégrade la fibrine lorsque le thrombus doit être lysé.'],
      ]),
      qcm('Quels couples déficit-traitement sont cohérents ?', src('b00033', 'b00034', 'b00035', 'b00036', 'b00037'), 'La thérapeutique doit viser plaquettes, facteurs, fibrinogène ou fibrinolyse selon l’anomalie dominante.', [
        [false, 'Thrombopénie hémorragique — concentré de complexe prothrombinique.', 'Le CCP apporte des facteurs vitamine K dépendants et n’ajoute aucune plaquette circulante.'],
        [true, 'Déficit multiple en facteurs avec saignement — plasma.', 'Le plasma fournit un ensemble de facteurs de coagulation.'],
        [false, 'Hypofibrinogénémie acquise — immunoglobulines humaines intraveineuses.', 'Ce produit module l’immunité et ne fournit pas la protéine terminale de l’hémostase.'],
        [true, 'Hyperfibrinolyse — acide tranexamique.', 'L’antifibrinolytique bloque la dégradation excessive du caillot.'],
        [false, 'Thrombopathie isolée — albumine hyperoncotique.', 'L’albumine augmente la pression oncotique sans restaurer la fonction plaquettaire.'],
      ]),
      qcm('Quelles situations peuvent provoquer une coagulopathie acquise ?', src('b00037'), 'Dilution, consommation, dysfonction plaquettaire et hyperfibrinolyse surviennent dans des contextes périopératoires distincts.', [
        [true, 'Le remplacement massif des pertes par des solutés et des CGR.', 'La dilution appauvrit progressivement facteurs, fibrinogène puis plaquettes.'],
        [true, 'La circulation extracorporelle.', 'Elle altère les plaquettes et peut favoriser l’hyperfibrinolyse.'],
        [true, 'Une coagulation intravasculaire disséminée hémorragique.', 'La consommation des composants hémostatiques entretient le saignement.'],
        [false, 'Une numération plaquettaire normale prouvant une fonction normale.', 'Le nombre de plaquettes ne permet pas d’exclure une thrombopathie.'],
        [true, 'Une transplantation hépatique.', 'Ce contexte associe déficit de synthèse et activation fibrinolytique.'],
      ]),
    ],
  },
  {
    label: 'QCM — Série 3 · Concentrés de globules rouges', allowed_voies: ['interne'], questions: [
      qcm('Quelles mesures contribuent à la sécurité infectieuse des CGR ?', src('b00049', 'b00056'), 'La sécurité combine sélection du donneur, déleucocytation et dépistage direct ou sérologique des agents transmissibles.', [
        [false, 'Une inactivation des pathogènes par pasteurisation dix heures à 60 °C.', 'Cette étape appartient à la préparation de l’albumine et ne s’applique pas aux concentrés de globules rouges.'],
        [false, 'Un traitement systématique de chaque unité par amotosalen.', 'La viroatténuation par amotosalen sécurise le plasma frais congelé et non les hématies.'],
        [true, 'Un dépistage sérologique des principales infections.', 'Antigènes et anticorps identifient de nombreux dons contaminés.'],
        [true, 'Une détection génomique du VIH, du VHB et du VHC.', 'Elle réduit le risque résiduel pendant la fenêtre sérologique.'],
        [false, 'Une conservation systématique à température ambiante.', 'Les CGR doivent rester entre 2 et 6 °C pour préserver leur qualité.'],
      ]),
      qcm('Quelles caractéristiques de conservation des CGR sont exactes ?', src('b00049'), 'La chaîne froide, la solution additive et le délai après délivrance maintiennent la sécurité du produit.', [
        [true, 'Une température de stockage entre 2 et 6 °C.', 'Cette plage ralentit l’altération cellulaire et la prolifération bactérienne.'],
        [false, 'Une agitation continue à 22 °C.', 'Ce mode de conservation correspond aux plaquettes, pas aux globules rouges.'],
        [true, 'Une durée maximale pouvant atteindre 42 jours.', 'La solution additive prolonge la conservation jusqu’à cette échéance.'],
        [true, 'La présence d’adénine, glucose et mannitol.', 'Ces composants soutiennent le métabolisme et la membrane érythrocytaire.'],
        [true, 'Un début de transfusion dans les six heures après réception conforme.', 'Au-delà, les conditions du service ne garantissent plus la chaîne maîtrisée.'],
      ]),
      qcm('Quelles compatibilités ABO concernent les CGR ?', src('b00050', 'b00057'), 'Pour les globules rouges, on évite que les antigènes du donneur rencontrent les anticorps du receveur.', [
        [true, 'Un receveur O reçoit préférentiellement des CGR O.', 'Son plasma contient anti-A et anti-B, incompatibles avec les hématies A, B ou AB.'],
        [false, 'Un receveur B peut recevoir des CGR A si le rhésus est identique.', 'L’anti-A du receveur B détruirait les hématies A quel que soit le phénotype RhD.'],
        [false, 'Un CGR AB est universel.', 'Ses hématies portent les deux antigènes et ne conviennent qu’au receveur AB.'],
        [false, 'Un CGR A convient à un receveur O dont la RAI est négative.', 'Une RAI négative ne supprime pas les anticorps anti-A naturels du receveur O.'],
        [false, 'La compatibilité du plasma suit exactement les mêmes règles.', 'Le sens s’inverse car les anticorps sont apportés par le plasma.'],
      ]),
      qcm('Quels éléments peuvent justifier une transfusion de CGR ?', src('b00050', 'b00051', 'b00052', 'b00053', 'b00054', 'b00055', 'b00059'), 'La décision vise une insuffisance de transport en oxygène objectivée par la clinique et contextualisée par le terrain.', [
        [true, 'Une hypotension persistante malgré l’optimisation du débit.', 'Elle peut traduire une délivrance insuffisante dans un contexte d’anémie.'],
        [false, 'Une Hb à 9,8 g/dL chez tout adulte asymptomatique.', 'Cette valeur isolée ne correspond pas au repère restrictif habituel.'],
        [true, 'Des signes d’ischémie tissulaire associés à l’anémie.', 'Ils signalent que les mécanismes compensateurs ne couvrent plus la demande.'],
        [true, 'Une Hb proche de 7 g/dL chez un patient sans particularité.', 'Ce seuil constitue un repère, à confirmer par l’ensemble de la situation.'],
        [true, 'Une insuffisance coronaire aiguë avec mauvaise tolérance.', 'Le terrain myocardique peut nécessiter un seuil plus élevé.'],
      ]),
      qcm('Quelles transformations peuvent être appliquées à un CGR pour une indication rare ?', src('b00049'), 'Les transformations modifient certaines composantes du produit pour répondre à un risque immunologique ou logistique précis.', [
        [true, 'L’irradiation.', 'Elle inactive les lymphocytes capables de provoquer une maladie du greffon contre l’hôte.'],
        [false, 'La déleucocytation, réservée à quelques indications immunologiques rares.', 'La filtration leucocytaire est obligatoire en France pour tous les produits sanguins labiles.'],
        [false, 'La reconstitution en moins de six minutes avec 200 mL d’eau pour préparation injectable.', 'Cette préparation décrit le plasma lyophilisé et ne concerne pas les hématies.'],
        [false, 'La lyophilisation systématique des hématies.', 'Les CGR cliniques ne sont pas transformés en poudre avant transfusion.'],
        [false, 'L’agitation continue entre 20 et 24 °C pendant cinq jours.', 'Ce mode de conservation caractérise les concentrés plaquettaires.'],
      ]),
    ],
  },
  {
    label: 'QCM — Série 4 · Plasma, plaquettes et cryoprécipités', allowed_voies: ['interne'], questions: [
      qcm('Quelles affirmations concernent le plasma thérapeutique ?', src('b00061', 'b00062', 'b00065'), 'Le plasma exige compatibilité ABO, délai de préparation et indication hémostatique documentée.', [
        [true, 'Le plasma AB peut être transfusé à tout groupe ABO.', 'Il n’apporte ni anti-A ni anti-B responsables d’une hémolyse majeure.'],
        [false, 'Le plasma O est universel.', 'Il contient anti-A et anti-B et ne convient qu’à un receveur O.'],
        [true, 'Le PFC nécessite une décongélation au bain-marie.', 'La préparation à 37 °C dure plusieurs dizaines de minutes.'],
        [true, 'Une dose usuelle est de 10 à 15 mL/kg.', 'Ce volume apporte une quantité pertinente de facteurs déficitaires.'],
        [false, 'Un INR légèrement augmenté sans saignement impose toujours du plasma.', 'L’indication repose sur un déficit significatif associé au risque hémorragique.'],
      ]),
      qcm('Quels avantages appartiennent au plasma lyophilisé ?', src('b00064'), 'Le PLYO privilégie rapidité, universalité et autonomie logistique au prix d’une fabrication plus complexe.', [
        [true, 'Une reconstitution en moins de six minutes.', 'Il évite l’attente de 30 à 50 minutes propre au PFC.'],
        [true, 'Une conservation possible entre 2 et 25 °C.', 'L’absence de stockage négatif facilite les environnements isolés.'],
        [true, 'Une compatibilité universelle.', 'Le mélange est exempt d’anticorps immuns anti-A ou anti-B.'],
        [false, 'Une production moins coûteuse que le PFC.', 'La chaîne spécifique rend ce produit plus onéreux.'],
        [true, 'Une utilité en transport aéromédical.', 'Son autonomie thermique et sa rapidité conviennent à ce contexte.'],
      ]),
      qcm('Quelles règles encadrent les concentrés plaquettaires ?', src('b00067', 'b00068', 'b00069', 'b00070', 'b00071', 'b00072', 'b00073', 'b00074'), 'Conservation à température contrôlée et seuil adapté au geste évitent sous- et sur-transfusion.', [
        [false, 'Ils doivent être maintenus au réfrigérateur entre 2 et 6 °C jusqu’à la pose.', 'Les plaquettes se conservent entre 20 et 24 °C sous agitation, le froid altérant leur fonction.'],
        [false, 'Ils se conservent 42 jours.', 'Leur durée maximale habituelle est de cinq jours.'],
        [true, 'Une cible de 50 G/L convient à beaucoup de gestes invasifs.', 'Chirurgie, rachianesthésie et césarienne utilisent ce repère.'],
        [true, 'Une péridurale nécessite une cible plus haute.', 'Le repère donné est de 70 à 80 G/L.'],
        [true, 'La neurochirurgie vise environ 100 G/L.', 'La gravité d’un saignement intracrânien justifie cette marge.'],
      ]),
      qcm('Quelles indications relèvent d’une transfusion plaquettaire curative ?', src('b00074'), 'La correction curative vise un saignement entretenu par un déficit quantitatif ou fonctionnel des plaquettes.', [
        [false, 'Une numération plaquettaire à 120 G/L sans trouble fonctionnel documenté.', 'La transfusion curative répond à un déficit quantitatif ou qualitatif, absent dans cette situation.'],
        [true, 'Un saignement sous antiplaquettaire avec thrombopathie probable.', 'La fonction plaquettaire acquise peut être insuffisante malgré une numération correcte.'],
        [false, 'Une prise d’antiplaquettaire sans saignement avant toute procédure mineure.', 'Une transfusion prophylactique systématique n’est pas recommandée.'],
        [false, 'Une hyperfibrinolyse hémorragique documentée au thromboélastogramme.', 'Ce déficit relève de l’acide tranexamique et non d’un apport cellulaire.'],
        [false, 'Une hypofibrinogénémie isolée.', 'Ce déficit demande fibrinogène ou cryoprécipité, pas des plaquettes.'],
      ]),
      qcm('Quelles propriétés décrivent le cryoprécipité ?', src('b00075', 'b00076', 'b00077', 'b00078'), 'Le cryoprécipité concentre de grosses protéines plasmatiques dans un faible volume.', [
        [true, 'Il est obtenu à partir de plasma frais congelé.', 'Le précipité insoluble est récupéré après décongélation froide.'],
        [true, 'Une unité contient environ 500 mg de fibrinogène.', 'Cinq unités apportent ainsi approximativement 2,5 g.'],
        [false, 'Il apporte les facteurs II, VII, IX et X en concentration élevée.', 'Ces facteurs vitamine K dépendants sont ceux du concentré de complexe prothrombinique.'],
        [false, 'Son indication principale est l’anémie isolée.', 'Il n’apporte pas une masse érythrocytaire utile au transport d’oxygène.'],
        [true, 'Une dose adulte augmente le fibrinogène d’environ 1 g/L.', 'Ce rendement guide le calcul initial du remplacement.'],
      ]),
    ],
  },
  {
    label: 'QCM — Série 5 · Dérivés plasmatiques', allowed_voies: ['interne'], questions: [
      qcm('Quelles affirmations décrivent l’albumine ?', src('b00081', 'b00082', 'b00083', 'b00084', 'b00085'), 'L’albumine est un colloïde plasmatique sécurisé, sans supériorité universelle et avec quelques indications ciblées.', [
        [false, 'Elle provient du plasma d’un donneur unique sélectionné.', 'L’albumine est extraite du plasma de plusieurs dons combinés.'],
        [false, 'La formulation à 20 ou 25 % procure une expansion volémique voisine de celle du plasma.', 'L’expansion de la forme hyperoncotique est environ quatre fois supérieure.'],
        [false, 'Elle est supérieure aux cristalloïdes dans toute réanimation.', 'Aucune étude ne démontre une supériorité générale sur ces solutés.'],
        [true, 'Elle peut être envisagée si les besoins en cristalloïdes deviennent importants.', 'Elle constitue alors une alternative colloïde au profil plus favorable que les amidons.'],
        [false, 'Sa demi-vie intravasculaire reste stable chez le patient septique.', 'L’inflammation augmente la perméabilité capillaire, ce qui abaisse et rend très variable cette demi-vie.'],
      ]),
      qcm('Quelles données concernent le concentré de fibrinogène ?', src('b00086', 'b00087'), 'Le produit lyophilisé permet un apport standardisé et rapide, sans preuve de supériorité sur toutes les autres sources.', [
        [false, 'Un flacon reconstitué apporte 2,5 g de fibrinogène dans 70 mL.', 'Ce volume et cette quantité correspondent à une dose adulte de cinq cryoprécipités.'],
        [false, 'La dose de 6 mg/kg augmente le fibrinogène de 1 g/L.', 'La dose indiquée est dix fois supérieure, autour de 60 mg/kg.'],
        [true, 'La cible hémorragique se situe vers 1 à 2 g/L.', 'Elle rejoint les seuils proposés pour le cryoprécipité.'],
        [false, 'Il est extrait directement du sang total au moment du don.', 'Le produit purifié est fabriqué à partir de cryoprécipités, pasteurisé puis lyophilisé.'],
        [false, 'Sa supériorité sur le cryoprécipité est établie.', 'Les données ne démontrent pas cet avantage.'],
      ]),
      qcm('Quelles caractéristiques appartiennent aux immunoglobulines humaines ?', src('b00088', 'b00089', 'b00090'), 'Le mélange plasmatique de milliers de donneurs fournit un répertoire large et module certaines réponses immunes.', [
        [false, 'Elles sont extraites des cryoprécipités après décongélation du plasma.', 'Les immunoglobulines humaines proviennent du plasma, alors que le cryoprécipité fournit surtout du fibrinogène.'],
        [true, 'Elles sont reconnues dans le syndrome de Guillain-Barré.', 'Leur effet immunomodulateur est utile dans cette neuropathie auto-immune.'],
        [true, 'Elles peuvent traiter une myasthénie grave.', 'Elles réduisent temporairement l’activité auto-immune pathogène.'],
        [false, 'Leur efficacité est certaine dans tout choc septique.', 'Cette utilisation demeure controversée.'],
        [true, 'La dose usuelle totale est de 1 à 2 g/kg.', 'Elle peut être répartie selon plusieurs régimes d’administration.'],
      ]),
      qcm('Quelles règles concernent la réversion urgente d’un AVK par CCP ?', src('b00091', 'b00092', 'b00093'), 'Le CCP corrige rapidement les facteurs vitamine K dépendants, tandis que la vitamine K entretient la correction.', [
        [false, 'Le CCP apporte le fibrinogène nécessaire à la formation du caillot.', 'Le concentré contient les facteurs dépendants de la vitamine K, pas la protéine terminale.'],
        [false, 'Une dose de 1 à 2 g/kg est recommandée pour la réversion.', 'Cette posologie correspond aux immunoglobulines, alors que le CCP se dose en unités de facteur IX par kilogramme.'],
        [true, 'Dix milligrammes de vitamine K parentérale doivent être associés.', 'Son délai plus long compense la courte durée du concentré.'],
        [false, 'Le CCP fournit tous les facteurs plasmatiques.', 'Il manque notamment V, XI, XII et XIII.'],
        [true, 'Une dose fixe de 1 500 à 2 000 UI est une option.', 'Cette simplification est de plus en plus recommandée en urgence.'],
      ]),
      qcm('Quelles affirmations concernent les facteurs spécifiques ?', src('b00094', 'b00095', 'b00096', 'b00097'), 'Une fraction coagulante cible un déficit isolé, alors que le VIIa recombinant conserve une indication étroite.', [
        [true, 'Un concentré de facteur IX traite un déficit isolé correspondant.', 'Le remplacement spécifique évite l’apport de facteurs inutiles.'],
        [true, 'Des concentrés VIII–von Willebrand existent.', 'Ils répondent aux déficits de ces protéines liées.'],
        [false, 'Le facteur VIIa recombinant est recommandé pour toute hémorragie massive.', 'Les données ne soutiennent pas son emploi hors indication de routine.'],
        [true, 'Un hémophile avec inhibiteur peut relever du facteur VIIa activé.', 'Le médicament contourne le facteur VIII ou IX rendu inefficace.'],
        [false, 'Les fractions spécifiques remplacent toujours les plaquettes.', 'Elles n’assurent ni adhésion ni agrégation plaquettaire.'],
      ]),
    ],
  },
  {
    label: 'QCM — Série 6 · Prescription et urgence', allowed_voies: ['interne'], questions: [
      qcm('Quelles mesures sécurisent l’attribution prétransfusionnelle ?', src('b00099', 'b00100', 'b00101', 'b00102'), 'L’identitovigilance repose sur deux déterminations fiables, une prescription tracée et une responsabilité explicite.', [
        [false, 'Prélever un seul échantillon lorsque le bracelet d’identité est présent.', 'Le laboratoire doit disposer de deux échantillons pour contrôler doublement l’identification.'],
        [false, 'Confier au même professionnel les deux prélèvements pour garantir la cohérence.', 'Deux préleveurs distincts sont recommandés afin qu’une même erreur d’identité ne soit pas répétée.'],
        [false, 'Étiqueter les tubes loin du patient après la tournée.', 'L’étiquetage différé favorise l’inversion entre receveurs.'],
        [true, 'Faire signer la prescription par un médecin identifié.', 'La décision et son degré d’urgence doivent être attribuables.'],
        [false, 'Valider la prescription oralement lorsque le prescripteur est joignable.', 'Une prescription verbale ne peut être ni tracée ni conservée dans le dossier transfusionnel.'],
      ]),
      qcm('Quelles règles s’appliquent en urgence vitale immédiate ?', src('b00103', 'b00104', 'b00105'), 'L’UVI privilégie une délivrance sans délai, avec produits universels et préservation des stocks rares.', [
        [true, 'La distribution peut précéder le groupe et la RAI.', 'L’hémorragie menace plus vite que ne peuvent revenir les examens.'],
        [true, 'Les CGR O sont utilisés si aucun résultat valide n’existe.', 'Ils évitent les antigènes A et B sur les hématies transfusées.'],
        [true, 'Le plasma AB est privilégié.', 'Il n’apporte pas d’anticorps anti-A ou anti-B.'],
        [true, 'Les CGR O RH négatif sont réservés en priorité aux femmes de moins de 50 ans.', 'Cette réserve protège les patientes en âge de procréer d’une allo-immunisation anti-D.'],
        [true, 'Les prélèvements immunohématologiques restent nécessaires.', 'Ils doivent être transmis dès que possible pour sécuriser la suite.'],
      ]),
      qcm('Que permet habituellement le délai d’une urgence vitale ?', src('b00106', 'b00107'), 'En moins de 30 minutes, la sécurité gagne surtout une détermination RhD, parfois ABO, mais pas une compatibilité complète.', [
        [false, 'Une RAI complète et une épreuve de compatibilité formelle systématiques.', 'Ces examens excèdent généralement le délai disponible.'],
        [true, 'Une détermination de l’antigène RhD.', 'Cette analyse rapide peut orienter le choix Rh des CGR.'],
        [true, 'Parfois un groupage ABO valide.', 'Selon l’organisation, l’ABO peut être disponible avant délivrance.'],
        [true, 'Des CGR O Rh compatibles ou isogroupes.', 'Le résultat disponible conditionne le niveau de précision possible.'],
        [true, 'Une délivrance obtenue en moins de trente minutes.', 'L’urgence vitale se définit précisément par ce délai d’obtention des produits.'],
      ]),
      qcm('Quelles affirmations décrivent l’urgence relative ?', src('b00108', 'b00109', 'b00110'), 'Le délai de deux à trois heures permet une sécurisation immunohématologique presque complète.', [
        [false, 'Le délai disponible reste inférieur à trente minutes.', 'L’urgence relative dispose de deux à trois heures, ce qui autorise l’ensemble des examens immunohématologiques.'],
        [true, 'Les produits sont ABO compatibles.', 'Le temps disponible autorise une sélection adaptée au groupe confirmé.'],
        [true, 'Un phénotypage Rhésus–Kell peut être pris en compte.', 'Cette précision réduit l’allo-immunisation chez certains receveurs.'],
        [false, 'La mention du degré d’urgence devient inutile.', 'Le prescripteur doit l’indiquer explicitement dans toutes les situations.'],
        [true, 'Une compatibilité au laboratoire peut être effectuée si nécessaire.', 'Le délai permet ce contrôle chez un patient immunisé.'],
      ]),
      qcm('Quelles conséquences accompagne le choix d’un degré d’urgence ?', src('b00103', 'b00110'), 'Plus la délivrance est rapide, plus les contrôles disponibles diminuent ; la décision doit rester explicite et proportionnée.', [
        [false, 'Un allongement du délai d’obtention proportionnel au niveau retenu.', 'Le degré d’urgence le plus élevé accélère la délivrance au lieu de la retarder.'],
        [true, 'Une limitation possible de la sécurité immunohématologique.', 'Groupe, RAI ou compatibilité peuvent manquer lorsque chaque minute compte.'],
        [false, 'Une disparition de la responsabilité médicale.', 'Le médecin assume précisément le compromis bénéfice-risque.'],
        [false, 'L’abandon des examens immunohématologiques une fois les produits délivrés.', 'Les analyses doivent être réalisées dès que possible pour sécuriser les transfusions suivantes.'],
        [false, 'L’autorisation d’omettre l’identité du patient.', 'Même dans l’urgence, l’identification disponible doit être rigoureuse et tracée.'],
      ]),
    ],
  },
  {
    label: 'QCM — Série 7 · Épargne et transfusion massive', allowed_voies: ['interne'], questions: [
      qcm('Quelles actions relèvent du patient blood management préopératoire ?', src('b00111', 'b00112', 'b00113', 'b00114', 'b00115'), 'Anticiper le risque permet de corriger l’anémie et les troubles hémostatiques avant le saignement opératoire.', [
        [true, 'Dépister une anémie avant chirurgie programmée.', 'Un diagnostic précoce laisse le temps de traiter la cause.'],
        [true, 'Rechercher une carence martiale.', 'Saturation et ferritine identifient les patients susceptibles de répondre au fer.'],
        [true, 'Réévaluer les traitements interférant avec l’hémostase.', 'Antiagrégants et anticoagulants modifient le risque et la stratégie périopératoire.'],
        [true, 'Administrer un gramme de fer intraveineux en cas d’anémie ferriprive.', 'Une saturation de transferrine sous 20 % ou une ferritine sous 100 µg/L font retenir cette indication.'],
        [true, 'Identifier les chirurgies particulièrement hémorragiques.', 'Le niveau de risque détermine l’intensité de la préparation.'],
      ]),
      qcm('Quelles mesures diminuent le saignement peropératoire ?', src('b00116', 'b00117'), 'La réduction des pertes combine technique chirurgicale, physiologie, antifibrinolyse et gestion raisonnée des fluides.', [
        [true, 'Maintenir la normothermie.', 'Le froid ralentit les enzymes de coagulation et accentue le saignement.'],
        [true, 'Corriger une acidose sévère.', 'Un pH très bas altère l’efficacité des facteurs et des plaquettes.'],
        [true, 'Corriger l’hypocalcémie.', 'Le calcium est un cofacteur indispensable à plusieurs étapes de coagulation.'],
        [true, 'Utiliser le tranexamique dans les indications reconnues.', 'L’inhibition de la fibrinolyse stabilise le caillot formé.'],
        [true, 'Limiter le remplissage vasculaire à environ 4 mL/kg/h.', 'Un apport modéré évite d’élever les pressions et de diluer les facteurs de coagulation.'],
      ]),
      qcm('Quelles règles concernent la récupération sanguine peropératoire ?', src('b00117'), 'Le cell saver épargne des CGR homologues dans les chirurgies majeures si le champ ne contamine pas le sang récupéré.', [
        [false, 'Elle restitue au patient des plaquettes et des facteurs de coagulation fonctionnels.', 'Le procédé lave et réinjecte essentiellement des globules rouges.'],
        [true, 'Elle peut être indiquée en chirurgie vasculaire majeure.', 'Le volume sanguin récupérable peut réduire l’exposition allogénique.'],
        [true, 'Elle a une place en oncologie majeure.', 'Le dispositif peut être envisagé selon le protocole de l’équipe.'],
        [false, 'Elle est recommandée dans un champ infecté.', 'La réinjection ferait courir un risque de contamination systémique.'],
        [false, 'Les colles biologiques sont sans conséquence pour le circuit.', 'Leur présence constitue une contre-indication mentionnée.'],
      ]),
      qcm('Quelles situations peuvent définir précocement une transfusion massive ?', src('b00118', 'b00119', 'b00120', 'b00121'), 'Une définition dynamique déclenche le protocole avant que le décompte historique de 24 heures ne soit atteint.', [
        [true, 'Cinq CGR administrés en trois heures.', 'Ce rythme traduit un besoin rapide et persistant.'],
        [true, 'Trois CGR administrés en une heure.', 'La cinétique horaire signale une hémorragie majeure.'],
        [true, 'La nécessité d’un CGR dès l’accueil d’un traumatisé.', 'Ce besoin initial peut annoncer une consommation massive imminente.'],
        [false, 'Une perfusion d’un litre de cristalloïde sans saignement.', 'Ce remplissage isolé ne définit aucune consommation de produits sanguins.'],
        [false, 'Deux CGR administrés en douze heures chez un patient stable.', 'Ce rythme lent reste très éloigné des repères dynamiques retenus aujourd’hui.'],
      ]),
      qcm('Quels éléments appartiennent à un protocole de transfusion massive ?', src('b00121', 'b00148', 'b00149', 'b00150'), 'L’équilibre des composants doit s’accompagner d’antifibrinolyse et de correction des complications métaboliques.', [
        [false, 'Un apport de plasma réservé aux patients ayant déjà reçu dix CGR.', 'Les recommandations imposent une transfusion de plasma la plus précoce possible.'],
        [false, 'Un mélange de concentrés plaquettaires pour vingt CGR transfusés.', 'Le repère recommandé est d’un mélange plaquettaire pour quatre à six culots.'],
        [true, 'Une administration précoce de tranexamique.', 'Elle limite l’hyperfibrinolyse du choc traumatique.'],
        [true, 'Une surveillance du calcium ionisé.', 'Le citrate administré rapidement peut provoquer une hypocalcémie sévère.'],
        [false, 'Une perfusion rapide de produits froids sans contrôle thermique.', 'Cette conduite favoriserait l’hypothermie et ralentirait les protéases de coagulation.'],
      ]),
    ],
  },
  {
    label: 'QCM — Série 8 · Complications transfusionnelles', allowed_voies: ['interne'], questions: [
      qcm('Quelles données orientent vers une réaction hémolytique aiguë ?', src('b00128', 'b00129', 'b00130'), 'Une incompatibilité, souvent ABO, provoque hémolyse intravasculaire, instabilité et atteinte rénale ou hémostatique.', [
        [true, 'Une fièvre avec frissons pendant la transfusion.', 'Cette association peut accompagner l’activation immunitaire aiguë.'],
        [true, 'Une hémoglobinurie.', 'L’hémoglobine libre filtrée colore les urines après destruction intravasculaire.'],
        [true, 'Une baisse de l’haptoglobine.', 'La protéine est consommée en liant l’hémoglobine plasmatique libre.'],
        [true, 'Une insuffisance rénale aiguë liée à l’hémoglobine libre.', 'La toxicité de l’hémoglobine plasmatique peut altérer la fonction rénale au décours immédiat.'],
        [true, 'Une élévation de la bilirubine et des LDH.', 'Ces marqueurs augmentent lors de la destruction érythrocytaire.'],
      ]),
      qcm('Quelles caractéristiques distinguent une hémolyse retardée ?', src('b00131'), 'Une allo-immunisation antérieure réactivée produit une hémolyse IgG progressive après le premier jour.', [
        [false, 'Elle apparaît toujours dans les premières minutes.', 'Un délai d’au moins 24 heures définit cette forme.'],
        [true, 'Elle peut suivre une grossesse ancienne.', 'La grossesse expose à des antigènes érythrocytaires et peut immuniser.'],
        [true, 'L’augmentation d’Hb peut être insuffisante.', 'Les hématies transfusées sont détruites plus vite que prévu.'],
        [true, 'Un ictère peut apparaître.', 'La dégradation de l’hème augmente progressivement la bilirubine.'],
        [true, 'Les anomalies biologiques évoluent sur plusieurs jours.', 'La réponse anamnestique est plus lente que l’incompatibilité ABO aiguë.'],
      ]),
      qcm('Quelles données orientent vers un TRALI ?', src('b00133', 'b00134'), 'Le TRALI est un œdème lésionnel précoce sans argument dominant pour une surcharge cardiaque.', [
        [true, 'Une hypoxémie aiguë dans les six heures.', 'La proximité temporelle avec la transfusion fait partie de la définition.'],
        [true, 'Des opacités pulmonaires bilatérales.', 'L’augmentation de perméabilité diffuse remplit les espaces alvéolaires.'],
        [false, 'Une hypertension de l’oreillette gauche obligatoire.', 'Son absence aide précisément à distinguer le TRALI du TACO.'],
        [true, 'Une hypotension possible.', 'La réaction inflammatoire peut s’accompagner d’une instabilité vasculaire.'],
        [true, 'Un produit riche en plasma comme facteur de risque.', 'Les anticorps anti-HLA ou anti-granulocytes sont surtout apportés par ces produits.'],
      ]),
      qcm('Quelles données orientent vers un TACO ?', src('b00133', 'b00135', 'b00136'), 'Le TACO associe surcharge hydrique, pression hydrostatique élevée et réponse attendue aux diurétiques.', [
        [true, 'Un bilan liquidien positif.', 'L’excès d’apport favorise la congestion veineuse pulmonaire.'],
        [true, 'Une hypertension artérielle.', 'Elle accompagne fréquemment la surcharge, contrairement au profil hypotensif du TRALI.'],
        [true, 'Une augmentation du BNP.', 'L’étirement ventriculaire libère ce peptide en cas de surcharge.'],
        [true, 'Une dysfonction cardiaque préexistante.', 'La réserve limitée supporte mal l’expansion volémique transfusionnelle.'],
        [false, 'Une prévention par accélération maximale du débit.', 'Une perfusion plus lente réduit le risque chez les patients vulnérables.'],
      ]),
      qcm('Quelles autres complications transfusionnelles sont correctement décrites ?', src('b00137', 'b00138', 'b00140', 'b00141', 'b00144', 'b00145', 'b00146', 'b00148', 'b00150'), 'Allergie, immunomodulation, réactions immunes retardées et troubles métaboliques complètent le spectre transfusionnel.', [
        [false, 'La réaction fébrile non hémolytique impose une antibiothérapie probabiliste.', 'Cette réaction bénigne et autorésolutive reste un diagnostic d’exclusion sans traitement spécifique.'],
        [true, 'Le purpura post-transfusionnel apparaît après cinq à dix jours.', 'Une immunisation HPA-1 provoque alors une thrombopénie sévère.'],
        [true, 'L’irradiation prévient la maladie du greffon contre l’hôte.', 'Elle empêche les lymphocytes transfusés de proliférer chez l’immunodéprimé.'],
        [true, 'Le citrate peut provoquer une hypocalcémie.', 'La chélation du calcium libre devient importante lorsque les produits arrivent rapidement.'],
        [false, 'L’hypothermie améliore l’activité des protéases de coagulation.', 'Le froid les ralentit et aggrave la coagulopathie.'],
      ]),
    ],
  },
];

const DP_QCM_SERIES = [
  {
    label: 'DP QCM 1 · Anémie postopératoire mal tolérée', allowed_voies: ['interne'],
    vignette: 'Une femme de 68 ans est surveillée après une colectomie. Elle a perdu environ 900 mL de sang. Son hémoglobine préopératoire était à 12,6 g/dL. En salle de réveil, elle est pâle, tachycarde à 112/min et sa pression artérielle reste basse malgré une optimisation prudente de la volémie.',
    questions: [
      qcm('Quels déterminants faut-il intégrer pour apprécier sa délivrance en oxygène ?', src('b00007', 'b00008', 'b00009', 'b00012'), 'La délivrance dépend du débit cardiaque et du CaO₂, principalement fixé par Hb et SaO₂.', [
        [true, 'Le débit cardiaque actuel.', 'Une hausse du flux peut compenser partiellement une diminution du contenu artériel.'],
        [true, 'La saturation artérielle.', 'Elle détermine la fraction d’hémoglobine effectivement oxygénée.'],
        [true, 'La masse d’hémoglobine circulante disponible.', 'Elle représente la capacité de transport dominante du sang.'],
        [true, 'La consommation en oxygène à laquelle la délivrance doit s’adapter.', 'L’équation de Fick relie cette consommation au débit cardiaque et à la différence artérioveineuse.'],
        [true, 'La PaO₂ pour la fraction dissoute.', 'Sa contribution est modeste mais figure dans l’équation du CaO₂.'],
      ]),
      qcm('Quelles propositions sont appropriées ?', src('b00050', 'b00051', 'b00059'), 'Une Hb sous 7 g/dL associée à une mauvaise tolérance persistante justifie ici un CGR sans attendre une aggravation ischémique.', [
        [false, 'Administrer 1 g de fer intraveineux pour corriger l’anémie sans délai.', 'Le fer agit sur plusieurs semaines et ne restaure pas immédiatement le transport en oxygène.'],
        [false, 'Administrer du plasma uniquement pour augmenter l’hémoglobine.', 'Le plasma n’apporte pas de masse érythrocytaire.'],
        [true, 'Réévaluer la clinique après la première unité.', 'Hors hémorragie incontrôlée, la réponse guide la poursuite.'],
        [false, 'Considérer que la tachycardie et l’hypotension excluent une origine hémorragique.', 'Ces signes traduisent précisément une mauvaise tolérance et doivent faire chercher un saignement actif.'],
        [false, 'Reporter toute décision jusqu’à une Hb inférieure à 5 g/dL.', 'Un tel délai exposerait une patiente déjà symptomatique à une hypoxie sévère.'],
      ], 'Le contrôle revient avec une Hb à 6,7 g/dL, tandis que tachycardie et hypotension persistent.'),
      qcm('Quels CGR sont compatibles sur le plan ABO ?', src('b00050', 'b00057'), 'Un receveur A peut recevoir des hématies A ou O, avec préférence pour l’isogroupe.', [
        [true, 'Un CGR A.', 'Il respecte l’identité ABO du receveur.'],
        [false, 'Un CGR de phénotype quelconque puisque la RAI est négative.', 'Une RAI négative ne dispense pas du respect de la compatibilité ABO.'],
        [false, 'Un CGR B.', 'L’antigène B serait exposé à l’anti-B plasmatique de la patiente.'],
        [false, 'Un CGR AB.', 'Les hématies AB portent l’antigène B incompatible avec un receveur A.'],
        [true, 'Un CGR A Rh positif.', 'Ce choix est à la fois isogroupe ABO et compatible RhD.'],
      ], 'La patiente est de groupe A Rh positif et sa RAI est négative.'),
      qcm('Quelles surveillances sont prioritaires pendant l’administration ?', src('b00128', 'b00130', 'b00133', 'b00138'), 'La surveillance clinique doit repérer précocement hémolyse, allergie et atteinte pulmonaire.', [
        [true, 'La température et l’apparition de frissons.', 'Une réaction fébrile ou hémolytique peut débuter ainsi.'],
        [true, 'La pression artérielle et la fréquence cardiaque.', 'Hypotension ou hypertension orientent vers des complications différentes.'],
        [true, 'La dyspnée et l’oxygénation.', 'TRALI ou TACO peuvent apparaître pendant ou peu après le produit.'],
        [true, 'L’apparition d’urticaire ou d’un angiœdème.', 'Ces signes signalent une réaction allergique potentiellement évolutive.'],
        [false, 'Uniquement l’hémoglobine du lendemain.', 'Une surveillance différée manquerait une réaction aiguë grave.'],
      ], 'Une unité est débutée après contrôle ultime.'),
      qcm('Quelles hypothèses et actions immédiates sont justes ?', src('b00129', 'b00130', 'b00131'), 'Le tableau impose de considérer une hémolyse aiguë, d’interrompre le produit et d’alerter immédiatement la banque du sang.', [
        [true, 'Suspecter une réaction hémolytique aiguë.', 'Le délai, la douleur, le choc et l’hémoglobinurie sont caractéristiques.'],
        [false, 'Administrer un antihistaminique et reprendre le produit après disparition des signes.', 'Ce tableau évoque une hémolyse aiguë, dont la prise en charge ne relève pas d’un traitement antiallergique.'],
        [false, 'Ralentir simplement le débit et terminer la poche.', 'Une suspicion d’hémolyse interdit de continuer le produit.'],
        [true, 'Prévenir sans délai la banque du sang.', 'Elle doit vérifier identité, compatibilité et produit délivré.'],
        [true, 'Assurer un traitement de soutien hémodynamique et rénal.', 'La prise en charge protège les organes pendant l’élimination de l’hémoglobine libre.'],
      ], 'Après 40 mL, surviennent frissons, douleur lombaire, hypotension et urines rouges.'),
      qcm('Quels résultats sont attendus ?', src('b00130'), 'La destruction érythrocytaire fait baisser Hb et haptoglobine tout en augmentant bilirubine et LDH.', [
        [true, 'Une diminution de l’haptoglobine.', 'Elle se lie à l’hémoglobine libre puis est rapidement consommée.'],
        [true, 'Une augmentation des LDH.', 'Le contenu intracellulaire est libéré lors de la lyse des hématies.'],
        [false, 'Une diminution de la bilirubine.', 'Le catabolisme de l’hème augmente au contraire la bilirubinémie.'],
        [true, 'Une baisse de l’hémoglobine.', 'La masse érythrocytaire circulante diminue brutalement.'],
        [true, 'Une augmentation de la bilirubine.', 'La dégradation de l’hémoglobine produit davantage de pigment biliaire.'],
      ], 'Le laboratoire recherche des arguments d’hémolyse.'),
      qcm('Quelles mesures préviennent principalement cette récidive ?', src('b00099', 'b00100', 'b00101', 'b00102'), 'La prévention repose sur deux prélèvements correctement identifiés et une traçabilité médicale complète.', [
        [true, 'Obtenir deux échantillons distincts avant la transfusion non urgente.', 'Une double détermination rend détectable une discordance de groupe.'],
        [true, 'Faire si possible intervenir deux préleveurs.', 'L’indépendance réduit la répétition de la même confusion d’identité.'],
        [true, 'Identifier le patient au moment de chaque prélèvement.', 'Le lien tube-patient doit être établi au lit, sans étiquetage différé.'],
        [true, 'Vérifier l’identité du receveur au lit juste avant de brancher la poche.', 'Une erreur d’identification au moment de la transfusion figure parmi les causes reconnues d’accident hémolytique.'],
        [true, 'Tracer prescription, produit et réaction dans le dossier.', 'Cette documentation permet suivi clinique et hémovigilance.'],
      ], 'L’enquête retrouve une erreur d’identification au prélèvement initial.'),
    ],
  },
  {
    label: 'DP QCM 2 · Traumatisé et protocole massif', allowed_voies: ['interne'],
    vignette: 'Un homme de 31 ans arrive après un accident de la route avec fracture instable du bassin. Il est confus, marbré, tachycarde à 138/min et hypotendu à 72/38 mmHg. L’échographie retrouve un épanchement intrapéritonéal et le saignement actif est jugé majeur.',
    questions: [
      qcm('Quelles données doivent faire anticiper un besoin transfusionnel massif ?', src('b00118', 'b00119', 'b00120', 'b00121'), 'Le choc hémorragique actif et la nécessité probable de CGR dès l’accueil justifient une alerte précoce.', [
        [true, 'L’instabilité hémodynamique profonde.', 'Elle indique que les pertes dépassent les compensations physiologiques.'],
        [true, 'Un foyer hémorragique anatomique non contrôlé.', 'Le débit de perte risque de persister jusqu’au geste d’hémostase.'],
        [true, 'Le besoin de transfuser dès l’accueil.', 'Cette situation figure parmi les définitions dynamiques proposées.'],
        [true, 'Un besoin de cinq CGR dans les trois premières heures.', 'Cinq culots en trois heures constitue l’un des repères courts retenus aujourd’hui.'],
        [true, 'La nécessité probable de plusieurs produits en peu de temps.', 'La cinétique attendue est plus utile que le total à 24 heures.'],
      ]),
      qcm('Quelles décisions sont adaptées ?', src('b00119', 'b00120', 'b00121'), 'Trois CGR en une heure répondent à une définition dynamique et imposent un protocole massif coordonné.', [
        [false, 'Réserver l’activation du protocole aux patients ayant reçu plus de dix CGR.', 'Trois culots en une heure suffisent déjà à déclencher la procédure.'],
        [true, 'Prévenir la banque du sang du rythme de consommation.', 'Elle peut préparer les lots suivants avant épuisement du stock au bloc.'],
        [false, 'Attendre 24 heures pour confirmer la définition.', 'Le traitement doit précéder la confirmation rétrospective.'],
        [true, 'Poursuivre simultanément le contrôle mécanique du saignement.', 'Aucun produit ne remplace l’hémostase chirurgicale ou radiologique.'],
        [true, 'Organiser une surveillance métabolique rapprochée.', 'Citrate, froid et potassium deviennent rapidement menaçants.'],
      ], 'Trois CGR ont été nécessaires pendant la première heure et l’hémorragie continue.'),
      qcm('Quelles proportions sont cohérentes avec une réanimation hémostatique ?', src('b00121'), 'Un apport précoce de plasma et de plaquettes tend vers un ratio global proche de 1:1:1.', [
        [true, 'Un ratio plasma:CGR compris entre 1:2 et 1:1.', 'Cette plage évite un retard majeur de remplacement des facteurs.'],
        [false, 'Un ratio plasma:CGR de 1:6 jugé suffisant en phase initiale.', 'Les recommandations françaises et européennes situent ce ratio entre 1:2 et 1:1.'],
        [true, 'Une cible plaquettes:plasma:CGR proche de 1:1:1.', 'L’équilibre vise une composition plus proche du sang perdu.'],
        [false, 'Dix CGR avant le premier plasma.', 'Cette séquence laisserait s’installer une coagulopathie dilutionnelle.'],
        [false, 'Aucune plaquette avant la fin du saignement.', 'Les plaquettes participent à l’hémostase active et doivent être disponibles tôt.'],
      ], 'Le premier lot de produits est préparé.'),
      qcm('Quel schéma antifibrinolytique convient ?', src('b00117', 'b00121'), 'Le choc traumatique hémorragique relève d’un tranexamique précoce à 1 g puis 1 g.', [
        [false, 'Administrer 5 g en bolus intraveineux unique.', 'Le schéma retenu est de 1 g en dix minutes, suivi de 1 g sur huit heures.'],
        [false, 'Réserver l’acide tranexamique aux traumatismes datant de plus de douze heures.', 'Le bénéfice du tranexamique s’observe lorsqu’il est donné tôt après le choc hémorragique.'],
        [false, 'Attendre le résultat du fibrinogène avant toute dose.', 'L’efficacité dépend surtout d’une administration précoce.'],
        [true, 'L’intégrer au protocole sans remplacer les produits déficitaires.', 'Le médicament stabilise la fibrine mais n’apporte ni cellules ni facteurs.'],
        [false, 'L’utiliser pour augmenter directement la numération plaquettaire.', 'Le tranexamique n’ajoute aucune plaquette circulante.'],
      ], 'Le traumatisme date de moins de deux heures et aucune contre-indication n’est identifiée.'),
      qcm('Quelles affirmations sont pertinentes ?', src('b00148', 'b00149', 'b00150'), 'Le citrate transfusé chélate le calcium libre ; le calcium ionisé doit guider une supplémentation répétée.', [
        [true, 'Le citrate des produits explique cette hypocalcémie.', 'La charge dépasse ici la capacité de métabolisation du receveur.'],
        [true, 'Le calcium total peut sous-estimer la perturbation fonctionnelle.', 'Il inclut la fraction liée au citrate, biologiquement indisponible.'],
        [true, 'Une supplémentation calcique est indiquée.', 'Le trouble électrique et la coagulopathie justifient une correction rapide.'],
        [true, 'L’allongement du QT peut accompagner cette hypocalcémie.', 'La baisse du calcium ionisé, chélaté par le citrate, retentit sur la repolarisation myocardique.'],
        [true, 'Le contrôle doit être répété selon la vitesse transfusionnelle.', 'Une nouvelle charge de citrate peut reproduire rapidement l’anomalie.'],
      ], 'Après plusieurs poches, le calcium ionisé baisse et le tracé ECG s’allonge.'),
      qcm('Quelles mesures et explications sont justes ?', src('b00148', 'b00150'), 'Le sang froid et le potassium de stockage exposent à coagulopathie et trouble du rythme.', [
        [true, 'Utiliser un réchauffeur de produits sanguins.', 'Il limite l’aggravation de l’hypothermie iatrogène.'],
        [true, 'Réchauffer activement le patient.', 'La normothermie soutient l’activité enzymatique et l’hémostase.'],
        [true, 'Surveiller l’ECG et la kaliémie.', 'Le potassium libéré par les hématies stockées peut devenir arythmogène.'],
        [false, 'Considérer l’hypothermie comme protectrice de la coagulation.', 'Elle ralentit les protéases et accentue le saignement.'],
        [true, 'Poursuivre le contrôle du volume administré.', 'La surcharge s’ajoute aux complications métaboliques du protocole.'],
      ], 'La température centrale atteint 34,5 °C et la kaliémie monte.'),
      qcm('Quelles actions doivent accompagner la sortie du protocole ?', src('b00121', 'b00135', 'b00148', 'b00150'), 'La désescalade réévalue hémostase, métabolisme et surcharge afin d’arrêter les produits devenus inutiles.', [
        [true, 'Réévaluer les besoins plutôt que poursuivre les ratios aveuglément.', 'Une fois l’hémorragie tarie, chaque unité doit répondre à un déficit résiduel.'],
        [true, 'Contrôler calcium ionisé, kaliémie et température.', 'Ces anomalies peuvent persister après la dernière poche.'],
        [true, 'Rechercher un bilan liquidien excessivement positif.', 'L’expansion cumulée peut provoquer un œdème hydrostatique.'],
        [false, 'Maintenir automatiquement le même débit de produits pendant plusieurs heures.', 'La poursuite non justifiée augmente les complications.'],
        [true, 'Documenter les quantités et la chronologie.', 'La traçabilité permet suivi clinique, hémovigilance et analyse du protocole.'],
      ], 'Le saignement est contrôlé après embolisation.'),
    ],
  },
  {
    label: 'DP QCM 3 · Préparation d’une arthroplastie hémorragique', allowed_voies: ['interne'],
    vignette: 'Une femme de 72 ans est adressée quatre semaines avant une reprise de prothèse de hanche. L’intervention est réputée hémorragique. Elle est fatiguée, sans dyspnée ni douleur thoracique, et prend de l’aspirine pour une artériopathie stable.',
    questions: [
      qcm('Quels éléments appartiennent à l’évaluation d’épargne transfusionnelle ?', src('b00113', 'b00114'), 'Le programme préopératoire dépiste anémie, trouble hémostatique, médicaments et risque propre à la chirurgie.', [
        [true, 'Une numération formule sanguine.', 'Elle identifie une anémie ou une thrombopénie corrigeable avant l’intervention.'],
        [false, 'La transfusion prophylactique de deux CGR la veille de l’intervention.', 'L’épargne transfusionnelle vise précisément à éviter cette exposition allogénique inutile.'],
        [true, 'La recherche d’un trouble hémostatique connu.', 'Un déficit congénital ou acquis nécessite une stratégie spécifique.'],
        [true, 'L’estimation du risque hémorragique de la reprise prothétique.', 'Les réinterventions avec adhérences exposent à des pertes accrues.'],
        [false, 'La programmation immédiate sans bilan car la patiente est asymptomatique.', 'L’absence de symptôme n’exclut pas une anémie préopératoire.'],
      ]),
      qcm('Quelles conclusions sont justes ?', src('b00115'), 'Cette anémie avec carence martiale doit être traitée avant la chirurgie, notamment par fer intraveineux.', [
        [false, 'L’hémoglobine mesurée dépasse le seuil d’anémie retenu chez l’homme.', 'Le repère masculin est de 13 g/dL, également au-dessus de la valeur observée.'],
        [true, 'La saturation de transferrine soutient une carence martiale.', 'Elle est inférieure au seuil de 20 %.'],
        [true, 'La ferritine est compatible avec le diagnostic proposé.', 'Elle est sous le repère de 100 µg/L utilisé dans ce contexte.'],
        [true, 'Un gramme de fer IV peut être administré.', 'Cette dose reconstitue rapidement les réserves avant l’intervention.'],
        [false, 'La seule option est une transfusion immédiate de CGR.', 'Le délai disponible permet de traiter la cause sans exposition allogénique.'],
      ], 'Les résultats montrent Hb 10,7 g/dL, ferritine 48 µg/L et saturation de transferrine 14 %.'),
      qcm('Quelles règles concernent une EPO préopératoire ?', src('b00115'), 'En orthopédie hémorragique, une EPO sous-cutanée peut compléter le fer avec contrôle rapproché de l’hémoglobine.', [
        [false, 'L’EPO préopératoire s’adresse aux patients dont l’hémoglobine est inférieure à 8 g/dL.', 'L’intervalle retenu se situe entre 10 et 13 g/dL chez le patient modérément anémique.'],
        [false, 'Les injections se font par voie intraveineuse quotidienne pendant une semaine.', 'Le schéma décrit repose sur une à trois injections sous-cutanées espacées d’une semaine.'],
        [false, 'Aucun contrôle de NFS n’est nécessaire.', 'Le suivi évite une élévation excessive de l’hémoglobine.'],
        [true, 'Le traitement doit être associé à une disponibilité martiale suffisante.', 'L’érythropoïèse stimulée consomme du fer.'],
        [false, 'La transfusion prophylactique de CGR est obligatoire avant la première injection.', 'L’EPO vise précisément à réduire ce recours chez une patiente stable.'],
      ], 'Le risque de saignement reste élevé et l’Hb est comprise entre 10 et 13 g/dL.'),
      qcm('Quelles décisions sont appropriées ?', src('b00115'), 'Le dépassement de 15 g/dL impose l’arrêt des injections et une réévaluation biologique.', [
        [false, 'Poursuivre les injections jusqu’à une hémoglobine de 17 g/dL.', 'Les injections doivent être arrêtées dès que l’hémoglobine dépasse 15 g/dL.'],
        [true, 'Contrôler la numération.', 'La valeur doit être confirmée et surveillée avant l’opération.'],
        [false, 'Doubler la dose pour consolider le résultat.', 'Une stimulation supplémentaire exposerait à une érythrocytose inutile.'],
        [false, 'Programmer une saignée systématique.', 'Aucune telle conduite automatique n’est proposée dans ce contexte.'],
        [true, 'Conserver les autres mesures d’épargne sanguine.', 'L’optimisation de l’hémoglobine ne supprime pas le risque de saignement.'],
      ], 'Après traitement, l’Hb atteint 15,2 g/dL une semaine avant l’intervention.'),
      qcm('Quelles mesures limitent l’hémorragie ?', src('b00116', 'b00117'), 'Hémostase, normothermie, antifibrinolyse et gestion sobre de la pression et des fluides réduisent les pertes.', [
        [true, 'Administrer du tranexamique selon le protocole.', 'La chirurgie orthopédique prothétique fait partie des indications citées.'],
        [true, 'Prévenir l’hypothermie.', 'La baisse de température altère les réactions enzymatiques de coagulation.'],
        [true, 'Corriger une hypocalcémie éventuelle.', 'Le calcium soutient l’activation des facteurs.'],
        [true, 'Adapter une PAM voisine de 65 mmHg au terrain.', 'Éviter une pression excessive peut diminuer le saignement du champ.'],
        [true, 'Réaliser la chirurgie périphérique sous garrot lorsque c’est possible.', 'Le garrot interrompt l’arrivée de sang dans le membre opéré.'],
      ], 'Au bloc, la chirurgie débute avec un risque de pertes important.'),
      qcm('Que peut-on affirmer ?', src('b00117'), 'Le cell saver est pertinent en chirurgie majeure si aucune contamination infectieuse ou biologique ne compromet la réinjection.', [
        [true, 'La récupération peut réduire l’exposition à des CGR homologues.', 'Les hématies du patient sont lavées puis réadministrées.'],
        [true, 'L’absence d’infection du champ est un prérequis favorable.', 'Un champ contaminé contre-indiquerait la réinjection.'],
        [true, 'L’absence de colle biologique autorise la poursuite du circuit.', 'Ces produits constituent une contre-indication mentionnée.'],
        [true, 'La chirurgie cardiaque figure parmi ses meilleures indications.', 'Les pertes prévisibles et volumineuses y rendent la récupération particulièrement rentable.'],
        [true, 'La décision reste intégrée au bilan des pertes.', 'La quantité récupérée doit être confrontée au besoin clinique réel.'],
      ], 'Une poche de récupération peropératoire contient du sang aspiré avant l’utilisation de toute colle et sans infection du champ.'),
      qcm('Quelles propositions sont raisonnables ?', src('b00050', 'b00051', 'b00059', 'b00154'), 'Chez une patiente stable et asymptomatique, l’abstention avec surveillance respecte une stratégie restrictive centrée sur la tolérance.', [
        [true, 'Ne pas transfuser automatiquement sur ce chiffre isolé.', 'La valeur reste au-dessus du repère de 7 g/dL et la tolérance est bonne.'],
        [true, 'Surveiller la cinétique de l’hémoglobine.', 'Une reprise du saignement modifierait rapidement la décision.'],
        [true, 'Réévaluer l’apparition de signes d’ischémie.', 'La clinique pourrait devenir prioritaire sur le seuil numérique.'],
        [true, 'Rechercher une reprise du saignement au niveau du site opératoire.', 'Une hémorragie active transformerait cette anémie bien tolérée en indication transfusionnelle.'],
        [true, 'Poursuivre le traitement de fond de l’anémie.', 'Le patient blood management ne s’arrête pas à la sortie du bloc.'],
      ], 'En fin d’intervention, l’Hb est à 7,5 g/dL, la patiente est stable, normotendue et sans signe d’ischémie.'),
    ],
  },
  {
    label: 'DP QCM 4 · Dyspnée après transfusion chez une patiente fragile', allowed_voies: ['interne'],
    vignette: 'Une femme de 87 ans, porteuse d’une insuffisance cardiaque à fraction d’éjection altérée, est hospitalisée pour une fracture du col fémoral. Deux CGR sont prescrits pour une anémie symptomatique. Son bilan liquidien est déjà positif de 1,5 L.',
    questions: [
      qcm('Quels éléments augmentent son risque de complication pulmonaire hydrostatique ?', src('b00133', 'b00135'), 'Âge très avancé, sexe féminin, dysfonction cardiaque et bilan positif cumulent les déterminants d’un TACO.', [
        [true, 'L’âge supérieur à 85 ans.', 'Cette tranche d’âge est explicitement associée au risque de surcharge transfusionnelle.'],
        [true, 'Le sexe féminin.', 'Il figure parmi les facteurs rapportés pour le TACO.'],
        [true, 'L’insuffisance cardiaque préexistante.', 'La faible réserve ventriculaire tolère mal l’expansion circulatoire.'],
        [true, 'Le bilan hydrique positif.', 'La transfusion s’ajoute à une congestion déjà constituée.'],
        [true, 'Le volume transfusé et son débit d’administration.', 'L’apport rapide élève la pression hydrostatique veineuse pulmonaire chez un patient à réserve limitée.'],
      ]),
      qcm('Quels diagnostics doivent être discutés en premier ?', src('b00132', 'b00133', 'b00134', 'b00135', 'b00136'), 'Dans les six heures, TRALI et TACO constituent les deux causes transfusionnelles pulmonaires majeures à départager.', [
        [true, 'Un TACO.', 'Le terrain et la charge liquidienne rendent la surcharge hautement plausible.'],
        [false, 'Un TRALI, dont la fenêtre de survenue commence vingt-quatre heures après la transfusion.', 'Le TRALI se définit dans les six heures suivant le début de la transfusion.'],
        [false, 'Une hémolyse retardée isolée.', 'Elle apparaît après 24 heures et n’explique pas typiquement cet œdème immédiat.'],
        [false, 'Une immunomodulation transfusionnelle expliquant l’œdème pulmonaire aigu.', 'La TRIM modifie l’activité immunitaire du receveur sans provoquer d’inondation alvéolaire.'],
        [false, 'Un purpura post-transfusionnel.', 'Cette réaction survient plusieurs jours plus tard avec thrombopénie.'],
      ], 'Pendant la seconde unité, une dyspnée aiguë avec opacités bilatérales apparaît.'),
      qcm('Quelle interprétation est la plus cohérente ?', src('b00135'), 'L’association hypertension, pressions de remplissage élevées, BNP et surcharge remplit le profil d’un TACO.', [
        [true, 'Un œdème hydrostatique lié à une surcharge transfusionnelle.', 'Les données convergent vers une augmentation de pression capillaire pulmonaire.'],
        [false, 'Un TRALI pur sans surcharge.', 'Le profil hémodynamique et volémique est opposé à cette interprétation isolée.'],
        [false, 'La nécessité de réunir la totalité des six paramètres pour retenir un TACO.', 'La définition retient l’apparition ou l’aggravation d’au moins trois de ces paramètres.'],
        [false, 'Une réaction allergique cutanée simple.', 'Aucune urticaire n’explique les signes de congestion mesurés.'],
        [true, 'Une complication favorisée par le volume et le débit transfusés.', 'La charge administrée dépasse ici la réserve cardiovasculaire.'],
      ], 'La pression artérielle est à 176/92 mmHg, la PVC augmente, le BNP s’élève et le bilan atteint +2,2 L.'),
      qcm('Quelles mesures thérapeutiques conviennent maintenant ?', src('b00135'), 'Le TACO impose arrêt ou suspension du produit, soutien respiratoire et réduction de la surcharge par diurétiques.', [
        [false, 'Administrer un remplissage vasculaire pour améliorer l’oxygénation.', 'Un apport liquidien supplémentaire aggraverait la pression hydrostatique pulmonaire.'],
        [true, 'Administrer un diurétique.', 'La déplétion réduit la pression veineuse pulmonaire.'],
        [true, 'Fournir un support en oxygène adapté.', 'La défaillance respiratoire doit être corrigée pendant la décongestion.'],
        [false, 'Accélérer la fin de la poche pour libérer l’abord.', 'Cette action augmenterait brutalement la charge circulatoire.'],
        [false, 'Prescrire un antihistaminique comme traitement de première intention.', 'Le TACO relève des diurétiques et du soutien respiratoire, pas d’une thérapeutique antiallergique.'],
      ], 'Le diagnostic de TACO est retenu devant la congestion hypertensive.'),
      qcm('Quels éléments renforcent encore le diagnostic retenu ?', src('b00133', 'b00135', 'b00136'), 'La réponse à la déplétion, associée au profil hypertensif et congestif, soutient davantage le TACO que le TRALI.', [
        [false, 'Une hypotension profonde accompagnant l’épisode.', 'Le TACO s’accompagne plutôt d’une hypertension artérielle.'],
        [true, 'Une baisse parallèle des pressions de remplissage.', 'Elle confirme que la congestion participait aux opacités.'],
        [false, 'Une leucopénie transitoire comme argument principal.', 'Ce signe serait plus volontiers décrit dans le TRALI.'],
        [true, 'Une balance hydrique redevenant moins positive.', 'La correction du volume accompagne l’amélioration clinique.'],
        [false, 'L’absence totale de cardiopathie.', 'La patiente possède au contraire une dysfonction connue très contributive.'],
      ], 'L’état s’améliore nettement après diurétique.'),
      qcm('Quelles stratégies diminuent le risque de récidive ?', src('b00135'), 'Une administration lente, fractionnée et accompagnée d’une gestion diurétique prudente réduit la charge hydrostatique.', [
        [true, 'Utiliser un débit transfusionnel plus faible.', 'Le ventricule dispose de davantage de temps pour s’adapter au volume.'],
        [true, 'Réévaluer après chaque unité.', 'La réponse permet d’arrêter dès que l’objectif clinique est atteint.'],
        [true, 'Envisager un diurétique chez cette patiente à haut risque.', 'Une prévention pharmacologique peut limiter la congestion.'],
        [true, 'Peser le bénéfice attendu face au risque désormais démontré chez elle.', 'La transfusion garde un index thérapeutique étroit qui impose cette mise en balance.'],
        [true, 'Suivre étroitement pression, oxygénation et bilan hydrique.', 'Ces paramètres détectent une surcharge avant un œdème sévère.'],
      ], 'Une transfusion ultérieure devient indispensable pour un saignement actif.'),
      qcm('Si la patiente avait présenté hypotension, fièvre et leucopénie sans élévation des pressions cardiaques, quelles conclusions auraient été justes ?', src('b00134'), 'Un œdème lésionnel sans surcharge, associé à hypotension et leucopénie, aurait orienté vers un TRALI.', [
        [false, 'Une origine hydrostatique resterait la plus probable malgré ce profil.', 'Ce tableau correspond à un œdème lésionnel plutôt qu’à une congestion cardiaque.'],
        [true, 'Le traitement aurait suivi les principes du SDRA.', 'Aucune thérapeutique étiologique spécifique n’est disponible.'],
        [false, 'Les diurétiques auraient constitué le mécanisme thérapeutique essentiel.', 'Ils ne corrigent pas l’atteinte de perméabilité sans surcharge.'],
        [true, 'La temporalité de moins de six heures resterait compatible.', 'Le TRALI est défini dans cette fenêtre après le début de la transfusion.'],
        [true, 'La banque du sang devrait être informée.', 'L’hémovigilance doit analyser le produit et le donneur impliqués.'],
      ], 'L’équipe discute le profil opposé d’un œdème lésionnel sans surcharge cardiaque.'),
    ],
  },
  {
    label: 'DP QCM 5 · Hémorragie du post-partum et déficits combinés', allowed_voies: ['interne'],
    vignette: 'Une femme de 34 ans présente une hémorragie du post-partum après une césarienne en urgence. Le saignement reste actif malgré les gestes obstétricaux initiaux. Elle est tachycarde, sa pression artérielle baisse et l’équipe anticipe une coagulopathie de consommation et de dilution.',
    questions: [
      qcm('Quelles composantes peuvent entretenir ce saignement massif ?', src('b00033', 'b00034', 'b00035', 'b00036', 'b00037'), 'Plaquettes, facteurs, fibrinogène et fibrinolyse doivent être évalués en parallèle dans une hémorragie obstétricale majeure.', [
        [true, 'Une thrombopénie.', 'Un nombre insuffisant de plaquettes fragilise le clou primaire.'],
        [true, 'Un déficit en facteurs de coagulation.', 'La génération de thrombine et de fibrine devient inefficace.'],
        [false, 'Une concentration de fibrinogène maintenue au-dessus de 3 g/L.', 'Le risque hémorragique augmente au-dessous de 1,5 à 2 g/L, pas à cette valeur.'],
        [true, 'Une hyperfibrinolyse.', 'La plasmine peut détruire trop rapidement les caillots formés.'],
        [false, 'Une hyperalbuminémie isolée.', 'Cette anomalie n’explique pas une défaillance de l’hémostase.'],
      ]),
      qcm('Quelles propositions sont adaptées ?', src('b00068', 'b00070', 'b00071', 'b00074'), 'Une thrombopénie hémorragique sous 50 G/L justifie un concentré plaquettaire et une cible au-dessus de ce seuil.', [
        [true, 'Administrer une dose adulte de plaquettes.', 'Le saignement actif et le déficit quantitatif constituent une indication curative.'],
        [true, 'Viser une numération supérieure à 50 G/L.', 'Ce seuil convient à un geste invasif et à une hémostase chirurgicale.'],
        [false, 'Attendre une numération inférieure à 10 G/L.', 'Ce repère prophylactique d’aplasie n’est pas adapté à une hémorragie majeure.'],
        [false, 'Prévoir une hausse de la numération de 200 à 300 G/L après une dose adulte.', 'Un mélange de cinq concentrés ou une aphérèse élève la numération de 30 à 60 G/L.'],
        [false, 'Utiliser l’albumine comme substitut plaquettaire.', 'Elle ne fournit aucune cellule participant à l’agrégation.'],
      ], 'La numération plaquettaire est à 42 G/L avec saignement actif.'),
      qcm('Quelles options sont pertinentes ?', src('b00075', 'b00076', 'b00077', 'b00078', 'b00086', 'b00087'), 'Sous 1,5 à 2 g/L avec saignement, cryoprécipité ou concentré de fibrinogène apportent rapidement le substrat manquant.', [
        [true, 'Administrer un produit riche en fibrinogène.', 'La valeur se situe sous la zone associée à une hausse du risque hémorragique.'],
        [true, 'Utiliser cinq cryoprécipités comme dose adulte si ce produit est disponible.', 'Cette dose apporte environ 2,5 g de fibrinogène.'],
        [true, 'Envisager un concentré de fibrinogène.', 'La poudre reconstituée permet un apport ciblé à faible volume.'],
        [true, 'Viser une fibrinogénémie ramenée au-dessus de 1,5 à 2 g/L.', 'Ce seuil récent remplace le repère historique de 1 g/L.'],
        [true, 'Recontrôler la fibrinogénémie après remplacement.', 'Le rendement attendu guide l’ajustement de la dose suivante.'],
      ], 'Le fibrinogène plasmatique chute à 1,2 g/L.'),
      qcm('Quelles affirmations concernent le plasma ?', src('b00061', 'b00062', 'b00065'), 'Le saignement associé à un déficit multiple sévère en facteurs constitue une indication de plasma à dose efficace.', [
        [false, 'Un TP à 32 % reste au-dessus du repère de déficit retenu.', 'La valeur indiquée comme significative est un TP inférieur à 40 %, franchi ici.'],
        [true, 'Une dose de 10 à 15 mL/kg est habituelle.', 'Un volume suffisant est nécessaire pour modifier les concentrations de facteurs.'],
        [true, 'La compatibilité ABO du plasma doit être respectée.', 'Les anticorps du donneur peuvent réagir avec les hématies de la patiente.'],
        [true, 'Un plasma AB convient à un receveur de n’importe quel groupe ABO.', 'Le plasma AB est dépourvu d’anticorps anti-A et anti-B, ce qui le rend universel.'],
        [true, 'Le délai de décongélation doit être anticipé.', 'Le PFC nécessite 30 à 50 minutes de préparation au bain-marie.'],
      ], 'Le TP est à 32 %, l’INR à 2,4 et le TCA dépasse deux fois le témoin.'),
      qcm('Quelles mesures relèvent d’un protocole massif ?', src('b00119', 'b00120', 'b00121'), 'La cinétique déclenche un protocole équilibré associant plasma, plaquettes et antifibrinolyse précoce.', [
        [true, 'Activer la procédure de transfusion massive.', 'Trois CGR en une heure répondent au critère dynamique.'],
        [true, 'Introduire précocement le plasma.', 'Le remplacement des facteurs ne doit pas attendre une dilution avancée.'],
        [true, 'Tendre vers un ratio global proche de 1:1:1.', 'Cette stratégie remplace cellules et facteurs de façon coordonnée.'],
        [true, 'Administrer du tranexamique précocement.', 'Son efficacité a aussi été observée dans les saignements du post-partum.'],
        [true, 'Associer un contrôle chirurgical ou interventionnel de la cause du saignement.', 'Aucun produit sanguin ne remplace le geste qui arrête l’hémorragie.'],
      ], 'L’hémorragie continue à haut débit et trois CGR sont administrés en une heure.'),
      qcm('Quelles actions sont appropriées ?', src('b00148', 'b00149', 'b00150'), 'Hypocalcémie citratée et hypothermie aggravent ensemble la coagulopathie et doivent être corrigées sans délai.', [
        [true, 'Administrer du calcium selon le contrôle ionisé.', 'La chélation par le citrate réduit la fraction biologiquement active.'],
        [true, 'Réchauffer les produits suivants.', 'Le réchauffement prévient une nouvelle baisse de température.'],
        [false, 'Différer le réchauffement jusqu’à la fin du protocole transfusionnel.', 'L’hypothermie entretient la coagulopathie et doit être corrigée pendant la transfusion.'],
        [false, 'Se fier uniquement au calcium total.', 'Cette mesure inclut le calcium complexé au citrate.'],
        [true, 'Poursuivre une surveillance rapprochée de la kaliémie.', 'La charge de potassium des CGR stockés peut devenir significative.'],
      ], 'Après plusieurs produits, le calcium ionisé baisse et la température atteint 35 °C.'),
      qcm('Quelles priorités restent justifiées ?', src('b00135', 'b00148', 'b00150', 'b00154'), 'Après contrôle, la stratégie individualise les déficits résiduels et recherche surcharge ou toxicité métabolique.', [
        [true, 'Arrêter les produits qui ne répondent plus à un déficit.', 'Le contrôle du saignement modifie le rapport bénéfice-risque de chaque unité.'],
        [false, 'Poursuivre le remplissage vasculaire à haut débit pour compenser les pertes passées.', 'Un apport excessif après l’hémostase expose à une surcharge volémique.'],
        [false, 'Transfuser deux CGR supplémentaires pour ramener l’hémoglobine au-dessus de 10 g/dL.', 'Cette cible dépasse largement les seuils restrictifs retenus hors ischémie active.'],
        [true, 'Documenter la totalité des produits administrés.', 'La traçabilité est indispensable au suivi et à l’hémovigilance.'],
        [false, 'Poursuivre automatiquement un ratio 1:1:1 pendant 24 heures.', 'Le ratio empirique cesse lorsque l’hémorragie massive est terminée.'],
      ], 'L’hémostase est obtenue et les paramètres se stabilisent.'),
    ],
  },
  {
    label: 'DP QCM 6 · Hémorragie intracrânienne sous warfarine', allowed_voies: ['interne'],
    vignette: 'Un homme de 76 ans traité par warfarine pour fibrillation atriale est admis pour céphalée brutale et déficit moteur. Le scanner montre une hémorragie intracérébrale. L’INR est à 4,6 et une intervention neurochirurgicale urgente est discutée.',
    questions: [
      qcm('Quels objectifs sont prioritaires dans cette coagulopathie ?', src('b00091', 'b00092', 'b00093'), 'Il faut restaurer rapidement les facteurs vitamine K dépendants tout en assurant une correction durable.', [
        [true, 'Réduire rapidement l’INR.', 'L’hémorragie cérébrale peut s’étendre tant que les facteurs restent inhibés.'],
        [true, 'Apporter les facteurs II, VII, IX et X.', 'Ce sont les protéines directement réduites par l’AVK.'],
        [true, 'Relancer leur synthèse hépatique par vitamine K.', 'Le concentré agit vite mais son effet ne couvre pas toute la durée de l’AVK.'],
        [true, 'Contrôler l’INR après administration pour vérifier la correction obtenue.', 'La mesure confirme que les protéines déficitaires ont été remplacées efficacement.'],
        [true, 'Ne pas retarder la réversion pour attendre une évolution spontanée.', 'L’urgence neurologique impose une action immédiate.'],
      ]),
      qcm('Quelles caractéristiques soutiennent son utilisation ?', src('b00091', 'b00092'), 'Le CCP concentré et rapidement actif remplace spécifiquement les facteurs dépendants de la vitamine K.', [
        [true, 'Il contient les facteurs II, VII, IX et X.', 'Ce spectre correspond à l’anticoagulation par warfarine.'],
        [true, 'Il est lyophilisé et reconstitué rapidement.', 'Sa disponibilité évite le délai de décongélation du plasma.'],
        [true, 'Son faible volume convient à une urgence neurochirurgicale.', 'Il limite la surcharge chez un patient souvent âgé.'],
        [true, 'Son activité est exprimée à 25 unités de facteur IX par millilitre.', 'Cette concentration standardise le calcul de la dose en unités par kilogramme.'],
        [true, 'Son délai d’action est court.', 'La concentration des facteurs corrige rapidement l’hémostase.'],
      ], 'Le CCP quatre facteurs est immédiatement disponible.'),
      qcm('Quelles prescriptions sont cohérentes ?', src('b00092'), 'Une dose pondérale se situe entre 1 750 et 3 500 UI ; une dose fixe de 1 500 à 2 000 UI est aussi proposée.', [
        [true, '1 750 UI correspond à 25 UI/kg.', 'Le calcul multiplie 70 kg par 25 unités.'],
        [true, '3 500 UI correspond à 50 UI/kg.', 'Cette dose constitue l’extrémité haute de la plage.'],
        [false, 'Une dose de 25 à 50 UI/kg correspond ici à 175 à 350 unités.', 'Le calcul pour 70 kg donne 1 750 à 3 500 unités, soit dix fois plus.'],
        [false, '70 UI au total constitue une dose thérapeutique.', 'Cette quantité est très inférieure à la plage nécessaire.'],
        [false, 'La dose doit être exprimée en grammes de fibrinogène.', 'L’activité du CCP est mesurée en unités de facteur IX.'],
      ], 'Le poids est de 70 kg et le protocole utilise 25 à 50 UI/kg.'),
      qcm('Le CCP est injecté. Quel traitement complémentaire doit être administré ?', src('b00092'), 'Dix milligrammes de vitamine K parentérale maintiennent la correction lorsque les facteurs concentrés décroissent.', [
        [true, 'Vitamine K 10 mg par voie parentérale.', 'Cette dose relance la synthèse de facteurs fonctionnels.'],
        [false, 'Aucune vitamine K car elle agirait trop vite.', 'Son action est au contraire plus lente et complémentaire du CCP.'],
        [true, 'Une administration sans attendre la fin d’effet du CCP.', 'Le délai de synthèse impose de débuter immédiatement.'],
        [true, 'Une surveillance prolongée car la demi-vie des facteurs apportés varie de 4 à 60 heures.', 'Le facteur VII décroît en quelques heures alors que le facteur II persiste bien plus longtemps.'],
        [true, 'Un contrôle ultérieur de l’INR.', 'La mesure vérifie la correction et sa stabilité.'],
      ], 'Le CCP est injecté et l’équipe prépare la correction durable qui doit prendre le relais de son effet bref.'),
      qcm('Quelles limites sont exactes ?', src('b00092', 'b00093'), 'L’absence de plusieurs facteurs explique pourquoi le CCP ne corrige pas toutes les coagulopathies.', [
        [false, 'Il apporte le facteur XIII nécessaire à la stabilisation de la fibrine.', 'Cette protéine figure parmi celles qui manquent au concentré.'],
        [true, 'Il ne fournit pas le facteur XI.', 'Le spectre quatre facteurs ne couvre pas cette protéase intrinsèque.'],
        [false, 'Il remplace intégralement le plasma dans une coagulopathie dilutionnelle.', 'Son spectre limité aux protéines vitamine K dépendantes laisse de côté plusieurs déficits.'],
        [false, 'Il ne contient pas de facteur IX.', 'Le facteur IX sert précisément de référence d’activité du produit.'],
        [true, 'Son rôle dans une transfusion massive non liée aux AVK reste incertain.', 'Le spectre incomplet ne remplace pas un protocole équilibré.'],
      ], 'L’équipe rappelle que le CCP n’est pas un plasma complet.'),
      qcm('Quelles propositions concernent le plasma ?', src('b00061', 'b00062', 'b00065'), 'Le plasma peut dépanner pour une coagulopathie sous AVK si le CCP manque, au prix d’un délai et d’un volume supérieurs.', [
        [false, 'Il corrige l’INR plus rapidement qu’un concentré de complexe prothrombinique.', 'Le plasma impose une décongélation et un volume important, ce qui retarde la correction.'],
        [true, 'Il nécessite une compatibilité ABO.', 'Les anticorps du donneur imposent le choix du groupe plasmatique.'],
        [false, 'Sa décongélation s’effectue en moins de cinq minutes au bain-marie.', 'La préparation du PFC demande 30 à 50 minutes à 37 °C.'],
        [false, 'La dose habituelle est de 1 à 2 mL/kg comme pour le concentré.', 'Ce volume correspond au CCP, alors que le plasma se prescrit à 10 à 15 mL/kg.'],
        [false, 'Son volume est inférieur à celui du CCP.', 'Le plasma expose au contraire à une charge liquidienne beaucoup plus grande.'],
      ], 'Dans un autre établissement, aucun CCP n’est disponible.'),
      qcm('Quelles données doivent rester tracées ?', src('b00102', 'b00103', 'b00110'), 'La sécurité exige une prescription signée, le degré d’urgence, les produits, les doses et les contrôles obtenus.', [
        [true, 'Le degré d’urgence retenu.', 'Il explique le niveau de sécurisation disponible au moment de la délivrance.'],
        [true, 'La dose et l’heure du CCP.', 'La chronologie permet d’interpréter un éventuel rebond anticoagulant.'],
        [true, 'La dose de vitamine K.', 'Elle conditionne la durée attendue de la réversion.'],
        [true, 'Les INR avant et après traitement.', 'Ils objectivent l’efficacité biologique.'],
        [false, 'Uniquement le diagnostic neurologique.', 'Le dossier transfusionnel doit documenter précisément la thérapeutique.'],
      ], 'L’INR est corrigé et le patient part au bloc.'),
    ],
  },
  {
    label: 'DP QCM 7 · Hémolyse retardée après transfusion', allowed_voies: ['interne'],
    vignette: 'Une femme de 46 ans a reçu deux CGR lors d’une hystérectomie compliquée. La hausse initiale de l’hémoglobine était correcte et la sortie a eu lieu au troisième jour. Elle consulte une semaine plus tard pour fatigue croissante et ictère discret.',
    questions: [
      qcm('Quels diagnostics transfusionnels correspondent à cette temporalité ?', src('b00131', 'b00138', 'b00145'), 'À une semaine, hémolyse retardée et purpura post-transfusionnel sont temporellement possibles, à distinguer par la biologie.', [
        [true, 'Une réaction hémolytique retardée.', 'Elle apparaît au moins 24 heures après les CGR et peut évoluer sur plusieurs jours.'],
        [false, 'Une incompatibilité ABO aiguë typique.', 'Cette réaction aurait débuté pendant la transfusion ou dans les 24 heures.'],
        [false, 'Un purpura post-transfusionnel survenant classiquement dans les six heures.', 'Cette complication apparaît cinq à dix jours après une transfusion de plaquettes.'],
        [false, 'Un TRALI comme cause d’ictère isolé au septième jour.', 'Le TRALI est une atteinte pulmonaire des six premières heures.'],
        [false, 'Une anaphylaxie transfusionnelle retardée d’une semaine.', 'Une allergie transfusionnelle se déclare au plus tard quatre heures après le produit.'],
      ]),
      qcm('Quelles interprétations sont pertinentes ?', src('b00131'), 'La baisse inexpliquée avec plaquettes préservées renforce une destruction érythrocytaire retardée.', [
        [true, 'L’absence de saignement oriente vers une hémolyse.', 'Une perte occulte doit être recherchée, mais n’est pas documentée ici.'],
        [false, 'La chute d’hémoglobine impose d’emblée une nouvelle transfusion de deux CGR.', 'La conduite dépend de la tolérance et du mécanisme, qui doit d’abord être documenté.'],
        [true, 'Une augmentation insuffisante de l’Hb après transfusion est évocatrice.', 'La destruction des hématies raccourcit le bénéfice attendu.'],
        [false, 'Une réaction aiguë est prouvée par le seul taux d’Hb.', 'La chronologie d’une semaine définit plutôt une forme retardée.'],
        [true, 'Il faut prévenir la banque du sang.', 'Elle recherchera un allo-anticorps et sécurisera les futurs produits.'],
      ], 'L’Hb a chuté de 10,1 à 7,9 g/dL sans saignement et les plaquettes sont normales.'),
      qcm('Quelles affirmations sont exactes ?', src('b00130', 'b00131'), 'Le profil biologique confirme une hémolyse évoluant ici sur plusieurs jours.', [
        [true, 'La baisse d’haptoglobine traduit sa consommation.', 'Elle capte l’hémoglobine libérée dans le plasma.'],
        [false, 'Les LDH élevées traduisent une insuffisance hépatique associée.', 'Dans ce contexte, leur élévation accompagne la lyse des hématies transfusées.'],
        [true, 'La bilirubine élevée explique l’ictère.', 'Le catabolisme accru de l’hème produit le pigment.'],
        [false, 'Ce profil exclut toute hémolyse.', 'Les trois anomalies constituent au contraire un faisceau classique.'],
        [false, 'L’haptoglobine augmente lorsqu’elle capte de l’hémoglobine libre.', 'Cette liaison la consomme et abaisse donc son taux plasmatique.'],
      ], 'La bilirubine et les LDH augmentent, tandis que l’haptoglobine baisse.'),
      qcm('Quels mécanismes sont plausibles ?', src('b00129', 'b00131'), 'Une exposition antigénique ancienne peut avoir induit des IgG devenues indétectables puis réactivées par les CGR récents.', [
        [false, 'Une immunisation acquise lors d’une vaccination antérieure.', 'L’allo-immunisation érythrocytaire résulte d’une exposition à des hématies, par transfusion, grossesse ou greffe.'],
        [false, 'Une transmission passive d’anticorps contenus dans le plasma des CGR.', 'La forme retardée provient d’anticorps du receveur, réactivés par une exposition ancienne.'],
        [true, 'Une réponse anamnestique après la transfusion actuelle.', 'La réexposition augmente rapidement le titre des anticorps IgG.'],
        [false, 'Une absence obligatoire de tout anticorps irrégulier.', 'Un anticorps peut être passé sous le seuil de détection avant la réactivation.'],
        [false, 'Une réaction médiée exclusivement par des IgM anti-A.', 'Ce mécanisme correspond surtout à l’hémolyse aiguë ABO.'],
      ], 'La patiente a eu deux grossesses et une transfusion ancienne.'),
      qcm('Quelles actions doivent suivre le diagnostic ?', src('b00131'), 'La prise en charge est de soutien et la banque du sang doit identifier l’anticorps pour les transfusions futures.', [
        [true, 'Informer immédiatement la banque du sang.', 'Elle complète les examens immunohématologiques et trace l’événement.'],
        [true, 'Assurer un traitement symptomatique adapté.', 'Aucun antidote spécifique n’arrête la destruction déjà engagée.'],
        [true, 'Réévaluer la nécessité d’une nouvelle transfusion.', 'L’Hb et la tolérance déterminent le besoin, pas l’anomalie seule.'],
        [true, 'Faire identifier l’allo-anticorps responsable par le laboratoire.', 'Sa spécificité déterminera l’antigène à éviter lors des prochaines unités.'],
        [true, 'Surveiller l’évolution de l’hémoglobine et des marqueurs.', 'La tendance indique l’intensité et la résolution du processus.'],
      ], 'La réaction hémolytique retardée est confirmée.'),
      qcm('Quelles précautions sont adaptées ?', src('b00049', 'b00129', 'b00131'), 'Le laboratoire doit sélectionner des CGR compatibles avec l’allo-anticorps identifié, éventuellement phénotypés.', [
        [false, 'Se limiter à une compatibilité ABO et RhD puisque la RAI initiale était négative.', 'L’allo-anticorps identifié impose de choisir des hématies dépourvues de l’antigène correspondant.'],
        [false, 'Choisir des CGR irradiés, transformation adaptée à cette allo-immunisation.', 'L’irradiation prévient la réaction du greffon contre l’hôte, pas l’hémolyse immune.'],
        [false, 'Administrer des immunoglobulines humaines pour neutraliser l’anticorps identifié.', 'Ce produit module l’immunité mais ne retire pas un anticorps dirigé contre un antigène érythrocytaire.'],
        [false, 'Ignorer l’événement si l’ABO est identique.', 'Les allo-anticorps non ABO restent capables de détruire les CGR.'],
        [true, 'Tracer durablement l’allo-immunisation.', 'L’information doit rester disponible même si le titre redevient indétectable.'],
      ], 'Une nouvelle transfusion devient nécessaire pour une mauvaise tolérance.'),
      qcm('Quelles conclusions résument correctement l’événement ?', src('b00129', 'b00131'), 'Il s’agit d’une complication immunologique retardée, évitable surtout par connaissance des anticorps antérieurs et choix antigénique adapté.', [
        [false, 'L’événement relève d’une erreur d’identification au prélèvement.', 'L’hémolyse retardée résulte ici d’une allo-immunisation ancienne réactivée, pas d’une inversion d’échantillon.'],
        [false, 'Le mécanisme repose sur des IgM activant le complément.', 'La forme retardée met en jeu des IgG issues d’une immunisation antérieure.'],
        [false, 'L’absence de choc exclut l’hémolyse.', 'La forme retardée est souvent moins spectaculaire que l’accident aigu.'],
        [true, 'La hausse insuffisante de l’Hb est un signal important.', 'Elle peut précéder ou accompagner l’ictère.'],
        [true, 'La prévention concerne les transfusions ultérieures.', 'Des CGR antigène négatif réduiront le risque de récidive.'],
      ], 'L’Hb se stabilise sans nouvelle unité.'),
    ],
  },
  {
    label: 'DP QCM 8 · Réaction allergique évolutive au plasma', allowed_voies: ['interne'],
    vignette: 'Un homme de 58 ans reçoit du plasma pour une coagulopathie hémorragique sévère au cours d’une chirurgie hépatique. Après 80 mL, il développe un prurit et des plaques urticariennes diffuses, sans modification initiale de la pression artérielle ni de la ventilation.',
    questions: [
      qcm('Quelles caractéristiques définissent cette première manifestation ?', src('b00137', 'b00138'), 'Une urticaire isolée précoce correspond à la forme allergique transfusionnelle la plus fréquente et généralement bénigne.', [
        [true, 'La temporalité pendant la transfusion est compatible.', 'Les réactions allergiques apparaissent pendant ou dans les quatre heures.'],
        [false, 'Ce tableau impose d’emblée l’arrêt définitif de tout produit sanguin chez ce patient.', 'Une urticaire isolée reste bénigne et n’interdit pas une transfusion ultérieure encadrée.'],
        [true, 'Un mécanisme lié à des protéines ou IgE transférées est possible.', 'L’interaction immunitaire avec le produit explique le tableau.'],
        [false, 'Une hémolyse ABO est certaine.', 'Aucun signe d’hémoglobinurie, choc ou douleur n’est rapporté.'],
        [true, 'Une surveillance rapprochée reste nécessaire.', 'Une réaction apparemment limitée peut progresser vers l’anaphylaxie.'],
      ]),
      qcm('Quelles mesures correspondent à une urticaire isolée ?', src('b00138'), 'Après exclusion de gravité, un antihistaminique traite habituellement la forme cutanée simple.', [
        [true, 'Administrer un antihistaminique.', 'Cette thérapeutique contrôle généralement le prurit et les plaques.'],
        [false, 'Reprendre la transfusion au même débit dès l’injection de l’antihistaminique.', 'Une reprise ne peut être envisagée qu’après élimination des signes de gravité et sur décision médicale.'],
        [false, 'Injecter systématiquement des plaquettes.', 'Elles n’ont aucun rôle dans le mécanisme allergique.'],
        [true, 'Maintenir une surveillance des voies aériennes.', 'Un angiœdème peut apparaître secondairement.'],
        [true, 'Consigner la réaction dans le dossier transfusionnel.', 'L’antécédent doit rester connu avant toute nouvelle prescription de produit sanguin.'],
      ], 'La transfusion est suspendue et le patient reste stable.'),
      qcm('Quelles conclusions sont justes ?', src('b00138', 'b00139'), 'L’atteinte cutanée associée à des défaillances laryngée, respiratoire et hémodynamique définit une anaphylaxie.', [
        [true, 'La réaction est devenue une anaphylaxie.', 'Plusieurs systèmes sont désormais atteints avec instabilité.'],
        [true, 'L’arrêt de la transfusion doit être définitif pour cette poche.', 'La reprise réexposerait immédiatement au déclencheur.'],
        [false, 'Il s’agit encore d’une urticaire bénigne isolée.', 'Bronchospasme, angiœdème et hypotension signent une forme grave.'],
        [true, 'Le pronostic dépend d’un traitement immédiat.', 'L’obstruction et le choc peuvent progresser rapidement.'],
        [true, 'Cette complication peut être mortelle malgré sa rareté.', 'L’anaphylaxie figure parmi les causes majeures de décès transfusionnel.'],
      ], 'Quelques minutes plus tard apparaissent un angiœdème, un bronchospasme et une hypotension.'),
      qcm('Quelles actions thérapeutiques sont indiquées ?', src('b00138', 'b00139'), 'La prise en charge suit celle de toute anaphylaxie en plus de l’arrêt du produit transfusé.', [
        [false, 'Administrer un diurétique pour lever la surcharge responsable de l’hypotension.', 'L’hypotension anaphylactique relève d’une vasoplégie, pas d’une expansion volémique excessive.'],
        [false, 'Réchauffer les produits sanguins pour faire céder le bronchospasme.', 'Le réchauffement prévient l’hypothermie transfusionnelle et n’agit pas sur une réaction allergique.'],
        [false, 'Prescrire du calcium intraveineux comme traitement de l’angiœdème.', 'Le calcium corrige une hypocalcémie citratée et reste sans effet sur l’anaphylaxie.'],
        [false, 'Terminer rapidement le plasma restant.', 'Toute poursuite apporterait davantage de déclencheur.'],
        [true, 'Informer la banque du sang de la réaction grave.', 'L’événement doit être analysé et tracé pour la suite.'],
      ], 'Le diagnostic d’anaphylaxie est retenu au bloc.'),
      qcm('Quels diagnostics alternatifs faut-il avoir recherchés devant l’hypotension ?', src('b00130', 'b00134', 'b00144'), 'L’hypotension transfusionnelle reste un diagnostic d’exclusion après hémolyse, TRALI et allergie sévère.', [
        [false, 'Une hémolyse retardée, seule forme compatible avec cette chute tensionnelle.', 'La forme retardée survient au moins vingt-quatre heures après la transfusion.'],
        [false, 'Un purpura post-transfusionnel, cause classique d’hypotension immédiate.', 'Cette complication survient cinq à dix jours plus tard avec une thrombopénie sévère.'],
        [true, 'Une réaction hypotensive isolée.', 'Elle n’est retenue qu’une fois les causes graves éliminées.'],
        [false, 'Un TACO est exclu sans examiner le bilan hydrique.', 'La surcharge doit être évaluée par le contexte et les pressions.'],
        [false, 'Une réaction fébrile non hémolytique expliquant à elle seule le collapsus.', 'Cette réaction bénigne se limite à une fièvre isolée et autorésolutive.'],
      ], 'Le patient se stabilise après traitement.'),
      qcm('Quelles données doivent guider la décision ?', src('b00065', 'b00138', 'b00151', 'b00154'), 'Après une réaction grave, le produit n’est repris que si le déficit hémorragique persiste et que des alternatives sûres sont organisées.', [
        [false, 'Le caractère bénin et prévisible d’une nouvelle exposition au plasma.', 'Une anaphylaxie transfusionnelle expose à une récidive potentiellement mortelle.'],
        [false, 'La disparition des signes cutanés comme critère suffisant de reprise.', 'La décision repose sur le besoin hémostatique et sur la sécurité du produit choisi.'],
        [false, 'L’obligation de recourir au même produit pour ne pas retarder la correction.', 'Un concentré spécifique peut parfois remplacer le plasma et limiter la réexposition.'],
        [false, 'La simple volonté de normaliser tous les tests.', 'La normalisation biologique sans bénéfice clinique ne justifie pas le risque.'],
        [true, 'L’avis de la banque du sang après l’enquête.', 'Elle conseille la sélection et les précautions pour une transfusion ultérieure.'],
      ], 'Une nouvelle correction de facteurs est envisagée.'),
      qcm('Quelles informations doivent figurer dans le suivi ?', src('b00102', 'b00138', 'b00139'), 'La traçabilité relie produit, chronologie, signes, traitement et conduite future afin d’éviter une réexposition non préparée.', [
        [true, 'Le numéro et le type du produit impliqué.', 'L’identification précise permet l’enquête d’hémovigilance.'],
        [true, 'Le volume reçu avant les premiers signes.', 'Cette donnée décrit l’exposition et la rapidité de la réaction.'],
        [true, 'Les atteintes cutanée, respiratoire et circulatoire.', 'Le caractère multisystémique justifie la classification anaphylactique.'],
        [true, 'Les traitements administrés et leur réponse.', 'Le dossier doit permettre de comprendre l’évolution et les besoins futurs.'],
        [true, 'La conduite retenue pour une éventuelle transfusion ultérieure.', 'L’équipe suivante doit connaître les précautions décidées pour un futur produit.'],
      ], 'La réaction est finalement classée comme anaphylaxie transfusionnelle.'),
    ],
  },
];

const QROC_SERIES = [
  {
    label: 'QROC — Série 1 · Physiologie', allowed_voies: ['externe'], questions: [
      qroc('Quel produit relie débit cardiaque et contenu artériel en oxygène ?', 'Délivrance en oxygène|DO2', src('b00007', 'b00008'), 'La DO₂ correspond au débit cardiaque multiplié par le CaO₂.'),
      qroc('Quel coefficient lie l’hémoglobine à l’oxygène dans CaO₂ ?', '1,34', src('b00009'), 'Un gramme d’hémoglobine fixe approximativement 1,34 mL d’oxygène.'),
      qroc('Quel métabolite favorise la libération périphérique d’O₂ pendant l’anémie ?', '2,3-BPG|2,3-bisphosphoglycérate', src('b00020'), 'Son augmentation facilite la dissociation de l’oxyhémoglobine.'),
      qroc('Quel terme désigne une délivrance en O₂ inférieure à la demande cellulaire ?', 'Choc', src('b00013'), 'L’inadéquation assez profonde pour provoquer une hypoxie cellulaire définit le choc.'),
      qroc('Quelle enzyme transforme le fibrinogène en fibrine ?', 'Thrombine', src('b00029'), 'La thrombine est générée par le complexe prothrombinase.'),
    ],
  },
  {
    label: 'QROC — Série 2 · Produits labiles', allowed_voies: ['externe'], questions: [
      qroc('Quel groupe ABO de CGR dépanne tous les receveurs ?', 'O|Groupe O', src('b00050'), 'Les hématies O ne portent ni antigène A ni antigène B.'),
      qroc('Quel groupe ABO de plasma dépanne tous les receveurs ?', 'AB|Groupe AB', src('b00061'), 'Dépourvu d’anti-A et d’anti-B, le plasma AB évite l’hémolyse des hématies du receveur.'),
      qroc('Quelle plage thermique conserve les CGR ?', '2 à 6 °C|Entre 2 et 6 °C', src('b00049'), 'La chaîne froide maintient leur qualité jusqu’à 42 jours.'),
      qroc('Quelle durée maximale de stockage concerne les plaquettes ?', '5 jours|Cinq jours', src('b00067'), 'Elles sont conservées entre 20 et 24 °C sous agitation.'),
      qroc('Quel volume pondéral de plasma est habituellement administré ?', '10 à 15 mL/kg', src('b00065'), 'Un volume inférieur apporte souvent trop peu de facteurs pour corriger la coagulopathie.'),
    ],
  },
  {
    label: 'QROC — Série 3 · Seuils hémostatiques', allowed_voies: ['externe'], questions: [
      qroc('Quelle cible plaquettaire précède une chirurgie courante ?', '50 G/L|Au moins 50 G/L', src('b00070', 'b00071'), 'Ce repère s’applique aussi à la césarienne et à la rachianesthésie.'),
      qroc('Quelle cible plaquettaire précède une anesthésie péridurale ?', '70 à 80 G/L', src('b00072'), 'Le risque neuraxial conduit à une cible supérieure à celle de la rachianesthésie.'),
      qroc('Quelle cible plaquettaire précède une neurochirurgie ?', '100 G/L', src('b00073'), 'La gravité potentielle d’un hématome intracrânien explique cette valeur.'),
      qroc('Quelle concentration de fibrinogène marque un risque hémorragique accru ?', '1,5 à 2 g/L|Sous 1,5 à 2 g/L', src('b00077'), 'Cette zone remplace progressivement le seuil historique de 1 g/L.'),
      qroc('De combien une dose adulte de plaquettes élève-t-elle habituellement la numération ?', '30 à 60 G/L', src('b00074'), 'Le contrôle post-transfusionnel vérifie ce rendement attendu.'),
    ],
  },
  {
    label: 'QROC — Série 4 · Dérivés plasmatiques', allowed_voies: ['externe'], questions: [
      qroc('Quelle concentration d’albumine est dite hyperoncotique ?', '20 à 25 %|20 % ou 25 %', src('b00082'), 'Cette formulation produit une expansion plusieurs fois supérieure au volume perfusé.'),
      qroc('Quelle dose de fibrinogène augmente la concentration d’environ 1 g/L ?', '60 mg/kg', src('b00087'), 'Le rendement sert à estimer la dose initiale du concentré.'),
      qroc('Quels quatre facteurs de coagulation apporte un CCP ?', 'II, VII, IX et X', src('b00092'), 'Il remplace les facteurs dépendants de la vitamine K.'),
      qroc('Quelle dose parentérale de vitamine K complète le CCP ?', '10 mg', src('b00092'), 'La vitamine K entretient la correction après la décroissance du concentré.'),
      qroc('Quelle dose totale d’immunoglobulines humaines est habituelle ?', '1 à 2 g/kg', src('b00089', 'b00090'), 'Cette dose totale peut être fractionnée sur plusieurs jours selon la maladie et la tolérance.'),
    ],
  },
  {
    label: 'QROC — Série 5 · Prescription et urgence', allowed_voies: ['externe'], questions: [
      qroc('Combien de prélèvements indépendants sécurisent le groupage ?', 'Deux|2', src('b00100', 'b00101', 'b00102'), 'La double détermination limite les erreurs d’attribution.'),
      qroc('Quel délai maximal caractérise l’urgence vitale ?', '30 minutes|Moins de 30 minutes', src('b00106', 'b00107'), 'Ce délai permet surtout la détermination RhD.'),
      qroc('Quel délai caractérise l’urgence relative ?', '2 à 3 heures|Deux à trois heures', src('b00108', 'b00109'), 'Il permet groupage, RAI et sélection compatible.'),
      qroc('Quel groupe Rh doit être préservé pour les femmes en âge de procréer ?', 'O Rh négatif|O négatif', src('b00105'), 'Ces CGR réduisent le risque d’allo-immunisation anti-D.'),
      qroc('Après combien de jours faut-il renouveler une RAI ancienne ?', '3 jours|Trois jours', src('b00109'), 'Une RAI plus ancienne peut manquer un anticorps récemment apparu.'),
    ],
  },
  {
    label: 'QROC — Série 6 · Épargne et protocole massif', allowed_voies: ['externe'], questions: [
      qroc('Quelle dose de fer IV est proposée pour une carence préopératoire ?', '1 g|Un gramme', src('b00115'), 'Cette dose reconstitue rapidement les réserves avant chirurgie.'),
      qroc('À partir de quelle Hb arrête-t-on l’EPO préopératoire ?', '15 g/dL|Au-dessus de 15 g/dL', src('b00115'), 'La NFS entre les injections prévient une hausse excessive.'),
      qroc('Quel objectif de PAM peut limiter les pertes peropératoires ?', 'Environ 65 mmHg|65 mmHg', src('b00117'), 'La cible reste individualisée selon les antécédents.'),
      qroc('Quel ratio global guide une transfusion massive équilibrée ?', '1:1:1', src('b00121'), 'Il rapproche plaquettes, plasma et CGR des proportions du sang perdu.'),
      qroc('Quel schéma de tranexamique suit le bolus de 1 g ?', '1 g sur 8 heures|Un gramme perfusé sur huit heures', src('b00121'), 'La perfusion entretient l’effet antifibrinolytique après le bolus.'),
    ],
  },
  {
    label: 'QROC — Série 7 · Réactions immunes', allowed_voies: ['externe'], questions: [
      qroc('Quel signe urinaire évoque fortement une hémolyse aiguë ?', 'Hémoglobinurie', src('b00130'), 'L’hémoglobine libre est filtrée après la destruction intravasculaire.'),
      qroc('Quelle protéine plasmatique baisse au cours d’une hémolyse ?', 'Haptoglobine', src('b00130', 'b00131'), 'Elle est consommée en captant l’hémoglobine libre.'),
      qroc('Quel délai minimal définit une hémolyse retardée ?', '24 heures|Plus de 24 heures', src('b00131'), 'La réponse anamnestique se développe sur plusieurs jours.'),
      qroc('Quel traitement prévient la maladie du greffon contre l’hôte transfusionnelle ?', 'Irradiation des CGR|CGR irradiés', src('b00146'), 'L’irradiation empêche la prolifération des lymphocytes du donneur.'),
      qroc('Quel délai suit habituellement le purpura post-transfusionnel ?', '5 à 10 jours|Cinq à dix jours', src('b00145'), 'La thrombopénie sévère apparaît après immunisation HPA-1.'),
    ],
  },
  {
    label: 'QROC — Série 8 · Poumon et métabolisme', allowed_voies: ['externe'], questions: [
      qroc('Quel œdème transfusionnel relève d’une perméabilité capillaire accrue ?', 'TRALI', src('b00133', 'b00134'), 'Il survient sans argument dominant pour une hypertension de l’oreillette gauche.'),
      qroc('Quel œdème transfusionnel relève d’une surcharge hydrostatique ?', 'TACO', src('b00133', 'b00135'), 'Le volume transfusé dépasse la réserve cardiovasculaire.'),
      qroc('Quelle fenêtre temporelle commune retient-on pour TRALI et TACO ?', '6 heures|Dans les six heures', src('b00134', 'b00135'), 'Les deux tableaux apparaissent précocement après le produit.'),
      qroc('Quel dosage surveille la toxicité du citrate ?', 'Calcium ionisé', src('b00148', 'b00149'), 'Le calcium total inclut la fraction complexée et peut être trompeur.'),
      qroc('Quel dispositif prévient l’hypothermie transfusionnelle ?', 'Réchauffeur de sang|Réchauffeur de produits sanguins', src('b00150'), 'Les produits froids aggravent la coagulopathie s’ils sont administrés rapidement.'),
    ],
  },
];

const DP_QROC_SERIES = [
  {
    label: 'DP QROC 1 · Anémie en réanimation', allowed_voies: ['externe'],
    vignette: 'Un homme de 64 ans est hospitalisé en réanimation pour pneumonie grave. Son hémoglobine diminue progressivement sans hémorragie extériorisée. Il est ventilé, sa saturation artérielle est correcte et l’équipe évalue la capacité réelle de transport en oxygène avant toute transfusion.',
    questions: [
      qroc('Quelle équation résume la délivrance systémique en oxygène ?', 'DO2 = débit cardiaque × CaO2', src('b00007', 'b00008'), 'Le flux d’oxygène dépend du volume éjecté et du contenu artériel.'),
      qroc('L’Hb est à 6,9 g/dL malgré une saturation correcte. Quel seuil restrictif est franchi ?', '7 g/dL|Environ 7 g/dL', src('b00051', 'b00059'), 'Cette valeur constitue le repère pour la grande majorité des patients.', 'L’Hb est à 6,9 g/dL malgré une saturation correcte.'),
      qroc('La fièvre et le sepsis augmentent les besoins métaboliques. Quelle variable physiologique est accrue ?', 'Consommation en oxygène|VO2', src('b00010', 'b00011', 'b00059'), 'Une demande supérieure réduit la marge entre délivrance et consommation.', 'La fièvre et le sepsis augmentent les besoins métaboliques.'),
      qroc('Une tachycardie et des signes d’ischémie persistent après optimisation hémodynamique. Quel diagnostic fonctionnel justifie la transfusion ?', 'Mauvaise tolérance de l’anémie|Anémie mal tolérée', src('b00050'), 'Les signes persistants indiquent que les compensations ne suffisent plus.', 'Une tachycardie et des signes d’ischémie persistent après optimisation hémodynamique.'),
      qroc('Quel produit augmente directement la capacité de transport en oxygène ?', 'Concentré de globules rouges|CGR', src('b00040', 'b00048', 'b00050'), 'Les hématies apportées augmentent l’hémoglobine et le CaO₂.', 'La décision de remplacer la composante déficitaire est prise.'),
      qroc('Le patient est de groupe B. Quels groupes ABO de CGR sont compatibles ?', 'B ou O|CGR B ou O', src('b00050', 'b00057'), 'Le receveur B possède un anti-A : il tolère des hématies B isogroupes ou O sans antigènes A/B.', 'Le groupage confirme un receveur B Rh positif sans anticorps irrégulier.'),
      qroc('Après une unité, quelle action évite une surtransfusion ?', 'Réévaluation clinique et biologique|Réévaluer après chaque unité', src('b00050', 'b00059', 'b00154'), 'La poursuite dépend de la tolérance, de l’Hb et de la cinétique.', 'Après une unité, la fréquence cardiaque diminue et aucun saignement n’est retrouvé.'),
    ],
  },
  {
    label: 'DP QROC 2 · Coagulopathie hépatique et plasma', allowed_voies: ['externe'],
    vignette: 'Une femme de 59 ans atteinte de cirrhose est opérée en urgence pour une perforation digestive. Un saignement diffus persiste au champ. Les plaquettes sont à 92 G/L et le fibrinogène à 2,1 g/L, mais les temps de coagulation sont très allongés.',
    questions: [
      qroc('Quel produit remplace plusieurs facteurs de coagulation déficitaires ?', 'Plasma thérapeutique|Plasma frais congelé|PFC', src('b00060', 'b00065'), 'Le plasma apporte simultanément un ensemble de facteurs.'),
      qroc('Le TP est à 28 % et l’INR à 2,6. Quel seuil de TP est dépassé ?', 'TP inférieur à 40 %|40 %', src('b00065'), 'Ce repère soutient un déficit sévère associé ici à un saignement.', 'Le TP est à 28 % et l’INR à 2,6.'),
      qroc('La patiente pèse 70 kg et la dose choisie est 15 mL/kg. Quel volume faut-il prescrire ?', '1 050 mL|1050 mL', src('b00065'), 'Soixante-dix multiplié par quinze donne 1 050 mL.', 'La patiente pèse 70 kg et la dose choisie est 15 mL/kg.'),
      qroc('Son groupe est A. Quel plasma ABO universel peut être utilisé ?', 'Plasma AB|AB', src('b00061'), 'Le plasma AB ne contient ni anti-A ni anti-B.', 'Son groupe est A et l’équipe cherche un produit immédiatement compatible.'),
      qroc('Combien de temps faut-il prévoir pour décongeler un PFC ?', '30 à 50 minutes', src('b00062'), 'Le bain-marie à 37 °C impose ce délai logistique.', 'Le dépôt ne dispose que de plasma frais congelé.'),
      qroc('Quel produit plasmatique se reconstitue en moins de six minutes ?', 'Plasma lyophilisé|PLYO', src('b00064'), 'Il évite le délai de décongélation et le stockage négatif.', 'Une équipe mobile voisine apporte une option non réfrigérée disponible en France.'),
      qroc('Quel débit d’administration réduit un risque de surcharge chez cette patiente ?', 'Débit lent|Ralentir la transfusion', src('b00135'), 'Une perfusion ralentie limite l’augmentation de pression hydrostatique.', 'Après stabilisation du saignement, la cardiopathie de la patiente impose de limiter la charge circulatoire.'),
    ],
  },
  {
    label: 'DP QROC 3 · Thrombopénie et geste invasif', allowed_voies: ['externe'],
    vignette: 'Un homme de 38 ans reçoit une chimiothérapie aplasiante pour leucémie aiguë. Il ne saigne pas, mais sa numération plaquettaire diminue chaque jour. Une infection fébrile est contrôlée et aucun anticoagulant n’est administré. L’équipe doit planifier une ponction lombaire, puis envisage une analgésie neuraxiale et anticipe le seuil requis si une complication intracrânienne imposait un geste urgent.',
    questions: [
      qroc('Quelle plage de numération déclenche souvent une prophylaxie en aplasie ?', '10 à 20 G/L', src('b00068', 'b00069'), 'Le seuil exact dépend des autres facteurs de risque hémorragique.'),
      qroc('Une ponction lombaire est programmée avec 34 G/L. Quelle cible faut-il atteindre ?', '50 G/L|Au moins 50 G/L', src('b00070', 'b00071'), 'La ponction lombaire fait partie des gestes invasifs pour lesquels une numération d’au moins 50 G/L est visée.', 'Une ponction lombaire est programmée avec 34 G/L.'),
      qroc('Une analgésie péridurale est ensuite discutée. Quelle cible plus élevée est proposée ?', '70 à 80 G/L', src('b00072'), 'La procédure neuraxiale péridurale utilise ce seuil supérieur.', 'Une analgésie péridurale est ensuite discutée.'),
      qroc('Une hémorragie intracrânienne impose une neurochirurgie. Quelle cible devient nécessaire ?', '100 G/L', src('b00073'), 'Le risque de saignement cérébral justifie cette marge.', 'Une hémorragie intracrânienne impose une neurochirurgie.'),
      qroc('Après une aphérèse plaquettaire, quelle hausse de numération est attendue ?', '30 à 60 G/L', src('b00074'), 'Cette amplitude habituelle doit être vérifiée par une numération.', 'Une aphérèse plaquettaire compatible est transfusée.'),
      qroc('Un épistaxis actif survient avec 43 G/L. Quel type d’indication remplace la prophylaxie ?', 'Indication curative|Transfusion plaquettaire curative', src('b00074'), 'Le saignement associé à la thrombopénie impose une correction active.', 'Un épistaxis actif survient avec 43 G/L.'),
      qroc('À quelle température le concentré est-il conservé avant délivrance ?', '20 à 24 °C', src('b00067'), 'Les plaquettes restent sous agitation continue jusqu’à leur utilisation.', 'La banque prépare une nouvelle dose pour un éventuel geste urgent.'),
    ],
  },
  {
    label: 'DP QROC 4 · Hypofibrinogénémie en chirurgie cardiaque', allowed_voies: ['externe'],
    vignette: 'Un homme de 67 ans présente un saignement diffus après circulation extracorporelle pour remplacement valvulaire. La reprise chirurgicale ne retrouve aucun foyer artériel. La température, l’acidose et le calcium sont corrigés, la numération plaquettaire est acceptable, mais le caillot reste fragile et les drains se remplissent rapidement. L’équipe cible alors le fibrinogène et l’hyperfibrinolyse.',
    questions: [
      qroc('Sous quelle concentration le fibrinogène augmente-t-il le risque de saignement ?', '1,5 à 2 g/L|Sous 1,5 à 2 g/L', src('b00077'), 'Cette zone guide l’apport de fibrinogène en situation hémorragique.'),
      qroc('Le taux mesuré est 1,1 g/L. Combien de fibrinogène contient une unité de cryoprécipité ?', '500 mg|Environ 500 mg', src('b00076'), 'Le produit concentre les grosses protéines du plasma.', 'Le taux mesuré est 1,1 g/L.'),
      qroc('Cinq unités sont regroupées. Quelle quantité totale de fibrinogène apportent-elles ?', '2,5 g', src('b00078'), 'Chaque unité fournit environ 500 mg ; cinq unités constituent donc une dose adulte de 2,5 g.', 'Cinq unités sont regroupées en une dose adulte.'),
      qroc('Quelle hausse plasmatique cette dose produit-elle habituellement ?', 'Environ 1 g/L|1 g/L', src('b00078'), 'Le rendement attendu permet de planifier le contrôle suivant.', 'La dose adulte est administrée sans nouveau saignement massif pendant quelques minutes.'),
      qroc('Quel dosage pondéral d’un concentré purifié donnerait la même hausse ?', '60 mg/kg', src('b00087'), 'Cette dose augmente approximativement la fibrinogénémie de 1 g/L.', 'Un concentré purifié est aussi disponible dans le service.'),
      qroc('Quel antifibrinolytique peut compléter la stratégie ?', 'Acide tranexamique|Tranexamique', src('b00037', 'b00117'), 'Il stabilise la fibrine en inhibant sa dégradation.', 'Le tracé viscoélastique évoque parallèlement une hyperfibrinolyse.'),
      qroc('Quelle technique récupère les hématies perdues pendant cette chirurgie ?', 'Cell saver|Récupération sanguine peropératoire', src('b00117'), 'La chirurgie cardiaque constitue une indication privilégiée.', 'Le champ reste non infecté et aucune colle biologique n’a contaminé l’aspiration.'),
    ],
  },
  {
    label: 'DP QROC 5 · Albumine et cirrhose décompensée', allowed_voies: ['externe'],
    vignette: 'Une femme de 61 ans atteinte de cirrhose est admise pour ascite tendue, hypotension relative et insuffisance rénale débutante. Une ponction évacuatrice de grand volume est programmée. Elle n’a pas de traumatisme crânien ni d’hémorragie active. L’équipe discute le choix entre cristalloïdes et albumine, puis doit adapter la stratégie lorsque l’analyse du liquide d’ascite révèle une infection.',
    questions: [
      qroc('Quelles concentrations définissent l’albumine iso-oncotique ?', '4 à 5 %|4 % ou 5 %', src('b00081', 'b00082'), 'Cette formulation issue du plasma produit une expansion volémique proche de celle du plasma.'),
      qroc('Quelle concentration correspond à la forme hyperoncotique européenne ?', '20 %', src('b00081', 'b00082'), 'La présentation européenne à 20 % correspond à la forme concentrée, souvent dosée à 25 % en Amérique.', 'Le service utilise la présentation européenne.'),
      qroc('Combien de fois son volume la forme hyperoncotique peut-elle expanser le secteur vasculaire ?', 'Environ quatre fois|4 fois', src('b00082', 'b00083'), 'Sa forte pression oncotique peut attirer un volume intravasculaire environ quatre fois supérieur à celui perfusé.', 'La forme à 20 % est choisie pour limiter le volume perfusé.'),
      qroc('Quelle procédure hépatique soutient cette indication ?', 'Drainage d’ascite|Ponction évacuatrice d’ascite', src('b00084'), 'Après évacuation de grand volume, l’albumine limite l’instabilité circulatoire liée au déplacement liquidien.', 'Plusieurs litres d’ascite sont finalement retirés.'),
      qroc('Quelle infection de l’ascite constitue une autre indication ?', 'Péritonite bactérienne spontanée', src('b00084', 'b00085'), 'Dans cette infection, l’albumine hyperoncotique contribue à prévenir la dégradation rénale.', 'L’analyse du liquide révèle une infection sans perforation digestive.'),
      qroc('Quel syndrome rénal de cirrhose répond aussi à l’albumine ?', 'Syndrome hépatorénal de type I', src('b00084', 'b00085'), 'Cette indication vise à soutenir la circulation efficace et le rein.', 'La fonction rénale se dégrade rapidement malgré le traitement de l’infection.'),
      qroc('Quelle propriété comparative interdit de préférer systématiquement l’albumine aux cristalloïdes ?', 'Absence de supériorité démontrée|Pas de supériorité générale', src('b00081', 'b00083'), 'Aucune supériorité générale n’est démontrée ; l’albumine se réserve aux besoins importants ou mal couverts.', 'Après correction de l’épisode hépatique, une réanimation liquidienne standard reste nécessaire.'),
    ],
  },
  {
    label: 'DP QROC 6 · Trois degrés d’urgence transfusionnelle', allowed_voies: ['externe'],
    vignette: 'Un homme non identifié est amené pour plaie abdominale avec choc hémorragique. Aucun résultat immunohématologique antérieur n’est accessible. Le chirurgien demande des produits immédiatement pendant que les prélèvements sont envoyés.',
    questions: [
      qroc('Quel degré d’urgence autorise une délivrance sans délai ?', 'Urgence vitale immédiate|UVI', src('b00103', 'b00104', 'b00105'), 'L’hémorragie impose de ne pas attendre groupe ni RAI.'),
      qroc('Quel groupe de CGR est délivré en premier si les stocks le permettent ?', 'O|CGR O', src('b00105'), 'Ces hématies sont compatibles avec tous les groupes ABO.', 'Aucun groupage valide ne revient encore du laboratoire.'),
      qroc('Quel plasma universel accompagne cette délivrance ?', 'Plasma AB|AB', src('b00105'), 'Il ne contient pas d’anticorps anti-A ou anti-B.', 'Un apport de facteurs devient nécessaire avec les premiers CGR.'),
      qroc('À quelle population réserve-t-on surtout les CGR O Rh négatif ?', 'Femmes de moins de 50 ans|Femmes en âge de procréer', src('b00105'), 'Cette politique préserve le stock et prévient l’allo-immunisation anti-D.', 'L’identité confirme ensuite qu’il s’agit d’un homme de 42 ans sans anti-D connu.'),
      qroc('Quel délai définit le niveau d’urgence vitale suivant ?', 'Moins de 30 minutes|30 minutes', src('b00106', 'b00107'), 'Ce temps permet généralement une détermination RhD.', 'L’hémodynamique s’améliore et une courte attente devient possible pour les unités suivantes.'),
      qroc('Quel délai permet l’ensemble des examens d’une urgence relative ?', '2 à 3 heures|Deux à trois heures', src('b00108', 'b00109'), 'Groupage, RAI et compatibilité peuvent alors être réalisés.', 'Le saignement est contrôlé et la prochaine transfusion n’est plus immédiate.'),
      qroc('Quelle mention médicale doit accompagner toute demande accélérée ?', 'Degré d’urgence|Niveau d’urgence retenu', src('b00110'), 'Le prescripteur assume explicitement le compromis entre délai et sécurité.', 'Le dossier est complété après la stabilisation du patient.'),
    ],
  },
  {
    label: 'DP QROC 7 · TRALI chez un patient septique', allowed_voies: ['externe'],
    vignette: 'Un homme de 55 ans est en réanimation pour choc septique. Il reçoit du plasma pour un saignement associé à un déficit sévère en facteurs. Avant la transfusion, il n’a pas d’œdème pulmonaire et son bilan liquidien est modérément positif.',
    questions: [
      qroc('Quel état préalable active les neutrophiles et favorise un TRALI ?', 'État pro-inflammatoire|Sepsis', src('b00133', 'b00134'), 'Le sepsis constitue le premier temps inflammatoire du mécanisme de perméabilité capillaire.'),
      qroc('Quels anticorps transfusés peuvent déclencher la dégranulation ?', 'Anti-HLA II ou anti-granulocytes', src('b00134'), 'Ils activent les neutrophiles déjà sensibilisés dans le poumon.', 'Le produit riche en plasma provient d’un don ancien avant les mesures modernes de sélection.'),
      qroc('Dans quel délai l’hypoxémie doit-elle apparaître pour répondre à la définition ?', 'Moins de 6 heures|Dans les six heures', src('b00132', 'b00134'), 'La relation temporelle de moins de six heures relie l’œdème aigu à la transfusion.', 'Deux heures après le début du plasma, la saturation chute brutalement.'),
      qroc('Quelle pression cardiaque ne doit pas être élevée ?', 'Pression de l’oreillette gauche|Pression capillaire gauche', src('b00133', 'b00134'), 'Son absence distingue l’œdème de perméabilité du TRALI d’une surcharge hydrostatique.', 'L’échographie ne montre pas de congestion ni d’élévation des pressions gauches.'),
      qroc('Quel signe hématologique transitoire peut accompagner le TRALI ?', 'Leucopénie', src('b00134'), 'La séquestration pulmonaire des neutrophiles peut abaisser leur nombre.', 'La fièvre et l’hypotension s’accompagnent d’une baisse brutale des leucocytes.'),
      qroc('Quel syndrome guide le traitement respiratoire ?', 'SDRA|Syndrome de détresse respiratoire aiguë', src('b00134', 'b00136'), 'Le TRALI est traité comme un SDRA, sans médicament spécifique capable d’annuler la réaction.', 'Le diagnostic est retenu après exclusion d’une autre cause d’œdème.'),
      qroc('Quel diagnostic alternatif serait favorisé par HTA, BNP élevé et bilan très positif ?', 'TACO', src('b00135', 'b00136'), 'Ces données indiquent une surcharge hydrostatique.', 'L’équipe formalise les critères qui auraient orienté vers le diagnostic concurrent.'),
    ],
  },
  {
    label: 'DP QROC 8 · Toxicité métabolique d’une transfusion massive', allowed_voies: ['externe'],
    vignette: 'Un homme de 29 ans reçoit rapidement de nombreux produits sanguins après une rupture d’anévrisme artériel traumatique. Le contrôle chirurgical est en cours et les équipes suivent simultanément électrolytes, température et bilan des entrées-sorties.',
    questions: [
      qroc('Quel anticoagulant des poches chélate le calcium ?', 'Citrate de sodium|Citrate', src('b00148'), 'La chélation maintient le produit fluide mais réduit le calcium libre du receveur.'),
      qroc('Quelle forme du calcium doit être dosée ?', 'Calcium ionisé', src('b00148', 'b00149'), 'Le calcium total inclut la fraction complexée au citrate.', 'Après plusieurs poches, l’intervalle QT s’allonge.'),
      qroc('À quel intervalle le calcium doit-il être mesuré ou administré ?', 'Toutes les 4 à 8 heures|4 à 8 heures', src('b00149', 'b00150'), 'Le rythme exact dépend de la vitesse transfusionnelle.', 'Le protocole se prolonge avec une consommation soutenue de produits.'),
      qroc('Quel électrolyte libéré par les CGR stockés peut augmenter ?', 'Potassium|Kaliémie', src('b00150'), 'La fuite cellulaire pendant le stockage expose à l’hyperkaliémie.', 'Des ondes T amples apparaissent sur le moniteur.'),
      qroc('Quel dispositif doit être placé sur la ligne transfusionnelle ?', 'Réchauffeur de sang|Réchauffeur de produits', src('b00150'), 'Il prévient l’hypothermie liée aux poches froides.', 'La température centrale baisse à 34,8 °C.'),
      qroc('Quel mécanisme hémostatique est ralenti par l’hypothermie ?', 'Protéases de la coagulation|Cascade enzymatique de coagulation', src('b00150'), 'Le froid diminue l’activité enzymatique et aggrave le saignement.', 'Le champ devient plus hémorragique malgré un apport équilibré de produits.'),
      qroc('Quelle complication volumique apparaît si les apports dépassent les pertes ?', 'Surcharge volémique|TACO', src('b00135', 'b00148', 'b00150'), 'L’excès élève la pression hydrostatique pulmonaire.', 'Après l’hémostase, le bilan des produits et solutés dépasse nettement le volume sanguin estimé perdu.'),
    ],
  },
];

export function buildChapter10(extract) {
  void extract;
  const series = structuredClone([...QCM_SERIES, ...DP_QCM_SERIES, ...QROC_SERIES, ...DP_QROC_SERIES]);
  return {
    fiche: buildFiche(),
    flashcards: buildFlashcards(),
    series,
  };
}

export default buildChapter10;

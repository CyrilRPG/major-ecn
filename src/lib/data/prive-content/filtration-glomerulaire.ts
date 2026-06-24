import type { PriveCourseContent } from '../prive-courses';

const content: PriveCourseContent = {
  fiche: {
    parties: [
      {
        numero: 'I',
        titre: 'Fonctions du rein',
        sous_parties: [
          {
            titre: 'Les grandes fonctions',
            rows: [
              { concept: '◆ Homéostasie', detail_md: "Le rein régule le **volume** et la **composition** du compartiment extracellulaire = homéostasie du milieu intérieur\nParticipe à l'**équilibre acido-basique** avec l'appareil respiratoire", kind: 'a_retenir' },
              { concept: "Fonction d'émonctoire", detail_md: "Excrétion des déchets de l'organisme :\n· Déchets protéiques : **urée**\n· Déchets nucléiques : **acide urique**\n· Déchets métaboliques musculaires : **créatinine**", kind: 'normal' },
              { concept: '◆ Fonction endocrine', detail_md: "Le rein produit 3 hormones :\n· **Rénine** : contrôle de la pression artérielle\n· **Érythropoïétine (EPO)** : production des GR (sécrétée par les fibroblastes du tubule rénal en réponse à l'hypoxie)\n· **Calcitriol** : forme active de la vitamine D", kind: 'a_retenir' },
            ],
          },
        ],
      },
      {
        numero: 'II',
        titre: 'Structure du rein',
        sous_parties: [
          {
            titre: 'Macrostructure du rein',
            rows: [
              { concept: '◆ Organisation cortico-médullaire', detail_md: "· **Cortex** (périphérique) : contient les **glomérules**\n· **Médullaire** (interne) : contient les **tubules** qui forment les pyramides de Malpighi\nEntre les lobules rénaux : **colonnes de Bertin** (tissu conjonctif)\nChaque lobule est vascularisé par une **artère interlobaire**", kind: 'a_retenir' },
              { concept: "Formation de l'urine", detail_md: "L'urine se forme dans le néphron\nElle est dans sa forme **définitive** au niveau des **papilles** (partie la plus interne de la médullaire)\nPuis : papilles → calices → bassinet → uretère", kind: 'normal' },
            ],
          },
          {
            titre: 'Le néphron : unité fonctionnelle du rein',
            rows: [
              { concept: '◆ Nombre', detail_md: "Environ **1 million de néphrons par rein**", kind: 'a_retenir' },
              { concept: 'Constitution du néphron', detail_md: "· **Glomérule** : structure sphérique dans le cortex, interface circulation sanguine / espace urinaire → site de la filtration glomérulaire → urine primitive recueillie dans la **capsule de Bowman**\n· **Tubule rénal** : tube contourné proximal (TCP) → tube droit proximal → anse de Henlé (branche descendante fine, ascendante fine, ascendante large) → tube contourné distal (TCD, contient la **macula densa**) → canal connecteur → canal collecteur", kind: 'normal' },
              { concept: '◆ Deux types de néphrons', detail_md: "· **Néphrons superficiels** : glomérule externe dans le cortex, anse de Henlé courte (peu dans la médullaire), **pas de vasa recta**\n· **Néphrons profonds** : glomérule plus interne, longue anse de Henlé atteignant la médullaire interne, **présence de vasa recta**, contribuent à la concentration/dilution de l'urine\nDans TOUS les cas : le glomérule est **TOUJOURS dans le cortex**", kind: 'a_retenir' },
              { concept: '⚠ Piège', detail_md: "Le glomérule est **toujours** dans le cortex, quel que soit le type de néphron. Seule la longueur de l'anse de Henlé diffère !", kind: 'piege' },
            ],
          },
          {
            titre: 'Le glomérule',
            rows: [
              { concept: '◆ Structure', detail_md: "Zone de contact entre circulation sanguine (plasma) et espace urinaire :\n· Sang arrive par l'**artériole afférente** → **capillaire glomérulaire enchevêtré (flocculus)** → sort par l'**artériole efférente**\n· Le capillaire baigne dans l'**espace urinaire** délimité par la **capsule de Bowman**\n· L'espace urinaire s'ouvre sur le **TCP**", kind: 'a_retenir' },
              { concept: 'Cellules du glomérule', detail_md: "· **Podocytes** : cellules épithéliales côté urinaire avec leurs prolongements (**pédicelles**) qui enserrent les capillaires\n· **Cellules mésangiales** : cellules conjonctives **contractiles** au centre de l'axe capillaire → peuvent réduire la zone d'échange (modifient le Kf)", kind: 'normal' },
              { concept: '◆ Membrane basale glomérulaire', detail_md: "De la lumière du capillaire vers l'espace urinaire :\n1. **Cellule endothéliale fenêtrée**\n2. **Membrane basale**\n3. **Pédicelles des podocytes**\n4. Espace urinaire\nLa filtration = eau + substances dissoutes franchissent cette barrière", kind: 'a_retenir' },
            ],
          },
          {
            titre: "L'appareil juxta-glomérulaire",
            rows: [
              { concept: '◆ Macula densa', detail_md: "Cellules sombres du **tubule distal** au contact des 2 artérioles\nSensibles à la concentration en Na⁺/Cl⁻ dans le tubule", kind: 'a_retenir' },
              { concept: '◆ Cellules juxta-glomérulaires', detail_md: "= cellules **myoépithéliales** = cellules musculaires lisses particulières situées dans l'**artériole afférente UNIQUEMENT** (absentes de l'artériole efférente !)\n· Produisent et sécrètent la **rénine**\n· Jouent le rôle de **barorécepteurs intra-rénaux** : sensibles aux variations de pression dans l'artériole afférente", kind: 'a_retenir' },
              { concept: '⚠ Piège', detail_md: "Les cellules myoépithéliales productrices de rénine sont présentes **UNIQUEMENT dans l'artériole afférente**, PAS dans l'efférente !", kind: 'piege' },
            ],
          },
          {
            titre: 'Vascularisation',
            rows: [
              { concept: '◆ Système porte artériel', detail_md: "Artère arquée → **artériole afférente** → **capillaire glomérulaire** (1er réseau) → **artériole efférente** → **capillaire péritubulaire** (2e réseau) → veine\n= 2 réseaux capillaires en série = **système porte artériel**", kind: 'a_retenir' },
              { concept: 'Vasa recta', detail_md: "Vaisseaux rectilignes accompagnant l'anse de Henlé des **néphrons profonds** vers la médullaire\nN'existent **PAS** dans les néphrons superficiels", kind: 'normal' },
              { concept: 'Distribution vasculaire', detail_md: "Plus de vaisseaux dans le **cortex** que dans la médullaire\n**90% du sang** va au cortex, **10%** à la médullaire", kind: 'normal' },
            ],
          },
        ],
      },
      {
        numero: 'III',
        titre: 'Débit sanguin rénal (DSR) et débit plasmatique rénal (DPR)',
        sous_parties: [
          {
            titre: 'Hémodynamique rénale',
            rows: [
              { concept: '◆ DSR', detail_md: "Le DSR représente **20% du débit cardiaque** soit **1200 mL/min**\nC'est un débit très élevé rapporté à la masse de l'organe", kind: 'a_retenir' },
              { concept: '◆ DPR', detail_md: "DPR = DSR × (1 - Hématocrite) = **600 mL/min** (pour un Ht de 50%)\nRappel : l'hématocrite = volume occupé par les GR dans le sang", kind: 'a_retenir' },
              { concept: '⚠ Piège DSR', detail_md: "Le DSR représente **20%** du débit cardiaque, PAS 80% !\nLa majeure partie du DSR est distribuée dans le **cortex** (90%), PAS dans la médullaire !", kind: 'piege' },
              { concept: 'Pourquoi un DSR si élevé ?', detail_md: "Ce n'est **PAS pour les besoins métaboliques** du rein (seulement 10-15% de l'O₂ apporté est consommé)\nC'est pour permettre la **filtration glomérulaire** : passage d'eau et de substances dissoutes du plasma vers l'espace urinaire", kind: 'normal' },
            ],
          },
          {
            titre: 'Pressions vasculaires rénales',
            rows: [
              { concept: '◆ Évolution des pressions', detail_md: "· **Début artériole afférente** : pression moyenne systémique (100-120 mmHg)\n· **Capillaire glomérulaire** : **40-60 mmHg** (élevée pour un capillaire ! pression constante car pas de résistance au sein du capillaire)\n· **Artériole efférente** : chute de pression (résistances)\n· **Capillaire péritubulaire** : pression habituelle pour un capillaire", kind: 'a_retenir' },
              { concept: 'Siège des résistances', detail_md: "Les résistances sont au niveau des **artérioles afférente et efférente** (là où la pression chute)\nLa pression du capillaire glomérulaire est **physiologiquement haute** et reste **constante** le long du capillaire", kind: 'normal' },
            ],
          },
        ],
      },
      {
        numero: 'IV',
        titre: 'Filtration glomérulaire',
        sous_parties: [
          {
            titre: 'Débit de filtration glomérulaire (DFG)',
            rows: [
              { concept: '◆ DFG normal', detail_md: "**1/5 du DPR** traverse la membrane glomérulaire\nDFG = **120 mL/min** soit **180 L/jour**\nDPR entrant (artériole afférente) = 600 mL/min\nDPR sortant (artériole efférente) = 480 mL/min (600 - 120)", kind: 'a_retenir' },
              { concept: '◆ Fraction filtrée', detail_md: "FF = DFG / DPR = 120/600 = **20%**\nLa fraction filtrée **augmente** sous l'action du SRA (↑ DFG relatif au DPR)", kind: 'a_retenir' },
              { concept: '◆ Ultrafiltrat glomérulaire', detail_md: "Composition quasi identique au plasma pour les **petites molécules** (eau, ions, glucose, urée)\n**Exception** : les protéines > **60 kDa** (albumine...) ne passent PAS la membrane basale glomérulaire\nDouble filtre : **mécanique** (taille) + **électrique** (membrane chargée négativement → repousse charges négatives)", kind: 'a_retenir' },
              { concept: '⚠ Piège glucose', detail_md: "La concentration de glucose est **identique** dans l'artériole afférente, l'artériole efférente ET le filtrat glomérulaire (5 mmol/L)\nCar autant de glucose que d'eau est filtré → pas de concentration !\nLe débit massique de filtration du glucose n'est **PAS nul** (il est filtré librement)", kind: 'piege' },
              { concept: 'Concentration protéique', detail_md: "La concentration des protéines **augmente** entre l'artériole afférente et efférente car :\n· Même quantité de protéines (non filtrées)\n· Moins d'eau (filtrée)\n→ **La pression oncotique augmente** dans l'artériole efférente", kind: 'normal' },
            ],
          },
          {
            titre: "Forces de Starling et pression d'ultrafiltration",
            rows: [
              { concept: '◆ Coefficient de filtration Kf', detail_md: "Kf = **surface de filtration** × **perméabilité hydraulique** du capillaire\nLe Kf peut être modifié par la contraction des **cellules mésangiales**", kind: 'a_retenir' },
              { concept: '◆ Pressions de Starling', detail_md: "· **Pcap** (pression hydrostatique capillaire) = **45 mmHg** → pousse l'eau vers la capsule de Bowman\n· **πplasm** (pression oncotique plasmatique) = **20 mmHg** au début → retient l'eau dans le capillaire\n· **Pbow** (pression hydrostatique capsule de Bowman) = **10 mmHg** → s'oppose à la filtration\n· **πbow** (pression oncotique dans Bowman) = **0 mmHg** (pas de protéines)", kind: 'a_retenir' },
              { concept: "◆ Pression d'ultrafiltration", detail_md: "PUF = Pcap - Pbow - πplasm = 45 - 10 - 20 = **15 mmHg** (au début du capillaire)\nLe DFG dépend du **Kf** et de la **PUF**", kind: 'a_retenir' },
              { concept: '◆ Évolution le long du capillaire', detail_md: "· **ΔP hydrostatique** (Pcap - Pbow = 35 mmHg) : reste **STABLE** le long du capillaire\n· **πplasm** : **AUGMENTE** progressivement (les protéines se concentrent à mesure que l'eau est filtrée)\n· Quand πplasm = ΔP hydrostatique (35 mmHg) → **la filtration s'arrête** (PUF = 0)", kind: 'a_retenir' },
              { concept: '⚠ Piège pressions', detail_md: "La pression **hydrostatique** varie peu le long du capillaire glomérulaire\nMais la pression **oncotique** AUGMENTE le long du capillaire\nDonc la pression d'ultrafiltration n'est **PAS identique** sur toute la longueur du capillaire !", kind: 'piege' },
              { concept: 'Mnémo pressions', detail_md: "\"**45-10-20**\" : Pcap (45 mmHg) - Pbow (10 mmHg) - πplasm (20 mmHg) = PUF initiale 15 mmHg", kind: 'mnemo' },
            ],
          },
        ],
      },
      {
        numero: 'V',
        titre: 'Régulation du DSR et du DFG',
        sous_parties: [
          {
            titre: "Mécanismes d'ajustement : rôle des résistances artériolaires",
            rows: [
              { concept: '◆ Principe fondamental', detail_md: "La **balance des résistances** de l'artériole afférente (Raa) et efférente (Rae) détermine la **Pcap glomérulaire** et donc le DFG\nDSR = (Partère rénale - Pveine rénale) / (Raa + Rae)", kind: 'a_retenir' },
              { concept: '◆ Situation FAVORABLE à la filtration', detail_md: "· **↓ Résistances artériole afférente** (bien ouvert à l'entrée)\n· **↑ Résistances artériole efférente** (serré à la sortie)\n→ Pcap glomérulaire maintenue → **FAVORISE** la filtration", kind: 'a_retenir' },
              { concept: '◆ Situation DÉFAVORABLE', detail_md: "· **↑ Résistances artériole afférente** (fermé à l'entrée)\n· **↓ Résistances artériole efférente** (ouvert à la sortie)\n→ Pcap chute → **filtration DIMINUE**", kind: 'a_retenir' },
              { concept: "Résistances de l'artériole efférente", detail_md: "Si ↑ Rae seule → **↑ DFG** (Pcap augmente en amont)\nSi ↑ Raa seule × 2 → **↓ DFG** (moins de sang arrive au capillaire)", kind: 'normal' },
            ],
          },
          {
            titre: 'Conséquences des variations de pression',
            rows: [
              { concept: 'Chute de pression importante', detail_md: "↓ DSR → ↓ DFG → **insuffisance rénale fonctionnelle** (le rein n'est plus assez perfusé)\nExemple : état de choc", kind: 'normal' },
              { concept: '↑ PA prolongée (HTA)', detail_md: "Lésions chroniques des vaisseaux rénaux → **néphro-angiosclérose** (durcissement) → **glomérulosclérose** (glomérule fibreux) → insuffisance rénale chronique", kind: 'normal' },
            ],
          },
          {
            titre: "Autorégulation rénale : régulation intrinsèque",
            rows: [
              { concept: '◆ Autorégulation du DSR', detail_md: "Pour des variations de **PAM de 80 à 140 mmHg**, le DSR, le DPR et le DFG restent **parfaitement stables**\nException : si PA trop basse (état de choc) → IR aiguë d'origine hémodynamique", kind: 'a_retenir' },
              { concept: '◆ Mécanisme myogénique', detail_md: "Sensible aux variations de pression de l'**artériole afférente**\n↑ PA → distension des cellules musculaires lisses de l'AA → flux de Ca²⁺ (canaux voltage-dépendants) → **contraction réflexe des CML de l'AA** → ↑ Raa → ↓ Pcap → **↓ DFG**\n= **Vasoconstriction réflexe** en réponse à une ↑ de pression", kind: 'a_retenir' },
              { concept: '⚠ Piège mécanisme myogénique', detail_md: "Le mécanisme myogénique est mis en jeu par une **AUGMENTATION** de pression dans l'artériole afférente (PAS une diminution !)\nIl induit une **vasoconstriction** (PAS une vasodilatation !) de l'artériole afférente\nIl **maintient** le DFG stable, il ne le diminue pas de manière pathologique", kind: 'piege' },
              { concept: '◆ Rétrocontrôle tubulo-glomérulaire (TGF)', detail_md: "Sensible aux variations de résistances de l'**artériole afférente** (PAS efférente !)\n\n**Si ↑ PA** → ↑ DFG → ↑ filtrat → ↑ Na⁺/Cl⁻ au tubule distal → ↑ réabsorption par **macula densa** → ↑ consommation ATP → ↑ **adénosine** → **vasoconstriction de l'AA** → ↓ Pcap → correction du DFG\n\n**Si ↓ PA** → ↓ DFG → ↓ filtrat → ↓ Na⁺/Cl⁻ → ↓ ATP consommé → ↓ adénosine → **vasodilatation de l'AA** → correction du DFG\n\nFonctionne dans les **2 sens** !", kind: 'a_retenir' },
              { concept: '⚠ Piège TGF', detail_md: "Le rétrocontrôle tubulo-glomérulaire agit sur l'artériole **AFFÉRENTE**, PAS efférente !\nIl fait intervenir l'**adénosine** (qui est **vasoconstrictrice dans le rein**)", kind: 'piege' },
            ],
          },
          {
            titre: 'Substances autacoïdes',
            rows: [
              { concept: '◆ Système rénine-angiotensine intrarénal (SRA)', detail_md: "**Étape limitante** = production de **rénine** par les cellules juxta-glomérulaires\nAngiotensinogène (foie) → Angiotensine I (par la rénine) → **Angiotensine II** (par l'ECA, enzyme de conversion exprimée par les cellules endothéliales du capillaire glomérulaire)", kind: 'a_retenir' },
              { concept: '◆ 3 stimuli de la rénine', detail_md: "1. **↓ pression dans l'artériole afférente** (cellules juxta-glomérulaires = barorécepteurs intra-rénaux)\n2. **↓ débit Na⁺/Cl⁻** perçu par les cellules de la **macula densa** (= ↓ DFG)\n3. **Stimulation sympathique bêta** (stimulus extrinsèque)", kind: 'a_retenir' },
              { concept: '⚠ Piège rénine', detail_md: "La rénine est libérée quand la pression **DIMINUE** dans l'artériole afférente, PAS quand elle augmente !\nL'étape limitante est la disponibilité de la rénine, PAS l'angiotensinogène ni l'ECA", kind: 'piege' },
              { concept: "◆ Action de l'Angiotensine II", detail_md: "· **Très puissant vasoconstricteur** via récepteurs musculaires\n· Action à des concentrations très faibles (10⁻¹²) : action **locale** uniquement (pas d'effet sur les vaisseaux périphériques à cette concentration)\n· Vasoconstriction **prédominant sur l'artériole efférente**\n· L'artériole afférente est **protégée** par la PGI2 et le NO\n→ Maintien de la Pcap et donc du DFG", kind: 'a_retenir' },
              { concept: '◆ Protection de l\'artériole afférente', detail_md: "L'AG II induit la production locale de :\n· **Prostacycline PGI2** (vasodilatatrice) → protège l'AA de la vasoconstriction\n· **NO** (oxyde nitrique, vasodilatateur) → protège aussi l'AA\nRésultat : AG II vasoconstricte l'AE mais PAS l'AA", kind: 'a_retenir' },
              { concept: '⚠ Danger des AINS', detail_md: "Les AINS (ibuprofène, indométacine) **inhibent la cyclo-oxygénase** → ↓ synthèse PGI2 → l'artériole afférente n'est plus protégée → vasoconstriction AA → **insuffisance rénale fonctionnelle**\nParticulièrement dangereux chez le **sujet âgé** avec perfusion rénale déjà limite", kind: 'piege' },
              { concept: 'Action sur les cellules mésangiales', detail_md: "AG II → contraction des cellules mésangiales → **↓ Kf** → tendance à ↓ DFG\nMais globalement le DFG est préservé car la Pcap est maintenue\nLe DSR ↓ un peu (↑ résistances totales)", kind: 'normal' },
              { concept: 'Autres substances autacoïdes', detail_md: "· **Système kinine-kallicréine** : kallicréine (protéase du tube distal) clive le kininogène en **bradykinine** (vasodilatatrice)\n· **NO** : libéré par les cellules endothéliales de l'AA en réponse à l'AG II → vasodilatateur → protège l'AA", kind: 'normal' },
            ],
          },
          {
            titre: 'Régulation extrinsèque',
            rows: [
              { concept: '◆ Système nerveux sympathique', detail_md: "Le rein est innervé **UNIQUEMENT par le système sympathique** (neuromédiateur : noradrénaline)\n2 types d'effets :\n· **Bêta 1 (indirect)** : libération de rénine par les cellules juxta-glomérulaires\n· **Alpha 1 (direct)** : vasoconstriction des 2 artérioles → mis en jeu lors d'une **très forte ↓ PA** → priorisation cerveau et coeur au détriment du rein", kind: 'a_retenir' },
              { concept: '◆ Facteur natriurétique auriculaire (ANF)', detail_md: "Peptide de **28 acides aminés** libéré par les **myocytes auriculaires** quand ils sont **distendus** (↑ volémie / PA élevée)\nActions :\n· **Vasodilatation de l'artériole afférente**\n· **Vasoconstriction de l'artériole efférente**\n· **↑ Kf** (coefficient de filtration)\n· **Inhibition de la libération de rénine**\n→ Favorise la filtration glomérulaire → ↑ natriurèse pour éliminer l'excès de volume", kind: 'a_retenir' },
              { concept: '⚠ Piège ANF vs Rénine', detail_md: "L'ANF et la rénine ont des actions **opposées** et ne sont **pas censés cohabiter** :\n· ANF = libéré quand ↑ volume sanguin → favorise la filtration\n· Rénine = libérée quand ↓ pression → protège la filtration\nL'ANF **inhibe** la libération de rénine, il ne la stimule PAS", kind: 'piege' },
            ],
          },
        ],
      },
      {
        numero: 'VI',
        titre: "Physiopathologie : sténose de l'artère rénale",
        sous_parties: [
          {
            titre: 'HTA réno-vasculaire',
            rows: [
              { concept: '◆ Mécanisme', detail_md: "Plaque d'athérome → sténose artère rénale → **↓ pression de perfusion** en aval → ↓ Paa\n→ Mise en jeu **permanente** du SRA (la sténose est constante)\n→ Haute concentration de rénine dans la circulation générale\n→ AG II en grande quantité → **vasoconstriction générale** (vaisseaux périphériques)\n→ SRA induit aussi la production d'**aldostérone** (surrénale) → ↑ réabsorption de sel → **hypervolémie**", kind: 'a_retenir' },
              { concept: '◆ Conséquences', detail_md: "2 facteurs d'HTA :\n1. **Vasoconstriction** par AG II → ↑ résistances périphériques\n2. **Hypervolémie** par aldostérone\n→ **HTA réno-vasculaire** = cause d'HTA secondaire\n→ Aussi : hyperaldostéronisme **secondaire** (pas primaire !), ↓ natriurèse, hypokaliémie", kind: 'a_retenir' },
              { concept: '⚠ Piège', detail_md: "La sténose de l'artère rénale entraîne un hyperaldostéronisme **SECONDAIRE** (pas primaire !)\nCar c'est la rénine qui stimule la production d'aldostérone via AG II", kind: 'piege' },
              { concept: 'Sémiologie', detail_md: "Devant toute HTA : **toujours examiner les vaisseaux rénaux** pour rechercher une plaque d'athérome → HTA réno-vasculaire curable", kind: 'normal' },
            ],
          },
        ],
      },
    ],
    points_cles: [
      "Le DSR = 20% du débit cardiaque (1200 mL/min) ; le DPR = 600 mL/min ; le DFG = 120 mL/min soit 20% du DPR (fraction filtrée)",
      "La filtration glomérulaire est un processus PASSIF : l'eau et les petites molécules traversent la membrane basale glomérulaire (filtre mécanique + électrique)",
      "Les protéines > 60 kDa (albumine) ne passent PAS la membrane basale ; la concentration de glucose est identique dans le filtrat et le plasma",
      "Pressions de Starling : Pcap = 45 mmHg, Pbow = 10 mmHg, pression oncotique = 20 mmHg ; la pression hydrostatique est STABLE mais la pression oncotique AUGMENTE le long du capillaire",
      "L'autorégulation maintient DSR/DFG stables pour une PAM entre 80 et 140 mmHg via le mécanisme myogénique (vasoconstriction réflexe AA) et le rétrocontrôle tubulo-glomérulaire (adénosine)",
      "Le TGF agit sur l'artériole AFFÉRENTE (pas efférente) ; le mécanisme myogénique est déclenché par une AUGMENTATION de pression",
      "Le SRA intrarénal : étape limitante = rénine ; AG II vasoconstricte l'artériole EFFÉRENTE ; l'AA est protégée par PGI2 et NO",
      "Les AINS inhibent la PGI2 → l'AA n'est plus protégée → risque d'insuffisance rénale fonctionnelle (sujet âgé ++)",
      "3 stimuli de la rénine : ↓ pression AA (barorécepteurs), ↓ Na⁺/Cl⁻ macula densa, stimulation sympathique bêta",
      "L'ANF (libéré par distension auriculaire) : vasodilatation AA, vasoconstriction AE, ↑ Kf, inhibe la rénine → favorise la filtration",
      "Sténose artère rénale → SRA permanent → HTA réno-vasculaire (HTA secondaire) par vasoconstriction + hypervolémie (aldostérone secondaire)",
      "Les cellules juxta-glomérulaires (productrices de rénine) sont UNIQUEMENT dans l'artériole afférente",
    ],
    chiffres_cles: {
      titre: 'Chiffres cles - Filtration glomerulaire',
      markdown: "| Parametre | Valeur |\n|---|---|\n| Nombre de nephrons par rein | **~1 million** |\n| DSR (debit sanguin renal) | **1200 mL/min (20% du debit cardiaque)** |\n| Distribution du sang renal | **Cortex 90% / Medullaire 10%** |\n| DPR (debit plasmatique renal) | **600 mL/min** |\n| DFG (debit de filtration glomerulaire) | **120 mL/min = 180 L/jour** |\n| Fraction filtree | **20% (DFG/DPR)** |\n| Seuil proteines filtrees | **60 kDa** |\n| Pression capillaire glomerulaire (Pcap) | **45 mmHg** |\n| Pression oncotique plasmatique initiale | **20 mmHg** |\n| Pression hydrostatique capsule Bowman | **10 mmHg** |\n| DeltaP hydrostatique (Pcap - Pbow) | **35 mmHg (stable)** |\n| PUF initiale | **15 mmHg** |\n| Pression capillaire glomerulaire | **40-60 mmHg** |\n| Plage autoregulation PAM | **80-140 mmHg** |\n| O2 consomme par le rein | **10-15% de l'O2 apporte** |\n| ANF (taille) | **28 acides amines** |",
    },
  },
  flashcards: [
    { recto: "Quelles sont les 3 grandes fonctions du rein ?", verso: "· <b>Homeostasie</b> du milieu interieur (regulation volume et composition du compartiment extracellulaire + equilibre acido-basique)\n· Fonction d'<b>emonctoire</b> : excretion des dechets (uree, acide urique, creatinine)\n· Fonction <b>endocrine</b> : renine, EPO, calcitriol", order_index: 1 },
    { recto: "Quelles hormones le rein produit-il ?", verso: "· <b>Renine</b> : controle de la PA\n· <b>Erythropoietine (EPO)</b> : production des GR (secretee par les fibroblastes du tubule renal en reponse a l'hypoxie)\n· <b>Calcitriol</b> : forme active de la vitamine D", order_index: 2 },
    { recto: "Quelle est la difference entre le cortex et la medullaire renale ?", verso: "· <b>Cortex</b> (peripherique) : contient les <b>glomerules</b>\n· <b>Medullaire</b> (interne) : contient les <b>tubules</b> formant les pyramides de Malpighi", order_index: 3 },
    { recto: "Combien de nephrons par rein ?", verso: "Environ <b>1 million</b> de nephrons par rein", order_index: 4 },
    { recto: "De quoi est constitue un nephron ?", verso: "· <b>Glomerule</b> : structure spherique dans le cortex (filtration glomerulaire)\n· <b>Tubule renal</b> : TCP -> tube droit proximal -> anse de Henle -> TCD (avec macula densa) -> canal connecteur -> canal collecteur", order_index: 5 },
    { recto: "Ou se situe le glomerule dans le rein ?", verso: "<b>Toujours dans le cortex</b>, quel que soit le type de nephron (superficiel ou profond)\nSeule la longueur de l'anse de Henle differe entre les 2 types", order_index: 6 },
    { recto: "Quelles sont les differences entre nephrons superficiels et profonds ?", verso: "· <b>Nephrons superficiels</b> : glomerule externe, anse de Henle courte, pas de vasa recta\n· <b>Nephrons profonds</b> : glomerule plus interne, longue anse de Henle (medullaire interne), <b>vasa recta</b>, contribuent a la concentration/dilution de l'urine", order_index: 7 },
    { recto: "Que sont les vasa recta ?", verso: "Vaisseaux <b>rectilignes</b> qui accompagnent l'anse de Henle des <b>nephrons profonds</b> vers la medullaire\nN'existent <b>PAS</b> dans les nephrons superficiels", order_index: 8 },
    { recto: "Decrire le trajet du sang dans le glomerule.", verso: "Sang arrive par l'<b>arteriole afferente</b> -> <b>capillaire glomerulaire</b> (flocculus) -> sort par l'<b>arteriole efferente</b>\nLe capillaire baigne dans l'espace urinaire delimite par la <b>capsule de Bowman</b>", order_index: 9 },
    { recto: "Quelles sont les couches de la membrane basale glomerulaire (de la lumiere du capillaire vers l'espace urinaire) ?", verso: "1. <b>Cellule endotheliale fenestree</b>\n2. <b>Membrane basale</b>\n3. <b>Pedicelles des podocytes</b>\n4. Espace urinaire", order_index: 10 },
    { recto: "Que sont les cellules mesangiales ?", verso: "Cellules conjonctives <b>contractiles</b> situees au centre de l'axe capillaire glomerulaire\nLeur contraction peut <b>reduire la zone d'echange</b> entre capillaire et espace urinaire -> modifient le <b>Kf</b>", order_index: 11 },
    { recto: "Que sont les cellules juxta-glomerulaires (myoepitheliales) ?", verso: "Cellules musculaires lisses particulieres situees <b>uniquement dans l'arteriole afferente</b>\n· Produisent et secretent la <b>renine</b>\n· Jouent le role de <b>barorecepteurs intra-renaux</b> (sensibles aux variations de pression dans l'AA)", order_index: 12 },
    { recto: "Qu'est-ce que la macula densa ?", verso: "Cellules sombres du <b>tubule distal</b> au contact des 2 arterioles\nSensibles a la concentration en <b>Na+/Cl-</b> dans le tubule\nFont partie de l'<b>appareil juxta-glomerulaire</b>", order_index: 13 },
    { recto: "Qu'est-ce que le systeme porte arteriel renal ?", verso: "2 reseaux capillaires en serie :\n<b>Arteriole afferente</b> -> <b>capillaire glomerulaire</b> (1er reseau) -> <b>arteriole efferente</b> -> <b>capillaire peritubulaire</b> (2e reseau) -> veine\nLa veine n'arrive qu'a la fin du 2e reseau capillaire", order_index: 14 },
    { recto: "Que represente le DSR par rapport au debit cardiaque ?", verso: "<b>20%</b> du debit cardiaque soit <b>1200 mL/min</b>\nC'est un debit tres eleve par rapport a la masse de l'organe", order_index: 15 },
    { recto: "VRAI ou FAUX : le DSR represente 80% du debit cardiaque", verso: "<b>FAUX</b>\nLe DSR represente <b>20%</b> du debit cardiaque (pas 80%)", order_index: 16 },
    { recto: "Quelle est la valeur du DPR et comment le calcule-t-on ?", verso: "DPR = DSR x (1 - Hematocrite) = 1200 x 0,5 = <b>600 mL/min</b>\n(pour un hematocrite physiologique de 50%)", order_index: 17 },
    { recto: "Comment se repartit le DSR entre cortex et medullaire ?", verso: "· <b>Cortex</b> : 90% du sang\n· <b>Medullaire</b> : 10% du sang", order_index: 18 },
    { recto: "VRAI ou FAUX : la majeure partie du DSR est distribuee dans la medullaire renale", verso: "<b>FAUX</b>\nLa majeure partie du DSR est distribuee dans le <b>cortex</b> (90%)", order_index: 19 },
    { recto: "Pourquoi le DSR est-il si eleve ?", verso: "Ce n'est <b>PAS pour les besoins metaboliques</b> du rein (seulement 10-15% de l'O2 est consomme)\nC'est pour assurer la <b>filtration glomerulaire</b>", order_index: 20 },
    { recto: "Quelle est la pression dans le capillaire glomerulaire ?", verso: "<b>40-60 mmHg</b> (en moyenne 45 mmHg)\nC'est une pression <b>tres elevee</b> pour un capillaire\nElle reste <b>constante</b> le long du capillaire (pas de resistance en son sein)", order_index: 21 },
    { recto: "Ou se situent les resistances vasculaires renales ?", verso: "Au niveau des <b>arterioles afferente et efferente</b>\nC'est la ou la pression chute", order_index: 22 },
    { recto: "Quelle est la valeur du DFG normal ?", verso: "<b>120 mL/min</b> soit <b>180 L/jour</b>\n= 1/5 du DPR (600 mL/min)", order_index: 23 },
    { recto: "Quelle est la fraction filtree normale ?", verso: "FF = DFG / DPR = 120 / 600 = <b>20%</b>", order_index: 24 },
    { recto: "VRAI ou FAUX : la filtration glomerulaire est un processus actif", verso: "<b>FAUX</b>\nC'est un processus <b>purement passif</b> (forces de Starling)", order_index: 25 },
    { recto: "Quelles molecules passent la membrane basale glomerulaire ?", verso: "· <b>Eau</b>, <b>ions</b>, <b>glucose</b>, <b>uree</b> : passent librement\n· <b>Proteines > 60 kDa</b> (albumine...) : <b>ne passent PAS</b>\nDouble filtre : <b>mecanique</b> (taille) + <b>electrique</b> (membrane chargee negativement)", order_index: 26 },
    { recto: "La concentration de glucose est-elle identique entre l'arteriole afferente et efferente ?", verso: "<b>OUI</b>, la concentration est identique (ex: 5 mmol/L)\nCar autant de glucose que d'eau est filtre -> pas de concentration\nPar contre, la <b>concentration proteique augmente</b> dans l'arteriole efferente", order_index: 27 },
    { recto: "VRAI ou FAUX : chez un sujet non diabetique, le debit massique de filtration du glucose est nul", verso: "<b>FAUX</b>\nLe glucose est <b>filtre librement</b> (petite molecule), donc son debit de filtration n'est pas nul\nMais sa concentration ne change pas entre afferente et efferente", order_index: 28 },
    { recto: "Que represente le coefficient de filtration Kf ?", verso: "Kf = <b>surface de filtration</b> x <b>permeabilite hydraulique</b> du capillaire\nPeut etre modifie par la contraction des <b>cellules mesangiales</b> (qui reduisent la surface d'echange)", order_index: 29 },
    { recto: "Quelles sont les 4 pressions de Starling dans le glomerule ?", verso: "· <b>Pcap</b> = 45 mmHg (pousse l'eau vers Bowman)\n· <b>Pbow</b> = 10 mmHg (s'oppose a la filtration)\n· <b>pieplasm</b> = 20 mmHg au debut (retient l'eau dans le capillaire)\n· <b>piebow</b> = 0 mmHg (pas de proteines dans Bowman)", order_index: 30 },
    { recto: "Quelle est la pression d'ultrafiltration (PUF) au debut du capillaire glomerulaire ?", verso: "PUF = Pcap - Pbow - pieplasm = 45 - 10 - 20 = <b>15 mmHg</b>", order_index: 31 },
    { recto: "Comment evolue la pression hydrostatique le long du capillaire glomerulaire ?", verso: "La <b>DeltaP hydrostatique</b> (Pcap - Pbow = 35 mmHg) reste <b>STABLE</b> le long du capillaire\nLa pression hydrostatique <b>varie peu</b> entre le debut et la fin", order_index: 32 },
    { recto: "Comment evolue la pression oncotique le long du capillaire glomerulaire ?", verso: "La pression oncotique <b>AUGMENTE</b> progressivement\nCar les proteines (non filtrees) se concentrent a mesure que l'eau est filtree\nQuand elle atteint 35 mmHg (= DeltaP hydrostatique) -> la <b>filtration s'arrete</b>", order_index: 33 },
    { recto: "VRAI ou FAUX : la pression d'ultrafiltration est identique sur toute la longueur du capillaire glomerulaire", verso: "<b>FAUX</b>\nLa pression <b>oncotique augmente</b> le long du capillaire -> la PUF <b>diminue</b> progressivement\n(Meme si la DeltaP hydrostatique reste stable)", order_index: 34 },
    { recto: "VRAI ou FAUX : la pression oncotique plasmatique ne varie pas entre le debut et la fin du capillaire glomerulaire", verso: "<b>FAUX</b>\nLa pression oncotique <b>augmente</b> le long du capillaire car les proteines se concentrent (l'eau est filtree mais les proteines restent)", order_index: 35 },
    { recto: "Quand la filtration s'arrete-t-elle dans le capillaire glomerulaire ?", verso: "Quand la <b>pression oncotique</b> devient egale a la <b>DeltaP hydrostatique</b> (35 mmHg)\nAlors PUF = 0 -> <b>plus de flux net</b>", order_index: 36 },
    { recto: "Quelle situation favorise la filtration glomerulaire (en termes de resistances) ?", verso: "· <b>Diminution des resistances</b> de l'arteriole afferente (ouvert a l'entree)\n· <b>Augmentation des resistances</b> de l'arteriole efferente (serre a la sortie)\n-> Maintien de la <b>Pcap glomerulaire</b> -> favorise la filtration", order_index: 37 },
    { recto: "Quelle situation est defavorable a la filtration glomerulaire ?", verso: "· <b>Augmentation des resistances</b> de l'arteriole afferente (ferme a l'entree)\n· <b>Diminution des resistances</b> de l'arteriole efferente (ouvert a la sortie)\n-> Pcap chute -> filtration <b>diminue</b>", order_index: 38 },
    { recto: "VRAI ou FAUX : la vasoconstriction de l'arteriole efferente favorise la filtration glomerulaire", verso: "<b>VRAI</b>\nLa vasoconstriction de l'AE augmente la Pcap en amont -> <b>favorise</b> la filtration", order_index: 39 },
    { recto: "Que se passe-t-il en cas de chute de pression importante (etat de choc) ?", verso: "Diminution du DSR -> diminution du DFG -> <b>insuffisance renale fonctionnelle</b>\nLe rein n'est plus assez perfuse", order_index: 40 },
    { recto: "Que se passe-t-il en cas d'HTA prolongee ?", verso: "Lesions chroniques des vaisseaux renaux -> <b>nephro-angiosclerose</b> (durcissement) -> <b>glomerulosclerose</b> (glomerule fibreux) -> <b>insuffisance renale chronique</b>", order_index: 41 },
    { recto: "Dans quelle plage de PAM le DSR et le DFG sont-ils autorégulés ?", verso: "Entre <b>80 et 140 mmHg</b> de pression arterielle moyenne\nEn dehors de cette plage, les mecanismes d'autoregulation sont depasses", order_index: 42 },
    { recto: "Quels sont les 2 mecanismes de l'autoregulation renale ?", verso: "1. <b>Mecanisme myogenique</b>\n2. <b>Retrocontrole tubulo-glomerulaire</b> (TGF)\nLes 2 agissent sur l'<b>arteriole afferente</b>", order_index: 43 },
    { recto: "Expliquer le mecanisme myogenique.", verso: "Augmentation de PA -> distension des CML de l'<b>arteriole afferente</b> -> flux de Ca2+ (canaux voltage-dependants) -> <b>contraction reflexe</b> (vasoconstriction) de l'AA -> augmentation Raa -> diminution Pcap -> <b>stabilisation du DFG</b>", order_index: 44 },
    { recto: "VRAI ou FAUX : le mecanisme myogenique est mis en jeu en cas de diminution de pression dans l'arteriole afferente", verso: "<b>FAUX</b>\nIl est mis en jeu par une <b>AUGMENTATION</b> de pression dans l'AA\n(La distension des CML declenche la contraction reflexe)", order_index: 45 },
    { recto: "VRAI ou FAUX : la mise en jeu du mecanisme myogenique induit une vasodilatation de l'arteriole afferente", verso: "<b>FAUX</b>\nLe mecanisme myogenique induit une <b>VASOCONSTRICTION</b> de l'arteriole afferente\n(Contraction reflexe des CML en reponse a la distension)", order_index: 46 },
    { recto: "Expliquer le retrocontrole tubulo-glomerulaire (TGF) quand la PA augmente.", verso: "Augmentation PA -> augmentation DFG -> augmentation filtrat -> augmentation Na+/Cl- au <b>tubule distal</b> -> augmentation reabsorption par la <b>macula densa</b> -> augmentation consommation ATP -> augmentation <b>adenosine</b> -> <b>vasoconstriction de l'AA</b> -> diminution Pcap -> correction du DFG", order_index: 47 },
    { recto: "Expliquer le retrocontrole tubulo-glomerulaire (TGF) quand la PA diminue.", verso: "Diminution PA -> diminution DFG -> diminution filtrat -> diminution Na+/Cl- -> diminution ATP consomme -> diminution adenosine -> <b>vasodilatation de l'AA</b> -> augmentation Pcap -> correction du DFG\nLe TGF fonctionne dans les <b>2 sens</b>", order_index: 48 },
    { recto: "Le retrocontrole tubulo-glomerulaire agit-il sur l'arteriole afferente ou efferente ?", verso: "Sur l'arteriole <b>AFFERENTE</b> (PAS efferente !)\nVia la liberation d'<b>adenosine</b> par les cellules de la <b>macula densa</b>", order_index: 49 },
    { recto: "Quel est le role de l'adenosine dans le rein ?", verso: "L'adenosine est <b>vasoconstrictrice</b> dans le rein\nElle est produite par les cellules de la <b>macula densa</b> lors de la degradation de l'ATP\nElle agit sur l'<b>arteriole afferente</b> (TGF)", order_index: 50 },
    { recto: "Quelle est l'etape limitante du systeme renine-angiotensine (SRA) intrarrenal ?", verso: "La production de <b>renine</b> par les cellules juxta-glomerulaires\nL'angiotensinogene (foie) et l'ECA (cellules endotheliales) sont en quantite suffisante", order_index: 51 },
    { recto: "Decrivez la cascade du SRA intrarrenal.", verso: "<b>Angiotensinogene</b> (foie, circule dans le sang)\n-> clivage par la <b>renine</b> (etape limitante) -> <b>Angiotensine I</b>\n-> clivage par l'<b>ECA</b> (cellules endotheliales capillaire glomerulaire) -> <b>Angiotensine II</b>", order_index: 52 },
    { recto: "Quels sont les 3 stimuli de la liberation de renine ?", verso: "1. <b>Diminution de la pression</b> dans l'arteriole afferente (barorecepteurs intra-renaux)\n2. <b>Diminution du debit Na+/Cl-</b> percu par la macula densa\n3. <b>Stimulation sympathique beta</b> (stimulus extrinseque)", order_index: 53 },
    { recto: "VRAI ou FAUX : l'augmentation de pression dans l'arteriole afferente induit la liberation de renine", verso: "<b>FAUX</b>\nLa renine est liberee quand la pression <b>DIMINUE</b> dans l'arteriole afferente", order_index: 54 },
    { recto: "Sur quelle arteriole l'angiotensine II a-t-elle une action predominante ?", verso: "Sur l'<b>arteriole efferente</b> (vasoconstriction predominante)\nL'arteriole afferente est <b>protegee</b> par la PGI2 et le NO", order_index: 55 },
    { recto: "VRAI ou FAUX : l'angiotensine II est responsable d'une vasoconstriction predominant sur l'arteriole afferente", verso: "<b>FAUX</b>\nL'angiotensine II vasoconstricte de maniere predominante l'arteriole <b>EFFERENTE</b>\nL'arteriole afferente est protegee par PGI2 et NO", order_index: 56 },
    { recto: "A quelles concentrations l'angiotensine II agit-elle au niveau intrarrenal ?", verso: "A des concentrations extremement faibles (<b>10^-12</b>)\nCes concentrations n'ont qu'une action <b>locale</b> sur les vaisseaux renaux, sans effet sur les vaisseaux peripheriques", order_index: 57 },
    { recto: "Comment l'arteriole afferente est-elle protegee de la vasoconstriction de l'AG II ?", verso: "L'AG II induit la production locale de :\n· <b>Prostacycline PGI2</b> (vasodilatatrice)\n· <b>NO</b> (oxyde nitrique, vasodilatateur)\nCes 2 substances protegent l'AA de la vasoconstriction", order_index: 58 },
    { recto: "Pourquoi les AINS sont-ils dangereux pour le rein ?", verso: "Les AINS <b>inhibent la cyclo-oxygenase</b> -> diminution de la synthese de <b>PGI2</b>\n-> L'arteriole afferente n'est plus protegee -> vasoconstriction AA -> <b>insuffisance renale fonctionnelle</b>\nParticulierement dangereux chez le <b>sujet age</b> avec perfusion renale limite", order_index: 59 },
    { recto: "Quel est l'effet de l'AG II sur les cellules mesangiales ?", verso: "L'AG II induit la <b>contraction des cellules mesangiales</b>\n-> Diminution du <b>Kf</b> (coefficient de filtration)\nMais globalement le DFG est preserve car la Pcap est maintenue", order_index: 60 },
    { recto: "Que se passe-t-il avec la fraction filtree sous l'action du SRA ?", verso: "La fraction filtree <b>AUGMENTE</b>\nCar le DFG est preserve (Pcap maintenue) tandis que le DPR diminue un peu (augmentation des resistances totales)\nFF = DFG/DPR augmente", order_index: 61 },
    { recto: "VRAI ou FAUX : la fraction filtree diminue en cas de stimulation du SRA intrarrenal", verso: "<b>FAUX</b>\nLa fraction filtree <b>AUGMENTE</b> sous l'action du SRA\n(DFG preserve, DPR diminue un peu)", order_index: 62 },
    { recto: "Quelles sont les substances autacoides en dehors du SRA ?", verso: "· <b>Systeme kinine-kallicreine</b> : kallicreine (protease du tube distal) clive le kininogene en <b>bradykinine</b> (vasodilatatrice)\n· <b>NO</b> : libere par les cellules endotheliales de l'AA en reponse a l'AG II -> vasodilatateur -> protege l'AA", order_index: 63 },
    { recto: "Par quel systeme nerveux le rein est-il innerve ?", verso: "Le rein est innerve <b>UNIQUEMENT</b> par le <b>systeme sympathique</b>\nNeuromediateur : <b>noradrenaline</b>", order_index: 64 },
    { recto: "Quels sont les 2 types d'effets du systeme sympathique sur le rein ?", verso: "· <b>Beta 1 (indirect)</b> : liberation de renine par les cellules juxta-glomerulaires\n· <b>Alpha 1 (direct)</b> : vasoconstriction des 2 arterioles -> mis en jeu lors d'une tres forte chute de PA -> priorite cerveau et coeur", order_index: 65 },
    { recto: "Qu'est-ce que l'ANF (Facteur Natriuretique Auriculaire) ?", verso: "Peptide de <b>28 acides amines</b> libere par les <b>myocytes auriculaires</b> (oreillettes) quand ils sont <b>distendus</b> (augmentation volemie / PA elevee)", order_index: 66 },
    { recto: "Quelles sont les actions de l'ANF ?", verso: "· <b>Vasodilatation de l'arteriole afferente</b>\n· <b>Vasoconstriction de l'arteriole efferente</b>\n· <b>Augmentation du Kf</b>\n· <b>Inhibition de la liberation de renine</b>\n-> Favorise la filtration glomerulaire -> augmente la natriurese", order_index: 67 },
    { recto: "VRAI ou FAUX : l'ANF stimule la liberation de renine", verso: "<b>FAUX</b>\nL'ANF <b>INHIBE</b> la liberation de renine\nANF et renine ont des actions opposees et ne sont pas censes cohabiter", order_index: 68 },
    { recto: "Dans quelle circonstance l'ANF est-il libere ?", verso: "En cas d'<b>augmentation du volume sanguin circulant</b> (volemie elevee)\n-> Distension des myocytes auriculaires -> liberation d'ANF\n-> But : eliminer l'exces de volume par la natriurese", order_index: 69 },
    { recto: "VRAI ou FAUX : l'ANF augmente le DFG", verso: "<b>VRAI</b>\nL'ANF favorise la filtration glomerulaire par vasodilatation AA, vasoconstriction AE et augmentation du Kf", order_index: 70 },
    { recto: "Quels sont les mecanismes de regulation intrinseque du DSR/DFG ?", verso: "1. <b>Autoregulation renale</b> :\n   · Mecanisme myogenique\n   · Retrocontrole tubulo-glomerulaire\n2. <b>Substances autacoides</b> :\n   · SRA intrarrenal\n   · NO\n   · Systeme kinine-kallicreine", order_index: 71 },
    { recto: "Quels sont les mecanismes de regulation extrinseque du DSR/DFG ?", verso: "1. <b>Systeme nerveux sympathique</b> (noradrenaline -> effets beta1 et alpha1)\n2. <b>ANF</b> (Facteur natriuretique auriculaire) libere par le coeur", order_index: 72 },
    { recto: "Qu'est-ce qui cause la stenose de l'artere renale ?", verso: "Une <b>plaque d'atherome</b> qui vient obstruer l'artere renale\n-> Diminution de la pression de perfusion en aval de la stenose", order_index: 73 },
    { recto: "Que se passe-t-il lors d'une stenose de l'artere renale ?", verso: "Diminution Paa -> mise en jeu <b>permanente</b> du SRA (stenose constante)\n-> Haute concentration de <b>renine</b> dans la circulation generale\n-> AG II en grande quantite -> <b>vasoconstriction generale</b>\n-> AG II stimule la production d'<b>aldosterone</b> -> hypervolemie", order_index: 74 },
    { recto: "Qu'est-ce que l'HTA reno-vasculaire ?", verso: "HTA causee par une <b>stenose d'une artere renale</b>\n2 facteurs :\n· <b>Vasoconstriction</b> par AG II en exces (resistances peripheriques)\n· <b>Hypervolemie</b> par aldosterone (reabsorption de sel)\n= Cause d'<b>HTA secondaire</b>", order_index: 75 },
    { recto: "La stenose de l'artere renale entraine-t-elle un hyperaldosteronisme primaire ou secondaire ?", verso: "Un hyperaldosteronisme <b>SECONDAIRE</b> (pas primaire !)\nCar c'est la renine (en exces) qui stimule la production d'aldosterone via l'AG II", order_index: 76 },
    { recto: "Quelles sont les consequences de la stenose de l'artere renale ?", verso: "· <b>HTA reno-vasculaire</b> (HTA secondaire)\n· <b>Reduction de la natriurese</b>\n· <b>Hyperaldosteronisme secondaire</b>\n· <b>Hypokaliemie</b> (liee a l'aldosterone)\n· <b>Vasoconstriction de l'arteriole efferente</b>", order_index: 77 },
    { recto: "VRAI ou FAUX : le DFG ne peut en aucun cas exceder le DPR", verso: "<b>VRAI</b>\nLe DFG ne peut pas depasser le DPR car la filtration se fait a partir du plasma\n(Fraction filtree < 100%)", order_index: 78 },
    { recto: "Un DFG de 10 mL/min est-il suffisant ?", verso: "<b>NON</b>\nUn DFG de 10 mL/min est <b>insuffisant</b> pour permettre les fonctions d'epuration du rein\n(Normal = 120 mL/min)", order_index: 79 },
    { recto: "VRAI ou FAUX : une augmentation du DFG entraine une augmentation de la reabsorption proximale de Na+ et d'eau", verso: "<b>VRAI</b>\nC'est la <b>balance glomerulo-tubulaire</b> : elle adapte la reabsorption tubulaire proximale au DFG", order_index: 80 },
    { recto: "Qu'est-ce que la balance glomerulo-tubulaire ?", verso: "Mecanisme qui adapte la <b>reabsorption tubulaire proximale</b> de sodium et d'eau au debit de filtration glomerulaire\nSi DFG augmente -> reabsorption proximale augmente proportionnellement", order_index: 81 },
    { recto: "VRAI ou FAUX : le DFG diminue avec l'age", verso: "<b>VRAI</b>\nLe DFG diminue physiologiquement avec l'age", order_index: 82 },
    { recto: "Quelle est la methode de reference pour mesurer le DFG ?", verso: "La <b>clairance de l'inuline</b>\n(substance uniquement et librement filtree, ni reabsorbee ni secretee)", order_index: 83 },
    { recto: "VRAI ou FAUX : l'estimation du DFG par la creatinine plasmatique est aussi fiable que la mesure de sa clairance", verso: "<b>FAUX</b>\nL'estimation est moins fiable que la mesure directe de la clairance\nMais la clairance de la creatinine est <b>facile a mesurer</b> en pratique", order_index: 84 },
    { recto: "La formule de MDRD est-elle plus juste que celle de Cockcroft et Gault chez les sujets ages ?", verso: "<b>OUI</b>\nLa formule de MDRD est plus juste chez les sujets ages que celle de Cockcroft et Gault", order_index: 85 },
    { recto: "VRAI ou FAUX : les cellules de la Macula Densa produisent l'ECA", verso: "<b>FAUX</b>\nL'ECA (enzyme de conversion de l'angiotensine) est exprimee par les <b>cellules endotheliales du capillaire glomerulaire</b>\nLa macula densa intervient dans le TGF (production d'adenosine)", order_index: 86 },
    { recto: "La pression hydrostatique dans les capillaires glomerulaires est-elle plus elevee que dans les capillaires peritubulaires ?", verso: "<b>OUI</b>\nCapillaires glomerulaires : <b>40-60 mmHg</b> (tres elevee)\nCapillaires peritubulaires : pression habituelle pour un capillaire (beaucoup plus basse)", order_index: 87 },
    { recto: "La contraction des cellules mesangiales peut-elle modifier le DFG ?", verso: "<b>OUI</b>\nLa contraction des cellules mesangiales <b>reduit la surface d'echange</b> -> diminue le <b>Kf</b> -> modifie le DFG", order_index: 88 },
    { recto: "VRAI ou FAUX : une diminution du DSR induit une augmentation du DFG", verso: "<b>FAUX</b>\nUne diminution du DSR induit une <b>diminution</b> du DFG\n(Moins de sang perfuse le rein -> moins de filtration)", order_index: 89 },
    { recto: "Resume : comparaison regulation intrinseque (SRA) vs extrinseque (ANF)", verso: "<b>SRA</b> (diminution PA) : vasoconstriction AE, protection AA par PGI2/NO -> maintien Pcap -> DFG preserve, FF augmente\n<b>ANF</b> (augmentation volemie) : vasodilatation AA, vasoconstriction AE, augmentation Kf, inhibition renine -> augmentation DFG et natriurese\nActions <b>opposees</b> mais toutes deux protectrices du DFG", order_index: 90 },
  ],
  annales: [
    {
      titre: 'Annale 2022-2023',
      annee: '2022-2023',
      rappel_cours: "La filtration glomérulaire est un processus **passif** dépendant des forces de Starling.\n\n**Pressions de Starling :**\n· Pcap = 45 mmHg (pousse l'eau vers Bowman)\n· Pbow = 10 mmHg (s'oppose à la filtration)\n· πplasm = 20 mmHg au début (retient l'eau), **augmente** le long du capillaire\n· πbow = 0 mmHg\n\nLa pression hydrostatique est **stable** le long du capillaire, mais la pression oncotique **augmente** → la PUF n'est **PAS constante** le long du capillaire.\n\nLe glucose est librement filtré : sa concentration est identique dans l'artériole efférente et le filtrat.\n\nLa vasoconstriction de l'artériole efférente favorise la filtration (↑ Pcap en amont).\n\nLe mécanisme myogénique : ↑ PA → vasoconstriction réflexe de l'artériole afférente.",
      questions: [
        {
          enonce: "A propos de la filtration glomérulaire, indiquez la ou les réponse(s) exacte(s) :",
          items: [
            { lettre: 'A', enonce: 'La filtration glomérulaire est un processus actif', is_correct: false },
            { lettre: 'B', enonce: "La concentration plasmatique de glucose dans l'artériole efférente du glomérule est identique à la concentration de glucose dans le filtrat glomérulaire", is_correct: true },
            { lettre: 'C', enonce: "La pression d'ultrafiltration est identique sur toute la longueur du capillaire glomérulaire", is_correct: false },
            { lettre: 'D', enonce: "La vasoconstriction de l'artériole efférente du glomérule (sans autre modification par ailleurs) favorise la filtration glomérulaire", is_correct: true },
            { lettre: 'E', enonce: "Une augmentation de pression sanguine dans l'artériole afférente du glomérule induit une vasoconstriction « réflexe » de celle-ci", is_correct: true },
          ],
          correction: "**Réponse : BDE**\n\nA. **FAUX** — La filtration glomérulaire est un processus **passif** (forces de Starling).\nB. **VRAI** — Le glucose est librement filtré, sa concentration est identique dans le filtrat et dans le plasma (y compris l'artériole efférente), car autant de glucose que d'eau passe.\nC. **FAUX** — La PUF **diminue** le long du capillaire car la pression oncotique augmente progressivement (les protéines se concentrent).\nD. **VRAI** — La vasoconstriction de l'AE augmente la Pcap en amont, ce qui favorise la filtration.\nE. **VRAI** — C'est le **mécanisme myogénique** : l'augmentation de pression dans l'AA déclenche une vasoconstriction réflexe des cellules musculaires lisses.",
        },
      ],
    },
    {
      titre: 'Annale 2021-2022',
      annee: '2021-2022',
      rappel_cours: "**DFG normal = 120 mL/min** (20% du DPR de 600 mL/min). Le DFG ne peut pas excéder le DPR.\n\nUn DFG de 10 mL/min est insuffisant pour l'épuration rénale.\n\nLa **fraction filtrée augmente** sous stimulation du SRA (vasoconstriction AE → ↑ Pcap → DFG préservé, mais DPR diminue).\n\nLa **balance glomérulo-tubulaire** adapte la réabsorption proximale au DFG.\n\n**Autorégulation :** le rétrocontrôle tubulo-glomérulaire agit sur l'artériole **afférente** (pas efférente) via l'adénosine (macula densa). Le mécanisme myogénique est déclenché par une **augmentation** de pression dans l'AA (vasoconstriction réflexe).",
      questions: [
        {
          enonce: "A propos de la filtration glomérulaire, indiquez la ou les proposition(s) exacte(s) :",
          items: [
            { lettre: 'A', enonce: "Il s'agit d'un phénomène purement passif", is_correct: true },
            { lettre: 'B', enonce: "Le débit de filtration glomérulaire ne peut en aucun cas excéder le débit plasmatique rénal", is_correct: true },
            { lettre: 'C', enonce: "Un débit de filtration glomérulaire de 10 mL/min est insuffisant pour permettre les fonctions d'épuration du rein", is_correct: true },
            { lettre: 'D', enonce: "La fraction filtrée diminue en cas de stimulation du système rénine-angiotensine intrarénal", is_correct: false },
            { lettre: 'E', enonce: "Une augmentation du débit de filtration glomérulaire entraîne une augmentation de la réabsorption proximale de sodium et d'eau", is_correct: true },
          ],
          correction: "**Réponse : ABCE**\n\nA. **VRAI** — La filtration glomérulaire est un phénomène purement passif (forces de Starling).\nB. **VRAI** — Le DFG ne peut pas excéder le DPR car la filtration se fait à partir du plasma.\nC. **VRAI** — Le DFG normal est de 120 mL/min ; 10 mL/min est largement insuffisant pour l'épuration.\nD. **FAUX** — La stimulation du SRA provoque une vasoconstriction de l'artériole efférente → ↑ DFG et ↓ DPR → la fraction filtrée **AUGMENTE** (pas diminue).\nE. **VRAI** — C'est la balance glomérulo-tubulaire : la réabsorption proximale s'adapte au DFG.",
        },
        {
          enonce: "A propos de l'autorégulation du débit sanguin rénal :",
          items: [
            { lettre: 'A', enonce: "Le rétrocontrôle tubuloglomérulaire joue sur les résistances de l'artériole efférente du glomérule", is_correct: false },
            { lettre: 'B', enonce: "Le rétrocontrôle tubuloglomérulaire fait intervenir la libération d'adénosine par les cellules de la macula", is_correct: true },
            { lettre: 'C', enonce: "La mise en jeu du mécanisme myogénique induit une vasodilatation de l'artériole afférente", is_correct: false },
            { lettre: 'D', enonce: "Le mécanisme myogénique est mis en jeu en cas de diminution de pression dans l'artériole afférente", is_correct: false },
            { lettre: 'E', enonce: "La mise en jeu du mécanisme myogénique induit une diminution du débit de filtration glomérulaire", is_correct: false },
          ],
          correction: "**Réponse : B**\n\nA. **FAUX** — Le TGF agit sur l'artériole **afférente** (pas efférente) pour réguler le DSR et le DFG.\nB. **VRAI** — Le TGF fait intervenir la libération d'adénosine par les cellules de la macula densa.\nC. **FAUX** — Le mécanisme myogénique induit une **vasoconstriction** réflexe de l'artériole afférente (pas vasodilatation).\nD. **FAUX** — Le mécanisme myogénique est mis en jeu par une **augmentation** de pression dans l'AA (pas diminution). La distension des CML déclenche la contraction réflexe.\nE. **FAUX** — Le mécanisme myogénique ne diminue pas le DFG de manière pathologique ; il **maintient** le DFG stable en ajustant la résistance de l'AA.",
        },
      ],
    },
    {
      titre: 'Annale 2020-2021',
      annee: '2020-2021',
      rappel_cours: "**Autorégulation rénale :**\n· Le **rétrocontrôle tubulo-glomérulaire (TGF)** agit sur l'artériole **afférente** (pas efférente) via l'adénosine libérée par la macula densa.\n· Le **mécanisme myogénique** est déclenché par une **augmentation** de pression dans l'AA → vasoconstriction réflexe. Il maintient le DFG stable.\n\nAttention aux pièges classiques : le TGF ne joue PAS sur l'artériole efférente ; le mécanisme myogénique ne provoque PAS de vasodilatation.",
      questions: [
        {
          enonce: "A propos de l'autorégulation du débit sanguin rénal :",
          items: [
            { lettre: 'A', enonce: "Le rétrocontrôle tubuloglomérulaire joue sur les résistances de l'artériole efférente du glomérule", is_correct: false },
            { lettre: 'B', enonce: "Le rétrocontrôle tubuloglomérulaire fait intervenir la libération d'adénosine par les cellules de la macula densa", is_correct: true },
            { lettre: 'C', enonce: "La mise en jeu du mécanisme myogénique induit une vasodilatation de l'artériole afférente", is_correct: false },
            { lettre: 'D', enonce: "Le mécanisme myogénique est mis en jeu en cas de diminution de pression dans l'artériole afférente", is_correct: false },
            { lettre: 'E', enonce: "La mise en jeu du mécanisme myogénique induit une diminution du débit de filtration glomérulaire", is_correct: false },
          ],
          correction: "**Réponse : B**\n\nA. **FAUX** — Le TGF joue sur l'artériole **afférente**, pas efférente.\nB. **VRAI** — Le TGF fait intervenir l'adénosine produite par les cellules de la macula densa.\nC. **FAUX** — Le mécanisme myogénique induit une **vasoconstriction** (contraction réflexe des CML de l'AA).\nD. **FAUX** — Le mécanisme myogénique est mis en jeu par une **augmentation** de pression (pas diminution).\nE. **FAUX** — Le mécanisme myogénique maintient le DFG stable. La vasoconstriction de l'AA compense l'augmentation de pression pour que le DFG ne varie pas.\n\nNote : la correction officielle indiquait « BE » mais l'item E est discutable car le mécanisme myogénique a pour but de **stabiliser** le DFG, pas de le diminuer. En QCM, B est la réponse la plus sûre.",
        },
      ],
    },
    {
      titre: 'Annale 2019 - Session 1',
      annee: '2019',
      rappel_cours: "**DSR = 20% du débit cardiaque** (1200 mL/min), PAS 80%.\n\nLe DSR est **relativement constant** pour une PAM entre **80 et 140 mmHg** (autorégulation).\n\nLa majeure partie du DSR est distribuée dans le **cortex** (90%), PAS dans la médullaire.\n\nUne diminution du DSR entraîne une **diminution** du DFG (pas une augmentation).",
      questions: [
        {
          enonce: "Parmi les propositions suivantes concernant le débit sanguin rénal (DSR), indiquez la (les) réponse(s) exacte(s) :",
          items: [
            { lettre: 'A', enonce: 'Le DSR est relativement constant lorsque la pression artérielle systémique moyenne est comprise entre 80 et 140 mmHg', is_correct: true },
            { lettre: 'B', enonce: 'Le DSR représente 80% du débit cardiaque', is_correct: false },
            { lettre: 'C', enonce: 'La majeure partie du DSR est distribuée dans la médullaire rénale', is_correct: false },
            { lettre: 'D', enonce: 'Une diminution du DSR induit une augmentation du débit de filtration glomérulaire', is_correct: false },
            { lettre: 'E', enonce: "Aucune de ces propositions précédentes n'est exacte", is_correct: false },
          ],
          correction: "**Réponse : A**\n\nA. **VRAI** — Le DSR est autorégulé et reste stable pour une PAM entre 80 et 140 mmHg.\nB. **FAUX** — Le DSR représente **20%** du débit cardiaque (pas 80%).\nC. **FAUX** — La majeure partie du DSR est distribuée dans le **cortex** (90%), pas la médullaire (10%).\nD. **FAUX** — Une diminution du DSR induit une **diminution** du DFG (moins de perfusion = moins de filtration).\nE. **FAUX** — La proposition A est exacte.",
        },
      ],
    },
    {
      titre: 'Annale 2018 - Session 2',
      annee: '2018',
      rappel_cours: "**Pressions dans le capillaire glomérulaire :**\n· La pression **hydrostatique varie peu** entre le début et la fin du capillaire (stable)\n· La pression **oncotique plasmatique AUGMENTE** le long du capillaire (les protéines se concentrent → FAUX de dire qu'elle ne varie pas)\n· La Pcap glomérulaire (40-60 mmHg) est **plus élevée** que la Pcap péritubulaire\n· Les cellules mésangiales sont **contractiles** et peuvent modifier le Kf donc le DFG\n· Le DFG **diminue avec l'âge**",
      questions: [
        {
          enonce: "Toutes les propositions suivantes concernant la filtration glomérulaire sont exactes, SAUF UNE. Laquelle ?",
          items: [
            { lettre: 'A', enonce: 'La pression hydrostatique varie peu entre le début et la fin du capillaire glomérulaire', is_correct: false },
            { lettre: 'B', enonce: 'La pression oncotique plasmatique ne varie pas entre le début et la fin du capillaire glomérulaire', is_correct: true },
            { lettre: 'C', enonce: 'La pression hydrostatique dans les capillaires glomérulaires est plus élevée que la pression hydrostatique dans les capillaires péritubulaires', is_correct: false },
            { lettre: 'D', enonce: 'La contraction des cellules mésangiales peut modifier le débit de filtration glomérulaire', is_correct: false },
            { lettre: 'E', enonce: 'Le débit de filtration glomérulaire diminue avec l\'âge', is_correct: false },
          ],
          correction: "**Réponse : B** (c'est l'affirmation FAUSSE)\n\nA. EXACTE — La pression hydrostatique reste relativement stable le long du capillaire glomérulaire.\nB. **FAUSSE** (réponse) — La pression oncotique **augmente** le long du capillaire car les protéines se concentrent à mesure que l'eau est filtrée.\nC. EXACTE — La Pcap glomérulaire (40-60 mmHg) est bien plus élevée que celle des capillaires péritubulaires.\nD. EXACTE — Les cellules mésangiales sont contractiles et modifient la surface d'échange (Kf) donc le DFG.\nE. EXACTE — Le DFG diminue physiologiquement avec l'âge.\n\nNote : question de type « SAUF UNE » → la réponse est l'item B qui est faux. Items A/C/D/E ne sont pas cochés car ils sont vrais (= non sélectionnés dans un QCM « SAUF UNE »).",
        },
      ],
    },
    {
      titre: 'Annale 2017 - Session 2',
      annee: '2017',
      rappel_cours: "**Sténose de l'artère rénale :** plaque d'athérome → ↓ pression de perfusion → mise en jeu permanente du SRA.\n\nConséquences : ↑ rénine → ↑ AG II (vasoconstriction générale) + ↑ aldostérone (hypervolémie) → **HTA réno-vasculaire** (secondaire).\n\nL'hyperaldostéronisme est **secondaire** (pas primaire) car c'est la rénine qui stimule la production d'aldostérone.\n\nAutres conséquences : ↓ natriurèse, hypokaliémie, vasoconstriction de l'artériole efférente (AG II).",
      questions: [
        {
          enonce: "Une sténose importante d'une artère rénale peut induire :",
          items: [
            { lettre: 'A', enonce: 'Une réduction de la natriurèse', is_correct: true },
            { lettre: 'B', enonce: 'Un hyperaldostéronisme primaire', is_correct: false },
            { lettre: 'C', enonce: 'Une hypokaliémie', is_correct: true },
            { lettre: 'D', enonce: 'Une hypertension artérielle', is_correct: true },
            { lettre: 'E', enonce: "Une vasoconstriction de l'artériole efférente du glomérule", is_correct: true },
          ],
          correction: "**Réponse : ACDE**\n\nA. **VRAI** — La sténose active le SRA → ↑ aldostérone → ↑ réabsorption de Na⁺ → ↓ natriurèse.\nB. **FAUX** — C'est un hyperaldostéronisme **secondaire** (pas primaire). L'aldostérone est stimulée par la rénine via AG II, pas par une anomalie surrénalienne.\nC. **VRAI** — L'aldostérone favorise l'excrétion de K⁺ → hypokaliémie.\nD. **VRAI** — HTA réno-vasculaire par vasoconstriction (AG II) + hypervolémie (aldostérone).\nE. **VRAI** — AG II provoque une vasoconstriction prédominant sur l'artériole efférente.",
        },
      ],
    },
    {
      titre: 'Annale 2015 - Session 1',
      annee: '2015',
      rappel_cours: "**Pressions glomérulaires :** la pression hydrostatique varie peu le long du capillaire, mais la pression oncotique **augmente** (→ l'item « ne varie pas » est FAUX).\n\n**Régulation du DFG :**\n· Le mécanisme myogénique est mis en jeu par **↑ pression** dans l'AA (pas ↓).\n· Le TGF aboutit à une vasoconstriction de l'artériole **afférente** (pas efférente).\n· AG II → vasoconstriction prédominant sur l'artériole **efférente** (pas afférente).\n· La rénine est libérée quand la pression **diminue** (pas quand elle augmente).\n· L'ECA est produite par les cellules endothéliales du capillaire, PAS par la macula densa.",
      questions: [
        {
          enonce: "Toutes les propositions suivantes concernant la filtration glomérulaire sont exactes, SAUF UNE. Laquelle ?",
          items: [
            { lettre: 'A', enonce: 'La pression hydrostatique varie peu entre le début et la fin du capillaire glomérulaire', is_correct: false },
            { lettre: 'B', enonce: 'La pression hydrostatique dans les capillaires glomérulaires est plus élevée que la pression hydrostatique dans les capillaires péritubulaires', is_correct: false },
            { lettre: 'C', enonce: 'La pression oncotique plasmatique ne varie pas entre le début et la fin du capillaire glomérulaire', is_correct: true },
            { lettre: 'D', enonce: 'La contraction des cellules mésangiales peut modifier le débit de filtration glomérulaire', is_correct: false },
            { lettre: 'E', enonce: 'Le débit de filtration glomérulaire diminue avec l\'âge', is_correct: false },
          ],
          correction: "**Réponse : C** (c'est l'affirmation FAUSSE)\n\nA. EXACTE — La pression hydrostatique reste stable le long du capillaire glomérulaire.\nB. EXACTE — Pcap glomérulaire (40-60 mmHg) > Pcap péritubulaire.\nC. **FAUSSE** (réponse) — La pression oncotique **augmente** le long du capillaire (les protéines se concentrent).\nD. EXACTE — Les cellules mésangiales sont contractiles → modifient le Kf → modifient le DFG.\nE. EXACTE — Le DFG diminue avec l'âge.",
        },
        {
          enonce: "Parmi les propositions suivantes concernant la régulation du débit de filtration glomérulaire (DFG), indiquez celle ou celles qui est (sont) exacte(s) :",
          items: [
            { lettre: 'A', enonce: "Le mécanisme myogénique est mis en jeu par l'augmentation de pression dans l'artériole afférente du glomérule", is_correct: true },
            { lettre: 'B', enonce: "Le rétrocontrôle tubuloglomérulaire aboutit à une vasoconstriction de l'artériole efférente du glomérule", is_correct: false },
            { lettre: 'C', enonce: "L'angiotensine II est responsable d'une vasoconstriction prédominant sur l'artériole afférente du glomérule", is_correct: false },
            { lettre: 'D', enonce: "L'augmentation de pression dans l'artériole afférente du glomérule induit la libération de rénine par les cellules juxta-glomérulaires", is_correct: false },
            { lettre: 'E', enonce: "Les cellules de la Macula Densa produisent l'enzyme de conversion de l'angiotensine", is_correct: false },
          ],
          correction: "**Réponse : A**\n\nA. **VRAI** — Le mécanisme myogénique est déclenché par une augmentation de pression dans l'AA → vasoconstriction réflexe.\nB. **FAUX** — Le TGF aboutit à une vasoconstriction de l'artériole **afférente** (pas efférente).\nC. **FAUX** — AG II vasoconstricte de manière prédominante l'artériole **efférente** (l'AA est protégée par PGI2 et NO).\nD. **FAUX** — La rénine est libérée quand la pression **diminue** dans l'AA (pas quand elle augmente). Les cellules juxta-glomérulaires sont des barorécepteurs qui détectent la baisse de pression.\nE. **FAUX** — L'ECA est produite par les **cellules endothéliales du capillaire glomérulaire**, pas par la macula densa. La macula densa produit de l'adénosine (TGF).",
        },
      ],
    },
    {
      titre: 'Annale 2015 - Session 2',
      annee: '2015',
      rappel_cours: "**Mesure du DFG :**\n· Nécessite une substance **uniquement et librement filtrée** (ni réabsorbée, ni sécrétée)\n· Méthode de référence = **clairance de l'inuline**\n· La clairance de la créatinine est **facile à mesurer** en pratique\n· L'estimation du DFG par la créatinine plasmatique est **moins fiable** que la mesure de sa clairance\n· La formule de **MDRD** est plus juste chez les sujets âgés que celle de **Cockcroft et Gault**",
      questions: [
        {
          enonce: "A propos de la mesure du débit de filtration glomérulaire (DFG), toutes sont exactes sauf une. Laquelle ?",
          items: [
            { lettre: 'A', enonce: 'La mesure du DFG nécessite une substance qui soit uniquement et librement filtrée', is_correct: false },
            { lettre: 'B', enonce: "La méthode de référence est la clairance de l'inuline", is_correct: false },
            { lettre: 'C', enonce: 'La clairance de la créatinine est facile à mesurer en pratique', is_correct: false },
            { lettre: 'D', enonce: "L'estimation du DFG à partir de la concentration plasmatique de créatinine est tout aussi fiable que la mesure de sa clairance", is_correct: true },
            { lettre: 'E', enonce: 'La formule de MDRD est plus juste chez les sujets âgés que celle de Cockcroft et Gault', is_correct: false },
          ],
          correction: "**Réponse : D** (c'est l'affirmation FAUSSE)\n\nA. EXACTE — Le DFG se mesure avec une substance uniquement et librement filtrée (ni réabsorbée, ni sécrétée).\nB. EXACTE — La clairance de l'inuline est la méthode de référence.\nC. EXACTE — La clairance de la créatinine est facile à mesurer en pratique courante.\nD. **FAUSSE** (réponse) — L'estimation par la créatinine plasmatique est **moins fiable** que la mesure directe de la clairance (la créatinine est partiellement sécrétée par le tubule).\nE. EXACTE — La formule de MDRD est plus adaptée chez les sujets âgés que Cockcroft et Gault (qui surestime le DFG chez le sujet âgé).",
        },
      ],
    },
    {
      titre: 'Annale - Questions classées (filtration glomérulaire)',
      annee: 'Classées',
      rappel_cours: "**Balance glomérulo-tubulaire** : adapte la réabsorption tubulaire proximale de Na⁺ et d'eau au DFG.\n\n**Filtration glomérulaire** : processus passif. Le DFG représente 20% du DPR (pas du DSR !).\n\nLe glucose est librement filtré → son débit massique de filtration n'est **PAS nul** chez le sujet non diabétique.\n\nLa filtration s'interrompt quand la pression oncotique dans le capillaire glomérulaire égale la ΔP hydrostatique (Pcap - Pbow), PAS quand Pbow > π oncotique.",
      questions: [
        {
          enonce: "Parmi les propositions suivantes concernant la filtration glomérulaire, indiquez la (les) réponse(s) exacte(s) :",
          items: [
            { lettre: 'A', enonce: "La balance glomérulotubulaire permet d'adapter la réabsorption tubulaire proximale de sodium et d'eau au débit de filtration glomérulaire", is_correct: true },
            { lettre: 'B', enonce: "Le processus de filtration glomérulaire s'interrompt lorsque la pression hydrostatique dans la capsule de Bowman devient supérieure à la pression oncotique dans le capillaire glomérulaire", is_correct: false },
            { lettre: 'C', enonce: "Chez l'Homme, le débit de filtration glomérulaire représente normalement 20% du débit sanguin rénal", is_correct: false },
            { lettre: 'D', enonce: 'Le processus de filtration glomérulaire est un phénomène passif', is_correct: true },
            { lettre: 'E', enonce: "Chez un sujet non diabétique, le débit massique de filtration glomérulaire du glucose est nul", is_correct: false },
          ],
          correction: "**Réponse : AD**\n\nA. **VRAI** — La balance glomérulo-tubulaire adapte la réabsorption proximale de Na⁺ et d'eau au DFG.\nB. **FAUX** — La filtration s'interrompt quand la **pression oncotique** dans le capillaire glomérulaire égale la ΔP hydrostatique (35 mmHg), pas quand Pbow > π oncotique.\nC. **FAUX** — Le DFG représente 20% du **DPR** (débit plasmatique rénal = 600 mL/min), pas du DSR (débit sanguin rénal = 1200 mL/min).\nD. **VRAI** — La filtration glomérulaire est un phénomène passif (forces de Starling).\nE. **FAUX** — Le glucose est librement filtré, son débit massique de filtration n'est **pas nul** chez le sujet non diabétique.",
        },
        {
          enonce: "Le facteur natriurétique auriculaire (ANF) :",
          items: [
            { lettre: 'A', enonce: "Induit une vasodilatation de l'artériole afférente du glomérule", is_correct: true },
            { lettre: 'B', enonce: 'Augmente le débit de filtration glomérulaire', is_correct: true },
            { lettre: 'C', enonce: 'Diminue la natriurèse', is_correct: false },
            { lettre: 'D', enonce: 'Est libéré en cas d\'augmentation du volume sanguin circulant', is_correct: true },
            { lettre: 'E', enonce: 'Stimule la libération de rénine', is_correct: false },
          ],
          correction: "**Réponse : ABD**\n\nA. **VRAI** — L'ANF induit une vasodilatation de l'artériole afférente (pour favoriser la filtration).\nB. **VRAI** — L'ANF augmente le DFG par vasodilatation AA + vasoconstriction AE + ↑ Kf.\nC. **FAUX** — L'ANF **augmente** la natriurèse (c'est son rôle : éliminer l'excès de Na⁺ et d'eau).\nD. **VRAI** — L'ANF est libéré par les myocytes auriculaires quand ils sont distendus (↑ volume sanguin circulant).\nE. **FAUX** — L'ANF **inhibe** la libération de rénine (actions opposées).",
        },
      ],
    },
  ],
};

export default content;

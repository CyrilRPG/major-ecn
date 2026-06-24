import type { PriveCourseContent } from '../prive-courses';

const content: PriveCourseContent = {
  fiche: {
    parties: [
      {
        numero: 'I',
        titre: 'Fonctions du rein',
        sous_parties: [
          {
            titre: 'Fonctions principales',
            rows: [
              { concept: '◆ Homéostasie', detail_md: "Régulation du **volume et de la composition** du compartiment extracellulaire = homéostasie du milieu intérieur", kind: 'a_retenir' },
              { concept: 'Équilibre acido-basique', detail_md: "Maintien de l'équilibre acido-basique **conjointement avec l'appareil respiratoire**", kind: 'normal' },
              { concept: '◆ Fonction d\'émonctoire', detail_md: "Excrétion des déchets du métabolisme :\n· **Urée** = déchets du catabolisme protéique\n· **Acide urique** = déchets du catabolisme des acides nucléiques\n· **Créatinine** = déchet du métabolisme musculaire", kind: 'a_retenir' },
            ],
          },
          {
            titre: 'Fonction endocrine',
            rows: [
              { concept: '◆ 3 hormones produites', detail_md: "1. **Rénine** : contrôle de la pression artérielle (cellules juxtaglomérulaires)\n2. **Érythropoïétine (EPO)** : stimule la production des globules rouges, sécrétée par les fibroblastes du tubule rénal en réponse à l'hypoxie\n3. **Calcitriol** = forme active de la vitamine D (1,25-dihydroxyvitamine D₃)", kind: 'a_retenir' },
            ],
          },
        ],
      },
      {
        numero: 'II',
        titre: 'Structure du rein',
        sous_parties: [
          {
            titre: 'Macrostructure',
            rows: [
              { concept: '◆ Cortex et médullaire', detail_md: "· **Cortex** = partie périphérique contenant les glomérules\n· **Médullaire** = partie interne où plongent les tubules", kind: 'a_retenir' },
              { concept: 'Lobules rénaux', detail_md: "Contiennent les glomérules dans le cortex, les tubules forment les **pyramides de Malpighi**\n**Colonnes de Bertin** = tissu conjonctif entre les lobules\nChaque lobule est vascularisé par une **artère interlobaire**", kind: 'normal' },
              { concept: 'Voies excrétrices', detail_md: "L'urine se forme dans le néphron, atteint sa forme définitive à la fin du tubule rénal au niveau des **papilles**\nPuis : calices → bassinet → uretère", kind: 'normal' },
            ],
          },
          {
            titre: 'Le néphron (unité fonctionnelle)',
            rows: [
              { concept: '◆ Nombre', detail_md: "~**1 million** de néphrons par rein", kind: 'a_retenir' },
              { concept: '◆ Glomérule', detail_md: "Structure sphérique située **TOUJOURS dans le cortex** = interface entre circulation sanguine et espace urinaire\n**Filtration glomérulaire** : une partie du plasma passe dans l'espace urinaire → capsule de Bowman", kind: 'a_retenir' },
              { concept: '⚠ Localisation du glomérule', detail_md: "Le glomérule est **TOUJOURS** situé dans le cortex, jamais dans la médullaire (même pour les néphrons profonds)", kind: 'piege' },
              { concept: 'Tubule rénal (trajet)', detail_md: "**Tube contourné proximal** (cortex) → **Tube droit proximal** (médullaire) → **Anse de Henlé** (branche descendante fine → branche ascendante fine → branche ascendante large = tube droit distal) → **Tube contourné distal** (contact avec glomérule via macula densa) → **Canal connecteur** → **Canal collecteur** (urine définitive, vers papille)", kind: 'normal' },
              { concept: '◆ 2 types de néphrons', detail_md: "· **Néphrons superficiels** : anse courte, médullaire externe\n· **Néphrons profonds** (juxtamédullaires) : anse longue, médullaire interne → contribuent à la concentration/dilution de l'urine", kind: 'a_retenir' },
            ],
          },
          {
            titre: 'Le glomérule',
            rows: [
              { concept: '◆ Vascularisation glomérulaire', detail_md: "Sang arrive par **artériole afférente** (issue de l'artère arquée) → **capillaire glomérulaire (flocculus)** → sort par **artériole efférente**", kind: 'a_retenir' },
              { concept: 'Capsule de Bowman', detail_md: "Espace urinaire délimité par des cellules épithéliales\nLe capillaire glomérulaire est recouvert côté urinaire par les **podocytes** avec leurs **pédicelles**\nL'espace urinaire s'ouvre sur le tube contourné proximal", kind: 'normal' },
              { concept: '◆ Membrane basale glomérulaire (MBG)', detail_md: "De la lumière capillaire vers l'espace urinaire :\n**Cellule endothéliale fenêtrée** → **Membrane basale** → **Pédicelles des podocytes** → Espace urinaire\n= Filtre mécanique + filtre électrique (chargée négativement)", kind: 'a_retenir' },
              { concept: 'Cellules mésangiales', detail_md: "Cellules conjonctives **contractiles** pouvant réduire la zone d'échange → modifient le Kf\nSous le contrôle de l'angiotensine II notamment", kind: 'normal' },
            ],
          },
          {
            titre: 'Appareil juxtaglomérulaire',
            rows: [
              { concept: '◆ Macula densa', detail_md: "Cellules sombres du **tube contourné distal** situées au contact des 2 artérioles (afférente et efférente)\nDétecte le débit de Na⁺/Cl⁻ dans le filtrat tubulaire", kind: 'a_retenir' },
              { concept: '◆ Cellules juxtaglomérulaires', detail_md: "Cellules **myoépithéliales** situées dans la paroi de l'**artériole AFFÉRENTE uniquement**\n· Produisent et sécrètent la **rénine**\n· Rôle de **barorécepteurs intra-rénaux** (sensibles aux variations de pression dans l'AA)", kind: 'a_retenir' },
              { concept: '⚠ Piège artériole efférente', detail_md: "L'artériole efférente contient des cellules musculaires lisses mais **PAS de cellules myoépithéliales**\nLes cellules productrices de rénine sont dans l'artériole AFFÉRENTE uniquement", kind: 'piege' },
            ],
          },
          {
            titre: 'Vascularisation rénale',
            rows: [
              { concept: '◆ Trajet vasculaire', detail_md: "Artère arquée → **artériole afférente** → capillaire glomérulaire (1er réseau capillaire) → **artériole efférente** → capillaire péritubulaire (2e réseau capillaire) → veine", kind: 'a_retenir' },
              { concept: '◆ Système porte artériel', detail_md: "**2 réseaux capillaires en série** séparés par l'artériole efférente\n= Système porte artériel (unique dans l'organisme avec le système porte hépatique)", kind: 'a_retenir' },
              { concept: 'Vasa recta', detail_md: "Néphrons profonds : **vasa recta** (vaisseaux droits) longent l'anse de Henlé\nParticipent au mécanisme de concentration/dilution de l'urine", kind: 'normal' },
              { concept: '◆ Répartition du flux sanguin', detail_md: "**90% du sang** irrigue le cortex\n**10%** irrigue la médullaire\nPlus de vaisseaux dans le cortex que dans la médullaire", kind: 'a_retenir' },
            ],
          },
        ],
      },
      {
        numero: 'III',
        titre: 'DSR et DPR',
        sous_parties: [
          {
            titre: 'Débits rénaux',
            rows: [
              { concept: '◆ DSR', detail_md: "**DSR = 20% du débit cardiaque = 1200 mL/min**\nDébit très élevé rapporté à la masse de l'organe → reins très vascularisés\n90% vers le cortex / 10% vers la médullaire", kind: 'a_retenir' },
              { concept: '◆ DPR', detail_md: "**DPR = DSR × (1 - hématocrite) = 600 mL/min**\n(Hématocrite ≈ 50%)", kind: 'a_retenir' },
              { concept: 'Déterminants du DSR', detail_md: "DSR déterminé par :\n· **Pression artérielle de perfusion**\n· **Résistances vasculaires rénales** (artérioles afférente et efférente)", kind: 'normal' },
              { concept: '⚠ DSR élevé : pourquoi ?', detail_md: "Le DSR élevé n'est PAS destiné à couvrir les besoins métaboliques du rein (seuls 10-15% de l'O₂ sont consommés)\nIl est élevé pour **assurer la filtration glomérulaire**", kind: 'piege' },
            ],
          },
          {
            titre: 'Pressions vasculaires rénales',
            rows: [
              { concept: '◆ Profil de pressions', detail_md: "· **Artériole afférente** (début) : pression moyenne systémique 100-120 mmHg, les résistances font chuter la pression\n· **Capillaires glomérulaires** : **40-60 mmHg** (élevé pour un capillaire !), pression reste **constante** le long du capillaire (pas de résistance significative)\n· **Artériole efférente** : résistances font à nouveau chuter la pression\n· **Capillaires péritubulaires** : pression habituelle pour un capillaire", kind: 'a_retenir' },
              { concept: '◆ Siège des résistances', detail_md: "Les résistances vasculaires rénales sont localisées au niveau des **artérioles afférentes et efférentes**\nLes capillaires glomérulaires eux-mêmes n'opposent pas de résistance significative", kind: 'a_retenir' },
            ],
          },
          {
            titre: 'DSR et filtration',
            rows: [
              { concept: '◆ Filtration', detail_md: "**Filtration** = passage d'eau + substances dissoutes du plasma à travers la MBG vers l'espace urinaire\n→ Formation de l'**urine primitive (ultrafiltrat)**", kind: 'a_retenir' },
            ],
          },
        ],
      },
      {
        numero: 'IV',
        titre: 'Filtration glomérulaire',
        sous_parties: [
          {
            titre: 'DFG et ultrafiltrat',
            rows: [
              { concept: '◆ DFG', detail_md: "**1/5 (20%) du DPR** traverse la MBG = filtrat glomérulaire\n**DFG = 120 mL/min = 180 L/jour**\n(Mais l'essentiel est réabsorbé par les tubules)", kind: 'a_retenir' },
              { concept: '◆ Débits entrant et sortant', detail_md: "· DPR entrant (artériole afférente) = **600 mL/min**\n· DFG = **120 mL/min** (soit 20% = fraction filtrée)\n· DPR sortant (artériole efférente) = **480 mL/min**", kind: 'a_retenir' },
              { concept: '◆ Composition de l\'ultrafiltrat', detail_md: "L'ultrafiltrat a une composition **identique au plasma** pour les petites molécules (urée, glucose, ions)\nLes **protéines > 60 kDa sont retenues** (albumine, etc.)", kind: 'a_retenir' },
              { concept: '◆ Double filtre de la MBG', detail_md: "La MBG agit comme :\n· **Filtre mécanique** : retient les grosses molécules (> 60 kDa)\n· **Filtre électrique** : chargée **négativement** → repousse les molécules anioniques", kind: 'a_retenir' },
              { concept: 'Expérience du dextran', detail_md: "Dextran à **charge positive** → filtration augmentée\nDextran à **charge négative** → filtration diminuée\nPlus la **taille** est grande → moins la molécule est filtrée", kind: 'normal' },
            ],
          },
          {
            titre: 'Glucose et protéines le long du capillaire',
            rows: [
              { concept: '◆ Glucose', detail_md: "Concentration de glucose **identique** entre artériole afférente et artériole efférente (5 mmol/L)\nCar autant de glucose que d'eau sort du capillaire → concentration inchangée", kind: 'a_retenir' },
              { concept: '◆ Protéines', detail_md: "Concentration protéique **augmente** entre AA et AE\nMême quantité de protéines (retenues par la MBG) mais moins d'eau → les protéines se concentrent\n→ La **pression oncotique augmente** le long du capillaire", kind: 'a_retenir' },
              { concept: '⚠ Piège glucose vs protéines', detail_md: "Ne pas confondre : le glucose (filtré librement) garde la même concentration, alors que les protéines (retenues) se concentrent le long du capillaire glomérulaire", kind: 'piege' },
            ],
          },
          {
            titre: 'Forces de Starling',
            rows: [
              { concept: '◆ Équation du DFG', detail_md: "**DFG = Kf × Pression d'ultrafiltration (PUF)**\nKf = surface de filtration × perméabilité hydraulique", kind: 'a_retenir' },
              { concept: '◆ Les 4 pressions', detail_md: "· **Pcap** (pression hydrostatique capillaire glomérulaire) = **45 mmHg** → pousse l'eau vers Bowman (FAVORISE filtration)\n· **πplasm** (pression oncotique plasmatique) = **20 mmHg** → retient l'eau dans le capillaire (S'OPPOSE à la filtration)\n· **Pbow** (pression hydrostatique capsule de Bowman) = **10 mmHg** (S'OPPOSE à la filtration)\n· **πbow** (pression oncotique de Bowman) = **0 mmHg** (pas de protéines dans Bowman)", kind: 'a_retenir' },
              { concept: '◆ Calcul de la PUF', detail_md: "**PUF = (Pcap - Pbow) - (πplasm - πbow)**\n= (45 - 10) - (20 - 0)\n= 35 - 20 = **15 mmHg**\n\nΔP hydrostatique = Pcap - Pbow = **35 mmHg** → reste **constant** le long du capillaire", kind: 'a_retenir' },
              { concept: '◆ Évolution le long du capillaire', detail_md: "· ΔP hydrostatique (35 mmHg) **NE VARIE PAS** le long du capillaire\n· **πplasm AUGMENTE** le long du capillaire (eau perdue → protéines concentrées)\n· Quand πplasm = ΔP hydrostatique (35 mmHg), la **filtration s'arrête**\n→ L'équilibre de filtration peut être atteint avant la fin du capillaire", kind: 'a_retenir' },
              { concept: '⚠ Piège pression d\'ultrafiltration', detail_md: "La PUF **n'est PAS constante** le long du capillaire glomérulaire !\nElle **diminue** progressivement car πplasm augmente (concentration des protéines)\nSeule la pression hydrostatique reste constante", kind: 'piege' },
              { concept: 'Maintien de Pcap', detail_md: "La Pcap est maintenue haute et stable grâce aux **résistances vasculaires**, notamment l'**artériole efférente** qui est contractée\n→ Le sang est « retenu » dans le capillaire glomérulaire", kind: 'normal' },
            ],
          },
        ],
      },
      {
        numero: 'V',
        titre: 'Régulation du DSR et du DFG',
        sous_parties: [
          {
            titre: 'Principes de régulation',
            rows: [
              { concept: '◆ Lien DSR-DFG', detail_md: "Le DFG dépend du DSR\nDiminution du DFG → **insuffisance rénale**\nRôle de la circulation rénale : **protéger le DFG** contre les variations de PA systémique", kind: 'a_retenir' },
              { concept: '◆ Balance des résistances', detail_md: "La balance des résistances AA et AE détermine la **Pcap** :\n· ↓ Raa + ↑ Rae → Pcap maintenue → **FAVORISE** la filtration\n· ↑ Raa + ↓ Rae → Pcap chute → filtration **DIMINUE**\n· Augmentation Rae seule → **augmente** la filtration\n· Augmentation Raa seule → filtration **chute**", kind: 'a_retenir' },
              { concept: '⚠ Conséquences pathologiques', detail_md: "· **Chute de pression importante** (état de choc) → ↓ DSR → ↓ DFG → insuffisance rénale fonctionnelle\n· **HTA chronique** → néphro-angiosclérose → glomérulosclérose → IRC", kind: 'piege' },
            ],
          },
          {
            titre: 'Vue d\'ensemble des mécanismes',
            rows: [
              { concept: '◆ Régulation intrinsèque', detail_md: "1. **Autorégulation rénale** : mécanisme myogénique + rétrocontrôle tubuloglomérulaire (TGF)\n2. **Substances autacoïdes** : SRA intrarénal, NO, système kinine-kallicréine", kind: 'a_retenir' },
              { concept: '◆ Régulation extrinsèque', detail_md: "1. **Système nerveux sympathique** (noradrénaline)\n2. **ANF** (facteur atrial natriurétique)", kind: 'a_retenir' },
            ],
          },
          {
            titre: 'Autorégulation rénale',
            rows: [
              { concept: '◆ Principe', detail_md: "DSR, DPR et DFG restent **stables** pour une PA moyenne entre **80 et 140 mmHg**\nException : pression trop basse (état de choc) → IR aiguë hémodynamique", kind: 'a_retenir' },
              { concept: '◆ Mécanisme myogénique', detail_md: "Agit sur les résistances de l'**artériole afférente**\nPA ↑ → pression AA ↑ → **distension** des CML de AA → flux Ca²⁺ (canaux voltage-dépendants) → **contraction** des CML de AA → ↓ Pcap → correction du DFG\n= **Vasoconstriction réflexe** de l'AA en réponse à une augmentation de pression", kind: 'a_retenir' },
              { concept: '⚠ Piège mécanisme myogénique', detail_md: "Le mécanisme myogénique induit une **vasoconstriction** (pas une vasodilatation) de l'AA\nIl est mis en jeu en cas d'**augmentation** de pression dans l'AA (pas en cas de diminution)", kind: 'piege' },
            ],
          },
          {
            titre: 'Rétrocontrôle tubuloglomérulaire (TGF)',
            rows: [
              { concept: '◆ Principe du TGF', detail_md: "Agit sur les résistances de l'**artériole AFFÉRENTE** (pas efférente)\nFonctionne dans les **2 sens** (pression trop haute ou trop basse)\nMédiateur : **adénosine** (produite par les cellules de la macula densa)", kind: 'a_retenir' },
              { concept: '◆ Sens 1 (pression trop haute)', detail_md: "PA ↑ → Pcap ↑ → filtration ↑ → plus de filtrat (eau + ions) → macula densa réabsorbe plus de Na⁺/Cl⁻ → plus d'ATP consommé → **plus d'adénosine** produite → adénosine **vasoconstricte l'AA** → ↓ Pcap → correction de la filtration", kind: 'a_retenir' },
              { concept: 'Sens 2 (pression trop basse)', detail_md: "PA ↓ → Pcap ↓ → filtration ↓ → moins d'ions filtrés → moins réabsorbés par la macula densa → moins d'ATP consommé → moins d'adénosine → AA plutôt dilatée → correction", kind: 'normal' },
              { concept: '⚠ Piège TGF', detail_md: "Le TGF joue sur les résistances de l'artériole **AFFÉRENTE** (pas efférente !)\nLe médiateur est l'**adénosine** (pas l'angiotensine II)", kind: 'piege' },
            ],
          },
          {
            titre: 'Système rénine-angiotensine intrarénal (SRA)',
            rows: [
              { concept: '◆ Cascade du SRA', detail_md: "**Angiotensinogène** (foie) → [Rénine] → **Angiotensine I** (étape LIMITANTE)\n→ [ECA] → **Angiotensine II**\nECA = enzyme de conversion de l'angiotensine (endothélium capillaire glomérulaire, pas limitante)", kind: 'a_retenir' },
              { concept: '◆ 3 stimulus de libération de rénine', detail_md: "1. **Diminution de la pression** dans l'artériole afférente (barorécepteurs intra-rénaux)\n2. **Diminution du débit de Na⁺/Cl⁻** perçu par la macula densa\n3. **Stimulation sympathique bêta** (β₁)", kind: 'a_retenir' },
              { concept: '⚠ Piège rénine et pression', detail_md: "La rénine est libérée quand la **pression DIMINUE** dans l'AA (pas quand elle augmente !)\nUne augmentation de pression dans l'AA **inhibe** la libération de rénine", kind: 'piege' },
              { concept: '◆ Action de l\'angiotensine II', detail_md: "· **Puissant vasoconstricteur** : vaisseaux rénaux très sensibles (concentration seuil 10⁻¹² M)\n· À **faible concentration** → action locale seulement (pas d'effet périphérique)\n· Vasoconstriction prédominante sur l'**artériole EFFÉRENTE**", kind: 'a_retenir' },
              { concept: '◆ Protection de l\'artériole afférente', detail_md: "L'artériole afférente est protégée de la vasoconstriction par l'AGII grâce à :\n· **PGI₂ (prostacycline)** : vasodilatatrice, produite localement sous l'effet de l'AGII\n· **NO (monoxyde d'azote)** : vasodilatateur, libéré par les cellules endothéliales de l'AA en réponse à l'AGII", kind: 'a_retenir' },
              { concept: '⚠ AINS et insuffisance rénale', detail_md: "**AINS** (ibuprofène, indométacine) inhibent la **cyclo-oxygénase** → inhibent PGI₂ → l'AA n'est plus protégée → vasoconstriction de l'AA → **INSUFFISANCE RÉNALE FONCTIONNELLE**\nParticulièrement dangereux chez les sujets âgés mal perfusés", kind: 'piege' },
              { concept: 'Action sur les cellules mésangiales', detail_md: "L'AGII agit aussi sur les cellules mésangiales → **contraction** → ↓ Kf (surface de filtration)", kind: 'normal' },
              { concept: '◆ Effet global du SRA', detail_md: "· **Maintient le DFG** (vasoconstriction AE → ↑ Pcap)\n· **Diminue un peu le DSR** (vasoconstriction globale)\n· **Fraction filtrée augmente** (normalement 20% = 120/600, elle augmente car DFG maintenu mais DSR diminué)", kind: 'a_retenir' },
              { concept: 'Autres autacoïdes', detail_md: "· **Système kinine-kallicréine** : bradykinine vasodilatatrice\n· **NO** : vasodilatateur, protège l'AA de la vasoconstriction", kind: 'normal' },
            ],
          },
          {
            titre: 'Régulation extrinsèque : système sympathique',
            rows: [
              { concept: '◆ Innervation rénale', detail_md: "Le rein est innervé **UNIQUEMENT** par le système nerveux **sympathique** (noradrénaline)\nPas d'innervation parasympathique rénale", kind: 'a_retenir' },
              { concept: '◆ Effets sympathiques', detail_md: "· **Effet indirect β₁** : libération de rénine par les cellules juxtaglomérulaires → activation du SRA\n· **Effet direct α₁** : vasoconstriction des 2 artérioles (AA + AE)\nL'effet α₁ est mis en jeu lors d'une **TRÈS FORTE** diminution de PA (état de choc) pour prioriser cerveau et cœur", kind: 'a_retenir' },
            ],
          },
          {
            titre: 'Régulation extrinsèque : ANF',
            rows: [
              { concept: '◆ ANF (Facteur atrial natriurétique)', detail_md: "Peptide de **28 acides aminés**, libéré par les myocytes auriculaires quand ils sont distendus (**hypervolémie**)", kind: 'a_retenir' },
              { concept: '◆ Actions de l\'ANF', detail_md: "· **Vasodilatation** de l'artériole afférente\n· **Vasoconstriction** de l'artériole efférente\n· **↑ Kf** (surface de filtration)\n· **Inhibition** de la libération de rénine\n→ Favorise la filtration → **natriurèse** (élimination de Na⁺ et d'eau)", kind: 'a_retenir' },
              { concept: '⚠ ANF et rénine', detail_md: "L'ANF et la rénine ne sont **pas censés cohabiter** :\n· ANF = libéré en hypervolémie → favorise la natriurèse\n· Rénine = libérée en hypovolémie → rétention hydrosodée\nCe sont des systèmes antagonistes", kind: 'piege' },
            ],
          },
        ],
      },
      {
        numero: 'VI',
        titre: 'Physiopathologie : sténose de l\'artère rénale',
        sous_parties: [
          {
            titre: 'Mécanisme et conséquences',
            rows: [
              { concept: '◆ Mécanisme initial', detail_md: "**Plaque d'athérome** sur l'artère rénale → ↓ pression de perfusion du rein → ↓ pression dans l'artériole afférente\nComme la sténose est permanente → le **SRA est activé en permanence** pour préserver le DFG", kind: 'a_retenir' },
              { concept: '◆ Conséquences systémiques', detail_md: "· Haute concentration de **rénine** dans la circulation générale\n· AGII en excès → circulation générale → **vasoconstriction périphérique** → ↑ résistances\n· SRA → **aldostérone** (surrénale) → ↑ réabsorption rénale de sels → **hypervolémie**\n· Résultat : **HTA réno-vasculaire** (cause d'HTA secondaire)", kind: 'a_retenir' },
              { concept: '◆ Sémiologie', detail_md: "Toujours **examiner les vaisseaux rénaux** devant une HTA (souffle abdominal, écho-doppler)\nLa sténose de l'artère rénale est une cause classique d'HTA secondaire curable", kind: 'a_retenir' },
              { concept: '⚠ Hyperaldostéronisme secondaire', detail_md: "Il s'agit d'un hyperaldostéronisme **SECONDAIRE** (dû à l'excès de rénine/AGII) et non primaire\nL'hyperaldostéronisme primaire (syndrome de Conn) est dû à une tumeur surrénalienne", kind: 'piege' },
            ],
          },
        ],
      },
    ],
    points_cles: [
      "Le DSR représente **20% du débit cardiaque** (1200 mL/min) pour permettre la filtration glomérulaire, pas pour les besoins métaboliques du rein",
      "La filtration glomérulaire : ~**20% du DPR** (120 mL/min = 180 L/jour) traverse la MBG → urine primitive (ultrafiltrat)",
      "La MBG est un double filtre : **mécanique** (taille > 60 kDa retenues) et **électrique** (charge négative)",
      "PUF = (Pcap - Pbow) - πplasm = (45 - 10) - 20 = **15 mmHg** ; la PUF diminue le long du capillaire car πplasm augmente",
      "ΔP hydrostatique (35 mmHg) **constant** le long du capillaire ; c'est πplasm qui **augmente** → la PUF diminue",
      "Autorégulation : DSR et DFG stables pour PA **80-140 mmHg** grâce au mécanisme myogénique (AA) et au TGF (adénosine, AA)",
      "SRA intrarénal : rénine → AGII → vasoconstriction prédominante sur l'**AE** ; l'AA est protégée par PGI₂ et NO",
      "AINS → inhibent PGI₂ → AA non protégée → vasoconstriction AA → **insuffisance rénale fonctionnelle**",
      "ANF : vasodilatation AA + vasoconstriction AE + ↑ Kf + inhibition rénine → **favorise la filtration et la natriurèse**",
      "Sténose artère rénale → SRA activé en permanence → AGII en excès → **HTA réno-vasculaire** (hyperaldostéronisme secondaire)",
    ],
    chiffres_cles: {
      titre: 'Chiffres clés — Filtration glomérulaire',
      markdown: "| Paramètre | Valeur |\n|---|---|\n| DSR | **20% du DC = 1200 mL/min** |\n| DPR | **600 mL/min** |\n| DFG | **120 mL/min = 180 L/jour** |\n| Fraction filtrée | **20% du DPR** |\n| Hématocrite | **~50%** |\n| Répartition DSR cortex/médullaire | **90% / 10%** |\n| Pcap glomérulaire | **45 mmHg** |\n| πplasm | **20 mmHg** |\n| Pbow | **10 mmHg** |\n| πbow | **0 mmHg** |\n| ΔP hydrostatique (Pcap - Pbow) | **35 mmHg** |\n| Pression d'ultrafiltration (PUF) | **15 mmHg** |\n| Plage d'autorégulation | **PA 80-140 mmHg** |\n| Néphrons par rein | **~1 million** |\n| O₂ consommé par le rein | **10-15%** du DSR |",
    },
  },
  flashcards: [
    // ===== I. FONCTIONS DU REIN =====
    { recto: "Quelle est la fonction principale du rein en termes de régulation ?", verso: "Régulation du <b>volume et de la composition</b> du compartiment extracellulaire = <b>homéostasie du milieu intérieur</b>", order_index: 1 },
    { recto: "Avec quel autre appareil le rein assure-t-il l'équilibre acido-basique ?", verso: "L'<b>appareil respiratoire</b>", order_index: 2 },
    { recto: "Qu'est-ce que la fonction d'émonctoire du rein ?", verso: "Excrétion des déchets du métabolisme :\n· <b>Urée</b> = déchets protéiques\n· <b>Acide urique</b> = déchets nucléiques\n· <b>Créatinine</b> = déchet métabolique musculaire", order_index: 3 },
    { recto: "Quelles sont les 3 hormones produites par le rein ?", verso: "· <b>Rénine</b> : contrôle de la PA\n· <b>Érythropoïétine (EPO)</b> : production des GR\n· <b>Calcitriol</b> : forme active de la vitamine D", order_index: 4 },
    { recto: "Quelles cellules produisent l'EPO et dans quelles conditions ?", verso: "Les <b>fibroblastes du tubule rénal</b>, sécrétée en réponse à l'<b>hypoxie</b>", order_index: 5 },
    { recto: "Qu'est-ce que le calcitriol ?", verso: "La <b>forme active de la vitamine D</b> (1,25-dihydroxyvitamine D₃), produite par le rein", order_index: 6 },

    // ===== II. STRUCTURE DU REIN =====
    { recto: "Quelle est la différence entre le cortex et la médullaire rénale ?", verso: "· <b>Cortex</b> = partie périphérique contenant les <b>glomérules</b>\n· <b>Médullaire</b> = partie interne où plongent les <b>tubules</b>", order_index: 7 },
    { recto: "Que sont les colonnes de Bertin ?", verso: "Le <b>tissu conjonctif</b> situé entre les lobules rénaux", order_index: 8 },
    { recto: "Quel est le trajet de l'urine après sa formation ?", verso: "Néphron → papilles → <b>calices</b> → <b>bassinet</b> → <b>uretère</b>", order_index: 9 },
    { recto: "Combien de néphrons contient chaque rein ?", verso: "Environ <b>1 million</b> de néphrons par rein", order_index: 10 },
    { recto: "Qu'est-ce que le néphron ?", verso: "L'<b>unité fonctionnelle</b> du rein, composée du glomérule et du tubule rénal", order_index: 11 },
    { recto: "Où est TOUJOURS situé le glomérule ?", verso: "Dans le <b>cortex</b>\nMême pour les néphrons profonds (juxtamédullaires), le glomérule reste dans le cortex", order_index: 12 },
    { recto: "Décrire le trajet complet du tubule rénal", verso: "<b>Tube contourné proximal</b> (cortex) → tube droit proximal (médullaire) → <b>anse de Henlé</b> (branche descendante fine → branche ascendante fine → branche ascendante large) → <b>tube contourné distal</b> (macula densa) → canal connecteur → <b>canal collecteur</b>", order_index: 13 },
    { recto: "Quels sont les 2 types de néphrons ?", verso: "· <b>Néphrons superficiels</b> : anse courte, médullaire externe\n· <b>Néphrons profonds</b> (juxtamédullaires) : anse longue, médullaire interne → contribuent à la concentration/dilution de l'urine", order_index: 14 },
    { recto: "Comment le sang arrive-t-il et repart-il du glomérule ?", verso: "Arrive par l'<b>artériole afférente</b> (issue de l'artère arquée)\nTraverse le <b>capillaire glomérulaire (flocculus)</b>\nRepart par l'<b>artériole efférente</b>", order_index: 15 },
    { recto: "Qu'est-ce que la capsule de Bowman ?", verso: "L'<b>espace urinaire</b> délimité par des cellules épithéliales, qui entoure le capillaire glomérulaire\nS'ouvre sur le <b>tube contourné proximal</b>", order_index: 16 },
    { recto: "Que sont les podocytes ?", verso: "Cellules épithéliales qui recouvrent le capillaire glomérulaire côté urinaire\nIls possèdent des <b>pédicelles</b> qui constituent la dernière couche du filtre glomérulaire", order_index: 17 },
    { recto: "Décrire les couches de la membrane basale glomérulaire (MBG) de la lumière vers l'espace urinaire", verso: "1. <b>Cellule endothéliale fenêtrée</b>\n2. <b>Membrane basale</b>\n3. <b>Pédicelles des podocytes</b>\n→ Espace urinaire", order_index: 18 },
    { recto: "Quel est le rôle des cellules mésangiales ?", verso: "Cellules conjonctives <b>contractiles</b> pouvant <b>réduire la zone d'échange</b> (surface de filtration)\nModifient le <b>Kf</b> sous l'influence de l'angiotensine II", order_index: 19 },
    { recto: "Qu'est-ce que la macula densa ?", verso: "Cellules <b>sombres</b> du <b>tube contourné distal</b> situées au contact des 2 artérioles (afférente et efférente)\nDétectent le débit de Na⁺/Cl⁻ dans le filtrat", order_index: 20 },
    { recto: "Où se trouvent les cellules juxtaglomérulaires productrices de rénine ?", verso: "Dans la paroi de l'<b>artériole AFFÉRENTE uniquement</b>\nCe sont des cellules <b>myoépithéliales</b>", order_index: 21 },
    { recto: "Quelles sont les 2 fonctions des cellules juxtaglomérulaires ?", verso: "· Production et sécrétion de la <b>rénine</b>\n· Rôle de <b>barorécepteurs intra-rénaux</b> (sensibles aux variations de pression dans l'AA)", order_index: 22 },
    { recto: "L'artériole efférente contient-elle des cellules myoépithéliales ?", verso: "<b>Non !</b> L'artériole efférente contient des cellules musculaires lisses mais <b>PAS de cellules myoépithéliales</b>\nLes cellules productrices de rénine sont dans l'AA uniquement", order_index: 23 },
    { recto: "Décrire le trajet vasculaire rénal complet", verso: "Artère arquée → <b>artériole afférente</b> → capillaire glomérulaire (1er réseau) → <b>artériole efférente</b> → capillaire péritubulaire (2e réseau) → veine", order_index: 24 },
    { recto: "Pourquoi parle-t-on de système porte artériel au niveau rénal ?", verso: "Car il existe <b>2 réseaux capillaires en série</b> :\n· Capillaire glomérulaire (1er réseau)\n· Capillaire péritubulaire (2e réseau)\nSéparés par l'artériole efférente", order_index: 25 },
    { recto: "Que sont les vasa recta ?", verso: "<b>Vaisseaux droits</b> issus de l'artériole efférente des néphrons profonds\nIls longent l'anse de Henlé et participent au mécanisme de concentration/dilution de l'urine", order_index: 26 },
    { recto: "Quelle est la répartition du flux sanguin rénal entre cortex et médullaire ?", verso: "<b>90%</b> du sang irrigue le cortex\n<b>10%</b> irrigue la médullaire", order_index: 27 },

    // ===== III. DSR ET DPR =====
    { recto: "Quelle est la valeur du DSR et sa part du débit cardiaque ?", verso: "<b>DSR = 20% du débit cardiaque = 1200 mL/min</b>", order_index: 28 },
    { recto: "Quelle est la valeur du DPR et comment la calcule-t-on ?", verso: "<b>DPR = DSR × (1 - hématocrite)</b>\n= 1200 × (1 - 0,50) = <b>600 mL/min</b>", order_index: 29 },
    { recto: "Pourquoi le DSR est-il si élevé ?", verso: "Le DSR élevé n'est <b>PAS</b> destiné à couvrir les besoins métaboliques du rein (seuls 10-15% de l'O₂ consommé)\nIl est élevé pour <b>assurer la filtration glomérulaire</b>", order_index: 30 },
    { recto: "Quels sont les 2 déterminants du DSR ?", verso: "· La <b>pression artérielle de perfusion</b>\n· Les <b>résistances vasculaires rénales</b> (artérioles afférente et efférente)", order_index: 31 },
    { recto: "Quelle est la pression dans les capillaires glomérulaires ?", verso: "<b>40-60 mmHg</b>\nC'est une pression élevée pour un capillaire\nElle reste <b>constante</b> le long du capillaire (pas de résistance significative)", order_index: 32 },
    { recto: "Où se situent les résistances vasculaires rénales ?", verso: "Au niveau des <b>artérioles afférentes et efférentes</b>\nLes capillaires glomérulaires eux-mêmes n'opposent pas de résistance significative", order_index: 33 },
    { recto: "Quel pourcentage de l'O₂ apporté le rein consomme-t-il ?", verso: "Seulement <b>10-15%</b> de l'O₂ apporté\nConfirmant que le DSR élevé sert à la filtration, pas au métabolisme", order_index: 34 },

    // ===== IV. FILTRATION GLOMÉRULAIRE =====
    { recto: "Quelle fraction du DPR est filtrée au niveau glomérulaire ?", verso: "<b>1/5 (20%)</b> du DPR traverse la MBG = fraction filtrée", order_index: 35 },
    { recto: "Quelle est la valeur du DFG ?", verso: "<b>DFG = 120 mL/min = 180 L/jour</b>\nMais l'essentiel est réabsorbé par les tubules", order_index: 36 },
    { recto: "Quels sont les débits dans l'artériole afférente, le filtrat et l'artériole efférente ?", verso: "· DPR entrant (AA) = <b>600 mL/min</b>\n· DFG = <b>120 mL/min</b>\n· DPR sortant (AE) = <b>480 mL/min</b>", order_index: 37 },
    { recto: "Quelle est la composition de l'ultrafiltrat glomérulaire ?", verso: "Composition <b>identique au plasma</b> pour les petites molécules (urée, glucose, ions)\nLes <b>protéines > 60 kDa</b> sont retenues (albumine, etc.)", order_index: 38 },
    { recto: "Quels sont les 2 types de filtres de la MBG ?", verso: "· <b>Filtre mécanique</b> : retient les grosses molécules (> 60 kDa)\n· <b>Filtre électrique</b> : chargée <b>négativement</b> → repousse les molécules anioniques", order_index: 39 },
    { recto: "Qu'a montré l'expérience du dextran sur la filtration glomérulaire ?", verso: "· Dextran à charge <b>positive</b> → filtration <b>augmentée</b>\n· Dextran à charge <b>négative</b> → filtration <b>diminuée</b>\n· Plus la <b>taille</b> est grande → moins filtré", order_index: 40 },
    { recto: "Comment évolue la concentration de glucose entre l'artériole afférente et efférente ?", verso: "La concentration reste <b>identique</b> (5 mmol/L)\nCar autant de glucose que d'eau sort du capillaire → la concentration ne change pas", order_index: 41 },
    { recto: "Comment évolue la concentration des protéines entre AA et AE ?", verso: "La concentration <b>augmente</b>\nLes protéines sont retenues (même quantité) mais l'eau est perdue → les protéines se concentrent\n→ La <b>pression oncotique augmente</b>", order_index: 42 },
    { recto: "Quelle est la formule du DFG selon les forces de Starling ?", verso: "<b>DFG = Kf × PUF</b>\nKf = surface de filtration × perméabilité hydraulique\nPUF = pression d'ultrafiltration", order_index: 43 },
    { recto: "Quelles sont les 4 pressions de Starling au niveau glomérulaire et leurs valeurs ?", verso: "· <b>Pcap</b> = 45 mmHg (→ favorise filtration)\n· <b>πplasm</b> = 20 mmHg (→ s'oppose)\n· <b>Pbow</b> = 10 mmHg (→ s'oppose)\n· <b>πbow</b> = 0 mmHg (pas de protéines dans Bowman)", order_index: 44 },
    { recto: "Calculer la pression d'ultrafiltration (PUF)", verso: "<b>PUF = (Pcap - Pbow) - (πplasm - πbow)</b>\n= (45 - 10) - (20 - 0)\n= 35 - 20 = <b>15 mmHg</b>", order_index: 45 },
    { recto: "Quelle est la valeur du ΔP hydrostatique glomérulaire ?", verso: "<b>ΔP = Pcap - Pbow = 45 - 10 = 35 mmHg</b>\nCe ΔP reste <b>constant</b> le long du capillaire glomérulaire", order_index: 46 },
    { recto: "La pression d'ultrafiltration est-elle constante le long du capillaire glomérulaire ?", verso: "<b>Non !</b> La PUF <b>diminue</b> progressivement car :\n· ΔP hydrostatique reste constant (35 mmHg)\n· Mais <b>πplasm augmente</b> (eau perdue → protéines concentrées)\n→ La PUF diminue le long du capillaire", order_index: 47 },
    { recto: "À quel moment la filtration glomérulaire s'arrête-t-elle ?", verso: "Quand <b>πplasm = ΔP hydrostatique</b> (35 mmHg)\nÀ ce point, PUF = 0 → la filtration cesse\nL'équilibre peut être atteint avant la fin du capillaire", order_index: 48 },
    { recto: "Pourquoi la Pcap glomérulaire est-elle haute et stable ?", verso: "Grâce aux <b>résistances vasculaires</b>, notamment l'<b>artériole efférente contractée</b>\nLe sang est « retenu » dans le capillaire glomérulaire", order_index: 49 },
    { recto: "Quelle pression de Starling <b>favorise</b> la filtration glomérulaire ?", verso: "La <b>Pcap</b> (pression hydrostatique capillaire glomérulaire) = 45 mmHg\nElle pousse l'eau du capillaire vers l'espace de Bowman", order_index: 50 },
    { recto: "Quelles pressions <b>s'opposent</b> à la filtration glomérulaire ?", verso: "· <b>πplasm</b> = 20 mmHg (pression oncotique → retient l'eau)\n· <b>Pbow</b> = 10 mmHg (pression hydrostatique de Bowman → repousse l'eau)", order_index: 51 },
    { recto: "La filtration glomérulaire est-elle un processus actif ou passif ?", verso: "Un processus <b>purement passif</b>\nElle dépend uniquement des forces de Starling (gradients de pression), sans consommation d'énergie", order_index: 52 },

    // ===== V. RÉGULATION DU DSR ET DFG =====
    { recto: "Quel est le lien entre DSR et DFG ?", verso: "Le DFG <b>dépend du DSR</b>\nUne diminution du DFG → <b>insuffisance rénale</b>\nLa circulation rénale protège le DFG contre les variations de PA systémique", order_index: 53 },
    { recto: "Comment la balance des résistances AA/AE influence-t-elle la filtration ?", verso: "· ↓ Raa + ↑ Rae → Pcap maintenue → <b>favorise</b> filtration\n· ↑ Raa + ↓ Rae → Pcap chute → filtration <b>diminue</b>\n· ↑ Rae seule → filtration <b>augmente</b>\n· ↑ Raa seule → filtration <b>chute</b>", order_index: 54 },
    { recto: "L'augmentation de la résistance de l'AE seule augmente-t-elle ou diminue-t-elle la filtration ?", verso: "Elle <b>augmente</b> la filtration\nCar l'AE contractée retient le sang dans le capillaire glomérulaire → ↑ Pcap", order_index: 55 },
    { recto: "Que se passe-t-il en cas de chute de pression importante (état de choc) ?", verso: "↓ DSR → ↓ DFG → <b>insuffisance rénale fonctionnelle</b>\nLes mécanismes d'autorégulation sont dépassés", order_index: 56 },
    { recto: "Que provoque une HTA chronique sur le rein ?", verso: "<b>Néphro-angiosclérose</b> → glomérulosclérose → <b>IRC</b> (insuffisance rénale chronique)", order_index: 57 },
    { recto: "Quels sont les 2 mécanismes de régulation intrinsèque ?", verso: "1. <b>Autorégulation rénale</b> : mécanisme myogénique + rétrocontrôle tubuloglomérulaire (TGF)\n2. <b>Substances autacoïdes</b> : SRA intrarénal, NO, système kinine-kallicréine", order_index: 58 },
    { recto: "Quels sont les 2 mécanismes de régulation extrinsèque ?", verso: "1. <b>Système nerveux sympathique</b> (noradrénaline)\n2. <b>ANF</b> (facteur atrial natriurétique)", order_index: 59 },
    { recto: "Pour quelle plage de PA le DSR et le DFG sont-ils stables (autorégulation) ?", verso: "Pour une PA moyenne entre <b>80 et 140 mmHg</b>\nEn dessous (état de choc) → IR aiguë hémodynamique", order_index: 60 },
    { recto: "Comment fonctionne le mécanisme myogénique ?", verso: "PA ↑ → pression AA ↑ → <b>distension</b> des CML de l'AA → flux Ca²⁺ (canaux voltage-dépendants) → <b>contraction</b> des CML → <b>vasoconstriction</b> de l'AA → ↓ Pcap → correction du DFG", order_index: 61 },
    { recto: "Le mécanisme myogénique agit-il sur l'artériole afférente ou efférente ?", verso: "Sur l'<b>artériole afférente</b> uniquement\nIl provoque une <b>vasoconstriction</b> (pas une vasodilatation)", order_index: 62 },
    { recto: "Le mécanisme myogénique est-il mis en jeu en cas d'augmentation ou de diminution de pression ?", verso: "En cas d'<b>augmentation</b> de pression dans l'AA\nIl induit une vasoconstriction réflexe pour protéger le glomérule", order_index: 63 },
    { recto: "Sur quelle artériole agit le rétrocontrôle tubuloglomérulaire (TGF) ?", verso: "Sur l'<b>artériole AFFÉRENTE</b> (pas l'efférente !)\nIl fonctionne dans les 2 sens (pression trop haute ou trop basse)", order_index: 64 },
    { recto: "Quel est le médiateur du rétrocontrôle tubuloglomérulaire ?", verso: "L'<b>adénosine</b>, produite par les cellules de la <b>macula densa</b>", order_index: 65 },
    { recto: "Décrire le TGF quand la pression est trop haute (sens 1)", verso: "PA ↑ → filtration ↑ → plus de filtrat → macula densa réabsorbe plus de Na⁺/Cl⁻ → plus d'ATP consommé → plus d'<b>adénosine</b> → <b>vasoconstriction de l'AA</b> → ↓ Pcap → correction", order_index: 66 },
    { recto: "Décrire le TGF quand la pression est trop basse (sens 2)", verso: "PA ↓ → filtration ↓ → moins d'ions filtrés → moins réabsorbés par la macula densa → moins d'ATP → moins d'<b>adénosine</b> → AA plutôt <b>dilatée</b> → correction", order_index: 67 },
    { recto: "Décrire la cascade du système rénine-angiotensine (SRA)", verso: "<b>Angiotensinogène</b> (foie) →[Rénine]→ <b>Angiotensine I</b> (étape LIMITANTE)\n→[ECA]→ <b>Angiotensine II</b>\nECA = enzyme de conversion (endothélium capillaire glomérulaire)", order_index: 68 },
    { recto: "Quels sont les 3 stimulus de libération de la rénine ?", verso: "1. <b>↓ pression</b> dans l'artériole afférente (barorécepteurs)\n2. <b>↓ débit Na⁺/Cl⁻</b> perçu par la macula densa\n3. <b>Stimulation sympathique β₁</b>", order_index: 69 },
    { recto: "Quelle est l'étape limitante du SRA ?", verso: "La conversion de l'angiotensinogène en angiotensine I par la <b>rénine</b>\nL'ECA (enzyme de conversion) n'est pas l'étape limitante", order_index: 70 },
    { recto: "Sur quelle artériole l'angiotensine II exerce-t-elle une vasoconstriction prédominante ?", verso: "Sur l'<b>artériole EFFÉRENTE</b>\nL'artériole afférente est protégée par les PGI₂ et le NO", order_index: 71 },
    { recto: "Quels sont les 2 mécanismes protégeant l'artériole afférente de la vasoconstriction par l'AGII ?", verso: "· <b>PGI₂ (prostacycline)</b> : vasodilatatrice, produite localement sous l'effet de l'AGII\n· <b>NO</b> : vasodilatateur, libéré par les cellules endothéliales de l'AA en réponse à l'AGII", order_index: 72 },
    { recto: "Pourquoi les AINS peuvent-ils provoquer une insuffisance rénale fonctionnelle ?", verso: "Les <b>AINS</b> inhibent la <b>cyclo-oxygénase</b> → inhibent la <b>PGI₂</b> → l'AA n'est plus protégée → <b>vasoconstriction de l'AA</b> → ↓ Pcap → ↓ DFG\nDangereux chez les sujets âgés mal perfusés", order_index: 73 },
    { recto: "Citer 2 AINS responsables d'insuffisance rénale fonctionnelle", verso: "· <b>Ibuprofène</b>\n· <b>Indométacine</b>\nIls inhibent la cyclo-oxygénase → inhibent la PGI₂ protectrice de l'AA", order_index: 74 },
    { recto: "Quel est l'effet de l'AGII sur les cellules mésangiales ?", verso: "<b>Contraction</b> des cellules mésangiales → ↓ <b>Kf</b> (surface de filtration)\nTend à diminuer le DFG", order_index: 75 },
    { recto: "Quel est l'effet global du SRA intrarénal sur la filtration ?", verso: "· <b>Maintient le DFG</b> (vasoconstriction AE → ↑ Pcap)\n· <b>Diminue un peu le DSR</b> (vasoconstriction)\n· La <b>fraction filtrée augmente</b> (normalement 20%)", order_index: 76 },
    { recto: "Comment varie la fraction filtrée lors de la stimulation du SRA ?", verso: "La fraction filtrée <b>augmente</b>\nCar la vasoconstriction de l'AE maintient le DFG tandis que le DSR diminue\nFF = DFG/DPR → si DFG stable et DPR ↓ → FF ↑", order_index: 77 },
    { recto: "Qu'est-ce que la bradykinine et quel est son effet rénal ?", verso: "Peptide du <b>système kinine-kallicréine</b>\nEffet <b>vasodilatateur</b> au niveau rénal", order_index: 78 },
    { recto: "Par quel type de système nerveux le rein est-il innervé ?", verso: "Le rein est innervé <b>UNIQUEMENT</b> par le système nerveux <b>sympathique</b> (noradrénaline)\nPas d'innervation parasympathique", order_index: 79 },
    { recto: "Quels sont les 2 effets du sympathique sur le rein ?", verso: "· <b>Effet indirect β₁</b> : libération de rénine → activation du SRA\n· <b>Effet direct α₁</b> : vasoconstriction des 2 artérioles (AA + AE)", order_index: 80 },
    { recto: "Dans quelle situation l'effet α₁ sympathique sur le rein est-il mis en jeu ?", verso: "Lors d'une <b>TRÈS FORTE diminution de PA</b> (état de choc)\nPour prioriser le <b>cerveau et le cœur</b> au détriment de la perfusion rénale", order_index: 81 },
    { recto: "Qu'est-ce que l'ANF et quand est-il libéré ?", verso: "<b>Facteur atrial natriurétique</b> = peptide de 28 acides aminés\nLibéré par les <b>myocytes auriculaires</b> quand ils sont distendus (<b>hypervolémie</b>)", order_index: 82 },
    { recto: "Quelles sont les 4 actions de l'ANF sur le rein ?", verso: "· <b>Vasodilatation</b> de l'artériole afférente\n· <b>Vasoconstriction</b> de l'artériole efférente\n· <b>↑ Kf</b> (surface de filtration)\n· <b>Inhibition</b> de la libération de rénine", order_index: 83 },
    { recto: "Quel est l'effet global de l'ANF ?", verso: "<b>Favorise la filtration</b> → <b>natriurèse</b> (élimination de Na⁺ et d'eau)\n→ Corrige l'hypervolémie qui a déclenché sa sécrétion", order_index: 84 },
    { recto: "L'ANF stimule-t-il ou inhibe-t-il la libération de rénine ?", verso: "L'ANF <b>inhibe</b> la libération de rénine\nANF et rénine sont des systèmes <b>antagonistes</b> :\n· ANF = hypervolémie → natriurèse\n· Rénine = hypovolémie → rétention", order_index: 85 },
    { recto: "L'ANF augmente-t-il ou diminue-t-il le DFG ?", verso: "L'ANF <b>augmente</b> le DFG\nPar vasodilatation AA + vasoconstriction AE + ↑ Kf → favorise la filtration", order_index: 86 },
    { recto: "L'ANF augmente-t-il ou diminue-t-il la natriurèse ?", verso: "L'ANF <b>augmente</b> la natriurèse\n→ Élimination de Na⁺ et d'eau → corrige l'hypervolémie", order_index: 87 },

    // ===== VI. PHYSIOPATHOLOGIE =====
    { recto: "Quel est le mécanisme de l'HTA réno-vasculaire ?", verso: "Plaque d'athérome sur l'artère rénale → ↓ pression de perfusion → <b>SRA activé en permanence</b>\n→ AGII en excès → vasoconstriction périphérique + aldostérone → hypervolémie\n= <b>HTA réno-vasculaire</b>", order_index: 88 },
    { recto: "Pourquoi le SRA est-il activé en permanence dans la sténose de l'artère rénale ?", verso: "Car la sténose est <b>permanente</b> → la pression dans l'AA reste basse en continu\n→ Le SRA est activé pour préserver le DFG mais ne peut pas corriger la cause", order_index: 89 },
    { recto: "Quelles sont les conséquences systémiques de l'activation permanente du SRA ?", verso: "· <b>Rénine</b> en excès dans la circulation\n· <b>AGII</b> en excès → vasoconstriction périphérique → ↑ résistances\n· <b>Aldostérone</b> → réabsorption sels → hypervolémie\n= <b>HTA secondaire</b>", order_index: 90 },
    { recto: "La sténose de l'artère rénale provoque un hyperaldostéronisme primaire ou secondaire ?", verso: "<b>Secondaire</b>\nCar il est dû à l'excès de rénine/AGII (cause extra-surrénalienne)\nL'hyperaldostéronisme primaire (Conn) = tumeur surrénalienne", order_index: 91 },
    { recto: "Que doit-on systématiquement rechercher devant une HTA ?", verso: "Toujours <b>examiner les vaisseaux rénaux</b> (souffle abdominal, écho-doppler)\nLa sténose de l'artère rénale est une cause classique d'<b>HTA secondaire curable</b>", order_index: 92 },

    // ===== QUESTIONS DE SYNTHÈSE ET ANNALES =====
    { recto: "VRAI ou FAUX : le DFG peut excéder le DPR", verso: "<b>FAUX</b>\nLe DFG ne peut en aucun cas excéder le DPR car le filtrat provient du plasma\nDFG = 120 mL/min < DPR = 600 mL/min", order_index: 93 },
    { recto: "Un DFG de 10 mL/min est-il suffisant pour l'épuration rénale ?", verso: "<b>Non</b>, un DFG de 10 mL/min est <b>insuffisant</b> pour permettre les fonctions d'épuration du rein\nDFG normal = 100-120 mL/min", order_index: 94 },
    { recto: "Le DFG représente-t-il 20% du DSR ou 20% du DPR ?", verso: "<b>20% du DPR</b> (pas du DSR !)\nDFG = 120 mL/min = 20% de 600 mL/min (DPR)\nLe DSR inclut les globules rouges qui ne sont pas filtrés", order_index: 95 },
    { recto: "Le DFG diminue-t-il avec l'âge ?", verso: "<b>Oui</b>, le DFG diminue avec l'âge\nPerte progressive de néphrons fonctionnels", order_index: 96 },
    { recto: "Qu'est-ce que la balance glomérulotubulaire ?", verso: "Mécanisme qui <b>adapte la réabsorption proximale</b> de Na⁺ et d'eau <b>au DFG</b>\nSi le DFG augmente → la réabsorption proximale augmente proportionnellement", order_index: 97 },
    { recto: "Qu'est-ce que la fraction filtrée et quelle est sa valeur normale ?", verso: "<b>FF = DFG / DPR = 120/600 = 20%</b>\nElle augmente quand le SRA est activé (vasoconstriction AE)", order_index: 98 },
    { recto: "La vasoconstriction de l'artériole efférente favorise-t-elle ou défavorise-t-elle la filtration ?", verso: "Elle <b>favorise</b> la filtration\nCar elle augmente la Pcap (le sang est retenu dans le capillaire glomérulaire)", order_index: 99 },
    { recto: "La vasoconstriction de l'artériole afférente favorise-t-elle ou défavorise-t-elle la filtration ?", verso: "Elle <b>défavorise</b> la filtration\nCar elle diminue la Pcap (moins de sang arrive au capillaire glomérulaire)", order_index: 100 },
    { recto: "Quelle est la méthode de référence pour mesurer le DFG ?", verso: "La <b>clairance de l'inuline</b>\nL'inuline est filtrée librement et n'est ni réabsorbée ni sécrétée", order_index: 101 },
    { recto: "L'estimation du DFG par la créatinine plasmatique est-elle aussi fiable que la mesure de la clairance ?", verso: "<b>Non</b>, l'estimation (formules MDRD, CKD-EPI) est moins fiable que la mesure directe de la clairance\nMais elle est plus pratique en clinique courante", order_index: 102 },
    { recto: "La formule MDRD est-elle plus juste que Cockroft et Gault chez le sujet âgé ?", verso: "<b>Oui</b>, la formule MDRD (et CKD-EPI) est plus juste chez les sujets âgés que la formule de Cockroft et Gault", order_index: 103 },
    { recto: "VRAI ou FAUX : chez un sujet non diabétique, le débit massique de filtration du glucose est nul", verso: "<b>FAUX</b>\nLe glucose est filtré librement (même concentration dans le filtrat et le plasma)\nLe débit massique de filtration du glucose n'est donc <b>pas nul</b>\n(Mais tout le glucose filtré est réabsorbé chez le sujet normal)", order_index: 104 },
    { recto: "La filtration s'interrompt-elle quand Pbow > πcap ?", verso: "<b>Non !</b> La filtration s'interrompt quand <b>πplasm = ΔP hydrostatique</b> (= Pcap - Pbow)\nC'est l'augmentation progressive de πplasm qui annule la PUF", order_index: 105 },
    { recto: "La sténose de l'artère rénale entraîne-t-elle une réduction ou une augmentation de la natriurèse ?", verso: "Une <b>réduction</b> de la natriurèse\nCar l'aldostérone (stimulée par le SRA) favorise la réabsorption de Na⁺", order_index: 106 },
    { recto: "La sténose de l'artère rénale provoque-t-elle une hypokaliémie ou une hyperkaliémie ?", verso: "Une <b>hypokaliémie</b>\nCar l'aldostérone en excès stimule l'excrétion de K⁺ au tube collecteur", order_index: 107 },
    { recto: "L'angiotensine II agit-elle prédominamment sur l'AA ou l'AE ?", verso: "Sur l'<b>AE (artériole efférente)</b>\nL'AA est protégée par la <b>PGI₂</b> et le <b>NO</b> produits localement en réponse à l'AGII", order_index: 108 },
    { recto: "Les cellules de la macula densa produisent-elles l'ECA ?", verso: "<b>Non !</b> Les cellules de la macula densa détectent le débit de Na⁺/Cl⁻ et produisent de l'<b>adénosine</b>\nL'ECA est produite par l'<b>endothélium capillaire</b> glomérulaire", order_index: 109 },
    { recto: "VRAI ou FAUX : une augmentation du DFG entraîne une augmentation de la réabsorption proximale de Na⁺ et d'eau", verso: "<b>VRAI</b>\nC'est le principe de la <b>balance glomérulotubulaire</b> : la réabsorption proximale s'adapte au DFG", order_index: 110 },
    { recto: "Quelle est la pression hydrostatique dans les capillaires glomérulaires par rapport aux capillaires péritubulaires ?", verso: "La pression dans les capillaires glomérulaires est <b>supérieure</b> à celle des capillaires péritubulaires\nCapillaires glomérulaires : 40-60 mmHg vs capillaires habituels", order_index: 111 },
    { recto: "Quelles propriétés doit avoir une substance pour mesurer le DFG ?", verso: "La substance doit être :\n· <b>Filtrée librement</b> par le glomérule\n· <b>Ni réabsorbée</b> ni <b>sécrétée</b> par les tubules\n→ L'<b>inuline</b> remplit ces critères (méthode de référence)", order_index: 112 },
  ],
  annales: [
    {
      titre: 'Annale 2022-2023 — Filtration glomérulaire (QCM 5)',
      annee: '2022-2023',
      rappel_cours: "La filtration glomérulaire est un processus **passif** qui dépend des forces de Starling. L'eau et les petites molécules (glucose, urée, ions) traversent la MBG librement, tandis que les protéines > 60 kDa sont retenues.\n\n**Pressions de Starling :**\n· Pcap = 45 mmHg (favorise filtration)\n· πplasm = 20 mmHg (s'oppose) — augmente le long du capillaire\n· Pbow = 10 mmHg (s'oppose)\n· πbow = 0\n\nLa PUF = 15 mmHg au début, puis **diminue** le long du capillaire car πplasm augmente (les protéines se concentrent). Le ΔP hydrostatique reste constant.\n\nLa vasoconstriction de l'**AE** favorise la filtration (↑ Pcap). Le mécanisme myogénique induit une **vasoconstriction** réflexe de l'AA en réponse à une augmentation de pression.",
      questions: [
        {
          enonce: "A propos de la filtration glomérulaire :",
          items: [
            { lettre: 'A', enonce: 'La filtration glomérulaire est un processus actif', is_correct: false },
            { lettre: 'B', enonce: "La concentration plasmatique de glucose dans l'artériole efférente du glomérule est identique à la concentration de glucose dans le filtrat glomérulaire", is_correct: true },
            { lettre: 'C', enonce: "La pression d'ultrafiltration est identique sur toute la longueur du capillaire glomérulaire", is_correct: false },
            { lettre: 'D', enonce: "La vasoconstriction de l'artériole efférente du glomérule favorise la filtration glomérulaire", is_correct: true },
            { lettre: 'E', enonce: "Une augmentation de pression sanguine dans l'artériole afférente induit une vasoconstriction réflexe de celle-ci", is_correct: true },
          ],
          correction: "**Réponse : BDE**\n\nA. **FAUX** — La filtration glomérulaire est un processus **passif**, dépendant uniquement des forces de Starling (gradients de pression).\nB. **VRAI** — Le glucose est filtré librement : sa concentration dans le filtrat est identique à celle dans le plasma. Comme autant de glucose que d'eau sort du capillaire, la concentration plasmatique ne change pas entre AA et AE, et elle est identique à celle du filtrat.\nC. **FAUX** — La PUF **diminue** le long du capillaire car la πplasm augmente (concentration des protéines au fur et à mesure que l'eau est filtrée).\nD. **VRAI** — La vasoconstriction de l'AE retient le sang dans le capillaire glomérulaire → ↑ Pcap → favorise la filtration.\nE. **VRAI** — C'est le **mécanisme myogénique** : augmentation de pression dans l'AA → distension → vasoconstriction réflexe de l'AA.",
        },
      ],
    },
    {
      titre: 'Annale 2021-2022 — Filtration glomérulaire (Question 4)',
      annee: '2021-2022',
      rappel_cours: "Le DFG normal est de **120 mL/min** (= 20% du DPR de 600 mL/min). Un DFG < 15 mL/min définit l'insuffisance rénale terminale.\n\nLe DFG ne peut jamais excéder le DPR car le filtrat provient du plasma.\n\nLa **fraction filtrée** = DFG/DPR = 20%. Elle **augmente** quand le SRA est activé (vasoconstriction de l'AE → DFG maintenu, DSR diminué).\n\nLa **balance glomérulotubulaire** adapte la réabsorption proximale de Na⁺ et d'eau au DFG : si le DFG augmente, la réabsorption proximale augmente proportionnellement.",
      questions: [
        {
          enonce: "A propos de la filtration glomérulaire :",
          items: [
            { lettre: 'A', enonce: "Il s'agit d'un phénomène purement passif", is_correct: true },
            { lettre: 'B', enonce: 'Le DFG ne peut en aucun cas excéder le DPR', is_correct: true },
            { lettre: 'C', enonce: "Un DFG de 10 mL/min est insuffisant pour permettre les fonctions d'épuration du rein", is_correct: true },
            { lettre: 'D', enonce: 'La fraction filtrée diminue en cas de stimulation du SRA intrarénal', is_correct: false },
            { lettre: 'E', enonce: "Une augmentation du DFG entraîne une augmentation de la réabsorption proximale de Na⁺ et d'eau", is_correct: true },
          ],
          correction: "**Réponse : ABCE**\n\nA. **VRAI** — La filtration glomérulaire est un phénomène purement passif, dépendant des forces de Starling.\nB. **VRAI** — Le DFG provient du plasma, il ne peut donc pas excéder le DPR.\nC. **VRAI** — Un DFG de 10 mL/min est très insuffisant (normal = 100-120 mL/min). Cela correspond à une insuffisance rénale sévère.\nD. **FAUX** — La fraction filtrée **augmente** lors de la stimulation du SRA. La vasoconstriction prédominante sur l'AE maintient le DFG tandis que le DSR diminue → FF = DFG/DPR augmente.\nE. **VRAI** — C'est le principe de la **balance glomérulotubulaire** : la réabsorption proximale s'adapte au DFG.",
        },
      ],
    },
    {
      titre: 'Annale 2021-2022 — Autorégulation du DSR (Question 13)',
      annee: '2021-2022',
      rappel_cours: "L'autorégulation du DSR fait intervenir 2 mécanismes :\n\n**1. Mécanisme myogénique :** mis en jeu en cas d'**augmentation** de pression dans l'AA → vasoconstriction réflexe de l'AA → maintient le DFG stable.\n\n**2. Rétrocontrôle tubuloglomérulaire (TGF) :** agit sur l'**artériole AFFÉRENTE** (pas efférente). Le médiateur est l'**adénosine** produite par la macula densa. Quand la pression augmente → plus de filtrat → plus de Na⁺/Cl⁻ réabsorbé par la macula densa → plus d'adénosine → vasoconstriction de l'AA.",
      questions: [
        {
          enonce: "Concernant l'autorégulation du DSR :",
          items: [
            { lettre: 'A', enonce: "Le TGF joue sur les résistances de l'artériole efférente", is_correct: false },
            { lettre: 'B', enonce: "Le TGF fait intervenir l'adénosine par les cellules de la macula", is_correct: true },
            { lettre: 'C', enonce: "Le mécanisme myogénique induit une vasodilatation de l'AA", is_correct: false },
            { lettre: 'D', enonce: "Le mécanisme myogénique est mis en jeu en cas de diminution de pression dans l'AA", is_correct: false },
            { lettre: 'E', enonce: 'Le mécanisme myogénique induit une diminution du DFG', is_correct: false },
          ],
          correction: "**Réponse : B**\n\nA. **FAUX** — Le TGF joue sur les résistances de l'artériole **AFFÉRENTE**, pas efférente.\nB. **VRAI** — Le TGF fait intervenir l'**adénosine**, produite par les cellules de la **macula densa** en réponse à la réabsorption de Na⁺/Cl⁻.\nC. **FAUX** — Le mécanisme myogénique induit une **vasoconstriction** (pas une vasodilatation) de l'AA.\nD. **FAUX** — Le mécanisme myogénique est mis en jeu en cas d'**augmentation** de pression dans l'AA (pas de diminution). La distension des CML déclenche la contraction réflexe.\nE. **FAUX** — Le mécanisme myogénique **maintient le DFG stable** ; il ne le diminue pas. La vasoconstriction de l'AA compense l'augmentation de pression pour que le DFG reste constant.",
        },
      ],
    },
    {
      titre: 'Annale 2020-2021 — Autorégulation du DSR (QCM 6)',
      annee: '2020-2021',
      rappel_cours: "L'autorégulation du DSR fait intervenir 2 mécanismes :\n\n**1. Mécanisme myogénique :** mis en jeu en cas d'**augmentation** de pression dans l'AA → vasoconstriction réflexe de l'AA. Cela a pour effet de diminuer le DFG qui était transitoirement augmenté (la vasoconstriction de l'AA réduit la Pcap).\n\n**2. Rétrocontrôle tubuloglomérulaire (TGF) :** agit sur l'**artériole AFFÉRENTE**. Le médiateur est l'**adénosine** produite par la macula densa.",
      questions: [
        {
          enonce: "Concernant l'autorégulation du DSR :",
          items: [
            { lettre: 'A', enonce: "Le TGF joue sur les résistances de l'artériole efférente", is_correct: false },
            { lettre: 'B', enonce: "Le TGF fait intervenir l'adénosine par les cellules de la macula", is_correct: true },
            { lettre: 'C', enonce: "Le mécanisme myogénique induit une vasodilatation de l'AA", is_correct: false },
            { lettre: 'D', enonce: "Le mécanisme myogénique est mis en jeu en cas de diminution de pression dans l'AA", is_correct: false },
            { lettre: 'E', enonce: 'Le mécanisme myogénique induit une diminution du DFG', is_correct: true },
          ],
          correction: "**Réponse : BE**\n\nA. **FAUX** — Le TGF joue sur les résistances de l'artériole **AFFÉRENTE**, pas efférente.\nB. **VRAI** — Le TGF fait intervenir l'**adénosine**, produite par les cellules de la **macula densa**.\nC. **FAUX** — Le mécanisme myogénique induit une **vasoconstriction** (pas une vasodilatation) de l'AA.\nD. **FAUX** — Le mécanisme myogénique est mis en jeu en cas d'**augmentation** de pression dans l'AA (pas de diminution).\nE. **VRAI** — Le mécanisme myogénique induit une vasoconstriction de l'AA → ↓ Pcap → **diminution du DFG** qui était transitoirement augmenté par la hausse de pression. C'est le mécanisme correcteur qui ramène le DFG à la normale.",
        },
      ],
    },
    {
      titre: 'Annale 2019 Session 1 — DSR (Question 25)',
      annee: '2018-2019',
      rappel_cours: "Le **DSR** = 20% du débit cardiaque = 1200 mL/min. Il est distribué en majorité dans le **cortex** (90%) et peu dans la médullaire (10%).\n\nLe DSR est relativement constant grâce à l'autorégulation pour des PA moyennes entre **80 et 140 mmHg**.\n\nLe DFG dépend du DSR : une diminution du DSR entraîne une diminution du DFG (pas une augmentation).",
      questions: [
        {
          enonce: "Concernant le DSR :",
          items: [
            { lettre: 'A', enonce: 'Le DSR est relativement constant pour une PA comprise entre 80 et 140 mmHg', is_correct: true },
            { lettre: 'B', enonce: 'Le DSR représente 80% du débit cardiaque', is_correct: false },
            { lettre: 'C', enonce: 'La majeure partie du DSR est distribuée dans la médullaire', is_correct: false },
            { lettre: 'D', enonce: "Une diminution du DSR induit une augmentation du DFG", is_correct: false },
            { lettre: 'E', enonce: 'Aucune proposition exacte', is_correct: false },
          ],
          correction: "**Réponse : A**\n\nA. **VRAI** — Grâce à l'autorégulation rénale (mécanisme myogénique + TGF), le DSR est relativement constant pour une PA moyenne entre **80 et 140 mmHg**.\nB. **FAUX** — Le DSR représente **20%** du débit cardiaque (pas 80%).\nC. **FAUX** — **90%** du DSR est distribué dans le **cortex** (pas la médullaire). Seuls 10% vont à la médullaire.\nD. **FAUX** — Une diminution du DSR entraîne une **diminution** du DFG (pas une augmentation). Le DFG dépend directement du DSR.\nE. **FAUX** — La proposition A est exacte.",
        },
      ],
    },
    {
      titre: 'Annale 2018 Session 2 — Filtration glomérulaire, SAUF UNE (QCM 4)',
      annee: '2017-2018',
      rappel_cours: "La pression hydrostatique dans les capillaires glomérulaires (45 mmHg) est **élevée et stable** (varie peu entre début et fin du capillaire).\n\nEn revanche, la **pression oncotique plasmatique augmente** le long du capillaire (l'eau est filtrée → les protéines se concentrent).\n\nLa pression dans les capillaires glomérulaires est **supérieure** à celle des capillaires péritubulaires (qui ont une pression habituelle après la chute de pression dans l'artériole efférente).\n\nLes **cellules mésangiales** sont contractiles et peuvent modifier le Kf (surface de filtration), donc modifier le DFG.\n\nLe DFG **diminue avec l'âge** (perte progressive de néphrons fonctionnels).",
      questions: [
        {
          enonce: "Concernant la filtration glomérulaire, toutes les propositions suivantes sont exactes SAUF UNE, laquelle ?",
          items: [
            { lettre: 'A', enonce: "La pression hydrostatique varie peu entre le début et la fin du capillaire glomérulaire", is_correct: true },
            { lettre: 'B', enonce: "La pression oncotique plasmatique ne varie pas entre le début et la fin du capillaire glomérulaire", is_correct: false },
            { lettre: 'C', enonce: "La pression hydrostatique dans les capillaires glomérulaires est supérieure à celle des capillaires péritubulaires", is_correct: true },
            { lettre: 'D', enonce: 'La contraction des cellules mésangiales peut modifier le DFG', is_correct: true },
            { lettre: 'E', enonce: "Le DFG diminue avec l'âge", is_correct: true },
          ],
          correction: "**Réponse : B**\n\nA. **EXACT** — La pression hydrostatique (Pcap = 45 mmHg) reste **constante** le long du capillaire glomérulaire car il n'y a pas de résistance significative.\nB. **FAUX (RÉPONSE)** — La pression oncotique plasmatique **augmente** le long du capillaire glomérulaire. L'eau est filtrée → les protéines se concentrent → πplasm augmente progressivement.\nC. **EXACT** — Les capillaires glomérulaires ont une pression élevée (40-60 mmHg), bien supérieure à celle des capillaires péritubulaires (pression habituelle après la chute dans l'artériole efférente).\nD. **EXACT** — Les cellules mésangiales sont contractiles. Leur contraction réduit la surface d'échange → ↓ Kf → modifie le DFG.\nE. **EXACT** — Le DFG diminue avec l'âge en raison de la perte progressive de néphrons fonctionnels.",
        },
      ],
    },
    {
      titre: 'Annale 2017 Session 2 — Sténose de l\'artère rénale (Question 20)',
      annee: '2016-2017',
      rappel_cours: "La **sténose de l'artère rénale** (plaque d'athérome) → ↓ pression de perfusion → activation permanente du SRA.\n\nConséquences :\n· **Rénine** en excès → **AGII** en excès → vasoconstriction périphérique → **HTA**\n· AGII → **aldostérone** (surrénale) → réabsorption de Na⁺ et excrétion de K⁺ → hypervolémie + **hypokaliémie**\n· C'est un **hyperaldostéronisme SECONDAIRE** (dû à l'excès de rénine, pas une tumeur surrénalienne)\n· La vasoconstriction de l'**AE** est stimulée pour maintenir le DFG\n· La natriurèse est **réduite** (l'aldostérone favorise la réabsorption de Na⁺)",
      questions: [
        {
          enonce: "Concernant la sténose de l'artère rénale :",
          items: [
            { lettre: 'A', enonce: 'Réduction de la natriurèse', is_correct: true },
            { lettre: 'B', enonce: 'Hyperaldostéronisme primaire', is_correct: false },
            { lettre: 'C', enonce: 'Hypokaliémie', is_correct: true },
            { lettre: 'D', enonce: 'HTA', is_correct: true },
            { lettre: 'E', enonce: "Vasoconstriction de l'AE", is_correct: true },
          ],
          correction: "**Réponse : ACDE**\n\nA. **VRAI** — L'aldostérone (stimulée par le SRA activé) favorise la réabsorption de Na⁺ → la natriurèse est **réduite**.\nB. **FAUX** — Il s'agit d'un hyperaldostéronisme **SECONDAIRE** (dû à l'excès de rénine/AGII), pas primaire. L'hyperaldostéronisme primaire (syndrome de Conn) est dû à une tumeur surrénalienne.\nC. **VRAI** — L'aldostérone en excès stimule l'excrétion de K⁺ au tube collecteur → **hypokaliémie**.\nD. **VRAI** — L'AGII en excès provoque une vasoconstriction périphérique + l'aldostérone entraîne une hypervolémie → **HTA réno-vasculaire**.\nE. **VRAI** — L'AGII vasoconstricte prédominamment l'artériole **efférente** pour maintenir la Pcap et le DFG.",
        },
      ],
    },
    {
      titre: 'Annale 2015 Session 1 — Filtration glomérulaire, SAUF UNE (Question 13)',
      annee: '2014-2015',
      rappel_cours: "Rappel des forces de Starling dans le capillaire glomérulaire :\n\n· **Pcap** (pression hydrostatique) = 45 mmHg → reste **constante** le long du capillaire\n· **πplasm** (pression oncotique plasmatique) = 20 mmHg au début → **augmente** progressivement (concentration des protéines)\n· **Pbow** = 10 mmHg\n\nLes **cellules mésangiales** contractiles modifient le Kf → peuvent modifier le DFG.\nLe **DFG diminue avec l'âge**.",
      questions: [
        {
          enonce: "Concernant la filtration glomérulaire, toutes les propositions suivantes sont exactes SAUF UNE, laquelle ?",
          items: [
            { lettre: 'A', enonce: "La pression hydrostatique varie peu entre le début et la fin du capillaire glomérulaire", is_correct: true },
            { lettre: 'B', enonce: "La pression hydrostatique dans les capillaires glomérulaires est supérieure à celle des capillaires péritubulaires", is_correct: true },
            { lettre: 'C', enonce: "La pression oncotique plasmatique ne varie pas entre le début et la fin du capillaire glomérulaire", is_correct: false },
            { lettre: 'D', enonce: 'La contraction des cellules mésangiales peut modifier le DFG', is_correct: true },
            { lettre: 'E', enonce: "Le DFG diminue avec l'âge", is_correct: true },
          ],
          correction: "**Réponse : C**\n\nA. **EXACT** — La Pcap (45 mmHg) reste constante le long du capillaire glomérulaire.\nB. **EXACT** — Les capillaires glomérulaires (40-60 mmHg) ont une pression bien supérieure aux capillaires péritubulaires.\nC. **FAUX (RÉPONSE)** — La πplasm **augmente** le long du capillaire car l'eau est filtrée → les protéines se concentrent.\nD. **EXACT** — Les cellules mésangiales sont contractiles → modifient la surface d'échange (Kf) → modifient le DFG.\nE. **EXACT** — Le DFG diminue progressivement avec l'âge.",
        },
      ],
    },
    {
      titre: 'Annale 2015 Session 1 — Régulation du DFG (Question 23)',
      annee: '2014-2015',
      rappel_cours: "**Mécanisme myogénique :** mis en jeu en cas d'**augmentation** de pression dans l'AA → vasoconstriction de l'AA.\n\n**TGF :** aboutit à une vasoconstriction de l'**AA** (pas de l'AE).\n\n**AGII :** vasoconstricte prédominamment l'artériole **EFFÉRENTE** (pas l'afférente, qui est protégée par PGI₂ et NO).\n\n**Rénine :** libérée quand la pression **DIMINUE** dans l'AA (pas quand elle augmente).\n\n**ECA :** produite par l'**endothélium capillaire** glomérulaire (pas par les cellules de la macula densa).",
      questions: [
        {
          enonce: "Concernant la régulation du DFG :",
          items: [
            { lettre: 'A', enonce: "Le mécanisme myogénique est mis en jeu par une augmentation de pression dans l'artériole afférente", is_correct: true },
            { lettre: 'B', enonce: "Le TGF aboutit à une vasoconstriction de l'artériole efférente", is_correct: false },
            { lettre: 'C', enonce: "L'angiotensine II vasoconstricte de manière prédominante l'artériole afférente", is_correct: false },
            { lettre: 'D', enonce: "L'augmentation de la pression dans l'artériole afférente induit la libération de rénine", is_correct: false },
            { lettre: 'E', enonce: "Les cellules de la macula densa produisent l'ECA", is_correct: false },
          ],
          correction: "**Réponse : A**\n\nA. **VRAI** — Le mécanisme myogénique est déclenché par une **augmentation de pression** dans l'AA → distension des CML → vasoconstriction réflexe.\nB. **FAUX** — Le TGF aboutit à une vasoconstriction de l'artériole **AFFÉRENTE** (pas efférente).\nC. **FAUX** — L'AGII vasoconstricte de manière prédominante l'artériole **EFFÉRENTE** (pas afférente). L'AA est protégée par la PGI₂ et le NO.\nD. **FAUX** — La rénine est libérée quand la pression **DIMINUE** dans l'AA (barorécepteurs intra-rénaux). Une augmentation de pression inhibe la libération de rénine.\nE. **FAUX** — Les cellules de la macula densa ne produisent PAS l'ECA. Elles produisent de l'**adénosine** (médiateur du TGF). L'ECA est produite par l'endothélium capillaire glomérulaire.",
        },
      ],
    },
    {
      titre: 'Annale 2015 Session 2 — Mesure du DFG, SAUF UNE (Question 10)',
      annee: '2014-2015',
      rappel_cours: "Pour mesurer le DFG, on utilise une substance qui est **filtrée librement** par le glomérule et qui n'est **ni réabsorbée ni sécrétée** par les tubules.\n\n· Méthode de référence = **clairance de l'inuline**\n· En pratique : **clairance de la créatinine** (facile à mesurer)\n· Estimation par formules : **MDRD** (ou CKD-EPI) à partir de la créatinine plasmatique — plus juste chez le sujet âgé que **Cockroft et Gault**\n· Mais l'estimation par la créatinine plasmatique est **moins fiable** qu'une mesure directe de clairance",
      questions: [
        {
          enonce: "Concernant la mesure du DFG, toutes les propositions sont exactes SAUF UNE, laquelle ?",
          items: [
            { lettre: 'A', enonce: "La mesure du DFG nécessite une substance filtrée uniquement et librement", is_correct: true },
            { lettre: 'B', enonce: "La méthode de référence est la clairance de l'inuline", is_correct: true },
            { lettre: 'C', enonce: 'La clairance de la créatinine est facile à mesurer', is_correct: true },
            { lettre: 'D', enonce: "L'estimation du DFG à partir de la créatinine plasmatique est aussi fiable que la mesure de la clairance", is_correct: false },
            { lettre: 'E', enonce: 'La formule MDRD est plus juste chez les sujets âgés que la formule de Cockroft et Gault', is_correct: true },
          ],
          correction: "**Réponse : D**\n\nA. **EXACT** — Pour mesurer le DFG, la substance doit être filtrée librement et ne pas être réabsorbée ni sécrétée.\nB. **EXACT** — La **clairance de l'inuline** est la méthode de référence (gold standard).\nC. **EXACT** — La clairance de la créatinine est facilement mesurable en pratique courante.\nD. **FAUX (RÉPONSE)** — L'estimation du DFG par la créatinine plasmatique (formules MDRD, CKD-EPI) est **moins fiable** qu'une mesure directe de clairance. C'est une approximation pratique mais pas aussi précise.\nE. **EXACT** — La formule MDRD (et CKD-EPI) est plus juste chez les **sujets âgés** que Cockroft et Gault, qui surévalue le DFG dans cette population.",
        },
      ],
    },
    {
      titre: 'Annale — Filtration glomérulaire (Question 26)',
      annee: '2019-2020',
      rappel_cours: "Rappels importants :\n\n· La **balance glomérulotubulaire** adapte la réabsorption proximale de Na⁺/eau au DFG\n· La filtration s'interrompt quand **πplasm = ΔP hydrostatique** (pas quand Pbow > πcap)\n· Le DFG représente **20% du DPR** (pas du DSR ! Le DSR inclut les GR)\n· La filtration glomérulaire est un phénomène **passif**\n· Le glucose est filtré librement : chez le sujet non diabétique, le débit massique de filtration du glucose n'est **pas nul** (tout est simplement réabsorbé ensuite)",
      questions: [
        {
          enonce: "Concernant la filtration glomérulaire :",
          items: [
            { lettre: 'A', enonce: "La balance glomérulotubulaire adapte la réabsorption proximale de Na⁺ et d'eau au DFG", is_correct: true },
            { lettre: 'B', enonce: "La filtration s'interrompt quand Pbow devient supérieure à πcap", is_correct: false },
            { lettre: 'C', enonce: 'Le DFG représente 20% du DSR', is_correct: false },
            { lettre: 'D', enonce: 'La filtration glomérulaire est un phénomène passif', is_correct: true },
            { lettre: 'E', enonce: "Chez le sujet non diabétique, le débit massique de filtration du glucose est nul", is_correct: false },
          ],
          correction: "**Réponse : AD**\n\nA. **VRAI** — La **balance glomérulotubulaire** adapte proportionnellement la réabsorption proximale de Na⁺ et d'eau au niveau du DFG.\nB. **FAUX** — La filtration s'interrompt quand **πplasm = ΔP hydrostatique** (Pcap - Pbow = 35 mmHg), c'est-à-dire quand la PUF atteint 0. Ce n'est pas quand Pbow > πcap.\nC. **FAUX** — Le DFG représente **20% du DPR** (pas du DSR). Le DSR inclut les globules rouges qui ne sont pas filtrés. DFG = 120 mL/min = 20% de 600 mL/min (DPR).\nD. **VRAI** — La filtration glomérulaire est un phénomène **purement passif**, dépendant des forces de Starling.\nE. **FAUX** — Le glucose est filtré librement, donc le débit massique de filtration n'est **pas nul** chez le sujet non diabétique. Il est simplement entièrement réabsorbé par les tubules.",
        },
      ],
    },
    {
      titre: 'Annale — ANF (Question 18)',
      annee: '2019-2020',
      rappel_cours: "L'**ANF** (facteur atrial natriurétique) est un peptide de 28 acides aminés, libéré par les myocytes auriculaires en cas de distension (hypervolémie).\n\nSes actions :\n· **Vasodilatation** de l'artériole afférente\n· **Vasoconstriction** de l'artériole efférente\n· **↑ Kf** (surface de filtration)\n· **Inhibition** de la libération de rénine\n\nRésultat : ↑ DFG → ↑ **natriurèse** (élimination de Na⁺ et d'eau)\n\nL'ANF et la rénine sont des systèmes **antagonistes** : l'ANF inhibe la rénine (il ne la stimule pas).",
      questions: [
        {
          enonce: "Concernant l'ANF (facteur atrial natriurétique) :",
          items: [
            { lettre: 'A', enonce: "Vasodilatation de l'artériole afférente", is_correct: true },
            { lettre: 'B', enonce: 'Augmente le DFG', is_correct: true },
            { lettre: 'C', enonce: 'Diminue la natriurèse', is_correct: false },
            { lettre: 'D', enonce: "Libéré en cas d'augmentation du volume sanguin circulant", is_correct: true },
            { lettre: 'E', enonce: 'Stimule la libération de rénine', is_correct: false },
          ],
          correction: "**Réponse : ABD**\n\nA. **VRAI** — L'ANF provoque une **vasodilatation de l'artériole afférente**, ce qui augmente le débit sanguin glomérulaire.\nB. **VRAI** — L'ANF **augmente le DFG** grâce à la vasodilatation AA + vasoconstriction AE + ↑ Kf.\nC. **FAUX** — L'ANF **augmente** la natriurèse (pas la diminue). C'est son rôle principal : favoriser l'élimination de Na⁺ et d'eau pour corriger l'hypervolémie.\nD. **VRAI** — L'ANF est libéré par les myocytes auriculaires quand ils sont distendus, c'est-à-dire en cas d'**augmentation du volume sanguin** (hypervolémie).\nE. **FAUX** — L'ANF **inhibe** la libération de rénine (il ne la stimule pas). ANF et rénine sont des systèmes antagonistes.",
        },
      ],
    },
  ],
};

export default content;

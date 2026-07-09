import type { PriveCourseContent } from '../prive-courses';

const content: PriveCourseContent = {
  fiche: {
    parties: [],
    points_cles: [
      'La **natrémie** reflète le volume **intracellulaire**, jamais le volume extracellulaire.',
      'La branche ascendante large est **imperméable à l\'eau en toute circonstance** (pas d\'AQP, jonctions serrées).',
      'Concentrer les urines requiert **deux conditions** : gradient CP présent ET ADH.',
      'ADH → récepteur **V2** → AMPc → PKA → insertion **AQP2** en face apicale du canal collecteur.',
      'Gradient CP : **Na/K/2Cl** (branche ↑ large) + multiplicateur à contre-courant + urée (50 % osmoles médullaires) + vasa recta.',
      '**Furosémide** inhibe Na/K/2Cl → supprime gradient CP → diurétique de l\'anse.',
      'Seuils : ADH dès **280 mosm/L**, soif dès **290 mosm/kg H₂O**, stimulus volumique à **−7 %** volémie.',
      'Diabète insipide : **15 L/j** d\'urines à 60 mosm/L (neurogénique = pas d\'ADH ; néphrogénique = résistance à l\'ADH).',
      'Diurèse osmotique (diabète) → abolition gradient CP → polyurie **iso-osmotique** ≤ 300 mosm/L.',
    ],
    chiffres_cles: {
      titre: 'Chiffres clés',
      markdown:
        '| Paramètre | Valeur |\n' +
        '|---|---|\n' +
        '| Eau corporelle totale | **60 %** PC (1/3 EC, 2/3 IC) |\n' +
        '| Osmolalité plasmatique normale | **295 ± 5** mosm/kg H₂O |\n' +
        '| Tonicité (2 × [Na⁺]) | ≈ **280** mosm/kg H₂O |\n' +
        '| Filtration glomérulaire | **180 L/j** |\n' +
        '| Débit urinaire normal | **1,5 L/j** à 600 mosm/L |\n' +
        '| Antidiurèse | **750 mL/j** à 1200 mosm/L |\n' +
        '| Diabète insipide | **15 L/j** à 60 mosm/L |\n' +
        '| Osmolalité urinaire (plage) | **60–1200** mosm/kg H₂O |\n' +
        '| Osmolalité cortex interstitium | **300** mosm/kg H₂O |\n' +
        '| Osmolalité papille (max) | **1200** mosm/kg H₂O |\n' +
        '| Contribution urée au gradient médullaire | **50 %** (NaCl = 50 %) |\n' +
        '| Débit sanguin médullaire | **10 %** DSR |\n' +
        '| Seuil sécrétion ADH | **280** mosm/L |\n' +
        '| Seuil soif | **290** mosm/kg H₂O |\n' +
        '| Stimulus volumique ADH | **−7 %** volémie |\n' +
        '| Risque vital | **−13 %** volémie |',
    },
  },

  flashcards: [
    // ── I. Généralités ──────────────────────────────────────────────────
    {
      recto: 'Quelle est la proportion d\'eau dans le corps et comment est-elle répartie ?',
      verso:
        '<b>60 % du poids corporel</b>\n' +
        '· 1/3 extracellulaire : liquide interstitiel (15 %) + plasma (<b>3 L</b>)\n' +
        '· 2/3 intracellulaire (compartiment le plus volumineux)\n\n' +
        'Plasma = reflet du milieu EC (ionogramme sanguin)',
      order_index: 1,
    },
    {
      recto: 'Dans quel sens se déplace l\'eau entre les compartiments EC et IC ?',
      verso:
        'Échanges <b>passifs</b> via les aquaporines (présentes dans toutes les cellules)\n\n' +
        'L\'eau va toujours de l\'osmolalité la <b>plus faible</b> vers la <b>plus élevée</b>\n' +
        '→ Équilibre très rapide',
      order_index: 2,
    },
    {
      recto: 'Quelle est la règle fondamentale du compartiment intracellulaire concernant les osmoles ?',
      verso:
        'Dans le secteur IC : <b>nombre d\'osmoles = constant</b> dans le temps\n\n' +
        '→ Si osmolalité IC varie → c\'est le <b>volume d\'eau</b> qui a varié (pas les osmoles)\n\n' +
        '⚠ Cette règle ne s\'applique PAS au compartiment EC (osmoles ET volume peuvent varier)',
      order_index: 3,
    },
    {
      recto: 'Que reflète l\'osmolalité extracellulaire ?',
      verso:
        'Elle reflète l\'<b>état d\'hydratation intracellulaire</b> +++\n\n' +
        'Raisonnement : à l\'équilibre, osm EC = osm IC\n' +
        'Comme les osmoles IC sont fixes → si osm varie → c\'est le <b>volume IC</b> qui varie\n\n' +
        'Ce qu\'on mesure/calcule : toujours l\'osmolalité <b>extracellulaire</b>',
      order_index: 4,
    },
    {
      recto: 'Que régule l\'organisme pour maintenir le contenu en eau ? Comment le mesure-t-il ?',
      verso:
        'L\'organisme ne peut pas mesurer directement le contenu en eau\n\n' +
        '→ Ce qui est régulé : <b>l\'osmolalité</b>\n' +
        '→ Détectée par les <b>osmorécepteurs</b>\n\n' +
        'Variable régulée = homéostasie : valeur quasi constante autour de la consigne',
      order_index: 5,
    },
    {
      recto: 'Quelle est l\'osmolalité plasmatique normale et comment se calcule-t-elle ?',
      verso:
        'Valeur normale : <b>295 ± 5 mosm/kg H₂O</b> (≈ 300 par simplification)\n\n' +
        'Formule :\n' +
        '<b>2 × [Na⁺] + [glucose] + [urée]</b> ≈ 285–290 mosm/kg H₂O\n' +
        '(glucose et urée ≈ 5 mmol/L chacun en situation normale)\n\n' +
        'Tonicité (osmolalité efficace) = <b>2 × [Na⁺]</b> ≈ <b>280</b> mosm/kg H₂O',
      order_index: 6,
    },
    {
      recto: 'Qu\'est-ce que la tonicité (osmolalité efficace) et pourquoi l\'utilise-t-on ?',
      verso:
        'Tonicité = <b>2 × [Na⁺]</b> ≈ <b>280 mosm/kg H₂O</b>\n\n' +
        'On exclut glucose et urée car ils traversent <b>librement</b> les membranes biologiques\n' +
        '(pas osmotiquement actifs en situation normale)\n\n' +
        '⚠ Exception : en cas de diabète, glucose ne traverse plus bien → devient osmotiquement actif',
      order_index: 7,
    },
    {
      recto: 'Que reflète la natrémie ? Point MAJEUR à connaître.',
      verso:
        'Natrémie = concentration plasmatique du sodium\n\n' +
        '→ Reflète le <b>volume intracellulaire</b>\n' +
        '→ <b>Ne reflète PAS le volume extracellulaire</b> (POINT MAJEUR)\n\n' +
        'Exemples :\n' +
        '· Natrémie 160 mmol/L → hyperosm → <b>déshydratation IC</b>\n' +
        '· Natrémie 120 mmol/L → hypoosm → <b>hyperhydratation IC</b>',
      order_index: 8,
    },
    {
      recto: 'Si osmolalité plasmatique = 280 mosm/L au lieu de 300, que s\'est-il passé ?',
      verso:
        'Formule IC : osm = N osmoles (fixe) / volume d\'eau\n\n' +
        'Si osm ↓ (280 au lieu de 300) → numérateur fixe → <b>volume IC augmenté</b>\n' +
        '→ Hyperhydratation intracellulaire\n\n' +
        'Si osm ↑ (320 au lieu de 300) → <b>volume IC diminué</b>\n' +
        '→ Déshydratation intracellulaire',
      order_index: 9,
    },

    // ── II. Bilan de l'eau ──────────────────────────────────────────────
    {
      recto: 'Quelles sont les sources d\'apport en eau dans l\'organisme ?',
      verso:
        '<b>Eau endogène</b> : eau d\'oxydation (catabolisme protides/glucides/lipides)\n' +
        '→ ≈ <b>500 mL/j</b> — stable, fixe\n\n' +
        '<b>Eau exogène</b> : boissons + alimentation\n' +
        '→ Variable : <b>1 à 3 L/j</b> selon les habitus\n\n' +
        'Régulée par la <b>sensation de soif</b>',
      order_index: 10,
    },
    {
      recto: 'Quelles populations sont vulnérables au défaut d\'apport hydrique ?',
      verso:
        '1. <b>Nouveau-nés</b> : ne peuvent pas exprimer la soif\n' +
        '2. <b>Personnes âgées</b> : sensation de soif altérée\n\n' +
        '→ Risque de déshydratation +++ dans ces deux populations\n' +
        '→ Apport hydrique régulier indispensable (ne pas attendre la soif)',
      order_index: 11,
    },
    {
      recto: 'Quelles sont les différentes sorties d\'eau et leurs volumes quotidiens ?',
      verso:
        '<b>Sorties extra-rénales (non régulées)</b> :\n' +
        '· Cutanées (sueur), respiratoires, fèces\n' +
        '→ ≈ <b>500–800 mL/j</b>\n\n' +
        '<b>Sorties rénales (régulées)</b> :\n' +
        '· Filtration glomérulaire : <b>180 L/j</b>\n' +
        '· Volume uriné : ≈ <b>1,8 L/j</b> (1 % du filtrat)\n\n' +
        '⚠ Seul le rein peut RÉGULER les sorties d\'eau',
      order_index: 12,
    },
    {
      recto: 'Comment le rein détermine-t-il l\'excrétion d\'eau ? Quelles sont les limites ?',
      verso:
        'Le rein adapte le <b>volume d\'urine</b> aux entrées → maintient l\'osmolalité plasmatique constante\n\n' +
        'Le rein peut excréter le même nombre d\'osmoles dans un volume très variable :\n' +
        '→ Plage d\'osmolalité urinaire : <b>60 → 1200 mosm/kg H₂O</b> (limites fixes)\n' +
        '→ Débit urinaire minimum : <b>0,5 L/j</b>\n\n' +
        'Charge osmolaire à excréter chaque jour : <b>~600 mosm/j</b>',
      order_index: 13,
    },

    // ── Perméabilité des segments ───────────────────────────────────────
    {
      recto: 'Quelle est la perméabilité du tube contourné proximal (TCP) à l\'eau ?',
      verso:
        '<b>Extrêmement perméable à l\'eau</b>\n' +
        '· Voie paracellulaire + <b>AQP1</b> en grande quantité\n' +
        '· Réabsorption massive (60–70 % du filtrat)\n' +
        '· Réabsorption <b>iso-osmotique</b> : l\'eau suit le Na⁺, osmolalité reste à <b>300</b>',
      order_index: 14,
    },
    {
      recto: 'Quelle est la perméabilité de la branche descendante de l\'anse de Henlé ?',
      verso:
        '· <b>Perméable à l\'eau</b> : présence d\'<b>AQP1</b> → réabsorption d\'eau possible\n' +
        '· <b>Imperméable aux solutés</b> : pas de réabsorption de Cl⁻, Na⁺, etc.\n\n' +
        'Réabsorption : <b>15–20 %</b> de l\'eau filtrée dans ce segment',
      order_index: 15,
    },
    {
      recto: 'Quelle est la perméabilité de la branche ascendante large de l\'anse de Henlé ? (IMPORTANT)',
      verso:
        '<b>IMPERMÉABLE À L\'EAU EN TOUTE CIRCONSTANCE</b>\n' +
        '· Absence totale d\'aquaporines\n' +
        '· Jonctions intercellulaires très serrées\n\n' +
        '<b>Perméable aux solutés</b> : réabsorption massive de <b>NaCl</b> via Na⁺/K⁺/2Cl⁻\n\n' +
        '→ C\'est ici que se crée l\'<b>effet élémentaire</b> du gradient cortico-papillaire',
      order_index: 16,
    },
    {
      recto: 'Quelle est la perméabilité du tube contourné distal (TCD) ?',
      verso:
        '· <b>Imperméable à l\'eau</b> en toutes circonstances\n' +
        '· <b>Perméable aux solutés</b> (réabsorption de Na⁺)\n\n' +
        'À l\'entrée du collecteur : osmolalité tubulaire ≈ <b>100 mosm/kg H₂O</b>',
      order_index: 17,
    },
    {
      recto: 'Quelle est la perméabilité du canal collecteur ? Quelles aquaporines y sont présentes ?',
      verso:
        'Perméabilité <b>variable selon l\'ADH</b> :\n\n' +
        '<b>Sans ADH</b> → imperméable à l\'eau\n' +
        '· Face basolatérale : <b>AQP3 et AQP4</b> (constitutives, non dépendantes de l\'ADH)\n' +
        '· Face apicale : <b>aucune aquaporine</b> → eau ne peut pas entrer\n\n' +
        '<b>Avec ADH</b> → perméable à l\'eau\n' +
        '· Insertion des <b>AQP2</b> (stockées en IC) dans la membrane <b>apicale</b>',
      order_index: 18,
    },
    {
      recto: 'Résumer la réabsorption d\'eau et l\'évolution de l\'osmolalité tubulaire sur tout le néphron',
      verso:
        '· Filtration glomérulaire : <b>180 L/j</b>, osm = <b>300</b>\n' +
        '· TCP : réabsorption <b>60–70 %</b>, osm reste <b>300</b> (iso-osmotique)\n' +
        '· Branche descendante : réabsorption <b>15–20 %</b> eau, osm ↑ jusqu\'à <b>1200</b>\n' +
        '· Branche ascendante : <b>0 %</b> eau, NaCl réabsorbé → osm ↓\n' +
        '· TCD : osm ≈ <b>150 mosm/kg H₂O</b>\n' +
        '· Entrée collecteur : osm ≈ <b>100 mosm/kg H₂O</b>\n' +
        '· Canal collecteur : 12–20 % (ADH-dépendant)\n' +
        '→ <b>Urines : 1 % du filtrat</b>',
      order_index: 19,
    },

    // ── III. Gradient CP ────────────────────────────────────────────────
    {
      recto: 'Qu\'est-ce que le gradient osmotique cortico-papillaire (GCP) ?',
      verso:
        'Gradient croissant d\'osmolalité dans l\'<b>interstitium rénal</b> :\n' +
        '· Cortex : <b>300 mosm/kg H₂O</b>\n' +
        '· Papille (maximum) : <b>1200 mOsm/kg H₂O</b>\n\n' +
        'Plus on plonge dans la médullaire → plus l\'osmolalité interstitielle augmente\n\n' +
        'Ce gradient permet la réabsorption passive d\'eau au niveau du canal collecteur',
      order_index: 20,
    },
    {
      recto: 'Quelles sont les deux conditions nécessaires à la réabsorption d\'eau dans le canal collecteur ?',
      verso:
        '1. <b>Présence d\'un gradient osmotique CP</b>\n' +
        '   → Pour attirer l\'eau vers l\'interstitium (osmose)\n\n' +
        '2. <b>Perméabilité du collecteur à l\'eau</b>\n' +
        '   → Dépend de l\'ADH (insertion d\'AQP2)\n\n' +
        '⚠ Les deux sont indispensables : si l\'un manque → impossible de concentrer les urines',
      order_index: 21,
    },
    {
      recto: 'Quel est l\'effet élémentaire à l\'origine du gradient cortico-papillaire ?',
      verso:
        'Cotransporteur <b>Na⁺/K⁺/2Cl⁻</b> de la <b>branche ascendante large</b>\n\n' +
        '· Réabsorbe NaCl dans l\'interstitium <b>sans eau</b>\n' +
        '· Crée un gradient local de <b>200 mOsm/kg H₂O</b> entre lumière et interstitium\n\n' +
        '<b>Inhibé par le Furosémide</b> +++\n\n' +
        'Fonctionne grâce à la différence de perméabilité entre les branches :\n' +
        '· Descendante : perméable à l\'eau, imperméable aux solutés\n' +
        '· Ascendante : imperméable à l\'eau, perméable aux solutés',
      order_index: 22,
    },
    {
      recto: 'Comment fonctionne le multiplicateur à contre-courant ?',
      verso:
        'Branches descendante et ascendante <b>parallèles</b>, fluide circulant en <b>sens inverse</b>\n\n' +
        '1. Na/K/2Cl crée un gradient de 200 mOsm entre lumière ↑ et interstitium\n' +
        '2. Dans la branche ↓, l\'eau sort pour rééquilibrer → concentration du fluide\n' +
        '3. Le fluide concentré descend → nouveau cycle → amplification\n\n' +
        '→ Gradient progressivement amplifié jusqu\'à <b>1200 mOsm/kg H₂O</b> au fond de l\'anse\n\n' +
        'Plus l\'anse est longue → plus l\'osmolalité maximale atteinte est élevée',
      order_index: 23,
    },
    {
      recto: 'Quel est le rôle de l\'urée dans le gradient cortico-papillaire ?',
      verso:
        '· L\'urée est une petite molécule librement filtrée qui circule dans l\'anse (cycle)\n' +
        '· Les segments imperméables à l\'urée la concentrent dans le fluide tubulaire\n' +
        '· La fin du canal collecteur est <b>perméable à l\'urée</b> → diffuse dans l\'interstitium\n' +
        '· L\'urée s\'accumule autour de la <b>papille</b>\n\n' +
        '→ Contribution à l\'hyperosm médullaire interne : <b>50 % de l\'urée</b> (50 % NaCl)\n\n' +
        'L\'<b>ADH</b> augmente la perméabilité à l\'urée de la partie terminale du collecteur',
      order_index: 24,
    },
    {
      recto: 'Quel est le rôle des vasa recta dans le maintien du gradient CP ?',
      verso:
        'Capillaires droits longeant les anses de Henlé des <b>néphrons profonds uniquement</b>\n' +
        '(néphrons superficiels : pas de vasa recta → ne concentrent pas l\'urine)\n\n' +
        '<b>Système d\'échange à contre-courant</b> :\n' +
        '· Descente : eau sort, osmoles entrent dans le capillaire → sang se concentre\n' +
        '· Remontée : eau rentre, osmoles sortent → sang récupère son eau\n\n' +
        '→ Le gradient interstitiel est <b>préservé</b>',
      order_index: 25,
    },
    {
      recto: 'Pourquoi le faible débit sanguin médullaire est-il essentiel ?',
      verso:
        'La médullaire ne reçoit que <b>10 % du DSR</b> (90 % pour la corticale)\n\n' +
        '<b>Faible débit = essentiel car</b> :\n' +
        '· Évite le <b>lavage</b> du gradient osmotique médullaire\n' +
        '· Permet le maintien du gradient CP (coûteux énergétiquement à produire)\n\n' +
        '⚠ Si débit médullaire ↑ → gradient perdu → rein <b>perd la capacité de concentrer</b> les urines',
      order_index: 26,
    },
    {
      recto: 'Quels sont les inhibiteurs/altérateurs du gradient cortico-papillaire ?',
      verso:
        '1. <b>Furosémide</b> : inhibe Na/K/2Cl → supprime le gradient CP\n' +
        '   (rein ne peut plus concentrer les urines en présence de Furosémide)\n\n' +
        '2. <b>Régime sans protéines</b> : ↓ urée → ↓ osmoles médullaires (urée = 50 %)\n' +
        '   → Réduction du gradient\n\n' +
        '3. <b>Diurèse osmotique</b> : ↑ débit vasa recta → lavage → abolition du gradient\n' +
        '   → Polyurie iso-osmotique',
      order_index: 27,
    },

    // ── ADH ─────────────────────────────────────────────────────────────
    {
      recto: 'Quelle est la nature et l\'origine de l\'ADH ?',
      verso:
        'L\'ADH (= arginine vasopressine, AVP) est un <b>petit peptide</b>\n\n' +
        'Circuit :\n' +
        '1. Synthèse dans les <b>neurones hypothalamiques</b>\n' +
        '2. Transport le long des <b>axones</b>\n' +
        '3. Stockage dans la <b>post-hypophyse</b>\n' +
        '4. Libération par <b>exocytose</b> dans le sang selon les besoins',
      order_index: 28,
    },
    {
      recto: 'Quel est l\'organe cible de l\'ADH et quel est son mode d\'action cellulaire ?',
      verso:
        'Organe cible : <b>canal collecteur</b>\n\n' +
        'Cascade :\n' +
        '1. ADH → récepteur membranaire <b>V2</b>\n' +
        '2. Active l\'<b>adénylate cyclase</b>\n' +
        '3. ↑ <b>AMPc</b>\n' +
        '4. Active la <b>PKA</b>\n' +
        '5. PKA phosphoryle une protéine\n' +
        '6. En présence de Ca²⁺ → insertion des <b>AQP2</b> (stockées en IC) dans la membrane <b>apicale</b>\n\n' +
        '→ L\'eau peut entrer par osmose',
      order_index: 29,
    },
    {
      recto: 'Quelle est la situation sans ADH vs avec ADH dans le canal collecteur ?',
      verso:
        '<b>Sans ADH</b> :\n' +
        '· Face basolatérale : AQP3 et AQP4 (constitutives)\n' +
        '· Face apicale : <b>aucune AQP</b> → eau ne peut pas entrer\n' +
        '· Surface apicale <b>lisse</b> au MEB\n\n' +
        '<b>Avec ADH</b> :\n' +
        '· AQP2 insérées en face <b>apicale</b> → eau entre dans la cellule\n' +
        '· Surface apicale <b>granuleuse</b> au MEB (AQP visibles)\n' +
        '· L\'eau sort par AQP3/4 côté basolatéral',
      order_index: 30,
    },
    {
      recto: 'Quelle est la relation entre concentration plasmatique d\'ADH et osmolalité urinaire ?',
      verso:
        'Relation <b>linéaire</b> : osmolalité urinaire ↑ proportionnellement à [ADH] plasmatique\n\n' +
        '· Plateau maximum à <b>1200 mOsm/kg H₂O</b>\n' +
        '· Sans ADH : urines à <b>60 mosm/L</b>\n' +
        '· ADH maximum : urines à <b>1200 mosm/L</b>\n\n' +
        '→ La concentration plasmatique d\'ADH détermine à quelle osmolalité seront les urines',
      order_index: 31,
    },
    {
      recto: 'Qu\'est-ce que le diabète insipide ? Quels sont ses deux types ?',
      verso:
        '<b>Diabète insipide neurogénique</b> (central) :\n' +
        '→ Hypothalamus ne produit plus suffisamment d\'ADH (assez rare)\n\n' +
        '<b>Diabète insipide néphrogénique</b> :\n' +
        '→ ADH présente mais les cellules cibles ne répondent pas\n' +
        '→ Problème de récepteur V2 ou autre\n\n' +
        'Dans les <b>deux cas</b> : <b>polyurie importante</b> (15 L/j à 60 mosm/L)\n\n' +
        '⚠ Diabète insipide ≠ diabète sucré : "insipide" = urines sans saveur',
      order_index: 32,
    },

    // ── IV. Régulation ──────────────────────────────────────────────────
    {
      recto: 'Quels sont les deux systèmes d\'alarme de la régulation du bilan hydrique ?',
      verso:
        '1. <b>Osmolalité plasmatique</b>\n' +
        '   → Reflète l\'hydratation IC\n' +
        '   → Toujours mis en jeu\n\n' +
        '2. <b>Volémie</b>\n' +
        '   → Reflète le secteur EC\n' +
        '   → Mis en jeu en cas d\'urgence/danger vital\n\n' +
        'Deux systèmes effecteurs :\n' +
        '· <b>Soif</b> → régule les entrées\n' +
        '· <b>Rein + ADH</b> → régule les sorties',
      order_index: 33,
    },
    {
      recto: 'Quel est le stimulus principal de la sécrétion d\'ADH et quel est le seuil d\'apparition ?',
      verso:
        'Stimulus principal : <b>osmolalité plasmatique</b>\n' +
        '→ Perçue par les <b>osmorécepteurs hypothalamiques</b>\n' +
        '→ Libération d\'ADH ↑ <b>linéairement</b> avec l\'osmolalité plasmatique\n\n' +
        'Seuil d\'apparition de l\'ADH : <b>280 mosm/L</b>\n' +
        '(en dessous de 280 : ADH non synthétisée)',
      order_index: 34,
    },
    {
      recto: 'Quel est le stimulus volumique de l\'ADH et quand est-il déclenché ?',
      verso:
        'Mis en jeu si volémie diminue de <b>> 7 %</b>\n\n' +
        'Mécanisme :\n' +
        '· Volorécepteurs de l\'<b>oreillette droite</b> (OD)\n' +
        '· → Seuil d\'apparition ADH <b>abaissé</b> (ADH même si hypo-osmolaire)\n' +
        '· → Production d\'ADH <b>augmentée</b>\n\n' +
        'Si PA perturbée : <b>barorécepteurs</b> aortiques et carotidiens → sécrétion d\'ADH\n\n' +
        '⚠ En situation courante : c\'est l\'<b>osmolalité</b> qui régule l\'ADH, NON la volémie',
      order_index: 35,
    },
    {
      recto: 'Quel est le seuil de déclenchement de la soif et comment est-elle régulée ?',
      verso:
        'Seuil : osmolalité plasmatique > <b>290 mosm/kg H₂O</b>\n' +
        '(seuil ADH = 280 → ADH activée <b>avant</b> la soif)\n\n' +
        'Osmorécepteurs dans le <b>tractus digestif supérieur</b> :\n' +
        '→ Dès qu\'on boit → inhibent les osmorécepteurs hypothalamiques\n' +
        '→ Évite la <b>sur-correction</b> de l\'osmolalité\n\n' +
        'Baisse de volémie > <b>13 %</b> → risque vital\n' +
        '→ Barorécepteurs intra-rénaux → sympathique → rénine → <b>angiotensine II</b> (dipsogène)',
      order_index: 36,
    },
    {
      recto: 'Résumer les seuils clés de la régulation du bilan hydrique',
      verso:
        '· <b>280 mosm/L</b> → seuil de sécrétion d\'ADH\n' +
        '· <b>290 mosm/kg H₂O</b> → seuil de la soif\n' +
        '· <b>−7 %</b> volémie → stimulus volumique ADH (volorécepteurs OD)\n' +
        '· <b>−13 %</b> volémie → risque vital, angiotensine II dipsogène\n\n' +
        '⚠ Personnes âgées : soif altérée → déshydratation silencieuse +++',
      order_index: 37,
    },

    // ── V. Diurèses ─────────────────────────────────────────────────────
    {
      recto: 'Décrire la diurèse normale (conditions, débit, osmolalité)',
      verso:
        'Condition : ni déshydraté, ni hyperhydraté → <b>ADH partielle</b>\n\n' +
        '· Réabsorption partielle d\'eau dans le collecteur\n' +
        '· Débit urinaire : <b>1,5 L/j</b>\n' +
        '· Osmolalité urinaire : <b>600 mosm/L</b>\n' +
        '· Excrétion : 1,5 × 600 = <b>900 mosm/j</b>\n\n' +
        'À l\'entrée du collecteur : 15 L/j restant, osm = 100 mosm/L',
      order_index: 38,
    },
    {
      recto: 'Décrire l\'antidiurèse (déshydratation, privation d\'eau)',
      verso:
        'Condition : déshydratation → <b>ADH au maximum</b>\n\n' +
        '· Réabsorption maximale d\'eau dans le collecteur\n' +
        '· Débit urinaire : <b>750 mL/j</b>\n' +
        '· Osmolalité urinaire : <b>1200 mosm/L</b>\n' +
        '· Excrétion : 0,75 × 1200 = <b>900 mosm/j</b>\n\n' +
        'Le rein excrète toujours 900 mosm/j mais dans un <b>volume minimal</b>',
      order_index: 39,
    },
    {
      recto: 'Décrire le diabète insipide (diurèse aqueuse) en termes de chiffres',
      verso:
        'Cause : absence ou résistance à l\'ADH → canal collecteur <b>imperméable à l\'eau</b>\n\n' +
        '· Osmolalité urinaire : <b>60 mosm/L</b>\n' +
        '· Débit urinaire : <b>15 L/j</b> !!!\n' +
        '  (900 mosm/j ÷ 60 mosm/L = 15 L)\n\n' +
        '→ Risque de déshydratation majeure\n' +
        '→ Neurogénique : hypothalamus ne produit pas assez d\'ADH\n' +
        '→ Néphrogénique : cellules ne répondent pas à l\'ADH (récepteur V2)',
      order_index: 40,
    },
    {
      recto: 'Qu\'est-ce que la diurèse osmotique ?',
      verso:
        'Polyurie due à une <b>substance osmotiquement active</b> filtrée mais peu réabsorbée\n\n' +
        '<b>Substances exogènes</b> :\n' +
        '· Mannitol (thérapeutique : œdèmes cérébraux)\n' +
        '· Produits de contraste radiologique\n\n' +
        '<b>Substances endogènes en excès</b> :\n' +
        '· Glucose (diabète > 2 g/L ou > 10 mmol/L)\n' +
        '· Urée (levée d\'obstacle)\n\n' +
        'Mécanisme : ↑ charge tubulaire → ↑ débit vasa recta → <b>abolition gradient CP</b>',
      order_index: 41,
    },
    {
      recto: 'Comment la diurèse osmotique au glucose (diabète) abolit-elle le gradient CP ? (étapes)',
      verso:
        '1. Glycémie > 2 g/L → transport max glucose atteint → <b>glycosurie</b>\n' +
        '2. Glucose dans le tube proximal = osmotiquement actif\n' +
        '   → Perturbe réabsorption eau et Na⁺ dans le <b>proximal</b> (2/3 normalement réabsorbés ici)\n' +
        '3. Débit tubulaire proximal ↑↑ → ↑ débit vasa recta\n' +
        '4. <b>Abolition du gradient CP</b> → interstitium reste à 300 mosm du cortex à la papille\n' +
        '5. Même avec ADH : urines ne peuvent être concentrées à > <b>300 mOsm/L</b>\n' +
        '6. <b>Polyurie iso-osmotique</b> → polydipsie compensatrice\n' +
        '⚠ Risque de déshydratation ++',
      order_index: 42,
    },
    {
      recto: 'Comparer les 4 situations de diurèse en termes d\'osmolalité et de débit urinaire',
      verso:
        '· <b>Normale</b> : ADH partielle → osm <b>600</b> mosm/L, débit <b>1,5 L/j</b>\n' +
        '· <b>Antidiurèse</b> : ADH max → osm <b>1200</b> mosm/L, débit <b>750 mL/j</b>\n' +
        '· <b>Diabète insipide</b> : pas d\'ADH → osm <b>60</b> mosm/L, débit <b>15 L/j</b>\n' +
        '· <b>Diurèse osmotique</b> : gradient CP aboli → osm ≤ <b>300</b> mosm/L, polyurie\n\n' +
        'Dans les 3 premières situations : excrétion de <b>900 mosm/j</b>',
      order_index: 43,
    },

    // ── Diurétiques ─────────────────────────────────────────────────────
    {
      recto: 'Quel est le mécanisme d\'action du Furosémide ?',
      verso:
        'Site d\'action : <b>branche ascendante large</b> de l\'anse de Henlé\n\n' +
        'Mécanisme : inhibe le cotransporteur <b>Na⁺/K⁺/2Cl⁻</b>\n\n' +
        'Conséquences :\n' +
        '· Suppression de l\'effet élémentaire → <b>suppression du gradient CP</b>\n' +
        '· Rein ne peut plus concentrer les urines\n' +
        '→ Diurétique de l\'anse = <b>diurétique puissant</b>',
      order_index: 44,
    },
    {
      recto: 'Quel est le mécanisme d\'action des inhibiteurs de l\'anhydrase carbonique ?',
      verso:
        'Site d\'action : <b>tube contourné proximal</b>\n\n' +
        'Mécanisme : bloquent l\'<b>anhydrase carbonique</b>\n' +
        '→ Bloquent la réabsorption de <b>HCO₃⁻</b> et Na⁺ dans le proximal\n\n' +
        '→ Peu utilisés en pratique clinique',
      order_index: 45,
    },
    {
      recto: 'Résumer les sites d\'action des principaux diurétiques sur le néphron',
      verso:
        '· Inhibiteurs anhydrase carbonique → <b>PROXIMAL</b>\n' +
        '· <b>Furosémide</b> → branche <b>ASCENDANTE LARGE</b> (anse) — inhibe Na/K/2Cl\n' +
        '  → Suppression gradient CP → diurétique puissant\n\n' +
        'Rappel (hors cours) :\n' +
        '· Thiazides → TCD\n' +
        '· Spironolactone → canal collecteur',
      order_index: 46,
    },

    // ── Récapitulatifs et pièges ─────────────────────────────────────────
    {
      recto: 'Pourquoi dit-on que la diurèse osmotique au glucose est très grave ?',
      verso:
        'Car elle perturbe la réabsorption dans le <b>proximal</b> = site où <b>2/3 du sodium et de l\'eau</b> sont normalement réabsorbés\n\n' +
        '→ Débit énorme en fin de proximal → ne peut pas être rattrapé dans la suite du tubule\n\n' +
        '→ Abolition du gradient CP : l\'ADH est présente et <b>fonctionne</b> mais est <b>inefficace</b>\n' +
        '  (collecteur perméable mais rien pour attirer l\'eau = plus de gradient)\n\n' +
        '→ Polyurie iso-osmotique ≤ 300 mosm/L → polydipsie → risque déshydratation',
      order_index: 47,
    },
    {
      recto: 'Comment l\'angiotensine II déclenche-t-elle la soif en cas de diminution de volémie ?',
      verso:
        'Baisse de volémie > <b>13 %</b> → risque vital\n\n' +
        '→ <b>Barorécepteurs intra-rénaux</b> activés\n' +
        '→ Système <b>sympathique</b> activé\n' +
        '→ Sécrétion de <b>rénine</b> par l\'appareil juxtaglomérulaie\n' +
        '→ Rénine → <b>angiotensine II</b>\n' +
        '→ Angiotensine II = molécule <b>dipsogène</b> (donne soif)\n\n' +
        'C\'est une voie d\'urgence pour compenser une déshydratation sévère',
      order_index: 48,
    },
    {
      recto: 'Quelle est la particularité historique qui distingue diabète insipide et diabète sucré ?',
      verso:
        '<b>Diabète insipide</b> : "insipide" = urines <b>sans saveur</b> (sans glucose, très diluées)\n\n' +
        '<b>Diabète sucré</b> : urines peuvent avoir un goût sucré\n' +
        '→ Glycosurie car glycémie > seuil de transport max du glucose dans le proximal\n\n' +
        'Au XVIIIe siècle : distinction faite en <b>goûtant les urines</b> en l\'absence de tests biologiques !',
      order_index: 49,
    },
  ],

  annales: [],
};

export default content;

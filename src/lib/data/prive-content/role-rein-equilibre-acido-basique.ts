import type { PriveCourseContent } from '../prive-courses';

const content: PriveCourseContent = {
  fiche: {
    parties: [
      {
        numero: 'I',
        titre: 'Rôle du rein dans l\'équilibre acido-basique',
        sous_parties: [
          {
            titre: 'Réabsorption des bicarbonates',
            rows: [
              { concept: '◆ Site principal', detail_md: '**Ultra-majoritaire dans le tube contourné proximal (TCP)** : 70-85% des HCO3⁻ filtrés y sont réabsorbés\nLe reste est réabsorbé dans l\'anse de Henlé et le néphron distal', kind: 'a_retenir' },
              { concept: 'Mécanisme', detail_md: '**Antiport Na⁺/H⁺ luminal** + **pompe à protons** : sécrétion de H⁺ dans la lumière tubulaire\nH⁺ + HCO3⁻ filtré → H2CO3 → CO2 + H2O (réaction catalysée par l\'anhydrase carbonique luminale)\nCO2 diffuse dans la cellule → CO2 + H2O → H2CO3 → H⁺ + HCO3⁻ → HCO3⁻ passe en basolatéral', kind: 'normal' },
              { concept: '◆ Principe clé', detail_md: 'Quand on **sécrète des protons**, on **régénère des bicarbonates** :\n1 H⁺ sécrété = 1 HCO3⁻ régénéré', kind: 'a_retenir' },
              { concept: '⚠ Piège TCP', detail_md: 'La sécrétion de H⁺ au TCP sert avant tout à **réabsorber les HCO3⁻ filtrés**, et n\'aboutit PAS à une excrétion nette d\'acide à ce niveau', kind: 'piege' },
            ],
          },
          {
            titre: 'Excrétion de la charge acide',
            rows: [
              { concept: '◆ Deux formes d\'excrétion', detail_md: '**1/3 sous forme d\'acidité titrable** : phosphates acides (HPO4²⁻ → H2PO4⁻), acide urique, créatinine\n**2/3 sous forme d\'ions ammonium (NH4⁺)** = mécanisme principal et le plus adaptable', kind: 'a_retenir' },
              { concept: 'Charge acide normale', detail_md: 'Excrétion de la charge acide normale = **60 à 80 mmol/24H** de protons', kind: 'a_retenir' },
              { concept: 'Gradient cortico-papillaire', detail_md: 'Il existe un **gradient cortico-papillaire en ammoniac (NH3)** qui facilite l\'excrétion de NH4⁺ dans le canal collecteur médullaire', kind: 'normal' },
              { concept: '⚠ Adaptabilité', detail_md: 'L\'acidité titrable est **peu adaptable** (dépend de la quantité de tampons filtrés)\nL\'excrétion de NH4⁺ est le mécanisme adaptatif **essentiel** : peut augmenter d\'un facteur **5 à 10**', kind: 'piege' },
            ],
          },
          {
            titre: 'Facteurs modulant l\'excrétion de NH4⁺',
            rows: [
              { concept: '◆ 4 facteurs augmentant NH4⁺ urinaire', detail_md: '1. **Diminution du pH urinaire** : favorise captation H⁺ par NH3 → NH4⁺\n2. **Mise en jeu de l\'aldostérone** : stimule sécrétion H⁺\n3. **Augmentation du débit urinaire** : favorise diffusion NH3 vers fluide tubulaire\n4. **Acidose plasmatique aiguë ou chronique** = LE PLUS IMPORTANT', kind: 'a_retenir' },
              { concept: 'Mécanisme de l\'acidose sur NH4⁺', detail_md: '**TCP** : la glutaminase est sensible au pH, induite par l\'acidose → ↑synthèse NH4⁺\n**Branche ascendante anse Henlé** : ↑transport NaK2Cl, NH4⁺ prend la place du K⁺ → favorise gradient cortico-papillaire en NH3\n**Canal collecteur** : favorise excrétion acide', kind: 'normal' },
              { concept: '◆ Acidose AIGUË', detail_md: 'a. ↑ sécrétions acides\nb. Acidification des urines\nc. Mobilisation du NH3 stocké dans la médullaire via gradient cortico-papillaire\nProduction NH3 : 30-70 mmol/j', kind: 'a_retenir' },
              { concept: '◆ Acidose CHRONIQUE', detail_md: '↑ ammoniogenèse (production NH4⁺ au TCP)\nStockage accru de NH3 dans la médullaire\n↑ capacité tampon → urines **MOINS acides** qu\'en aigu\nProduction NH3 peut atteindre **300 mmol/j**', kind: 'a_retenir' },
              { concept: '⚠ Aigu vs Chronique', detail_md: 'En acidose **aiguë** : urines très acides (mobilisation NH3 stocké)\nEn acidose **chronique** : urines MOINS acides malgré une production de NH4⁺ bien supérieure (car ↑ capacité tampon)', kind: 'piege' },
            ],
          },
          {
            titre: 'Réponse tubulaire à l\'acidose',
            rows: [
              { concept: '◆ TCP + anse de Henlé', detail_md: 'Stimulation de l\'**antiport Na⁺/H⁺ luminal** → réabsorption complète des HCO3⁻ filtrés', kind: 'a_retenir' },
              { concept: '◆ Cellules intercalaires ALPHA', detail_md: 'Néphron distal : stimulation de la **pompe à protons luminale** → ↑excrétion acide + régénération HCO3⁻\n**1 H⁺ sécrété = 1 HCO3⁻ régénéré**', kind: 'a_retenir' },
              { concept: '◆ Cellules intercalaires BÊTA', detail_md: 'En acidose : **inhibition** de la pompe à protons basolatérale → pas de sécrétion de HCO3⁻\nEn alcalose : effet **parfaitement inverse** (sécrétion de HCO3⁻)', kind: 'a_retenir' },
              { concept: 'Mnémo Alpha/Bêta', detail_md: '**Alpha** = sécrète l\'**Acide** (H⁺) en luminal → actif en acidose\n**Bêta** = sécrète la **Base** (HCO3⁻) en luminal → actif en alcalose', kind: 'mnemo' },
            ],
          },
        ],
      },
      {
        numero: 'II',
        titre: 'Interprétation des gaz du sang',
        sous_parties: [
          {
            titre: 'Les 3 questions fondamentales',
            rows: [
              { concept: '◆ Démarche systématique', detail_md: '**1. Acidose ou alcalose ?** → Regarder le pH\n**2. Respiratoire ou métabolique ?** → PCO2 et bicarbonatémie : leur variation EXPLIQUE-t-elle le pH ou va en sens inverse ?\n**3. Compensée ou non ?** Partiellement ou totalement ?\nSi trouble **mixte** : pas de compensation possible par définition', kind: 'a_retenir' },
            ],
          },
          {
            titre: 'Valeurs normales',
            rows: [
              { concept: '◆ pH', detail_md: '**7,38 - 7,42**', kind: 'a_retenir' },
              { concept: '◆ PaCO2', detail_md: '**35 - 45 mmHg** (valeur moyenne : 40 mmHg)', kind: 'a_retenir' },
              { concept: '◆ HCO3⁻', detail_md: '**22 - 28 mmol/L** (23-26 en physiologie stricte)', kind: 'a_retenir' },
              { concept: '◆ PaO2', detail_md: '**80 - 100 mmHg**', kind: 'a_retenir' },
            ],
          },
          {
            titre: 'Troubles acido-basiques simples',
            rows: [
              { concept: 'Acidose respiratoire', detail_md: 'pH↓, **PCO2↑** (hypoventilation)', kind: 'normal' },
              { concept: 'Alcalose respiratoire', detail_md: 'pH↑, **PCO2↓** (hyperventilation)', kind: 'normal' },
              { concept: 'Acidose métabolique', detail_md: 'pH↓, **HCO3⁻↓**', kind: 'normal' },
              { concept: 'Alcalose métabolique', detail_md: 'pH↑, **HCO3⁻↑**', kind: 'normal' },
              { concept: '◆ Troubles mixtes', detail_md: '**Acidose mixte** : pH↓, PCO2↑, HCO3⁻↓\n**Alcalose mixte** : pH↑, PCO2↓, HCO3⁻↑', kind: 'a_retenir' },
            ],
          },
          {
            titre: 'Cas difficiles : pH normal',
            rows: [
              { concept: '◆ Trouble compensé', detail_md: 'pH normal + anomalie HCO3⁻ ou PCO2 → **trouble compensé**', kind: 'a_retenir' },
              { concept: 'Comment départager', detail_md: 'a) **Contexte clinique**\nb) **Fréquence** : acidoses > alcaloses ; le rein peut compenser parfaitement une acidose respiratoire ; l\'alcalose métabolique n\'inhibe que modérément les centres respiratoires\nc) **Oxygénation** : acidose respiratoire = hypoxémie profonde/disproportionnée ; alcalose métabolique compensée = hypoxie modérée, proportionnelle\nd) Examen clinique + examens complémentaires', kind: 'normal' },
            ],
          },
        ],
      },
      {
        numero: 'III',
        titre: 'Troubles métaboliques',
        sous_parties: [
          {
            titre: 'Acidose métabolique : causes',
            rows: [
              { concept: 'Exercice physique', detail_md: 'Accumulation d\'**acide lactique** → acidose transitoire → hyperventilation compensatrice → normalisation rapide (pas de mise en jeu rénale)', kind: 'normal' },
              { concept: '◆ Acidocétose diabétique', detail_md: 'Déficit en insuline → **corps cétoniques acides** → acidose sévère\nPeut être **mode de révélation du diabète type 1**\nPatient peut se présenter avec **dyspnée** (hyperventilation compensatrice) et SpO2 à 100%', kind: 'a_retenir' },
              { concept: 'Maladie de Crohn', detail_md: 'Diarrhées → **pertes digestives de HCO3⁻** (selles basiques) → acidose métabolique', kind: 'normal' },
              { concept: '◆ Insuffisance rénale', detail_md: 'IRA ou IRC : ↓DFG → ↓capacité d\'excrétion de la charge acide = cause **TRÈS FRÉQUENTE**', kind: 'a_retenir' },
              { concept: 'Acidose lactique d\'état de choc', detail_md: 'Hypoxie tissulaire → glycolyse anaérobie → **acide lactique**', kind: 'normal' },
            ],
          },
          {
            titre: 'Acidose métabolique : compensation',
            rows: [
              { concept: '◆ 3 temps de compensation', detail_md: '**1. INSTANTANÉ** : mise en jeu des tampons → ↓HCO3⁻\n**2. RAPIDE (secondes)** : hyperventilation → ↓PCO2 (compensation respiratoire)\n**3. RETARDÉ (heures-jours)** : mise en jeu rénale si acidose prolongée → réabsorption complète HCO3⁻, ↑production NH4⁺, ↑excrétion charge acide, régénération HCO3⁻', kind: 'a_retenir' },
            ],
          },
          {
            titre: 'Trou anionique',
            rows: [
              { concept: '◆ Formule', detail_md: '**TA = Natrémie − (Chlorémie + Bicarbonatémie)**\nValeur normale ≈ **12 mmol/L**\nAnions non dosés : protéines, phosphates, sulfates', kind: 'a_retenir' },
              { concept: '◆ TA AUGMENTÉ', detail_md: 'Insuffisance rénale, acidose lactique, acidocétose\n→ Accumulation d\'anions acides non dosés', kind: 'a_retenir' },
              { concept: '◆ TA NORMAL', detail_md: 'Diarrhées, pertes digestives de HCO3⁻, acidoses tubulo-rénales\n→ Perte de HCO3⁻ compensée par ↑Cl⁻ (acidose hypercholorémique)', kind: 'a_retenir' },
            ],
          },
          {
            titre: 'Alcalose métabolique',
            rows: [
              { concept: '◆ Causes', detail_md: '**Perte d\'acide** : vomissements répétés, aspiration gastrique par sonde nasogastrique\n**Iatrogène** : diurétiques (presque tous sauf spironolactone)\n**Perfusion excessive de bicarbonates**', kind: 'a_retenir' },
              { concept: 'Diagnostic', detail_md: 'pH > 7,42, **HCO3⁻↑**', kind: 'normal' },
              { concept: 'Compensation respiratoire', detail_md: 'Hypoventilation **MODÉRÉE** (rarement suffisante pour normaliser le pH)\nLes centres respiratoires ne sont que modérément sensibles à l\'alcalose', kind: 'normal' },
              { concept: 'Compensation rénale', detail_md: '↓réabsorption HCO3⁻ + sécrétion HCO3⁻ par les **cellules intercalaires β**', kind: 'normal' },
            ],
          },
        ],
      },
      {
        numero: 'IV',
        titre: 'Troubles respiratoires',
        sous_parties: [
          {
            titre: 'Acidose respiratoire',
            rows: [
              { concept: 'Définition', detail_md: '↑PaCO2 (**hypercapnie**) = défaillance ventilatoire', kind: 'normal' },
              { concept: '◆ Causes', detail_md: '**BPCO**, maladies neuromusculaires, insuffisance respiratoire chronique\nDilatation des bronches (mucoviscidose) → peut évoluer comme BPCO', kind: 'a_retenir' },
              { concept: '⚠ PAS l\'asthme', detail_md: 'Crises d\'asthme = hyperventilation → **hypocapnie** (alcalose respiratoire)\n**Capnie NORMALE** pendant une crise d\'asthme = signe de **GRAVITÉ** = épuisement respiratoire', kind: 'piege' },
              { concept: '◆ Compensation rénale (chronique)', detail_md: '↑excrétion acide rénale + ↑régénération HCO3⁻\nChaque H⁺ excrété → 1 HCO3⁻ régénéré\n**HCO3⁻ TRÈS augmentée = signe d\'hypercapnie CHRONIQUE**', kind: 'a_retenir' },
              { concept: '⚠ Petite vs grande ↑HCO3⁻', detail_md: '**Petite ↑HCO3⁻** = mise en jeu du tampon bicarbonate (PAS compensation rénale)\n**Nette ↑HCO3⁻** = compensation rénale = perturbation **CHRONIQUE**', kind: 'piege' },
              { concept: 'Tampons intracellulaires', detail_md: 'L\'**hémoglobine** (dans les GR) intervient comme tampon dans l\'acidose respiratoire\nCar HCO3⁻ ne peut PAS tamponner le CO2', kind: 'normal' },
            ],
          },
          {
            titre: 'Alcalose respiratoire',
            rows: [
              { concept: 'Définition', detail_md: '↓PaCO2 (**hypocapnie**) = hyperventilation', kind: 'normal' },
              { concept: 'Fréquence', detail_md: 'Très fréquente en **AIGU**, rare en chronique', kind: 'normal' },
              { concept: '◆ Compensation rénale', detail_md: 'Si persistante : rein → ↑pH intracellulaire tubulaire → ↓réabsorption HCO3⁻ → excrétion urinaire de HCO3⁻ = **bicarbonaturie**', kind: 'a_retenir' },
              { concept: '⚠ Bicarbonaturie', detail_md: 'La bicarbonaturie **n\'existe PAS en physiologie normale** : tous les HCO3⁻ filtrés sont normalement réabsorbés\nSa présence traduit une compensation rénale d\'une alcalose', kind: 'piege' },
            ],
          },
        ],
      },
      {
        numero: 'V',
        titre: 'Troubles mixtes et cas difficiles',
        sous_parties: [
          {
            titre: 'Identification des troubles mixtes',
            rows: [
              { concept: '◆ Acidose mixte', detail_md: 'pH↓, hypercapnie, HCO3⁻↓\n**Attention** : dans une acidose respiratoire pure, HCO3⁻ devrait ↑ (compensation) → si HCO3⁻↓ = composante métabolique associée', kind: 'a_retenir' },
              { concept: '◆ Alcalose mixte', detail_md: 'Hypocapnie, HCO3⁻↑\nEn hypocapnie, HCO3⁻ devrait ↓ → si HCO3⁻↑ = composante métabolique associée', kind: 'a_retenir' },
              { concept: '⚠ Pas de compensation', detail_md: 'Si trouble **mixte** : pas de compensation possible par définition (les deux perturbations vont dans le même sens)', kind: 'piege' },
              { concept: 'Départager pH normal', detail_md: 'pH normal + PCO2/HCO3⁻ anormaux :\na) Contexte clinique\nb) Fréquence (acidoses > alcaloses)\nc) PaO2 : acidose respiratoire = hypoxémie profonde ; alcalose métabolique compensée = hypoxie modérée\nd) Examen clinique', kind: 'normal' },
            ],
          },
        ],
      },
    ],
    points_cles: [
      'Le TCP réabsorbe 70-85% des HCO3⁻ filtrés via l\'antiport Na⁺/H⁺',
      '1 H⁺ sécrété = 1 HCO3⁻ régénéré',
      'Excrétion acide : 2/3 NH4⁺ (adaptable x5-10) + 1/3 acidité titrable (peu adaptable)',
      'Charge acide normale = 60-80 mmol/24H de H⁺',
      'L\'acidose chronique ↑ ammoniogenèse (30-70 → 300 mmol/j de NH3)',
      'Cellules intercalaires α = excrétion H⁺ (acidose) ; β = excrétion HCO3⁻ (alcalose)',
      'Gaz du sang : pH 7,38-7,42 / PCO2 35-45 / HCO3⁻ 22-28 / PaO2 80-100',
      'Trou anionique = Na⁺ − (Cl⁻ + HCO3⁻) ≈ 12 mmol/L',
      'TA ↑ = accumulation acides (IR, lactates, cétones) ; TA normal = pertes HCO3⁻',
      'Capnie normale pendant crise d\'asthme = signe de GRAVITÉ',
      'Bicarbonaturie n\'existe PAS en physiologie normale',
      'HCO3⁻ très augmentée = compensation rénale = hypercapnie CHRONIQUE',
    ],
    chiffres_cles: {
      titre: 'Chiffres clés de l\'équilibre acido-basique',
      markdown: '| Paramètre | Valeur normale |\n|---|---|\n| pH artériel | 7,38 - 7,42 |\n| PaCO2 | 35 - 45 mmHg (moy. 40) |\n| HCO3⁻ | 22 - 28 mmol/L |\n| PaO2 | 80 - 100 mmHg |\n| Trou anionique | ≈ 12 mmol/L |\n| Charge acide excrétée | 60 - 80 mmol/24H |\n| Réabsorption HCO3⁻ au TCP | 70 - 85% |\n| NH3 production normale | 30 - 70 mmol/j |\n| NH3 en acidose chronique | jusqu\'à 300 mmol/j |\n| Facteur d\'adaptation NH4⁺ | x 5 à 10 |\n| pH urinaire minimal | 4 |\n| Excrétion acide : NH4⁺ | 2/3 |\n| Excrétion acide : acidité titrable | 1/3 |',
    },
  },
  flashcards: [
    // === I. Réabsorption des bicarbonates ===
    { recto: 'Où sont réabsorbés la majorité des HCO3⁻ filtrés ?', verso: 'Dans le <b>tube contourné proximal (TCP)</b>\n<b>70-85%</b> des HCO3⁻ filtrés y sont réabsorbés', order_index: 1 },
    { recto: 'Quels sont les mécanismes de sécrétion de H⁺ au TCP ?', verso: '· <b>Antiport Na⁺/H⁺ luminal</b>\n· <b>Pompe à protons</b>', order_index: 2 },
    { recto: 'Quelle est la relation entre sécrétion de H⁺ et régénération de HCO3⁻ ?', verso: '<b>1 H⁺ sécrété = 1 HCO3⁻ régénéré</b>\nLa sécrétion de protons permet la régénération des bicarbonates', order_index: 3 },
    { recto: 'La sécrétion de H⁺ au TCP aboutit-elle à une excrétion nette d\'acide ?', verso: '<b>Non</b>\nAu TCP, la sécrétion de H⁺ sert avant tout à <b>réabsorber les HCO3⁻ filtrés</b>, pas à excréter de l\'acide', order_index: 4 },
    { recto: 'Que devient le H⁺ sécrété dans la lumière du TCP quand il rencontre HCO3⁻ ?', verso: 'H⁺ + HCO3⁻ → H2CO3 → <b>CO2 + H2O</b>\n(réaction catalysée par l\'anhydrase carbonique luminale)\nLe CO2 diffuse dans la cellule et regénère HCO3⁻', order_index: 5 },

    // === I. Excrétion de la charge acide ===
    { recto: 'Sous quelles formes le rein excrète-t-il la charge acide ?', verso: '· <b>1/3 acidité titrable</b> (phosphates acides, acide urique, créatinine)\n· <b>2/3 ions ammonium (NH4⁺)</b> = mécanisme principal', order_index: 6 },
    { recto: 'Quel est le mécanisme principal d\'excrétion rénale d\'acide ?', verso: 'L\'excrétion d\'<b>ions ammonium (NH4⁺)</b>\nReprésente <b>2/3</b> de l\'excrétion acide totale\nC\'est le mécanisme le plus <b>adaptable</b>', order_index: 7 },
    { recto: 'Quelle est la valeur normale de l\'excrétion de la charge acide ?', verso: '<b>60 à 80 mmol/24H</b> de protons', order_index: 8 },
    { recto: 'Qu\'est-ce que l\'acidité titrable ?', verso: 'Excrétion d\'acide sous forme <b>tamponnée</b> par :\n· Phosphates acides (HPO4²⁻ → H2PO4⁻)\n· Acide urique\n· Créatinine\nReprésente <b>1/3</b> de l\'excrétion acide', order_index: 9 },
    { recto: 'Qu\'est-ce que le gradient cortico-papillaire en ammoniac ?', verso: 'Gradient de concentration en <b>NH3</b> entre le cortex et la papille rénale\nFacilite l\'excrétion de NH4⁺ dans le <b>canal collecteur médullaire</b>', order_index: 10 },
    { recto: 'Comparer l\'adaptabilité de l\'acidité titrable et de l\'excrétion de NH4⁺', verso: '· <b>Acidité titrable</b> = peu adaptable (dépend des tampons filtrés)\n· <b>NH4⁺</b> = mécanisme adaptatif essentiel, peut augmenter d\'un facteur <b>5 à 10</b>', order_index: 11 },

    // === I. Facteurs modulant NH4+ ===
    { recto: 'Citer les 4 facteurs augmentant l\'excrétion urinaire de NH4⁺', verso: '1. <b>Diminution du pH urinaire</b>\n2. <b>Aldostérone</b>\n3. <b>Augmentation du débit urinaire</b>\n4. <b>Acidose plasmatique</b> (le plus important)', order_index: 12 },
    { recto: 'Quel est le facteur LE PLUS IMPORTANT augmentant l\'excrétion de NH4⁺ ?', verso: 'L\'<b>acidose plasmatique aiguë ou chronique</b>', order_index: 13 },
    { recto: 'Comment l\'acidose stimule-t-elle la production de NH4⁺ au TCP ?', verso: 'La <b>glutaminase</b> est sensible au pH et est <b>induite par l\'acidose</b>\n→ ↑synthèse de NH4⁺ à partir de la glutamine', order_index: 14 },
    { recto: 'Quel rôle joue la branche ascendante de l\'anse de Henlé dans l\'excrétion de NH4⁺ ?', verso: '↑transport <b>NaK2Cl</b> : NH4⁺ prend la place du K⁺\n→ Favorise le <b>gradient cortico-papillaire en NH3</b>', order_index: 15 },
    { recto: 'Que se passe-t-il au niveau rénal lors d\'une acidose AIGUË ? (3 mécanismes)', verso: 'a. <b>↑ sécrétions acides</b>\nb. <b>Acidification des urines</b>\nc. <b>Mobilisation du NH3 stocké</b> dans la médullaire via gradient cortico-papillaire', order_index: 16 },
    { recto: 'Que se passe-t-il au niveau rénal lors d\'une acidose CHRONIQUE ? (3 mécanismes)', verso: '· <b>↑ ammoniogenèse</b> (production NH4⁺ au TCP)\n· <b>Stockage accru de NH3</b> dans la médullaire\n· <b>↑ capacité tampon</b> → urines MOINS acides qu\'en aigu', order_index: 17 },
    { recto: 'En acidose aiguë, les urines sont-elles plus ou moins acides qu\'en acidose chronique ?', verso: '<b>Plus acides en aigu</b>\nEn chronique : la production de NH4⁺ augmente (↑ capacité tampon) → les urines sont <b>moins acides</b> malgré une excrétion acide plus importante', order_index: 18 },
    { recto: 'De combien peut augmenter la production de NH3 entre situation normale et charge acide ?', verso: 'D\'un facteur <b>5 à 10</b>\n· Normal : 30-70 mmol/j\n· Acidose chronique : jusqu\'à <b>300 mmol/j</b>', order_index: 19 },
    { recto: 'Quelle est la production normale de NH3 et en acidose chronique ?', verso: '· Normal : <b>30-70 mmol/j</b>\n· Acidose chronique : jusqu\'à <b>300 mmol/j</b>', order_index: 20 },
    { recto: 'L\'aldostérone augmente ou diminue l\'excrétion urinaire d\'acides ?', verso: 'Elle l\'<b>augmente</b>\nL\'aldostérone stimule la sécrétion de H⁺ par les cellules intercalaires α du canal collecteur', order_index: 21 },

    // === I. Réponse tubulaire ===
    { recto: 'Comment réagit le TCP à l\'acidose ?', verso: 'Stimulation de l\'<b>antiport Na⁺/H⁺ luminal</b>\n→ Réabsorption complète des HCO3⁻ filtrés', order_index: 22 },
    { recto: 'Quel est le rôle des cellules intercalaires ALPHA en acidose ?', verso: 'Stimulation de la <b>pompe à protons luminale</b>\n→ ↑excrétion acide + régénération HCO3⁻\n<b>1 H⁺ sécrété = 1 HCO3⁻ régénéré</b>', order_index: 23 },
    { recto: 'Quel est le rôle des cellules intercalaires BÊTA en acidose ?', verso: '<b>Inhibition</b> de la pompe à protons basolatérale\n→ Pas de sécrétion de HCO3⁻\n(en alcalose : effet parfaitement inverse)', order_index: 24 },
    { recto: 'Comment différencier les cellules intercalaires α et β ?', verso: '<b>Alpha</b> = sécrète l\'<b>Acide</b> (H⁺) en luminal → actif en acidose\n<b>Bêta</b> = sécrète la <b>Base</b> (HCO3⁻) en luminal → actif en alcalose', order_index: 25 },
    { recto: 'En alcalose, que font les cellules intercalaires α et β ?', verso: 'Effet <b>parfaitement inverse</b> de l\'acidose :\n· Cellules α : <b>inhibition</b> de la pompe à protons luminale\n· Cellules β : <b>activation</b> de la pompe à protons basolatérale → sécrétion de HCO3⁻', order_index: 26 },
    { recto: 'Où se situe la pompe à protons dans les cellules intercalaires α ?', verso: 'Sur la <b>membrane luminale (apicale)</b>\n→ Sécrète les H⁺ dans la lumière tubulaire', order_index: 27 },

    // === II. Gaz du sang ===
    { recto: 'Quelles sont les 3 questions fondamentales pour interpréter les gaz du sang ?', verso: '1. <b>Acidose ou alcalose ?</b> → regarder le pH\n2. <b>Respiratoire ou métabolique ?</b> → PCO2 et HCO3⁻\n3. <b>Compensée ou non ?</b> Partiellement/totalement ?', order_index: 28 },
    { recto: 'Quelle est la valeur normale du pH artériel ?', verso: '<b>7,38 - 7,42</b>', order_index: 29 },
    { recto: 'Quelle est la valeur normale de la PaCO2 ?', verso: '<b>35 - 45 mmHg</b> (valeur moyenne : 40 mmHg)', order_index: 30 },
    { recto: 'Quelle est la valeur normale des bicarbonates plasmatiques ?', verso: '<b>22 - 28 mmol/L</b>\n(23-26 en physiologie stricte)', order_index: 31 },
    { recto: 'Quelle est la valeur normale de la PaO2 ?', verso: '<b>80 - 100 mmHg</b>', order_index: 32 },
    { recto: 'Comment caractériser une acidose respiratoire aux gaz du sang ?', verso: '<b>pH↓</b> + <b>PCO2↑</b> (hypoventilation = hypercapnie)', order_index: 33 },
    { recto: 'Comment caractériser une alcalose respiratoire aux gaz du sang ?', verso: '<b>pH↑</b> + <b>PCO2↓</b> (hyperventilation = hypocapnie)', order_index: 34 },
    { recto: 'Comment caractériser une acidose métabolique aux gaz du sang ?', verso: '<b>pH↓</b> + <b>HCO3⁻↓</b>', order_index: 35 },
    { recto: 'Comment caractériser une alcalose métabolique aux gaz du sang ?', verso: '<b>pH↑</b> + <b>HCO3⁻↑</b>', order_index: 36 },
    { recto: 'Quels sont les paramètres d\'une acidose mixte ?', verso: '<b>pH↓</b>, <b>PCO2↑</b>, <b>HCO3⁻↓</b>\n(les deux composantes vont dans le même sens)', order_index: 37 },
    { recto: 'Quels sont les paramètres d\'une alcalose mixte ?', verso: '<b>pH↑</b>, <b>PCO2↓</b>, <b>HCO3⁻↑</b>\n(les deux composantes vont dans le même sens)', order_index: 38 },
    { recto: 'Peut-on parler de compensation dans un trouble mixte ?', verso: '<b>Non</b>\nDans un trouble mixte, <b>pas de compensation possible</b> par définition (les deux perturbations vont dans le même sens)', order_index: 39 },
    { recto: 'Comment interpréter un pH normal avec PCO2 et/ou HCO3⁻ anormaux ?', verso: 'C\'est un <b>trouble compensé</b>\nPour départager : contexte clinique, fréquence (acidoses > alcaloses), PaO2, examen clinique', order_index: 40 },

    // === III. Acidose métabolique ===
    { recto: 'Citer 5 causes d\'acidose métabolique', verso: '1. <b>Exercice physique</b> (acide lactique)\n2. <b>Acidocétose diabétique</b>\n3. <b>Maladie de Crohn</b> (pertes digestives HCO3⁻)\n4. <b>Insuffisance rénale</b> (IRA/IRC)\n5. <b>Acidose lactique d\'état de choc</b>', order_index: 41 },
    { recto: 'Pourquoi l\'acidocétose diabétique provoque-t-elle une acidose ?', verso: 'Déficit en <b>insuline</b> → production de <b>corps cétoniques acides</b> → acidose sévère\nPeut être le <b>mode de révélation du diabète type 1</b>', order_index: 42 },
    { recto: 'Comment un patient en acidocétose diabétique peut-il se présenter ?', verso: 'Avec une <b>dyspnée</b> (hyperventilation compensatrice) et une <b>SpO2 à 100%</b>\nC\'est la compensation respiratoire de l\'acidose métabolique', order_index: 43 },
    { recto: 'Pourquoi la maladie de Crohn provoque-t-elle une acidose métabolique ?', verso: 'Diarrhées → <b>pertes digestives de HCO3⁻</b>\n(les selles sont <b>basiques</b>)\n→ Acidose métabolique à trou anionique normal', order_index: 44 },
    { recto: 'Pourquoi l\'insuffisance rénale provoque-t-elle une acidose métabolique ?', verso: '↓DFG → <b>↓capacité d\'excrétion de la charge acide</b>\nC\'est une cause <b>très fréquente</b> d\'acidose métabolique', order_index: 45 },
    { recto: 'L\'acidose métabolique de l\'exercice physique met-elle en jeu le rein ?', verso: '<b>Non</b>\nAcidose transitoire → hyperventilation compensatrice → normalisation rapide\n<b>Pas de mise en jeu rénale</b>', order_index: 46 },
    { recto: 'Quels sont les 3 temps de compensation d\'une acidose métabolique ?', verso: '1. <b>Instantané</b> : tampons → ↓HCO3⁻\n2. <b>Rapide (secondes)</b> : hyperventilation → ↓PCO2\n3. <b>Retardé (heures-jours)</b> : mise en jeu rénale (↑NH4⁺, régénération HCO3⁻)', order_index: 47 },
    { recto: 'Quel est le mécanisme de compensation respiratoire d\'une acidose métabolique ?', verso: '<b>Hyperventilation</b> → <b>↓PCO2</b>\nCompensation rapide (en secondes)\nPeut être partielle ou complète', order_index: 48 },
    { recto: 'En quoi consiste la compensation rénale d\'une acidose métabolique prolongée ?', verso: '· Réabsorption complète de tous les HCO3⁻\n· <b>↑ production NH4⁺</b>\n· ↑ excrétion de la charge acide\n· <b>Régénération de HCO3⁻</b>', order_index: 49 },

    // === III. Trou anionique ===
    { recto: 'Quelle est la formule du trou anionique ?', verso: '<b>TA = Natrémie − (Chlorémie + Bicarbonatémie)</b>', order_index: 50 },
    { recto: 'Quelle est la valeur normale du trou anionique ?', verso: '≈ <b>12 mmol/L</b>\nCorrespond aux anions non dosés : protéines, phosphates, sulfates', order_index: 51 },
    { recto: 'Quelles sont les causes d\'acidose métabolique à trou anionique AUGMENTÉ ?', verso: '· <b>Insuffisance rénale</b>\n· <b>Acidose lactique</b>\n· <b>Acidocétose</b>\n→ Accumulation d\'anions acides non dosés', order_index: 52 },
    { recto: 'Quelles sont les causes d\'acidose métabolique à trou anionique NORMAL ?', verso: '· <b>Diarrhées</b> (pertes digestives HCO3⁻)\n· <b>Acidoses tubulo-rénales</b>\n→ Perte de HCO3⁻ compensée par ↑Cl⁻ (acidose hypercholorémique)', order_index: 53 },
    { recto: 'Pourquoi le trou anionique est-il normal dans les diarrhées ?', verso: 'La perte de HCO3⁻ est compensée par une <b>↑ du Cl⁻</b>\n→ Acidose <b>hypercholorémique</b>\n→ La somme Cl⁻ + HCO3⁻ reste stable → TA normal', order_index: 54 },

    // === III. Alcalose métabolique ===
    { recto: 'Citer les causes d\'alcalose métabolique', verso: '· <b>Vomissements répétés</b> / aspiration gastrique (SNG)\n· <b>Diurétiques</b> (presque tous sauf spironolactone)\n· <b>Perfusion excessive de bicarbonates</b>', order_index: 55 },
    { recto: 'Comment le rein compense-t-il une alcalose métabolique ?', verso: '· <b>↓ réabsorption des HCO3⁻</b>\n· <b>Sécrétion de HCO3⁻</b> par les cellules intercalaires β', order_index: 56 },
    { recto: 'La compensation respiratoire de l\'alcalose métabolique est-elle efficace ?', verso: '<b>Non</b>, elle est <b>modérée</b>\nHypoventilation modérée, rarement suffisante pour normaliser le pH\nLes centres respiratoires ne sont que modérément sensibles à l\'alcalose', order_index: 57 },
    { recto: 'Comment diagnostiquer une alcalose métabolique aux gaz du sang ?', verso: '<b>pH > 7,42</b> + <b>HCO3⁻ ↑</b>', order_index: 58 },

    // === IV. Acidose respiratoire ===
    { recto: 'Qu\'est-ce qu\'une acidose respiratoire ?', verso: '↑PaCO2 = <b>hypercapnie</b> = défaillance ventilatoire\n→ <b>pH↓</b>', order_index: 59 },
    { recto: 'Citer les causes d\'acidose respiratoire', verso: '· <b>BPCO</b>\n· Maladies neuromusculaires\n· Insuffisance respiratoire chronique\n· Dilatation des bronches (mucoviscidose)', order_index: 60 },
    { recto: 'L\'asthme provoque-t-il une acidose respiratoire ?', verso: '<b>Non !</b> Les crises d\'asthme = hyperventilation → <b>hypocapnie</b> (alcalose respiratoire)\nUne capnie <b>normale</b> pendant une crise d\'asthme = signe de <b>GRAVITÉ</b> = épuisement', order_index: 61 },
    { recto: 'Que signifie une capnie NORMALE pendant une crise d\'asthme ?', verso: 'C\'est un signe de <b>GRAVITÉ</b> = <b>épuisement respiratoire</b>\n(normalement la crise d\'asthme provoque une hypocapnie par hyperventilation)', order_index: 62 },
    { recto: 'En quoi consiste la compensation rénale de l\'acidose respiratoire chronique ?', verso: '· <b>↑ excrétion acide rénale</b>\n· <b>↑ régénération HCO3⁻</b>\n· Chaque H⁺ excrété = 1 HCO3⁻ régénéré\n→ HCO3⁻ très augmentée', order_index: 63 },
    { recto: 'Qu\'indique une HCO3⁻ TRÈS augmentée chez un patient hypercapnique ?', verso: 'C\'est le signe d\'une <b>hypercapnie CHRONIQUE</b>\n= Compensation rénale installée (heures à jours)', order_index: 64 },
    { recto: 'Qu\'indique une PETITE augmentation de HCO3⁻ en acidose respiratoire ?', verso: 'C\'est la mise en jeu du <b>tampon bicarbonate</b> (effet physico-chimique immédiat)\nCe n\'est <b>PAS</b> une compensation rénale', order_index: 65 },
    { recto: 'Pourquoi HCO3⁻ ne peut-il pas tamponner le CO2 en acidose respiratoire ?', verso: 'Car <b>HCO3⁻ ne peut PAS tamponner le CO2</b> (il en est le produit)\nCe sont les <b>tampons intracellulaires</b> (hémoglobine dans les GR) qui interviennent', order_index: 66 },
    { recto: 'Quel tampon intracellulaire intervient dans l\'acidose respiratoire ?', verso: 'L\'<b>hémoglobine</b> (dans les globules rouges)\nCar HCO3⁻ ne peut pas tamponner le CO2', order_index: 67 },

    // === IV. Alcalose respiratoire ===
    { recto: 'Qu\'est-ce qu\'une alcalose respiratoire ?', verso: '↓PaCO2 = <b>hypocapnie</b> = hyperventilation\n→ <b>pH↑</b>', order_index: 68 },
    { recto: 'L\'alcalose respiratoire est-elle plus fréquente en aigu ou en chronique ?', verso: 'Très fréquente en <b>AIGU</b>\n<b>Rare</b> en chronique', order_index: 69 },
    { recto: 'Comment le rein compense-t-il une alcalose respiratoire persistante ?', verso: '↑pH intracellulaire tubulaire → <b>↓ réabsorption HCO3⁻</b>\n→ Excrétion urinaire de HCO3⁻ = <b>bicarbonaturie</b>', order_index: 70 },
    { recto: 'La bicarbonaturie existe-t-elle en physiologie normale ?', verso: '<b>Non !</b>\nEn physiologie normale, <b>tous les HCO3⁻ filtrés sont réabsorbés</b>\nLa bicarbonaturie traduit une compensation rénale d\'une alcalose', order_index: 71 },

    // === V. Troubles mixtes ===
    { recto: 'Comment reconnaître une acidose mixte ?', verso: '<b>pH↓</b> + hypercapnie + <b>HCO3⁻↓</b>\nDans une acidose respiratoire pure, HCO3⁻ devrait ↑ (compensation)\n→ Si HCO3⁻↓ = composante métabolique associée', order_index: 72 },
    { recto: 'Comment reconnaître une alcalose mixte ?', verso: 'Hypocapnie + <b>HCO3⁻↑</b>\nEn hypocapnie, HCO3⁻ devrait ↓\n→ Si HCO3⁻↑ = composante métabolique associée', order_index: 73 },
    { recto: 'Comment distinguer une acidose respiratoire compensée d\'une alcalose métabolique compensée quand le pH est normal ?', verso: '· <b>Contexte clinique</b>\n· <b>Fréquence</b> : acidoses > alcaloses\n· <b>PaO2</b> : acidose respiratoire = hypoxémie profonde ; alcalose métabolique = hypoxie modérée\n· Examen clinique', order_index: 74 },
    { recto: 'Le rein peut-il compenser parfaitement une acidose respiratoire ?', verso: '<b>Oui</b>, le rein peut compenser parfaitement une acidose respiratoire chronique\n→ pH normal avec PCO2↑ et HCO3⁻↑', order_index: 75 },
    { recto: 'L\'alcalose métabolique peut-elle être parfaitement compensée par hypoventilation ?', verso: '<b>Rarement</b>\nL\'alcalose métabolique n\'inhibe que <b>modérément</b> les centres respiratoires\n→ Hypoventilation insuffisante pour normaliser le pH', order_index: 76 },

    // === Physiologie générale / Synthèse ===
    { recto: 'Quel est le principal tampon extracellulaire ?', verso: 'Le système <b>bicarbonate / CO2</b> (HCO3⁻ / H2CO3)', order_index: 77 },
    { recto: 'HCO3⁻ est-il le principal tampon intracellulaire ou extracellulaire ?', verso: '<b>Extracellulaire</b>\nLes principaux tampons intracellulaires sont les protéines et l\'hémoglobine', order_index: 78 },
    { recto: 'Les HCO3⁻ sont-ils librement filtrés par le rein ?', verso: '<b>Oui</b>, les HCO3⁻ sont <b>librement filtrés</b> au niveau glomérulaire', order_index: 79 },
    { recto: 'La bicarbonaturie est-elle habituellement nulle ?', verso: '<b>Oui</b>, elle est normalement <b>nulle ou quasi-nulle</b>\nEn physiologie, tous les HCO3⁻ filtrés sont réabsorbés', order_index: 80 },
    { recto: 'Le transport maximal (Tm) des HCO3⁻ est-il modifié en hypercapnie chronique ?', verso: '<b>Oui</b>, le Tm des HCO3⁻ est <b>augmenté</b> en cas d\'hypercapnie chronique\n→ Permet une réabsorption accrue des HCO3⁻', order_index: 81 },
    { recto: 'L\'essentiel des H⁺ produits est-il éliminé sous forme libre dans l\'urine ?', verso: '<b>Non !</b>\nLa majorité est excrétée sous forme <b>tamponnée</b> :\n· NH4⁺ (2/3)\n· Acidité titrable (1/3)\nLes H⁺ libres représentent < 5% (pH urinaire min = 4)', order_index: 82 },
    { recto: 'Quel est le pH urinaire minimal chez l\'Homme ?', verso: '<b>4</b>', order_index: 83 },
    { recto: 'La réabsorption proximale de HCO3⁻ est-elle couplée à la réabsorption de sodium ?', verso: '<b>Oui</b>\nVia l\'<b>antiport Na⁺/H⁺</b> : la réabsorption de Na⁺ est couplée à la sécrétion de H⁺ qui permet la réabsorption de HCO3⁻', order_index: 84 },
    { recto: 'La sécrétion acide rénale aboutit-elle toujours à une excrétion acide ?', verso: '<b>Non !</b>\nLa sécrétion de H⁺ peut aussi servir à <b>réabsorber les HCO3⁻ filtrés</b> (au TCP)\nDans ce cas, pas d\'excrétion nette d\'acide', order_index: 85 },
    { recto: 'La sécrétion acide rénale est-elle stimulée directement par l\'acidose extracellulaire ?', verso: '<b>Plutôt indirectement</b>\nC\'est la <b>↓ du pH intracellulaire tubulaire</b> qui stimule la sécrétion acide', order_index: 86 },
    { recto: 'L\'aldostérone stimule-t-elle la sécrétion acide proximale et distale ?', verso: '<b>Non</b>, surtout au niveau <b>DISTAL</b>\n(cellules intercalaires α du canal collecteur)\nPas d\'effet significatif au niveau proximal', order_index: 87 },
    { recto: 'L\'acidité titrable augmente ou diminue quand le pH urinaire diminue ?', verso: 'Elle <b>augmente</b>\nQuand pH urinaire ↓, plus de H⁺ sont sécrétés et tamponnés → <b>↑ acidité titrable</b>', order_index: 88 },
    { recto: 'L\'ammoniogenèse rénale est-elle stimulée par l\'acidose chronique ?', verso: '<b>Oui</b>\nL\'acidose chronique <b>induit la glutaminase</b> au TCP → ↑ production de NH4⁺\nProduction peut passer de 30-70 à 300 mmol/j', order_index: 89 },
    { recto: 'Quel est le mécanisme de l\'acidose lactique dans l\'état de choc ?', verso: '<b>Hypoxie tissulaire</b> → glycolyse <b>anaérobie</b> → production d\'<b>acide lactique</b>', order_index: 90 },

    // === Gazométrie - cas cliniques ===
    { recto: 'pH=7,38, PCO2=59, HCO3⁻=33 : quel diagnostic ?', verso: '<b>Acidose respiratoire parfaitement compensée</b>\n· pH normal (7,38)\n· PCO2↑ = hypercapnie = composante respiratoire\n· HCO3⁻↑ = compensation rénale (chronique)', order_index: 91 },
    { recto: 'pH=7,38, PCO2=59, HCO3⁻=33 : s\'agit-il d\'une alcalose métabolique ?', verso: '<b>Non !</b>\nLe pH est normal/légèrement acide (7,38)\nL\'↑HCO3⁻ est une <b>compensation</b> rénale de l\'hypercapnie, pas un trouble métabolique primaire', order_index: 92 },
    { recto: 'Chez un patient avec PCO2=59 et HCO3⁻=33, la ventilation alvéolaire est-elle diminuée ?', verso: '<b>Oui</b>\nPCO2 = 59 > 45 mmHg = <b>hypercapnie = hypoventilation alvéolaire</b>', order_index: 93 },
    { recto: 'Chez un patient hypercapnique chronique, le Tm des HCO3⁻ est-il augmenté ?', verso: '<b>Oui</b>\nL\'hypercapnie chronique → adaptation rénale → <b>↑ du transport maximal (Tm) des HCO3⁻</b>', order_index: 94 },
    { recto: 'L\'excrétion rénale acide est-elle augmentée chez un patient en acidose respiratoire compensée ?', verso: '<b>Oui</b>\nLa compensation rénale implique une <b>↑ excrétion acide</b> pour régénérer les HCO3⁻', order_index: 95 },

    // === Distinction aigu/chronique ===
    { recto: 'Quelle est la différence entre compensation rénale en acidose respiratoire aiguë vs chronique ?', verso: 'En <b>aigu</b> : pas de compensation rénale (trop lent), seulement les tampons\nEn <b>chronique</b> : compensation rénale installée → ↑HCO3⁻ nette → pH peut se normaliser', order_index: 96 },
    { recto: 'Pourquoi la compensation rénale ne s\'installe-t-elle qu\'en chronique ?', verso: 'Car la mise en jeu rénale est <b>lente</b> (heures à jours)\n→ En aigu, seuls les tampons (hémoglobine) et la ventilation compensent', order_index: 97 },

    // === Synthèse / QCM-oriented ===
    { recto: 'VRAI ou FAUX : Les HCO3⁻ filtrés sont principalement réabsorbés au niveau de l\'anse de Henlé', verso: '<b>FAUX</b>\nIls sont principalement réabsorbés au <b>TCP</b> (70-85%)', order_index: 98 },
    { recto: 'VRAI ou FAUX : L\'aldostérone diminue l\'excrétion urinaire d\'acides', verso: '<b>FAUX</b>\nL\'aldostérone <b>augmente</b> l\'excrétion acide\n(stimule la sécrétion de H⁺ par les cellules intercalaires α)', order_index: 99 },
    { recto: 'VRAI ou FAUX : L\'essentiel des H⁺ produits sont éliminés sous forme libre dans l\'urine', verso: '<b>FAUX</b>\nLa majorité est excrétée sous forme tamponnée (NH4⁺ et acidité titrable)\nLes H⁺ libres représentent < 5%', order_index: 100 },
    { recto: 'VRAI ou FAUX : L\'acidité titrable diminue quand le pH urinaire diminue', verso: '<b>FAUX</b>\nQuand le pH urinaire ↓, plus de H⁺ tamponnés → l\'acidité titrable <b>augmente</b>', order_index: 101 },
    { recto: 'VRAI ou FAUX : La sécrétion acide rénale aboutit toujours à une excrétion acide', verso: '<b>FAUX</b>\nElle peut servir à réabsorber les HCO3⁻ filtrés (au TCP) sans excrétion nette d\'acide', order_index: 102 },
    { recto: 'VRAI ou FAUX : La bicarbonaturie est habituellement nulle ou quasi-nulle', verso: '<b>VRAI</b>\nEn physiologie normale, tous les HCO3⁻ filtrés sont réabsorbés', order_index: 103 },
    { recto: 'VRAI ou FAUX : Les HCO3⁻ sont librement filtrés par le rein', verso: '<b>VRAI</b>\nLes HCO3⁻ sont librement filtrés au niveau glomérulaire', order_index: 104 },
    { recto: 'VRAI ou FAUX : L\'aldostérone stimule la sécrétion acide proximale et distale', verso: '<b>FAUX</b>\nL\'aldostérone stimule la sécrétion acide surtout au niveau <b>DISTAL</b>\n(cellules intercalaires α du canal collecteur)', order_index: 105 },
    { recto: 'Quel est le principal mécanisme d\'excrétion rénale d\'acides : acidité titrable, réabsorption HCO3⁻, H⁺ libres, NH4⁺ ou PAH ?', verso: '<b>NH4⁺</b>\n· Représente <b>2/3</b> de l\'excrétion acide\n· Mécanisme le plus <b>adaptable</b>\n· L\'acidité titrable = 1/3 seulement\n· Le PAH = mesure du DSR, rien à voir', order_index: 106 },
    { recto: 'Quelle est la différence entre sécrétion totale de H⁺ et excrétion NETTE d\'acide ?', verso: 'La <b>sécrétion totale</b> est plus élevée car une partie sert à <b>réabsorber les HCO3⁻</b>\nL\'<b>excrétion nette</b> = ~40-50 mmol/j (NH4⁺ + acidité titrable)', order_index: 107 },
    { recto: 'Qu\'est-ce que l\'acide paraaminohippurique (PAH) ?', verso: 'Le PAH sert à mesurer le <b>débit sanguin rénal (DSR)</b>\nIl n\'a <b>aucun rapport</b> avec l\'excrétion d\'acide', order_index: 108 },
    { recto: 'Résumer les mécanismes de compensation rénale de l\'acidose métabolique', verso: '1. Réabsorption complète de <b>tous les HCO3⁻</b>\n2. <b>↑ NH4⁺</b> (ammoniogenèse)\n3. ↑ excrétion charge acide\n4. <b>Régénération HCO3⁻</b>', order_index: 109 },
    { recto: 'Quel est l\'équilibre acido-basique typique d\'un patient BPCO chronique ?', verso: '<b>Acidose respiratoire compensée</b>\n· pH normal ou légèrement acide\n· PCO2↑ (hypercapnie)\n· HCO3⁻↑ (compensation rénale)', order_index: 110 },
  ],
  annales: [
    {
      titre: 'Annale Equilibre acido-basique — 2022-2023 Q10',
      annee: '2022-2023',
      rappel_cours: 'Le rein compense l\'acidose respiratoire chronique en augmentant l\'excrétion acide et la régénération de HCO3⁻. Chaque H⁺ excrété = 1 HCO3⁻ régénéré. Une HCO3⁻ très augmentée signe une hypercapnie chronique avec compensation rénale installée. Le transport maximal (Tm) des HCO3⁻ est augmenté en hypercapnie chronique.\n\n**Valeurs normales :** pH 7,38-7,42 / PCO2 35-45 mmHg / HCO3⁻ 22-28 mmol/L / PaO2 80-100 mmHg.',
      questions: [
        {
          enonce: 'Femme 50 ans, gazométrie : pH=7,38, pO2=63, pCO2=59, [HCO3⁻]=33. Quelles propositions sont correctes ?',
          items: [
            { lettre: 'A', enonce: 'Le transport maximal d\'[HCO3⁻] par le tubule rénal est augmenté', is_correct: true },
            { lettre: 'B', enonce: 'Cette femme présente une alcalose métabolique', is_correct: false },
            { lettre: 'C', enonce: 'La ventilation alvéolaire de cette femme est diminuée', is_correct: true },
            { lettre: 'D', enonce: 'Cette femme présente une acidose respiratoire parfaitement compensée', is_correct: true },
            { lettre: 'E', enonce: 'L\'excrétion rénale acide de cette femme est augmentée', is_correct: true },
          ],
          correction: '**Réponse : ACDE**\n\nA. **VRAI** — L\'hypercapnie chronique (PCO2=59) entraîne une adaptation rénale avec **augmentation du Tm des HCO3⁻**, permettant une réabsorption accrue.\nB. **FAUX** — Le pH est à 7,38 (normal/légèrement acide). L\'augmentation des HCO3⁻ (33) est une **compensation rénale** de l\'hypercapnie, PAS une alcalose métabolique primaire.\nC. **VRAI** — PCO2 = 59 > 45 mmHg = **hypercapnie** = hypoventilation alvéolaire.\nD. **VRAI** — pH normal (7,38), PCO2↑ = acidose respiratoire, HCO3⁻↑ = compensation rénale. La compensation est **parfaite** car le pH est normalisé.\nE. **VRAI** — La compensation rénale implique une **↑ excrétion acide** pour régénérer les HCO3⁻ (1 H⁺ excrété = 1 HCO3⁻ régénéré).',
        },
      ],
    },
    {
      titre: 'Annale Equilibre acido-basique — 2019 Session 1 Q32',
      annee: '2019',
      rappel_cours: 'Les bicarbonates (HCO3⁻) sont le principal tampon **extracellulaire**. Ils sont librement filtrés par le glomérule et sont principalement réabsorbés au **TCP** (70-85%). En physiologie normale, la bicarbonaturie est **nulle ou quasi-nulle** car tous les HCO3⁻ filtrés sont réabsorbés. Le Tm des HCO3⁻ est augmenté en cas d\'hypercapnie chronique.',
      questions: [
        {
          enonce: 'A propos des bicarbonates (HCO3⁻), quelles propositions sont correctes ?',
          items: [
            { lettre: 'A', enonce: 'Ils constituent le principal tampon intracellulaire', is_correct: false },
            { lettre: 'B', enonce: 'Ils sont librement filtrés par le rein', is_correct: true },
            { lettre: 'C', enonce: 'Les bicarbonates filtrés sont principalement réabsorbés au niveau de l\'anse de Henlé', is_correct: false },
            { lettre: 'D', enonce: 'Le transport maximal des bicarbonates par le tubule rénal est augmenté en cas d\'hypercapnie chronique', is_correct: true },
            { lettre: 'E', enonce: 'La bicarbonaturie est habituellement nulle ou quasi-nulle', is_correct: true },
          ],
          correction: '**Réponse : BDE**\n\nA. **FAUX** — HCO3⁻ est le principal tampon **extracellulaire** (pas intracellulaire). Les tampons intracellulaires sont les protéines et l\'hémoglobine.\nB. **VRAI** — Les HCO3⁻ sont **librement filtrés** au niveau glomérulaire.\nC. **FAUX** — Les HCO3⁻ sont principalement réabsorbés au **TCP (70-85%)**, pas à l\'anse de Henlé.\nD. **VRAI** — L\'hypercapnie chronique entraîne une adaptation rénale avec **↑ du Tm des HCO3⁻**.\nE. **VRAI** — En physiologie normale, tous les HCO3⁻ filtrés sont réabsorbés, donc la bicarbonaturie est **nulle ou quasi-nulle**.',
        },
      ],
    },
    {
      titre: 'Annale Equilibre acido-basique — 2018 Session 2 Q19',
      annee: '2018',
      rappel_cours: 'L\'excrétion acide rénale se fait sous forme tamponnée : 2/3 par NH4⁺ et 1/3 par acidité titrable. Les H⁺ libres représentent < 5%. L\'aldostérone **augmente** l\'excrétion acide (cellules intercalaires α du canal collecteur). La réabsorption proximale de HCO3⁻ est couplée à la réabsorption de Na⁺ via l\'antiport Na⁺/H⁺. L\'ammoniogenèse est stimulée par l\'acidose chronique. L\'acidité titrable **augmente** quand le pH urinaire diminue.',
      questions: [
        {
          enonce: 'A propos du rôle du rein dans l\'équilibre acide-base, quelles propositions sont correctes ?',
          items: [
            { lettre: 'A', enonce: 'L\'essentiel des H⁺ produits quotidiennement sont éliminés sous forme libre dans l\'urine', is_correct: false },
            { lettre: 'B', enonce: 'L\'aldostérone diminue l\'excrétion urinaire d\'acides', is_correct: false },
            { lettre: 'C', enonce: 'La réabsorption proximale de bicarbonates est couplée à la réabsorption de sodium', is_correct: true },
            { lettre: 'D', enonce: 'L\'ammoniogenèse rénale est stimulée par l\'acidose chronique', is_correct: true },
            { lettre: 'E', enonce: 'L\'acidité titrable diminue lorsque le pH de l\'urine diminue', is_correct: false },
          ],
          correction: '**Réponse : CD**\n\nA. **FAUX** — La majorité des H⁺ est excrétée sous forme **tamponnée** : NH4⁺ (2/3) et acidité titrable (1/3). Les H⁺ libres représentent < 5%.\nB. **FAUX** — L\'aldostérone **stimule** la sécrétion de H⁺ par les cellules intercalaires α → elle **augmente** l\'excrétion acide.\nC. **VRAI** — Via l\'**antiport Na⁺/H⁺** : la réabsorption de Na⁺ est couplée à la sécrétion de H⁺, qui permet la réabsorption de HCO3⁻.\nD. **VRAI** — L\'acidose chronique **induit la glutaminase** au TCP → ↑ production de NH4⁺.\nE. **FAUX** — Quand le pH urinaire ↓, plus de H⁺ sont sécrétés et tamponnés → l\'acidité titrable **augmente** (pas diminue).',
        },
      ],
    },
    {
      titre: 'Annale Equilibre acido-basique — 2016 Session 2 Q4 et Q7',
      annee: '2016',
      rappel_cours: 'Le pH urinaire minimal chez l\'Homme est de **4**. L\'excrétion rénale d\'acides se fait principalement sous forme d\'**ions ammonium (NH4⁺)** qui représentent 2/3 de l\'excrétion acide. L\'acidité titrable (1/3) et les H⁺ libres (< 5%) complètent le mécanisme. Le PAH (acide paraaminohippurique) sert à mesurer le débit sanguin rénal et n\'a aucun rapport avec l\'excrétion acide.',
      questions: [
        {
          enonce: 'Quelle est la valeur du pH urinaire minimal chez l\'Homme ?',
          items: [
            { lettre: 'A', enonce: '1', is_correct: false },
            { lettre: 'B', enonce: '2', is_correct: false },
            { lettre: 'C', enonce: '3', is_correct: false },
            { lettre: 'D', enonce: '4', is_correct: true },
            { lettre: 'E', enonce: '5', is_correct: false },
          ],
          correction: '**Réponse : D**\n\nLe pH urinaire minimal chez l\'Homme est de **4**. En dessous de cette valeur, les pompes à protons ne peuvent plus fonctionner contre le gradient de concentration.',
        },
        {
          enonce: 'Le principal mécanisme d\'excrétion rénale d\'acides est :',
          items: [
            { lettre: 'A', enonce: 'L\'acidité titrable', is_correct: false },
            { lettre: 'B', enonce: 'La réabsorption proximale de bicarbonates', is_correct: false },
            { lettre: 'C', enonce: 'L\'excrétion urinaire d\'ions H⁺ sous forme libre', is_correct: false },
            { lettre: 'D', enonce: 'L\'excrétion d\'ions ammonium (NH4⁺)', is_correct: true },
            { lettre: 'E', enonce: 'L\'excrétion d\'acide paraaminohippurique (PAH)', is_correct: false },
          ],
          correction: '**Réponse : D**\n\nA. **FAUX** — L\'acidité titrable ne représente que **1/3** de l\'excrétion acide et est peu adaptable.\nB. **FAUX** — La réabsorption de HCO3⁻ **préserve** les bicarbonates mais n\'est pas un mécanisme d\'excrétion d\'acide.\nC. **FAUX** — Les H⁺ libres représentent < 5% de l\'excrétion acide (quantité très faible).\nD. **VRAI** — L\'excrétion de **NH4⁺** représente **2/3** de l\'excrétion acide et est le mécanisme le plus **adaptable** (facteur x5-10).\nE. **FAUX** — Le PAH sert à mesurer le **débit sanguin rénal (DSR)**, il n\'a aucun rapport avec l\'excrétion acide.',
        },
      ],
    },
    {
      titre: 'Annale Equilibre acido-basique — 2016 Session 2 Q17',
      annee: '2016',
      rappel_cours: 'Rappel des notions clés : l\'essentiel des H⁺ est excrété sous forme tamponnée (NH4⁺ + acidité titrable), PAS sous forme libre. L\'aldostérone **augmente** l\'excrétion acide (cellules intercalaires α). La réabsorption proximale de HCO3⁻ est couplée à Na⁺ (antiport Na⁺/H⁺). L\'ammoniogenèse est stimulée par l\'acidose chronique. L\'acidité titrable **augmente** quand le pH urinaire diminue.',
      questions: [
        {
          enonce: 'A propos du rôle du rein dans l\'équilibre acide-base, quelles propositions sont correctes ?',
          items: [
            { lettre: 'A', enonce: 'L\'essentiel des H⁺ sont éliminés sous forme libre dans l\'urine', is_correct: false },
            { lettre: 'B', enonce: 'L\'aldostérone diminue l\'excrétion urinaire d\'acides', is_correct: false },
            { lettre: 'C', enonce: 'La réabsorption proximale de bicarbonates est couplée à la réabsorption de sodium', is_correct: true },
            { lettre: 'D', enonce: 'L\'ammoniogenèse rénale est stimulée par l\'acidose chronique', is_correct: true },
            { lettre: 'E', enonce: 'L\'acidité titrable diminue lorsque le pH de l\'urine diminue', is_correct: false },
          ],
          correction: '**Réponse : CD**\n\nA. **FAUX** — La majorité est excrétée sous forme **tamponnée** (NH4⁺ = 2/3, acidité titrable = 1/3). Les H⁺ libres représentent < 5%.\nB. **FAUX** — L\'aldostérone **augmente** l\'excrétion acide (stimule la pompe à protons des cellules intercalaires α).\nC. **VRAI** — Via l\'**antiport Na⁺/H⁺** luminal : la réabsorption de Na⁺ est couplée à la sécrétion de H⁺.\nD. **VRAI** — L\'acidose chronique induit la glutaminase → ↑ ammoniogenèse.\nE. **FAUX** — Quand le pH urinaire ↓, l\'acidité titrable **augmente** (plus de H⁺ tamponnés).',
        },
      ],
    },
    {
      titre: 'Annale Equilibre acido-basique — 2015 Session 2 Q9',
      annee: '2015',
      rappel_cours: 'La sécrétion acide rénale n\'aboutit **pas toujours** à une excrétion acide : au TCP, elle sert à réabsorber les HCO3⁻ filtrés. La sécrétion acide est stimulée **indirectement** par l\'acidose extracellulaire (via ↓pH intracellulaire tubulaire). L\'aldostérone stimule la sécrétion acide surtout au niveau **distal** (cellules intercalaires α). L\'excrétion nette d\'acide (~40-50 mmol/j) est inférieure à la sécrétion totale de H⁺ car une partie sert à réabsorber les HCO3⁻.',
      questions: [
        {
          enonce: 'Concernant la sécrétion acide rénale, quelles propositions sont correctes ?',
          items: [
            { lettre: 'A', enonce: 'Elle aboutit toujours à une excrétion acide', is_correct: false },
            { lettre: 'B', enonce: 'Elle permet la réabsorption des bicarbonates filtrés', is_correct: true },
            { lettre: 'C', enonce: 'Elle est stimulée directement par l\'acidose extracellulaire', is_correct: false },
            { lettre: 'D', enonce: 'L\'aldostérone stimule la sécrétion acide proximale et distale', is_correct: false },
            { lettre: 'E', enonce: 'Elle est normalement de l\'ordre de 60 à 80 mmoles d\'H⁺ par jour', is_correct: false },
          ],
          correction: '**Réponse : B**\n\nA. **FAUX** — La sécrétion de H⁺ au TCP sert à **réabsorber les HCO3⁻ filtrés** plutôt qu\'à excréter de l\'acide. Elle n\'aboutit pas toujours à une excrétion acide nette.\nB. **VRAI** — La sécrétion de H⁺ au TCP se combine avec HCO3⁻ filtré → réabsorption indirecte des HCO3⁻.\nC. **FAUX** — La stimulation est **indirecte**, via la **↓ du pH intracellulaire tubulaire** (pas directement par l\'acidose extracellulaire).\nD. **FAUX** — L\'aldostérone stimule la sécrétion acide surtout au niveau **DISTAL** (cellules intercalaires α du canal collecteur), pas au niveau proximal.\nE. **FAUX** — 60-80 mmol/j est la **charge acide à excréter**, mais la sécrétion totale de H⁺ est plus élevée car une partie sert à réabsorber les HCO3⁻. L\'excrétion **nette** est ~40-50 mmol/j.',
        },
      ],
    },
  ],
};

export default content;

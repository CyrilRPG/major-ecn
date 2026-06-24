import type { PriveCourseContent } from '../prive-courses';

const content: PriveCourseContent = {
  fiche: {
    parties: [
      {
        numero: 'I',
        titre: 'Introduction — Rappels et fonctions rénales',
        sous_parties: [
          {
            titre: 'Rappels physiologiques',
            rows: [
              { concept: '2 grandes fonctions rénales', detail_md: "**Homéostasie** : filtration glomérulaire, équilibre hydro-électrolytique, acido-basique, tensionnel\n**Endocrine** : production d'EPO, activation de la vitamine D", kind: 'a_retenir' },
              { concept: 'DFG', detail_md: "**Débit de filtration glomérulaire** = volume filtré par unité de temps (mL/min)\nReflète la **fonction rénale globale**", kind: 'a_retenir' },
            ],
          },
          {
            titre: 'Méthodes de mesure du DFG',
            rows: [
              { concept: 'Méthode de référence', detail_md: "**Clairance de l'Inuline** = gold standard\nL'inuline est uniquement filtrée, ni réabsorbée ni sécrétée → mesure exacte du DFG\nAlternative : **clairance EDTA ⁵¹Cr** (remplace de plus en plus l'inuline)", kind: 'a_retenir' },
              { concept: 'En pratique courante', detail_md: "Estimation par **clairance de la créatinine** (approximative car créatinine légèrement sécrétée)\n**Cockcroft** : clairance créatinine (mL/min) — peu précis\n**CKD-EPI** : estimation DFG à partir de la créatininémie — **recommandée par la HAS**", kind: 'normal' },
              { concept: 'Clairance créatinine ≠ DFG exact', detail_md: "La créatinine est légèrement **sécrétée** par les tubules → la clairance créatinine **surestime** le DFG réel", kind: 'piege' },
            ],
          },
          {
            titre: 'Fonction rénale différentielle',
            rows: [
              { concept: 'Définition', detail_md: "Mesure de la **fonction de chaque rein séparément**\nÉquilibre normal = entre **45% et 55%** chaque rein", kind: 'a_retenir' },
              { concept: "Moyens d'évaluation", detail_md: "L'imagerie est le **seul moyen d'évaluation non invasive**\nExamen de référence = **scintigraphie rénale**\nAlternative non irradiante = **uro-IRM** (infos anatomiques + fonctionnelles)", kind: 'normal' },
              { concept: 'Produit de contraste iodé', detail_md: "**DFG < 30 mL/min → pas de produit de contraste iodé**\nRisque de néphrotoxicité", kind: 'piege' },
            ],
          },
          {
            titre: 'Deux types de scintigraphie rénale',
            rows: [
              { concept: 'Scintigraphie dynamique', detail_md: "Images successives au cours du temps → **néphrogramme** (activité vs temps)\nTraceur à forte excrétion rénale : **MAG3** ou **DTPA**\nImages pendant **40 minutes** sous gamma-caméra\nCouplage possible : diurétiques (furosémide/Lasilix) ou anti-hypertenseurs (captopril)", kind: 'a_retenir' },
              { concept: 'Scintigraphie statique', detail_md: "Images **3-4h après injection**, durée ~15 min\nTraceur à fixation parenchymateuse : **DMSA** (reste au rein, PAS excrété)\nPour séquelles rénales, images nettes, vision anatomique", kind: 'a_retenir' },
              { concept: 'Traceurs marqués au technétium', detail_md: "Tous les traceurs sont marqués au **technétium (⁹⁹ᵐTc)**\n· ⁹⁹ᵐTc-MAG3 : sécrété par tubules proximaux\n· ⁹⁹ᵐTc-DTPA : filtré par glomérule\n· ⁹⁹ᵐTc-DMSA : capté par tube contourné proximal, reste au rein", kind: 'a_retenir' },
              { concept: 'Vue postérieure', detail_md: "Acquisition en **vue postérieure** → la droite reste à droite (pas d'inversion)", kind: 'normal' },
            ],
          },
        ],
      },
      {
        numero: 'II',
        titre: 'Scintigraphie rénale dynamique',
        sous_parties: [
          {
            titre: 'Objectifs et indications',
            rows: [
              { concept: 'Objectifs', detail_md: "1. Déterminer la **fonction rénale relative** (chaque rein)\n2. Déterminer l'**excrétion rénale** lors de syndrome obstructif\n3. Guider la **prise en charge thérapeutique**", kind: 'a_retenir' },
              { concept: 'Indications', detail_md: "· Obstacles des voies urinaires (**SJPU**, calculs obstructifs)\n· Contrôle **post-greffe**\n· **HTA réno-vasculaire** (HTRV)", kind: 'a_retenir' },
            ],
          },
          {
            titre: 'Principe et traceurs dynamiques',
            rows: [
              { concept: 'MAG3 (NéphroMAG)', detail_md: "**Sécrété** par les tubules proximaux, **NON filtré**\nExcrété dans les cavités pyélocalicielles (CPC)", kind: 'a_retenir' },
              { concept: 'DTPA', detail_md: "Éliminé par **filtration glomérulaire**\nExcrété dans les CPC", kind: 'a_retenir' },
              { concept: 'MAG3 vs DTPA — Ne pas confondre', detail_md: "· MAG3 = **sécrété** (tubules) → NON filtré\n· DTPA = **filtré** (glomérule)\nLes deux sont excrétés dans les CPC", kind: 'piege' },
              { concept: 'Déroulement', detail_md: "Patient sous gamma-caméra → injection IV du traceur radioactif → images pendant **40 minutes**\nAjout possible de Lasilix (furosémide) **20 min après injection** → hyperdiurèse → évalue obstruction", kind: 'normal' },
            ],
          },
          {
            titre: 'Néphrogramme isotopique normal',
            rows: [
              { concept: '3 phases du néphrogramme', detail_md: "1. **Phase vasculaire** : portion ascendante initiale = perfusion\n2. **Phase fonctionnelle** : montée progressive jusqu'au pic = filtration/sécrétion\n3. **Phase excrétoire** : portion descendante = excrétion du radiotraceur", kind: 'a_retenir' },
              { concept: 'Valeurs normales', detail_md: "**T½ excrété < 10 min**\n**RCA < 30%**", kind: 'a_retenir' },
              { concept: 'Rein normal vs pathologique', detail_md: "Rein normal : montée rapide → montée progressive → descente → excrétion quasi complète\nRein pathologique (obstacle) : **pas de partie descendante**, traceur reste dans le rein (ex : obstacle jonction pyélo-urétérale)", kind: 'normal' },
            ],
          },
          {
            titre: 'Fonction rénale relative',
            rows: [
              { concept: 'Méthode de calcul', detail_md: "À partir des néphrogrammes : calculer le **% de fonction de chaque rein**\nMéthode : **aire sous la courbe entre la 2ème et la 3ème minute** (segment fonctionnel)", kind: 'a_retenir' },
              { concept: 'Valeurs normales', detail_md: "Fonction rénale relative normale = entre **45% et 55%** par rein", kind: 'a_retenir' },
              { concept: 'Pourquoi le segment fonctionnel ?', detail_md: "Pas trop tôt (trop de perfusion dans la 1ère minute)\nLe **segment fonctionnel** (2ème-3ème min) est le plus représentatif de la fonction rénale", kind: 'piege' },
            ],
          },
          {
            titre: "Évaluation de l'excrétion et grades d'O'Reilly",
            rows: [
              { concept: "Évaluation de l'excrétion", detail_md: "Partie distale de la courbe après le pic\nLes diurétiques accélèrent la vidange → évalue si l'obstacle est significatif\n· Obstacle modéré/incomplet : excrétion se **normalise** après diurétiques\n· Obstacle complet : diurétiques **sans effet**", kind: 'normal' },
              { concept: "Critères d'O'Reilly", detail_md: "**Groupe 1** : aspect normal, Lasilix superflu\n**Groupe 2** : obstacle complet, Lasilix **sans effet**\n**Groupe 3a** : stase (pas vrai obstacle, vessie dilatée), Lasilix **indispensable**\n**Groupe 3b** : obstruction partielle, Lasilix **indispensable**", kind: 'a_retenir' },
              { concept: "Mnémo O'Reilly", detail_md: "\"**1 = OK, 2 = Obstrué complet, 3a = stAse, 3b = Bloqué partiel**\"", kind: 'mnemo' },
            ],
          },
        ],
      },
      {
        numero: 'III',
        titre: 'Scintigraphie rénale statique (DMSA)',
        sous_parties: [
          {
            titre: 'Principe',
            rows: [
              { concept: 'Traceur DMSA', detail_md: "**⁹⁹ᵐTc-DMSA** : NI filtré, NI sécrété\nCapté par le **tube contourné proximal** → reste au rein\nImage statique de **10-15 min**, réalisée **3-4h après injection**", kind: 'a_retenir' },
              { concept: "Ce qu'évalue le DMSA", detail_md: "· **Masse corticale fonctionnelle**\n· Fonction rénale relative : évaluation de la **fixation totale** (PAS aire sous la courbe)", kind: 'a_retenir' },
              { concept: 'DMSA ≠ clairance', detail_md: "Le DMSA **se fixe** dans le parenchyme rénal et y reste\nIl ne permet PAS de calculer une clairance (pas d'excrétion)", kind: 'piege' },
            ],
          },
          {
            titre: 'Indications en pédiatrie',
            rows: [
              { concept: 'Indications principales', detail_md: "· **Retentissement fonctionnel** des uropathies malformatives\n· **Cicatrices corticales** post-pyélonéphrite aiguë\n· Retentissement fonctionnel d'un obstacle", kind: 'a_retenir' },
              { concept: 'Cas normal et pathologique', detail_md: "Normal : fixation **homogène et symétrique**\nEx pathologique : enfant 3 ans, infections à répétition → cicatrices infectieuses : rein droit **88%**, gauche **12%**", kind: 'normal' },
            ],
          },
        ],
      },
      {
        numero: 'IV',
        titre: 'Cystographie isotopique',
        sous_parties: [
          {
            titre: 'Principe et diagnostic du RVU',
            rows: [
              { concept: 'Indication', detail_md: "Diagnostic du **reflux vésico-urétéral (RVU)**, surtout en **pédiatrie**", kind: 'a_retenir' },
              { concept: 'Traceurs', detail_md: "⁹⁹ᵐTc-pertéchnétate, ⁹⁹ᵐTc-colloïde ou ⁹⁹ᵐTc-DTPA\nInjection dans la vessie **AVANT** la miction", kind: 'a_retenir' },
              { concept: 'Déroulement', detail_md: "Images dynamiques **PENDANT** la miction\nVisualisation des uretères et pyélons, stagnation dans la vessie\nQualification de l'impact du reflux", kind: 'normal' },
              { concept: 'Ne pas confondre les examens', detail_md: "**Cystographie isotopique** = RVU (injection dans la vessie)\n**Scintigraphie statique DMSA** = cicatrices corticales\n**Scintigraphie dynamique** = obstruction", kind: 'piege' },
            ],
          },
        ],
      },
      {
        numero: 'V',
        titre: 'Scintigraphie au captopril (HTA réno-vasculaire)',
        sous_parties: [
          {
            titre: "Rappels sur l'HTA réno-vasculaire",
            rows: [
              { concept: 'HTRV', detail_md: "HTA le plus souvent **essentielle**, mais peut être **réno-vasculaire (HTRV)** = curable\n**75%** athéromateuse, **25%** fibrodysplasique\nLever la sténose = protéger le rein + faire disparaître l'HTA", kind: 'a_retenir' },
              { concept: 'Intérêt scintigraphie', detail_md: "Examen **non invasif**, **peu irradiant**\nDétermine si le rein est **incriminé dans l'HTA**\nOn peut avoir une sténose qui n'est pas responsable de l'HTA", kind: 'normal' },
            ],
          },
          {
            titre: 'Système rénine-angiotensine-aldostérone (RAA)',
            rows: [
              { concept: 'Cascade RAA', detail_md: "Angiotensinogène → (rénine) → **Angiotensine I** → (enzyme de conversion) → **Angiotensine II**\nAII : effet systémique (**vasoconstriction**) + rénal (vasoconstriction artériole efférente + rétention hydrosodée → HTA)", kind: 'a_retenir' },
              { concept: 'Rôle des IEC', detail_md: "Les **IEC** (captopril) cassent la transition AI → AII\n→ Suppriment la compensation rénale", kind: 'a_retenir' },
            ],
          },
          {
            titre: 'Mécanisme physiopathologique',
            rows: [
              { concept: 'Sténose artère rénale', detail_md: "Sténose → ↓ pression de perfusion → rein sécrète rénine → cascade RAA → AII → HTA\nAII vasoconstricte l'**artériole efférente** pour **MAINTENIR** le débit de perfusion (mécanisme de compensation)", kind: 'a_retenir' },
              { concept: 'Effet du captopril', detail_md: "IEC (captopril) **casse cette compensation** → chute de la pression de perfusion\n→ Risque d'insuffisance rénale, **effondrement du DFG**", kind: 'a_retenir' },
              { concept: 'Interprétation des néphrogrammes', detail_md: "Comparaison néphrogrammes avec/sans captopril :\n· Néphrogramme **pathologique** (effondrement) après captopril → sténose **EN CAUSE** dans l'HTA\n· **Aucun effet** du captopril → sténose **PAS en cause** dans l'HTA", kind: 'a_retenir' },
            ],
          },
          {
            titre: "Phases et déroulement de l'examen",
            rows: [
              { concept: 'Phase initiale', detail_md: "Baisse de pression de perfusion → hyperproduction de rénine\nIEC effondre le DFG **unilatéralement**\n→ Lever la sténose = **guérir l'HTA**", kind: 'a_retenir' },
              { concept: 'Phase tardive — Piège', detail_md: "DFG effondré de façon chronique\nTraitement de la sténose **SANS effet** sur l'HTA → trop tard", kind: 'piege' },
              { concept: 'Préparation du patient', detail_md: "**Arrêt ABSOLU** des IEC et diurétiques\nArrêt du régime sans sel\nLes traitements anti-HTA peuvent modifier sécrétion de rénine → faux positifs/négatifs", kind: 'a_retenir' },
              { concept: "Déroulement de l'examen", detail_md: "1ère partie : scintigraphie dynamique **sans rien** (baseline)\n2ème partie : **5h après** (ou lendemain) avec **captopril 50 mg PO**, images à 1h\nComparaison des néphrogrammes", kind: 'normal' },
            ],
          },
        ],
      },
      {
        numero: 'VI',
        titre: 'Uro-IRM',
        sous_parties: [
          {
            titre: 'Principe et limites',
            rows: [
              { concept: 'Principe', detail_md: "Technique **non irradiante**, séquence IRM au gadolinium\nÉtude de la **captation et excrétion rénales**\nAcquisitions répétées pendant **40 minutes**\nProduit de contraste : **Gadolinium-DTPA** (élimination rénale)\nInjection de Lasilix à la **20ème minute**", kind: 'a_retenir' },
              { concept: 'Limite importante', detail_md: "En scintigraphie : concentration **linéaire** avec la radioactivité\nEn IRM : linéaire jusqu'à une limite puis **chute du signal** si trop concentré\n→ Belles images mais **peu utilisé** en pratique", kind: 'piege' },
              { concept: 'Avantages', detail_md: "· **Non irradiant** (pas de radioactivité)\n· Informations **anatomiques + fonctionnelles**\n· Alternative à la scintigraphie", kind: 'normal' },
            ],
          },
        ],
      },
      {
        numero: 'VII',
        titre: 'Synthèse des examens et traceurs',
        sous_parties: [
          {
            titre: 'Tableau récapitulatif',
            rows: [
              { concept: 'Synthèse traceurs', detail_md: "· **MAG3** : sécrété par tubules proximaux → scintigraphie **dynamique**\n· **DTPA** : filtré par glomérule → scintigraphie **dynamique**\n· **DMSA** : capté par TCP, reste au rein → scintigraphie **statique**\n· **Pertéchnétate/colloïde/DTPA** : injection vésicale → **cystographie isotopique**\n· **Gadolinium-DTPA** : élimination rénale → **uro-IRM**", kind: 'a_retenir' },
              { concept: 'Synthèse indications', detail_md: "· Fonction rénale relative + excrétion → **scintigraphie dynamique**\n· Cicatrices corticales / masse fonctionnelle → **scintigraphie statique (DMSA)**\n· Reflux vésico-urétéral → **cystographie isotopique**\n· HTA réno-vasculaire → **scintigraphie au captopril**\n· Alternative non irradiante → **uro-IRM**", kind: 'a_retenir' },
              { concept: 'Mnémo traceurs', detail_md: "\"**MAG = Mouvement (dynamique), DMSA = Demeure Stable (statique)**\"", kind: 'mnemo' },
            ],
          },
        ],
      },
    ],
    points_cles: [
      "Deux types de scintigraphie : dynamique (MAG3/DTPA, 40 min, néphrogramme) et statique (DMSA, 3-4h, masse corticale)",
      "Tous les traceurs sont marqués au technétium (⁹⁹ᵐTc)",
      "MAG3 = sécrété par tubules proximaux (NON filtré) ; DTPA = filtré par glomérule ; DMSA = fixé au parenchyme (NI filtré NI sécrété)",
      "Néphrogramme : 3 phases (vasculaire → fonctionnelle → excrétoire) ; T½ excrété < 10 min ; RCA < 30%",
      "Fonction rénale relative : aire sous la courbe entre 2ème et 3ème minute ; normal = 45-55%",
      "Grades O'Reilly : 1 = normal, 2 = obstacle complet (Lasilix sans effet), 3a = stase, 3b = obstruction partielle",
      "DMSA : évalue la masse corticale fonctionnelle, cicatrices post-pyélonéphrite, utilisé en pédiatrie",
      "Cystographie isotopique = diagnostic du RVU, injection dans la vessie AVANT miction, images PENDANT miction",
      "Scintigraphie au captopril : compare avec/sans IEC — effondrement DFG = sténose en cause dans l'HTA",
      "HTRV : 75% athéromateuse, 25% fibrodysplasique — curable si diagnostiquée en phase initiale",
      "Arrêt ABSOLU des IEC et diurétiques avant scintigraphie au captopril",
      "DFG < 30 mL/min → pas de produit de contraste iodé",
      "Uro-IRM : non irradiante, gadolinium-DTPA, peu utilisée (limite de linéarité du signal)",
    ],
    chiffres_cles: {
      titre: 'Chiffres clés — Explorations fonctionnelles rénales (Médecine Nucléaire)',
      markdown: "| Paramètre | Valeur |\n|---|---|\n| Fonction rénale relative normale | **45-55%** par rein |\n| T½ excrété normal (néphrogramme) | **< 10 min** |\n| RCA normal | **< 30%** |\n| Segment fonctionnel (calcul FRR) | **2ème-3ème minute** |\n| Durée scintigraphie dynamique | **40 min** |\n| Délai scintigraphie statique (DMSA) | **3-4h après injection** |\n| Durée acquisition DMSA | **10-15 min** |\n| Injection Lasilix (dynamique/uro-IRM) | **20ème minute** |\n| Seuil DFG pour produit de contraste iodé | **< 30 mL/min = CI** |\n| HTRV athéromateuse | **75%** |\n| HTRV fibrodysplasique | **25%** |\n| Pic radioactivité néphrogramme normal | **< 5 min** |\n| Captopril (scintigraphie HTRV) | **50 mg PO** |\n| Délai 2ème scintigraphie (captopril) | **5h après** (ou lendemain) |",
    },
  },
  flashcards: [
    { recto: "Quelles sont les 2 grandes fonctions rénales ?", verso: "· <b>Homéostasie</b> : filtration glomérulaire, équilibre hydro-électrolytique, acido-basique, tensionnel\n· <b>Endocrine</b> : EPO, vitamine D active", order_index: 1 },
    { recto: "Qu'est-ce que le DFG ?", verso: "<b>Débit de filtration glomérulaire</b> = volume filtré par unité de temps (mL/min)\nReflète la <b>fonction rénale globale</b>", order_index: 2 },
    { recto: "Quelle est la méthode de référence pour mesurer le DFG ?", verso: "<b>Clairance de l'Inuline</b> = gold standard\nL'inuline est uniquement filtrée, ni réabsorbée ni sécrétée", order_index: 3 },
    { recto: "Quelle alternative à la clairance de l'Inuline la remplace de plus en plus ?", verso: "La <b>clairance EDTA ⁵¹Cr</b> (molécule d'EDTA marquée par du chrome 51)", order_index: 4 },
    { recto: "Pourquoi la clairance de la créatinine est-elle approximative ?", verso: "Car la créatinine est légèrement <b>sécrétée</b> par les tubules\n→ La clairance créatinine <b>surestime</b> le DFG réel", order_index: 5 },
    { recto: "Quelle formule d'estimation du DFG est recommandée par la HAS ?", verso: "<b>CKD-EPI</b> : estimation du DFG à partir de la créatininémie\n(Cockcroft = peu précis)", order_index: 6 },
    { recto: "Qu'est-ce que la fonction rénale différentielle ?", verso: "Mesure de la <b>fonction de chaque rein séparément</b>\nÉquilibre normal = entre <b>45% et 55%</b> par rein", order_index: 7 },
    { recto: "Quel est l'examen de référence pour évaluer la fonction rénale différentielle ?", verso: "La <b>scintigraphie rénale</b>\nAlternative non irradiante : <b>uro-IRM</b>", order_index: 8 },
    { recto: "En dessous de quel DFG ne peut-on pas utiliser de produit de contraste iodé ?", verso: "<b>DFG < 30 mL/min</b>\nRisque de néphrotoxicité", order_index: 9 },
    { recto: "Quels sont les 2 types de scintigraphie rénale ?", verso: "· <b>Scintigraphie dynamique</b> : images successives, néphrogramme (MAG3/DTPA), 40 min\n· <b>Scintigraphie statique</b> : images 3-4h après injection (DMSA), 10-15 min", order_index: 10 },
    { recto: "Quels traceurs utilise-t-on en scintigraphie dynamique ?", verso: "· <b>MAG3</b> (NéphroMAG) : sécrété par les tubules proximaux\n· <b>DTPA</b> : filtré par le glomérule\nTous deux marqués au <b>⁹⁹ᵐTc</b>", order_index: 11 },
    { recto: "Quel traceur utilise-t-on en scintigraphie statique ?", verso: "<b>⁹⁹ᵐTc-DMSA</b>\nCapté par le tube contourné proximal, reste au rein (PAS excrété)", order_index: 12 },
    { recto: "Avec quel isotope sont marqués tous les traceurs en scintigraphie rénale ?", verso: "Le <b>technétium (⁹⁹ᵐTc)</b>", order_index: 13 },
    { recto: "Combien de temps dure une scintigraphie dynamique ?", verso: "<b>40 minutes</b> (images acquises pendant l'injection)", order_index: 14 },
    { recto: "Combien de temps après l'injection réalise-t-on les images en scintigraphie statique (DMSA) ?", verso: "<b>3-4 heures</b> après injection\nDurée d'acquisition : <b>10-15 min</b>", order_index: 15 },
    { recto: "En scintigraphie rénale, regarde-t-on le patient en vue antérieure ou postérieure ?", verso: "En <b>vue postérieure</b>\n→ La droite reste à droite (pas d'inversion)", order_index: 16 },
    { recto: "Quels sont les 3 objectifs de la scintigraphie dynamique ?", verso: "1. <b>Fonction rénale relative</b> (chaque rein)\n2. <b>Excrétion rénale</b> lors de syndrome obstructif\n3. <b>Guide thérapeutique</b>", order_index: 17 },
    { recto: "Quelles sont les indications de la scintigraphie dynamique ?", verso: "· Obstacles des voies urinaires (<b>SJPU</b>, calculs obstructifs)\n· Contrôle <b>post-greffe</b>\n· <b>HTA réno-vasculaire</b> (HTRV)", order_index: 18 },
    { recto: "Le MAG3 est-il filtré ou sécrété ?", verso: "<b>Sécrété</b> par les tubules proximaux, <b>NON filtré</b>\nExcrété dans les CPC", order_index: 19 },
    { recto: "Le DTPA est-il filtré ou sécrété ?", verso: "<b>Filtré</b> par le glomérule (filtration glomérulaire)\nExcrété dans les CPC", order_index: 20 },
    { recto: "À quoi correspond un néphrogramme isotopique ?", verso: "Quantification du radiotraceur au rein <b>en fonction du temps</b>\nCourbe d'activité vs temps avec <b>3 phases</b>", order_index: 21 },
    { recto: "Quelles sont les 3 phases du néphrogramme isotopique normal ?", verso: "1. <b>Phase vasculaire</b> : portion ascendante initiale = perfusion\n2. <b>Phase fonctionnelle</b> : montée progressive jusqu'au pic = filtration/sécrétion\n3. <b>Phase excrétoire</b> : portion descendante = excrétion", order_index: 22 },
    { recto: "Que doit être le T½ excrété sur un néphrogramme normal ?", verso: "<b>T½ excrété < 10 min</b>", order_index: 23 },
    { recto: "Quelle est la valeur normale du RCA sur un néphrogramme ?", verso: "<b>RCA < 30%</b>", order_index: 24 },
    { recto: "Comment se présente le néphrogramme d'un rein avec obstacle ?", verso: "<b>Pas de partie descendante</b>\nLe traceur reste dans le rein (accumulation)\nPas d'excrétion du radiotraceur", order_index: 25 },
    { recto: "Comment calcule-t-on la fonction rénale relative en scintigraphie dynamique ?", verso: "Par l'<b>aire sous la courbe entre la 2ème et la 3ème minute</b> (segment fonctionnel)\nNormal : entre <b>45% et 55%</b>", order_index: 26 },
    { recto: "Pourquoi utilise-t-on le segment fonctionnel (2ème-3ème minute) et pas plus tôt ?", verso: "Avant la 2ème minute : trop de <b>perfusion</b> (phase vasculaire)\nLe segment fonctionnel est le plus <b>représentatif</b> de la fonction rénale", order_index: 27 },
    { recto: "Quel diurétique peut-on coupler à la scintigraphie dynamique ?", verso: "Le <b>furosémide (Lasilix)</b>\nInjecté à la <b>20ème minute</b> pour provoquer une hyperdiurèse\nPermet d'évaluer l'obstruction", order_index: 28 },
    { recto: "Que montre un obstacle modéré/incomplet après injection de Lasilix ?", verso: "L'excrétion se <b>normalise</b> après diurétiques\n→ L'obstacle n'est pas complet", order_index: 29 },
    { recto: "Que montre un obstacle complet après injection de Lasilix ?", verso: "Les diurétiques sont <b>sans effet</b>\n→ Le traceur ne s'évacue toujours pas", order_index: 30 },
    { recto: "Quels sont les critères d'O'Reilly (groupes) ?", verso: "· <b>Groupe 1</b> : aspect normal, Lasilix superflu\n· <b>Groupe 2</b> : obstacle complet, Lasilix sans effet\n· <b>Groupe 3a</b> : stase, Lasilix indispensable\n· <b>Groupe 3b</b> : obstruction partielle, Lasilix indispensable", order_index: 31 },
    { recto: "Que signifie le Groupe 2 d'O'Reilly ?", verso: "<b>Obstacle complet</b>, Lasilix <b>sans effet</b>", order_index: 32 },
    { recto: "Quelle est la différence entre stase (3a) et obstruction partielle (3b) d'O'Reilly ?", verso: "· <b>3a = stase</b> : pas un vrai obstacle, vessie dilatée\n· <b>3b = obstruction partielle</b> : vrai obstacle mais incomplet\nDans les 2 cas, Lasilix est <b>indispensable</b>", order_index: 33 },
    { recto: "Le DMSA est-il filtré ? Sécrété ?", verso: "Le DMSA n'est <b>NI filtré NI sécrété</b>\nIl est <b>capté</b> par le tube contourné proximal et <b>reste au rein</b>", order_index: 34 },
    { recto: "Qu'évalue la scintigraphie statique au DMSA ?", verso: "· La <b>masse corticale fonctionnelle</b>\n· La <b>fonction rénale relative</b> (par fixation totale, PAS aire sous la courbe)", order_index: 35 },
    { recto: "Le DMSA permet-il de calculer une clairance ?", verso: "<b>Non</b>\nLe DMSA se fixe dans le parenchyme rénal sans être excrété\n→ Pas de mesure de clairance possible", order_index: 36 },
    { recto: "Comment évalue-t-on la fonction rénale relative en DMSA ?", verso: "Par évaluation de la <b>fixation totale</b> de chaque rein\n(PAS par l'aire sous la courbe comme en dynamique)", order_index: 37 },
    { recto: "Quelles sont les indications du DMSA en pédiatrie ?", verso: "· Retentissement fonctionnel des <b>uropathies malformatives</b>\n· <b>Cicatrices corticales</b> post-pyélonéphrite aiguë\n· Retentissement fonctionnel d'un obstacle", order_index: 38 },
    { recto: "Comment se présente un DMSA normal ?", verso: "Fixation <b>homogène et symétrique</b> des deux reins", order_index: 39 },
    { recto: "Quelle est l'indication de la cystographie isotopique ?", verso: "Diagnostic du <b>reflux vésico-urétéral (RVU)</b>\nSurtout en <b>pédiatrie</b>", order_index: 40 },
    { recto: "Quels traceurs utilise-t-on pour la cystographie isotopique ?", verso: "· ⁹⁹ᵐTc-<b>pertéchnétate</b>\n· ⁹⁹ᵐTc-<b>colloïde</b>\n· ⁹⁹ᵐTc-<b>DTPA</b>", order_index: 41 },
    { recto: "Comment se déroule une cystographie isotopique ?", verso: "Injection du traceur dans la <b>vessie AVANT</b> la miction\nImages dynamiques <b>PENDANT</b> la miction\nVisualisation des uretères, pyélons, stagnation vésicale", order_index: 42 },
    { recto: "HTA essentielle vs HTA réno-vasculaire : quelle différence ?", verso: "· <b>HTA essentielle</b> : la plus fréquente, sans cause identifiable\n· <b>HTRV</b> : secondaire à une sténose de l'artère rénale = <b>curable</b>", order_index: 43 },
    { recto: "Quelles sont les 2 causes d'HTRV et leur proportion ?", verso: "· <b>75%</b> athéromateuse\n· <b>25%</b> fibrodysplasique", order_index: 44 },
    { recto: "Décrire la cascade du système rénine-angiotensine-aldostérone (RAA)", verso: "Angiotensinogène → (<b>rénine</b>) → Angiotensine I → (<b>enzyme de conversion</b>) → <b>Angiotensine II</b>\nAII : vasoconstriction systémique + rétention hydrosodée → HTA", order_index: 45 },
    { recto: "Quels sont les 2 effets de l'angiotensine II ?", verso: "· <b>Effet systémique</b> : vasoconstriction\n· <b>Effet rénal</b> : vasoconstriction de l'artériole efférente + rétention hydrosodée → HTA", order_index: 46 },
    { recto: "Quel est le rôle de la vasoconstriction de l'artériole efférente par l'AII ?", verso: "<b>Maintenir le débit de perfusion</b> en aval d'une sténose\nC'est un <b>mécanisme de compensation</b>", order_index: 47 },
    { recto: "Comment agissent les IEC (captopril) ?", verso: "Les IEC <b>cassent la transition</b> Angiotensine I → Angiotensine II\n→ Suppriment la compensation rénale", order_index: 48 },
    { recto: "Que se passe-t-il quand on donne du captopril en cas de sténose de l'artère rénale ?", verso: "Le captopril <b>casse la compensation</b> (vasoconstriction efférente)\n→ <b>Chute de pression de perfusion</b>\n→ Risque d'insuffisance rénale, <b>effondrement du DFG</b>", order_index: 49 },
    { recto: "Comment interpréter un néphrogramme pathologique après captopril ?", verso: "Effondrement du DFG après captopril → la <b>sténose est EN CAUSE</b> dans l'HTA\nLever la sténose = guérir l'HTA", order_index: 50 },
    { recto: "Comment interpréter un néphrogramme inchangé après captopril ?", verso: "Aucun effet du captopril → la <b>sténose N'EST PAS en cause</b> dans l'HTA\nL'HTA est d'une autre origine", order_index: 51 },
    { recto: "Quelle est la différence entre phase initiale et phase tardive dans l'HTRV ?", verso: "· <b>Phase initiale</b> : hyperproduction rénine → IEC effondre DFG unilatéralement → lever sténose = guérir HTA\n· <b>Phase tardive</b> : DFG effondré chroniquement → traitement sténose <b>SANS effet</b> sur HTA", order_index: 52 },
    { recto: "Quelle préparation du patient avant scintigraphie au captopril ?", verso: "· <b>Arrêt ABSOLU</b> des IEC et diurétiques\n· Arrêt du régime sans sel\n· Les anti-HTA modifient rénine/hémodynamique rénale → faux positifs/négatifs", order_index: 53 },
    { recto: "Comment se déroule la scintigraphie au captopril ?", verso: "1ère partie : scintigraphie dynamique <b>sans rien</b> (baseline)\n2ème partie : <b>5h après</b> (ou lendemain) avec <b>captopril 50 mg PO</b>, images à 1h\nComparaison des néphrogrammes", order_index: 54 },
    { recto: "Quel produit de contraste utilise-t-on en uro-IRM ?", verso: "<b>Gadolinium-DTPA</b>\nÉlimination rénale", order_index: 55 },
    { recto: "Combien de temps durent les acquisitions en uro-IRM ?", verso: "<b>40 minutes</b> d'acquisitions répétées\nInjection de Lasilix à la <b>20ème minute</b>", order_index: 56 },
    { recto: "Quelle est la limite principale de l'uro-IRM par rapport à la scintigraphie ?", verso: "En scintigraphie : concentration <b>linéaire</b> avec radioactivité\nEn IRM : linéaire jusqu'à une limite puis <b>chute du signal</b> si trop concentré\n→ Peu utilisé en pratique", order_index: 57 },
    { recto: "Quel est le principal avantage de l'uro-IRM ?", verso: "Technique <b>non irradiante</b> (pas de radioactivité)\nInformations anatomiques + fonctionnelles", order_index: 58 },
    { recto: "Quel examen pour évaluer les cicatrices corticales post-pyélonéphrite ?", verso: "La <b>scintigraphie statique au DMSA</b>", order_index: 59 },
    { recto: "Quel examen pour évaluer un obstacle des voies urinaires ?", verso: "La <b>scintigraphie dynamique</b> (MAG3/DTPA +/- Lasilix)", order_index: 60 },
    { recto: "Quel examen pour diagnostiquer un reflux vésico-urétéral ?", verso: "La <b>cystographie isotopique</b>\n(PAS la scintigraphie statique ni dynamique)", order_index: 61 },
    { recto: "Quel examen pour évaluer une HTA réno-vasculaire ?", verso: "La <b>scintigraphie au captopril</b>\n(scintigraphie dynamique avec/sans captopril)", order_index: 62 },
    { recto: "VRAI ou FAUX : le MAG3 est filtré par le glomérule", verso: "<b>FAUX</b>\nLe MAG3 est <b>sécrété</b> par les tubules proximaux, NON filtré\nC'est le <b>DTPA</b> qui est filtré", order_index: 63 },
    { recto: "VRAI ou FAUX : le DMSA est excrété dans les urines", verso: "<b>FAUX</b>\nLe DMSA est capté par le TCP et <b>reste au rein</b>\nIl n'est NI filtré NI sécrété NI excrété", order_index: 64 },
    { recto: "VRAI ou FAUX : la scintigraphie dynamique acquiert des images 6h après l'injection", verso: "<b>FAUX</b>\nLes images sont acquises <b>pendant l'injection</b>, pendant <b>40 minutes</b>", order_index: 65 },
    { recto: "VRAI ou FAUX : la scintigraphie dynamique donne une fonction rénale absolue", verso: "<b>FAUX</b>\nElle donne une fonction rénale <b>relative</b> (% de chaque rein)\nPas une valeur absolue de DFG", order_index: 66 },
    { recto: "VRAI ou FAUX : le pic de radioactivité sur un néphrogramme normal survient avant 5 min", verso: "<b>VRAI</b>\nLe pic de la courbe (max radioactivité) survient <b>avant 5 minutes</b>", order_index: 67 },
    { recto: "VRAI ou FAUX : la phase d'excrétion du néphrogramme correspond à un plateau", verso: "<b>FAUX</b>\nLa phase d'excrétion correspond à la <b>portion descendante</b> de la courbe\nUn plateau signerait un obstacle", order_index: 68 },
    { recto: "VRAI ou FAUX : le DMSA permet d'évaluer les sténoses de l'artère rénale", verso: "<b>FAUX</b>\nLes sténoses sont évaluées par la scintigraphie <b>dynamique + captopril</b>\nLe DMSA évalue la masse corticale fonctionnelle", order_index: 69 },
    { recto: "VRAI ou FAUX : la cystographie isotopique permet de diagnostiquer le RVU", verso: "<b>VRAI</b>\nInjection dans la vessie avant miction, images pendant miction", order_index: 70 },
    { recto: "VRAI ou FAUX : la scintigraphie dynamique est couplée à un ECG", verso: "<b>FAUX</b>\nLa scintigraphie rénale n'est pas couplée à un ECG\n(c'est la scintigraphie cardiaque qui peut l'être)", order_index: 71 },
    { recto: "Quelle est la physiopathologie initiale de l'HTRV ?", verso: "Sténose artère rénale → <b>baisse pression de perfusion</b>\n→ Sécrétion de <b>rénine</b> par le rein\n→ Cascade RAA → AII → <b>HTA</b>", order_index: 72 },
    { recto: "Pourquoi l'artériole efférente se vasoconstricte-t-elle en cas de sténose ?", verso: "C'est un <b>mécanisme de compensation</b> via l'angiotensine II\nBut : <b>maintenir le débit de perfusion</b> malgré la baisse de pression en amont", order_index: 73 },
    { recto: "Pourquoi les IEC sont-ils dangereux en cas de sténose bilatérale ?", verso: "Les IEC cassent la compensation (vasoconstriction efférente) <b>des deux côtés</b>\n→ <b>Effondrement du DFG bilatéral</b>\n→ Insuffisance rénale aiguë", order_index: 74 },
    { recto: "À quel moment injecte-t-on le Lasilix en scintigraphie dynamique ?", verso: "À la <b>20ème minute</b> après le début de l'examen", order_index: 75 },
    { recto: "Quel est l'exemple classique d'obstacle en scintigraphie dynamique ?", verso: "Obstacle de la <b>jonction pyélo-urétérale</b>\nNéphrogramme : pas de descente, traceur reste dans le rein", order_index: 76 },
    { recto: "Que signifie SJPU ?", verso: "<b>Syndrome de la jonction pyélo-urétérale</b>\nIndication de la scintigraphie dynamique", order_index: 77 },
    { recto: "Que signifie HTRV ?", verso: "<b>Hypertension réno-vasculaire</b>\nHTA secondaire à une sténose de l'artère rénale = curable", order_index: 78 },
    { recto: "En scintigraphie au captopril, quelle dose de captopril administre-t-on ?", verso: "<b>50 mg de captopril par voie orale</b>\n2ème partie de l'examen, images réalisées 1h après", order_index: 79 },
    { recto: "En scintigraphie au captopril, combien de temps entre baseline et scintigraphie avec captopril ?", verso: "<b>5 heures après</b> (ou le lendemain)\nCaptopril donné per os", order_index: 80 },
    { recto: "Pourquoi peut-on avoir une sténose de l'artère rénale sans que celle-ci ne cause l'HTA ?", verso: "La sténose peut être <b>non significative</b> hémodynamiquement\nLa scintigraphie au captopril permet de distinguer sténose <b>en cause</b> vs <b>pas en cause</b>", order_index: 81 },
    { recto: "Quel est le rôle de la rénine dans la cascade RAA ?", verso: "La <b>rénine</b> (produite par l'appareil juxta-glomérulaire) transforme l'<b>angiotensinogène</b> en <b>angiotensine I</b>", order_index: 82 },
    { recto: "Quel est le rôle de l'enzyme de conversion dans la cascade RAA ?", verso: "L'<b>enzyme de conversion</b> transforme l'<b>angiotensine I</b> en <b>angiotensine II</b>\nLes IEC bloquent cette étape", order_index: 83 },
    { recto: "VRAI ou FAUX : le MAG3 est éliminé principalement par filtration glomérulaire", verso: "<b>FAUX</b>\nLe MAG3 est <b>sécrété par les tubules proximaux</b>, NON filtré\nC'est le DTPA qui est éliminé par filtration glomérulaire", order_index: 84 },
    { recto: "VRAI ou FAUX : en cas de sténose réno-vasculaire + IEC, le MAG3 est systématiquement ralenti", verso: "<b>FAUX</b>\nLe MAG3 mesure le <b>flux plasmatique rénal</b> (sécrétion tubulaire)\nCelui-ci ne chute pas nécessairement de façon significative sous IEC", order_index: 85 },
    { recto: "VRAI ou FAUX : l'uro-IRM est la technique la plus utilisée en pratique", verso: "<b>FAUX</b>\nL'uro-IRM produit de belles images mais est <b>peu utilisée</b> en pratique\nLa <b>scintigraphie</b> reste la référence", order_index: 86 },
    { recto: "VRAI ou FAUX : en scintigraphie au captopril, il faut arrêter les IEC et les diurétiques", verso: "<b>VRAI</b>\nArrêt <b>ABSOLU</b> des IEC et diurétiques + arrêt du régime sans sel", order_index: 87 },
    { recto: "En cas de syndrome de jonction avec obstacle organique, le Lasilix normalise-t-il l'excrétion ?", verso: "<b>Non</b>\nL'excrétion reste <b>anormale</b> après Lasilix = obstacle <b>organique</b>\n(un obstacle fonctionnel se normalise après Lasilix)", order_index: 88 },
    { recto: "Quel radiotraceur est exclusivement filtré par le glomérule ?", verso: "Le <b>DTPA</b> (⁹⁹ᵐTc-DTPA)\nFiltration glomérulaire exclusive", order_index: 89 },
    { recto: "Résumer les traceurs : MAG3, DTPA, DMSA — mécanisme et type de scintigraphie", verso: "· <b>MAG3</b> : sécrété (tubules) → dynamique\n· <b>DTPA</b> : filtré (glomérule) → dynamique\n· <b>DMSA</b> : fixé (TCP) → statique", order_index: 90 },
    { recto: "Résumer les examens de médecine nucléaire rénale et leurs indications", verso: "· <b>Dynamique</b> : fonction relative, obstruction, post-greffe\n· <b>Statique (DMSA)</b> : cicatrices, masse corticale\n· <b>Cystographie isotopique</b> : RVU\n· <b>Captopril</b> : HTRV\n· <b>Uro-IRM</b> : alternative non irradiante", order_index: 91 },
    { recto: "Mnémo : MAG = ? / DMSA = ?", verso: "<b>MAG = Mouvement</b> (dynamique)\n<b>DMSA = Demeure Stable</b> (statique)", order_index: 92 },
    { recto: "Mnémo critères d'O'Reilly : 1, 2, 3a, 3b ?", verso: "<b>1 = OK</b> (normal)\n<b>2 = Obstrué complet</b> (Lasilix sans effet)\n<b>3a = stAse</b> (Lasilix indispensable)\n<b>3b = Bloqué partiel</b> (Lasilix indispensable)", order_index: 93 },
    { recto: "En cas de sténose bilatérale, un seul rein peut-il être responsable de l'HTA ?", verso: "<b>Oui</b>\nExemple du cours : sténose bilatérale mais après captopril seul le rein gauche est effondré\n→ La sténose gauche est <b>seule incriminée</b> dans l'HTA", order_index: 94 },
    { recto: "VRAI ou FAUX : le DFG est conservé en cas de sténose réno-vasculaire (sans IEC)", verso: "<b>VRAI</b>\nGrâce au <b>mécanisme de compensation</b> (vasoconstriction de l'artériole efférente par l'AII)\nLe DFG est maintenu malgré la sténose", order_index: 95 },
    { recto: "VRAI ou FAUX : sous IEC, la vasoconstriction de l'artériole efférente diminue", verso: "<b>VRAI</b>\nL'IEC supprime l'AII → disparition de la vasoconstriction efférente\n→ Chute du DFG", order_index: 96 },
    { recto: "VRAI ou FAUX : sous IEC, l'excrétion du DTPA est ralentie en cas de sténose", verso: "<b>VRAI</b>\nLe DTPA est filtré par le glomérule\nLe DFG chute sous IEC → excrétion du DTPA ralentie", order_index: 97 },
    { recto: "VRAI ou FAUX : le DMSA permet de quantifier la masse des néphrons de chaque rein", verso: "<b>VRAI</b>\nLe DMSA se fixe au parenchyme rénal → permet de quantifier la <b>masse fonctionnelle</b> de chaque rein", order_index: 98 },
    { recto: "VRAI ou FAUX : le DMSA permet d'explorer les reflux vésico-urétéraux", verso: "<b>FAUX</b>\nLes RVU sont explorés par la <b>cystographie isotopique</b>\nLe DMSA explore la masse corticale et les cicatrices", order_index: 99 },
    { recto: "VRAI ou FAUX : le DMSA permet de visualiser des altérations structurelles des reins", verso: "<b>VRAI</b>\nLe DMSA permet de voir les <b>cicatrices corticales</b> et les défauts de fixation", order_index: 100 },
  ],
  annales: [
    {
      titre: 'Annale 2019 — Sessions 1 et 2 — QCM 10 et 11',
      annee: '2019',
      rappel_cours: "**Scintigraphie dynamique au MAG3 + Lasilix** : examen dynamique de 40 min, images acquises pendant l'injection (PAS 6h après). Le MAG3 est sécrété par les tubules proximaux (NON filtré). On peut déterminer la fonction rénale différentielle et évaluer le drainage.\n\n**Scintigraphie au captopril** : le MAG3 est sécrété (PAS filtré). Le DTPA est filtré par le glomérule. L'examen est non invasif, réalisé en 2 temps (baseline + captopril 50 mg PO). Une sténose fonctionnelle provoque une baisse de captation après captopril.",
      questions: [
        {
          enonce: "Toutes les propositions suivantes concernant la scintigraphie rénale dynamique au 99mTc-MAG3 avec test au Lasilix sont exactes, SAUF UNE. Laquelle ?",
          items: [
            { lettre: 'A', enonce: "Il s'agit d'un examen dynamique", is_correct: true },
            { lettre: 'B', enonce: "L'examen consiste à réaliser des images six heures après injection du radiopharmaceutique", is_correct: false },
            { lettre: 'C', enonce: "Le MAG3 est secrété dans les tubules proximaux", is_correct: true },
            { lettre: 'D', enonce: "À partir des rénogrammes des deux reins, il est possible de déterminer la fonction rénale différentielle et le drainage des cavités excrétrices", is_correct: true },
            { lettre: 'E', enonce: "Plusieurs méthodes d'analyse des rénogrammes ont été proposées pour mieux affirmer l'existence d'une obstruction", is_correct: true },
          ],
          correction: "**Réponse : B**\n\nA. **VRAI** — La scintigraphie au MAG3 est bien un examen dynamique (images successives au cours du temps).\nB. **FAUX** — Une scintigraphie dynamique se déroule juste après l'injection, pendant environ **40 minutes**. Ce n'est PAS 6h après l'injection.\nC. **VRAI** — Le MAG3 est sécrété par les tubules proximaux (NON filtré).\nD. **VRAI** — Les rénogrammes permettent de calculer la fonction rénale relative et d'évaluer le drainage des cavités excrétrices.\nE. **VRAI** — Plusieurs méthodes (critères d'O'Reilly, T½, RCA) permettent d'évaluer l'obstruction.",
        },
        {
          enonce: "Toutes les propositions suivantes concernant la scintigraphie rénale au MAG3 sensibilisée par le Captopril sont exactes, SAUF UNE. Laquelle ?",
          items: [
            { lettre: 'A', enonce: "C'est un examen non invasif", is_correct: true },
            { lettre: 'B', enonce: "Le MAG3 est un radiopharmaceutique qui est éliminé principalement par filtration glomérulaire", is_correct: false },
            { lettre: 'C', enonce: "C'est un examen réalisé en 2 temps, en condition basale et après prise orale d'un comprimé de 50 mg de captopril", is_correct: true },
            { lettre: 'D', enonce: "Ce test est utilisé dans le diagnostic de l'hypertension artérielle rénovasculaire", is_correct: true },
            { lettre: 'E', enonce: "Une sténose fonctionnelle d'une artère rénale va se traduire par une baisse du taux de captation rénale du côté de la sténose, après administration du captopril", is_correct: true },
          ],
          correction: "**Réponse : B**\n\nA. **VRAI** — La scintigraphie est un examen non invasif.\nB. **FAUX** — Le MAG3 est **sécrété par les tubules proximaux**, il n'est PAS filtré par le glomérule. C'est le **DTPA** qui est éliminé principalement par filtration glomérulaire.\nC. **VRAI** — L'examen est réalisé en 2 temps : baseline puis captopril 50 mg PO.\nD. **VRAI** — C'est l'indication principale : diagnostiquer l'HTRV.\nE. **VRAI** — Après captopril, le DFG s'effondre du côté de la sténose → baisse de captation rénale.",
        },
      ],
    },
    {
      titre: 'Annale 2017 — Session 2 — Question 30',
      annee: '2017',
      rappel_cours: "**Traceurs en scintigraphie rénale** :\n· ⁹⁹ᵐTc-MAG3 : scintigraphie **dynamique** (sécrété par tubules) → évalue la fonction rénale\n· ⁹⁹ᵐTc-DMSA : scintigraphie **statique** (capté par TCP) → évalue la fonction rénale (masse corticale)\n· ⁹⁹ᵐTc-HMDP : traceur osseux → PAS pour la fonction rénale\n· ⁹⁹ᵐTc-MIBI : traceur cardiaque/parathyroïdien → PAS pour la fonction rénale",
      questions: [
        {
          enonce: "Quel(s) est (sont) le ou les traceur(s) qui permet(tent) d'évaluer la fonction rénale en scintigraphie ?",
          items: [
            { lettre: 'A', enonce: "99mTc-MAG3", is_correct: true },
            { lettre: 'B', enonce: "99mTc-DMSA", is_correct: true },
            { lettre: 'C', enonce: "99mTc-HMDP", is_correct: false },
            { lettre: 'D', enonce: "99mTc-MIBI", is_correct: false },
            { lettre: 'E', enonce: "Aucun de ces traceurs", is_correct: false },
          ],
          correction: "**Réponse : AB**\n\nA. **VRAI** — Le ⁹⁹ᵐTc-MAG3 est un traceur de scintigraphie dynamique rénale (sécrété par les tubules proximaux).\nB. **VRAI** — Le ⁹⁹ᵐTc-DMSA est un traceur de scintigraphie statique rénale (capté par le TCP, évalue la masse corticale fonctionnelle).\nC. **FAUX** — Le ⁹⁹ᵐTc-HMDP est un traceur de scintigraphie osseuse.\nD. **FAUX** — Le ⁹⁹ᵐTc-MIBI est un traceur utilisé en scintigraphie myocardique de perfusion et pour les parathyroïdes.\nE. **FAUX** — Les items A et B sont des traceurs de la fonction rénale.",
        },
      ],
    },
    {
      titre: 'Annale 2015 — Session 1 — Question 32 — Néphrogramme au MAG3',
      annee: '2015',
      rappel_cours: "**Néphrogramme isotopique** : courbe d'activité vs temps avec 3 phases (vasculaire, fonctionnelle, excrétoire). La scintigraphie dynamique donne une **fonction rénale relative** (PAS absolue). Le pic de radioactivité survient **avant 5 minutes**. La phase d'excrétion = portion **descendante** (PAS un plateau). L'examen n'est PAS couplé à un ECG.",
      questions: [
        {
          enonce: "L'étude du néphrogramme obtenue par la scintigraphie rénale au Mag 3 (une ou plusieurs réponses exactes) :",
          items: [
            { lettre: 'A', enonce: "nécessite l'acquisition d'une série d'images dynamiques couplées à l'électrocardiogramme", is_correct: false },
            { lettre: 'B', enonce: "permet d'évaluer la fonction rénale absolue", is_correct: false },
            { lettre: 'C', enonce: "permet d'évaluer la fonction rénale relative", is_correct: true },
            { lettre: 'D', enonce: "comporte chez le sujet normal un maximum de radioactivité dans les 5 premières minutes", is_correct: true },
            { lettre: 'E', enonce: "comporte chez le sujet normal une phase d'excrétion en plateau", is_correct: false },
          ],
          correction: "**Réponse : CD**\n\nA. **FAUX** — La scintigraphie rénale n'est PAS couplée à un ECG. C'est la scintigraphie cardiaque qui peut être synchronisée à l'ECG.\nB. **FAUX** — Elle donne une **fonction rénale relative** (% de chaque rein), PAS une valeur absolue de DFG.\nC. **VRAI** — La scintigraphie dynamique permet d'évaluer la fonction rénale relative (aire sous la courbe entre 2ème et 3ème minute).\nD. **VRAI** — Le maximum de radioactivité (pic) survient normalement dans les **5 premières minutes**.\nE. **FAUX** — La phase d'excrétion correspond à la **portion descendante** de la courbe. Un plateau signerait une rétention/obstacle.",
        },
      ],
    },
    {
      titre: 'Annale 2015 — Session 2 — Question 20 — DMSA',
      annee: '2015',
      rappel_cours: "**⁹⁹ᵐTc-DMSA** : traceur de scintigraphie statique. NI filtré NI sécrété, capté par le TCP et reste au rein. Évalue la **masse corticale fonctionnelle** et permet de visualiser les **altérations structurelles**. Ne permet PAS de calculer une clairance. PAS pour les sténoses (→ dynamique + captopril) ni pour le RVU (→ cystographie isotopique).",
      questions: [
        {
          enonce: "La scintigraphie rénale au 99Tc-DMSA permet :",
          items: [
            { lettre: 'A', enonce: "De visualiser des altérations structurelles des reins", is_correct: true },
            { lettre: 'B', enonce: "De quantifier la masse des néphrons de chaque rein", is_correct: true },
            { lettre: 'C', enonce: "De calculer la clairance rénale de chaque rein", is_correct: false },
            { lettre: 'D', enonce: "D'explorer les sténoses réno-vasculaires", is_correct: false },
            { lettre: 'E', enonce: "D'explorer les reflux vésico-urétéraux", is_correct: false },
          ],
          correction: "**Réponse : AB**\n\nA. **VRAI** — Le DMSA se fixe dans le parenchyme rénal et permet de visualiser les **altérations structurelles** (cicatrices, défauts de fixation).\nB. **VRAI** — Le DMSA permet de **quantifier la masse fonctionnelle** (néphrons) de chaque rein.\nC. **FAUX** — Le DMSA **se fixe** dans le rein sans être excrété → il ne permet PAS de calculer une clairance (vitesse d'élimination). Les clairances se mesurent avec des traceurs filtrés/sécrétés (Inuline, EDTA, créatinine).\nD. **FAUX** — Les sténoses réno-vasculaires s'explorent avec une scintigraphie **dynamique** (MAG3 ou DTPA) avec test au **Captopril**.\nE. **FAUX** — Les reflux vésico-urétéraux s'explorent avec une **cystographie isotopique**.",
        },
      ],
    },
    {
      titre: 'Annale 2014 — Session 1 — Questions 12 et 35',
      annee: '2014',
      rappel_cours: "**Sténose réno-vasculaire + IEC** : le DFG est conservé grâce à la compensation (vasoconstriction efférente par AII). Sous IEC : la vasoconstriction efférente diminue → DFG diminué → excrétion du DTPA ralentie. Le MAG3 (flux plasmatique) n'est PAS systématiquement ralenti.\n\n**DMSA** : masse corticale + fonction rénale relative. PAS pour clairance, PAS pour sténoses, PAS pour RVU.",
      questions: [
        {
          enonce: "En cas de sténose réno-vasculaire, toutes les propositions suivantes sont exactes, SAUF UNE. Laquelle ? (L'administration d'un IEC sera désignée par « sous IEC »)",
          items: [
            { lettre: 'A', enonce: "Le débit de filtration glomérulaire est conservé", is_correct: true },
            { lettre: 'B', enonce: "Sous IEC, la vasoconstriction de l'artériole efférente diminue", is_correct: true },
            { lettre: 'C', enonce: "Sous IEC, le débit de filtration glomérulaire est diminué", is_correct: true },
            { lettre: 'D', enonce: "Sous IEC, l'excrétion du DTPA est ralentie", is_correct: true },
            { lettre: 'E', enonce: "Sous IEC, l'excrétion du MAG3 est ralentie", is_correct: false },
          ],
          correction: "**Réponse : E**\n\nA. **VRAI** — En l'absence d'IEC, le DFG est conservé grâce au mécanisme de compensation (vasoconstriction de l'artériole efférente par l'AII).\nB. **VRAI** — L'IEC supprime l'AII → la vasoconstriction de l'artériole efférente diminue.\nC. **VRAI** — Sans la compensation (vasoconstriction efférente), la pression de perfusion chute et le DFG diminue.\nD. **VRAI** — Le DTPA est filtré par le glomérule. Le DFG chute sous IEC → excrétion du DTPA ralentie.\nE. **FAUX** — Le MAG3 est **sécrété** par les tubules proximaux (il mesure le flux plasmatique rénal). Le flux plasmatique ne chute pas nécessairement de façon significative sous IEC → le MAG3 n'est PAS systématiquement ralenti.",
        },
        {
          enonce: "La scintigraphie rénale au 99mTc-DMSA permet :",
          items: [
            { lettre: 'A', enonce: "De visualiser des altérations structurelles des reins", is_correct: true },
            { lettre: 'B', enonce: "De quantifier la masse des néphrons de chaque rein", is_correct: true },
            { lettre: 'C', enonce: "De calculer la clairance rénale de chaque rein", is_correct: false },
            { lettre: 'D', enonce: "D'explorer les sténoses réno-vasculaires", is_correct: false },
            { lettre: 'E', enonce: "D'explorer les reflux vésico-urétéraux", is_correct: false },
          ],
          correction: "**Réponse : AB**\n\nA. **VRAI** — Le DMSA se fixe au parenchyme et permet de visualiser les altérations structurelles.\nB. **VRAI** — Le DMSA quantifie la masse des néphrons fonctionnels de chaque rein.\nC. **FAUX** — Le DMSA se fixe sans être excrété → pas de calcul de clairance possible.\nD. **FAUX** — Les sténoses réno-vasculaires s'explorent avec la scintigraphie dynamique + captopril.\nE. **FAUX** — Les RVU s'explorent avec la cystographie isotopique.",
        },
      ],
    },
    {
      titre: 'Annale 2014 — Session 2 — Questions 6 et 24',
      annee: '2014',
      rappel_cours: "**Radiotraceur exclusivement filtré par le glomérule** = DTPA. Le MAG3 est sécrété par les tubules (PAS filtré). Le DMSA se fixe au parenchyme (NI filtré NI sécrété).\n\n**Syndrome de jonction avec obstacle organique** : le néphrogramme est pathologique, la captation est souvent anormale, et l'excrétion **reste anormale** après Lasilix (l'obstacle organique ne cède PAS sous diurétiques).",
      questions: [
        {
          enonce: "Quel est le radiotraceur exclusivement filtré par le glomérule ?",
          items: [
            { lettre: 'A', enonce: "DMSA-99mTc", is_correct: false },
            { lettre: 'B', enonce: "DTPA-99mTc", is_correct: true },
            { lettre: 'C', enonce: "HMDP-99mTc", is_correct: false },
            { lettre: 'D', enonce: "MAG3-99mTc", is_correct: false },
            { lettre: 'E', enonce: "MIBI-99mTc", is_correct: false },
          ],
          correction: "**Réponse : B**\n\nA. **FAUX** — Le DMSA est capté par le tube contourné proximal, il n'est NI filtré NI sécrété.\nB. **VRAI** — Le **DTPA** est exclusivement **filtré par le glomérule** (filtration glomérulaire pure).\nC. **FAUX** — Le HMDP est un traceur de scintigraphie osseuse.\nD. **FAUX** — Le MAG3 est **sécrété** par les tubules proximaux, il n'est PAS filtré.\nE. **FAUX** — Le MIBI est un traceur utilisé en scintigraphie myocardique et parathyroïdienne.",
        },
        {
          enonce: "Que peut-on observer dans l'exploration d'un syndrome de jonction avec obstacle organique de l'uretère droit avec une scintigraphie rénale dynamique ?",
          items: [
            { lettre: 'A', enonce: "Le néphrogramme de l'examen de base de chaque rein est toujours normal", is_correct: false },
            { lettre: 'B', enonce: "La captation du rein droit sur l'examen de base est toujours normale", is_correct: false },
            { lettre: 'C', enonce: "La captation du rein droit sur l'examen de base est souvent anormale", is_correct: true },
            { lettre: 'D', enonce: "L'excrétion du rein droit après injection de Lasilix reste anormale", is_correct: true },
            { lettre: 'E', enonce: "L'excrétion du rein droit après injection de Lasilix se normalise", is_correct: false },
          ],
          correction: "**Réponse : CD**\n\nA. **FAUX** — En présence d'un obstacle organique, le néphrogramme du rein atteint est **pathologique** (pas de descente, accumulation du traceur).\nB. **FAUX** — La captation du rein atteint n'est PAS toujours normale, elle est souvent perturbée.\nC. **VRAI** — La captation du rein droit est **souvent anormale** en cas d'obstacle organique (retentissement fonctionnel).\nD. **VRAI** — L'excrétion **reste anormale** après Lasilix car l'obstacle organique ne cède PAS sous diurétiques.\nE. **FAUX** — L'excrétion ne se normalise PAS car c'est un obstacle organique (seuls les obstacles fonctionnels/modérés se normalisent après Lasilix).",
        },
      ],
    },
  ],
};

export default content;

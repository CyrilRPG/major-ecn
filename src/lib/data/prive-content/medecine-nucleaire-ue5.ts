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
              { concept: '◆ 2 grandes fonctions rénales', detail_md: "**Homéostasie** : filtration glomérulaire, équilibre hydro-électrolytique, acido-basique, tensionnel\n**Endocrine** : production d'EPO, activation de la vitamine D", kind: 'a_retenir' },
              { concept: '◆ DFG', detail_md: "**Débit de filtration glomérulaire** = volume filtré par unité de temps (mL/min)\nReflète la **fonction rénale globale**", kind: 'a_retenir' },
            ],
          },
          {
            titre: 'Méthodes de mesure du DFG',
            rows: [
              { concept: '◆ Méthode de référence', detail_md: "**Clairance de l'Inuline** = gold standard\nL'inuline est uniquement filtrée, ni réabsorbée ni sécrétée → mesure exacte du DFG\nAlternative : **clairance EDTA ⁵¹Cr** (remplace de plus en plus l'inuline)", kind: 'a_retenir' },
              { concept: 'En pratique courante', detail_md: "Estimation par **clairance de la créatinine** (approximative car créatinine légèrement sécrétée)\n**Cockcroft** : clairance créatinine (mL/min) — peu précis\n**CKD-EPI** : estimation DFG à partir de la créatininémie — **recommandée par la HAS**", kind: 'normal' },
              { concept: '⚠ Clairance créatinine ≠ DFG exact', detail_md: "La créatinine est légèrement **sécrétée** par les tubules → la clairance créatinine **surestime** le DFG réel", kind: 'piege' },
            ],
          },
          {
            titre: 'Fonction rénale différentielle',
            rows: [
              { concept: '◆ Définition', detail_md: "Mesure de la **fonction de chaque rein séparément**\nÉquilibre normal = entre **45% et 55%** chaque rein", kind: 'a_retenir' },
              { concept: 'Moyens d\'évaluation', detail_md: "L'imagerie est le **seul moyen d'évaluation non invasive**\nExamen de référence = **scintigraphie rénale**\nAlternative non irradiante = **uro-IRM** (infos anatomiques + fonctionnelles)", kind: 'normal' },
              { concept: '⚠ Produit de contraste iodé', detail_md: "**DFG < 30 mL/min → pas de produit de contraste iodé**\nRisque de néphrotoxicité", kind: 'piege' },
            ],
          },
          {
            titre: 'Deux types de scintigraphie rénale',
            rows: [
              { concept: '◆ Scintigraphie dynamique', detail_md: "Images successives au cours du temps → **néphrogramme** (activité vs temps)\nTraceur à forte excrétion rénale : **MAG3** ou **DTPA**\nImages pendant 40 minutes sous gamma-caméra\nCouplage possible : diurétiques (furosémide/Lasilix) ou anti-hypertenseurs (captopril)", kind: 'a_retenir' },
              { concept: '◆ Scintigraphie statique', detail_md: "Images **3-4h après injection**, durée ~15 min\nTraceur à fixation parenchymateuse : **DMSA** (reste au rein, PAS excrété)\nPour séquelles rénales, images nettes, vision anatomique", kind: 'a_retenir' },
              { concept: '◆ Traceurs', detail_md: "Tous les traceurs sont marqués au **technétium (⁹⁹ᵐTc)**\n· ⁹⁹ᵐTc-MAG3 : sécrété par tubules proximaux\n· ⁹⁹ᵐTc-DTPA : filtré par glomérule\n· ⁹⁹ᵐTc-DMSA : capté par tube contourné proximal, reste au rein", kind: 'a_retenir' },
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
              { concept: '◆ Objectifs', detail_md: "1. Déterminer la **fonction rénale relative** (chaque rein)\n2. Déterminer l'**excrétion rénale** lors de syndrome obstructif\n3. Guider la **prise en charge thérapeutique**", kind: 'a_retenir' },
              { concept: '◆ Indications', detail_md: "· Obstacles des voies urinaires (**SJPU**, calculs obstructifs)\n· Contrôle **post-greffe**\n· **HTA réno-vasculaire** (HTRV)", kind: 'a_retenir' },
            ],
          },
          {
            titre: 'Principe et traceurs dynamiques',
            rows: [
              { concept: '◆ MAG3 (NéphroMAG)', detail_md: "**Sécrété** par les tubules proximaux, **NON filtré**\nExcrété dans les cavités pyélocalicielles (CPC)", kind: 'a_retenir' },
              { concept: '◆ DTPA', detail_md: "Éliminé par **filtration glomérulaire**\nExcrété dans les CPC", kind: 'a_retenir' },
              { concept: '⚠ MAG3 vs DTPA', detail_md: "Ne pas confondre :\n· MAG3 = **sécrété** (tubules) → NON filtré\n· DTPA = **filtré** (glomérule)\nLes deux sont excrétés dans les CPC", kind: 'piege' },
              { concept: 'Déroulement', detail_md: "Patient sous gamma-caméra → injection IV du traceur radioactif → images pendant **40 minutes**\nAjout possible de Lasilix (furosémide) **20 min après injection** → hyperdiurèse → évalue obstruction", kind: 'normal' },
            ],
          },
          {
            titre: 'Néphrogramme isotopique normal',
            rows: [
              { concept: '◆ 3 phases du néphrogramme', detail_md: "1. **Phase vasculaire** : portion ascendante initiale = perfusion\n2. **Phase fonctionnelle** : montée progressive jusqu'au pic = filtration/sécrétion\n3. **Phase excrétoire** : portion descendante = excrétion du radiotraceur", kind: 'a_retenir' },
              { concept: '◆ Valeurs normales', detail_md: "**T½ excrété < 10 min**\n**RCA < 30%**", kind: 'a_retenir' },
              { concept: 'Rein normal vs pathologique', detail_md: "Rein normal : montée rapide → montée progressive → descente → excrétion quasi complète\nRein pathologique (obstacle) : **pas de partie descendante**, traceur reste dans le rein (ex : obstacle jonction pyélo-urétérale)", kind: 'normal' },
            ],
          },
          {
            titre: 'Fonction rénale relative',
            rows: [
              { concept: '◆ Méthode de calcul', detail_md: "À partir des néphrogrammes : calculer le **% de fonction de chaque rein**\nMéthode : **aire sous la courbe entre la 2ème et la 3ème minute** (segment fonctionnel)", kind: 'a_retenir' },
              { concept: '◆ Valeurs normales', detail_md: "Fonction rénale relative normale = entre **45% et 55%** par rein", kind: 'a_retenir' },
              { concept: '⚠ Pourquoi le segment fonctionnel ?', detail_md: "Pas trop tôt (trop de perfusion dans la 1ère minute)\nLe **segment fonctionnel** (2ème-3ème min) est le plus représentatif de la fonction rénale", kind: 'piege' },
            ],
          },
          {
            titre: 'Évaluation de l\'excrétion et grades d\'O\'Reilly',
            rows: [
              { concept: 'Évaluation de l\'excrétion', detail_md: "Partie distale de la courbe après le pic\nLes diurétiques accélèrent la vidange → évalue si l'obstacle est significatif\n· Obstacle modéré/incomplet : excrétion se **normalise** après diurétiques\n· Obstacle complet : diurétiques **sans effet**", kind: 'normal' },
              { concept: '◆ Grades d\'excrétion (O\'Reilly)', detail_md: "**Grade 0** : aspect normal, Lasilix superflu\n**Groupe 1** : aspect normal\n**Groupe 2** : obstacle complet, Lasilix **sans effet**\n**Groupe 3a** : stase (pas vrai obstacle, vessie dilatée), Lasilix **indispensable**\n**Groupe 3b** : obstruction partielle, Lasilix **indispensable**", kind: 'a_retenir' },
              { concept: 'Mnémo O\'Reilly', detail_md: "\"**0-1 = OK, 2 = Obstrué complet, 3a = stAse, 3b = Bloqué partiel**\"", kind: 'mnemo' },
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
              { concept: '◆ Traceur DMSA', detail_md: "**⁹⁹ᵐTc-DMSA** : NI filtré, NI sécrété\nCapté par le **tube contourné proximal** → reste au rein\nImage statique de **10-15 min**, réalisée **3-4h après injection**", kind: 'a_retenir' },
              { concept: '◆ Ce qu\'évalue le DMSA', detail_md: "· **Masse corticale fonctionnelle**\n· Fonction rénale relative : évaluation de la **fixation totale** (PAS aire sous la courbe)", kind: 'a_retenir' },
              { concept: '⚠ DMSA ≠ clairance', detail_md: "Le DMSA **se fixe** dans le parenchyme rénal et y reste\nIl ne permet PAS de calculer une clairance (pas d'excrétion)", kind: 'piege' },
            ],
          },
          {
            titre: 'Indications en pédiatrie',
            rows: [
              { concept: '◆ Indications principales', detail_md: "· **Retentissement fonctionnel** des uropathies malformatives\n· **Cicatrices corticales** post-pyélonéphrite aiguë\n· Retentissement fonctionnel d'un obstacle", kind: 'a_retenir' },
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
              { concept: '◆ Indication', detail_md: "Diagnostic du **reflux vésico-urétéral (RVU)**, surtout en **pédiatrie**", kind: 'a_retenir' },
              { concept: '◆ Traceurs', detail_md: "⁹⁹ᵐTc-pertéchnétate, ⁹⁹ᵐTc-colloïde ou ⁹⁹ᵐTc-DTPA\nInjection dans la vessie **AVANT** la miction", kind: 'a_retenir' },
              { concept: 'Déroulement', detail_md: "Images dynamiques **PENDANT** la miction\nVisualisation des uretères et pyélons, stagnation dans la vessie\nQualification de l'impact du reflux", kind: 'normal' },
              { concept: '⚠ Ne pas confondre', detail_md: "**Cystographie isotopique** = RVU (injection dans la vessie)\n**Scintigraphie statique DMSA** = cicatrices corticales\n**Scintigraphie dynamique** = obstruction", kind: 'piege' },
            ],
          },
        ],
      },
      {
        numero: 'V',
        titre: 'Scintigraphie au captopril (HTA réno-vasculaire)',
        sous_parties: [
          {
            titre: 'Rappels sur l\'HTA réno-vasculaire',
            rows: [
              { concept: '◆ HTRV', detail_md: "HTA le plus souvent **essentielle**, mais peut être **réno-vasculaire (HTRV)** = curable\n**75%** athéromateuse, **25%** fibrodysplasique\nLever la sténose = protéger le rein + faire disparaître l'HTA", kind: 'a_retenir' },
              { concept: 'Intérêt scintigraphie', detail_md: "Examen **non invasif**, **peu irradiant**\nDétermine si le rein est **incriminé dans l'HTA**", kind: 'normal' },
            ],
          },
          {
            titre: 'Système rénine-angiotensine-aldostérone (RAA)',
            rows: [
              { concept: '◆ Cascade RAA', detail_md: "Angiotensinogène → (rénine) → **Angiotensine I** → (enzyme de conversion) → **Angiotensine II**\nAII : effet systémique (**vasoconstriction**) + rénal (vasoconstriction artériole efférente + rétention hydrosodée → HTA)", kind: 'a_retenir' },
              { concept: '◆ Rôle des IEC', detail_md: "Les **IEC** (captopril) cassent la transition AI → AII\n→ Suppriment la compensation rénale", kind: 'a_retenir' },
            ],
          },
          {
            titre: 'Mécanisme physiopathologique',
            rows: [
              { concept: '◆ Sténose artère rénale', detail_md: "Sténose → ↓ pression de perfusion → rein sécrète rénine → cascade RAA → AII → HTA\nAII vasoconstricte l'**artériole efférente** pour **MAINTENIR** le débit de perfusion (mécanisme de compensation)", kind: 'a_retenir' },
              { concept: '◆ Effet du captopril', detail_md: "IEC (captopril) **casse cette compensation** → chute de la pression de perfusion\n→ Risque d'insuffisance rénale, **effondrement du DFG**", kind: 'a_retenir' },
              { concept: '◆ Interprétation', detail_md: "Comparaison néphrogrammes avec/sans captopril :\n· Néphrogramme **pathologique** (effondrement) après captopril → sténose **EN CAUSE** dans l'HTA\n· **Aucun effet** du captopril → sténose **PAS en cause** dans l'HTA", kind: 'a_retenir' },
            ],
          },
          {
            titre: 'Phases et déroulement',
            rows: [
              { concept: '◆ Phase initiale', detail_md: "Baisse de pression de perfusion → hyperproduction de rénine\nIEC effondre le DFG **unilatéralement**\n→ Lever la sténose = **guérir l'HTA**", kind: 'a_retenir' },
              { concept: '⚠ Phase tardive', detail_md: "DFG effondré de façon chronique\nTraitement de la sténose **SANS effet** sur l'HTA → trop tard", kind: 'piege' },
              { concept: '◆ Préparation du patient', detail_md: "**Arrêt ABSOLU** des IEC et diurétiques\nArrêt du régime sans sel", kind: 'a_retenir' },
              { concept: 'Déroulement examen', detail_md: "1ère partie : scintigraphie dynamique **sans rien** (baseline)\n2ème partie : **5h après** (ou lendemain) avec **captopril PO**, images à 1h\nComparaison des néphrogrammes", kind: 'normal' },
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
              { concept: '◆ Principe', detail_md: "Technique **non irradiante**, séquence IRM au gadolinium\nÉtude de la **captation et excrétion rénales**\nAcquisitions répétées pendant **40 minutes**\nProduit de contraste : **Gadolinium-DTPA** (élimination rénale)", kind: 'a_retenir' },
              { concept: 'Protocole', detail_md: "Injection de Lasilix à la **20ème minute**\nBelles images anatomiques et fonctionnelles", kind: 'normal' },
              { concept: '⚠ Limite importante', detail_md: "En scintigraphie : concentration **linéaire** avec la radioactivité\nEn IRM : linéaire jusqu'à une limite puis **chute du signal** si trop concentré\n→ Belles images mais **peu utilisé** en pratique", kind: 'piege' },
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
              { concept: '◆ Synthèse traceurs', detail_md: "· **MAG3** : sécrété par tubules proximaux → scintigraphie **dynamique**\n· **DTPA** : filtré par glomérule → scintigraphie **dynamique**\n· **DMSA** : capté par TCP, reste au rein → scintigraphie **statique**\n· **Pertéchnétate/colloïde/DTPA** : injection vésicale → **cystographie isotopique**\n· **Gadolinium-DTPA** : élimination rénale → **uro-IRM**", kind: 'a_retenir' },
              { concept: '◆ Synthèse indications', detail_md: "· Fonction rénale relative + excrétion → **scintigraphie dynamique**\n· Cicatrices corticales / masse fonctionnelle → **scintigraphie statique (DMSA)**\n· Reflux vésico-urétéral → **cystographie isotopique**\n· HTA réno-vasculaire → **scintigraphie au captopril**\n· Alternative non irradiante → **uro-IRM**", kind: 'a_retenir' },
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
      "Néphrogramme : 3 phases (vasculaire → fonctionnelle → excrétoire) ; T½ excrété < 10 min",
      "Fonction rénale relative : aire sous la courbe entre 2ème et 3ème minute ; normal = 45-55%",
      "Grades O'Reilly : 0-1 = normal, 2 = obstacle complet (Lasilix sans effet), 3a = stase, 3b = obstruction partielle",
      "DMSA : évalue la masse corticale fonctionnelle, cicatrices post-pyélonéphrite, utilisé en pédiatrie",
      "Cystographie isotopique = diagnostic du RVU, injection dans la vessie AVANT miction, images PENDANT miction",
      "Scintigraphie au captopril : compare avec/sans IEC — effondrement DFG = sténose en cause dans l'HTA",
      "Arrêt ABSOLU des IEC et diurétiques avant scintigraphie au captopril",
      "DFG < 30 mL/min → pas de produit de contraste iodé",
      "Uro-IRM : non irradiante, gadolinium-DTPA, peu utilisée (limite de linéarité du signal)",
    ],
    chiffres_cles: {
      titre: 'Chiffres clés — Explorations fonctionnelles rénales (Médecine Nucléaire)',
      markdown: "| Paramètre | Valeur |\n|---|---|\n| Fonction rénale relative normale | **45-55%** par rein |\n| T½ excrété normal (néphrogramme) | **< 10 min** |\n| RCA normal | **< 30%** |\n| Segment fonctionnel (calcul FRR) | **2ème-3ème minute** |\n| Durée scintigraphie dynamique | **40 min** |\n| Délai scintigraphie statique (DMSA) | **3-4h après injection** |\n| Durée acquisition DMSA | **10-15 min** |\n| Injection Lasilix (dynamique/uro-IRM) | **20ème minute** |\n| Seuil DFG pour produit de contraste iodé | **< 30 mL/min = CI** |\n| HTRV athéromateuse | **75%** |\n| HTRV fibrodysplasique | **25%** |\n| Pic radioactivité néphrogramme normal | **< 5 min** |",
    },
  },
  flashcards: [
    { recto: "Quelles sont les 2 grandes fonctions rénales ?", verso: "· <b>Homéostasie</b> : filtration glomérulaire, équilibre hydro-électrolytique, acido-basique, tensionnel\n· <b>Endocrine</b> : EPO, vitamine D active", order_index: 1 },
    { recto: "Qu'est-ce que le DFG ?", verso: "<b>Débit de filtration glomérulaire</b> = volume filtré par unité de temps (mL/min)\nReflète la <b>fonction rénale globale</b>", order_index: 2 },
    { recto: "Quelle est la méthode de référence pour mesurer le DFG ?", verso: "<b>Clairance de l'Inuline</b> = gold standard\nL'inuline est uniquement filtrée, ni réabsorbée ni sécrétée", order_index: 3 },
    { recto: "Quelle alternative à la clairance de l'Inuline remplace celle-ci ?", verso: "La <b>clairance EDTA ⁵¹Cr</b>", order_index: 4 },
    { recto: "Pourquoi la clairance de la créatinine est-elle approximative ?", verso: "Car la créatinine est légèrement <b>sécrétée</b> par les tubules\n→ La clairance créatinine <b>surestime</b> le DFG réel", order_index: 5 },
    { recto: "Quelle formule d'estimation du DFG est recommandée par la HAS ?", verso: "<b>CKD-EPI</b> : estimation du DFG à partir de la créatininémie\n(Cockcroft = peu précis)", order_index: 6 },
    { recto: "Qu'est-ce que la fonction rénale différentielle ?", verso: "Mesure de la <b>fonction de chaque rein séparément</b>\nÉquilibre normal = entre <b>45% et 55%</b> par rein", order_index: 7 },
    { recto: "Quel est l'examen de référence pour évaluer la fonction rénale différentielle ?", verso: "La <b>scintigraphie rénale</b>\nAlternative non irradiante : <b>uro-IRM</b>", order_index: 8 },
    { recto: "En dessous de quel DFG ne peut-on pas utiliser de produit de contraste iodé ?", verso: "<b>DFG < 30 mL/min</b>\nRisque de néphrotoxicité", order_index: 9 },
    { recto: "Quels sont les 2 types de scintigraphie rénale ?", verso: "· <b>Scintigraphie dynamique</b> : images successives, néphrogramme (MAG3/DTPA)\n· <b>Scintigraphie statique</b> : images 3-4h après injection (DMSA)", order_index: 10 },
    { recto: "Quels traceurs utilise-t-on en scintigraphie dynamique ?", verso: "· <b>MAG3</b> (NéphroMAG) : sécrété par les tubules proximaux\n· <b>DTPA</b> : filtré par le glomérule\nTous deux marqués au <b>⁹⁹ᵐTc</b>", order_index: 11 },
    { recto: "Quel traceur utilise-t-on en scintigraphie statique ?", verso: "<b>⁹⁹ᵐTc-DMSA</b>\nCapté par le tube contourné proximal, reste au rein (PAS excrété)", order_index: 12 },
    { recto: "Avec quel isotope sont marqués tous les traceurs en scintigraphie rénale ?", verso: "Le <b>technétium (⁹⁹ᵐTc)</b>", order_index: 13 },
    { recto: "Combien de temps dure une scintigraphie dynamique ?", verso: "<b>40 minutes</b> (images acquises pendant l'injection)", order_index: 14 },
    { recto: "Combien de temps après l'injection réalise-t-on les images en scintigraphie statique (DMSA) ?", verso: "<b>3-4 heures</b> après injection\nDurée d'acquisition : <b>10-15 min</b>", order_index: 15 },
    { recto: "Quels sont les 3 objectifs de la scintigraphie dynamique ?", verso: "1. <b>Fonction rénale relative</b> (chaque rein)\n2. <b>Excrétion rénale</b> lors de syndrome obstructif\n3. <b>Guide thérapeutique</b>", order_index: 16 },
    { recto: "Quelles sont les indications de la scintigraphie dynamique ?", verso: "· Obstacles des voies urinaires (<b>SJPU</b>, calculs obstructifs)\n· Contrôle <b>post-greffe</b>\n· <b>HTA réno-vasculaire</b> (HTRV)", order_index: 17 },
    { recto: "Le MAG3 est-il filtré ou sécrété ?", verso: "<b>Sécrété</b> par les tubules proximaux, <b>NON filtré</b>\nExcrété dans les CPC", order_index: 18 },
    { recto: "Le DTPA est-il filtré ou sécrété ?", verso: "<b>Filtré</b> par le glomérule (filtration glomérulaire)\nExcrété dans les CPC", order_index: 19 },
    { recto: "À quoi correspond un néphrogramme isotopique ?", verso: "Quantification du radiotraceur au rein <b>en fonction du temps</b>\nCourbe d'activité vs temps avec <b>3 phases</b>", order_index: 20 },
    { recto: "Quelles sont les 3 phases du néphrogramme isotopique normal ?", verso: "1. <b>Phase vasculaire</b> : portion ascendante initiale = perfusion\n2. <b>Phase fonctionnelle</b> : montée progressive jusqu'au pic = filtration/sécrétion\n3. <b>Phase excrétoire</b> : portion descendante = excrétion", order_index: 21 },
    { recto: "Que doit être le T½ excrété sur un néphrogramme normal ?", verso: "<b>T½ excrété < 10 min</b>", order_index: 22 },
    { recto: "Quelle est la valeur normale du RCA sur un néphrogramme ?", verso: "<b>RCA < 30%</b>", order_index: 23 },
    { recto: "Comment se présente le néphrogramme d'un rein avec obstacle ?", verso: "<b>Pas de partie descendante</b>\nLe traceur reste dans le rein (accumulation)\nPas d'excrétion du radiotraceur", order_index: 24 },
    { recto: "Comment calcule-t-on la fonction rénale relative en scintigraphie dynamique ?", verso: "Par l'<b>aire sous la courbe entre la 2ème et la 3ème minute</b> (segment fonctionnel)\nNormal : entre <b>45% et 55%</b>", order_index: 25 },
    { recto: "Pourquoi utilise-t-on le segment fonctionnel (2ème-3ème minute) et pas plus tôt ?", verso: "Avant la 2ème minute : trop de <b>perfusion</b> (phase vasculaire)\nLe segment fonctionnel est le plus <b>représentatif</b> de la fonction rénale", order_index: 26 },
    { recto: "Quel diurétique peut-on coupler à la scintigraphie dynamique ?", verso: "Le <b>furosémide (Lasilix)</b>\nInjecté à la <b>20ème minute</b> pour provoquer une hyperdiurèse\nPermet d'évaluer l'obstruction", order_index: 27 },
    { recto: "Que montre un obstacle modéré/incomplet après injection de Lasilix ?", verso: "L'excrétion se <b>normalise</b> après diurétiques\n→ L'obstacle n'est pas complet", order_index: 28 },
    { recto: "Que montre un obstacle complet après injection de Lasilix ?", verso: "Les diurétiques sont <b>sans effet</b>\n→ Le traceur ne s'évacue toujours pas", order_index: 29 },
    { recto: "Que signifie le Grade 0 d'O'Reilly ?", verso: "Aspect <b>normal</b>, Lasilix superflu", order_index: 30 },
    { recto: "Que signifie le Groupe 1 d'O'Reilly ?", verso: "Aspect <b>normal</b>", order_index: 31 },
    { recto: "Que signifie le Groupe 2 d'O'Reilly ?", verso: "<b>Obstacle complet</b>, Lasilix <b>sans effet</b>", order_index: 32 },
    { recto: "Que signifie le Groupe 3a d'O'Reilly ?", verso: "<b>Stase</b> (pas un vrai obstacle, vessie dilatée)\nLasilix <b>indispensable</b> pour vider", order_index: 33 },
    { recto: "Que signifie le Groupe 3b d'O'Reilly ?", verso: "<b>Obstruction partielle</b>\nLasilix <b>indispensable</b>", order_index: 34 },
    { recto: "Le DMSA est-il filtré ? Sécrété ?", verso: "Le DMSA n'est <b>NI filtré NI sécrété</b>\nIl est <b>capté</b> par le tube contourné proximal et <b>reste au rein</b>", order_index: 35 },
    { recto: "Qu'évalue la scintigraphie statique au DMSA ?", verso: "· La <b>masse corticale fonctionnelle</b>\n· La <b>fonction rénale relative</b> (par fixation totale, PAS aire sous la courbe)", order_index: 36 },
    { recto: "Le DMSA permet-il de calculer une clairance ?", verso: "<b>Non</b>\nLe DMSA se fixe dans le parenchyme rénal sans être excrété\n→ Pas de mesure de clairance possible", order_index: 37 },
    { recto: "Quelles sont les indications du DMSA en pédiatrie ?", verso: "· Retentissement fonctionnel des <b>uropathies malformatives</b>\n· <b>Cicatrices corticales</b> post-pyélonéphrite aiguë\n· Retentissement fonctionnel d'un obstacle", order_index: 38 },
    { recto: "Comment se présente un DMSA normal ?", verso: "Fixation <b>homogène et symétrique</b> des deux reins", order_index: 39 },
    { recto: "Quelle est l'indication de la cystographie isotopique ?", verso: "Diagnostic du <b>reflux vésico-urétéral (RVU)</b>\nSurtout en <b>pédiatrie</b>", order_index: 40 },
    { recto: "Quels traceurs utilise-t-on pour la cystographie isotopique ?", verso: "· ⁹⁹ᵐTc-<b>pertéchnétate</b>\n· ⁹⁹ᵐTc-<b>colloïde</b>\n· ⁹⁹ᵐTc-<b>DTPA</b>", order_index: 41 },
    { recto: "Comment se déroule une cystographie isotopique ?", verso: "Injection du traceur dans la <b>vessie AVANT</b> la miction\nImages dynamiques <b>PENDANT</b> la miction\nVisualisation des uretères, pyélons, stagnation vésicale", order_index: 42 },
    { recto: "HTA essentielle vs HTA réno-vasculaire : quelle différence ?", verso: "· <b>HTA essentielle</b> : la plus fréquente, sans cause identifiable\n· <b>HTRV</b> : secondaire à une sténose de l'artère rénale = <b>curable</b>", order_index: 43 },
    { recto: "Quelles sont les 2 causes d'HTRV et leur proportion ?", verso: "· <b>75%</b> athéromateuse\n· <b>25%</b> fibrodysplasique", order_index: 44 },
    { recto: "Décrire la cascade du système rénine-angiotensine-aldostérone (RAA)", verso: "Angiotensinogène → (<b>rénine</b>) → Angiotensine I → (<b>enzyme de conversion</b>) → <b>Angiotensine II</b>\nAII : vasoconstriction systémique + rétention hydrosodée → HTA", order_index: 45 },
    { recto: "Quel est l'effet rénal de l'angiotensine II ?", verso: "· <b>Vasoconstriction</b> de l'artériole efférente\n· <b>Rétention hydrosodée</b>\n→ Maintien du débit de perfusion et HTA", order_index: 46 },
    { recto: "Quel est le rôle de la vasoconstriction de l'artériole efférente par l'AII ?", verso: "<b>Maintenir le débit de perfusion</b> en aval d'une sténose\nC'est un <b>mécanisme de compensation</b>", order_index: 47 },
    { recto: "Comment agissent les IEC (captopril) ?", verso: "Les IEC <b>cassent la transition</b> Angiotensine I → Angiotensine II\n→ Suppriment la compensation rénale", order_index: 48 },
    { recto: "Que se passe-t-il quand on donne du captopril en cas de sténose de l'artère rénale ?", verso: "Le captopril <b>casse la compensation</b> (vasoconstriction efférente)\n→ <b>Chute de pression de perfusion</b>\n→ Risque d'insuffisance rénale, <b>effondrement du DFG</b>", order_index: 49 },
    { recto: "Comment interpréter un néphrogramme pathologique après captopril ?", verso: "Effondrement du DFG après captopril → la <b>sténose est EN CAUSE</b> dans l'HTA\nLever la sténose = guérir l'HTA", order_index: 50 },
    { recto: "Comment interpréter un néphrogramme inchangé après captopril ?", verso: "Aucun effet du captopril → la <b>sténose N'EST PAS en cause</b> dans l'HTA\nL'HTA est d'une autre origine", order_index: 51 },
    { recto: "Quelle est la différence entre phase initiale et phase tardive dans l'HTRV ?", verso: "· <b>Phase initiale</b> : hyperproduction rénine → IEC effondre DFG unilatéralement → lever sténose = guérir HTA\n· <b>Phase tardive</b> : DFG effondré → traitement sténose <b>SANS effet</b> sur HTA", order_index: 52 },
    { recto: "Quelle préparation du patient avant scintigraphie au captopril ?", verso: "· <b>Arrêt ABSOLU</b> des IEC et diurétiques\n· Arrêt du régime sans sel", order_index: 53 },
    { recto: "Comment se déroule la scintigraphie au captopril ?", verso: "1ère partie : scintigraphie dynamique <b>sans rien</b> (baseline)\n2ème partie : <b>5h après</b> (ou lendemain) avec <b>captopril PO</b>, images à 1h\nComparaison des néphrogrammes", order_index: 54 },
    { recto: "Quel produit de contraste utilise-t-on en uro-IRM ?", verso: "<b>Gadolinium-DTPA</b>\nÉlimination rénale", order_index: 55 },
    { recto: "Combien de temps durent les acquisitions en uro-IRM ?", verso: "<b>40 minutes</b> d'acquisitions répétées\nInjection de Lasilix à la <b>20ème minute</b>", order_index: 56 },
    { recto: "Quelle est la limite principale de l'uro-IRM par rapport à la scintigraphie ?", verso: "En scintigraphie : concentration <b>linéaire</b> avec radioactivité\nEn IRM : linéaire jusqu'à une limite puis <b>chute du signal</b> si trop concentré\n→ Peu utilisé en pratique", order_index: 57 },
    { recto: "Quel est le principal avantage de l'uro-IRM ?", verso: "Technique <b>non irradiante</b> (pas de radioactivité)\nInformations anatomiques + fonctionnelles", order_index: 58 },
    { recto: "Quel examen pour évaluer les cicatrices corticales post-pyélonéphrite ?", verso: "La <b>scintigraphie statique au DMSA</b>", order_index: 59 },
    { recto: "Quel examen pour évaluer un obstacle des voies urinaires ?", verso: "La <b>scintigraphie dynamique</b> (MAG3/DTPA ± Lasilix)", order_index: 60 },
    { recto: "Quel examen pour diagnostiquer un reflux vésico-urétéral ?", verso: "La <b>cystographie isotopique</b>\n(PAS la scintigraphie statique ni dynamique)", order_index: 61 },
    { recto: "Quel examen pour évaluer une HTA réno-vasculaire ?", verso: "La <b>scintigraphie au captopril</b>\n(scintigraphie dynamique avec/sans captopril)", order_index: 62 },
    { recto: "Comment calcule-t-on la fonction rénale relative en scintigraphie statique (DMSA) ?", verso: "Par évaluation de la <b>fixation totale</b> de chaque rein\n(PAS par l'aire sous la courbe comme en dynamique)", order_index: 63 },
    { recto: "VRAI ou FAUX : le MAG3 est filtré par le glomérule", verso: "<b>FAUX</b>\nLe MAG3 est <b>sécrété</b> par les tubules proximaux, NON filtré\nC'est le <b>DTPA</b> qui est filtré", order_index: 64 },
    { recto: "VRAI ou FAUX : le DMSA est excrété dans les urines", verso: "<b>FAUX</b>\nLe DMSA est capté par le TCP et <b>reste au rein</b>\nIl n'est NI filtré NI sécrété NI excrété", order_index: 65 },
    { recto: "VRAI ou FAUX : la scintigraphie dynamique acquiert des images 6h après l'injection", verso: "<b>FAUX</b>\nLes images sont acquises <b>pendant l'injection</b>, pendant <b>40 minutes</b>", order_index: 66 },
    { recto: "VRAI ou FAUX : la scintigraphie dynamique donne une fonction rénale absolue", verso: "<b>FAUX</b>\nElle donne une fonction rénale <b>relative</b> (% de chaque rein)\nPas une valeur absolue de DFG", order_index: 67 },
    { recto: "VRAI ou FAUX : le pic de radioactivité sur un néphrogramme normal survient avant 5 min", verso: "<b>VRAI</b>\nLe pic de la courbe (max radioactivité) survient <b>avant 5 minutes</b>", order_index: 68 },
    { recto: "VRAI ou FAUX : la phase d'excrétion du néphrogramme correspond à un plateau", verso: "<b>FAUX</b>\nLa phase d'excrétion correspond à la <b>portion descendante</b> de la courbe\nUn plateau signerait un obstacle", order_index: 69 },
    { recto: "VRAI ou FAUX : le DMSA permet d'évaluer les sténoses de l'artère rénale", verso: "<b>FAUX</b>\nLes sténoses sont évaluées par la scintigraphie <b>dynamique + captopril</b>\nLe DMSA évalue la masse corticale fonctionnelle", order_index: 70 },
    { recto: "VRAI ou FAUX : la cystographie isotopique permet de diagnostiquer le RVU", verso: "<b>VRAI</b>\nInjection dans la vessie avant miction, images pendant miction", order_index: 71 },
    { recto: "En vue postérieure, la droite du patient est-elle inversée ?", verso: "<b>Non</b>\nEn vue postérieure, <b>la droite reste à droite</b>", order_index: 72 },
    { recto: "Quelle est la physiopathologie initiale de l'HTRV ?", verso: "Sténose artère rénale → <b>↓ pression de perfusion</b>\n→ Sécrétion de <b>rénine</b> par le rein\n→ Cascade RAA → AII → <b>HTA</b>", order_index: 73 },
    { recto: "Pourquoi l'artériole efférente se vasoconstricte-t-elle en cas de sténose ?", verso: "C'est un <b>mécanisme de compensation</b> via l'angiotensine II\nBut : <b>maintenir le débit de perfusion</b> malgré la baisse de pression en amont", order_index: 74 },
    { recto: "Pourquoi les IEC sont-ils dangereux en cas de sténose bilatérale ?", verso: "Les IEC cassent la compensation (vasoconstriction efférente) <b>des deux côtés</b>\n→ <b>Effondrement du DFG bilatéral</b>\n→ Insuffisance rénale aiguë", order_index: 75 },
    { recto: "À quel moment injecte-t-on le Lasilix en scintigraphie dynamique ?", verso: "À la <b>20ème minute</b> après le début de l'examen", order_index: 76 },
    { recto: "Quelle est la différence entre stase (3a) et obstruction partielle (3b) d'O'Reilly ?", verso: "· <b>3a = stase</b> : pas un vrai obstacle, vessie dilatée\n· <b>3b = obstruction partielle</b> : vrai obstacle mais incomplet\nDans les 2 cas, Lasilix est <b>indispensable</b>", order_index: 77 },
    { recto: "Quel est l'exemple classique d'obstacle en scintigraphie dynamique ?", verso: "Obstacle de la <b>jonction pyélo-urétérale</b>\nNéphrogramme : pas de descente, traceur reste dans le rein", order_index: 78 },
    { recto: "En scintigraphie au captopril, la scintigraphie avec captopril se fait combien de temps après la baseline ?", verso: "<b>5 heures après</b> (ou le lendemain)\nCaptopril donné par voie orale, images à 1h", order_index: 79 },
    { recto: "Que signifie SJPU ?", verso: "<b>Syndrome de la jonction pyélo-urétérale</b>\nIndication de la scintigraphie dynamique", order_index: 80 },
    { recto: "VRAI ou FAUX : l'uro-IRM est la technique la plus utilisée pour l'exploration fonctionnelle rénale", verso: "<b>FAUX</b>\nL'uro-IRM produit de belles images mais est <b>peu utilisée</b> en pratique\nLa <b>scintigraphie</b> reste la référence", order_index: 81 },
    { recto: "VRAI ou FAUX : en scintigraphie au captopril, il faut arrêter les IEC et les diurétiques", verso: "<b>VRAI</b>\nArrêt <b>ABSOLU</b> des IEC et diurétiques + arrêt du régime sans sel", order_index: 82 },
    { recto: "VRAI ou FAUX : la scintigraphie dynamique peut être couplée à un ECG", verso: "<b>FAUX</b>\nLa scintigraphie rénale n'est pas couplée à un ECG\n(c'est la scintigraphie cardiaque qui l'est)", order_index: 83 },
    { recto: "Quels sont les traceurs utilisables en scintigraphie rénale dynamique ? (2)", verso: "· <b>⁹⁹ᵐTc-MAG3</b> (NéphroMAG) : sécrété par tubules\n· <b>⁹⁹ᵐTc-DTPA</b> : filtré par glomérule", order_index: 84 },
    { recto: "Quels sont les traceurs utilisables en scintigraphie rénale statique ?", verso: "<b>⁹⁹ᵐTc-DMSA</b> uniquement\nCapté par le TCP, reste au rein", order_index: 85 },
    { recto: "Quel radiotraceur est exclusivement filtré ?", verso: "Le <b>DTPA</b> (⁹⁹ᵐTc-DTPA)\nFiltration glomérulaire exclusive", order_index: 86 },
    { recto: "En cas de syndrome de jonction avec obstacle organique, le Lasilix normalise-t-il l'excrétion ?", verso: "<b>Non</b>\nL'excrétion reste <b>anormale</b> après Lasilix = obstacle <b>organique</b>\n(un obstacle fonctionnel se normalise après Lasilix)", order_index: 87 },
    { recto: "VRAI ou FAUX : en cas de sténose réno-vasculaire + IEC, le MAG3 est systématiquement ralenti", verso: "<b>FAUX</b>\nLe MAG3 n'est pas systématiquement ralenti car le <b>flux plasmatique ne chute pas nécessairement</b>\n(le MAG3 mesure le flux plasmatique rénal, pas le DFG)", order_index: 88 },
    { recto: "Résumer les traceurs : MAG3, DTPA, DMSA — mécanisme et type de scintigraphie", verso: "· <b>MAG3</b> : sécrété (tubules) → dynamique\n· <b>DTPA</b> : filtré (glomérule) → dynamique\n· <b>DMSA</b> : fixé (TCP) → statique", order_index: 89 },
    { recto: "Résumer les examens de médecine nucléaire rénale et leurs indications", verso: "· <b>Dynamique</b> : fonction relative, obstruction, post-greffe\n· <b>Statique (DMSA)</b> : cicatrices, masse corticale\n· <b>Cystographie isotopique</b> : RVU\n· <b>Captopril</b> : HTRV\n· <b>Uro-IRM</b> : alternative non irradiante", order_index: 90 },
  ],
  annales: [
    {
      titre: 'Annale 2019 — Session 1/2 — Scintigraphie dynamique et captopril',
      annee: '2019',
      rappel_cours: "**Scintigraphie dynamique** : images acquises pendant l'injection pendant 40 min (PAS 6h après). Traceurs : MAG3 (sécrété par tubules, NON filtré) et DTPA (filtré par glomérule). Tous marqués au ⁹⁹ᵐTc.\n\n**Scintigraphie au captopril** : compare les néphrogrammes avec et sans IEC. MAG3 est sécrété par les tubules proximaux, PAS filtré. DTPA est filtré par le glomérule.\n\n**Retenir** : MAG3 = Sécrété ≠ DTPA = Filtré.",
      questions: [
        {
          enonce: "Concernant la scintigraphie dynamique au MAG3 couplée au Lasilix, toutes les propositions suivantes sont vraies SAUF UNE. Laquelle ?",
          items: [
            { lettre: 'A', enonce: "Le MAG3 est un traceur à forte excrétion rénale", is_correct: true },
            { lettre: 'B', enonce: "Les images sont acquises 6h après l'injection du traceur", is_correct: false },
            { lettre: 'C', enonce: "L'examen dure environ 40 minutes", is_correct: true },
            { lettre: 'D', enonce: "Le Lasilix permet d'évaluer l'obstruction", is_correct: true },
            { lettre: 'E', enonce: "Le traceur est marqué au technétium (⁹⁹ᵐTc)", is_correct: true },
          ],
          correction: "**Réponse : B**\n\nA. **VRAI** — Le MAG3 est un traceur à forte excrétion rénale, sécrété par les tubules proximaux.\nB. **FAUX** — Les images sont acquises **pendant l'injection**, durant **40 minutes**. Ce n'est PAS 6h après l'injection. La scintigraphie statique (DMSA) fait les images 3-4h après, mais la dynamique est en temps réel.\nC. **VRAI** — L'examen dure environ 40 minutes.\nD. **VRAI** — Le Lasilix (furosémide) injecté à 20 min provoque une hyperdiurèse permettant d'évaluer si un obstacle est complet ou incomplet.\nE. **VRAI** — Tous les traceurs de scintigraphie rénale sont marqués au technétium (⁹⁹ᵐTc).",
        },
        {
          enonce: "Concernant la scintigraphie au MAG3 couplée au captopril, toutes les propositions suivantes sont vraies SAUF UNE. Laquelle ?",
          items: [
            { lettre: 'A', enonce: "Elle permet d'évaluer l'implication d'une sténose de l'artère rénale dans l'HTA", is_correct: true },
            { lettre: 'B', enonce: "Le MAG3 est un traceur filtré par le glomérule", is_correct: false },
            { lettre: 'C', enonce: "L'examen compare les néphrogrammes avec et sans captopril", is_correct: true },
            { lettre: 'D', enonce: "Il faut arrêter les IEC avant l'examen", is_correct: true },
            { lettre: 'E', enonce: "Un effondrement du DFG après captopril indique que la sténose est en cause", is_correct: true },
          ],
          correction: "**Réponse : B**\n\nA. **VRAI** — La scintigraphie au captopril détermine si la sténose est responsable de l'HTA.\nB. **FAUX** — Le MAG3 est **sécrété par les tubules proximaux**, il n'est **PAS filtré**. C'est le **DTPA** qui est filtré par le glomérule.\nC. **VRAI** — On compare un néphrogramme baseline (sans rien) et un néphrogramme après captopril PO.\nD. **VRAI** — Il faut un arrêt ABSOLU des IEC et diurétiques avant l'examen.\nE. **VRAI** — L'effondrement du DFG après captopril signifie que la sténose est en cause dans l'HTA (le captopril casse la compensation par l'AII).",
        },
      ],
    },
    {
      titre: 'Annale 2017 — Session 2 — Traceurs de la fonction rénale',
      annee: '2017',
      rappel_cours: "**Traceurs en scintigraphie rénale** :\n· ⁹⁹ᵐTc-MAG3 : scintigraphie **dynamique** (sécrété par tubules)\n· ⁹⁹ᵐTc-DTPA : scintigraphie **dynamique** (filtré par glomérule)\n· ⁹⁹ᵐTc-DMSA : scintigraphie **statique** (capté par TCP, reste au rein)\n\nLes autres traceurs (FDG, Iode, MIBI...) ne sont pas des traceurs de la fonction rénale.",
      questions: [
        {
          enonce: "Parmi les radiotraceurs suivants, lesquels sont utilisés pour l'étude de la fonction rénale ?",
          items: [
            { lettre: 'A', enonce: "⁹⁹ᵐTc-MAG3 (scintigraphie dynamique)", is_correct: true },
            { lettre: 'B', enonce: "⁹⁹ᵐTc-DMSA (scintigraphie statique)", is_correct: true },
            { lettre: 'C', enonce: "¹⁸F-FDG", is_correct: false },
            { lettre: 'D', enonce: "¹²³I-MIBG", is_correct: false },
            { lettre: 'E', enonce: "⁹⁹ᵐTc-MIBI", is_correct: false },
          ],
          correction: "**Réponse : AB**\n\nA. **VRAI** — Le ⁹⁹ᵐTc-MAG3 est un traceur de scintigraphie dynamique rénale (sécrété par les tubules proximaux).\nB. **VRAI** — Le ⁹⁹ᵐTc-DMSA est un traceur de scintigraphie statique rénale (capté par le TCP, évalue la masse corticale).\nC. **FAUX** — Le ¹⁸F-FDG est un traceur du métabolisme glucidique utilisé en oncologie (TEP-scan), pas pour la fonction rénale.\nD. **FAUX** — Le ¹²³I-MIBG est un traceur utilisé pour l'exploration des tumeurs neuro-endocrines (phéochromocytome, neuroblastome).\nE. **FAUX** — Le ⁹⁹ᵐTc-MIBI est un traceur utilisé en scintigraphie myocardique de perfusion et pour les parathyroïdes.",
        },
      ],
    },
    {
      titre: 'Annale 2015/2016 — Session 1 — Néphrogramme au MAG3',
      annee: '2015-2016',
      rappel_cours: "**Néphrogramme isotopique** : courbe d'activité vs temps avec 3 phases (vasculaire, fonctionnelle, excrétoire).\n\nLa scintigraphie dynamique donne une **fonction rénale relative** (PAS absolue). Le pic de radioactivité survient **avant 5 minutes**. La phase d'excrétion = portion **descendante** de la courbe (PAS un plateau). L'examen n'est PAS couplé à un ECG.",
      questions: [
        {
          enonce: "Concernant le néphrogramme au MAG3, quelles propositions sont vraies ?",
          items: [
            { lettre: 'A', enonce: "La scintigraphie dynamique est couplée à un ECG", is_correct: false },
            { lettre: 'B', enonce: "Elle permet de déterminer la fonction rénale absolue", is_correct: false },
            { lettre: 'C', enonce: "Le néphrogramme comporte 3 phases : vasculaire, fonctionnelle, excrétoire", is_correct: true },
            { lettre: 'D', enonce: "Le maximum de radioactivité survient avant 5 minutes", is_correct: true },
            { lettre: 'E', enonce: "La phase d'excrétion correspond à un plateau de la courbe", is_correct: false },
          ],
          correction: "**Réponse : CD**\n\nA. **FAUX** — La scintigraphie rénale dynamique n'est **PAS couplée à un ECG**. C'est la scintigraphie myocardique qui peut être synchronisée à l'ECG.\nB. **FAUX** — Elle donne une **fonction rénale relative** (% de chaque rein), PAS une valeur absolue de DFG.\nC. **VRAI** — Le néphrogramme comporte bien 3 phases : vasculaire (perfusion), fonctionnelle (filtration/sécrétion), excrétoire (excrétion).\nD. **VRAI** — Le maximum de radioactivité (pic de la courbe) survient normalement **avant 5 minutes**.\nE. **FAUX** — La phase d'excrétion correspond à la **portion descendante** de la courbe, PAS un plateau. Un plateau signerait une rétention/obstacle.",
        },
      ],
    },
    {
      titre: 'Annale 2015 — Session 2 — DMSA',
      annee: '2015',
      rappel_cours: "**⁹⁹ᵐTc-DMSA** : traceur de scintigraphie statique. NI filtré NI sécrété, capté par le TCP et reste au rein.\n\nÉvalue la **masse corticale fonctionnelle** et la **fonction rénale relative** (fixation totale). Ne permet PAS de calculer une clairance. PAS utilisé pour les sténoses (→ dynamique + captopril) ni pour le RVU (→ cystographie isotopique).",
      questions: [
        {
          enonce: "Concernant la scintigraphie rénale au DMSA, quelles propositions sont vraies ?",
          items: [
            { lettre: 'A', enonce: "Le DMSA permet d'évaluer la masse corticale fonctionnelle", is_correct: true },
            { lettre: 'B', enonce: "Le DMSA permet de déterminer la fonction rénale relative", is_correct: true },
            { lettre: 'C', enonce: "Le DMSA permet de calculer la clairance rénale", is_correct: false },
            { lettre: 'D', enonce: "Le DMSA est utilisé pour évaluer les sténoses de l'artère rénale", is_correct: false },
            { lettre: 'E', enonce: "Le DMSA permet de diagnostiquer un reflux vésico-urétéral", is_correct: false },
          ],
          correction: "**Réponse : AB**\n\nA. **VRAI** — Le DMSA se fixe dans le parenchyme rénal et permet d'évaluer la **masse corticale fonctionnelle**.\nB. **VRAI** — Il permet de déterminer la **fonction rénale relative** par évaluation de la fixation totale de chaque rein.\nC. **FAUX** — Le DMSA **se fixe** dans le rein sans être excrété → il ne permet PAS de calculer une clairance.\nD. **FAUX** — Les sténoses de l'artère rénale sont évaluées par la scintigraphie **dynamique + captopril**, pas par le DMSA.\nE. **FAUX** — Le RVU est diagnostiqué par la **cystographie isotopique** (injection dans la vessie), pas par le DMSA.",
        },
      ],
    },
    {
      titre: 'Annale 2014 — Session 1 — Sténose réno-vasculaire et DMSA',
      annee: '2014',
      rappel_cours: "**Scintigraphie au captopril** : en cas de sténose réno-vasculaire + IEC :\n· Chute du DFG (car IEC casse la compensation par vasoconstriction efférente)\n· Le MAG3 mesure le flux plasmatique rénal, pas le DFG → il n'est PAS systématiquement ralenti\n· Le DTPA (filtré) est plus directement impacté\n\n**DMSA** : masse corticale fonctionnelle + fonction rénale relative. PAS pour clairance, PAS pour sténoses, PAS pour RVU.",
      questions: [
        {
          enonce: "Concernant la scintigraphie rénale en cas de sténose réno-vasculaire avec IEC, toutes les propositions suivantes sont vraies SAUF UNE. Laquelle ?",
          items: [
            { lettre: 'A', enonce: "Les IEC cassent la compensation par vasoconstriction de l'artériole efférente", is_correct: true },
            { lettre: 'B', enonce: "Le DFG peut s'effondrer sous IEC en cas de sténose significative", is_correct: true },
            { lettre: 'C', enonce: "La comparaison avec/sans captopril permet de déterminer si la sténose cause l'HTA", is_correct: true },
            { lettre: 'D', enonce: "Il faut arrêter les IEC et les diurétiques avant l'examen", is_correct: true },
            { lettre: 'E', enonce: "Le MAG3 est systématiquement ralenti en cas de sténose avec IEC", is_correct: false },
          ],
          correction: "**Réponse : E**\n\nA. **VRAI** — Les IEC (captopril) suppriment l'angiotensine II qui vasoconstricte l'artériole efférente pour compenser la sténose.\nB. **VRAI** — Sans la compensation (vasoconstriction efférente), la pression de perfusion chute et le DFG peut s'effondrer.\nC. **VRAI** — C'est le principe même de la scintigraphie au captopril : comparer baseline vs post-captopril.\nD. **VRAI** — Arrêt ABSOLU des IEC et diurétiques pour que le test soit interprétable.\nE. **FAUX** — Le MAG3 n'est **PAS systématiquement ralenti** car il mesure le **flux plasmatique rénal** (sécrétion tubulaire), qui ne chute pas nécessairement. Le DFG (mesuré par le DTPA) est plus directement impacté.",
        },
        {
          enonce: "Concernant la scintigraphie rénale au DMSA, quelles propositions sont vraies ?",
          items: [
            { lettre: 'A', enonce: "Le DMSA permet d'évaluer la masse corticale fonctionnelle", is_correct: true },
            { lettre: 'B', enonce: "Le DMSA permet de déterminer la fonction rénale relative", is_correct: true },
            { lettre: 'C', enonce: "Le DMSA permet de calculer la clairance rénale", is_correct: false },
            { lettre: 'D', enonce: "Le DMSA est utilisé pour évaluer les sténoses de l'artère rénale", is_correct: false },
            { lettre: 'E', enonce: "Le DMSA permet de diagnostiquer un reflux vésico-urétéral", is_correct: false },
          ],
          correction: "**Réponse : AB**\n\nA. **VRAI** — Le DMSA se fixe dans le parenchyme rénal et permet d'évaluer la **masse corticale fonctionnelle**.\nB. **VRAI** — Il permet de déterminer la **fonction rénale relative** par évaluation de la fixation totale de chaque rein.\nC. **FAUX** — Le DMSA **se fixe** dans le rein sans être excrété → il ne permet PAS de calculer une clairance.\nD. **FAUX** — Les sténoses de l'artère rénale sont évaluées par la scintigraphie **dynamique + captopril**, pas par le DMSA.\nE. **FAUX** — Le RVU est diagnostiqué par la **cystographie isotopique**, pas par le DMSA.",
        },
      ],
    },
    {
      titre: 'Annale 2014 — Session 2 — Radiotraceur filtré et syndrome de jonction',
      annee: '2014',
      rappel_cours: "**Radiotraceur exclusivement filtré** = DTPA (filtration glomérulaire). Le MAG3 est sécrété par les tubules. Le DMSA se fixe au parenchyme.\n\n**Syndrome de jonction avec obstacle organique** : le néphrogramme est pathologique (pas de descente), la captation est souvent anormale, et l'excrétion **reste anormale** après Lasilix (l'obstacle organique ne cède pas sous diurétiques).",
      questions: [
        {
          enonce: "Parmi les radiotraceurs suivants, lequel est exclusivement filtré par le glomérule ?",
          items: [
            { lettre: 'A', enonce: "⁹⁹ᵐTc-MAG3", is_correct: false },
            { lettre: 'B', enonce: "⁹⁹ᵐTc-DTPA", is_correct: true },
            { lettre: 'C', enonce: "⁹⁹ᵐTc-DMSA", is_correct: false },
            { lettre: 'D', enonce: "⁹⁹ᵐTc-pertéchnétate", is_correct: false },
            { lettre: 'E', enonce: "⁹⁹ᵐTc-colloïde", is_correct: false },
          ],
          correction: "**Réponse : B**\n\nA. **FAUX** — Le MAG3 est **sécrété** par les tubules proximaux, il n'est PAS filtré.\nB. **VRAI** — Le **DTPA** est exclusivement **filtré par le glomérule** (filtration glomérulaire pure).\nC. **FAUX** — Le DMSA est **capté** par le tube contourné proximal, il n'est NI filtré NI sécrété.\nD. **FAUX** — Le pertéchnétate est utilisé en cystographie isotopique (injection vésicale), pas pour mesurer la filtration glomérulaire.\nE. **FAUX** — Le colloïde est utilisé en cystographie isotopique, pas pour la filtration glomérulaire.",
        },
        {
          enonce: "Concernant le syndrome de jonction avec obstacle organique en scintigraphie dynamique, quelles propositions sont vraies ?",
          items: [
            { lettre: 'A', enonce: "Le néphrogramme est normal", is_correct: false },
            { lettre: 'B', enonce: "L'excrétion se normalise après injection de Lasilix", is_correct: false },
            { lettre: 'C', enonce: "La captation est souvent anormale", is_correct: true },
            { lettre: 'D', enonce: "L'excrétion reste anormale après injection de Lasilix", is_correct: true },
            { lettre: 'E', enonce: "Le traceur s'évacue spontanément sans diurétique", is_correct: false },
          ],
          correction: "**Réponse : CD**\n\nA. **FAUX** — En cas d'obstacle organique, le néphrogramme est **pathologique** (pas de partie descendante, accumulation du traceur).\nB. **FAUX** — C'est l'inverse : l'excrétion **reste anormale** après Lasilix en cas d'obstacle organique. C'est en cas d'obstacle fonctionnel/modéré que l'excrétion se normalise.\nC. **VRAI** — La captation est **souvent anormale** en cas d'obstacle organique (retentissement sur la fonction rénale).\nD. **VRAI** — L'excrétion **reste anormale** après injection de Lasilix car l'obstacle organique ne cède pas sous diurétiques (contrairement à l'obstacle fonctionnel).\nE. **FAUX** — Le traceur NE s'évacue PAS spontanément, il stagne en amont de l'obstacle.",
        },
      ],
    },
  ],
};

export default content;

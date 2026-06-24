import type { PriveCourseContent } from '../prive-courses';

const content: PriveCourseContent = {
  fiche: {
    parties: [
      {
        numero: 'I',
        titre: 'Pression artérielle',
        sous_parties: [
          {
            titre: 'Définition et formule',
            rows: [
              { concept: '◆ Formule de la PA', detail_md: "**PA = DC x RVS**\n· DC = débit cardiaque\n· RVS = résistances vasculaires systémiques", kind: 'a_retenir' },
              { concept: 'Composantes', detail_md: "· **PAS** = pression artérielle systolique (maximum)\n· **PAD** = pression artérielle diastolique (minimum)\n· **PAM** = pression artérielle moyenne", kind: 'normal' },
            ],
          },
          {
            titre: 'Mesure de la PA',
            rows: [
              { concept: '◆ Conditions de mesure', detail_md: "· Patient **semi-assis** ou en **décubitus**\n· Au **repos depuis 5 minutes** minimum\n· Au **calme**, pas de café, tabac, drogues\n· Brassard **adapté** : doit couvrir **3/4 de la circonférence** du bras\n· Brassard placé **en regard de l'artère humérale**\n· Bras à **hauteur du cœur**", kind: 'a_retenir' },
              { concept: '⚠ Taille du brassard', detail_md: "Brassard **trop petit** → **surestimation** de la PA\nBrassard **trop grand** → **sous-estimation** de la PA", kind: 'piege' },
              { concept: 'Technique auscultatoire', detail_md: "1. **Stéthoscope** sous le brassard au **pli du coude**\n2. Gonfler **30 mmHg au-dessus** de la PAS supposée\n3. Dégonfler **lentement**\n4. **Premier bruit** de Korotkoff = **PAS**\n5. **Disparition** des bruits = **PAD**", kind: 'normal' },
              { concept: '⚠ Rythme irrégulier', detail_md: "Risque d'**erreur de mesure** si rythme cardiaque irrégulier (ACFA, extrasystoles)\n→ Répéter les mesures et moyenner", kind: 'piege' },
            ],
          },
          {
            titre: 'Seuils et valeurs normales',
            rows: [
              { concept: '◆ Seuils de PA', detail_md: "· **PA optimale** : < 120/80 mmHg\n· **HTA** : > **140/90** mmHg (en consultation)\n· **PA normale** en auto-mesure : < **135/85** mmHg", kind: 'a_retenir' },
              { concept: '◆ Seuils MAPA', detail_md: "· PA jour : < **135/85** mmHg\n· PA nuit : < **120/70** mmHg\n· PA moyenne 24h : < **130/80** mmHg", kind: 'a_retenir' },
            ],
          },
          {
            titre: 'HTA et ses conséquences',
            rows: [
              { concept: '◆ Épidémiologie HTA', detail_md: "· **17 millions** de Français touchés\n· **30%** de la population générale\n· **10%** à 30 ans → **80%** à 80 ans", kind: 'a_retenir' },
              { concept: '◆ Conséquences de l\'HTA', detail_md: "· **Hypertrophie cardiaque**\n· **Insuffisance cardiaque** (risque x6)\n· **Insuffisance rénale**\n· **Artériopathie**\n· **AVC**\n· **Infarctus du myocarde**", kind: 'a_retenir' },
              { concept: 'Mnémo conséquences HTA', detail_md: "\"**HIARIA**\" : Hypertrophie cardiaque, IC (x6), Artériopathie, Rein (IR), Infarctus, AVC", kind: 'mnemo' },
            ],
          },
          {
            titre: 'Auto-mesure et MAPA',
            rows: [
              { concept: '◆ Règle des 3 (auto-mesure)', detail_md: "· **3** mesures consécutives\n· **2** fois par jour (matin et soir)\n· Pendant **3** jours\nNormale PA < **135/85** mmHg", kind: 'a_retenir' },
              { concept: 'HTA blouse blanche', detail_md: "PA > 140/90 mmHg **en consultation** mais PA **normale** en dehors\n→ L'auto-mesure et la MAPA permettent de la dépister", kind: 'normal' },
            ],
          },
          {
            titre: 'Hypotension orthostatique',
            rows: [
              { concept: '◆ Définition', detail_md: "Baisse de la **PAS > 20 mmHg** et/ou **PAD > 10 mmHg** lors du passage en orthostatisme\n**Pathologique** si persiste entre **1 et 3 minutes**", kind: 'a_retenir' },
              { concept: 'Épidémiologie', detail_md: "· **7%** de la population générale\n· **16%** après **65 ans**", kind: 'normal' },
              { concept: '⚠ Piège orthostatisme', detail_md: "Toujours rechercher une hypotension orthostatique chez le **sujet âgé** et lors de l'**introduction d'un traitement antihypertenseur**", kind: 'piege' },
              { concept: 'Pouls paradoxal', detail_md: "Variation de la PA systolique avec le **cycle respiratoire**\n· Normal < 10 mmHg\n· Augmenté dans : **tamponnade**, asthme sévère, péricardite constrictive", kind: 'normal' },
            ],
          },
        ],
      },
      {
        numero: 'II',
        titre: 'Protéinurie',
        sous_parties: [
          {
            titre: 'Physiologie de la filtration des protéines',
            rows: [
              { concept: '◆ Principe de filtration', detail_md: "Les protéines > **70 kD** ne sont **pas filtrées** par le glomérule\n· **Albumine** (60-70 kD) : peu filtrée (taille limite)\n· Protéines < 70 kD : filtrées puis **réabsorbées** par le tube proximal", kind: 'a_retenir' },
              { concept: '◆ Protéinurie physiologique', detail_md: "· Protéinurie normale : **80 mg/j** en moyenne, < **300 mg/j**\n· Albuminurie normale : **0-30 mg/j**", kind: 'a_retenir' },
              { concept: 'Composition de la protéinurie physiologique', detail_md: "· **60%** = protéines plasmatiques de **faible PM** (lysozyme, bêta-2 microglobuline, chaînes légères kappa/lambda) → réabsorbées par le tube\n· **40%** = protéines **tubulaires** : uromoduline (protéine de **Tamm-Horsfall**)", kind: 'normal' },
            ],
          },
          {
            titre: 'Types de protéinurie pathologique',
            rows: [
              { concept: '◆ Protéinurie glomérulaire', detail_md: "Membrane glomérulaire **poreuse** → passage anormal de l'**albumine**\n· **Syndrome néphrotique** : protéinurie > **3 g/j** + albuminémie < **30 g/L**", kind: 'a_retenir' },
              { concept: '◆ Protéinurie tubulaire', detail_md: "Glomérule **normal** mais le tube **ne réabsorbe plus** les protéines filtrées\n· Faible débit : < **2 g/j**\n· **Peu d'albumine** (ce sont surtout des protéines de faible PM)", kind: 'a_retenir' },
              { concept: '◆ Protéinurie de surcharge', detail_md: "Excès de **petites protéines** plasmatiques dépassant la capacité de réabsorption :\n· **Chaînes légères Ig** (22,5 kD) → **myélome**\n· **Myoglobine** (17,2 kD) → **rhabdomyolyse**\n· **Hémoglobine** (64,4 kD) → **hémolyse intravasculaire**", kind: 'a_retenir' },
              { concept: '⚠ Piège surcharge', detail_md: "La protéinurie de surcharge n'est **PAS** d'origine rénale !\nLe glomérule et le tube sont normaux → c'est un **excès de production** en amont", kind: 'piege' },
            ],
          },
          {
            titre: 'Dépistage par bandelette urinaire (BU)',
            rows: [
              { concept: '◆ Principe BU', detail_md: "La BU détecte **uniquement l'albumine** (virage colorimétrique)", kind: 'a_retenir' },
              { concept: '⚠ Faux positifs BU', detail_md: "· BU **périmée**\n· Urines **alcalines**\n· **Hématurie macroscopique**", kind: 'piege' },
              { concept: '⚠ Faux négatifs BU', detail_md: "Protéinurie **sans albumine** :\n· **Myoglobinurie** (rhabdomyolyse)\n· **Hémoglobinurie** (hémolyse)\n· **Chaînes légères** (myélome)\n→ BU normale malgré une protéinurie significative !", kind: 'piege' },
            ],
          },
          {
            titre: 'Confirmation et exploration',
            rows: [
              { concept: '◆ Confirmation', detail_md: "· Dosage au **rouge de pyrogallol** (détecte toutes les protéines)\n· Protéinurie des **24h** (créatininurie de contrôle : **8-12 mmol/24h**)\n· Ratio **protéinurie/créatininurie** : normal < **30 mg/mmol** (< 300 mg/g)", kind: 'a_retenir' },
              { concept: '◆ Électrophorèse des protéines urinaires', detail_md: "· **Pic d'albumine** → protéinurie **glomérulaire**\n· **Pic de chaînes légères** → **myélome** (protéinurie de surcharge)", kind: 'a_retenir' },
              { concept: 'Micro-albuminurie', detail_md: "Albuminurie entre **30 et 300 mg/j**\n→ Marqueur précoce de **néphropathie diabétique** et de risque cardiovasculaire", kind: 'normal' },
            ],
          },
          {
            titre: 'Protéinuries transitoires',
            rows: [
              { concept: 'Protéinurie transitoire (sans atteinte rénale)', detail_md: "· **Fièvre**\n· **Insuffisance cardiaque**\n· **Effort intense**\n· **Infection urinaire**", kind: 'normal' },
              { concept: 'Protéinurie orthostatique', detail_md: "· Sujet **jeune** (< 20 ans)\n· Protéinurie présente en orthostatisme, absente en clinostatisme\n· **Bénigne**, disparaît avec l'âge", kind: 'normal' },
            ],
          },
        ],
      },
      {
        numero: 'III',
        titre: 'Hématurie',
        sous_parties: [
          {
            titre: 'Définitions et seuils',
            rows: [
              { concept: '◆ Définition quantitative', detail_md: "· **Macroscopique** : > **1 million GR/mL** (visible à l'oeil nu)\n· **Microscopique** : **10 000 – 1 million GR/mL**\n· **Normale** : < **10 000 GR/mL**", kind: 'a_retenir' },
              { concept: '◆ Caillot = lésion urologique', detail_md: "La présence de **caillots** oriente vers une **lésion urologique** (pas glomérulaire)", kind: 'a_retenir' },
            ],
          },
          {
            titre: 'Urines rouges sans hématurie',
            rows: [
              { concept: '⚠ Urines rouges sans sang', detail_md: "Causes non hématiques d'urines rouges :\n· **Betterave**, **rhubarbe** (alimentaires)\n· **Rifampicine** (médicament)\n· **Hémoglobine libre** (hémolyse intravasculaire)\n· **Myoglobine** (rhabdomyolyse)", kind: 'piege' },
              { concept: '⚠ Faux positifs BU hématurie', detail_md: "La BU détecte le **fer** de l'hème → positive en cas de :\n· **Hémoglobinurie** (hémolyse)\n· **Myoglobinurie** (rhabdomyolyse)\n→ Ce ne sont PAS de vraies hématuries !", kind: 'piege' },
            ],
          },
          {
            titre: 'Épreuve des 3 verres',
            rows: [
              { concept: '◆ Épreuve des 3 verres', detail_md: "· **1er verre** rouge uniquement → origine **urétrale/prostatique** (initiale)\n· **Dernier verre** rouge uniquement → origine **vésicale** (terminale)\n· **Tous les verres** rouges → origine **rénale** (totale)", kind: 'a_retenir' },
              { concept: 'Mnémo 3 verres', detail_md: "\"**1er = Urètre, Dernier = Vessie, Tous = Rein**\"\nDu bas vers le haut : le 1er verre lave l'urètre, le dernier recueille le fond vésical, les 3 = atteinte haute", kind: 'mnemo' },
            ],
          },
          {
            titre: 'ECBU',
            rows: [
              { concept: '◆ Conditions de prélèvement ECBU', detail_md: "· **Toilette antiseptique** préalable\n· Recueil du **milieu de jet** (éliminer le 1er jet)\n· **1ère miction du matin** de préférence\n· **Centrifugation** pour analyse du culot", kind: 'a_retenir' },
              { concept: 'Conservation ECBU', detail_md: "· **2 heures** à température ambiante\n· **24 heures** à **4°C**", kind: 'normal' },
            ],
          },
        ],
      },
      {
        numero: 'IV',
        titre: 'Bilan hydrique et sodé',
        sous_parties: [
          {
            titre: 'Compartiments hydriques',
            rows: [
              { concept: '◆ Eau corporelle totale', detail_md: "· **Adulte** : **60%** du poids corporel\n· **Bébé** : **80%**\n· **Personne âgée** : **50%**", kind: 'a_retenir' },
              { concept: '◆ Répartition des compartiments', detail_md: "· **Intracellulaire** : **40%** du poids corporel (2/3 de l'eau totale)\n· **Extracellulaire** : **20%** du poids corporel (1/3 de l'eau totale)\n  - Interstitiel : **15%**\n  - Plasmatique : **5%**", kind: 'a_retenir' },
              { concept: 'Osmolalité plasmatique', detail_md: "Normale = **290-300 mosmol/kg**\nMaintenue par l'équilibre entre les entrées et sorties d'eau", kind: 'normal' },
            ],
          },
          {
            titre: 'Régulation par l\'ADH',
            rows: [
              { concept: '◆ ADH (hormone antidiurétique)', detail_md: "· **Synthèse** : noyaux supra-optiques et paraventriculaires de l'**hypothalamus**\n· **Stockage** : **posthypophyse** (neurohypophyse)\n· Action : réabsorption d'eau au tube collecteur (aquaporines)", kind: 'a_retenir' },
              { concept: '◆ Stimulation de l\'ADH', detail_md: "· **Osmorécepteurs** (hypothalamiques) : stimulés par ↑ osmolalité plasmatique\n· **Barorécepteurs** (aortiques et carotidiens) : stimulés par ↓ volémie/PA", kind: 'a_retenir' },
              { concept: '⚠ Piège ADH', detail_md: "L'ADH est **synthétisée** dans l'hypothalamus mais **stockée et libérée** par la posthypophyse → ne pas confondre site de synthèse et site de libération", kind: 'piege' },
            ],
          },
          {
            titre: 'Système rénine-angiotensine-aldostérone (SRAA)',
            rows: [
              { concept: '◆ Cascade SRAA', detail_md: "**Rénine** (cellules juxtaglomérulaires)\n→ Angiotensinogène → **Angiotensine I**\n→ ECA → **Angiotensine II**\n\nEffets de l'angiotensine II :\n· **Vasoconstriction** artériolaire\n· Stimulation de la sécrétion d'**aldostérone** (surrénales)\n· Stimulation de la **soif** (centre hypothalamique)", kind: 'a_retenir' },
              { concept: 'Rôle de l\'aldostérone', detail_md: "· Réabsorption de **Na⁺** au tube collecteur (via ENaC)\n· Excrétion de **K⁺** et **H⁺**\n· Réabsorption d'**eau** (suit le Na⁺)\n→ ↑ volémie → ↑ PA", kind: 'normal' },
              { concept: 'Mnémo SRAA', detail_md: "\"**R-A-A-V-A-S**\" : Rénine → Angiotensine → Aldostérone → Vasoconstriction + Aldostérone + Soif", kind: 'mnemo' },
            ],
          },
          {
            titre: 'Régulation du volume extracellulaire',
            rows: [
              { concept: '◆ Sel et volume EC', detail_md: "Le **sel (NaCl)** est le principal déterminant du **volume extracellulaire**\nExcès de sel → ↑ osmolalité → ↑ ADH → rétention d'eau → **↑ volume EC** → **œdèmes**", kind: 'a_retenir' },
              { concept: '⚠ Sel vs Eau', detail_md: "Le **sel** régule le **volume EC** (secteur interstitiel + plasmatique)\nL'**eau** régule l'**osmolalité** (et donc le volume IC)\n→ Ne pas confondre bilan hydrique et bilan sodé !", kind: 'piege' },
            ],
          },
        ],
      },
    ],
    points_cles: [
      "PA = DC x RVS — Brassard trop petit = surestimation, trop grand = sous-estimation",
      "PA optimale < 120/80 mmHg — HTA si ≥ 140/90 mmHg en consultation",
      "Auto-mesure : Règle des 3 (3 mesures, 2 fois/j, 3 jours) — seuil HTA 135/85 mmHg",
      "MAPA : PA jour < 135/85 — PA nuit < 120/70 — PA moyenne < 130/80",
      "Hypotension orthostatique : ↓ PAS > 20 mmHg et/ou ↓ PAD > 10 mmHg — pathologique si persiste 1-3 min",
      "Protéinurie physiologique < 300 mg/j — albuminurie normale 0-30 mg/j",
      "Syndrome néphrotique : protéinurie > 3 g/j + albuminémie < 30 g/L",
      "3 types de protéinurie pathologique : glomérulaire (albumine), tubulaire (< 2 g/j, peu d'albumine), surcharge (chaînes légères, myoglobine, Hb)",
      "BU détecte UNIQUEMENT l'albumine — faux négatifs si chaînes légères / myoglobine / Hb libre",
      "Hématurie macroscopique > 1M GR/mL ; microscopique 10 000-1M ; caillot = urologique",
      "Épreuve des 3 verres : 1er = urètre, dernier = vessie, tous = rein",
      "Eau corporelle : adulte 60%, bébé 80%, personne âgée 50% — IC 40%, EC 20% (interstitiel 15%, plasmatique 5%)",
      "ADH : synthèse hypothalamus (noyaux supra-optiques/paraventriculaires), stockage posthypophyse",
      "SRAA : rénine → AI → AII (ECA) → vasoconstriction + aldostérone",
      "Le sel régule le volume EC — l'eau régule l'osmolalité",
    ],
    chiffres_cles: {
      titre: 'Chiffres clés — Sémiologie : PA, Protéinurie, Hématurie, Bilan hydrosodé',
      markdown: "| Paramètre | Valeur |\n|---|---|\n| PA optimale | < **120/80** mmHg |\n| Seuil HTA (consultation) | > **140/90** mmHg |\n| Seuil HTA (auto-mesure) | > **135/85** mmHg |\n| PA nuit MAPA | < **120/70** mmHg |\n| PA moyenne MAPA 24h | < **130/80** mmHg |\n| HTA en France | **17 millions** (30% population) |\n| Hypotension orthostatique PAS | Chute > **20 mmHg** |\n| Hypotension orthostatique PAD | Chute > **10 mmHg** |\n| Hypotension orthostatique > 65 ans | **16%** |\n| Protéinurie physiologique | < **300 mg/j** (moy. 80 mg/j) |\n| Albuminurie normale | **0-30 mg/j** |\n| Micro-albuminurie | **30-300 mg/j** |\n| Syndrome néphrotique (protéinurie) | > **3 g/j** |\n| Syndrome néphrotique (albuminémie) | < **30 g/L** |\n| Protéinurie tubulaire | < **2 g/j** |\n| Ratio protéinurie/créatininurie normal | < **30 mg/mmol** |\n| Créatininurie de contrôle (24h) | **8-12 mmol/24h** |\n| Hématurie macroscopique | > **1 000 000 GR/mL** |\n| Hématurie microscopique | **10 000 – 1 000 000 GR/mL** |\n| GR urinaires normaux | < **10 000 GR/mL** |\n| Chaînes légères Ig (PM) | **22,5 kD** |\n| Myoglobine (PM) | **17,2 kD** |\n| Hémoglobine (PM) | **64,4 kD** |\n| Albumine (PM) | **60-70 kD** |\n| Osmolalité plasmatique normale | **290-300 mosmol/kg** |\n| Eau corporelle adulte | **60%** |\n| Eau corporelle bébé | **80%** |\n| Eau corporelle personne âgée | **50%** |\n| Compartiment intracellulaire | **40%** du poids |\n| Compartiment extracellulaire | **20%** du poids |\n| Secteur interstitiel | **15%** du poids |\n| Secteur plasmatique | **5%** du poids |",
    },
  },
  flashcards: [
    // --- PRESSION ARTÉRIELLE ---
    { recto: "Quelle est la formule de la pression artérielle ?", verso: "<b>PA = DC x RVS</b>\n· DC = débit cardiaque\n· RVS = résistances vasculaires systémiques", order_index: 1 },
    { recto: "Quelles sont les conditions de mesure de la PA ?", verso: "· Patient <b>semi-assis</b> ou décubitus\n· Au <b>calme depuis 5 minutes</b>\n· Brassard <b>adapté</b> à la circonférence du bras\n· 1ère consultation : mesure en décubitus ET <b>orthostatisme</b>", order_index: 2 },
    { recto: "Comment mesure-t-on la PA au brassard manuel ?", verso: "1. <b>Stéthoscope</b> sur l'<b>artère humérale</b>\n2. Gonfler <b>30 mmHg au-dessus</b> de la PAS estimée\n3. Dégonfler lentement\n4. <b>Premier bruit</b> = PAS\n5. <b>Disparition</b> des bruits = PAD", order_index: 3 },
    { recto: "Quel est le seuil définissant l'HTA en consultation ?", verso: "PA > <b>140/90</b> mmHg", order_index: 4 },
    { recto: "Quelle est la valeur de PA optimale ?", verso: "PA < <b>120/80</b> mmHg", order_index: 5 },
    { recto: "Quelles sont les conséquences de l'HTA chronique ? (6)", verso: "· <b>Hypertrophie cardiaque</b>\n· <b>Insuffisance cardiaque</b> (risque x6)\n· <b>Insuffisance rénale</b>\n· <b>Artériopathie</b>\n· <b>AVC</b>\n· <b>Infarctus du myocarde</b>", order_index: 6 },
    { recto: "De combien l'HTA multiplie-t-elle le risque d'insuffisance cardiaque ?", verso: "Le risque d'IC est multiplié par <b>6</b>", order_index: 7 },
    { recto: "Qu'est-ce que la règle des 3 en auto-mesure de PA ?", verso: "· <b>3</b> mesures consécutives\n· <b>2</b> fois par jour (matin et soir)\n· Pendant <b>3</b> jours\nNormale : PA < <b>135/85</b> mmHg", order_index: 8 },
    { recto: "Quel est le seuil de PA normale en auto-mesure ?", verso: "PA < <b>135/85</b> mmHg", order_index: 9 },
    { recto: "Quels sont les seuils de PA en MAPA ?", verso: "· PA jour : < <b>135/85</b> mmHg\n· PA nuit : < <b>120/70</b> mmHg\n· PA moyenne 24h : < <b>130/80</b> mmHg", order_index: 10 },
    { recto: "Combien de personnes sont touchées par l'HTA en France ?", verso: "<b>17 millions</b> de personnes\nSoit <b>30%</b> de la population", order_index: 11 },
    { recto: "Quelle est la prévalence de l'HTA à 30 ans et à 80 ans ?", verso: "· <b>10%</b> à 30 ans\n· <b>80%</b> à 80 ans", order_index: 12 },
    { recto: "Qu'est-ce que l'HTA de la blouse blanche ?", verso: "PA > <b>140/90</b> mmHg <b>en consultation</b> mais PA <b>normale</b> en dehors\n→ Diagnostiquée par auto-mesure ou MAPA", order_index: 13 },
    { recto: "Comment définit-on l'hypotension orthostatique ?", verso: "Baisse de la <b>PAS > 20 mmHg</b> et/ou <b>PAD > 10 mmHg</b> lors du passage en orthostatisme", order_index: 14 },
    { recto: "Quelle est la prévalence de l'hypotension orthostatique dans la population générale ?", verso: "<b>7%</b> de la population générale\n<b>16%</b> après <b>65 ans</b>", order_index: 15 },
    { recto: "Pourquoi faut-il mesurer la PA en orthostatisme à la 1ère consultation ?", verso: "Pour dépister une <b>hypotension orthostatique</b>, fréquente chez le sujet âgé (<b>16% après 65 ans</b>) et lors de l'introduction d'antihypertenseurs", order_index: 16 },

    // --- PROTÉINURIE ---
    { recto: "Quel est le seuil de taille des protéines filtrées par le glomérule ?", verso: "Les protéines > <b>70 kD</b> ne sont <b>pas filtrées</b>\nL'albumine (60-70 kD) est peu filtrée (taille limite)", order_index: 17 },
    { recto: "Quelle est la valeur normale de la protéinurie ?", verso: "<b>80 mg/j</b> en moyenne\nToujours < <b>300 mg/j</b>", order_index: 18 },
    { recto: "Quelle est la valeur normale de l'albuminurie ?", verso: "<b>0-30 mg/j</b>", order_index: 19 },
    { recto: "Quelle est la composition de la protéinurie physiologique ?", verso: "· <b>60%</b> = protéines plasmatiques de <b>faible PM</b> (lysozyme, bêta-2 microglobuline, chaînes légères kappa/lambda)\n· <b>40%</b> = protéines <b>tubulaires</b> : uromoduline (protéine de Tamm-Horsfall)", order_index: 20 },
    { recto: "Qu'est-ce que l'uromoduline ?", verso: "= Protéine de <b>Tamm-Horsfall</b>\nProtéine <b>tubulaire</b> qui représente <b>40%</b> de la protéinurie physiologique", order_index: 21 },
    { recto: "Qu'est-ce qu'une protéinurie glomérulaire ?", verso: "Membrane glomérulaire <b>poreuse</b> → passage anormal de l'<b>albumine</b>\nCaractéristique : <b>prédominance d'albumine</b> à l'électrophorèse", order_index: 22 },
    { recto: "Quels sont les critères du syndrome néphrotique ?", verso: "· Protéinurie > <b>3 g/j</b>\n· Albuminémie < <b>30 g/L</b>", order_index: 23 },
    { recto: "Qu'est-ce qu'une protéinurie tubulaire ?", verso: "· Glomérule <b>normal</b> mais le tube <b>ne réabsorbe plus</b>\n· Faible débit : < <b>2 g/j</b>\n· <b>Peu d'albumine</b> (protéines de faible PM)", order_index: 24 },
    { recto: "Qu'est-ce qu'une protéinurie de surcharge ?", verso: "Excès de <b>petites protéines</b> plasmatiques dépassant la capacité de réabsorption tubulaire\nGlomérule et tube sont <b>normaux</b>", order_index: 25 },
    { recto: "Citer 3 causes de protéinurie de surcharge avec le PM des protéines", verso: "· <b>Chaînes légères Ig</b> (22,5 kD) → <b>myélome</b>\n· <b>Myoglobine</b> (17,2 kD) → <b>rhabdomyolyse</b>\n· <b>Hémoglobine</b> (64,4 kD) → <b>hémolyse intravasculaire</b>", order_index: 26 },
    { recto: "Quel est le PM des chaînes légères d'immunoglobulines ?", verso: "<b>22,5 kD</b>\nAssociées au <b>myélome</b>", order_index: 27 },
    { recto: "Quel est le PM de la myoglobine ?", verso: "<b>17,2 kD</b>\nÉlevée dans la <b>rhabdomyolyse</b>", order_index: 28 },
    { recto: "Quel est le PM de l'hémoglobine ?", verso: "<b>64,4 kD</b>\nÉlevée dans l'<b>hémolyse intravasculaire</b>", order_index: 29 },
    { recto: "Que détecte la BU en termes de protéinurie ?", verso: "<b>Uniquement l'albumine</b> (virage colorimétrique spécifique)", order_index: 30 },
    { recto: "Quelles sont les causes de faux positifs à la BU pour la protéinurie ?", verso: "· BU <b>périmée</b>\n· Urines <b>alcalines</b>\n· <b>Hématurie macroscopique</b>", order_index: 31 },
    { recto: "Quelles sont les causes de faux négatifs à la BU pour la protéinurie ?", verso: "Protéinurie <b>sans albumine</b> :\n· <b>Myoglobinurie</b> (rhabdomyolyse)\n· <b>Hémoglobinurie</b> (hémolyse)\n· <b>Chaînes légères</b> (myélome)", order_index: 32 },
    { recto: "Pourquoi la BU est-elle faussement négative dans le myélome ?", verso: "Car le myélome produit des <b>chaînes légères</b> d'immunoglobulines, et la BU ne détecte que l'<b>albumine</b>", order_index: 33 },
    { recto: "Comment confirme-t-on une protéinurie dépistée à la BU ?", verso: "· Dosage au <b>rouge de pyrogallol</b> (détecte toutes les protéines)\n· <b>Protéinurie des 24h</b> (contrôle par créatininurie 8-12 mmol/24h)\n· Ratio <b>protéinurie/créatininurie</b> < 30 mg/mmol", order_index: 34 },
    { recto: "Quelle est la valeur normale du ratio protéinurie/créatininurie ?", verso: "< <b>30 mg/mmol</b> (ou < 300 mg/g)", order_index: 35 },
    { recto: "Quelle est la créatininurie attendue pour valider un recueil urinaire de 24h ?", verso: "<b>8-12 mmol/24h</b>\nUne valeur en dehors de cette fourchette suggère un recueil incomplet ou excessif", order_index: 36 },
    { recto: "Que montre l'électrophorèse des protéines urinaires ?", verso: "· <b>Pic d'albumine</b> → protéinurie <b>glomérulaire</b>\n· <b>Pic de chaînes légères</b> → <b>myélome</b> (surcharge)", order_index: 37 },
    { recto: "Qu'est-ce que la micro-albuminurie ?", verso: "Albuminurie entre <b>30 et 300 mg/j</b>\nMarqueur précoce de <b>néphropathie diabétique</b> et de risque cardiovasculaire", order_index: 38 },
    { recto: "Citer 4 causes de protéinurie transitoire sans atteinte rénale", verso: "· <b>Fièvre</b>\n· <b>Insuffisance cardiaque</b>\n· <b>Effort intense</b>\n· <b>Infection urinaire</b>", order_index: 39 },
    { recto: "Qu'est-ce que la protéinurie orthostatique ?", verso: "· Sujet <b>jeune</b> (< 20 ans)\n· Protéinurie présente en <b>orthostatisme</b>, absente en clinostatisme\n· <b>Bénigne</b>, disparaît avec l'âge", order_index: 40 },
    { recto: "Comment différencier protéinurie glomérulaire et tubulaire ?", verso: "<b>Glomérulaire</b> : prédominance d'<b>albumine</b>, débit souvent élevé (peut > 3 g/j)\n<b>Tubulaire</b> : <b>peu d'albumine</b>, faible débit (< 2 g/j), protéines de faible PM", order_index: 41 },
    { recto: "Quel PM a l'albumine ?", verso: "<b>60-70 kD</b>\nTaille limite pour la filtration glomérulaire (peu filtrée normalement)", order_index: 42 },

    // --- HÉMATURIE ---
    { recto: "À partir de quel seuil parle-t-on d'hématurie macroscopique ?", verso: "> <b>1 million de GR/mL</b> (visible à l'oeil nu)", order_index: 43 },
    { recto: "Quel est le seuil d'hématurie microscopique ?", verso: "<b>10 000 – 1 000 000 GR/mL</b>", order_index: 44 },
    { recto: "Quelle est la valeur normale de GR dans les urines ?", verso: "< <b>10 000 GR/mL</b>", order_index: 45 },
    { recto: "Citer 4 causes d'urines rouges sans hématurie vraie", verso: "· <b>Betterave</b>, rhubarbe (alimentaire)\n· <b>Rifampicine</b> (médicament)\n· <b>Hémoglobine libre</b> (hémolyse intravasculaire)\n· <b>Myoglobine</b> (rhabdomyolyse)", order_index: 46 },
    { recto: "Pourquoi la BU peut être faussement positive pour l'hématurie ?", verso: "Car la BU détecte le <b>fer</b> de l'hème → positive en cas de :\n· <b>Hémoglobinurie</b> (hémolyse)\n· <b>Myoglobinurie</b> (rhabdomyolyse)\nCe ne sont pas des hématuries vraies", order_index: 47 },
    { recto: "Comment interpréter l'épreuve des 3 verres ?", verso: "· <b>1er verre</b> rouge → origine <b>urétrale/prostatique</b>\n· <b>Dernier verre</b> rouge → origine <b>vésicale</b>\n· <b>Tous les verres</b> rouges → origine <b>rénale</b>", order_index: 48 },
    { recto: "Une hématurie avec caillots oriente vers quelle origine ?", verso: "Vers une <b>lésion urologique</b> (pas glomérulaire)\nLes hématuries glomérulaires ne forment <b>pas de caillots</b>", order_index: 49 },
    { recto: "Quelles sont les conditions de prélèvement d'un ECBU ?", verso: "· <b>Toilette antiseptique</b>\n· Recueil du <b>milieu de jet</b>\n· <b>1ère miction du matin</b> de préférence\n· <b>Centrifugation</b> pour analyse", order_index: 50 },
    { recto: "Quelles sont les conditions de conservation d'un ECBU ?", verso: "· <b>2 heures</b> à température ambiante\n· <b>24 heures</b> à <b>4°C</b>", order_index: 51 },
    { recto: "Pourquoi recueille-t-on le milieu de jet pour l'ECBU ?", verso: "Pour <b>éliminer la contamination</b> par la flore urétrale et périnéale\nLe 1er jet lave l'urètre, le milieu de jet est <b>représentatif</b> de l'urine vésicale", order_index: 52 },

    // --- BILAN HYDRIQUE ET SODÉ ---
    { recto: "Quel pourcentage du poids corporel représente l'eau chez l'adulte ?", verso: "<b>60%</b> du poids corporel", order_index: 53 },
    { recto: "Quel pourcentage du poids corporel représente l'eau chez le bébé ?", verso: "<b>80%</b> du poids corporel", order_index: 54 },
    { recto: "Quel pourcentage du poids corporel représente l'eau chez la personne âgée ?", verso: "<b>50%</b> du poids corporel", order_index: 55 },
    { recto: "Quelle est la répartition de l'eau corporelle entre les compartiments ?", verso: "· <b>Intracellulaire</b> : <b>40%</b> du poids (2/3 de l'eau totale)\n· <b>Extracellulaire</b> : <b>20%</b> du poids (1/3 de l'eau totale)\n  - Interstitiel : 15%\n  - Plasmatique : 5%", order_index: 56 },
    { recto: "Quel pourcentage du poids corporel représente le secteur plasmatique ?", verso: "<b>5%</b> du poids corporel", order_index: 57 },
    { recto: "Quel pourcentage du poids corporel représente le secteur interstitiel ?", verso: "<b>15%</b> du poids corporel", order_index: 58 },
    { recto: "Quelle est l'osmolalité plasmatique normale ?", verso: "<b>290-300 mosmol/kg</b>", order_index: 59 },
    { recto: "Où est synthétisée l'ADH ?", verso: "Dans les noyaux supra-optiques et paraventriculaires de l'<b>hypothalamus</b>", order_index: 60 },
    { recto: "Où est stockée et libérée l'ADH ?", verso: "Dans la <b>posthypophyse</b> (neurohypophyse)\nAttention : synthèse dans l'hypothalamus, stockage/libération dans la posthypophyse", order_index: 61 },
    { recto: "Quels sont les 2 types de récepteurs qui stimulent la sécrétion d'ADH ?", verso: "· <b>Osmorécepteurs</b> hypothalamiques (stimulés par ↑ osmolalité)\n· <b>Barorécepteurs</b> aortiques et carotidiens (stimulés par ↓ volémie/PA)", order_index: 62 },
    { recto: "Quel est l'effet principal de l'ADH au niveau rénal ?", verso: "<b>Réabsorption d'eau</b> au niveau du <b>tube collecteur</b>\nVia l'insertion d'<b>aquaporines</b> dans la membrane apicale", order_index: 63 },
    { recto: "Quelle est la cascade du système rénine-angiotensine-aldostérone ?", verso: "<b>Rénine</b> (cellules juxtaglomérulaires)\n→ Angiotensinogène → <b>Angiotensine I</b>\n→ ECA → <b>Angiotensine II</b>\n→ Vasoconstriction + Aldostérone + Soif", order_index: 64 },
    { recto: "Quels sont les 3 effets de l'angiotensine II ?", verso: "· <b>Vasoconstriction</b> artériolaire\n· Stimulation de l'<b>aldostérone</b> (surrénales)\n· Stimulation de la <b>soif</b> (hypothalamus)", order_index: 65 },
    { recto: "Où est produite la rénine ?", verso: "Par les <b>cellules juxtaglomérulaires</b> du rein (appareil juxtaglomérulaire)", order_index: 66 },
    { recto: "Quel est le rôle de l'aldostérone au niveau rénal ?", verso: "· Réabsorption de <b>Na⁺</b> (via ENaC au tube collecteur)\n· Excrétion de <b>K⁺</b> et <b>H⁺</b>\n· Réabsorption d'<b>eau</b> (suit le Na⁺)\n→ ↑ volémie et PA", order_index: 67 },
    { recto: "Où est produite l'aldostérone ?", verso: "Par la <b>zone glomérulée</b> de la <b>corticosurrénale</b>", order_index: 68 },

    // --- CROISEMENTS / INTÉGRATIONS ---
    { recto: "Pourquoi la PA et la protéinurie sont-elles des marqueurs importants dans l'IRC ?", verso: "· L'<b>HTA</b> est à la fois cause et conséquence de l'IRC\n· La <b>protéinurie</b> reflète l'atteinte glomérulaire et aggrave la progression de l'IRC\n· Leur contrôle ralentit la <b>dégradation du DFG</b>", order_index: 69 },
    { recto: "Quel est le lien entre HTA et insuffisance rénale ?", verso: "· L'HTA provoque une <b>néphroangiosclérose</b> (atteinte des vaisseaux rénaux)\n· L'IRC cause une <b>HTA</b> par rétention hydrosodée et activation du SRAA\n→ <b>Cercle vicieux</b>", order_index: 70 },
    { recto: "Pourquoi la micro-albuminurie est-elle un marqueur précoce de néphropathie ?", verso: "Elle reflète une <b>altération débutante</b> de la membrane glomérulaire\nApparaît <b>avant</b> la protéinurie franche et la baisse du DFG\nMarqueur de <b>néphropathie diabétique</b> débutante", order_index: 71 },
    { recto: "Comment la déshydratation extracellulaire affecte-t-elle la PA ?", verso: "↓ volume extracellulaire → ↓ <b>volémie</b> → ↓ <b>PA</b>\n→ Activation du SRAA (rénine → AII → aldostérone) pour restaurer la volémie", order_index: 72 },
    { recto: "VRAI ou FAUX : la BU peut dépister une protéinurie de Bence-Jones (myélome)", verso: "<b>FAUX</b>\nLa BU ne détecte que l'<b>albumine</b>\nLes chaînes légères du myélome ne sont <b>pas détectées</b> → faux négatif", order_index: 73 },
    { recto: "VRAI ou FAUX : une hématurie glomérulaire peut donner des caillots", verso: "<b>FAUX</b>\nLes caillots orientent vers une lésion <b>urologique</b> (pas glomérulaire)", order_index: 74 },
    { recto: "VRAI ou FAUX : l'ADH est produite par l'hypophyse postérieure", verso: "<b>FAUX</b>\nL'ADH est <b>synthétisée</b> par l'hypothalamus\nElle est <b>stockée et libérée</b> par la posthypophyse", order_index: 75 },
    { recto: "VRAI ou FAUX : une BU positive à l'hématurie confirme une hématurie vraie", verso: "<b>FAUX</b>\nLa BU détecte le <b>fer</b> → positive aussi en cas de :\n· <b>Hémoglobinurie</b> (hémolyse)\n· <b>Myoglobinurie</b> (rhabdomyolyse)\n→ Confirmer par <b>ECBU</b>", order_index: 76 },
    { recto: "Quelle protéine urinaire tubulaire représente 40% de la protéinurie physiologique ?", verso: "L'<b>uromoduline</b> (protéine de <b>Tamm-Horsfall</b>)", order_index: 77 },
    { recto: "Dans quel contexte recherche-t-on une protéinurie orthostatique ?", verso: "Chez un sujet <b>jeune (< 20 ans)</b> avec protéinurie\nTest : recueil <b>clinostatisme vs orthostatisme</b>\nProtéinurie orthostatique = <b>bénigne</b>, disparaît avec l'âge", order_index: 78 },
    { recto: "Quels éléments de l'épreuve des 3 verres orientent vers une origine rénale ?", verso: "Les <b>3 verres</b> sont rouges (hématurie <b>totale</b>)\n→ Saignement <b>continu</b> en amont de la vessie", order_index: 79 },
    { recto: "Comment la rifampicine colore-t-elle les urines ?", verso: "La <b>rifampicine</b> donne des urines <b>rouge-orangé</b>\nCe n'est <b>PAS</b> une hématurie → BU négative pour le sang si pas d'autre cause", order_index: 80 },

    // --- QUESTIONS TRANSVERSALES ET PIÈGES ---
    { recto: "Quelle est la différence entre protéinurie des 24h et ratio protéinurie/créatininurie ?", verso: "· <b>Protéinurie 24h</b> : recueil complet, référence mais contraignant\n· <b>Ratio P/C</b> : sur échantillon, plus pratique\n· Seuils : protéinurie/créatininurie < <b>30 mg/mmol</b> = normal\n· Les deux sont validés pour la surveillance de l'IRC", order_index: 81 },
    { recto: "Pourquoi vérifie-t-on la créatininurie lors d'un recueil de 24h ?", verso: "Pour vérifier que le recueil est <b>complet</b>\nCréatininurie attendue : <b>8-12 mmol/24h</b>\nUne valeur basse suggère un recueil <b>incomplet</b>", order_index: 82 },
    { recto: "Quels sont les 2 mécanismes de réabsorption des protéines filtrées par le tube proximal ?", verso: "· <b>Endocytose</b> par les cellules tubulaires proximales (récepteur mégaline-cubiline)\n· Concerne les protéines de <b>faible PM</b> (lysozyme, bêta-2 microglobuline, chaînes légères)", order_index: 83 },
    { recto: "Comment distinguer hématurie d'origine glomérulaire vs urologique ?", verso: "<b>Glomérulaire</b> :\n· Hématies <b>déformées</b> (acanthocytes)\n· <b>Pas de caillots</b>\n· Souvent associée à une <b>protéinurie</b>\n\n<b>Urologique</b> :\n· Hématies <b>non déformées</b>\n· <b>Caillots</b> possibles\n· Pas de protéinurie associée", order_index: 84 },
    { recto: "Quelle est la formule de la clairance de la créatinine ?", verso: "Clairance = <b>(140 - âge) x poids x coefficient / [créatinine]p</b>\n· Coefficient : 1,23 (homme), 1,04 (femme)\n· Utilisée pour estimer le DFG", order_index: 85 },
    { recto: "Quels paramètres sont nécessaires pour estimer le DFG par MDRD ?", verso: "· <b>Créatinine plasmatique</b>\n· <b>Âge</b>\n· <b>Sexe</b>\n· <b>Poids</b>\nAttention : c'est la créatinine <b>plasmatique</b>, pas urinaire !", order_index: 86 },
    { recto: "VRAI ou FAUX : la concentration urinaire de créatinine est nécessaire pour estimer le DFG par MDRD", verso: "<b>FAUX</b>\nC'est la concentration <b>plasmatique</b> de créatinine qui est utilisée (pas urinaire)", order_index: 87 },
    { recto: "Qu'est-ce que le rouge de pyrogallol ?", verso: "Réactif colorimétrique qui détecte <b>toutes les protéines</b> urinaires (pas seulement l'albumine)\nUtilisé pour <b>confirmer</b> et <b>quantifier</b> une protéinurie dépistée à la BU", order_index: 88 },
    { recto: "Dans l'IRC, pourquoi le SRAA est-il souvent hyperactivé ?", verso: "L'IRC entraîne :\n· <b>Hypoperfusion rénale</b> → ↑ rénine\n· ↑ Angiotensine II → <b>vasoconstriction</b> + ↑ aldostérone\n· <b>Rétention hydrosodée</b> → HTA\n→ Justifie l'utilisation des <b>IEC/ARA2</b>", order_index: 89 },
    { recto: "Quel est le lien entre protéinurie et progression de l'IRC ?", verso: "La protéinurie est un <b>facteur de progression</b> de l'IRC :\n· Toxicité tubulaire directe des protéines filtrées\n· <b>Inflammation</b> et <b>fibrose</b> interstitielle\n· La réduction de la protéinurie ralentit la perte de DFG", order_index: 90 },
    { recto: "Quel est le rôle des osmorécepteurs dans la régulation de l'eau ?", verso: "Situés dans l'<b>hypothalamus</b>\nDétectent les variations d'<b>osmolalité plasmatique</b>\n· ↑ osmolalité → <b>↑ ADH</b> → réabsorption d'eau → dilution\n· ↓ osmolalité → <b>↓ ADH</b> → diurèse aqueuse", order_index: 91 },
    { recto: "Quel est le rôle des barorécepteurs dans la sécrétion d'ADH ?", verso: "Situés dans la crosse aortique et les sinus carotidiens\nStimulés par une <b>↓ volémie/PA</b> → <b>↑ ADH</b>\nRéponse moins sensible que les osmorécepteurs mais importante en cas d'<b>hypovolémie sévère</b>", order_index: 92 },
    { recto: "Quelle est la différence entre protéines de Bence-Jones et protéinurie glomérulaire ?", verso: "<b>Bence-Jones</b> : chaînes légères libres (22,5 kD) = protéinurie de <b>surcharge</b> (myélome)\n<b>Glomérulaire</b> : surtout de l'<b>albumine</b> (60-70 kD)\nBence-Jones : BU <b>négative</b> ; Glomérulaire : BU <b>positive</b>", order_index: 93 },
    { recto: "Quelle infection urinaire peut fausser la BU pour la protéinurie ?", verso: "Une <b>infection urinaire</b> peut donner une protéinurie <b>transitoire</b>\n→ Ce n'est PAS une protéinurie d'origine rénale\n→ Contrôler la protéinurie <b>après traitement</b> de l'infection", order_index: 94 },
    { recto: "VRAI ou FAUX : le secteur intracellulaire représente 20% du poids corporel", verso: "<b>FAUX</b>\nLe secteur intracellulaire représente <b>40%</b> du poids corporel (2/3 de l'eau totale)\nC'est le secteur <b>extracellulaire</b> qui représente 20%", order_index: 95 },
    { recto: "VRAI ou FAUX : la protéinurie orthostatique nécessite une biopsie rénale", verso: "<b>FAUX</b>\nLa protéinurie orthostatique est <b>bénigne</b>, touche le sujet <b>jeune</b> et disparaît avec l'âge\nPas de biopsie nécessaire", order_index: 96 },
    { recto: "Pourquoi un brassard trop petit surestime-t-il la PA ?", verso: "Un brassard <b>trop petit</b> comprime insuffisamment l'artère\n→ Nécessite une pression plus élevée pour occlure l'artère\n→ <b>Surestimation</b> de la PAS et PAD", order_index: 97 },
    { recto: "Comment évolue la prévalence de l'HTA avec l'âge ?", verso: "· <b>10%</b> à 30 ans\n· <b>30%</b> dans la population générale\n· <b>80%</b> à 80 ans\n→ Augmentation quasi linéaire avec l'âge", order_index: 98 },
    { recto: "VRAI ou FAUX : l'hématurie avec épreuve des 3 verres montrant le 1er verre rouge oriente vers une origine rénale", verso: "<b>FAUX</b>\n1er verre rouge uniquement → origine <b>urétrale/prostatique</b>\nL'origine rénale donne les <b>3 verres</b> rouges (hématurie totale)", order_index: 99 },
    { recto: "Quels sont les facteurs de risque d'hypotension orthostatique ?", verso: "· <b>Âge avancé</b> (16% après 65 ans)\n· <b>Traitements antihypertenseurs</b>\n· <b>Déshydratation</b>\n· <b>Dysautonomie</b> (diabète, Parkinson)", order_index: 100 },
  ],
  annales: [
    {
      titre: 'Annale 2019 — Estimation du DFG',
      annee: '2019',
      rappel_cours: "L'insuffisance rénale chronique (IRC) se définit par une diminution permanente du débit de filtration glomérulaire (DFG) en dessous de 60 mL/min/1,73m², évoluant depuis plus de 3 mois.\n\n**Qu'est-ce que le DFG ?**\nLe débit de filtration glomérulaire est le volume de plasma filtré par les reins par unité de temps. C'est le meilleur marqueur de la fonction rénale. Un DFG qui baisse signifie que les reins filtrent de moins en moins.\n\n**Comment estime-t-on le DFG ?**\nOn utilise des formules basées sur la créatinine plasmatique. La créatinine est un déchet musculaire éliminé par filtration glomérulaire : plus le DFG baisse, plus la créatinine plasmatique augmente.\n\n**Formule de Cockcroft-Gault :**\nCl = (140 - âge) × poids × K / [créatinine]p\n· K = 1,23 (homme) / 1,04 (femme)\n· Paramètres : créatinine **plasmatique** (PAS urinaire !), âge, poids, sexe\n\n**Formule MDRD (Modification of Diet in Renal Disease) :**\nEstime le eDFG à partir de : créatinine **plasmatique**, âge, sexe, poids.\n\n**Piège classique** : la formule MDRD utilise la créatinine **plasmatique**, PAS la créatinine urinaire. La créatinine urinaire sert uniquement à vérifier la qualité du recueil des urines de 24h (valeur attendue : 8-12 mmol/24h).",
      questions: [
        {
          enonce: "Quels sont les paramètres nécessaires pour estimer le débit de filtration glomérulaire estimé (eDFG) selon la formule MDRD ?",
          items: [
            { lettre: 'A', enonce: 'Concentration urinaire de créatinine', is_correct: false },
            { lettre: 'B', enonce: 'Concentration plasmatique de créatinine', is_correct: true },
            { lettre: 'C', enonce: 'Poids', is_correct: true },
            { lettre: 'D', enonce: 'Sexe', is_correct: true },
            { lettre: 'E', enonce: 'Age', is_correct: true },
          ],
          correction: "**Réponse : BCDE**\n\nA. **FAUX** — La formule MDRD utilise la concentration **plasmatique** de créatinine, et non la concentration **urinaire**. La créatinine urinaire est utilisée pour la clairance mesurée (formule UV/P), pas pour l'estimation par MDRD.\n\nB. **VRAI** — La concentration plasmatique de créatinine est le paramètre central de la formule MDRD.\n\nC. **VRAI** — Le poids est nécessaire pour le calcul (également dans Cockcroft-Gault : clairance = (140-âge) x poids x coeff / [créatinine]p).\n\nD. **VRAI** — Le sexe intervient via un coefficient de correction (la masse musculaire, et donc la production de créatinine, diffère entre hommes et femmes).\n\nE. **VRAI** — L'âge est un paramètre essentiel (la production de créatinine diminue avec l'âge).",
        },
      ],
    },
  ],
};

export default content;

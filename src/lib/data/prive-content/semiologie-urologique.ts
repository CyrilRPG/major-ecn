import type { PriveCourseContent } from '../prive-courses';

const content: PriveCourseContent = {
  fiche: {
    parties: [
      {
        numero: 'I',
        titre: 'Troubles de la miction',
        sous_parties: [
          {
            titre: 'Physiologie vésicale',
            rows: [
              { concept: '◆ Phase de remplissage', detail_md: "Représente **>99% du temps vésical**\n· La vessie est au repos\n· Les forces de retenue sont supérieures aux forces d'expulsion vésicale\n· Continence assurée en permanence", kind: 'a_retenir' },
              { concept: '◆ Phase mictionnelle = réflexe mictionnel', detail_md: "Phase **ponctuelle** (brève)\n· **Contraction vésicale** + **relaxation simultanée** des forces de retenue\n· Coordination neurologique indispensable", kind: 'a_retenir' },
              { concept: '◆ Miction normale attendue', detail_md: "· Vidange **complète** sans résidu\n· Miction **volontaire**, aisée et indolore\n· Durée environ **30 secondes**\n· Fréquence : toutes les **3-4 heures**\n· Volume par miction : **200-250 mL**\n· +/- **1 lever nocturne** acceptable", kind: 'a_retenir' },
            ],
          },
          {
            titre: 'Sémiologie des troubles mictionnels',
            rows: [
              { concept: 'Troubles de la phase de remplissage', detail_md: "Correspondent à une **hyperactivité vésicale**\n· Pollakiurie, nycturie, urgenturie", kind: 'normal' },
              { concept: 'Troubles de la phase mictionnelle', detail_md: "Correspondent à la **dysurie**\n· Retard à l'initiation, jet faible, miction prolongée", kind: 'normal' },
              { concept: '⚠ Signes particuliers évocateurs', detail_md: "· **Pneumaturie** = émission de gaz dans les urines\n· **Fécalurie** = émission de selles dans les urines\n→ Évoquent une **communication anormale** entre appareil digestif et urinaire (fistule)", kind: 'piege' },
            ],
          },
          {
            titre: 'Anomalies de la phase de remplissage — Hyperactivité vésicale',
            rows: [
              { concept: '◆ Pollakiurie', detail_md: "Mictions **trop fréquentes** (intervalle < 2 heures)\n· Les volumes par miction sont **normaux** (petites quantités fréquentes)\n· À ne pas confondre avec la polyurie", kind: 'a_retenir' },
              { concept: '⚠ Pollakiurie vs Polyurie', detail_md: "· **Pollakiurie** = mictions trop fréquentes, volumes normaux par miction\n· **Polyurie** = volume urinaire total **> 3 L/24h** (cause métabolique : diabète, potomanie...)\nLa polyurie entraîne des mictions fréquentes mais par augmentation du volume total, pas par irritation vésicale", kind: 'piege' },
              { concept: '◆ Nycturie', detail_md: "Envie d'uriner qui **RÉVEILLE** le patient la nuit\n· C'est le besoin urinaire qui interrompt le sommeil", kind: 'a_retenir' },
              { concept: '⚠ Nycturie vs Nocturie', detail_md: "· **Nycturie** = besoin d'uriner qui **réveille** le patient\n· **Nocturie** = patient qui se réveille pour **d'autres raisons** (troubles du sommeil) et en profite pour uriner\nDistinction fondamentale à l'interrogatoire", kind: 'piege' },
              { concept: '◆ Urgenturie', detail_md: "Besoin **brutal**, **irrésistible** et **urgent** d'uriner\n· Le patient ne peut pas se retenir\n· Peut entraîner une fuite si les toilettes ne sont pas accessibles", kind: 'a_retenir' },
              { concept: 'Facteurs déclenchants de l\'hyperactivité vésicale', detail_md: "· **Sensoriels** : froid, stress\n· **De précaution** : uriner avant de sortir\n· **Réflexes** : syndrome de la **clé dans la serrure** (urgence déclenchée en arrivant chez soi)", kind: 'normal' },
            ],
          },
          {
            titre: 'Anomalies de la phase mictionnelle — Dysurie',
            rows: [
              { concept: '◆ Dysurie : définition et terrain', detail_md: "Difficulté à uriner, **surtout masculine**\n· Liée à l'augmentation du volume prostatique avec l'âge\n· La prostate comprime l'urètre → gêne à l'écoulement", kind: 'a_retenir' },
              { concept: 'Symptômes de dysurie', detail_md: "· **Retard à l'initiation** de la miction\n· **Jet faible**\n· **Gouttes retardataires** (gouttes en fin de miction)\n· Miction **prolongée > 30 secondes**\n· Impression de **mauvaise vidange**", kind: 'normal' },
              { concept: '◆ Débimétrie et seuil de conscience', detail_md: "Les patients prennent conscience de la dysurie quand le **débit max < 10 mL/s**\n· Norme : débit max **≥ 15 mL/s**\n· Entre 10 et 15 : dysurie souvent méconnue", kind: 'a_retenir' },
              { concept: '◆ Rétention vésicale aiguë', detail_md: "**Impossibilité soudaine de vider la vessie** malgré une envie pressante\n· = **Urgence urologique**\n· Nécessite un sondage vésical ou cathétérisme sus-pubien en urgence", kind: 'a_retenir' },
              { concept: '◆ Capacité vésicale', detail_md: "· Capacité **anatomique** : 350-500 mL\n· Capacité **fonctionnelle** : 150-250 mL (volume déclenchant le besoin)", kind: 'a_retenir' },
              { concept: '◆ Globe vésical', detail_md: "Volume vésical **> 500 mL**, parfois > 1 L\n· Se **voit rarement** (patient mince)\n· Se **palpe occasionnellement**\n· Se **percute souvent** : **matité hypogastrique**", kind: 'a_retenir' },
              { concept: '⚠ Globe vésical vs Ascite', detail_md: "Le globe vésical donne une **matité hypogastrique convexe vers le haut**\nÀ ne pas confondre avec l'ascite (matité déplaçable, diffuse)", kind: 'piege' },
              { concept: 'Fausses mictions / Incontinence par regorgement', detail_md: "· Vessie pleine en permanence avec fuites sur surpression\n· Le patient urine par **trop-plein**\n· Toujours **rechercher un retentissement rénal** (insuffisance rénale obstructive)", kind: 'normal' },
            ],
          },
          {
            titre: 'Examen clinique et explorations',
            rows: [
              { concept: '◆ Interrogatoire', detail_md: "Rechercher les **ATCD urologiques** :\n· Sondage vésical antérieur\n· Endoscopie urinaire\n· MST (rétrécissement urétral)\n· Traumatisme du bassin\n· Chirurgie urologique", kind: 'a_retenir' },
              { concept: '◆ Examen physique', detail_md: "· Inspection des **OGE** (organes génitaux externes)\n· **Touchers pelviens** : TR (toucher rectal) / TV (toucher vaginal)\n· Palpation abdomen et **fosses lombaires** (contact lombaire)\n· **BU** (bandelette urinaire) systématique\n· Examen neurologique, gynécologique et proctologique si nécessaire", kind: 'a_retenir' },
              { concept: 'Débitmétrie', detail_md: "Entonnoir avec roue mesurant le débit urinaire\n· Trace une **courbe de débit**\n· Obstruction → courbe **aplatie** (plateau bas prolongé)\n· Normal → courbe en cloche, pic > 15 mL/s", kind: 'normal' },
              { concept: 'Score IPSS', detail_md: "Score symptomatique de **0 à 35**\n· Évalue la sévérité des troubles mictionnels\n· Inclut une question sur la **qualité de vie**", kind: 'normal' },
              { concept: 'Calendrier mictionnel', detail_md: "Rempli par le patient pendant **3-4 jours** à domicile\n· Note les horaires, volumes et circonstances des mictions\n· Outil de première ligne", kind: 'normal' },
              { concept: 'Bilan urodynamique', detail_md: "Examen de **2e ligne** (pas en première intention)\n· Sondes dans la **vessie**, l'**urètre** et le **rectum**\n· Mesure les pressions vésicales et urétrales pendant remplissage et miction", kind: 'normal' },
              { concept: 'Examens complémentaires', detail_md: "· **Échographie** réno-vésico-prostatique\n· **Urétro-cystoscopie** (endoscopie)\n· Biologie : **créatininémie** (fonction rénale), **PSA** (prostate), **ECBU** (infection)", kind: 'normal' },
            ],
          },
        ],
      },
      {
        numero: 'II',
        titre: 'Incontinence urinaire',
        sous_parties: [
          {
            titre: 'Définition et physiologie',
            rows: [
              { concept: '◆ Définition ICS 2002', detail_md: "**Perte involontaire d'urine** quelles que soient les circonstances\n· Définition standardisée par l'International Continence Society", kind: 'a_retenir' },
              { concept: 'Phase du cycle mictionnel touchée', detail_md: "L'incontinence est un trouble de la **phase de remplissage**\n· Le cycle mictionnel : continence **99,8%** du temps, vidange **4-6 fois/jour** (0,2%)", kind: 'normal' },
              { concept: '◆ Conditions de la continence', detail_md: "· Appareil urinaire **bien formé** anatomiquement\n· Réservoir vésical **stable** et **compliant** (pas de contraction intempestive)\n· Forces de retenue **supérieures** aux forces d'expulsion\n· **Coordination neurologique** intacte", kind: 'a_retenir' },
            ],
          },
          {
            titre: 'Épidémiologie',
            rows: [
              { concept: '◆ Prévalence', detail_md: "· **1/3 des femmes** touchées\n· **3-11% des hommes**\n· Problème de santé publique majeur", kind: 'a_retenir' },
              { concept: 'Impact', detail_md: "· Véritable **tabou** social\n· Source de **handicap** fonctionnel et psychologique\n· **Coût** élevé pour le patient et la société (protections, soins...)", kind: 'normal' },
            ],
          },
          {
            titre: 'Démarche diagnostique',
            rows: [
              { concept: '◆ Les 3 étapes', detail_md: "1. **Affirmer** la fuite méatique (fuite par le méat urétral)\n2. **Évaluer** l'importance, le retentissement et les attentes du patient\n3. **Préciser le mécanisme** de l'incontinence", kind: 'a_retenir' },
              { concept: '◆ Types d\'incontinence urinaire', detail_md: "· **IU d'effort** : fuites lors d'augmentation de la pression intra-abdominale (toux, rire, sport, port de charge)\n· **IU par urgenturie** : délai de sécurité trop court, fuite avant d'arriver aux toilettes\n· **IU mixte** : association effort + urgenturie\n· **IU permanente** : rare mais plus invalidante (fuite continue)\n· **Énurésie** : fuites survenant **durant le sommeil**", kind: 'a_retenir' },
              { concept: '⚠ IU d\'effort vs IU par urgenturie', detail_md: "· **Effort** : la fuite survient à l'effort, pas de besoin préalable, pas de contraction vésicale — mécanisme sphinctérien\n· **Urgenturie** : besoin brutal précède la fuite, contraction vésicale involontaire — mécanisme vésical\nLe traitement diffère complètement selon le type", kind: 'piege' },
            ],
          },
          {
            titre: 'Évaluation clinique de l\'incontinence',
            rows: [
              { concept: 'Test d\'effort', detail_md: "· On demande au patient de **tousser** (vessie remplie)\n· On observe s'il y a une fuite méatique synchrone de l'effort", kind: 'normal' },
              { concept: 'Remplissage vésical', detail_md: "Remplissage progressif pour reproduire les symptômes et évaluer la capacité vésicale fonctionnelle", kind: 'normal' },
              { concept: '◆ Évaluation du retentissement', detail_md: "· Nombre de **couches/jour** (protections)\n· **Calendrier mictionnel**\n· **Pad test** : pesée des couches sur une durée définie (quantification objective des fuites)\n· Questions sur la vie sociale : **sortie — sexe — sport** (les 3 S)\n· **Auto-questionnaire** qualité de vie", kind: 'a_retenir' },
            ],
          },
        ],
      },
      {
        numero: 'III',
        titre: 'Pathologies des organes génitaux externes masculins',
        sous_parties: [
          {
            titre: 'Torsion du cordon spermatique',
            rows: [
              { concept: '◆ Mécanisme', detail_md: "**Défaut de fixation** du testicule dans la bourse\n· Le testicule tourne sur lui-même → **rotation du cordon spermatique**\n· Conséquence : **ischémie aiguë** + œdème testiculaire", kind: 'a_retenir' },
              { concept: '◆ Délais de nécrose', detail_md: "· **Nécrose** à partir de **6 heures**\n· Récupération possible jusqu'à **12 heures**\n· Au-delà : lésions irréversibles", kind: 'a_retenir' },
              { concept: 'Terrain', detail_md: "Surtout les **adolescents** (augmentation rapide du volume testiculaire à la puberté)", kind: 'normal' },
              { concept: '◆ Clinique', detail_md: "· Douleurs **brutales**, **violentes**, **unilatérales** de la bourse\n· Irradiation vers l'**aine** et la **fosse iliaque** homolatérale\n· **PAS de signes infectieux** : apyrexie, BU négative\n· Nausées et vomissements fréquents", kind: 'a_retenir' },
              { concept: '◆ Examen physique', detail_md: "· Testicule **hyperalgique**\n· Augmenté de volume, **dur**\n· **Ascensionné** (rétracté vers l'orifice inguinal superficiel)\n· **Disparition du réflexe crémastérien** (abolition = signe très évocateur)", kind: 'a_retenir' },
              { concept: '◆ Diagnostic et prise en charge', detail_md: "· **DIAGNOSTIC CLINIQUE** : pas d'examen complémentaire nécessaire\n· **URGENCE CHIRURGICALE** : exploration scrotale en urgence\n· Ne pas perdre de temps avec l'imagerie", kind: 'a_retenir' },
              { concept: 'Formes cliniques', detail_md: "· **Torsion négligée** : nécrose installée, fièvre secondaire\n· **Sub-torsion** : torsion de courte durée, spontanément résolutive (douleur transitoire)\n· **Torsion néonatale** : à la naissance\n· Torsion sur **cryptorchidie** (testicule non descendu)\n· **Torsion d'hydatide** : torsion d'un reliquat embryonnaire appendu au testicule (surtout chez l'enfant)", kind: 'normal' },
            ],
          },
          {
            titre: 'Phimosis et paraphimosis',
            rows: [
              { concept: 'Phimosis', detail_md: "**Orifice préputial serré** empêchant le décalottage\n· **Physiologique** chez le nouveau-né (adhésions prépuce-gland normales)\n· **Acquis** chez le sujet âgé ou diabétique (sclérose du prépuce)", kind: 'normal' },
              { concept: '◆ Paraphimosis', detail_md: "Prépuce serré **non recalotté** (bloqué en arrière du gland)\n· Survient après **sonde vésicale** ou rapport sexuel\n· Entraîne un **œdème préputial** par strangulation veineuse\n· Traitement : **réduction manuelle** en urgence (avant nécrose)", kind: 'a_retenir' },
            ],
          },
          {
            titre: 'Hydrocèle vaginale',
            rows: [
              { concept: '◆ Hydrocèle', detail_md: "**Épanchement liquidien** entre les feuillets de la vaginale testiculaire\n· La vaginale **produit trop de liquide**\n· Visible à la **transillumination** (lumière traversant le liquide)", kind: 'a_retenir' },
              { concept: 'Diagnostic et diagnostics différentiels', detail_md: "· Diagnostic : **échographie scrotale**\n· DD : **tumeur du testicule** (masse solide, non transilluminable)\n· DD : **hernie inguino-scrotale** (impulsive à la toux, non transilluminable)", kind: 'normal' },
            ],
          },
          {
            titre: 'Varicocèle',
            rows: [
              { concept: '◆ Définition', detail_md: "**Dilatation des veines antérieures** autour de l'artère testiculaire\n· Due à une **incompétence des valvules veineuses**\n· Plus fréquent à **gauche** (la veine génitale gauche se jette directement dans la veine rénale gauche à angle droit)", kind: 'a_retenir' },
              { concept: '◆ Conséquences', detail_md: "· **Douloureux** (pesanteur scrotale)\n· **Impact sur la fertilité** (élévation de la température testiculaire)", kind: 'a_retenir' },
              { concept: '◆ Examen clinique', detail_md: "Examen **debout puis couché** :\n· Tuméfaction **variqueuse** accentuée à la **toux** et au **Valsalva**\n· **Disparaît en décubitus** (drainage veineux par gravité)", kind: 'a_retenir' },
              { concept: 'Diagnostic', detail_md: "· Diagnostic **clinique** (aspect typique)\n· Confirmation par **échodoppler scrotal**", kind: 'normal' },
            ],
          },
        ],
      },
      {
        numero: 'IV',
        titre: 'Lithiase urinaire et colique néphrétique',
        sous_parties: [
          {
            titre: 'Colique néphrétique',
            rows: [
              { concept: '◆ Mécanisme', detail_md: "**Obstruction aiguë** de la voie excrétrice supérieure\n· Entraîne une **distension des cavités pyélo-calicielles**\n· C'est la distension qui provoque la douleur, pas le calcul lui-même", kind: 'a_retenir' },
              { concept: '◆ Clinique typique', detail_md: "· Douleur **lombo-abdominale unilatérale** brutale, intense\n· **Hématurie microscopique** (BU positive)\n· Patient **agité** (ne trouvant pas de position antalgique)\n· Troubles digestifs : nausées, vomissements (réflexe vagal)", kind: 'a_retenir' },
              { concept: '◆ Causes d\'obstruction', detail_md: "· **Intraluminale** : calculs (**80%** des cas), caillots sanguins, nécrose papillaire\n· **Pariétale** : syndrome de la jonction pyélo-urétérale (JPU), sténoses, tumeurs urothéliaux\n· **Extrinsèque** : adénopathies, fibrose rétropéritonéale", kind: 'a_retenir' },
              { concept: 'Épidémiologie', detail_md: "Représente **1-2% des entrées aux urgences**", kind: 'normal' },
              { concept: '◆ Traitement', detail_md: "· **Antalgiques** (palier adapté à la douleur)\n· **AINS** en première intention : vasoconstricteur de l'artériole afférente → diminution du DFG → moins d'urine produite → moins de tension dans les cavités\n· Pas de restriction hydrique en phase aiguë", kind: 'a_retenir' },
              { concept: '⚠ Mécanisme d\'action des AINS dans la CN', detail_md: "Les AINS agissent par **vasoconstriction de l'artériole afférente** :\n· Diminution du DFG\n· Moins d'urine produite en amont de l'obstacle\n· Moins de distension des cavités\nCe n'est pas seulement un effet anti-inflammatoire", kind: 'piege' },
              { concept: 'Diagnostic paraclinique', detail_md: "· **BU** : hématurie microscopique\n· **Échographie rénale** : dilatation des cavités\n· **Scanner abdominal sans injection** : visualise le calcul (examen de référence)", kind: 'normal' },
            ],
          },
          {
            titre: 'Cystite aiguë',
            rows: [
              { concept: '◆ Clinique', detail_md: "· **Hyperactivité vésicale** d'apparition brutale\n· **Pollakiurie** + **impériosités** (urgenturies)\n· **Brûlures mictionnelles** (signes fonctionnels urinaires bas)\n· +/- Hématurie macroscopique\n· **PAS de lombalgie**, **PAS de fièvre**", kind: 'a_retenir' },
              { concept: '◆ BU dans la cystite', detail_md: "· **Leucocytes** positifs (pyurie = réaction inflammatoire)\n· **Nitrites** positifs (bactéries transformant les nitrates en nitrites)", kind: 'a_retenir' },
              { concept: '⚠ Cystite vs Pyélonéphrite', detail_md: "La cystite est une infection **basse** (limitée à la vessie) :\n· Pas de fièvre, pas de douleur lombaire\n· Si fièvre ou douleur lombaire apparaît → pyélonéphrite", kind: 'piege' },
            ],
          },
          {
            titre: 'Pyélonéphrite aiguë',
            rows: [
              { concept: '◆ Clinique', detail_md: "· Peut faire suite à une **cystite initiale**\n· **Syndrome septique** : fièvre (souvent élevée, frissons)\n· **Syndrome douloureux lombaire** : douleur **brutale**, **unilatérale**\n· Association fièvre + douleur lombaire = pyélonéphrite jusqu'à preuve du contraire", kind: 'a_retenir' },
              { concept: '◆ ECBU systématique', detail_md: "L'**ECBU est obligatoire** devant toute pyélonéphrite\n· Identification du germe et antibiogramme indispensables\n· Contrairement à la cystite simple où la BU suffit", kind: 'a_retenir' },
            ],
          },
        ],
      },
    ],
    points_cles: [
      "La miction normale : volontaire, aisée, indolore, durée ~30s, toutes les 3-4h, volume 200-250 mL, vidange complète",
      "Pollakiurie (< 2h entre mictions) ≠ polyurie (> 3L/24h) : la pollakiurie est un trouble de fréquence, la polyurie est un excès de volume",
      "Nycturie = besoin urinaire qui RÉVEILLE le patient (≠ nocturie = trouble du sommeil)",
      "Dysurie : surtout masculine (prostate), débit max normal ≥ 15 mL/s, prise de conscience < 10 mL/s",
      "Rétention vésicale aiguë = urgence urologique : impossibilité de vider la vessie malgré l'envie",
      "Globe vésical (> 500 mL) : se voit rarement, se palpe parfois, se percute souvent (matité hypogastrique)",
      "Incontinence : 1/3 femmes, 3-11% hommes. Types : effort, urgenturie, mixte, permanente, énurésie",
      "Torsion du cordon spermatique = URGENCE CHIRURGICALE, diagnostic CLINIQUE, nécrose à 6h",
      "Torsion : douleur brutale unilatérale + testicule ascensionné + abolition réflexe crémastérien + PAS de fièvre",
      "Varicocèle : plus fréquent à gauche, accentué à la toux/Valsalva, disparaît en décubitus, impact fertilité",
      "Colique néphrétique : obstruction aiguë → distension cavités → douleur. Calculs = 80% des causes",
      "AINS dans la CN : vasoconstriction artériole afférente → diminution DFG → moins de tension",
      "Cystite : SFU bas + BU positive (leucocytes/nitrites) SANS fièvre ni lombalgie",
      "Pyélonéphrite : fièvre + douleur lombaire unilatérale + ECBU systématique",
    ],
    chiffres_cles: {
      titre: 'Chiffres clés — Sémiologie urologique',
      markdown: "| Paramètre | Valeur |\n|---|---|\n| Volume par miction normal | **200-250 mL** |\n| Fréquence mictionnelle normale | **toutes les 3-4h** |\n| Durée miction normale | **~30 secondes** |\n| Seuil pollakiurie | **< 2h entre mictions** |\n| Seuil polyurie | **> 3 L/24h** |\n| Débit max normal (débimétrie) | **≥ 15 mL/s** |\n| Seuil conscience dysurie | **< 10 mL/s** |\n| Capacité vésicale anatomique | **350-500 mL** |\n| Capacité vésicale fonctionnelle | **150-250 mL** |\n| Globe vésical | **> 500 mL** |\n| Nécrose testiculaire (torsion) | **à partir de 6h** |\n| Récupération possible (torsion) | **jusqu'à 12h** |\n| Score IPSS | **0-35** |\n| Prévalence IU femmes | **1/3** |\n| Prévalence IU hommes | **3-11%** |\n| Colique néphrétique aux urgences | **1-2% des entrées** |\n| Cause CN : calculs | **80%** |\n| MAPA PAS moyenne 24h normale | **< 130 mmHg** |\n| MAPA PAD moyenne 24h normale | **< 80 mmHg** |\n| MAPA PAS diurne normale | **< 135 mmHg** |\n| MAPA PAD diurne normale | **< 85 mmHg** |\n| MAPA PAS nocturne normale | **< 120 mmHg** |\n| MAPA PAD nocturne normale | **< 70 mmHg** |\n| PA consultation normale | **< 140/90 mmHg** |\n| Hypotension orthostatique | **baisse PAS ≥ 20 ou PAD ≥ 10 mmHg** |",
    },
  },
  flashcards: [
    // --- I. Troubles de la miction ---
    { recto: "Quelles sont les 2 phases du cycle vésical ?", verso: "· <b>Phase de remplissage</b> : >99% du temps, repos vésical\n· <b>Phase mictionnelle</b> (réflexe mictionnel) : ponctuelle, contraction vésicale + relaxation forces de retenue", order_index: 1 },
    { recto: "Quelles sont les caractéristiques d'une miction normale ?", verso: "· Vidange <b>complète sans résidu</b>\n· <b>Volontaire</b>, aisée, indolore\n· Durée ~<b>30 secondes</b>\n· Toutes les <b>3-4 heures</b>\n· Volume <b>200-250 mL</b>\n· +/- <b>1 lever nocturne</b>", order_index: 2 },
    { recto: "Qu'est-ce que la pollakiurie ?", verso: "Mictions <b>trop fréquentes</b> avec un intervalle <b>< 2 heures</b>\n· Les volumes par miction restent normaux\n· Trouble de la phase de remplissage", order_index: 3 },
    { recto: "Quelle est la différence entre pollakiurie et polyurie ?", verso: "· <b>Pollakiurie</b> = mictions trop fréquentes, volumes normaux par miction\n· <b>Polyurie</b> = volume urinaire total <b>> 3 L/24h</b>\nLa polyurie est un excès de volume, la pollakiurie un excès de fréquence", order_index: 4 },
    { recto: "Qu'est-ce que la nycturie ?", verso: "Envie d'uriner qui <b>RÉVEILLE</b> le patient la nuit\n· C'est le besoin mictionnel qui interrompt le sommeil", order_index: 5 },
    { recto: "Quelle est la différence entre nycturie et nocturie ?", verso: "· <b>Nycturie</b> = besoin d'uriner qui <b>réveille</b> le patient\n· <b>Nocturie</b> = patient réveillé pour <b>d'autres raisons</b> (troubles du sommeil) qui en profite pour uriner", order_index: 6 },
    { recto: "Qu'est-ce que l'urgenturie ?", verso: "Besoin <b>brutal</b>, <b>irrésistible</b> et <b>urgent</b> d'uriner\n· Le patient ne peut pas se retenir\n· Risque de fuite si toilettes non accessibles", order_index: 7 },
    { recto: "Quels sont les facteurs déclenchants de l'hyperactivité vésicale ?", verso: "· <b>Sensoriels</b> : froid, stress\n· <b>De précaution</b> : uriner avant de sortir\n· <b>Réflexes</b> : syndrome de la <b>clé dans la serrure</b>", order_index: 8 },
    { recto: "Qu'est-ce que la pneumaturie ?", verso: "Émission de <b>gaz</b> dans les urines\n· Évoque une <b>fistule</b> entre appareil digestif et urinaire", order_index: 9 },
    { recto: "Qu'est-ce que la fécalurie ?", verso: "Émission de <b>matières fécales</b> dans les urines\n· Évoque une <b>communication anormale</b> entre le tube digestif et l'appareil urinaire (fistule)", order_index: 10 },
    { recto: "Qu'est-ce que la dysurie ?", verso: "Difficulté à uriner, <b>surtout masculine</b>\n· Liée à l'augmentation du volume prostatique avec l'âge\n· Prostate comprime l'urètre", order_index: 11 },
    { recto: "Quels sont les symptômes de dysurie ?", verso: "· <b>Retard à l'initiation</b> de la miction\n· <b>Jet faible</b>\n· <b>Gouttes retardataires</b>\n· Miction prolongée <b>> 30 secondes</b>\n· Impression de <b>mauvaise vidange</b>", order_index: 12 },
    { recto: "Quel est le débit max normal à la débimétrie ?", verso: "Débit max normal : <b>≥ 15 mL/s</b>\n· Les patients prennent conscience de la dysurie quand le débit max est <b>< 10 mL/s</b>", order_index: 13 },
    { recto: "Qu'est-ce que la rétention vésicale aiguë ?", verso: "<b>Impossibilité soudaine de vider la vessie</b> malgré une envie pressante\n· = <b>Urgence urologique</b>\n· Nécessite sondage ou cathétérisme sus-pubien en urgence", order_index: 14 },
    { recto: "Quelle est la capacité vésicale anatomique ?", verso: "<b>350-500 mL</b>", order_index: 15 },
    { recto: "Quelle est la capacité vésicale fonctionnelle ?", verso: "<b>150-250 mL</b>\n· Volume déclenchant le besoin d'uriner", order_index: 16 },
    { recto: "À partir de quel volume parle-t-on de globe vésical ?", verso: "<b>> 500 mL</b>, parfois > 1 L\n· Se voit rarement, se palpe occasionnellement, se <b>percute souvent</b> (matité hypogastrique)", order_index: 17 },
    { recto: "Comment se manifeste cliniquement un globe vésical ?", verso: "· Se <b>voit rarement</b> (patient mince)\n· Se <b>palpe occasionnellement</b>\n· Se <b>percute souvent</b> : matité hypogastrique convexe vers le haut\n· À distinguer de l'ascite", order_index: 18 },
    { recto: "Qu'est-ce que l'incontinence par regorgement ?", verso: "· Vessie pleine en permanence avec fuites sur surpression\n· Le patient urine par <b>trop-plein</b>\n· Toujours rechercher un <b>retentissement rénal</b>", order_index: 19 },
    { recto: "Quels ATCD urologiques rechercher à l'interrogatoire ?", verso: "· <b>Sondage vésical</b> antérieur\n· <b>Endoscopie</b> urinaire\n· <b>MST</b> (rétrécissement urétral)\n· <b>Traumatisme du bassin</b>\n· <b>Chirurgie urologique</b>", order_index: 20 },
    { recto: "Quels éléments comporte l'examen physique en urologie ?", verso: "· Inspection des <b>OGE</b>\n· <b>Touchers pelviens</b> (TR/TV)\n· Palpation abdomen et <b>fosses lombaires</b>\n· <b>BU</b> systématique\n· Examen neurologique, gynécologique, proctologique", order_index: 21 },
    { recto: "Qu'est-ce que la débimétrie ?", verso: "Mesure du <b>débit urinaire</b> par un entonnoir avec roue\n· Trace une <b>courbe de débit</b>\n· Obstruction → courbe <b>aplatie</b>\n· Normal → courbe en cloche, pic > 15 mL/s", order_index: 22 },
    { recto: "Qu'est-ce que le score IPSS ?", verso: "Score symptomatique de <b>0 à 35</b> évaluant la sévérité des troubles mictionnels\n· Inclut une question sur la <b>qualité de vie</b>", order_index: 23 },
    { recto: "Comment réalise-t-on un calendrier mictionnel ?", verso: "Rempli par le patient pendant <b>3-4 jours à domicile</b>\n· Note les horaires, volumes et circonstances des mictions\n· Outil de <b>première ligne</b>", order_index: 24 },
    { recto: "Qu'est-ce que le bilan urodynamique ?", verso: "Examen de <b>2e ligne</b>\n· Sondes dans la <b>vessie</b>, l'<b>urètre</b> et le <b>rectum</b>\n· Mesure les pressions vésicales et urétrales pendant remplissage et miction", order_index: 25 },
    { recto: "Quels examens complémentaires en urologie ?", verso: "· <b>Échographie</b> réno-vésico-prostatique\n· <b>Urétro-cystoscopie</b>\n· Biologie : <b>créatininémie</b>, <b>PSA</b>, <b>ECBU</b>", order_index: 26 },

    // --- II. Incontinence urinaire ---
    { recto: "Quelle est la définition de l'incontinence urinaire selon l'ICS 2002 ?", verso: "<b>Perte involontaire d'urine</b> quelles que soient les circonstances\n· Définition de l'International Continence Society", order_index: 27 },
    { recto: "Quelle phase du cycle mictionnel est touchée dans l'incontinence ?", verso: "La <b>phase de remplissage</b>\n· Continence = 99,8% du temps\n· Vidange = 4-6 fois/jour (0,2%)", order_index: 28 },
    { recto: "Quelles sont les 4 conditions de la continence ?", verso: "· Appareil urinaire <b>bien formé</b>\n· Réservoir vésical <b>stable et compliant</b>\n· Forces de retenue <b>></b> forces d'expulsion\n· <b>Coordination neurologique</b> intacte", order_index: 29 },
    { recto: "Quelle est la prévalence de l'incontinence urinaire ?", verso: "· <b>1/3 des femmes</b>\n· <b>3-11% des hommes</b>\n· Tabou, handicap, coût élevé", order_index: 30 },
    { recto: "Quelles sont les 3 étapes de la démarche diagnostique de l'IU ?", verso: "1. <b>Affirmer</b> la fuite méatique\n2. <b>Évaluer</b> l'importance, le retentissement et les attentes\n3. <b>Préciser le mécanisme</b>", order_index: 31 },
    { recto: "Quels sont les différents types d'incontinence urinaire ?", verso: "· IU d'<b>effort</b> : fuites à l'effort (toux, rire, sport)\n· IU par <b>urgenturie</b> : délai de sécurité trop court\n· IU <b>mixte</b> : effort + urgenturie\n· IU <b>permanente</b> : rare, plus invalidante\n· <b>Énurésie</b> : fuites durant le sommeil", order_index: 32 },
    { recto: "Quelle est la différence entre IU d'effort et IU par urgenturie ?", verso: "· <b>Effort</b> : fuite à l'effort, pas de besoin préalable, mécanisme <b>sphinctérien</b>\n· <b>Urgenturie</b> : besoin brutal précède la fuite, contraction vésicale involontaire, mécanisme <b>vésical</b>", order_index: 33 },
    { recto: "Comment réalise-t-on le test d'effort pour l'IU ?", verso: "On demande au patient de <b>tousser</b> (vessie remplie)\n· On observe s'il y a une fuite méatique <b>synchrone de l'effort</b>", order_index: 34 },
    { recto: "Qu'est-ce que le pad test ?", verso: "<b>Pesée des couches</b> sur une durée définie\n· Permet une quantification <b>objective</b> des fuites urinaires", order_index: 35 },
    { recto: "Quels éléments évaluent le retentissement de l'IU ?", verso: "· Nombre de <b>couches/jour</b>\n· <b>Calendrier mictionnel</b>\n· <b>Pad test</b>\n· Questions : <b>sortie - sexe - sport</b>\n· Auto-questionnaire <b>qualité de vie</b>", order_index: 36 },

    // --- III. Pathologies OGE ---
    { recto: "Quel est le mécanisme de la torsion du cordon spermatique ?", verso: "<b>Défaut de fixation</b> du testicule → rotation dans la bourse\n· <b>Ischémie aiguë</b> + œdème testiculaire\n· Strangulation des vaisseaux spermatiques", order_index: 37 },
    { recto: "En combien de temps survient la nécrose dans la torsion testiculaire ?", verso: "· Nécrose à partir de <b>6 heures</b>\n· Récupération possible jusqu'à <b>12 heures</b>", order_index: 38 },
    { recto: "Quel est le terrain typique de la torsion testiculaire ?", verso: "Les <b>adolescents</b>\n· Augmentation rapide du volume testiculaire à la puberté", order_index: 39 },
    { recto: "Quelle est la clinique de la torsion du cordon spermatique ?", verso: "· Douleurs <b>brutales, violentes, unilatérales</b> de la bourse\n· Irradiation <b>aine/fosse iliaque</b>\n· <b>PAS de signes infectieux</b> : apyrexie, BU négative\n· Nausées/vomissements", order_index: 40 },
    { recto: "Quels sont les signes physiques de la torsion testiculaire ?", verso: "· Testicule <b>hyperalgique</b>, augmenté de volume, <b>dur</b>\n· <b>Ascensionné</b> (rétracté vers l'orifice inguinal superficiel)\n· <b>Disparition du réflexe crémastérien</b>", order_index: 41 },
    { recto: "Comment fait-on le diagnostic de torsion testiculaire ?", verso: "<b>Diagnostic CLINIQUE</b>\n· Pas d'examen complémentaire nécessaire\n· <b>URGENCE</b> : exploration scrotale en urgence\n· Ne pas perdre de temps avec l'imagerie", order_index: 42 },
    { recto: "Quelles sont les formes cliniques de torsion ?", verso: "· <b>Torsion négligée</b> : nécrose, fièvre\n· <b>Sub-torsion</b> : courte, spontanément résolutive\n· <b>Néonatale</b>\n· Sur <b>cryptorchidie</b>\n· <b>Torsion d'hydatide</b> (enfant)", order_index: 43 },
    { recto: "Qu'est-ce qu'un phimosis ?", verso: "<b>Orifice préputial serré</b> empêchant le décalottage\n· <b>Physiologique</b> chez le nouveau-né\n· <b>Acquis</b> chez le sujet âgé ou diabétique", order_index: 44 },
    { recto: "Qu'est-ce qu'un paraphimosis ?", verso: "Prépuce serré bloqué en position <b>décalottée</b> (non recalotté)\n· Après sonde vésicale ou rapport sexuel\n· <b>Œdème préputial</b> par strangulation\n· Traitement : <b>réduction manuelle</b> en urgence", order_index: 45 },
    { recto: "Qu'est-ce qu'une hydrocèle vaginale ?", verso: "<b>Épanchement liquidien</b> dans la vaginale testiculaire\n· La vaginale produit trop de liquide\n· Visible à la <b>transillumination</b>", order_index: 46 },
    { recto: "Comment diagnostique-t-on une hydrocèle ?", verso: "· <b>Échographie scrotale</b>\n· Transillumination positive\n· DD : <b>tumeur testicule</b> (solide), <b>hernie inguino-scrotale</b>", order_index: 47 },
    { recto: "Qu'est-ce que la transillumination et quand est-elle positive ?", verso: "Test à la <b>lumière</b> traversant la bourse :\n· <b>Positive</b> (translucide) = liquide = <b>hydrocèle</b>\n· <b>Négative</b> (opaque) = masse solide ou hernie", order_index: 48 },
    { recto: "Qu'est-ce qu'une varicocèle ?", verso: "<b>Dilatation des veines</b> autour de l'artère testiculaire\n· Incompétence des <b>valvules veineuses</b>\n· Plus fréquent à <b>gauche</b>", order_index: 49 },
    { recto: "Pourquoi la varicocèle est-elle plus fréquente à gauche ?", verso: "La veine génitale gauche se jette <b>directement dans la veine rénale gauche</b> (à angle droit)\n· À droite, elle se jette dans la VCI (angle plus favorable)", order_index: 50 },
    { recto: "Quelles sont les conséquences d'une varicocèle ?", verso: "· <b>Douleurs</b> (pesanteur scrotale)\n· Impact sur la <b>fertilité</b> (élévation température testiculaire)", order_index: 51 },
    { recto: "Quels sont les signes cliniques de la varicocèle ?", verso: "Examen <b>debout puis couché</b> :\n· Tuméfaction <b>variqueuse accentuée</b> à la toux/Valsalva\n· <b>Disparaît en décubitus</b>\n· Confirmation par <b>échodoppler scrotal</b>", order_index: 52 },
    { recto: "Comment distinguer torsion et orchi-épididymite à l'examen ?", verso: "· <b>Torsion</b> : PAS de fièvre, BU négative, réflexe crémastérien <b>aboli</b>\n· <b>Orchi-épididymite</b> : fièvre, BU positive, réflexe crémastérien <b>conservé</b>", order_index: 53 },

    // --- IV. Lithiase et colique néphrétique ---
    { recto: "Quel est le mécanisme de la colique néphrétique ?", verso: "<b>Obstruction aiguë</b> de la voie excrétrice supérieure\n· → <b>Distension des cavités</b> pyélo-calicielles\n· C'est la distension qui provoque la douleur", order_index: 54 },
    { recto: "Quelle est la clinique typique de la colique néphrétique ?", verso: "· Douleur <b>lombo-abdominale unilatérale</b> brutale\n· <b>Hématurie microscopique</b>\n· Patient <b>agité</b>\n· Troubles digestifs : nausées, vomissements", order_index: 55 },
    { recto: "Quelle est la cause la plus fréquente de colique néphrétique ?", verso: "Les <b>calculs</b> urinaires : <b>80%</b> des cas\n· Autres causes intraluminales : caillots, nécrose papillaire\n· Causes pariétales : JPU, sténoses, tumeurs\n· Causes extrinsèques : ADP, fibrose RP", order_index: 56 },
    { recto: "Quel est le pourcentage de coliques néphrétiques aux urgences ?", verso: "<b>1-2%</b> des entrées aux urgences", order_index: 57 },
    { recto: "Quel est le traitement de la colique néphrétique ?", verso: "· <b>Antalgiques</b> (palier adapté)\n· <b>AINS</b> en première intention", order_index: 58 },
    { recto: "Quel est le mécanisme d'action des AINS dans la colique néphrétique ?", verso: "<b>Vasoconstriction de l'artériole afférente</b>\n· → Diminution du DFG\n· → Moins d'urine produite\n· → Moins de tension dans les cavités\nCe n'est pas seulement un effet anti-inflammatoire", order_index: 59 },
    { recto: "Quels examens complémentaires dans la colique néphrétique ?", verso: "· <b>BU</b> : hématurie microscopique\n· <b>Échographie</b> rénale : dilatation des cavités\n· <b>Scanner sans injection</b> : référence pour visualiser le calcul", order_index: 60 },
    { recto: "Quels sont les 3 types de causes d'obstruction urétérale ?", verso: "· <b>Intraluminale</b> : calculs (80%), caillots, nécrose papillaire\n· <b>Pariétale</b> : JPU, sténoses, tumeurs\n· <b>Extrinsèque</b> : adénopathies, fibrose rétropéritonéale", order_index: 61 },
    { recto: "Quelle est la clinique de la cystite aiguë ?", verso: "· <b>Hyperactivité vésicale</b> brutale\n· <b>Pollakiurie + impériosités</b>\n· <b>Brûlures mictionnelles</b>\n· +/- hématurie macroscopique\n· <b>PAS de lombalgie, PAS de fièvre</b>", order_index: 62 },
    { recto: "Que montre la BU dans la cystite ?", verso: "· <b>Leucocytes</b> positifs (pyurie)\n· <b>Nitrites</b> positifs (bactéries)", order_index: 63 },
    { recto: "Comment distinguer cystite et pyélonéphrite ?", verso: "· <b>Cystite</b> : SFU bas, PAS de fièvre, PAS de lombalgie\n· <b>Pyélonéphrite</b> : fièvre + douleur lombaire unilatérale\n· La cystite est une infection basse, la PNA est haute", order_index: 64 },
    { recto: "Quelle est la clinique de la pyélonéphrite aiguë ?", verso: "· Peut succéder à une <b>cystite</b>\n· <b>Syndrome septique</b> : fièvre, frissons\n· Douleur lombaire <b>brutale unilatérale</b>\n· <b>ECBU systématique</b>", order_index: 65 },
    { recto: "Pourquoi l'ECBU est-il obligatoire dans la pyélonéphrite ?", verso: "Pour l'<b>identification du germe</b> et l'<b>antibiogramme</b>\n· Contrairement à la cystite simple où la BU suffit", order_index: 66 },

    // --- Annales : PA, hématurie, protéinurie ---
    { recto: "Quelles sont les valeurs normales de MAPA sur 24h ?", verso: "· PAS moyenne 24h : <b>< 130 mmHg</b>\n· PAD moyenne 24h : <b>< 80 mmHg</b>", order_index: 67 },
    { recto: "Quelles sont les valeurs normales de MAPA diurne ?", verso: "· PAS diurne : <b>< 135 mmHg</b>\n· PAD diurne : <b>< 85 mmHg</b>", order_index: 68 },
    { recto: "Quelles sont les valeurs normales de MAPA nocturne ?", verso: "· PAS nocturne : <b>< 120 mmHg</b>\n· PAD nocturne : <b>< 70 mmHg</b>", order_index: 69 },
    { recto: "Quelles sont les valeurs normales de PA en consultation ?", verso: "· PAS : <b>< 140 mmHg</b>\n· PAD : <b>< 90 mmHg</b>", order_index: 70 },
    { recto: "Quelle est la définition de l'hypotension orthostatique ?", verso: "Baisse de :\n· <b>PAS ≥ 20 mmHg</b>\n  OU\n· <b>PAD ≥ 10 mmHg</b>\nen position debout par rapport au décubitus", order_index: 71 },
    { recto: "Quelles sont les causes d'urines rouges avec BU positive mais sans GR à l'ECBU ?", verso: "Causes de faux positifs de la BU pour l'hématurie :\n· <b>Rhabdomyolyse</b> (myoglobinurie)\n· <b>Hémolyse intravasculaire</b> (hémoglobinurie)\n· <b>Compression musculaire prolongée</b>", order_index: 72 },
    { recto: "La betterave donne-t-elle une BU positive pour l'hématurie ?", verso: "<b>Non</b>\n· La betterave colore les urines en rouge mais la BU reste <b>négative</b>\n· Il ne s'agit ni d'hémoglobine ni de myoglobine", order_index: 73 },
    { recto: "Que détecte spécifiquement la BU pour la protéinurie ?", verso: "La BU détecte spécifiquement l'<b>albumine</b>\n· Ne détecte PAS : bêta-2 microglobuline, chaînes légères Ig, myoglobine, hémoglobine", order_index: 74 },
    { recto: "Quelles sont les causes de faux positif de la BU pour la protéinurie ?", verso: "· <b>Urines alcalines</b>\n· <b>Hématurie macroscopique</b>", order_index: 75 },
    { recto: "Quelle est la différence entre hématurie et urines rouges sans hématies ?", verso: "· <b>Hématurie</b> = présence de GR dans les urines (BU + ET hématies à l'ECBU)\n· <b>Urines rouges sans hématies</b> = BU peut être positive mais pas de GR à l'ECBU (rhabdomyolyse, hémolyse)", order_index: 76 },
    { recto: "VRAI ou FAUX : une PAS diurne de 130 mmHg en MAPA est normale", verso: "<b>VRAI</b>\n· La limite pour la PAS diurne est <b>< 135 mmHg</b>\n· 130 < 135 donc c'est normal", order_index: 77 },
    { recto: "VRAI ou FAUX : une PAS nocturne de 130 mmHg en MAPA est normale", verso: "<b>FAUX</b>\n· La limite pour la PAS nocturne est <b>< 120 mmHg</b>\n· 130 > 120 donc c'est anormal", order_index: 78 },
    { recto: "VRAI ou FAUX : une PAD de 75 mmHg nocturne en MAPA est normale", verso: "<b>FAUX</b>\n· La limite pour la PAD nocturne est <b>< 70 mmHg</b>\n· 75 > 70 donc c'est anormal", order_index: 79 },
    { recto: "VRAI ou FAUX : une baisse de PAS de 15 mmHg à l'orthostatisme définit l'hypotension orthostatique", verso: "<b>FAUX</b>\n· Il faut une baisse de PAS <b>≥ 20 mmHg</b> (pas 15)\n· Ou une baisse de PAD <b>≥ 10 mmHg</b>", order_index: 80 },
    { recto: "Quels sont les 3 troubles de la phase de remplissage ?", verso: "· <b>Pollakiurie</b> (mictions trop fréquentes)\n· <b>Nycturie</b> (réveillé pour uriner)\n· <b>Urgenturie</b> (besoin brutal irrésistible)", order_index: 81 },
    { recto: "Quel réflexe est aboli dans la torsion testiculaire ?", verso: "Le <b>réflexe crémastérien</b>\n· Normalement, la stimulation de la face interne de la cuisse entraîne une ascension du testicule\n· Son abolition est un signe très évocateur de torsion", order_index: 82 },
    { recto: "Pourquoi ne pas faire d'imagerie devant une torsion testiculaire ?", verso: "Car la torsion est un <b>diagnostic clinique</b> et une <b>urgence chirurgicale</b>\n· Nécrose à 6h → chaque minute compte\n· L'imagerie ferait perdre un temps précieux", order_index: 83 },
    { recto: "Quelle est la conduite à tenir devant un paraphimosis ?", verso: "<b>Réduction manuelle en urgence</b>\n· Compression du gland pour réduire l'œdème\n· Puis recalottage du prépuce\n· Si échec : incision chirurgicale", order_index: 84 },
    { recto: "VRAI ou FAUX : la torsion testiculaire s'accompagne de fièvre", verso: "<b>FAUX</b> (dans la forme typique aiguë)\n· Apyrexie et BU négative\n· La fièvre est un signe d'<b>infection</b> (orchi-épididymite)\n· Exception : torsion négligée (nécrose → fièvre secondaire)", order_index: 85 },
    { recto: "Quel est le syndrome de la clé dans la serrure ?", verso: "Urgenturie <b>déclenchée par un stimulus réflexe</b> en arrivant chez soi (en mettant la clé dans la serrure)\n· Facteur déclenchant réflexe de l'hyperactivité vésicale", order_index: 86 },
    { recto: "Qu'est-ce que l'énurésie ?", verso: "Fuites urinaires survenant <b>durant le sommeil</b>\n· Type d'incontinence urinaire\n· Fréquente chez l'enfant, pathologique après 5-6 ans", order_index: 87 },
    { recto: "Quels sont les 3 S pour évaluer le retentissement de l'IU ?", verso: "· <b>Sortie</b> : impact sur les activités sociales\n· <b>Sexe</b> : impact sur la vie sexuelle\n· <b>Sport</b> : impact sur les activités physiques", order_index: 88 },
    { recto: "VRAI ou FAUX : la rhabdomyolyse donne une BU positive pour l'hématurie", verso: "<b>VRAI</b>\n· La <b>myoglobine</b> libérée par les muscles réagit avec la BU\n· Mais l'ECBU ne retrouve <b>pas de GR</b> (fausse hématurie)", order_index: 89 },
    { recto: "VRAI ou FAUX : l'hémolyse intravasculaire donne une BU positive pour l'hématurie sans GR à l'ECBU", verso: "<b>VRAI</b>\n· L'<b>hémoglobine libre</b> libérée par l'hémolyse réagit avec la BU\n· Mais il n'y a pas de GR intacts dans les urines", order_index: 90 },
    { recto: "Que signifie une PAD moyenne de 84 mmHg sur 24h en MAPA ?", verso: "C'est <b>anormal</b> (HTA)\n· La limite de PAD moyenne sur 24h est <b>< 80 mmHg</b>\n· 84 > 80 donc elle est élevée", order_index: 91 },
    { recto: "VRAI ou FAUX : les chaînes légères d'Ig sont détectées par la BU", verso: "<b>FAUX</b>\n· La BU ne détecte que l'<b>albumine</b>\n· Les chaînes légères ne sont pas détectées par la BU standard", order_index: 92 },
    { recto: "VRAI ou FAUX : la rifampicine donne une BU positive pour l'hématurie", verso: "<b>FAUX</b>\n· La rifampicine colore les urines en <b>rouge-orange</b> mais la BU reste <b>négative</b> pour l'hématurie", order_index: 93 },
    { recto: "Quel est le volume de miction à partir duquel on parle de pollakiurie ?", verso: "Ce n'est pas le volume qui définit la pollakiurie mais la <b>fréquence</b>\n· Pollakiurie = mictions à intervalle <b>< 2 heures</b>\n· Les volumes sont normaux", order_index: 94 },
    { recto: "Comment classe-t-on les causes d'obstruction urétérale ?", verso: "· <b>Intraluminale</b> : obstacle dans la lumière (calculs, caillots)\n· <b>Pariétale</b> : obstacle dans la paroi (JPU, tumeur urothéliale)\n· <b>Extrinsèque</b> : compression externe (ADP, fibrose)", order_index: 95 },
    { recto: "VRAI ou FAUX : une PAD de 68 mmHg nocturne en MAPA est normale", verso: "<b>VRAI</b>\n· La limite pour la PAD nocturne est <b>< 70 mmHg</b>\n· 68 < 70 donc c'est normal", order_index: 96 },
    { recto: "VRAI ou FAUX : une PAS de 135 mmHg en MAPA moyenne 24h est normale", verso: "<b>FAUX</b>\n· La limite de PAS moyenne 24h est <b>< 130 mmHg</b>\n· 135 > 130 donc c'est anormal", order_index: 97 },
    { recto: "VRAI ou FAUX : une augmentation de FC de 30 bpm à l'orthostatisme définit l'hypotension orthostatique", verso: "<b>FAUX</b>\n· L'hypotension orthostatique se définit par une baisse de <b>PAS ≥ 20</b> ou <b>PAD ≥ 10 mmHg</b>\n· La FC n'entre pas dans la définition", order_index: 98 },
    { recto: "Quelle est la différence entre capacité vésicale anatomique et fonctionnelle ?", verso: "· <b>Anatomique</b> : volume maximum que la vessie peut contenir = <b>350-500 mL</b>\n· <b>Fonctionnelle</b> : volume qui déclenche le besoin d'uriner = <b>150-250 mL</b>", order_index: 99 },
    { recto: "VRAI ou FAUX : le bilan urodynamique est un examen de première intention", verso: "<b>FAUX</b>\n· C'est un examen de <b>2e ligne</b>\n· On commence par l'interrogatoire, le calendrier mictionnel et la débimétrie", order_index: 100 },
  ],
  annales: [
    {
      titre: 'Annale 2022-2023 — PA, protéinurie, hématurie',
      annee: '2022-2023',
      rappel_cours: "**Urines rouges et BU :**\n· La BU détecte l'hémoglobine et la myoglobine (pas spécifique des GR)\n· BU hématurie positive SANS GR à l'ECBU = fausse hématurie : rhabdomyolyse (myoglobinurie), hémolyse intravasculaire (hémoglobinurie), compression musculaire prolongée\n· La betterave colore les urines mais la BU reste NÉGATIVE\n\n**Valeurs normales de PA (MAPA) :**\n· Moyenne 24h : PAS < 130, PAD < 80\n· Diurne : PAS < 135, PAD < 85\n· Nocturne : PAS < 120, PAD < 70\n· Consultation : < 140/90",
      questions: [
        {
          enonce: "Un patient présente des urines rouges. La BU est positive pour l'hématurie (+++). L'ECBU ne retrouve pas de globules rouges. Parmi les propositions suivantes, lesquelles peuvent expliquer cette situation ?",
          items: [
            { lettre: 'A', enonce: "Consommation de betterave", is_correct: false },
            { lettre: 'B', enonce: "Tumeur de vessie", is_correct: false },
            { lettre: 'C', enonce: "Rhabdomyolyse", is_correct: true },
            { lettre: 'D', enonce: "Hémolyse intravasculaire", is_correct: true },
            { lettre: 'E', enonce: "Compression musculaire prolongée", is_correct: true },
          ],
          correction: "**Réponse : CDE**\n\nLa situation décrite est une BU positive pour l'hématurie SANS globules rouges à l'ECBU. Cela correspond à une fausse hématurie par présence d'hémoglobine libre ou de myoglobine.\n\nA. **FAUX** — La betterave colore les urines en rouge mais la BU reste **négative** (ce n'est ni de l'hémoglobine ni de la myoglobine).\nB. **FAUX** — Une tumeur de vessie entraîne une hématurie vraie avec des **GR retrouvés à l'ECBU**.\nC. **VRAI** — La rhabdomyolyse libère de la **myoglobine** qui réagit positivement avec la BU mais il n'y a pas de GR.\nD. **VRAI** — L'hémolyse intravasculaire libère de l'**hémoglobine libre** dans le sang puis les urines (hémoglobinurie).\nE. **VRAI** — La compression musculaire prolongée provoque une **rhabdomyolyse** avec libération de myoglobine.",
        },
        {
          enonce: "Un homme de 20 ans réalise une MAPA. Parmi les valeurs suivantes, lesquelles sont compatibles avec une PA normale ?",
          items: [
            { lettre: 'A', enonce: "PAS moyenne sur 24h : 135 mmHg", is_correct: false },
            { lettre: 'B', enonce: "PAD nocturne moyenne : 68 mmHg", is_correct: true },
            { lettre: 'C', enonce: "PAS diurne moyenne : 130 mmHg", is_correct: true },
            { lettre: 'D', enonce: "PAD moyenne sur 24h : 75 mmHg", is_correct: true },
            { lettre: 'E', enonce: "PAD en consultation : 85 mmHg", is_correct: true },
          ],
          correction: "**Réponse : BCDE**\n\nA. **FAUX** — PAS moyenne 24h normale < **130 mmHg**. 135 est supérieur à 130.\nB. **VRAI** — PAD nocturne normale < **70 mmHg**. 68 < 70.\nC. **VRAI** — PAS diurne normale < **135 mmHg**. 130 < 135.\nD. **VRAI** — PAD moyenne 24h normale < **80 mmHg**. 75 < 80.\nE. **VRAI** — PAD en consultation normale < **90 mmHg**. 85 < 90.",
        },
      ],
    },
    {
      titre: 'Annale 2021-2022 — PA, protéinurie, hématurie',
      annee: '2021-2022',
      rappel_cours: "**Urines rouges sans hématies excessives :**\n· Les causes de fausse hématurie (BU + sans GR) incluent : rhabdomyolyse, hémolyse intravasculaire\n· La betterave colore les urines mais BU négative\n· L'infection urinaire peut donner une hématurie VRAIE (avec GR excessifs)\n· Les chaînes légères d'Ig ne sont pas détectées par la BU\n\n**MAPA normale :**\n· PAS nocturne < 120 mmHg\n· PAS diurne < 135 mmHg\n· PAS moyenne 24h < 130 mmHg\n· PAD moyenne 24h < 80 mmHg\n· PAD nocturne < 70 mmHg",
      questions: [
        {
          enonce: "Un patient présente des urines rouges. L'analyse ne retrouve pas d'hématies en nombre excessif. Parmi les propositions suivantes, lesquelles peuvent expliquer cette situation ?",
          items: [
            { lettre: 'A', enonce: "Sécrétion excessive de chaînes légères d'immunoglobuline", is_correct: false },
            { lettre: 'B', enonce: "Rhabdomyolyse", is_correct: true },
            { lettre: 'C', enonce: "Infection urinaire", is_correct: false },
            { lettre: 'D', enonce: "Hémolyse intravasculaire", is_correct: true },
            { lettre: 'E', enonce: "Consommation de betterave", is_correct: true },
          ],
          correction: "**Réponse : BDE**\n\nA. **FAUX** — La sécrétion excessive de chaînes légères d'Ig peut s'accompagner d'une hématurie macroscopique vraie (avec hématies). De plus, les chaînes légères ne colorent pas les urines en rouge.\nB. **VRAI** — La rhabdomyolyse libère de la **myoglobine** qui colore les urines en rouge sans hématies excessives.\nC. **FAUX** — L'infection urinaire peut s'accompagner d'une hématurie vraie avec hématies en nombre excessif.\nD. **VRAI** — L'hémolyse intravasculaire libère de l'**hémoglobine libre** qui colore les urines sans hématies.\nE. **VRAI** — La betterave colore les urines en rouge sans hématurie (pigments alimentaires).",
        },
        {
          enonce: "Parmi les valeurs de MAPA suivantes, lesquelles sont compatibles avec une PA normale (permettant d'exclure une HTA) ?",
          items: [
            { lettre: 'A', enonce: "PAS nocturne : 130 mmHg", is_correct: false },
            { lettre: 'B', enonce: "PAS diurne : 130 mmHg", is_correct: true },
            { lettre: 'C', enonce: "PAS moyenne 24h : 125 mmHg", is_correct: true },
            { lettre: 'D', enonce: "PAD moyenne 24h : 84 mmHg", is_correct: false },
            { lettre: 'E', enonce: "PAD nocturne : 75 mmHg", is_correct: false },
          ],
          correction: "**Réponse : BC**\n\nA. **FAUX** — PAS nocturne normale < **120 mmHg**. 130 > 120, c'est anormal.\nB. **VRAI** — PAS diurne normale < **135 mmHg**. 130 < 135.\nC. **VRAI** — PAS moyenne 24h normale < **130 mmHg**. 125 < 130.\nD. **FAUX** — PAD moyenne 24h normale < **80 mmHg**. 84 > 80, c'est anormal.\nE. **FAUX** — PAD nocturne normale < **70 mmHg**. 75 > 70, c'est anormal.",
        },
      ],
    },
    {
      titre: 'Annale 2020-2021 — PA, protéinurie, hématurie',
      annee: '2020-2021',
      rappel_cours: "**BU et détection des protéines :**\n· La BU détecte spécifiquement l'**albumine**\n· Elle ne détecte PAS : bêta-2 microglobuline, chaînes légères d'Ig, myoglobine, hémoglobine\n\n**Hypotension orthostatique :**\n· Définition : baisse de PAS ≥ 20 mmHg OU baisse de PAD ≥ 10 mmHg en position debout\n· La valeur absolue de PA en orthostatisme ne définit pas l'hypotension orthostatique\n· C'est la DIFFÉRENCE entre décubitus et orthostatisme qui compte",
      questions: [
        {
          enonce: "Parmi les protéines suivantes, laquelle est détectée par la bandelette urinaire ?",
          items: [
            { lettre: 'A', enonce: "Bêta-2 microglobuline", is_correct: false },
            { lettre: 'B', enonce: "Chaînes légères d'immunoglobuline", is_correct: false },
            { lettre: 'C', enonce: "Myoglobine", is_correct: false },
            { lettre: 'D', enonce: "Albumine", is_correct: true },
            { lettre: 'E', enonce: "Hémoglobine", is_correct: false },
          ],
          correction: "**Réponse : D**\n\nLa bandelette urinaire utilise un réactif coloré qui ne réagit qu'avec l'**albumine**.\n\nA. **FAUX** — La bêta-2 microglobuline est une petite protéine tubulaire non détectée par la BU.\nB. **FAUX** — Les chaînes légères d'Ig ne sont pas détectées par la BU (nécessite une électrophorèse des protéines urinaires).\nC. **FAUX** — La myoglobine n'est pas détectée par le réactif aux protéines de la BU (elle est détectée par le réactif à l'hémoglobine).\nD. **VRAI** — L'albumine est la seule protéine détectée par la BU.\nE. **FAUX** — L'hémoglobine est détectée par un réactif différent (réactif hématurie), pas le réactif protéinurie.",
        },
        {
          enonce: "Parmi les propositions suivantes, laquelle correspond à la définition de l'hypotension orthostatique ?",
          items: [
            { lettre: 'A', enonce: "PAS de 100 mmHg en orthostatisme", is_correct: false },
            { lettre: 'B', enonce: "PAD de 50 mmHg en orthostatisme", is_correct: false },
            { lettre: 'C', enonce: "Différence de PAS entre décubitus et orthostatisme de 15 mmHg", is_correct: false },
            { lettre: 'D', enonce: "Différence de PAD entre décubitus et orthostatisme de 12 mmHg", is_correct: true },
            { lettre: 'E', enonce: "Augmentation de la fréquence cardiaque de 30 bpm à l'orthostatisme", is_correct: false },
          ],
          correction: "**Réponse : D**\n\nL'hypotension orthostatique se définit par une **baisse de PAS ≥ 20 mmHg** OU une **baisse de PAD ≥ 10 mmHg** lors du passage en position debout.\n\nA. **FAUX** — La valeur absolue de PAS en orthostatisme ne définit pas l'hypotension orthostatique. C'est la différence avec le décubitus qui compte.\nB. **FAUX** — Même raisonnement : la valeur absolue de PAD ne suffit pas.\nC. **FAUX** — La baisse de PAS doit être ≥ **20 mmHg** (pas 15) pour définir l'hypotension orthostatique.\nD. **VRAI** — Une baisse de PAD de 12 mmHg (≥ 10 mmHg) correspond bien à la définition.\nE. **FAUX** — L'augmentation de FC n'entre pas dans la définition de l'hypotension orthostatique (c'est un mécanisme compensateur, pas un critère diagnostique).",
        },
      ],
    },
    {
      titre: 'Annale 2019 Session 1 — PA, protéinurie, hématurie',
      annee: '2019',
      rappel_cours: "**Valeurs normales MAPA :**\n· Diurne : PAS < 135 et PAD < 85\n· Nocturne : PAS < 120 et PAD < 70\n· Moyenne 24h : PAS < 130 et PAD < 80\n\n**Hématurie BU positive sans hématurie cytologique :**\n· Rhabdomyolyse (myoglobinurie)\n· Hémolyse intravasculaire (hémoglobinurie)\n· La betterave et la rifampicine colorent les urines mais BU négative",
      questions: [
        {
          enonce: "Quelles sont les valeurs normales de PA en MAPA sur 24h ?",
          items: [
            { lettre: 'A', enonce: "PAS diurne : 120-140 mmHg", is_correct: false },
            { lettre: 'B', enonce: "PAD diurne : 80-89 mmHg", is_correct: false },
            { lettre: 'C', enonce: "PAS nocturne : 110-129 mmHg", is_correct: false },
            { lettre: 'D', enonce: "PAD nocturne : 60-69 mmHg", is_correct: true },
            { lettre: 'E', enonce: "PAS moyenne 24h : 120-140 mmHg", is_correct: false },
          ],
          correction: "**Réponse : D**\n\nA. **FAUX** — La PAS diurne normale doit être < **135 mmHg**. La fourchette 120-140 dépasse ce seuil.\nB. **FAUX** — La PAD diurne normale doit être < **85 mmHg**. La fourchette 80-89 dépasse ce seuil.\nC. **FAUX** — La PAS nocturne normale doit être < **120 mmHg**. La fourchette 110-129 inclut des valeurs > 120.\nD. **VRAI** — La PAD nocturne normale est < **70 mmHg**. La fourchette 60-69 est bien dans les valeurs normales.\nE. **FAUX** — La PAS moyenne 24h normale doit être < **130 mmHg**. La fourchette 120-140 dépasse ce seuil.",
        },
        {
          enonce: "Un patient présente une hématurie à la BU mais pas d'hématurie à l'examen cytologique (ECBU). Quelles sont les causes possibles ?",
          items: [
            { lettre: 'A', enonce: "Consommation de betterave", is_correct: false },
            { lettre: 'B', enonce: "Prise de rifampicine", is_correct: false },
            { lettre: 'C', enonce: "Rhabdomyolyse", is_correct: true },
            { lettre: 'D', enonce: "Hémolyse intravasculaire", is_correct: true },
            { lettre: 'E', enonce: "Hépatite", is_correct: false },
          ],
          correction: "**Réponse : CD**\n\nA. **FAUX** — La betterave colore les urines en rouge mais la BU reste **négative** pour l'hématurie.\nB. **FAUX** — La rifampicine colore les urines en rouge-orange mais la BU reste **négative** pour l'hématurie.\nC. **VRAI** — La rhabdomyolyse libère de la **myoglobine** qui réagit positivement avec la BU sans présence de GR.\nD. **VRAI** — L'hémolyse intravasculaire libère de l'**hémoglobine libre** détectée par la BU sans GR.\nE. **FAUX** — L'hépatite ne donne pas de BU positive pour l'hématurie. La bilirubine colore les urines mais n'est pas détectée par le réactif hématurie.",
        },
      ],
    },
    {
      titre: 'Annale 2019 Session 2 — PA, protéinurie, hématurie',
      annee: '2019 Session 2',
      rappel_cours: "**Hypotension orthostatique :**\n· Définition : baisse de PAS ≥ 20 mmHg OU baisse de PAD ≥ 10 mmHg en position debout\n· Ce n'est PAS défini par une valeur absolue de PA debout\n· La FC n'entre pas dans la définition\n\n**Faux positifs BU protéinurie :**\n· Urines alcalines (pH élevé modifie le réactif)\n· Hématurie macroscopique (interférence colorimétrique)\n· Les chaînes légères d'Ig, la rhabdomyolyse et l'hémolyse ne donnent PAS de faux positif sur la bandelette protéinurie",
      questions: [
        {
          enonce: "Parmi les propositions suivantes, laquelle correspond à la définition de l'hypotension orthostatique ?",
          items: [
            { lettre: 'A', enonce: "PA < 130/80 mmHg en position debout", is_correct: false },
            { lettre: 'B', enonce: "PAS < 100 mmHg en position debout", is_correct: false },
            { lettre: 'C', enonce: "Baisse de PAS ≥ 15 mmHg au passage en position debout", is_correct: false },
            { lettre: 'D', enonce: "Baisse de PAS ≥ 30 mmHg au passage en position debout", is_correct: false },
            { lettre: 'E', enonce: "Baisse de PAD ≥ 10 mmHg au passage en position debout", is_correct: true },
          ],
          correction: "**Réponse : E**\n\nL'hypotension orthostatique se définit par une baisse de **PAS ≥ 20 mmHg** OU une baisse de **PAD ≥ 10 mmHg**.\n\nA. **FAUX** — L'hypotension orthostatique n'est pas définie par une valeur absolue de PA.\nB. **FAUX** — Même raisonnement, la valeur absolue de PAS ne suffit pas.\nC. **FAUX** — Le seuil pour la PAS est ≥ **20 mmHg** (pas 15).\nD. **FAUX** — Le seuil pour la PAS est ≥ **20 mmHg** (pas 30). 30 serait certes anormal, mais ne correspond pas à la définition standard.\nE. **VRAI** — Une baisse de PAD ≥ **10 mmHg** correspond bien à la définition de l'hypotension orthostatique.",
        },
        {
          enonce: "Parmi les propositions suivantes, lesquelles sont des causes de faux positif de la BU pour la protéinurie ?",
          items: [
            { lettre: 'A', enonce: "Chaînes légères d'immunoglobuline", is_correct: false },
            { lettre: 'B', enonce: "Urines alcalines", is_correct: true },
            { lettre: 'C', enonce: "Hématurie macroscopique", is_correct: true },
            { lettre: 'D', enonce: "Rhabdomyolyse", is_correct: false },
            { lettre: 'E', enonce: "Hémolyse", is_correct: false },
          ],
          correction: "**Réponse : BC**\n\nA. **FAUX** — Les chaînes légères d'Ig ne sont pas détectées par la BU (la BU ne détecte que l'albumine). Ce n'est donc pas un faux positif mais un **faux négatif** (protéinurie présente mais non détectée).\nB. **VRAI** — Les urines alcalines (pH élevé) modifient le réactif colorimétrique de la BU et peuvent donner un faux positif pour la protéinurie.\nC. **VRAI** — L'hématurie macroscopique interfère avec la lecture colorimétrique de la BU pour la protéinurie.\nD. **FAUX** — La rhabdomyolyse libère de la myoglobine qui interfère avec le réactif hématurie (pas protéinurie).\nE. **FAUX** — L'hémolyse libère de l'hémoglobine qui interfère avec le réactif hématurie (pas protéinurie).",
        },
      ],
    },
  ],
};

export default content;

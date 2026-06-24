import type { PriveCourseContent } from '../prive-courses';

const content: PriveCourseContent = {
  fiche: {
    parties: [
      {
        numero: 'I',
        titre: 'Troubles de la miction',
        sous_parties: [
          {
            titre: 'Physiologie vesicale',
            rows: [
              { concept: '◆ Phase de remplissage', detail_md: "Represente **>99% du temps vesical**\n· La vessie est au repos\n· Les forces de retenue sont superieures aux forces d'expulsion vesicale\n· Continence assuree en permanence", kind: 'a_retenir' },
              { concept: '◆ Phase mictionnelle = reflexe mictionnel', detail_md: "Phase **ponctuelle** (breve)\n· **Contraction vesicale** + **relaxation simultanee** des forces de retenue\n· Coordination neurologique indispensable", kind: 'a_retenir' },
              { concept: '◆ Miction normale attendue', detail_md: "· Vidange **complete** sans residu\n· Miction **volontaire**, aisee et indolore\n· Duree environ **30 secondes**\n· Frequence : toutes les **3-4 heures**\n· Volume par miction : **200-250 mL**\n· +/- **1 lever nocturne** acceptable", kind: 'a_retenir' },
            ],
          },
          {
            titre: 'Semiologie des troubles mictionnels',
            rows: [
              { concept: 'Troubles de la phase de remplissage', detail_md: "Correspondent a une **hyperactivite vesicale**\n· Pollakiurie, nycturie, urgenturie", kind: 'normal' },
              { concept: 'Troubles de la phase mictionnelle', detail_md: "Correspondent a la **dysurie**\n· Retard a l'initiation, jet faible, miction prolongee", kind: 'normal' },
              { concept: '⚠ Signes particuliers evocateurs', detail_md: "· **Pneumaturie** = emission de gaz dans les urines\n· **Fecalurie** = emission de selles dans les urines\n→ Evoquent une **communication anormale** entre appareil digestif et urinaire (fistule)", kind: 'piege' },
            ],
          },
          {
            titre: 'Anomalies de la phase de remplissage — Hyperactivite vesicale',
            rows: [
              { concept: '◆ Pollakiurie', detail_md: "Mictions **trop frequentes** (intervalle < 2 heures)\n· Les volumes par miction sont **normaux** (petites quantites frequentes)\n· A ne pas confondre avec la polyurie", kind: 'a_retenir' },
              { concept: '⚠ Pollakiurie vs Polyurie', detail_md: "· **Pollakiurie** = mictions trop frequentes, volumes normaux par miction\n· **Polyurie** = volume urinaire total **> 3 L/24h** (cause metabolique : diabete, potomanie...)\nLa polyurie entraine des mictions frequentes mais par augmentation du volume total, pas par irritation vesicale", kind: 'piege' },
              { concept: '◆ Nycturie', detail_md: "Envie d'uriner qui **REVEILLE** le patient la nuit\n· C'est le besoin urinaire qui interrompt le sommeil", kind: 'a_retenir' },
              { concept: '⚠ Nycturie vs Nocturie', detail_md: "· **Nycturie** = besoin d'uriner qui **reveille** le patient\n· **Nocturie** = patient qui se reveille pour **d'autres raisons** (troubles du sommeil) et en profite pour uriner\nDistinction fondamentale a l'interrogatoire", kind: 'piege' },
              { concept: '◆ Urgenturie', detail_md: "Besoin **brutal**, **irresistible** et **urgent** d'uriner\n· Le patient ne peut pas se retenir\n· Peut entrainer une fuite si les toilettes ne sont pas accessibles", kind: 'a_retenir' },
              { concept: 'Facteurs declenchants de l\'hyperactivite vesicale', detail_md: "· **Sensoriels** : froid, stress\n· **De precaution** : uriner avant de sortir\n· **Reflexes** : syndrome de la **cle dans la serrure** (urgence declenchee en arrivant chez soi)", kind: 'normal' },
            ],
          },
          {
            titre: 'Anomalies de la phase mictionnelle — Dysurie',
            rows: [
              { concept: '◆ Dysurie : definition et terrain', detail_md: "Difficulte a uriner, **surtout masculine**\n· Liee a l'augmentation du volume prostatique avec l'age\n· La prostate comprime l'uretre → gene a l'ecoulement", kind: 'a_retenir' },
              { concept: 'Symptomes de dysurie', detail_md: "· **Retard a l'initiation** de la miction\n· **Jet faible**\n· **Gouttes retardataires** (gouttes en fin de miction)\n· Miction **prolongee > 30 secondes**\n· Impression de **mauvaise vidange**", kind: 'normal' },
              { concept: '◆ Debimetrie et seuil de conscience', detail_md: "Les patients prennent conscience de la dysurie quand le **debit max < 10 mL/s**\n· Norme : debit max **≥ 15 mL/s**\n· Entre 10 et 15 : dysurie souvent meconnue", kind: 'a_retenir' },
              { concept: '◆ Retention vesicale aigue', detail_md: "**Impossibilite soudaine de vider la vessie** malgre une envie pressante\n· = **Urgence urologique**\n· Necessite un sondage vesical ou catheterisme sus-pubien en urgence", kind: 'a_retenir' },
              { concept: '◆ Capacite vesicale', detail_md: "· Capacite **anatomique** : 350-500 mL\n· Capacite **fonctionnelle** : 150-250 mL (volume declenchant le besoin)", kind: 'a_retenir' },
              { concept: '◆ Globe vesical', detail_md: "Volume vesical **> 500 mL**, parfois > 1 L\n· Se **voit rarement** (patient mince)\n· Se **palpe occasionnellement**\n· Se **percute souvent** : **matite hypogastrique**", kind: 'a_retenir' },
              { concept: '⚠ Globe vesical vs Ascite', detail_md: "Le globe vesical donne une **matite hypogastrique convexe vers le haut**\nA ne pas confondre avec l'ascite (matite deplaçable, diffuse)", kind: 'piege' },
              { concept: 'Fausses mictions / Incontinence par regorgement', detail_md: "· Vessie pleine en permanence avec fuites sur surpression\n· Le patient urine par **trop-plein**\n· Toujours **rechercher un retentissement renal** (insuffisance renale obstructive)", kind: 'normal' },
            ],
          },
          {
            titre: 'Examen clinique et explorations',
            rows: [
              { concept: '◆ Interrogatoire', detail_md: "Rechercher les **ATCD urologiques** :\n· Sondage vesical anterieur\n· Endoscopie urinaire\n· MST (retrecissement uretral)\n· Traumatisme du bassin\n· Chirurgie urologique", kind: 'a_retenir' },
              { concept: '◆ Examen physique', detail_md: "· Inspection des **OGE** (organes genitaux externes)\n· **Touchers pelviens** : TR (toucher rectal) / TV (toucher vaginal)\n· Palpation abdomen et **fosses lombaires** (contact lombaire)\n· **BU** (bandelette urinaire) systematique\n· Examen neurologique, gynecologique et proctologique si necessaire", kind: 'a_retenir' },
              { concept: 'Debimetrie', detail_md: "Entonnoir avec roue mesurant le debit urinaire\n· Trace une **courbe de debit**\n· Obstruction → courbe **aplatie** (plateau bas prolonge)\n· Normal → courbe en cloche, pic > 15 mL/s", kind: 'normal' },
              { concept: 'Score IPSS', detail_md: "Score symptomatique de **0 a 35**\n· Evalue la severite des troubles mictionnels\n· Inclut une question sur la **qualite de vie**", kind: 'normal' },
              { concept: 'Calendrier mictionnel', detail_md: "Rempli par le patient pendant **3-4 jours** a domicile\n· Note les horaires, volumes et circonstances des mictions\n· Outil de premiere ligne", kind: 'normal' },
              { concept: 'Bilan urodynamique', detail_md: "Examen de **2e ligne** (pas en premiere intention)\n· Sondes dans la **vessie**, l'**uretre** et le **rectum**\n· Mesure les pressions vesicales et uretrales pendant remplissage et miction", kind: 'normal' },
              { concept: 'Examens complementaires', detail_md: "· **Echographie** reno-vesico-prostatique\n· **Uretro-cystoscopie** (endoscopie)\n· Biologie : **creatininemie** (fonction renale), **PSA** (prostate), **ECBU** (infection)", kind: 'normal' },
            ],
          },
        ],
      },
      {
        numero: 'II',
        titre: 'Incontinence urinaire',
        sous_parties: [
          {
            titre: 'Definition et physiologie',
            rows: [
              { concept: '◆ Definition ICS 2002', detail_md: "**Perte involontaire d'urine** quelles que soient les circonstances\n· Definition standardisee par l'International Continence Society", kind: 'a_retenir' },
              { concept: 'Phase du cycle mictionnel touchee', detail_md: "L'incontinence est un trouble de la **phase de remplissage**\n· Le cycle mictionnel : continence **99,8%** du temps, vidange **4-6 fois/jour** (0,2%)", kind: 'normal' },
              { concept: '◆ Conditions de la continence', detail_md: "· Appareil urinaire **bien forme** anatomiquement\n· Reservoir vesical **stable** et **compliant** (pas de contraction intempestive)\n· Forces de retenue **superieures** aux forces d'expulsion\n· **Coordination neurologique** intacte", kind: 'a_retenir' },
            ],
          },
          {
            titre: 'Epidemiologie',
            rows: [
              { concept: '◆ Prevalence', detail_md: "· **1/3 des femmes** touchees\n· **3-11% des hommes**\n· Probleme de sante publique majeur", kind: 'a_retenir' },
              { concept: 'Impact', detail_md: "· Veritable **tabou** social\n· Source de **handicap** fonctionnel et psychologique\n· **Cout** eleve pour le patient et la societe (protections, soins...)", kind: 'normal' },
            ],
          },
          {
            titre: 'Demarche diagnostique',
            rows: [
              { concept: '◆ Les 3 etapes', detail_md: "1. **Affirmer** la fuite meatique (fuite par le meat uretral)\n2. **Evaluer** l'importance, le retentissement et les attentes du patient\n3. **Preciser le mecanisme** de l'incontinence", kind: 'a_retenir' },
              { concept: '◆ Types d\'incontinence urinaire', detail_md: "· **IU d'effort** : fuites lors d'augmentation de la pression intra-abdominale (toux, rire, sport, port de charge)\n· **IU par urgenturie** : delai de securite trop court, fuite avant d'arriver aux toilettes\n· **IU mixte** : association effort + urgenturie\n· **IU permanente** : rare mais plus invalidante (fuite continue)\n· **Enuresie** : fuites survenant **durant le sommeil**", kind: 'a_retenir' },
              { concept: '⚠ IU d\'effort vs IU par urgenturie', detail_md: "· **Effort** : la fuite survient a l'effort, pas de besoin prealable, pas de contraction vesicale — mecanisme sphincterien\n· **Urgenturie** : besoin brutal precede la fuite, contraction vesicale involontaire — mecanisme vesical\nLe traitement differe completement selon le type", kind: 'piege' },
            ],
          },
          {
            titre: 'Evaluation clinique de l\'incontinence',
            rows: [
              { concept: 'Test d\'effort', detail_md: "· On demande au patient de **tousser** (vessie remplie)\n· On observe s'il y a une fuite meatique synchrone de l'effort", kind: 'normal' },
              { concept: 'Remplissage vesical', detail_md: "Remplissage progressif pour reproduire les symptomes et evaluer la capacite vesicale fonctionnelle", kind: 'normal' },
              { concept: '◆ Evaluation du retentissement', detail_md: "· Nombre de **couches/jour** (protections)\n· **Calendrier mictionnel**\n· **Pad test** : pesee des couches sur une duree definie (quantification objective des fuites)\n· Questions sur la vie sociale : **sortie — sexe — sport** (les 3 S)\n· **Auto-questionnaire** qualite de vie", kind: 'a_retenir' },
            ],
          },
        ],
      },
      {
        numero: 'III',
        titre: 'Pathologies des organes genitaux externes masculins',
        sous_parties: [
          {
            titre: 'Torsion du cordon spermatique',
            rows: [
              { concept: '◆ Mecanisme', detail_md: "**Defaut de fixation** du testicule dans la bourse\n· Le testicule tourne sur lui-meme → **rotation du cordon spermatique**\n· Consequence : **ischemie aigue** + oedeme testiculaire", kind: 'a_retenir' },
              { concept: '◆ Delais de necrose', detail_md: "· **Necrose** a partir de **6 heures**\n· Recuperation possible jusqu'a **12 heures**\n· Au-dela : lesions irreversibles", kind: 'a_retenir' },
              { concept: 'Terrain', detail_md: "Surtout les **adolescents** (augmentation rapide du volume testiculaire a la puberte)", kind: 'normal' },
              { concept: '◆ Clinique', detail_md: "· Douleurs **brutales**, **violentes**, **unilaterales** de la bourse\n· Irradiation vers l'**aine** et la **fosse iliaque** homolaterale\n· **PAS de signes infectieux** : apyrexie, BU negative\n· Nausees et vomissements frequents", kind: 'a_retenir' },
              { concept: '◆ Examen physique', detail_md: "· Testicule **hyperalgique**\n· Augmente de volume, **dur**\n· **Ascensionne** (retracte vers l'orifice inguinal superficiel)\n· **Disparition du reflexe cremasterien** (abolition = signe tres evocateur)", kind: 'a_retenir' },
              { concept: '◆ Diagnostic et prise en charge', detail_md: "· **DIAGNOSTIC CLINIQUE** : pas d'examen complementaire necessaire\n· **URGENCE CHIRURGICALE** : exploration scrotale en urgence\n· Ne pas perdre de temps avec l'imagerie", kind: 'a_retenir' },
              { concept: 'Formes cliniques', detail_md: "· **Torsion negligee** : necrose installee, fievre secondaire\n· **Sub-torsion** : torsion de courte duree, spontanement resolutive (douleur transitoire)\n· **Torsion neonatale** : a la naissance\n· Torsion sur **cryptorchidie** (testicule non descendu)\n· **Torsion d'hydatide** : torsion d'un reliquat embryonnaire appendu au testicule (surtout chez l'enfant)", kind: 'normal' },
            ],
          },
          {
            titre: 'Phimosis et paraphimosis',
            rows: [
              { concept: 'Phimosis', detail_md: "**Orifice preputial serre** empechant le decalottage\n· **Physiologique** chez le nouveau-ne (adhesions prepuce-gland normales)\n· **Acquis** chez le sujet age ou diabetique (sclerose du prepuce)", kind: 'normal' },
              { concept: '◆ Paraphimosis', detail_md: "Prepuce serre **non recalotte** (bloque en arriere du gland)\n· Survient apres **sonde vesicale** ou rapport sexuel\n· Entraine un **oedeme preputial** par strangulation veineuse\n· Traitement : **reduction manuelle** en urgence (avant necrose)", kind: 'a_retenir' },
            ],
          },
          {
            titre: 'Hydrocele vaginale',
            rows: [
              { concept: '◆ Hydrocele', detail_md: "**Epanchement liquidien** entre les feuillets de la vaginale testiculaire\n· La vaginale **produit trop de liquide**\n· Visible a la **transillumination** (lumiere traversant le liquide)", kind: 'a_retenir' },
              { concept: 'Diagnostic et diagnostics differentiels', detail_md: "· Diagnostic : **echographie scrotale**\n· DD : **tumeur du testicule** (masse solide, non transilluminable)\n· DD : **hernie inguino-scrotale** (impulsive a la toux, non transilluminable)", kind: 'normal' },
            ],
          },
          {
            titre: 'Varicocele',
            rows: [
              { concept: '◆ Definition', detail_md: "**Dilatation des veines anterieures** autour de l'artere testiculaire\n· Due a une **incompetence des valvules veineuses**\n· Plus frequent a **gauche** (la veine genitale gauche se jette directement dans la veine renale gauche a angle droit)", kind: 'a_retenir' },
              { concept: '◆ Consequences', detail_md: "· **Douloureux** (pesanteur scrotale)\n· **Impact sur la fertilite** (elevation de la temperature testiculaire)", kind: 'a_retenir' },
              { concept: '◆ Examen clinique', detail_md: "Examen **debout puis couche** :\n· Tumefaction **variqueuse** accentuee a la **toux** et au **Valsalva**\n· **Disparait en decubitus** (drainage veineux par gravite)", kind: 'a_retenir' },
              { concept: 'Diagnostic', detail_md: "· Diagnostic **clinique** (aspect typique)\n· Confirmation par **echodoppler scrotal**", kind: 'normal' },
            ],
          },
        ],
      },
      {
        numero: 'IV',
        titre: 'Lithiase urinaire et colique nephretique',
        sous_parties: [
          {
            titre: 'Colique nephretique',
            rows: [
              { concept: '◆ Mecanisme', detail_md: "**Obstruction aigue** de la voie excretrice superieure\n· Entraine une **distension des cavites pyelo-calicielles**\n· C'est la distension qui provoque la douleur, pas le calcul lui-meme", kind: 'a_retenir' },
              { concept: '◆ Clinique typique', detail_md: "· Douleur **lombo-abdominale unilaterale** brutale, intense\n· **Hematurie microscopique** (BU positive)\n· Patient **agite** (ne trouvant pas de position antalgique)\n· Troubles digestifs : nausees, vomissements (reflexe vagal)", kind: 'a_retenir' },
              { concept: '◆ Causes d\'obstruction', detail_md: "· **Intraluminale** : calculs (**80%** des cas), caillots sanguins, necrose papillaire\n· **Parietale** : syndrome de la jonction pyelo-ureterale (JPU), stenoses, tumeurs urotheliaux\n· **Extrinseque** : adenopathies, fibrose retroperitoneale", kind: 'a_retenir' },
              { concept: 'Epidemiologie', detail_md: "Represente **1-2% des entrees aux urgences**", kind: 'normal' },
              { concept: '◆ Traitement', detail_md: "· **Antalgiques** (palier adapte a la douleur)\n· **AINS** en premiere intention : vasoconstricteur de l'arteriole afferente → diminution du DFG → moins d'urine produite → moins de tension dans les cavites\n· Pas de restriction hydrique en phase aigue", kind: 'a_retenir' },
              { concept: '⚠ Mecanisme d\'action des AINS dans la CN', detail_md: "Les AINS agissent par **vasoconstriction de l'arteriole afferente** :\n· Diminution du DFG\n· Moins d'urine produite en amont de l'obstacle\n· Moins de distension des cavites\nCe n'est pas seulement un effet anti-inflammatoire", kind: 'piege' },
              { concept: 'Diagnostic paraclinique', detail_md: "· **BU** : hematurie microscopique\n· **Echographie renale** : dilatation des cavites\n· **Scanner abdominal sans injection** : visualise le calcul (examen de reference)", kind: 'normal' },
            ],
          },
          {
            titre: 'Cystite aigue',
            rows: [
              { concept: '◆ Clinique', detail_md: "· **Hyperactivite vesicale** d'apparition brutale\n· **Pollakiurie** + **imperiosites** (urgenturies)\n· **Brulures mictionnelles** (signes fonctionnels urinaires bas)\n· +/- Hematurie macroscopique\n· **PAS de lombalgie**, **PAS de fievre**", kind: 'a_retenir' },
              { concept: '◆ BU dans la cystite', detail_md: "· **Leucocytes** positifs (pyurie = reaction inflammatoire)\n· **Nitrites** positifs (bacteries transformant les nitrates en nitrites)", kind: 'a_retenir' },
              { concept: '⚠ Cystite vs Pyelonephrite', detail_md: "La cystite est une infection **basse** (limitee a la vessie) :\n· Pas de fievre, pas de douleur lombaire\n· Si fievre ou douleur lombaire apparait → pyelonephrite", kind: 'piege' },
            ],
          },
          {
            titre: 'Pyelonephrite aigue',
            rows: [
              { concept: '◆ Clinique', detail_md: "· Peut faire suite a une **cystite initiale**\n· **Syndrome septique** : fievre (souvent elevee, frissons)\n· **Syndrome douloureux lombaire** : douleur **brutale**, **unilaterale**\n· Association fievre + douleur lombaire = pyelonephrite jusqu'a preuve du contraire", kind: 'a_retenir' },
              { concept: '◆ ECBU systematique', detail_md: "L'**ECBU est obligatoire** devant toute pyelonephrite\n· Identification du germe et antibiogramme indispensables\n· Contrairement a la cystite simple ou la BU suffit", kind: 'a_retenir' },
            ],
          },
        ],
      },
    ],
    points_cles: [
      "La miction normale : volontaire, aisee, indolore, duree ~30s, toutes les 3-4h, volume 200-250 mL, vidange complete",
      "Pollakiurie (< 2h entre mictions) ≠ polyurie (> 3L/24h) : la pollakiurie est un trouble de frequence, la polyurie est un exces de volume",
      "Nycturie = besoin urinaire qui REVEILLE le patient (≠ nocturie = trouble du sommeil)",
      "Dysurie : surtout masculine (prostate), debit max normal ≥ 15 mL/s, prise de conscience < 10 mL/s",
      "Retention vesicale aigue = urgence urologique : impossibilite de vider la vessie malgre l'envie",
      "Globe vesical (> 500 mL) : se voit rarement, se palpe parfois, se percute souvent (matite hypogastrique)",
      "Incontinence : 1/3 femmes, 3-11% hommes. Types : effort, urgenturie, mixte, permanente, enuresie",
      "Torsion du cordon spermatique = URGENCE CHIRURGICALE, diagnostic CLINIQUE, necrose a 6h",
      "Torsion : douleur brutale unilaterale + testicule ascensionne + abolition reflexe cremasterien + PAS de fievre",
      "Varicocele : plus frequent a gauche, accentue a la toux/Valsalva, disparait en decubitus, impact fertilite",
      "Colique nephretique : obstruction aigue → distension cavites → douleur. Calculs = 80% des causes",
      "AINS dans la CN : vasoconstriction arteriole afferente → diminution DFG → moins de tension",
      "Cystite : SFU bas + BU positive (leucocytes/nitrites) SANS fievre ni lombalgie",
      "Pyelonephrite : fievre + douleur lombaire unilaterale + ECBU systematique",
    ],
    chiffres_cles: {
      titre: 'Chiffres cles — Semiologie urologique',
      markdown: "| Parametre | Valeur |\n|---|---|\n| Volume par miction normal | **200-250 mL** |\n| Frequence mictionnelle normale | **toutes les 3-4h** |\n| Duree miction normale | **~30 secondes** |\n| Seuil pollakiurie | **< 2h entre mictions** |\n| Seuil polyurie | **> 3 L/24h** |\n| Debit max normal (debimetrie) | **≥ 15 mL/s** |\n| Seuil conscience dysurie | **< 10 mL/s** |\n| Capacite vesicale anatomique | **350-500 mL** |\n| Capacite vesicale fonctionnelle | **150-250 mL** |\n| Globe vesical | **> 500 mL** |\n| Necrose testiculaire (torsion) | **a partir de 6h** |\n| Recuperation possible (torsion) | **jusqu'a 12h** |\n| Score IPSS | **0-35** |\n| Prevalence IU femmes | **1/3** |\n| Prevalence IU hommes | **3-11%** |\n| Colique nephretique aux urgences | **1-2% des entrees** |\n| Cause CN : calculs | **80%** |\n| MAPA PAS moyenne 24h normale | **< 130 mmHg** |\n| MAPA PAD moyenne 24h normale | **< 80 mmHg** |\n| MAPA PAS diurne normale | **< 135 mmHg** |\n| MAPA PAD diurne normale | **< 85 mmHg** |\n| MAPA PAS nocturne normale | **< 120 mmHg** |\n| MAPA PAD nocturne normale | **< 70 mmHg** |\n| PA consultation normale | **< 140/90 mmHg** |\n| Hypotension orthostatique | **baisse PAS ≥ 20 ou PAD ≥ 10 mmHg** |",
    },
  },
  flashcards: [
    // --- I. Troubles de la miction ---
    { recto: "Quelles sont les 2 phases du cycle vesical ?", verso: "· <b>Phase de remplissage</b> : >99% du temps, repos vesical\n· <b>Phase mictionnelle</b> (reflexe mictionnel) : ponctuelle, contraction vesicale + relaxation forces de retenue", order_index: 1 },
    { recto: "Quelles sont les caracteristiques d'une miction normale ?", verso: "· Vidange <b>complete sans residu</b>\n· <b>Volontaire</b>, aisee, indolore\n· Duree ~<b>30 secondes</b>\n· Toutes les <b>3-4 heures</b>\n· Volume <b>200-250 mL</b>\n· +/- <b>1 lever nocturne</b>", order_index: 2 },
    { recto: "Qu'est-ce que la pollakiurie ?", verso: "Mictions <b>trop frequentes</b> avec un intervalle <b>< 2 heures</b>\n· Les volumes par miction restent normaux\n· Trouble de la phase de remplissage", order_index: 3 },
    { recto: "Quelle est la difference entre pollakiurie et polyurie ?", verso: "· <b>Pollakiurie</b> = mictions trop frequentes, volumes normaux par miction\n· <b>Polyurie</b> = volume urinaire total <b>> 3 L/24h</b>\nLa polyurie est un exces de volume, la pollakiurie un exces de frequence", order_index: 4 },
    { recto: "Qu'est-ce que la nycturie ?", verso: "Envie d'uriner qui <b>REVEILLE</b> le patient la nuit\n· C'est le besoin mictionnel qui interrompt le sommeil", order_index: 5 },
    { recto: "Quelle est la difference entre nycturie et nocturie ?", verso: "· <b>Nycturie</b> = besoin d'uriner qui <b>reveille</b> le patient\n· <b>Nocturie</b> = patient reveille pour <b>d'autres raisons</b> (troubles du sommeil) qui en profite pour uriner", order_index: 6 },
    { recto: "Qu'est-ce que l'urgenturie ?", verso: "Besoin <b>brutal</b>, <b>irresistible</b> et <b>urgent</b> d'uriner\n· Le patient ne peut pas se retenir\n· Risque de fuite si toilettes non accessibles", order_index: 7 },
    { recto: "Quels sont les facteurs declenchants de l'hyperactivite vesicale ?", verso: "· <b>Sensoriels</b> : froid, stress\n· <b>De precaution</b> : uriner avant de sortir\n· <b>Reflexes</b> : syndrome de la <b>cle dans la serrure</b>", order_index: 8 },
    { recto: "Qu'est-ce que la pneumaturie ?", verso: "Emission de <b>gaz</b> dans les urines\n· Evoque une <b>fistule</b> entre appareil digestif et urinaire", order_index: 9 },
    { recto: "Qu'est-ce que la fecalurie ?", verso: "Emission de <b>matieres fecales</b> dans les urines\n· Evoque une <b>communication anormale</b> entre le tube digestif et l'appareil urinaire (fistule)", order_index: 10 },
    { recto: "Qu'est-ce que la dysurie ?", verso: "Difficulte a uriner, <b>surtout masculine</b>\n· Liee a l'augmentation du volume prostatique avec l'age\n· Prostate comprime l'uretre", order_index: 11 },
    { recto: "Quels sont les symptomes de dysurie ?", verso: "· <b>Retard a l'initiation</b> de la miction\n· <b>Jet faible</b>\n· <b>Gouttes retardataires</b>\n· Miction prolongee <b>> 30 secondes</b>\n· Impression de <b>mauvaise vidange</b>", order_index: 12 },
    { recto: "Quel est le debit max normal a la debimetrie ?", verso: "Debit max normal : <b>≥ 15 mL/s</b>\n· Les patients prennent conscience de la dysurie quand le debit max est <b>< 10 mL/s</b>", order_index: 13 },
    { recto: "Qu'est-ce que la retention vesicale aigue ?", verso: "<b>Impossibilite soudaine de vider la vessie</b> malgre une envie pressante\n· = <b>Urgence urologique</b>\n· Necessite sondage ou catheterisme sus-pubien en urgence", order_index: 14 },
    { recto: "Quelle est la capacite vesicale anatomique ?", verso: "<b>350-500 mL</b>", order_index: 15 },
    { recto: "Quelle est la capacite vesicale fonctionnelle ?", verso: "<b>150-250 mL</b>\n· Volume declenchant le besoin d'uriner", order_index: 16 },
    { recto: "A partir de quel volume parle-t-on de globe vesical ?", verso: "<b>> 500 mL</b>, parfois > 1 L\n· Se voit rarement, se palpe occasionnellement, se <b>percute souvent</b> (matite hypogastrique)", order_index: 17 },
    { recto: "Comment se manifeste cliniquement un globe vesical ?", verso: "· Se <b>voit rarement</b> (patient mince)\n· Se <b>palpe occasionnellement</b>\n· Se <b>percute souvent</b> : matite hypogastrique convexe vers le haut\n· A distinguer de l'ascite", order_index: 18 },
    { recto: "Qu'est-ce que l'incontinence par regorgement ?", verso: "· Vessie pleine en permanence avec fuites sur surpression\n· Le patient urine par <b>trop-plein</b>\n· Toujours rechercher un <b>retentissement renal</b>", order_index: 19 },
    { recto: "Quels ATCD urologiques rechercher a l'interrogatoire ?", verso: "· <b>Sondage vesical</b> anterieur\n· <b>Endoscopie</b> urinaire\n· <b>MST</b> (retrecissement uretral)\n· <b>Traumatisme du bassin</b>\n· <b>Chirurgie urologique</b>", order_index: 20 },
    { recto: "Quels elements comporte l'examen physique en urologie ?", verso: "· Inspection des <b>OGE</b>\n· <b>Touchers pelviens</b> (TR/TV)\n· Palpation abdomen et <b>fosses lombaires</b>\n· <b>BU</b> systematique\n· Examen neurologique, gynecologique, proctologique", order_index: 21 },
    { recto: "Qu'est-ce que la debimetrie ?", verso: "Mesure du <b>debit urinaire</b> par un entonnoir avec roue\n· Trace une <b>courbe de debit</b>\n· Obstruction → courbe <b>aplatie</b>\n· Normal → courbe en cloche, pic > 15 mL/s", order_index: 22 },
    { recto: "Qu'est-ce que le score IPSS ?", verso: "Score symptomatique de <b>0 a 35</b> evaluant la severite des troubles mictionnels\n· Inclut une question sur la <b>qualite de vie</b>", order_index: 23 },
    { recto: "Comment realise-t-on un calendrier mictionnel ?", verso: "Rempli par le patient pendant <b>3-4 jours a domicile</b>\n· Note les horaires, volumes et circonstances des mictions\n· Outil de <b>premiere ligne</b>", order_index: 24 },
    { recto: "Qu'est-ce que le bilan urodynamique ?", verso: "Examen de <b>2e ligne</b>\n· Sondes dans la <b>vessie</b>, l'<b>uretre</b> et le <b>rectum</b>\n· Mesure les pressions vesicales et uretrales pendant remplissage et miction", order_index: 25 },
    { recto: "Quels examens complementaires en urologie ?", verso: "· <b>Echographie</b> reno-vesico-prostatique\n· <b>Uretro-cystoscopie</b>\n· Biologie : <b>creatininemie</b>, <b>PSA</b>, <b>ECBU</b>", order_index: 26 },

    // --- II. Incontinence urinaire ---
    { recto: "Quelle est la definition de l'incontinence urinaire selon l'ICS 2002 ?", verso: "<b>Perte involontaire d'urine</b> quelles que soient les circonstances\n· Definition de l'International Continence Society", order_index: 27 },
    { recto: "Quelle phase du cycle mictionnel est touchee dans l'incontinence ?", verso: "La <b>phase de remplissage</b>\n· Continence = 99,8% du temps\n· Vidange = 4-6 fois/jour (0,2%)", order_index: 28 },
    { recto: "Quelles sont les 4 conditions de la continence ?", verso: "· Appareil urinaire <b>bien forme</b>\n· Reservoir vesical <b>stable et compliant</b>\n· Forces de retenue <b>></b> forces d'expulsion\n· <b>Coordination neurologique</b> intacte", order_index: 29 },
    { recto: "Quelle est la prevalence de l'incontinence urinaire ?", verso: "· <b>1/3 des femmes</b>\n· <b>3-11% des hommes</b>\n· Tabou, handicap, cout eleve", order_index: 30 },
    { recto: "Quelles sont les 3 etapes de la demarche diagnostique de l'IU ?", verso: "1. <b>Affirmer</b> la fuite meatique\n2. <b>Evaluer</b> l'importance, le retentissement et les attentes\n3. <b>Preciser le mecanisme</b>", order_index: 31 },
    { recto: "Quels sont les differents types d'incontinence urinaire ?", verso: "· IU d'<b>effort</b> : fuites a l'effort (toux, rire, sport)\n· IU par <b>urgenturie</b> : delai de securite trop court\n· IU <b>mixte</b> : effort + urgenturie\n· IU <b>permanente</b> : rare, plus invalidante\n· <b>Enuresie</b> : fuites durant le sommeil", order_index: 32 },
    { recto: "Quelle est la difference entre IU d'effort et IU par urgenturie ?", verso: "· <b>Effort</b> : fuite a l'effort, pas de besoin prealable, mecanisme <b>sphincterien</b>\n· <b>Urgenturie</b> : besoin brutal precede la fuite, contraction vesicale involontaire, mecanisme <b>vesical</b>", order_index: 33 },
    { recto: "Comment realise-t-on le test d'effort pour l'IU ?", verso: "On demande au patient de <b>tousser</b> (vessie remplie)\n· On observe s'il y a une fuite meatique <b>synchrone de l'effort</b>", order_index: 34 },
    { recto: "Qu'est-ce que le pad test ?", verso: "<b>Pesee des couches</b> sur une duree definie\n· Permet une quantification <b>objective</b> des fuites urinaires", order_index: 35 },
    { recto: "Quels elements evaluent le retentissement de l'IU ?", verso: "· Nombre de <b>couches/jour</b>\n· <b>Calendrier mictionnel</b>\n· <b>Pad test</b>\n· Questions : <b>sortie - sexe - sport</b>\n· Auto-questionnaire <b>qualite de vie</b>", order_index: 36 },

    // --- III. Pathologies OGE ---
    { recto: "Quel est le mecanisme de la torsion du cordon spermatique ?", verso: "<b>Defaut de fixation</b> du testicule → rotation dans la bourse\n· <b>Ischemie aigue</b> + oedeme testiculaire\n· Strangulation des vaisseaux spermatiques", order_index: 37 },
    { recto: "En combien de temps survient la necrose dans la torsion testiculaire ?", verso: "· Necrose a partir de <b>6 heures</b>\n· Recuperation possible jusqu'a <b>12 heures</b>", order_index: 38 },
    { recto: "Quel est le terrain typique de la torsion testiculaire ?", verso: "Les <b>adolescents</b>\n· Augmentation rapide du volume testiculaire a la puberte", order_index: 39 },
    { recto: "Quelle est la clinique de la torsion du cordon spermatique ?", verso: "· Douleurs <b>brutales, violentes, unilaterales</b> de la bourse\n· Irradiation <b>aine/fosse iliaque</b>\n· <b>PAS de signes infectieux</b> : apyrexie, BU negative\n· Nausees/vomissements", order_index: 40 },
    { recto: "Quels sont les signes physiques de la torsion testiculaire ?", verso: "· Testicule <b>hyperalgique</b>, augmente de volume, <b>dur</b>\n· <b>Ascensionne</b> (retracte vers l'orifice inguinal superficiel)\n· <b>Disparition du reflexe cremasterien</b>", order_index: 41 },
    { recto: "Comment fait-on le diagnostic de torsion testiculaire ?", verso: "<b>Diagnostic CLINIQUE</b>\n· Pas d'examen complementaire necessaire\n· <b>URGENCE</b> : exploration scrotale en urgence\n· Ne pas perdre de temps avec l'imagerie", order_index: 42 },
    { recto: "Quelles sont les formes cliniques de torsion ?", verso: "· <b>Torsion negligee</b> : necrose, fievre\n· <b>Sub-torsion</b> : courte, spontanement resolutive\n· <b>Neonatale</b>\n· Sur <b>cryptorchidie</b>\n· <b>Torsion d'hydatide</b> (enfant)", order_index: 43 },
    { recto: "Qu'est-ce qu'un phimosis ?", verso: "<b>Orifice preputial serre</b> empechant le decalottage\n· <b>Physiologique</b> chez le nouveau-ne\n· <b>Acquis</b> chez le sujet age ou diabetique", order_index: 44 },
    { recto: "Qu'est-ce qu'un paraphimosis ?", verso: "Prepuce serre bloque en position <b>decalottee</b> (non recalotte)\n· Apres sonde vesicale ou rapport sexuel\n· <b>Oedeme preputial</b> par strangulation\n· Traitement : <b>reduction manuelle</b> en urgence", order_index: 45 },
    { recto: "Qu'est-ce qu'une hydrocele vaginale ?", verso: "<b>Epanchement liquidien</b> dans la vaginale testiculaire\n· La vaginale produit trop de liquide\n· Visible a la <b>transillumination</b>", order_index: 46 },
    { recto: "Comment diagnostique-t-on une hydrocele ?", verso: "· <b>Echographie scrotale</b>\n· Transillumination positive\n· DD : <b>tumeur testicule</b> (solide), <b>hernie inguino-scrotale</b>", order_index: 47 },
    { recto: "Qu'est-ce que la transillumination et quand est-elle positive ?", verso: "Test a la <b>lumiere</b> traversant la bourse :\n· <b>Positive</b> (translucide) = liquide = <b>hydrocele</b>\n· <b>Negative</b> (opaque) = masse solide ou hernie", order_index: 48 },
    { recto: "Qu'est-ce qu'une varicocele ?", verso: "<b>Dilatation des veines</b> autour de l'artere testiculaire\n· Incompetence des <b>valvules veineuses</b>\n· Plus frequent a <b>gauche</b>", order_index: 49 },
    { recto: "Pourquoi la varicocele est-elle plus frequente a gauche ?", verso: "La veine genitale gauche se jette <b>directement dans la veine renale gauche</b> (a angle droit)\n· A droite, elle se jette dans la VCI (angle plus favorable)", order_index: 50 },
    { recto: "Quelles sont les consequences d'une varicocele ?", verso: "· <b>Douleurs</b> (pesanteur scrotale)\n· Impact sur la <b>fertilite</b> (elevation temperature testiculaire)", order_index: 51 },
    { recto: "Quels sont les signes cliniques de la varicocele ?", verso: "Examen <b>debout puis couche</b> :\n· Tumefaction <b>variqueuse accentuee</b> a la toux/Valsalva\n· <b>Disparait en decubitus</b>\n· Confirmation par <b>echodoppler scrotal</b>", order_index: 52 },
    { recto: "Comment distinguer torsion et orchi-epididymite a l'examen ?", verso: "· <b>Torsion</b> : PAS de fievre, BU negative, reflexe cremasterien <b>aboli</b>\n· <b>Orchi-epididymite</b> : fievre, BU positive, reflexe cremasterien <b>conserve</b>", order_index: 53 },

    // --- IV. Lithiase et colique nephretique ---
    { recto: "Quel est le mecanisme de la colique nephretique ?", verso: "<b>Obstruction aigue</b> de la voie excretrice superieure\n· → <b>Distension des cavites</b> pyelo-calicielles\n· C'est la distension qui provoque la douleur", order_index: 54 },
    { recto: "Quelle est la clinique typique de la colique nephretique ?", verso: "· Douleur <b>lombo-abdominale unilaterale</b> brutale\n· <b>Hematurie microscopique</b>\n· Patient <b>agite</b>\n· Troubles digestifs : nausees, vomissements", order_index: 55 },
    { recto: "Quelle est la cause la plus frequente de colique nephretique ?", verso: "Les <b>calculs</b> urinaires : <b>80%</b> des cas\n· Autres causes intraluminales : caillots, necrose papillaire\n· Causes parietales : JPU, stenoses, tumeurs\n· Causes extrinsseques : ADP, fibrose RP", order_index: 56 },
    { recto: "Quel est le pourcentage de coliques nephretiques aux urgences ?", verso: "<b>1-2%</b> des entrees aux urgences", order_index: 57 },
    { recto: "Quel est le traitement de la colique nephretique ?", verso: "· <b>Antalgiques</b> (palier adapte)\n· <b>AINS</b> en premiere intention", order_index: 58 },
    { recto: "Quel est le mecanisme d'action des AINS dans la colique nephretique ?", verso: "<b>Vasoconstriction de l'arteriole afferente</b>\n· → Diminution du DFG\n· → Moins d'urine produite\n· → Moins de tension dans les cavites\nCe n'est pas seulement un effet anti-inflammatoire", order_index: 59 },
    { recto: "Quels examens complementaires dans la colique nephretique ?", verso: "· <b>BU</b> : hematurie microscopique\n· <b>Echographie</b> renale : dilatation des cavites\n· <b>Scanner sans injection</b> : reference pour visualiser le calcul", order_index: 60 },
    { recto: "Quels sont les 3 types de causes d'obstruction ureterale ?", verso: "· <b>Intraluminale</b> : calculs (80%), caillots, necrose papillaire\n· <b>Parietale</b> : JPU, stenoses, tumeurs\n· <b>Extrinseque</b> : adenopathies, fibrose retroperitoneale", order_index: 61 },
    { recto: "Quelle est la clinique de la cystite aigue ?", verso: "· <b>Hyperactivite vesicale</b> brutale\n· <b>Pollakiurie + imperiosites</b>\n· <b>Brulures mictionnelles</b>\n· +/- hematurie macroscopique\n· <b>PAS de lombalgie, PAS de fievre</b>", order_index: 62 },
    { recto: "Que montre la BU dans la cystite ?", verso: "· <b>Leucocytes</b> positifs (pyurie)\n· <b>Nitrites</b> positifs (bacteries)", order_index: 63 },
    { recto: "Comment distinguer cystite et pyelonephrite ?", verso: "· <b>Cystite</b> : SFU bas, PAS de fievre, PAS de lombalgie\n· <b>Pyelonephrite</b> : fievre + douleur lombaire unilaterale\n· La cystite est une infection basse, la PNA est haute", order_index: 64 },
    { recto: "Quelle est la clinique de la pyelonephrite aigue ?", verso: "· Peut succeder a une <b>cystite</b>\n· <b>Syndrome septique</b> : fievre, frissons\n· Douleur lombaire <b>brutale unilaterale</b>\n· <b>ECBU systematique</b>", order_index: 65 },
    { recto: "Pourquoi l'ECBU est-il obligatoire dans la pyelonephrite ?", verso: "Pour l'<b>identification du germe</b> et l'<b>antibiogramme</b>\n· Contrairement a la cystite simple ou la BU suffit", order_index: 66 },

    // --- Annales : PA, hematurie, proteinurie ---
    { recto: "Quelles sont les valeurs normales de MAPA sur 24h ?", verso: "· PAS moyenne 24h : <b>< 130 mmHg</b>\n· PAD moyenne 24h : <b>< 80 mmHg</b>", order_index: 67 },
    { recto: "Quelles sont les valeurs normales de MAPA diurne ?", verso: "· PAS diurne : <b>< 135 mmHg</b>\n· PAD diurne : <b>< 85 mmHg</b>", order_index: 68 },
    { recto: "Quelles sont les valeurs normales de MAPA nocturne ?", verso: "· PAS nocturne : <b>< 120 mmHg</b>\n· PAD nocturne : <b>< 70 mmHg</b>", order_index: 69 },
    { recto: "Quelles sont les valeurs normales de PA en consultation ?", verso: "· PAS : <b>< 140 mmHg</b>\n· PAD : <b>< 90 mmHg</b>", order_index: 70 },
    { recto: "Quelle est la definition de l'hypotension orthostatique ?", verso: "Baisse de :\n· <b>PAS ≥ 20 mmHg</b>\n  OU\n· <b>PAD ≥ 10 mmHg</b>\nen position debout par rapport au decubitus", order_index: 71 },
    { recto: "Quelles sont les causes d'urines rouges avec BU positive mais sans GR a l'ECBU ?", verso: "Causes de faux positifs de la BU pour l'hematurie :\n· <b>Rhabdomyolyse</b> (myoglobinurie)\n· <b>Hemolyse intravasculaire</b> (hemoglobinurie)\n· <b>Compression musculaire prolongee</b>", order_index: 72 },
    { recto: "La betterave donne-t-elle une BU positive pour l'hematurie ?", verso: "<b>Non</b>\n· La betterave colore les urines en rouge mais la BU reste <b>negative</b>\n· Il ne s'agit ni d'hemoglobine ni de myoglobine", order_index: 73 },
    { recto: "Que detecte specifiquement la BU pour la proteinurie ?", verso: "La BU detecte specifiquement l'<b>albumine</b>\n· Ne detecte PAS : beta-2 microglobuline, chaines legeres Ig, myoglobine, hemoglobine", order_index: 74 },
    { recto: "Quelles sont les causes de faux positif de la BU pour la proteinurie ?", verso: "· <b>Urines alcalines</b>\n· <b>Hematurie macroscopique</b>", order_index: 75 },
    { recto: "Quelle est la difference entre hematurie et urines rouges sans hematies ?", verso: "· <b>Hematurie</b> = presence de GR dans les urines (BU + ET hematies a l'ECBU)\n· <b>Urines rouges sans hematies</b> = BU peut etre positive mais pas de GR a l'ECBU (rhabdomyolyse, hemolyse)", order_index: 76 },
    { recto: "VRAI ou FAUX : une PAS diurne de 130 mmHg en MAPA est normale", verso: "<b>VRAI</b>\n· La limite pour la PAS diurne est <b>< 135 mmHg</b>\n· 130 < 135 donc c'est normal", order_index: 77 },
    { recto: "VRAI ou FAUX : une PAS nocturne de 130 mmHg en MAPA est normale", verso: "<b>FAUX</b>\n· La limite pour la PAS nocturne est <b>< 120 mmHg</b>\n· 130 > 120 donc c'est anormal", order_index: 78 },
    { recto: "VRAI ou FAUX : une PAD de 75 mmHg nocturne en MAPA est normale", verso: "<b>FAUX</b>\n· La limite pour la PAD nocturne est <b>< 70 mmHg</b>\n· 75 > 70 donc c'est anormal", order_index: 79 },
    { recto: "VRAI ou FAUX : une baisse de PAS de 15 mmHg a l'orthostatisme definit l'hypotension orthostatique", verso: "<b>FAUX</b>\n· Il faut une baisse de PAS <b>≥ 20 mmHg</b> (pas 15)\n· Ou une baisse de PAD <b>≥ 10 mmHg</b>", order_index: 80 },
    { recto: "Quels sont les 3 troubles de la phase de remplissage ?", verso: "· <b>Pollakiurie</b> (mictions trop frequentes)\n· <b>Nycturie</b> (reveille pour uriner)\n· <b>Urgenturie</b> (besoin brutal irresistible)", order_index: 81 },
    { recto: "Quel reflexe est aboli dans la torsion testiculaire ?", verso: "Le <b>reflexe cremasterien</b>\n· Normalement, la stimulation de la face interne de la cuisse entraine une ascension du testicule\n· Son abolition est un signe tres evocateur de torsion", order_index: 82 },
    { recto: "Pourquoi ne pas faire d'imagerie devant une torsion testiculaire ?", verso: "Car la torsion est un <b>diagnostic clinique</b> et une <b>urgence chirurgicale</b>\n· Necrose a 6h → chaque minute compte\n· L'imagerie ferait perdre un temps precieux", order_index: 83 },
    { recto: "Quelle est la conduite a tenir devant un paraphimosis ?", verso: "<b>Reduction manuelle en urgence</b>\n· Compression du gland pour reduire l'oedeme\n· Puis recalottage du prepuce\n· Si echec : incision chirurgicale", order_index: 84 },
    { recto: "VRAI ou FAUX : la torsion testiculaire s'accompagne de fievre", verso: "<b>FAUX</b> (dans la forme typique aigue)\n· Apyrexie et BU negative\n· La fievre est un signe d'<b>infection</b> (orchi-epididymite)\n· Exception : torsion negligee (necrose → fievre secondaire)", order_index: 85 },
    { recto: "Quel est le syndrome de la cle dans la serrure ?", verso: "Urgenturie <b>declenchee par un stimulus reflexe</b> en arrivant chez soi (en mettant la cle dans la serrure)\n· Facteur declenchant reflexe de l'hyperactivite vesicale", order_index: 86 },
    { recto: "Qu'est-ce que l'enuresie ?", verso: "Fuites urinaires survenant <b>durant le sommeil</b>\n· Type d'incontinence urinaire\n· Frequente chez l'enfant, pathologique apres 5-6 ans", order_index: 87 },
    { recto: "Quels sont les 3 S pour evaluer le retentissement de l'IU ?", verso: "· <b>Sortie</b> : impact sur les activites sociales\n· <b>Sexe</b> : impact sur la vie sexuelle\n· <b>Sport</b> : impact sur les activites physiques", order_index: 88 },
    { recto: "VRAI ou FAUX : la rhabdomyolyse donne une BU positive pour l'hematurie", verso: "<b>VRAI</b>\n· La <b>myoglobine</b> liberee par les muscles reagit avec la BU\n· Mais l'ECBU ne retrouve <b>pas de GR</b> (fausse hematurie)", order_index: 89 },
    { recto: "VRAI ou FAUX : l'hemolyse intravasculaire donne une BU positive pour l'hematurie sans GR a l'ECBU", verso: "<b>VRAI</b>\n· L'<b>hemoglobine libre</b> liberee par l'hemolyse reagit avec la BU\n· Mais il n'y a pas de GR intacts dans les urines", order_index: 90 },
    { recto: "Que signifie une PAD moyenne de 84 mmHg sur 24h en MAPA ?", verso: "C'est <b>anormal</b> (HTA)\n· La limite de PAD moyenne sur 24h est <b>< 80 mmHg</b>\n· 84 > 80 donc elle est elevee", order_index: 91 },
    { recto: "VRAI ou FAUX : les chaines legeres d'Ig sont detectees par la BU", verso: "<b>FAUX</b>\n· La BU ne detecte que l'<b>albumine</b>\n· Les chaines legeres ne sont pas detectees par la BU standard", order_index: 92 },
    { recto: "VRAI ou FAUX : la rifampicine donne une BU positive pour l'hematurie", verso: "<b>FAUX</b>\n· La rifampicine colore les urines en <b>rouge-orange</b> mais la BU reste <b>negative</b> pour l'hematurie", order_index: 93 },
    { recto: "Quel est le volume de miction a partir duquel on parle de pollakiurie ?", verso: "Ce n'est pas le volume qui definit la pollakiurie mais la <b>frequence</b>\n· Pollakiurie = mictions a intervalle <b>< 2 heures</b>\n· Les volumes sont normaux", order_index: 94 },
    { recto: "Comment classe-t-on les causes d'obstruction ureterale ?", verso: "· <b>Intraluminale</b> : obstacle dans la lumiere (calculs, caillots)\n· <b>Parietale</b> : obstacle dans la paroi (JPU, tumeur urotheliale)\n· <b>Extrinseque</b> : compression externe (ADP, fibrose)", order_index: 95 },
    { recto: "VRAI ou FAUX : une PAD de 68 mmHg nocturne en MAPA est normale", verso: "<b>VRAI</b>\n· La limite pour la PAD nocturne est <b>< 70 mmHg</b>\n· 68 < 70 donc c'est normal", order_index: 96 },
    { recto: "VRAI ou FAUX : une PAS de 135 mmHg en MAPA moyenne 24h est normale", verso: "<b>FAUX</b>\n· La limite de PAS moyenne 24h est <b>< 130 mmHg</b>\n· 135 > 130 donc c'est anormal", order_index: 97 },
    { recto: "VRAI ou FAUX : une augmentation de FC de 30 bpm a l'orthostatisme definit l'hypotension orthostatique", verso: "<b>FAUX</b>\n· L'hypotension orthostatique se definit par une baisse de <b>PAS ≥ 20</b> ou <b>PAD ≥ 10 mmHg</b>\n· La FC n'entre pas dans la definition", order_index: 98 },
    { recto: "Quelle est la difference entre capacite vesicale anatomique et fonctionnelle ?", verso: "· <b>Anatomique</b> : volume maximum que la vessie peut contenir = <b>350-500 mL</b>\n· <b>Fonctionnelle</b> : volume qui declenche le besoin d'uriner = <b>150-250 mL</b>", order_index: 99 },
    { recto: "VRAI ou FAUX : le bilan urodynamique est un examen de premiere intention", verso: "<b>FAUX</b>\n· C'est un examen de <b>2e ligne</b>\n· On commence par l'interrogatoire, le calendrier mictionnel et la debimetrie", order_index: 100 },
  ],
  annales: [
    {
      titre: 'Annale 2022-2023 — PA, proteinurie, hematurie',
      annee: '2022-2023',
      rappel_cours: "**Urines rouges et BU :**\n· La BU detecte l'hemoglobine et la myoglobine (pas specifique des GR)\n· BU hematurie positive SANS GR a l'ECBU = fausse hematurie : rhabdomyolyse (myoglobinurie), hemolyse intravasculaire (hemoglobinurie), compression musculaire prolongee\n· La betterave colore les urines mais la BU reste NEGATIVE\n\n**Valeurs normales de PA (MAPA) :**\n· Moyenne 24h : PAS < 130, PAD < 80\n· Diurne : PAS < 135, PAD < 85\n· Nocturne : PAS < 120, PAD < 70\n· Consultation : < 140/90",
      questions: [
        {
          enonce: "Un patient presente des urines rouges. La BU est positive pour l'hematurie (+++). L'ECBU ne retrouve pas de globules rouges. Parmi les propositions suivantes, lesquelles peuvent expliquer cette situation ?",
          items: [
            { lettre: 'A', enonce: "Consommation de betterave", is_correct: false },
            { lettre: 'B', enonce: "Tumeur de vessie", is_correct: false },
            { lettre: 'C', enonce: "Rhabdomyolyse", is_correct: true },
            { lettre: 'D', enonce: "Hemolyse intravasculaire", is_correct: true },
            { lettre: 'E', enonce: "Compression musculaire prolongee", is_correct: true },
          ],
          correction: "**Reponse : CDE**\n\nLa situation decrite est une BU positive pour l'hematurie SANS globules rouges a l'ECBU. Cela correspond a une fausse hematurie par presence d'hemoglobine libre ou de myoglobine.\n\nA. **FAUX** — La betterave colore les urines en rouge mais la BU reste **negative** (ce n'est ni de l'hemoglobine ni de la myoglobine).\nB. **FAUX** — Une tumeur de vessie entraine une hematurie vraie avec des **GR retrouves a l'ECBU**.\nC. **VRAI** — La rhabdomyolyse libere de la **myoglobine** qui reagit positivement avec la BU mais il n'y a pas de GR.\nD. **VRAI** — L'hemolyse intravasculaire libere de l'**hemoglobine libre** dans le sang puis les urines (hemoglobinurie).\nE. **VRAI** — La compression musculaire prolongee provoque une **rhabdomyolyse** avec liberation de myoglobine.",
        },
        {
          enonce: "Un homme de 20 ans realise une MAPA. Parmi les valeurs suivantes, lesquelles sont compatibles avec une PA normale ?",
          items: [
            { lettre: 'A', enonce: "PAS moyenne sur 24h : 135 mmHg", is_correct: false },
            { lettre: 'B', enonce: "PAD nocturne moyenne : 68 mmHg", is_correct: true },
            { lettre: 'C', enonce: "PAS diurne moyenne : 130 mmHg", is_correct: true },
            { lettre: 'D', enonce: "PAD moyenne sur 24h : 75 mmHg", is_correct: true },
            { lettre: 'E', enonce: "PAD en consultation : 85 mmHg", is_correct: true },
          ],
          correction: "**Reponse : BCDE**\n\nA. **FAUX** — PAS moyenne 24h normale < **130 mmHg**. 135 est superieur a 130.\nB. **VRAI** — PAD nocturne normale < **70 mmHg**. 68 < 70.\nC. **VRAI** — PAS diurne normale < **135 mmHg**. 130 < 135.\nD. **VRAI** — PAD moyenne 24h normale < **80 mmHg**. 75 < 80.\nE. **VRAI** — PAD en consultation normale < **90 mmHg**. 85 < 90.",
        },
      ],
    },
    {
      titre: 'Annale 2021-2022 — PA, proteinurie, hematurie',
      annee: '2021-2022',
      rappel_cours: "**Urines rouges sans hematies excessives :**\n· Les causes de fausse hematurie (BU + sans GR) incluent : rhabdomyolyse, hemolyse intravasculaire\n· La betterave colore les urines mais BU negative\n· L'infection urinaire peut donner une hematurie VRAIE (avec GR excessifs)\n· Les chaines legeres d'Ig ne sont pas detectees par la BU\n\n**MAPA normale :**\n· PAS nocturne < 120 mmHg\n· PAS diurne < 135 mmHg\n· PAS moyenne 24h < 130 mmHg\n· PAD moyenne 24h < 80 mmHg\n· PAD nocturne < 70 mmHg",
      questions: [
        {
          enonce: "Un patient presente des urines rouges. L'analyse ne retrouve pas d'hematies en nombre excessif. Parmi les propositions suivantes, lesquelles peuvent expliquer cette situation ?",
          items: [
            { lettre: 'A', enonce: "Secretion excessive de chaines legeres d'immunoglobuline", is_correct: false },
            { lettre: 'B', enonce: "Rhabdomyolyse", is_correct: true },
            { lettre: 'C', enonce: "Infection urinaire", is_correct: false },
            { lettre: 'D', enonce: "Hemolyse intravasculaire", is_correct: true },
            { lettre: 'E', enonce: "Consommation de betterave", is_correct: true },
          ],
          correction: "**Reponse : BDE**\n\nA. **FAUX** — La secretion excessive de chaines legeres d'Ig peut s'accompagner d'une hematurie macroscopique vraie (avec hematies). De plus, les chaines legeres ne colorent pas les urines en rouge.\nB. **VRAI** — La rhabdomyolyse libere de la **myoglobine** qui colore les urines en rouge sans hematies excessives.\nC. **FAUX** — L'infection urinaire peut s'accompagner d'une hematurie vraie avec hematies en nombre excessif.\nD. **VRAI** — L'hemolyse intravasculaire libere de l'**hemoglobine libre** qui colore les urines sans hematies.\nE. **VRAI** — La betterave colore les urines en rouge sans hematurie (pigments alimentaires).",
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
          correction: "**Reponse : BC**\n\nA. **FAUX** — PAS nocturne normale < **120 mmHg**. 130 > 120, c'est anormal.\nB. **VRAI** — PAS diurne normale < **135 mmHg**. 130 < 135.\nC. **VRAI** — PAS moyenne 24h normale < **130 mmHg**. 125 < 130.\nD. **FAUX** — PAD moyenne 24h normale < **80 mmHg**. 84 > 80, c'est anormal.\nE. **FAUX** — PAD nocturne normale < **70 mmHg**. 75 > 70, c'est anormal.",
        },
      ],
    },
    {
      titre: 'Annale 2020-2021 — PA, proteinurie, hematurie',
      annee: '2020-2021',
      rappel_cours: "**BU et detection des proteines :**\n· La BU detecte specifiquement l'**albumine**\n· Elle ne detecte PAS : beta-2 microglobuline, chaines legeres d'Ig, myoglobine, hemoglobine\n\n**Hypotension orthostatique :**\n· Definition : baisse de PAS ≥ 20 mmHg OU baisse de PAD ≥ 10 mmHg en position debout\n· La valeur absolue de PA en orthostatisme ne definit pas l'hypotension orthostatique\n· C'est la DIFFERENCE entre decubitus et orthostatisme qui compte",
      questions: [
        {
          enonce: "Parmi les proteines suivantes, laquelle est detectee par la bandelette urinaire ?",
          items: [
            { lettre: 'A', enonce: "Beta-2 microglobuline", is_correct: false },
            { lettre: 'B', enonce: "Chaines legeres d'immunoglobuline", is_correct: false },
            { lettre: 'C', enonce: "Myoglobine", is_correct: false },
            { lettre: 'D', enonce: "Albumine", is_correct: true },
            { lettre: 'E', enonce: "Hemoglobine", is_correct: false },
          ],
          correction: "**Reponse : D**\n\nLa bandelette urinaire utilise un reactif colore qui ne reagit qu'avec l'**albumine**.\n\nA. **FAUX** — La beta-2 microglobuline est une petite proteine tubulaire non detectee par la BU.\nB. **FAUX** — Les chaines legeres d'Ig ne sont pas detectees par la BU (necessite une electrophorese des proteines urinaires).\nC. **FAUX** — La myoglobine n'est pas detectee par le reactif aux proteines de la BU (elle est detectee par le reactif a l'hemoglobine).\nD. **VRAI** — L'albumine est la seule proteine detectee par la BU.\nE. **FAUX** — L'hemoglobine est detectee par un reactif different (reactif hematurie), pas le reactif proteinurie.",
        },
        {
          enonce: "Parmi les propositions suivantes, laquelle correspond a la definition de l'hypotension orthostatique ?",
          items: [
            { lettre: 'A', enonce: "PAS de 100 mmHg en orthostatisme", is_correct: false },
            { lettre: 'B', enonce: "PAD de 50 mmHg en orthostatisme", is_correct: false },
            { lettre: 'C', enonce: "Difference de PAS entre decubitus et orthostatisme de 15 mmHg", is_correct: false },
            { lettre: 'D', enonce: "Difference de PAD entre decubitus et orthostatisme de 12 mmHg", is_correct: true },
            { lettre: 'E', enonce: "Augmentation de la frequence cardiaque de 30 bpm a l'orthostatisme", is_correct: false },
          ],
          correction: "**Reponse : D**\n\nL'hypotension orthostatique se definit par une **baisse de PAS ≥ 20 mmHg** OU une **baisse de PAD ≥ 10 mmHg** lors du passage en position debout.\n\nA. **FAUX** — La valeur absolue de PAS en orthostatisme ne definit pas l'hypotension orthostatique. C'est la difference avec le decubitus qui compte.\nB. **FAUX** — Meme raisonnement : la valeur absolue de PAD ne suffit pas.\nC. **FAUX** — La baisse de PAS doit etre ≥ **20 mmHg** (pas 15) pour definir l'hypotension orthostatique.\nD. **VRAI** — Une baisse de PAD de 12 mmHg (≥ 10 mmHg) correspond bien a la definition.\nE. **FAUX** — L'augmentation de FC n'entre pas dans la definition de l'hypotension orthostatique (c'est un mecanisme compensateur, pas un critere diagnostique).",
        },
      ],
    },
    {
      titre: 'Annale 2019 Session 1 — PA, proteinurie, hematurie',
      annee: '2019',
      rappel_cours: "**Valeurs normales MAPA :**\n· Diurne : PAS < 135 et PAD < 85\n· Nocturne : PAS < 120 et PAD < 70\n· Moyenne 24h : PAS < 130 et PAD < 80\n\n**Hematurie BU positive sans hematurie cytologique :**\n· Rhabdomyolyse (myoglobinurie)\n· Hemolyse intravasculaire (hemoglobinurie)\n· La betterave et la rifampicine colorent les urines mais BU negative",
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
          correction: "**Reponse : D**\n\nA. **FAUX** — La PAS diurne normale doit etre < **135 mmHg**. La fourchette 120-140 depasse ce seuil.\nB. **FAUX** — La PAD diurne normale doit etre < **85 mmHg**. La fourchette 80-89 depasse ce seuil.\nC. **FAUX** — La PAS nocturne normale doit etre < **120 mmHg**. La fourchette 110-129 inclut des valeurs > 120.\nD. **VRAI** — La PAD nocturne normale est < **70 mmHg**. La fourchette 60-69 est bien dans les valeurs normales.\nE. **FAUX** — La PAS moyenne 24h normale doit etre < **130 mmHg**. La fourchette 120-140 depasse ce seuil.",
        },
        {
          enonce: "Un patient presente une hematurie a la BU mais pas d'hematurie a l'examen cytologique (ECBU). Quelles sont les causes possibles ?",
          items: [
            { lettre: 'A', enonce: "Consommation de betterave", is_correct: false },
            { lettre: 'B', enonce: "Prise de rifampicine", is_correct: false },
            { lettre: 'C', enonce: "Rhabdomyolyse", is_correct: true },
            { lettre: 'D', enonce: "Hemolyse intravasculaire", is_correct: true },
            { lettre: 'E', enonce: "Hepatite", is_correct: false },
          ],
          correction: "**Reponse : CD**\n\nA. **FAUX** — La betterave colore les urines en rouge mais la BU reste **negative** pour l'hematurie.\nB. **FAUX** — La rifampicine colore les urines en rouge-orange mais la BU reste **negative** pour l'hematurie.\nC. **VRAI** — La rhabdomyolyse libere de la **myoglobine** qui reagit positivement avec la BU sans presence de GR.\nD. **VRAI** — L'hemolyse intravasculaire libere de l'**hemoglobine libre** detectee par la BU sans GR.\nE. **FAUX** — L'hepatite ne donne pas de BU positive pour l'hematurie. La bilirubine colore les urines mais n'est pas detectee par le reactif hematurie.",
        },
      ],
    },
    {
      titre: 'Annale 2019 Session 2 — PA, proteinurie, hematurie',
      annee: '2019 Session 2',
      rappel_cours: "**Hypotension orthostatique :**\n· Definition : baisse de PAS ≥ 20 mmHg OU baisse de PAD ≥ 10 mmHg en position debout\n· Ce n'est PAS defini par une valeur absolue de PA debout\n· La FC n'entre pas dans la definition\n\n**Faux positifs BU proteinurie :**\n· Urines alcalines (pH eleve modifie le reactif)\n· Hematurie macroscopique (interference colorimetrique)\n· Les chaines legeres d'Ig, la rhabdomyolyse et l'hemolyse ne donnent PAS de faux positif sur la bandelette proteinurie",
      questions: [
        {
          enonce: "Parmi les propositions suivantes, laquelle correspond a la definition de l'hypotension orthostatique ?",
          items: [
            { lettre: 'A', enonce: "PA < 130/80 mmHg en position debout", is_correct: false },
            { lettre: 'B', enonce: "PAS < 100 mmHg en position debout", is_correct: false },
            { lettre: 'C', enonce: "Baisse de PAS ≥ 15 mmHg au passage en position debout", is_correct: false },
            { lettre: 'D', enonce: "Baisse de PAS ≥ 30 mmHg au passage en position debout", is_correct: false },
            { lettre: 'E', enonce: "Baisse de PAD ≥ 10 mmHg au passage en position debout", is_correct: true },
          ],
          correction: "**Reponse : E**\n\nL'hypotension orthostatique se definit par une baisse de **PAS ≥ 20 mmHg** OU une baisse de **PAD ≥ 10 mmHg**.\n\nA. **FAUX** — L'hypotension orthostatique n'est pas definie par une valeur absolue de PA.\nB. **FAUX** — Meme raisonnement, la valeur absolue de PAS ne suffit pas.\nC. **FAUX** — Le seuil pour la PAS est ≥ **20 mmHg** (pas 15).\nD. **FAUX** — Le seuil pour la PAS est ≥ **20 mmHg** (pas 30). 30 serait certes anormal, mais ne correspond pas a la definition standard.\nE. **VRAI** — Une baisse de PAD ≥ **10 mmHg** correspond bien a la definition de l'hypotension orthostatique.",
        },
        {
          enonce: "Parmi les propositions suivantes, lesquelles sont des causes de faux positif de la BU pour la proteinurie ?",
          items: [
            { lettre: 'A', enonce: "Chaines legeres d'immunoglobuline", is_correct: false },
            { lettre: 'B', enonce: "Urines alcalines", is_correct: true },
            { lettre: 'C', enonce: "Hematurie macroscopique", is_correct: true },
            { lettre: 'D', enonce: "Rhabdomyolyse", is_correct: false },
            { lettre: 'E', enonce: "Hemolyse", is_correct: false },
          ],
          correction: "**Reponse : BC**\n\nA. **FAUX** — Les chaines legeres d'Ig ne sont pas detectees par la BU (la BU ne detecte que l'albumine). Ce n'est donc pas un faux positif mais un **faux negatif** (proteinurie presente mais non detectee).\nB. **VRAI** — Les urines alcalines (pH eleve) modifient le reactif colorimetrique de la BU et peuvent donner un faux positif pour la proteinurie.\nC. **VRAI** — L'hematurie macroscopique interfere avec la lecture colorimetrique de la BU pour la proteinurie.\nD. **FAUX** — La rhabdomyolyse libere de la myoglobine qui interfere avec le reactif hematurie (pas proteinurie).\nE. **FAUX** — L'hemolyse libere de l'hemoglobine qui interfere avec le reactif hematurie (pas proteinurie).",
        },
      ],
    },
  ],
};

export default content;

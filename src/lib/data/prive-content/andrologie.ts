import type { PriveCourseContent } from '../prive-courses';

const content: PriveCourseContent = {
  fiche: {
    parties: [
      {
        numero: 'I',
        titre: 'Introduction',
        sous_parties: [
          {
            titre: 'La sexualité',
            rows: [
              { concept: '◆ Sexualité reproductive vs récréative', detail_md: "On distingue la **sexualité reproductive** (érection, pénétration, éjaculation intravaginale) de la sexualité récréative\nLa fonction sexuelle est la **seule fonction non vitale** (vitale pour l'espèce, pas pour l'individu)\nLe **cortex cérébral** a un double rôle : **inhibiteur** (nous différencie des animaux) et **libérateur** (plaisir, sexualité récréative)", kind: 'a_retenir' },
              { concept: 'Dysfonction sexuelle et pathologies', detail_md: "Les dysfonctions sexuelles peuvent révéler des **pathologies sous-jacentes**\n· Chez l'homme : la fonction érectile est représentative de la **fonction vasculaire** → troubles de l'érection = risque de pathologies cardiovasculaires (IDM, AVC)\n· Chez la femme : dyspareunies profondes → suspecter une **endométriose** (risque d'infertilité)", kind: 'a_retenir' },
              { concept: '◆ Fertilité ≠ Sexualité', detail_md: "Fertilité et sexualité sont **liées mais séparées**\nUn homme peut avoir une bonne sexualité mais être **infertile** (manque de spermatozoïdes)\nLa sexualité est une condition sine qua non pour la reproduction, mais les dysfonctions sexuelles ne sont pas une cause majeure d'infertilité", kind: 'a_retenir' },
              { concept: 'Paramètres de fertilité', detail_md: "· Volume du sperme ≥ **1,5 mL** (< 1,5 mL = hypospermie ; absence = aspermie)\n· **5%** du liquide = spermatozoïdes\n· Concentration ≥ **15 millions/mL** (< 15M = oligozoospermie ; absence = azoospermie)", kind: 'normal' },
            ],
          },
          {
            titre: 'Réponse sexuelle masculine',
            rows: [
              { concept: '◆ Phases de la réponse sexuelle', detail_md: "1. **Stimulation**\n2. **Tumescence** (durcissement)\n3. **Érection** (phase de plateau, doit durer pour la pénétration)\n4. **Pénétration** (ne peut pas durer éternellement → engagement vasculaire important)\n5. **Orgasme** (= éjaculation la plupart du temps)\n6. **Détumescence** = phase réfractaire", kind: 'a_retenir' },
            ],
          },
          {
            titre: 'Dysfonctions sexuelles masculines',
            rows: [
              { concept: '◆ Principales dysfonctions', detail_md: "· **Troubles du désir et de l'excitabilité** (neuroleptiques, psychotropes)\n· **Dysfonction érectile** : impossibilité d'obtenir ou maintenir une érection suffisante\n· **Troubles de l'éjaculation** : éjaculateur précoce (EP) ou éjaculateur retardé (ER)\n· **Troubles de l'orgasme**", kind: 'a_retenir' },
              { concept: '⚠ Terminologie', detail_md: "Le terme **\"impuissance\"** est à bannir : il n'a pas de sens médical et est irrespectueux\nOn utilise le terme de **dysfonction érectile**\nLa dysfonction sexuelle est presque jamais une affaire individuelle, c'est souvent une **affaire de couple**", kind: 'piege' },
            ],
          },
        ],
      },
      {
        numero: 'II',
        titre: 'Érection',
        sous_parties: [
          {
            titre: 'Types d\'érection',
            rows: [
              { concept: '◆ 5 types d\'érections', detail_md: "1. **Érection psychogène** : stimulation visuelle, « dans la tête »\n2. **Érection réflexe** : stimulation par le toucher\n3. **Érection coïtale** : pendant la pénétration (composante physique + psychique)\n4. **Érection nocturne/diurne/matinale** : durant le sommeil paradoxal, **androgéno-dépendante** (testostérone), bon signe de santé\n5. **Érection du pendu** : strangulation → reflux sanguin vers le bas", kind: 'a_retenir' },
              { concept: '◆ Priapisme', detail_md: "**Priapisme** = sang séquestré dans le pénis pendant plusieurs heures\n· Érections involontaires, **douloureuses** et **pathologiques**\n· **Urgence médico-chirurgicale** : le sang stagne et nécrose (sang noir à l'aspiration)\n· La **drépanocytose** prédispose au priapisme (Hb cristallisée → blocage des GR dans les artérioles)", kind: 'a_retenir' },
              { concept: '⚠ Piège priapisme', detail_md: "Le priapisme n'est **PAS un phénomène physiologique**, c'est **pathologique**\nLe risque d'altération irréversible concerne les **corps caverneux**, PAS le corps spongieux (le corps spongieux n'intervient pas dans l'érection)", kind: 'piege' },
            ],
          },
        ],
      },
      {
        numero: 'III',
        titre: 'Morphologie',
        sous_parties: [
          {
            titre: 'Anatomie du pénis en coupe axiale',
            rows: [
              { concept: '◆ Éléments anatomiques', detail_md: "· **2 corps caverneux** : principalement engagés lors de l'érection\n· **1 corps spongieux**\n· **2 artères caverneuses** au centre des corps caverneux\n· **Veine dorsale**", kind: 'a_retenir' },
              { concept: 'Échographie mode B', detail_md: "Permet d'étudier les structures tissulaires du pénis\nOn devine les corps caverneux, le corps spongieux et les artères caverneuses (points lumineux)\nPermet de détecter la **maladie de La Peyronie** (plaque blanchâtre de fibrose avec cône d'ombre)", kind: 'normal' },
            ],
          },
        ],
      },
      {
        numero: 'IV',
        titre: 'Physiologie de l\'érection',
        sous_parties: [
          {
            titre: 'Mécanisme vasculaire',
            rows: [
              { concept: '◆ Déroulement de l\'érection', detail_md: "1. **Flaccidité** (sexe inhibé)\n2. **Érection** (débute par la tumescence)\n3. **Rigidité**\n4. **Détumescence**", kind: 'a_retenir' },
              { concept: '◆ Mécanisme vasculaire', detail_md: "L'artère caverneuse envoie ses **artères hélicines** vers les **lacs caverneux** (espaces sinusoïdaux)\n→ Afflux de sang remplissant les lacs caverneux → gonflement → érection\n→ En même temps, le **retour veineux se bloque** pour que le sang stagne", kind: 'a_retenir' },
              { concept: '◆ Rôle des CML et cellules endothéliales', detail_md: "Les principaux protagonistes sont les **cellules musculaires lisses (CML)** et les **cellules endothéliales**\n· **Relaxation des CML** = absolument nécessaire pour que le sang s'engouffre (comme une éponge)\n· **Flaccidité** : système **orthosympathique** → contraction CML → débit faible\n· **Tumescence** : système **parasympathique** → relaxation CML → vasodilatation", kind: 'a_retenir' },
              { concept: 'Détumescence', detail_md: "Le système **orthosympathique** provoque la détumescence en **contractant les CML**\nTrès important pour que le sang retourne dans la circulation\nLes muscles **ischio-caverneux et bulbo-caverneux** se contractent et ajoutent de la pression sur la verge", kind: 'normal' },
            ],
          },
          {
            titre: 'Contrôle nerveux',
            rows: [
              { concept: '◆ Innervation', detail_md: "· **Nerf dorsal du pénis** = nerf du plaisir → stimule le centre parasympathique\n· **Nerf pelvien caverneux** → érection\n· Contraction des muscles **bulbo-spongieux et ischio-caverneux**\n· Système **parasympathique = pro-érectile**", kind: 'a_retenir' },
              { concept: 'Échographie Triplex', detail_md: "Mode B + mode couleur + mode vitesse\nUne bonne érection montre : vitesse **systolique augmentée** et vitesse **diastolique diminuée**\nL'augmentation de la vitesse du sang est le témoin d'une bonne érection", kind: 'normal' },
              { concept: '◆ Érection réflexe vs psychogène', detail_md: "· **Érection réflexe** : boucle **sacrée** (médullaire)\n· **Érection psychogène** : boucle **supra-spinale** (cérébrale)", kind: 'a_retenir' },
            ],
          },
        ],
      },
      {
        numero: 'V',
        titre: 'Troubles de l\'érection',
        sous_parties: [
          {
            titre: 'Maladie de La Peyronie',
            rows: [
              { concept: 'Maladie de La Peyronie', detail_md: "**Fibrose du corps caverneux** entraînant une **courbure** au moment de l'érection", kind: 'normal' },
            ],
          },
          {
            titre: 'Mécanismes moléculaires de l\'érection',
            rows: [
              { concept: '◆ Voie NO/GMPc', detail_md: "La **cellule endothéliale** libère du **monoxyde d'azote (NO)**\n→ Stimule la **guanylate cyclase** → libère du **GMPc**\n→ Stimule des **protéines kinases GMPc-dépendantes**\n→ **Relaxation de la CML** = érection", kind: 'a_retenir' },
              { concept: 'Voie AMPc (voie de secours)', detail_md: "Une **seconde voie de signalisation** impliquant l'**AMPc** existe en cas de dysfonctionnement de la voie GMPc", kind: 'normal' },
              { concept: '◆ Régulation par la PDE5', detail_md: "La **PDE5** dégrade le GMPc et arrête la voie de signalisation\nLes **inhibiteurs de la PDE5** (Viagra, etc.) maintiennent le GMPc → maintien de l'érection", kind: 'a_retenir' },
              { concept: '⚠ Viagra : facilitateur, pas inducteur', detail_md: "Le Viagra est un **facilitateur** de l'érection, **PAS un inducteur**\nIl aide à maintenir l'érection mais ne la déclenche pas seul\nContrairement aux **prostaglandines** qui sont des **inducteurs** d'érection", kind: 'piege' },
            ],
          },
          {
            titre: 'Lien dysfonction érectile et pathologies cardiovasculaires',
            rows: [
              { concept: '◆ Dysfonction érectile = marqueur cardiovasculaire', detail_md: "L'érection est un indicateur de **bonne santé endothéliale**\nUn trouble de l'érection est un indicateur de **dysfonction endothéliale** potentielle\nFacteurs de risque de stress oxydatif → dysfonction endothéliale → pathologies CV", kind: 'a_retenir' },
              { concept: '◆ Hypothèse du diamètre artériel', detail_md: "Les **artères caverneuses** sont de **petit calibre** → toute dysfonction se manifeste rapidement\nPour les artères de **gros calibre** (coronaires, cérébrales), les manifestations sont plus tardives\nAinsi : dysfonction érectile → **signal d'alarme** pour pathologies CV futures (IDM, AVC)", kind: 'a_retenir' },
            ],
          },
        ],
      },
      {
        numero: 'VI',
        titre: 'Éjaculation',
        sous_parties: [
          {
            titre: 'Anatomie et urètre',
            rows: [
              { concept: 'Différence urètre H/F', detail_md: "· Homme : urètre = **20 cm**\n· Femme : urètre = **4 cm**\n→ Prédisposition des femmes aux **cystites** (bactérie se loge plus facilement)", kind: 'normal' },
              { concept: 'Anatomie prostatique', detail_md: "Vue postérieure : **prostate**, **vésicules séminales**, **ampoule du conduit déférent**, **conduit déférent**\nLe **colliculus séminal** contient l'abouchement des canaux éjaculateurs\nAu-dessus : **utricule prostatique** (des kystes peuvent bloquer les canaux éjaculateurs → hypospermie)", kind: 'normal' },
              { concept: '◆ Les 2 sphincters prostatiques', detail_md: "· **Sphincter lisse** : contrôle autonome\n· **Sphincter strié** : contrôle volontaire (miction)", kind: 'a_retenir' },
            ],
          },
          {
            titre: 'Phases de l\'éjaculation',
            rows: [
              { concept: 'Fabrication du sperme', detail_md: "L'homme fabrique des **spermatozoïdes en permanence** mais le **sperme** n'est fabriqué qu'au **moment de l'éjaculation** (à la demande)", kind: 'normal' },
              { concept: '◆ Phase d\'expulsion', detail_md: "L'**urètre prostatique** = chambre de pression\nLe **sphincter lisse** bloque la partie supérieure de l'urètre prostatique (au-dessus du canal éjaculateur)\n→ Empêche le sperme de remonter vers la vessie\n→ Éjaculation **antégrade** (direction normale d'expulsion)", kind: 'a_retenir' },
              { concept: '◆ Éjaculation rétrograde', detail_md: "Toute dysfonction du sphincter lisse (chirurgie, neuropathies, diabète) → sperme remonte vers la vessie\nSuspicion à l'interrogatoire :\n· **Aspermie + sensation d'éjaculation normale** → éjaculation rétrograde\n· **Aspermie sans sensation d'éjaculation** → anéjaculation\nConfirmation : **recherche de spermatozoïdes dans les urines** post-éjaculatoires", kind: 'a_retenir' },
              { concept: '⚠ Piège éjaculation rétrograde vs anéjaculation', detail_md: "Ne pas confondre :\n· **Éjaculation rétrograde** : la sensation d'éjaculation est **présente** mais le sperme va dans la vessie\n· **Anéjaculation** : **aucune sensation** d'éjaculation, l'éjaculation n'a pas eu lieu", kind: 'piege' },
            ],
          },
          {
            titre: 'Biochimie du sperme',
            rows: [
              { concept: '◆ Composition du sperme', detail_md: "· **Vésicules séminales** : **65%** du volume (fraction la plus importante)\n· **Prostate** : ~30%\n· **Épididyme** : **5%** seulement\n· Le **pH du sperme est alcalin** (protège les spermatozoïdes)", kind: 'a_retenir' },
            ],
          },
        ],
      },
    ],
    points_cles: [
      "La dysfonction érectile est un marqueur de pathologie cardiovasculaire : les artères caverneuses (petit calibre) sont les premières touchées",
      "Fertilité ≠ Sexualité : un homme peut avoir une bonne sexualité mais être infertile",
      "Le priapisme est une urgence médico-chirurgicale, fréquent chez les drépanocytaires",
      "L'érection repose sur la relaxation des CML médiée par la voie NO → GMPc, régulée par la PDE5",
      "Le Viagra (inhibiteur PDE5) est un facilitateur de l'érection, PAS un inducteur",
      "Les prostaglandines sont des inducteurs d'érection",
      "Le système parasympathique est pro-érectile, l'orthosympathique provoque la détumescence",
      "L'érection réflexe = boucle sacrée ; l'érection psychogène = boucle supra-spinale",
      "Le sphincter lisse empêche l'éjaculation rétrograde en bloquant la partie supérieure de l'urètre prostatique",
      "Le sperme est composé à 65% de sécrétions des vésicules séminales, pH alcalin",
    ],
    chiffres_cles: {
      titre: 'Chiffres clés — Andrologie',
      markdown: "| Paramètre | Valeur |\n|---|---|\n| Volume sperme normal | **≥ 1,5 mL** |\n| Concentration spermatozoïdes normale | **≥ 15 millions/mL** |\n| Fraction spermatozoïdes dans le sperme | **5%** |\n| Longueur urètre masculin | **20 cm** |\n| Longueur urètre féminin | **4 cm** |\n| Fraction vésicules séminales | **65%** du volume séminal |\n| Fraction épididymaire | **5%** du volume séminal |\n| pH du sperme | **Alcalin (7,2-8)** |",
    },
  },
  flashcards: [
    { recto: "Quelle est la seule fonction du corps humain qui n'est pas vitale ?", verso: "La **fonction sexuelle**\nElle est vitale pour l'espèce humaine mais pas pour l'individu", order_index: 1 },
    { recto: "Quel est le double rôle du cortex cérébral sur la sexualité ?", verso: "· Rôle **inhibiteur** (nous différencie des animaux)\n· Rôle **libérateur** (plaisir, sexualité récréative)", order_index: 2 },
    { recto: "Pourquoi la dysfonction érectile est-elle un marqueur cardiovasculaire ?", verso: "La fonction érectile est représentative de la **fonction vasculaire**\nUn homme avec des troubles de l'érection est à risque de faire un **IDM, AVC ou accident vasculaire** dans les années suivantes", order_index: 3 },
    { recto: "Chez la femme, que peuvent cacher des dyspareunies profondes ?", verso: "Une **endométriose**, qui peut causer de l'**infertilité** dans les années à venir", order_index: 4 },
    { recto: "VRAI ou FAUX : fertilité et sexualité sont la même chose", verso: "<b>FAUX</b>\nElles sont liées mais séparées. Un homme peut éjaculer et avoir une bonne sexualité mais être **infertile** (manque de spermatozoïdes)", order_index: 5 },
    { recto: "Quel est le volume normal du sperme ?", verso: "**≥ 1,5 mL**\n· < 1,5 mL = <b>hypospermie</b>\n· Absence = <b>aspermie</b>", order_index: 6 },
    { recto: "Quelle est la concentration normale de spermatozoïdes ?", verso: "**≥ 15 millions/mL**\n· < 15 millions = <b>oligozoospermie</b>\n· Absence = <b>azoospermie</b>", order_index: 7 },
    { recto: "Quel pourcentage du sperme est constitué de spermatozoïdes ?", verso: "**5%** seulement", order_index: 8 },
    { recto: "Citer les 6 phases de la réponse sexuelle masculine", verso: "1. **Stimulation**\n2. **Tumescence** (durcissement)\n3. **Érection** (phase de plateau)\n4. **Pénétration**\n5. **Orgasme** (≈ éjaculation)\n6. **Détumescence** (phase réfractaire)", order_index: 9 },
    { recto: "Quelles sont les principales dysfonctions sexuelles masculines ?", verso: "· Troubles du **désir et de l'excitabilité**\n· **Dysfonction érectile**\n· Troubles de l'**éjaculation** (précoce, retardée, rétrograde)\n· Troubles de l'**orgasme**", order_index: 10 },
    { recto: "Pourquoi le terme « impuissance » est-il à bannir ?", verso: "Car il n'a **pas de sens médical** et est **irrespectueux** envers les patients\nOn utilise le terme de **dysfonction érectile**", order_index: 11 },
    { recto: "Quels sont les 5 types d'érection ?", verso: "1. **Psychogène** (stimulation visuelle)\n2. **Réflexe** (toucher)\n3. **Coïtale** (pénétration)\n4. **Nocturne/matinale** (sommeil paradoxal, androgéno-dépendante)\n5. **Du pendu** (reflux sanguin)", order_index: 12 },
    { recto: "Qu'est-ce que le priapisme ?", verso: "Sang **séquestré dans le pénis** pendant plusieurs heures\n· Érections involontaires, **douloureuses**, **pathologiques**\n· **Urgence médico-chirurgicale**", order_index: 13 },
    { recto: "Pourquoi la drépanocytose prédispose-t-elle au priapisme ?", verso: "L'hémoglobine cristallisée **bloque la fluidité** et la flexibilité des GR\n→ Les GR n'arrivent pas à passer dans les **artérioles**\n→ Sang séquestré dans les corps caverneux", order_index: 14 },
    { recto: "Le priapisme altère-t-il le corps spongieux ou les corps caverneux ?", verso: "Les **corps caverneux** (pas le corps spongieux)\nLe corps spongieux n'a pas de rigidité et n'intervient **pas** dans l'érection", order_index: 15 },
    { recto: "Quels sont les éléments anatomiques visibles sur une coupe axiale du pénis ?", verso: "· **2 corps caverneux** (engagés dans l'érection)\n· **1 corps spongieux**\n· **2 artères caverneuses** (au centre des corps caverneux)\n· **Veine dorsale**", order_index: 16 },
    { recto: "Quelles sont les 4 phases du déroulement de l'érection ?", verso: "1. **Flaccidité** (sexe inhibé)\n2. **Érection** (tumescence)\n3. **Rigidité**\n4. **Détumescence**", order_index: 17 },
    { recto: "Quel est le mécanisme vasculaire de l'érection ?", verso: "L'artère caverneuse envoie ses **artères hélicines** vers les **lacs caverneux**\n→ Afflux de sang → gonflement\n→ Blocage du **retour veineux** pour maintenir l'érection", order_index: 18 },
    { recto: "Quels sont les principaux protagonistes cellulaires de l'érection ?", verso: "· Les **cellules musculaires lisses (CML)** : doivent être relaxées\n· Les **cellules endothéliales** : sécrètent le NO", order_index: 19 },
    { recto: "Quel système nerveux autonome est pro-érectile ?", verso: "Le système **parasympathique**\n→ Relaxation des CML → vasodilatation → tumescence", order_index: 20 },
    { recto: "Quel système nerveux autonome provoque la détumescence ?", verso: "Le système **orthosympathique**\n→ Contraction des CML → retour du sang dans la circulation", order_index: 21 },
    { recto: "En état de flaccidité, quel système nerveux est actif ?", verso: "Le système **orthosympathique**\n→ Contraction des CML → débit faible en sang", order_index: 22 },
    { recto: "Quel est le nerf du plaisir ?", verso: "Le **nerf dorsal du pénis**\nIl stimule le centre parasympathique", order_index: 23 },
    { recto: "L'érection réflexe emprunte quelle boucle nerveuse ?", verso: "La boucle **sacrée** (médullaire)", order_index: 24 },
    { recto: "L'érection psychogène emprunte quelle boucle nerveuse ?", verso: "La boucle **supra-spinale** (cérébrale)", order_index: 25 },
    { recto: "Quels muscles se contractent pendant l'érection et ajoutent de la pression ?", verso: "Les muscles **ischio-caverneux** et **bulbo-caverneux**", order_index: 26 },
    { recto: "Que montre une échographie Triplex lors d'une bonne érection ?", verso: "· Vitesse **systolique augmentée**\n· Vitesse **diastolique diminuée**\nL'augmentation de la vitesse du sang est le témoin d'une bonne érection", order_index: 27 },
    { recto: "Qu'est-ce que la maladie de La Peyronie ?", verso: "**Fibrose du corps caverneux** entraînant une **courbure** au moment de l'érection", order_index: 28 },
    { recto: "Décrire la voie NO/GMPc de l'érection", verso: "**Cellule endothéliale** → libère du **NO**\n→ Stimule la **guanylate cyclase** → produit du **GMPc**\n→ Active des **protéines kinases GMPc-dépendantes**\n→ **Relaxation de la CML** → érection", order_index: 29 },
    { recto: "Quel rôle joue la PDE5 dans l'érection ?", verso: "La **PDE5 dégrade le GMPc** et arrête la voie de signalisation\n→ Met fin à l'érection", order_index: 30 },
    { recto: "Quel est le mécanisme d'action du Viagra ?", verso: "**Inhibiteur de la PDE5**\n→ Empêche la dégradation du GMPc\n→ Maintient la voie de signalisation de l'érection", order_index: 31 },
    { recto: "VRAI ou FAUX : le Viagra est un inducteur d'érection", verso: "<b>FAUX</b>\nLe Viagra est un **facilitateur** de l'érection, pas un inducteur\nIl aide à maintenir l'érection mais ne la déclenche **pas seul**", order_index: 32 },
    { recto: "Quels sont les inducteurs d'érection ?", verso: "Les **prostaglandines**\n(contrairement au Viagra qui est un facilitateur)", order_index: 33 },
    { recto: "Quelle est la voie de secours en cas de dysfonctionnement de la voie GMPc ?", verso: "La voie de l'**AMPc** (seconde voie de signalisation)", order_index: 34 },
    { recto: "Pourquoi la dysfonction érectile précède-t-elle les pathologies cardiovasculaires ?", verso: "**Hypothèse du diamètre artériel** :\nLes artères caverneuses sont de **petit calibre** → manifestations rapides\nLes artères coronaires/cérébrales de **gros calibre** → manifestations tardives", order_index: 35 },
    { recto: "Qu'est-ce qui témoigne d'une bonne santé endothéliale ?", verso: "Une **bonne érection**\nÀ l'inverse, un trouble de l'érection est un indicateur de **dysfonction endothéliale** potentielle", order_index: 36 },
    { recto: "Les érections nocturnes sont-elles androgéno-dépendantes ?", verso: "<b>Oui</b>, elles se font durant le **sommeil paradoxal** et sont dépendantes de la **testostérone**\nLeur présence témoigne d'une bonne santé", order_index: 37 },
    { recto: "Quelle est la différence de longueur de l'urètre entre homme et femme ?", verso: "· Homme : **20 cm**\n· Femme : **4 cm**\n→ Prédisposition des femmes aux **cystites**", order_index: 38 },
    { recto: "Citer les structures visibles en vue postérieure de la prostate", verso: "· **Prostate**\n· **Vésicules séminales**\n· **Ampoule du conduit déférent**\n· **Conduit déférent**", order_index: 39 },
    { recto: "Qu'est-ce que le colliculus séminal ?", verso: "Zone de l'urètre prostatique où se trouve l'**abouchement des canaux éjaculateurs**\nAu-dessus se trouve l'**utricule prostatique**", order_index: 40 },
    { recto: "Que peut provoquer un kyste de l'utricule prostatique ?", verso: "Un **blocage des canaux éjaculateurs** → **hypospermie**", order_index: 41 },
    { recto: "Quels sont les 2 sphincters de la prostate ?", verso: "· **Sphincter lisse** : sous contrôle autonome\n· **Sphincter strié** : sous contrôle volontaire (miction)", order_index: 42 },
    { recto: "VRAI ou FAUX : l'homme fabrique du sperme en permanence", verso: "<b>FAUX</b>\nL'homme fabrique des **spermatozoïdes** en permanence\nMais le **sperme** n'est fabriqué qu'au moment de l'éjaculation, « à la demande »", order_index: 43 },
    { recto: "Quel est le rôle de l'urètre prostatique dans l'éjaculation ?", verso: "C'est une **chambre de pression**\nLe sphincter lisse bloque sa partie supérieure pour empêcher le sperme de remonter vers la vessie", order_index: 44 },
    { recto: "Qu'est-ce qu'une éjaculation antégrade ?", verso: "Éjaculation **normale** : le sperme suit la direction d'expulsion (vers l'extérieur)\nGrâce au sphincter lisse qui empêche la remontée vers la vessie", order_index: 45 },
    { recto: "Qu'est-ce qu'une éjaculation rétrograde ?", verso: "Le sphincter lisse dysfonctionne → le sperme **remonte vers la vessie**\nCauses : chirurgie, neuropathie, **diabète**", order_index: 46 },
    { recto: "Comment suspecter une éjaculation rétrograde à l'interrogatoire ?", verso: "**Aspermie** au spermogramme MAIS sensation d'éjaculation et de plaisir **normale**\n→ Le sperme est parti dans la mauvaise direction", order_index: 47 },
    { recto: "Quelle est la différence entre éjaculation rétrograde et anéjaculation ?", verso: "· **Éjaculation rétrograde** : sensation d'éjaculation **présente** mais sperme dans la vessie\n· **Anéjaculation** : **aucune sensation** d'éjaculation, elle n'a pas eu lieu", order_index: 48 },
    { recto: "Comment confirmer une éjaculation rétrograde ?", verso: "On demande au patient d'**uriner** après l'éjaculation et on recherche des **spermatozoïdes dans les urines**", order_index: 49 },
    { recto: "Quelle structure sécrète la fraction la plus importante du sperme ?", verso: "Les **vésicules séminales** : **65%** du volume séminal", order_index: 50 },
    { recto: "Quelle est la contribution de l'épididyme au volume du sperme ?", verso: "Seulement **5%** du volume séminal", order_index: 51 },
    { recto: "Quel est le pH du sperme et pourquoi ?", verso: "pH **alcalin** (7,2-8)\nPour **protéger les spermatozoïdes** (le vagin étant acide)", order_index: 52 },
    { recto: "La sérotonine intervient-elle dans la contraction des fibres lisses caverneuses ?", verso: "<b>Non</b>\nC'est la **noradrénaline** qui intervient dans la contraction des fibres lisses caverneuses (système orthosympathique)", order_index: 53 },
    { recto: "L'étranglement des veines émissaires est-il facultatif pendant l'érection ?", verso: "<b>Non</b>, il est **obligatoire**\nIl y a bien un étranglement des veines émissaires pour bloquer le retour veineux et maintenir l'érection", order_index: 54 },
    { recto: "Le plasma séminal est-il formé essentiellement de spermatozoïdes ?", verso: "<b>Non</b>\nLes spermatozoïdes n'occupent qu'un **petit volume** du sperme (5%)\nLe plasma séminal est le **liquide** dans lequel baignent les spermatozoïdes", order_index: 55 },
    { recto: "Le plasma séminal est-il une production essentiellement testiculaire ?", verso: "<b>Non</b>\nIl est fabriqué par les **vésicules séminales** (65%), la **prostate** (~30%) et l'**épididyme** (5%)", order_index: 56 },
    { recto: "Le plasma séminal est-il caractérisé par la présence de fructose ?", verso: "<b>Oui</b>\nLe fructose est un **marqueur des vésicules séminales** (nutrition et mobilité des spermatozoïdes)", order_index: 57 },
    { recto: "La noradrénaline est-elle impliquée dans l'érection ou la détumescence ?", verso: "Dans la **détumescence** (et la flaccidité)\nLa noradrénaline (orthosympathique) provoque la **contraction des CML**", order_index: 58 },
    { recto: "Le NO est-il impliqué dans l'érection ou la détumescence ?", verso: "Dans l'**érection**\nLe NO (monoxyde d'azote) libéré par la cellule endothéliale est le **médiateur principal** de l'érection via la voie GMPc", order_index: 59 },
    { recto: "Qu'est-ce que l'hypospermie ?", verso: "Volume de sperme **< 1,5 mL**", order_index: 60 },
    { recto: "Qu'est-ce que l'aspermie ?", verso: "**Absence totale** de sperme lors de l'éjaculation", order_index: 61 },
    { recto: "Qu'est-ce que l'oligozoospermie ?", verso: "Concentration de spermatozoïdes **< 15 millions/mL**", order_index: 62 },
    { recto: "Qu'est-ce que l'azoospermie ?", verso: "**Absence totale** de spermatozoïdes dans le sperme", order_index: 63 },
    { recto: "Quelles sont les causes féminines principales d'infertilité ?", verso: "· **SOPK** (syndrome des ovaires polykystiques)\n· **Endométriose**\n· **Infertilité tubaire**\nCe ne sont pas des dysfonctions sexuelles", order_index: 64 },
    { recto: "La dysfonction sexuelle est-elle une cause majeure d'infertilité ?", verso: "<b>Non</b>\nLa fertilité ne requiert qu'une **sexualité minimale** (érection + éjaculation)\nMais une dysfonction sexuelle peut **accompagner** une infertilité", order_index: 65 },
    { recto: "Quelles causes peuvent provoquer une dysfonction du sphincter lisse ?", verso: "· **Chirurgie**\n· **Interventions**\n· **Neuropathies**\n· **Diabète**\n→ Risque d'éjaculation rétrograde", order_index: 66 },
    { recto: "L'éjaculateur précoce est fréquent chez quelle population ?", verso: "Chez les **jeunes** (excitabilité élevée)", order_index: 67 },
    { recto: "La dysfonction sexuelle est-elle une affaire individuelle ?", verso: "<b>Non</b>, c'est presque toujours une **affaire de couple**", order_index: 68 },
    { recto: "La PGE1 est-elle un inhibiteur de l'érection ?", verso: "<b>Non</b>\nLes prostaglandines sont des **inducteurs** d'érection", order_index: 69 },
    { recto: "Comment diagnostique-t-on la maladie de La Peyronie à l'échographie ?", verso: "On observe une **plaque blanchâtre** de fibrose avec un **cône d'ombre** au niveau du corps caverneux (mode B)", order_index: 70 },
    { recto: "Résumer le rôle du sphincter lisse dans l'éjaculation", verso: "Le sphincter lisse **bloque** la partie supérieure de l'urètre prostatique\n→ Empêche le sperme de remonter vers la **vessie**\n→ Assure une éjaculation **antégrade**", order_index: 71 },
    { recto: "Quelle pathologie de l'hémoglobine prédispose au priapisme ?", verso: "La **drépanocytose**\n(Hb S cristallisée → GR rigides → blocage dans les artérioles)", order_index: 72 },
    { recto: "Le priapisme est-il une urgence ?", verso: "<b>Oui</b>, c'est une **urgence médico-chirurgicale**\nTraitement : ponction-aspiration du sang nécrosé des corps caverneux", order_index: 73 },
    { recto: "Le sperme est-il synthétisé suite à la stimulation sexuelle ?", verso: "<b>Oui</b>\nLe sperme (plasma séminal) est fabriqué **au moment de l'éjaculation** (contrairement aux spermatozoïdes produits en continu)", order_index: 74 },
    { recto: "Quelle est la composition du plasma séminal en termes de structures sécrétrices ?", verso: "· **Vésicules séminales** : 65%\n· **Prostate** : ~30%\n· **Épididyme** : 5%", order_index: 75 },
    { recto: "Le plasma séminal contient-il peu de protéines ?", verso: "<b>Non</b>\nIl contient de **nombreuses protéines** : lactoferrine, lysozyme, immunosuppresseurs, facteurs de dé-capacitation, facteurs de coagulation", order_index: 76 },
    { recto: "Le plasma séminal joue-t-il un rôle important dans la capacitation des spermatozoïdes ?", verso: "<b>Non</b>\nIl contient au contraire un **facteur de dé-capacitation** qui protège contre une capacitation prématurée\nLa capacitation a lieu dans les voies génitales féminines", order_index: 77 },
    { recto: "Le plasma séminal peut-il être source d'allergie ?", verso: "<b>Oui</b> (bien que rarement mentionné dans le cours, c'est un fait médical reconnu)", order_index: 78 },
    { recto: "Quels sont les facteurs de risque de stress oxydatif pouvant mener à une dysfonction endothéliale ?", verso: "· **HTA**\n· **Diabète**\n· **Dyslipidémie**\n· **Tabagisme**\n· **Obésité**\nTous ces facteurs mènent à la dysfonction endothéliale et aux pathologies cardiovasculaires", order_index: 79 },
    { recto: "Mnémo : retenir les termes de l'infertilité masculine", verso: "\"**HOA**\" :\n· **H**ypospermie (volume < 1,5 mL)\n· **O**ligozoospermie (concentration < 15 M/mL)\n· **A**zoospermie (absence de spermatozoïdes)", order_index: 80 },
    { recto: "Quel est le rôle des artères hélicines dans l'érection ?", verso: "Ce sont des branches de l'**artère caverneuse** qui alimentent les **lacs caverneux** (espaces sinusoïdaux)\nLeur dilatation permet l'afflux de sang nécessaire à l'érection", order_index: 81 },
    { recto: "VRAI ou FAUX : le priapisme est un phénomène physiologique", verso: "<b>FAUX</b>\nC'est un phénomène **pathologique** : érections involontaires, douloureuses, constituant une **urgence**", order_index: 82 },
    { recto: "Résumer le tableau clinique du priapisme", verso: "· Érection **involontaire et douloureuse** durant plusieurs heures\n· Sang **noir nécrosé** à l'aspiration\n· **Urgence médico-chirurgicale**\n· Fréquent chez les **drépanocytaires**", order_index: 83 },
    { recto: "Quelle est la différence entre éjaculateur précoce (EP) et éjaculateur retardé (ER) ?", verso: "· **EP** : éjaculation trop rapide (fréquent chez les jeunes)\n· **ER** : éjaculation très tardive (peut poser problème pour la fertilité du couple)", order_index: 84 },
    { recto: "VRAI ou FAUX : la dysfonction érectile est un marqueur prédicteur de pathologies cardiovasculaires", verso: "<b>VRAI</b>\nLes artères caverneuses de petit calibre sont les premières touchées par la dysfonction endothéliale, avant les artères coronaires et cérébrales", order_index: 85 },
  ],
  annales: [
    {
      titre: 'Annale 2019 Session 1',
      annee: '2019',
      rappel_cours: "**Priapisme** : érection pathologique, douloureuse, qui dure plusieurs heures = urgence médico-chirurgicale. Le sang reste séquestré dans les corps caverneux (PAS le corps spongieux). La drépanocytose prédispose au priapisme.\n\n**Érection** : phénomène vasculo-tissulaire sous contrôle neuro-hormonal. Les corps caverneux sont les structures clé. L'étranglement des veines émissaires est obligatoire. La dysfonction érectile est un marqueur cardiovasculaire. Érection réflexe = boucle sacrée.\n\n**Plasma séminal** : 65% vésicules séminales, 30% prostate, 5% épididyme. pH alcalin. Contient du fructose (marqueur des VS). Fabriqué au moment de l'éjaculation.",
      questions: [
        {
          enonce: "Parmi les propositions suivantes concernant le priapisme, laquelle (lesquelles) est (sont) exacte(s) ?",
          items: [
            { lettre: 'A', enonce: "C'est un phénomène physiologique", is_correct: false },
            { lettre: 'B', enonce: "Il s'agit d'une véritable urgence", is_correct: true },
            { lettre: 'C', enonce: "Il s'agit d'une érection qui dure depuis plusieurs heures", is_correct: true },
            { lettre: 'D', enonce: "Il y a risque d'altération irréversible essentiellement du corps spongieux", is_correct: false },
            { lettre: 'E', enonce: "C'est une situation fréquente chez les drépanocytaires", is_correct: true },
          ],
          correction: "**Réponse : BCE**\n\nA. **FAUX** — C'est un phénomène **pathologique**, pas physiologique.\nB. **VRAI** — Il s'agit d'une **urgence médico-chirurgicale** (on plante une aiguille dans le pénis et on aspire le sang noir).\nC. **VRAI** — Les érections peuvent durer 6h ou plus.\nD. **FAUX** — Le corps spongieux n'a pas de rigidité et n'intervient pas dans l'érection. Le risque d'altération irréversible concerne les **corps caverneux**.\nE. **VRAI** — Le priapisme est lié à une pathologie de l'hémoglobine, ce qui est le cas dans la drépanocytose.",
        },
        {
          enonce: "Parmi les propositions suivantes concernant l'érection, laquelle (lesquelles) est (sont) exacte(s) ?",
          items: [
            { lettre: 'A', enonce: "Une lésion au niveau des corps caverneux peut provoquer une dysfonction érectile", is_correct: true },
            { lettre: 'B', enonce: "L'étranglement des veines émissaires est facultatif pendant l'érection", is_correct: false },
            { lettre: 'C', enonce: "La prostaglandine E15 est un inhibiteur de l'érection", is_correct: false },
            { lettre: 'D', enonce: "L'érection réflexe s'effectue grâce à une boucle supra spinale", is_correct: false },
            { lettre: 'E', enonce: "La dysfonction érectile peut être un symptôme prédicteur de pathologies cardiovasculaires", is_correct: true },
          ],
          correction: "**Réponse : AE**\n\nA. **VRAI** — Il peut y avoir risque de nécrose affectant le corps caverneux (priapisme).\nB. **FAUX** — L'étranglement des veines émissaires est **obligatoire** pour maintenir l'érection.\nC. **FAUX** — Les prostaglandines sont des **inducteurs** d'érection, pas des inhibiteurs.\nD. **FAUX** — L'érection réflexe s'effectue grâce à une boucle **sacrée**. La boucle supra-spinale concerne l'érection **psychogène**.\nE. **VRAI** — Le trouble de l'érection est un marqueur de pathologie cardiovasculaire +++.",
        },
        {
          enonce: "Parmi les propositions suivantes concernant le plasma séminal, laquelle (lesquelles) est (sont) exacte(s) ?",
          items: [
            { lettre: 'A', enonce: "Il est formé essentiellement de spermatozoïdes", is_correct: false },
            { lettre: 'B', enonce: "Il est caractérisé par la présence de fructose", is_correct: true },
            { lettre: 'C', enonce: "Son pH est généralement alcalin", is_correct: true },
            { lettre: 'D', enonce: "Il est synthétisé suite à la stimulation sexuelle", is_correct: true },
            { lettre: 'E', enonce: "Est une production essentiellement testiculaire", is_correct: false },
          ],
          correction: "**Réponse : BCD**\n\nA. **FAUX** — Les spermatozoïdes n'occupent qu'un petit volume du sperme (5%).\nB. **VRAI** — Le fructose est un marqueur des vésicules séminales.\nC. **VRAI** — Le pH du sperme est alcalin (7,2-8) pour protéger les spermatozoïdes.\nD. **VRAI** — Le sperme est fabriqué au moment de l'éjaculation.\nE. **FAUX** — Le liquide séminal est fabriqué par les vésicules séminales (65%), la prostate (~30%) et l'épididyme (5%).",
        },
      ],
    },
    {
      titre: 'Annale 2015 Session 1',
      annee: '2015',
      rappel_cours: "**Érection** : phénomène vasculaire impliquant les corps caverneux. L'étranglement des veines émissaires est obligatoire. Le priapisme peut provoquer une dysfonction érectile. La dysfonction endothéliale induit une dysfonction érectile car la cellule endothéliale sécrète le NO, médiateur de l'érection. La sérotonine n'intervient PAS dans la contraction des fibres lisses caverneuses (c'est la noradrénaline).\n\n**Plasma séminal** : composé à 65% de sécrétions des vésicules séminales, pH alcalin (7,2-8). Contient de nombreuses protéines. Peut être source d'allergie.",
      questions: [
        {
          enonce: "Concernant l'érection, indiquez la(es) proposition(s) exacte(s) :",
          items: [
            { lettre: 'A', enonce: "Un priapisme peut provoquer une dysfonction érectile", is_correct: true },
            { lettre: 'B', enonce: "L'étranglement des veines émissaires est facultatif pendant l'érection", is_correct: false },
            { lettre: 'C', enonce: "La dysfonction endothéliale induit une dysfonction érectile", is_correct: true },
            { lettre: 'D', enonce: "La sérotonine intervient dans la contraction des fibres lisses caverneuses", is_correct: false },
            { lettre: 'E', enonce: "La dysfonction érectile peut être un symptôme annonciateur de pathologies cardiovasculaires", is_correct: true },
          ],
          correction: "**Réponse : ACE**\n\nA. **VRAI** — Le priapisme peut provoquer une nécrose des corps caverneux et donc une dysfonction érectile.\nB. **FAUX** — L'étranglement des veines émissaires est **obligatoire** pendant l'érection.\nC. **VRAI** — La cellule endothéliale est à la base du mécanisme érectile (sécrétion de NO) et des pathologies cardiovasculaires.\nD. **FAUX** — C'est la **noradrénaline** qui intervient dans la contraction des fibres lisses caverneuses (pas la sérotonine).\nE. **VRAI** — La dysfonction érectile est un marqueur cardiovasculaire.",
        },
        {
          enonce: "Concernant le plasma séminal, indiquez la(es) proposition(s) exacte(s) :",
          items: [
            { lettre: 'A', enonce: "Il est constitué essentiellement de liquide épididymaire", is_correct: false },
            { lettre: 'B', enonce: "Il joue un rôle important dans la capacitation des spermatozoïdes", is_correct: false },
            { lettre: 'C', enonce: "Il contient très peu de protéines", is_correct: false },
            { lettre: 'D', enonce: "Son pH varie entre 7.2-8", is_correct: true },
            { lettre: 'E', enonce: "Il peut être source d'allergie", is_correct: true },
          ],
          correction: "**Réponse : DE**\n\nA. **FAUX** — Il est composé à 65% de sécrétions des vésicules séminales, 30% prostate, 5% épididyme.\nB. **FAUX** — Le plasma séminal contient un facteur de **dé-capacitation** (il empêche la capacitation prématurée).\nC. **FAUX** — Il contient de nombreuses protéines (lactoferrine, lysozyme, etc.).\nD. **VRAI** — pH alcalin entre 7,2 et 8.\nE. **VRAI** — Le plasma séminal peut être source d'allergie.",
        },
      ],
    },
    {
      titre: 'Annale 2018 Session 2',
      annee: '2018',
      rappel_cours: "**Rappel clé** : la cellule endothéliale sécrète le NO qui est le médiateur de l'érection via la voie GMPc. La contraction des fibres lisses caverneuses est médiée principalement par l'adrénaline (récepteurs alpha-1) et des médiateurs locaux, PAS par la sérotonine. L'étranglement des veines émissaires est obligatoire pour l'érection.",
      questions: [
        {
          enonce: "Concernant l'érection, indiquez la(es) proposition(s) exacte(s) :",
          items: [
            { lettre: 'A', enonce: "Un priapisme peut provoquer une dysfonction érectile", is_correct: true },
            { lettre: 'B', enonce: "L'étranglement des veines émissaires est facultatif pendant l'érection", is_correct: false },
            { lettre: 'C', enonce: "La dysfonction endothéliale induit une dysfonction érectile", is_correct: true },
            { lettre: 'D', enonce: "La sérotonine intervient dans la contraction des fibres lisses caverneuses", is_correct: false },
            { lettre: 'E', enonce: "La dysfonction érectile peut être un symptôme annonciateur de pathologies cardiovasculaires", is_correct: true },
          ],
          correction: "**Réponse : ACE**\n\nA. **VRAI** — Le priapisme peut causer une nécrose des corps caverneux → dysfonction érectile.\nB. **FAUX** — L'étranglement des veines émissaires est **obligatoire** pendant l'érection.\nC. **VRAI** — La cellule endothéliale sécrète le NO, médiateur de l'érection.\nD. **FAUX** — La contraction des fibres lisses est principalement médiée par l'**adrénaline** (alpha-1) et des médiateurs locaux, pas par la sérotonine.\nE. **VRAI** — La dysfonction érectile est un marqueur cardiovasculaire.",
        },
        {
          enonce: "Concernant le plasma séminal, indiquez la(es) proposition(s) exacte(s) :",
          items: [
            { lettre: 'A', enonce: "Il est constitué essentiellement de liquide épididymaire", is_correct: false },
            { lettre: 'B', enonce: "Il joue un rôle important dans la capacitation des spermatozoïdes", is_correct: false },
            { lettre: 'C', enonce: "Il est composé de très peu de protéines", is_correct: false },
            { lettre: 'D', enonce: "Son pH varie entre 7.2 et 8", is_correct: true },
            { lettre: 'E', enonce: "Il peut être source d'allergie", is_correct: true },
          ],
          correction: "**Réponse : DE**\n\nA. **FAUX** — Il est composé à 65% de sécrétions des vésicules séminales, 30% prostate, 5% épididyme.\nB. **FAUX** — Le plasma séminal contient un facteur de dé-capacitation.\nC. **FAUX** — Il contient de nombreuses protéines.\nD. **VRAI** — pH alcalin entre 7,2 et 8.\nE. **VRAI** — Le plasma séminal peut être source d'allergie.",
        },
      ],
    },
    {
      titre: 'Annale 2016 Session 2',
      annee: '2016',
      rappel_cours: "L'érection est un phénomène vasculaire impliquant les **corps caverneux** (pas le corps spongieux). La cellule endothéliale sécrète le NO → GMPc → relaxation des CML. La dysfonction érectile est un marqueur prédicteur de pathologies cardiovasculaires (hypothèse du diamètre artériel).",
      questions: [
        {
          enonce: "A propos de l'érection, indiquez la ou les propositions exactes :",
          items: [
            { lettre: 'A', enonce: "Une lésion au niveau des corps caverneux peut provoquer une dysfonction érectile", is_correct: true },
            { lettre: 'B', enonce: "L'étranglement des veines émissaires est facultatif pendant l'érection", is_correct: false },
            { lettre: 'C', enonce: "La dysfonction endothéliale peut induire une dysfonction érectile", is_correct: true },
            { lettre: 'D', enonce: "La sérotonine intervient dans la contraction des fibres lisses caverneuses", is_correct: false },
            { lettre: 'E', enonce: "La dysfonction érectile peut être un symptôme prédicateur de pathologies cardiovasculaires", is_correct: true },
          ],
          correction: "**Réponse : ACE**\n\nA. **VRAI** — L'érection repose sur les corps caverneux, une lésion peut provoquer une dysfonction érectile.\nB. **FAUX** — L'étranglement des veines émissaires est **obligatoire**.\nC. **VRAI** — La dysfonction endothéliale altère la sécrétion de NO → dysfonction érectile.\nD. **FAUX** — La sérotonine n'est pas mentionnée dans le mécanisme de contraction des fibres lisses caverneuses.\nE. **VRAI** — La dysfonction érectile est un marqueur cardiovasculaire.",
        },
      ],
    },
    {
      titre: 'Annale 2015 Session 2',
      annee: '2015',
      rappel_cours: "Questions récurrentes sur l'érection : le priapisme provoque une dysfonction érectile, l'étranglement des veines émissaires est obligatoire, la dysfonction endothéliale induit une dysfonction érectile, la sérotonine n'intervient PAS dans la contraction des fibres lisses caverneuses, la dysfonction érectile est un symptôme annonciateur de pathologies cardiovasculaires.",
      questions: [
        {
          enonce: "Concernant l'érection, indiquez la(es) proposition(s) exacte(s) :",
          items: [
            { lettre: 'A', enonce: "Un priapisme peut provoquer une dysfonction érectile", is_correct: true },
            { lettre: 'B', enonce: "L'étranglement des veines émissaires est facultatif pendant l'érection", is_correct: false },
            { lettre: 'C', enonce: "La dysfonction endothéliale induit une dysfonction érectile", is_correct: true },
            { lettre: 'D', enonce: "La sérotonine intervient dans la contraction des fibres lisses caverneuses", is_correct: false },
            { lettre: 'E', enonce: "La dysfonction érectile peut être un symptôme annonciateur de pathologies cardiovasculaires", is_correct: true },
          ],
          correction: "**Réponse : ACE**\n\nA. **VRAI** — Le priapisme provoque une nécrose des corps caverneux → dysfonction érectile.\nB. **FAUX** — L'étranglement des veines émissaires est **obligatoire**.\nC. **VRAI** — La cellule endothéliale sécrète le NO, médiateur de l'érection.\nD. **FAUX** — La sérotonine n'intervient pas dans ce mécanisme.\nE. **VRAI** — La dysfonction érectile annonce des pathologies cardiovasculaires.",
        },
      ],
    },
  ],
};

export default content;

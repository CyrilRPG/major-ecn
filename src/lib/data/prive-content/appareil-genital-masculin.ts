import type { PriveCourseContent } from '../prive-courses';

const content: PriveCourseContent = {
  fiche: {
    parties: [
      {
        numero: 'I',
        titre: 'Rappels histologiques',
        sous_parties: [
          {
            titre: 'Épithélium de revêtement',
            rows: [
              { concept: '◆ Définition', detail_md: "Les épithéliums de revêtement recouvrent les **surfaces externes et internes** du corps, des cavités organiques et des conduits\nIls peuvent être **simples** (une couche) ou **stratifiés** (plusieurs couches) ou **pseudo-stratifiés**", kind: 'a_retenir' },
              { concept: 'Types d\'épithéliums simples', detail_md: "Varient de hauteur selon leur fonction :\n· **Aplatis/pavimenteux** : adaptés à la diffusion (alvéoles pulmonaires, endothélium vasculaire, mésothélium)\n· **Cubiques** : cellules de taille moyenne\n· **Hauts/cylindriques** : cellules très actives (ex : intestin grêle), doivent contenir plus d'organites", kind: 'normal' },
              { concept: 'Spécialisations de surface', detail_md: "Les épithéliums simples peuvent présenter des spécialisations :\n· **Microvillosités** : augmentent la surface d'absorption\n· **Cils vibratiles** : propulsion\n· **Stéréocils** : absorption (sans activité motrice)", kind: 'normal' },
            ],
          },
          {
            titre: 'Épithélium glandulaire',
            rows: [
              { concept: 'Glandes', detail_md: "Ensemble de **cellules épithéliales spécialisées** qui produisent des sécrétions\nNe pas apprendre la localisation des épithéliums (consigne du prof)", kind: 'normal' },
            ],
          },
        ],
      },
      {
        numero: 'II',
        titre: 'Les testicules et la spermatogenèse',
        sous_parties: [
          {
            titre: 'Structure générale du testicule',
            rows: [
              { concept: '◆ Anatomie générale', detail_md: "Les testicules sont situés dans les **bourses (scrotum)**\nForme **ovoïde** : **4 cm** de long, **10 à 15 g**\n· Pôle inférieur fixé au scrotum par le **gubernaculum testis**\n· Pôle supérieur dans le prolongement du **cordon spermatique**", kind: 'a_retenir' },
              { concept: '◆ Albuginée et corps de Highmore', detail_md: "Le testicule est enveloppé d'une capsule conjonctive blanche, épaisse et peu extensible = **albuginée testiculaire**\nEn regard de l'épididyme, l'albuginée s'épaissit et s'enfonce dans la profondeur = **corps de Highmore**\nEntre albuginée et corps de Highmore : **cloisons radiaires (septa)** délimitant les lobules", kind: 'a_retenir' },
              { concept: '⚠ Piège albuginée vs Highmore', detail_md: "L'**albuginée** = capsule conjonctive qui enveloppe le testicule\nLe **corps de Highmore** = épaississement de l'albuginée (pas la capsule elle-même)\nNe pas confondre les deux !", kind: 'piege' },
              { concept: '◆ Double fonction du testicule', detail_md: "· Fonction **exocrine** : spermatogenèse (production de spermatozoïdes)\n· Fonction **endocrine** : sécrétion d'androgènes (testostérone) par les cellules de Leydig", kind: 'a_retenir' },
            ],
          },
          {
            titre: 'Les tubes séminifères',
            rows: [
              { concept: '◆ Organisation lobulaire', detail_md: "Chaque lobule contient **2 ou 3 tubes séminifères**\n· Longueur : **30 cm à 1 m**\n· Diamètre : **150-300 um**\n· Entourés chacun d'une **membrane propre**\nLe trajet tortueux donne de multiples sections en coupe", kind: 'a_retenir' },
              { concept: 'Glande interstitielle', detail_md: "Entre les tubes séminifères se dispose la **glande interstitielle** avec :\n· Tissu conjonctif lâche\n· Vaisseaux sanguins et lymphatiques\n· Nerfs\n· **Cellules de Leydig** (sécrétion de testostérone)", kind: 'normal' },
              { concept: '⚠ Localisation des cellules', detail_md: "· **Cellules de Sertoli** : dans l'**épithélium des tubes séminifères** (PAS dans l'espace interstitiel)\n· **Cellules de Leydig** : dans l'**espace interstitiel** (PAS dans les tubes séminifères)", kind: 'piege' },
            ],
          },
          {
            titre: 'La spermatogenèse',
            rows: [
              { concept: '◆ Localisation', detail_md: "La spermatogenèse se déroule dans les **tubes séminifères** des testicules", kind: 'a_retenir' },
              { concept: '◆ Les 3 étapes', detail_md: "1. **Phase proliférative** = **27 jours**\n2. **Méiose** = **24 jours**\n3. **Spermiogenèse** = **23 jours**", kind: 'a_retenir' },
              { concept: 'Spermiogenèse : modifications des spermatides', detail_md: "Pendant la spermiogenèse, les spermatides subissent :\n· Formation de l'**acrosome**\n· **Condensation nucléaire**\n· Développement du **flagelle**\n· Réorganisation du **cytoplasme**", kind: 'normal' },
              { concept: '◆ Spermatozoïdes à la sortie du testicule', detail_md: "À la sortie des testicules, les spermatozoïdes sont **NON fécondants** :\n· Pas de mobilité progressive\n· Incapacité à fixer la zone pellucide\n· Incapacité à effectuer la réaction acrosomique\n· Incapacité à fusionner\n→ Nécessité d'une **maturation post-testiculaire** (épididymaire)", kind: 'a_retenir' },
            ],
          },
        ],
      },
      {
        numero: 'III',
        titre: 'L\'épididyme et acquisition des capacités fécondantes',
        sous_parties: [
          {
            titre: 'Les voies spermatiques',
            rows: [
              { concept: '◆ Trajet des spermatozoïdes', detail_md: "Les voies spermatiques sont constituées successivement par :\n1. Voies spermatiques **intra-testiculaires** (tubes droits, rete testis)\n2. **Canaux efférents**\n3. **Canal épididymaire**\n4. **Canal déférent**\n5. **Canal éjaculateur**\n6. **Canal uro-génital (urètre)**\n+ Glandes génitales annexes", kind: 'a_retenir' },
            ],
          },
          {
            titre: 'Tubes droits et rete testis',
            rows: [
              { concept: 'Tubes droits', detail_md: "Les tubes séminifères débouchent dans les **tubes droits** :\n· Segments courts à lumière étroite (**25 um** de diamètre)\n· Épithélium **cubique**\nLongtemps considérés comme de simples canaux vecteurs, ils ont des fonctions d'échange", kind: 'normal' },
              { concept: '◆ Rete testis', detail_md: "Réseau **labyrinthique** de canaux à épithélium **pavimenteux** situé dans le corps de Highmore\nLes spermatozoïdes immatures et immobiles traversent les voies intra-testiculaires poussés par la **pression du liquide séminal** sécrété par les **cellules de Sertoli**", kind: 'a_retenir' },
            ],
          },
          {
            titre: 'Les canaux efférents',
            rows: [
              { concept: '◆ Anatomie', detail_md: "Le rete testis est connecté à l'épididyme par **10 à 12 canaux efférents** de **20 cm** de long sur **0,2 mm** de diamètre\nIls traversent l'albuginée et s'enroulent en spirale", kind: 'a_retenir' },
              { concept: 'Histologie', detail_md: "Paroi : épithélium **prismatique** avec 3 types cellulaires :\n1. **Cellules ciliées** (cils vibratiles → progression des spermatozoïdes)\n2. **Cellules glandulaires** (sécrétion de protéines)\n3. **Cellules basales** de renouvellement\nRésorption du liquide séminal et sécrétion de protéines", kind: 'normal' },
              { concept: 'Réabsorption', detail_md: "Réabsorption du fluide testiculaire (**eau et Na+**)\n→ **Concentration** des spermatozoïdes\n→ Modification de la composition du fluide", kind: 'normal' },
            ],
          },
          {
            titre: 'Le canal épididymaire',
            rows: [
              { concept: '◆ Anatomie', detail_md: "**Tube pelotonné** de **3 à 6 m** chez l'homme (= épididyme de **6 m** pelotonné)\n3 segments : **tête (caput)**, **corps**, **queue (cauda)**", kind: 'a_retenir' },
              { concept: '◆ Histologie', detail_md: "Épithélium **prismatique pseudo-stratifié** avec :\n1. **Cellules principales** avec **stéréocils** (PAS des cils vibratiles) : organites de synthèse protéique et d'absorption\n2. **Cellules basales**\n· Membrane basale → tissu conjonctif lâche\n· **Musculeuse** s'épaississant de la tête à la queue (3 couches dans la partie terminale)", kind: 'a_retenir' },
              { concept: '⚠ Stéréocils vs cils vibratiles', detail_md: "**Cils vibratiles** : expansions mobiles avec battements synchrones, contenant un axonème (microtubules)\n**Stéréocils** : expansions fines, irrégulières, **SANS activité motrice** (absence de microtubules)\nL'**épididyme** a des **stéréocils** (PAS des cils vibratiles !)\nLa hauteur des stéréocils **diminue** de la tête vers la queue", kind: 'piege' },
              { concept: '◆ Rôle de l\'épididyme', detail_md: "· **Transport** des spermatozoïdes\n· **Maturation** des spermatozoïdes\n· **Stockage** dans la queue de l'épididyme", kind: 'a_retenir' },
            ],
          },
          {
            titre: 'Transit et maturation épididymaire',
            rows: [
              { concept: '◆ Durée de transit', detail_md: "**10 à 12 jours** chez les mammifères (hors temps de stockage)\nProgression sous la dépendance de :\n1. **Pression intraluminale** (décroît de la tête à la queue)\n2. **Contraction des CML**", kind: 'a_retenir' },
              { concept: '◆ Réserve épididymaire', detail_md: "Production : **45 à 207 millions** de spermatozoïdes par jour\nRéserve : **182 millions** par épididyme :\n· **26%** dans la tête\n· **23%** dans le corps\n· **52%** dans la queue (réservoir principal)", kind: 'a_retenir' },
              { concept: '◆ Maturation épididymaire', detail_md: "Phénomène progressif et séquentiel dans la **tête et le corps** :\n1. Acquisition d'une **mobilité unidirectionnelle**\n2. Aptitude à se **fixer sur la zone pellucide** et la membrane ovocytaire\n3. Capacité à assurer un **développement embryonnaire normal**\nLa maturation résulte de l'**interaction** entre sécrétions épididymaires et spermatozoïdes", kind: 'a_retenir' },
            ],
          },
        ],
      },
      {
        numero: 'IV',
        titre: 'Canal déférent',
        sous_parties: [
          {
            titre: 'Anatomie et histologie',
            rows: [
              { concept: '◆ Présentation', detail_md: "Tube droit d'environ **40 cm** de long contenu dans le **cordon spermatique**\nFait suite au canal épididymaire et transporte les spermatozoïdes jusqu'à l'urètre via le canal éjaculateur", kind: 'a_retenir' },
              { concept: '◆ Les 3 tuniques', detail_md: "Paroi épaisse avec 3 tuniques :\n1. **Muqueuse mince** : épithélium prismatique pseudo-stratifié avec stéréocils + chorion glandulaire\n2. **Musculeuse épaisse** : 3 couches de FML (longitudinale interne, circulaire moyenne, longitudinale externe)\n3. **Adventice** : tissu conjonctif lâche élastique, vascularisé et innervé", kind: 'a_retenir' },
              { concept: '◆ Rôle lors de l\'éjaculation', detail_md: "Les plis de la muqueuse se **distendent** → passage des spermatozoïdes stockés dans la queue de l'épididyme\nLa musculeuse émet des **ondes péristaltiques puissantes et brèves** → expulsion rapide\nSous contrôle nerveux de fibres **orthosympathiques adrénergiques**", kind: 'a_retenir' },
              { concept: 'Terminaison', detail_md: "Le canal déférent se termine par l'**ampoule déférentielle** où s'abouchent les vésicules séminales\nIl se poursuit par le court **canal éjaculateur** qui rejoint l'urètre prostatique", kind: 'normal' },
            ],
          },
          {
            titre: 'Canal éjaculateur et urètre',
            rows: [
              { concept: 'Canal éjaculateur', detail_md: "**2 cm** de long pour **2 cm** de diamètre\nPénètre dans le tissu prostatique (perd sa musculeuse)\nLes canaux éjaculateurs pairs rejoignent l'**urètre prostatique** de part et d'autre de l'utricule prostatique\nÉpithélium **prismatique simple**, musculeuse peu développée", kind: 'normal' },
              { concept: '◆ L\'urètre (canal uro-génital)', detail_md: "S'étend de la partie inférieure de la vessie au méat urogénital\nLongueur : **20-25 cm**, 3 segments :\n1. **Urètre prostatique**\n2. **Urètre membraneux** (périnéal)\n3. **Urètre spongieux** (pénien)\nDouble rôle : évacuation de l'**urine** (miction) et véhicule du **sperme** (éjaculation)", kind: 'a_retenir' },
            ],
          },
        ],
      },
      {
        numero: 'V',
        titre: 'Les vésicules séminales et la prostate',
        sous_parties: [
          {
            titre: 'Les vésicules séminales',
            rows: [
              { concept: '◆ Anatomie', detail_md: "Organes **pairs**, en forme de sac à paroi bosselée\nTubes pelotonnés avec muqueuse, musculeuse et adventice\nMuqueuse à **nombreux replis** (augmentent la surface d'échange)\nÉpithélium **prismatique/cylindrique simple** avec cellules principales glandulaires et cellules basales", kind: 'a_retenir' },
              { concept: 'Musculeuse', detail_md: "2 couches de FML :\n· Couche interne **circulaire**\n· Couche externe **longitudinale**", kind: 'normal' },
              { concept: '◆ Sécrétion du plasma séminal', detail_md: "Les vésicules séminales élaborent la **majeure partie** du plasma séminal (**50-80%** de l'éjaculat, 2,5 mL)\npH **alcalin**, sécrétion **androgéno-dépendante** (testostérone)\nContenu :\n· Eau et électrolytes\n· **Fructose** (marqueur des VS) : nutrition et mobilité\n· Protéines : lactoferrine, lysozyme (pouvoir antibactérien), immunosuppresseur, facteur de dé-capacitation, facteur de coagulation\n· **Prostaglandines** (contractions utérines + migration spermatozoïdes)\n· Vitamine C", kind: 'a_retenir' },
            ],
          },
          {
            titre: 'La prostate',
            rows: [
              { concept: '◆ Anatomie générale', detail_md: "Organe **musculo-glandulaire** de la taille d'une petite **châtaigne**\nSituée à la partie inférieure de la vessie = **carrefour uro-génital**\nEntoure l'**urètre prostatique**\nCapsule **fibro-élastique** → cloisons → lobules\nGlande **exocrine** unique avec 2 parties : crâniale et caudale (3 lobes chacune)", kind: 'a_retenir' },
              { concept: '⚠ Piège : glande exocrine', detail_md: "La prostate est une glande **exocrine** (PAS endocrine !)\nElle sécrète le liquide prostatique qui est déversé dans l'urètre", kind: 'piege' },
              { concept: '◆ Les 2 sphincters', detail_md: "· **Sphincter interne (lisse)** : partie supérieure de l'urètre, sa tonicité empêche l'écoulement spontané de l'urine\n· **Sphincter externe (strié)** : partie inférieure, rôle = acte **volontaire** de la miction", kind: 'a_retenir' },
              { concept: '◆ Glandes prostatiques', detail_md: "~50 glandes **tubulo-alvéolaires** dans un stroma conjonctif riche en FML, fibres élastiques, vaisseaux et nerfs\n3 groupes concentriques :\n1. Glandes **péri-urétrales internes**\n2. Glandes **péri-urétrales externes**\n3. Glandes **principales** (essentiel de la sécrétion)\nÉpithélium : cellules **sécrétrices** (prismatiques/cubiques) + cellules **basales** de remplacement", kind: 'a_retenir' },
              { concept: '◆ Excrétion mérocrine vs apocrine', detail_md: "· **Mérocrine** : exocytose au pôle apical en **respectant** la membrane cellulaire\n· **Apocrine** : les grains de sécrétion entraînent le pôle apical, **ne respecte PAS** la membrane cellulaire", kind: 'a_retenir' },
              { concept: 'Corps de Robin (sympexions)', detail_md: "Petits corps sphériques de lamelles concentriques de **glycoprotéines** dans la lumière des tubulo-acini\nÀ partir de la quarantaine : tendance à la **calcification** → calculs ou **lithiase prostatique** (pas de rôle pathologique particulier)", kind: 'normal' },
              { concept: '◆ Sécrétions prostatiques', detail_md: "Liquide épais et blanc riche en protéines :\n· ~**1/6e** de l'éjaculat\n· pH légèrement **acide**\n· Facteur de **liquéfaction** du sperme\n· Spermine et spermidine\n· Albumine, enzymes protéolytiques (fibrinolysine)\n· Acide citrique, phosphatase acide\n· Ions (Zn, Mg, Ca)\nSécrétion **androgéno-dépendante** (récepteurs aux androgènes)", kind: 'a_retenir' },
            ],
          },
          {
            titre: 'Les glandes bulbo-urétrales',
            rows: [
              { concept: 'Glandes bulbo-urétrales', detail_md: "2 petites glandes **tubulo-acineuses** (taille d'un petit pois)\nCapsule conjonctivo-élastique, stroma riche en FML et fibres élastiques\nSécrètent un liquide **mucoïde** déversé dans l'urètre membraneux\nRôle : **lubrification de l'urètre** avant l'éjaculation\nSécrétion **androgéno-dépendante**", kind: 'normal' },
            ],
          },
        ],
      },
      {
        numero: 'VI',
        titre: 'Composition du sperme',
        sous_parties: [
          {
            titre: 'Séquence éjaculatoire et composition',
            rows: [
              { concept: '◆ Composition globale', detail_md: "Le sperme est composé de :\n· Sécrétions des **vésicules séminales** (50-80% du volume)\n· Sécrétions de la **prostate** (~1/6e)\n· Sécrétions de l'**épididyme** (5%)\n· Sécrétions des **glandes bulbo-urétrales** (lubrification)\n· **Spermatozoïdes** (petit volume)\nL'origine des composés n'est pas à apprendre (consigne du prof)", kind: 'a_retenir' },
            ],
          },
        ],
      },
    ],
    points_cles: [
      "Le testicule est enveloppé de l'albuginée, le corps de Highmore est un épaississement de l'albuginée",
      "Le testicule a une double fonction : exocrine (spermatogenèse) et endocrine (androgènes par les cellules de Leydig)",
      "Cellules de Sertoli = dans les tubes séminifères ; Cellules de Leydig = dans l'espace interstitiel",
      "Spermatogenèse : phase proliférative (27j) → méiose (24j) → spermiogenèse (23j)",
      "Les spermatozoïdes à la sortie du testicule sont NON fécondants : maturation dans l'épididyme",
      "L'épididyme a un épithélium pseudo-stratifié avec des stéréocils (PAS des cils vibratiles)",
      "La musculeuse de l'épididyme s'épaissit de la tête vers la queue",
      "Le canal déférent mesure 40 cm et a 3 couches de FML dans sa musculeuse",
      "La prostate est une glande exocrine (PAS endocrine), 2 sphincters : lisse (autonome) et strié (volontaire)",
      "Les vésicules séminales sécrètent 50-80% du plasma séminal, le fructose est leur marqueur",
    ],
    chiffres_cles: {
      titre: 'Chiffres clés — Appareil génital masculin',
      markdown: "| Paramètre | Valeur |\n|---|---|\n| Taille du testicule | **4 cm** de long, **10-15 g** |\n| Tubes séminifères par lobule | **2-3** |\n| Longueur tube séminifère | **30 cm à 1 m** |\n| Diamètre tube séminifère | **150-300 um** |\n| Phase proliférative | **27 jours** |\n| Méiose | **24 jours** |\n| Spermiogenèse | **23 jours** |\n| Longueur épididyme | **3 à 6 m** (pelotonné) |\n| Transit épididymaire | **10-12 jours** |\n| Production spermatozoïdes | **45-207 millions/jour** |\n| Réserve épididymaire | **182 millions/épididyme** |\n| Canaux efférents | **10-12**, longueur **20 cm** |\n| Longueur canal déférent | **40 cm** |\n| Longueur urètre masculin | **20-25 cm** |\n| Fraction vésicules séminales | **50-80%** de l'éjaculat |\n| Fraction prostatique | **~1/6e** de l'éjaculat |",
    },
  },
  flashcards: [
    { recto: "Où sont situés les testicules ?", verso: "Dans les **bourses (scrotum)**\nÀ la naissance ils sont normalement déjà dans le scrotum", order_index: 1 },
    { recto: "Quelles sont les dimensions du testicule ?", verso: "Forme ovoïde : **4 cm** de long, **10 à 15 g**", order_index: 2 },
    { recto: "Qu'est-ce que l'albuginée testiculaire ?", verso: "**Capsule conjonctive** blanche, épaisse et peu extensible qui **enveloppe** le testicule", order_index: 3 },
    { recto: "Qu'est-ce que le corps de Highmore ?", verso: "**Épaississement de l'albuginée** qui s'enfonce dans la profondeur du testicule, en regard de l'épididyme\nContient le rete testis", order_index: 4 },
    { recto: "Que sont les septa interlobulaires ?", verso: "**Cloisons radiaires** tendues entre l'albuginée et le corps de Highmore\nElles délimitent les **lobules** qui communiquent entre eux", order_index: 5 },
    { recto: "Quelles sont les 2 fonctions du testicule ?", verso: "· **Exocrine** : spermatogenèse (production de spermatozoïdes)\n· **Endocrine** : sécrétion d'androgènes (testostérone) par les cellules de Leydig", order_index: 6 },
    { recto: "VRAI ou FAUX : le testicule a une fonction uniquement exocrine", verso: "<b>FAUX</b>\nIl a une double fonction : **exocrine** (spermatogenèse) ET **endocrine** (sécrétion d'androgènes)", order_index: 7 },
    { recto: "Combien de tubes séminifères contient chaque lobule ?", verso: "**2 ou 3** tubes séminifères", order_index: 8 },
    { recto: "Quelles sont les dimensions d'un tube séminifère ?", verso: "· Longueur : **30 cm à 1 m**\n· Diamètre : **150-300 um**", order_index: 9 },
    { recto: "Où se situent les cellules de Sertoli ?", verso: "Dans l'**épithélium des tubes séminifères** (PAS dans l'espace interstitiel)", order_index: 10 },
    { recto: "Où se situent les cellules de Leydig ?", verso: "Dans l'**espace interstitiel** (glande interstitielle) entre les tubes séminifères\nElles sécrètent la **testostérone**", order_index: 11 },
    { recto: "Quelles sont les 3 étapes de la spermatogenèse et leur durée ?", verso: "1. **Phase proliférative** = **27 jours**\n2. **Méiose** = **24 jours**\n3. **Spermiogenèse** = **23 jours**", order_index: 12 },
    { recto: "Quelles sont les 4 modifications des spermatides pendant la spermiogenèse ?", verso: "1. Formation de l'**acrosome**\n2. **Condensation nucléaire**\n3. Développement du **flagelle**\n4. Réorganisation du **cytoplasme**", order_index: 13 },
    { recto: "Les spermatozoïdes sont-ils fécondants à la sortie du testicule ?", verso: "<b>Non</b>, ils sont **non fécondants** :\n· Pas de mobilité progressive\n· Incapacité à fixer la zone pellucide\n· Incapacité à effectuer la réaction acrosomique\n· Incapacité à fusionner", order_index: 14 },
    { recto: "Où les spermatozoïdes acquièrent-ils leurs capacités fécondantes ?", verso: "Dans l'**épididyme** (maturation post-testiculaire épididymaire)", order_index: 15 },
    { recto: "Citer dans l'ordre les voies spermatiques masculines", verso: "1. Voies intra-testiculaires (tubes droits, rete testis)\n2. **Canaux efférents**\n3. **Canal épididymaire**\n4. **Canal déférent**\n5. **Canal éjaculateur**\n6. **Urètre**", order_index: 16 },
    { recto: "Qu'est-ce que le rete testis ?", verso: "Réseau **labyrinthique** de canaux à épithélium **pavimenteux** situé dans le corps de Highmore\nConnecte les tubes séminifères aux canaux efférents", order_index: 17 },
    { recto: "Quelle force pousse les spermatozoïdes dans les voies intra-testiculaires ?", verso: "La **pression du liquide séminal primitif** sécrété en continu par les **cellules de Sertoli**", order_index: 18 },
    { recto: "Combien y a-t-il de canaux efférents et quelles sont leurs dimensions ?", verso: "**10 à 12** canaux efférents\n· Longueur : **20 cm**\n· Diamètre : **0,2 mm**", order_index: 19 },
    { recto: "Quels sont les 3 types cellulaires de l'épithélium des canaux efférents ?", verso: "1. **Cellules ciliées** (cils vibratiles → progression des spermatozoïdes)\n2. **Cellules glandulaires** (sécrétion de protéines)\n3. **Cellules basales** de renouvellement", order_index: 20 },
    { recto: "Quelle est la longueur de l'épididyme ?", verso: "Tube pelotonné de **3 à 6 m** chez l'homme", order_index: 21 },
    { recto: "Quels sont les 3 segments de l'épididyme ?", verso: "1. **Tête (caput)**\n2. **Corps**\n3. **Queue (cauda)**", order_index: 22 },
    { recto: "Quel est l'épithélium de l'épididyme ?", verso: "Épithélium **prismatique pseudo-stratifié**\nCellules principales avec **stéréocils** (PAS des cils vibratiles) + cellules basales", order_index: 23 },
    { recto: "Les cellules de l'épididyme ont-elles des cils vibratiles ou des stéréocils ?", verso: "Des **stéréocils** (PAS des cils vibratiles)\nStéréocils = expansions sans activité motrice, sans microtubules", order_index: 24 },
    { recto: "Quelle est la différence entre cils vibratiles et stéréocils ?", verso: "· **Cils vibratiles** : expansions mobiles, battements synchrones, contiennent un **axonème** (microtubules)\n· **Stéréocils** : expansions fines, irrégulières, **sans activité motrice**, **sans microtubules**", order_index: 25 },
    { recto: "La musculeuse de l'épididyme s'amincit-elle ou s'épaissit-elle de la tête à la queue ?", verso: "Elle **s'épaissit** de la tête à la queue\nAvec une organisation en **3 couches** dans sa partie terminale", order_index: 26 },
    { recto: "Quels sont les 3 rôles de l'épididyme ?", verso: "1. **Transport** des spermatozoïdes\n2. **Maturation** des spermatozoïdes\n3. **Stockage** (dans la queue)", order_index: 27 },
    { recto: "Combien de temps dure le transit épididymaire ?", verso: "**10 à 12 jours** chez les mammifères (hors temps de stockage)", order_index: 28 },
    { recto: "Combien de spermatozoïdes sont produits par jour ?", verso: "**45 à 207 millions** de spermatozoïdes par jour", order_index: 29 },
    { recto: "Quelle est la réserve épididymaire en spermatozoïdes ?", verso: "**182 millions** par épididyme :\n· 26% dans la tête\n· 23% dans le corps\n· **52% dans la queue** (réservoir principal)", order_index: 30 },
    { recto: "Où se fait la maturation du spermatozoïde dans l'épididyme ?", verso: "Dans la **tête et le corps** de l'épididyme\nLe stockage se fait dans la **queue**", order_index: 31 },
    { recto: "Quelles capacités le spermatozoïde acquiert-il lors de la maturation épididymaire ?", verso: "1. **Mobilité unidirectionnelle**\n2. Aptitude à se fixer sur la **zone pellucide** et la membrane ovocytaire\n3. Capacité à assurer un **développement embryonnaire normal**", order_index: 32 },
    { recto: "Quelle est la longueur du canal déférent ?", verso: "Environ **40 cm**, contenu dans le **cordon spermatique**", order_index: 33 },
    { recto: "Quelles sont les 3 tuniques du canal déférent ?", verso: "1. **Muqueuse mince** (épithélium prismatique pseudo-stratifié à stéréocils)\n2. **Musculeuse épaisse** (3 couches FML)\n3. **Adventice** (tissu conjonctif lâche élastique)", order_index: 34 },
    { recto: "Quelles sont les 3 couches de la musculeuse du canal déférent ?", verso: "· Couche interne **longitudinale**\n· Couche moyenne **circulaire**\n· Couche externe **longitudinale**", order_index: 35 },
    { recto: "Quel est le rôle du canal déférent lors de l'éjaculation ?", verso: "Les plis muqueux se distendent → passage des spermatozoïdes\nLa musculeuse émet des **ondes péristaltiques puissantes et brèves**\n→ Expulsion rapide sous contrôle **orthosympathique adrénergique**", order_index: 36 },
    { recto: "Le canal déférent fait-il suite aux tubes droits ou au canal épididymaire ?", verso: "Au **canal épididymaire** (PAS aux tubes droits)\nLes tubes droits sont des voies intra-testiculaires", order_index: 37 },
    { recto: "Qu'est-ce que l'ampoule déférentielle ?", verso: "**Région dilatée** terminale du canal déférent où s'abouchent les **vésicules séminales**", order_index: 38 },
    { recto: "Quelles sont les dimensions du canal éjaculateur ?", verso: "**2 cm** de long pour **2 cm** de diamètre\nIl pénètre dans le tissu prostatique et rejoint l'urètre prostatique", order_index: 39 },
    { recto: "Quels sont les 3 segments de l'urètre masculin ?", verso: "1. **Urètre prostatique**\n2. **Urètre membraneux** (périnéal)\n3. **Urètre spongieux** (pénien)", order_index: 40 },
    { recto: "Quelle est la longueur de l'urètre masculin ?", verso: "**20 à 25 cm**\nDouble rôle : évacuation urine + véhicule du sperme", order_index: 41 },
    { recto: "Quelles sont les glandes génitales annexes masculines ?", verso: "· **Vésicules séminales**\n· **Prostate**\n· **Glandes bulbo-urétrales**", order_index: 42 },
    { recto: "Décrire l'histologie des vésicules séminales", verso: "Organes pairs, tubes pelotonnés\nÉpithélium **prismatique/cylindrique simple**\nCellules principales **glandulaires** + cellules basales\nMuqueuse à **nombreux replis** (augmentent la surface d'échange)", order_index: 43 },
    { recto: "Quel est le marqueur biochimique des vésicules séminales ?", verso: "Le **fructose** : assure la nutrition et la mobilité des spermatozoïdes", order_index: 44 },
    { recto: "Quel pourcentage de l'éjaculat est sécrété par les vésicules séminales ?", verso: "**50-80%** du volume de l'éjaculat (environ 2,5 mL)\npH **alcalin**", order_index: 45 },
    { recto: "La sécrétion des vésicules séminales est-elle androgéno-dépendante ?", verso: "<b>Oui</b>, elle dépend de la **testostérone**", order_index: 46 },
    { recto: "Citer les composants du plasma séminal produit par les vésicules séminales", verso: "· Eau et électrolytes\n· **Fructose** (marqueur)\n· Protéines (lactoferrine, lysozyme)\n· Immunosuppresseur\n· Facteur de dé-capacitation\n· Facteur de coagulation\n· **Prostaglandines**\n· Vitamine C", order_index: 47 },
    { recto: "Quel est l'aspect macroscopique de la prostate ?", verso: "Organe **musculo-glandulaire** de la taille d'une petite **châtaigne**\nSituée à la partie inférieure de la **vessie**\nEntoure l'**urètre prostatique**", order_index: 48 },
    { recto: "La prostate est-elle une glande exocrine ou endocrine ?", verso: "**Exocrine** ! Elle sécrète le liquide prostatique vers l'extérieur (dans l'urètre)", order_index: 49 },
    { recto: "Quels sont les 2 sphincters de la prostate ?", verso: "· **Sphincter interne (lisse)** : empêche l'écoulement spontané de l'urine\n· **Sphincter externe (strié)** : acte volontaire de la miction", order_index: 50 },
    { recto: "Quels sont les 3 groupes de glandes prostatiques ?", verso: "1. Glandes **péri-urétrales internes**\n2. Glandes **péri-urétrales externes**\n3. Glandes **principales** (essentiel de la sécrétion)", order_index: 51 },
    { recto: "Quelle est la différence entre excrétion mérocrine et apocrine ?", verso: "· **Mérocrine** : exocytose en **respectant** la membrane cellulaire\n· **Apocrine** : les grains de sécrétion entraînent le pôle apical, **ne respecte PAS** la membrane", order_index: 52 },
    { recto: "Que sont les corps de Robin (sympexions) ?", verso: "Petits corps sphériques de **glycoprotéines** en lamelles concentriques dans la lumière des acini prostatiques\nTendance à la **calcification** après 40 ans → lithiase prostatique", order_index: 53 },
    { recto: "Quelle fraction de l'éjaculat est sécrétée par la prostate ?", verso: "Environ **1/6e** de l'éjaculat\nLiquide épais et blanc, pH légèrement **acide**", order_index: 54 },
    { recto: "Citer les composants de la sécrétion prostatique", verso: "· Facteur de **liquéfaction** du sperme\n· **Spermine** et spermidine\n· Albumine\n· Enzymes protéolytiques (fibrinolysine)\n· **Acide citrique**\n· Phosphatase acide\n· Ions (Zn, Mg, Ca)", order_index: 55 },
    { recto: "La sécrétion prostatique est-elle androgéno-dépendante ?", verso: "<b>Oui</b>, les cellules glandulaires ont des **récepteurs aux androgènes**", order_index: 56 },
    { recto: "Quel est le rôle des glandes bulbo-urétrales ?", verso: "**Lubrification de l'urètre** avant l'éjaculation\nSécrètent un liquide mucoïde, androgéno-dépendant", order_index: 57 },
    { recto: "VRAI ou FAUX : l'épididyme est une voie intra-testiculaire", verso: "<b>FAUX</b>\nL'épididyme est une voie **extra-testiculaire**\nLes voies intra-testiculaires sont les tubes droits et le rete testis", order_index: 58 },
    { recto: "VRAI ou FAUX : l'épithélium de l'épididyme est cubique simple", verso: "<b>FAUX</b>\nL'épithélium de l'épididyme est **prismatique pseudo-stratifié**", order_index: 59 },
    { recto: "Où est le lieu de stockage des spermatozoïdes dans l'épididyme ?", verso: "Dans la **queue (cauda)** de l'épididyme\n(**52%** de la réserve épididymaire)", order_index: 60 },
    { recto: "La hauteur des stéréocils de l'épithélium épididymaire diminue-t-elle ou augmente-t-elle de la tête à la queue ?", verso: "Elle **diminue** de la tête vers la queue de l'épididyme\nLa hauteur des cellules épithéliales diminue aussi", order_index: 61 },
    { recto: "Sous quel contrôle nerveux fonctionne l'éjaculation au niveau du canal déférent ?", verso: "Sous contrôle de fibres **orthosympathiques adrénergiques** abondantes à la fin de l'épididyme et le long du canal déférent", order_index: 62 },
    { recto: "Le canal épididymaire fait-il suite au canal déférent ou aux cônes efférents ?", verso: "Aux **cônes efférents** (canaux efférents)\nC'est le canal déférent qui fait suite au canal épididymaire (pas l'inverse)", order_index: 63 },
    { recto: "À la naissance, où sont normalement situés les testicules ?", verso: "Dans le **scrotum** (PAS dans la région inguinale)\nLa descente testiculaire se fait pendant la vie foetale", order_index: 64 },
    { recto: "Quel fixateur rattache le pôle inférieur du testicule au scrotum ?", verso: "Le **gubernaculum testis**", order_index: 65 },
    { recto: "Combien de glandes tubulo-alvéolaires la prostate contient-elle ?", verso: "Environ **50** glandes tubulo-alvéolaires", order_index: 66 },
    { recto: "La lithiase prostatique a-t-elle un rôle pathologique particulier ?", verso: "<b>Non</b>, la lithiase prostatique (calcification des sympexions après 40 ans) n'a **pas** de rôle pathologique particulier", order_index: 67 },
    { recto: "Quelles cellules de l'épithélium des tubes séminifères sécrètent le liquide séminal primitif ?", verso: "Les **cellules de Sertoli**\nCe liquide pousse les spermatozoïdes dans les voies intra-testiculaires", order_index: 68 },
    { recto: "Quel est le diamètre des tubes droits ?", verso: "**25 um** de diamètre (segments courts à lumière étroite)", order_index: 69 },
    { recto: "Quel type d'épithélium possède le rete testis ?", verso: "Épithélium **pavimenteux**", order_index: 70 },
    { recto: "VRAI ou FAUX : les cellules de Leydig font partie de l'épithélium séminifère", verso: "<b>FAUX</b>\nLes cellules de Leydig font partie de l'**interstitium** (espace entre les tubes séminifères)", order_index: 71 },
    { recto: "VRAI ou FAUX : la prostate est une glande endocrine", verso: "<b>FAUX</b>\nLa prostate est une glande **exocrine**\nElle déverse ses sécrétions dans l'urètre prostatique", order_index: 72 },
    { recto: "Comment évolue la pression intraluminale dans l'épididyme ?", verso: "Elle **décroît** de la tête à la queue\nCette pression contribue à la progression des spermatozoïdes", order_index: 73 },
    { recto: "Les canaux efférents traversent-ils l'albuginée ?", verso: "<b>Oui</b>, les canaux efférents **traversent l'albuginée** pour connecter le rete testis à l'épididyme", order_index: 74 },
    { recto: "Quel rôle jouent les prostaglandines contenues dans le plasma séminal ?", verso: "Elles provoquent des **contractions utérines** et favorisent la **migration des spermatozoïdes** dans les voies génitales féminines", order_index: 75 },
    { recto: "Quelles protéines du plasma séminal ont un pouvoir antibactérien ?", verso: "La **lactoferrine** et le **lysozyme** (sécrétés par les vésicules séminales)", order_index: 76 },
    { recto: "Qu'est-ce que le facteur de dé-capacitation ?", verso: "Protéine du plasma séminal qui **protège contre une capacitation prématurée** des spermatozoïdes\nLa capacitation aura lieu dans les voies génitales féminines", order_index: 77 },
    { recto: "Quel est le rôle du sphincter interne (lisse) de la prostate ?", verso: "Sa **tonicité** empêche l'**écoulement spontané** de l'urine provenant de la vessie\nIl empêche aussi l'éjaculation rétrograde", order_index: 78 },
    { recto: "Quel est le rôle du sphincter externe (strié) de la prostate ?", verso: "Il permet l'**acte volontaire de la miction**\nFormé de fibres musculaires striées", order_index: 79 },
    { recto: "Résumer la composition du sperme par origine des sécrétions", verso: "· **Vésicules séminales** : 50-80% (fructose, pH alcalin)\n· **Prostate** : ~1/6e (enzymes, pH acide)\n· **Épididyme** : 5%\n· **Glandes bulbo-urétrales** : lubrification\n· **Spermatozoïdes** : petit volume", order_index: 80 },
    { recto: "VRAI ou FAUX : la musculeuse de l'épididyme s'amincit de la tête à la queue", verso: "<b>FAUX</b>\nElle **s'épaissit** progressivement de la tête à la queue avec une organisation en **3 couches** dans sa partie terminale", order_index: 81 },
    { recto: "Les cellules principales de l'épithélium épididymaire ont-elles des microvillosités ?", verso: "<b>Non</b>, elles ont des **stéréocils** (PAS des microvillosités)\nLes stéréocils sont des expansions fines et irrégulières sans activité motrice", order_index: 82 },
    { recto: "Quel est le pH du liquide prostatique ?", verso: "pH légèrement **acide**\n(contrairement au plasma séminal global qui est alcalin grâce aux vésicules séminales)", order_index: 83 },
    { recto: "Quelle est la substance responsable de la liquéfaction du sperme ?", verso: "Le **facteur de liquéfaction** contenu dans les sécrétions prostatiques (enzymes protéolytiques comme la fibrinolysine)", order_index: 84 },
    { recto: "Toutes les sécrétions de l'appareil génital masculin sont-elles androgéno-dépendantes ?", verso: "<b>Oui</b>, les sécrétions des vésicules séminales, de la prostate et des glandes bulbo-urétrales sont toutes **androgéno-dépendantes** (dépendent de la testostérone)", order_index: 85 },
    { recto: "Le canal éjaculateur perd-il sa musculeuse en pénétrant dans la prostate ?", verso: "<b>Oui</b>, en pénétrant dans le tissu prostatique, le canal éjaculateur **perd sa musculeuse**", order_index: 86 },
    { recto: "Où s'ouvrent les canaux éjaculateurs dans l'urètre prostatique ?", verso: "De part et d'autre de l'**utricule prostatique** au niveau du colliculus séminal", order_index: 87 },
    { recto: "L'épithélium des vésicules séminales est-il un épithélium glandulaire ?", verso: "<b>Oui</b>, c'est un épithélium glandulaire\nIl contient des cellules principales **glandulaires** riches en grains de sécrétion", order_index: 88 },
    { recto: "Quelle est la répartition de la réserve spermatique dans l'épididyme ?", verso: "· Tête : **26%**\n· Corps : **23%**\n· Queue : **52%** (réservoir principal)", order_index: 89 },
    { recto: "Quel est le rôle des cils vibratiles dans les canaux efférents ?", verso: "Ils aident à la **progression des spermatozoïdes** en complément de la pression du liquide séminal et des contractions péristaltiques", order_index: 90 },
  ],
  annales: [
    {
      titre: 'Annale 2022/2023 Session 1 — Histologie Appareil génital masculin',
      annee: '2022-2023',
      rappel_cours: "**Testicule** : enveloppé par l'albuginée (capsule conjonctive). Le corps de Highmore = épaississement de l'albuginée. Double fonction : exocrine (spermatogenèse) + endocrine (androgènes). Cellules de Sertoli dans les tubes séminifères, cellules de Leydig dans l'interstitium. Testicules dans le scrotum à la naissance.\n\n**Épididyme** : voie extra-testiculaire, épithélium prismatique pseudo-stratifié à stéréocils (PAS cils vibratiles). Musculeuse s'épaissit de la tête à la queue. Stockage dans la queue.\n\n**Prostate** : glande exocrine (PAS endocrine). Sphincter interne (lisse) et externe (strié).",
      questions: [
        {
          enonce: "Parmi les propositions suivantes, indiquez la ou les proposition(s) exacte(s)",
          items: [
            { lettre: 'A', enonce: "Le testicule est enveloppé d'une capsule conjonctive appelée l'albuginée", is_correct: true },
            { lettre: 'B', enonce: "Le testicule a une fonction uniquement exocrine", is_correct: false },
            { lettre: 'C', enonce: "Entre albuginée et corps d'Highmore sont tendues des cloisons radiaires ou septa", is_correct: true },
            { lettre: 'D', enonce: "A la naissance les testicules sont situés dans la région inguinale", is_correct: false },
            { lettre: 'E', enonce: "Les cellules de Sertoli se situent dans l'espace interstitiel", is_correct: false },
          ],
          correction: "**Réponse : AC**\n\nA. **VRAI** — L'albuginée est la capsule conjonctive blanche qui enveloppe le testicule.\nB. **FAUX** — Le testicule a une double fonction : **exocrine** (spermatogenèse) ET **endocrine** (sécrétion d'androgènes).\nC. **VRAI** — Les septa (cloisons radiaires) sont tendues entre l'albuginée et le corps de Highmore.\nD. **FAUX** — À la naissance, les testicules sont normalement dans le **scrotum**.\nE. **FAUX** — Les cellules de Sertoli sont dans l'**épithélium des tubes séminifères**, pas dans l'espace interstitiel.",
        },
        {
          enonce: "Quelle est la réponse exacte ?",
          items: [
            { lettre: 'A', enonce: "L'épididyme est une voie intra-testiculaire", is_correct: false },
            { lettre: 'B', enonce: "L'épididyme a un épithélium cubique simple", is_correct: false },
            { lettre: 'C', enonce: "La partie terminale de l'épididyme est un lieu de stockage des spermatozoïdes", is_correct: true },
            { lettre: 'D', enonce: "La cellule de l'épithélium épididymaire est caractérisée par la présence de cils vibratiles", is_correct: false },
            { lettre: 'E', enonce: "La musculeuse de l'épididyme s'amincit progressivement de la tête à la queue avec une organisation en 1 couche dans sa partie terminale", is_correct: false },
          ],
          correction: "**Réponse : C**\n\nA. **FAUX** — L'épididyme est une voie **extra-testiculaire**.\nB. **FAUX** — L'épididyme a un épithélium **prismatique pseudo-stratifié**.\nC. **VRAI** — La queue de l'épididyme est le lieu de stockage des spermatozoïdes.\nD. **FAUX** — L'épithélium épididymaire a des **stéréocils** (PAS des cils vibratiles).\nE. **FAUX** — La musculeuse **s'épaissit** de la tête vers la queue (3 couches dans la partie terminale).",
        },
        {
          enonce: "Parmi les propositions suivantes, indiquez la ou les proposition(s) exacte(s)",
          items: [
            { lettre: 'A', enonce: "Le canal épididymaire fait suite aux cônes efférents", is_correct: true },
            { lettre: 'B', enonce: "L'épithélium des vésicules séminales est un épithélium glandulaire", is_correct: true },
            { lettre: 'C', enonce: "La prostate est une glande endocrine", is_correct: false },
            { lettre: 'D', enonce: "Le sphincter interne de la prostate est formé de fibres musculaires lisses", is_correct: true },
            { lettre: 'E', enonce: "Le canal déférent fait suite aux tubes droits", is_correct: false },
          ],
          correction: "**Réponse : ABD**\n\nA. **VRAI** — Le canal épididymaire fait suite aux cônes (canaux) efférents.\nB. **VRAI** — L'épithélium des vésicules séminales est glandulaire (cellules sécrétrices).\nC. **FAUX** — La prostate est une glande **exocrine** (PAS endocrine).\nD. **VRAI** — Le sphincter interne est formé de fibres musculaires lisses.\nE. **FAUX** — Le canal déférent fait suite au **canal épididymaire** (PAS aux tubes droits).",
        },
      ],
    },
    {
      titre: 'Annale 2021/2022 Session 1 — Histologie Appareil génital masculin',
      annee: '2021-2022',
      rappel_cours: "**Testicule** : capsule = albuginée (PAS le corps de Highmore qui est un épaississement de l'albuginée). Double fonction exocrine + endocrine. Cellules de Leydig dans l'interstitium. Testicules dans le scrotum à la naissance.\n\n**Épididyme** : épithélium prismatique pseudo-stratifié. Cellules principales avec **stéréocils** (PAS microvillosités). Musculeuse s'épaissit progressivement de la tête vers la queue.",
      questions: [
        {
          enonce: "Parmi les propositions suivantes, indiquez la ou les proposition(s) exacte(s)",
          items: [
            { lettre: 'A', enonce: "Le testicule est enveloppé d'une capsule conjonctive appelée corps de Highmore", is_correct: false },
            { lettre: 'B', enonce: "Le testicule a uniquement une fonction exocrine", is_correct: false },
            { lettre: 'C', enonce: "Les cellules de Leydig font parties de l'épithélium séminifère", is_correct: false },
            { lettre: 'D', enonce: "A la naissance les testicules sont situés normalement dans le scrotum", is_correct: true },
            { lettre: 'E', enonce: "Aucune des propositions précédentes n'est exacte", is_correct: false },
          ],
          correction: "**Réponse : D**\n\nA. **FAUX** — Le corps de Highmore est un **épaississement de l'albuginée**, pas la capsule elle-même. La capsule = albuginée.\nB. **FAUX** — Double fonction : exocrine (spermatogenèse) + endocrine (androgènes).\nC. **FAUX** — Les cellules de Leydig sont dans l'**interstitium** (PAS dans l'épithélium séminifère).\nD. **VRAI** — À la naissance, les testicules sont normalement dans le scrotum.\nE. **FAUX** — D est exacte.",
        },
        {
          enonce: "Parmi les propositions suivantes, indiquez la ou les proposition(s) exacte(s)",
          items: [
            { lettre: 'A', enonce: "Le canal épididymaire fait suite au canal déférent", is_correct: false },
            { lettre: 'B', enonce: "L'épithélium de l'épididyme est prismatique pseudo-stratifié", is_correct: true },
            { lettre: 'C', enonce: "Les cellules principales de l'épithélium épididymaire sont caractérisées par la présence de microvillosités", is_correct: false },
            { lettre: 'D', enonce: "La musculeuse de l'épididyme s'épaissit progressivement de la tête vers la queue", is_correct: true },
            { lettre: 'E', enonce: "Aucune des propositions précédentes n'est exacte", is_correct: false },
          ],
          correction: "**Réponse : BD**\n\nA. **FAUX** — C'est l'inverse : le canal **déférent** fait suite au canal épididymaire.\nB. **VRAI** — L'épithélium de l'épididyme est prismatique pseudo-stratifié.\nC. **FAUX** — Les cellules principales ont des **stéréocils** (PAS des microvillosités).\nD. **VRAI** — La musculeuse s'épaissit progressivement de la tête vers la queue.\nE. **FAUX** — B et D sont exactes.",
        },
      ],
    },
  ],
};

export default content;

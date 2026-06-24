import type { PriveCourseContent } from '../prive-courses';

const content: PriveCourseContent = {
  fiche: {
    parties: [
      {
        numero: 'I',
        titre: 'Rappels sur les épithéliums',
        sous_parties: [
          {
            titre: 'Épithélium de revêtement',
            rows: [
              {
                concept: '◆ Définition',
                detail_md: 'Tissu recouvrant les **surfaces externes et internes** du corps, les **cavités organiques** et les **conduits/canaux**',
                kind: 'a_retenir',
              },
              {
                concept: 'Épithéliums simples',
                detail_md: 'Composés d\'une **seule couche** de cellules, de hauteur variable :\n· **Aplaties (pavimenteux)** → adaptés à la **diffusion** (alvéoles pulmonaires, endothélium vasculaire, mésothélium)\n· **Cubiques** → revêtement de certains canaux\n· **Cylindriques (hautes)** → cellules **métaboliquement actives** riches en organites (intestin grêle)',
                kind: 'normal',
              },
              {
                concept: 'Épithéliums stratifiés et pseudostratifiés',
                detail_md: '· **Stratifiés** → plusieurs couches de cellules (ex : épiderme)\n· **Pseudostratifiés** → une seule couche mais noyaux à des niveaux différents donnant un **aspect stratifié** (ex : épididyme, canal déférent)',
                kind: 'normal',
              },
              {
                concept: 'Spécialisations de surface',
                detail_md: '· **Microvillosités** → augmentation de la surface d\'absorption\n· **Cils vibratiles** → battements synchrones, propulsion du mucus\n· **Stéréocils** → prolongements irréguliers, sans activité motrice, sans microtubules',
                kind: 'normal',
              },
              {
                concept: '⚠ Aplaties vs cylindriques',
                detail_md: 'Cellules **aplaties** = adaptées à la **diffusion passive** (échanges gazeux)\nCellules **cylindriques hautes** = cellules **très actives** (sécrétion, absorption)\nLa hauteur reflète l\'activité métabolique',
                kind: 'piege',
              },
            ],
          },
          {
            titre: 'Épithélium glandulaire',
            rows: [
              {
                concept: '◆ Glandes',
                detail_md: 'Ensemble de cellules épithéliales **spécialisées** qui produisent des **sécrétions**\n· Glandes **exocrines** → sécrétion vers une surface ou un canal\n· Glandes **endocrines** → sécrétion dans le sang',
                kind: 'a_retenir',
              },
              {
                concept: 'Modes d\'excrétion glandulaire',
                detail_md: '· **Mérocrine** (exocytose) → la membrane cellulaire est **respectée**\n· **Apocrine** → le pôle apical est **emporté** avec les grains de sécrétion\n· **Holocrine** → la cellule entière se **désintègre** pour libérer son contenu',
                kind: 'normal',
              },
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
              {
                concept: '◆ Localisation et morphologie',
                detail_md: 'Situés dans les **bourses (scrotum)**, forme **ovoïde**\nTaille : **4 cm** de long, poids : **10-15 g**\nPôle inférieur fixé par le **gubernaculum testis**\nPôle supérieur dans le prolongement du **cordon spermatique**',
                kind: 'a_retenir',
              },
              {
                concept: '◆ Albuginée testiculaire',
                detail_md: '**Capsule conjonctive blanche, épaisse et peu extensible** enveloppant le testicule\nAu pôle en regard de l\'épididyme, l\'albuginée s\'épaissit → **corps de Highmore**',
                kind: 'a_retenir',
              },
              {
                concept: 'Organisation lobulaire',
                detail_md: 'Entre albuginée et corps de Highmore : **cloisons radiaires (septa)** délimitant des **lobules communicants**\nChaque lobule contient **2-3 tubes séminifères** (longueur **30 cm à 1 m**, diamètre **150-300 μm**), entourés d\'une **membrane propre**',
                kind: 'normal',
              },
              {
                concept: '◆ Glande interstitielle',
                detail_md: 'Entre les tubes séminifères : **TC lâche**, vaisseaux sanguins et lymphatiques, nerfs, et **cellules de Leydig**\nCellules de Leydig → sécrétion de **testostérone** = fonction **endocrine** du testicule',
                kind: 'a_retenir',
              },
              {
                concept: '◆ Double fonction du testicule',
                detail_md: 'Le testicule est une glande **mixte** :\n· **Exocrine** → production de spermatozoïdes (tubes séminifères)\n· **Endocrine** → sécrétion de testostérone (cellules de Leydig)',
                kind: 'a_retenir',
              },
              {
                concept: '⚠ Sertoli vs Leydig : localisation',
                detail_md: '· **Cellules de Sertoli** → dans l\'**épithélium des tubes séminifères** (soutien de la spermatogenèse)\n· **Cellules de Leydig** → dans le **tissu interstitiel** entre les tubes\nPiège QCM : ne pas inverser leurs localisations !',
                kind: 'piege',
              },
              {
                concept: '⚠ À la naissance',
                detail_md: 'À la naissance, les testicules sont **déjà dans le scrotum** (et NON dans la région inguinale)\nLa descente testiculaire se fait pendant la vie fœtale',
                kind: 'piege',
              },
            ],
          },
          {
            titre: 'Spermatogenèse',
            rows: [
              {
                concept: '◆ Localisation',
                detail_md: 'Se déroule dans les **tubes séminifères** du testicule',
                kind: 'a_retenir',
              },
              {
                concept: '◆ Les 3 phases et leurs durées',
                detail_md: '1. Phase **proliférative** (mitoses) → **27 jours**\n2. Phase de **méiose** → **24 jours**\n3. **Spermiogenèse** (maturation des spermatides) → **23 jours**\nDurée totale : ~**74 jours**',
                kind: 'a_retenir',
              },
              {
                concept: 'Mnémo durées spermatogenèse',
                detail_md: '"**27-24-23**" → les durées descendent de 3 en 1 : **27**j (prolifération), **24**j (méiose), **23**j (spermiogenèse)',
                kind: 'mnemo',
              },
              {
                concept: 'Spermiogenèse : 4 modifications',
                detail_md: 'Transforme les spermatides en spermatozoïdes :\n· Formation de l\'**acrosome**\n· **Condensation nucléaire**\n· Développement du **flagelle**\n· Réorganisation du **cytoplasme**',
                kind: 'normal',
              },
              {
                concept: '◆ Spermatozoïdes à la sortie du testicule',
                detail_md: 'Les spermatozoïdes sont **NON fécondants** à la sortie du testicule :\n· Pas de **mobilité progressive**\n· Incapacité à **fixer la zone pellucide**\n· Incapacité de **réaction acrosomique**\n· Incapacité à **fusionner** avec l\'ovocyte\n→ Nécessité d\'une **maturation post-testiculaire** (épididymaire)',
                kind: 'a_retenir',
              },
            ],
          },
        ],
      },
      {
        numero: 'III',
        titre: 'L\'épididyme et acquisition des capacités fécondantes',
        sous_parties: [
          {
            titre: 'Voies spermatiques',
            rows: [
              {
                concept: '◆ Trajet complet des spermatozoïdes',
                detail_md: '**Tubes séminifères** → **Tubes droits** → **Rete testis** → **Canaux efférents** → **Canal épididymaire** → **Canal déférent** → **Canal éjaculateur** → **Urètre**',
                kind: 'a_retenir',
              },
              {
                concept: 'Mnémo trajet spermatozoïdes',
                detail_md: '"**Tu Te Rendras Compte Encore Demain** qu\'**Éjaculer** c\'est par l\'**Urètre**"\n→ **T**ubes séminifères, **T**ubes droits, **R**ete testis, **C**anaux efférents, **É**pididyme, **D**éférent, **É**jaculateur, **U**rètre',
                kind: 'mnemo',
              },
              {
                concept: 'Tubes droits',
                detail_md: 'Segments courts à lumière étroite (**25 μm** de diamètre)\nÉpithélium **cubique**\nJonction entre tubes séminifères et rete testis',
                kind: 'normal',
              },
              {
                concept: '◆ Rete testis',
                detail_md: '**Réseau labyrinthique** de canaux situé dans le **corps de Highmore**\nÉpithélium **pavimenteux**\nFonctions d\'**échange** contribuant à modifier la composition du **fluide testiculaire**',
                kind: 'a_retenir',
              },
              {
                concept: 'Progression des spermatozoïdes immatures',
                detail_md: 'Poussés par la **pression du liquide séminal primitif** sécrété par les **cellules de Sertoli**\nCe liquide est **remanié** lors du passage dans les tubes droits et le rete testis',
                kind: 'normal',
              },
            ],
          },
          {
            titre: 'Canaux efférents',
            rows: [
              {
                concept: '◆ Caractéristiques',
                detail_md: '**10-12 canaux/cônes efférents**, longueur ~**20 cm**, diamètre ~**0,2 mm**\nTraversent l\'**albuginée**, s\'enroulent en **spirale** de plus en plus large\nCône à tête testiculaire et à base épididymaire',
                kind: 'a_retenir',
              },
              {
                concept: '3 types cellulaires',
                detail_md: 'Épithélium **prismatique** comportant :\n· **Cellules ciliées** (cils vibratiles) → progression des spermatozoïdes\n· **Cellules glandulaires** → sécrétion de protéines\n· **Cellules basales** de renouvellement',
                kind: 'normal',
              },
              {
                concept: '◆ Réabsorption et progression',
                detail_md: '**Réabsorption du fluide testiculaire** (eau et Na⁺) → **concentration** des spermatozoïdes\n**Contractions péristaltiques** de la musculeuse lisse participent au transit\nLes cils vibratiles **aident à la progression**',
                kind: 'a_retenir',
              },
            ],
          },
          {
            titre: 'Canal épididymaire',
            rows: [
              {
                concept: '◆ Morphologie',
                detail_md: 'Tube **pelotonné** de **3 à 6 m** de long chez l\'homme\n3 segments : **tête (caput)**, **corps**, **queue (cauda)**',
                kind: 'a_retenir',
              },
              {
                concept: '◆ Épithélium',
                detail_md: 'Épithélium **prismatique pseudostratifié** :\n· **Cellules principales** → **stéréocils**, organites de synthèse (REG, Golgi), vésicules de pinocytose/endocytose, lysosomes\n· **Cellules basales** → renouvellement\nMembrane basale, TC lâche en dessous',
                kind: 'a_retenir',
              },
              {
                concept: '⚠ Stéréocils vs cils vibratiles',
                detail_md: '**Stéréocils** (épididyme) : expansions cytoplasmiques **fines**, **irrégulières**, parfois anastomosées, **SANS activité motrice**, **SANS microtubules**\n**Cils vibratiles** : expansions mobiles avec **battements synchrones**, possèdent un **axonème** (doublets de microtubules), un **corpuscule basal** et une **plaque basale**\nPiège : l\'épididyme a des **stéréocils**, PAS des cils vibratiles !',
                kind: 'piege',
              },
              {
                concept: 'Musculeuse épididymaire',
                detail_md: 'CML s\'**épaississant progressivement** de la tête vers la queue\nPartie terminale : **3 couches** de CML',
                kind: 'normal',
              },
              {
                concept: '⚠ Épaississement de la musculeuse',
                detail_md: 'La musculeuse **s\'épaissit** de la tête vers la queue (et **non** l\'inverse)\nLa **hauteur des cellules** et la **taille des stéréocils** **diminuent** de la tête vers la queue\nPièges classiques en QCM !',
                kind: 'piege',
              },
              {
                concept: '◆ Rôles de l\'épididyme',
                detail_md: '· **Transport** des spermatozoïdes\n· **Maturation** (essentiellement dans la **tête et le corps**)\n· **Stockage** et **survie** (dans la **queue**)',
                kind: 'a_retenir',
              },
            ],
          },
          {
            titre: 'Transit et maturation épididymaire',
            rows: [
              {
                concept: '◆ Durée du transit',
                detail_md: '**10-12 jours** chez les mammifères (excluant les temps de stockage)\nProgression sous la dépendance de :\n· **Pression intraluminale** (décroît de la tête à la queue)\n· **Contractions des CML**',
                kind: 'a_retenir',
              },
              {
                concept: '◆ Production et réserve',
                detail_md: 'Production : **45-207 millions** de spermatozoïdes/jour\nRéserve épididymaire : **182 millions**/épididyme :\n· **26%** dans la tête\n· **23%** dans le corps\n· **52%** dans la queue',
                kind: 'a_retenir',
              },
              {
                concept: '◆ Acquisitions de la maturation',
                detail_md: 'Phénomène **progressif et séquentiel** qui confère :\n· **Mobilité unidirectionnelle**\n· Aptitude à se **fixer sur la zone pellucide** et la membrane ovocytaire\n· Capacité d\'assurer un **développement embryonnaire normal**',
                kind: 'a_retenir',
              },
              {
                concept: 'Mécanisme de la maturation',
                detail_md: 'Résulte d\'une **interaction** entre les **sécrétions épididymaires** et les spermatozoïdes\nL\'environnement est **variable** selon les régions (tête, corps, queue)\nLes spermatozoïdes sont **transformés progressivement** d\'un état immature à mature',
                kind: 'normal',
              },
            ],
          },
        ],
      },
      {
        numero: 'IV',
        titre: 'Canal déférent',
        sous_parties: [
          {
            titre: 'Structure et fonction',
            rows: [
              {
                concept: '◆ Morphologie',
                detail_md: 'Tube **droit** d\'environ **40 cm** de long, contenu dans le **cordon spermatique**\nFait suite au **canal épididymaire** → transporte les spermatozoïdes vers l\'urètre via le **canal éjaculateur**',
                kind: 'a_retenir',
              },
              {
                concept: '⚠ Le canal déférent fait suite au canal épididymaire',
                detail_md: 'Il fait suite au **canal épididymaire** (et NON aux tubes droits !)\nPiège fréquent en QCM : les tubes droits font la jonction entre tubes séminifères et rete testis',
                kind: 'piege',
              },
              {
                concept: '◆ 3 tuniques du canal déférent',
                detail_md: '· **Muqueuse** mince → épithélium **prismatique pseudostratifié** avec **stéréocils** + chorion glandulaire\n· **Musculeuse épaisse** → 3 couches CML : **longitudinale interne**, **circulaire moyenne**, **longitudinale externe**\n· **Adventice** → TC lâche élastique, vascularisé et innervé',
                kind: 'a_retenir',
              },
              {
                concept: 'Mnémo couches musculeuse déférent',
                detail_md: '"**LCL**" = **L**ongitudinale interne, **C**irculaire moyenne, **L**ongitudinale externe\nMusculeuse du canal déférent en 3 couches',
                kind: 'mnemo',
              },
              {
                concept: 'Rôle lors de l\'éjaculation',
                detail_md: '· Les **plis muqueux se distendent** → passage des spermatozoïdes stockés dans la queue de l\'épididyme\n· Musculeuse → **ondes péristaltiques puissantes et brèves** → expulsion rapide\n· Contrôle par fibres **orthosympathiques adrénergiques**',
                kind: 'normal',
              },
              {
                concept: '◆ Terminaison et canal éjaculateur',
                detail_md: 'Le canal déférent se dilate en **ampoule déférentielle** → s\'abouchent les **vésicules séminales**\n**Canal éjaculateur** : **2 cm** de long\nPénètre dans le tissu prostatique en **perdant sa musculeuse**\nRejoignent l\'**urètre prostatique** de part et d\'autre de l\'**utricule prostatique**',
                kind: 'a_retenir',
              },
            ],
          },
          {
            titre: 'Urètre masculin',
            rows: [
              {
                concept: '◆ L\'urètre (canal uro-génital)',
                detail_md: 'De la partie inférieure de la **vessie** au **méat urogénital**\nLongueur : **20-25 cm**, comprend **3 segments** :\n· **Urètre prostatique**\n· **Urètre membraneux** (périnéal)\n· **Urètre spongieux** (pénien)',
                kind: 'a_retenir',
              },
              {
                concept: 'Paroi de l\'urètre',
                detail_md: '· **Muqueuse** → épithélium de structure variable + chorion conjonctivo-élastique vascularisé avec des **glandes muqueuses** lubrifiantes\n· **Musculeuse** → 2 couches : **longitudinale interne** et **circulaire externe**\n· **Adventice**',
                kind: 'normal',
              },
              {
                concept: 'Double fonction de l\'urètre',
                detail_md: '· **Évacuation de l\'urine** lors de la miction\n· **Véhicule du sperme** lors de l\'éjaculation',
                kind: 'normal',
              },
            ],
          },
        ],
      },
      {
        numero: 'V',
        titre: 'Les vésicules séminales et la prostate',
        sous_parties: [
          {
            titre: 'Vésicules séminales',
            rows: [
              {
                concept: '◆ Morphologie',
                detail_md: 'Organes **pairs**, en forme de **sac à paroi bosselée** (tubes pelotonnés)\nParoi : **muqueuse** (nombreux replis), **musculeuse** et **adventice**\nÉpithélium **prismatique/cylindrique simple**',
                kind: 'a_retenir',
              },
              {
                concept: '2 types cellulaires',
                detail_md: '· **Cellules principales glandulaires** → riches en grains de sécrétion\n· **Cellules basales**\nLes replis muqueux augmentent fortement la **surface d\'échange**',
                kind: 'normal',
              },
              {
                concept: 'Musculeuse des vésicules séminales',
                detail_md: '**2 couches** de CML :\n· Couche interne **circulaire**\n· Couche externe **longitudinale**',
                kind: 'normal',
              },
              {
                concept: '◆ Plasma séminal des vésicules',
                detail_md: 'Constituent le **volume principal** de l\'éjaculat (~**2,5 mL**) soit **50-80%** du volume total\npH **alcalin**, sécrétion **androgéno-dépendante**',
                kind: 'a_retenir',
              },
              {
                concept: '◆ Composition du liquide séminal',
                detail_md: '· Eau, électrolytes\n· **Fructose** = **MARQUEUR des VS** (nutrition et mobilité des spermatozoïdes)\n· Protéines : **lactoferrine**, **lysozyme** (antibactérien), **immunosuppresseur**, facteur de **dé-capacitation**, facteur de **coagulation**\n· **Prostaglandines** → contractions utérines et migration spermatozoïdes\n· **Vitamine C**',
                kind: 'a_retenir',
              },
              {
                concept: '⚠ Fructose = marqueur spécifique des VS',
                detail_md: 'Le **fructose** est le marqueur **spécifique** des vésicules séminales\nNe pas confondre avec le glucose !\nSi présent dans un bilan → signe l\'apport des vésicules séminales',
                kind: 'piege',
              },
            ],
          },
          {
            titre: 'Prostate',
            rows: [
              {
                concept: '◆ Morphologie',
                detail_md: 'Organe **musculo-glandulaire**, taille et forme d\'une **petite châtaigne**\nSituée à la partie inférieure de la **vessie** = **carrefour uro-génital**\nEntoure l\'**urètre prostatique**\nCapsule **fibro-élastique** → cloisons → **lobules**',
                kind: 'a_retenir',
              },
              {
                concept: '⚠ Prostate = glande EXOCRINE',
                detail_md: 'La prostate est une glande **EXOCRINE** (sécrète dans l\'urètre prostatique)\nElle n\'est **PAS** endocrine\nPiège très fréquent en QCM !',
                kind: 'piege',
              },
              {
                concept: '◆ 2 sphincters prostatiques',
                detail_md: '· **Sphincter interne (lisse)** → sa tonicité empêche l\'écoulement **spontané** de l\'urine\n· **Sphincter externe (strié)** → contrôle **volontaire** de la miction',
                kind: 'a_retenir',
              },
              {
                concept: '◆ Organisation glandulaire',
                detail_md: '~**50 glandes tubulo-alvéolaires** dans un stroma conjonctif riche en FML, fibres élastiques, vaisseaux et nerfs\n**3 groupes concentriques** :\n· Glandes **péri-urétrales internes**\n· Glandes **péri-urétrales externes**\n· Glandes **principales** (essentiel de la sécrétion)',
                kind: 'a_retenir',
              },
              {
                concept: 'Épithélium glandulaire prostatique',
                detail_md: '· **Cellules sécrétrices** de hauteur variable (prismatiques, cubiques, voire aplaties)\n· **Cellules basales** de remplacement\nExcrétion **mérocrine** (respecte la membrane) et **apocrine** (emporte le pôle apical)',
                kind: 'normal',
              },
              {
                concept: '◆ Hormono-dépendance',
                detail_md: 'Les cellules glandulaires possèdent des **récepteurs aux androgènes** → glande **androgéno-dépendante**',
                kind: 'a_retenir',
              },
              {
                concept: '◆ Corps de Robin (sympexions)',
                detail_md: 'Petits **corps sphériques** de **lamelles concentriques** de **glycoprotéines** dans la lumière des tubulo-acini\nÀ partir de **40 ans** → tendance à la **calcification** → **lithiase prostatique** (généralement sans rôle pathologique particulier)',
                kind: 'a_retenir',
              },
              {
                concept: '◆ Sécrétion prostatique',
                detail_md: 'Liquide **épais et blanc**, riche en protéines :\n· ~**1/6** de l\'éjaculat, pH **légèrement acide**\n· **Facteur de liquéfaction** du sperme\n· **Spermine/spermidine**, albumine\n· Enzymes : **fibrinolysine** (protéolyse)\n· **Acide citrique**, **phosphatase acide**\n· Ions : **Zn²⁺**, Mg²⁺, Ca²⁺\nSécrétion **androgéno-dépendante**',
                kind: 'a_retenir',
              },
            ],
          },
          {
            titre: 'Glandes bulbo-urétrales et composition du sperme',
            rows: [
              {
                concept: '◆ Glandes bulbo-urétrales (de Cowper)',
                detail_md: '**2 petites glandes tubulo-acineuses**, taille d\'un **petit pois**\nCapsule **conjonctivo-élastique**, stroma riche en FML et fibres élastiques\nSécrètent un **liquide mucoïde** → **lubrification** de l\'urètre\nSécrétion **androgéno-dépendante**',
                kind: 'a_retenir',
              },
              {
                concept: '◆ Les 3 glandes annexes androgéno-dépendantes',
                detail_md: '· **Vésicules séminales** → fructose, 50-80% de l\'éjaculat\n· **Prostate** → phosphatase acide, Zn²⁺, 1/6 de l\'éjaculat\n· **Glandes bulbo-urétrales** → liquide mucoïde, lubrification',
                kind: 'a_retenir',
              },
              {
                concept: 'Mnémo marqueurs des glandes',
                detail_md: '"**FruVéS, ZinPro**" :\n· **Fru**ctose → **Vé**sicules **S**éminales\n· **Zin**c → **Pro**state',
                kind: 'mnemo',
              },
              {
                concept: 'Séquence éjaculatoire',
                detail_md: 'Les différentes sécrétions sont émises dans un **ordre séquentiel** lors de l\'éjaculation\nLe liquide bulbo-urétral **précède** l\'arrivée du sperme\n(L\'origine précise de chaque composé n\'est pas à apprendre)',
                kind: 'normal',
              },
            ],
          },
        ],
      },
    ],
    points_cles: [
      'Le testicule est une glande MIXTE : exocrine (spermatozoïdes dans les tubes séminifères) et endocrine (testostérone par les cellules de Leydig dans le tissu interstitiel)',
      'Les cellules de Sertoli sont dans l\'épithélium des tubes séminifères, les cellules de Leydig dans le tissu interstitiel — ne pas inverser',
      'La spermatogenèse comporte 3 phases : proliférative (27j), méiose (24j) et spermiogenèse (23j) — durée totale ~74 jours',
      'Les spermatozoïdes sont NON fécondants à la sortie du testicule — maturation épididymaire nécessaire',
      'Trajet : tubes séminifères → tubes droits → rete testis → canaux efférents → épididyme → canal déférent → canal éjaculateur → urètre',
      'L\'épididyme possède des STÉRÉOCILS (pas des cils vibratiles), sa musculeuse s\'épaissit de la tête vers la queue',
      'Maturation épididymaire dans la tête et le corps, stockage dans la queue (52% de la réserve de 182 millions de spz)',
      'Le canal déférent fait suite au CANAL ÉPIDIDYMAIRE (et non aux tubes droits) — 3 couches musculaires LCL',
      'Le fructose est le marqueur spécifique des vésicules séminales qui fournissent 50-80% du volume de l\'éjaculat',
      'La prostate est une glande EXOCRINE (pas endocrine), hormono-dépendante, avec ~50 glandes tubulo-alvéolaires',
      'Corps de Robin (sympexions) : glycoprotéines lamellaires dans les acini prostatiques, se calcifient après 40 ans',
      'Les 3 glandes annexes (VS, prostate, glandes bulbo-urétrales) sont toutes androgéno-dépendantes',
    ],
    chiffres_cles: {
      titre: 'Chiffres clés - Histologie de l\'appareil génital masculin',
      markdown:
        '| Structure | Chiffre clé |\n|---|---|\n| Testicule | 4 cm de long, 10-15 g |\n| Tubes séminifères | 30 cm à 1 m de long, 150-300 μm de diamètre |\n| Spermatogenèse totale | ~74 jours (27 + 24 + 23) |\n| Phase proliférative | 27 jours |\n| Méiose | 24 jours |\n| Spermiogenèse | 23 jours |\n| Tubes droits | 25 μm de diamètre |\n| Canaux efférents | 10-12 canaux, 20 cm, 0,2 mm de diamètre |\n| Canal épididymaire | 3-6 m de long, 3 segments |\n| Transit épididymaire | 10-12 jours |\n| Production de spz | 45-207 millions/jour |\n| Réserve épididymaire | 182 millions (26% tête, 23% corps, 52% queue) |\n| Canal déférent | ~40 cm, 3 couches musculaires |\n| Canal éjaculateur | ~2 cm de long |\n| Urètre masculin | 20-25 cm, 3 segments |\n| Vésicules séminales | 50-80% de l\'éjaculat (~2,5 mL), pH alcalin |\n| Prostate | ~50 glandes tubulo-alvéolaires, 1/6 de l\'éjaculat |\n| Corps de Robin | Calcification après 40 ans |',
    },
  },

  flashcards: [
    {
      recto: 'Qu\'est-ce qu\'un <b>épithélium de revêtement</b> ?',
      verso: 'Tissu recouvrant les <b>surfaces externes et internes</b> du corps, les <b>cavités organiques</b> et les <b>conduits/canaux</b>',
      order_index: 1,
    },
    {
      recto: 'Quels sont les 3 types d\'<b>épithéliums simples</b> selon la hauteur des cellules ?',
      verso: '· <b>Aplaties (pavimenteux)</b> → diffusion (alvéoles, endothélium, mésothélium)\n· <b>Cubiques</b> → revêtement de canaux\n· <b>Cylindriques (hautes)</b> → cellules actives (intestin grêle)',
      order_index: 2,
    },
    {
      recto: 'Quelle est la différence entre un épithélium <b>stratifié</b> et <b>pseudostratifié</b> ?',
      verso: '<b>Stratifié</b> : plusieurs couches de cellules réelles\n<b>Pseudostratifié</b> : une seule couche mais noyaux à <b>différents niveaux</b> → aspect stratifié',
      order_index: 3,
    },
    {
      recto: 'Quelles sont les 3 <b>spécialisations de surface</b> des épithéliums ?',
      verso: '· <b>Microvillosités</b> → augmentation de surface d\'absorption\n· <b>Cils vibratiles</b> → battements synchrones, propulsion\n· <b>Stéréocils</b> → prolongements irréguliers, sans motricité',
      order_index: 4,
    },
    {
      recto: 'Quels sont les 3 <b>modes d\'excrétion</b> glandulaire ?',
      verso: '· <b>Mérocrine</b> → membrane cellulaire respectée (exocytose)\n· <b>Apocrine</b> → pôle apical emporté\n· <b>Holocrine</b> → cellule entière désintégrée',
      order_index: 5,
    },
    {
      recto: 'Où sont situés les <b>testicules</b> et quelles sont leurs dimensions ?',
      verso: 'Dans les <b>bourses (scrotum)</b>\nForme ovoïde, <b>~4 cm</b> de long, <b>10-15 g</b>\nPôle inférieur fixé par le <b>gubernaculum testis</b>',
      order_index: 6,
    },
    {
      recto: 'Qu\'est-ce que l\'<b>albuginée testiculaire</b> ?',
      verso: '<b>Capsule conjonctive blanche, épaisse et peu extensible</b> enveloppant le testicule',
      order_index: 7,
    },
    {
      recto: 'Qu\'est-ce que le <b>corps de Highmore</b> ?',
      verso: '<b>Épaississement de l\'albuginée</b> au pôle du testicule en regard de l\'<b>épididyme</b>',
      order_index: 8,
    },
    {
      recto: 'Comment sont organisés les <b>lobules testiculaires</b> ?',
      verso: 'Délimités par des <b>septa/cloisons radiaires</b> entre albuginée et corps de Highmore\nLobules <b>communicants</b>\nChaque lobule contient <b>2-3 tubes séminifères</b>',
      order_index: 9,
    },
    {
      recto: 'Quelles sont les dimensions des <b>tubes séminifères</b> ?',
      verso: 'Longueur : <b>30 cm à 1 m</b>\nDiamètre : <b>150-300 μm</b>',
      order_index: 10,
    },
    {
      recto: 'Que contient la <b>glande interstitielle</b> du testicule ?',
      verso: '· <b>TC lâche</b>\n· Vaisseaux sanguins et lymphatiques\n· Nerfs\n· <b>Cellules de Leydig</b> (sécrétion de testostérone)',
      order_index: 11,
    },
    {
      recto: 'Quelles sont les <b>2 fonctions</b> du testicule ?',
      verso: 'Glande <b>mixte</b> :\n· <b>Exocrine</b> → production de spermatozoïdes (tubes séminifères)\n· <b>Endocrine</b> → sécrétion de testostérone (cellules de Leydig)',
      order_index: 12,
    },
    {
      recto: 'VRAI ou FAUX : Le testicule a <b>uniquement</b> une fonction exocrine.',
      verso: '<b>FAUX</b>\nLe testicule est une glande <b>mixte</b> : exocrine (spermatozoïdes) ET endocrine (testostérone)',
      order_index: 13,
    },
    {
      recto: 'Où se trouvent les <b>cellules de Sertoli</b> ?',
      verso: 'Dans l\'<b>épithélium des tubes séminifères</b>\n(PAS dans le tissu interstitiel !)',
      order_index: 14,
    },
    {
      recto: 'Où se trouvent les <b>cellules de Leydig</b> ?',
      verso: 'Dans le <b>tissu interstitiel</b> entre les tubes séminifères\n(PAS dans l\'épithélium séminifère !)',
      order_index: 15,
    },
    {
      recto: 'Quelle hormone sécrètent les <b>cellules de Leydig</b> ?',
      verso: 'La <b>testostérone</b> (fonction endocrine du testicule)',
      order_index: 16,
    },
    {
      recto: 'VRAI ou FAUX : À la naissance, les testicules sont dans la <b>région inguinale</b>.',
      verso: '<b>FAUX</b>\nÀ la naissance, les testicules sont normalement déjà dans le <b>scrotum</b>',
      order_index: 17,
    },
    {
      recto: 'Où se déroule la <b>spermatogenèse</b> ?',
      verso: 'Dans les <b>tubes séminifères</b> du testicule',
      order_index: 18,
    },
    {
      recto: 'Quelles sont les <b>3 phases</b> de la spermatogenèse et leurs durées ?',
      verso: '1. Phase <b>proliférative</b> (mitoses) → <b>27 jours</b>\n2. Phase de <b>méiose</b> → <b>24 jours</b>\n3. <b>Spermiogenèse</b> → <b>23 jours</b>\nTotal : ~<b>74 jours</b>',
      order_index: 19,
    },
    {
      recto: 'Quelles sont les <b>4 modifications</b> de la spermiogenèse ?',
      verso: '· Formation de l\'<b>acrosome</b>\n· <b>Condensation nucléaire</b>\n· Développement du <b>flagelle</b>\n· Réorganisation du <b>cytoplasme</b>',
      order_index: 20,
    },
    {
      recto: 'La <b>spermiogenèse</b> se situe avant ou après la méiose ?',
      verso: '<b>Après</b> la méiose\nC\'est la 3e et dernière phase de la spermatogenèse',
      order_index: 21,
    },
    {
      recto: 'Les spermatozoïdes sont-ils <b>fécondants</b> à la sortie du testicule ?',
      verso: '<b>NON</b>, à la sortie du testicule ils sont non fécondants :\n· Pas de mobilité progressive\n· Incapacité à fixer la zone pellucide\n· Incapacité de réaction acrosomique\n· Incapacité à fusionner avec l\'ovocyte',
      order_index: 22,
    },
    {
      recto: 'Où se fait la <b>maturation post-testiculaire</b> des spermatozoïdes ?',
      verso: 'Dans l\'<b>épididyme</b> (tête et corps)\nC\'est la <b>maturation épididymaire</b>',
      order_index: 23,
    },
    {
      recto: 'Quel est le <b>trajet complet</b> des spermatozoïdes ?',
      verso: '<b>Tubes séminifères</b> → <b>Tubes droits</b> → <b>Rete testis</b> → <b>Canaux efférents</b> → <b>Épididyme</b> → <b>Canal déférent</b> → <b>Canal éjaculateur</b> → <b>Urètre</b>',
      order_index: 24,
    },
    {
      recto: 'Donner le <b>mnémo</b> du trajet des spermatozoïdes.',
      verso: '"<b>Tu Te Rendras Compte Encore Demain</b> qu\'<b>Éjaculer</b> c\'est par l\'<b>Urètre</b>"\n→ <b>T</b>ubes séminifères, <b>T</b>ubes droits, <b>R</b>ete testis, <b>C</b>anaux efférents, <b>É</b>pididyme, <b>D</b>éférent, <b>É</b>jaculateur, <b>U</b>rètre',
      order_index: 25,
    },
    {
      recto: 'Quelles sont les caractéristiques des <b>tubes droits</b> ?',
      verso: 'Segments courts, lumière étroite : <b>25 μm</b> de diamètre\nÉpithélium <b>cubique</b>\nJonction entre tubes séminifères et rete testis',
      order_index: 26,
    },
    {
      recto: 'Qu\'est-ce que le <b>rete testis</b> ?',
      verso: '<b>Réseau labyrinthique</b> de canaux dans le <b>corps de Highmore</b>\nÉpithélium <b>pavimenteux</b>\nFonctions d\'<b>échange</b> et modification du fluide testiculaire',
      order_index: 27,
    },
    {
      recto: 'Comment les spermatozoïdes <b>immatures</b> progressent-ils dans les voies intra-testiculaires ?',
      verso: 'Par la <b>pression du liquide séminal primitif</b> sécrété par les <b>cellules de Sertoli</b>\n(Pas de mobilité propre à ce stade)',
      order_index: 28,
    },
    {
      recto: 'Combien y a-t-il de <b>canaux efférents</b> et quelles sont leurs dimensions ?',
      verso: '<b>10-12</b> canaux/cônes efférents\nLongueur : <b>20 cm</b>\nDiamètre : <b>0,2 mm</b>\nTraversent l\'<b>albuginée</b>',
      order_index: 29,
    },
    {
      recto: 'Quels sont les <b>3 types cellulaires</b> des canaux efférents ?',
      verso: '· <b>Cellules ciliées</b> (cils vibratiles) → progression des spermatozoïdes\n· <b>Cellules glandulaires</b> → sécrétion de protéines\n· <b>Cellules basales</b> de renouvellement',
      order_index: 30,
    },
    {
      recto: 'Quel phénomène se produit dans les <b>canaux efférents</b> ?',
      verso: '<b>Réabsorption du fluide testiculaire</b> (eau et Na⁺) → <b>concentration</b> des spermatozoïdes\n+ <b>modification</b> de la composition du fluide',
      order_index: 31,
    },
    {
      recto: 'L\'<b>épididyme</b> est-il une voie intra ou extra-testiculaire ?',
      verso: 'Voie spermatique <b>EXTRA-testiculaire</b>\n(PAS intra-testiculaire)',
      order_index: 32,
    },
    {
      recto: 'Quelle est la longueur du <b>canal épididymaire</b> ?',
      verso: 'Tube <b>pelotonné</b> de <b>3 à 6 m</b> chez l\'homme',
      order_index: 33,
    },
    {
      recto: 'Quels sont les <b>3 segments</b> de l\'épididyme ?',
      verso: '· <b>Tête (caput)</b>\n· <b>Corps</b>\n· <b>Queue (cauda)</b>',
      order_index: 34,
    },
    {
      recto: 'Quel type d\'<b>épithélium</b> possède le canal épididymaire ?',
      verso: 'Épithélium <b>prismatique pseudostratifié</b>\n(PAS cubique simple)',
      order_index: 35,
    },
    {
      recto: 'Quels sont les <b>2 types cellulaires</b> de l\'épithélium épididymaire ?',
      verso: '· <b>Cellules principales</b> → stéréocils, synthèse protéique (REG, Golgi), absorption (pinocytose)\n· <b>Cellules basales</b> → renouvellement',
      order_index: 36,
    },
    {
      recto: 'Quelle est la différence entre <b>stéréocils</b> et <b>cils vibratiles</b> ?',
      verso: '<b>Stéréocils</b> : expansions <b>irrégulières</b>, <b>sans activité motrice</b>, <b>sans microtubules</b>\n<b>Cils vibratiles</b> : expansions <b>mobiles</b>, battements <b>synchrones</b>, possèdent un <b>axonème</b> (microtubules)',
      order_index: 37,
    },
    {
      recto: 'L\'épididyme possède des <b>cils vibratiles</b> ou des <b>stéréocils</b> ?',
      verso: 'Des <b>stéréocils</b>\nPAS des cils vibratiles (piège classique en QCM)',
      order_index: 38,
    },
    {
      recto: 'VRAI ou FAUX : Les <b>stéréocils</b> possèdent des microtubules et un axonème.',
      verso: '<b>FAUX</b>\nLes stéréocils sont <b>sans microtubules</b> et <b>sans axonème</b>\n(Contrairement aux cils vibratiles)',
      order_index: 39,
    },
    {
      recto: 'Qu\'est-ce qu\'un <b>axonème</b> ?',
      verso: 'L\'axe du <b>cil vibratile</b> contenant des <b>doublets de microtubules</b>\nSéparé de la racine ciliaire par le <b>corpuscule basal</b> et la <b>plaque basale</b>',
      order_index: 40,
    },
    {
      recto: 'Comment évolue la <b>musculeuse</b> de l\'épididyme de la tête vers la queue ?',
      verso: 'La musculeuse <b>s\'épaissit</b> de la tête vers la queue\nPartie terminale : <b>3 couches</b> de CML',
      order_index: 41,
    },
    {
      recto: 'VRAI ou FAUX : La musculeuse de l\'épididyme <b>s\'amincit</b> de la tête vers la queue.',
      verso: '<b>FAUX</b>\nElle <b>s\'épaissit</b> de la tête vers la queue',
      order_index: 42,
    },
    {
      recto: 'Comment évoluent la <b>hauteur des cellules</b> et la <b>taille des stéréocils</b> dans l\'épididyme ?',
      verso: 'Elles <b>diminuent</b> de la tête vers la queue\n(Gradient inverse de la musculeuse qui s\'épaissit)',
      order_index: 43,
    },
    {
      recto: 'Quels sont les <b>3 rôles</b> de l\'épididyme ?',
      verso: '· <b>Transport</b> des spermatozoïdes\n· <b>Maturation</b> (tête et corps)\n· <b>Stockage</b> et survie (queue)',
      order_index: 44,
    },
    {
      recto: 'Quelle est la durée du <b>transit épididymaire</b> ?',
      verso: '<b>10-12 jours</b> chez les mammifères\n(Excluant les temps de stockage)',
      order_index: 45,
    },
    {
      recto: 'Quels sont les <b>2 facteurs</b> de progression des spermatozoïdes dans l\'épididyme ?',
      verso: '· <b>Pression intraluminale</b> (décroît de la tête à la queue)\n· <b>Contractions des CML</b>',
      order_index: 46,
    },
    {
      recto: 'Où a lieu la <b>maturation</b> des spermatozoïdes dans l\'épididyme ?',
      verso: 'Essentiellement dans la <b>tête</b> et le <b>corps</b> de l\'épididyme',
      order_index: 47,
    },
    {
      recto: 'Où se fait le <b>stockage</b> des spermatozoïdes dans l\'épididyme ?',
      verso: 'Dans la <b>queue (cauda)</b> de l\'épididyme\n(<b>52%</b> de la réserve totale)',
      order_index: 48,
    },
    {
      recto: 'Combien de spermatozoïdes sont <b>produits par jour</b> ?',
      verso: '<b>45-207 millions</b> de spermatozoïdes/jour',
      order_index: 49,
    },
    {
      recto: 'Quelle est la <b>réserve épididymaire</b> et sa répartition ?',
      verso: '<b>182 millions</b> par épididyme :\n· <b>26%</b> dans la tête\n· <b>23%</b> dans le corps\n· <b>52%</b> dans la queue',
      order_index: 50,
    },
    {
      recto: 'Quelles <b>capacités</b> acquièrent les spermatozoïdes lors de la maturation épididymaire ?',
      verso: '· <b>Mobilité unidirectionnelle</b>\n· Aptitude à se <b>fixer sur la zone pellucide</b> et membrane ovocytaire\n· Capacité d\'assurer un <b>développement embryonnaire normal</b>',
      order_index: 51,
    },
    {
      recto: 'La maturation épididymaire est un phénomène <b>brutal</b> ou <b>progressif</b> ?',
      verso: 'Phénomène <b>progressif et séquentiel</b>\nRésulte de l\'<b>interaction</b> entre les sécrétions épididymaires et les spermatozoïdes',
      order_index: 52,
    },
    {
      recto: 'Quelle est la <b>longueur</b> du canal déférent ?',
      verso: 'Tube <b>droit</b> d\'environ <b>40 cm</b> de long\nContenu dans le <b>cordon spermatique</b>',
      order_index: 53,
    },
    {
      recto: 'Le canal déférent fait suite à quel canal ?',
      verso: 'Au <b>canal épididymaire</b>\n(PAS aux tubes droits — piège classique)',
      order_index: 54,
    },
    {
      recto: 'Quelles sont les <b>3 tuniques</b> du canal déférent ?',
      verso: '· <b>Muqueuse</b> → épithélium prismatique pseudostratifié à stéréocils\n· <b>Musculeuse épaisse</b> → 3 couches CML (LCL)\n· <b>Adventice</b> → TC lâche élastique',
      order_index: 55,
    },
    {
      recto: 'Quelles sont les <b>3 couches</b> de la musculeuse du canal déférent ?',
      verso: '· <b>Longitudinale interne</b>\n· <b>Circulaire moyenne</b>\n· <b>Longitudinale externe</b>\nMnémo : <b>LCL</b>',
      order_index: 56,
    },
    {
      recto: 'Quel est le rôle du canal déférent lors de l\'<b>éjaculation</b> ?',
      verso: '· Plis muqueux se <b>distendent</b> → passage des spz\n· Musculeuse → ondes <b>péristaltiques puissantes et brèves</b>\n· Contrôle par fibres <b>orthosympathiques adrénergiques</b>',
      order_index: 57,
    },
    {
      recto: 'Qu\'est-ce que l\'<b>ampoule déférentielle</b> ?',
      verso: '<b>Dilatation terminale</b> du canal déférent\nC\'est à ce niveau que s\'abouchent les <b>vésicules séminales</b>',
      order_index: 58,
    },
    {
      recto: 'Quelles sont les dimensions du <b>canal éjaculateur</b> ?',
      verso: '<b>2 cm</b> de long\nPénètre dans le tissu prostatique en <b>perdant sa musculeuse</b>\nRejoignent l\'<b>urètre prostatique</b>',
      order_index: 59,
    },
    {
      recto: 'Que devient la musculeuse du canal éjaculateur dans la <b>prostate</b> ?',
      verso: 'Le canal éjaculateur <b>perd sa musculeuse</b> en pénétrant dans le tissu prostatique',
      order_index: 60,
    },
    {
      recto: 'Quelle est la longueur de l\'<b>urètre masculin</b> et ses 3 segments ?',
      verso: '<b>20-25 cm</b> :\n· <b>Urètre prostatique</b>\n· <b>Urètre membraneux</b> (périnéal)\n· <b>Urètre spongieux</b> (pénien)',
      order_index: 61,
    },
    {
      recto: 'Quelles sont les <b>2 fonctions</b> de l\'urètre masculin ?',
      verso: '· <b>Évacuation de l\'urine</b> lors de la miction\n· <b>Véhicule du sperme</b> lors de l\'éjaculation',
      order_index: 62,
    },
    {
      recto: 'Combien de couches possède la <b>musculeuse de l\'urètre</b> ?',
      verso: '<b>2 couches</b> :\n· <b>Longitudinale interne</b>\n· <b>Circulaire externe</b>',
      order_index: 63,
    },
    {
      recto: 'Quelle est la <b>morphologie</b> des vésicules séminales ?',
      verso: 'Organes <b>pairs</b>, forme de <b>sac à paroi bosselée</b> (tubes pelotonnés)\nMuqueuse à <b>nombreux replis</b>',
      order_index: 64,
    },
    {
      recto: 'Quel type d\'<b>épithélium</b> revêt les vésicules séminales ?',
      verso: 'Épithélium <b>prismatique/cylindrique simple</b>',
      order_index: 65,
    },
    {
      recto: 'Quels sont les <b>2 types cellulaires</b> des vésicules séminales ?',
      verso: '· <b>Cellules principales glandulaires</b> → grains de sécrétion\n· <b>Cellules basales</b>',
      order_index: 66,
    },
    {
      recto: 'Combien de couches de CML possède la <b>musculeuse des vésicules séminales</b> ?',
      verso: '<b>2 couches</b> :\n· <b>Circulaire interne</b>\n· <b>Longitudinale externe</b>',
      order_index: 67,
    },
    {
      recto: 'Quel <b>pourcentage de l\'éjaculat</b> provient des vésicules séminales ?',
      verso: '<b>50-80%</b> du volume total (~<b>2,5 mL</b>)',
      order_index: 68,
    },
    {
      recto: 'Quel est le <b>pH</b> du liquide des vésicules séminales ?',
      verso: 'pH <b>alcalin</b>',
      order_index: 69,
    },
    {
      recto: 'La sécrétion des vésicules séminales est-elle <b>hormono-dépendante</b> ?',
      verso: 'Oui, elle est <b>androgéno-dépendante</b> (dépend de la testostérone)',
      order_index: 70,
    },
    {
      recto: 'Quel est le <b>marqueur spécifique</b> des vésicules séminales ?',
      verso: 'Le <b>fructose</b>\nRôles : <b>nutrition</b> et <b>mobilité</b> des spermatozoïdes',
      order_index: 71,
    },
    {
      recto: 'Quelles <b>protéines</b> contient le liquide des vésicules séminales ?',
      verso: '· <b>Lactoferrine</b> et <b>lysozyme</b> → pouvoir antibactérien\n· Facteur <b>immunosuppresseur</b> → immunodépression locale\n· Facteur de <b>dé-capacitation</b> → protège contre capacitation prématurée\n· Facteur de <b>coagulation</b> → rôle mécanique',
      order_index: 72,
    },
    {
      recto: 'Quel est le rôle des <b>prostaglandines</b> dans le liquide séminal ?',
      verso: '· Favorisent les <b>contractions utérines</b>\n· Facilitent la <b>migration des spermatozoïdes</b>',
      order_index: 73,
    },
    {
      recto: 'Quelle est la <b>morphologie</b> de la prostate ?',
      verso: 'Organe <b>musculo-glandulaire</b>\nTaille/forme d\'une <b>petite châtaigne</b>\nSituée sous la <b>vessie</b> = <b>carrefour uro-génital</b>\nEntoure l\'<b>urètre prostatique</b>',
      order_index: 74,
    },
    {
      recto: 'La prostate est une glande <b>exocrine</b> ou <b>endocrine</b> ?',
      verso: 'Glande <b>EXOCRINE</b>\n(Sécrète dans l\'urètre prostatique — PAS endocrine)',
      order_index: 75,
    },
    {
      recto: 'VRAI ou FAUX : La prostate est une glande <b>endocrine</b>.',
      verso: '<b>FAUX</b>\nLa prostate est une glande <b>EXOCRINE</b> (piège classique)',
      order_index: 76,
    },
    {
      recto: 'Quels sont les <b>2 sphincters</b> de la prostate et leur rôle ?',
      verso: '· Sphincter <b>interne (lisse)</b> → empêche l\'écoulement <b>spontané</b> d\'urine\n· Sphincter <b>externe (strié)</b> → contrôle <b>volontaire</b> de la miction',
      order_index: 77,
    },
    {
      recto: 'Le sphincter interne de la prostate est formé de fibres musculaires <b>lisses</b> ou <b>striées</b> ?',
      verso: 'De fibres musculaires <b>lisses</b>\n(Le sphincter externe est formé de fibres <b>striées</b>)',
      order_index: 78,
    },
    {
      recto: 'Combien de <b>glandes</b> contient la prostate et de quel type ?',
      verso: '~<b>50 glandes tubulo-alvéolaires</b>\nDans un stroma conjonctif riche en FML, fibres élastiques, vaisseaux et nerfs',
      order_index: 79,
    },
    {
      recto: 'Quels sont les <b>3 groupes concentriques</b> de glandes prostatiques ?',
      verso: '· Glandes <b>péri-urétrales internes</b>\n· Glandes <b>péri-urétrales externes</b>\n· Glandes <b>principales</b> (assurant l\'essentiel de la sécrétion)',
      order_index: 80,
    },
    {
      recto: 'Quels sont les <b>2 types cellulaires</b> de l\'épithélium glandulaire prostatique ?',
      verso: '· <b>Cellules sécrétrices</b> de hauteur variable\n· <b>Cellules basales</b> de remplacement',
      order_index: 81,
    },
    {
      recto: 'Quels sont les <b>2 types d\'excrétion</b> de l\'épithélium prostatique ?',
      verso: '· <b>Mérocrine</b> → la membrane cellulaire est <b>respectée</b>\n· <b>Apocrine</b> → le pôle apical est <b>emporté</b> avec les grains de sécrétion',
      order_index: 82,
    },
    {
      recto: 'La prostate est-elle <b>hormono-dépendante</b> ?',
      verso: 'Oui, elle possède des <b>récepteurs aux androgènes</b> → glande <b>androgéno-dépendante</b>',
      order_index: 83,
    },
    {
      recto: 'Que sont les <b>corps de Robin</b> (sympexions) ?',
      verso: 'Petits corps <b>sphériques</b> formés de <b>lamelles concentriques</b> de <b>glycoprotéines</b>\nPrésents dans la lumière des <b>tubulo-acini prostatiques</b>',
      order_index: 84,
    },
    {
      recto: 'Que deviennent les <b>corps de Robin</b> après 40 ans ?',
      verso: 'Ils ont tendance à se <b>calcifier</b>\n→ <b>lithiase prostatique</b>\n(Pas forcément de rôle pathologique particulier)',
      order_index: 85,
    },
    {
      recto: 'Quelle <b>proportion de l\'éjaculat</b> représente la sécrétion prostatique ?',
      verso: '~<b>1/6</b> de l\'éjaculat\nLiquide <b>épais et blanc</b>',
      order_index: 86,
    },
    {
      recto: 'Quel est le <b>pH</b> de la sécrétion prostatique ?',
      verso: 'pH <b>légèrement acide</b>\n(Contrairement aux vésicules séminales qui sont <b>alcalines</b>)',
      order_index: 87,
    },
    {
      recto: 'Quels sont les principaux <b>composants</b> de la sécrétion prostatique ?',
      verso: '· Facteur de <b>liquéfaction</b> du sperme\n· <b>Spermine/spermidine</b>, albumine\n· <b>Fibrinolysine</b> (enzyme protéolytique)\n· <b>Acide citrique</b>\n· <b>Phosphatase acide</b>\n· Ions : <b>Zn²⁺</b>, Mg²⁺, Ca²⁺',
      order_index: 88,
    },
    {
      recto: 'Quel <b>ion</b> est particulièrement abondant dans la sécrétion prostatique ?',
      verso: 'Le <b>zinc (Zn²⁺)</b>',
      order_index: 89,
    },
    {
      recto: 'Que sont les <b>glandes bulbo-urétrales</b> (de Cowper) ?',
      verso: '<b>2 glandes tubulo-acineuses</b>, taille d\'un <b>petit pois</b>\nCapsule <b>conjonctivo-élastique</b>\nSécrètent un <b>liquide mucoïde</b> → <b>lubrification</b> de l\'urètre',
      order_index: 90,
    },
    {
      recto: 'La sécrétion des glandes bulbo-urétrales est-elle <b>hormono-dépendante</b> ?',
      verso: 'Oui, elle est <b>androgéno-dépendante</b>',
      order_index: 91,
    },
    {
      recto: 'Le liquide bulbo-urétral est émis <b>avant</b> ou <b>après</b> le sperme lors de l\'éjaculation ?',
      verso: '<b>Avant</b> — il <b>précède</b> l\'arrivée du sperme et prépare l\'urètre',
      order_index: 92,
    },
    {
      recto: 'Quelles sont les <b>3 glandes annexes</b> de l\'appareil génital masculin ?',
      verso: '· <b>Vésicules séminales</b>\n· <b>Prostate</b>\n· <b>Glandes bulbo-urétrales</b> (de Cowper)\nToutes <b>androgéno-dépendantes</b>',
      order_index: 93,
    },
    {
      recto: 'Quels sont les <b>marqueurs biologiques</b> des vésicules séminales ?',
      verso: 'Le <b>fructose</b>',
      order_index: 94,
    },
    {
      recto: 'Quels sont les <b>marqueurs biologiques</b> de la prostate ?',
      verso: '· <b>Phosphatase acide</b>\n· <b>Acide citrique</b>\n· <b>Zinc (Zn²⁺)</b>\n· <b>Spermine</b>',
      order_index: 95,
    },
    {
      recto: 'Quel est le <b>volume total moyen</b> d\'un éjaculat ?',
      verso: '~<b>2,5 mL</b>\nDont <b>50-80%</b> provient des vésicules séminales',
      order_index: 96,
    },
    {
      recto: 'Quel est le rôle de la <b>lactoferrine</b> dans le liquide séminal ?',
      verso: 'Pouvoir <b>antibactérien</b>\n(Avec le lysozyme, protège contre les infections)',
      order_index: 97,
    },
    {
      recto: 'Quel est le rôle du <b>facteur de dé-capacitation</b> des vésicules séminales ?',
      verso: '<b>Protège</b> les spermatozoïdes contre une <b>capacitation prématurée</b>',
      order_index: 98,
    },
    {
      recto: 'Quel est le rôle de la <b>fibrinolysine</b> prostatique ?',
      verso: 'Enzyme protéolytique contribuant à la <b>liquéfaction du sperme</b> après éjaculation',
      order_index: 99,
    },
    {
      recto: 'VRAI ou FAUX : Le canal déférent fait suite aux <b>tubes droits</b>.',
      verso: '<b>FAUX</b>\nLe canal déférent fait suite au <b>canal épididymaire</b>',
      order_index: 100,
    },
    {
      recto: 'VRAI ou FAUX : L\'épithélium du canal épididymaire est un <b>épithélium cubique simple</b>.',
      verso: '<b>FAUX</b>\nL\'épithélium est <b>prismatique pseudostratifié</b>',
      order_index: 101,
    },
    {
      recto: 'VRAI ou FAUX : La <b>queue de l\'épididyme</b> est le lieu de stockage des spermatozoïdes.',
      verso: '<b>VRAI</b>\nLa queue stocke <b>52%</b> de la réserve totale',
      order_index: 102,
    },
    {
      recto: 'VRAI ou FAUX : Les cellules de Leydig font partie de l\'<b>épithélium séminifère</b>.',
      verso: '<b>FAUX</b>\nLes cellules de Leydig sont dans le <b>tissu interstitiel</b>\n(Ce sont les cellules de Sertoli qui sont dans l\'épithélium séminifère)',
      order_index: 103,
    },
    {
      recto: 'VRAI ou FAUX : Le testicule est enveloppé d\'une capsule appelée <b>corps de Highmore</b>.',
      verso: '<b>FAUX</b>\nLa capsule est l\'<b>albuginée testiculaire</b>\nLe corps de Highmore est un <b>épaississement</b> de l\'albuginée',
      order_index: 104,
    },
    {
      recto: 'Quel type d\'épithélium possède le <b>rete testis</b> ?',
      verso: 'Épithélium <b>pavimenteux</b>',
      order_index: 105,
    },
    {
      recto: 'Quel type d\'épithélium possèdent les <b>tubes droits</b> ?',
      verso: 'Épithélium <b>cubique</b>',
      order_index: 106,
    },
    {
      recto: 'Quel type d\'épithélium possède le <b>canal déférent</b> ?',
      verso: 'Épithélium <b>prismatique pseudostratifié</b> avec <b>stéréocils</b>',
      order_index: 107,
    },
    {
      recto: 'Quel type d\'épithélium possède le <b>canal éjaculateur</b> ?',
      verso: 'Épithélium <b>prismatique simple</b>',
      order_index: 108,
    },
    {
      recto: 'De quoi est constitué le <b>stroma prostatique</b> ?',
      verso: '· <b>Fibres musculaires lisses (FML)</b>\n· <b>Fibres élastiques</b>\n· Vaisseaux\n· Nerfs',
      order_index: 109,
    },
    {
      recto: 'Comment est organisée la <b>prostate</b> sur le plan topographique ?',
      verso: '· <b>2 parties</b> : crâniale et caudale\n· Chacune formée de <b>3 lobes</b>\n· Traversée en son centre par l\'<b>urètre prostatique</b>',
      order_index: 110,
    },
    {
      recto: 'Le canal épididymaire fait suite à quels canaux ?',
      verso: 'Aux <b>cônes/canaux efférents</b>\n(PAS aux tubes droits ni au canal déférent)',
      order_index: 111,
    },
    {
      recto: 'L\'<b>épithélium des vésicules séminales</b> est-il un épithélium glandulaire ?',
      verso: '<b>OUI</b>, c\'est un épithélium glandulaire\n(Contient des cellules principales glandulaires riches en grains de sécrétion)',
      order_index: 112,
    },
    {
      recto: 'Quelles cellules assurent la <b>progression</b> des spermatozoïdes dans les canaux efférents ?',
      verso: 'Les <b>cellules ciliées</b> (cils vibratiles)\n+ les contractions <b>péristaltiques</b> de la musculeuse lisse\n+ la <b>pression du liquide séminal</b>',
      order_index: 113,
    },
    {
      recto: 'Le sphincter <b>strié</b> de la prostate contrôle quel type de miction ?',
      verso: 'La miction <b>volontaire</b>\n(Le sphincter <b>lisse</b> empêche l\'écoulement <b>spontané</b>)',
      order_index: 114,
    },
    {
      recto: 'Quelle est la durée <b>totale</b> de la spermatogenèse ?',
      verso: '~<b>74 jours</b>\n(27j prolifération + 24j méiose + 23j spermiogenèse)',
      order_index: 115,
    },
    {
      recto: 'Résumer les <b>épithéliums</b> le long des voies spermatiques.',
      verso: '· Tubes séminifères → épithélium <b>stratifié complexe</b>\n· Tubes droits → <b>cubique</b>\n· Rete testis → <b>pavimenteux</b>\n· Canaux efférents → <b>prismatique</b> (cils + glandulaire + basales)\n· Épididyme → <b>prismatique pseudostratifié</b> (stéréocils)\n· Canal déférent → <b>prismatique pseudostratifié</b> (stéréocils)',
      order_index: 116,
    },
    {
      recto: 'Comparer les musculeuses : <b>épididyme</b> vs <b>canal déférent</b> vs <b>vésicules séminales</b>.',
      verso: '· <b>Épididyme</b> : s\'épaissit de la tête à la queue, jusqu\'à <b>3 couches</b> en terminal\n· <b>Canal déférent</b> : musculeuse <b>épaisse</b>, <b>3 couches</b> (LCL)\n· <b>Vésicules séminales</b> : <b>2 couches</b> (circulaire interne, longitudinale externe)',
      order_index: 117,
    },
    {
      recto: 'VRAI ou FAUX : L\'<b>épithélium séminifère</b> est un épithélium pavimenteux simple.',
      verso: '<b>FAUX</b>\nL\'épithélium séminifère est un épithélium <b>stratifié complexe</b>',
      order_index: 118,
    },
    {
      recto: 'VRAI ou FAUX : La cellule de <b>Sertoli</b> se situe dans l\'espace <b>interstitiel</b> testiculaire.',
      verso: '<b>FAUX</b>\nLa cellule de Sertoli se situe dans les <b>tubes séminifères</b>\n(C\'est la cellule de <b>Leydig</b> qui est dans l\'espace interstitiel)',
      order_index: 119,
    },
    {
      recto: 'Quel est le rôle du <b>lysozyme</b> dans le liquide séminal ?',
      verso: 'Pouvoir <b>antibactérien</b>\n(Sécrété par les vésicules séminales)',
      order_index: 120,
    },
  ],

  annales: [
    {
      titre: 'ACC Histologie — Appareil génital masculin — Session 1',
      annee: '2022-2023',
      rappel_cours: 'Le testicule est une glande **mixte** (exocrine + endocrine) enveloppée par l\'**albuginée**. L\'albuginée s\'épaissit pour former le **corps de Highmore**. Les **septa** délimitent des lobules contenant 2-3 tubes séminifères. Les **cellules de Sertoli** sont dans l\'épithélium séminifère, les **cellules de Leydig** dans l\'interstitium.\n\nL\'**épididyme** est une voie extra-testiculaire à épithélium **prismatique pseudostratifié** avec des **stéréocils**. La musculeuse s\'**épaissit** de la tête vers la queue. La **queue** assure le stockage des spermatozoïdes.\n\nLe **canal déférent** fait suite au canal épididymaire (pas aux tubes droits). La **prostate** est une glande **EXOCRINE** hormono-dépendante.',
      questions: [
        {
          enonce: 'Parmi les propositions suivantes, indiquez la ou les proposition(s) exacte(s) :',
          items: [
            { lettre: 'A', enonce: 'Le testicule est enveloppé d\'une capsule conjonctive appelée l\'albuginée', is_correct: true },
            { lettre: 'B', enonce: 'Le testicule a une fonction uniquement exocrine', is_correct: false },
            { lettre: 'C', enonce: 'Entre albuginée et corps d\'Highmore sont tendues des cloisons radiaires ou septa', is_correct: true },
            { lettre: 'D', enonce: 'À la naissance les testicules sont situés dans la région inguinale', is_correct: false },
            { lettre: 'E', enonce: 'Les cellules de Sertoli se situent dans l\'espace interstitiel', is_correct: false },
          ],
          correction: '**Réponse : AC**\n\nA. **VRAI** — L\'albuginée testiculaire est bien la capsule conjonctive blanche épaisse qui enveloppe le testicule.\nB. **FAUX** — Le testicule a une double fonction : **exocrine** (spermatogenèse) et **endocrine** (sécrétion de testostérone par les cellules de Leydig).\nC. **VRAI** — Les cloisons radiaires (septa) sont bien tendues entre l\'albuginée et le corps de Highmore, délimitant les lobules testiculaires.\nD. **FAUX** — À la naissance, les testicules sont normalement déjà situés dans le **scrotum**.\nE. **FAUX** — Les cellules de Sertoli se situent dans l\'**épithélium des tubes séminifères**, pas dans l\'espace interstitiel. Ce sont les cellules de **Leydig** qui occupent l\'espace interstitiel.',
        },
        {
          enonce: 'Quelle est la réponse exacte ? (QRU)',
          items: [
            { lettre: 'A', enonce: 'L\'épididyme est une voie intra-testiculaire', is_correct: false },
            { lettre: 'B', enonce: 'L\'épididyme a un épithélium cubique simple', is_correct: false },
            { lettre: 'C', enonce: 'La partie terminale de l\'épididyme est un lieu de stockage des spermatozoïdes', is_correct: true },
            { lettre: 'D', enonce: 'La cellule de l\'épithélium épididymaire est caractérisée par la présence de cils vibratiles', is_correct: false },
            { lettre: 'E', enonce: 'La musculeuse de l\'épididyme s\'amincit progressivement de la tête à la queue avec une organisation en 1 couche dans sa partie terminale', is_correct: false },
          ],
          correction: '**Réponse : C**\n\nA. **FAUX** — L\'épididyme est une voie **extra-testiculaire**.\nB. **FAUX** — L\'épididyme a un épithélium **prismatique pseudostratifié** (et non cubique simple).\nC. **VRAI** — La queue (cauda) de l\'épididyme est le lieu de stockage des spermatozoïdes (52% de la réserve totale).\nD. **FAUX** — L\'épithélium épididymaire est caractérisé par des **stéréocils** (et non des cils vibratiles). Les stéréocils n\'ont pas de microtubules ni d\'activité motrice.\nE. **FAUX** — La musculeuse **s\'épaissit** de la tête vers la queue (et non s\'amincit), avec **3 couches** dans sa partie terminale (et non 1).',
        },
        {
          enonce: 'Parmi les propositions suivantes, indiquez la ou les proposition(s) exacte(s) :',
          items: [
            { lettre: 'A', enonce: 'Le canal épididymaire fait suite aux cônes efférents', is_correct: true },
            { lettre: 'B', enonce: 'L\'épithélium des vésicules séminales est un épithélium glandulaire', is_correct: true },
            { lettre: 'C', enonce: 'La prostate est une glande endocrine', is_correct: false },
            { lettre: 'D', enonce: 'Le sphincter interne de la prostate est formé de fibres musculaires lisses', is_correct: true },
            { lettre: 'E', enonce: 'Le canal déférent fait suite aux tubes droits', is_correct: false },
          ],
          correction: '**Réponse : ABD**\n\nA. **VRAI** — Le canal épididymaire fait bien suite aux cônes/canaux efférents.\nB. **VRAI** — L\'épithélium des vésicules séminales est bien un épithélium glandulaire contenant des cellules principales sécrétrices.\nC. **FAUX** — La prostate est une glande **EXOCRINE** (sécrète dans l\'urètre prostatique), pas endocrine.\nD. **VRAI** — Le sphincter interne (lisse) de la prostate est bien formé de fibres musculaires lisses, assurant la continence passive.\nE. **FAUX** — Le canal déférent fait suite au **canal épididymaire** (et non aux tubes droits). Les tubes droits font la jonction entre les tubes séminifères et le rete testis.',
        },
      ],
    },
    {
      titre: 'ACC Histologie — Appareil génital masculin — Session 1',
      annee: '2021-2022',
      rappel_cours: 'Le testicule est enveloppé par l\'**albuginée** (et non le corps de Highmore qui est un épaississement de celle-ci). Il a une double fonction : **exocrine** (spermatozoïdes) et **endocrine** (testostérone). Les cellules de **Leydig** sont dans l\'interstitium, les cellules de **Sertoli** dans l\'épithélium séminifère.\n\nL\'épithélium de l\'épididyme est **prismatique pseudostratifié** avec des **stéréocils** (pas des microvillosités). La musculeuse **s\'épaissit** de la tête vers la queue.\n\nSur une coupe prostatique : stroma conjonctif riche en FML, alvéoles, corps de Robin, épithélium glandulaire prismatique/cubique.',
      questions: [
        {
          enonce: 'Parmi les propositions suivantes, indiquez la ou les proposition(s) exacte(s) :',
          items: [
            { lettre: 'A', enonce: 'Le testicule est enveloppé d\'une capsule conjonctive appelée corps de Highmore', is_correct: false },
            { lettre: 'B', enonce: 'Le testicule a uniquement une fonction exocrine', is_correct: false },
            { lettre: 'C', enonce: 'Les cellules de Leydig font partie de l\'épithélium séminifère', is_correct: false },
            { lettre: 'D', enonce: 'À la naissance les testicules sont situés normalement dans le scrotum', is_correct: true },
            { lettre: 'E', enonce: 'Aucune des propositions précédentes n\'est exacte', is_correct: false },
          ],
          correction: '**Réponse : D**\n\nA. **FAUX** — Le testicule est enveloppé par l\'**albuginée** testiculaire. Le **corps de Highmore** est un épaississement de l\'albuginée au pôle du testicule.\nB. **FAUX** — Le testicule a une double fonction : **exocrine** (production de spermatozoïdes) ET **endocrine** (sécrétion de testostérone par les cellules de Leydig).\nC. **FAUX** — Les cellules de Leydig sont dans le **tissu interstitiel** (entre les tubes séminifères), pas dans l\'épithélium séminifère.\nD. **VRAI** — À la naissance, les testicules ont normalement terminé leur descente et sont situés dans le scrotum.\nE. **FAUX** — La proposition D est vraie.',
        },
        {
          enonce: 'Parmi les propositions suivantes, indiquez la ou les proposition(s) exacte(s) :',
          items: [
            { lettre: 'A', enonce: 'Le canal épididymaire fait suite au canal déférent', is_correct: false },
            { lettre: 'B', enonce: 'L\'épithélium de l\'épididyme est prismatique pseudo-stratifié', is_correct: true },
            { lettre: 'C', enonce: 'Les cellules principales de l\'épithélium épididymaire sont caractérisées par la présence de microvillosités', is_correct: false },
            { lettre: 'D', enonce: 'La musculeuse de l\'épididyme s\'épaissit progressivement de la tête vers la queue', is_correct: true },
            { lettre: 'E', enonce: 'Aucune des propositions précédentes n\'est exacte', is_correct: false },
          ],
          correction: '**Réponse : BD**\n\nA. **FAUX** — C\'est l\'inverse : le canal **déférent** fait suite au canal **épididymaire** (pas le contraire).\nB. **VRAI** — L\'épithélium de l\'épididyme est bien prismatique pseudostratifié.\nC. **FAUX** — Les cellules principales sont caractérisées par la présence de **stéréocils** (et non de microvillosités). Les stéréocils sont des expansions cytoplasmiques irrégulières sans activité motrice.\nD. **VRAI** — La musculeuse s\'épaissit bien progressivement de la tête vers la queue, avec 3 couches dans la partie terminale.\nE. **FAUX** — Les propositions B et D sont vraies.',
        },
        {
          enonce: 'Sur cette coupe prostatique, parmi les propositions suivantes, indiquez la ou les proposition(s) exacte(s) :',
          items: [
            { lettre: 'A', enonce: '1 représente l\'albuginée', is_correct: false },
            { lettre: 'B', enonce: '2 représente le stroma conjonctif riche en fibres musculaires lisses', is_correct: true },
            { lettre: 'C', enonce: '3 représente une alvéole', is_correct: true },
            { lettre: 'D', enonce: '4 représente un corps de Robin', is_correct: true },
            { lettre: 'E', enonce: '5 représente un épithélium glandulaire constitué de cellules prismatiques ou cubiques', is_correct: true },
          ],
          correction: '**Réponse : BCDE**\n\nA. **FAUX** — La structure 1 ne représente pas l\'albuginée (qui est la capsule du testicule, pas de la prostate). La prostate possède une capsule fibro-élastique.\nB. **VRAI** — Le stroma prostatique est bien un tissu conjonctif riche en fibres musculaires lisses.\nC. **VRAI** — Les alvéoles (tubulo-acini) sont les unités sécrétoires de la prostate.\nD. **VRAI** — Les corps de Robin (sympexions) sont des concrétions lamellaires de glycoprotéines caractéristiques de la prostate.\nE. **VRAI** — L\'épithélium glandulaire prostatique est constitué de cellules sécrétrices de hauteur variable, prismatiques ou cubiques.',
        },
      ],
    },
    {
      titre: 'ACC Histologie — Questions complémentaires',
      annee: '2021-2022',
      rappel_cours: 'L\'albuginée est la capsule du testicule. Le corps de Highmore est un **épaississement de l\'albuginée**. Les **tubes séminifères** contiennent un épithélium **stratifié complexe** (et non pavimenteux simple). Les cellules de **Sertoli** sont dans les tubes séminifères, les cellules de **Leydig** sécrètent la **testostérone**. La **spermiogenèse** suit la méiose.',
      questions: [
        {
          enonce: 'Parmi les propositions suivantes, indiquez celle(s) qui est (sont) exacte(s) :',
          items: [
            { lettre: 'A', enonce: 'Le testicule est enveloppé d\'une capsule conjonctive appelée l\'albuginée', is_correct: true },
            { lettre: 'B', enonce: 'Le testicule a une fonction uniquement exocrine', is_correct: false },
            { lettre: 'C', enonce: 'Le corps d\'Highmore correspond à un épaississement de l\'albuginée', is_correct: true },
            { lettre: 'D', enonce: 'Chaque lobule testiculaire ne contient qu\'un seul tube séminifère', is_correct: false },
            { lettre: 'E', enonce: 'Aucune des propositions précédentes n\'est exacte', is_correct: false },
          ],
          correction: '**Réponse : AC**\n\nA. **VRAI** — L\'albuginée testiculaire est bien la capsule conjonctive blanche épaisse enveloppant le testicule.\nB. **FAUX** — Le testicule a une double fonction : exocrine (spermatogenèse) ET endocrine (testostérone par les cellules de Leydig).\nC. **VRAI** — Le corps de Highmore correspond bien à un épaississement de l\'albuginée au pôle du testicule en regard de l\'épididyme.\nD. **FAUX** — Chaque lobule testiculaire contient **2 à 3** tubes séminifères (et non un seul).\nE. **FAUX** — Les propositions A et C sont vraies.',
        },
        {
          enonce: 'Parmi les propositions suivantes, indiquez celle(s) qui est (sont) exacte(s) :',
          items: [
            { lettre: 'A', enonce: 'L\'épithélium séminifère est un épithélium pavimenteux simple', is_correct: false },
            { lettre: 'B', enonce: 'La cellule de Sertoli se situe dans l\'espace interstitiel testiculaire', is_correct: false },
            { lettre: 'C', enonce: 'La cellule de Leydig sécrète la testostérone', is_correct: true },
            { lettre: 'D', enonce: 'La spermiogénèse suit la méiose', is_correct: true },
            { lettre: 'E', enonce: 'Aucune des propositions précédentes n\'est exacte', is_correct: false },
          ],
          correction: '**Réponse : CD**\n\nA. **FAUX** — L\'épithélium séminifère est un épithélium **stratifié complexe** (et non pavimenteux simple).\nB. **FAUX** — La cellule de Sertoli se situe dans les **tubes séminifères** du testicule (et non dans l\'espace interstitiel).\nC. **VRAI** — La cellule de Leydig, située dans le tissu interstitiel, sécrète bien la testostérone (fonction endocrine du testicule).\nD. **VRAI** — La spermiogenèse est la 3e phase de la spermatogenèse, elle suit bien la méiose (23 jours après les 24 jours de méiose).\nE. **FAUX** — Les propositions C et D sont vraies.',
        },
      ],
    },
  ],
};

export default content;

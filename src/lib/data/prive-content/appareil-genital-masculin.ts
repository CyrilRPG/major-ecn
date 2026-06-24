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
              {
                concept: '◆ Définition',
                detail_md: 'Tissu recouvrant les **surfaces externes et internes** du corps, les cavités et les conduits',
                kind: 'a_retenir',
              },
              {
                concept: 'Épithéliums simples',
                detail_md: '· **Aplaties (pavimenteux)** → adaptées à la diffusion (alvéoles pulmonaires, endothélium vasculaire, mésothélium)\n· **Cubiques** → revêtement de certains canaux\n· **Cylindriques** → cellules hautes, actives (intestin grêle)',
                kind: 'normal',
              },
              {
                concept: 'Spécialisations apicales',
                detail_md: '· **Microvillosités** → augmentation surface d\'absorption\n· **Cils vibratiles** → mobilité, propulsion du mucus',
                kind: 'normal',
              },
              {
                concept: '⚠ Cellules aplaties vs cylindriques',
                detail_md: 'Cellules **aplaties** = adaptées à la **diffusion passive** (échanges gazeux)\nCellules **cylindriques hautes** = cellules **métaboliquement actives** (sécrétion, absorption)',
                kind: 'piege',
              },
            ],
          },
          {
            titre: 'Épithélium glandulaire',
            rows: [
              {
                concept: '◆ Glandes',
                detail_md: 'Cellules épithéliales **spécialisées** dans la production de **sécrétions** (exocrines ou endocrines)',
                kind: 'a_retenir',
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
            titre: 'Anatomie testiculaire',
            rows: [
              {
                concept: '◆ Localisation et morphologie',
                detail_md: 'Situés dans les **bourses (scrotum)**, forme **ovoïde**, taille ~**4 cm**, poids **10-15 g**\nPôle inférieur fixé par le **gubernaculum testis**',
                kind: 'a_retenir',
              },
              {
                concept: '◆ Albuginée testiculaire',
                detail_md: '**Capsule conjonctive blanche épaisse** enveloppant le testicule\nÉpaississement au pôle en regard de l\'épididyme = **corps de Highmore**',
                kind: 'a_retenir',
              },
              {
                concept: 'Organisation lobulaire',
                detail_md: '**Septa/cloisons radiaires** entre albuginée et corps de Highmore → délimitent des **lobules communicants**\nChaque lobule contient **2-3 tubes séminifères** (longueur 30 cm à 1 m, diamètre 150-300 μm)\nTubes entourés d\'une **membrane propre**',
                kind: 'normal',
              },
              {
                concept: '◆ Glande interstitielle',
                detail_md: 'Située **entre les tubes séminifères** : TC lâche, vaisseaux, nerfs et **cellules de Leydig** (sécrétion de testostérone → fonction **endocrine**)',
                kind: 'a_retenir',
              },
              {
                concept: '⚠ Double fonction du testicule',
                detail_md: 'Le testicule est une glande **mixte** :\n· **Exocrine** → production de spermatozoïdes (tubes séminifères)\n· **Endocrine** → sécrétion de testostérone (cellules de Leydig)\nPiège : ne pas oublier la fonction endocrine !',
                kind: 'piege',
              },
              {
                concept: '⚠ Cellules de Sertoli vs Leydig',
                detail_md: '· **Sertoli** → dans l\'**épithélium des tubes séminifères** (soutien spermatogenèse)\n· **Leydig** → dans le **tissu interstitiel** entre les tubes séminifères (sécrétion testostérone)\nPiège : ne pas inverser leurs localisations !',
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
                concept: '◆ Les 3 phases',
                detail_md: '· Phase **proliférative** (mitoses) → **27 jours**\n· Phase de **méiose** → **24 jours**\n· **Spermiogenèse** (maturation spermatides) → **23 jours**',
                kind: 'a_retenir',
              },
              {
                concept: 'Spermiogenèse',
                detail_md: 'Transforme les spermatides en spermatozoïdes :\n· Formation de l\'**acrosome**\n· **Condensation nucléaire**\n· Développement du **flagelle**\n· Réorganisation du **cytoplasme**',
                kind: 'normal',
              },
              {
                concept: '◆ Spermatozoïdes à la sortie du testicule',
                detail_md: 'Les spermatozoïdes sont **NON fécondants** à la sortie du testicule :\n· Pas de **mobilité progressive**\n· Incapacité à **fixer la zone pellucide**\n· Incapacité de **réaction acrosomique**\n· Incapacité à **fusionner** avec l\'ovocyte',
                kind: 'a_retenir',
              },
              {
                concept: '⚠ Spz non fécondants à la sortie',
                detail_md: 'Les spermatozoïdes **ne deviennent fécondants** qu\'après le **transit épididymaire** (maturation dans tête et corps de l\'épididyme). Piège fréquent en QCM !',
                kind: 'piege',
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
                concept: '◆ Trajet des spermatozoïdes',
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
                detail_md: 'Diamètre ~**25 μm**, épithélium **cubique**\nFont la jonction entre tubes séminifères et rete testis',
                kind: 'normal',
              },
              {
                concept: '◆ Rete testis',
                detail_md: '**Réseau labyrinthique** situé dans le corps de Highmore\nÉpithélium **pavimenteux**\nFonctions d\'**échange** et **modification du fluide testiculaire**',
                kind: 'a_retenir',
              },
              {
                concept: 'Progression des spermatozoïdes immatures',
                detail_md: 'Poussés par la **pression du liquide séminal** sécrété par les **cellules de Sertoli** (pas de mobilité propre à ce stade)',
                kind: 'normal',
              },
            ],
          },
          {
            titre: 'Canaux efférents',
            rows: [
              {
                concept: '◆ Canaux efférents',
                detail_md: '**10-12 canaux/cônes efférents**, longueur ~**20 cm**, diamètre ~**0.2 mm**\nTraversent l\'**albuginée** pour rejoindre l\'épididyme',
                kind: 'a_retenir',
              },
              {
                concept: 'Types cellulaires des canaux efférents',
                detail_md: '3 types :\n· **Cellules ciliées** → aident à la progression des spermatozoïdes\n· **Cellules glandulaires** → sécrétion\n· **Cellules basales** de renouvellement',
                kind: 'normal',
              },
              {
                concept: '◆ Réabsorption',
                detail_md: 'Réabsorption du **fluide testiculaire** (eau et Na⁺) → **concentration** des spermatozoïdes',
                kind: 'a_retenir',
              },
            ],
          },
          {
            titre: 'Canal épididymaire',
            rows: [
              {
                concept: '◆ Morphologie',
                detail_md: 'Tube **pelotonné** de **3 à 6 m** de long\n3 segments : **tête (caput)**, **corps**, **queue (cauda)**',
                kind: 'a_retenir',
              },
              {
                concept: '◆ Épithélium',
                detail_md: 'Épithélium **prismatique pseudostratifié** :\n· **Cellules principales** → stéréocils, organites de synthèse protéique + absorption\n· **Cellules basales** → renouvellement',
                kind: 'a_retenir',
              },
              {
                concept: '⚠ Stéréocils vs cils vibratiles',
                detail_md: '**Stéréocils** (typique épididyme) : fines prolongations **irrégulières**, **sans activité motrice**, **sans microtubules**\n**Cils vibratiles** : mobiles, synchrones, possèdent un **axonème** (microtubules)\nPiège : l\'épididyme a des **stéréocils**, PAS des cils vibratiles !',
                kind: 'piege',
              },
              {
                concept: 'Musculeuse épididymaire',
                detail_md: 'CML (cellules musculaires lisses) s\'**épaississant** de la tête vers la queue\nPartie terminale : **3 couches** de CML',
                kind: 'normal',
              },
              {
                concept: '⚠ Épaississement musculeuse',
                detail_md: 'La musculeuse s\'**épaissit** de la tête vers la queue (et non l\'inverse). Piège classique en QCM.',
                kind: 'piege',
              },
              {
                concept: 'Gradient cellulaire tête → queue',
                detail_md: 'La **hauteur des cellules** et la **taille des stéréocils** **diminuent** de la tête vers la queue',
                kind: 'normal',
              },
              {
                concept: '◆ Rôles de l\'épididyme',
                detail_md: '· **Transport** des spermatozoïdes\n· **Maturation** des spermatozoïdes (tête et corps)\n· **Stockage** des spermatozoïdes (queue)',
                kind: 'a_retenir',
              },
              {
                concept: '◆ Transit épididymaire',
                detail_md: 'Durée : **10-12 jours**\n**Maturation** dans la **tête et le corps**\n**Stockage** dans la **queue**',
                kind: 'a_retenir',
              },
              {
                concept: '◆ Production et réserve',
                detail_md: 'Production : **45-207 millions** de spermatozoïdes/jour\nRéserve : **182 millions**/épididyme\n· **26%** dans la tête\n· **23%** dans le corps\n· **52%** dans la queue',
                kind: 'a_retenir',
              },
              {
                concept: '◆ Acquisitions de la maturation',
                detail_md: 'La maturation épididymaire confère :\n· **Mobilité unidirectionnelle**\n· Capacité de **fixation à la zone pellucide** et membrane ovocytaire\n· Capacité de **développement embryonnaire** normal',
                kind: 'a_retenir',
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
                detail_md: 'Tube **droit** d\'environ **40 cm**, situé dans le **cordon spermatique**\nFait suite au **canal épididymaire** → transporte les spermatozoïdes jusqu\'à l\'**urètre** via le **canal éjaculateur**',
                kind: 'a_retenir',
              },
              {
                concept: '⚠ Le canal déférent fait suite au canal épididymaire',
                detail_md: 'Il fait suite au **canal épididymaire** (et NON aux tubes droits). Piège fréquent en QCM !',
                kind: 'piege',
              },
              {
                concept: '◆ 3 tuniques du canal déférent',
                detail_md: '· **Muqueuse** → épithélium **prismatique pseudostratifié** avec **stéréocils**\n· **Musculeuse épaisse** → 3 couches de CML : **longitudinale interne**, **circulaire moyenne**, **longitudinale externe**\n· **Adventice** → TC lâche élastique',
                kind: 'a_retenir',
              },
              {
                concept: 'Mnémo couches musculeuse déférent',
                detail_md: '"**LCL**" = **L**ongitudinale interne, **C**irculaire moyenne, **L**ongitudinale externe\n→ Les 3 couches de CML du canal déférent',
                kind: 'mnemo',
              },
              {
                concept: 'Mécanisme de l\'éjaculation',
                detail_md: 'Lors de l\'éjaculation :\n· Les **plis de la muqueuse se distendent**\n· La musculeuse émet des **ondes péristaltiques puissantes et brèves**\n· Contrôle par fibres **orthosympathiques adrénergiques**',
                kind: 'normal',
              },
              {
                concept: '◆ Terminaison',
                detail_md: 'Le canal déférent se termine par l\'**ampoule déférentielle** → **canal éjaculateur** (~**2 cm** de long)\nLe canal éjaculateur **pénètre dans le tissu prostatique**, **perd sa musculeuse**, et rejoint l\'**urètre prostatique**',
                kind: 'a_retenir',
              },
            ],
          },
        ],
      },
      {
        numero: 'V',
        titre: 'Vésicules séminales et Prostate',
        sous_parties: [
          {
            titre: 'Vésicules séminales',
            rows: [
              {
                concept: '◆ Morphologie',
                detail_md: 'Organes **pairs**, en forme de **sac à paroi bosselée** (tubes pelotonnés)\nMuqueuse à **nombreux replis**, épithélium **prismatique/cylindrique simple**',
                kind: 'a_retenir',
              },
              {
                concept: 'Types cellulaires',
                detail_md: '· **Cellules principales glandulaires** → grains de sécrétion\n· **Cellules basales** → renouvellement',
                kind: 'normal',
              },
              {
                concept: 'Musculeuse',
                detail_md: '**2 couches** de CML :\n· **Circulaire interne**\n· **Longitudinale externe**',
                kind: 'normal',
              },
              {
                concept: '◆ Plasma séminal des vésicules',
                detail_md: 'Constitue le **volume principal** de l\'éjaculat : ~**2.5 mL** soit **50-80%** du volume total\npH **alcalin**, sécrétion **androgéno-dépendante**',
                kind: 'a_retenir',
              },
              {
                concept: '◆ Composition du liquide séminal',
                detail_md: '· Eau, électrolytes\n· **Fructose** = **MARQUEUR des vésicules séminales** (nutrition + mobilité spermatozoïdes)\n· Protéines : **lactoferrine**, **lysozyme** (antibactérien), facteur **immunosuppresseur**, facteur de **dé-capacitation**, facteur de **coagulation**\n· **Prostaglandines**\n· **Vitamine C**',
                kind: 'a_retenir',
              },
              {
                concept: '⚠ Fructose = marqueur VS',
                detail_md: 'Le **fructose** est le **marqueur spécifique** des vésicules séminales. Si on le retrouve dans un bilan, il signe l\'apport des VS. Piège : ne pas confondre avec le glucose !',
                kind: 'piege',
              },
            ],
          },
          {
            titre: 'Prostate',
            rows: [
              {
                concept: '◆ Définition',
                detail_md: 'Organe **musculo-glandulaire**, taille/forme d\'une **petite châtaigne**\nSituée à la partie inférieure de la **vessie**, au **carrefour uro-génital**\nEntoure l\'**urètre prostatique**',
                kind: 'a_retenir',
              },
              {
                concept: '⚠ Prostate = glande exocrine',
                detail_md: 'La prostate est une glande **EXOCRINE** (et non endocrine). Elle sécrète dans l\'urètre prostatique. Piège classique !',
                kind: 'piege',
              },
              {
                concept: 'Capsule et lobules',
                detail_md: 'Capsule **fibro-élastique** → envoie des **cloisons** → délimitent des **lobules**',
                kind: 'normal',
              },
              {
                concept: '◆ Sphincters',
                detail_md: '· Sphincter **lisse** → empêche l\'écoulement spontané d\'urine\n· Sphincter **strié** → contrôle **volontaire** de la miction',
                kind: 'a_retenir',
              },
              {
                concept: '◆ Organisation glandulaire',
                detail_md: '~**50 glandes tubulo-alvéolaires** dans un stroma conjonctif (FML, fibres élastiques, vaisseaux, nerfs)\n**3 groupes concentriques** :\n· Glandes **péri-urétrales internes**\n· Glandes **péri-urétrales externes**\n· Glandes **principales** (périphériques)',
                kind: 'a_retenir',
              },
              {
                concept: 'Épithélium glandulaire prostatique',
                detail_md: '· **Cellules sécrétrices** → sécrétion\n· **Cellules basales** de remplacement\nExcrétion **mérocrine** (respecte la membrane) et **apocrine** (emporte le pôle apical)',
                kind: 'normal',
              },
              {
                concept: '◆ Hormono-dépendance',
                detail_md: 'La prostate possède des **récepteurs aux androgènes** → glande **hormono-dépendante** (androgéno-dépendante)',
                kind: 'a_retenir',
              },
              {
                concept: '◆ Corps de Robin (sympexions)',
                detail_md: '**Glycoprotéines lamellaires concentriques** présentes dans la lumière des acini prostatiques\n**Calcification après 40 ans** → risque de **lithiase prostatique**',
                kind: 'a_retenir',
              },
              {
                concept: '◆ Sécrétion prostatique',
                detail_md: 'Représente ~**1/6 de l\'éjaculat**\n· **Facteur de liquéfaction** du sperme\n· pH **acide**\n· **Spermine/spermidine**, albumine, **fibrinolysine**\n· **Acide citrique**, **phosphatase acide**\n· Ions : **Zn²⁺**, Mg²⁺, Ca²⁺',
                kind: 'a_retenir',
              },
            ],
          },
          {
            titre: 'Glandes bulbo-urétrales',
            rows: [
              {
                concept: '◆ Glandes bulbo-urétrales (de Cowper)',
                detail_md: '**2 glandes tubulo-acineuses**, taille d\'un **petit pois**\nSécrètent un **liquide mucoïde** → **lubrification de l\'urètre**\nSécrétion **androgéno-dépendante**',
                kind: 'a_retenir',
              },
            ],
          },
        ],
      },
      {
        numero: 'VI',
        titre: 'Composition du sperme et éjaculation',
        sous_parties: [
          {
            titre: 'Séquence éjaculatoire et composition',
            rows: [
              {
                concept: '◆ Composition globale du sperme',
                detail_md: 'Le sperme est un mélange de :\n· **Spermatozoïdes** (origine testiculaire)\n· **Liquide séminal** des vésicules séminales (~**50-80%** du volume)\n· **Sécrétions prostatiques** (~**1/6** du volume)\n· **Sécrétions des glandes bulbo-urétrales** (liquide mucoïde)',
                kind: 'a_retenir',
              },
              {
                concept: 'Séquence éjaculatoire',
                detail_md: 'Les différentes sécrétions sont émises dans un **ordre séquentiel** lors de l\'éjaculation\n(L\'origine précise de chaque composé dans la séquence n\'est pas à apprendre)',
                kind: 'normal',
              },
              {
                concept: '◆ Marqueurs par glande',
                detail_md: '· Vésicules séminales → **fructose**\n· Prostate → **phosphatase acide**, **acide citrique**, **Zn²⁺**, **spermine**\n· Épididyme → maturation et stockage spermatozoïdes',
                kind: 'a_retenir',
              },
            ],
          },
        ],
      },
    ],
    points_cles: [
      'Le testicule est une glande mixte : exocrine (spermatozoïdes) et endocrine (testostérone par cellules de Leydig)',
      'Les cellules de Sertoli sont dans l\'épithélium des tubes séminifères, les cellules de Leydig dans le tissu interstitiel',
      'La spermatogenèse comporte 3 phases : proliférative (27j), méiose (24j) et spermiogenèse (23j)',
      'Les spermatozoïdes sont NON fécondants à la sortie du testicule',
      'L\'épididyme a des stéréocils (PAS des cils vibratiles) et sa musculeuse s\'épaissit de la tête vers la queue',
      'La maturation épididymaire se fait dans la tête et le corps, le stockage dans la queue (52% de la réserve)',
      'Le canal déférent fait suite au canal épididymaire (et non aux tubes droits)',
      'Le fructose est le marqueur des vésicules séminales qui fournissent 50-80% du volume de l\'éjaculat',
      'La prostate est une glande EXOCRINE (et non endocrine), hormono-dépendante (androgènes)',
      'Les corps de Robin (sympexions) se calcifient après 40 ans → lithiase prostatique',
    ],
    chiffres_cles: {
      titre: 'Chiffres clés - Appareil génital masculin',
      markdown:
        '| Structure | Chiffre clé |\n|---|---|\n| Testicule | 4 cm, 10-15 g |\n| Tubes séminifères | 30 cm à 1 m de long, 150-300 μm de diamètre |\n| Spermatogenèse | Prolifération 27j + Méiose 24j + Spermiogenèse 23j |\n| Tubes droits | 25 μm de diamètre |\n| Canaux efférents | 10-12 canaux, 20 cm, 0.2 mm diamètre |\n| Canal épididymaire | 3-6 m de long |\n| Transit épididymaire | 10-12 jours |\n| Production spz | 45-207 millions/jour |\n| Réserve épididymaire | 182 millions (26% tête, 23% corps, 52% queue) |\n| Canal déférent | ~40 cm de long |\n| Canal éjaculateur | ~2 cm de long |\n| Vésicules séminales | 50-80% du volume éjaculat (~2.5 mL) |\n| Prostate | ~50 glandes, 1/6 du volume éjaculat |\n| Corps de Robin | Calcification après 40 ans |',
    },
  },

  flashcards: [
    {
      recto: 'Quels sont les 3 types d\'<b>épithéliums simples</b> ?',
      verso: '· <b>Aplati (pavimenteux)</b> → diffusion (alvéoles, endothélium, mésothélium)\n· <b>Cubique</b> → revêtement de canaux\n· <b>Cylindrique</b> → cellules actives (intestin grêle)',
      order_index: 1,
    },
    {
      recto: 'Quelles sont les 2 <b>spécialisations apicales</b> des épithéliums ?',
      verso: '· <b>Microvillosités</b> → augmentation de la surface d\'absorption\n· <b>Cils</b> → propulsion du mucus',
      order_index: 2,
    },
    {
      recto: 'Où sont situés les <b>testicules</b> et quelles sont leurs dimensions ?',
      verso: 'Dans les <b>bourses (scrotum)</b>\nForme ovoïde, <b>~4 cm</b>, <b>10-15 g</b>\nPôle inférieur fixé par le <b>gubernaculum testis</b>',
      order_index: 3,
    },
    {
      recto: 'Qu\'est-ce que l\'<b>albuginée testiculaire</b> ?',
      verso: '<b>Capsule conjonctive blanche épaisse</b> enveloppant le testicule',
      order_index: 4,
    },
    {
      recto: 'Qu\'est-ce que le <b>corps de Highmore</b> ?',
      verso: '<b>Épaississement de l\'albuginée</b> au pôle du testicule en regard de l\'<b>épididyme</b>',
      order_index: 5,
    },
    {
      recto: 'Comment sont organisés les <b>lobules testiculaires</b> ?',
      verso: 'Délimités par des <b>septa/cloisons radiaires</b> entre l\'albuginée et le corps de Highmore\nLobules <b>communicants</b>\nChaque lobule contient <b>2-3 tubes séminifères</b>',
      order_index: 6,
    },
    {
      recto: 'Quelles sont les dimensions des <b>tubes séminifères</b> ?',
      verso: 'Longueur : <b>30 cm à 1 m</b>\nDiamètre : <b>150-300 μm</b>',
      order_index: 7,
    },
    {
      recto: 'Que contient la <b>glande interstitielle</b> du testicule ?',
      verso: '· <b>TC lâche</b>\n· Vaisseaux et nerfs\n· <b>Cellules de Leydig</b> (sécrétion de testostérone)',
      order_index: 8,
    },
    {
      recto: 'Quelles sont les <b>2 fonctions</b> du testicule (glande mixte) ?',
      verso: '· <b>Exocrine</b> → production de spermatozoïdes (tubes séminifères)\n· <b>Endocrine</b> → sécrétion de testostérone (cellules de Leydig)',
      order_index: 9,
    },
    {
      recto: 'Où se trouvent les <b>cellules de Sertoli</b> ?',
      verso: 'Dans l\'<b>épithélium des tubes séminifères</b>\n(PAS dans le tissu interstitiel)',
      order_index: 10,
    },
    {
      recto: 'Où se trouvent les <b>cellules de Leydig</b> ?',
      verso: 'Dans le <b>tissu interstitiel</b> entre les tubes séminifères\n(PAS dans l\'épithélium des tubes séminifères)',
      order_index: 11,
    },
    {
      recto: 'Où se déroule la <b>spermatogenèse</b> ?',
      verso: 'Dans les <b>tubes séminifères</b> du testicule',
      order_index: 12,
    },
    {
      recto: 'Quelles sont les <b>3 phases</b> de la spermatogenèse et leur durée ?',
      verso: '· Phase <b>proliférative</b> (mitoses) → <b>27 jours</b>\n· Phase de <b>méiose</b> → <b>24 jours</b>\n· <b>Spermiogenèse</b> → <b>23 jours</b>',
      order_index: 13,
    },
    {
      recto: 'Quelles sont les <b>4 modifications</b> de la spermiogenèse ?',
      verso: '· Formation de l\'<b>acrosome</b>\n· <b>Condensation nucléaire</b>\n· Développement du <b>flagelle</b>\n· Réorganisation du <b>cytoplasme</b>',
      order_index: 14,
    },
    {
      recto: 'VRAI ou FAUX : Les spermatozoïdes sont <b>fécondants</b> à la sortie du testicule.',
      verso: '<b>FAUX</b>\nÀ la sortie du testicule, les spermatozoïdes sont <b>NON fécondants</b> :\n· Pas de mobilité progressive\n· Incapacité à fixer la zone pellucide\n· Incapacité de réaction acrosomique\n· Incapacité à fusionner avec l\'ovocyte',
      order_index: 15,
    },
    {
      recto: 'Quel est le <b>trajet complet</b> des spermatozoïdes dans les voies génitales masculines ?',
      verso: '<b>Tubes séminifères</b> → <b>Tubes droits</b> → <b>Rete testis</b> → <b>Canaux efférents</b> → <b>Canal épididymaire</b> → <b>Canal déférent</b> → <b>Canal éjaculateur</b> → <b>Urètre</b>',
      order_index: 16,
    },
    {
      recto: 'L\'<b>épididyme</b> fait partie des voies spermatiques <b>intra</b> ou <b>extra</b>-testiculaires ?',
      verso: 'Voies spermatiques <b>EXTRA-testiculaires</b>',
      order_index: 17,
    },
    {
      recto: 'Quelle est la longueur de l\'<b>épididyme</b> ?',
      verso: 'Tube pelotonné de <b>6 m</b> (canal épididymaire : <b>3-6 m</b>)',
      order_index: 18,
    },
    {
      recto: 'Quelles sont les caractéristiques des <b>tubes droits</b> ?',
      verso: 'Diamètre : <b>25 μm</b>\nÉpithélium <b>cubique</b>\nJonction entre tubes séminifères et rete testis',
      order_index: 19,
    },
    {
      recto: 'Qu\'est-ce que le <b>rete testis</b> ?',
      verso: '<b>Réseau labyrinthique</b> situé dans le corps de Highmore\nÉpithélium <b>pavimenteux</b>\nFonctions d\'<b>échange</b> et <b>modification du fluide testiculaire</b>',
      order_index: 20,
    },
    {
      recto: 'Comment les spermatozoïdes immatures progressent-ils dans les voies intra-testiculaires ?',
      verso: 'Par la <b>pression du liquide séminal</b> sécrété par les <b>cellules de Sertoli</b>\n(Pas de mobilité propre à ce stade)',
      order_index: 21,
    },
    {
      recto: 'Combien y a-t-il de <b>canaux efférents</b> et quelles sont leurs dimensions ?',
      verso: '<b>10-12</b> canaux/cônes efférents\nLongueur : <b>20 cm</b>\nDiamètre : <b>0.2 mm</b>',
      order_index: 22,
    },
    {
      recto: 'Quels sont les <b>3 types cellulaires</b> des canaux efférents ?',
      verso: '· <b>Cellules ciliées</b> → progression des spermatozoïdes\n· <b>Cellules glandulaires</b> → sécrétion\n· <b>Cellules basales</b> → renouvellement',
      order_index: 23,
    },
    {
      recto: 'Quel phénomène se produit dans les <b>canaux efférents</b> pour concentrer les spermatozoïdes ?',
      verso: '<b>Réabsorption du fluide testiculaire</b> (eau et Na⁺) → <b>concentration</b> des spermatozoïdes',
      order_index: 24,
    },
    {
      recto: 'Quels sont les <b>3 segments</b> du canal épididymaire ?',
      verso: '· <b>Tête (caput)</b>\n· <b>Corps</b>\n· <b>Queue (cauda)</b>',
      order_index: 25,
    },
    {
      recto: 'Quel est le type d\'<b>épithélium</b> du canal épididymaire ?',
      verso: 'Épithélium <b>prismatique pseudostratifié</b>\n(PAS cubique simple)',
      order_index: 26,
    },
    {
      recto: 'Quels sont les <b>2 types cellulaires</b> de l\'épithélium épididymaire ?',
      verso: '· <b>Cellules principales</b> → stéréocils, synthèse protéique, absorption\n· <b>Cellules basales</b> → renouvellement',
      order_index: 27,
    },
    {
      recto: 'Quelle est la différence entre <b>stéréocils</b> et <b>cils vibratiles</b> ?',
      verso: '<b>Stéréocils</b> (épididyme) : fines prolongations <b>irrégulières</b>, <b>sans activité motrice</b>, <b>sans microtubules</b>\n<b>Cils vibratiles</b> : mobiles, synchrones, possèdent un <b>axonème</b> (microtubules)',
      order_index: 28,
    },
    {
      recto: 'L\'épididyme possède des cils vibratiles ou des <b>stéréocils</b> ?',
      verso: 'Des <b>stéréocils</b>\n(PAS des cils vibratiles : c\'est un piège classique)',
      order_index: 29,
    },
    {
      recto: 'Comment évolue la <b>musculeuse</b> de l\'épididyme de la tête vers la queue ?',
      verso: 'La musculeuse <b>s\'épaissit</b> de la tête vers la queue\nPartie terminale : <b>3 couches</b> de CML',
      order_index: 30,
    },
    {
      recto: 'Comment évoluent la <b>hauteur des cellules</b> et la <b>taille des stéréocils</b> dans l\'épididyme ?',
      verso: 'Elles <b>diminuent</b> de la tête vers la queue',
      order_index: 31,
    },
    {
      recto: 'Quels sont les <b>3 rôles</b> de l\'épididyme ?',
      verso: '· <b>Transport</b> des spermatozoïdes\n· <b>Maturation</b> (tête et corps)\n· <b>Stockage</b> (queue)',
      order_index: 32,
    },
    {
      recto: 'Quelle est la durée du <b>transit épididymaire</b> ?',
      verso: '<b>10-12 jours</b>',
      order_index: 33,
    },
    {
      recto: 'Où se fait la <b>maturation</b> des spermatozoïdes dans l\'épididyme ?',
      verso: 'Dans la <b>tête</b> et le <b>corps</b> de l\'épididyme',
      order_index: 34,
    },
    {
      recto: 'Où sont <b>stockés</b> les spermatozoïdes dans l\'épididyme ?',
      verso: 'Dans la <b>queue (cauda)</b> de l\'épididyme\n(<b>52%</b> de la réserve totale)',
      order_index: 35,
    },
    {
      recto: 'Combien de spermatozoïdes sont produits <b>par jour</b> ?',
      verso: '<b>45-207 millions</b> de spermatozoïdes/jour',
      order_index: 36,
    },
    {
      recto: 'Quelle est la <b>réserve</b> de spermatozoïdes par épididyme et sa répartition ?',
      verso: '<b>182 millions</b> par épididyme :\n· <b>26%</b> dans la tête\n· <b>23%</b> dans le corps\n· <b>52%</b> dans la queue',
      order_index: 37,
    },
    {
      recto: 'Quelles <b>capacités</b> les spermatozoïdes acquièrent-ils lors de la maturation épididymaire ?',
      verso: '· <b>Mobilité unidirectionnelle</b>\n· Capacité de <b>fixation à la zone pellucide</b> et membrane ovocytaire\n· Capacité de <b>développement embryonnaire normal</b>',
      order_index: 38,
    },
    {
      recto: 'Quelle est la <b>longueur</b> du canal déférent et où est-il situé ?',
      verso: 'Tube droit d\'environ <b>40 cm</b>\nSitué dans le <b>cordon spermatique</b>',
      order_index: 39,
    },
    {
      recto: 'Le canal déférent fait suite à quel canal ?',
      verso: 'Au <b>canal épididymaire</b>\n(PAS aux tubes droits → piège classique)',
      order_index: 40,
    },
    {
      recto: 'Quelles sont les <b>3 tuniques</b> du canal déférent ?',
      verso: '· <b>Muqueuse</b> → épithélium prismatique pseudostratifié avec stéréocils\n· <b>Musculeuse épaisse</b> → 3 couches CML (LCL)\n· <b>Adventice</b> → TC lâche élastique',
      order_index: 41,
    },
    {
      recto: 'Quelles sont les <b>3 couches</b> de la musculeuse du canal déférent ?',
      verso: '· <b>Longitudinale interne</b>\n· <b>Circulaire moyenne</b>\n· <b>Longitudinale externe</b>\n(Mnémo : <b>LCL</b>)',
      order_index: 42,
    },
    {
      recto: 'Comment se fait le <b>contrôle nerveux</b> de l\'éjaculation au niveau du canal déférent ?',
      verso: 'Par des fibres <b>orthosympathiques adrénergiques</b>\nOndes <b>péristaltiques puissantes et brèves</b>',
      order_index: 43,
    },
    {
      recto: 'Que se passe-t-il au niveau de la <b>muqueuse du canal déférent</b> lors de l\'éjaculation ?',
      verso: 'Les <b>plis de la muqueuse se distendent</b> pour laisser passer les spermatozoïdes',
      order_index: 44,
    },
    {
      recto: 'Comment se termine le <b>canal déférent</b> ?',
      verso: 'Par l\'<b>ampoule déférentielle</b> → puis <b>canal éjaculateur</b> (~2 cm) → <b>urètre prostatique</b>',
      order_index: 45,
    },
    {
      recto: 'Que devient la musculeuse du <b>canal éjaculateur</b> quand il pénètre dans la prostate ?',
      verso: 'Le canal éjaculateur <b>perd sa musculeuse</b> en pénétrant dans le tissu prostatique',
      order_index: 46,
    },
    {
      recto: 'Quelle est la <b>morphologie</b> des vésicules séminales ?',
      verso: 'Organes <b>pairs</b>, en forme de <b>sac à paroi bosselée</b> (tubes pelotonnés)\nMuqueuse à <b>nombreux replis</b>',
      order_index: 47,
    },
    {
      recto: 'Quel type d\'<b>épithélium</b> revêt les vésicules séminales ?',
      verso: 'Épithélium <b>prismatique/cylindrique simple</b>',
      order_index: 48,
    },
    {
      recto: 'Quels sont les <b>2 types cellulaires</b> des vésicules séminales ?',
      verso: '· <b>Cellules principales glandulaires</b> → grains de sécrétion\n· <b>Cellules basales</b> → renouvellement',
      order_index: 49,
    },
    {
      recto: 'Combien de couches de CML possède la <b>musculeuse des vésicules séminales</b> ?',
      verso: '<b>2 couches</b> :\n· <b>Circulaire interne</b>\n· <b>Longitudinale externe</b>',
      order_index: 50,
    },
    {
      recto: 'Quel <b>pourcentage de l\'éjaculat</b> représente la sécrétion des vésicules séminales ?',
      verso: '<b>50-80%</b> du volume total (~<b>2.5 mL</b>)',
      order_index: 51,
    },
    {
      recto: 'Quel est le <b>pH</b> du liquide des vésicules séminales ?',
      verso: 'pH <b>alcalin</b>',
      order_index: 52,
    },
    {
      recto: 'La sécrétion des vésicules séminales est-elle hormono-dépendante ?',
      verso: 'Oui, elle est <b>androgéno-dépendante</b>',
      order_index: 53,
    },
    {
      recto: 'Quel est le <b>marqueur spécifique</b> des vésicules séminales ?',
      verso: 'Le <b>fructose</b>\n(Rôle : nutrition et mobilité des spermatozoïdes)',
      order_index: 54,
    },
    {
      recto: 'Quelles <b>protéines</b> contient le liquide des vésicules séminales ?',
      verso: '· <b>Lactoferrine</b>\n· <b>Lysozyme</b> (antibactérien)\n· Facteur <b>immunosuppresseur</b>\n· Facteur de <b>dé-capacitation</b>\n· Facteur de <b>coagulation</b>',
      order_index: 55,
    },
    {
      recto: 'En plus des protéines et du fructose, que contient le liquide séminal des vésicules ?',
      verso: '· Eau, électrolytes\n· <b>Prostaglandines</b>\n· <b>Vitamine C</b>',
      order_index: 56,
    },
    {
      recto: 'Quelle est la <b>morphologie</b> de la prostate ?',
      verso: 'Organe <b>musculo-glandulaire</b>\nTaille et forme d\'une <b>petite châtaigne</b>\nSituée à la partie inférieure de la <b>vessie</b>, au <b>carrefour uro-génital</b>',
      order_index: 57,
    },
    {
      recto: 'La prostate est une glande <b>exocrine</b> ou <b>endocrine</b> ?',
      verso: 'Glande <b>EXOCRINE</b>\n(Sécrète dans l\'urètre prostatique — PAS endocrine)',
      order_index: 58,
    },
    {
      recto: 'Que structure entoure la <b>prostate</b> ?',
      verso: 'La prostate entoure l\'<b>urètre prostatique</b>',
      order_index: 59,
    },
    {
      recto: 'De quoi est constituée la <b>capsule prostatique</b> ?',
      verso: 'Capsule <b>fibro-élastique</b> → envoie des cloisons → délimite des <b>lobules</b>',
      order_index: 60,
    },
    {
      recto: 'Quels sont les <b>2 sphincters</b> prostatiques et leur rôle ?',
      verso: '· Sphincter <b>lisse</b> → empêche l\'écoulement spontané d\'urine\n· Sphincter <b>strié</b> → contrôle <b>volontaire</b> de la miction',
      order_index: 61,
    },
    {
      recto: 'Combien de <b>glandes</b> contient la prostate et de quel type sont-elles ?',
      verso: '~<b>50 glandes tubulo-alvéolaires</b>\nDans un stroma conjonctif (FML, fibres élastiques, vaisseaux, nerfs)',
      order_index: 62,
    },
    {
      recto: 'Quels sont les <b>3 groupes concentriques</b> de glandes prostatiques ?',
      verso: '· Glandes <b>péri-urétrales internes</b>\n· Glandes <b>péri-urétrales externes</b>\n· Glandes <b>principales</b> (périphériques)',
      order_index: 63,
    },
    {
      recto: 'Quels sont les <b>2 types de sécrétion</b> de l\'épithélium prostatique ?',
      verso: '· <b>Mérocrine</b> → respecte la membrane cellulaire\n· <b>Apocrine</b> → emporte le pôle apical de la cellule',
      order_index: 64,
    },
    {
      recto: 'La prostate est-elle <b>hormono-dépendante</b> ?',
      verso: 'Oui, elle possède des <b>récepteurs aux androgènes</b> → glande <b>androgéno-dépendante</b>',
      order_index: 65,
    },
    {
      recto: 'Que sont les <b>corps de Robin</b> (sympexions) ?',
      verso: '<b>Glycoprotéines lamellaires concentriques</b> présentes dans la lumière des acini prostatiques',
      order_index: 66,
    },
    {
      recto: 'Que deviennent les <b>corps de Robin</b> après 40 ans ?',
      verso: 'Ils se <b>calcifient</b> → risque de <b>lithiase prostatique</b>',
      order_index: 67,
    },
    {
      recto: 'Quelle <b>proportion de l\'éjaculat</b> représente la sécrétion prostatique ?',
      verso: '~<b>1/6</b> de l\'éjaculat',
      order_index: 68,
    },
    {
      recto: 'Quel est le <b>pH</b> de la sécrétion prostatique ?',
      verso: 'pH <b>acide</b>\n(contrairement aux vésicules séminales qui sont alcalines)',
      order_index: 69,
    },
    {
      recto: 'Quels sont les principaux <b>composants</b> de la sécrétion prostatique ?',
      verso: '· Facteur de <b>liquéfaction</b> du sperme\n· <b>Spermine/spermidine</b>, albumine\n· <b>Fibrinolysine</b>\n· <b>Acide citrique</b>\n· <b>Phosphatase acide</b>\n· Ions : <b>Zn²⁺</b>, Mg²⁺, Ca²⁺',
      order_index: 70,
    },
    {
      recto: 'Quel <b>ion</b> est particulièrement abondant dans la sécrétion prostatique ?',
      verso: 'Le <b>zinc (Zn²⁺)</b>',
      order_index: 71,
    },
    {
      recto: 'Que sont les <b>glandes bulbo-urétrales</b> (de Cowper) ?',
      verso: '<b>2 glandes tubulo-acineuses</b>, taille d\'un <b>petit pois</b>\nSécrètent un <b>liquide mucoïde</b> → <b>lubrification de l\'urètre</b>',
      order_index: 72,
    },
    {
      recto: 'La sécrétion des glandes bulbo-urétrales est-elle hormono-dépendante ?',
      verso: 'Oui, elle est <b>androgéno-dépendante</b>',
      order_index: 73,
    },
    {
      recto: 'Quels sont les principaux <b>composants du sperme</b> et leur origine ?',
      verso: '· <b>Spermatozoïdes</b> → testicule\n· <b>Liquide séminal</b> → vésicules séminales (50-80%)\n· <b>Sécrétions prostatiques</b> → prostate (1/6)\n· <b>Liquide mucoïde</b> → glandes bulbo-urétrales',
      order_index: 74,
    },
    {
      recto: 'Quel est le marqueur biologique des <b>vésicules séminales</b> ?',
      verso: 'Le <b>fructose</b>',
      order_index: 75,
    },
    {
      recto: 'Quels sont les marqueurs biologiques de la <b>prostate</b> ?',
      verso: '· <b>Phosphatase acide</b>\n· <b>Acide citrique</b>\n· <b>Zinc (Zn²⁺)</b>\n· <b>Spermine</b>',
      order_index: 76,
    },
    {
      recto: 'VRAI ou FAUX : L\'épithélium du canal épididymaire est un épithélium <b>cubique simple</b>.',
      verso: '<b>FAUX</b>\nL\'épithélium du canal épididymaire est <b>prismatique pseudostratifié</b>',
      order_index: 77,
    },
    {
      recto: 'VRAI ou FAUX : La musculeuse de l\'épididyme <b>s\'amincit</b> de la tête vers la queue.',
      verso: '<b>FAUX</b>\nElle <b>s\'épaissit</b> de la tête vers la queue',
      order_index: 78,
    },
    {
      recto: 'VRAI ou FAUX : La <b>queue de l\'épididyme</b> est le lieu de stockage des spermatozoïdes.',
      verso: '<b>VRAI</b>\nLa queue stocke <b>52%</b> de la réserve totale de spermatozoïdes',
      order_index: 79,
    },
    {
      recto: 'VRAI ou FAUX : Le canal déférent fait suite aux <b>tubes droits</b>.',
      verso: '<b>FAUX</b>\nLe canal déférent fait suite au <b>canal épididymaire</b>',
      order_index: 80,
    },
    {
      recto: 'VRAI ou FAUX : La prostate est une glande <b>endocrine</b>.',
      verso: '<b>FAUX</b>\nLa prostate est une glande <b>EXOCRINE</b>',
      order_index: 81,
    },
    {
      recto: 'VRAI ou FAUX : À la naissance, les testicules sont dans le <b>canal inguinal</b>.',
      verso: '<b>FAUX</b>\nÀ la naissance, les testicules sont déjà dans le <b>scrotum</b>',
      order_index: 82,
    },
    {
      recto: 'Quel type d\'<b>épithélium</b> possède le rete testis ?',
      verso: 'Épithélium <b>pavimenteux</b>',
      order_index: 83,
    },
    {
      recto: 'Quelles sont les <b>3 structures</b> androgéno-dépendantes dans l\'appareil génital masculin ?',
      verso: '· <b>Vésicules séminales</b>\n· <b>Prostate</b>\n· <b>Glandes bulbo-urétrales</b>',
      order_index: 84,
    },
    {
      recto: 'Quel est le rôle du <b>lysozyme</b> dans le liquide séminal ?',
      verso: 'Rôle <b>antibactérien</b>\n(Protéine sécrétée par les vésicules séminales)',
      order_index: 85,
    },
    {
      recto: 'Quel est le rôle de la <b>fibrinolysine</b> dans la sécrétion prostatique ?',
      verso: 'Contribue à la <b>liquéfaction du sperme</b> après éjaculation',
      order_index: 86,
    },
    {
      recto: 'Quel type d\'<b>épithélium</b> possède le canal déférent ?',
      verso: 'Épithélium <b>prismatique pseudostratifié</b> avec <b>stéréocils</b>',
      order_index: 87,
    },
    {
      recto: 'Quelle est la longueur du <b>canal éjaculateur</b> ?',
      verso: '~<b>2 cm</b> de long',
      order_index: 88,
    },
    {
      recto: 'Que contient le <b>stroma prostatique</b> ?',
      verso: '· <b>Fibres musculaires lisses (FML)</b>\n· <b>Fibres élastiques</b>\n· Vaisseaux\n· Nerfs',
      order_index: 89,
    },
    {
      recto: 'Quelles cellules assurent la <b>progression des spermatozoïdes</b> dans les canaux efférents ?',
      verso: 'Les <b>cellules ciliées</b> des canaux efférents',
      order_index: 90,
    },
    {
      recto: 'Quel est le <b>volume total moyen</b> d\'un éjaculat ?',
      verso: '~<b>2.5 mL</b> (dont 50-80% provient des vésicules séminales)',
      order_index: 91,
    },
    {
      recto: 'Quels sont les <b>2 types cellulaires</b> de l\'épithélium glandulaire prostatique ?',
      verso: '· <b>Cellules sécrétrices</b>\n· <b>Cellules basales</b> de remplacement',
      order_index: 92,
    },
    {
      recto: 'Quel est le <b>diamètre</b> des canaux efférents ?',
      verso: '<b>0.2 mm</b> (200 μm)',
      order_index: 93,
    },
    {
      recto: 'VRAI ou FAUX : Les <b>stéréocils</b> possèdent des microtubules et un axonème.',
      verso: '<b>FAUX</b>\nLes stéréocils sont <b>sans microtubules</b> et <b>sans axonème</b>\n(Contrairement aux cils vibratiles qui possèdent un axonème)',
      order_index: 94,
    },
    {
      recto: 'Quel est le rôle du <b>fructose</b> dans le liquide séminal ?',
      verso: '· <b>Nutrition</b> des spermatozoïdes (substrat énergétique)\n· Soutien de la <b>mobilité</b> des spermatozoïdes',
      order_index: 95,
    },
  ],

  annales: [
    {
      titre: 'Annale Histologie ACC — Appareil génital masculin — Session 1',
      annee: '2022-2023',
      rappel_cours: 'L\'appareil génital masculin comprend les **testicules** (glande mixte : exocrine et endocrine), les **voies spermatiques** (tubes droits, rete testis, canaux efférents, épididyme, canal déférent, canal éjaculateur, urètre), et les **glandes annexes** (vésicules séminales, prostate, glandes bulbo-urétrales).\n\n· Les **cellules de Sertoli** sont dans l\'épithélium des tubes séminifères, les **cellules de Leydig** dans le tissu interstitiel\n· Les spermatozoïdes sont **NON fécondants** à la sortie du testicule\n· L\'épididyme possède des **stéréocils** (PAS des cils vibratiles), sa musculeuse **s\'épaissit** de la tête vers la queue\n· La queue de l\'épididyme = lieu de **stockage**\n· Le canal déférent fait suite au **canal épididymaire**\n· La prostate est une glande **EXOCRINE** hormono-dépendante',
      questions: [
        {
          enonce: 'Concernant l\'appareil génital masculin, indiquer la ou les proposition(s) exacte(s) :',
          items: [
            { lettre: 'A', enonce: 'Les testicules sont situés dans les bourses (scrotum).', is_correct: true },
            { lettre: 'B', enonce: 'Le testicule est une glande exocrine pure.', is_correct: false },
            { lettre: 'C', enonce: 'L\'albuginée testiculaire est une capsule conjonctive blanche épaisse.', is_correct: true },
            { lettre: 'D', enonce: 'À la naissance, les testicules sont dans le canal inguinal.', is_correct: false },
            { lettre: 'E', enonce: 'Les cellules de Sertoli sont situées dans le tissu interstitiel entre les tubes séminifères.', is_correct: false },
          ],
          correction: '**Réponse : AC**\n\nA. **VRAI** — Les testicules sont bien situés dans les bourses (scrotum).\nB. **FAUX** — Le testicule est une glande **mixte** : à la fois **exocrine** (production de spermatozoïdes) et **endocrine** (sécrétion de testostérone par les cellules de Leydig).\nC. **VRAI** — L\'albuginée testiculaire est bien une capsule conjonctive blanche épaisse qui enveloppe le testicule.\nD. **FAUX** — À la **naissance**, les testicules sont déjà dans le **scrotum** (et non dans le canal inguinal).\nE. **FAUX** — Les cellules de Sertoli sont situées dans l\'**épithélium des tubes séminifères** (et non dans le tissu interstitiel). Ce sont les cellules de **Leydig** qui se trouvent dans le tissu interstitiel.',
        },
        {
          enonce: 'Concernant l\'épididyme, indiquer la proposition exacte (QRU) :',
          items: [
            { lettre: 'A', enonce: 'L\'épididyme fait partie des voies spermatiques intra-testiculaires.', is_correct: false },
            { lettre: 'B', enonce: 'L\'épithélium du canal épididymaire est un épithélium cubique simple.', is_correct: false },
            { lettre: 'C', enonce: 'La queue de l\'épididyme est le lieu de stockage des spermatozoïdes.', is_correct: true },
            { lettre: 'D', enonce: 'Les cellules principales du canal épididymaire possèdent des cils vibratiles.', is_correct: false },
            { lettre: 'E', enonce: 'La musculeuse de l\'épididyme s\'amincit de la tête vers la queue.', is_correct: false },
          ],
          correction: '**Réponse : C**\n\nA. **FAUX** — L\'épididyme fait partie des voies spermatiques **EXTRA-testiculaires** (et non intra-testiculaires).\nB. **FAUX** — L\'épithélium du canal épididymaire est un épithélium **prismatique pseudostratifié** (et non cubique simple).\nC. **VRAI** — La queue (cauda) de l\'épididyme est bien le lieu de **stockage** des spermatozoïdes (52% de la réserve).\nD. **FAUX** — Les cellules principales possèdent des **stéréocils** (et non des cils vibratiles). Les stéréocils sont dépourvus de microtubules et n\'ont pas d\'activité motrice.\nE. **FAUX** — La musculeuse de l\'épididyme **s\'épaissit** de la tête vers la queue (et non s\'amincit).',
        },
        {
          enonce: 'Concernant les glandes annexes et le canal déférent, indiquer la ou les proposition(s) exacte(s) :',
          items: [
            { lettre: 'A', enonce: 'Les vésicules séminales produisent 50 à 80% du volume de l\'éjaculat.', is_correct: true },
            { lettre: 'B', enonce: 'Le fructose est un marqueur des vésicules séminales.', is_correct: true },
            { lettre: 'C', enonce: 'La prostate est une glande endocrine.', is_correct: false },
            { lettre: 'D', enonce: 'La prostate entoure l\'urètre prostatique.', is_correct: true },
            { lettre: 'E', enonce: 'Le canal déférent fait suite aux tubes droits.', is_correct: false },
          ],
          correction: '**Réponse : ABD**\n\nA. **VRAI** — Les vésicules séminales produisent bien 50 à 80% du volume de l\'éjaculat (~2.5 mL).\nB. **VRAI** — Le fructose est le marqueur spécifique des vésicules séminales.\nC. **FAUX** — La prostate est une glande **EXOCRINE** (et non endocrine). Elle sécrète ses produits dans l\'urètre prostatique.\nD. **VRAI** — La prostate entoure bien l\'urètre prostatique, au carrefour uro-génital.\nE. **FAUX** — Le canal déférent fait suite au **canal épididymaire** (et non aux tubes droits). Les tubes droits font la jonction entre les tubes séminifères et le rete testis.',
        },
      ],
    },
    {
      titre: 'Annale Histologie ACC — Appareil génital masculin — Session 1',
      annee: '2021-2022',
      rappel_cours: 'Le testicule est une glande **mixte** (exocrine + endocrine) située dans le scrotum. Les **tubes séminifères** contiennent les cellules de Sertoli et les cellules germinales. Le tissu interstitiel contient les **cellules de Leydig**.\n\n· La spermatogenèse se déroule en 3 phases dans les tubes séminifères\n· L\'épididyme assure le **transport**, la **maturation** (tête/corps) et le **stockage** (queue) des spermatozoïdes\n· Le fructose est le marqueur des **vésicules séminales**\n· La prostate contient ~50 glandes tubulo-alvéolaires, est **exocrine** et **androgéno-dépendante**',
      questions: [
        {
          enonce: 'Concernant le testicule, indiquer la ou les proposition(s) exacte(s) :',
          items: [
            { lettre: 'A', enonce: 'Le testicule est uniquement une glande exocrine.', is_correct: false },
            { lettre: 'B', enonce: 'Les cellules de Leydig se trouvent dans le tissu interstitiel.', is_correct: false },
            { lettre: 'C', enonce: 'L\'albuginée testiculaire forme le corps de Highmore par épaississement.', is_correct: false },
            { lettre: 'D', enonce: 'Chaque lobule testiculaire contient 2 à 3 tubes séminifères.', is_correct: true },
            { lettre: 'E', enonce: 'Les tubes séminifères mesurent entre 30 cm et 1 m de long.', is_correct: false },
          ],
          correction: '**Réponse : D**\n\nA. **FAUX** — Le testicule est une glande **mixte** : exocrine (spermatozoïdes) ET endocrine (testostérone).\nB. **FAUX** — (L\'item tel que formulé dans l\'annale originale était faux selon la correction officielle — réponse D uniquement).\nC. **FAUX** — (L\'item tel que formulé dans l\'annale originale était faux selon la correction officielle — réponse D uniquement).\nD. **VRAI** — Chaque lobule testiculaire contient bien 2 à 3 tubes séminifères, entourés d\'une membrane propre.\nE. **FAUX** — (L\'item tel que formulé dans l\'annale originale était faux selon la correction officielle — réponse D uniquement).',
        },
        {
          enonce: 'Concernant les voies spermatiques et l\'épididyme, indiquer la ou les proposition(s) exacte(s) :',
          items: [
            { lettre: 'A', enonce: 'Les tubes droits possèdent un épithélium pavimenteux.', is_correct: false },
            { lettre: 'B', enonce: 'Le transit épididymaire dure 10 à 12 jours.', is_correct: true },
            { lettre: 'C', enonce: 'Les canaux efférents sont au nombre de 10 à 12.', is_correct: false },
            { lettre: 'D', enonce: 'La maturation des spermatozoïdes a lieu dans la tête et le corps de l\'épididyme.', is_correct: true },
            { lettre: 'E', enonce: 'Le rete testis est un réseau labyrinthique situé dans le corps de Highmore.', is_correct: false },
          ],
          correction: '**Réponse : BD**\n\nA. **FAUX** — Les tubes droits possèdent un épithélium **cubique** (et non pavimenteux). C\'est le rete testis qui a un épithélium pavimenteux.\nB. **VRAI** — Le transit épididymaire dure bien 10 à 12 jours.\nC. **FAUX** — (L\'item tel que formulé dans l\'annale originale était faux selon la correction officielle — réponse BD).\nD. **VRAI** — La maturation des spermatozoïdes a bien lieu dans la tête et le corps de l\'épididyme. Le stockage se fait dans la queue.\nE. **FAUX** — (L\'item tel que formulé dans l\'annale originale était faux selon la correction officielle — réponse BD).',
        },
        {
          enonce: 'Concernant les glandes annexes de l\'appareil génital masculin, indiquer la ou les proposition(s) exacte(s) :',
          items: [
            { lettre: 'A', enonce: 'Les vésicules séminales sécrètent un liquide de pH acide.', is_correct: false },
            { lettre: 'B', enonce: 'Le fructose est un composant du liquide des vésicules séminales.', is_correct: true },
            { lettre: 'C', enonce: 'La prostate contient environ 50 glandes tubulo-alvéolaires.', is_correct: true },
            { lettre: 'D', enonce: 'Les corps de Robin peuvent se calcifier après 40 ans.', is_correct: true },
            { lettre: 'E', enonce: 'La prostate est une glande hormono-dépendante (androgéno-dépendante).', is_correct: true },
          ],
          correction: '**Réponse : BCDE**\n\nA. **FAUX** — Les vésicules séminales sécrètent un liquide de pH **alcalin** (et non acide). C\'est la sécrétion prostatique qui est de pH acide.\nB. **VRAI** — Le fructose est bien un composant essentiel du liquide des vésicules séminales, servant de marqueur spécifique.\nC. **VRAI** — La prostate contient environ 50 glandes tubulo-alvéolaires organisées en 3 groupes concentriques.\nD. **VRAI** — Les corps de Robin (sympexions), glycoprotéines lamellaires concentriques, peuvent se calcifier après 40 ans, entraînant un risque de lithiase prostatique.\nE. **VRAI** — La prostate possède des récepteurs aux androgènes et est donc hormono-dépendante (androgéno-dépendante).',
        },
      ],
    },
  ],
};

export default content;

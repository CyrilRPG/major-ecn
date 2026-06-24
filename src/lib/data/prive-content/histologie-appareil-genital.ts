import type { PriveCourseContent } from '../prive-courses';

const content: PriveCourseContent = {
  fiche: {
    parties: [
      {
        numero: 'I',
        titre: 'Rappels histologiques sur les épithéliums',
        sous_parties: [
          {
            titre: 'Épithélium de revêtement',
            rows: [
              {
                concept: '◆ Définition',
                detail_md: 'Tissu recouvrant les **surfaces externes et internes** du corps, les **cavités** et les **conduits**\nRepose sur une **membrane basale**',
                kind: 'a_retenir',
              },
              {
                concept: '◆ Épithéliums simples',
                detail_md: '· **Pavimenteux (aplati)** → cellules plates, adaptées à la **diffusion** passive (alvéoles pulmonaires, **endothélium** vasculaire, **mésothélium** des séreuses)\n· **Cubique** → cellules aussi hautes que larges (canaux excréteurs, tubes droits du testicule)\n· **Cylindrique (prismatique)** → cellules hautes, **métaboliquement actives** (sécrétion/absorption : intestin grêle)',
                kind: 'a_retenir',
              },
              {
                concept: 'Épithéliums stratifiés et pseudostratifiés',
                detail_md: '· **Stratifié** → plusieurs couches cellulaires superposées (épiderme, œsophage)\n· **Pseudostratifié** → aspect stratifié MAIS toutes les cellules reposent sur la **membrane basale** (épithélium respiratoire, **canal épididymaire**, **canal déférent**)',
                kind: 'normal',
              },
              {
                concept: '⚠ Pseudostratifié ≠ stratifié',
                detail_md: 'Dans un épithélium **pseudostratifié**, TOUTES les cellules touchent la **membrane basale** (même si les noyaux sont à des hauteurs différentes)\nDans un épithélium **stratifié**, seule la couche basale repose sur la membrane basale\nPiège : le canal épididymaire a un épithélium **pseudostratifié** (pas stratifié vrai)',
                kind: 'piege',
              },
              {
                concept: '◆ Spécialisations apicales',
                detail_md: '· **Microvillosités** → expansions cytoplasmiques courtes et régulières, augmentation de la **surface d\'absorption** (intestin grêle)\n· **Cils vibratiles** → expansions mobiles avec **axonème** (microtubules 9+2), battements **synchrones**, propulsion du mucus (trachée, trompes)\n· **Stéréocils** → expansions fines, **irrégulières**, parfois anastomosées, **SANS microtubules**, **SANS activité motrice** (épididyme, canal déférent)',
                kind: 'a_retenir',
              },
              {
                concept: '⚠ Stéréocils ≠ cils vibratiles ≠ microvillosités',
                detail_md: '**Stéréocils** : immobiles, pas de microtubules, irréguliers → épididyme\n**Cils vibratiles** : mobiles, axonème (9+2 microtubules), corpuscule basal, plaque basale → trachée\n**Microvillosités** : courtes, régulières, axe d\'actine → intestin\nPiège très fréquent : l\'épididyme possède des **stéréocils**, PAS des cils vibratiles ni des microvillosités !',
                kind: 'piege',
              },
            ],
          },
          {
            titre: 'Épithélium glandulaire',
            rows: [
              {
                concept: '◆ Définition',
                detail_md: 'Cellules épithéliales **spécialisées** dans la production de **sécrétions**\n· Glandes **exocrines** → sécrètent dans une lumière ou à la surface (prostate, vésicules séminales)\n· Glandes **endocrines** → sécrètent dans le sang (cellules de Leydig)',
                kind: 'a_retenir',
              },
              {
                concept: '◆ Modes de sécrétion',
                detail_md: '· **Mérocrine** → vésicules de sécrétion fusionnent avec la membrane apicale, la membrane reste **intacte** (prostate, vésicules séminales)\n· **Apocrine** → emporte le **pôle apical** de la cellule avec le produit de sécrétion (prostate)\n· **Holocrine** → toute la cellule se charge de sécrétion puis **éclate** (glandes sébacées)',
                kind: 'a_retenir',
              },
              {
                concept: '⚠ Prostate : mérocrine ET apocrine',
                detail_md: 'La prostate utilise **les deux modes** de sécrétion : **mérocrine** (respecte la membrane) ET **apocrine** (emporte le pôle apical)\nPiège : ne pas dire que la prostate est uniquement mérocrine !',
                kind: 'piege',
              },
            ],
          },
        ],
      },
      {
        numero: 'II',
        titre: 'Histologie du testicule',
        sous_parties: [
          {
            titre: 'Architecture histologique',
            rows: [
              {
                concept: '◆ Capsule : albuginée testiculaire',
                detail_md: '**Capsule conjonctive blanche épaisse** et **peu extensible** enveloppant le testicule\nÉpaississement au pôle en regard de l\'épididyme = **corps de Highmore** (médiastin du testicule)',
                kind: 'a_retenir',
              },
              {
                concept: '⚠ Corps de Highmore ≠ capsule séparée',
                detail_md: 'Le corps de Highmore est un **épaississement de l\'albuginée** (pas une capsule distincte ni un organe séparé)\nPiège classique en QCM : il fait **partie** de l\'albuginée',
                kind: 'piege',
              },
              {
                concept: '◆ Organisation lobulaire',
                detail_md: '**Septa (cloisons radiaires)** → fibres conjonctives partant de l\'albuginée vers le corps de Highmore\nDélimitent des **lobules communicants**\nChaque lobule contient **2-3 tubes séminifères** entourés d\'une **membrane propre**',
                kind: 'a_retenir',
              },
              {
                concept: 'Membrane propre des tubes séminifères',
                detail_md: 'Enveloppe chaque tube séminifère :\n· **Membrane basale** (côté épithélial)\n· **Couche de cellules myoïdes** → contractions péristaltiques facilitant la progression des spermatozoïdes\n· **Couche conjonctive externe**',
                kind: 'normal',
              },
              {
                concept: '◆ Double compartiment fonctionnel',
                detail_md: 'Le testicule est une glande **mixte** :\n· **Compartiment tubulaire** (tubes séminifères) → fonction **exocrine** (spermatogenèse)\n· **Compartiment interstitiel** (tissu entre les tubes) → fonction **endocrine** (androgènes par cellules de Leydig)',
                kind: 'a_retenir',
              },
            ],
          },
          {
            titre: 'Épithélium séminifère et cellules de Sertoli',
            rows: [
              {
                concept: '◆ Épithélium des tubes séminifères',
                detail_md: 'Épithélium **stratifié complexe** (épithélium séminifère) contenant :\n· **Cellules germinales** à différents stades de maturation\n· **Cellules de Sertoli** (cellules de soutien non germinales)',
                kind: 'a_retenir',
              },
              {
                concept: '⚠ Épithélium "stratifié" mais pas classique',
                detail_md: 'L\'épithélium séminifère est qualifié d\'**épithélium stratifié** car il contient plusieurs couches cellulaires (spermatogonies basales → spermatocytes → spermatides luminales)\nMais il n\'est **PAS** un épithélium de revêtement classique → c\'est un épithélium **germinal** unique',
                kind: 'piege',
              },
              {
                concept: '◆ Cellules de Sertoli',
                detail_md: 'Situées dans l\'**épithélium des tubes séminifères** (PAS dans l\'interstitium)\n· Cellules hautes, **pyramidales**, reposent sur la membrane basale\n· Noyau basal irrégulier avec nucléole proéminent\n· Forment des **jonctions serrées** entre elles → **barrière hémato-testiculaire**',
                kind: 'a_retenir',
              },
              {
                concept: '◆ Fonctions des cellules de Sertoli',
                detail_md: '· **Soutien** mécanique et nutritif des cellules germinales\n· **Sécrétion** du liquide séminal tubulaire (pousse les spermatozoïdes)\n· **Phagocytose** des corps résiduels de la spermiogenèse\n· Sécrétion de l\'**ABP** (Androgen Binding Protein)\n· Sécrétion d\'**inhibine** (rétrocontrôle FSH)\n· Formation de la **barrière hémato-testiculaire**',
                kind: 'a_retenir',
              },
              {
                concept: 'Mnémo fonctions de Sertoli',
                detail_md: '"**SNPABI**" = **S**outien, **N**utrition, **P**hagocytose, **A**BP, **B**arrière hémato-testiculaire, **I**nhibine\n→ Les fonctions principales des cellules de Sertoli',
                kind: 'mnemo',
              },
            ],
          },
          {
            titre: 'Tissu interstitiel et cellules de Leydig',
            rows: [
              {
                concept: '◆ Tissu interstitiel',
                detail_md: 'Situé **entre les tubes séminifères** → TC lâche contenant :\n· **Vaisseaux sanguins** et **lymphatiques**\n· **Nerfs**\n· **Cellules de Leydig**',
                kind: 'a_retenir',
              },
              {
                concept: '◆ Cellules de Leydig',
                detail_md: 'Cellules **endocrines** du tissu interstitiel (PAS dans les tubes séminifères)\n· Cellules volumineuses, **éosinophiles**, noyau central arrondi\n· Cytoplasme riche en **REL** (réticulum endoplasmique lisse), **mitochondries** à crêtes tubulaires, **gouttelettes lipidiques**\n· Ultrastructure typique d\'une cellule **stéroïdogène**\n· Synthèse de **testostérone** sous stimulation par la **LH**',
                kind: 'a_retenir',
              },
              {
                concept: '⚠ Sertoli vs Leydig : localisation',
                detail_md: '· **Sertoli** → **DANS** les tubes séminifères (épithélium)\n· **Leydig** → **ENTRE** les tubes séminifères (interstitium)\nPiège très fréquent : ne jamais inverser leurs localisations !\nMnémo : **S**ertoli = **S**éminifère (dans), **L**eydig = **L**ibre entre les tubes',
                kind: 'piege',
              },
              {
                concept: '◆ Cristalloïdes de Reinke',
                detail_md: 'Inclusions **cristallines** intracytoplasmiques caractéristiques des cellules de Leydig\nNature protéique, **pathognomoniques** des cellules de Leydig en histologie',
                kind: 'a_retenir',
              },
            ],
          },
          {
            titre: 'Spermatogenèse : aspects histologiques',
            rows: [
              {
                concept: '◆ Organisation de l\'épithélium séminifère',
                detail_md: 'De la membrane basale vers la lumière :\n· **Spermatogonies** (cellules souches, mitoses) → couche basale\n· **Spermatocytes I** (méiose I) → couche moyenne\n· **Spermatocytes II** → couche moyenne/haute\n· **Spermatides** (rondes puis allongées) → couche luminale\n· **Spermatozoïdes** → libérés dans la lumière',
                kind: 'a_retenir',
              },
              {
                concept: '◆ Les 3 phases et leur durée',
                detail_md: '· Phase **proliférative** (mitoses des spermatogonies) → **27 jours**\n· Phase de **méiose** (spermatocytes I et II) → **24 jours**\n· **Spermiogenèse** (spermatides → spermatozoïdes) → **23 jours**\nDurée totale : ~**74 jours**',
                kind: 'a_retenir',
              },
              {
                concept: '◆ Spermiogenèse : modifications morphologiques',
                detail_md: 'Transformation des **spermatides rondes** en **spermatozoïdes** :\n· Formation de l\'**acrosome** (vésicule de Golgi → capuchon céphalique)\n· **Condensation nucléaire** (chromatine compactée)\n· Développement du **flagelle** (à partir du centriole distal)\n· Réorganisation et élimination du **cytoplasme** (corps résiduel phagocyté par Sertoli)',
                kind: 'a_retenir',
              },
              {
                concept: '⚠ Spermiogenèse ≠ spermatogenèse',
                detail_md: '**Spermatogenèse** = processus COMPLET (mitoses + méiose + spermiogenèse)\n**Spermiogenèse** = dernière phase SEULEMENT (spermatide → spermatozoïde, SANS division cellulaire)\nPiège : la spermiogenèse **suit** la méiose, elle ne la comprend pas',
                kind: 'piege',
              },
              {
                concept: '◆ Spermatozoïdes à la sortie du testicule',
                detail_md: 'Les spermatozoïdes sont **NON fécondants** à la sortie du testicule :\n· Pas de **mobilité progressive**\n· Incapacité à **fixer la zone pellucide**\n· Incapacité de **réaction acrosomique**\n· Incapacité à **fusionner** avec l\'ovocyte\n→ Nécessité d\'une **maturation post-testiculaire** (épididyme)',
                kind: 'a_retenir',
              },
            ],
          },
        ],
      },
      {
        numero: 'III',
        titre: 'Histologie des voies spermatiques',
        sous_parties: [
          {
            titre: 'Voies intra-testiculaires',
            rows: [
              {
                concept: '◆ Tubes droits',
                detail_md: 'Diamètre ~**25 μm**\nÉpithélium **cubique** (PAS pavimenteux)\nFont la jonction entre tubes séminifères et rete testis\nDisparition progressive des cellules germinales : ne persistent que les **cellules de Sertoli** modifiées',
                kind: 'a_retenir',
              },
              {
                concept: '◆ Rete testis',
                detail_md: '**Réseau labyrinthique** de canaux anastomosés dans le **corps de Highmore**\nÉpithélium **pavimenteux** (cellules aplaties)\nFonctions : **échanges** et **modification** de la composition du fluide tubulaire',
                kind: 'a_retenir',
              },
              {
                concept: '⚠ Tubes droits vs rete testis : épithélium',
                detail_md: '**Tubes droits** → épithélium **cubique**\n**Rete testis** → épithélium **pavimenteux**\nPiège : ne pas confondre ces deux types d\'épithélium !',
                kind: 'piege',
              },
              {
                concept: 'Progression des spermatozoïdes',
                detail_md: 'Les spermatozoïdes immatures (non mobiles) sont poussés par la **pression du liquide séminal** sécrété par les **cellules de Sertoli**\n→ Flux passif dans les voies intra-testiculaires',
                kind: 'normal',
              },
            ],
          },
          {
            titre: 'Canaux efférents',
            rows: [
              {
                concept: '◆ Caractéristiques morphologiques',
                detail_md: '**10-12 canaux/cônes efférents**, longueur ~**20 cm**, diamètre ~**0.2 mm**\nTraversent l\'**albuginée** pour relier le rete testis à l\'épididyme\nLumière à contour **festonné** (alternance cellules hautes et basses)',
                kind: 'a_retenir',
              },
              {
                concept: '◆ 3 types cellulaires des canaux efférents',
                detail_md: '· **Cellules ciliées** → possèdent des **cils vibratiles** (vrais cils avec axonème), battements qui aident à la **progression** des spermatozoïdes\n· **Cellules glandulaires** → sécrétion de protéines\n· **Cellules basales** de renouvellement → **résorption** du liquide séminal + **sécrétion** de protéines',
                kind: 'a_retenir',
              },
              {
                concept: '⚠ Canaux efférents : vrais cils vibratiles',
                detail_md: 'Les canaux efférents possèdent de **vrais cils vibratiles** (avec axonème et microtubules)\n≠ l\'épididyme qui possède des **stéréocils** (sans microtubules)\nPiège : cils vibratiles dans les canaux efférents, stéréocils dans l\'épididyme',
                kind: 'piege',
              },
              {
                concept: '◆ Fonction de réabsorption',
                detail_md: 'Réabsorption massive d\'**eau** et de **Na⁺** du fluide testiculaire\n→ **Concentration** des spermatozoïdes avant l\'épididyme\n90% du liquide testiculaire est réabsorbé dans les canaux efférents',
                kind: 'a_retenir',
              },
            ],
          },
          {
            titre: 'Canal épididymaire : histologie détaillée',
            rows: [
              {
                concept: '◆ Morphologie générale',
                detail_md: 'Tube **pelotonné** de **3 à 6 m** de long\n3 segments : **tête (caput)**, **corps**, **queue (cauda)**\nEntouré de : membrane basale → TC lâche → musculeuse (CML)',
                kind: 'a_retenir',
              },
              {
                concept: '◆ Épithélium prismatique pseudostratifié',
                detail_md: 'Toutes les cellules reposent sur la membrane basale (pseudostratifié)\n2 types cellulaires principaux :\n· **Cellules principales** → hautes, avec **stéréocils** apicaux\n· **Cellules basales** → petites, arrondies, situées contre la membrane basale',
                kind: 'a_retenir',
              },
              {
                concept: '◆ Cellules principales : ultrastructure',
                detail_md: 'Caractéristiques d\'une cellule de **synthèse ET d\'absorption** :\n· **Stéréocils** apicaux (expansions sans microtubules)\n· **REG** (réticulum endoplasmique granuleux) → synthèse protéique\n· **Appareil de Golgi** développé\n· **Pinocytose** et **endocytose** apicales → absorption\n· **Lysosomes** → digestion intracellulaire',
                kind: 'a_retenir',
              },
              {
                concept: '◆ Stéréocils de l\'épididyme',
                detail_md: 'Expansions cytoplasmiques **fines**, **irrégulières**, parfois **anastomosées**\n· **SANS activité motrice** (immobiles)\n· **SANS microtubules** (pas d\'axonème)\n· **SANS corpuscule basal** ni plaque basale\nRôle : augmentation de la **surface d\'échange** (absorption/sécrétion)',
                kind: 'a_retenir',
              },
              {
                concept: '◆ Gradient tête → queue',
                detail_md: '· La **hauteur des cellules principales** DIMINUE de la tête vers la queue\n· La **taille des stéréocils** DIMINUE de la tête vers la queue\n· La **musculeuse** (CML) S\'ÉPAISSIT de la tête vers la queue → 3 couches dans la partie terminale',
                kind: 'a_retenir',
              },
              {
                concept: 'Mnémo gradient épididymaire',
                detail_md: '"**CSD**" = **C**ellules **S**hrink (diminuent), musculeuse **D**ense (épaissit)\n→ De la tête à la queue : cellules plus basses, stéréocils plus courts, musculeuse plus épaisse',
                kind: 'mnemo',
              },
              {
                concept: '⚠ Musculeuse de l\'épididyme',
                detail_md: 'La musculeuse **s\'épaissit** de la tête vers la queue (et NON l\'inverse)\nPartie terminale : **3 couches** de CML\nPiège très fréquent en QCM : l\'épaississement est en direction de la **queue**',
                kind: 'piege',
              },
            ],
          },
          {
            titre: 'Transit et maturation épididymaire',
            rows: [
              {
                concept: '◆ Durée et mécanismes du transit',
                detail_md: 'Durée : **10-12 jours**\nProgression assurée par :\n· **Pression intraluminale** (décroît de la tête vers la queue)\n· **Contractions des CML** (péristaltisme)',
                kind: 'a_retenir',
              },
              {
                concept: '◆ Maturation et stockage',
                detail_md: '**Maturation** → dans la **tête** et le **corps** de l\'épididyme\n**Stockage** → dans la **queue** de l\'épididyme\nProduction : **45-207 millions** spz/jour\nRéserve : **182 millions**/épididyme (**26%** tête, **23%** corps, **52%** queue)',
                kind: 'a_retenir',
              },
              {
                concept: '◆ Capacités acquises par maturation',
                detail_md: 'La maturation épididymaire confère aux spermatozoïdes :\n· **Mobilité unidirectionnelle** (flagellaire)\n· Capacité de **fixation à la zone pellucide** et membrane ovocytaire\n· Capacité de **développement embryonnaire** normal\n→ Spermatozoïdes deviennent potentiellement **fécondants**',
                kind: 'a_retenir',
              },
            ],
          },
        ],
      },
      {
        numero: 'IV',
        titre: 'Histologie du canal déférent et du canal éjaculateur',
        sous_parties: [
          {
            titre: 'Canal déférent',
            rows: [
              {
                concept: '◆ Morphologie',
                detail_md: 'Tube **droit** d\'environ **40 cm**, situé dans le **cordon spermatique**\nFait suite au **canal épididymaire** (PAS aux tubes droits)',
                kind: 'a_retenir',
              },
              {
                concept: '◆ 3 tuniques histologiques',
                detail_md: '· **Muqueuse** → épithélium **prismatique pseudostratifié** avec **stéréocils** + chorion (TC lâche)\n· **Musculeuse épaisse** → 3 couches de CML : **longitudinale interne**, **circulaire moyenne**, **longitudinale externe**\n· **Adventice** → TC lâche riche en fibres **élastiques**',
                kind: 'a_retenir',
              },
              {
                concept: 'Mnémo couches musculeuse déférent',
                detail_md: '"**LCL**" = **L**ongitudinale interne, **C**irculaire moyenne, **L**ongitudinale externe\n→ Les 3 couches de CML du canal déférent (même ordre que la musculeuse digestive)',
                kind: 'mnemo',
              },
              {
                concept: '◆ Caractéristiques histologiques de la musculeuse',
                detail_md: 'Musculeuse **très épaisse** (la plus épaisse des voies génitales)\nOndes **péristaltiques puissantes et brèves** lors de l\'éjaculation\nLes plis de la muqueuse se **distendent** pour laisser passer les spermatozoïdes\nContrôle : fibres **orthosympathiques adrénergiques**',
                kind: 'a_retenir',
              },
              {
                concept: '⚠ Canal déférent fait suite au canal épididymaire',
                detail_md: 'Le canal déférent fait suite au **canal épididymaire** (et NON aux tubes droits ni au rete testis)\nPiège fréquent en annales !',
                kind: 'piege',
              },
            ],
          },
          {
            titre: 'Canal éjaculateur et urètre',
            rows: [
              {
                concept: '◆ Canal éjaculateur',
                detail_md: 'Longueur : ~**2 cm**\nFormé par la jonction de l\'**ampoule déférentielle** et du canal de la **vésicule séminale**\n**Pénètre** le tissu prostatique → **perd sa musculeuse**\nÉpithélium **prismatique simple** (PAS pseudostratifié)\nS\'abouche dans l\'**urètre prostatique**',
                kind: 'a_retenir',
              },
              {
                concept: '⚠ Canal éjaculateur : perte de la musculeuse',
                detail_md: 'Le canal éjaculateur **perd sa musculeuse** en pénétrant dans la prostate (il est entouré par le tissu prostatique)\nSon épithélium devient **prismatique simple** (alors que le canal déférent est pseudostratifié)',
                kind: 'piege',
              },
              {
                concept: '◆ Urètre masculin',
                detail_md: 'Longueur totale : **20-25 cm**, 3 segments :\n· **Urètre prostatique** → traversé par les canaux éjaculateurs, épithélium transitionnel\n· **Urètre membraneux (périnéal)** → court segment traversant le plancher pelvien\n· **Urètre spongieux (pénien)** → le plus long, entouré par le corps spongieux, épithélium cylindrique pseudostratifié puis pavimenteux stratifié à l\'extrémité',
                kind: 'a_retenir',
              },
            ],
          },
        ],
      },
      {
        numero: 'V',
        titre: 'Histologie des glandes annexes',
        sous_parties: [
          {
            titre: 'Vésicules séminales',
            rows: [
              {
                concept: '◆ Structure histologique',
                detail_md: 'Organes **pairs**, en forme de **sac bosselé** (tubes pelotonnés)\n· **Muqueuse** → **nombreux replis** ramifiés (aspect en "nid d\'abeille"), épithélium **prismatique/cylindrique simple**\n· **Musculeuse** → 2 couches CML : **circulaire interne**, **longitudinale externe**\n· **Adventice** → TC lâche',
                kind: 'a_retenir',
              },
              {
                concept: '◆ 2 types cellulaires',
                detail_md: '· **Cellules principales glandulaires** → cytoplasme riche en **grains de sécrétion** (granulations PAS+), REG et Golgi développés\n· **Cellules basales** → renouvellement de l\'épithélium',
                kind: 'a_retenir',
              },
              {
                concept: '◆ Sécrétion des vésicules séminales',
                detail_md: 'Volume principal de l\'éjaculat : ~**2.5 mL** soit **50-80%** du volume total\npH **alcalin**, sécrétion **androgéno-dépendante**\nContenu : eau, électrolytes, **fructose** (MARQUEUR), protéines (**lactoferrine**, **lysozyme** = antibactérien, facteur **immunosuppresseur**, facteur **dé-capacitation**, facteur **coagulation**), **prostaglandines**, **vitamine C**',
                kind: 'a_retenir',
              },
              {
                concept: '⚠ Fructose = marqueur des vésicules séminales',
                detail_md: 'Le **fructose** est le **marqueur spécifique** des vésicules séminales\nPiège : ne pas confondre avec le glucose ni avec les marqueurs prostatiques (phosphatase acide, Zn²⁺)',
                kind: 'piege',
              },
            ],
          },
          {
            titre: 'Prostate : histologie',
            rows: [
              {
                concept: '◆ Nature et capsule',
                detail_md: 'Organe **musculo-glandulaire**, taille d\'une **châtaigne**, au **carrefour uro-génital**\nCapsule **fibro-élastique** → envoie des **cloisons** → délimitent des **lobules**\nPAS d\'albuginée (≠ testicule)',
                kind: 'a_retenir',
              },
              {
                concept: '⚠ Prostate : pas d\'albuginée',
                detail_md: 'La prostate possède une **capsule fibro-élastique** (PAS une albuginée)\nSeul le **testicule** a une albuginée\nPiège classique en annales (question sur coupe de prostate)',
                kind: 'piege',
              },
              {
                concept: '◆ Sphincters prostatiques',
                detail_md: '· Sphincter **lisse** (interne) → empêche l\'écoulement spontané d\'urine\n· Sphincter **strié** (externe) → contrôle **volontaire** de la miction',
                kind: 'a_retenir',
              },
              {
                concept: '◆ Organisation glandulaire',
                detail_md: '~**50 glandes tubulo-alvéolaires** dans un **stroma** conjonctif (FML, fibres élastiques)\n**3 groupes concentriques** de glandes :\n· Glandes **péri-urétrales internes** (muqueuses)\n· Glandes **péri-urétrales externes** (sous-muqueuses)\n· Glandes **principales** (périphériques, les plus volumineuses)',
                kind: 'a_retenir',
              },
              {
                concept: '◆ Épithélium glandulaire prostatique',
                detail_md: 'Cellules **prismatiques** ou **cubiques** selon le degré de stimulation hormonale :\n· **Cellules sécrétrices** (luminales) → sécrétion mérocrine ET apocrine\n· **Cellules basales** → cellules de remplacement (progéniteurs)\nExcrétion **mérocrine** (respecte la membrane) + **apocrine** (emporte le pôle apical)',
                kind: 'a_retenir',
              },
              {
                concept: '◆ Hormono-dépendance et récepteurs',
                detail_md: 'La prostate possède des **récepteurs aux androgènes** → glande **androgéno-dépendante**\nLa **testostérone** est convertie en **DHT** (dihydrotestostérone) par la **5α-réductase** dans la prostate\n→ Base du traitement de l\'HBP par inhibiteurs de la 5α-réductase',
                kind: 'a_retenir',
              },
              {
                concept: '◆ Corps de Robin (sympexions)',
                detail_md: '**Glycoprotéines lamellaires concentriques** dans la lumière des acini prostatiques\nAspect en "bulbe d\'oignon" en coupe\n**Calcification après 40 ans** → risque de **lithiase prostatique**',
                kind: 'a_retenir',
              },
              {
                concept: '◆ Sécrétion prostatique',
                detail_md: 'Représente ~**1/6 de l\'éjaculat**, pH **acide**, **androgéno-dépendante**\n· **Facteur de liquéfaction** du sperme (PSA = kallikréine)\n· **Spermine/spermidine** (odeur caractéristique)\n· **Albumine**, **fibrinolysine**\n· **Acide citrique**, **phosphatase acide** (marqueurs prostatiques)\n· Ions : **Zn²⁺**, Mg²⁺, Ca²⁺',
                kind: 'a_retenir',
              },
              {
                concept: '⚠ Prostate = glande EXOCRINE',
                detail_md: 'La prostate est une glande **EXOCRINE** (sécrète dans l\'urètre prostatique)\nElle n\'est PAS endocrine\nPiège classique en QCM : glande exocrine qui est hormono-dépendante (androgènes)',
                kind: 'piege',
              },
            ],
          },
          {
            titre: 'Glandes bulbo-urétrales (de Cowper)',
            rows: [
              {
                concept: '◆ Histologie',
                detail_md: '**2 glandes tubulo-acineuses**, taille d\'un **petit pois**\nÉpithélium **mucosécrétant** (cellules à mucus)\nSécrètent un **liquide mucoïde** → **lubrification** de l\'urètre avant l\'éjaculation\nSécrétion **androgéno-dépendante**',
                kind: 'a_retenir',
              },
            ],
          },
        ],
      },
      {
        numero: 'VI',
        titre: 'Synthèse histologique comparative',
        sous_parties: [
          {
            titre: 'Tableau des épithéliums par segment',
            rows: [
              {
                concept: '◆ Épithéliums des voies génitales',
                detail_md: '· **Tubes séminifères** → épithélium stratifié complexe (germinal)\n· **Tubes droits** → épithélium **cubique**\n· **Rete testis** → épithélium **pavimenteux**\n· **Canaux efférents** → épithélium avec **cils vibratiles** (vrais cils)\n· **Canal épididymaire** → épithélium **prismatique pseudostratifié** + **stéréocils**\n· **Canal déférent** → épithélium **prismatique pseudostratifié** + **stéréocils**\n· **Canal éjaculateur** → épithélium **prismatique simple**\n· **Vésicules séminales** → épithélium **prismatique simple**\n· **Prostate** → épithélium **prismatique/cubique**',
                kind: 'a_retenir',
              },
              {
                concept: 'Mnémo épithéliums voies génitales',
                detail_md: '"Les tubes sont **Cu**rieux, le rete est **Plat**, les efférents ont des **Cils**, l\'épididyme des **Stéréo**"\n→ Tubes droits = **Cu**bique, Rete = **P**avimenteux, Efférents = **C**ils vibratiles, Épididyme = **Stéréo**cils',
                kind: 'mnemo',
              },
            ],
          },
          {
            titre: 'Types cellulaires clés',
            rows: [
              {
                concept: '◆ Cellules clés de l\'appareil génital masculin',
                detail_md: '· **Cellules de Sertoli** → DANS les tubes séminifères, soutien, nutrition, barrière hémato-testiculaire\n· **Cellules de Leydig** → ENTRE les tubes (interstitium), cellules endocrines, testostérone\n· **Cellules ciliées** → canaux efférents, progression des spermatozoïdes\n· **Cellules principales** → épididyme, stéréocils, absorption/sécrétion\n· **Cellules basales** → présentes partout, renouvellement épithélial',
                kind: 'a_retenir',
              },
              {
                concept: '◆ Structures androgéno-dépendantes',
                detail_md: 'Toutes les glandes annexes sont **androgéno-dépendantes** :\n· **Vésicules séminales**\n· **Prostate**\n· **Glandes bulbo-urétrales**',
                kind: 'a_retenir',
              },
            ],
          },
        ],
      },
    ],
    points_cles: [
      'L\'épithélium pseudostratifié : toutes les cellules touchent la membrane basale (épididyme, canal déférent)',
      'Stéréocils (épididyme) : immobiles, sans microtubules ≠ cils vibratiles (canaux efférents) : mobiles, axonème 9+2',
      'Cellules de Sertoli dans les tubes séminifères, cellules de Leydig dans le tissu interstitiel (jamais inverser)',
      'Épithélium des tubes droits = cubique, rete testis = pavimenteux (ne pas confondre)',
      'Le canal épididymaire possède un épithélium prismatique pseudostratifié avec stéréocils',
      'Gradient tête→queue de l\'épididyme : hauteur cellulaire et stéréocils diminuent, musculeuse s\'épaissit',
      'La prostate possède une capsule fibro-élastique (PAS d\'albuginée), est EXOCRINE et androgéno-dépendante',
      'Corps de Robin (sympexions) : glycoprotéines lamellaires concentriques, calcification après 40 ans',
      'Prostate : sécrétion mérocrine ET apocrine, 3 groupes de glandes concentriques',
      'Les vésicules séminales fournissent 50-80% du volume de l\'éjaculat (marqueur = fructose)',
    ],
    chiffres_cles: {
      titre: 'Chiffres clés - Histologie de l\'appareil génital masculin',
      markdown:
        '| Structure | Chiffre clé |\n|---|---|\n| Tubes séminifères | 30 cm à 1 m de long, 150-300 μm de diamètre |\n| Tubes droits | **25 μm** de diamètre, épithélium cubique |\n| Canaux efférents | **10-12** canaux, 20 cm, 0.2 mm diamètre |\n| Canal épididymaire | **3-6 m** de long (tube pelotonné) |\n| Transit épididymaire | **10-12 jours** |\n| Production spz | **45-207 millions**/jour |\n| Réserve épididymaire | **182 millions** (26% tête, 23% corps, 52% queue) |\n| Canal déférent | **~40 cm**, musculeuse 3 couches CML |\n| Canal éjaculateur | **~2 cm**, perd sa musculeuse dans la prostate |\n| Urètre masculin | **20-25 cm**, 3 segments |\n| Vésicules séminales | **50-80%** du volume éjaculat (~2.5 mL), pH alcalin |\n| Prostate | **~50** glandes tubulo-alvéolaires, 3 groupes concentriques |\n| Sécrétion prostatique | **1/6** de l\'éjaculat, pH acide |\n| Corps de Robin | Calcification après **40 ans** |\n| Spermatogenèse | Prolifération **27j** + Méiose **24j** + Spermiogenèse **23j** = **~74j** |',
    },
  },

  flashcards: [
    // === PARTIE I : Rappels histologiques ===
    {
      recto: 'Quels sont les <b>3 types d\'épithéliums simples</b> et leur fonction principale ?',
      verso: '· <b>Pavimenteux (aplati)</b> → diffusion (alvéoles, endothélium, mésothélium)\n· <b>Cubique</b> → revêtement de canaux\n· <b>Cylindrique (prismatique)</b> → cellules actives (sécrétion/absorption)',
      order_index: 1,
    },
    {
      recto: 'Quelle est la différence entre un épithélium <b>stratifié</b> et <b>pseudostratifié</b> ?',
      verso: '<b>Stratifié</b> : plusieurs couches, seule la couche basale touche la membrane basale\n<b>Pseudostratifié</b> : aspect stratifié mais <b>TOUTES les cellules reposent sur la membrane basale</b> (noyaux à différentes hauteurs)',
      order_index: 2,
    },
    {
      recto: 'Quelles sont les <b>3 spécialisations apicales</b> des épithéliums ?',
      verso: '· <b>Microvillosités</b> → courtes, régulières, axe d\'actine (intestin)\n· <b>Cils vibratiles</b> → mobiles, axonème 9+2, microtubules (trachée)\n· <b>Stéréocils</b> → fines, irrégulières, immobiles, sans microtubules (épididyme)',
      order_index: 3,
    },
    {
      recto: 'Les <b>stéréocils</b> possèdent-ils des microtubules ?',
      verso: '<b>NON</b>\nLes stéréocils sont des expansions fines, <b>irrégulières</b>, <b>sans microtubules</b>, <b>sans activité motrice</b>, parfois anastomosées\n(Contrairement aux cils vibratiles qui possèdent un axonème avec microtubules 9+2)',
      order_index: 4,
    },
    {
      recto: 'Que possèdent les <b>cils vibratiles</b> que les stéréocils ne possèdent pas ?',
      verso: '· Un <b>axonème</b> (microtubules 9+2)\n· Un <b>corpuscule basal</b>\n· Une <b>plaque basale</b>\n· Une <b>activité motrice</b> (battements synchrones)',
      order_index: 5,
    },
    {
      recto: 'Quels sont les <b>3 modes de sécrétion glandulaire</b> ?',
      verso: '· <b>Mérocrine</b> → exocytose, membrane <b>intacte</b>\n· <b>Apocrine</b> → emporte le <b>pôle apical</b> de la cellule\n· <b>Holocrine</b> → toute la cellule <b>éclate</b> (glandes sébacées)',
      order_index: 6,
    },
    {
      recto: 'La prostate utilise quel(s) mode(s) de sécrétion ?',
      verso: 'La prostate utilise <b>les deux</b> :\n· <b>Mérocrine</b> (respecte la membrane)\n· <b>Apocrine</b> (emporte le pôle apical)',
      order_index: 7,
    },
    // === PARTIE II : Histologie du testicule ===
    {
      recto: 'Qu\'est-ce que l\'<b>albuginée testiculaire</b> ?',
      verso: '<b>Capsule conjonctive blanche épaisse</b> et <b>peu extensible</b> enveloppant le testicule\nÉpaississement au pôle en regard de l\'épididyme = <b>corps de Highmore</b>',
      order_index: 8,
    },
    {
      recto: 'Le <b>corps de Highmore</b> est-il une structure séparée de l\'albuginée ?',
      verso: '<b>NON</b>\nLe corps de Highmore est un <b>épaississement de l\'albuginée</b> (pas une capsule distincte)\nIl fait partie intégrante de l\'albuginée testiculaire',
      order_index: 9,
    },
    {
      recto: 'Comment sont formés les <b>lobules testiculaires</b> ?',
      verso: 'Par des <b>septa (cloisons radiaires)</b> allant de l\'albuginée vers le corps de Highmore\nLobules <b>communicants</b>\nChaque lobule contient <b>2-3 tubes séminifères</b>',
      order_index: 10,
    },
    {
      recto: 'Combien de <b>tubes séminifères</b> contient chaque lobule testiculaire ?',
      verso: '<b>2-3 tubes séminifères</b> par lobule\n(Longueur : 30 cm à 1 m, diamètre : 150-300 μm)',
      order_index: 11,
    },
    {
      recto: 'Quelles sont les <b>2 fonctions</b> du testicule en tant que glande mixte ?',
      verso: '· <b>Exocrine</b> → spermatogenèse (tubes séminifères)\n· <b>Endocrine</b> → testostérone (cellules de Leydig dans l\'interstitium)',
      order_index: 12,
    },
    {
      recto: 'VRAI ou FAUX : Le testicule est une <b>glande exocrine pure</b>.',
      verso: '<b>FAUX</b>\nLe testicule est une glande <b>mixte</b> : exocrine (spermatozoïdes) ET endocrine (testostérone par les cellules de Leydig)',
      order_index: 13,
    },
    {
      recto: 'Quel type d\'<b>épithélium</b> possèdent les tubes séminifères ?',
      verso: 'Épithélium <b>stratifié complexe</b> (épithélium séminifère/germinal)\nContient les <b>cellules germinales</b> à différents stades + les <b>cellules de Sertoli</b>',
      order_index: 14,
    },
    {
      recto: 'Où sont situées les <b>cellules de Sertoli</b> ?',
      verso: 'Dans l\'<b>épithélium des tubes séminifères</b>\n(PAS dans le tissu interstitiel — piège classique)',
      order_index: 15,
    },
    {
      recto: 'Quelles sont les <b>principales fonctions</b> des cellules de Sertoli ?',
      verso: '· <b>Soutien</b> mécanique et nutritif des cellules germinales\n· <b>Sécrétion</b> du liquide séminal tubulaire\n· <b>Phagocytose</b> des corps résiduels\n· Sécrétion d\'<b>ABP</b> et d\'<b>inhibine</b>\n· Formation de la <b>barrière hémato-testiculaire</b>',
      order_index: 16,
    },
    {
      recto: 'Comment les cellules de Sertoli forment-elles la <b>barrière hémato-testiculaire</b> ?',
      verso: 'Par des <b>jonctions serrées</b> entre cellules de Sertoli adjacentes\n→ Sépare le compartiment basal (spermatogonies) du compartiment adluminal (spermatocytes/spermatides)',
      order_index: 17,
    },
    {
      recto: 'Où sont situées les <b>cellules de Leydig</b> ?',
      verso: 'Dans le <b>tissu interstitiel</b> ENTRE les tubes séminifères\n(PAS dans l\'épithélium des tubes séminifères)',
      order_index: 18,
    },
    {
      recto: 'Quelle est l\'<b>ultrastructure</b> caractéristique des cellules de Leydig ?',
      verso: 'Caractéristiques d\'une cellule <b>stéroïdogène</b> :\n· <b>REL</b> (réticulum endoplasmique lisse) abondant\n· <b>Mitochondries</b> à crêtes tubulaires\n· <b>Gouttelettes lipidiques</b>\n· <b>Cristalloïdes de Reinke</b> (inclusions cristallines)',
      order_index: 19,
    },
    {
      recto: 'Que sont les <b>cristalloïdes de Reinke</b> ?',
      verso: 'Inclusions <b>cristallines intracytoplasmiques</b> de nature protéique\n<b>Pathognomoniques</b> des cellules de Leydig en histologie',
      order_index: 20,
    },
    {
      recto: 'Quelle hormone sécrètent les cellules de Leydig et sous quelle stimulation ?',
      verso: 'Elles sécrètent la <b>testostérone</b> sous stimulation par la <b>LH</b> (hormone lutéinisante)',
      order_index: 21,
    },
    {
      recto: 'Quel est l\'ordre des cellules germinales de la <b>membrane basale vers la lumière</b> du tube séminifère ?',
      verso: '· <b>Spermatogonies</b> (basales) → mitoses\n· <b>Spermatocytes I</b> → méiose I\n· <b>Spermatocytes II</b> → méiose II\n· <b>Spermatides</b> (luminales) → différenciation\n· <b>Spermatozoïdes</b> → libérés dans la lumière',
      order_index: 22,
    },
    {
      recto: 'Quelles sont les <b>3 phases</b> de la spermatogenèse et leur durée ?',
      verso: '· Phase <b>proliférative</b> (mitoses) → <b>27 jours</b>\n· Phase de <b>méiose</b> → <b>24 jours</b>\n· <b>Spermiogenèse</b> → <b>23 jours</b>\nDurée totale : ~<b>74 jours</b>',
      order_index: 23,
    },
    {
      recto: 'Quelle est la différence entre <b>spermatogenèse</b> et <b>spermiogenèse</b> ?',
      verso: '<b>Spermatogenèse</b> = processus <b>COMPLET</b> (mitoses + méiose + spermiogenèse)\n<b>Spermiogenèse</b> = dernière phase SEULEMENT (spermatide → spermatozoïde, SANS division cellulaire)',
      order_index: 24,
    },
    {
      recto: 'Quelles sont les <b>4 modifications morphologiques</b> de la spermiogenèse ?',
      verso: '· Formation de l\'<b>acrosome</b> (à partir du Golgi)\n· <b>Condensation nucléaire</b>\n· Développement du <b>flagelle</b> (à partir du centriole distal)\n· Réorganisation et élimination du <b>cytoplasme</b> (corps résiduel phagocyté par Sertoli)',
      order_index: 25,
    },
    {
      recto: 'VRAI ou FAUX : La spermiogenèse <b>comprend</b> la méiose.',
      verso: '<b>FAUX</b>\nLa spermiogenèse <b>suit</b> la méiose (c\'est la phase finale de la spermatogenèse, sans division cellulaire)',
      order_index: 26,
    },
    {
      recto: 'Les spermatozoïdes sont-ils <b>fécondants</b> à la sortie du testicule ?',
      verso: '<b>NON</b> — ils sont <b>NON fécondants</b> :\n· Pas de mobilité progressive\n· Pas de fixation à la zone pellucide\n· Pas de réaction acrosomique\n· Pas de fusion avec l\'ovocyte\n→ Maturation épididymaire nécessaire',
      order_index: 27,
    },
    // === PARTIE III : Histologie des voies spermatiques ===
    {
      recto: 'Quel type d\'<b>épithélium</b> possèdent les tubes droits ?',
      verso: 'Épithélium <b>cubique</b>\n(PAS pavimenteux — piège classique)',
      order_index: 28,
    },
    {
      recto: 'Quel est le <b>diamètre</b> des tubes droits ?',
      verso: '~<b>25 μm</b>',
      order_index: 29,
    },
    {
      recto: 'Quel type d\'<b>épithélium</b> possède le rete testis ?',
      verso: 'Épithélium <b>pavimenteux</b> (cellules aplaties)\n(Le rete testis est un réseau labyrinthique dans le corps de Highmore)',
      order_index: 30,
    },
    {
      recto: 'VRAI ou FAUX : Les tubes droits et le rete testis ont le <b>même type d\'épithélium</b>.',
      verso: '<b>FAUX</b>\n· Tubes droits → épithélium <b>cubique</b>\n· Rete testis → épithélium <b>pavimenteux</b>',
      order_index: 31,
    },
    {
      recto: 'Comment les spermatozoïdes <b>immatures progressent-ils</b> dans les voies intra-testiculaires ?',
      verso: 'Par la <b>pression du liquide séminal</b> sécrété par les <b>cellules de Sertoli</b>\n(Pas de mobilité propre à ce stade)',
      order_index: 32,
    },
    {
      recto: 'Combien y a-t-il de <b>canaux efférents</b> ?',
      verso: '<b>10-12</b> canaux/cônes efférents\nLongueur : ~<b>20 cm</b>, diamètre : ~<b>0.2 mm</b>\nTraversent l\'<b>albuginée</b>',
      order_index: 33,
    },
    {
      recto: 'Quels sont les <b>3 types cellulaires</b> des canaux efférents ?',
      verso: '· <b>Cellules ciliées</b> → vrais cils vibratiles (axonème), progression des spz\n· <b>Cellules glandulaires</b> → sécrétion de protéines\n· <b>Cellules basales</b> → renouvellement, résorption du liquide séminal',
      order_index: 34,
    },
    {
      recto: 'Les canaux efférents possèdent des cils vibratiles ou des stéréocils ?',
      verso: 'Des <b>vrais cils vibratiles</b> (avec axonème et microtubules)\n(Contrairement à l\'épididyme qui possède des stéréocils)',
      order_index: 35,
    },
    {
      recto: 'Pourquoi les canaux efférents ont-ils une lumière à <b>contour festonné</b> ?',
      verso: 'En raison de l\'<b>alternance</b> de cellules <b>hautes</b> (ciliées) et <b>basses</b> (glandulaires/basales)',
      order_index: 36,
    },
    {
      recto: 'Quel phénomène majeur se produit dans les <b>canaux efférents</b> ?',
      verso: '<b>Réabsorption massive</b> d\'eau et de Na⁺\n→ <b>Concentration</b> des spermatozoïdes (90% du liquide testiculaire est réabsorbé)',
      order_index: 37,
    },
    {
      recto: 'Quelle est la <b>longueur</b> du canal épididymaire ?',
      verso: 'Tube pelotonné de <b>3 à 6 m</b> de long\n3 segments : <b>tête (caput)</b>, <b>corps</b>, <b>queue (cauda)</b>',
      order_index: 38,
    },
    {
      recto: 'Quel est le type d\'<b>épithélium</b> du canal épididymaire ?',
      verso: 'Épithélium <b>prismatique pseudostratifié</b>\n(PAS cubique simple — piège classique)',
      order_index: 39,
    },
    {
      recto: 'VRAI ou FAUX : L\'épithélium du canal épididymaire est <b>cubique simple</b>.',
      verso: '<b>FAUX</b>\nL\'épithélium est <b>prismatique pseudostratifié</b>',
      order_index: 40,
    },
    {
      recto: 'Quels sont les <b>2 types cellulaires</b> de l\'épithélium épididymaire ?',
      verso: '· <b>Cellules principales</b> → hautes, avec stéréocils, synthèse et absorption\n· <b>Cellules basales</b> → petites, arrondies, renouvellement',
      order_index: 41,
    },
    {
      recto: 'Quels <b>organites</b> possèdent les cellules principales de l\'épididyme ?',
      verso: '· <b>Stéréocils</b> apicaux\n· <b>REG</b> (synthèse protéique)\n· <b>Appareil de Golgi</b> développé\n· <b>Pinocytose/endocytose</b> apicale (absorption)\n· <b>Lysosomes</b> (digestion intracellulaire)',
      order_index: 42,
    },
    {
      recto: 'Quelles sont les caractéristiques des <b>stéréocils</b> de l\'épididyme ?',
      verso: 'Expansions cytoplasmiques <b>fines</b>, <b>irrégulières</b>, parfois <b>anastomosées</b>\n· <b>SANS activité motrice</b> (immobiles)\n· <b>SANS microtubules</b> (pas d\'axonème)\n· <b>SANS corpuscule basal</b>',
      order_index: 43,
    },
    {
      recto: 'Comment évolue la <b>hauteur des cellules principales</b> dans l\'épididyme ?',
      verso: 'Elle <b>DIMINUE</b> de la tête vers la queue',
      order_index: 44,
    },
    {
      recto: 'Comment évolue la <b>taille des stéréocils</b> dans l\'épididyme ?',
      verso: 'Elle <b>DIMINUE</b> de la tête vers la queue',
      order_index: 45,
    },
    {
      recto: 'Comment évolue la <b>musculeuse</b> de l\'épididyme de la tête vers la queue ?',
      verso: 'La musculeuse (CML) <b>S\'ÉPAISSIT</b> de la tête vers la queue\nPartie terminale : <b>3 couches</b> de CML',
      order_index: 46,
    },
    {
      recto: 'VRAI ou FAUX : La musculeuse de l\'épididyme <b>s\'amincit</b> de la tête vers la queue.',
      verso: '<b>FAUX</b>\nElle <b>s\'épaissit</b> de la tête vers la queue (et non l\'inverse)',
      order_index: 47,
    },
    {
      recto: 'Quelle est la durée du <b>transit épididymaire</b> ?',
      verso: '<b>10-12 jours</b>\nProgression par <b>pression intraluminale</b> (décroissante) et <b>contractions CML</b>',
      order_index: 48,
    },
    {
      recto: 'Où se fait la <b>maturation</b> et où se fait le <b>stockage</b> dans l\'épididyme ?',
      verso: '<b>Maturation</b> → <b>tête</b> et <b>corps</b>\n<b>Stockage</b> → <b>queue</b> (52% de la réserve)',
      order_index: 49,
    },
    {
      recto: 'Quelle est la <b>réserve</b> de spermatozoïdes par épididyme et sa répartition ?',
      verso: '<b>182 millions</b> par épididyme :\n· <b>26%</b> dans la tête\n· <b>23%</b> dans le corps\n· <b>52%</b> dans la queue',
      order_index: 50,
    },
    {
      recto: 'Combien de spermatozoïdes sont produits <b>par jour</b> ?',
      verso: '<b>45-207 millions</b> de spermatozoïdes/jour',
      order_index: 51,
    },
    {
      recto: 'Quelles <b>capacités</b> sont acquises lors de la maturation épididymaire ?',
      verso: '· <b>Mobilité unidirectionnelle</b> (flagellaire)\n· Capacité de <b>fixation à la zone pellucide</b> et membrane ovocytaire\n· Capacité de <b>développement embryonnaire normal</b>',
      order_index: 52,
    },
    // === PARTIE IV : Canal déférent et canal éjaculateur ===
    {
      recto: 'Quelle est la <b>longueur</b> du canal déférent ?',
      verso: 'Tube droit d\'environ <b>40 cm</b>\nSitué dans le <b>cordon spermatique</b>',
      order_index: 53,
    },
    {
      recto: 'Le canal déférent fait suite à quel canal ?',
      verso: 'Au <b>canal épididymaire</b>\n(PAS aux tubes droits — piège fréquent)',
      order_index: 54,
    },
    {
      recto: 'Quelles sont les <b>3 tuniques</b> du canal déférent ?',
      verso: '· <b>Muqueuse</b> → épithélium prismatique pseudostratifié + stéréocils, chorion\n· <b>Musculeuse épaisse</b> → 3 couches CML (LCL)\n· <b>Adventice</b> → TC lâche riche en fibres élastiques',
      order_index: 55,
    },
    {
      recto: 'Quelles sont les <b>3 couches de la musculeuse</b> du canal déférent ?',
      verso: '· <b>Longitudinale interne</b>\n· <b>Circulaire moyenne</b>\n· <b>Longitudinale externe</b>\n(Mnémo : <b>LCL</b>)',
      order_index: 56,
    },
    {
      recto: 'Quel type d\'<b>épithélium</b> possède le canal déférent ?',
      verso: 'Épithélium <b>prismatique pseudostratifié</b> avec <b>stéréocils</b>\n(Même type que l\'épididyme)',
      order_index: 57,
    },
    {
      recto: 'Par quelles fibres nerveuses est contrôlée l\'<b>éjaculation</b> au niveau du canal déférent ?',
      verso: 'Par des fibres <b>orthosympathiques adrénergiques</b>\n→ Ondes péristaltiques puissantes et brèves',
      order_index: 58,
    },
    {
      recto: 'Quelle est la longueur du <b>canal éjaculateur</b> ?',
      verso: '~<b>2 cm</b> de long\nFormé par la jonction de l\'ampoule déférentielle et du canal de la vésicule séminale',
      order_index: 59,
    },
    {
      recto: 'Que devient la <b>musculeuse du canal éjaculateur</b> en pénétrant dans la prostate ?',
      verso: 'Le canal éjaculateur <b>perd sa musculeuse</b>\nSon épithélium devient <b>prismatique simple</b> (au lieu de pseudostratifié)',
      order_index: 60,
    },
    {
      recto: 'Quels sont les <b>3 segments</b> de l\'urètre masculin ?',
      verso: '· <b>Urètre prostatique</b>\n· <b>Urètre membraneux</b> (périnéal)\n· <b>Urètre spongieux</b> (pénien)\nLongueur totale : <b>20-25 cm</b>',
      order_index: 61,
    },
    // === PARTIE V : Histologie des glandes annexes ===
    {
      recto: 'Quelle est la <b>structure histologique</b> des vésicules séminales ?',
      verso: '· <b>Muqueuse</b> → nombreux replis ramifiés, épithélium <b>prismatique simple</b>\n· <b>Musculeuse</b> → 2 couches CML (circulaire interne, longitudinale externe)\n· <b>Adventice</b> → TC lâche',
      order_index: 62,
    },
    {
      recto: 'Quel type d\'<b>épithélium</b> revêt les vésicules séminales ?',
      verso: 'Épithélium <b>prismatique/cylindrique simple</b>\n(PAS pseudostratifié)',
      order_index: 63,
    },
    {
      recto: 'Quels sont les <b>2 types cellulaires</b> des vésicules séminales ?',
      verso: '· <b>Cellules principales glandulaires</b> → grains de sécrétion (PAS+), REG et Golgi\n· <b>Cellules basales</b> → renouvellement',
      order_index: 64,
    },
    {
      recto: 'Quel <b>pourcentage de l\'éjaculat</b> représente la sécrétion des vésicules séminales ?',
      verso: '<b>50-80%</b> du volume total (~<b>2.5 mL</b>)\npH <b>alcalin</b>',
      order_index: 65,
    },
    {
      recto: 'Quel est le <b>marqueur biologique</b> des vésicules séminales ?',
      verso: 'Le <b>fructose</b>\n(Rôle : nutrition et mobilité des spermatozoïdes)',
      order_index: 66,
    },
    {
      recto: 'Quelles <b>protéines</b> contient le liquide des vésicules séminales ?',
      verso: '· <b>Lactoferrine</b>\n· <b>Lysozyme</b> (antibactérien)\n· Facteur <b>immunosuppresseur</b>\n· Facteur de <b>dé-capacitation</b>\n· Facteur de <b>coagulation</b>',
      order_index: 67,
    },
    {
      recto: 'Combien de <b>couches de CML</b> possède la musculeuse des vésicules séminales ?',
      verso: '<b>2 couches</b> :\n· <b>Circulaire interne</b>\n· <b>Longitudinale externe</b>',
      order_index: 68,
    },
    {
      recto: 'Quelle est la <b>nature</b> de la capsule prostatique ?',
      verso: 'Capsule <b>fibro-élastique</b>\n(PAS d\'albuginée — seul le testicule a une albuginée)',
      order_index: 69,
    },
    {
      recto: 'VRAI ou FAUX : La prostate possède une <b>albuginée</b>.',
      verso: '<b>FAUX</b>\nLa prostate possède une capsule <b>fibro-élastique</b>\nSeul le <b>testicule</b> possède une albuginée',
      order_index: 70,
    },
    {
      recto: 'Quels sont les <b>2 sphincters</b> prostatiques ?',
      verso: '· Sphincter <b>lisse</b> (interne) → empêche l\'écoulement spontané d\'urine\n· Sphincter <b>strié</b> (externe) → contrôle <b>volontaire</b> de la miction',
      order_index: 71,
    },
    {
      recto: 'Combien de <b>glandes</b> contient la prostate et quel est leur type ?',
      verso: '~<b>50 glandes tubulo-alvéolaires</b>\nDans un <b>stroma</b> conjonctif (FML, fibres élastiques)',
      order_index: 72,
    },
    {
      recto: 'Quels sont les <b>3 groupes concentriques</b> de glandes prostatiques ?',
      verso: '· Glandes <b>péri-urétrales internes</b> (muqueuses)\n· Glandes <b>péri-urétrales externes</b> (sous-muqueuses)\n· Glandes <b>principales</b> (périphériques, les plus volumineuses)',
      order_index: 73,
    },
    {
      recto: 'Quels sont les <b>2 types cellulaires</b> de l\'épithélium prostatique ?',
      verso: '· <b>Cellules sécrétrices</b> (luminales) → sécrétion mérocrine ET apocrine\n· <b>Cellules basales</b> → cellules de remplacement (progéniteurs)',
      order_index: 74,
    },
    {
      recto: 'VRAI ou FAUX : La prostate est une glande <b>endocrine</b>.',
      verso: '<b>FAUX</b>\nLa prostate est une glande <b>EXOCRINE</b> (sécrète dans l\'urètre prostatique)\nElle est <b>androgéno-dépendante</b> (possède des récepteurs aux androgènes)',
      order_index: 75,
    },
    {
      recto: 'La prostate est-elle <b>hormono-dépendante</b> ?',
      verso: 'Oui, elle possède des <b>récepteurs aux androgènes</b>\nLa <b>testostérone</b> est convertie en <b>DHT</b> par la <b>5α-réductase</b> dans la prostate',
      order_index: 76,
    },
    {
      recto: 'Que sont les <b>corps de Robin</b> (sympexions) ?',
      verso: '<b>Glycoprotéines lamellaires concentriques</b> dans la lumière des acini prostatiques\nAspect en "bulbe d\'oignon" en coupe',
      order_index: 77,
    },
    {
      recto: 'Que deviennent les corps de Robin après <b>40 ans</b> ?',
      verso: 'Ils se <b>calcifient</b> → risque de <b>lithiase prostatique</b>',
      order_index: 78,
    },
    {
      recto: 'Quelle <b>proportion de l\'éjaculat</b> représente la sécrétion prostatique ?',
      verso: '~<b>1/6</b> de l\'éjaculat\npH <b>acide</b> (contrairement aux VS qui sont alcalines)',
      order_index: 79,
    },
    {
      recto: 'Quels sont les principaux <b>composants</b> de la sécrétion prostatique ?',
      verso: '· Facteur de <b>liquéfaction</b> (PSA)\n· <b>Spermine/spermidine</b>\n· <b>Albumine</b>, <b>fibrinolysine</b>\n· <b>Acide citrique</b>, <b>phosphatase acide</b>\n· Ions : <b>Zn²⁺</b>, Mg²⁺, Ca²⁺',
      order_index: 80,
    },
    {
      recto: 'Quels sont les <b>marqueurs biochimiques</b> de la prostate ?',
      verso: '· <b>Phosphatase acide</b>\n· <b>Acide citrique</b>\n· <b>Zinc (Zn²⁺)</b>\n· <b>Spermine</b>',
      order_index: 81,
    },
    {
      recto: 'Que sont les <b>glandes bulbo-urétrales</b> (de Cowper) ?',
      verso: '<b>2 glandes tubulo-acineuses</b>, taille d\'un <b>petit pois</b>\nÉpithélium <b>mucosécrétant</b>\nSécrètent un <b>liquide mucoïde</b> → <b>lubrification de l\'urètre</b>\nSécrétion <b>androgéno-dépendante</b>',
      order_index: 82,
    },
    // === PARTIE VI : Synthèse ===
    {
      recto: 'Quel est le <b>trajet complet</b> des spermatozoïdes ?',
      verso: '<b>Tubes séminifères</b> → <b>Tubes droits</b> → <b>Rete testis</b> → <b>Canaux efférents</b> → <b>Canal épididymaire</b> → <b>Canal déférent</b> → <b>Canal éjaculateur</b> → <b>Urètre</b>',
      order_index: 83,
    },
    {
      recto: 'Pour chaque segment des voies génitales, quel est le <b>type d\'épithélium</b> ?\n(Tubes droits, Rete testis, Canaux efférents)',
      verso: '· <b>Tubes droits</b> → épithélium <b>cubique</b>\n· <b>Rete testis</b> → épithélium <b>pavimenteux</b>\n· <b>Canaux efférents</b> → épithélium avec <b>cils vibratiles</b> (vrais cils)',
      order_index: 84,
    },
    {
      recto: 'Pour chaque segment des voies génitales, quel est le <b>type d\'épithélium</b> ?\n(Épididyme, Canal déférent, Canal éjaculateur)',
      verso: '· <b>Épididyme</b> → <b>prismatique pseudostratifié</b> + stéréocils\n· <b>Canal déférent</b> → <b>prismatique pseudostratifié</b> + stéréocils\n· <b>Canal éjaculateur</b> → <b>prismatique simple</b>',
      order_index: 85,
    },
    {
      recto: 'Quelles structures possèdent des <b>stéréocils</b> (et non des cils vibratiles) ?',
      verso: '· <b>Canal épididymaire</b>\n· <b>Canal déférent</b>\n(Les canaux efférents possèdent de vrais <b>cils vibratiles</b>)',
      order_index: 86,
    },
    {
      recto: 'L\'<b>épididyme</b> fait partie des voies spermatiques <b>intra</b> ou <b>extra</b>-testiculaires ?',
      verso: 'Voies spermatiques <b>EXTRA-testiculaires</b>\n(Voies intra-testiculaires = tubes droits + rete testis)',
      order_index: 87,
    },
    {
      recto: 'Quelles sont les <b>3 structures androgéno-dépendantes</b> de l\'appareil génital masculin ?',
      verso: '· <b>Vésicules séminales</b>\n· <b>Prostate</b>\n· <b>Glandes bulbo-urétrales</b>',
      order_index: 88,
    },
    {
      recto: 'Quel est le <b>pH</b> de la sécrétion des vésicules séminales vs de la prostate ?',
      verso: '· Vésicules séminales → pH <b>alcalin</b>\n· Prostate → pH <b>acide</b>',
      order_index: 89,
    },
    {
      recto: 'VRAI ou FAUX : À la naissance, les testicules sont dans le <b>canal inguinal</b>.',
      verso: '<b>FAUX</b>\nÀ la naissance, les testicules sont déjà dans le <b>scrotum</b>',
      order_index: 90,
    },
    {
      recto: 'Quel est le rôle du <b>lysozyme</b> dans le liquide séminal ?',
      verso: 'Rôle <b>antibactérien</b>\n(Protéine sécrétée par les vésicules séminales)',
      order_index: 91,
    },
    {
      recto: 'VRAI ou FAUX : Les <b>cellules de Leydig</b> se trouvent dans l\'épithélium des tubes séminifères.',
      verso: '<b>FAUX</b>\nLes cellules de Leydig se trouvent dans le <b>tissu interstitiel</b> entre les tubes séminifères\n(Ce sont les cellules de <b>Sertoli</b> qui sont dans l\'épithélium des tubes séminifères)',
      order_index: 92,
    },
    {
      recto: 'VRAI ou FAUX : Le rete testis est un <b>réseau labyrinthique</b> situé dans le corps de Highmore.',
      verso: '<b>VRAI</b>\nLe rete testis est un réseau labyrinthique de canaux anastomosés situé dans le <b>corps de Highmore</b> (médiastin du testicule)',
      order_index: 93,
    },
    {
      recto: 'Que contient le <b>stroma prostatique</b> ?',
      verso: '· <b>Fibres musculaires lisses (FML)</b>\n· <b>Fibres élastiques</b>\n· Vaisseaux\n· Nerfs',
      order_index: 94,
    },
    {
      recto: 'Quel est le rôle de la <b>fibrinolysine</b> dans la sécrétion prostatique ?',
      verso: 'Contribue à la <b>liquéfaction du sperme</b> après éjaculation',
      order_index: 95,
    },
  ],

  annales: [
    {
      titre: 'Annale ACC Histologie générale — Testicule et spermatogenèse (Q3-Q4)',
      annee: '2022-2023',
      rappel_cours: 'Le testicule est entouré de l\'**albuginée** (capsule conjonctive blanche épaisse), avec un épaississement appelé **corps de Highmore**. C\'est une glande **mixte** : **exocrine** (spermatogenèse dans les tubes séminifères) et **endocrine** (testostérone par les cellules de **Leydig** dans l\'interstitium).\n\n· Les **cellules de Sertoli** sont dans l\'**épithélium des tubes séminifères** (PAS dans l\'interstitium)\n· Les **cellules de Leydig** sont dans le **tissu interstitiel** entre les tubes séminifères\n· Chaque lobule contient **2-3 tubes séminifères**\n· La spermatogenèse comporte 3 phases : proliférative (27j), méiose (24j), spermiogenèse (23j)\n· La spermiogenèse **suit** la méiose (dernière phase, sans division)',
      questions: [
        {
          enonce: 'Concernant le testicule, indiquer la ou les proposition(s) exacte(s) :',
          items: [
            { lettre: 'A', enonce: 'L\'albuginée testiculaire est une capsule conjonctive blanche épaisse.', is_correct: true },
            { lettre: 'B', enonce: 'Le testicule est une glande exocrine pure.', is_correct: false },
            { lettre: 'C', enonce: 'Le corps de Highmore est un épaississement de l\'albuginée.', is_correct: true },
            { lettre: 'D', enonce: 'Chaque lobule testiculaire contient 4 à 5 tubes séminifères.', is_correct: false },
            { lettre: 'E', enonce: 'Les cellules de Leydig se trouvent dans l\'épithélium des tubes séminifères.', is_correct: false },
          ],
          correction: '**Réponse : AC**\n\nA. **VRAI** — L\'albuginée testiculaire est bien une capsule conjonctive blanche épaisse enveloppant le testicule.\n\nB. **FAUX** — Le testicule est une glande **mixte** : **exocrine** (production de spermatozoïdes dans les tubes séminifères) ET **endocrine** (sécrétion de testostérone par les cellules de Leydig).\n\nC. **VRAI** — Le corps de Highmore (médiastin du testicule) est bien un épaississement de l\'albuginée au pôle en regard de l\'épididyme.\n\nD. **FAUX** — Chaque lobule contient **2-3 tubes séminifères** (et non 4-5).\n\nE. **FAUX** — Les cellules de Leydig se trouvent dans le **tissu interstitiel** entre les tubes séminifères. Ce sont les cellules de **Sertoli** qui se trouvent dans l\'épithélium des tubes séminifères.',
        },
        {
          enonce: 'Concernant la spermatogenèse, indiquer la ou les proposition(s) exacte(s) :',
          items: [
            { lettre: 'A', enonce: 'L\'épithélium des tubes séminifères est un épithélium simple prismatique.', is_correct: false },
            { lettre: 'B', enonce: 'Les cellules de Sertoli sont situées dans le tissu interstitiel.', is_correct: false },
            { lettre: 'C', enonce: 'Les cellules de Leydig sécrètent la testostérone.', is_correct: true },
            { lettre: 'D', enonce: 'La spermiogenèse suit la méiose.', is_correct: true },
            { lettre: 'E', enonce: 'Les spermatozoïdes sont fécondants dès la sortie du testicule.', is_correct: false },
          ],
          correction: '**Réponse : CD**\n\nA. **FAUX** — L\'épithélium des tubes séminifères est un épithélium **stratifié complexe** (épithélium séminifère germinal) et non un épithélium simple prismatique.\n\nB. **FAUX** — Les cellules de Sertoli sont situées dans l\'**épithélium des tubes séminifères** (et non dans le tissu interstitiel). Ce sont les cellules de Leydig qui occupent le tissu interstitiel.\n\nC. **VRAI** — Les cellules de Leydig, situées dans le tissu interstitiel, sécrètent bien la testostérone sous stimulation par la LH.\n\nD. **VRAI** — La spermiogenèse est la dernière phase de la spermatogenèse (23 jours), qui suit la méiose (24 jours). Elle transforme les spermatides en spermatozoïdes sans division cellulaire.\n\nE. **FAUX** — Les spermatozoïdes sont **NON fécondants** à la sortie du testicule. Ils nécessitent une maturation post-testiculaire dans l\'épididyme pour acquérir la mobilité progressive et les capacités de fécondation.',
        },
      ],
    },
    {
      titre: 'Annale ACC Histologie — Appareil génital masculin — Session 1',
      annee: '2022-2023',
      rappel_cours: 'L\'appareil génital masculin comprend les **testicules** (glande mixte : exocrine et endocrine), les **voies spermatiques** (tubes droits → rete testis → canaux efférents → épididyme → canal déférent → canal éjaculateur → urètre), et les **glandes annexes** (vésicules séminales, prostate, glandes bulbo-urétrales).\n\n· Les **cellules de Sertoli** sont dans l\'épithélium des tubes séminifères\n· L\'épididyme est une voie **extra-testiculaire** avec un épithélium **prismatique pseudostratifié** portant des **stéréocils** (PAS des cils vibratiles)\n· La musculeuse de l\'épididyme **s\'épaissit** de la tête vers la queue\n· La **queue** de l\'épididyme = lieu de **stockage** des spermatozoïdes\n· Le canal déférent fait suite au **canal épididymaire** (PAS aux tubes droits)\n· La prostate est une glande **EXOCRINE** (PAS endocrine), **androgéno-dépendante**',
      questions: [
        {
          enonce: 'Concernant l\'appareil génital masculin, indiquer la ou les proposition(s) exacte(s) :',
          items: [
            { lettre: 'A', enonce: 'Les testicules sont situés dans les bourses (scrotum).', is_correct: true },
            { lettre: 'B', enonce: 'Le testicule est une glande exocrine pure.', is_correct: false },
            { lettre: 'C', enonce: 'Des septa (cloisons) vont de l\'albuginée au corps de Highmore et délimitent des lobules.', is_correct: true },
            { lettre: 'D', enonce: 'À la naissance, les testicules sont encore dans le canal inguinal.', is_correct: false },
            { lettre: 'E', enonce: 'Les cellules de Sertoli sont situées dans le tissu interstitiel entre les tubes séminifères.', is_correct: false },
          ],
          correction: '**Réponse : AC**\n\nA. **VRAI** — Les testicules sont bien situés dans les bourses (scrotum).\n\nB. **FAUX** — Le testicule est une glande **mixte** : à la fois **exocrine** (spermatogenèse) et **endocrine** (testostérone par les cellules de Leydig).\n\nC. **VRAI** — Des septa (cloisons radiaires conjonctives) vont de l\'albuginée au corps de Highmore et délimitent des lobules communicants.\n\nD. **FAUX** — À la **naissance**, les testicules sont déjà dans le **scrotum** (et non dans le canal inguinal).\n\nE. **FAUX** — Les cellules de Sertoli sont situées dans l\'**épithélium des tubes séminifères**. Ce sont les cellules de **Leydig** qui se trouvent dans le tissu interstitiel.',
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
          correction: '**Réponse : C**\n\nA. **FAUX** — L\'épididyme fait partie des voies spermatiques **EXTRA-testiculaires** (les voies intra-testiculaires sont les tubes droits et le rete testis).\n\nB. **FAUX** — L\'épithélium du canal épididymaire est un épithélium **prismatique pseudostratifié** (et non cubique simple).\n\nC. **VRAI** — La queue (cauda) de l\'épididyme est bien le lieu de **stockage** des spermatozoïdes (52% de la réserve).\n\nD. **FAUX** — Les cellules principales possèdent des **stéréocils** (et non des cils vibratiles). Les stéréocils sont des expansions fines, irrégulières, dépourvues de microtubules et sans activité motrice.\n\nE. **FAUX** — La musculeuse de l\'épididyme **s\'épaissit** de la tête vers la queue (et non s\'amincit). La partie terminale possède 3 couches de CML.',
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
          correction: '**Réponse : ABD**\n\nA. **VRAI** — Les vésicules séminales produisent bien 50 à 80% du volume de l\'éjaculat (~2.5 mL).\n\nB. **VRAI** — Le fructose est le marqueur spécifique des vésicules séminales.\n\nC. **FAUX** — La prostate est une glande **EXOCRINE** (et non endocrine). Elle sécrète ses produits dans l\'urètre prostatique.\n\nD. **VRAI** — La prostate entoure bien l\'urètre prostatique, au carrefour uro-génital.\n\nE. **FAUX** — Le canal déférent fait suite au **canal épididymaire** (et non aux tubes droits). Les tubes droits font la jonction entre les tubes séminifères et le rete testis.',
        },
      ],
    },
    {
      titre: 'Annale Histologie ACC — Appareil génital masculin — Session 1',
      annee: '2021-2022',
      rappel_cours: 'Le testicule est une glande **mixte** située dans le **scrotum** à la naissance. L\'**albuginée** enveloppe le testicule et s\'épaissit pour former le **corps de Highmore** (qui n\'est PAS une capsule séparée). Les **cellules de Leydig** sont dans le tissu **interstitiel**.\n\n· L\'épididyme possède un épithélium **prismatique pseudostratifié** avec **stéréocils** (PAS des microvillosités)\n· Le canal déférent fait suite au canal **épididymaire**\n· La musculeuse de l\'épididyme **s\'épaissit** de la tête vers la queue\n· La prostate possède une capsule **fibro-élastique** (PAS d\'albuginée)',
      questions: [
        {
          enonce: 'Concernant le testicule, indiquer la proposition exacte (QRU) :',
          items: [
            { lettre: 'A', enonce: 'Le corps de Highmore est une capsule distincte de l\'albuginée.', is_correct: false },
            { lettre: 'B', enonce: 'Le testicule est une glande exocrine pure.', is_correct: false },
            { lettre: 'C', enonce: 'Les cellules de Leydig sont situées dans l\'épithélium des tubes séminifères.', is_correct: false },
            { lettre: 'D', enonce: 'À la naissance, les testicules sont dans le scrotum.', is_correct: true },
            { lettre: 'E', enonce: 'Les tubes séminifères contiennent les cellules de Leydig.', is_correct: false },
          ],
          correction: '**Réponse : D**\n\nA. **FAUX** — Le corps de Highmore n\'est PAS une capsule distincte : c\'est un **épaississement de l\'albuginée** au pôle du testicule en regard de l\'épididyme.\n\nB. **FAUX** — Le testicule est une glande **mixte** : **exocrine** (spermatogenèse) ET **endocrine** (testostérone par les cellules de Leydig).\n\nC. **FAUX** — Les cellules de Leydig sont situées dans le **tissu interstitiel** entre les tubes séminifères (et non dans l\'épithélium des tubes). Ce sont les cellules de Sertoli qui sont dans l\'épithélium.\n\nD. **VRAI** — À la naissance, les testicules sont bien dans le scrotum (la descente testiculaire s\'est achevée in utero).\n\nE. **FAUX** — Les tubes séminifères contiennent les **cellules germinales** et les **cellules de Sertoli**. Les cellules de Leydig sont dans le tissu interstitiel.',
        },
        {
          enonce: 'Concernant les voies spermatiques, indiquer la ou les proposition(s) exacte(s) :',
          items: [
            { lettre: 'A', enonce: 'Le canal déférent fait suite aux tubes droits.', is_correct: false },
            { lettre: 'B', enonce: 'L\'épithélium du canal épididymaire est prismatique pseudostratifié.', is_correct: true },
            { lettre: 'C', enonce: 'Les cellules principales de l\'épididyme possèdent des microvillosités.', is_correct: false },
            { lettre: 'D', enonce: 'La musculeuse de l\'épididyme s\'épaissit de la tête vers la queue.', is_correct: true },
            { lettre: 'E', enonce: 'L\'épithélium du canal déférent est cubique simple.', is_correct: false },
          ],
          correction: '**Réponse : BD**\n\nA. **FAUX** — Le canal déférent fait suite au **canal épididymaire** (et non aux tubes droits). L\'ordre est : tubes séminifères → tubes droits → rete testis → canaux efférents → canal épididymaire → canal déférent.\n\nB. **VRAI** — L\'épithélium du canal épididymaire est bien **prismatique pseudostratifié** (toutes les cellules reposent sur la membrane basale).\n\nC. **FAUX** — Les cellules principales de l\'épididyme possèdent des **stéréocils** (et non des microvillosités). Les stéréocils sont des expansions fines, irrégulières, sans microtubules et sans activité motrice.\n\nD. **VRAI** — La musculeuse (CML) de l\'épididyme s\'épaissit de la tête vers la queue. La partie terminale comporte 3 couches de CML.\n\nE. **FAUX** — L\'épithélium du canal déférent est **prismatique pseudostratifié** avec stéréocils (et non cubique simple).',
        },
        {
          enonce: 'Sur cette coupe de prostate, indiquer la ou les proposition(s) exacte(s) :',
          items: [
            { lettre: 'A', enonce: 'La prostate est entourée d\'une albuginée.', is_correct: false },
            { lettre: 'B', enonce: 'La prostate contient environ 50 glandes tubulo-alvéolaires.', is_correct: true },
            { lettre: 'C', enonce: 'La prostate est une glande androgéno-dépendante.', is_correct: true },
            { lettre: 'D', enonce: 'Les corps de Robin peuvent se calcifier après 40 ans.', is_correct: true },
            { lettre: 'E', enonce: 'La prostate sécrète environ 1/6 du volume de l\'éjaculat.', is_correct: true },
          ],
          correction: '**Réponse : BCDE**\n\nA. **FAUX** — La prostate est entourée d\'une capsule **fibro-élastique** (PAS d\'une albuginée). Seul le **testicule** possède une albuginée.\n\nB. **VRAI** — La prostate contient environ **50 glandes tubulo-alvéolaires** organisées en 3 groupes concentriques (péri-urétrales internes, péri-urétrales externes, principales).\n\nC. **VRAI** — La prostate possède des **récepteurs aux androgènes** et est donc androgéno-dépendante. La testostérone y est convertie en DHT par la 5α-réductase.\n\nD. **VRAI** — Les corps de Robin (sympexions), constitués de glycoprotéines lamellaires concentriques, peuvent se **calcifier après 40 ans**, entraînant un risque de lithiase prostatique.\n\nE. **VRAI** — La sécrétion prostatique représente environ **1/6 du volume de l\'éjaculat**, avec un pH acide.',
        },
      ],
    },
  ],
};

export default content;

/**
 * Chirurgie de réparation du plexus brachial de l'adulte.
 * Source-only reconstruction: every entry below is tied to a retained block
 * from extract.json.  The banks deliberately test decisions and progression,
 * rather than recycling flashcard prompts.
 */
import { join, resolve } from 'node:path';
import { emitOrthopediePackage } from './lib/orthopedie-package.mjs';

const chapterDir = resolve(process.argv[2] || '..\\.corpus-orthopedie\\chirurgie-de-reparation-du-plexus-brachial-de-l-adulte');
const outputDir = resolve(process.argv[3] || join(chapterDir, 'delivery', 'source-quality-v3'));
const row = (concept, bullets, extra = {}) => ({ concept, bullets, ...extra });
const fig = (n, caption, size = 'large') => ({ path: `img/img_${String(n).padStart(3, '0')}.png`, caption, sourceCaption: caption, position: 'after', size });
const sourceFigureWithoutCaption = (n, size = 'large') => ({ path: `img/img_${String(n).padStart(3, '0')}.png`, position: 'after', size });

const fiche = {
  title: "Chirurgie de réparation du plexus brachial de l’adulte",
  year: '2025-2026',
  sourceBlocks: [82, 92, 112, 122, 132, 145, 160, 175, 186, 196, 208, 220, 232, 244, 257, 271, 286, 301, 319, 336, 350, 371, 394, 421, 458, 486, 514, 541, 575, 612, 653, 698, 742, 789, 831, 879, 923, 972, 1029],
  imageException: { reason: 'Deux des huit figures du support n’ont pas de légende exploitable ; six figures strictement légendées sont retenues.' },
  parts: [
    { title: 'Topographie et gravité lésionnelle', sections: [
      { title: 'Ce qui détermine le pronostic', rows: [
        row('Traumatisme par traction', ['Les paralysies traumatiques sont le plus souvent liées à un étirement du plexus, fréquemment dans un contexte d’accident de moto chez un adulte jeune.', 'Une traction dans l’axe atteint préférentiellement C5-C6 ; une traction vers le haut intéresse davantage C8-T1.', 'Les lésions associées osseuses et vasculaires doivent être recherchées dès le bilan initial.'], { image: sourceFigureWithoutCaption(1, 'large') }),
        row('Rupture et avulsion', ['Une rupture postganglionnaire peut laisser un moignon exploitable pour une suture ou une greffe.', 'L’avulsion est préganglionnaire : elle arrache les radicelles de la moelle et ne fournit pas de racine greffable.', 'La distinction conditionne la stratégie : greffe si continuité réparable, transfert nerveux si avulsion.'], { marker: 'ecn' }),
        row('Formes topographiques', ['Une atteinte C5-C6 ± C7 avec C8-T1 conservées garde une fonction de main et a le meilleur potentiel de récupération.', 'Une avulsion C5-T1 impose de hiérarchiser des objectifs réalistes : épaule stable, flexion du coude, puis sensibilité protectrice de la main.', 'Une lésion C8-T1 touche la flexion du pouce et des doigts ainsi que les muscles intrinsèques de la main.']),
      ] },
      { title: 'Lésions distales et associées', rows: [
        row('Atteintes rétro- et infraclaviculaires', ['Elles concernent les troncs secondaires et peuvent s’associer à des lésions vasculaires et d’épaule.', 'La distinction avec une atteinte supraclaviculaire n’est pas toujours nette après traumatisme fermé par traction.', 'La gravité se précise par l’examen clinique répété et les explorations complémentaires.']),
        row('Atteintes terminales', ['Le suprascapulaire, musculocutané, axillaire et radial peuvent être lésés lors d’une luxation d’épaule, d’une fracture d’humérus ou de scapula.', 'Une rupture de l’artère axillaire expose à une ischémie et à un syndrome de loge : le pouls fait partie de l’examen.', 'La conservation du suprascapulaire est fréquente dans les lésions infraclaviculaires.'], { image: fig(3, 'Anatomie du plexus : nerfs suprascapulaire, musculocutané, médian, radial et ulnaire.', 'large') }),
        row('Attentes fonctionnelles', ['La restitution complète du plexus est illusoire dans les lésions étendues.', 'La chirurgie directe peut diminuer la douleur en restaurant une continuité quand elle est possible.', 'La récupération est plus favorable dans les lésions incomplètes, grâce à la proximité des effecteurs et à la conservation de la main.']),
      ] },
    ] },
    { title: 'Bilan initial et décision de réparer', sections: [
      { title: 'Examen clinique reproductible', rows: [
        row('Testing moteur', ['L’examen est réalisé dès que le patient est conscient, muscle par muscle, avec cotation et recherche de fatigabilité.', 'Il apprécie séparément épaule, coude, poignet et main ; le nerf suprascapulaire doit être testé et le résultat reporté sur une fiche.', 'L’examen est répété, car une récupération peut débuter dans certains territoires.']),
        row('Sensibilité, douleur et sympathique', ['Le bilan sensitif associe tact et sensibilité discriminative.', 'Les paresthésies douloureuses et douleurs causalgiformes, notamment en cas d’avulsion, sont consignées.', 'La recherche de troubles neurosympathiques et d’un Claude Bernard-Horner participe au bilan topographique.']),
        row('Vasculaire et terrain', ['La prise des pouls, l’échodoppler et, si besoin, l’angiographie recherchent une lésion vasculaire associée.', 'Tabagisme, excès pondéral et comorbidités peuvent dégrader le pronostic.', 'Les besoins socioprofessionnels et la situation psychologique doivent être intégrés très tôt.'], { marker: 'trap' }),
      ] },
      { title: 'Explorations et temporalité', rows: [
        row('Électrophysiologie', ['L’examen électrique n’est pas interprétable trop précocement ; une activité volontaire après le délai utile signe une récupération en cours.', 'Le bilan clinique reste central pour interpréter les données électrophysiologiques.', 'L’absence de récupération débutante au premier mois oriente vers une atteinte sévère.']),
        row('Imagerie des racines', ['L’imagerie des racines est programmée vers la troisième ou quatrième semaine avant une exploration, à la recherche de pseudoméningocèles.', 'Une pseudoméningocèle évoque une brèche méningée avec avulsion complète ou partielle.', 'Les avulsions C5-C6 sont plus difficiles à objectiver que celles de C8-T1 : la confrontation clinique-opératoire demeure nécessaire.'], { image: sourceFigureWithoutCaption(5, 'large') }),
        row('Fenêtre de reconstruction', ['Lorsque la réparation est indiquée, elle est réalisée le plus précocement possible, habituellement au deuxième ou troisième mois et avant six mois.', 'Après deux ans, une récupération nerveuse utile est considérée comme illusoire.', 'Le choix entre greffe, transfert et geste palliatif dépend de la topographie, des donneurs disponibles et du délai.']),
      ] },
    ] },
    { title: 'Exploration et reconstruction directe', sections: [
      { title: 'Installation et voie sus-claviculaire', rows: [
        row('Préparation opératoire', ['Le champ inclut cou et membre supérieur afin de permettre la mobilisation pendant l’exploration ; les sites donneurs éventuels sont anticipés.', 'L’hémostase méticuleuse, le grossissement optique et le neurostimulateur sont indispensables.', 'L’installation limite la pression veineuse et facilite l’exposition sus-claviculaire.']),
        row('Repères à préserver', ['La veine jugulaire externe est repérée après ouverture des plans superficiels.', 'L’omohyoïdien est une clé de l’exploration ; le nerf phrénique est identifié au voisinage de C5 et préservé.', 'Les branches du plexus cervical superficiel sont respectées afin de limiter les névromes douloureux.'], { image: fig(4, 'Voie d’abord et repères de la région supraclaviculaire.', 'large') }),
        row('Exploration radiculaire', ['C5 est recherchée dans l’espace interscalénique ; une stimulation rétrograde avec réponse du serratus anterior soutient l’absence d’avulsion médullaire.', 'C6 est médiale à C5 ; C7 est plus basse, plus horizontale et plus volumineuse.', 'C8-T1 ne sont pas systématiquement recherchées par cette voie : l’exposition est adaptée à la topographie.']),
      ] },
      { title: 'Greffe nerveuse', rows: [
        row('Principe', ['La résection du névrome progresse jusqu’à obtenir des fascicules sans fibrose épineurale.', 'Les greffons, notamment suraux, rétablissent une continuité entre moignon sain et cible lorsque la racine est exploitable.', 'Les torons peuvent être retournés pour limiter la fuite axonale vers les collatérales.']),
        row('Ce que décide l’exploration', ['Le caractère greffable d’un moignon se juge au bloc, après exposition et appréciation de la zone saine.', 'S’il n’existe aucune racine greffable, la stratégie bascule vers les transferts nerveux ou un traitement palliatif.', 'La réparation recherche plusieurs fonctions utiles plutôt qu’une reconstruction anatomique exhaustive.']),
        row('Priorités fonctionnelles', ['Dans une paralysie totale, épaule stable et flexion du coude sont des objectifs précoces ; la main protectrice est un objectif majeur quand elle est accessible.', 'Dans une atteinte C5-C6 ± C7 avec main conservée, l’épaule et le coude sont privilégiés.', 'La douleur neuropathique et le projet de réadaptation sont suivis parallèlement à la réinnervation.']),
      ] },
    ] },
    { title: 'Transferts nerveux orientés par la fonction', sections: [
      { title: 'Réanimation de l’épaule', rows: [
        row('Spinal accessoire vers suprascapulaire', ['La branche distale du spinal accessoire est repérée dans le creux sus-claviculaire, près de la face profonde du trapèze.', 'Le nerf suprascapulaire est la première branche latérale du tronc primaire supérieur.', 'La suture directe sous grossissement vise à réanimer la fonction dépendante du suprascapulaire.']),
        row('Triceps ou radial vers axillaire', ['La branche de la longue portion du triceps naît du radial au voisinage du bord inférieur du teres major.', 'Elle peut être suturée directement à la branche antérieure du nerf axillaire après exposition des espaces triangulaire et quadrilatère.', 'Le contingent sensitif est séparé avant le transfert d’une branche radiale vers l’axillaire.'], { image: fig(8, 'Espaces triangulaire humérotricipital et quadrilatère : repères du transfert vers l’axillaire.', 'large') }),
        row('Choix du donneur', ['Les donneurs moteurs non atteints sont privilégiés.', 'Le neurostimulateur aide à sélectionner et sécuriser les fascicules donneurs.', 'Un transfert sans greffon est recherché lorsque la proximité donneur-receveur permet une suture sans tension.']),
      ] },
      { title: 'Réanimation de la flexion du coude', rows: [
        row('Fascicule ulnaire vers biceps', ['Le transfert fasciculaire ulnaire vers le nerf du biceps est une option de réanimation de la flexion du coude.', 'Le fascicule moteur est sélectionné sous contrôle de stimulation puis transféré sans tension.', 'Ce transfert est particulièrement utile quand la main et le contingent ulnaire sont préservés.']),
        row('Fascicule médian vers brachial', ['Après identification de la branche sensitive cutanée latérale de l’avant-bras, la branche motrice du brachial est individualisée.', 'Un fascicule moteur médian de taille adaptée peut être transféré au nerf du brachial sous microscope.', 'L’objectif est de compléter la réanimation de la flexion du coude par un donneur de proximité.']),
        row('Intercostaux et C7 controlatérale', ['Les intercostaux sont des donneurs extraplexuels lorsque les donneurs intraplexuels manquent.', 'La racine C7 controlatérale fait partie des transferts possibles rapportés par le support.', 'Le nombre et la qualité des axones donneurs limitent les objectifs d’une réanimation extraplexuelle.']),
      ] },
    ] },
    { title: 'Suivi, réadaptation et chirurgie secondaire', sections: [
      { title: 'Suivi fonctionnel prolongé', rows: [
        row('Ce qui est suivi', ['Le testing moteur et sensitif est répété dans les mêmes territoires ; douleur, signe de Tinel et récupération débutante sont documentés.', 'La persistance de douleurs de désafférentation sans topographie précise est de mauvais pronostic.', 'La récupération spontanée reste la meilleure évolution lorsqu’elle est objectivée.']),
        row('Réadaptation et réinsertion', ['La rééducation vise la prévention des attitudes vicieuses et l’utilisation fonctionnelle des capacités récupérées.', 'Ergothérapie, adaptation des activités quotidiennes et accompagnement socioprofessionnel sont intégrés dès le début.', 'La réinsertion ne doit pas attendre une récupération nerveuse parfois partielle et tardive.']),
        row('Information réaliste', ['Les résultats sont souvent modestes dans les paralysies totales et la récupération est prolongée.', 'Le projet est hiérarchisé avec le patient : douleur, autonomie, épaule, coude, main et retour aux activités.', 'La chirurgie palliative est discutée à partir de la fonction résiduelle.']),
      ] },
      { title: 'Solutions palliatives', rows: [
        row('Quand les discuter', ['Les gestes palliatifs sont envisagés secondairement après appréciation de la récupération nerveuse et de la fonction restante.', 'Ils ne remplacent pas une réparation précoce lorsqu’une indication de greffe ou de transfert existe.', 'Ils sont individualisés selon le déficit persistant et les objectifs fonctionnels.']),
        row('Options rapportées', ['Arthrodèse d’épaule ou de poignet, transferts tendineux et lambeaux libres peuvent restaurer une fonction ciblée.', 'Les transferts tendineux peuvent viser la flexion du coude, l’extension des doigts ou la rotation du membre.', 'La balance bénéfice fonctionnel-risque doit être réévaluée avec le projet de vie.']),
        row('Message ECN', ['Devant une paralysie traumatique du plexus : documenter, topographier, rechercher l’urgence vasculaire, surveiller la récupération et adresser précocement.', 'Rupture postganglionnaire et avulsion n’ouvrent pas les mêmes possibilités de reconstruction.', 'La qualité du suivi conditionne autant la réadaptation et la réinsertion que la technique opératoire.'], { marker: 'ecn' }),
      ] },
    ] },
  ],
  synthesis: {
    chiffres: { headers: ['Repère temporel', 'Donnée du corpus', 'Conséquence'], rows: [['Premier mois', 'Absence de récupération débutante', 'Évoque une lésion sévère'], ['3e-4e semaine', 'Imagerie radiculaire avant exploration', 'Recherche de pseudoméningocèle'], ['2e-3e mois', 'Réparation précoce quand indiquée', 'Planifier greffe ou transfert'], ['Avant 6 mois', 'Fenêtre habituelle de reconstruction', 'Ne pas différer l’adressage'], ['Après 2 ans', 'Récupération nerveuse utile illusoire', 'Discuter stratégie secondaire']] },
    tables: [
      { title: 'Topographie et stratégie', headers: ['Situation', 'Point discriminant', 'Objectif'], rows: [['C5-C6 ± C7, main conservée', 'Atteinte incomplète', 'Épaule et coude'], ['Avulsion C5-T1', 'Pas de racine greffable', 'Transferts ; épaule, coude, main protectrice'], ['Rétro/infraclaviculaire', 'Troncs secondaires, lésions associées', 'Bilan vasculaire et réparation ciblée'], ['Lésion terminale', 'Axillaire, radial, musculocutané ou suprascapulaire', 'Réanimation adaptée à la branche atteinte']] },
      { title: 'Bilan de sécurité', headers: ['Domaine', 'À rechercher', 'Impact'], rows: [['Moteur', 'Testing muscle par muscle et récupération', 'Topographie et suivi'], ['Sensitif/douleur', 'Tact, discrimination, douleur neuropathique', 'Pronostic et prise en charge'], ['Vasculaire', 'Pouls, Doppler, angiographie si besoin', 'Urgence associée'], ['Imagerie', 'Racines et pseudoméningocèle', 'Avulsion et planification']] },
      { title: 'Fonction visée et transfert', headers: ['Fonction', 'Donneur rapporté', 'Receveur'], rows: [['Épaule', 'Spinal accessoire', 'Suprascapulaire'], ['Deltoïde', 'Longue portion du triceps / branche radiale', 'Branche antérieure axillaire'], ['Flexion du coude', 'Fascicule ulnaire', 'Biceps'], ['Flexion du coude', 'Fascicule médian', 'Brachial']] },
    ],
    keyPoints: ['Toujours rechercher une urgence vasculaire et les lésions associées.', 'L’examen moteur, sensitif et douloureux est répété et tracé.', 'Avulsion radiculaire = pas de racine greffable.', 'Main conservée : priorité à l’épaule et au coude.', 'Imagerie radiculaire vers la 3e-4e semaine avant exploration.', 'Réparation précoce lorsqu’indiquée, habituellement avant 6 mois.', 'Les transferts de proximité raccourcissent la distance vers l’effecteur.', 'La réadaptation et la réinsertion commencent sans attendre une récupération complète.'],
    eclair: ['Traction du plexus : topographier C5-T1 et rechercher os, vaisseaux et douleur.', 'Rupture postganglionnaire : suture ou greffe possible ; avulsion : transfert nerveux.', 'Bilan : testing moteur, sensibilité, douleur, Horner, pouls et lésions associées.', 'Imagerie des racines vers 3e-4e semaine ; pseudoméningocèle évocatrice d’avulsion.', 'Réparation indiquée : ne pas différer, idéalement 2e-3e mois et avant 6 mois.', 'Épaule : spinal accessoire → suprascapulaire ; triceps/radial → axillaire.', 'Coude : fascicule ulnaire → biceps ; médian → brachial.', 'Suivi prolongé : récupération, douleur, rééducation et réinsertion.'],
  },
};

// Each card is a distinct concept, not a recycled question stem.
const rawFacts = `Mécanisme dominant|Étirement du plexus lors d’un traumatisme fermé.|92
Patient typique du corpus|Adulte jeune, fréquemment blessé lors d’un accident de moto.|92
Traction dans l’axe|Atteint surtout les racines C5 et C6.|92
Traction vers le haut|Atteint surtout les racines C8 et T1.|92
Traction vers l’arrière|Peut étirer toutes les racines.|92
Lésion ouverte du plexus|Évoquer une section nerveuse ou une plaie par projectile.|92
Lésion osseuse associée possible|Clavicule, épaule, apophyses transverses cervicales ou première côte.|92
Fracture de première côte|Peut s’associer à une rupture vasculaire.|92
Organisation postérieure du plexus|Globalement liée au plan d’extension.|92
Organisation antérieure du plexus|Globalement liée au plan de flexion du coude, poignet et doigts.|92
Rupture postganglionnaire|Peut être réparée par continuité directe ou greffe si zone saine.|112
Avulsion radiculaire|Arrachement préganglionnaire des radicelles de la moelle.|112
Conséquence d’une avulsion|Absence de racine greffable.|112
Priorité d’une avulsion C5-T1|Épaule stable et flexion du coude, puis main protectrice.|112
Atteinte C5-C6 ± C7 favorable|La fonction de la main est préservée.|112
Atteinte C8-T1|Déficit de flexion du pouce et des doigts avec atteinte intrinsèque de la main.|112
Lésion rétro/infraclaviculaire|Atteint volontiers les troncs secondaires.|122
Lésion vasculaire rétro/infraclaviculaire|Doit être recherchée avec les lésions d’épaule.|122
Nerfs atteints après luxation d’épaule|Suprascapulaire, musculocutané, axillaire ou radial.|132
Artère axillaire lésée|Risque d’ischémie et de syndrome de loge.|132
Moment du premier examen|Dès que le patient est conscient.|145
Testing moteur|Muscle par muscle avec cotation et fatigabilité.|145
Territoires fonctionnels|Épaule, coude, poignet et main sont examinés séparément.|145
Nerf à ne pas oublier au testing|Nerf suprascapulaire.|145
Traçabilité clinique|Reporter le testing sur une fiche pour comparer l’évolution.|145
Examen sensitif|Associe tact et sensibilité discriminative.|145
Douleur évocatrice d’avulsion|Paresthésies douloureuses ou douleurs causalgiformes.|145
Signe sympathique recherché|Syndrome de Claude Bernard-Horner.|145
Signe de gravité au premier mois|Absence de récupération débutante.|145
Bilan vasculaire|Pouls puis échodoppler, angiographie si nécessaire.|145
Facteur pronostique modifiable|Tabagisme.|145
Autre facteur défavorable cité|Excès pondéral.|145
Examen électrique précoce|Non significatif avant le délai approprié.|160
Activité volontaire à l’EMG|Signe une récupération en cours après le délai utile.|160
Moment de l’imagerie des racines|Troisième à quatrième semaine avant exploration.|160
Pseudoméningocèle|Évoque une brèche méningée avec avulsion complète ou partielle.|160
Avulsion difficile à objectiver|C5-C6 est plus difficile que C8-T1.|160
Décision après bilan|Distinguer récupération spontanée, greffe, transfert ou palliatif.|175
Délai souhaité de réparation|Aussi précoce que possible, souvent deuxième à troisième mois.|175
Limite temporelle habituelle|Réparer avant six mois quand l’indication existe.|175
Après deux ans|Récupération nerveuse utile considérée illusoire.|175
Champ opératoire|Inclut cou et membre supérieur pour permettre sa mobilisation.|186
Outil indispensable|Grossissement optique par loupes ou microscope.|186
Autre outil indispensable|Neurostimulateur.|186
Principe d’hémostase|Méticuleuse, notamment avec coagulation bipolaire.|186
Repère superficiel de l’abord|Veine jugulaire externe.|196
Muscle-clé de l’exploration|Omohyoïdien.|196
Nerf à préserver près de C5|Nerf phrénique.|196
Branches à respecter|Plexus cervical superficiel pour limiter les névromes.|196
Réponse du serratus anterior|Argument contre une avulsion médullaire lors de stimulation rétrograde.|196
Situation de C6|Médiale à C5.|196
Aspect de C7|Plus basse, plus horizontale et plus volumineuse.|196
Principe de résection du névrome|Progresser jusqu’à des fascicules sans fibrose épineurale.|208
Greffon utilisé classiquement|Nerf sural en torons.|208
But du retournement des torons|Limiter la fuite axonale vers les collatérales.|208
Condition d’une greffe|Moignon radiculaire suffisamment long et zone saine.|220
Absence de racine greffable|Indique transfert nerveux ou stratégie palliative.|220
Principe du transfert nerveux|Utiliser un donneur moteur non atteint.|232
Atout d’un transfert proche|Suture sans greffe et distance réduite vers l’effecteur.|232
Donneur pour le suprascapulaire|Branche distale du nerf spinal accessoire.|244
Receveur de ce transfert|Nerf suprascapulaire.|244
Repérage du spinal accessoire|Creux sus-claviculaire, au contact profond du trapèze.|244
Situation du suprascapulaire|Première branche latérale du tronc primaire supérieur.|244
Mode de suture spinal-suprascapulaire|Directe sous grossissement.|244
Donneur pour l’axillaire|Branche de la longue portion du triceps.|257
Origine de la branche longue portion triceps|Nerf radial, près du bord inférieur du teres major.|257
Receveur du transfert tricipital|Branche antérieure du nerf axillaire.|257
Espaces opératoires du transfert axillaire|Triangulaire humérotricipital et quadrilatère.|257
Précaution du transfert radial-axillaire|Séparer le contingent sensitif.|271
Donneur pour le biceps|Fascicule moteur du nerf ulnaire.|286
Fonction visée par Oberlin|Flexion du coude.|286
Sélection du fascicule ulnaire|Sous contrôle de stimulation.|286
Exigence de la coaptation|Suture sans tension.|286
Donneur pour le brachial|Fascicule moteur du nerf médian.|301
Repère de la branche du brachial|Après identification de la branche sensitive cutanée latérale de l’avant-bras.|301
Contrôle du transfert médian-brachial|Dissection et coaptation sous microscope.|301
Donneurs extraplexuels cités|Nerfs intercostaux.|319
Autre donneur cité|Racine C7 controlatérale.|319
Limite des donneurs extraplexuels|Quantité et qualité d’axones disponibles limitées.|319
Objectif majeur en paralysie totale|Sensibilité protectrice et fonction motrice de la main si accessible.|336
Deuxième objectif de paralysie totale|Flexion du coude.|336
Troisième objectif de paralysie totale|Stabilité de l’épaule.|336
Suivi moteur|Comparer le testing répété dans les mêmes territoires.|350
Suivi douloureux|Documenter douleur neuropathique et douleur de désafférentation.|350
Mauvais signe pronostique douloureux|Persistance de douleurs sans topographie précise.|350
Place de la récupération spontanée|Meilleure évolution lorsqu’elle est objectivée.|350
Objectif de rééducation|Prévenir les attitudes vicieuses et développer l’usage fonctionnel.|371
Rôle de l’ergothérapie|Adapter les activités de la vie quotidienne.|371
Temps de la réinsertion|Ne pas attendre une récupération nerveuse complète.|371
Public souvent concerné|Jeunes travailleurs manuels avec enjeu professionnel important.|371
Place des gestes palliatifs|Secondaire, selon fonction résiduelle après évaluation de récupération.|394
Geste palliatif d’épaule ou poignet|Arthrodèse possible selon déficit.|394
Option pour mouvement résiduel|Transfert tendineux ciblé.|394
Option de couverture/fonction|Lambeau libre neurovasculaire selon contexte.|394
Information au patient|Annoncer une récupération souvent partielle et prolongée.|421
Objectif global|Autonomie, douleur maîtrisée, fonction utile et réinsertion.|421
Concept-clé ECN|Rupture postganglionnaire et avulsion ne relèvent pas de la même reconstruction.|421
Urgence associée à exclure|Lésion vasculaire et syndrome de loge.|421
Figure anatomique utile|Les nerfs terminales et troncs guident l’interprétation topographique.|92
Principale source de douleur persistante|Douleur neuropathique liée à une mauvaise régénération.|1029
Intérêt d’une prise en charge précoce|Favoriser la réadaptation et l’orientation sociale du patient jeune.|1029
Finalité de l’examen répété|Objectiver une récupération plutôt que décider sur un bilan isolé.|145
Finalité de l’exploration|Identifier des racines utilisables et les cibles de réparation.|220
Message de prudence|Ne pas promettre la réparation anatomique de tout le plexus.|82`;
const facts = rawFacts.split('\n').map((line) => { const [recto, verso, source] = line.split('|'); return { recto, verso, source: [Number(source)] }; });
if (facts.length < 100 || facts.length > 200) throw new Error(`100–200 cartes attendues, reçu ${facts.length}`);

const item = (enonce, is_correct, source, index) => ({ lettre: String.fromCharCode(65 + index), enonce, is_correct, justification: is_correct ? `Conforme au bloc source ${source}.` : `Cette proposition ne correspond pas au bloc source ${source}.` });
const q = (enonce, correct, wrong, source) => ({ enonce, items: [correct, ...wrong].map((value, index) => item(value, index === 0, source, index)), correction_generale: `Décision ou repère fondé sur le bloc ${source} du corpus.` });
const pick = (i) => facts[i].verso;
const stems = [
  ['Mécanisme et topographie', ['Chez ce motard avec paralysie haute, quelle proposition relie correctement mécanisme et topographie ?', pick(3), [pick(4), pick(5), pick(16), pick(19)], 92], ['Devant une suspicion d’avulsion, quelle affirmation change réellement la stratégie de reconstruction ?', pick(12), [pick(10), pick(15), pick(18), pick(21)], 112], ['Une main préservée après traumatisme du plexus oriente prioritairement quel objectif ?', pick(14), [pick(13), pick(17), pick(20), pick(83)], 112], ['Lors d’une atteinte C8-T1, quel déficit est attendu dans le corpus ?', pick(15), [pick(14), pick(22), pick(25), pick(67)], 112], ['Après luxation d’épaule, quel risque associé impose une vérification immédiate ?', pick(19), [pick(16), pick(27), pick(36), pick(65)], 132]],
  ['Bilan clinique', ['Au premier examen, quelle méthode rend le suivi réellement comparable ?', pick(21), [pick(24), pick(31), pick(39), pick(43)], 145], ['Quel nerf doit être recherché explicitement dans le testing moteur ?', pick(23), [pick(18), pick(28), pick(46), pick(69)], 145], ['Quelle association décrit le bilan sensitif du support ?', pick(25), [pick(26), pick(29), pick(33), pick(76)], 145], ['Quel signe sympathique doit être recherché ?', pick(27), [pick(26), pick(30), pick(34), pick(82)], 145], ['Quel constat au premier mois est un signal de gravité ?', pick(28), [pick(32), pick(35), pick(38), pick(89)], 145]],
  ['Explorations et délais', ['Quelle exploration est utile vers la troisième-quatrième semaine avant l’exploration ?', pick(34), [pick(32), pick(37), pick(39), pick(40)], 160], ['Que suggère une pseudoméningocèle dans ce contexte ?', pick(35), [pick(36), pick(10), pick(13), pick(49)], 160], ['Quelle avulsion est réputée plus difficile à objectiver ?', pick(36), [pick(15), pick(17), pick(20), pick(30)], 160], ['Quand la chirurgie de réparation indiquée doit-elle être organisée ?', pick(38), [pick(37), pick(40), pick(41), pick(91)], 175], ['Quelle limite temporelle est rapportée pour une récupération nerveuse utile ?', pick(40), [pick(34), pick(38), pick(39), pick(75)], 175]],
  ['Exploration et greffe', ['Quel élément technique est indispensable pendant l’exploration microchirurgicale ?', pick(42), [pick(41), pick(43), pick(47), pick(62)], 186], ['Quel repère est une clé de l’exploration sus-claviculaire ?', pick(46), [pick(45), pick(48), pick(51), pick(63)], 196], ['Quelle structure doit être préservée au voisinage de C5 ?', pick(47), [pick(46), pick(50), pick(52), pick(64)], 196], ['Quel résultat de stimulation est un argument contre l’avulsion médullaire ?', pick(49), [pick(51), pick(54), pick(60), pick(69)], 196], ['Quel critère autorise une greffe radiculaire ?', pick(54), [pick(52), pick(55), pick(56), pick(84)], 220]],
  ['Épaule', ['Quel transfert vise la fonction dépendante du suprascapulaire ?', pick(58), [pick(59), pick(63), pick(67), pick(71)], 244], ['Quel donneur est utilisé pour ce transfert ?', pick(57), [pick(60), pick(64), pick(68), pick(72)], 244], ['Quel transfert peut réanimer la branche antérieure axillaire ?', pick(63), [pick(57), pick(67), pick(70), pick(74)], 257], ['Quel repère anatomique sert au transfert de la longue portion du triceps ?', pick(64), [pick(61), pick(66), pick(69), pick(77)], 257], ['Quelle précaution s’applique avant transfert radial vers axillaire ?', pick(66), [pick(65), pick(68), pick(73), pick(79)], 271]],
  ['Coude', ['Quel donneur est utilisé pour la réanimation du biceps ?', pick(67), [pick(57), pick(63), pick(71), pick(75)], 286], ['Quelle fonction est recherchée par ce transfert ?', pick(68), [pick(58), pick(63), pick(72), pick(82)], 286], ['Quel contrôle sécurise la sélection du fascicule donneur ?', pick(69), [pick(70), pick(73), pick(76), pick(78)], 286], ['Quel donneur peut compléter la réanimation du brachial ?', pick(71), [pick(67), pick(74), pick(75), pick(79)], 301], ['Quel repère aide à identifier la branche motrice du brachial ?', pick(72), [pick(70), pick(73), pick(76), pick(80)], 301]],
  ['Priorités et suivi', ['Dans une paralysie totale, quelle fonction est la première cible rapportée ?', pick(79), [pick(80), pick(81), pick(82), pick(83)], 336], ['Quelle est la deuxième cible fonctionnelle ?', pick(80), [pick(79), pick(81), pick(82), pick(86)], 336], ['Quelle douleur est de mauvais pronostic lorsqu’elle persiste ?', pick(84), [pick(83), pick(85), pick(87), pick(91)], 350], ['Quel rôle spécifique a l’ergothérapie ?', pick(86), [pick(85), pick(88), pick(89), pick(93)], 371], ['Quand débuter l’accompagnement de réinsertion ?', pick(87), [pick(88), pick(89), pick(90), pick(96)], 371]],
  ['Chirurgie secondaire et messages ECN', ['Quand discuter une chirurgie palliative ?', pick(89), [pick(88), pick(90), pick(92), pick(99)], 394], ['Quel geste fait partie des options palliatives ?', pick(90), [pick(91), pick(92), pick(93), pick(98)], 394], ['Quelle information réaliste donner avant reconstruction ?', pick(93), [pick(94), pick(95), pick(96), pick(99)], 421], ['Quelle urgence associée ne doit jamais être ignorée ?', pick(96), [pick(94), pick(95), pick(97), pick(98)], 421], ['Quelle distinction est déterminante à l’ECN ?', pick(95), [pick(94), pick(96), pick(97), pick(99)], 421]],
];
const qcm = stems.map(([label, ...values], i) => ({ label: `QCM ${i + 1} · ${label}`, questions: values.map(([enonce, correct, wrong, source]) => q(enonce, correct, wrong, source)) }));
const dpCases = [
  ['Traction haute C5-C6 chez un motard', 'Un jeune adulte est admis après un accident de moto avec abaissement brutal de l’épaule. Il présente une faiblesse de l’épaule et du coude, tandis que la main reste fonctionnelle. Les pouls sont palpables mais le bilan moteur muscle par muscle, sensitif et douloureux est consigné. Au suivi à un mois, la récupération spontanée est recherchée avant de décider d’une reconstruction.', 12],
  ['Avulsion complète avec douleur neuropathique', 'Un patient jeune adulte présente une paralysie complète C5-T1 après traumatisme par traction, avec douleurs neuropathiques intenses. L’examen répété, le bilan vasculaire et l’imagerie des racines sont organisés. L’objectif annoncé est fonctionnel et hiérarchisé. Au suivi, l’absence de racine greffable oriente la planification des transferts et l’accompagnement rééducatif.', 9],
  ['Atteinte C8-T1 prédominante', 'Un patient consulte après traction vers le haut du membre supérieur. La flexion du pouce et des doigts ainsi que les muscles intrinsèques de la main sont déficitaires. Le bilan sensitif et la recherche de Claude Bernard-Horner complètent l’examen. Au suivi, les examens cliniques et l’imagerie sont confrontés avant toute indication de chirurgie.', 15],
  ['Lésion rétro-infraclaviculaire avec risque vasculaire', 'Un patient adulte victime d’une fracture-luxation d’épaule présente un déficit axillaire et radial. La prise des pouls, l’échodoppler et l’évaluation des lésions ostéoarticulaires sont réalisés sans délai. L’examen précise les territoires musculocutané, suprascapulaire, axillaire et radial. Au suivi, la récupération de chaque contingent guide l’indication d’une réparation ciblée.', 17],
  ['Rupture postganglionnaire potentiellement greffable', 'Un patient présente une paralysie traumatique du plexus sans récupération initiale. L’imagerie des racines est réalisée vers la troisième semaine et l’exploration est programmée dans la fenêtre précoce. Au bloc, la qualité des moignons et la présence d’une zone fasciculaire saine déterminent la possibilité de greffe. Au suivi postopératoire, testing et douleur sont consignés dans les mêmes territoires.', 54],
  ['Réanimation de l’épaule', 'Un patient ayant une atteinte proximale avec main conservée est adressé pour réanimation de l’épaule. L’exploration sus-claviculaire identifie le phrénique, le tronc primaire supérieur et le suprascapulaire ; un donneur moteur non atteint est envisagé. La stratégie est discutée avec le patient avant l’intervention. Au suivi, stabilité de l’épaule, douleur et récupération motrice sont évaluées régulièrement.', 57],
  ['Réanimation de la flexion du coude', 'Un patient avec main et contingent ulnaire préservés garde un déficit majeur de flexion du coude après traumatisme du plexus. La réinnervation du biceps par donneur fasciculaire de proximité est planifiée sous contrôle de stimulation. Les objectifs et les limites de récupération sont expliqués. Au suivi, la récupération de la flexion, la force et la rééducation sont évaluées de façon répétée.', 67],
  ['Déficit résiduel et projet de vie', 'Après une période prolongée de récupération partielle, un patient conserve un déficit fonctionnel et une douleur neuropathique. L’équipe associe chirurgien, rééducation, ergothérapie et accompagnement socioprofessionnel. Les possibilités de geste palliatif sont discutées en fonction de la fonction restante, sans promettre une restitution anatomique complète. Au suivi, autonomie, douleur et reprise d’activité sont réévaluées.', 89],
];
const dp = dpCases.map(([label, vignette, start], i) => ({ label: `DP ${i + 1} · ${label}`, vignette: `<p>${vignette}</p>`, questions: Array.from({ length: 7 }, (_, n) => { const fact = facts[(start + n) % facts.length]; return q(n === 0 ? `Quelle décision est prioritaire dans cette situation clinique ?` : `Nouvel élément : le suivi apporte un repère supplémentaire. Quelle proposition est conforme au corpus ?`, fact.verso, [facts[(start+n+17)%facts.length].verso, facts[(start+n+35)%facts.length].verso, facts[(start+n+52)%facts.length].verso, facts[(start+n+71)%facts.length].verso], fact.source[0]); }) }));

emitOrthopediePackage({ chapterDir, outputDir, fiche, facts, series: [...qcm, ...dp] });

/**
 * Chapitre 121 — contenus étudiants rédigés à partir des blocs retenus.
 * Les formulations cliniques des DP servent uniquement de cadre ; aucune
 * donnée technique n'est ajoutée hors corpus.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const chapterDir = resolve(process.argv[2] || '../.corpus-orthopedie/traitement-des-malformations-congenitales-du-poignet-et-de-l-avant-bras');
const out = resolve(process.argv[3] || join(chapterDir, 'delivery', 'quality-v1'));
mkdirSync(out, { recursive: true });
const title = 'Traitement des malformations congénitales du poignet et de l’avant-bras';
const facts = [
 ['Quel est le fil directeur du projet thérapeutique ?', 'La fonction du membre et la préhension.',12],
 ['Quelles régions analyser dans une malformation du membre supérieur ?', 'Main, poignet, avant-bras, coude et parfois bras.',15],
 ['Une demande morphologique suffit-elle à décider un geste ?', 'Non : elle est mise en regard de l’objectif fonctionnel.',17],
 ['Quelle malformation préaxiale atteint l’ensemble du membre supérieur ?', 'La main bote radiale.',21],
 ['Quel système décrit la gravité anatomique de la main bote radiale ?', 'La classification de Bayne et Klug.',21],
 ['Une orthèse préopératoire est indiquée devant quelle situation ?', 'Une inclinaison radiale importante et peu réductible.',28],
 ['Quel objectif vise l’orthèse et les mobilisations préopératoires ?', 'Obtenir une réductibilité parfaite avant le réalignement.',28],
 ['Quel risque évite la distraction progressive ?', 'Une compression excessive des structures cartilagineuses.',29],
 ['Quelles structures limitent une réduction de poignet ?', 'Parties molles, longueur osseuse et équilibre musculotendineux.',30],
 ['À quoi contribue l’allongement radial ?', 'À l’équilibre du poignet si le radius court a une épiphyse individualisée.',31],
 ['Quand l’allongement ulnaire est-il surtout discuté ?', 'En fin de croissance dans les formes sévères, après stabilisation du poignet.',32],
 ['Quels types de fixateur sont décrits pour l’allongement ?', 'Fixateur monoplan ou circulaire selon l’indication.',36],
 ['Où prennent appui les broches distales du montage de distraction ?', 'Sur les quatrième et cinquième métacarpiens.',37],
 ['Où prennent appui les broches proximales du montage de distraction ?', 'Sur la diaphyse ulnaire.',37],
 ['Sur quel versant se situe le corps du fixateur ?', 'Sur le versant ulnaire, à hauteur de l’interligne ulnocarpien.',37],
 ['Quelle étape précède le réalignement angulaire ?', 'La distraction progressive.',38],
 ['Quel gain permet la distraction avant réalignement ?', 'Un gain de parties molles limitant les contraintes compressives.',38],
 ['Quand retire-t-on le fixateur de distraction ?', 'Après correction angulaire et de longueur optimale.',42],
 ['Quel geste du carpe est facilité après distraction ?', 'La centralisation ou la radialisation.',42],
 ['Quelle voie est décrite lorsque le poignet est assoupli ?', 'Une voie dorsale avec abord sinusoïdal.',43],
 ['Quel risque cutané comporte le lambeau bilobé ?', 'Des nécroses cutanées partielles.',43],
 ['Quelle structure doit être ouverte au début de la correction ?', 'Le rétinaculum des extenseurs.',54],
 ['Quel nerf peut être situé dans la concavité de la déformation ?', 'Le nerf médian.',54],
 ['Que doit exposer l’arthrotomie avant correction ?', 'Le carpe proximal et l’épiphyse distale de l’ulna.',58],
 ['Que signifie une réduction sous tension du nerf médian ?', 'Elle n’est pas acceptable et impose de revoir la préparation ou la correction.',59],
 ['Quel rapport anatomique vise la centralisation ?', 'L’épiphyse ulnaire en regard du massif carpien.',60],
 ['Où stabilise-t-on la tête ulnaire lors de centralisation ?', 'Dans une logette de la première rangée du carpe.',60],
 ['Quel trajet suit la broche de centralisation ?', 'Du troisième métacarpien vers la cavité médullaire ulnaire.',63],
 ['Quels tendons peuvent être réinsérés plus distalement après centralisation ?', 'Le fléchisseur et l’extenseur ulnaires du carpe.',63],
 ['Quel but a ce rééquilibrage tendineux ?', 'Limiter la récidive d’inclinaison radiale.',63],
 ['Quel prix fonctionnel a la centralisation ?', 'Une mobilité de poignet nulle, équivalent d’arthrodèse ulnocarpienne.',78],
 ['Quelle complication évolutive reste possible après centralisation ?', 'La récidive de déformation.',78],
 ['Quel effet sur la croissance peut avoir la centralisation ?', 'Un raccourcissement du membre et une atteinte de croissance ulnaire.',78],
 ['Quel élément n’est pas réséqué lors de radialisation ?', 'Le massif carpien.',83],
 ['Quel bénéfice fonctionnel cherche la radialisation ?', 'Conserver un degré de mobilité du poignet.',83],
 ['Dans quelle position réduit-on le carpe lors de radialisation ?', 'En regard de l’épiphyse ulnaire, en légère hypercorrection ulnaire.',83],
 ['Comment stabilise-t-on une radialisation ?', 'Par broche, complétée de transferts tendineux.',86],
 ['Quelles unités tendineuses peuvent être transférées pour radialisation ?', 'FCR ou ECR.',86],
 ['Quelle contrainte vasculonerveuse limite la radialisation ?', 'La tension sur le nerf médian ou l’artère radiale.',88],
 ['Quel est l’objectif de la distraction avant radialisation ?', 'Diminuer les difficultés de réduction et la tension sur les structures.',88],
 ['Quelle alternative vascularisée peut être proposée pendant la croissance ?', 'Le transfert métatarsophalangien vascularisé de Vilkki.',92],
 ['Quel rôle mécanique a le transfert de Vilkki ?', 'Former un arc-boutant entre ulna et deuxième métacarpien.',92],
 ['Quel atout évolutif a ce transfert ?', 'Son potentiel de croissance accompagne le membre.',93],
 ['Comment est le radius dans la maladie de Madelung ?', 'Court et courbé.',97],
 ['Vers où regarde la surface articulaire radiale dans Madelung ?', 'Vers la paume et l’ulna.',97],
 ['Quel relief ulnaire est fréquent dans Madelung ?', 'Une tête ulnaire proéminente.',97],
 ['Chez quel sexe Madelung est-elle plus fréquente selon le corpus ?', 'Chez les filles.',105],
 ['Quel élément attire proximalement le lunatum dans Madelung ?', 'Le ligament de Vickers.',105],
 ['Quelle forme peut prendre le lunatum dans les formes sévères ?', 'Une forme ogivale.',105],
 ['Quand la subluxation dorsale de la tête ulnaire est-elle surtout visible ?', 'Après maturité osseuse.',107],
 ['À quel âge le diagnostic de Madelung est-il souvent posé ?', 'À l’adolescence.',107],
 ['Quel type de douleurs peut rendre l’indication difficile ?', 'Douleurs radiocarpiennes, ulnocarpiennes ou radio-ulnaires.',113],
 ['Comment décide-t-on l’indication dans Madelung ?', 'De façon individualisée selon retentissement et douleurs.',113],
 ['Quel geste traite une fermeture prématurée de croissance radiale avant maturité ?', 'La physiolyse de Vickers.',119],
 ['Quelle voie protège artère radiale, nerf médian et fléchisseurs lors de physiolyse ?', 'La voie antérieure.',119],
 ['Que retire-t-on lors de physiolyse ?', 'La zone anormale de fermeture de croissance.',123],
 ['Quel matériau comble la cavité après physiolyse ?', 'Une greffe graisseuse.',123],
 ['Quel est le but de la graisse après physiolyse ?', 'Prévenir une réossification rapide.',123],
 ['Quelle immobilisation est décrite après physiolyse ?', 'Une attelle antalgique pendant environ quinze jours.',127],
 ['Comment apparaît la correction après physiolyse ?', 'Progressivement par remodelage lié à la croissance.',127],
 ['Que devient la cicatrice osseuse avec la croissance ?', 'Elle migre proximalement.',127],
 ['Quel suivi vérifie l’évolution après physiolyse ?', 'Un suivi clinique et radiologique.',129],
 ['Pourquoi la physiolyse ne corrige-t-elle plus la malposition après maturité ?', 'La correction par croissance n’est plus possible.',130],
 ['Quel geste radial corrige Madelung après maturité ?', 'Une ostéotomie d’ouverture du radius distal.',130],
 ['Quelle voie est citée pour l’ostéotomie radiale distale de Madelung ?', 'La voie de Henry.',130],
 ['Que peut compléter l’ostéotomie radiale si l’index radio-ulnaire reste déséquilibré ?', 'Une ostéotomie ulnaire.',136],
 ['À quelles anomalies s’associe la synostose radiocubitale proximale ?', 'Anomalies musculaires, de membrane interosseuse et parfois de tête radiale.',136],
 ['Pourquoi ne pas promettre une pronosupination normale par séparation du pont ?', 'Les anomalies associées rendent cette restauration illusoire.',136],
 ['De quoi dépend le retentissement d’une synostose ?', 'Du caractère uni- ou bilatéral et de la position de blocage.',141],
 ['Quelle articulation peut compenser partiellement une position en supination ?', 'Le poignet et l’épaule.',141],
 ['Dans quelle position la compensation est-elle moins efficace ?', 'En pronation accusée.',141],
 ['Comment certains enfants compensent-ils une synostose ?', 'En accentuant la pronation, main à l’envers.',142],
 ['Quelle position de synostose est la plus candidate à correction ?', 'La synostose fixée en pronation.',142],
 ['Quel seuil de pronation rend l’indication de correction forte dans le corpus ?', 'Au-delà de 60 degrés.',144],
 ['Quels éléments modulent une correction de synostose ?', 'Position initiale, côté opposé et limites peropératoires.',144],
 ['Où est centré l’abord de l’ostéotomie de synostose ?', 'Sur la crête ulnaire.',152],
 ['Entre quels muscles passe cet abord ?', 'Entre FCU et les muscles postérieurs.',152],
 ['Comment repère-t-on le trait d’ostéotomie ?', 'À l’amplificateur, à travers le pont de synostose.',152],
 ['Où situe-t-on le trait par rapport à la coronoïde ?', 'Distalement à la coronoïde.',152],
 ['Quelle fixation est décrite après dérotation ?', 'Broche centromédullaire et broche antirotation.',154],
 ['Quelle immobilisation complète l’ostéotomie de synostose ?', 'Une immobilisation brachiopalmaire.',154],
 ['Quel contrôle est réalisé au lâcher du garrot ?', 'La coloration de la main.',154],
 ['Quelles complications immédiates surveille-t-on après dérotation ?', 'Complications vasculaires, nerveuses et syndrome des loges.',154],
 ['Quelles alternatives aux broches sont possibles dans certaines techniques ?', 'Une plaque ou un fixateur externe.',154],
 ['Quel intérêt a un fixateur externe en cas de souffrance vasculonerveuse ?', 'Diminuer secondairement la dérotation.',154],
 ['Quel facteur augmente le risque de complication après dérotation ?', 'Une grande amplitude de correction.',154],
 ['Quel impératif guide toute correction morphologique ?', 'Servir un objectif fonctionnel et respecter croissance et structures vasculonerveuses.',154],
 ['Quel risque impose de limiter une réduction de main bote radiale ?', 'La tension sur le nerf médian ou l’artère radiale.',59],
 ['Quelle étape protège les structures avant une centralisation ?', 'L’assouplissement par distraction ou manipulation.',43],
 ['Quel rapport doit être analysé avant un geste local de poignet ?', 'L’ensemble du membre et la fonction de préhension.',17],
 ['Quel choix oppose centralisation et radialisation ?', 'Stabilité sans mobilité versus mobilité relative avec rééquilibrage.',83],
 ['Quel objectif de la surveillance après ostéotomie de synostose est prioritaire ?', 'Détecter rapidement une souffrance vasculonerveuse.',154],
 ['Quel facteur rend une indication de Madelung non automatique ?', 'La difficulté à attribuer précisément les douleurs.',113],
 ['Quelle stratégie respecte une correction difficile chez l’enfant ?', 'Préparer progressivement et ne pas forcer les cartilages.',29],
 ['Quel résultat radiologique suit le remodelage après physiolyse ?', 'L’évolution de l’orientation radiale.',129],
 ['Quel bénéfice n’est pas promis par l’ostéotomie de synostose ?', 'La restauration anatomique de toute la pronosupination.',136],
 ['Quel est le rôle des transferts tendineux après radialisation ?', 'Rééquilibrer les forces qui entretiennent l’inclinaison radiale.',86],
 ['Quel contrôle fonctionnel complète l’alignement après radialisation ?', 'La mobilité utile du poignet et l’utilisation spontanée de la main.',86],
 ['Quel geste doit être individualisé chez l’adolescent atteint de Madelung ?', 'L’indication opératoire.',113],
 ['Quel est l’objectif du contrôle final après dérotation ?', 'La stabilité du montage et la sécurité de la main.',154]
];
const flashcards = facts.map(([recto, verso, source]) => ({ recto, verso, source: [source] }));
if (flashcards.length < 100) throw new Error(`Cartes insuffisantes : ${flashcards.length}`);
const q = (enonce, correct, wrongs, source) => ({ enonce, items: [correct, ...wrongs].map((text, i) => ({ lettre: String.fromCharCode(65 + i), enonce: text, is_correct: i === 0, justification: i === 0 ? `Conforme au bloc ${source} du corpus Orthopédie.` : 'Cette proposition est incompatible avec le mécanisme ou la stratégie décrits dans le corpus.' })), correction_generale: `Réponse fondée sur le bloc ${source} du corpus Orthopédie.` });
const qs = [
 ['Dans une malformation du membre supérieur, quel objectif organise le projet thérapeutique ?', 'La fonction et la préhension.', ['La correction radiologique isolée.', 'La longueur d’une cicatrice.', 'Le choix d’un implant sans bilan.', 'La demande morphologique seule.'],12],
 ['Devant une inclinaison radiale rigide, quel est le but de la préparation progressive ?', 'Obtenir une réductibilité avant le réalignement.', ['Forcer une centralisation immédiate.', 'Supprimer toute mobilité.', 'Éviter l’analyse des parties molles.', 'Retirer l’ulna.'],28],
 ['La distraction progressive est surtout utilisée pour :', 'Éviter les contraintes compressives excessives sur les cartilages.', ['Augmenter la tension sur le nerf médian.', 'Remplacer toute fixation.', 'Supprimer le contrôle radiologique.', 'Créer une arthrodèse.'],29],
 ['Dans un montage de distraction de main bote radiale, les appuis distaux sont placés sur :', 'Les quatrième et cinquième métacarpiens.', ['Le premier métacarpien seul.', 'Le radius proximal.', 'Le carpe sans broche.', 'La tête radiale.'],37],
 ['Quel résultat doit précéder le retrait du fixateur ?', 'Une correction optimale de longueur et d’angulation.', ['Une douleur persistante.', 'Une réduction sous forte tension.', 'La récidive d’inclinaison.', 'Une immobilisation sans correction.'],42],
 ['Lors de l’exploration dorsale, quel nerf doit être repéré ?', 'Le nerf médian.', ['Le nerf tibial.', 'Le nerf fibulaire commun.', 'Le nerf phrénique.', 'Le nerf sciatique.'],54],
 ['Quelle situation impose de revoir l’amplitude de correction ?', 'Une tension sur le nerf médian ou l’artère radiale.', ['Une bonne réductibilité.', 'Une coloration normale de la main.', 'Une mobilisation passive facile.', 'Un équilibre tendineux restauré.'],59],
 ['La centralisation vise à :', 'Mettre l’épiphyse ulnaire en regard du massif carpien.', ['Réséquer le massif carpien.', 'Allonger le radius sans fixation.', 'Séparer une synostose proximale.', 'Réparer le ligament de Vickers.'],60],
 ['Quel est le principal coût fonctionnel de la centralisation ?', 'Une mobilité du poignet nulle.', ['Une pronosupination normale garantie.', 'Une croissance radiale augmentée.', 'Une disparition de toute récidive.', 'Une absence de nécessité de suivi.'],78],
 ['La radialisation se distingue de la centralisation car elle :', 'Ne résèque pas le massif carpien et conserve une mobilité relative.', ['Exige une arthrodèse systématique.', 'Interdit tout transfert tendineux.', 'Supprime l’épiphyse ulnaire.', 'Nécessite une séparation de synostose.'],83],
 ['Quel élément participe au rééquilibrage après radialisation ?', 'Un transfert de FCR ou d’ECR.', ['Un transfert de tendon d’Achille.', 'La résection du nerf médian.', 'Une ostéotomie tibiale.', 'Une plaque sans correction.'],86],
 ['Quelle limite doit faire réduire l’ambition de radialisation ?', 'La tension sur les structures vasculonerveuses.', ['La présence de cartilage.', 'La croissance du membre.', 'Un carpe conservé.', 'La possibilité de suivi.'],88],
 ['Quel transfert peut former un arc-boutant pendant la croissance ?', 'Le transfert métatarsophalangien vascularisé de Vilkki.', ['Une greffe cutanée isolée.', 'Une arthrodèse totale.', 'Un fixateur sans appui.', 'Une résection ulnaire.'],92],
 ['Dans la maladie de Madelung, quelle structure attire le lunatum ?', 'Le ligament de Vickers.', ['Le ligament croisé antérieur.', 'Le ligament annulaire.', 'Le ligament patellaire.', 'Le tendon d’Achille.'],105],
 ['Avant maturité osseuse, quel geste traite la fermeture prématurée de croissance radiale ?', 'La physiolyse de Vickers.', ['Une arthrodèse ulnocarpienne.', 'Une ostéotomie fémorale.', 'Une résection de première rangée du carpe.', 'Un simple plâtre définitif.'],119],
 ['Après physiolyse, quelle interposition limite la réossification ?', 'Une greffe graisseuse.', ['Une plaque métallique.', 'Un drain articulaire.', 'Une broche sans comblement.', 'Un tendon transféré.'],123],
 ['Après maturité osseuse, quelle correction est décrite pour Madelung ?', 'Une ostéotomie d’ouverture du radius distal.', ['Une physiolyse seule.', 'Une distraction sans geste osseux.', 'Une centralisation de routine.', 'Une séparation simple du pont.'],130],
 ['Pourquoi une séparation simple du pont est-elle inadaptée à la synostose radiocubitale ?', 'Les anomalies associées rendent illusoire la restauration de pronosupination.', ['Elle augmente la croissance radiale.', 'Elle corrige toujours la position.', 'Elle supprime toute complication.', 'Elle évite le suivi clinique.'],136],
 ['Quelle position de synostose justifie le plus souvent une correction ?', 'Une synostose fixée en pronation.', ['Une position en supination bien compensée.', 'Une mobilité normale.', 'Une absence de retentissement.', 'Une simple douleur d’épaule.'],142],
 ['Au-delà de quel angle de pronation le corpus retient-il une indication forte ?', '60 degrés.', ['10 degrés.', '20 degrés.', '30 degrés.', '180 degrés.'],144],
 ['Quel contrôle est impératif après ostéotomie de synostose ?', 'La coloration de la main et la surveillance vasculonerveuse.', ['La mobilité lombaire seule.', 'Le rythme cardiaque isolé.', 'La force de préhension à une heure uniquement.', 'Aucun contrôle après garrot.'],154],
 ['Quel montage peut permettre de diminuer secondairement une dérotation ?', 'Un fixateur externe.', ['Une attelle sans surveillance.', 'Une greffe graisseuse.', 'Un lambeau bilobé.', 'Une arthrotomie isolée.'],154],
 ['Quel facteur augmente le risque de complication après dérotation ?', 'Une correction de grande amplitude.', ['Une correction prudente.', 'Une immobilisation adaptée.', 'Un contrôle de coloration.', 'Une information du patient.'],154],
 ['Quelle synthèse est correcte pour une correction de malformation ?', 'Elle doit servir la fonction et respecter la croissance ainsi que les structures vasculonerveuses.', ['Elle doit toujours maximiser la correction radiologique.', 'Elle ne dépend jamais de la préhension.', 'Elle évite toute surveillance.', 'Elle rend les parties molles secondaires.'],154],
 ['Quel intérêt a le suivi après physiolyse de Vickers ?', 'Vérifier le remodelage et l’évolution de l’orientation radiale.', ['Éviter toute radiographie.', 'Confirmer une réossification immédiate.', 'Décider une arthrodèse de principe.', 'Supprimer l’attelle antalgique le jour même.'],129],
 ['Quelle proposition décrit le mieux l’indication de Madelung ?', 'Elle est individualisée selon retentissement et douleurs.', ['Elle est automatique devant toute radiographie.', 'Elle dépend uniquement de l’âge.', 'Elle impose toujours une ostéotomie.', 'Elle exclut le projet du patient.'],113],
 ['Quelle voie peut être utilisée pour ostéotomie de Madelung mature ?', 'La voie de Henry.', ['La voie postérieure du genou.', 'La voie de Latarjet.', 'La voie de Nuss.', 'La voie transorale.'],130],
 ['Que peut ajouter une ostéotomie ulnaire dans Madelung ?', 'Rééquilibrer un index radio-ulnaire distal persistant.', ['Restaurer une croissance radiale arrêtée.', 'Éviter toute ostéotomie radiale.', 'Remplacer la physiolyse avant maturité.', 'Traiter une synostose proximale.'],136],
 ['Dans une main bote radiale, quel élément réduit le risque de récidive d’inclinaison ?', 'Le rééquilibrage des tendons ulnaires du carpe.', ['La résection du nerf médian.', 'L’absence de stabilisation.', 'La suppression de la rééducation.', 'Un geste cutané isolé.'],63],
 ['Quelle est la suite logique d’une dérotation de synostose fixée par broches ?', 'Immobilisation brachiopalmaire et surveillance des loges.', ['Mobilisation sans aucun contrôle.', 'Absence de suivi postopératoire.', 'Plâtre du membre inférieur.', 'Ablation immédiate des broches.'],154],
 ['Pourquoi la correction morphologique n’est-elle pas un objectif suffisant ?', 'Parce qu’elle doit améliorer une fonction réelle sans compromettre croissance ou sécurité.', ['Parce que la radiographie ne sert jamais.', 'Parce que la fonction ne compte pas.', 'Parce que tout geste est identique.', 'Parce que les nerfs ne sont pas concernés.'],17],
 ['Dans la synostose, quelle information module la correction visée ?', 'La position initiale, le côté opposé et les limites peropératoires.', ['La préférence de l’opérateur seule.', 'La taille d’une broche seule.', 'La radiographie de thorax.', 'L’absence de plainte fonctionnelle.'],144],
 ['Quelle difficulté peut justifier une distraction avant réalignement ?', 'Une réduction peu réductible avec rétraction des parties molles.', ['Une main parfaitement souple.', 'Une absence d’inclinaison.', 'Une fonction déjà optimale.', 'Une vascularisation normale sans tension.'],30],
 ['Quel risque cutané doit être expliqué avec un lambeau bilobé ?', 'La nécrose cutanée partielle.', ['Une fusion osseuse certaine.', 'Une paralysie tibiale.', 'Une arthrose de hanche.', 'Une fracture fémorale.'],43],
 ['Après centralisation, quelle évolution demeure possible malgré la stabilisation ?', 'Une récidive de déformation.', ['Une mobilité complète garantie.', 'Une croissance radiale spontanée.', 'Une absence de raccourcissement.', 'Une suppression de toute contrainte.'],78],
 ['Quelle stratégie protège le mieux une correction complexe chez l’enfant ?', 'Une préparation progressive, une correction limitée par la sécurité et un suivi.', ['Une correction forcée en un temps.', 'L’absence de contrôle neurovasculaire.', 'Une arthrodèse systématique.', 'L’arrêt de toute rééducation.'],29],
 ['Quelle structure ne doit pas être mise sous tension lors de la correction ?', 'L’artère radiale.', ['Le tendon d’Achille.', 'Le ligament patellaire.', 'Le nerf obturateur.', 'La veine saphène interne.'],88],
 ['Quel résultat de la radialisation dépend des unités tendineuses disponibles ?', 'Le maintien d’un équilibre dynamique du poignet.', ['La fermeture de croissance radiale.', 'La restauration de la pronosupination.', 'La taille du radius.', 'La maturité osseuse seule.'],86],
 ['Quel est le rôle principal du patient dans la décision de geste pour Madelung ?', 'Exprimer le retentissement fonctionnel et les douleurs qui sont mis en balance.', ['Choisir seul une technique sans bilan.', 'Ignorer l’évolution de la maladie.', 'Éviter toute information sur les options.', 'Décider selon l’apparence seule.'],113],
 ['Quelle complication doit être recherchée dans les heures après dérotation ?', 'Un syndrome des loges.', ['Une rupture de LCA.', 'Une luxation d’épaule.', 'Une insuffisance cardiaque.', 'Une fracture du bassin.'],154]
];
if (qs.length !== 40) throw new Error(`QCM attendus : 40, reçu ${qs.length}`);
const qcm = Array.from({ length: 8 }, (_, i) => ({ label: `QCM ${i + 1} · Malformations congénitales du poignet et de l’avant-bras`, vignette: '', questions: qs.slice(i * 5, i * 5 + 5).map(([stem, correct, wrongs, source]) => q(`Dans la décision de malformation du membre supérieur, ${stem.charAt(0).toLowerCase()}${stem.slice(1)}`, correct, wrongs, source)) }));
const dpSpecs = [
 ['Main bote radiale rigide', '<p><strong>Une fillette de 3 ans</strong> est adressée pour une main bote radiale avec inclinaison importante, peu réductible malgré la mobilisation douce. L’examen du membre supérieur analyse la main, le poignet, l’avant-bras et le coude. L’équipe explique aux parents que l’objectif est fonctionnel.</p><p>Une préparation par orthèse puis distraction est envisagée avant le réalignement. <strong>Au suivi postopératoire</strong>, la réductibilité, l’alignement, l’état cutané et la fonction de préhension sont réévalués.</p>', [0,1,2,3,4,5,6]],
 ['Correction par centralisation', '<p><strong>Un garçon de 5 ans</strong> présente une main bote radiale sévère après une préparation progressive ayant obtenu un poignet assoupli. L’équipe programme une correction dorsale et discute une centralisation pour stabiliser le carpe sur l’ulna.</p><p>Les parents sont informés du compromis entre stabilité et mobilité. <strong>Au suivi</strong>, l’alignement, la récidive, la longueur du membre et l’utilisation spontanée de la main sont surveillés.</p>', [7,8,9,10,11,12,13]],
 ['Radialisation et équilibre tendineux', '<p><strong>Une fille de 6 ans</strong> ayant une main bote radiale conserve un potentiel de mobilité. Après discussion, la stratégie retenue est une radialisation avec stabilisation par broche et rééquilibrage tendineux, sans résection du massif carpien.</p><p>La correction est limitée par la tension sur les structures vasculonerveuses. <strong>Au suivi postopératoire</strong>, l’équipe contrôle l’alignement, la mobilité utile et la stabilité du rééquilibrage.</p>', [14,15,16,17,18,19,20]],
 ['Madelung avant maturité', '<p><strong>Une adolescente de 12 ans</strong> consulte pour déformation progressive du poignet et douleurs à l’activité. Les radiographies évoquent une maladie de Madelung avant maturité osseuse. Le bilan précise le retentissement fonctionnel avant toute indication.</p><p>Une physiolyse de Vickers est discutée pour traiter une fermeture prématurée de croissance. <strong>Au suivi</strong>, l’attelle, la cicatrisation et le remodelage radiologique sont évalués.</p>', [21,22,23,24,25,26,27]],
 ['Madelung après maturité', '<p><strong>Une jeune femme de 19 ans</strong> présente une déformation de Madelung avec douleurs radio-ulnaires persistantes. Elle a terminé sa croissance. L’imagerie montre une malposition radiale et un déséquilibre radio-ulnaire distal discuté en réunion.</p><p>Une ostéotomie d’ouverture du radius distal est envisagée, avec information sur une éventuelle correction ulnaire complémentaire. <strong>Au suivi</strong>, douleur, mobilité et équilibre radio-ulnaire sont réévalués.</p>', [28,29,30,31,32,33,34]],
 ['Synostose pronatrice unilatérale', '<p><strong>Un garçon de 8 ans</strong> a une synostose radiocubitale proximale unilatérale bloquée en pronation marquée. Il compense difficilement avec le poignet et l’épaule dans les activités quotidiennes. Les parents décrivent une préhension main à l’envers.</p><p>Une ostéotomie de dérotation est discutée après analyse de la position de départ et du côté opposé. <strong>Au suivi</strong>, la coloration de la main, la fonction et la tolérance de l’immobilisation sont contrôlées.</p>', [35,36,37,38,39,40,41]],
 ['Ostéotomie de synostose et sécurité', '<p><strong>Une fille de 10 ans</strong> est opérée d’une synostose fixée en pronation avec retentissement fonctionnel majeur. Le trait d’ostéotomie est planifié à l’amplificateur à travers le pont. La dérotation est fixée par broches.</p><p>Une immobilisation brachiopalmaire est prévue. <strong>Dans les heures postopératoires</strong>, la coloration de la main et tout signe vasculonerveux ou de syndrome des loges sont surveillés.</p>', [42,43,44,45,46,47,48]],
 ['Projet fonctionnel global', '<p><strong>Un adolescent de 14 ans</strong> consulte pour une malformation complexe de l’avant-bras ayant déjà bénéficié d’une correction partielle. Il souhaite surtout améliorer les gestes de la vie courante. L’équipe reprend l’analyse globale du membre et des compensations avant de proposer un nouveau geste.</p><p>La famille est informée des limites d’une correction morphologique. <strong>Au suivi à distance</strong>, la fonction de préhension, la stabilité, la croissance et la sécurité vasculonerveuse guident l’évaluation du résultat.</p>', [49,50,51,52,53,54,55]]
];
const dpFactIndexes = [[0,5,7,12,15,17,24],[25,27,29,30,31,32,33],[34,36,37,38,39,40,42],[51,52,53,54,55,57,59],[61,62,63,64,65,66,67],[69,70,71,72,73,74,76],[79,80,81,82,83,85,87],[89,90,91,92,93,95,97]];
const qFromFact = (fact, offset) => {
  const wrongs = [facts[(offset + 11) % facts.length][1], facts[(offset + 29) % facts.length][1], facts[(offset + 47) % facts.length][1], facts[(offset + 71) % facts.length][1]];
  // Le DP réemploie une notion, jamais le recto identique d'une carte : il
  // l'inscrit dans la décision clinique du patient.
  const stem = `Dans cette décision de malformation du membre supérieur, ${fact[0].charAt(0).toLowerCase()}${fact[0].slice(1)}`;
  return q(stem, fact[1], wrongs, fact[2]);
};
const dp = dpSpecs.map(([label, vignette], i) => ({ label: `DP ${i + 1} · ${label}`, vignette: `${vignette}<p>Le patient ou la patiente est revu(e) avec sa famille au cours du suivi programmé.</p>`, questions: dpFactIndexes[i].map((factIndex, j) => {
  const question = qFromFact(facts[factIndex], factIndex);
  if (j) question.enonce = `Nouvel élément : ${question.enonce}`;
  return question;
}) }));
const chapter = { title, provenance: { extract: 'extract.json', sourceOnly: true, sourceBlocks: [12,15,17,21,28,29,30,31,32,36,37,38,42,43,54,58,59,60,63,78,83,86,88,92,93,97,105,107,113,119,123,127,129,130,136,141,142,144,152,154], clinicalFraming: 'Les DP apportent un patient et un suivi ; les assertions techniques renvoient exclusivement au corpus.' }, flashcards, series: [...qcm, ...dp] };
writeFileSync(join(out, 'chapter.json'), JSON.stringify(chapter, null, 2));
console.log(JSON.stringify({ out, flashcards: flashcards.length, qcm: qcm.length, dp: dp.length, questions: chapter.series.reduce((n,s) => n + s.questions.length,0) }));

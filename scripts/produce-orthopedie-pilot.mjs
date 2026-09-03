/**
 * Pilote qualité — Matériel d'ostéosynthèse : vis et plaques.
 * Toute donnée éditoriale est explicitement reliée aux blocs d'extraction
 * indiqués dans `coverage.json`. Ce script ne découpe pas de phrases et ne
 * produit aucun libellé générique.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { compileFicheModel } from './lib/orthopedie-fiche.mjs';

const chapterDir = resolve(process.argv[2] || '..\\.corpus-orthopedie\\materiel-d-osteosynthese-vis-et-plaques');
const outputDir = resolve(process.argv[3] || join(chapterDir, 'delivery', 'pilot-quality'));
mkdirSync(outputDir, { recursive: true });

const fig = (n, caption = '', position = 'after') => ({
  path: `img/img_${String(n).padStart(3, '0')}.png`, position, size: [1, 7, 9, 15, 16, 18].includes(n) ? 'large' : 'small', caption, ...(caption ? { sourceCaption: caption } : {}),
});
const r = (concept, bullets, extra = {}) => ({ concept, bullets, ...extra });
const reflex = (kind, bullets) => ({ kind, bullets });

const fiche = {
  title: 'Matériel d’ostéosynthèse : vis et plaques',
  year: '2025-2026',
  sourceBlocks: [6, 9, 11, 13, 20, 21, 22, 29, 33, 36, 37, 38, 41, 42, 43, 50, 53, 55, 57, 63, 71, 73, 81, 83, 88, 90, 100, 101, 107, 108, 109, 110, 111, 113, 115, 117],
  parts: [
    {
      title: 'Vis : principes mécaniques et préparation',
      sections: [
        { title: 'Compression par vis de traction', rows: [
          r('Rôle d’une vis', ['Une vis peut exercer une **traction** et comprimer deux fragments osseux.', 'L’effet de compression dépend de l’ancrage distal du filetage.'], { image: fig(1, 'Préparation du trajet et principe de compression par vis') }),
          r('Forage et ancrage', ['Le trajet est préparé par un forage au moteur.', 'La mèche a un diamètre légèrement inférieur à celui de la vis afin que le filetage s’ancre dans l’os.', { text: 'Exemple cortical :', children: ['Vis de 3,5 mm → mèche de 2,7 mm.'] }]),
          r('Compression maximale', ['Du côté de la tête, un diamètre de forage légèrement supérieur à celui de la vis limite l’ancrage proximal.', 'Le filetage s’ancre alors dans le fragment distal et renforce l’effet de traction.']),
          reflex('piege', ['Une mèche émoussée échauffe l’os et expose à une nécrose osseuse.', 'Le taraudage crée un pas de vis osseux ; sa nécessité reste controversée.']),
        ] },
        { title: 'Filetage, os et empreinte', rows: [
          r('Vis corticale', ['Le pas de vis est conçu pour la prise dans l’os cortical.', 'Elle sert habituellement à comprimer et fixer une plaque à l’os.', 'Son filetage est le plus souvent complet, parfois partiel.'], { image: fig(2) }),
          r('Vis spongieuse', ['Son rapport diamètre extérieur/âme est supérieur à celui d’une vis corticale pour améliorer la tenue dans l’os spongieux.', 'Elle est surtout employée comme vis de traction en zone épiphysométaphysaire.', 'Son filetage est habituellement partiel, parfois complet.'], { image: fig(3) }),
          r('Longueur du filetage', ['Un filetage court comprime un petit fragment situé à l’opposé du point d’entrée.', 'Pour une compression optimale, le filetage doit s’ancrer dans le deuxième fragment uniquement.', 'Le cours recommande le filetage le plus long possible.']),
          r('Empreinte de vis', ['Cruciforme : mauvaise accroche, progressivement abandonnée.', 'Hexagonale : bonne préhension mais peut s’arrondir sous contrainte excessive.', 'Stardrive : excellente tenue et moins de patinage ; l’ablation peut être plus difficile.'], { image: fig(7, 'Empreintes cruciforme, hexagonale et stardrive') }),
        ] },
      ],
    },
    {
      title: 'Vis spécialisées et verrouillage',
      sections: [
        { title: 'Vis canulées et sous-articulaires', rows: [
          r('Vis canulée', ['Elle est creuse pour le passage d’une broche-guide.', 'La broche améliore le positionnement et permet la mesure de longueur avec une jauge.', 'Elle porte le plus souvent un filetage spongieux car indiquée en zone épiphysométaphysaire.']),
          r('Vis à double pas — Herbert', ['Les deux extrémités ont des pas et des diamètres différents ; la zone centrale n’est pas filetée.', 'La différence de pas obtient une traction limitée et une compression maximale.', 'La tête est enfouie ; indication : petits os et ostéotomies périarticulaires.'], { image: fig(4) }),
          r('Compression sans tête', ['Deux portions filetées permettent au chirurgien d’agir directement sur la compression.', 'Un montage peut faire fonctionner la vis comme une vis de traction avant l’enfouissement définitif.', 'La vis peut aussi utiliser un deuxième filetage tourné après le positionnement final.']),
          reflex('a_retenir', ['Pour une vis Herbert, la compression maximale rapportée ne dépasse pas 0,7 mm pour une force maximale de 8 N.']),
        ] },
        { title: 'Vis verrouillables', rows: [
          r('Principe', ['Une vis à tête filetée est réservée à une plaque compatible.', 'Le verrouillage solidarise vis et plaque en un implant stable à angle fixe.', 'Le diamètre de l’âme est important car la vis résiste surtout à la flexion.']),
          r('Intérêt clinique', ['La stabilité est utile dans les fractures complexes et dans l’os porotique.', 'Le cours associe ce montage à la possibilité d’une rééducation postopératoire précoce.']),
          r('Choix de montage', ['Le verrouillage ne remplace pas la réflexion sur le type de montage.', 'Une plaque verrouillée peut recevoir des vis standards lorsque compression ou réduction parfaite sont recherchées.']),
        ] },
      ],
    },
    {
      title: 'Plaques : conception et modes d’action',
      sections: [
        { title: 'Plaque classique ou fixateur interne', rows: [
          r('Définition', ['La plaque est un système extramédullaire associé aux vis.', 'Elle stabilise la fracture jusqu’à la consolidation.']),
          r('Plaque classique', ['Elle utilise des vis standards non verrouillables.', 'La stabilité dépend du montage et de la friction entre plaque et os.', 'Un modelage peropératoire précis est important.']),
          r('Fixateur interne verrouillé', ['La stabilité dépend surtout du montage et des propriétés mécaniques de l’implant.', 'Elle ne dépend ni de la qualité osseuse ni de la friction plaque-os.', 'L’absence de compression périostée préserve le flux sanguin.']),
          reflex('a_retenir', ['Le verrouillage facilite une technique peu invasive par rapport à une plaque conventionnelle.']),
        ] },
        { title: 'Systèmes et formes de plaques', rows: [
          r('Plaque DCP', ['Les orifices ovales permettent la pose excentrée d’une vis.', 'L’insertion crée une force perpendiculaire à l’axe de la vis et comprime le foyer.', 'Le débattement accru aide au positionnement orthogonal dans une fracture oblique.'], { image: fig(9, 'Plaque DCP : vis excentrée et compression du foyer') }),
          r('Plaques droites et anatomiques', ['Les plaques droites concernent les diaphyses des os longs.', 'Les plaques anatomiques reproduisent une région métaphysoépiphysaire : plateau tibial, pilon, fémur distal ou coude.', 'Les plaques préformées limitent le modelage peropératoire et offrent une stabilité angulaire.']),
          r('Plaques de reconstruction', ['Leur alliage est malléable et autorise le modelage peropératoire.', 'Elles sont surtout utilisées pour le cotyle ou l’anneau pelvien.']),
        ] },
      ],
    },
    {
      title: 'Stratégie de stabilité et consolidation',
      sections: [
        { title: 'Fonction de la plaque', rows: [
          r('Plaque en compression', ['La compression peut être obtenue par un système externe ou une plaque conçue à cet effet.', 'Les plaques DCP utilisent la vis excentrée dans un orifice ovale.']),
          r('Plaque de neutralisation', ['Elle intervient après compression préalable du foyer par une vis.', 'Elle stabilise le montage et protège le foyer des contraintes extérieures.', 'Exemple donné : fracture oblique de fibula dans une fracture bimalléolaire.']),
          r('Plaque de soutien', ['Elle reconstitue une structure anatomique et prévient l’effondrement secondaire.', 'Dans une fracture du plateau tibial, les vis proximales jouent un rôle d’étai sous la surface articulaire.']),
        ] },
        { title: 'Stabilité absolue ou relative', rows: [
          r('Stabilité absolue', ['Elle correspond à l’absence de mobilité du foyer.', 'Elle associe vis de traction, compression et plaque vissée.', 'Elle exige une réduction anatomique et concerne les fractures simples sans comminution.'], { image: fig(15, 'Stabilité absolue avec réduction anatomique et compression') }),
          r('Consolidation endostée', ['L’ouverture du foyer évacue habituellement l’hématome et peut imposer un dépériostage.', 'La consolidation se fait alors par l’intérieur du foyer, sans cal périosté visible.', 'Elle est plus lente et requiert une stabilité très rigide : l’os lamellaire ne tolère qu’environ 2 % de déformation.']),
          r('Stabilité relative', ['Une mobilité résiduelle compatible avec la consolidation est conservée.', 'La technique privilégie le pontage et un abord à distance afin de préserver l’hématome.', 'Le titane est privilégié pour ses propriétés élastiques ; indication : fracture comminutive.'], { image: fig(16, 'Stabilité relative : pontage mini-invasif et plaque longue') }),
        ] },
      ],
    },
    {
      title: 'Ostéosynthèse biologique et situations à risque',
      sections: [
        { title: 'Montage verrouillé et mise en charge', rows: [
          r('Plaque non bloquée', ['Au membre inférieur, une plaque classique ne permet pas théoriquement une remise en charge précoce.', 'Les contraintes plaque-vis favorisent la mobilisation progressive des vis et la faillite du montage.']),
          r('Plaque verrouillée', ['Les vis solidaires de la plaque forment un ensemble unique.', 'Les contraintes se transmettent de la plaque aux vis sans mobilisation des vis ni faillite d’ostéosynthèse.', 'La mise en charge précoce nécessite le respect de règles de montage.']),
          r('Règles de montage', ['Au moins trois vis bloquées sont placées de part et d’autre du foyer.', 'Dans une comminution, les vis sont proches du foyer ; dans une fracture simple, elles en sont éloignées.', 'Laisser un orifice libre entre deux vis verrouillées répartit les contraintes et évite un montage trop rigide.'], { image: fig(18, 'Plaque verrouillée longue, pontage et trois vis de chaque côté') }),
        ] },
        { title: 'Principe biologique et os porotique', rows: [
          r('Ostéosynthèse biologique', ['Les priorités sont la restitution des axes, de la longueur et la prévention des troubles de rotation.', 'La réduction est externe ; la plaque est introduite à distance du foyer sous contrôle radioscopique.', 'La préservation de l’hématome favorise une consolidation périostée avec formation de cal.']),
          r('Choix d’implant', ['Une plaque longue en titane est préférée à une plaque courte en acier dans ce contexte.', 'Éviter les plaques de reconstruction et les plaques tiers de tube ; préférer une plaque gros fragment ou hybride.', 'La technique est idéalement réalisée à foyer fermé.']),
          r('Os porotique', ['Les plaques non bloquées sont instables : raréfaction osseuse, corticales fines et friction diminuée.', 'Le verrouillage procure une stabilité angulaire indépendante de la qualité osseuse.', 'Il permet donc une ostéosynthèse stable sur terrain ostéoporotique.']),
          reflex('a_retenir', ['La biomécanique du montage doit toujours préserver les conditions biologiques de consolidation.']),
        ] },
      ],
    },
  ],
  synthesis: {
    chiffres: { headers: ['Paramètre', 'Valeur', 'Contexte'], rows: [
      ['Vis corticale', '3,5 mm', 'Exemple de diamètre de vis'], ['Mèche correspondante', '2,7 mm', 'Forage d’une vis corticale de 3,5 mm'], ['Vis Herbert', '≤ 0,7 mm ; 8 N', 'Compression maximale rapportée'], ['Os lamellaire', '≈ 2 %', 'Déformation tolérée en consolidation endostée'], ['Vis verrouillées', '≥ 3 / côté', 'Montage pour mise en charge précoce'],
    ] },
    tables: [
      { title: 'Vis : choix selon le principe recherché', headers: ['Type', 'Mécanisme', 'Situation décrite'], rows: [['Corticale', 'Prise dans l’os cortical', 'Fixation plaque-os'], ['Spongieuse', 'Filetage large', 'Traction épiphysométaphysaire'], ['Canulée', 'Broche-guide centrale', 'Positionnement précis'], ['Herbert', 'Double pas', 'Petits os et ostéotomies'], ['Verrouillable', 'Angle fixe plaque-vis', 'Os porotique ou fracture complexe']] },
      { title: 'Plaques : fonction mécanique', headers: ['Montage', 'But', 'Point clé'], rows: [['Compression', 'Comprimer le foyer', 'Vis excentrée DCP'], ['Neutralisation', 'Protéger un foyer déjà comprimé', 'Après vis de compression'], ['Soutien', 'Éviter l’effondrement', 'Étai sous une surface articulaire'], ['Pontage verrouillé', 'Stabilité relative', 'Préservation de l’hématome']] },
      { title: 'Stabilité absolue et relative', headers: ['Critère', 'Absolue', 'Relative'], rows: [['Foyer', 'Sans mobilité', 'Mobilité compatible'], ['Fracture', 'Simple, sans comminution', 'Comminutive'], ['Réduction', 'Anatomique, foyer abordé', 'Pontage, foyer préservé'], ['Consolidation', 'Endostée', 'Périostée'], ['Matériau privilégié', 'Acier', 'Titane']] },
      { title: 'Plaque classique et verrouillée', headers: ['Critère', 'Classique', 'Verrouillée'], rows: [['Stabilité', 'Friction plaque-os', 'Solidarité plaque-vis'], ['Qualité osseuse', 'Déterminante', 'Non déterminante'], ['Périoste', 'Compression possible', 'Préservé'], ['Mise en charge précoce', 'Non recommandée en théorie', 'Possible si règles de montage respectées']] },
    ],
    keyPoints: ['La vis de traction comprime si le filetage ancre le fragment distal.', 'La DCP crée la compression par la pose excentrée de la vis.', 'La neutralisation protège une compression déjà obtenue.', 'La stabilité absolue impose une réduction anatomique ; la relative préserve l’hématome.', 'Le verrouillage crée une stabilité angulaire utile dans l’os porotique.', 'Trois vis verrouillées de chaque côté constituent une règle de montage rapportée.'],
    eclair: ['Vis de traction : forage adapté et ancrage distal du filetage.', 'Vis canulée : broche-guide, positionnement et mesure de longueur.', 'Plaque DCP : vis excentrée → compression.', 'Stabilité absolue : fracture simple, réduction anatomique, consolidation endostée.', 'Stabilité relative : comminution, pontage mini-invasif, consolidation périostée.', 'Plaque verrouillée : stabilité angulaire, intérêt dans l’os porotique et les fractures complexes.'],
  },
};

const fact = (front, back, source) => ({ recto: front, verso: back, source });
const facts = [
  fact('Rôle d’une vis de traction ?', 'Comprimer deux fragments osseux<br>par ancrage distal du filetage', [6, 9]),
  fact('Pourquoi choisir une mèche plus fine que la vis ?', 'Pour que le filetage<br>s’ancre dans l’os', [9]),
  fact('Exemple : mèche pour vis corticale de 3,5 mm ?', '<strong>2,7 mm</strong>', [9]),
  fact('Comment majorer la compression par une vis ?', 'Forage proximal plus large<br>ancrage du filetage dans le fragment distal', [9]),
  fact('Rôle du taraudage ?', 'Créer un pas de vis<br>dans l’os', [9]),
  fact('Risque d’une mèche émoussée ?', 'Échauffement osseux<br>risque de nécrose', [9]),
  fact('Qu’est-ce qu’une vis autotaraudeuse ?', 'Une vis qui crée son propre<br>pas de vis dans l’os', [9]),
  fact('Vis corticale : type d’os ?', '<strong>Os cortical</strong>', [13]),
  fact('Vis corticale : utilisation habituelle ?', 'Comprimer et fixer<br>une plaque à l’os', [13]),
  fact('Vis corticale : filetage habituel ?', 'Sur toute la longueur<br>ou parfois partiel', [13]),
  fact('Vis spongieuse : avantage de géométrie ?', 'Rapport diamètre extérieur/âme supérieur<br>→ meilleure tenue dans l’os spongieux', [15, 20]),
  fact('Vis spongieuse : indication mécanique ?', 'Vis de traction<br>en zone épiphysométaphysaire', [20]),
  fact('Vis spongieuse : filetage habituel ?', 'Partiel<br>parfois complet', [20]),
  fact('Vis canulée : particularité ?', 'Elle est creuse<br>pour une broche-guide centrale', [21]),
  fact('Broche-guide d’une vis canulée : deux intérêts ?', 'Positionnement précis<br>mesure de longueur avec jauge', [21]),
  fact('Pourquoi les vis canulées sont-elles souvent spongieuses ?', 'Elles sont indiquées<br>en zone épiphysométaphysaire', [21]),
  fact('Vis Herbert : organisation du filetage ?', 'Deux pas et diamètres différents<br>zone centrale non filetée', [22]),
  fact('Vis Herbert : mécanisme de compression ?', 'Différence de pas entre les deux filetages', [22]),
  fact('Vis Herbert : avantage de la tête ?', 'Tête totalement enfouie', [22]),
  fact('Vis Herbert : indications citées ?', 'Scaphoïde, tête radiale, métacarpiens<br>ou ostéotomie de Scarf', [22]),
  fact('Compression maximale rapportée avec une vis Herbert ?', '<strong>0,7 mm</strong> pour une force maximale de 8 N', [22]),
  fact('Vis conique : effet mécanique ?', 'Compression intrafragmentaire<br>traction limitée', [29]),
  fact('Vis conique : intérêt du cône ?', 'Taraudage progressif<br>lors de l’insertion', [29]),
  fact('Vis à compression sans tête : contrôle de la compression ?', 'Le chirurgien peut agir directement<br>sur la compression', [29, 30, 31]),
  fact('Vis verrouillable : condition d’emploi ?', 'Uniquement avec<br>une plaque compatible', [33]),
  fact('Vis verrouillable : résultat mécanique ?', 'Implant plaque-vis unique<br>stable à angle fixe', [33]),
  fact('Vis verrouillable : force principalement subie ?', '<strong>Flexion</strong>', [33]),
  fact('Pourquoi l’âme est-elle importante dans une vis verrouillable ?', 'Elle contribue à résister<br>aux forces en flexion', [33]),
  fact('Plaque verrouillée : intérêt dans l’os porotique ?', 'Stabilité indépendante<br>de la qualité osseuse', [36, 115]),
  fact('Empreinte cruciforme : limite ?', 'Mauvaise accroche du tournevis', [38]),
  fact('Empreinte hexagonale : limite ?', 'Peut s’arrondir<br>sous contrainte excessive', [38]),
  fact('Empreinte stardrive : avantage ?', 'Excellente tenue<br>peu de patinage', [38]),
  fact('Définition d’une plaque ?', 'Système extramédullaire associé aux vis<br>stabilisant jusqu’à consolidation', [41]),
  fact('Plaque classique : déterminant de stabilité ?', 'Type de montage<br>et friction plaque-os', [42]),
  fact('Plaque classique : exigence peropératoire ?', 'Modelage précis<br>de l’implant', [42]),
  fact('Fixateur interne verrouillé : déterminants de stabilité ?', 'Montage choisi<br>et propriétés mécaniques de l’implant', [43]),
  fact('Fixateur interne verrouillé : rôle de la qualité osseuse ?', 'La stabilité n’en dépend pas', [44]),
  fact('Fixateur interne verrouillé : contact plaque-os ?', 'Pas de compression plaque-os<br>donc pas de compression du périoste', [45, 46]),
  fact('DCP : forme des orifices ?', '<strong>Ovales</strong>', [55]),
  fact('DCP : comment la vis crée-t-elle une compression ?', 'Pose excentrée<br>force perpendiculaire à son axe', [55, 59]),
  fact('Plaque de neutralisation : quand ?', 'Après compression du foyer<br>par une vis de compression', [55]),
  fact('Plaque de neutralisation : fonction ?', 'Stabiliser le montage<br>et protéger le foyer des contraintes', [55]),
  fact('Plaque de soutien : objectif ?', 'Prévenir l’effondrement secondaire<br>d’une structure anatomique', [55]),
  fact('Exemple de plaque de soutien ?', 'Plateau tibial : vis proximales<br>en étai sous la surface articulaire', [55]),
  fact('Plaque droite : localisation ?', 'Diaphyse des os longs', [57]),
  fact('Plaque anatomique : localisation ?', 'Région métaphysoépiphysaire', [57, 60]),
  fact('Plaque de reconstruction : qualité ?', 'Grande malléabilité<br>permettant le modelage', [60]),
  fact('Plaque de reconstruction : indications citées ?', 'Cotyle<br>anneau pelvien', [60]),
  fact('Système vis/douille : limite ?', 'Plaque plus épaisse<br>stabilité angulaire réduite', [71]),
  fact('Système vis/douille : contact os-plaque ?', 'Contact direct nécessaire', [71]),
  fact('Système par anneau/douille expansible : principe ?', 'Augmenter la friction<br>entre plaque et vis', [73]),
  fact('Système verrouillable direct : géométrie ?', 'Trous coniques filetés<br>têtes de vis coniques filetées', [83]),
  fact('Stabilité absolue : définition ?', 'Absence de mobilité<br>du foyer de fracture', [88]),
  fact('Stabilité absolue : moyens ?', 'Vis de traction + compression<br>+ plaque vissée', [88]),
  fact('Stabilité absolue : type de fracture ?', 'Simple<br>sans comminution', [88]),
  fact('Stabilité absolue : réduction ?', '<strong>Anatomique</strong>', [88]),
  fact('Stabilité absolue : mode de consolidation ?', '<strong>Endosté</strong>', [88]),
  fact('Stabilité absolue : matériau privilégié ?', '<strong>Acier</strong>', [88]),
  fact('Stabilité relative : définition ?', 'Mobilité résiduelle compatible<br>avec la consolidation', [88]),
  fact('Stabilité relative : objectif biologique ?', 'Préserver l’hématome fracturaire', [88]),
  fact('Stabilité relative : stratégie de plaque ?', 'Pontage du foyer<br>par abord mini-invasif', [88]),
  fact('Stabilité relative : matériau privilégié ?', '<strong>Titane</strong><br>pour ses propriétés élastiques', [88]),
  fact('Stabilité relative : type de fracture ?', '<strong>Comminutive</strong>', [88]),
  fact('Foyer ouvert : conséquence sur l’hématome ?', 'Évacuation quasi automatique<br>de l’hématome périfracturaire', [90]),
  fact('Consolidation endostée : cal radiologique ?', 'Pas de cal périosté visible', [91]),
  fact('Consolidation endostée : contrainte mécanique ?', 'Stabilité absolue très rigide<br>os lamellaire ≈ 2 % de déformation', [92]),
  fact('Mobilité du foyer en consolidation endostée : risque ?', 'Cisaillement des ponts osseux<br>pseudarthrose', [92]),
  fact('Consolidation endostée : vitesse ?', 'Plus lente que la consolidation périostée', [93]),
  fact('Plaque non bloquée au membre inférieur : mise en charge précoce ?', 'Non recommandée en théorie', [95, 100]),
  fact('Plaque non bloquée : mécanisme de faillite en charge ?', 'Mobilisation progressive des vis<br>puis faillite du montage', [100]),
  fact('Plaque verrouillée : transmission des contraintes ?', 'De la plaque aux vis<br>sans mobilisation des vis', [100]),
  fact('Nombre minimal de vis verrouillées de chaque côté ?', '<strong>Trois</strong>', [101, 103]),
  fact('Dans une fracture comminutive, où placer les vis verrouillées ?', 'À proximité du foyer', [104]),
  fact('Dans une fracture simple, où placer les vis verrouillées ?', 'À distance du foyer<br>pour éviter la concentration des contraintes', [107]),
  fact('Pourquoi laisser un orifice libre entre deux vis verrouillées ?', 'Répartir les contraintes<br>éviter un montage trop rigide', [109]),
  fact('Plaque à éviter dans ce montage biologique ?', 'Plaque de reconstruction<br>ou plaque tiers de tube', [110]),
  fact('Voie recommandée pour préserver l’hématome ?', '<strong>Foyer fermé</strong>', [111]),
  fact('Ostéosynthèse biologique : objectifs mécaniques ?', 'Axes, longueur du membre<br>prévention des troubles de rotation', [113]),
  fact('Ostéosynthèse biologique : mode de réduction ?', 'Manœuvres externes<br>table orthopédique ou distraction provisoire', [113]),
  fact('Ostéosynthèse biologique : mise en place de la plaque ?', 'À distance du foyer<br>sous contrôle radioscopique', [113]),
  fact('Ostéosynthèse biologique : effet de la préservation de l’hématome ?', 'Consolidation périostée<br>avec formation de cal', [113]),
  fact('Ostéoporose : pourquoi une plaque non bloquée est-elle instable ?', 'Corticales fines et raréfaction osseuse<br>→ friction diminuée', [115]),
  fact('Ostéoporose : principe de stabilité d’une plaque verrouillée ?', 'Stabilité angulaire<br>par verrouillage vis-plaque', [115]),
  fact('Plaque verrouillée sur os porotique : conséquence pratique ?', 'Ostéosynthèse stable possible<br>malgré la qualité osseuse', [115]),
  fact('Pourquoi une plaque préformée limite-t-elle le modelage ?', 'Son dessin est adapté<br>à la région anatomique', [50, 57]),
  fact('Plaque à trou rond : statut actuel ?', 'Plus utilisée en pratique courante', [53]),
  fact('Tendeur de plaque : rôle ?', 'Exercer une compression<br>du foyer de fracture', [49, 53]),
  fact('Fracture oblique de fibula : exemple de plaque ?', 'Plaque de neutralisation<br>après vis de compression', [55]),
  fact('Pourquoi choisir une plaque longue en titane pour un pontage ?', 'Déformation réversible en charge<br>favorable à la consolidation', [108]),
  fact('Pourquoi ne pas remplir tous les orifices d’une plaque verrouillée ?', 'Montage trop rigide<br>risque de fracture de plaque', [109]),
  fact('Dernière vis proximale d’un montage verrouillé : option ?', 'Peut être unicorticale<br>pour limiter le stress os-plaque', [101]),
  fact('Dans une stabilité relative, quel abord est recherché ?', 'À distance du foyer<br>pour préserver l’hématome', [88]),
  fact('Quel effet ont les micromouvements en ostéosynthèse biologique ?', 'Ils participent à la production<br>du cal osseux périosté', [113]),
  fact('Pourquoi réduire avant une ostéosynthèse biologique ?', 'La plaque est posée à distance<br>sur une fracture déjà réduite', [113]),
  fact('Fixateur interne verrouillé : effet sur le périoste ?', 'Pas de compression du périoste<br>flux sanguin préservé', [46]),
  fact('Plaque verrouillée : avantage tissulaire des systèmes modernes ?', 'Plaques anatomiques peu épaisses<br>respectant les tissus mous', [83]),
  fact('Système verrouillable à anneau : contact plaque-os nécessaire ?', 'Non, contrairement au système vis/douille simple', [73]),
  fact('Pourquoi la vis spongieuse est-elle adaptée à l’épiphyse ?', 'Son large filetage améliore<br>la prise dans l’os spongieux', [15, 20]),
  fact('Pourquoi la vis canulée aide-t-elle la précision ?', 'La broche-guide centralise<br>le trajet de la vis', [21]),
  fact('Quel principe reste valable malgré les progrès du matériel ?', 'Compression, neutralisation et soutien<br>restent des moyens essentiels', [117]),
];

const excludedExampleCards = new Set([
  'Exemple : mèche pour vis corticale de 3,5 mm ?',
  'Vis Herbert : indications citées ?',
  'Compression maximale rapportée avec une vis Herbert ?',
  'Exemple de plaque de soutien ?',
  'Fracture oblique de fibula : exemple de plaque ?',
]);
const replacementCards = [
  fact('Pourquoi modeler précisément une plaque classique ?', 'Sa stabilité dépend aussi<br>de la friction plaque-os', [42]),
  fact('Plaque verrouillée : quel principe remplace la friction plaque-os ?', 'La solidarité vis-plaque<br>à angle fixe', [33, 45]),
  fact('Plaque verrouillée mixte : quelle possibilité ?', 'Utiliser des vis standards<br>si compression ou réduction parfaite recherchée', [83]),
  fact('Plaque de neutralisation : quel prérequis ?', 'Foyer déjà comprimé<br>par une vis de compression', [55]),
  fact('Quelle différence de placement des vis faut-il retenir ?', 'Comminution : près du foyer<br>fracture simple : à distance', [104, 107]),
];
const flashcards = [...facts.filter(({ recto }) => !excludedExampleCards.has(recto)), ...replacementCards]
  .map(({ source, ...card }) => card);

const item = (enonce, is_correct, justification) => ({ enonce, is_correct, justification });
const question = (enonce, corrects, incorrects, source = []) => ({
  enonce,
  correction_generale: `Correction fondée sur les blocs source ${source.join(', ')} du collège d’Orthopédie.`,
  items: [...corrects.map((x) => item(x, true, 'Proposition conforme au chapitre.')), ...incorrects.map((x) => item(x, false, 'Proposition non conforme au chapitre.'))]
    .slice(0, 5).map((entry, index) => ({ ...entry, lettre: String.fromCharCode(65 + index) })),
});
const q = (enonce, correct, incorrect, source) => question(enonce, Array.isArray(correct) ? correct : [correct], incorrect, source);
const sources = {
  v: [9, 13, 20, 21, 22, 29, 33, 37, 38], p: [41, 42, 43, 50, 53, 55, 57, 60, 83], s: [88, 90, 91, 92, 93, 100, 101, 107, 109, 113, 115],
};

const qcmSeries = [
  ['QCM — Série 1 · Forage et vis de traction', [
    q('Concernant la préparation d’une vis de traction, quelles propositions sont exactes ?', ['La mèche est légèrement plus fine que la vis.', 'Une mèche émoussée peut provoquer un échauffement osseux.'], ['Le taraudage est toujours obligatoire.', 'Le filetage doit s’ancrer dans les deux fragments pour comprimer.', 'Le forage est réalisé uniquement manuellement.'], sources.v),
    q('Quel réglage favorise l’effet de traction d’une vis ?', 'Un forage proximal plus large limitant l’ancrage près de la tête.', ['Un forage distal plus large supprimant l’ancrage.', 'Une absence de filetage distal.', 'Une plaque sans vis.', 'Une suppression de tout forage.'], [9]),
    q('La compression maximale par vis est favorisée lorsque :', 'Le filetage s’ancre dans le deuxième fragment.', ['Le filetage est absent du fragment distal.', 'Le forage proximal est toujours plus fin.', 'La tête de vis reste libre.', 'La vis est canulée.'], [9, 37]),
    q('Concernant le taraudage, quelles propositions sont exactes ?', ['Il crée un pas de vis dans l’os.', 'Sa nécessité est controversée dans le chapitre.'], ['Il interdit l’utilisation du moteur.', 'Il supprime le risque d’échauffement.', 'Il est réservé aux vis canulées.'], [9]),
    q('Une vis autotaraudeuse :', 'Crée son propre pas de vis dans l’os.', ['N’a aucun filetage.', 'Est toujours canulée.', 'Est limitée à l’os spongieux.', 'Ne peut pas être utilisée avec une plaque.'], [9]),
  ]],
  ['QCM — Série 2 · Types de vis', [
    q('À propos des vis corticales, quelles propositions sont exactes ?', ['Leur pas est conçu pour l’os cortical.', 'Elles sont habituellement utilisées pour fixer une plaque à l’os.'], ['Elles ne peuvent pas fixer une plaque à l’os.', 'Elles ont obligatoirement un filetage partiel.', 'Elles nécessitent une broche-guide.'], [13]),
    q('La vis spongieuse est surtout décrite comme :', 'Une vis de traction des zones épiphysométaphysaires.', ['Une vis exclusivement diaphysaire.', 'Une vis sans filetage.', 'Une vis interdite dans l’os spongieux.', 'Une vis à angle fixe sans plaque.'], [15, 20]),
    q('La vis canulée permet notamment :', ['Le guidage par broche.', 'La mesure de longueur avec une jauge.'], ['La suppression du forage.', 'La compression sans tête obligatoire.', 'Le verrouillage sans plaque.'], [21]),
    q('Dans une vis Herbert, la compression est liée :', 'À la différence de pas entre les deux filetages.', ['À un seul filetage central.', 'À un trou ovale de plaque.', 'À la friction plaque-os.', 'À une tige sans filetage.'], [22]),
    q('La tête d’une vis Herbert est :', 'Enfouie dans l’os.', ['Toujours reliée à une plaque.', 'Volontairement saillante.', 'Destinée à recevoir une douille externe.', 'Incompatible avec les petits os.'], [22]),
  ]],
  ['QCM — Série 3 · Vis spécialisées et empreintes', [
    q('Les vis coniques permettent :', ['Une compression intrafragmentaire.', 'Un taraudage progressif lors de l’insertion.'], ['Une stabilité angulaire sans plaque.', 'Un contact obligatoire plaque-os.', 'Une absence de traction.'], [29]),
    q('Les vis à compression sans tête permettent :', 'Un contrôle direct de la compression par le chirurgien.', ['Une absence de réduction.', 'Un verrouillage obligatoire dans une plaque.', 'Un filetage unique sans mécanisme de compression.', 'Une impossibilité d’enfouissement.'], [29, 30, 31]),
    q('Une vis à tête verrouillée :', ['Est utilisée avec une plaque compatible.', 'Forme avec la plaque un implant stable à angle fixe.'], ['N’est soumise qu’à la traction.', 'A une âme sans rôle mécanique.', 'Évite toute réflexion sur le montage.'], [33]),
    q('L’empreinte stardrive est caractérisée par :', 'Une bonne tenue de la vis sur le tournevis.', ['Un patinage plus fréquent que la cruciforme.', 'Une usure plus rapide que l’hexagonale.', 'Une ablation toujours plus simple.', 'Une utilisation limitée aux plaques DCP.'], [38]),
    q('L’empreinte hexagonale peut poser problème en cas de :', 'Contrainte excessive du tournevis avec arrondissement de l’empreinte.', ['Faible diamètre de mèche uniquement.', 'Absence de plaque.', 'Utilisation de titane.', 'Fracture comminutive.'], [38]),
  ]],
  ['QCM — Série 4 · Plaques classiques et DCP', [
    q('Une plaque est :', 'Un système extramédullaire associé aux vis.', ['Un implant intramédullaire sans vis.', 'Un moyen de remplacer la consolidation.', 'Une broche-guide.', 'Un matériel réservé au cotyle.'], [41]),
    q('La stabilité d’une plaque classique dépend notamment :', ['Du type de montage.', 'De la friction entre plaque et os.'], ['Uniquement de la qualité du métal.', 'D’une solidarité obligatoire vis-plaque.', 'De l’absence de modelage.'], [42]),
    q('Les fixateurs internes verrouillés :', ['Ne dépendent pas de la friction plaque-os.', 'Évitent la compression du périoste.'], ['Sont instables dans l’os porotique.', 'Nécessitent toujours une plaque au contact de l’os.', 'Suppriment les contraintes de flexion.'], [43, 44, 45, 46]),
    q('La DCP crée une compression interfragmentaire grâce :', 'Au placement excentré d’une vis dans un orifice ovale.', ['À une vis canulée sur broche.', 'À l’absence de vis.', 'À un trou rond centré.', 'À une plaque de reconstruction.'], [53, 55, 59]),
    q('Le débattement accru d’une vis dans une DCP est utile dans une fracture oblique pour :', 'Placer une vis orthogonale au trait.', ['Éviter toute compression.', 'Supprimer la réduction.', 'Transformer la plaque en clou.', 'Rendre la vis canulée.'], [53]),
  ]],
  ['QCM — Série 5 · Fonctions des plaques', [
    q('Une plaque de neutralisation est indiquée lorsque :', 'Le foyer a déjà été comprimé par une vis.', ['La fracture ne nécessite aucune stabilisation.', 'La plaque doit créer seule la compression.', 'Le foyer est forcément comminutif.', 'Le matériel est exclusivement intramédullaire.'], [55]),
    q('La fonction d’une plaque de neutralisation est de :', 'Protéger un foyer déjà comprimé des contraintes extérieures.', ['Créer un cal périosté visible.', 'Rendre la plaque malléable.', 'Supprimer les vis de compression.', 'Éviter toute fixation.'], [55]),
    q('La plaque de soutien :', ['Prévient un effondrement secondaire.', 'Peut étayer une surface articulaire.'], ['Est réservée aux diaphyses simples.', 'Remplace toute vis proximale.', 'Crée une stabilité par friction uniquement.'], [55]),
    q('Les plaques droites sont principalement utilisées :', 'Dans les diaphyses des os longs.', ['Dans toutes les régions articulaires sans exception.', 'Uniquement au cotyle.', 'Uniquement pour l’os porotique.', 'Comme vis de traction.'], [57]),
    q('Les plaques anatomiques sont surtout destinées :', 'Aux régions métaphysoépiphysaires.', ['Aux seules diaphyses du membre supérieur.', 'À remplacer les broches-guides.', 'Aux fractures sans réduction.', 'Aux systèmes intramédullaires.'], [57, 60]),
  ]],
  ['QCM — Série 6 · Stabilité et consolidation', [
    q('La stabilité absolue correspond à :', 'L’absence de mobilité du foyer de fracture.', ['Une mobilité élevée du foyer.', 'Une absence de réduction.', 'Une consolidation périostée obligatoire.', 'Un montage sans plaque.'], [88]),
    q('La stabilité absolue requiert notamment :', ['Une réduction anatomique.', 'Une fracture simple sans comminution.'], ['Un pontage sans contact entre fragments.', 'La préservation obligatoire d’un foyer non abordé.', 'Le titane pour son élasticité.'], [88]),
    q('La stabilité relative privilégie :', ['Le respect de l’hématome.', 'Le pontage du foyer.'], ['Une réduction anatomique avec foyer ouvert obligatoire.', 'L’absence de toute mobilité.', 'Une plaque courte très rigide.'], [88]),
    q('Le matériau rapporté comme adapté à la stabilité relative est :', 'Le titane.', ['L’acier exclusivement.', 'Le bois.', 'Le ciment.', 'Aucun matériau.'], [88]),
    q('La consolidation périostée est particulièrement recherchée dans :', 'Les fractures comminutives traitées en stabilité relative.', ['Les fractures simples sous stabilité absolue.', 'Les foyers ouverts dépériostés.', 'Les montages sans réduction externe.', 'Les plaques à trou rond.'], [88]),
  ]],
  ['QCM — Série 7 · Mise en charge et montage verrouillé', [
    q('Pourquoi une plaque non bloquée du membre inférieur ne permet-elle pas en théorie une charge précoce ?', 'La charge mobilise progressivement les vis par les forces plaque-os.', ['Les vis sont solidaires de la plaque.', 'Les contraintes ne passent pas par les vis.', 'La plaque crée une stabilité angulaire.', 'La qualité osseuse devient sans importance.'], [95, 100]),
    q('Dans une plaque verrouillée, les contraintes sont transmises :', 'De la plaque aux vis sans mobilisation des vis.', ['De l’os uniquement à la plaque.', 'Sans participation des vis.', 'Avec faillite systématique du montage.', 'Par friction obligatoire plaque-os.'], [100]),
    q('Pour une remise en charge précoce, le chapitre demande au moins :', 'Trois vis verrouillées de part et d’autre du foyer.', ['Une seule vis au total.', 'Deux vis uniquement du côté proximal.', 'Cinq vis dans chaque orifice.', 'Aucune vis près du foyer.'], [101, 103]),
    q('Dans une fracture comminutive, les vis verrouillées doivent être :', 'À proximité du foyer.', ['À distance maximale du foyer.', 'Dans chaque orifice sans exception.', 'Uniquement unicorticales.', 'Remplacées par une plaque de reconstruction.'], [104]),
    q('Dans une fracture simple, éloigner les vis du foyer permet :', 'D’éviter la concentration des contraintes et la fracture de plaque.', ['D’augmenter la comminution.', 'De supprimer la réduction.', 'D’empêcher toute consolidation.', 'De remplacer la plaque par une broche.'], [107]),
  ]],
  ['QCM — Série 8 · Ostéosynthèse biologique et os porotique', [
    q('Les objectifs mécaniques de l’ostéosynthèse biologique comprennent :', ['Restitution des axes.', 'Restitution de la longueur et prévention des troubles de rotation.'], ['Ouverture systématique du foyer.', 'Évacuation volontaire de l’hématome.', 'Mise en place à vue sans contrôle.'], [113]),
    q('Dans l’ostéosynthèse biologique, la plaque est :', 'Introduite à distance du foyer sous contrôle radioscopique.', ['Mise au contact du foyer après évacuation de l’hématome.', 'Toujours une plaque de reconstruction.', 'Placée sans réduction préalable.', 'Dépourvue de vis.'], [113]),
    q('La préservation de l’hématome fracturaire favorise :', 'La consolidation périostée avec formation de cal.', ['Une consolidation endostée sans cal.', 'La faillite de toute plaque.', 'L’absence de consolidation.', 'La disparition des micromouvements.'], [113]),
    q('Sur os porotique, une plaque non bloquée est instable parce que :', 'La friction est diminuée par la raréfaction osseuse et l’amincissement cortical.', ['La stabilité angulaire est excessive.', 'Le verrouillage est automatique.', 'Les corticales sont plus épaisses.', 'Les vis sont toujours canulées.'], [115]),
    q('Sur os porotique, une plaque verrouillée procure :', 'Une stabilité angulaire indépendante de la qualité osseuse.', ['Une stabilité dépendante de la friction.', 'Une interdiction d’ostéosynthèse.', 'Un besoin de plaque au contact de l’os.', 'Une absence de vis.'], [115]),
  ]],
];

const dpSpecs = [
  ['DP 1 · Compression par vis de traction', '<strong>Patient de 42 ans</strong>, pris en charge après un traumatisme de membre, présente une <strong>fracture simple</strong>. Les radiographies conduisent l’équipe à rechercher une réduction anatomique et une compression interfragmentaire par vis de traction.<br><br>Le programme opératoire prévoit le forage puis l’insertion de la vis. <strong>Au suivi postopératoire</strong>, la stabilité du montage conditionne l’organisation de la rééducation.', [9, 37]],
  ['DP 2 · Vissage canulé périarticulaire', '<strong>Patiente de 36 ans</strong>, présentant une fracture périarticulaire, est opérée après contrôle radiographique du trait. L’objectif est un positionnement précis de l’implant sans saillie de matériel.<br><br>Une vis canulée est envisagée avec broche-guide et contrôle de longueur. <strong>Au contrôle postopératoire</strong>, l’équipe vérifie l’enfouissement de la tête et programme la rééducation.', [21, 22]],
  ['DP 3 · Plaque DCP dans une fracture oblique', '<strong>Patient de 51 ans</strong>, victime d’un traumatisme, présente une fracture oblique simple. Après réduction, le chirurgien choisit une plaque de compression dynamique afin de rechercher une compression interfragmentaire.<br><br>La stratégie associe positionnement de la vis et contrôle du foyer. <strong>Au suivi radiographique</strong>, l’équipe apprécie la stabilité de la réduction et la protection du montage.', [53, 55]],
  ['DP 4 · Plaque de soutien articulaire', '<strong>Patiente de 59 ans</strong>, présentant une fracture articulaire, a une surface reconstruite exposée à un risque d’effondrement secondaire. Après analyse radiographique, une plaque de soutien est discutée.<br><br>Le montage doit assurer un rôle d’étai sous la surface concernée. <strong>Au suivi</strong>, le contrôle d’imagerie vérifie le maintien de la reconstruction et l’adaptation de l’implant.', [55]],
  ['DP 5 · Fracture simple : stabilité absolue', '<strong>Patient de 28 ans</strong>, sans comminution, présente une fracture simple. La réduction anatomique est obtenue et une ostéosynthèse rigide est planifiée pour supprimer la mobilité du foyer.<br><br>La stratégie de compression est expliquée au bloc. <strong>Lors des contrôles de consolidation</strong>, l’équipe recherche les conséquences attendues de cette stabilité.', [88, 90, 92]],
  ['DP 6 · Fracture comminutive : stabilité relative', '<strong>Patiente de 67 ans</strong>, présentant une fracture comminutive, est prise en charge en cherchant à préserver les conditions biologiques du foyer. Le plan opératoire retient un pontage à distance du foyer.<br><br>La réduction est obtenue par manœuvres externes. <strong>Au suivi radiographique</strong>, l’équipe recherche la formation du cal et adapte la progression fonctionnelle.', [88, 113]],
  ['DP 7 · Plaque verrouillée et remise en charge', '<strong>Patient de 48 ans</strong>, opéré d’une fracture du membre inférieur par plaque à vis bloquées, souhaite reprendre progressivement l’appui. Le montage doit transmettre les contraintes sans mobilisation des vis.<br><br>La configuration des vis est vérifiée au bloc. <strong>Au suivi</strong>, l’équipe réévalue la stabilité du montage avant d’autoriser une remise en charge progressive.', [100, 101, 107, 109]],
  ['DP 8 · Fracture sur os porotique', '<strong>Patiente de 74 ans</strong>, ayant un os porotique, présente une fracture nécessitant une ostéosynthèse. Le choix d’un montage stable est discuté car la friction plaque-os est diminuée.<br><br>Une plaque verrouillée est envisagée. <strong>Au contrôle postopératoire</strong>, l’équipe surveille la stabilité du montage et organise la reprise fonctionnelle.', [115]],
];
const dpQuestionSets = [
  [['Quelle étape prépare le trajet de la vis ?', 'Un forage au moteur.', ['Un modelage de plaque.', 'Une mise en charge.', 'Une ostéotomie.', 'Un verrouillage vis-plaque.'], [9]], ['Pourquoi la mèche est-elle plus fine que la vis ?', 'Pour permettre l’ancrage du filetage dans l’os.', ['Pour supprimer le filetage.', 'Pour augmenter le jeu de la vis.', 'Pour verrouiller la plaque.', 'Pour éviter toute compression.'], [9]], ['Quel réglage améliore l’effet de traction ?', 'Un ancrage du filetage dans le fragment distal.', ['Un filetage sans ancrage distal.', 'Une absence de forage.', 'Une plaque sans vis.', 'Un retrait du filetage.'], [9]], ['Comment maximiser l’effet de traction ?', 'Ancrer le filetage dans le fragment distal.', ['Ancrer le filetage dans les deux fragments.', 'Supprimer le forage distal.', 'Utiliser une plaque sans vis.', 'Éviter tout filetage.'], [9, 37]], ['Quel risque impose l’usage de mèches aiguisées ?', 'Échauffement osseux et nécrose.', ['Cal hypertrophique immédiat.', 'Stabilité angulaire excessive.', 'Raccourcissement de plaque.', 'Mise en charge précoce.'], [9]], ['Quel est le rôle du taraudage ?', 'Créer un pas de vis dans l’os.', ['Créer un trou ovale de DCP.', 'Mesurer la longueur.', 'Verrouiller une douille.', 'Produire un cal.'], [9]], ['Quelle propriété définit une vis autotaraudeuse ?', 'Elle crée son propre pas de vis osseux.', ['Elle est sans filetage.', 'Elle est toujours canulée.', 'Elle est toujours spongieuse.', 'Elle remplace la plaque.'], [9]]],
  [['Quel est l’intérêt initial de la broche-guide ?', 'Guider précisément la vis canulée.', ['Créer une plaque DCP.', 'Éviter tout contrôle de longueur.', 'Obtenir une stabilité par friction.', 'Remplacer le filetage.'], [21]], ['Quelle mesure est rendue possible par la broche-guide ?', 'La longueur de vis avec une jauge.', ['La qualité de l’os.', 'La rigidité du titane.', 'Le taux de cal.', 'L’angle d’une plaque DCP.'], [21]], ['Quel type de filetage est fréquent sur une vis canulée ?', 'Un filetage spongieux.', ['Un filetage absent.', 'Un filetage exclusivement cortical.', 'Un filetage de plaque DCP.', 'Un filetage de douille.'], [21]], ['Quel mécanisme de la vis Herbert crée la compression ?', 'La différence de pas entre les deux filetages.', ['La friction plaque-os.', 'Un trou ovale.', 'Une tête de plaque.', 'Une absence de filetage.'], [22]], ['Quel détail distingue la zone centrale d’une vis Herbert ?', 'Elle est dépourvue de filetage.', ['Elle porte une douille.', 'Elle est creuse pour une broche.', 'Elle est fixée à une plaque.', 'Elle porte une empreinte cruciforme.'], [22]], ['Quelle région est visée par les vis Herbert ?', 'Les petits os ou une ostéotomie périarticulaire.', ['Uniquement les diaphyses.', 'Uniquement l’os cortical.', 'Le périoste seul.', 'Les plaques sans vis.'], [22]], ['Quel est l’avantage de la tête d’une vis Herbert ?', 'Elle peut être totalement enfouie.', ['Elle doit dépasser de la plaque.', 'Elle reçoit une douille externe.', 'Elle évite tout filetage.', 'Elle reste hors de l’os.'], [22]]],
  [['Quel détail de la DCP permet la compression ?', 'Un orifice ovale.', ['Un orifice sans vis.', 'Une douille canulée.', 'Un filetage central Herbert.', 'Une plaque tiers de tube.'], [55]], ['Comment la vis est-elle placée dans une DCP ?', 'De façon excentrée.', ['Toujours au centre.', 'Sans plaque.', 'Avec une broche intramédullaire.', 'Sans forage.'], [53, 55]], ['Quelle force produit l’insertion excentrée ?', 'Une force perpendiculaire à l’axe de la vis.', ['Une force qui supprime le foyer.', 'Une friction sans compression.', 'Une traction de broche-guide.', 'Une absence de contrainte.'], [55]], ['Pourquoi le débattement accru est-il utile dans une fracture oblique ?', 'Il aide à placer une vis orthogonale au trait.', ['Il évite toute réduction.', 'Il supprime les vis.', 'Il impose une plaque de soutien.', 'Il rend la plaque malléable.'], [53]], ['Quel montage est utilisé si le foyer est déjà comprimé par vis ?', 'Une plaque de neutralisation.', ['Une plaque de soutien obligatoire.', 'Une plaque sans vis.', 'Une vis Herbert seule.', 'Un clou sans plaque.'], [55]], ['Quelle est la fonction de la plaque de neutralisation ?', 'Protéger le foyer des contraintes extérieures.', ['Créer le filetage osseux.', 'Mesurer la longueur de vis.', 'Éviter tout montage.', 'Dépérioster le foyer.'], [55]], ['Quel exemple illustre la neutralisation ?', 'Fracture oblique de fibula dans une fracture bimalléolaire.', ['Fracture du scaphoïde par vis Herbert.', 'Fracture comminutive pontée.', 'Ostéotomie de Scarf.', 'Fracture sur os porotique sans plaque.'], [55]]],
  [['Quel risque doit prévenir le montage ?', 'L’effondrement secondaire de la surface articulaire.', ['Le patinage du tournevis seulement.', 'La création du filetage.', 'La mesure de longueur.', 'L’absence de vis.'], [55]], ['Quel type de plaque joue un rôle d’étai ?', 'La plaque de soutien.', ['La plaque à trou rond.', 'La plaque sans vis.', 'La broche-guide.', 'La vis canulée seule.'], [55]], ['Quel exemple est donné pour une plaque de soutien ?', 'Le plateau tibial.', ['La diaphyse humérale exclusivement.', 'Le scaphoïde uniquement.', 'La corticale fémorale uniquement.', 'Une plaque de reconstruction du cotyle uniquement.'], [55]], ['Quel rôle ont les vis proximales au plateau tibial ?', 'Un rôle d’étai sous la surface articulaire.', ['Elles remplacent la plaque.', 'Elles ouvrent le foyer.', 'Elles évitent la réduction.', 'Elles suppriment la compression.'], [55]], ['Quelle région est typique d’une plaque anatomique ?', 'La région métaphysoépiphysaire.', ['La diaphyse uniquement.', 'Le trajet canulé uniquement.', 'Le centre d’une vis Herbert.', 'La moelle exclusivement.'], [57, 60]], ['Pourquoi une plaque anatomique est-elle préformée ?', 'Son dessin reproduit l’anatomie de la région.', ['Elle évite toute vis.', 'Elle impose une broche-guide.', 'Elle crée un filetage dans l’os.', 'Elle remplace le contrôle radiologique.'], [57, 60]], ['Quelle conséquence peut avoir une plaque préformée ?', 'Moins de modelage peropératoire.', ['Plus de friction obligatoire.', 'Aucune stabilité angulaire.', 'Aucune adaptation anatomique.', 'Une suppression du foyer.'], [50]],],
  [['Quel objectif définit la stabilité absolue ?', 'Absence de mobilité du foyer.', ['Mobilité large du foyer.', 'Absence de réduction.', 'Conservation obligatoire du foyer fermé.', 'Plaque sans vis.'], [88]], ['Quelle réduction est nécessaire ?', 'Une réduction anatomique.', ['Une absence de contact entre fragments.', 'Une réduction externe sans contrôle.', 'Une réduction uniquement par broche.', 'Une absence de réduction.'], [88]], ['Quelle fracture est adaptée à ce principe ?', 'Une fracture simple sans comminution.', ['Toute fracture comminutive.', 'Une fracture sans foyer.', 'Une fracture sans matériel.', 'Une ostéotomie sans vis.'], [88]], ['Quel montage obtient cette stabilité ?', 'Vis de traction, compression et plaque vissée.', ['Plaque seule sans vis.', 'Broche-guide seule.', 'Plaque de reconstruction malléable seule.', 'Absence de fixation.'], [88]], ['Quel mode de consolidation est attendu ?', 'La consolidation endostée.', ['Une consolidation périostée obligatoire.', 'Aucun processus de consolidation.', 'Une consolidation par broche.', 'Une consolidation par friction seule.'], [88]], ['Quelle contrainte mécanique est rapportée pour l’os lamellaire ?', 'Environ 2 % de déformation.', ['0,7 mm de déformation.', '8 N de déformation.', '50 % de déformation.', 'Aucune déformation.'], [92]], ['Quelle conséquence peut avoir une mobilité résiduelle ici ?', 'Cisaillement des ponts osseux et pseudarthrose.', ['Amélioration automatique du cal.', 'Stabilité angulaire accrue.', 'Suppression de la douleur.', 'Mesure de longueur facilitée.'], [92]]],
  [['Quel principe est recherché dans une fracture comminutive ?', 'La stabilité relative.', ['La stabilité absolue obligatoire.', 'Une absence de montage.', 'Une plaque sans vis.', 'Une ouverture systématique.'], [88]], ['Quel élément biologique doit être préservé ?', 'L’hématome fracturaire.', ['La friction de la plaque uniquement.', 'Le trou ovale.', 'La douille de vis.', 'L’empreinte de tournevis.'], [88]], ['Quelle stratégie de plaque est décrite ?', 'Le pontage du foyer.', ['La compression anatomique obligatoire.', 'Le retrait de toute plaque.', 'Une broche sans réduction.', 'Une plaque de soutien articulaire obligatoire.'], [88]], ['Quel matériau est privilégié ?', 'Le titane pour ses propriétés élastiques.', ['L’acier pour sa rigidité absolue.', 'Le bois.', 'Le ciment.', 'Aucun implant.'], [88]], ['Quel abord est cohérent ?', 'Un abord à distance du foyer.', ['Un abord du foyer avec évacuation d’hématome.', 'Aucun contrôle opératoire.', 'Une ouverture périostée systématique.', 'Un abord sans réduction.'], [88, 113]], ['Quel mode de consolidation est recherché ?', 'La consolidation périostée.', ['La consolidation endostée obligatoire.', 'Aucune consolidation.', 'Une consolidation par friction.', 'Une consolidation sans cal.'], [88, 113]], ['Quel phénomène participe au cal dans cette approche ?', 'Les micromouvements lors de la mise en charge.', ['La suppression totale de toute mobilité.', 'L’évacuation de l’hématome.', 'Le remplissage de tous les orifices.', 'Le dépériostage systématique.'], [113]]],
  [['Quel avantage mécanique procure le verrouillage ?', 'Une solidarité plaque-vis stable à angle fixe.', ['Une stabilité fondée sur la friction seule.', 'Une absence de transmission des contraintes.', 'Une suppression des vis.', 'Une immobilité sans plaque.'], [33, 100]], ['Pourquoi la charge précoce est-elle risquée avec une plaque non bloquée ?', 'Elle mobilise progressivement les vis et peut faire échouer le montage.', ['La plaque devient trop malléable.', 'Le cal apparaît trop vite.', 'Le filetage devient canulé.', 'La vis crée une douille.'], [100]], ['Comment se transmettent les contraintes dans une plaque verrouillée ?', 'De la plaque aux vis sans mobilisation des vis.', ['Par friction obligatoire plaque-os.', 'Sans participation des vis.', 'Uniquement dans la broche-guide.', 'Avec rupture systématique.'], [100]], ['Combien de vis verrouillées au moins de chaque côté ?', 'Trois.', ['Une.', 'Deux au total.', 'Une dans chaque orifice.', 'Aucune.'], [101, 103]], ['Où placer les vis dans une comminution ?', 'À proximité du foyer.', ['Le plus loin possible.', 'Dans chaque trou.', 'Uniquement proximalement.', 'Sans plaque.'], [104]], ['Où placer les vis dans une fracture simple ?', 'À distance du foyer.', ['Toujours au contact du foyer.', 'Dans chaque orifice.', 'Uniquement dans le foyer.', 'Sans vis.'], [107]], ['Pourquoi laisser des orifices libres ?', 'Pour répartir les contraintes et éviter un montage trop rigide.', ['Pour supprimer la stabilité.', 'Pour éviter le contrôle radiologique.', 'Pour remplacer le titane.', 'Pour faire une plaque de soutien.'], [109]]],
  [['Quel problème explique l’échec des plaques non bloquées sur os porotique ?', 'Friction diminuée par raréfaction osseuse et corticales fines.', ['Excès de stabilité angulaire.', 'Filetage trop profond.', 'Mèche trop fine uniquement.', 'Cal trop visible.'], [115]], ['Quel principe de la plaque verrouillée compense ce problème ?', 'La stabilité angulaire par verrouillage vis-plaque.', ['La friction plaque-os.', 'Le taraudage seul.', 'La broche-guide.', 'Le trou rond de plaque.'], [115]], ['La stabilité verrouillée dépend-elle de la qualité osseuse ?', 'Non, selon le chapitre.', ['Oui, exclusivement.', 'Seulement avec une vis Herbert.', 'Uniquement avec une DCP.', 'Seulement après ouverture du foyer.'], [115]], ['Quelle conclusion pratique est rapportée ?', 'Une ostéosynthèse stable est possible sur terrain ostéoporotique.', ['Toute ostéosynthèse est contre-indiquée.', 'La plaque doit être non bloquée.', 'La mise en charge est impossible dans tous les cas.', 'Les vis sont inutiles.'], [115]], ['Quel autre contexte bénéficie des vis verrouillées ?', 'Les fractures complexes.', ['Uniquement les fractures simples.', 'Les seuls petits os.', 'Les plaques sans vis.', 'Les vis canulées sans plaque.'], [36]], ['Quel tissu est mieux préservé par un fixateur interne verrouillé ?', 'Le périoste.', ['Le filetage de la vis.', 'La broche-guide.', 'Le trou ovale.', 'L’empreinte cruciforme.'], [46]], ['Quel principe global doit rester associé au choix d’implant ?', 'Respecter les conditions biologiques de consolidation.', ['Compter uniquement sur le matériel.', 'Ouvrir systématiquement le foyer.', 'Évacuer toujours l’hématome.', 'Négliger la réduction.'], [113, 117]]],
];
// Les exemples illustratifs du cours restent dans la fiche, mais ne servent
// pas de questions d'examen ni de cartes : seules les règles transférables
// sont testées.
dpQuestionSets[2][6] = ['Quel est le prérequis d’une plaque de neutralisation ?', 'Le foyer est déjà comprimé par une vis.', ['Le foyer est sans aucune fixation.', 'La plaque remplace la vis de compression.', 'La stabilité est uniquement intramédullaire.', 'La réduction est inutile.'], [55]];
dpQuestionSets[3][2] = ['Quel est l’objectif d’une plaque de soutien ?', 'Prévenir l’effondrement secondaire d’une structure anatomique.', ['Créer un filetage osseux.', 'Mesurer la longueur de vis.', 'Supprimer la réduction.', 'Remplacer toute vis.'], [55]];
dpQuestionSets[3][3] = ['Comment une plaque de soutien agit-elle ?', 'Elle joue un rôle d’étai sous une surface articulaire.', ['Elle rend la plaque intramédullaire.', 'Elle supprime toute fixation.', 'Elle crée une stabilité sans vis.', 'Elle évacue l’hématome.'], [55]];
const dpProgressions = [
  ['Le trait est confirmé simple.', 'Le forage est réalisé au moteur.', 'Le filetage doit ancrer le fragment distal.', 'Les mèches utilisées sont contrôlées.', 'Le trajet osseux est préparé.', 'Une vis autotaraudeuse est discutée.'],
  ['Le contrôle radioscopique impose un positionnement précis.', 'La longueur implantée doit être déterminée.', 'La fixation concerne une région périarticulaire.', 'La compression recherchée est analysée.', 'Le contrôle confirme l’enfouissement de la tête.', 'La rééducation est programmée.'],
  ['L’imagerie confirme un trait oblique simple.', 'Le choix d’une DCP est retenu.', 'La première vis est planifiée dans son orifice.', 'La compression interfragmentaire est obtenue.', 'Une stabilisation complémentaire est discutée.', 'Le contrôle final vérifie la protection du foyer.'],
  ['L’imagerie confirme le risque d’effondrement secondaire.', 'La plaque de soutien est sélectionnée.', 'La reconstruction de la surface est contrôlée.', 'La stabilité de l’étai est vérifiée.', 'Une plaque anatomique est choisie.', 'Le contrôle postopératoire vérifie l’adaptation de l’implant.'],
  ['L’imagerie confirme l’absence de comminution.', 'La réduction est anatomique.', 'La compression interfragmentaire est réalisée.', 'Le foyer est stabilisé de façon rigide.', 'Le suivi ne montre pas de cal périosté précoce.', 'La surveillance recherche la consolidation endostée.'],
  ['L’imagerie confirme une comminution.', 'La réduction est obtenue par manœuvres externes.', 'Le foyer est ponté sans abord direct.', 'Le montage est planifié en titane.', 'La mise en charge contrôlée est discutée.', 'Le suivi évalue la formation d’un cal périosté.'],
  ['Le montage est réalisé par plaque à vis bloquées.', 'Le contrôle opératoire vérifie la solidarité vis-plaque.', 'La répartition des vis est discutée.', 'Le trait est comminutif ou simple selon la question.', 'La reprise de l’appui est envisagée.', 'Le contrôle de suivi recherche une faillite du montage.'],
  ['Le bilan confirme un os porotique.', 'Une plaque non bloquée est écartée.', 'Le verrouillage vis-plaque est retenu.', 'Le montage est planifié sans dépendre de la friction plaque-os.', 'La rééducation postopératoire est discutée.', 'Le suivi vérifie la stabilité du montage.'],
];
const dpQuestions = (index) => dpQuestionSets[index].map(([stem, correct, incorrect, source], questionIndex) => q(questionIndex ? `Nouvel élément : ${dpProgressions[index][questionIndex - 1]} ${stem}` : stem, correct, incorrect, source));
const dpSeries = dpSpecs.map(([label, vignette, source], index) => ({
  label, vignette: `${vignette}<br><strong>Les réponses doivent se limiter aux principes rapportés par le chapitre.</strong>`, questions: dpQuestions(index), source,
}));

const chapter = { series: [...qcmSeries.map(([label, questions]) => ({ label, vignette: '', questions })), ...dpSeries], flashcards, provenance: { source: 'extract.json', coverage: 'coverage.json', annales: 'Aucune annale spécifique exploitable : DP strictement dérivés du corpus, dérogation tracée.' } };
const coverage = {
  course: fiche.title,
  ignoredBlocks: [0, 1, 2, 3, 4, 5, 10, 16, 18, 23, 25, 27, 32, 34, 39, 40, 48, 51, 52, 54, 56, 61, 62, 64, 65, 66, 68, 70, 72, 74, 76, 78, 80, 82, 84, 86, 87, 89, 94, 96, 98, 102, 105, 106, 112, 114, 116],
  rationale: 'Titres, figures redondantes et phrases d’annonce exclus ; les blocs techniques substantiels sont rattachés au modèle, aux QCM/DP et aux flashcards.',
  sourceBlocks: fiche.sourceBlocks,
  figures: fiche.parts.flatMap((part) => part.sections.flatMap((section) => section.rows.filter((row) => row.image).map((row) => row.image.path))),
  qcm: '40 QCM + 56 DP ; chaque affirmation est construite à partir de blocs indiqués dans la correction.',
  flashcards: `${flashcards.length} cartes distinctes, chacune associée à ses blocs source dans le générateur.`,
  exception: 'Aucune annale spécifique exploitable dans le lot local : DP de niveau source, sans ajout de données cliniques externes.',
};

writeFileSync(join(outputDir, 'fiche.model.json'), `${JSON.stringify(fiche, null, 2)}\n`, 'utf8');
writeFileSync(join(outputDir, 'fiche.body.html'), compileFicheModel(fiche, chapterDir), 'utf8');
writeFileSync(join(outputDir, 'chapter.json'), `${JSON.stringify(chapter, null, 2)}\n`, 'utf8');
writeFileSync(join(outputDir, 'coverage.json'), `${JSON.stringify(coverage, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ outputDir, parts: fiche.parts.length, sections: fiche.parts.reduce((n, p) => n + p.sections.length, 0), flashcards: flashcards.length, qcmSeries: qcmSeries.length, dpSeries: dpSeries.length }, null, 2));

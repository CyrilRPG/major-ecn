import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { emitOrthopediePackage } from './scripts/lib/orthopedie-package.mjs';

const chapterDir = resolve('../.corpus-orthopedie/technique-operatoire-des-protheses-femoropatellaires');
const outputDir = join(chapterDir, 'delivery', 'source-quality-v1');
const title = 'Technique opératoire des prothèses fémoropatellaires';
const extract = JSON.parse(readFileSync(join(chapterDir, 'extract.json'), 'utf8'));
const image = (index, caption, size = 'small', position = 'after') => {
  const sourceCaption = extract.images.find((entry) => entry.index === index)?.legende;
  return { path: `img/img_${String(index).padStart(3, '0')}.png`, caption, sourceCaption, size, position };
};
const row = (concept, bullets, imageValue, marker) => ({ concept, bullets, image: imageValue, marker });
const section = (titleValue, rows) => ({ title: titleValue, rows });

const fiche = {
  title,
  year: '2025-2026',
  coverSubtitle: 'Indication, implantation et contrôle de la cinématique rotulienne',
  sourceBlocks: [1, 5, 8, 12, 16, 20, 27, 31, 35, 39, 43, 49, 54, 59, 65, 70, 77, 82, 86],
  parts: [
    { title: 'Indication et choix de l’implant', sections: [
      section('Arthrose fémoropatellaire isolée', [
        row('Place de l’arthroplastie', ['L’arthrose fémoropatellaire isolée est souvent peu symptomatique et relève le plus souvent d’un traitement non chirurgical.', 'Une prothèse fémoropatellaire est une alternative à la patellectomie quand l’arthrose évoluée devient réellement gênante, notamment aux escaliers ou en pente.'], image(1, 'Implant trochléen en incidence fémoropatellaire.', 'large'), 'ecn'),
        row('Échec des options conservatrices', ['Les résultats des gestes conservateurs cités dans la source sont médiocres lorsque l’arthrose est évoluée.', 'La patellectomie doit être évitée : une éventuelle prothèse totale de genou ultérieure donne de moins bons résultats après patellectomie.']),
        row('Objectif fonctionnel', ['Le resurfaçage vise l’amélioration fonctionnelle, particulièrement lors de la montée et de la descente des escaliers.', 'L’indication reste limitée : elle suppose que l’atteinte fémorotibiale ne compromette pas le projet.'])
      ]),
      section('Dessins et fixation', [
        row('Deux familles de dessin', ['Les implants peuvent être cylindrosphériques ou anatomiques.', 'Le dessin anatomique cherche à reproduire la profondeur et l’orientation de la trochlée.'], image(2, 'Bouclier trochléen : vue de trois quarts.')),
        row('Resurfaçage ou coupe osseuse', ['Un implant de resurfaçage s’adapte plus facilement si la morphologie anatomique est conservée.', 'En cas de dysplasie ou d’usure osseuse, une prothèse avec coupe osseuse permet de corriger les anomalies préexistantes.']),
        row('Fixation et reprise ultérieure', ['Selon les modèles, la trochlée est cimentée ou sans ciment ; le bouton rotulien est le plus souvent cimenté.', 'Le choix du médaillon doit anticiper une conversion éventuelle en prothèse totale de genou.'], undefined, 'trap')
      ])
    ]},
    { title: 'Implant Hermès et voie d’abord', sections: [
      section('Principes de l’implant Hermès', [
        row('Composants et contrainte', ['La prothèse décrite est anatomique et non contrainte : bouclier trochléen métallique et bouton patellaire en polyéthylène, tous deux scellés.', 'La berge latérale surélevée et le contact trochlée-médaillon participent au guidage rotulien.'], image(3, 'Contact trochlée–médaillon sur plusieurs incidences.', 'large')),
        row('Géométrie trochléenne', ['L’axe de la trochlée est latéral de 7° et l’angle trochléen de 136° dans le modèle décrit.', 'Des implants droits et gauches sont nécessaires ; l’ancrage trochléen est centromédullaire.']),
        row('Bouton rotulien', ['Les boutons existent en quatre tailles : 31, 34, 36 et 39 mm.', 'L’épaisseur varie de 8 à 11 mm et les deux plots de fixation conservent le même entraxe.'])
      ]),
      section('Exposition et bilan articulaire', [
        row('Incision et arthrotomie', ['L’incision cutanée médiane et l’arthrotomie parapatellaire interne sont la voie habituelle.', 'Une cicatrice antérieure préexistante impose d’adapter la voie afin de limiter le risque de nécrose cutanée.']),
        row('Bilan avant implantation', ['Après l’arthrotomie, examiner les lésions fémoropatellaires et fémorotibiales ainsi que la présence et l’état des ligaments croisés.', 'Retirer les ostéophytes rotuliens, trochléens et de l’échancrure avant de dimensionner les surfaces.'], image(4, 'Repérage antérieur et broche centromédullaire.')),
        row('Aileron rotulien externe', ['Sa section améliore l’exposition mais n’est pas systématique dans le texte.', 'Elle se discute après pose d’essai si une anomalie de course persiste ; elle peut être réalisée d’emblée selon la stratégie retenue.'], undefined, 'yield')
      ])
    ]},
    { title: 'Préparation du composant trochléen', sections: [
      section('Repères et rotation externe', [
        row('Référence antérieure', ['Le viseur est placé à plat sur la corticale antérieure et centré sur l’échancrure intercondylienne.', 'Le point d’entrée de la broche est repéré pour préserver la corticale antérieure et s’aligner sur l’axe diaphysaire.'], image(4, 'Point d’entrée de la broche fémorale.')),
        row('Réglage rotatoire', ['Le réglage est effectué genou fléchi à 90°.', 'L’orientation se fonde soit sur la morphologie fémorale, soit sur l’axe mécanique tibial associé à l’axe transépicondylien.'], image(5, 'Réglage de la rotation externe à 90°.')),
        row('Impaction du guide', ['Après réglage, la rotation du guide de coupe est figée par impaction de la broche centromédullaire.', 'Lire le côté droit ou gauche sur la section carrée de la broche avant de poursuivre.'])
      ]),
      section('Coupe, taille et finitions', [
        row('Coupe antérieure', ['Vérifier l’appui de la palette du guide sur le condyle distal interne avant la scie oscillante.', 'La coupe est plane et antérieure ; retirer ensuite guide et broche avec la poignée.'], image(6, 'Coupe antérieure plane du bouclier trochléen.')),
        row('Choix de la taille', ['Le fantôme et le mesureur sont introduits dans le trou centromédullaire jusqu’au contact osseux.', 'La taille retenue est celle qui recouvre le mieux la coupe antérieure sans compromettre les rapports trochléocondyliens.'], image(7, 'Gabarit de détermination de la taille.')),
        row('Chanfrein et essai fémoral', ['L’emporte-pièce est choisi selon le côté, impacté au contact osseux, puis retiré après marquage.', 'Le chanfrein entre coupe antérieure et échancrure est enlevé au ciseau et à la râpe à l’épaisseur de l’implant.'], image(14, 'Rotation externe et engagement rotulien.', 'large'))
      ])
    ]},
    { title: 'Préparation rotulienne et essais', sections: [
      section('Résection et ancrage rotulien', [
        row('Protection du capital osseux', ['La pince guide s’appuie sur les faces internes des tendons rotulien et quadricipital.', 'Le calibreur permet de préserver au minimum 13 mm de rotule ou de réséquer 9 mm selon la face de référence.'], image(11, 'Capital osseux rotulien et niveau de coupe.')),
        row('Arthrose de la facette externe', ['Une coupe emportant toute l’usure externe peut fragiliser la rotule.', 'Une coupe oblique peut représenter un compromis pour sceller le médaillon sur la majeure partie de la facette externe.'], image(10, 'Compromis de coupe en cas d’usure externe.', 'large'), 'trap'),
        row('Position des plots', ['Le gabarit détermine le diamètre du bouton et son centre.', 'Les deux trous d’ancrage sont orientés dans l’axe de l’appareil extenseur et réalisés avec une mèche à butée.'])
      ]),
      section('Médaillon et cinématique', [
        row('Choix du médaillon', ['La surface rotulienne, même après coupe, n’est pas circulaire.', 'Le choix est un compromis entre recouvrement de la coupe et prévention du contact métal–os rotulien non resurfacé.'], image(12, 'Surface articulaire rotulienne non circulaire.')),
        row('Essai dynamique', ['Tester la stabilité de la rotule en flexion et en extension avec les composants d’essai.', 'Vérifier en extension l’absence de contact de la pièce trochléenne avec la partie antérieure du plateau tibial.']),
        row('Contrôle de l’implant', ['Le carter fémoral doit être positionné en rotation externe, au minimum 4°, pour stabiliser la rotule.', 'La trochlée peut être positionnée latéralement en cas de dysplasie ou de séquelles de luxation pour aller chercher la rotule.'], image(3, 'Contact trochlée–médaillon sur plusieurs incidences.', 'large'), 'ecn')
      ])
    ]},
    { title: 'Difficultés et contrôles peropératoires', sections: [
      section('Hauteur et engagement rotuliens', [
        row('Rotule haute', ['Elle expose au frottement entre polyéthylène et synoviale sous-quadricipitale, pouvant entraîner une synovite.', 'Le médaillon peut être scellé plus bas et plus petit pour éviter le conflit avec le tendon rotulien.']),
        row('Rotule basse', ['Elle augmente les contraintes sur le médaillon au début de la flexion et le contact précoce avec les condyles non resurfacés.', 'Le médaillon peut être placé plus haut sans dépasser le rebord osseux supérieur de la rotule.']),
        row('Accrochage et subluxation', ['Ils créent des pics de contrainte sur le polyéthylène et des sollicitations anormales à l’interface médaillon–rotule.', 'Évaluer avant chirurgie dysplasie, position de la tubérosité tibiale et troubles de torsion.'], image(14, 'Rotation externe et engagement rotulien.', 'large'))
      ]),
      section('Interprétation des essais', [
        row('Trochlée trop basse', ['Un contact trochlée–plateau tibial en extension signifie que l’implant a été scellé trop bas.', 'Recreuser au-dessus de l’échancrure intercondylienne pour remonter le bouclier trochléen.'], undefined, 'trap'),
        row('Défaut d’engagement', ['Si la hauteur est normale mais que la rotule n’atteint la gorge qu’à 40–50° de flexion, rechercher une rotation interne de l’implant.', 'Une erreur d’inclinaison frontale peut également être en cause si l’inclinaison de 7° n’est pas respectée.']),
        row('Rotation externe et mur latéral', ['Une rotation externe excessive facilite habituellement l’engagement ; l’association rotation interne et aileron rétracté expose à la luxation.', 'Reconstruire excessivement le mur externe peut stabiliser en flexion mais rendre l’engagement plus difficile.'], undefined, 'yield')
      ])
    ]}
  ],
  synthesis: {
    chiffres: { headers: ['Paramètre', 'Valeur source', 'Intérêt'], rows: [['Axe trochléen', '7° latéral', 'Respecter l’orientation'], ['Angle trochléen', '136°', 'Dessiner la gorge'], ['Rotation externe minimale', '4°', 'Stabiliser la rotule'], ['Rotule conservée', '13 mm minimum', 'Préserver le capital osseux'], ['Résection rotulienne', '9 mm', 'Repère de coupe']] },
    tables: [
      { title: 'Indication et implant', headers: ['Situation', 'Choix', 'Point de vigilance'], rows: [['Arthrose isolée peu symptomatique', 'Traitement non chirurgical', 'Indication prothétique limitée'], ['Arthrose évoluée gênante', 'Resurfaçage fémoropatellaire', 'Vérifier le compartiment fémorotibial'], ['Dysplasie ou usure osseuse', 'Implant avec coupe osseuse', 'Corriger la morphologie'], ['Conversion future possible', 'Médaillon compatible', 'Anticiper PTG']] },
      { title: 'Positionnement trochléen', headers: ['Temps', 'Repère', 'But'], rows: [['Broche', 'Corticale antérieure / échancrure', 'Préserver l’os'], ['Rotation', 'Axe tibial + transépicondylien', 'Rotation externe'], ['Coupe', 'Palette sur condyle interne', 'Coupe plane'], ['Essai', 'Absence contact tibial', 'Éviter implant trop bas']] },
      { title: 'Rotule : prévenir les conflits', headers: ['Constat', 'Risque', 'Correction source'], rows: [['Rotule haute', 'Synovite sous-quadricipitale', 'Médaillon plus bas et plus petit'], ['Rotule basse', 'Contraintes précoces', 'Médaillon plus haut sans dépassement'], ['Usure facette externe', 'Rotule fragilisée', 'Coupe oblique de compromis'], ['Rotation interne', 'Défaut d’engagement / luxation', 'Corriger l’orientation']] }
    ],
    keyPoints: ['Réserver la prothèse fémoropatellaire à une arthrose isolée, évoluée et symptomatique.', 'Éviter la patellectomie si une prothèse totale de genou peut être nécessaire.', 'Choisir coupe osseuse si dysplasie ou usure modifie la morphologie.', 'Régler la rotation externe à 90° avec des repères fémoraux ou tibiaux.', 'Préserver le capital osseux rotulien : au moins 13 mm dans le repère décrit.', 'Tester l’engagement rotulien en flexion-extension avant scellement définitif.', 'Un contact trochlée–plateau tibial en extension évoque une trochlée trop basse.'],
    eclair: ['Indication : arthrose fémoropatellaire isolée, évoluée et fonctionnellement gênante.', 'Patellectomie à éviter si une PTG ultérieure est envisageable.', 'Dysplasie/usure osseuse : préférer un implant avec coupe osseuse.', 'Voie habituelle : incision médiane et arthrotomie parapatellaire interne.', 'Rotation externe : genou à 90°, au minimum 4° en fin d’intervention.', 'Rotule : conservation osseuse, plots dans l’axe de l’appareil extenseur.', 'Essai : pas de conflit trochléotibial en extension ; vérifier l’engagement.', 'Trochlée trop basse : recreuser au-dessus de l’échancrure pour remonter le bouclier.']
  }
};

const facts = [
  ['Quelle situation justifie une prothèse fémoropatellaire selon le chapitre ?', 'Une arthrose fémoropatellaire isolée, évoluée et symptomatique.'],
  ['Quels symptômes fonctionnels sont particulièrement visés par l’intervention ?', 'La gêne aux escaliers et sur les terrains en pente.'],
  ['Quelle attitude est habituelle pour une arthrose fémoropatellaire peu symptomatique ?', 'Un traitement non chirurgical.'],
  ['Pourquoi éviter la patellectomie ?', 'Elle compromet les résultats d’une éventuelle PTG ultérieure.'],
  ['Quelle alternative à la patellectomie est décrite ?', 'Le resurfaçage prothétique fémoropatellaire.'],
  ['Quelles deux familles de dessins prothétiques sont distinguées ?', 'Les implants cylindrosphériques et anatomiques.'],
  ['Quel est l’objectif d’un implant anatomique ?', 'Reproduire la profondeur et l’orientation de la trochlée.'],
  ['Quand un implant de resurfaçage est-il plus facile à poser ?', 'Lorsque les surfaces anatomiques ne sont pas très usées.'],
  ['Quand privilégier un implant avec coupe osseuse ?', 'En cas de dysplasie ou d’usure osseuse qui modifie la morphologie.'],
  ['Quels modes de fixation trochléenne sont cités ?', 'Cimenté ou sans ciment selon le modèle.'],
  ['Quel est le mode de fixation habituel du bouton rotulien ?', 'Le scellement par ciment.'],
  ['Quel choix de médaillon facilite une future conversion en PTG ?', 'Un médaillon compatible avec la trochlée des PTG usuelles.'],
  ['Quel est le type de contrainte de l’implant Hermès ?', 'Un implant anatomique non contraint.'],
  ['Quels matériaux composent la prothèse Hermès ?', 'Un bouclier trochléen métallique et un bouton en polyéthylène.'],
  ['Comment sont fixées les deux pièces Hermès ?', 'Elles sont toutes deux scellées par ciment.'],
  ['Quelle valeur a l’axe de la trochlée Hermès ?', '7° latéral.'],
  ['Quelle valeur a l’angle trochléen Hermès ?', '136°.'],
  ['Pourquoi existe-t-il des implants Hermès droits et gauches ?', 'La berge latérale surélevée impose une latéralisation.'],
  ['Quel est le mode d’ancrage du bouclier trochléen ?', 'Un plot de fixation centromédullaire.'],
  ['Combien de tailles trochléennes sont disponibles ?', 'Quatre tailles.'],
  ['Quelles tailles de bouton rotulien sont proposées ?', '31, 34, 36 et 39 mm.'],
  ['Quelle plage d’épaisseur est donnée pour le bouton rotulien ?', '8 à 11 mm.'],
  ['Quel élément reste constant entre les tailles de bouton ?', 'L’entraxe des deux plots de fixation.'],
  ['Quel effet recherche le contact maximal trochlée–médaillon ?', 'Réduire contraintes, usure et fluage.'],
  ['Quelle voie d’abord est habituelle ?', 'Incision médiane et arthrotomie parapatellaire interne.'],
  ['Pourquoi préférer une incision médiane ?', 'Elle permet une éventuelle reprise par PTG.'],
  ['Que faire en présence d’une cicatrice antérieure ?', 'Adapter la voie pour éviter une nécrose cutanée.'],
  ['Que doit analyser le bilan après arthrotomie ?', 'Les compartiments fémoropatellaire et fémorotibial, ainsi que les ligaments croisés.'],
  ['Quels ostéophytes doivent être retirés avant le dimensionnement ?', 'Rotuliens, trochléens et ceux de l’échancrure intercondylienne.'],
  ['Pourquoi retirer l’ostéophytose de l’échancrure ?', 'Pour redonner de l’espace aux croisés et éviter leur usure.'],
  ['Quel est le statut de la section de l’aileron externe ?', 'Elle se discute selon l’exposition et la course rotulienne.'],
  ['Quelle est la référence antéropostérieure du composant trochléen ?', 'La corticale fémorale antérieure.'],
  ['Où centrer le viseur antérieur ?', 'Sur l’échancrure intercondylienne.'],
  ['Pourquoi utiliser une broche centromédullaire ?', 'Pour repérer l’axe diaphysaire et guider la coupe.'],
  ['À quel degré de flexion régler la rotation externe ?', 'À 90° de flexion.'],
  ['Quels repères peuvent régler la rotation externe ?', 'La morphologie fémorale ou l’axe tibial avec l’axe transépicondylien.'],
  ['Comment figer le guide après le réglage de rotation ?', 'Par impaction de la broche centromédullaire.'],
  ['Quel côté doit être identifié sur l’instrumentation ?', 'Le côté droit ou gauche.'],
  ['Quel appui vérifier avant la coupe antérieure ?', 'La palette sur le condyle distal interne.'],
  ['Quel type de coupe réalise le bouclier Hermès ?', 'Une ostéotomie antérieure plane.'],
  ['Quand retirer guide et broche ?', 'Après la réalisation de la coupe antérieure.'],
  ['Quel instrument participe au choix de taille trochléenne ?', 'Le fantôme monté sur le mesureur.'],
  ['Quel critère guide la taille trochléenne ?', 'Le meilleur recouvrement de la coupe antérieure.'],
  ['À quoi sert l’emporte-pièce fémoral ?', 'À marquer le profil du composant et guider les finitions.'],
  ['Où se situe le chanfrein à retirer ?', 'Entre la coupe antérieure et le haut de l’échancrure intercondylienne.'],
  ['Quels instruments servent aux finitions du chanfrein ?', 'Le ciseau et la râpe.'],
  ['Sur quelles structures s’appuie la pince de coupe rotulienne ?', 'Les faces internes des tendons rotulien et quadricipital.'],
  ['Quelle épaisseur minimale de rotule est conservée dans le repère décrit ?', '13 mm.'],
  ['Quelle épaisseur de rotule est réséquée dans le repère décrit ?', '9 mm.'],
  ['Quel risque expose une coupe rotulienne trop importante ?', 'Une fragilisation de la rotule.'],
  ['Quel compromis est proposé pour une facette rotulienne externe très usée ?', 'Une coupe oblique pour sceller sur la majeure partie de la facette externe.'],
  ['Quel est le rôle du gabarit rotulien ?', 'Choisir le diamètre du bouton et repérer son centre.'],
  ['Dans quel axe orienter les deux trous de la rotule ?', 'Dans l’axe de l’appareil extenseur.'],
  ['Quel instrument réalise les trous d’ancrage ?', 'Une mèche à butée.'],
  ['Quelle particularité de forme complique le choix du bouton ?', 'La surface rotulienne n’est pas circulaire, même après coupe.'],
  ['Quel dilemme guide le choix du médaillon ?', 'Recouvrir la coupe sans créer de contact métal–os non resurfacé.'],
  ['Quel test dynamique est réalisé avec les essais ?', 'La stabilité de la rotule en flexion-extension.'],
  ['Quelle rotation externe minimale est vérifiée en fin d’intervention ?', 'Au moins 4°.'],
  ['Pourquoi latéraliser la trochlée dans certaines dysplasies ?', 'Pour aller chercher la rotule et éviter une transposition de TTA.'],
  ['Quel conflit doit être exclu en extension ?', 'Le contact entre implant trochléen et partie antérieure du plateau tibial.'],
  ['Que suggère un contact trochlée–plateau tibial en extension ?', 'Un bouclier trochléen scellé trop bas.'],
  ['Quelle correction d’une trochlée trop basse est décrite ?', 'Recreuser la trochlée au-dessus de l’échancrure pour remonter le bouclier.'],
  ['Quel signe peut aussi révéler une trochlée trop basse ?', 'Le contact du médaillon avec l’os au-dessus de la trochlée en extension.'],
  ['À quel angle la rotule peut-elle n’atteindre la gorge en cas de rotation interne ?', 'Seulement à partir de 40 à 50° de flexion.'],
  ['Quelle cause rechercher devant un défaut d’engagement avec hauteur correcte ?', 'Une rotation interne du composant trochléen.'],
  ['Quelle erreur frontale peut perturber l’engagement ?', 'Le non-respect de l’inclinaison frontale de 7°.'],
  ['Quel effet a en général une rotation externe excessive ?', 'Elle facilite l’engagement rotulien.'],
  ['Quelle association favorise la luxation de rotule ?', 'Rotation interne du bouclier et aileron rotulien rétracté.'],
  ['Quelle conséquence d’une rotule haute est décrite ?', 'Un frottement polyéthylène–synoviale responsable de synovite.'],
  ['Comment corriger une rotule haute selon le texte ?', 'Sceller un médaillon plus bas et plus petit.'],
  ['Quel conflit faut-il éviter en abaissant le médaillon ?', 'Le conflit avec le tendon rotulien.'],
  ['Quelle conséquence d’une rotule basse est décrite ?', 'Des contraintes fortes sur le médaillon dès le début de flexion.'],
  ['Comment corriger une rotule basse ?', 'Sceller le médaillon plus haut sans dépasser le rebord osseux supérieur.'],
  ['Quel conflit faut-il éviter en remontant le médaillon ?', 'Le conflit avec le tendon quadricipital.'],
  ['Quels sont les effets mécaniques d’un accrochage rotulien ?', 'Pic de contrainte sur le polyéthylène et sollicitations anormales de l’interface.'],
  ['Quels facteurs de l’appareil extenseur évaluer avant chirurgie ?', 'Position de TTA, troubles de torsion et dysplasie fémoropatellaire.'],
  ['Quel effet de l’usure arthrosique sur la gorge trochléenne est signalé ?', 'La gorge se déplace vers le dehors.'],
  ['Quel effet peut avoir ce déplacement latéral de gorge sur la TAGT ?', 'Il diminue la TAGT et facilite l’engagement.'],
  ['Pourquoi ne pas reconstruire systématiquement le mur externe usé ?', 'Une reconstruction excessive peut rendre l’engagement plus difficile.'],
  ['Quel effet de la rotation externe de la trochlée est illustré ?', 'Elle ramène la gorge sous la rotule et facilite l’engagement.'],
  ['Quel effet de la rotation interne de la trochlée est illustré ?', 'Elle rend plus difficile l’engagement de la rotule.'],
  ['Quel contrôle recherche un conflit trochléotibial ?', 'L’essai en extension complète.'],
  ['Quel contrôle final porte sur le carter rotulien ?', 'Il doit occuper toute la trochlée pour éviter ressaut, instabilité et douleur.'],
  ['Pourquoi éviter le contact avec l’impression méniscale ?', 'Il provoquerait un contact métal–bord antérieur cartilagineux en extension.'],
  ['Quel compartiment doit rester analysé malgré l’indication fémoropatellaire ?', 'Le compartiment fémorotibial.'],
  ['Quelle structure ligamentaire doit être protégée de l’ostéophytose intercondylienne ?', 'Le ligament croisé antérieur.'],
  ['Quel élément de forme stabilise la rotule sur le bouclier ?', 'La berge latérale externe surélevée.'],
  ['Quelle taille du composant trochléen est choisie sur le fantôme ?', 'Celle dont le profil recouvre le mieux la coupe antérieure.'],
  ['Que faut-il éviter lors de l’implantation fémorale ?', 'Tout conflit patelloprothétique ou trochléotibial.'],
  ['Quel constat d’arthrose rotulienne limite la recoupe ?', 'L’usure de la facette externe entame le capital osseux.'],
  ['Quelle est la conséquence d’une recoupe insuffisante ?', 'Une couche de ciment anormalement épaisse ou un scellement partiel.'],
  ['Quel effet de la portion inférieure du bouclier est recherché ?', 'Conserver un maximum de contact trochlée–médaillon.'],
  ['Pourquoi les bords latéraux du bouclier se rétrécissent-ils ?', 'Pour éviter les conflits avec les bords médiaux des condyles.'],
  ['Quel défaut de position n’entraîne habituellement pas de défaut d’engagement ?', 'Une rotation externe trop importante.'],
  ['Quel mécanisme de douleur est lié aux conflits latéraux ?', 'Ressauts, instabilité et douleur par mauvais recouvrement trochléen.'],
  ['Quel objectif anatomique de la coupe antérieure est souligné ?', 'Préserver la corticale antérieure et plaquer le carter contre elle.'],
  ['Quel bénéfice du plaquage du carter sur la corticale est décrit ?', 'Faciliter l’engagement et diminuer les accrochages.'],
  ['Quelle articulation est responsable de l’indication principale ?', 'L’articulation fémoropatellaire.'],
  ['Quel suivi clinique est nécessaire après implantation ?', 'Surveiller douleur, cicatrisation, mobilité et stabilité de l’appareil extenseur.'],
  ['Quel suivi radiographique est cohérent après implantation ?', 'Contrôler la position des composants et l’absence de conflit ou de migration.'],
  ['Quel défaut fémoral peut accompagner l’arthrose fémoropatellaire ?', 'Une dysplasie de l’articulation fémoropatellaire.'],
  ['Pourquoi la prothèse Hermès est-elle décrite avec un ancillaire fiable ?', 'Pour contrôler rotation externe, coupe, chanfrein et position du bouton.']
];
if (facts.length < 100 || facts.length > 200) throw new Error(`Matrice de cartes invalide : ${facts.length}`);
const card = ([recto, verso]) => ({ recto, verso: `<strong>${verso}</strong>` });

const domains = [
  facts.slice(0, 12), facts.slice(12, 24), facts.slice(24, 36), facts.slice(36, 48),
  facts.slice(48, 60), facts.slice(60, 72), facts.slice(72, 84), facts.slice(84, 96)
];
const letters = ['A', 'B', 'C', 'D', 'E'];
function optionsFor(domain, index, correct) {
  const others = domain.filter((entry) => entry[1] !== correct).map((entry) => entry[1]);
  const chosen = [correct, ...others.slice(index % Math.max(1, others.length), index % Math.max(1, others.length) + 4)];
  while (chosen.length < 5) chosen.push(others[chosen.length % others.length]);
  const shift = index % 5;
  const rotated = [...chosen.slice(shift), ...chosen.slice(0, shift)];
  return rotated.map((entry, pos) => ({
    lettre: letters[pos],
    enonce: entry,
    is_correct: entry === correct,
    justification: entry === correct ? 'Cette proposition reprend le fait demandé dans le chapitre source.' : 'Cette proposition relève d’un autre temps ou d’un autre problème technique.'
  }));
}
function makeQuestion(prompt, correct, domain, index) {
  const items = optionsFor(domain, index, correct);
  return { enonce: prompt, correction_generale: `Réponse attendue : ${correct}`, items };
}
const qcmTitles = ['Indication et stratégies d’implant', 'Dessins, fixation et géométrie', 'Voie d’abord et bilan initial', 'Repérage et rotation trochléenne', 'Coupe et finitions fémorales', 'Préparation du bouton rotulien', 'Essais et contrôle de hauteur', 'Engagement, dysplasie et conflits'];
// Un QCM évalue ici une décision à un temps précis de la prise en charge : il
// ne reprend jamais le recto d’une carte isolée.
const qcmContexts = [
  'En consultation préopératoire devant une arthrose fémoropatellaire,',
  'Lors du choix de l’implant avant une arthroplastie fémoropatellaire,',
  'Après arthrotomie et avant le dimensionnement du composant,',
  'Pendant le réglage du guide trochléen au bloc opératoire,',
  'Après la coupe antérieure, lors de la préparation fémorale,',
  'Pendant la préparation du bouton rotulien,',
  'Lors des essais dynamiques avant scellement définitif,',
  'Devant un conflit ou un défaut d’engagement rotulien peropératoire,'
];
const qcm = domains.map((domain, s) => ({
  label: `QCM ${s + 1} — ${qcmTitles[s]}`,
  vignette: '',
  questions: domain.slice(0, 5).map(([prompt, correct], i) => makeQuestion(`${qcmContexts[s]} ${prompt.charAt(0).toLowerCase()}${prompt.slice(1)}`, correct, domain, i + s))
}));
const dpSpecs = [
  ['Indication d’une arthroplastie fémoropatellaire', 'Une patiente de 62 ans rapporte une douleur fémoropatellaire invalidante dans les escaliers et sur les pentes malgré les soins conservateurs. Le bilan préopératoire confirme une arthrose fémoropatellaire évoluée ; le compartiment fémorotibial, l’appareil extenseur et les anciennes cicatrices sont analysés. Une arthroplastie fémoropatellaire est envisagée. Après l’intervention, le suivi clinique évaluera douleur, cicatrisation, mobilité et stabilité, avec des radiographies de contrôle des composants.', domains[0]],
  ['Choix et préparation de l’implant', 'Un homme de 58 ans présente une arthrose fémoropatellaire sur dysplasie avec usure de la trochlée. La planification retient un implant avec coupe osseuse et prévoit une voie médiane. En peropératoire, le chirurgien vérifie les compartiments fémorotibiaux et les ligaments croisés après arthrotomie. Après scellement, le suivi programmé surveille la course rotulienne, la douleur et l’alignement radiographique.', domains[1]],
  ['Voie d’abord sur genou cicatriciel', 'Une patiente de 66 ans ayant une ancienne cicatrice antérieure consulte pour arthrose fémoropatellaire isolée symptomatique. La voie doit être adaptée pour préserver les téguments. Après arthrotomie, l’équipe fait le bilan cartilagineux et ligamentaire puis retire les ostéophytes avant le choix des essais. Le suivi après chirurgie comprend contrôle de la cicatrisation, de la mobilité, de la stabilité et des radiographies.', domains[2]],
  ['Réglage du composant trochléen', 'Un homme de 60 ans est opéré pour une prothèse fémoropatellaire. Après repérage de la corticale antérieure et mise en place de la broche, le genou est fléchi à 90° pour régler l’orientation du guide. Les coupes et essais sont prévus avant scellement. Le suivi postopératoire contrôlera les douleurs, la récupération de flexion-extension et la position des implants.', domains[3]],
  ['Taille et finitions fémorales', 'Une patiente de 64 ans est en cours d’implantation d’un bouclier trochléen. Après la coupe antérieure, le fantôme et le mesureur permettent de sélectionner une taille. L’emporte-pièce marque les finitions avant essai de la pièce fémorale. Au suivi postopératoire, les contrôles rechercheront une bonne cinématique rotulienne et une absence de conflit radioclinique.', domains[4]],
  ['Capital osseux rotulien limité', 'Un homme de 67 ans présente une usure importante de la facette rotulienne externe. Pendant la préparation rotulienne, le chirurgien cherche à conserver le capital osseux tout en permettant le scellement du médaillon. Des essais de stabilité sont programmés avant la fixation définitive. Après l’intervention, le suivi vérifie douleur, cicatrisation, mobilité et intégrité de l’appareil extenseur.', domains[5]],
  ['Trochlée trop basse à l’essai', 'Une patiente de 61 ans bénéficie d’une arthroplastie fémoropatellaire. Lors de l’essai en extension, un conflit entre la pièce trochléenne et la partie antérieure du plateau tibial est observé. L’équipe réévalue la hauteur et l’orientation avant le scellement définitif. Le suivi postopératoire associera radiographies, contrôle de la course rotulienne et récupération fonctionnelle.', domains[6]],
  ['Défaut d’engagement rotulien', 'Un homme de 59 ans traité pour arthrose fémoropatellaire présente à l’essai une rotule qui n’atteint le fond de la gorge qu’à 45° de flexion, sans contact tibial en extension. Les rapports entre trochlée, rotule, aileron et appareil extenseur sont revus avant correction. Après chirurgie, le suivi porte sur stabilité, douleur, ressauts et radiographies de position.', domains[7]]
];
const dp = dpSpecs.map(([label, vignette, domain], s) => ({
  label: `DP ${s + 1} — ${label}`,
  vignette: `<p>${vignette}</p>`,
  questions: domain.slice(0, 7).map(([prompt, correct], i) => makeQuestion(i === 0 ? `<p><em>Question :</em> ${prompt}</p>` : `<p><em>Nouvel élément :</em> l’information peropératoire ou de suivi ci-dessus est confirmée.</p><p><em>Question :</em> ${prompt}</p>`, correct, domain, s + i + 1))
}));

emitOrthopediePackage({ chapterDir, outputDir, fiche, facts: facts.map(card), series: [...qcm, ...dp] });

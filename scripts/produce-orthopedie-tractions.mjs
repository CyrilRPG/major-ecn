/**
 * Tractions et suspensions — production éditoriale source-à-source.
 * Les énoncés, cartes et corrections sont limités aux notions présentes
 * dans extract.json ; aucune phrase du corpus n'est découpée automatiquement.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { compileFicheModel } from './lib/orthopedie-fiche.mjs';

const chapterDir = resolve(process.argv[2] || '..\\.corpus-orthopedie\\tractions-et-suspensions-membre-inferieur-membre-superieur-rachis');
const outputDir = resolve(process.argv[3] || join(chapterDir, 'delivery', 'source-quality'));
mkdirSync(outputDir, { recursive: true });

const fig = (n, size = 'large') => ({ path: `img/img_${String(n).padStart(3, '0')}.png`, position: 'after', size });
const row = (concept, bullets, extra = {}) => ({ concept, bullets, ...extra });
const box = (kind, bullets) => ({ kind, bullets });

const fiche = {
  title: 'Tractions et suspensions (membre inférieur, membre supérieur, rachis)',
  year: '2025-2026',
  sourceBlocks: [9, 11, 13, 18, 22, 26, 31, 35, 43, 49, 55, 63, 68, 72, 80, 87, 94, 103, 112, 121, 132, 145, 159, 170, 181, 192, 201],
  parts: [
    { title: 'Principes et matériels de traction', sections: [
      { title: 'Rôle et choix de la traction', rows: [
        row('Objectifs', ['La traction réduit et maintient une fracture ou une luxation réduite.', 'Elle est utilisable en urgence, comme attente thérapeutique ou comme traitement définitif selon la lésion.', 'Elle peut faciliter le nursing grâce à une mobilisation relative du patient.'], { image: fig(1) }),
        row('Transmission de la force', ['La traction cutanée transmet la force à l’os par les parties molles.', 'La traction trans-squelettique applique la force sur une broche ou un clou implanté dans l’os.', 'Une contre-extension efficace conditionne l’efficacité de toute traction.']),
        box('piege', ['Un poids qui touche le sol, un nœud bloqué sur une poulie ou une butée neutralisent la traction.', 'Les poids ne sont jamais modifiés sans prescription médicale.']),
      ] },
      { title: 'Traction cutanée et traction squelettique', rows: [
        row('Traction collée cutanée', ['Les bandes adhésives sont collées sur la peau ; elles transmettent la traction par les tissus mous.', 'La peau est lavée et séchée ; le membre est nu, en légère traction et en rotation neutre.', 'Le dispositif comporte bande adhésive, protections malléolaires, platine, corde, gaze et poids.'], { image: fig(2, 'small') }),
        row('Limites cutanées', ['Les lésions cutanées, l’allergie aux adhésifs, les troubles vasculaires périphériques et l’incapacité à signaler un bandage serré sont des contre-indications.', 'Une force supérieure ou prolongée requiert une traction trans-squelettique.', 'La traction cutanée expose au décollement, aux lésions de pression et à la compression du nerf fibulaire commun.']),
        row('Traction squelettique', ['La broche est placée à distance de la fracture, en zone métaphysaire autour du fémur ou du tibia.', 'Le point d’entrée évite les structures vasculo-nerveuses, articulaires, tendineuses et les cartilages de croissance.', 'Le trajet doit rester hors d’une future zone d’ostéosynthèse pour limiter le risque infectieux.'], { image: fig(3) }),
      ] },
    ] },
    { title: 'Mise en œuvre au membre inférieur', sections: [
      { title: 'Broches, étriers et force de traction', rows: [
        row('Broches de Kirschner', ['Les broches de petit diamètre sont tendues sur un étrier et supportent une traction importante.', 'Des contraintes appliquées sur une zone osseuse étroite peuvent cisailler l’os ou induire une nécrose osseuse.', 'Deux broches parallèles sur un étrier limitent ce risque.']),
        row('Clou de Steinmann et broche filetée', ['Un clou de Steinmann de plus gros diamètre répartit mieux les contraintes.', 'Une broche filetée limite la mobilisation transversale et l’ostéolyse ; elle est plus stable à terme.', 'Ces implants sont fixés à un étrier de Böhler par des cavaliers permettant le réglage de rotation.'], { image: fig(4, 'small') }),
        row('Force et contre-traction', ['La force dépend de la fracture et est rapportée au poids corporel dans le cours.', 'La surélévation des pieds du lit assure la contre-extension en décubitus.', 'La traction devient inefficace lorsque le patient descend dans le lit jusqu’à ce que le poids touche le sol.']),
      ] },
      { title: 'Pose et contrôles de sécurité', rows: [
        row('Pose d’une broche', ['Après incision cutanée, la broche est introduite à vitesse lente pour éviter l’échauffement et la nécrose thermique.', 'La peau opposée est incisée lorsque la pointe la soulève, afin d’éviter une sortie sous tension.', 'La position intraosseuse et extra-articulaire est contrôlée cliniquement puis radiologiquement de face et de profil.'], { image: fig(5) }),
        row('Traction transtibiale', ['La broche est insérée de dehors en dedans pour éviter le nerf fibulaire commun.', 'Elle ne doit pas être trop profonde afin de préserver le pédicule tibial antérieur.', 'Elle doit néanmoins traverser une épaisseur osseuse suffisante pour ne pas couper l’os.'], { image: fig(6) }),
        row('Traction transcalcanéenne et transfémorale', ['La broche calcanéenne est introduite de dedans en dehors afin d’éviter le paquet tibial postérieur et l’articulation sous-talienne.', 'La traction transcondylienne transfémorale évite de solliciter les ligaments du genou.', 'La broche fémorale distale est insérée de dedans en dehors pour éviter l’artère fémorale.'], { image: fig(7) }),
      ] },
    ] },
    { title: 'Installation, surveillance et indications du membre inférieur', sections: [
      { title: 'Traction-suspension', rows: [
        row('Montage de Merle d’Aubigné', ['Une attelle en U avec hamac soutient le mollet sur une broche transtibiale.', 'Une traction verticale assure la suspension, une traction axiale règle le varus-valgus et une traction perpendiculaire règle la rotation.', 'Une chaussette collée avec petit poids maintient une flexion dorsale douce et permanente pour prévenir l’équin.'], { image: fig(9) }),
        row('Attelle de Boppe-Braun', ['Elle est placée à la racine de cuisse et installe le membre en flexion.', 'Ses montants peuvent traumatiser la face interne des cuisses.', 'Son encombrement limite les mouvements du patient.']),
        row('Confort et axe du membre', ['À efficacité égale, une traction-suspension libérant la face postérieure de cuisse et de genou est plus confortable.', 'Le talon reste dans le vide, le pied ne tombe pas en équin et l’attelle ne touche pas le pied du lit.', 'Le membre reste dans l’axe de traction, sans rotation anormale distale.']),
      ] },
      { title: 'Surveillance et complications', rows: [
        row('Surveillance cutanée', ['Le bandage doit empêcher le décollement sans être trop serré.', 'Une traction excessive peut causer excoriations, phlyctènes et escarres par glissement.', 'Un bandage trop serré expose à une paralysie fibulaire commune ou à un syndrome compartimental.']),
        row('Surveillance de broche', ['Le patient ne doit pas manipuler la broche ; les pansements sont quotidiens avec asepsie et compresses stériles antiseptiques.', 'Douleur, inflammation, écoulement, nécrose cutanée, ostéolyse ou ostéite sont des signes à rechercher.', 'En l’absence d’amélioration rapide, la broche est retirée, déplacée ou la traction est suspendue.'], { image: fig(10) }),
        row('Complications de décubitus', ['La douleur, la chaleur, la motricité et la sensibilité des orteils sont surveillées pour dépister un syndrome compartimental.', 'La prévention thromboembolique associe traitement préventif, mobilisation du côté sain et kinésithérapie.', 'La prévention cutanée repose sur l’inspection répétée des appuis, une literie sèche sans plis et la mobilisation.']),
      ] },
    ] },
    { title: 'Membre supérieur et rachis cervical', sections: [
      { title: 'Traction-suspension humérale', rows: [
        row('Place limitée', ['Les tractions du membre supérieur chez l’adulte sont exceptionnelles.', 'Les indications pour fractures de l’épaule ou fractures articulaires du coude sont rapportées comme abandonnées.', 'La traction-suspension peut être une solution temporaire pour une fracture de diaphyse humérale.']),
        row('Indications de la traction humérale', ['Elle est envisageable lorsqu’un plâtre pendant ou une immobilisation coude au corps ne peuvent être réalisés d’emblée.', 'Le polytraumatisé en réanimation ou les lésions thoraciques peuvent empêcher le traitement habituel.', 'Elle est retenue si l’ostéosynthèse paraît non indispensable ou trop risquée.'], { image: fig(12) }),
        row('Surveillance humérale', ['Il faut rechercher une souffrance du nerf radial par étirement.', 'Un écart interfragmentaire secondaire au relâchement musculaire impose de diminuer la traction.', 'Le traitement orthopédique habituel remplace la traction dès que le lever est possible.']),
      ] },
      { title: 'Étrier et halo crâniens', rows: [
        row('Étrier crânien', ['L’étrier de Crutchfield nécessite un forage ; l’étrier de Gardner-Wells peut être posé sans forage osseux.', 'Les pointeaux sont centrés dans le plan frontal, au-dessous du plus grand diamètre céphalique.', 'Ils évitent la fosse temporale, les vaisseaux temporaux et l’insertion du muscle temporal.'], { image: fig(13) }),
        row('Réglage de l’étrier', ['Un positionnement plus antérieur accentue l’extension cervicale ; un positionnement plus postérieur accentue la flexion.', 'La traction est modérée et ajustée aux radiographies de profil et à la réduction obtenue.', 'Des soins antiseptiques quotidiens sont réalisés aux pointeaux.']),
        row('Halo crânien', ['Le halo est un anneau fixé par quatre vis dynamométriques, deux frontales et deux pariéto-occipitales.', 'Il offre des axes de traction contrôlés et une tolérance locale prolongée.', 'Le halo-jacket relie le halo à un corset et permet la position assise ou debout.'], { image: fig(14) }),
      ] },
    ] },
    { title: 'Indications, réduction et traitement prolongé', sections: [
      { title: 'Indications du membre inférieur', rows: [
        row('Traitement temporaire', ['La traction collée peut être utilisée en attente chez une personne âgée avec fracture proximale du fémur non opérable d’emblée.', 'Chez le polytraumatisé, elle limite les déplacements douloureux et participe au damage control.', 'Elle peut être retenue si les parties molles imposent de différer l’intervention ou si un fixateur externe n’est pas disponible.']),
        row('Traitement complet', ['La traction peut réduire et maintenir jusqu’à consolidation certaines fractures complexes.', 'Le cours cite des indications supracondyliennes fémorales, de jambe, du cotyle et certaines situations de brûlure grave.', 'Les radiographies de contrôle guident l’adaptation progressive de la traction.']),
        row('Traction-mobilisation', ['Elle concerne certaines fractures des plateaux tibiaux accessibles à une réduction par traction.', 'Elle est retenue si la lésion est surtout de séparation, si le risque opératoire est élevé et si le décubitus prolongé est supportable.', 'La réduction est suivie radiologiquement et la mobilisation peut être réalisée par arthromoteur.'], { image: fig(11) }),
      ] },
      { title: 'Réduction et suivi du rachis cervical', rows: [
        row('Réduction urgente', ['L’étrier peut réduire certaines luxations cervicales fraîches sous anesthésie générale, curarisation et contrôle radioscopique.', 'Les fractures-luxations très déplacées, comminutives avec fragment intracanalaire ou les transsections discoligamentaires sont des contre-indications.', 'La manœuvre s’adapte au type lésionnel et au mécanisme d’accrochage articulaire.']),
        row('Traction continue', ['Pour une luxation ancienne, la traction continue est réalisée avec myorelaxants et antalgiques.', 'Une traction excessive expose à la surdistraction et à des lésions neurologiques.', 'L’augmentation du poids s’accompagne de contrôles radiologiques de profil répétés.']),
        row('Traitement orthopédique définitif', ['Le halo peut traiter une lésion insuffisamment stable pour une minerve.', 'Le halo-jacket permet le lever tout en maintenant une contention plus rigoureuse.', 'Toute traction chirurgicalement mise en place nécessite des contrôles réguliers de son efficacité et de ses dangers.'], { image: fig(15) }),
      ] },
    ] },
  ],
  synthesis: {
    chiffres: { headers: ['Repère', 'Valeur', 'Utilisation'], rows: [['Broche de Kirschner', '18–22/10', 'Traction squelettique'], ['Clou de Steinmann', '4–6 mm', 'Répartition des contraintes'], ['Traction cervicale modérée', '3–5 kg', 'Étrier ou halo, selon contrôles'], ['Halo', '4 pointeaux', 'Deux frontaux et deux postérieurs'], ['Surveillance cutanée', '4 fois/jour', 'Points d’appui en traction prolongée']] },
    tables: [
      { title: 'Choisir le type de traction', headers: ['Type', 'Transmission', 'Limites ou intérêt'], rows: [['Cutanée', 'Parties molles', 'Courte durée, peau et vasculature conditionnent l’emploi'], ['Squelettique', 'Broche ou clou osseux', 'Force durable ; surveillance de broche'], ['Traction-suspension', 'Broche + attelle + poids', 'Réglage axial, rotation et suspension'], ['Halo / étrier', 'Ancrage crânien', 'Réduction ou contention cervicale']] },
      { title: 'Contrôles indispensables', headers: ['Temps', 'À vérifier', 'Conséquence'], rows: [['Installation', 'Axe, contre-extension, poids libre', 'Traction efficace'], ['Broche', 'Intraosseux, extra-articulaire, radio de face/profil', 'Sécurité du trajet'], ['Chaque jour', 'Peau, orifices, douleur, inflammation', 'Détection infection ou compression'], ['Suivi', 'Réduction radiologique et tolérance', 'Adaptation ou arrêt de traction']] },
      { title: 'Complications : prévenir et réagir', headers: ['Risque', 'Prévention / dépistage', 'Réponse rapportée'], rows: [['Lésion cutanée', 'Bandage non serré, appuis inspectés', 'Réajuster le montage'], ['Infection de broche', 'Asepsie et pansement quotidien', 'Prélèvement, soins, retrait/déplacement si échec'], ['Syndrome compartimental', 'Douleur, chaleur, motricité, sensibilité', 'Alerte immédiate'], ['Perte de réduction cervicale', 'Contrôles radiologiques réguliers', 'Réévaluation de la contention']] },
      { title: 'Rachis : étrier, halo, halo-jacket', headers: ['Dispositif', 'Atout', 'Surveillance'], rows: [['Étrier', 'Réduction et traction réglable', 'Pointeaux, radios de profil'], ['Halo', 'Ancrage durable, axes contrôlés', 'Serrage, peau, douleur, stabilité'], ['Halo-jacket', 'Contention rigoureuse avec lever', 'Tolérance, réduction, complications de décubitus']] },
    ],
    keyPoints: ['La contre-extension et la liberté du poids conditionnent l’efficacité de la traction.', 'La traction cutanée est limitée par l’état cutané, vasculaire et la tolérance du patient.', 'Le trajet d’une broche évite les structures à risque et une future ostéosynthèse.', 'La surveillance de broche associe asepsie, examen local et contrôle radiologique.', 'La traction-suspension permet de régler suspension, axe et rotation.', 'Étrier et halo nécessitent une réduction et des contrôles radiologiques répétés.', 'La traction doit être réévaluée dès qu’un traitement définitif ou un lever devient possible.'],
    eclair: ['Toujours vérifier : axe, contre-extension, poulies libres et poids ne touchant pas le sol.', 'Cutanée : peau saine, bandage non compressif, durée et force limitées.', 'Squelettique : trajet sûr, broche lente, contrôles clinique et radiologique.', 'Surveillance : peau, orifices, douleur, motricité, sensibilité et réduction.', 'Traction-suspension : hamac, suspension, traction axiale et contrôle de rotation.', 'Humérus : surveiller le nerf radial et diminuer en cas d’écart secondaire.', 'Cervical : réduction guidée par radios ; halo pour contention prolongée et halo-jacket pour le lever.'],
  },
};

const card = (recto, verso, source) => ({ recto, verso, source });
const flashcards = [
  card('But d’une traction orthopédique ?', 'Réduire et maintenir<br>une fracture ou une luxation réduite', [9]),
  card('Trois contextes d’emploi d’une traction ?', 'Urgence, attente thérapeutique<br>ou traitement définitif', [9]),
  card('Intérêt de la traction pour le nursing ?', 'Permettre une certaine<br>mobilisation du patient', [9]),
  card('Comment la traction cutanée transmet-elle la force ?', 'Par les parties molles<br>jusqu’à l’os', [11]),
  card('Support de force de la traction squelettique ?', 'Une broche ou un clou<br>implanté dans l’os', [13]),
  card('Condition mécanique d’efficacité au lit ?', 'Une contre-extension<br>efficace', [26]),
  card('Effet d’un poids posé au sol ?', 'La traction devient<br>inefficace', [26]),
  card('Préparation de la peau avant traction collée ?', 'Peau lavée et séchée', [31]),
  card('Position du membre pour traction collée ?', 'Légère traction<br>et rotation neutre', [31]),
  card('Éléments d’un set de traction cutanée ?', 'Bande, protections, platine,<br>corde, gaze et poids', [31]),
  card('Contre-indication liée aux adhésifs ?', 'Allergie aux adhésifs', [11]),
  card('Lésion cutanée contre-indiquant une traction collée ?', 'Dermabrasion, lacération,<br>plaie ou ulcère', [11]),
  card('Trouble vasculaire limitant la traction collée ?', 'Troubles vasculaires périphériques', [11]),
  card('Pourquoi la confusion contre-indique-t-elle le bandage collé ?', 'Le patient ne peut pas signaler<br>un bandage trop serré', [11]),
  card('Quand préférer une traction trans-squelettique ?', 'Force supérieure ou prolongée<br>nécessaire', [11]),
  card('Site osseux privilégié autour du fémur/tibia ?', 'Zone métaphysaire', [13]),
  card('Pourquoi éviter la corticale diaphysaire ?', 'Risque de fissure osseuse<br>par appui', [13]),
  card('Structures à éviter lors du point d’entrée ?', 'Vaisseaux, nerfs, articulation,<br>tendons et cartilage de croissance', [13]),
  card('Pourquoi éloigner la broche d’une future ostéosynthèse ?', 'Limiter le risque infectieux', [22]),
  card('Diamètre rapporté des broches de Kirschner ?', '18–22/10', [24]),
  card('Risque d’une force concentrée sur une petite broche ?', 'Cisaillement ou nécrose<br>de l’os', [24]),
  card('Moyen de limiter le cisaillement avec des broches ?', 'Deux broches parallèles<br>sur un étrier', [24]),
  card('Diamètre rapporté d’un clou de Steinmann ?', '4–6 mm', [24]),
  card('Avantage d’un clou de Steinmann plus gros ?', 'Répartir mieux<br>les contraintes', [24]),
  card('Intérêt d’une broche filetée ?', 'Limiter la mobilité transversale<br>et l’ostéolyse', [24]),
  card('Rôle des cavaliers d’un étrier de Böhler ?', 'Fixer la broche et régler<br>la rotation', [24]),
  card('Direction d’insertion transtibiale ?', 'De dehors en dedans', [35]),
  card('Nerf protégé par la voie transtibiale externe-interne ?', 'Nerf fibulaire commun', [35]),
  card('Vaisseau à préserver lors d’une broche tibiale peu profonde ?', 'Pédicule tibial antérieur', [35]),
  card('Pourquoi la broche tibiale doit-elle rester suffisamment profonde ?', 'Pour ne pas couper<br>le diamètre osseux', [35]),
  card('Direction d’insertion transcalcanéenne ?', 'De dedans en dehors', [35]),
  card('Structures évitées par la voie calcanéenne interne-externe ?', 'Paquet tibial postérieur<br>et articulation sous-talienne', [35]),
  card('Intérêt de la traction transfémorale distale ?', 'Ne pas solliciter<br>les ligaments du genou', [35]),
  card('Direction d’insertion fémorale distale ?', 'De dedans en dehors', [35]),
  card('Artère à préserver lors de la broche fémorale distale ?', 'Artère fémorale', [35]),
  card('Pourquoi percer lentement une broche de traction ?', 'Éviter échauffement<br>et nécrose thermique', [33]),
  card('Que faire lorsque la pointe soulève la peau opposée ?', 'Inciser la peau opposée<br>pour une sortie sans tension', [33]),
  card('Contrôle clinique d’une position intraosseuse ?', 'Broche fixe à la mobilisation<br>transversale', [33]),
  card('Contrôle d’une position extra-articulaire ?', 'Mobilité articulaire voisine<br>normale et indolore', [33]),
  card('Imagerie de contrôle d’une broche ?', 'Radiographies de face<br>et de profil', [33]),
  card('Support du mollet dans une traction-suspension ?', 'Attelle en U avec hamac', [43]),
  card('Rôle de la traction verticale du montage de Merle d’Aubigné ?', 'Assurer la suspension', [43]),
  card('Rôle de la traction axiale du montage de Merle d’Aubigné ?', 'Régler le varus-valgus', [43]),
  card('Rôle de la traction perpendiculaire ?', 'Régler la rotation', [43]),
  card('Prévention de l’équin dans ce montage ?', 'Chaussette collée et petit poids<br>en flexion dorsale', [43]),
  card('Pourquoi surélever les pieds du lit ?', 'Assurer la contre-extension<br>par le poids du patient', [43]),
  card('Position du talon dans une traction-suspension ?', 'Dans le vide', [63]),
  card('Contact à éviter entre attelle et lit ?', 'L’attelle ne touche pas<br>le pied du lit', [63]),
  card('Qui décide d’une modification des poids ?', 'Le médecin prescripteur', [63]),
  card('Lésion cutanée d’une traction trop forte ?', 'Excoriation, phlyctène<br>ou escarre', [55]),
  card('Risque neurologique d’un bandage trop serré ?', 'Paralysie du nerf fibulaire commun', [55]),
  card('Autre complication d’un bandage trop serré ?', 'Syndrome compartimental', [55]),
  card('Consigne donnée au patient porteur de broche ?', 'Ne pas toucher la broche', [57]),
  card('Fréquence des pansements de broche ?', 'Quotidienne', [57]),
  card('Matériel de recouvrement d’un orifice de broche ?', 'Compresses stériles<br>avec antiseptique', [57]),
  card('Premier signe local d’infection de broche ?', 'Douleur et peau inflammatoire<br>à l’orifice', [57]),
  card('Signe radiologique possible d’infection de broche ?', 'Ostéolyse ou ostéite', [57]),
  card('Examen microbiologique en cas d’infection de broche ?', 'Prélèvement avec antibiogramme', [57]),
  card('Conduite si infection de broche sans amélioration rapide ?', 'Retrait, déplacement<br>ou arrêt de traction', [57]),
  card('Conduite devant mobilité transversale anormale de broche ?', 'Pansement ferme entre peau<br>et étrier', [57]),
  card('Cause osseuse d’une broche qui ne tient plus ?', 'Os ostéoporotique<br>ou trajet inadéquat', [57]),
  card('Préparation avant ablation de broche ?', 'Antisepsie et recoupe<br>au plus près de la peau', [59]),
  card('Geste complémentaire lors de l’ablation si infection ?', 'Lavage, curetage et parage<br>des orifices', [59]),
  card('Surveillance neurologique en traction de jambe ?', 'Douleur, chaleur, motricité<br>et sensibilité des orteils', [68]),
  card('Prévention thromboembolique rapportée ?', 'Traitement préventif<br>et mobilisation encadrée', [68]),
  card('Fréquence d’inspection des appuis rapportée ?', 'Quatre fois par jour', [68]),
  card('Qualités de la literie sous traction ?', 'Propre, sèche<br>et sans plis', [68]),
  card('Prévention de la raideur sous traction prolongée ?', 'Exercices actifs, passifs<br>et kinésithérapie', [68]),
  card('Place des tractions du membre supérieur chez l’adulte ?', 'Exceptionnelles', [145]),
  card('Situation où la traction humérale peut être temporaire ?', 'Plâtre pendant impossible d’emblée', [145]),
  card('Pourquoi un polytraumatisé peut-il nécessiter une traction humérale ?', 'Lésions associées empêchant<br>le lever', [145]),
  card('Nerf à surveiller dans une traction humérale ?', 'Nerf radial', [151]),
  card('Conduite devant un écart huméral secondaire ?', 'Diminuer la traction', [151]),
  card('Quand remplacer la traction humérale ?', 'Dès que le lever est possible', [151]),
  card('Différence clé Crutchfield / Gardner-Wells ?', 'Crutchfield : forage ;<br>Gardner-Wells : sans forage', [159]),
  card('Plan de centrage d’un étrier crânien ?', 'Plan frontal', [170]),
  card('Zone temporale à éviter pour les pointeaux ?', 'Fosse temporale', [170]),
  card('Effet d’un étrier placé plus en avant ?', 'Accentue l’extension cervicale', [170]),
  card('Effet d’un étrier placé plus en arrière ?', 'Accentue la flexion cervicale', [170]),
  card('Ordre de grandeur de la traction cervicale modérée ?', '3–5 kg', [172]),
  card('Contrôle radiologique de la traction cervicale ?', 'Clichés de profil répétés', [172]),
  card('Nombre de vis d’ancrage d’un halo ?', 'Quatre vis dynamométriques', [181]),
  card('Répartition des vis du halo ?', 'Deux frontales et deux<br>pariéto-occipitales', [181]),
  card('Avantage de l’anneau halo sur l’étrier ?', 'Axes de traction<br>parfaitement contrôlés', [181]),
  card('Réglage de l’inclinaison latérale avec halo ?', 'Tirer davantage d’un côté', [181]),
  card('Réglage flexion-extension avec halo ?', 'Traction sur partie antérieure<br>ou postérieure de l’anneau', [181]),
  card('Position des yeux lors de l’insertion du halo ?', 'Yeux clos', [192]),
  card('Pourquoi serrer les pointeaux opposés simultanément ?', 'Éviter le décentrage<br>de l’anneau', [192]),
  card('Quand recontrôler le serrage du halo ?', 'Après quelques jours<br>ou si douleur à la mobilisation', [192]),
  card('But du coussin sous les épaules avec halo ?', 'Éviter que le halo fléchisse<br>le rachis contre le lit', [192]),
  card('Intérêt du halo pour une réduction cervicale ?', 'Manœuvres de réduction<br>puis immobilisation', [194]),
  card('Intérêt fonctionnel du halo-jacket ?', 'Autoriser la position assise<br>ou debout', [196]),
  card('Pourquoi le halo-jacket est-il utile chez un patient peu coopérant ?', 'Contention plus rigoureuse<br>qu’une minerve', [196]),
  card('Pourquoi des radios régulières avec halo ?', 'Stabilité relative et risque<br>de perte de réduction', [201]),
  card('Complication infectieuse possible du halo ?', 'Infection des pointeaux<br>avec perte de tenue', [201]),
  card('Complication neurologique grave possible du halo ?', 'Atteinte nerveuse ou cérébrale<br>par perforation', [201]),
  card('Complication respiratoire favorisée chez tétraplégique avec halo ?', 'Complications respiratoires<br>et escarres', [201]),
  card('Cause de dysphagie sous halo ?', 'Hyperextension de la tête<br>et du cou', [201]),
  card('Situation cervicale réduite par traction urgente ?', 'Luxation fraîche sous contrôle<br>radioscopique', [207]),
  card('Contre-indication cervicale liée au canal rachidien ?', 'Fragment intracanalaire', [207]),
  card('Risque d’une traction cervicale excessive ?', 'Surdistraction et lésions neurologiques', [210]),
  card('Pourquoi répéter les radios lors d’augmentation du poids ?', 'Adapter la traction<br>à la réduction obtenue', [210]),
  card('Place du halo si minerve insuffisante ?', 'Traitement orthopédique<br>de la lésion instable', [214]),
  card('Principe commun à toutes les tractions chirurgicales ?', 'Critères anatomiques précis<br>et surveillance régulière', [214]),
];

const q = (enonce, correct, wrong, source) => ({ enonce, correction_generale: `Correction fondée sur les blocs source ${source.join(', ')} du collège d’Orthopédie.`, items: [{ enonce: correct, is_correct: true, justification: `Conforme au chapitre : ${correct}` }, ...wrong.map((enonceItem) => ({ enonce: enonceItem, is_correct: false, justification: `Non conforme au chapitre pour cette situation : ${enonceItem}` }))].slice(0, 5).map((item, i) => ({ ...item, lettre: String.fromCharCode(65 + i) })) });
const mcq = [
  ['QCM 1 · Principes et traction cutanée', [
    q('Lors de l’installation d’une traction au lit, quel élément conditionne sa transmission efficace ?', 'La contre-extension doit être efficace.', ['Le poids peut reposer sur le sol.', 'Un nœud sur une poulie améliore l’efficacité.', 'Le poids est modifié librement par le patient.', 'La rotation du membre est sans importance.'], [9, 26]),
    q('Quelle situation contre-indique une traction collée ?', 'Une plaie ou une lésion cutanée au membre concerné.', ['Une peau lavée et séchée.', 'Une rotation neutre du membre.', 'Une poulie au pied du lit.', 'Une légère traction initiale.'], [11, 31]),
    q('Quelle est la modalité de transmission d’une traction cutanée ?', 'La force est transmise par les parties molles vers l’os.', ['La force est appliquée par une broche osseuse.', 'La force est transmise par une plaque verrouillée.', 'La force ne nécessite pas de contre-extension.', 'La force s’exerce uniquement sur une articulation.'], [11]),
    q('Quel incident justifie le recours à une traction trans-squelettique ?', 'Besoin d’une force importante et prolongée.', ['Présence d’une peau saine.', 'Possibilité de signaler une douleur.', 'Membre en rotation neutre.', 'Utilisation d’une gaze.'], [11]),
    q('Pourquoi le bandage d’une traction collée ne doit-il pas être trop serré ?', 'Il expose à une atteinte fibulaire commune ou à un syndrome compartimental.', ['Il empêche toute transmission de traction.', 'Il supprime le risque cutané.', 'Il améliore toujours la vascularisation.', 'Il rend inutile la surveillance.'], [55]),
  ]],
  ['QCM 2 · Traction squelettique', [
    q('Quel choix de site est rapporté pour une broche autour du fémur ou du tibia ?', 'Une zone métaphysaire à distance de la fracture.', ['La corticale diaphysaire systématiquement.', 'Le foyer de fracture.', 'Une articulation voisine.', 'Une future voie d’ostéosynthèse.'], [13]),
    q('Quel danger doit être anticipé avant le point d’entrée de broche ?', 'Le voisinage vasculo-nerveux et articulaire.', ['La seule couleur du pansement.', 'La vitesse du fauteuil.', 'La taille de la chambre.', 'Le type de literie.'], [13]),
    q('Pourquoi une broche est-elle introduite lentement ?', 'Pour prévenir l’échauffement et la nécrose thermique osseuse.', ['Pour créer une traction cutanée.', 'Pour éviter toute radiographie.', 'Pour augmenter l’équin.', 'Pour remplacer les soins locaux.'], [33]),
    q('Quel contrôle confirme une position correcte de broche ?', 'Un contrôle clinique complété par des clichés de face et de profil.', ['La seule inspection du poids.', 'La disparition immédiate de toute douleur.', 'Le serrage maximal du bandage.', 'L’absence de traction.'], [33]),
    q('Pourquoi éviter le trajet d’une future ostéosynthèse ?', 'Pour limiter le risque infectieux potentiel.', ['Pour diminuer la contre-extension.', 'Pour supprimer le contrôle radiologique.', 'Pour prévenir l’équin.', 'Pour traiter l’ostéoporose.'], [22]),
  ]],
  ['QCM 3 · Sites de traction du membre inférieur', [
    q('Quelle direction d’insertion protège le nerf fibulaire commun lors d’une traction transtibiale ?', 'De dehors en dedans.', ['De dedans en dehors.', 'D’avant en arrière.', 'De haut en bas.', 'Sans traverser l’os.'], [35]),
    q('Quelle précaution concerne la profondeur d’une broche transtibiale ?', 'Éviter le pédicule tibial antérieur tout en assurant une prise osseuse suffisante.', ['Rester toujours extra-osseux.', 'Traverser le foyer de fracture.', 'Placer la broche dans une articulation.', 'Supprimer tout contrôle de position.'], [35]),
    q('Quelle direction est rapportée pour la broche transcalcanéenne ?', 'De dedans en dehors.', ['De dehors en dedans.', 'De bas en haut.', 'De haut en bas.', 'Sans trajet transosseux.'], [35]),
    q('Quel avantage a une traction transcondylienne transfémorale ?', 'Elle évite de solliciter les ligaments du genou.', ['Elle supprime tout besoin de radiographie.', 'Elle transmet la force par la peau.', 'Elle corrige automatiquement l’équin.', 'Elle rend le nursing impossible.'], [35]),
    q('Quel matériel répartit mieux les contraintes osseuses ?', 'Un clou de Steinmann de plus gros diamètre.', ['Une bande adhésive seule.', 'Une broche sans étrier.', 'Un nœud sur une poulie.', 'Un bandage serré.'], [24]),
  ]],
  ['QCM 4 · Traction-suspension et contrôle d’axe', [
    q('Dans le montage de Merle d’Aubigné, quelle traction règle le varus-valgus ?', 'La traction axiale.', ['La traction verticale seule.', 'La traction par halo.', 'La traction cutanée seule.', 'La traction sans poids.'], [43]),
    q('Dans ce montage, quel réglage contrôle la rotation ?', 'Une traction perpendiculaire.', ['Une simple surélévation du lit.', 'Une diminution du poids à zéro.', 'Un pansement de broche.', 'Un halo-jacket.'], [43]),
    q('Quel dispositif participe à la prévention de l’équin ?', 'Une chaussette collée avec petit poids.', ['Une attelle en contact avec le lit.', 'Un bandage très serré.', 'Un poids posé au sol.', 'Une absence de suspension.'], [43]),
    q('Quelle position du talon est recherchée ?', 'Le talon reste dans le vide.', ['Le talon repose sur le cadre du lit.', 'Le pied tombe en équin.', 'Le membre est en rotation libre.', 'L’attelle appuie sur le tendon d’Achille.'], [63]),
    q('Quelle vérification est nécessaire si la traction paraît inefficace ?', 'Absence de butée neutralisant la traction.', ['Augmentation non prescrite des poids.', 'Suppression de la contre-extension.', 'Retrait de l’attelle.', 'Arrêt des contrôles cutanés.'], [63]),
  ]],
  ['QCM 5 · Surveillance au membre inférieur', [
    q('Quel signe évoque une infection de broche ?', 'Douleur avec peau inflammatoire et écoulement à l’orifice.', ['Une peau sèche sans douleur.', 'Une rotation neutre.', 'Un talon dans le vide.', 'Une poulie libre.'], [57]),
    q('Quel examen guide l’antibiothérapie d’une infection de broche ?', 'Prélèvement avec antibiogramme.', ['Mesure de la longueur du membre.', 'Électrocardiogramme seul.', 'Photographie de la poulie.', 'Test de force musculaire isolé.'], [57]),
    q('Quelle conduite est rapportée si l’infection locale ne s’améliore pas rapidement ?', 'Retirer ou déplacer la broche, ou suspendre la traction.', ['Augmenter librement le poids.', 'Serrer davantage le bandage.', 'Supprimer les pansements.', 'Maintenir la broche sans réévaluation.'], [57]),
    q('Quels éléments neurologiques sont surveillés dans une traction de jambe ?', 'Douleur, chaleur, motricité et sensibilité des orteils.', ['Uniquement la température de la chambre.', 'La couleur de l’étrier seul.', 'La taille du pansement seul.', 'Le nombre de poulies seul.'], [68]),
    q('Quelle mesure réduit le risque d’escarres ?', 'Inspection régulière des appuis et literie sèche sans plis.', ['Immobilisation sans aucun contrôle.', 'Bandage plus serré.', 'Poids au sol.', 'Suppression de la kinésithérapie.'], [68]),
  ]],
  ['QCM 6 · Membre supérieur', [
    q('Quelle est la place des tractions du membre supérieur chez l’adulte ?', 'Elles sont exceptionnelles.', ['Elles sont systématiques.', 'Elles remplacent toute immobilisation.', 'Elles sont indiquées pour chaque fracture de coude.', 'Elles ne nécessitent aucun suivi.'], [145]),
    q('Quelle situation peut justifier temporairement une traction-suspension humérale ?', 'Impossibilité initiale d’un plâtre pendant ou d’un coude au corps.', ['Mise au fauteuil déjà possible.', 'Absence complète de fracture.', 'Nerf radial normal sans lésion.', 'Peau intacte seule.'], [145]),
    q('Quel nerf doit être surveillé dans une traction humérale ?', 'Le nerf radial.', ['Le nerf fibulaire commun.', 'Le nerf tibial postérieur.', 'Le nerf optique.', 'Le nerf facial.'], [151]),
    q('Que faire si un écart interfragmentaire huméral apparaît après relâchement musculaire ?', 'Diminuer la traction.', ['Augmenter systématiquement le poids.', 'Arrêter tout contrôle radiologique.', 'Ajouter un halo.', 'Serrer le bandage.'], [151]),
    q('Quand la traction humérale doit-elle être remplacée ?', 'Dès que le lever devient possible.', ['Après disparition de l’étrier.', 'Quand le poids touche le sol.', 'Avant tout contrôle clinique.', 'Jamais.'], [151]),
  ]],
  ['QCM 7 · Étrier et halo', [
    q('Quelle différence caractérise l’étrier de Gardner-Wells ?', 'Il peut être posé sans forage osseux.', ['Il n’a aucun pointeau.', 'Il ne permet aucune traction.', 'Il se place dans le tibia.', 'Il remplace le halo-jacket.'], [159]),
    q('Quel effet a un étrier placé plus antérieurement ?', 'Il accentue l’extension du rachis.', ['Il impose une flexion.', 'Il supprime toute traction.', 'Il agit sur le varus du genou.', 'Il traite un équin.'], [170]),
    q('Quelle force est rapportée pour une traction cervicale modérée ?', '3 à 5 kg selon contrôle radiologique.', ['Aucun poids.', 'Une force non contrôlée.', 'Une traction cutanée de jambe.', 'Un poids laissé au sol.'], [172]),
    q('Quelle est la constitution d’un halo crânien ?', 'Un anneau fixé par quatre vis dynamométriques.', ['Deux bandes adhésives.', 'Une broche tibiale unique.', 'Un clou de Steinmann sans étrier.', 'Une plaque à vis.'], [181]),
    q('Pourquoi serrer les pointeaux opposés en même temps ?', 'Pour éviter le décentrage de l’anneau.', ['Pour créer une flexion de genou.', 'Pour supprimer les soins locaux.', 'Pour éviter les radios.', 'Pour augmenter l’équin.'], [192]),
  ]],
  ['QCM 8 · Indications et suivi cervical', [
    q('Quelle lésion peut relever d’une réduction urgente sous étrier ?', 'Une luxation cervicale fraîche, sous contrôle radioscopique.', ['Une fracture avec fragment intracanalaire.', 'Une transsection discoligamentaire.', 'Une fracture-luxation très comminutive.', 'Une lésion sans contrôle radiologique.'], [207]),
    q('Quelle situation contre-indique la traction cervicale de réduction ?', 'Un fragment intracanalaire.', ['Une luxation fraîche contrôlée.', 'Un cliché de profil disponible.', 'Une anesthésie générale.', 'Une réduction obtenue.'], [207]),
    q('Quel risque fait éviter une traction cervicale excessive ?', 'Surdistraction avec risque neurologique.', ['Prévention des escarres.', 'Amélioration de la réduction.', 'Diminution des soins de pointeaux.', 'Suppression du halo.'], [210]),
    q('Pourquoi répéter les radiographies lors de l’augmentation de traction ?', 'Pour adapter le poids à la réduction obtenue.', ['Pour décider seul du pansement.', 'Pour mesurer la force des bandes.', 'Pour supprimer la surveillance clinique.', 'Pour prévoir l’équin.'], [210]),
    q('Quelle est une indication du halo en traitement définitif ?', 'Lésion insuffisamment stable pour une minerve.', ['Traction cutanée de jambe.', 'Lésion sans besoin de contention.', 'Plaie cutanée de cuisse.', 'Syndrome compartimental.'], [214]),
  ]],
];

const dpSpecs = [
  ['DP 1 · Traction collée de transition', '<p>Une <strong>patiente de 84 ans</strong> est hospitalisée pour une fracture proximale du fémur. L’intervention doit être différée après bilan préopératoire. La peau de la jambe est intacte, elle peut communiquer et l’équipe décide une traction collée d’attente.</p><p>Au <strong>suivi quotidien</strong>, l’équipe contrôle l’axe, la peau, la tolérance du bandage et l’efficacité du montage avant la stratégie définitive.</p>', [11, 31, 55, 72]],
  ['DP 2 · Traction transtibiale', '<p>Un <strong>homme de 32 ans</strong> présente une fracture autour du genou nécessitant une traction trans-squelettique. Après repérage anatomique, une broche transtibiale est prévue et une radiographie de contrôle est programmée.</p><p>Au <strong>suivi postopératoire</strong>, la stabilité de la broche, la sensibilité des orteils, l’état cutané et la réduction sont réévalués.</p>', [13, 33, 35, 57, 68]],
  ['DP 3 · Traction-suspension', '<p>Un <strong>patient de 45 ans</strong> est installé en traction-suspension du membre inférieur. Une attelle en U avec hamac soutient le mollet ; le montage doit corriger suspension, axe et rotation sans créer d’équin.</p><p>Au <strong>contrôle de garde</strong>, la position du talon, la liberté des poids, la contre-extension et les zones d’appui sont vérifiées.</p>', [43, 63, 68]],
  ['DP 4 · Infection de broche', '<p>Une <strong>femme de 58 ans</strong> sous traction squelettique signale une douleur croissante au niveau d’un orifice de broche. L’examen note une inflammation locale et un écoulement ; le montage doit être maintenu seulement s’il reste sûr.</p><p>Lors du <strong>suivi des jours suivants</strong>, l’équipe organise soins locaux, prélèvements et réévalue l’indication d’un retrait ou d’un déplacement de broche.</p>', [57, 59]],
  ['DP 5 · Fracture de diaphyse humérale', '<p>Un <strong>homme de 37 ans</strong>, polytraumatisé en réanimation, présente une fracture de diaphyse humérale. Les lésions associées empêchent initialement un plâtre pendant et le lever. Une traction-suspension temporaire est retenue.</p><p>Au <strong>suivi radioclinique</strong>, l’équipe recherche une souffrance radiale, un écart interfragmentaire secondaire et prépare le relais dès que le lever est possible.</p>', [145, 151]],
  ['DP 6 · Luxation cervicale fraîche', '<p>Une <strong>patiente de 29 ans</strong> est admise après traumatisme cervical avec luxation fraîche. La réduction est discutée au bloc sous anesthésie générale, curarisation et contrôle de l’amplificateur de brillance.</p><p>Au <strong>suivi immédiat</strong>, les clichés de profil guident la traction et l’équipe recherche une situation où la manœuvre serait contre-indiquée.</p>', [170, 207, 210]],
  ['DP 7 · Halo prolongé', '<p>Un <strong>patient de 51 ans</strong> a une lésion cervicale jugée insuffisamment stable pour une minerve. Un halo est choisi pour assurer une contention prolongée ; un halo-jacket est envisagé pour permettre le lever.</p><p>Lors du <strong>suivi programmé</strong>, l’équipe contrôle le serrage, l’état des pointeaux, la stabilité radiologique et la tolérance fonctionnelle.</p>', [181, 192, 196, 201, 214]],
  ['DP 8 · Fracture complexe du membre inférieur', '<p>Un <strong>homme de 40 ans</strong> polytraumatisé présente une fracture fémorale associée à des lésions multiviscérales prioritaires. Une traction temporaire est utilisée dans une stratégie de damage control afin de limiter les déplacements douloureux en attendant la stabilisation générale.</p><p>Au <strong>suivi quotidien</strong>, la réduction, la peau, le risque thromboembolique et l’indication du traitement définitif sont réévalués.</p>', [72, 68, 80]],
];

const dpBase = [
  [q('Quelle condition permet une traction collée ?', 'Une peau intacte et un patient capable de signaler une compression.', ['Une plaie profonde au site de collage.', 'Une allergie aux adhésifs.', 'Un trouble vasculaire périphérique majeur.', 'Un patient incapable d’alerter.'], [11]), q('Quelle préparation cutanée est attendue ?', 'Peau lavée et séchée.', ['Peau couverte de plâtre.', 'Bandage serré avant inspection.', 'Absence de protection malléolaire.', 'Membre non aligné.'], [31]), q('Quel signe cutané impose une réévaluation ?', 'Excoriation, phlyctène ou escarre.', ['Poulie libre.', 'Rotation neutre.', 'Poids suspendu.', 'Linge sec.'], [55]), q('Quelle erreur neutralise la traction ?', 'Poids reposant sur le sol.', ['Pieds du lit surélevés.', 'Poulie fonctionnelle.', 'Membre dans l’axe.', 'Contre-extension efficace.'], [26]), q('Quel risque expose un bandage trop serré ?', 'Paralysie fibulaire commune ou syndrome compartimental.', ['Consolidation trop rapide.', 'Halo mal serré.', 'Écart huméral.', 'Ostéolyse crânienne.'], [55]), q('Quel élément de suivi doit être réévalué avant le traitement définitif ?', 'La tolérance cutanée et l’efficacité de la traction.', ['La seule couleur des draps.', 'La hauteur du fauteuil.', 'Le type de halo.', 'La taille de la chambre.'], [55])],
  [q('Quel trajet est choisi pour une broche transtibiale ?', 'De dehors en dedans.', ['De dedans en dehors.', 'Dans une articulation.', 'Dans le foyer de fracture.', 'Sans repérage.'], [35]), q('Pourquoi contrôler par radiographies de face et profil ?', 'Vérifier le placement adéquat de la broche.', ['Mesurer la force musculaire.', 'Remplacer l’examen clinique.', 'Supprimer les pansements.', 'Modifier librement les poids.'], [33]), q('Quelle structure est protégée par la direction externe-interne ?', 'Le nerf fibulaire commun.', ['Le nerf radial.', 'Le nerf facial.', 'Le nerf optique.', 'Le nerf médian.'], [35]), q('Quel signe doit être recherché aux orifices ?', 'Inflammation et écoulement.', ['Un plan de lit surélevé.', 'Une flexion de coude.', 'Un halo-jacket.', 'Une broche canulée.'], [57]), q('Quelle surveillance dépiste une complication ischémique ?', 'Douleur, chaleur, motricité et sensibilité des orteils.', ['Mesure du poids seul.', 'Inspection du plafond.', 'Mobilité de l’épaule seule.', 'Couleur de la poulie.'], [68]), q('Que faire si la broche ne tient plus sur os insuffisant ?', 'La replacer après réévaluation.', ['Augmenter le poids sans avis.', 'Ne plus surveiller.', 'Serrer le bandage.', 'Supprimer les radios.'], [57])],
  [q('Quel élément assure la suspension du montage ?', 'Une traction verticale.', ['Une traction sans poids.', 'Un halo.', 'Un bandage serré.', 'Une plaque.'], [43]), q('Quelle traction règle le varus-valgus ?', 'La traction axiale.', ['La traction verticale seule.', 'La traction cutanée seule.', 'La traction par halo.', 'Aucune traction.'], [43]), q('Quelle traction règle la rotation ?', 'Une traction perpendiculaire.', ['Une traction axiale seule.', 'Une traction sans poulie.', 'Un pansement de broche.', 'Un poids au sol.'], [43]), q('Quelle position du talon est recherchée ?', 'Dans le vide.', ['Au contact du cadre du lit.', 'Sous le poids.', 'En appui permanent.', 'Dans un plâtre.'], [63]), q('Quel dispositif lutte contre l’équin ?', 'Chaussette collée avec petit poids.', ['Broche radiale.', 'Halo-jacket.', 'Bandage compressif.', 'Poulie bloquée.'], [43]), q('Quel contrôle de suivi est prioritaire ?', 'Axe, poids libre et absence de pression cutanée.', ['Suppression de toute mobilisation.', 'Ajout d’un halo.', 'Arrêt des soins.', 'Absence de contre-extension.'], [63, 68])],
  [q('Quel tableau évoque une infection de broche ?', 'Douleur, inflammation et écoulement local.', ['Peau saine et indolore.', 'Poulie libre.', 'Rotation neutre.', 'Talon dans le vide.'], [57]), q('Quel soin est réalisé quotidiennement ?', 'Pansement aseptique des orifices.', ['Aucun soin local.', 'Serrage du bandage.', 'Modification libre des poids.', 'Suppression de l’étrier.'], [57]), q('Quel examen est réalisé si une infection est suspectée ?', 'Prélèvement avec antibiogramme.', ['Radiographie du crâne uniquement.', 'Mesure du tour de cuisse seule.', 'Épreuve d’effort.', 'Échographie de l’épaule.'], [57]), q('Quelle conduite en l’absence d’amélioration rapide ?', 'Retirer, déplacer la broche ou suspendre la traction.', ['Maintenir sans contrôle.', 'Augmenter les poids.', 'Supprimer les antiseptiques.', 'Ignorer les signes locaux.'], [57]), q('Comment préparer l’ablation de la broche ?', 'Antisepsie et recoupe proche de la peau.', ['Laisser une longue tige externe.', 'Omettre tout pansement.', 'Mettre le poids au sol.', 'Éviter tout lavage.'], [59]), q('Quel geste peut compléter l’ablation si infection patente ?', 'Lavage, curetage et parage des orifices.', ['Pose d’un halo.', 'Mise en charge forcée.', 'Plâtre pendant.', 'Mobilisation sans contrôle.'], [59])],
  [q('Pourquoi la traction humérale est-elle retenue ici ?', 'Le plâtre pendant est impossible d’emblée.', ['Elle est toujours le traitement définitif.', 'Elle ne nécessite pas de surveillance.', 'Elle traite une lésion cervicale.', 'Elle remplace le lever.'], [145]), q('Quel nerf est surveillé ?', 'Le nerf radial.', ['Le nerf fibulaire commun.', 'Le nerf tibial.', 'Le nerf facial.', 'Le nerf optique.'], [151]), q('Quel élément radiologique peut apparaître après relâchement musculaire ?', 'Un écart interfragmentaire.', ['Une traction axiale de jambe.', 'Un halo-jacket.', 'Un équin obligatoire.', 'Un clou tibial.'], [151]), q('Quelle adaptation est indiquée devant cet écart ?', 'Diminuer la traction.', ['Augmenter sans contrôle.', 'Ne plus surveiller.', 'Ajouter un bandage serré.', 'Arrêter les radiographies.'], [151]), q('Quel événement permet le relais thérapeutique ?', 'La possibilité de lever le patient.', ['La pose d’un halo.', 'La présence d’une poulie.', 'Le passage de la nuit.', 'La fin du pansement.'], [151]), q('Quel objectif du suivi est prioritaire ?', 'Prévenir étirement radial et diastasis secondaire.', ['Supprimer toute mobilisation.', 'Augmenter tous les poids.', 'Éviter le contrôle clinique.', 'Ne pas préparer de relais.'], [151])],
  [q('Quel cadre est requis pour une réduction cervicale urgente ?', 'Anesthésie générale, curarisation et contrôle radioscopique.', ['Traction sans imagerie.', 'Pansement de broche tibiale.', 'Mobilisation libre.', 'Halo-jacket sans réduction.'], [207]), q('Quel examen guide l’adaptation de la traction ?', 'Clichés radiographiques de profil.', ['Inspection du pansement seule.', 'Mesure du poids corporel seule.', 'Examen de l’épaule.', 'Épreuve cutanée.'], [172, 210]), q('Quelle lésion est une contre-indication ?', 'Fragment intracanalaire.', ['Luxation fraîche contrôlée.', 'Réduction obtenue.', 'Coussin sous épaules.', 'Étrier centré.'], [207]), q('Quel risque fait éviter une traction trop forte ?', 'Surdistraction et lésion neurologique.', ['Prévention de l’équin.', 'Amélioration du pansement.', 'Stabilisation d’une broche tibiale.', 'Réduction de l’escarre.'], [210]), q('Quel effet a un étrier trop antérieur ?', 'Accentuation de l’extension cervicale.', ['Flexion obligatoire.', 'Correction du varus.', 'Traitement du pied équin.', 'Suppression des soins.'], [170]), q('Quel principe domine le suivi immédiat ?', 'Adapter la traction à la réduction radiologique.', ['Modifier les poids sans contrôle.', 'Éviter les clichés.', 'Maintenir sans examen.', 'Diminuer la vigilance neurologique.'], [210])],
  [q('Quel matériel fixe un halo au crâne ?', 'Quatre vis dynamométriques.', ['Deux bandes collées.', 'Une broche tibiale.', 'Une plaque DCP.', 'Un clou fémoral.'], [181]), q('Pourquoi serrer les pointeaux opposés simultanément ?', 'Pour éviter le décentrage de l’anneau.', ['Pour supprimer les soins.', 'Pour empêcher toute radio.', 'Pour réduire le varus du genou.', 'Pour augmenter le poids.'], [192]), q('Quand vérifier le couple de serrage ?', 'Après quelques jours ou si le halo devient douloureux.', ['Jamais.', 'Seulement après ablation.', 'Avant la pose uniquement.', 'À distance du suivi.'], [192]), q('Quel dispositif permet le lever avec contention ?', 'Le halo-jacket.', ['L’étrier seul.', 'La traction collée seule.', 'Une broche transtibiale.', 'Une attelle de Boppe-Braun.'], [196]), q('Quelle complication justifie des radiographies régulières ?', 'Perte de réduction possible.', ['Équin du pied obligatoire.', 'Diastasis huméral constant.', 'Allergie aux adhésifs.', 'Plaie de jambe.'], [201]), q('Quel point clinique doit être surveillé aux pointeaux ?', 'Infection avec perte de tenue.', ['Varus de genou.', 'Rotation de cheville.', 'Nerf fibulaire à la jambe.', 'Fracture humérale.'], [201])],
  [q('Pourquoi la traction est-elle utilisée dans ce contexte de polytraumatisme ?', 'Limiter les déplacements douloureux en damage control.', ['Remplacer définitivement tout traitement.', 'Éviter toute surveillance.', 'Traiter un halo douloureux.', 'Supprimer l’examen cutané.'], [72]), q('Quelle complication de décubitus doit être prévenue ?', 'Événement thromboembolique.', ['Dysphagie par halo.', 'Ostéolyse crânienne obligatoire.', 'Pseudarthrose humérale certaine.', 'Allergie systématique.'], [68]), q('Quelle mesure de prévention est rapportée ?', 'Mobilisation encadrée et traitement préventif.', ['Immobilisation absolue sans contrôle.', 'Poids posé au sol.', 'Bandage très serré.', 'Arrêt de la kinésithérapie.'], [68]), q('Quel élément doit être contrôlé avant décision définitive ?', 'Réduction et état des parties molles.', ['Couleur de la chambre.', 'Nombre de visiteurs.', 'Taille de l’étrier crânien.', 'Mobilité du poignet seul.'], [72]), q('Quel contrôle permet de dépister les lésions de pression ?', 'Inspection régulière des points d’appui.', ['Mesure de la force des poids.', 'Radiographie du crâne.', 'Test du nerf radial seul.', 'Vérification du halo.'], [68]), q('Quel principe de suivi s’applique à la traction ?', 'Réévaluation régulière de l’efficacité et des dangers.', ['Absence de contrôle si montage en place.', 'Modification automatique des charges.', 'Suppression du nursing.', 'Aucune surveillance de peau.'], [214])],
];

const dpFinal = [
  q('Quel élément doit rester libre pour préserver l’efficacité du montage ?', 'Le poids de traction.', ['La peau lésée.', 'Le bandage serré.', 'La poulie bloquée.', 'La contre-extension.'], [26]),
  q('Quel contrôle confirme la sécurité extra-articulaire de la broche ?', 'Une articulation voisine normalement mobile.', ['Un poids plus lourd.', 'Un pansement compressif.', 'Une absence de radiographie.', 'Une traction coupée.'], [33]),
  q('Quelle condition rend la contre-extension efficace ?', 'Pieds du lit surélevés.', ['Poids au sol.', 'Nœud sur poulie.', 'Attelle en contact avec le lit.', 'Absence de hamac.'], [43, 63]),
  q('Quelle surveillance radiologique peut révéler une infection profonde ?', 'Ostéolyse ou ostéite autour du trajet.', ['Un équin du pied.', 'Un halo décentré.', 'Une fracture du crâne.', 'Un diastasis huméral.'], [57]),
  q('Quand la traction humérale cesse-t-elle d’être le relais adapté ?', 'Lorsque le patient peut se lever pour le traitement orthopédique habituel.', ['Lorsqu’une poulie est libre.', 'Dès le premier pansement.', 'Quand le nerf fibulaire est normal.', 'Après pose d’un halo.'], [151]),
  q('Quel soin local est indispensable aux pointeaux de l’étrier ?', 'Soins antiseptiques quotidiens.', ['Aucun soin après pose.', 'Bandage de jambe.', 'Mobilisation sans imagerie.', 'Augmentation de poids libre.'], [172]),
  q('Quel signe impose de vérifier le serrage du halo ?', 'Douleur lors de sa mobilisation.', ['Talon dans le vide.', 'Rotation neutre du membre.', 'Poids de traction libre.', 'Plâtre pendant.'], [192]),
  q('Pourquoi réévaluer régulièrement la traction de damage control ?', 'Pour vérifier efficacité, dangers et moment du relais définitif.', ['Pour supprimer toute surveillance.', 'Pour augmenter librement les poids.', 'Pour éviter la mobilisation encadrée.', 'Pour maintenir la peau sous pression.'], [72, 214]),
];

const dpSeries = dpSpecs.map(([label, vignette, source], index) => ({
  label, vignette,
  questions: [dpBase[index][0], ...[...dpBase[index].slice(1), dpFinal[index]].map((question, qIndex) => ({ ...question, enonce: `Nouvel élément : ${['Le montage est installé.', 'Le contrôle clinique est réalisé.', 'Les données radiologiques sont disponibles.', 'La surveillance de garde se poursuit.', 'La décision de relais est discutée.', 'Le suivi est réévalué.'][qIndex]} ${question.enonce}` }))], source,
}));
const chapter = { series: [...mcq.map(([label, questions]) => ({ label, vignette: '', questions })), ...dpSeries], flashcards, provenance: { source: 'extract.json', coverage: 'coverage.json', annales: 'Aucune annale exploitable localement ; les vignettes sont des cadres cliniques limités aux principes du corpus.' } };
const coverage = { course: fiche.title, sourceBlocks: fiche.sourceBlocks, figures: fiche.parts.flatMap((p) => p.sections.flatMap((s) => s.rows.filter((r) => r.image).map((r) => r.image.path))), qcm: '40 questions ciblant des principes transférables ; aucun exemple isolé du cours.', dp: '8 dossiers patients avec décision, contrôles et suivi ; questions 2–7 progressives.', flashcards: `${flashcards.length} cartes distinctes, rectos non génériques et principes source-à-source.`, exception: 'Aucune annale spécifique exploitable dans le dossier local.' };

writeFileSync(join(outputDir, 'fiche.model.json'), `${JSON.stringify(fiche, null, 2)}\n`, 'utf8');
writeFileSync(join(outputDir, 'fiche.body.html'), compileFicheModel(fiche, chapterDir), 'utf8');
writeFileSync(join(outputDir, 'chapter.json'), `${JSON.stringify(chapter, null, 2)}\n`, 'utf8');
writeFileSync(join(outputDir, 'coverage.json'), `${JSON.stringify(coverage, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ outputDir, parts: fiche.parts.length, sections: fiche.parts.reduce((n, p) => n + p.sections.length, 0), flashcards: flashcards.length, qcm: mcq.length, dp: dpSeries.length }, null, 2));

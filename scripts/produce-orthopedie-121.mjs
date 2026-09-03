/** Chapitre 121 — écriture source-only ; les contenus étudiants sont ajoutés après revue du modèle. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { compileFicheModel } from './lib/orthopedie-fiche.mjs';
const chapterDir = resolve(process.argv[2] || '../.corpus-orthopedie/traitement-des-malformations-congenitales-du-poignet-et-de-l-avant-bras');
const out = resolve(process.argv[3] || join(chapterDir, 'delivery', 'quality-v1'));
mkdirSync(out, { recursive: true });
const figure = (n) => ({ path: `img/img_${String(n).padStart(3, '0')}.png`, position: 'after', size: 'large' });
const row = (concept, bullets, extra = {}) => ({ concept, bullets, ...extra });
const note = (kind, bullets) => ({ kind, bullets });

const fiche = {
 title: "Traitement des malformations congénitales du poignet et de l’avant-bras", year: '2025-2026',
 sourceBlocks: [12,15,16,17,21,28,29,30,31,32,36,37,42,43,54,58,59,60,63,78,83,86,88,92,93,97,105,107,113,119,123,127,129,130,136,141,142,144,152,154],
 parts: [
  { title: 'Raisonner un projet fonctionnel', sections: [
   { title: 'Cadre des malformations du poignet et de l’avant-bras', rows: [
    row('Projet thérapeutique', ['Les malformations peuvent être isolées, comme la maladie de Madelung, ou associées à des anomalies régionales plus étendues.', 'Le projet prend en compte la main, le poignet, l’avant-bras, le coude et éventuellement le bras.', 'La ligne directrice reste fonctionnelle, y compris lorsqu’une demande morphologique est exprimée.']),
    row('Main bote radiale', ['La main bote radiale atteint l’ensemble des structures préaxiales du membre supérieur.', 'Le spectre s’étend d’une hypoplasie radiale et du pouce à l’absence de structures radiales.', 'La classification de Bayne et Klug décrit la gravité anatomique et aide à planifier la reconstruction.'], { image: figure(1) }),
    note('piege', ['Une correction locale du poignet sans analyse de l’ensemble du membre et de la fonction de préhension conduit à un projet incomplet.'])
   ] },
   { title: 'Choisir le moment et l’objectif de correction', rows: [
    row('Hiérarchie des objectifs', ['Réduire d’abord les contraintes qui empêchent le réalignement puis stabiliser le poignet dans une position utile.', 'Préserver ou restaurer une mobilité compatible avec la fonction quand l’anatomie le permet.', 'Adapter le geste à la croissance, au potentiel osseux et aux unités musculotendineuses disponibles.']),
    row('Préparation progressive', ['Une inclinaison radiale importante et peu réductible justifie orthèse de posture et manipulations passives préopératoires.', 'Le but est d’obtenir une réductibilité parfaite avant le temps chirurgical de réalignement.', 'En cas d’insuffisance, la distraction progressive évite des contraintes de compression excessives sur les structures cartilagineuses.'], { image: figure(2) }),
    note('a_retenir', ['Avant un geste osseux, rechercher ce qui limite réellement la réduction : rétraction des parties molles, longueur osseuse et équilibre musculotendineux.'])
   ] }
  ] },
  { title: 'Corriger la main bote radiale', sections: [
   { title: 'Distraction et allongement osseux', rows: [
    row('Indications de l’allongement', ['L’allongement radial contribue à l’équilibre du poignet lorsqu’un radius court possède une épiphyse individualisée.', 'Dans les formes sévères, l’allongement ulnaire est discuté en fin de croissance surtout pour l’esthétique, après stabilisation du poignet.', 'Fixateurs monoplans ou circulaires sont décrits selon l’indication et l’encombrement acceptable.']),
    row('Montage de distraction', ['Le fixateur prend appui distalement sur les quatrième et cinquième métacarpiens et proximalement sur la diaphyse ulnaire.', 'Son corps est placé sur le versant ulnaire, à hauteur de l’interligne ulnocarpien.', 'La distraction précède le réalignement angulaire pour limiter les contraintes compressives et obtenir un gain des parties molles.'], { image: figure(3) }),
    row('Fin de distraction', ['Le fixateur est retiré après correction optimale angulaire et de longueur.', 'La correction acquise facilite ensuite le temps de centralisation ou de radialisation du carpe.', 'La progression préopératoire réduit le chevauchement entre épiphyse ulnaire distale et massif carpien.'])
   ] },
   { title: 'Explorer avant de stabiliser', rows: [
    row('Voie d’abord', ['La correction est menée par voie dorsale après assouplissement obtenu par distraction ou manipulation.', 'Un abord sinusoïdal dorsal est préféré dans le texte lorsque le poignet est suffisamment assoupli.', 'Le lambeau bilobé est une option mais expose à des nécroses cutanées partielles.']),
    row('Exploration exhaustive', ['Ouvrir le rétinaculum des extenseurs et exposer les structures musculotendineuses avant toute correction.', 'Repérer le nerf médian, souvent anormalement situé dans la concavité de la déformation.', 'L’arthrotomie expose le carpe proximal et l’épiphyse distale de l’ulna afin de préparer une correction sous contrôle.'], { image: figure(4) }),
    note('piege', ['Une réduction sous tension sur le nerf médian ou l’artère radiale n’est pas un résultat acceptable : elle impose de revoir la préparation ou l’amplitude de correction.'])
   ] }
  ] },
  { title: 'Centraliser ou radialiser le poignet', sections: [
   { title: 'Centralisation', rows: [
    row('Principe', ['La centralisation amène l’épiphyse de l’ulna en regard du massif carpien.', 'La tête ulnaire est stabilisée dans une logette de la première rangée du carpe.', 'Une broche centromédullaire est introduite par le troisième métacarpien jusque dans la cavité médullaire de l’ulna.'], { image: figure(5) }),
    row('Rééquilibrage tendineux', ['Le fléchisseur et l’extenseur ulnaires du carpe peuvent être réinsérés plus distalement.', 'Cette modification augmente leur efficacité mécanique.', 'Elle lutte contre la tendance à l’inclinaison radiale récidivante.']),
    row('Limites', ['La mobilité du poignet est nulle par définition, la centralisation étant un équivalent d’arthrodèse ulnocarpienne.', 'La récidive est rapportée malgré la stabilisation.', 'Le geste peut raccourcir davantage le membre et léser la zone de croissance ulnaire.'])
   ] },
   { title: 'Radialisation et alternatives pendant la croissance', rows: [
    row('Principe de radialisation', ['La radialisation ne résèque pas le massif carpien et cherche à conserver un degré de mobilité.', 'Le carpe est réduit en regard de l’épiphyse ulnaire en légère hypercorrection d’inclinaison ulnaire.', 'La stabilisation est assurée par broche et complétée par des transferts tendineux de rééquilibrage.'], { image: figure(6) }),
    row('Conditions de stabilité', ['La radialisation suppose des unités musculotendineuses transférables du bord radial, notamment FCR ou ECR.', 'Une tension excessive sur le nerf médian ou l’artère radiale impose de limiter les ambitions de réduction.', 'La distraction préopératoire vise à diminuer ces difficultés.']),
    row('Pilier externe vascularisé', ['Le transfert métatarsophalangien vascularisé de Vilkki constitue une alternative pendant la croissance.', 'Il est précédé d’une distraction et forme un arc-boutant entre ulna et deuxième métacarpien.', 'Son potentiel de croissance accompagne ensuite le développement du membre.'])
   ] }
  ] },
  { title: 'Traiter une déformation de Madelung', sections: [
   { title: 'Reconnaître la déformation et son retentissement', rows: [
    row('Tableau clinique', ['Le radius est court et courbé ; la surface articulaire regarde vers la paume et l’ulna.', 'La tête ulnaire est proéminente tandis que l’ulna est souvent hypoplasique.', 'La maladie est plus fréquente chez les filles et le retentissement est souvent peu marqué dans l’enfance.']),
    row('Anomalies radiologiques', ['La glène radiale se verticalise dans le plan frontal et présente un excès d’antéversion dans le plan sagittal.', 'Le lunatum est attiré proximalement par le ligament de Vickers et peut devenir ogival dans les formes sévères.', 'La subluxation dorsale de la tête ulnaire est surtout visible après maturité osseuse.'], { image: figure(7) }),
    row('Moment de décision', ['Le diagnostic est souvent posé à l’adolescence devant une association de retentissement morphologique et de douleurs à l’activité.', 'L’origine précise des douleurs radiocarpiennes, ulnocarpiennes ou radio-ulnaires peut être difficile à établir.', 'L’indication est donc individualisée.'])
   ] },
   { title: 'Geste avant ou après maturité osseuse', rows: [
    row('Physiolyse de Vickers', ['Avant la maturité osseuse, une physiolyse traite la fermeture prématurée de la zone de croissance radiale.', 'L’abord antérieur protège artère radiale, nerf médian et tendons fléchisseurs ; la zone anormale est excisée.', 'Une greffe graisseuse comble la cavité pour prévenir la réossification rapide et une attelle antalgique est conservée environ quinze jours.'], { image: figure(8) }),
    row('Remodelage au cours de croissance', ['La correction apparaît progressivement au fil des mois par remodelage sous l’effet de la croissance.', 'La cicatrice osseuse migre proximalement avec la croissance.', 'Une surveillance clinique et radiologique vérifie l’évolution de l’orientation radiale.']),
    row('Après maturité', ['Après maturité, la malposition épiphysaire ne peut plus être corrigée par croissance.', 'Une ostéotomie d’ouverture du radius distal par voie de Henry corrige verticalisation et excès d’antéversion dans les indications retenues.', 'Une ostéotomie ulnaire peut compléter le geste radial si l’index radio-ulnaire distal reste déséquilibré.'])
   ] }
  ] },
  { title: 'Corriger une synostose radiocubitale congénitale', sections: [
   { title: 'Retentissement et indication', rows: [
    row('Anatomie et fonction', ['La synostose proximale s’associe à des anomalies musculaires, de membrane interosseuse et parfois de tête radiale.', 'Ces anomalies rendent illusoire la restauration de la pronosupination par simple séparation du pont.', 'Le retentissement dépend du caractère uni- ou bilatéral et de la position de blocage.'], { image: figure(9) }),
    row('Compensations', ['Le poignet et l’épaule compensent partiellement une position en supination.', 'La compensation est moins efficace en pronation accusée.', 'Certains enfants réalisent leurs préhensions en accentuant la pronation, main « à l’envers ».']),
    row('Indication', ['Les synostoses fixées en pronation sont les principales candidates à une correction.', 'L’indication est considérée indiscutable au-delà de 60° de pronation et discutée au cas par cas pour une pronation moindre.', 'L’amplitude corrigée tient compte de la position de départ, du côté opposé et des limites peropératoires.'])
   ] },
   { title: 'Ostéotomie, sécurité et suivi', rows: [
    row('Ostéotomie dans le foyer', ['L’abord est longitudinal, centré par la crête ulnaire, entre FCU et muscles postérieurs.', 'Le trait est repéré à l’amplificateur à travers le pont de synostose, distalement à la coronoïde.', 'Après dérotation, une broche centromédullaire et une broche antirotation assurent la fixation.'], { image: figure(10) }),
    row('Surveillance immédiate', ['Le montage impose une immobilisation brachiopalmaire complémentaire.', 'La coloration de la main est contrôlée au lâcher du garrot puis dans les heures suivantes.', 'Une surveillance étroite dépiste une complication vasculaire, nerveuse ou un syndrome des loges.']),
    row('Variantes et prudence', ['Une plaque ou un fixateur externe peuvent remplacer les broches dans certaines techniques.', 'Le fixateur externe permet de diminuer secondairement la dérotation en cas de souffrance vasculonerveuse.', 'Le risque de complication croît avec l’amplitude de correction ; une prudence extrême est requise pour les fortes corrections.']),
    note('a_retenir', ['Dans toutes ces malformations, la correction morphologique n’est justifiée que si elle sert un objectif fonctionnel et respecte la croissance ainsi que les structures vasculonerveuses.'])
   ] }
  ] }
 ],
 synthesis: { chiffres: { headers: ['Situation', 'Donnée du corpus', 'Décision'], rows: [['Synostose en pronation', '> 60°', 'Indication de correction forte'], ['Physiolyse de Vickers', 'Avant maturité', 'Exploiter le remodelage de croissance'], ['Attelle après physiolyse', '≈ 15 jours', 'Antalgie initiale'], ['Synostose corrigée', 'Fortes corrections', 'Risque vasculonerveux accru']] }, tables: [{ title: 'Main bote radiale', headers: ['Étape', 'But', 'Vigilance'], rows: [['Orthèse / mobilisation', 'Rendre l’inclinaison réductible', 'Ne pas forcer les cartilages'], ['Distraction', 'Gagner longueur et parties molles', 'Appuis ulna + M4/M5'], ['Centralisation', 'Stabiliser ulna–carpe', 'Equivalent arthrodèse'], ['Radialisation', 'Conserver mobilité relative', 'Unités FCR/ECR nécessaires']] }, { title: 'Madelung et synostose', headers: ['Contexte', 'Option', 'Suivi'], rows: [['Madelung avant maturité', 'Physiolyse + graisse', 'Remodelage de croissance'], ['Madelung mature', 'Ostéotomie radiale ± ulnaire', 'Équilibre radio-ulnaire'], ['Synostose pronatrice', 'Ostéotomie de dérotation', 'Vigilance vasculonerveuse'], ['Correction forte', 'Fixation/immobilisation', 'Surveillance des loges']] }, { title: 'Décision', headers: ['Question', 'Réponse pratique', 'Conséquence'], rows: [['Fonction utile ?', 'Analyser préhension et compensations', 'Individualiser le geste'], ['Croissance présente ?', 'Privilégier remodelage et structures de croissance', 'Éviter arthrodèse définitive'], ['Réduction sous tension ?', 'Limiter correction ou distraire progressivement', 'Protection médian/artère radiale'], ['Douleur sans corrélation claire ?', 'Peser l’indication', 'Information du patient']] }], keyPoints: ['Le projet de malformation reste avant tout fonctionnel.', 'La distraction prépare les corrections rigides de main bote radiale.', 'Centralisation : stabilité au prix d’une absence de mobilité ; radialisation : mobilité relative mais équilibre tendineux indispensable.', 'Madelung avant maturité : physiolyse et prévention de réossification par graisse.', 'Madelung adulte : chirurgie palliative/ostéotomie discutée avec prudence.', 'Synostose : ne pas promettre de restaurer une pronosupination anatomique par séparation simple.', 'Synostose fixée en pronation : indication selon retentissement, pronation et risque vasculonerveux.'], eclair: ['Objectif : fonction et préhension, pas la seule correction morphologique.', 'Main bote radiale rigide : orthèse puis distraction avant réalignement.', 'Centralisation = stabilité mais équivalent arthrodèse ; radialisation = mobilité relative + transferts.', 'Madelung enfant : physiolyse de Vickers, graisse anti-réossification, remodelage ensuite.', 'Madelung mature : ostéotomie radiale ± ulnaire si indication retenue.', 'Synostose : retentissement surtout en pronation ; > 60° = indication forte dans le corpus.', 'Après dérotation : immobiliser et surveiller immédiatement la vascularisation et les loges.'] }
};
writeFileSync(join(out, 'fiche.model.json'), JSON.stringify(fiche, null, 2));
writeFileSync(join(out, 'fiche.body.html'), compileFicheModel(fiche, chapterDir));
console.log(JSON.stringify({ out, parts: fiche.parts.length, sections: fiche.parts.reduce((n, p) => n + p.sections.length, 0) }));

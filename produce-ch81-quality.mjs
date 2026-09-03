import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { emitOrthopediePackage } from './scripts/lib/orthopedie-package.mjs';

const chapterDir = resolve('../.corpus-orthopedie/pth-sans-ciment');
const outputDir = join(chapterDir, 'delivery', 'source-quality-v3');
mkdirSync(outputDir, { recursive: true });
const title = 'PTH sans ciment';
const img = (n, caption, sourceCaption, size = 'small', position = 'before') => ({ path: `img/img_${String(n).padStart(3, '0')}.png`, caption, sourceCaption, size, position });

const fiche = {
  title, year: '2025-2026', coverSubtitle: 'Principes d’ostéointégration et technique opératoire',
  sourceBlocks: [10,12,14,17,19,20,21,24,29,31,33,36,39,42,47,52,54,57,64,66,69,74,81,84,89,92,94,102,104,106,118],
  parts: [
    { title: 'Fondements de la fixation biologique', sections: [
      { title: 'Objectif d’une PTH sans ciment', rows: [
        { concept: 'Principe de fixation', marker: 'ecn', bullets: ['La fixation recherchée associe une **stabilité primaire** liée à la forme de l’implant et une fixation secondaire par **ostéointégration**.', 'L’objectif est une liaison directe, durable, entre l’implant et le tissu osseux.'] },
        { concept: 'Pourquoi éviter le ciment ?', bullets: ['Le ciment est un troisième corps qui vieillit avec le site osseux.', 'Le descellement peut entraîner migration et perte de stock osseux, enjeu important chez les patients jeunes et actifs.'] },
        { concept: 'Effet de surface seul', marker: 'trap', bullets: ['Microbillage, porosité, rugosité ou treillis créent une liaison mécanique.', 'Une fibrointégration peut donner une stabilité apparente mais laisse passer des particules d’usure et favorise l’ostéolyse.'] },
        { concept: 'Revêtement ostéoconducteur', marker: 'yield', bullets: ['Le titane rugueux associé à l’**hydroxyapatite (HA)** favorise une ostéogenèse de cicatrisation.', 'Après résorption de l’HA, l’os différencié reste au contact de l’implant sans interposition fibreuse.'] }
      ] },
      { title: 'Implants et options de reconstruction', rows: [
        { concept: 'Tige fémorale', bullets: ['Les tiges peuvent être droites, anatomiques ou sur mesure.', 'Le revêtement peut être complet, métaphysaire supérieur ou métaphysodiaphysaire.'] },
        { concept: 'Restauration du morphotype', bullets: ['Les gammes coxa vara et **high-offset** aident à restaurer l’architecture de hanche.', 'La modularité du col règle longueur de membre, angle cervicodiaphysaire et latéralisation.'] },
        { concept: 'Cupule acétabulaire', bullets: ['Les surfaces utilisent titane grenaillé, porocoat ou HA.', 'La stabilisation initiale est obtenue par **impaction** ou par **vissage**.'] },
        { concept: 'Couple de frottement', bullets: ['La nouvelle génération de cupules rend possibles les couples métal-métal et céramique-céramique ainsi que les grands diamètres.', 'Le relargage de particules de polyéthylène reste une cause d’ostéolyse pelvienne ou fémorale.'] }
      ] }
    ] },
    { title: 'Planification et préparation', sections: [
      { title: 'Planification radiographique', rows: [
        { concept: 'Bilan indispensable', marker: 'ecn', bullets: ['Disposer de radiographies fiables : bassin, hanche pathologique de face et profil, et selon le contexte hanche controlatérale.', 'L’échelle doit être connue pour utiliser les calques avec le bon agrandissement.'], image: img(1, 'Planification sur bassin de face.', 'Figure 1. Planification de Corail sur bassin de face.') },
        { concept: 'Objectifs architecturaux', bullets: ['Restaurer l’égalité de longueur des membres, le cintre cervico-obturateur et la latéralisation.', 'La restauration de l’offset contribue à la tension des abducteurs.'] },
        { concept: 'Planification de la cupule', bullets: ['Le calque s’appuie sur l’arrière-fond, sous un toit acétabulaire couvrant.', 'L’orientation cible est d’environ **40–45° d’inclinaison** par rapport à la ligne des U ; le profil aide à préciser la taille.'], image: img(2, 'Calque fémoral et niveau de coupe.', 'Figure 2. Planification fémorale ABGII. A. Cliché mensuratif de face. B. Ostéotomie du col. C. Planification fémorale ABGII avec calque.', 'large', 'after') },
        { concept: 'Planification du pivot', bullets: ['Évaluer la composante endofémorale selon le contact cortical recherché.', 'Définir composante extramédullaire, longueur de col, angle cervicodiaphysaire et niveau de coupe cervicale.'] }
      ] },
      { title: 'Voie d’abord et ancillaire', rows: [
        { concept: 'Voies utilisables', bullets: ['Les voies classiques sont utilisables pour une implantation sans ciment.', 'La voie transtrochantérienne est réservée dans cette source à l’implant cimenté de type Charnley.'] },
        { concept: 'Chirurgie mini-invasive', bullets: ['Elle se développe préférentiellement avec des implants sans ciment.', 'Elle peut être réalisée par voie postérieure ou antérieure avec une instrumentation spécifique.'], image: img(3, 'Ostéotomie cervicale programmée.', 'Figure 3. A, B. Ostéotomie du col.', 'large', 'after') },
        { concept: 'Rôle de l’ancillaire', bullets: ['L’ancillaire est dessiné taille pour taille et avec les mêmes mensurations que les implants définitifs.', 'Les pièces d’essai doivent être stables dans le cotyle et dans la diaphyse fémorale.'] },
        { concept: 'Essais avant implantation', marker: 'yield', bullets: ['La modularité permet de choisir taille, longueur des membres et offset.', 'Après réduction, les essais testent directement la stabilité de hanche.'] }
      ] }
    ] },
    { title: 'Temps acétabulaire', sections: [
      { title: 'Cupule impactée ABGII', rows: [
        { concept: 'Exposition du cotyle', bullets: ['Après capsulectomie économique, abattre les cornes, exciser le ligament transverse et enlever les ostéophytes de l’arrière-fond.', 'Retrouver l’arrière-fond et aviver les zones de sclérose.'], image: img(4, 'Exposition du cotyle osseux.', 'Figure 4. Exposition du cotyle.') },
        { concept: 'Fraisage', marker: 'ecn', bullets: ['Commencer avec la plus petite fraise et augmenter de **2 mm en 2 mm**.', 'Rechercher l’os sous-chondral saignant, avec environ **40–45° d’inclinaison** et **15° d’antéversion**.', 'Éviter les rotations excessives de la dernière fraise pour ne pas surcalibrer la cavité.'], image: img(6, 'Fraisage progressif du cotyle.', 'Figure 5. A, B, C. Cupule ABGII fraisage du cotyle.', 'large', 'after') },
        { concept: 'Cupule d’essai', bullets: ['Le diamètre correspond à celui de la dernière fraise : effet **exact fit**.', 'Elle doit être stable et correctement couverte ; en cas d’instabilité, vérifier d’abord l’absence d’interposition de tissus mous.'] },
        { concept: 'Conduite devant une instabilité', marker: 'trap', bullets: ['Ne pas monter d’emblée à la taille supérieure.', 'Un léger recreusement avec une fraise **2 à 4 mm plus petite** puis un refraisage jusqu’à la taille définitive peut améliorer la stabilité.', 'Les géodes sont ouvertes, curetées et comblées par spongieux de la tête fémorale.'] }
      ] },
      { title: 'Cupule vissée Spirofit', rows: [
        { concept: 'Mécanisme', bullets: ['Les macrostructures périphériques constituent un pas de vis.', 'Le vissage met l’os en précontrainte et procure une stabilité mécanique initiale.'] },
        { concept: 'Double objectif du fraisage', bullets: ['Objectif morphologique : forme hémisphérique parfaite pour la fixation mécanique.', 'Objectif biologique : os sous-chondral ou spongieux vivant, saignant et réactif, apte à l’ostéointégration.'], image: img(11, 'Contrôle de l’inclinaison au fraisage.', 'Figure 11. Cupule fraisage du cotyle et contrôle de l’inclinaison.', 'large', 'after') },
        { concept: 'Implantation définitive', bullets: ['Contrôler continuellement antéversion et inclinaison jusqu’au blocage.', 'Vérifier descente complète, orientation conforme aux essais et absence de débord antérieur vers le psoas.'] },
        { concept: 'Situations particulières', bullets: ['Cupule non descendue : dévisser, fraiser une taille supplémentaire puis revisser le même implant.', 'Cupule qui « foire » : passer à la taille supérieure.', 'Protrusion : greffe corticospongieuse comprimée par le vissage ; dysplasie : reconstruction du toit par greffon autologue.'] }
      ] }
    ] },
    { title: 'Temps fémoral et réduction d’essai', sections: [
      { title: 'Tige anatomique ABGII', rows: [
        { concept: 'Préparation métaphysaire', bullets: ['Réséquer le résidu supérieur et antérieur du col pour préparer le logement.', 'Prélever une carotte de spongieux en préservant au maximum la région de Merkel.'], image: img(13, 'Préparation métaphysaire pour tige ABGII.', 'Figure 13. Tige ABGII : préparation du logement métaphysaire.') },
        { concept: 'Alésage de calibrage', bullets: ['Il est indiqué si la planification prévoit un conflit entre la tige et la corticale diaphysaire.', 'Calibrer selon le diamètre médullaire mesuré au préalable.'] },
        { concept: 'Passage des râpes', marker: 'ecn', bullets: ['Commencer par la plus petite taille puis augmenter progressivement jusqu’à la taille planifiée.', 'Privilégier une pénétration externe pour éviter le varus.', 'La râpe doit être stable en varus-valgus et en rotation, avec son épaule au niveau de la fossette digitale.'], image: img(14, 'Passage progressif des râpes ABGII.', 'Figure 14. A, B. Passage des râpes ABGII.', 'large', 'after') },
        { concept: 'Taille et incidents', bullets: ['Une râpe inférieure, stable en rotation et varus-valgus, ne doit pas être remplacée par une taille supérieure au prix d’une fissure métaphysaire.', 'Une râpe instable impose la taille suivante après alésage si nécessaire.'] }
      ] },
      { title: 'Tige Corail et tests de réduction', rows: [
        { concept: 'Compaction du spongieux', bullets: ['Le spongieux est compacté au chasse-greffon dans l’axe diaphysaire.', 'Ce principe conserve le stock osseux et le densifie.'], image: img(17, 'Compaction du spongieux fémoral.', 'Figure 17. A, B. Tige Corail : compaction du spongieux.') },
        { concept: 'Râpes Corail', bullets: ['Chaque râpe est remplacée par la taille immédiatement supérieure jusqu’à stabilité en enfoncement et rotation.', 'L’antéversion est donnée par le tulipage de la râpe.'] },
        { concept: 'Essai de réduction', marker: 'yield', bullets: ['La tête d’essai vérifie longueur du membre, stabilité en flexion-adduction-rotation interne, absence de piston en extension et absence d’impingement.', 'Pour Corail, le test apprécie aussi tension des fessiers, amplitudes et conflit antérieur avec le psoas.'], image: img(18, 'Râpes Corail et réduction d’essai.', 'Figure 18. A, B, C. Tige Corail : passage des râpes et test de réduction.', 'large', 'after') },
        { concept: 'Implantation définitive', bullets: ['Éviter de toucher l’HA avec les gants.', 'Pour Corail, impacter jusqu’à la limite du revêtement HA ou jusqu’à l’appui de la collerette sur le calcar.', 'Une greffe de tranche cervicale comble tout defect entre corticale et implant.'] }
      ] }
    ] },
    { title: 'Finition, suites et surveillance', sections: [
      { title: 'Incidents et prévention', rows: [
        { concept: 'Tige suspendue', marker: 'trap', bullets: ['Ne pas forcer : il existe un risque de fracture.', 'Excès d’environ 5 mm : discuter la longueur de col ; excès supérieur : retirer et retravailler le site osseux.'] },
        { concept: 'Tige sous-dimensionnée', bullets: ['Une tige « avalée » par le fémur traduit un sous-dimensionnement.', 'La remplacer par une taille supérieure après contrôle par une râpe stable.'] },
        { concept: 'Fissure du calcar', bullets: ['Arrêter l’impaction.', 'Réaliser un cerclage et privilégier ensuite un implant avec collerette.'] },
        { concept: 'Tête définitive', bullets: ['Laver puis sécher le cône Morse avant mise en place.', 'Introduire la tête à la main en tournant, puis impacter avec précaution sans frappe violente.'], image: { path: 'img/img_020.png', size: 'large', position: 'after' } }
      ] },
      { title: 'Fermeture et suivi postopératoire', rows: [
        { concept: 'Réduction et fermeture', bullets: ['Laver abondamment au sérum physiologique en évitant les solutions à pH acide.', 'Refermer soigneusement le plan capsuloligamentaire par trois ou quatre points transosseux pour réduire le risque de luxation.'] },
        { concept: 'Lever et appui', marker: 'ecn', bullets: ['Si la stabilité primaire est parfaite : lever à **24 ou 48 heures** et reprise de la marche.', 'Appui total d’emblée avec deux cannes pendant **45 jours**.'] },
        { concept: 'Récupération fonctionnelle', bullets: ['La station monopodale devient stable entre le **30e et le 45e jour**.', 'L’abandon des cannes est possible à la fin du **2e mois** postopératoire.'] },
        { concept: 'Contrôle radiographique et résultats', bullets: ['Le bassin de face et les clichés centrés face/profil évaluent reconstruction architecturale, position des implants et ostéoconduction.', 'Avec revêtement bioactif, la source rapporte une survie fémorale supérieure à **95 % après plus de 15 ans**.'], image: img(24, 'Aspect radiographique d’une PTH Corail-Spirofit.', 'Figure 24. Prothèse de hanche, tige Corail, cupule Spirofit®. Radiographie bassin de face.') }
      ] }
    ] }
  ],
  synthesis: {
    chiffres: { headers: ['Repère', 'Valeur source', 'Application'], rows: [
      ['Cupule', '40–45°', 'Inclinaison planifiée et peropératoire'], ['Antéversion', '≈ 15°', 'Fraisage et implantation acétabulaire'], ['Fraises ABGII', '+ 2 mm', 'Progression du fraisage'], ['Correction cupule instable', 'Fraise 2–4 mm plus petite', 'Recreusement avant refraisage'], ['Lever', '24–48 h', 'Si stabilité primaire parfaite'], ['Cannes', '45 jours', 'Appui total initial'], ['Survie fémorale', '> 95 % après > 15 ans', 'Revêtement bioactif dans la source'] ] },
    tables: [
      { title: 'Fixation : mécanique puis biologique', headers: ['Étape', 'Moyen', 'Risque si échec'], rows: [['Primaire', 'Forme, impaction ou vissage', 'Migration'], ['Secondaire', 'Ostéoconduction / ostéointégration', 'Interface fibreuse'], ['Surface seule', 'Rugosité ou porosité', 'Particules et ostéolyse'], ['HA', 'Contact os-implant sans fibre', 'Ne pas contaminer le revêtement']] },
      { title: 'Cupules : conduite opératoire', headers: ['Situation', 'Contrôle', 'Conduite'], rows: [['Cupule d’essai impactée', 'Stabilité / couverture', 'Même diamètre que dernière fraise'], ['Instabilité ABGII', 'Tissus mous et fraisage', 'Recreuser avant changer de taille'], ['Cupule vissée non descendue', 'Fond et orientation', 'Dévisser, fraiser, revisser'], ['Cupule vissée instable', 'Blocage complet', 'Taille supérieure']] },
      { title: 'Temps fémoral : points de sécurité', headers: ['Temps', 'Critère', 'À éviter'], rows: [['Râpe ABGII', 'Stabilité rotation + varus-valgus', 'Forcer une taille supérieure'], ['Râpe Corail', 'Stabilité enfoncement + rotation', 'Dépléter le spongieux'], ['Réduction d’essai', 'Longueur, stabilité, impingement', 'Oublier le piston en extension'], ['Calcar fissuré', 'Arrêt immédiat', 'Poursuivre l’impaction']] }
    ],
    keyPoints: ['La PTH sans ciment exige stabilité primaire puis ostéointégration.', 'Le revêtement HA favorise le contact os-implant sans interposition fibreuse.', 'La planification restaure longueur, offset et architecture de hanche.', 'Cupule : 40–45° d’inclinaison et environ 15° d’antéversion dans la source.', 'Une cupule d’essai instable impose un diagnostic avant tout surcalibrage.', 'Les essais déterminent longueur, stabilité et absence de conflit.', 'Après stabilité primaire parfaite : lever à 24–48 h et appui total avec cannes 45 jours.'],
    eclair: ['Fixation sans ciment = stabilité primaire + ostéointégration.', 'Planifier taille, niveau de coupe, longueur et offset.', 'Cupule : 40–45° ; antéversion ≈ 15°.', 'Fraisage ABGII : progression de 2 mm, os sous-chondral saignant.', 'Cupule instable : vérifier tissus mous ; recreuser avant changer de taille.', 'Râpe stable en rotation et varus-valgus ; ne jamais forcer.', 'Réduction d’essai : longueur, piston, stabilité et impingement.', 'Lever 24–48 h si stabilité primaire ; cannes 45 jours.']
  }
};

const cardLines = `
Quelle fixation doit précéder l’ostéointégration ?|La stabilité primaire<br>liée à la forme de l’implant.
Quel mécanisme assure la fixation secondaire ?|L’ostéointégration<br>par ostéoconduction.
Quel objectif biologique vise une PTH sans ciment ?|Une liaison directe et durable<br>entre implant et os.
Pourquoi le ciment est-il un enjeu à long terme ?|Il vieillit avec le site osseux<br>et peut se desceller.
Quelle conséquence peut suivre un descellement ?|Migration de l’implant<br>et perte de stock osseux.
Quel type de patient rend la conservation osseuse particulièrement importante ?|Un patient plus jeune<br>et plus actif.
Que créent microbillage, porosité, rugosité et treillis ?|Une liaison mécanique<br>par effet de surface.
Quel tissu peut s’interposer après effet de surface seul ?|Une interface fibreuse<br>de fibrointégration.
Quel risque favorise la fibrointégration ?|Le passage de particules<br>issues de l’usure.
Quelle complication est associée aux particules d’usure ?|L’ostéolyse<br>notamment chez les sujets jeunes.
Quel matériau rugueux est associé au revêtement ostéoconducteur ?|Le titane<br>à surface rugueuse.
Quel revêtement bioactif est cité pour l’ostéoconduction ?|L’hydroxyapatite<br>de calcium (HA).
Que devient l’HA avec le temps selon la source ?|Elle se résorbe<br>et est remplacée par de l’os différencié.
Quel bénéfice tire-t-on de l’absence d’interposition fibreuse ?|Éviter la migration<br>des particules.
Comment la source nomme-t-elle la pénétration osseuse performante ?|Le bone ingrowth<br>par ostéogenèse de cicatrisation.
Quelles sont les formes possibles de tige ?|Droite, anatomique<br>ou sur mesure.
Quels niveaux de revêtement sont possibles sur une tige ?|Complet, métaphysaire supérieur<br>ou métaphysodiaphysaire.
Quel morphotype peut nécessiter une gamme dédiée ?|La coxa vara<br>ou le high-offset.
Que règle la modularité du col ?|Longueur, angle cervicodiaphysaire<br>et latéralisation.
Quels effets de surface peuvent revêtir une cupule ?|Titane grenaillé, porocoat<br>ou HA.
Quels sont les deux modes de stabilisation d’une cupule ?|Impaction<br>ou vissage.
Quels couples de frottement sont rendus possibles par ces cupules ?|Métal-métal ou céramique-céramique<br>selon la source.
Quelle particule est impliquée dans l’ostéolyse pelvienne ou fémorale ?|Le polyéthylène<br>libéré par le couple de frottement.
Quel est le premier objectif de la planification ?|Restaurer l’égalité<br>de longueur des membres.
Quel cintre doit être restauré à la planification ?|Le cintre<br>cervico-obturateur.
Pourquoi restaurer l’offset ?|Pour retendre correctement<br>les muscles abducteurs.
Quels clichés composent le bilan minimal de la source ?|Bassin et hanche pathologique<br>de face et profil.
Pourquoi connaître l’échelle radiographique ?|Pour employer les calques<br>avec le bon agrandissement.
Sur quoi s’appuie le calque de cupule ?|Sur l’arrière-fond<br>cotyloïdien.
Quelle inclinaison de cupule est décrite ?|Environ 40 à 45°<br>par rapport à l’horizontale.
Quelle incidence aide à préciser la taille de cupule ?|Le profil<br>est souvent le plus fiable.
Qu’évalue la composante endofémorale du pivot ?|Le contact cortical<br>recherché.
Que définit la composante extramédullaire ?|Longueur de col et angle<br>cervicodiaphysaire.
Quel outil peut servir à la fois de planification et de contrôle ?|La navigation<br>périopératoire.
Quelle voie est écartée pour la PTH sans ciment dans la source ?|La voie transtrochantérienne<br>réservée au Charnley cimenté.
Pourquoi la mini-invasivité se développe-t-elle avec le sans ciment ?|Grâce à une instrumentation<br>spécifique.
Comment l’ancillaire est-il conçu ?|Taille pour taille<br>comme l’implant définitif.
Quel critère doit remplir une pièce d’essai cotyloïdienne ?|Une stabilité parfaite<br>dans le cotyle osseux.
Quelles variables les essais permettent-ils d’ajuster ?|Taille, longueur de membre<br>et offset.
Que doit tester la réduction d’essai ?|La stabilité de hanche<br>avant l’implant définitif.
Quel geste débute l’exposition ABGII ?|Une capsulectomie<br>économique.
Quels reliefs sont retirés à l’exposition du cotyle ?|Cornes, ligament transverse<br>et ostéophytes gênants.
Quel os cherche-t-on lors du fraisage ?|Un os sous-chondral<br>saignant.
De combien progresse la taille des fraises ABGII ?|De 2 mm<br>en 2 mm.
Quelle antéversion est recherchée au fraisage ?|Environ 15°<br>selon la source.
Pourquoi éviter une rotation excessive de la dernière fraise ?|Pour ne pas surcalibrer<br>la cavité osseuse.
Quel principe caractérise la cupule d’essai ABGII ?|L’exact fit : même diamètre<br>que la dernière fraise.
Que faut-il vérifier avant d’augmenter une cupule instable ?|L’absence de tissus mous<br>interposés.
Quelle manœuvre peut stabiliser une cupule ABGII instable ?|Recreuser avec une fraise<br>2 à 4 mm plus petite.
Comment traiter une géode sous-chondrale ?|L’ouvrir, la cureter<br>et la combler de spongieux.
Quel angle d’implantation garde la cupule définitive ABGII ?|40 à 45° d’inclinaison<br>et environ 15° d’antéversion.
Quand des vis optionnelles sont-elles utilisées avec ABGII ?|Quand une cupule sans trou<br>ne donne pas de stabilité primaire.
Quel contrôle précède l’impaction d’un insert ?|Nettoyer la cupule<br>et rechercher des ostéophytes débordants.
Quel risque expose un insert céramique mal aligné ?|Endommager son bord<br>lors de l’impaction.
Quel principe mécanique décrit la cupule Spirofit ?|Un pas de vis périphérique<br>mettant l’os en précontrainte.
Quel double objectif poursuit le fraisage Spirofit ?|Une forme hémisphérique<br>et un os vivant ostéointégrable.
Que contrôle-t-on pendant le vissage Spirofit ?|Inclinaison et antéversion<br>jusqu’au blocage.
Que faire si une cupule vissée ne descend pas au fond ?|Dévisser, fraiser une taille<br>supplémentaire puis revisser.
Que faire si une cupule Spirofit « foire » ?|La remplacer par une cupule<br>de taille supérieure.
Quelle greffe est décrite en cas de protrusion ?|Une greffe corticospongieuse<br>de tête fémorale.
Quel greffon est utilisé pour un toit insuffisant de dysplasie ?|Un greffon autologue du col<br>vissé dans l’aile iliaque.
Quelle zone est préparée pour la tige ABGII ?|Le logement métaphysaire<br>du fémur supérieur.
Quel stock osseux est prélevé lors de la préparation ABGII ?|Une carotte de spongieux<br>métaphysaire.
Quand un alésage de calibrage est-il utile ?|En cas de conflit prévisible<br>entre tige et corticale.
Dans quel sens favoriser la pénétration de la râpe ABGII ?|Vers l’extérieur<br>pour éviter le varus.
Quel repère doit atteindre l’épaule de la râpe ABGII ?|La fossette digitale<br>au bon niveau.
Quels deux plans testent la stabilité de la râpe ?|Varus-valgus<br>et rotation.
Que ne faut-il pas faire avec une râpe inférieure déjà stable ?|Forcer une taille supérieure<br>au risque de fracture.
Que faire devant une râpe ABGII instable ?|Passer à la taille supérieure<br>après alésage si besoin.
Quels paramètres évaluent les têtes d’essai ?|La longueur du membre<br>et le diamètre correspondant à l’insert.
Quel test de stabilité est décrit après réduction ABGII ?|Flexion, adduction<br>et rotation interne.
Quel signe ne doit pas persister en extension ?|Un piston<br>de la hanche.
Quelle précaution concerne l’HA avant implantation ?|Ne pas toucher le revêtement<br>avec les gants.
Quel principe guide la compaction Corail ?|Conserver et densifier<br>le spongieux.
Comment évoluent les râpes Corail ?|Par tailles directement supérieures<br>jusqu’à stabilité.
Comment est donnée l’antéversion avec Corail ?|Par le tulipage<br>de la râpe.
Que vérifie le test Corail sur les abducteurs ?|La tension<br>des fessiers.
Quel conflit antérieur est spécifiquement recherché ?|Un débord de cupule<br>contre le psoas.
Jusqu’où impacter la tige Corail ?|À la limite de l’HA<br>ou à l’appui de la collerette.
Comment combler un defect entre corticale et implant Corail ?|Par une greffe osseuse<br>de tranche cervicale.
Quelle conduite devant une tige suspendue ?|Ne pas forcer<br>pour éviter la fracture.
Quel réglage est possible pour un excès de longueur d’environ 5 mm ?|La longueur du col<br>prothétique.
Que traduit une tige « avalée » par le fémur ?|Un implant<br>sous-dimensionné.
Quelle conduite devant une fissure du calcar ?|Arrêter l’impaction<br>et réaliser un cerclage.
Quelle tige est à privilégier après fissure du calcar ?|Un implant<br>avec collerette.
Quel geste précède la mise en place de la tête définitive ?|Laver puis sécher<br>le cône Morse.
Comment introduire la tête définitive ?|À la main en tournant<br>puis impacter avec précaution.
Pourquoi refermer le plan capsuloligamentaire ?|Pour diminuer le risque<br>de luxation postopératoire.
Combien de points transosseux sont décrits à la fermeture ?|Trois ou quatre<br>points transosseux.
Quand lever le patient si stabilité primaire parfaite ?|À 24 ou 48 heures<br>après l’intervention.
Quelle aide à la marche est conservée 45 jours ?|Deux cannes canadiennes<br>avec appui total initial.
Quand la station monopodale devient-elle stable ?|Entre le 30e<br>et le 45e jour.
Quand peut-on abandonner les cannes ?|À la fin du deuxième mois<br>postopératoire.
Que vérifient les radiographies postopératoires ?|Architecture, positionnement<br>et ostéoconduction.
Quel taux de survie fémorale rapporte la source ?|Supérieur à 95 %<br>au-delà de 15 ans.
Quelle structure doit être nettoyée avant l’insert définitif ?|L’intérieur de la cupule<br>sans ostéophyte débordant.
Quel insert nécessite un engagement particulièrement minutieux ?|L’insert céramique<br>pour éviter d’endommager son bord.
Quel avantage apporte le calque fémoral préopératoire ?|Prévoir taille de tige<br>et niveau de coupe cervicale.
Quel contrôle permet le regard du trou polaire Spirofit ?|La descente complète<br>de la cupule vissée.
Pourquoi retirer les excès osseux périphériques après l’essai Spirofit ?|Pour éviter un conflit<br>sans participer à la stabilité.
Quel élément est excisé lors de l’exposition Spirofit selon la source ?|Le labrum<br>en respectant la capsule sauf indication.
Comment vérifier le contact de la cupule d’essai ABGII ?|Par ses trous<br>au contact du cotyle osseux.
Quel insert peut être à rebord dans la cupule ABGII ?|L’insert en polyéthylène<br>standard ou à rebord.
`.trim();
const facts = cardLines.split('\n').filter(Boolean).map((line) => { const [recto, verso] = line.split('|'); return { recto, verso }; });

const I = (enonce, is_correct, justification) => ({ enonce, is_correct, justification });
const question = (enonce, correct, wrong, correction) => ({ enonce, correction_generale: correction, items: [I(correct, true, correction), ...wrong.map((x) => I(x, false, 'Cette proposition ne correspond pas aux données du chapitre.'))].map((item, index) => ({ ...item, lettre: 'ABCDE'[index] })) });
const qSpecs = [
 ['Fixation biologique', 'Quel élément conditionne la fixation secondaire d’une PTH sans ciment ?', 'Une stabilité primaire obtenue par la forme de l’implant', ['Un scellement systématique au PMMA', 'Une capsule fibreuse volontaire', 'L’absence de contact os-implant', 'Un appui différé imposé'], 'La source décrit une stabilité primaire préalable à l’ostéointégration.'],
 ['Fixation biologique', 'Quel revêtement favorise une ostéogenèse de cicatrisation ?', 'L’hydroxyapatite sur une surface de titane rugueuse', ['Un film fibreux péri-implantaire', 'Un ciment à polymérisation rapide', 'Une surface lisse sans contact osseux', 'Un insert en polyéthylène'], 'Le titane rugueux et l’HA sont décrits comme ostéoconducteurs.'],
 ['Fixation biologique', 'Quelle conséquence peut avoir une fibrointégration ?', 'Le passage de particules et l’ostéolyse secondaire', ['Une ostéoconduction constante', 'Une disparition des particules d’usure', 'Une fixation biologique sans interface', 'Un gain automatique de stock osseux'], 'La source oppose fibrointégration et ostéointégration.'],
 ['Fixation biologique', 'Quelle variable peut être réglée par la modularité du col ?', 'La latéralisation de la hanche', ['La présence d’un ciment', 'L’existence du labrum', 'La couleur de l’insert', 'Le type de radiographie'], 'La modularité règle notamment longueur, angle cervicodiaphysaire et latéralisation.'],
 ['Fixation biologique', 'Quels sont les deux modes de stabilisation initiale des cupules ?', 'Impaction ou vissage', ['Cerclage ou greffe seule', 'Cimentation ou suture', 'Forage ou alésage fémoral', 'Réduction ou fermeture'], 'Les cupules sans ciment sont stabilisées par impaction ou vissage.'],
 ['Planification', 'Quel objectif appartient à la planification préopératoire ?', 'Restaurer l’égalité de longueur des membres', ['Choisir la cicatrice cutanée postopératoire', 'Supprimer les essais', 'Éviter tout contrôle radiographique', 'Déterminer un protocole anesthésique'], 'La planification restaure longueur et architecture globale de hanche.'],
 ['Planification', 'Quelle incidence est souvent plus fiable pour préciser la taille de cupule ?', 'Le profil de hanche', ['Le cliché thoracique', 'La radiographie du rachis entier', 'La vue peropératoire seule', 'Le cliché de cheville'], 'Le profil est cité pour la taille exacte de cupule.'],
 ['Planification', 'Quelle orientation de cupule est décrite dans la source ?', '40–45° d’inclinaison et environ 15° d’antéversion', ['15° d’inclinaison et 45° d’antéversion', '90° d’inclinaison et 0° d’antéversion', '30° d’inclinaison et 60° d’antéversion', 'Aucune orientation planifiée'], 'Cette orientation est reprise lors du fraisage et de l’implantation.'],
 ['Planification', 'Quelle donnée est nécessaire pour employer les calques ?', 'Une échelle radiographique connue', ['Une seule radiographie sans bassin', 'Le poids de l’implant', 'La durée du séjour', 'La couleur de l’ancillaire'], 'Les calques doivent avoir un agrandissement adapté.'],
 ['Planification', 'Quel paramètre contribue à la tension des abducteurs ?', 'La restauration de l’offset', ['La résection du labrum', 'Le drainage systématique', 'La fermeture cutanée', 'L’alésage distal'], 'L’offset fémoral ou global conditionne la tension des fessiers.'],
 ['Cupule impactée', 'Quel os doit être atteint au fraisage cotyloïdien ?', 'L’os sous-chondral saignant', ['Un os cortical non avivé', 'Le fond sans contact osseux', 'Un tissu capsulaire', 'Le cartilage conservé'], 'La fixation biologique est recherchée dans l’os sous-chondral saignant.'],
 ['Cupule impactée', 'Quelle progression de taille est décrite avec les fraises ABGII ?', 'De 2 mm en 2 mm', ['De 5 mm en 5 mm', 'Par une seule fraise', 'De 10 mm en 10 mm', 'Sans adaptation de taille'], 'La source décrit une progression de 2 mm.'],
 ['Cupule impactée', 'Quel diamètre a la cupule d’essai ABGII ?', 'Celui de la dernière fraise : exact fit', ['Toujours 4 mm supérieur', 'Toujours 2 mm inférieur', 'Indépendant de la dernière fraise', 'Celui de la tête fémorale'], 'La cupule d’essai correspond à la dernière fraise utilisée.'],
 ['Cupule impactée', 'Que vérifier d’abord devant une cupule d’essai instable ?', 'L’absence d’interposition de tissus mous ou capsulaires', ['La nécessité de changer la voie d’abord', 'La fermeture capsulaire', 'Le choix des cannes', 'Le diamètre de la tête définitive'], 'Il ne faut pas augmenter la taille avant ce contrôle.'],
 ['Cupule impactée', 'Comment traiter une géode sous-chondrale rencontrée au cotyle ?', 'Curetage puis comblement par spongieux de la tête fémorale', ['Laisser la géode sans geste', 'Cimenter systématiquement la cupule', 'Réséquer le calcar', 'Supprimer l’insert'], 'La source décrit l’ouverture, le curetage et le comblement spongieux.'],
 ['Cupule vissée', 'Comment la cupule Spirofit obtient-elle sa stabilité initiale ?', 'Par vissage mettant l’os en précontrainte', ['Par cimentage du métal-back', 'Par simple contact capsulaire', 'Par un cerclage trochantérien', 'Par une traction fémorale'], 'Les macrostructures périphériques fonctionnent comme un pas de vis.'],
 ['Cupule vissée', 'Quel contrôle peropératoire est constant lors du vissage ?', 'L’antéversion et l’inclinaison', ['La longueur du drain', 'La position du patient debout', 'La stabilité de la station monopodale', 'La cicatrisation cutanée'], 'L’orientation est contrôlée jusqu’au blocage complet.'],
 ['Cupule vissée', 'Que faire si la cupule vissée ne descend pas au fond ?', 'Dévisser, fraiser une taille supplémentaire puis revisser le même implant', ['Forcer le vissage', 'Retirer toute la capsule', 'Poser une tige plus longue', 'Différer la fermeture'], 'Cette conduite est explicitement décrite.'],
 ['Cupule vissée', 'Quelle conduite est indiquée si la cupule vissée « foire » ?', 'La remplacer par une taille supérieure', ['L’impacter au marteau sans contrôle', 'Ajouter un ciment', 'Réduire la taille de la tête', 'Arrêter tout fraisage'], 'La source recommande une taille supérieure.'],
 ['Cupule vissée', 'Quel risque doit être évité par l’absence de débord antérieur ?', 'Le conflit avec le psoas', ['Une fissure du calcar', 'Un piston en extension', 'Une lésion du cône Morse', 'Une instabilité de la râpe'], 'Le débord antérieur est recherché car source de conflit avec le psoas.'],
 ['Tige ABGII', 'Quelle stabilité doit avoir la râpe ABGII retenue ?', 'Stabilité en varus-valgus et en rotation', ['Mobilité en rotation souhaitée', 'Instabilité contrôlée en varus', 'Stabilité de la capsule seule', 'Appui sur le grand trochanter seul'], 'Ces deux plans de stabilité déterminent la taille définitive.'],
 ['Tige ABGII', 'Quel repère vérifie le bon niveau de la râpe ABGII ?', 'Son épaule au niveau de la fossette digitale', ['Le fond du trou obturateur', 'La ligne des U seule', 'Le bord du labrum', 'La position du drain'], 'La source cite la fossette digitale comme repère de niveau.'],
 ['Tige ABGII', 'Pourquoi privilégier une pénétration externe de la râpe ?', 'Pour éviter un positionnement en varus', ['Pour augmenter le débord antérieur', 'Pour supprimer l’ostéoconduction', 'Pour raccourcir le col', 'Pour imposer une cupule cimentée'], 'La pénétration externe prévient le varus.'],
 ['Tige ABGII', 'Que faire si une râpe plus petite est déjà parfaitement stable ?', 'Ne pas forcer une taille supérieure au risque de fracture', ['Augmenter systématiquement la taille', 'Cimenter la tige', 'Supprimer la réduction d’essai', 'Retirer l’insert définitif'], 'La stabilité prime sur la taille initialement planifiée.'],
 ['Tige ABGII', 'Quel geste est discuté si la tige risque un conflit cortical diaphysaire ?', 'Un alésage de calibrage selon la planification', ['Une capsulectomie plus large', 'Une réduction sans essais', 'Une fermeture précoce', 'Un vissage de cupule'], 'L’alésage est adapté au diamètre médullaire planifié.'],
 ['Tige Corail', 'Quel est l’objectif de la compaction du spongieux avec Corail ?', 'Conserver et densifier le stock osseux', ['Évacuer tout le spongieux', 'Créer une cavité cimentée', 'Fragiliser le calcar', 'Supprimer la stabilité rotatoire'], 'Le spongieux n’est ni cureté ni retiré au défonceur.'],
 ['Tige Corail', 'Comment progresse la séquence de râpes Corail ?', 'Par la taille directement supérieure jusqu’à stabilité', ['Par tailles décroissantes', 'Sans essai de râpe', 'Uniquement par alésage distal', 'Avec une râpe fixe'], 'La stabilité est recherchée en enfoncement et rotation.'],
 ['Tige Corail', 'Quel élément donne l’antéversion de la râpe Corail ?', 'Son tulipage', ['La position du drain', 'Le diamètre de la cupule', 'Le type de canne', 'La fermeture capsulaire'], 'L’antéversion est donnée automatiquement par le tulipage.'],
 ['Tige Corail', 'Jusqu’où doit être menée l’impaction de la tige Corail ?', 'À la limite de l’HA ou à l’appui de la collerette sur le calcar', ['Jusqu’à dépasser le calcar', 'Jusqu’à disparition de la fossette digitale', 'Jusqu’à une mobilité rotatoire', 'Sans aucun contrôle de niveau'], 'Ces deux limites sont données par la source.'],
 ['Réduction d’essai', 'Quel mouvement fait partie du test de stabilité après réduction ?', 'Flexion, adduction et rotation interne', ['Extension isolée sans autre contrôle', 'Abduction sans réduction', 'Rotation externe sans hanche réduite', 'Station monopodale immédiate'], 'La source décrit cette séquence de test.'],
 ['Réduction d’essai', 'Quel signe ne doit pas être retrouvé en extension ?', 'Un piston de la hanche', ['Une longueur adaptée', 'Une tension des fessiers', 'Une stabilité contrôlée', 'Un insert correctement placé'], 'L’absence de piston en extension est vérifiée.'],
 ['Réduction d’essai', 'Quel conflit doit être recherché lors de l’essai Corail ?', 'Un conflit antérieur avec le psoas', ['Un conflit avec le nerf radial', 'Un conflit avec le tendon d’Achille', 'Un conflit avec la patella', 'Un conflit avec le coude'], 'La source relie le débord antérieur au conflit psoas.'],
 ['Incidents', 'Que faire devant une tige suspendue ?', 'Ne pas forcer en raison du risque de fracture', ['Augmenter la force d’impaction', 'Fermer avant contrôle', 'Changer la cupule uniquement', 'Supprimer la radiographie'], 'Une tige suspendue impose de retravailler le site si nécessaire.'],
 ['Incidents', 'Que traduit une tige « avalée » par le fémur ?', 'Un implant sous-dimensionné', ['Une ostéointégration terminée', 'Un excès de col', 'Une cupule surdimensionnée', 'Une fermeture insuffisante'], 'La source indique le remplacement par une taille supérieure.'],
 ['Incidents', 'Quelle conduite devant une fissure du calcar ?', 'Arrêt de l’impaction puis cerclage', ['Poursuivre l’impaction', 'Réduire la cupule', 'Omettre tout contrôle', 'Cimenter l’insert'], 'La prévention de l’extension de la fissure est prioritaire.'],
 ['Incidents', 'Quel implant est privilégié après fissure du calcar ?', 'Une tige avec collerette', ['Une tige sans appui calcar', 'Une cupule sans insert', 'Une tête sans cône', 'Un drain plus long'], 'La source conseille préférentiellement une collerette.'],
 ['Finition et suivi', 'Quel geste précède l’impaction de la tête définitive ?', 'Laver puis sécher le cône Morse', ['Laisser le cône humide', 'Cimenter le cône', 'Supprimer la réduction', 'Retirer la tige'], 'Le cône doit être propre et sec.'],
 ['Finition et suivi', 'Comment impacter la tête définitive ?', 'Avec précaution après introduction manuelle en tournant', ['Par frappe violente immédiate', 'Sans engagement sur le cône', 'Après fermeture cutanée', 'Sous traction permanente'], 'La source interdit une frappe violente.'],
 ['Finition et suivi', 'Quel plan est refermé soigneusement pour limiter la luxation ?', 'Le plan capsuloligamentaire', ['Le seul plan cutané', 'Le labrum excisé', 'Le canal médullaire', 'Le toit acétabulaire'], 'Trois ou quatre points transosseux sont décrits.'],
 ['Finition et suivi', 'Quand le lever est-il possible si la stabilité primaire est parfaite ?', 'À 24 ou 48 heures', ['Après six mois', 'Après retrait des cannes', 'Avant la réduction', 'Seulement après ostéolyse'], 'Les suites sont alors comparables aux tiges cimentées.'],
 ['Finition et suivi', 'Quel appui est donné initialement dans la source ?', 'Un appui total avec deux cannes pendant 45 jours', ['Un appui interdit systématique', 'Un appui monopodal immédiat sans canne', 'Une immobilisation plâtrée', 'Une traction prolongée'], 'Cette prescription dépend de la stabilité primaire parfaite.']
];
const qcm = Array.from({ length: 8 }, (_, n) => ({ label: `QCM ${n + 1} — ${qSpecs[n * 5][0]}`, vignette: '', questions: qSpecs.slice(n * 5, n * 5 + 5).map(([, stem, correct, wrong, correction]) => question(stem, correct, wrong, correction)) }));

const dpData = [
 ['Planification et offset', 'Une patiente de 58 ans, active, consulte pour coxarthrose invalidante. Le bilan de bassin en charge et les clichés de hanche face/profil sont réalisés avec une échelle connue. La planification d’une PTH sans ciment analyse longueur des membres, cintre cervico-obturateur et offset. Au bloc, des implants d’essai seront utilisés avant la réduction définitive. Le suivi postopératoire programmé comprend contrôle radiographique et reprise de la marche.'],
 ['Cupule impactée instable', 'Un homme de 64 ans doit recevoir une PTH sans ciment à cupule impactée. Après exposition cotyloïdienne et fraisage progressif, la cupule d’essai du diamètre de la dernière fraise paraît instable. Les géodes sous-chondrales sont visibles. L’équipe prévoit une réduction d’essai avant tout implant définitif. La surveillance ultérieure associera radiographies de bassin et contrôle de la stabilité clinique pendant la rééducation.'],
 ['Cupule vissée et dysplasie', 'Une femme de 55 ans présente une coxarthrose sur dysplasie et une insuffisance de couverture du toit. Une cupule vissée sans ciment est planifiée ; les options de greffe autologue sont préparées. Pendant l’intervention, l’orientation de cupule est contrôlée à chaque étape. Après la chirurgie, un suivi clinique et radiographique est prévu pour évaluer stabilité, positionnement et reprise progressive de l’appui.'],
 ['Tige ABGII et risque de varus', 'Un homme de 61 ans est opéré d’une PTH sans ciment avec tige anatomique ABGII. La planification évoque un canal étroit et un possible conflit cortical. Les premières râpes sont introduites progressivement ; l’équipe veut éviter un positionnement en varus et une fracture métaphysaire. Une réduction d’essai précédera l’implantation finale. Le suivi recherchera douleur, stabilité et qualité de reconstruction sur les clichés.'],
 ['Tige Corail et essai', 'Une patiente de 67 ans reçoit une tige Corail. Le spongieux cervical est conservé et compacté ; la dernière râpe est stable en enfoncement et rotation. Avec la cupule d’essai, l’opérateur vérifie longueur, tension des fessiers, amplitudes et absence de conflit antérieur. Après mise en place définitive, le suivi inclut lever précoce, deux cannes et contrôle radiographique.'],
 ['Tige suspendue', 'Un homme de 70 ans est opéré d’une PTH sans ciment. Lors de l’impaction de la tige définitive, celle-ci reste suspendue au-dessus du niveau attendu. Le patient a bénéficié d’une planification complète et les implants d’essai avaient été stables. L’équipe doit décider du geste avant réduction définitive. Après l’intervention, le suivi prévu comporte examen clinique, radiographies de contrôle et évaluation de la reprise de marche.'],
 ['Fissure du calcar', 'Une femme de 72 ans présente une fissure du calcar pendant l’impaction d’une tige sans ciment. L’intervention est interrompue à ce temps ; l’équipe dispose d’un cerclage et d’implants avec collerette. Une fois la reconstruction stabilisée, la tête définitive doit être posée sur un cône préparé. Le suivi postopératoire portera sur douleur, reprise de l’appui, radiographies et stabilité de la hanche.'],
 ['Suites postopératoires', 'Un homme de 59 ans a reçu une PTH sans ciment avec stabilité primaire jugée parfaite à la réduction. La fermeture capsuloligamentaire a été réalisée et le cône Morse a été lavé et séché avant la tête définitive. L’équipe organise le lever, l’appui avec cannes et les radiographies de référence. Lors des consultations de suivi, elle vérifiera position des implants, architecture globale et signes d’ostéoconduction.']
];
const dpCorrect = [
 ['Restaurer longueur, cintre cervico-obturateur et offset', 'Utiliser une échelle connue pour les calques', 'Prévoir une cupule vers 40–45° d’inclinaison', 'Définir niveau de coupe et longueur de col', 'Réaliser des essais de longueur et stabilité', 'Contrôler la marche et les radiographies', 'Réévaluer architecture et ostéoconduction'],
 ['Vérifier l’absence d’interposition capsulaire', 'Nouvel élément : la cupule reste instable. Recreuser avec une fraise 2 à 4 mm plus petite', 'Nouvel élément : une géode est retrouvée. La cureter et la combler de spongieux', 'Nouvel élément : la stabilité est obtenue. Garder la taille définitive planifiée', 'Nouvel élément : l’insert est choisi. Vérifier l’absence d’ostéophyte débordant', 'Nouvel élément : la réduction est terminée. Contrôler longueur et stabilité', 'Nouvel élément : au suivi, réaliser bassin face et clichés centrés'],
 ['Évaluer la couverture acétabulaire et préparer un greffon', 'Nouvel élément : le fraisage est achevé. Rechercher une forme hémisphérique et de l’os vivant', 'Nouvel élément : la cupule est présentée. Contrôler inclinaison et antéversion', 'Nouvel élément : la cupule ne descend pas. Dévisser, fraiser puis revisser', 'Nouvel élément : le toit est insuffisant. Reconstruire par greffon autologue', 'Nouvel élément : l’implant est stable. Vérifier l’absence de débord vers le psoas', 'Nouvel élément : au suivi, contrôler positionnement et ostéoconduction'],
 ['Prévoir un alésage de calibrage si conflit cortical anticipé', 'Nouvel élément : la râpe est introduite. Favoriser une pénétration externe', 'Nouvel élément : la taille planifiée est atteinte. Vérifier stabilité rotation et varus-valgus', 'Nouvel élément : une râpe inférieure est déjà stable. Ne pas forcer la taille supérieure', 'Nouvel élément : la tête d’essai est en place. Tester flexion-adduction-rotation interne', 'Nouvel élément : la hanche est réduite. Vérifier absence de piston en extension', 'Nouvel élément : au suivi, contrôler stabilité et reconstruction radiographique'],
 ['Conserver et compacter le spongieux dans l’axe diaphysaire', 'Nouvel élément : les râpes progressent. Rechercher stabilité en enfoncement et rotation', 'Nouvel élément : la cupule d’essai est orientée. Adapter pour éviter le conflit psoas', 'Nouvel élément : la réduction est faite. Contrôler tension des fessiers et amplitudes', 'Nouvel élément : la tige définitive est impactée. S’arrêter à la limite de l’HA ou collerette', 'Nouvel élément : la stabilité primaire est parfaite. Lever à 24–48 heures', 'Nouvel élément : au suivi, garder deux cannes pendant 45 jours'],
 ['Ne pas forcer la tige suspendue', 'Nouvel élément : l’excès est d’environ 5 mm. Discuter la longueur de col', 'Nouvel élément : l’excès est supérieur. Retirer la tige et retravailler le site', 'Nouvel élément : le site est repris. Utiliser râpe supérieure, alésage distal ou recreusement selon le cas', 'Nouvel élément : une taille stable est retrouvée. Faire une nouvelle réduction d’essai', 'Nouvel élément : la tête définitive est prévue. Laver et sécher le cône Morse', 'Nouvel élément : au suivi, vérifier marche, douleur et position des implants'],
 ['Arrêter immédiatement l’impaction', 'Nouvel élément : la fissure est confirmée. Réaliser un cerclage', 'Nouvel élément : une tige est à choisir. Privilégier une collerette', 'Nouvel élément : le cône doit recevoir la tête. Le laver puis le sécher', 'Nouvel élément : la tête est mise en place. L’introduire à la main en tournant', 'Nouvel élément : la fermeture débute. Refermer le plan capsuloligamentaire', 'Nouvel élément : au suivi, contrôler douleur, appui et radiographies'],
 ['Autoriser le lever à 24 ou 48 heures', 'Nouvel élément : l’appui débute. Prescrire appui total avec deux cannes 45 jours', 'Nouvel élément : le premier mois passe. Attendre une station monopodale stable vers J30–J45', 'Nouvel élément : le deuxième mois est atteint. Discuter l’abandon des cannes', 'Nouvel élément : les clichés sont réalisés. Vérifier architecture et position des implants', 'Nouvel élément : l’interface est analysée. Rechercher l’ostéoconduction', 'Nouvel élément : à distance, interpréter les résultats avec le recul radioclinique']
];
const dpEvents = [
 ['La superposition des calques confirme une inégalité de longueur et un offset insuffisant.', 'Le calque de cupule est posé sur l’arrière-fond et le toit offre une couverture correcte.', 'Le pivot fémoral est choisi sur le calque.', 'Les implants d’essai sont en place après réduction.', 'La patiente se lève avec une stabilité primaire parfaite.', 'Les clichés de contrôle sont disponibles.'],
 ['Aucun tissu capsulaire ne dépasse du bord cotyloïdien.', 'Un refraisage est réalisé après le recreusement.', 'La géode sous-chondrale a été ouverte.', 'La cupule définitive est prête à être impactée.', 'L’insert définitif est préparé.', 'Le contrôle radiographique de suivi est réalisé.'],
 ['Le fraisage a atteint un os sous-chondral saignant.', 'La cupule vissée est présentée à l’entrée de l’acétabulum.', 'La cupule n’atteint pas le fond malgré le vissage.', 'Le toit acétabulaire reste insuffisant après préparation.', 'La cupule est bloquée et l’insert est en cours de pose.', 'La consultation de suivi retrouve une reprise de marche progressive.'],
 ['La râpe entre dans le canal fémoral.', 'La taille planifiée est atteinte lors de la séquence de râpes.', 'Une râpe plus petite est stable dans tous les plans.', 'La tête d’essai est montée sur la râpe laissée en place.', 'La hanche vient d’être réduite.', 'Les clichés postopératoires sont obtenus.'],
 ['Le spongieux cervical est exposé et doit être préparé.', 'La séquence de râpes Corail est en cours.', 'La cupule d’essai peut encore être orientée.', 'La réduction d’essai est effectuée.', 'L’impaction de la tige définitive est terminée.', 'La patiente sort de salle de réveil avec stabilité primaire parfaite.'],
 ['La différence de niveau de la tige est mesurée à environ 5 mm.', 'La différence de niveau est finalement supérieure à 5 mm.', 'Le site fémoral est repris après retrait de l’implant.', 'Une nouvelle râpe stable est obtenue.', 'La tête définitive est prête à être engagée.', 'La consultation postopératoire évalue la marche.'],
 ['La fissure du calcar est objectivée pendant l’impaction.', 'Le cerclage est disponible au bloc.', 'Le choix d’implant est réévalué après stabilisation.', 'Le cône Morse est exposé avant la tête définitive.', 'La tête est en cours d’impaction.', 'Le premier contrôle radiographique postopératoire est réalisé.'],
 ['Le patient est réveillé à J1 avec une hanche stable.', 'La prescription de cannes est remise au patient.', 'Le patient est revu entre J30 et J45.', 'La consultation de fin de deuxième mois est réalisée.', 'Les clichés de référence sont relus.', 'Un recul clinique et radiographique est disponible.']
];
const dp = dpData.map(([label, vignette], i) => ({ label: `DP ${i + 1} — ${label}`, vignette, questions: dpCorrect[i].map((correct, j) => question(j ? `<p><em>Nouvel élément :</em> ${dpEvents[i][j - 1]}</p><p><em>Question :</em> Quelle conduite est la plus cohérente ?</p>` : '<p><em>Question :</em> Quelle stratégie doit être retenue en premier ?</p>', correct.replace(/^Nouvel élément :[^.]+\.\s*/, ''), ['Différer tout contrôle radiographique', 'Choisir un geste contraire à la planification', 'Négliger les essais peropératoires', 'Ignorer le suivi fonctionnel'], 'La réponse correcte suit la stratégie décrite dans le corpus pour cette étape.')) }));

emitOrthopediePackage({ chapterDir, outputDir, fiche, facts, series: [...qcm, ...dp] });

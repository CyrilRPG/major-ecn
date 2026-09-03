import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { emitOrthopediePackage } from './lib/orthopedie-package.mjs';

const chapterDir = resolve(process.cwd(), '..', '.corpus-orthopedie', 'replantations-distales-du-membre-superieur');
const outputDir = join(chapterDir, 'delivery', 'source-quality-v3');
const fact = (recto, verso) => ({ recto, verso });

// Chaque carte est une notion autonome du texte source (et non une phrase
// découpée mécaniquement). Les réponses restent volontairement brèves pour
// être utilisables en répétition espacée.
const facts = [
  fact('Préparation cutanée initiale', 'Brossage chirurgical avec antiseptique non colorant.'),
  fact('Extrémité souillée de graisse après accident industriel', 'Un solvant tel que l’éther peut être utilisé.'),
  fact('Conditions du parage de l’extrémité proximale', 'Garrot et anesthésie locorégionale.'),
  fact('But du parage cutané', 'Éliminer les berges contuses ou dévitalisées.'),
  fact('Peau de décollement dans une avulsion par dégantage', 'La peau ne gardant qu’une charnière distale doit être sacrifiée.'),
  fact('Moment des incisions d’exposition', 'Lors du temps de parage et de préparation.'),
  fact('Maintien de la rétraction cutanée', 'Fils noués sur la peau.'),
  fact('Accès au médian au poignet', 'Ouverture du canal carpien.'),
  fact('Accès au pédicule ulnaire au poignet', 'Ouverture du canal de Guyon.'),
  fact('Abord distal de l’artère radiale', 'Gouttière du pouls ou sommet du premier espace interosseux dorsal.'),
  fact('Tracé d’incision palmaire recommandé', 'Tracé brisé de type Brunner.'),
  fact('Erreur à éviter dans une incision palmaire', 'Croiser un pli de flexion à angle droit.'),
  fact('Repérage des artères en microchirurgie', 'Clamp adapté à la taille et à la pression de serrage du vaisseau.'),
  fact('Artères à identifier lors d’une amputation au poignet', 'Artères radiale et ulnaire.'),
  fact('Cible artérielle d’une amputation plus distale', 'Arcade palmaire superficielle ou ses branches.'),
  fact('Nerfs à repérer au poignet', 'Médian, ulnaire et branche sensitive du radial.'),
  fact('Nerfs à repérer en transmétacarpien', 'Nerfs digitaux communs ou collatéraux.'),
  fact('Fil mis en place sur les fléchisseurs avant leur suture', 'Fil-boucle résorbable de Tsugé.'),
  fact('Zone de recoupe tendineuse', 'Zone saine, en anticipant le raccourcissement osseux.'),
  fact('Organisation des pinces pour les fléchisseurs', 'Familles distinctes pour superficiels et profonds.'),
  fact('Différenciation distale des fléchisseurs', 'Traction sur l’extrémité distale de chaque tendon.'),
  fact('Repérage des fléchisseurs sur le segment proximal', 'Repères anatomiques, morphologie et disposition spatiale.'),
  fact('Repérage des veines dorsales et extenseurs', 'Méthodique, précis et soigneux avant ostéosynthèse.'),
  fact('Paramètres du parage osseux', 'Ostéosynthèse réalisable et problème de couverture cutanée.'),
  fact('Intérêt du raccourcissement au membre supérieur', 'Il évite souvent pontage vasculaire ou lambeau cutané.'),
  fact('Ostéosynthèse d’une amputation antibrachiale', 'Le plus souvent par plaque vissée.'),
  fact('Instrument du raccourcissement osseux', 'Scie oscillante.'),
  fact('Précaution sur le fragment épiphysaire', 'Conserver assez de longueur pour l’appui de la plaque.'),
  fact('Raccourcissement dans le massif carpien', 'Limité.'),
  fact('Comminution isolée de la première rangée du carpe', 'Résection de la première rangée.'),
  fact('Gain après résection de la première rangée', '10 à 15 mm.'),
  fact('Comminution globale du carpe', 'Peut imposer une carpectomie totale.'),
  fact('Raccourcissement dans une diaphyse métacarpienne', 'Possible avec ostéosynthèse endomédullaire.'),
  fact('Plaque du radius distal lors d’une replantation au poignet', 'Plaque en trèfle antérieure.'),
  fact('Plaque de l’ulna dans ce contexte', 'Plaque moyens fragments ou tiers de tube.'),
  fact('Premier os synthésé au poignet', 'Le radius.'),
  fact('Séquence de pose de la plaque', 'Visser une extrémité après raccourcissement, puis compléter in situ.'),
  fact('Limite des broches ou du clou de Rush pour l’ulna', 'Blocage rotatoire imparfait et risque de pseudarthrose.'),
  fact('Amputation traumatique du poignet et radiocarpienne', 'Elle n’est pas une vraie désarticulation radiocarpienne.'),
  fact('Comminution du carpe après amputation au poignet', 'Toujours présente à un degré variable.'),
  fact('Montage après résection de première rangée', 'Stabilisation en distraction par broches de Kirschner.'),
  fact('Objectif de la distraction radiocarpienne', 'Préserver un degré ultérieur de mobilité de la néoarticulation.'),
  fact('Montage d’arthrodèse radiocarpienne secondaire', 'Type Mannerfelt après résection de première rangée.'),
  fact('Trajet du clou de Rush dans le montage Mannerfelt', 'Troisième métacarpien, grand os, puis radius.'),
  fact('Rôle du cintrage du clou de Rush', 'Donner la dorsiflexion désirée.'),
  fact('Complément antirotatoire du montage Mannerfelt', 'Une ou deux agrafes de Blount.'),
  fact('Arthrodèse radiocarpienne définitive en urgence', 'Pas de place dans la replantation urgente.'),
  fact('Indication secondaire d’arthrodèse radiocarpienne', 'Arthrose ou pseudarthrose après le geste d’urgence.'),
  fact('Ostéosynthèse après carpectomie totale ou subtotale', 'Broches centromédullaires de gros calibre dans les métacarpiens.'),
  fact('Utilité possible d’un spacer de ciment', 'Préserver une loge pour greffe osseuse secondaire.'),
  fact('Complément nécessaire après arthrodèse atypique', 'Apport osseux secondaire.'),
  fact('Greffon en cas de perte osseuse à combler', 'Greffon iliaque et plaque postérieure.'),
  fact('Grand gap diaphysaire métacarpien', 'Greffon osseux vascularisé de crête iliaque antérieure libre possible.'),
  fact('Ostéosynthèse transmétacarpienne diaphysaire', 'Bilboquets centromédullaires avec broche oblique antirotatoire.'),
  fact('Alternative aux bilboquets métacarpiens', 'Plaques vissées.'),
  fact('Montage à la base des métacarpiens', 'Broches de Kirschner complétées par agrafage.'),
  fact('Trait passant par le col métacarpien', 'Bilboquet centromédullaire impossible.'),
  fact('Choix au col métacarpien', 'Broche de Kirschner ou plaque en L vissée.'),
  fact('Destruction métacarpophalangienne', 'Implant en Silastic de type Swanson possible en urgence.'),
  fact('Forme habituelle du trait transmétacarpien', 'Souvent oblique, rarement strictement transversal.'),
  fact('Conséquence d’un trait transmétacarpien oblique', 'Niveaux variables selon les métacarpiens et techniques adaptées.'),
  fact('Qualités attendues de l’ostéosynthèse initiale', 'Simple, rapide et stable.'),
  fact('Objectif temporel de l’ostéosynthèse initiale', 'Permettre rapidement la revascularisation.'),
  fact('Plans fléchisseurs à réparer', 'Superficiels et profonds, successivement.'),
  fact('Limite du fil de Tsugé seul', 'Ses deux brins constituent un axe de rotation.'),
  fact('Complément si pas de surjet épitendineux', 'Points en cadre pour améliorer l’affrontement et bloquer la rotation.'),
  fact('Intérêt tardif de réparer les superficiels', 'Disponibilité pour transferts tendineux ultérieurs.'),
  fact('Position spontanée après réparation des fléchisseurs', 'Flexion marquée des doigts.'),
  fact('Conduite si la flexion gêne le temps palmaire', 'Réparer dès ce stade l’appareil extenseur.'),
  fact('Effet de la réparation des extenseurs', 'Restaure la cascade naturelle des doigts.'),
  fact('Suture des nerfs repérés', 'Méthodes microchirurgicales classiques.'),
  fact('Nerf facile à individualiser au poignet', 'Deux contingents du nerf ulnaire.'),
  fact('Branche nerveuse difficile à distinguer', 'Branche thénarienne du nerf médian.'),
  fact('Conséquence d’une recoupe du médian', 'Correspondance fasciculaire aléatoire.'),
  fact('Lavage avant suture vasculaire', 'Sérum hépariné en amont et en aval avec expulsion des caillots.'),
  fact('Doute sur le flux après avulsion', 'Lâcher le garrot avant la suture.'),
  fact('Condition de suture artérielle', 'Flux vigoureux à pulsations persistantes.'),
  fact('Calibre de fil pour suture artérielle', '9/0 ou 10/0 sous microscope.'),
  fact('Axes artériels à réparer au poignet', 'Radial et ulnaire, si possible.'),
  fact('Intérêt d’un deuxième axe artériel perméable', 'Atout pour un transfert tissulaire libre ultérieur.'),
  fact('Greffon pour pontage radial ou ulnaire au poignet', 'Veine céphalique ou basilique de l’avant-bras.'),
  fact('Greffon veineux pour très grande longueur', 'Veine saphène, préférentiellement sur sa moitié distale.'),
  fact('Cible artérielle dans la paume transmétacarpienne', 'Branches de l’arcade palmaire superficielle.'),
  fact('Règle idéale de réparation artérielle digitale', 'Réparer chaque vaisseau sectionné.'),
  fact('Artère dont le pontage peut être différé après suture du premier espace', 'Collatérale radiale de l’index.'),
  fact('Greffon pour reconstituer l’arcade palmaire superficielle', 'Arcade veineuse superficielle du dos du pied.'),
  fact('Avantage de l’arcade veineuse dorsale du pied', 'Moins d’anastomoses que des pontages multiples.'),
  fact('Exposition du temps dorsal', 'Changement d’installation.'),
  fact('Suture des tendons extenseurs', 'Points en cadre.'),
  fact('Recoupe des extenseurs', 'Elle tient compte du raccourcissement osseux.'),
  fact('Pourquoi régler précisément les extenseurs', 'Leur corps musculaire s’adapte peu à l’excès de longueur.'),
  fact('Nombre de veines dorsales superficielles anastomosées', 'Deux.'),
  fact('Perte de substance veineuse', 'Greffon veineux interposé.'),
  fact('Veines de retour non anastomosées', 'Ligaturées pour favoriser le retour vers les veines réparées.'),
  fact('Fermeture cutanée de replantation', 'Points séparés lâches, non étanches.'),
  fact('Condition d’une fermeture cutanée sans tension', 'Raccourcissement osseux planifié de façon optimale.'),
  fact('Greffe cutanée limitée', 'Relâche la tension d’une suture et peut couvrir un court pontage.'),
  fact('Défect dorsal de 1 à 2 cm', 'Lambeau bipédiculé.'),
  fact('Zone peu propice aux lambeaux locaux', 'Face palmaire à peau fixée.'),
  fact('Lambeau interosseux postérieur', 'Couvre une perte dorsale distale si les anastomoses sont présentes.'),
  fact('Lambeau chinois en replantation', 'Sans place : dépend de l’arcade palmaire profonde.'),
  fact('Couverture des larges défects', 'Lambeau de Mac Gregor ou inguinal pédiculé.'),
  fact('Inconvénient du lambeau inguinal pédiculé', 'Nursing difficile, inconfort et prélèvement aux dépens du receveur.'),
  fact('Délai prudent pour un lambeau libre', '48 heures après la replantation.'),
  fact('Information préopératoire du patient', 'Risque de reprise précoce et d’échec vasculaire.'),
  fact('Tabac avant replantation', 'Arrêt total et immédiat indispensable.'),
  fact('Critère central de surveillance postopératoire', 'Examen clinique du fragment replanté.'),
  fact('Paramètres cliniques de surveillance', 'Coloration, température, pouls cutané et tonicité pulpaire.'),
  fact('Signe favorable de perfusion pulpaire', 'Réexpansion spontanée après dépression.'),
  fact('Monitorage paraclinique systématique', 'Non utilisé : surveillance clinique rapprochée.'),
  fact('Période critique après replantation', '48 à 72 premières heures.'),
  fact('Délai de reprise à viser après signes de souffrance', 'Dans les 3 premières heures.'),
  fact('Signes d’insuffisance veineuse', 'Cyanose et accélération du pouls cutané.'),
  fact('Signes d’insuffisance artérielle', 'Pâleur, froideur, pouls ralenti ou absent, pulpe vide.'),
  fact('Mesures au lit avant reprise au bloc', 'Éliminer compression du pansement et lâcher les points.'),
  fact('Cause extrinsèque de souffrance vasculaire', 'Hématome compressif.'),
  fact('Solution après thrombose de suture primaire', 'Pontage à la place de la suture thrombosée.'),
  fact('Candidat a priori à une replantation distale', 'Toute amputation au poignet ou au-delà, après bilan.'),
  fact('Priorité en cas de polytraumatisme', 'Traiter d’abord les lésions vitales associées.'),
  fact('Fracture proximale associée au membre mutilé', 'La stabiliser avant la replantation.'),
  fact('Lésions étagées du fragment amputé', 'Peuvent contre-indiquer formellement la replantation.'),
  fact('Avulsion au poignet ou distalement', 'Pronostic péjoratif sans contre-indication formelle.'),
  fact('Crush et indication de replantation', 'Possible si la couverture cutanée est maîtrisable.'),
  fact('Condition humaine de l’indication', 'Adhésion du patient à un programme long, rééducation comprise.'),
];

const row = (concept, ...values) => {
  const image = values.find((value) => value && typeof value === 'object' && value.path);
  return { concept, bullets: values.filter((value) => !value || typeof value !== 'object' || !value.path), ...(image ? { image } : {}) };
};
const fiche = {
  title: 'Replantations distales du membre supérieur', year: '2025-2026', coverSubtitle: 'Item d’orthopédie',
  sourceBlocks: [1, 4, 6, 7, 19, 22, 26, 31, 35, 40],
  imageException: { reason: 'Le corpus ne contient que cinq figures exploitables pour ce chapitre ; aucune figure supplémentaire n’est inventée.' },
  parts: [
    { title: 'Évaluation et préparation de l’urgence', sections: [
      { title: 'Candidature à la replantation', rows: [row('Indication initiale', 'Toute amputation au poignet ou au-delà est discutée comme candidate à la replantation.', 'Le bilan local et général mesure le bien-fondé de l’indication.'), row('Priorités générales', 'Un polytraumatisme ou une lésion crânienne, abdominale ou thoracique est traité avant l’amputation.', 'L’anesthésie prolongée et la déperdition sanguine sont ensuite réévaluées.'), row('Bilan local et adhésion', 'Une fracture proximale associée est stabilisée avant la replantation.', 'La compréhension du risque d’échec vasculaire et l’adhésion au programme de rééducation sont nécessaires.')] },
      { title: 'Parage et repérage', rows: [row('Parage cutané', 'Brossage avec antiseptique non colorant ; élimination des berges contuses ou dévitalisées.', 'En dégantage par avulsion, une peau décollée ne gardant qu’une charnière distale est sacrifiée.'), row('Voies d’abord', 'Au poignet, canal carpien et canal de Guyon exposent médian, fléchisseurs et pédicule ulnaire.', 'Dans la paume, les tracés brisés de Brunner évitent les croisements à angle droit des plis de flexion.'), row('Repérage des structures', 'Au poignet : artères radiale et ulnaire, médian, ulnaire et branche sensitive du radial.', 'En transmétacarpien : arcade palmaire superficielle, nerfs digitaux communs ou collatéraux.', { path: 'img/img_001.png', position: 'after', size: 'large', caption: 'Préparation transmétacarpienne : artères, nerfs et fléchisseurs repérés.', sourceCaption: 'Figure 1. Préparation des deux extrémités en cas de replantation transmétacarpienne. Artères (1) et nerfs (2) disséqués et repérés ; 3. fils de Tsugé repérant les tendons fléchisseurs ; 4. bilboquets en place dans la cavité médullaire des métacarpiens.' })] }
    ] },
    { title: 'Stabilisation osseuse selon le niveau', sections: [
      { title: 'Raccourcissement et poignet', rows: [row('Raccourcissement osseux', 'Il anticipe le montage et la couverture cutanée.', 'À la scie oscillante, il conserve au fragment épiphysaire la longueur nécessaire à la plaque.'), row('Segment antibrachial', 'La solution habituelle est une plaque vissée : plaque en trèfle antérieure au radius distal, plaque adaptée à l’ulna.', 'La synthèse débute par le radius après raccourcissement.', { path: 'img/img_002.png', position: 'after', size: 'small' }), row('Massif carpien', 'La comminution de première rangée peut conduire à sa résection, procurant 10 à 15 mm.', 'La distraction par broches conserve une option de mobilité ; l’arthrodèse définitive est secondaire.', { path: 'img/img_003.png', position: 'after', size: 'large', caption: 'Options de stabilisation après comminution carpienne.', sourceCaption: 'Figure 3. Replantation au poignet (carpe). A. Comminution de la première rangée. B. Stabilisation en distraction. C. Arthrodèse après résection de la première rangée.' })] },
      { title: 'Niveau transmétacarpien', rows: [row('Diaphyses métacarpiennes', 'Bilboquets centromédullaires complétés par une broche oblique antirotatoire.', 'Une plaque vissée est une alternative.'), row('Base et col métacarpiens', 'À la base : broches de Kirschner complétées par agrafage.', 'Au col, le bilboquet n’est plus possible : broche ou plaque en L.'), row('Principe de montage', 'Le trait est souvent oblique et peut différer selon chaque métacarpien.', 'Le montage doit rester simple, rapide et stable avant revascularisation.', { path: 'img/img_004.png', position: 'after', size: 'large', caption: 'Montages de replantation transmétacarpienne.', sourceCaption: 'Figure 4. Replantation d’une amputation transmétacarpienne. A, A’. Ostéosynthèse par bilboquet centromédullaire. Blocage de la rotation par une broche de Kirschner oblique. B, B’. Amputation transmétacarpienne oblique : plaque en L vissée sur M2 ; bilboquet bloqué sur M3 ; broches de Kirschner sur M4 ; agrafage de la métaphyse de M5.' })] }
    ] },
    { title: 'Réparation des tissus et revascularisation', sections: [
      { title: 'Tendons et nerfs', rows: [row('Fléchisseurs', 'Les superficiels et profonds sont repérés avec un fil-boucle de Tsugé et réparés successivement.', 'Un surjet épitendineux ou des points en cadre complètent le fil de Tsugé pour bloquer la rotation.'), row('Équilibre tendineux', 'Après réparation des fléchisseurs, une flexion marquée peut gêner le temps palmaire.', 'La réparation des extenseurs rétablit la cascade naturelle et tient compte du raccourcissement osseux.'), row('Nerfs', 'Les nerfs sont suturés selon les méthodes microchirurgicales.', 'La branche thénarienne du médian est difficile à distinguer et une recoupe rend la correspondance fasciculaire aléatoire.')] },
      { title: 'Axes artériels et retour veineux', rows: [row('Contrôle avant suture', 'Lavage au sérum hépariné en amont et aval avec expulsion des caillots.', 'En cas d’avulsion ou de flux douteux, le garrot est lâché pour exiger des pulsations vigoureuses persistantes.'), row('Revascularisation', 'Au poignet, les artères radiale et ulnaire sont réparées sous microscope au fil 9/0 ou 10/0.', 'Un pontage peut utiliser une veine céphalique, basilique ou saphène selon la longueur.'), row('Arcade palmaire et veines', 'L’arcade veineuse dorsale du pied peut reconstituer l’arcade palmaire superficielle avec peu d’anastomoses.', 'Deux veines dorsales superficielles sont anastomosées ; un défect impose un greffon veineux.', { path: 'img/img_005.png', position: 'after', size: 'large', caption: 'Greffon veineux pour l’arcade palmaire superficielle.', sourceCaption: 'Figure 5. A. Amputation transmétacarpienne. Perte de substance sur l’arcade palmaire superficielle. B. Prélèvement de l’arcade veineuse dorsale du pied. C. Utilisation de cette arcade veineuse pour rétablir la continuité artérielle.' })] }
    ] },
    { title: 'Couverture, surveillance et reprise', sections: [
      { title: 'Couverture cutanée', rows: [row('Fermeture primaire', 'Points séparés lâches et non étanches après hémostase.', 'Le raccourcissement optimal doit permettre une fermeture sans tension.'), row('Solutions locales', 'Une greffe mince relâche une suture tendue et peut couvrir un court pontage.', 'Au dos de la main, un lambeau bipédiculé couvre un défect de 1 à 2 cm.'), row('Grand défect', 'La peau palmaire fixée se prête mal aux lambeaux locaux.', 'Un lambeau inguinal/Mac Gregor couvre les pertes larges ; un lambeau libre est prudent après 48 heures.')] },
      { title: 'Surveillance et échec vasculaire', rows: [row('Surveillance clinique', 'Coloration, température, pouls cutané, tonicité et réexpansion pulpaire sont essentiels.', 'Elle est régulière et rapprochée durant les 48 à 72 premières heures.'), row('Sémiologie de souffrance', 'Insuffisance veineuse : cyanose et pouls cutané accéléré.', 'Insuffisance artérielle : pâleur, froideur, pouls ralenti ou absent et pulpe vide.'), row('Reprise précoce', 'Avant le bloc, rechercher pansement compressif, hématome ou points à lâcher.', 'La reprise a le plus de chances de succès dans les 3 premières heures ; une suture thrombosée peut nécessiter un pontage.')] }
    ] }
  ],
  synthesis: { chiffres: { headers: ['Repère', 'Valeur'], rows: [['Résection première rangée', '10 à 15 mm de gain'], ['Défect dorsal local', '1 à 2 cm'], ['Lambeau libre', 'Prudent à 48 h'], ['Reprise vasculaire', 'Dans les 3 premières heures'], ['Surveillance critique', '48 à 72 h']] }, tables: [{ title: 'Choix de l’ostéosynthèse', headers: ['Niveau', 'Montage'], rows: [['Antébrachial', 'Plaques vissées'], ['Carpe comminutif', 'Résection / distraction ; arthrodèse secondaire'], ['Diaphyse métacarpienne', 'Bilboquets + broche antirotatoire'], ['Col métacarpien', 'Broche ou plaque en L']] }, { title: 'Souffrance du fragment', headers: ['Profil', 'Signes et conduite'], rows: [['Veineux', 'Cyanose, pouls accéléré ; lever toute compression et reprendre vite'], ['Artériel', 'Pâleur, froideur, pulpe vide ; contrôle urgent et révision vasculaire']] }], keyPoints: ['La priorité est le bilan général et local avant toute replantation.', 'Le repérage systématique précède l’ostéosynthèse.', 'Le montage osseux prépare une revascularisation rapide.', 'Les axes artériels sont contrôlés avant anastomose.', 'La surveillance clinique rapprochée guide la reprise.', 'Toute souffrance vasculaire impose une réaction immédiate.'], eclair: ['Candidat : amputation au poignet ou au-delà, après bilan.', 'Parage : peau viable, repérage méthodique, anticipation de la couverture.', 'Os : raccourcir avec économie, montage stable et rapide.', 'Tendons : réparer deux plans, restaurer la cascade.', 'Vaisseaux : flux vigoureux avant suture ; deux veines dorsales.', 'Surveillance : couleur, température, pouls cutané, pulpe.', 'Reprise : idéalement dans les 3 heures après la souffrance.'] }
};

const makeItems = (correct, seed) => {
  const distractors = [1, 23, 47, 79].map((offset) => facts[(seed * 11 + offset) % facts.length].verso).filter((value) => value !== correct);
  return [correct, ...distractors.slice(0, 4)].map((enonce, index) => ({
    lettre: 'ABCDE'[index], enonce, is_correct: index === 0,
    justification: index === 0 ? 'Conforme au chapitre source.' : 'Énoncé source exact, mais ne répond pas à la situation demandée.',
  }));
};
const prompts = ['Quelle conduite est correcte concernant', 'Quel élément du protocole concerne', 'Quelle affirmation est conforme au cours pour', 'Quel choix est justifié au sujet de', 'Quelle mesure faut-il retenir pour'];
const qcmStarts = [0, 15, 29, 45, 60, 72, 88, 104];
const qcm = Array.from({ length: 8 }, (_, serieIndex) => ({
  label: `QCM ${serieIndex + 1} — ${['Préparation', 'Ostéosynthèse', 'Tendons et nerfs', 'Artères et veines', 'Couverture', 'Surveillance', 'Indications', 'Synthèse'][serieIndex]}`,
  questions: facts.slice(qcmStarts[serieIndex], qcmStarts[serieIndex] + 5).map((f, index) => ({ enonce: `${prompts[(serieIndex + index) % prompts.length]} « ${f.recto.toLowerCase()} » ?`, items: makeItems(f.verso, index) })),
}));
const dpThemes = [
  ['amputation au poignet après accident industriel', 0], ['avulsion transmétacarpienne avec peau décollée', 8], ['section antibrachiale avec fracture proximale associée', 24], ['comminution carpienne au poignet', 29], ['amputation diaphysaire métacarpienne oblique', 52], ['perte de substance de l’arcade palmaire', 75], ['défect dorsal et difficulté de fermeture', 90], ['souffrance postopératoire du fragment replanté', 105],
];
const dp = dpThemes.map(([theme, start], serieIndex) => {
  const selected = Array.from({ length: 7 }, (_, i) => facts[(start + i) % facts.length]);
  const vignette = `Un patient de ${28 + serieIndex * 4} ans est admis après ${theme}. Le bilan général est stabilisé et l’équipe spécialisée discute une replantation distale. Le patient est informé du risque d’échec vasculaire, des reprises précoces possibles et du programme de rééducation. Au bloc, les décisions sont prises selon le niveau de section, l’état des tissus et la couverture cutanée. Le suivi postopératoire prévoit une surveillance clinique rapprochée du fragment replanté pendant les premiers jours.`;
  return { label: `DP ${serieIndex + 1} — ${theme}`, vignette, questions: selected.map((f, i) => ({
    enonce: i === 0 ? `À l’évaluation initiale de ce patient, quelle conduite concernant « ${f.recto.toLowerCase()} » est adaptée ?` : `Nouvel élément : ${['le bilan opératoire précise', 'la préparation cutanée retrouve', 'le montage osseux doit intégrer', 'le contrôle microvasculaire montre', 'la couverture est discutée devant', 'le suivi du fragment met en évidence'][i - 1]} « ${f.recto.toLowerCase()} ». Quelle proposition est exacte ?`,
    items: makeItems(f.verso, i),
  })) };
});

emitOrthopediePackage({ chapterDir, outputDir, fiche, facts, series: [...qcm, ...dp] });

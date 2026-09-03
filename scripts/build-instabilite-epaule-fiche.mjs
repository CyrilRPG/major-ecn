/** Éditable, source-led fiche: open treatment of chronic shoulder instability. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { compileFicheModel } from './lib/orthopedie-fiche.mjs';

const chapterDir = resolve(process.argv[2] || '../.corpus-orthopedie/instabilite-chronique-anterieure-et-posterieure-de-l-epaule-technique-convention');
const out = resolve(process.argv[3] || join(chapterDir, 'delivery', '2026-08-10-source-rebuild'));
mkdirSync(out, { recursive: true });
const R = (concept, bullets, marker) => ({ concept, bullets, ...(marker ? { marker } : {}) });
const fiche = {
  title: 'Instabilité chronique antérieure et postérieure de l’épaule : traitement à ciel ouvert',
  year: '2025-2026', coverSubtitle: 'Bilan · stabilisation · gestes osseux et capsulaires',
  sourceBlocks: [9,14,15,18,21,24,28,31,33,35,39,41,44,50,52,54,60,65,66,67,68,75,77,78,79,80,81,85,86,88,89,90,110,113,116,117,118,120,123,130,134,135,143,144,145,151,159,161,163,171,175,177,178],
  imageException: { reason: 'Les légendes exploitables du corpus ne permettent pas d’identifier de façon fiable les figures ; aucune légende n’est inventée.' },
  parts: [
    { title: 'Définir l’instabilité et préparer la décision', sections: [
      { title: 'Instabilité, laxité et stabilisateurs', rows: [
        R('Instabilité chronique', ['Elle correspond à une sensation récurrente de translation pathologique glénohumérale ou à l’incapacité à maintenir la tête humérale centrée.', 'Elle peut se manifester par une subluxation perçue et autoréductible, ou une luxation récidivante nécessitant une réduction.', 'Une épaule douloureuse avec lésions capsuloligamentaires objectives appartient aussi au champ diagnostique.']),
        R('Ne pas confondre laxité et instabilité', ['La laxité est une translation ou une rotation supérieure à la normale à l’examen, sans symptôme perçu.', 'Après une première luxation, l’âge, l’activité physique, l’observance initiale et les lésions associées influencent la récidive.']),
        R('Stabilisateurs glénohuméraux', ['Les stabilisateurs statiques incluent cartilage, capsule, labrum, ligaments glénohuméraux, ligament coracohuméral, architecture osseuse et pression négative.', 'Les stabilisateurs dynamiques sont la coiffe, le long biceps, le deltoïde et la proprioception.', 'La faible surface de contact glène-tête humérale explique la vulnérabilité de cette articulation.'], 'ecn')
      ] },
      { title: 'Bilan avant stabilisation', rows: [
        R('Évaluation préopératoire', ['Elle détermine l’étiologie, la voie d’abord et les gestes nécessaires.', 'Elle associe examen clinique et imagerie complète : radiographies, TDM et IRM.', 'L’abord à ciel ouvert donne un jour limité : le projet ne se corrige pas par une exploration improvisée.'], 'trap'),
        R('Instabilité antérieure', ['Chez le sujet jeune après luxation, les lésions labrales et le risque d’instabilité sont importants.', 'Chez le sujet plus âgé, une rupture de coiffe, surtout du subscapulaire, doit être suspectée si douleurs et faiblesse persistent après l’épisode.']),
        R('Choisir la famille de réparation', ['Une réparation anatomique réinsère labrum et structures capsuloligamentaires à leur position normale.', 'Les gestes non anatomiques reposent surtout sur une butée osseuse, le comblement d’une encoche ou une ostéotomie.', 'Les pertes de substance osseuse, de tissus mous et les échecs antérieurs pèsent dans le choix.'])
      ] }
    ] },
    { title: 'Maîtriser l’abord antérieur et ses risques', sections: [
      { title: 'Installation, anesthésie et voie deltopectorale', rows: [
        R('Anesthésie et analgésie', ['L’intervention est réalisable sous anesthésie générale ou locorégionale, avec infiltration locale complémentaire si nécessaire.', 'Le bloc interscalénique participe au contrôle péri- et postopératoire de la douleur ; un cathéter peut prolonger son efficacité.', 'Une antibioprophylaxie est justifiée lorsqu’un implant est posé.']),
        R('Installation', ['La position demi-assise facilite drainage et hypotension contrôlée ; le décubitus dorsal strict dépend des habitudes.', 'Le moignon de l’épaule doit rester libre pour écarter la tête humérale vers l’arrière.', 'Commencer par un examen sous anesthésie, comparatif, pour quantifier la laxité et vérifier les amplitudes.']),
        R('Abord deltopectoral', ['C’est la voie habituelle de la chirurgie ouverte de l’instabilité antérieure.', 'Elle permet gestes osseux et capsulaires sans désinsertion du plan musculaire superficiel.', 'L’incision suit le sillon deltopectoral, depuis la coracoïde vers le pli axillaire.'], 'ecn')
      ] },
      { title: 'Plans profonds et sécurité', rows: [
        R('Veine céphalique', ['La première étape est le repérage du sillon deltopectoral.', 'La veine céphalique est laissée au contact du deltoïde, dont la plupart des branches naissent du bord latéral.', 'L’hémostase préventive de la branche acromiale limite le risque d’hématome.']),
        R('Subscapulaire', ['L’abord capsulaire actuel utilise classiquement une section verticale du tendon, réalisée progressivement sans ouvrir la capsule en bas.', 'Préserver les fibres basses et contrôler les vaisseaux circonflexes antérieurs.', 'La réparation tendineuse conditionne la limitation postopératoire de la rotation latérale.'], 'trap'),
        R('Nerfs à protéger', ['Le nerf axillaire croise la capsule au bord inférieur du subscapulaire : la dissection inférieure impose une prudence particulière.', 'Le nerf musculocutané impose de ne pas disséquer le tendon conjoint au-delà de 2,5 cm de la coracoïde.', 'Les branches subscapulaires pénètrent le muscle près du rebord glénoïdien : respecter la limite médiale de dissection.'])
      ] }
    ] },
    { title: 'Traiter l’instabilité antérieure', sections: [
      { title: 'Réparation anatomique', rows: [
        R('Objectif de Bankart', ['La procédure répare l’avulsion antérieure du labrum et des ligaments glénohuméraux sur le rebord glénoïdien.', 'Elle restaure la tension capsuloligamentaire et la concavité glénoïdienne.', 'Une ALPSA correspond à une cicatrisation médialisée du complexe labroligamentaire.']),
        R('Ancrage et réinsertion', ['Après avivement du rebord, les orifices ou ancres permettent de réinsérer le complexe au niveau du rebord antérieur.', 'Les ancres doivent recréer un bourrelet sans saillie intra-articulaire.', 'Un nombre suffisant de points limite la récidive tout en évitant une fracture des ponts osseux.']),
        R('Retension capsulaire', ['Le serrage des points capsulaires doit respecter la rotation latérale pour ne pas créer de raideur postopératoire.', 'En cas d’hyperlaxité, une capsulorraphie peut s’associer à Bankart.', 'Une capsulorraphie isolée n’est plus indiquée dans l’instabilité post-traumatique antérieure.'], 'trap')
      ] },
      { title: 'Gestes osseux et lésions associées', rows: [
        R('Butée coracoïdienne de Latarjet', ['Elle fixe la branche horizontale de la coracoïde à la partie antéro-inférieure de la glène.', 'Elle associe effet hamac du tendon conjoint, augmentation osseuse de surface de contact et réparation capsulaire.', 'Elle se discute en présence de pertes osseuses glénoïdiennes antérieures et de laxité antéro-inférieure.'], 'ecn'),
        R('Déficience capsulaire', ['Une déficience capsulaire peut expliquer une récidive, surtout après échecs multiples, et inclure le subscapulaire.', 'Des autogreffes ou allogreffes tendineuses peuvent renforcer ou reconstruire la capsule antérieure.']),
        R('Encoche de Hill-Sachs', ['L’encoche postérieure de la tête humérale est classique après instabilité antérieure.', 'Les lésions engageantes peuvent s’accrocher au rebord antéro-inférieur en abduction-rotation externe.', 'Le comblement vise à supprimer ce mécanisme d’engagement.'])
      ] }
    ] },
    { title: 'Traiter l’instabilité postérieure et suivre le patient', sections: [
      { title: 'Comprendre l’instabilité postérieure', rows: [
        R('Formes lésionnelles', ['Les lésions peuvent être labrales postérieures isolées ou associées à un décollement capsulopériosté de type reverse Bankart.', 'Les formes atraumatiques sont souvent associées à une distension capsuloligamentaire postéro-inférieure.', 'Les formes traumatiques peuvent comporter une encoche antéromédiale de type reverse Hill-Sachs.']),
        R('Anomalies osseuses', ['Rétroversion excessive de glène ou d’humérus, glène plate ou dysplasique peuvent favoriser l’instabilité.', 'La taille et la profondeur des lésions osseuses conditionnent les possibilités thérapeutiques.', 'Une anomalie glénoïdienne rare doit être recherchée car elle favorise la récidive.']),
        R('Conservateur d’abord', ['Le traitement de première intention associe douleur, adaptation des activités, éducation et rééducation.', 'La rééducation renforce rotateurs externes, deltoïde et muscles périscapulaires et restaure le contrôle dynamique.'])
      ] },
      { title: 'Chirurgie postérieure et rééducation', rows: [
        R('Butée postérieure', ['Le greffon est positionné en situation extracapsulaire sur le col postérieur de la scapula et prolonge la surface glénoïdienne.', 'Le débord latéral doit être limité et réparti sur la hauteur glénoïdienne, sans effet butoir direct.', 'La fixation en compression doit préserver le pédicule suprascapulaire.'], 'ecn'),
        R('Capsulorraphie postérieure', ['Elle est indiquée dans certaines instabilités récidivantes unidirectionnelles, postéro-inférieures ou multidirectionnelles dominantes.', 'Une lésion de Bankart postérieure traumatique peut bénéficier d’une réinsertion glénoïdienne transosseuse ou par ancres.', 'La retension ne doit pas réduire excessivement la rotation médiale.']),
        R('Suites et surveillance', ['Après chirurgie postérieure, l’immobilisation est coude au corps ou en légère abduction et rotation neutre pendant six semaines.', 'La mobilisation passive débute précocement en évitant la rotation médiale ; le travail actif commence après le sevrage.', 'Les activités au-dessus de l’horizontale restent interdites pendant six mois.'], 'trap')
      ] }
    ] }
  ],
  synthesis: {
    chiffres: { headers: ['Repère', 'Valeur du corpus', 'Utilité'], rows: [['Disséquer le tendon conjoint', 'Pas au-delà de 2,5 cm de la coracoïde', 'Protéger le nerf musculocutané'], ['Capsulotomie de Bankart', 'À 0,5 cm du rebord glénoïdien', 'Exposer et préserver les structures'], ['Immobilisation postérieure', 'Six semaines', 'Protéger la réparation'], ['Sport après ostéotomie', '12e à 16e semaine après consolidation', 'Reprise progressive']] },
    tables: [
      { title: 'Avant de choisir le geste', headers: ['Question', 'Éléments', 'Orientation'], rows: [['Instabilité ou laxité ?', 'Symptômes perçus et retentissement', 'Ne pas opérer une laxité asymptomatique'], ['Lésion principale ?', 'Labrum, capsule, os, coiffe, encoche', 'Réparation anatomique ou geste associé'], ['Terrain ?', 'Âge, activité, épisodes, échecs', 'Adapter l’indication'], ['Imagerie ?', 'Radiographies, TDM, IRM', 'Cartographier les facteurs anatomiques']] },
      { title: 'Repères de stratégie', headers: ['Situation', 'Principe', 'Vigilance'], rows: [['Bankart antérieur', 'Réinsérer labrum et retendre capsule', 'Prévenir la raideur en respectant la rotation latérale'], ['Hyperlaxité', 'Ajouter une capsulorraphie selon les lésions', 'Éviter une réparation isolée inadaptée'], ['Perte osseuse antérieure', 'Discuter une butée coracoïdienne', 'Positionnement stable et affleurant'], ['Instabilité postérieure', 'Conservateur initial puis correction ciblée', 'Traiter os, labrum et capsule selon le mécanisme']] }
    ],
    keyPoints: ['L’instabilité est symptomatique ; la laxité ne l’est pas nécessairement.', 'Le bilan clinique et d’imagerie précède tout abord à ciel ouvert.', 'La voie deltopectorale donne accès aux gestes capsulaires et osseux antérieurs.', 'La protection du subscapulaire et des nerfs axillaire, musculocutané et subscapulaire est centrale.', 'Bankart restaure le complexe labroligamentaire ; la capsulorraphie traite une distension associée.', 'La butée coracoïdienne répond aux situations à déficit osseux et/ou de forte instabilité antéro-inférieure.', 'L’instabilité postérieure commence par un traitement conservateur ; la chirurgie reste mécanisme-dépendante.'],
    eclair: ['Distinguer instabilité symptomatique, laxité asymptomatique et épaule douloureuse lésionnelle.', 'Avant l’ouverture : clinique comparatif, radiographies, TDM et IRM.', 'Voie antérieure : deltopectorale ; identifier veine céphalique et protéger subscapulaire et nerfs.', 'Bankart : réinsertion labrum-ligaments ; hyperlaxité : capsulorraphie associée.', 'Déficit osseux antérieur : raisonner une butée coracoïdienne.', 'Postérieur : rééducation d’abord ; analyser reverse Bankart, capsule et os.', 'Après réparation postérieure : protection six semaines puis rééducation progressive.']
  }
};
writeFileSync(join(out, 'fiche.model.json'), `${JSON.stringify(fiche, null, 2)}\n`, 'utf8');
writeFileSync(join(out, 'fiche.body.html'), compileFicheModel(fiche, chapterDir), 'utf8');
console.log(`Fiche créée : ${out}`);

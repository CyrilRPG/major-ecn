/**
 * Chapitre 115 — Traitement chirurgical des lésions du LCA.
 * Édition source-only : chaque fait porte le numéro du bloc extract.json.
 * Aucun texte ou question n'est créé par découpage de phrases.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { compileFicheModel } from './lib/orthopedie-fiche.mjs';

const chapterDir = resolve(process.argv[2] || '..\\.corpus-orthopedie\\traitement-chirurgicale-des-lesions-du-lca');
const out = resolve(process.argv[3] || join(chapterDir, 'delivery', 'quality-v2'));
mkdirSync(out, { recursive: true });
const image = (n) => ({ path: `img/img_${String(n).padStart(3, '0')}.png`, position: 'after', size: 'large' });
const row = (concept, bullets, extra = {}) => ({ concept, bullets, ...extra });
const note = (kind, bullets) => ({ kind, bullets });

const fiche = {
  title: 'Traitement chirurgical des lésions du LCA',
  year: '2025-2026',
  sourceBlocks: [1, 4, 8, 10, 12, 14, 17, 19, 21, 27, 29, 30, 32, 34, 38, 40, 42, 45, 47, 54, 56, 61, 66, 67, 69, 72, 77, 80, 83, 87, 92, 94, 97, 100, 104, 109, 115, 120, 126, 141, 143, 148, 169, 171, 173, 176, 178, 183],
  parts: [
    { title: 'Anatomie, indication et stratégie', sections: [
      { title: 'Rôle fonctionnel du LCA', rows: [
        row('Stabilité antérieure', ['Le LCA contrôle la translation tibiale antérieure.', 'Il participe au contrôle de la stabilité rotatoire et à la synchronisation du condyle fémoral latéral avec le plateau tibial.'], { image: image(1) }),
        row('Faisceaux', ['Le faisceau antéromédial est sollicité en extension et le faisceau postérolatéral contribue au contrôle rotatoire.', 'La reconstruction cherche à reproduire une insertion et une orientation compatibles avec ces fonctions.']),
        row('Objectif de la ligamentoplastie', ['Restaurer une stabilité compatible avec les activités du patient.', 'Prévenir une reconstruction mal positionnée, source de conflit, de laxité résiduelle ou d’échec.'], { marker: 'yield' }),
      ] },
      { title: 'Choix de la technique', rows: [
        row('Arthroscopie', ['Elle permet un bilan articulaire complet et le traitement des lésions méniscales ou cartilagineuses associées.', 'Le cours rapporte moins d’algodystrophie et de syndrome rotulien qu’après arthrotomie, avec une meilleure récupération précoce.']),
        row('Greffons disponibles', ['Ligament patellaire, ischiojambiers, tendon quadricipital et fascia lata sont décrits.', 'Les allogreffes tendineuses sont peu utilisées en France et plutôt réservées aux reconstructions itératives.']),
        row('Mono ou bifaisceau', ['Le bifaisceau vise un meilleur contrôle de la laxité rotatoire, mais augmente complexité, durée, coût et difficultés de reprise.', 'La maîtrise de la technique monofaisceau est un préalable à la reconstruction à deux faisceaux.'], { image: image(2) }),
      ] },
    ] },
    { title: 'Greffon et fixation', sections: [
      { title: 'Choisir et préparer le greffon', rows: [
        row('Ligament patellaire', ['La reconstruction os-tendon-os est une technique de référence à maîtriser.', 'Le prélèvement conditionne le résultat et impose un bilan radiographique préopératoire de l’appareil extenseur.'], { image: image(3) }),
        row('Ischiojambiers', ['Le gracilis et le demi-tendineux sont prélevés au voisinage de la patte-d’oie.', 'La branche sensitive du nerf saphène médial et les expansions du demi-tendineux doivent être respectées.'], { image: image(9) }),
        row('Tendon quadricipital', ['C’est un transplant mixte dont les principes de reconstruction rejoignent ceux du tendon patellaire ou des ischiojambiers.', 'La particularité porte sur le prélèvement ; la nappe tendineuse profonde est préservée.'], { image: image(11) }),
      ] },
      { title: 'Principes de fixation', rows: [
        row('Phase mécanique puis biologique', ['Dans les premières semaines, la fixation mécanique est le point faible du montage.', 'Le relais est ensuite pris par la fixation biologique ; le couple greffon-fixation doit être raisonné au fémur comme au tibia.']),
        row('Types de fixation', ['Les fixations sont classées selon leur position par rapport à l’orifice intra-articulaire : proximale, intermédiaire ou distale.', 'Press-fit, vis d’interférence, endobouton, agrafes, vis-rondelle et TransFix® sont décrits.']),
        row('Facteurs de résistance', ['La surface de contact os-greffe, le moyen de fixation et le type de greffe influencent la résistance.', 'La densité spongieuse, le diamètre de vis et la divergence vis-baguette osseuse sont des déterminants pratiques.'], { marker: 'trap' }),
      ] },
    ] },
    { title: 'Reconstruction monofaisceau : installation et tunnels', sections: [
      { title: 'Préparation et installation', rows: [
        row('Préparation cutanée', ['La dépilation est limitée aux zones d’incision potentielles en cas de pilosité importante.', 'Le badigeonnage antiseptique est réalisé avant l’entrée en salle puis juste avant le champage.']),
        row('Installation', ['Le genou doit pouvoir être fléchi à au moins 90° et conserver les amplitudes nécessaires aux temps arthroscopiques.', 'Les repères cutanés utiles comprennent rotule, tendon rotulien, tubérosité tibiale, interlignes et tête fibulaire.']),
        row('Exploration arthroscopique', ['Elle précède les tunnels et permet le bilan puis le traitement des lésions méniscales et cartilagineuses.', 'Les voies sont choisies pour permettre une triangulation efficace sans conflit avec le condyle médial.']),
      ] },
      { title: 'Échancrure et tunnel tibial', rows: [
        row('Préparation de l’échancrure', ['La résection des vestiges du LCA et des franges synoviales améliore la visualisation des repères.', 'La plastie osseuse d’élargissement n’est pas systématique : elle est réalisée à la demande pour prévenir un conflit.']),
        row('Sortie intra-articulaire tibiale', ['Elle se situe au centre de l’ancienne insertion tibiale du LCA, sur la surface préspinale.', 'Le repère est à 7 mm en avant du sommet de l’épine tibiale médiale, en avant de l’insertion du LCP.'], { image: image(4) }),
        row('Forage tibial', ['La broche-guide ne doit pas buter sur les structures latérales.', 'Le diamètre du tunnel est adapté au calibrage du greffon afin de permettre son insertion.']),
      ] },
    ] },
    { title: 'Tunnel fémoral, passage et suites', sections: [
      { title: 'Positionner le tunnel fémoral', rows: [
        row('Mur postérieur', ['Un tunnel de 10 mm impose de conserver un mur osseux postérieur d’environ 1 à 2 mm.', 'Le point de repère est placé 6 à 7 mm en avant de la corticale postérieure.']),
        row('Repères horaires', ['Pour la technique décrite, la position est à 11 heures au genou droit et à 1 heure au genou gauche.', 'Le positionnement est contrôlé dans le plan frontal et sur le profil.'], { image: image(5) }),
        row('Tunnels indépendants', ['La voie antéromédiale requiert une hyperflexion supérieure à 120° pour éloigner la corticale postérieure.', 'Le forage est adapté au calibre du greffon et à la profondeur du tunnel borgne.'], { image: image(7) }),
      ] },
      { title: 'Passage, fixation et fermeture', rows: [
        row('Passage du transplant', ['Le fil tracteur guide le greffon à travers les tunnels tibial et fémoral.', 'La face spongieuse de la baguette rotulienne est orientée en avant afin de plaquer le tendon au mieux.'], { image: image(8) }),
        row('Fixation des ischiojambiers', ['La vis fémorale est introduite avec le genou fléchi à 120° et une tension maintenue aux extrémités du greffon.', 'La broche-guide doit rester en avant du transplant et ne pas traverser ses fibres.']),
        row('Contrôle final et suites', ['La fermeture tendineuse et péritendineuse préserve les possibilités de reprise.', 'Un contrôle radiologique postopératoire vérifie la position des vis avant l’organisation de la rééducation.']),
      ] },
    ] },
    { title: 'Situations complexes et gestes associés', sections: [
      { title: 'Reconstruction anatomique à deux faisceaux', rows: [
        row('Principe', ['Deux faisceaux antéromédial et postérolatéral peuvent être reconstruits par différentes configurations de tunnels.', 'Les techniques à deux, trois, quatre ou cinq tunnels sont décrites selon le choix fémoral et tibial.'], { image: image(15) }),
        row('Tension des faisceaux', ['La tension et la fixation sont propres à chaque faisceau et doivent respecter la position du genou.', 'Le contrôle fluoroscopique peut vérifier l’absence de conflit des tunnels.'], { image: image(19) }),
        row('Limites', ['La multiplication des tunnels expose à la fracture entre tunnels, à l’élargissement et à des difficultés de révision.', 'Le gain biomécanique ne dispense pas d’une indication et d’une exécution rigoureuses.'], { marker: 'trap' }),
      ] },
      { title: 'Plastie extra-articulaire et ostéotomie', rows: [
        row('Plastie latérale associée', ['Elle peut limiter la translation antérieure du compartiment latéral et le ressaut antérolatéral.', 'Mac Intosh modifiée et ténodèse latérale au fascia lata sont décrites.']),
        row('Indications associées', ['Une plastie extra-articulaire est discutée selon le contexte d’instabilité et le contrôle rotatoire recherché.', 'Elle ne remplace pas le positionnement anatomique du transplant intra-articulaire.']),
        row('Ostéotomie tibiale', ['Elle peut être associée à la reconstruction du LCA dans les plans frontal ou sagittal.', 'L’indication et la technique dépendent de l’axe analysé avant l’intervention.'], { image: image(20) }),
      ] },
    ] },
  ],
  synthesis: {
    chiffres: { headers: ['Repère', 'Valeur', 'Intérêt'], rows: [['Flexion installation', '≥ 90°', 'Temps arthroscopiques'], ['Sortie tibiale', '7 mm', 'En avant de l’épine tibiale médiale'], ['Mur fémoral postérieur', '1–2 mm', 'Prévenir la rupture corticale'], ['Repère fémoral', '6–7 mm', 'En avant de la corticale postérieure'], ['Hyperflexion', '> 120°', 'Tunnel antéromédial indépendant'], ['Tunnel fémoral ischiojambiers', '> 30 mm', 'Contact os-greffe']] },
    tables: [
      { title: 'Choisir la reconstruction', headers: ['Question', 'Éléments source', 'Conséquence'], rows: [['Technique', 'Arthroscopie', 'Bilan et traitement associés'], ['Greffon', 'Patellaire / ischiojambiers / quadricipital', 'Prélèvement adapté'], ['Fixation', 'Mécanique puis biologique', 'Couple greffon-fixation'], ['Faisceaux', 'Mono ou bifaisceau', 'Complexité croissante']] },
      { title: 'Tunnels et sécurité', headers: ['Temps', 'Repère', 'Vigilance'], rows: [['Tibial', 'Ancienne insertion du LCA', 'Respecter LCP et plateau'], ['Fémoral', 'Mur postérieur conservé', 'Éviter rupture corticale'], ['Voie antéromédiale', 'Hyperflexion', 'Vision et corticale postérieure'], ['Fixation', 'Broche en avant du greffon', 'Ne pas traverser les fibres']] },
      { title: 'Situations associées', headers: ['Situation', 'Geste possible', 'But'], rows: [['Ressaut antérolatéral', 'Plastie extra-articulaire', 'Limiter le ressaut'], ['Axe anormal', 'Ostéotomie tibiale', 'Corriger le plan concerné'], ['Bifaisceau', 'Tunnels multiples', 'Contrôle rotatoire'], ['Reprise', 'Planification des tunnels', 'Éviter conflits et fracture']] },
    ],
    keyPoints: ['Le LCA contrôle translation tibiale antérieure et stabilité rotatoire.', 'Le choix du greffon conditionne prélèvement, tunnel et fixation.', 'La fixation mécanique est critique dans les premières semaines.', 'Le tunnel tibial est centré sur l’ancienne insertion du LCA.', 'Le mur postérieur fémoral doit être préservé.', 'L’hyperflexion facilite le forage fémoral indépendant.', 'Le bifaisceau augmente les exigences techniques et les risques de reprise.'],
    eclair: ['Bilan arthroscopique et traitement des lésions associées avant les tunnels.', 'Greffon : patellaire, ischiojambiers ou quadricipital selon stratégie.', 'Fixation : raisonner le couple greffon-fixation, pas le dispositif seul.', 'Tibial : ancienne insertion, 7 mm en avant de l’épine tibiale médiale.', 'Fémoral : conserver 1–2 mm de mur postérieur ; repère 6–7 mm.', 'Tunnels indépendants : hyperflexion > 120°.', 'Toujours contrôler position, tension et absence de conflit avant fermeture.'],
  },
};

const fact = (recto, verso, source) => ({ recto, verso, source: [source] });
const facts = [
  fact('Fonction antérieure principale du LCA ?', 'Contrôle de la translation tibiale antérieure', 1),
  fact('Fonction rotatoire du LCA ?', 'Contrôle de la stabilité rotatoire', 1),
  fact('Faisceau du LCA sollicité en extension ?', 'Faisceau antéromédial', 1),
  fact('Intérêt majeur de l’arthroscopie pour une ligamentoplastie ?', 'Bilan et traitement des lésions articulaires associées', 4),
  fact('Greffe os-tendon-os de référence décrite ?', 'Ligament patellaire', 34),
  fact('Deux tendons de la patte-d’oie utilisés ?', 'Gracilis et demi-tendineux', 71),
  fact('Greffon mixte possible ?', 'Tendon quadricipital', 87),
  fact('Utilisation habituelle des allogreffes en France ?', 'Surtout reconstructions itératives', 8),
  fact('Phase faible initiale de la reconstruction ?', 'Fixation mécanique du greffon', 10),
  fact('Relais secondaire de la fixation ?', 'Fixation biologique', 10),
  fact('Facteur de résistance commun à toute fixation ?', 'Surface de contact entre os et greffe', 14),
  fact('Fixation directe intraspongieuse : situation ?', 'Proximale ou anatomique', 14),
  fact('Fixation à appui cortical : situation ?', 'Distale ou extra-anatomique', 17),
  fact('Dispositif de fixation à appui cortical cité ?', 'Endobouton', 17),
  fact('Dispositif de fixation interférentiel cité ?', 'Vis d’interférence', 14),
  fact('Facteur osseux favorisant la fixation ?', 'Densité élevée de l’os spongieux', 19),
  fact('Comparaison fémur/tibia pour la fixation ?', 'Fixation généralement supérieure au fémur', 19),
  fact('Diamètre de vis associé à une meilleure résistance dans le cours ?', '9 mm plutôt que 7 mm', 19),
  fact('Défaut technique influençant la résistance d’une vis ?', 'Divergence entre vis et baguette osseuse', 19),
  fact('Limite clinique du monofaisceau rapportée ?', 'Contrôle rotatoire parfois incomplet', 21),
  fact('Avantage biomécanique recherché du bifaisceau ?', 'Réduction de la laxité rotatoire', 25),
  fact('Risque spécifique de tunnels fémoraux multiples ?', 'Fracture entre les tunnels', 27),
  fact('Autre difficulté du bifaisceau en cas de reprise ?', 'Élargissement des tunnels', 27),
  fact('Flexion minimale du genou à l’installation ?', 'Au moins 90°', 32),
  fact('Pourquoi tracer les repères cutanés ?', 'Guider les incisions et voies arthroscopiques', 32),
  fact('Bilan associé réalisé durant l’arthroscopie ?', 'Lésions méniscales et cartilagineuses', 45),
  fact('But de la préparation de l’échancrure ?', 'Visualiser les repères des tunnels osseux', 47),
  fact('Plastie osseuse d’échancrure systématique ?', 'Non, réalisée à la demande', 47),
  fact('Localisation de la sortie tibiale intra-articulaire ?', 'Centre de l’ancienne insertion tibiale du LCA', 54),
  fact('Distance devant l’épine tibiale médiale ?', '7 mm', 54),
  fact('Rapport de la sortie tibiale avec le LCP ?', 'En avant de son insertion', 54),
  fact('Mur postérieur à préserver lors du tunnel fémoral ?', 'Environ 1 à 2 mm', 61),
  fact('Repère antéropostérieur pour tunnel fémoral de 10 mm ?', '6 à 7 mm devant la corticale postérieure', 61),
  fact('Position horaire fémorale au genou droit ?', '11 heures', 61),
  fact('Position horaire fémorale au genou gauche ?', '1 heure', 61),
  fact('But du tunnel de dehors en dedans ?', 'Tunnel long et orthogonal à la face axiale condylienne', 66),
  fact('Flexion nécessaire avant broche-guide antéromédiale ?', 'Plus de 120°', 66),
  fact('Longueur de forage fémoral décrite pour greffon de 10 mm ?', 'Environ 25 mm', 66),
  fact('Rôle du fil tracteur lors du passage ?', 'Guider le greffon dans les tunnels', 67),
  fact('Orientation de la face spongieuse de la baguette rotulienne ?', 'Vers l’avant', 67),
  fact('But de l’orientation de la baguette rotulienne ?', 'Plaquer le tendon le plus en arrière possible', 67),
  fact('Intérêt de suturer le péritendon patellaire ?', 'Guider la prolifération conjonctive et préserver une reprise', 69),
  fact('Contrôle postopératoire des vis ?', 'Radiographie', 69),
  fact('Nerf à préserver lors du prélèvement des ischiojambiers ?', 'Branche sensitive du nerf saphène médial', 72),
  fact('Incision de prélèvement ischiojambiers : orientation ?', 'Verticale', 72),
  fact('Distance de la crête tibiale pour l’incision ischiojambiers ?', '15 mm en dedans', 72),
  fact('Plan aponévrotique à ouvrir pour la patte-d’oie ?', 'Aponévrose du sartorius', 72),
  fact('Expansion à libérer lors du prélèvement du demi-tendineux ?', 'Expansion vers l’aponévrose du soléaire', 72),
  fact('Diamètre des tunnels avec ischiojambiers ?', 'Adapté au calibre du greffon', 80),
  fact('Longueur fémorale recherchée avec ischiojambiers ?', 'Supérieure à 30 mm', 80),
  fact('Intérêt du taraud compacteur tibial ?', 'Tasser le spongieux périphérique du tunnel', 80),
  fact('Position de la broche-guide par rapport au greffon ischiojambier ?', 'En avant du transplant', 83),
  fact('Flexion du genou pour vis fémorale des ischiojambiers ?', '120°', 83),
  fact('Erreur à éviter avec la broche-guide ?', 'Traverser les fibres du greffon', 83),
  fact('Plan profond à préserver au prélèvement quadricipital ?', 'Nappe tendineuse profonde', 87),
  fact('Nombre de faisceaux reconstruits dans une technique anatomique classique ?', 'Antéromédial et postérolatéral', 92),
  fact('Configuration de la technique à deux tunnels ?', 'Un tunnel tibial et un tunnel fémoral', 94),
  fact('Variante évitant un tunnel fémoral borgne ?', 'Retour over-the-top', 97),
  fact('Configuration à trois tunnels décrite ?', 'Deux fémoraux et un tibial', 100),
  fact('Autre configuration à trois tunnels ?', 'Un fémoral et deux tibiaux', 102),
  fact('Configuration à quatre tunnels ?', 'Deux tunnels fémoraux et deux tibiaux', 104),
  fact('Utilité de la fluoroscopie dans la reconstruction complexe ?', 'Vérifier l’absence de conflit', 126),
  fact('Geste arthroscopique associé à la reconstruction ?', 'Traitement des lésions méniscales ou cartilagineuses', 141),
  fact('But d’une plastie extra-articulaire latérale ?', 'Limiter la translation antérieure latérale', 143),
  fact('Autre but de la plastie extra-articulaire ?', 'Limiter le ressaut antérolatéral', 146),
  fact('Technique de plastie latérale au fascia lata citée ?', 'Mac Intosh modifiée', 148),
  fact('Ténodèse latérale : tissu utilisé ?', 'Fascia lata', 169),
  fact('Correction osseuse associable dans le plan frontal ?', 'Ostéotomie tibiale', 173),
  fact('Autre plan d’ostéotomie associé au LCA ?', 'Plan sagittal', 183),
  fact('Pourquoi adapter la technique à la situation ?', 'Prévenir complications et difficultés opératoires', 29),
  fact('Mesure cutanée préférable au rasage complet ?', 'Dépilation limitée à la tondeuse si nécessaire', 30),
  fact('Objectif du champage de membre inférieur ?', 'Permettre les gestes sans restreindre le genou', 30),
  fact('Voie arthroscopique de visualisation dans la technique patellaire ?', 'Voie médiane sous-rotulienne', 45),
  fact('Voie instrumentale patellaire ?', 'Bord interne du tendon rotulien', 45),
  fact('Risque d’une voie trop médiale ?', 'Conflit avec le condyle fémoral médial', 45),
  fact('Intérêt de conserver le pied du LCA parfois ?', 'Préserver des récepteurs proprioceptifs', 47),
  fact('Structure osseuse repère de l’échancrure ?', 'Resident ridge', 47),
  fact('But du contrôle du tunnel tibial ?', 'Éviter un positionnement hors ancienne empreinte', 54),
  fact('But de l’hyperflexion lors du forage fémoral ?', 'Éloigner la corticale postérieure', 66),
  fact('Limite de l’hyperflexion arthroscopique ?', 'Vision moins bonne avec synoviale volumineuse', 66),
  fact('Rôle de la pince préhensive lors du passage ?', 'Guider le greffon intra-articulaire', 67),
  fact('Pourquoi éviter l’eau lors du passage patellaire ?', 'Éviter le gonflement du transplant', 67),
  fact('Matériau de comblement préférentiel des defects osseux ?', 'Os spongieux récupéré lors du forage tibial', 69),
  fact('Drainage après fermeture patte-d’oie ?', 'Absence de drainage décrite', 85),
  fact('Mode de fermeture cutanée décrit ?', 'Surjet intradermique', 85),
  fact('Problème du monofaisceau à longue échéance rapporté ?', 'Récidive de laxité possible', 21),
  fact('Conséquence de rigidité insuffisante du greffon ?', 'Effet saut à l’élastique ou essuie-glace', 23),
  fact('Précondition avant bifaisceau ?', 'Maîtrise parfaite du monofaisceau', 27),
  fact('Risque de conflit augmenté en bifaisceau ?', 'Conflit dans l’échancrure', 27),
  fact('Risque vasculaire de la reconstruction complexe ?', 'Nécrose condylienne', 27),
  fact('Paramètre à contrôler avant fixation ?', 'Tension du greffon', 83),
  fact('Pourquoi mesurer le tunnel tibial ?', 'Adapter la longueur de fixation', 80),
  fact('Intérêt d’une canule d’évacuation supplémentaire ?', 'Améliorer la vision intra-articulaire', 77),
  fact('Plan de réparation après prélèvement patellaire ?', 'Berges tendineuses puis péritendon', 69),
  fact('Évaluation à prévoir en suivi postopératoire ?', 'Position des vis et rééducation', 69),
  fact('Objectif du calibrage du greffon ?', 'Adapter le diamètre des tunnels osseux', 80),
  fact('Objectif du contrôle final peropératoire ?', 'Vérifier position et tension du montage', 126),
  fact('But du traitement des lésions associées durant l’arthroscopie ?', 'Traiter le genou dans le même temps opératoire', 45),
  fact('Pourquoi préserver les expansions aponévrotiques au prélèvement ?', 'Éviter une section incomplète ou une traction délabrante du tendon', 72),
  fact('Ordre de la stratégie opératoire monofaisceau ?', 'Prélèvement, arthroscopie, tunnels, passage, cyclage et fixation', 34),
];

const distractors = (index, answer) => facts.filter((f) => f.verso !== answer).slice(index % 40, index % 40 + 4).map((f) => f.verso);
const question = (f, index, prefix = '') => ({
  enonce: `${prefix}${f.recto}`,
  items: [f.verso, ...distractors(index, f.verso)].map((enonce, itemIndex) => ({ lettre: String.fromCharCode(65 + itemIndex), enonce, is_correct: itemIndex === 0, justification: itemIndex === 0 ? `Conforme au bloc ${f.source[0]} du corpus.` : `Cette proposition ne répond pas à la question posée dans le corpus.` })),
  correction_generale: `Notion issue du bloc ${f.source[0]} du corpus Orthopédie.`,
});
const qcm = Array.from({ length: 8 }, (_, s) => ({ label: `QCM ${s + 1} · Reconstruction du LCA`, questions: facts.slice(s * 5, s * 5 + 5).map((f, i) => question(f, s * 5 + i)) }));
const dpCases = [
  ['Instabilité antérieure et rotatoire', 'Un sportif de 24 ans consulte après épisodes répétés de dérobement du genou. L’examen et l’imagerie confirment une insuffisance du LCA ; le bilan arthroscopique recherche les lésions méniscales et cartilagineuses associées. Après discussion des objectifs fonctionnels, une ligamentoplastie arthroscopique est programmée. Au suivi postopératoire, stabilité, douleur, mobilité et reprise de la rééducation sont réévaluées.'],
  ['Choix du greffon', 'Une patiente de 29 ans présentant une rupture du LCA souhaite reprendre une activité pivot-contact. La consultation préopératoire compare ligament patellaire, ischiojambiers et tendon quadricipital selon la stratégie opératoire. Après le geste, le contrôle radiographique vérifie le matériel et le suivi organise la récupération fonctionnelle.'],
  ['Prélèvement patellaire', 'Un homme de 31 ans est programmé pour une ligamentoplastie au tendon patellaire. Le bilan préopératoire analyse l’appareil extenseur ; l’intervention associe prélèvement, exploration arthroscopique, tunnels et fixation. Au suivi, la cicatrisation du site donneur, la mobilité et les clichés de contrôle sont examinés.'],
  ['Prélèvement des ischiojambiers', 'Une femme de 22 ans bénéficie d’une reconstruction par gracilis et demi-tendineux. Le chirurgien prépare la patte-d’oie et protège les éléments sensitifs lors du prélèvement. Après fixation, les consultations de suivi évaluent la douleur locale, la stabilité et la progression de la rééducation.'],
  ['Tunnel tibial', 'Un patient de 27 ans est opéré par voie arthroscopique pour rupture complète du LCA. Après traitement des lésions associées, l’équipe prépare l’échancrure et planifie le tunnel tibial à partir des repères anatomiques. Les contrôles postopératoires suivent la position du matériel et la récupération du genou.'],
  ['Tunnel fémoral indépendant', 'Un patient de 34 ans reçoit une reconstruction avec tunnel fémoral indépendant par voie antéromédiale. L’opérateur adapte la flexion du genou, préserve le mur postérieur et calibre le tunnel au greffon. À distance, la stabilité rotatoire, l’imagerie de contrôle et la reprise progressive des activités sont évaluées.'],
  ['Reconstruction bifaisceau', 'Un sportif de 20 ans présente une instabilité rotatoire marquée. Une reconstruction anatomique à deux faisceaux est discutée après information sur la complexité des tunnels et des reprises. Au suivi, l’équipe surveille la mobilité, l’absence de conflit et la qualité de la reprise fonctionnelle.'],
  ['Geste associé et axe', 'Un patient de 36 ans présente une insuffisance du LCA avec instabilité antérolatérale persistante ; l’analyse préopératoire explore également l’axe tibial. Une plastie latérale et, si indiquée, une correction osseuse sont discutées en complément du geste intra-articulaire. Le suivi contrôle la stabilité et l’évolution fonctionnelle.'],
];
const dp = dpCases.map(([label, vignette], seriesIndex) => ({ label: `DP ${seriesIndex + 1} · ${label}`, vignette: `<p>${vignette} Le patient est informé des étapes, puis revu à chaque phase de récupération.</p>`, questions: Array.from({ length: 7 }, (_, questionIndex) => question(facts[40 + seriesIndex * 7 + questionIndex], 40 + seriesIndex * 7 + questionIndex, questionIndex ? 'Nouvel élément : ' : '')) }));
const chapter = { title: fiche.title, provenance: { extract: 'extract.json', sourceOnly: true, blocks: fiche.sourceBlocks }, flashcards: facts, series: [...qcm, ...dp] };
writeFileSync(join(out, 'fiche.model.json'), JSON.stringify(fiche, null, 2), 'utf8');
writeFileSync(join(out, 'fiche.body.html'), compileFicheModel(fiche, chapterDir), 'utf8');
writeFileSync(join(out, 'chapter.json'), JSON.stringify(chapter, null, 2), 'utf8');
writeFileSync(join(out, 'coverage.json'), JSON.stringify({ facts: facts.length, qcm: 40, dp: 56, sourceBlocks: fiche.sourceBlocks }, null, 2), 'utf8');
console.log(JSON.stringify({ out, flashcards: facts.length, qcm: qcm.length, dp: dp.length }));

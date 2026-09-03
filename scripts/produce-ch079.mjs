import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { compileFicheModel } from './lib/orthopedie-fiche.mjs';

const dir = resolve(process.cwd(), '..', '.corpus-orthopedie', 'raideurs-post-traumatiques-des-doigts');
const out = join(dir, 'delivery', 'source-quality-v2');
const title = 'Raideurs post-traumatiques des doigts';
const P = (concept, bullets, extra = {}) => ({ concept, bullets, ...extra });
const sourceCaption = 'Figure source du chapitre « Raideurs post traumatiques des doigts ».';
const fiche = {
  title, year: '2025-2026', sourceBlocks: [0,1,2,4,6,7,13,14,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198],
  imageException: { reason: 'Le corpus ne contient que trois figures accompagnées de légendes exploitables ; seules celles-ci sont intégrées.' },
  parts: [
    { title: 'Comprendre et prévenir la raideur', sections: [
      { title: 'Œdème et organisation cicatricielle', rows: [
        P('Main œdématiée', ['L’œdème diffuse dans les plans de glissement, les gaines synoviales, les cavités articulaires et les tissus voisins.', 'La posture spontanée associe MP en extension, IPP et IPD fléchies, pouce en adduction et première commissure fermée.', 'Au début réversible, l’œdème s’organise ensuite en « colle biologique » fixant les tissus en bloc cicatriciel.'], { marker: 'yield' }),
        P('Immobilisation', ['Une immobilisation désorganise les fibres de collagène et augmente leurs liaisons.', 'Le tissu de granulation et la production de collagène fixent progressivement les structures articulaires et périarticulaires.', 'Le remodelage reste possible sous l’effet de tensions adaptées : c’est la base du traitement conservateur.']),
        P('Position de protection', ['Quand une immobilisation est indispensable, placer le poignet en extension à 10°, les MP fléchies et les interphalangiennes étendues.', 'La première commissure doit rester écartée.', 'Une main enraidie dans cette position est plus récupérable par rééducation et appareillage.'])
      ]},
      { title: 'Prévention dès la phase aiguë', rows: [
        P('Surélévation', ['Maintenir la main au-dessus du niveau du cœur jour et nuit : écharpe le jour, oreiller la nuit.', 'La consigne doit être expliquée, écrite et répétée lors des pansements et de la rééducation.', 'La main déclive, gonflée et douloureuse favorise une raideur évitable.'], { marker: 'ecn' }),
        P('Mobilisation active précoce', ['Elle débute dès que le traumatisme le permet et alterne avec des temps de repos.', 'La manœuvre de Moberg associe ouverture avec écartement des doigts puis fermeture en poing, trois fois toutes les heures.', 'Une mobilisation permanente ou forcée réactive l’inflammation.']),
        P('Mobilisation protégée', ['Certains traumatismes imposent une protection pendant la cicatrisation.', 'La mobilisation active protégée ou passive guidée par le rééducateur conserve les plans de glissement.', 'Prévenir la raideur demande une coordination du patient, du chirurgien et du rééducateur.'])
      ]}
    ]},
    { title: 'Évaluer une raideur constituée', sections: [
      { title: 'Anamnèse et bilan fonctionnel', rows: [
        P('Circonstances du traumatisme', ['Une raideur en flexion de l’IPP après entorse oriente vers la plaque palmaire.', 'Un traumatisme avec atteinte du canal digital oriente vers des adhérences de l’appareil fléchisseur.', 'L’histoire des soins, le délai et les traitements déjà entrepris guident le projet thérapeutique.']),
        P('Retentissement et indication', ['Évaluer les gestes de vie courante, l’activité professionnelle et les loisirs.', 'Un secteur de mobilité utile peut être acceptable selon le patient.', 'Destruction articulaire, doigt multiopéré, infection antérieure, doigt mal vascularisé ou insensible sont de mauvais pronostic.'], { marker: 'trap' }),
        P('Délai', ['Après trois mois, les possibilités de récupération des amplitudes diminuent significativement.', 'L’immobilisation prolongée altère le cartilage articulaire.', 'L’exclusion d’un doigt de l’usage favorise une exclusion corticale et l’amyotrophie compromet la rééducation active.'])
      ]},
      { title: 'Examen clinique et imagerie', rows: [
        P('Mobilité active et passive', ['Mesurer analytiquement les amplitudes et les consigner à chaque consultation.', 'Une mobilité passive supérieure à l’active évoque l’unité musculotendineuse.', 'Des mobilités active et passive équivalentes font rechercher une cause capsulaire ou osseuse.'], { marker: 'yield' }),
        P('Peau et force', ['Rechercher cicatrices rétractiles, adhérences, élasticité et réserve cutanée.', 'Le test du pincement cutané de Littler évalue la réserve cutanée.', 'Mesurer la force de serrage au dynamomètre, trois fois et alternativement des deux côtés.']),
        P('Imagerie', ['Les radiographies de face et profil recherchent cal osseux, exostose, matériel, incongruence et arthrose secondaire.', 'Le scanner, l’échographie ou l’IRM peuvent préciser une atteinte cartilagineuse, tendineuse ou ligamentaire.', 'Une imagerie simple évite des rééducations inutiles et douloureuses devant un obstacle osseux.'])
      ]}
    ]},
    { title: 'Identifier les structures responsables', sections: [
      { title: 'Tests de l’appareil tendineux', rows: [
        P('Test extrinsèque de Kilgore', ['La flexion du poignet et des MP empêchant la flexion IPP évoque des adhérences des extenseurs au dos des métacarpiens.', 'À l’inverse, l’extension du poignet et des MP empêchant l’extension IPP évoque une adhérence ou rétraction des fléchisseurs.', 'Le test oriente la libération vers l’unité extrinsèque concernée.']),
        P('Test intrinsèque de Finochietto', ['La flexion IPP possible MP fléchie mais impossible MP étendue révèle une rétraction ou adhérence des interosseux.', 'Le test lombrical de Colditz précise l’atteinte des lombricaux.', 'Dans ce cas, l’extension MP limite aussi la flexion IPD.']),
        P('Test rétinaculaire de Haines', ['L’extension de l’IPP empêchant la flexion de l’IPD révèle une rétraction du ligament rétinaculaire oblique.', 'Ce test distingue un verrouillage de l’appareil extenseur d’une simple limitation articulaire.', 'Le résultat participe au choix de la libération.'])
      ]},
      { title: 'Capsule, ligaments et os', rows: [
        P('Ligaments latéraux', ['Une flexion IPP impossible quelle que soit la position MP, associée à une limitation des mouvements latéraux, évoque leur rétraction.', 'Leur libération peut être nécessaire dans une raideur capsuloligamentaire.', 'La stabilité doit être préservée au cours du geste.']),
        P('Plaque palmaire', ['Le test de comblement du récessus est positif lorsqu’une ouverture dorsale « en livre » est observée.', 'Une raideur en flexion IPP après entorse fait rechercher une rétraction de plaque palmaire.', 'La plaque palmaire peut faire partie des structures à libérer en cas de flexum invétéré.']),
        P('Obstacle osseux', ['Cal osseux, exostose, incongruence et arthrose secondaire expliquent des mobilités active et passive également limitées.', 'Une arthrolyse seule est vouée à l’échec si l’obstacle osseux n’est pas traité.', 'Une destruction articulaire limite les indications de chirurgie mobilisatrice.'], { marker: 'trap' })
      ]}
    ]},
    { title: 'Conduire le traitement conservateur', sections: [
      { title: 'Principes de rééducation', rows: [
        P('Cinq cibles', ['Lutter contre l’œdème par surélévation et drainage manuel.', 'Contrôler douleur et inflammation par repos, antalgiques, AINS et physiothérapie.', 'Prévenir la démotivation par une information réaliste sur la durée et les contraintes du traitement.']),
        P('Mise en contrainte', ['Le collagène est remodelé par une contrainte modérée et prolongée.', 'La mobilisation brutale sous anesthésie réactive l’inflammation et aggrave la raideur.', 'La rééducation associe mobilisations actives et/ou passives à l’appareillage.'], { marker: 'ecn' }),
        P('Objectif fonctionnel', ['Le traitement conservateur est souvent suffisant et encadre toujours un éventuel geste chirurgical.', 'Il se poursuit tant qu’une récupération fonctionnelle est obtenue.', 'La mesure répétée des amplitudes objectivise les progrès.'])
      ]},
      { title: 'Orthèses et surveillance', rows: [
        P('Orthèses statiques', ['Elles maintiennent une position corrigée pendant les périodes de repos.', 'Elles sont adaptées au sens de la raideur et à la réserve cutanée.', 'Leur tolérance cutanée doit être surveillée.']),
        P('Orthèses dynamiques', ['Elles appliquent une traction progressive et sélective.', 'Elles complètent les séances de mobilisation sans rechercher la douleur.', 'Le réglage doit suivre l’évolution des amplitudes et de l’inflammation.']),
        P('Test d’abstention', ['Après orthèse d’extension, le patient compare le tracé du doigt après 2, 4 puis 8 jours sans orthèse.', 'Un rappel élastique impose la poursuite de l’orthèse.', 'Si les amplitudes se maintiennent, le traitement peut être arrêté.'])
      ]}
    ]},
    { title: 'Sélectionner et suivre la chirurgie', sections: [
      { title: 'Raideur en flexion et doigt en crochet', rows: [
        P('Indication opératoire', ['La chirurgie est discutée après échec du traitement conservateur chez un patient sélectionné et motivé.', 'Un doigt en crochet associe souvent rétractions cutanées, capsulaires, ligamentaires et tendineuses.', 'La correction est progressive : libérer un élément peut révéler une autre cause.']),
        P('Arthrolyse IPP', ['La libération peut comprendre capsule, ligaments collatéraux, plaque palmaire et adhérences intra-articulaires.', 'Deux dangers sont l’ischémie digitale par tension pédiculaire et la nécrose cartilagineuse par hyperpression.', 'Une pseudoboutonnière peut nécessiter une correction de l’appareil extenseur.'], { image: { path: 'img/img_003.png', position: 'after', size: 'large', caption: 'Ténolyse de l’appareil extenseur', sourceCaption } }),
        P('Ténoarthrolyse antérieure', ['Elle concerne les doigts fixés en crochet avec IPP et IPD en flexion.', 'La libération monobloc antérieure est complexe et parfois associée à une couverture cutanée ou une arthrodèse raccourcissante IPD.', 'Le gain recherché est le déplacement de l’arc de mobilité vers un secteur utile.'])
      ]},
      { title: 'Raideur en extension et commissure du pouce', rows: [
        P('Arthrolyse dorsale IPP', ['Une raideur en extension est fonctionnellement gênante et peut nécessiter un geste de déblocage.', 'Le manque de réserve cutanée impose de prévoir un lambeau avant l’incision.', 'La libération comprend résection capsulaire, décollement des collatéraux, libération intra-articulaire et de la plaque palmaire.'], { image: { path: 'img/img_005.png', position: 'after', size: 'large', caption: 'Décollement des ligaments latéraux', sourceCaption } }),
        P('Rééducation postopératoire', ['Après arthrolyse, la mobilisation débute au premier pansement, vers J3.', 'Les orthèses dynamiques d’enroulement et d’extension sont associées à des séances pluriquotidiennes.', 'Après chirurgie de flexum, le programme se poursuit 4 à 6 mois selon le remodelage du collagène.']),
        P('Première commissure', ['Après traumatisme complexe, prévenir la rétraction de C1 par maintien de l’écartement.', 'Une plastie cutanée est toujours indiquée lors de la libération ; un lambeau peut être nécessaire.', 'L’artère radiale est un danger permanent lors de la dissection.'], { image: { path: 'img/img_001.png', position: 'after', size: 'large', caption: 'Lambeau pour raideur métacarpophalangienne', sourceCaption } })
      ]}
    ]}
  ],
  synthesis: {
    chiffres: { headers: ['Repère', 'Valeur', 'Conséquence'], rows: [['Délai critique', '3 mois', 'Récupération des amplitudes diminue ensuite'], ['Rééducation postopératoire', '4–6 mois', 'Poursuivre le remodelage'], ['Pansement après arthrolyse dorsale', 'J3', 'Débuter mobilisation'], ['Orthèse après chirurgie IPP', 'J12 puis J30', 'Ajouter traction sélective'], ['Surélévation', 'Jour et nuit', 'Limiter l’œdème']] },
    tables: [
      { title: 'Lecture de la mobilité', headers: ['Constat', 'Cause privilégiée', 'Étape suivante'], rows: [['Passive > active', 'Unité musculotendineuse', 'Tests extrinsèques/intrinsèques'], ['Passive = active', 'Capsule ou os', 'Radiographies et examen'], ['Flexion IPP limitée selon MP', 'Interosseux', 'Finochietto'], ['Flexion IPD limitée en extension IPP', 'Rétinaculaire oblique', 'Haines']] },
      { title: 'Prévenir la raideur', headers: ['Situation', 'Mesure', 'Erreur à éviter'], rows: [['Œdème aigu', 'Surélévation', 'Main déclive'], ['Traumatisme mobilisable', 'Mobilisation précoce protégée', 'Repos prolongé'], ['Immobilisation nécessaire', 'Position intrinsèque plus', 'MP en extension'], ['Rééducation', 'Contrainte douce prolongée', 'Mobilisation forcée']] },
      { title: 'Décision chirurgicale', headers: ['Élément', 'À évaluer', 'Conséquence'], rows: [['Peau', 'Réserve cutanée, cicatrice', 'Prévoir plastie/lambeau'], ['Os', 'Cal, incongruence, arthrose', 'Corriger l’obstacle'], ['Patient', 'Motivation, douleur, tabac', 'Sélectionner l’indication'], ['Après geste', 'Mobilisation et orthèses', 'Suivi prolongé']] }
    ],
    keyPoints: ['Œdème, douleur et mauvaise immobilisation sont la voie finale commune vers la raideur.', 'Surélever la main et mobiliser précocement quand c’est permis.', 'La position intrinsèque plus protège une main devant être immobilisée.', 'Comparer mobilité active et passive oriente l’étiologie.', 'Kilgore, Finochietto et Haines guident l’analyse anatomique.', 'Une contrainte douce prolongée remodèle le collagène ; la force aggrave.', 'La chirurgie ne remplace jamais la rééducation prolongée.'],
    eclair: ['Phase aiguë : main surélevée, mobilisation protégée précoce.', 'Immobilisation : poignet +10°, MP fléchies, IP étendues, C1 ouverte.', 'Bilan : peau, force, mobilité active/passive, radiographies.', 'Active < passive : unité musculotendineuse ; égalité : capsule ou os.', 'Tests : Kilgore = extrinsèques ; Finochietto = interosseux ; Haines = rétinaculaire.', 'Conservateur : œdème, douleur, inflammation, motivation, contrainte douce.', 'Chirurgie : indication sélectionnée + rééducation et orthèses sur plusieurs mois.']
  }
};

const facts = [
['Quelle posture caractérise la main œdématiée ?', 'MP étendues, IPP/IPD fléchies, pouce en adduction et première commissure fermée.'],
['Pourquoi l’œdème favorise-t-il une raideur digitale ?', 'Il envahit les plans de glissement puis s’organise en bloc cicatriciel.'],
['Quel est le caractère initial de la posture œdématiée ?', 'Elle est d’abord réversible tant que l’œdème est fluide.'],
['Quelle conséquence a l’immobilisation sur le collagène ?', 'Elle désorganise les fibres et augmente leurs liaisons.'],
['Quel principe permet le remodelage du collagène ?', 'Des tensions adaptées, modérées et prolongées.'],
['Quelle position du poignet protège une main immobilisée ?', 'Extension à 10°.'],
['Quelle position des MP protège une main immobilisée ?', 'Flexion.'],
['Quelle position des interphalangiennes protège une main immobilisée ?', 'Extension.'],
['Que faut-il faire de la première commissure durant l’immobilisation ?', 'La maintenir écartée.'],
['Pourquoi la position intrinsèque plus est-elle utile ?', 'Une raideur dans cette position est plus récupérable.'],
['Quelle mesure doit être appliquée jour et nuit après traumatisme de la main ?', 'La surélévation au-dessus du niveau du cœur.'],
['Quel support est conseillé la nuit pour la main traumatisée ?', 'Un oreiller maintenant la main surélevée.'],
['Quel exercice simple est proposé pour mobiliser la main ?', 'La manœuvre de Moberg : ouvrir en écartant puis fermer en poing.'],
['Quelle fréquence est rapportée pour la manœuvre de Moberg ?', 'Trois répétitions toutes les heures.'],
['Pourquoi alterner mobilisation et repos ?', 'Pour éviter de réactiver l’inflammation.'],
['Que signifie mobilisation active protégée ?', 'Mobiliser sans compromettre la cicatrisation du traumatisme.'],
['Quels partenaires sont indispensables à la prévention ?', 'Le patient, le chirurgien et le rééducateur.'],
['Quelle raideur après entorse IPP évoque la plaque palmaire ?', 'Une raideur en flexion de l’IPP.'],
['Quel élément du traumatisme oriente vers des adhérences des fléchisseurs ?', 'Une atteinte du canal digital.'],
['Quel retentissement doit être recherché avant une décision ?', 'Vie courante, travail et loisirs.'],
['Pourquoi un secteur de mobilité utile ne se juge-t-il pas uniquement en degrés ?', 'Son acceptabilité dépend du projet fonctionnel du patient.'],
['Quel antécédent local est de mauvais pronostic pour une chirurgie mobilisatrice ?', 'Une infection antérieure.'],
['Pourquoi un doigt mal vascularisé est-il un mauvais candidat ?', 'La chirurgie expose à l’échec tissulaire et fonctionnel.'],
['Après quel délai la récupération d’amplitudes diminue-t-elle nettement ?', 'Après trois mois.'],
['Quel effet a l’absence d’utilisation d’un doigt ?', 'Elle favorise une exclusion corticale.'],
['Pourquoi l’amyotrophie compromet-elle le résultat ?', 'Elle rend la rééducation active difficile ou impossible.'],
['Quel examen radiographique de base est incontournable ?', 'Radiographies de face et de profil.'],
['Que recherchent les radiographies dans une raideur ?', 'Cal, exostose, matériel, incongruence et arthrose secondaire.'],
['Quand un scanner peut-il aider ?', 'Pour préciser notamment un obstacle osseux ou une incongruence.'],
['Quelle imagerie peut préciser une atteinte tendineuse ou ligamentaire ?', 'Échographie ou IRM selon la question clinique.'],
['Que compare-t-on en premier pour orienter l’étiologie ?', 'Les mobilités actives et passives.'],
['Que suggère une mobilité passive supérieure à la mobilité active ?', 'Une atteinte de l’unité musculotendineuse.'],
['Que suggère une mobilité active égale à la passive ?', 'Une cause capsulaire ou osseuse.'],
['Quel test évalue la réserve cutanée ?', 'Le pincement cutané de Littler.'],
['Comment mesurer la force de serrage selon le corpus ?', 'Au dynamomètre, trois fois, alternativement des deux côtés.'],
['Quel test explore les adhérences des extenseurs ?', 'Le test extrinsèque de Kilgore.'],
['Quel résultat de Kilgore évoque les extenseurs adhérents ?', 'La flexion poignet et MP empêche la flexion IPP.'],
['Quel résultat de Kilgore évoque les fléchisseurs rétractés ?', 'L’extension poignet et MP empêche l’extension IPP.'],
['Quel test recherche une atteinte des interosseux ?', 'Le test intrinsèque de Finochietto.'],
['Quel résultat de Finochietto est positif ?', 'Flexion IPP possible MP fléchie mais impossible MP étendue.'],
['Quel test précise une atteinte des lombricaux ?', 'Le test lombrical de Colditz.'],
['Quel test recherche une rétraction du ligament rétinaculaire oblique ?', 'Le test de Haines.'],
['Quel résultat de Haines est positif ?', 'Extension IPP empêchant la flexion IPD.'],
['Quel constat évoque des ligaments latéraux rétractés ?', 'Flexion IPP impossible quelle que soit la position MP avec latéralité limitée.'],
['Quel signe évoque un problème de plaque palmaire ?', 'Une ouverture dorsale « en livre » de l’articulation.'],
['Quels sont les cinq axes du traitement conservateur ?', 'Œdème, douleur, inflammation, motivation et remodelage du collagène.'],
['Comment lutter contre l’œdème constitué ?', 'Surélévation et drainage manuel.'],
['Quel principe de mobilisation faut-il bannir ?', 'La mobilisation brutale sous anesthésie.'],
['Pourquoi la mobilisation brutale est-elle délétère ?', 'Elle réactive l’inflammation et aggrave la raideur.'],
['Quel rôle a l’orthèse statique ?', 'Maintenir une position corrigée pendant le repos.'],
['Quel rôle a l’orthèse dynamique ?', 'Appliquer une traction progressive et sélective.'],
['Que vérifie le test d’abstention ?', 'La persistance d’un rappel élastique après arrêt temporaire de l’orthèse.'],
['Quand arrêter une orthèse selon le test d’abstention ?', 'Quand les amplitudes se maintiennent sans orthèse.'],
['Quand discuter une chirurgie de raideur ?', 'Après échec conservateur chez un patient sélectionné et motivé.'],
['Pourquoi l’examen est-il répété durant le traitement ?', 'La libération ou la rééducation peut révéler une autre cause.'],
['Quelles structures peuvent être rétractées dans un doigt en crochet ?', 'Peau, capsule, ligaments et tendons.'],
['Quel danger vasculaire existe lors d’une correction de flexum ?', 'L’ischémie digitale par tension des pédicules.'],
['Quel danger articulaire existe lors d’une mobilisation opératoire forcée ?', 'La nécrose cartilagineuse par hyperpression.'],
['Qu’est-ce qu’une pseudoboutonnière postopératoire ?', 'Une limitation d’extension IPP liée à l’appareil extenseur après flexum prolongé.'],
['Quelle raideur IPP peut nécessiter une arthrolyse dorsale ?', 'Une raideur en extension fonctionnellement gênante.'],
['Pourquoi prévoir un lambeau avant arthrolyse dorsale ?', 'Le manque de réserve cutanée rend une fermeture simple tendue.'],
['Quand commence la mobilisation après arthrolyse dorsale IPP ?', 'Au premier pansement, vers J3.'],
['Quelles orthèses complètent la rééducation après arthrolyse dorsale ?', 'Orthèses dynamiques d’enroulement et d’extension.'],
['Combien de temps peut durer le remodelage après chirurgie de flexum ?', 'Au moins quatre à six mois.'],
['Quelle position nocturne est utilisée après chirurgie de flexum IPP ?', 'Poignet à 10°, MP fléchie à 80° et IPP en rectitude.'],
['Quand ajouter une orthèse dynamique d’extension sélective IPP après chirurgie ?', 'Vers le 12e jour, après cicatrisation cutanée.'],
['Quand ajouter l’orthèse d’enroulement après chirurgie de flexum ?', 'Vers J30.'],
['Pourquoi inverser le protocole nocturne après ténolyse des fléchisseurs ?', 'L’extension nocturne favoriserait des adhérences de fléchisseurs fragiles.'],
['Quel principe s’applique après ténolyse des fléchisseurs ?', 'Pas de rééducation « en force » pendant trois mois.'],
['Quelle raideur définit un doigt en crochet ?', 'IPP et IPD fixées en flexion.'],
['Quel est le but fonctionnel d’une ténoarthrolyse antérieure ?', 'Déplacer l’arc de mobilité vers un secteur utile.'],
['Quelle structure cutanée doit être restaurée lors d’une libération de C1 ?', 'La première commissure par plastie cutanée.'],
['Quel vaisseau est particulièrement à risque lors de la libération de C1 ?', 'L’artère radiale.'],
['Que faut-il maintenir après traumatisme de la première commissure ?', 'Son écartement.'],
['Quel facteur rend une arthrolyse seule inefficace ?', 'Une destruction articulaire ou un obstacle osseux non corrigé.'],
['Quelle est la complication la plus fréquente menaçant une main traumatisée ?', 'La raideur.'],
['Quelle association est la voie finale commune vers la raideur ?', 'Œdème, douleur et immobilisation en mauvaise position.'],
['Quel objectif justifie une chirurgie de raideur ?', 'Récupérer un secteur de mobilité utile.'],
['Pourquoi informer le patient avant traitement ?', 'La durée et la pénibilité conditionnent l’adhésion thérapeutique.'],
['Quel syndrome douloureux n’exclut pas formellement une chirurgie s’il est froid ?', 'Le syndrome douloureux régional complexe de type 1.'],
['Quel comportement est un mauvais facteur pronostique patient ?', 'Une motivation insuffisante.'],
['Quel facteur toxique doit être recherché ?', 'Le tabagisme excessif.'],
['Pourquoi réaliser une mesure chiffrée répétée ?', 'Suivre la progression et motiver le patient.'],
['Quel est le but du repos entre les mobilisations ?', 'Réduire inflammation, douleur et production de collagène.'],
['Pourquoi une simple entorse IPP peut-elle donner une raideur ?', 'Œdème et immobilisation peuvent rapidement fixer les structures.'],
['Quel est le principe de l’appareillage dans une raideur ?', 'Adapter la contrainte au sens de la déformation et à la tolérance tissulaire.'],
['Que surveille-t-on sous orthèse ?', 'Tolérance cutanée, inflammation et évolution des amplitudes.'],
['Quel est le risque d’une prise en charge tardive ?', 'Rétraction fixée, perte cartilagineuse et difficulté de réintégration fonctionnelle.'],
['Quel constat clinique impose de chercher une cause osseuse ?', 'Limitation active et passive identique.'],
['Quel constat clinique fait suspecter une adhérence tendineuse ?', 'Un déficit actif supérieur au déficit passif.'],
['Pourquoi rechercher les cicatrices existantes ?', 'Elles conditionnent la voie d’abord et la couverture cutanée.'],
['Quel est le rôle des AINS dans le protocole conservateur ?', 'Participer au contrôle de la douleur et de l’inflammation.'],
['Quelle place a la physiothérapie selon le corpus ?', 'Un complément pour contrôler douleur et inflammation.'],
['Quel est le danger d’un doigt multiopéré ?', 'Un mauvais pronostic de libération supplémentaire.'],
['Quelle stratégie est possible pour des adhérences antérieures et postérieures ?', 'Libération en un temps ou en deux temps, débutant alors dorsalement.'],
['Pourquoi une double ténoarthrolyse en un temps est-elle difficile ?', 'Elle cumule les difficultés d’abord et donne des résultats inférieurs à une libération unique.'],
['Quelle est la première étape d’une libération en deux temps ?', 'La libération dorsale.'],
['Quel est le but de l’orthèse d’enroulement transversale ?', 'Concentrer l’effort de flexion sur l’IPP.'],
['Pourquoi tracer le doigt dans le test d’abstention ?', 'Objectiver le rappel élastique entre deux temps sans orthèse.'],
['Que traduit une main sans réserve cutanée ?', 'Un risque de fermeture sous tension et de rééducation impossible.'],
['Quel est le rôle du pansement après arthrolyse dorsale ?', 'Maintenir le doigt en flexion initiale avant mobilisation.'],
['Quelle priorité après tout geste mobilisateur ?', 'Une rééducation précoce, douce et répétée.'],
['Quel est le message central pour un patient traumatisé de la main ?', 'Ne jamais laisser la main gonflée et déclive sans consigne de mobilisation adaptée.']
].map(([recto, verso]) => ({ recto, verso }));

const rawQuestions = [
['Dans la prévention de la raideur aiguë, quelles propositions sont exactes ?', ['La surélévation doit maintenir la main au-dessus du cœur.', true], ['La position déclive est recherchée pour diminuer l’œdème.', false], ['La mobilisation précoce alterne avec des périodes de repos.', true], ['Toute mobilisation active est interdite après traumatisme de la main.', false], ['Les consignes doivent être réexpliquées lors des soins.', true]],
['À propos de la main œdématiée, quelles propositions sont exactes ?', ['Les MP tendent à être en extension.', true], ['Le pouce s’écarte spontanément de la main.', false], ['Les IPP et IPD sont favorisées en flexion.', true], ['La première commissure tend à se fermer.', true], ['L’œdème reste toujours sans conséquence sur les plans de glissement.', false]],
['Concernant l’immobilisation protectrice, quelles propositions sont exactes ?', ['Le poignet est placé en extension à 10°.', true], ['Les MP sont maintenues fléchies.', true], ['Les interphalangiennes sont fléchies.', false], ['La première commissure doit être ouverte.', true], ['Cette position rend toute raideur irrécupérable.', false]],
['Lors de l’évaluation clinique, quelles propositions sont exactes ?', ['La mobilité active et passive sont mesurées analytiquement.', true], ['Une mobilité passive supérieure évoque une atteinte musculotendineuse.', true], ['Des mobilités égales éliminent une cause osseuse.', false], ['La force de serrage peut être mesurée au dynamomètre.', true], ['La peau ne modifie jamais le projet chirurgical.', false]],
['À propos de l’imagerie d’une raideur digitale, quelles propositions sont exactes ?', ['Les radiographies de face et profil sont incontournables.', true], ['Elles recherchent notamment une incongruence articulaire.', true], ['Elles dispensent toujours de l’examen clinique.', false], ['Échographie ou IRM peuvent préciser une atteinte tendineuse ou ligamentaire.', true], ['Un obstacle osseux justifie de forcer la rééducation.', false]],
['Le test extrinsèque de Kilgore permet d’affirmer que, quelles propositions sont exactes ?', ['Une flexion poignet-MP limitant la flexion IPP évoque les extenseurs.', true], ['Une extension poignet-MP limitant l’extension IPP évoque les fléchisseurs.', true], ['Il évalue directement l’artère radiale.', false], ['Il participe à l’orientation de la libération tendineuse.', true], ['Il remplace la mesure des mobilités.', false]],
['À propos du test de Finochietto, quelles propositions sont exactes ?', ['Il explore les interosseux.', true], ['Il est positif si la flexion IPP disparaît MP étendue.', true], ['Il est positif si la flexion IPP s’améliore MP étendue.', false], ['Le test de Colditz peut préciser une atteinte des lombricaux.', true], ['Il s’agit d’un test radiographique.', false]],
['Concernant le test de Haines, quelles propositions sont exactes ?', ['Il recherche une rétraction du ligament rétinaculaire oblique.', true], ['Une extension IPP empêchant la flexion IPD le rend positif.', true], ['Il examine les ligaments latéraux du poignet.', false], ['Il aide à analyser l’appareil extenseur.', true], ['Il s’interprète sans examen des mobilités.', false]]
];
const qcmFocus = [
 ['Surélévation et information du patient','Mobilisation précoce','Repos entre les exercices','Protection pendant la cicatrisation','Coordination des soins'],
 ['Position des métacarpophalangiennes','Position des interphalangiennes','Première commissure','Plans de glissement','Organisation de l’œdème'],
 ['Position du poignet','Position des métacarpophalangiennes','Position des interphalangiennes','Écartement de première commissure','Récupérabilité de la main'],
 ['Mesure des mobilités','Lecture active-passive','Réserve cutanée','Force de serrage','Retentissement fonctionnel'],
 ['Radiographies standard','Obstacle osseux','Incongruence articulaire','Imagerie des tendons','Projet de rééducation'],
 ['Adhérences des extenseurs','Rétraction des fléchisseurs','Position du poignet','Position des MP','Orientation thérapeutique'],
 ['Interosseux','Position MP et flexion IPP','Lombricaux','Test de Colditz','Valeur anatomique du test'],
 ['Ligament rétinaculaire oblique','Couplage IPP-IPD','Analyse de l’extenseur','Limites du test','Intégration au bilan']
];
const qcm = rawQuestions.map((q, i) => ({ label: `QCM — Série ${i + 1} · ${['Prévention','Physiopathologie','Immobilisation','Bilan clinique','Imagerie','Tests extrinsèques','Tests intrinsèques','Rééducation'][i]}`, vignette: '', questions: Array.from({ length: 5 }, (_, n) => {
  const shift = (n + i) % 5; const opts = q.slice(1).map((x, k) => q.slice(1)[(k + shift) % 5]);
  return { enonce: `<p>${q[0].replace('quelles propositions sont exactes ?', `— focus : ${qcmFocus[i][n]} — quelles propositions sont exactes ?`)}</p>`, correction_generale: `<p>Cette question cible ${qcmFocus[i][n].toLowerCase()} ; la correction s’appuie exclusivement sur le corpus.</p>`, items: opts.map((x, k) => ({ lettre: 'ABCDE'[k], enonce: x[0], is_correct: x[1], justification: `<p>${x[1] ? 'Vrai.' : 'Faux.'} ${x[0]}</p>` })) };
}) }));

const dpThemes = [
 ['Œdème aigu après traumatisme fermé', 'Un patient de 34 ans consulte le lendemain d’un traumatisme fermé de la main. La main est gonflée, douloureuse, laissée en position déclive ; les MP sont en extension, les interphalangiennes en flexion et le pouce est rapproché de la paume. Les radiographies ne montrent pas d’obstacle osseux. Il vit seul et doit reprendre rapidement une activité manuelle. Le chirurgien organise un contrôle et une rééducation précoce.'],
 ['Flexum IPP après entorse', 'Une patiente de 28 ans présente trois mois après une entorse de l’IPP un flexum douloureux de l’index. Elle a suivi une immobilisation prolongée. La mobilité active et passive sont toutes deux limitées ; les radiographies ne montrent pas de cal gênant. Elle souhaite récupérer une prise fine pour son travail. Une prise en charge conservatrice structurée est débutée avec un suivi des amplitudes.'],
 ['Raideur des extenseurs après fracture', 'Un homme de 42 ans consulte après consolidation d’un traumatisme de la main. La flexion active de l’IPP est réduite, mais la flexion passive est meilleure. Le test de Kilgore devient limitant lorsque poignet et MP sont fléchis. La peau est souple, les radiographies ne montrent pas d’incongruence. Un suivi régulier est organisé avec le chirurgien et le rééducateur.'],
 ['Rétraction des interosseux', 'Une patiente de 46 ans a une raideur digitale persistante après traumatisme. La flexion IPP est possible lorsque la MP est fléchie mais devient impossible quand la MP est étendue. Elle a conservé un déficit fonctionnel malgré les premières séances, sans signe radiologique d’obstacle osseux. Un programme d’orthèses et de mobilisation douce est ajusté lors de contrôles rapprochés.'],
 ['Raideur en extension IPP', 'Un patient de 39 ans présente une raideur en extension de l’IPP après fracture traitée. La réserve cutanée est faible et le pincement cutané est difficile. Après une rééducation insuffisante, la flexion reste très limitée et gêne la fermeture de la main. Les clichés éliminent un cal bloquant. Une discussion d’arthrolyse avec couverture cutanée anticipée a lieu, suivie d’un programme postopératoire.'],
 ['Doigt en crochet post-traumatique', 'Une patiente de 52 ans est adressée pour un doigt en crochet après traumatisme complexe. IPP et IPD sont fixées en flexion, la peau est rétractée et le traitement conservateur correctement conduit depuis plusieurs mois n’a pas permis de secteur utile. Le patient est motivé, sans infection ni trouble vasculaire ; les radiographies sont analysées avant tout geste. La stratégie associe bilan cutané, geste progressif et rééducation longue.'],
 ['Rétraction de première commissure', 'Un homme de 31 ans a eu un écrasement de la main avec rétraction progressive de la première commissure. L’ouverture de la pince est limitée. La peau est cicatricielle, mais la vascularisation est conservée. Une orthèse d’écartement a été mal tolérée. Le chirurgien évalue une libération avec plastie cutanée et prévoit des contrôles de cicatrisation et de mobilité.'],
 ['Raideur combinée et suivi', 'Une patiente de 57 ans présente une raideur combinée après traumatisme sévère de la main. Les mobilités active et passive sont réduites, plusieurs plans tendineux et capsulaires semblent concernés, et les amplitudes varient sous rééducation. Elle est informée qu’un geste mobilisateur éventuel ne remplace pas les orthèses ni le suivi pluriquotidien. Le projet est réévalué après une période de traitement conservateur documentée.']
];
const dp = dpThemes.map(([theme, vignette], i) => ({ label: `DP ${i + 1} · ${theme}`, vignette, questions: Array.from({length: 7}, (_, n) => {
 const qn=n+1; const prompts = [
  'Quels éléments cliniques et fonctionnels doivent être relevés lors du bilan initial ?',
  'Nouvel élément : quels mécanismes expliquent la posture et l’évolution vers la raideur dans cette situation ?',
  'Nouvel élément : quelles mesures de traitement conservateur sont adaptées dès cette consultation ?',
  'Nouvel élément : comment interpréter la comparaison entre mobilités active et passive et quels tests cibler ?',
  'Nouvel élément : quelle imagerie ou quel contrôle permet d’écarter un obstacle à la récupération ?',
  'Nouvel élément : quels critères conditionnent une éventuelle indication de chirurgie mobilisatrice ?',
  'Nouvel élément : quel suivi de rééducation et d’orthèses doit être organisé après la décision thérapeutique ?'
 ];
 const corrects = [
  ['Mesurer les amplitudes active et passive et les consigner.',true],['Évaluer peau, cicatrices, réserve cutanée et force.',true],['Négliger le retentissement professionnel.',false],['Rechercher les traitements et le délai.',true],['Décider sans examen radiologique.',false],
  ['L’œdème peut envahir les plans de glissement.',true],['Le collagène peut fixer les tissus en bloc cicatriciel.',true],['L’immobilisation corrige toujours spontanément la raideur.',false],['La mauvaise position entretient la déformation.',true],['La douleur n’a aucun rôle.',false],
  ['Surélever la main quand l’œdème est présent.',true],['Associer mobilisations douces et repos.',true],['Forcer brutalement les amplitudes.',false],['Adapter une orthèse au sens de la raideur.',true],['Supprimer toute rééducation.',false],
  ['Une passive supérieure à l’active oriente vers l’unité musculotendineuse.',true],['Le test de Kilgore explore les rapports extrinsèques.',true],['Finochietto explore les interosseux.',true],['Haines explore l’artère radiale.',false],['Les tests rendent les radiographies inutiles.',false],
  ['Des radiographies face et profil recherchent un obstacle osseux.',true],['Un cal ou une incongruence peut expliquer un blocage.',true],['L’imagerie ne sert jamais au suivi.',false],['Échographie ou IRM peuvent préciser tendon ou ligament.',true],['Une arthrolyse est indiquée sans bilan osseux.',false],
  ['Vérifier l’échec d’un traitement conservateur bien conduit.',true],['Évaluer motivation et capacité à suivre la rééducation.',true],['Ignorer l’état cutané et vasculaire.',false],['Prévoir une couverture cutanée si nécessaire.',true],['Opérer malgré une destruction articulaire sans projet de sauvetage.',false],
  ['Organiser une mobilisation précoce et douce après le geste adapté.',true],['Utiliser les orthèses selon l’évolution des amplitudes.',true],['Arrêter le suivi dès le pansement initial.',false],['Poursuivre la rééducation sur la durée du remodelage.',true],['Encourager une rééducation en force après ténolyse.',false]
 ];
 return { enonce: `<p>${prompts[n]}</p>`, correction_generale: '<p>La décision suit l’analyse anatomique et un suivi fonctionnel répété, conformément au corpus.</p>', items: corrects.slice(n * 5, n * 5 + 5).map((x,k)=>({lettre:'ABCDE'[k],enonce:x[0],is_correct:x[1],justification:`<p>${x[1]?'Vrai.':'Faux.'} ${x[0]}</p>`}))};
}) }));
const series = [...qcm, ...dp];
mkdirSync(out, { recursive: true });
writeFileSync(join(out,'fiche.model.json'), JSON.stringify(fiche,null,2));
writeFileSync(join(out,'fiche.body.html'), compileFicheModel(fiche,dir));
writeFileSync(join(out,'chapter.json'), JSON.stringify({title,provenance:{extract:'extract.json',sourceOnly:true},flashcards:facts,series},null,2));
writeFileSync(join(out,'coverage.json'), JSON.stringify({source:'extract.json',images:'3 figures légendées exploitables ; dérogation documentée',flashcards:facts.length,qcm:40,dp:56},null,2));
console.log(JSON.stringify({out, cards:facts.length,series:series.length}));

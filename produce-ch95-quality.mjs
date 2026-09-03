import { resolve, join } from 'node:path';
import { emitOrthopediePackage } from './scripts/lib/orthopedie-package.mjs';

const chapterDir = resolve('../.corpus-orthopedie/techniques-d-osteosynthese-des-fractures-diaphysaires-de-la-jambe');
const outputDir = join(chapterDir, 'delivery', 'source-quality-v1');
const title = 'Techniques d’ostéosynthèse des fractures diaphysaires de la jambe';
const R = (concept, bullets, marker) => ({ concept, bullets, marker });
const S = (titleValue, rows) => ({ title: titleValue, rows });
const fiche = {
  title, year: '2025-2026',
  coverSubtitle: 'Évaluation tissulaire, fixation et prévention des complications',
  sourceBlocks: [1, 4, 9, 17, 26, 33, 40, 48, 56, 63, 71, 80, 89, 98, 106, 116, 124],
  imageException: { reason: 'Les légendes extraites des figures sont fragmentées et non exploitables ; aucune légende n’est reconstituée.' },
  parts: [
    { title: 'Évaluation initiale et urgences', sections: [
      S('Gravité tissulaire', [
        R('Parties molles au premier plan', ['Le pronostic d’une fracture diaphysaire de jambe dépend au moins autant des tissus mous que des lésions osseuses.', 'La face antéromédiale de jambe explique la vulnérabilité cutanée et la fréquence des fractures ouvertes.'], 'ecn'),
        R('Mécanisme et contexte', ['Un traumatisme violent peut créer des lésions pluritissulaires qui compromettent la fonction du membre.', 'L’état général et les lésions associées modifient l’indication, particulièrement chez le polytraumatisé.']),
        R('Réévaluation nécessaire', ['Les lésions cutanées initiales peuvent être sous-estimées après choc direct ou écrasement.', 'Réexaminer l’état cutané : une contusion peut évoluer vers une nécrose secondaire.'], 'trap')
      ]),
      S('Syndrome de loges', [
        R('Complication à rechercher', ['Le syndrome de loges doit être recherché en préopératoire et en postopératoire, dans les fractures ouvertes comme fermées.', 'Douleurs intenses résistantes aux morphiniques, loges tendues, paresthésies et douleur à l’étirement passif sont évocatrices.'], 'ecn'),
        R('Traitement urgent', ['Un syndrome de loges constitué impose une fasciotomie sans délai.', 'En postopératoire, ouvrir les quatre loges par deux incisions longitudinales, antérolatérale et postéromédiale.']),
        R('Surveillance clinique', ['Éviter le bloc périnerveux si la surveillance clinique risque d’être perturbée.', 'Une mesure de pression aide lorsque le patient ne peut être examiné ; le différentiel pression diastolique–pression intramusculaire est déterminant.'], 'yield')
      ])
    ]},
    { title: 'Choix de stratégie et fixation tibiale', sections: [
      S('Indication raisonnée', [
        R('Critères de décision', ['Le niveau et le type de trait, puis l’état des tissus mous, guident la méthode de fixation.', 'L’évaluation clinique prime sur la seule radiographie chez un patient instable ou polytraumatisé.']),
        R('Enclouage de référence', ['L’enclouage centromédullaire verrouillé est la référence des fractures diaphysaires fermées et de certaines fractures ouvertes.', 'Il respecte vascularisation périostée et hématome en travaillant à foyer fermé.'], 'ecn'),
        R('Objectifs de réduction', ['Préserver longueur, rotation et axes anatomiques ou mécaniques.', 'Un cal vicieux rotatoire est très mal toléré et doit être prévenu à chaque temps opératoire.'], 'trap')
      ]),
      S('Installation et abord', [
        R('Installation', ['Installer sur table ordinaire jambe pendante avec barre à genou ou sur table orthopédique.', 'Obtenir au moins 90° de flexion de genou pour faciliter l’introduction du clou.']),
        R('Contrôle radioscopique', ['Avant incision, vérifier que le tibia entier est visualisable de face et de profil à l’amplificateur.', 'Le contrôle guide réduction, alésage, descente du clou et verrouillage.']),
        R('Point d’entrée', ['L’abord peut être transtendineux rotulien ou paratendineux ; l’abord paratendineux médial peut diminuer les douleurs antérieures de genou.', 'La pointe carrée est centrée afin d’éviter une effraction de la corticale postérieure.'])
      ])
    ]},
    { title: 'Enclouage et verrouillage', sections: [
      S('Guide, alésage et clou', [
        R('Guide d’alésage', ['Le guide à olive traverse le foyer sous contrôle radioscopique de face et de profil.', 'Il doit être centré dans l’épiphyse distale sur les deux incidences.']),
        R('Alésage progressif', ['L’alésage est progressif, idéalement par paliers de 0,5 mm et à vitesse lente.', 'Il s’arrête au contact cortical ; le clou final a un diamètre inférieur de 1,5 mm au dernier alésoir.']),
        R('Alésage modéré', ['L’alésage peut favoriser le cal et réduire certaines complications mécaniques.', 'Un alésage modéré constitue le compromis décrit, y compris avec un clou plein non alésé.'], 'yield')
      ]),
      S('Descente et verrouillage', [
        R('Descente du clou', ['La longueur est mesurée avec une règle graduée et la progression contrôlée à l’amplificateur.', 'Avec un clou non alésé, la réduction parfaite du foyer est le temps le plus délicat car le guide ne dirige pas toujours la descente.']),
        R('Principe de verrouillage', ['Le verrouillage est systématiquement proposé.', 'La terminologie unipolaire ou bipolaire est préférable à l’opposition simpliste statique/dynamique.']),
        R('Choix du montage', ['Le verrouillage unipolaire est réservé aux fractures médiodiaphysaires simples isolées.', 'Dans la majorité des autres cas, réaliser un verrouillage bipolaire selon la stabilité recherchée.'], 'trap')
      ])
    ]},
    { title: 'Plaques, fibula et fractures difficiles', sections: [
      S('Fractures métaphysaires', [
        R('Tiers proximal', ['Le risque de cal vicieux est surtout sagittal et frontal, favorisé par le point d’entrée, l’ouverture antérieure et la traction du tendon rotulien.', 'Modifier le point d’entrée, limiter la flexion, utiliser clamp, pointe carrée ou vis directionnelles selon la difficulté.']),
        R('Tiers distal', ['L’élargissement métaphysaire sous-isthmique rend le centrage du clou difficile et peut le rendre instable.', 'Les vis de guidage, ou poller screws, canalisent guide, alésoir et clou.']),
        R('Plaque mini-invasive', ['Les plaques à vis verrouillées posées par voie mini-invasive sont une alternative dans les fractures métaphysaires.', 'Elles offrent une fixation solide et limitent la souffrance cutanée si la technique est rigoureuse.'], 'yield')
      ]),
      S('Rôle de la fibula', [
        R('Stabilisation associée', ['La synthèse fibulaire peut restaurer longueur et réduction tibiale, surtout dans les fractures instables, comminutives ou distales.', 'Elle rigidifie le montage et peut éviter une reprise secondaire complexe.']),
        R('Indication topographique', ['Son intérêt augmente lorsque le trait fibulaire est bas situé.', 'Une fracture médiodiaphysaire isolée de la fibula peut être négligée.']),
        R('Refend', ['En cas de refend proximal ou distal, le tulipage à la descente du clou est un risque réel.', 'Un vissage préalable peut stabiliser le refend avant l’enclouage.'], 'trap')
      ])
    ]},
    { title: 'Fractures ouvertes et situations particulières', sections: [
      S('Fracture ouverte', [
        R('Double objectif', ['Assurer simultanément une ostéosynthèse stable et une couverture du foyer.', 'La prise en charge associe parage, fixation, couverture, lavage et antibiothérapie.'], 'ecn'),
        R('Parage et couverture', ['Le parage excise complètement les tissus dévitalisés ; sa qualité conditionne largement les suites.', 'Une couverture précoce dans les cinq à sept jours diminue l’infection et favorise la consolidation.']),
        R('Choix de fixation', ['Les Gustilo I, II et parfois IIIA peuvent relever d’une ostéosynthèse interne si la couverture est assurée rapidement.', 'Les lésions IIIB ou IIIC imposent souvent une fixation externe initiale, compatible avec une future couverture.'], 'trap')
      ]),
      S('Polytraumatisme et bifocalité', [
        R('Damage control', ['Instabilité hémodynamique, contusion pulmonaire ou traumatisme cranioencéphalique peuvent justifier un fixateur externe en urgence.', 'Un relais interne est discuté dès que les états local et général le permettent.']),
        R('Fracture bifocale', ['Les fractures bifocales sont souvent à haute énergie, ouvertes et associées à un polytraumatisme.', 'L’enclouage est privilégié lorsqu’il est techniquement réalisable ; une surveillance de consolidation est indispensable.']),
        R('Amputation d’emblée', ['Elle se discute si les lésions pluritissulaires compromettent le pronostic fonctionnel du membre ou vital du patient.', 'La décision intègre l’évaluation globale du patient et non la seule fracture.'])
      ])
    ]}
  ],
  synthesis: {
    chiffres: { headers: ['Repère', 'Valeur source', 'Application'], rows: [['Flexion de genou', '≥ 90°', 'Introduction du clou'], ['Paliers d’alésage', '0,5 mm', 'Progressivité'], ['Diamètre du clou', '1,5 mm sous le dernier alésoir', 'Choix final'], ['Couverture précoce', '5–7 jours', 'Limiter infection'], ['Loges de jambe', '4', 'Fasciotomie complète']] },
    tables: [
      { title: 'Choisir la fixation', headers: ['Contexte', 'Option privilégiée', 'Vigilance'], rows: [['Diaphyse fermée', 'Enclouage verrouillé', 'Rotation et axes'], ['Méta-épiphyse', 'Clou avec vis directionnelles ou plaque', 'Centrage'], ['Ouverte IIIB/IIIC', 'Fixateur externe initial', 'Planifier lambeau'], ['Polytraumatisé instable', 'Damage control externe', 'Relais secondaire']] },
      { title: 'Enclouage : séquence sûre', headers: ['Temps', 'Contrôle', 'But'], rows: [['Installation', 'Tibia entier sous ampli', 'Réduction contrôlable'], ['Guide', 'Face et profil distal', 'Centrage'], ['Alésage', 'Progressif', 'Respect du canal'], ['Verrouillage', 'Uni/bipolaire adapté', 'Stabilité sans trouble rotatoire']] },
      { title: 'Pièges majeurs', headers: ['Situation', 'Risque', 'Réponse'], rows: [['Douleur disproportionnée', 'Syndrome de loges', 'Fasciotomie urgente'], ['Tiers proximal', 'Varus/valgus/recurvatum', 'Artifices de réduction'], ['Tiers distal', 'Centrage instable', 'Poller screws / plaque'], ['Plaie grave', 'Infection et non-consolidation', 'Parage + couverture précoce']] }
    ],
    keyPoints: ['Les tissus mous déterminent le pronostic autant que l’os.', 'Rechercher le syndrome de loges avant et après toute ostéosynthèse.', 'L’enclouage verrouillé reste la référence de la diaphyse tibiale.', 'Prévenir systématiquement le trouble rotatoire.', 'Le verrouillage unipolaire est réservé aux fractures simples médiodiaphysaires.', 'Les poller screws guident le clou dans les fractures métaphysaires.', 'Une fracture ouverte exige fixation stable et couverture du foyer.'],
    eclair: ['Évaluer peau, muscles, nerfs, vaisseaux et état général avant le trait osseux seul.', 'Syndrome de loges : clinique puis fasciotomie urgente des quatre loges.', 'Diaphyse fermée : enclouage verrouillé à foyer fermé.', 'Alésage progressif ; clou 1,5 mm sous le dernier alésoir.', 'Contrôler longueur, axe et rotation pendant toute la procédure.', 'Proximal/distal : anticiper cal vicieux ; poller screws si besoin.', 'Ouverte grave : parage, fixation externe compatible avec couverture, antibiothérapie.', 'Polytraumatisé : fixateur de damage control puis relais si possible.']
  }
};

const facts = [
['Quel élément conditionne autant le pronostic qu’une lésion osseuse ?', 'L’état des parties molles.'], ['Pourquoi la face antéromédiale de jambe est-elle vulnérable ?', 'Elle est peu protégée et favorise les traumatismes ouverts.'], ['Quel mécanisme évoque des lésions pluritissulaires ?', 'Un traumatisme violent.'], ['Quelle complication doit être recherchée dans toute fracture de jambe ?', 'Le syndrome de loges.'], ['Dans quels contextes rechercher un syndrome de loges ?', 'Avant et après chirurgie, dans les fractures ouvertes comme fermées.'], ['Quel signe douloureux évoque un syndrome de loges ?', 'Une douleur intense résistante aux morphiniques.'], ['Quel examen dynamique aggrave la douleur d’un syndrome de loges ?', 'La mobilisation passive des orteils.'], ['Quel aspect des loges est évocateur ?', 'Des loges tendues et non dépressibles.'], ['Quel traitement impose un syndrome de loges constitué ?', 'Une fasciotomie urgente.'], ['Combien de loges faut-il libérer dans la fasciotomie de jambe ?', 'Les quatre loges.'], ['Quelles voies composent la fasciotomie classique de jambe ?', 'Une incision antérolatérale et une incision postéromédiale.'], ['Pourquoi proscrire les mini-incisions dans un syndrome de loges ?', 'Elles ne permettent pas une expansion musculaire suffisante.'], ['Pourquoi éviter un bloc périnerveux si le diagnostic est incertain ?', 'Il peut masquer la surveillance clinique et retarder le diagnostic.'], ['Quelle mesure aide chez un patient non examinable ?', 'La pression intracompartimentale.'], ['Quel paramètre de pression est déterminant ?', 'Le différentiel entre pression diastolique et pression intramusculaire.'], ['Quels critères guident le choix de fixation ?', 'Le niveau du trait, son type et l’état des tissus mous.'], ['Quel facteur extra-radiographique modifie l’indication ?', 'L’état général et les lésions associées.'], ['Quelle méthode est la référence de la diaphyse tibiale opérée ?', 'L’enclouage centromédullaire verrouillé.'], ['Quel principe biologique caractérise l’enclouage ?', 'Le foyer fermé avec respect de l’hématome et du périoste.'], ['Quels paramètres osseux faut-il restaurer ?', 'Longueur, rotation et axes.'], ['Quel cal vicieux est très mal toléré ?', 'Le cal vicieux rotatoire.'], ['Quelle installation facilite l’enclouage ?', 'Jambe pendante avec barre à genou ou table orthopédique.'], ['Quelle flexion minimale de genou faut-il obtenir ?', 'Au moins 90°.'], ['Quel contrôle doit être possible avant le début de l’intervention ?', 'La visualisation complète du tibia de face et de profil sous amplificateur.'], ['Quels abords d’enclouage tibial sont possibles ?', 'Transtendineux rotulien ou paratendineux.'], ['Quel abord peut diminuer les douleurs antérieures de genou ?', 'L’abord paratendineux médial.'], ['Quel risque évite un point d’entrée correctement centré ?', 'L’effraction de la corticale postérieure.'], ['Quel guide est utilisé pour l’alésage ?', 'Un guide à olive.'], ['Comment contrôler le passage du guide au foyer ?', 'À l’amplificateur de face et de profil.'], ['Où doit être centré le guide distal ?', 'Dans l’épiphyse distale de face et de profil.'], ['Comment conduire l’alésage ?', 'Progressivement par paliers de 0,5 mm et à vitesse lente.'], ['Quand arrêter l’alésage ?', 'Au contact cortical.'], ['Quel rapport existe entre clou final et dernier alésoir ?', 'Le clou est inférieur de 1,5 mm.'], ['Quel bénéfice biologique est attribué à l’alésage modéré ?', 'Il favorise la formation du cal osseux.'], ['Quel risque mécanique peut diminuer l’alésage ?', 'Certaines complications mécaniques liées au clou.'], ['Quelle difficulté prédomine avec un clou non alésé ?', 'Maintenir une réduction parfaite pendant la descente.'], ['Comment déterminer la longueur du clou ?', 'Avec une règle graduée.'], ['Comment surveiller la descente du clou ?', 'Sous amplificateur de brillance.'], ['Quel est le principe actuel de verrouillage ?', 'Un verrouillage systématiquement proposé.'], ['Quelle terminologie est préférable à statique/dynamique ?', 'Verrouillage unipolaire ou bipolaire.'], ['À quelle fracture réserver un verrouillage unipolaire ?', 'Une fracture médiodiaphysaire simple isolée.'], ['Quel verrouillage choisir dans la majorité des autres fractures ?', 'Un verrouillage bipolaire adapté au montage.'], ['Comment réaliser habituellement le verrouillage distal ?', 'À main levée sous amplificateur.'], ['Quel paramètre doit être vérifié pendant le verrouillage ?', 'L’absence de trouble rotatoire.'], ['Quel risque est accru par l’irradiation lors du verrouillage ?', 'L’exposition de l’équipe et du patient aux rayons X.'], ['Quelle information radiologique doit figurer au compte rendu ?', 'La dose délivrée au patient.'], ['Quel dispositif peut éviter l’amplificateur pour le verrouillage ?', 'Un système de visée par repérage lumineux ou électromagnétique.'], ['Quel intérêt a un verrouillage proximal épiphysaire ?', 'Stabiliser un refend proximal près des plateaux tibiaux.'], ['Quel risque accompagne un refend lors de la descente du clou ?', 'Le tulipage.'], ['Quel geste peut stabiliser un refend avant l’enclouage ?', 'Un vissage préalable.'], ['Quel défaut menace le tiers proximal sous clou ?', 'Un cal vicieux en varus-valgus et flessum-recurvatum.'], ['Quels mécanismes favorisent le défaut proximal ?', 'Ouverture antérieure, traction rotulienne et point d’entrée trop médial.'], ['Quel réglage limite la traction du quadriceps sur le fragment proximal ?', 'Limiter la flexion du genou.'], ['Quels artifices aident la réduction proximale ?', 'Pointe carrée, clamp percutané ou vis directionnelles.'], ['Quel défaut technique menace le tiers distal ?', 'Un mauvais centrage du clou dans la métaphyse élargie.'], ['Quel est le rôle des poller screws ?', 'Canaliser le guide, l’alésoir et le clou.'], ['Quelle synthèse associée peut aider le centrage distal ?', 'La synthèse première de la fibula.'], ['Quelle alternative à l’enclouage existe au tiers distal ?', 'Une plaque verrouillée mini-invasive.'], ['Quel avantage cutané apporte la plaque mini-invasive ?', 'Elle limite la souffrance cutanée.'], ['Quel est le rôle mécanique de la fibula synthésée ?', 'Restaurer longueur et rigidifier le montage tibial.'], ['Quand l’ostéosynthèse fibulaire est-elle particulièrement utile ?', 'Dans les fractures instables, comminutives ou à trait fibulaire bas.'], ['Quelle fracture fibulaire peut être négligée ?', 'Une fracture médiodiaphysaire isolée.'], ['Quelle fixation a peu de place dans une fracture fermée isolée ?', 'La fixation externe.'], ['Quelle exception peut justifier une fixation externe en fracture fermée ?', 'Le polytraumatisme avec atteinte thoracique ou crânienne.'], ['Comment évolue le délai de consolidation d’une fracture ouverte ?', 'Il est doublé.'], ['Comment évolue le risque de pseudarthrose d’une fracture ouverte ?', 'Il est triplé.'], ['Comment évolue le risque infectieux d’une fracture ouverte ?', 'Il est quintuplé.'], ['Quels deux objectifs ont les fractures ouvertes ?', 'Stabilité osseuse et couverture du foyer.'], ['Quels temps composent la prise en charge d’une fracture ouverte ?', 'Parage, fixation, couverture, lavage et antibiothérapie.'], ['Quel est le principe du parage ?', 'Excision complète des tissus dévitalisés.'], ['Quand viser la couverture secondaire ?', 'Dans les cinq à sept jours.'], ['Quel bénéfice de la couverture précoce ?', 'Diminuer l’infection et favoriser la consolidation.'], ['Quelles fractures ouvertes peuvent être traitées comme fermées ?', 'Gustilo I, II et parfois IIIA si couverture rapide.'], ['Quelle fixation est souvent retenue dans les Gustilo IIIB ou IIIC ?', 'Une fixation externe initiale.'], ['Comment positionner les fiches d’un fixateur externe ?', 'De gros diamètre, proches du foyer et compatibles avec un futur lambeau.'], ['Quels lambeaux peuvent couvrir une jambe ouverte ?', 'Fasciocutanés, musculaires ou libres selon la perte de substance.'], ['Quelle place a la pression négative ?', 'Une solution temporaire avant couverture, sans remplacer le lambeau.'], ['Quelle complication de l’os doit être anticipée en fracture ouverte ?', 'La perte de substance osseuse.'], ['Quelle stratégie de stabilisation chez un polytraumatisé instable ?', 'Un fixateur externe de damage control.'], ['Pourquoi l’alésage peut-il être évité chez un polytraumatisé ?', 'Une contusion pulmonaire peut le contre-indiquer.'], ['Quand discuter un relais interne après damage control ?', 'Dès que l’état local et général le permettent.'], ['Quel contexte est fréquent dans les fractures bifocales ?', 'Un traumatisme à haute énergie souvent associé à un polytraumatisme.'], ['Quelle méthode privilégier dans une bifocale techniquement accessible ?', 'Un enclouage verrouillé.'], ['Quelle surveillance impose une fracture bifocale ?', 'Une surveillance attentive de la consolidation.'], ['Comment stimuler une ostéogenèse insuffisante dans une bifocale ?', 'Dynamisation, réenclouage avec alésage ou stimulation physique selon le cas.'], ['Quand un fixateur externe est-il indiqué dans une bifocale ?', 'Dans les formes ouvertes IIIB/IIIC ou très proximales.'], ['Quand discuter une amputation d’emblée ?', 'Si les lésions pluritissulaires compromettent le membre ou le pronostic vital.'], ['Pourquoi la classification tissulaire peut-elle évoluer ?', 'Les lésions peuvent être sous-estimées avant le parage.'], ['À quel moment certains fixent-ils la classification définitive ?', 'Au bloc opératoire après évaluation des tissus.'], ['Que décrit le classement Tscherne C0 ?', 'Une fracture fermée sans traumatisme des parties molles.'], ['Que peut comporter un Tscherne C3 ?', 'Contusion étendue, décollement, syndrome de loges ou lésion neurovasculaire.'], ['Quel élément Gustilo ajoute-t-il à la description cutanée ?', 'L’énergie traumatique et les lésions vasculaires.'], ['Pourquoi l’AO tissulaire est-elle peu utilisée au terrain ?', 'Sa complexité limite son usage pratique.'], ['Quel principe doit guider le choix d’un fixateur externe ?', 'La rigueur de pose conditionne la stabilité à long terme.'], ['Pourquoi la réduction est-elle une préoccupation constante ?', 'Pour prévenir les défauts d’axe et de rotation.'], ['Quels deux plans radioscopiques sont indispensables ?', 'Face et profil.'], ['Quelle structure préserver par la chirurgie à foyer fermé ?', 'La vascularisation périostée.'], ['Quel élément biologique préserver par la chirurgie à foyer fermé ?', 'L’hématome fracturaire.'], ['Quel montage peut rester dynamique malgré un verrouillage bipolaire ?', 'Un clou avec trou oblong proximal.'], ['Quel objectif des vis directionnelles au tiers proximal ?', 'Canaliser guide, alésoir et clou pour corriger la réduction.'], ['Pourquoi faire une synthèse fibulaire avant le clou tibial ?', 'Elle aide à restaurer longueur et centrage.'], ['Quelle erreur rend un clou distal instable ?', 'Un mauvais centrage dans une métaphyse sous-isthmique élargie.'], ['Quel facteur local doit faire préférer une stratégie externe ?', 'Des lésions pluritissulaires étendues.'], ['Quel élément de prise en charge prévient l’infection d’une fracture ouverte ?', 'Lavage associé à une antibiothérapie et au parage.'], ['Quel risque justifie la surveillance clinique répétée de la peau ?', 'La nécrose secondaire des tissus contus.'], ['Quelle différence clinique évoque une urgence de loge ?', 'Douleur disproportionnée avec paresthésies et tension des loges.'], ['Quel objectif du verrouillage est universel ?', 'Obtenir la stabilité sans malrotation.']
];
if (facts.length < 100 || facts.length > 200) throw new Error(`Nombre de cartes invalide : ${facts.length}`);
const domains = [facts.slice(0, 14), facts.slice(14, 28), facts.slice(28, 42), facts.slice(42, 56), facts.slice(56, 70), facts.slice(70, 84), facts.slice(84, 98), facts.slice(98)];
const letters = ['A','B','C','D','E'];
function question(enonce, correct, domain, index) {
  const wrong = domain.filter((x) => x[1] !== correct).map((x) => x[1]);
  const values = [correct, ...wrong.slice(index % wrong.length, index % wrong.length + 4)]; while (values.length < 5) values.push(wrong[values.length % wrong.length]);
  const shift = index % 5; const ordered = [...values.slice(shift), ...values.slice(0, shift)];
  return { enonce, correction_generale: `Réponse attendue : ${correct}`, items: ordered.map((value, i) => ({ lettre: letters[i], enonce: value, is_correct: value === correct, justification: value === correct ? 'Conforme au chapitre source.' : 'Cette proposition répond à un autre problème de la fracture de jambe.' })) };
}
const qcmTitles = ['Évaluation et syndrome de loges','Indication et installation','Guide et alésage','Verrouillage et réduction','Proximal, distal et plaque','Fibula et fracture ouverte','Couverture et damage control','Classifications et points de vigilance'];
// Les QCM sont volontairement des décisions de situation et non un second
// jeu de flashcards. Chaque formulation mobilise la donnée source dans un
// contexte clinique ou opératoire précis.
const qcmPrompts = [
  [
    'Après une fracture de jambe à haute énergie, quel élément doit peser autant que le trait osseux dans l’évaluation pronostique ?',
    'Devant un choc direct de jambe, quelle caractéristique anatomique explique la vigilance cutanée antéromédiale ?',
    'Quel mécanisme doit faire anticiper une atteinte pluritissulaire plutôt qu’une fracture isolée ?',
    'Au contrôle préopératoire puis postopératoire d’une fracture de jambe, quelle urgence doit être systématiquement recherchée ?',
    'Dans quelle situation la surveillance d’un syndrome de loges reste-t-elle indiquée ?'
  ],
  [
    'Chez un patient non examinable avec suspicion de syndrome de loges, quel paramètre comparatif aide la décision ?',
    'Pour choisir une stratégie de fixation d’une fracture diaphysaire de jambe, quelles données doivent être croisées ?',
    'Chez un polytraumatisé, quelle donnée peut modifier une indication malgré une radiographie rassurante ?',
    'Pour une fracture diaphysaire tibiale fermée opérée, quelle méthode est le standard décrit par le corpus ?',
    'Quel principe permet à l’enclouage de préserver l’environnement biologique du foyer ?'
  ],
  [
    'Pendant un enclouage, quel contrôle assure que le guide franchit correctement le foyer de fracture ?',
    'Avant la descente du clou tibial, quelle position distale du guide évite un mauvais axe ?',
    'Quelle conduite d’alésage réduit le risque d’agression excessive du canal ?',
    'Quel repère doit faire interrompre l’alésage progressif ?',
    'Comment choisir le diamètre du clou après le dernier alésoir ?'
  ],
  [
    'Lors d’un verrouillage distal de clou tibial, quelle technique de repérage est habituellement utilisée ?',
    'Quel défaut doit être contrôlé avant de finaliser le verrouillage d’un clou tibial ?',
    'Quelle conséquence du verrouillage sous amplificateur doit être tracée dans la démarche de radioprotection ?',
    'Quelle donnée de radioprotection doit figurer dans le compte rendu opératoire ?',
    'Quel dispositif peut diminuer le recours à l’amplificateur pour le verrouillage distal ?'
  ],
  [
    'Dans une fracture distale de jambe avec canal métaphysaire élargi, quelle synthèse associée peut contribuer au centrage du clou tibial ?',
    'Si le contrôle du clou devient instable au tiers distal, quelle autre méthode de fixation peut être discutée ?',
    'Chez un patient aux parties molles fragiles, quel bénéfice motive une plaque posée mini-invasive ?',
    'Dans une fracture tibiale instable avec fracture fibulaire associée, quel effet recherché justifie la synthèse de la fibula ?',
    'Dans quel profil la synthèse fibulaire apporte-t-elle le plus de stabilité ?'
  ],
  [
    'Après parage d’une fracture ouverte, dans quel délai viser la couverture secondaire lorsque cela est possible ?',
    'Pourquoi organiser précocement la couverture d’un foyer tibial ouvert ?',
    'Quelles fractures ouvertes peuvent recevoir une ostéosynthèse interne si la couverture est rapidement assurée ?',
    'Pour une lésion Gustilo IIIB ou IIIC, quel montage initial est le plus souvent compatible avec la stratégie de couverture ?',
    'Comment placer les fiches d’un fixateur externe afin de préserver la future couverture ?'
  ],
  [
    'Devant un retard d’ostéogenèse sur fracture bifocale, quelle stratégie peut être discutée selon la stabilité du montage ?',
    'Dans quelle situation de fracture bifocale de jambe le fixateur externe est-il particulièrement indiqué ?',
    'Quel tableau pluritissulaire peut conduire à discuter une amputation d’emblée ?',
    'Pourquoi la classification des lésions cutanées doit-elle être réévaluée après le traumatisme ?',
    'À quel moment la classification définitive des parties molles peut-elle être retenue ?'
  ],
  [
    'Quel montage permet une dynamique contrôlée malgré un verrouillage bipolaire ?',
    'Au tiers proximal tibial, quel est l’objectif des vis directionnelles lors de l’enclouage ?',
    'Pourquoi stabiliser la fibula avant l’enclouage dans certaines fractures distales ?',
    'Quelle erreur technique explique l’instabilité d’un clou dans une métaphyse distale élargie ?',
    'Quel état local doit faire préférer une stratégie externe temporaire ?'
  ],
];
const qcm = domains.map((domain, i) => ({
  label: `QCM ${i+1} — ${qcmTitles[i]}`,
  vignette: '',
  questions: domain.slice(0, 5).map(([, answer], j) => question(qcmPrompts[i][j], answer, domain, i + j)),
}));
const dpSpecs = [
['Traumatisme fermé avec douleur croissante','Un homme de 25 ans est admis après un accident de deux-roues avec fracture diaphysaire fermée de jambe. Les douleurs augmentent malgré les morphiniques ; les loges sont tendues et la mobilisation passive des orteils est très douloureuse. Après la décision opératoire, le suivi devra surveiller la récupération neurologique, la fermeture cutanée, la consolidation et l’axe radiographique.',domains[0]],
['Enclouage d’une fracture diaphysaire simple','Une femme de 42 ans présente une fracture diaphysaire tibiale fermée isolée. L’équipe programme un enclouage verrouillé à foyer fermé après contrôle clinique tissulaire. L’installation, les contrôles radioscopiques et le verrouillage sont planifiés. Après chirurgie, le suivi associe douleur, cicatrisation, mobilité du genou et radiographies de consolidation.',domains[1]],
['Alésage et centrage distal','Un homme de 36 ans est opéré d’une fracture diaphysaire de jambe par enclouage. Le guide à olive doit franchir le foyer puis être centré dans l’épiphyse distale sous amplificateur. La taille du clou est choisie après alésage. Le suivi postopératoire évalue l’axe, l’absence de malrotation et la progression de consolidation.',domains[2]],
['Verrouillage d’un clou tibial','Une patiente de 51 ans présente une fracture tibiale nécessitant un clou verrouillé. La réduction est obtenue puis la longueur du clou et sa descente sont vérifiées à l’amplificateur. Le verrouillage est choisi selon le trait. Le suivi contrôlera la douleur, la cicatrice, l’axe rotationnel et la consolidation radiologique.',domains[3]],
['Fracture métaphysaire proximale','Un homme de 48 ans présente une fracture du tiers proximal du tibia. L’imagerie montre un risque de déplacement sagittal et frontal lors de l’enclouage. L’équipe prépare des artifices de réduction et discute le positionnement du point d’entrée. Après traitement, le suivi recherche cal vicieux, douleur, mobilité et consolidation.',domains[4]],
['Fracture distale avec trait fibulaire bas','Une femme de 55 ans présente une fracture distale de jambe avec trait fibulaire bas. Le canal métaphysaire élargi rend le centrage du clou difficile et une stabilisation fibulaire est discutée. L’intervention est contrôlée sous amplificateur. Les consultations de suivi vérifieront l’axe, l’appui autorisé et la consolidation.',domains[5]],
['Fracture ouverte de jambe','Un homme de 31 ans est victime d’un écrasement avec fracture ouverte tibiale et plaie souillée. Après évaluation des tissus mous, l’équipe réalise parage, lavage, antibiothérapie et stabilisation en planifiant la couverture. Le suivi rapproché porte sur l’état cutané, l’infection, la viabilité du lambeau et la consolidation.',domains[6]],
['Polytraumatisé avec fracture bifocale','Une patiente de 29 ans est polytraumatisée après accident de la voie publique, avec fracture bifocale de jambe et contusion pulmonaire. L’état hémodynamique impose une stratégie de damage control ; un relais est discuté après stabilisation. Le suivi longitudinal contrôle la consolidation de chaque foyer, l’infection, l’axe et la fonction.',domains[7]]
];
const dp = dpSpecs.map(([label,vignette,domain], s) => ({ label:`DP ${s+1} — ${label}`, vignette:`<p>${vignette}</p>`, questions: domain.slice(0,7).map(([q,a], i) => question(i ? `<p><em>Nouvel élément :</em> les données cliniques, peropératoires ou de suivi sont confirmées.</p><p><em>Question :</em> ${q}</p>` : `<p><em>Question :</em> ${q}</p>`,a,domain,s+i)) }));
emitOrthopediePackage({ chapterDir, outputDir, fiche, facts: facts.map(([recto,verso]) => ({ recto, verso:`<strong>${verso}</strong>` })), series:[...qcm,...dp] });

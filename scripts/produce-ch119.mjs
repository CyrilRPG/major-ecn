import { resolve, join } from 'node:path';
import { emitOrthopediePackage } from './lib/orthopedie-package.mjs';

const chapterDir = resolve('C:/Users/Admin/Desktop/Major-ecn-projects/.corpus-orthopedie/traitement-des-fractures-de-la-pince-malleolaire');
const outputDir = join(chapterDir, 'delivery', 'source-quality-2026-08-10');
const B = (text, children) => children ? { text, children } : { text };
const image = (n, caption, sourceCaption, size = 'large') => ({ path: `img/img_${String(n).padStart(3, '0')}.png`, position: 'after', size, caption, sourceCaption });

const fiche = {
  title: 'Traitement des fractures de la pince malléolaire',
  year: '2025-2026', coverSubtitle: 'Item d’orthopédie',
  sourceBlocks: [1,3,5,12,15,18,30,34,40,42,44,48,50,61,68,70,73,87,94,99,101,105,185,187,190,192,195,200,205,215,219,226,230,232,241],
  imageException: { reason: 'Le corpus ne livre que six figures, dont une sans légende exploitable ; les cinq légendées sont employées.' },
  parts: [
    { title: 'Accueil et sauvegarde cutanée', sections: [
      { title: 'Bilan de gravité', rows: [
        { concept: 'Bilan vasculonerveux', marker: 'yield', bullets: [B('Palper les pouls distaux et tester la sensibilité plantaire (tibial), du dos du pied (fibulaire superficiel) et de la première commissure (fibulaire profond).'),B('Une atteinte est exceptionnelle : rechercher artériopathie chronique ou neuropathie associée.')] },
        { concept: 'Fracture ouverte', marker: 'trap', bullets: [B('L’ouverture antéromédiale associe fracture ouverte et plaie articulaire : couverture immédiate par compresses stériles au sérum physiologique.'),B('Proscrire iodés et chlorés sur le cartilage ; ne pas réintégrer un fragment exposé hors bloc.')] },
        { concept: 'Souffrance cutanée fermée', bullets: [B('Contusion dermique : plage pâle, terne, purpurique et anesthésique, à risque d’escarre et surinfection.'),B('Phlyctènes : souffrance superficielle ; la perforation expose à l’infection.'),B('Ne jamais inciser une zone douteuse ni son voisinage.')] }
      ] },
      { title: 'Luxation et attelle', rows: [
        { concept: 'Luxation postérolatérale', marker: 'trap', bullets: [B('Une peau apparemment normale peut être menacée par la saillie antéromédiale du pilon.'),B('Signes : élargissement sagittal, équin avec talon saillant, raccourcissement du dos du pied.'),B('Réduire sans délai si l’imagerie retarde la protection cutanée.')] },
        { concept: 'Réduction urgente', bullets: [B('Jambe pendante, genou à 90° sous analgésie adaptée.'),B('Empaumer le talon, contre-appui tibial, traction ferme d’arrière en avant de type arrache-botte.'),B('La détente antéromédiale confirme le geste.')] },
        { concept: 'Immobilisation provisoire', bullets: [B('Attelle indispensable en léger varus-équin.'),B('Segment suropédieux d’abord jambe pendante, puis segment proximal avec genou fléchi à 45°.')] }
      ] }
    ] },
    { title: 'Imagerie et anatomie lésionnelle', sections: [
      { title: 'Lecture radiologique', rows: [
        { concept: 'Face et profil centrés', marker: 'yield', bullets: [B('Inventorier déplacement talien, malléoles, marges antérieure et postérieure, syndesmose, espace interosseux et interligne.'),B('L’analyse fine pré- et peropératoire recherche les petits défauts après réduction.')], image: image(3,'Radiographie de face : interligne, syndesmose et malléoles.','Figure 16. Radiographie de la cheville de face. Analyse de l’interligne, de la syndesmose et des malléoles.') },
        { concept: 'Scanner ciblé', bullets: [B('Utile devant un doute sur une marge articulaire ou un enfoncement ostéochondral.'),B('Il ne doit jamais retarder réduction d’une luxation ou ostéosynthèse urgente.')] },
        { concept: 'Influence de la rotation', bullets: [B('La rotation modifie l’image de la syndesmose et de l’épiphyse tibiale.'),B('Interpréter une mesure uniquement sur cliché correctement positionné.')], image: image(5,'La rotation modifie l’image radiographique de la mortaise.','Figure 19. Incidence de la rotation sur l’image de l’épiphyse du tibia, de la malléole fibulaire et du talus.') }
      ] },
      { title: 'Lésions à ne pas méconnaître', rows: [
        { concept: 'Abduction basse et équivalent bimalléolaire', bullets: [B('Abduction basse : valgus, foyers dans le plan de l’interligne, forte instabilité du sujet âgé avec possible enfoncement latéral.'),B('Une fracture isolée de fibula impose l’examen du ligament collatéral médial et de l’espace talomalléolaire.')] },
        { concept: 'Fracture de Maisonneuve', marker: 'ecn', bullets: [B('Fracture fibulaire proximale, dislocation tibiofibulaire complète et rupture de toute la membrane interosseuse.'),B('La malléole médiale peut être intacte : le maxi-diastasis est alors facilement méconnu.')], image: image(4,'Mesure radiologique de la syndesmose.','Figure 17. Mesure radiologique de la syndesmose entre le bord fibulaire médial et le tubercule postérieur.') },
        { concept: 'Marges et impactions', bullets: [B('Tubercule antérieur : scanner après réduction et ostéosynthèse obligatoire.'),B('Volkmann est souvent réduit par la restitution fibulaire ; Cunéo-Picot est une fracture-séparation de toute la marge postérieure.'),B('Grand enfoncement : relèvement et greffon corticospongieux ; petit enfoncement : respect.')]} 
      ] }
    ] },
    { title: 'Réduction anatomique de la mortaise', sections: [
      { title: 'Principes mécaniques', rows: [
        { concept: 'Objectif opératoire', marker: 'yield', bullets: [B('La restitution de la mortaise doit être anatomique, sans défaut : les malréductions induisent une malrotation talienne pathogène.'),B('Cette exigence concerne tous les temps de l’intervention.')] },
        { concept: 'Malréduction fibulaire', marker: 'trap', bullets: [B('Varus, allongement, recurvatum distal et rotation externe créent un conflit talofibulaire distal.'),B('Le pseudo-diastasis est un élargissement construit par ce conflit.'),B('Devant une syndesmose large, reprendre d’abord la réduction fibulaire ; une vis isolée aggrave la malrotation.')] },
        { concept: 'Malréduction médiale', bullets: [B('Verticalisation sur comminution ou vice rotatoire médial provoquent un conflit talomalléolaire.'),B('Ils aggravent même un petit défaut latéral.')] }
      ] },
      { title: 'Marge postérieure et cartilage', rows: [
        { concept: 'Volkmann', bullets: [B('Habituellement moins de 15 % de la surface portante.'),B('Réduction et stabilisation exactes de la fibula permettent le plus souvent sa réduction indirecte.')] },
        { concept: 'Cunéo et Picot', bullets: [B('Trait frontal séparant tout le secteur postérieur de la mortaise, associé à une luxation postérieure.'),B('Après réduction, le fragment postéromédial peut sembler réduit alors que le postérolatéral reste déplacé.'),B('Rechercher sur la face dédoublement de corticale médiale et anomalie trabéculaire supramalléolaire.')] },
        { concept: 'Enfoncement ostéochondral', bullets: [B('Peut être antéromédial, postérolatéral ou latéral.'),B('Relever un enfoncement étendu, le stabiliser par greffon corticospongieux ; ne pas forcer un petit tassement.')]} 
      ] }
    ] },
    { title: 'Voies d’abord et synthèses', sections: [
      { title: 'Respect des tissus mous', rows: [
        { concept: 'Règles d’incision', bullets: [B('Cicatrice souple, indolore dans la chaussure ; aucune incision sur relief osseux.'),B('Aucun décollement cutané : exposition sous-périostée seule.'),B('Marquer traits et incisions avant le geste ; incision rectiligne assez longue pour ne pas être sous tension.')] },
        { concept: 'Voies malléolaires', bullets: [B('Préfibulaire : expose syndesmose et tubercule antérieur ; protéger le nerf fibulaire superficiel.'),B('Antéromédiale : protéger grande veine saphène et rameau nerveux.'),B('Deux incisions latérales exigent un pont cutané d’au moins quatre travers de doigts.')], image: image(2,'Installation opératoire en décubitus dorsal.','Figure 13. Installation en décubitus dorsal avec utilisation de la rotation de hanche pour exposer les secteurs du cou-de-pied.') },
        { concept: 'Voie postéromédiale', bullets: [B('Expose pilier postéromédial et face postérieure du pilon, idéalement en décubitus ventral.'),B('Le paquet vasculonerveux postérieur est mobilisé en bloc, sans dissection directe.')] }
      ] },
      { title: 'Choix du montage', rows: [
        { concept: 'Foyer fibulaire simple', bullets: [B('Oblique longue ou spiroïde : au moins deux vis en compression.'),B('Sans enfoncement, réparation médiale possible par points transosseux noués en légère flexion dorsale et rotation interne.')] },
        { concept: 'Foyer fibulaire complexe', bullets: [B('Plaque vissée solide ; la réparation ligamentaire médiale est alors inutile.'),B('Un enfoncement latéral fait aussi préférer un montage solide.'),B('Le test en valgus est inutile : l’instabilité est surtout rotatoire et le test contraint le montage.')] },
        { concept: 'Diastasis après synthèse', marker: 'trap', bullets: [B('Évoquer d’abord une malréduction rotatoire de fibula et reprendre le montage.'),B('Si fibula anatomique et désinsertion distale certaine du LCM : arthrotomie antéromédiale pour rechercher une incarcération.')] }
      ] }
    ] },
    { title: 'Cas complexes et suites', sections: [
      { title: 'Situations spécifiques', rows: [
        { concept: 'Syndesmodèse', bullets: [B('Inutile dans la majorité des fractures si la fibula est réduite exactement.'),B('Maisonneuve est l’exception : deux vis Heim parallèles ou deux broches croisées.'),B('Retrait à 6 semaines, obligatoirement avant appui.')] },
        { concept: 'Tubercule antérieur et terrain fragile', bullets: [B('Tubercule antérieur : mini-vis en compression ou ostéosuture ; pas de syndesmodèse complémentaire si réparation anatomique.'),B('Sujet très âgé : privilégier une bonne prise osseuse ; éviter plaque si vis mal ancrées.'),B('Délabrement cutané : discuter fixation limitée, fixateur tibiopédieux ou embrochage transplantaire.')] },
        { concept: 'Fracture ouverte', bullets: [B('Lavage au sérum tiède, excision des zones douteuses et matériel médial totalement intraosseux.'),B('Ne jamais fermer sous tension : nécrose et greffe septique sont à craindre.')] }
      ] },
      { title: 'Surveillance et traitement orthopédique', rows: [
        { concept: 'Suites opératoires', marker: 'yield', bullets: [B('Attelle postérieure en position de fonction ou léger talus, jamais équin ; surveiller coloration et sensibilité pulpaire.'),B('HBPM et surveillance rigoureuse des berges ; prélèvements avant antibiothérapie si anomalie.'),B('Botte puis rééducation à 6 semaines ; appui entre 8 et 12 semaines selon radiologie et lésions.')] },
        { concept: 'Traitement orthopédique', bullets: [B('Objectif : maintenir un centrage talien parfait jusqu’à consolidation, non réduire chaque foyer à tout prix.'),B('Réservé à une peau totalement intègre et une stabilité certaine ; tout déplacement secondaire impose reprise.')] },
        { concept: 'Surveillance plâtrée', bullets: [B('Bottillon de plâtre de Paris, genou à 45°, pied en léger équin.'),B('Contrôler face, profil et test de Skinner ; J2, J8, J15 et J21.'),B('Libérer le genou à 6 semaines et reprendre l’appui à 8 semaines si le centrage est maintenu.')] }
      ] }
    ] }
  ],
  synthesis: {
    chiffres: { headers:['Échéance','Décision'], rows:[['Immédiat','Réduire toute luxation qui menace la peau ; couvrir une ouverture'],['6 semaines','Retirer syndesmodèse, débuter rééducation après botte'],['8–12 semaines','Reprise de l’appui selon radiologie et lésions']] },
    tables:[{ title:'Décisions de sécurité',headers:['Situation','Conduite'],rows:[['Luxation ou peau menacée','Réduction urgente'],['Syndesmose large après fibula','Corriger la malréduction fibulaire'],['Maisonneuve','Syndesmodèse temporaire retirée avant appui'],['Peau dévitalisée','Voies à distance et fixation adaptée']]},{title:'Pièges anatomiques',headers:['Lésion','Message'],rows:[['Tubercule antérieur','Scanner puis ostéosynthèse'],['Cunéo-Picot','Fracture-séparation postérieure à ne pas sous-estimer'],['Grand enfoncement','Relèvement et greffon'],['Pseudo-diastasis','Conflit de malréduction, pas vis isolée']]}],
    keyPoints:['La peau décide de l’urgence.','Le scanner ne doit pas retarder une réduction.','La fibula doit être anatomiquement réduite.','Une syndesmose large impose d’abord de revoir la fibula.','Maisonneuve est l’exception à l’absence habituelle de syndesmodèse.','La botte maintient la position de fonction, jamais l’équin.','Appui entre 8 et 12 semaines selon lésions.'],
    eclair:['Bilan neurovasculaire et cutané systématique.','Ouverture : sérum physiologique, pas d’antiseptique cytotoxique, bloc urgent.','Luxation : réduction urgente si conflit cutané.','Face et profil centrés ; scanner ciblé après réduction.','Syndesmose large : rechercher malréduction fibulaire.','Maisonneuve : syndesmodèse temporaire, retrait avant appui.','Rééducation à 6 semaines ; appui progressif à partir de 8 semaines.']
  }
};

const factsRaw = `
Quel examen vasculaire est systématique ?\tPalpation des pouls distaux.
Quel territoire explore le nerf tibial ?\tLa sensibilité plantaire.
Quel territoire explore le fibulaire superficiel ?\tLe dos du pied.
Quel territoire explore le fibulaire profond ?\tLa première commissure dorsale.
Quelle localisation typique a une ouverture de pince malléolaire ?\tAntéromédiale.
Quel liquide couvre une exposition ostéochondrale ?\tDu sérum physiologique sur compresses stériles.
Quels antiseptiques sont cytotoxiques pour le cartilage ?\tLes dérivés iodés ou chlorés.
Que faire d’un fragment osseux exposé avant le bloc ?\tNe pas le réintégrer.
Quel signe décrit une contusion dermique grave ?\tUne plage pâle, terne, purpurique et anesthésique.
Pourquoi une contusion dermique est-elle grave ?\tElle peut évoluer vers escarre et surinfection.
Que traduisent les phlyctènes ?\tUne souffrance cutanée superficielle post-traumatique.
Quel risque fait courir une phlyctène perforée ?\tLa surinfection.
Que signifie une peau normale face à une luxation ?\tElle n’exclut pas un conflit cutané profond.
Quel déplacement menace la peau antéromédiale ?\tLa luxation postérolatérale du pied.
Quel signe clinique évoque une luxation de cheville ?\tL’élargissement sagittal du cou-de-pied.
Quel autre signe évoque une luxation ?\tL’équin avec saillie du talon.
Quelle position du genou détend les gastrocnémiens ?\t90 degrés de flexion.
Quel est le sens de la traction arrache-botte ?\tD’arrière en avant sur le talon.
Quel signe confirme une réduction de luxation ?\tLa détente du plan cutané antéromédial.
Quelle position doit avoir l’attelle provisoire ?\tLéger varus-équin.
Quelles incidences radiographiques sont nécessaires ?\tFace et profil centrés.
Que recherche l’analyse radiographique de base ?\tTalus, malléoles, marges, syndesmose, interligne.
Quand le scanner est-il utile ?\tDoute sur marge articulaire ou enfoncement ostéochondral.
Quand le scanner est-il contre-productif ?\tS’il retarde une réduction urgente.
Quel mécanisme caractérise l’abduction basse ?\tValgus avec foyers dans le plan de l’interligne.
Quel terrain est fréquent dans l’abduction basse ?\tLe sujet âgé.
Que rechercher dans une fracture isolée de fibula ?\tUne lésion du ligament collatéral médial.
Que comporte une fracture de Maisonneuve ?\tFracture fibulaire proximale et dislocation tibiofibulaire complète.
Quelle membrane est rompue dans Maisonneuve ?\tToute la membrane interosseuse.
Pourquoi Maisonneuve peut-elle être méconnue ?\tLa malléole médiale peut rester intacte.
Pourquoi fixer un tubercule antérieur ?\tIl conditionne la congruence antérolatérale.
Quel examen dépiste un tubercule antérieur mal visible ?\tLe scanner après réduction.
Quelle surface intéresse habituellement Volkmann ?\tMoins de 15 % de la surface portante.
Quel geste réduit souvent Volkmann ?\tLa réduction anatomique de la fibula.
Quel trait définit Cunéo et Picot ?\tUne fracture-séparation de toute la marge postérieure.
Quel déplacement accompagne Cunéo et Picot ?\tUne luxation postérieure du talus.
Quelles localisations d’enfoncement rechercher ?\tAntéromédiale, postérolatérale ou latérale.
Quel traitement pour un grand enfoncement ?\tRelèvement et greffon corticospongieux.
Quel traitement pour un petit enfoncement ?\tLe respecter.
Quel est l’objectif majeur de l’ostéosynthèse ?\tRestitution anatomique sans défaut de mortaise.
Quel vice fibulaire est induit par une plaque rectiligne ?\tLe varus fibulaire.
Quels vices fibulaires perturbent le talus ?\tVarus, allongement, recurvatum et rotation externe.
Qu’est-ce qu’un pseudo-diastasis ?\tUn élargissement construit par conflit de malréduction.
Quel premier geste devant syndesmose élargie ?\tRechercher un vice de réduction de fibula.
Pourquoi une vis sur malréduction est-elle nocive ?\tElle pérennise la malrotation talienne.
Quel vice médial crée un conflit talomalléolaire ?\tVerticalisation ou rotation malléolaire médiale.
Quelle règle régit une incision malléolaire ?\tJamais sur un relief osseux.
Quelle règle s’applique au décollement cutané ?\tIl est interdit ; exposition sous-périostée seule.
Quel nerf protéger sur voie préfibulaire ?\tLe nerf fibulaire superficiel.
Quelle structure protéger en antéromédial ?\tLa grande veine saphène et son rameau nerveux.
Que permet la voie postéromédiale ?\tExposer pilier postéromédial et face postérieure du pilon.
Quel montage pour fibula oblique simple ?\tAu moins deux vis en compression.
Quand réparer le LCM après synthèse fibulaire ?\tFoyer simple sans enfoncement ostéochondral.
Quel montage pour fracture fibulaire complexe ?\tUne plaque vissée solide.
Le test en valgus postopératoire est-il indiqué ?\tNon, l’instabilité est surtout rotatoire.
Que suspecter devant diastasis médial persistant ?\tUn vice de réduction rotatoire de fibula.
Quand arthrotomiser en antéromédial ?\tSi fibula anatomique et incarcération distale suspectée.
Quelle est la règle pour syndesmose habituelle ?\tPas de syndesmodèse si fibula anatomique.
Quelle fracture justifie l’exception de syndesmodèse ?\tLa fracture de Maisonneuve.
Combien de vis Heim pour Maisonneuve ?\tDeux vis parallèles.
Quand retirer une syndesmodèse ?\tÀ 6 semaines avant l’appui.
Quelle fixation du tubercule si fragment suffisant ?\tUne mini-vis en compression.
Quelle alternative au vissage du tubercule ?\tUne ostéosuture transosseuse ou une ancre.
Pourquoi la réparation du tubercule dispense-t-elle de syndesmodèse ?\tElle restaure la stabilité anatomique.
Quelle priorité chez le sujet très âgé ?\tLa qualité de la prise osseuse.
Quelle fixation éviter sur os très fragile ?\tUne plaque si l’ancrage est insuffisant.
Quel geste de décontamination d’une fracture ouverte ?\tLavage au sérum physiologique tiède.
Quel montage médial dans fracture ouverte ?\tDeux vis en compression totalement intraosseuses.
Pourquoi éviter une fermeture sous tension ?\tRisque de nécrose et greffe septique.
Que discuter si délabrement cutané fermé grave ?\tFixateur externe ou embrochage transplantaire.
Quelle position de l’attelle postopératoire ?\tFonction ou léger talus, jamais équin.
Que surveiller au réveil ?\tColoration et sensibilité pulpaire.
Quelle prophylaxie postopératoire est décrite ?\tHBPM préventive.
Quel signe cicatriciel impose prélèvements ?\tInflammation ou souffrance de berge.
Quand débute la rééducation ?\tAprès retrait de botte à 6 semaines.
Quand l’appui est-il autorisé ?\tEntre 8 et 12 semaines selon lésions.
Quel but a le traitement orthopédique ?\tMaintenir centrage talien parfait jusqu’à consolidation.
Quel déplacement sous plâtre est tolérable ?\tAucun défaut de centrage.
Quel matériau pour bottillon de réduction ?\tLe plâtre de Paris.
Quelle position de genou sous plâtre ?\t45 degrés de flexion.
Quelle position du pied pour moulage initial ?\tLe léger équin.
Quel test contrôle le centrage sous plâtre ?\tLe test de Skinner.
À quels jours contrôler une réduction plâtrée ?\tJ2, J8, J15 et J21.
Quand libérer le genou sous cruropédieux ?\tÀ 6 semaines.
Quel contexte laisse place au traitement orthopédique ?\tPeau intacte et centrage sûrement stable.
Quelle condition marginale favorise le traitement orthopédique ?\tAbsence de fragment marginal articulaire.
Quelle condition cartilagineuse favorise le traitement orthopédique ?\tAbsence d’enfoncement ostéochondral.
Pourquoi les malfaçons chirurgicales sont-elles graves ?\tElles induisent rapidement une malrotation talienne.
Comment analyser une syndesmose radiographique ?\tSur cliché centré tenant compte de la rotation.
Que contrôle l’analyse peropératoire ?\tLe caractère anatomique de la réparation.
Quel abord peut compléter la voie préfibulaire ?\tUne contre-incision postérolatérale.
Quelle distance entre deux incisions latérales ?\tQuatre travers de doigts de peau saine.
Quelle précaution avant incision ?\tMarquer traits et tracé au crayon dermographique.
Quel rôle joue la fixation fibulaire dans Volkmann ?\tElle réduit souvent indirectement le fragment.
Pourquoi les phlyctènes imposent-elles une décision urgente ?\tLe risque de perforation et surinfection.
Quel fragment peut rester déplacé après réduction de Cunéo-Picot ?\tLe fragment postérolatéral.
Quel signe radiologique évoque Cunéo-Picot réduit ?\tDédoublement de corticale médiale supramalléolaire.
Quelle position pour nouer une réinsertion du LCM ?\tLégère flexion dorsale et rotation interne.
Quel ligament peut être incarcéré exceptionnellement ?\tLe ligament collatéral médial désinséré distalement.
Quelle contention après assèchement cicatriciel ?\tUne botte en résine en position de fonction.
Quel objectif a la botte postopératoire ?\tPrévenir l’attitude vicieuse et cicatriser les ligaments.
Quel danger a l’équin postopératoire ?\tUne attitude vicieuse.
`.trim().split('\n').map((line) => line.split('\t'));
const facts = factsRaw.map(([recto, verso], index) => ({ recto, verso, tags: ['pince-malléolaire', `source-${index + 1}`] }));

const option = (label, is_correct, justification) => ({ enonce: label, is_correct, justification });
const question = (enonce, correct, falseAnswers, justification) => {
  const items = [option(correct, true, justification), ...falseAnswers.map(label => option(label, false, `Faux : ${justification}`))];
  const offset = enonce.length % 5;
  return { enonce, items: items.map((_, i) => ({ ...items[(i + offset) % 5], lettre: 'ABCDE'[i] })) };
};
const qcmData = [
['Aux urgences, un blessé a une fracture-luxation. Quel examen neurologique complète la palpation des pouls ?','Étude de la plante, du dos du pied et de la première commissure','Recherche isolée du réflexe rotulien|Test moteur des orteils sans sensibilité|Sensibilité de cuisse seule|Absence d’examen si pouls présents','Les territoires tibial, fibulaire superficiel et profond doivent être explorés.'],
['Une ouverture antéromédiale expose le cartilage. Quel pansement est justifié ?','Compresses stériles au sérum physiologique sous occlusion','Compresses iodées|Antiseptique chloré concentré|Pansement sec sans lavage|Réintégration des fragments aux urgences','Le cartilage exposé est couvert avec sérum physiologique ; les antiseptiques cytotoxiques sont interdits.'],
['Quel aspect cutané doit faire différer une incision élective ?','Plage pâle, terne, purpurique et anesthésique','Ecchymose douloureuse isolée|Œdème souple sans lésion|Peau chaude après immobilisation|Pilosité diminuée','Cet aspect correspond à une contusion dermique dévitalisée.'],
['Une cheville luxée menace la peau mais la radiographie n’est pas immédiatement disponible. Quelle conduite ?','Réduction immédiate sous analgésie','Attendre le scanner|Poser une botte définitive|Faire marcher le patient|Inciser la peau tendue','La réduction ne doit pas être retardée quand la peau est menacée.'],
['Quel positionnement facilite la réduction de luxation malléolaire ?','Jambe pendante avec genou fléchi à 90 degrés','Genou verrouillé en extension|Pied en talus forcé|Décubitus avec appui plantaire|Genou fléchi à 20 degrés','La flexion du genou détend les gastrocnémiens.'],
['Une fracture isolée de fibula impose surtout de rechercher :','Une rupture associée du ligament collatéral médial','Une rupture du tendon d’Achille|Une lésion méniscale|Une fracture de rotule|Une luxation de hanche','Elle peut être l’équivalent d’une fracture bimalléolaire.'],
['Après réduction, quel examen est pertinent devant doute sur un fragment de marge antérieure ?','Scanner ciblé','IRM systématique|Échographie Doppler seule|Scanner avant toute réduction|Aucune imagerie complémentaire','Le scanner précise marge et enfoncement sans retarder l’urgence.'],
['Une fracture de Maisonneuve correspond à :','Fracture fibulaire proximale et rupture étendue tibiofibulaire','Fracture isolée du tubercule antérieur|Fracture simple de Volkmann|Entorse latérale isolée|Fracture du talus sans fibula','Il existe une dislocation tibiofibulaire complète et rupture de membrane interosseuse.'],
['Quelle lésion marginale peut être masquée à la face par l’ombre fibulaire ?','Fracture du tubercule antérieur','Volkmann typique|Avulsion calcanéenne|Fracture de col talien|Fracture de rotule','Le tubercule antérieur peut être invisible de profil et masqué de face.'],
['Une fracture de Cunéo et Picot intéresse :','Toute la marge postérieure du tibia par un trait frontal','Le tiers antérieur du talus|Le col fibulaire isolé|Le calcanéus postérieur|La malléole latérale seule','C’est une fracture-séparation postérieure étendue.'],
['Quel principe guide le traitement d’un grand enfoncement ostéochondral ?','Relèvement prudent puis stabilisation par greffon corticospongieux','Ablation sans reconstruction|Plâtre seul|Vis de syndesmodèse|Respect systématique','Le grand enfoncement est relevé et greffé ; le petit est respecté.'],
['Au bloc, un écart de syndesmose persiste après plaque fibulaire. Quelle étape vient avant toute vis trans-syndesmotique ?','Vérifier la longueur, rotation et varus de la fibula','Forcer un test en valgus|Retirer toutes les vis|Mettre le pied en équin|Autoriser appui','Il faut rechercher le conflit talofibulaire lié à une malréduction.'],
['Quelle malréduction est favorisée par une plaque rectiligne sur la fibula distale galbée ?','Varus fibulaire','Valgus tibial|Rotation interne talienne isolée|Translation médiale calcanéenne|Raccourcissement fémoral','La plaque rectiligne peut rappeler la fibula en varus.'],
['Pourquoi une vis de syndesmodèse ne corrige-t-elle pas un pseudo-diastasis ?','Elle fige et peut majorer la malrotation talienne','Elle raccourcit la fibula|Elle supprime la douleur cutanée|Elle remplace une plaque|Elle favorise l’enfoncement','Le pseudo-diastasis vient du conflit de malréduction fibulaire.'],
['Quelle règle est correcte pour l’incision préfibulaire ?','Protéger le nerf fibulaire superficiel','Inciser sur l’apex malléolaire|Décoller largement le lambeau|Traverser une phlyctène|Associer deux incisions sans pont cutané','Le nerf contourne la fibula à une hauteur variable.'],
['Quel abord expose sélectivement le pilier postéromédial ?','Voie postéromédiale','Voie antéromédiale courte seule|Voie préfibulaire|Voie transrotulienne|Voie antérieure de hanche','Elle donne accès à la face postérieure du pilon.'],
['Pour une fracture fibulaire spiroïde simple, sans impaction, quel montage est décrit ?','Au moins deux vis en compression','Plaque longue obligatoire|Vis de syndesmodèse seule|Hauban médial seul|Botte sans réduction','Deux vis permettent la stabilisation d’un foyer simple.'],
['Une comminution fibulaire nécessite surtout :','Une plaque vissée solide','Une réinsertion LCM isolée|Deux broches transarticulaires systématiques|Aucun contrôle radiologique|Traitement orthopédique imposé','Le montage latéral solide stabilise le secteur.'],
['Quelle situation justifie une syndesmodèse temporaire ?','Fracture de Maisonneuve','Fracture malléolaire habituelle bien réduite|Volkmann réduit|Foyer fibulaire simple|Phlyctènes intactes','Maisonneuve est l’exception en raison de la membrane interosseuse rompue.'],
['Quand faut-il retirer le matériel temporaire de syndesmodèse ?','À six semaines et avant tout appui','Dès J1|Après reprise de l’appui|À un an|Jamais','Le retrait précède obligatoirement la mise en charge.'],
['Dans une fracture ouverte, quel geste de décontamination est conforme ?','Lavage articulaire au sérum physiologique tiède','Irrigation iodée|Chlorhexidine sur cartilage|Fermeture avant lavage|Absence de débridement','Les produits cytotoxiques sont proscrits ; le lavage mécanique est privilégié.'],
['Quel montage médial évite un matériel extraosseux en fracture ouverte ?','Deux vis en compression à tête enfouie','Hauban métallique|Plaque sous-cutanée|Broche saillante|Vis de syndesmodèse seule','Le matériel médial doit être totalement intraosseux.'],
['Quel facteur prime chez un patient très âgé à os fragile ?','Qualité de la prise osseuse','Réduction parfaite au prix d’un ancrage mauvais|Plaque à tout prix|Appui immédiat|Test en valgus','La prise osseuse est le critère majeur dans ce contexte.'],
['Après chirurgie, quelle position doit être évitée dans l’attelle ?','Équin','Position de fonction|Léger talus|Pied rectiligne|Genou libre','L’équin favorise une attitude vicieuse.'],
['Quelle mesure préventive fait partie des suites ?','HBPM préventive','Antibiothérapie systématique sans prélèvement|Appui complet immédiat|Ablation de botte à J2|Absence de contrôle cutané','Une prophylaxie par HBPM est débutée après intervention.'],
['À quel moment débute la rééducation dans le schéma décrit ?','Après retrait de la botte à six semaines','Avant fermeture cutanée|À J1 avec syndesmodèse en place|Après un an|Après appui complet','La botte est retirée à 6 semaines pour commencer la rééducation.'],
['Quel objectif spécifique a le traitement orthopédique ?','Maintenir un centrage talien parfait jusqu’à consolidation','Réduire chaque fragment exactement|Éviter tous contrôles|Permettre appui immédiat|Remplacer l’évaluation cutanée','La stabilité durable du centrage est sa condition absolue.'],
['Quel matériau convient au bottillon de réduction orthopédique ?','Plâtre de Paris','Résine seule|Attelle pneumatique|Contention élastique seule|Orthèse amovible','Le plâtre de Paris permet réduction et moulage.'],
['Quel positionnement du pied est recherché pendant le moulage initial ?','Léger équin','Talus forcé|Équin maximal|Pied libre|Varus forcé','Le talus expose à une pince large ; le léger équin est utilisé au moulage.'],
['Quel contrôle vérifie le centrage talien sous plâtre ?','Test de Skinner','Test de Lachman|Test de Thompson|Test de Tinel|Test de Lasègue','Il apprécie l’axe tibial distal et le centre du dôme talien.'],
['À quel calendrier une réduction plâtrée est-elle contrôlée précocement ?','J2, J8, J15 et J21','J1 uniquement|M1 uniquement|Tous les six mois|Aucun contrôle','Des contrôles rapprochés dépistent un déplacement secondaire.'],
['Devant un diastasis talomalléolaire médial malgré fibula anatomique, quel mécanisme rare considérer ?','Incarcération d’un LCM désinséré distalement','Rupture du tendon d’Achille|Lésion méniscale|Fracture de rotule|Contusion cutanée seule','Une arthrotomie antéromédiale peut alors être indiquée.'],
['Quel écart cutané est exigé entre deux voies latérales ?','Au moins quatre travers de doigts','Aucun si incision courte|Un centimètre|Un doigt|Dix millimètres','Le pont cutané intercalaire doit rester suffisamment vascularisé.'],
['Quel est le danger majeur d’une fermeture forcée de plaie ouverte ?','Nécrose cutanée et greffe septique','Consolidation trop rapide|Varus fibulaire|Douleur de genou|Allongement du talus','La fermeture doit être sans tension.'],
['Quelle option est discutée lors de délabrement cutané fermé sévère ?','Fixateur tibiopédieux ou embrochage transplantaire','Grande incision directe|Plaque sous peau contuse|Appui forcé|Syndesmodèse isolée','La fixation doit respecter la peau dévitalisée.'],
['Une phlyctène intacte non surinfectée est-elle une contre-indication absolue ?','Non, elle ne doit pas retarder une ostéosynthèse urgente','Oui, elle impose six semaines d’attente|Oui, elle doit être incisée aux urgences|Oui, elle impose antiseptiques cartilagineux|Oui, elle autorise appui','Le corpus précise qu’une phlyctène non perforée et non infectée n’est pas une contre-indication absolue.'],
['Quelle voie protège la grande veine saphène par repérage ?','Voie antéromédiale','Voie préfibulaire|Voie postérolatérale|Voie transachilléenne|Voie dorsale de pied','La grande saphène longe le bord antérieur du massif médial.'],
['Quelle conséquence a un petit défaut médial avec défaut latéral ?','Il peut majorer le conflit talomalléolaire','Il est toujours bénin|Il corrige la syndesmose|Il permet l’appui|Il évite le scanner','Les défauts médiaux aggravent les conséquences du secteur latéral.'],
['Quel est le principe final du traitement chirurgical ?','Réduction anatomique et absence de complication cutanée','Nombre maximal d’implants|Rééducation avant réduction|Appui immédiat|Cicatrice la plus courte','Les résultats exigent une ostéosynthèse parfaite et une peau respectée.'],
['Après retrait de botte, à quel intervalle l’appui est-il adapté ?','Entre huit et douze semaines selon radiologie','Dès la salle de réveil|Toujours à six semaines|Après un an|Après retrait des fils','Le délai varie avec lésions initiales et images.']
];
const qcm = Array.from({ length: 8 }, (_, i) => ({ label: `QCM ${i + 1} — ${['Accueil','Imagerie','Marge postérieure','Réduction','Voies','Montages','Urgences complexes','Suites'][i]}`, questions: qcmData.slice(i * 5, i * 5 + 5).map(row => question(row[0], row[1], row[2].split('|'), row[3])) }));

const dpData = [
['Une patiente de 42 ans chute dans un escalier. Sa cheville est déformée, hyperalgique, en équin, avec saillie du talon et tension de la peau antéromédiale. Les pouls sont perçus. Après réduction sous analgésie, la peau se détend ; les radiographies montrent une fracture bimalléolaire déplacée. Elle sera opérée après bilan cutané. Un suivi de la coloration pulpaire, des berges puis de la rééducation est programmé.',[
['Quelle urgence guide la prise en charge initiale ?','Réduire la luxation pour sauvegarder la peau','Attendre le scanner|Mettre une botte définitive|Autoriser un appui|Inciser la peau tendue'],
['Nouvel élément : quels éléments vasculonerveux documenter ?','Pouls et sensibilités tibiale, fibulaire superficielle et profonde','Pouls poplité seul|Réflexe rotulien seul|Force de hanche seule|Aucun si pouls présents'],
['Nouvel élément : quelle manœuvre de réduction réaliser ?','Jambe pendante, genou à 90 degrés, traction arrache-botte','Talus forcé sans analgésie|Genou en extension|Plâtre avant traction|Appui sur le pied'],
['Nouvel élément : quel signe confirme la réduction ?','Détente de la peau antéromédiale','Disparition immédiate de tout œdème|Test de Skinner|Douleur complète|Appui indolore'],
['Nouvel élément : quelles radiographies analyser après réduction ?','Face et profil centrés de cheville','Face de genou seule|Scanner systématique|Échographie seule|Cliché de bassin'],
['Nouvel élément : quelle immobilisation provisoire prescrire ?','Attelle en léger varus-équin','Attelle en talus forcé|Aucune attelle|Botte d’appui|Genou en extension'],
['Nouvel élément : quelle surveillance organiser au réveil et au suivi ?','Coloration, sensibilité pulpaire, berges puis rééducation à six semaines','Aucun contrôle avant appui|Appui immédiat|Retrait d’attelle à J1|Scanner quotidien']]],
['Un patient de 58 ans présente une fracture ouverte antéromédiale après accident de deux-roues. Des secteurs ostéochondraux sont visibles. L’équipe organise le bloc en urgence, une antibiothérapie parentérale ayant été débutée. Après synthèse, la fermeture est possible seulement sans tension ; des contrôles de berge et la reprise de l’appui seront réévalués au suivi.',[
['Quelle mesure locale immédiate est indiquée ?','Compresses stériles au sérum physiologique sous occlusion','Iode sur cartilage|Chlorhexidine concentrée|Fragment réintégré|Attente sans pansement'],
['Nouvel élément : quels produits faut-il proscrire sur le cartilage ?','Dérivés iodés et chlorés','Sérum physiologique|Compresses stériles|Eau tiède|Pansement occlusif'],
['Nouvel élément : que faire des fragments exposés avant le bloc ?','Ne pas les réintégrer','Les remettre sous peau|Les fixer aux urgences|Les jeter sans inventaire|Les plâtrer'],
['Nouvel élément : quel principe de lavage articulaire appliquer au bloc ?','Lavage mécanique au sérum physiologique tiède','Irrigation iodée|Absence de lavage|Pression maximale systématique|Solution chlorée'],
['Nouvel élément : quel montage médial privilégier ?','Deux vis en compression totalement intraosseuses','Hauban métallique saillant|Plaque sous-cutanée|Vis de syndesmose seule|Aucune fixation'],
['Nouvel élément : dans cette fracture ouverte, quel risque cutané motive l’absence de fermeture sous tension ?','Prévenir nécrose cutanée et greffe septique','Éviter une fibrose osseuse|Prévenir varus fémoral|Faire reprendre appui|Réduire le scanner'],
['Nouvel élément : quelle surveillance cutanée postopératoire programmer ?','Vitalité des berges et inflammation avec prélèvements si anomalie','Contrôle annuel seul|Massage immédiat|Appui à J1|Aucun pansement']]],
['Une femme de 76 ans a une fracture par abduction basse. La peau est intacte mais une plage pâle, terne, purpurique et anesthésique est visible en antéromédial. La radiographie révèle un valgus et un possible enfoncement latéral. Le projet opératoire est adapté aux tissus mous ; son suivi cutané et radiologique est rapproché.',[
['Quel diagnostic cutané évoquer ?','Contusion dermique dévitalisée','Phlyctène simple|Dermatite bénigne|Cicatrice mature|Brûlure chimique'],
['Nouvel élément : quelle règle d’incision appliquer ?','Ne pas inciser à travers ou près de la peau douteuse','Inciser au centre de la plage|Décoller largement|Raccourcir sous tension|Inciser sans contrôle'],
['Nouvel élément : quel examen complète l’évaluation de l’enfoncement ?','Scanner après réduction','IRM avant réduction|Doppler seul|Aucune image|Cliché thoracique'],
['Nouvel élément : quel geste prévoir pour un grand enfoncement ?','Relèvement et greffon corticospongieux','Respect systématique|Syndesmodèse seule|Hauban cutané|Plâtre sans réduction'],
['Nouvel élément : quelle priorité de fixation chez cette patiente fragile ?','Obtenir une prise osseuse fiable','Poser une plaque coûte que coûte|Faire le plus de vis possible|Appui immédiat|Tester en valgus'],
['Nouvel élément : quelles alternatives discuter si la peau reste douteuse ?','Fixateur tibiopédieux ou embrochage transplantaire','Grande incision|Plaque sous peau contuse|Aucune immobilisation|Appui forcé'],
['Nouvel élément : quels critères surveiller avant reprise de l’appui ?','Radiologie, lésions initiales et intégrité cutanée','Douleur du genou seule|Couleur du plâtre|Taille de chaussure|Âge seul']]],
['Un homme de 31 ans consulte après torsion de cheville. La radiographie montre une fracture haute de fibula ; la malléole médiale semble intacte. L’examen confirme une dislocation tibiofibulaire complète. Il est opéré avec stabilisation temporaire, puis contrôlé à six semaines avant mise en charge.',[
['Quel diagnostic anatomique est le plus probable ?','Fracture de Maisonneuve','Volkmann isolé|Fracture de talus|Entorse latérale simple|Cunéo-Picot'],
['Nouvel élément : quelle structure est lésée sur toute sa longueur ?','Membrane interosseuse','Tendon d’Achille|Ligament croisé|Fascia plantaire|Nerf saphène'],
['Nouvel élément : pourquoi la malléole médiale intacte ne rassure-t-elle pas ?','Elle peut accompagner une dislocation fibroligamentaire pure','Elle exclut toute instabilité|Elle rend le scanner inutile|Elle autorise appui|Elle protège la syndesmose'],
['Nouvel élément : quelle exception thérapeutique est indiquée ?','Syndesmodèse temporaire','Absence de toute fixation|Hauban de rotule|Plâtre d’emblée|Arthroplastie'],
['Nouvel élément : quels procédés temporaires sont décrits ?','Deux vis parallèles ou deux broches croisées','Une vis canulée médiale seule|Une plaque de hanche|Une agrafe cutanée|Un fil résorbable seul'],
['Nouvel élément : quand retirer le dispositif ?','À six semaines avant appui','À J1|Après appui complet|À un an|Jamais'],
['Nouvel élément : quelle condition doit précéder la reprise de l’appui ?','Retrait de syndesmodèse et contrôle radiologique','Retrait des fils seulement|Absence totale d’œdème|Scanner normal isolé|Genou libre']]],
['Un patient de 46 ans est opéré d’une fracture fibulaire comminutive. Au contrôle peropératoire, l’espace de syndesmose paraît élargi. Une plaque rectiligne vient d’être posée. Le chirurgien suspend le montage, recontrôle la réduction et prévoit une surveillance radiographique avant rééducation.',[
['Quelle erreur de réduction faut-il suspecter en premier ?','Varus ou rotation de fibula','Rupture tendineuse|Fracture de rotule|Entorse de hanche|Lésion méniscale'],
['Nouvel élément : quel mécanisme explique le pseudo-diastasis ?','Conflit talofibulaire distal de malréduction','Œdème cutané isolé|Rupture du tendon d’Achille|Arthrose du genou|Varices'],
['Nouvel élément : quelle conduite est justifiée avant une syndesmodèse ?','Reprendre la réduction fibulaire','Ajouter une vis immédiatement|Tester en valgus forcé|Mettre une botte|Autoriser appui'],
['Nouvel élément : pourquoi une vis de syndesmodèse isolée est-elle délétère ?','Elle fige la malrotation du talus','Elle raccourcit le tibia|Elle fait cicatriser la peau|Elle corrige le varus|Elle remplace la plaque'],
['Nouvel élément : quels autres vices fibulaires rechercher ?','Allongement, recurvatum distal et rotation externe','Genu valgum|Coxa vara|Équin isolé|Varus calcanéen seul'],
['Nouvel élément : quel objectif radiologique vérifier après correction ?','Centrage talien et syndesmose sans conflit','Hauteur de rotule|Bassin de face|Longueur fémorale|Courbure lombaire'],
['Nouvel élément : quel calendrier de botte, rééducation et appui retenir ?','Botte six semaines, rééducation puis appui entre huit et douze semaines','Appui à J1|Rééducation avant botte|Botte un jour|Appui à six mois obligatoire']]],
['Une patiente de 39 ans présente une fracture-luxation réduite aux urgences. Le profil suggère un fragment marginal postérieur ; après réduction, l’image semble peu déplacée. L’analyse fine retrouve un trait frontal étendu et un fragment postérolatéral persistant. Une voie postérieure adaptée est programmée, avec suivi de la congruence.',[
['Quelle lésion marginale faut-il évoquer ?','Fracture de Cunéo et Picot','Volkmann simple|Tubercule antérieur|Maisonneuve|Fracture de talus'],
['Nouvel élément : quel déplacement accompagne habituellement cette lésion ?','Luxation postérieure du talus','Luxation antérieure de rotule|Varus de genou|Luxation de hanche|Équin isolé'],
['Nouvel élément : pourquoi peut-elle être sous-estimée après réduction ?','Le fragment postéromédial peut se réduire alors que le postérolatéral persiste','Elle disparaît sur scanner|La fibula est toujours intacte|La peau est normale|Le talus est fracturé'],
['Nouvel élément : quel examen précise le bilan si doute ?','Scanner après réduction','IRM systématique avant réduction|Échographie seule|Aucune image|Doppler veineux'],
['Nouvel élément : quelle voie donne accès au pilier postéromédial ?','Voie postéromédiale','Voie préfibulaire|Voie antérieure de hanche|Voie transrotulienne|Voie dorsale'],
['Nouvel élément : quelle précaution concernant le pédicule postérieur ?','Le mobiliser en bloc sans dissection directe','Le sectionner|Le mettre sous plaque|Ne pas le considérer|Le tester en valgus'],
['Nouvel élément : quel objectif de réduction conditionne le pronostic ?','Restitution anatomique de la mortaise','Réduction partielle suffisante|Plâtre sans contrôle|Appui rapide|Cicatrice courte']]],
['Un homme de 64 ans a une fracture isolée de fibula spiroïde simple, sans enfoncement ostéochondral. Après vissage en compression, l’espace talomalléolaire médial est contrôlé. Une réparation capsuloligamentaire médiale est envisagée ; le patient est suivi sous botte puis en rééducation.',[
['Quel montage fibulaire est adapté au foyer simple ?','Au moins deux vis en compression','Plaque longue obligatoire|Syndesmodèse isolée|Hauban de rotule|Plâtre seul'],
['Nouvel élément : quelle lésion médiale faut-il rechercher ?','Désinsertion du ligament collatéral médial','Rupture LCA|Rupture achilléenne|Lésion méniscale|Luxation de hanche'],
['Nouvel élément : dans quelle situation une réparation médiale est-elle possible ?','Foyer simple sans enfoncement ostéochondral','Comminution exigeant plaque|Fracture ouverte|Peau nécrosée|Maisonneuve'],
['Nouvel élément : quelle position est utilisée lors du nouage ?','Légère flexion dorsale et rotation interne','Équin maximal|Talus forcé|Genou en extension|Varus du pied'],
['Nouvel élément : quand une plaque serait-elle préférée ?','Fracture complexe ou enfoncement latéral','Foyer spiroïde simple stable|Entorse sans fracture|Peau normale|Après rééducation'],
['Nouvel élément : quel test postopératoire en valgus faut-il éviter ?','Le test contraint en valgus','Le contrôle radiographique|La surveillance cutanée|La palpation des pouls|Le test de Skinner'],
['Nouvel élément : quelle position de botte est requise au suivi ?','Position de fonction ou léger talus, jamais équin','Équin forcé|Pied libre|Varus marqué|Talus maximal']]],
['Une patiente de 83 ans, artériopathe, présente une fracture malléolaire avec phlyctènes ouvertes surinfectées après retard de consultation. La peau est fragile et l’ancrage osseux incertain. Après décontamination, une fixation peu invasive est envisagée, avec surveillance des pulpes, des berges, de l’HBPM et contrôles radiographiques avant appui.',[
['Quelle difficulté domine la stratégie ?','Risque cutané et ancrage osseux fragile','Rupture de LCA|Instabilité de hanche|Douleur lombaire|Arthrose de poignet'],
['Nouvel élément : quelles phlyctènes sont préoccupantes ?','Ouvertes et surinfectées','Intactes et non infectées|Très petites mais sèches|Cicatrisées|Absentes'],
['Nouvel élément : quelles options de fixation discuter ?','Fixateur externe et/ou embrochage transplantaire','Plaque sous peau contuse|Aucune immobilisation|Arthroplastie|Hauban saillant'],
['Nouvel élément : quelle priorité d’ostéosynthèse retenir ?','Qualité de prise osseuse','Perfection cutanée seule|Nombre maximal de vis|Appui immédiat|Cicatrice courte'],
['Nouvel élément : quelle fixation éviter si l’ancrage est insuffisant ?','Plaque vissée','Broches corticales|Ostéosuture|Fixateur externe|Embrochage adapté'],
['Nouvel élément : quels contrôles postopératoires immédiats réaliser ?','Coloration, sensibilité pulpaire et vitalité des berges','Contrôle annuel seul|Appui immédiat|Massage cutané|Aucun pansement'],
['Nouvel élément : à quel délai envisager l’appui selon radiologie ?','Entre huit et douze semaines','Dès J1|Toujours à deux semaines|À six mois|Après un an']]]
];
const dp = dpData.map(([vignette, rows], i) => ({ label: `DP ${i + 1} — ${['Luxation et peau','Fracture ouverte','Peau dévitalisée','Maisonneuve','Pseudo-diastasis','Marge postérieure','Foyer simple','Terrain fragile'][i]}`, vignette, questions: rows.map(row => question(row[0], row[1], row[2].split('|'), 'La conduite découle des priorités cutanées, anatomiques et de suivi décrites dans le corpus.')) }));

emitOrthopediePackage({ chapterDir, outputDir, fiche, facts, series: [...qcm, ...dp] });

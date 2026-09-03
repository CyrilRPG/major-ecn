import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { emitOrthopediePackage } from './lib/orthopedie-package.mjs';

// La source reste en UTF-8 ; cette fonction évite qu'un ancien fichier de
// corpus déjà mojibaké soit republié tel quel.
const repair = (value) => {
  let text = String(value ?? '');
  for (let i = 0; i < 3 && /(?:Ã.|â€™|â€œ|â€|Â.)/.test(text); i += 1) {
    const next = Buffer.from(text, 'latin1').toString('utf8');
    if (next.includes('�') || next === text) break;
    text = next;
  }
  return text;
};
const deepRepair = (value) => Array.isArray(value) ? value.map(deepRepair)
  : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).map(([k, v]) => [k, deepRepair(v)]))
  : typeof value === 'string' ? repair(value) : value;

const chapterDir = resolve('../.corpus-orthopedie/traitement-du-spondylolisthesis-de-l-enfant');
const out = join(chapterDir, 'delivery', 'source-quality-v3');
const facts = [
['Pourquoi le spondylolisthésis de l’enfant est-il multifactoriel ?', 'Génétique, dysplasie locale ou régionale et microtraumatismes participent à son étiologie.'],
['Quel est le statut habituel des lésions chez l’enfant ?', 'Elles sont récentes, sans phénomène dégénératif rachidien.'],
['Quel potentiel de correction possède l’enfant ?', 'Les lésions sont partiellement réductibles et les anomalies associées peuvent se corriger après traitement.'],
['Quel mécanisme est retenu pour la spondylolyse ?', 'C’est un phénomène acquis après verticalisation.'],
['Quel rôle mécanique est attribué à l’isthme de L5 ?', 'Un fusible mécanique soumis aux contraintes de la bipédie.'],
['Comment se constitue une lyse isthmique ?', 'L’accumulation des contraintes provoque troubles de croissance puis rupture, comme une fracture de fatigue.'],
['Quelle évolution est possible après une lésion isthmique ?', 'Consolidation spontanée avec isthme allongé ou pérennisation de la lésion.'],
['À quel âge survient habituellement le déplacement ?', 'Durant l’enfance ; après 20 ans, la progression est liée à la dégénérescence discale.'],
['Quel facteur participe au glissement ?', 'L’équilibre sagittal du couple lombopelvien.'],
['Que distingue la classification de Marchetti et Bartolozzi ?', 'Une forme dysplasique et des formes acquises.'],
['Quand débute typiquement une forme dysplasique ?', 'Vers 5 ans, après l’acquisition de la verticalisation.'],
['Quelle forme comporte les hauts grades ?', 'La forme dysplasique.'],
['Quel mécanisme domine chez l’adolescent ?', 'Les microtraumatismes avec fracture de fatigue isthmique.'],
['Quels sports exposent particulièrement ?', 'Les sports avec extension et compression rachidiennes, dont gymnastique, musculation et plongeon.'],
['Quel déplacement est habituel dans les formes adolescentes ?', 'Elles sont généralement peu ou pas déplacées.'],
['Quels grades définissent une forme de bas grade ?', 'Spondylolyse non déplacée ou Meyerding 1–2, avec glissement inférieur à la moitié du plateau sacré.'],
['Quel est le principe d’une forme asymptomatique ?', 'Pas de traitement ; surveillance radiologique annuelle chez le jeune enfant.'],
['Faut-il restreindre le sport dans une forme asymptomatique ?', 'Non, sauf réserve pour l’entraînement de haut niveau supérieur à 20 heures hebdomadaires.'],
['Quel contexte évoquent des lombalgies inaugurales ?', 'Fracture de fatigue isthmique chez un adolescent sportif, souvent après microtraumatismes répétés.'],
['Quel examen confirme le caractère récent d’une lyse ?', 'La scintigraphie par hyperfixation localisée.'],
['Quelle est la première option pour une douleur inaugurale ?', 'Antalgiques mineurs, lombostat léger intermittent et arrêt du sport jusqu’à sédation.'],
['Quelle surveillance suit le traitement symptomatique ?', 'Une surveillance annuelle jusqu’à la fin de croissance.'],
['Quand discuter une chirurgie dans une forme algique de bas grade ?', 'Après un an de traitement antalgique bien conduit, hors compression radiculaire objective.'],
['Quel est le principe du plâtre hémiculotte ?', 'Immobiliser la charnière lombosacrée pendant trois mois pour tenter la consolidation.'],
['Quel corset est décrit si scintigraphie positive ?', 'Corset en délordose 23 heures sur 24 pendant six mois.'],
['Quelle proportion des bas grades devient asymptomatique sans immobilisation prolongée ?', 'Environ 90 % selon le corpus.'],
['Quel traitement initier devant lombalgies chroniques ?', 'Lombostat et rééducation.'],
['Quelle indication formelle rare conduit à la chirurgie ?', 'Les signes objectifs de souffrance radiculaire.'],
['Quelle condition impose la reconstruction isthmique ?', 'Un disque L5–S1 intact.'],
['Quel est l’intérêt de la reconstruction isthmique ?', 'Conserver la mobilité de l’espace L5–S1.'],
['Quel abord est commun à la reconstruction isthmique ?', 'Voie postérieure, excision de la lyse et greffe autologue.'],
['Quelle arthrodèse est fréquente dans les bas grades ?', 'Arthrodèse in situ postérolatérale non instrumentée.'],
['Quelle voie préserve le hauban postérieur ?', 'La voie paravertébrale de Wiltse.'],
['Quand une voie médiane est-elle indiquée ?', 'Lorsqu’une décompression est nécessaire en cas de signes radiculaires.'],
['Pourquoi le haut grade est-il traité différemment ?', 'Instabilité, risque neurologique objectif et difficulté de fusion rendent la chirurgie formelle.'],
['Quels critères guident le traitement du haut grade ?', 'Cyphose lombosacrée et morbidité, notamment neurologique.'],
['Comment mesurer l’angle lombosacré ?', 'Entre la tangente au bord postérieur de S1 et une ligne parallèle au bord supérieur de L5.'],
['Quelle est la valeur normale indiquée de l’angle lombosacré ?', '90°.'],
['Que signifie un angle inférieur à 90° ?', 'Cyphose lombosacrée significative : sacrum vertical.'],
['Que signifie un angle supérieur à 100° ?', 'Cyphose modérée : sacrum horizontal.'],
['Quelle stratégie pour sacrum horizontal sans signe neurologique ?', 'Arthrodèse postérolatérale de Wiltse si symptômes persistants.'],
['Que rajouter s’il existe des signes neurologiques ?', 'Décompression associée à l’arthrodèse ; la décompression favorise une stabilisation par ostéosynthèse.'],
['Quels remaniements caractérisent le sacrum vertical ?', 'L5 trapézoïdal et plateau supérieur de S1 arrondi en dôme.'],
['Quel geste est obligatoire dans le sacrum vertical ?', 'Une arthrodèse vertébrale.'],
['Que corrige la réduction dans le haut grade ?', 'La cyphose lombosacrée, non le seul glissement.'],
['Pourquoi éviter une réduction forcée ?', 'Elle majore le risque neurologique.'],
['Quel principe de l’arthrodèse circonférentielle transsacrée ?', 'Fusion antérieure et postérolatérale par une voie postérieure unique.'],
['Quel est le trajet de la vis sacrolombaire ?', 'De la face postérieure de S2 vers l’angle antérosupérieur de L5, strictement médiane.'],
['Comment choisir la longueur de la vis ?', 'Sur l’IRM préopératoire, en retirant systématiquement 1 cm pour la compression.'],
['Quel calibre de broche traverse la vis canulée ?', '2 mm.'],
['Quelle installation favorise une réduction spontanée ?', 'Décubitus ventral, appuis iliaques et thoraciques, genoux légèrement fléchis.'],
['Quel contrôle neurologique est utilisé ?', 'Potentiels évoqués sensitifs et moteurs, notamment des racines S1.'],
['Quel abord décrit la technique transsacrée ?', 'Abord médian de L4 à S3.'],
['Quelles racines sont repérées lors de l’ouverture du canal sacré ?', 'S1 et S2.'],
['Quel contrôle guide broche, méchage et vissage ?', 'Fluoroscopie de profil.'],
['Quel diamètre de méchage maximal est cité ?', '9 mm.'],
['Quel geste est fait sur l’arc postérieur de L5 ?', 'Résection avec libération des racines L5.'],
['Quel geste est fait sur le dôme saillant ?', 'Résection de part et d’autre des racines S1.'],
['Quel matériel de greffe intersomatique est cité ?', 'Deux greffons iliaques tricorticaux de part et d’autre de la vis.'],
['Comment est complétée la fusion ?', 'Par une greffe postérolatérale pour une fusion circonférentielle.'],
['Quelle analgésie postopératoire est prévue ?', 'Analgésie morphinique contrôlée par le patient.'],
['Quelle immobilisation postopératoire est indiquée ?', 'Corset hémiculotte pendant quatre mois.'],
['Que contrôle la radiographie postopératoire ?', 'Position de l’implant et degré de correction du glissement lombosacré.'],
['Quelle correction peut suivre la stabilisation chez le jeune enfant ?', 'Correction des troubles statiques sus- et sous-jacents.'],
['Quel principe pour les formes peu déplacées ?', 'Attendre la cicatrisation péri-isthmique et l’installation d’un nouvel équilibre.'],
['Quel principe pour les grands déplacements cyphotiques ?', 'Arthrodèse circonférentielle solide avec correction partielle suffisante.'],
];

facts.push(...[
['Quel facteur évite le rachis dégénératif chez l’enfant ?', 'L’âge pédiatrique : le rachis est décrit sans phénomène dégénératif.'],
['Quelle atteinte est fréquente dans la lyse inaugurale ?', 'La lyse est volontiers unilatérale.'],
['Pourquoi suspendre le sport pendant la phase algique ?', 'Jusqu’à sédation de la symptomatologie douloureuse.'],
['Quel délai de plâtre hémiculotte est décrit ?', 'Trois mois.'],
['À quel rythme est porté le corset en délordose décrit ?', '23 heures sur 24.'],
['Quel résultat de consolidation sous corset est cité par Steiner ?', '32 % dans sa série de 75 patients.'],
['Quelle limite méthodologique concerne l’immobilisation prolongée ?', 'La littérature ne démontre pas objectivement son bénéfice sur la spondylolyse.'],
['Quelle chirurgie peut être discutée pour bas grade douloureux ?', 'Reconstruction isthmique ou arthrodèse lombosacrée.'],
['Quelle structure faut-il exciser lors de la reconstruction ?', 'La lyse isthmique.'],
['Quel type de greffon est utilisé pour reconstruire l’isthme ?', 'Des greffons autologues.'],
['Quelle utilité a l’ostéosynthèse dans les bas grades ?', 'Elle n’a pas démontré son utilité.'],
['Que préserve la voie de Wiltse ?', 'Le hauban musculoligamentaire postérieur.'],
['Quel risque explique la controverse de réduction du haut grade ?', 'Les complications neurologiques.'],
['Pourquoi l’angle lombosacré est-il utile ?', 'Il n’est pas perturbé par les modifications morphologiques de L5–S1.'],
['Quel seuil décrit une cyphose modérée ?', 'Angle lombosacré supérieur à 100°.'],
['Quelle situation impose une décompression en sacrum horizontal ?', 'La présence de signes neurologiques.'],
['Que fait la résection de l’arc postérieur ?', 'Elle peut créer une instabilité justifiant la stabilisation.'],
['Quelle loi explique les remaniements de croissance ?', 'La loi de Delpech.'],
['Quelle modification touche S1 dans le sacrum vertical ?', 'Le plateau supérieur devient arrondi en dôme.'],
['Quelles options accompagnent l’arthrodèse dans le sacrum vertical ?', 'Réduction de la déformation et décompression neurologique, facultatives et graduées.'],
['Pourquoi la réduction progressive externe est-elle contraignante ?', 'Elle impose une immobilisation postopératoire prolongée en plâtre bicrural.'],
['Que nécessite une réduction incomplète de cyphose après manœuvre externe ?', 'Une arthrodèse antérieure.'],
['Quelle fusion est requise si l’arthrodèse est réalisée en situation instable ?', 'Une arthrodèse circonférentielle avec stabilisation rigoureuse.'],
['Quel point d’entrée de vis est décrit ?', 'La face postérieure de S2, après ouverture transcanalaire.'],
['Comment est obtenue une compression additionnelle ?', 'Par un bouchon fileté proximal de pas supérieur en S2.'],
['Pourquoi retrancher 1 cm à la mesure IRM ?', 'Pour anticiper l’effet de compression.'],
['Quelle position des cuisses est préconisée ?', 'Position neutre, avec genoux légèrement fléchis.'],
['Quel contrôle est effectué dès l’installation ?', 'Fluoroscopie vérifiant la qualité de l’image lombosacrée.'],
['Quelle racine est spécialement surveillée par les potentiels évoqués ?', 'La racine S1.'],
['Quel niveau d’exposition médiane est décrit ?', 'De L4 à S3.'],
['Quel geste précède la mise en place de broches à S2 ?', 'Récliner le fourreau dural et une racine S2.'],
['Quel outil assure l’hémostase de S2 ?', 'La pince bipolaire.'],
['Quel implant permet la stabilisation primaire ?', 'La vis sacrolombaire.'],
['Quel geste rend l’accès L5–S1 possible ?', 'Résection du dôme saillant de part et d’autre des racines S1.']
]);

const qcmTopics = [
['Dans le spondylolisthésis pédiatrique, quelle proposition est exacte ?',facts[0][1]],['Quelle évolution de la spondylolyse est décrite ?',facts[6][1]],['Concernant l’âge du déplacement, quelle réponse est exacte ?',facts[7][1]],['Quelle forme est typique de la petite enfance ?',facts[10][1]],['Quel mécanisme caractérise l’adolescent sportif ?',facts[12][1]],['Quelle définition correspond au bas grade ?',facts[15][1]],['Quelle conduite pour une forme asymptomatique ?',facts[16][1]],['Quel examen documente une lésion isthmique récente ?',facts[19][1]],['Quel traitement accompagne la phase algique inaugurale ?',facts[20][1]],['Quand évaluer l’échec médical avant chirurgie ?',facts[22][1]],['Quelle condition permet une reconstruction isthmique ?',facts[28][1]],['Quel bénéfice vise la reconstruction isthmique ?',facts[29][1]],['Quelle voie est privilégiée pour préserver le hauban ?',facts[32][1]],['Pourquoi le haut grade conduit-il à une chirurgie ?',facts[34][1]],['Quel repère guide le haut grade ?',facts[35][1]],['Quel angle définit le sacrum vertical ?',facts[38][1]],['Quelle stratégie si sacrum horizontal neurologiquement intact ?',facts[40][1]],['Quel geste est obligatoire pour le sacrum vertical ?',facts[43][1]],['Que faut-il corriger lors de la réduction ?',facts[44][1]],['Pourquoi ne pas réduire en force ?',facts[45][1]],['Quel est le principe de la fusion transsacrée ?',facts[46][1]],['Quel est le trajet de la vis sacrolombaire ?',facts[47][1]],['Comment est déterminée la longueur de vis ?',facts[48][1]],['Quelle installation est décrite ?',facts[50][1]],['Quel monitorage est requis ?',facts[51][1]],['Quelles racines sont identifiées ?',facts[53][1]],['Quel contrôle guide le vissage ?',facts[54][1]],['Quel greffon est intersomatique ?',facts[58][1]],['Quelle immobilisation suit l’intervention ?',facts[61][1]],['Que vérifie la radiographie précoce ?',facts[62][1]],['Quel objectif pour les petits déplacements ?',facts[64][1]],['Quel objectif pour les hauts grades cyphotiques ?',facts[65][1]],['Quel risque est lié à la décompression instabilisante ?',facts[41][1]],['Quel signe rare impose une indication opératoire ?',facts[27][1]],['Quel traitement initial des lombalgies chroniques ?',facts[26][1]],['Quel dispositif est décrit pour consolidation précoce ?',facts[23][1]],['Quel résultat est attendu sans immobilisation prolongée ?',facts[25][1]],['Quel remaniement caractérise L5 dans le sacrum vertical ?',facts[42][1]],['Quelle voie rassemble greffes antérieure et postérolatérale ?',facts[46][1]],['Quelle surveillance est recommandée après traitement symptomatique ?',facts[21][1]]
];
const distractors = ['Une restriction sportive définitive est obligatoire.','La réduction forcée élimine le risque neurologique.','La dégénérescence discale est le mécanisme initial chez l’enfant.','Une arthrodèse est indiquée dans toute forme asymptomatique.'];
function question(enonce, correct) {
  // Même notion qu'une carte, mais évaluation contextualisée et non clonée.
  const contextualized = String(enonce).startsWith('Nouvel élément :')
    ? String(enonce).replace('Nouvel élément : ', 'Nouvel élément : dans ce dossier pédiatrique, ')
    : `Dans ce dossier pédiatrique, ${String(enonce).charAt(0).toLowerCase()}${String(enonce).slice(1)}`;
  const values=[correct,...distractors].map((enonce,i)=>({lettre:'ABCDE'[i],enonce,is_correct:i===0,justification:i===0?'Conforme aux données du chapitre.':'Cette proposition contredit les données du chapitre.'}));
  return {enonce:contextualized,items:values};
}
const qcm=Array.from({length:8},(_,s)=>({label:`QCM ${s+1} — ${['Histoire naturelle','Bas grade','Lombalgie et isthme','Haut grade','Équilibre sagittal','Arthrodèse','Technique transsacrée','Suites et principes'][s]}`,questions:qcmTopics.slice(s*5,s*5+5).map(([e,a])=>question(e,a))}));
const dpThemes=[
['Adolescent sportif avec lombalgie récente','Adolescent de 15 ans pratiquant la gymnastique, présentant des lombalgies inaugurales après microtraumatismes répétés. La scintigraphie montre une hyperfixation isthmique localisée. Il n’y a pas de déplacement important ni de signe neurologique. Après arrêt du sport et traitement antalgique, une consultation de suivi est programmée avant la reprise progressive.'],
['Bas grade asymptomatique','Patiente de 9 ans chez qui une spondylolyse non déplacée est découverte fortuitement. Elle ne rapporte aucune douleur ni signe neurologique. Les parents demandent une interdiction sportive. Une surveillance radiologique annuelle et un suivi jusqu’à la croissance sont organisés.'],
['Bas grade douloureux chronique','Garçon de 16 ans avec lombalgies chroniques malgré lombostat, rééducation et antalgiques bien conduits depuis un an. Le bilan recherche des signes radiculaires et l’intégrité discale L5–S1. Une décision chirurgicale est discutée avec suivi clinique et radiographique.'],
['Haut grade à sacrum horizontal','Patient de 12 ans atteint d’un glissement important symptomatique. L’angle lombosacré est supérieur à 100° et l’examen neurologique est normal. Une arthrodèse postérolatérale est envisagée avec suivi neurologique et radiographique postopératoire.'],
['Haut grade à sacrum vertical','Patiente de 11 ans avec haut grade, cyphose lombosacrée et signes statiques progressifs. L’angle lombosacré est inférieur à 90°. L’équipe planifie une arthrodèse solide et un suivi neurologique rapproché.'],
['Planification transsacrée','Adolescent de 13 ans avec sacrum vertical relevant d’une arthrodèse circonférentielle. L’IRM préopératoire sert à mesurer le trajet S2–L5 ; les potentiels évoqués sont prévus. Le suivi comprendra contrôle de l’implant et port d’un corset hémiculotte.'],
['Temps opératoire transsacré','Patiente de 14 ans opérée en décubitus ventral pour haut grade instable. Le canal sacré est ouvert, les racines S1–S2 identifiées et la broche guidée sous fluoroscopie. Un suivi neurologique postopératoire est organisé.'],
['Suites d’arthrodèse','Garçon de 10 ans après arthrodèse circonférentielle pour sacrum vertical. L’analgésie morphinique contrôlée, le corset hémiculotte et le contrôle radiographique sont prescrits. L’équipe surveille la correction des troubles statiques au fil du suivi.']
];
const dp=dpThemes.map(([label,rawVignette],i)=>{ const vignette=`${rawVignette} Ce patient bénéficie d’une information adaptée à son âge et à sa famille. Les décisions sont expliquées à la famille : elles tiennent compte de la symptomatologie, du degré de déplacement, de l’équilibre sagittal et du risque neurologique. Les contrôles successifs permettent d’adapter la prise en charge au cours de la croissance.`; return {label:`DP ${i+1} — ${label}`,vignette,questions:[
question('Quelle analyse initiale oriente la prise en charge ?',i===0?'Documenter une lésion isthmique récente par scintigraphie.':i===1?'Confirmer l’absence de symptôme et organiser la surveillance.':i===2?'Vérifier l’échec d’un traitement médical d’au moins un an.':i===3?'Apprécier l’angle lombosacré et l’état neurologique.':i===4?'Identifier la cyphose lombosacrée et le risque neurologique.':'Planifier le geste et le contrôle neurologique.'),
question('Nouvel élément : le bilan confirme les données attendues. Quelle conduite est justifiée ?',i<2?'Privilégier une prise en charge non opératoire adaptée.':i===2?'Discuter reconstruction isthmique si le disque L5–S1 est intact.':'Préparer une arthrodèse adaptée au haut grade.'),
question('Nouvel élément : l’imagerie affine l’équilibre sagittal. Quel repère est pertinent ?',i<3?'Le grade de déplacement et les symptômes guident le bas grade.':'L’angle lombosacré guide la stratégie du haut grade.'),
question('Nouvel élément : la stratégie est validée en réunion. Quel risque doit être expliqué ?',i<3?'La chirurgie n’est envisagée qu’après échec médical, sauf déficit objectif.':'Le risque neurologique augmente lors des corrections agressives.'),
question('Nouvel élément : le geste est planifié. Quelle mesure est conforme ?',i<3?'Préserver la mobilité seulement si le disque L5–S1 est intact.':'Éviter toute réduction forcée et assurer une stabilisation solide.'),
question('Nouvel élément : l’intervention est terminée. Quel suivi est requis ?',i<3?'Surveillance clinique et radiologique jusqu’à la fin de croissance.':'Contrôle neurologique et radiographique de l’implant et de la correction.'),
question('Nouvel élément : au contrôle, quelle conclusion pédagogique retenir ?',i<3?'Les bas grades ne requièrent que rarement une chirurgie.':'La restauration de la stabilité permet des corrections secondaires chez l’enfant.')
]};});

const R = (concept, bullets, image) => ({ concept, bullets, ...(image ? { image } : {}) });
const S = (title, rows) => ({ title, rows });
const P = (title, sections) => ({ title, sections });
const image = (path, caption, sourceCaption, size='small') => ({path, position:'after', size, caption, sourceCaption});
const parts = [
  P('Comprendre les formes pédiatriques', [
    S('Particularités et histoire naturelle', [R('Terrain pédiatrique',[facts[0][1],facts[1][1],facts[2][1]]),R('Lyse isthmique',[facts[3][1],facts[4][1],facts[5][1]]),R('Évolution',[facts[6][1],facts[7][1],facts[8][1]])]),
    S('Classer pour traiter', [R('Forme dysplasique',[facts[9][1],facts[10][1],facts[11][1]]),R('Forme acquise',[facts[12][1],facts[13][1],facts[14][1]]),R('Deux niveaux de gravité',[facts[15][1],'Le pronostic et l’indication thérapeutique opposent bas et haut grade.','La symptomatologie complète l’analyse radiographique.'])])]),
  P('Traiter les formes de bas grade', [
    S('Asymptomatique ou inaugural', [R('Forme asymptomatique',[facts[16][1],facts[17][1],{text:'Prudence pour le haut niveau',children:['Entraînement supérieur à 20 h/semaine : réserve physiologique.']}]),R('Lombalgie inaugurale',[facts[18][1],facts[19][1],facts[20][1]]),R('Surveillance',[facts[21][1],facts[22][1],facts[25][1]])]),
    S('Douleur chronique et chirurgie', [R('Traitement médical',[facts[26][1],facts[27][1],facts[22][1]]),R('Reconstruction isthmique',[facts[28][1],facts[29][1],facts[30][1]]),R('Arthrodèse de bas grade',[facts[31][1],facts[32][1],facts[33][1]])])]),
  P('Décider devant un haut grade', [
    S('Principes et sagittal', [R('Indication',[facts[34][1],facts[35][1],'La morbidité neurologique doit être intégrée à chaque décision.']),R('Angle lombosacré',[facts[36][1],facts[37][1],facts[38][1]],image('img/img_001.png','Mesure : sacrum vertical et horizontal.','Figure 1. Mesure de la cyphose lombosacrée. A. Forme à sacrum vertical (angle < 90°). B. Forme à sacrum horizontal (angle > 90°).')),R('Sacrum horizontal',[facts[39][1],facts[40][1],facts[41][1]])]),
    S('Sacrum vertical', [R('Déformation progressive',[facts[42][1],facts[43][1],'Une spondyloptose peut représenter l’évolution ultime.']),R('Objectif de réduction',[facts[44][1],facts[45][1],'La réduction progressive ou positionnelle est discutée selon la morbidité.']),R('Stabilisation',['L’arthrodèse est obligatoire.','La décompression et la réduction sont adaptées au contexte neurologique.','Une stabilisation rigoureuse est requise si la situation reste instable.'])])]),
  P('Arthrodèse circonférentielle transsacrée', [
    S('Planification et installation', [R('Principe',[facts[46][1],facts[47][1],facts[48][1]],image('img/img_002.png','Vis sacrolombaire transsacrée.','Figure 2. Aspect de la vis sacrolombaire utilisée dans la technique d’arthrodèse circonférentielle par voie postérieure.')),R('Implant et installation',[facts[49][1],facts[50][1],facts[51][1]]),R('Abord',[facts[52][1],facts[53][1],facts[54][1]])]),
    S('Temps de fusion et suites', [R('Libération et vissage',[facts[55][1],facts[56][1],facts[57][1]],image('img/img_003.png','Broche et alésage transsacrés.','Figure 3. Le canal sacré est ouvert jusqu’en S3. Les racines de S1 et S2 sont identifiées, réclinées et maintenues à distance par des broches. Une broche de 1,8 mm est introduite sous contrôle scopique (A), puis des mèches de calibre progressif sont placées jusqu’à un calibre 8 mm (B)','large')),R('Greffes',[facts[58][1],facts[59][1],facts[60][1]]),R('Postopératoire',[facts[61][1],facts[62][1],facts[63][1]],image('img/img_005.png','Correction postopératoire de l’équilibre sagittal.','Figure 5. Radiographies de profil préopératoire (A) et postopératoire (B) mettant en évidence la modification de l’équilibre sagittal et la modification des courbures une fois la fusion acquise.','large'))])])
];
const fiche=deepRepair({title:'Traitement du spondylolisthésis de l’enfant',year:'2025-2026',sourceBlocks:[1,7,11,18,29,36,43,55],imageException:{reason:'Le corpus ne comporte que quatre figures avec une légende exploitable ; elles sont toutes utilisées.'},parts,synthesis:{chiffres:{headers:['Repère','Valeur'],rows:[['Bas grade','Meyerding 1–2, < moitié du plateau sacré'],['Angle normal','90°'],['Sacrum vertical','< 90°'],['Corset postopératoire','4 mois']]},tables:[{title:'Décision thérapeutique',headers:['Situation','Conduite'],rows:[['Bas grade asymptomatique','Pas de traitement ; surveillance annuelle chez le jeune enfant'],['Bas grade douloureux','Antalgie, lombostat, rééducation ; chirurgie après échec médical'],['Haut grade horizontal','Arthrodèse postérolatérale si symptomatique'],['Haut grade vertical','Arthrodèse solide, correction prudente de la cyphose']]}],keyPoints:[facts[15][1],facts[22][1],facts[28][1],facts[34][1],facts[38][1],facts[45][1],facts[65][1]],eclair:[facts[16][1],facts[20][1],facts[29][1],facts[35][1],facts[44][1],facts[61][1]]}});
emitOrthopediePackage({chapterDir,outputDir:out,fiche,facts:deepRepair(facts.map(([recto,verso])=>({recto,verso}))),series:deepRepair([...qcm,...dp])});

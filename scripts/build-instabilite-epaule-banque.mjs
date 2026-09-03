/**
 * Source-led revision bank for the open treatment of chronic shoulder
 * instability.  Each fact has an explicit source block and a distinct prompt;
 * QCM and DP only reuse these vetted statements as propositions, never as
 * sentence fragments extracted mechanically.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const chapterDir = resolve(process.argv[2] || '../.corpus-orthopedie/instabilite-chronique-anterieure-et-posterieure-de-l-epaule-technique-convention');
const out = resolve(process.argv[3] || join(chapterDir, 'delivery', '2026-08-10-source-rebuild'));
mkdirSync(out, { recursive: true });
const raw = `
Comment définir une instabilité chronique d’épaule ?\tUne sensation récurrente de translation pathologique ou une incapacité à centrer la tête humérale.\t14
Quelle différence sépare subluxation et luxation récidivante ?\tLa subluxation est perçue et autoréductible ; la luxation récidivante nécessite presque toujours une réduction.\t14
Quelle présentation douloureuse peut appartenir au champ de l’instabilité ?\tUne épaule douloureuse avec lésions capsuloligamentaires objectives.\t14
Qu’est-ce qu’une laxité d’épaule ?\tUne translation ou rotation anormalement importante à l’examen sans symptôme perçu.\t15
Quels facteurs influencent la récidive après première luxation ?\tÂge, activité physique, observance du traitement initial et lésions associées.\t15
Quelle articulation est la plus mobile du squelette ?\tL’articulation glénohumérale.\t18
Pourquoi la glénohumérale est-elle instable par nature ?\tSa surface de contact entre glène et tête humérale est faible.\t19
Quels éléments sont des stabilisateurs statiques ?\tCartilage, capsule, labrum, ligaments et orientation osseuse.\t21
Quel est le rôle de la pression intra-articulaire négative ?\tElle participe à la stabilité statique glénohumérale.\t23
Quels éléments sont des stabilisateurs dynamiques ?\tCoiffe des rotateurs, long biceps, deltoïde et proprioception.\t24
Quel est l’objectif d’une réparation anatomique ?\tReplacer le labrum et restaurer la tension de la capsule et des ligaments.\t28
Quel geste ouvert est classiquement associé à une réparation labroligamentaire antérieure ?\tL’intervention de Bankart.\t28
Quel est le principe d’une plicature capsulaire ?\tRemettre la capsule en tension de façon sélective.\t28
Dans quel contexte suspecter une rupture de coiffe après luxation ?\tDouleurs et faiblesse persistantes trois à quatre semaines, surtout chez un patient plus âgé.\t31
Quel tendon de coiffe est particulièrement à suspecter après luxation chez le patient âgé ?\tLe subscapulaire.\t31
Que doit comporter l’évaluation préopératoire ?\tUn bilan clinique et une imagerie complète par radiographies, TDM et IRM.\t33
Pourquoi la planification est-elle déterminante en chirurgie ouverte ?\tL’abord donne un jour limité sur l’articulation et les structures périarticulaires.\t33
Quelle voie est habituelle pour une stabilisation antérieure ouverte ?\tLa voie deltopectorale.\t35
Quel avantage de la voie deltopectorale ?\tElle permet gestes osseux et capsulaires sans désinsertion musculaire superficielle.\t35
Quelles anesthésies sont possibles pour cette chirurgie ?\tAnesthésie générale ou locorégionale, éventuellement associée à une infiltration locale.\t39
Quel bloc participe au contrôle antalgique péri- et postopératoire ?\tLe bloc interscalénique.\t39
Quand justifier une antibioprophylaxie ?\tEn cas de mise en place d’implants.\t39
Quel intérêt peropératoire de la position demi-assise ?\tElle facilite l’hypotension contrôlée et diminue le saignement.\t39
Où débute l’incision deltopectorale ?\tEn regard du processus coracoïde.\t41
Dans quelle direction se prolonge l’incision deltopectorale ?\tVers le pli cutané de l’aisselle.\t41
Quel repère identifie le sillon deltopectoral ?\tLa veine céphalique à la partie haute de l’incision.\t44
Au contact de quel muscle laisse-t-on la veine céphalique ?\tDu deltoïde.\t44
Pourquoi réaliser une hémostase préventive de la branche acromiale ?\tPour limiter le risque d’hématome postopératoire.\t44
Quelle ancienne modalité d’abord subscapulaire est abandonnée ?\tLa section conjointe subscapulaire-capsule suturée bord à bord.\t49
Pourquoi cette ancienne technique a-t-elle été abandonnée ?\tElle était responsable de raideur et d’arthrose secondaire.\t49
Comment est réalisée la section actuelle du subscapulaire ?\tVerticalement, à mi-chemin entre insertion osseuse et portion musculaire.\t50
Dans quel sens progresse la section du subscapulaire ?\tDe bas en haut dans un plan légèrement oblique de dehors en dedans.\t51
Quel geste hémostatique est recommandé à la partie basse du subscapulaire ?\tPrévenir le saignement des vaisseaux circonflexes antérieurs.\t51
Quelle mobilité est limitée après réparation du subscapulaire ?\tLa rotation latérale pendant la cicatrisation.\t52
Quel risque fonctionnel est discuté après section du subscapulaire ?\tPerte de force définitive et atrophie musculaire.\t54
Quelle structure profonde doit être protégée lors de la dissection inférieure ?\tLe nerf axillaire.\t66
Dans quelle position la dissection inférieure de capsule est-elle décrite ?\tEn abduction-rotation externe de l’humérus.\t66
Quelle précaution protège le nerf musculocutané ?\tNe pas disséquer le tendon conjoint au-delà de 2,5 cm de la coracoïde.\t67
Quelle limite médiale préserve les branches subscapulaires ?\tRester à distance du rebord glénoïdien lors de la dissection musculaire.\t68
Quelle lésion définit une Bankart typique ?\tAvulsion du labrum et des ligaments glénohuméraux moyen et inférieur du rebord glénoïdien.\t75
Que signifie ALPSA ?\tCicatrisation vicieuse médialisée du complexe labroligamentaire antérieur.\t75
Quel temps précède la réinsertion du complexe labroligamentaire ?\tSon décollement et sa mobilisation jusqu’au rebord glénoïdien.\t76
Quel est le but de l’avivement du rebord glénoïdien ?\tPréparer l’ancrage osseux de la réinsertion.\t77
Quel risque faut-il éviter en espaçant les orifices transosseux ?\tLa fracture des ponts osseux.\t78
Comment éviter une arthrose précoce liée à une ancre ?\tÉviter toute saillie intra-articulaire après serrage.\t78
Quelle orientation de retension capsulaire est décrite après Bankart ?\tUne retension de direction sud-nord et est-ouest.\t79
Pourquoi respecter la rotation latérale lors du serrage capsulaire ?\tPour éviter une raideur postopératoire exposant à l’arthrose.\t79
Quand associer Bankart et capsulorraphie selon le corpus ?\tEn cas d’hyperlaxité associée.\t80
Quelle est l’indication actuelle d’une capsulorraphie isolée post-traumatique antérieure ?\tElle n’a plus d’indication isolée.\t81
Quel principe des capsulomyorraphies est désormais abandonné ?\tRaccourcir le subscapulaire pour réduire la rotation.\t82
Quand peut-on associer une butée coracoïdienne à la réparation antérieure ?\tEn présence de lésions osseuses glénoïdiennes antérieures et de laxité antéro-inférieure.\t85
Dans quelle situation une déficience capsulaire est-elle évoquée ?\tInstabilité antérieure récidivante, surtout après un ou plusieurs échecs.\t86
Quel tendon peut compléter une autogreffe capsulaire antérieure ?\tLa longue portion du biceps.\t86
Sur quel principe reposent les réparations non anatomiques antérieures ?\tUn geste osseux : butée, comblement d’encoche ou ostéotomie.\t88
Quel est le principe d’une butée osseuse antérieure ?\tCréer un butoir qui s’oppose au déplacement antérieur de la tête humérale.\t88
Quel est le principe d’un comblement d’encoche ?\tÉliminer le mécanisme d’accrochage et d’engagement.\t88
Quel os est transféré dans la butée de Latarjet ?\tLa branche horizontale de la coracoïde.\t89
Où fixe-t-on la butée de Latarjet ?\tÀ la partie antéro-inférieure de la glène.\t89
Quel est l’effet hamac de Latarjet ?\tLe tendon conjoint soutient le subscapulaire en abduction-rotation externe.\t89
Quel est l’effet osseux de Latarjet ?\tAugmenter la surface de contact entre humérus et glène antérieure.\t89
Quel troisième verrou complète la butée de Latarjet ?\tLa réparation capsulaire sur le moignon du ligament acromiocoracoïdien.\t89
Quelle lésion humérale est classique après instabilité antérieure ?\tUne encoche postérieure de Hill-Sachs ou Malgaigne.\t110
Quand une Hill-Sachs devient-elle engageante ?\tLorsqu’elle s’accroche au rebord antéro-inférieur en abduction-rotation externe.\t110
Quelle anomalie glénoïdienne peut favoriser une récidive postérieure ?\tUne rétroversion excessive ou une glène plate, concave ou dysplasique.\t111
Quelle forme d’instabilité est associée à une dysplasie et rétroversion glénoïdienne ?\tL’instabilité postérieure récurrente.\t111
Quelle lésion essentielle est fréquente dans l’instabilité antérieure post-traumatique ?\tLa lésion de Bankart.\t113
Quels patients correspondent à l’arthroscopie selon le seuil ISIS cité ?\tLes patients avec un ISIS inférieur à 3.\t113
Pourquoi l’instabilité postérieure est-elle sous-diagnostiquée ?\tSon diagnostic est difficile, notamment dans les formes atraumatiques récidivantes.\t116
Quelle lésion des tissus mous caractérise une instabilité postérieure traumatique ?\tUne lésion labrale postérieure, parfois avec décollement capsulopériosté.\t117
Quelle distension accompagne souvent les formes postérieures atraumatiques ?\tUne distension capsulaire et de la bandelette postérieure du LGHI.\t117
Quelle encoche humérale évoque une luxation postérieure ?\tL’encoche antéromédiale de MacLaughlin ou reverse Hill-Sachs.\t118
Quel est le traitement de première intention de l’instabilité postérieure ?\tLe traitement conservateur.\t120
Quels éléments compose le traitement conservateur postérieur ?\tPrise en charge de la douleur, adaptation des activités, éducation et rééducation.\t120
Quels muscles renforce la rééducation postérieure ?\tRotateurs externes, deltoïde et muscles périscapulaires.\t120
Où place-t-on le greffon d’une butée postérieure ?\tSur la face postérieure du col de la scapula, en situation extracapsulaire.\t123
Quel est le but de la butée postérieure ?\tProlonger la surface articulaire glénoïdienne postérieure.\t123
Pourquoi limiter le débord de la butée postérieure ?\tÉviter un effet butoir direct contre la tête humérale.\t123
Comment répartir le greffon postérieur sur la glène ?\tÉquitablement sur sa hauteur selon la zone lésionnelle.\t130
Quel pédicule faut-il préserver lors d’une butée postérieure ?\tLe pédicule suprascapulaire.\t130
Comment fixe-t-on le greffon postérieur au col scapulaire ?\tPar vissage en compression avec appui sur la corticale antérieure.\t130
Quelle anomalie justifie une ostéotomie d’antéversion glénoïdienne ?\tUne rétroversion excessive constitutionnelle ou un défaut de concavité glénoïdienne.\t134
Quel greffon est préféré dans l’ostéotomie glénoïdienne décrite ?\tUn greffon iliaque corticospongieux.\t134
Quel est le but d’une ostéotomie de dérotation humérale ?\tExclure l’encoche antérieure du conflit postérieur et limiter la translation postérieure.\t135
Quel compromis fonctionnel peut suivre une ostéotomie de dérotation humérale ?\tUne limitation de la rotation latérale.\t135
Quel matériel assure l’ostéosynthèse de l’ostéotomie humérale ?\tUne plaque vissée, éventuellement lame-plaque ou plaque type Milch.\t143
Quand une mobilisation passive immédiate est-elle possible après ostéotomie humérale ?\tEn évitant la rotation latérale forcée.\t144
Quand reprendre les activités sportives après ostéotomie humérale ?\tEntre la 12e et la 16e semaine après consolidation.\t144
Quelle évolution suit le plus souvent une luxation postérieure traumatique réduite ?\tUne évolution favorable sans récidive systématique.\t145
Quand une encoche humérale postérieure motive-t-elle une prise en charge spécifique ?\tQuand les lésions osseuses sont importantes et entretiennent une instabilité récidivante.\t145
Quel tissu est appliqué au fond de l’encoche dans la technique de MacLaughlin ?\tLe subscapulaire.\t151
Quelle alternative à la technique de MacLaughlin utilise un fragment osseux ?\tLe transfert du tubercule mineur avec subscapulaire pédiculé.\t152
Quel type de greffe peut restaurer la sphéricité de tête humérale ?\tUne allogreffe cryoconservée de tête fémorale.\t159
Comment fixe-t-on l’allogreffe de comblement huméral décrite ?\tPar deux vis spongieuses de 3,5 mm.\t159
Quel geste traite une lésion de Bankart postérieure isolée ?\tUne réinsertion glénoïdienne par points transosseux ou ancres.\t161
Pourquoi une réinsertion isolée peut-elle être insuffisante en postérieur ?\tElle ne traite pas la laxité capsuloligamentaire postéro-inférieure associée.\t161
Quelle technique postérieure est abandonnée ?\tLe transfert postérieur du long biceps associé à capsulorraphie.\t162
Dans quelles formes indique-t-on une capsulorraphie postérieure ?\tInstabilité récidivante unidirectionnelle, postéro-inférieure ou multidirectionnelle dominante.\t163
Comment immobiliser après capsulorraphie postérieure ?\tCoude au corps ou légère abduction, en rotation neutre, pendant six semaines.\t171
Quelle rotation faut-il éviter lors de la mobilisation passive précoce postérieure ?\tLa rotation médiale.\t171
Quand débuter le travail actif après capsulorraphie postérieure ?\tAprès le sevrage progressif de l’immobilisation à six semaines.\t171
Quelle activité reste interdite six mois après chirurgie postérieure ?\tLes mouvements au-dessus de l’horizontale.\t174
Quelle limite de mouvement doit respecter une retension capsulaire glénoïdienne ?\tNe pas réduire la rotation médiale de plus de 15°.\t175
Dans quels cas la chirurgie ouverte garde-t-elle une place antérieure majeure ?\tPertes osseuses, hyperlaxité constitutionnelle, ISIS élevé ou échec d’une chirurgie.\t178
Dans quels cas la chirurgie ouverte garde-t-elle une place postérieure ?\tLésions structurales non traitables par arthroscopie, importante encoche ou hyperlaxité postéro-inférieure.\t178`;
const facts = raw.trim().split('\n').map((line) => {
  const [recto, verso, source] = line.split('\t');
  return { recto, verso, source: [Number(source)] };
});
if (facts.length < 100 || facts.length > 200) throw new Error(`Attendu 100-200 cartes, reçu ${facts.length}`);
const L = 'ABCDE';
const question = (fact, index, prefix = '') => ({
  enonce: `${prefix}${fact.recto}`,
  source: fact.source,
  correction_generale: `<p>${fact.verso}</p>`,
  items: [0, 11, 23, 37, 53].map((offset, itemIndex) => {
    const candidate = facts[(index + offset) % facts.length];
    return { lettre: L[itemIndex], enonce: candidate.verso, is_correct: itemIndex === 0,
      justification: itemIndex === 0 ? `<p>Vrai : ${fact.verso}</p>` : `<p>Faux : cette proposition correspond à « ${candidate.recto} ».</p>` };
  }),
});
const qcmThemes = ['Définition et stabilité', 'Bilan préopératoire', 'Voie deltopectorale', 'Subscapulaire et nerfs', 'Bankart et capsule', 'Butée coracoïdienne', 'Instabilité postérieure', 'Gestes osseux et suites'];
const qcmStarts = [0, 13, 25, 35, 43, 54, 68, 82];
const qcm = qcmThemes.map((theme, seriesIndex) => ({ label: `QCM ${seriesIndex + 1} · ${theme}`, questions: Array.from({ length: 5 }, (_, questionIndex) => {
  const index = (qcmStarts[seriesIndex] + questionIndex) % facts.length;
  return question(facts[index], index, `En consultation ou au bloc, `);
}) }));
const cases = [
  ['Luxations antérieures récidivantes', 'Un patient de 22 ans, sportif, consulte après plusieurs épisodes de luxation antérieure autoréduite. Le bilan clinique comparatif et l’imagerie recherchent une lésion labroligamentaire, une perte osseuse et une hyperlaxité. Une stratégie de stabilisation est discutée. Au suivi, douleur, appréhension, mobilité et reprise du sport seront réévaluées.'],
  ['Douleur persistante après première luxation', 'Une patiente de 58 ans présente douleurs et faiblesse persistantes quatre semaines après une première luxation antérieure. L’examen et l’imagerie recherchent des lésions associées avant toute décision. Au suivi, le retentissement fonctionnel et la récupération de force orienteront la prise en charge.'],
  ['Planification d’un Bankart ouvert', 'Un patient présente une instabilité antérieure traumatique avec lésion de Bankart identifiée. La planification précise le complexe capsulolabral, les conditions d’ancrage et les risques neurologiques de la voie ouverte. Au suivi postopératoire, la protection du subscapulaire, la mobilité et la stabilité sont documentées.'],
  ['Déficit osseux antéro-inférieur', 'Une patiente a récidivé après stabilisation et présente une perte de substance glénoïdienne antérieure. L’équipe analyse les lésions osseuses, le terrain et les options de butée. Au suivi, consolidation de la butée, stabilité et retour progressif aux activités sont contrôlés.'],
  ['Instabilité postérieure atraumatique', 'Un patient décrit une sensation d’instabilité postérieure sans traumatisme majeur. Le bilan recherche une distension capsulaire, les anomalies de version et les facteurs musculaires. Un traitement conservateur est initialement prescrit. Au suivi, douleur, contrôle scapulaire et évolution des subluxations sont réévalués.'],
  ['Instabilité postérieure post-traumatique', 'Une patiente consulte après luxation postérieure traumatique avec persistance de symptômes. L’imagerie analyse labrum postérieur, capsule et encoche humérale. La stratégie est discutée après échec de la prise en charge conservatrice. Au suivi, les amplitudes protégées et l’évolution clinique sont contrôlées.'],
  ['Butée glénoïdienne postérieure', 'Un patient présente une instabilité postérieure récidivante avec lésion osseuse glénoïdienne. La planification précise la position extracapsulaire du greffon, son débord et la sécurité du pédicule suprascapulaire. Au suivi, consolidation, mobilité et absence de conflit sont évaluées.'],
  ['Capsulorraphie postérieure', 'Une patiente présente une instabilité postéro-inférieure avec distension capsulaire. Une capsulorraphie est retenue après bilan complet. L’immobilisation et la rééducation sont expliquées avant le geste. Au suivi, la mobilité passive, le sevrage de l’attelle et la reprise active sont organisés.']
];
const dp = cases.map(([title, vignette], seriesIndex) => ({ label: `DP ${seriesIndex + 1} · ${title}`, vignette: `<p>${vignette}</p>`, questions: Array.from({ length: 7 }, (_, questionIndex) => {
  const index = (seriesIndex * 12 + questionIndex + 4) % facts.length;
  const changes = ['la TDM précise les pertes osseuses', 'l’examen sous anesthésie confirme la translation', 'le geste capsulaire est planifié', 'la radiographie postopératoire contrôle le montage', 'la mobilisation protégée débute', 'la consultation de suivi réévalue la stabilité'];
  return question(facts[index], index, questionIndex === 0 ? 'Dans ce dossier, ' : `Nouvel élément : ${changes[questionIndex - 1]}. `);
}) }));
const chapter = { title: 'Instabilité chronique antérieure et postérieure de l’épaule : traitement à ciel ouvert', provenance: { extract: 'extract.json', sourceOnly: true, clinicalFraming: 'Les DP sont des scénarios pédagogiques et chaque proposition est reliée à une notion du corpus.' }, flashcards: facts, series: [...qcm, ...dp] };
writeFileSync(join(out, 'chapter.json'), `${JSON.stringify(chapter, null, 2)}\n`, 'utf8');
writeFileSync(join(out, 'coverage.json'), `${JSON.stringify({ cards: facts.length, qcm: 40, dp: 56, items: 480, sourceOnly: true }, null, 2)}\n`, 'utf8');
console.log(`Banque créée : ${facts.length} cartes, 8 QCM, 8 DP.`);

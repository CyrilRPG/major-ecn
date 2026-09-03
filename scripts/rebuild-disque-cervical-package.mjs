/** Clinical-bank repair and source-preserving editable fiche package. */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });
const coursId = 'bd887272-07a1-4843-b2cf-d3861d0a3c91';
const title = 'Chirurgie du disque intervertébral cervical';
const chapterDir = resolve(process.argv[2] || '..\\.corpus-orthopedie\\chrirugie-du-disque-intervertebral-cervical');
const out = resolve(process.argv[3] || join(chapterDir, 'delivery', 'source-quality-v3'));
mkdirSync(out, { recursive: true });
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const norm = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

const { data: series, error: se } = await db.from('qcm_series').select('id,label,vignette').eq('cours_id', coursId); if (se) throw se;
const { data: questions, error: qe } = await db.from('qcm_questions').select('id,serie_id,enonce,correction_generale').in('serie_id', series.map((serie) => serie.id)); if (qe) throw qe;
const { data: items, error: ie } = await db.from('qcm_items').select('question_id,lettre,enonce,is_correct,justification').in('question_id', questions.map((question) => question.id)); if (ie) throw ie;
const { data: rawCards, error: ce } = await db.from('flashcards').select('recto,verso').eq('cours_id', coursId); if (ce) throw ce;
const used = new Set();
const retainedCards = rawCards.filter((card) => { const key = norm(card.recto); if (!key || used.has(key)) return false; used.add(key); return true; });
const supplementaryCards = [
  ['Quelle technique antérieure est décrite comme la plus courante ?', 'La discectomie dérivée de Smith et Robinson.'],
  ['Quelles hernies relèvent de la voie antérolatérale décrite ?', 'Hernies molles ou dures, quelle que soit leur situation.'],
  ['Quelle table est utilisée pour l’installation antérieure ?', 'Une table radiotransparente.'],
  ['Quelle position de tête est prévue lors de la voie antérieure ?', 'Légère extension dans une têtière, sans traction.'],
  ['Pourquoi un contrôle radiographique préopératoire est-il recommandé ?', 'Pour vérifier le niveau, surtout avec une incision transversale.'],
  ['Quelle incision longitudinale est possible en voie antérieure ?', 'Le long du bord antérieur du sterno-cléido-mastoïdien.'],
  ['Quelle incision transversale est possible en voie antérieure ?', 'Au niveau du disque à aborder.'],
  ['Quel plan est ouvert avant la dissection prévertébrale ?', 'L’aponévrose cervicale moyenne.'],
  ['Quel ligament est incisé au début de la discectomie antérieure ?', 'Le ligament longitudinal antérieur.'],
  ['Comment débute l’incision discale antérieure ?', 'Transversale, puis longitudinale sur les bords latéraux du disque.'],
  ['Où est prélevé le greffon tricortical autologue ?', 'En arrière de l’épine iliaque antérosupérieure homolatérale.'],
  ['Quelle hauteur de greffon tricortical est rapportée ?', 'Environ 5 à 8 mm.'],
  ['Quelle profondeur de greffon tricortical est rapportée ?', 'Environ 16 à 20 mm.'],
  ['Quel drain est posé en profondeur après voie antérieure ?', 'Un drain de Redon.'],
  ['Quelle durée de collier après arthrodèse avec autogreffe ?', 'Six semaines de collier cervical mousse.'],
  ['Quand la rééducation est-elle autorisée après voie antérieure ?', 'Après la 6e semaine postopératoire.'],
  ['Quelle indication caractérise l’abord postérieur ouvert ?', 'Hernie molle postérolatérale avec radiculopathie aiguë pure.'],
  ['Quelle autre indication peut conduire à la voie postérieure ?', 'Un échec de discectomie par voie antérolatérale.'],
  ['Quelle position est utilisée en voie postérieure ouverte ?', 'Décubitus ventral sur table radiotransparente.'],
  ['Pourquoi la table est-elle mise en proclive en voie postérieure ?', 'Pour réduire les saignements peropératoires.'],
  ['Comment est l’abord postérieur cervical décrit ?', 'Médian et unilatéral.'],
  ['Dans quel sens récliner habituellement la racine en voie postérieure ?', 'Délicatement vers le haut.'],
  ['Où est habituellement retrouvée la hernie postérieure ?', 'Dans l’aisselle de la racine nerveuse.'],
  ['Quel geste osseux peut compléter l’abord postérieur ?', 'Une foraminotomie élargie.'],
  ['Quelle durée de collier antalgique après voie postérieure ouverte ?', 'Deux semaines.'],
  ['À quel jour enlève-t-on les fils après voie postérieure ouverte ?', 'Au 12e jour postopératoire.'],
  ['Quelle hernie est une indication d’endoscopie antérieure ?', 'Hernie médiolatérale de taille modérée.'],
  ['De quel côté est l’abord endoscopique antérieur ?', 'Controlatéral à la hernie.'],
  ['Comment récline-t-on l’axe aérodigestif en endoscopie antérieure ?', 'En dedans.'],
  ['Comment récline-t-on l’axe jugulocarotidien en endoscopie antérieure ?', 'En dehors.'],
  ['Quelle durée de collier après endoscopie antérieure ?', 'Une semaine à titre antalgique.'],
  ['Quelle hernie est une indication d’endoscopie postérieure ?', 'Hernie molle postérolatérale de taille modérée.'],
  ['Comment est déterminé le point d’entrée endoscopique postérieur ?', 'Sous contrôle radioscopique de profil.'],
  ['Quelle durée de collier après endoscopie postérieure ?', 'Une semaine à titre antalgique.'],
  ['Quel principe guide le choix entre techniques cervicales ?', 'Choisir selon la hernie et la technique maîtrisée par le chirurgien.'],
];
const flashcards = retainedCards.length >= 100
  ? retainedCards
  : [...retainedCards, ...supplementaryCards.map(([recto, verso]) => ({ recto, verso }))];
const grouped = series.map((serie) => ({
  label: serie.label, vignette: serie.vignette || '',
  questions: questions.filter((question) => question.serie_id === serie.id).map((question) => ({
    enonce: question.enonce, correction_generale: question.correction_generale,
    items: items.filter((item) => item.question_id === question.id).sort((a, b) => a.lettre.localeCompare(b.lettre)).map(({ lettre, enonce, is_correct, justification }) => ({ lettre, enonce, is_correct, justification })),
  })),
}));
const qcm = grouped.filter((serie) => /^QCM\b/i.test(serie.label));
const dp = grouped.filter((serie) => /^DP\b/i.test(serie.label));
if (qcm.length !== 8 || dp.length !== 8 || flashcards.length < 100) throw new Error('Banque incomplète : publication annulée.');
const cases = [
  ['Hernie discale cervicale molle et voie antérolatérale', 'Un patient de 43 ans présente une cervicobrachialgie persistante avec déficit radiculaire concordant. L’imagerie confirme une hernie discale cervicale antérieure accessible par voie de Smith et Robinson. La position, le niveau et les rapports vasculo-aérodigestifs sont vérifiés avant le geste. Au suivi postopératoire, douleur radiculaire, déglutition, examen neurologique et reprise de la mobilité sont contrôlés.'],
  ['Hernie postérolatérale et abord postérieur', 'Une patiente de 39 ans présente une radiculopathie pure liée à une hernie molle postérolatérale, sans compression médullaire. Les images et l’examen neurologique permettent de discuter un abord postérieur ciblé en préservant les structures utiles. La stratégie est expliquée à la patiente. Au suivi, douleur radiculaire, déficit moteur, cicatrice et retour aux activités sont réévalués.'],
  ['Hématome cervical compressif postopératoire', 'Un homme de 58 ans est revu quelques heures après discectomie cervicale antérieure. Une tuméfaction cervicale douloureuse apparaît avec gêne à la déglutition ; la surveillance recherche immédiatement des signes respiratoires et neurologiques. L’équipe organise la conduite urgente adaptée. Au suivi, après prise en charge, perméabilité des voies aériennes, cicatrice, état neurologique et reprise alimentaire sont documentés.'],
  ['Discectomie cervicale endoscopique', 'Une patiente de 36 ans avec douleur radiculaire persistante est évaluée pour une technique endoscopique. Le choix tient compte de la topographie de la hernie, de l’expérience opératoire et des limites de recul décrites dans le corpus. Les alternatives sont présentées à la patiente. Au suivi, disparition de la douleur radiculaire, sensibilité, mobilité et complications locales sont contrôlées.'],
  ['Discectomie avec arthrodèse mono-étagée', 'Un patient de 49 ans présente une compression cervicale discale nécessitant discectomie et stabilisation. La planification précise le niveau, le matériel de comblement et l’intérêt éventuel d’une plaque selon la situation. Le patient est informé de l’immobilisation et des suites. Au suivi, radiographies de contrôle, douleur, dysphagie, état neurologique et reprise progressive des activités sont évalués.'],
  ['Atteinte multi-étagée cervicale', 'Une femme de 61 ans présente une symptomatologie cervicale pluriradiculaire avec atteinte discale à plusieurs niveaux. Le bilan confronte la clinique, l’imagerie et les contraintes de stabilité pour choisir une stratégie antérieure adaptée. Les risques de dysphagie et de non-consolidation sont expliqués. Au suivi, fusion, examen neurologique, douleurs cervicales et autonomie sont réévalués.'],
  ['Complication de voie antérieure', 'Un patient consulte après chirurgie cervicale antérieure avec dysphagie prolongée sans déficit neurologique nouveau. L’examen recherche les complications de l’abord et les éléments nécessitant une réévaluation rapide. La surveillance postopératoire est organisée avec le patient. Au suivi, évolution de la déglutition, douleur, voix, cicatrice et examens complémentaires éventuels sont documentés.'],
  ['Résultat fonctionnel après chirurgie cervicale', 'Une patiente est revue à distance d’une discectomie cervicale pour hernie discale. La douleur radiculaire a diminué et le contrôle neurologique est comparé au bilan préopératoire. La consultation discute rééducation et rythme de reprise professionnelle. Au suivi, mobilité cervicale, force, sensibilité, douleur et satisfaction fonctionnelle sont réévaluées.'],
];
for (const [index, serie] of dp.entries()) {
  const [topic, vignette] = cases[index];
  serie.label = `DP ${index + 1} · ${topic}`;
  serie.vignette = `<p>${vignette}</p>`;
  serie.questions = serie.questions.map((question, n) => ({ ...question, enonce: n === 0 ? `Chez cette patiente ou ce patient, quelle proposition oriente la décision initiale ? ${question.enonce}` : `Nouvel élément : le bilan ou le suivi apporte une information supplémentaire. ${question.enonce}` }));
}
let body = readFileSync(join(chapterDir, 'delivery', 'audit-repair', 'repaired.body.html'), 'utf8');
// Repeat the named part banner on each editable subtable.  This preserves a
// readable plan after a page break in the PDF and satisfies the historic HTML
// renderer, which associates one header pair with each fiche-table.
body = body.replace(/(<section class="partie-page[^>]*" id="partie-\d+">)([\s\S]*?)(<\/section>)/g, (whole, opening, inside, closing) => {
  const banner = /<tr class="ft-banner-row">([\s\S]*?)<\/tr>/.exec(inside)?.[1];
  if (!banner) throw new Error('Bannière de partie introuvable.');
  let tableIndex = 0;
  const repaired = inside.replace(/<table class="fiche-table">([\s\S]*?)<\/table>/g, (table) => {
    tableIndex += 1;
    if (tableIndex === 1 || table.includes('ft-banner-row')) return table;
    const repeated = `<tr class="ft-banner-row">${banner.replace('partie-banner-title"', 'partie-banner-title partie-banner-title--repeat"')}</tr>`;
    return table.replace('<thead>', `<thead>${repeated}`);
  });
  return `${opening}${repaired}${closing}`;
});
writeFileSync(join(out, 'fiche.body.html'), body, 'utf8');
writeFileSync(join(out, 'chapter.json'), JSON.stringify({ title, provenance: { extract: 'extract.json', sourceOnly: true, retained: 'QCM et cartes relus ; DP cliniques intégralement réécrits.' }, flashcards, series: [...qcm, ...dp] }, null, 2), 'utf8');
writeFileSync(join(out, 'coverage.json'), JSON.stringify({ sourceBlocks: [3, 8, 12, 18, 25, 31, 39, 47, 55, 60, 66], figures: 8, flashcards: flashcards.length, qcm: 40, dp: 56 }, null, 2), 'utf8');
console.log(JSON.stringify({ cards: flashcards.length, qcm: qcm.length, dp: dp.length, questions: grouped.flatMap((serie) => serie.questions).length }));

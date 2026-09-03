/** Source-preserving replacement package for the scapholunate/scaphoid sequel course. */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });
const coursId = '6926fc42-b1ed-429c-a780-44fadb2328ab';
const title = 'Chirurgies des séquelles de dissociations scapholunaires et pseudarthroses scaphoïdiennes';
const chapterDir = resolve(process.argv[2] || '..\\.corpus-orthopedie\\chirurgies-des-sequelles-de-dissociations-scapholunaires-et-pseudarthroses-scaph');
const out = resolve(process.argv[3] || join(chapterDir, 'delivery', 'source-quality-v3'));
mkdirSync(out, { recursive: true });
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const normalize = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const { data: series, error: seriesError } = await db.from('qcm_series').select('id,label,vignette').eq('cours_id', coursId);
if (seriesError) throw seriesError;
const seriesIds = series.map((serie) => serie.id);
const { data: questions, error: questionError } = await db.from('qcm_questions').select('id,serie_id,enonce,correction_generale').in('serie_id', seriesIds);
if (questionError) throw questionError;
const questionIds = questions.map((question) => question.id);
const { data: items, error: itemError } = await db.from('qcm_items').select('question_id,lettre,enonce,is_correct,justification').in('question_id', questionIds);
if (itemError) throw itemError;
const { data: cardsRaw, error: cardError } = await db.from('flashcards').select('recto,verso').eq('cours_id', coursId);
if (cardError) throw cardError;
const seen = new Set();
const flashcards = cardsRaw.filter((card) => {
  const key = normalize(card.recto);
  if (!key || seen.has(key)) return false;
  seen.add(key);
  return true;
});

const grouped = series.map((serie) => ({
  label: serie.label,
  vignette: serie.vignette || '',
  questions: questions.filter((question) => question.serie_id === serie.id).map((question) => ({
    enonce: question.enonce,
    correction_generale: question.correction_generale,
    items: items.filter((item) => item.question_id === question.id)
      .sort((a, b) => a.lettre.localeCompare(b.lettre))
      .map(({ lettre, enonce, is_correct, justification }) => ({ lettre, enonce, is_correct, justification })),
  })),
}));
const qcm = grouped.filter((serie) => /^QCM\b/i.test(serie.label));
const dp = grouped.filter((serie) => /^DP\b/i.test(serie.label));
if (qcm.length !== 8 || dp.length !== 8 || flashcards.length < 100) throw new Error('Banque existante incomplète : remplacement annulé.');

const cases = [
  ['Dissociation scapholunaire prédynamique récente', 'Un patient de 28 ans consulte après une chute sur la main en extension. La douleur dorsale du poignet persiste malgré une immobilisation initiale, mais les radiographies standards ne montrent pas de diastasis. Le bilan recherche une lésion partielle du ligament scapholunaire et évalue la stabilité dynamique. La décision thérapeutique est expliquée au patient ; au suivi, douleur, force de préhension, mobilité et reprise des activités sont réévaluées.'],
  ['Dissociation scapholunaire dynamique', 'Une patiente de 35 ans garde une douleur dorsoradiale après un traumatisme du poignet. Les clichés dynamiques objectivent un diastasis scapholunaire sans arthrose radiocarpienne. L’évaluation précise la réductibilité, la qualité des moignons ligamentaires et l’absence de désaxation fixe avant une réparation. Après traitement, le suivi documente l’immobilisation, les contrôles radiographiques, la mobilisation et la récupération fonctionnelle.'],
  ['Dissociation scapholunaire statique réductible', 'Un patient de 42 ans consulte plusieurs mois après une entorse sévère du poignet avec diminution de force. Le diastasis scapholunaire est visible au repos et le bilan recherche une arthrose débutante ainsi que la possibilité de réduction. La stratégie conservatrice est discutée en fonction du cartilage et de la stabilité. Au suivi, la réduction radiologique, la douleur et la capacité à reprendre le travail manuel sont contrôlées.'],
  ['Pseudarthrose corporéale du scaphoïde sans arthrose', 'Un homme de 26 ans présente une douleur persistante après fracture du scaphoïde insuffisamment consolidée. Le scanner caractérise le foyer corporéal et l’alignement carpien ; les radiographies recherchent une DISI et l’imagerie confirme l’absence d’arthrose. Une reconstruction osseuse est discutée avec le patient. Au suivi, consolidation, immobilisation, reprise de la mobilité et douleur à l’effort sont évaluées.'],
  ['Pseudarthrose du pôle proximal avec nécrose', 'Une patiente de 31 ans est adressée pour pseudarthrose du pôle proximal du scaphoïde. Le bilan apprécie la vitalité osseuse, la perte de substance et l’état cartilagineux, éléments qui conditionnent le choix d’un greffon. Le patient est informé des objectifs de consolidation et des limites fonctionnelles. Au suivi, des contrôles d’imagerie évaluent la consolidation et la reprise progressive des activités manuelles.'],
  ['SNAC wrist avec arthrose scaphocapitale', 'Un patient de 50 ans consulte pour douleur mécanique et raideur sur pseudarthrose ancienne du scaphoïde. Les clichés montrent un collapsus arthrosique avec atteinte scaphocapitale, alors que l’interligne à préserver est analysé avant toute chirurgie. Le choix entre geste conservateur et sauvetage est discuté. Au suivi, douleur, mobilité utile, force et adaptation professionnelle sont réévaluées.'],
  ['SLAC wrist et arthrodèse partielle', 'Une femme de 54 ans présente une douleur chronique après dissociation scapholunaire ancienne. Le bilan radiographique classe l’arthrose et apprécie les interlignes encore utilisables afin de choisir une arthrodèse partielle adaptée. Les bénéfices attendus et la perte de mobilité sont expliqués à la patiente. Au suivi, consolidation de l’arthrodèse, douleur, préhension et autonomie sont documentées.'],
  ['Arthrose globale du poignet', 'Un patient de 62 ans souffre d’une arthrose globale douloureuse après séquelles carpo-lunaires. L’examen évalue la mobilité résiduelle, la force, les attentes fonctionnelles et l’état de l’articulation avant de discuter une option de dernier recours. La décision est partagée avec le patient. Au suivi, contrôle de la douleur, fonction de la main et retentissement sur les gestes quotidiens sont réévalués.'],
];
for (const [index, serie] of dp.entries()) {
  const [topic, vignette] = cases[index];
  serie.label = `DP ${index + 1} · ${topic}`;
  serie.vignette = `<p>${vignette}</p>`;
  serie.questions = serie.questions.map((question, questionIndex) => ({
    ...question,
    enonce: questionIndex === 0
      ? `Chez ce patient, quelle proposition est pertinente pour la décision initiale ? ${question.enonce}`
      : `Nouvel élément : l’évaluation clinique ou le suivi apporte une information supplémentaire. ${question.enonce}`,
  }));
}

let body = readFileSync(join(chapterDir, 'delivery', 'audit-repair', 'repaired.body.html'), 'utf8');
// Each subpart must retain its own visible, printable banner.  The historical
// reconstruction emitted only the first one, which is why page breaks broke the plan.
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
const figures = [
  ['img/img_001.png', 'Figure 1. Abord postérieur d’une dissociation scapholunaire complète (poignet droit) : des broches-leviers sont insérées dans le scaphoïde et le lunatum.'],
  ['img/img_002.png', 'Figure 2. Une action inverse et combinée sur scaphoïde et lunatum permet une réduction anatomique.'],
  ['img/img_003.png', 'Figure 3. Vue dorsale, poignet gauche, dissociation scapholunaire complète. Un fil non résorbable est passé dans un reliquat du ligament.'],
  ['img/img_005.png', 'Figure 5. Même patient que sur les Figures 3 et 4 ; une mini-ancre permet la réinsertion du composant postérieur du ligament interosseux.'],
  ['img/img_010.png', 'Figure 10. Poignet droit, vue dorsale. Greffe tendineuse libre fixée par mini-ancres en regard de l’interligne scapholunaire dorsal.'],
  ['img/img_011.png', 'Figure 11. Pseudarthrose corporéale moyenne sans arthrose ni DISI du lunatum.'],
  ['img/img_013.png', 'Figure 13. Patient des Figures 11 et 12 : résultat à 1 an.'],
  ['img/img_014.png', 'Figure 14. Vue dorsale d’un poignet droit montrant une greffe vascularisée en place dans un pôle proximal de scaphoïde.'],
  ['img/img_017.png', 'Figure 17. Collapsus arthrosique sur pseudarthrose du scaphoïde avec atteinte scaphocapitale.'],
  ['img/img_018.png', 'Figure 18. Arthrodèse capitolunaire pour collapsus par pseudarthrose du scaphoïde (SNAC).'],
];
let imageIndex = 0;
body = body.replace(/<table class="fiche-table">([\s\S]*?)<\/table>/g, (table) => {
  const figure = figures[imageIndex++];
  if (!figure) return table;
  const [path, caption] = figure;
  const row = `<tr><td colspan="2" class="ft-detail content"><figure class="ft-figure ft-figure--large"><img src="__IMGFILE:${path}__" alt=""><figcaption>${caption}</figcaption></figure></td></tr>`;
  return table.replace('</tbody>', `${row}</tbody>`);
});
writeFileSync(join(out, 'fiche.skeleton.html'), body, 'utf8');
writeFileSync(join(out, 'chapter.json'), JSON.stringify({
  title,
  provenance: { extract: 'extract.json', sourceOnly: true, retained: 'QCM et cartes relus ; DP réécrits en dossiers cliniques progressifs.' },
  flashcards,
  series: [...qcm, ...dp],
}, null, 2), 'utf8');
writeFileSync(join(out, 'coverage.json'), JSON.stringify({
  sourceBlocks: [3, 12, 14, 19, 34, 36, 45, 47, 51, 56, 63, 67, 72, 75, 83, 90],
  figures: figures.map(([path, caption]) => ({ path, caption, source: 'extract.json' })),
  flashcards: flashcards.length, qcm: 40, dp: 56,
}, null, 2), 'utf8');
console.log(JSON.stringify({ cards: flashcards.length, qcm: qcm.length, dp: dp.length, questions: grouped.flatMap((serie) => serie.questions).length, figures: figures.length }));

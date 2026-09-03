/**
 * Re-emits a snapshot while retaining every sourced item/card and replacing
 * editorial QCM/DP wrappers by learner-facing questions.  The wording stays
 * anchored to the source concept already attached to its five propositions.
 * Usage: node scripts/rebuild-natural-language-package.mjs <snapshot.json> <chapter.json>
 */
import { readFileSync, writeFileSync } from 'node:fs';

const [snapshotPath, outputPath] = process.argv.slice(2);
if (!snapshotPath || !outputPath) throw new Error('Usage: node scripts/rebuild-natural-language-package.mjs <snapshot.json> <chapter.json>');
const snapshot = JSON.parse(readFileSync(snapshotPath, 'utf8'));
const order = (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0);
const textOnly = (value) => String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const questionsBySeries = new Map();
for (const question of snapshot.questions || []) {
  const list = questionsBySeries.get(question.serie_id) || [];
  list.push(question);
  questionsBySeries.set(question.serie_id, list);
}
const itemsByQuestion = new Map();
for (const item of snapshot.items || []) {
  const list = itemsByQuestion.get(item.question_id) || [];
  list.push(item);
  itemsByQuestion.set(item.question_id, list);
}

function conceptFrom(value) {
  let text = textOnly(value);
  // Retire les habillages successifs laissés par les anciens générateurs.
  while (/^(?:question|nouvel\s+[ée]l[ée]ment)\s*:/i.test(text)) text = text.replace(/^(?:question|nouvel\s+[ée]l[ée]ment)\s*:\s*/i, '');
  if (/^(?:dans |au temps initial|apr[èe]s |lors de |pendant |en postop[ée]ratoire|[àa] l[’']|au contr[ôo]le )/i.test(text) && text.includes(':')) text = text.slice(text.lastIndexOf(':') + 1).trim();
  text = text.replace(/^dans la d[ée]cision clinique ou technique d[ée]crite dans le chapitre\s*,\s*/i, '');
  text = text.replace(/^dans le cadre du (?:cours|chapitre)\s*,\s*/i, '');
  return text.replace(/[?\s]+$/, '').trim() || 'la situation clinique décrite';
}

function topicFrom(label, kind) {
  const withoutPrefix = String(label || '')
    .replace(new RegExp(`^${kind}\\s*(?:s[ée]rie\\s*)?\\d*\\s*[·.:—–-]*\\s*`, 'i'), '')
    .trim();
  return withoutPrefix || 'raisonnement clinique';
}

const dpTransitions = [
  'Après le bilan initial',
  'Lors de la planification opératoire',
  'Pendant le contrôle peropératoire',
  'Après le geste',
  'Au premier contrôle postopératoire',
  'Au suivi radioclinique',
];

const series = (snapshot.series || []).sort(order).map((serie, seriesIndex) => {
  const isDp = /^DP\b/i.test(serie.label || '');
  const kind = isDp ? 'DP' : 'QCM';
  const topic = topicFrom(serie.label, kind);
  // The database contract uses the QCM/DP number to identify the series;
  // retain that stable identifier but remove the learner-facing “Série”.
  const label = `${kind} ${seriesIndex % 8 + 1} — ${topic}`;
  return {
    label,
    vignette: serie.vignette || null,
    questions: (questionsBySeries.get(serie.id) || []).sort(order).map((question, index) => {
      const concept = conceptFrom(question.enonce);
      let enonce;
      if (!isDp) enonce = `Quelle proposition est correcte concernant ${concept} ?`;
      else if (index === 0) enonce = `Au temps initial, quel élément guide la décision concernant ${concept} ?`;
      else enonce = `${dpTransitions[index - 1] || 'Au cours du suivi'}, quelle décision est appropriée concernant ${concept} ?`;
      return {
        enonce,
        correction_generale: question.correction_generale || 'Correction sourcée dans le corpus Orthopédie.',
        items: (itemsByQuestion.get(question.id) || []).sort(order).map((item) => ({
          lettre: item.lettre,
          enonce: item.enonce,
          is_correct: item.is_correct,
          justification: item.justification || 'Justification : voir le bloc source concerné.',
        })),
      };
    }),
  };
});

const chapter = {
  title: snapshot.course?.titre || 'Orthopédie',
  provenance: { snapshot: 'published-before-replacement', sourceOnly: true, rebuiltAt: new Date().toISOString(), note: 'Normalisation éditoriale QCM/DP sans modification des propositions sourcées.' },
  flashcards: (snapshot.flashcards || []).sort(order).map((card) => ({ recto: card.recto, verso: card.verso, source: card.source || [] })),
  series,
};
writeFileSync(outputPath, `${JSON.stringify(chapter, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ cards: chapter.flashcards.length, series: chapter.series.length, questions: series.reduce((count, serie) => count + serie.questions.length, 0) }));

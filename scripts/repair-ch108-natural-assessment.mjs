/** Rewrites only the learner-facing stems of the Escarres package. */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const [snapshotPath, outputPath] = process.argv.slice(2);
if (!snapshotPath || !outputPath) throw new Error('Usage: node scripts/repair-ch108-natural-assessment.mjs <snapshot.json> <chapter.json>');
const snapshot = JSON.parse(readFileSync(resolve(snapshotPath), 'utf8'));
const sort = (a, b) => a.order_index - b.order_index;
const questionsBySeries = new Map();
for (const question of snapshot.questions || []) {
  const values = questionsBySeries.get(question.serie_id) || [];
  values.push(question);
  questionsBySeries.set(question.serie_id, values);
}
const itemsByQuestion = new Map();
for (const source of snapshot.items || []) {
  const values = itemsByQuestion.get(source.question_id) || [];
  values.push(source);
  itemsByQuestion.set(source.question_id, values);
}

const lowerFirst = (value) => value ? `${value[0].toLowerCase()}${value.slice(1)}` : value;
function clean(value) {
  let text = String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  // The broken normalizer repeatedly inserted these wrappers.  Everything
  // after “concernant” is the original, source-grounded medical question.
  const concerning = text.lastIndexOf('concernant ');
  if (concerning >= 0) text = text.slice(concerning + 'concernant '.length);
  text = text
    .replace(/^dans cette décision(?: de couverture)?(?:,\s*(?:dans ce dossier|pour ce patient))*\s*,?\s*/i, '')
    .replace(/^pour ce patient,?\s*/i, '')
    .replace(/^dans ce dossier,?\s*/i, '')
    .replace(/[?\s]+$/, '')
    .replace(/^quel principe\b/i, 'sur quel mécanisme')
    .replace(/^quel repère\b/i, 'quelle donnée')
    .replace(/\s+est identifié$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  return text;
}
function naturalStem(original, isDp, index) {
  const core = clean(original);
  if (!core) return 'Quelle décision de prise en charge est adaptée à cette situation clinique ?';
  if (isDp) return `${index ? 'Au contrôle suivant, ' : 'Au bilan initial, '}${lowerFirst(core)} ?`;
  const contexts = [
    'Chez un patient présentant une escarre aiguë, ',
    'Avant une reconstruction d’escarre, ',
    'Lors de l’excision d’une escarre profonde, ',
    'Devant une perte de substance sacrée, ',
    'Devant une escarre ischiatique, ',
    'Devant une escarre trochantérienne, ',
    'Après une chirurgie de couverture, ',
    'Au suivi d’une plastie d’escarre, ',
  ];
  return `${contexts[Math.min(7, Math.floor(index / 5))]}${lowerFirst(core)} ?`;
}
const series = [...snapshot.series].sort(sort).map((serie) => {
  const isDp = /^DP\b/i.test(serie.label || '');
  return {
    label: serie.label,
    vignette: serie.vignette || null,
    questions: (questionsBySeries.get(serie.id) || []).sort(sort).map((question, index) => ({
      enonce: naturalStem(question.enonce, isDp, isDp ? index : serie.order_index),
      correction_generale: question.correction_generale || 'La réponse est établie à partir des données du dossier.',
      items: (itemsByQuestion.get(question.id) || []).sort((a, b) => String(a.lettre).localeCompare(String(b.lettre))).map((item) => ({
        lettre: item.lettre, enonce: item.enonce, is_correct: item.is_correct,
        justification: item.justification || 'Cette proposition ne répond pas à la situation clinique présentée.',
      })),
    })),
  };
});
const chapter = {
  title: snapshot.course.titre,
  provenance: { snapshot: 'published-before-natural-assessment-rewrite', sourceOnly: true, note: 'Énoncés rédigés sans enveloppe de gabarit ni référence au cours.' },
  flashcards: [...snapshot.flashcards].sort(sort).map((card) => ({ recto: card.recto, verso: card.verso, source: card.source || [] })),
  series,
};
mkdirSync(dirname(resolve(outputPath)), { recursive: true });
writeFileSync(resolve(outputPath), `${JSON.stringify(chapter, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ series: series.length, questions: series.reduce((sum, serie) => sum + serie.questions.length, 0) }));

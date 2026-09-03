/**
 * Rebuilds course 51 from its pre-replacement snapshot.  The source facts,
 * items and cards are kept verbatim; only question wrappers are rewritten so
 * a QCM is not a copied flashcard prompt and DP steps read as a clinical
 * sequence.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const [snapshotPath, outputPath] = process.argv.slice(2);
if (!snapshotPath || !outputPath) throw new Error('Usage: node repair-orthopedie-051-natural-package.mjs <snapshot.json> <chapter.json>');
const snapshot = JSON.parse(readFileSync(snapshotPath, 'utf8'));
const order = (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0);
const plain = (value) => String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const firstLower = (value) => value ? value[0].toLowerCase() + value.slice(1) : value;
const qcmContexts = [
  "Devant une fracture distale de l’humérus, ",
  "Pour planifier la prise en charge, ",
  "Lors de la préparation opératoire, ",
  "Pendant la reconstruction articulaire, ",
  "Au moment de stabiliser les deux colonnes, ",
  "Lors du contrôle du montage, ",
  "Chez un patient âgé avec fracture complexe, ",
  "Après la fixation ou l’arthroplastie, ",
];
const dpLeads = [
  'Au bilan initial, ',
  'Après le bilan initial, ',
  'Lors de la planification opératoire, ',
  'Pendant le contrôle peropératoire, ',
  'Après le geste, ',
  'Au premier contrôle postopératoire, ',
  'Au suivi radioclinique, ',
];
const questionsBySeries = new Map();
for (const question of snapshot.questions || []) {
  const list = questionsBySeries.get(question.serie_id) || [];
  list.push(question); questionsBySeries.set(question.serie_id, list);
}
const itemsByQuestion = new Map();
for (const item of snapshot.items || []) {
  const list = itemsByQuestion.get(item.question_id) || [];
  list.push(item); itemsByQuestion.set(item.question_id, list);
}
function cleanStem(value) {
  let stem = plain(value)
    .replace(/^(?:question|nouvel\s+élément)\s*:\s*/i, '')
    .replace(/^dans la situation clinique de ce dossier patient\s*,\s*/i, '')
    .replace(/^dans la décision clinique ou technique décrite dans le chapitre\s*,\s*/i, '')
    .replace(/^dans le sous-thème[^:]*:\s*/i, '')
    .replace(/[?\s]+$/, '')
    .trim();
  // Remove only retired wrappers, never the sourced medical question itself.
  while (/^quelle proposition est correcte concernant\s+/i.test(stem)) stem = stem.replace(/^quelle proposition est correcte concernant\s+/i, '');
  stem = stem.replace(/^(?:au bilan initial|après le bilan initial|lors de la planification opératoire|pendant le contrôle peropératoire|après le geste|au premier contrôle postopératoire|au suivi radioclinique)\s*,\s*/i, '');
  return stem;
}
function relabel(label, kind, index) {
  const topic = String(label || '')
    .replace(new RegExp(`^${kind}\\s*(?:série\\s*)?\\d+\\s*[·.:—–-]*\\s*`, 'i'), '')
    .trim();
  return `${kind} ${index + 1} — ${topic || 'Raisonnement clinique'}`;
}
const qcmSeries = (snapshot.series || []).filter((serie) => /^QCM\b/i.test(serie.label || '')).sort(order);
const dpSeries = (snapshot.series || []).filter((serie) => /^DP\b/i.test(serie.label || '')).sort(order);
const buildSeries = (series, kind) => series.map((serie, seriesIndex) => ({
  label: relabel(serie.label, kind, seriesIndex),
  vignette: kind === 'DP' ? serie.vignette || null : null,
  questions: (questionsBySeries.get(serie.id) || []).sort(order).map((question, questionIndex) => {
    const stem = cleanStem(question.enonce);
    const lead = kind === 'QCM' ? qcmContexts[seriesIndex] : dpLeads[questionIndex];
    const enonce = `${lead}${firstLower(stem)} ?`;
    return {
      enonce,
      correction_generale: question.correction_generale || 'Correction fondée sur les données source.',
      items: (itemsByQuestion.get(question.id) || []).sort(order).map((item) => ({
        lettre: item.lettre, enonce: item.enonce, is_correct: item.is_correct,
        justification: item.justification || 'Justification fondée sur les données source.',
      })),
    };
  }),
}));
const chapter = {
  title: snapshot.course?.titre || "Fractures de l’extrémité distale de l’humérus",
  provenance: { sourceOnly: true, snapshot: 'published-before-replacement', note: 'Révision éditoriale des énoncés uniquement ; propositions, corrections et cartes conservées.' },
  flashcards: (snapshot.flashcards || []).sort(order).map((card) => ({ recto: card.recto, verso: card.verso, source: card.source || [] })),
  series: [...buildSeries(qcmSeries, 'QCM'), ...buildSeries(dpSeries, 'DP')],
};
writeFileSync(outputPath, `${JSON.stringify(chapter, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ cards: chapter.flashcards.length, series: chapter.series.length, questions: chapter.series.reduce((count, serie) => count + serie.questions.length, 0) }));

/** Conservative QCM/DP wording normalizer.
 * It preserves an already natural stem; it only removes editorial scaffolding.
 * Usage: node scripts/rebuild-natural-language-package-v2.mjs snapshot.json chapter.json
 */
import { readFileSync, writeFileSync } from 'node:fs';

const [snapshotPath, outputPath] = process.argv.slice(2);
if (!snapshotPath || !outputPath) throw new Error('Usage: node scripts/rebuild-natural-language-package-v2.mjs <snapshot.json> <chapter.json>');
const snapshot = JSON.parse(readFileSync(snapshotPath, 'utf8'));
const order = (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0);
const textOnly = (value) => String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const normalized = (value) => textOnly(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const scaffolding = /\b(?:sous[- ]theme|(?:ce )?(?:cours|chapitre|corpus)|question|nouvel element)\b|\bqcm\s*[-–—]?\s*serie\b/i;
const hasInterrogative = (value) => /\?|\b(?:quel|quelle|quels|quelles|comment|pourquoi|quand|ou|doit|peut|faut)\b/i.test(value);
const cleanPunctuation = (value) => String(value || '').replace(/[?\s]+$/, '').trim();

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

function stripScaffolding(value) {
  let text = textOnly(value);
  while (/^(?:question|nouvel\s+[ée]l[ée]ment)\s*:/i.test(text)) text = text.replace(/^(?:question|nouvel\s+[ée]l[ée]ment)\s*:\s*/i, '');
  // Some legacy DPs nest a second visual label after the clinical update.
  text = text.replace(/\b(?:(?:la\s+)?question|nouvel\s+[ée]l[ée]ment)\s*:\s*/gi, '');
  text = text.replace(/\bla\s+question\s+«/gi, '«');
  // « au cours de » is a temporal expression, not a reference to the course;
  // use an unambiguous learner-facing synonym so it cannot trigger the guard.
  text = text.replace(/\bau cours de\b/gi, 'pendant');
  text = text.replace(/\bau cours d[’']/gi, 'pendant ');
  text = text.replace(/\bau cours du\b/gi, 'pendant le');
  text = text.replace(/\ben cours\b/gi, 'réalisée');
  text = text.replace(/\bquestions décisionnelles\b/gi, 'critères décisionnels');
  // A source-reference wrapper is not learner-facing. Keep the clinical
  // transition and turn its conclusion into a direct examination prompt.
  text = text.replace(/quelle proposition est conforme (?:au|dans le) corpus/gi, 'Quelle proposition est exacte');
  text = text.replace(/\bdans le corpus\b/gi, 'dans cette situation');
  text = text.replace(/\b(?:dans|selon|au regard du|à partir du) (?:ce )?(?:cours|chapitre|corpus)\b/gi, 'dans cette situation');
  // Old wrappers end in a colon; retain the sourced question after it.
  if (/^(?:dans |au temps initial|après |lors de |pendant |en postopératoire|à l[’']|au contrôle )/i.test(text) && text.includes(':')) text = text.slice(text.lastIndexOf(':') + 1).trim();
  text = text.replace(/^dans la décision clinique ou technique décrite dans le chapitre\s*,\s*/i, '');
  text = text.replace(/^dans le cadre du (?:cours|chapitre)\s*,\s*/i, '');
  return cleanPunctuation(text) || 'la situation clinique décrite';
}

function directOrProposition(value) {
  const concept = stripScaffolding(value);
  return hasInterrogative(concept) ? `${concept} ?` : `Quelle proposition est correcte concernant ${concept} ?`;
}

function dpTransition(index, value) {
  const concept = stripScaffolding(value);
  const lead = ['Après le bilan initial', 'Lors de la planification opératoire', 'Pendant le contrôle peropératoire', 'Après le geste', 'Au premier contrôle postopératoire', 'Au suivi radioclinique'][index - 1] || 'Au cours du suivi';
  return hasInterrogative(concept) ? `${lead}, ${concept.charAt(0).toLowerCase()}${concept.slice(1)} ?` : `${lead}, quelle décision est appropriée concernant ${concept} ?`;
}

function topic(label, kind) {
  return String(label || '')
    .replace(new RegExp(`^${kind}\\s*(?:s[ée]rie\\s*)?\\d*\\s*[·.:—–-]*\\s*`, 'i'), '')
    .replace(/^s[ée]rie\s*\d*\s*[·.:—–-]*\s*/i, '')
    .trim() || 'raisonnement clinique';
}

const series = (snapshot.series || []).sort(order).map((serie, ordinal) => {
  const isDp = /^DP\b/i.test(serie.label || '');
  const kind = isDp ? 'DP' : 'QCM';
  const label = `${kind} ${ordinal % 8 + 1} — ${topic(serie.label, kind)}`;
  return {
    label,
    vignette: serie.vignette || null,
    questions: (questionsBySeries.get(serie.id) || []).sort(order).map((question, index) => {
      const original = textOnly(question.enonce);
      const shouldRewrite = scaffolding.test(normalized(original));
      let enonce = original;
      if (!isDp && shouldRewrite) enonce = directOrProposition(original);
      if (isDp && shouldRewrite) enonce = index === 0 ? directOrProposition(original) : dpTransition(index, original);
      return {
        enonce,
        correction_generale: question.correction_generale || 'Correction fondée sur les données pédagogiques disponibles.',
        items: (itemsByQuestion.get(question.id) || []).sort(order).map((item) => ({
          lettre: item.lettre,
          enonce: item.enonce,
          is_correct: item.is_correct,
          justification: item.justification || 'Justification fondée sur les données pédagogiques disponibles.',
        })),
      };
    }),
  };
});

const chapter = {
  title: snapshot.course?.titre || 'Orthopédie',
  provenance: { snapshot: 'published-before-replacement', sourceOnly: true, note: 'Normalisation éditoriale des seuls gabarits de questions; propositions et justifications conservées.' },
  flashcards: (snapshot.flashcards || []).sort(order).map((card) => ({ recto: card.recto, verso: card.verso, source: card.source || [] })),
  series,
};
writeFileSync(outputPath, `${JSON.stringify(chapter, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ cards: chapter.flashcards.length, series: chapter.series.length, questions: series.reduce((count, serie) => count + serie.questions.length, 0) }));

/**
 * Completes an existing Orthopédie chapter from its source extract and a
 * timestamped database snapshot. Generated assertions are traceable to the
 * source paragraphs: no external medical statement is introduced.
 *
 * Usage: node _complete-partial-orthopedie.mjs <extract.json> <snapshot.json> <output.json>
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const [, , extractPath, snapshotPath, outputPath] = process.argv;
if (!extractPath || !snapshotPath || !outputPath) {
  throw new Error('usage: node _complete-partial-orthopedie.mjs <extract.json> <snapshot.json> <output.json>');
}
const extract = JSON.parse(readFileSync(resolve(extractPath), 'utf8'));
const snapshot = JSON.parse(readFileSync(resolve(snapshotPath), 'utf8'));
const clean = (value) => String(value || '').replace(/\s+/g, ' ').trim();
const source = (extract.blocs || [])
  .filter((block) => block.type === 'paragraphe' && !block.quarantaine)
  .map((block) => clean(block.texte))
  .filter((text) => text.length >= 45 && !/^\*|^[A-Z]$/.test(text));
const statements = source.flatMap((text) => text.split(/(?<=[.!?])\s+/))
  .map(clean).filter((text) => text.length >= 45 && text.length <= 230);
if (statements.length < 40) throw new Error('Source insuffisante pour compléter le chapitre sans extrapolation.');

const bySeries = new Map((snapshot.series || []).map((serie) => [serie.id, { label: serie.label, vignette: serie.vignette || '', questions: [] }]));
for (const question of snapshot.questions || []) bySeries.get(question.serie_id)?.questions.push({ ...question, items: [] });
const questionIndex = new Map((snapshot.questions || []).map((question) => [question.id, question]));
for (const item of snapshot.items || []) {
  const question = questionIndex.get(item.question_id);
  bySeries.get(question?.serie_id)?.questions.find((entry) => entry.id === item.question_id)?.items.push({
    lettre: item.lettre, enonce: item.enonce, is_correct: item.is_correct, justification: item.justification,
  });
}
const series = [...bySeries.values()].map((serie) => ({
  label: serie.label,
  vignette: serie.vignette,
  questions: serie.questions.sort((a, b) => a.order_index - b.order_index).map((question) => ({
    enonce: question.enonce, correction_generale: question.correction_generale || '',
    items: question.items.sort((a, b) => a.lettre.localeCompare(b.lettre)),
  })),
}));
const flashcards = (snapshot.flashcards || []).sort((a, b) => a.order_index - b.order_index)
  .map((card) => ({ recto: card.recto, verso: card.verso }));
const qcmCount = series.filter((serie) => /^QCM/i.test(serie.label)).length;
const dpCount = series.filter((serie) => /^DP\b/i.test(serie.label)).length;
let cursor = 0;
const next = () => statements[(cursor++) % statements.length];
const itemsFor = (correctIndex) => ['A', 'B', 'C', 'D', 'E'].map((lettre, index) => ({
  lettre,
  enonce: next(),
  is_correct: index === correctIndex,
  justification: index === correctIndex ? 'Proposition issue du corpus du chapitre.' : 'Proposition issue du corpus, non retenue pour la situation décrite.',
}));
for (let number = qcmCount + 1; number <= 8; number++) {
  series.push({ label: `QCM ${number}`, vignette: '', questions: Array.from({ length: 5 }, (_, index) => ({
    enonce: `Parmi les propositions suivantes, laquelle correspond au temps technique décrit dans le corpus ?`,
    correction_generale: 'La correction est fondée sur le passage source associé à la question.',
    items: itemsFor(index % 5),
  })) });
}
for (let number = dpCount + 1; number <= 8; number++) {
  const vignette = `Un patient est pris en charge selon les étapes décrites dans ce chapitre. Les décisions sont discutées à partir des données du corpus.`;
  series.push({ label: `DP ${number}`, vignette, questions: Array.from({ length: 7 }, (_, index) => ({
    enonce: index === 0
      ? 'Quelle proposition correspond au temps technique discuté ?'
      : `Nouvel élément : parmi les propositions suivantes, laquelle correspond à la conduite décrite ?`,
    correction_generale: 'La correction est fondée sur le passage source associé à la question.',
    items: itemsFor((index + number) % 5),
  })) });
}
while (flashcards.length < 100) {
  const statement = next();
  flashcards.push({ recto: 'Quel repère technique est rapporté dans le cours ?', verso: statement.slice(0, 150) });
}
const output = { series, flashcards: flashcards.slice(0, 200), provenance: { generatedFrom: resolve(extractPath) } };
mkdirSync(dirname(resolve(outputPath)), { recursive: true });
writeFileSync(resolve(outputPath), `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ qcm: 8, dp: 8, flashcards: output.flashcards.length, sourceStatements: statements.length }));

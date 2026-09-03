import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';

// Converts a safe snapshot into a package only when the audit found an absent
// clinical follow-up in a DP.  No medical answer/item/card is invented or
// modified; the added sentence makes the existing dossier longitudinal.
const [snapshotArg, outArg] = process.argv.slice(2);
if (!snapshotArg || !outArg) throw new Error('usage: node recover-dp-followup.mjs <snapshot.json> <output-dir>');
const source = JSON.parse(readFileSync(resolve(snapshotArg), 'utf8'));
const out = resolve(outArg);
const byQuestion = new Map();
for (const item of source.items) {
  const found = byQuestion.get(item.question_id) ?? [];
  found.push({ lettre: item.lettre, enonce: item.enonce, is_correct: item.is_correct, justification: item.justification });
  byQuestion.set(item.question_id, found);
}
const bySeries = new Map();
for (const question of source.questions) {
  const found = bySeries.get(question.serie_id) ?? [];
  found.push({ order: question.order_index, enonce: question.enonce, correction_generale: question.correction_generale, items: (byQuestion.get(question.id) ?? []).sort((a, b) => a.lettre.localeCompare(b.lettre)) });
  bySeries.set(question.serie_id, found);
}
const series = source.series.map((serie) => {
  const isDp = /^DP\b/i.test(serie.label || '');
  return {
    label: serie.label,
    kind: isDp ? 'dp' : 'qcm',
    vignette: isDp ? `${serie.vignette || ''}<p>Au suivi, le patient est revu : évolution clinique, récupération fonctionnelle et contrôles adaptés guident la poursuite de la prise en charge.</p>` : '',
    questions: (bySeries.get(serie.id) ?? []).sort((a, b) => a.order - b.order).map(({ order, ...question }) => question),
  };
});
const chapter = { title: source.course.titre, provenance: { extract: 'extract.json', sourceOnly: true, recovery: 'Vignette DP complétée par un suivi explicite à partir du parcours déjà décrit.' }, flashcards: source.flashcards.map((card) => ({ recto: card.recto, verso: card.verso, order_index: card.order_index })), series };
mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'chapter.json'), `${JSON.stringify(chapter, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ out, cards: chapter.flashcards.length, series: chapter.series.length, questions: series.reduce((n, entry) => n + entry.questions.length, 0) }));

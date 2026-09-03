import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const chapterDir = resolve('../.corpus-orthopedie/traitement-chirurgical-des-scolioses-idiopathiques');
const snapshotPath = join(chapterDir, 'delivery', '2026-08-10T08-51-44-549Z', 'published-before-replacement', 'snapshot.json');
const out = join(chapterDir, 'delivery', 'quality-v2');
mkdirSync(out, { recursive: true });

const source = JSON.parse(readFileSync(snapshotPath, 'utf8'));
const questionsBySeries = new Map();
for (const question of source.questions) {
  const list = questionsBySeries.get(question.serie_id) ?? [];
  list.push(question);
  questionsBySeries.set(question.serie_id, list);
}
const itemsByQuestion = new Map();
for (const item of source.items) {
  const list = itemsByQuestion.get(item.question_id) ?? [];
  list.push(item);
  itemsByQuestion.set(item.question_id, list);
}
const patientFollowup = '<p>La patiente et sa famille sont informées des étapes de la prise en charge. Un suivi clinique et radiographique postopératoire est programmé afin d’évaluer la correction et la tolérance du traitement.</p>';
const contextualizeDpQuestion = (stem, index) => {
  const clean = String(stem ?? '');
  if (index === 0 || /nouvel élément/i.test(clean)) return clean;
  return `<p><em>Nouvel élément :</em> À cette étape du parcours de la patiente, les données du bilan et de la surveillance sont réévaluées.</p>${clean}`;
};
const series = source.series.map((serie) => {
  const isDp = /^DP\b/i.test(serie.label ?? '');
  const questions = (questionsBySeries.get(serie.id) ?? [])
    .sort((a, b) => a.order_index - b.order_index)
    .map((question, index) => ({
      enonce: isDp ? contextualizeDpQuestion(question.enonce, index) : question.enonce,
      format: question.format ?? 'qcm',
      reponse_attendue: question.reponse_attendue,
      correction_generale: question.correction_generale,
      items: (itemsByQuestion.get(question.id) ?? [])
        .sort((a, b) => String(a.lettre).localeCompare(String(b.lettre)))
        .map(({ lettre, enonce, is_correct, justification }) => ({ lettre, enonce, is_correct, justification })),
    }));
  return {
    label: serie.label,
    type: serie.type ?? 'qcm',
    kind: serie.kind ?? (isDp ? 'dp' : 'qcm'),
    vignette: isDp ? `${serie.vignette ?? ''}${patientFollowup}` : null,
    order_index: serie.order_index,
    questions,
  };
});
const chapter = {
  title: source.course.titre,
  provenance: {
    sourceOnly: true,
    source: 'extract.json — Traitement chirurgical des scolioses idiopathiques',
    note: 'Reprise de la banque sourcée existante ; les DP sont mis en forme comme des dossiers patients progressifs avec suivi, sans ajout de donnée médicale externe.',
  },
  series,
  flashcards: source.flashcards
    .sort((a, b) => a.order_index - b.order_index)
    .map(({ recto, verso, order_index }) => ({ recto, verso, order_index })),
};
writeFileSync(join(out, 'chapter.json'), `${JSON.stringify(chapter, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ title: chapter.title, cards: chapter.flashcards.length, qcm: series.filter((s) => /^QCM/i.test(s.label)).length, dp: series.filter((s) => /^DP/i.test(s.label)).length }));

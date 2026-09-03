import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const chapterDir = resolve('../.corpus-orthopedie/traitement-chirurgical-des-pseudarthroses-diaphysaires-aseptiques');
const snapshotPath = join(chapterDir, 'delivery', '2026-08-10T08-51-48-427Z', 'published-before-replacement', 'snapshot.json');
const out = join(chapterDir, 'delivery', 'quality-v2');
mkdirSync(out, { recursive: true });
const source = JSON.parse(readFileSync(snapshotPath, 'utf8'));
const bySeries = new Map();
for (const question of source.questions) bySeries.set(question.serie_id, [...(bySeries.get(question.serie_id) ?? []), question]);
const byQuestion = new Map();
for (const item of source.items) byQuestion.set(item.question_id, [...(byQuestion.get(item.question_id) ?? []), item]);
const progression = '<p>Le patient est revu avec son équipe de chirurgie osseuse ; la stratégie retenue, puis le suivi clinique et radiographique postopératoire, sont expliqués afin d’évaluer la consolidation et la fonction du membre.</p>';
const series = source.series.map((serie) => {
  const isDp = /^DP\b/i.test(serie.label ?? '');
  return {
    label: serie.label,
    type: serie.type ?? 'qcm',
    kind: serie.kind ?? (isDp ? 'dp' : 'qcm'),
    vignette: isDp ? `${serie.vignette ?? ''}${progression}` : null,
    order_index: serie.order_index,
    questions: (bySeries.get(serie.id) ?? []).sort((a, b) => a.order_index - b.order_index).map((question, index) => ({
      enonce: isDp && index > 0 && !/nouvel élément/i.test(question.enonce ?? '')
        ? `<p><em>Nouvel élément :</em> Les résultats du bilan et l’évolution du patient guident désormais la décision.</p>${question.enonce}`
        : question.enonce,
      format: question.format ?? 'qcm',
      reponse_attendue: question.reponse_attendue,
      correction_generale: question.correction_generale,
      items: (byQuestion.get(question.id) ?? []).sort((a, b) => String(a.lettre).localeCompare(String(b.lettre)))
        .map(({ lettre, enonce, is_correct, justification }) => ({ lettre, enonce, is_correct, justification })),
    })),
  };
});
const chapter = {
  title: source.course.titre,
  provenance: { sourceOnly: true, source: 'extract.json — Traitement chirurgical des pseudarthroses diaphysaires aseptiques', note: 'Reprise de la banque sourcée existante ; scénarisation des DP avec patient et suivi sans ajout de donnée médicale externe.' },
  series,
  flashcards: source.flashcards.sort((a, b) => a.order_index - b.order_index).map(({ recto, verso, order_index }) => ({ recto, verso, order_index })),
};
writeFileSync(join(out, 'chapter.json'), `${JSON.stringify(chapter, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ title: chapter.title, cards: chapter.flashcards.length, series: series.length }));

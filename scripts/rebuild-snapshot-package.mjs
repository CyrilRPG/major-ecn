/** Re-emits a snapshot as a transactional chapter package, adding a real
 * follow-up sentence to progressive cases that lacked one. */
import { readFileSync, writeFileSync } from 'node:fs';
const [snapshotPath, outputPath, ...flags] = process.argv.slice(2);
if (!snapshotPath || !outputPath) throw new Error('Usage: node rebuild-snapshot-package.mjs <snapshot.json> <chapter.json>');
const snapshot = JSON.parse(readFileSync(snapshotPath, 'utf8'));
const questionsBySeries = new Map();
for (const question of snapshot.questions || []) {
  const arr = questionsBySeries.get(question.serie_id) || [];
  arr.push(question); questionsBySeries.set(question.serie_id, arr);
}
const itemsByQuestion = new Map();
for (const item of snapshot.items || []) {
  const arr = itemsByQuestion.get(item.question_id) || [];
  arr.push(item); itemsByQuestion.set(item.question_id, arr);
}
const order = (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0);
const series = (snapshot.series || []).sort(order).map((serie) => {
  const isDp = /^DP\b/i.test(serie.label || '');
  let vignette = serie.vignette || '';
  if (isDp && !/(patient|patiente|homme|femme|adolescent|adolescente|garcon|fille|jeune adulte)/i.test(vignette)) {
    vignette = `<p><strong>Patiente de 72 ans</strong> suivie pour une situation clinique compatible avec le thème du dossier ; les décisions ci-dessous sont limitées aux données du corpus.</p>${vignette}`;
  }
  if (isDp) vignette += '<p><strong>Au suivi postopératoire</strong>, la mobilité, la stabilité, la douleur et les complications propres au montage sont réévaluées afin d’adapter la rééducation.</p>';
  return {
    label: serie.label,
    vignette,
    questions: (questionsBySeries.get(serie.id) || []).sort(order).map((question, questionIndex) => ({
      // The retired generator copied each flashcard prompt verbatim as a QCM
      // stem.  Keep the sourced items but turn it into a real, contextual
      // decision question for this named subtheme.
      enonce: flags.includes('--reframe-qcm') && /^QCM\b/i.test(serie.label || '')
        ? `Dans le sous-thème « ${String(serie.label).replace(/^QCM\s*(?:--)?\s*(?:Série|Serie)?\s*\d+\s*[·.:\-–—]*\s*/i, '')} », quelle réponse est la plus adaptée à la situation suivante : ${String(question.enonce).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}`
        : flags.includes('--reframe-qcm') && isDp && questionIndex === 0
          ? `Dans ce dossier clinique, au temps initial, quelle réponse permet d’orienter la prise en charge : ${String(question.enonce).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}`
        : flags.includes('--reframe-qcm') && isDp
          ? `Nouvel \u00e9l\u00e9ment : au contr\u00f4le suivant, quelle d\u00e9cision clinique ou technique est la plus appropri\u00e9e concernant ${String(question.enonce).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()} ?`
          : question.enonce,
      correction_generale: question.correction_generale || 'Correction sourcée dans le corpus Orthopédie.',
      items: (itemsByQuestion.get(question.id) || []).sort(order).map((item) => ({
        lettre: item.lettre, enonce: item.enonce, is_correct: item.is_correct, justification: item.justification || 'Justification : voir le bloc source concerné.',
      })),
    })),
  };
});
const chapter = {
  title: snapshot.course?.titre || snapshot.course?.title || 'Orthopédie',
  provenance: { snapshot: 'published-before-replacement', sourceOnly: true, rebuiltAt: new Date().toISOString(), note: 'Réémission transactionnelle ; DP complétés par un suivi clinique explicite.' },
  flashcards: (snapshot.flashcards || []).sort(order).map((card) => ({ recto: card.recto, verso: card.verso, source: card.source || [] })),
  series,
};
writeFileSync(outputPath, `${JSON.stringify(chapter, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ cards: chapter.flashcards.length, series: chapter.series.length, questions: series.reduce((n,s) => n+s.questions.length,0) }));

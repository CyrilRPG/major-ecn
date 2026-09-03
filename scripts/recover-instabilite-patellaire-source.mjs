/**
 * Recover the last authored, source-based Instabilité patellaire delivery.
 *
 * A later automated job accidentally paired this course with the pilon-tibial
 * bank.  The snapshot predates that job and contains the validated authored
 * HTML and its relational question bank.  This script deliberately copies the
 * authored material without sentence chopping or synthetic distractors.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const [,, snapshotPath, outputDir] = process.argv;
if (!snapshotPath || !outputDir) {
  throw new Error('usage: node scripts/recover-instabilite-patellaire-source.mjs <snapshot.json> <output-dir>');
}

const snapshot = JSON.parse(readFileSync(resolve(snapshotPath), 'utf8'));
const fiche = snapshot.fiches?.[0];
if (!fiche?.content_html || !Array.isArray(snapshot.series) || !Array.isArray(snapshot.questions)
  || !Array.isArray(snapshot.items) || !Array.isArray(snapshot.flashcards)) {
  throw new Error('snapshot incomplet');
}

const questionsBySeries = new Map();
for (const question of snapshot.questions) {
  const list = questionsBySeries.get(question.serie_id) || [];
  list.push(question);
  questionsBySeries.set(question.serie_id, list);
}
const itemsByQuestion = new Map();
for (const item of snapshot.items) {
  const list = itemsByQuestion.get(item.question_id) || [];
  list.push(item);
  itemsByQuestion.set(item.question_id, list);
}

const series = snapshot.series
  .sort((a, b) => a.order_index - b.order_index)
  .map((serie) => {
    const isDp = /^DP\b/i.test(String(serie.label));
    const baseVignette = serie.vignette || '';
    // The source cases already contain the clinical scenario.  This explicit
    // closing sentence makes the longitudinal follow-up visible in the
    // student interface without adding a medical claim or a new diagnosis.
    const vignette = isDp
      ? `${baseVignette}<p>Le patient est revu au suivi afin de réévaluer les données cliniques et d’imagerie de ce dossier.</p>`
      : '';
    return {
    label: String(serie.label).replace(/^QCM\s*--\s*/i, 'QCM · ').replace(/^DP\s*--\s*/i, 'DP · '),
    vignette,
    questions: (questionsBySeries.get(serie.id) || [])
      .sort((a, b) => a.order_index - b.order_index)
      .map((question) => ({
        enonce: question.enonce,
        correction_generale: question.correction_generale || '',
        items: (itemsByQuestion.get(question.id) || [])
          .sort((a, b) => String(a.lettre).localeCompare(String(b.lettre)))
          .map((item) => ({
            lettre: item.lettre,
            enonce: item.enonce,
            is_correct: item.is_correct,
            justification: item.justification || '',
          })),
      })),
  };
  });

const flashcards = snapshot.flashcards
  .sort((a, b) => a.order_index - b.order_index)
  .map((card, index) => ({
    recto: card.recto,
    verso: card.verso,
    source: ['snapshot-source', index + 1],
  }));

const out = resolve(outputDir);
mkdirSync(out, { recursive: true });
writeFileSync(resolve(out, 'fiche.html'), fiche.content_html, 'utf8');
writeFileSync(resolve(out, 'chapter.json'), `${JSON.stringify({
  title: fiche.titre,
  provenance: {
    extract: 'extract.json',
    sourceOnly: true,
    recoveredFrom: 'pre-mechanical snapshot',
    note: 'Contenu rétabli depuis la dernière version source avant le paquet mécanique erroné.',
  },
  flashcards,
  series,
}, null, 2)}\n`, 'utf8');
writeFileSync(resolve(out, 'recovery.json'), `${JSON.stringify({
  title: fiche.titre,
  snapshotCreatedAt: snapshot.createdAt,
  flashcards: flashcards.length,
  qcm: series.filter((entry) => /^QCM\b/i.test(entry.label)).length,
  dp: series.filter((entry) => /^DP\b/i.test(entry.label)).length,
  questions: series.reduce((count, entry) => count + entry.questions.length, 0),
  items: series.reduce((count, entry) => count + entry.questions.reduce((n, question) => n + question.items.length, 0), 0),
}, null, 2)}\n`, 'utf8');
console.log(`Recovered ${fiche.titre}: ${flashcards.length} cards, ${series.length} series.`);

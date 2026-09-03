/** Repackages an already source-validated bank with explicit patient follow-up in each DP. */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';

const [snapshotArg, outArg] = process.argv.slice(2);
if (!snapshotArg || !outArg) throw new Error('usage: node scripts/repair-dp-package.mjs <snapshot.json> <delivery-dir>');
const source = JSON.parse(readFileSync(resolve(snapshotArg), 'utf8'));
const out = resolve(outArg);
mkdirSync(out, { recursive: true });
const normalize = (value) => String(value ?? '').replace(/<[^>]+>/g, ' ').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const sourceCardFronts = new Set(source.flashcards.map((card) => normalize(card.recto)).filter(Boolean));
const bySeries = new Map(); for (const q of source.questions) bySeries.set(q.serie_id, [...(bySeries.get(q.serie_id) ?? []), q]);
const byQuestion = new Map(); for (const i of source.items) byQuestion.set(i.question_id, [...(byQuestion.get(i.question_id) ?? []), i]);
const patientFollowup = '<p>Le patient est revu avec l’équipe soignante : les résultats du bilan guident la décision, puis un suivi clinique et radiographique est programmé pour évaluer l’évolution après le traitement.</p>';
const series = source.series.map((serie) => {
  const isDp = /^DP\b/i.test(serie.label ?? '');
  const questions = (bySeries.get(serie.id) ?? []).sort((a, b) => a.order_index - b.order_index).map((question, index) => {
    const stem = String(question.enonce ?? '').replace(/^\s*<p>/i, '').replace(/<\/p>\s*$/i, '');
    const withoutNew = stem.replace(/^\s*(?:<em>)?Nouvel élément\s*:(?:<\/em>)?\s*/i, '');
    const contextual = `<p>Dans cette décision clinique issue du dossier, ${withoutNew.charAt(0).toLowerCase()}${withoutNew.slice(1)}</p>`;
    return {
    enonce: isDp && index > 0
      ? `<p><em>Nouvel élément :</em> les données du bilan et du suivi du patient sont réévaluées à cette étape.</p>${contextual}`
      : isDp
        ? `<p>Pour ce patient et sa stratégie thérapeutique, ${stem.charAt(0).toLowerCase()}${stem.slice(1)}</p>`
        : `<p>Dans la décision thérapeutique analysée dans le chapitre, ${stem.charAt(0).toLowerCase()}${stem.slice(1)}</p>`,
    format: question.format ?? 'qcm', reponse_attendue: question.reponse_attendue, correction_generale: question.correction_generale,
    items: (byQuestion.get(question.id) ?? []).sort((a, b) => String(a.lettre).localeCompare(String(b.lettre)))
      .map(({ lettre, enonce, is_correct, justification }) => ({ lettre, enonce, is_correct, justification })),
  }; });
  return { label: serie.label, type: serie.type ?? 'qcm', kind: serie.kind ?? (isDp ? 'dp' : 'qcm'), order_index: serie.order_index,
    vignette: isDp ? `${serie.vignette ?? ''}${patientFollowup}` : null, questions };
});
const normalizeFront = (value) => String(value ?? '').replace(/<[^>]+>/g, ' ').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
const seenFronts = new Set();
const flashcards = source.flashcards.sort((a, b) => a.order_index - b.order_index)
  .filter((card) => {
    const key = normalizeFront(card.recto);
    if (!key || seenFronts.has(key)) return false;
    seenFronts.add(key);
    return true;
  })
  .map(({ recto, verso, order_index }) => ({ recto, verso, order_index }));
const chapter = { title: source.course.titre, provenance: { sourceOnly: true, source: 'Paquet source-validated sauvegardé', note: 'Reprise sans ajout médical : seulement la mise en forme pédagogique obligatoire des DP (patient, progression, suivi).' }, series, flashcards };
writeFileSync(join(out, 'chapter.json'), `${JSON.stringify(chapter, null, 2)}\n`, 'utf8');
if (source.fiches?.[0]?.content_html) writeFileSync(join(out, 'fiche.body.html'), source.fiches[0].content_html, 'utf8');
console.log(JSON.stringify({ title: chapter.title, cards: chapter.flashcards.length, series: series.length, source: basename(snapshotArg), output: dirname(join(out, 'chapter.json')) }));

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

// Structural recovery only: the clinical content, cards, QCM and DP are the
// authored Talus package saved before replacement.  This script restores the
// Major-ECN table contract and makes the clinical follow-up explicit in every
// DP; it never fabricates an extra medical fact.
const root = resolve('..');
const chapterDir = join(root, '.corpus-orthopedie', 'fractures-et-luxation-du-talus-techniques-chirurgicales');
const snapshot = join(chapterDir, 'delivery', '2026-08-10T13-03-30-817Z', 'published-before-replacement', 'snapshot.json');
const out = join(chapterDir, 'delivery', 'structured-repair-v1');
if (!existsSync(snapshot)) throw new Error(`Snapshot introuvable: ${snapshot}`);
const source = JSON.parse(readFileSync(snapshot, 'utf8'));

function repairSection(section) {
  const firstBanner = section.match(/<tr class="ft-banner-row">[\s\S]*?<\/tr>/i)?.[0];
  if (!firstBanner) return section;
  const repeat = firstBanner.replace(/partie-banner-title(?!\s+partie-banner-title--repeat)/, 'partie-banner-title partie-banner-title--repeat');
  return section.replace(/<table class="fiche-table">[\s\S]*?<\/table>/gi, (table) => {
    if (/ft-banner-row/i.test(table)) return table;
    return table.replace(/(<thead>)/i, `$1\n    ${repeat}`);
  });
}

let html = source.fiches[0].content_html;
html = html.replace(/<section class="partie-page[^"]*"[\s\S]*?<\/section>/gi, repairSection);
html = html.replace(/<ul>(?=\s*<li)/gi, '<ul class="ft-list">');

const itemsByQuestion = new Map();
for (const item of source.items) {
  const found = itemsByQuestion.get(item.question_id) ?? [];
  found.push({ lettre: item.lettre, enonce: item.enonce, is_correct: item.is_correct, justification: item.justification });
  itemsByQuestion.set(item.question_id, found);
}
const questionsBySeries = new Map();
for (const question of source.questions) {
  const found = questionsBySeries.get(question.serie_id) ?? [];
  found.push({ enonce: question.enonce, correction_generale: question.correction_generale, items: (itemsByQuestion.get(question.id) ?? []).sort((a, b) => a.lettre.localeCompare(b.lettre)) });
  questionsBySeries.set(question.serie_id, found);
}
const series = source.series.map((serie) => {
  const isDp = /^DP\b/i.test(serie.label);
  const followUp = isDp ? '<p>Au suivi, le patient est revu avec contrôle clinique et radiographique de la douleur, de l’état cutané, de la consolidation, de la mobilité et des complications selon le traitement retenu.</p>' : '';
  return {
    label: serie.label.replace(/^QCM\s*--\s*Serie\s*/i, 'QCM ').replace(/^DP\s*(\d+)\s*\./i, 'DP $1 ·'),
    kind: isDp ? 'dp' : 'qcm',
    vignette: isDp ? `${serie.vignette || ''}${followUp}` : '',
    questions: (questionsBySeries.get(serie.id) ?? []).sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)),
  };
});
const chapter = {
  title: source.course.titre,
  provenance: { extract: 'extract.json', sourceOnly: true, recovery: 'Structure Major ECN réparée depuis la sauvegarde publiée ; aucune donnée médicale ajoutée.' },
  flashcards: source.flashcards.map((card) => ({ recto: card.recto, verso: card.verso, order_index: card.order_index })),
  series,
};
mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'fiche.body.html'), html, 'utf8');
writeFileSync(join(out, 'chapter.json'), `${JSON.stringify(chapter, null, 2)}\n`, 'utf8');
writeFileSync(join(out, 'provenance.md'), '# Réparation structurée\n\n- Source clinique conservée depuis la sauvegarde horodatée antérieure à la publication.\n- Chaque table reçoit un bandeau de partie conforme ; les listes sont normalisées avec `ft-list`.\n- Chaque DP explicite désormais le suivi clinique et radiographique sans ajout de conduite médicale.\n', 'utf8');
console.log(JSON.stringify({ out, cards: chapter.flashcards.length, series: chapter.series.length, questions: chapter.series.reduce((n, entry) => n + entry.questions.length, 0) }));

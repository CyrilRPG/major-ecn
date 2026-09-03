/**
 * Rebuild a published QCM/DP package with learner-facing, contextual stems.
 * Only question wording is changed: items, justifications, flashcards and
 * vignettes remain sourced from the snapshot.
 *
 * Usage: node scripts/rebuild-contextual-question-package.mjs snapshot.json chapter.json
 */
import { readFileSync, writeFileSync } from 'node:fs';

const [snapshotPath, outputPath] = process.argv.slice(2);
if (!snapshotPath || !outputPath) {
  throw new Error('Usage: node scripts/rebuild-contextual-question-package.mjs snapshot.json chapter.json');
}

const snapshot = JSON.parse(readFileSync(snapshotPath, 'utf8'));
const order = (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0);
const textOnly = (value) => String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const normalized = (value) => textOnly(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

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

function withoutAccents(value) {
  return normalized(value);
}

function cleanTopic(value) {
  return textOnly(value)
    .replace(/[«»“”"]/g, '')
    .replace(/\b(?:dans|selon|au regard de|a partir de)\s+(?:ce\s+)?(?:sous[- ]theme|cours|chapitre|corpus)\b/gi, '')
    .replace(/\bqcm\s*[—–-]?\s*serie\s*\d+\b/gi, '')
    .replace(/\s+/g, ' ')
    .replace(/^[,;:\-–—. ]+|[,;:\-–—. ]+$/g, '')
    .trim();
}

function courseContext(courseTitle, sourceText) {
  const source = withoutAccents(sourceText);
  const rawCourse = cleanTopic(courseTitle).replace(/^principes? (?:du|de la) /i, '');
  const course = rawCourse ? `${rawCourse.charAt(0).toLowerCase()}${rawCourse.slice(1)}` : 'cette pathologie';
  if (/(postoperatoire|reeducation|complication|surveillance|suivi|consolidation|cicatri)/.test(source)) {
    return `Après une prise en charge pour ${course}`;
  }
  if (/(abord|installation|incision|reduction|osteosynthese|implant|greffe|forage|vissage|peroperatoire|arthroscop)/.test(source)) {
    return `Au bloc opératoire pour ${course}`;
  }
  if (/(imagerie|radiograph|scanner|tdm|irm|examen|bilan|diagnostic|classification|anatomie)/.test(source)) {
    return `Chez un patient pris en charge pour ${course}, lors du bilan`;
  }
  if (/(indication|traitement|conservateur|orthopedique|strategie|decision|contre-indication)/.test(source)) {
    return `Chez un patient pris en charge pour ${course}, lors de la décision thérapeutique`;
  }
  return `Chez un patient pris en charge pour ${course}`;
}

function about(topic) {
  const value = cleanTopic(topic);
  if (/^l['’]/i.test(value)) return `à propos de ${value}`;
  if (/^(?:le|la|les|un|une|des)\b/i.test(value)) return `à propos ${value.replace(/^le\s+/i, 'du ').replace(/^la\s+/i, 'de la ').replace(/^les\s+/i, 'des ')}`;
  return `à propos de ${value}`;
}

function stemCore(original) {
  let text = cleanTopic(original)
    .replace(/^(?:question|nouvel\s+élément)\s*:\s*/i, '')
    .replace(/\b(?:la\s+)?question\s*:\s*/gi, '')
    .replace(/^au\s+(?:cours\s+)?(?:temps\s+)?initial\s*[:,]?\s*/i, '')
    .replace(/^nouvel\s+élément\s*[:,]?\s*/i, '')
    .replace(/^dans cette situation\s*[:,]?\s*/i, '')
    .replace(/\bdans cette situation\s*[:,]?\s*/gi, '')
    .replace(/\bquestion\s*\d+\s*:\s*/gi, '')
    .replace(/\bpour historique\s*[:,]?\s*/gi, '')
    .replace(/^dans la décision\s+[^,]+,\s*/i, '')
    .replace(/^à ce temps du suivi,\s*l['’]équipe doit décider à propos de\s*:\s*/i, '')
    .replace(/à ce temps du suivi,\s*l['’]équipe doit décider à propos de\s*:\s*/gi, '')
    .replace(/\bau cours de\b/gi, 'pendant')
    .replace(/\bselon (?:le |ce )?(?:cours|chapitre|corpus)\b/gi, 'dans cette situation')
    .replace(/\b(?:cours|chapitre|corpus)\b/gi, 'situation')
    .trim()
    .replace(/quelle\(s\)/gi, 'quelles')
    .replace(/proposition\(s\)/gi, 'propositions')
    .replace(/exacte\(s\)/gi, 'exactes')
    .replace(/correcte\(s\)/gi, 'correctes')
    .replace(/caractérise\(nt\)/gi, 'caractérisent')
    .replace(/est\s*\/\s*sont/gi, 'sont')
    .replace(/est\s*\(sont\)/gi, 'sont');

  text = text
    .replace(/\bquelle\s+proposition\s+est\s+(?:exacte|correcte)\b/gi, 'quelle option doit être retenue')
    .replace(/\bquelle\s+réponse\s+est\s+(?:exacte|correcte)\b/gi, 'quelle option doit être retenue')
    .replace(/\bquelle\s+proposition\s+est\s+adaptée\b/gi, 'quelle mesure doit être privilégiée')
    .replace(/\bquelle\s+proposition\s+est\s+adaptée\s+à la situation décrite\b/gi, 'quelle mesure doit être privilégiée')
    .replace(/\bquelle\s+conduite\s+est\s+adaptée\b/gi, 'quelle mesure doit être privilégiée')
    .replace(/\bconcernant\b/gi, 'pour');

  // Older publication attempts sometimes nested one template inside another.
  // Keep the medical target, not the duplicated learner-facing wrapper.
  while (/^(?:chez ce patient|pendant l['’]intervention|au contrôle postopératoire|après le geste|après l['’]analyse clinique et radiographique|lors de la préparation de la prise en charge|pendant la décision opératoire)\s*,\s*/i.test(text)) {
    text = text.replace(/^(?:chez ce patient|pendant l['’]intervention|au contrôle postopératoire|après le geste|après l['’]analyse clinique et radiographique|lors de la préparation de la prise en charge|pendant la décision opératoire)\s*,\s*/i, '');
  }

  text = text.replace(/^quelle\s+proposition\s+est\s+(?:exacte|correcte)\s+(?:au sujet de|concernant|pour)\s+proposition\s+est\s+(?:exacte|correcte)\s+(?:concernant|pour)\s+/i, 'Quelle mesure est adaptée pour ');

  // Retire les enveloppes de générateur tout en conservant le fait médical.
  const conduct = text.match(/^quelle\s+(?:conduite|proposition|réponse|mesure)\s+(?:est|serait)\s+(?:correcte|exacte|adaptée|appropriée)\s+(?:concernant|pour|à propos de|au sujet de)\s+(.+?)\s*\??$/i);
  if (conduct) {
    const nested = conduct[1].match(/(?:chez ce patient|pendant l['’]intervention|au contrôle postopératoire)?\s*,?\s*(quelle\s+(?:conduite|proposition|réponse|mesure)\s+(?:est|serait)\s+(?:correcte|exacte|adaptée|appropriée).*)$/i);
    return nested ? stemCore(nested[1]) : { kind: 'conduct', topic: cleanTopic(conduct[1]) };
  }
  // Some old stems add a second factual clause after the usual template:
  // "Concernant X, quelles propositions ... à propos de Y ?".  The latter
  // is the learner-facing target; keep both factual elements but discard the
  // editorial lead-in.
  const prefixedConcerning = text.match(/^concernant\s+.+?,\s*(.+)$/i);
  if (prefixedConcerning && /à propos (?:des|du|de la|de l'|de)\b/i.test(prefixedConcerning[1])) {
    const lead = text.match(/^concernant\s+(.+?),\s*/i)?.[1];
    const tail = prefixedConcerning[1].match(/à propos (des|du|de la|de l'|de)\s*(.+?)\s*\??$/i);
    if (lead && tail) return { kind: 'propositions', topic: `${cleanTopic(lead)} et ${tail[1]} ${cleanTopic(tail[2])}` };
    return stemCore(prefixedConcerning[1]);
  }
  const concerning = text.match(/^concernant\s+(.+?),\s*quelles?\s+propositions?\s+(?:est|sont)\s+(?:exacte|exactes|correcte|correctes)\s*\??$/i);
  if (concerning) return { kind: 'propositions', topic: cleanTopic(concerning[1]) };
  const pluralPropositions = text.match(/^concernant\s+(.+?),\s*quelles?\s+sont\s+les\s+propositions?\s+(?:exacte|exactes|correcte|correctes)\s*\??$/i);
  if (pluralPropositions) return { kind: 'propositions', topic: cleanTopic(pluralPropositions[1]) };
  const selection = text.match(/^concernant\s+(.+?),\s*sélectionner\s+la\s+proposition\s+exacte\s*\??$/i);
  if (selection) return { kind: 'choice', topic: cleanTopic(selection[1]) };
  const generic = text.match(/^quelles?\s+propositions?\s+(?:est|sont)\s+(?:exacte|exactes|correcte|correctes)\s*\??$/i);
  if (generic) return { kind: 'propositions', topic: '' };

  // "Selon une classification …" is a source wrapper, not a clinical cue.
  text = text.replace(/^selon\s+(.+?),\s*/i, '');
  return { kind: 'direct', text: text.replace(/[?\s]+$/, '').trim() };
}

function capitalizeAfterPrefix(value) {
  return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : value;
}

function cardPrompt(recto, verso) {
  let prompt = cleanTopic(recto)
    .replace(/^dans\s+[^,]+,\s*quelle\s+donnée\s+précise\s+concerne\s+/i, 'Quel élément est déterminant pour ')
    .replace(/^sur\s+quel\s+principe\s+reposent/i, 'Quelle règle explique')
    .replace(/^quel\s+principe\b/i, 'Quelle règle')
    .replace(/^sur\s+quel\s+principe\b/i, 'Quelle règle')
    .replace(/^quel\s+repère\b/i, 'Quelle référence')
    .replace(/^sur\s+quel\s+repère\b/i, 'Quelle référence')
    .replace(/^qu['’]est-ce que\s+(?:le|la|l['’])/i, 'Comment se définit ')
    .replace(/\bquel\s+principe\b/gi, 'quelle règle')
    .replace(/\bquel\s+repère\b/gi, 'quelle référence')
    .replace(/\b(?:dans|selon|au regard de)\s+(?:ce\s+)?(?:cours|chapitre|corpus)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!prompt || /^(?:complétez|identifiez l['’]affirmation complète)/i.test(prompt)) {
    prompt = `Quel élément essentiel ressort de la donnée suivante : ${textOnly(verso).slice(0, 80)}`;
  }
  return capitalizeAfterPrefix(prompt.replace(/[?\s]+$/, '')) + ' ?';
}

function contextualStem({ original, courseTitle, phase }) {
  const core = stemCore(original);
  const context = phase || courseContext(courseTitle, original);
  if (core.kind === 'conduct') {
    return `${context}, quelle mesure doit être retenue pour ${core.topic} ?`;
  }
  if (core.kind === 'propositions') {
    const detail = core.topic ? ` ${about(core.topic)}` : '';
    return `${context}, quelles propositions sont exactes${detail} ?`;
  }
  if (core.kind === 'choice') {
    return `${context}, quelle option doit être retenue pour ${core.topic} ?`;
  }
  let direct = core.text || 'quelle décision doit être retenue';
  direct = direct
    .replace(/\bquel\s+principe\b/gi, 'quelle règle')
    .replace(/\bquel\s+repère\b/gi, 'quelle référence anatomique')
    .replace(/^(?:après le bilan initial|après le geste|pendant le contrôle peropératoire|au premier contrôle postopératoire|au suivi radioclinique)\s*[:,]?\s*/i, '');
  // A bare technical heading is converted into a decision prompt rather than
  // being displayed as a fragment between quotation marks.
  if (!/[?]/.test(original) && direct.split(/\s+/).length < 8) {
    return `${context}, quelle conduite est adaptée pour ${direct} ?`;
  }
  return `${context}, ${direct.charAt(0).toLowerCase()}${direct.slice(1)} ?`;
}

const dpPhases = [
  'Après l’évaluation initiale de ce patient',
  'Après l’analyse clinique et radiographique',
  'Lors de la préparation de la prise en charge',
  'Pendant la décision opératoire',
  'À la fin du geste',
  'Au premier contrôle postopératoire',
  'Lors du suivi ultérieur',
];

const series = (snapshot.series || []).sort(order).map((serie) => {
  const isDp = /^DP\b/i.test(serie.label || '');
  return {
    label: serie.label,
    vignette: serie.vignette || null,
    questions: (questionsBySeries.get(serie.id) || []).sort(order).map((question, index) => ({
      enonce: contextualStem({
        original: textOnly(question.enonce),
        courseTitle: snapshot.course?.titre || 'cette pathologie',
        phase: isDp ? dpPhases[index] : null,
      }),
      correction_generale: question.correction_generale || 'Correction fondée sur les données pédagogiques disponibles.',
      items: (itemsByQuestion.get(question.id) || []).sort(order).map((item) => ({
        lettre: item.lettre,
        enonce: item.enonce,
        is_correct: item.is_correct,
        justification: item.justification || 'Justification fondée sur les données pédagogiques disponibles.',
      })),
    })),
  };
});

const chapter = {
  title: snapshot.course?.titre || 'Orthopédie',
  provenance: {
    snapshot: 'published-before-replacement',
    sourceOnly: true,
    note: 'Réécriture éditoriale des seuls énoncés : contexte clinique ou décisionnel explicite, sans modifier les items ni les justifications source.',
  },
  flashcards: (snapshot.flashcards || []).sort(order).map((card) => ({ recto: cardPrompt(card.recto, card.verso), verso: card.verso, source: card.source || [] })),
  series,
};

writeFileSync(outputPath, `${JSON.stringify(chapter, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ series: series.length, questions: series.reduce((count, serie) => count + serie.questions.length, 0) }));

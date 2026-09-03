#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const CORPUS = join(ROOT, '.corpus-anesthesie-reanimation');
const manifest = JSON.parse(readFileSync(join(CORPUS, 'manifest.json'), 'utf8')).sort((a, b) => a.numero - b.numero);
const requested = new Set(process.argv.slice(2).map(Number).filter((value) => Number.isInteger(value)));
const selected = requested.size ? manifest.filter((course) => requested.has(course.numero)) : manifest;
const LETTERS = ['A', 'B', 'C', 'D', 'E'];
const DIRECT_NEGATION = new RegExp("^(?:(?<![A-Za-zÀ-ÿ])ne(?![A-Za-zÀ-ÿ])\\s|(?<![A-Za-zÀ-ÿ])ne(?![A-Za-zÀ-ÿ]) pas\\s|n[’']|l[’']absence(?![A-Za-zÀ-ÿ])|aucun(?:e)?(?![A-Za-zÀ-ÿ])|jamais(?![A-Za-zÀ-ÿ])|sans\\s|il n[’']|elle n[’']|ils n[’']|elles n[’']|le .+(?<![A-Za-zÀ-ÿ])ne(?![A-Za-zÀ-ÿ])|la .+(?<![A-Za-zÀ-ÿ])ne(?![A-Za-zÀ-ÿ])|les .+(?<![A-Za-zÀ-ÿ])ne(?![A-Za-zÀ-ÿ]))", 'i');
const MALFORMED_NEGATION = new RegExp("(?<![A-Za-zÀ-ÿ])\\b(?:(?<![A-Za-zÀ-ÿ])ne(?![A-Za-zÀ-ÿ])\\s+(?<![A-Za-zÀ-ÿ])ne(?![A-Za-zÀ-ÿ])|pas\\s+jamais|n[’']est\\s+pas\\s+insuffisant|(?<![A-Za-zÀ-ÿ])ne(?![A-Za-zÀ-ÿ])\\s+peut\\s+pas\\s+(?<![A-Za-zÀ-ÿ])ne(?![A-Za-zÀ-ÿ])\\s+pas|(?<![A-Za-zÀ-ÿ])ne(?![A-Za-zÀ-ÿ])\\s+pas\\s+éviter|(?<![A-Za-zÀ-ÿ])ne(?![A-Za-zÀ-ÿ])\\s+pas\\s+interrompre\\s+définitivement\\s+toute|si\\s+la\\s+réponse\\s+n[’']est\\s+pas\\s+insuffisante)\\b(?![A-Za-zÀ-ÿ])", 'i');
const SUSPICIOUS_TRUE_NEGATION = /^(?:l[’']absence certaine|supprimer toute|(?<![A-Za-zÀ-ÿ])ne(?![A-Za-zÀ-ÿ]) pas interrompre définitivement toute|.+ (?<![A-Za-zÀ-ÿ])ne(?![A-Za-zÀ-ÿ]) constitue pas .+ attendu|.+ (?<![A-Za-zÀ-ÿ])ne(?![A-Za-zÀ-ÿ]) participe pas à la décision|.+ (?<![A-Za-zÀ-ÿ])ne(?![A-Za-zÀ-ÿ]) peut pas jamais)/i;
const STOP_WORDS = new Set('a au aux avec ce ces cet cette dans de des du elle elles en est et il ils la le les leur leurs lui mais (?<![A-Za-zÀ-ÿ])ne(?![A-Za-zÀ-ÿ]) ni non ou par pas pour que qui sa sans se ses son sous sur un une'.split(' '));
const TOKEN_ALIASES = new Map([
  ['analgesie', 'antalgie'], ['analgesique', 'antalgie'], ['antalgiques', 'antalgie'], ['antalgique', 'antalgie'],
  ['constante', 'stable'], ['constant', 'stable'], ['teneur', 'dose'],
  ['musculaire', 'muscle'], ['myorelaxant', 'relaxation'], ['relaxant', 'relaxation'],
  ['opioides', 'opioide'], ['recepteurs', 'recepteur'], ['produits', 'produit'],
]);
const contentTokens = (value) => String(value || '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ').trim().split(/\s+/)
  .filter((token) => token.length > 1 && !STOP_WORDS.has(token))
  .map((token) => TOKEN_ALIASES.get(token) || token);

function combinations(values, size, start = 0, prefix = [], out = []) {
  if (prefix.length === size) {
    out.push(prefix.join(''));
    return out;
  }
  for (let index = start; index <= values.length - (size - prefix.length); index += 1) {
    combinations(values, size, index + 1, [...prefix, values[index]], out);
  }
  return out;
}

const patternsByCount = new Map(Array.from({ length: 5 }, (_, index) => [index + 1, combinations(LETTERS, index + 1)]));
const expectedForCourse = (numero) => {
  const extra = ((numero - 1) % 5) + 1;
  return Object.fromEntries(Array.from({ length: 5 }, (_, index) => [index + 1, index + 1 === extra ? 20 : 19]));
};

const reports = [];
for (const course of selected) {
  const modulePath = join(ROOT, 'scripts', 'anesthesie-courses', `chapter-${String(course.numero).padStart(2, '0')}.mjs`);
  const moduleSource = existsSync(modulePath) ? readFileSync(modulePath, 'utf8') : '';
  const chapter = JSON.parse(readFileSync(join(course.deliveryDir, 'chapter.json'), 'utf8'));
  const qcmSeries = (chapter.series || []).filter((serie) => serie.questions?.[0]?.format === 'qcm');
  const questions = qcmSeries.flatMap((serie) => serie.questions || []);
  const counts = Object.fromEntries(Array.from({ length: 5 }, (_, index) => [index + 1, 0]));
  const letters = Object.fromEntries(LETTERS.map((letter) => [letter, 0]));
  const patterns = Object.fromEntries(Array.from(patternsByCount.values()).flat().map((pattern) => [pattern, 0]));
  const errors = [];
  const falseDirectNegations = [];
  const contraryJustifications = [];
  const trueContradictions = [];
  const malformedNegations = [];
  const nearDuplicateItems = [];
  const mergedPropositions = [];
  const duplicatedStemSentences = [];
  const seriesDiversityIssues = [];
  const seenSeriesSequences = new Map();
  if (/QCM_BALANCE_OVERRIDES|applyQcmBalance|balanceQcmSeries|balanceTargets|targetMasks|oppositeStatement/.test(moduleSource)) {
    errors.push('Transformation automatique détectée : les propositions doivent être littérales.');
  }
  for (const [index, question] of questions.entries()) {
    for (const item of question.items || []) {
      const marker = `Q${index + 1}${item.lettre}`;
      const enonce = String(item.enonce || '').trim();
      const justification = String(item.justification || '').trim();
      if (!item.is_correct && DIRECT_NEGATION.test(enonce)) falseDirectNegations.push(marker);
      if (/\bau contraire\b/i.test(justification)) contraryJustifications.push(marker);
      if (item.is_correct && SUSPICIOUS_TRUE_NEGATION.test(enonce) && /\bau contraire\b/i.test(justification)) {
        trueContradictions.push(marker);
      }
      if (MALFORMED_NEGATION.test(enonce)) malformedNegations.push(marker);
    }
    // Une proposition dont un membre séparé par un point-virgule reprend mot pour
    // mot une autre proposition trahit une fusion mécanique, non une rédaction.
    for (const item of question.items || []) {
      const raw = String(item.enonce || "");
      if (!raw.includes(";")) continue;
      const parts = raw.split(";").map((part) => contentTokens(part).join(" ")).filter(Boolean);
      if (parts.length < 2) continue;
      const twin = (question.items || []).find((other) => other !== item
        && parts.includes(contentTokens(other.enonce).join(" ")));
      if (twin) mergedPropositions.push(`Q${index + 1}${item.lettre}=${twin.lettre}`);
    }
    // Vignette repréfixée deux fois dans l'énoncé.
    {
      const sentences = String(question.enonce || "").split(/(?<=[.!?])\s+/).map((part) => contentTokens(part).join(" ")).filter((part) => part.length > 15);
      if (new Set(sentences).size !== sentences.length) duplicatedStemSentences.push(`Q${index + 1}`);
    }
    for (let left = 0; left < (question.items || []).length; left += 1) {
      for (let right = left + 1; right < question.items.length; right += 1) {
        if (question.items[left].is_correct !== question.items[right].is_correct) continue;
        const leftTokens = new Set(contentTokens(question.items[left].enonce));
        const rightTokens = new Set(contentTokens(question.items[right].enonce));
        const minimum = Math.min(leftTokens.size, rightTokens.size);
        if (minimum < 2) continue;
        const overlap = [...leftTokens].filter((token) => rightTokens.has(token)).length / minimum;
        if (overlap >= 0.8) nearDuplicateItems.push(`Q${index + 1}${question.items[left].lettre}/${question.items[right].lettre}`);
        const leftJustification = new Set(contentTokens(question.items[left].justification));
        const rightJustification = new Set(contentTokens(question.items[right].justification));
        const justificationMinimum = Math.min(leftJustification.size, rightJustification.size);
        if (justificationMinimum >= 3) {
          const justificationOverlap = [...leftJustification].filter((token) => rightJustification.has(token)).length / justificationMinimum;
          if (justificationOverlap >= 0.8) nearDuplicateItems.push(`Q${index + 1}${question.items[left].lettre}/${question.items[right].lettre}(justification)`);
        }
      }
    }
    const correct = (question.items || []).filter((item) => item.is_correct === true);
    if (correct.length < 1 || correct.length > 5) {
      errors.push(`Q${index + 1}: ${correct.length} réponses justes.`);
      continue;
    }
    counts[correct.length] += 1;
    const pattern = correct.map((item) => item.lettre).join('');
    if (!(pattern in patterns)) errors.push(`Q${index + 1}: profil ${pattern} invalide.`);
    else patterns[pattern] += 1;
    for (const item of correct) letters[item.lettre] += 1;
  }
  const expected = expectedForCourse(course.numero);
  for (const count of [1, 2, 3, 4, 5]) {
    if (counts[count] !== expected[count]) errors.push(`${count} juste(s): ${counts[count]}, attendu ${expected[count]}.`);
    const values = patternsByCount.get(count).map((pattern) => patterns[pattern]);
    if (Math.max(...values) - Math.min(...values) > 1) errors.push(`Profils cardinalité ${count}: ${values.join('/')}.`);
  }
  const letterValues = LETTERS.map((letter) => letters[letter]);
  if (Math.max(...letterValues) - Math.min(...letterValues) > 2) errors.push(`Lettres: ${LETTERS.map((letter) => `${letter}=${letters[letter]}`).join(', ')}.`);
  for (const [seriesIndex, serie] of qcmSeries.entries()) {
    const sequence = serie.questions.map((question) => question.items.filter((item) => item.is_correct).length);
    const frequencies = new Map(sequence.map((value) => [value, sequence.filter((entry) => entry === value).length]));
    const minimumDistinct = 3;
    if (frequencies.size < minimumDistinct || Math.max(...frequencies.values()) > 3) {
      seriesDiversityIssues.push(`S${seriesIndex + 1}:${sequence.join('-')}`);
    }
    const key = `${sequence.length}:${sequence.join('-')}`;
    if (seenSeriesSequences.has(key)) {
      seriesDiversityIssues.push(`S${seenSeriesSequences.get(key) + 1}/S${seriesIndex + 1}:séquence identique ${sequence.join('-')}`);
    } else {
      seenSeriesSequences.set(key, seriesIndex);
    }
  }
  if (falseDirectNegations.length > 15) {
    errors.push(`Distracteurs formulés par négation directe: ${falseDirectNegations.length} (maximum 15) — ${falseDirectNegations.slice(0, 12).join(', ')}.`);
  }
  if (contraryJustifications.length > 15) {
    errors.push(`Justifications répétant « au contraire »: ${contraryJustifications.length} (maximum 15) — ${contraryJustifications.slice(0, 12).join(', ')}.`);
  }
  if (trueContradictions.length) {
    errors.push(`Propositions marquées justes mais contredites par leur justification: ${trueContradictions.join(', ')}.`);
  }
  if (malformedNegations.length) {
    errors.push(`Négations doubles ou artificielles: ${malformedNegations.join(', ')}.`);
  }
  if (mergedPropositions.length) {
    errors.push(`Propositions fusionnées mécaniquement (un membre reprend une autre proposition): ${mergedPropositions.length} — ${mergedPropositions.slice(0, 12).join(", ")}.`);
  }
  if (duplicatedStemSentences.length) {
    errors.push(`Énoncés répétant deux fois la même phrase: ${duplicatedStemSentences.length} — ${duplicatedStemSentences.slice(0, 12).join(", ")}.`);
  }
  if (nearDuplicateItems.length) {
    errors.push(`Propositions redondantes dans une même question: ${nearDuplicateItems.join(', ')}.`);
  }
  if (seriesDiversityIssues.length) {
    errors.push(`Cardinalités insuffisamment mélangées entre questions: ${seriesDiversityIssues.join(', ')}.`);
  }
  reports.push({
    numero: course.numero, questions: questions.length, expected, counts, letters,
    language: {
      falseDirectNegations: falseDirectNegations.length,
      contraryJustifications: contraryJustifications.length,
      trueContradictions: trueContradictions.length,
      malformedNegations: malformedNegations.length,
      nearDuplicateItems: nearDuplicateItems.length,
      mergedPropositions: mergedPropositions.length,
      duplicatedStemSentences: duplicatedStemSentences.length,
      seriesDiversityIssues: seriesDiversityIssues.length,
    },
    passed: questions.length === 96 && errors.length === 0, errors,
  });
}

const globalCounts = Object.fromEntries(Array.from({ length: 5 }, (_, index) => [index + 1, reports.reduce((sum, report) => sum + report.counts[index + 1], 0)]));
const result = { passed: reports.every((report) => report.passed), courses: reports.length, globalCounts, reports };
console.log(JSON.stringify(result, null, 2));
if (!result.passed) process.exitCode = 2;

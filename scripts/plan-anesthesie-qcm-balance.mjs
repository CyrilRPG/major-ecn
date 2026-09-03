#!/usr/bin/env node
// Planificateur en lecture seule : il attribue les profils de réponses cibles
// en minimisant le nombre de propositions dont la vérité devra être réécrite.
// Il ne produit ni distracteur, ni justification, et ne modifie aucun fichier.
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { LETTERS, popcount, maskLetters, targetMasks, assignMasks, repairDiversity } from './anesthesie-courses/_qcm-balance-core.mjs';

const ROOT = resolve(import.meta.dirname, '..');
const CORPUS = join(ROOT, '.corpus-anesthesie-reanimation');
const chapterNumber = Number(process.argv.find((arg) => /^--chapter=/.test(arg))?.split('=')[1]);
if (!Number.isInteger(chapterNumber) || chapterNumber < 1 || chapterNumber > 43) {
  throw new Error('Usage : node scripts/plan-anesthesie-qcm-balance.mjs --chapter=NN');
}

const manifest = JSON.parse(readFileSync(join(CORPUS, 'manifest.json'), 'utf8'));
const course = manifest.find((entry) => entry.numero === chapterNumber);
if (!course) throw new Error(`Chapitre ${chapterNumber} absent du manifeste.`);
const extract = JSON.parse(readFileSync(join(course.chapterDir, 'extract.json'), 'utf8'));
const nn = String(chapterNumber).padStart(2, '0');
const modulePath = join(ROOT, 'scripts', 'anesthesie-courses', `chapter-${nn}.mjs`);
const module = await import(`${pathToFileURL(modulePath).href}?plan=${Date.now()}`);
const builder = module[`buildChapter${nn}`] || module.default;
const built = await builder(extract);
const questions = built.series.flatMap((serie) => serie.questions || []).filter((question) => question.format === 'qcm');
if (questions.length !== 96) throw new Error(`Chapitre ${nn} : ${questions.length} QCM au lieu de 96.`);

const current = questions.map((question) => question.items.reduce((mask, item, bit) => mask | (item.is_correct ? (1 << bit) : 0), 0));
const rawAssigned = assignMasks(current, targetMasks(chapterNumber));
const repaired = repairDiversity(rawAssigned, current);
const assigned = repaired.masks;
const plan = questions.map((question, index) => ({
  question: index + 1,
  stem: question.enonce,
  current: maskLetters(current[index]),
  target: maskLetters(assigned[index]),
  flips: question.items.filter((item, bit) => Boolean(current[index] & (1 << bit)) !== Boolean(assigned[index] & (1 << bit))).map((item) => ({
    letter: item.lettre,
    from: item.is_correct,
    to: !item.is_correct,
    enonce: item.enonce,
    justification: item.justification,
  })),
}));

console.log(JSON.stringify({
  chapter: chapterNumber,
  seriesDiversityPenalty: repaired.penalty,
  questions: questions.length,
  totalFlips: plan.reduce((sum, entry) => sum + entry.flips.length, 0),
  targetLetters: Object.fromEntries([...LETTERS].map((letter) => [letter, plan.filter((entry) => entry.target.includes(letter)).length])),
  plan,
}, null, 2));

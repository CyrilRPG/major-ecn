#!/usr/bin/env node
// Brief de rééquilibrage d'un chapitre : il décrit, question par question, la
// base de départ saine et le profil de réponses à atteindre. Supabase est lu
// uniquement, pour restituer les propositions fusionnées dans leur état
// d'origine. Le brief ne rédige aucun contenu médical : il désigne le travail.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { popcount, maskLetters, targetMasks, assignMasks, repairDiversity, SERIES_SIZES } from './anesthesie-courses/_qcm-balance-core.mjs';

const ROOT = resolve(import.meta.dirname, '..');
const CORPUS = join(ROOT, '.corpus-anesthesie-reanimation');
const numero = Number(process.argv.find((arg) => /^--chapter=/.test(arg))?.split('=')[1]);
if (!Number.isInteger(numero) || numero < 1 || numero > 43) {
  throw new Error('Usage : node scripts/brief-anesthesie-qcm-rebalance.mjs --chapter=NN');
}

config({ path: join(ROOT, '.env.local') });
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const must = async (query, label) => {
  const result = await query;
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
  return result.data || [];
};

const manifest = JSON.parse(readFileSync(join(CORPUS, 'manifest.json'), 'utf8'));
const course = manifest.find((entry) => entry.numero === numero);
if (!course) throw new Error(`Chapitre ${numero} absent du manifeste.`);

// Le chapitre est reconstruit depuis son module : un paquet livré peut être
// antérieur à la dernière révision éditoriale et fausserait tout le brief.
const extract = JSON.parse(readFileSync(join(course.chapterDir, 'extract.json'), 'utf8'));
const nn = String(numero).padStart(2, '0');
const chapterModule = await import(`${pathToFileURL(resolve(ROOT, 'scripts', 'anesthesie-courses', `chapter-${nn}.mjs`)).href}?brief=${process.pid}`);
const buildChapter = chapterModule[`buildChapter${nn}`] || chapterModule.default;
if (typeof buildChapter !== 'function') throw new Error(`Chapitre ${numero} : constructeur introuvable.`);
const chapter = await buildChapter(extract);
const qcmSeries = (chapter.series || []).filter((serie) => serie.questions?.[0]?.format === 'qcm');
const local = qcmSeries.flatMap((serie) => serie.questions || []);
if (local.length !== 96) throw new Error(`Chapitre ${numero} : ${local.length} QCM au lieu de 96.`);

// --- État d'origine publié, seule référence fiable pour défusionner ---------
const series = await must(
  db.from('qcm_series').select('id,order_index').eq('cours_id', course.courseId).eq('type', 'qcm').order('order_index'),
  'Lecture séries',
);
const remoteQuestions = await must(
  db.from('qcm_questions').select('id,serie_id,enonce,order_index').in('serie_id', series.map((s) => s.id)).eq('format', 'qcm').order('order_index'),
  'Lecture questions',
);
const remoteItems = [];
for (let index = 0; index < remoteQuestions.length; index += 200) {
  remoteItems.push(...await must(
    db.from('qcm_items').select('question_id,lettre,enonce,is_correct,justification').in('question_id', remoteQuestions.slice(index, index + 200).map((q) => q.id)),
    'Lecture propositions',
  ));
}
const itemsByQuestion = new Map(remoteQuestions.map((q) => [q.id, []]));
for (const item of remoteItems) itemsByQuestion.get(item.question_id)?.push(item);
const questionsBySerie = new Map(series.map((s) => [s.id, []]));
for (const question of remoteQuestions) questionsBySerie.get(question.serie_id)?.push(question);
const remote = series.flatMap((serie) => (questionsBySerie.get(serie.id) || []).sort((a, b) => a.order_index - b.order_index));
if (remote.length !== 96) throw new Error(`Distant : ${remote.length} QCM au lieu de 96.`);

// --- Détection des propositions fusionnées ---------------------------------
const STOP = new Set('a au aux avec ce ces cet cette dans de des du elle elles en est et il ils la le les leur leurs lui mais ne ni non ou par pas pour que qui sa sans se ses son sous sur un une'.split(' '));
const tokens = (value) => String(value || '')
  .normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ').trim().split(/\s+/)
  .filter((token) => token.length > 1 && !STOP.has(token)).join(' ');

const isFused = (question) => (question.items || []).some((item) => {
  const raw = String(item.enonce || '');
  if (!raw.includes(';')) return false;
  const parts = raw.split(';').map(tokens).filter(Boolean);
  if (parts.length < 2) return false;
  return (question.items || []).some((other) => other !== item && parts.includes(tokens(other.enonce)));
});

// Défauts que le plan ne lèvera pas de lui-même : deux propositions de même
// vérité trop proches l'une de l'autre. L'audit les refuse ; autant les
// désigner d'emblée plutôt que laisser l'auteur buter dessus.
const overlap = (left, right) => {
  const a = new Set(tokens(left).split(" ").filter(Boolean));
  const b = new Set(tokens(right).split(" ").filter(Boolean));
  const smallest = Math.min(a.size, b.size);
  if (smallest < 2) return 0;
  return [...a].filter((token) => b.has(token)).length / smallest;
};
const redundantPairs = (items) => {
  const pairs = [];
  for (let left = 0; left < items.length; left += 1) {
    for (let right = left + 1; right < items.length; right += 1) {
      if (items[left].is_correct !== items[right].is_correct) continue;
      const couple = `${items[left].lettre}/${items[right].lettre}`;
      if (overlap(items[left].enonce, items[right].enonce) >= 0.8) pairs.push(couple);
      else if (overlap(items[left].justification, items[right].justification) >= 0.8) pairs.push(`${couple} (justification)`);
    }
  }
  return pairs;
};

const sortLetters = (list) => list.slice().sort((a, b) => a.lettre.localeCompare(b.lettre));
const baseline = local.map((question, index) => {
  if (!isFused(question)) {
    return { source: 'local', enonce: question.enonce, items: sortLetters(question.items || []) };
  }
  const original = sortLetters(itemsByQuestion.get(remote[index].id) || []);
  return { source: 'restauré-distant', enonce: remote[index].enonce, items: original };
});
const restored = baseline.filter((entry) => entry.source === 'restauré-distant').length;

// --- Profils cibles sur la base saine --------------------------------------
const current = baseline.map((entry) => entry.items.reduce((mask, item, bit) => mask | (item.is_correct ? (1 << bit) : 0), 0));
const repaired = repairDiversity(assignMasks(current, targetMasks(numero)), current);
const assigned = repaired.masks;

let cursor = 0;
const serieOf = [];
SERIES_SIZES.forEach((size, index) => { for (let k = 0; k < size; k += 1) serieOf[cursor++] = index + 1; });

const plan = baseline.map((entry, index) => {
  const target = maskLetters(assigned[index]);
  const flips = entry.items
    .map((item, bit) => ({ item, bit }))
    .filter(({ item, bit }) => Boolean(assigned[index] & (1 << bit)) !== Boolean(item.is_correct))
    .map(({ item }) => ({ lettre: item.lettre, de: item.is_correct ? 'juste' : 'faux', vers: item.is_correct ? 'faux' : 'juste' }));
  return {
    question: index + 1,
    serie: serieOf[index],
    baseline: entry.source,
    enonce: entry.enonce,
    correction_generale: local[index].correction_generale,
    profilActuel: maskLetters(current[index]),
    profilCible: target,
    aReecrire: flips,
    redondancesAResoudre: redundantPairs(entry.items),
    propositions: entry.items.map((item) => ({ lettre: item.lettre, juste: item.is_correct, enonce: item.enonce, justification: item.justification })),
  };
});

const brief = {
  chapitre: numero,
  titre: course.title,
  module: `scripts/anesthesie-courses/chapter-${String(numero).padStart(2, '0')}.mjs`,
  questionsARestaurer: restored,
  penaliteDiversite: repaired.penalty,
  propositionsAReecrire: plan.reduce((sum, entry) => sum + entry.aReecrire.length, 0),
  questionsInchangees: plan.filter((entry) => entry.baseline === 'local' && !entry.aReecrire.length).length,
  questionsAvecRedondance: plan.filter((entry) => entry.redondancesAResoudre.length).length,
  cardinalitesCibles: Object.fromEntries([1, 2, 3, 4, 5].map((count) => [count, plan.filter((entry) => entry.profilCible.length === count).length])),
  lettresCibles: Object.fromEntries([...'ABCDE'].map((letter) => [letter, plan.filter((entry) => entry.profilCible.includes(letter)).length])),
  plan,
};
const outputPath = join(CORPUS, `brief-rebalance-ch${String(numero).padStart(2, '0')}.json`);
writeFileSync(outputPath, `${JSON.stringify(brief, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({
  chapitre: numero,
  brief: outputPath,
  questionsARestaurer: restored,
  propositionsAReecrire: brief.propositionsAReecrire,
  questionsInchangees: brief.questionsInchangees,
  penaliteDiversite: repaired.penalty,
  cardinalitesCibles: brief.cardinalitesCibles,
  lettresCibles: brief.lettresCibles,
}, null, 2));

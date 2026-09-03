/**
 * Rewrites the learner-facing stems for the first 44 Orthopedie courses.
 *
 * The source-derived items and their correctness are deliberately retained.
 * Only the question wrapper changes: isolated quoted fragments and template
 * prompts are turned into a concrete consultation, operating-room or follow-up
 * decision.  Each replacement has an immutable snapshot and uses the central
 * atomic publisher.
 *
 * Usage: node scripts/normalize-natural-questions-001-044.mjs [--limit N] [--skip N]
 */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { config as dotenv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv({ path: '.env.local' });
const repo = process.cwd();
const corpus = resolve(repo, '..', '.corpus-orthopedie');
const outputRoot = join(corpus, 'natural-question-repair-001-044');
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const args = process.argv.slice(2);
const numberArg = (flag, fallback) => {
  const index = args.indexOf(flag);
  return index < 0 ? fallback : Number(args[index + 1]);
};
const limit = numberArg('--limit', Infinity);
const skip = numberArg('--skip', 0);
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const plain = (value) => String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const normalized = (value) => plain(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const lowerFirst = (value) => value ? `${value.charAt(0).toLowerCase()}${value.slice(1)}` : value;
const titleContext = (title) => lowerFirst(plain(title).replace(/\s*:\s*.*/, '').replace(/\.$/, ''));

// Mirrors the strict production audit and makes a bad prompt impossible to
// send to the publisher.  The check is intentionally on the outgoing text,
// not only on the already-published database version.
const forbidden = /\bquelle conduite est (?:correcte|appropri[eé]e) concernant\b|\bquelle (?:proposition|affirmation) est exacte concernant\b|^(?:concernant|a propos de)\s+[«“"][^»”"]{3,}[»”"]|[«“"][^»”"]{3,}[»”"]\s*\?\s*$|\b(?:quel|quelle) (?:principe|rep[eè]re) (?:faut[- ]il|doit[- ]on|est) (?:retenir|conna[iî]tre|appliquer)\b|\b(?:question|nouvel\s+element)\s*:\s*|\b(?:dans|selon|au regard du|a partir du)\s+(?:ce\s+)?(?:sous[- ]theme|cours|chapitre|corpus)\b|\bce\s+(?:cours|chapitre|corpus)\b|\bqcm\s*[—–-]?\s*serie\s*\d+/i;
const artificialCard = /temps technique d[eé]crit dans le corpus|parmi les propositions suivantes[, ]+laquelle|quel rep[eè]re technique|quelle conduite est correcte concernant|^concernant\b|quelle proposition est exacte|\bquel principe\b|\bquel rep[eè]re\b|[«»]|^(?:en quoi consiste|a quoi sert|à quoi sert|quels sont|quelles sont)\b/i;

function cardFront(raw) {
  const original = plain(raw);
  if (!artificialCard.test(normalized(original))) return original;
  let front = original
    .replace(/[«“”»]/g, '')
    .replace(/[?]+$/, '')
    .replace(/\bquel\s+principe\b/gi, 'principe')
    .replace(/\bquel\s+rep[eè]re\b/gi, 'repère')
    .replace(/^en quoi consiste\s+/i, '')
    .replace(/^(?:a|à) quoi sert(?:ent)?\s+/i, 'Rôle de ')
    .replace(/^quels? sont\s+/i, '')
    .replace(/^quelles? sont\s+/i, '')
    .replace(/^quelle\s+proposition\s+est\s+exacte\s+concernant\s+/i, '')
    .replace(/^concernant\s+/i, '')
    .replace(/\s{2,}/g, ' ').trim();
  // A terse interrogative prompt becomes a nominative, card-friendly concept.
  if (/^(quel|quelle|quels|quelles)\b/i.test(front)) front = front.replace(/^(quel|quelle|quels|quelles)\s+/i, 'Éléments à connaître : ');
  return front ? `${front.charAt(0).toUpperCase()}${front.slice(1)}` : 'Notion technique à connaître';
}

function conceptFrom(raw) {
  let text = plain(raw)
    .replace(/[«“”»]/g, '')
    .replace(/^\s*(?:question|nouvel\s+[ée]l[ée]ment)\s*:\s*/i, '')
    .replace(/^\s*(?:dans|a propos de|à propos de)\s+/i, '')
    .replace(/^\s*quelle\s+(?:conduite|proposition|affirmation)\s+est\s+(?:correcte|exacte|appropriée)\s+concernant\s+/i, '')
    .replace(/^\s*retenir\s+la\s+proposition\s+exacte\s+concernant\s+/i, '')
    .replace(/^\s*(?:quelles?\s+propositions?\s+(?:sont|est)\s+(?:exactes?|correctes?)|quelle\(s\)\s+proposition\(s\)\s+est\s+\(sont\)\s+exacte\(s\))\s*(?:\?|$)/i, '')
    .replace(/\s*[?.]+\s*$/, '')
    .replace(/\bquelle\(s\)\s+proposition\(s\)\s+est\s+\(sont\)\s+exacte\(s\)\s*$/i, '')
    .replace(/\bquelles?\s+(?:propositions?|affirmations?)\s+(?:sont|est)\s+(?:exactes?|correctes?)\s*$/i, '')
    .replace(/^\s*(?:parmi\s+[^,]+,\s*)?(?:lesquelles?|lequel|laquelle)\s*(?:sont|est)?\s*/i, '')
    .replace(/\s{2,}/g, ' ').trim();
  // Avoid a second, inherited "Concernant" after a former wrapper.
  text = text.replace(/^concernant\s+/i, '').trim();
  text = text.replace(/\bquel\s+principe\b/gi, 'quelle règle technique');
  text = text.replace(/\bquel\s+rep[eè]re\b/gi, 'quelle référence anatomique');
  text = text.replace(/\bquelle\s+(?:proposition|affirmation)\s+est\s+exacte\b/gi, 'quelles données sont exactes');
  return text || 'la décision à prendre';
}

function settingFor(concept, title, index) {
  const c = normalized(concept);
  const domain = titleContext(title);
  if (/postoperatoire|reeducation|surveillance|suivi|controle/.test(c)) return `Lors du suivi d’un patient après ${domain}`;
  if (/installation|voie d.?abord|abord |incision|peroperatoire|geste|technique|implant|montage|vis |plaque|clou/.test(c)) return `Au bloc, pendant ${domain}`;
  if (/imagerie|radiographie|irm|scanner|tomodensitometr|bilan/.test(c)) return `Au bilan d’un patient pris en charge pour ${domain}`;
  if (/indication|contre.indication|choix|decision|strategie/.test(c)) return `Devant un patient relevant de ${domain}`;
  if (/urgence|complication|risque|infection|deficit|douleur/.test(c)) return `Lors de l’évaluation d’un patient pris en charge pour ${domain}`;
  const leads = [
    `En consultation préopératoire pour ${domain}`,
    `Avant de planifier ${domain}`,
    `Chez un patient pris en charge pour ${domain}`,
    `Lors de la discussion thérapeutique autour de ${domain}`,
  ];
  return leads[index % leads.length];
}

function qcmStem(raw, title, index) {
  const concept = conceptFrom(raw);
  const lead = settingFor(concept, title, index);
  const c = lowerFirst(concept);
  const n = normalized(concept);
  if (/^quel(?:le|s)?\b|^comment\b|^pourquoi\b|^a quel\b|^à quel\b|^combien\b/.test(n)) return `${lead}, ${c} ?`;
  if (/definition|anatomie|morphologie|classification|physiopathologie|histoire naturelle|nosologie/.test(n)) return `${lead}, quels éléments permettent de caractériser ${c} ?`;
  if (/indication|contre.indication|criter/.test(n)) return `${lead}, quels critères doivent guider ${c} ?`;
  if (/installation|voie d.?abord|abord |incision|technique|geste|implant|montage/.test(n)) return `${lead}, quelles précautions doivent guider ${c} ?`;
  if (/imagerie|radiographie|irm|scanner|bilan/.test(n)) return `${lead}, quelles données sont utiles pour ${c} ?`;
  if (/complication|risque|surveillance|suivi|reeducation/.test(n)) return `${lead}, quels points de vigilance concernent ${c} ?`;
  const endings = [
    `quels éléments doivent être retenus pour ${c} ?`,
    `quelles propositions décrivent correctement ${c} ?`,
    `quelles données aident à raisonner devant ${c} ?`,
    `quelles mesures sont adaptées pour ${c} ?`,
  ];
  return `${lead}, ${endings[index % endings.length]}`;
}

function dpStem(raw, title, seriesIndex, questionIndex) {
  const concept = conceptFrom(raw);
  const c = lowerFirst(concept);
  const n = normalized(concept);
  const phases = [
    'À l’évaluation initiale',
    'Une fois le bilan disponible',
    'Au moment de choisir la stratégie',
    'Pendant l’intervention',
    'Après le geste',
    'Lors du premier contrôle',
  ];
  const lead = phases[Math.max(0, questionIndex - 1)] || 'Au cours du suivi';
  if (/^quel(?:le|s)?\b|^comment\b|^pourquoi\b|^a quel\b|^à quel\b|^combien\b/.test(n)) return `${lead}, ${c} ?`;
  if (/imagerie|radiographie|irm|scanner|bilan/.test(n)) return `${lead}, quelles informations sont nécessaires pour ${c} ?`;
  if (/indication|contre.indication|criter|strategie|choix/.test(n)) return `${lead}, quels critères conduisent à retenir ${c} ?`;
  if (/complication|risque|surveillance|suivi|reeducation/.test(n)) return `${lead}, quels éléments doivent faire réévaluer ${c} ?`;
  const endings = [
    `quelle décision est la plus adaptée pour ${c} ?`,
    `quels éléments doivent guider ${c} ?`,
    `quelle conduite pratique doit être privilégiée pour ${c} ?`,
  ];
  return `${lead}, ${endings[(seriesIndex + questionIndex) % endings.length]}`;
}

function topicFrom(label, kind, title) {
  const trimmed = plain(label)
    .replace(new RegExp(`^${kind}\\s*(?:serie\\s*)?\\d+\\s*[·:—–-]*\\s*`, 'i'), '')
    .replace(/^serie\s*\d+\s*[·:—–-]*\s*/i, '').trim();
  return trimmed || title;
}

const worklist = JSON.parse(readFileSync(join(corpus, 'worklist.json'), 'utf8'));
const worklistById = new Map(worklist.map((entry) => [entry.coursId, entry]));
const { data: allCourses, error: courseError } = await supabase.from('cours').select('id,order_index,titre').eq('matiere_id', 'col-orthopedie').gte('order_index', 1).lte('order_index', 44).order('order_index');
if (courseError) throw courseError;
if (allCourses.length !== 44) throw new Error(`Périmètre inattendu: ${allCourses.length} cours`);
const courses = allCourses.slice(skip, skip + limit);
mkdirSync(outputRoot, { recursive: true });
const results = [];

for (const course of courses) {
  const entry = worklistById.get(course.id);
  if (!entry?.slug || entry.coursId !== course.id) throw new Error(`Triplet de publication absent pour ${course.id}`);
  const { data: series, error: seriesError } = await supabase.from('qcm_series').select('id,type,kind,label,vignette,order_index').eq('cours_id', course.id).eq('type', 'qcm').order('order_index');
  if (seriesError) throw seriesError;
  const ids = (series || []).map((serie) => serie.id);
  const { data: questions, error: questionError } = ids.length ? await supabase.from('qcm_questions').select('id,serie_id,enonce,order_index,correction_generale').in('serie_id', ids).order('order_index') : { data: [], error: null };
  if (questionError) throw questionError;
  const questionIds = (questions || []).map((question) => question.id);
  const { data: items, error: itemError } = questionIds.length ? await supabase.from('qcm_items').select('id,question_id,lettre,enonce,is_correct,justification').in('question_id', questionIds).order('lettre') : { data: [], error: null };
  if (itemError) throw itemError;
  const { data: flashcards, error: cardError } = await supabase.from('flashcards').select('id,recto,verso,order_index').eq('cours_id', course.id).order('order_index');
  if (cardError) throw cardError;
  if (series.length !== 16 || questions.length !== 96 || items.length !== 480 || flashcards.length < 100 || flashcards.length > 200) throw new Error(`${course.order_index}: contenu incomplet; publication annulée`);

  const snapshot = { version: 1, createdAt: new Date().toISOString(), course, series, questions, items, flashcards };
  const source = `${JSON.stringify(snapshot, null, 2)}\n`;
  const dir = join(outputRoot, `${String(course.order_index).padStart(3, '0')}-${entry.slug}`, 'delivery', stamp, 'published-before-natural-question-repair');
  mkdirSync(dir, { recursive: true });
  const snapshotPath = join(dir, 'snapshot.json');
  const manifestPath = join(dir, 'manifest.json');
  writeFileSync(snapshotPath, source, 'utf8');
  writeFileSync(manifestPath, `${JSON.stringify({ courseId: course.id, slug: entry.slug, orderIndex: course.order_index, createdAt: snapshot.createdAt, sha256: createHash('sha256').update(source).digest('hex'), counts: { series: series.length, questions: questions.length, items: items.length, flashcards: flashcards.length } }, null, 2)}\n`, 'utf8');

  const questionsBySeries = new Map();
  for (const question of questions) questionsBySeries.set(question.serie_id, [...(questionsBySeries.get(question.serie_id) || []), question]);
  const itemsByQuestion = new Map();
  for (const item of items) itemsByQuestion.set(item.question_id, [...(itemsByQuestion.get(item.question_id) || []), { lettre: item.lettre, enonce: item.enonce, is_correct: item.is_correct, justification: item.justification }]);
  let changed = 0;
  const payloadSeries = series.map((serie, seriesIndex) => {
    const isDp = serie.kind === 'dp' || /^DP\b/i.test(serie.label);
    const kind = isDp ? 'DP' : 'QCM';
    const label = isDp ? `DP ${serie.order_index - 8} — ${topicFrom(serie.label, kind, course.titre)}` : `QCM — ${topicFrom(serie.label, kind, course.titre)}`;
    const mapped = (questionsBySeries.get(serie.id) || []).map((question, questionIndex) => {
      const enonce = isDp ? dpStem(question.enonce, course.titre, seriesIndex, questionIndex) : qcmStem(question.enonce, course.titre, questionIndex + seriesIndex * 5);
      if (enonce !== plain(question.enonce)) changed += 1;
      return { enonce, correction_generale: question.correction_generale || '', items: itemsByQuestion.get(question.id) || [] };
    });
    return { label, vignette: serie.vignette || '', questions: mapped };
  });
  const outgoing = payloadSeries.flatMap((serie) => serie.questions.map((question) => question.enonce));
  const invalid = outgoing.filter((stem) => forbidden.test(normalized(stem)) || /[«“”»]/.test(stem) || !/\?$/.test(stem));
  if (invalid.length) throw new Error(`${course.order_index}: ${invalid.length} énoncé(s) rejeté(s) avant publication: ${invalid[0]}`);
  const outputCards = flashcards.map((card) => ({ recto: cardFront(card.recto), verso: card.verso }));
  const cardChanges = outputCards.filter((card, index) => card.recto !== flashcards[index].recto).length;
  const invalidCards = outputCards.filter((card) => artificialCard.test(normalized(card.recto)) || /[«»]/.test(card.recto));
  if (invalidCards.length) throw new Error(`${course.order_index}: ${invalidCards.length} recto(s) encore artificiel(s): ${invalidCards[0].recto}`);
  const chapter = { title: course.titre, provenance: { sourceOnly: true, snapshot: snapshotPath, note: 'Réécriture éditoriale des énoncés et des rectos artificiels; items et justifications conservés.' }, flashcards: outputCards, series: payloadSeries };
  const chapterPath = join(dir, 'chapter-natural-questions.json');
  writeFileSync(chapterPath, `${JSON.stringify(chapter, null, 2)}\n`, 'utf8');
  execFileSync(process.execPath, ['_ins-chapter.mjs', course.id, chapterPath, '--replace', '--snapshot', manifestPath], { cwd: repo, stdio: 'pipe' });
  const auditPath = join(dir, 'audit-after-publication.json');
  execFileSync(process.execPath, ['_audit-orthopedie-production.mjs', auditPath, course.id], { cwd: repo, stdio: 'pipe' });
  const audit = JSON.parse(readFileSync(auditPath, 'utf8')).rows[0];
  if (audit.templateQuestionCount !== 0 || audit.genericQuestionCount !== 0 || audit.studentScaffolding !== 0 || audit.dpClinicalFailures !== 0) throw new Error(`${course.order_index}: contrôle post-publication invalide`);
  results.push({ orderIndex: course.order_index, coursId: course.id, slug: entry.slug, title: course.titre, changed, cardChanges, snapshot: snapshotPath, audit: { templateQuestionCount: audit.templateQuestionCount, genericQuestionCount: audit.genericQuestionCount, studentScaffolding: audit.studentScaffolding, dpClinicalFailures: audit.dpClinicalFailures, defects: audit.defects } });
  console.log(`OK ${course.order_index}/44 ${entry.slug}: ${changed} énoncés et ${cardChanges} rectos réécrits`);
}
const report = { generatedAt: new Date().toISOString(), scope: 'cours.order_index 1..44', planned: courses.length, completed: results.length, totalRewritten: results.reduce((sum, row) => sum + row.changed, 0), results };
const reportPath = join(outputRoot, `report-${stamp}.json`);
writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`REPORT ${reportPath}`);

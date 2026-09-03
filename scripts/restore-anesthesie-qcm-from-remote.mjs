#!/usr/bin/env node
// Restauration locale de secours depuis la banque publiée. Supabase est lu
// uniquement ; l'écriture vise un seul module chapitre et exige --write.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const ROOT = resolve(import.meta.dirname, '..');
const CORPUS = join(ROOT, '.corpus-anesthesie-reanimation');
const numero = Number(process.argv.find((arg) => /^--chapter=/.test(arg))?.split('=')[1]);
const write = process.argv.includes('--write');
if (!Number.isInteger(numero) || numero < 1 || numero > 43) {
  throw new Error('Usage : node scripts/restore-anesthesie-qcm-from-remote.mjs --chapter=NN [--write]');
}

config({ path: join(ROOT, '.env.local') });
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Configuration Supabase absente.');
}
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
const nn = String(numero).padStart(2, '0');
const modulePath = join(ROOT, 'scripts', 'anesthesie-courses', `chapter-${nn}.mjs`);
const extract = JSON.parse(readFileSync(join(course.chapterDir, 'extract.json'), 'utf8'));
const module = await import(`${pathToFileURL(modulePath).href}?restore=${Date.now()}`);
const builder = module[`buildChapter${nn}`] || module.default;
const local = await builder(extract);
const localQuestions = local.series.flatMap((serie) => serie.questions || []).filter((question) => question.format === 'qcm');

const series = await must(
  db.from('qcm_series').select('id,label,vignette,order_index').eq('cours_id', course.courseId).eq('type', 'qcm').gte('order_index', 1).lte('order_index', 16).order('order_index'),
  'Lecture séries QCM',
);
if (series.length !== 16) throw new Error(`Structure distante inattendue : ${series.length}/16 séries.`);
const questions = await must(
  db.from('qcm_questions').select('id,serie_id,enonce,order_index,format,correction_generale').in('serie_id', series.map((entry) => entry.id)).eq('format', 'qcm').order('order_index'),
  'Lecture questions QCM',
);
const items = await must(
  db.from('qcm_items').select('question_id,lettre,enonce,is_correct,justification').in('question_id', questions.map((entry) => entry.id)).order('lettre'),
  'Lecture propositions QCM',
);

const questionsBySeries = new Map(series.map((entry) => [entry.id, []]));
for (const question of questions) questionsBySeries.get(question.serie_id)?.push(question);
const itemsByQuestion = new Map(questions.map((entry) => [entry.id, []]));
for (const item of items) itemsByQuestion.get(item.question_id)?.push(item);
const remoteQuestions = series.flatMap((serie) => (questionsBySeries.get(serie.id) || [])
  .sort((left, right) => left.order_index - right.order_index)
  .map((question) => ({
    ...question,
    items: (itemsByQuestion.get(question.id) || []).sort((left, right) => left.lettre.localeCompare(right.lettre)),
  })));
if (remoteQuestions.length !== 96 || items.length !== 480 || localQuestions.length !== 96) {
  throw new Error(`Structure 96/480 invalide : distant ${remoteQuestions.length}/${items.length}, local ${localQuestions.length}.`);
}

const source = readFileSync(modulePath, 'utf8');
const calls = [];
const matcher = /\bqcm\(/g;
let match;
while ((match = matcher.exec(source))) {
  let depth = 1;
  let quote = null;
  let escaped = false;
  let end = -1;
  for (let index = matcher.lastIndex; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'" || char === '`') { quote = char; continue; }
    if (char === '(') depth += 1;
    if (char === ')') depth -= 1;
    if (depth === 0) { end = index + 1; break; }
  }
  if (end < 0) throw new Error(`Appel qcm non fermé à l'offset ${match.index}.`);
  calls.push({ start: match.index, end });
  matcher.lastIndex = end;
}
if (calls.length !== 96) throw new Error(`Module local : ${calls.length} appels qcm au lieu de 96.`);

const literal = (value) => JSON.stringify(String(value ?? ''));
// L'énoncé distant contient déjà la nouvelle information ; le helper qcm() la
// repréfixe. On retire ce préfixe pour éviter de dupliquer la phrase.
const stripNewInformation = (enonce, newInformation) => {
  const info = String(newInformation || '').trim();
  if (!info) return enonce;
  const text = String(enonce || '').trim();
  return text.startsWith(info) ? text.slice(info.length).trim() : text;
};

const replacement = (remote, localQuestion, call) => {
  const lineStart = source.lastIndexOf('\n', call.start) + 1;
  const indent = source.slice(lineStart, call.start);
  const inner = `${indent}  `;
  const itemIndent = `${inner}  `;
  const args = [
    literal(stripNewInformation(remote.enonce, localQuestion.newInformation)),
    `src(${(localQuestion.sourceBlocks || []).map(literal).join(', ')})`,
    literal(remote.correction_generale),
    `[\n${remote.items.map((item) => `${itemIndent}${item.is_correct ? 'T' : 'F'}(${literal(item.enonce)}, ${literal(item.justification)})`).join(',\n')}\n${inner}]`,
  ];
  if (localQuestion.newInformation) args.push(literal(localQuestion.newInformation));
  return `qcm(\n${args.map((arg) => `${inner}${arg}`).join(',\n')}\n${indent})`;
};

let restored = source;
for (let index = calls.length - 1; index >= 0; index -= 1) {
  const call = calls[index];
  restored = `${restored.slice(0, call.start)}${replacement(remoteQuestions[index], localQuestions[index], call)}${restored.slice(call.end)}`;
}
const snapshotPath = join(CORPUS, `qcm-remote-baseline-ch${nn}.json`);
writeFileSync(snapshotPath, `${JSON.stringify({ capturedAt: new Date().toISOString(), courseId: course.courseId, series, questions: remoteQuestions }, null, 2)}\n`, 'utf8');
if (write) writeFileSync(modulePath, restored, 'utf8');
console.log(JSON.stringify({ chapter: numero, remoteReadOnly: true, questions: remoteQuestions.length, items: items.length, snapshotPath, modulePath, written: write }, null, 2));

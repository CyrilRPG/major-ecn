/**
 * Removes authoring scaffolding from learner-facing Orthopedie QCM/DP text.
 *
 * Scope is intentionally DB order_index 70..133, never the alphabetical
 * corpus worklist.  Each course is snapshotted then published through the
 * transactional RPC: no fiche, image, flashcard or item text is altered.
 *
 * Usage: node scripts/normalize-orthopedie-question-language-070-133.mjs
 */
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { config as dotenv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const root = resolve('.corpus-orthopedie', 'language-normalization-070-133');
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const plain = (value) => String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const normalize = (value) => plain(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const escapeName = (title) => normalize(title).replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 70);
// `au cours de la journée` is legitimate French. Only a reference to the
// teaching material is a learner-facing scaffold.
const forbidden = /\b(?:question|nouvel\s+element)\s*:\s*|\b(?:dans|selon|au regard du|a partir du)\s+(?:ce\s+)?(?:sous[- ]theme|cours|chapitre|corpus)\b|\bce\s+(?:cours|chapitre|corpus)\b|\bqcm\s*[—–-]?\s*serie\s*\d+/i;

function topicFrom(label, courseTitle, kind) {
  let topic = plain(label)
    .replace(new RegExp(`^${kind}\\s*(?:[—–-]\\s*)?(?:s[ée]rie\\s*)?\\d+\\s*(?:[·:—–-]\\s*)?`, 'i'), '')
    .replace(/^s[ée]rie\s*\d+\s*(?:[·:—–-]\s*)?/i, '')
    .trim();
  topic = topic.replace(/^(?:le |la |les )?(?:cours|chapitre)\s+(?:sur|de)\s+/i, '').trim();
  return topic || courseTitle;
}

function removeScaffolding(text, isDp, index) {
  let stem = plain(text);
  // Labels sometimes precede a complete question, sometimes a data update.
  stem = stem.replace(/^\s*question\s*:\s*/i, '');
  stem = stem.replace(/\s+question\s*:\s*/ig, ' ');
  stem = stem.replace(/^\s*nouvel\s+[ée]l[ée]ment\s*:\s*/i, '');
  stem = stem.replace(/\s+nouvel\s+[ée]l[ée]ment\s*:\s*/ig, ' ');
  stem = stem.replace(/^\s*(?:dans\s+ce\s+dossier|dans\s+cette\s+situation(?:\s+clinique)?)\s*,?\s*/i, '');
  // Remove the generator's heading before the real question, retaining the
  // wording after its colon.  The bounded quotation protects medical colons.
  stem = stem.replace(/^\s*dans\s+le\s+sous[- ]th[èe]me\s+[«\"'][^«»\"']{1,220}[»\"']\s*,?\s*(?:quelle[^:]{0,220})?\s*:\s*/i, '');
  stem = stem.replace(/^\s*(?:dans|selon)\s+(?:ce\s+)?(?:cours|chapitre|corpus)\s*,?\s*/i, '');
  stem = stem.replace(/^\s*(?:au\s+regard|à\s+partir)\s+du\s+(?:cours|chapitre|corpus)\s*,?\s*/i, '');
  stem = stem.replace(/\b(?:dans le )?(?:sous[- ]th[èe]me|cours|chapitre|corpus)\s+[«\"'][^«»\"']{1,220}[»\"']\s*,?\s*/ig, '');
  stem = stem.replace(/\bQCM\s*[—–-]?\s*s[ée]rie\s*\d+\s*(?:[·:—–-]\s*)?/ig, '');
  stem = stem.replace(/^\s*[:—–-]+\s*/, '').replace(/\s{2,}/g, ' ').trim();
  // A later DP step needs no visible label: the proposition itself is the
  // clinical update/question and is already tied to the vignette.
  if (isDp && index > 0 && /^[a-zàâçéèêëîïôûùüÿñæœ]/.test(stem)) stem = `${stem.charAt(0).toUpperCase()}${stem.slice(1)}`;
  return stem;
}

const { data: courses, error: courseError } = await supabase
  .from('cours').select('id,order_index,titre').eq('matiere_id', 'col-orthopedie')
  .gte('order_index', 70).lte('order_index', 133).order('order_index');
if (courseError) throw courseError;
if (courses.length !== 64) throw new Error(`Périmètre DB inattendu : ${courses.length} cours (attendu 64)`);
mkdirSync(root, { recursive: true });
const results = [];

for (const course of courses) {
  const { data: series, error: seriesError } = await supabase
    .from('qcm_series').select('id,type,kind,label,vignette,order_index,created_at')
    .eq('cours_id', course.id).eq('type', 'qcm').order('order_index');
  if (seriesError) throw seriesError;
  const seriesIds = (series || []).map((serie) => serie.id);
  const { data: questions, error: questionError } = seriesIds.length
    ? await supabase.from('qcm_questions').select('id,serie_id,enonce,order_index,format,reponse_attendue,correction_generale').in('serie_id', seriesIds).order('order_index')
    : { data: [], error: null };
  if (questionError) throw questionError;
  const questionIds = (questions || []).map((question) => question.id);
  const { data: items, error: itemError } = questionIds.length
    ? await supabase.from('qcm_items').select('id,question_id,lettre,enonce,is_correct,justification').in('question_id', questionIds).order('lettre')
    : { data: [], error: null };
  if (itemError) throw itemError;
  const { data: flashcards, error: cardError } = await supabase
    .from('flashcards').select('id,recto,verso,order_index').eq('cours_id', course.id).order('order_index');
  if (cardError) throw cardError;

  const snapshot = { version: 1, createdAt: new Date().toISOString(), course, series, questions, items, flashcards };
  const serialized = `${JSON.stringify(snapshot, null, 2)}\n`;
  const snapshotDir = join(root, `${String(course.order_index).padStart(3, '0')}-${escapeName(course.titre)}`, 'delivery', stamp, 'published-before-replacement');
  mkdirSync(snapshotDir, { recursive: true });
  writeFileSync(join(snapshotDir, 'snapshot.json'), serialized, 'utf8');
  const manifestPath = join(snapshotDir, 'manifest.json');
  writeFileSync(manifestPath, `${JSON.stringify({ courseId: course.id, orderIndex: course.order_index, createdAt: snapshot.createdAt, sha256: createHash('sha256').update(serialized).digest('hex'), counts: { series: series.length, questions: questions.length, items: items.length, flashcards: flashcards.length } }, null, 2)}\n`, 'utf8');

  const itemsByQuestion = new Map();
  for (const item of items || []) itemsByQuestion.set(item.question_id, [...(itemsByQuestion.get(item.question_id) || []), { lettre: item.lettre, enonce: item.enonce, is_correct: item.is_correct, justification: item.justification }]);
  const questionsBySeries = new Map();
  for (const question of questions || []) questionsBySeries.set(question.serie_id, [...(questionsBySeries.get(question.serie_id) || []), question]);
  let changed = 0;
  const payloadSeries = (series || []).map((serie) => {
    const isDp = /^DP\b/i.test(serie.label || '') || serie.kind === 'dp';
    const kind = isDp ? 'DP' : 'QCM';
    const label = isDp
      ? `DP ${serie.order_index > 8 ? serie.order_index - 8 : 1} — ${topicFrom(serie.label, course.titre, kind)}`
      : `QCM — ${topicFrom(serie.label, course.titre, kind)}`;
    const mappedQuestions = (questionsBySeries.get(serie.id) || []).map((question, index) => {
      const enonce = removeScaffolding(question.enonce, isDp, index);
      if (!enonce) throw new Error(`${course.order_index} ${course.titre} : énoncé vidé (${serie.label} Q${index + 1})`);
      if (enonce !== plain(question.enonce)) changed += 1;
      return { enonce, correction_generale: question.correction_generale || '', items: itemsByQuestion.get(question.id) || [] };
    });
    return { label, vignette: serie.vignette || '', questions: mappedQuestions };
  });
  const payload = { series: payloadSeries, flashcards: (flashcards || []).map((card) => ({ recto: card.recto, verso: card.verso })), thin: false };
  const bad = payloadSeries.flatMap((serie) => serie.questions.map((question) => question.enonce).filter((enonce) => forbidden.test(normalize(enonce))));
  if (bad.length) throw new Error(`${course.order_index} ${course.titre} : ${bad.length} énoncé(s) encore scaffoldés : ${bad[0]}`);
  if (payloadSeries.length !== 16 || payloadSeries.reduce((sum, serie) => sum + serie.questions.length, 0) !== 96 || (items || []).length !== 480 || (flashcards || []).length < 100 || (flashcards || []).length > 200) {
    throw new Error(`${course.order_index} ${course.titre} : paquet incomplet, publication annulée`);
  }
  const { data: published, error: publishError } = await supabase.rpc('replace_cours_generated_content', { p_cours_id: course.id, p_payload: payload, p_replace: true });
  if (publishError) throw new Error(`${course.order_index} ${course.titre} : ${publishError.message}`);
  results.push({ orderIndex: course.order_index, coursId: course.id, title: course.titre, changed, snapshot: manifestPath, published });
  console.log(`✔ ${course.order_index}/133 — ${course.titre} (${changed} énoncés normalisés)`);
}
const reportPath = join(root, `report-${stamp}.json`);
writeFileSync(reportPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), scope: 'cours.order_index 70..133', results }, null, 2)}\n`, 'utf8');
console.log(`Rapport : ${reportPath}`);

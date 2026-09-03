/**
 * Targeted, source-only repair for Orthopédie #48.
 * It snapshots the live bank, keeps all items/corrections/cards unchanged and
 * replaces only the mechanical question stems with clinical examination text.
 */
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { config as dotenv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const courseId = '372ee601-0721-40ae-8b4f-f957818dbb51';
const slug = 'extension-au-pelvis-des-osteosyntheses-rachidiennes';
dotenv({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const plain = (value) => String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const stemTopic = (value, fallback) => {
  const text = plain(value).replace(/[?\s]+$/, '');
  const tail = text.split(/\s*:\s*/).at(-1) || text;
  const match = /\b(?:d[ée]crit|caract[ée]rise|retenir|concerne)\s+(.+?)(?:\s+[—–-]\s+|$)/i.exec(tail);
  const topic = (match?.[1] || tail)
    .replace(/^(?:quel|quelle|quels|quelles|comment|pourquoi|dans quel contexte)\b[^\s]*\s*/i, '')
    .replace(/^(?:la |le |les |des |de |du |d')/i, '')
    .replace(/\s+[—–-]\s+.*$/, '')
    .trim();
  return topic && topic.length <= 115 ? topic : fallback;
};
const qcmStem = (topic, index) => [
  `Quelle proposition est exacte au sujet de « ${topic} » ?`,
  `À propos de « ${topic} », quelle affirmation est correcte ?`,
  `Quel énoncé est juste à propos de « ${topic} » ?`,
  `Que faut-il retenir de « ${topic} » ?`,
  `Quelle proposition est correcte au sujet de « ${topic} » ?`,
][index % 5];
const dpStem = (topic, index) => [
  `Chez ce patient, quelle proposition est exacte au sujet de « ${topic} » ?`,
  `Lors de la planification opératoire, quel élément doit guider la décision au sujet de « ${topic} » ?`,
  `Pendant l’intervention, quelle proposition est correcte au sujet de « ${topic} » ?`,
  `Après le geste, que faut-il vérifier à propos de « ${topic} » ?`,
  `Au contrôle postopératoire, quelle proposition est exacte au sujet de « ${topic} » ?`,
  `Lors du suivi radioclinique, quel point doit être évalué à propos de « ${topic} » ?`,
  `En cas d’évolution défavorable, quelle conduite est la plus adaptée au sujet de « ${topic} » ?`,
][index];

const { data: course, error: courseError } = await supabase.from('cours').select('id,order_index,titre').eq('id', courseId).single();
if (courseError) throw courseError;
const { data: series, error: seriesError } = await supabase.from('qcm_series').select('id,type,kind,label,vignette,order_index').eq('cours_id', courseId).order('order_index');
if (seriesError) throw seriesError;
const seriesIds = series.map((serie) => serie.id);
const { data: questions, error: questionError } = await supabase.from('qcm_questions').select('id,serie_id,enonce,order_index,correction_generale').in('serie_id', seriesIds).order('order_index');
if (questionError) throw questionError;
const questionIds = questions.map((question) => question.id);
const { data: items, error: itemError } = await supabase.from('qcm_items').select('id,question_id,lettre,enonce,is_correct,justification').in('question_id', questionIds).order('lettre');
if (itemError) throw itemError;
const { data: flashcards, error: cardError } = await supabase.from('flashcards').select('id,recto,verso,order_index').eq('cours_id', courseId).order('order_index');
if (cardError) throw cardError;

if (series.length !== 16 || questions.length !== 96 || items.length !== 480 || flashcards.length < 100 || flashcards.length > 200) throw new Error('Paquet publié inattendu : remplacement annulé.');
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const directory = resolve('.corpus-orthopedie', slug, 'delivery', stamp, 'published-before-question-language-repair');
mkdirSync(directory, { recursive: true });
const snapshot = { version: 1, createdAt: new Date().toISOString(), course, series, questions, items, flashcards };
const snapshotText = `${JSON.stringify(snapshot, null, 2)}\n`;
writeFileSync(join(directory, 'snapshot.json'), snapshotText, 'utf8');
const manifest = { courseId, orderIndex: course.order_index, operation: 'question-language-only', sha256: createHash('sha256').update(snapshotText).digest('hex'), counts: { series: series.length, questions: questions.length, items: items.length, flashcards: flashcards.length } };
writeFileSync(join(directory, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

const itemsByQuestion = new Map();
for (const item of items) itemsByQuestion.set(item.question_id, [...(itemsByQuestion.get(item.question_id) || []), { lettre: item.lettre, enonce: item.enonce, is_correct: item.is_correct, justification: item.justification }]);
const questionsBySeries = new Map();
for (const question of questions) questionsBySeries.set(question.serie_id, [...(questionsBySeries.get(question.serie_id) || []), question]);
let changed = 0;
const payloadSeries = series.map((serie) => {
  const isDp = /^DP\b/i.test(serie.label || '') || serie.kind === 'dp';
  const fallback = plain(serie.label).replace(/^(?:QCM|DP)\s*\d*\s*[—–-]?\s*/i, '') || 'la fixation lombopelvienne';
  return {
    label: serie.label,
    vignette: serie.vignette || '',
    questions: (questionsBySeries.get(serie.id) || []).map((question, index) => {
      const topic = stemTopic(question.enonce, fallback);
      const enonce = isDp ? dpStem(topic, index) : qcmStem(topic, index);
      if (enonce === plain(question.enonce)) throw new Error(`Énoncé non transformé : ${serie.label} Q${index + 1}`);
      changed += 1;
      return { enonce, correction_generale: question.correction_generale || '', items: itemsByQuestion.get(question.id) || [] };
    }),
  };
});
const payload = { series: payloadSeries, flashcards: flashcards.map((card) => ({ recto: card.recto, verso: card.verso })), thin: false };
writeFileSync(join(directory, 'chapter.json'), `${JSON.stringify({ title: course.titre, provenance: { sourceOnly: true, note: 'Énoncés QCM/DP reformulés ; items, corrections et cartes inchangés.' }, ...payload }, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ directory, manifest: join(directory, 'manifest.json'), chapter: join(directory, 'chapter.json'), changed }));

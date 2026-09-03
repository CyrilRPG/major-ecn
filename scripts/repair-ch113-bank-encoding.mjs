/** Targeted bank-only mojibake repair for Orthopédie #113. */
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { config as dotenv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const courseId = '7da634d6-d13a-479e-a137-84c5abc10eb0';
const slug = 'traitement-chirurgical-du-spondylolisthesis-de-l-adulte';
dotenv({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

// This deliberately maps only known UTF-8-as-Windows-1252 signatures.  Whole
// document re-decoding would damage the many words that are already correct.
const replacements = new Map([
  ['Â ', ' '], ['Â°', '°'], ['Â±', '±'], ['Â·', '·'],
  ['Ã€', 'À'], ['Ã‚', 'Â'], ['Ã‡', 'Ç'], ['Ãˆ', 'È'], ['Ã‰', 'É'], ['ÃŠ', 'Ê'], ['ÃŽ', 'Î'], ['Ã”', 'Ô'], ['Ã™', 'Ù'],
  ['Ã ', 'à'], ['Ã¢', 'â'], ['Ã¤', 'ä'], ['Ã§', 'ç'], ['Ã¨', 'è'], ['Ã©', 'é'], ['Ãª', 'ê'], ['Ã«', 'ë'], ['Ã®', 'î'], ['Ã¯', 'ï'], ['Ã´', 'ô'], ['Ã¶', 'ö'], ['Ã¹', 'ù'], ['Ã»', 'û'], ['Ã¼', 'ü'], ['Ã¿', 'ÿ'],
  ['â€™', '’'], ['â€˜', '‘'], ['â€œ', '“'], ['â€', '”'], ['â€“', '–'], ['â€”', '—'], ['â€¦', '…'], ['â†’', '→'], ['â‰¤', '≤'], ['â‰¥', '≥'], ['â‰ˆ', '≈'],
]);
const mojibake = /(?:Ã[\u0080-\u00FF]|â[\u0080-\u00FF€]|�)/;
function repair(value) {
  let output = String(value || '');
  for (let pass = 0; pass < 3 && mojibake.test(output); pass += 1) {
    for (const [bad, good] of replacements) output = output.split(bad).join(good);
  }
  return output;
}

const { data: course, error: courseError } = await supabase.from('cours').select('id,order_index,titre').eq('id', courseId).single();
if (courseError) throw courseError;
const { data: series, error: seriesError } = await supabase.from('qcm_series').select('id,label,vignette,order_index,type,kind').eq('cours_id', courseId).order('order_index');
if (seriesError) throw seriesError;
const seriesIds = series.map((serie) => serie.id);
const { data: questions, error: questionError } = await supabase.from('qcm_questions').select('id,serie_id,enonce,correction_generale,order_index').in('serie_id', seriesIds).order('order_index');
if (questionError) throw questionError;
const questionIds = questions.map((question) => question.id);
const { data: items, error: itemError } = await supabase.from('qcm_items').select('id,question_id,lettre,enonce,is_correct,justification').in('question_id', questionIds).order('lettre');
if (itemError) throw itemError;
const { data: flashcards, error: cardError } = await supabase.from('flashcards').select('id,recto,verso,order_index').eq('cours_id', courseId).order('order_index');
if (cardError) throw cardError;
if (series.length !== 16 || questions.length !== 96 || items.length !== 480 || flashcards.length < 100 || flashcards.length > 200) throw new Error('Paquet publié inattendu : réparation annulée.');

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const directory = resolve('.corpus-orthopedie', slug, 'delivery', stamp, 'published-before-bank-encoding-repair');
mkdirSync(directory, { recursive: true });
const snapshot = { version: 1, createdAt: new Date().toISOString(), course, series, questions, items, flashcards };
const serialized = `${JSON.stringify(snapshot, null, 2)}\n`;
writeFileSync(join(directory, 'snapshot.json'), serialized, 'utf8');
writeFileSync(join(directory, 'manifest.json'), `${JSON.stringify({ courseId, orderIndex: course.order_index, operation: 'bank-encoding-only', sha256: createHash('sha256').update(serialized).digest('hex'), counts: { series: series.length, questions: questions.length, items: items.length, flashcards: flashcards.length } }, null, 2)}\n`, 'utf8');

const itemsByQuestion = new Map();
for (const item of items) itemsByQuestion.set(item.question_id, [...(itemsByQuestion.get(item.question_id) || []), { lettre: item.lettre, enonce: repair(item.enonce), is_correct: item.is_correct, justification: repair(item.justification) }]);
const questionsBySeries = new Map();
for (const question of questions) questionsBySeries.set(question.serie_id, [...(questionsBySeries.get(question.serie_id) || []), question]);

let changed = 0;
const countChange = (before, after) => { if (String(before || '') !== after) changed += 1; return after; };
const payload = {
  series: series.map((serie) => ({
    label: countChange(serie.label, repair(serie.label)),
    vignette: countChange(serie.vignette, repair(serie.vignette)),
    questions: (questionsBySeries.get(serie.id) || []).map((question) => ({
      enonce: countChange(question.enonce, repair(question.enonce)),
      correction_generale: countChange(question.correction_generale, repair(question.correction_generale)),
      items: itemsByQuestion.get(question.id) || [],
    })),
  })),
  flashcards: flashcards.map((card) => ({
    recto: countChange(card.recto, repair(card.recto)),
    verso: countChange(card.verso, repair(card.verso)),
  })),
  thin: false,
};
for (const serie of payload.series) for (const question of serie.questions) for (const item of question.items) {
  const original = items.find((entry) => entry.question_id === question.id && entry.lettre === item.lettre);
  if (original && String(original.enonce || '') !== item.enonce) changed += 1;
  if (original && String(original.justification || '') !== item.justification) changed += 1;
}
const remaining = JSON.stringify(payload).match(new RegExp(mojibake.source, 'g')) || [];
if (remaining.length) throw new Error(`${remaining.length} signature(s) d’encodage restante(s) : publication annulée.`);
writeFileSync(join(directory, 'chapter.json'), `${JSON.stringify({ title: course.titre, provenance: { sourceOnly: true, note: 'Correction limitée aux séquences d’encodage invalides de la banque.' }, ...payload }, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ directory, chapter: join(directory, 'chapter.json'), manifest: join(directory, 'manifest.json'), changed }));

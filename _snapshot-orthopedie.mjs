/**
 * Creates a recoverable, timestamped snapshot before replacing generated
 * content. Snapshots intentionally live next to the immutable corpus, outside
 * the application repository's generated HTML directory.
 *
 * Usage: node _snapshot-orthopedie.mjs <coursId> <chapterDir>
 */
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { config as dotenv } from 'dotenv';

dotenv({ path: '.env.local' });
const [, , coursId, chapterDirArg] = process.argv;
if (!coursId || !chapterDirArg) {
  console.error('usage: node _snapshot-orthopedie.mjs <coursId> <chapterDir>');
  process.exit(1);
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_URL manquants');
const supabase = createClient(url, key, { auth: { persistSession: false } });
const chapterDir = resolve(chapterDirArg);
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const outputDir = join(chapterDir, 'delivery', timestamp, 'published-before-replacement');

const { data: course, error: courseError } = await supabase
  .from('cours').select('id,titre,order_index,importance').eq('id', coursId).single();
if (courseError) throw courseError;
const { data: fiches, error: ficheError } = await supabase
  .from('fiches').select('id,titre,storage_path,pages,content_html,content_format,order_index,created_at').eq('cours_id', coursId).order('order_index');
if (ficheError) throw ficheError;
const { data: series, error: seriesError } = await supabase
  .from('qcm_series').select('id,type,kind,label,vignette,order_index,created_at').eq('cours_id', coursId).order('order_index');
if (seriesError) throw seriesError;
const seriesIds = series.map((serie) => serie.id);
let questions = [];
let items = [];
if (seriesIds.length) {
  const { data, error } = await supabase.from('qcm_questions').select('id,serie_id,enonce,order_index,format,reponse_attendue,correction_generale').in('serie_id', seriesIds).order('order_index');
  if (error) throw error;
  questions = data;
  if (questions.length) {
    const { data: foundItems, error: itemError } = await supabase.from('qcm_items').select('id,question_id,lettre,enonce,is_correct,justification').in('question_id', questions.map((question) => question.id)).order('lettre');
    if (itemError) throw itemError;
    items = foundItems;
  }
}
const { data: flashcards, error: flashError } = await supabase
  .from('flashcards').select('id,recto,verso,order_index').eq('cours_id', coursId).order('order_index');
if (flashError) throw flashError;

const snapshot = { version: 1, createdAt: new Date().toISOString(), course, fiches, series, questions, items, flashcards };
const serialized = `${JSON.stringify(snapshot, null, 2)}\n`;
const manifest = {
  courseId: coursId,
  createdAt: snapshot.createdAt,
  sha256: createHash('sha256').update(serialized).digest('hex'),
  counts: { fiches: fiches.length, series: series.length, questions: questions.length, items: items.length, flashcards: flashcards.length },
};
mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, 'snapshot.json'), serialized, 'utf8');
writeFileSync(join(outputDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`✔ Snapshot sauvegardé : ${outputDir}`);
console.log(JSON.stringify(manifest.counts));

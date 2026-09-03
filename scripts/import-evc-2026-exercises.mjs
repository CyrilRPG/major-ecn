#!/usr/bin/env node
/** Import the deterministic EVC 2026 DOCX manifest into training series. */
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { config as dotenv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
dotenv({ path: join(ROOT, '.env.local') });

const COURSES = {
  'Médecine interne polyvalente': '837b939e-c902-4260-9bea-45099fe3466b',
  'Hématologie': '32be8763-7141-467a-a6e7-ebd150cd97a3',
  'Néphrologie': 'b16b5556-f88f-4941-9a17-3e99d9eb5f96',
  'Rhumatologie': '08a39ed2-6566-49bb-a682-bdeff4bf4a26',
  'Infectiologie': '98086e0b-026f-4d1a-9ddf-f7660edf095b',
  'Pharmacologie': 'e468d7ea-5a9d-4b45-8ade-97329dd8446a',
  'Pneumologie': '33579977-020e-4c94-a561-dee9d3c7bc70',
};
const OFFERS = ['decouverte', 'essentiel', 'intensif', 'approfondi'];
const IMAGE_TOKEN = /\{\{IMG:([^}]+)\}\}/g;
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function mimeFor(name) {
  const ext = name.split('.').pop().toLowerCase();
  return ({ jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', emf: 'image/emf', wmf: 'image/wmf' })[ext] || 'application/octet-stream';
}

function imageTokens(value) {
  return [...(value || '').matchAll(IMAGE_TOKEN)].map((m) => m[1]);
}

function replaceImages(value, urls) {
  return (value || '').replace(IMAGE_TOKEN, (_, name) => urls.get(name) || '');
}

async function parallel(items, limit, task) {
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      await task(items[index], index);
    }
  }));
}

async function main() {
  const base = join(ROOT, 'tmp', 'evc2026-import');
  const manifest = JSON.parse(await readFile(join(base, 'manifest.json'), 'utf8'));
  if (manifest.summary.questions !== 476 || manifest.summary.qcm_without_valid_choices !== 0) {
    throw new Error('Manifest EVC invalide : contrôle structurel non conforme.');
  }
  if (manifest.questions.some((q) => !COURSES[q.course_name])) throw new Error('Collège source sans cours de destination.');

  const { data: existing, error: existingError } = await db
    .from('qcm_series').select('id,label').ilike('label', 'Entraînement EVC 2026 —%');
  if (existingError) throw existingError;
  if (existing.length) throw new Error(`Import déjà présent (${existing.length} séries) : arrêt pour éviter tout doublon.`);

  const usedImages = new Set();
  for (const q of manifest.questions) {
    for (const value of [q.enonce, q.correction_generale, q.reponse_attendue, ...q.items.map((i) => i.enonce)]) {
      imageTokens(value).forEach((name) => usedImages.add(name));
    }
  }
  const urls = new Map();
  const images = [...usedImages];
  await parallel(images, 5, async (name) => {
    const content = await readFile(join(base, 'assets', name));
    const path = `evc-2026/${name}`;
    const { error } = await db.storage.from('qcm-images').upload(path, content, { contentType: mimeFor(name), upsert: false });
    if (error && !/already exists/i.test(error.message)) throw new Error(`Image ${name}: ${error.message}`);
    const { data } = db.storage.from('qcm-images').getPublicUrl(path);
    urls.set(name, data.publicUrl);
  });

  const groups = new Map();
  for (const q of manifest.questions) {
    const key = `${q.part}|${q.specialty}|${q.format}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(q);
  }
  const orders = new Map();
  for (const courseId of new Set(Object.values(COURSES))) {
    const { data, error } = await db.from('qcm_series').select('order_index').eq('cours_id', courseId);
    if (error) throw error;
    orders.set(courseId, Math.max(-1, ...data.map((row) => row.order_index ?? 0)) + 1);
  }

  const imported = [];
  for (const questions of groups.values()) {
    const first = questions[0];
    const courseId = COURSES[first.course_name];
    const voie = first.format === 'qcm' ? ['interne'] : ['externe'];
    const serie = {
      id: randomUUID(),
      cours_id: courseId,
      type: 'qcm',
      label: `Entraînement EVC 2026 — ${first.part} — ${first.specialty} — ${first.format.toUpperCase()}`,
      annee: 2026,
      order_index: orders.get(courseId),
      allowed_voies: voie,
      allowed_offers: OFFERS,
    };
    orders.set(courseId, serie.order_index + 1);
    const { error: seriesError } = await db.from('qcm_series').insert(serie);
    if (seriesError) throw new Error(`${serie.label}: ${seriesError.message}`);

    const questionRows = questions.map((q, orderIndex) => ({
      id: randomUUID(), serie_id: serie.id, order_index: orderIndex,
      enonce: replaceImages(q.enonce, urls), format: q.format, images: [],
      correction_generale: replaceImages(q.correction_generale, urls),
      reponse_attendue: replaceImages(q.reponse_attendue, urls),
    }));
    const { error: questionError } = await db.from('qcm_questions').insert(questionRows);
    if (questionError) throw new Error(`${serie.label}: ${questionError.message}`);
    const itemRows = [];
    questionRows.forEach((stored, questionIndex) => {
      questions[questionIndex].items.forEach((item, itemIndex) => itemRows.push({
        id: randomUUID(), question_id: stored.id, lettre: String.fromCharCode(65 + itemIndex),
        enonce: replaceImages(item.enonce, urls), is_correct: item.is_correct, justification: '', images: [],
      }));
    });
    if (itemRows.length) {
      const { error: itemError } = await db.from('qcm_items').insert(itemRows);
      if (itemError) throw new Error(`${serie.label}: ${itemError.message}`);
    }
    imported.push({ label: serie.label, id: serie.id, questions: questionRows.length, items: itemRows.length, voie: voie[0] });
    console.log(`OK ${serie.label}: ${questionRows.length} exercices`);
  }
  console.log(JSON.stringify({ series: imported.length, questions: manifest.questions.length, images: images.length, imported }, null, 2));
}

main().catch((error) => { console.error(error.message || error); process.exitCode = 1; });

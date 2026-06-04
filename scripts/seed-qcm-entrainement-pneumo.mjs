#!/usr/bin/env node
/**
 * Seed des QCM Entraînement KT n°1 et n°2 — Pneumologie.
 *
 * Usage :
 *   SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxx node scripts/seed-qcm-entrainement-pneumo.mjs
 *
 * Les séries sont déjà créées dans la DB (id en dur ci-dessous).
 * Le script lit les JSON parsés depuis ./scripts/qcm-pneumo-data/{e1,e2}.json
 * et insère chaque question + ses items via le client admin (service_role).
 *
 * Idempotent : DELETE FROM qcm_questions WHERE serie_id IN (...) avant insert.
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mrrgfnirpwsknuyiwcqy.supabase.co';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY est requise');
  process.exit(1);
}

const SERIES = {
  e1: '0fcd7572-3bae-4618-9dc0-a8afa92a40f7', // Entraînement KT n°1
  e2: 'aeed0164-d851-4e24-9757-695dc7ef5ac4', // Entraînement KT n°2
};

const admin = createClient(URL, KEY, { auth: { autoRefreshToken: false, persistSession: false } });

for (const [k, serieId] of Object.entries(SERIES)) {
  const data = JSON.parse(readFileSync(resolve(__dirname, 'qcm-pneumo-data', `${k}.json`), 'utf-8'));
  // Purge questions existantes pour cette série (idempotent)
  const { error: delErr } = await admin.from('qcm_questions').delete().eq('serie_id', serieId);
  if (delErr) { console.error(`❌ delete ${k}:`, delErr); process.exit(1); }

  let inserted = 0;
  for (let i = 0; i < data.length; i++) {
    const q = data[i];
    if (!q.items || Object.keys(q.items).length === 0) continue;
    const { data: qrow, error: qErr } = await admin
      .from('qcm_questions')
      .insert({
        serie_id: serieId,
        enonce: q.enonce || '(énoncé manquant)',
        order_index: i + 1,
        format: 'qcm',
        reponse_attendue: (q.answers || []).join(''),
        correction_generale: q.correction_generale || null,
      })
      .select('id')
      .single();
    if (qErr || !qrow) { console.error(`❌ insert Q${i+1} ${k}:`, qErr); continue; }

    const items = [];
    for (const letter of ['A','B','C','D','E']) {
      if (!(letter in q.items)) continue;
      items.push({
        question_id: qrow.id,
        lettre: letter,
        enonce: q.items[letter],
        is_correct: (q.answers || []).includes(letter),
        justification: q.per_item?.[letter] ?? null,
      });
    }
    if (items.length > 0) {
      const { error: iErr } = await admin.from('qcm_items').insert(items);
      if (iErr) { console.error(`❌ items Q${i+1} ${k}:`, iErr); }
    }
    inserted++;
  }
  console.log(`✅ ${k} : ${inserted} questions insérées dans série ${serieId}`);
}

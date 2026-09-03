#!/usr/bin/env node
// Insert generated Gériatrie DP series into Supabase.
// Usage: node scripts/insert-geriatrie-mg-dp.mjs [--dry-run] [--course <id>] [--cleanup]

import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CORPUS_DIR = join(__dirname, '..', '.corpus-geriatrie-mg-dp');

const DRY_RUN = process.argv.includes('--dry-run');
const CLEANUP = process.argv.includes('--cleanup');
const SINGLE_COURSE = process.argv.includes('--course')
  ? process.argv[process.argv.indexOf('--course') + 1]
  : null;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

async function cleanupCourse(courseId) {
  const { data, error } = await supabase
    .from('qcm_series')
    .delete()
    .eq('cours_id', courseId)
    .or('label.ilike.DP Gériatrie%,label.ilike.DP QROC Gériatrie%')
    .select('id');
  if (error) {
    console.error(`  cleanup ${courseId}:`, error.message);
    return 0;
  }
  return data?.length || 0;
}

async function insertCourse(courseId, payload) {
  const { dpQcm, dpQroc } = payload;
  const allSeries = [...dpQcm, ...dpQroc];
  let inserted = 0;

  for (const serie of allSeries) {
    const serieId = randomUUID();
    const isQroc = serie.allowed_voies?.includes('externe');

    const { error: serieError } = await supabase.from('qcm_series').insert({
      id: serieId,
      cours_id: courseId,
      label: serie.label,
      vignette: serie.vignette,
      type: 'qcm',
      allowed_voies: serie.allowed_voies,
    });
    if (serieError) {
      console.error(`  ERREUR série "${serie.label}":`, serieError.message);
      continue;
    }

    for (let qi = 0; qi < serie.questions.length; qi++) {
      const q = serie.questions[qi];
      const questionId = randomUUID();

      let enonce = q.enonce;
      if (q.newInformation) {
        enonce = `<p><strong>Nouvel élément :</strong> ${q.newInformation}</p>\n${enonce}`;
      }

      const questionRow = {
        id: questionId,
        serie_id: serieId,
        enonce,
        format: isQroc ? 'qroc' : 'qcm',
        correction_generale: q.correction_generale || null,
        order_index: qi,
      };
      if (q.reponse_attendue) questionRow.reponse_attendue = q.reponse_attendue;

      const { error: qError } = await supabase.from('qcm_questions').insert(questionRow);
      if (qError) {
        console.error(`  ERREUR question ${qi + 1} de "${serie.label}":`, qError.message);
        continue;
      }

      if (!isQroc && q.items?.length) {
        const items = q.items.map((item) => ({
          id: randomUUID(),
          question_id: questionId,
          lettre: item.lettre,
          enonce: item.enonce,
          is_correct: item.is_correct,
          justification: item.justification || '',
        }));
        const { error: iError } = await supabase.from('qcm_items').insert(items);
        if (iError) {
          console.error(`  ERREUR items Q${qi + 1} de "${serie.label}":`, iError.message);
        }
      }
    }

    await supabase.from('qcm_series').update({ label: serie.label }).eq('id', serieId);
    inserted++;
  }

  return inserted;
}

async function main() {
  const files = readdirSync(CORPUS_DIR).filter(f => f.endsWith('.json') && f !== 'manifest.json');

  if (SINGLE_COURSE) {
    const filtered = files.filter(f => f.replace('.json', '') === SINGLE_COURSE);
    if (!filtered.length) {
      console.error(`Fichier non trouvé pour le cours ${SINGLE_COURSE}`);
      process.exit(1);
    }
    files.length = 0;
    files.push(...filtered);
  }

  if (CLEANUP) {
    console.log(`Nettoyage des séries Gériatrie existantes pour ${files.length} cours...`);
    let totalCleaned = 0;
    for (const file of files) {
      const courseId = file.replace('.json', '');
      const n = await cleanupCourse(courseId);
      if (n > 0) console.log(`  ${courseId}: ${n} séries supprimées`);
      totalCleaned += n;
    }
    console.log(`Total nettoyé : ${totalCleaned} séries\n`);
  }

  console.log(`${DRY_RUN ? '[DRY RUN] ' : ''}${files.length} cours à insérer`);
  let totalSeries = 0;

  for (const file of files) {
    const courseId = file.replace('.json', '');
    let raw = readFileSync(join(CORPUS_DIR, file), 'utf-8');
    if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
    let payload;
    try {
      payload = JSON.parse(raw);
    } catch (e) {
      console.error(`  JSON invalide: ${file}`, e.message);
      continue;
    }

    const nSeries = (payload.dpQcm?.length || 0) + (payload.dpQroc?.length || 0);
    console.log(`  ${courseId} → ${nSeries} séries`);

    if (DRY_RUN) {
      totalSeries += nSeries;
      continue;
    }

    const n = await insertCourse(courseId, payload);
    totalSeries += n;
    console.log(`    ✓ ${n} séries insérées`);
  }

  console.log(`\nTotal : ${totalSeries} séries ${DRY_RUN ? '(dry run)' : 'insérées'}`);
}

main().catch(e => { console.error(e); process.exit(1); });

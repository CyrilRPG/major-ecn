/**
 * import-all-annales.js
 *
 * Parses all EVCF and EVCP DOC files from the Annales/ folder,
 * skips Pneumologie (code 38, already done),
 * and generates SQL files for insertion into Supabase.
 *
 * Usage:
 *   node scripts/import-all-annales.js
 *
 * Output: scripts/annales-sql-batch-*.sql
 */

const path = require('path');
const fs = require('fs');
const WordExtractor = require('word-extractor');
const crypto = require('crypto');

// ---------------------------------------------------------------------------
// Specialty mapping (code -> coursId)
// ---------------------------------------------------------------------------

const SPECIALTY_MAP = {
  7:  { coursId: '551b3dc8-2bbe-4007-93f7-3768ff1fa181', title: 'Cardiologie' },
  13: { coursId: 'f7bb3d45-1946-4078-96ea-c92c49b0750a', title: 'Dermatologie' },
  16: { coursId: '8bbac79d-efa8-40d2-ad2c-2eed47d6b1d6', title: 'Endocrinologie' },
  17: { coursId: 'dbca83b9-c466-4e31-a8c4-d556ac8c4d08', title: 'Gynécologie' },
  18: { coursId: 'dbca83b9-c466-4e31-a8c4-d556ac8c4d08', title: 'Gynécologie' },
  21: { coursId: '32be8763-7141-467a-a6e7-ebd150cd97a3', title: 'Hématologie' },
  25: { coursId: '837b939e-c902-4260-9bea-45099fe3466b', title: 'Médecine interne' },
  28: { coursId: 'b16b5556-f88f-4941-9a17-3e99d9eb5f96', title: 'Néphrologie' },
  30: { coursId: 'ba2a7dfd-3885-4bca-b458-4d0533e22d37', title: 'Neurologie' },
  33: { coursId: 'f9fb35c6-33f5-40d4-8434-83f4a287213d', title: 'Ophtalmologie' },
  35: { coursId: 'b8281d7b-ef4c-4831-8da0-fef8ada29844', title: 'ORL' },
  36: { coursId: '028b0975-1ebf-4b11-8170-6b70b5e1acb4', title: 'Pédiatrie' },
  45: { coursId: '08a39ed2-6566-49bb-a682-bdeff4bf4a26', title: 'Rhumatologie' },
  47: { coursId: 'beb8c19f-58cf-4ec7-a980-fe1d460f29ea', title: 'Urologie' },
  6:  { coursId: 'ff10c8b6-3c2f-45e3-a49c-286ff6ad2d4f', title: 'Oncologie' },
  74: { coursId: 'f0a625f3-d080-42eb-955a-83bf8b65a764', title: 'Psychiatrie' },
  76: { coursId: 'efc581a1-dcab-4a77-94c6-f6d3409ea0b1', title: 'Gériatrie' },
};

// ---------------------------------------------------------------------------
// Directory scan config
// ---------------------------------------------------------------------------

const DIR_ENTRIES = [
  // --- EVCF ---
  { dir: 'evcf_2009',                                         type: 'evcf', year: 2009 },
  { dir: 'evcf_2011',                                         type: 'evcf', year: 2011 },
  { dir: 'evcf_2012',                                         type: 'evcf', year: 2012 },
  { dir: 'evcf_2015',                                         type: 'evcf', year: 2015 },
  { dir: 'EVC2016_EVCF/EVC2016 - EVCF',                       type: 'evcf', year: 2016 },
  { dir: 'EVCF_2017/EVCF__2017',                              type: 'evcf', year: 2017 },
  { dir: 'EVCF 2019/EVCF 2019',                               type: 'evcf', year: 2019 },

  // --- EVCP ---
  { dir: 'evcp_2-29_0',                                       type: 'evcp', year: 2010 },
  { dir: 'evcp_30-90',                                        type: 'evcp', year: 2010 },
  { dir: 'evcp_2011',                                         type: 'evcp', year: 2011 },
  { dir: 'evcp_2013',                                         type: 'evcp', year: 2013 },
  { dir: 'sujets_evc_pratiques_2015_0',                        type: 'evcp', year: 2015 },
  { dir: 'EVCP__2017 - 02 à 29/EVCP__2017 - 02 à 29',        type: 'evcp', year: 2017 },
  { dir: 'EVCP__2017 - 30 à 76/EVCP__2017 - 30 à 76',        type: 'evcp', year: 2017 },
];

// ---------------------------------------------------------------------------
// Junk patterns to strip
// ---------------------------------------------------------------------------

const JUNK_PATTERNS = [
  /SUITE\s+AU\s+VERSO/gi,
  /TSVP/g,
  /\bTournez\s+la\s+page\b/gi,
  /\bPage\s+\d+\s*(\/|sur)\s*\d+\b/gi,
  /\f/g,
];

function cleanText(raw) {
  let text = raw;
  for (const pat of JUNK_PATTERNS) {
    text = text.replace(pat, '');
  }
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  text = text.replace(/\n{3,}/g, '\n\n');
  text = text.split('\n').map(l => l.trimEnd()).join('\n').trim();
  return text;
}

// ---------------------------------------------------------------------------
// Extract specialty code from filename
// ---------------------------------------------------------------------------

function extractSpecialtyCode(filename) {
  const match = filename.match(/^(?:evcf|evcp)\.(\d{2,3})\.doc$/i);
  if (!match) return null;
  return parseInt(match[1], 10);
}

// ---------------------------------------------------------------------------
// Question regex
// ---------------------------------------------------------------------------

function buildQuestionRegexGlobal() {
  return /^(?:question\s+n[°º]?\s*(\d+)|question\s+(\d+))\s*:?\s*$/gim;
}

// ---------------------------------------------------------------------------
// Preamble removal
// ---------------------------------------------------------------------------

function findPreambleEnd(text) {
  const sujetMatch = text.match(/^sujet\s*:?\s*$/im);
  if (sujetMatch && sujetMatch.index !== undefined) {
    const afterSujet = sujetMatch.index + sujetMatch[0].length;
    const rest = text.substring(afterSujet);
    const blankPrefix = rest.match(/^\n*/);
    return afterSujet + (blankPrefix ? blankPrefix[0].length : 0);
  }

  const epreuveMatch = text.match(/épreuve\s+de\s+v[ée]rification[^\n]*/im);
  if (epreuveMatch && epreuveMatch.index !== undefined) {
    const afterEpreuve = epreuveMatch.index + epreuveMatch[0].length;
    const rest = text.substring(afterEpreuve);
    const blankPrefix = rest.match(/^\n*/);
    return afterEpreuve + (blankPrefix ? blankPrefix[0].length : 0);
  }

  return 0;
}

// ---------------------------------------------------------------------------
// Parse questions
// ---------------------------------------------------------------------------

function parseQuestions(body, type) {
  const text = cleanText(body);
  const preambleEnd = findPreambleEnd(text);
  const content = text.substring(preambleEnd).trim();

  const questionRegex = buildQuestionRegexGlobal();
  const matches = [];
  let m;

  while ((m = questionRegex.exec(content)) !== null) {
    const num = parseInt(m[1] || m[2], 10);
    matches.push({ index: m.index, length: m[0].length, num });
  }

  let vignette = null;
  if (type === 'evcp' && matches.length > 0) {
    const beforeFirst = content.substring(0, matches[0].index).trim();
    if (beforeFirst.length > 20) {
      vignette = beforeFirst;
    }
  }

  const questions = [];
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index + matches[i].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : content.length;
    const questionText = content.substring(start, end).trim();
    if (questionText.length > 0) {
      questions.push({
        order_index: matches[i].num,
        enonce: questionText,
      });
    }
  }

  if (questions.length === 0) {
    return parseFallbackQuestions(content, type);
  }

  return { vignette, questions };
}

function parseFallbackQuestions(content, type) {
  const parenRegex = /^(\d+)\)\s*/gm;
  const dotRegex = /^(\d+)\.\s*/gm;

  let matches = [];
  let m;

  while ((m = parenRegex.exec(content)) !== null) {
    matches.push({ index: m.index, length: m[0].length, num: parseInt(m[1], 10) });
  }

  if (matches.length < 2) {
    matches = [];
    while ((m = dotRegex.exec(content)) !== null) {
      const num = parseInt(m[1], 10);
      if (num > 0 && num < 50) {
        matches.push({ index: m.index, length: m[0].length, num });
      }
    }
  }

  if (matches.length >= 2) {
    const nums = matches.map(x => x.num);
    const isSequential = nums[0] === 1 && nums.every((n, i) => i === 0 || n > nums[i - 1]);
    if (!isSequential) {
      matches = [];
    }
  }

  let vignette = null;
  if (type === 'evcp' && matches.length > 0) {
    const beforeFirst = content.substring(0, matches[0].index).trim();
    if (beforeFirst.length > 20) {
      vignette = beforeFirst;
    }
  }

  const questions = [];
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index + matches[i].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : content.length;
    const questionText = content.substring(start, end).trim();
    if (questionText.length > 0) {
      questions.push({
        order_index: matches[i].num,
        enonce: questionText,
      });
    }
  }

  return { vignette, questions };
}

// ---------------------------------------------------------------------------
// SQL helpers
// ---------------------------------------------------------------------------

function escapeSql(str) {
  if (!str) return '';
  // Double single quotes for SQL escaping
  return str.replace(/'/g, "''");
}

function truncateText(str, maxLen = 2000) {
  if (!str || str.length <= maxLen) return str;
  return str.substring(0, maxLen) + ' [...]';
}

function generateUUID() {
  return crypto.randomUUID();
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const ROOT = path.resolve(__dirname, '..');
  const ANNALES_DIR = path.join(ROOT, 'Annales');
  const extractor = new WordExtractor();

  // Collect all parsed annales grouped by (coursId, type, year)
  // Key: `${coursId}|${type}|${year}`
  const annaleMap = new Map();

  const errors = [];
  const skipped = [];
  let totalFiles = 0;
  let parsedFiles = 0;

  for (const entry of DIR_ENTRIES) {
    const dirPath = path.join(ANNALES_DIR, entry.dir);

    if (!fs.existsSync(dirPath)) {
      console.warn(`[WARN] Directory not found: ${entry.dir}`);
      continue;
    }

    const files = fs.readdirSync(dirPath).filter(f => /\.doc$/i.test(f));

    for (const file of files) {
      totalFiles++;
      const filePath = path.join(dirPath, file);
      const relPath = path.relative(ANNALES_DIR, filePath).replace(/\\/g, '/');

      const code = extractSpecialtyCode(file);
      if (code === null) {
        skipped.push({ file: relPath, reason: 'Could not extract specialty code' });
        continue;
      }

      // Skip Pneumologie (already done)
      if (code === 38) {
        skipped.push({ file: relPath, reason: 'Pneumologie (code 38) - already imported' });
        continue;
      }

      const specialty = SPECIALTY_MAP[code];
      if (!specialty) {
        skipped.push({ file: relPath, reason: `Code ${code} not in SPECIALTY_MAP` });
        continue;
      }

      try {
        const doc = await extractor.extract(filePath);
        const body = doc.getBody();

        if (!body || body.trim().length === 0) {
          errors.push({ file: relPath, error: 'Empty document body' });
          continue;
        }

        const { vignette, questions } = parseQuestions(body, entry.type);

        if (questions.length === 0) {
          errors.push({ file: relPath, error: 'No questions found' });
          continue;
        }

        // Dedupe key: same specialty + type + year should go into same series
        // But for codes 17 and 18 (same coursId), they are different files for the same cours
        const key = `${specialty.coursId}|${entry.type}|${entry.year}|${code}`;

        if (!annaleMap.has(key)) {
          annaleMap.set(key, {
            coursId: specialty.coursId,
            type: entry.type,
            year: entry.year,
            code,
            title: specialty.title,
            vignette: null,
            questions: [],
            sourceFiles: [],
          });
        }

        const record = annaleMap.get(key);
        if (vignette && !record.vignette) {
          record.vignette = vignette;
        }

        // Renumber questions based on the existing count in this series
        // For EVCP with vignette, questions start at order_index 1 (0 = vignette)
        // But each file is a separate annale so we keep them separate
        record.questions.push(...questions);
        record.sourceFiles.push(relPath);

        parsedFiles++;
      } catch (err) {
        errors.push({ file: relPath, error: err.message || String(err) });
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Now generate SQL
  // ---------------------------------------------------------------------------

  // For order_index within a cours:
  // EVCF series start at order_index 10 (10, 11, 12, ...)
  // EVCP series start at order_index 20 (20, 21, 22, ...)
  // We need to track per-cours counters
  const coursOrderCounters = {};

  // Group by coursId to assign order_index
  const byCours = new Map();
  for (const [key, record] of annaleMap.entries()) {
    if (!byCours.has(record.coursId)) {
      byCours.set(record.coursId, []);
    }
    byCours.get(record.coursId).push(record);
  }

  // Sort records within each cours by type (evcf first) then year
  for (const [coursId, records] of byCours.entries()) {
    records.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'evcf' ? -1 : 1;
      return a.year - b.year;
    });

    let evcfIdx = 10;
    let evcpIdx = 20;
    for (const rec of records) {
      if (rec.type === 'evcf') {
        rec.orderIndex = evcfIdx++;
      } else {
        rec.orderIndex = evcpIdx++;
      }
    }
  }

  // Generate SQL statements
  const allSeriesSQL = [];
  const allQuestionsSQL = [];

  for (const [key, record] of annaleMap.entries()) {
    const serieId = generateUUID();
    record.serieId = serieId;

    const label = record.type === 'evcf'
      ? `EVCF ${record.year}`
      : `EVCP ${record.year} — Dossier progressif`;

    // For EVCP with vignette, store it in the vignette column of qcm_series
    const vignetteSQL = record.vignette
      ? `'${escapeSql(truncateText(record.vignette))}'`
      : 'NULL';

    allSeriesSQL.push(
      `('${serieId}', '${record.coursId}', 'annale', '${escapeSql(label)}', ${record.year}, ${record.orderIndex}, ${vignetteSQL})`
    );

    // For questions: renumber starting from 0 for EVCF, 0 for EVCP (vignette is in series.vignette column now)
    // Actually looking at the pneumo data, EVCP vignette was stored as order_index 0 question
    // Let me follow that same pattern
    const questionValues = [];

    if (record.vignette) {
      // Store vignette as order_index 0 question (same as pneumo)
      questionValues.push(
        `('${serieId}', '${escapeSql(truncateText(record.vignette))}', 0)`
      );
    }

    // Renumber questions sequentially
    const startIdx = record.vignette ? 1 : 0;
    for (let i = 0; i < record.questions.length; i++) {
      const q = record.questions[i];
      questionValues.push(
        `('${serieId}', '${escapeSql(truncateText(q.enonce))}', ${startIdx + i})`
      );
    }

    allQuestionsSQL.push(...questionValues);
  }

  // ---------------------------------------------------------------------------
  // Write SQL batches (keep under 50KB each)
  // ---------------------------------------------------------------------------

  // First: all series inserts in one batch
  const seriesSql = `INSERT INTO qcm_series (id, cours_id, type, label, annee, order_index, vignette) VALUES\n${allSeriesSQL.join(',\n')};\n`;

  const outputDir = path.join(ROOT, 'scripts');

  // Split series SQL if too large
  if (Buffer.byteLength(seriesSql, 'utf-8') > 48000) {
    // Split into multiple batches
    const midpoint = Math.ceil(allSeriesSQL.length / 2);
    fs.writeFileSync(
      path.join(outputDir, 'annales-series-0.sql'),
      `INSERT INTO qcm_series (id, cours_id, type, label, annee, order_index, vignette) VALUES\n${allSeriesSQL.slice(0, midpoint).join(',\n')};\n`,
      'utf-8'
    );
    fs.writeFileSync(
      path.join(outputDir, 'annales-series-1.sql'),
      `INSERT INTO qcm_series (id, cours_id, type, label, annee, order_index, vignette) VALUES\n${allSeriesSQL.slice(midpoint).join(',\n')};\n`,
      'utf-8'
    );
    console.log(`Series SQL split into 2 files`);
  } else {
    fs.writeFileSync(path.join(outputDir, 'annales-series-0.sql'), seriesSql, 'utf-8');
    console.log(`Series SQL: 1 file, ${(Buffer.byteLength(seriesSql, 'utf-8') / 1024).toFixed(1)} KB`);
  }

  // Questions: split into batches under 48KB
  let batchNum = 0;
  let currentBatch = [];
  let currentSize = 0;
  const HEADER = 'INSERT INTO qcm_questions (serie_id, enonce, order_index) VALUES\n';
  const headerSize = Buffer.byteLength(HEADER, 'utf-8');

  for (const val of allQuestionsSQL) {
    const valSize = Buffer.byteLength(val, 'utf-8') + 3; // +3 for ",\n" or ";\n"
    if (currentSize + valSize + headerSize > 48000 && currentBatch.length > 0) {
      // Write current batch
      const sql = HEADER + currentBatch.join(',\n') + ';\n';
      const filename = `annales-questions-${batchNum}.sql`;
      fs.writeFileSync(path.join(outputDir, filename), sql, 'utf-8');
      console.log(`  ${filename}: ${currentBatch.length} rows, ${(Buffer.byteLength(sql, 'utf-8') / 1024).toFixed(1)} KB`);
      batchNum++;
      currentBatch = [];
      currentSize = 0;
    }
    currentBatch.push(val);
    currentSize += valSize;
  }

  if (currentBatch.length > 0) {
    const sql = HEADER + currentBatch.join(',\n') + ';\n';
    const filename = `annales-questions-${batchNum}.sql`;
    fs.writeFileSync(path.join(outputDir, filename), sql, 'utf-8');
    console.log(`  ${filename}: ${currentBatch.length} rows, ${(Buffer.byteLength(sql, 'utf-8') / 1024).toFixed(1)} KB`);
    batchNum++;
  }

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------

  console.log('\n========================================');
  console.log('  ANNALES IMPORT - SUMMARY');
  console.log('========================================\n');
  console.log(`Total DOC files scanned:  ${totalFiles}`);
  console.log(`Successfully parsed:      ${parsedFiles}`);
  console.log(`Skipped:                  ${skipped.length}`);
  console.log(`Errors:                   ${errors.length}`);
  console.log(`Total series created:     ${annaleMap.size}`);
  console.log(`Total questions:          ${allQuestionsSQL.length}`);
  console.log(`SQL batch files:          ${batchNum} question batches`);

  // By specialty
  console.log('\n--- By specialty ---');
  const bySpec = {};
  for (const [key, record] of annaleMap.entries()) {
    const k = `[${record.code}] ${record.title}`;
    bySpec[k] = (bySpec[k] || 0) + 1;
  }
  for (const [k, v] of Object.entries(bySpec).sort()) {
    console.log(`  ${k}: ${v} series`);
  }

  // By year
  console.log('\n--- By year ---');
  const byYear = {};
  for (const [key, record] of annaleMap.entries()) {
    if (!byYear[record.year]) byYear[record.year] = { evcf: 0, evcp: 0 };
    byYear[record.year][record.type]++;
  }
  for (const year of Object.keys(byYear).sort()) {
    console.log(`  ${year}: EVCF=${byYear[year].evcf}, EVCP=${byYear[year].evcp}`);
  }

  if (errors.length > 0) {
    console.log('\n--- Errors ---');
    for (const e of errors) {
      console.log(`  ${e.file}: ${e.error}`);
    }
  }

  if (skipped.length > 0) {
    console.log(`\n--- Skipped (${skipped.length} files) ---`);
    // Only show non-pneumo skips
    const nonPneumoSkips = skipped.filter(s => !s.reason.includes('Pneumologie'));
    for (const s of nonPneumoSkips) {
      console.log(`  ${s.file}: ${s.reason}`);
    }
    const pneumoCount = skipped.filter(s => s.reason.includes('Pneumologie')).length;
    if (pneumoCount > 0) {
      console.log(`  ... and ${pneumoCount} Pneumologie files (already imported)`);
    }
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

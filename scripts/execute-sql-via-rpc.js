/**
 * execute-sql-via-rpc.js
 *
 * Reads the generated SQL files from import-all-annales.js and inserts them
 * into Supabase via PostgREST RPC (bulk_insert_series / bulk_insert_questions).
 */

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://mrrgfnirpwsknuyiwcqy.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ycmdmbmlycHdza251eWl3Y3F5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NTExNTcsImV4cCI6MjA5NDQyNzE1N30.VQfEwQP-7JLycQ7qjFGwNPwB32LkwXjrYTv4f8HOQro';

const SCRIPTS_DIR = path.join(__dirname);

// ─── SQL Parser ─────────────────────────────────────────────────
// Extracts tuples from INSERT INTO ... VALUES (...), (...), ...;
function parseSQLTuples(sql) {
  const valuesIdx = sql.indexOf('VALUES\n');
  if (valuesIdx === -1) return [];
  const body = sql.substring(valuesIdx + 'VALUES\n'.length).replace(/;\s*$/, '');

  const tuples = [];
  let inString = false;
  let tupleStart = -1;
  let depth = 0;

  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (inString) {
      if (ch === "'" && i + 1 < body.length && body[i + 1] === "'") {
        i++; // skip ''
      } else if (ch === "'") {
        inString = false;
      }
      continue;
    }
    if (ch === "'") { inString = true; continue; }
    if (ch === '(') { if (depth === 0) tupleStart = i; depth++; }
    if (ch === ')') {
      depth--;
      if (depth === 0 && tupleStart >= 0) {
        tuples.push(body.substring(tupleStart + 1, i)); // content inside ()
        tupleStart = -1;
      }
    }
  }
  return tuples;
}

// Parse a single tuple string into field values
function parseTupleFields(tupleStr) {
  const fields = [];
  let current = '';
  let inString = false;
  let i = 0;

  while (i < tupleStr.length) {
    const ch = tupleStr[i];
    if (inString) {
      if (ch === "'" && i + 1 < tupleStr.length && tupleStr[i + 1] === "'") {
        current += "'"; // unescape ''
        i += 2;
        continue;
      } else if (ch === "'") {
        inString = false;
        i++;
        continue;
      }
      current += ch;
      i++;
    } else {
      if (ch === "'") {
        inString = true;
        i++;
        continue;
      }
      if (ch === ',') {
        fields.push(current.trim());
        current = '';
        i++;
        continue;
      }
      current += ch;
      i++;
    }
  }
  fields.push(current.trim());
  return fields;
}

function cleanFieldValue(val) {
  if (val === 'NULL' || val === 'null') return null;
  // Remove E'' wrapper if present
  if (val.startsWith("E'") && val.endsWith("'")) {
    return val.substring(2, val.length - 1);
  }
  // Numeric
  if (/^-?\d+$/.test(val)) return parseInt(val, 10);
  return val;
}

// ─── RPC Caller ─────────────────────────────────────────────────

async function callRPC(fnName, data) {
  const url = `${SUPABASE_URL}/rest/v1/rpc/${fnName}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({ data }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`RPC ${fnName} failed (${res.status}): ${errText}`);
  }
  return await res.json();
}

// ─── Series insertion ───────────────────────────────────────────

async function insertSeries() {
  const seriesFiles = fs.readdirSync(SCRIPTS_DIR)
    .filter(f => f.startsWith('annales-series-') && f.endsWith('.sql') && !f.includes('part'))
    .sort();

  console.log(`\n=== SERIES FILES: ${seriesFiles.length} ===`);

  let totalInserted = 0;
  for (const file of seriesFiles) {
    const sql = fs.readFileSync(path.join(SCRIPTS_DIR, file), 'utf8');
    const tuples = parseSQLTuples(sql);
    console.log(`  ${file}: ${tuples.length} tuples`);

    const batch = [];
    for (const t of tuples) {
      const fields = parseTupleFields(t);
      if (fields.length < 7) {
        console.warn(`    Skipping tuple with ${fields.length} fields`);
        continue;
      }
      batch.push({
        id: cleanFieldValue(fields[0]),
        cours_id: cleanFieldValue(fields[1]),
        type: cleanFieldValue(fields[2]),
        label: cleanFieldValue(fields[3]),
        annee: cleanFieldValue(fields[4]),
        order_index: cleanFieldValue(fields[5]),
        vignette: cleanFieldValue(fields[6]),
      });
    }

    // Insert in sub-batches of 20 to avoid payload limits
    const subBatchSize = 20;
    for (let i = 0; i < batch.length; i += subBatchSize) {
      const sub = batch.slice(i, i + subBatchSize);
      try {
        const result = await callRPC('bulk_insert_series', sub);
        totalInserted += (typeof result === 'number' ? result : sub.length);
        process.stdout.write('.');
      } catch (err) {
        console.error(`\n    Error at index ${i}: ${err.message}`);
        // Try one at a time for debugging
        for (const item of sub) {
          try {
            await callRPC('bulk_insert_series', [item]);
            totalInserted++;
            process.stdout.write('+');
          } catch (e2) {
            console.error(`\n    Failed: ${item.label} (${item.id}): ${e2.message}`);
          }
        }
      }
    }
    console.log();
  }
  console.log(`  Total series inserted: ${totalInserted}`);
  return totalInserted;
}

// ─── Questions insertion ────────────────────────────────────────

async function insertQuestions() {
  const questionFiles = fs.readdirSync(SCRIPTS_DIR)
    .filter(f => f.startsWith('annales-questions-') && f.endsWith('.sql'))
    .sort((a, b) => {
      const numA = parseInt(a.match(/(\d+)/)?.[1] || '0');
      const numB = parseInt(b.match(/(\d+)/)?.[1] || '0');
      return numA - numB;
    });

  console.log(`\n=== QUESTION FILES: ${questionFiles.length} ===`);

  let totalInserted = 0;
  for (const file of questionFiles) {
    const sql = fs.readFileSync(path.join(SCRIPTS_DIR, file), 'utf8');
    const tuples = parseSQLTuples(sql);
    console.log(`  ${file}: ${tuples.length} tuples`);

    const batch = [];
    for (const t of tuples) {
      const fields = parseTupleFields(t);
      if (fields.length < 3) {
        console.warn(`    Skipping tuple with ${fields.length} fields`);
        continue;
      }
      batch.push({
        serie_id: cleanFieldValue(fields[0]),
        enonce: cleanFieldValue(fields[1]),
        order_index: cleanFieldValue(fields[2]),
      });
    }

    // Insert in sub-batches of 15 (questions can be large)
    const subBatchSize = 15;
    for (let i = 0; i < batch.length; i += subBatchSize) {
      const sub = batch.slice(i, i + subBatchSize);
      try {
        const result = await callRPC('bulk_insert_questions', sub);
        totalInserted += (typeof result === 'number' ? result : sub.length);
        process.stdout.write('.');
      } catch (err) {
        console.error(`\n    Error at batch ${i}: ${err.message}`);
        // Try one at a time
        for (const item of sub) {
          try {
            await callRPC('bulk_insert_questions', [item]);
            totalInserted++;
            process.stdout.write('+');
          } catch (e2) {
            console.error(`\n    Failed question (serie ${item.serie_id}, idx ${item.order_index}): ${e2.message.substring(0, 100)}`);
          }
        }
      }
    }
    console.log();
  }
  console.log(`  Total questions inserted: ${totalInserted}`);
  return totalInserted;
}

// ─── Main ───────────────────────────────────────────────────────

async function main() {
  console.log('Starting bulk import via Supabase RPC...\n');

  const seriesCount = await insertSeries();
  const questionCount = await insertQuestions();

  console.log('\n========================================');
  console.log('  IMPORT COMPLETE');
  console.log('========================================');
  console.log(`  Series inserted:    ${seriesCount}`);
  console.log(`  Questions inserted: ${questionCount}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

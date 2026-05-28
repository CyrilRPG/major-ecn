/**
 * parse-annales.ts
 *
 * Parses all EVCF and EVCP DOC files from the Annales/ folder into structured
 * JSON ready for database import.
 *
 * Usage:
 *   npx tsx scripts/parse-annales.ts
 *   # or
 *   node -e "require('tsx/cjs'); require('./scripts/parse-annales.ts')"
 *
 * Output: scripts/parsed-annales.json
 */

import * as path from 'path';
import * as fs from 'fs';

// word-extractor is a CJS module without type declarations
// eslint-disable-next-line @typescript-eslint/no-require-imports
const WordExtractor = require('word-extractor');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ExamType = 'evcf' | 'evcp';

interface ParsedQuestion {
  order_index: number;
  enonce: string;
}

interface ParsedAnnale {
  specialtyCode: number;
  specialtyName: string;
  coursId: string | undefined;
  year: number;
  type: ExamType;
  label: string;
  vignette: string | null;
  questions: ParsedQuestion[];
  sourceFile: string;
}

// ---------------------------------------------------------------------------
// Specialty mapping
// ---------------------------------------------------------------------------

const SPECIALTY_MAP: Record<number, { coursId: string | undefined; coursTitle: string }> = {
  7:  { coursId: '551b3dc8-2bbe-4007-93f7-3768ff1fa181', coursTitle: 'Cardiologie' },
  13: { coursId: 'f7bb3d45-1946-4078-96ea-c92c49b0750a', coursTitle: 'Dermatologie' },
  16: { coursId: '8bbac79d-efa8-40d2-ad2c-2eed47d6b1d6', coursTitle: 'Endocrinologie' },
  17: { coursId: 'dbca83b9-c466-4e31-a8c4-d556ac8c4d08', coursTitle: 'Gynécologie' },
  18: { coursId: 'dbca83b9-c466-4e31-a8c4-d556ac8c4d08', coursTitle: 'Gynécologie' },
  20: { coursId: undefined, coursTitle: 'Gastro-entérologie' },
  21: { coursId: '32be8763-7141-467a-a6e7-ebd150cd97a3', coursTitle: 'Hématologie' },
  25: { coursId: '837b939e-c902-4260-9bea-45099fe3466b', coursTitle: 'Médecine interne' },
  28: { coursId: 'b16b5556-f88f-4941-9a17-3e99d9eb5f96', coursTitle: 'Néphrologie' },
  30: { coursId: 'ba2a7dfd-3885-4bca-b458-4d0533e22d37', coursTitle: 'Neurologie' },
  33: { coursId: 'f9fb35c6-33f5-40d4-8434-83f4a287213d', coursTitle: 'Ophtalmologie' },
  35: { coursId: 'b8281d7b-ef4c-4831-8da0-fef8ada29844', coursTitle: 'ORL' },
  36: { coursId: '028b0975-1ebf-4b11-8170-6b70b5e1acb4', coursTitle: 'Pédiatrie' },
  38: { coursId: '33579977-020e-4c94-a561-dee9d3c7bc70', coursTitle: 'Pneumologie' },
  45: { coursId: '08a39ed2-6566-49bb-a682-bdeff4bf4a26', coursTitle: 'Rhumatologie' },
  47: { coursId: 'beb8c19f-58cf-4ec7-a980-fe1d460f29ea', coursTitle: 'Urologie' },
  6:  { coursId: 'ff10c8b6-3c2f-45e3-a49c-286ff6ad2d4f', coursTitle: 'Oncologie' },
  74: { coursId: 'f0a625f3-d080-42eb-955a-83bf8b65a764', coursTitle: 'Psychiatrie' },
  76: { coursId: 'efc581a1-dcab-4a77-94c6-f6d3409ea0b1', coursTitle: 'Gériatrie' },
};

// ---------------------------------------------------------------------------
// Directory scan config
// ---------------------------------------------------------------------------

interface DirEntry {
  dir: string;       // relative to Annales/
  type: ExamType;
  year: number;
}

const DIR_ENTRIES: DirEntry[] = [
  // --- EVCF ---
  { dir: 'evcf_2009',                           type: 'evcf', year: 2009 },
  { dir: 'evcf_2011',                           type: 'evcf', year: 2011 },
  { dir: 'evcf_2012',                           type: 'evcf', year: 2012 },
  { dir: 'evcf_2015',                           type: 'evcf', year: 2015 },
  { dir: 'EVC2016_EVCF/EVC2016 - EVCF',         type: 'evcf', year: 2016 },
  { dir: 'EVCF_2017/EVCF__2017',                type: 'evcf', year: 2017 },
  { dir: 'EVCF 2019/EVCF 2019',                 type: 'evcf', year: 2019 },

  // --- EVCP ---
  { dir: 'evcp_2-29_0',                         type: 'evcp', year: 2010 },
  { dir: 'evcp_30-90',                          type: 'evcp', year: 2010 },
  { dir: 'evcp_2011',                           type: 'evcp', year: 2011 },
  { dir: 'evcp_2013',                           type: 'evcp', year: 2013 },
  { dir: 'sujets_evc_pratiques_2015_0',          type: 'evcp', year: 2015 },
  { dir: 'EVCP__2017 - 02 à 29/EVCP__2017 - 02 à 29', type: 'evcp', year: 2017 },
  { dir: 'EVCP__2017 - 30 à 76/EVCP__2017 - 30 à 76', type: 'evcp', year: 2017 },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ROOT = path.resolve(__dirname, '..');
const ANNALES_DIR = path.join(ROOT, 'Annales');

/**
 * Extract the specialty code from a filename like "EVCF.38.DOC" or "evcp.07.doc".
 * Returns the numeric code or null if the filename doesn't match.
 */
function extractSpecialtyCode(filename: string): number | null {
  const match = filename.match(/^(?:evcf|evcp)\.(\d{2,3})\.doc$/i);
  if (!match) return null;
  return parseInt(match[1], 10);
}

/**
 * Junk strings to strip from extracted text.
 */
const JUNK_PATTERNS = [
  /SUITE\s+AU\s+VERSO/gi,
  /TSVP/g,
  /\bTournez\s+la\s+page\b/gi,
  /\bPage\s+\d+\s*(\/|sur)\s*\d+\b/gi,
  /\f/g,                     // form feeds
];

/**
 * Clean extracted text: remove junk markers, normalize whitespace.
 */
function cleanText(raw: string): string {
  let text = raw;
  for (const pat of JUNK_PATTERNS) {
    text = text.replace(pat, '');
  }
  // Normalize line endings
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  // Collapse 3+ consecutive blank lines to 2
  text = text.replace(/\n{3,}/g, '\n\n');
  // Trim leading/trailing whitespace on each line
  text = text
    .split('\n')
    .map((l) => l.trimEnd())
    .join('\n')
    .trim();
  return text;
}

// ---------------------------------------------------------------------------
// Question regex
//
// Matches patterns like:
//   Question N°1     Question n° 1     Question N°1:     Question N° 1 :
//   Question 1       Question 1:       Question 1 :
//   QUESTION N°1     QUESTION 1
//
// We use a regex that captures the question number.
// ---------------------------------------------------------------------------

/**
 * Build a global regex that finds ALL question headers in the text.
 * Each match captures the question number in group 1 or group 2.
 *
 * Handles variations:
 *   Question N°1      Question n° 1      Question N°1:      Question N° 1 :
 *   Question 1        Question 1:        Question 1 :
 *   QUESTION N°1      QUESTION 1         QUESTION N° 1 :
 */
function buildQuestionRegexGlobal(): RegExp {
  return /^(?:question\s+n[°º]?\s*(\d+)|question\s+(\d+))\s*:?\s*$/gim;
}

/**
 * Parse the header area of a document to extract the specialty name.
 * The first meaningful line is usually the specialty name in uppercase.
 */
function extractSpecialtyNameFromBody(body: string): string | null {
  const lines = body.split('\n').map((l) => l.trim()).filter(Boolean);
  // The specialty name is typically the first non-empty line, in uppercase French
  for (const line of lines.slice(0, 5)) {
    // Skip lines that are clearly headers like "Epreuve de verification..."
    if (/épreuve|epreuve|sujet|evc[fp]/i.test(line)) continue;
    // A capitalized specialty name
    if (line.length > 2 && line.length < 80) {
      return line;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Preamble removal
//
// Documents start with a header block:
//   PNEUMOLOGIE
//   Epreuve de vérification des connaissances fondamentales
//   Sujet :
//   [blank lines]
//
// We strip everything before the first question or, for EVCP, keep the
// clinical vignette that comes between the header and Question N°1.
// ---------------------------------------------------------------------------

/**
 * Find the index where the preamble header ends.
 * We look for the "Sujet :" line (or similar) as the end of the header.
 */
function findPreambleEnd(text: string): number {
  // Try to find "Sujet" line
  const sujetMatch = text.match(/^sujet\s*:?\s*$/im);
  if (sujetMatch && sujetMatch.index !== undefined) {
    // Return position right after the "Sujet :" line
    const afterSujet = sujetMatch.index + sujetMatch[0].length;
    // Skip any blank lines right after
    const rest = text.substring(afterSujet);
    const blankPrefix = rest.match(/^\n*/);
    return afterSujet + (blankPrefix ? blankPrefix[0].length : 0);
  }

  // Fallback: look for "épreuve de vérification" and take content after that block
  const epreuveMatch = text.match(/épreuve\s+de\s+v[ée]rification[^\n]*/im);
  if (epreuveMatch && epreuveMatch.index !== undefined) {
    const afterEpreuve = epreuveMatch.index + epreuveMatch[0].length;
    const rest = text.substring(afterEpreuve);
    const blankPrefix = rest.match(/^\n*/);
    return afterEpreuve + (blankPrefix ? blankPrefix[0].length : 0);
  }

  // No preamble found; start from the beginning
  return 0;
}

// ---------------------------------------------------------------------------
// Parse questions
// ---------------------------------------------------------------------------

interface ParseResult {
  vignette: string | null;
  questions: ParsedQuestion[];
}

function parseQuestions(body: string, type: ExamType): ParseResult {
  const text = cleanText(body);
  const preambleEnd = findPreambleEnd(text);
  const content = text.substring(preambleEnd).trim();

  // Find all question header positions
  const questionRegex = buildQuestionRegexGlobal();
  const matches: Array<{ index: number; length: number; num: number }> = [];
  let m: RegExpExecArray | null;

  while ((m = questionRegex.exec(content)) !== null) {
    const num = parseInt(m[1] || m[2], 10);
    matches.push({ index: m.index, length: m[0].length, num });
  }

  // Extract vignette for EVCP: everything before the first question header
  let vignette: string | null = null;
  if (type === 'evcp' && matches.length > 0) {
    const beforeFirst = content.substring(0, matches[0].index).trim();
    if (beforeFirst.length > 20) {
      // Meaningful vignette content
      vignette = beforeFirst;
    }
  }

  // Extract each question text
  const questions: ParsedQuestion[] = [];
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

  // If no question headers were found, try a fallback: numbered list patterns
  // like "1)" or "1." at the start of a line
  if (questions.length === 0) {
    const fallbackResult = parseFallbackQuestions(content, type);
    return fallbackResult;
  }

  return { vignette, questions };
}

/**
 * Fallback parser for documents that use "1)", "2)" or "1.", "2." style numbering
 * instead of "Question N°X" headers.
 */
function parseFallbackQuestions(content: string, type: ExamType): ParseResult {
  // Try "N)" pattern at start of line: matches "1)", "2)", etc.
  const parenRegex = /^(\d+)\)\s*/gm;
  // Try "N." pattern at start of line: matches "1.", "2.", etc.
  const dotRegex = /^(\d+)\.\s*/gm;

  let matches: Array<{ index: number; length: number; num: number }> = [];

  // Try parenthesis style first
  let m: RegExpExecArray | null;
  while ((m = parenRegex.exec(content)) !== null) {
    matches.push({ index: m.index, length: m[0].length, num: parseInt(m[1], 10) });
  }

  // If no parenthesis matches, try dot style
  if (matches.length < 2) {
    matches = [];
    while ((m = dotRegex.exec(content)) !== null) {
      // Avoid matching things like dates "2009." or decimals
      const num = parseInt(m[1], 10);
      if (num > 0 && num < 50) {
        matches.push({ index: m.index, length: m[0].length, num });
      }
    }
  }

  // Check if the numbers look sequential (1, 2, 3...)
  if (matches.length >= 2) {
    const nums = matches.map((x) => x.num);
    const isSequential = nums[0] === 1 && nums.every((n, i) => i === 0 || n > nums[i - 1]);
    if (!isSequential) {
      // Probably not question numbers
      matches = [];
    }
  }

  let vignette: string | null = null;
  if (type === 'evcp' && matches.length > 0) {
    const beforeFirst = content.substring(0, matches[0].index).trim();
    if (beforeFirst.length > 20) {
      vignette = beforeFirst;
    }
  }

  const questions: ParsedQuestion[] = [];
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
// Main
// ---------------------------------------------------------------------------

async function main() {
  const extractor = new WordExtractor();
  const results: ParsedAnnale[] = [];
  const errors: Array<{ file: string; error: string }> = [];
  const skipped: Array<{ file: string; reason: string }> = [];

  let totalFiles = 0;
  let parsedFiles = 0;

  for (const entry of DIR_ENTRIES) {
    const dirPath = path.join(ANNALES_DIR, entry.dir);

    if (!fs.existsSync(dirPath)) {
      console.warn(`[WARN] Directory not found: ${entry.dir}`);
      continue;
    }

    // List all DOC files in the directory
    const files = fs.readdirSync(dirPath).filter((f) => /\.doc$/i.test(f));

    for (const file of files) {
      totalFiles++;
      const filePath = path.join(dirPath, file);
      const relPath = path.relative(ANNALES_DIR, filePath).replace(/\\/g, '/');

      // Extract specialty code from filename
      const code = extractSpecialtyCode(file);
      if (code === null) {
        skipped.push({ file: relPath, reason: 'Could not extract specialty code from filename' });
        continue;
      }

      // Check if specialty is in our mapping
      const specialty = SPECIALTY_MAP[code];
      if (!specialty) {
        skipped.push({ file: relPath, reason: `Specialty code ${code} not in SPECIALTY_MAP` });
        continue;
      }

      // Skip if no coursId (not in DB yet)
      if (!specialty.coursId) {
        skipped.push({
          file: relPath,
          reason: `Specialty "${specialty.coursTitle}" (code ${code}) has no coursId yet`,
        });
        continue;
      }

      try {
        // Extract text from DOC file
        const doc = await extractor.extract(filePath);
        const body = doc.getBody();

        if (!body || body.trim().length === 0) {
          errors.push({ file: relPath, error: 'Empty document body' });
          continue;
        }

        // Detect the specialty name from the document body
        const docSpecialtyName = extractSpecialtyNameFromBody(body) || specialty.coursTitle;

        // Parse questions (and vignette for EVCP)
        const { vignette, questions } = parseQuestions(body, entry.type);

        if (questions.length === 0) {
          errors.push({ file: relPath, error: 'No questions found in document' });
          continue;
        }

        const label = entry.type === 'evcf'
          ? `EVCF ${entry.year}`
          : `DP ${entry.year}`;

        results.push({
          specialtyCode: code,
          specialtyName: docSpecialtyName,
          coursId: specialty.coursId,
          year: entry.year,
          type: entry.type,
          label,
          vignette,
          questions,
          sourceFile: relPath,
        });

        parsedFiles++;
      } catch (err: any) {
        errors.push({ file: relPath, error: err.message || String(err) });
      }
    }
  }

  // ------ Output summary ------
  console.log('\n========================================');
  console.log('  ANNALES PARSER - SUMMARY');
  console.log('========================================\n');

  console.log(`Total DOC files scanned:  ${totalFiles}`);
  console.log(`Successfully parsed:      ${parsedFiles}`);
  console.log(`Skipped (no mapping):     ${skipped.length}`);
  console.log(`Errors:                   ${errors.length}`);
  console.log(`Total annales records:    ${results.length}`);

  // Summary by type
  const evcfCount = results.filter((r) => r.type === 'evcf').length;
  const evcpCount = results.filter((r) => r.type === 'evcp').length;
  console.log(`\n  EVCF entries: ${evcfCount}`);
  console.log(`  EVCP entries: ${evcpCount}`);

  // Summary by specialty
  console.log('\n--- By specialty ---');
  const bySpecialty = new Map<string, number>();
  for (const r of results) {
    const key = `[${r.specialtyCode}] ${r.specialtyName}`;
    bySpecialty.set(key, (bySpecialty.get(key) || 0) + 1);
  }
  for (const [key, count] of [...bySpecialty.entries()].sort()) {
    console.log(`  ${key}: ${count} files`);
  }

  // Summary by year
  console.log('\n--- By year ---');
  const byYear = new Map<number, { evcf: number; evcp: number }>();
  for (const r of results) {
    if (!byYear.has(r.year)) byYear.set(r.year, { evcf: 0, evcp: 0 });
    byYear.get(r.year)![r.type]++;
  }
  for (const [year, counts] of [...byYear.entries()].sort((a, b) => a[0] - b[0])) {
    console.log(`  ${year}: EVCF=${counts.evcf}, EVCP=${counts.evcp}`);
  }

  // Total questions
  const totalQuestions = results.reduce((sum, r) => sum + r.questions.length, 0);
  console.log(`\nTotal questions extracted: ${totalQuestions}`);

  // Show errors
  if (errors.length > 0) {
    console.log('\n--- Errors ---');
    for (const e of errors) {
      console.log(`  ${e.file}: ${e.error}`);
    }
  }

  // Show skipped
  if (skipped.length > 0) {
    console.log('\n--- Skipped ---');
    for (const s of skipped) {
      console.log(`  ${s.file}: ${s.reason}`);
    }
  }

  // ------ Write JSON ------
  const outputPath = path.join(ROOT, 'scripts', 'parsed-annales.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`\nJSON written to: ${outputPath}`);
  console.log(`File size: ${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

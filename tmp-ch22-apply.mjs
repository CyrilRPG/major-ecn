import { readFileSync, writeFileSync } from 'node:fs';

const MODULE = 'scripts/anesthesie-courses/chapter-22.mjs';
const patch = JSON.parse(readFileSync('tmp-ch22-patch.json', 'utf8'));
let src = readFileSync(MODULE, 'utf8');

// Locate every qcm( call in source order.
const calls = [];
for (let i = 0; i < src.length; i += 1) {
  if (src.startsWith('qcm(', i) && !/[A-Za-z0-9_]/.test(src[i - 1] || ' ')) {
    calls.push(i);
  }
}
if (calls.length !== 96) throw new Error(`qcm( trouvés: ${calls.length}`);

function skipString(s, i) {
  const quote = s[i];
  i += 1;
  while (i < s.length) {
    if (s[i] === '\\') { i += 2; continue; }
    if (s[i] === quote) return i + 1;
    i += 1;
  }
  throw new Error('chaîne non terminée');
}

// Returns the [start,end) ranges of the five T()/F() items of the nth qcm call.
function itemRanges(start) {
  let i = start + 4;
  let depth = 0;
  let argIndex = 0;
  // the items array is the fourth argument of qcm(...)
  let arrayStart = -1;
  while (i < src.length) {
    const c = src[i];
    if (c === '"' || c === "'" || c === '`') { i = skipString(src, i); continue; }
    if (depth === 0 && c === ',') { argIndex += 1; i += 1; continue; }
    if (c === '(' || c === '[' || c === '{') {
      if (depth === 0 && c === '[' && argIndex === 3) { arrayStart = i; break; }
      depth += 1; i += 1; continue;
    }
    if (c === ')' || c === ']' || c === '}') {
      if (depth === 0) break;
      depth -= 1; i += 1; continue;
    }
    i += 1;
  }
  if (arrayStart < 0) throw new Error('tableau items introuvable');
  // walk inside the array, collecting top-level T(/F( calls
  i = arrayStart + 1;
  let d = 0;
  const ranges = [];
  while (i < src.length) {
    const c = src[i];
    if (c === '"' || c === "'" || c === '`') { i = skipString(src, i); continue; }
    if (d === 0 && (src.startsWith('T(', i) || src.startsWith('F(', i)) && !/[A-Za-z0-9_]/.test(src[i - 1] || ' ')) {
      // scan to matching close paren
      let j = i + 1;
      let dd = 0;
      while (j < src.length) {
        const k = src[j];
        if (k === '"' || k === "'" || k === '`') { j = skipString(src, j); continue; }
        if (k === '(') { dd += 1; j += 1; continue; }
        if (k === ')') { dd -= 1; j += 1; if (dd === 0) break; continue; }
        j += 1;
      }
      ranges.push([i, j]);
      i = j;
      continue;
    }
    if (c === '(' || c === '[' || c === '{') { d += 1; i += 1; continue; }
    if (c === ')' || c === '}') { d -= 1; i += 1; continue; }
    if (c === ']') { if (d === 0) break; d -= 1; i += 1; continue; }
    i += 1;
  }
  if (ranges.length !== 5) throw new Error(`items trouvés: ${ranges.length}`);
  return ranges;
}

const esc = (value) => JSON.stringify(value);
const LETTERS = ['A', 'B', 'C', 'D', 'E'];
const edits = [];
for (const [key, value] of Object.entries(patch)) {
  const match = /^Q(\d+)([A-E])$/.exec(key);
  if (!match) throw new Error(`clé invalide ${key}`);
  const qIndex = Number(match[1]) - 1;
  const letterIndex = LETTERS.indexOf(match[2]);
  const ranges = itemRanges(calls[qIndex]);
  const [start, end] = ranges[letterIndex];
  const fn = value.juste ? 'T' : 'F';
  const replacement = `${fn}(\n            ${esc(value.enonce)},\n            ${esc(value.justification)},\n          )`;
  edits.push({ start, end, replacement, key });
}
edits.sort((a, b) => b.start - a.start);
for (const edit of edits) {
  src = src.slice(0, edit.start) + edit.replacement + src.slice(edit.end);
}
writeFileSync(MODULE, src);
console.log(`${edits.length} propositions réécrites.`);

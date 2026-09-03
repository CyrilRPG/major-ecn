#!/usr/bin/env node
// Le helper qcm() préfixe lui-même la nouvelle information à l'énoncé. Quand le
// littéral la contient déjà, la phrase apparaît deux fois dans le paquet livré.
// Ce script retire ce préfixe en double. Il ne touche à aucun contenu médical :
// le texte rendu est identique, la phrase n'y figure simplement plus qu'une fois.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const BACKSLASH = String.fromCharCode(92);
const numero = Number(process.argv.find((arg) => /^--chapter=/.test(arg))?.split('=')[1]);
const write = process.argv.includes('--write');
if (!Number.isInteger(numero) || numero < 1 || numero > 43) {
  throw new Error('Usage : node scripts/fix-anesthesie-stem-duplication.mjs --chapter=NN [--write]');
}
const path = join(ROOT, 'scripts', 'anesthesie-courses', `chapter-${String(numero).padStart(2, '0')}.mjs`);
const source = readFileSync(path, 'utf8');

// Découpe les appels qcm( en repérant les virgules de premier niveau.
function scanCalls(text) {
  const calls = [];
  const matcher = /\bqcm\(/g;
  let match;
  while ((match = matcher.exec(text))) {
    let depth = 1;
    let quote = null;
    let escaped = false;
    let end = -1;
    const commas = [];
    for (let index = matcher.lastIndex; index < text.length; index += 1) {
      const character = text[index];
      if (quote) {
        if (escaped) escaped = false;
        else if (character === BACKSLASH) escaped = true;
        else if (character === quote) quote = null;
        continue;
      }
      if (character === '"' || character === "'" || character === '`') { quote = character; continue; }
      if (character === '(' || character === '[' || character === '{') depth += 1;
      if (character === ')' || character === ']' || character === '}') depth -= 1;
      if (depth === 1 && character === ',') commas.push(index);
      if (depth === 0) { end = index + 1; break; }
    }
    if (end < 0) throw new Error(`Appel qcm non fermé à l'offset ${match.index}.`);
    calls.push({ start: matcher.lastIndex, end, commas });
    matcher.lastIndex = end;
  }
  return calls;
}

// Les modules mêlent guillemets doubles et apostrophes simples ; JSON.parse ne
// lit que les premiers, d'où une lecture manuelle.
function readLiteral(raw) {
  const text = raw.trim();
  const quote = text[0];
  if ((quote !== '"' && quote !== "'") || text[text.length - 1] !== quote) return null;
  let value = '';
  for (let index = 1; index < text.length - 1; index += 1) {
    const character = text[index];
    if (character === BACKSLASH) {
      index += 1;
      const next = text[index];
      value += next === 'n' ? '\n' : next === 't' ? '\t' : next;
      continue;
    }
    value += character;
  }
  return { value, quote };
}

const writeLiteral = (value, quote) => {
  const escaped = value.split(BACKSLASH).join(BACKSLASH + BACKSLASH).split(quote).join(BACKSLASH + quote);
  return `${quote}${escaped}${quote}`;
};

const calls = scanCalls(source);
let output = source;
let removed = 0;
for (let index = calls.length - 1; index >= 0; index -= 1) {
  const call = calls[index];
  // Un appel peut porter une virgule finale : le dernier « argument » n'est alors
  // que de l'espace, et il ne faut pas le compter.
  const cuts = call.commas.slice();
  while (cuts.length && !output.slice(cuts[cuts.length - 1] + 1, call.end - 1).trim()) cuts.pop();
  if (cuts.length !== 4) continue; // pas de nouvelle information
  const bounds = (position) => [
    position === 0 ? call.start : cuts[position - 1] + 1,
    position === 4 ? (call.commas.length > cuts.length ? call.commas[cuts.length] : call.end - 1) : cuts[position],
  ];
  const [stemFrom, stemTo] = bounds(0);
  const [infoFrom, infoTo] = bounds(4);
  const rawStem = output.slice(stemFrom, stemTo);
  const stem = readLiteral(rawStem);
  const info = readLiteral(output.slice(infoFrom, infoTo));
  if (!stem || !info || !info.value.trim()) continue;
  if (!stem.value.startsWith(info.value)) continue;
  const stripped = stem.value.slice(info.value.length).trim();
  if (!stripped) continue;
  const indent = rawStem.match(/^(\s*)/)[1];
  output = output.slice(0, stemFrom) + indent + writeLiteral(stripped, stem.quote) + output.slice(stemTo);
  removed += 1;
}

console.log(JSON.stringify({ chapitre: numero, appelsQcm: calls.length, prefixesRetires: removed, ecrit: write }));
if (write) writeFileSync(path, output, 'utf8');

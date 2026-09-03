/**
 * Strict, fiche-only Orthopedie quality pass.
 *
 * This deliberately never touches questions, QCM series, flashcards, or image
 * paths.  It removes unproven EVC/annales star decoration, repairs only known
 * UTF-8-as-Windows-1252 mojibake sequences, and audits genuine nested lists.
 * A nested list is accepted only when it is a direct child of a named parent
 * <li>; no hierarchy is invented from punctuation or from sentence splitting.
 *
 * Usage:
 *   node scripts/audit-repair-orthopedie-fiche-content.mjs <report.json> [--repair] [coursId ...]
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { config as dotenv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv({ path: '.env.local' });
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_URL manquants');

const args = process.argv.slice(2);
const repair = args.includes('--repair');
const keepEvcDecoration = args.includes('--keep-evc-decoration');
const outputArg = args.find((arg) => arg.toLowerCase().endsWith('.json'));
if (!outputArg) throw new Error('Rapport JSON requis en premier argument.');
if (resolve(outputArg).toLowerCase().endsWith('worklist.json')) throw new Error('Refus d\'ecrire un rapport dans worklist.json');
const requestedIds = new Set(args.filter((arg) => /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(arg)));
const supabase = createClient(url, key, { auth: { persistSession: false } });
const corpusRoot = resolve('../.corpus-orthopedie');
const worklist = JSON.parse(readFileSync(join(corpusRoot, 'worklist.json'), 'utf8'));
const entries = requestedIds.size ? worklist.filter((entry) => requestedIds.has(entry.coursId)) : worklist;
if (requestedIds.size && entries.length !== requestedIds.size) throw new Error(`coursId absent de worklist (${requestedIds.size} demandés, ${entries.length} trouvés)`);

// Explicit substitutions only.  A whole-document re-decoding would corrupt
// already-valid French text, hence these known signatures are intentionally
// narrow and repeatable.
const mojibake = new Map([
  ['\\u00c2\\u00a0', ' '], ['\\u00c2\\u00b0', '\\u00b0'], ['\\u00c2\\u00b1', '\\u00b1'], ['\\u00c2\\u00b7', '\\u00b7'],
  ['\\u00c3\\u0080', '\\u00c0'], ['\\u00c3\\u0082', '\\u00c2'], ['\\u00c3\\u0087', '\\u00c7'], ['\\u00c3\\u0088', '\\u00c8'], ['\\u00c3\\u0089', '\\u00c9'], ['\\u00c3\\u008a', '\\u00ca'], ['\\u00c3\\u008e', '\\u00ce'], ['\\u00c3\\u0094', '\\u00d4'], ['\\u00c3\\u0099', '\\u00d9'],
  ['\\u00c3\\u00a0', '\\u00e0'], ['\\u00c3\\u00a2', '\\u00e2'], ['\\u00c3\\u00a4', '\\u00e4'], ['\\u00c3\\u00a7', '\\u00e7'], ['\\u00c3\\u00a8', '\\u00e8'], ['\\u00c3\\u00a9', '\\u00e9'], ['\\u00c3\\u00aa', '\\u00ea'], ['\\u00c3\\u00ab', '\\u00eb'], ['\\u00c3\\u00ae', '\\u00ee'], ['\\u00c3\\u00af', '\\u00ef'], ['\\u00c3\\u00b4', '\\u00f4'], ['\\u00c3\\u00b6', '\\u00f6'], ['\\u00c3\\u00b9', '\\u00f9'], ['\\u00c3\\u00bb', '\\u00fb'], ['\\u00c3\\u00bc', '\\u00fc'], ['\\u00c3\\u00bf', '\\u00ff'],
  ['\\u00e2\\u20ac\\u2122', '\\u2019'], ['\\u00e2\\u20ac\\u2018', '\\u2018'], ['\\u00e2\\u20ac\\u0153', '\\u201c'], ['\\u00e2\\u20ac\\u009d', '\\u201d'], ['\\u00e2\\u20ac\\u201c', '\\u2013'], ['\\u00e2\\u20ac\\u201d', '\\u2014'], ['\\u00e2\\u20ac\\u00a6', '\\u2026'], ['\\u00e2\\u2020\\u2019', '\\u2192'], ['\\u00e2\\u2030\\u00a4', '\\u2264'], ['\\u00e2\\u2030\\u00a5', '\\u2265'], ['\\u00e2\\u2030\\u02c6', '\\u2248'],
].map(([bad, good]) => [JSON.parse(`"${bad}"`), JSON.parse(`"${good}"`)]));

const count = (value, re) => (String(value || '').match(re) || []).length;
const suspiciousMojibake = (html) => count(html, /\u00c3[\u0080-\u00bf]|\u00c2[\u0080-\u00bf]|\u00e2(?:\u20ac|\u2020|\u2030)|\ufffd/g);
function repairMojibake(html) {
  let output = html;
  for (const [bad, good] of mojibake) output = output.split(bad).join(good);
  return output;
}
function removeUnsupportedEvcDecoration(html) {
  let output = html;
  // The content model has no per-marker annale provenance.  EVC stars are
  // therefore unsupported and must be removed rather than guessed.
  output = output.replace(/\s*<span\s+class=["'][^"']*\bfmark\b[^"']*\bm-ecn\b[^"']*["'][^>]*>[\s\S]*?<\/span>/gi, '');
  output = output.replace(/<span class=["']cover-legend-item["']>\s*<span class=["'][^"']*cover-legend-sym--1[^"']*["'][^>]*>[\s\S]*?<\/span>\s*<span class=["']cover-legend-text["']>\s*(?:D\u00e9j\u00e0 tomb\u00e9 aux EVC|Deja tombe aux EVC)\s*<\/span>\s*<\/span>/gi, '');
  return output;
}
function nestedListAudit(html) {
  const stack = [];
  let allNested = 0;
  let invalidNested = 0;
  for (const token of String(html).matchAll(/<\/?(?:ul|li)\b[^>]*>/gi)) {
    const value = token[0].toLowerCase();
    const closing = /^<\//.test(value);
    const name = /^<\/?(ul|li)\b/i.exec(value)?.[1].toLowerCase();
    if (closing) {
      for (let index = stack.length - 1; index >= 0; index--) {
        if (stack[index] === name) { stack.splice(index, 1); break; }
      }
      continue;
    }
    if (name === 'ul' && stack.includes('ul')) {
      allNested++;
      if (stack.at(-1) !== 'li') invalidNested++;
    }
    stack.push(name);
  }
  // An inner UL not immediately held by a list item is a visual indentation
  // artifact, not a semantic child list.  We report it but do not fabricate
  // content to repair it.
  return { allNested, invalidNested };
}
function snapshot(entry, fiche) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const directory = join(corpusRoot, entry.slug, 'delivery', stamp, 'published-before-fiche-content-quality-pass');
  const body = JSON.stringify({ version: 1, createdAt: new Date().toISOString(), course: { id: entry.coursId, titre: entry.titre }, fiche }, null, 2) + '\n';
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, 'snapshot.json'), body, 'utf8');
  writeFileSync(join(directory, 'manifest.json'), JSON.stringify({ courseId: entry.coursId, sha256: createHash('sha256').update(body).digest('hex'), operation: 'fiche-only-quality-pass' }, null, 2) + '\n', 'utf8');
  return directory;
}

const rows = [];
for (const entry of entries) {
  const { data: fiche, error } = await supabase.from('fiches').select('id,cours_id,titre,content_html,pages,content_format,order_index,storage_path').eq('cours_id', entry.coursId).order('order_index').limit(1).maybeSingle();
  if (error) throw error;
  if (!fiche) { rows.push({ coursId: entry.coursId, slug: entry.slug, title: entry.titre, status: 'missing' }); continue; }
  const before = fiche.content_html || '';
  const beforeNested = nestedListAudit(before);
  let after = repairMojibake(before);
  if (!keepEvcDecoration) after = removeUnsupportedEvcDecoration(after);
  const afterNested = nestedListAudit(after);
  const metrics = {
    before: {
      evcStars: count(before, /\bm-ecn\b/gi),
      evcLegend: count(before, /D\u00e9j\u00e0 tomb\u00e9 aux EVC/gi),
      mojibake: suspiciousMojibake(before),
      nestedLists: beforeNested.allNested,
      invalidNestedLists: beforeNested.invalidNested,
    },
    after: {
      evcStars: count(after, /\bm-ecn\b/gi),
      evcLegend: count(after, /D\u00e9j\u00e0 tomb\u00e9 aux EVC/gi),
      mojibake: suspiciousMojibake(after),
      nestedLists: afterNested.allNested,
      invalidNestedLists: afterNested.invalidNested,
    },
  };
  const changed = after !== before;
  const unresolved = (!keepEvcDecoration && (metrics.after.evcStars || metrics.after.evcLegend)) || metrics.after.mojibake || metrics.after.invalidNestedLists;
  const row = { coursId: entry.coursId, slug: entry.slug, title: entry.titre, ficheId: fiche.id, pages: fiche.pages, changed, status: unresolved ? 'repair' : 'ok', ...metrics };
  if (repair && changed && !unresolved) {
    row.snapshot = snapshot(entry, fiche);
    const { error: updateError } = await supabase.from('fiches').update({ content_html: after }).eq('id', fiche.id);
    if (updateError) throw updateError;
    // Read-after-write is the transactional publication QA for this narrow
    // HTML-only repair.
    const { data: published, error: readError } = await supabase.from('fiches').select('content_html').eq('id', fiche.id).single();
    if (readError || published.content_html !== after) throw readError || new Error(`Publication non confirmée pour ${entry.slug}`);
    row.published = true;
  }
  rows.push(row);
}
const totals = {
  courses: rows.length,
  ok: rows.filter((row) => row.status === 'ok').length,
  repair: rows.filter((row) => row.status === 'repair').length,
  missing: rows.filter((row) => row.status === 'missing').length,
  changed: rows.filter((row) => row.changed).length,
  published: rows.filter((row) => row.published).length,
  evcStarsBefore: rows.reduce((sum, row) => sum + (row.before?.evcStars || 0), 0),
  evcStarsAfter: rows.reduce((sum, row) => sum + (row.after?.evcStars || 0), 0),
  evcLegendBefore: rows.reduce((sum, row) => sum + (row.before?.evcLegend || 0), 0),
  evcLegendAfter: rows.reduce((sum, row) => sum + (row.after?.evcLegend || 0), 0),
  mojibakeBefore: rows.reduce((sum, row) => sum + (row.before?.mojibake || 0), 0),
  mojibakeAfter: rows.reduce((sum, row) => sum + (row.after?.mojibake || 0), 0),
  semanticNestedLists: rows.reduce((sum, row) => sum + (row.after?.nestedLists || 0), 0),
  invalidNestedLists: rows.reduce((sum, row) => sum + (row.after?.invalidNestedLists || 0), 0),
};
const report = { generatedAt: new Date().toISOString(), mode: repair ? 'repair-and-publish-fiche-only' : 'audit-only', scope: 'Orthopedie / editable content_html only', totals, rows };
mkdirSync(dirname(resolve(outputArg)), { recursive: true });
writeFileSync(resolve(outputArg), JSON.stringify(report, null, 2) + '\n', 'utf8');
console.log(JSON.stringify(totals));
console.table(rows.filter((row) => row.changed || row.status !== 'ok').map((row) => ({ title: row.title, changed: row.changed, status: row.status, stars: `${row.before?.evcStars || 0}->${row.after?.evcStars || 0}`, legend: `${row.before?.evcLegend || 0}->${row.after?.evcLegend || 0}`, mojibake: `${row.before?.mojibake || 0}->${row.after?.mojibake || 0}`, nested: `${row.after?.nestedLists || 0}/${row.after?.invalidNestedLists || 0}` })));

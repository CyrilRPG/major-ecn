/**
 * Removes unsupported "annales / EVC" decoration from Orthopedie Fiche HTML.
 *
 * This deliberately does not read or write QCM, DP, flashcards, figures, or
 * encoding. Every changed Fiche is snapshotted before the HTML-only update and
 * read back immediately afterwards.
 *
 * Usage: node scripts/remove-unsupported-annales-fiche-only.mjs <report.json> [--publish]
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { config as dotenv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv({ path: '.env.local' });
const reportPath = process.argv.slice(2).find((argument) => argument.toLowerCase().endsWith('.json'));
if (!reportPath) throw new Error('Un chemin de rapport JSON est requis.');
if (resolve(reportPath).toLowerCase().endsWith('worklist.json')) throw new Error('Refus d\'ecrire un rapport dans worklist.json.');
const publish = process.argv.includes('--publish');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const corpusRoot = resolve('../.corpus-orthopedie');
const worklist = JSON.parse(readFileSync(join(corpusRoot, 'worklist.json'), 'utf8'));

// Phrase-level marker, deliberately limited to unsupported claims. A medical
// occurrence of the word "annale" elsewhere is not modified by this pass.
const unsupported = /(?:[★☆⭐]\s*)?(?:(?:déjà\s+)?tomb(?:é|ée|es|ées)?\s+(?:aux|dans\s+les?)\s*(?:annales|EVC)|(?:annales|EVC)\s*[:–—-]?\s*(?:déjà\s+)?tomb(?:é|ée|es|ées)?)/iu;
const starOnly = /^[\s★☆⭐]+$/u;
const tagText = (html) => String(html || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim();
const occurrenceCount = (html) => {
  const content = String(html || '');
  const phrases = [...content.matchAll(new RegExp(unsupported.source, 'giu'))].length;
  const stars = (content.match(/[★☆⭐]/gu) || []).length;
  return { phrases, stars };
};

function removeUnsupportedAnnales(html) {
  let output = String(html || '');
  // A legend/badge is self-contained in standard templates. Remove its whole
  // element so the cover never retains an empty separator or a lone star.
  for (const tag of ['tr', 'li', 'p', 'div', 'span']) {
    const full = new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, 'giu');
    output = output.replace(full, (element) => {
      const visible = tagText(element);
      return unsupported.test(visible) && visible.length <= 180 ? '' : element;
    });
  }
  // Remove residual inline claim only, including adjacent parentheses and its
  // decorative star; retain surrounding medical prose if present.
  const inline = new RegExp(`\\s*(?:[\\(\\[|]\s*)?[★☆⭐]?\\s*${unsupported.source}\\s*(?:[\\)\\]|])?`, 'giu');
  output = output.replace(inline, '');
  // A raw decorative star without a validated source is never meaningful in a
  // Fiche. The requested scope explicitly includes every such star.
  output = output.replace(/[★☆⭐]/gu, '');
  output = output.replace(/\s{2,}/g, ' ');
  return output;
}

function snapshot(entry, fiche) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const directory = join(corpusRoot, entry.slug, 'delivery', timestamp, 'published-before-unsupported-annales-removal');
  const content = `${JSON.stringify({ version: 1, createdAt: new Date().toISOString(), course: { id: entry.coursId, titre: entry.titre }, fiche }, null, 2)}\n`;
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, 'snapshot.json'), content, 'utf8');
  writeFileSync(join(directory, 'manifest.json'), `${JSON.stringify({ courseId: entry.coursId, operation: 'remove-unsupported-annales-fiche-only', sha256: createHash('sha256').update(content).digest('hex') }, null, 2)}\n`, 'utf8');
  return directory;
}

const { data: courses, error: courseError } = await supabase.from('cours').select('id,titre,order_index').eq('matiere_id', 'col-orthopedie').order('order_index');
if (courseError) throw courseError;
const rows = [];
for (const course of courses) {
  const entry = worklist.find((candidate) => candidate.coursId === course.id);
  if (!entry) throw new Error(`Cours absent de worklist: ${course.id}`);
  const { data: fiche, error } = await supabase.from('fiches').select('id,content_html,content_format,pages,order_index').eq('cours_id', course.id).order('order_index').limit(1).maybeSingle();
  if (error) throw error;
  if (!fiche) { rows.push({ coursId: course.id, title: course.titre, status: 'missing' }); continue; }
  const before = fiche.content_html || '';
  const beforeCounts = occurrenceCount(before);
  if (!beforeCounts.phrases && !beforeCounts.stars) {
    rows.push({ coursId: course.id, title: course.titre, status: 'clean', changed: false, before: beforeCounts, after: beforeCounts });
    continue;
  }
  const after = removeUnsupportedAnnales(before);
  const afterCounts = occurrenceCount(after);
  if (afterCounts.phrases || afterCounts.stars) throw new Error(`Marqueur non retire pour ${course.titre}`);
  const row = { coursId: course.id, title: course.titre, ficheId: fiche.id, status: 'clean', changed: after !== before, before: beforeCounts, after: afterCounts };
  if (publish && row.changed) {
    row.snapshot = snapshot(entry, fiche);
    const { error: updateError } = await supabase.from('fiches').update({ content_html: after, content_format: 'html' }).eq('id', fiche.id);
    if (updateError) throw updateError;
    const { data: readBack, error: readError } = await supabase.from('fiches').select('content_html').eq('id', fiche.id).single();
    if (readError || readBack.content_html !== after) throw readError || new Error(`Publication non confirmee: ${course.titre}`);
    row.published = true;
  }
  rows.push(row);
}
const totals = {
  courses: rows.length,
  missing: rows.filter((row) => row.status === 'missing').length,
  affected: rows.filter((row) => row.changed).length,
  published: rows.filter((row) => row.published).length,
  unsupportedAnnalesBefore: rows.reduce((total, row) => total + (row.before?.phrases || 0) + (row.before?.stars || 0), 0),
  unsupportedAnnalesAfter: rows.reduce((total, row) => total + (row.after?.phrases || 0) + (row.after?.stars || 0), 0),
};
const report = { generatedAt: new Date().toISOString(), mode: publish ? 'publish' : 'audit', scope: 'fiches.content_html only; QCM/DP/flashcards untouched', totals, rows };
mkdirSync(dirname(resolve(reportPath)), { recursive: true });
writeFileSync(resolve(reportPath), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(totals));

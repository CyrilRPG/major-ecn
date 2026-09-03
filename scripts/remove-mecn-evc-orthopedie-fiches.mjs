/**
 * Fiche-only repair for the Orthopedie EVC marker audit.
 *
 * The marker is a presentational span (`m-ecn`), not medical content.  This
 * script deliberately reads/writes only fiches.content_html for the 13 course
 * ids supplied by the strict audit.  Each original fiche is saved before the
 * update, and the published value is read back before the script completes.
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { config as dotenv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv({ path: '.env.local' });

const reportArg = process.argv[2];
if (!reportArg || !reportArg.toLowerCase().endsWith('.json')) {
  throw new Error('Usage: node scripts/remove-mecn-evc-orthopedie-fiches.mjs <report.json> --publish');
}
const publish = process.argv.includes('--publish');
const targetIds = [
  'ec3ef872-17db-4735-bdcc-522046013ef4',
  '98f57bde-879d-4971-bf6a-3447d96b2275',
  '8aeefb0c-6ec3-4722-b7b3-7f4bf81de3c6',
  '6329536d-6dd4-4b23-83f2-9dde98a02dde',
  '73aa488f-99e9-4a7f-b9ce-875d8f68a61b',
  'ee83abb9-9dcf-4eaa-8750-d964188e18d0',
  'a1261414-9b4d-421c-98cc-14dbf4e6f8bf',
  '4ce611bc-536e-4c5a-80cf-e5e220a68258',
  '66605dce-9717-4c72-8ba0-5f2d0ae18e37',
  '55464b2c-9cad-4184-9e45-cf6e3072a2b4',
  '581caa10-99f7-43bd-b56d-a0be723330da',
  '1e1124e8-89c0-4424-b83d-a4012aebabe3',
  '539897f6-825b-4c86-b46b-2b7fcac79cbd',
];
const corpusRoot = resolve('../.corpus-orthopedie');
const worklist = JSON.parse(readFileSync(join(corpusRoot, 'worklist.json'), 'utf8'));
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const markerCount = (html) => (String(html || '').match(/\bm-ecn\b/giu) || []).length;
const emptyLegendCount = (html) => (String(html || '').match(/<div\b[^>]*\bclass=(['"])[^'"]*\bcover-legend\b[^'"]*\1[^>]*>\s*<div\b[^>]*\bclass=(['"])[^'"]*\bcover-section-label\b[^'"]*\2[^>]*>\s*(?:L[ée]gende)\s*<\/div>\s*<\/div>/giu) || []).length;

function removeMarkerElements(html) {
  let output = String(html || '');
  // The generated fiche template uses a self-contained span.  Remove that
  // whole element first, leaving its neighbouring medical text untouched.
  output = output.replace(/<span\b[^>]*\bclass=(['"])[^'"]*\bm-ecn\b[^'"]*\1[^>]*>[\s\S]*?<\/span\s*>/giu, '');
  // The audit requires no residual selector/token (including a malformed or
  // empty marker).  This changes presentation metadata only.
  output = output.replace(/\bm-ecn\b/giu, '');
  output = output.replace(/class=(['"])\s+\1/giu, '');
  // Once the EVC span is gone, this generated legend only displays a blank
  // "Légende" heading on the cover.  It contains no medical information.
  output = output.replace(/<div\b[^>]*\bclass=(['"])[^'"]*\bcover-legend\b[^'"]*\1[^>]*>\s*<div\b[^>]*\bclass=(['"])[^'"]*\bcover-section-label\b[^'"]*\2[^>]*>\s*(?:L[ée]gende)\s*<\/div>\s*<\/div>/giu, '');
  return output;
}

function snapshot(course, fiche) {
  const entry = worklist.find((candidate) => candidate.coursId === course.id);
  if (!entry) throw new Error(`Cours absent de la worklist: ${course.id}`);
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const directory = join(corpusRoot, entry.slug, 'delivery', stamp, 'published-before-mecn-evc-removal');
  const payload = `${JSON.stringify({ version: 1, createdAt: new Date().toISOString(), course: { id: course.id, title: course.titre }, fiche }, null, 2)}\n`;
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, 'snapshot.json'), payload, 'utf8');
  writeFileSync(join(directory, 'manifest.json'), `${JSON.stringify({ courseId: course.id, operation: 'remove-mecn-evc-fiche-only', sha256: createHash('sha256').update(payload).digest('hex') }, null, 2)}\n`, 'utf8');
  return directory;
}

const { data: courses, error: courseError } = await supabase
  .from('cours').select('id,titre,order_index').in('id', targetIds).eq('matiere_id', 'col-orthopedie');
if (courseError) throw courseError;
if (courses.length !== targetIds.length) throw new Error(`Portee invalide: ${courses.length}/${targetIds.length} cours Orthopedie trouves.`);
const rows = [];
for (const courseId of targetIds) {
  const course = courses.find((candidate) => candidate.id === courseId);
  const { data: fiche, error } = await supabase.from('fiches')
    .select('id,cours_id,content_html,content_format,pages,order_index,storage_path')
    .eq('cours_id', course.id).order('order_index').limit(1).maybeSingle();
  if (error || !fiche) throw error || new Error(`Fiche absente: ${course.id}`);
  const before = String(fiche.content_html || '');
  const after = removeMarkerElements(before);
  const row = { coursId: course.id, ficheId: fiche.id, title: course.titre, beforeMarkers: markerCount(before), afterMarkers: markerCount(after), beforeEmptyLegends: emptyLegendCount(before), afterEmptyLegends: emptyLegendCount(after), changed: after !== before };
  if (row.beforeMarkers < 1 && row.beforeEmptyLegends < 1) throw new Error(`Aucun residu m-ecn/legende vide dans la fiche cible: ${course.id}`);
  if (row.afterMarkers !== 0 || row.afterEmptyLegends !== 0) throw new Error(`Residus mecaniques dans ${course.id}`);
  if (publish) {
    row.snapshot = snapshot(course, fiche);
    row.cleanedHtml = join(row.snapshot, 'cleaned.html');
    writeFileSync(row.cleanedHtml, after, 'utf8');
    const { error: updateError } = await supabase.from('fiches').update({ content_html: after, content_format: 'html' }).eq('id', fiche.id);
    if (updateError) throw updateError;
    const { data: readBack, error: readError } = await supabase.from('fiches').select('content_html').eq('id', fiche.id).single();
    if (readError || readBack.content_html !== after || markerCount(readBack.content_html) !== 0 || emptyLegendCount(readBack.content_html) !== 0) throw readError || new Error(`Readback invalide: ${course.id}`);
    row.published = true;
  }
  rows.push(row);
}
const totals = { courses: rows.length, changed: rows.filter((row) => row.changed).length, published: rows.filter((row) => row.published).length, markersBefore: rows.reduce((sum, row) => sum + row.beforeMarkers, 0), markersAfter: rows.reduce((sum, row) => sum + row.afterMarkers, 0), emptyLegendsBefore: rows.reduce((sum, row) => sum + row.beforeEmptyLegends, 0), emptyLegendsAfter: rows.reduce((sum, row) => sum + row.afterEmptyLegends, 0) };
const report = { generatedAt: new Date().toISOString(), scope: '13 Orthopedie fiches.content_html only; no QCM, DP, flashcards, figures, or medical prose changed', mode: publish ? 'publish' : 'audit', totals, rows };
const reportPath = resolve(reportArg);
mkdirSync(dirname(reportPath), { recursive: true });
writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(totals));

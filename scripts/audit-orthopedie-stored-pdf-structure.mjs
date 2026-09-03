/**
 * Read-only audit of the PDFs actually served from Storage.
 * It detects missing or stale files, page-count drift, missing cover markers
 * and almost-empty interior pages after a full PDF regeneration.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { PDFDocument } from 'pdf-lib';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

config({ path: '.env.local' });
const output = process.argv[2];
if (!output?.endsWith('.json')) throw new Error('Usage: node scripts/audit-orthopedie-stored-pdf-structure.mjs <report.json>');
const courseFlag = process.argv.indexOf('--course');
const onlyCourse = courseFlag >= 0 ? process.argv[courseFlag + 1] : null;
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { data: courses, error: coursesError } = await db.from('cours')
  .select('id,titre,order_index').eq('matiere_id', 'col-orthopedie').order('order_index');
if (coursesError) throw coursesError;
const targetCourses = onlyCourse ? courses.filter((course) => course.id === onlyCourse) : courses;
if (onlyCourse && targetCourses.length !== 1) throw new Error(`Cours introuvable : ${onlyCourse}`);

const normalize = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const rows = [];
for (const course of targetCourses) {
  const { data: fiche, error } = await db.from('fiches').select('id,storage_path,pages').eq('cours_id', course.id).order('order_index').limit(1).maybeSingle();
  const defects = [];
  let observedPages = null;
  let firstPageText = '';
  let sparseInteriorPages = [];
  try {
    if (error || !fiche?.storage_path) throw error || new Error('storage_path manquant');
    const { data: blob, error: downloadError } = await db.storage.from('fiches').download(fiche.storage_path);
    if (downloadError || !blob) throw downloadError || new Error('PDF absent du Storage');
    const bytes = new Uint8Array(await blob.arrayBuffer());
    observedPages = (await PDFDocument.load(bytes)).getPageCount();
    const document = await getDocument({ data: bytes }).promise;
    const pageText = [];
    for (let index = 1; index <= document.numPages; index += 1) {
      const text = (await (await document.getPage(index)).getTextContent()).items.map((item) => item.str || '').join(' ').replace(/\s+/g, ' ').trim();
      pageText.push(text);
    }
    firstPageText = pageText[0] || '';
    sparseInteriorPages = pageText.slice(1, -1).map((text, index) => ({ page: index + 2, characters: text.length })).filter((entry) => entry.characters < 40);
    const compactCoverText = normalize(firstPageText).replaceAll(' ', '');
    if (fiche.pages !== observedPages) defects.push(`pages-db:${fiche.pages}/pdf:${observedPages}`);
    if (!compactCoverText.includes(normalize(course.titre).replaceAll(' ', '').slice(0, 20))) defects.push('cover-title-missing');
    if (!compactCoverText.includes('planducours')) defects.push('cover-plan-missing');
    if (sparseInteriorPages.length) defects.push(`sparse-interior:${sparseInteriorPages.map((entry) => entry.page).join(',')}`);
  } catch (auditError) {
    defects.push(`unreadable:${auditError instanceof Error ? auditError.message : String(auditError)}`);
  }
  rows.push({ coursId: course.id, orderIndex: course.order_index, title: course.titre, observedPages, firstPageCharacters: firstPageText.length, firstPagePreview: firstPageText.slice(0, 700), sparseInteriorPages, defects });
  console.log(`${defects.length ? 'REVIEW' : 'OK'} #${course.order_index} ${course.titre}`);
}
const blocking = rows.filter((row) => row.defects.some((defect) => defect.startsWith('unreadable') || defect.startsWith('pages-db') || defect === 'cover-title-missing' || defect === 'cover-plan-missing'));
mkdirSync(dirname(resolve(output)), { recursive: true });
writeFileSync(resolve(output), `${JSON.stringify({ generatedAt: new Date().toISOString(), scope: 'Orthopédie — PDF Storage structure audit', courses: rows.length, passed: blocking.length === 0, blocking: blocking.length, sparseInteriorWarnings: rows.filter((row) => row.sparseInteriorPages.length).length, rows }, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ courses: rows.length, blocking: blocking.length, sparseInteriorWarnings: rows.filter((row) => row.sparseInteriorPages.length).length, output: resolve(output) }));

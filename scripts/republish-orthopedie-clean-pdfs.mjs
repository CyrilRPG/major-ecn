/**
 * Re-publishes PDF files from the current, cleaned fiche HTML.
 *
 * Some student views keep the old Storage PDF even after content_html has
 * been corrected.  This script deliberately does not rewrite pedagogical
 * content: it renders the published HTML, rejects any remaining star marker,
 * uploads the PDF over the existing Storage object and records a readback.
 */
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import puppeteer from 'puppeteer-core';
import { PDFDocument } from 'pdf-lib';

config({ path: '.env.local' });
const output = process.argv[2];
if (!output?.endsWith('.json')) throw new Error('Usage: node scripts/republish-orthopedie-clean-pdfs.mjs <report.json> [--course <uuid>]');
const courseIndex = process.argv.indexOf('--course');
const onlyCourse = courseIndex >= 0 ? process.argv[courseIndex + 1] : null;
const minOrderIndex = process.argv.indexOf('--min-order');
const minOrder = minOrderIndex >= 0 ? Number(process.argv[minOrderIndex + 1]) : null;
const maxOrderIndex = process.argv.indexOf('--max-order');
const maxOrder = maxOrderIndex >= 0 ? Number(process.argv[maxOrderIndex + 1]) : null;
const pdfOutputIndex = process.argv.indexOf('--pdf-output');
const pdfOutput = pdfOutputIndex >= 0 ? resolve(process.argv[pdfOutputIndex + 1]) : null;
const screenshotOutputIndex = process.argv.indexOf('--screenshot-output');
const screenshotOutput = screenshotOutputIndex >= 0 ? resolve(process.argv[screenshotOutputIndex + 1]) : null;
if (pdfOutput && !onlyCourse) throw new Error('--pdf-output requires --course');
if (screenshotOutput && !onlyCourse) throw new Error('--screenshot-output requires --course');
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const repo = resolve('.');
const fontsBase = pathToFileURL(join(repo, 'public/fonts/fiches')).href;
const charteCss = readFileSync(join(repo, 'src/lib/fiches/charte-styles.css'), 'utf8')
  .replace(/url\("fonts\/([^\"]+)"\)/g, `url("${fontsBase}/$1")`);
const { data: courses, error: coursesError } = await db.from('cours')
  .select('id,titre,order_index').eq('matiere_id', 'col-orthopedie').order('order_index');
if (coursesError) throw coursesError;
const targetCourses = onlyCourse
  ? courses.filter((course) => course.id === onlyCourse)
  : courses.filter((course) => (minOrder === null || course.order_index >= minOrder) && (maxOrder === null || course.order_index <= maxOrder));
if (onlyCourse && targetCourses.length !== 1) throw new Error(`Cours introuvable : ${onlyCourse}`);
const chrome = process.env.PUPPETEER_EXECUTABLE_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox', '--font-render-hinting=none', '--allow-file-access-from-files'] });
const page = await browser.newPage();
const margins = { top: 24, right: 18, bottom: 22, left: 18 };
const mmToPx = (millimetres) => Math.round((millimetres * 96) / 25.4);
await page.setViewport({ width: mmToPx(210 - margins.left - margins.right), height: mmToPx(297 - margins.top - margins.bottom) });
const rows = [];
try {
  for (const course of targetCourses) {
    const { data: fiche, error } = await db.from('fiches')
      .select('id,content_html,storage_path,pages').eq('cours_id', course.id).order('order_index').limit(1).maybeSingle();
    if (error || !fiche) throw error || new Error(`Fiche absente : ${course.id}`);
    const html = String(fiche.content_html || '');
    if (/\u2605|\u2606|&#(?:9733|9734);|m-ecn|tomb[ée] aux (?:EVC|annales)/i.test(html)) {
      throw new Error(`Marqueur étoile résiduel dans le HTML : ${course.id}`);
    }
    await page.setContent(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>${charteCss}</style></head><body>${html}</body></html>`, { waitUntil: 'load' });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map((image) => image.decode?.().catch(() => undefined)));
    });
    await page.emulateMediaType('print');
    if (screenshotOutput) {
      mkdirSync(dirname(screenshotOutput), { recursive: true });
      await page.screenshot({ path: screenshotOutput, fullPage: true });
    }
    const pdf = await page.pdf({
      format: 'A4', printBackground: true,
      margin: { top: `${margins.top}mm`, right: `${margins.right}mm`, bottom: `${margins.bottom}mm`, left: `${margins.left}mm` },
      displayHeaderFooter: true,
      headerTemplate: `<div style="width:100%;font-size:8pt;padding:0 18mm;display:flex;justify-content:space-between;border-top:.7pt solid #1C2E49;padding-top:2mm"><span style="color:#8E99A8">${course.titre.replace(/[&<>]/g, '')}</span><span><span class="pageNumber"></span>/<span class="totalPages"></span></span></div>`,
      footerTemplate: '<div style="width:100%;font-size:7.6pt;padding:0 18mm;color:#8E99A8">MAJOR ECN · 2025-2026</div>',
    });
    if (pdfOutput) {
      mkdirSync(dirname(pdfOutput), { recursive: true });
      writeFileSync(pdfOutput, pdf);
    }
    const pages = (await PDFDocument.load(pdf)).getPageCount();
    const storagePath = fiche.storage_path || `${course.id}/fiche.pdf`;
    const { error: uploadError } = await db.storage.from('fiches').upload(storagePath, Buffer.from(pdf), { contentType: 'application/pdf', upsert: true });
    if (uploadError) throw uploadError;
    const { error: updateError } = await db.from('fiches').update({ storage_path: storagePath, pages }).eq('id', fiche.id);
    if (updateError) throw updateError;
    const { data: readback, error: readbackError } = await db.from('fiches').select('storage_path,pages').eq('id', fiche.id).single();
    if (readbackError || readback.storage_path !== storagePath || readback.pages !== pages) throw readbackError || new Error(`Readback PDF invalide : ${course.id}`);
    rows.push({ coursId: course.id, orderIndex: course.order_index, title: course.titre, pages, storagePath });
    console.log(`DONE #${course.order_index} ${course.titre}`);
  }
} finally {
  await browser.close();
}
mkdirSync(dirname(resolve(output)), { recursive: true });
writeFileSync(resolve(output), `${JSON.stringify({ generatedAt: new Date().toISOString(), scope: 'Orthopédie — republication des PDF nettoyés', courses: rows.length, rows }, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ courses: rows.length, output: resolve(output) }));

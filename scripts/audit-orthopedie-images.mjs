/**
 * Audits the published editable Orthopédie HTML for image failures.
 * It uses Chromium's decoder rather than regex alone: a syntactically present
 * data URI still fails when its bytes cannot be decoded.
 *
 * Usage: node scripts/audit-orthopedie-images.mjs <report.json> [coursId ...]
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { config as dotenv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import puppeteer from 'puppeteer-core';

dotenv({ path: '.env.local' });
const [output, ...args] = process.argv.slice(2);
if (!output) throw new Error('usage: node scripts/audit-orthopedie-images.mjs <report.json> [coursId ...]');
const requested = new Set(args.filter((id) => /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(id)));
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_URL manquants');
const supabase = createClient(url, key, { auth: { persistSession: false } });
const { data: courses, error: coursesError } = await supabase
  .from('cours').select('id,titre,order_index').eq('matiere_id', 'col-orthopedie').order('order_index');
if (coursesError) throw coursesError;
const scope = requested.size ? courses.filter((course) => requested.has(course.id)) : courses;
if (requested.size && requested.size !== scope.length) throw new Error(`Cours demandés introuvables: ${requested.size} demandés, ${scope.length} trouvés`);
const chrome = process.env.PUPPETEER_EXECUTABLE_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
const rows = [];
for (const course of scope) {
  const { data: fiche, error } = await supabase.from('fiches').select('content_html').eq('cours_id', course.id).order('order_index').limit(1).maybeSingle();
  if (error) throw error;
  if (!fiche) {
    rows.push({ coursId: course.id, orderIndex: course.order_index, title: course.titre, status: 'missing-fiche', images: [] });
    continue;
  }
  await page.setContent(`<!doctype html><html><body>${fiche.content_html || ''}</body></html>`, { waitUntil: 'load', timeout: 120000 });
  await page.evaluate(() => Promise.all([...document.images].map((image) => image.decode?.().catch(() => undefined))));
  const images = await page.evaluate(() => [...document.images].map((image, index) => {
    const raw = image.getAttribute('src') || '';
    const placeholder = /__(?:IMGFILE|IMG|LOGO|WATERMARK)[^_]*__/i.test(raw);
    const malformedData = raw.startsWith('data:') && !/^data:image\/(?:png|jpe?g|gif|webp|svg\+xml);base64,[A-Za-z0-9+/=\s]+$/i.test(raw);
    const broken = !raw || placeholder || malformedData || image.naturalWidth === 0 || image.naturalHeight === 0;
    return {
      index,
      alt: image.alt || '',
      srcKind: !raw ? 'empty' : placeholder ? 'placeholder' : raw.startsWith('data:image/') ? 'data-image' : raw.startsWith('http') ? 'external' : 'other',
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      broken,
      reason: !raw ? 'empty-src' : placeholder ? 'unresolved-placeholder' : malformedData ? 'malformed-data-uri' : image.naturalWidth === 0 || image.naturalHeight === 0 ? 'decoder-failure' : null,
    };
  }));
  const broken = images.filter((image) => image.broken);
  rows.push({ coursId: course.id, orderIndex: course.order_index, title: course.titre, status: broken.length ? 'repair' : 'ok', images, broken });
}
await browser.close();
const totals = { courses: rows.length, ok: rows.filter((row) => row.status === 'ok').length, repair: rows.filter((row) => row.status === 'repair').length, missingFiche: rows.filter((row) => row.status === 'missing-fiche').length, images: rows.reduce((sum, row) => sum + row.images.length, 0), brokenImages: rows.reduce((sum, row) => sum + (row.broken?.length || 0), 0) };
const report = { generatedAt: new Date().toISOString(), totals, rows };
const out = resolve(output);
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(totals));

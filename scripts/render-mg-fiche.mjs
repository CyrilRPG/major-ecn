/**
 * Rendu + publication d'une fiche Médecine générale (item) au format
 * `major-ecn-fiche` (charte luxe médical), SANS la route auth `render-html`.
 *
 * - Reprend la charte CSS + polices (file://) + en-têtes/pieds Major ECN.
 * - Injecte le watermark + logo (data-URI) extraits d'une fiche Dermatologie
 *   de référence (assets déjà dimensionnés), via les marqueurs __WATERMARK__
 *   et __LOGO__ du fichier HTML de corps.
 * - Rend le PDF via Chrome local (headless), upload dans Storage (bucket
 *   `fiches`) + upsert de la ligne `fiches` (content_html self-contained).
 *
 * Usage :
 *   node scripts/render-mg-fiche.mjs <coursId> <htmlBodyFile> "<nomCours>" [annee]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import os from 'node:os';
import { config as dotenv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import puppeteer from 'puppeteer-core';
import { PDFDocument } from 'pdf-lib';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
dotenv({ path: join(ROOT, '.env.local') });
dotenv({ path: join(ROOT, '.env') });

const [, , coursId, htmlBodyFile, nomCoursArg, anneeArg] = process.argv;
const nomCours = (nomCoursArg ?? 'Major ECN').slice(0, 200);
const annee = (anneeArg ?? '2025-2026').slice(0, 20);
if (!coursId || !htmlBodyFile) {
  console.error('Usage: node scripts/render-mg-fiche.mjs <coursId> <htmlBodyFile> "<nomCours>" [annee]');
  process.exit(1);
}

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) { console.error('SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_URL manquants dans .env.local'); process.exit(1); }
const CHROME = process.env.PUPPETEER_EXECUTABLE_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const supabase = createClient(URL, KEY, { auth: { autoRefreshToken: false, persistSession: false } });

// ── Assets (watermark + logo) repris d'une fiche Dermatologie de référence ──
const { data: ref } = await supabase
  .from('cours').select('fiches(content_html)').eq('matiere_id', 'col-dermatologie')
  .not('fiches', 'is', null).limit(1).maybeSingle();
const refHtml = ref?.fiches?.[0]?.content_html ?? '';
const uris = [...refHtml.matchAll(/src="(data:image\/[^"]+)"/g)].map((m) => m[1]);
if (uris.length < 2) { console.error('Impossible d\'extraire watermark/logo depuis une fiche Dermato de référence.'); process.exit(1); }
const WATERMARK = uris[0];
const LOGO = uris[1];

// ── En-têtes / pieds identiques à la route render-html ──
const NAVY = '#1C2E49', PEARL = '#8E99A8';
const M = { top: 24, right: 18, bottom: 22, left: 18 };
const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const header = `<div style="width:100%;font-size:8pt;font-family:Inter,sans-serif;padding:0 ${M.left}mm;display:flex;justify-content:space-between;border-top:0.7pt solid ${NAVY};padding-top:2mm;"><span style="color:${PEARL};">${esc(nomCours)}</span><span style="color:${NAVY};font-style:italic;"><span class="pageNumber"></span>/<span class="totalPages"></span></span></div>`;
const footer = `<div style="width:100%;font-size:7.6pt;font-family:Inter,sans-serif;padding:0 ${M.left}mm;display:flex;justify-content:space-between;align-items:center;"><span style="color:${PEARL};letter-spacing:0.12em;text-transform:uppercase;">Major ECN &middot; ${esc(annee)}</span><span style="color:#fff;background:${NAVY};border-radius:2.4mm;padding:1.5mm 4mm;font-weight:700;font-size:8pt;"><span class="pageNumber"></span>/<span class="totalPages"></span></span></div>`;

// ── Corps + charte ──
let bodyHtml = readFileSync(resolve(htmlBodyFile), 'utf-8')
  .replaceAll('__WATERMARK__', WATERMARK)
  .replaceAll('__LOGO__', LOGO);
const fontsBase = pathToFileURL(join(ROOT, 'public/fonts/fiches')).href;
const css = readFileSync(join(ROOT, 'src/lib/fiches/charte-styles.css'), 'utf-8')
  .replace(/url\("fonts\/([^"]+)"\)/g, `url("${fontsBase}/$1")`);
const fullHtml = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${esc(nomCours)}</title><style>${css}</style></head><body>${bodyHtml}</body></html>`;
const tmpHtml = join(os.tmpdir(), `mg-fiche-${coursId}.html`);
writeFileSync(tmpHtml, fullHtml, 'utf-8');

console.log(`→ Rendu de « ${nomCours} »…`);
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox', '--font-render-hinting=none', '--allow-file-access-from-files'] });
const page = await browser.newPage();
// Mesurer dans un viewport aux dimensions de la zone imprimable : au format
// écran par défaut (800px), la carte éclair est mesurée plus large donc plus
// courte qu'à l'impression, et le zoom calculé plus bas la fait déborder.
const mmToPx = (x) => Math.round((x * 96) / 25.4);
await page.setViewport({ width: mmToPx(210 - M.left - M.right), height: mmToPx(297 - M.top - M.bottom) });
await page.goto(pathToFileURL(tmpHtml).href, { waitUntil: 'networkidle0' });
try { await page.evaluate(() => document.fonts.ready); } catch {}
await page.evaluate((mm) => {
  const [t, b] = mm; const toPx = (x) => (x * 96) / 25.4; const avail = toPx(297 - t - b) - 4;
  // `zoom` reflowe le contenu : la hauteur obtenue n'est pas proportionnelle au
  // facteur appliqué. Un calcul en une passe vise donc `avail` au pixel près et
  // fait déborder la carte sur une page vide. On itère jusqu'à tenir, avec marge.
  document.querySelectorAll('.eclair-card').forEach((el) => {
    el.style.zoom = '1';
    let zoom = 1;
    for (let i = 0; i < 15; i++) {
      const h = el.getBoundingClientRect().height;
      if (h <= avail - 8) break;
      zoom = Math.max(0.5, zoom * ((avail - 8) / h) * 0.998);
      el.style.zoom = String(zoom);
    }
  });
}, [M.top, M.bottom]);
const pdf = await page.pdf({
  format: 'A4', printBackground: true,
  margin: { top: `${M.top}mm`, right: `${M.right}mm`, bottom: `${M.bottom}mm`, left: `${M.left}mm` },
  displayHeaderFooter: true, headerTemplate: header, footerTemplate: footer,
});
await browser.close();

const pages = (await PDFDocument.load(pdf)).getPageCount();
const storagePath = `${coursId}/fiche.pdf`;
const { error: upErr } = await supabase.storage.from('fiches').upload(storagePath, Buffer.from(pdf), { contentType: 'application/pdf', upsert: true });
if (upErr) { console.error('Upload échoué :', upErr.message); process.exit(1); }
const { data: existing } = await supabase.from('fiches').select('id').eq('cours_id', coursId).order('created_at', { ascending: false }).limit(1).maybeSingle();
const patch = { storage_path: storagePath, pages, content_html: bodyHtml, content_format: 'html', titre: nomCours };
const res = existing
  ? await supabase.from('fiches').update(patch).eq('id', existing.id)
  : await supabase.from('fiches').insert({ cours_id: coursId, ...patch });
if (res.error) { console.error('MAJ fiches échouée :', res.error.message); process.exit(1); }
console.log(`✔ ${nomCours} → fiches/${storagePath} (${pages} pages) — publiée.`);

/**
 * Corrige le plan des fiches Médecine générale dont les bannières de partie ont
 * été écrasées par le titre de la fiche (bug `renumber` de build-mg-item.mjs :
 * « I - <titre de la fiche> » répété). Pour chaque fiche cassée :
 *   - remplace le titre de chaque partie (partie-banner-title) par son vrai
 *     sous-titre (ft-subtitle-text, sans le préfixe « A. ») ;
 *   - reconstruit le plan de la page de garde (cover-plan-list) à partir de ces
 *     sous-titres ;
 *   - re-rend le PDF (Chrome local), ré-upload dans Storage, met à jour la ligne
 *     `fiches` (content_html corrigé, pages).
 *
 * Les sous-titres et images VERBATIM sont conservés (transformation purement
 * textuelle des titres de bannière + du plan de garde).
 *
 * Usage :
 *   node scripts/fix-mg-fiche-plans.mjs [--dry] [--limit N] [--only <coursId>]
 *     --dry    : n'effectue aucun rendu ; écrit le HTML corrigé de la 1re fiche
 *                dans scratchpad pour inspection + affiche le plan reconstruit.
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

const flags = process.argv.slice(2);
const DRY = flags.includes('--dry');
const LIMIT = flags.includes('--limit') ? parseInt(flags[flags.indexOf('--limit') + 1], 10) : Infinity;
const ONLY = flags.includes('--only') ? flags[flags.indexOf('--only') + 1] : null;

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) { console.error('SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_URL manquants dans .env.local'); process.exit(1); }
const CHROME = process.env.PUPPETEER_EXECUTABLE_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const supabase = createClient(URL, KEY, { auth: { autoRefreshToken: false, persistSession: false } });

const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV'];

// ── Transformation : bannières de partie ← sous-titre, + plan de garde ──
function fixBody(html, ficheTitle) {
  const subtitles = [];
  const parts = html.split(/(?=<section class="partie-page")/);
  const rebuilt = parts.map((seg) => {
    const idm = /^<section class="partie-page" id="partie-(\d+)"/.exec(seg);
    if (!idm) return seg; // préambule (cover), enrich (sans id), synthèse/éclair : intacts
    const n = parseInt(idm[1], 10);
    const sm = /ft-subtitle-text"[^>]*>\s*([^<]*?)\s*<\/span>/.exec(seg);
    if (!sm) return seg; // pas de sous-titre → on laisse tel quel
    const sub = sm[1]
      .replace(/&nbsp;/g, ' ')
      .replace(/^[A-Z]\.\s*/, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!sub) return seg;
    subtitles[n - 1] = sub;
    // Remplace tous les titres de bannière de CETTE partie (principale + --repeat,
    // avec ou sans style inline).
    return seg.replace(/(<span class="partie-banner-title[^"]*"[^>]*>)[^<]*(<\/span>)/g, `$1${sub}$2`);
  }).join('');

  const planLi = subtitles
    .map((p, i) => (p
      ? `<li class="cover-plan-item"><a class="cover-plan-link" href="#partie-${i + 1}"><span class="cover-plan-num">${ROMAN[i] ?? i + 1}</span><span class="cover-plan-text">${p}</span></a></li>`
      : ''))
    .join('');
  const fixed = rebuilt.replace(/(<ol class="cover-plan-list">)[\s\S]*?(<\/ol>)/, `$1${planLi}$2`);
  return { html: fixed, subtitles: subtitles.filter(Boolean) };
}

// ── Sélection des fiches cassées (bannière = titre fiche, ≥ 2 fois) ──
function bannerEqTitleCount(html, titre) {
  const esc = titre.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp('partie-banner-title[^>]*>' + esc + '<', 'g');
  return (html.match(re) || []).length;
}

const { data: cols, error: colErr } = await supabase
  .from('matieres').select('id').or('id.eq.col-medecine-generale,parent_matiere_id.eq.col-medecine-generale');
if (colErr) { console.error('Requête matieres échouée :', colErr.message); process.exit(1); }
const colIds = (cols ?? []).map((c) => c.id);

const { data: coursRows, error } = await supabase
  .from('cours').select('id, titre').in('matiere_id', colIds).not('titre', 'ilike', 'Révisions%');
if (error) { console.error('Requête cours échouée :', error.message); process.exit(1); }
const coursIds = (coursRows ?? []).map((c) => c.id);

const htmlByCours = new Map();
for (let i = 0; i < coursIds.length; i += 50) {
  const { data: fs } = await supabase.from('fiches').select('cours_id, content_html').in('cours_id', coursIds.slice(i, i + 50));
  for (const f of fs ?? []) if (f.content_html) htmlByCours.set(f.cours_id, f.content_html);
}

let targets = (coursRows ?? [])
  .map((c) => ({ id: c.id, titre: c.titre, html: htmlByCours.get(c.id) ?? '' }))
  .filter((c) => c.html && bannerEqTitleCount(c.html, c.titre) >= 2);
if (ONLY) targets = targets.filter((c) => c.id === ONLY);
targets.sort((a, b) => a.titre.localeCompare(b.titre, 'fr'));
targets = targets.slice(0, LIMIT);

console.log(`Fiches cassées à corriger : ${targets.length}`);

if (DRY) {
  const first = targets[0];
  if (!first) { console.log('Aucune cible.'); process.exit(0); }
  const { html, subtitles } = fixBody(first.html, first.titre);
  const out = join(process.env.SCRATCH || os.tmpdir(), `fixed-${first.id}.html`);
  writeFileSync(out, html, 'utf8');
  console.log(`\n« ${first.titre} » → plan reconstruit :`);
  subtitles.forEach((s, i) => console.log(`  ${ROMAN[i] ?? i + 1}. ${s}`));
  console.log(`\nHTML corrigé écrit : ${out}`);
  process.exit(0);
}

// ── Rendu (repris de render-mg-fiche.mjs) ──
const { data: ref } = await supabase
  .from('cours').select('fiches(content_html)').eq('matiere_id', 'col-dermatologie')
  .not('fiches', 'is', null).limit(1).maybeSingle();
const refHtml = ref?.fiches?.[0]?.content_html ?? '';
const uris = [...refHtml.matchAll(/src="(data:image\/[^"]+)"/g)].map((m) => m[1]);
const WATERMARK = uris[0] ?? '';
const LOGO = uris[1] ?? '';

const NAVY = '#1C2E49', PEARL = '#8E99A8';
const M = { top: 24, right: 18, bottom: 22, left: 18 };
const escH = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const header = (nom) => `<div style="width:100%;font-size:8pt;font-family:Inter,sans-serif;padding:0 ${M.left}mm;display:flex;justify-content:space-between;border-top:0.7pt solid ${NAVY};padding-top:2mm;"><span style="color:${PEARL};">${escH(nom)}</span><span style="color:${NAVY};font-style:italic;"><span class="pageNumber"></span>/<span class="totalPages"></span></span></div>`;
const footer = `<div style="width:100%;font-size:7.6pt;font-family:Inter,sans-serif;padding:0 ${M.left}mm;display:flex;justify-content:space-between;align-items:center;"><span style="color:${PEARL};letter-spacing:0.12em;text-transform:uppercase;">Major ECN &middot; 2025-2026</span><span style="color:#fff;background:${NAVY};border-radius:2.4mm;padding:1.5mm 4mm;font-weight:700;font-size:8pt;"><span class="pageNumber"></span>/<span class="totalPages"></span></span></div>`;

const fontsBase = pathToFileURL(join(ROOT, 'public/fonts/fiches')).href;
const css = readFileSync(join(ROOT, 'src/lib/fiches/charte-styles.css'), 'utf-8')
  .replace(/url\("fonts\/([^"]+)"\)/g, `url("${fontsBase}/$1")`);

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox', '--font-render-hinting=none', '--allow-file-access-from-files'] });
let ok = 0, fail = 0;
for (const t of targets) {
  try {
    // Le content_html stocké a déjà ses data-URI ; on ré-injecte au cas où des marqueurs subsistent.
    let body = fixBody(t.html, t.titre).html
      .replaceAll('__WATERMARK__', WATERMARK)
      .replaceAll('__LOGO__', LOGO);
    const fullHtml = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${escH(t.titre)}</title><style>${css}</style></head><body>${body}</body></html>`;
    const tmpHtml = join(os.tmpdir(), `mg-fix-${t.id}.html`);
    writeFileSync(tmpHtml, fullHtml, 'utf-8');
    const page = await browser.newPage();
    await page.goto(pathToFileURL(tmpHtml).href, { waitUntil: 'networkidle0' });
    try { await page.evaluate(() => document.fonts.ready); } catch {}
    await page.evaluate((mm) => {
      const [tp, bt] = mm; const toPx = (x) => (x * 96) / 25.4; const avail = toPx(297 - tp - bt) - 4;
      document.querySelectorAll('.eclair-card').forEach((el) => { el.style.zoom = '1'; const h = el.getBoundingClientRect().height; if (h > avail) el.style.zoom = String(Math.max(0.5, avail / h)); });
    }, [M.top, M.bottom]);
    const pdf = await page.pdf({
      format: 'A4', printBackground: true,
      margin: { top: `${M.top}mm`, right: `${M.right}mm`, bottom: `${M.bottom}mm`, left: `${M.left}mm` },
      displayHeaderFooter: true, headerTemplate: header(t.titre), footerTemplate: footer,
    });
    await page.close();
    const pages = (await PDFDocument.load(pdf)).getPageCount();
    const storagePath = `${t.id}/fiche.pdf`;
    const { error: upErr } = await supabase.storage.from('fiches').upload(storagePath, Buffer.from(pdf), { contentType: 'application/pdf', upsert: true });
    if (upErr) throw new Error('upload: ' + upErr.message);
    const { data: existing } = await supabase.from('fiches').select('id').eq('cours_id', t.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
    const patch = { storage_path: storagePath, pages, content_html: body, content_format: 'html', titre: t.titre };
    const res = existing
      ? await supabase.from('fiches').update(patch).eq('id', existing.id)
      : await supabase.from('fiches').insert({ cours_id: t.id, ...patch });
    if (res.error) throw new Error('db: ' + res.error.message);
    ok++;
    console.log(`✔ ${t.titre} (${pages}p)`);
  } catch (e) {
    fail++;
    console.error(`�’ ÉCHEC ${t.titre} : ${e.message}`);
  }
}
await browser.close();
console.log(`\nTerminé : ${ok} OK, ${fail} échecs.`);

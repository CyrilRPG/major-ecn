#!/usr/bin/env node
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { PDFDocument } from 'pdf-lib';
import { validateFicheModel } from './lib/orthopedie-fiche.mjs';

const require = createRequire(import.meta.url);
const runtimeModules = process.env.CODEX_WORKSPACE_NODE_MODULES
  || 'C:\\Users\\Admin\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules';
const { chromium } = require(join(runtimeModules, 'playwright'));
const sharp = require(join(runtimeModules, 'sharp'));
const pdftoppm = process.env.PDFTOPPM_EXECUTABLE
  || 'C:\\Users\\Admin\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\native\\poppler\\Library\\bin\\pdftoppm.exe';

const ROOT = resolve(import.meta.dirname, '..');
const CORPUS_ROOT = resolve(ROOT, '.corpus-anesthesie-reanimation');
const chapterDir = resolve(process.argv[2] || '');
if (!chapterDir || !existsSync(chapterDir)) throw new Error('Usage : node scripts/render-anesthesie-fiche.mjs <chapterDir>');
if (!chapterDir.startsWith(`${CORPUS_ROOT}\\`)) throw new Error(`Chapitre hors corpus Anesthésie-Réanimation : ${chapterDir}`);

const deliveryDir = join(chapterDir, 'delivery', 'source-quality-v1');
const htmlPath = join(deliveryDir, 'fiche.final.html');
const modelPath = join(deliveryDir, 'fiche.model.json');
const pdfPath = join(deliveryDir, 'fiche.pdf');
const auditPath = join(deliveryDir, 'fiche-audit.json');
const previewDir = join(deliveryDir, 'qa-preview');
if (!existsSync(htmlPath) || !existsSync(modelPath)) throw new Error(`HTML final ou modèle absent dans : ${deliveryDir}`);
const modelAudit = validateFicheModel(JSON.parse(readFileSync(modelPath, 'utf8')), chapterDir);
if (modelAudit.errors.length) throw new Error(`Modèle éditorial invalide avant rendu :\n- ${modelAudit.errors.join('\n- ')}`);

const logo = readFileSync(join(ROOT, 'public', 'major-ecn-logo.png')).toString('base64');
const logoUri = `data:image/png;base64,${logo}`;
const body = readFileSync(htmlPath, 'utf8')
  .replaceAll('__LOGO__', logoUri)
  .replaceAll('__WATERMARK__', logoUri);
const css = readFileSync(join(ROOT, 'src', 'lib', 'fiches', 'charte-styles.css'), 'utf8');
// En production le filigrane possède déjà sa transparence. Pour le rendu
// local, le logo de secours doit recevoir la même discrétion par CSS.
const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>${css}\n.page-watermark{opacity:.035}</style></head><body>${body}</body></html>`;

rmSync(previewDir, { recursive: true, force: true });
mkdirSync(previewDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CHROMIUM_EXECUTABLE || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
});
try {
  const page = await browser.newPage({ viewport: { width: 1240, height: 1754 } });
  await page.setContent(html, { waitUntil: 'load' });
  await page.emulateMedia({ media: 'print' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((img) => img.complete
      ? Promise.resolve()
      : new Promise((resolveImage) => {
        img.addEventListener('load', resolveImage, { once: true });
        img.addEventListener('error', resolveImage, { once: true });
      })));
  });

  const metrics = await page.evaluate(() => {
    const textualRows = [...document.querySelectorAll('tr.ft-image-row')];
    const detailRows = [...document.querySelectorAll('td.ft-detail')];
    const hierarchicalRows = detailRows.filter((cell) => cell.querySelector(':scope > ul.ft-list > li > ul'));
    const titleNodes = [...document.querySelectorAll('.partie-banner-title, .ft-subtitle-text, figcaption')];
    const sourceNumbering = titleNodes
      .map((node) => node.textContent?.trim() || '')
      .filter((text) => /^(?:chapitre|tableau|figure)\s+\d|^\d+(?:\.\d+)+\s/i.test(text));
    return {
      visibleCharacters: document.body.innerText.replace(/\s+/g, ' ').trim().length,
      parts: document.querySelectorAll('section.partie-page').length,
      tables: document.querySelectorAll('table.fiche-table').length,
      figures: document.querySelectorAll('figure.ft-figure').length,
      n2Rows: hierarchicalRows.length,
      flatRows: detailRows.length - hierarchicalRows.length,
      n2Parents: document.querySelectorAll('td.ft-detail > ul.ft-list > li > ul').length,
      n2Items: document.querySelectorAll('td.ft-detail > ul.ft-list > li > ul > li').length,
      textualImageRows: textualRows.length,
      textualImagesOutsideFullRows: document.querySelectorAll('td.ft-detail > figure.ft-figure--large').length,
      smallImages: document.querySelectorAll('figure.ft-figure--small').length,
      brokenImages: [...document.images].filter((img) => !img.complete || !img.naturalWidth || !img.naturalHeight).length,
      sourceNumbering,
      horizontalOverflow: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
      hasSynthesis: Boolean(document.querySelector('section.synthese-page')),
      hasEclair: Boolean(document.querySelector('section.fiche-eclair-page')),
    };
  });

  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
  });

  const pages = (await PDFDocument.load(readFileSync(pdfPath))).getPageCount();
  execFileSync(pdftoppm, ['-png', '-r', '150', pdfPath, join(previewDir, 'page')], {
    windowsHide: true,
    stdio: 'pipe',
  });
  const previewFiles = readdirSync(previewDir)
    .filter((name) => /^page-\d+\.png$/i.test(name))
    .sort((a, b) => Number(a.match(/\d+/)?.[0]) - Number(b.match(/\d+/)?.[0]));
  const rasterPages = [];
  for (const [index, file] of previewFiles.entries()) {
    const { data, info } = await sharp(join(previewDir, file)).raw().toBuffer({ resolveWithObject: true });
    let firstInkY = info.height;
    let lastInkX = -1;
    let inkPixels = 0;
    let contentFirstInkY = info.height;
    let contentLastInkY = -1;
    let contentDarkInkPixels = 0;
    for (let y = 0; y < info.height; y += 1) {
      for (let x = 0; x < info.width; x += 1) {
        const offset = (y * info.width + x) * info.channels;
        const isInk = data[offset] < 245 || data[offset + 1] < 245 || data[offset + 2] < 245;
        if (!isInk) continue;
        inkPixels += 1;
        if (y < firstInkY) firstInkY = y;
        if (x > lastInkX) lastInkX = x;
        const isContentDarkInk = y >= 180 && y < info.height - 200 && x >= 80 && x < info.width - 80
          && (data[offset] < 225 || data[offset + 1] < 225 || data[offset + 2] < 225);
        if (isContentDarkInk) {
          contentDarkInkPixels += 1;
          if (y < contentFirstInkY) contentFirstInkY = y;
          if (y > contentLastInkY) contentLastInkY = y;
        }
      }
    }
    rasterPages.push({
      page: index + 1,
      file,
      width: info.width,
      height: info.height,
      firstInkY,
      lastInkX,
      inkPixels,
      contentFirstInkY,
      contentLastInkY,
      contentDarkInkPixels,
      contentSpanY: contentLastInkY >= contentFirstInkY ? contentLastInkY - contentFirstInkY : 0,
    });
  }
  const errors = [];
  const warnings = [];
  if (pages < 7 || pages > 40) errors.push(`pages=${pages}, attendu 7-40`);
  if (metrics.parts < 4 || metrics.parts > 7) errors.push(`parties=${metrics.parts}, attendu 4-7`);
  const n2Ratio = metrics.n2Rows + metrics.flatRows ? metrics.n2Rows / (metrics.n2Rows + metrics.flatRows) : 0;
  if (n2Ratio < 0.25 || n2Ratio > 0.55) errors.push(`répartition N+2 incohérente : ${metrics.n2Rows}/${metrics.n2Rows + metrics.flatRows} lignes hiérarchisées`);
  if (metrics.flatRows <= metrics.n2Rows) errors.push(`les lignes N+1 simples ne sont pas majoritaires : ${metrics.flatRows}/${metrics.n2Rows}`);
  if (metrics.n2Items < metrics.n2Rows) errors.push(`précisions N+2 insuffisantes : ${metrics.n2Items} items pour ${metrics.n2Rows} lignes`);
  if (metrics.figures !== modelAudit.figureCount) errors.push(`figures rendues=${metrics.figures}, attendu ${modelAudit.figureCount}`);
  if (metrics.textualImagesOutsideFullRows) errors.push('une image textuelle reste placée dans une troisième colonne');
  if (metrics.brokenImages) errors.push(`${metrics.brokenImages} image(s) cassée(s)`);
  if (metrics.sourceNumbering.length) errors.push(`numérotation source visible : ${metrics.sourceNumbering.join(' | ')}`);
  if (metrics.horizontalOverflow) errors.push(`débordement horizontal=${metrics.horizontalOverflow}px`);
  if (metrics.visibleCharacters > 50000) errors.push(`caractères visibles=${metrics.visibleCharacters}, maximum 50 000`);
  if (!metrics.hasSynthesis || !metrics.hasEclair) errors.push('synthèse ou fiche éclair absente');
  if (previewFiles.length !== pages) errors.push(`aperçus PNG=${previewFiles.length}, attendu ${pages}`);
  const blankRasterPages = rasterPages.filter((entry) => entry.inkPixels < 500).map((entry) => entry.page);
  const topClippedPages = rasterPages
    .filter((entry) => entry.page > 1 && entry.firstInkY < 80)
    .map((entry) => entry.page);
  const rightClippedPages = rasterPages
    .filter((entry) => entry.page > 1 && entry.lastInkX > entry.width - 45)
    .map((entry) => entry.page);
  const sparseRasterPages = rasterPages
    .filter((entry) => entry.page > 1 && entry.page < pages
      && entry.contentDarkInkPixels < 190000 && entry.contentSpanY < 650)
    .map((entry) => entry.page);
  if (blankRasterPages.length) errors.push(`pages visuellement blanches : ${blankRasterPages.join(', ')}`);
  if (topClippedPages.length) errors.push(`contenu rogné en haut : pages ${topClippedPages.join(', ')}`);
  if (rightClippedPages.length) errors.push(`contenu rogné à droite : pages ${rightClippedPages.join(', ')}`);
  if (sparseRasterPages.length) warnings.push(`pages à densité faible à revoir visuellement : ${sparseRasterPages.join(', ')}`);

  const audit = {
    generatedAt: new Date().toISOString(),
    chapter: basename(chapterDir),
    pdf: pdfPath,
    pages,
    metrics,
    rasterAudit: {
      previewDir,
      renderedPages: previewFiles.length,
      blankRasterPages,
      topClippedPages,
      rightClippedPages,
      sparseRasterPages,
      pages: rasterPages,
    },
    errors,
    warnings,
    passed: errors.length === 0,
  };
  writeFileSync(auditPath, `${JSON.stringify(audit, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(audit, null, 2));
  if (errors.length) process.exitCode = 2;
} finally {
  await browser.close();
}

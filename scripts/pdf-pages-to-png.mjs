/**
 * Rend des pages de PDF en PNG, via pdf.js exécuté dans Chrome (canvas).
 *
 * Pourquoi ce détour : la machine n'a ni pdftoppm, ni ImageMagick, ni sharp
 * (`convert` sur ce poste est l'utilitaire disque de Windows, pas ImageMagick).
 * Chrome + puppeteer-core sont en revanche déjà utilisés par render-mg-fiche.mjs.
 * Les fichiers sont servis par un petit serveur HTTP local : en file://, Chrome
 * refuse les imports de modules ES.
 *
 * Usage :
 *   node scripts/pdf-pages-to-png.mjs <fichier.pdf> <dossierSortie> <de> [<à>] [--scale=2]
 *
 * Les accents des noms de fichiers venus de macOS sont en NFD : on résout le
 * chemin en comparant les noms normalisés (cf. resolvePath).
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, basename, join, resolve } from 'node:path';
import puppeteer from 'puppeteer-core';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PDFJS = resolve('node_modules/pdfjs-dist/build');

function resolvePath(p) {
  if (existsSync(p)) return p;
  const dir = dirname(p);
  const want = basename(p).normalize('NFC');
  const hit = readdirSync(dir).find((f) => f.normalize('NFC') === want);
  if (!hit) throw new Error(`Introuvable : ${p}`);
  return join(dir, hit);
}

const args = process.argv.slice(2);
const flags = Object.fromEntries(
  args.filter((a) => a.startsWith('--')).map((a) => a.replace(/^--/, '').split('=')),
);
const [pdfArg, outDir, fromArg, toArg] = args.filter((a) => !a.startsWith('--'));
if (!pdfArg || !outDir || !fromArg) {
  console.error('Usage: node scripts/pdf-pages-to-png.mjs <pdf> <outDir> <de> [<à>] [--scale=2]');
  process.exit(1);
}
const pdfPath = resolvePath(pdfArg);
const from = Number(fromArg);
const to = Number(toArg ?? fromArg);
const scale = Number(flags.scale ?? 2);
mkdirSync(outDir, { recursive: true });

const PAGE_HTML = `<!doctype html><meta charset="utf-8"><body style="margin:0">
<script type="module">
import * as pdfjs from '/pdf.mjs';
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
window.__render = async (from, to, scale) => {
  const doc = await pdfjs.getDocument({ url: '/doc.pdf' }).promise;
  const out = [];
  for (let p = from; p <= Math.min(to, doc.numPages); p++) {
    const page = await doc.getPage(p);
    const vp = page.getViewport({ scale });
    const cv = document.createElement('canvas');
    cv.width = Math.ceil(vp.width); cv.height = Math.ceil(vp.height);
    const ctx = cv.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height);
    await page.render({ canvasContext: ctx, viewport: vp }).promise;
    out.push({ page: p, data: cv.toDataURL('image/png').split(',')[1] });
  }
  return { numPages: doc.numPages, pages: out };
};
window.__ready = true;
</script></body>`;

const files = {
  '/': { body: Buffer.from(PAGE_HTML), type: 'text/html; charset=utf-8' },
  '/pdf.mjs': { body: readFileSync(join(PDFJS, 'pdf.mjs')), type: 'text/javascript' },
  '/pdf.worker.mjs': { body: readFileSync(join(PDFJS, 'pdf.worker.mjs')), type: 'text/javascript' },
  '/doc.pdf': { body: readFileSync(pdfPath), type: 'application/pdf' },
};

const server = createServer((req, res) => {
  const f = files[req.url.split('?')[0]];
  if (!f) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': f.type, 'content-length': f.body.length });
  res.end(f.body);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
try {
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.error('[page]', e.message));
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'load' });
  await page.waitForFunction('window.__ready === true', { timeout: 30_000 });
  const { numPages, pages } = await page.evaluate(
    (a, b, c) => window.__render(a, b, c), from, to, scale,
  );
  const stem = basename(pdfPath).replace(/\.pdf$/i, '').replace(/[^\w\-]+/g, '_').slice(0, 40);
  for (const { page: p, data } of pages) {
    const out = join(outDir, `${stem}_p${String(p).padStart(3, '0')}.png`);
    writeFileSync(out, Buffer.from(data, 'base64'));
    console.log(out);
  }
  console.error(`(${pages.length} page(s) rendue(s) sur ${numPages})`);
} finally {
  await browser.close();
  server.close();
}

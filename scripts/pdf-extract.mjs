/**
 * Extraction complète d'un PDF de support de cours, en un passage :
 *  - le texte diapo par diapo, découpé en runs { color, text }
 *  - les images embarquées (tableaux, schémas, imagerie) en PNG
 *
 * Pourquoi la couleur : dans les supports PAE, la diapo « correction » d'un QCM
 * est identique à la diapo « question » — SEULE la couleur distingue les items
 * justes (#00b050, vert) des faux (#000000). Une extraction purement textuelle
 * produirait des corrigés faux en silence. Cf. scripts/pdf-pages-to-png.mjs pour
 * le rendu de contrôle visuel.
 *
 * Pourquoi Chrome : ce poste n'a ni pdftoppm, ni ImageMagick, ni sharp/pngjs
 * (`convert` y est l'utilitaire disque de Windows). pdf.js décode les images,
 * le canvas de Chrome les encode en PNG. Les fichiers sont servis en HTTP local
 * car Chrome refuse les imports de modules ES en file://.
 *
 * Usage :
 *   node scripts/pdf-extract.mjs <fichier.pdf> <dossierSortie> [--images] [--from=1] [--to=999]
 *
 * Sortie : <dossierSortie>/extract.json  { file, numPages, pages: [{ page, runs, images }] }
 *          <dossierSortie>/img/<stem>_p012_i01.png   (avec --images)
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, basename, join, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import puppeteer from 'puppeteer-core';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PDFJS = resolve('node_modules/pdfjs-dist/build');

/** macOS stocke les accents en NFD : on résout par nom normalisé. */
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
  args.filter((a) => a.startsWith('--')).map((a) => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }),
);
const [pdfArg, outDir] = args.filter((a) => !a.startsWith('--'));
if (!pdfArg || !outDir) {
  console.error('Usage: node scripts/pdf-extract.mjs <pdf> <outDir> [--images] [--from=1] [--to=999]');
  process.exit(1);
}
const pdfPath = resolvePath(pdfArg);
const wantImages = !!flags.images;
mkdirSync(outDir, { recursive: true });
if (wantImages) mkdirSync(join(outDir, 'img'), { recursive: true });

const PAGE_HTML = `<!doctype html><meta charset="utf-8"><body style="margin:0">
<script type="module">
import * as pdfjs from '/pdf.mjs';
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
const OPS = pdfjs.OPS;

// Encode une image pdf.js en PNG via le canvas.
// pdf.js 5 renvoie le plus souvent un ImageBitmap (img.bitmap) ; les versions
// plus anciennes, un tableau d'octets (img.data + img.kind). On gère les deux.
function toPng(img) {
  const width = img.width, height = img.height;
  const cv = document.createElement('canvas');
  cv.width = width; cv.height = height;
  const ctx = cv.getContext('2d');

  if (img.bitmap) {
    ctx.drawImage(img.bitmap, 0, 0);
    return cv.toDataURL('image/png').split(',')[1];
  }
  if (!img.data) return null;

  const out = ctx.createImageData(width, height);
  const src = img.data;
  const n = width * height;
  if (img.kind === 3 || src.length === n * 4) {            // RGBA
    out.data.set(src.subarray(0, n * 4));
  } else if (img.kind === 2 || src.length === n * 3) {     // RGB
    for (let i = 0; i < n; i++) {
      out.data[i*4] = src[i*3]; out.data[i*4+1] = src[i*3+1];
      out.data[i*4+2] = src[i*3+2]; out.data[i*4+3] = 255;
    }
  } else if (src.length === n) {                            // niveaux de gris
    for (let i = 0; i < n; i++) {
      out.data[i*4] = out.data[i*4+1] = out.data[i*4+2] = src[i]; out.data[i*4+3] = 255;
    }
  } else return null;
  ctx.putImageData(out, 0, 0);
  return cv.toDataURL('image/png').split(',')[1];
}

/**
 * Récupère un objet image, dans la page ou global (pdf.js 5).
 *
 * ATTENTION : pdf.js résout une partie des XObjects de façon ASYNCHRONE. Au
 * moment du parcours des opérateurs, objs.has(id) peut encore renvoyer false
 * alors que l'image arrivera juste après. Une version synchrone rendait null et
 * l'image était jetée en silence : 79 % des figures perdues, sans le moindre log.
 * On attend donc explicitement la résolution via la forme à callback de
 * objs.get, avec une échéance pour ne pas bloquer sur un objet réellement absent.
 * (Pas de backtick dans ce commentaire : ce code vit dans un template literal.)
 */
function getImg(page, objId, timeoutMs = 5000) {
  for (const store of [page.objs, page.commonObjs]) {
    try { if (store.has(objId)) return Promise.resolve(store.get(objId)); } catch {}
  }
  return new Promise((resolve) => {
    let done = false;
    const finish = (v) => { if (!done) { done = true; resolve(v); } };
    const t = setTimeout(() => finish(null), timeoutMs);
    for (const store of [page.objs, page.commonObjs]) {
      try {
        store.get(objId, (v) => { clearTimeout(t); finish(v ?? null); });
      } catch {}
    }
  });
}

window.__run = async (from, to, wantImages) => {
  const doc = await pdfjs.getDocument({ url: '/doc.pdf' }).promise;
  const pages = [];
  for (let p = from; p <= Math.min(to, doc.numPages); p++) {
    const page = await doc.getPage(p);
    // pdf.js ne peuple page.objs / commonObjs qu'au RENDU : sans ce rendu
    // préalable, getOperatorList seul laisse les XObjects image non résolus et
    // l'extraction d'images renvoie 0. On rend dans un canvas jetable.
    if (wantImages) {
      const vp = page.getViewport({ scale: 1 });
      const cv = document.createElement('canvas');
      cv.width = Math.ceil(vp.width); cv.height = Math.ceil(vp.height);
      await page.render({ canvasContext: cv.getContext('2d'), viewport: vp }).promise;
    }
    const ops = await page.getOperatorList();
    let fill = '#000000';
    const runs = [];
    const images = [];
    for (let i = 0; i < ops.fnArray.length; i++) {
      const fn = ops.fnArray[i], a = ops.argsArray[i];
      if (fn === OPS.setFillRGBColor) {
        fill = typeof a[0] === 'string' ? a[0] : fill;
      } else if (fn === OPS.showText) {
        const s = (a[0] ?? []).map((g) => (g && typeof g === 'object' && g.unicode) ? g.unicode : '').join('');
        if (s) runs.push({ color: fill, text: s });
      } else if (wantImages && (fn === OPS.paintImageXObject || fn === OPS.paintInlineImageXObject)) {
        // Toute image vue est COMPTÉE, même si on ne parvient pas à la décoder :
        // un rejet doit être visible dans le rapport, jamais silencieux.
        try {
          const img = fn === OPS.paintInlineImageXObject ? a[0] : await getImg(page, a[0]);
          if (!img) { images.push({ error: 'XObject non résolu', objId: String(a[0]) }); continue; }
          const b64 = toPng(img);
          if (!b64) { images.push({ error: 'décodage impossible', w: img.width, h: img.height }); continue; }
          images.push({ w: img.width, h: img.height, data: b64 });
        } catch (e) { images.push({ error: String(e && e.message || e) }); }
      }
    }
    // Fusionne les runs adjacents de même couleur (pdf.js émet un run par mot).
    const merged = [];
    for (const r of runs) {
      const last = merged[merged.length - 1];
      if (last && last.color === r.color) last.text += r.text;
      else merged.push({ ...r });
    }
    pages.push({ page: p, runs: merged.filter((r) => r.text.trim()), images });
  }
  return { numPages: doc.numPages, pages };
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

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
try {
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.error('[page]', e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: 'load' });
  await page.waitForFunction('window.__ready === true', { timeout: 30_000 });

  const from = Number(flags.from ?? 1);
  const to = Number(flags.to ?? 9999);
  const { numPages, pages } = await page.evaluate(
    (a, b, c) => window.__run(a, b, c), from, to, wantImages,
  );

  const stem = basename(pdfPath).replace(/\.pdf$/i, '').replace(/[^\w-]+/g, '_').slice(0, 40);

  // Filtrage, dérivé des normes de major-ecn-fiche (section Images) :
  //  - taille et ratio -> écartent puces, filets, icônes
  //  - dédup SHA-1     -> une seule copie d'une même figure
  //  - rejet des images RÉPÉTÉES sur une grande partie des pages : dans ces
  //    supports, le fond décoratif (stéthoscope en filigrane) est un XObject
  //    image présent sur chaque diapo. C'est le critère qui le distingue d'une
  //    vraie figure, laquelle n'apparaît que sur une diapo ou deux.
  // Les seuils des normes (200x200, ratio 5:1) écartaient du contenu RÉEL : ici
  // un commentaire entier est parfois une image large et plate (1553x228 = 6,8:1 ;
  // 1019x93 = 11:1). 90 / 14:1 a été contrôlé visuellement sur l'endocrinologie :
  // ne remonte que du contenu utile. Ne pas resserrer sans un contrôle du même
  // ordre — ces seuils jettent en silence, c'est leur nature.
  const MIN = 90, MAX_RATIO = 14, REPEAT_FRAC = 0.25;
  const seen = new Map(); // sha1 -> { pages: [], name }
  for (const pg of pages) {
    for (const im of pg.images ?? []) {
      if (im.error || !im.data) continue;
      const sha = createHash('sha1').update(im.data).digest('hex');
      im.sha = sha;
      if (!seen.has(sha)) seen.set(sha, { pages: [], buf: Buffer.from(im.data, 'base64') });
      seen.get(sha).pages.push(pg.page);
    }
  }
  const repeatLimit = Math.max(2, Math.ceil(pages.length * REPEAT_FRAC));
  let nImg = 0;
  // Le détail des motifs, pas seulement le total : un « N écartées » opaque ne
  // permet pas de distinguer un filtrage légitime d'une panne. C'est ce qui a
  // laissé passer la perte de 79 % des figures — et c'est aussi ce qui dira si
  // un support qui ressort à 0 image est vide ou mal filtré.
  const rejets = { taille: 0, ratio: 0, fond: 0, nonResolu: 0, nonDecodee: 0 };
  const written = new Map(); // sha1 -> chemin relatif
  for (const pg of pages) {
    pg.images = (pg.images ?? []).flatMap((im, k) => {
      if (im.error || !im.data) {
        if (im.error === 'XObject non résolu') rejets.nonResolu++;
        else rejets.nonDecodee++;
        return [{ error: im.error ?? 'non décodée' }];
      }
      const rec = seen.get(im.sha);
      const ratio = Math.max(im.w, im.h) / Math.min(im.w, im.h);
      if (im.w < MIN || im.h < MIN) { rejets.taille++; return []; }
      if (ratio > MAX_RATIO) { rejets.ratio++; return []; }
      if (rec.pages.length >= repeatLimit) { rejets.fond++; return []; } // fond / logo
      if (written.has(im.sha)) return [{ file: written.get(im.sha), w: im.w, h: im.h, doublon: true }];
      const name = `${stem}_p${String(pg.page).padStart(3, '0')}_i${String(k + 1).padStart(2, '0')}.png`;
      writeFileSync(join(outDir, 'img', name), rec.buf);
      written.set(im.sha, `img/${name}`);
      nImg++;
      return [{ file: `img/${name}`, w: im.w, h: im.h }];
    });
  }
  const nRejet = rejets.taille + rejets.ratio + rejets.fond;
  const nPerdu = rejets.nonResolu + rejets.nonDecodee;
  console.error(
    `images : ${nImg} retenues, ${nRejet} écartées ` +
    `(${rejets.taille} < ${MIN}px, ${rejets.ratio} ratio > ${MAX_RATIO}:1, ${rejets.fond} fond répété), ` +
    `${rejets.nonResolu} non résolues, ${rejets.nonDecodee} non décodées`,
  );
  if (nPerdu) console.error(`ATTENTION : ${nPerdu} image(s) présentes dans le PDF n'ont PAS pu être extraites.`);
  writeFileSync(join(outDir, 'extract.json'),
    JSON.stringify({ file: basename(pdfPath), numPages, pages }, null, 1), 'utf8');
  console.error(`${pages.length} page(s), ${nImg} image(s) → ${join(outDir, 'extract.json')}`);
} finally {
  await browser.close();
  server.close();
}

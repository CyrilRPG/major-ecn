import 'server-only';
import { createRequire } from 'node:module';
import path from 'node:path';
import { arenaDb } from './db';
import { ARENA_BUCKET } from './pdf-url';

/**
 * EVC Arena — pages d'un corrigé PDF.
 *
 * Le corrigé d'une manche (PDF fourni par Major ECN ou généré) n'est jamais
 * servi aux participants sous forme de fichier : il est rendu page par page en
 * PNG (pdf.js + @napi-rs/canvas, comme l'import d'exercices), stocké dans le
 * bucket privé `arena` sous `<tournoi>/corrections-m<n>-pages/<k>.png`, puis
 * servi à la demande par une route qui vérifie la session du participant et
 * BRÛLE son filigrane nominatif dans l'image (`burnWatermark`).
 */

export const PAGE_SCALE = 2; // A4 → 1190 × 1684 px

export function correctionPagePath(tournamentId: string, roundNumber: number, page: number): string {
  return `${tournamentId}/corrections-m${roundNumber}-pages/${page}.png`;
}

function cheminsPdfjs(): { standardFontDataUrl?: string; wasmUrl?: string } {
  try {
    const require = createRequire(import.meta.url);
    const racine = path.dirname(require.resolve('pdfjs-dist/package.json')).replace(/\\/g, '/');
    return { standardFontDataUrl: `${racine}/standard_fonts/`, wasmUrl: `${racine}/wasm/` };
  } catch {
    return {};
  }
}

/** Rend chaque page du PDF en PNG (pleine page, fond blanc). */
export async function renderPdfPages(buffer: Uint8Array | ArrayBuffer, options: { scale?: number; maxPages?: number } = {}): Promise<Buffer[]> {
  const scale = options.scale ?? PAGE_SCALE;
  const maxPages = options.maxPages ?? 60;
  // Même ordre d'initialisation que exercise-import-images.ts : nos globaux
  // canvas avant pdf.js, worker chargé en premier.
  const canvasLib = await import('@napi-rs/canvas');
  const g = globalThis as Record<string, unknown>;
  g.DOMMatrix ??= canvasLib.DOMMatrix;
  g.ImageData ??= canvasLib.ImageData;
  g.Path2D ??= canvasLib.Path2D;
  await import('pdfjs-dist/legacy/build/pdf.worker.mjs');
  const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');

  class FabriqueCanvas {
    create(largeur: number, hauteur: number) {
      const canvas = canvasLib.createCanvas(Math.max(1, Math.ceil(largeur)), Math.max(1, Math.ceil(hauteur)));
      return { canvas, context: canvas.getContext('2d') };
    }
    reset(cc: { canvas: import('@napi-rs/canvas').Canvas }, largeur: number, hauteur: number) {
      cc.canvas.width = Math.max(1, Math.ceil(largeur));
      cc.canvas.height = Math.max(1, Math.ceil(hauteur));
    }
    destroy(cc: { canvas: import('@napi-rs/canvas').Canvas | null; context: unknown }) {
      if (cc.canvas) { cc.canvas.width = 0; cc.canvas.height = 0; }
      cc.canvas = null;
      cc.context = null;
    }
  }

  const data = new Uint8Array(buffer instanceof ArrayBuffer ? buffer : buffer);
  const doc = await getDocument({ data, useSystemFonts: true, isEvalSupported: false, verbosity: 0, CanvasFactory: FabriqueCanvas, ...cheminsPdfjs() } as Parameters<typeof getDocument>[0]).promise;
  try {
    const out: Buffer[] = [];
    const n = Math.min(doc.numPages, maxPages);
    for (let p = 1; p <= n; p++) {
      const page = await doc.getPage(p);
      const viewport = page.getViewport({ scale });
      const canvas = canvasLib.createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvas: null, canvasContext: ctx as unknown as CanvasRenderingContext2D, viewport }).promise;
      out.push(Buffer.from(await canvas.encode('png')));
      page.cleanup();
    }
    return out;
  } finally {
    await doc.destroy();
  }
}

/** Purge les pages d'un rendu précédent (jusqu'à `previous`). */
export async function removeCorrectionPages(tournamentId: string, roundNumber: number, previous: number): Promise<void> {
  if (previous <= 0) return;
  const paths = Array.from({ length: previous }, (_, i) => correctionPagePath(tournamentId, roundNumber, i + 1));
  await arenaDb().storage.from(ARENA_BUCKET).remove(paths);
}

/** Rend le PDF de la manche en pages et les dépose dans le bucket. Renvoie le nombre de pages. */
export async function storeCorrectionPages(input: { tournamentId: string; roundNumber: number; pdf: Uint8Array | ArrayBuffer; previous: number }): Promise<number> {
  const pages = await renderPdfPages(input.pdf);
  const db = arenaDb();
  await removeCorrectionPages(input.tournamentId, input.roundNumber, input.previous);
  for (const [i, png] of pages.entries()) {
    const { error } = await db.storage.from(ARENA_BUCKET).upload(correctionPagePath(input.tournamentId, input.roundNumber, i + 1), png, { contentType: 'image/png', upsert: true });
    if (error) throw new Error(`Page ${i + 1} : ${error.message}`);
  }
  return pages.length;
}

/** Lit une page rendue depuis le bucket, ou null. */
export async function readCorrectionPage(tournamentId: string, roundNumber: number, page: number): Promise<Buffer | null> {
  const { data, error } = await arenaDb().storage.from(ARENA_BUCKET).download(correctionPagePath(tournamentId, roundNumber, page));
  if (error || !data) return null;
  return Buffer.from(await data.arrayBuffer());
}

/**
 * Brûle le filigrane nominatif dans l'image d'une page : texte répété en
 * diagonale, discret mais lisible sur fond clair comme sur fond sombre, plus
 * une ligne en pied de page. Sortie JPEG (poids réduit, pas de canal alpha à
 * détourer).
 */
let policeEnregistree: string | null = null;
/**
 * Police du filigrane : la fonction Vercel n'a aucune police système (le texte
 * serait invisible). On enregistre la Liberation Sans Bold (licence OFL)
 * embarquée dans le dépôt (src/lib/arena/fonts, tracée par next.config pour
 * la route des pages).
 */
async function policeFiligrane(GlobalFonts: { registerFromPath(path: string, alias?: string): unknown }): Promise<string> {
  if (policeEnregistree !== null) return policeEnregistree;
  try {
    const ok = Boolean(GlobalFonts.registerFromPath(path.join(process.cwd(), 'src', 'lib', 'arena', 'fonts', 'LiberationSans-Bold.ttf'), 'ArenaWatermark'));
    policeEnregistree = ok ? 'ArenaWatermark' : '';
  } catch {
    policeEnregistree = '';
  }
  return policeEnregistree;
}

export async function burnWatermark(png: Buffer, label: string): Promise<Buffer> {
  const { createCanvas, loadImage, GlobalFonts } = await import('@napi-rs/canvas');
  const police = await policeFiligrane(GlobalFonts);
  const famille = police ? `"${police}", ` : '';
  const img = await loadImage(png);
  const c = createCanvas(img.width, img.height);
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const size = Math.round(img.width / 42);
  ctx.font = `bold ${size}px ${famille}Inter, Roboto, Helvetica, Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const stepX = img.width / 2.2;
  const stepY = img.height / 7;
  ctx.save();
  ctx.translate(img.width / 2, img.height / 2);
  ctx.rotate((-28 * Math.PI) / 180);
  for (let y = -img.height; y <= img.height; y += stepY) {
    const offset = Math.round(y / stepY) % 2 === 0 ? 0 : stepX / 2;
    for (let x = -img.width; x <= img.width; x += stepX) {
      ctx.fillStyle = 'rgba(120, 18, 40, 0.16)';
      ctx.fillText(label, x + offset, y);
    }
  }
  ctx.restore();
  // Ligne de pied : lisible même sur une capture partielle.
  ctx.font = `bold ${Math.round(size * 0.7)}px ${famille}Inter, Roboto, Helvetica, Arial, sans-serif`;
  ctx.fillStyle = 'rgba(120, 18, 40, 0.55)';
  ctx.textAlign = 'right';
  ctx.fillText(label, img.width - size, img.height - size * 0.9);
  return Buffer.from(await c.encode('jpeg', 84));
}

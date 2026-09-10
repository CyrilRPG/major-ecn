/**
 * Vérité déterministe d'un PDF d'exercices — le garde-fou du modèle.
 *
 * POURQUOI (09/09/2026)
 * --------------------
 * Dans les supports « … - Corrections » de Major ECN, le corrigé n'est PAS du
 * texte : c'est la COULEUR. Les propositions exactes sont écrites en vert
 * (#00b050), les autres en noir. Un modèle qui lit le PDF comme une image se
 * trompe régulièrement : sur l'import « REVISION GENERALE » (Pédiatrie,
 * 137 pages), 153 propositions sur 1 770 avaient un corrigé inversé — 8,6 %,
 * dont des propositions justes comptées fausses. Un élève y apprenait le
 * contraire de la bonne réponse.
 *
 * CE FICHIER est l'adaptateur pdf.js (build « legacy », le seul qui tourne en
 * Node sans navigateur) : il lit chaque page en LIGNES (`getTextContent` :
 * texte, x, y) et en COULEURS (`getOperatorList` : `setFillRGBColor` puis
 * `showText`), apparie les deux flux caractère par caractère, relève les
 * images avec leur position, puis confie la structure à la couche pure
 * `exercise-import-verite-lecture.ts`. La confrontation au rendu du modèle
 * et le rapport de fiabilité vivent dans `exercise-import-verite-rapport.ts`.
 *
 * Pas de `import 'server-only'` ici : le module doit rester exécutable sous
 * Node (tests, sonde `tmp/`), et il ne touche à aucun secret.
 *
 * Le texte extrait porte les artefacts de ligature de la police du support
 * (« diagnosKc », « reproduc+on », « plaqueces ») : il sert à COMPARER et à
 * décider ; il n'est affiché aux élèves qu'après nettoyage, et en le signalant.
 *
 * Mesure du 10/09/2026 : 131 pages (support Pédiatrie, 10 Mo, 354 questions,
 * 1 770 propositions, 12 figures) lues en ~4 s sur un poste de travail, la
 * confrontation à 354 questions du modèle en ~0,3 s — loin du délai Vercel,
 * mais `lireVeritePdf` accepte une plage de pages et `fusionnerVerites`
 * recolle les morceaux (propositions coupées à la frontière comprises) si un
 * document bien plus gros l'exigeait.
 */

import {
  analyserPages, composerCorrigeSepare, fusionnerVerites, veriteEnErreur,
  COULEUR_INCONNUE,
  type CorrigeSepare, type ImageLue, type LigneLue, type PageLue, type ReperePage, type VeritePdf,
} from './exercise-import-verite-lecture';
import type { CorrectionsResult } from './exercise-import-schema';
import { composer, type Matrice } from './exercise-import-images-regles';

export * from './exercise-import-verite-texte';
export * from './exercise-import-verite-lecture';
export * from './exercise-import-verite-rapport';

export type OptionsLecture = {
  /** Plage de pages à lire (1-based, inclusive). Tout le document par défaut. */
  pages?: [number, number];
};

type Glyphe = { unicode?: string };
type OpsPdf = { fnArray: number[]; argsArray: unknown[][] };
type PagePdf = {
  getOperatorList(): Promise<OpsPdf>;
  getTextContent(): Promise<{ items: Array<{ str?: string; transform?: number[]; hasEOL?: boolean }> }>;
  getViewport?(args: { scale: number }): { transform?: number[] };
  cleanup?(): void;
};
type DocumentPdf = { numPages: number; getPage(n: number): Promise<PagePdf>; destroy?(): Promise<void> };
type ModulePdfJs = { getDocument(args: Record<string, unknown>): { promise: Promise<DocumentPdf> }; OPS: Record<string, number> };

async function ouvrir(bytes: Uint8Array): Promise<{ doc: DocumentPdf; OPS: Record<string, number> }> {
  // Import dynamique : pdf.js ne doit pas peser sur les routes qui ne
  // l'utilisent pas. Copie du tampon : pdf.js peut le détacher, et l'appelant
  // relit parfois le même document (corrigé, plages).
  // Le worker est chargé EN PREMIER : il se déclare dans `globalThis.pdfjsWorker`
  // et pdf.js l'utilise alors directement, sans `import(workerSrc)` par chemin.
  // Sinon, une fois bundlé par Turbopack sur Vercel, ce chemin
  // (« …/chunks/pdf.worker.mjs ») n'existe pas : « Setting up fake worker
  // failed » — constaté sur l'import de test du 10/09/2026.
  await import('pdfjs-dist/legacy/build/pdf.worker.mjs');
  const mod = (await import('pdfjs-dist/legacy/build/pdf.mjs')) as unknown as ModulePdfJs;
  const doc = await mod.getDocument({ data: new Uint8Array(bytes), useSystemFonts: true, verbosity: 0 }).promise;
  return { doc, OPS: mod.OPS };
}

/** NFKC : « ﬁ » → « fi », « µ » (micro) → « μ » (mu) ; les deux flux se comparent alors caractère à caractère. */
const canon = (s: string) => s.normalize('NFKC');

/**
 * Lit une page : lignes de texte (texte, x, y) avec une couleur par caractère,
 * et images avec leur position verticale.
 */
async function lirePage(page: PagePdf, OPS: Record<string, number>, numero: number): Promise<PageLue> {
  const ops = await page.getOperatorList();
  // ── Flux coloré : chaque caractère non blanc avec sa couleur, dans l'ordre de peinture ──
  const flux: Array<{ ch: string; couleur: string }> = [];
  const images: ImageLue[] = [];
  let couleur = '#000000';
  // Matrice courante (espace PDF, origine en bas), composée sur la pile
  // q/Q comme le fait `exercise-import-images-regles` : un PDF qui pose une
  // image par PLUSIEURS `cm` successifs (translation puis échelle, pdf-lib,
  // certains exports) n'était situé que par le dernier — une image de
  // 120 pt se retrouvait « entre y = 0 et y = 1 ».
  let ctm: Matrice = [1, 0, 0, 1, 0, 0];
  const pile: Matrice[] = [];
  for (let i = 0; i < ops.fnArray.length; i++) {
    const fn = ops.fnArray[i]; const args = (ops.argsArray[i] ?? []) as unknown[];
    if (fn === OPS.setFillRGBColor) {
      const c = args[0];
      if (typeof c === 'string') couleur = c.toLowerCase();
    } else if (fn === OPS.save) {
      pile.push(ctm);
    } else if (fn === OPS.restore) {
      ctm = pile.pop() ?? [1, 0, 0, 1, 0, 0];
    } else if (fn === OPS.transform) {
      const m = args.map(Number);
      if (m.length === 6 && m.every((v) => Number.isFinite(v))) ctm = composer(ctm, m as Matrice);
    } else if (fn === OPS.showText) {
      const glyphes = (args[0] ?? []) as Glyphe[];
      for (const g of glyphes) {
        const u = typeof g?.unicode === 'string' ? canon(g.unicode) : '';
        for (const ch of u) if (/\S/.test(ch)) flux.push({ ch, couleur });
      }
    } else if (fn === OPS.paintImageXObject || fn === OPS.paintInlineImageXObject) {
      // `paintImageXObject` reçoit [nom, largeur, hauteur] ; l'image inline
      // porte sa géométrie sur l'objet. La `transform` qui précède donne la
      // position sur la page (sans rotation : y de f à f + d).
      const inline = args[0] as { width?: number; height?: number } | undefined;
      const l = Number(args[1] ?? inline?.width); const h = Number(args[2] ?? inline?.height);
      if (!Number.isFinite(l) || !Number.isFinite(h)) continue;
      let yBas: number | null = null; let yHaut: number | null = null;
      if (Math.abs(ctm[1]) < 1e-6 && Math.abs(ctm[2]) < 1e-6) {
        yBas = Math.min(ctm[5], ctm[5] + ctm[3]); yHaut = Math.max(ctm[5], ctm[5] + ctm[3]);
      }
      images.push({ l, h, yBas, yHaut });
    }
  }

  // ── Lignes : items de `getTextContent` groupés par ordonnée, couleurs appariées au flux ──
  const tc = await page.getTextContent();
  const lignes: LigneLue[] = [];
  let courante: LigneLue | null = null;
  let curseur = 0;
  let derniere = '#000000';
  for (const it of tc.items) {
    if (typeof it.str !== 'string' || it.str === '') continue;
    const y = it.transform?.[5] ?? null; const x = it.transform?.[4] ?? null;
    if (!courante || courante.y === null || y === null || Math.abs(courante.y - y) > 2) {
      courante = { texte: '', couleurs: [], x, y };
      lignes.push(courante);
    }
    const str = canon(it.str);
    for (let k = 0; k < str.length; k++) {
      const ch = str[k];
      if (!/\S/.test(ch)) { courante.texte += ch; courante.couleurs.push(derniere); continue; }
      let c = COULEUR_INCONNUE;
      if (curseur < flux.length && flux[curseur].ch === ch) { c = flux[curseur].couleur; curseur++; }
      else {
        // Désynchronisation (glyphe rendu autrement par les deux flux) : on
        // cherche la suite de l'item un peu plus loin, sinon la couleur de ce
        // caractère reste inconnue et le curseur ne bouge pas.
        const attendu = str.slice(k).replace(/\s+/g, '').slice(0, 8);
        const trouve = attendu.length >= 4 ? chercher(flux, curseur, attendu) : -1;
        if (trouve >= 0) { curseur = trouve; c = flux[curseur].couleur; curseur++; }
      }
      if (c !== COULEUR_INCONNUE) derniere = c;
      courante.texte += ch; courante.couleurs.push(c);
    }
  }
  // Matrice de vue : le repère des images (origine en haut) se déduit du
  // repère du texte (origine en bas) par cette matrice, quelle que soit la
  // taille de page ou le décalage de la MediaBox (cf. `versRepereHaut`).
  const t = page.getViewport?.({ scale: 1 })?.transform;
  const repere = Array.isArray(t) && t.length === 6 && t.every((v) => Number.isFinite(v)) ? (t as ReperePage) : undefined;
  page.cleanup?.();
  return { page: numero, lignes, images, ...(repere ? { repere } : {}) };
}

/** Position de `attendu` dans le flux à partir de `de` (fenêtre bornée), -1 sinon. */
function chercher(flux: Array<{ ch: string }>, de: number, attendu: string): number {
  const fin = Math.min(flux.length - attendu.length, de + 400);
  for (let i = de; i <= fin; i++) {
    let k = 0; while (k < attendu.length && flux[i + k].ch === attendu[k]) k++;
    if (k === attendu.length) return i;
  }
  return -1;
}

/**
 * Lit les pages d'un PDF (toutes, ou une plage) sous forme de `PageLue[]`.
 * Lève en cas de document illisible : `lireVeritePdf` capture et explique.
 * Exposée pour les traitements qui ont besoin des lignes brutes (images,
 * corrigé séparé) sans refaire la lecture.
 */
export async function lirePagesPdf(bytes: Uint8Array, options: OptionsLecture = {}): Promise<{ pages: PageLue[]; nbPagesDocument: number; pagesLues: [number, number] }> {
  const { doc, OPS } = await ouvrir(bytes);
  try {
    const de = Math.max(1, Math.floor(options.pages?.[0] ?? 1));
    const a = Math.min(doc.numPages, Math.floor(options.pages?.[1] ?? doc.numPages));
    if (de > a) throw new Error(`Plage de pages invalide : ${de}-${a} sur ${doc.numPages}.`);
    const pages: PageLue[] = [];
    for (let p = de; p <= a; p++) pages.push(await lirePage(await doc.getPage(p), OPS, p));
    return { pages, nbPagesDocument: doc.numPages, pagesLues: [de, a] };
  } finally {
    await doc.destroy?.().catch(() => undefined);
  }
}

/**
 * Lit le PDF et rend sa vérité : questions, propositions, corrigé par la
 * couleur, vignettes, images, diagnostic. NE LÈVE JAMAIS : un document
 * illisible rend `statut: 'erreur'` avec sa raison, et le pipeline continue
 * en le disant.
 *
 * `options.pages` limite la lecture à une plage (1-based, inclusive) ; les
 * morceaux se recollent avec `fusionnerVerites`.
 */
export async function lireVeritePdf(bytes: Uint8Array, options: OptionsLecture = {}): Promise<VeritePdf> {
  try {
    const { pages, nbPagesDocument, pagesLues } = await lirePagesPdf(bytes, options);
    return analyserPages(pages, { nbPagesDocument, pagesLues: options.pages ? pagesLues : null });
  } catch (e) {
    return veriteEnErreur(e instanceof Error ? e.message : String(e));
  }
}

/**
 * Lit un document entier par plages de `taille` pages et fusionne. Utile si
 * un document dépasse ce qu'un seul appel peut lire dans le délai imparti.
 */
export async function lireVeritePdfParPlages(bytes: Uint8Array, taille = 40): Promise<VeritePdf> {
  let nbPages: number;
  try { const { doc } = await ouvrir(bytes); nbPages = doc.numPages; await doc.destroy?.().catch(() => undefined); } catch (e) {
    return veriteEnErreur(e instanceof Error ? e.message : String(e));
  }
  const parts: VeritePdf[] = [];
  for (let de = 1; de <= nbPages; de += taille) parts.push(await lireVeritePdf(bytes, { pages: [de, Math.min(nbPages, de + taille - 1)] }));
  return fusionnerVerites(parts);
}

/**
 * Lit un PDF de CORRECTIONS séparé (mode `paired`) et en tire les lettres
 * justes par numéro : par la couleur quand le corrigé est coloré, par les
 * motifs textuels (« Réponses : A, C, E », tableau « 1 : ACE ») sinon ou en
 * complément. Ne lève jamais.
 */
export async function lireCorrigeSepare(bytes: Uint8Array, options: OptionsLecture = {}): Promise<CorrigeSepare> {
  try {
    const { pages, nbPagesDocument, pagesLues } = await lirePagesPdf(bytes, options);
    const verite = analyserPages(pages, { nbPagesDocument, pagesLues: options.pages ? pagesLues : null });
    return composerCorrigeSepare(verite, pages);
  } catch (e) {
    const verite = veriteEnErreur(e instanceof Error ? e.message : String(e));
    return { statut: 'erreur', origine: 'aucune', lettresJustes: {}, avertissements: verite.avertissements, verite };
  }
}

/**
 * Forme attendue par `appliquerCorrections` (schéma) : un corrigé séparé lu
 * par la couleur ou le texte se recolle aux questions par numéro imprimé.
 */
export function versCorrectionsResult(corrige: CorrigeSepare): CorrectionsResult {
  return {
    corrections: Object.entries(corrige.lettresJustes).map(([numero, lettres]) => ({
      numero_source: numero, source_pages: [], lettres_justes: lettres, justifications: [], reponse_attendue: '', correction_generale: '',
    })),
    warnings: corrige.avertissements,
  };
}

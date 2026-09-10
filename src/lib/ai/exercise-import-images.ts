import 'server-only';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import path from 'node:path';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  boitesImagesDepuisOperateurs, dedoublonner, filtrerBoites,
  type BoiteImage, type Matrice, type NatureImage, type OperateursImages,
} from './exercise-import-images-regles';

export {
  rattacherImages, dedoublonner, filtrerBoites, boitesImagesDepuisOperateurs, seuilRepetition,
} from './exercise-import-images-regles';
export type {
  BlocQuestion, ImageAPlacer, Rattachement, Confiance, BoiteImage, NatureImage,
} from './exercise-import-images-regles';

/**
 * Images d'un PDF d'exercices — extraction déterministe et téléversement.
 *
 * POURQUOI (10/09/2026)
 * --------------------
 * L'outil /admin/import-exercices ne tirait aucune image du PDF : le modèle
 * les DÉCRIVAIT en texte (« radiographie du thorax de face ») et la RPC de
 * publication écrivait `images = '[]'` en dur. Les élèves recevaient des
 * questions posées sur un document qu'ils ne voyaient pas (12 documents
 * cliniques perdus sur l'import Pédiatrie « REVISION GENERALE »).
 *
 * COMMENT
 * -------
 * Sans navigateur ni modèle : pdf.js (build « legacy », le seul qui tourne en
 * Node) donne la liste d'opérateurs de chaque page ; on y rejoue les matrices
 * pour situer chaque image (`boitesImagesDepuisOperateurs`), on écarte le
 * décor par la géométrie seule (`filtrerBoites` : vignettes, filets, logo et
 * filigrane répétés), puis on rend UNIQUEMENT les pages qui portent une figure
 * sur un canvas (`@napi-rs/canvas`) et on découpe la zone de chaque image.
 * Découper le rendu plutôt que décoder l'objet image à la main est plus
 * robuste (JPX, masques de transparence, recadrages Word par clip, images en
 * mosaïque) ; le décor est retiré du rendu (`operationsFilter`) pour qu'un
 * filigrane ne traverse pas une figure.
 *
 * Les seuils : < 90 × 90 px rendus, rapport > 14:1, même boîte sur
 * ≥ max(3, 40 %) des pages traitées ; dédoublonnage par SHA-1 du PNG.
 *
 * Plages de pages : `extraireImagesPdf(buffer, { pages: [1, 40] })` traite une
 * tranche, `budgetMs` arrête proprement et renseigne `pageSuivante` — une
 * route Vercel de 300 s peut ainsi reprendre. Le filtre de répétition est
 * calculé sur la tranche, complétée par la géométrie de quelques pages hors
 * tranche quand elle est courte (< 8 pages) ; `signaturesDecor` /
 * `decorConnu` transmettent le décor reconnu d'un appel au suivant.
 *
 * Mesure (pedia-corrections.pdf, 131 pages, A4) : analyse ≈ 25 ms/page,
 * rendu + découpe ≈ 250 ms par page illustrée — l'ensemble en une dizaine de
 * secondes, cf. rapport du 10/09/2026.
 */

export type OptionsExtraction = {
  /** Plage [début, fin] inclusive, 1 = première page. Défaut : tout le document. */
  pages?: [number, number];
  /** Pixels rendus par point (défaut 2 : une page A4 fait 1190 × 1684 px). */
  echelle?: number;
  /** Plus petit côté accepté, en pixels rendus (défaut 90). */
  minCote?: number;
  /** Rapport largeur/hauteur maximal (défaut 14). */
  ratioMax?: number;
  /** Empreintes déjà téléversées (appels précédents) : leurs doublons sont écartés. */
  exclureSha1?: Iterable<string>;
  /** Signatures de décor apprises par un appel précédent (`ResultatExtraction.signaturesDecor`). */
  decorConnu?: Iterable<string>;
  /** Arrêt propre après ce délai (une page est toujours traitée) ; `pageSuivante` dit où reprendre. */
  budgetMs?: number;
};

/** Une image découpée, prête à être téléversée. */
export type ImageExtraite = {
  page: number;
  /** Rang de l'image sur sa page (1 = la plus haute), stable d'un appel à l'autre. */
  indice: number;
  /** Boîte sur la page, en points, origine en haut à gauche. */
  x: number;
  yDebut: number;
  yFin: number;
  largeur: number;
  hauteur: number;
  /** Taille de la découpe, en pixels. */
  largeurPx: number;
  hauteurPx: number;
  nature: NatureImage;
  rotation: number;
  png: Buffer;
  sha1: string;
};

export type ResultatExtraction = {
  numPages: number;
  /** Plage effectivement analysée (bornée au document et au budget). */
  pages: [number, number];
  /** Première page non traitée quand le budget a interrompu le travail, sinon `null`. */
  pageSuivante: number | null;
  images: ImageExtraite[];
  ecartees: { petites: number; allongees: number; decor: number; doublons: number };
  /** Pages de la plage portant au moins une image retenue. */
  pagesAvecImage: number[];
  /** Décor reconnu (logo, filigrane) : à repasser en `decorConnu` à l'appel suivant. */
  signaturesDecor: string[];
  dureeMs: number;
};

/** Dossiers de pdf.js lus par Node (polices standard, décodeurs wasm) ; vides si introuvables. */
function cheminsPdfjs(): { standardFontDataUrl?: string; wasmUrl?: string } {
  try {
    const require = createRequire(import.meta.url);
    const racine = path.dirname(require.resolve('pdfjs-dist/package.json')).replace(/\\/g, '/');
    // pdf.js exige la barre oblique finale et lit ces chemins avec fs.readFile.
    return { standardFontDataUrl: `${racine}/standard_fonts/`, wasmUrl: `${racine}/wasm/` };
  } catch {
    return {};
  }
}

const borner = (v: number, min: number, max: number) => Math.min(max, Math.max(min, Math.trunc(v)));

/** En dessous de ce nombre de pages analysées, on complète par des pages hors tranche pour reconnaître le décor. */
const PAGES_APPRENTISSAGE = 8;

export async function extraireImagesPdf(buffer: Uint8Array | ArrayBuffer, options: OptionsExtraction = {}): Promise<ResultatExtraction> {
  const debut = Date.now();
  const echelle = options.echelle && options.echelle > 0 ? options.echelle : 2;
  const budgetEpuise = () => options.budgetMs !== undefined && Date.now() - debut > options.budgetMs;

  // Ordre des imports : les globaux DOMMatrix / ImageData / Path2D doivent
  // venir de NOTRE @napi-rs/canvas AVANT le chargement de pdf.js — sinon
  // pdf.js charge sa propre copie (version différente via pnpm) et ses Path2D
  // sont refusés par nos contextes (« Value is none of these types »).
  const canvasLib = await import('@napi-rs/canvas');
  const g = globalThis as Record<string, unknown>;
  g.DOMMatrix ??= canvasLib.DOMMatrix;
  g.ImageData ??= canvasLib.ImageData;
  g.Path2D ??= canvasLib.Path2D;
  const { getDocument, OPS } = await import('pdfjs-dist/legacy/build/pdf.mjs');

  /** Fabrique de canvas de pdf.js (canvas temporaires des images, masques, motifs). */
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

  // pdf.js peut transférer le tampon reçu : on lui donne une copie.
  const data = new Uint8Array(buffer instanceof ArrayBuffer ? buffer : buffer);
  const doc = await getDocument({
    data, useSystemFonts: true, isEvalSupported: false, verbosity: 0,
    CanvasFactory: FabriqueCanvas,
    ...cheminsPdfjs(),
  } as Parameters<typeof getDocument>[0]).promise;

  try {
    const numPages = doc.numPages;
    const demande = options.pages ?? [1, numPages];
    const debutPage = borner(demande[0], 1, numPages);
    const finPage = borner(demande[1], debutPage, numPages);

    const opsIds: OperateursImages = {
      save: OPS.save, restore: OPS.restore, transform: OPS.transform,
      paintFormXObjectBegin: OPS.paintFormXObjectBegin, paintFormXObjectEnd: OPS.paintFormXObjectEnd,
      beginAnnotation: OPS.beginAnnotation, endAnnotation: OPS.endAnnotation,
      paintImageXObject: OPS.paintImageXObject, paintInlineImageXObject: OPS.paintInlineImageXObject,
      paintImageXObjectRepeat: OPS.paintImageXObjectRepeat, paintInlineImageXObjectGroup: OPS.paintInlineImageXObjectGroup,
      paintImageMaskXObject: OPS.paintImageMaskXObject, paintImageMaskXObjectRepeat: OPS.paintImageMaskXObjectRepeat,
      paintImageMaskXObjectGroup: OPS.paintImageMaskXObjectGroup,
    };

    // 1. Analyse : la géométrie de chaque image, page par page. Les objets
    //    image décodés sont libérés aussitôt (un filigrane pleine page pèse
    //    6 Mo décodé ; 131 pages en mémoire feraient tomber la fonction).
    const boitesParPage = new Map<number, BoiteImage[]>();
    let derniereAnalysee = debutPage - 1;
    for (let p = debutPage; p <= finPage; p++) {
      if (p > debutPage && budgetEpuise()) break;
      const page = await doc.getPage(p);
      const liste = await page.getOperatorList();
      const base = page.getViewport({ scale: 1 }).transform as Matrice;
      boitesParPage.set(p, boitesImagesDepuisOperateurs(liste, opsIds, base, p));
      page.cleanup();
      derniereAnalysee = p;
    }

    // 1 bis. Apprentissage du décor : une tranche courte ne peut pas voir un
    //    logo se répéter (il faut 3 pages). On lit la seule géométrie — pas de
    //    rendu, ~25 ms la page — d'une poignée de pages hors tranche réparties
    //    sur le document, pour compléter la statistique de répétition.
    const nbTranche = derniereAnalysee - debutPage + 1;
    const apprentissage: BoiteImage[] = [];
    let nbApprentissage = 0;
    if (nbTranche < PAGES_APPRENTISSAGE && numPages > nbTranche) {
      const manque = PAGES_APPRENTISSAGE - nbTranche;
      const choisies = new Set<number>();
      for (let k = 0; k < manque && choisies.size < manque; k++) {
        const p = manque === 1 ? Math.round((1 + numPages) / 2) : Math.round(1 + (k * (numPages - 1)) / (manque - 1));
        if (p >= debutPage && p <= derniereAnalysee) continue;
        choisies.add(borner(p, 1, numPages));
      }
      for (const p of choisies) {
        const page = await doc.getPage(p);
        const liste = await page.getOperatorList();
        apprentissage.push(...boitesImagesDepuisOperateurs(liste, opsIds, page.getViewport({ scale: 1 }).transform as Matrice, p));
        page.cleanup();
        nbApprentissage++;
      }
    }

    // 2. Filtres, sur la tranche analysée (plus les pages d'apprentissage,
    //    qui ne produisent aucune image).
    const nbPages = nbTranche + nbApprentissage;
    const filtre = filtrerBoites([...[...boitesParPage.values()].flat(), ...apprentissage], {
      echelle, minCote: options.minCote, ratioMax: options.ratioMax, nbPages, decorConnu: options.decorConnu,
    });
    const dansTranche = (b: BoiteImage) => b.page >= debutPage && b.page <= derniereAnalysee;
    const retenues = filtre.retenues.filter(dansTranche);
    const decor = filtre.decor.filter(dansTranche);
    const { signaturesDecor } = filtre;
    const ecartees = {
      petites: filtre.ecartees.petites, allongees: filtre.ecartees.allongees, decor: decor.length,
    };
    const decorParPage = new Map<number, Set<number>>();
    for (const b of decor) {
      const s = decorParPage.get(b.page); if (s) s.add(b.opIndex); else decorParPage.set(b.page, new Set([b.opIndex]));
    }
    const retenuesParPage = new Map<number, BoiteImage[]>();
    for (const b of retenues) {
      const l = retenuesParPage.get(b.page); if (l) l.push(b); else retenuesParPage.set(b.page, [b]);
    }
    const pagesAvecImage = [...retenuesParPage.keys()].sort((a, b) => a - b);

    // 3. Rendu des seules pages illustrées, décor masqué, puis découpe.
    const images: ImageExtraite[] = [];
    let pageSuivante: number | null = null;
    for (const p of pagesAvecImage) {
      // La première page illustrée est toujours rendue : un appel avance d'au moins une page.
      if (p !== pagesAvecImage[0] && budgetEpuise()) { pageSuivante = p; break; }
      const page = await doc.getPage(p);
      const viewport = page.getViewport({ scale: echelle });
      const largeurPage = Math.ceil(viewport.width); const hauteurPage = Math.ceil(viewport.height);
      const canvas = canvasLib.createCanvas(largeurPage, hauteurPage);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, largeurPage, hauteurPage);
      const exclus = decorParPage.get(p);
      await page.render({
        // pdf.js 5 : `canvas: null` impose l'usage du contexte fourni.
        canvas: null,
        canvasContext: ctx as unknown as CanvasRenderingContext2D,
        viewport,
        operationsFilter: exclus?.size ? (i: number) => !exclus.has(i) : undefined,
      }).promise;

      const boites = [...retenuesParPage.get(p)!].sort((a, b) => (a.y - b.y) || (a.x - b.x));
      let indice = 0;
      for (const b of boites) {
        const x0 = borner(Math.floor(b.x * echelle), 0, largeurPage);
        const y0 = borner(Math.floor(b.y * echelle), 0, hauteurPage);
        const x1 = borner(Math.ceil((b.x + b.largeur) * echelle), 0, largeurPage);
        const y1 = borner(Math.ceil((b.y + b.hauteur) * echelle), 0, hauteurPage);
        const l = x1 - x0; const h = y1 - y0;
        if (l < 1 || h < 1) continue;
        const decoupe = canvasLib.createCanvas(l, h);
        decoupe.getContext('2d').drawImage(canvas, x0, y0, l, h, 0, 0, l, h);
        const png = Buffer.from(await decoupe.encode('png'));
        indice++;
        images.push({
          page: p, indice,
          x: b.x, yDebut: b.y, yFin: b.y + b.hauteur, largeur: b.largeur, hauteur: b.hauteur,
          largeurPx: l, hauteurPx: h, nature: b.nature, rotation: b.rotation,
          png, sha1: createHash('sha1').update(png).digest('hex'),
        });
      }
      page.cleanup();
    }

    // 4. Dédoublonnage (le même document collé deux fois, ou déjà téléversé).
    const { uniques, doublons } = dedoublonner(images, options.exclureSha1);
    if (pageSuivante === null && derniereAnalysee < finPage) pageSuivante = derniereAnalysee + 1;

    return {
      numPages,
      pages: [debutPage, derniereAnalysee],
      pageSuivante,
      images: uniques,
      ecartees: { ...ecartees, doublons },
      pagesAvecImage,
      signaturesDecor,
      dureeMs: Date.now() - debut,
    };
  } finally {
    await doc.destroy();
  }
}

/* ───────────────────────────── Téléversement ───────────────────────────── */

export type ImageTeleversee = Omit<ImageExtraite, 'png'> & {
  /** Chemin dans le bucket `qcm-images`. */
  chemin: string;
  /** URL publique, à écrire telle quelle dans `qcm_questions.images`. */
  url: string;
  octets: number;
};

const BUCKET = 'qcm-images';
const PREFIXE_DEFAUT = 'imports';

function verifierImportId(importId: string): void {
  if (!/^[A-Za-z0-9_-]{1,80}$/.test(importId)) throw new Error(`Identifiant d'import invalide : ${JSON.stringify(importId)}`);
}

/**
 * Téléverse les découpes dans le bucket public `qcm-images`, sous
 * `imports/<importId>/p<page>-<n>.png`. Idempotent : le chemin ne dépend que
 * de l'import et de la position de l'image, et l'envoi écrase (`upsert`).
 * Rend les images avec leur URL publique, sans le PNG.
 */
export async function televerserImagesImport(
  importId: string,
  images: ImageExtraite[],
  options: { prefixe?: string; parallelisme?: number } = {},
): Promise<ImageTeleversee[]> {
  verifierImportId(importId);
  const prefixe = (options.prefixe ?? PREFIXE_DEFAUT).replace(/^\/+|\/+$/g, '');
  const parallelisme = Math.max(1, options.parallelisme ?? 4);
  const bucket = createAdminClient().storage.from(BUCKET);

  const envoyer = async (im: ImageExtraite): Promise<ImageTeleversee> => {
    const chemin = `${prefixe}/${importId}/p${im.page}-${im.indice}.png`;
    const { error } = await bucket.upload(chemin, im.png, { contentType: 'image/png', cacheControl: '3600', upsert: true });
    if (error) throw new Error(`Téléversement de ${chemin} : ${error.message}`);
    const { data } = bucket.getPublicUrl(chemin);
    const { png, ...reste } = im;
    return { ...reste, chemin, url: data.publicUrl, octets: png.byteLength };
  };

  const sorties: ImageTeleversee[] = [];
  for (let i = 0; i < images.length; i += parallelisme) {
    sorties.push(...(await Promise.all(images.slice(i, i + parallelisme).map(envoyer))));
  }
  return sorties;
}

/** Supprime toutes les images téléversées pour un import ; rend le nombre de fichiers retirés. */
export async function supprimerImagesImport(importId: string, options: { prefixe?: string } = {}): Promise<number> {
  verifierImportId(importId);
  const prefixe = (options.prefixe ?? PREFIXE_DEFAUT).replace(/^\/+|\/+$/g, '');
  const bucket = createAdminClient().storage.from(BUCKET);
  const dossier = `${prefixe}/${importId}`;
  const { data, error } = await bucket.list(dossier, { limit: 1000 });
  if (error) throw new Error(`Liste de ${dossier} : ${error.message}`);
  const chemins = (data ?? []).filter((f) => f.name && !f.name.endsWith('/')).map((f) => `${dossier}/${f.name}`);
  if (!chemins.length) return 0;
  const { error: errSuppr } = await bucket.remove(chemins);
  if (errSuppr) throw new Error(`Suppression de ${dossier} : ${errSuppr.message}`);
  return chemins.length;
}

/**
 * Images d'un PDF d'exercices — les règles pures.
 *
 * Ce module ne touche ni pdf.js, ni canvas, ni Supabase : il ne fait que de
 * la géométrie et des décisions sur des nombres, ce qui le rend testable sans
 * document. Le module frère `exercise-import-images.ts` (côté serveur) lit le
 * PDF, rend les pages, découpe les images et les téléverse ; il s'appuie sur
 * les fonctions d'ici pour :
 *
 *   1. reconstituer la boîte de chaque image à partir de la liste d'opérateurs
 *      de la page (`boitesImagesDepuisOperateurs`) — pdf.js peint chaque image
 *      dans le carré unité sous la matrice de transformation courante ;
 *   2. écarter le décor (`filtrerBoites`) : vignettes trop petites, filets
 *      (ratio extrême), logo et filigrane répétés à la même place de page en
 *      page ;
 *   3. dédoublonner les découpes identiques (`dedoublonner`) ;
 *   4. rattacher chaque image à une question du document (`rattacherImages`).
 *
 * Repère : toutes les coordonnées « page » sont en points PDF (1/72 pouce),
 * origine en HAUT à gauche de la page, y croissant vers le BAS — c'est le
 * repère de `page.getViewport({ scale: 1 })` de pdf.js. Une ordonnée lue dans
 * `getTextContent()` (origine en bas) se convertit par `y = hauteurPage - f`.
 */

/** Matrice affine 2D au format PDF / canvas : [a, b, c, d, e, f]. */
export type Matrice = [number, number, number, number, number, number];

/** `ctx.transform(m2)` après `m1` : la nouvelle matrice courante (m2 s'applique d'abord aux points). */
export function composer(m1: Matrice, m2: Matrice): Matrice {
  return [
    m1[0] * m2[0] + m1[2] * m2[1],
    m1[1] * m2[0] + m1[3] * m2[1],
    m1[0] * m2[2] + m1[2] * m2[3],
    m1[1] * m2[2] + m1[3] * m2[3],
    m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
    m1[1] * m2[4] + m1[3] * m2[5] + m1[5],
  ];
}

/** Image du point (x, y) par la matrice. */
export function appliquer(m: Matrice, x: number, y: number): [number, number] {
  return [x * m[0] + y * m[2] + m[4], x * m[1] + y * m[3] + m[5]];
}

export type NatureImage = 'xobject' | 'inline' | 'repetee' | 'groupe' | 'masque';

/** Une image peinte sur une page, décrite par sa boîte englobante. */
export type BoiteImage = {
  /** Numéro de page (1 = première). */
  page: number;
  /** Boîte englobante, en points, origine en haut à gauche, y vers le bas. */
  x: number;
  y: number;
  largeur: number;
  hauteur: number;
  /** Angle de l'axe horizontal de l'image sur la page, en degrés (0 = droite, 45 = filigrane oblique). */
  rotation: number;
  /** Côtés de l'image telle que posée sur la page (avant rotation), en points : base des filtres de taille et de rapport. */
  largeurImage: number;
  hauteurImage: number;
  nature: NatureImage;
  /** Identifiant pdf.js de l'objet image (absent pour une image inline ou un masque). */
  objId?: string;
  /** Indice de l'opérateur de peinture dans `fnArray` : sert à ne pas le peindre au rendu. */
  opIndex: number;
  /** Définition native de l'image quand pdf.js la transmet. */
  largeurNative?: number;
  hauteurNative?: number;
};

/**
 * Identifiants numériques des opérateurs pdf.js utiles (`OPS.xxx`). On les
 * reçoit plutôt que de les importer pour rester pur ; un identifiant absent
 * (`undefined`) désactive simplement l'opérateur.
 */
export type OperateursImages = Partial<Record<
  | 'save' | 'restore' | 'transform'
  | 'paintFormXObjectBegin' | 'paintFormXObjectEnd'
  | 'beginAnnotation' | 'endAnnotation'
  | 'paintImageXObject' | 'paintInlineImageXObject'
  | 'paintImageXObjectRepeat' | 'paintInlineImageXObjectGroup'
  | 'paintImageMaskXObject' | 'paintImageMaskXObjectRepeat' | 'paintImageMaskXObjectGroup',
  number
>>;

export type ListeOperateurs = { fnArray: ArrayLike<number>; argsArray: ArrayLike<unknown> };

/** Boîte englobante (repère de `base`) du carré unité transformé par `m`. */
function boiteCarreUnite(m: Matrice): Pick<BoiteImage, 'x' | 'y' | 'largeur' | 'hauteur' | 'rotation' | 'largeurImage' | 'hauteurImage'> {
  const coins = [appliquer(m, 0, 0), appliquer(m, 1, 0), appliquer(m, 0, 1), appliquer(m, 1, 1)];
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of coins) {
    if (x < x0) x0 = x; if (x > x1) x1 = x;
    if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  // L'axe x de l'image est le vecteur (a, b) ; l'angle est pris modulo 180°
  // pour qu'un miroir vertical (d < 0, le cas normal des images PDF) reste à 0.
  let rotation = (Math.atan2(m[1], m[0]) * 180) / Math.PI;
  rotation = ((rotation % 180) + 180) % 180;
  if (rotation > 90) rotation -= 180;
  return {
    x: x0, y: y0, largeur: x1 - x0, hauteur: y1 - y0,
    rotation: Math.abs(rotation) < 1e-6 ? 0 : rotation,
    largeurImage: Math.hypot(m[0], m[1]), hauteurImage: Math.hypot(m[2], m[3]),
  };
}

/**
 * Reconstitue la boîte de chaque image peinte sur la page en rejouant les
 * transformations de la liste d'opérateurs (save / restore / transform, formes
 * XObject, annotations). `base` est la matrice initiale — typiquement
 * `viewport.transform` à l'échelle 1, qui place l'origine en haut à gauche.
 *
 * Miroir de `CanvasGraphics` (pdf.js `display/canvas.js`) : une image est
 * toujours peinte dans le carré unité sous la matrice courante ; les variantes
 * « repeat » et « group » ajoutent une matrice propre par occurrence.
 */
export function boitesImagesDepuisOperateurs(liste: ListeOperateurs, ops: OperateursImages, base: Matrice, page: number): BoiteImage[] {
  const boites: BoiteImage[] = [];
  const pile: Matrice[] = [];
  const pileForme: number[] = [];
  let ctm: Matrice = [...base] as Matrice;

  const pousser = (nature: NatureImage, m: Matrice, opIndex: number, extra: Partial<BoiteImage> = {}) => {
    const b = boiteCarreUnite(m);
    if (!Number.isFinite(b.largeur) || !Number.isFinite(b.hauteur)) return;
    boites.push({ page, ...b, nature, opIndex, ...extra });
  };

  const n = liste.fnArray.length;
  for (let i = 0; i < n; i++) {
    const fn = liste.fnArray[i];
    const args = (liste.argsArray[i] ?? []) as unknown[];
    switch (fn) {
      case ops.save:
        pile.push(ctm);
        break;
      case ops.restore:
        ctm = pile.pop() ?? ([...base] as Matrice);
        break;
      case ops.transform: {
        const m = args.slice(0, 6).map(Number) as Matrice;
        if (m.length === 6 && m.every(Number.isFinite)) ctm = composer(ctm, m);
        break;
      }
      case ops.paintFormXObjectBegin: {
        // canvas.js : save() puis transform(matrix) si présente ; le end() fait restore().
        pile.push(ctm);
        pileForme.push(pile.length);
        const m = args[0];
        if (Array.isArray(m) && m.length === 6) ctm = composer(ctm, m.map(Number) as Matrice);
        break;
      }
      case ops.paintFormXObjectEnd: {
        const cible = pileForme.pop();
        if (cible !== undefined) {
          while (pile.length > cible) pile.pop();
          ctm = pile.pop() ?? ([...base] as Matrice);
        }
        break;
      }
      case ops.beginAnnotation: {
        // canvas.js : retour à la matrice de base, puis transform(transform) et transform(matrix).
        pile.length = 0;
        ctm = [...base] as Matrice;
        pile.push(ctm);
        const t = args[2]; const m = args[3];
        if (Array.isArray(t) && t.length === 6) ctm = composer(ctm, t.map(Number) as Matrice);
        if (Array.isArray(m) && m.length === 6) ctm = composer(ctm, m.map(Number) as Matrice);
        break;
      }
      case ops.endAnnotation:
        pile.length = 0;
        ctm = [...base] as Matrice;
        break;
      case ops.paintImageXObject: {
        const [objId, l, h] = args as [string, number?, number?];
        pousser('xobject', ctm, i, {
          objId: typeof objId === 'string' ? objId : undefined,
          largeurNative: Number.isFinite(Number(l)) ? Number(l) : undefined,
          hauteurNative: Number.isFinite(Number(h)) ? Number(h) : undefined,
        });
        break;
      }
      case ops.paintInlineImageXObject: {
        const img = args[0] as { width?: number; height?: number } | undefined;
        pousser('inline', ctm, i, { largeurNative: img?.width, hauteurNative: img?.height });
        break;
      }
      case ops.paintImageMaskXObject: {
        const img = args[0] as { width?: number; height?: number } | undefined;
        pousser('masque', ctm, i, { largeurNative: img?.width, hauteurNative: img?.height });
        break;
      }
      case ops.paintImageXObjectRepeat:
      case ops.paintImageMaskXObjectRepeat: {
        // [objId | imgData, scaleX, scaleY, positions[x0, y0, x1, y1, …]]
        const sx = Number(args[1]); const sy = Number(args[2]);
        const positions = args[3];
        if (!Array.isArray(positions) && !ArrayBuffer.isView(positions)) break;
        const pos = positions as ArrayLike<number>;
        const objId = typeof args[0] === 'string' ? args[0] : undefined;
        for (let k = 0; k + 1 < pos.length; k += 2) {
          pousser(fn === ops.paintImageXObjectRepeat ? 'repetee' : 'masque', composer(ctm, [sx, 0, 0, sy, Number(pos[k]), Number(pos[k + 1])]), i, { objId });
        }
        break;
      }
      case ops.paintInlineImageXObjectGroup: {
        const carte = args[1];
        if (!Array.isArray(carte)) break;
        for (const entree of carte as Array<{ transform?: number[] }>) {
          if (Array.isArray(entree?.transform) && entree.transform.length === 6) pousser('groupe', composer(ctm, entree.transform as Matrice), i);
        }
        break;
      }
      case ops.paintImageMaskXObjectGroup: {
        const images = args[0];
        if (!Array.isArray(images)) break;
        for (const img of images as Array<{ transform?: number[]; width?: number; height?: number }>) {
          if (Array.isArray(img?.transform) && img.transform.length === 6) {
            pousser('masque', composer(ctm, img.transform as Matrice), i, { largeurNative: img.width, hauteurNative: img.height });
          }
        }
        break;
      }
      default:
        break;
    }
  }
  return boites;
}

export type OptionsFiltre = {
  /** Facteur de rendu (pixels par point) : les seuils de taille s'expriment en pixels rendus. */
  echelle: number;
  /** Plus petit côté accepté, en pixels rendus (défaut 90). */
  minCote?: number;
  /** Rapport largeur/hauteur (ou l'inverse) au-delà duquel l'image est un filet (défaut 14). */
  ratioMax?: number;
  /** Nombre de pages effectivement analysées : base du seuil de répétition. */
  nbPages: number;
  /** Tolérance de position, en points, pour dire que deux boîtes sont « à la même place » (défaut 3). */
  tolerance?: number;
  /**
   * Signatures (`signatureBoite`) déjà reconnues comme décor par un appel
   * précédent : elles sont écartées d'office. Permet à une tranche courte de
   * profiter de ce qu'une tranche longue a appris.
   */
  decorConnu?: Iterable<string>;
};

export type EcartsFiltre = { petites: number; allongees: number; decor: number };

/** Seuil de pages à partir duquel une même boîte est du décor : max(3, 40 % des pages). */
export function seuilRepetition(nbPages: number): number {
  return Math.max(3, Math.ceil(0.4 * Math.max(0, nbPages)));
}

/** Signature de position d'une boîte, arrondie à la tolérance. */
export function signatureBoite(b: Pick<BoiteImage, 'x' | 'y' | 'largeur' | 'hauteur'>, tolerance = 3): string {
  const q = (v: number) => Math.round(v / tolerance);
  return `${q(b.x)}:${q(b.y)}:${q(b.largeur)}:${q(b.hauteur)}`;
}

/**
 * Écarte le décor. Les trois filtres s'appliquent dans l'ordre : taille,
 * ratio, puis répétition — le logo et le filigrane, peints à la même place sur
 * (presque) chaque page, sont reconnus par leur géométrie seule, sans décoder
 * l'image. `decor` rend ces boîtes-là : le rendu les masque pour qu'un
 * filigrane ne traverse pas une figure découpée.
 */
export function filtrerBoites(boites: BoiteImage[], options: OptionsFiltre): {
  retenues: BoiteImage[];
  decor: BoiteImage[];
  ecartees: EcartsFiltre;
  /** Signatures du décor reconnu (répétition ou `decorConnu`), à transmettre à l'appel suivant. */
  signaturesDecor: string[];
} {
  const { echelle, minCote = 90, ratioMax = 14, nbPages, tolerance = 3 } = options;
  const connu = new Set<string>(options.decorConnu ?? []);
  const ecartees: EcartsFiltre = { petites: 0, allongees: 0, decor: 0 };
  const candidates: BoiteImage[] = [];
  for (const b of boites) {
    // Côtés réels de l'image : un filet de 2 799 × 1 px tourné de 45° a une
    // boîte englobante presque carrée — c'est l'image qu'on mesure, pas sa boîte.
    const l = b.largeurImage * echelle; const h = b.hauteurImage * echelle;
    if (l < minCote || h < minCote) { ecartees.petites++; continue; }
    const ratio = Math.max(l / h, h / l);
    if (ratio > ratioMax) { ecartees.allongees++; continue; }
    candidates.push(b);
  }

  const pagesParSignature = new Map<string, Set<number>>();
  for (const b of candidates) {
    const s = signatureBoite(b, tolerance);
    let pages = pagesParSignature.get(s);
    if (!pages) { pages = new Set(); pagesParSignature.set(s, pages); }
    pages.add(b.page);
  }
  const seuil = seuilRepetition(nbPages);
  const retenues: BoiteImage[] = [];
  const decor: BoiteImage[] = [];
  const signaturesDecor = new Set<string>(connu);
  for (const b of candidates) {
    const s = signatureBoite(b, tolerance);
    const nb = pagesParSignature.get(s)?.size ?? 0;
    if (connu.has(s) || nb >= seuil) { ecartees.decor++; decor.push(b); signaturesDecor.add(s); } else retenues.push(b);
  }
  return { retenues, decor, ecartees, signaturesDecor: [...signaturesDecor] };
}

/**
 * Garde la première occurrence de chaque empreinte ; `exclure` permet de
 * poursuivre le dédoublonnage d'un appel à l'autre (traitement par plages).
 */
export function dedoublonner<T extends { sha1: string }>(images: T[], exclure?: Iterable<string>): { uniques: T[]; doublons: number } {
  const vues = new Set<string>(exclure ?? []);
  const uniques: T[] = [];
  let doublons = 0;
  for (const im of images) {
    if (vues.has(im.sha1)) { doublons++; continue; }
    vues.add(im.sha1);
    uniques.push(im);
  }
  return { uniques, doublons };
}

/* ───────────────────────── Rattachement aux questions ───────────────────────── */

/**
 * Bloc d'une question tel que le voit le document : du libellé à la dernière
 * proposition, sur UNE page. Une question à cheval sur deux pages est décrite
 * par deux blocs portant le même `numero`. C'est l'entrée minimale que doit
 * fournir la couche « vérité » du PDF.
 */
export type BlocQuestion = {
  /** Page du bloc (1 = première). */
  page: number;
  /** Haut du libellé, en points, origine en haut de page. */
  yDebut: number;
  /** Bas de la dernière proposition (ou du libellé s'il n'y en a pas). */
  yFin: number;
  /** Numéro de la question dans le document (« 12/ » → 12). */
  numero: number;
  /** Libellé, à titre indicatif (jamais utilisé pour décider). */
  libelle?: string;
};

/** Ce qu'il faut d'une image pour la rattacher : sa page et sa bande verticale. */
export type ImageAPlacer = { page: number; yDebut: number; yFin: number; url?: string };

export type Confiance = 'sure' | 'douteuse';

export type Rattachement = {
  /** Indice du bloc retenu dans le tableau `blocs` reçu ; `null` si aucun bloc n'existe. */
  questionIndex: number | null;
  /** Numéro de la question retenue (recopié du bloc). */
  numero: number | null;
  placement: 'question';
  url?: string;
  confiance: Confiance;
  page: number;
  /** Explication courte de la décision, pour l'écran de relecture. */
  motif: string;
};

/** Au-delà de cet écart (points), un rattachement au bloc voisin devient douteux. */
const ECART_SUR = 150;

/**
 * Rattache chaque image à une question. Règles, dans l'ordre :
 *
 *  1. le bloc qui CONTIENT l'image (au moins la moitié de sa hauteur) la
 *     reçoit — c'est le cas d'une figure posée entre le libellé et les
 *     propositions ;
 *  2. sinon le bloc le plus proche AU-DESSUS, sauf si celui du dessous est
 *     nettement plus proche (trois fois) : une vignette précède parfois sa
 *     question ;
 *  3. une image qui précède la première question de la page va à celle-ci ;
 *  4. sans bloc sur la page, on rejoint la dernière question des pages
 *     précédentes (ou la première des suivantes), toujours en `douteuse`.
 *
 * `sure` exige que le bloc retenu soit sans concurrent sérieux (au moins deux
 * fois plus proche que l'autre voisin) et à moins de 150 points.
 */
export function rattacherImages(images: ImageAPlacer[], blocs: BlocQuestion[]): Rattachement[] {
  const indexes = blocs.map((_, i) => i);
  const parPage = new Map<number, number[]>();
  for (const i of indexes) {
    const p = blocs[i].page;
    const l = parPage.get(p); if (l) l.push(i); else parPage.set(p, [i]);
  }
  for (const l of parPage.values()) l.sort((a, b) => blocs[a].yDebut - blocs[b].yDebut);
  const pages = [...parPage.keys()].sort((a, b) => a - b);

  return images.map((im): Rattachement => {
    const sortie = (questionIndex: number | null, confiance: Confiance, motif: string): Rattachement => ({
      questionIndex,
      numero: questionIndex === null ? null : blocs[questionIndex].numero,
      placement: 'question',
      ...(im.url !== undefined ? { url: im.url } : {}),
      confiance,
      page: im.page,
      motif,
    });
    if (!blocs.length) return sortie(null, 'douteuse', 'aucune question détectée dans le document');

    const hauteur = Math.max(1, im.yFin - im.yDebut);
    const centre = (im.yDebut + im.yFin) / 2;
    const surPage = parPage.get(im.page) ?? [];

    // 1. Bloc contenant.
    let meilleur: number | null = null; let recouvrement = 0;
    for (const i of surPage) {
      const b = blocs[i];
      const r = Math.min(im.yFin, b.yFin) - Math.max(im.yDebut, b.yDebut);
      if (r > recouvrement) { recouvrement = r; meilleur = i; }
    }
    if (meilleur !== null && recouvrement >= 0.5 * hauteur) {
      return sortie(meilleur, 'sure', `dans le bloc de la question ${blocs[meilleur].numero}`);
    }

    // 2-3. Voisins sur la page.
    let dessus: number | null = null; let dA = Infinity;
    let dessous: number | null = null; let dB = Infinity;
    for (const i of surPage) {
      const b = blocs[i];
      if (b.yFin <= centre) { const d = Math.max(0, im.yDebut - b.yFin); if (d < dA) { dA = d; dessus = i; } }
      else if (b.yDebut >= centre) { const d = Math.max(0, b.yDebut - im.yFin); if (d < dB) { dB = d; dessous = i; } }
    }
    if (dessus !== null && dessous !== null) {
      const memeQuestion = blocs[dessus].numero === blocs[dessous].numero;
      if (memeQuestion) return sortie(dessus, 'sure', `entre deux parties de la question ${blocs[dessus].numero}`);
      if (dB * 3 < dA) {
        return sortie(dessous, dA >= 2 * dB && dB <= ECART_SUR ? 'sure' : 'douteuse', `juste au-dessus de la question ${blocs[dessous].numero} (${Math.round(dB)} pt), loin de la ${blocs[dessus].numero} (${Math.round(dA)} pt)`);
      }
      return sortie(dessus, dB >= 2 * dA && dA <= ECART_SUR ? 'sure' : 'douteuse', `sous la question ${blocs[dessus].numero} (${Math.round(dA)} pt), la ${blocs[dessous].numero} suit à ${Math.round(dB)} pt`);
    }
    if (dessus !== null) {
      return sortie(dessus, dA <= ECART_SUR ? 'sure' : 'douteuse', `sous la dernière question de la page (${blocs[dessus].numero}, ${Math.round(dA)} pt)`);
    }
    if (dessous !== null) {
      return sortie(dessous, dB <= ECART_SUR ? 'sure' : 'douteuse', `précède la première question de la page (${blocs[dessous].numero}, ${Math.round(dB)} pt)`);
    }

    // 4. Aucun bloc sur la page.
    const avant = pages.filter((p) => p < im.page).pop();
    if (avant !== undefined) {
      const l = parPage.get(avant)!;
      const i = l[l.length - 1];
      return sortie(i, 'douteuse', `page sans question : rattachée à la dernière question de la page ${avant} (${blocs[i].numero})`);
    }
    const apres = pages.find((p) => p > im.page)!;
    const i = parPage.get(apres)![0];
    return sortie(i, 'douteuse', `page sans question : rattachée à la première question de la page ${apres} (${blocs[i].numero})`);
  });
}

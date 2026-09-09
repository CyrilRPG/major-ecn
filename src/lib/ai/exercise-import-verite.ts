import 'server-only';

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
 * On extrait donc, sans navigateur (pdf.js suffit : `setFillRGBColor` puis
 * `showText` dans la liste d'opérateurs), le texte de chaque page AVEC sa
 * couleur, et on reconstruit les questions et leurs propositions. Le corrigé
 * ainsi obtenu prime sur celui du modèle : il vient du document, pas d'une
 * lecture.
 *
 * La même passe relève les pages qui portent une image : une question posée sur
 * une page illustrée et rendue sans document est une extraction incomplète
 * (12 documents cliniques perdus sur le même import — courbes, radiographies,
 * ECG, examen direct du LCR).
 *
 * Le texte extrait ainsi porte les artefacts de ligature de la police du
 * support (« diagnosKc », « reproduc+on », « plaqueces ») : il sert à COMPARER
 * et à décider, jamais à être affiché tel quel aux élèves.
 */

/** Couleur des propositions exactes dans les supports Major ECN. */
export const VERT_CORRIGE = '#00b050';
/** En-tête bleu et pied de page rouge : hors contenu. */
const HORS_CONTENU = new Set(['#2f5496', '#ff0000', '#365f91', '#113367', '#c0c0c0']);

export type PropositionSource = { lettre: string; texte: string; juste: boolean };
export type QuestionSource = { numero: number; page: number; enonce: string; items: PropositionSource[] };
export type VeritePdf = {
  /** Le document code-t-il son corrigé par la couleur ? */
  colore: boolean;
  questions: QuestionSource[];
  /** Pages portant au moins une image (numérotation du document). */
  pagesAvecImage: Set<number>;
};

/** Normalisation de comparaison : artefacts de ligature neutralisés. */
export function normaliserPourComparaison(s: string): string {
  return (s ?? '')
    .replace(/K/g, 'ti').replace(/\+/g, 'ti').replace(/&/g, 'ti')
    .replace(/ﬁ/g, 'fi').replace(/ﬂ/g, 'fl').replace(/ﬀ/g, 'ff')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

const jetons = (s: string) => new Set(normaliserPourComparaison(s).split(' ').filter((w) => w.length >= 4));

/** Recouvrement de vocabulaire, tolérant aux textes courts. */
export function ressemblance(a: string, b: string): number {
  const na = normaliserPourComparaison(a).replace(/ /g, '');
  const nb = normaliserPourComparaison(b).replace(/ /g, '');
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.95;
  const ja = jetons(a); const jb = jetons(b);
  if (!ja.size || !jb.size) {
    let i = 0; while (i < Math.min(na.length, nb.length) && na[i] === nb[i]) i++;
    return i / Math.max(na.length, nb.length);
  }
  let c = 0; for (const w of ja) if (jb.has(w)) c++;
  return c / Math.min(ja.size, jb.size);
}

/**
 * Lit le PDF et rend sa vérité : texte coloré, questions, propositions,
 * corrigé par la couleur, pages illustrées. Ne lève jamais : un document
 * illisible rend simplement `colore: false` et aucune question, ce qui laisse
 * le pipeline se comporter comme avant.
 */
export async function lireVeritePdf(bytes: Uint8Array): Promise<VeritePdf> {
  const vide: VeritePdf = { colore: false, questions: [], pagesAvecImage: new Set() };
  try {
    // Import dynamique : pdf.js ne doit pas peser sur les routes qui ne
    // l'utilisent pas, et son build « legacy » est le seul qui tourne en Node.
    const { getDocument, OPS } = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const doc = await getDocument({ data: bytes, useSystemFonts: true }).promise;

    const questions: QuestionSource[] = [];
    /** Toutes les images peintes, avec leur page et leur géométrie. */
    const dessins: Array<{ page: number; l: number; h: number }> = [];
    let volumeVert = 0;
    let courante: QuestionSource | null = null;

    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const ops = await page.getOperatorList();
      let couleur = '#000000';
      let texte = '';
      const couleurs: string[] = [];
      for (let i = 0; i < ops.fnArray.length; i++) {
        const fn = ops.fnArray[i];
        const args = ops.argsArray[i] as unknown[];
        if (fn === OPS.setFillRGBColor) {
          const c = args[0];
          if (typeof c === 'string') couleur = c.toLowerCase();
        } else if (fn === OPS.showText) {
          if (HORS_CONTENU.has(couleur)) continue;
          const glyphes = (args[0] ?? []) as Array<{ unicode?: string }>;
          const t = glyphes.map((g) => g?.unicode ?? '').join('');
          texte += t;
          for (let k = 0; k < t.length; k++) couleurs.push(couleur);
          if (couleur === VERT_CORRIGE) volumeVert += t.trim().length;
        } else if (fn === OPS.paintImageXObject || fn === OPS.paintInlineImageXObject) {
          // `paintImageXObject` reçoit [nom, largeur, hauteur] : la géométrie
          // suffit à écarter le décor sans décoder l'image.
          const l = Number(args[1]); const h = Number(args[2]);
          if (Number.isFinite(l) && Number.isFinite(h)) dessins.push({ page: p, l, h });
        }
      }

      // Repères : « 12/ » ouvre une question, « c) » une proposition.
      type Repere = { type: 'q' | 'i'; debut: number; pos: number; num?: number; lettre?: string };
      const reperes: Repere[] = [];
      for (const m of texte.matchAll(/(?:^|[\s»])(\d{1,2})\/\s/g)) reperes.push({ type: 'q', debut: m.index!, pos: m.index! + m[0].length, num: Number(m[1]) });
      for (const m of texte.matchAll(/(?:^|[\s»])([a-k])\)\s/g)) reperes.push({ type: 'i', debut: m.index!, pos: m.index! + m[0].length, lettre: m[1] });
      reperes.sort((a, b) => a.debut - b.debut);

      for (let k = 0; k < reperes.length; k++) {
        const r = reperes[k];
        const fin = k + 1 < reperes.length ? reperes[k + 1].debut : texte.length;
        const contenu = texte.slice(r.pos, fin).replace(/\s+/g, ' ').trim();
        if (r.type === 'q') {
          courante = { numero: r.num!, page: p, enonce: contenu, items: [] };
          questions.push(courante);
        } else if (courante) {
          let vert = 0; let autre = 0;
          for (let i = r.pos; i < fin; i++) {
            if (!/\S/.test(texte[i])) continue;
            if (couleurs[i] === VERT_CORRIGE) vert++; else autre++;
          }
          courante.items.push({ lettre: r.lettre!.toUpperCase(), texte: contenu, juste: vert > autre });
        }
      }
    }

    // Décor contre document. Un bandeau d'en-tête, un filigrane ou un filet
    // reviennent à l'identique sur presque toutes les pages : c'est la
    // GÉOMÉTRIE répétée qui les trahit. Sans ce tri, les 137 pages du support
    // Pédiatrie étaient « illustrées » et l'avertissement devenait inutilisable.
    const pagesParGeometrie = new Map<string, Set<number>>();
    for (const d of dessins) {
      const cle = `${d.l}x${d.h}`;
      const set = pagesParGeometrie.get(cle) ?? new Set<number>();
      set.add(d.page); pagesParGeometrie.set(cle, set);
    }
    const seuilDecor = Math.max(3, Math.ceil(doc.numPages * 0.4));
    const pagesAvecImage = new Set<number>();
    for (const d of dessins) {
      if (d.h <= 2 || d.l <= 2) continue;                                   // filet
      if (d.l < 90 && d.h < 90) continue;                                   // puce, pictogramme
      if ((pagesParGeometrie.get(`${d.l}x${d.h}`)?.size ?? 0) >= seuilDecor) continue; // décor
      pagesAvecImage.add(d.page);
    }

    // Un document « coloré » a du vert sur une part notable de son texte : en
    // dessous, c'est une couleur d'accent et non un corrigé.
    const colore = volumeVert > 200 && questions.some((q) => q.items.some((i) => i.juste));
    return { colore, questions, pagesAvecImage };
  } catch {
    return vide;
  }
}

/* ============================================================
   Confrontation du rendu du modèle à la vérité du document.
   ============================================================ */

type ItemModele = { lettre: string; enonce: string; is_correct: boolean; justification?: string; images?: unknown[] };
type QuestionModele = { enonce: string; format: string; items?: ItemModele[]; source_pages?: number[]; warnings?: string[]; images?: unknown[] };

/**
 * Aligne les questions du modèle sur celles du document (programmation
 * dynamique : les deux suites gardent l'ordre de lecture, un appariement
 * glouton croiserait les dossiers — « Que faites-vous ? » revient des dizaines
 * de fois dans un même support).
 */
function aligner(modele: QuestionModele[], source: QuestionSource[]): Array<[number, number]> {
  const n = modele.length; const m = source.length;
  if (!n || !m) return [];
  const jq = modele.map((q) => jetons(String(q.enonce).split('\n').filter(Boolean).pop() ?? ''));
  const ji = modele.map((q) => (q.items ?? []).map((i) => jetons(i.enonce)));
  const sq = source.map((q) => jetons(q.enonce));
  const si = source.map((q) => q.items.map((i) => jetons(i.texte)));
  const rec = (a: Set<string>, b: Set<string>) => { if (!a.size || !b.size) return 0; let c = 0; for (const w of a) if (b.has(w)) c++; return c / Math.min(a.size, b.size); };
  const score = (i: number, j: number) => {
    const q = rec(jq[i], sq[j]);
    const k = Math.min(ji[i].length, si[j].length);
    let s = 0; for (let x = 0; x < k; x++) s += rec(ji[i][x], si[j][x]);
    return 0.45 * q + 0.55 * (k ? s / k : 0);
  };
  const GAP = -0.35;
  const M: Float64Array[] = Array.from({ length: n + 1 }, () => new Float64Array(m + 1));
  const P: Uint8Array[] = Array.from({ length: n + 1 }, () => new Uint8Array(m + 1));
  for (let i = 1; i <= n; i++) { M[i][0] = M[i - 1][0] + GAP; P[i][0] = 1; }
  for (let j = 1; j <= m; j++) { M[0][j] = M[0][j - 1] + GAP; P[0][j] = 2; }
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) {
    const d = M[i - 1][j - 1] + score(i - 1, j - 1);
    const h = M[i - 1][j] + GAP; const v = M[i][j - 1] + GAP;
    if (d >= h && d >= v) { M[i][j] = d; P[i][j] = 0; } else if (h >= v) { M[i][j] = h; P[i][j] = 1; } else { M[i][j] = v; P[i][j] = 2; }
  }
  const paires: Array<[number, number]> = [];
  let i = n; let j = m;
  while (i > 0 || j > 0) {
    const p = i > 0 && j > 0 ? P[i][j] : (i > 0 ? 1 : 2);
    if (p === 0) { if (score(i - 1, j - 1) >= 0.35) paires.push([i - 1, j - 1]); i--; j--; }
    else if (p === 1) i--; else j--;
  }
  return paires.reverse();
}

export type Confrontation = { corriges: number; documentsAttendus: number; avertissements: string[] };

/**
 * Impose au résultat du modèle ce que dit le document :
 *  - le corrigé vient de la couleur (quand le support est coloré) ;
 *  - une question posée sur une page illustrée sans document est signalée ;
 *  - une note du modèle à la place du contexte est signalée.
 * Modifie `questions` sur place et rend le compte-rendu.
 */
export function confronterALaSource(questions: QuestionModele[], verite: VeritePdf): Confrontation {
  const avertissements: string[] = [];
  let corriges = 0; let documentsAttendus = 0;

  for (const q of questions) {
    if (/\[contexte manquant|non disponible dans cet extrait|non fourni/i.test(String(q.enonce))) {
      q.warnings = [...(q.warnings ?? []), 'Le contexte clinique manque : l’énoncé porte une note d’extraction au lieu de la vignette.'];
      avertissements.push(`Énoncé incomplet (note d’extraction) : « ${String(q.enonce).slice(0, 70)}… »`);
    }
  }

  if (verite.colore && verite.questions.length) {
    for (const [im, is] of aligner(questions, verite.questions)) {
      const qm = questions[im]; const qs = verite.questions[is];
      const items = qm.items ?? [];
      if (items.length !== qs.items.length) continue;   // découpage divergent : on ne touche à rien
      for (let k = 0; k < items.length; k++) {
        if (ressemblance(items[k].enonce, qs.items[k].texte) < 0.8) continue;
        if (items[k].is_correct !== qs.items[k].juste) { items[k].is_correct = qs.items[k].juste; corriges++; }
      }
    }
    if (corriges) avertissements.push(`${corriges} proposition(s) remises d’aplomb d’après la couleur du document (le corrigé du support prime sur la lecture du modèle).`);
  }

  for (const q of questions) {
    const pages = (q.source_pages ?? []) as number[];
    const illustree = pages.some((p) => verite.pagesAvecImage.has(p));
    if (illustree && (q.images ?? []).length === 0) {
      documentsAttendus++;
      q.warnings = [...(q.warnings ?? []), 'Une image figure sur la page de cet exercice dans la source : vérifiez qu’aucun document (radiographie, ECG, courbe…) ne manque.'];
    }
  }
  if (documentsAttendus) avertissements.push(`${documentsAttendus} exercice(s) situé(s) sur une page illustrée n’ont aucun document rattaché.`);

  return { corriges, documentsAttendus, avertissements };
}

/**
 * Dédoublonnage de secours, par le TEXTE.
 *
 * Le plan de lots partage une page entre deux lots ; quand les deux rendent la
 * même question sous des numéros de source différents (« Sujet 1 - Q1 » ici,
 * « Session 3 – Sujet 1 – Q1 » là), la fusion par numéro passe à côté. Sur
 * l'import Pédiatrie, douze questions se retrouvaient en double, dont quatre
 * avec un énoncé amputé de sa vignette.
 */
export function dedoublonnerParTexte<T extends QuestionModele>(questions: T[]): { questions: T[]; retirees: number } {
  const garder: T[] = [];
  let retirees = 0;
  for (const q of questions) {
    const libelle = String(q.enonce).split('\n').filter(Boolean).pop() ?? '';
    const propositions = (q.items ?? []).map((i) => i.enonce).join(' | ');
    // Un doublon de recouvrement est proche dans l'ordre : on ne compare qu'au
    // voisinage, sinon deux questions légitimement identiques de dossiers
    // différents seraient fusionnées.
    const voisins = garder.slice(-12);
    const jumeau = voisins.find((g) => {
      const gl = String(g.enonce).split('\n').filter(Boolean).pop() ?? '';
      const gp = (g.items ?? []).map((i) => i.enonce).join(' | ');
      return ressemblance(libelle, gl) >= 0.85 && ressemblance(propositions, gp) >= 0.85;
    });
    if (!jumeau) { garder.push(q); continue; }
    retirees++;
    // On conserve l'exemplaire le plus complet (celui qui a gardé sa vignette).
    if (String(q.enonce).length > String(jumeau.enonce).length) garder[garder.indexOf(jumeau)] = q;
  }
  return { questions: garder, retirees };
}

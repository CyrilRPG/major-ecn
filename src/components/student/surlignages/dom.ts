/**
 * Pont entre la couche texte pdf.js (DOM) et le modèle pur des surlignages :
 * spans ⇄ décalages dans le texte de la page, rectangles normalisés.
 * Client uniquement.
 */

import {
  decalageDepuisSpan,
  fusionnerRects,
  morceauxDeSpans,
  MAX_RECTS,
  type RectNorm,
  type TextePage,
} from '@/lib/fiches/surlignages-pure';

/** Spans de texte de la couche, dans l'ordre où pdf.js les a créés. */
export function spansDeCouche(couche: Element): HTMLElement[] {
  return Array.from(couche.querySelectorAll<HTMLElement>('span[role="presentation"]'));
}

/**
 * La couche correspond-elle au texte calculé ? (un span par élément non vide,
 * même longueur). Sinon — version de pdf.js au comportement différent, couche
 * tronquée — on s'abstient plutôt que de surligner à côté.
 */
export function coucheAlignee(spans: readonly HTMLElement[], tp: TextePage): boolean {
  if (spans.length !== tp.segments.length) return false;
  return tp.segments.every(
    (s, i) => s.ignore || (spans[i].textContent ?? '').length === s.fin - s.debut,
  );
}

/** Le filigrane incliné n'est ni sélectionnable ni cliquable. */
export function neutraliserFiligrane(spans: readonly HTMLElement[], tp: TextePage): void {
  for (const s of tp.segments) {
    if (s.ignore) spans[s.span]?.classList.add('surl-ignore');
  }
}

/** Rectangles (normalisés à la page) couvrant [debut, fin) du texte de la page. */
export function rectsDepuisDecalages(
  page: Element,
  spans: readonly HTMLElement[],
  tp: TextePage,
  debut: number,
  fin: number,
): RectNorm[] {
  const cadre = page.getBoundingClientRect();
  if (cadre.width <= 0 || cadre.height <= 0) return [];
  const rects: RectNorm[] = [];
  for (const m of morceauxDeSpans(tp.segments, debut, fin)) {
    const noeud = spans[m.span]?.firstChild;
    if (!noeud || noeud.nodeType !== Node.TEXT_NODE) continue;
    const longueur = (noeud.textContent ?? '').length;
    const range = document.createRange();
    range.setStart(noeud, Math.min(m.de, longueur));
    range.setEnd(noeud, Math.min(m.a, longueur));
    for (const r of Array.from(range.getClientRects())) {
      if (r.width < 0.5 || r.height < 0.5) continue;
      rects.push({
        x: (r.left - cadre.left) / cadre.width,
        y: (r.top - cadre.top) / cadre.height,
        w: r.width / cadre.width,
        h: r.height / cadre.height,
      });
    }
  }
  return fusionnerRects(rects).slice(0, MAX_RECTS);
}

/**
 * Décalage dans le texte de la page d'une borne de sélection (nœud, offset).
 * La borne peut tomber dans un span (cas courant), sur un élément (début ou
 * fin de span), ou entre deux spans (sélection prolongée dans une marge) : on
 * prend alors le premier span qui suit (début) ou le dernier qui précède (fin).
 */
export function decalageDepuisBorne(
  spans: readonly HTMLElement[],
  tp: TextePage,
  noeud: Node,
  offset: number,
  cote: 'debut' | 'fin',
): number | null {
  if (noeud.nodeType === Node.TEXT_NODE) {
    const i = spans.indexOf(noeud.parentElement as HTMLElement);
    if (i >= 0) return decalageDepuisSpan(tp.segments, i, offset);
  } else {
    const i = spans.indexOf(noeud as HTMLElement);
    if (i >= 0) return decalageDepuisSpan(tp.segments, i, offset === 0 ? 0 : Number.MAX_SAFE_INTEGER);
  }
  const borne = document.createRange();
  try {
    borne.setStart(noeud, offset);
  } catch {
    return null;
  }
  borne.collapse(true);
  if (cote === 'debut') {
    for (let i = 0; i < spans.length; i++) {
      if (borne.comparePoint(spans[i], 0) >= 0) return decalageDepuisSpan(tp.segments, i, 0);
    }
    return tp.texte.length;
  }
  for (let i = spans.length - 1; i >= 0; i--) {
    if (borne.comparePoint(spans[i], spans[i].childNodes.length) <= 0) {
      return decalageDepuisSpan(tp.segments, i, Number.MAX_SAFE_INTEGER);
    }
  }
  return 0;
}

/** Élément page de react-pdf (porte `data-page-number`). */
export function pageDe(el: Element | null): HTMLElement | null {
  return (el?.closest('.react-pdf__Page[data-page-number]') as HTMLElement | null) ?? null;
}

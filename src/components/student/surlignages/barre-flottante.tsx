'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { Highlighter, Trash2 } from 'lucide-react';
import {
  COULEURS_SURLIGNAGE,
  LIBELLES_COULEUR,
  TEINTES_SURLIGNAGE,
  creerSurlignage,
  rognerBornes,
  surlignageSousPoint,
  type CouleurSurlignage,
  type RectNorm,
  type Surlignage,
  type TextePage,
} from '@/lib/fiches/surlignages-pure';
import { nouvelIdSurlignage, useSurlignagesOptionnel } from './contexte';
import { coucheAlignee, decalageDepuisBorne, pageDe, rectsDepuisDecalages, spansDeCouche } from './dom';

/** Position de la barre dans le repère de la zone défilante (px). */
type Place = { left: number; top: number };
type Cible = ({ mode: 'selection'; range: Range } | { mode: 'edition'; id: string }) & Place & {
  /** Zoom au moment de l'ouverture : la barre se ferme s'il change. */
  zoom: number;
};

type Piece = { page: number; pageEl: HTMLElement; spans: HTMLElement[]; tp: TextePage; debut: number; fin: number };

/** Parties de la sélection page par page (une sélection peut en enjamber plusieurs). */
function piecesDeSelection(range: Range, zone: HTMLElement, textePage: (n: number) => TextePage | null): Piece[] {
  const out: Piece[] = [];
  for (const pageEl of Array.from(zone.querySelectorAll<HTMLElement>('.react-pdf__Page[data-page-number]'))) {
    const couche = pageEl.querySelector('.textLayer');
    if (!couche || !range.intersectsNode(couche)) continue;
    const page = Number(pageEl.getAttribute('data-page-number'));
    const tp = textePage(page);
    if (!tp) continue;
    const spans = spansDeCouche(couche);
    if (!coucheAlignee(spans, tp)) continue;
    const d = couche.contains(range.startContainer)
      ? decalageDepuisBorne(spans, tp, range.startContainer, range.startOffset, 'debut')
      : 0;
    const f = couche.contains(range.endContainer)
      ? decalageDepuisBorne(spans, tp, range.endContainer, range.endOffset, 'fin')
      : tp.texte.length;
    if (d == null || f == null) continue;
    const bornes = rognerBornes(tp.texte, d, f);
    if (bornes) out.push({ page, pageEl, spans, tp, ...bornes });
  }
  return out;
}

/** Cadre englobant de rectangles normalisés, ramené dans le repère de la zone. */
function cadreDansZone(pageEl: HTMLElement, zone: HTMLElement, rects: readonly RectNorm[]) {
  const p = pageEl.getBoundingClientRect();
  const z = zone.getBoundingClientRect();
  const x1 = Math.min(...rects.map((r) => r.x));
  const x2 = Math.max(...rects.map((r) => r.x + r.w));
  const y1 = Math.min(...rects.map((r) => r.y));
  const y2 = Math.max(...rects.map((r) => r.y + r.h));
  return {
    x: p.left - z.left + ((x1 + x2) / 2) * p.width,
    haut: p.top - z.top + y1 * p.height,
    bas: p.top - z.top + y2 * p.height,
  };
}

const HAUTEUR_BARRE = 44;

/**
 * Place la barre : au-dessus du passage à la souris (sauf s'il touche le haut
 * visible), en dessous au doigt — le menu natif du téléphone s'affiche
 * au-dessus de la sélection, et ses poignées juste sous le texte.
 */
function placer(
  zone: HTMLElement,
  mode: Cible['mode'],
  cadre: { x: number; haut: number; bas: number },
  pointeur: string,
): Place {
  const largeur = mode === 'selection' ? 268 : 212;
  const largeurZone = zone.clientWidth;
  const left = Math.min(
    Math.max(cadre.x, largeur / 2 + 6),
    Math.max(largeur / 2 + 6, largeurZone - largeur / 2 - 6),
  );
  const defilant = zone.parentElement;
  const hautVisible = defilant ? defilant.getBoundingClientRect().top - zone.getBoundingClientRect().top : 0;
  const auDoigt = pointeur !== 'mouse';
  const dessous = auDoigt || cadre.haut - HAUTEUR_BARRE - 8 < hautVisible;
  const top = dessous ? cadre.bas + (auDoigt ? 30 : 8) : cadre.haut - HAUTEUR_BARRE - 8;
  return { left, top: Math.max(0, top) };
}

/**
 * Petite barre flottante du lecteur de fiche :
 *  - texte sélectionné (souris, ou appui long au doigt) → « Surligner » + 4 couleurs ;
 *  - clic / toucher sur un passage surligné → changer la couleur ou le retirer.
 *
 * Elle est positionnée DANS la zone défilante (au-dessus de la sélection à la
 * souris, en dessous au doigt, où le menu natif du téléphone ne la couvre pas)
 * et suit donc le défilement sans calcul. Elle se ferme au zoom.
 */
export function BarreSurlignage({ zoneRef, zoom }: { zoneRef: RefObject<HTMLDivElement | null>; zoom: number }) {
  const ctx = useSurlignagesOptionnel();
  const [cible, setCible] = useState<Cible | null>(null);
  const barreRef = useRef<HTMLDivElement>(null);
  const pointeurRef = useRef<string>('mouse');
  const sourisEnfonceeRef = useRef(false);
  const surBarreRef = useRef(false);
  const minuterieRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ctxRef = useRef(ctx);
  const zoomRef = useRef(zoom);
  useEffect(() => {
    ctxRef.current = ctx;
    zoomRef.current = zoom;
  });

  const actif = !!ctx?.actif;

  // Évalue la sélection courante du document.
  const evaluerSelection = useCallback(() => {
    const zone = zoneRef.current;
    const c = ctxRef.current;
    if (!zone || !c?.actif) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      if (!surBarreRef.current) setCible((prec) => (prec?.mode === 'selection' ? null : prec));
      return;
    }
    const range = sel.getRangeAt(0);
    if (!zone.contains(range.commonAncestorContainer)) {
      setCible((prec) => (prec?.mode === 'selection' ? null : prec));
      return;
    }
    if (piecesDeSelection(range, zone, c.textePage).length === 0) {
      setCible((prec) => (prec?.mode === 'selection' ? null : prec));
      return;
    }
    const r = range.getBoundingClientRect();
    const z = zone.getBoundingClientRect();
    const cadre = { x: r.left + r.width / 2 - z.left, haut: r.top - z.top, bas: r.bottom - z.top };
    setCible({
      mode: 'selection',
      range: range.cloneRange(),
      zoom: zoomRef.current,
      ...placer(zone, 'selection', cadre, pointeurRef.current),
    });
  }, [zoneRef]);

  useEffect(() => {
    if (!actif) return;
    const zone = zoneRef.current;
    if (!zone) return;

    const surPointerDown = (e: PointerEvent) => {
      pointeurRef.current = e.pointerType || 'mouse';
      if (e.pointerType === 'mouse' && e.button === 0 && !barreRef.current?.contains(e.target as Node)) {
        sourisEnfonceeRef.current = true;
      }
    };
    const surPointerUp = () => {
      if (!sourisEnfonceeRef.current) return;
      sourisEnfonceeRef.current = false;
      // La sélection est finalisée juste après le relâchement.
      setTimeout(evaluerSelection, 0);
    };
    const surSelection = () => {
      // À la souris, la barre n'apparaît qu'au relâchement (pas pendant le glissé).
      if (sourisEnfonceeRef.current) {
        setCible((prec) => (prec?.mode === 'selection' ? null : prec));
        return;
      }
      if (minuterieRef.current) clearTimeout(minuterieRef.current);
      // Au doigt, les poignées modifient la sélection sans évènement de pointeur.
      minuterieRef.current = setTimeout(evaluerSelection, pointeurRef.current === 'mouse' ? 30 : 250);
    };
    const surClic = (e: MouseEvent) => {
      if (barreRef.current?.contains(e.target as Node)) return;
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed) return;
      const c = ctxRef.current;
      const pageEl = pageDe(e.target as Element);
      if (!c || !pageEl) {
        setCible(null);
        return;
      }
      const page = Number(pageEl.getAttribute('data-page-number'));
      const cadre = pageEl.getBoundingClientRect();
      const x = (e.clientX - cadre.left) / cadre.width;
      const y = (e.clientY - cadre.top) / cadre.height;
      const touche = surlignageSousPoint(c.visiblesSurPage(page), x, y, pointeurRef.current === 'mouse' ? 0.002 : 0.008);
      if (!touche) {
        setCible(null);
        return;
      }
      const cadreZone = cadreDansZone(pageEl, zone, touche.rects);
      setCible({
        mode: 'edition',
        id: touche.id,
        zoom: zoomRef.current,
        ...placer(zone, 'edition', cadreZone, pointeurRef.current),
      });
    };
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCible(null);
    };

    zone.addEventListener('pointerdown', surPointerDown);
    document.addEventListener('pointerup', surPointerUp);
    document.addEventListener('selectionchange', surSelection);
    zone.addEventListener('click', surClic);
    document.addEventListener('keydown', surTouche);
    return () => {
      zone.removeEventListener('pointerdown', surPointerDown);
      document.removeEventListener('pointerup', surPointerUp);
      document.removeEventListener('selectionchange', surSelection);
      zone.removeEventListener('click', surClic);
      document.removeEventListener('keydown', surTouche);
      if (minuterieRef.current) clearTimeout(minuterieRef.current);
    };
  }, [actif, zoneRef, evaluerSelection]);

  // Un surlignage en cours d'édition qui disparaît (supprimé depuis la liste).
  const existe = cible?.mode !== 'edition' || !!ctx?.surlignages.some((s) => s.id === cible.id);
  // Changement de zoom : la page est redessinée, la barre n'a plus de repère.
  if (!ctx || !actif || !cible || !existe || cible.zoom !== zoom) return null;

  const enEdition = cible.mode === 'edition' ? ctx.surlignages.find((s) => s.id === cible.id) ?? null : null;

  const creer = (couleur: CouleurSurlignage) => {
    const zone = zoneRef.current;
    if (!zone || cible.mode !== 'selection') return;
    const maintenant = new Date().toISOString();
    const nouveaux: Surlignage[] = [];
    for (const p of piecesDeSelection(cible.range, zone, ctx.textePage)) {
      const rects = rectsDepuisDecalages(p.pageEl, p.spans, p.tp, p.debut, p.fin);
      if (rects.length === 0) continue;
      const s = creerSurlignage({
        id: nouvelIdSurlignage(),
        couleur,
        page: p.page,
        textePage: p.tp,
        debut: p.debut,
        fin: p.fin,
        rects,
        maintenant,
      });
      if (s) nouveaux.push(s);
    }
    ctx.ajouter(nouveaux);
    ctx.choisirCouleur(couleur);
    window.getSelection()?.removeAllRanges();
    setCible(null);
  };

  return (
    <div
      ref={barreRef}
      role="toolbar"
      aria-label={cible.mode === 'selection' ? 'Surligner la sélection' : 'Modifier le surlignage'}
      className="absolute z-20 flex -translate-x-1/2 items-center gap-0.5 rounded-full border border-(--color-border) bg-(--color-surface) p-1 shadow-(--shadow-lifted) select-none"
      style={{ left: cible.left, top: cible.top }}
      onPointerDown={(e) => {
        surBarreRef.current = true;
        // Garder la sélection active pendant le clic sur la barre.
        if (e.pointerType === 'mouse') e.preventDefault();
      }}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => {
        setTimeout(() => {
          surBarreRef.current = false;
        }, 0);
      }}
    >
      {cible.mode === 'selection' && (
        <>
          <button
            type="button"
            onClick={() => creer(ctx.couleur)}
            className="inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-xs font-bold text-(--color-ink) hover:bg-(--color-sand-100)"
          >
            <Highlighter className="h-3.5 w-3.5" />
            Surligner
          </button>
          <span aria-hidden className="mx-0.5 h-5 w-px bg-(--color-border)" />
        </>
      )}
      {COULEURS_SURLIGNAGE.map((c) => {
        const courante = enEdition ? enEdition.couleur === c : ctx.couleur === c;
        return (
          <button
            key={c}
            type="button"
            aria-label={cible.mode === 'selection' ? `Surligner en ${LIBELLES_COULEUR[c].toLowerCase()}` : `Passer en ${LIBELLES_COULEUR[c].toLowerCase()}`}
            aria-pressed={courante}
            title={LIBELLES_COULEUR[c]}
            onClick={() => {
              if (cible.mode === 'selection') creer(c);
              else {
                ctx.changerCouleur(cible.id, c);
                ctx.choisirCouleur(c);
                setCible(null);
              }
            }}
            className="grid h-8 w-8 place-items-center rounded-full hover:bg-(--color-sand-100)"
          >
            <span
              className={
                'block h-[18px] w-[18px] rounded-full border border-black/10 ' +
                (courante ? 'ring-2 ring-(--color-ink-soft) ring-offset-1 ring-offset-(--color-surface)' : '')
              }
              style={{ background: TEINTES_SURLIGNAGE[c] }}
            />
          </button>
        );
      })}
      {cible.mode === 'edition' && (
        <>
          <span aria-hidden className="mx-0.5 h-5 w-px bg-(--color-border)" />
          <button
            type="button"
            aria-label="Retirer le surlignage"
            title="Retirer"
            onClick={() => {
              ctx.supprimer(cible.id);
              setCible(null);
            }}
            className="grid h-8 w-8 place-items-center rounded-full text-(--color-ink-soft) hover:bg-(--color-sand-100) hover:text-(--color-danger)"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
}

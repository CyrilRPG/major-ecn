'use client';

import { useCallback, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import {
  IMAGE_WIDTH_MAX,
  IMAGE_WIDTH_MIN,
  clampImageWidth,
  defaultImageWidth,
  type ImageLayout,
} from '@/lib/data/blog-content/types';

const PRESETS = [25, 33, 50, 66, 75, 100];

/**
 * Redimensionnement d'une image d'article.
 *
 * L'import IA place toutes les images en pleine largeur : une capture d'écran
 * verticale ou une illustration en basse définition occupait alors la moitié de
 * la page. La largeur se règle donc ici, en pourcentage de la colonne d'article,
 * avec un aperçu à l'échelle — on voit ce que verra le lecteur avant d'ouvrir
 * l'aperçu complet.
 *
 * On raisonne en POURCENTAGE et non en pixels : la colonne d'article n'a pas la
 * même largeur selon l'écran, et une taille en pixels déborderait sur les
 * petits écrans. Sur mobile, le rendu ignore de toute façon cette largeur et
 * repasse en pleine largeur (cf. `article-rich.tsx`).
 */
export function ImageWidthControl({
  src,
  layout,
  width,
  onChange,
}: {
  src: string;
  layout: ImageLayout;
  /** Largeur enregistrée, ou `undefined` = largeur par défaut de la disposition. */
  width: number | undefined;
  onChange: (width: number | undefined) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  // Le glissement est suivi par une RÉFÉRENCE, pas par un état : `pointermove`
  // peut suivre `pointerdown` avant que React n'ait re-rendu, et un état aurait
  // alors encore sa valeur d'avant — le premier mouvement serait perdu.
  // L'état ne sert qu'au liseré de la poignée.
  const draggingRef = useRef(false);
  const [dragging, setDragging] = useState(false);

  const fallback = defaultImageWidth(layout);
  const current = clampImageWidth(width ?? fallback);

  /** Largeur déduite de la position du curseur sur la piste d'aperçu. */
  const widthAtPointer = useCallback((clientX: number): number => {
    const track = trackRef.current;
    if (!track) return current;
    const rect = track.getBoundingClientRect();
    if (rect.width === 0) return current;
    return clampImageWidth(((clientX - rect.left) / rect.width) * 100);
  }, [current]);

  const startDrag = (e: React.PointerEvent) => {
    e.preventDefault();
    // La capture garantit qu'on continue de recevoir les événements même si le
    // curseur sort de l'aperçu pendant le glissement.
    e.currentTarget.setPointerCapture(e.pointerId);
    draggingRef.current = true;
    setDragging(true);
  };

  const moveDrag = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    onChange(widthAtPointer(e.clientX));
  };

  const endDrag = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    onChange(widthAtPointer(e.clientX));
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    draggingRef.current = false;
    setDragging(false);
  };

  return (
    <div className="rounded-lg border border-(--color-border) bg-(--color-surface-soft) p-2.5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-(--color-ink-muted)">
          Largeur de l’image
        </span>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            min={IMAGE_WIDTH_MIN}
            max={IMAGE_WIDTH_MAX}
            value={current}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (Number.isFinite(n)) onChange(clampImageWidth(n));
            }}
            className="w-16 rounded-md border border-(--color-border) bg-white px-1.5 py-1 text-right text-xs tabular-nums text-(--color-ink)"
          />
          <span className="text-xs text-(--color-ink-muted)">%</span>
          {width !== undefined && (
            <button
              type="button"
              onClick={() => onChange(undefined)}
              title={`Revenir à la largeur par défaut (${fallback} %)`}
              className="flex h-6 w-6 items-center justify-center rounded-md text-(--color-ink-muted) hover:bg-white hover:text-[#E4002B]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Aperçu à l'échelle : la piste représente la colonne d'article. Le
          cadre est rembourré (et surtout PAS `overflow-hidden`) pour que la
          poignée reste entièrement visible à 100 % de largeur. */}
      <div
        className="rounded-md border border-dashed border-(--color-border) bg-white p-2"
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div ref={trackRef} className="relative">
          <div
            className={`relative ${
              layout === 'right' ? 'ml-auto' : layout === 'left' ? 'mr-auto' : 'mx-auto'
            }`}
            style={{ width: `${current}%` }}
          >
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt="" className="block h-auto w-full select-none rounded" draggable={false} />
            ) : (
              <div className="h-12 rounded bg-(--color-surface-soft)" />
            )}
            {/* Poignée de redimensionnement, sur le bord libre de l'image. */}
            <button
              type="button"
              aria-label="Redimensionner l’image"
              onPointerDown={startDrag}
              onPointerMove={moveDrag}
              onPointerUp={endDrag}
              className={`absolute top-1/2 h-10 w-3 -translate-y-1/2 cursor-ew-resize rounded-full border border-white bg-[#E4002B] shadow ${
                layout === 'right' ? '-left-1.5' : '-right-1.5'
              } ${dragging ? 'ring-2 ring-[#E4002B]/40' : ''}`}
            />
          </div>
        </div>
      </div>

      <input
        type="range"
        min={IMAGE_WIDTH_MIN}
        max={IMAGE_WIDTH_MAX}
        value={current}
        onChange={(e) => onChange(clampImageWidth(Number(e.target.value)))}
        className="mt-2 w-full accent-[#E4002B]"
      />

      <div className="mt-1 flex flex-wrap gap-1">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={`rounded-md border px-1.5 py-0.5 text-[11px] font-semibold ${
              current === p
                ? 'border-[#E4002B] bg-[#FFF1F3] text-[#C0001F]'
                : 'border-(--color-border) bg-white text-(--color-ink-muted) hover:text-(--color-ink)'
            }`}
          >
            {p} %
          </button>
        ))}
      </div>

      <p className="mt-1.5 text-[11px] leading-snug text-(--color-ink-muted)">
        Largeur sur ordinateur, en % de la colonne d’article. Sur mobile, l’image
        reste en pleine largeur.
      </p>
    </div>
  );
}

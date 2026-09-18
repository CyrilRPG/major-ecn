import Link from 'next/link';
import { FileText, Lock, PlayCircle } from 'lucide-react';
import { CATEGORIES_VIDEO, type CategorieVideo } from '@/lib/videos/categories';
import type { ReplayVideo } from '@/lib/videos/replays';

export type SeanceListeItem = {
  video: ReplayVideo;
  /** Séance ouverte (déblocage progressif des séances approfondies). */
  ouverte: boolean;
  /** Explication quand elle est fermée. */
  motifFermeture?: string | null;
};

/**
 * Programme d'une catégorie : une ligne PAR SÉANCE, qui porte sa vidéo ET ses
 * supports. L'élève voit d'un coup d'œil ce qui va avec quoi — c'est la seule
 * présentation où l'association vidéo ⇄ support n'a pas à être devinée.
 *
 * Composant serveur : de simples liens, utilisables dans l'iframe de la vue
 * partagée (`embedQs`).
 */
export function SeanceListe({
  coursId,
  type,
  items,
  embedQs = '',
}: {
  coursId: string;
  type: CategorieVideo;
  items: SeanceListeItem[];
  embedQs?: string;
}) {
  const d = CATEGORIES_VIDEO[type];
  return (
    <ol className="space-y-3">
      {items.map(({ video: v, ouverte, motifFermeture }, i) => {
        const hrefVideo = `/cours/${coursId}/${d.segment}?v=${v.id}${embedQs}`;
        const titre = v.titre?.trim() || `Séance ${i + 1}`;
        return (
          <li
            key={v.id}
            className={
              'rounded-2xl border border-(--color-border) bg-(--color-surface) p-3 shadow-(--shadow-soft) sm:p-4 '
              + (ouverte ? '' : 'opacity-75')
            }
          >
            <div className="flex items-start gap-3">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold"
                style={ouverte
                  ? { background: d.fond, color: d.accent }
                  : { background: 'var(--color-sand-100)', color: 'var(--color-ink-soft)' }}
                aria-hidden
              >
                {ouverte ? String(i + 1).padStart(2, '0') : <Lock className="h-4 w-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
                  <p className="min-w-0 text-[15px] font-bold leading-snug text-(--color-ink)">{titre}</p>
                  {ouverte ? (
                    <Link
                      href={hrefVideo}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-white transition-transform hover:scale-[1.02] focus-ring"
                      style={{ background: d.accent }}
                    >
                      <PlayCircle className="h-3.5 w-3.5" />
                      Regarder
                    </Link>
                  ) : (
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-(--color-border) px-3 py-1.5 text-xs font-semibold text-(--color-ink-soft)">
                      <Lock className="h-3.5 w-3.5" />
                      Verrouillée
                    </span>
                  )}
                </div>
                {!ouverte && motifFermeture && (
                  <p className="mt-1 text-xs text-(--color-ink-soft)">{motifFermeture}</p>
                )}
                {/* Les supports de CETTE séance, sous son titre : un lien par document. */}
                {v.supports.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-(--color-ink-muted)">
                      Supports
                    </span>
                    {v.supports.map((s, k) => (
                      <Link
                        key={s.id}
                        href={`/cours/${coursId}/support/${v.id}?doc=${s.id}${embedQs}`}
                        className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-(--color-border) bg-(--color-surface) px-2.5 py-1 text-[12.5px] font-semibold text-(--color-ink-soft) transition-colors hover:text-(--color-ink) focus-ring"
                        style={{ borderColor: `color-mix(in srgb, ${d.accent} 30%, var(--color-border))` }}
                      >
                        <FileText className="h-3.5 w-3.5 shrink-0" style={{ color: d.accent }} />
                        <span className="truncate">{s.titre?.trim() || `Document ${k + 1}`}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

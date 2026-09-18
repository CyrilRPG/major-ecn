'use client';

import Link from 'next/link';
import { Columns2, FileText, Paperclip } from 'lucide-react';
import { useSplitView } from '@/components/student/split-view';
import type { ReplaySupport } from '@/lib/videos/replays';

/**
 * « Supports de cette séance », juste sous le lecteur : les documents de LA
 * vidéo affichée, et rien d'autre. Un clic ouvre le document ; sur grand
 * écran, « Afficher à côté de la vidéo » l'ouvre dans la vue partagée pour
 * lire le sujet ou le corrigé pendant que la vidéo tourne.
 *
 * Dans l'iframe de la vue partagée (`embed`), le bouton disparaît : on n'ouvre
 * pas une vue partagée dans une vue partagée.
 */
export function SupportsDeSeance({
  coursId,
  videoId,
  supports,
  accent,
  fond,
  embedQs = '',
  embed = false,
}: {
  coursId: string;
  videoId: string;
  supports: ReplaySupport[];
  accent: string;
  fond: string;
  embedQs?: string;
  embed?: boolean;
}) {
  const { open } = useSplitView();
  if (supports.length === 0) return null;
  const titreId = `supports-${videoId}`;
  return (
    <section
      aria-labelledby={titreId}
      className="mt-5 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-soft)"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id={titreId} className="flex items-center gap-2 text-sm font-bold text-(--color-ink)">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: fond, color: accent }}>
            <Paperclip className="h-3.5 w-3.5" />
          </span>
          Supports de cette séance
          <span className="text-xs font-semibold text-(--color-ink-muted)">
            · {supports.length} document{supports.length > 1 ? 's' : ''}
          </span>
        </h2>
        {!embed && (
          <button
            type="button"
            onClick={() => open(`support:${videoId}`)}
            className="hidden items-center gap-1.5 rounded-lg border border-(--color-border) bg-(--color-surface) px-2.5 py-1.5 text-xs font-semibold text-(--color-ink-soft) transition-colors hover:border-(--color-border-strong) hover:text-(--color-ink) focus-ring lg:inline-flex"
          >
            <Columns2 className="h-3.5 w-3.5" />
            Afficher à côté de la vidéo
          </button>
        )}
      </div>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {supports.map((s, i) => (
          <li key={s.id}>
            <Link
              href={`/cours/${coursId}/support/${videoId}?doc=${s.id}${embedQs}`}
              className="flex items-center gap-3 rounded-xl border border-(--color-border) bg-(--color-surface) px-3 py-2.5 transition-colors hover:bg-(--color-sand-100) focus-ring"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: fond, color: accent }}>
                <FileText className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-(--color-ink)">
                  {s.titre?.trim() || `Document ${i + 1}`}
                </span>
                <span className="block text-[11px] text-(--color-ink-soft)">Consultable en ligne</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

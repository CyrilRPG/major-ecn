import Link from 'next/link';
import { MonitorPlay, Video } from 'lucide-react';
import { CATEGORIES_VIDEO, ORDRE_CATEGORIES, resumeCategorie, type CategorieVideo } from '@/lib/videos/categories';

export type CategorieSwitchItem = {
  type: CategorieVideo;
  titre: string;
  seances: number;
  supports: number;
};

/**
 * Sélecteur « Séance intensive ⇄ Séances approfondies », affiché en tête des
 * pages de catégorie quand l'élève a accès aux deux. Un seul contenu à la
 * fois : la catégorie active est mise en avant, l'autre est un lien.
 *
 * Composant serveur (de simples liens) : il fonctionne aussi dans l'iframe de
 * la vue partagée, où `embedQs` conserve le paramètre `?embed=1`.
 */
export function CategorieSwitch({
  coursId,
  active,
  categories,
  embedQs = '',
}: {
  coursId: string;
  active: CategorieVideo;
  categories: CategorieSwitchItem[];
  embedQs?: string;
}) {
  if (categories.length < 2) return null;
  const ordonnees = ORDRE_CATEGORIES
    .map((t) => categories.find((c) => c.type === t))
    .filter((c): c is CategorieSwitchItem => !!c);
  return (
    <nav aria-label="Catégorie de replays" className="mb-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
      {ordonnees.map((c) => {
        const d = CATEGORIES_VIDEO[c.type];
        const Icon = c.type === 'cours' ? MonitorPlay : Video;
        const estActive = c.type === active;
        return (
          <Link
            key={c.type}
            href={`/cours/${coursId}/${d.segment}${embedQs ? `?${embedQs.replace(/^&/, '')}` : ''}`}
            aria-current={estActive ? 'page' : undefined}
            className={
              'flex items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-colors focus-ring ' +
              (estActive
                ? 'shadow-(--shadow-soft)'
                : 'border-(--color-border) bg-(--color-surface) hover:bg-(--color-sand-100)')
            }
            style={estActive ? { borderColor: d.accent, background: `color-mix(in srgb, ${d.accent} 8%, white)` } : undefined}
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{ background: d.fond, color: d.accent }}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span
                className="block truncate text-sm font-bold"
                style={{ color: estActive ? d.accent : 'var(--color-ink)' }}
              >
                {c.titre}
              </span>
              <span className="block text-xs text-(--color-ink-soft)">
                {d.formule} — {resumeCategorie(c.seances, c.supports)}
              </span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

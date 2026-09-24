import { CalendarClock } from 'lucide-react';
import { formaterDateSeance } from '@/lib/videos/a-venir';

/**
 * Remplace le lecteur d'une « séance à venir » (entrée sans vidéo, créée pour
 * mettre en ligne les dossiers à préparer avant une séance en direct). Jamais
 * de lecteur vide : l'élève sait quand a lieu la séance et quoi préparer ; ses
 * documents sont listés juste en dessous (`SupportsDeSeance`).
 *
 * Composant serveur, sans état.
 */
export function SeanceAVenir({
  liveAt,
  nbSupports,
  accent,
  fond,
}: {
  liveAt: string | null;
  nbSupports: number;
  accent: string;
  fond: string;
}) {
  const date = formaterDateSeance(liveAt);
  return (
    <div
      className="rounded-2xl border bg-(--color-surface) p-5 shadow-(--shadow-soft) sm:p-6"
      style={{ borderColor: `color-mix(in srgb, ${accent} 35%, var(--color-border))` }}
    >
      <div className="flex items-start gap-4">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          style={{ background: fond, color: accent }}
          aria-hidden
        >
          <CalendarClock className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-base font-bold text-(--color-ink)">
            Séance en direct à venir{date ? ` — le ${date}` : ''}
          </p>
          <p className="mt-1 text-sm text-(--color-ink-soft)">
            {nbSupports > 0
              ? 'Préparez les documents ci-dessous ; la vidéo sera ajoutée après la séance.'
              : 'Les documents à préparer seront mis en ligne prochainement ; la vidéo sera ajoutée après la séance.'}
          </p>
        </div>
      </div>
    </div>
  );
}

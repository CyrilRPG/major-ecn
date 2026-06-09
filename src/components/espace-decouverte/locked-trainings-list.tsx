'use client';

/**
 * Liste d'entraînements verrouillés (template vert trophée + cadenas).
 * Au clic, ouvre le popup "Information importante — Nouveaux contenus en cours
 * d'intégration".
 *
 * Utilisée côté étudiant sur Médecine Générale (voie interne + voie externe)
 * pour donner l'impression d'une riche bibliothèque d'entraînements à venir.
 */
import { useState } from 'react';
import { ArrowRight, Lock, Trophy } from 'lucide-react';
import { NouveauxContenusModal } from './nouveaux-contenus-modal';

const DEFAULT_TRAININGS = [
  { label: 'Entraînement 1 — Médecine générale niveau 1', questions: 20, minutes: 25 },
  { label: 'Entraînement 2 — Médecine générale niveau 2', questions: 25, minutes: 30 },
  { label: 'Entraînement 3 — Cas cliniques transversaux', questions: 30, minutes: 35 },
  { label: 'Entraînement 4 — Méthodologie EVC', questions: 20, minutes: 25 },
  { label: 'Entraînement 5 — Préparation finale', questions: 40, minutes: 50 },
];

export function LockedTrainingsList({
  trainings = DEFAULT_TRAININGS,
  startIndex = 0,
  title = 'Entraînements à venir',
  subtitle,
}: {
  trainings?: { label: string; questions: number; minutes: number }[];
  startIndex?: number;
  title?: string;
  subtitle?: string;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <>
      {(title || subtitle) && (
        <div className="mt-6 mb-3">
          {title && (
            <h2 className="text-[15px] font-extrabold uppercase tracking-[0.06em] text-(--color-ink-soft)">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-(--color-ink-muted)">{subtitle}</p>
          )}
        </div>
      )}
      <ul className="space-y-2.5">
        {trainings.map((t, i) => {
          const idx = startIndex + i + 1;
          return (
            <li key={t.label}>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface) px-4 py-3.5 text-left shadow-(--shadow-soft) transition-all hover:-translate-y-0.5 hover:shadow-(--shadow-lifted) focus-ring"
              >
                {/* Barre verticale verte (template Entraînement). */}
                <span aria-hidden className="absolute inset-y-0 left-0 w-1.5" style={{ background: '#16A34A' }} />
                <span
                  className="ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: '#E7F6EC', color: '#16793C' }}
                >
                  <Trophy className="h-5 w-5" />
                </span>
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold"
                  style={{ background: '#E7F6EC', color: '#16793C' }}
                >
                  {String(idx).padStart(2, '0')}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold text-(--color-ink)">{t.label}</p>
                  <p className="text-xs text-(--color-ink-muted)">
                    {t.questions} questions · environ {t.minutes} min
                  </p>
                </div>
                {/* Cadenas + badge "Entraînement" verrouillé */}
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                  style={{ background: '#FDEEEF', color: '#C0112E' }}
                  aria-hidden
                >
                  <Lock className="h-3.5 w-3.5" />
                </span>
                <span
                  className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold"
                  style={{ background: '#E7F6EC', color: '#16793C' }}
                >
                  Entraînement
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-(--color-ink-muted) transition-transform group-hover:translate-x-0.5" />
              </button>
            </li>
          );
        })}
      </ul>

      <NouveauxContenusModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

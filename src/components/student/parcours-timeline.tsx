'use client';

import Link from 'next/link';
import { Check, ClipboardCheck, FileText, Layers3, Lock, MonitorPlay, type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type Step = {
  key: 'video' | 'fiche' | 'training';
  label: string;
  description: string;
  Icon: LucideIcon;
  status: 'recommended' | 'optional' | 'done';
  href?: string;
  subActions?: { label: string; href: string; Icon: LucideIcon; description: string; hint?: string }[];
};

export function ParcoursTimeline({
  videoDone, ficheDone, hasVideo, hasFiche, hasQcm, hasAnnales, hasFlashcards, coursId,
}: {
  videoDone: boolean; ficheDone: boolean; hasVideo: boolean; hasFiche: boolean;
  hasQcm: boolean; hasAnnales: boolean; hasFlashcards: boolean; coursId: string;
}) {
  const steps: Step[] = [
    {
      key: 'video',
      label: 'Cours vidéo',
      description: hasVideo
        ? 'Le cours filmé par un médecin référent, aligné sur les recommandations HAS.'
        : 'La vidéo arrive bientôt. Vous pouvez déjà attaquer la fiche de synthèse.',
      Icon: MonitorPlay,
      status: videoDone ? 'done' : 'recommended',
      href: `/cours/${coursId}/video`,
    },
    {
      key: 'fiche',
      label: 'Fiche de synthèse',
      description: hasFiche
        ? 'Le résumé hiérarchisé rang A / rang B, structuré pour la mémorisation active.'
        : 'La fiche de synthèse est en cours de préparation.',
      Icon: FileText,
      status: ficheDone ? 'done' : videoDone ? 'recommended' : 'optional',
      href: `/cours/${coursId}/fiche`,
    },
    {
      key: 'training',
      label: 'Entraînement format EDN',
      description: 'Dossiers progressifs, annales EDN et flashcards pondérées par difficulté.',
      Icon: ClipboardCheck,
      status: videoDone && ficheDone ? 'recommended' : 'optional',
      subActions: [
        { label: 'Dossiers progressifs & QI', href: `/cours/${coursId}/qcm`, Icon: ClipboardCheck, description: 'Séries au format EDN, corrigées et justifiées proposition par proposition.', hint: hasQcm ? undefined : 'Bientôt' },
        { label: 'Annales EDN', href: `/cours/${coursId}/annales`, Icon: FileText, description: 'Les sujets tombés les années précédentes, en conditions concours.', hint: hasAnnales ? undefined : 'Bientôt' },
        { label: 'Flashcards', href: `/cours/${coursId}/flashcards`, Icon: Layers3, description: 'Révision espacée pondérée : ce qui résiste revient plus souvent.', hint: hasFlashcards ? undefined : 'Bientôt' },
      ],
    },
  ];

  const total = steps.length;
  const doneCount = steps.filter((s) => s.status === 'done').length;

  return (
    <div>
      {/* En-tête de progression segmentée — style indicateur clinique */}
      <div className="mb-8 rounded-2xl border border-(--color-border) bg-(--color-surface) px-5 py-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium uppercase tracking-[0.16em] text-(--color-ink-muted)">Protocole de l’item</span>
          <span className="font-mono text-(--color-ink-soft)">{doneCount}/{total} validé{doneCount > 1 ? 's' : ''}</span>
        </div>
        <div className="mt-3 flex gap-1.5">
          {steps.map((s) => (
            <span
              key={s.key}
              className={cn(
                'h-1.5 flex-1 rounded-full',
                s.status === 'done'
                  ? 'bg-(--color-success)'
                  : s.status === 'recommended'
                  ? 'bg-(--color-primary)'
                  : 'bg-(--color-border)',
              )}
            />
          ))}
        </div>
      </div>

      <ol className="space-y-4">
        {steps.map((step, i) => (
          <motion.li
            key={step.key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <article
              className={cn(
                'relative overflow-hidden rounded-2xl border bg-(--color-surface)',
                step.status === 'recommended'
                  ? 'border-(--color-primary)'
                  : 'border-(--color-border)',
              )}
            >
              {/* rail vertical d'état à gauche */}
              <span
                aria-hidden
                className={cn(
                  'absolute inset-y-0 left-0 w-1.5',
                  step.status === 'done'
                    ? 'bg-(--color-success)'
                    : step.status === 'recommended'
                    ? 'bg-(--color-primary)'
                    : 'bg-(--color-border)',
                )}
              />
              <div className="p-6 pl-8">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-4">
                    <span className="font-mono text-sm text-(--color-ink-muted) pt-1 tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={cn(
                        'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                        step.status === 'done'
                          ? 'bg-(--color-primary-soft) text-(--color-success)'
                          : 'bg-(--color-primary-soft) text-(--color-primary)',
                      )}
                    >
                      {step.status === 'done' ? <Check className="h-5 w-5" /> : <step.Icon className="h-5 w-5" />}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-(--color-ink)">{step.label}</h3>
                        {step.status === 'recommended' && (
                          <span className="rounded-full bg-(--color-primary-soft) px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-(--color-primary-deep)">
                            À faire
                          </span>
                        )}
                        {step.status === 'done' && (
                          <span className="rounded-full bg-(--color-primary-soft) px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-(--color-success)">
                            Validé
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-(--color-ink-soft) leading-relaxed max-w-xl">{step.description}</p>
                      {step.status === 'optional' && !step.subActions && (
                        <p className="mt-1 text-xs text-(--color-ink-muted)">Recommandé après le cours vidéo et la fiche</p>
                      )}
                    </div>
                  </div>
                  {step.href && (
                    <Link
                      href={step.href}
                      className="inline-flex items-center gap-2 rounded-(--radius-button) px-4 h-10 bg-(--color-primary) text-white text-sm font-medium hover:bg-(--color-primary-deep) focus-ring shadow-(--shadow-soft)"
                    >
                      {step.status === 'done' ? 'Revoir' : 'Commencer'}
                    </Link>
                  )}
                </div>

                {step.subActions && (
                  <div className="mt-5 grid sm:grid-cols-3 gap-3">
                    {step.subActions.map((sa) => (
                      <Link
                        key={sa.label}
                        href={sa.href}
                        className={cn(
                          'group rounded-xl border border-(--color-border) bg-(--color-surface-soft) p-4 transition-colors focus-ring',
                          sa.hint ? 'opacity-60 hover:opacity-100' : 'hover:border-(--color-accent)',
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-(--color-surface) text-(--color-accent-deep)">
                            <sa.Icon className="h-4 w-4" />
                          </span>
                          {sa.hint && <Lock className="h-3.5 w-3.5 text-(--color-ink-muted)" />}
                        </div>
                        <p className="mt-3 font-medium text-(--color-ink) text-sm">{sa.label}</p>
                        <p className="mt-0.5 text-xs text-(--color-ink-soft) leading-relaxed">{sa.description}</p>
                        {sa.hint && <p className="mt-2 text-[10px] uppercase tracking-wider text-(--color-ink-muted)">{sa.hint}</p>}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </article>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

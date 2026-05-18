'use client';

import Link from 'next/link';
import { CheckCircle2, ClipboardList, FileText, Layers3, Lock, PlayCircle, type LucideIcon } from 'lucide-react';
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
      label: 'Vidéo du cours',
      description: hasVideo ? 'Le cours filmé par un référent, à ton rythme.' : 'La vidéo arrive bientôt. Tu peux déjà attaquer la fiche.',
      Icon: PlayCircle,
      status: videoDone ? 'done' : 'recommended',
      href: `/cours/${coursId}/video`,
    },
    {
      key: 'fiche',
      label: 'Fiche de cours',
      description: hasFiche ? 'Le résumé synthétique des notions clés à mémoriser.' : 'La fiche est en cours de préparation.',
      Icon: FileText,
      status: ficheDone ? 'done' : videoDone ? 'recommended' : 'optional',
      href: `/cours/${coursId}/fiche`,
    },
    {
      key: 'training',
      label: 'Entraînement',
      description: 'QCM minutés, annales par année et flashcards pondérées.',
      Icon: ClipboardList,
      status: videoDone && ficheDone ? 'recommended' : 'optional',
      subActions: [
        { label: 'QCM',         href: `/cours/${coursId}/qcm`,         Icon: ClipboardList, description: '3 séries d’entraînement, corrigé question par question.', hint: hasQcm ? undefined : 'Bientôt' },
        { label: 'Annales',     href: `/cours/${coursId}/annales`,     Icon: FileText,      description: 'Les sujets des années précédentes.', hint: hasAnnales ? undefined : 'Bientôt' },
        { label: 'Flashcards',  href: `/cours/${coursId}/flashcards`,  Icon: Layers3,       description: 'Mémorisation espacée pondérée par difficulté.', hint: hasFlashcards ? undefined : 'Bientôt' },
      ],
    },
  ];

  return (
    <ol className="relative space-y-6">
      <div aria-hidden className="absolute left-7 top-3 bottom-3 w-px bg-gradient-to-b from-(--color-primary)/60 via-(--color-border) to-transparent" />
      {steps.map((step, i) => (
        <motion.li
          key={step.key}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative pl-16"
        >
          <div
            className={cn(
              'absolute left-0 top-2 flex h-14 w-14 items-center justify-center rounded-2xl border',
              step.status === 'done'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-700/40 dark:bg-emerald-900/30 dark:text-emerald-300'
                : step.status === 'recommended'
                ? 'border-(--color-primary) bg-(--color-primary) text-(--color-primary-fg) shadow-(--shadow-glow)'
                : 'border-(--color-border) bg-(--color-surface-soft) text-(--color-ink-soft)',
            )}
          >
            {step.status === 'done' ? <CheckCircle2 className="h-6 w-6" /> : <step.Icon className="h-6 w-6" />}
          </div>

          <div className="surface-card p-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h3 className="font-semibold text-(--color-ink)">{step.label}</h3>
                <p className="mt-1 text-sm text-(--color-ink-soft) leading-relaxed">{step.description}</p>
                {step.status === 'optional' && (
                  <p className="mt-1 text-xs text-(--color-primary-deep)">Recommandé après la vidéo et la fiche</p>
                )}
              </div>
              {step.href && (
                <Link
                  href={step.href}
                  className="inline-flex items-center gap-2 rounded-(--radius-button) px-4 h-10 bg-(--color-primary) text-(--color-primary-fg) text-sm font-medium hover:bg-(--color-primary-deep) focus-ring shadow-(--shadow-soft)"
                >
                  {step.status === 'done' ? 'Revoir' : 'Commencer'}
                </Link>
              )}
            </div>
            {step.subActions && (
              <div className="mt-4 grid sm:grid-cols-3 gap-3">
                {step.subActions.map((sa) => (
                  <Link
                    key={sa.label}
                    href={sa.href}
                    className={cn(
                      'group rounded-xl border border-(--color-border) bg-(--color-surface-soft) p-4 transition focus-ring',
                      sa.hint ? 'opacity-60 hover:opacity-100' : 'hover:border-(--color-primary) hover:-translate-y-0.5',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <sa.Icon className="h-5 w-5 text-(--color-primary-deep)" />
                      {sa.hint && <Lock className="h-3.5 w-3.5 text-(--color-ink-soft)" />}
                    </div>
                    <p className="mt-2 font-medium text-(--color-ink)">{sa.label}</p>
                    <p className="text-xs text-(--color-ink-soft) leading-relaxed">{sa.description}</p>
                    {sa.hint && <p className="mt-1 text-[10px] uppercase tracking-wider text-(--color-ink-soft)">{sa.hint}</p>}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.li>
      ))}
    </ol>
  );
}

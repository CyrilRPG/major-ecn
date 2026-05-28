'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, ChevronDown, ChevronUp, ClipboardList, Stethoscope } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type TextQuestion = {
  id: string;
  enonce: string;
  order_index: number;
};

export function TextAnnaleViewer({
  serieLabel,
  vignette,
  questions,
  backHref,
  isDP,
}: {
  serieLabel: string;
  vignette: string | null;
  questions: TextQuestion[];
  backHref: string;
  isDP: boolean;
}) {
  const [expandedVignette, setExpandedVignette] = useState(true);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col px-4 py-4 sm:px-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href={backHref}>
            <ArrowLeft />
            Retour aux annales
          </Link>
        </Button>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-(--color-primary-soft) px-3 py-1 text-xs font-semibold text-(--color-primary)">
          {isDP ? <Stethoscope className="h-3.5 w-3.5" /> : <BookOpen className="h-3.5 w-3.5" />}
          {isDP ? 'Dossier progressif' : 'Connaissances fondamentales'}
        </span>
      </div>

      <div className="mb-1.5 text-xs text-(--color-ink-soft)">
        <span className="font-semibold text-(--color-ink)">Annale</span> · {serieLabel}
      </div>

      {isDP && vignette && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 overflow-hidden rounded-xl border border-(--color-primary)/25 bg-[color-mix(in_srgb,var(--color-primary)_4%,var(--color-surface))] shadow-(--shadow-soft)"
        >
          <button
            type="button"
            onClick={() => setExpandedVignette((v) => !v)}
            className="flex w-full items-center gap-3 px-4 py-3 text-left"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-(--color-primary)/12 text-(--color-primary)">
              <ClipboardList className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-(--color-primary-deep)">
                Vignette clinique
              </p>
              <p className="mt-0.5 text-xs text-(--color-ink-soft)">
                {expandedVignette ? 'Cliquez pour réduire' : 'Cliquez pour développer le cas clinique'}
              </p>
            </div>
            {expandedVignette ? (
              <ChevronUp className="h-4 w-4 shrink-0 text-(--color-ink-muted)" />
            ) : (
              <ChevronDown className="h-4 w-4 shrink-0 text-(--color-ink-muted)" />
            )}
          </button>

          {expandedVignette && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="overflow-hidden border-t border-(--color-primary)/15 px-4 pb-4 pt-3"
            >
              <div className="whitespace-pre-line text-sm leading-relaxed text-(--color-ink)">
                {vignette}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      <div className="space-y-3">
        {questions.map((q, i) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.03 }}
            className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-soft)"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-(--color-accent-deep)/10 text-xs font-bold text-(--color-accent-deep)">
                {q.order_index + 1}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-(--color-ink-muted)">
                Question {q.order_index + 1}
              </span>
            </div>
            <div className="whitespace-pre-line text-sm leading-relaxed text-(--color-ink)">
              {q.enonce}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-(--color-border) bg-(--color-surface-soft) p-4 text-center text-sm text-(--color-ink-soft)">
        <p className="font-medium">Sujet d'examen officiel — {questions.length} questions</p>
        <p className="mt-1 text-xs">
          Entraînez-vous en rédigeant vos réponses, puis consultez vos cours pour vérifier.
        </p>
      </div>
    </div>
  );
}

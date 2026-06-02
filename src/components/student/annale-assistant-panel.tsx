'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageCircle, X } from 'lucide-react';
import { CourseChatbot } from '@/components/course-chatbot';
import { cn } from '@/lib/utils';

/**
 * Wrapper qui rend un header sticky identique à celui de study-console
 * (titre + bouton Assistant à droite), puis ses children. Quand l'assistant
 * est ouvert, dock latéral non-modal — le contenu se décale (lg:pr-[380px]).
 */
export function AnnaleAssistantPanel({
  annaleId,
  annaleTitre,
  context,
  backHref,
  backLabel,
  children,
}: {
  annaleId: string;
  annaleTitre: string;
  context?: string;
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
}) {
  const [assistantOpen, setAssistantOpen] = useState(false);

  return (
    <div className="relative">
      {/* Console header — sticky, identique au parcours pédagogique */}
      <div className="sticky top-0 z-20 border-b border-(--color-border) bg-(--color-surface)/95 px-4 py-3 backdrop-blur lg:px-8">
        <div className="flex items-center gap-3">
          {backHref && (
            <Link
              href={backHref}
              className="hidden shrink-0 items-center gap-1.5 text-sm text-(--color-ink-soft) hover:text-(--color-ink) sm:inline-flex"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden md:inline">{backLabel ?? 'Retour'}</span>
            </Link>
          )}
          <div className="min-w-0 flex-1">
            {context && <p className="truncate text-xs font-medium text-(--color-ink-muted)">{context}</p>}
            <h1 className="truncate text-base font-semibold tracking-tight text-(--color-ink) sm:text-lg">{annaleTitre}</h1>
          </div>
          <button
            type="button"
            onClick={() => setAssistantOpen((v) => !v)}
            className={cn(
              'flex h-9 items-center gap-2 rounded-lg border px-3 text-sm transition-colors focus-ring',
              assistantOpen
                ? 'border-(--color-accent) bg-(--color-primary-soft) text-(--color-primary-deep)'
                : 'border-(--color-border) bg-(--color-surface-soft) text-(--color-ink-soft) hover:border-(--color-border-strong)',
            )}
          >
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Assistant</span>
          </button>
        </div>
      </div>

      {/* Contenu — décalé à droite quand l'assistant est ouvert (desktop) */}
      <div className={cn('transition-[padding]', assistantOpen && 'lg:pr-[380px]')}>{children}</div>

      {/* Dock assistant non-modal — pas de backdrop */}
      {assistantOpen && (
        <aside
          className={cn(
            'fixed z-40 flex flex-col border-(--color-border) bg-(--color-surface) shadow-(--shadow-lifted)',
            'inset-x-0 bottom-0 h-[70vh] rounded-t-2xl border-t',
            'lg:inset-y-0 lg:left-auto lg:right-0 lg:h-auto lg:w-[380px] lg:rounded-none lg:border-l lg:border-t-0',
          )}
        >
          <div className="flex items-center justify-between border-b border-(--color-border) px-4 py-3">
            <span className="text-sm font-semibold text-(--color-ink)">Assistant de l’annale</span>
            <button
              type="button"
              onClick={() => setAssistantOpen(false)}
              aria-label="Fermer l’assistant"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-(--color-ink-soft) hover:bg-(--color-sand-100) focus-ring"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="min-h-0 flex-1">
            <CourseChatbot coursId={annaleId} coursTitre={annaleTitre} />
          </div>
        </aside>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { CourseChatbot } from '@/components/course-chatbot';
import { cn } from '@/lib/utils';

/**
 * Wrapper qui :
 *   - rend ses children (la page annale)
 *   - affiche un bouton « Assistant » en haut-droite (sticky)
 *   - quand ouvert, dock latéral non-modal (comme dans study-console.tsx) :
 *     pas d'overlay, le contenu se décale (lg:pr-[380px]) plutôt que d'être
 *     recouvert.
 */
export function AnnaleAssistantPanel({
  annaleId,
  annaleTitre,
  children,
}: {
  annaleId: string;
  annaleTitre: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {/* Bouton flottant — sticky top-droite */}
      <div className="sticky top-3 z-30 mb-2 flex justify-end px-1">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            'inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold shadow-sm transition-colors focus-ring',
            open
              ? 'border-(--color-accent) bg-(--color-primary-soft) text-(--color-primary-deep)'
              : 'border-(--color-border) bg-(--color-surface) text-(--color-ink) hover:border-(--color-border-strong)',
          )}
        >
          <MessageCircle className="h-4 w-4" />
          <span className="hidden sm:inline">{open ? 'Fermer l’assistant' : 'Ouvrir l’assistant'}</span>
          <span className="sm:hidden">Assistant</span>
        </button>
      </div>

      {/* Contenu — décalé à droite quand l'assistant est ouvert (desktop) */}
      <div className={cn('transition-[padding]', open && 'lg:pr-[380px]')}>{children}</div>

      {/* Dock assistant non-modal — pas de backdrop, la page reste utilisable */}
      {open && (
        <aside
          className={cn(
            'fixed z-40 flex flex-col border-(--color-border) bg-(--color-surface) shadow-(--shadow-lifted)',
            // mobile : bottom sheet · desktop : dock droite plein-hauteur
            'inset-x-0 bottom-0 h-[70vh] rounded-t-2xl border-t',
            'lg:inset-y-0 lg:left-auto lg:right-0 lg:h-auto lg:w-[380px] lg:rounded-none lg:border-l lg:border-t-0',
          )}
        >
          <div className="flex items-center justify-between border-b border-(--color-border) px-4 py-3">
            <span className="text-sm font-semibold text-(--color-ink)">Assistant de l’annale</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
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

'use client';

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { CourseChatbot } from '@/components/course-chatbot';
import { cn } from '@/lib/utils';

/**
 * Bouton + panneau coulissant qui ouvre l'assistant IA sur la page d'une annale.
 * On réutilise le CourseChatbot existant en lui passant l'id de l'annale comme
 * coursId — le pipeline RAG fera de l'abstention pour les questions hors
 * périmètre, ce qui est exactement le comportement voulu.
 */
export function AnnaleAssistantPanel({
  annaleId,
  annaleTitre,
}: {
  annaleId: string;
  annaleTitre: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-colors focus-ring',
          open
            ? 'border-(--color-accent) bg-(--color-primary-soft) text-(--color-primary-deep)'
            : 'border-(--color-border) bg-(--color-surface) text-(--color-ink) hover:border-(--color-border-strong)',
        )}
      >
        <MessageCircle className="h-4 w-4" />
        {open ? 'Fermer l’assistant' : 'Ouvrir l’assistant'}
      </button>

      {open && (
        <>
          {/* Overlay mobile */}
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          {/* Panneau latéral */}
          <aside
            className={cn(
              'fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-(--color-border) bg-(--color-surface) shadow-2xl',
              'translate-x-0 transition-transform duration-300',
            )}
          >
            <CourseChatbot
              coursId={annaleId}
              coursTitre={annaleTitre}
              onClose={() => setOpen(false)}
            />
          </aside>
        </>
      )}
    </>
  );
}

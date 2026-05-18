'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { CourseChatbot } from './course-chatbot';

export function CourseChatbotRail({ coursId, coursTitre }: { coursId: string; coursTitre: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  // Hide entirely on the course landing (parcours) page: /cours/{id} with no sub-segment.
  const afterCours = pathname.split(`/cours/${coursId}`)[1] ?? '';
  const isParcoursIndex = afterCours === '' || afterCours === '/';
  if (isParcoursIndex) return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir l’assistant du cours"
        className="hidden lg:flex fixed bottom-6 right-6 z-40 h-14 w-14 items-center justify-center rounded-full bg-(--color-primary) text-white shadow-(--shadow-lifted) hover:scale-105 transition focus-ring"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <aside className="hidden lg:flex sticky top-0 h-screen w-[26%] min-w-[300px] max-w-[380px] shrink-0 flex-col border-l border-(--color-border) bg-(--color-surface)">
      <CourseChatbot coursId={coursId} coursTitre={coursTitre} onClose={() => setOpen(false)} />
    </aside>
  );
}

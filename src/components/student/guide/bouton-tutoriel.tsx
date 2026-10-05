'use client';

import { PlayCircle } from 'lucide-react';
import { TUTORIEL_OPEN_EVENT } from '@/lib/student/tutoriel-video';

/** Rouvre le tutoriel vidéo de la plateforme (même fenêtre que le bouton « Tutoriel » de la barre du haut). */
export function BoutonTutoriel({ className, children = 'Revoir le tutoriel vidéo' }: { className?: string; children?: React.ReactNode }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(TUTORIEL_OPEN_EVENT))} className={className}>
      <PlayCircle className="h-4 w-4" aria-hidden /> {children}
    </button>
  );
}

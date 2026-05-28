'use client';

import { useRef, useState, useTransition } from 'react';
import { Check, Loader2, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

export function PdfViewer({ src, coursId, initiallyRead }: { src: string; coursId: string; initiallyRead: boolean }) {
  const [read, setRead] = useState(initiallyRead);
  const [pending, start] = useTransition();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const markRead = () => {
    start(async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      await supabase.from('course_progress').upsert(
        { user_id: data.user.id, cours_id: coursId, fiche_read: true, last_seen_at: new Date().toISOString() },
        { onConflict: 'user_id,cours_id' },
      );
      setRead(true);
    });
  };

  const toggleFullscreen = async () => {
    const el = wrapperRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      try {
        await el.requestFullscreen();
        setIsFullscreen(true);
      } catch {
        /* fallback : pseudo plein écran via classe Tailwind si l'API n'est pas dispo */
        setIsFullscreen((v) => !v);
      }
    } else {
      await document.exitFullscreen().catch(() => null);
      setIsFullscreen(false);
    }
  };

  // Listen to native fullscreenchange to garder l'état UI synchro (sortie via Échap).
  if (typeof document !== 'undefined') {
    document.onfullscreenchange = () => setIsFullscreen(!!document.fullscreenElement);
  }

  return (
    <div
      ref={wrapperRef}
      className={
        isFullscreen
          ? 'fixed inset-0 z-50 flex flex-col bg-black'
          : 'surface-card overflow-hidden p-0'
      }
    >
      <div
        className={
          'flex items-center justify-between gap-3 border-b border-(--color-border) px-5 py-3 ' +
          (isFullscreen ? 'bg-(--color-surface)' : 'bg-(--color-surface-soft)')
        }
      >
        <p className="text-sm text-(--color-ink-soft)">Utilise la molette pour zoomer.</p>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={toggleFullscreen} aria-label="Plein écran">
            {isFullscreen ? <Minimize2 /> : <Maximize2 />}
            {isFullscreen ? 'Quitter' : 'Plein écran'}
          </Button>
          <Button size="sm" variant={read ? 'secondary' : 'primary'} onClick={markRead} disabled={pending || read}>
            {pending ? <Loader2 className="animate-spin" /> : <Check />}
            {read ? 'Marquée comme lue' : 'Marquer comme lue'}
          </Button>
        </div>
      </div>
      <iframe
        src={`${src}#view=FitH`}
        title="Fiche de cours"
        className={
          isFullscreen
            ? 'min-h-0 w-full flex-1 bg-slate-50 dark:bg-slate-900'
            : 'w-full h-[80vh] bg-slate-50 dark:bg-slate-900'
        }
      />
    </div>
  );
}

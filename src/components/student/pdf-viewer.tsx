'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { Check, ExternalLink, Loader2, Maximize2, Minimize2 } from 'lucide-react';
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
        setIsFullscreen((v) => !v);
      }
    } else {
      await document.exitFullscreen().catch(() => null);
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={
        isFullscreen
          ? 'fixed inset-0 z-50 flex flex-col bg-black'
          : 'surface-card flex flex-col overflow-hidden p-0'
      }
    >
      {/* Toolbar : compacte sur mobile (icônes seules), étalée sur desktop (libellés visibles) */}
      <div
        className={
          'flex items-center gap-1.5 border-b border-(--color-border) px-3 py-2 sm:gap-2 sm:px-5 sm:py-3 ' +
          (isFullscreen ? 'bg-(--color-surface)' : 'bg-(--color-surface-soft)')
        }
      >
        <p className="hidden text-xs text-(--color-ink-soft) sm:block">
          <span className="hidden md:inline">Utilise la molette pour zoomer.</span>
          <span className="md:hidden">Pince pour zoomer.</span>
        </p>
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <Button size="sm" variant="secondary" onClick={toggleFullscreen} aria-label={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}>
            {isFullscreen ? <Minimize2 /> : <Maximize2 />}
            <span className="hidden sm:inline">{isFullscreen ? 'Quitter' : 'Plein écran'}</span>
          </Button>
          {/* Sur mobile, ouvrir le PDF dans un nouvel onglet permet d'utiliser le viewer natif iOS/Android — bien plus confortable */}
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-(--color-border) bg-(--color-surface) px-2.5 text-xs font-medium text-(--color-ink-soft) hover:border-(--color-border-strong) sm:hidden"
            aria-label="Ouvrir le PDF dans un nouvel onglet"
          >
            <ExternalLink className="h-4 w-4" />
            Ouvrir
          </a>
          <Button size="sm" variant={read ? 'secondary' : 'primary'} onClick={markRead} disabled={pending || read}>
            {pending ? <Loader2 className="animate-spin" /> : <Check />}
            <span className="hidden sm:inline">{read ? 'Marquée comme lue' : 'Marquer comme lue'}</span>
            <span className="sm:hidden">{read ? 'Lue' : 'Lu'}</span>
          </Button>
        </div>
      </div>
      <iframe
        src={`${src}#view=FitH&toolbar=1`}
        title="Fiche de cours"
        className={
          isFullscreen
            ? 'min-h-0 w-full flex-1 bg-slate-50'
            // dvh : viewport "dynamique" qui exclut la barre URL mobile (Safari/Chrome)
            // → maximise la zone de lecture sur téléphone sans déborder
            : 'w-full bg-slate-50 h-[calc(100dvh-220px)] sm:h-[80vh]'
        }
      />
    </div>
  );
}

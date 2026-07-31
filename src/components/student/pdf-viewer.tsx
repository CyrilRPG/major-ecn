'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import dynamic from 'next/dynamic';
import { Check, Download, Loader2, Lock, Maximize2, Minimize2, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { getVerifiedUser } from '@/lib/auth/verified-user';

// Rendu en <canvas> (react-pdf), chargé uniquement côté client : pas de
// visionneuse PDF native → aucun bouton de téléchargement / impression,
// pas de lien direct vers le fichier, et pas de texte sélectionnable.
const PdfCanvas = dynamic(() => import('./pdf-canvas'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[40vh] items-center justify-center bg-slate-100 text-sm text-(--color-ink-soft)">
      Chargement de la fiche…
    </div>
  ),
});

const ZOOM_MIN = 0.6;
const ZOOM_MAX = 2.4;
const ZOOM_STEP = 0.2;

export function PdfViewer({
  src,
  coursId,
  initiallyRead,
  canDownload = false,
  canMarkRead = true,
  notice,
}: {
  src: string;
  coursId: string;
  initiallyRead: boolean;
  /** Affiche le bouton de téléchargement (admin / professeur uniquement). */
  canDownload?: boolean;
  /** « Marquer comme lue » n'a de sens que pour la fiche du cours : les
   *  supports de séance ne comptent pas dans la progression. */
  canMarkRead?: boolean;
  /** Petit texte affiché à gauche de la barre d'outils (ex. nom de la séance). */
  notice?: string;
}) {
  const [read, setRead] = useState(initiallyRead);
  const [pending, start] = useTransition();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);

  const markRead = () => {
    start(async () => {
      const supabase = createClient();
      const user = await getVerifiedUser(supabase);
      if (!user) return;
      await supabase.from('course_progress').upsert(
        { user_id: user.id, cours_id: coursId, fiche_read: true, last_seen_at: new Date().toISOString() },
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
      {/* Toolbar : zoom + plein écran + marquer comme lue (pas de téléchargement) */}
      <div
        className={
          'flex items-center gap-1.5 border-b border-(--color-border) px-3 py-2 sm:gap-2 sm:px-5 sm:py-3 ' +
          (isFullscreen ? 'bg-(--color-surface)' : 'bg-(--color-surface-soft)')
        }
      >
        <p className="hidden items-center gap-1.5 text-xs text-(--color-ink-soft) sm:flex">
          <Lock className="h-3.5 w-3.5" />
          {notice ?? (canDownload ? 'Téléchargement réservé au staff.' : 'Fiche consultable en ligne uniquement.')}
        </p>
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-(--color-border) bg-(--color-surface) px-1">
            <Button size="sm" variant="ghost" onClick={() => setZoom((z) => Math.max(ZOOM_MIN, Math.round((z - ZOOM_STEP) * 10) / 10))} disabled={zoom <= ZOOM_MIN} aria-label="Réduire">
              <ZoomOut />
            </Button>
            <span className="min-w-10 text-center text-xs font-semibold tabular-nums text-(--color-ink-soft)">{Math.round(zoom * 100)}%</span>
            <Button size="sm" variant="ghost" onClick={() => setZoom((z) => Math.min(ZOOM_MAX, Math.round((z + ZOOM_STEP) * 10) / 10))} disabled={zoom >= ZOOM_MAX} aria-label="Agrandir">
              <ZoomIn />
            </Button>
          </div>
          {canDownload && (
            <Button
              size="sm"
              variant="secondary"
              asChild
              title="Télécharger la fiche (sans filigrane)"
              aria-label="Télécharger la fiche"
            >
              <a href={`${src}?download=1`} download>
                <Download />
                <span className="hidden sm:inline">Télécharger</span>
              </a>
            </Button>
          )}
          <Button size="sm" variant="secondary" onClick={toggleFullscreen} aria-label={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}>
            {isFullscreen ? <Minimize2 /> : <Maximize2 />}
            <span className="hidden sm:inline">{isFullscreen ? 'Quitter' : 'Plein écran'}</span>
          </Button>
          {canMarkRead && (
            <Button size="sm" variant={read ? 'secondary' : 'primary'} onClick={markRead} disabled={pending || read}>
              {pending ? <Loader2 className="animate-spin" /> : <Check />}
              <span className="hidden sm:inline">{read ? 'Marquée comme lue' : 'Marquer comme lue'}</span>
              <span className="sm:hidden">{read ? 'Lue' : 'Lu'}</span>
            </Button>
          )}
        </div>
      </div>
      <div className={isFullscreen ? 'min-h-0 flex-1' : 'h-[calc(100dvh-220px)] sm:h-[80vh]'}>
        <PdfCanvas src={src} zoom={zoom} />
      </div>
    </div>
  );
}

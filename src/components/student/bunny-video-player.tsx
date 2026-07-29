'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { VIDEO_PAUSE_EVENT, VIDEO_PROGRESS_EVENT, type VideoProgressDetail } from '@/lib/emargement';

/**
 * Lecteur vidéo Bunny Stream (iframe embed). Suit la progression via le
 * protocole player.js (implémenté par le lecteur Bunny) pour marquer le cours
 * comme « vu » à 80 %, avec un bouton manuel de secours.
 *
 * `watermarkText` — si fourni, un filigrane semi-transparent se superpose à la
 * vidéo (pointer-events: none) pour décourager les captures d'écran.
 */
export function BunnyVideoPlayer({
  embedUrl,
  coursId,
  watermarkText,
}: {
  embedUrl: string;
  coursId: string;
  watermarkText?: string;
}) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [done, setDone] = useState(false);
  const markedRef = useRef(false);

  async function markWatched() {
    if (markedRef.current) return;
    markedRef.current = true;
    setDone(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('course_progress').upsert({
        cours_id: coursId,
        video_watched: true,
        last_seen_at: new Date().toISOString(),
        user_id: user.id,
      });
    } catch { /* best-effort */ }
  }

  useEffect(() => {
    const iframe = frameRef.current;
    if (!iframe) return;
    const send = (method: string, value?: unknown) =>
      iframe.contentWindow?.postMessage(
        JSON.stringify({ context: 'player.js', version: '0.0.1', method, value }),
        '*',
      );

    function onMessage(e: MessageEvent) {
      let d: { context?: string; event?: string; value?: { seconds?: number; duration?: number } };
      try { d = JSON.parse(typeof e.data === 'string' ? e.data : '{}'); } catch { return; }
      if (d?.context !== 'player.js') return;
      if (d.event === 'ready') {
        send('addEventListener', 'ended');
        send('addEventListener', 'timeupdate');
      } else if (d.event === 'ended') {
        markWatched();
      } else if (d.event === 'timeupdate' && d.value?.duration) {
        const { seconds = 0, duration = 0 } = d.value;
        if (duration > 0) {
          // Alimente la barrière d'émargement (seuil à 20 %).
          window.dispatchEvent(
            new CustomEvent<VideoProgressDetail>(VIDEO_PROGRESS_EVENT, {
              detail: { coursId, ratio: seconds / duration, seconds },
            }),
          );
        }
        if (duration > 0 && seconds / duration > 0.8) markWatched();
      }
    }

    // La barrière d'émargement demande la mise en pause tant que la signature
    // n'est pas enregistrée.
    function onPause() { send('pause'); }
    window.addEventListener(VIDEO_PAUSE_EVENT, onPause);

    window.addEventListener('message', onMessage);
    // Au cas où le player serait déjà prêt avant l'attache du listener.
    const t = setTimeout(() => { send('addEventListener', 'ended'); send('addEventListener', 'timeupdate'); }, 1500);
    return () => {
      window.removeEventListener('message', onMessage);
      window.removeEventListener(VIDEO_PAUSE_EVENT, onPause);
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="relative w-full overflow-hidden rounded-2xl bg-black shadow-(--shadow-lifted)" style={{ aspectRatio: '16 / 9' }}>
        <iframe
          ref={frameRef}
          src={embedUrl}
          title="Vidéo du cours"
          loading="lazy"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
        {watermarkText && (
          <div
            aria-hidden="true"
            className="absolute inset-0 z-10 overflow-hidden pointer-events-none select-none"
          >
            {[
              { top: '12%', left: '15%', dark: true },
              { top: '50%', left: '55%', dark: false },
              { top: '82%', left: '25%', dark: true },
            ].map((pos, i) => (
              <span
                key={i}
                className="absolute whitespace-nowrap text-[11px] sm:text-[13px] font-semibold"
                style={{
                  top: pos.top,
                  left: pos.left,
                  transform: 'rotate(-20deg)',
                  opacity: 0.18,
                  color: pos.dark ? '#1a1a1a' : '#ffffff',
                  textShadow: pos.dark
                    ? '0 0 4px rgba(255,255,255,0.9), 1px 1px 2px rgba(255,255,255,0.7)'
                    : '0 0 4px rgba(0,0,0,0.9), 1px 1px 2px rgba(0,0,0,0.7)',
                }}
              >
                {watermarkText}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="mt-2 flex items-center justify-end">
        {done ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16A34A]">
            <CheckCircle2 className="h-4 w-4" /> Marqué comme vu
          </span>
        ) : (
          <button
            type="button"
            onClick={markWatched}
            className="text-xs font-semibold text-(--color-ink-soft) hover:text-(--color-primary)"
          >
            Marquer comme terminé
          </button>
        )}
      </div>
    </div>
  );
}

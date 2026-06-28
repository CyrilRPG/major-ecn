'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

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
        if (duration > 0 && seconds / duration > 0.8) markWatched();
      }
    }

    window.addEventListener('message', onMessage);
    // Au cas où le player serait déjà prêt avant l'attache du listener.
    const t = setTimeout(() => { send('addEventListener', 'ended'); send('addEventListener', 'timeupdate'); }, 1500);
    return () => { window.removeEventListener('message', onMessage); clearTimeout(t); };
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
            <div
              className="absolute"
              style={{
                top: '50%',
                left: '50%',
                width: '250%',
                height: '250%',
                transform: 'translate(-50%, -50%) rotate(-25deg)',
                display: 'flex',
                flexWrap: 'wrap',
                alignContent: 'center',
                justifyContent: 'center',
                gap: '40px 56px',
              }}
            >
              {Array.from({ length: 60 }, (_, i) => (
                <span
                  key={i}
                  className="whitespace-nowrap text-[11px] sm:text-[13px] font-semibold"
                  style={{
                    opacity: 0.22,
                    color: i % 2 === 0 ? '#1a1a1a' : '#ffffff',
                    textShadow: i % 2 === 0
                      ? '0 0 4px rgba(255,255,255,0.9), 1px 1px 2px rgba(255,255,255,0.7)'
                      : '0 0 4px rgba(0,0,0,0.9), 1px 1px 2px rgba(0,0,0,0.7)',
                  }}
                >
                  {watermarkText}
                </span>
              ))}
            </div>
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

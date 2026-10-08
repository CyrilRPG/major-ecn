'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Maximize2, Minimize2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { getVerifiedUser } from '@/lib/auth/verified-user';
import { VIDEO_PAUSE_EVENT, VIDEO_PROGRESS_EVENT, type VideoProgressDetail } from '@/lib/emargement';
import { poserFiligrane } from '@/lib/video/filigrane';

/**
 * Lecteur vidéo Bunny Stream (iframe embed). Suit la progression via le
 * protocole player.js (implémenté par le lecteur Bunny) pour marquer le cours
 * comme « vu » à 80 %, avec un bouton manuel de secours.
 *
 * `watermarkText` — si fourni, un filigrane nominatif se superpose à la vidéo
 * en PERMANENCE (lib/video/filigrane : recréé s'il est supprimé ou masqué,
 * vidéo mise en pause). Le plein écran est celui du CADRE (vidéo + filigrane) :
 * le plein écran natif de l'iframe Bunny faisait disparaître le filigrane.
 * Aucun arrondi ni `overflow: hidden` sur l'ancêtre de l'iframe : Chrome perdait
 * alors le glisser de la barre de lecture hors plein écran (08/10/2026).
 */
export function BunnyVideoPlayer({
  embedUrl,
  coursId,
  videoId,
  watermarkText,
}: {
  embedUrl: string;
  coursId: string;
  /** Séance lue : la barrière d'émargement tient une feuille par séance. */
  videoId?: string;
  watermarkText?: string;
}) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const cadreRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);
  // Plein écran : natif sur le cadre si possible, sinon (iPhone) cadre fixé
  // sur tout l'écran.
  const [pleinEcran, setPleinEcran] = useState(false);
  const [simule, setSimule] = useState(false);

  const pauser = () => frameRef.current?.contentWindow?.postMessage(
    JSON.stringify({ context: 'player.js', version: '0.0.1', method: 'pause' }), '*',
  );

  useEffect(() => {
    const cadre = cadreRef.current;
    if (!cadre || !watermarkText) return;
    return poserFiligrane(cadre, watermarkText, pauser);
  }, [watermarkText]);

  useEffect(() => {
    const onChange = () => setPleinEcran(document.fullscreenElement === cadreRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);
  useEffect(() => {
    if (!simule) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSimule(false); };
    document.addEventListener('keydown', onKey);
    const ancien = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ancien; };
  }, [simule]);

  const basculerPleinEcran = async () => {
    const cadre = cadreRef.current;
    if (!cadre) return;
    if (document.fullscreenElement) { await document.exitFullscreen().catch(() => undefined); return; }
    if (simule) { setSimule(false); return; }
    if (cadre.requestFullscreen && document.fullscreenEnabled) {
      try { await cadre.requestFullscreen(); return; } catch { /* repli ci-dessous */ }
    }
    setSimule(true);
  };
  const agrandi = pleinEcran || simule;
  const markedRef = useRef(false);

  async function markWatched() {
    if (markedRef.current) return;
    markedRef.current = true;
    setDone(true);
    try {
      const supabase = createClient();
      const user = await getVerifiedUser(supabase);
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
              detail: { coursId, videoId: videoId ?? null, ratio: seconds / duration, seconds },
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
      <div
        ref={cadreRef}
        className={simule
          ? 'fixed inset-0 z-[1000] bg-black'
          : 'relative w-full bg-black shadow-(--shadow-lifted)'}
        style={simule || pleinEcran ? undefined : { aspectRatio: '16 / 9' }}
      >
        {/* Pas de « fullscreen » pour l'iframe : seul le cadre (vidéo + filigrane)
            passe en plein écran. */}
        <iframe
          ref={frameRef}
          src={embedUrl}
          title="Vidéo du cours"
          loading="lazy"
          allow="accelerometer; gyroscope; autoplay; encrypted-media"
          className="absolute inset-0 h-full w-full border-0"
        />
        {agrandi && (
          <button
            type="button"
            onClick={() => void basculerPleinEcran()}
            className="absolute right-3 top-3 z-30 inline-flex items-center gap-1.5 rounded-lg bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur hover:bg-black/80"
          >
            <Minimize2 className="h-4 w-4" /> Quitter le plein écran
          </button>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => void basculerPleinEcran()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-(--color-ink-soft) hover:text-(--color-primary)"
        >
          <Maximize2 className="h-3.5 w-3.5" /> Plein écran
        </button>
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

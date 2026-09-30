'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowRight, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { libelleDureeLong } from '@/lib/marketing/visite-guidee';
import { paliersFranchis, type EvenementVideo, type SourceVideo } from '@/lib/marketing/video-evenements';
import { envoyerEvenementVideo } from '@/lib/marketing/video-suivi';

/**
 * Lecteur de la vidéo de présentation (Bunny Stream, iframe + protocole
 * player.js), partagé par la modale du hero et la page /visite-guidee.
 *
 * - La vidéo a une VOIX OFF : elle démarre au clic AVEC le son (le geste de
 *   l'utilisateur l'autorise ; embed autoplay=true, muted=false, et
 *   `allow="autoplay"` délègue l'autorisation à l'iframe). Si le navigateur
 *   force malgré tout le muet, le bouton son affiche l'état RÉEL (interrogé
 *   par `getMuted`) et un clic rétablit le son.
 * - Rien n'est chargé avant le clic : l'iframe n'est montée qu'au lancement.
 * - Écran de fin (événement `ended`) : bouton vers l'espace découverte et
 *   « Revoir la vidéo ».
 * - Suivi : `play` (début de lecture), paliers 25/50/75 % (une fois chacun par
 *   lecture), `complete`, `end_cta_click`.
 * - `embedUrl` null (GUID pas encore renseigné) : message « Vidéo bientôt
 *   disponible », sans rien casser.
 */

const ORIGINE_BUNNY = 'https://iframe.mediadelivery.net';

export type CtaFin = { href: string; label: string };

/** URL d'embed + paramètres de lecture (autoplay AVEC le son). */
export function urlLecture(embedUrl: string): string {
  try {
    const u = new URL(embedUrl);
    u.searchParams.set('autoplay', 'true');
    u.searchParams.set('muted', 'false');
    u.searchParams.set('preload', 'true');
    u.searchParams.set('responsive', 'true');
    return u.toString();
  } catch {
    return embedUrl;
  }
}

export function VideoBientotDisponible({ cta }: { cta?: CtaFin }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0F1733] px-6 text-center text-white">
      <p className="text-[1.15rem] font-black tracking-tight sm:text-[1.4rem]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        Vidéo bientôt disponible
      </p>
      <p className="max-w-md text-[13.5px] leading-relaxed text-white/75" style={{ fontFamily: "'Manrope', sans-serif" }}>
        La visite guidée de la plateforme est en cours de finalisation. En attendant, l’espace découverte gratuit
        vous permet de l’essayer vous-même.
      </p>
      {cta && (
        <Link
          href={cta.href}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-[13.5px] font-black tracking-tight text-[#8B0E22] transition-transform hover:scale-[1.03]"
        >
          {cta.label} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

export function LecteurVisiteGuidee({
  embedUrl,
  source,
  ctaFin,
  demarrerAuMontage,
  classeBoutonSon,
  affiche,
}: {
  embedUrl: string | null;
  source: SourceVideo;
  ctaFin: CtaFin;
  /** Modale : la lecture démarre dès l'ouverture (le clic vient d'avoir lieu). Page : grand bouton play d'abord. */
  demarrerAuMontage: boolean;
  classeBoutonSon?: string;
  /** Visuel d'attente avant le clic (page) ; à défaut, la capture de base, sans carte datée. */
  affiche?: ReactNode;
}) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [lance, setLance] = useState(demarrerAuMontage);
  const [muet, setMuet] = useState<boolean | null>(null);
  const [fin, setFin] = useState(false);
  const emis = useRef(new Set<EvenementVideo>());
  const lectureEnCours = useRef(false);

  const envoyer = useCallback((method: string, value?: unknown, listener?: string) => {
    frameRef.current?.contentWindow?.postMessage(
      JSON.stringify({ context: 'player.js', version: '0.0.11', method, value, listener }),
      ORIGINE_BUNNY,
    );
  }, []);

  const suivre = useCallback((ev: EvenementVideo) => {
    if (emis.current.has(ev)) return;
    emis.current.add(ev);
    envoyerEvenementVideo(ev, source);
  }, [source]);

  useEffect(() => {
    if (!lance || !embedUrl) return;
    const abonner = () => {
      for (const ev of ['play', 'pause', 'timeupdate', 'ended']) envoyer('addEventListener', ev);
      envoyer('getMuted', undefined, 'muet');
    };

    function onMessage(e: MessageEvent) {
      if (e.origin !== ORIGINE_BUNNY) return;
      let d: { context?: string; event?: string; value?: unknown };
      try { d = JSON.parse(typeof e.data === 'string' ? e.data : '{}'); } catch { return; }
      if (d?.context !== 'player.js') return;
      switch (d.event) {
        case 'ready':
          abonner();
          break;
        case 'getMuted':
          setMuet(d.value === true);
          break;
        case 'play':
          lectureEnCours.current = true;
          setFin(false);
          suivre('play');
          envoyer('getMuted', undefined, 'muet');
          break;
        case 'pause':
          lectureEnCours.current = false;
          break;
        case 'timeupdate': {
          const v = (d.value ?? {}) as { seconds?: number; duration?: number };
          // L'autoplay peut démarrer AVANT notre abonnement (course entre
          // « ready » et addEventListener) : l'événement « play » est alors
          // perdu, mais les « timeupdate » continuent — la lecture est comptée ici.
          if ((v.seconds ?? 0) > 0 && !emis.current.has('play')) {
            lectureEnCours.current = true;
            suivre('play');
          }
          if (v.duration && v.duration > 0) {
            const ratio = (v.seconds ?? 0) / v.duration;
            for (const p of paliersFranchis(ratio, emis.current)) suivre(p);
            if (ratio >= 0.985) suivre('complete');
          }
          break;
        }
        case 'ended':
          lectureEnCours.current = false;
          suivre('complete');
          setFin(true);
          break;
        default:
          break;
      }
    }

    window.addEventListener('message', onMessage);
    // Le lecteur peut être prêt avant l'écoute : on s'abonne aussi par sécurité.
    const t = setTimeout(abonner, 1500);
    // L'état du son peut changer sans événement (politique d'autoplay, touche
    // du lecteur Bunny) : on le relit régulièrement pendant la lecture.
    const sondage = setInterval(() => { if (lectureEnCours.current) envoyer('getMuted', undefined, 'muet'); }, 1500);
    return () => {
      window.removeEventListener('message', onMessage);
      clearTimeout(t);
      clearInterval(sondage);
    };
  }, [lance, embedUrl, envoyer, suivre]);

  const basculerSon = () => {
    if (muet) {
      envoyer('unmute');
      envoyer('setVolume', 100);
      envoyer('play');
      setMuet(false);
    } else {
      envoyer('mute');
      setMuet(true);
    }
    setTimeout(() => envoyer('getMuted', undefined, 'muet'), 400);
  };

  const revoir = () => {
    // Nouvelle lecture : les paliers et la fin se comptent à nouveau.
    emis.current = new Set();
    setFin(false);
    envoyer('setCurrentTime', 0);
    envoyer('play');
  };

  const lancer = () => {
    envoyerEvenementVideo('play_click', source);
    setLance(true);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      {!embedUrl ? (
        <VideoBientotDisponible cta={ctaFin} />
      ) : !lance ? (
        <button
          type="button"
          onClick={lancer}
          className="group absolute inset-0 block h-full w-full cursor-pointer"
          aria-label={`Lancer la visite guidée de la plateforme (${libelleDureeLong()}, avec le son)`}
        >
          <span
            className="absolute inset-0 flex items-center justify-center p-[4%] opacity-60 transition-opacity group-hover:opacity-45"
            style={{ background: 'radial-gradient(ellipse at center, #1C2A57 0%, #0B1230 75%)' }}
          >
            {affiche ?? (
              <span className="relative block h-full w-full">
                <Image src="/homepage/hero-plateforme-base.png" alt="" fill sizes="(max-width: 1280px) 100vw, 1280px" className="object-contain" />
              </span>
            )}
          </span>
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)] transition-transform duration-300 group-hover:scale-110 sm:h-24 sm:w-24">
              <Play className="ml-1.5 h-9 w-9 sm:h-11 sm:w-11" fill="#8B0E22" style={{ color: '#8B0E22' }} />
            </span>
            <span className="rounded-full bg-black/45 px-4 py-1.5 text-[13.5px] font-bold text-white backdrop-blur-sm" style={{ fontFamily: "'Manrope', sans-serif" }}>
              Voir la plateforme en vidéo · {libelleDureeLong()} · avec le son
            </span>
          </span>
        </button>
      ) : (
        <>
          <iframe
            ref={frameRef}
            src={urlLecture(embedUrl)}
            title="Visite guidée de la plateforme Major ECN"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />

          {/* Bouton son TRÈS visible : la visite est commentée en voix off. */}
          <button
            type="button"
            onClick={basculerSon}
            className={
              'absolute right-3 top-3 z-10 inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[13.5px] font-black tracking-tight shadow-[0_10px_30px_-8px_rgba(0,0,0,0.55)] transition-transform hover:scale-[1.04] sm:right-4 sm:top-4 sm:text-[14.5px] '
              + (muet ? 'bg-[#C0112E] text-white ring-4 ring-white/70' : 'bg-white text-[#0F1733]')
              + (classeBoutonSon ? ` ${classeBoutonSon}` : '')
            }
            aria-pressed={muet === true}
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {muet ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            {muet ? 'Activer le son' : 'Couper le son'}
          </button>

          {fin && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-[#0B1230]/88 px-6 text-center backdrop-blur-[2px]">
              <p className="text-[1.2rem] font-black tracking-tight text-white sm:text-[1.6rem]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Envie d’essayer par vous-même&nbsp;?
              </p>
              <Link
                href={ctaFin.href}
                onClick={() => suivre('end_cta_click')}
                className="inline-flex items-center gap-2.5 rounded-xl px-6 py-3.5 text-[14px] font-black tracking-tight text-white shadow-[0_16px_40px_-14px_rgba(192,17,46,0.8)] transition-transform hover:scale-[1.03] sm:text-[15px]"
                style={{ background: 'linear-gradient(90deg, #8B0E22 0%, #C0112E 100%)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {ctaFin.label} <ArrowRight className="h-5 w-5" />
              </Link>
              <button
                type="button"
                onClick={revoir}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[13.5px] font-bold text-white/85 underline-offset-4 hover:text-white hover:underline"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                <RotateCcw className="h-4 w-4" /> Revoir la vidéo
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

'use client';

/**
 * Tutoriel vidéo — l'UNIQUE fenêtre d'accueil de l'élève.
 *
 * Remplace le popup « Bienvenue », le tutoriel pas à pas, l'annonce du Parcours
 * du Major, les flèches sur le menu / l'aperçu / l'assistant et le popup
 * Découverte : une vidéo propre au profil de l'élève (formule, voie, Médecine
 * générale, « Mon planning ») qui ne montre que ce à quoi il a accès. Le texte
 * d'accueil réglé par l'administration (titre, accroche, introduction, « Par où
 * commencer ? ») s'affiche SOUS la vidéo, dans la même fenêtre.
 *
 * S'ouvre seule UNE fois par compte (profiles.tutoriel_video_vu_at, renseigné
 * dès l'ouverture ; clé locale en appoint), quand l'écran est libre
 * (complétion de profil, émargement… passent d'abord) ; se rouvre à tout moment
 * par le bouton « Tutoriel » de la barre du haut ou « Revoir le tutoriel ».
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AlertCircle, Compass, PlayCircle, X } from 'lucide-react';
import type { WelcomeConfig } from '@/lib/student/welcome';
import {
  declareStep, isReplayRequested, markStepActive, markStepDone, readFlag, whenStepTurnComes, writeFlag,
} from '@/lib/student/onboarding';
import { TUTORIEL_OPEN_EVENT, TUTORIEL_VU_KEY } from '@/lib/student/tutoriel-video';
import { marquerTutorielVu } from '@/app/(student)/tutoriel/actions';

const RED = '#E4002B';

export function TutorielVideo({
  embedUrl,
  welcome,
  replayOnly = false,
  dejaVu = false,
}: {
  /** Lecteur Bunny de la vidéo du profil ; `null` = pas de vidéo pour ce profil. */
  embedUrl: string | null;
  /** Texte d'accueil de l'administration (null : Découverte, ou désactivé pour la spécialité). */
  welcome: WelcomeConfig | null;
  /** Personnel (ou « se connecter en tant que ») : ne s'ouvre que sur demande (bouton), jamais seul. */
  replayOnly?: boolean;
  /** Déjà ouvert automatiquement une fois pour ce compte (sur n'importe quel appareil). */
  dejaVu?: boolean;
}) {
  const [ouvert, setOuvert] = useState(false);
  // Lecture automatique seulement après un geste de l'élève (bouton) : sinon le
  // navigateur bloquerait le son, et une vidéo muette n'explique rien.
  const [autoplay, setAutoplay] = useState(false);
  const fenetreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const surDemande = () => { setAutoplay(true); setOuvert(true); };
    window.addEventListener(TUTORIEL_OPEN_EVENT, surDemande);
    return () => window.removeEventListener(TUTORIEL_OPEN_EVENT, surDemande);
  }, []);

  // Ouverture automatique, une seule fois par compte (ou `?tutoriel=1`).
  useEffect(() => {
    if (!embedUrl && !welcome) return;
    const rejouer = isReplayRequested();
    const vaSOuvrir = rejouer || (!replayOnly && !dejaVu && !readFlag(TUTORIEL_VU_KEY));
    const retirer = declareStep('welcome', vaSOuvrir);
    if (!vaSOuvrir) return retirer;
    const annuler = whenStepTurnComes('welcome', () => {
      markStepActive('welcome');
      setOuvert(true);
      // Vu dès l'ouverture : ni un rechargement ni un autre appareil ne la rouvrent.
      if (!rejouer) { writeFlag(TUTORIEL_VU_KEY); void marquerTutorielVu().catch(() => {}); }
    });
    return () => { annuler(); retirer(); };
  }, [embedUrl, welcome, replayOnly, dejaVu]);

  const fermer = useCallback(() => {
    writeFlag(TUTORIEL_VU_KEY);
    markStepDone('welcome');
    setOuvert(false);
    setAutoplay(false);
    if (isReplayRequested()) {
      const url = new URL(window.location.href);
      url.searchParams.delete('tutoriel');
      window.history.replaceState(null, '', url.toString());
    }
  }, []);

  useEffect(() => {
    if (!ouvert) return;
    fenetreRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') fermer(); };
    window.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = overflow; };
  }, [ouvert, fermer]);

  if (!ouvert) return null;
  const src = embedUrl ? embedUrl.replace('autoplay=false', `autoplay=${autoplay ? 'true' : 'false'}`) : null;

  return (
    <div
      data-tutoriel-video
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#050b1c]/70 p-2 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutoriel-video-titre"
      onMouseDown={(e) => { if (e.target === e.currentTarget) fermer(); }}
    >
      <div ref={fenetreRef} tabIndex={-1} className="relative flex max-h-[94dvh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl outline-none">
        <div className="flex items-center gap-3 border-b border-(--color-border) px-4 py-3 sm:px-6">
          <Image src="/major-ecn-logo.png" alt="" width={56} height={40} className="h-9 w-auto shrink-0 object-contain" />
          <div className="min-w-0 flex-1">
            <h2 id="tutoriel-video-titre" className="truncate text-lg font-black tracking-tight text-(--color-ink) sm:text-xl">
              {welcome?.titre ?? 'Bienvenue sur Major ECN'}
            </h2>
            <p className="truncate text-[12.5px] font-medium text-(--color-ink-soft)">
              Votre tutoriel en vidéo : tout ce que votre formule vous ouvre, en quelques minutes.
            </p>
          </div>
          <button
            type="button"
            onClick={fermer}
            aria-label="Fermer le tutoriel"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-(--color-ink-muted) hover:bg-(--color-sand-100) focus-ring"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="min-h-0 overflow-y-auto">
          {src && (
            <div className="bg-[#050b1c]">
              <div className="relative mx-auto aspect-video w-full">
                <iframe
                  src={src}
                  title="Tutoriel vidéo Major ECN"
                  className="absolute inset-0 h-full w-full border-0"
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {welcome && (
            <div className="px-4 py-5 sm:px-8 sm:py-6">
              <p className="text-base font-bold text-(--color-ink)">{welcome.accroche}</p>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-(--color-ink-soft)">{welcome.intro}</p>

              {welcome.demarrageActif && welcome.specialites.length > 0 && (
                <section className="mt-5 rounded-2xl border border-(--color-border) bg-[#FAFBFE] p-4 sm:p-5">
                  <h3 className="flex items-center gap-2 text-base font-extrabold text-(--color-ink)">
                    <Compass className="h-4 w-4" style={{ color: RED }} />
                    Par où commencer ?
                  </h3>
                  <p className="mt-1.5 text-[12.5px] text-(--color-ink-soft)">{welcome.demarrageIntro}</p>
                  <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
                    {welcome.specialites.map((s, i) => (
                      <div key={s.label} className="flex flex-col items-center text-center">
                        <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl p-1.5" style={{ background: s.bg }}>
                          {s.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={s.image} alt="" className="h-full w-full object-contain" />
                          ) : (
                            <span className="text-lg font-black" style={{ color: s.color }}>{s.label.slice(0, 1).toUpperCase()}</span>
                          )}
                        </span>
                        <p className="mt-1.5 text-[10px] font-bold tabular-nums" style={{ color: s.color }}>{i + 1}</p>
                        <p className="text-[11px] font-bold leading-tight" style={{ color: s.color }}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 flex items-start gap-2 text-[12px] leading-relaxed text-(--color-ink-soft)">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#D97706]" />
                    Toutes les spécialités du programme doivent être travaillées : cet ordre vous aide simplement à bien organiser le début de votre préparation.
                  </p>
                </section>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-2 border-t border-(--color-border) px-4 py-3 sm:flex-row sm:justify-between sm:px-6">
          <p className="text-center text-[12px] leading-relaxed text-(--color-ink-muted)">
            Revoyez cette vidéo à tout moment :{' '}
            <span className="mx-0.5 inline-flex items-center gap-1 rounded-md bg-[#0F1F4D] px-1.5 py-0.5 align-middle text-[11px] font-bold text-white">
              <PlayCircle className="h-3 w-3" /> Tutoriel
            </span>{' '}
            en haut de l’écran.
          </p>
          <button
            type="button"
            onClick={fermer}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0F1F4D] px-5 py-2.5 text-sm font-extrabold text-white transition-transform hover:scale-[1.02] focus-ring"
          >
            Commencer ma préparation
          </button>
        </div>
      </div>
    </div>
  );
}

/** Bouton « Tutoriel » de la barre du haut : bien visible, il rouvre la vidéo. */
export function BoutonTutoriel() {
  return (
    <button
      type="button"
      data-tutoriel-bouton
      onClick={() => window.dispatchEvent(new Event(TUTORIEL_OPEN_EVENT))}
      className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-[#0F1F4D] px-2.5 text-[13px] font-bold text-white shadow-sm transition-transform hover:scale-[1.02] focus-ring sm:px-3"
      aria-label="Revoir le tutoriel vidéo"
    >
      <PlayCircle className="h-4 w-4" />
      <span>Tutoriel</span>
    </button>
  );
}

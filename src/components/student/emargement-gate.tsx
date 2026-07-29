'use client';

/**
 * Barrière d'émargement d'un cours.
 *
 * Dès que le lecteur vidéo franchit 20 % de la durée, l'étudiant DOIT signer :
 * la vidéo est mise en pause et une modale non fermable recouvre la page.
 *
 * Communication par évènements `window` plutôt que par props : la page vidéo
 * est un composant serveur, elle ne peut pas passer de fonction de rappel aux
 * lecteurs. Les lecteurs émettent `mecn:video-progress`, la barrière répond
 * par `mecn:video-pause`.
 *
 * L'état fait autorité côté serveur : si l'émargement est dû, `initialPending`
 * vaut true au chargement et la modale s'affiche immédiatement. Recharger,
 * couper le JavaScript en cours de route ou rouvrir le cours plus tard ne
 * permet donc pas de contourner la signature.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { PenLine, ShieldCheck } from 'lucide-react';
import { SignaturePad } from './signature-pad';
import {
  ATTENDANCE_THRESHOLD,
  VIDEO_PAUSE_EVENT,
  VIDEO_PROGRESS_EVENT,
  type VideoProgressDetail,
} from '@/lib/emargement';

export function EmargementGate({
  coursId,
  coursTitre,
  studentName,
  initialPending,
  initialSigned,
}: {
  coursId: string;
  coursTitre: string;
  studentName: string;
  /** Émargement déjà dû et non signé au chargement (source : base). */
  initialPending: boolean;
  /** Déjà signé : la barrière ne se déclenchera plus. */
  initialSigned: boolean;
}) {
  const [blocked, setBlocked] = useState(initialPending && !initialSigned);
  const [signed, setSigned] = useState(initialSigned);
  const [signature, setSignature] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestedRef = useRef(initialPending || initialSigned);

  const pauseVideo = useCallback(() => {
    window.dispatchEvent(new CustomEvent(VIDEO_PAUSE_EVENT));
  }, []);

  // Déclenchement au seuil.
  useEffect(() => {
    if (signed) return;

    async function onProgress(e: Event) {
      const detail = (e as CustomEvent<VideoProgressDetail>).detail;
      if (!detail || detail.coursId !== coursId) return;
      if (detail.ratio < ATTENDANCE_THRESHOLD) return;
      if (requestedRef.current) return;
      requestedRef.current = true;

      setBlocked(true);
      pauseVideo();
      try {
        await fetch('/api/emargement', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'require',
            coursId,
            watchedRatio: detail.ratio,
            watchedSeconds: detail.seconds,
          }),
        });
      } catch {
        // L'enregistrement réessaiera à la signature ; la barrière reste posée.
      }
    }

    window.addEventListener(VIDEO_PROGRESS_EVENT, onProgress);
    return () => window.removeEventListener(VIDEO_PROGRESS_EVENT, onProgress);
  }, [coursId, signed, pauseVideo]);

  // Tant que la barrière est levée, la vidéo reste en pause et la page ne
  // défile pas derrière la modale.
  useEffect(() => {
    if (!blocked) return;
    pauseVideo();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [blocked, pauseVideo]);

  async function submit() {
    if (!signature || busy) return;
    setBusy(true);
    setError(null);
    try {
      // Filet : si l'appel « require » a échoué (réseau), on le rejoue pour que
      // la ligne existe avant de tenter la signature.
      await fetch('/api/emargement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'require', coursId }),
      }).catch(() => null);

      const res = await fetch('/api/emargement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sign', coursId, signaturePng: signature }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Enregistrement impossible');
      setSigned(true);
      setBlocked(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Enregistrement impossible');
    } finally {
      setBusy(false);
    }
  }

  if (!blocked) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="emargement-titre"
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4"
      style={{ background: 'rgba(15,31,77,0.72)', backdropFilter: 'blur(3px)' }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
        <div className="flex items-start gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ background: '#EEF2FF', color: '#1E40AF' }}
          >
            <PenLine className="h-5 w-5" />
          </span>
          <div>
            <h2 id="emargement-titre" className="text-[17px] font-black" style={{ color: '#0F1F4D' }}>
              Émargement obligatoire
            </h2>
            <p className="mt-1 text-[13px] leading-snug" style={{ color: '#5B6478' }}>
              Vous avez commencé <strong>{coursTitre}</strong>. La réglementation de la
              formation professionnelle impose de signer votre feuille d’émargement pour
              attester de votre participation, même partielle.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl px-3.5 py-2.5" style={{ background: '#F7F9FC' }}>
          <p className="text-[12px]" style={{ color: '#5B6478' }}>
            Signataire · <strong style={{ color: '#0F1F4D' }}>{studentName}</strong>
          </p>
          <p className="text-[12px]" style={{ color: '#5B6478' }}>
            Date · <strong style={{ color: '#0F1F4D' }}>
              {new Date().toLocaleDateString('fr-FR', {
                weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
              })}
            </strong>
          </p>
        </div>

        <div className="mt-4">
          <SignaturePad onChange={setSignature} disabled={busy} />
        </div>

        {error && (
          <p className="mt-2 text-[12.5px] font-semibold" style={{ color: '#C0112E' }}>
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={!signature || busy}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-[14px] font-bold text-white transition-opacity disabled:opacity-40"
          style={{ background: '#1E40AF' }}
        >
          <ShieldCheck className="h-4 w-4" />
          {busy ? 'Enregistrement…' : 'Valider mon émargement'}
        </button>
        <p className="mt-2 text-center text-[11.5px]" style={{ color: '#98A2B3' }}>
          La lecture reprendra une fois votre signature enregistrée.
        </p>
      </div>
    </div>
  );
}

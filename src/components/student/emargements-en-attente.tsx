'use client';

/**
 * Émargements en attente — fenêtre obligatoire à l'ouverture de la plateforme.
 *
 * Toute vidéo visionnée (vidéo du cours ou séance approfondie) doit avoir sa
 * feuille d'émargement signée. La barrière du lecteur (`EmargementGate`) la
 * réclame au seuil de 20 %, mais un élève pouvait jusqu'ici quitter la vidéo
 * sans signer (plein écran, onglet fermé…) : la feuille restait « due » en base
 * sans que rien ne le lui rappelle hors de cette vidéo (02/10/2026).
 *
 * Désormais, à chaque chargement de l'espace élève, toutes les feuilles dues
 * (`course_attendances` sans `signed_at`) sont présentées l'une après l'autre,
 * dans une fenêtre non fermable : une signature PAR vidéo, horodatée au moment
 * où elle est donnée (`/api/emargement`, action `sign` — la même route que la
 * barrière du lecteur, qui n'écrase jamais une signature existante).
 */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PenLine, ShieldCheck } from 'lucide-react';
import { SignaturePad } from './signature-pad';
import { fetchAvecJetonFrais } from '@/lib/auth/fresh-token';
import { EMARGEMENT_SIGNE_EVENT, type EmargementSigneDetail } from '@/lib/emargement';

export type FeuilleEnAttente = {
  coursId: string;
  kind: 'video' | 'seance';
  /** Séance émargée ; null = feuille à l'item (antérieure au 05/10/2026). */
  videoId: string | null;
  videoTitre: string | null;
  coursTitre: string;
  college: string | null;
};

const LIBELLE_KIND: Record<FeuilleEnAttente['kind'], string> = {
  video: 'Vidéo du cours',
  seance: 'Séance approfondie',
};

export function EmargementsEnAttente({
  feuilles,
  studentName,
}: {
  feuilles: FeuilleEnAttente[];
  studentName: string;
}) {
  const router = useRouter();
  const [restantes, setRestantes] = useState(feuilles);
  const [signature, setSignature] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const total = feuilles.length;

  if (restantes.length === 0) return null;
  const f = restantes[0];
  const rang = total - restantes.length + 1;

  async function valider() {
    if (!signature || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetchAvecJetonFrais('/api/emargement', {
        action: 'sign', coursId: f.coursId, kind: f.kind, videoId: f.videoId ?? undefined, signaturePng: signature,
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(
          res.status === 401
            ? 'Votre session a expiré. Rechargez la page puis signez à nouveau.'
            : json.error ?? 'Enregistrement impossible',
        );
      }
      // La barrière du lecteur, si la vidéo est ouverte derrière, se lève aussi.
      window.dispatchEvent(new CustomEvent<EmargementSigneDetail>(EMARGEMENT_SIGNE_EVENT, {
        detail: { coursId: f.coursId, kind: f.kind, videoId: f.videoId },
      }));
      setSignature(null);
      const suite = restantes.slice(1);
      setRestantes(suite);
      if (suite.length === 0) router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Enregistrement impossible');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="emargements-attente-titre"
      className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto p-4"
      style={{ background: 'rgba(15,31,77,0.72)', backdropFilter: 'blur(3px)' }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
        <div className="flex items-start gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ background: '#FEF3C7', color: '#B45309' }}
          >
            <PenLine className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 id="emargements-attente-titre" className="text-[17px] font-black" style={{ color: '#0F1F4D' }}>
              Émargement obligatoire
              {total > 1 && (
                <span className="ml-2 align-middle text-[12px] font-bold" style={{ color: '#B45309' }}>
                  {rang} / {total}
                </span>
              )}
            </h2>
            <p className="mt-1 text-[13px] leading-snug" style={{ color: '#5B6478' }}>
              {total > 1
                ? 'Vous avez visionné des vidéos sans signer leur feuille d’émargement. '
                : 'Vous avez visionné une vidéo sans signer sa feuille d’émargement. '}
              La réglementation de la formation professionnelle impose une signature pour
              chaque séance suivie, même partiellement.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl px-3.5 py-2.5" style={{ background: '#F7F9FC' }}>
          <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#98A2B3' }}>
            {LIBELLE_KIND[f.kind]}
          </p>
          <p className="text-[14px] font-extrabold" style={{ color: '#0F1F4D' }}>
            {f.coursTitre}
            {f.college && <span className="font-semibold" style={{ color: '#5B6478' }}> · {f.college}</span>}
          </p>
          {f.videoTitre && (
            <p className="text-[13px] font-semibold" style={{ color: '#0F1F4D' }}>
              Séance : {f.videoTitre}
            </p>
          )}
          <p className="mt-1 text-[12px]" style={{ color: '#5B6478' }}>
            Signataire · <strong style={{ color: '#0F1F4D' }}>{studentName}</strong>
          </p>
          <p className="text-[12px]" style={{ color: '#5B6478' }}>
            Date de signature · <strong style={{ color: '#0F1F4D' }}>
              {new Date().toLocaleDateString('fr-FR', {
                weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
              })}
            </strong>
          </p>
        </div>

        <div className="mt-4">
          {/* `key` : un pavé vierge pour chaque feuille. */}
          <SignaturePad key={`${f.coursId}:${f.kind}:${f.videoId ?? ''}`} onChange={setSignature} disabled={busy} />
        </div>

        {error && (
          <p className="mt-2 text-[12.5px] font-semibold" style={{ color: '#C0112E' }}>
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={valider}
          disabled={!signature || busy}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-[14px] font-bold text-white transition-opacity disabled:opacity-40"
          style={{ background: '#1E40AF' }}
        >
          <ShieldCheck className="h-4 w-4" />
          {busy
            ? 'Enregistrement…'
            : restantes.length > 1 ? 'Valider et passer à la suivante' : 'Valider mon émargement'}
        </button>
        <p className="mt-2 text-center text-[11.5px]" style={{ color: '#98A2B3' }}>
          L’accès à la plateforme reprendra une fois {total > 1 ? 'toutes vos feuilles signées' : 'votre feuille signée'}.
        </p>
      </div>
    </div>
  );
}

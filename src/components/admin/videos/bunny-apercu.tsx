'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { extractBunnyVideoId } from '@/lib/bunny-link';
import { apercuLienBunnyAction, type ApercuBunny } from '@/app/admin/videos/actions';
import { formaterDuree } from '@/lib/videos/bibliotheque';

type Etat =
  | { phase: 'chargement'; videoId: string }
  | { phase: 'pret'; apercu: ApercuBunny }
  | { phase: 'erreur'; videoId: string; message: string };

/**
 * Petit aperçu du lien Bunny collé (création et crayon d'édition) : le lecteur
 * que verront les élèves, avec le titre et la durée du fichier sur bunny.net,
 * pour vérifier d'un coup d'œil que c'est la bonne vidéo AVANT d'enregistrer.
 *
 * Rien ne s'affiche tant que le champ est vide ; un lien non reconnu donne un
 * message immédiat (même parseur que le serveur, `extractBunnyVideoId`).
 */
export function BunnyApercu({ lien }: { lien: string }) {
  const saisie = lien.trim();
  const videoId = saisie ? extractBunnyVideoId(saisie) : null;
  const [etat, setEtat] = useState<Etat | null>(null);

  useEffect(() => {
    if (!videoId) return;
    let annule = false;
    // Léger délai : on attend la fin de la frappe ou du collage.
    const t = setTimeout(() => {
      setEtat({ phase: 'chargement', videoId });
      apercuLienBunnyAction(saisie)
        .then((res) => {
          if (annule) return;
          if ('error' in res) setEtat({ phase: 'erreur', videoId, message: res.error });
          else setEtat({ phase: 'pret', apercu: res });
        })
        .catch(() => {
          if (!annule) setEtat({ phase: 'erreur', videoId, message: 'Aperçu indisponible (connexion ?). Le lien sera vérifié à l’enregistrement.' });
        });
    }, 350);
    return () => { annule = true; clearTimeout(t); };
    // `saisie` suit `videoId` : un même identifiant n'est pas revérifié à chaque frappe.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  if (!saisie) return null;

  if (!videoId) {
    return (
      <p role="alert" className="mt-1.5 flex items-start gap-1.5 text-[11.5px] font-medium text-red-600">
        <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" />
        Lien non reconnu : collez le lien de la vidéo depuis bunny.net (Stream), par exemple
        https://iframe.mediadelivery.net/play/691475/…, ou son identifiant.
      </p>
    );
  }

  const courant = etat && (etat.phase === 'pret' ? etat.apercu.videoId : etat.videoId) === videoId ? etat : null;

  return (
    <div className="mt-2 w-full max-w-[320px]" data-testid="bunny-apercu">
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">
        Aperçu de la vidéo
      </p>
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-(--color-border) bg-[#0F0A1F]">
        {courant?.phase === 'pret' && !courant.apercu.introuvable ? (
          <iframe
            src={courant.apercu.embedUrl}
            title={courant.apercu.titre ?? 'Aperçu de la vidéo Bunny'}
            loading="lazy"
            allow="accelerometer; gyroscope; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center px-4 text-center text-[11.5px] text-white/80">
            {courant?.phase === 'pret'
              ? 'Aucune vidéo à cette adresse'
              : courant?.phase === 'erreur'
                ? 'Aperçu indisponible'
                : <Loader2 className="h-5 w-5 animate-spin text-white/70" aria-label="Chargement de l’aperçu" />}
          </div>
        )}
      </div>

      {courant?.phase === 'pret' && !courant.apercu.introuvable && (
        <p className="mt-1.5 flex items-start gap-1.5 text-[11.5px] text-(--color-ink-soft)">
          <CheckCircle2 className="mt-px h-3.5 w-3.5 shrink-0 text-emerald-600" />
          <span className="min-w-0">
            <span className="block truncate font-semibold text-(--color-ink)" title={courant.apercu.titre ?? undefined}>
              {courant.apercu.titre ?? 'Vidéo trouvée sur bunny.net'}
            </span>
            {courant.apercu.dureeSecondes
              ? <span>Durée : {formaterDuree(courant.apercu.dureeSecondes)}</span>
              : <span>Durée inconnue (encodage peut-être en cours)</span>}
          </span>
        </p>
      )}
      {courant?.phase === 'pret' && courant.apercu.introuvable && (
        <p role="alert" className="mt-1.5 flex items-start gap-1.5 text-[11.5px] font-medium text-red-600">
          <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" />
          <span>
            bunny.net ne trouve pas cette vidéo dans la bibliothèque {courant.apercu.bibliotheque} de la plateforme :
            les élèves verraient une erreur. Vérifiez le lien.
            {courant.apercu.autreBibliotheque && (
              <> Le lien collé vient de la bibliothèque {courant.apercu.autreBibliotheque}.</>
            )}
          </span>
        </p>
      )}
      {courant?.phase === 'erreur' && (
        <p role="alert" className="mt-1.5 text-[11.5px] font-medium text-amber-700">{courant.message}</p>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { CalendarClock, Maximize2, Video } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { bunnyMiniatureUrl } from '@/lib/bunny-link';
import { BunnyApercu } from './bunny-apercu';

/**
 * Miniature d'une vidéo déjà déposée, dans la liste de la bibliothèque : le
 * monteur reconnaît « Séance 1 » d'un coup d'œil, comme au moment du dépôt.
 * Un clic l'agrandit, avec le lecteur que voient les élèves pour vérifier le
 * contenu. Sans vidéo (séance à venir) ou si bunny.net n'a pas encore généré
 * l'image (encodage en cours), on garde l'icône d'origine.
 */
export function MiniatureVideo({
  videoId,
  titre,
  aVenir,
}: {
  videoId: string | null;
  titre: string;
  aVenir?: boolean;
}) {
  const url = videoId ? bunnyMiniatureUrl(videoId) : null;
  const [echec, setEchec] = useState<string | null>(null);
  const [ouvert, setOuvert] = useState(false);
  const [lecteur, setLecteur] = useState(false);

  if (!url || echec === url) {
    return (
      <span className="flex h-[45px] w-20 shrink-0 items-center justify-center rounded-[8px] border border-(--color-border) bg-(--color-sand-100)">
        {aVenir
          ? <CalendarClock className="h-4 w-4 text-[#B26A00]" />
          : <Video className="h-4 w-4 text-[#7C3AED]" />}
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOuvert(true)}
        title="Agrandir la miniature"
        aria-label={`Voir la miniature de « ${titre} »`}
        className="group relative h-[45px] w-20 shrink-0 overflow-hidden rounded-[8px] border border-(--color-border) bg-[#0F0A1F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]/50"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- CDN Bunny, hors next/image */}
        <img
          src={url}
          alt=""
          loading="lazy"
          referrerPolicy="origin"
          onError={() => setEchec(url)}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition group-hover:bg-black/35 group-hover:opacity-100">
          <Maximize2 className="h-3.5 w-3.5" />
        </span>
      </button>

      <Dialog open={ouvert} onOpenChange={(o) => { setOuvert(o); if (!o) setLecteur(false); }}>
        <DialogContent className="max-w-2xl">
          <DialogTitle className="pr-8 text-base font-semibold text-(--color-ink)">{titre}</DialogTitle>
          {/* eslint-disable-next-line @next/next/no-img-element -- CDN Bunny, hors next/image */}
          <img
            src={url}
            alt={`Miniature de « ${titre} »`}
            referrerPolicy="origin"
            className="aspect-video w-full rounded-xl border border-(--color-border) bg-[#0F0A1F] object-cover"
          />
          {videoId && (
            // Le lecteur (et sa vérification sur bunny.net) ne se charge qu'à la demande.
            <details className="text-sm" onToggle={(e) => setLecteur(e.currentTarget.open)}>
              <summary className="cursor-pointer font-semibold text-[#7C3AED]">Lire la vidéo</summary>
              {lecteur && <BunnyApercu lien={videoId} />}
            </details>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

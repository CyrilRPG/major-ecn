'use client';

/**
 * Affiche les popups vidéo d'un item à l'accueil : la première non vue s'ouvre
 * en modale (vidéo mp4 + croix de fermeture). À la fermeture, on l'enregistre
 * comme « vue » (elle ne réapparaîtra plus) et on passe à la suivante.
 */
import { useState } from 'react';
import { X } from 'lucide-react';

export type ItemPopup = { id: string; title: string | null; videoUrl: string };

export function ItemPopups({ popups }: { popups: ItemPopup[] }) {
  const [index, setIndex] = useState(0);
  const current = popups[index];
  if (!current) return null;

  async function close() {
    const id = current.id;
    // best-effort : marquer comme vue côté serveur
    fetch(`/api/popups/${id}/viewed`, { method: 'POST' }).catch(() => {});
    setIndex((i) => i + 1);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-black shadow-2xl">
        <button
          type="button"
          onClick={close}
          aria-label="Fermer"
          className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
        >
          <X className="h-5 w-5" />
        </button>
        {current.title && (
          <div className="absolute left-0 right-12 top-0 z-[5] bg-gradient-to-b from-black/70 to-transparent px-4 py-2.5 text-sm font-bold text-white">
            {current.title}
          </div>
        )}
        <video
          key={current.id}
          src={current.videoUrl}
          controls
          autoPlay
          className="max-h-[80vh] w-full bg-black"
        />
      </div>
    </div>
  );
}

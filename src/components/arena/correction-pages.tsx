'use client';

import { useState } from 'react';
import { ARENA, BODY, DISPLAY } from './tokens';

/**
 * Pages d'un corrigé PDF (fourni ou généré) dans la visionneuse intégrée :
 * chaque page est une image servie par `/api/arena/corrections/<manche>/<k>`
 * — session du participant vérifiée, filigrane nominatif brûlé dans l'image,
 * aucun cache, aucun fichier. Chargement paresseux page par page ; l'image
 * n'est ni glissable ni ouvrable dans un nouvel onglet.
 */
export function CorrectionPages({ roundId, pages }: { roundId: string; pages: number }) {
  const [failed, setFailed] = useState<number[]>([]);
  return (
    <div className="ae-correction-pages">
      <style>{`
        .ae-correction-pages { display: flex; flex-direction: column; gap: 14px; }
        .ae-correction-page { position: relative; border-radius: 12px; overflow: hidden; background: #fff; box-shadow: 0 24px 48px -32px rgba(0,0,0,.95), inset 0 0 0 1px rgba(255,255,255,.08); }
        .ae-correction-page img { display: block; width: 100%; height: auto; -webkit-user-drag: none; user-select: none; pointer-events: none; }
        .ae-correction-page-num { position: absolute; right: 10px; bottom: 10px; padding: 3px 9px; border-radius: 999px; font: 600 11px/1.5 ${DISPLAY}; letter-spacing: .12em; color: #F2F3F5; background: rgba(11,15,20,.72); }
      `}</style>
      <p className="text-[12px] uppercase tracking-[0.2em]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>{pages} page{pages > 1 ? 's' : ''}</p>
      {Array.from({ length: pages }, (_, i) => i + 1).map((k) => (
        <div key={k} className="ae-correction-page" style={{ aspectRatio: '595 / 842' }}>
          {failed.includes(k) ? (
            <p className="flex h-full items-center justify-center px-6 text-center text-[13px]" style={{ color: '#14254E', fontFamily: BODY }}>Cette page n’a pas pu être chargée. Rechargez la page pour réessayer.</p>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- image protégée servie sans cache par une route authentifiée : pas d’optimiseur.
            <img
              src={`/api/arena/corrections/${roundId}/${k}`}
              alt={`Correction détaillée, page ${k} sur ${pages}`}
              loading={k <= 2 ? 'eager' : 'lazy'}
              decoding="async"
              draggable={false}
              onError={() => setFailed((f) => (f.includes(k) ? f : [...f, k]))}
            />
          )}
          <span className="ae-correction-page-num" aria-hidden>{k} / {pages}</span>
        </div>
      ))}
    </div>
  );
}

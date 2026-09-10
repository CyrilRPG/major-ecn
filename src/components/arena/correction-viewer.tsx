'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { ShieldCheck } from 'lucide-react';
import { watermarkDataUri } from '@/lib/arena/watermark';
import { ARENA, BODY } from './tokens';

/**
 * Visionneuse intégrée de la « Correction détaillée » (EVC Arena, §12).
 *
 * La correction est rendue en HTML natif dans la page (responsive, aucun
 * fichier). Cette enveloppe ajoute, pour les participants gratuits :
 *  - un filigrane dynamique répété en diagonale (pseudo/nom · id court ·
 *    EVC Arena – Major ECN), en surcouche non interactive ;
 *  - la désactivation du copier-coller (`user-select: none`, `copy`/`cut`
 *    bloqués), du glisser-déposer et du menu contextuel ;
 *  - la neutralisation de l'impression (`@media print { display: none }`,
 *    Ctrl/Cmd+P et Ctrl/Cmd+S interceptés, mention affichée à la place).
 *
 * Ce sont des protections de confort, pas une DRM : le contenu reste lisible
 * à l'écran ; le filigrane nominatif rend une capture traçable.
 */
export function CorrectionViewer({ watermark, children }: { watermark: string; children: ReactNode }) {
  const [blocked, setBlocked] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const k = e.key.toLowerCase();
      if (k === 'p' || k === 's') {
        e.preventDefault();
        setBlocked(k === 'p' ? 'L’impression est désactivée : la correction reste consultable dans votre espace EVC Arena.' : 'L’enregistrement est désactivé : la correction reste consultable dans votre espace EVC Arena.');
      }
    };
    const onBeforePrint = () => setBlocked('L’impression est désactivée : la correction reste consultable dans votre espace EVC Arena.');
    window.addEventListener('keydown', onKey);
    window.addEventListener('beforeprint', onBeforePrint);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('beforeprint', onBeforePrint);
    };
  }, []);

  useEffect(() => {
    if (!blocked) return;
    const id = window.setTimeout(() => setBlocked(null), 4000);
    return () => window.clearTimeout(id);
  }, [blocked]);

  const stop = (e: { preventDefault: () => void }) => e.preventDefault();

  return (
    <div
      className="ae-correction-viewer"
      data-testid="correction-viewer"
      onContextMenu={stop}
      onCopy={stop}
      onCut={stop}
      onDragStart={stop}
    >
      <style>{`
        .ae-correction-viewer { position: relative; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; }
        .ae-correction-viewer input, .ae-correction-viewer textarea, .ae-correction-viewer select { -webkit-user-select: text; user-select: text; }
        .ae-correction-viewer img { -webkit-user-drag: none; pointer-events: auto; }
        .ae-correction-watermark { position: absolute; inset: 0; z-index: 3; pointer-events: none; background-repeat: repeat; background-position: 0 0; }
        .ae-correction-print-notice { display: none; }
        @media print {
          .ae-correction-viewer { display: none !important; }
          .ae-correction-print-notice { display: block !important; padding: 24px; font: 16px/1.5 Arial, sans-serif; color: #111; }
        }
      `}</style>
      <div className="ae-correction-watermark" aria-hidden style={{ backgroundImage: watermarkDataUri(watermark) }} />
      {blocked && (
        <p
          role="status"
          className="fixed bottom-5 left-1/2 z-50 max-w-[92vw] -translate-x-1/2 rounded-xl px-4 py-3 text-[13px] font-semibold shadow-2xl"
          style={{ background: ARENA.red, color: '#fff', fontFamily: BODY }}
        >
          {blocked}
        </p>
      )}
      <p className="mb-6 flex items-start gap-2 rounded-xl px-4 py-3 text-[12.5px] leading-relaxed" style={{ background: 'rgba(255,255,255,0.04)', boxShadow: `inset 0 0 0 1px ${ARENA.line}`, color: ARENA.textSoft, fontFamily: BODY }}>
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" style={{ color: ARENA.redSoft }} aria-hidden />
        <span>
          Document personnel, associé à votre compte ({watermark.split(' · ').slice(0, 2).join(' · ')}). Il reste consultable à tout moment dans votre espace EVC Arena ; il n’est ni téléchargeable, ni imprimable, et sa diffusion est interdite.
        </span>
      </p>
      {children}
    </div>
  );
}

/** Mention imprimée à la place de la correction (feuille vide sinon). */
export function CorrectionPrintNotice() {
  return <p className="ae-correction-print-notice">Cette correction détaillée EVC Arena – Major ECN est un document personnel consultable uniquement dans l’espace EVC Arena. L’impression est désactivée.</p>;
}

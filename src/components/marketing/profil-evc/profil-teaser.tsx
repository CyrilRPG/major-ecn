'use client';

import { X, Check, ArrowRight, BarChart3 } from 'lucide-react';

const RED = '#C0112E';
const RED_DEEP = '#8B0E22';
const NAVY = '#0F1F4D';
const INK_SOFT = '#52607A';

const BULLETS = [
  'Évaluez votre niveau actuel',
  'Identifiez vos priorités',
  'Recevez des recommandations adaptées',
];

/**
 * Teaser léger « Avant de partir… » affiché sur déclenchement intelligent
 * (scroll ~55 % ou exit-intent), plutôt que le popup complet — moins intrusif.
 * Le CTA lance le diagnostic complet.
 */
export function ProfilTeaser({ onStart, onClose }: { onStart: () => void; onClose: () => void }) {
  return (
    <div
      className="relative my-auto w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer"
        className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="h-[3px] w-full" style={{ background: 'linear-gradient(90deg,#6B1A2A,#C0112E,#E8742C)' }} />

      <div className="px-6 py-7 sm:px-8">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-white"
          style={{ background: `linear-gradient(100deg,#6B0F2A,#8B1550 45%,#7A1FA2)` }}
        >
          <BarChart3 className="h-3 w-3" /> Profil EVC gratuit
        </span>

        <h3 className="mt-4 text-[24px] font-black leading-tight sm:text-[27px]" style={{ color: NAVY }}>
          Avant de partir…
        </h3>
        <p className="mt-2 text-[14px] leading-relaxed" style={{ color: INK_SOFT }}>
          Découvrez gratuitement votre <strong style={{ color: NAVY }}>Profil EVC personnalisé</strong> en{' '}
          <strong style={{ color: NAVY }}>3 minutes</strong>.
        </p>

        <ul className="mt-4 space-y-2.5">
          {BULLETS.map((b) => (
            <li key={b} className="flex items-start gap-2.5 text-[13.5px] font-semibold" style={{ color: NAVY }}>
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ background: '#E7F6EC' }}>
                <Check className="h-3.5 w-3.5" style={{ color: '#16793C' }} strokeWidth={3} />
              </span>
              {b}
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={onStart}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-[15px] font-extrabold text-white shadow-[0_16px_38px_-14px_rgba(139,14,34,0.6)] transition-transform hover:scale-[1.02]"
          style={{ background: `linear-gradient(90deg,${RED_DEEP},${RED})` }}
        >
          Commencer mon Profil EVC <ArrowRight className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={onClose}
          className="mx-auto mt-3 block text-[12px] font-semibold text-gray-400 transition-colors hover:text-gray-600"
        >
          Plus tard
        </button>
      </div>
    </div>
  );
}

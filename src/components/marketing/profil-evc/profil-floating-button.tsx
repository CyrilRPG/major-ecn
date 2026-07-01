'use client';

import { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';

/**
 * Bouton flottant « Profil EVC » (diagnostic gratuit).
 * Empilé au-dessus du bouton « Guide EVC ». Ouvre le popup diagnostic via
 * l'événement `open-profil-popup`.
 */
export function ProfilFloatingButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 2200);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
@keyframes profil-glow {
  0%, 82%, 100% { box-shadow: 0 8px 24px rgba(107,15,42,0.28); filter: brightness(1); }
  88% { box-shadow: 0 8px 32px rgba(122,31,162,0.5), 0 0 26px rgba(192,17,46,0.4); filter: brightness(1.12); }
}
.profil-fab { animation: profil-glow 9s ease-in-out infinite; }
.profil-fab:hover { animation: none; filter: brightness(1.15); box-shadow: 0 8px 32px rgba(122,31,162,0.55), 0 0 28px rgba(192,17,46,0.4); transform: translateY(-2px); }
.profil-fab:active { transform: translateY(0) scale(0.97); }
`,
        }}
      />
      <button
        type="button"
        onClick={() => window.dispatchEvent(new CustomEvent('open-profil-popup'))}
        aria-label="Découvrir mon Profil EVC gratuitement"
        className="profil-fab fixed z-[9990] flex cursor-pointer items-center border-0 text-white transition-all duration-200 bottom-[84px] right-5 h-[56px] w-[180px] gap-2.5 rounded-[50px] px-4 sm:bottom-[96px] sm:right-6 sm:h-[64px] sm:w-[220px] sm:gap-3 sm:px-5"
        style={{ background: 'linear-gradient(100deg, #6B0F2A 0%, #8B1550 45%, #7A1FA2 100%)' }}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/12 sm:h-10 sm:w-10">
          <BarChart3 className="h-[20px] w-[20px] text-white sm:h-[24px] sm:w-[24px]" strokeWidth={2.2} />
        </span>
        <span className="whitespace-nowrap text-[14px] font-extrabold leading-none tracking-[-0.01em] text-white sm:text-[16px]">
          Profil EVC
        </span>
        <span
          className="ml-auto shrink-0 rounded-full px-[8px] py-[3px] text-[9px] font-black uppercase tracking-wider sm:px-[10px] sm:py-[4px] sm:text-[10px]"
          style={{ background: '#FFC107', color: '#3A1D00' }}
        >
          Gratuit
        </span>
      </button>
    </>
  );
}

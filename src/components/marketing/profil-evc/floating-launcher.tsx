'use client';

import { useEffect, useState } from 'react';
import { BarChart3, BookOpen, Gift, X } from 'lucide-react';

/**
 * Lanceur flottant unique « Ressources gratuites ».
 *
 * Remplace les deux boutons flottants empilés (Guide + Profil) par un seul
 * bouton compact façon speed-dial : au clic, il déploie les deux options.
 * Moins d'encombrement, les deux parcours restent accessibles.
 */
export function FloatingLauncher() {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  const openProfil = () => { window.dispatchEvent(new CustomEvent('open-profil-popup')); setOpen(false); };
  const openGuide = () => { window.dispatchEvent(new CustomEvent('open-guide-popup')); setOpen(false); };

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
@keyframes launcher-glow {
  0%, 82%, 100% { box-shadow: 0 8px 24px rgba(107,15,42,0.3); }
  88% { box-shadow: 0 8px 34px rgba(122,31,162,0.55), 0 0 26px rgba(192,17,46,0.4); }
}
.launcher-fab { animation: launcher-glow 9s ease-in-out infinite; }
.launcher-fab:hover { animation: none; filter: brightness(1.1); transform: translateY(-2px); box-shadow: 0 8px 34px rgba(122,31,162,0.6), 0 0 28px rgba(192,17,46,0.4); }
.launcher-fab:active { transform: scale(0.95); }
`,
        }}
      />

      {/* Backdrop translucide quand déployé (clic = fermer) */}
      {open && (
        <div
          className="fixed inset-0 z-[9988] bg-black/10 backdrop-blur-[1px]"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <div className="fixed bottom-5 right-5 z-[9990] flex flex-col items-end gap-2.5 sm:bottom-6 sm:right-6">
        {/* Options déployées */}
        <div className="flex flex-col items-end gap-2.5">
          <OptionPill
            label="Profil EVC gratuit"
            Icon={BarChart3}
            gradient="linear-gradient(100deg, #6B0F2A 0%, #8B1550 45%, #7A1FA2 100%)"
            open={open}
            delay={60}
            onClick={openProfil}
          />
          <OptionPill
            label="Guide EVC gratuit"
            Icon={BookOpen}
            gradient="linear-gradient(135deg, #880F2E 0%, #5B21B6 100%)"
            open={open}
            delay={0}
            onClick={openGuide}
          />
        </div>

        {/* Déclencheur */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Fermer' : 'Ressources gratuites'}
          aria-expanded={open}
          className="launcher-fab relative flex h-[58px] items-center gap-2.5 rounded-[50px] border-0 px-4 text-white transition-all duration-200 sm:h-[62px] sm:px-5"
          style={{ background: 'linear-gradient(100deg, #6B0F2A 0%, #8B1550 45%, #7A1FA2 100%)' }}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/14 sm:h-10 sm:w-10">
            {open ? <X className="h-5 w-5" strokeWidth={2.4} /> : <Gift className="h-5 w-5" strokeWidth={2.2} />}
          </span>
          <span className="whitespace-nowrap pr-1 text-[14px] font-extrabold leading-none tracking-[-0.01em] sm:text-[15px]">
            {open ? 'Fermer' : 'Offerts'}
          </span>
          {!open && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-black" style={{ background: '#FFC107', color: '#3A1D00' }}>
              2
            </span>
          )}
        </button>
      </div>
    </>
  );
}

function OptionPill({
  label, Icon, gradient, open, delay, onClick,
}: {
  label: string;
  Icon: typeof BarChart3;
  gradient: string;
  open: boolean;
  delay: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      tabIndex={open ? 0 : -1}
      className="flex h-[52px] items-center gap-2.5 rounded-[50px] border-0 px-3.5 text-white shadow-lg transition-all duration-300 hover:brightness-110 sm:h-[56px] sm:px-4"
      style={{
        background: gradient,
        opacity: open ? 1 : 0,
        transform: open ? 'translateY(0) scale(1)' : 'translateY(14px) scale(0.9)',
        pointerEvents: open ? 'auto' : 'none',
        transitionDelay: `${open ? delay : 0}ms`,
      }}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/14 sm:h-9 sm:w-9">
        <Icon className="h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={2.2} />
      </span>
      <span className="whitespace-nowrap text-[13.5px] font-extrabold leading-none tracking-[-0.01em] sm:text-[14.5px]">
        {label}
      </span>
      <span className="rounded-full px-[8px] py-[3px] text-[9px] font-black uppercase tracking-wider sm:text-[10px]" style={{ background: '#FFC107', color: '#3A1D00' }}>
        Gratuit
      </span>
    </button>
  );
}

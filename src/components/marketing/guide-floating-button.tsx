'use client';

import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';

export function GuideFloatingButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  function handleClick() {
    window.dispatchEvent(new CustomEvent('open-guide-popup'));
  }

  if (!visible) return null;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
@keyframes guide-glow {
  0%, 82%, 100% {
    box-shadow: 0 8px 24px rgba(139,15,46,0.25);
    filter: brightness(1);
  }
  88% {
    box-shadow: 0 8px 32px rgba(139,15,46,0.5), 0 0 28px rgba(91,33,182,0.4);
    filter: brightness(1.15);
  }
  94% {
    box-shadow: 0 8px 24px rgba(139,15,46,0.25);
    filter: brightness(1);
  }
}
.guide-fab {
  animation: guide-glow 9s ease-in-out infinite;
}
.guide-fab:hover {
  animation: none;
  filter: brightness(1.18);
  box-shadow: 0 8px 32px rgba(139,15,46,0.5), 0 0 28px rgba(91,33,182,0.4);
  transform: translateY(-2px);
}
.guide-fab:active {
  transform: translateY(0) scale(0.97);
}
`,
        }}
      />
      <button
        type="button"
        onClick={handleClick}
        aria-label="Télécharger le Guide EVC gratuitement"
        className="guide-fab fixed z-[9990] flex cursor-pointer items-center border-0 text-white transition-all duration-200 bottom-5 right-5 h-[56px] w-[180px] gap-2.5 rounded-[50px] px-4 sm:bottom-6 sm:right-6 sm:h-[64px] sm:w-[220px] sm:gap-3 sm:px-5"
        style={{
          background: 'linear-gradient(135deg, #880F2E 0%, #5B21B6 100%)',
        }}
      >
        <BookOpen className="h-[22px] w-[22px] shrink-0 text-white sm:h-[26px] sm:w-[26px]" strokeWidth={2.2} />
        <span className="whitespace-nowrap text-[14px] font-extrabold leading-none tracking-[-0.01em] text-white sm:text-[16px]">
          Guide EVC
        </span>
        <span
          className="ml-auto shrink-0 rounded-full px-[8px] py-[3px] text-[9px] font-black uppercase tracking-wider sm:px-[10px] sm:py-[4px] sm:text-[10px]"
          style={{ background: '#FFC107', color: '#FFFFFF' }}
        >
          Gratuit
        </span>
      </button>
    </>
  );
}

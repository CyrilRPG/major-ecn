'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, MessageCircle, X } from 'lucide-react';

/**
 * 4ᵉ flèche du parcours d'onboarding : pointe le bouton « Assistant » présent
 * en haut d'un cours. N'apparaît QUE lorsque l'élève est sur un item (le bouton
 * existe) et une seule fois (gate localStorage dédié).
 *
 * Deux cas couverts :
 *  - Nouvel élève : après les étapes 1→3 (menu + aperçu), il ouvre un contenu et
 *    découvre ici l'assistant. On attend que l'aperçu (étape 3) soit terminé
 *    pour ne pas superposer deux bulles.
 *  - Élève ayant déjà fait les étapes : seule cette 4ᵉ flèche s'affiche, la
 *    première fois qu'il ouvre un item.
 *
 * Volontairement : on ne parle pas d'« IA » — juste « l'assistant du cours ».
 */
const STORAGE_KEY = 'major-ecn:onboarding-assistant-v1';
const APERCU_KEY = 'major-ecn:onboarding-apercu-v1';
const TARGET = '[data-tour="assistant"]';

type Rect = { top: number; left: number; width: number; height: number };

export function AssistantCoachmark() {
  const [rect, setRect] = useState<Rect | null>(null);
  const [active, setActive] = useState(false);
  const started = useRef(false);

  // Attend que le bouton assistant soit monté ET que l'aperçu (étape 3) soit
  // terminé (ou déjà vu). Sondage léger pour séquencer proprement après l'aperçu.
  useEffect(() => {
    if (started.current) return;
    let done = false;
    try { if (localStorage.getItem(STORAGE_KEY)) return; } catch { return; }
    let tries = 0;
    const id = window.setInterval(() => {
      tries += 1;
      if (done) return;
      let apercuDone = true;
      try { apercuDone = !!localStorage.getItem(APERCU_KEY); } catch { apercuDone = true; }
      const el = document.querySelector(TARGET) as HTMLElement | null;
      const visible = !!el && el.getBoundingClientRect().width > 0;
      if (apercuDone && visible) {
        done = true;
        started.current = true;
        window.clearInterval(id);
        setActive(true);
      } else if (tries > 40) {
        // ~20 s sans conditions réunies → on abandonne pour cette visite.
        window.clearInterval(id);
      }
    }, 500);
    return () => window.clearInterval(id);
  }, []);

  const finish = useCallback(() => {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* ignore */ }
    setActive(false);
  }, []);

  const measure = useCallback(() => {
    const el = document.querySelector(TARGET) as HTMLElement | null;
    if (!el) { setRect(null); return; }
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, []);

  useEffect(() => {
    if (!active) return;
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [active, measure]);

  if (!active || !rect) return null;

  const pad = 6;
  const ringTop = Math.max(4, rect.top - pad);
  const ringLeft = Math.max(4, rect.left - pad);
  const ringW = rect.width + pad * 2;
  const ringH = rect.height + pad * 2;

  const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const cardW = 300;
  // Bulle sous le bouton (le bouton est en haut à droite), alignée à droite.
  const cardLeft = Math.min(Math.max(ringLeft + ringW - cardW, 16), vw - cardW - 16);
  const cardTop = Math.min(ringTop + ringH + 14, vh - 190);

  return (
    <div className="fixed inset-0 z-[120]" role="dialog" aria-label="Conseil assistant">
      <div
        aria-hidden
        className="pointer-events-none absolute rounded-xl ring-2 ring-white transition-all duration-300"
        style={{ top: ringTop, left: ringLeft, width: ringW, height: ringH, boxShadow: '0 0 0 9999px rgba(15,23,42,0.5)' }}
      />
      {/* Flèche pointant vers le bouton (au-dessus de la bulle). */}
      <span
        aria-hidden
        className="absolute h-3.5 w-3.5 rotate-45 rounded-[3px] bg-white shadow-sm"
        style={{ left: Math.min(cardLeft + cardW - 34, ringLeft + ringW - 12), top: cardTop - 6 }}
      />
      <div
        className="absolute w-[300px] rounded-2xl bg-white p-4 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.55)]"
        style={{ top: cardTop, left: cardLeft }}
      >
        <button
          type="button"
          onClick={finish}
          aria-label="Fermer"
          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-3.5 w-3.5" />
        </button>
        <div className="flex items-center gap-2 text-[#C0112E]">
          <MessageCircle className="h-4 w-4" />
          <p className="text-[13px] font-extrabold">4. L’assistant du cours</p>
        </div>
        <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">
          Une question sur ce cours&nbsp;? Ouvrez l’<strong>Assistant</strong>&nbsp;: il vous répond
          en s’appuyant uniquement sur le contenu de ce cours. Idéal pour lever un doute sans quitter votre lecture.
        </p>
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={finish}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#C0112E] px-3 py-1.5 text-[12px] font-bold text-white transition-transform hover:scale-[1.03]"
          >
            J’ai compris <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

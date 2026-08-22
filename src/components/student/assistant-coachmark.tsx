'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, MessageCircle, X } from 'lucide-react';
import {
  ONBOARDING_KEYS, isMobileViewport, isReplayRequested, readFlag, writeFlag,
} from '@/lib/student/onboarding';

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
 *
 * La condition d'ouverture exigeait auparavant que l'étape « aperçu » soit
 * marquée comme vue. Sur une page sans grille d'aperçu (fiche, QCM, vidéo…),
 * cette étape ne pouvait par construction jamais s'y produire : la 4ᵉ flèche
 * attendait 20 s puis renonçait, à chaque visite. On ne bloque donc que s'il
 * reste vraiment un conseil affiché à l'écran.
 */
const STORAGE_KEY = ONBOARDING_KEYS.assistant;
const APERCU_KEY = ONBOARDING_KEYS.apercu;
const TARGET = '[data-tour="assistant"]';
/** Grille d'aperçu : sa présence signale que l'étape 3 a encore lieu d'être. */
const APERCU_TARGET = '[data-tour="apercu-content"]';

type Rect = { top: number; left: number; width: number; height: number };

export function AssistantCoachmark() {
  const [rect, setRect] = useState<Rect | null>(null);
  const [active, setActive] = useState(false);
  const [mobile, setMobile] = useState(false);
  const started = useRef(false);

  // Attend que le bouton assistant soit monté, puis que la place soit libre :
  // ni l'étape « aperçu » en cours, ni une autre bulle affichée.
  useEffect(() => {
    if (started.current) return;
    if (!isReplayRequested() && readFlag(STORAGE_KEY)) return;
    let tries = 0;
    const id = window.setInterval(() => {
      tries += 1;
      const el = document.querySelector(TARGET) as HTMLElement | null;
      if (!el || el.getBoundingClientRect().width === 0) {
        if (tries > 60) window.clearInterval(id); // ~30 s : page sans assistant
        return;
      }
      // Une bulle est déjà à l'écran (visite guidée, aperçu) : on patiente,
      // deux conseils simultanés seraient illisibles.
      if (document.querySelector('[data-coachmark]')) return;
      // L'étape 3 reste due tant que la grille d'aperçu est là et non validée.
      const apercuDue = !readFlag(APERCU_KEY) && !!document.querySelector(APERCU_TARGET);
      if (apercuDue) return;
      window.clearInterval(id);
      started.current = true;
      setMobile(isMobileViewport());
      setActive(true);
    }, 500);
    return () => window.clearInterval(id);
  }, []);

  const finish = useCallback(() => {
    writeFlag(STORAGE_KEY);
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
    const onResize = () => { setMobile(isMobileViewport()); measure(); };
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', onResize);
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
  const cardW = mobile ? Math.min(340, vw - 24) : 300;
  // Bulle sous le bouton (le bouton est en haut à droite), alignée à droite.
  const cardLeft = mobile
    ? Math.round((vw - cardW) / 2)
    : Math.min(Math.max(ringLeft + ringW - cardW, 16), vw - cardW - 16);
  const cardTop = Math.min(ringTop + ringH + 14, vh - 190);

  return (
    <div className="pointer-events-none fixed inset-0 z-[120]" data-coachmark role="dialog" aria-label="Conseil assistant">
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
        className="pointer-events-auto absolute rounded-2xl bg-white p-4 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.55)]"
        style={{ top: cardTop, left: cardLeft, width: cardW }}
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

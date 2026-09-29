'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, Sparkles, X } from 'lucide-react';
import {
  ONBOARDING_KEYS, declareStep, isMobileViewport, isReplayRequested, markStepActive,
  markStepDone, readFlag, waitForElement, whenStepTurnComes, writeFlag,
} from '@/lib/student/onboarding';

/**
 * 3ᵉ flèche du parcours d'onboarding : n'apparaît QUE lorsque l'élève ouvre un
 * item pour la première fois et arrive sur l'Aperçu. Pointe la grille des
 * contenus et rappelle l'ordre pédagogique.
 *
 * La détection de la cible était une mesure UNIQUE à 700 ms : dès que la page
 * mettait un peu plus longtemps à se peindre, la condition échouait et rien ne
 * réessayait — la flèche ne s'affichait plus jamais, et la 4ᵉ (assistant), qui
 * attend celle-ci, restait bloquée à son tour. On sonde désormais jusqu'à ce
 * que la grille soit là.
 */
const STORAGE_KEY = ONBOARDING_KEYS.apercu;
const TARGET = '[data-tour="apercu-content"]';

type Rect = { top: number; left: number; width: number; height: number };

export function ApercuCoachmark() {
  const [rect, setRect] = useState<Rect | null>(null);
  const [active, setActive] = useState(false);
  const [mobile, setMobile] = useState(false);
  const started = useRef(false);

  // 5ᵉ étape. Ce composant n'est monté que sur l'Aperçu d'un item : sur toute
  // autre page l'étape est simplement absente de la file et ne retient pas la
  // flèche « assistant » qui la suit.
  useEffect(() => {
    if (started.current) return;
    const vaSAfficher = isReplayRequested() || !readFlag(STORAGE_KEY);
    const retirer = declareStep('apercu', vaSAfficher);
    if (!vaSAfficher) return retirer;

    // Deux attentes SÉPARÉES, et c'est essentiel : d'abord son tour, sans
    // échéance — l'élève lit les trois fenêtres aussi longtemps qu'il veut —
    // puis seulement la cible, avec une échéance. Les confondre revenait à
    // décompter le budget de recherche de la grille pendant que les fenêtres
    // précédentes étaient encore ouvertes : l'étape expirait avant son tour et
    // se sautait elle-même.
    let annulerCible: (() => void) | undefined;
    const annulerTour = whenStepTurnComes('apercu', () => {
      annulerCible = waitForElement(TARGET, () => {
        started.current = true;
        markStepActive('apercu');
        setMobile(isMobileViewport());
        setActive(true);
      }, {
        // La grille n'est jamais venue : on rend la main plutôt que de bloquer
        // l'étape suivante.
        onTimeout: () => markStepDone('apercu'),
      });
    });
    return () => { annulerTour(); annulerCible?.(); retirer(); };
  }, []);

  const finish = useCallback(() => {
    writeFlag(STORAGE_KEY);
    markStepDone('apercu');
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

  const pad = 8;
  const ringTop = Math.max(4, rect.top - pad);
  const ringLeft = Math.max(4, rect.left - pad);
  const ringW = rect.width + pad * 2;
  const ringH = rect.height + pad * 2;

  const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const cardW = mobile ? Math.min(340, vw - 24) : 320;
  // Bulle au-dessus de la grille si la place le permet, sinon en dessous. Sur
  // téléphone, la grille occupe presque tout l'écran : la bulle se pose en bas,
  // dans la zone du pouce.
  const above = !mobile && ringTop > 200;
  const cardLeft = mobile
    ? Math.round((vw - cardW) / 2)
    : Math.min(Math.max(ringLeft, 16), vw - cardW - 16);
  const cardTop = mobile
    ? vh - 210
    : above
      ? Math.max(16, ringTop - 168)
      : Math.min(ringTop + ringH + 14, vh - 180);

  return (
    <div className="pointer-events-none fixed inset-0 z-[120]" data-coachmark role="dialog" aria-label="Conseil parcours">
      <div
        aria-hidden
        className="pointer-events-none absolute rounded-2xl ring-2 ring-white transition-all duration-300"
        style={{ top: ringTop, left: ringLeft, width: ringW, height: ringH, boxShadow: '0 0 0 9999px rgba(15,23,42,0.5)' }}
      />
      {/* Flèche (pointe vers la grille). */}
      <span
        aria-hidden
        className="pointer-events-none absolute h-3.5 w-3.5 rotate-45 rounded-[3px] bg-white shadow-sm"
        style={{ left: cardLeft + 28, top: above ? cardTop + 152 : cardTop - 6 }}
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
          <Sparkles className="h-4 w-4" />
          <p className="text-[13px] font-extrabold">Le parcours d’un item</p>
        </div>
        <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">
          Avancez dans l’ordre&nbsp;: <strong>Fiche</strong> → <strong>Fiche éclair</strong> →{' '}
          <strong>DP / QI</strong> → <strong>Séance approfondie / vidéo</strong> → <strong>Flashcards</strong>.
          Tout est ici, dans cet ordre.
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

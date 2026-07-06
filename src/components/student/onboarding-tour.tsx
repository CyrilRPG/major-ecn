'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, MousePointerClick, X } from 'lucide-react';

/**
 * Visite guidée « première connexion » : de mini-flèches + bulles pointent le
 * menu (choisir sa matière → choisir un item → accéder au contenu), pas à pas.
 * Gate localStorage (une seule fois). Desktop uniquement (le menu latéral est
 * masqué sur mobile). S'inspire du coach-mark Découverte existant.
 */
const STORAGE_KEY = 'major-ecn:onboarding-tour-v1';

type Step = { selector: string; title: string; body: string; expandFirst?: boolean };

const STEPS: Step[] = [
  {
    selector: '[data-tour="matiere"]',
    title: '1. Choisissez votre matière',
    body: 'Chaque collège regroupe ses items. Cliquez sur une matière pour la dérouler et voir la liste des items.',
  },
  {
    selector: '[data-tour="cours-item"]',
    title: '2. Ouvrez un item',
    body: 'Cliquez sur un item pour accéder à son parcours pédagogique complet.',
    expandFirst: true,
  },
  {
    selector: '[data-tour="student-menu"]',
    title: '3. Suivez le parcours',
    body: 'Pour chaque item, avancez dans l’ordre : Fiche → Fiche éclair → DP / QI → Séance approfondie / vidéo → Flashcards.',
  },
];

type Rect = { top: number; left: number; width: number; height: number };

export function OnboardingTour() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const startedRef = useRef(false);

  // Démarrage : une seule fois, desktop, quand le menu est présent.
  useEffect(() => {
    if (startedRef.current) return;
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch { return; }
    const t = setTimeout(() => {
      const menu = document.querySelector('[data-tour="student-menu"]') as HTMLElement | null;
      if (!menu || menu.getBoundingClientRect().width === 0) return; // mobile / pas de menu
      startedRef.current = true;
      setActive(true);
    }, 1100);
    return () => clearTimeout(t);
  }, []);

  const finish = useCallback(() => {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* ignore */ }
    setActive(false);
  }, []);

  const measure = useCallback(() => {
    const s = STEPS[step];
    let el = document.querySelector(s.selector) as HTMLElement | null;
    // Étape « ouvrir un item » : si aucun item visible, déroule le 1er collège.
    if (!el && s.expandFirst) {
      const m = document.querySelector('[data-tour="matiere"]') as HTMLElement | null;
      m?.click();
    }
    el = document.querySelector(s.selector) as HTMLElement | null;
    if (!el) {
      // repli sur le menu pour ne jamais afficher une bulle « dans le vide »
      el = document.querySelector('[data-tour="student-menu"]') as HTMLElement | null;
    }
    if (!el) { setRect(null); return; }
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [step]);

  useEffect(() => {
    if (!active) return;
    measure();
    const id = window.setTimeout(measure, 260); // laisse le temps au déroulé
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [active, step, measure]);

  if (!active || !rect) return null;

  const pad = 6;
  const ringTop = Math.max(4, rect.top - pad);
  const ringLeft = Math.max(4, rect.left - pad);
  const ringW = rect.width + pad * 2;
  const ringH = rect.height + pad * 2;

  // Bulle à droite du menu (le menu est à gauche), verticalement alignée.
  const cardW = 300;
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const cardLeft = Math.min(ringLeft + ringW + 16, vw - cardW - 16);
  const cardTop = Math.min(Math.max(ringTop, 16), Math.max(16, vh - 220));

  const isLast = step === STEPS.length - 1;
  const s = STEPS[step];

  return (
    <div className="fixed inset-0 z-[120]" role="dialog" aria-label="Visite guidée">
      {/* Spotlight : anneau clair + reste de l'écran assombri (via box-shadow). */}
      <div
        aria-hidden
        className="pointer-events-none absolute rounded-xl ring-2 ring-white transition-all duration-300"
        style={{
          top: ringTop, left: ringLeft, width: ringW, height: ringH,
          boxShadow: '0 0 0 9999px rgba(15,23,42,0.55)',
        }}
      />
      {/* Flèche pointant vers la cible (à gauche de la bulle). */}
      <span
        aria-hidden
        className="absolute h-3.5 w-3.5 rotate-45 rounded-[3px] bg-white shadow-sm transition-all duration-300"
        style={{ top: cardTop + 26, left: cardLeft - 6 }}
      />
      {/* Bulle. */}
      <div
        className="absolute w-[300px] rounded-2xl bg-white p-4 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.55)] transition-all duration-300"
        style={{ top: cardTop, left: cardLeft }}
      >
        <button
          type="button"
          onClick={finish}
          aria-label="Passer la visite"
          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-3.5 w-3.5" />
        </button>
        <div className="flex items-center gap-2 text-[#C0112E]">
          <MousePointerClick className="h-4 w-4" />
          <p className="text-[13px] font-extrabold">{s.title}</p>
        </div>
        <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">{s.body}</p>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${i === step ? 'w-4 bg-[#C0112E]' : 'w-1.5 bg-slate-300'}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((v) => Math.max(0, v - 1))}
                className="text-[12px] font-semibold text-slate-500 hover:text-slate-700"
              >
                Précédent
              </button>
            )}
            <button
              type="button"
              onClick={() => (isLast ? finish() : setStep((v) => v + 1))}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#C0112E] px-3 py-1.5 text-[12px] font-bold text-white transition-transform hover:scale-[1.03]"
            >
              {isLast ? "C'est parti !" : 'Suivant'} <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

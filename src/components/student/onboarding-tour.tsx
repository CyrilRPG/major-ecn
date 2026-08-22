'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowRight, MousePointerClick, X } from 'lucide-react';
import {
  MENU_OPEN_EVENT, ONBOARDING_KEYS, declareStep, isMobileViewport, isReplayRequested,
  markStepActive, markStepDone, readFlag, screenIsBusy, whenStepTurnComes, writeFlag,
} from '@/lib/student/onboarding';

/**
 * Visite guidée « première connexion » : des mini-flèches et des bulles
 * pointent le menu (choisir sa matière → ouvrir un item), pas à pas.
 *
 * Fonctionne aussi sur téléphone : le menu y est un tiroir, on l'ouvre donc
 * avant de pointer quoi que ce soit (auparavant la visite s'interrompait
 * silencieusement dès que le menu latéral était masqué, c'est-à-dire sur tout
 * mobile). Le voile ne capte plus les clics : l'élève peut réellement cliquer
 * sur la matière qu'on lui désigne.
 */
const STORAGE_KEY = ONBOARDING_KEYS.tour;

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
    body: 'Cliquez sur un item pour accéder à son parcours pédagogique. Un dernier conseil vous y attend.',
    expandFirst: true,
  },
];

type Rect = { top: number; left: number; width: number; height: number };

/** Premier élément RÉELLEMENT affiché : sur mobile, l'aside desktop est encore
 *  dans le DOM mais masqué (rectangle nul), il ne doit jamais être mesuré. */
function visibleTarget(selector: string): HTMLElement | null {
  const all = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
  return all.find((el) => el.getBoundingClientRect().width > 0) ?? null;
}

export function OnboardingTour({ replayOnly = false }: {
  /** Comptes non-élèves (admin, professeur) : la visite ne se lance qu'à la
   *  demande explicite, via « Revoir le tutoriel » (`?tutoriel=1`). */
  replayOnly?: boolean;
}) {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [mobile, setMobile] = useState(false);
  const startedRef = useRef(false);

  // 4ᵉ étape : les trois fenêtres d'explication passent d'abord. Quand le tour
  // vient, il reste à faire apparaître le menu — sur téléphone c'est un tiroir,
  // on l'ouvre nous-mêmes, sinon ni les collèges ni les items n'existent.
  useEffect(() => {
    if (startedRef.current) return;
    const replay = isReplayRequested();
    const vaSAfficher = replay || (!replayOnly && !readFlag(STORAGE_KEY));
    const retirer = declareStep('menuTour', vaSAfficher);
    if (!vaSAfficher) return retirer;

    let cancelled = false;
    let cancelMenuWait: (() => void) | undefined;

    const annuler = whenStepTurnComes('menuTour', () => {
      if (cancelled) return;
      let tries = 0;
      const timer = window.setInterval(() => {
        if (cancelled) return;
        tries += 1;
        // Une fenêtre hors parcours est revenue (popup vidéo d'un item) : on la
        // laisse passer plutôt que de lui superposer une bulle.
        if (screenIsBusy()) return;
        const onMobile = isMobileViewport();
        if (onMobile) window.dispatchEvent(new Event(MENU_OPEN_EVENT));
        if (visibleTarget('[data-tour="student-menu"]')) {
          window.clearInterval(timer);
          startedRef.current = true;
          markStepActive('menuTour');
          setMobile(onMobile);
          setActive(true);
          return;
        }
        // ~12 s : au-delà, la page n'a pas de menu (plein écran, erreur de
        // chargement). On rend la main pour ne pas retenir les étapes
        // suivantes ; celle-ci se représentera à la navigation d'après.
        if (tries > 40) { window.clearInterval(timer); markStepDone('menuTour'); }
      }, 300);
      cancelMenuWait = () => window.clearInterval(timer);
    });

    return () => { cancelled = true; annuler(); cancelMenuWait?.(); retirer(); };
  }, [replayOnly]);

  const finish = useCallback(() => {
    writeFlag(STORAGE_KEY);
    markStepDone('menuTour');
    setActive(false);
  }, []);

  // L'élève a suivi la consigne et ouvert un item : la visite a rempli son
  // office, elle s'efface pour laisser la place au conseil de la page item.
  // Sans ça, les deux bulles se superposaient.
  const firstPath = useRef(pathname);
  useEffect(() => {
    if (!active) return;
    if (pathname !== firstPath.current && pathname.startsWith('/cours/')) finish();
  }, [pathname, active, finish]);

  const measure = useCallback(() => {
    const s = STEPS[step];
    // Le tiroir mobile se referme à chaque navigation : tant que la visite dure,
    // on le redemande, sinon la bulle pointerait un menu absent.
    if (isMobileViewport() && !visibleTarget('[data-tour="student-menu"]')) {
      window.dispatchEvent(new Event(MENU_OPEN_EVENT));
    }
    let el = visibleTarget(s.selector);
    // Étape « ouvrir un item » : si aucun item visible, déroule le 1er collège.
    if (!el && s.expandFirst) visibleTarget('[data-tour="matiere"]')?.click();
    el = visibleTarget(s.selector);
    // Repli sur le menu pour ne jamais afficher une bulle « dans le vide ».
    if (!el) el = visibleTarget('[data-tour="student-menu"]');
    if (!el) { setRect(null); return; }
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [step]);

  useEffect(() => {
    if (!active) return;
    setMobile(isMobileViewport());
    measure();
    // Le tiroir mobile glisse depuis la gauche (220 ms) et le déroulé d'un
    // collège prend ~200 ms : mesurer une seule fois plaçait l'anneau sur la
    // position de DÉPART du tiroir, donc à côté. On la resuit pendant 2 s, le
    // temps que tout soit posé.
    let ticks = 0;
    const follow = window.setInterval(() => {
      measure();
      // 20 × 100 ms : au-delà, la cible est stable et les écouteurs ci-dessous
      // suffisent. Un intervalle plutôt qu'un requestAnimationFrame : ce dernier
      // est gelé quand l'onglet passe en arrière-plan, et l'anneau restait alors
      // figé sur la position de départ au retour de l'élève.
      if (++ticks >= 20) window.clearInterval(follow);
    }, 100);
    const onResize = () => { setMobile(isMobileViewport()); measure(); };
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', measure, true);
    window.addEventListener('animationend', measure, true);
    return () => {
      window.clearInterval(follow);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', measure, true);
      window.removeEventListener('animationend', measure, true);
    };
  }, [active, step, measure]);

  if (!active || !rect) return null;

  const pad = 6;
  const ringTop = Math.max(4, rect.top - pad);
  const ringLeft = Math.max(4, rect.left - pad);
  const ringW = rect.width + pad * 2;
  const ringH = rect.height + pad * 2;

  const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  // Desktop : bulle à droite du menu. Mobile : le tiroir occupe déjà 280 px des
  // 375 px de large — il ne reste pas de place à côté, la bulle passe en bas.
  const cardW = mobile ? Math.min(340, vw - 24) : 300;
  const cardLeft = mobile
    ? Math.round((vw - cardW) / 2)
    : Math.min(ringLeft + ringW + 16, vw - cardW - 16);
  const cardTop = mobile
    ? Math.max(ringTop + ringH + 14, vh - 230)
    : Math.min(Math.max(ringTop, 16), Math.max(16, vh - 220));

  const isLast = step === STEPS.length - 1;
  const s = STEPS[step];

  return (
    // `pointer-events-none` sur le voile : la consigne est de CLIQUER sur la
    // matière désignée. Tant que le calque captait les clics, c'était
    // impossible — la visite bloquait ce qu'elle demandait de faire.
    <div className="pointer-events-none fixed inset-0 z-[120]" data-coachmark role="dialog" aria-label="Visite guidée">
      {/* Spotlight : anneau clair + reste de l'écran assombri (via box-shadow). */}
      <div
        aria-hidden
        className="pointer-events-none absolute rounded-xl ring-2 ring-white transition-all duration-300"
        style={{
          top: ringTop, left: ringLeft, width: ringW, height: ringH,
          boxShadow: '0 0 0 9999px rgba(15,23,42,0.55)',
        }}
      />
      {/* Flèche pointant vers la cible. */}
      <span
        aria-hidden
        className="pointer-events-none absolute h-3.5 w-3.5 rotate-45 rounded-[3px] bg-white shadow-sm transition-all duration-300"
        style={
          mobile
            ? { top: cardTop - 6, left: Math.min(Math.max(ringLeft + ringW / 2, cardLeft + 20), cardLeft + cardW - 20) }
            : { top: cardTop + 26, left: cardLeft - 6 }
        }
      />
      {/* Bulle. */}
      <div
        className="pointer-events-auto absolute rounded-2xl bg-white p-4 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.55)] transition-all duration-300"
        style={{ top: cardTop, left: cardLeft, width: cardW }}
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

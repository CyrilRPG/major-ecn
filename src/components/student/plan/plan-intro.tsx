'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Source_Sans_3, Source_Serif_4 } from 'next/font/google';
import { Check, ChevronLeft, ChevronRight, Hourglass, Loader2, Pause, Play, X } from 'lucide-react';
import { recordIntroSeenAction } from '@/app/(student)/planificateur/actions';
import { cn } from '@/lib/utils';
import s from './plan-intro.module.css';

/**
 * Présentation animée du planificateur (ouverture du module aux élèves).
 * Quatre scènes dessinées en HTML (aucune image) : démarrer, le programme du
 * jour, « J'ai encore du temps », l'adaptation. Défilement automatique (pause
 * au survol, au focus ou au bouton), navigation clavier ← →, animations
 * coupées si l'élève a demandé à réduire les animations.
 */

const serif = Source_Serif_4({ subsets: ['latin'], weight: ['600', '700'], display: 'swap' });
const sans = Source_Sans_3({ subsets: ['latin'], weight: ['400', '600', '700'], display: 'swap' });

const SCENE_MS = 4600;

type Scene = { title: string; text: string; visual: () => React.ReactNode };

const d = (ms: number) => ({ animationDelay: `${ms}ms` });

function SceneStart() {
  const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const on = [0, 1, 3, 4, 5];
  return (
    <div className={cn(s.card, 'w-[330px] space-y-4 p-4')}>
      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.06em] text-[#8e6a48]">Vos jours disponibles</p>
        <div className={s.days}>
          {days.map((l, i) => (
            <span key={i} className={s.day}>
              {l}
              {on.includes(i) && <span className={s.dayOn} style={d(150 + on.indexOf(i) * 170)}>{l}</span>}
            </span>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#8e6a48]">Votre niveau par spécialité</p>
        {[{ name: 'Cardiologie', to: s.slideTo1, delay: 1350 }, { name: 'Pneumologie', to: s.slideTo2, delay: 2000 }].map((r) => (
          <div key={r.name} className={s.levelRow}>
            <span className="w-[84px] truncate">{r.name}</span>
            <span className={s.levelTrack}>
              <span className={cn(s.levelThumb, r.to)} style={d(r.delay)} />
              {['Faible', 'Moyen', 'Bon'].map((l) => <span key={l} className={s.levelPill}>{l}</span>)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SceneToday() {
  const rows = [
    { t: 'Insuffisance cardiaque', k: 'Première couverture', m: '45 min' },
    { t: 'Asthme', k: 'Réactivation', m: '20 min' },
    { t: 'Infections urinaires', k: 'Évaluation', m: '15 min' },
  ];
  return (
    <div className={cn(s.card, 'w-[340px] overflow-hidden')}>
      <div className="flex items-center justify-between border-b border-[#f3e8e5] px-3 py-2">
        <span className="text-[12px] font-bold text-[#1e1a2e]">Aujourd’hui</span>
        <span className="text-[11px] text-[#7a6f73]">1 h 20 · durées indicatives</span>
      </div>
      {rows.map((r, i) => (
        <div key={r.t} className={cn(s.row, i > 0 && 'border-t border-[#f6eeec]')} style={d(200 + i * 260)}>
          <span className={s.check}>{i === 0 && <span className={s.checkFill} style={d(1900)}><Check className="h-3 w-3" strokeWidth={3.2} /></span>}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[12.5px] font-semibold text-[#1e1a2e]">{r.t}</span>
            <span className="text-[10.5px] text-[#8c1233]">{r.k}</span>
          </span>
          <span className="text-[11px] tabular-nums text-[#7a6f73]">{r.m}</span>
        </div>
      ))}
      <div className="px-3 pb-3 pt-1">
        <div className={s.bar}><div className={cn(s.barFill, s.grow33)} style={d(2150)} /></div>
      </div>
    </div>
  );
}

function SceneExtra() {
  return (
    <div className="relative flex items-start gap-3">
      <div className={cn(s.card, s.col)}>
        <p className={s.colTitle}>Aujourd’hui</p>
        {['Angor d’effort', 'Épistaxis'].map((t) => (
          <div key={t} className={s.mini}><Check className="h-3.5 w-3.5 text-[#2f7a5b]" strokeWidth={3} /><span className="truncate">{t}</span></div>
        ))}
        <div className={s.landing} />
        <div className="relative mt-1 flex justify-center">
          <span className={cn(s.button, s.press)}>
            <span className={s.ripple} />
            <Hourglass className="h-3.5 w-3.5" /> J’ai encore du temps
          </span>
          {/* Pointeur accroché au bouton : il le suit quelle que soit la mise en page. */}
          <svg viewBox="0 0 24 24" className={s.pointer} style={{ left: '62%', top: '55%' }} aria-hidden>
            <path d="M5 3l14 8-6 1.5L10 19z" fill="#1e1a2e" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className={cn(s.card, s.col)}>
        <p className={s.colTitle}>Demain · prévisionnel</p>
        <div className={cn(s.mini, s.traveler, 'relative z-10 bg-white ring-1 ring-[#efe4e1]')}>
          <span className="h-2 w-2 flex-none rounded-full bg-[#730d31]" /><span className="truncate">Dyslipidémie · 30 min</span>
        </div>
        <div className={s.mini}><span className="h-2 w-2 flex-none rounded-full bg-[#d9a3b1]" /><span className="truncate">Hépatites virales</span></div>
      </div>
    </div>
  );
}

function SceneAdapt() {
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];
  return (
    <div className={cn(s.card, 'w-[340px] space-y-3 p-4')}>
      <div className={s.week}>
        {days.map((l, i) => (
          <div key={l} className={s.slot}>
            <span className={s.slotLabel}>{l}</span>
            <span className={cn(s.block, i === 1 && s.blockMain, i === 1 && s.missed)} />
            <span className={s.block} />
            {i === 3 && <span className={cn(s.block, s.blockMain, s.replaced)} />}
          </div>
        ))}
      </div>
      <div>
        <div className="mb-1.5 flex items-center justify-between text-[11px]">
          <span className="font-bold text-[#1e1a2e]">Couverture du programme</span>
          <span className="text-[#7a6f73]">tous les items</span>
        </div>
        <div className={s.bar}><div className={cn(s.barFill, s.grow100)} style={d(2300)} /></div>
      </div>
    </div>
  );
}

const SCENES: Scene[] = [
  { title: '2 minutes pour démarrer', text: 'Indiquez vos jours et votre temps disponibles, puis votre niveau par spécialité. Votre voie et la date de l’EVC sont déjà connues.', visual: SceneStart },
  { title: 'Votre programme du jour', text: 'Chaque jour, des activités priorisées avec leur durée indicative : couverture des items, réactivations, évaluations courtes.', visual: SceneToday },
  { title: 'Vous avancez plus vite ?', text: '« J’ai encore du temps » vous propose la meilleure activité suivante, même prévue plus tard. Le planning se recalcule : rien n’est répété.', visual: SceneExtra },
  { title: 'Il s’adapte à vous', text: 'Séance manquée, résultats, rythme réel : tout est pris en compte. L’ensemble du programme reste à maîtriser : le planning organise, il ne supprime rien.', visual: SceneAdapt },
];

export function PlanIntroDialog({ open, onClose, replay = false }: {
  open: boolean;
  /** `created` : l'élève a cliqué « Créer mon planning ». */
  onClose: (how: 'created' | 'later') => void;
  /** Rejouée depuis le planning : pas d'appel à créer, pas d'enregistrement. */
  replay?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hover, setHover] = useState(false);
  const [busy, setBusy] = useState(false);
  const stopped = paused || hover;

  // Temps déjà écoulé dans la scène : une pause reprend exactement où elle s'était arrêtée
  // (le minuteur et les animations CSS restent synchronisés).
  const elapsed = useRef(0);
  const sceneKey = useRef('');
  const go = useCallback((i: number) => { setIndex((i + SCENES.length) % SCENES.length); setCycle((c) => c + 1); }, []);
  useEffect(() => {
    // Nouvelle scène : le temps écoulé repart de zéro (le nettoyage de la scène
    // précédente vient d'y ajouter sa propre durée).
    const key = `${index}-${cycle}`;
    if (sceneKey.current !== key) { sceneKey.current = key; elapsed.current = 0; }
    if (!open || stopped) return;
    const started = performance.now();
    const t = window.setTimeout(() => go(index + 1), Math.max(0, SCENE_MS - elapsed.current));
    return () => { window.clearTimeout(t); elapsed.current += performance.now() - started; };
  }, [open, stopped, index, cycle, go]);

  const scene = SCENES[index];
  const Visual = scene.visual;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(v) => { if (!v) onClose('later'); }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-[#2a2530]/55 backdrop-blur-[3px]" />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
          <DialogPrimitive.Content
            className={cn(sans.className, 'relative max-h-[94dvh] w-full max-w-[560px] overflow-y-auto rounded-[22px] bg-[#fefdfe] p-5 shadow-[0_30px_80px_-20px_rgba(40,10,20,0.45)] outline-none sm:p-7')}
            onKeyDown={(e) => { if (e.key === 'ArrowRight') go(index + 1); if (e.key === 'ArrowLeft') go(index - 1); }}
            onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8e6a48]">{replay ? 'Comment ça marche' : 'Nouveau'}</p>
            <DialogPrimitive.Title className={cn(serif.className, 'mt-1 text-[25px] font-bold leading-tight text-[#150a10] sm:text-[28px]')}>
              Mon planning <span className="text-[#7a0f2e]">EVC</span>
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="mt-1 text-[14px] leading-[20px] text-[#3b4063]">
              Un planning de révision qui s’organise autour de votre temps, de votre voie et de vos résultats.
            </DialogPrimitive.Description>

            <div className={cn('mt-4', stopped && s.paused)} style={{ ['--scene-ms' as string]: `${SCENE_MS}ms` }}>
              <div className={s.stage} aria-hidden>
                <div key={`${index}-${cycle}`} className={s.scene}><div className={s.fit}><Visual /></div></div>
              </div>
              <div aria-live="polite" className="mt-4 min-h-[88px]">
                <p key={`t-${index}-${cycle}`} className={cn(serif.className, s.scene, 'relative text-[18px] font-bold text-[#6d0a22]')} style={{ position: 'relative', inset: 'auto', display: 'block' }}>
                  {index + 1}. {scene.title}
                </p>
                <p className="mt-1 text-[14px] leading-[20.5px] text-[#3b4063]">{scene.text}</p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className={s.dots} role="tablist" aria-label="Étapes">
                  {SCENES.map((sc, i) => (
                    <button key={i === index ? `${sc.title}-${cycle}` : sc.title} type="button" role="tab" aria-selected={i === index} aria-label={`Étape ${i + 1} : ${sc.title}`}
                      onClick={() => go(i)} className={cn(s.dot, i === index && s.dotActive, i === index && s.dotProgress)} />
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => go(index - 1)} aria-label="Étape précédente" className="rounded-full p-1.5 text-[#6d0a22] hover:bg-[#f6eceb]"><ChevronLeft className="h-4 w-4" /></button>
                  <button type="button" onClick={() => setPaused((p) => !p)} aria-label={paused ? 'Reprendre l’animation' : 'Mettre en pause'} className="rounded-full p-1.5 text-[#6d0a22] hover:bg-[#f6eceb]">
                    {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  </button>
                  <button type="button" onClick={() => go(index + 1)} aria-label="Étape suivante" className="rounded-full p-1.5 text-[#6d0a22] hover:bg-[#f6eceb]"><ChevronRight className="h-4 w-4" /></button>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              {replay ? (
                <button type="button" onClick={() => onClose('later')} className="h-11 rounded-full bg-[#730d31] px-6 text-[15px] font-semibold text-white transition hover:brightness-110">J’ai compris</button>
              ) : (
                <>
                  <button type="button" disabled={busy} onClick={() => onClose('later')} className="h-11 rounded-full px-5 text-[14.5px] font-semibold text-[#5c0a1c] transition hover:bg-[#f6eceb] disabled:opacity-60">Plus tard</button>
                  <button type="button" disabled={busy} onClick={() => { setBusy(true); onClose('created'); }}
                    className="flex h-11 items-center justify-center gap-2 rounded-full bg-[#730d31] px-6 text-[15px] font-semibold text-white shadow-[0_8px_18px_-10px_rgba(115,13,49,0.8)] transition hover:brightness-110 disabled:opacity-70">
                    {busy && <Loader2 className="h-4 w-4 animate-spin" />}Créer mon planning<ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
            <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full p-1 text-[#231a26] transition hover:bg-black/5" aria-label="Fermer">
              <X className="h-5 w-5" strokeWidth={1.6} />
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/** Accueil : présentation affichée une fois aux élèves concernés (état gardé en base). */
export function PlanIntroOnHome({ show }: { show: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(show);
  if (!show) return null;
  return (
    <PlanIntroDialog open={open} onClose={async (how) => {
      await recordIntroSeenAction(how === 'later');
      if (how === 'created') router.push('/planificateur/onboarding');
      setOpen(false);
    }} />
  );
}

/** Bouton « Comment ça marche ? » : rejoue la présentation depuis le planning. */
export function PlanIntroReplayButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={cn('text-xs font-medium text-[#730d31] underline-offset-4 hover:underline dark:text-[#f25667]', className)}>
        Comment ça marche ?
      </button>
      {open && <PlanIntroDialog open={open} replay onClose={() => setOpen(false)} />}
    </>
  );
}

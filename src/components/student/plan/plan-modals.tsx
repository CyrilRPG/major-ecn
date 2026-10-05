'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import Image from 'next/image';
import {
  BookOpen, CalendarDays, ChartColumnIncreasing, ChevronRight, Clock, Hourglass, Lightbulb, List, Loader2, Settings, Trophy, X, Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DAY_DONE_CONTINUE, DAY_DONE_STOP, FIRST_PLAN_BUTTON, FIRST_PLAN_TEXT, FIRST_PLAN_TITLE, INSUFFICIENT_EDIT, INSUFFICIENT_KEEP,
} from '@/lib/plan/types';
import { planSerif as serif } from './v4/fonts';

/** Chiffres du message « temps de préparation limité ». */
export type TimeFigures = { daysLeft: number; avgMinutesPerDay: number; daysPerWeek: number; plannableMinutes: number };

/**
 * Pop-ups du planificateur, reproduits d'après les maquettes validées :
 *  - « Bravo, votre programme du jour est terminé ! » (programme du jour fini) ;
 *  - « Votre temps de préparation est actuellement limité » (temps insuffisant,
 *    à la première génération comme après une modification des disponibilités) ;
 *  - « Votre planning de révision personnalisé » (message obligatoire de la
 *    première génération, texte imposé), dans le même langage visuel.
 * Les photos viennent des maquettes (public/planificateur/).
 */


const C = {
  bordeaux: '#6a0a22',
  bouton: '#650b23',
  boutonB: '#730d31',
  encre: '#1e1a2e',
  texte: '#3b4063',
  or: '#8e6a48',
  roseRond: '#f4e9e7',
};

function Shell({ open, onOpenChange, children, className, label, dismissable = true }: {
  open: boolean; onOpenChange: (v: boolean) => void; children: React.ReactNode; className?: string; label: string;
  /** false : ni croix, ni Échap, ni clic à l'extérieur (message obligatoire). */
  dismissable?: boolean;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-[#2a2530]/55 backdrop-blur-[3px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
          <DialogPrimitive.Content
            aria-label={label}
            onEscapeKeyDown={(e) => { if (!dismissable) e.preventDefault(); }}
            onPointerDownOutside={(e) => { if (!dismissable) e.preventDefault(); }}
            onInteractOutside={(e) => { if (!dismissable) e.preventDefault(); }}
            className={cn('relative max-h-[94dvh] w-full overflow-y-auto overflow-x-hidden rounded-[22px] shadow-[0_30px_80px_-20px_rgba(40,10,20,0.45)] outline-none', className)}
          >
            {children}
            {dismissable && <DialogPrimitive.Close
              className="absolute right-[26px] top-[26px] z-20 rounded-full p-1 text-[#231a26] transition hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-[#6a0a22]"
            >
              <X className="h-[26px] w-[26px]" strokeWidth={1.6} />
              <span className="sr-only">Fermer</span>
            </DialogPrimitive.Close>}
          </DialogPrimitive.Content>
        </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/* ─── Icônes dessinées d'après les maquettes ─── */
function TargetArrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" className={className} aria-hidden>
      <circle cx="15" cy="17" r="11" /><circle cx="15" cy="17" r="6.2" /><circle cx="15" cy="17" r="1.6" fill="currentColor" />
      <path d="M15 17 26 6" /><path d="M22 5.5 26 6l.5 4" />
    </svg>
  );
}
function Bars({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden>
      <rect x="5" y="17" width="5.5" height="10" rx="1.6" /><rect x="13.3" y="11" width="5.5" height="16" rx="1.6" /><rect x="21.5" y="5" width="5.5" height="22" rx="1.6" />
    </svg>
  );
}
function Rays({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 40" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" className={className} aria-hidden>
      <path d="M8 36 18 30" /><path d="M36 12 40 20" /><path d="M62 4v9" /><path d="M88 12 84 20" />
    </svg>
  );
}

/* ═══ 1. Programme du jour terminé ═══ */
export function DayDoneModal({ open, onOpenChange, onContinue, onStop, pending }: {
  open: boolean; onOpenChange: (v: boolean) => void; onContinue: () => void; onStop: () => void; pending?: 'continue' | 'stop' | null;
}) {
  return (
    <Shell open={open} onOpenChange={onOpenChange} label="Programme du jour terminé" className="max-w-[1000px] bg-[#fbf8f5]">
      {/* Photo (livres, tasse, carnet) — fondue dans le fond à gauche */}
      <div aria-hidden className="pointer-events-none absolute right-0 top-0 hidden h-[637px] w-[522px] md:block">
        <Image src="/planificateur/bravo-photo.jpg" alt="" fill sizes="522px" className="object-cover" priority />
        <div className="absolute inset-y-0 left-0 w-[46%] bg-gradient-to-r from-[#fbf8f5] via-[#fbf8f5]/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#fbf8f5] to-transparent" />
      </div>

      <div className="relative z-10 px-6 pb-6 pt-8 sm:px-[48px] sm:pb-[22px] sm:pt-[42px] md:max-w-[520px] md:overflow-visible">
        {/* Le titre déborde sur la photo, comme sur la maquette. */}
        <div className="flex items-start gap-5 sm:gap-[26px] md:w-[640px]">
          <div className="relative mt-[10px] shrink-0">
            <Rays className="absolute -top-[30px] left-1/2 h-[34px] w-[100px] -translate-x-1/2 text-[#6a0a22]" />
            <div className="grid h-[76px] w-[76px] place-items-center rounded-full sm:h-[98px] sm:w-[98px]" style={{ background: C.roseRond }}>
              <Trophy className="h-10 w-10 sm:h-[50px] sm:w-[50px]" style={{ color: C.bordeaux }} strokeWidth={1.9} />
            </div>
          </div>
          <DialogPrimitive.Title asChild>
            <h2 className={cn(serif.className, 'leading-[1.04] tracking-[-0.01em]')}>
              <span className="block text-[38px] font-bold sm:text-[51px]" style={{ color: C.bordeaux }}>Bravo,</span>
              <span className="block text-[26px] font-bold sm:text-[37px]" style={{ color: C.encre }}>votre programme du&nbsp;jour <br className="hidden md:inline" />est terminé&nbsp;!</span>
            </h2>
          </DialogPrimitive.Title>
        </div>

        <p className={cn(serif.className, 'mt-[18px] pl-[10px] text-[26px] font-bold leading-tight sm:text-[32px]')} style={{ color: C.or }}>Il vous reste du temps&nbsp;?</p>
        <DialogPrimitive.Description asChild>
          <p className="mt-[14px] pl-[11px] text-[15.5px] leading-[24px] sm:text-[17px]" style={{ color: C.encre }}>
            Vous pouvez poursuivre votre préparation.<br className="hidden sm:inline" /> Le planificateur sélectionnera automatiquement <strong className="font-bold">la prochaine activité la plus pertinente</strong> en tenant compte de vos priorités, de votre progression et des révisions à venir.
          </p>
        </DialogPrimitive.Description>

        <ul className="mt-[26px] grid grid-cols-3 text-center text-[13px] leading-[18px] sm:text-[14.5px] sm:leading-[19px]" style={{ color: C.encre }}>
          {[
            { icon: <TargetArrow className="h-7 w-7" />, label: <>Toujours<br />dans vos priorités</> },
            { icon: <Bars className="h-7 w-7" />, label: <>Adapté à<br />votre progression</> },
            { icon: <Clock className="h-7 w-7" strokeWidth={2.4} />, label: <>Pour optimiser<br />votre temps</> },
          ].map((f, i) => (
            <li key={i} className={cn('flex flex-col items-center gap-[10px] px-1', i > 0 && 'border-l border-[#e9dcd8]')}>
              <span className="grid h-[56px] w-[56px] place-items-center rounded-full" style={{ background: C.roseRond, color: C.bordeaux }}>{f.icon}</span>
              <span>{f.label}</span>
            </li>
          ))}
        </ul>

        <div className="mt-[28px] space-y-[12px]">
          <button type="button" onClick={onContinue} disabled={!!pending}
            className="flex h-[58px] w-full items-center justify-center gap-3 rounded-full text-[18px] font-semibold text-white shadow-[0_8px_20px_-10px_rgba(99,11,33,0.7)] transition hover:brightness-110 disabled:opacity-70 sm:h-[64px] sm:text-[21px]"
            style={{ background: C.bouton }}>
            {pending === 'continue' ? <Loader2 className="h-5 w-5 animate-spin" /> : null}{DAY_DONE_CONTINUE}<ChevronRight className="h-6 w-6" strokeWidth={2.2} />
          </button>
          <button type="button" onClick={onStop} disabled={!!pending}
            className="flex h-[48px] w-full items-center justify-center gap-2 rounded-full border-[1.6px] bg-white/60 text-[15.5px] font-semibold transition hover:bg-white disabled:opacity-70 sm:h-[51px] sm:text-[16px]"
            style={{ borderColor: C.bordeaux, color: C.bordeaux }}>
            {pending === 'stop' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{DAY_DONE_STOP}<ChevronRight className="h-5 w-5" strokeWidth={2.2} />
          </button>
        </div>
      </div>

      <div className="relative z-10 mx-4 mb-5 flex items-center gap-4 rounded-[18px] px-5 py-4 sm:mx-[40px] sm:mb-[22px] sm:gap-[22px] sm:px-[22px] sm:py-[16px]" style={{ background: '#f4e9e7' }}>
        <span className="grid h-[48px] w-[48px] shrink-0 place-items-center rounded-full sm:h-[56px] sm:w-[56px]" style={{ background: '#f0dccc', color: '#8b4a2b' }}>
          <Lightbulb className="h-7 w-7" strokeWidth={1.8} />
        </span>
        <div>
          <p className={cn(serif.className, 'text-[19px] font-bold leading-tight sm:text-[21px]')} style={{ color: C.bordeaux }}>Astuce</p>
          <p className="mt-0.5 text-[13.5px] leading-[19px] sm:text-[14.5px] sm:leading-[20px]" style={{ color: '#3d3f56' }}>
            Même quelques minutes supplémentaires peuvent faire la différence.<br />Le planificateur s’adapte en temps réel à votre rythme.
          </p>
        </div>
      </div>
    </Shell>
  );
}

/* ═══ 2. Temps de préparation limité ═══ */

function fmtDay(minutes: number): string {
  const h = Math.floor(minutes / 60); const m = Math.round(minutes % 60);
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, '0')}`;
}

export function InsufficientTimeModal({ open, onOpenChange, figures, first, onPrimary, onEdit, pending, dismissable = true }: {
  open: boolean; onOpenChange: (v: boolean) => void; figures: TimeFigures; dismissable?: boolean;
  /** Première génération : « Créer mon planning » ; sinon « Conserver mes disponibilités ». */
  first: boolean;
  onPrimary: () => void; onEdit: () => void; pending?: boolean;
}) {
  const hours = Math.round(figures.plannableMinutes / 60);
  return (
    <Shell open={open} onOpenChange={onOpenChange} label="Temps de préparation limité" className="max-w-[880px] bg-[#fefdfe]" dismissable={dismissable}>
      <div aria-hidden className="pointer-events-none absolute right-0 top-0 hidden h-[400px] w-[340px] md:block">
        <Image src="/planificateur/temps-photo.jpg" alt="" fill sizes="340px" className="object-cover" priority />
        <div className="absolute inset-y-0 left-0 w-[34%] bg-gradient-to-r from-[#fefdfe] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#fefdfe] to-transparent" />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[300px] bg-gradient-to-b from-[#fdf1f0] to-transparent" />

      <div className="relative z-10 px-5 pb-5 pt-7 sm:px-[28px] sm:pb-[22px] sm:pt-[42px]">
        <div className="md:max-w-[540px]">
          <div className="flex items-center gap-4 pl-0 sm:gap-[20px] sm:pl-[10px] md:w-[620px]">
            <span className="grid h-[64px] w-[64px] shrink-0 place-items-center rounded-full sm:h-[83px] sm:w-[83px]" style={{ background: 'radial-gradient(circle at 40% 35%, #fdeceb, #f8d9d7)' }}>
              <Hourglass className="h-8 w-8 sm:h-[42px] sm:w-[42px]" style={{ color: '#7a0f2e' }} strokeWidth={2} />
            </span>
            <DialogPrimitive.Title asChild>
              <h2 className={cn(serif.className, 'text-[25px] font-bold leading-[1.1] sm:text-[33px]')} style={{ color: '#150a10' }}>
                Votre temps de préparation <br className="hidden sm:inline" />est actuellement <span style={{ color: '#7a0f2e' }}>limité</span>
              </h2>
            </DialogPrimitive.Title>
          </div>
          <DialogPrimitive.Description asChild>
            <div className="mt-[14px] space-y-[12px] pl-0 text-[14px] leading-[20.5px] sm:pl-[12px] sm:text-[14.8px]" style={{ color: C.texte }}>
              <p>Au regard du temps restant avant l’épreuve et des disponibilités que vous avez indiquées, il n’est pas possible de programmer l’ensemble du programme avec le niveau d’approfondissement recommandé.</p>
              <p>Le planificateur va donc organiser vos révisions en donnant la priorité aux connaissances les plus importantes et à vos principaux axes de progression.</p>
            </div>
          </DialogPrimitive.Description>

          <div className="mt-[18px] grid grid-cols-3 rounded-[14px] border border-[#f2e3e4] bg-[#fcf7f7]/95 py-[14px] shadow-[0_6px_18px_-12px_rgba(122,15,46,0.25)]">
            {[
              { icon: <CalendarDays className="h-[30px] w-[30px]" strokeWidth={1.7} />, label: <>Jours restants<br />avant l’épreuve</>, value: `${figures.daysLeft} jours`, sub: null },
              { icon: <Clock className="h-[30px] w-[30px]" strokeWidth={1.7} />, label: <>Votre disponibilité<br />moyenne</>, value: `${fmtDay(figures.avgMinutesPerDay)} / jour`, sub: `${figures.daysPerWeek} jour${figures.daysPerWeek > 1 ? 's' : ''} / semaine` },
              { icon: <ChartColumnIncreasing className="h-[30px] w-[30px]" strokeWidth={1.7} />, label: <>Temps de préparation<br />planifiable</>, value: `≈ ${hours} heures`, sub: 'jusqu’à l’épreuve' },
            ].map((s, i) => (
              <div key={i} className={cn('flex gap-2.5 px-3 sm:px-[16px]', i > 0 && 'border-l border-[#eadfe0]')}>
                <span className="mt-0.5 hidden shrink-0 sm:block" style={{ color: '#7a0f2e' }}>{s.icon}</span>
                <div className="min-w-0">
                  <p className="text-[11.5px] leading-[16px] sm:whitespace-nowrap sm:text-[13px]" style={{ color: C.texte }}>{s.label}</p>
                  <p className="mt-[6px] text-[15px] font-bold leading-tight sm:whitespace-nowrap sm:text-[21px]" style={{ color: '#6d0a22' }}>{s.value}</p>
                  {s.sub && <p className="mt-0.5 text-[11.5px] sm:text-[12.5px]" style={{ color: C.texte }}>{s.sub}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-[18px] flex items-start gap-4 rounded-[14px] px-4 py-[16px] sm:gap-[20px] sm:px-[20px]" style={{ background: 'linear-gradient(90deg, #fdeceb, #fcefee 60%, #fbf1f0)' }}>
          <span className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full sm:h-[64px] sm:w-[64px]" style={{ background: '#fcd9d6', color: '#8c1233' }}>
            <TargetArrow className="h-7 w-7 sm:h-8 sm:w-8" />
          </span>
          <div>
            <p className={cn(serif.className, 'text-[16px] font-bold leading-snug sm:text-[17.5px]')} style={{ color: '#5c0a1c' }}>Notre objectif : vous aider à tirer le meilleur parti de ce temps</p>
            <p className="mt-1 text-[13px] leading-[19.5px] sm:text-[13.8px]" style={{ color: C.texte }}>
              Le planificateur construit un programme personnalisé en fonction de votre voie, du temps restant, de vos disponibilités et de votre niveau déclaré (puis de vos résultats réels). Il vous propose un ordre de travail optimisé pour maximiser votre progression.
            </p>
          </div>
        </div>

        <ul className="mt-[18px] grid grid-cols-2 gap-y-5 text-center sm:grid-cols-4">
          {[
            { icon: <List className="h-[26px] w-[26px]" strokeWidth={2.6} />, title: 'Priorisation intelligente', color: '#2a0c22', text: 'Les connaissances essentielles et vos points faibles sont traités en priorité.' },
            { icon: <Settings className="h-[26px] w-[26px]" strokeWidth={2.6} />, title: 'Planning adaptatif', color: '#6d0a1c', text: 'Votre planning évolue automatiquement selon votre progression et votre rythme de travail.' },
            { icon: <Zap className="h-[26px] w-[26px] fill-current" strokeWidth={1.5} />, title: 'Vous avancez plus vite ?', color: '#6d0a1c', text: 'Vous pouvez réaliser à tout moment les séances suivantes. Le planificateur s’adapte et vous propose de nouveaux contenus.' },
            { icon: <Bars className="h-[26px] w-[26px]" />, title: 'Vous prenez du retard ?', color: '#6d0a1c', text: 'Le planning se réorganise automatiquement pour rester réaliste et efficace.' },
          ].map((f, i) => (
            <li key={i} className={cn('flex flex-col items-center px-2 sm:px-1.5', i > 0 && 'sm:border-l sm:border-[#eef0f4]')}>
              <span className="grid h-[52px] w-[52px] place-items-center rounded-full" style={{ background: '#fce8e8', color: '#8c1233' }}>{f.icon}</span>
              <p className={cn(serif.className, 'mt-[12px] text-[14.5px] font-bold leading-tight sm:text-[15.5px]')} style={{ color: f.color }}>{f.title}</p>
              <p className="mt-[7px] text-[12.5px] leading-[18px] sm:text-[13.5px]" style={{ color: C.texte }}>{f.text}</p>
            </li>
          ))}
        </ul>

        <div className="mt-[18px] flex items-center gap-4 rounded-[14px] border border-[#f6e7cc] px-4 py-[14px] sm:gap-[20px] sm:px-[20px]" style={{ background: '#fff9ee' }}>
          <span className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full sm:h-[62px] sm:w-[62px]" style={{ background: '#fbe0ae', color: '#3c2413' }}>
            <BookOpen className="h-7 w-7" strokeWidth={1.9} />
          </span>
          <div>
            <p className={cn(serif.className, 'text-[16px] font-bold leading-snug sm:text-[17px]')} style={{ color: '#610a14' }}>L’ensemble du programme reste à maîtriser pour l’EVC</p>
            <p className="mt-0.5 text-[12.5px] leading-[18px] sm:text-[13px]" style={{ color: C.texte }}>
              La priorité accordée à certains items constitue une aide à l’organisation de vos révisions, elle ne signifie jamais qu’un autre item peut être écarté de votre préparation. Tous les items sont susceptibles d’être évalués le jour de l’épreuve.
            </p>
          </div>
        </div>

        <div className="relative mt-[12px] flex items-center gap-4 rounded-[14px] px-4 py-[14px] sm:gap-[20px] sm:px-[20px] sm:pr-[210px]" style={{ background: '#f6eff0' }}>
          <span className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full sm:h-[66px] sm:w-[66px]" style={{ background: '#f2d9da', color: '#6d0a22' }}>
            <Trophy className="h-7 w-7 fill-current" strokeWidth={1.4} />
          </span>
          <div>
            <p className={cn(serif.className, 'text-[16px] font-bold leading-snug sm:text-[17px]')} style={{ color: '#5e0a18' }}>Votre réussite dépend en grande partie de vous.</p>
            <p className="mt-0.5 text-[12.5px] leading-[18px] sm:text-[13px]" style={{ color: C.texte }}>
              Le planificateur vous aide à organiser votre préparation dans les meilleures conditions. Votre travail personnel, votre régularité et votre implication restent déterminants.
            </p>
          </div>
          <Image src="/planificateur/meme-ambition.png" alt="" aria-hidden width={175} height={80} className="pointer-events-none absolute right-[18px] top-1/2 hidden h-[80px] w-auto -translate-y-1/2 sm:block" />
        </div>

        <div className="mt-[20px] grid gap-3 sm:grid-cols-2 sm:gap-[20px] sm:px-[80px]">
          <button type="button" onClick={onEdit} disabled={pending}
            className="h-[44px] rounded-full border-[1.5px] bg-white text-[14.5px] font-semibold transition hover:bg-[#fdf6f6] disabled:opacity-70"
            style={{ borderColor: '#7a0f2e', color: '#5c0a1c' }}>
            {INSUFFICIENT_EDIT}
          </button>
          <div>
            <button type="button" onClick={onPrimary} disabled={pending}
              className="flex h-[44px] w-full items-center justify-center gap-3 rounded-full text-[14.5px] font-semibold text-white shadow-[0_8px_18px_-10px_rgba(115,13,49,0.8)] transition hover:brightness-110 disabled:opacity-70"
              style={{ background: C.boutonB }}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}{first ? FIRST_PLAN_BUTTON : INSUFFICIENT_KEEP}<ChevronRight className="h-5 w-5" strokeWidth={2.2} />
            </button>
            <p className="mt-[8px] text-center text-[11px]" style={{ color: '#555f84' }}>Vous pourrez ajuster vos disponibilités à tout moment.</p>
          </div>
        </div>
      </div>
    </Shell>
  );
}

/* ═══ 3. Message obligatoire de la première génération (texte imposé) ═══ */
export function FirstPlanModal({ open, onOpenChange, onCreate, pending }: {
  open: boolean; onOpenChange: (v: boolean) => void; onCreate: () => void; pending?: boolean;
}) {
  return (
    <Shell open={open} onOpenChange={onOpenChange} label={FIRST_PLAN_TITLE} className="max-w-[880px] bg-[#fefdfe]" dismissable={false}>
      <div aria-hidden className="pointer-events-none absolute right-0 top-0 hidden h-[400px] w-[340px] md:block">
        <Image src="/planificateur/temps-photo.jpg" alt="" fill sizes="340px" className="object-cover" priority />
        <div className="absolute inset-y-0 left-0 w-[34%] bg-gradient-to-r from-[#fefdfe] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#fefdfe] to-transparent" />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[300px] bg-gradient-to-b from-[#fdf1f0] to-transparent" />
      <div className="relative z-10 px-5 pb-6 pt-7 sm:px-[38px] sm:pb-[26px] sm:pt-[42px]">
        <div className="flex items-center gap-4 sm:gap-[20px] md:w-[620px]">
          <span className="grid h-[64px] w-[64px] shrink-0 place-items-center rounded-full sm:h-[83px] sm:w-[83px]" style={{ background: 'radial-gradient(circle at 40% 35%, #fdeceb, #f8d9d7)' }}>
            <CalendarDays className="h-8 w-8 sm:h-[40px] sm:w-[40px]" style={{ color: '#7a0f2e' }} strokeWidth={1.9} />
          </span>
          <DialogPrimitive.Title asChild>
            <h2 className={cn(serif.className, 'text-[25px] font-bold leading-[1.1] sm:text-[33px]')} style={{ color: '#150a10' }}>
              Votre planning de révision <span style={{ color: '#7a0f2e' }}>personnalisé</span>
            </h2>
          </DialogPrimitive.Title>
        </div>
        <DialogPrimitive.Description asChild>
          <div className="mt-[18px] space-y-[12px] text-[14.2px] leading-[21px] sm:text-[14.8px]" style={{ color: C.texte }}>
            <p className="md:max-w-[520px]">{FIRST_PLAN_TEXT[0]}</p>
            <p className="md:max-w-[520px]">{FIRST_PLAN_TEXT[1]}</p>
          </div>
        </DialogPrimitive.Description>
        <div className="mt-[18px] flex items-start gap-4 rounded-[14px] border border-[#f6e7cc] px-4 py-[14px] sm:gap-[20px] sm:px-[20px]" style={{ background: '#fff9ee' }}>
          <span className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full sm:h-[62px] sm:w-[62px]" style={{ background: '#fbe0ae', color: '#3c2413' }}>
            <BookOpen className="h-7 w-7" strokeWidth={1.9} />
          </span>
          <p className="text-[13.2px] leading-[19.5px] sm:text-[13.8px]" style={{ color: C.texte }}>{FIRST_PLAN_TEXT[2]}</p>
        </div>
        <div className="mt-[12px] flex items-start gap-4 rounded-[14px] px-4 py-[14px] sm:gap-[20px] sm:px-[20px]" style={{ background: 'linear-gradient(90deg, #fdeceb, #fcefee 60%, #fbf1f0)' }}>
          <span className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full sm:h-[62px] sm:w-[62px]" style={{ background: '#fcd9d6', color: '#8c1233' }}>
            <TargetArrow className="h-7 w-7" />
          </span>
          <div className="space-y-1.5 text-[13.2px] leading-[19.5px] sm:text-[13.8px]" style={{ color: C.texte }}>
            <p>{FIRST_PLAN_TEXT[3]}</p>
            <p>{FIRST_PLAN_TEXT[4]}</p>
          </div>
        </div>
        <div className="relative mt-[12px] flex items-center gap-4 rounded-[14px] px-4 py-[14px] sm:gap-[20px] sm:px-[20px] sm:pr-[210px]" style={{ background: '#f6eff0' }}>
          <span className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full sm:h-[66px] sm:w-[66px]" style={{ background: '#f2d9da', color: '#6d0a22' }}>
            <Trophy className="h-7 w-7 fill-current" strokeWidth={1.4} />
          </span>
          <p className="text-[13.2px] leading-[19.5px] sm:text-[13.8px]" style={{ color: C.texte }}>{FIRST_PLAN_TEXT[5]}</p>
          <Image src="/planificateur/meme-ambition.png" alt="" aria-hidden width={175} height={80} className="pointer-events-none absolute right-[18px] top-1/2 hidden h-[80px] w-auto -translate-y-1/2 sm:block" />
        </div>
        <div className="mx-auto mt-[22px] max-w-[400px]">
          <button type="button" onClick={onCreate} disabled={pending}
            className="flex h-[48px] w-full items-center justify-center gap-3 rounded-full text-[15.5px] font-semibold text-white shadow-[0_8px_18px_-10px_rgba(115,13,49,0.8)] transition hover:brightness-110 disabled:opacity-70"
            style={{ background: C.boutonB }}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}{FIRST_PLAN_BUTTON}<ChevronRight className="h-5 w-5" strokeWidth={2.2} />
          </button>
          <p className="mt-[8px] text-center text-[11px]" style={{ color: '#555f84' }}>Vous pourrez ajuster vos disponibilités à tout moment.</p>
        </div>
      </div>
    </Shell>
  );
}

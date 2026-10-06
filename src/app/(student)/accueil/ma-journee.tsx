'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, BookOpenText, CalendarCheck, ChevronDown, ClipboardCheck, Clock, Lightbulb, Play, RefreshCcw, Target, Trophy,
} from 'lucide-react';
import { EngineRefresher, ExamInvite, Notifications, type TodayProgramData } from '@/components/student/moteur/today-program';
import type { ProgramActivity } from '@/lib/moteur/program';
import { noterRepereAction } from '@/lib/student/guide-actions';
import { cn } from '@/lib/utils';
import { EnTeteBloc, lienBloc } from './ui';

/**
 * Section 1 de l'accueil — « Ma journée » : le programme du jour UNIQUE du
 * moteur central (planificateur, révisions dues, contrôles, activités
 * commencées), quatre activités visibles, les autres se déplient.
 */

export type ConseilLigne = { cle: string; texte: string; href: string };

const ICONE: Record<ProgramActivity['kind'], typeof Target> = {
  en_cours: Play, concours_blanc: Trophy, planificateur: BookOpenText, revision: Target, consolidation: Target,
  reactivation: RefreshCcw, controle: ClipboardCheck, suggestion: Play,
};
/** Origine par défaut quand l'activité n'en porte pas d'autre que son libellé. */
const ORIGINE: Record<ProgramActivity['kind'], string> = {
  en_cours: 'Activité commencée', concours_blanc: 'Épreuve blanche', planificateur: 'Item EVC', revision: 'Révision',
  consolidation: 'Révision', reactivation: 'Réactivation', controle: 'Contrôle', suggestion: 'Suggestion',
};

const fmtMin = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}` : `${m} min`);
const VISIBLES = 4;

function Ligne({ a, rang }: { a: ProgramActivity; rang: number }) {
  const Icon = ICONE[a.kind];
  const origine = a.origins.find((o) => o !== a.label) ?? ORIGINE[a.kind];
  const detail = [origine, a.reasons[0]].filter(Boolean).join(' · ');
  return (
    <li>
      <Link href={a.href} className="group flex items-center gap-3 rounded-xl border border-(--color-border) bg-(--color-surface) px-3 py-2.5 transition-colors hover:border-[#C0112E]/35 hover:bg-[#FDF4F5]/50 focus-ring">
        <span className="w-4 shrink-0 text-center text-[13px] font-bold tabular-nums text-(--color-ink-soft)">{rang}</span>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#FDF4F5] text-[#C0112E] ring-1 ring-[#F6D9DD]" aria-hidden>
          <Icon className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="inline-block rounded-md bg-[#FDF4F5] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#C0112E]">{a.label}</span>
          <span className="mt-0.5 block truncate text-sm font-bold text-[#14254E] dark:text-(--color-ink)">{a.itemName}</span>
          {detail && <span className="block truncate text-xs text-(--color-ink-soft)" title={a.reasons.join(' · ')}>{detail}</span>}
        </span>
        <span className="hidden shrink-0 items-center gap-1.5 text-[13px] tabular-nums text-(--color-ink-soft) sm:inline-flex">
          <Clock className="h-4 w-4" aria-hidden /> {fmtMin(a.minutes)}
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 text-[#C0112E] transition-transform group-hover:translate-x-0.5" aria-hidden />
      </Link>
    </li>
  );
}

function Conseil({ conseil }: { conseil: ConseilLigne }) {
  // Premier affichage du jour (une fois par appareil) : fait tourner les conseils restés sans effet.
  useEffect(() => {
    const jour = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Paris' });
    const cle = `mecn_conseil_vu:${conseil.cle}:${jour}`;
    try {
      if (window.localStorage.getItem(cle) === '1') return;
      window.localStorage.setItem(cle, '1');
    } catch { /* mode privé */ }
    void noterRepereAction(`suggestion-vue:${conseil.cle}`);
  }, [conseil.cle]);
  return (
    <Link href={conseil.href} className="mt-3 flex items-start gap-2.5 rounded-xl border border-[#F6D9DD] bg-[#FDF4F5] px-3.5 py-2.5 text-[13px] leading-snug text-(--color-ink-soft) transition-colors hover:bg-[#FBE9EC] focus-ring dark:border-(--color-border) dark:bg-(--color-surface-soft)">
      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-[#E8742C]" aria-hidden />
      <span><strong className="font-semibold text-[#8B0E22] dark:text-[#F89BA3]">Conseil du jour :</strong> {conseil.texte}</span>
    </Link>
  );
}

export function MaJournee({ data, conseil }: { data: TodayProgramData; conseil: ConseilLigne | null }) {
  const [tout, setTout] = useState(false);
  const todo = data.activities.filter((a) => !a.done);
  const faites = data.activities.length - todo.length;
  const visibles = tout ? todo : todo.slice(0, VISIBLES);
  const autres = todo.length - VISIBLES;
  return (
    <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-soft) sm:p-5" aria-labelledby="ma-journee">
      <EngineRefresher stale={data.stale} />
      <EnTeteBloc
        numero={1} id="ma-journee" icon={CalendarCheck} titre="Ma journée"
        description="Un programme personnalisé pour progresser efficacement."
        action={<Link href="/planificateur" className={lienBloc}>Voir mon planning <ArrowRight className="h-3.5 w-3.5" aria-hidden /></Link>}
      />
      {data.notifications.length > 0 && <div className="mt-3"><Notifications items={data.notifications} /></div>}
      {data.examInvite && <div className="mt-3"><ExamInvite /></div>}

      {todo.length === 0 ? (
        <p className="mt-4 rounded-xl bg-(--color-surface-soft) px-4 py-3 text-sm text-(--color-ink-soft)">
          {faites > 0 ? 'Programme du jour terminé : vous pouvez poursuivre librement.' : 'Rien d’urgent aujourd’hui : entretenez vos acquis.'}
        </p>
      ) : (
        <ol className="mt-4 space-y-2">
          {visibles.map((a, i) => <Ligne key={a.key} a={a} rang={i + 1} />)}
        </ol>
      )}

      {todo.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-[13px]">
          {autres > 0 ? (
            <button type="button" onClick={() => setTout((v) => !v)} aria-expanded={tout} className="inline-flex items-center gap-1 font-semibold text-[#C0112E] hover:underline focus-ring">
              {tout ? 'Réduire la liste' : `${autres} autre${autres > 1 ? 's' : ''} activité${autres > 1 ? 's' : ''} dans votre journée`}
              <ChevronDown className={cn('h-4 w-4 transition-transform', tout && 'rotate-180')} aria-hidden />
            </button>
          ) : <span />}
          <span className="text-(--color-ink-soft)">Temps total estimé : <strong className="text-[#14254E] dark:text-(--color-ink)">{fmtMin(data.remainingMinutes)}</strong></span>
        </div>
      )}

      <Link
        href={data.start?.href ?? '/revisions-transversales'}
        className="mt-4 flex items-center gap-4 rounded-2xl bg-[linear-gradient(90deg,#E4002B_0%,#F97316_100%)] px-5 py-3.5 text-white shadow-[0_14px_30px_-16px_rgba(228,0,43,0.9)] transition-transform hover:scale-[1.005] focus-ring"
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-[#E4002B]" aria-hidden><Play className="ml-0.5 h-5 w-5 fill-current" /></span>
        <span className="min-w-0 flex-1">
          <span className="block font-(family-name:--font-jakarta) text-[17px] font-extrabold leading-tight">{faites > 0 && todo.length > 0 ? 'Continuer ma journée' : 'Commencer ma journée'}</span>
          <span className="block text-[13px] text-white/85">Major vous guide activité après activité.</span>
        </span>
        <ArrowRight className="h-5 w-5 shrink-0" aria-hidden />
      </Link>

      {conseil && <Conseil conseil={conseil} />}
    </section>
  );
}

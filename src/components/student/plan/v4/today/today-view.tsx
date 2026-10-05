'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { AlertTriangle, CalendarClock, ChevronDown, ChevronRight, Info, Loader2, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ActivityCard, TodayData } from '@/lib/plan/pages';
import { DAY_DONE_TITLE, EXTRA_TIME_LABEL, FORECAST_NOTICE, PARCOURS_NEW, PRODUCT_RULE, REMINDER_SHORT } from '@/lib/plan/types';
import {
  acknowledgeInsufficientAction, acknowledgeYesterdayAction, closeDayAction, dismissInviteAction, logCoachingAction, redistributeAction, reorganizeAction, startActivityAction,
} from '@/app/(student)/planificateur/actions';
import { DayDoneModal, InsufficientTimeModal, type TimeFigures } from '../../plan-modals';
import { planSerif } from '../fonts';
import { ActivityCardView, fmtMinutes } from './activity-card';
import { AddTodayDialog, Btn, CancelDialog, ErrorText, ExtraTimeDialog, IncompleteDayDialog, PostponeDialog, fmtDay } from './dialogs';

const PRIORITY_REASON: Record<string, string> = {
  COVERAGE: 'au rythme actuel, tout le programme ne pourra pas être couvert avant l’épreuve',
  P1_BACKLOG: 'les items indispensables restants dépassent la capacité des trois prochaines semaines',
  COMPLETION: 'la réalisation des derniers jours reste faible malgré un programme allégé',
};

/** « mardi 6 octobre » → « Mardi 6 octobre » (le mois reste en minuscule). */
const capitalizeFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function TodayView({ data, action, figures }: { data: TodayData; action: string | null; figures: TimeFigures | null }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  // Lien d'action « reporter » venu de l'accueil : la fenêtre s'ouvre d'emblée sur les activités non commencées.
  const [postpone, setPostpone] = useState<ActivityCard[] | null>(() => {
    if (action !== 'reporter') return null;
    const list = data.activities.filter((a) => ['DUE', 'PLANNED', 'PENDING', 'IN_PROGRESS'].includes(a.status) && !a.startedAt && a.validatedUnits === 0);
    return list.length > 0 ? list : null;
  });
  const [incomplete, setIncomplete] = useState(action === 'journee-incomplete');
  const [cancel, setCancel] = useState<ActivityCard | null>(null);
  const [addToday, setAddToday] = useState<ActivityCard | null>(null);
  const [extra, setExtra] = useState(false);
  const [showRemaining, setShowRemaining] = useState(action === 'restantes');
  const [yesterdayOpen, setYesterdayOpen] = useState(!!data.yesterday);
  const [dayDoneOpen, setDayDoneOpen] = useState(false);
  const [insufficientOpen, setInsufficientOpen] = useState(!!figures && !!data.summary?.insufficientTime && !data.insufficientAck);
  const [invite, setInvite] = useState(data.v41Invite);
  const open = data.activities.filter((a) => ['DUE', 'PLANNED', 'PENDING', 'IN_PROGRESS'].includes(a.status));
  const notStarted = open.filter((a) => !a.startedAt && a.validatedUnits === 0);
  const next = open[0] ?? null;
  const items = useMemo(() => Array.from(new Map(data.activities.filter((a) => a.itemId).map((a) => [a.itemId!, { id: a.itemId!, name: a.itemName ?? '' }])).values()), [data.activities]);

  // Liens d'action venus de l'accueil (cahier « Alertes » §20, §21, §28).
  const actionRan = useRef(false);
  useEffect(() => {
    // Une seule exécution du lien d'action (le mode strict de React rejoue les effets en développement).
    if (actionRan.current) return;
    actionRan.current = true;
    if (action === 'reorganiser' || action === 'repartir') {
      start(async () => {
        const r = action === 'repartir' ? await redistributeAction() : await reorganizeAction();
        if (!r.ok) setError(r.error);
        router.replace('/planificateur');
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // « Programme du jour terminé » : une fois par journée et par onglet, après le montage
  // (le pop-up n'existe pas dans le rendu serveur).
  useEffect(() => {
    if (!data.dayDone || data.closedByUser) return;
    const key = `plan-day-done:${data.today}`;
    const t = window.setTimeout(() => {
      try { if (sessionStorage.getItem(key)) return; sessionStorage.setItem(key, '1'); } catch { /* stockage indisponible : le pop-up s'affiche */ }
      setDayDoneOpen(true);
    }, 0);
    return () => window.clearTimeout(t);
  }, [data.dayDone, data.closedByUser, data.today]);

  const advance = (a: ActivityCard) => start(async () => {
    setError(null);
    const r = await startActivityAction(a.id);
    if (!r.ok) { setError(r.error); return; }
    router.push(`/planificateur/activite/${a.id}`);
  });
  const actions = { onPostpone: (a: ActivityCard) => setPostpone([a]), onCancel: (a: ActivityCard) => setCancel(a), onAddToday: (a: ActivityCard) => setAddToday(a), onAdvance: advance };
  const pct = data.progress.rate === null ? null : Math.round(data.progress.rate * 100);

  return (
    <div className="mt-[18px] space-y-[18px]">
      <ErrorText error={error} />

      {invite && (
        <Banner tone="info" icon={<Sparkles className="h-5 w-5" />} title="Votre planificateur évolue" onClose={() => { setInvite(false); start(async () => { await dismissInviteAction(); }); }}>
          {PRODUCT_RULE} Votre niveau déclaré a été repris par domaine : précisez-le item par item et indiquez vos préférences pour un planning encore plus personnel.
          <div className="mt-2 flex flex-wrap gap-2"><Link href="/planificateur/auto-evaluation" className="font-semibold text-(--pl-bordeaux) underline">Préciser mon auto-évaluation</Link></div>
        </Banner>
      )}

      {data.yesterday && yesterdayOpen && (
        <Banner tone="alert" icon={<CalendarClock className="h-5 w-5" />} title="Vous n’avez pas terminé votre programme d’hier." onClose={() => { setYesterdayOpen(false); start(async () => { await acknowledgeYesterdayAction(); }); }}>
          {data.yesterday.done}/{data.yesterday.planned} activités réalisées. Le reste n’a pas été ajouté aveuglément à aujourd’hui : vos priorités ont été recalculées et votre programme reste réaliste.
          <div className="mt-2.5 flex flex-wrap items-center gap-3">
            <Btn primary pending={pending} onClick={() => start(async () => { const r = await reorganizeAction(); if (!r.ok) setError(r.error); setYesterdayOpen(false); router.refresh(); })}>Réorganiser mon programme</Btn>
            <button type="button" onClick={() => setShowRemaining((v) => !v)} className="inline-flex items-center gap-1 text-[14px] font-semibold text-(--pl-bordeaux) underline">
              Voir les activités restantes<ChevronDown className={cn('h-4 w-4 transition', showRemaining && 'rotate-180')} />
            </button>
          </div>
          {showRemaining && (
            <ul className="mt-2.5 space-y-1 text-[14px]">
              {data.yesterday.remaining.map((a) => <li key={a.id}>• {a.blockLabel} — {a.itemName ?? a.typeLabel} ({fmtMinutes(a.minutes)})</li>)}
            </ul>
          )}
        </Banner>
      )}

      {data.summary?.priorityMode && (
        <Banner tone="warn" icon={<AlertTriangle className="h-5 w-5" />} title="Votre préparation doit maintenant être priorisée.">
          {data.summary.priorityReasons.length > 0 ? `Le planificateur est passé en mode prioritaire : ${data.summary.priorityReasons.map((r) => PRIORITY_REASON[r] ?? r).join(' ; ')}.` : 'Le planificateur est en mode prioritaire.'}{' '}
          Il protège les items indispensables et vos réactivations, et privilégie les notions incontournables. Tout le programme risque de ne pas pouvoir être travaillé : l’ensemble reste néanmoins à connaître pour l’EVC.
          {data.summary.projection && <span className="mt-1.5 block font-semibold text-(--pl-ink)">Couverture estimée à l’épreuve : {Math.round(data.summary.projection.projectedCoverage * 100)} % · items indispensables (P1) déjà couverts : {data.summary.projection.p1Covered}/{data.summary.projection.p1Total}</span>}
        </Banner>
      )}

      {data.summary?.overload && (
        <Banner tone="warn" icon={<AlertTriangle className="h-5 w-5" />} title="Votre programme semble supérieur à votre disponibilité actuelle.">
          La réalisation des derniers jours indique une charge trop importante. Un programme réaliste vaut mieux qu’un programme intenable.
          <div className="mt-2"><Link href="/planificateur/objectifs?action=adapter" className="font-semibold text-(--pl-bordeaux) underline">Adapter mon programme</Link></div>
        </Banner>
      )}

      {/* Aujourd'hui */}
      <section aria-labelledby="pl-today" className="pl-card px-[20px] py-[16px]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 id="pl-today" className={cn(planSerif.className, 'text-[22px] font-bold text-(--pl-ink)')}>Aujourd’hui, {fmtDay(data.today)}</h2>
            <p className="mt-0.5 text-[14.5px] text-(--pl-text)">
              {data.progress.planned === 0 ? 'Aucune activité prévue aujourd’hui (jour OFF).' : (
                <>{data.progress.done}/{data.progress.planned} activité{data.progress.planned > 1 ? 's' : ''} réalisée{data.progress.planned > 1 ? 's' : ''} · {fmtMinutes(data.progress.minutesPlanned)} prévues{pct !== null ? ` · programme réalisé : ${pct} %` : ''}</>
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {next && <Link href={`/planificateur/activite/${next.id}`} className="inline-flex h-[42px] items-center gap-1.5 rounded-full bg-(--pl-pill) px-[18px] text-[14.5px] font-semibold text-white transition hover:brightness-110">Continuer maintenant<ChevronRight className="h-4 w-4" strokeWidth={2.4} /></Link>}
            {notStarted.length > 0 && <Btn onClick={() => setPostpone(notStarted)}>Reporter le reste</Btn>}
            {open.length > 0 && <Btn onClick={() => setIncomplete(true)}>Je ne peux pas terminer aujourd’hui</Btn>}
            {open.length === 0 && !data.declaredIncomplete && <Btn onClick={() => setExtra(true)}>{EXTRA_TIME_LABEL}</Btn>}
            {open.length === 0 && data.declaredIncomplete && <span className="text-[13.5px] text-(--pl-muted)">Journée déclarée incomplète : le reste a été reporté et sera replacé selon vos priorités.</span>}
          </div>
        </div>
        {data.progress.planned > 0 && (
          <div className="mt-3 h-[8px] w-full overflow-hidden rounded-full bg-(--pl-rose-100)" role="progressbar" aria-label="Programme du jour réalisé" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct ?? 0}>
            <div className="h-full rounded-full bg-(--pl-crimson) transition-all" style={{ width: `${pct ?? 0}%` }} />
          </div>
        )}
      </section>

      {data.parcours && (
        <section aria-label={PARCOURS_NEW} className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-[#ecd9b8] bg-[#fff8ec] px-[18px] py-[13px] dark:border-[#4a3a22] dark:bg-[#231b10]">
          <div className="min-w-0">
            <p className="text-[12px] font-bold uppercase tracking-[0.06em] text-[#8a5a14] dark:text-[#e8c07a]">{PARCOURS_NEW}</p>
            <p className={cn(planSerif.className, 'mt-0.5 text-[17px] font-bold text-(--pl-ink)')}>{data.parcours.numero ? `Coaching ${data.parcours.numero} — ` : ''}{data.parcours.title}</p>
            <p className="text-[13.5px] text-(--pl-text)">{data.parcours.type} · {fmtMinutes(data.parcours.minutes)}{data.parcours.relevantActivityId ? ' · en lien avec votre programme du jour' : ' · nouveauté facultative'}</p>
          </div>
          {data.parcours.relevantActivityId ? (
            <Link href={`/planificateur/activite/${data.parcours.relevantActivityId}`} className="inline-flex h-[40px] items-center rounded-full bg-(--pl-pill) px-[18px] text-[14px] font-semibold text-white">Commencer</Link>
          ) : (
            <Link href={`/parcours/${data.parcours.numero ?? ''}`} onClick={() => { void logCoachingAction(data.parcours!.id, 'coaching_vu'); }} className="inline-flex h-[40px] items-center rounded-full border border-(--pl-pill) px-[18px] text-[14px] font-semibold text-(--pl-pill)">Découvrir</Link>
          )}
        </section>
      )}

      {data.activities.length > 0 && (
        <ol className="space-y-[12px]" aria-label="Programme du jour">
          {data.activities.map((a) => <li key={a.id}><ActivityCardView a={a} actions={actions} /></li>)}
        </ol>
      )}

      {data.extras.length > 0 && (
        <section aria-labelledby="pl-extras">
          <h3 id="pl-extras" className={cn(planSerif.className, 'mb-2 text-[17px] font-bold text-(--pl-ink)')}>En plus de votre programme</h3>
          <ol className="space-y-[10px]">{data.extras.map((a) => <li key={a.id}><ActivityCardView a={a} compact actions={actions} /></li>)}</ol>
        </section>
      )}

      {data.dayDone && (
        <section aria-labelledby="pl-recap" className="pl-card px-[20px] py-[16px]">
          <h3 id="pl-recap" className={cn(planSerif.className, 'text-[19px] font-bold text-(--pl-bordeaux)')}>{DAY_DONE_TITLE}</h3>
          <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Fact label="Temps réalisé" value={fmtMinutes(data.recap.minutesDone)} />
            <Fact label="Activités" value={String(data.recap.activities)} />
            <Fact label="Consolidations" value={String(data.recap.consolidations)} />
            <Fact label="Erreurs corrigées" value={String(data.recap.errorsCorrected)} />
          </dl>
          {data.recap.nextReactivations.length > 0 && (
            <p className="mt-3 text-[14px] text-(--pl-text)">Prochaines réactivations : {data.recap.nextReactivations.map((r) => `${r.itemName} (${fmtDay(r.day, false)})`).join(' · ')}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <Btn primary onClick={() => setExtra(true)}>Continuer mes révisions</Btn>
            {!data.closedByUser && <Btn onClick={() => start(async () => { await closeDayAction(); router.refresh(); })}>Terminer pour aujourd’hui</Btn>}
          </div>
        </section>
      )}

      {/* 7 prochains jours (§30) */}
      <section aria-labelledby="pl-week" className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="pl-week" className={cn(planSerif.className, 'text-[22px] font-bold text-(--pl-ink)')}>Les 7 prochains jours</h2>
          <p className="text-[13.5px] italic text-(--pl-muted)">{FORECAST_NOTICE}</p>
        </div>
        {data.forecast.map((d) => (
          <details key={d.day} className="pl-card group px-[18px] py-[12px]" open={d.day === data.forecast[0]?.day}>
            <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2">
              <span className={cn(planSerif.className, 'text-[16.5px] font-bold text-(--pl-ink)')}>{capitalizeFirst(fmtDay(d.day))}</span>
              <span className="flex items-center gap-3 text-[13.5px] text-(--pl-text)">
                {d.off ? 'Jour OFF' : `${d.activities.length} activité${d.activities.length > 1 ? 's' : ''} · ${fmtMinutes(d.minutes)} / ${fmtMinutes(d.budget)}`}
                <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
              </span>
            </summary>
            {!d.off && d.activities.length > 0 && (
              <ol className="mt-3 space-y-[10px]">{d.activities.map((a) => <li key={a.id}><ActivityCardView a={a} future compact actions={actions} /></li>)}</ol>
            )}
          </details>
        ))}
      </section>

      <p className="flex items-start gap-2 rounded-[12px] bg-(--pl-info) px-4 py-3 text-[13px] leading-relaxed text-(--pl-text)">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{REMINDER_SHORT} Major ECN met à votre disposition les contenus, les outils, la méthode et l’accompagnement nécessaires. Votre travail personnel et votre régularité restent déterminants.</span>
      </p>

      {pending && <div aria-live="polite" className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-(--pl-ink) px-4 py-2 text-[13px] text-(--pl-page)"><Loader2 className="h-4 w-4 animate-spin" />Mise à jour…</div>}

      <PostponeDialog open={!!postpone} onOpenChange={(v) => { if (!v) setPostpone(null); }} activities={postpone ?? []} today={data.today} title={postpone && postpone.length > 1 ? 'Reporter le reste' : 'Reporter'} />
      <IncompleteDayDialog open={incomplete} onOpenChange={setIncomplete} items={items} today={data.today} />
      <CancelDialog open={!!cancel} onOpenChange={(v) => { if (!v) setCancel(null); }} activity={cancel} />
      <AddTodayDialog open={!!addToday} onOpenChange={(v) => { if (!v) setAddToday(null); }} activity={addToday} replaceable={notStarted} />
      <ExtraTimeDialog open={extra} onOpenChange={setExtra} />
      <DayDoneModal open={dayDoneOpen} onOpenChange={setDayDoneOpen} onContinue={() => { setDayDoneOpen(false); setExtra(true); }}
        onStop={() => start(async () => { await closeDayAction(); setDayDoneOpen(false); router.refresh(); })} pending={pending ? 'stop' : null} />
      {figures && <InsufficientTimeModal open={insufficientOpen} onOpenChange={setInsufficientOpen} figures={figures} first={false}
        onPrimary={() => start(async () => { await acknowledgeInsufficientAction(); setInsufficientOpen(false); })} onEdit={() => router.push('/planificateur/objectifs')} />}
    </div>
  );
}

function Banner({ tone, icon, title, children, onClose }: { tone: 'info' | 'alert' | 'warn'; icon: React.ReactNode; title: string; children: React.ReactNode; onClose?: () => void }) {
  const cls = tone === 'info' ? 'bg-(--pl-info) border-[#e3e6f2] dark:border-(--pl-card-border)' : tone === 'alert' ? 'bg-(--pl-rose-50) border-(--pl-rose-200)' : 'bg-[#fff6e9] border-[#f1dcb5] dark:bg-[#251c10] dark:border-[#4a3a22]';
  return (
    <section role={tone === 'info' ? 'status' : 'alert'} className={cn('relative flex gap-3 rounded-[14px] border px-[18px] py-[14px] text-[14.5px] leading-relaxed text-(--pl-text)', cls)}>
      <span className="mt-0.5 shrink-0 text-(--pl-bordeaux)">{icon}</span>
      <div className="min-w-0 flex-1 pr-6">
        <p className="font-bold text-(--pl-ink)">{title}</p>
        <div className="mt-0.5">{children}</div>
      </div>
      {onClose && <button type="button" onClick={onClose} aria-label="Fermer" className="absolute right-3 top-3 rounded-full p-1 text-(--pl-muted) hover:bg-black/5"><X className="h-4 w-4" /></button>}
    </section>
  );
}
function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] bg-(--pl-rose-50) px-3 py-2.5">
      <dt className="text-[12.5px] text-(--pl-muted)">{label}</dt>
      <dd className="text-[19px] font-bold text-(--pl-ink)">{value}</dd>
    </div>
  );
}

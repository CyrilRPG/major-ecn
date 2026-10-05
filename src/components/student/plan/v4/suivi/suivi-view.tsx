'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowDownRight, ArrowRight, ArrowUpRight, CalendarDays, ChevronRight, Info, Lightbulb, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { deltaLabel, type Suivi } from '@/lib/plan/suivi';
import { LaurelMark } from '../brand';
import { planScript, planSerif } from '../fonts';
import { BarsFour, BarsOutline, PieSlice, QuoteMark, TargetArrow, TargetBold } from '../icons';
import { CompletionChart } from './completion-chart';

type Period = 7 | 30 | 90;
const pct = (v: number | null) => (v === null ? '—' : `${Math.round(v * 100)} %`);

function InfoTip({ text }: { text: string }) {
  return (
    <span className="group/tip relative inline-flex">
      <button type="button" aria-label={text} className="grid h-[20px] w-[20px] place-items-center rounded-full text-(--pl-muted) hover:text-(--pl-ink)">
        <Info className="h-[19px] w-[19px]" strokeWidth={1.7} />
      </button>
      <span role="tooltip" className="pointer-events-none absolute right-0 top-[26px] z-20 hidden w-[260px] rounded-[10px] bg-(--pl-ink) px-3 py-2 text-[12.5px] leading-snug text-(--pl-page) shadow-lg group-hover/tip:block group-focus-within/tip:block">
        {text}
      </span>
    </span>
  );
}

function Kpi({ icon, value, label, sub, info }: { icon: React.ReactNode; value: string; label: string; sub: string; info: string }) {
  return (
    <div className="pl-kpi relative flex h-[102px] items-center gap-[16px] pl-[16px] pr-[30px] @min-[1400px]/plan:gap-[30px] @min-[1400px]/plan:pl-[24px] @min-[1400px]/plan:pr-[14px]">
      <span className="grid h-[56px] w-[56px] shrink-0 place-items-center rounded-full bg-(--pl-rose-100) text-(--pl-bordeaux) @min-[1400px]/plan:h-[66px] @min-[1400px]/plan:w-[66px] [&>svg]:scale-[0.88] @min-[1400px]/plan:[&>svg]:scale-100">{icon}</span>
      <div className="min-w-0 leading-tight">
        <p className="text-[27px] font-bold tracking-[-0.015em] text-(--pl-ink) @min-[1400px]/plan:text-[31px]">{value}</p>
        <p className="mt-[3px] whitespace-nowrap text-[15px] text-(--pl-ink) @min-[1400px]/plan:text-[16px]">{label}</p>
        <p className="mt-[3px] whitespace-nowrap text-[13.5px] text-(--pl-text) @min-[1400px]/plan:text-[14.5px]">{sub}</p>
      </div>
      <span className="absolute right-[14px] top-[12px]"><InfoTip text={info} /></span>
    </div>
  );
}

export function SuiviView({ data }: { data: Suivi & { targetProgression: number } }) {
  const [period, setPeriod] = useState<Period>(30);
  const dist = data.distribution[period];
  const progPct = Math.round(dist.progression * 100);
  const revPct = dist.total > 0 ? 100 - progPct : 0;
  const targetProg = Math.round(data.targetProgression * 100);
  const delta = data.regularityDelta;
  const deltaText = deltaLabel(delta);

  return (
    <div className="mt-[8px] space-y-[16px]">
      {/* Indicateurs de la semaine */}
      <section aria-label="Indicateurs de la semaine" className="grid gap-[16px] @min-[640px]/plan:grid-cols-2 @min-[1100px]/plan:grid-cols-4">
        <Kpi icon={<TargetBold className="h-[38px] w-[38px]" />} value={pct(data.completionWeek)} label="du programme réalisé" sub="(sur les jours planifiés)"
          info="Part de la charge prévue réellement réalisée cette semaine : questions soumises, cartes auto-évaluées, étapes validées. Le temps passé n’est jamais compté." />
        <Kpi icon={<CalendarDays className="h-[36px] w-[36px]" strokeWidth={2.1} />} value={`${data.workedDaysWeek} / ${data.plannedDaysWeek}`} label="jours planifiés travaillés" sub="cette semaine"
          info="Journées planifiées où vous avez réellement travaillé. Les jours OFF (sans disponibilité) ne comptent pas." />
        <Kpi icon={<List className="h-[38px] w-[38px]" strokeWidth={2.7} />} value={`${data.activitiesDoneWeek} / ${data.activitiesPlannedWeek}`} label="activités réalisées" sub="cette semaine"
          info="Activités prévues dans vos journées et menées à leur terme." />
        <Kpi icon={<BarsFour className="h-[33px] w-[33px]" />} value={pct(data.masteryWeek)} label="maîtrise moyenne" sub="sur les activités réalisées"
          info="Qualité de vos réponses aux activités réalisées cette semaine. La maîtrise est indépendante de la réalisation." />
      </section>

      {/* Évolution de la réalisation */}
      <section className="pl-card px-[22px] pb-[13px] pt-[15px]" aria-labelledby="pl-evo-title">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-[26px]">
            <BarsOutline className="mt-[3px] h-[36px] w-[36px] shrink-0 text-(--pl-bordeaux)" strokeWidth={2} />
            <div>
              <h2 id="pl-evo-title" className={cn(planSerif.className, 'text-[21.5px] font-bold leading-tight text-(--pl-ink)')}>Évolution de la réalisation de votre planning</h2>
              <p className="mt-[3px] text-[16px] text-(--pl-text)">Pourcentage du programme quotidien réellement réalisé (jours planifiés uniquement).</p>
            </div>
          </div>
          <div role="radiogroup" aria-label="Période" className="flex h-[36px] items-center rounded-full border border-[#e9e9ee] bg-(--pl-card) p-[2px] dark:border-(--pl-card-border)">
            {([7, 30, 90] as const).map((p) => (
              <button key={p} type="button" role="radio" aria-checked={period === p} onClick={() => setPeriod(p)}
                className={cn('h-[32px] whitespace-nowrap rounded-full px-[14px] text-[14px] transition @min-[640px]/plan:px-[26px] @min-[640px]/plan:text-[15px]', period === p ? 'bg-(--pl-pill) font-semibold text-white' : 'text-(--pl-text) hover:text-(--pl-ink)')}>
                {p} jours
              </button>
            ))}
          </div>
        </div>
        <div className="-mx-[8px] mt-[8px]">
          <CompletionChart points={data.series[period]} />
        </div>
        <div className="mt-[10px] flex flex-wrap items-center justify-between gap-4">
          <ul className="flex flex-wrap items-center gap-x-[52px] gap-y-2 pl-[3px] text-[14px] text-(--pl-text)">
            <li className="flex items-center gap-[16px]"><span aria-hidden className="h-[18px] w-[18px] rounded-full bg-(--pl-crimson)" />Journée planifiée (réalisée)</li>
            <li className="flex items-center gap-[16px]"><span aria-hidden className="h-[18px] w-[18px] rounded-full border-[2.5px] border-(--pl-crimson) bg-(--pl-card)" />Journée planifiée (non réalisée)</li>
            <li className="flex items-center gap-[16px]"><span aria-hidden className="h-[30px] w-[30px] rounded-[5px] bg-(--pl-off)" />Jour OFF (non planifié)</li>
          </ul>
          <p className="flex max-w-[423px] items-center gap-[16px] rounded-[10px] bg-(--pl-info) py-[8px] pl-[18px] pr-[12px] text-[13.5px] leading-[19px] text-(--pl-text)">
            <Info className="h-[22px] w-[22px] shrink-0 text-(--pl-tab-text)" strokeWidth={1.7} />
            Les jours OFF ne sont pas pris en compte dans le calcul de votre taux de réalisation ni de votre régularité.
          </p>
        </div>
      </section>

      <div className="grid gap-[15px] @min-[760px]/plan:grid-cols-2 @min-[1180px]/plan:grid-cols-[524fr_390fr_525fr]">
        {/* Répartition */}
        <section className="pl-card px-[20px] pb-[16px] pt-[14px]" aria-labelledby="pl-rep-title">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-[14px]">
              <PieSlice className="mt-[2px] h-[26px] w-[26px] shrink-0 text-(--pl-bordeaux)" />
              <div>
                <h2 id="pl-rep-title" className={cn(planSerif.className, 'text-[19px] font-bold leading-tight text-(--pl-ink)')}>Répartition de votre programme</h2>
                <p className="mt-[3px] text-[15px] text-(--pl-text)">Cette période (selon la charge pédagogique prévue)</p>
              </div>
            </div>
            <InfoTip text="Charge prévue de vos journées planifiées, entre nouveaux contenus (acquisition, micro-diagnostics) et consolidation, réactivations, erreurs et entraînement." />
          </div>
          {dist.total > 0 ? (
            <>
              <div className="mt-[13px] flex h-[38px] overflow-hidden rounded-[6px] text-[20px] font-semibold" aria-label={`Nouveaux contenus ${progPct} %, consolidation et révisions ${revPct} %`}>
                <div className="grid place-items-center bg-(--pl-pill) text-white" style={{ width: `${progPct}%` }}>{progPct >= 12 ? `${progPct} %` : ''}</div>
                <div className="grid flex-1 place-items-center bg-(--pl-rose-200) text-(--pl-bordeaux)">{revPct >= 12 ? `${revPct} %` : ''}</div>
              </div>
              <div className="mt-[12px] grid grid-cols-2 gap-3">
                <div className="flex gap-[14px]">
                  <span aria-hidden className="mt-[1px] h-[22px] w-[22px] shrink-0 rounded-full bg-(--pl-pill)" />
                  <div className="leading-tight"><p className="text-[15px] text-(--pl-ink)">Nouveaux contenus</p><p className="mt-[5px] text-[14px] text-(--pl-text)">Charge pédagogique : {progPct} %</p></div>
                </div>
                <div className="flex gap-[14px]">
                  <span aria-hidden className="mt-[1px] h-[22px] w-[22px] shrink-0 rounded-full bg-(--pl-rose-300)" />
                  <div className="leading-tight"><p className="text-[15px] text-(--pl-ink)">Consolidation &amp; révisions</p><p className="mt-[5px] text-[14px] text-(--pl-text)">Charge pédagogique : {revPct} %</p></div>
                </div>
              </div>
            </>
          ) : (
            <p className="mt-[16px] rounded-[8px] bg-(--pl-info) px-4 py-3 text-[14px] text-(--pl-text)">Aucune journée planifiée sur cette période pour le moment.</p>
          )}
          <div className="mt-[16px] flex items-center gap-[20px] rounded-[10px] bg-(--pl-rose-50) px-[17px] py-[12px]">
            <TargetArrow className="h-[34px] w-[34px] shrink-0 text-(--pl-bordeaux)" strokeWidth={2.1} />
            <p className="text-[14px] leading-[20px] text-(--pl-ink)">
              <strong className="font-semibold text-(--pl-bordeaux)">Objectif pédagogique :</strong> environ {targetProg} % nouveaux contenus / {100 - targetProg} % révisions. Adapté en continu selon vos progrès.
            </p>
          </div>
        </section>

        {/* Régularité */}
        <section className="pl-card @container/reg px-[17px] pb-[16px] pt-[14px]" aria-labelledby="pl-reg-title">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-[16px]">
              <TargetArrow className="h-[28px] w-[28px] shrink-0 text-(--pl-bordeaux)" strokeWidth={2.3} />
              <h2 id="pl-reg-title" className={cn(planSerif.className, 'text-[19px] font-bold leading-tight text-(--pl-ink)')}>Votre régularité</h2>
            </div>
            <InfoTip text="Journées planifiées réellement travaillées cette semaine, comparées à la semaine précédente. Les jours OFF sont neutres." />
          </div>
          <div className="mt-[16px] flex flex-col gap-3 @min-[350px]/reg:flex-row @min-[350px]/reg:items-start @min-[350px]/reg:justify-between">
            <div className="pl-[3px]">
              <p className="text-[38px] font-bold leading-none tracking-[-0.01em] text-(--pl-bordeaux-strong)">{data.workedDaysWeek} / {data.plannedDaysWeek}</p>
              <p className="mt-[8px] text-[16px] leading-[22px] text-(--pl-text)">jours planifiés travaillés<br />cette semaine</p>
            </div>
            <div className="w-[162px] shrink-0 rounded-[10px] bg-(--pl-green-bg) px-[10px] py-[11px]">
              {deltaText ? (
                <>
                  <p className="flex items-center gap-[10px] text-[18px] font-semibold text-(--pl-green)">
                    {delta! > 0 ? <ArrowUpRight className="h-[22px] w-[22px]" strokeWidth={2.2} /> : delta! < 0 ? <ArrowDownRight className="h-[22px] w-[22px]" strokeWidth={2.2} /> : <ArrowRight className="h-[22px] w-[22px]" strokeWidth={2.2} />}
                    {deltaText}
                  </p>
                  <p className="mt-[4px] whitespace-nowrap pl-[30px] text-[11.5px] leading-[16px] text-(--pl-text)">par rapport à la<br />semaine précédente</p>
                </>
              ) : (
                <p className="text-[12.5px] leading-[17px] text-(--pl-text)">La comparaison apparaîtra après votre première semaine complète.</p>
              )}
            </div>
          </div>
          <div className="mt-[28px] flex items-start gap-[18px] rounded-[10px] bg-(--pl-rose-50) px-[14px] py-[16px]">
            <QuoteMark className="mt-[3px] h-[18px] w-[24px] shrink-0 text-(--pl-bordeaux)" />
            <p className="text-[16px] leading-[23px] text-(--pl-ink)">La régularité est l’un des meilleurs indicateurs de réussite aux EVC.</p>
          </div>
        </section>

        {/* Conseil du jour */}
        <section className="pl-card @container/adv px-[9px] pb-[9px] pt-[14px] @min-[760px]/plan:col-span-2 @min-[1180px]/plan:col-span-1" aria-labelledby="pl-adv-title">
          <div className="flex items-center gap-[14px] px-[8px]">
            <Lightbulb className="h-[26px] w-[26px] shrink-0 text-(--pl-bordeaux)" strokeWidth={2} />
            <h2 id="pl-adv-title" className={cn(planSerif.className, 'text-[19px] font-bold leading-tight text-(--pl-ink)')}>Conseil du jour</h2>
          </div>
          <Link href="/planificateur" className="mt-[12px] flex items-center gap-[16px] rounded-[10px] bg-(--pl-rose-75) py-[12px] pl-[10px] pr-[16px] transition hover:brightness-[0.985]">
            <span className="grid h-[52px] w-[52px] shrink-0 place-items-center self-start rounded-full bg-(--pl-rose-100) text-(--pl-bordeaux)">
              <Lightbulb className="h-[30px] w-[30px]" strokeWidth={1.8} />
            </span>
            <span className="min-w-0 flex-1">
              <span className={cn(planSerif.className, 'block text-[16.5px] font-bold text-(--pl-bordeaux)')}>{data.advice.title}</span>
              <span className="mt-[2px] block text-[14.5px] leading-[20px] text-(--pl-text)">{data.advice.text}</span>
            </span>
            <ChevronRight className="h-[20px] w-[20px] shrink-0 text-(--pl-bordeaux)" strokeWidth={2.4} />
          </Link>
          <div className="relative mt-[9px] flex h-[105px] items-center overflow-hidden rounded-[10px] bg-(--pl-banner)" aria-hidden>
            <div className="relative h-full w-[156px] shrink-0">
              <Image src="/planificateur/suivi-livres.jpg" alt="" fill sizes="156px" className="object-cover dark:opacity-80" />
              <span className="absolute inset-y-0 right-0 w-[40px] bg-gradient-to-r from-transparent to-(--pl-banner)" />
            </div>
            <div className={cn(planScript.className, 'relative -ml-[6px] flex-1 text-[24px] leading-[27px] text-[#232126] [-webkit-text-stroke:0.4px_currentColor] dark:text-(--pl-ink)')}>
              <span className="block -rotate-[6deg] pl-[2px]">Apprendre</span>
              <span className="block -rotate-[6deg] pl-[18px]">S’entraîner</span>
              <span className="block -rotate-[6deg] pl-[34px]">Progresser</span>
            </div>
            <span className="hidden h-[62px] w-px shrink-0 bg-[#3a3135]/70 @min-[470px]/adv:block dark:bg-(--pl-muted)" />
            <div className="hidden w-[184px] shrink-0 flex-col items-center px-2 text-(--pl-bordeaux) @min-[470px]/adv:flex">
              <LaurelMark className="h-[34px] w-[34px]" />
              <span className={cn(planSerif.className, 'mt-[2px] text-[20px] font-bold leading-none')}>Major ECN</span>
              <span className="mt-[6px] text-center text-[7.2px] font-semibold uppercase leading-[10px] tracking-[0.14em] text-[#5b2a33] dark:text-(--pl-muted)">Plus qu’une préparation,<br />à vos côtés vers l’avenir</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

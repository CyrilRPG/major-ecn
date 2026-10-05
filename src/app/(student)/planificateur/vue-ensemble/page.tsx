import Link from 'next/link';
import { AlertTriangle, CalendarDays, ClipboardCheck, Gauge, Layers, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlanPageTitle } from '@/components/student/plan/v4/header';
import { planSerif } from '@/components/student/plan/v4/fonts';
import { overviewData } from '@/lib/plan/pages';
import { PRIORITY_LEVEL_LABEL } from '@/lib/plan/model';
import { REMINDER_SHORT } from '@/lib/plan/types';
import { pageEnv } from '../_env';

export const metadata = { title: 'Vue d’ensemble — Mon planning' };

const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const fmtDate = (d: string) => { const [y, m, day] = d.slice(0, 10).split('-').map(Number); return `${day === 1 ? '1er' : day} ${MONTHS[m - 1]} ${y}`; };
const pct = (v: number) => `${Math.round(v * 100)} %`;

function Card({ title, icon, children, className }: { title: string; icon: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('pl-card px-[20px] py-[16px]', className)}>
      <h2 className={cn(planSerif.className, 'flex items-center gap-3 text-[19px] font-bold text-(--pl-ink)')}><span className="text-(--pl-bordeaux)">{icon}</span>{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

/**
 * Vue jusqu'à l'EVC (§31) : une synthèse, pas un calendrier rigide —
 * couverture estimée, P1 couverts/restants, progression par domaine, part
 * nouveau/consolidation, rythme observé, échéances, alerte de couverture.
 */
export default async function VueEnsemblePage() {
  const env = await pageEnv();
  const d = await overviewData(env);
  const p = d.summary?.projection ?? null;
  return (
    <>
      <PlanPageTitle subtitle="Votre préparation jusqu’à l’EVC, en un coup d’œil." daysLeft={d.daysLeft} />
      <div className="mt-[18px] grid gap-[16px] lg:grid-cols-2">
        {d.summary?.priorityMode && (
          <section role="alert" className="flex gap-3 rounded-[14px] border border-[#f1dcb5] bg-[#fff6e9] px-[18px] py-[14px] text-[14.5px] text-(--pl-text) lg:col-span-2 dark:border-[#4a3a22] dark:bg-[#251c10]">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-(--pl-bordeaux)" />
            <p><strong className="text-(--pl-ink)">Votre préparation doit maintenant être priorisée.</strong> Tout le programme risque de ne pas pouvoir être travaillé avant l’épreuve : le planificateur protège les items indispensables, vos réactivations et les notions incontournables. L’ensemble du programme reste néanmoins à connaître.</p>
          </section>
        )}
        <Card title="Couverture du programme" icon={<Target className="h-6 w-6" />}>
          {p ? (
            <>
              <p className="text-[38px] font-bold leading-none text-(--pl-bordeaux-strong)">{pct(p.projectedCoverage)}</p>
              <p className="mt-1 text-[14.5px] text-(--pl-text)">couverture estimée le jour de l’épreuve · {p.coveredNow}/{p.totalItems} items déjà couverts aujourd’hui</p>
              <p className="mt-2 text-[14px] text-(--pl-text)">{p.fullCoverageOn ? `Au rythme prévu, tout le programme est couvert vers le ${fmtDate(p.fullCoverageOn)}.` : 'Au rythme prévu, une couverture complète n’est pas atteignable avant l’épreuve : le planificateur priorise.'}</p>
            </>
          ) : <p className="text-[14.5px] text-(--pl-text)">Le calcul sera disponible après la prochaine mise à jour de votre planning.</p>}
        </Card>
        <Card title="Items par niveau de priorité" icon={<Layers className="h-6 w-6" />}>
          <ul className="space-y-2">
            {d.levels.map((l) => (
              <li key={l.level}>
                <div className="flex items-center justify-between text-[14px]"><span className="font-semibold text-(--pl-ink)">{PRIORITY_LEVEL_LABEL[l.level]}</span><span className="text-(--pl-text)">{l.covered}/{l.total} couverts · {l.total - l.covered} restant{l.total - l.covered > 1 ? 's' : ''}</span></div>
                <div className="mt-1 h-[7px] overflow-hidden rounded-full bg-(--pl-rose-100)"><div className="h-full rounded-full bg-(--pl-crimson)" style={{ width: `${l.total > 0 ? Math.round((l.covered / l.total) * 100) : 0}%` }} /></div>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[12.5px] text-(--pl-muted)">Un item est couvert dès qu’il a été travaillé, observé par Major ECN ou déclaré au moins « à consolider ». Prioriser ne signifie jamais supprimer.</p>
        </Card>
        <Card title="Progression par domaine" icon={<Gauge className="h-6 w-6" />} className="lg:col-span-2">
          {d.domains.length === 0 ? <p className="text-[14.5px] text-(--pl-text)">Disponible après la prochaine mise à jour de votre planning.</p> : (
            <ul className="grid gap-x-8 gap-y-2.5 md:grid-cols-2">
              {d.domains.map((x) => (
                <li key={x.id ?? x.label}>
                  <div className="flex items-center justify-between gap-2 text-[14px]"><span className="truncate font-semibold text-(--pl-ink)">{x.label}</span><span className="shrink-0 text-(--pl-text)">{x.covered}/{x.total} · prévu {x.projected}/{x.total}</span></div>
                  <div className="relative mt-1 h-[8px] overflow-hidden rounded-full bg-(--pl-rose-100)" aria-label={`${x.label} : ${x.covered} couverts, ${x.projected} prévus sur ${x.total}`}>
                    <div className="absolute inset-y-0 left-0 rounded-full bg-(--pl-rose-300)" style={{ width: `${x.total > 0 ? Math.round((x.projected / x.total) * 100) : 0}%` }} />
                    <div className="absolute inset-y-0 left-0 rounded-full bg-(--pl-crimson)" style={{ width: `${x.total > 0 ? Math.round((x.covered / x.total) * 100) : 0}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-[12.5px] text-(--pl-muted)">Foncé : couvert aujourd’hui · clair : couverture prévue avant l’épreuve.</p>
        </Card>
        <Card title="Nouveaux contenus et consolidation" icon={<Layers className="h-6 w-6" />}>
          <p className="text-[14.5px] text-(--pl-text)">Cible actuelle : environ <strong>{Math.round((d.summary?.targetProgression ?? 0.7) * 100)} %</strong> de nouveaux contenus, {100 - Math.round((d.summary?.targetProgression ?? 0.7) * 100)} % de consolidation et de révisions — adaptée en continu selon votre couverture, vos résultats et la proximité de l’EVC.</p>
          {d.observed.progression + d.observed.revision > 0 && <p className="mt-2 text-[14.5px] text-(--pl-text)">Sur les 30 derniers jours : {pct(d.observed.progression)} nouveaux contenus · {pct(d.observed.revision)} consolidation et révisions.</p>}
        </Card>
        <Card title="Votre rythme" icon={<Gauge className="h-6 w-6" />}>
          {d.observed.plannedDays14 > 0 ? (
            <p className="text-[14.5px] text-(--pl-text)">Sur les 14 derniers jours : {d.observed.workedDays14}/{d.observed.plannedDays14} journées planifiées travaillées{d.observed.completion14 !== null ? `, ${pct(d.observed.completion14)} du programme réalisé` : ''}.</p>
          ) : <p className="text-[14.5px] text-(--pl-text)">Votre rythme apparaîtra après vos premières journées.</p>}
          <p className="mt-2 text-[13px] text-(--pl-muted)">Les durées de vos activités s’ajustent à votre vitesse réelle ; la réalisation se mesure aux unités validées, jamais au temps passé.</p>
        </Card>
        <Card title="Échéances" icon={<CalendarDays className="h-6 w-6" />} className="lg:col-span-2">
          <ul className="space-y-2 text-[14.5px] text-(--pl-text)">
            <li><strong className="text-(--pl-ink)">Épreuve EVC</strong> : {fmtDate(d.examDate)} (J - {d.daysLeft})</li>
            {d.mockExams.map((m) => <li key={m.id}><strong className="text-(--pl-ink)">Concours blanc</strong> : {m.title}{m.openAt ? ` — à partir du ${fmtDate(m.openAt)}` : ''}</li>)}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/checkup" className="inline-flex h-[40px] items-center gap-1.5 rounded-full border border-(--pl-pill) px-[16px] text-[14px] font-semibold text-(--pl-pill)"><ClipboardCheck className="h-4 w-4" />Faire un EVC Check-up</Link>
            <Link href="/planificateur/concours-blancs" className="inline-flex h-[40px] items-center rounded-full border border-(--pl-card-border) px-[16px] text-[14px] font-semibold text-(--pl-ink)">Concours blancs</Link>
          </div>
        </Card>
      </div>
      <p className="mt-[18px] rounded-[12px] bg-(--pl-info) px-4 py-3 text-[13px] text-(--pl-text)">{REMINDER_SHORT}</p>
    </>
  );
}

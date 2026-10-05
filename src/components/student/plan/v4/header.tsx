import Link from 'next/link';
import { CalendarDays, CalendarRange, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StudentHero } from '@/components/student/ui/page-kit';
import { planScript, planSerif } from './fonts';
import { LaurelMark } from './laurel';
import { PlanBackLink, PlanTabLabel, PlanTabsV4 } from './tabs';

/**
 * En-tête de l'espace « Mon planning » : le même en-tête premium que les
 * autres pages du menu élève, avec l'identité de la maquette (couronne de
 * laurier, accroche manuscrite), puis la barre d'onglets épinglée au
 * défilement, qui porte la cloche des nouveautés du planificateur (`bell`,
 * diffusée à part par le layout).
 */
export function PlannerHeader({ bell, tabs = true }: { bell: React.ReactNode; tabs?: boolean }) {
  // Fragment, pas d'enveloppe : la barre d'onglets « sticky » doit avoir pour
  // parent le conteneur de toute la page, sinon elle cesse de coller dès que
  // l'en-tête sort de l'écran.
  return (
    <>
      <StudentHero
        aide="planning"
        compact
        titleAs="p"
        icon={CalendarRange}
        watermark={<LaurelMark />}
        eyebrow="Planificateur EVC"
        title="Mon planning"
        subtitle={<span className={cn(planScript.className, 'block pt-0.5 text-[23px] leading-none text-[#F5C84B] sm:text-[25px]')}>Discipline aujourd’hui, réussite demain.</span>}
      />
      {tabs && <PlanTabsV4 end={bell} />}
    </>
  );
}

/**
 * Titre de la page (par défaut : le nom de l'onglet ouvert), sous-titre, et
 * rappel « J - n avant les épreuves EVC ».
 */
export function PlanPageTitle({ title, subtitle, daysLeft, examLabel = 'avant les épreuves EVC' }: { title?: string; subtitle: string; daysLeft: number | null; examLabel?: string }) {
  return (
    <div className="mt-[10px] flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 sm:pl-[8px]">
        <PlanBackLink />
        <h1 className={cn(planSerif.className, 'text-[30px] font-bold leading-[1.08] tracking-[-0.012em] text-(--pl-bordeaux) sm:text-[38px]')}>{title ?? <PlanTabLabel />}</h1>
        <p className="mt-[5px] text-[15px] leading-snug text-(--pl-text) sm:text-[17px]">{subtitle}</p>
      </div>
      {daysLeft !== null && (
        <Link href="/planificateur/vue-ensemble" className="flex h-[70px] min-w-[280px] items-center gap-[17px] rounded-[12px] bg-(--pl-rose-75) pl-[17px] pr-[18px] transition hover:brightness-[0.985] max-sm:w-full">
          <CalendarDays className="h-[32px] w-[32px] shrink-0 text-(--pl-bordeaux)" strokeWidth={1.9} />
          <span className="min-w-0 flex-1 leading-tight">
            <span className={cn(planSerif.className, 'block text-[27px] font-bold tracking-[-0.01em] text-(--pl-bordeaux)')}>J - {daysLeft}</span>
            <span className="mt-[2px] block text-[15px] text-(--pl-ink)">{examLabel}</span>
          </span>
          <ChevronRight className="h-[20px] w-[20px] text-(--pl-ink)" strokeWidth={2.2} />
        </Link>
      )}
    </div>
  );
}

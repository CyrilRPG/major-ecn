import Link from 'next/link';
import { CalendarDays, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BrushTagline, MajorEcnLogo } from './brand';
import { planSerif } from './fonts';
import { NoticeBell, type Notice } from './notice-bell';
import { PlanTabsV4 } from './tabs';

/**
 * Bandeau de l'espace « Mon planning » d'après la maquette : logo, accroche
 * manuscrite, cloche des nouveautés du planificateur, initiales du candidat,
 * puis les onglets.
 */
export function PlannerHeader({ initials, notices, tabs = true }: { initials: string; notices: Notice[]; tabs?: boolean }) {
  return (
    <header>
      <div className="flex items-center justify-between gap-4 pt-[2px]">
        <Link href="/planificateur" aria-label="Mon planning — Major ECN" className="rounded-md">
          <MajorEcnLogo className="origin-left max-sm:scale-[0.82]" />
        </Link>
        <div className="flex items-center gap-3 sm:-mr-[10px] sm:gap-[24px]">
          <BrushTagline className="hidden md:flex" />
          <NoticeBell notices={notices} />
          <Link href="/profil" aria-label="Mon profil" className="flex items-center gap-[10px] rounded-full">
            <span className="grid h-[46px] w-[46px] place-items-center rounded-full bg-(--pl-avatar) text-[17px] font-semibold text-(--pl-bordeaux)">{initials}</span>
            <ChevronDown className="hidden h-[18px] w-[18px] text-(--pl-tab-text) sm:block" strokeWidth={2} />
          </Link>
        </div>
      </div>
      {tabs && <PlanTabsV4 />}
    </header>
  );
}

/** Titre de l'onglet, sous-titre, et rappel « J - n avant les épreuves EVC ». */
export function PlanPageTitle({ title = 'Mon planning', subtitle, daysLeft, examLabel = 'avant les épreuves EVC' }: { title?: string; subtitle: string; daysLeft: number | null; examLabel?: string }) {
  return (
    <div className="mt-[12px] flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 sm:pl-[8px]">
        <h1 className={cn(planSerif.className, 'text-[34px] font-bold leading-[1.05] tracking-[-0.012em] text-(--pl-bordeaux) sm:text-[46px]')}>{title}</h1>
        <p className="mt-[5px] text-[16px] leading-snug text-(--pl-text) sm:text-[19px]">{subtitle}</p>
      </div>
      {daysLeft !== null && (
        <Link href="/planificateur/vue-ensemble" className="flex h-[74px] min-w-[300px] items-center gap-[19px] rounded-[12px] bg-(--pl-rose-75) pl-[17px] pr-[18px] transition hover:brightness-[0.985] max-sm:w-full">
          <CalendarDays className="h-[34px] w-[34px] shrink-0 text-(--pl-bordeaux)" strokeWidth={1.9} />
          <span className="min-w-0 flex-1 leading-tight">
            <span className={cn(planSerif.className, 'block text-[29px] font-bold tracking-[-0.01em] text-(--pl-bordeaux)')}>J - {daysLeft}</span>
            <span className="mt-[2px] block text-[16px] text-(--pl-ink)">{examLabel}</span>
          </span>
          <ChevronRight className="h-[20px] w-[20px] text-(--pl-ink)" strokeWidth={2.2} />
        </Link>
      )}
    </div>
  );
}

import Link from 'next/link';
import { PlanPageTitle } from '@/components/student/plan/v4/header';
import { RevisionsList } from '@/components/student/plan/v4/revisions-list';
import { daysBetween } from '@/lib/plan/clock';
import { revisionsData } from '@/lib/plan/pages';
import { EDIT_SELF_ASSESSMENT } from '@/lib/plan/types';
import { pageEnv } from '../_env';

export const metadata = { title: 'Mes révisions — Mon planning' };

/** Les items du programme : niveau observé ou estimation, réactivations, erreurs, items retirés. */
export default async function RevisionsPage() {
  const env = await pageEnv();
  const d = await revisionsData(env);
  return (
    <>
      <PlanPageTitle subtitle="Vos items, votre niveau observé et vos prochaines réactivations." daysLeft={env.profile.exam_date ? Math.max(0, daysBetween(env.today, env.profile.exam_date)) : null} />
      <div className="mt-[14px] flex flex-wrap gap-2">
        <Link href="/planificateur/auto-evaluation" className="inline-flex h-[40px] items-center rounded-full border border-(--pl-pill) px-[16px] text-[14px] font-semibold text-(--pl-pill)">{EDIT_SELF_ASSESSMENT}</Link>
        <Link href="/revisions-transversales" className="inline-flex h-[40px] items-center rounded-full border border-(--pl-card-border) px-[16px] text-[14px] font-semibold text-(--pl-ink)">Révisions transversales</Link>
      </div>
      <RevisionsList items={d.items} domains={d.domains} today={d.today} />
    </>
  );
}

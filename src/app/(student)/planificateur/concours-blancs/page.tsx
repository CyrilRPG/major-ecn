import Link from 'next/link';
import { ClipboardCheck, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlanPageTitle } from '@/components/student/plan/v4/header';
import { planSerif } from '@/components/student/plan/v4/fonts';
import { overviewData } from '@/lib/plan/pages';
import { pageEnv } from '../_env';

export const metadata = { title: 'Concours blancs — Mon planning' };

const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const fmt = (d: string) => { const [y, m, day] = d.slice(0, 10).split('-').map(Number); return `${day === 1 ? '1er' : day} ${MONTHS[m - 1]} ${y}`; };

/**
 * Concours blancs et EVC Check-up (§21) : leurs résultats sont des signaux
 * forts pour le moteur central, qui décide des besoins à faire remonter ; ils
 * n'ajoutent jamais directement d'activité au planning.
 */
export default async function ConcoursBlancsPage() {
  const env = await pageEnv();
  const d = await overviewData(env);
  return (
    <>
      <PlanPageTitle subtitle="Vos épreuves d’entraînement : leurs résultats mettent à jour vos priorités." daysLeft={d.daysLeft} />
      <div className="mt-[18px] grid gap-[16px] lg:grid-cols-2">
        <section className="pl-card px-[20px] py-[16px]">
          <h2 className={cn(planSerif.className, 'flex items-center gap-3 text-[19px] font-bold text-(--pl-ink)')}><FileText className="h-6 w-6 text-(--pl-bordeaux)" />Concours blancs</h2>
          {d.mockExams.length === 0 ? (
            <p className="mt-2 text-[14.5px] text-(--pl-text)">Aucun concours blanc n’est annoncé pour votre préparation pour le moment.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-[14.5px] text-(--pl-text)">
              {d.mockExams.map((m) => (
                <li key={m.id} className="rounded-[12px] bg-(--pl-rose-50) px-4 py-2.5">
                  <strong className="text-(--pl-ink)">{m.title}</strong>{m.openAt ? ` — ouverture le ${fmt(m.openAt)}` : ''}{m.closeAt ? `, jusqu’au ${fmt(m.closeAt)}` : ''}
                </li>
              ))}
            </ul>
          )}
          <Link href="/epreuves-blanches" className="mt-3 inline-flex h-[40px] items-center rounded-full bg-(--pl-pill) px-[16px] text-[14px] font-semibold text-white">Mes épreuves blanches</Link>
        </section>
        <section className="pl-card px-[20px] py-[16px]">
          <h2 className={cn(planSerif.className, 'flex items-center gap-3 text-[19px] font-bold text-(--pl-ink)')}><ClipboardCheck className="h-6 w-6 text-(--pl-bordeaux)" />EVC Check-up</h2>
          <p className="mt-2 text-[14.5px] text-(--pl-text)">Un Check-up chronométré mesure votre niveau sur des questions inédites : c’est le signal le plus fiable pour ajuster vos priorités. Ses résultats sont pris en compte automatiquement.</p>
          <Link href="/checkup" className="mt-3 inline-flex h-[40px] items-center rounded-full border border-(--pl-pill) px-[16px] text-[14px] font-semibold text-(--pl-pill)">Faire un EVC Check-up</Link>
        </section>
      </div>
    </>
  );
}

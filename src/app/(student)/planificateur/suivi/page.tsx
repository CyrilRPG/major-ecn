import { PlanPageTitle } from '@/components/student/plan/v4/header';
import { SuiviView } from '@/components/student/plan/v4/suivi/suivi-view';
import { suiviData } from '@/lib/plan/pages';
import { pageEnv } from '../_env';

export const metadata = { title: 'Suivi — Mon planning' };

/**
 * « Suivi » (maquette validée) : ce que le candidat a réellement effectué —
 * réalisation par unités validées (jamais le temps passé), journées
 * travaillées, activités réalisées, maîtrise observée, évolution 7/30/90 jours
 * (jour OFF ≠ journée non réalisée), répartition, régularité, conseil.
 */
export default async function SuiviPage() {
  const env = await pageEnv();
  const data = await suiviData(env);
  return (
    <>
      <PlanPageTitle subtitle="Suivez la réalisation de votre programme et progressez sereinement." daysLeft={data.daysLeft} />
      <SuiviView data={data} />
    </>
  );
}

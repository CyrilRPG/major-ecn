import { PlanPageTitle } from '@/components/student/plan/v4/header';
import { ObjectivesView } from '@/components/student/plan/v4/objectives-view';
import { daysBetween } from '@/lib/plan/clock';
import { objectivesData } from '@/lib/plan/pages';
import { pageEnv } from '../_env';

export const metadata = { title: 'Mes objectifs — Mon planning' };

/**
 * Réglages du candidat ; liens d'action venus de l'accueil (cahier
 * « Alertes ») : ?action=adapter | desactiver | pause | reactiver.
 */
export default async function ObjectifsPage({ searchParams }: { searchParams: Promise<{ action?: string }> }) {
  const env = await pageEnv();
  const { action } = await searchParams;
  const data = await objectivesData(env);
  return (
    <>
      <PlanPageTitle subtitle="Votre épreuve, vos disponibilités, votre rythme : votre planning s’adapte." daysLeft={env.profile.exam_date ? Math.max(0, daysBetween(env.today, env.profile.exam_date)) : null} />
      <ObjectivesView data={data} today={env.today} action={typeof action === 'string' ? action : null} />
    </>
  );
}

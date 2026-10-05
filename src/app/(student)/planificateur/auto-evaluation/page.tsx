import { loadAccount } from '@/lib/plan/context';
import { onboardingData } from '@/lib/plan/operations';
import { PlanPageTitle } from '@/components/student/plan/v4/header';
import { OnboardingWizard } from '@/components/student/plan/v4/onboarding/wizard';
import { EDIT_SELF_ASSESSMENT } from '@/lib/plan/types';
import { pageEnv } from '../_env';

export const metadata = { title: 'Mon auto-évaluation — Mon planning' };

/** « Modifier mon auto-évaluation » (§5.5) : l'estimation change, jamais les résultats observés. */
export default async function AutoEvaluationPage() {
  const env = await pageEnv();
  const account = await loadAccount(env.userId);
  const data = await onboardingData(env.userId, account!);
  return (
    <>
      <PlanPageTitle title={EDIT_SELF_ASSESSMENT} subtitle="Votre estimation de départ : vos résultats réels sur Major ECN prennent toujours le dessus." daysLeft={null} />
      <OnboardingWizard data={{ ...data, preparations: data.preparations.filter((p) => p.id === env.profile.specialite_id) }} today={env.today} mode="levels" />
    </>
  );
}

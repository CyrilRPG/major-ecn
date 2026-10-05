import { loadAccount } from '@/lib/plan/context';
import { onboardingData } from '@/lib/plan/operations';
import { PlanPageTitle } from '@/components/student/plan/v4/header';
import { OnboardingWizard } from '@/components/student/plan/v4/onboarding/wizard';
import { pageEnv } from '../_env';

export const metadata = { title: 'Mes préférences — Mon planning' };

/** Préférences (§5.5, §6) : jamais dans la priorité, un bonus de composition limité. */
export default async function PreferencesPage() {
  const env = await pageEnv();
  const account = await loadAccount(env.userId);
  const data = await onboardingData(env.userId, account!);
  return (
    <>
      <PlanPageTitle title="Mes préférences" subtitle="Ce que vous aimez, ce que vous repoussez, ce que vous voulez consolider." daysLeft={null} />
      <OnboardingWizard data={{ ...data, preparations: data.preparations.filter((p) => p.id === env.profile.specialite_id) }} today={env.today} mode="preferences" />
    </>
  );
}

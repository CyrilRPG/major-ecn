import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { getParams, getProfile } from '@/lib/plan/db';
import { safeTimezone, workDay } from '@/lib/plan/clock';
import { loadAccount } from '@/lib/plan/context';
import { onboardingData } from '@/lib/plan/operations';
import { PlanPageTitle } from '@/components/student/plan/v4/header';
import { OnboardingWizard } from '@/components/student/plan/v4/onboarding/wizard';

export const metadata = { title: 'Créer mon planning' };

/** Premier lancement du planificateur (§5) : moins de 5 minutes, précision item par item facultative. */
export default async function OnboardingPage() {
  const { user } = await requireUser();
  const profile = await getProfile(user.id);
  if (profile?.onboarding_done) redirect('/planificateur');
  const account = await loadAccount(user.id);
  if (!account) redirect('/accueil');
  const params = await getParams();
  const today = workDay(new Date(), safeTimezone(profile?.timezone, params.day.default_timezone), params.day.close_time);
  const data = await onboardingData(user.id, account);
  return (
    <>
      <PlanPageTitle title="Créer mon planning" subtitle="Quelques minutes pour un planning à votre mesure : vos disponibilités, votre niveau, vos préférences." daysLeft={null} />
      <OnboardingWizard data={data} today={today} />
    </>
  );
}

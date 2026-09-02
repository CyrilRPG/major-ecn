import { FormulePageContent } from '@/components/marketing/formule-page';
import { lireSpecialite } from '@/lib/tunnel-inscription';

export const metadata = {
  alternates: { canonical: '/formules/intensive' },
  title: 'Formule Intensive - Major ECN',
  description: 'Finalisez votre preparation dans les derniers mois avant les EVC. Revisions guidees et corrections detaillees. 995 euros.',
};

export default async function FormuleIntensivePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const specialite = lireSpecialite(await searchParams);
  return <FormulePageContent variant="intensive" specialite={specialite} />;
}

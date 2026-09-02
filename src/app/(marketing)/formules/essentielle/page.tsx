import { FormulePageContent } from '@/components/marketing/formule-page';
import { lireSpecialite } from '@/lib/tunnel-inscription';

export const metadata = {
  alternates: { canonical: '/formules/essentielle' },
  title: 'Formule Essentielle - Major ECN',
  description: 'Preparez les EVC avec une methode structuree et des ressources concues pour les medecins diplomes hors UE. 495 euros.',
};

export default async function FormuleEssentiellePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const specialite = lireSpecialite(await searchParams);
  return <FormulePageContent variant="essentielle" specialite={specialite} />;
}

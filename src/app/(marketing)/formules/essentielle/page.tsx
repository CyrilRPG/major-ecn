import { FormulePageContent } from '@/components/marketing/formule-page';

export const metadata = {
  alternates: { canonical: '/formules/essentielle' },
  title: 'Formule Essentielle - Major ECN',
  description: 'Preparez les EVC avec une methode structuree et des ressources concues pour les medecins diplomes hors UE. 495 euros.',
};

export default function FormuleEssentiellePage() {
  return <FormulePageContent variant="essentielle" />;
}

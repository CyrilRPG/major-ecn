import { TemoignagesPageContent } from '@/components/marketing/temoignages-page';

export const metadata = {
  alternates: { canonical: '/temoignages' },
  title: 'Témoignages — Major ECN',
  description:
    'Médecins de tous horizons qui ont préparé les EVC avec Major ECN : leur parcours, leurs résultats, sans filtre.',
};

export default function TemoignagesPage() {
  return <TemoignagesPageContent />;
}

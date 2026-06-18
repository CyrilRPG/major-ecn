import { SpecialitesPageContent } from '@/components/marketing/specialites-page';

export const metadata = {
  alternates: { canonical: '/specialites' },
  title: 'Spécialités — 45+ préparations EVC — Major ECN',
  description:
    'Toutes les spécialités EVC (PAE) couvertes par Major ECN : médecine, chirurgie, pédiatrie, imagerie, biologie, pharmacie. Programmes officiels, correcteurs spécialistes, suivi personnalisé.',
};

export default function SpecialitesPage() {
  return <SpecialitesPageContent />;
}

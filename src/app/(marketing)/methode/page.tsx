import { MethodePageContent } from '@/components/marketing/methode-page';

export const metadata = {
  alternates: { canonical: '/methode' },
  title: 'Méthode — Major ECN',
  description:
    "La méthode Major ECN : 6 étapes structurées, raisonnement clinique, entraînements ciblés, concours blancs et consolidation pour réussir les EVC (PAE).",
};

export default function MethodePage() {
  return <MethodePageContent />;
}

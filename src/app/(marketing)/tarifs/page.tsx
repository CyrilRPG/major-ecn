import { TarifsPageContent } from '@/components/marketing/tarifs-page';

export const metadata = {
  alternates: { canonical: '/tarifs' },
  title: 'Tarifs et formules de préparation aux EVC',
  description:
    "Les trois formules de préparation aux EVC : contenu, accompagnement, durée d’accès et conditions d’inscription. Espace découverte gratuit, sans engagement.",
};

export default function TarifsPage() {
  return <TarifsPageContent />;
}

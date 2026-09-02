import { TarifsPageContent } from '@/components/marketing/tarifs-page';
import { lireSpecialite } from '@/lib/tunnel-inscription';

export const metadata = {
  alternates: { canonical: '/tarifs' },
  title: 'Tarifs et formules de préparation aux EVC',
  description:
    "Les trois formules de préparation aux EVC : contenu, accompagnement, durée d’accès et conditions d’inscription. Espace découverte gratuit, sans engagement.",
};

export default async function TarifsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const specialite = lireSpecialite(await searchParams);
  return <TarifsPageContent specialite={specialite} />;
}

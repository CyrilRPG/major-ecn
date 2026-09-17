import { FormulePageContent } from '@/components/marketing/formule-page';
import { lireSpecialite } from '@/lib/tunnel-inscription';
import { APPROFONDI_MIN_EUROS_FR } from '@/lib/stripe/approfondi';
import { offresApprofondiIndisponibles } from '@/lib/stripe/approfondi-disponibilite';

export const metadata = {
  alternates: { canonical: '/formules/programme-approfondi' },
  title: 'Programme Approfondi - Major ECN',
  description: `Approfondissez votre preparation avec un accompagnement structure jusqu'aux EVC. Des ${APPROFONDI_MIN_EUROS_FR} euros.`,
};

export default async function ProgrammeApprofondiPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const specialite = lireSpecialite(await searchParams);
  return (
    <FormulePageContent
      variant="approfondi"
      specialite={specialite}
      // Offres dont le prix Stripe n'est pas configuré : le tunnel les annonce
      // « ouverture prochaine » au lieu de les faire échouer au paiement.
      offresIndisponibles={offresApprofondiIndisponibles()}
    />
  );
}

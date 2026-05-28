import { createClient } from '@/lib/supabase/server';
import { FinalCtaBlock } from '@/components/marketing/extra-sections';
import { TemoignagesSection, StatsSection, TrustBanner } from '@/components/marketing/manus-sections';

export const metadata = {
  title: 'Témoignages — Major ECN',
  description:
    'Médecins de tous horizons : leur parcours, leurs résultats aux EVC avec Major ECN.',
};

export default async function TemoignagesPage() {
  const supabase = await createClient();
  const { data: collegesRaw } = await supabase.from('matieres').select('id, nom').order('nom');
  const colleges = collegesRaw ?? [];

  return (
    <>
      <TemoignagesSection />
      <StatsSection />
      <TrustBanner />
      <FinalCtaBlock colleges={colleges} />
    </>
  );
}

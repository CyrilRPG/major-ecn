import { createClient } from '@/lib/supabase/server';
import { TarifsBlock, FinalCtaBlock } from '@/components/marketing/extra-sections';
import { FAQSection } from '@/components/marketing/manus-sections';

export const metadata = {
  title: 'Tarifs — Major ECN',
  description:
    'Trois formules adaptées à vos objectifs : Essentiel, Premium ou Intensif. 7 jours d’essai gratuit.',
};

export default async function TarifsPage() {
  const supabase = await createClient();
  const { data: collegesRaw } = await supabase.from('matieres').select('id, nom').order('nom');
  const colleges = collegesRaw ?? [];

  return (
    <>
      <TarifsBlock />
      <FAQSection />
      <FinalCtaBlock colleges={colleges} />
    </>
  );
}

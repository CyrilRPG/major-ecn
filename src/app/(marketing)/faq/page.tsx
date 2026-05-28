import { createClient } from '@/lib/supabase/server';
import { FinalCtaBlock } from '@/components/marketing/extra-sections';
import { FAQSection } from '@/components/marketing/manus-sections';

export const metadata = {
  title: 'FAQ — Major ECN',
  description:
    'Toutes les réponses aux questions des candidats EVC : méthode, plateforme, tarifs, accompagnement.',
};

export default async function FaqPage() {
  const supabase = await createClient();
  const { data: collegesRaw } = await supabase.from('matieres').select('id, nom').order('nom');
  const colleges = collegesRaw ?? [];

  return (
    <>
      <FAQSection />
      <FinalCtaBlock colleges={colleges} />
    </>
  );
}

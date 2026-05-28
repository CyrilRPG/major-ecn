import { createClient } from '@/lib/supabase/server';
import {
  PreparationProcessSection, MethodologySection, MethodProofSection, FinalCtaBlock,
} from '@/components/marketing/extra-sections';
import { MethodeSection, TransformationSection } from '@/components/marketing/manus-sections';

export const metadata = {
  title: 'Méthode — Major ECN',
  description:
    'La méthode Major ECN : 6 étapes structurées, raisonnement clinique, entraînements ciblés, concours blancs et consolidation.',
};

export default async function MethodePage() {
  const supabase = await createClient();
  const { data: collegesRaw } = await supabase.from('matieres').select('id, nom').order('nom');
  const colleges = collegesRaw ?? [];

  return (
    <>
      <PreparationProcessSection />
      <MethodologySection />
      <MethodeSection />
      <MethodProofSection />
      <TransformationSection />
      <FinalCtaBlock colleges={colleges} />
    </>
  );
}

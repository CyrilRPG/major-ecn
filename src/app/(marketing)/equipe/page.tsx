import { createClient } from '@/lib/supabase/server';
import {
  PedagogicalTeamSection, SpecialtiesSection, FinalCtaBlock,
} from '@/components/marketing/extra-sections';
import { AudienceSection, TrustBanner } from '@/components/marketing/manus-sections';

export const metadata = {
  title: 'Équipe pédagogique — Major ECN',
  description:
    'Une équipe de praticiens hospitaliers, PU-PH et CCA expérimentés couvrant les 20 spécialités du programme EVC.',
};

export default async function EquipePage() {
  const supabase = await createClient();
  const { data: collegesRaw } = await supabase.from('matieres').select('id, nom').order('nom');
  const colleges = collegesRaw ?? [];

  return (
    <>
      <PedagogicalTeamSection />
      <SpecialtiesSection />
      <TrustBanner />
      <AudienceSection />
      <FinalCtaBlock colleges={colleges} />
    </>
  );
}

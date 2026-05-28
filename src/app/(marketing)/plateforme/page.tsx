import { createClient } from '@/lib/supabase/server';
import {
  EcosystemSection, QCMPreviewSection, DashboardPreviewSection, FinalCtaBlock,
} from '@/components/marketing/extra-sections';
import { ExperienceSection, StatsSection } from '@/components/marketing/manus-sections';

export const metadata = {
  title: 'Plateforme — Major ECN',
  description:
    'Découvrez l’écosystème pédagogique Major ECN : QCM intelligents, dashboard temps réel, lives hebdomadaires.',
};

export default async function PlateformePage() {
  const supabase = await createClient();
  const { data: collegesRaw } = await supabase.from('matieres').select('id, nom').order('nom');
  const colleges = collegesRaw ?? [];

  return (
    <>
      <EcosystemSection />
      <ExperienceSection />
      <QCMPreviewSection />
      <DashboardPreviewSection />
      <StatsSection />
      <FinalCtaBlock colleges={colleges} />
    </>
  );
}

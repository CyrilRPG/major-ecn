import { createClient } from '@/lib/supabase/server';
import { ManusHero } from '@/components/marketing/manus-hero';
import { ExperienceSection, FAQSection, FreeTrialBanner } from '@/components/marketing/manus-sections';
import {
  BeyondPlatformSection, FinalCtaBlock, PedagogicalTeamSection, SpecialtiesSection,
  TestimonialsTextSection, TestimonialsVideoSection, ToolsGridSection,
} from '@/components/marketing/extra-sections';

export const metadata = {
  title: 'Major ECN — Préparation EVC (PAE) pour médecins étrangers',
  description:
    'Plateforme de préparation aux Épreuves de Vérification des Connaissances (EVC) pour médecins étrangers dans le cadre de la Procédure d’Autorisation d’Exercice (PAE). 45 spécialités, 9 000+ médecins accompagnés, 18 ans d’expérience.',
};

export default async function HomePage() {
  const supabase = await createClient();
  const { data: collegesRaw } = await supabase.from('matieres').select('id, nom').order('nom');
  const colleges = collegesRaw ?? [];

  return (
    <>
      {/* 1) HERO */}
      <ManusHero />

      {/* 2) Bien plus qu'une plateforme de cours (8 cartes) */}
      <BeyondPlatformSection />

      {/* 3) Tous les outils pour structurer votre progression */}
      <ToolsGridSection />

      {/* 4) Ils ont préparé les EVC avec Major ECN (témoignages texte) */}
      <TestimonialsTextSection />

      {/* 5) Ils racontent leur expérience (témoignages vidéo) */}
      <TestimonialsVideoSection />

      {/* 6) Préparation EVC (PAE) adaptée à votre spécialité */}
      <SpecialtiesSection />

      {/* 7) Une équipe qui connaît les attentes des EVC */}
      <PedagogicalTeamSection />

      {/* 8) À l'intérieur de Major ECN */}
      <ExperienceSection />

      {/* 9) FAQ */}
      <FAQSection />

      {/* 10) Testez Major ECN pendant 7 jours */}
      <FreeTrialBanner />

      {/* 11) Rejoignez les candidats — CTA final (inscription) */}
      <FinalCtaBlock colleges={colleges} />
    </>
  );
}

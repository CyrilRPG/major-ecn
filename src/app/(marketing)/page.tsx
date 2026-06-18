import { ManusHero } from '@/components/marketing/manus-hero';
import { ExperienceSection, FAQSection } from '@/components/marketing/manus-sections';
import {
  BeyondPlatformSection, EspaceDecouverteSection, FinalDiscoverCtaSection,
  PedagogicalTeamSection, SpecialtiesSection, TestimonialsTextSection,
  TestimonialsVideoSection, ToolsForProgressSection, ToolsGridSection, ToutRegroupeSection,
} from '@/components/marketing/extra-sections';

export const metadata = {
  alternates: { canonical: '/' },
  title: 'Major ECN — Préparation EVC (PAE) pour médecins étrangers',
  description:
    'Plateforme de préparation aux Épreuves de Vérification des Connaissances (EVC) pour médecins étrangers dans le cadre de la Procédure d’Autorisation d’Exercice (PAE). toutes les spécialités, 9 000+ médecins accompagnés, 15 ans d’expérience.',
};

export default async function HomePage() {
  return (
    <>
      {/* 1) HERO */}
      <ManusHero />

      {/* 2) Bien plus qu'une plateforme de cours */}
      <BeyondPlatformSection />

      {/* 3) Plateforme intelligente et adaptative */}
      <ToolsForProgressSection />

      {/* 3 bis) Tous les outils pour structurer votre progression aux EVC
          (réintégrée à sa place d'origine, juste après « Plateforme
          intelligente et adaptative »). */}
      <ToolsGridSection />

      {/* 4) Témoignages vidéo */}
      <TestimonialsVideoSection />

      {/* 5) Préparation adaptée à votre spécialité */}
      <SpecialtiesSection />

      {/* 6) Équipe pédagogique */}
      <PedagogicalTeamSection />

      {/* 7) Tout est regroupé au même endroit */}
      <ToutRegroupeSection />

      {/* 8) À l'intérieur de Major ECN (captures de la plateforme) */}
      <ExperienceSection />

      {/* 9) Témoignages écrits */}
      <TestimonialsTextSection />

      {/* 10) Espace découverte gratuit */}
      <EspaceDecouverteSection />

      {/* 11) FAQ */}
      <FAQSection />

      {/* 12) Dernier CTA — Découvrir gratuitement la plateforme */}
      <FinalDiscoverCtaSection />
    </>
  );
}

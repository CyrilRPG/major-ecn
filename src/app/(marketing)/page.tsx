import { ManusHero } from '@/components/marketing/manus-hero';
import { ExperienceSection, FAQSection } from '@/components/marketing/manus-sections';
import {
  BeyondPlatformSection, EspaceDecouverteSection, PedagogicalTeamSection,
  SpecialtiesSection, TestimonialsTextSection, TestimonialsVideoSection,
  ToolsForProgressSection, ToolsGridSection, ToutRegroupeSection,
} from '@/components/marketing/extra-sections';

export const metadata = {
  title: 'Major ECN — Préparation EVC (PAE) pour médecins étrangers',
  description:
    'Plateforme de préparation aux Épreuves de Vérification des Connaissances (EVC) pour médecins étrangers dans le cadre de la Procédure d’Autorisation d’Exercice (PAE). 45 spécialités, 9 000+ médecins accompagnés, 15 ans d’expérience.',
};

export default async function HomePage() {
  return (
    <>
      {/* 1) HERO */}
      <ManusHero />

      {/* 2) Bien plus qu'une plateforme de cours (8 cartes) */}
      <BeyondPlatformSection />

      {/* 3) Tous les outils pour réussir votre préparation EVC (6 cartes) */}
      <ToolsForProgressSection />

      {/* 4) Tous les outils pour structurer votre progression aux EVC (restauré) */}
      <ToolsGridSection />

      {/* 5) Témoignages texte de lauréats (cartes courtes) */}
      <TestimonialsTextSection />

      {/* 6) Témoignages vidéo */}
      <TestimonialsVideoSection />

      {/* 7) Préparation EVC (PAE) adaptée à votre spécialité */}
      <SpecialtiesSection />

      {/* 8) Une équipe qui connaît les attentes des EVC */}
      <PedagogicalTeamSection />

      {/* 9) Tout est regroupé au même endroit — bloc 8 cartes outils */}
      <ToutRegroupeSection />

      {/* 10) À l'intérieur de Major ECN */}
      <ExperienceSection />

      {/* 9) FAQ */}
      <FAQSection />

      {/* 10) Découvrez la plateforme Major ECN — Espace Découverte */}
      <EspaceDecouverteSection />
    </>
  );
}

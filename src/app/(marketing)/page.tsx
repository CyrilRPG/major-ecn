import { HomeHero } from '@/components/marketing/home/home-hero';
import {
  DeuxVoiesSection, EnseignantsSection, PlateformeSection, SuiviSection,
} from '@/components/marketing/home/home-method-sections';
import { TemoignagesSection } from '@/components/marketing/home/home-social-sections';
import { FormulesSection } from '@/components/marketing/home/home-formules-section';
import { HomeFaqSection } from '@/components/marketing/home/home-faq-section';
import { JsonLd, faqSchema } from '@/components/seo/json-ld';
import { faqEvcPlainQAs } from '@/lib/data/faq-evc-pae';

export const metadata = {
  alternates: { canonical: '/' },
  title: 'Major ECN — Préparation EVC (PAE) pour médecins étrangers',
  description:
    'Préparation complète aux Épreuves de Vérification des Connaissances (EVC) dans le cadre de la PAE : voie interne (QCM), voie externe (QROC), méthodologie, enseignants médecins spécialistes, suivi de progression. Toutes les spécialités, 9 000+ médecins accompagnés, 15 ans d’expérience.',
};

/* Ordre des sections : celui des maquettes templates/homepage/BLOC 1→8. */
export default async function HomePage() {
  return (
    <>
      <JsonLd data={faqSchema(faqEvcPlainQAs())} />

      {/* 1) HERO — Votre objectif : préparer les EVC. */}
      <HomeHero />

      {/* 2) Témoignages vidéo — 15 ans d'expérience aux EVC */}
      <TemoignagesSection />

      {/* 3) Nos enseignants : bien plus que des formateurs */}
      <EnseignantsSection />

      {/* 4) Deux voies. Une méthode adaptée à votre épreuve. */}
      <DeuxVoiesSection />

      {/* 5) Nous vous enseignons. Nous vous guidons. */}
      <SuiviSection />

      {/* 6) Tout votre travail. Au même endroit. */}
      <PlateformeSection />

      {/* 7) Trois formules, un même objectif : votre réussite */}
      <FormulesSection />

      {/* 8) FAQ — Toutes les réponses à vos questions */}
      <HomeFaqSection />

      {/* Le CTA sticky mobile est monté globalement dans le layout marketing
          (StickyCtaBar) — libellé dynamique selon la zone parcourue. */}
    </>
  );
}

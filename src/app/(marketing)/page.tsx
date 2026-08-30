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

export default async function HomePage() {
  return (
    <>
      <JsonLd data={faqSchema(faqEvcPlainQAs())} />

      {/* 1) HERO — Vous travaillez. Nous vous guidons. */}
      <HomeHero />

      {/* 2) Deux voies. Une méthode adaptée à votre épreuve. */}
      <DeuxVoiesSection />

      {/* 3) Vous travaillez. Nous vérifions que vous progressez. */}
      <SuiviSection />

      {/* 4) Tout votre travail. Au même endroit. */}
      <PlateformeSection />

      {/* 5) Nos enseignants : bien plus que des formateurs */}
      <EnseignantsSection />

      {/* 6) Témoignages vidéo — 15 ans d'expérience aux EVC */}
      <TemoignagesSection />

      {/* 7) Trois formules, un même objectif : votre réussite */}
      <FormulesSection />

      {/* 8) FAQ — Toutes les réponses à vos questions */}
      <HomeFaqSection />

      {/* Le CTA sticky mobile est monté globalement dans le layout marketing
          (StickyCtaBar) — libellé dynamique selon la zone parcourue. */}
    </>
  );
}

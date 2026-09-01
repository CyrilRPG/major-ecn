import { HomeHero } from '@/components/marketing/home/home-hero';
import { HomeCountdown } from '@/components/marketing/home/home-countdown';
import {
  DeuxVoiesSection, EnseignantsSection, PlateformeSection, SuiviSection,
} from '@/components/marketing/home/home-method-sections';
import { TemoignagesSection } from '@/components/marketing/home/home-social-sections';
import { HomeSpecialitesSection } from '@/components/marketing/home/home-specialites-section';
import { HomeRessourcesSection } from '@/components/marketing/home/home-ressources-section';
import { FormulesSection } from '@/components/marketing/home/home-formules-section';
import { HomeFaqSection } from '@/components/marketing/home/home-faq-section';
import { HomeSeoText } from '@/components/marketing/home/home-seo-text';
import { JsonLd, faqSchema } from '@/components/seo/json-ld';
import { faqEvcPlainQAs } from '@/lib/data/faq-evc-pae';

export const metadata = {
  alternates: { canonical: '/' },
  title: 'Préparation aux EVC 2026 — voie interne (QCM) et voie externe (QROC)',
  description:
    'Préparation aux Épreuves de Vérification des Connaissances (EVC) 2026 dans le cadre de la PAE : voie interne (QCM) et voie externe (QROC), postes ouverts par spécialité, méthodologie, enseignants médecins spécialistes et suivi de progression. Toutes les spécialités, 9 000+ médecins accompagnés depuis 2011.',
};

/* Ordre des sections : celui des maquettes templates/homepage/BLOC 1→8,
   complété par le compte à rebours, le référentiel des postes, les
   ressources du blog et le texte de fond en pied de page. */
export default async function HomePage() {
  return (
    <>
      <JsonLd data={faqSchema(faqEvcPlainQAs())} />

      {/* Bandeau compte à rebours — épreuves du 10 novembre 2026 */}
      <HomeCountdown />

      {/* 1) HERO — Préparation aux EVC 2026 */}
      <HomeHero />

      {/* 2) Témoignages vidéo — 15 ans d'expérience aux EVC */}
      <TemoignagesSection />

      {/* 3) Nos enseignants : bien plus que des formateurs */}
      <EnseignantsSection />

      {/* 4) Deux voies. Une méthode adaptée à votre épreuve. */}
      <DeuxVoiesSection />

      {/* 5) Postes ouverts par spécialité — session 2026 (source CNG) */}
      <HomeSpecialitesSection />

      {/* 6) Nous vous enseignons. Nous vous guidons. */}
      <SuiviSection />

      {/* 7) Tout votre travail. Au même endroit. */}
      <PlateformeSection />

      {/* 8) Trois formules, un même objectif : votre réussite */}
      <FormulesSection />

      {/* 9) Ressources — les guides du blog */}
      <HomeRessourcesSection />

      {/* 10) FAQ — Toutes les réponses à vos questions */}
      <HomeFaqSection />

      {/* 11) Texte de fond — la réforme voie interne / voie externe */}
      <HomeSeoText />

      {/* Le CTA sticky mobile est monté globalement dans le layout marketing
          (StickyCtaBar) — libellé dynamique selon la zone parcourue. */}
    </>
  );
}

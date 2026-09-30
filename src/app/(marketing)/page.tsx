import { HomeHero } from '@/components/marketing/home/home-hero';
import { HomeCountdown } from '@/components/marketing/home/home-countdown';
import {
  DeuxVoiesSection, EnseignantsSection, PlateformeSection, SuiviSection,
} from '@/components/marketing/home/home-method-sections';
import { TemoignagesSection } from '@/components/marketing/home/home-social-sections';
import { HomeSpecialitesSection } from '@/components/marketing/home/home-specialites-section';
import { HomeRessourcesSection } from '@/components/marketing/home/home-ressources-section';
import { CALENDRIER_ARTICLE } from '@/components/marketing/home/evc-calendrier-2026';
import { FormulesSection } from '@/components/marketing/home/home-formules-section';
import { HomeFaqSection } from '@/components/marketing/home/home-faq-section';
import { HomeSeoText } from '@/components/marketing/home/home-seo-text';
import { JsonLd, faqSchema } from '@/components/seo/json-ld';
import { faqEvcPlainQAs } from '@/lib/data/faq-evc-pae';
import { getDbPublishedArticles } from '@/lib/data/blog-db';
import { chargerCalendrierEvc, instantDuRendu } from '@/lib/evc-calendrier/server';
import { urlEmbedVisiteGuidee } from '@/lib/marketing/visite-guidee-serveur';

export const metadata = {
  alternates: { canonical: '/' },
  title: 'Préparation aux EVC 2026 — voie interne (QCM) et voie externe (QROC)',
  // 155 caractères maximum : au-delà, Google tronque.
  description:
    'Préparation aux EVC 2026 (PAE) : voie interne en QCM, voie externe en QROC. Postes et dates par spécialité. 9 000 médecins accompagnés depuis 2011.',
};

/* Le calendrier EVC (bandeau, carte de la capture, postes, texte de fond) est
   lu dans la table `evc_calendrier`, en cache 5 minutes et invalidé à chaque
   enregistrement depuis /admin/calendrier-evc. Les affichages datés se
   recalculent en plus dans le navigateur (useMaintenant) : la page servie
   depuis le cache ne peut pas afficher un compteur de la veille. */
export const revalidate = 300;

/* Ordre des sections : celui des maquettes templates/homepage/BLOC 1→8,
   complété par le compte à rebours, le référentiel des postes, les
   ressources du blog et le texte de fond en pied de page. */
export default async function HomePage() {
  // L'article « dates des épreuves par spécialité » est publié depuis
  // l'administration : on le charge ici pour le mettre à la une des ressources.
  const [articles, calendrierEvc] = await Promise.all([getDbPublishedArticles(), chargerCalendrierEvc()]);
  const calendrier = articles.find((a) => a.slug === CALENDRIER_ARTICLE) ?? null;
  // Instant du rendu : premier rendu client identique au HTML servi (hydratation).
  const rendu = instantDuRendu();

  return (
    <>
      <JsonLd data={faqSchema(faqEvcPlainQAs())} />

      {/* Bandeau compte à rebours — prochaine épreuve de la session */}
      <HomeCountdown calendrier={calendrierEvc} rendu={rendu} />

      {/* 1) HERO — Préparation aux EVC 2026 */}
      <HomeHero calendrier={calendrierEvc} rendu={rendu} embedUrl={urlEmbedVisiteGuidee()} />

      {/* 2) Témoignages vidéo — 15 ans d'expérience aux EVC */}
      <TemoignagesSection />

      {/* 3) Nos enseignants : bien plus que des formateurs */}
      <EnseignantsSection />

      {/* 4) Deux voies. Une méthode adaptée à votre épreuve. */}
      <DeuxVoiesSection />

      {/* 5) Postes ouverts et dates d'épreuve par spécialité */}
      <HomeSpecialitesSection calendrier={calendrierEvc} />

      {/* 6) Nous vous enseignons. Nous vous guidons. */}
      <SuiviSection />

      {/* 7) Tout votre travail. Au même endroit. */}
      <PlateformeSection />

      {/* 8) Trois formules, un même objectif : votre réussite */}
      <FormulesSection />

      {/* 9) Ressources — les guides du blog */}
      <HomeRessourcesSection calendrier={calendrier} />

      {/* 10) FAQ — Toutes les réponses à vos questions */}
      <HomeFaqSection />

      {/* 11) Texte de fond — la réforme voie interne / voie externe */}
      <HomeSeoText calendrier={calendrierEvc} maintenant={rendu} />

      {/* Le CTA sticky mobile est monté globalement dans le layout marketing
          (StickyCtaBar) — libellé dynamique selon la zone parcourue. */}
    </>
  );
}

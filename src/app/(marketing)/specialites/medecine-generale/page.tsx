import { MedecineGeneralePageContent } from '@/components/marketing/medecine-generale-page';
import { lireSpecialite } from '@/lib/tunnel-inscription';
import { APPROFONDI_SPECIALTIES } from '@/lib/stripe/approfondi';
import { FAQ_MG, reponseTexteMg } from '@/lib/data/faq-medecine-generale';
import { JsonLd, breadcrumbSchema, faqSchema } from '@/components/seo/json-ld';

/** L'URL historique de la page est conservée : elle est déjà dans le sitemap,
    reliée depuis /specialites et alignée sur les autres pages spécialité. */
const URL = '/specialites/medecine-generale';
/** Le layout racine applique le gabarit « %s · Major ECN ». */
const TITRE = 'Préparation EVC Médecine Générale';
const DESCRIPTION =
  'Préparez les EVC de médecine générale avec Major ECN : QCM ou QROC selon votre voie, annales corrigées, cours, replays et accompagnement.';
const IMAGE = '/specialites/medecine-generale/og.jpg';

export const metadata = {
  alternates: { canonical: URL },
  title: TITRE,
  description: DESCRIPTION,
  openGraph: {
    title: `${TITRE} — Major ECN`,
    description: DESCRIPTION,
    url: URL,
    type: 'article',
    locale: 'fr_FR',
    siteName: 'Major ECN',
    images: [
      {
        url: IMAGE,
        width: 1200,
        height: 630,
        alt: 'Préparation EVC médecine générale Major ECN',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${TITRE} — Major ECN`,
    description: DESCRIPTION,
    images: [IMAGE],
  },
};

/** Le tarif d'entrée du Programme Approfondi dépend de la spécialité : celui
 *  affiché ici est bien celui de la médecine générale, jamais le minimum
 *  toutes spécialités confondues, sans quoi la page annoncerait un prix que
 *  le paiement ne pratique pas. */
function prixApprofondiMedecineGenerale(): string {
  const mg = APPROFONDI_SPECIALTIES.find((s) => s.key === 'mg');
  const cents = Math.min(...(mg?.tiers ?? []).map((t) => t.amountCents));
  return String(Math.round(cents / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export default async function MedecineGeneralePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const specialite = lireSpecialite(await searchParams);
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'Accueil', path: '/' },
            { name: 'Spécialités EVC / PAE', path: '/specialites' },
            { name: 'Médecine générale', path: URL },
          ]),
          // Les Q/R publiées sont exactement celles affichées sur la page.
          faqSchema(FAQ_MG.map((f) => ({ q: f.q, a: reponseTexteMg(f) }))),
        ]}
      />
      <MedecineGeneralePageContent specialite={specialite} prixApprofondie={prixApprofondiMedecineGenerale()} />
    </>
  );
}

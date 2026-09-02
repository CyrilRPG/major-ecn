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

/** Volume horaire de chaque palier du Programme Approfondi en médecine
 *  générale, du moins cher au plus cher. Le nombre de paliers varie d'une
 *  spécialité à l'autre : un seul en chirurgie orthopédique, deux ici. */
const HEURES_APPROFONDI_MG = ['55 h', '100 h'];

/** Espace ordinaire comme séparateur de milliers — jamais l'espace fine
 *  insécable d'Intl, qui provoque une erreur d'hydratation sur les vitrines. */
function eurosFr(cents: number): string {
  return String(Math.round(cents / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/** Les tarifs sont dérivés du catalogue Stripe et jamais saisis en dur : la
 *  page ne peut donc pas annoncer un prix que le paiement ne pratique plus.
 *  Ce sont bien ceux de la médecine générale, pas le minimum toutes
 *  spécialités confondues. */
function paliersApprofondiMedecineGenerale(): { heures: string; prix: string }[] {
  const mg = APPROFONDI_SPECIALTIES.find((s) => s.key === 'mg');
  return (mg?.tiers ?? [])
    .map((t) => t.amountCents)
    .sort((a, b) => a - b)
    .map((cents, i) => ({ heures: HEURES_APPROFONDI_MG[i] ?? '', prix: eurosFr(cents) }))
    .filter((p) => p.heures);
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
      <MedecineGeneralePageContent
        specialite={specialite}
        paliersApprofondie={paliersApprofondiMedecineGenerale()}
      />
    </>
  );
}

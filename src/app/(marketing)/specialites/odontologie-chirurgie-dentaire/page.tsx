import { OdontologiePageContent, type PalierApprofondi } from '@/components/marketing/odontologie-page';
import { lireSpecialite } from '@/lib/tunnel-inscription';
import { APPROFONDI_SPECIALTIES } from '@/lib/stripe/approfondi';
import { FAQ_ODO, reponseTexteOdo } from '@/lib/data/faq-odontologie';
import { JsonLd, breadcrumbSchema, faqSchema, organizationSchema } from '@/components/seo/json-ld';

/** URL du cahier des charges, dans le silo des pages spécialité. */
const URL = '/specialites/odontologie-chirurgie-dentaire';
/** Le layout racine applique le gabarit « %s · Major ECN ». */
const TITRE = 'Préparation EVC Odontologie 2026';
const DESCRIPTION =
  'Préparez les EVC d’odontologie avec Major ECN : + de 2 000 QCM, dossiers cliniques, annales corrigées, méthodologie, cours et accompagnement.';
const IMAGE = '/specialites/odontologie/og.jpg';

export const metadata = {
  alternates: { canonical: URL },
  title: TITRE,
  description: DESCRIPTION,
  openGraph: {
    title: `${TITRE} | Major ECN`,
    description:
      'Préparez les EVC d’odontologie avec une méthode structurée, + de 2 000 QCM, des dossiers cliniques et un accompagnement tout au long de votre préparation.',
    url: URL,
    type: 'article',
    locale: 'fr_FR',
    siteName: 'Major ECN',
    images: [{ url: IMAGE, width: 1200, height: 630, alt: 'Préparation EVC odontologie Major ECN' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${TITRE} | Major ECN`,
    description: DESCRIPTION,
    images: [IMAGE],
  },
};

/** Paliers du Programme Approfondi en odontologie, dérivés du catalogue
 *  Stripe : la page ne peut pas annoncer un volume horaire ou un prix que le
 *  paiement ne pratique plus. */
function paliersApprofondiOdontologie(): PalierApprofondi[] {
  const odo = APPROFONDI_SPECIALTIES.find((s) => s.key === 'odontologie');
  return (odo?.tiers ?? [])
    .slice()
    .sort((a, b) => a.amountCents - b.amountCents)
    .map((t) => ({
      heures: t.hoursLabel ?? '',
      prix: String(Math.round(t.amountCents / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '),
    }))
    .filter((p) => p.heures);
}

export default async function OdontologiePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const specialite = lireSpecialite(await searchParams);
  const paliers = paliersApprofondiOdontologie();
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'Accueil', path: '/' },
            { name: 'Spécialités EVC', path: '/specialites' },
            { name: 'Odontologie & chirurgie dentaire', path: URL },
          ]),
          organizationSchema(),
          // Les Q/R publiées sont exactement celles affichées sur la page.
          faqSchema(FAQ_ODO.map((f) => ({ q: f.q, a: reponseTexteOdo(f, paliers[0]?.prix ?? '') }))),
        ]}
      />
      <OdontologiePageContent specialite={specialite} paliers={paliers} />
    </>
  );
}

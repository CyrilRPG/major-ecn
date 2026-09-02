import { PediatriePageContent, type PalierApprofondi } from '@/components/marketing/pediatrie-page';
import { lireSpecialite } from '@/lib/tunnel-inscription';
import { APPROFONDI_SPECIALTIES } from '@/lib/stripe/approfondi';
import { FAQ_PEDIA, reponseTextePedia } from '@/lib/data/faq-pediatrie';
import { JsonLd, breadcrumbSchema, faqSchema } from '@/components/seo/json-ld';

/** L'URL suit le modèle des autres pages spécialité et le slug publié par
    /specialites : le silo reste cohérent et le lien du hub fonctionne. */
const URL = '/specialites/pediatrie';
/** Le layout racine applique le gabarit « %s · Major ECN ». */
const TITRE = 'Préparation EVC Pédiatrie 2026';
const DESCRIPTION =
  'Préparez les EVC de pédiatrie avec Major ECN : cours en direct, QCM ou QROC selon votre voie, dossiers cliniques, annales corrigées et accompagnement.';
const IMAGE = '/specialites/pediatrie/og.jpg';

export const metadata = {
  alternates: { canonical: URL },
  title: TITRE,
  description: DESCRIPTION,
  openGraph: {
    title: `${TITRE} — Major ECN`,
    description:
      'Préparez les EVC de pédiatrie avec une méthode éprouvée, des entraînements adaptés à votre voie et un accompagnement jusqu’au jour J.',
    url: URL,
    type: 'article',
    locale: 'fr_FR',
    siteName: 'Major ECN',
    images: [{ url: IMAGE, width: 1200, height: 630, alt: 'Préparation EVC pédiatrie Major ECN' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${TITRE} — Major ECN`,
    description: DESCRIPTION,
    images: [IMAGE],
  },
};

/** Paliers du Programme Approfondi en pédiatrie, dérivés du catalogue Stripe :
 *  la page ne peut pas annoncer un volume horaire ou un prix que le paiement
 *  ne pratique plus. */
function paliersApprofondiPediatrie(): PalierApprofondi[] {
  const ped = APPROFONDI_SPECIALTIES.find((s) => s.key === 'pediatrie');
  return (ped?.tiers ?? [])
    .slice()
    .sort((a, b) => a.amountCents - b.amountCents)
    .map((t) => ({
      heures: t.hoursLabel ?? '',
      prix: String(Math.round(t.amountCents / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '),
    }))
    .filter((p) => p.heures);
}

export default async function PediatriePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const specialite = lireSpecialite(await searchParams);
  const paliers = paliersApprofondiPediatrie();
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'Accueil', path: '/' },
            { name: 'Spécialités EVC', path: '/specialites' },
            { name: 'Pédiatrie', path: URL },
          ]),
          // Les Q/R publiées sont exactement celles affichées sur la page.
          faqSchema(FAQ_PEDIA.map((f) => ({ q: f.q, a: reponseTextePedia(f, paliers[0]?.prix ?? '') }))),
        ]}
      />
      <PediatriePageContent specialite={specialite} paliers={paliers} />
    </>
  );
}

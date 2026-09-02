import { MedecineUrgencePageContent, type PalierApprofondi } from '@/components/marketing/medecine-urgence-page';
import { lireSpecialite } from '@/lib/tunnel-inscription';
import { APPROFONDI_SPECIALTIES } from '@/lib/stripe/approfondi';
import { FAQ_URGENCE, reponseTexteUrgence } from '@/lib/data/faq-medecine-urgence';
import { JsonLd, breadcrumbSchema, faqSchema, organizationSchema } from '@/components/seo/json-ld';

/** L'URL suit le modèle des autres pages spécialité et le slug publié par
    /specialites : le silo reste cohérent et le lien du hub fonctionne. */
const URL = '/specialites/medecine-d-urgence';
/** Le layout racine applique le gabarit « %s · Major ECN ». */
const TITRE = 'Préparation EVC Médecine d’Urgence 2026';
const DESCRIPTION =
  'Préparez les EVC de Médecine d’urgence 2026 avec Major ECN : cours avec médecins spécialistes, QCM, cas cliniques, fiches, flashcards, révisions et épreuves blanches.';
const IMAGE = '/specialites/medecine-urgence/og.jpg';

export const metadata = {
  alternates: { canonical: URL },
  title: TITRE,
  description: DESCRIPTION,
  openGraph: {
    title: `${TITRE} | Major ECN`,
    description:
      'Cours, QCM, cas cliniques, flashcards, épreuves blanches et accompagnement pour préparer les EVC de Médecine d’urgence.',
    url: URL,
    type: 'article',
    locale: 'fr_FR',
    siteName: 'Major ECN',
    images: [{ url: IMAGE, width: 1200, height: 630, alt: 'Préparation EVC Médecine d’urgence Major ECN' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${TITRE} | Major ECN`,
    description: DESCRIPTION,
    images: [IMAGE],
  },
};

/** Paliers du Programme Approfondi en médecine d'urgence, dérivés du catalogue
 *  Stripe : la page ne peut pas annoncer un volume horaire ou un prix que le
 *  paiement ne pratique plus. */
function paliersApprofondiUrgence(): PalierApprofondi[] {
  const urg = APPROFONDI_SPECIALTIES.find((s) => s.key === 'medecine-urgence');
  return (urg?.tiers ?? [])
    .slice()
    .sort((a, b) => a.amountCents - b.amountCents)
    .map((t) => ({
      heures: t.hoursLabel ?? '',
      prix: String(Math.round(t.amountCents / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '),
    }))
    .filter((p) => p.heures);
}

export default async function MedecineUrgencePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const specialite = lireSpecialite(await searchParams);
  const paliers = paliersApprofondiUrgence();
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'Accueil', path: '/' },
            { name: 'EVC', path: '/guide-evc' },
            { name: 'Médecine d’urgence', path: URL },
          ]),
          organizationSchema(),
          // Les Q/R publiées sont exactement celles affichées sur la page.
          faqSchema(FAQ_URGENCE.map((f) => ({ q: f.q, a: reponseTexteUrgence(f, paliers[0]?.prix ?? '') }))),
        ]}
      />
      <MedecineUrgencePageContent specialite={specialite} paliers={paliers} />
    </>
  );
}

import { chargerFaitsSpecialite } from '@/lib/evc-calendrier/server';
import { OrthopediePageContent } from '@/components/marketing/orthopedie-page';
import { lireSpecialite } from '@/lib/tunnel-inscription';

/** Le layout racine applique le gabarit « %s · Major ECN » : le titre ne doit
    donc pas répéter la marque. Les balises og/twitter sont propres à la
    spécialité — la chirurgie orthopédique n'est ouverte qu'en voie interne. */
const TITRE = 'EVC Chirurgie orthopédique et traumatologique (PAE)';
const DESCRIPTION =
  'Préparation aux EVC en chirurgie orthopédique et traumatologique : 101 postes en voie interne, épreuve QCM. Cours en direct, QCM et annales corrigées.';
const URL = '/specialites/chirurgie-orthopedique-et-traumatologie';
const IMAGE = '/specialites/orthopedie/og.jpg';

const metadata = {
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
        alt: 'Préparation EVC en chirurgie orthopédique et traumatologique — Major ECN',
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

/** Description : postes lus dans le Calendrier EVC. */
export async function generateMetadata() {
  const f = await chargerFaitsSpecialite('chirurgie-orthopedique-et-traumatologie');
  if (f?.postesInterne == null) return metadata;
  const description = DESCRIPTION.replace(/\d+ postes en voie interne/, `${f.postesInterne} postes en voie interne`);
  return {
    ...metadata,
    description,
    openGraph: { ...metadata.openGraph, description },
    twitter: { ...metadata.twitter, description },
  };
}

export default async function ChirurgieOrthopediquePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const specialite = lireSpecialite(await searchParams);
  return <OrthopediePageContent faits={await chargerFaitsSpecialite('chirurgie-orthopedique-et-traumatologie')} specialite={specialite} />;
}

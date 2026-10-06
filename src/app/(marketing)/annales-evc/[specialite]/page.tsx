import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AnnalesSpecialitePage } from '@/components/marketing/annales-evc/annales-specialite-page';
import { RECUEILS_ANNALES, recueilParSlug } from '@/lib/data/annales-evc';
import { periodeRecueil } from '@/lib/annales-evc/seo';

/** Une page par recueil, générée au build ; toute autre adresse est une 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return RECUEILS_ANNALES.map((r) => ({ specialite: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ specialite: string }> }): Promise<Metadata> {
  const r = recueilParSlug((await params).specialite);
  if (!r) return {};
  const periode = periodeRecueil(r);
  const title = `Annales EVC ${r.nom} : sujets ${periode} (PDF gratuit)`;
  const description = `Annales EVC ${r.nom} : les ${r.sujets} sujets officiels ${r.premiere === r.derniere ? `de la session ${r.premiere}` : `de ${r.premiere} à ${r.derniere}`}, épreuves fondamentales et pratiques, réunis dans un PDF gratuit, classé par session.`;
  const url = `/annales-evc/${r.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `Annales EVC ${r.nom} — ${periode}`,
      description,
      type: 'website',
      url,
      images: [{ url: `/annales-evc/og/${r.slug}.jpg`, width: 1200, height: 630, alt: `Annales EVC ${r.nom}` }],
    },
    twitter: { card: 'summary_large_image', title: `Annales EVC ${r.nom} — ${periode}`, description, images: [`/annales-evc/og/${r.slug}.jpg`] },
  };
}

export default async function Page({ params }: { params: Promise<{ specialite: string }> }) {
  const r = recueilParSlug((await params).specialite);
  if (!r) notFound();
  return <AnnalesSpecialitePage recueil={r} />;
}

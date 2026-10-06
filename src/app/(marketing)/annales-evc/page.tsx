import type { Metadata } from 'next';
import { AnnalesEvcPage } from '@/components/marketing/annales-evc/annales-page';
import { RECUEILS_ANNALES, TOTAL_SUJETS_ANNALES } from '@/lib/data/annales-evc';

const DESCRIPTION = `Téléchargez gratuitement les annales officielles de l’EVC de votre spécialité : ${TOTAL_SUJETS_ANNALES.toLocaleString('fr-FR')} sujets des épreuves fondamentales et pratiques, ${RECUEILS_ANNALES.length} spécialités, classés par session dans un PDF.`;

export const metadata: Metadata = {
  title: 'Annales EVC gratuites par spécialité (PDF)',
  description: DESCRIPTION,
  alternates: { canonical: '/annales-evc' },
  openGraph: {
    title: 'Annales EVC gratuites par spécialité — Major ECN',
    description: DESCRIPTION,
    type: 'website',
    url: '/annales-evc',
  },
};

export default function Page() {
  return <AnnalesEvcPage />;
}

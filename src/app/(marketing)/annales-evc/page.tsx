import type { Metadata } from 'next';
import { AnnalesEvcPage } from '@/components/marketing/annales-evc/annales-page';
import { RECUEILS_ANNALES, TOTAL_SUJETS_ANNALES } from '@/lib/data/annales-evc';

const PREMIERE = Math.min(...RECUEILS_ANNALES.map((r) => r.premiere));
const DERNIERE = Math.max(...RECUEILS_ANNALES.map((r) => r.derniere));

// 155 caractères au plus : au-delà, Google tronque.
const DESCRIPTION = `Annales EVC gratuites : les ${TOTAL_SUJETS_ANNALES.toLocaleString('fr-FR')} sujets officiels des EVC ${PREMIERE}-${DERNIERE}, ${RECUEILS_ANNALES.length} spécialités, épreuves fondamentales et pratiques, en PDF.`;

export const metadata: Metadata = {
  title: `Annales EVC ${PREMIERE}-${DERNIERE} : tous les sujets par spécialité (PDF)`,
  description: DESCRIPTION,
  keywords: ['annales EVC', 'sujets EVC', 'annales PAE', 'épreuves de vérification des connaissances', 'annales EVC PDF', 'sujets EVC corrigés'],
  alternates: { canonical: '/annales-evc' },
  openGraph: {
    title: `Annales EVC ${PREMIERE}-${DERNIERE} — les sujets officiels de votre spécialité`,
    description: DESCRIPTION,
    type: 'website',
    url: '/annales-evc',
    images: [{ url: '/annales-evc/og/annales-evc.jpg', width: 1200, height: 630, alt: 'Annales EVC par spécialité — Major ECN' }],
  },
  twitter: { card: 'summary_large_image', title: `Annales EVC ${PREMIERE}-${DERNIERE}`, description: DESCRIPTION, images: ['/annales-evc/og/annales-evc.jpg'] },
};

export default function Page() {
  return <AnnalesEvcPage />;
}

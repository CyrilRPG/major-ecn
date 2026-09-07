import type { Metadata } from 'next';
import { ArenaPreview } from '@/components/arena/arena-preview';

/**
 * Page test EVC Arena — non répertoriée (noindex hérité du layout du segment,
 * absente du sitemap). Sert à valider l'interface et la direction artistique
 * avant de développer le module complet.
 */
export const metadata: Metadata = {
  title: 'EVC Arena — maquette',
  description: 'Tournoi de QCM Major ECN : trois manches, douze questions, douze minutes, une seule tentative.',
  robots: { index: false, follow: false },
};

export default function ArenaPreviewPage() {
  return <ArenaPreview />;
}

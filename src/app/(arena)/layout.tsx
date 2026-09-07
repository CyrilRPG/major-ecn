import type { Metadata } from 'next';

/**
 * Segment EVC Arena — page mère du tournoi de QCM (cahier des charges §13).
 *
 * Univers propre : fond sombre, contrastes forts, rouge Major ECN. Le layout
 * marketing (header clair, footer, CTA sticky, popups guide/profil) n'est pas
 * monté ici : l'arène est une parenthèse, pas une page vitrine de plus.
 *
 * Tant que la page est en phase de maquette, elle reste hors index et hors
 * sitemap (robots noindex). La landing définitive (§8.1) sera indexable.
 */
export const metadata: Metadata = {
  title: { default: 'EVC Arena', template: '%s · EVC Arena · Major ECN' },
  robots: { index: false, follow: false },
};

export default function ArenaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="arena-root relative isolate min-h-screen overflow-x-hidden bg-[#060A14] text-[#F4F6FB] antialiased">
      {children}
    </div>
  );
}

import type { Metadata } from 'next';
import { Bebas_Neue, Inter, Oswald } from 'next/font/google';
import '@/components/arena/experience.css';
import '@/components/arena/avatar-progression.css';

/**
 * Segment EVC Arena — page mère du tournoi de QCM (cahier des charges §13).
 *
 * Univers propre : fond sombre, contrastes forts, rouge Major ECN, titres
 * condensés (Oswald / Bebas Neue) et texte Inter, conformément aux maquettes
 * client. Le layout marketing (header clair, footer, CTA sticky, popups) n'est
 * pas monté ici : l'arène est une parenthèse, pas une page vitrine de plus.
 *
 * Tant que le module est en mode test, il reste hors index et hors sitemap
 * (robots noindex). La landing définitive (§8.1) sera indexable.
 */
const oswald = Oswald({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-oswald', display: 'swap' });
const bebas = Bebas_Neue({ subsets: ['latin'], weight: '400', variable: '--font-bebas', display: 'swap' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'EVC Arena', template: '%s · EVC Arena · Major ECN' },
  robots: { index: false, follow: false },
};

export default function ArenaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Le fond sombre était porté par la seule div ci-dessous : la page
          restait posée sur le gris clair du `body` du site, qui réapparaissait
          au rebond de défilement et derrière les barres du navigateur mobile.
          Ce style n'existe que tant qu'une page de l'arène est montée. */}
      <style>{'html:has(.arena-root), body:has(.arena-root){background:#0B0F14;color-scheme:dark}'}</style>
      <div
        className={`arena-root ${oswald.variable} ${bebas.variable} ${inter.variable} relative isolate flex min-h-screen flex-col overflow-x-hidden bg-[#0B0F14] text-[#F2F3F5] antialiased`}
        style={{ fontFamily: "var(--font-inter), 'Inter', system-ui, sans-serif" }}
      >
        {children}
      </div>
    </>
  );
}

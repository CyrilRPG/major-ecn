import type { Metadata } from 'next';
import { Manrope, Fraunces, IBM_Plex_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { QueryProvider } from '@/lib/query/providers';
import { TooltipProvider } from '@/components/ui/tooltip';
import './globals.css';

const sans = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap' });
const display = Fraunces({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
  display: 'swap',
});
const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'Major ECN — Prépa EDN & EVC', template: '%s · Major ECN' },
  description:
    "La prépa de référence aux EDN et EVC : cours en vidéo, dossiers progressifs, ECOS et coaching pour D2, D3, D4 et PAE.",
  openGraph: {
    title: 'Major ECN — Prépa EDN & EVC',
    description:
      "La prépa de référence aux EDN et EVC : cours en vidéo, dossiers progressifs, ECOS et coaching pour D2, D3, D4 et PAE.",
    images: ['/major-ecn-logo.svg'],
    type: 'website',
    locale: 'fr_FR',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <body className="min-h-screen antialiased">
        <ThemeProvider attribute="class" forcedTheme="light" defaultTheme="light" enableSystem={false}>
          <QueryProvider>
            <TooltipProvider delayDuration={150}>{children}</TooltipProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

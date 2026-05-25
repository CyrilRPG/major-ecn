import type { Metadata } from 'next';
import { Manrope, Fraunces, IBM_Plex_Mono, Plus_Jakarta_Sans } from 'next/font/google';
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
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});
const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'Major ECN — Préparez les EVC avec excellence', template: '%s · Major ECN' },
  description:
    "La plateforme premium de préparation aux EVC pour les médecins à diplôme étranger souhaitant exercer en France.",
  openGraph: {
    title: 'Major ECN — Préparez les EVC avec excellence',
    description:
      "La plateforme premium de préparation aux EVC pour les médecins à diplôme étranger souhaitant exercer en France.",
    images: ['/major-ecn-logo.png'],
    type: 'website',
    locale: 'fr_FR',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning className={`${sans.variable} ${display.variable} ${jakarta.variable} ${mono.variable}`}>
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

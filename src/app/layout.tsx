import type { Metadata } from 'next';
import { Manrope, Fraunces, IBM_Plex_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { QueryProvider } from '@/lib/query/providers';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AntiCopyShield } from '@/components/anti-copy-shield';
import { CookieConsentBanner } from '@/components/cookie-consent-banner';
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.major-ecn.fr'),
  title: { default: 'Préparation aux EVC 2026 — voie interne (QCM) et voie externe (QROC)', template: '%s · Major ECN' },
  description:
    "Préparation aux EVC 2026 (PAE) : voie interne en QCM, voie externe en QROC. Postes et dates par spécialité. 9 000 médecins accompagnés.",
  icons: {
    icon: '/major-ecn-logo.png',
    apple: '/major-ecn-logo.png',
    shortcut: '/major-ecn-logo.png',
  },
  openGraph: {
    title: 'Préparation aux EVC 2026 — voie interne (QCM) et voie externe (QROC)',
    description:
      "Préparation aux EVC 2026 (PAE) : voie interne en QCM, voie externe en QROC. Postes et dates par spécialité. 9 000 médecins accompagnés.",
    images: [
      {
        url: '/major-ecn-logo.png',
        width: 1024,
        height: 1024,
        alt: 'Major ECN — Logo',
      },
    ],
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Major ECN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Préparation aux EVC 2026 — voie interne (QCM) et voie externe (QROC)',
    description:
      "Préparation aux EVC 2026 (PAE) : voie interne en QCM, voie externe en QROC. Postes et dates par spécialité. 9 000 médecins accompagnés.",
    images: ['/major-ecn-logo.png'],
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
        <AntiCopyShield />
        <CookieConsentBanner />
      </body>
    </html>
  );
}

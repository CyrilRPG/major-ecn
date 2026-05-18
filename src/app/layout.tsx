import type { Metadata } from 'next';
import { Inter, Instrument_Serif, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { QueryProvider } from '@/lib/query/providers';
import { TooltipProvider } from '@/components/ui/tooltip';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const display = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
});
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'Hermione Médecine', template: '%s · Hermione Médecine' },
  description: 'La prépa qui structure ton année de PASS ou de LAS, du premier cours au concours.',
  openGraph: {
    title: 'Hermione Médecine',
    description: 'La prépa qui structure ton année de PASS ou de LAS, du premier cours au concours.',
    images: ['/hermione-logo.jpg'],
    type: 'website',
    locale: 'fr_FR',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning className={`dark ${inter.variable} ${display.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen antialiased">
        <ThemeProvider attribute="class" forcedTheme="dark" defaultTheme="dark" enableSystem={false}>
          <QueryProvider>
            <TooltipProvider delayDuration={150}>{children}</TooltipProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

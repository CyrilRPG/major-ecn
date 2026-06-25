import type { Metadata } from 'next';
import { GuideHero } from '@/components/marketing/guide-hero';
import { GuideLandingContent } from '@/components/marketing/guide-landing-content';

export const metadata: Metadata = {
  title: 'Guide Méthodologie EVC 2026 (39 pages) — Major ECN',
  description:
    'Téléchargez gratuitement le Guide Méthodologie EVC 2026 : la méthode complète pour gagner des points en voie externe et en voie interne.',
  alternates: { canonical: '/guide-methodologie-evc-2026' },
  openGraph: {
    title: 'Guide Méthodologie EVC 2026 — Major ECN',
    description: 'Téléchargez gratuitement le guide méthodologie EVC 2026 (39 pages).',
    type: 'website',
    url: '/guide-methodologie-evc-2026',
  },
};

export default function GuideMethodologiePage() {
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <GuideHero />
      <GuideLandingContent />
    </div>
  );
}

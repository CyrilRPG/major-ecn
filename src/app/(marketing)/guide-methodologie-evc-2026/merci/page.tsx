import type { Metadata } from 'next';
import { GuideSuccessBlock } from '@/components/marketing/guide-success-block';
import { GuideLandingContent } from '@/components/marketing/guide-landing-content';

export const metadata: Metadata = {
  title: 'Guide téléchargé avec succès — Major ECN',
  description: 'Votre Guide Méthodologie EVC 2026 est prêt à être téléchargé.',
  robots: { index: false },
};

export default function GuideSuccessPage() {
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <GuideSuccessBlock />
      <GuideLandingContent />
    </div>
  );
}

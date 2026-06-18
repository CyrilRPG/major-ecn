import { RecrutementPageContent } from '@/components/marketing/recrutement-page';

export const metadata = {
  alternates: { canonical: '/recrutement' },
  title: 'Recrutement — Major ECN',
  description: 'Participez à la réussite des candidats EVC. Rejoignez l\'équipe pédagogique Major ECN.',
};

export default function RecrutementPage() {
  return <RecrutementPageContent />;
}

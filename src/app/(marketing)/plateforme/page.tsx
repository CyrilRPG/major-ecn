import { PlateformePageContent } from '@/components/marketing/plateforme-page';

export const metadata = {
  alternates: { canonical: '/plateforme' },
  title: 'Plateforme — Major ECN',
  description:
    'Découvrez la plateforme Major ECN : tableau de bord, QCM corrigés, cas cliniques, révision transversale intelligente, cours enregistrés/live et accompagnement personnalisé.',
};

export default function PlateformePage() {
  return <PlateformePageContent />;
}

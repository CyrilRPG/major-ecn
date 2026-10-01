import { EspaceDecouverteForm } from '@/components/marketing/espace-decouverte-form';

export const metadata = {
  alternates: { canonical: '/espace-decouverte' },
  title: 'Espace découverte gratuit — Major ECN',
  description: 'Accédez gratuitement à un item EVC de votre spécialité (Médecine générale, Pédiatrie, Gynécologie-obstétrique, Médecine d’urgence) : fiche de cours, 10 QCM ou QROC selon votre voie, 10 flashcards. Sans carte bancaire.',
};

export default function EspaceDecouvertePage() {
  return <EspaceDecouverteForm />;
}

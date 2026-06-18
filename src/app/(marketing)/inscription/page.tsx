import { redirect } from 'next/navigation';

export const metadata = {
  alternates: { canonical: '/inscription' },
  title: 'Espace découverte — Major ECN',
  description: 'Accédez à un aperçu concret de la plateforme Major ECN, sans carte bancaire.',
};

/**
 * Cette ancienne page d'inscription redirige désormais vers l'espace découverte
 * gratuit (le user veut un point d'entrée unique côté vitrine).
 */
export default function InscriptionPage() {
  redirect('/espace-decouverte');
}

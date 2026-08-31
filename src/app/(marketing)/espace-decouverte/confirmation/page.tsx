import { Suspense } from 'react';
import { ConfirmationContent } from './confirmation-content';

export const metadata = {
  title: 'Demande enregistrée — Major ECN',
  description: 'Votre demande d\'accès à l\'espace découverte a bien été enregistrée.',
  robots: { index: false, follow: true },
};

export default function ConfirmationPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmationContent />
    </Suspense>
  );
}

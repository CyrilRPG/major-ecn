import { AnesthesiePageContent } from '@/components/marketing/anesthesie-page';

export const metadata = {
  alternates: { canonical: '/specialites/anesthesie-reanimation' },
  title: 'Anesthésie-Réanimation — Préparation EVC (PAE) — Major ECN',
  description:
    "Préparation aux Épreuves de Vérification des Connaissances (EVC) en anesthésie-réanimation : ventilation, hémodynamique et états de choc, pharmacologie, défaillances d'organes et péri-opératoire, cours en direct, QCM, QROC et annales corrigées.",
};

export default function AnesthesieReanimationPage() {
  return <AnesthesiePageContent />;
}

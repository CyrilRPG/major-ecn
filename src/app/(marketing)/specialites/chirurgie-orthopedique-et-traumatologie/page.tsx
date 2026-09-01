import { OrthopediePageContent } from '@/components/marketing/orthopedie-page';

export const metadata = {
  alternates: { canonical: '/specialites/chirurgie-orthopedique-et-traumatologie' },
  title: 'Chirurgie orthopédique et traumatologique — Préparation EVC (PAE) — Major ECN',
  description:
    "Préparation aux Épreuves de Vérification des Connaissances (EVC) en chirurgie orthopédique et traumatologique : traumatologie, membre supérieur et inférieur, rachis, pathologies dégénératives et biomécanique, cours en direct, QCM et annales corrigées.",
};

export default function ChirurgieOrthopediquePage() {
  return <OrthopediePageContent />;
}

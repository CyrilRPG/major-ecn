import { TarifsPageContent } from '@/components/marketing/tarifs-page';

export const metadata = {
  alternates: { canonical: '/tarifs' },
  title: 'Tarifs - Major ECN',
  description: "Trois formules adaptées à vos objectifs. Espace découverte gratuit.",
};

export default function TarifsPage() {
  return <TarifsPageContent />;
}

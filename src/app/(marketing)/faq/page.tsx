import { FaqPageContent } from '@/components/marketing/faq-page';
import { JsonLd, faqSchema, breadcrumbSchema } from '@/components/seo/json-ld';
import { FAQ_CATEGORIES } from '@/lib/data/faq-categories';

export const metadata = {
  title: 'Foire aux Questions — EVC (PAE) — Major ECN',
  description:
    'Toutes les réponses aux questions sur les Épreuves de Vérification des Connaissances (EVC), la PAE, la préparation Major ECN et toutes nos spécialités. Plus de 60 questions classées par catégorie.',
  alternates: { canonical: '/faq' },
};

export default function FaqPage() {
  const qas = FAQ_CATEGORIES.flatMap((c) => c.qas);
  return (
    <>
      <JsonLd data={[faqSchema(qas), breadcrumbSchema([
        { name: 'Accueil', path: '/' },
        { name: 'FAQ', path: '/faq' },
      ])]} />
      <FaqPageContent />
    </>
  );
}


import type { Metadata } from 'next';
import { BlogIndex } from '@/components/marketing/blog/blog-index';

// Revalidation courte pour que les articles programmés apparaissent/disparaissent
// de la liste dans les ~5 min suivant leur date de publication.
export const revalidate = 300;

export const metadata: Metadata = {
  alternates: { canonical: '/blog' },
  title: 'Blog Major ECN — Conseils EVC PADHUE',
  description: 'Conseils, démarches administratives et préparation aux Épreuves de Vérification des Connaissances (EVC).',
};

export default function BlogPage({ searchParams }: { searchParams?: Promise<{ cat?: string }> }) {
  return <BlogIndex searchParamsPromise={searchParams} />;
}

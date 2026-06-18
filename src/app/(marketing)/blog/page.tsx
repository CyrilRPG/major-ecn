import type { Metadata } from 'next';
import { BlogIndex } from '@/components/marketing/blog/blog-index';

export const metadata: Metadata = {
  alternates: { canonical: '/blog' },
  title: 'Blog Major ECN — Conseils EVC PADHUE',
  description: 'Conseils, démarches administratives et préparation aux Épreuves de Vérification des Connaissances (EVC).',
};

export default function BlogPage({ searchParams }: { searchParams?: Promise<{ cat?: string }> }) {
  return <BlogIndex searchParamsPromise={searchParams} />;
}

import Link from 'next/link';
import { ChevronLeft, Sparkles } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/require-role';
import { BILLING_EUR } from '@/lib/ai/cost';
import { AiImportForm } from './ai-import-form';

export const dynamic = 'force-dynamic';
// La génération d'un article complet dépasse largement le délai par défaut.
export const maxDuration = 300;
export const metadata = { title: 'Importer un article par IA — Blog' };

export default async function BlogAiImportPage() {
  await requireAdmin();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <header className="mb-6">
        <Link
          href="/admin/blog"
          className="inline-flex items-center gap-1 text-xs font-medium text-(--color-ink-muted) hover:text-(--color-ink)"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Retour aux articles
        </Link>
        <h1 className="mt-2 flex items-center gap-2 text-xl font-semibold tracking-tight text-(--color-ink)">
          <Sparkles className="h-5 w-5 text-[#7C3AED]" /> Importer un article par IA
        </h1>
        <p className="mt-1.5 text-sm text-(--color-ink-muted)">
          Déposez la bannière et le texte : l’IA repense la mise en page (titres, encadrés colorés,
          tableaux, images), place les liens internes et optimise l’article pour le référencement.
          L’article est créé en brouillon, avec un aperçu avant publication.
        </p>
        <p className="mt-2 inline-flex items-center rounded-full bg-[#F3E8FF] px-3 py-1 text-xs font-semibold text-[#6D28D9]">
          Facturation IA — {BILLING_EUR.article.toFixed(2).replace('.', ',')} € par article généré
        </p>
      </header>

      <AiImportForm />
    </main>
  );
}

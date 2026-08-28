import Link from 'next/link';
import { Newspaper, Plus, PencilLine, ExternalLink, Sparkles, ArrowRight } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { BLOG_CATEGORIES, type BlogCategory } from '@/lib/data/blog-articles';
import { BILLING_EUR } from '@/lib/ai/cost';
import { DeletePostButton } from './list-actions';

export const dynamic = 'force-dynamic';

type Row = {
  id: string;
  slug: string;
  title: string;
  category: string;
  status: string;
  featured: boolean;
  published_at: string | null;
  updated_at: string;
};

export default async function AdminBlogPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from('blog_posts')
    .select('id,slug,title,category,status,featured,published_at,updated_at')
    .order('updated_at', { ascending: false });
  const rows = (data ?? []) as Row[];

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <header className="mb-6 flex items-end justify-between border-b border-(--color-border) pb-5">
        <div>
          <p className="text-xs font-medium text-(--color-ink-muted)">Administration</p>
          <h1 className="mt-1 flex items-center gap-2 text-xl font-semibold tracking-tight text-(--color-ink)">
            <Newspaper className="h-5 w-5 text-[#E4002B]" /> Blog
          </h1>
          <p className="mt-1 text-sm text-(--color-ink-muted)">
            Créez et publiez des articles avec titres, images, encadrés et mise en page premium.
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[#C0001F] px-3.5 py-2 text-sm font-bold text-white hover:brightness-110"
        >
          <Plus className="h-4 w-4" /> Nouvel article
        </Link>
      </header>

      {/* Import par IA — mis en avant : c'est la voie rapide vers un article
          mis en page et optimisé pour le référencement. */}
      <Link
        href="/admin/blog/ia"
        className="group mb-6 flex items-center gap-4 overflow-hidden rounded-2xl border border-[#DDD6FE] bg-[linear-gradient(120deg,#FAF5FF_0%,#FFF1F3_100%)] p-5 transition-shadow hover:shadow-(--shadow-soft)"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#7C3AED,#C0001F)] text-white">
          <Sparkles className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-(--color-ink)">
            Importer un article par IA
            <span className="rounded-full bg-[#EDE9FE] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#6D28D9]">
              Nouveau
            </span>
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-(--color-ink-muted)">
            Déposez une bannière et votre texte : l’IA repense la mise en page (titres, encadrés
            colorés, tableaux, images), pose les liens internes et optimise l’article pour le SEO.
            Aperçu avant publication ·{' '}
            <strong className="font-bold text-(--color-ink)">
              {BILLING_EUR.article.toFixed(2).replace('.', ',')} € par article généré
            </strong>{' '}
            (facturation IA).
          </p>
        </div>
        <ArrowRight className="h-5 w-5 shrink-0 text-[#7C3AED] transition-transform group-hover:translate-x-0.5" />
      </Link>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-(--color-border) bg-(--color-surface-soft) px-4 py-12 text-center text-sm text-(--color-ink-muted)">
          Aucun article pour le moment. Cliquez sur « Nouvel article » pour commencer.
        </p>
      ) : (
        <ul className="space-y-2">
          {rows.map((r) => {
            const cat = BLOG_CATEGORIES[r.category as BlogCategory];
            return (
              <li
                key={r.id}
                className="flex items-center gap-3 rounded-xl border border-(--color-border) bg-white px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        r.status === 'published'
                          ? 'bg-[#E7F6EC] text-[#16793C]'
                          : 'bg-[#FEF3C7] text-[#92400E]'
                      }`}
                    >
                      {r.status === 'published' ? 'Publié' : 'Brouillon'}
                    </span>
                    {cat && (
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ background: cat.bg, color: cat.fg }}>
                        {cat.label}
                      </span>
                    )}
                    {r.featured && <span className="text-[10px] font-bold text-[#B26A00]">★ En avant</span>}
                  </div>
                  <p className="mt-1 truncate text-sm font-semibold text-(--color-ink)">{r.title || '(sans titre)'}</p>
                  <p className="truncate text-xs text-(--color-ink-muted)">
                    /blog/{r.slug} · maj {new Date(r.updated_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {r.status === 'published' && (
                    <Link href={`/blog/${r.slug}`} target="_blank" title="Voir" className="flex h-8 w-8 items-center justify-center rounded-lg text-(--color-ink-muted) hover:bg-(--color-surface-soft) hover:text-(--color-ink)">
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  )}
                  <Link href={`/admin/blog/${r.id}/edit`} title="Éditer" className="flex h-8 w-8 items-center justify-center rounded-lg text-(--color-ink-muted) hover:bg-(--color-surface-soft) hover:text-(--color-ink)">
                    <PencilLine className="h-4 w-4" />
                  </Link>
                  <DeletePostButton id={r.id} title={r.title} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

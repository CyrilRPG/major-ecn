import Link from 'next/link';
import { Newspaper, Plus, PencilLine, ExternalLink, Sparkles, ArrowRight, ListOrdered, Clock } from 'lucide-react';
import { requireBlogPage, peutModifierArticle } from '@/lib/blog/acces';
import { createAdminClient } from '@/lib/supabase/admin';
import { BLOG_CATEGORIES, type BlogCategory } from '@/lib/data/blog-articles';
import { BILLING_EUR } from '@/lib/ai/cost';
import { DeletePostButton, PostStatusButtons } from './list-actions';

export const dynamic = 'force-dynamic';

type Row = {
  id: string;
  slug: string;
  title: string;
  category: string;
  status: 'draft' | 'pending' | 'published';
  featured: boolean;
  published_at: string | null;
  updated_at: string;
  author_id: string | null;
  submitted_at: string | null;
};

const STATUT: Record<Row['status'], { label: string; cls: string }> = {
  published: { label: 'Publié', cls: 'bg-[#E7F6EC] text-[#16793C]' },
  pending: { label: 'En attente de validation', cls: 'bg-[#FEF3E2] text-[#B26A00]' },
  draft: { label: 'Brouillon', cls: 'bg-[#FEF3C7] text-[#92400E]' },
};

/**
 * Blog — ouvert à l'administrateur et aux collaborateurs dont le module Blog
 * est actif (cahier des charges §6). Chaque personne ne voit que les actions
 * que ses droits lui ouvrent ; la file « En attente de validation » est
 * présentée en premier à qui peut publier.
 */
export default async function AdminBlogPage() {
  const { user, isAdmin, droits } = await requireBlogPage();
  const { data, error } = await createAdminClient()
    .from('blog_posts')
    .select('id,slug,title,category,status,featured,published_at,updated_at,author_id,submitted_at')
    .order('updated_at', { ascending: false });
  const rows = (data ?? []) as unknown as Row[];
  const enAttente = rows.filter((r) => r.status === 'pending');
  const autres = rows.filter((r) => r.status !== 'pending');
  const nomsAuteurs = new Map<string, string>();
  const auteurIds = Array.from(new Set(rows.map((r) => r.author_id).filter((x): x is string => !!x)));
  if (auteurIds.length > 0) {
    const { data: auteurs } = await createAdminClient().from('profiles').select('id, first_name, last_name, email').in('id', auteurIds);
    for (const a of ((auteurs ?? []) as { id: string; first_name: string | null; last_name: string | null; email: string | null }[])) {
      nomsAuteurs.set(a.id, [a.first_name, a.last_name].filter(Boolean).join(' ') || a.email || '—');
    }
  }

  const ligne = (r: Row) => {
    const cat = BLOG_CATEGORIES[r.category as BlogCategory];
    const modifiable = peutModifierArticle(droits, r.author_id, user.id);
    return (
      <li key={r.id} className="flex items-center gap-3 rounded-xl border border-(--color-border) bg-white px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUT[r.status]?.cls ?? STATUT.draft.cls}`}>
              {STATUT[r.status]?.label ?? r.status}
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
            {r.author_id ? ` · ${r.author_id === user.id ? 'vous' : nomsAuteurs.get(r.author_id) ?? 'auteur'}` : ''}
            {r.status === 'pending' && r.submitted_at ? ` · soumis le ${new Date(r.submitted_at).toLocaleDateString('fr-FR')}` : ''}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <PostStatusButtons id={r.id} status={r.status} droits={{ publier: droits.publier, depublier: droits.depublier, modifier: modifiable }} />
          {r.status === 'published' && (
            <Link href={`/blog/${r.slug}`} target="_blank" title="Voir" className="flex h-8 w-8 items-center justify-center rounded-lg text-(--color-ink-muted) hover:bg-(--color-surface-soft) hover:text-(--color-ink)">
              <ExternalLink className="h-4 w-4" />
            </Link>
          )}
          {modifiable && (
            <Link href={`/admin/blog/${r.id}/edit`} title="Éditer" className="flex h-8 w-8 items-center justify-center rounded-lg text-(--color-ink-muted) hover:bg-(--color-surface-soft) hover:text-(--color-ink)">
              <PencilLine className="h-4 w-4" />
            </Link>
          )}
          {droits.supprimer && <DeletePostButton id={r.id} title={r.title} />}
        </div>
      </li>
    );
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-(--color-border) pb-5">
        <div>
          <p className="text-xs font-medium text-(--color-ink-muted)">Administration</p>
          <h1 className="mt-1 flex items-center gap-2 text-xl font-semibold tracking-tight text-(--color-ink)">
            <Newspaper className="h-5 w-5 text-[#E4002B]" /> Blog
          </h1>
          <p className="mt-1 text-sm text-(--color-ink-muted)">
            {droits.publier
              ? 'Créez et publiez des articles avec titres, images, encadrés et mise en page premium.'
              : 'Rédigez vos articles : ils rejoignent la file « En attente de validation », un responsable les publie.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link href="/admin/blog/ordre" className="inline-flex items-center gap-2 rounded-lg border border-(--color-border) bg-white px-3.5 py-2 text-sm font-semibold text-(--color-ink) hover:bg-(--color-surface-soft)">
              <ListOrdered className="h-4 w-4" /> Modifier l’ordre des articles
            </Link>
          )}
          {droits.creer && (
            <Link href="/admin/blog/new" className="inline-flex items-center gap-2 rounded-lg bg-[#C0001F] px-3.5 py-2 text-sm font-bold text-white hover:brightness-110">
              <Plus className="h-4 w-4" /> Nouvel article
            </Link>
          )}
        </div>
      </header>

      {isAdmin && (
        <Link href="/admin/blog/ia" className="group mb-6 flex items-center gap-4 overflow-hidden rounded-2xl border border-[#DDD6FE] bg-[linear-gradient(120deg,#FAF5FF_0%,#FFF1F3_100%)] p-5 transition-shadow hover:shadow-(--shadow-soft)">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#7C3AED,#C0001F)] text-white">
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-(--color-ink)">
              Importer un article par IA
              <span className="rounded-full bg-[#EDE9FE] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#6D28D9]">Nouveau</span>
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-(--color-ink-muted)">
              Déposez une bannière et votre texte : l’IA repense la mise en page (titres, encadrés colorés, tableaux, images), pose les liens internes et optimise l’article pour le SEO.
              Aperçu avant publication ·{' '}
              <strong className="font-bold text-(--color-ink)">{BILLING_EUR.article.toFixed(2).replace('.', ',')} € par article généré</strong> (facturation IA).
            </p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-[#7C3AED] transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}

      {error && <p className="mb-4 rounded-xl bg-[#FDE7E9] px-4 py-3 text-sm text-[#C0001F]">{error.message}</p>}

      {enAttente.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-[#B26A00]"><Clock className="h-4 w-4" /> En attente de validation ({enAttente.length})</h2>
          <ul className="space-y-2">{enAttente.map(ligne)}</ul>
        </section>
      )}

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-(--color-border) bg-(--color-surface-soft) px-4 py-12 text-center text-sm text-(--color-ink-muted)">
          Aucun article pour le moment.{droits.creer ? ' Cliquez sur « Nouvel article » pour commencer.' : ''}
        </p>
      ) : (
        <ul className="space-y-2">{autres.map(ligne)}</ul>
      )}
    </main>
  );
}

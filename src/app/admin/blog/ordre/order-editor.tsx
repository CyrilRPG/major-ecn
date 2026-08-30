'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowDown, ArrowUp, Check, Loader2, Save, Star } from 'lucide-react';
import { BLOG_CATEGORIES, type BlogCategory } from '@/lib/data/blog-articles';
import { saveBlogOrder } from './actions';

export type OrderRow = {
  slug: string;
  title: string;
  category: string;
  featured: boolean;
  /** Article de la base (éditable) ou statique (défini dans le code). */
  source: 'cms' | 'statique';
};

function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [it] = next.splice(from, 1);
  next.splice(to, 0, it);
  return next;
}

/**
 * Deux listes :
 *  1. l'ordre de TOUS les articles publiés (grille « Ressources » de /blog) ;
 *  2. la sélection « À la une » (étoile) et l'ordre du carrousel d'en-tête.
 */
export function OrderEditor({
  initialRows,
  initialFeatured,
}: {
  initialRows: OrderRow[];
  initialFeatured: string[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [featured, setFeatured] = useState<string[]>(initialFeatured);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const bySlug = new Map(rows.map((r) => [r.slug, r]));

  function toggleFeatured(slug: string) {
    setSaved(false);
    setFeatured((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }

  function submit() {
    setError(null);
    setSaved(false);
    start(async () => {
      const res = await saveBlogOrder({ order: rows.map((r) => r.slug), featured });
      if (!res.ok) {
        setError(res.error ?? 'Enregistrement impossible.');
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  const catBadge = (category: string) => {
    const c = BLOG_CATEGORIES[category as BlogCategory];
    if (!c) return null;
    return (
      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ background: c.bg, color: c.fg }}>
        {c.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* ───── À la une ───── */}
      <section className="rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] p-4 sm:p-5">
        <h2 className="flex items-center gap-2 text-sm font-bold text-(--color-ink)">
          <Star className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" /> À la une ({featured.length})
        </h2>
        <p className="mt-0.5 text-xs text-(--color-ink-muted)">
          Ces articles défilent dans le grand carrousel en tête de /blog, dans cet ordre.
          Cliquez sur l’étoile d’un article ci-dessous pour l’ajouter ou le retirer.
        </p>
        {featured.length === 0 ? (
          <p className="mt-3 rounded-lg border border-dashed border-[#FCD34D] px-3 py-3 text-xs text-[#92400E]">
            Aucun article sélectionné : le premier article de la liste sera affiché à la une.
          </p>
        ) : (
          <ul className="mt-3 space-y-1.5">
            {featured.map((slug, i) => {
              const row = bySlug.get(slug);
              if (!row) return null;
              return (
                <li key={slug} className="flex items-center gap-2 rounded-lg border border-[#FDE68A] bg-white px-3 py-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FEF3C7] text-[11px] font-extrabold text-[#B26A00]">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-(--color-ink)">{row.title}</span>
                  <button type="button" title="Monter" disabled={i === 0} onClick={() => { setSaved(false); setFeatured((p) => moveItem(p, i, i - 1)); }} className="flex h-7 w-7 items-center justify-center rounded text-(--color-ink-muted) hover:bg-(--color-surface-soft) disabled:opacity-30">
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" title="Descendre" disabled={i === featured.length - 1} onClick={() => { setSaved(false); setFeatured((p) => moveItem(p, i, i + 1)); }} className="flex h-7 w-7 items-center justify-center rounded text-(--color-ink-muted) hover:bg-(--color-surface-soft) disabled:opacity-30">
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" title="Retirer de la une" onClick={() => toggleFeatured(slug)} className="flex h-7 w-7 items-center justify-center rounded text-[#B26A00] hover:bg-[#FEF3C7]">
                    <Star className="h-4 w-4 fill-[#F59E0B]" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ───── Ordre général ───── */}
      <section className="rounded-2xl border border-(--color-border) bg-white p-4 sm:p-5">
        <h2 className="text-sm font-bold text-(--color-ink)">Ordre des articles (grille /blog)</h2>
        <p className="mt-0.5 text-xs text-(--color-ink-muted)">
          Du premier affiché au dernier. L’étoile ajoute l’article « À la une ».
        </p>
        <ul className="mt-3 space-y-1.5">
          {rows.map((r, i) => (
            <li key={r.slug} className="flex items-center gap-2 rounded-lg border border-(--color-border) bg-white px-3 py-2">
              <span className="w-7 shrink-0 text-center text-xs font-bold tabular-nums text-(--color-ink-muted)">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-(--color-ink)">{r.title}</p>
                <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                  {catBadge(r.category)}
                  <span className="text-[10px] uppercase tracking-wider text-(--color-ink-muted)">
                    {r.source === 'cms' ? 'CMS' : 'Statique'}
                  </span>
                  <span className="truncate text-[11px] text-(--color-ink-muted)">/blog/{r.slug}</span>
                </div>
              </div>
              <button
                type="button"
                title={featured.includes(r.slug) ? 'Retirer de la une' : 'Mettre à la une'}
                onClick={() => toggleFeatured(r.slug)}
                className="flex h-7 w-7 items-center justify-center rounded text-(--color-ink-muted) hover:bg-[#FEF3C7] hover:text-[#B26A00]"
              >
                <Star className={featured.includes(r.slug) ? 'h-4 w-4 fill-[#F59E0B] text-[#F59E0B]' : 'h-4 w-4'} />
              </button>
              <button type="button" title="Monter" disabled={i === 0} onClick={() => { setSaved(false); setRows((p) => moveItem(p, i, i - 1)); }} className="flex h-7 w-7 items-center justify-center rounded text-(--color-ink-muted) hover:bg-(--color-surface-soft) disabled:opacity-30">
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button type="button" title="Descendre" disabled={i === rows.length - 1} onClick={() => { setSaved(false); setRows((p) => moveItem(p, i, i + 1)); }} className="flex h-7 w-7 items-center justify-center rounded text-(--color-ink-muted) hover:bg-(--color-surface-soft) disabled:opacity-30">
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      {error && (
        <p className="rounded-lg bg-[#FDE7E9] px-3 py-2.5 text-sm font-medium text-[#C0001F]">{error}</p>
      )}

      <div className="sticky bottom-4 flex items-center gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={submit}
          className="inline-flex items-center gap-2 rounded-xl bg-[#C0001F] px-5 py-3 text-sm font-bold text-white shadow-lg hover:brightness-110 disabled:opacity-60"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Enregistrer l’ordre
        </button>
        {saved && (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#E7F6EC] px-3 py-2 text-sm font-semibold text-[#16793C]">
            <Check className="h-4 w-4" /> Ordre enregistré — visible immédiatement sur /blog
          </span>
        )}
      </div>
    </div>
  );
}

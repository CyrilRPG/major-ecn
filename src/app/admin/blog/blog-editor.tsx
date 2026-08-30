'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowUp, ArrowDown, Copy, Trash2, Plus, Save, Rocket, Loader2, ExternalLink,
  Type, Heading2, Heading3, List, ListOrdered, Image as ImageIcon, Images,
  Table2, StickyNote, Quote, Megaphone, Link2, Eye, X, Wand2, AlertTriangle,
} from 'lucide-react';
import type { Block, ImageLayout } from '@/lib/data/blog-content/types';
import { BLOG_CATEGORIES, type BlogCategory, type BlogArticleMeta } from '@/lib/data/blog-articles';
import { ArticleRich } from '@/components/marketing/blog/articles/article-rich';
import { savePost, type BlogPostInput } from './actions';
import { reviseArticleWithAi } from './ia/actions';
import { RichText } from './rich-text';
import { ImageUploader } from './image-uploader';

let counter = 0;
const uid = () => `b${++counter}`;
type Item = { id: string; block: Block };

function localSlugify(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 90);
}

const CALLOUT_TONES = [
  { value: 'tip', label: '💡 Conseil (bleu)' },
  { value: 'key', label: '✓ En résumé (vert)' },
  { value: 'warning', label: '⚠ À retenir (ambre)' },
  { value: 'source', label: '📌 Source officielle (gris)' },
] as const;

const LAYOUTS: { value: ImageLayout; label: string }[] = [
  { value: 'full', label: 'Pleine largeur' },
  { value: 'left', label: 'À gauche (texte à droite)' },
  { value: 'right', label: 'À droite (texte à gauche)' },
];

function newBlock(t: Block['t']): Block {
  switch (t) {
    case 'p': return { t: 'p', html: '' };
    case 'h2': return { t: 'h2', text: '' };
    case 'h3': return { t: 'h3', text: '' };
    case 'ul': return { t: 'ul', items: [''] };
    case 'ol': return { t: 'ol', items: [''] };
    case 'img': return { t: 'img', src: '', alt: '', caption: '', layout: 'full' };
    case 'gallery': return { t: 'gallery', images: [{ src: '', alt: '' }, { src: '', alt: '' }] };
    case 'table': return { t: 'table', headers: ['Colonne 1', 'Colonne 2'], rows: [['', '']] };
    case 'note': return { t: 'note', text: '' };
    case 'quote': return { t: 'quote', author: '', role: '', text: '' };
    case 'callout': return { t: 'callout', tone: 'tip', html: '' };
    case 'related': return { t: 'related', items: [{ label: '', href: '' }] };
    default: return { t: 'p', html: '' };
  }
}

const ADD_MENU: { t: Block['t']; label: string; Icon: typeof Type }[] = [
  { t: 'p', label: 'Paragraphe', Icon: Type },
  { t: 'h2', label: 'Titre', Icon: Heading2 },
  { t: 'h3', label: 'Sous-titre', Icon: Heading3 },
  { t: 'ul', label: 'Liste à puces', Icon: List },
  { t: 'ol', label: 'Liste numérotée', Icon: ListOrdered },
  { t: 'img', label: 'Image', Icon: ImageIcon },
  { t: 'gallery', label: 'Galerie', Icon: Images },
  { t: 'table', label: 'Tableau', Icon: Table2 },
  { t: 'callout', label: 'Encadré', Icon: Megaphone },
  { t: 'quote', label: 'Citation', Icon: Quote },
  { t: 'note', label: 'Note', Icon: StickyNote },
  { t: 'related', label: 'À lire aussi', Icon: Link2 },
];

const inputCls =
  'w-full rounded-md border border-(--color-border) bg-white px-2.5 py-1.5 text-sm text-(--color-ink) outline-none focus:border-[#E4002B]';
const labelCls = 'mb-1 block text-xs font-semibold text-(--color-ink-muted)';

export function BlogEditor({
  initial,
  allArticles,
  openPreview = false,
}: {
  initial?: BlogPostInput & { id: string };
  allArticles: { slug: string; title: string }[];
  /** Ouvre l'aperçu dès l'arrivée (retour d'un import IA : on relit puis on publie). */
  openPreview?: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);
  const [postId, setPostId] = useState<string | undefined>(initial?.id);

  const [title, setTitle] = useState(initial?.title ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? '');
  const [category, setCategory] = useState<BlogCategory>(initial?.category ?? 'conseils-methodologie');
  const [readingMinutes, setReadingMinutes] = useState(initial?.readingMinutes ?? 5);
  const [heroImage, setHeroImage] = useState<string | null>(initial?.heroImage ?? null);
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [publishedAt, setPublishedAt] = useState(
    initial?.publishedAt ?? new Date().toISOString().slice(0, 10),
  );
  const [items, setItems] = useState<Item[]>(
    (initial?.blocks ?? []).filter((b) => b.t !== 'hero').map((b) => ({ id: uid(), block: b })),
  );

  const [preview, setPreview] = useState(openPreview);
  const [status, setStatus] = useState<'draft' | 'published'>(initial?.status ?? 'draft');

  // Retouche par IA : remarques libres de l'administrateur, appliquées à
  // l'état COURANT de l'éditeur (modifications non enregistrées comprises).
  const [aiRemarks, setAiRemarks] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiChanges, setAiChanges] = useState<string | null>(null);
  const [aiWarnings, setAiWarnings] = useState<string[]>([]);

  async function runAiRevision() {
    if (aiBusy) return;
    if (aiRemarks.trim().length < 5) {
      setAiError('Écrivez d’abord vos remarques (ce qu’il faut corriger ou changer).');
      return;
    }
    setAiBusy(true);
    setAiError(null);
    setAiChanges(null);
    setAiWarnings([]);
    try {
      const res = await reviseArticleWithAi({
        id: postId,
        title,
        excerpt,
        readingMinutes,
        blocks: items.map((it) => it.block),
        remarks: aiRemarks,
      });
      if (!res.ok) {
        setAiError(res.error);
        return;
      }
      setTitle(res.title);
      setExcerpt(res.excerpt);
      setReadingMinutes(res.readingMinutes);
      setItems(res.blocks.map((b) => ({ id: uid(), block: b })));
      setAiChanges(res.changes || 'Remarques appliquées.');
      setAiWarnings(res.warnings);
      setAiRemarks('');
    } catch (e) {
      setAiError(`Retouche interrompue : ${(e as Error)?.message || 'connexion perdue'}. Rien n’a été modifié.`);
    } finally {
      setAiBusy(false);
    }
  }

  const effectiveSlug = slugTouched ? slug : localSlugify(title);

  // Données de prévisualisation : rendu identique à la page publiée (ArticleRich).
  const previewMeta: BlogArticleMeta = {
    slug: effectiveSlug || 'apercu',
    title: title || 'Titre de l’article',
    excerpt,
    category,
    readingMinutes,
    image: heroImage ?? undefined,
    readers: 0,
    publishedAt: publishedAt || undefined,
  };
  const previewBlocks: Block[] = heroImage
    ? [{ t: 'hero', src: heroImage, alt: title }, ...items.map((it) => it.block)]
    : items.map((it) => it.block);

  function setBlock(id: string, block: Block) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, block } : it)));
  }
  function move(id: string, dir: -1 | 1) {
    setItems((prev) => {
      const i = prev.findIndex((it) => it.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }
  function remove(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }
  function duplicate(id: string) {
    setItems((prev) => {
      const i = prev.findIndex((it) => it.id === id);
      if (i < 0) return prev;
      const clone: Item = { id: uid(), block: JSON.parse(JSON.stringify(prev[i].block)) };
      const next = [...prev];
      next.splice(i + 1, 0, clone);
      return next;
    });
  }
  function add(t: Block['t']) {
    setItems((prev) => [...prev, { id: uid(), block: newBlock(t) }]);
  }

  function submit(nextStatus: 'draft' | 'published') {
    setError(null);
    setSavedSlug(null);
    const input: BlogPostInput = {
      id: postId,
      slug: effectiveSlug,
      title,
      excerpt,
      category,
      readingMinutes,
      heroImage,
      status: nextStatus,
      featured,
      publishedAt,
      blocks: items.map((it) => it.block),
    };
    start(async () => {
      let res = await savePost(input);
      // Titre déjà pris : on demande une confirmation explicite avant de
      // créer un doublon (deux articles homonymes ont déjà été publiés puis
      // supprimés par erreur).
      if (!res.ok && 'duplicateOf' in res) {
        const ok = window.confirm(
          `Êtes-vous sûr ? Un article similaire a déjà été publié :\n\n« ${res.duplicateOf.title} »\n(/blog/${res.duplicateOf.slug})\n\nEnregistrer quand même celui-ci ?`,
        );
        if (!ok) {
          setError('Enregistrement annulé : un article similaire existe déjà.');
          return;
        }
        res = await savePost({ ...input, confirmDuplicate: true });
      }
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setPostId(res.id);
      setStatus(nextStatus);
      setSavedSlug(res.slug);
      setSlug(res.slug);
      setSlugTouched(true);
      router.refresh();
    });
  }

  return (
    <>
      {preview && (
        <PreviewOverlay
          meta={previewMeta}
          blocks={previewBlocks}
          published={status === 'published'}
          pending={pending}
          onPublish={() => {
            // On referme l'aperçu : le résultat (lien vers l'article ou erreur)
            // s'affiche dans le panneau « Publication ».
            submit('published');
            setPreview(false);
          }}
          onClose={() => setPreview(false)}
        />
      )}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* Colonne principale : contenu */}
      <div className="min-w-0 space-y-4">
        <section className="rounded-xl border border-(--color-border) bg-white p-4 sm:p-5">
          <label className={labelCls}>Titre de l’article</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex. Comment réussir les EVC en 2026"
            className="w-full rounded-md border border-(--color-border) px-3 py-2 text-lg font-bold text-(--color-ink) outline-none focus:border-[#E4002B]"
          />
          <div className="mt-3">
            <label className={labelCls}>Chapô / extrait (résumé affiché sous le titre et dans les listes)</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              placeholder="Résumé en une ou deux phrases."
              className={inputCls}
            />
          </div>
        </section>

        {/* Blocs de contenu */}
        <div className="space-y-3">
          {items.length === 0 && (
            <p className="rounded-xl border border-dashed border-(--color-border) bg-(--color-surface-soft) px-4 py-8 text-center text-sm text-(--color-ink-muted)">
              Aucun bloc pour le moment. Ajoutez un paragraphe, un titre, une image…
            </p>
          )}
          {items.map((it, idx) => (
            <BlockCard
              key={it.id}
              index={idx}
              total={items.length}
              block={it.block}
              allArticles={allArticles}
              onChange={(b) => setBlock(it.id, b)}
              onUp={() => move(it.id, -1)}
              onDown={() => move(it.id, 1)}
              onRemove={() => remove(it.id)}
              onDuplicate={() => duplicate(it.id)}
            />
          ))}
        </div>

        {/* Menu d'ajout de bloc */}
        <div className="rounded-xl border border-(--color-border) bg-(--color-surface-soft) p-3">
          <p className="mb-2 text-xs font-semibold text-(--color-ink-muted)">Ajouter un bloc</p>
          <div className="flex flex-wrap gap-1.5">
            {ADD_MENU.map(({ t, label, Icon }) => (
              <button
                key={t}
                type="button"
                onClick={() => add(t)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-(--color-border) bg-white px-2.5 py-1.5 text-xs font-medium text-(--color-ink) hover:border-[#E4002B] hover:text-[#E4002B]"
              >
                <Icon className="h-3.5 w-3.5" /> {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Colonne latérale : réglages + publication */}
      <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
        <section className="rounded-xl border border-(--color-border) bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-(--color-ink)">Publication</h3>
          {error && (
            <p className="mb-3 rounded-md bg-[#FDE7E9] px-2.5 py-2 text-xs text-[#C0001F]">{error}</p>
          )}
          {savedSlug && (
            <div className="mb-3 rounded-md bg-[#E7F6EC] px-2.5 py-2 text-xs text-[#16793C]">
              Enregistré ✓{' '}
              <Link href={`/blog/${savedSlug}`} target="_blank" className="inline-flex items-center gap-1 font-semibold underline">
                Voir l’article <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setPreview(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#E4002B] bg-white px-3 py-2 text-sm font-bold text-[#E4002B] hover:bg-[#FFF1F3]"
            >
              <Eye className="h-4 w-4" /> Aperçu
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => submit('published')}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#C0001F] px-3 py-2 text-sm font-bold text-white hover:brightness-110 disabled:opacity-60"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
              Publier
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => submit('draft')}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-(--color-border) bg-white px-3 py-2 text-sm font-semibold text-(--color-ink) hover:bg-(--color-surface-soft) disabled:opacity-60"
            >
              <Save className="h-4 w-4" /> Enregistrer le brouillon
            </button>
          </div>
        </section>

        {/* Retouche par IA : l'administrateur dicte ses corrections, l'IA
            modifie le contenu / la mise en page, l'aperçu permet de vérifier
            avant d'enregistrer. Gratuit (l'article a déjà été facturé). */}
        <section className="rounded-xl border border-[#DDD6FE] bg-[linear-gradient(135deg,#FAF5FF_0%,#FFFFFF_60%)] p-4">
          <h3 className="mb-1 inline-flex items-center gap-2 text-sm font-semibold text-(--color-ink)">
            <Wand2 className="h-4 w-4 text-[#7C3AED]" /> Retouche par IA
          </h3>
          <p className="mb-2 text-xs leading-relaxed text-(--color-ink-muted)">
            Décrivez ce qui ne va pas (erreur, formulation, mise en page…) : l’IA
            corrige l’article, puis vérifiez le résultat dans l’aperçu avant
            d’enregistrer. Gratuit.
          </p>
          <textarea
            value={aiRemarks}
            onChange={(e) => setAiRemarks(e.target.value)}
            rows={4}
            disabled={aiBusy}
            placeholder={'Ex. Le tableau des dates contient une erreur : l’EVC de pédiatrie est le 12 mars, pas le 10. Raccourcis l’introduction et transforme la liste des documents en tableau.'}
            className={inputCls}
          />
          {aiError && (
            <p className="mt-2 rounded-md bg-[#FDE7E9] px-2.5 py-2 text-xs text-[#C0001F]">{aiError}</p>
          )}
          {aiChanges && (
            <div className="mt-2 rounded-md bg-[#F3E8FF] px-2.5 py-2 text-xs text-[#5B21B6]">
              <p className="font-semibold">Modifications appliquées :</p>
              <p className="mt-0.5">{aiChanges}</p>
              <p className="mt-1 font-semibold">
                Vérifiez dans l’aperçu, puis enregistrez pour conserver.
              </p>
            </div>
          )}
          {aiWarnings.length > 0 && (
            <ul className="mt-2 space-y-1 rounded-md bg-[#FFFBEB] px-2.5 py-2 text-xs text-[#92400E]">
              {aiWarnings.map((w, i) => (
                <li key={i} className="flex gap-1.5">
                  <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" /> {w}
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            disabled={aiBusy}
            onClick={() => void runAiRevision()}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[linear-gradient(135deg,#7C3AED,#C0001F)] px-3 py-2 text-sm font-bold text-white hover:brightness-110 disabled:opacity-60"
          >
            {aiBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            {aiBusy ? 'Retouche en cours (1 à 2 min)…' : 'Appliquer mes remarques'}
          </button>
        </section>

        <section className="rounded-xl border border-(--color-border) bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-(--color-ink)">Réglages</h3>

          <label className={labelCls}>Image de couverture (hero)</label>
          <ImageUploader value={heroImage} onChange={setHeroImage} label="couverture" />

          <div className="mt-3">
            <label className={labelCls}>Catégorie</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as BlogCategory)}
              className={inputCls}
            >
              {(Object.keys(BLOG_CATEGORIES) as BlogCategory[]).map((k) => (
                <option key={k} value={k}>{BLOG_CATEGORIES[k].label}</option>
              ))}
            </select>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div>
              <label className={labelCls}>Temps de lecture (min)</label>
              <input
                type="number"
                min={1}
                max={120}
                value={readingMinutes}
                onChange={(e) => setReadingMinutes(Number(e.target.value))}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Date de publication</label>
              <input
                type="date"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div className="mt-3">
            <label className={labelCls}>Slug (URL)</label>
            <div className="flex items-center gap-1 rounded-md border border-(--color-border) px-2 py-1 text-xs text-(--color-ink-muted)">
              <span>/blog/</span>
              <input
                value={effectiveSlug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(localSlugify(e.target.value));
                }}
                className="min-w-0 flex-1 bg-transparent py-1 text-(--color-ink) outline-none"
              />
            </div>
          </div>

          <label className="mt-3 flex items-center gap-2 text-sm text-(--color-ink)">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            Mettre en avant (featured)
          </label>
        </section>
      </aside>
      </div>
    </>
  );
}

/* ───────────────────────── Aperçu plein écran ───────────────────────── */
function PreviewOverlay({
  meta,
  blocks,
  published,
  pending,
  onPublish,
  onClose,
}: {
  meta: BlogArticleMeta;
  blocks: Block[];
  published: boolean;
  pending: boolean;
  onPublish: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-(--color-border) bg-white px-4 py-2.5">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-(--color-ink)">
          <Eye className="h-4 w-4 text-[#E4002B]" /> Aperçu de l’article
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
              published ? 'bg-[#E7F6EC] text-[#16793C]' : 'bg-[#FEF3C7] text-[#92400E]'
            }`}
          >
            {published ? 'Publié' : 'Brouillon'}
          </span>
        </span>
        <div className="flex items-center gap-2">
          {/* Publication directe depuis l'aperçu : on relit, on publie. */}
          <button
            type="button"
            disabled={pending}
            onClick={onPublish}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#C0001F] px-3 py-1.5 text-sm font-bold text-white hover:brightness-110 disabled:opacity-60"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
            Publier
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-lg border border-(--color-border) px-3 py-1.5 text-sm font-semibold text-(--color-ink) hover:bg-(--color-surface-soft)"
          >
            <X className="h-4 w-4" /> Fermer l’aperçu
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <ArticleRich article={meta} blocks={blocks} />
      </div>
    </div>
  );
}

/* ───────────────────────── Éditeur d'un bloc ───────────────────────── */

function BlockCard({
  block,
  index,
  total,
  allArticles,
  onChange,
  onUp,
  onDown,
  onRemove,
  onDuplicate,
}: {
  block: Block;
  index: number;
  total: number;
  allArticles: { slug: string; title: string }[];
  onChange: (b: Block) => void;
  onUp: () => void;
  onDown: () => void;
  onRemove: () => void;
  onDuplicate: () => void;
}) {
  return (
    <div className="rounded-xl border border-(--color-border) bg-white">
      <div className="flex items-center justify-between border-b border-(--color-border) px-3 py-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-(--color-ink-muted)">
          {BLOCK_LABELS[block.t]}
        </span>
        <div className="flex items-center gap-0.5">
          <IconBtn title="Monter" disabled={index === 0} onClick={onUp}><ArrowUp className="h-3.5 w-3.5" /></IconBtn>
          <IconBtn title="Descendre" disabled={index === total - 1} onClick={onDown}><ArrowDown className="h-3.5 w-3.5" /></IconBtn>
          <IconBtn title="Dupliquer" onClick={onDuplicate}><Copy className="h-3.5 w-3.5" /></IconBtn>
          <IconBtn title="Supprimer" onClick={onRemove}><Trash2 className="h-3.5 w-3.5 text-[#C0001F]" /></IconBtn>
        </div>
      </div>
      <div className="p-3">
        <BlockBody block={block} allArticles={allArticles} onChange={onChange} />
      </div>
    </div>
  );
}

const BLOCK_LABELS: Record<Block['t'], string> = {
  hero: 'Hero', p: 'Paragraphe', h2: 'Titre', h3: 'Sous-titre', ul: 'Liste à puces',
  ol: 'Liste numérotée', img: 'Image', gallery: 'Galerie', table: 'Tableau',
  note: 'Note', quote: 'Citation', callout: 'Encadré', related: 'À lire aussi',
};

function BlockBody({
  block,
  allArticles,
  onChange,
}: {
  block: Block;
  allArticles: { slug: string; title: string }[];
  onChange: (b: Block) => void;
}) {
  switch (block.t) {
    case 'p':
      return <RichText value={block.html} singleLine={false} minHeight={64} placeholder="Écrivez votre paragraphe…" onChange={(html) => onChange({ ...block, html })} />;
    case 'callout':
      return (
        <div className="space-y-2">
          <select
            value={block.tone}
            onChange={(e) => onChange({ ...block, tone: e.target.value as typeof block.tone })}
            className={inputCls}
          >
            {CALLOUT_TONES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <RichText value={block.html} singleLine={false} minHeight={56} placeholder="Texte de l’encadré…" onChange={(html) => onChange({ ...block, html })} />
        </div>
      );
    case 'h2':
      return <input value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} placeholder="Titre de section" className={`${inputCls} text-base font-bold`} />;
    case 'h3':
      return <input value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} placeholder="Sous-titre" className={`${inputCls} font-semibold`} />;
    case 'note':
      return <textarea value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} rows={2} placeholder="Note / aparté (texte simple)" className={inputCls} />;
    case 'ul':
    case 'ol':
      return <ListEditor block={block} onChange={onChange} />;
    case 'img':
      return <ImgEditor block={block} onChange={onChange} />;
    case 'gallery':
      return <GalleryEditor block={block} onChange={onChange} />;
    case 'table':
      return <TableEditor block={block} onChange={onChange} />;
    case 'quote':
      return (
        <div className="space-y-2">
          <textarea value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} rows={2} placeholder="Citation (texte simple)" className={inputCls} />
          <div className="grid grid-cols-2 gap-2">
            <input value={block.author} onChange={(e) => onChange({ ...block, author: e.target.value })} placeholder="Auteur" className={inputCls} />
            <input value={block.role ?? ''} onChange={(e) => onChange({ ...block, role: e.target.value })} placeholder="Rôle (ex. Lauréat 2025)" className={inputCls} />
          </div>
        </div>
      );
    case 'related':
      return <RelatedEditor block={block} allArticles={allArticles} onChange={onChange} />;
    default:
      return null;
  }
}

function ListEditor({ block, onChange }: { block: Extract<Block, { t: 'ul' | 'ol' }>; onChange: (b: Block) => void }) {
  const setItem = (i: number, v: string) => {
    const items = [...block.items];
    items[i] = v;
    onChange({ ...block, items });
  };
  return (
    <div className="space-y-2">
      {block.items.map((it, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="mt-2 text-xs font-bold text-(--color-ink-muted)">{block.t === 'ol' ? `${i + 1}.` : '•'}</span>
          <div className="min-w-0 flex-1">
            <RichText value={it} onChange={(html) => setItem(i, html)} placeholder="Élément de liste…" />
          </div>
          <button type="button" onClick={() => onChange({ ...block, items: block.items.filter((_, j) => j !== i) })} className="mt-1.5 text-(--color-ink-muted) hover:text-[#C0001F]" title="Retirer">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange({ ...block, items: [...block.items, ''] })} className="inline-flex items-center gap-1 text-xs font-semibold text-[#E4002B]">
        <Plus className="h-3.5 w-3.5" /> Ajouter un élément
      </button>
    </div>
  );
}

function ImgEditor({ block, onChange }: { block: Extract<Block, { t: 'img' }>; onChange: (b: Block) => void }) {
  return (
    <div className="space-y-2">
      <ImageUploader value={block.src || null} onChange={(url) => onChange({ ...block, src: url ?? '' })} />
      <input value={block.alt} onChange={(e) => onChange({ ...block, alt: e.target.value })} placeholder="Texte alternatif (description, obligatoire)" className={inputCls} />
      <input value={block.caption ?? ''} onChange={(e) => onChange({ ...block, caption: e.target.value })} placeholder="Légende (optionnelle)" className={inputCls} />
      <select value={block.layout ?? 'full'} onChange={(e) => onChange({ ...block, layout: e.target.value as ImageLayout })} className={inputCls}>
        {LAYOUTS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
      </select>
    </div>
  );
}

function GalleryEditor({ block, onChange }: { block: Extract<Block, { t: 'gallery' }>; onChange: (b: Block) => void }) {
  const setImg = (i: number, patch: Partial<{ src: string; alt: string; caption: string }>) => {
    const images = block.images.map((im, j) => (j === i ? { ...im, ...patch } : im));
    onChange({ ...block, images });
  };
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {block.images.map((im, i) => (
          <div key={i} className="space-y-1.5 rounded-lg border border-(--color-border) p-2">
            <ImageUploader value={im.src || null} onChange={(url) => setImg(i, { src: url ?? '' })} aspClass="aspect-square" />
            <input value={im.alt} onChange={(e) => setImg(i, { alt: e.target.value })} placeholder="Alt" className={`${inputCls} text-xs`} />
            <button type="button" onClick={() => onChange({ ...block, images: block.images.filter((_, j) => j !== i) })} className="text-xs text-(--color-ink-muted) hover:text-[#C0001F]">Retirer</button>
          </div>
        ))}
      </div>
      {block.images.length < 3 && (
        <button type="button" onClick={() => onChange({ ...block, images: [...block.images, { src: '', alt: '' }] })} className="inline-flex items-center gap-1 text-xs font-semibold text-[#E4002B]">
          <Plus className="h-3.5 w-3.5" /> Ajouter une image
        </button>
      )}
    </div>
  );
}

function TableEditor({ block, onChange }: { block: Extract<Block, { t: 'table' }>; onChange: (b: Block) => void }) {
  const cols = block.headers.length;
  const setHeader = (i: number, v: string) => {
    const headers = [...block.headers];
    headers[i] = v;
    onChange({ ...block, headers });
  };
  const setCell = (r: number, c: number, v: string) => {
    const rows = block.rows.map((row, ri) => (ri === r ? row.map((cell, ci) => (ci === c ? v : cell)) : row));
    onChange({ ...block, rows });
  };
  const addRow = () => onChange({ ...block, rows: [...block.rows, Array(cols).fill('')] });
  const addCol = () => onChange({ ...block, headers: [...block.headers, `Colonne ${cols + 1}`], rows: block.rows.map((r) => [...r, '']) });
  const delRow = (r: number) => onChange({ ...block, rows: block.rows.filter((_, ri) => ri !== r) });
  const delCol = (c: number) => onChange({ ...block, headers: block.headers.filter((_, i) => i !== c), rows: block.rows.map((r) => r.filter((_, i) => i !== c)) });
  return (
    <div className="space-y-2 overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            {block.headers.map((h, i) => (
              <th key={i} className="p-1">
                <input value={h} onChange={(e) => setHeader(i, e.target.value)} className={`${inputCls} font-bold`} />
                {cols > 1 && <button type="button" onClick={() => delCol(i)} className="mt-0.5 text-[10px] text-(--color-ink-muted) hover:text-[#C0001F]">suppr. colonne</button>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td key={c} className="p-1">
                  <input value={cell} onChange={(e) => setCell(r, c, e.target.value)} className={inputCls} />
                </td>
              ))}
              <td className="p-1">
                <button type="button" onClick={() => delRow(r)} className="text-(--color-ink-muted) hover:text-[#C0001F]" title="Supprimer la ligne"><Trash2 className="h-3.5 w-3.5" /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex gap-2">
        <button type="button" onClick={addRow} className="inline-flex items-center gap-1 text-xs font-semibold text-[#E4002B]"><Plus className="h-3.5 w-3.5" /> Ligne</button>
        <button type="button" onClick={addCol} className="inline-flex items-center gap-1 text-xs font-semibold text-[#E4002B]"><Plus className="h-3.5 w-3.5" /> Colonne</button>
      </div>
    </div>
  );
}

function RelatedEditor({ block, allArticles, onChange }: { block: Extract<Block, { t: 'related' }>; allArticles: { slug: string; title: string }[]; onChange: (b: Block) => void }) {
  const addFromArticle = (slug: string) => {
    const a = allArticles.find((x) => x.slug === slug);
    if (!a) return;
    onChange({ ...block, items: [...block.items.filter((i) => i.href), { label: a.title, href: `/blog/${a.slug}` }] });
  };
  return (
    <div className="space-y-2">
      {block.items.filter((i) => i.href || i.label).map((it, i) => (
        <div key={i} className="flex items-center gap-2 rounded-md border border-(--color-border) px-2 py-1 text-xs">
          <span className="min-w-0 flex-1 truncate text-(--color-ink)">{it.label || it.href}</span>
          <button type="button" onClick={() => onChange({ ...block, items: block.items.filter((_, j) => j !== i) })} className="text-(--color-ink-muted) hover:text-[#C0001F]"><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
      ))}
      <select
        value=""
        onChange={(e) => { if (e.target.value) addFromArticle(e.target.value); }}
        className={inputCls}
      >
        <option value="">+ Ajouter un article lié…</option>
        {allArticles.map((a) => <option key={a.slug} value={a.slug}>{a.title}</option>)}
      </select>
    </div>
  );
}

function IconBtn({ children, title, onClick, disabled }: { children: React.ReactNode; title: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" title={title} onClick={onClick} disabled={disabled} className="flex h-6 w-6 items-center justify-center rounded text-(--color-ink-muted) hover:bg-(--color-surface-soft) hover:text-(--color-ink) disabled:opacity-30">
      {children}
    </button>
  );
}

'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertTriangle, Eye, ImagePlus, Images, Loader2, PencilLine, Search, Sparkles, Trash2, Wand2,
} from 'lucide-react';
import { importArticleWithAi, type ImportResult } from './actions';

type Success = Extract<ImportResult, { ok: true }>;

const MAX_EXTRA_IMAGES = 8;

const labelCls = 'mb-1 block text-sm font-semibold text-(--color-ink)';
const hintCls = 'mb-2 text-xs text-(--color-ink-muted)';
const areaCls =
  'w-full rounded-lg border border-(--color-border) bg-white px-3 py-2.5 text-sm text-(--color-ink) outline-none focus:border-[#7C3AED]';

export function AiImportForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Success | null>(null);

  const [banner, setBanner] = useState<File | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  // On garde l'URL de prévisualisation avec le fichier : la recréer à chaque
  // rendu fuirait un objet URL par image et par frappe au clavier.
  const [images, setImages] = useState<{ file: File; url: string }[]>([]);
  const [text, setText] = useState('');
  const [seoBrief, setSeoBrief] = useState('');

  const bannerRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef<HTMLInputElement>(null);

  function pickBanner(file: File | undefined) {
    if (!file) return;
    setBanner(file);
    setBannerUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }

  function addImages(files: FileList | null) {
    if (!files) return;
    const added = Array.from(files).map((file) => ({ file, url: URL.createObjectURL(file) }));
    setImages((prev) => [...prev, ...added].slice(0, MAX_EXTRA_IMAGES));
  }

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const canSubmit = Boolean(banner) && text.trim().length >= 200 && !pending;

  function submit() {
    if (!banner) {
      setError('L’image de bannière est obligatoire.');
      return;
    }
    setError(null);
    const fd = new FormData();
    fd.append('banner', banner);
    fd.append('text', text);
    fd.append('seoBrief', seoBrief);
    for (const img of images) fd.append('images', img.file);

    start(async () => {
      const res = await importArticleWithAi(fd);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setDone(res);
      router.refresh();
    });
  }

  if (done) {
    return (
      <div className="space-y-4">
        <section className="rounded-2xl border border-[#A7F3D0] bg-[#F0FDF4] p-5">
          <p className="inline-flex items-center gap-2 text-sm font-bold text-[#065F46]">
            <Sparkles className="h-4 w-4" /> Article importé et enregistré en brouillon
          </p>
          <h2 className="mt-2 text-lg font-bold text-(--color-ink)">{done.title}</h2>
          <p className="mt-1 text-xs text-(--color-ink-muted)">/blog/{done.slug}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/admin/blog/${done.id}/edit?apercu=1`}
              className="inline-flex items-center gap-2 rounded-lg bg-[#C0001F] px-3.5 py-2 text-sm font-bold text-white hover:brightness-110"
            >
              <Eye className="h-4 w-4" /> Voir l’aperçu et publier
            </Link>
            <Link
              href={`/admin/blog/${done.id}/edit`}
              className="inline-flex items-center gap-2 rounded-lg border border-(--color-border) bg-white px-3.5 py-2 text-sm font-semibold text-(--color-ink) hover:bg-(--color-surface-soft)"
            >
              <PencilLine className="h-4 w-4" /> Ouvrir l’éditeur
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-(--color-border) bg-white p-5">
          <h3 className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-(--color-ink)">
            <Search className="h-4 w-4 text-[#7C3AED]" /> Choix SEO de l’IA
          </h3>
          {done.seo.focusKeyword && (
            <p className="text-sm text-(--color-ink)">
              Mot-clé principal : <strong>{done.seo.focusKeyword}</strong>
            </p>
          )}
          {done.seo.keywords.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {done.seo.keywords.map((k) => (
                <span key={k} className="rounded-full bg-[#F3E8FF] px-2.5 py-0.5 text-xs font-medium text-[#6D28D9]">
                  {k}
                </span>
              ))}
            </div>
          )}
          {done.seo.notes && <p className="mt-2 text-sm text-(--color-ink-soft)">{done.seo.notes}</p>}
        </section>

        {done.warnings.length > 0 && (
          <section className="rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] p-4">
            <p className="mb-1.5 inline-flex items-center gap-2 text-sm font-semibold text-[#92400E]">
              <AlertTriangle className="h-4 w-4" /> À vérifier dans l’éditeur
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-[#78350F]">
              {done.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </section>
        )}

        <button
          type="button"
          onClick={() => {
            setDone(null);
            setBanner(null);
            setBannerUrl(null);
            setImages([]);
            setText('');
            setSeoBrief('');
          }}
          className="text-sm font-semibold text-[#7C3AED] hover:underline"
        >
          Importer un autre article
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 1 — Bannière (obligatoire) */}
      <section className="rounded-2xl border border-(--color-border) bg-white p-5">
        <label className={labelCls}>
          1. Image de bannière <span className="text-[#C0001F]">*</span>
        </label>
        <p className={hintCls}>
          Affichée en tête d’article et utilisée comme vignette dans la liste du blog et les partages.
        </p>
        {bannerUrl ? (
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-(--color-border)">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={bannerUrl} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => bannerRef.current?.click()}
              className="absolute bottom-2 right-2 rounded-lg bg-black/65 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-black/80"
            >
              Changer
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => bannerRef.current?.click()}
            className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-(--color-border) bg-(--color-surface-soft) text-(--color-ink-muted) hover:border-[#7C3AED] hover:text-[#7C3AED]"
          >
            <ImagePlus className="h-6 w-6" />
            <span className="text-xs font-medium">Déposer l’image de bannière</span>
          </button>
        )}
        <input
          ref={bannerRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            pickBanner(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </section>

      {/* 2 — Texte (obligatoire) */}
      <section className="rounded-2xl border border-(--color-border) bg-white p-5">
        <label className={labelCls}>
          2. Texte de l’article <span className="text-[#C0001F]">*</span>
        </label>
        <p className={hintCls}>
          Collez le texte brut : l’IA le découpe en sections, choisit les titres, les encadrés, les
          tableaux et repère les liens internes. Aucun fait ne sera inventé.
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={14}
          placeholder="Collez ici le texte complet de l’article…"
          className={areaCls}
        />
        <p className="mt-1 text-right text-xs text-(--color-ink-muted)">
          {words} mot{words > 1 ? 's' : ''} · {text.trim().length} caractères
          {text.trim().length > 0 && text.trim().length < 200 && ' — 200 caractères minimum'}
        </p>
      </section>

      {/* 3 — Images supplémentaires (facultatif) */}
      <section className="rounded-2xl border border-(--color-border) bg-white p-5">
        <label className={labelCls}>3. Images supplémentaires (facultatif)</label>
        <p className={hintCls}>
          L’IA les place où elles font sens dans l’article, avec un texte alternatif et une légende,
          en pleine largeur ou en habillage de texte. Jusqu’à {MAX_EXTRA_IMAGES} images.
        </p>
        {images.length > 0 && (
          <ul className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {images.map((im, i) => (
              <li key={im.url} className="relative overflow-hidden rounded-lg border border-(--color-border)">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={im.url} alt="" className="aspect-[4/3] w-full object-cover" />
                <button
                  type="button"
                  onClick={() =>
                    setImages((prev) => {
                      URL.revokeObjectURL(im.url);
                      return prev.filter((_, k) => k !== i);
                    })
                  }
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                  title="Retirer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          onClick={() => imagesRef.current?.click()}
          disabled={images.length >= MAX_EXTRA_IMAGES}
          className="inline-flex items-center gap-2 rounded-lg border border-(--color-border) bg-white px-3 py-2 text-sm font-semibold text-(--color-ink) hover:border-[#7C3AED] hover:text-[#7C3AED] disabled:opacity-50"
        >
          <Images className="h-4 w-4" /> Ajouter des images
        </button>
        <input
          ref={imagesRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            addImages(e.target.files);
            e.target.value = '';
          }}
        />
      </section>

      {/* 4 — Consignes SEO (facultatif) */}
      <section className="rounded-2xl border border-(--color-border) bg-white p-5">
        <label className={labelCls}>4. Indications SEO (facultatif)</label>
        <p className={hintCls}>
          Mot-clé à viser, requêtes à couvrir, pages du site vers lesquelles pointer, angle éditorial…
          Sans consigne, l’IA choisit elle-même le mot-clé principal le plus pertinent.
        </p>
        <textarea
          value={seoBrief}
          onChange={(e) => setSeoBrief(e.target.value)}
          rows={3}
          placeholder="Ex. viser « inscription EVC 2027 », pousser la formule intensive, couvrir les questions sur le calendrier CNG."
          className={areaCls}
        />
      </section>

      {error && (
        <p className="rounded-lg bg-[#FDE7E9] px-3 py-2.5 text-sm font-medium text-[#C0001F]">{error}</p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!canSubmit}
          onClick={submit}
          className="inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(135deg,#7C3AED,#C0001F)] px-5 py-3 text-sm font-bold text-white shadow-sm hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
          {pending ? 'Mise en page par l’IA…' : 'Importer et mettre en page'}
        </button>
        <span className="text-xs text-(--color-ink-muted)">
          {pending
            ? 'Rédaction, mise en page et maillage interne en cours — comptez une à deux minutes, ne fermez pas la page.'
            : 'Génération facturée 2,50 € · article créé en brouillon, publication après aperçu.'}
        </span>
      </div>
    </div>
  );
}

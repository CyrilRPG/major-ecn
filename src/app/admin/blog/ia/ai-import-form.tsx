'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertTriangle, Eye, ImagePlus, Images, Loader2, PencilLine, Search, Sparkles, Trash2, Wand2,
} from 'lucide-react';
import { uploadBlogImageFromBrowser } from '../upload-image-browser';
import { useImageDrop, useWindowDropGuard } from '../use-image-drop';
import { importArticleWithAi, type ImportResult } from './actions';

type Success = Extract<ImportResult, { ok: true }>;
/** Image déjà déposée dans le bucket : le formulaire ne manipule que des URLs. */
type Uploaded = { url: string; name: string };

const MAX_EXTRA_IMAGES = 8;
const MIN_TEXT_CHARS = 200;

const labelCls = 'mb-1 block text-sm font-semibold text-(--color-ink)';
const hintCls = 'mb-2 text-xs text-(--color-ink-muted)';
const areaCls =
  'w-full rounded-lg border border-(--color-border) bg-white px-3 py-2.5 text-sm text-(--color-ink) outline-none focus:border-[#7C3AED]';

export function AiImportForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Success | null>(null);

  // Les images partent vers Supabase Storage dès le dépôt : on ne garde ici que
  // leur URL publique, ce qui évite de faire transiter des fichiers lourds par
  // la server action (plafond de 4,5 Mo côté plateforme).
  const [banner, setBanner] = useState<Uploaded | null>(null);
  const [bannerBusy, setBannerBusy] = useState(false);
  const [images, setImages] = useState<Uploaded[]>([]);
  const [imagesBusy, setImagesBusy] = useState(0);
  const [text, setText] = useState('');
  const [seoBrief, setSeoBrief] = useState('');

  const bannerRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef<HTMLInputElement>(null);

  useWindowDropGuard();

  async function pickBanner(file: File | undefined) {
    if (!file || pending) return;
    setBannerBusy(true);
    setError(null);
    const res = await uploadBlogImageFromBrowser(file);
    setBannerBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setBanner({ url: res.url, name: res.name });
  }

  async function addImages(files: File[]) {
    if (pending) return;
    const free = MAX_EXTRA_IMAGES - images.length - imagesBusy;
    const batch = files.slice(0, Math.max(0, free));
    if (!batch.length) return;
    setError(null);
    setImagesBusy((n) => n + batch.length);
    for (const file of batch) {
      const res = await uploadBlogImageFromBrowser(file);
      setImagesBusy((n) => Math.max(0, n - 1));
      if (!res.ok) setError(res.error);
      else setImages((prev) => [...prev, { url: res.url, name: res.name }]);
    }
  }

  const bannerDrop = useImageDrop((files) => void pickBanner(files[0]));
  const imagesDrop = useImageDrop((files) => void addImages(files));

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const uploading = bannerBusy || imagesBusy > 0;

  function submit() {
    // Le bouton reste cliquable : mieux vaut dire ce qui manque que de laisser
    // l'administrateur devant un bouton grisé sans explication.
    if (uploading) {
      setError('Envoi des images en cours : patientez quelques secondes.');
      return;
    }
    if (!banner) {
      setError('L’image de bannière est obligatoire.');
      return;
    }
    if (text.trim().length < MIN_TEXT_CHARS) {
      setError(`Collez le texte de l’article (au moins ${MIN_TEXT_CHARS} caractères).`);
      return;
    }
    setError(null);

    const fd = new FormData();
    fd.append('bannerUrl', banner.url);
    fd.append('text', text);
    fd.append('seoBrief', seoBrief);
    fd.append('images', JSON.stringify(images));

    start(async () => {
      try {
        const res = await importArticleWithAi(fd);
        if (!res.ok) {
          setError(res.error);
          return;
        }
        setDone(res);
        router.refresh();
      } catch (e) {
        // Sans ce filet, une coupure réseau ou un dépassement du temps imparti
        // à la fonction laissait le formulaire muet : « rien ne se passe ».
        setError(
          `La mise en page n’a pas abouti : ${(e as Error)?.message || 'connexion interrompue'}. ` +
            'Aucun article n’a été créé, vous pouvez relancer l’import.',
        );
      }
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
            setImages([]);
            setText('');
            setSeoBrief('');
            setError(null);
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
          Glissez-déposez l’image ici, ou cliquez pour la choisir. Elle s’affiche en tête d’article et
          sert de vignette dans la liste du blog et les partages.
        </p>
        <div
          {...bannerDrop.dropProps}
          className={`relative aspect-[16/9] w-full overflow-hidden rounded-xl border ${
            bannerDrop.over ? 'border-[#7C3AED] ring-2 ring-[#7C3AED]/30' : 'border-(--color-border)'
          }`}
        >
          {banner ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={banner.url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => bannerRef.current?.click()}
                className="absolute bottom-2 right-2 rounded-lg bg-black/65 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-black/80"
              >
                Changer
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => bannerRef.current?.click()}
              disabled={bannerBusy}
              className={`flex h-full w-full flex-col items-center justify-center gap-1.5 border-dashed bg-(--color-surface-soft) text-(--color-ink-muted) hover:text-[#7C3AED] ${
                bannerDrop.over ? 'text-[#7C3AED]' : ''
              }`}
            >
              {bannerBusy ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
              <span className="text-xs font-medium">
                {bannerBusy ? 'Envoi de l’image…' : 'Déposez l’image de bannière ou cliquez ici'}
              </span>
            </button>
          )}
          {bannerDrop.over && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#7C3AED]/10 text-xs font-bold text-[#6D28D9]">
              Déposez pour {banner ? 'remplacer' : 'ajouter'} la bannière
            </div>
          )}
        </div>
        <input
          ref={bannerRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            void pickBanner(e.target.files?.[0]);
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
          {text.trim().length > 0 && text.trim().length < MIN_TEXT_CHARS && ' — 200 caractères minimum'}
        </p>
      </section>

      {/* 3 — Images supplémentaires (facultatif) */}
      <section className="rounded-2xl border border-(--color-border) bg-white p-5">
        <label className={labelCls}>3. Images supplémentaires (facultatif)</label>
        <p className={hintCls}>
          Glissez-déposez-les toutes en une fois : l’IA les place où elles font sens dans l’article,
          avec un texte alternatif et une légende, en pleine largeur ou en habillage de texte.
          Jusqu’à {MAX_EXTRA_IMAGES} images.
        </p>
        <div
          {...imagesDrop.dropProps}
          className={`rounded-xl border border-dashed p-3 ${
            imagesDrop.over
              ? 'border-[#7C3AED] bg-[#F3E8FF]/60'
              : 'border-(--color-border) bg-(--color-surface-soft)'
          }`}
        >
          {(images.length > 0 || imagesBusy > 0) && (
            <ul className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {images.map((im, i) => (
                <li key={im.url} className="relative overflow-hidden rounded-lg border border-(--color-border) bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={im.url} alt="" className="aspect-[4/3] w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((_, k) => k !== i))}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                    title="Retirer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
              {Array.from({ length: imagesBusy }, (_, i) => (
                <li
                  key={`busy-${i}`}
                  className="flex aspect-[4/3] items-center justify-center rounded-lg border border-(--color-border) bg-white text-(--color-ink-muted)"
                >
                  <Loader2 className="h-5 w-5 animate-spin" />
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => imagesRef.current?.click()}
              disabled={images.length + imagesBusy >= MAX_EXTRA_IMAGES}
              className="inline-flex items-center gap-2 rounded-lg border border-(--color-border) bg-white px-3 py-2 text-sm font-semibold text-(--color-ink) hover:border-[#7C3AED] hover:text-[#7C3AED] disabled:opacity-50"
            >
              <Images className="h-4 w-4" /> Ajouter des images
            </button>
            <span className="text-xs text-(--color-ink-muted)">
              {imagesDrop.over
                ? 'Déposez pour ajouter'
                : `…ou déposez-les dans ce cadre (${images.length}/${MAX_EXTRA_IMAGES})`}
            </span>
          </div>
        </div>
        <input
          ref={imagesRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            void addImages(Array.from(e.target.files ?? []));
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
          disabled={pending}
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

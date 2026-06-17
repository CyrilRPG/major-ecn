import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronRight, Clock, Eye, Calendar } from 'lucide-react';
import { BLOG_CATEGORIES, getRelatedArticles, type BlogArticleMeta } from '@/lib/data/blog-articles';

export const ARTICLE_FONT = "'Plus Jakarta Sans', sans-serif";

/** Bandeau final pleine largeur partagé entre les articles du blog.
 *  Logo Major ECN + accroche + sous-titre + CTA rouge. */
export function ArticleFinalCta() {
  return (
    <section className="mt-8 overflow-hidden rounded-2xl bg-[linear-gradient(90deg,#0F1F4D_0%,#5C1827_60%,#C0112E_100%)] p-5 text-white sm:p-6">
      <div className="grid items-center gap-3 lg:grid-cols-[auto_1fr_auto]">
        <Image
          src="/major-ecn-logo.png"
          alt="Major ECN"
          width={56}
          height={28}
          className="h-7 w-auto [filter:brightness(0)_invert(1)]"
        />
        <div>
          <p className="text-[14px] font-extrabold leading-tight">
            Major ECN, votre allié pour réussir les EVC PAE
          </p>
          <p className="mt-1 text-[12px] text-white/80">
            Rejoignez plus de 9 000 médecins qui nous font confiance pour réussir leur parcours.
          </p>
        </div>
        <Link
          href="/plateforme"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C0001F] px-4 py-2.5 text-[13px] font-extrabold text-white shadow-sm hover:scale-[1.02]"
        >
          Découvrir la préparation EVC <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

/** Header partagé : breadcrumb + pastilles catégorie + titre + meta. */
export function ArticleHeader({
  article,
  subtitle,
  rightArea,
}: {
  article: BlogArticleMeta;
  subtitle?: string;
  rightArea?: React.ReactNode;
}) {
  const c = BLOG_CATEGORIES[article.category];
  return (
    <header className="mb-6">
      <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-[12px] text-[#9AA1AE]">
        <Link href="/" className="hover:text-[#1A2233]">Accueil</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/blog" className="hover:text-[#1A2233]">Blog</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/blog?cat=${article.category}`} className="hover:text-[#1A2233]">{c.label}</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="line-clamp-1 text-[#52607A]">{article.title.slice(0, 80)}…</span>
      </nav>

      <div className="grid items-end gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em]"
            style={{ background: c.bg, color: c.fg }}
          >
            {c.label}
          </span>
          <h1 className="mt-3 text-[28px] font-black leading-[1.15] tracking-tight text-[#1A2233] sm:text-[34px] lg:text-[38px]">
            {article.title}
          </h1>
          {subtitle && <p className="mt-2 text-[14px] text-[#52607A]">{subtitle}</p>}
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12px] text-[#9AA1AE]">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {article.readingMinutes} min de lecture
            </span>
            {article.readers != null && (
              <span className="inline-flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                {article.readers.toLocaleString('fr-FR')} lecteurs
              </span>
            )}
            {article.publishedAt && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Mis à jour : {new Date(article.publishedAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>
        {rightArea}
      </div>
    </header>
  );
}

/** Layout 2 colonnes standard : article + aside.
 *  Le contenu et l'aside sont passés en children explicites. */
export function ArticleLayout({
  article,
  children,
  aside,
}: {
  article: BlogArticleMeta;
  children: React.ReactNode;
  aside: React.ReactNode;
}) {
  return (
    <main className="bg-[#FAFBFE] py-8 sm:py-10 lg:py-12" style={{ fontFamily: ARTICLE_FONT }}>
      <article className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {children}
        <RelatedArticlesSection currentSlug={article.slug} />
      </article>
      <RelatedFooter currentSlug={article.slug} />
      {/* aside non utilisé ici — laissé pour API ouverte ; les pages
          gèrent la grille elles-mêmes pour piloter le sticky behavior. */}
      {aside ? null : null}
    </main>
  );
}

/* ─────────────────── Mini section « Poursuivre votre lecture » ─────────────────── */
function RelatedArticlesSection({ currentSlug }: { currentSlug: string }) {
  const related = getRelatedArticles(currentSlug, 3);
  if (related.length === 0) return null;
  return (
    <section className="mt-12 border-t border-[#ECEEF1] pt-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#1A2233]">Poursuivre votre lecture</h2>
        <Link href="/blog" className="text-[12px] font-semibold text-[#E4002B] hover:underline">
          Voir tous les articles
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {related.map((a) => {
          const c = BLOG_CATEGORIES[a.category];
          return (
            <Link
              key={a.slug}
              href={`/blog/${a.slug}`}
              className="group rounded-2xl border border-[#ECEEF1] bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.16em]"
                style={{ background: c.bg, color: c.fg }}
              >
                {c.label}
              </span>
              <h3 className="mt-2 text-[14px] font-bold leading-snug text-[#1A2233] group-hover:text-[#E4002B]">
                {a.title}
              </h3>
              <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-[#9AA1AE]">
                <Clock className="h-3 w-3" /> {a.readingMinutes} min de lecture
              </p>
              <p className="mt-2 text-[12px] font-bold text-[#E4002B]">Lire l&rsquo;article</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function RelatedFooter({ currentSlug }: { currentSlug: string }) {
  void currentSlug;
  return null;
}

/* ─────────────────── Aside CTA réutilisable ─────────────────── */
export function PrepCtaCard({
  title = 'Préparez efficacement les EVC avec Major ECN',
  bullets = [
    'toutes les spécialités couvertes',
    'QCM corrigés',
    'Révisions transversales',
    'Cas cliniques',
    'Épreuves blanches',
    'Suivi pédagogique',
  ],
  ctaLabel = 'Découvrir la plateforme',
  ctaHref = '/plateforme',
}: {
  title?: string;
  bullets?: string[];
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <section className="rounded-2xl border border-[#ECEEF1] bg-white p-5 shadow-sm">
      <h3 className="text-[15px] font-bold leading-snug text-[#1A2233]">{title}</h3>
      <ul className="mt-3 space-y-1.5 text-[12.5px] text-[#1A2233]">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2">
            <span className="mt-1 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-[#16A34A] text-white">
              <svg viewBox="0 0 12 12" className="h-2 w-2" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M2 6l3 3 5-6" />
              </svg>
            </span>
            {b}
          </li>
        ))}
      </ul>
      {/* Aperçu plateforme — laptop + smartphone */}
      <div className="relative mt-4 overflow-hidden rounded-xl border bg-[linear-gradient(135deg,#FFF1F3_0%,#FFE4E8_100%)]"
        style={{ borderColor: '#FACBD0' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/plateforme/laptop-phone-dashboard.png"
          alt="Aperçu de la plateforme Major ECN sur ordinateur et smartphone"
          className="block h-auto w-full select-none"
          loading="lazy"
          decoding="async"
        />
        <span aria-hidden className="pointer-events-none absolute -top-6 -right-6 h-20 w-20 rounded-full opacity-40 blur-2xl"
          style={{ background: 'radial-gradient(closest-side, rgba(255,255,255,0.95), transparent 70%)' }} />
      </div>
      <Link
        href={ctaHref}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#C0001F] px-4 py-2.5 text-[13px] font-bold text-white shadow-sm transition-transform hover:scale-[1.01]"
      >
        {ctaLabel}
        <ChevronRight className="h-4 w-4" />
      </Link>
    </section>
  );
}

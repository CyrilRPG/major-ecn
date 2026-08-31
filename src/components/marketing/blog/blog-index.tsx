import Link from 'next/link';
import {
  ArrowRight, BookmarkPlus, BookOpen, Building2, ClipboardCheck, Clock,
  Euro, FileText, Globe2, Lightbulb, Stethoscope,
} from 'lucide-react';
import {
  getPublishedArticles, BLOG_CATEGORIES, BLOG_TOP_THEMES,
  type BlogArticleMeta, type BlogCategory,
} from '@/lib/data/blog-articles';
import { getDbPublishedArticles } from '@/lib/data/blog-db';
import { applyBlogOrder, getBlogOrderConfig, selectFeatured } from '@/lib/data/blog-order';
import { FeaturedCarousel } from './featured-carousel';
import { NewsletterForm } from './newsletter-form';

const FONT = "'Plus Jakarta Sans', sans-serif";

// Mini-icône colorée par catégorie pour les vignettes d'article
function CategoryIcon({ cat, className = 'h-6 w-6' }: { cat: BlogCategory; className?: string }) {
  const map: Record<BlogCategory, React.ElementType> = {
    'epreuves-evc':           ClipboardCheck,
    'candidature-dossier':    FileText,
    'exercice-medical':       Building2,
    'carriere-remuneration':  Euro,
    'medecins-etrangers':     Globe2,
    'conseils-methodologie':  Lightbulb,
    'specialites':            Stethoscope,
  };
  const Icon = map[cat];
  return <Icon className={className} />;
}

const THEME_ICONS: Record<string, React.ElementType> = {
  ClipboardCheck, Building2, Globe2, Euro, BookOpen,
};

export async function BlogIndex({
  searchParamsPromise,
}: {
  searchParamsPromise?: Promise<{ cat?: string }>;
}) {
  const sp = (await searchParamsPromise) ?? {};
  const activeCat = (sp.cat as BlogCategory | undefined) ?? null;

  // Articles statiques (ordre curé préservé) + articles créés depuis /admin/blog,
  // ces derniers (les plus récents) placés en tête de liste. L'administrateur
  // peut ensuite imposer son propre ordre (et la sélection « À la une ») depuis
  // /admin/blog/ordre.
  const staticArticles = getPublishedArticles();
  const seen = new Set(staticArticles.map((a) => a.slug));
  const dbArticles = (await getDbPublishedArticles())
    .filter((a) => !seen.has(a.slug))
    .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''));
  const orderConfig = await getBlogOrderConfig();
  const articles = applyBlogOrder([...dbArticles, ...staticArticles], orderConfig?.order ?? []);
  const featured = selectFeatured(articles, orderConfig);
  const visibleArticles = activeCat
    ? articles.filter((a) => a.category === activeCat)
    : articles;
  const popular = [...articles]
    .filter((a) => a.popularRank != null)
    .sort((a, b) => (a.popularRank ?? 99) - (b.popularRank ?? 99))
    .slice(0, 5);

  return (
    <main className="bg-[#FAFBFE] py-8 sm:py-10 lg:py-12" style={{ fontFamily: FONT }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ───── En-tête ───── */}
        <header className="mb-8">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            <span className="bg-[linear-gradient(90deg,#E4002B_0%,#7C1A38_55%,#3B1268_100%)] bg-clip-text text-transparent">
              Blog Major
            </span>{' '}
            <span className="text-[#1A2233]">ECN</span>
          </h1>
          <p className="mt-2 max-w-3xl text-[15px] text-[#52607A]">
            Conseils, démarches administratives et préparation aux Épreuves de Vérification
            des Connaissances (EVC).
          </p>
        </header>

        {/* Entrée vers la page hub : le blog n'est pas une collection d'articles
            isolés, tout est réuni et classé par étape du parcours dans /guide-evc. */}
        <Link
          href="/guide-evc"
          className="group mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#FACBD0] bg-[linear-gradient(160deg,#FFF7F8_0%,#FFE9EC_100%)] p-4 sm:p-5"
        >
          <span>
            <span className="block text-[15px] font-extrabold text-[#1A2233]">
              Guide complet des EVC
            </span>
            <span className="mt-1 block max-w-2xl text-[13px] leading-relaxed text-[#52607A]">
              Tous nos articles réunis et classés par étape du parcours : comprendre les épreuves,
              s&rsquo;inscrire au CNG, se préparer, choisir sa spécialité, puis exercer en France.
            </span>
          </span>
          <span className="inline-flex items-center gap-2 rounded-xl bg-[#C0001F] px-4 py-2.5 text-[13px] font-extrabold text-white shadow-sm transition-transform group-hover:scale-[1.02]">
            Ouvrir le guide EVC <ArrowRight className="h-4 w-4" />
          </span>
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* ───── Colonne principale ───── */}
          <div className="space-y-8">
            {/* Carrousel « À la une » (sélection et ordre gérés dans /admin/blog/ordre) */}
            <FeaturedCarousel articles={featured} />

            {/* Explorer les contenus — filtres */}
            <section>
              <h2 className="mb-3 text-base font-bold text-[#1A2233]">Explorer les contenus</h2>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(BLOG_CATEGORIES) as BlogCategory[]).map((key) => {
                  const c = BLOG_CATEGORIES[key];
                  const active = activeCat === key;
                  return (
                    <Link
                      key={key}
                      href={active ? '/blog' : `/blog?cat=${key}`}
                      className={`group inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-[13px] font-semibold transition-all ${
                        active
                          ? 'border-transparent shadow-sm'
                          : 'border-[#ECEEF1] bg-white hover:border-[#DDE1E7] hover:shadow-sm'
                      }`}
                      style={active ? { background: c.bg, color: c.fg } : { color: c.fg }}
                    >
                      <span
                        className="flex h-7 w-7 items-center justify-center rounded-lg"
                        style={{ background: c.bg, color: c.fg }}
                      >
                        <CategoryIcon cat={key} className="h-4 w-4" />
                      </span>
                      {c.label}
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* Ressources Major EVC — grille */}
            <section>
              <h2 className="mb-3 text-base font-bold text-[#1A2233]">Ressources Major EVC</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visibleArticles.map((a) => (
                  <ArticleCard key={a.slug} article={a} />
                ))}
              </div>
              {visibleArticles.length >= 6 && (
                <div className="mt-5 rounded-2xl border border-[#ECEEF1] bg-white py-4 text-center">
                  <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 text-sm font-bold text-[#E4002B] hover:underline"
                  >
                    Voir plus d&rsquo;articles <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </section>
          </div>

          {/* ───── Aside ───── */}
          <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            {/* Articles les plus consultés */}
            <section className="rounded-2xl border border-[#ECEEF1] bg-white p-5 shadow-sm">
              <h3 className="text-[15px] font-bold text-[#1A2233]">Les articles les plus consultés</h3>
              <ol className="mt-3 space-y-3">
                {popular.map((a) => (
                  <li key={a.slug}>
                    <Link href={`/blog/${a.slug}`} className="group flex gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FFE4E8] text-[12px] font-extrabold text-[#E4002B]">
                        {a.popularRank}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold leading-snug text-[#1A2233] group-hover:text-[#E4002B]">
                          {a.title}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-[#9AA1AE]">
                          <Clock className="h-3 w-3" />
                          {a.readingMinutes} min de lecture
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ol>
            </section>

            {/* Thématiques principales */}
            <section className="rounded-2xl border border-[#ECEEF1] bg-white p-5 shadow-sm">
              <h3 className="text-[15px] font-bold text-[#1A2233]">Thématiques principales</h3>
              <ul className="mt-3 space-y-1.5">
                {BLOG_TOP_THEMES.map((t) => {
                  const Icon = THEME_ICONS[t.icon] ?? BookOpen;
                  return (
                    <li key={t.href}>
                      <Link
                        href={t.href}
                        className="group flex items-center gap-3 rounded-xl px-2 py-2 text-[13.5px] font-medium text-[#1A2233] transition-colors hover:bg-[#F6F7F9]"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFE4E8] text-[#E4002B]">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="flex-1">{t.label}</span>
                        <ArrowRight className="h-4 w-4 text-[#9AA1AE] transition-transform group-hover:translate-x-0.5 group-hover:text-[#E4002B]" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>

            {/* Newsletter */}
            <section className="rounded-2xl border border-[#FACBD0] bg-[#FFF1F3] p-5 shadow-sm">
              <h3 className="text-[15px] font-bold text-[#1A2233]">Recevez nos nouveaux conseils EVC</h3>
              <p className="mt-1 text-[12px] leading-snug text-[#52607A]">
                Chaque semaine, nos meilleurs conseils et actualités directement dans votre boîte mail.
              </p>
              <NewsletterForm />
              <p className="mt-2 text-[11px] text-[#9AA1AE]">Pas de spam, désinscription en 1 clic.</p>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

/* ───────────────────── Carte article (grille) ───────────────────── */
function ArticleCard({ article }: { article: BlogArticleMeta }) {
  const c = BLOG_CATEGORIES[article.category];
  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group flex flex-col rounded-2xl border border-[#ECEEF1] bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#DDE1E7] hover:shadow-md"
    >
      <span
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
        style={{ background: c.bg, color: c.fg }}
      >
        <CategoryIcon cat={article.category} className="h-6 w-6" />
      </span>
      <h3 className="text-[15px] font-bold leading-snug text-[#1A2233] group-hover:text-[#E4002B]">
        {article.title}
      </h3>
      <p className="mt-2 line-clamp-3 flex-1 text-[12.5px] leading-relaxed text-[#52607A]">
        {article.excerpt}
      </p>
      <div className="mt-4 flex items-center justify-between border-t border-[#F2F3F5] pt-3 text-[11px] text-[#9AA1AE]">
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {article.readingMinutes} min de lecture
        </span>
        <BookmarkPlus className="h-3.5 w-3.5" />
      </div>
    </Link>
  );
}

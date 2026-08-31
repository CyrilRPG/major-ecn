import Link from 'next/link';
import { ArrowUpRight, ChevronRight, Compass } from 'lucide-react';
import { getRelatedArticles, BLOG_CATEGORIES } from '@/lib/data/blog-articles';
import { GUIDE_EVC_LABEL, GUIDE_EVC_PATH } from '@/lib/data/guide-evc';

/**
 * Maillage de retour vers la page hub /guide-evc (règle 2 du cahier des charges :
 * « chaque article renvoie vers le hub »). Deux emplacements, cumulables :
 *   — le fil d'Ariane en haut de page (Accueil › Guide EVC › titre) ;
 *   — l'encart de fin d'article, rendu par ArticleGuideFooter.
 */

/** Fil d'Ariane visible : Accueil › Guide EVC › [catégorie] › [titre]. */
export function GuideEvcBreadcrumb({
  title,
  category,
  className = '',
}: {
  title: string;
  category?: keyof typeof BLOG_CATEGORIES;
  className?: string;
}) {
  const c = category ? BLOG_CATEGORIES[category] : null;
  return (
    <nav
      aria-label="Fil d’Ariane"
      className={`flex flex-wrap items-center gap-1.5 text-[12px] text-[#9AA1AE] ${className}`}
    >
      <Link href="/" className="hover:text-[#1A2233]">Accueil</Link>
      <ChevronRight className="h-3 w-3" />
      <Link href={GUIDE_EVC_PATH} className="font-semibold text-[#52607A] hover:text-[#E4002B]">
        {GUIDE_EVC_LABEL}
      </Link>
      {c && category && (
        <>
          <ChevronRight className="h-3 w-3" />
          <Link href={`/blog?cat=${category}`} className="hover:text-[#1A2233]">{c.label}</Link>
        </>
      )}
      <ChevronRight className="h-3 w-3" />
      <span className="line-clamp-1 text-[#52607A]">{title}</span>
    </nav>
  );
}

/**
 * Bas de page commun à TOUS les articles du blog (statiques et base de données) :
 * encart de retour vers le guide + « À lire aussi » (3 à 5 liens internes, ancres
 * descriptives — règles 2, 3 et 4 du cahier des charges).
 *
 * Rendu une seule fois depuis /blog/[slug]/page.tsx : aucun article ne peut donc
 * être publié sans lien de retour vers le hub.
 */
export function ArticleGuideFooter({
  slug,
  excludeSlugs = [],
  showRelated = true,
}: {
  slug: string;
  /** Articles déjà mis en avant par le corps de l'article : évite un doublon de lien. */
  excludeSlugs?: string[];
  /** L'article possède déjà sa propre section « articles liés » en fin de page. */
  showRelated?: boolean;
}) {
  const excluded = new Set(excludeSlugs);
  // Trois liens : le cahier des charges recommande 3 à 5 liens sortants par
  // article, en comptant ceux que le corps de l'article contient déjà.
  const related = showRelated
    ? getRelatedArticles(slug, 8).filter((a) => !excluded.has(a.slug)).slice(0, 3)
    : [];

  return (
    <section
      className="bg-[#FAFBFE] pb-14"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-[#FACBD0] bg-[linear-gradient(160deg,#FFF7F8_0%,#FFE9EC_100%)] p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span
                className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#C0001F] text-white"
                aria-hidden
              >
                <Compass className="h-4.5 w-4.5" />
              </span>
              <div>
                <p className="text-[15px] font-extrabold leading-snug text-[#1A2233]">
                  Cet article fait partie de notre guide complet sur les EVC.
                </p>
                <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-[#52607A]">
                  Retrouvez toutes les étapes du parcours — comprendre les épreuves, s’inscrire au
                  CNG, se préparer, choisir sa spécialité, puis exercer en France — réunies au même
                  endroit.
                </p>
              </div>
            </div>
            <Link
              href={GUIDE_EVC_PATH}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C0001F] px-4 py-2.5 text-[13px] font-extrabold text-white shadow-sm transition-transform hover:scale-[1.02]"
            >
              Voir le guide complet des EVC
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {related.length > 0 && (
            <div className="mt-5 border-t border-[#F6C9CF] pt-4">
              <p className="mb-2.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#52607A]">
                À lire aussi dans le guide
              </p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {related.map((a) => (
                  <li key={a.slug}>
                    <Link
                      href={`/blog/${a.slug}`}
                      className="inline-flex items-start gap-1.5 text-[13.5px] font-semibold leading-snug text-[#C0001F] hover:underline"
                    >
                      <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      {a.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

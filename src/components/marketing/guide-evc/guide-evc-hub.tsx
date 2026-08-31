import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight, Building2, ClipboardCheck, Clock, Euro, FileText, Globe2,
  Lightbulb, List, Sparkles, Stethoscope,
} from 'lucide-react';
import { BLOG_CATEGORIES, type BlogArticleMeta, type BlogCategory } from '@/lib/data/blog-articles';
import { GUIDE_EVC_FAQ, type GuideSection } from '@/lib/data/guide-evc';
import { getGuideEvcSections } from '@/lib/data/guide-evc-sections';
import { PrepCtaCard, ArticleFinalCta } from '@/components/marketing/blog/article-shell';

const FONT = "'Plus Jakarta Sans', sans-serif";

const CATEGORY_ICON: Record<BlogCategory, React.ElementType> = {
  'epreuves-evc': ClipboardCheck,
  'candidature-dossier': FileText,
  'exercice-medical': Building2,
  'carriere-remuneration': Euro,
  'medecins-etrangers': Globe2,
  'conseils-methodologie': Lightbulb,
  'specialites': Stethoscope,
};

/** Carte d'article : titre cliquable descriptif + phrase de description. */
function ArticleLink({ article }: { article: BlogArticleMeta }) {
  const c = BLOG_CATEGORIES[article.category] ?? BLOG_CATEGORIES['epreuves-evc'];
  const Icon = CATEGORY_ICON[article.category] ?? ClipboardCheck;
  return (
    <li>
      <Link
        href={`/blog/${article.slug}`}
        className="group flex gap-3.5 rounded-2xl border border-[#ECEEF1] bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-[#DDE1E7] hover:shadow-md"
      >
        <span
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ background: c.bg, color: c.fg }}
          aria-hidden
        >
          <Icon className="h-4.5 w-4.5" />
        </span>
        <span className="min-w-0">
          <span className="block text-[14.5px] font-bold leading-snug text-[#1A2233] group-hover:text-[#E4002B]">
            {article.title}
          </span>
          <span className="mt-1 block text-[13px] leading-relaxed text-[#52607A]">
            {article.excerpt}
          </span>
          <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#9AA1AE]">
            <span className="font-semibold uppercase tracking-[0.14em]" style={{ color: c.fg }}>
              {c.label}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" /> {article.readingMinutes} min de lecture
            </span>
          </span>
        </span>
      </Link>
    </li>
  );
}

function Section({ section }: { section: GuideSection }) {
  return (
    <section id={section.id} className="scroll-mt-24 border-t border-[#ECEEF1] pt-8">
      <h2 className="text-[22px] font-black leading-tight tracking-tight text-[#1A2233] sm:text-[26px]">
        {section.title}
      </h2>
      <div className="mt-3 space-y-3">
        {section.intro.map((p, i) => (
          <p key={i} className="max-w-3xl text-[14.5px] leading-[1.75] text-[#3A4556]">
            {p}
          </p>
        ))}
      </div>

      {section.articles.length > 0 && (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {section.articles.map((a) => (
            <ArticleLink key={a.slug} article={a} />
          ))}
        </ul>
      )}

      {section.pageLinks && section.pageLinks.length > 0 && (
        <ul className="mt-4 space-y-2">
          {section.pageLinks.map((l) => (
            <li key={l.href} className="rounded-xl border border-[#FACBD0] bg-[#FFF7F8] p-3.5">
              <Link
                href={l.href}
                className="inline-flex items-center gap-1.5 text-[14px] font-bold text-[#C0001F] hover:underline"
              >
                {l.label} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <p className="mt-1 text-[13px] leading-relaxed text-[#52607A]">{l.description}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export async function GuideEvcHub() {
  const sections = await getGuideEvcSections();
  const articleCount = sections.reduce((n, s) => n + s.articles.length, 0);

  return (
    <div className="bg-[#FAFBFE] py-8 sm:py-10 lg:py-12" style={{ fontFamily: FONT }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ───────────── Bloc 1 — Introduction ───────────── */}
        <header className="grid items-center gap-8 lg:grid-cols-[1.35fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FDE7E9] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#C0001F]">
              Guide de référence
            </span>
            <h1 className="mt-3 text-[30px] font-black leading-[1.12] tracking-tight text-[#1A2233] sm:text-[38px] lg:text-[42px]">
              Guide complet des EVC : le parcours du médecin à diplôme étranger
            </h1>
            <div className="mt-5 space-y-3.5 text-[15px] leading-[1.75] text-[#3A4556]">
              <p>
                Les Épreuves de Vérification des Connaissances (EVC) conditionnent l’accès à
                l’exercice de la médecine en France pour les praticiens titulaires d’un diplôme
                obtenu hors Union européenne. Elles constituent la première étape de la procédure
                d’autorisation d’exercice (PAE), organisée chaque année par le Centre national de
                gestion.
              </p>
              <p>
                Ce guide s’adresse aux médecins PADHUE qui préparent ce concours, quelle que soit
                leur voie — interne ou externe — et leur spécialité. Il s’adresse aussi à ceux qui
                hésitent encore : comprendre le format des épreuves, les conditions d’éligibilité
                et ce qui attend un lauréat évite de perdre une année, ou une tentative.
              </p>
              <p>
                Vous y trouverez, réunis et classés par étape du parcours, l’ensemble de nos{' '}
                {articleCount} articles : comprendre les épreuves, constituer son dossier
                d’inscription, organiser sa préparation, choisir sa spécialité, aborder le jour de
                l’épreuve, puis le parcours de consolidation, les statuts et les rémunérations
                après la réussite.
              </p>
              <p>
                Cette page est mise à jour à mesure que de nouveaux articles sont publiés : c’est le
                point d’entrée à conserver plutôt qu’un article isolé.
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-[#ECEEF1] bg-white shadow-sm">
            <Image
              src="/blog/couloir-hopital.jpg"
              alt="Couloir d’hôpital — exercice de la médecine en France après les EVC"
              width={880}
              height={620}
              priority
              sizes="(max-width: 1024px) 100vw, 420px"
              className="h-auto w-full object-cover"
            />
          </div>
        </header>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            {/* ───────────── Bloc 2 — Sommaire ancré ───────────── */}
            <nav
              aria-label="Sommaire du guide"
              className="rounded-2xl border border-[#ECEEF1] bg-white p-5"
            >
              <p className="mb-3 inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#52607A]">
                <List className="h-3.5 w-3.5" /> Sommaire
              </p>
              <ol className="grid gap-1.5 sm:grid-cols-2">
                {sections.map((s, i) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="inline-flex items-baseline gap-2 text-[14px] text-[#3A4556] hover:text-[#E4002B] hover:underline"
                    >
                      <span className="text-[12px] font-extrabold text-[#9AA1AE]">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {s.navLabel}
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href="#questions-frequentes"
                    className="inline-flex items-baseline gap-2 text-[14px] text-[#3A4556] hover:text-[#E4002B] hover:underline"
                  >
                    <span className="text-[12px] font-extrabold text-[#9AA1AE]">
                      {String(sections.length + 1).padStart(2, '0')}
                    </span>
                    Questions fréquentes
                  </a>
                </li>
              </ol>
            </nav>

            {/* ───────────── Blocs 3 à N — Une section par thème ───────────── */}
            <div className="mt-10 space-y-10">
              {sections.map((s) => (
                <Section key={s.id} section={s} />
              ))}

              {/* ───────────── Questions fréquentes (schéma FAQPage) ───────────── */}
              <section id="questions-frequentes" className="scroll-mt-24 border-t border-[#ECEEF1] pt-8">
                <h2 className="text-[22px] font-black leading-tight tracking-tight text-[#1A2233] sm:text-[26px]">
                  Questions fréquentes sur les EVC
                </h2>
                <p className="mt-3 max-w-3xl text-[14.5px] leading-[1.75] text-[#3A4556]">
                  Les questions que les candidats nous posent le plus souvent, avec des réponses
                  courtes. Chacune est développée dans l’un des articles de ce guide.
                </p>
                <div className="mt-5 space-y-3">
                  {GUIDE_EVC_FAQ.map((item) => (
                    <div
                      key={item.q}
                      className="rounded-2xl border border-[#ECEEF1] bg-white p-4 sm:p-5"
                    >
                      <h3 className="text-[15px] font-bold leading-snug text-[#1A2233]">{item.q}</h3>
                      <p className="mt-2 text-[13.5px] leading-[1.75] text-[#52607A]">{item.a}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* ───────────── Bloc final — Appel à l'action ───────────── */}
              <section className="border-t border-[#ECEEF1] pt-8">
                <h2 className="text-[22px] font-black leading-tight tracking-tight text-[#1A2233] sm:text-[26px]">
                  Préparer les EVC avec Major ECN
                </h2>
                <p className="mt-3 max-w-3xl text-[14.5px] leading-[1.75] text-[#3A4556]">
                  Lire ce guide vous donne la carte du parcours ; la réussite se joue ensuite sur
                  l’entraînement. Major ECN prépare les médecins à diplôme étranger depuis 2011,
                  dans toutes les spécialités du concours.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <Link
                    href="/espace-decouverte"
                    className="group rounded-2xl border border-[#ECEEF1] bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E4002B] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-white">
                      <Sparkles className="h-3 w-3" /> Gratuit
                    </span>
                    <span className="mt-2.5 block text-[14.5px] font-bold text-[#1A2233] group-hover:text-[#E4002B]">
                      Tester l’espace découverte
                    </span>
                    <span className="mt-1 block text-[13px] leading-relaxed text-[#52607A]">
                      QCM, dossiers cliniques et flashcards au niveau réel du concours, sans
                      engagement.
                    </span>
                  </Link>
                  <Link
                    href="/specialites"
                    className="group rounded-2xl border border-[#ECEEF1] bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <span className="mt-2.5 block text-[14.5px] font-bold text-[#1A2233] group-hover:text-[#E4002B]">
                      Consulter les spécialités préparées
                    </span>
                    <span className="mt-1 block text-[13px] leading-relaxed text-[#52607A]">
                      Le programme et les supports disponibles pour chaque spécialité des EVC.
                    </span>
                  </Link>
                  <Link
                    href="/tarifs"
                    className="group rounded-2xl border border-[#ECEEF1] bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <span className="mt-2.5 block text-[14.5px] font-bold text-[#1A2233] group-hover:text-[#E4002B]">
                      Voir les formules et les tarifs
                    </span>
                    <span className="mt-1 block text-[13px] leading-relaxed text-[#52607A]">
                      Les trois formules de préparation, leur contenu et leurs conditions
                      d’inscription.
                    </span>
                  </Link>
                </div>
                <ArticleFinalCta />
              </section>
            </div>
          </div>

          {/* ───────────── Colonne de droite ───────────── */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <PrepCtaCard />
              <Link
                href="/blog"
                className="block rounded-2xl border border-[#ECEEF1] bg-white p-4 text-[13px] font-semibold text-[#3A4556] hover:border-[#DDE1E7] hover:shadow-sm"
              >
                Parcourir tous les articles du blog
                <ArrowRight className="ml-1 inline h-3.5 w-3.5 text-[#E4002B]" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

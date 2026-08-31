import Link from 'next/link';
import Image from 'next/image';
import { BLOG_CATEGORIES, type BlogArticleMeta } from '@/lib/data/blog-articles';
import { GUIDE_EVC_FAQ, type GuideSection, type GuideSectionId } from '@/lib/data/guide-evc';
import { getGuideEvcSections } from '@/lib/data/guide-evc-sections';
import { MeshGradient, NoiseTexture, SpotlightCard } from '@/components/marketing/premium-ui';
import { FaqQuestionList } from '@/components/marketing/faq-accordion';

/* ── Palette de la charte ─────────────────────────────────────────────── */
const FONT = "'Plus Jakarta Sans', sans-serif";
const NAVY = '#0F1F4D';
const RED = '#C0112E';
const INK = '#1A2233';
const INK_SOFT = '#52607A';
const MUTED = '#9AA1AE';
const BORDER = '#ECEEF1';

/** Teinte propre à chaque étape du parcours (aucun pictogramme : la couleur et
 *  le numéro suffisent à distinguer les sections). */
const SECTION_ACCENT: Record<GuideSectionId, { accent: string; soft: string }> = {
  'comprendre':        { accent: '#C0112E', soft: '#FDE7E9' },
  's-inscrire':        { accent: '#1E4D8B', soft: '#E5F1FF' },
  'se-preparer':       { accent: '#B26A00', soft: '#FEF3E2' },
  'par-specialite':    { accent: '#3730A3', soft: '#EEF2FF' },
  'jour-de-l-epreuve': { accent: '#6D28D9', soft: '#EDE9FE' },
  'apres-les-evc':     { accent: '#16793C', soft: '#E7F6EC' },
  'carriere':          { accent: '#0F766E', soft: '#CCFBF1' },
};

/* ── Carte d'article ──────────────────────────────────────────────────── */
function ArticleCard({ article }: { article: BlogArticleMeta }) {
  const c = BLOG_CATEGORIES[article.category] ?? BLOG_CATEGORIES['epreuves-evc'];
  return (
    <li className="h-full">
      <SpotlightCard
        spotlightColor={`${c.fg}12`}
        className="h-full rounded-2xl border bg-white shadow-[0_6px_20px_-14px_rgba(15,31,77,0.28)] transition-all duration-300 hover:-translate-y-1 hover:border-[#DDE1E7] hover:shadow-[0_20px_40px_-20px_rgba(15,31,77,0.35)]"
        style={{ borderColor: BORDER }}
      >
        <Link href={`/blog/${article.slug}`} className="flex h-full flex-col gap-3 p-5">
          <span
            className="self-start rounded-full px-2.5 py-1 text-[9.5px] font-extrabold uppercase tracking-[0.16em]"
            style={{ background: c.bg, color: c.fg }}
          >
            {c.label}
          </span>

          <span className="line-clamp-3 block text-[15px] font-extrabold leading-snug tracking-tight" style={{ color: INK }}>
            {article.title}
          </span>
          <span className="line-clamp-4 block flex-1 text-[13px] leading-relaxed" style={{ color: INK_SOFT }}>
            {article.excerpt}
          </span>
          <span
            className="mt-auto flex items-center justify-between border-t pt-2.5 text-[11px] font-semibold"
            style={{ borderColor: BORDER, color: MUTED }}
          >
            <span>{article.readingMinutes} min de lecture</span>
            <span className="font-extrabold uppercase tracking-[0.14em]" style={{ color: RED }}>
              Lire
            </span>
          </span>
        </Link>
      </SpotlightCard>
    </li>
  );
}

/* ── Une section du guide ─────────────────────────────────────────────── */
function GuideSectionBlock({ section, index }: { section: GuideSection; index: number }) {
  const theme = SECTION_ACCENT[section.id];
  const n = String(index + 1).padStart(2, '0');

  return (
    <section id={section.id} className="scroll-mt-28">
        <header>
          <div className="flex items-start gap-4">
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-[16px] font-black"
              style={{ background: theme.soft, color: theme.accent }}
              aria-hidden
            >
              {n}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10.5px] font-extrabold uppercase tracking-[0.2em]" style={{ color: theme.accent }}>
                Étape {n} sur 07
              </p>
              <h2 className="mt-1 text-[23px] font-black leading-tight tracking-tight sm:text-[27px]" style={{ color: INK }}>
                {section.title}
              </h2>
            </div>
          </div>
          <div
            className="mt-5 h-px w-full"
            style={{ background: `linear-gradient(90deg, ${theme.accent}55 0%, ${BORDER} 45%, transparent 100%)` }}
          />
        </header>

        <div className="mt-5 grid gap-x-10 gap-y-3 lg:grid-cols-2">
          {section.intro.map((p, i) => (
            <p
              key={i}
              className={`text-[14.5px] leading-[1.8] ${i === 0 ? 'lg:col-span-2 lg:text-[15.5px]' : ''}`}
              style={{ color: i === 0 ? INK : INK_SOFT }}
            >
              {p}
            </p>
          ))}
        </div>

        {section.articles.length > 0 && (
          <>
            <p className="mt-7 flex items-center gap-3 text-[11px] font-extrabold uppercase tracking-[0.18em]" style={{ color: MUTED }}>
              <span className="h-px w-6" style={{ background: BORDER }} />
              {section.articles.length} article{section.articles.length > 1 ? 's' : ''} sur ce thème
            </p>
            <ul className="mt-3.5 grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
              {section.articles.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </ul>
          </>
        )}

        {section.pageLinks && section.pageLinks.length > 0 && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {section.pageLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="group rounded-2xl border border-[#FACBD0] bg-[linear-gradient(150deg,#FFF7F8_0%,#FFECEF_100%)] p-4 transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-20px_rgba(192,17,46,0.55)]"
              >
                <span className="block text-[9.5px] font-extrabold uppercase tracking-[0.18em]" style={{ color: RED }}>
                  Ressource Major ECN
                </span>
                <span className="mt-1.5 block text-[14px] font-extrabold group-hover:underline" style={{ color: '#8B0E22' }}>
                  {l.label}
                </span>
                <span className="mt-1 block text-[12.5px] leading-relaxed" style={{ color: INK_SOFT }}>
                  {l.description}
                </span>
              </Link>
            ))}
          </div>
        )}
    </section>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────── */
export async function GuideEvcHub() {
  const sections = await getGuideEvcSections();
  const articleCount = sections.reduce((n, s) => n + s.articles.length, 0);

  return (
    <div style={{ fontFamily: FONT }}>
      {/* ═════════════ Bloc 1 — Introduction ═════════════ */}
      <header
        className="relative isolate overflow-hidden"
        style={{ background: `linear-gradient(120deg, ${NAVY} 0%, #2A1B45 38%, #5C1827 68%, ${RED} 100%)` }}
      >
        <NoiseTexture opacity={0.06} />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-[12%] -top-[35%] h-[70%] w-[55%] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(closest-side, rgba(255,255,255,0.22), transparent 70%)' }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-[45%] left-[8%] h-[75%] w-[45%] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(closest-side, rgba(245,200,75,0.18), transparent 70%)' }}
        />

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-14">
            <div>
              <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[10.5px] font-extrabold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                Guide de référence, mis à jour en continu
              </span>

              <h1 className="mt-5 text-[32px] font-black leading-[1.08] tracking-tight text-white sm:text-[42px] lg:text-[48px]">
                Guide complet des EVC :{' '}
                <span
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #FFD9DF 0%, #FFB3BF 45%, #F5C84B 100%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    color: 'transparent',
                  }}
                >
                  le parcours du médecin à diplôme étranger
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-[16px] leading-[1.75] text-white/80">
                Les Épreuves de Vérification des Connaissances conditionnent l’accès à l’exercice de
                la médecine en France pour les praticiens titulaires d’un diplôme obtenu hors Union
                européenne. Elles constituent la première étape de la procédure d’autorisation
                d’exercice (PAE), organisée chaque année par le Centre national de gestion.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a
                  href="#comprendre"
                  className="inline-flex items-center rounded-xl bg-white px-5 py-3 text-[14px] font-extrabold shadow-[0_16px_34px_-16px_rgba(0,0,0,0.6)] transition-transform hover:scale-[1.02]"
                  style={{ color: NAVY }}
                >
                  Commencer le guide
                </a>
                <Link
                  href="/espace-decouverte"
                  className="inline-flex items-center rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-[14px] font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  Tester la préparation gratuitement
                </Link>
              </div>

              {/* Chiffres clés. Valeurs écrites telles quelles : un compteur
                  animé part de zéro, et c'est ce zéro que contiennent le HTML
                  servi et donc la page telle que l'indexe un moteur. */}
              <dl className="mt-9 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
                {[
                  { value: String(articleCount), label: 'articles réunis' },
                  { value: String(sections.length), label: 'étapes du parcours' },
                  { value: '9 000+', label: 'médecins accompagnés' },
                  { value: '2011', label: 'préparation depuis' },
                ].map(({ value, label }) => (
                  <div key={label} className="border-l border-white/20 pl-3.5">
                    <dd className="text-[26px] font-black leading-none text-white">{value}</dd>
                    <dt className="mt-1.5 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-white/55">
                      {label}
                    </dt>
                  </div>
                ))}
              </dl>
            </div>

            {/* Visuel */}
            <div className="relative hidden lg:block">
              <div className="relative overflow-hidden rounded-3xl border border-white/20 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.85)]">
                <Image
                  src="/blog/couloir-hopital.jpg"
                  alt="Couloir d’hôpital, exercer la médecine en France après les EVC"
                  width={880}
                  height={660}
                  // Pas de `priority` : le visuel est masqué sous 1024 px, un
                  // préchargement obligerait le mobile à télécharger une image
                  // jamais affichée.
                  loading="lazy"
                  sizes="(max-width: 1024px) 0px, 460px"
                  className="h-full w-full object-cover"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{ background: 'linear-gradient(180deg, rgba(15,31,77,0) 45%, rgba(15,31,77,0.55) 100%)' }}
                />
                <p className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/20 bg-white/12 p-3.5 text-[12.5px] font-bold text-white backdrop-blur-md">
                  Toutes les spécialités du concours, une seule page de référence
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ═════════════ Corps ═════════════ */}
      <div className="relative isolate bg-[#FAFBFE]">
        <MeshGradient
          colors={['rgba(192,17,46,0.10)', 'rgba(15,31,77,0.08)', 'rgba(124,58,237,0.07)', 'rgba(245,200,75,0.08)']}
        />

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          {/* ── Suite de l'introduction ── */}
            <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
              <div className="space-y-4 text-[15px] leading-[1.8]" style={{ color: INK_SOFT }}>
                <p>
                  Ce guide s’adresse aux médecins PADHUE qui préparent ce concours, quelle que soit
                  leur voie, interne ou externe, et leur spécialité. Il s’adresse aussi à ceux qui
                  hésitent encore : comprendre le format des épreuves, les conditions d’éligibilité
                  et ce qui attend un lauréat évite de perdre une année, ou une tentative.
                </p>
                <p>
                  Vous y trouverez, réunis et classés par étape du parcours, l’ensemble de nos{' '}
                  <strong className="font-extrabold" style={{ color: INK }}>{articleCount} articles</strong> :
                  comprendre les épreuves, constituer son dossier d’inscription, organiser sa
                  préparation, choisir sa spécialité, aborder le jour de l’épreuve, puis le parcours
                  de consolidation, les statuts et les rémunérations après la réussite.
                </p>
                <p>
                  Cette page est mise à jour à mesure que de nouveaux articles sont publiés : c’est
                  le point d’entrée à conserver plutôt qu’un article isolé.
                </p>
              </div>

              <aside className="rounded-3xl border bg-white p-5 shadow-[0_10px_30px_-20px_rgba(15,31,77,0.4)]" style={{ borderColor: BORDER }}>
                <p className="text-[10.5px] font-extrabold uppercase tracking-[0.18em]" style={{ color: MUTED }}>
                  À qui s’adresse ce guide
                </p>
                <ul className="mt-3 space-y-2.5">
                  {[
                    'Médecins à diplôme obtenu hors Union européenne (PADHUE)',
                    'Candidats en voie interne comme en voie externe',
                    'Praticiens hésitant encore sur leur spécialité',
                    'Lauréats préparant leur parcours de consolidation',
                  ].map((t) => (
                    <li key={t} className="border-l-2 pl-3 text-[13.5px] leading-relaxed" style={{ borderColor: '#FACBD0', color: INK }}>
                      {t}
                    </li>
                  ))}
                </ul>
              </aside>
            </div>

          {/* ── Bloc 2 — Sommaire ancré ── */}
            <nav aria-label="Sommaire du guide" className="mt-12">
              <div className="flex items-center gap-3">
                <h2 className="text-[11px] font-extrabold uppercase tracking-[0.2em]" style={{ color: MUTED }}>
                  Sommaire du guide
                </h2>
                <span className="h-px flex-1" style={{ background: BORDER }} />
              </div>

              <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {sections.map((s, i) => {
                  const theme = SECTION_ACCENT[s.id];
                  return (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className="group flex h-full flex-col gap-2 rounded-2xl border bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_-22px_rgba(15,31,77,0.45)]"
                        style={{ borderColor: BORDER }}
                      >
                        <span
                          className="text-[22px] font-black leading-none"
                          style={{ color: theme.accent, opacity: 0.85 }}
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="text-[14px] font-extrabold leading-snug transition-colors group-hover:text-[#C0112E]" style={{ color: INK }}>
                          {s.navLabel}
                        </span>
                        <span className="text-[12px] leading-relaxed" style={{ color: INK_SOFT }}>
                          {s.navHint}
                        </span>
                        <span className="mt-auto border-t pt-2 text-[11px] font-bold" style={{ borderColor: BORDER, color: MUTED }}>
                          {s.articles.length} article{s.articles.length > 1 ? 's' : ''}
                        </span>
                      </a>
                    </li>
                  );
                })}

                <li>
                  <a
                    href="#questions-frequentes"
                    className="group flex h-full flex-col gap-2 rounded-2xl border border-dashed bg-white/60 p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-white"
                    style={{ borderColor: '#D9DEE7' }}
                  >
                    <span className="text-[22px] font-black leading-none" style={{ color: NAVY, opacity: 0.6 }}>
                      08
                    </span>
                    <span className="text-[14px] font-extrabold leading-snug transition-colors group-hover:text-[#C0112E]" style={{ color: INK }}>
                      Questions fréquentes
                    </span>
                    <span className="text-[12px] leading-relaxed" style={{ color: INK_SOFT }}>
                      Les {GUIDE_EVC_FAQ.length} questions que les candidats posent le plus souvent
                    </span>
                  </a>
                </li>
              </ol>
            </nav>

          {/* ── Blocs 3 à N — Sections ── */}
          <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_280px] lg:gap-10">
            <div className="min-w-0 space-y-14">
              {sections.map((s, i) => (
                <GuideSectionBlock key={s.id} section={s} index={i} />
              ))}

              {/* ── Questions fréquentes (schéma FAQPage) ── */}
              <section id="questions-frequentes" className="scroll-mt-28">
                  <header>
                    <p className="text-[10.5px] font-extrabold uppercase tracking-[0.2em]" style={{ color: RED }}>
                      Pour finir
                    </p>
                    <h2 className="mt-1 text-[23px] font-black leading-tight tracking-tight sm:text-[27px]" style={{ color: INK }}>
                      Questions fréquentes sur les EVC
                    </h2>
                    <p className="mt-3 max-w-3xl text-[14.5px] leading-[1.8]" style={{ color: INK_SOFT }}>
                      Les questions que les candidats nous posent le plus souvent, avec des réponses
                      courtes. Chacune est développée dans l’un des articles de ce guide.
                    </p>
                  </header>

                  {/* Même accordéon que /faq et que le bloc de la page d'accueil. */}
                  <div
                    className="mt-6 rounded-3xl border p-3 sm:p-4"
                    style={{ borderColor: '#E5E9F0', background: '#F7F8FB' }}
                  >
                    <FaqQuestionList qas={GUIDE_EVC_FAQ} idPrefix="guide-evc" />
                  </div>
              </section>
            </div>

            {/* ── Colonne de droite ── */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-4">
                <nav
                  aria-label="Navigation du guide"
                  className="rounded-3xl border bg-white p-4 shadow-[0_10px_30px_-22px_rgba(15,31,77,0.45)]"
                  style={{ borderColor: BORDER }}
                >
                  <p className="mb-2.5 text-[10px] font-extrabold uppercase tracking-[0.18em]" style={{ color: MUTED }}>
                    Les étapes
                  </p>
                  <ol className="space-y-0.5">
                    {sections.map((s, i) => {
                      const theme = SECTION_ACCENT[s.id];
                      return (
                        <li key={s.id}>
                          <a
                            href={`#${s.id}`}
                            className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[12.5px] transition-colors hover:bg-[#FAFBFE] hover:text-[#C0112E]"
                            style={{ color: INK_SOFT }}
                          >
                            <span
                              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[9px] font-black"
                              style={{ background: theme.soft, color: theme.accent }}
                            >
                              {String(i + 1).padStart(2, '0')}
                            </span>
                            {s.navLabel}
                          </a>
                        </li>
                      );
                    })}
                  </ol>
                </nav>

                {/* Encart de préparation, sans pictogramme */}
                <section
                  className="rounded-3xl border bg-white p-5 shadow-[0_10px_30px_-22px_rgba(15,31,77,0.45)]"
                  style={{ borderColor: BORDER }}
                >
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.18em]" style={{ color: RED }}>
                    Préparation Major ECN
                  </p>
                  <p className="mt-2 text-[14.5px] font-extrabold leading-snug" style={{ color: INK }}>
                    Préparez les EVC dans votre spécialité
                  </p>
                  <ul className="mt-3 space-y-1.5">
                    {[
                      'Toutes les spécialités couvertes',
                      'QCM et QROC corrigés',
                      'Dossiers cliniques et épreuves blanches',
                      'Révisions transversales',
                      'Suivi pédagogique',
                    ].map((b) => (
                      <li key={b} className="border-l-2 pl-3 text-[12.5px] leading-relaxed" style={{ borderColor: '#FACBD0', color: INK }}>
                        {b}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/plateforme"
                    className="mt-4 block rounded-xl bg-[#C0112E] px-4 py-2.5 text-center text-[13px] font-extrabold text-white shadow-sm transition-transform hover:scale-[1.01]"
                  >
                    Découvrir la plateforme
                  </Link>
                </section>

                <Link
                  href="/blog"
                  className="block rounded-2xl border bg-white px-4 py-3 text-[12.5px] font-bold transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-22px_rgba(15,31,77,0.5)]"
                  style={{ borderColor: BORDER, color: INK_SOFT }}
                >
                  Parcourir tous les articles du blog
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* ═════════════ Bloc final — Appel à l'action ═════════════ */}
      <section
        className="relative isolate overflow-hidden"
        style={{ background: `linear-gradient(120deg, ${NAVY} 0%, #5C1827 62%, ${RED} 100%)` }}
      >
        <NoiseTexture opacity={0.06} />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-[10%] -top-[40%] h-[80%] w-[45%] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(closest-side, rgba(255,255,255,0.18), transparent 70%)' }}
        />
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-18">
          <div className="max-w-3xl">
            <h2 className="text-[26px] font-black leading-tight tracking-tight text-white sm:text-[32px]">
              Préparer les EVC avec Major ECN
            </h2>
            <p className="mt-4 text-[15px] leading-[1.8] text-white/80">
              Lire ce guide vous donne la carte du parcours ; la réussite se joue ensuite sur
              l’entraînement. Major ECN prépare les médecins à diplôme étranger depuis 2011, dans
              toutes les spécialités du concours : cours conformes aux référentiels, QCM et QROC
              corrigés, dossiers cliniques, révisions transversales et épreuves blanches.
            </p>
          </div>

          <div className="mt-9 grid gap-4 sm:grid-cols-3">
            {[
              {
                href: '/espace-decouverte',
                badge: 'Gratuit',
                title: 'Tester l’espace découverte',
                text: 'QCM, dossiers cliniques et flashcards au niveau réel du concours, sans engagement.',
              },
              {
                href: '/specialites',
                title: 'Consulter les spécialités préparées',
                text: 'Le programme et les supports disponibles pour chaque spécialité des EVC.',
              },
              {
                href: '/tarifs',
                title: 'Voir les formules et les tarifs',
                text: 'Les trois formules de préparation, leur contenu et leurs conditions d’inscription.',
              },
            ].map(({ href, badge, title, text }) => (
              <Link
                key={href}
                href={href}
                className="group flex flex-col gap-2.5 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white/35 hover:bg-white/15"
              >
                {badge && (
                  <span
                    className="self-start rounded-full bg-white px-2.5 py-1 text-[9.5px] font-extrabold uppercase tracking-[0.16em]"
                    style={{ color: RED }}
                  >
                    {badge}
                  </span>
                )}
                <span className="text-[15px] font-extrabold leading-snug text-white group-hover:underline">
                  {title}
                </span>
                <span className="text-[12.5px] leading-relaxed text-white/70">{text}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

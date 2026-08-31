import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Camera, Gift, List, Quote, Sparkles } from 'lucide-react';
import { ArticleHeader, ArticleFinalCta, PrepCtaCard, ARTICLE_FONT } from '../article-shell';
import { NewsletterForm } from '../newsletter-form';
import { getPublishedArticles, type BlogArticleMeta } from '@/lib/data/blog-articles';
import { RICH_CONTENT } from '@/lib/data/blog-content';
import { clampImageWidth, defaultImageWidth, type Block } from '@/lib/data/blog-content/types';

function anchorId(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="my-5 overflow-x-auto rounded-xl border border-[#ECEEF1]">
      <table className="w-full border-collapse text-[13.5px]">
        <thead>
          <tr className="bg-[#F6F8FC]">
            {headers.map((h, i) => (
              <th key={i} className="border-b border-[#ECEEF1] px-3.5 py-2.5 text-left font-bold text-[#1A2233]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri} className={ri % 2 ? 'bg-[#FAFBFE]' : 'bg-white'}>
              {r.map((c, ci) => (
                <td key={ci} className="border-b border-[#F0F2F5] px-3.5 py-2.5 align-top text-[#3A4556]">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const CALLOUT_STYLES = {
  warning: {
    wrapper: 'border-[#FDE68A] bg-[#FFFBEB]',
    bar:     'bg-[#F59E0B]',
    icon:    '⚠',
    label:   'À retenir',
    label_c: 'text-[#92400E]',
    body_c:  'text-[#78350F]',
  },
  tip: {
    wrapper: 'border-[#BAE6FD] bg-[#F0F9FF]',
    bar:     'bg-[#0EA5E9]',
    icon:    '💡',
    label:   'Conseil Major ECN',
    label_c: 'text-[#0C4A6E]',
    body_c:  'text-[#0369A1]',
  },
  key: {
    wrapper: 'border-[#A7F3D0] bg-[#F0FDF4]',
    bar:     'bg-[#10B981]',
    icon:    '✓',
    label:   'En résumé',
    label_c: 'text-[#064E3B]',
    body_c:  'text-[#065F46]',
  },
  source: {
    wrapper: 'border-[#ECEEF1] bg-[#F6F8FC]',
    bar:     'bg-[#64748B]',
    icon:    '📌',
    label:   'Source officielle',
    label_c: 'text-[#334155]',
    body_c:  'text-[#475569]',
  },
} as const;

function BlockView({ b, publishedSlugs }: { b: Block; publishedSlugs: Set<string> }) {
  switch (b.t) {
    case 'hero':
      return null; // rendered in header rightArea
    case 'h2':
      return (
        <h2
          id={anchorId(b.text)}
          className="mt-10 mb-4 scroll-mt-24 border-l-4 border-[#E4002B] pl-3 text-[22px] font-extrabold leading-tight tracking-tight text-[#1A2233] sm:text-[26px]"
        >
          {b.text}
        </h2>
      );
    case 'h3':
      return <h3 className="mt-6 mb-2 text-[17px] font-bold leading-snug text-[#1A2233]">{b.text}</h3>;
    case 'p':
      return (
        <p
          className="mb-4 text-[15px] leading-[1.75] text-[#3A4556] [&_a]:font-semibold [&_a]:text-[#E4002B] [&_a:hover]:underline [&_strong]:font-bold [&_strong]:text-[#1A2233]"
          dangerouslySetInnerHTML={{ __html: b.html }}
        />
      );
    case 'ul':
      return (
        <ul className="mb-4 space-y-1.5 text-[15px] leading-[1.7] text-[#3A4556]">
          {b.items.map((it, i) => (
            <li key={i} className="flex gap-2.5">
              <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#E4002B]" />
              <span className="[&_strong]:font-bold [&_strong]:text-[#1A2233]" dangerouslySetInnerHTML={{ __html: it }} />
            </li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol className="mb-4 space-y-1.5 text-[15px] leading-[1.7] text-[#3A4556]">
          {b.items.map((it, i) => (
            <li key={i} className="flex gap-2.5">
              <span aria-hidden className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FDE7E9] text-[11px] font-bold text-[#C0001F]">
                {i + 1}
              </span>
              <span className="[&_strong]:font-bold [&_strong]:text-[#1A2233]" dangerouslySetInnerHTML={{ __html: it }} />
            </li>
          ))}
        </ol>
      );
    case 'img': {
      const layout = b.layout ?? 'full';
      // Largeur choisie dans l'éditeur, à défaut celle de la disposition. Elle
      // n'est appliquée qu'à partir de `sm:` : sur mobile la colonne est déjà
      // étroite, y réduire une image la rendrait illisible.
      const width = clampImageWidth(b.width ?? defaultImageWidth(layout));
      const figClass =
        layout === 'left'
          ? 'my-6 sm:float-left sm:mr-6 sm:mb-4 sm:w-(--blog-img-w)'
          : layout === 'right'
            ? 'my-6 sm:float-right sm:ml-6 sm:mb-4 sm:w-(--blog-img-w)'
            : 'my-6 clear-both sm:mx-auto sm:w-(--blog-img-w)';
      return (
        <figure
          className={figClass}
          style={{ '--blog-img-w': `${width}%` } as React.CSSProperties}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={b.src}
            alt={b.alt}
            className="block h-auto w-full rounded-xl border border-[#ECEEF1]"
            loading="lazy"
            decoding="async"
          />
          {b.caption && <figcaption className="mt-2 text-center text-[12px] text-[#9AA1AE]">{b.caption}</figcaption>}
        </figure>
      );
    }
    case 'gallery': {
      const imgs = b.images ?? [];
      if (imgs.length === 0) return null;
      const cols = imgs.length >= 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2';
      return (
        <div className={`my-6 clear-both grid grid-cols-1 gap-3 ${cols}`}>
          {imgs.map((im, i) => (
            <figure key={i} className="m-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={im.src}
                alt={im.alt}
                className="block h-full w-full rounded-xl border border-[#ECEEF1] object-cover"
                loading="lazy"
                decoding="async"
              />
              {im.caption && (
                <figcaption className="mt-1.5 text-center text-[11.5px] text-[#9AA1AE]">{im.caption}</figcaption>
              )}
            </figure>
          ))}
        </div>
      );
    }
    case 'table':
      return <Table headers={b.headers} rows={b.rows} />;
    case 'note':
      return (
        <div className="my-5 flex items-start gap-2.5 rounded-xl border border-dashed border-[#D7DCE3] bg-[#F6F8FC] p-3.5">
          <Camera className="mt-0.5 h-4 w-4 shrink-0 text-[#9AA1AE]" />
          <p className="text-[13px] italic leading-relaxed text-[#52607A]">{b.text}</p>
        </div>
      );
    case 'quote':
      return (
        <figure className="my-6 rounded-2xl border border-[#FACBD0] border-l-4 border-l-[#E4002B] bg-[#FFF7F8] p-5">
          <Quote className="h-5 w-5 text-[#E4002B]" />
          <blockquote className="mt-2 text-[15px] italic leading-relaxed text-[#3A4556]">« {b.text} »</blockquote>
          <figcaption className="mt-3 text-[13px]">
            <span className="font-bold text-[#1A2233]">{b.author}</span>
            {b.role && <span className="text-[#9AA1AE]"> — {b.role}</span>}
          </figcaption>
        </figure>
      );
    case 'callout': {
      const s = CALLOUT_STYLES[b.tone] ?? CALLOUT_STYLES.warning;
      return (
        <div className={`my-5 flex gap-3 rounded-xl border p-4 ${s.wrapper}`}>
          <div className={`mt-0.5 w-1 shrink-0 self-stretch rounded-full ${s.bar}`} />
          <div className="min-w-0">
            <p className={`mb-1 text-[11px] font-extrabold uppercase tracking-[0.14em] ${s.label_c}`}>
              {s.icon} {s.label}
            </p>
            <p
              className={`text-[14px] leading-[1.7] ${s.body_c} [&_a]:font-semibold [&_a]:underline [&_strong]:font-bold`}
              dangerouslySetInnerHTML={{ __html: b.html }}
            />
          </div>
        </div>
      );
    }
    case 'related': {
      // On masque les liens vers des articles pas encore publiés (planning
      // 3/3/1) : le maillage reste valide automatiquement, sans lien mort.
      const items = b.items.filter((it) => {
        const m = /^\/blog\/([a-z0-9-]+)$/.exec(it.href);
        return !m || publishedSlugs.has(m[1]);
      });
      if (items.length === 0) return null;
      return (
        <aside className="my-6 rounded-xl border border-[#ECEEF1] bg-[#FAFBFE] p-4">
          <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#52607A]">À lire aussi</p>
          <ul className="space-y-1.5">
            {items.map((it, i) => (
              <li key={i}>
                <Link href={it.href} className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#E4002B] hover:underline">
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0" /> {it.label}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      );
    }
    default:
      return null;
  }
}

/** Petite pub « Espace découverte gratuit » — affichée dans la colonne de droite. */
function DiscoveryAdCard() {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#FACBD0] bg-[linear-gradient(160deg,#FFF7F8_0%,#FFE9EC_100%)] p-5 shadow-sm">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E4002B] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-white">
        <Gift className="h-3 w-3" /> Gratuit
      </span>
      <h3 className="mt-3 text-[15px] font-extrabold leading-snug text-[#1A2233]">
        Testez la préparation Major ECN
      </h3>
      <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#52607A]">
        Accédez gratuitement à l&rsquo;<strong className="font-bold text-[#1A2233]">espace découverte</strong> :
        QCM, dossiers cliniques et flashcards calibrés au niveau réel des EVC, sans engagement.
      </p>
      <Link
        href="/espace-decouverte"
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#C0001F] px-4 py-2.5 text-[13px] font-extrabold text-white shadow-sm transition-transform hover:scale-[1.01]"
      >
        <Sparkles className="h-4 w-4" /> Accéder à l&rsquo;espace découverte
      </Link>
      <Link
        href="/profil-evc"
        className="mt-2 block text-center text-[12px] font-semibold text-[#E4002B] hover:underline"
      >
        Situer mon niveau avec le Profil EVC →
      </Link>
    </section>
  );
}

export function ArticleRich({
  article,
  blocks: blocksProp,
  extraPublishedSlugs,
}: {
  article: BlogArticleMeta;
  /** Blocs fournis explicitement (articles créés en base). Sinon on lit le contenu statique. */
  blocks?: Block[];
  /** Slugs supplémentaires (articles DB) considérés comme publiés pour le maillage « À lire aussi ». */
  extraPublishedSlugs?: string[];
}) {
  const blocks = blocksProp ?? RICH_CONTENT[article.slug] ?? [];
  const publishedSlugs = new Set([
    ...getPublishedArticles().map((a) => a.slug),
    ...(extraPublishedSlugs ?? []),
  ]);
  const hero = blocks.find((b): b is Extract<Block, { t: 'hero' }> => b.t === 'hero');
  const toc = blocks
    .filter((b): b is Extract<Block, { t: 'h2' }> => b.t === 'h2')
    .map((b) => ({ id: anchorId(b.text), label: b.text }));

  const heroArea = hero ? (
    <div className="relative hidden overflow-hidden rounded-2xl lg:block" style={{ aspectRatio: '4/3' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={hero.src}
        alt={hero.alt}
        className="h-full w-full object-cover"
        loading="eager"
        decoding="async"
      />
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/10" />
    </div>
  ) : undefined;

  return (
    <main className="bg-[#FAFBFE] py-8 sm:py-10 lg:py-12" style={{ fontFamily: ARTICLE_FONT }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ArticleHeader article={article} subtitle={article.excerpt} rightArea={heroArea} />

        {/* Hero visible on mobile (below header) */}
        {hero && (
          <div className="mb-6 overflow-hidden rounded-2xl lg:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hero.src}
              alt={hero.alt}
              className="h-auto w-full object-cover"
              loading="eager"
              decoding="async"
            />
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <article className="rounded-2xl border border-[#ECEEF1] bg-white p-5 sm:p-7">
            {toc.length >= 3 && (
              <nav className="mb-6 rounded-xl border border-[#ECEEF1] bg-[#FAFBFE] p-4">
                <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#52607A]">
                  <List className="h-3.5 w-3.5" /> Sommaire
                </p>
                <ol className="space-y-1">
                  {toc.map((t) => (
                    <li key={t.id}>
                      <a href={`#${t.id}`} className="text-[13.5px] text-[#3A4556] hover:text-[#E4002B] hover:underline">
                        {t.label}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            {blocks.map((b, i) => (
              <BlockView key={i} b={b} publishedSlugs={publishedSlugs} />
            ))}

            <ArticleFinalCta />
          </article>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <DiscoveryAdCard />
            <PrepCtaCard />
            <section className="rounded-2xl border border-[#FACBD0] bg-[#FFF1F3] p-5">
              <h3 className="text-[15px] font-bold text-[#1A2233]">Recevez nos meilleurs conseils EVC</h3>
              <p className="mt-1 text-[12.5px] text-[#52607A]">
                Méthode, calendrier PAE, spécialités : l&rsquo;essentiel pour réussir les EVC 2026.
              </p>
              <NewsletterForm />
            </section>
            <Link
              href="/blog"
              className="flex items-center justify-between rounded-2xl border border-[#ECEEF1] bg-white px-4 py-3 text-[13px] font-semibold text-[#1A2233] hover:border-[#E4002B] hover:text-[#E4002B]"
            >
              Tous les articles du blog <ArrowRight className="h-4 w-4" />
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}

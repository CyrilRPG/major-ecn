import { ArticleHeader, PrepCtaCard, ARTICLE_FONT } from '../article-shell';
import { NewsletterForm } from '../newsletter-form';
import type { BlogArticleMeta } from '@/lib/data/blog-articles';

export function ArticleGeneric({ article }: { article: BlogArticleMeta }) {
  return (
    <main className="bg-[#FAFBFE] py-10" style={{ fontFamily: ARTICLE_FONT }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ArticleHeader article={article} subtitle={article.excerpt} />
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-2xl border border-[#ECEEF1] bg-white p-6 text-[14px] leading-relaxed text-[#1A2233]">
            <p className="text-[#52607A]">Cet article est en cours de rédaction.</p>
          </div>
          <aside className="space-y-4">
            <PrepCtaCard />
            <section className="rounded-2xl border border-[#FACBD0] bg-[#FFF1F3] p-5">
              <h3 className="text-[15px] font-bold text-[#1A2233]">Recevez nos meilleurs conseils EVC</h3>
              <NewsletterForm />
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

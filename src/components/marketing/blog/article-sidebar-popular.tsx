import Link from 'next/link';
import { Clock } from 'lucide-react';
import { getPublishedArticles } from '@/lib/data/blog-articles';

export function ArticleSidebarPopular({ currentSlug }: { currentSlug: string }) {
  const popular = [...getPublishedArticles()]
    .filter((a) => a.popularRank != null && a.slug !== currentSlug)
    .sort((a, b) => (a.popularRank ?? 99) - (b.popularRank ?? 99))
    .slice(0, 5);
  return (
    <section className="rounded-2xl border border-[#ECEEF1] bg-white p-5 shadow-sm">
      <h3 className="text-[15px] font-bold text-[#1A2233]">Articles les plus consultés</h3>
      <ol className="mt-3 space-y-2.5">
        {popular.map((a, idx) => (
          <li key={a.slug}>
            <Link href={`/blog/${a.slug}`} className="group flex items-start gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FFE4E8] text-[11px] font-extrabold text-[#E4002B]">
                {idx + 1}
              </span>
              <div>
                <p className="text-[12.5px] font-semibold leading-snug text-[#1A2233] group-hover:text-[#E4002B]">
                  {a.title}
                </p>
                <p className="mt-0.5 inline-flex items-center gap-1 text-[10.5px] text-[#9AA1AE]">
                  <Clock className="h-2.5 w-2.5" /> {a.readingMinutes} min de lecture
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ol>
      <Link href="/blog" className="mt-3 inline-block text-[12px] font-bold text-[#E4002B] hover:underline">
        Voir tous les articles →
      </Link>
    </section>
  );
}

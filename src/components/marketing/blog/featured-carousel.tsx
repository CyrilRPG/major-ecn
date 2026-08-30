'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight, Building2, ClipboardCheck, Clock, Euro, FileText, Globe2,
  Lightbulb, Stethoscope,
} from 'lucide-react';
import {
  BLOG_CATEGORIES, BLOG_CATEGORY_IMAGE, type BlogArticleMeta, type BlogCategory,
} from '@/lib/data/blog-articles';

/**
 * Carrousel « À la une » du blog : les articles mis en avant depuis
 * /admin/blog/ordre défilent dans la grande carte d'en-tête. Les pastilles
 * (autrefois décoratives) sont désormais réelles : une par article, cliquable.
 */

const CATEGORY_ICONS: Record<BlogCategory, React.ElementType> = {
  'epreuves-evc': ClipboardCheck,
  'candidature-dossier': FileText,
  'exercice-medical': Building2,
  'carriere-remuneration': Euro,
  'medecins-etrangers': Globe2,
  'conseils-methodologie': Lightbulb,
  'specialites': Stethoscope,
};

const AUTO_ADVANCE_MS = 7000;

export function FeaturedCarousel({ articles }: { articles: BlogArticleMeta[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = articles.length;

  useEffect(() => {
    if (count <= 1 || paused) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [count, paused]);

  if (count === 0) return null;
  const article = articles[Math.min(index, count - 1)];
  const c = BLOG_CATEGORIES[article.category];
  const Icon = CATEGORY_ICONS[article.category] ?? FileText;

  return (
    <article
      className="overflow-hidden rounded-2xl border border-[#ECEEF1] bg-white shadow-sm"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="grid items-stretch gap-0 sm:grid-cols-[0.85fr_1.15fr]">
        <div className="relative aspect-[4/3] self-center overflow-hidden">
          <Image
            key={article.slug}
            src={article.image ?? BLOG_CATEGORY_IMAGE[article.category]}
            alt={article.title}
            fill
            priority={index === 0}
            className="object-cover object-center"
            sizes="(max-width:640px) 100vw, (max-width:1024px) 40vw, 360px"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 45%, rgba(15,31,77,0.20) 100%)' }}
          />
          <span
            className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.18em] backdrop-blur"
            style={{ color: c.fg, boxShadow: '0 6px 14px -8px rgba(15,31,77,0.20)' }}
          >
            <Icon className="h-3 w-3" />
            {c.label}
          </span>
        </div>
        {/* Contenu */}
        <div className="flex flex-col justify-center p-6 sm:p-7 lg:p-8">
          <span
            className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em]"
            style={{ background: c.bg, color: c.fg }}
          >
            À la une
          </span>
          <h2 className="mt-3 text-[22px] font-black leading-[1.18] tracking-tight text-[#1A2233] sm:text-[26px]">
            {article.title}
          </h2>
          <p className="mt-2.5 max-w-md text-[13.5px] leading-relaxed text-[#52607A]">
            {article.excerpt ||
              'Guide complet pour comprendre les conditions d’accès, les étapes de candidature et les erreurs à éviter.'}
          </p>
          <div className="mt-5 flex items-center justify-between gap-4">
            <span className="inline-flex items-center gap-1.5 text-[12px] text-[#9AA1AE]">
              <Clock className="h-3.5 w-3.5" />
              {article.readingMinutes} min de lecture
            </span>
            <Link
              href={`/blog/${article.slug}`}
              className="inline-flex items-center gap-1.5 text-[13px] font-extrabold text-[#E4002B] hover:underline"
            >
              Lire l&rsquo;article <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {/* Pastilles : une par article à la une. */}
          {count > 1 && (
            <div className="mt-5 flex items-center gap-1.5">
              {articles.map((a, i) => (
                <button
                  key={a.slug}
                  type="button"
                  aria-label={`Afficher « ${a.title} »`}
                  onClick={() => setIndex(i)}
                  className={
                    i === index
                      ? 'h-1.5 w-6 rounded-full bg-[#E4002B] transition-all'
                      : 'h-1.5 w-1.5 rounded-full bg-[#DDE1E7] transition-all hover:bg-[#B9C0CC]'
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

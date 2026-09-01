'use client';

import Image from 'next/image';
import Link from 'next/link';
import { BLOG_ARTICLES, type BlogArticleMeta } from '@/lib/data/blog-articles';
import {
  BORDER, Eyebrow, INK_MUTED, INK_SOFT, JAKARTA, MANROPE, NAVY, RED,
  RED_GRADIENT, Reveal, SectionTitle,
} from './home-ui';

/* ============================================================
   BLOC RESSOURCES — les articles du blog, jusqu'ici sans aucun
   lien depuis la page d'accueil.
   ============================================================ */

/** Guides mis en avant après l'article à la une : les deux voies, le
    calendrier d'inscription, le choix de spécialité et la méthode. */
const A_LA_UNE = [
  'voie-interne-evc-logique-qcm',
  'evc-voie-externe-comprendre',
  'calendrier-inscription-concours-pae-2026-cng',
  'comment-choisir-specialite-evc',
  'comment-rediger-qroc-evc',
  'evc-ratio-candidats-postes-choix-specialite-2026',
];

const parSlug = new Map(BLOG_ARTICLES.map((a) => [a.slug, a]));
const GUIDES = A_LA_UNE.map((s) => parSlug.get(s)).filter(Boolean) as BlogArticleMeta[];

const dateFr = (iso?: string) =>
  iso ? new Date(`${iso}T12:00:00Z`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : null;

/** `calendrier` : l'article « dates des épreuves par spécialité », publié
    depuis l'administration et donc chargé côté serveur par la page. */
export function HomeRessourcesSection({ calendrier }: { calendrier?: BlogArticleMeta | null }) {
  const une = calendrier ?? GUIDES[0];
  const suite = (calendrier ? GUIDES : GUIDES.slice(1)).filter((a) => a.slug !== une.slug).slice(0, 4);
  if (!une) return null;

  return (
    <section id="ressources" className="py-16 sm:py-20 lg:py-24" style={{ fontFamily: JAKARTA, background: '#FFFFFF' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <Eyebrow>Ressources EVC</Eyebrow>
          <div className="mt-5">
            <SectionTitle line1="Tout ce qu’il faut savoir" line2="avant de vous présenter aux EVC" rule />
          </div>
          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed sm:text-base" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
            Calendrier CNG, différences entre les deux voies, choix de spécialité, méthodologie du
            QROC&nbsp;: nos guides détaillés, mis à jour pour la session 2026.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          {/* Article à la une */}
          <Reveal>
            <Link
              href={`/blog/${une.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white transition-transform duration-300 hover:-translate-y-1"
              style={{ border: `1px solid ${BORDER}`, boxShadow: '0 30px 70px -55px rgba(15,27,61,0.5)' }}
            >
              {une.image && (
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <Image
                    src={une.image}
                    alt=""
                    fill
                    sizes="(max-width:1024px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col p-7">
                <p className="text-[11px] font-black uppercase tracking-[0.14em]" style={{ color: RED }}>À la une</p>
                <p className="mt-3 text-[20px] font-black leading-tight tracking-tight sm:text-[22px]" style={{ color: NAVY }}>
                  {une.title}
                </p>
                <p className="mt-3 flex-1 text-[13.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
                  {une.excerpt}
                </p>
                <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px]" style={{ color: INK_MUTED, fontFamily: MANROPE }}>
                  {dateFr(une.publishedAt)}
                  <span aria-hidden className="h-1 w-1 rounded-full" style={{ background: INK_MUTED }} />
                  {une.readingMinutes} min de lecture
                </p>
                <p className="mt-4 text-[13px] font-black tracking-tight" style={{ color: RED }}>Lire l’article →</p>
              </div>
            </Link>
          </Reveal>

          {/* Les autres guides */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {suite.map((a, i) => (
              <Reveal key={a.slug} delay={i * 0.05}>
                <Link
                  href={`/blog/${a.slug}`}
                  className="flex h-full flex-col rounded-2xl bg-white px-6 py-6 transition-transform duration-300 hover:-translate-y-1"
                  style={{ border: `1px solid ${BORDER}` }}
                >
                  <p className="text-[14.5px] font-black leading-snug tracking-tight" style={{ color: NAVY }}>{a.title}</p>
                  <span aria-hidden className="mt-3 block h-[2px] w-8 rounded-full" style={{ background: RED }} />
                  <p className="mt-3 flex-1 text-[12.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
                    {a.excerpt}
                  </p>
                  <p className="mt-4 text-[11.5px]" style={{ color: INK_MUTED, fontFamily: MANROPE }}>
                    {a.readingMinutes} min de lecture
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={0.15} className="mt-8 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center justify-center rounded-xl px-8 py-4 text-[14px] font-black tracking-tight text-white transition-transform hover:scale-[1.02]"
            style={{ background: RED_GRADIENT }}
          >
            Voir tous les articles
          </Link>
          <p className="mt-3 text-[12.5px]" style={{ color: INK_MUTED, fontFamily: MANROPE }}>
            Des guides détaillés sur les EVC et la procédure d’autorisation d’exercice.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

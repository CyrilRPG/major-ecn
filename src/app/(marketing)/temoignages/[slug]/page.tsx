/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Quote, Stethoscope, Trophy } from 'lucide-react';
import { FEATURED_TESTIMONIES } from '@/lib/data/featured-testimonies';

const RED = '#C0112E';
const RED_DEEP = '#8B0E22';
const NAVY = '#0F1F4D';
const INK_SOFT = '#52607A';
const SOFT_BG = '#FDF2F4';
const FONT = "'Plus Jakarta Sans', sans-serif";

export function generateStaticParams() {
  return FEATURED_TESTIMONIES.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = FEATURED_TESTIMONIES.find((x) => x.slug === slug);
  if (!t) return { title: 'Témoignage — Major ECN' };
  return {
    title: `${t.name} — ${t.spec} | Témoignage Major ECN`,
    description: t.quote,
    alternates: { canonical: `/temoignages/${slug}` },
  };
}

export default async function TestimonialPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = FEATURED_TESTIMONIES.find((x) => x.slug === slug);
  if (!t) notFound();

  // Trois autres témoignages, choisis à partir de la position du témoignage
  // courant : la sélection est stable d'un rendu à l'autre et couvre toute la
  // liste, sans qu'aucune page ne reste sans lien entrant.
  const index = FEATURED_TESTIMONIES.findIndex((x) => x.slug === slug);
  const others = [1, 2, 3].map(
    (offset) => FEATURED_TESTIMONIES[(index + offset) % FEATURED_TESTIMONIES.length],
  ).filter((o) => o.slug !== slug);

  return (
    <main className="bg-white py-12 sm:py-16 lg:py-20" style={{ fontFamily: FONT }}>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link href="/temoignages" className="inline-flex items-center gap-2 text-sm font-bold" style={{ color: RED }}>
          <ArrowLeft className="h-4 w-4" /> Retour aux témoignages
        </Link>

        <div className="mt-8 rounded-3xl p-6 sm:p-10"
          style={{ background: SOFT_BG, border: '1px solid #F3D9DD' }}>
          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:text-left">
            <span className="relative flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-full"
              style={{ background: `linear-gradient(135deg, ${RED_DEEP}, ${RED})` }}>
              {t.photo ? (
                <img
                  src={t.photo}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <span aria-hidden className="text-3xl font-black text-white">
                  {t.initials}
                </span>
              )}
            </span>
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-wider" style={{ color: RED }}>
                Témoignage à la une
              </p>
              <h1 className="mt-1 text-2xl font-black sm:text-3xl" style={{ color: NAVY }}>{t.name}</h1>
              <div className="mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                style={{ background: 'white', color: RED, border: '1px solid #F3D9DD' }}>
                <Trophy className="h-3 w-3" /> {t.spec}
              </div>
              <p className="mt-1 text-[12px]" style={{ color: INK_SOFT }}>{t.role}</p>
            </div>
          </div>

          <Quote className="mt-8 h-7 w-7" style={{ color: RED }} fill="currentColor" />
          <p className="mt-2 text-xl font-black leading-tight sm:text-2xl" style={{ color: NAVY }}>
            &ldquo;{t.quote}&rdquo;
          </p>

          <div className="mt-6 space-y-4">
            {t.paragraphs.map((p, i) => (
              <p key={i} className="text-[15px] leading-relaxed" style={{ color: INK_SOFT }}>
                {p}
              </p>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-2 border-t border-[#F3D9DD] pt-5 text-[12px]" style={{ color: INK_SOFT }}>
            <Stethoscope className="h-4 w-4" style={{ color: RED }} />
            Témoignage authentique recueilli auprès d&rsquo;un médecin ayant préparé les EVC avec Major ECN.
          </div>
        </div>

        {/* Maillage entre témoignages : chaque page était un cul-de-sac (aucun
            lien sortant hors « retour à la liste »), ce qui laisse ces pages
            sans profondeur pour l'exploration et affaiblit leur indexation. */}
        {others.length > 0 && (
          <section className="mt-10 border-t pt-6" style={{ borderColor: '#F3D9DD' }}>
            <h2 className="text-[11px] font-extrabold uppercase tracking-[0.18em]" style={{ color: INK_SOFT }}>
              D&rsquo;autres médecins racontent leur préparation
            </h2>
            <ul className="mt-3 grid gap-3 sm:grid-cols-3">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link
                    href={`/temoignages/${o.slug}`}
                    className="block h-full rounded-2xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-24px_rgba(15,31,77,0.5)]"
                    style={{ borderColor: '#F3D9DD' }}
                  >
                    <span className="block text-[13.5px] font-extrabold" style={{ color: NAVY }}>
                      {o.name}
                    </span>
                    <span className="mt-0.5 block text-[11.5px] font-semibold" style={{ color: RED }}>
                      {o.spec}
                    </span>
                    <span className="mt-1.5 line-clamp-3 block text-[12px] leading-relaxed" style={{ color: INK_SOFT }}>
                      {o.quote}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/tarifs"
            className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white"
            style={{ background: `linear-gradient(90deg, ${RED_DEEP}, ${RED})` }}
          >
            Découvrir nos préparations
          </Link>
          <Link
            href="/guide-evc"
            className="inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold"
            style={{ borderColor: '#F3D9DD', color: RED }}
          >
            Lire le guide complet des EVC
          </Link>
        </div>
      </div>
    </main>
  );
}

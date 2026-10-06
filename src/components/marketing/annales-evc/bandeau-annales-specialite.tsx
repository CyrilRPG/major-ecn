import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { recueilParSlug } from '@/lib/data/annales-evc';
import { INK_SOFT, JAKARTA, MANROPE, NAVY, RED, RED_DEEP } from '@/components/marketing/home/home-ui';

/** Lien des pages de préparation vers les annales EVC de la même spécialité (maillage interne). */
export function BandeauAnnalesSpecialite({ slug }: { slug: string }) {
  const r = recueilParSlug(slug);
  if (!r) return null;
  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8" style={{ fontFamily: JAKARTA }}>
      <Link
        href={`/annales-evc/${r.slug}`}
        className="group mx-auto flex max-w-5xl items-center gap-5 rounded-3xl border bg-white p-4 pr-6 shadow-[0_24px_60px_-42px_rgba(15,27,61,0.45)] transition-transform hover:-translate-y-0.5 sm:gap-7 sm:p-5 sm:pr-8"
        style={{ borderColor: 'rgba(192,17,46,0.14)' }}
      >
        <span className="block w-[64px] shrink-0 -rotate-3 overflow-hidden rounded-md shadow-[0_14px_28px_-12px_rgba(15,27,61,0.6)] sm:w-[78px]">
          <Image src={`/annales-evc/couvertures/${r.slug}.webp`} alt="" width={420} height={594} sizes="78px" className="h-auto w-full" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: RED }}>Offert</span>
          <span className="mt-1 block text-[17px] font-black leading-tight tracking-tight sm:text-[19px]" style={{ color: NAVY }}>
            Annales EVC {r.nom} : les {r.sujets} sujets officiels en PDF
          </span>
          <span className="mt-1 block text-[13px]" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
            Sessions {r.premiere === r.derniere ? r.premiere : `${r.premiere} à ${r.derniere}`}, épreuves fondamentales et pratiques, envoyées par e-mail.
          </span>
        </span>
        <ArrowRight className="hidden h-6 w-6 shrink-0 transition-transform group-hover:translate-x-1 sm:block" style={{ color: RED_DEEP }} />
      </Link>
    </section>
  );
}

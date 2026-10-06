import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Download } from 'lucide-react';
import { RECUEILS_ANNALES, TOTAL_SUJETS_ANNALES } from '@/lib/data/annales-evc';

const RED = '#C0112E';
const RED_DEEP = '#8B0E22';
const COUVERTURES = ['pediatrie', 'medecine-generale', 'anesthesie-reanimation', 'psychiatrie'];
const PREMIERE = Math.min(...RECUEILS_ANNALES.map((r) => r.premiere));
const DERNIERE = Math.max(...RECUEILS_ANNALES.map((r) => r.derniere));

/** Accueil : mise en avant des annales EVC offertes (/annales-evc). */
export function HomeAnnalesSection() {
  return (
    <section className="px-4 py-10 sm:px-6 sm:py-12 lg:px-8" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div
        className="relative mx-auto grid max-w-7xl items-center gap-8 overflow-hidden rounded-3xl px-6 py-9 text-white sm:px-10 lg:grid-cols-[1.25fr_1fr] lg:gap-6 lg:py-10"
        style={{ background: 'radial-gradient(90% 120% at 100% 0%, rgba(46,84,186,0.55) 0%, rgba(46,84,186,0) 60%), radial-gradient(60% 80% at 0% 100%, rgba(192,17,46,0.25) 0%, rgba(192,17,46,0) 60%), linear-gradient(150deg, #13286a 0%, #0f1f4d 55%, #091431 100%)' }}
      >
        <div className="relative z-10">
          <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[10.5px] font-black uppercase tracking-[0.16em]" style={{ background: '#FFC107', color: '#3A1D00' }}>
            Offert
          </span>
          <h2 className="mt-3 text-[26px] font-black leading-[1.12] tracking-tight sm:text-[34px]">
            Les annales officielles de l’EVC de votre spécialité
          </h2>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/80">
            {TOTAL_SUJETS_ANNALES.toLocaleString('fr-FR')} sujets des épreuves fondamentales et pratiques, de {PREMIERE} à {DERNIERE},
            classés par session dans un PDF par spécialité. Recevez le vôtre par e-mail.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link
              href="/annales-evc"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-[15px] font-extrabold text-white shadow-lg transition-transform hover:scale-[1.02]"
              style={{ background: `linear-gradient(90deg, ${RED_DEEP} 0%, ${RED} 100%)` }}
            >
              <Download className="h-5 w-5" /> Recevoir les annales de ma spécialité
            </Link>
            <Link href="/annales-evc" className="inline-flex items-center gap-1.5 text-[14px] font-bold text-white/85 hover:text-white">
              {RECUEILS_ANNALES.length} spécialités disponibles <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="relative hidden h-[230px] sm:block lg:h-[250px]" aria-hidden>
          {COUVERTURES.map((s, i) => (
            <div
              key={s}
              className="absolute top-2 w-[150px] overflow-hidden rounded-lg shadow-[0_22px_44px_-16px_rgba(0,0,0,0.6)] lg:w-[160px]"
              style={{ left: `${8 + i * 22}%`, transform: `rotate(${(i - 1.5) * 5}deg) translateY(${Math.abs(i - 1.5) * 8}px)`, zIndex: i === 1 || i === 2 ? 3 : 1 }}
            >
              <Image src={`/annales-evc/couvertures/${s}.webp`} alt="" width={420} height={594} className="h-auto w-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

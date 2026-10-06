import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpenCheck, CalendarRange, Images, ListChecks, Sparkles } from 'lucide-react';
import { RECUEILS_ANNALES, TOTAL_SUJETS_ANNALES } from '@/lib/data/annales-evc';
import { AnnalesForm } from './annales-form';
import { ChoisirSpecialite } from './choisir-specialite';

const RED = '#C0112E';
const RED_DEEP = '#8B0E22';
const NAVY = '#0F1F4D';
const INK_SOFT = '#52607A';
const BORDER = '#E5E9F0';

const PREMIERE = Math.min(...RECUEILS_ANNALES.map((r) => r.premiere));
const DERNIERE = Math.max(...RECUEILS_ANNALES.map((r) => r.derniere));
const VITRINE = ['pediatrie', 'medecine-generale', 'anesthesie-reanimation'];

const POINTS = [
  { Icon: CalendarRange, titre: 'Classés par session', texte: 'Du plus récent au plus ancien, avec un sommaire cliquable et des signets.' },
  { Icon: ListChecks, titre: 'Les deux épreuves', texte: 'Épreuve fondamentale et épreuve pratique de chaque session, QCM 2025 compris.' },
  { Icon: Images, titre: 'Images à leur place', texte: 'Clichés, ECG, coupes et tableaux intégrés en haute définition.' },
  { Icon: BookOpenCheck, titre: 'Sujets officiels', texte: 'Les énoncés tels qu’ils ont été posés, sans correction ni commentaire.' },
];

export function AnnalesEvcPage() {
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* ------------------------------------------------------------ héros + formulaire */}
      <section className="relative overflow-hidden bg-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[520px]"
          style={{ background: 'radial-gradient(70% 60% at 85% 0%, rgba(30,58,138,0.10) 0%, rgba(255,255,255,0) 70%), radial-gradient(50% 50% at 0% 10%, rgba(192,17,46,0.07) 0%, rgba(255,255,255,0) 70%)' }}
        />
        <div className="relative mx-auto grid max-w-7xl items-start gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1.12fr_1fr] lg:gap-14 lg:px-8 lg:py-16">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em]" style={{ background: '#FFF5F6', color: RED }}>
              <Sparkles className="h-3.5 w-3.5" /> Offert · Sujets officiels
            </span>
            <h1 className="mt-4 text-[32px] font-black leading-[1.08] tracking-tight sm:text-[42px] lg:text-[48px]" style={{ color: NAVY }}>
              Les annales de l’EVC de votre spécialité, <span style={{ color: RED }}>en un seul PDF</span>
            </h1>
            <p className="mt-4 max-w-xl text-[16px] leading-relaxed" style={{ color: INK_SOFT }}>
              Tous les sujets officiels des épreuves de vérification des connaissances depuis {PREMIERE}, classés par session,
              avec leurs images. Choisissez votre spécialité et recevez votre recueil par e-mail.
            </p>

            <dl className="mt-7 grid max-w-xl grid-cols-3 gap-3">
              {[
                [TOTAL_SUJETS_ANNALES.toLocaleString('fr-FR'), 'sujets officiels'],
                [String(RECUEILS_ANNALES.length), 'spécialités'],
                [`${PREMIERE}–${String(DERNIERE).slice(2)}`, 'sessions'],
              ].map(([v, l]) => (
                <div key={l} className="rounded-2xl border bg-white px-4 py-3.5" style={{ borderColor: BORDER }}>
                  <dt className="sr-only">{l}</dt>
                  <dd className="text-[24px] font-black leading-none sm:text-[28px]" style={{ color: NAVY }}>{v}</dd>
                  <p className="mt-1.5 text-[12px] font-semibold" style={{ color: INK_SOFT }}>{l}</p>
                </div>
              ))}
            </dl>

            {/* éventail de couvertures */}
            <div className="relative mt-10 hidden h-[300px] max-w-xl sm:block" aria-hidden>
              {VITRINE.map((s, i) => (
                <div
                  key={s}
                  className="absolute top-0 w-[190px] overflow-hidden rounded-xl shadow-[0_24px_50px_-18px_rgba(15,31,77,0.55)]"
                  style={{ left: `${i * 150}px`, transform: `rotate(${(i - 1) * 6}deg) translateY(${i === 1 ? -6 : 14}px)`, zIndex: i === 1 ? 3 : 1 }}
                >
                  <Image src={`/annales-evc/couvertures/${s}.webp`} alt="" width={420} height={594} className="h-auto w-full" />
                </div>
              ))}
            </div>
          </div>

          <div className="lg:sticky lg:top-28">
            <AnnalesForm />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ contenu du recueil */}
      <section className="border-t bg-[#F8F9FC] py-14 sm:py-16" style={{ borderColor: BORDER }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em]" style={{ color: RED }}>Le recueil</p>
          <h2 className="mt-2 max-w-2xl text-[26px] font-black leading-tight sm:text-[32px]" style={{ color: NAVY }}>
            Chaque sujet, mis en page pour être travaillé
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {POINTS.map(({ Icon, titre, texte }) => (
              <div key={titre} className="rounded-2xl border bg-white p-5" style={{ borderColor: BORDER }}>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: '#FCEAEC', color: RED }}>
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-4 text-[15.5px] font-extrabold" style={{ color: NAVY }}>{titre}</p>
                <p className="mt-1.5 text-[13.5px] leading-relaxed" style={{ color: INK_SOFT }}>{texte}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {['apercu-sommaire', 'apercu-sujet', 'apercu-image'].map((n) => (
              <div key={n} className="overflow-hidden rounded-2xl border bg-white shadow-[0_20px_50px_-30px_rgba(15,31,77,0.45)]" style={{ borderColor: BORDER }}>
                <Image src={`/annales-evc/${n}.webp`} alt="Aperçu d’une page du recueil" width={840} height={1188} className="h-auto w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ toutes les spécialités */}
      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em]" style={{ color: RED }}>{RECUEILS_ANNALES.length} spécialités</p>
          <h2 className="mt-2 text-[26px] font-black leading-tight sm:text-[32px]" style={{ color: NAVY }}>Un recueil par spécialité</h2>
          <ul className="mt-8 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {RECUEILS_ANNALES.map((r) => (
              <li key={r.slug}>
                <ChoisirSpecialite slug={r.slug}>
                  <span className="min-w-0">
                    <span className="block truncate text-[14.5px] font-bold" style={{ color: NAVY }}>{r.nom}</span>
                    <span className="block text-[12.5px]" style={{ color: INK_SOFT }}>
                      {r.sujets} sujet{r.sujets > 1 ? 's' : ''} · {r.premiere === r.derniere ? r.premiere : `${r.premiere}–${r.derniere}`}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color: RED }} />
                </ChoisirSpecialite>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------------------ préparation */}
      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div
          className="mx-auto grid max-w-7xl items-center gap-8 overflow-hidden rounded-3xl px-6 py-10 text-white sm:px-10 lg:grid-cols-[1.4fr_1fr] lg:py-12"
          style={{ background: 'radial-gradient(90% 120% at 100% 0%, rgba(46,84,186,0.55) 0%, rgba(46,84,186,0) 60%), linear-gradient(150deg, #13286a 0%, #0f1f4d 55%, #091431 100%)' }}
        >
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#FFC107]">Après les sujets</p>
            <h2 className="mt-2 text-[26px] font-black leading-tight sm:text-[32px]">Les corrigés et la méthode, sur Major ECN</h2>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/80">
              Cours structurés pour l’EVC, QCM ou QROC selon votre voie, cas cliniques, concours blancs et annales corrigées,
              avec des PH, CCA et spécialistes à vos côtés. Depuis 2011, plus de 9&nbsp;000 médecins accompagnés.
            </p>
          </div>
          <div className="flex flex-col gap-3 lg:items-end">
            <Link
              href="/espace-decouverte"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-[15px] font-extrabold text-white shadow-lg transition-transform hover:scale-[1.02]"
              style={{ background: `linear-gradient(90deg, ${RED_DEEP} 0%, ${RED} 100%)` }}
            >
              Essayer l’espace découverte gratuit <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/specialites" className="text-[14px] font-bold text-white/85 hover:text-white hover:underline">
              Voir la préparation de ma spécialité
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

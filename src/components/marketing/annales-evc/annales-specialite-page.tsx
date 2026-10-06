import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { RECUEILS_ANNALES, type RecueilAnnales } from '@/lib/data/annales-evc';
import { EPREUVE_LIBELLE, PAGE_PREPARATION, recueilsVoisins } from '@/lib/annales-evc/seo';
import { JsonLd, breadcrumbSchema, faqSchema } from '@/components/seo/json-ld';
import {
  GRAD_BLUE, INK_MUTED, INK_SOFT, JAKARTA, MANROPE, NAVY, RED, RED_DEEP, RED_GRADIENT, Reveal, SectionTitle,
} from '@/components/marketing/home/home-ui';
import { AnnalesForm } from './annales-form';
import { AnnalesFaq, type QuestionAnnales } from './annales-faq';

/* ============================================================
   /annales-evc/[spécialité] — une page par recueil, pour qu'une
   recherche « annales EVC <spécialité> » tombe sur le bon PDF.
   Contenu propre à chaque page : sessions et épreuves réellement
   présentes dans le recueil (lib/data/annales-evc.ts, généré depuis
   les PDF livrés), formulaire présélectionné.
   ============================================================ */

const BORDER = '#E6E4DF';

function questions(r: RecueilAnnales): QuestionAnnales[] {
  const periode = r.premiere === r.derniere ? `de la session ${r.premiere}` : `des sessions ${r.premiere} à ${r.derniere}`;
  const epreuves = [r.qcm && 'l’épreuve fondamentale en QCM', r.fondamentale && 'l’épreuve fondamentale', r.pratique && 'l’épreuve pratique']
    .filter(Boolean).join(', ');
  return [
    {
      q: `Que contient le recueil d’annales EVC ${r.nom} ?`,
      r: `${r.sujets} sujets officiels ${periode}, soit ${r.pages} pages : ${epreuves}, avec leurs images et tableaux. Les sujets sont classés de la session la plus récente à la plus ancienne.`,
    },
    {
      q: `Les annales EVC ${r.nom} sont-elles gratuites ?`,
      r: 'Oui. Le recueil est envoyé par e-mail, sans frais. Le lien de téléchargement reste valable deux ans.',
    },
    {
      q: `Où trouver les corrigés des annales EVC ${r.nom} ?`,
      r: `Le recueil contient les sujets officiels seuls. Les corrections des annales EVC ${r.nom} sont disponibles sur la plateforme Major ECN.`,
    },
  ];
}

export function AnnalesSpecialitePage({ recueil: r }: { recueil: RecueilAnnales }) {
  const prep = PAGE_PREPARATION[r.slug];
  const faq = questions(r);
  const voisins = recueilsVoisins(r.slug);
  const unique = r.premiere === r.derniere;

  return (
    <div style={{ fontFamily: JAKARTA }}>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'Accueil', path: '/' },
            { name: 'Annales EVC', path: '/annales-evc' },
            { name: r.nom, path: `/annales-evc/${r.slug}` },
          ]),
          faqSchema(faq.map((f) => ({ q: f.q, a: f.r }))),
        ]}
      />

      {/* ============ HÉROS ============ */}
      <section className="relative isolate overflow-hidden bg-white pb-12 pt-6 sm:pt-8 lg:pb-16">
        <div aria-hidden className="pointer-events-none absolute -left-40 -top-40 -z-10 h-[600px] w-[600px] rounded-full bg-[#B11226]/6 blur-3xl" />
        <div className="mx-auto w-full max-w-[88rem] px-4 sm:px-6 lg:px-8">
          <nav aria-label="Fil d’Ariane" className="flex flex-wrap items-center gap-1 text-[12.5px] font-semibold" style={{ color: INK_MUTED, fontFamily: MANROPE }}>
            <Link href="/" className="hover:underline">Accueil</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/annales-evc" className="hover:underline">Annales EVC</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span style={{ color: NAVY }}>{r.nom}</span>
          </nav>

          <div className="mt-6 grid grid-cols-1 items-start gap-x-14 gap-y-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <div className="lg:col-start-1 lg:row-start-1">
              <h1 className="text-[2.1rem] font-black leading-[1.05] tracking-tight sm:text-[2.7rem] lg:text-[3.1rem]" style={{ letterSpacing: '-0.03em' }}>
                <span className="block" style={{ color: NAVY }}>Annales EVC {r.nom}</span>
                <span className="mt-1 block" style={{ color: RED_DEEP }}>
                  {unique ? `La session ${r.premiere}, en un PDF.` : `Les sujets ${r.premiere} à ${r.derniere}, en un PDF.`}
                </span>
              </h1>
              <span aria-hidden className="mt-6 block h-1 w-16 rounded-full" style={{ background: RED }} />
              <p className="mt-5 text-[1.02rem] font-black leading-snug tracking-tight sm:text-[1.12rem]" style={{ color: NAVY }}>
                <span style={{ color: RED }}>{r.sujets}</span> sujets officiels · <span style={{ color: RED }}>{r.sessions}</span> session{r.sessions > 1 ? 's' : ''} ·{' '}
                <span style={{ color: RED }}>{r.pages}</span> pages
              </p>
            </div>

            <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:sticky lg:top-24">
              <AnnalesForm defaut={r.slug} />
            </div>

            <div className="lg:col-start-1 lg:row-start-2">
              <div className="rounded-2xl px-5 py-4 sm:px-6" style={{ background: '#FDF1F3' }}>
                <p className="text-[14px] leading-relaxed sm:text-[14.5px]" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
                  Tous les sujets des épreuves de vérification des connaissances de{' '}
                  <strong style={{ color: NAVY }}>{r.nom}</strong> publiés par le CNG
                  {unique ? ` pour la session ${r.premiere}` : `, de ${r.premiere} à ${r.derniere}`}, réunis par l’équipe pédagogique
                  Major ECN : énoncés d’origine, images et tableaux à leur place, sommaire cliquable.
                </p>
              </div>

              <div className="mt-8 flex items-end gap-6">
                <div className="w-[150px] shrink-0 -rotate-3 overflow-hidden rounded-xl shadow-[0_34px_70px_-26px_rgba(15,27,61,0.6)] ring-1 ring-black/5 sm:w-[180px]">
                  <Image src={`/annales-evc/couvertures/${r.slug}.webp`} alt={`Couverture du recueil d’annales EVC ${r.nom}`} width={420} height={594} sizes="180px" className="h-auto w-full" priority />
                </div>
                <ul className="space-y-2 pb-2 text-[13.5px]" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
                  {[r.qcm && EPREUVE_LIBELLE.QCM, r.fondamentale && 'Épreuves fondamentales', r.pratique && 'Épreuves pratiques', 'Texte d’origine des sujets']
                    .filter(Boolean)
                    .map((t) => (
                      <li key={String(t)} className="flex items-center gap-2">
                        <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: RED }} />
                        {t}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ SESSION PAR SESSION ============ */}
      <section className="py-14 sm:py-18 lg:py-20" style={{ background: 'linear-gradient(180deg, #FBFAFB 0%, #FFFFFF 100%)' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionTitle line1={`Le recueil ${r.nom},`} line2="session par session." gradient={GRAD_BLUE} />
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
              Les épreuves réunies dans le PDF, de la plus récente à la plus ancienne.
              {r.premiere <= 2021 && r.derniere >= 2023 && ' Il n’y a pas eu de session en 2022.'}
            </p>
          </Reveal>
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {r.detail.map(([annee, eps]) => (
              <li key={annee} className="rounded-2xl border bg-white p-4 shadow-[0_18px_40px_-34px_rgba(15,27,61,0.4)]" style={{ borderColor: BORDER }}>
                <p className="text-[22px] font-black leading-none tracking-tight" style={{ color: NAVY }}>{annee}</p>
                <ul className="mt-3 space-y-1.5">
                  {eps.map((e) => (
                    <li key={e} className="text-[12.5px] font-bold leading-snug" style={{ color: e === 'CP' ? RED_DEEP : INK_SOFT, fontFamily: MANROPE }}>
                      {EPREUVE_LIBELLE[e]}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ MAJOR ECN ============ */}
      <section className="px-4 py-6 sm:px-6 lg:px-8">
        <Reveal>
          <div
            className="relative mx-auto grid max-w-7xl items-center gap-8 overflow-hidden rounded-3xl px-6 py-10 text-white sm:px-10 lg:grid-cols-[1.4fr_1fr] lg:py-12"
            style={{ background: 'radial-gradient(90% 130% at 100% 0%, rgba(192,17,46,0.45) 0%, rgba(192,17,46,0) 55%), linear-gradient(150deg, #1B2D5E 0%, #14254E 55%, #0C1733 100%)' }}
          >
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#FFC107]" style={{ fontFamily: MANROPE }}>
                Corrections disponibles
              </p>
              <h2 className="mt-3 text-[1.6rem] font-black leading-[1.12] tracking-tight sm:text-[2.1rem]" style={{ letterSpacing: '-0.02em' }}>
                {`Les corrections des annales ${r.nom} sont disponibles sur Major ECN.`}
              </h2>
              <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed text-white/80" style={{ fontFamily: MANROPE }}>
                Cours structurés pour l’EVC, entraînements au format de votre voie, cas cliniques et concours blancs. Depuis 2011, plus de 9 000 médecins accompagnés.
              </p>
            </div>
            <div className="flex flex-col gap-3 lg:items-end">
              <Link
                href="/espace-decouverte"
                className="group inline-flex items-center justify-center gap-3 rounded-xl px-6 py-4 text-[14.5px] font-black tracking-tight text-white shadow-[0_16px_40px_-14px_rgba(192,17,46,0.75)] transition-transform hover:scale-[1.02]"
                style={{ background: RED_GRADIENT }}
              >
                Accéder à l’espace découverte gratuit
                <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
              </Link>
              {prep && (
                <Link href={prep} className="text-[14px] font-bold text-white/80 underline-offset-4 hover:text-white hover:underline">
                  La préparation EVC en {r.nom}
                </Link>
              )}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ============ QUESTIONS ============ */}
      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:px-8">
          <Reveal>
            <SectionTitle line1="Vos questions" line2={`sur les annales ${r.nom}`} />
          </Reveal>
          <Reveal delay={0.08}>
            <AnnalesFaq questions={faq} />
          </Reveal>
        </div>
      </section>

      {/* ============ AUTRES SPÉCIALITÉS ============ */}
      <section className="border-t bg-[#FBFAFB] py-12" style={{ borderColor: BORDER }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-[18px] font-black tracking-tight" style={{ color: NAVY }}>Les annales EVC des autres spécialités</h2>
          <ul className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {voisins.map((v) => (
              <li key={v.slug}>
                <Link
                  href={`/annales-evc/${v.slug}`}
                  className="group flex items-center justify-between gap-3 rounded-2xl border bg-white px-4 py-3 transition-colors hover:border-[#C0112E]/35"
                  style={{ borderColor: BORDER }}
                >
                  <span className="text-[14px] font-bold" style={{ color: NAVY }}>Annales EVC {v.nom}</span>
                  <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color: RED }} />
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/annales-evc#specialites" className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-black" style={{ color: RED }}>
            Les {RECUEILS_ANNALES.length} recueils <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

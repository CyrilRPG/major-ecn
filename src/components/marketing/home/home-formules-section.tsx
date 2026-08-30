'use client';

import Link from 'next/link';
import {
  ArrowRight, CheckCircle2, ClipboardCheck, GraduationCap, Headphones, Info,
  Laptop, LockKeyhole, MessagesSquare, Monitor, PenLine, Phone, Play, Radio,
  ShieldCheck, Sparkles, Star, Target, Trophy, Users,
} from 'lucide-react';
import { APPROFONDI_MIN_EUROS_FR } from '@/lib/stripe/approfondi';
import {
  BORDER, Eyebrow, GRAD_ROSE, INK_SOFT, JAKARTA, MANROPE, NAVY, Reveal,
  SectionTitle,
} from './home-ui';

/* ============================================================
   BLOC 7 — TROIS FORMULES, UN MÊME OBJECTIF : VOTRE RÉUSSITE
   Palette alignée sur la page Tarifs :
     Essentielle → vert  (#2E7D32), Intensive → rouge (#C0112E),
     Approfondie → violet (#7C3AED, formule mise en avant).
   ============================================================ */
const GREEN = '#2E7D32';
const GREEN_DEEP = '#1B5E20';
const GREEN_SOFT = '#E8F5E9';
const RED = '#C0112E';
const RED_DEEP = '#8B0E22';
const RED_SOFT = '#FDE8EC';
const PURPLE = '#7C3AED';
const PURPLE_DEEP = '#5B21B6';
const PURPLE_SOFT = '#EDE9FE';

const GREEN_GRADIENT = `linear-gradient(90deg, ${GREEN_DEEP} 0%, ${GREEN} 100%)`;
const RED_GRADIENT = `linear-gradient(90deg, ${RED_DEEP} 0%, ${RED} 100%)`;
const PURPLE_GRADIENT = `linear-gradient(90deg, ${PURPLE_DEEP} 0%, ${PURPLE} 100%)`;

const ESSENTIELLE_DEUX_VOIES = [
  'Fiches et supports de cours',
  'Cas cliniques et dossiers',
  'Annales EVC corrigées',
  'Flashcards',
  'Révisions régulières',
  'Suivi de progression',
  'Réponses à vos questions par email pendant votre préparation',
];

const INTENSIVE_ITEMS = [
  { t: 'Séances en direct avec nos médecins spécialistes', Icon: Radio },
  { t: 'Replays accessibles pendant toute la préparation', Icon: Play },
  { t: 'Révisions ciblées sur les notions essentielles', Icon: Target },
  { t: 'Entraînements QCM ou QROC', Icon: ClipboardCheck },
  { t: 'Corrections détaillées et méthodologie', Icon: PenLine },
  { t: 'Concours blancs', Icon: Trophy },
  { t: 'Échanges avec les enseignants', Icon: MessagesSquare },
];

const APPROFONDIE_ITEMS = [
  'Reprise approfondie des connaissances et thématiques de votre spécialité',
  'Nombreux dossiers et cas cliniques travaillés avec les enseignants',
  'Entraînements intensifs QCM ou QROC selon votre voie',
  'Corrections et explications approfondies',
  'Méthodologie avancée des EVC',
  'Interrogations et concours blancs',
  'Identification et reprise des points faibles',
  'Accompagnement renforcé tout au long de votre préparation',
];

const TOUTES_FORMULES = [
  { Icon: Laptop, strong: 'Plateforme complète', rest: 'Accessible pendant toute la période de préparation' },
  { Icon: Target, strong: 'Méthode adaptée', rest: 'À la voie interne (QCM) ou externe (QROC)' },
  { Icon: Users, strong: 'Encadrement par des médecins spécialistes', rest: 'qui connaissent les EVC et vos spécialités' },
  { Icon: ShieldCheck, strong: 'Paiement 100 % sécurisé', rest: 'en plusieurs fois sans frais' },
  { Icon: Headphones, strong: 'Accompagnement', rest: 'selon les modalités de la formule choisie' },
];

/** Chip numéroté et dégradé du haut de chaque carte. */
function FormuleBadge({ n, gradient }: { n: number; gradient: string }) {
  return (
    <span
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-[16px] font-black text-white shadow-md"
      style={{ background: gradient }}
    >
      {n}
    </span>
  );
}

export function FormulesSection() {
  return (
    <section
      id="formules"
      className="relative overflow-hidden py-16 sm:py-20 lg:py-24"
      style={{
        fontFamily: JAKARTA,
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFBFF 35%, #FFF8F9 70%, #FFFFFF 100%)',
      }}
    >
      <div aria-hidden className="pointer-events-none absolute -left-44 top-32 -z-10 h-[560px] w-[560px] rounded-full bg-[#2E7D32]/6 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-44 bottom-24 -z-10 h-[560px] w-[560px] rounded-full bg-[#7C3AED]/7 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <Eyebrow icon={<GraduationCap className="h-3.5 w-3.5" />}>Formules de préparation</Eyebrow>
          <div className="mt-5">
            <SectionTitle line1="Trois formules, un même objectif :" line2="votre réussite" gradient={GRAD_ROSE} />
          </div>
          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed sm:text-base" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
            Choisissez le niveau d&rsquo;accompagnement qui correspond à vos besoins et à votre emploi du temps.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[12.5px] font-extrabold shadow-sm" style={{ borderColor: 'rgba(192,17,46,0.3)', color: RED, background: 'white' }}>
              <ClipboardCheck className="h-4 w-4" /> Voie interne (QCM)
            </span>
            <span aria-hidden className="text-lg font-black" style={{ color: '#CBD2DE' }}>|</span>
            <span className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[12.5px] font-extrabold shadow-sm" style={{ borderColor: 'rgba(37,99,235,0.3)', color: '#1D4ED8', background: 'white' }}>
              <PenLine className="h-4 w-4" /> Voie externe (QROC)
            </span>
          </div>
        </Reveal>

        <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-2 xl:grid-cols-[1fr_1fr_1.14fr_0.72fr]">
          {/* ---------- 1. ESSENTIELLE (vert) ---------- */}
          <Reveal className="h-full">
            <article
              className="flex h-full flex-col overflow-hidden rounded-3xl border bg-white shadow-[0_30px_70px_-45px_rgba(27,94,32,0.45)] transition-transform duration-300 hover:-translate-y-1"
              style={{ borderColor: 'rgba(46,125,50,0.22)' }}
            >
              <span aria-hidden className="block h-1.5 w-full" style={{ background: GREEN_GRADIENT }} />
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-start gap-3.5">
                  <FormuleBadge n={1} gradient={GREEN_GRADIENT} />
                  <div>
                    <p className="text-xl font-black tracking-tight" style={{ color: GREEN }}>Essentielle</p>
                    <p className="mt-1 text-[12.5px] leading-snug" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
                      Pour travailler principalement en autonomie avec une préparation complète et structurée.
                    </p>
                  </div>
                </div>

                <p className="mt-5 flex items-baseline gap-1.5">
                  <span className="text-[2.6rem] font-black leading-none tracking-tight" style={{ color: GREEN_DEEP }}>495&nbsp;€</span>
                  <span className="text-[12px] font-extrabold" style={{ color: INK_SOFT }}>TTC</span>
                </p>

                <div className="mt-4 flex items-start gap-3 rounded-2xl px-4 py-3.5" style={{ background: GREEN_SOFT }}>
                  <Monitor className="mt-0.5 h-5 w-5 shrink-0" style={{ color: GREEN }} />
                  <p className="text-[12px] leading-snug" style={{ color: NAVY, fontFamily: MANROPE }}>
                    <span className="font-black" style={{ fontFamily: JAKARTA, color: GREEN_DEEP }}>Une plateforme complète</span>
                    <br />
                    Accédez à tous les outils et contenus pour préparer efficacement les EVC.
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border p-3.5" style={{ borderColor: 'rgba(46,125,50,0.25)', background: '#F6FBF7' }}>
                    <p className="text-[11px] font-black tracking-tight" style={{ color: GREEN }}>Voie interne (QCM)</p>
                    <ul className="mt-2 space-y-2">
                      {['Banque complète de QCM corrigés', 'Méthodologie QCM et pièges'].map((x) => (
                        <li key={x} className="flex items-start gap-1.5 text-[11.5px] font-semibold leading-snug" style={{ color: NAVY, fontFamily: MANROPE }}>
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: GREEN }} /> {x}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-2xl border p-3.5" style={{ borderColor: 'rgba(29,78,216,0.25)', background: '#F5F8FE' }}>
                    <p className="text-[11px] font-black tracking-tight" style={{ color: '#1D4ED8' }}>Voie externe (QROC)</p>
                    <ul className="mt-2 space-y-2">
                      {['Banque complète de QROC corrigés', 'Méthodologie QROC : mots-clés, structuration de la réponse et PMZ'].map((x) => (
                        <li key={x} className="flex items-start gap-1.5 text-[11.5px] font-semibold leading-snug" style={{ color: NAVY, fontFamily: MANROPE }}>
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: '#1D4ED8' }} /> {x}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <p className="mt-4 flex items-center gap-3 text-center text-[11.5px] font-black tracking-wide" style={{ color: GREEN_DEEP }}>
                  <span aria-hidden className="h-px flex-1" style={{ background: 'rgba(46,125,50,0.25)' }} />
                  Dans les deux voies
                  <span aria-hidden className="h-px flex-1" style={{ background: 'rgba(46,125,50,0.25)' }} />
                </p>
                <ul className="mt-3 grid flex-1 grid-cols-1 gap-y-2">
                  {ESSENTIELLE_DEUX_VOIES.map((x) => (
                    <li key={x} className="flex items-start gap-2 text-[12.5px] font-semibold leading-snug" style={{ color: NAVY, fontFamily: MANROPE }}>
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: GREEN }} /> {x}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/formules/essentielle"
                  className="group mt-6 inline-flex items-center justify-center gap-2.5 rounded-xl px-6 py-3.5 text-[13.5px] font-black tracking-tight text-white shadow-[0_14px_36px_-14px_rgba(27,94,32,0.65)] transition-transform hover:scale-[1.02]"
                  style={{ background: GREEN_GRADIENT }}
                >
                  Choisir Essentielle
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </article>
          </Reveal>

          {/* ---------- 2. INTENSIVE (rouge) ---------- */}
          <Reveal delay={0.08} className="h-full">
            <article
              className="flex h-full flex-col overflow-hidden rounded-3xl border bg-white shadow-[0_30px_70px_-45px_rgba(139,14,34,0.45)] transition-transform duration-300 hover:-translate-y-1"
              style={{ borderColor: 'rgba(192,17,46,0.22)' }}
            >
              <span aria-hidden className="block h-1.5 w-full" style={{ background: RED_GRADIENT }} />
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-start gap-3.5">
                  <FormuleBadge n={2} gradient={RED_GRADIENT} />
                  <div>
                    <p className="text-xl font-black tracking-tight" style={{ color: RED }}>Intensive</p>
                    <p className="mt-1 text-[12.5px] leading-snug" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
                      Pour intensifier vos révisions avec 18&nbsp;h de cours et l&rsquo;accompagnement de nos enseignants.
                    </p>
                  </div>
                </div>

                <p className="mt-5 flex items-baseline gap-1.5">
                  <span className="text-[2.6rem] font-black leading-none tracking-tight" style={{ color: RED_DEEP }}>995&nbsp;€</span>
                  <span className="text-[12px] font-extrabold" style={{ color: INK_SOFT }}>TTC</span>
                </p>

                <div className="mt-4 flex items-start gap-3 rounded-2xl px-4 py-4 text-white shadow-md" style={{ background: 'linear-gradient(120deg, #6B0A1C 0%, #8B0E22 45%, #C0112E 100%)' }}>
                  <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                    <Radio className="h-5 w-5" style={{ color: '#FFD2DA' }} />
                  </span>
                  <p className="text-[12px] leading-snug" style={{ fontFamily: MANROPE }}>
                    <span className="font-black" style={{ fontFamily: JAKARTA }}>18 h de cours en direct + replays</span>
                    <br />
                    <span className="text-white/85">Un véritable programme de révision avec nos médecins spécialistes.</span>
                  </p>
                </div>

                <ul className="mt-5 flex-1 space-y-3">
                  {INTENSIVE_ITEMS.map((it) => (
                    <li key={it.t} className="flex items-center gap-3 border-b pb-3 last:border-b-0 last:pb-0" style={{ borderColor: RED_SOFT }}>
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white" style={{ background: RED }}>
                        <CheckCircle2 className="h-4 w-4" />
                      </span>
                      <span className="flex-1 text-[12.5px] font-semibold leading-snug" style={{ color: NAVY, fontFamily: MANROPE }}>{it.t}</span>
                      <it.Icon className="h-4.5 w-4.5 shrink-0 opacity-70" style={{ color: RED }} />
                    </li>
                  ))}
                </ul>

                <Link
                  href="/formules/intensive"
                  className="group mt-6 inline-flex items-center justify-center gap-2.5 rounded-xl px-6 py-3.5 text-[13.5px] font-black tracking-tight text-white shadow-[0_14px_36px_-14px_rgba(139,14,34,0.7)] transition-transform hover:scale-[1.02]"
                  style={{ background: RED_GRADIENT }}
                >
                  Choisir Intensive
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </article>
          </Reveal>

          {/* ---------- 3. APPROFONDIE (violet, mise en avant) ---------- */}
          <Reveal delay={0.14} className="h-full">
            <article
              className="relative flex h-full flex-col overflow-hidden rounded-3xl border-2 bg-white shadow-[0_44px_100px_-40px_rgba(91,33,182,0.55)] transition-transform duration-300 hover:-translate-y-1"
              style={{ borderColor: 'rgba(124,58,237,0.45)' }}
            >
              <p
                className="flex items-center justify-center gap-2 px-4 py-3 text-center text-[11px] font-black tracking-[0.08em] text-white"
                style={{ background: 'linear-gradient(100deg, #4C1D95 0%, #7C3AED 60%, #A855F7 100%)' }}
              >
                <Star className="h-3.5 w-3.5" fill="currentColor" />
                Notre niveau de préparation le plus complet et le plus exigeant
              </p>
              <div className="flex flex-1 flex-col p-6" style={{ background: 'linear-gradient(180deg, #FBFAFF 0%, #FFFFFF 30%)' }}>
                <div className="flex items-start gap-3.5">
                  <FormuleBadge n={3} gradient={PURPLE_GRADIENT} />
                  <div>
                    <p className="text-xl font-black tracking-tight" style={{ color: PURPLE_DEEP }}>Approfondie</p>
                    <p className="mt-1 text-[12.5px] leading-snug" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
                      Pour bénéficier de notre accompagnement pédagogique le plus complet, construit selon votre spécialité.
                    </p>
                  </div>
                </div>

                <p className="mt-5 leading-none">
                  <span className="block text-[11px] font-black tracking-wide" style={{ color: INK_SOFT }}>À partir de</span>
                  <span className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-[2.8rem] font-black tracking-tight" style={{ color: PURPLE_DEEP }}>{APPROFONDI_MIN_EUROS_FR}&nbsp;€</span>
                    <span className="text-[12px] font-extrabold" style={{ color: INK_SOFT }}>TTC</span>
                  </span>
                </p>

                <div className="mt-4 rounded-2xl px-4 py-4" style={{ background: PURPLE_SOFT, border: '1px solid rgba(124,58,237,0.2)' }}>
                  <p className="text-center text-[11.5px] font-black leading-snug tracking-tight" style={{ color: NAVY }}>
                    Un programme <span style={{ color: PURPLE }}>d&rsquo;enseignement approfondi</span>,
                    construit selon votre spécialité
                  </p>
                  <div className="mt-3 flex items-center justify-center gap-2">
                    {[
                      { Icon: Radio, label: 'Cours live' },
                      { Icon: Play, label: 'Replays' },
                      { Icon: Headphones, label: 'Accompagnement renforcé' },
                    ].map((x, i) => (
                      <span key={x.label} className="flex items-center gap-2">
                        {i > 0 && <span className="text-sm font-black" style={{ color: PURPLE }}>+</span>}
                        <span className="flex flex-col items-center gap-1">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl border bg-white shadow-sm" style={{ borderColor: 'rgba(124,58,237,0.3)', color: PURPLE }}>
                            <x.Icon className="h-4.5 w-4.5" />
                          </span>
                          <span className="text-[8.5px] font-black tracking-tight" style={{ color: PURPLE_DEEP }}>{x.label}</span>
                        </span>
                      </span>
                    ))}
                  </div>
                </div>

                <ul className="mt-5 flex-1 space-y-2.5">
                  {APPROFONDIE_ITEMS.map((x) => (
                    <li key={x} className="flex items-start gap-2.5 text-[12.5px] font-semibold leading-snug" style={{ color: NAVY, fontFamily: MANROPE }}>
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: PURPLE }} /> {x}
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex items-start gap-2.5 rounded-2xl border px-4 py-3" style={{ borderColor: 'rgba(124,58,237,0.22)', background: '#FBFAFF' }}>
                  <Info className="mt-0.5 h-4 w-4 shrink-0" style={{ color: PURPLE }} />
                  <p className="text-[11.5px] leading-snug" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
                    Volume d&rsquo;enseignement adapté à la spécialité et au programme&nbsp;: de 36&nbsp;h à près de 100&nbsp;h pour certaines préparations.
                  </p>
                </div>

                <Link
                  href="/formules/programme-approfondi"
                  className="group mt-6 inline-flex items-center justify-center gap-2.5 rounded-xl px-6 py-4 text-[13.5px] font-black tracking-tight text-white shadow-[0_18px_44px_-14px_rgba(91,33,182,0.7)] transition-transform hover:scale-[1.02]"
                  style={{ background: PURPLE_GRADIENT }}
                >
                  Choisir Approfondie
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </article>
          </Reveal>

          {/* ---------- Colonne « Dans toutes les formules » ---------- */}
          <Reveal delay={0.2} className="h-full">
            <aside className="flex h-full flex-col rounded-3xl border bg-white/80 p-5 backdrop-blur-sm sm:p-6" style={{ borderColor: BORDER }}>
              <p className="flex items-center justify-center gap-2 text-center text-[13px] font-black tracking-tight" style={{ color: NAVY }}>
                <Sparkles className="h-4 w-4" style={{ color: RED }} />
                Dans toutes les formules
              </p>
              <ul className="mt-5 flex-1 space-y-5">
                {TOUTES_FORMULES.map((f) => (
                  <li key={f.strong} className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: '#FCEAEC', color: RED }}>
                      <f.Icon className="h-4.5 w-4.5" strokeWidth={1.9} />
                    </span>
                    <p className="text-[12px] leading-snug" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
                      <span className="block text-[12.5px] font-extrabold" style={{ color: NAVY }}>{f.strong}</span>
                      {f.rest}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="mt-5 rounded-2xl px-4 py-4" style={{ background: '#FDF1F3', border: '1px solid rgba(192,17,46,0.12)' }}>
                <Trophy className="h-5 w-5" style={{ color: RED }} />
                <p className="mt-2 text-[12px] leading-relaxed" style={{ color: NAVY, fontFamily: MANROPE }}>
                  Une préparation exigeante, des ressources ciblées et un accompagnement humain pour vous permettre de mettre{' '}
                  <span className="font-extrabold" style={{ color: RED }}>toutes les chances de votre côté.</span>
                </p>
              </div>
            </aside>
          </Reveal>
        </div>

        {/* Bandeau conseil + paiement */}
        <Reveal delay={0.12} className="mt-10">
          <div className="flex flex-col gap-6 rounded-3xl border bg-white px-6 py-6 shadow-[0_24px_60px_-45px_rgba(15,27,61,0.35)] sm:px-8 lg:flex-row lg:items-center lg:justify-between" style={{ borderColor: BORDER }}>
            <div className="flex items-start gap-4">
              <span className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full p-3" style={{ background: '#FCEAEC', color: RED }}>
                <Users className="h-6 w-6" />
              </span>
              <div>
                <p className="text-[15px] font-black tracking-tight" style={{ color: NAVY }}>
                  Besoin d&rsquo;un conseil personnalisé&nbsp;?
                </p>
                <p className="mt-1 max-w-md text-[13px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
                  Contactez-nous, nous vous aidons à choisir la formule la plus adaptée à votre situation et à vos objectifs.
                </p>
              </div>
            </div>
            <Link
              href="/contact"
              className="group inline-flex shrink-0 items-center justify-center gap-3 rounded-xl px-7 py-4 text-[13.5px] font-black tracking-tight text-white shadow-[0_16px_40px_-14px_rgba(192,17,46,0.65)] transition-transform hover:scale-[1.02]"
              style={{ background: RED_GRADIENT }}
            >
              <Phone className="h-4.5 w-4.5" />
              Nous contacter
              <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
            </Link>
            <div className="flex flex-col gap-3 lg:items-end">
              <p className="flex items-center gap-2.5 text-[13px] font-black tracking-tight" style={{ color: NAVY }}>
                <LockKeyhole className="h-5 w-5" style={{ color: RED }} />
                Paiement 100 % sécurisé
              </p>
              <p className="text-[12px]" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
                Paiement en plusieurs fois sans frais.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {['VISA', 'Mastercard', 'AMEX', 'Apple Pay'].map((b) => (
                  <span key={b} className="rounded-lg border bg-white px-3 py-1.5 text-[11px] font-black tracking-tight" style={{ borderColor: BORDER, color: NAVY }}>
                    {b}
                  </span>
                ))}
                <span className="rounded-lg border px-3 py-1.5 text-center text-[10px] font-black leading-tight" style={{ borderColor: 'rgba(192,17,46,0.3)', color: RED, background: '#FFF6F7' }}>
                  4x<br /><span className="font-bold">sans frais</span>
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

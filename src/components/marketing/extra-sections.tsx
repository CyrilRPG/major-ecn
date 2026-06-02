/* eslint-disable @next/next/no-img-element */
/**
 * Sections additionnelles inspirées de la maquette designer (HeroIconic).
 * Reprennent le code couleur Manus (bordeaux + cream) déjà en place, restent
 * cohérentes avec les composants existants dans manus-sections.tsx.
 */
import {
  Activity, ArrowRight, Award, Baby, BookOpen, BrainCircuit, Calendar, CalendarClock, Check,
  CheckCircle2, ClipboardCheck, Clock, FileText, GraduationCap, Heart,
  LineChart, Microscope, Pill, Quote, Scissors, ShieldCheck, Sparkles, Smile, Stethoscope,
  Target, TrendingUp, Trophy, UserCheck, Users, Video,
} from 'lucide-react';
import Link from 'next/link';
import { Reveal } from './reveal';
import { InscriptionForm } from './inscription-form';

const BORDEAUX = '#6B1A2A';
const BORDEAUX_DEEP = '#4D121E';

/* ============================================================
   1. PreparationProcessSection — « Comment nous préparons les candidats »
   ============================================================ */
const PROCESS_STEPS = [
  {
    n: '01',
    Icon: BookOpen,
    title: 'Structuration de la préparation',
    desc: 'Plan personnalisé par spécialité, avec jalons et bilans intermédiaires.',
  },
  {
    n: '02',
    Icon: Target,
    title: 'Méthodologie EVC',
    desc: 'Apprentissage du raisonnement clinique et des attentes du jury.',
  },
  {
    n: '03',
    Icon: ClipboardCheck,
    title: 'Entraînements ciblés',
    desc: 'Sessions QCM ciblées sur vos lacunes, générées automatiquement.',
  },
  {
    n: '04',
    Icon: FileText,
    title: 'Annales & cas cliniques',
    desc: 'Annales corrigées de 2018 à 2024 + cas cliniques inédits.',
  },
  {
    n: '05',
    Icon: Trophy,
    title: 'Concours blancs',
    desc: 'Conditions réelles, copies notées et corrigées par les enseignants.',
  },
  {
    n: '06',
    Icon: TrendingUp,
    title: 'Consolidation & rappels',
    desc: 'Spaced repetition pour ancrer les notions à long terme.',
  },
];

export function PreparationProcessSection() {
  return (
    <section className="relative overflow-hidden py-24 lg:py-32" style={{ backgroundColor: '#F5F5F0' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span
            className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em]"
            style={{ background: 'rgba(107,26,42,0.06)', borderColor: 'rgba(107,26,42,0.2)', color: BORDEAUX }}
          >
            <Sparkles className="h-3 w-3" />
            Méthode
          </span>
          <h2 className="mt-5 font-display text-4xl font-extrabold tracking-tight gradient-bord-blue sm:text-5xl">
            Comment nous préparons les candidats
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#5A5A5A] sm:text-lg">
            Une méthode éprouvée, structurée en 6 étapes, qui transforme votre préparation en
            progression mesurable.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PROCESS_STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.06}>
              <article className="group relative h-full overflow-hidden rounded-2xl border border-[#E8E7E3] bg-white p-7 transition-all hover:-translate-y-1 hover:border-[#6B1A2A]/30 hover:shadow-xl">
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ background: 'radial-gradient(circle, rgba(107,26,42,0.10), transparent 70%)' }}
                />
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-xl text-white"
                    style={{ background: `linear-gradient(135deg, ${BORDEAUX}, ${BORDEAUX_DEEP})` }}
                  >
                    <s.Icon className="h-5 w-5" />
                  </span>
                  <span className="font-display text-3xl font-black tracking-tight text-[#E8E7E3] group-hover:text-[#6B1A2A]/30 transition-colors">
                    {s.n}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-lg font-bold tracking-tight text-[#2D2D2D]">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5A5A5A]">{s.desc}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   2. MethodologySection — « Une méthodologie pensée pour les EVC »
   ============================================================ */
const METHOD_PILLARS = [
  { Icon: BrainCircuit, t: 'Apprendre à raisonner', d: 'Pas de bachotage : on travaille le raisonnement clinique attendu par le jury.' },
  { Icon: UserCheck,    t: 'Être guidé pas à pas', d: 'Coaching personnalisé + replanification hebdomadaire selon votre rythme.' },
  { Icon: Award,        t: 'Comprendre les attentes du jury', d: 'Décryptage des grilles de notation officielles et des pièges récurrents.' },
  { Icon: Target,       t: 'Maîtriser la stratégie d’épreuve', d: 'Gestion du temps, choix des items, mental le jour J.' },
];

export function MethodologySection() {
  return (
    <section className="relative overflow-hidden bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <span
              className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em]"
              style={{ background: 'rgba(107,26,42,0.06)', borderColor: 'rgba(107,26,42,0.2)', color: BORDEAUX }}
            >
              <BrainCircuit className="h-3 w-3" />
              Méthodologie EVC
            </span>
            <h2 className="mt-5 font-display text-4xl font-extrabold tracking-tight gradient-tri sm:text-5xl">
              Une méthodologie pensée pour les EVC
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#5A5A5A] sm:text-lg">
              Notre approche unique combine rigueur scientifique, raisonnement clinique et
              stratégies d’examen pour vous donner toutes les armes du succès.
            </p>

            <ul className="mt-8 space-y-4">
              {METHOD_PILLARS.map((p) => (
                <li key={p.t} className="flex items-start gap-4">
                  <span
                    className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
                    style={{ background: `linear-gradient(135deg, ${BORDEAUX}, ${BORDEAUX_DEEP})` }}
                  >
                    <p.Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-display text-base font-bold text-[#2D2D2D]">{p.t}</p>
                    <p className="mt-1 text-sm leading-relaxed text-[#5A5A5A]">{p.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="relative">
              <div
                aria-hidden
                className="absolute -inset-6 -z-10 rounded-3xl opacity-60 blur-2xl"
                style={{ background: 'radial-gradient(circle at 30% 30%, rgba(107,26,42,0.20), transparent 70%)' }}
              />
              <div className="overflow-hidden rounded-3xl border border-[#E8E7E3] bg-gradient-to-br from-white to-[#F5F5F0] p-1 shadow-2xl">
                <div className="grid gap-4 rounded-[20px] bg-white p-8 sm:grid-cols-2">
                  {[
                    { Icon: ClipboardCheck, k: 'Organisation structurée', v: 'Plan par semestre' },
                    { Icon: BookOpen,       k: 'Révisions méthodiques',   v: 'Spaced repetition' },
                    { Icon: Target,         k: 'Entraînements progressifs', v: 'Difficulté adaptative' },
                    { Icon: LineChart,      k: 'Suivi personnalisé',      v: 'Analytics par item' },
                  ].map((c, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-[#E8E7E3] bg-[#FAFAF8] p-4 transition-all hover:border-[#6B1A2A]/30 hover:shadow-sm"
                    >
                      <c.Icon className="h-5 w-5 text-[#6B1A2A]" />
                      <p className="mt-3 text-xs font-bold uppercase tracking-wider text-[#7A7A7A]">{c.v}</p>
                      <p className="mt-1 font-display text-sm font-bold text-[#2D2D2D]">{c.k}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   3. EcosystemSection — « Une plateforme vivante et active »
   ============================================================ */
const ECOSYSTEM_BLOCKS = [
  { Icon: Video,         t: 'Webinars live',          d: 'Sessions hebdomadaires de méthodologie et cas cliniques.', tag: 'Chaque mardi 20h' },
  { Icon: CalendarClock, t: 'Événements',             d: 'Concours blancs, conférences avec des experts EVC.',       tag: '1× par mois' },
  { Icon: GraduationCap, t: 'Sessions méthodologie',  d: 'Ateliers en petit groupe sur le raisonnement clinique.',   tag: 'À la demande' },
  { Icon: Activity,      t: 'Activité continue',      d: 'Nouveau contenu chaque semaine, mises à jour 2026.',       tag: 'Programme vivant' },
];

export function EcosystemSection() {
  return (
    <section className="relative overflow-hidden py-24 lg:py-32" style={{ backgroundColor: '#FAFAF8' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span
            className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em]"
            style={{ background: 'rgba(107,26,42,0.06)', borderColor: 'rgba(107,26,42,0.2)', color: BORDEAUX }}
          >
            <Activity className="h-3 w-3" />
            Plateforme vivante
          </span>
          <h2 className="mt-5 font-display text-4xl font-extrabold tracking-tight gradient-teal sm:text-5xl">
            Une plateforme vivante et active
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#5A5A5A] sm:text-lg">
            Bien plus qu’une simple banque de QCM : un environnement pédagogique en mouvement
            permanent, avec des live, des événements et un programme qui s’enrichit chaque semaine.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ECOSYSTEM_BLOCKS.map((b, i) => (
            <Reveal key={b.t} delay={i * 0.06}>
              <article className="group relative h-full rounded-2xl border border-[#E8E7E3] bg-white p-6 transition-all hover:-translate-y-1 hover:border-[#6B1A2A]/30 hover:shadow-xl">
                <span
                  className="absolute right-4 top-4 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  style={{ background: 'rgba(107,26,42,0.08)', color: BORDEAUX }}
                >
                  {b.tag}
                </span>
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-white"
                  style={{ background: `linear-gradient(135deg, ${BORDEAUX}, ${BORDEAUX_DEEP})` }}
                >
                  <b.Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 font-display text-lg font-bold tracking-tight text-[#2D2D2D]">
                  {b.t}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5A5A5A]">{b.d}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   4. SpecialtiesSection — Les disciplines couvertes
   ============================================================ */
/* SpecialtiesSection — pixel-perfect maquette designer
   Header navy + red · 6 catégories + panneau expandé · 3 footer cards + CTA */

const NAVY = '#0F1B3D';
const RED = '#A91D2C';
const RED_BG = '#FDEEEF';

const CATEGORIES = [
  { Icon: Stethoscope, label: 'Médecine Générale',         desc: 'Préparation dédiée aux EVC de médecine générale (PAE).',                  tint: '#FDEEEF', stroke: '#A91D2C', active: false },
  { Icon: Heart,       label: 'Spécialités Médicales',     desc: '20+ spécialités EVC',                                                     tint: '#FDEEEF', stroke: '#A91D2C', active: true },
  { Icon: Scissors,    label: 'Spécialités Chirurgicales', desc: 'Préparation adaptée aux EVC de toutes les spécialités chirurgicales.',  tint: '#E5F0FA', stroke: '#1F4F88', active: false },
  { Icon: Smile,       label: 'Odontologie',               desc: 'Préparation spécifique aux EVC en odontologie.',                          tint: '#E7F6EC', stroke: '#16793C', active: false },
  { Icon: Pill,        label: 'Pharmacie',                 desc: 'Accompagnement adapté aux épreuves EVC de pharmacie.',                    tint: '#F1E8FD', stroke: '#5B2BB8', active: false },
  { Icon: Baby,        label: 'Maïeutique',                desc: 'Préparation dédiée aux EVC de maïeutique.',                               tint: '#FFEAD9', stroke: '#B45B00', active: false },
];

const MEDICAL_COLS = [
  ['Gériatrie', 'Médecine d’Urgence', 'Radiologie', 'Anesthésie-Réanimation', 'Pédiatrie'],
  ['Cardiologie', 'Neurologie', 'Pneumologie', 'Néphrologie', 'Endocrinologie'],
  ['Gastro-entérologie', 'Hématologie', 'Oncologie', 'Médecine interne', 'Rhumatologie'],
  ['Psychiatrie', 'Médecine physique et réadaptation', 'Maladies infectieuses'],
];

const FOOTER_BADGES = [
  { Icon: Users,        title: '45 spécialités EVC couvertes',                desc: 'De la médecine générale aux spécialités les plus pointues.' },
  { Icon: BookOpen,     title: 'Ressources dédiées EVC (PAE)',                desc: 'Des contenus spécifiques à chaque discipline.' },
  { Icon: Target,       title: 'Préparation EVC adaptée aux attentes des jurys', desc: 'Méthodologie, entraînements et cas cliniques ciblés.' },
];

export function SpecialtiesSection() {
  return (
    <section
      className="bg-white py-20 lg:py-28"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <Reveal className="mx-auto max-w-4xl text-center">
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em]"
            style={{ background: RED_BG, color: RED }}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            45 spécialités EVC couvertes
          </span>
          <h2 className="mt-5 text-4xl font-black leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.5rem]" style={{ color: NAVY }}>
            Préparation <span style={{ color: RED }}>EVC (PAE)</span> adaptée<br className="hidden sm:block" />
            <span> à votre spécialité</span>
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-[#4B5563] sm:text-lg">
            Préparez les <span className="font-semibold" style={{ color: RED }}>Épreuves de Vérification des Connaissances (EVC)</span> dans
            le cadre de la <span className="font-semibold" style={{ color: RED }}>Procédure d’Autorisation d’Exercice (PAE)</span> grâce à des
            contenus, des cas cliniques et une méthodologie adaptés aux attentes des jurys.
          </p>
        </Reveal>

        {/* 6 catégories */}
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((c) => (
            <article
              key={c.label}
              className="relative flex flex-col items-center rounded-2xl border bg-white p-5 text-center transition-all hover:shadow-lg"
              style={{
                borderColor: c.active ? RED : '#E5E7EB',
                borderWidth: c.active ? 2 : 1,
                boxShadow: c.active ? '0 8px 24px -10px rgba(169,29,44,0.25)' : undefined,
              }}
            >
              <span
                className="flex h-14 w-14 items-center justify-center rounded-full"
                style={{ background: c.tint, color: c.stroke }}
              >
                <c.Icon className="h-6 w-6" strokeWidth={2.2} />
              </span>
              <h3 className="mt-4 text-base font-extrabold leading-tight" style={{ color: NAVY }}>
                {c.label}
              </h3>
              {c.active ? (
                <>
                  <span className="mt-3 block h-[3px] w-8 rounded-full" style={{ background: RED }} />
                  <span
                    className="mt-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-bold"
                    style={{ background: RED_BG, color: RED }}
                  >
                    {c.desc}
                  </span>
                </>
              ) : (
                <>
                  <span className="mt-3 block h-[2px] w-8 rounded-full bg-[#E5E7EB]" />
                  <p className="mt-3 text-xs leading-relaxed text-[#6B7280]">{c.desc}</p>
                </>
              )}
              {c.active && (
                <span
                  aria-hidden
                  className="absolute -bottom-3 left-1/2 h-6 w-6 -translate-x-1/2 rotate-45 rounded-sm"
                  style={{ background: 'white', borderRight: `2px solid ${RED}`, borderBottom: `2px solid ${RED}` }}
                />
              )}
            </article>
          ))}
        </div>

        {/* Panneau expandé sous « Spécialités Médicales » */}
        <div
          className="mt-10 grid gap-8 rounded-2xl border bg-[#FBFBFB] p-6 sm:p-8 lg:grid-cols-[0.85fr_2.4fr] lg:gap-10"
          style={{ borderColor: '#E5E7EB' }}
        >
          <div>
            <h3 className="text-xl font-extrabold leading-tight" style={{ color: RED }}>
              Préparation EVC par<br />spécialité médicale
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-[#4B5563]">
              Un programme complet<br />
              pour réussir les EVC (PAE)<br />
              dans votre spécialité.
            </p>
            <Link
              href="/preparations"
              className="mt-5 inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-colors hover:bg-[#FBEEEF]"
              style={{ borderColor: RED, color: RED }}
            >
              Voir toutes les spécialités EVC
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div>
            <ul className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
              {MEDICAL_COLS.flat().map((s) => (
                <li key={s} className="flex items-center gap-2 text-sm" style={{ color: NAVY }}>
                  <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: RED }} />
                  <span>{s}</span>
                </li>
              ))}
              <li className="col-span-full mt-2 text-sm font-bold" style={{ color: RED }}>
                + 10 autres spécialités EVC
              </li>
            </ul>
          </div>
        </div>

        {/* 3 footer cards */}
        <div className="mt-10 grid gap-4 rounded-2xl bg-[#F7F7F7] p-5 sm:grid-cols-3 sm:p-7">
          {FOOTER_BADGES.map((b) => (
            <div key={b.title} className="flex items-start gap-3">
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
                style={{ background: RED_BG, color: RED }}
              >
                <b.Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-extrabold leading-tight" style={{ color: NAVY }}>{b.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-[#6B7280]">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA principal */}
        <div className="mt-10 flex flex-col items-center gap-3">
          <Link
            href="/preparations"
            className="inline-flex items-center gap-3 rounded-2xl px-8 py-4 text-base font-extrabold text-white shadow-[0_10px_30px_-10px_rgba(169,29,44,0.6)] transition-transform hover:scale-[1.02]"
            style={{ background: RED }}
          >
            Découvrir toutes les préparations EVC
            <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="flex items-center gap-2 text-sm text-[#6B7280]">
            <ShieldCheck className="h-4 w-4" style={{ color: RED }} />
            Une préparation complète et reconnue pour réussir les EVC (PAE), quelle que soit votre spécialité.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   5. MethodProofSection — « La preuve par la méthode »
   ============================================================ */
const PROOF_TOPICS = [
  { Icon: ShieldCheck, t: 'Les erreurs fréquentes aux EVC',         d: 'Les pièges récurrents identifiés dans les copies des candidats refusés.' },
  { Icon: TrendingUp,  t: 'Les thématiques hypertombables',         d: 'Cardio, infectio, pédiatrie : les items qui tombent chaque année.' },
  { Icon: BrainCircuit,t: 'Méthodologie de raisonnement clinique',  d: 'Pas-à-pas pour structurer vos copies comme le jury l’attend.' },
  { Icon: ClipboardCheck, t: 'Comment structurer ses révisions',    d: 'Le planning type 12 semaines de nos candidats reçus.' },
];

export function MethodProofSection() {
  return (
    <section className="relative overflow-hidden py-24 lg:py-32" style={{ backgroundColor: '#F0F0EC' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span
            className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em]"
            style={{ background: 'rgba(107,26,42,0.06)', borderColor: 'rgba(107,26,42,0.2)', color: BORDEAUX }}
          >
            <ShieldCheck className="h-3 w-3" />
            La preuve
          </span>
          <h2 className="mt-5 font-display text-4xl font-extrabold tracking-tight gradient-vivid sm:text-5xl">
            La preuve par la méthode
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#5A5A5A] sm:text-lg">
            Voici concrètement ce que nous enseignons et pourquoi ça marche.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {PROOF_TOPICS.map((p, i) => (
            <Reveal key={p.t} delay={i * 0.08}>
              <article className="group relative h-full overflow-hidden rounded-2xl border border-[#E8E7E3] bg-white p-7 transition-all hover:-translate-y-1 hover:shadow-2xl">
                <div className="flex items-start gap-4">
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white"
                    style={{ background: `linear-gradient(135deg, ${BORDEAUX}, ${BORDEAUX_DEEP})` }}
                  >
                    <p.Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-lg font-bold tracking-tight text-[#2D2D2D]">
                      {p.t}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#5A5A5A]">{p.d}</p>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   6. QCMPreviewSection — Aperçu d'un QCM type
   ============================================================ */
export function QCMPreviewSection() {
  return (
    <section className="relative overflow-hidden py-24 lg:py-32" style={{ backgroundColor: '#FAFAF8' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <span
              className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em]"
              style={{ background: 'rgba(107,26,42,0.06)', borderColor: 'rgba(107,26,42,0.2)', color: BORDEAUX }}
            >
              <ClipboardCheck className="h-3 w-3" />
              Banque QCM
            </span>
            <h2 className="mt-5 font-display text-4xl font-extrabold tracking-tight gradient-tri sm:text-5xl">
              QCM corrigés et justifiés
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#5A5A5A] sm:text-lg">
              Chaque item est accompagné d’une justification médicale détaillée. Filtrage par
              spécialité, par difficulté, par fréquence aux EVC.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-[#2D2D2D]">
              {[
                'Format EVC : 5 items A à E, plusieurs bonnes réponses possibles',
                'Justification par item, pas uniquement la bonne réponse',
                'Statistiques nationales : taux de réussite par question',
                'Mode entraînement libre OU conditions réelles chronométrées',
              ].map((l) => (
                <li key={l} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#6B1A2A]" />
                  <span>{l}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="relative">
              <div aria-hidden className="absolute -inset-4 -z-10 rounded-3xl opacity-50 blur-2xl"
                style={{ background: 'radial-gradient(circle at 70% 30%, rgba(107,26,42,0.25), transparent 70%)' }}
              />
              <div className="overflow-hidden rounded-3xl border border-[#E8E7E3] bg-white shadow-2xl">
                <div className="border-b border-[#E8E7E3] bg-[#FAFAF8] px-6 py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#6B1A2A]">
                      Cardiologie · Item 234
                    </span>
                    <span className="text-xs font-medium text-[#7A7A7A]">Question 3 / 10</span>
                  </div>
                  <p className="mt-3 text-base font-semibold text-[#2D2D2D]">
                    Concernant le traitement de l’insuffisance cardiaque à FEVG altérée, quelles
                    propositions sont exactes ?
                  </p>
                </div>
                <div className="space-y-2 p-6">
                  {[
                    { l: 'A', t: 'Un IEC est recommandé en première intention', ok: true },
                    { l: 'B', t: 'Le bêta-bloquant est introduit à dose maximale d’emblée', ok: false },
                    { l: 'C', t: 'La spironolactone est indiquée si FEVG ≤ 35 %', ok: true },
                    { l: 'D', t: 'Les inhibiteurs SGLT2 ont démontré un bénéfice sur la mortalité', ok: true },
                    { l: 'E', t: 'Les digitaliques sont systématiques', ok: false },
                  ].map((it) => (
                    <div
                      key={it.l}
                      className="flex items-start gap-3 rounded-xl border border-[#E8E7E3] bg-[#FAFAF8] px-4 py-3 transition-colors hover:border-[#6B1A2A]/30"
                    >
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                        style={{
                          background: it.ok ? 'rgba(34,197,94,0.10)' : 'rgba(228,0,43,0.06)',
                          color: it.ok ? '#16793C' : '#6B1A2A',
                        }}
                      >
                        {it.l}
                      </span>
                      <span className="text-sm leading-relaxed text-[#2D2D2D]">{it.t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   7. DashboardPreviewSection — Aperçu tableau de bord
   ============================================================ */
export function DashboardPreviewSection() {
  return (
    <section className="relative overflow-hidden py-24 lg:py-32" style={{ backgroundColor: '#FAFAF8' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal delay={0.1} className="order-2 lg:order-1">
            <div className="relative">
              <div aria-hidden className="absolute -inset-4 -z-10 rounded-3xl opacity-50 blur-2xl"
                style={{ background: 'radial-gradient(circle at 30% 30%, rgba(107,26,42,0.25), transparent 70%)' }}
              />
              {/* Fenêtre macOS-style avec image du vrai dashboard étudiant,
                  zoomée et rognée sur les KPI + le graphique de progression. */}
              <div className="overflow-hidden rounded-3xl border border-[#E8E7E3] bg-white shadow-[0_50px_140px_-30px_rgba(107,26,42,0.45)] ring-1 ring-black/5">
                <div className="flex items-center gap-1.5 border-b border-[#E8E7E3] bg-[#FAFAF8] px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
                  <span className="ml-3 truncate text-[11px] text-[#7A7A7A]">
                    app.majorecn.fr / accueil
                  </span>
                </div>
                <div
                  className="relative aspect-[16/10] w-full overflow-hidden bg-white"
                  aria-hidden
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/accueil.png"
                    alt=""
                    className="absolute left-0 top-0 h-auto w-[200%] -translate-x-[8%] -translate-y-[6%] max-w-none object-cover sm:w-[185%]"
                  />
                  {/* Badges flottants — chiffres clés mis en avant */}
                  <div className="pointer-events-none absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-[#E8E7E3] bg-white/95 px-3 py-1.5 text-[11px] font-bold text-[#16793C] shadow-lg backdrop-blur sm:right-5 sm:top-5">
                    <TrendingUp className="h-3 w-3" />
                    +12 % cette semaine
                  </div>
                  <div className="pointer-events-none absolute -bottom-3 -left-3 inline-flex items-center gap-2 rounded-2xl border border-[#E8E7E3] bg-white px-4 py-2.5 shadow-xl sm:bottom-4 sm:left-4">
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-white"
                      style={{ background: `linear-gradient(135deg, ${BORDEAUX}, ${BORDEAUX_DEEP})` }}
                    >
                      <Target className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#7A7A7A]">Réussite</p>
                      <p className="font-display text-base font-extrabold text-[#2D2D2D]">76 %</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal className="order-1 lg:order-2">
            <span
              className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em]"
              style={{ background: 'rgba(107,26,42,0.06)', borderColor: 'rgba(107,26,42,0.2)', color: BORDEAUX }}
            >
              <LineChart className="h-3 w-3" />
              Suivi de progression
            </span>
            <h2 className="mt-5 font-display text-4xl font-extrabold tracking-tight gradient-tri-rev sm:text-5xl">
              Tableau de bord en temps réel
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#5A5A5A] sm:text-lg">
              Suivez chaque indicateur : taux de réussite par spécialité, items où vous perdez du
              temps, flashcards acquises, courbe de progression hebdomadaire.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-[#2D2D2D]">
              {[
                { Icon: TrendingUp, t: 'Analytics détaillés — par item, par session, par jour' },
                { Icon: Target,     t: 'Roadmap personnalisée mise à jour à chaque session' },
                { Icon: Activity,   t: 'Progression visible en direct sur tous vos appareils' },
                { Icon: Clock,      t: 'Temps de travail hebdomadaire et benchmark national' },
              ].map((l, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <l.Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#6B1A2A]" />
                  <span>{l.t}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   8. PedagogicalTeamSection — pixel-perfect maquette designer
   « Une équipe qui connaît les attentes des EVC »
   ============================================================ */
const TM_NAVY = '#14254E';
const TM_RED = '#A91D2C';
const TM_RED_BG = '#FCEAEC';
const TM_INK_SOFT = '#5B6478';

const TEAM_BENEFITS = [
  'Une expérience terrain au cœur des hôpitaux universitaires',
  'Une connaissance précise des programmes et des attentes jurys',
  'Des contenus conçus, relus et actualisés en continu',
];

const TEAM_CARDS = [
  { Icon: Users,      t: 'Comprendre ce qu’attend le jury',          d: 'Nos enseignants connaissent les critères d’évaluation, les pièges classiques et les points clés particulièrement surveillés lors des EVC.' },
  { Icon: BookOpen,   t: 'Maîtriser les contenus essentiels',         d: 'Chaque spécialité dispose de contenus ciblés sur les connaissances réellement attendues : QCM, cas cliniques, fiches, entraînements.' },
  { Icon: Target,     t: 'Acquérir la bonne méthodologie',            d: 'Raisonnement clinique, gestion du temps, analyse des questions, méthode de réponse : des techniques clés pour performer le jour J.' },
  { Icon: TrendingUp, t: 'Une expérience au service de votre réussite', d: 'Plus de 9 000 médecins accompagnés dans de nombreuses spécialités. Une expérience concrète qui nous permet d’anticiper vos difficultés et d’y répondre.' },
];

const TEAM_STATS = [
  { Icon: Calendar,    big: '18',                   label: 'ans d’expérience',      sub: 'au service de votre réussite' },
  { Icon: Users,       big: '9 000+',               label: 'médecins accompagnés',  sub: 'depuis 2006' },
  { Icon: Stethoscope, big: '45',                   label: 'spécialités couvertes', sub: 'toutes les disciplines EVC' },
  { Icon: ShieldCheck, big: '',                     label: 'PH spécialistes & CCA', sub: 'impliqués dans la préparation et la réussite des candidats' },
];

/** Collage de 4 cadres inclinés (placeholder générique N&B, prêt à recevoir
 *  de vraies photos de l'équipe). */
function TeamPhotoCollage() {
  return (
    <div className="flex h-full items-center justify-center gap-1.5">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="relative h-56 w-20 shrink-0 overflow-hidden sm:w-24"
          style={{
            transform: 'skewX(-9deg)',
            background: 'linear-gradient(160deg, #E7E9EE 0%, #C9CDD6 55%, #AEB3BF 100%)',
            boxShadow: '0 12px 30px -16px rgba(15,27,61,0.4)',
          }}
        >
          {/* silhouette praticien (générique, en niveaux de gris) */}
          <span
            className="absolute inset-0 flex items-end justify-center"
            style={{ transform: 'skewX(9deg)' }}
            aria-hidden
          >
            <UserCheck className="mb-3 h-16 w-16 text-white/60" strokeWidth={1.2} />
          </span>
        </div>
      ))}
    </div>
  );
}

export function PedagogicalTeamSection() {
  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header centré */}
        <Reveal className="mx-auto max-w-4xl text-center">
          <span
            className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em]"
            style={{ background: 'white', borderColor: 'rgba(169,29,44,0.3)', color: TM_RED }}
          >
            <Users className="h-3.5 w-3.5" />
            Équipe pédagogique
          </span>
          <h2 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.25rem]">
            <span style={{ color: TM_NAVY }}>Une équipe qui connaît les </span>
            <span style={{ color: TM_RED }}>attentes des EVC</span>
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed sm:text-lg" style={{ color: TM_INK_SOFT }}>
            Depuis plus de 18 ans, nos enseignants accompagnent des médecins dans la préparation des EVC.
            Ils maîtrisent les exigences des jurys, les contenus essentiels à connaître
            et la méthodologie de réponse qui fait la différence le jour J.
          </p>
        </Reveal>

        {/* Corps : gauche (carte praticiens + citation) · droite (4 cartes) */}
        <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_1.15fr]">
          {/* --- Colonne gauche --- */}
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border bg-white p-6 sm:p-7" style={{ borderColor: '#ECECEF' }}>
              <div className="grid gap-5 sm:grid-cols-[1.1fr_1fr] sm:items-center">
                <div>
                  <h3 className="text-xl font-extrabold leading-tight" style={{ color: TM_NAVY }}>
                    Des praticiens hospitaliers et enseignants expérimentés
                  </h3>
                  <ul className="mt-5 space-y-4">
                    {TEAM_BENEFITS.map((b) => (
                      <li key={b} className="flex items-start gap-2.5">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ background: TM_RED_BG, color: TM_RED }}>
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        <span className="text-sm leading-relaxed" style={{ color: TM_INK_SOFT }}>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <TeamPhotoCollage />
              </div>
            </div>

            {/* Citation */}
            <div className="rounded-2xl border bg-white p-6 sm:p-7" style={{ borderColor: '#ECECEF' }}>
              <Quote className="h-7 w-7" style={{ color: TM_RED }} fill="currentColor" />
              <p className="mt-3 text-lg font-medium leading-relaxed" style={{ color: TM_NAVY }}>
                Notre mission : vous donner toutes les clés pour comprendre,
                apprendre efficacement et <span className="font-bold" style={{ color: TM_RED }}>réussir le jour J.</span>
              </p>
            </div>
          </div>

          {/* --- Colonne droite : 4 cartes --- */}
          <div className="grid gap-5 sm:grid-cols-2">
            {TEAM_CARDS.map((c) => (
              <article key={c.t} className="flex flex-col rounded-2xl border bg-white p-6 transition-all hover:shadow-lg" style={{ borderColor: '#ECECEF' }}>
                <span className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: TM_RED_BG, color: TM_RED }}>
                  <c.Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-extrabold leading-tight" style={{ color: TM_RED }}>{c.t}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed" style={{ color: TM_INK_SOFT }}>{c.d}</p>
                <span className="mt-4 block h-[3px] w-8 rounded-full" style={{ background: TM_RED }} />
              </article>
            ))}
          </div>
        </div>

        {/* Bandeau stats */}
        <div className="mt-8 grid gap-5 rounded-2xl bg-[#F7F7F8] p-6 sm:grid-cols-2 lg:grid-cols-4 sm:p-8">
          {TEAM_STATS.map((s) => (
            <div key={s.label} className="flex items-start gap-3.5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full" style={{ background: TM_RED_BG, color: TM_RED }}>
                <s.Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="leading-tight" style={{ color: TM_NAVY }}>
                  {s.big && <span className="text-2xl font-black tracking-tight">{s.big} </span>}
                  <span className="text-sm font-bold">{s.label}</span>
                </p>
                <p className="mt-0.5 text-xs leading-relaxed" style={{ color: TM_INK_SOFT }}>{s.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   9. FinalCtaBlock — bloc CTA réutilisable (inscription + trust badges)
   ============================================================ */
export function FinalCtaBlock({ colleges }: { colleges?: { id: string; nom: string }[] }) {
  return (
    <section id="cta" className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-[#E8E7E3] bg-gradient-to-br from-white to-[#FAFAF8] p-9 text-center shadow-sm sm:p-12">
          <div
            aria-hidden
            className="absolute -top-24 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full blur-[100px]"
            style={{ background: 'rgba(107,26,42,0.18)' }}
          />
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em]"
            style={{ background: 'rgba(107,26,42,0.10)', color: BORDEAUX }}
          >
            <ClipboardCheck className="h-3.5 w-3.5" /> Prêt à commencer ?
          </span>
          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight gradient-vivid sm:text-4xl lg:text-5xl">
            Rejoignez les candidats
            <br className="hidden sm:block" />
            qui ont réussi avec Major ECN
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-[#5A5A5A]">
            Accès immédiat à la plateforme, 7 jours d’essai gratuit, sans engagement.
          </p>

          <InscriptionForm colleges={colleges ?? []} />

          <p className="mt-4 text-xs text-[#7A7A7A]">
            ✓ Essai gratuit 7 jours · Essentiel &amp; Premium : accès immédiat par email d’activation.
            Intensif : un conseiller vous rappelle sous 24 h.
          </p>
        </div>

        <ul className="mt-10 grid grid-cols-2 gap-3 text-center text-[11px] font-semibold text-[#5A5A5A] sm:grid-cols-3 lg:grid-cols-6">
          {[
            { Icon: ShieldCheck,    t: 'Contenu certifié par des spécialistes' },
            { Icon: TrendingUp,     t: 'Progression · Suivi structuré' },
            { Icon: Activity,       t: 'Accès 24h/24, 7j/7' },
            { Icon: BookOpen,       t: 'Méthodologie · Approche EVC' },
            { Icon: Users,          t: 'PH spécialistes & CCA' },
            { Icon: ClipboardCheck, t: 'Mis à jour chaque trimestre' },
          ].map((b) => (
            <li key={b.t} className="flex flex-col items-center gap-1.5 rounded-xl border border-[#E8E7E3] bg-[#FAFAF8] p-4">
              <b.Icon className="h-4 w-4 text-[#6B1A2A]" />
              {b.t}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ============================================================
   10. TarifsBlock — bloc tarifs (3 plans) en dark charcoal
   ============================================================ */
const PLANS = [
  {
    name: 'Essentiel', price: '49', period: '/mois',
    desc: 'Pour démarrer votre préparation.',
    features: ['Accès à tous les QCM', 'Flashcards & révision', 'Suivi de progression', 'Communauté étudiants'],
    cta: 'Commencer', highlighted: false,
  },
  {
    name: 'Premium', price: '89', period: '/mois',
    desc: 'La préparation complète recommandée.',
    features: ['Tout Essentiel +', 'IA pédagogique avancée', 'Analytics détaillés', 'Examens blancs illimités', 'Tuteur dédié', 'Mode concours'],
    cta: 'Choisir Premium', highlighted: true, badge: 'Le plus populaire',
  },
  {
    name: 'Intensif', price: '149', period: '/mois',
    desc: 'Accompagnement personnalisé maximal.',
    features: ['Tout Premium +', 'Sessions 1:1 avec un médecin', 'Plan d’étude sur mesure', 'Accès prioritaire au support', 'Garantie satisfaction'],
    cta: 'Contacter l’équipe', highlighted: false,
  },
];

const CONTACT_EMAIL = 'contact@majorecn.fr';

export function TarifsBlock() {
  return (
    <section id="tarifs" className="relative isolate overflow-hidden bg-[#1C1C1E] py-20 text-white lg:py-28">
      <div aria-hidden className="absolute -top-32 left-1/2 -z-10 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-[#6B1A2A]/40 blur-[120px]" />
      <div aria-hidden className="absolute -bottom-32 right-1/4 -z-10 h-[380px] w-[600px] rounded-full bg-[#3B82F6]/12 blur-[120px]" />
      <div aria-hidden className="absolute -left-32 top-1/3 -z-10 h-[320px] w-[520px] rounded-full bg-[#14B8A6]/10 blur-[120px]" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] backdrop-blur">
            <Sparkles className="h-3 w-3" /> Inscriptions ouvertes — Session 2025
          </span>
          <h2 className="no-gradient mt-5 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Votre réussite aux EVC commence ici
          </h2>
          <p className="mt-4 text-base text-white/70 sm:text-lg">
            Choisissez la formule adaptée à vos objectifs. 7 jours d’essai gratuit, sans engagement.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {PLANS.map((p, idx) => {
            const hi = p.highlighted;
            return (
              <Reveal
                key={p.name}
                delay={idx * 0.1}
                className={
                  'relative flex flex-col gap-5 rounded-2xl p-7 transition-transform ' +
                  (hi
                    ? 'bg-white text-[#2D2D2D] ring-2 ring-white shadow-2xl shadow-black/40 lg:scale-[1.03]'
                    : 'bg-[rgba(255,255,255,0.04)] text-white ring-1 ring-[rgba(255,255,255,0.12)] hover:ring-[rgba(255,255,255,0.25)]')
                }
              >
                {p.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#6B1A2A] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                    {p.badge}
                  </span>
                )}
                <div>
                  <p className={'text-[11px] font-bold uppercase tracking-[0.14em] ' + (hi ? 'text-[#6B1A2A]' : 'text-white/50')}>
                    {p.name}
                  </p>
                  <div className="mt-3 flex items-end gap-1">
                    <span className={'font-display text-5xl font-extrabold tracking-tight ' + (hi ? 'text-[#2D2D2D]' : 'text-white')}>
                      {p.price} €
                    </span>
                    <span className={'mb-1.5 text-sm font-medium ' + (hi ? 'text-[#7A7A7A]' : 'text-white/60')}>
                      {p.period}
                    </span>
                  </div>
                  <p className={'mt-2 text-sm ' + (hi ? 'text-[#5A5A5A]' : 'text-white/70')}>{p.desc}</p>
                </div>

                <ul className="space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className={'flex items-start gap-2.5 text-sm ' + (hi ? 'text-[#2D2D2D]' : 'text-white/85')}>
                      <Check className={'mt-0.5 h-4 w-4 shrink-0 ' + (hi ? 'text-[#6B1A2A]' : 'text-white')} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={p.name === 'Intensif' ? `mailto:${CONTACT_EMAIL}` : '/inscription'}
                  className={
                    'mt-auto inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-transform hover:scale-[1.02] ' +
                    (hi
                      ? 'bg-[#6B1A2A] text-white shadow-lg shadow-[#6B1A2A]/25'
                      : 'bg-white text-[#4D121E]')
                  }
                >
                  {p.cta}
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Reveal>
            );
          })}
        </div>

        <p className="mt-10 text-center text-xs text-white/55">
          ✓ Essai gratuit 7 jours · Accès complet · Zéro engagement · Annulation instantanée
        </p>
      </div>
    </section>
  );
}

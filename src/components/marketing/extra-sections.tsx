'use client';
/* eslint-disable @next/next/no-img-element */
/**
 * Sections additionnelles inspirées de la maquette designer (HeroIconic).
 * Reprennent le code couleur Manus (bordeaux + cream) déjà en place, restent
 * cohérentes avec les composants existants dans manus-sections.tsx.
 */
import {
  Activity, ArrowRight, Award, Baby, BarChart3, Bell, BookOpen, Brain, BrainCircuit, Calendar, CalendarCheck, CalendarDays,
  CalendarClock, Check, CheckCircle2, ClipboardCheck, ClipboardList, Clock, Compass, FileText, Folder, GraduationCap, Heart, Lightbulb,
  Layers3, LineChart, ListChecks, MapPin, MessageCircle, Microscope, Pill, Play, Quote, Radio, Scissors, ShieldCheck,
  Sparkles, Smile, Stethoscope, Target, TrendingUp, Trophy, UserCheck, Users, Video, Zap,
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
          <h2 className="mt-5 text-3xl font-black leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.5rem]"
            style={{
              backgroundImage: 'linear-gradient(90deg, #6B1A2A 0%, #C0112E 55%, #E8742C 100%)',
              WebkitBackgroundClip: 'text', backgroundClip: 'text',
              WebkitTextFillColor: 'transparent', color: 'transparent',
            }}>
            Préparation EVC (PAE) adaptée à votre spécialité
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
  { Icon: Users,       big: '9 000+',               label: 'médecins accompagnés',  sub: 'depuis 2011' },
  { Icon: Stethoscope, big: '45',                   label: 'spécialités couvertes', sub: 'toutes les disciplines EVC' },
  { Icon: ShieldCheck, big: '',                     label: 'PH spécialistes & CCA', sub: 'impliqués dans la préparation et la réussite des candidats' },
];

/** Portrait grand format d'une enseignante de l'équipe.
 *  Lit la photo dans /public/team/enseignante-1.jpg ; sinon retombe sur un
 *  placeholder discret (initiales + icône). */
const FEATURED_TEACHER = {
  photo: '/team/enseignante-1.jpg',
  name: 'Notre équipe pédagogique',
  caption: 'Praticiens hospitaliers et CCA — 15 ans d’accompagnement EVC',
};
function TeamPhotoCollage() {
  return (
    <div className="flex h-full items-center justify-center">
      <div
        className="relative aspect-[3/4] w-full max-w-[260px] overflow-hidden rounded-2xl"
        style={{
          background: 'linear-gradient(160deg, #E7E9EE 0%, #C9CDD6 55%, #AEB3BF 100%)',
          boxShadow: '0 24px 50px -22px rgba(15,27,61,0.45)',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={FEATURED_TEACHER.photo}
          alt={FEATURED_TEACHER.caption}
          className="h-full w-full object-cover"
          onError={(e) => {
            const img = e.currentTarget;
            img.style.display = 'none';
            const sib = img.nextElementSibling as HTMLElement | null;
            if (sib) sib.style.display = 'flex';
          }}
        />
        <span
          aria-hidden
          className="hidden h-full w-full items-end justify-center"
        >
          <UserCheck className="mb-6 h-20 w-20 text-white/70" strokeWidth={1.2} />
        </span>
        {/* dégradé bas + légende */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent p-4 pt-12">
          <p className="text-xs font-bold uppercase tracking-wider text-white/85">
            Équipe pédagogique
          </p>
          <p className="mt-0.5 text-[11px] font-medium leading-snug text-white/75">
            {FEATURED_TEACHER.caption}
          </p>
        </div>
      </div>
    </div>
  );
}

export function PedagogicalTeamSection() {
  return (
    <section id="equipe" className="bg-white py-16 sm:py-20 lg:py-24" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
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
            <span style={{ backgroundImage: "linear-gradient(90deg, #0F1F4D 0%, #6B1A2A 50%, #C0112E 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", color: "transparent" }}>Une équipe qui connaît les </span>
            <span style={{ color: TM_RED }}>attentes des EVC</span>
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed sm:text-lg" style={{ color: TM_INK_SOFT }}>
            Depuis plus de 15 ans, nos enseignants accompagnent des médecins dans la préparation des EVC.
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
            Rejoignez les candidats{' '}
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

/* ============================================================
   10. BeyondPlatformSection — pixel-perfect maquette designer
   « Bien plus qu'une plateforme de cours » (3 cartes + bandeau + 8 outils)
   ============================================================ */
const BP_NAVY = '#0F1B3D';
const BP_RED = '#C0112E';
const BP_ORANGE = '#E8742C';
const BP_GRAD_RO = 'linear-gradient(90deg,#C0112E 0%,#E8742C 100%)';
/* Degrade des grands titres : meme palette que "Ils racontent leur experience"
 * (TestimonialsVideoSection) — burgundy -> red -> orange en 3 stops. */
const BP_GRAD_TITLE = 'linear-gradient(90deg, #6B1A2A 0%, #C0112E 50%, #E8742C 100%)';
const BP_INK_SOFT = '#5B6478';
const BP_BG = '#FAFBFD';

/* Cartes du haut — 3 grandes vignettes, toutes en variantes rouge-orange */
const BP_TOP = [
  { Icon: Brain,      t: 'Suivi intelligent\nde vos connaissances',     d: 'La plateforme analyse vos résultats et identifie automatiquement les notions à renforcer.',      bg: '#FCEAEC', fg: '#C0112E' },
  { Icon: Target,     t: 'Révisions personnalisées\net adaptatives',    d: 'Des révisions transversales ciblées vous aident à entretenir vos acquis jusqu’au jour des EVC.', bg: '#FFEAD9', fg: '#E8742C' },
  { Icon: TrendingUp, t: 'Évaluations et\nréévaluations ciblées',        d: 'En cas de baisse de niveau, la plateforme détecte les spécialités fragiles et propose des évaluations adaptées.', bg: '#FFF1E6', fg: '#B35900' },
];

/* 8 cartes outils — grille 4×2, palette uniquement rouge → orange */
const BP_TOOLS = [
  { Icon: Compass,        t: 'Méthodologie EVC',                  d: 'Une méthodologie construite à partir des attentes des jurys EVC pour gagner en efficacité dans vos révisions et vos épreuves.', bg: '#FCEAEC', fg: '#C0112E' },
  { Icon: FileText,       t: 'QCM & annales EVC',                  d: 'Des milliers de QCM classés par spécialité, thème et niveau de difficulté pour un entraînement ciblé et efficace.',           bg: '#FFEAD9', fg: '#E8742C' },
  { Icon: Stethoscope,    t: 'Cas cliniques\ncorrigés',            d: 'Entraînez votre raisonnement clinique avec des cas progressifs et des corrections détaillées.',                                bg: '#FFF1E6', fg: '#B35900' },
  { Icon: ClipboardCheck, t: 'Interrogations &\népreuves blanches', d: 'Évaluez vos connaissances et mettez-vous en conditions réelles d’examen avec des corrections commentées.',                    bg: '#FCEAEC', fg: '#C0112E' },
  { Icon: Users,          t: 'Accompagnement\npédagogique',        d: 'Des enseignants expérimentés disponibles pour répondre à vos questions et vous guider tout au long de votre préparation.',     bg: '#FFEAD9', fg: '#E8742C' },
  { Icon: Video,          t: 'Webinars &\nreplays',                d: 'Assistez à nos sessions en direct ou en replay : cours, conseils méthodologiques et corrections d’épreuves.',                  bg: '#FFF1E6', fg: '#B35900' },
  { Icon: BookOpen,       t: 'Fiches &\nflashcards',               d: 'Mémorisez efficacement les notions clés grâce à des fiches de synthèse et des flashcards pratiques.',                          bg: '#FCEAEC', fg: '#C0112E' },
  { Icon: BarChart3,      t: 'Suivi de\nprogression',              d: 'Tableaux de bord et analyses personnalisées pour identifier vos points forts et vos axes d’amélioration.',                     bg: '#FFEAD9', fg: '#E8742C' },
];

export function BeyondPlatformSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24" style={{ background: BP_BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ============ Header ============ */}
        <Reveal>
          <div className="text-center">
            <span
              className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-[11px] font-extrabold uppercase tracking-[0.16em] sm:text-xs"
              style={{ background: '#FFE4D6', color: '#8B0E22' }}
            >
              Méthode <span style={{ color: BP_RED }}>•</span> Entraînement <span style={{ color: BP_RED }}>•</span> Accompagnement <span style={{ color: BP_RED }}>•</span> Réussite EVC
            </span>
            {/* Tout le titre est dans le dégradé rouge-orange caractéristique de la plateforme */}
            <h2 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.75rem]"
              style={{
                backgroundImage: BP_GRAD_TITLE,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
              }}>
              Bien plus qu’une plateforme de cours
            </h2>
            <p className="mx-auto mt-5 max-w-4xl text-base leading-relaxed sm:text-lg" style={{ color: BP_INK_SOFT, fontFamily: "'Manrope', sans-serif" }}>
              Une préparation <span className="font-bold" style={{ color: BP_RED }}>EVC</span> complète associant entraînement,
              méthodologie, accompagnement pédagogique et outils de suivi pour réussir les{' '}
              <span className="font-bold underline decoration-2 underline-offset-2" style={{ color: BP_RED, textDecorationColor: BP_RED }}>Épreuves de Vérification des Connaissances</span> dans le cadre de la{' '}
              <span className="font-bold underline decoration-2 underline-offset-2" style={{ color: BP_RED, textDecorationColor: BP_RED }}>PAE</span>.
            </p>
          </div>
        </Reveal>

        {/* ============ 3 cartes du haut ============ */}
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {BP_TOP.map((c, i) => (
            <Reveal key={c.t} delay={i * 0.07}>
              <article className="flex h-full flex-col rounded-2xl border bg-white p-7 transition-all hover:-translate-y-1 hover:shadow-xl sm:p-8" style={{ borderColor: '#ECECEF' }}>
                <div className="flex items-start gap-5">
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full" style={{ background: c.bg, color: c.fg }}>
                    <c.Icon className="h-7 w-7" strokeWidth={2} />
                  </span>
                  <h3 className="whitespace-pre-line text-lg font-extrabold leading-tight sm:text-xl" style={{ color: BP_NAVY }}>
                    {c.t}
                  </h3>
                </div>
                <p className="mt-5 text-sm leading-relaxed" style={{ color: BP_INK_SOFT, fontFamily: "'Manrope', sans-serif" }}>{c.d}</p>
              </article>
            </Reveal>
          ))}
        </div>

        {/* ============ Bandeau rouge (ne se limite pas aux QCM) ============ */}
        <Reveal delay={0.15}>
          <div
            className="relative mt-8 overflow-hidden rounded-2xl border px-6 py-6 sm:px-8 sm:py-7"
            style={{ background: '#FFEDE2', borderColor: '#FBD0BB' }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-12 top-1/2 hidden h-40 w-60 -translate-y-1/2 opacity-50 sm:block"
              style={{
                background:
                  'radial-gradient(circle, #C0112E 1px, transparent 1.5px) 0 0/12px 12px',
                maskImage: 'linear-gradient(to left, black, transparent)',
                WebkitMaskImage: 'linear-gradient(to left, black, transparent)',
              }}
            />
            <div className="relative flex items-start gap-4 sm:gap-5">
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white shadow-md sm:h-14 sm:w-14"
                style={{ background: BP_GRAD_RO }}
              >
                <Zap className="h-6 w-6 sm:h-7 sm:w-7" fill="currentColor" />
              </span>
              <div className="min-w-0">
                <p className="text-base font-extrabold leading-snug sm:text-lg" style={{ color: BP_NAVY }}>
                  Major ECN ne se limite pas aux QCM.
                </p>
                <p className="mt-1 text-sm leading-relaxed sm:text-base" style={{ color: BP_RED }}>
                  La plateforme analyse votre progression, identifie vos points à renforcer
                  et adapte vos révisions pour vous accompagner efficacement jusqu’aux EVC.
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ============ Bloc « Tous les outils » ============ */}
        <Reveal delay={0.2}>
          <div className="mt-10 rounded-2xl border bg-white p-6 sm:p-8 lg:p-10" style={{ borderColor: '#ECECEF' }}>
            <div className="text-center">
              <h3 className="text-2xl font-black leading-tight tracking-tight sm:text-3xl"
                style={{ backgroundImage: BP_GRAD_TITLE, WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent' }}>
                Tous les outils pour réussir votre préparation EVC
              </h3>
              <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base" style={{ color: BP_INK_SOFT, fontFamily: "'Manrope', sans-serif" }}>
                Des ressources complètes et variées pour apprendre, réviser et vous évaluer efficacement.
              </p>
            </div>

            <div className="mt-8 grid gap-x-6 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
              {BP_TOOLS.map((tool, i) => (
                <Reveal key={tool.t} delay={Math.min(i * 0.04, 0.28)}>
                  <article className="flex items-start gap-3.5">
                    <span
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
                      style={{ background: tool.bg, color: tool.fg }}
                    >
                      <tool.Icon className="h-5 w-5" strokeWidth={2.2} />
                    </span>
                    <div className="min-w-0">
                      <h4 className="whitespace-pre-line text-[15px] font-extrabold leading-tight" style={{ color: BP_NAVY }}>
                        {tool.t}
                      </h4>
                      <span className="mt-1.5 block h-[3px] w-10 rounded-full" style={{ background: tool.fg }} />
                      <p className="mt-3 text-[13px] leading-relaxed" style={{ color: BP_INK_SOFT, fontFamily: "'Manrope', sans-serif" }}>
                        {tool.d}
                      </p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   11. ToolsGridSection — « Tous les outils pour structurer votre progression »
   ============================================================ */
const TG_NAVY = '#14254E';
const TG_BLUE = '#2563EB';
const TG_INK_SOFT = '#5B6478';

function MiniBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-28 shrink-0 truncate text-[11px]" style={{ color: TG_NAVY }}>{label}</span>
      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#EAECF2]">
        <span className="block h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </span>
      <span className="w-8 shrink-0 text-right text-[11px] font-bold tabular-nums" style={{ color: TG_NAVY }}>{value}%</span>
    </div>
  );
}

export function ToolsGridSection() {
  const cardCls = 'flex h-full flex-col rounded-2xl border bg-white p-6 transition-all hover:shadow-lg sm:p-7';
  const border = { borderColor: '#ECECEF' };
  const titleCls = 'text-xl font-extrabold leading-tight';
  const descCls = 'mt-3 text-sm leading-relaxed';
  const descStyle = { color: TG_INK_SOFT, fontFamily: "'Manrope', sans-serif" } as const;
  const widget = 'mt-5 rounded-xl border p-4';
  const widgetStyle = { borderColor: '#EEF0F4', background: '#FBFBFC' } as const;

  return (
    <section className="bg-[#FAFBFD] py-16 sm:py-20 lg:py-24" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-4xl text-center">
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] sm:text-[11px]"
            style={{ background: '#EEF2FB', color: TG_NAVY }}
          >
            Une méthode structurée • Des outils concrets • Une progression mesurable
          </span>
          <h2 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl"
            style={{
              backgroundImage: 'linear-gradient(90deg,#C0112E 0%,#E8742C 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
            }}>
            Tous les outils pour structurer votre progression aux EVC
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed sm:text-lg" style={{ color: TG_INK_SOFT, fontFamily: "'Manrope', sans-serif" }}>
            Chaque fonctionnalité a été conçue pour répondre à un objectif simple :
            vous aider à réviser avec méthode, gagner du temps et progresser efficacement jusqu’aux EVC.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {/* 1 — Visualisez votre progression */}
          <Reveal>
            <article className={cardCls} style={border}>
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: '#EAF1FB', color: '#1E40AF' }}><BarChart3 className="h-5 w-5" /></span>
                <h3 className={titleCls} style={{ color: TG_NAVY }}>Visualisez<br />votre progression</h3>
              </div>
              <p className={descCls} style={descStyle}>Suivez vos résultats par spécialité, thématique et type d’épreuve pour identifier rapidement vos priorités de révision.</p>
              <div className={widget} style={widgetStyle}>
                <p className="mb-2 text-[11px] font-bold" style={{ color: TG_NAVY }}>Spécialités</p>
                <div className="space-y-1.5">
                  <MiniBar label="Cardiologie" value={82} color="#2563EB" />
                  <MiniBar label="Dermatologie" value={67} color="#2563EB" />
                  <MiniBar label="Endocrinologie" value={58} color="#2563EB" />
                  <MiniBar label="Gastro-entérologie" value={74} color="#2563EB" />
                </div>
                <p className="mt-3 text-[11px] font-bold" style={{ color: '#16793C' }}>+18% <span className="font-medium text-[#9AA1AE]">sur 4 semaines</span></p>
              </div>
            </article>
          </Reveal>

          {/* 2 — Révisez ce qui compte vraiment */}
          <Reveal delay={0.05}>
            <article className={cardCls} style={border}>
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: '#E7F6EC', color: '#16793C' }}><Target className="h-5 w-5" /></span>
                <h3 className={titleCls} style={{ color: TG_NAVY }}>Révisez ce qui compte<br />vraiment</h3>
              </div>
              <p className={descCls} style={descStyle}>Des recommandations et parcours de travail adaptés à votre niveau pour concentrer vos efforts là où ils auront le plus d’impact.</p>
              <div className={widget} style={widgetStyle}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-[#9AA1AE]">Votre priorité actuelle</span>
                  <span className="rounded-full bg-[#E7F6EC] px-2 py-0.5 text-[10px] font-bold text-[#16793C]">Priorité haute</span>
                </div>
                <p className="mt-1 text-sm font-bold" style={{ color: TG_NAVY }}>Physiopathologie cardiovasculaire</p>
                <p className="mt-2 text-[11px] text-[#9AA1AE]">Plan recommandé</p>
                <p className="text-[12px] font-semibold" style={{ color: TG_NAVY }}>12 dossiers · 45 QCM · 2 fiches</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#EAECF2]"><span className="block h-full rounded-full" style={{ width: '66%', background: '#16793C' }} /></span>
                  <span className="text-[11px] font-bold tabular-nums" style={{ color: TG_NAVY }}>66%</span>
                </div>
              </div>
            </article>
          </Reveal>

          {/* 3 — Mesurez vos performances */}
          <Reveal delay={0.1}>
            <article className={cardCls} style={border}>
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: '#F1E8FD', color: '#6D28D9' }}><LineChart className="h-5 w-5" /></span>
                <h3 className={titleCls} style={{ color: TG_NAVY }}>Mesurez<br />vos performances</h3>
              </div>
              <p className={descCls} style={descStyle}>Analysez votre évolution au fil du temps et repérez les notions qui nécessitent un renforcement.</p>
              <div className={widget + ' grid grid-cols-3 gap-2'} style={widgetStyle}>
                {[
                  { l: 'Score moyen', v: '76%', s: '+8%', sub: 'vs semaine dernière', g: true },
                  { l: 'Percentile', v: '78ᵉ', s: '+12', sub: 'vs semaine dernière', g: true },
                  { l: 'Points à renforcer', v: '14', s: '', sub: 'thématiques identifiées', g: false },
                ].map((k) => (
                  <div key={k.l}>
                    <p className="text-[10px] leading-tight text-[#9AA1AE]">{k.l}</p>
                    <p className="mt-1 text-lg font-black" style={{ color: TG_NAVY }}>{k.v}</p>
                    {k.s && <p className="text-[10px] font-bold text-[#16793C]">{k.s}</p>}
                    <p className="text-[9px] leading-tight text-[#9AA1AE]">{k.sub}</p>
                  </div>
                ))}
              </div>
            </article>
          </Reveal>

          {/* 4 — Entraînez-vous efficacement */}
          <Reveal delay={0.15}>
            <article className={cardCls} style={border}>
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: '#FFEAD9', color: '#B45B00' }}><Brain className="h-5 w-5" /></span>
                <h3 className={titleCls} style={{ color: TG_NAVY }}>Entraînez-vous<br />efficacement</h3>
              </div>
              <p className={descCls} style={descStyle}>QCM, flashcards, dossiers progressifs, annales et ressources pédagogiques organisés pour favoriser une progression régulière.</p>
              <div className={widget + ' flex flex-wrap gap-2'} style={widgetStyle}>
                {[
                  { Icon: ListChecks, l: 'QCM', c: '#B45B00', bg: '#FFEAD9' },
                  { Icon: Layers3, l: 'Flashcards', c: '#B45B00', bg: '#FFF3E2' },
                  { Icon: Folder, l: 'Dossiers', c: '#1E40AF', bg: '#EAF1FB' },
                  { Icon: FileText, l: 'Annales', c: '#6D28D9', bg: '#F1E8FD' },
                  { Icon: FileText, l: 'Fiches', c: '#16793C', bg: '#E7F6EC' },
                ].map((t) => (
                  <span key={t.l} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-bold" style={{ background: t.bg, color: t.c }}>
                    <t.Icon className="h-3.5 w-3.5" />{t.l}
                  </span>
                ))}
              </div>
            </article>
          </Reveal>

          {/* 5 — Organisez vos révisions */}
          <Reveal delay={0.2}>
            <article className={cardCls} style={border}>
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: '#EAF1FB', color: '#1E40AF' }}><CalendarDays className="h-5 w-5" /></span>
                <h3 className={titleCls} style={{ color: TG_NAVY }}>Organisez<br />vos révisions</h3>
              </div>
              <p className={descCls} style={descStyle}>Structurez votre préparation grâce à des objectifs de travail, un calendrier clair et un suivi de vos avancées.</p>
              <div className={widget} style={widgetStyle}>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {[
                    { d: 'Lun', a: 'QCM', t: '30 min', c: '#1E40AF' },
                    { d: 'Mar', a: 'Dossier', t: '45 min', c: '#16793C' },
                    { d: 'Mer', a: 'Fiche', t: '30 min', c: '#6D28D9' },
                    { d: 'Jeu', a: 'Annales', t: '1h', c: '#B45B00' },
                    { d: 'Ven', a: 'QCM', t: '30 min', c: '#1E40AF' },
                    { d: 'Sam', a: '–', t: '', c: '#9AA1AE' },
                    { d: 'Dim', a: '–', t: '', c: '#9AA1AE' },
                  ].map((x) => (
                    <div key={x.d}>
                      <p className="text-[9px] text-[#9AA1AE]">{x.d}</p>
                      <div className="mt-1 rounded-md py-1.5" style={{ background: x.a === '–' ? 'transparent' : '#F4F6FA' }}>
                        <p className="text-[9px] font-bold leading-tight" style={{ color: x.c }}>{x.a}</p>
                        {x.t && <p className="text-[8px] text-[#9AA1AE]">{x.t}</p>}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[10px] text-[#9AA1AE]">Objectif hebdomadaire</span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#EAECF2]"><span className="block h-full rounded-full" style={{ width: '72%', background: '#2563EB' }} /></span>
                  <span className="text-[11px] font-bold tabular-nums" style={{ color: TG_NAVY }}>72%</span>
                </div>
              </div>
            </article>
          </Reveal>

          {/* 6 — Bénéficiez d'un accompagnement */}
          <Reveal delay={0.25}>
            <article className={cardCls} style={border}>
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: '#FCEAEC', color: '#C0112E' }}><Users className="h-5 w-5" /></span>
                <h3 className={titleCls} style={{ color: TG_NAVY }}>Bénéficiez d’un<br />accompagnement<br />pédagogique</h3>
              </div>
              <p className={descCls} style={descStyle}>Webinars, événements pédagogiques et échanges avec notre équipe pour vous accompagner tout au long de votre préparation.</p>
              <div className={widget + ' grid grid-cols-4 gap-2 text-center'} style={widgetStyle}>
                {[
                  { Icon: Radio, l: 'Webinars en direct' },
                  { Icon: CalendarDays, l: 'Événements pédagogiques' },
                  { Icon: UserCheck, l: 'Experts à vos côtés' },
                  { Icon: MessageCircle, l: 'Réponses à vos questions' },
                ].map((x) => (
                  <div key={x.l} className="flex flex-col items-center gap-1">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: '#FCEAEC', color: '#C0112E' }}><x.Icon className="h-4 w-4" /></span>
                    <p className="text-[9px] leading-tight text-[#6B7280]">{x.l}</p>
                  </div>
                ))}
              </div>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   12. TestimonialsTextSection — « Ils ont préparé les EVC avec Major ECN »
   ============================================================ */
const TT_BURGUNDY = '#6B1A2A';
const TT_RED = '#A91D2C';
const TT_PINK_BG = '#FCEAEC';
const TT_INK_SOFT = '#5B6478';
const TT_NAVY = '#14254E';

const TT_CARDS = [
  {
    Icon: Stethoscope,
    spec: 'Médecine Générale',
    tint: '#FCEAEC',
    accent: TT_RED,
    quote: 'Les cours sont complets, les QCM très proches de l’examen et les dossiers corrigés en profondeur. J’ai gagné en confiance et progressé tout au long de l’année.',
    name: 'Dr Sandrine Linda SA’A TALLA',
    country: 'Cameroun',
    flag: '🇨🇲',
    year: 'EVC 2022',
    initials: 'SS',
  },
  {
    Icon: Activity,
    spec: 'Radiologie',
    tint: '#F1E8FD',
    accent: '#6D28D9',
    quote: 'Les fiches étaient claires, les dossiers bien construits et plusieurs cas étudiés sont tombés le jour J. Je recommande vivement Major ECN.',
    name: 'Dr Samy KABAWEH',
    country: 'Tunisie',
    flag: '🇹🇳',
    year: 'EVC 2022',
    initials: 'SK',
  },
  {
    Icon: Brain,
    spec: 'Psychiatrie',
    tint: '#E7F6EC',
    accent: '#16793C',
    quote: 'La formation m’a permis de progresser en méthodologie, rapidité et confiance en moi. Un accompagnement précieux jusqu’aux EVC.',
    name: 'Dr A. C.',
    country: 'Brésil',
    flag: '🇧🇷',
    year: 'EVC 2021',
    initials: 'AC',
  },
];

/* ============================================================
   TOOLS-FOR-PROGRESS Section — « Tous les outils pour structurer
   votre progression aux EVC ». 6 cartes, accent bleu.
   ============================================================ */
const TOOLS_BLUE = '#2563EB';
const TOOLS_INK = '#0F172A';
const TOOLS_INK_SOFT = '#52607A';
const TOOLS_BORDER = '#E5E9F0';

function ToolCard({
  iconBg, iconFg, Icon, title, desc, children,
}: {
  iconBg: string; iconFg: string; Icon: typeof Target;
  title: string; desc: string; children: React.ReactNode;
}) {
  return (
    <Reveal>
      <div className="flex flex-col rounded-2xl border bg-white p-6 sm:p-7 transition-shadow hover:shadow-[0_18px_44px_-26px_rgba(15,23,42,0.18)]"
        style={{ borderColor: TOOLS_BORDER }}>
      <header className="flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
          style={{ background: iconBg, color: iconFg }}>
          <Icon className="h-7 w-7" />
        </span>
        <div className="min-w-0">
          <h3 className="text-[19px] font-extrabold leading-tight" style={{ color: TOOLS_INK }}>
            {title}
          </h3>
          <span className="mt-2 block h-0.5 w-10 rounded-full" style={{ background: iconFg }} />
        </div>
      </header>
      <p className="mt-4 text-[14.5px] leading-relaxed" style={{ color: TOOLS_INK_SOFT }}>
        {desc}
      </p>
      <div className="mt-5">{children}</div>
      </div>
    </Reveal>
  );
}

export function ToolsForProgressSection() {
  return (
    <section
      className="relative bg-white py-16 sm:py-20 lg:py-24"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Eyebrow */}
        <Reveal className="text-center">
          <p
            className="text-[11px] font-extrabold uppercase tracking-[0.2em]"
            style={{ color: TOOLS_INK_SOFT }}
          >
            <span style={{ color: TOOLS_INK }}>Une méthode structurée</span>
            <span className="mx-2" aria-hidden>•</span>
            <span style={{ color: TOOLS_INK }}>Des outils concrets</span>
            <span className="mx-2" aria-hidden>•</span>
            <span style={{ color: TOOLS_INK }}>Une progression mesurable</span>
          </p>
          <h2
            className="mx-auto mt-5 max-w-4xl text-4xl font-black leading-[1.1] tracking-tight sm:text-5xl"
            style={{
              backgroundImage:
                'linear-gradient(90deg, #0F1F4D 0%, #1E3A8A 30%, #2563EB 60%, #4F46E5 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
            }}
          >
            Tous les outils pour structurer<br className="hidden sm:inline" />
            {' '}votre progression aux EVC
          </h2>
          <p
            className="mx-auto mt-5 max-w-3xl text-base leading-relaxed sm:text-[17px]"
            style={{ color: TOOLS_INK_SOFT, fontFamily: "'Manrope', sans-serif" }}
          >
            Chaque fonctionnalité a été conçue pour répondre à un objectif simple :
            vous aider à réviser avec méthode, gagner du temps et progresser efficacement
            jusqu&rsquo;aux EVC.
          </p>
        </Reveal>

        {/* Grille 6 cartes */}
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {/* 1. Visualisez votre progression */}
          <ToolCard
            Icon={BarChart3}
            iconBg="#E0EBFF" iconFg="#2563EB"
            title="Visualisez votre progression"
            desc="Suivez vos résultats par spécialité, thématique et type d'épreuve pour identifier rapidement vos priorités de révision."
          >
            <div className="grid gap-3 rounded-xl border bg-[#F8FAFC] p-3.5" style={{ borderColor: TOOLS_BORDER }}>
              <div>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: TOOLS_INK_SOFT }}>
                  Spécialités
                </p>
                <ul className="space-y-1.5">
                  {[
                    { l: 'Cardiologie', v: 82 },
                    { l: 'Dermatologie', v: 67 },
                    { l: 'Endocrinologie', v: 58 },
                    { l: 'Gastro-entérologie', v: 74 },
                  ].map((row) => (
                    <li key={row.l} className="flex items-center gap-2 text-[11px]">
                      <span className="w-[110px] truncate" style={{ color: TOOLS_INK }}>{row.l}</span>
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#E2E8F0]">
                        <span className="block h-full rounded-full" style={{ width: `${row.v}%`, background: '#2563EB' }} />
                      </span>
                      <span className="w-8 text-right text-[11px] font-bold tabular-nums" style={{ color: TOOLS_INK }}>
                        {row.v}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg bg-white p-2.5" style={{ border: `1px solid ${TOOLS_BORDER}` }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: TOOLS_INK_SOFT }}>
                  Évolution
                </p>
                <div className="mt-1.5 flex items-end gap-1.5 h-9">
                  {[40, 52, 48, 58, 65, 72].map((h, i) => (
                    <span key={i} className="w-2 rounded-sm" style={{ height: `${h}%`, background: '#3B82F6' }} />
                  ))}
                </div>
                <p className="mt-1.5 text-[11px] font-bold" style={{ color: '#16A34A' }}>
                  +18% <span className="font-normal" style={{ color: TOOLS_INK_SOFT }}>sur 4 semaines</span>
                </p>
              </div>
            </div>
          </ToolCard>

          {/* 2. Révisez ce qui compte vraiment */}
          <ToolCard
            Icon={Target}
            iconBg="#DCFCE7" iconFg="#16A34A"
            title="Révisez ce qui compte vraiment"
            desc="Des recommandations et parcours de travail adaptés à votre niveau pour concentrer vos efforts là où ils auront le plus d'impact."
          >
            <div className="rounded-xl border bg-[#F0FDF4] p-3.5" style={{ borderColor: '#BBF7D0' }}>
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: TOOLS_INK_SOFT }}>
                Votre priorité actuelle
              </p>
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <p className="text-[13px] font-bold" style={{ color: TOOLS_INK }}>
                  Physiopathologie cardiovasculaire
                </p>
                <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{ background: '#DCFCE7', color: '#16A34A' }}>
                  Priorité haute
                </span>
              </div>
              <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: TOOLS_INK_SOFT }}>
                Plan recommandé
              </p>
              <p className="mt-1 text-[12px]" style={{ color: TOOLS_INK }}>
                <span className="font-bold">12</span> dossiers ·{' '}
                <span className="font-bold">45</span> QCM ·{' '}
                <span className="font-bold">2</span> fiches
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#DCFCE7]">
                  <span className="block h-full w-[66%] rounded-full" style={{ background: '#16A34A' }} />
                </span>
                <span className="w-8 text-right text-[11px] font-bold tabular-nums" style={{ color: '#16A34A' }}>
                  66%
                </span>
              </div>
            </div>
          </ToolCard>

          {/* 3. Mesurez vos performances */}
          <ToolCard
            Icon={LineChart}
            iconBg="#F3E8FF" iconFg="#9333EA"
            title="Mesurez vos performances"
            desc="Analysez votre évolution au fil du temps et repérez les notions qui nécessitent un renforcement."
          >
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { l: 'Score moyen',      v: '76%', d: '+8%', dc: '#16A34A' },
                { l: 'Percentile',       v: '78ᵉ', d: '+12', dc: '#16A34A' },
                { l: 'Points à renforcer', v: '14', d: 'thématiques identifiées', dc: TOOLS_INK_SOFT, small: true },
              ].map((s) => (
                <div key={s.l} className="rounded-lg border bg-[#FAF5FF] p-2.5 text-center" style={{ borderColor: '#E9D5FF' }}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: TOOLS_INK_SOFT }}>
                    {s.l}
                  </p>
                  <p className="mt-1 text-xl font-black tabular-nums" style={{ color: TOOLS_INK }}>{s.v}</p>
                  <p className={'mt-1 leading-tight ' + (s.small ? 'text-[9px]' : 'text-[11px] font-bold')}
                    style={{ color: s.dc }}>
                    {s.d}
                  </p>
                  {!s.small && <p className="text-[9px]" style={{ color: TOOLS_INK_SOFT }}>vs semaine dernière</p>}
                </div>
              ))}
            </div>
          </ToolCard>

          {/* 4. Entraînez-vous efficacement */}
          <ToolCard
            Icon={Brain}
            iconBg="#FFEDD5" iconFg="#EA580C"
            title="Entraînez-vous efficacement"
            desc="QCM, flashcards, dossiers progressifs, annales et ressources pédagogiques organisés pour favoriser une progression régulière."
          >
            <div className="flex flex-wrap gap-2">
              {[
                { L: ListChecks, n: 'QCM',        bg: '#FFEDD5', fg: '#EA580C' },
                { L: Layers3,    n: 'Flashcards', bg: '#FEF3C7', fg: '#D97706' },
                { L: Folder,     n: 'Dossiers',   bg: '#EDE9FE', fg: '#7C3AED' },
                { L: FileText,   n: 'Annales',    bg: '#DBEAFE', fg: '#2563EB' },
                { L: BookOpen,   n: 'Fiches',     bg: '#DCFCE7', fg: '#16A34A' },
              ].map((c) => (
                <span key={c.n}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold"
                  style={{ background: c.bg, color: c.fg }}>
                  <c.L className="h-3.5 w-3.5" />
                  {c.n}
                </span>
              ))}
            </div>
          </ToolCard>

          {/* 5. Organisez vos révisions */}
          <ToolCard
            Icon={CalendarCheck}
            iconBg="#DBEAFE" iconFg="#2563EB"
            title="Organisez vos révisions"
            desc="Structurez votre préparation grâce à des objectifs de travail, un calendrier clair et un suivi de vos avancées."
          >
            <div className="rounded-xl border bg-[#F8FAFC] p-3" style={{ borderColor: TOOLS_BORDER }}>
              <div className="grid grid-cols-7 gap-1.5 text-center">
                {[
                  { d: 'Lun', t: 'QCM', dur: '30 min',  bg: '#DBEAFE', fg: '#1E40AF' },
                  { d: 'Mar', t: 'Dossier', dur: '45 min', bg: '#FEF3C7', fg: '#A16207' },
                  { d: 'Mer', t: 'Fiche', dur: '30 min', bg: '#DCFCE7', fg: '#15803D' },
                  { d: 'Jeu', t: 'Annales', dur: '1h',  bg: '#FFE4E6', fg: '#BE123C' },
                  { d: 'Ven', t: 'QCM', dur: '30 min',  bg: '#DBEAFE', fg: '#1E40AF' },
                  { d: 'Sam', t: '—',  dur: '',        bg: '#F1F5F9', fg: '#94A3B8' },
                  { d: 'Dim', t: '—',  dur: '',        bg: '#F1F5F9', fg: '#94A3B8' },
                ].map((c) => (
                  <div key={c.d} className="overflow-hidden rounded-md" style={{ background: c.bg }}>
                    <p className="px-1 pt-1 text-[9px] font-bold uppercase tracking-wider" style={{ color: c.fg }}>
                      {c.d}
                    </p>
                    <p className="px-1 text-[10px] font-bold" style={{ color: c.fg }}>{c.t}</p>
                    <p className="px-1 pb-1.5 text-[9px]" style={{ color: c.fg, opacity: 0.85 }}>{c.dur || ' '}</p>
                  </div>
                ))}
              </div>
              <div className="mt-2.5 flex items-center gap-2">
                <span className="text-[10px] font-semibold" style={{ color: TOOLS_INK_SOFT }}>Objectif hebdomadaire</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#E2E8F0]">
                  <span className="block h-full w-[72%] rounded-full" style={{ background: '#2563EB' }} />
                </span>
                <span className="text-[11px] font-bold tabular-nums" style={{ color: '#2563EB' }}>72%</span>
              </div>
            </div>
          </ToolCard>

          {/* 6. Bénéficiez d'un accompagnement pédagogique */}
          <ToolCard
            Icon={Users}
            iconBg="#FCE7F3" iconFg="#DB2777"
            title="Bénéficiez d'un accompagnement pédagogique"
            desc="Webinars, événements pédagogiques et échanges avec notre équipe pour vous accompagner tout au long de votre préparation."
          >
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { L: Radio,         n: 'Webinars',    s: 'en direct' },
                { L: CalendarDays,  n: 'Événements',  s: 'pédagogiques' },
                { L: UserCheck,     n: 'Experts',     s: 'à vos côtés' },
                { L: MessageCircle, n: 'Réponses à',  s: 'vos questions' },
              ].map((c) => (
                <div key={c.n} className="rounded-lg p-2.5 text-center" style={{ background: '#FDF2F8' }}>
                  <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full"
                    style={{ background: '#FCE7F3', color: '#DB2777' }}>
                    <c.L className="h-4 w-4" />
                  </span>
                  <p className="mt-1.5 text-[10px] font-bold" style={{ color: TOOLS_INK }}>{c.n}</p>
                  <p className="text-[10px]" style={{ color: TOOLS_INK_SOFT }}>{c.s}</p>
                </div>
              ))}
            </div>
          </ToolCard>
        </div>
      </div>
    </section>
  );
}

export function TestimonialsTextSection() {
  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-4xl text-center">
          <span
            className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em]"
            style={{ background: TT_PINK_BG, borderColor: 'rgba(169,29,44,0.2)', color: TT_RED }}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Témoignages de candidats EVC
          </span>
          <h2 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl">
            <span style={{ backgroundImage: "linear-gradient(90deg, #C0112E 0%, #BE185D 50%, #7C3AED 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", color: "transparent" }}>Ils ont préparé les EVC avec </span>
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(90deg, ${TT_BURGUNDY} 0%, ${TT_RED} 50%, #E8742C 100%)` }}
            >
              Major ECN
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed sm:text-lg" style={{ color: TT_INK_SOFT, fontFamily: "'Manrope', sans-serif" }}>
            Découvrez comment des médecins de différentes spécialités ont préparé les EVC avec Major ECN.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TT_CARDS.map((c, i) => (
            <Reveal key={c.name} delay={i * 0.06}>
              <article className="flex h-full flex-col rounded-2xl border bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-xl" style={{ borderColor: '#ECECEF' }}>
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: c.tint, color: c.accent }}>
                    <c.Icon className="h-6 w-6" />
                  </span>
                  <h3 className="text-lg font-extrabold" style={{ color: TT_NAVY }}>{c.spec}</h3>
                </div>
                <span className="mt-3 block h-[3px] w-10 rounded-full" style={{ background: c.accent }} />
                <div className="mt-5 flex-1">
                  <Quote className="h-7 w-7" style={{ color: c.accent }} fill="currentColor" />
                  <p className="mt-3 text-[15px] leading-relaxed" style={{ color: TT_NAVY, fontFamily: "'Manrope', sans-serif" }}>
                    {c.quote}
                  </p>
                </div>
                <div className="mt-6 border-t pt-4" style={{ borderColor: '#ECECEF' }}>
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-white"
                      style={{ background: `linear-gradient(135deg, ${TT_BURGUNDY}, ${TT_RED})` }}
                      aria-hidden
                    >
                      {c.initials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-extrabold leading-tight" style={{ color: TT_NAVY }}>{c.name}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs" style={{ color: TT_INK_SOFT }}>
                        <span aria-hidden>{c.flag}</span> {c.country}
                      </p>
                    </div>
                    <span className="rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ background: c.tint, color: c.accent }}>
                      {c.year}
                    </span>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2} className="mt-10 flex flex-col items-center gap-3">
          <Link
            href="/temoignages"
            className="inline-flex items-center gap-3 rounded-2xl px-7 py-3.5 text-sm font-extrabold text-white shadow-[0_10px_30px_-10px_rgba(169,29,44,0.6)] transition-transform hover:scale-[1.02]"
            style={{ background: `linear-gradient(90deg, ${TT_BURGUNDY} 0%, ${TT_RED} 100%)` }}
          >
            Voir tous les témoignages
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="flex items-center gap-2 text-xs" style={{ color: TT_INK_SOFT }}>
            <ShieldCheck className="h-3.5 w-3.5" style={{ color: TT_RED }} />
            Témoignages authentiques de médecins ayant préparé les EVC avec Major ECN.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   13. TestimonialsVideoSection — « Ils racontent leur expérience »
   ============================================================ */
const TV_BURGUNDY = '#6B1A2A';
const TV_RED = '#A91D2C';
const TV_PINK_BG = '#FCEAEC';
const TV_INK_SOFT = '#5B6478';
const TV_NAVY = '#14254E';

const TV_CARDS = [
  {
    spec: 'Médecine générale',
    accent: TV_RED,
    name: 'Dr Sandrine Linda SA’A TALLA',
    country: 'Cameroun',
    flag: '🇨🇲',
    year: 'EVC 2022',
    duration: '2:45',
    quote: 'Les QCM et les dossiers m’ont permis de progresser tout au long de l’année.',
    bgGrad: 'linear-gradient(135deg, #6B1A2A 0%, #A91D2C 60%, #E8742C 100%)',
    initials: 'SS',
  },
  {
    spec: 'Radiologie',
    accent: TV_RED,
    name: 'Dr Samy KABAWEH',
    country: 'Tunisie',
    flag: '🇹🇳',
    year: 'EVC 2022',
    duration: '2:38',
    quote: 'Les fiches étaient claires et plusieurs cas du jour J ressemblaient à nos entraînements.',
    bgGrad: 'linear-gradient(135deg, #14254E 0%, #6D28D9 50%, #A91D2C 100%)',
    initials: 'SK',
  },
  {
    spec: 'Psychiatrie',
    accent: TV_RED,
    name: 'Dr A. C.',
    country: 'Brésil',
    flag: '🇧🇷',
    year: 'EVC 2021',
    duration: '2:57',
    quote: 'La préparation m’a apporté méthode, confiance et sérénité jusqu’au jour J.',
    bgGrad: 'linear-gradient(135deg, #16793C 0%, #6B1A2A 60%, #A91D2C 100%)',
    initials: 'AC',
  },
];

export function TestimonialsVideoSection() {
  return (
    <section className="bg-[#FBFBFD] py-16 sm:py-20 lg:py-24" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-4xl text-center">
          <span
            className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em]"
            style={{ background: TV_PINK_BG, borderColor: 'rgba(169,29,44,0.2)', color: TV_RED }}
          >
            <Video className="h-3.5 w-3.5" />
            Témoignages vidéo
          </span>
          <h2 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl">
            <span style={{ backgroundImage: "linear-gradient(90deg, #6B1A2A 0%, #C0112E 50%, #E8742C 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", color: "transparent" }}>Ils racontent leur </span>
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(90deg, ${TV_BURGUNDY} 0%, ${TV_RED} 50%, #E8742C 100%)` }}
            >
              expérience
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed sm:text-lg" style={{ color: TV_INK_SOFT, fontFamily: "'Manrope', sans-serif" }}>
            Découvrez les témoignages vidéo de médecins ayant préparé les EVC avec Major ECN.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TV_CARDS.map((c, i) => (
            <Reveal key={c.name} delay={i * 0.06}>
              <article className="overflow-hidden rounded-2xl border bg-white transition-all hover:-translate-y-1 hover:shadow-xl" style={{ borderColor: '#ECECEF' }}>
                {/* Thumbnail vidéo (placeholder dégradé — remplacer par <video> ou <Image> quand assets fournis) */}
                <button
                  type="button"
                  aria-label={`Lire le témoignage de ${c.name}`}
                  className="group relative block aspect-video w-full overflow-hidden"
                  style={{ background: c.bgGrad }}
                >
                  {/* avatar centré, façon portrait flou */}
                  <span
                    className="absolute inset-0 flex items-center justify-center text-5xl font-black text-white/15"
                    aria-hidden
                  >
                    {c.initials}
                  </span>
                  {/* bouton play */}
                  <span className="absolute inset-0 flex items-center justify-center" aria-hidden>
                    <span
                      className="flex h-16 w-16 items-center justify-center rounded-full text-white shadow-2xl backdrop-blur-sm transition-transform group-hover:scale-110"
                      style={{ background: `radial-gradient(circle at 30% 30%, ${TV_RED}, ${TV_BURGUNDY})` }}
                    >
                      <Play className="ml-1 h-7 w-7" fill="currentColor" />
                    </span>
                  </span>
                  {/* durée */}
                  <span className="absolute bottom-3 right-3 rounded-md bg-black/70 px-2 py-1 text-[11px] font-bold text-white">
                    {c.duration}
                  </span>
                </button>
                <div className="p-5">
                  <p className="text-base font-extrabold leading-tight" style={{ color: TV_NAVY }}>{c.name}</p>
                  <p className="mt-0.5 text-sm font-bold" style={{ color: TV_RED }}>{c.spec}</p>
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs" style={{ color: TV_INK_SOFT }}>
                    <span aria-hidden>{c.flag}</span> {c.country} • {c.year}
                  </p>
                  <div className="mt-4 border-t pt-3" style={{ borderColor: '#ECECEF' }}>
                    <p className="flex items-start gap-1.5 text-sm italic leading-relaxed" style={{ color: TV_INK_SOFT, fontFamily: "'Manrope', sans-serif" }}>
                      <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: TV_RED }} fill="currentColor" />
                      <span>{c.quote}</span>
                    </p>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2} className="mt-10 flex flex-col items-center gap-3">
          <Link
            href="/temoignages"
            className="inline-flex items-center gap-3 rounded-2xl px-7 py-3.5 text-sm font-extrabold text-white shadow-[0_10px_30px_-10px_rgba(169,29,44,0.6)] transition-transform hover:scale-[1.02]"
            style={{ background: `linear-gradient(90deg, ${TV_BURGUNDY} 0%, ${TV_RED} 100%)` }}
          >
            Voir tous les témoignages
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="flex items-center gap-2 text-xs" style={{ color: TV_INK_SOFT }}>
            <ShieldCheck className="h-3.5 w-3.5" style={{ color: TV_RED }} />
            Témoignages authentiques de médecins ayant préparé les EVC avec Major ECN.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   14. FeaturedTestimonialsSection — témoignages longs « Lauréats »
   ============================================================ */
const FT_NAVY = '#14254E';
const FT_BURGUNDY = '#6B1A2A';
const FT_RED = '#A91D2C';
const FT_RED_DEEP = '#7A1320';
const FT_INK = '#1F2937';
const FT_INK_SOFT = '#4B5563';
const FT_PINK_BG = '#FCEAEC';

type FeaturedTestimony = {
  /** Slug photo dans /public/temoignages/<slug>.jpg (à déposer à part) */
  slug: string;
  initials: string;
  name: string;
  title: string;
  spec: string;
  paragraphs: string[];
};

const FEATURED: FeaturedTestimony[] = [
  {
    slug: 'dr-amelie-lamure',
    initials: 'AL',
    name: 'Dr Amélie Lamure',
    title: 'Lauréate des EVC',
    spec: 'Anesthésie-Réanimation',
    paragraphs: [
      'Quand j’ai commencé à préparer les EVC, je me suis vite rendu compte que la difficulté ne venait pas seulement du concours lui-même. Il fallait aussi réussir à tenir dans la durée, garder sa motivation, gérer les moments de doute et continuer à avancer malgré la fatigue et les contraintes du quotidien.',
      'Avant de rejoindre Major ECN, j’avais souvent l’impression d’être seule face à cette montagne. Je travaillais, je révisais, mais je me demandais constamment si j’étais dans la bonne direction, si je ne passais pas à côté de l’essentiel ou si ma façon de travailler était vraiment adaptée aux attentes des EVC.',
      'Ce que Major ECN m’a apporté, c’est d’abord ce sentiment de ne plus être seule. J’ai trouvé une équipe présente, disponible et impliquée, qui connaissait parfaitement les exigences du concours et qui nous accompagnait à chaque étape de la préparation. J’avais le sentiment d’avoir de véritables partenaires à mes côtés, et cela a été extrêmement précieux tout au long de cette année.',
      'Bien sûr, la qualité des cours a énormément compté. Les contenus étaient complets, structurés et orientés vers ce qu’il fallait réellement maîtriser pour les épreuves. Les cas cliniques, les examens blancs et les séances de méthodologie m’ont permis de comprendre ce qui était attendu le jour J et d’aborder progressivement le concours avec davantage de confiance.',
      'Mais ce dont je me souviendrai le plus, c’est de l’accompagnement humain. Dans les moments où l’on doute, où l’on se sent dépassé par la charge de travail ou lorsque l’on se pose mille questions sur sa préparation, savoir que l’on peut compter sur une équipe réactive et bienveillante fait une vraie différence.',
      'La réussite aux EVC demande beaucoup de travail personnel, personne ne peut faire ce travail à votre place. En revanche, être guidé, encouragé et accompagné tout au long du parcours permet d’avancer beaucoup plus sereinement et efficacement.',
      'Aujourd’hui, après avoir réussi les EVC d’Anesthésie-Réanimation, je tiens à remercier sincèrement toute l’équipe de Major ECN. Leur accompagnement, leur disponibilité et leur engagement ont compté bien au-delà du simple enseignement. Ils ont été présents pendant toute cette préparation, et je leur en suis profondément reconnaissante.',
    ],
  },
  {
    slug: 'dr-haykel-abdelbaki',
    initials: 'HA',
    name: 'Dr Haykel Abdelbaki',
    title: 'Lauréat des EVC',
    spec: 'Radiologie',
    paragraphs: [
      'J’ai réussi les EVC de radiologie et Major ECN a largement contribué à cette réussite.',
      'Ce que j’ai particulièrement apprécié, c’est le sérieux et la qualité de l’organisation. Les cours sont actualisés, clairs et réellement adaptés aux exigences du concours. Le planning est respecté, ce qui permet d’avancer sereinement tout au long de la préparation.',
      'L’équipe pédagogique est un véritable point fort. Les enseignants sont disponibles, à l’écoute et prennent le temps d’identifier les difficultés de chaque candidat afin de l’aider à progresser efficacement.',
      'Les épreuves blanches organisées dans des conditions proches de l’examen permettent de se préparer concrètement au jour J et d’évaluer son niveau de manière réaliste. Les annales corrigées avec les grilles officielles et les mots-clés attendus sont également d’une grande aide pour comprendre ce qui est réellement attendu par les jurys.',
      'Au-delà des supports et des enseignements, j’ai trouvé chez Major ECN un cadre de travail structuré et rassurant qui m’a permis d’aborder les épreuves avec davantage de confiance.',
      'Je recommande cette préparation à tous les candidats qui souhaitent mettre toutes les chances de leur côté pour réussir les EVC.',
    ],
  },
];

/** Carte photo ronde 256px avec halo dégradé burgundy + fallback initiales si l'image
 *  n'est pas encore présente dans /public/temoignages/. */
function FeaturedAvatar({ slug, initials }: { slug: string; initials: string }) {
  return (
    <div className="relative mx-auto" style={{ width: 'min(280px, 100%)', aspectRatio: '1 / 1' }}>
      {/* halo dégradé décoratif */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 rounded-full blur-2xl opacity-60"
        style={{ background: `radial-gradient(circle at 30% 30%, ${FT_RED}, ${FT_BURGUNDY} 60%, transparent 75%)` }}
      />
      {/* anneau accent */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{ background: `linear-gradient(135deg, ${FT_BURGUNDY}, ${FT_RED}, #E8742C)`, padding: '4px' }}
      >
        <div className="h-full w-full rounded-full bg-white" />
      </div>
      {/* photo (ou initiales si fichier absent) */}
      <div className="absolute inset-1 overflow-hidden rounded-full bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/temoignages/${slug}.jpg`}
          alt=""
          className="h-full w-full object-cover"
          onError={(e) => {
            const img = e.currentTarget;
            img.style.display = 'none';
            const sib = img.nextElementSibling as HTMLElement | null;
            if (sib) sib.style.display = 'flex';
          }}
        />
        <span
          aria-hidden
          className="hidden h-full w-full items-center justify-center text-5xl font-black text-white"
          style={{ background: `linear-gradient(135deg, ${FT_BURGUNDY}, ${FT_RED})` }}
        >
          {initials}
        </span>
      </div>
    </div>
  );
}

export function FeaturedTestimonialsSection() {
  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* halos décoratifs discrets */}
      <div aria-hidden className="pointer-events-none absolute -left-40 top-40 -z-10 h-96 w-96 rounded-full bg-[#A91D2C]/5 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-40 bottom-40 -z-10 h-96 w-96 rounded-full bg-[#6B1A2A]/5 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <Reveal className="mx-auto max-w-3xl text-center">
          <span
            className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em]"
            style={{ background: FT_PINK_BG, borderColor: 'rgba(169,29,44,0.2)', color: FT_RED }}
          >
            <Trophy className="h-3.5 w-3.5" />
            Témoignages de lauréats
          </span>
          <h2 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl">
            <span style={{ color: FT_NAVY }}>Leur histoire,</span>{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(90deg, ${FT_BURGUNDY} 0%, ${FT_RED} 50%, #E8742C 100%)` }}
            >
              leur réussite
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed sm:text-lg" style={{ color: FT_INK_SOFT, fontFamily: "'Manrope', sans-serif" }}>
            Des médecins qui ont préparé les EVC avec Major ECN racontent, sans filtre, leur parcours.
          </p>
        </Reveal>

        {/* Témoignages alternés gauche / droite */}
        <div className="mt-14 flex flex-col gap-12 lg:gap-16">
          {FEATURED.map((t, i) => {
            const reverse = i % 2 === 1;
            return (
              <Reveal key={t.slug} delay={i * 0.1}>
                <article
                  className={
                    'relative grid items-start gap-8 rounded-3xl border bg-white p-6 shadow-[0_30px_80px_-30px_rgba(15,27,61,0.18)] sm:p-8 lg:gap-12 lg:p-10 ' +
                    (reverse ? 'lg:grid-cols-[1.7fr_1fr]' : 'lg:grid-cols-[1fr_1.7fr]')
                  }
                  style={{ borderColor: '#ECECEF' }}
                >
                  {/* COLONNE PHOTO + signature */}
                  <aside
                    className={
                      'flex flex-col items-center gap-5 lg:sticky lg:top-24 ' + (reverse ? 'lg:order-2' : '')
                    }
                  >
                    <FeaturedAvatar slug={t.slug} initials={t.initials} />

                    <div className="text-center">
                      <p className="text-lg font-extrabold leading-tight" style={{ color: FT_NAVY }}>{t.name}</p>
                      <p className="mt-1 text-sm font-bold" style={{ color: FT_RED }}>{t.title}</p>
                      <span
                        className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
                        style={{ background: FT_PINK_BG, color: FT_RED }}
                      >
                        <Stethoscope className="h-3.5 w-3.5" />
                        {t.spec}
                      </span>
                    </div>
                  </aside>

                  {/* COLONNE TEXTE */}
                  <div className={'relative ' + (reverse ? 'lg:order-1' : '')}>
                    {/* Guillemet géant décoratif */}
                    <Quote
                      aria-hidden
                      className="absolute -left-2 -top-3 h-16 w-16 opacity-15 sm:h-20 sm:w-20"
                      style={{ color: FT_RED }}
                      fill="currentColor"
                    />
                    <div className="relative space-y-4 pl-2">
                      {t.paragraphs.map((p, idx) => (
                        <p
                          key={idx}
                          className={
                            (idx === 0
                              ? 'text-base font-medium leading-relaxed sm:text-lg'
                              : 'text-[15px] leading-relaxed') +
                            ' first-letter:font-black'
                          }
                          style={{
                            color: idx === 0 ? FT_INK : FT_INK_SOFT,
                            fontFamily: "'Manrope', sans-serif",
                          }}
                        >
                          {p}
                        </p>
                      ))}
                    </div>

                    {/* Signature en bas */}
                    <div className="mt-6 flex items-center justify-between gap-3 border-t pt-5" style={{ borderColor: '#ECECEF' }}>
                      <p className="text-sm font-bold italic" style={{ color: FT_BURGUNDY }}>
                        — {t.name}, lauréat·e des EVC {t.spec}
                      </p>
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                        style={{ background: FT_PINK_BG, color: FT_RED }}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Authentique
                      </span>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>

        {/* CTA en bas */}
      </div>
    </section>
  );
}

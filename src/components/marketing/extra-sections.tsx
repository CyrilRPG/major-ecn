'use client';
import Image from 'next/image';
/**
 * Sections additionnelles inspirées de la maquette designer (HeroIconic).
 * Reprennent le code couleur Manus (bordeaux + cream) déjà en place, restent
 * cohérentes avec les composants existants dans manus-sections.tsx.
 */
import {
  Activity, ArrowRight, Award, Baby, BarChart3, Bell, BookOpen, Brain, BrainCircuit, Calendar, CalendarCheck, CalendarDays,
  CalendarClock, Check, CheckCircle2, ClipboardCheck, ClipboardList, Clock, Compass, FileText, Folder, FolderOpen, GraduationCap, Heart, Lightbulb,
  Layers3, LineChart, ListChecks, MapPin, MessageCircle, Microscope, Pill, Play, Quote, Radio, Scissors, Settings, ShieldCheck,
  Smartphone, Sparkles, Smile, Stethoscope, Target, Trophy, TrendingUp, UserCheck, Users, Video, Zap, type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Reveal } from './reveal';

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
    title: 'Épreuves blanches',
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
  { Icon: CalendarClock, t: 'Épreuves blanches',      d: 'Épreuves blanches, conférences avec des experts EVC.',       tag: '1× par mois' },
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
  ['Gastro-entérologie', 'Hématologie', 'Oncologie', 'Médecine interne polyvalente', 'Rhumatologie'],
  ['Psychiatrie', 'Médecine physique et réadaptation', 'Maladies infectieuses'],
];

const FOOTER_BADGES = [
  { Icon: Users,        title: 'toutes les spécialités EVC couvertes',                desc: 'De la médecine générale aux spécialités les plus pointues.' },
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
            toutes les spécialités EVC couvertes
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
  { Icon: Calendar,    big: '15',    label: "ans d'experience",       sub: 'au service de votre reussite' },
  { Icon: Users,       big: '9 000+', label: 'medecins accompagnes',  sub: 'depuis 2011' },
  { Icon: Stethoscope, big: 'Toutes',    label: 'les spécialités couvertes',  sub: 'toutes les disciplines EVC' },
  { Icon: ShieldCheck, big: '35+',   label: 'enseignants',            sub: 'PH specialistes et CCA' },
];

/** Collage maquette : 4 bandes larges parallelo, N&B, decalees */
function TeamPhotoCollage() {
  const slices = [
    { src: "/team/enseignante-1.jpg", mt: 0 },
    { src: "/team/enseignant-2.jpg", mt: -20 },
    { src: "/team/enseignante-3.jpg", mt: 6 },
    { src: "/team/enseignant-4.png", mt: -14 },
  ];
  return (
    <div className="flex items-center justify-center">
      <div className="flex gap-0.5" style={{ height: "260px" }}>
        {slices.map((s, i) => (
          <div key={i} className="relative w-[70px] overflow-hidden"
            style={{ clipPath: "polygon(14% 0%, 100% 0%, 86% 100%, 0% 100%)", marginTop: `${s.mt}px` }}>
            <Image src={s.src} alt="" fill className="object-cover object-top"
              style={{ filter: "grayscale(100%) contrast(1.1)" }} sizes="70px" />
          </div>
        ))}
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
   9. EspaceDecouverteSection — pixel-perfect maquette designer
   « Découvrez la plateforme Major ECN » + CTA vers /espace-decouverte
   ============================================================ */
const ED_RED = "#C0112E";
const ED_NAVY = "#0F1F4D";
const ED_INK_SOFT = "#52607A";

const ED_FEATURES = [
  { Icon: ClipboardCheck, color: "#C0112E", bg: "#FDEEEF",
    bold: "10 QCM EVC",        rest: " avec correction détaillée" },
  { Icon: Stethoscope, color: "#2563EB", bg: "#E5F1FF",
    bold: "1 cas clinique",    rest: " corrigé et expliqué" },
  { Icon: FileText, color: "#16793C", bg: "#E7F6EC",
    bold: "1 fiche pédagogique", rest: " complète" },
  { Icon: Layers3, color: "#7C3AED", bg: "#F1E8FD",
    bold: "10 flashcards",      rest: " avec rappels de cours" },
  { Icon: TrendingUp, color: "#E8742C", bg: "#FFEAD9",
    bold: "Aperçu du suivi",    rest: " de progression" },
];

const ED_BOTTOM_STATS = [
  { Icon: GraduationCap, color: "#2563EB", bg: "#E5F1FF", t: "toutes les spécialités préparées" },
  { Icon: Calendar,      color: "#16793C", bg: "#E7F6EC", t: "Depuis 2011" },
  { Icon: Users,         color: "#7C3AED", bg: "#F1E8FD", t: "Plus de 9 000 médecins accompagnés" },
];

export function EspaceDecouverteSection() {
  return (
    <section id="espace-decouverte" className="bg-white py-16 sm:py-20 lg:py-24" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border bg-white p-6 shadow-sm sm:p-10 lg:p-14" style={{ borderColor: "#E5E9F0" }}>
          {/* Grille 2 col : image / contenu */}
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
            {/* Image laptop + phone */}
            <Reveal>
              <div className="relative">
                <img
                  src="/plateforme/espace-decouverte-mockup.png"
                  alt="Aperçu de la plateforme Major ECN — laptop & mobile"
                  className="w-full h-auto"
                />
              </div>
            </Reveal>

            {/* Contenu droite */}
            <Reveal delay={0.1}>
              <span
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-white"
                style={{ background: ED_RED }}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Espace découverte
              </span>

              <h2 className="mt-5 text-3xl font-black leading-[1.08] tracking-tight sm:text-4xl lg:text-[2.75rem]">
                <span style={{ color: ED_NAVY }}>Découvrez la plateforme</span>{" "}
                <span style={{ color: ED_RED }}>Major ECN</span>
              </h2>

              <p className="mt-4 max-w-lg text-base leading-relaxed sm:text-lg" style={{ color: ED_INK_SOFT }}>
                Accédez à un aperçu concret de notre environnement de travail
                et de nos ressources pédagogiques.
              </p>

              {/* 5 features */}
              <ul className="mt-7 space-y-1">
                {ED_FEATURES.map((f, i) => (
                  <li key={f.bold}>
                    <div className="flex items-center gap-4 py-3.5">
                      <span
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                        style={{ background: f.bg, color: f.color }}
                      >
                        <f.Icon className="h-5 w-5" />
                      </span>
                      <p className="text-[15px] sm:text-base" style={{ color: ED_NAVY }}>
                        <span className="font-extrabold">{f.bold}</span>
                        <span style={{ color: ED_INK_SOFT }}>{f.rest}</span>
                      </p>
                    </div>
                    {i < ED_FEATURES.length - 1 && (
                      <span className="block h-px w-full" style={{ background: "#EEF1F6" }} />
                    )}
                  </li>
                ))}
              </ul>

              {/* CTA principal */}
              <Link
                href="/espace-decouverte"
                className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-2xl px-8 py-4 text-base font-extrabold uppercase tracking-wide text-white shadow-[0_10px_30px_-10px_rgba(192,17,46,0.6)] transition-transform hover:scale-[1.01]"
                style={{ background: ED_RED }}
              >
                Découvrir Major ECN
                <ArrowRight className="h-5 w-5" />
              </Link>

              <p className="mt-4 text-xs leading-snug" style={{ color: ED_INK_SOFT }}>
                Espace découverte basé sur des contenus de <span className="font-semibold">Médecine Générale</span>.
                <br />
                Les préparations sont disponibles dans les <span className="font-semibold">toutes les spécialités EVC</span>.
              </p>
            </Reveal>
          </div>

          {/* Séparateur + 3 stats bas */}
          <div className="mt-10 border-t pt-8 sm:mt-14" style={{ borderColor: "#EEF1F6" }}>
            <ul className="grid gap-6 sm:grid-cols-3">
              {ED_BOTTOM_STATS.map((s) => (
                <li key={s.t} className="flex items-center justify-center gap-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                    style={{ background: s.bg, color: s.color }}
                  >
                    <s.Icon className="h-5 w-5" />
                  </span>
                  <span className="text-[15px] font-bold" style={{ color: ED_NAVY }}>{s.t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Dernier CTA — bande finale « Découvrir gratuitement la plateforme »
   ============================================================ */
export function FinalDiscoverCtaSection() {
  return (
    <section
      className="relative isolate overflow-hidden bg-[#0F1F4D] py-20 text-white lg:py-28"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div aria-hidden className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-[#C0112E]/30 blur-[120px]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 right-1/4 -z-10 h-[360px] w-[560px] rounded-full bg-[#3B82F6]/15 blur-[120px]" />
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> Sans carte bancaire · Sans engagement
          </span>
          <h2 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl">
            Prêt à découvrir Major ECN&nbsp;?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg" style={{ fontFamily: "'Manrope', sans-serif" }}>
            Accédez gratuitement à un aperçu concret de la plateforme et de notre
            méthode de préparation aux EVC, avant de choisir votre formule.
          </p>
          <Link
            href="/espace-decouverte"
            className="mt-9 inline-flex items-center justify-center gap-3 rounded-2xl px-9 py-4 text-base font-extrabold uppercase tracking-wide text-white shadow-[0_14px_40px_-12px_rgba(192,17,46,0.7)] transition-transform hover:scale-[1.02]"
            style={{ background: 'linear-gradient(90deg, #8B0E22 0%, #C0112E 100%)' }}
          >
            Découvrir gratuitement la plateforme
            <ArrowRight className="h-5 w-5" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/** @deprecated Conservé pour compatibilité — préfère EspaceDecouverteSection. */
export function FinalCtaBlock({ colleges: _colleges }: { colleges?: { id: string; nom: string }[] }) {
  return <EspaceDecouverteSection />;
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
    features: ['Tout Essentiel +', 'IA pédagogique avancée', 'Analytics détaillés', 'Épreuves blanches illimitées', 'Tuteur dédié', 'Mode concours'],
    cta: 'Choisir Premium', highlighted: true, badge: 'Le plus populaire',
  },
  {
    name: 'Intensif', price: '149', period: '/mois',
    desc: 'Accompagnement personnalisé maximal.',
    features: ['Tout Premium +', 'Sessions 1:1 avec un médecin', 'Plan d’étude sur mesure', 'Accès prioritaire au support', 'Garantie satisfaction'],
    cta: 'Contacter l’équipe', highlighted: false,
  },
];

const CONTACT_EMAIL = 'contact@major-ecn.fr';

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
            Choisissez la formule adaptée à vos objectifs. Sans engagement.
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
          ✓ Espace découverte gratuit · Accès complet · Zéro engagement · Annulation instantanée
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

        {/* Le bloc "Tous les outils pour reussir votre preparation EVC" a
         * ete deplace dans une section dediee ToolsForProgressSection. */}
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
              backgroundImage: 'linear-gradient(90deg,#0F1F4D 0%,#1E40AF 50%,#3B82F6 100%)',
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
                <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] sm:gap-1 sm:text-xs">
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
    year: 'Lauréat EVC',
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
    year: 'Lauréat EVC',
    initials: 'SK',
  },
  {
    Icon: Brain,
    spec: 'Psychiatrie',
    tint: '#E7F6EC',
    accent: '#16793C',
    quote: 'La formation m’a permis de progresser en méthodologie, rapidité et confiance en moi. Un accompagnement précieux jusqu’aux EVC.',
    name: 'Dr Monica WAITZFELDER',
    country: 'Brésil',
    flag: '🇧🇷',
    year: 'Lauréate EVC',
    initials: 'MW',
  },
];


/* ============================================================
   TOOLS-FOR-PROGRESS Section — « Une plateforme intelligente qui
   s'adapte à votre niveau et à votre progression ». Rangée de 7
   fonctionnalités (cours en direct, replays, fiches, QCM, cas
   cliniques, flashcards, suivi) + bloc rose « gagner du temps ».
   Pixel-perfect maquette.
   ============================================================ */
const TOOLS_RED       = '#C0112E';
const TOOLS_RED_SOFT  = '#FCEAEC';
const TOOLS_NAVY      = '#0F1F4D';
const TOOLS_ORANGE    = '#E8742C';
const TOOLS_INK_SOFT  = '#52607A';
const TOOLS_BORDER    = '#E9EDF3';
const TOOLS_FONT      = "'Plus Jakarta Sans', sans-serif";

/* Les 7 fonctionnalités de la plateforme. `live` → badge LIVE rouge sur l'icône. */
const PLATFORM_FEATURES: { Icon: LucideIcon; live?: boolean; title: string; sub: string }[] = [
  { Icon: Video,       live: true, title: 'Cours en direct*', sub: 'Animés par des spécialistes' },
  { Icon: Play,        title: 'Replays*',                     sub: 'Disponibles selon votre formule' },
  { Icon: FileText,    title: 'Fiches de cours',              sub: 'Complètes et structurées' },
  { Icon: ListChecks,  title: 'QCM corrigés & annales',       sub: 'Classés par item et spécialité' },
  { Icon: Stethoscope, title: 'Cas cliniques corrigés',       sub: 'Corrigés étape par étape' },
  { Icon: Layers3,     title: 'Flashcards',                   sub: 'Révision active' },
  { Icon: TrendingUp,  title: 'Suivi intelligent',            sub: 'Personnalisé selon vos résultats' },
];

/* Les 3 bénéfices « gagner du temps » du bloc rose. */
const TIME_BENEFITS: { Icon: LucideIcon; title: string; desc: string }[] = [
  { Icon: Folder,  title: 'Contenus classés',
    desc: 'Par spécialité, item et thématique pour retrouver rapidement ce dont vous avez besoin.' },
  { Icon: Layers3, title: 'Toutes vos ressources réunies',
    desc: 'Cours, fiches, QCM, cas cliniques, annales, flashcards et outils pédagogiques centralisés.' },
  { Icon: Clock,   title: 'Plus de temps pour réviser',
    desc: 'Moins de temps à chercher vos ressources, plus de temps à progresser efficacement.' },
];

export function ToolsForProgressSection() {
  return (
    <section className="relative bg-white py-14 sm:py-16 lg:py-20" style={{ fontFamily: TOOLS_FONT }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <Reveal className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] shadow-sm"
            style={{ borderColor: 'rgba(192,17,46,0.30)', color: TOOLS_RED }}>
            <Brain className="h-3.5 w-3.5" /> Plateforme intelligente et adaptative
          </span>
          <h2 className="mx-auto mt-5 max-w-4xl text-3xl font-black leading-[1.1] tracking-tight sm:text-4xl lg:text-[2.7rem]"
            style={{ color: TOOLS_NAVY }}>
            Une plateforme intelligente qui s&rsquo;adapte<br className="hidden sm:block" />
            à <span style={{ color: TOOLS_RED }}>votre niveau</span> et à{' '}
            <span style={{ color: TOOLS_ORANGE }}>votre progression.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-[15px] leading-relaxed sm:text-[16px]" style={{ color: TOOLS_INK_SOFT }}>
            Major ECN <strong style={{ color: TOOLS_RED }}>analyse automatiquement</strong> vos résultats pour
            personnaliser vos révisions, identifier vos priorités et vous proposer un{' '}
            <strong style={{ color: TOOLS_RED }}>parcours de préparation adapté</strong> jusqu&rsquo;aux Épreuves de
            Vérification des Connaissances (EVC).
          </p>
        </Reveal>

        {/* Carte des 7 fonctionnalités */}
        <Reveal delay={0.05}>
          <div className="mt-10 rounded-[28px] border bg-white p-6 shadow-[0_30px_80px_-40px_rgba(15,31,77,0.25)] sm:p-8"
            style={{ borderColor: TOOLS_BORDER }}>
            <div className="grid grid-cols-2 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 lg:gap-y-0">
              {PLATFORM_FEATURES.map((f, i) => (
                <div
                  key={f.title}
                  className={'flex flex-col items-center px-2 text-center lg:px-4' + (i > 0 ? ' lg:border-l lg:border-[#F1DEE1]' : '')}
                >
                  <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl"
                    style={{ background: TOOLS_RED_SOFT, color: TOOLS_RED }}>
                    <f.Icon className="h-6 w-6" />
                    {f.live && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-md px-1.5 py-[1.5px] text-[8px] font-black uppercase leading-none tracking-wide text-white shadow-sm"
                        style={{ background: TOOLS_RED }}>
                        LIVE
                      </span>
                    )}
                  </span>
                  <p className="mt-3.5 text-[14px] font-extrabold leading-tight" style={{ color: TOOLS_NAVY }}>{f.title}</p>
                  <p className="mt-1.5 text-[12px] leading-snug" style={{ color: TOOLS_INK_SOFT }}>{f.sub}</p>
                  <span className="mt-3 block h-[3px] w-7 rounded-full" style={{ background: TOOLS_RED }} />
                </div>
              ))}
            </div>
            <p className="mt-7 text-center text-[12px] leading-relaxed" style={{ color: '#8A93A3' }}>
              * Les cours en direct interactifs et l&rsquo;accès aux replays dépendent de la formule de préparation choisie.
            </p>
          </div>
        </Reveal>

        {/* Bloc rose — « gagner du temps » */}
        <Reveal delay={0.1}>
          <div className="mt-6 overflow-hidden rounded-[28px] border"
            style={{ background: 'linear-gradient(135deg,#FDECEE 0%,#FCE3E6 100%)', borderColor: '#F7D2D7' }}>
            <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
              {/* Gauche : texte + bénéfices */}
              <div className="flex flex-col p-6 sm:p-9 lg:p-10">
                <div className="flex items-center gap-3.5">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-[0_16px_36px_-14px_rgba(192,17,46,0.6)]"
                    style={{ background: `linear-gradient(135deg, ${TOOLS_RED} 0%, #8B0E22 100%)` }}>
                    <Zap className="h-7 w-7 fill-current" />
                  </span>
                  <h3 className="text-2xl font-black leading-[1.08] tracking-tight sm:text-[1.95rem]" style={{ color: TOOLS_NAVY }}>
                    Tout est organisé pour<br />
                    vous faire <span style={{ color: TOOLS_RED }}>gagner du temps.</span>
                  </h3>
                </div>
                <p className="mt-5 text-[15px] leading-relaxed" style={{ color: TOOLS_INK_SOFT }}>
                  Une seule plateforme. Une seule connexion.<br />
                  Toute votre <strong style={{ color: TOOLS_RED }}>préparation EVC</strong> au même endroit.
                </p>

                <ul className="mt-6 flex flex-col gap-5">
                  {TIME_BENEFITS.map((b) => (
                    <li key={b.title} className="flex items-start gap-3.5">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: '#FFFFFF', color: TOOLS_RED, boxShadow: '0 0 0 1px #F7D2D7 inset' }}>
                        <b.Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-[15px] font-extrabold" style={{ color: TOOLS_NAVY }}>{b.title}</p>
                        <p className="mt-0.5 text-[13px] leading-relaxed" style={{ color: TOOLS_INK_SOFT }}>{b.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                <p className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-extrabold uppercase tracking-[0.12em]"
                  style={{ color: TOOLS_NAVY }}>
                  <span style={{ color: TOOLS_RED }}>★</span>
                  <span>Préparation EVC</span><span style={{ color: TOOLS_RED }}>•</span>
                  <span>PAE</span><span style={{ color: TOOLS_RED }}>•</span>
                  <span>PADHUE</span><span style={{ color: TOOLS_RED }}>•</span>
                  <span>Médecines diplômées hors UE</span><span style={{ color: TOOLS_RED }}>•</span>
                  <span>toutes les spécialités</span>
                </p>
              </div>

              {/* Droite : laptop + smartphone (image conservée) */}
              <div className="relative flex items-center justify-center p-6 sm:p-8 lg:p-0">
                <img
                  src="/plateforme/laptop-phone-dashboard.png"
                  alt="Plateforme Major ECN sur ordinateur portable et smartphone"
                  className="w-full max-w-[560px] select-none object-contain drop-shadow-2xl"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   « Tout est regroupé au même endroit » — grille 8 cartes (pixel-perfect).
   ============================================================ */
export function ToutRegroupeSection() {
  const cards = [
    { Icon: Play,            t: 'Cours\net replays',                        d: 'Accédez à tous vos cours et replays selon votre formule.',                                  bg: '#FFE4E8', fg: '#C0001F' },
    { Icon: ClipboardList,   t: 'QCM et annales',                            d: 'Entraînez-vous avec des milliers de QCM et annales ciblés EVC.',                            bg: '#EDE9FE', fg: '#6D28D9' },
    { Icon: Stethoscope,     t: 'Cas cliniques\ncorrigés',                   d: 'Dossiers progressifs corrigés en détail pour développer votre raisonnement clinique.',     bg: '#FFE4E8', fg: '#C0001F' },
    { Icon: FileText,        t: 'Fiches et\nflashcards',                     d: 'Mémorisez efficacement les notions clés grâce à des fiches synthétiques.',                  bg: '#DBEAFE', fg: '#1E40AF' },
    { Icon: CalendarDays,    t: 'Planning\ndes cours',                       d: 'Retrouvez le calendrier des cours et organisez votre préparation.',                          bg: '#DCFCE7', fg: '#15803D' },
    { Icon: TrendingUp,      t: 'Suivi de\nprogression',                     d: 'Visualisez vos résultats et identifiez vos points forts et vos axes d’amélioration.',  bg: '#FFE4D5', fg: '#C2410C' },
    { Icon: ClipboardCheck,  t: 'Évaluations et\ninterrogations',           d: 'Évaluez régulièrement votre niveau avec des interrogations et des épreuves blanches.',       bg: '#EDE9FE', fg: '#6D28D9' },
    { Icon: MessageCircle,   t: 'Questions à\nl’équipe pédagogique',   d: 'Posez vos questions directement dans la plateforme et obtenez des réponses rapides.',        bg: '#FFE4E8', fg: '#C0001F' },
  ];
  return (
    <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#FFF6F7' }}>
      {/* Halos décoratifs */}
      <span aria-hidden className="pointer-events-none absolute -left-32 -top-24 -z-10 h-[420px] w-[420px] rounded-full opacity-50 blur-3xl" style={{ background: 'radial-gradient(closest-side, rgba(192,17,46,0.20) 0%, transparent 70%)' }} />
      <span aria-hidden className="pointer-events-none absolute -right-32 bottom-0 -z-10 h-[420px] w-[420px] rounded-full opacity-50 blur-3xl" style={{ background: 'radial-gradient(closest-side, rgba(232,116,44,0.18) 0%, transparent 70%)' }} />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[28px] border bg-white p-6 shadow-[0_30px_80px_-30px_rgba(15,31,77,0.18)] sm:p-8 lg:p-10"
            style={{ borderColor: '#FCDCE0' }}>

            {/* Header : éclair rouge + titre + intro */}
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-6">
              <span className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl"
                style={{
                  background: 'linear-gradient(135deg,#FFE4E8 0%,#FFD3D8 100%)',
                  boxShadow: '0 18px 38px -16px rgba(192,17,46,0.40), inset 0 0 0 4px white',
                }}>
                <Zap className="h-7 w-7 fill-current" style={{ color: '#C0112E' }} />
              </span>
              <div className="flex-1">
                <h2 className="text-3xl font-black leading-[1.05] tracking-tight sm:text-4xl lg:text-[2.5rem]"
                  style={{ color: '#0F1F4D' }}>
                  Tout est regroupé{' '}
                  <span style={{
                    backgroundImage: 'linear-gradient(90deg,#C0112E 0%,#E8742C 100%)',
                    WebkitBackgroundClip: 'text', backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent', color: 'transparent',
                  }}>au même endroit.</span>
                </h2>
                <p className="mt-3 text-[14px] leading-relaxed sm:text-[15px]" style={{ color: '#52607A' }}>
                  Retrouvez dans votre espace personnel l&rsquo;ensemble des ressources nécessaires à votre préparation aux{' '}
                  <span className="font-bold" style={{ color: '#C0112E' }}>Épreuves de Vérification des Connaissances (EVC)</span>.
                </p>
              </div>
            </div>

            {/* Grille 8 cards (4 colonnes sur desktop, 2 sur tablette, 1 sur mobile) */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {cards.map((c) => (
                <Reveal key={c.t}>
                  <article
                    className="flex h-full flex-col rounded-2xl border bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-22px_rgba(15,31,77,0.20)]"
                    style={{ borderColor: '#ECEEF1' }}
                  >
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-full"
                      style={{ background: c.bg, color: c.fg }}
                    >
                      <c.Icon className="h-5.5 w-5.5" />
                    </span>
                    <h3 className="mt-4 whitespace-pre-line text-[18px] font-extrabold leading-tight" style={{ color: '#0F1F4D' }}>
                      {c.t}
                    </h3>
                    <p className="mt-2 text-[13px] leading-relaxed" style={{ color: '#52607A' }}>
                      {c.d}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>

            {/* Bandeau bas rose avec badge mis en avant */}
            <Reveal delay={0.1}>
              <div
                className="mt-7 flex flex-col items-start gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:gap-4 sm:px-6 sm:py-5"
                style={{ background: '#FFF1F3', borderColor: '#FACBD0' }}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                  style={{ background: 'white', boxShadow: '0 0 0 3px #FCDCE0 inset' }}>
                  <ShieldCheck className="h-5 w-5" style={{ color: '#C0112E' }} />
                </span>
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[13.5px] font-bold leading-snug sm:text-[15px]" style={{ color: '#0F1F4D' }}>
                  <span>Un seul espace. Une seule connexion.</span>
                  <span
                    className="inline-flex items-center rounded-full px-3 py-1 text-[12px] font-extrabold text-white sm:text-[13px]"
                    style={{
                      background: 'linear-gradient(90deg,#C0112E 0%,#E8742C 100%)',
                      boxShadow: '0 10px 24px -14px rgba(192,17,46,0.55)',
                    }}
                  >
                    Tous vos outils de préparation EVC
                  </span>
                  <span className="relative">
                    réunis au même endroit.
                    <span
                      aria-hidden
                      className="absolute -bottom-1 left-0 right-0 h-1 rounded-full"
                      style={{ background: 'linear-gradient(90deg,#C0112E 0%,#E8742C 100%)', opacity: 0.65 }}
                    />
                  </span>
                </p>
              </div>
            </Reveal>
          </div>
        </Reveal>
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
          <Link
            href="/espace-decouverte"
            className="inline-flex items-center gap-2.5 rounded-2xl border-2 bg-white px-7 py-3.5 text-sm font-extrabold transition-transform hover:scale-[1.02]"
            style={{ borderColor: TT_RED, color: TT_RED }}
          >
            <Sparkles className="h-4 w-4" />
            Découvrir gratuitement la plateforme
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
    spec: 'Radiodiagnostic & imagerie médicale',
    accent: TV_RED,
    name: "Dr Sami KABAWEH",
    country: "",
    flag: "",
    year: "Lauréat EVC",
    duration: '',
    quote: 'Une préparation qui m’a fait franchir un cap : méthode claire, fiches synthétiques et examens blancs proches du jour J.',
    bgGrad: 'linear-gradient(135deg, #14254E 0%, #6D28D9 50%, #A91D2C 100%)',
    initials: 'SK',
    videoSrc: '/temoignages/T1 FINAL V2.mp4',
  },
  {
    spec: 'Anesthésie réanimation',
    accent: TV_RED,
    name: "Dr Karim KHIAREDDINE",
    country: "",
    flag: "",
    year: "Lauréat EVC 2025",
    duration: '',
    quote: 'Dans une spécialité exigeante, la méthodologie Major ECN m’a permis de structurer mes révisions et d’aborder le concours avec sérénité.',
    bgGrad: 'linear-gradient(135deg, #2A1A4A 0%, #6D28D9 55%, #A91D2C 100%)',
    initials: 'KK',
    videoSrc: '/temoignages/T2 FINAL V2.mp4',
  },
  {
    spec: 'Endocrinologie & métabolisme',
    accent: TV_RED,
    name: "Dr Ely Cheikh SY",
    country: "",
    flag: "",
    year: "Lauréat EVC 2025",
    duration: '',
    quote: 'Reprendre confiance après un échec — et réussir les EVC avec de brillants résultats grâce à un accompagnement structuré.',
    bgGrad: 'linear-gradient(135deg, #0F4438 0%, #16793C 55%, #A91D2C 100%)',
    initials: 'ES',
    videoSrc: '/temoignages/T3 FINAL V2.mp4',
  },
  {
    spec: 'Gériatrie',
    accent: TV_RED,
    name: "Dr Ahmed SIFAOUI",
    country: "",
    flag: "",
    year: "Lauréat EVC 2025",
    duration: '',
    quote: 'Un accompagnement humain et exigeant, des supports clairs et un suivi qui fait toute la différence dans la durée.',
    bgGrad: 'linear-gradient(135deg, #6B1A2A 0%, #B45309 55%, #E8742C 100%)',
    initials: 'AS',
    videoSrc: '/temoignages/T4 Final V2.mp4',
  },
  {
    spec: 'Chirurgie viscérale & digestive',
    accent: TV_RED,
    name: "Dr Ahena HAROUN",
    country: "",
    flag: "",
    year: "Lauréate EVC 2024",
    duration: '',
    quote: 'Major ECN a structuré toute ma préparation : la méthode, les cas cliniques et les corrections détaillées font la différence.',
    bgGrad: 'linear-gradient(135deg, #4B0F1B 0%, #A91D2C 55%, #E8742C 100%)',
    initials: 'AH',
    videoSrc: '/temoignages/T5 FINAL V2.mp4',
  },
];

type TVCard = (typeof TV_CARDS)[number];

function VideoTestimonialCard({ card }: { card: TVCard }) {
  const [isPlaying, setIsPlaying] = useState(false);
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border bg-white" style={{ borderColor: "#ECECEF" }}>
      <div className="relative aspect-[9/16] w-full overflow-hidden" style={{ background: card.bgGrad }}>
        <video
          src={card.videoSrc}
          controls
          playsInline
          preload="metadata"
          aria-label={`Témoignage vidéo de ${card.name}`}
          className="absolute inset-0 h-full w-full bg-black object-contain"
          onLoadedData={(e) => { e.currentTarget.currentTime = 3; }}
          onPlay={(e) => {
            if (e.currentTarget.currentTime >= 2.5) e.currentTarget.currentTime = 0;
            setIsPlaying(true);
          }}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        >
          Votre navigateur ne supporte pas la lecture vidéo.
        </video>
        {!isPlaying && (
          <span
            className="pointer-events-none absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-lg"
            style={{ background: TV_RED }}
          >
            <Trophy className="h-3 w-3" />
            {card.year}
          </span>
        )}
      </div>
      <div className="flex-1 p-3">
        <p className="text-[14px] font-extrabold leading-tight" style={{ color: TV_NAVY }}>{card.name}</p>
        <p className="mt-0.5 text-[12px] font-bold" style={{ color: TV_RED }}>{card.spec}</p>
      </div>
    </article>
  );
}

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

        {/* 5 videos cote a cote, hauteur identique */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {TV_CARDS.map((c, i) => (
            <Reveal key={c.name} delay={i * 0.06}>
              <VideoTestimonialCard card={c} />
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
          <Link
            href="/espace-decouverte"
            className="inline-flex items-center gap-2.5 rounded-2xl border-2 bg-white px-7 py-3.5 text-sm font-extrabold transition-transform hover:scale-[1.02]"
            style={{ borderColor: TV_RED, color: TV_RED }}
          >
            <Sparkles className="h-4 w-4" />
            Découvrir gratuitement la plateforme
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
  /** Extension du fichier photo. Défaut: 'jpg'. */
  photoExt?: 'jpg' | 'png';
};

const FEATURED: FeaturedTestimony[] = [
  {
    slug: "dr-ahmed-sifaoui",
    initials: "AS",
    name: "Dr Ahmed Sifaoui",
    title: "Lauréat EVC Gériatrie 2025 — Voie externe",
    spec: "Gériatrie",
    photoExt: "png",
    paragraphs: [
      "Avant de commencer ma préparation aux EVC de gériatrie, plusieurs confrères qui avaient réussi les EVC m'avaient parlé de Major ECN. Leurs retours étaient très positifs et, au bout d'un moment, j'ai décidé de leur faire confiance et de m'inscrire à mon tour.",
      "Quelques semaines après le début de ma préparation, nous avons appris une nouvelle qui a été un véritable choc pour beaucoup de candidats : la réduction très importante du nombre de postes pour la voie externe. Honnêtement, quand j'ai appris qu'il n'y avait plus qu'une trentaine de postes au niveau national, j'ai pris un coup au moral. Je me suis demandé plusieurs fois si cela valait encore la peine de continuer.",
      "Heureusement, j'étais déjà engagé dans la préparation. Les cours continuaient, les enseignants étaient présents et il y avait toujours un objectif à atteindre. Finalement, cela m'a aidé à rester concentré malgré les doutes. J'ai alors décidé de me consacrer pleinement aux EVC : j'ai supprimé les réseaux sociaux, réduit les sorties au minimum et organisé mon quotidien autour de ma préparation.",
      "S'il y a une chose que j'aimerais dire aux futurs candidats, c'est de faire attention à ce qu'ils lisent sur Internet. On voit parfois des messages expliquant que les EVC sont faciles ou qu'il est possible de réussir après seulement quelques jours de révision. J'ai vécu quelque chose de très différent : les EVC sont beaucoup plus exigeants. Avec un nombre de postes aussi limité, chaque point compte.",
      "Ce que j'ai particulièrement apprécié chez Major ECN, c'est le fait de savoir exactement sur quoi concentrer mes efforts. Je savais quoi réviser, quand le réviser et comment avancer progressivement. Les cours, les fiches, les interrogations et les concours blancs m'ont permis de travailler de façon structurée sans perdre de temps.",
      "Aujourd'hui, avec le recul, je peux dire que tous les sacrifices en valaient la peine. Je remercie sincèrement toute l'équipe Major ECN pour son accompagnement tout au long de cette préparation. Mon conseil aux futurs candidats : restez concentrés sur votre objectif, travaillez régulièrement et ne vous laissez pas décourager par ce que vous pouvez entendre autour de vous.",
    ],
  },
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
function FeaturedAvatar({ slug, initials, ext = 'jpg' }: { slug: string; initials: string; ext?: 'jpg' | 'png' }) {
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
          src={`/temoignages/${slug}.${ext}`}
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
                    <FeaturedAvatar slug={t.slug} initials={t.initials} ext={t.photoExt} />

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

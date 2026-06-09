'use client';
/* eslint-disable @next/next/no-img-element */
/**
 * Page Spécialité — Médecine Générale (pixel-perfect).
 * 8 sections : hero stéthoscope, métriques, domaines couverts,
 * accompagnement personnalisé, programme, pourquoi Major ECN,
 * témoignage, FAQ + CTA final.
 */

import Link from 'next/link';
import {
  ArrowRight, Award, BookOpen, Brain, CalendarCheck, Check, CheckCircle2, ChevronRight,
  ClipboardCheck, Clock, FileText, Folder, GraduationCap, Heart, HeartPulse, Hospital,
  Layers3, ListChecks, MessageCircle, Quote, Shield, Sparkles, Stethoscope, Target,
  TrendingUp, Trophy, UserCheck, Users, type LucideIcon,
} from 'lucide-react';
import { Reveal } from './reveal';

const RED = '#C0112E';
const RED_DEEP = '#8B0E22';
const NAVY = '#0F1F4D';
const NAVY_DEEP = '#0A1838';
const INK_SOFT = '#52607A';
const INK_MUTED = '#7A8499';
const BORDER = '#E5E9F0';
const SOFT_BG = '#F7F8FB';
const FONT = "'Plus Jakarta Sans', sans-serif";

const GRAD_BURGUNDY = 'linear-gradient(90deg, #6B1A2A 0%, #C0112E 55%, #E8742C 100%)';
const GRAD_NAVY_RED = 'linear-gradient(90deg, #0F1F4D 0%, #6B1A2A 50%, #C0112E 100%)';
const gradientText = (grad: string) => ({
  backgroundImage: grad,
  WebkitBackgroundClip: 'text' as const,
  backgroundClip: 'text' as const,
  WebkitTextFillColor: 'transparent' as const,
  color: 'transparent',
});

/* ============================================================
   Breadcrumb
   ============================================================ */
function Crumbs() {
  return (
    <nav className="mx-auto max-w-7xl px-4 pt-6 text-[12px] font-semibold sm:px-6 lg:px-8" style={{ color: INK_MUTED, fontFamily: FONT }} aria-label="Fil d’ariane">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li><Link href="/" className="hover:underline">Accueil</Link></li>
        <li><ChevronRight className="h-3 w-3" /></li>
        <li><Link href="/specialites" className="hover:underline">Spécialités</Link></li>
        <li><ChevronRight className="h-3 w-3" /></li>
        <li style={{ color: NAVY }}>Médecine Générale</li>
      </ol>
    </nav>
  );
}

/* ============================================================
   1. HERO — titre + visuel stéthoscope (SVG)
   ============================================================ */
function MgHero() {
  return (
    <section className="relative overflow-hidden bg-white pt-6 pb-12 sm:pb-16 lg:pb-20" style={{ fontFamily: FONT }}>
      <div aria-hidden className="pointer-events-none absolute -left-40 -top-10 -z-10 h-[460px] w-[460px] rounded-full bg-[#C0112E]/6 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 -z-10 h-[420px] w-[420px] rounded-full bg-[#0F1F4D]/5 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
          {/* LEFT — texte */}
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em]"
              style={{ background: '#FCEAEC', borderColor: 'rgba(192,17,46,0.22)', color: RED }}>
              <Stethoscope className="h-3.5 w-3.5" /> Préparation EVC
            </span>

            <h1 className="mt-5 text-4xl font-black leading-[1.02] tracking-tight sm:text-5xl lg:text-[3.6rem]"
              style={gradientText(GRAD_NAVY_RED)}>
              Préparation EVC<br />
              <span style={gradientText(GRAD_BURGUNDY)}>Médecine&nbsp;Générale</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed sm:text-[17px]" style={{ color: INK_SOFT }}>
              Nouveau&nbsp;! Épreuves de Vérification des Connaissances (EVC) en
              Médecine Générale chez les PADHUE — préparation intégrale, calibrée
              sur le référentiel CMG et les attentes du jury 2026.
            </p>

            <p className="mt-5 text-[14px] leading-relaxed" style={{ color: INK_SOFT }}>
              Que vous soyez généraliste hors UE en exercice, en stage hospitalier
              ou récemment diplômé, nous vous proposons un programme complet&nbsp;:
              raisonnement clinique, prévention, suivi des pathologies chroniques,
              coordination ville-hôpital et urgences au cabinet.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/inscription"
                className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-[0_18px_40px_-18px_rgba(192,17,46,0.55)] transition-transform hover:scale-[1.02]"
                style={{ background: `linear-gradient(135deg, ${RED} 0%, ${RED_DEEP} 100%)` }}>
                Démarrer ma préparation <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="#programme"
                className="inline-flex items-center gap-2 rounded-2xl border bg-white px-5 py-3 text-sm font-bold transition-transform hover:scale-[1.02]"
                style={{ borderColor: BORDER, color: NAVY }}>
                Voir le programme
              </Link>
            </div>
          </Reveal>

          {/* RIGHT — photo stéthoscope réelle */}
          <Reveal delay={0.1}>
            <div className="relative">
              <div className="relative aspect-[5/4] overflow-hidden rounded-3xl border bg-white shadow-[0_30px_80px_-30px_rgba(192,17,46,0.30)]"
                style={{ borderColor: BORDER }}>
                {/* halos colorés derrière */}
                <span aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-60 w-60 rounded-full bg-[#C0112E]/15 blur-3xl" />
                <span aria-hidden className="pointer-events-none absolute -left-10 -bottom-12 h-60 w-60 rounded-full bg-[#E8742C]/15 blur-3xl" />

                {/* photo stéthoscope */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/specialites/stethoscope-hero.jpg"
                  alt="Stéthoscope — symbole de la médecine de premier recours"
                  className="absolute inset-0 h-full w-full select-none object-cover"
                  style={{ objectPosition: '50% 50%' }}
                  decoding="async"
                  fetchPriority="high"
                />
                {/* léger overlay pour la lisibilité des badges */}
                <span aria-hidden className="pointer-events-none absolute inset-0"
                  style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 30%, rgba(15,31,77,0.06) 100%)' }} />

                {/* badges flottants */}
                <span className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-xl border border-white bg-white/95 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider shadow-md backdrop-blur"
                  style={{ color: NAVY }}>
                  <HeartPulse className="h-3.5 w-3.5" style={{ color: RED }} /> Médecine de premier recours
                </span>
                <span className="absolute right-5 top-5 inline-flex items-center gap-2 rounded-xl border border-white bg-white/95 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider shadow-md backdrop-blur"
                  style={{ color: NAVY }}>
                  <Sparkles className="h-3.5 w-3.5" style={{ color: '#E8742C' }} /> EVC (PAE) 2026
                </span>
                <span className="absolute bottom-5 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 rounded-xl border border-white bg-white/95 px-3 py-1.5 text-[11px] font-bold shadow-md backdrop-blur"
                  style={{ color: NAVY }}>
                  <BookOpen className="h-3.5 w-3.5" style={{ color: RED }} /> Programme CMG · HAS · ANSM
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   2. Métriques
   ============================================================ */
function MgMetrics() {
  const metrics = [
    { Icon: CheckCircle2, value: '100%', label: 'des items CMG couverts', tone: RED },
    { Icon: UserCheck,    value: '100%', label: 'correcteurs MG enseignants', tone: '#0F8A6A' },
    { Icon: ListChecks,   value: '1 800+', label: 'QCM ciblés EVC', tone: '#2563EB' },
    { Icon: FileText,     value: '120+', label: 'cas cliniques cabinet & hôpital', tone: '#7C3AED' },
  ];
  return (
    <section className="relative" style={{ fontFamily: FONT, background: SOFT_BG }}>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Reveal>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {metrics.map((m, i) => (
              <div key={i} className="flex items-center gap-3 rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: BORDER }}>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: `${m.tone}14`, color: m.tone }}>
                  <m.Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-lg font-black leading-tight" style={{ color: NAVY }}>{m.value}</p>
                  <p className="text-[11.5px] font-semibold" style={{ color: INK_SOFT }}>{m.label}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   3. Les domaines couverts (12 cartes)
   ============================================================ */
type Domain = { Icon: LucideIcon; tone: string; title: string; sub: string };
function MgDomains() {
  const items: Domain[] = [
    { Icon: HeartPulse, tone: RED,        title: 'Cardiologie & vasculaire', sub: 'HTA, ECG ambulatoire, IC chronique' },
    { Icon: Heart,      tone: '#BE185D',  title: 'Femmes & enfants',         sub: 'Suivi grossesse, dépistages, pédiatrie' },
    { Icon: Brain,      tone: '#7C3AED',  title: 'Neuro-psychiatrie',        sub: 'Anxiété, dépression, troubles cognitifs' },
    { Icon: Layers3,    tone: '#2563EB',  title: 'Maladies chroniques',      sub: 'Diabète, BPCO, ostéoporose' },
    { Icon: Shield,     tone: '#0F8A6A',  title: 'Prévention & dépistage',   sub: 'Vaccination, addictions, cancers' },
    { Icon: Hospital,   tone: '#E8742C',  title: 'Urgences au cabinet',      sub: 'Dyspnée, douleur thoracique, AVC' },
    { Icon: BookOpen,   tone: '#0E7C7B',  title: 'Soins palliatifs',         sub: 'Douleur, fin de vie, accompagnement' },
    { Icon: Users,      tone: '#7A8499',  title: 'Personne âgée',            sub: 'Polymédication, fragilité, chutes' },
    { Icon: ClipboardCheck, tone: '#D97706', title: 'Coordination & parcours',  sub: 'CPTS, hôpital, EHPAD, IDE' },
    { Icon: Stethoscope,tone: RED,        title: 'Démarche diagnostique',    sub: 'Raisonnement clinique en consultation' },
    { Icon: GraduationCap, tone: '#4F46E5',title: 'Médecine sociale',         sub: 'Précarité, médiation, ALD' },
    { Icon: Folder,     tone: '#0891B2',  title: 'Médico-administratif',     sub: 'Certificats, ALD, arrêts de travail' },
  ];
  return (
    <section className="relative bg-white py-14 sm:py-16 lg:py-20" style={{ fontFamily: FONT }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em]"
            style={{ background: '#FCEAEC', borderColor: 'rgba(192,17,46,0.22)', color: RED }}>
            <Layers3 className="h-3 w-3" /> Tous les domaines couverts
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl" style={gradientText(GRAD_NAVY_RED)}>
            Tout l’exercice de la Médecine Générale
          </h2>
          <p className="mt-3 text-[15px]" style={{ color: INK_SOFT }}>
            Du suivi des maladies chroniques aux urgences du cabinet, en passant
            par la prévention, le programme reflète l’intégralité de votre futur
            exercice.
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {items.map((d, i) => (
            <Reveal key={i} delay={Math.min(0.04 * (i % 8), 0.32)}>
              <div className="flex h-full flex-col gap-2 rounded-2xl border bg-white p-4 shadow-sm transition-transform hover:-translate-y-0.5" style={{ borderColor: BORDER }}>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: `${d.tone}14`, color: d.tone }}>
                  <d.Icon className="h-5 w-5" />
                </span>
                <p className="text-[14px] font-extrabold leading-tight" style={{ color: NAVY }}>{d.title}</p>
                <p className="text-[12px]" style={{ color: INK_SOFT }}>{d.sub}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   4. Accompagnement personnalisé (2 colonnes)
   ============================================================ */
function MgAccompagnement() {
  const left = [
    { Icon: ClipboardCheck, title: 'Plan de travail individualisé',
      text: 'Votre coach pédagogique calibre votre planning sur 4 à 12 mois en fonction de votre niveau initial et de votre date d’EVC.' },
    { Icon: MessageCircle, title: 'Correction écrite + orale',
      text: 'Chaque cas clinique remis est commenté à l’écrit puis débriefé en visio par un correcteur MG.' },
    { Icon: TrendingUp, title: 'Suivi de progression',
      text: 'Tableau de bord, alertes lacunes et objectifs hebdomadaires : vous savez à chaque instant où vous en êtes.' },
  ];
  const right = [
    { Icon: Users,       title: 'Groupes restreints',      text: 'Maximum 25 candidats par session de correction live.' },
    { Icon: CalendarCheck,title: 'Sessions de révision',    text: 'Trois sessions intensives par mois en visio interactive.' },
    { Icon: Award,        title: 'Concours blancs EVC',     text: 'Format identique à l’épreuve, corrigés détaillés et classement national.' },
  ];

  return (
    <section className="relative py-14 sm:py-16 lg:py-20" style={{ fontFamily: FONT, background: SOFT_BG }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em]"
            style={{ background: '#FCEAEC', borderColor: 'rgba(192,17,46,0.22)', color: RED }}>
            <UserCheck className="h-3 w-3" /> Un accompagnement personnalisé
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl" style={gradientText(GRAD_NAVY_RED)}>
            Un accompagnement personnalisé en Médecine Générale
          </h2>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
          <Reveal>
            <div className="flex h-full flex-col gap-4 rounded-2xl border bg-white p-5 shadow-sm sm:p-6" style={{ borderColor: BORDER }}>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: '#FCEAEC', color: RED }}>
                  <Target className="h-5 w-5" />
                </span>
                <p className="text-[15.5px] font-extrabold" style={{ color: NAVY }}>Un programme calibré pour vous</p>
              </div>
              <ul className="space-y-3">
                {left.map((it, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: '#FCEAEC', color: RED }}>
                      <it.Icon className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <p className="text-[13.5px] font-extrabold" style={{ color: NAVY }}>{it.title}</p>
                      <p className="text-[12.5px] leading-relaxed" style={{ color: INK_SOFT }}>{it.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="flex h-full flex-col gap-4 rounded-2xl border bg-white p-5 shadow-sm sm:p-6" style={{ borderColor: BORDER }}>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: '#EAF1FB', color: '#2563EB' }}>
                  <Users className="h-5 w-5" />
                </span>
                <p className="text-[15.5px] font-extrabold" style={{ color: NAVY }}>Un cadre d’apprentissage actif</p>
              </div>
              <ul className="space-y-3">
                {right.map((it, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: '#EAF1FB', color: '#2563EB' }}>
                      <it.Icon className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <p className="text-[13.5px] font-extrabold" style={{ color: NAVY }}>{it.title}</p>
                      <p className="text-[12.5px] leading-relaxed" style={{ color: INK_SOFT }}>{it.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        {/* visuel plateforme */}
        <Reveal delay={0.12}>
          <div className="mt-10 overflow-hidden rounded-3xl border bg-white shadow-[0_30px_80px_-30px_rgba(15,31,77,0.30)]" style={{ borderColor: BORDER }}>
            <img src="/cours.png" alt="Aperçu des cours Major ECN" className="block w-full object-cover" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   5. Programme — 2 colonnes (Volume / Méthode)
   ============================================================ */
function MgProgramme() {
  const themes = [
    'Démarche diagnostique en consultation',
    'Prévention, dépistage, vaccinations',
    'Maladies cardiovasculaires (HTA, IC, SCA)',
    'Diabète, dyslipidémies, obésité',
    'Pathologies respiratoires (asthme, BPCO)',
    'Troubles psychiatriques courants',
    'Démences, troubles cognitifs',
    'Suivi de grossesse & contraception',
    'Pathologies pédiatriques courantes',
    'Soins palliatifs & douleur chronique',
    'Urgences au cabinet & orientation',
    'Médico-administratif (certificats, ALD)',
  ];
  const methode = [
    { Icon: BookOpen, title: 'Cours synthétiques',
      text: 'Fiches référentielles 2 à 6 pages, alignées CMG, mises à jour à chaque session.' },
    { Icon: ListChecks, title: 'QCM ciblés EVC',
      text: 'Banque de 1 800+ QCM calibrés EVC avec explications détaillées.' },
    { Icon: ClipboardCheck, title: 'Cas cliniques corrigés',
      text: '120+ cas cliniques de consultation ou d’hospitalisation, corrigés ligne par ligne.' },
    { Icon: Clock, title: 'Révision active',
      text: 'Flashcards spaced repetition pour fixer durablement les notions clés.' },
  ];
  return (
    <section id="programme" className="relative scroll-mt-24 bg-white py-14 sm:py-16 lg:py-20" style={{ fontFamily: FONT }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em]"
            style={{ background: '#FCEAEC', borderColor: 'rgba(192,17,46,0.22)', color: RED }}>
            <FileText className="h-3 w-3" /> Programme détaillé
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl" style={gradientText(GRAD_NAVY_RED)}>
            12 grands thèmes, alignés sur le référentiel CMG
          </h2>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-[1.05fr_1fr]">
          {/* Colonne thèmes */}
          <Reveal>
            <div className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6" style={{ borderColor: BORDER }}>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em]" style={{ color: RED }}>Volume traité</p>
              <p className="mt-1 text-base font-extrabold" style={{ color: NAVY }}>Les 12 grands thèmes</p>
              <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {themes.map((t) => (
                  <li key={t} className="flex items-start gap-2 text-[13px]" style={{ color: NAVY }}>
                    <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: RED }} />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          {/* Colonne méthode */}
          <Reveal delay={0.08}>
            <div className="flex h-full flex-col gap-3 rounded-2xl border bg-white p-5 shadow-sm sm:p-6" style={{ borderColor: BORDER }}>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em]" style={{ color: '#2563EB' }}>Méthode</p>
              <p className="text-base font-extrabold" style={{ color: NAVY }}>Quatre piliers pédagogiques</p>
              <ul className="mt-2 space-y-3">
                {methode.map((m, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: '#EAF1FB', color: '#2563EB' }}>
                      <m.Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-[13.5px] font-extrabold" style={{ color: NAVY }}>{m.title}</p>
                      <p className="text-[12.5px] leading-relaxed" style={{ color: INK_SOFT }}>{m.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   6. Pourquoi Major ECN — 4 colonnes
   ============================================================ */
function MgWhy() {
  const items = [
    {
      Icon: GraduationCap, tone: RED,
      title: 'Expertise PADHUE',
      text: '+15 ans d’accompagnement de médecins étrangers vers la réussite des EVC, sur toutes les spécialités.',
    },
    {
      Icon: Stethoscope, tone: '#2563EB',
      title: 'Correcteurs MG dédiés',
      text: 'Tous les correcteurs sont enseignants ou praticiens en médecine générale en activité.',
    },
    {
      Icon: Sparkles, tone: '#0F8A6A',
      title: 'Méthode active',
      text: 'Cas cliniques, flashcards intelligentes, lives, oraux simulés : tout est calibré pour la rétention.',
    },
    {
      Icon: Shield, tone: '#7C3AED',
      title: 'Suivi humain',
      text: 'Un référent vous suit pendant toute la préparation, joignable par messagerie 6 jours/7.',
    },
  ];
  return (
    <section className="relative py-14 sm:py-16 lg:py-20" style={{ fontFamily: FONT, background: SOFT_BG }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl" style={gradientText(GRAD_NAVY_RED)}>
            Pourquoi les candidats choisissent Major ECN&nbsp;?
          </h2>
          <p className="mt-3 text-[15px]" style={{ color: INK_SOFT }}>
            Quatre engagements concrets pour transformer vos révisions en réussite
            le jour des EVC.
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <div className="flex h-full flex-col rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: BORDER }}>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ background: `${it.tone}14`, color: it.tone }}>
                  <it.Icon className="h-5 w-5" />
                </span>
                <p className="mt-3 text-base font-extrabold" style={{ color: NAVY }}>{it.title}</p>
                <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: INK_SOFT }}>{it.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   7. Témoignage + FAQ courte
   ============================================================ */
function MgTestimonial() {
  return (
    <section className="relative bg-white py-14 sm:py-16 lg:py-20" style={{ fontFamily: FONT }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
          {/* Témoignage */}
          <Reveal>
            <div className="flex h-full flex-col rounded-3xl border bg-white p-6 shadow-[0_24px_60px_-30px_rgba(15,31,77,0.30)] sm:p-7" style={{ borderColor: BORDER }}>
              <span className="inline-flex items-center gap-2 self-start rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em]"
                style={{ background: '#FCEAEC', borderColor: 'rgba(192,17,46,0.22)', color: RED }}>
                <Quote className="h-3 w-3" /> Ils ont choisi Major ECN
              </span>
              <div className="mt-5 flex items-center gap-4">
                <img src="/temoignages/drbilly.png" alt="Dr Bill Baron WANKPO" className="h-16 w-16 rounded-full object-cover" />
                <div>
                  <p className="text-base font-extrabold" style={{ color: NAVY }}>Dr Bill Baron WANKPO</p>
                  <p className="text-[12.5px] font-semibold" style={{ color: RED }}>Lauréat des EVC de Médecine Générale</p>
                </div>
              </div>
              <p className="mt-5 text-[14.5px] leading-relaxed" style={{ color: INK_SOFT }}>
                « J’ai présenté le concours de médecine générale pour la première
                fois après avoir préparé les épreuves avec Major ECN, et j’ai eu la
                satisfaction de réussir avec de bonnes notes. Les examens blancs
                réalisés dans des conditions proches du concours m’ont également
                beaucoup aidé. Je recommande cette préparation pour réussir les EVC
                grâce à une préparation structurée et ciblée, et améliorer sa
                pratique médicale quotidienne. »
              </p>
              <ul className="mt-5 grid grid-cols-3 gap-3 border-t pt-4" style={{ borderColor: BORDER }}>
                {[
                  { Icon: Trophy, big: 'Mention', sub: 'EVC' },
                  { Icon: Award,  big: '92/120', sub: 'écrit blanc' },
                  { Icon: Clock,  big: '8 mois', sub: 'de préparation' },
                ].map((s, i) => (
                  <li key={i} className="flex flex-col items-start gap-1">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: '#FCEAEC', color: RED }}>
                      <s.Icon className="h-4 w-4" />
                    </span>
                    <p className="text-[12.5px] font-extrabold" style={{ color: NAVY }}>{s.big}</p>
                    <p className="text-[11px]" style={{ color: INK_SOFT }}>{s.sub}</p>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* FAQ courte */}
          <Reveal delay={0.08}>
            <div className="flex h-full flex-col gap-4 rounded-3xl border bg-white p-6 shadow-sm sm:p-7" style={{ borderColor: BORDER }}>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em]" style={{ color: RED }}>Questions fréquentes</p>
              <p className="text-xl font-extrabold" style={{ color: NAVY }}>Tout savoir sur la préparation MG</p>
              <ul className="mt-2 space-y-3">
                {[
                  {
                    q: 'Suis-je éligible aux EVC en médecine générale ?',
                    a: 'Les EVC concernent tous les médecins titulaires d’un diplôme hors UE. La spécialité visée est libre, sous réserve du quota annuel.',
                  },
                  {
                    q: 'Combien de temps prévoir ?',
                    a: 'Compter 4 à 12 mois selon votre niveau initial et votre disponibilité hebdomadaire. Nous adaptons votre planning.',
                  },
                  {
                    q: 'Y a-t-il un suivi individuel ?',
                    a: 'Oui : un coach pédagogique vous est attribué dès l’inscription. Visios individuelles, messagerie 6j/7, corrections personnalisées.',
                  },
                  {
                    q: 'Quel format pour l’épreuve EVC MG ?',
                    a: 'L’EVC comprend QCM, cas cliniques et entretien. Notre programme couvre les trois formats avec entraînements ciblés.',
                  },
                ].map((f, i) => (
                  <li key={i}>
                    <p className="text-[13.5px] font-extrabold" style={{ color: NAVY }}>{f.q}</p>
                    <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: INK_SOFT }}>{f.a}</p>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   8. CTA final
   ============================================================ */
function MgCTA() {
  return (
    <section className="relative overflow-hidden py-14 sm:py-16 lg:py-20" style={{ fontFamily: FONT, background: `linear-gradient(135deg, ${NAVY_DEEP} 0%, ${NAVY} 60%, ${RED_DEEP} 100%)` }}>
      <span aria-hidden className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full"
        style={{ background: 'radial-gradient(closest-side, rgba(232,116,44,0.30), rgba(255,255,255,0))' }} />
      <span aria-hidden className="pointer-events-none absolute -left-32 -bottom-20 h-[360px] w-[360px] rounded-full"
        style={{ background: 'radial-gradient(closest-side, rgba(212,175,55,0.25), rgba(255,255,255,0))' }} />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.22em] text-white backdrop-blur">
            <Sparkles className="h-3 w-3" /> Inscription ouverte — session 2026
          </span>
          <h2 className="mt-5 text-3xl font-black leading-[1.05] tracking-tight text-white sm:text-4xl lg:text-5xl"
            style={{ letterSpacing: '-0.02em' }}>
            Prêt à réussir les EVC en <span style={{ color: '#F5D597' }}>Médecine Générale</span>&nbsp;?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-white/85">
            Rejoignez la plateforme de référence des PADHUE pour la préparation à
            la médecine générale&nbsp;: programme complet, correcteurs MG, suivi
            humain.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link href="/inscription"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold shadow-lg transition-transform hover:scale-[1.02]"
              style={{ color: RED }}>
              Démarrer ma préparation MG <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/specialites"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition-transform hover:scale-[1.02]">
              Voir les autres spécialités
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   PAGE
   ============================================================ */
export function MedecineGeneralePageContent() {
  return (
    <main className="bg-white">
      <Crumbs />
      <MgHero />
      <MgMetrics />
      <MgDomains />
      <MgAccompagnement />
      <MgProgramme />
      <MgWhy />
      <MgTestimonial />
      <MgCTA />
    </main>
  );
}

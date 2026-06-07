'use client';
/**
 * Page FAQ — refonte pixel-perfect (maquette designer).
 * Header titre + sous-titre + 4 mini-cartes + carte rouge "?"
 * Layout 2 colonnes : grand accordéon (14 catégories) + sidebar (3 cartes).
 * En-bas : "Questions les plus posées" (5 cartes), CTA final.
 */

import Link from 'next/link';
import {
  ArrowRight, BookOpen, Calendar, CheckCircle2, ChevronRight,
  GraduationCap, HelpCircle, Layers3, MessageCircle, Sparkles, Stethoscope, TrendingUp,
  Users,
} from 'lucide-react';
import { Reveal } from './reveal';
import { FaqAccordion } from './faq-accordion';
import { FAQ_CATEGORIES } from '@/lib/data/faq-categories';

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
   1. HERO
   ============================================================ */
function FaqHero() {
  const features = [
    { Icon: BookOpen,    label: 'Avant',         sub: 'Tout savoir pour bien démarrer',  tone: RED },
    { Icon: Sparkles,    label: 'Sur mesure',    sub: 'Réponses calibrées par catégorie', tone: '#E8742C' },
    { Icon: Users,       label: 'Pour tous',     sub: 'PADHUE, médecins exerçant en France', tone: '#2563EB' },
    { Icon: CheckCircle2,label: 'Inscriptions ouvertes', sub: 'Démarrez votre préparation', tone: '#0F8A6A' },
  ];
  return (
    <section className="relative overflow-hidden bg-white pt-6 pb-10 sm:pb-12 lg:pb-16" style={{ fontFamily: FONT }}>
      <nav className="mx-auto max-w-7xl px-4 pt-2 text-[12px] font-semibold sm:px-6 lg:px-8" style={{ color: INK_MUTED }} aria-label="Fil d’ariane">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link href="/" className="hover:underline">Accueil</Link></li>
          <li><ChevronRight className="h-3 w-3" /></li>
          <li style={{ color: NAVY }}>Foire aux questions</li>
        </ol>
      </nav>

      <div aria-hidden className="pointer-events-none absolute -left-40 -top-40 -z-10 h-[460px] w-[460px] rounded-full bg-[#C0112E]/6 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 -z-10 h-[420px] w-[420px] rounded-full bg-[#0F1F4D]/5 blur-3xl" />

      <div className="mx-auto mt-4 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-14">
          {/* LEFT */}
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em]"
              style={{ background: '#FCEAEC', borderColor: 'rgba(192,17,46,0.22)', color: RED }}>
              <HelpCircle className="h-3.5 w-3.5" /> Foire aux questions
            </span>
            <h1 className="mt-5 text-4xl font-black leading-[1.02] tracking-tight sm:text-5xl lg:text-[3.4rem]"
              style={gradientText(GRAD_NAVY_RED)}>
              Foire aux Questions (FAQ){' '}
              <span className="whitespace-nowrap" style={gradientText(GRAD_BURGUNDY)}>– EVC (PAE)</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed sm:text-[17px]" style={{ color: INK_SOFT }}>
              Réponses aux principales questions sur les Épreuves de Vérification
              des Connaissances (EVC). Vous trouverez ici de quoi vous repérer dans
              la Procédure d’Autorisation d’Exercice (PAE), choisir votre
              préparation et comprendre les attentes du jury.
            </p>

            {/* 4 mini-cartes */}
            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {features.map((f, i) => (
                <div key={i} className="rounded-2xl border bg-white p-3 shadow-sm" style={{ borderColor: BORDER }}>
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{ background: `${f.tone}14`, color: f.tone }}>
                    <f.Icon className="h-4 w-4" />
                  </span>
                  <p className="mt-2 text-[12.5px] font-extrabold" style={{ color: NAVY }}>{f.label}</p>
                  <p className="text-[11px] leading-tight" style={{ color: INK_SOFT }}>{f.sub}</p>
                </div>
              ))}
            </div>
          </Reveal>

          {/* RIGHT — carte rouge "?" */}
          <Reveal delay={0.08}>
            <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-[#C0112E] via-[#8B0E22] to-[#6B1A2A] p-6 text-white shadow-[0_30px_80px_-30px_rgba(192,17,46,0.55)] sm:p-7"
              style={{ borderColor: 'rgba(255,255,255,0.18)' }}>
              <span aria-hidden className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/15 blur-3xl" />
              <span aria-hidden className="absolute -bottom-12 -left-10 h-44 w-44 rounded-full bg-[#E8742C]/30 blur-3xl" />

              <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] backdrop-blur">
                <Sparkles className="h-3 w-3" /> Une question particulière ?
              </span>

              <div className="mt-4 flex items-start gap-5">
                <span className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-white/15 backdrop-blur sm:h-32 sm:w-32">
                  <HelpCircle className="h-16 w-16 text-white sm:h-20 sm:w-20" strokeWidth={1.4} />
                </span>
                <div>
                  <p className="text-xl font-extrabold leading-tight sm:text-2xl">Vous ne trouvez pas votre réponse&nbsp;?</p>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-white/85">
                    Notre équipe vous répond personnellement sous 24&nbsp;h
                    ouvrées. Posez votre question, on s’occupe du reste.
                  </p>
                  <Link href="/contact"
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[13px] font-bold shadow-md transition-transform hover:scale-[1.02]"
                    style={{ color: RED }}>
                    Poser ma question <ArrowRight className="h-4 w-4" />
                  </Link>
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
   2. Layout 2 colonnes : accordéon + sidebar
   ============================================================ */
function FaqMain() {
  return (
    <section className="relative pt-2 pb-14 sm:pb-16 lg:pb-20" style={{ fontFamily: FONT, background: SOFT_BG }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.55fr_1fr] lg:gap-8">

          {/* ============ LEFT — Accordéon avec recherche ============ */}
          <Reveal>
            <FaqAccordion categories={FAQ_CATEGORIES} />
          </Reveal>

          {/* ============ RIGHT — Sidebar ============ */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            {/* Carte 1 — pas trouvé ? */}
            <Reveal>
              <div className="rounded-3xl border bg-white p-5 shadow-sm sm:p-6" style={{ borderColor: BORDER }}>
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl"
                  style={{ background: '#FCEAEC', color: RED }}>
                  <MessageCircle className="h-5 w-5" />
                </span>
                <p className="mt-3 text-base font-extrabold" style={{ color: NAVY }}>
                  Vous ne trouvez pas la réponse à votre question&nbsp;?
                </p>
                <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: INK_SOFT }}>
                  Notre équipe répond personnellement sous 24&nbsp;h ouvrées.
                </p>
                <Link href="/contact"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-bold text-white shadow-[0_12px_30px_-12px_rgba(192,17,46,0.55)] transition-transform hover:scale-[1.02]"
                  style={{ background: `linear-gradient(135deg, ${RED} 0%, ${RED_DEEP} 100%)` }}>
                  Nous contacter <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>

            {/* Carte 2 — Pourquoi Major ECN ? */}
            <Reveal delay={0.06}>
              <div className="rounded-3xl border bg-white p-5 shadow-sm sm:p-6" style={{ borderColor: BORDER }}>
                <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em]"
                  style={{ background: '#FCEAEC', borderColor: 'rgba(192,17,46,0.22)', color: RED }}>
                  <Sparkles className="h-3 w-3" /> Pourquoi Major ECN
                </span>
                <p className="mt-3 text-base font-extrabold" style={{ color: NAVY }}>Pourquoi choisir Major ECN&nbsp;?</p>
                <ul className="mt-3 space-y-2.5">
                  {[
                    { Icon: Calendar,      t: 'Depuis 2011, +18 ans d’expérience' },
                    { Icon: GraduationCap, t: '+45 spécialités préparées' },
                    { Icon: Stethoscope,   t: 'Correcteurs spécialistes en activité' },
                    { Icon: Layers3,       t: 'Révisions transversales & flashcards' },
                    { Icon: TrendingUp,    t: 'Concours blancs corrigés EVC' },
                  ].map((it, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: '#FCEAEC', color: RED }}>
                        <it.Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-[13px] leading-snug" style={{ color: NAVY }}>{it.t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            {/* Carte 3 — Tester 7 jours */}
            <Reveal delay={0.12}>
              <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-[#C0112E] via-[#8B0E22] to-[#0F1F4D] p-5 text-white shadow-[0_24px_60px_-24px_rgba(192,17,46,0.55)] sm:p-6"
                style={{ borderColor: 'rgba(255,255,255,0.18)' }}>
                <span aria-hidden className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/15 blur-3xl" />
                <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[10.5px] font-extrabold uppercase tracking-[0.22em] backdrop-blur">
                  <Sparkles className="h-3 w-3" /> Essai gratuit
                </span>
                <p className="mt-3 text-base font-extrabold leading-tight">
                  Tester Major ECN pendant 7&nbsp;jours
                </p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/85">
                  Accès complet à la plateforme, sans carte bancaire.
                </p>
                <Link href="/inscription"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[13px] font-bold shadow-md transition-transform hover:scale-[1.02]"
                  style={{ color: RED }}>
                  Démarrer l’essai <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
          </aside>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   3. Questions les plus posées (top 5)
   ============================================================ */
function TopQuestions() {
  const top = [
    { q: "Qu'est-ce que les EVC ?",                            cat: 'Questions sur les EVC',         id: 'evc' },
    { q: "Combien de temps faut-il préparer les EVC ?",        cat: 'Préparation',                   id: 'preparation' },
    { q: "Pourquoi choisir Major ECN ?",                       cat: 'À propos de Major ECN',         id: 'major-ecn' },
    { q: "Comment s'inscrire à une préparation Major ECN ?",   cat: 'Inscription',                   id: 'inscription' },
    { q: "Préparez-vous plus de 45 spécialités ?",             cat: 'Par spécialité',                id: 'par-specialite' },
  ];
  return (
    <section className="relative bg-white py-14 sm:py-16 lg:py-20" style={{ fontFamily: FONT }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em]"
            style={{ background: '#FCEAEC', borderColor: 'rgba(192,17,46,0.22)', color: RED }}>
            <TrendingUp className="h-3 w-3" /> Le top des candidats
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl" style={gradientText(GRAD_NAVY_RED)}>
            Questions les plus posées
          </h2>
          <p className="mt-3 text-[15px]" style={{ color: INK_SOFT }}>
            Les questions revenues le plus souvent dans nos échanges avec les
            futurs candidats EVC.
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-3 lg:grid-cols-2">
          {top.map((t, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <Link href={`#${t.id}`}
                className="flex items-center gap-3 rounded-2xl border bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{ borderColor: BORDER }}>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: '#FCEAEC', color: RED }}>
                  <HelpCircle className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10.5px] font-extrabold uppercase tracking-wider" style={{ color: RED }}>{t.cat}</p>
                  <p className="truncate text-[14px] font-extrabold" style={{ color: NAVY }}>{t.q}</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0" style={{ color: INK_MUTED }} />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   4. CTA final
   ============================================================ */
function FaqCTA() {
  return (
    <section className="relative overflow-hidden py-14 sm:py-16 lg:py-20" style={{ fontFamily: FONT, background: `linear-gradient(135deg, ${NAVY_DEEP} 0%, ${NAVY} 60%, ${RED_DEEP} 100%)` }}>
      <span aria-hidden className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full"
        style={{ background: 'radial-gradient(closest-side, rgba(232,116,44,0.30), rgba(255,255,255,0))' }} />
      <span aria-hidden className="pointer-events-none absolute -left-32 -bottom-20 h-[360px] w-[360px] rounded-full"
        style={{ background: 'radial-gradient(closest-side, rgba(212,175,55,0.25), rgba(255,255,255,0))' }} />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.22em] text-white backdrop-blur">
            <Sparkles className="h-3 w-3" /> Prêt à passer à l’action
          </span>
          <h2 className="mt-5 text-3xl font-black leading-[1.05] tracking-tight text-white sm:text-4xl lg:text-5xl"
            style={{ letterSpacing: '-0.02em' }}>
            Prêt à réussir les EVC&nbsp;?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-white/85">
            Démarrez votre préparation aux EVC (PAE) avec la plateforme de
            référence des PADHUE. Programmes complets, correcteurs spécialistes,
            suivi humain.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link href="/inscription"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold shadow-lg transition-transform hover:scale-[1.02]"
              style={{ color: RED }}>
              Démarrer ma préparation <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/contact"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition-transform hover:scale-[1.02]">
              Parler à un conseiller
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
export function FaqPageContent() {
  return (
    <main className="bg-white">
      <FaqHero />
      <FaqMain />
      <TopQuestions />
      <FaqCTA />
    </main>
  );
}

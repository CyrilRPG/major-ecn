'use client';
/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import {
  ArrowRight, BookOpen, Calendar, Check, CheckCircle2, ClipboardCheck, Clock,
  FileText, GraduationCap, Heart, Layers3, LineChart, MessageCircle, Play, Shield, ShieldCheck,
  Smartphone, Sparkles, Star, Stethoscope, Target, TrendingUp, Trophy, Users, Video, Zap,
} from 'lucide-react';
import { Reveal } from './reveal';
import { FAQSection } from './manus-sections';
import { EspaceDecouverteSection } from './extra-sections';
import {
  AnimatedCounter, ComparisonTable, GlassCard, MarqueeScroll,
  MeshGradient, NoiseTexture, SpotlightCard,
} from './premium-ui';

const NAVY = '#0F1F4D';
const RED = '#C0112E';
const RED_SOFT = '#FDE8EC';
const GREEN = '#2E7D32';
const GREEN_SOFT = '#E8F5E9';
const PURPLE = '#7C3AED';
const PURPLE_SOFT = '#EDE9FE';
const INK = '#1F2937';
const INK_SOFT = '#5B6478';
const BORDER = '#E5E9F0';
const FONT = "'Plus Jakarta Sans', sans-serif";

const SPECIALTIES = [
  'Médecine Générale', 'Radiologie', 'Gériatrie', 'Pédiatrie',
  'Psychiatrie', 'Cardiologie', 'Pneumologie', 'Néphrologie',
];

export function TarifsPageContent() {
  return (
    <div className="relative overflow-hidden" style={{ fontFamily: FONT, background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFBFF 30%, #FFF8F9 60%, #FAFBFF 90%, #FFFFFF 100%)' }}>
      {/* Mesh gradient global animé */}
      <MeshGradient />
      <NoiseTexture opacity={0.025} />

      {/* ═══ MARQUEE en tout en haut ═══ */}
      <div className="relative border-y bg-gradient-to-r from-[#0F1F4D] via-[#1A2F70] to-[#0F1F4D] py-3 text-white" style={{ borderColor: 'rgba(255,255,255,0.10)' }}>
        <MarqueeScroll
          items={[
            '✦ 9 000+ médecins accompagnés',
            '✦ 45 spécialités EVC préparées',
            '✦ Depuis 2011',
            '✦ Plateforme certifiée Stripe',
            '✦ Données chiffrées AES-256',
            '✦ RGPD conformité totale',
            '✦ Voie interne et voie externe',
          ]}
          speed={45}
          className="text-white/90"
        />
      </div>

      {/* ═══ HERO ultra-premium ═══ */}
      <section className="relative pt-12 pb-14 sm:pt-16 sm:pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Badge top — étoile + texte */}
          <Reveal>
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border bg-white/85 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] shadow-[0_10px_30px_-12px_rgba(192,17,46,0.30)] backdrop-blur-sm" style={{ borderColor: 'rgba(192,17,46,0.20)', color: RED }}>
                <Star className="h-3.5 w-3.5" fill="currentColor" />
                Préparation EVC nº 1 en France
              </span>
            </div>
          </Reveal>

          {/* Titre ultra premium avec text-balance */}
          <Reveal delay={0.1}>
            <h1 className="mt-7 text-balance text-center text-[2.25rem] font-black leading-[1.04] tracking-tight sm:text-[3.25rem] lg:text-[4rem]">
              <span style={{ color: NAVY }}>Tarifs des préparations</span>
              <br />
              <span style={{ backgroundImage: 'linear-gradient(90deg, #6B1A2A 0%, #C0112E 45%, #E8742C 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent' }}>
                EVC (PAE)
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mx-auto mt-6 max-w-2xl text-center text-[15.5px] leading-relaxed sm:text-[17px]" style={{ color: INK_SOFT }}>
              Préparations destinées aux médecins diplômés hors Union Européenne préparant les{' '}
              <strong style={{ color: NAVY }}>Épreuves de Vérification des Connaissances (EVC)</strong> dans le cadre de la
              Procédure d{"'"}Autorisation d{"'"}Exercice (PAE).
            </p>
          </Reveal>

          {/* 3 KPIs avec compteurs animés */}
          <Reveal delay={0.3}>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { Icon: Users, end: 9000, suffix: '+', label: 'médecins accompagnés', accent: RED },
                { Icon: GraduationCap, end: 45, label: 'spécialités préparées', accent: PURPLE },
                { Icon: Calendar, end: 15, suffix: ' ans', label: "d'expertise EVC", accent: GREEN },
              ].map((s, i) => (
                <SpotlightCard
                  key={i}
                  spotlightColor={`${s.accent}22`}
                  className="rounded-2xl border bg-white shadow-[0_8px_28px_-12px_rgba(15,31,77,0.12)] transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_-12px_rgba(15,31,77,0.20)]"
                  style={{ borderColor: BORDER }}
                >
                  <div className="p-5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: `${s.accent}15`, color: s.accent }}>
                        <s.Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-[26px] font-black leading-none tabular-nums" style={{ color: s.accent }}>
                          <AnimatedCounter end={s.end} suffix={s.suffix} duration={1500} />
                        </p>
                        <p className="mt-1 text-[12px] font-semibold leading-tight" style={{ color: INK_SOFT }}>{s.label}</p>
                      </div>
                    </div>
                  </div>
                </SpotlightCard>
              ))}
            </div>
          </Reveal>

          {/* Trust badges row certif */}
          <Reveal delay={0.4}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[12px] font-semibold" style={{ color: INK_SOFT }}>
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" style={{ color: RED }} /> Paiement Stripe certifié</span>
              <span aria-hidden style={{ color: BORDER }}>·</span>
              <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" style={{ color: RED }} /> RGPD conforme</span>
              <span aria-hidden style={{ color: BORDER }}>·</span>
              <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5" style={{ color: RED }} /> Activation immédiate</span>
              <span aria-hidden style={{ color: BORDER }}>·</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" style={{ color: RED }} /> Données chiffrées AES-256</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ SPECIALITES ═══ */}
      <section className="bg-white pb-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border p-5" style={{ borderColor: BORDER }}>
            <p className="text-center text-[12px] font-extrabold uppercase tracking-[0.14em]" style={{ color: NAVY }}>
              <Stethoscope className="mr-1.5 inline h-4 w-4" style={{ color: RED }} />
              Plus de 45 spécialités préparées
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {SPECIALTIES.map(s => (
                <span key={s} className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold"
                  style={{ borderColor: BORDER, color: NAVY }}>{s}</span>
              ))}
              <span className="inline-flex items-center rounded-full px-3 py-1.5 text-[12px] font-bold" style={{ background: RED_SOFT, color: RED }}>
                + 37 autres spécialités
              </span>
            </div>
            <div className="mt-4 text-center">
              <Link href="/specialites" className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-[13px] font-bold text-white" style={{ background: GREEN }}>
                Découvrir les 45 spécialités préparées <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ IMPORTANT ═══ */}
      <section className="bg-white pb-6">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4 rounded-xl border-l-4 bg-[#F8F9FC] p-5" style={{ borderColor: NAVY }}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: '#E0E7F1', color: NAVY }}>
              <Shield className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[14px] font-extrabold" style={{ color: RED }}>IMPORTANT</p>
              <p className="mt-1 text-[13px] leading-relaxed" style={{ color: INK }}>
                Les tarifs et programmes varient selon les spécialités préparées.<br />
                La Médecine Générale est présentée ci-dessous à titre d{"'"}exemple détaillé de préparation et de tarification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ EXEMPLE HEADER ═══ */}
      <section className="bg-white pb-5">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-[17px] font-extrabold" style={{ color: NAVY }}>
            Exemple détaillé : Préparation <span className="underline decoration-2" style={{ color: RED, textDecorationColor: RED }}>EVC Médecine Générale (PAE)</span>
          </p>
        </div>
      </section>

      {/* ═══ 3 FORMULES — Cards SpotlightCard premium ═══ */}
      <section className="relative pb-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-5 md:grid-cols-3 items-stretch">
            {/* Essentielle — Spotlight + lift hover */}
            <SpotlightCard spotlightColor={`${GREEN}22`} className="rounded-3xl border-2 bg-white p-px shadow-[0_10px_30px_-15px_rgba(46,125,50,0.20)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_45px_-15px_rgba(46,125,50,0.30)]" style={{ borderColor: 'rgba(46,125,50,0.18)' }}>
              <div className="flex h-full flex-col rounded-[calc(1.5rem-1px)] p-6 sm:p-7">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: GREEN_SOFT, color: GREEN }}>
                    <BookOpen className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.14em]" style={{ color: GREEN }}>FORMULE</p>
                    <p className="text-[18px] font-black leading-none" style={{ color: GREEN }}>ESSENTIELLE</p>
                  </div>
                </div>
                <p className="mt-3 text-[13.5px]" style={{ color: INK_SOFT }}>S{"'"}entraîner efficacement aux EVC</p>
                <div className="mt-4 flex items-baseline gap-2">
                  <p className="text-[40px] font-black leading-none" style={{ color: GREEN }}>495 &#8364;</p>
                  <span className="text-[12px]" style={{ color: INK_SOFT }}>paiement unique</span>
                </div>
                <p className="mt-1 text-[11.5px]" style={{ color: INK_SOFT }}>ou <strong style={{ color: GREEN }}>165 €/mois</strong> en 3 fois</p>
                <ul className="mt-5 flex-1 space-y-2">
                  {["Plateforme EVC accès illimité", "QCM d'entraînement", 'Dossiers et exercices corrigés', 'Fiches de synthèse', 'Suivi de progression', '1 séance vidéo de méthodologie EVC'].map(f => (
                    <li key={f} className="flex items-start gap-2 text-[13.5px]" style={{ color: INK }}>
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full" style={{ background: GREEN_SOFT, color: GREEN }}>
                        <Check className="h-2.5 w-2.5" strokeWidth={3} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/formules/essentielle" className="group/btn mt-6 flex items-center justify-center gap-2 rounded-xl py-3 text-[13.5px] font-extrabold text-white shadow-[0_10px_24px_-10px_rgba(46,125,50,0.55)] transition-transform hover:scale-[1.02]" style={{ background: `linear-gradient(90deg, #1B5E20 0%, ${GREEN} 100%)` }}>
                  Commencer avec Essentielle <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                </Link>
                <p className="mt-2 text-center text-[11px]" style={{ color: INK_SOFT }}>Espace découverte gratuit &#183; Sans engagement</p>
              </div>
            </SpotlightCard>

            {/* Intensive — Badge RECOMMANDÉ + scale up */}
            <SpotlightCard spotlightColor={`${RED}25`} className="relative rounded-3xl p-px shadow-[0_15px_40px_-15px_rgba(192,17,46,0.30)] transition-all hover:-translate-y-1.5 hover:shadow-[0_25px_55px_-15px_rgba(192,17,46,0.40)] lg:-mt-3 lg:scale-[1.03]" style={{ background: `linear-gradient(135deg, ${RED} 0%, #8B0E22 100%)` }}>
              {/* Badge "RECOMMANDÉ" */}
              <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-white shadow-lg" style={{ background: `linear-gradient(90deg, #E8742C 0%, ${RED} 100%)` }}>
                ⭐ Recommandé
              </span>
              <div className="flex h-full flex-col rounded-[calc(1.5rem-1px)] bg-white p-6 sm:p-7">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: RED_SOFT, color: RED }}>
                    <Target className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.14em]" style={{ color: RED }}>FORMULE</p>
                    <p className="text-[18px] font-black leading-none" style={{ color: RED }}>INTENSIVE</p>
                  </div>
                </div>
                <p className="mt-3 text-[13.5px]" style={{ color: INK_SOFT }}>Révisions ciblées EVC</p>
                <p className="mt-2 text-[12.5px] font-semibold" style={{ color: INK }}>Deux parcours au choix :</p>
                <div className="mt-1.5 flex gap-2">
                  <span className="rounded-full border px-2.5 py-0.5 text-[11px] font-bold" style={{ borderColor: RED, color: RED }}>VOIE INTERNE</span>
                  <span className="rounded-full border px-2.5 py-0.5 text-[11px] font-bold" style={{ borderColor: RED, color: RED }}>VOIE EXTERNE</span>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <p className="text-[40px] font-black leading-none" style={{ color: RED }}>995 &#8364;</p>
                  <span className="text-[12px]" style={{ color: INK_SOFT }}>paiement unique</span>
                </div>
                <p className="mt-1 text-[11.5px]" style={{ color: INK_SOFT }}>ou <strong style={{ color: RED }}>332 €/mois</strong> en 3 fois</p>
                <ul className="mt-5 flex-1 space-y-2">
                  {['Tout le contenu de la formule Essentielle', 'Environ 20 heures de révision ciblée', 'QCM supplémentaires expliqués', 'Méthodologie avancée EVC', '2 épreuves blanches', 'Corrections détaillées'].map(f => (
                    <li key={f} className="flex items-start gap-2 text-[13.5px]" style={{ color: INK }}>
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full" style={{ background: RED_SOFT, color: RED }}>
                        <Check className="h-2.5 w-2.5" strokeWidth={3} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/formules/intensive" className="group/btn mt-6 flex items-center justify-center gap-2 rounded-xl py-3 text-[13.5px] font-extrabold text-white shadow-[0_10px_24px_-10px_rgba(192,17,46,0.55)] transition-transform hover:scale-[1.02]" style={{ background: `linear-gradient(90deg, #8B0E22 0%, ${RED} 100%)` }}>
                  Choisir Intensive <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                </Link>
                <p className="mt-2 text-center text-[11px]" style={{ color: INK_SOFT }}>La plus choisie par nos candidats</p>
              </div>
            </SpotlightCard>

            {/* Programme Approfondi — Spotlight + glassmorphism violet */}
            <SpotlightCard spotlightColor={`${PURPLE}20`} className="relative rounded-3xl border-2 bg-white p-px shadow-[0_10px_30px_-15px_rgba(124,58,237,0.25)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_45px_-15px_rgba(124,58,237,0.35)]" style={{ borderColor: PURPLE }}>
              <div className="flex h-full flex-col rounded-[calc(1.5rem-1px)] p-6 sm:p-7">
                <span className="self-start inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white shadow-md" style={{ background: 'linear-gradient(90deg, #F59E0B 0%, #E8742C 100%)' }}>
                  <Star className="h-3 w-3" fill="currentColor" /> REMISE À NIVEAU APPROFONDIE
                </span>
                <div className="mt-3 flex items-center gap-2.5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: PURPLE_SOFT, color: PURPLE }}>
                    <GraduationCap className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.14em]" style={{ color: PURPLE }}>PROGRAMME</p>
                    <p className="text-[18px] font-black leading-none" style={{ color: PURPLE }}>APPROFONDI</p>
                  </div>
                </div>
                <p className="mt-3 text-[13.5px]" style={{ color: INK_SOFT }}>Remise à niveau approfondie et préparation complète</p>
                <p className="mt-4 text-[12px]" style={{ color: INK_SOFT }}>À partir de</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-[40px] font-black leading-none" style={{ color: PURPLE }}>2 395 &#8364;</p>
                  <span className="text-[12px]" style={{ color: INK_SOFT }}>sur-mesure</span>
                </div>
                <p className="mt-1 text-[11.5px]" style={{ color: INK_SOFT }}>Conseiller dédié <strong style={{ color: PURPLE }}>· rappel sous 24 h</strong></p>
                <ul className="mt-5 flex-1 space-y-2">
                  {['Plateforme EVC accès illimité', 'Remise à niveau et préparation complète', 'Reprise approfondie des spécialités majeures', 'Cours de remise à niveau associés à des dossiers cliniques', 'Résolution progressive de dossiers inspirés des EVC', 'Interrogations régulières pour évaluer la progression', 'Épreuves blanches', 'Séances de révision dédiées', 'Accompagnement pédagogique personnalisé'].map(f => (
                    <li key={f} className="flex items-start gap-2 text-[13.5px]" style={{ color: INK }}>
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full" style={{ background: PURPLE_SOFT, color: PURPLE }}>
                        <Check className="h-2.5 w-2.5" strokeWidth={3} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/formules/programme-approfondi" className="group/btn mt-6 flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-[13.5px] font-extrabold transition-all hover:bg-[#EDE9FE]" style={{ borderColor: PURPLE, color: PURPLE }}>
                  Découvrir le programme <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                </Link>
                <p className="mt-2 text-center text-[11px]" style={{ color: INK_SOFT }}>Programme sur-mesure · Conseiller dédié</p>
              </div>
            </SpotlightCard>
          </div>

          {/* ═══ TABLEAU COMPARATIF PREMIUM ═══ */}
          <div className="mt-16">
            <Reveal>
              <div className="text-center">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em]" style={{ color: RED }}>Comparatif détaillé</p>
                <h2 className="mt-2 text-[26px] font-black leading-tight sm:text-3xl" style={{ color: NAVY }}>
                  Choisissez la formule qui vous ressemble
                </h2>
              </div>
            </Reveal>
            <div className="mt-8">
              <ComparisonTable
                highlightCol={1}
                accentColor={RED}
                columns={[
                  { label: 'Essentielle',  price: '495 €',   sub: 'paiement unique' },
                  { label: 'Intensive',    price: '995 €',   sub: 'paiement unique' },
                  { label: 'Approfondi',   price: '2 395 €', sub: 'sur-mesure' },
                ]}
                rows={[
                  { feature: 'Plateforme EVC — accès illimité',          values: [true, true, true] },
                  { feature: 'QCM corrigés et justifiés',                values: [true, true, true] },
                  { feature: 'Fiches synthétiques',                       values: [true, true, true] },
                  { feature: 'Flashcards adaptatives',                    values: [true, true, true] },
                  { feature: 'Dossiers et exercices corrigés',           values: [true, true, true] },
                  { feature: 'Suivi de progression',                      values: [true, true, true] },
                  { feature: 'Séance(s) vidéo de méthodologie',          values: ['1', 'Avancée', 'Illimitées'] },
                  { feature: '+ 20 h de révision ciblée',                values: [false, true, true] },
                  { feature: 'QCM supplémentaires expliqués',            values: [false, true, true] },
                  { feature: 'Épreuves blanches',                         values: [false, '2', 'Multiples'] },
                  { feature: 'Reprise approfondie des spécialités',      values: [false, false, true] },
                  { feature: 'Interrogations régulières',                values: [false, false, true] },
                  { feature: 'Accompagnement pédagogique personnalisé',  values: [false, false, true] },
                  { feature: 'Conseiller dédié + rappel téléphonique',   values: [false, false, true] },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TRUST BADGES ═══ */}
      <section className="bg-[#F8F9FC] py-6">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-5 text-center">
            {[
              { Icon: Zap, t: 'Accès immédiat', sub: 'après inscription' },
              { Icon: Shield, t: 'Sans carte', sub: 'bancaire' },
              { Icon: Check, t: 'Sans', sub: 'engagement' },
              { Icon: Clock, t: 'Annulation', sub: 'instantanée' },
              { Icon: ShieldCheck, t: 'Paiement', sub: 'sécurisé' },
            ].map(b => (
              <div key={b.t} className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: RED_SOFT, color: RED }}>
                  <b.Icon className="h-3.5 w-3.5" />
                </span>
                <div className="text-left">
                  <p className="text-[12px] font-bold" style={{ color: NAVY }}>{b.t}</p>
                  <p className="text-[10px]" style={{ color: INK_SOFT }}>{b.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ QUELLE FORMULE CHOISIR ═══ */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-xl font-black uppercase tracking-wider" style={{ color: NAVY }}>
            QUELLE FORMULE CHOISIR ?
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              { color: GREEN, bg: GREEN_SOFT, border: GREEN, title: "Je souhaite principalement m'entraîner", desc: "Je possède déjà de bonnes bases et je veux m'entraîner avec des QCM, exercices et dossiers corrigés.", cta: 'Essentielle', href: '/formules/essentielle' },
              { color: RED, bg: RED_SOFT, border: RED, title: 'Je souhaite réviser de facon ciblée', desc: 'Je veux consolider mes connaissances avec des révisions structurées et des entraînements ciblés.', cta: 'Intensive', href: '/formules/intensive' },
              { color: PURPLE, bg: PURPLE_SOFT, border: PURPLE, title: 'Je souhaite reprendre les spécialités en profondeur', desc: 'Je souhaite reprendre les spécialités en profondeur avec un accompagnement complet et personnalisé.', cta: 'Programme approfondi', href: '/formules/programme-approfondi' },
            ].map(c => (
              <div key={c.title} className="rounded-2xl border p-5 text-center" style={{ borderColor: BORDER }}>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full" style={{ background: c.bg, color: c.color }}>
                  <Target className="h-5 w-5" />
                </span>
                <p className="mt-3 text-[14px] font-extrabold leading-tight" style={{ color: NAVY }}>{c.title}</p>
                <p className="mt-2 text-[12px] leading-relaxed" style={{ color: INK_SOFT }}>{c.desc}</p>
                <Link href={c.href} className="mt-3 inline-block rounded-full border px-4 py-1.5 text-[12px] font-bold" style={{ borderColor: c.color, color: c.color }}>
                  {c.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ INCLUS DANS TOUTES LES FORMULES ═══ */}
      <section className="bg-[#F8F9FC] py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-[13px] font-black uppercase tracking-wider" style={{ color: NAVY }}>
            INCLUS DANS TOUTES LES FORMULES
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { Icon: Smartphone, t: 'Plateforme en ligne' },
              { Icon: LineChart, t: 'Suivi pédagogique' },
              { Icon: Target, t: 'Méthodologie EVC' },
              { Icon: TrendingUp, t: 'Mises à jour régulières' },
              { Icon: MessageCircle, t: 'Support réactif' },
              { Icon: Clock, t: 'Accès 24h/24, 7j/7' },
            ].map(f => (
              <div key={f.t} className="flex flex-col items-center gap-2 rounded-xl border bg-white p-3 text-center" style={{ borderColor: BORDER }}>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: RED_SOFT, color: RED }}>
                  <f.Icon className="h-4 w-4" />
                </span>
                <p className="text-[11px] font-bold leading-tight" style={{ color: NAVY }}>{f.t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ DECOUVREZ LA PLATEFORME ═══ */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-black tracking-tight" style={{ color: NAVY }}>DÉCOUVREZ LA PLATEFORME MAJOR ECN</h2>
          <div className="mt-6 overflow-hidden rounded-2xl border shadow-lg" style={{ borderColor: BORDER }}>
            <img src="/accueil.png" alt="Apercu plateforme Major ECN" className="w-full" />
          </div>
        </div>
      </section>

      {/* ═══ POURQUOI CHOISIR ═══ */}
      <section className="bg-[#F8F9FC] py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-xl font-black tracking-tight" style={{ color: NAVY }}>POURQUOI CHOISIR MAJOR ECN ?</h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { Icon: Calendar, t: '15 ANS', sub: "D'EXPÉRIENCE", d: 'Depuis 2011, au service des médecins étrangers.' },
              { Icon: Users, t: '+ DE 9 000', sub: 'MÉDECINS ACCOMPAGNÉS', d: 'Toutes spécialités confondues.' },
              { Icon: GraduationCap, t: '45 SPÉCIALITÉS', sub: 'PRÉPARÉES', d: 'Médecine générale et spécialités médicales, chirurgicales.' },
              { Icon: Trophy, t: 'ENSEIGNANTS', sub: 'EXPÉRIMENTÉS', d: 'PH et CCA presents depuis plusieurs annees.' },
              { Icon: ClipboardCheck, t: 'DOSSIERS CLINIQUES', sub: 'QCM ET ÉVALUATIONS', d: 'Contenus fiables, à jour et conformes aux EVC.' },
            ].map(s => (
              <div key={s.t} className="rounded-xl border bg-white p-4 text-center" style={{ borderColor: '#F3D1D6' }}>
                <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full" style={{ background: RED_SOFT, color: RED }}>
                  <s.Icon className="h-4 w-4" />
                </span>
                <p className="mt-2 text-[13px] font-black" style={{ color: RED }}>{s.t}</p>
                <p className="text-[10px] font-bold" style={{ color: NAVY }}>{s.sub}</p>
                <p className="mt-1.5 text-[11px] leading-relaxed" style={{ color: INK_SOFT }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TEMOIGNAGES ═══ */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-xl font-black" style={{ color: NAVY }}>PLUS DE 9 000 MÉDECINS ACCOMPAGNÉS DEPUIS 2011</h2>
          <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { name: "Dr Faten Hnania", spec: "Médecine générale", year: "Lauréate EVC", photo: '/temoignages/drfaten.png' },
                { name: 'Dr Samy KABAWEH', spec: 'Radiologie', year: "Lauréat EVC", photo: '/temoignages/drsamy.jpg' },
                { name: "Dr Bill Baron WANKPO", spec: "Médecine générale", year: "Lauréat EVC", photo: '/temoignages/drbilly.png' },
              ].map(t => (
                <div key={t.name} className="text-center">
                  <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-xl">
                    <img src={t.photo} alt={t.name} className="h-full w-full object-cover" />
                    <span className="absolute bottom-1 left-1 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow">
                      <Play className="h-2.5 w-2.5" style={{ color: RED }} fill="currentColor" />
                    </span>
                  </div>
                  <p className="mt-2 text-[13px] font-extrabold" style={{ color: NAVY }}>{t.name}</p>
                  <p className="text-[11px]" style={{ color: INK_SOFT }}>{t.spec}</p>
                  <p className="text-[11px] font-bold" style={{ color: RED }}>{t.year}</p>
                  <div className="mt-0.5 flex justify-center gap-0.5">{[1,2,3,4,5].map(i => <Star key={i} className="h-2.5 w-2.5" style={{ color: '#F59E0B' }} fill="currentColor" />)}</div>
                </div>
              ))}
            </div>
            {/* Quote texte — vrai témoignage */}
            <div className="flex flex-col justify-center rounded-xl border p-5" style={{ borderColor: BORDER }}>
              <p className="text-[14px] italic leading-relaxed" style={{ color: INK }}>
                &ldquo;Les cours sont actualisés, clairs et réellement adaptés aux exigences du concours.
                Les épreuves blanches dans des conditions proches de l{"'"}examen permettent de se préparer
                concrètement au jour J.&rdquo;
              </p>
              <div className="mt-3 flex items-center gap-2">
                <p className="text-[12px] font-bold" style={{ color: NAVY }}>Dr Haykel Abdelbaki</p>
                <p className="text-[11px]" style={{ color: INK_SOFT }}>Radiologie — Lauréat des EVC</p>
              </div>
              <div className="mt-1 flex gap-0.5">{[1,2,3,4,5].map(i => <Star key={i} className="h-3 w-3" style={{ color: '#F59E0B' }} fill="currentColor" />)}</div>
            </div>
          </div>
          <div className="mt-6 text-center">
            <Link href="/temoignages" className="inline-flex items-center gap-2 rounded-full border px-5 py-2 text-[13px] font-bold" style={{ borderColor: RED, color: RED }}>
              Voir tous les témoignages <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ FAQ + Espace Découverte ═══ */}
      <FAQSection />
      <EspaceDecouverteSection />
    </div>
  );
}

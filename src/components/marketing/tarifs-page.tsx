'use client';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight, BookOpen, Calendar, Check, CheckCircle2, ClipboardCheck, Clock,
  FileText, GraduationCap, Headphones, Heart, Layers3, LineChart, Lock, MessageCircle, Play,
  Radio, RotateCcw, Shield, ShieldCheck, Smartphone, Sparkles, Star, Stethoscope, Target,
  TrendingUp, Trophy, Users, Video, Zap,
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
            '✦ toutes les spécialités EVC préparées',
            '✦ Depuis 2011',
            '✦ Voie interne et voie externe',
            '✦ Médecine, Pharmacie, Odontologie, Sage-femme',
          ]}
          speed={45}
          className="text-white/90"
        />
      </div>

      {/* ═══ HERO ultra-premium ═══ */}
      <section className="relative pt-12 pb-14 sm:pt-16 sm:pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Badge top — original */}
          <Reveal>
            <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-3 rounded-full border bg-white/80 px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider shadow-[0_10px_30px_-15px_rgba(15,31,77,0.20)] backdrop-blur-sm" style={{ borderColor: BORDER, color: NAVY }}>
              <span className="flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5" style={{ color: RED }} /> toutes les spécialités EVC</span>
              <span style={{ color: RED }}>&#8226;</span>
              <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" style={{ color: RED }} /> Plus de 9 000 médecins accompagnés</span>
              <span style={{ color: RED }}>&#8226;</span>
              <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" style={{ color: RED }} /> Depuis 2011</span>
            </div>
          </Reveal>

          {/* Titre — texte original avec gradient sur EVC (PAE) */}
          <Reveal delay={0.1}>
            <h1 className="mt-7 text-balance text-center text-[2rem] font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.25rem]">
              <span style={{ color: NAVY }}>Tarifs des préparations</span>{' '}
              <span style={{ backgroundImage: 'linear-gradient(90deg, #6B1A2A 0%, #C0112E 50%, #E8742C 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent' }}>
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

          {/* 3 KPIs originaux avec hover */}
          <Reveal delay={0.3}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-5">
              {[
                { Icon: Users, big: 'Plus de 9 000', sub: 'médecins accompagnés' },
                { Icon: GraduationCap, big: 'toutes les spécialités', sub: 'préparées' },
                { Icon: Calendar, big: 'Depuis 2011', sub: 'à vos côtés' },
              ].map(s => (
                <div key={s.big} className="flex items-center gap-2.5 rounded-2xl border bg-white px-4 py-2.5 shadow-[0_4px_16px_-6px_rgba(15,31,77,0.10)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-6px_rgba(15,31,77,0.18)]" style={{ borderColor: BORDER }}>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: RED_SOFT, color: RED }}>
                    <s.Icon className="h-4.5 w-4.5" />
                  </span>
                  <div className="text-left">
                    <p className="text-[14px] font-extrabold leading-tight" style={{ color: RED }}>{s.big}</p>
                    <p className="text-[11.5px] leading-tight" style={{ color: INK_SOFT }}>{s.sub}</p>
                  </div>
                </div>
              ))}
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
              Toutes les spécialités préparées
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
                Découvrir toutes les spécialités préparées <ArrowRight className="h-3.5 w-3.5" />
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
            {/* Essentielle */}
            <SpotlightCard spotlightColor={`${GREEN}22`} className="rounded-2xl border bg-white shadow-[0_8px_24px_-12px_rgba(46,125,50,0.20)] transition-all hover:-translate-y-1 hover:shadow-[0_16px_36px_-12px_rgba(46,125,50,0.30)]" style={{ borderColor: BORDER }}>
              <div className="flex h-full flex-col p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: GREEN_SOFT, color: GREEN }}>
                    <BookOpen className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: GREEN }}>FORMULE</p>
                    <p className="text-[19px] font-black leading-none" style={{ color: GREEN }}>ESSENTIELLE</p>
                  </div>
                </div>
                <p className="mt-3 text-[13.5px]" style={{ color: INK_SOFT }}>S{"'"}entraîner efficacement aux EVC</p>
                <p className="mt-3 text-[40px] font-black leading-none" style={{ color: GREEN }}>495 &#8364;</p>
                <p className="mt-1.5 text-[12.5px] font-semibold" style={{ color: GREEN }}>ou 165 &#8364;/mois en 3&#215; &#183; 124 &#8364;/mois en 4&#215; sans frais</p>
                <ul className="mt-5 space-y-2.5">
                  {['Plateforme EVC accès illimité', "QCM d'entraînement", 'Dossiers et exercices corrigés', 'Fiches de synthèse', 'Suivi de progression'].map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-[13.5px]" style={{ color: INK }}>
                      <CheckCircle2 className="mt-px h-[18px] w-[18px] shrink-0" style={{ color: GREEN }} /> {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center gap-2.5 rounded-xl px-3.5 py-3" style={{ background: GREEN_SOFT }}>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white" style={{ background: GREEN }}>
                    <Play className="h-3.5 w-3.5" fill="currentColor" />
                  </span>
                  <p className="text-[13px] font-semibold" style={{ color: '#1B5E20' }}>1 séance vidéo de méthodologie EVC</p>
                </div>
                <Link href="/formules/essentielle" className="mt-auto flex items-center justify-center gap-2 rounded-xl py-3.5 text-[14px] font-bold text-white transition-transform hover:scale-[1.02]" style={{ background: GREEN }}>
                  Commencer avec Essentielle <ArrowRight className="h-4 w-4" />
                </Link>
                <p className="mt-2 text-center text-[12px]" style={{ color: INK_SOFT }}>Espace découverte gratuit &#183; Sans engagement</p>
              </div>
            </SpotlightCard>

            {/* Intensive */}
            <SpotlightCard spotlightColor={`${RED}22`} className="rounded-2xl border bg-white shadow-[0_8px_24px_-12px_rgba(192,17,46,0.20)] transition-all hover:-translate-y-1 hover:shadow-[0_16px_36px_-12px_rgba(192,17,46,0.30)]" style={{ borderColor: BORDER }}>
              <div className="flex h-full flex-col p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: RED_SOFT, color: RED }}>
                    <Target className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: RED }}>FORMULE</p>
                    <p className="text-[19px] font-black leading-none" style={{ color: RED }}>INTENSIVE</p>
                  </div>
                </div>
                <p className="mt-3 text-[13.5px]" style={{ color: INK_SOFT }}>Révisions ciblées EVC</p>
                <p className="mt-3 text-[13px] font-semibold" style={{ color: INK }}>Deux parcours au choix :</p>
                <div className="mt-2 flex gap-2.5">
                  <Link href="/formules/intensive" className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-[11.5px] font-bold transition-colors hover:bg-[#FDE8EC]" style={{ borderColor: RED, color: RED }}>VOIE INTERNE <ArrowRight className="h-3 w-3" /></Link>
                  <Link href="/formules/intensive" className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-[11.5px] font-bold transition-colors hover:bg-[#FDE8EC]" style={{ borderColor: RED, color: RED }}>VOIE EXTERNE <ArrowRight className="h-3 w-3" /></Link>
                </div>
                <p className="mt-3 text-[40px] font-black leading-none" style={{ color: RED }}>995 &#8364;</p>
                <p className="mt-1.5 text-[12.5px] font-semibold" style={{ color: RED }}>ou 332 &#8364;/mois en 3&#215; &#183; 249 &#8364;/mois en 4&#215; sans frais</p>
                <ul className="mt-5 space-y-2.5">
                  {['Tout le contenu de la formule Essentielle', 'Environ 20 heures de révision ciblée', 'QCM supplémentaires expliqués', 'Méthodologie avancée EVC', '2 épreuves blanches inspirées des EVC', 'Corrections détaillées'].map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-[13.5px]" style={{ color: INK }}>
                      <CheckCircle2 className="mt-px h-[18px] w-[18px] shrink-0" style={{ color: RED }} /> {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 space-y-2.5">
                  <div className="flex items-start gap-2.5 rounded-xl px-3.5 py-3" style={{ background: RED_SOFT }}>
                    <Radio className="mt-0.5 h-[18px] w-[18px] shrink-0" style={{ color: RED }} />
                    <div>
                      <p className="text-[13px] font-extrabold" style={{ color: RED }}>Séances de révision en direct &amp; replays disponibles</p>
                      <p className="mt-0.5 text-[12px] leading-snug" style={{ color: INK_SOFT }}>Accédez aux séances en direct et aux replays disponibles.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 rounded-xl px-3.5 py-3" style={{ background: RED_SOFT }}>
                    <Play className="mt-0.5 h-[18px] w-[18px] shrink-0" style={{ color: RED }} />
                    <div>
                      <p className="text-[13px] font-extrabold" style={{ color: RED }}>Corrections commentées en replay</p>
                      <p className="mt-0.5 text-[12px] leading-snug" style={{ color: INK_SOFT }}>Disponible en direct ou en replay selon le calendrier.</p>
                    </div>
                  </div>
                </div>
                <Link href="/formules/intensive" className="mt-auto flex items-center justify-center gap-2 rounded-xl py-3.5 text-[14px] font-bold text-white transition-transform hover:scale-[1.02]" style={{ background: RED }}>
                  Choisir Intensive <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </SpotlightCard>

            {/* Programme Approfondi */}
            <SpotlightCard spotlightColor={`${PURPLE}20`} className="rounded-2xl border-2 bg-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-[0_16px_36px_-12px_rgba(124,58,237,0.30)]" style={{ borderColor: PURPLE }}>
              <div className="flex h-full flex-col p-6">
                <span className="self-start inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase text-white" style={{ background: 'linear-gradient(90deg, #F59E0B 0%, #F97316 100%)' }}>
                  <Star className="h-3 w-3" fill="currentColor" /> REMISE À NIVEAU APPROFONDIE
                </span>
                <div className="mt-3 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: PURPLE_SOFT, color: PURPLE }}>
                    <GraduationCap className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: PURPLE }}>PROGRAMME</p>
                    <p className="text-[19px] font-black leading-none" style={{ color: PURPLE }}>APPROFONDI</p>
                  </div>
                </div>
                <p className="mt-3 text-[13.5px]" style={{ color: INK_SOFT }}>Remise à niveau approfondie et préparation complète</p>
                <p className="mt-3 text-[12.5px]" style={{ color: INK_SOFT }}>À partir de</p>
                <p className="mt-0.5 text-[40px] font-black leading-none" style={{ color: PURPLE }}>2 395 &#8364;</p>
                <p className="mt-1.5 text-[12.5px] font-semibold" style={{ color: PURPLE }}>Paiement en 3&#215; ou 4&#215; sans frais</p>
                <ul className="mt-5 space-y-2.5">
                  {['Plateforme EVC accès illimité', 'Remise à niveau et préparation complète', 'Reprise approfondie des spécialités majeures', 'Cours de remise à niveau associés à des dossiers cliniques', 'Résolution progressive de dossiers inspirés des EVC', 'Interrogations régulières pour évaluer la progression', 'Épreuves blanches inspirées des EVC'].map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-[13.5px]" style={{ color: INK }}>
                      <CheckCircle2 className="mt-px h-[18px] w-[18px] shrink-0" style={{ color: PURPLE }} /> {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 space-y-2.5">
                  <div className="flex items-start gap-2.5 rounded-xl px-3.5 py-3" style={{ background: PURPLE_SOFT }}>
                    <Radio className="mt-0.5 h-[18px] w-[18px] shrink-0" style={{ color: PURPLE }} />
                    <div>
                      <p className="text-[13px] font-extrabold" style={{ color: PURPLE }}>Cours en direct &amp; replays disponibles</p>
                      <p className="mt-0.5 text-[12px] leading-snug" style={{ color: INK_SOFT }}>Assistez aux cours en direct et retrouvez-les en replay.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 rounded-xl px-3.5 py-3" style={{ background: PURPLE_SOFT }}>
                    <RotateCcw className="mt-0.5 h-[18px] w-[18px] shrink-0" style={{ color: PURPLE }} />
                    <div>
                      <p className="text-[13px] font-extrabold" style={{ color: PURPLE }}>Accès à tous les replays</p>
                      <p className="mt-0.5 text-[12px] leading-snug" style={{ color: INK_SOFT }}>Retrouvez toutes les séances disponibles en replay.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 rounded-xl px-3.5 py-3" style={{ background: PURPLE_SOFT }}>
                    <MessageCircle className="mt-0.5 h-[18px] w-[18px] shrink-0" style={{ color: PURPLE }} />
                    <div>
                      <p className="text-[13px] font-extrabold" style={{ color: PURPLE }}>Échanges avec les enseignants</p>
                      <p className="mt-0.5 text-[12px] leading-snug" style={{ color: INK_SOFT }}>Posez vos questions en direct ou via les replays et le forum.</p>
                    </div>
                  </div>
                </div>
                <Link href="/formules/programme-approfondi" className="mt-auto flex items-center justify-center gap-2 rounded-xl border-2 py-3.5 text-[14px] font-bold transition-transform hover:scale-[1.02]" style={{ borderColor: PURPLE, color: PURPLE }}>
                  Découvrir le programme <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </SpotlightCard>
          </div>

          {/* Bandeau réassurance — PH/CCA · méthodologie · paiement · support */}
          <div className="mt-6 rounded-2xl border bg-[#F8F9FC] px-4 py-5 sm:px-6" style={{ borderColor: BORDER }}>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { Icon: Users, t: 'Cours animés par des praticiens hospitaliers (PH), des chefs de clinique–assistants (CCA) et des médecins spécialistes.' },
                { Icon: ShieldCheck, t: 'Méthodologie éprouvée depuis 15 ans' },
                { Icon: Lock, t: 'Paiement sécurisé en plusieurs fois' },
                { Icon: Headphones, t: 'Support réactif à votre écoute' },
              ].map((b, i) => (
                <div key={i} className={'flex items-start gap-3 lg:px-5' + (i > 0 ? ' lg:border-l lg:border-[#E5E9F0]' : '')}>
                  <b.Icon className="mt-0.5 h-6 w-6 shrink-0" style={{ color: PURPLE }} />
                  <p className="text-[12.5px] font-semibold leading-snug" style={{ color: NAVY }}>{b.t}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ QUELLE FORMULE EST FAITE POUR VOUS ? — version pages formules ═══ */}
      <section className="py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-xl font-black" style={{ color: NAVY }}>Quelle formule est faite pour vous ?</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              { v: 'essentielle',  name: 'FORMULE ESSENTIELLE',   price: '495',   color: '#2E7D32', desc: 'Travail en autonomie',                                  sub: 'Organisez votre préparation à votre rythme avec les ressources essentielles.',           href: '/formules/essentielle',         cta: "Découvrir l'Essentielle" },
              { v: 'intensive',    name: 'FORMULE INTENSIVE',     price: '995',   color: '#C0112E', desc: 'Consolidation avant les EVC',                           sub: 'Révisions guidées et corrections commentées pour consolider vos connaissances.',         href: '/formules/intensive',           cta: "Découvrir l'Intensive" },
              { v: 'approfondi',   name: 'PROGRAMME APPROFONDI',  price: '2 395', color: '#1E40AF', desc: 'Reprise structurée des spécialités majeures',           sub: 'Accompagnement renforcé pour une remise à niveau complète et performante.',              href: '/formules/programme-approfondi', cta: 'Découvrir le programme' },
            ].map(p => (
              <div key={p.v} className="rounded-2xl border bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-lg" style={{ borderColor: BORDER }}>
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: p.color }}>{p.name}</p>
                <p className="text-2xl font-black" style={{ color: p.color }}>{p.price} &euro;{p.v === 'approfondi' ? '*' : ''}</p>
                <p className="mt-0.5 text-[11.5px] font-semibold" style={{ color: p.color }}>
                  {p.v === 'approfondi'
                    ? 'ou en 3× / 4× sans frais'
                    : `ou ${Math.round(parseInt(p.price.replace(/\s/g, ''), 10) / 4)} €/mois en 4× sans frais`}
                </p>
                <p className="mt-2 text-sm font-bold" style={{ color: NAVY }}>{p.desc}</p>
                <p className="mt-1 text-xs" style={{ color: INK_SOFT }}>{p.sub}</p>
                <Link href={p.href}
                  className="mt-4 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
                  style={{ background: p.color }}>
                  {p.cta}
                  <ArrowRight className="h-4 w-4" />
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
            <Image src="/accueil.png" alt="Apercu plateforme Major ECN" width={1200} height={750} className="w-full" sizes="(max-width: 1280px) 100vw, 1200px" />
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
              { Icon: GraduationCap, t: 'TOUTES LES SPÉCIALITÉS', sub: 'PRÉPARÉES', d: 'Médecine générale et spécialités médicales, chirurgicales.' },
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
                    <Image src={t.photo} alt={t.name} fill className="object-cover" sizes="80px" />
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

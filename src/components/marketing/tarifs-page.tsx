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
    <div style={{ fontFamily: FONT }}>
      {/* ═══ HERO ═══ */}
      <section className="bg-white pt-6 pb-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-3 rounded-full border px-5 py-2 text-[11px] font-bold uppercase tracking-wider" style={{ borderColor: BORDER, color: NAVY }}>
            <span className="flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5" style={{ color: RED }} /> 45 spécialités EVC</span>
            <span style={{ color: RED }}>&#8226;</span>
            <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" style={{ color: RED }} /> Plus de 9 000 médecins accompagnés</span>
            <span style={{ color: RED }}>&#8226;</span>
            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" style={{ color: RED }} /> Depuis 2011</span>
          </div>

          <h1 className="mt-7 text-center text-3xl font-black tracking-tight sm:text-4xl lg:text-[2.8rem]" style={{ color: NAVY }}>
            Tarifs des préparations <span style={{ color: RED }}>EVC (PAE)</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-center text-[15px] leading-relaxed" style={{ color: INK_SOFT }}>
            Préparations destinées aux médecins diplômés hors Union Européenne préparant les{' '}
            <strong style={{ color: NAVY }}>Épreuves de Vérification des Connaissances (EVC)</strong> dans le cadre de la
            Procédure d{"'"}Autorisation d{"'"}Exercice (PAE).
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-6">
            {[
              { Icon: Users, big: 'Plus de 9 000', sub: 'médecins accompagnés' },
              { Icon: GraduationCap, big: '45 spécialités', sub: 'préparées' },
              { Icon: Calendar, big: 'Depuis 2011', sub: 'à vos côtés' },
            ].map(s => (
              <div key={s.big} className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: RED_SOFT, color: RED }}>
                  <s.Icon className="h-4 w-4" />
                </span>
                <div className="text-left">
                  <p className="text-[13px] font-extrabold" style={{ color: RED }}>{s.big}</p>
                  <p className="text-[11px]" style={{ color: INK_SOFT }}>{s.sub}</p>
                </div>
              </div>
            ))}
          </div>
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

      {/* ═══ 3 FORMULES ═══ */}
      <section className="bg-white pb-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-5 md:grid-cols-3 items-stretch">
            {/* Essentielle */}
            <div className="flex flex-col rounded-2xl border p-5" style={{ borderColor: BORDER }}>
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: GREEN_SOFT, color: GREEN }}>
                  <BookOpen className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: GREEN }}>FORMULE</p>
                  <p className="text-[16px] font-black leading-none" style={{ color: GREEN }}>ESSENTIELLE</p>
                </div>
              </div>
              <p className="mt-2 text-[13px]" style={{ color: INK_SOFT }}>S{"'"}entraîner efficacement aux EVC</p>
              <p className="mt-3 text-[36px] font-black leading-none" style={{ color: GREEN }}>495 &#8364;</p>
              <ul className="mt-4 flex-1 space-y-1.5">
                {["Plateforme EVC accès illimité", "QCM d'entraînement", 'Dossiers et exercices corrigés', 'Fiches de synthèse', 'Suivi de progression', '1 séance vidéo de méthodologie EVC'].map(f => (
                  <li key={f} className="flex items-start gap-2 text-[13px]" style={{ color: INK }}>
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: GREEN }} /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/formules/essentielle" className="mt-5 flex items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-bold text-white" style={{ background: GREEN }}>
                Commencer avec Essentielle <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <p className="mt-1.5 text-center text-[11px]" style={{ color: INK_SOFT }}>2 jours d{"'"}essai gratuit &#183; Sans engagement</p>
            </div>

            {/* Intensive */}
            <div className="relative flex flex-col rounded-2xl border p-5" style={{ borderColor: BORDER }}>
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: RED_SOFT, color: RED }}>
                  <Target className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: RED }}>FORMULE</p>
                  <p className="text-[16px] font-black leading-none" style={{ color: RED }}>INTENSIVE</p>
                </div>
              </div>
              <p className="mt-2 text-[13px]" style={{ color: INK_SOFT }}>Révisions ciblées EVC</p>
              <p className="mt-1 text-[13px] font-semibold" style={{ color: INK }}>Deux parcours au choix :</p>
              <div className="mt-1.5 flex gap-2">
                <span className="rounded-full border px-2.5 py-0.5 text-[11px] font-bold" style={{ borderColor: RED, color: RED }}>VOIE INTERNE &#8594;</span>
                <span className="rounded-full border px-2.5 py-0.5 text-[11px] font-bold" style={{ borderColor: RED, color: RED }}>VOIE EXTERNE &#8594;</span>
              </div>
              <p className="mt-3 text-[36px] font-black leading-none" style={{ color: RED }}>995 &#8364;</p>
              <ul className="mt-4 flex-1 space-y-1.5">
                {['Tout le contenu de la formule Essentielle', 'Environ 20 heures de révision ciblée', 'QCM supplémentaires expliqués', 'Méthodologie avancée EVC', '2 épreuves blanches', 'Corrections détaillées'].map(f => (
                  <li key={f} className="flex items-start gap-2 text-[13px]" style={{ color: INK }}>
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: RED }} /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/formules/intensive" className="mt-5 flex items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-bold text-white" style={{ background: RED }}>
                Choisir Intensive <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Programme Approfondi */}
            <div className="flex flex-col rounded-2xl border-2 p-5 shadow-lg" style={{ borderColor: PURPLE }}>
              <span className="self-start inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase text-white" style={{ background: '#F59E0B' }}>
                <Star className="h-3 w-3" fill="currentColor" /> REMISE À NIVEAU APPROFONDIE
              </span>
              <div className="mt-2.5 flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: PURPLE_SOFT, color: PURPLE }}>
                  <GraduationCap className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: PURPLE }}>PROGRAMME</p>
                  <p className="text-[16px] font-black leading-none" style={{ color: PURPLE }}>APPROFONDI</p>
                </div>
              </div>
              <p className="mt-2 text-[13px]" style={{ color: INK_SOFT }}>Remise à niveau approfondie et préparation complète</p>
              <p className="mt-3 text-[12px]" style={{ color: INK_SOFT }}>A partir de</p>
              <p className="text-[36px] font-black leading-none" style={{ color: PURPLE }}>2 395 &#8364;</p>
              <ul className="mt-4 flex-1 space-y-1.5">
                {['Plateforme EVC accès illimité', 'Remise à niveau et préparation complète', 'Reprise approfondie des spécialités majeures', 'Cours de remise a niveau associés à des dossiers cliniques', 'Résolution progressive de dossiers inspirés des EVC', 'Interrogations régulières pour évaluer la progression', 'Épreuves blanches', 'Séances de révision dédiées', 'Accompagnement pédagogique personnalisé'].map(f => (
                  <li key={f} className="flex items-start gap-2 text-[13px]" style={{ color: INK }}>
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: PURPLE }} /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/formules/programme-approfondi" className="mt-5 flex items-center justify-center gap-2 rounded-xl border-2 py-2.5 text-[13px] font-bold" style={{ borderColor: PURPLE, color: PURPLE }}>
                Découvrir le programme <ArrowRight className="h-3.5 w-3.5" />
              </Link>
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

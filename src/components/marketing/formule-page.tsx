'use client';
/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import {
  ArrowRight, BookOpen, Calendar, Check, CheckCircle2, ClipboardCheck, Clock,
  FileText, GraduationCap, Heart, Layers3, LineChart, MessageCircle, Phone, Play,
  Shield, ShieldCheck, Star, Stethoscope, Target, TrendingUp, Trophy, Users, Video,
} from 'lucide-react';
import { Reveal } from './reveal';
import { FAQSection } from './manus-sections';
import { CheckoutButton } from './checkout-button';
import { CallbackRequestForm } from './callback-request-form';
import type { FormuleId } from '@/lib/stripe';

const VARIANT_TO_FORMULE_ID: Record<'essentielle' | 'intensive' | 'approfondi', FormuleId> = {
  essentielle: 'essentielle',
  intensive: 'intensive',
  approfondi: 'programme-approfondi',
};

const NAVY = '#0F1F4D';
const INK = '#1F2937';
const INK_SOFT = '#5B6478';
const BORDER = '#E5E9F0';
const FONT = "'Plus Jakarta Sans', sans-serif";

type Variant = 'essentielle' | 'intensive' | 'approfondi';

const CONFIGS: Record<Variant, {
  color: string; colorSoft: string; label: string; tagline: string;
  price: string; pricePrefix?: string; hero: string; desc: string;
  cta: string; ctaSecondary?: string; badge?: string;
  features: string[]; contentItems: { Icon: typeof BookOpen; t: string; d: string }[];
}> = {
  essentielle: {
    color: '#2E7D32', colorSoft: '#E8F5E9',
    label: 'FORMULE ESSENTIELLE', tagline: 'Préparez les EVC avec une méthode\nstructurée et des ressources conçues\npour les médecins diplômés\nhors Union Européenne.',
    price: '495', hero: '/formules/hero-formule-essentielle.jpg',
    desc: 'Travaillez en autonomie grace a une plateforme complète regroupant QCM, dossiers cliniques, flashcards, fiches pédagogiques et méthodologie EVC.',
    cta: 'Commencer maintenant',
    features: ['QCM, dossiers, fiches, flashcards', 'Méthodologie EVC (voies interne et externe)', 'Idéal pour les candidats autonomes'],
    contentItems: [
      { Icon: ClipboardCheck, t: "QCM d'entraînement", d: 'Séries ciblées pour travailler efficacement' },
      { Icon: FileText, t: 'Dossiers cliniques', d: 'Situations inspirées des EVC' },
      { Icon: Layers3, t: 'Fiches pédagogiques', d: 'Informations clés a retenir' },
      { Icon: BookOpen, t: 'Flashcards', d: 'Révisez rapidement les notions essentielles' },
      { Icon: Target, t: 'Méthodologie EVC', d: 'Séances dédiées pour comprendre ce qui est attendu aux EVC' },
      { Icon: LineChart, t: 'Suivi de progression', d: 'Visualisez vos acquis et vos points a améliorer' },
    ],
  },
  intensive: {
    color: '#C0112E', colorSoft: '#FDE8EC',
    label: 'FORMULE INTENSIVE', tagline: 'Finalisez votre préparation\ndans les derniers mois avant les EVC',
    price: '995', hero: '/formules/hero-formule-intensive.jpg',
    desc: "Pour les candidats disposant déjà de bases solides et souhaitant bénéficier de révisions guidées, de corrections détaillées et de rappels ciblés avant l'examen.",
    cta: 'Commencer maintenant',
    features: ['Parcours adapté a votre voie (interne ou externe)', 'Séances de révision thématiques', 'Corrections commentées avec rappels ciblés', 'Idéal dans les derniers mois avant les EVC'],
    contentItems: [
      { Icon: ClipboardCheck, t: "QCM d'entraînement", d: 'Séries ciblées par spécialité et thématique' },
      { Icon: CheckCircle2, t: 'Corrections commentées', d: 'Explications détaillées par des experts' },
      { Icon: BookOpen, t: 'Séances de révision guidées', d: 'Rappels des points clés et astuces' },
      { Icon: FileText, t: 'Fiches & dossiers cliniques', d: 'Cas pratiques et situations inspirées des EVC' },
      { Icon: Target, t: 'Méthodologie EVC', d: 'Conseils et stratégies pour répondre aux attentes du jury' },
      { Icon: LineChart, t: 'Suivi de progression', d: 'Tableau de bord et recommandations' },
    ],
  },
  approfondi: {
    color: '#1E40AF', colorSoft: '#DBEAFE',
    label: 'PROGRAMME APPROFONDI', tagline: "Approfondissez votre préparation\navec un accompagnement structuré\njusqu'aux EVC",
    price: '2 395', pricePrefix: 'A partir de', hero: '/formules/hero-programme-approfondi.jpg',
    desc: "Le Programme Approfondi est conçu pour vous offrir une reprise structurée des spécialités essentielles, des séances interactives, des échanges réguliers avec les enseignants et un suivi pédagogique renforcé.",
    cta: 'Échanger avec un conseiller', ctaSecondary: 'Planifier un échange',
    features: ['Approfondissement des spécialités majeures', 'Échanges avec les enseignants', 'Épreuves blanches et suivi personnalisé', 'Idéal pour une reprise complète et progressive'],
    contentItems: [
      { Icon: Users, t: 'Séances interactives', d: 'Reprise des notions clés a partir de dossiers cliniques guidés' },
      { Icon: FileText, t: 'Fiches & dossiers', d: 'Cas pratiques et situations cliniques inspirées des EVC' },
      { Icon: BookOpen, t: 'Rappels ciblés au bon moment', d: 'Consolidation des points essentiels' },
      { Icon: MessageCircle, t: 'Échanges avec les enseignants', d: 'Réponses a vos questions et conseils personnalisés' },
      { Icon: ClipboardCheck, t: 'Épreuves blanches', d: 'Entraînements en conditions réelles et corrections détaillées' },
      { Icon: LineChart, t: 'Suivi pédagogique', d: 'Accompagnement tout au long de votre préparation' },
    ],
  },
};

const SPECIALTIES = ['Médecine Générale', 'Pédiatrie', 'Cardiologie', 'Pneumologie', 'Neurologie', 'Gynécologie'];

export function FormulePageContent({ variant }: { variant: Variant }) {
  const c = CONFIGS[variant];

  return (
    <div style={{ fontFamily: FONT }}>
      {/* Breadcrumb */}
      <div className="bg-white pt-4 pb-0">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs" style={{ color: INK_SOFT }}>
            <Link href="/" className="hover:underline">Accueil</Link>
            {' > '}
            <Link href="/tarifs" className="hover:underline">Formules &amp; tarifs</Link>
            {' > '}{c.label}
          </p>
        </div>
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-0">
            <div className="py-12 lg:py-20 lg:pr-12">
              <span className="inline-block rounded px-3 py-1 text-xs font-bold uppercase tracking-wider text-white"
                style={{ background: c.color }}>{c.label}</span>
              {c.badge && (
                <p className="mt-2 flex items-center gap-1.5 text-xs font-bold" style={{ color: c.color }}>
                  <span>&#128293;</span> {c.badge}
                </p>
              )}
              <h1 className="mt-4 text-2xl font-black leading-[1.15] tracking-tight whitespace-pre-line sm:text-3xl lg:text-4xl"
                style={{ color: NAVY }}>{c.tagline}</h1>
              <p className="mt-4 text-sm leading-relaxed" style={{ color: INK_SOFT }}>{c.desc}</p>

              {/* Stats */}
              <div className="mt-6 flex flex-wrap gap-5">
                {[
                  { Icon: Users, t: '+ 9 000', s: 'médecins\naccompagnés' },
                  { Icon: GraduationCap, t: '45+', s: 'spécialités\npréparées' },
                  { Icon: Calendar, t: 'Depuis', s: '2011' },
                ].map(st => (
                  <div key={st.t} className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: c.colorSoft, color: c.color }}>
                      <st.Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-black" style={{ color: NAVY }}>{st.t}</p>
                      <p className="text-[10px] whitespace-pre-line" style={{ color: INK_SOFT }}>{st.s}</p>
                    </div>
                  </div>
                ))}
                {/* Trustpilot removed */}
              </div>

              {/* Price */}
              <div className="mt-6">
                {c.pricePrefix && <p className="text-sm" style={{ color: INK_SOFT }}>{c.pricePrefix}</p>}
                <p className="text-4xl font-black" style={{ color: c.color }}>{c.price} &euro;{variant === 'approfondi' ? '*' : ''}</p>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <a href="#choisir-formule" className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white"
                  style={{ background: c.color }}>
                  {c.cta} <ArrowRight className="h-4 w-4" />
                </a>
                {c.ctaSecondary && (
                  <Link href="/contact" className="inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-bold"
                    style={{ borderColor: c.color, color: c.color }}>
                    {c.ctaSecondary}
                  </Link>
                )}
              </div>
              {variant !== 'approfondi' && (
                <Link href="/tarifs" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold" style={{ color: INK_SOFT }}>
                  Comparer les formules <ArrowRight className="h-3 w-3" />
                </Link>
              )}
              {variant === 'approfondi' && (
                <p className="mt-2 text-xs" style={{ color: INK_SOFT }}>*Tarif variable selon la spécialité préparée.</p>
              )}
            </div>
            <div className="relative hidden lg:block">
              <img src={c.hero} alt="" className="absolute inset-0 h-full w-full object-cover" />
              {/* Side badges */}
              <div className="absolute right-4 top-8 flex flex-col gap-2">
                {['Accès 24h/24\n7j/7', 'Plateforme\nweb & mobile', 'Paiement\nsécurisé', 'Support réactif\n7j/7'].map(b => (
                  <span key={b} className="rounded-lg bg-white/95 px-3 py-2 text-[10px] font-bold leading-tight whitespace-pre-line shadow-sm"
                    style={{ color: NAVY }}>{b}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENU */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-xl font-black" style={{ color: NAVY }}>
            Ce que contient la {c.label.replace('PROGRAMME', 'Programme').replace('FORMULE', 'Formule')}
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {c.contentItems.map(it => (
              <div key={it.t} className="flex items-start gap-3 rounded-xl border p-4" style={{ borderColor: BORDER }}>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: c.colorSoft, color: c.color }}>
                  <it.Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-bold" style={{ color: NAVY }}>{it.t}</p>
                  <p className="mt-0.5 text-xs" style={{ color: INK_SOFT }}>{it.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VOIES EXTERNE / INTERNE (Essentielle + Intensive) */}
      {(variant === 'essentielle' || variant === 'intensive') && (
        <section className="bg-[#F8F9FC] py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border bg-white p-5" style={{ borderColor: BORDER }}>
                <p className="text-[13px] font-black uppercase" style={{ color: NAVY }}>VOIE EXTERNE</p>
                <p className="text-[11px]" style={{ color: INK_SOFT }}>(Questions ouvertes)</p>
                <ul className="mt-3 space-y-1.5">
                  {['Méthodologie de rédaction', "Compréhension des attentes du jury", 'Conseils pratiques', 'Erreurs fréquentes a éviter'].map(v => (
                    <li key={v} className="flex items-center gap-2 text-[13px]" style={{ color: INK }}>
                      <Check className="h-3.5 w-3.5" style={{ color: c.color }} /> {v}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border bg-white p-5" style={{ borderColor: BORDER }}>
                <p className="text-[13px] font-black uppercase" style={{ color: NAVY }}>VOIE INTERNE</p>
                <p className="text-[11px]" style={{ color: INK_SOFT }}>(QCM)</p>
                <ul className="mt-3 space-y-1.5">
                  {['Méthodologie spécifique', 'Approche du raisonnement clinique', 'Gestion du temps', 'Erreurs fréquentes a éviter'].map(v => (
                    <li key={v} className="flex items-center gap-2 text-[13px]" style={{ color: INK }}>
                      <Check className="h-3.5 w-3.5" style={{ color: c.color }} /> {v}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* POURQUOI CHOISIR (Intensive + Approfondi) */}
      {(variant === 'intensive' || variant === 'approfondi') && (
        <section className="bg-white py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-xl font-black" style={{ color: NAVY }}>
              Pourquoi choisir la {c.label.replace('PROGRAMME', 'Programme').replace('FORMULE', 'Formule')} ?
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(variant === 'intensive' ? [
                { t: 'Consolidation des connaissances', d: 'Revoyez les notions essentielles et renforcez vos acquis grace a des contenus ciblés.' },
                { t: 'Corrections détaillées', d: 'Chaque QCM et chaque question ouverte est analysé et expliqué par nos experts.' },
                { t: 'Rappels ciblés des notions essentielles', d: "Des fiches et séances de révision pour retenir l'essentiel." },
                { t: 'Préparation idéale juste avant les EVC', d: "Un dernier tour complet pour arriver le jour de l'examen en confiance." },
              ] : [
                { t: 'Reprise structurée', d: 'Reprise structurée des spécialités essentielles.' },
                { t: 'Dossiers cliniques guidés', d: 'Dossiers cliniques guidés et progressifs.' },
                { t: 'Rappels ciblés', d: 'Rappels ciblés des notions indispensables.' },
                { t: 'Échanges réguliers', d: 'Échanges réguliers avec des enseignants experts.' },
              ]).map(p => (
                <div key={p.t} className="rounded-xl border p-4" style={{ borderColor: BORDER }}>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: c.colorSoft, color: c.color }}>
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  <p className="mt-3 text-[13px] font-bold" style={{ color: NAVY }}>{p.t}</p>
                  <p className="mt-1 text-[12px] leading-relaxed" style={{ color: INK_SOFT }}>{p.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SPECIALTIES */}
      <section className="bg-[#F8F9FC] py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-xl font-black" style={{ color: NAVY }}>Plus de 45 spécialités préparées</h2>
              <div className="mt-5 flex flex-wrap gap-3">
                {SPECIALTIES.map(s => (
                  <span key={s} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold"
                    style={{ borderColor: BORDER, color: NAVY }}>
                    <Stethoscope className="h-4 w-4" style={{ color: c.color }} /> {s}
                  </span>
                ))}
                <span className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-bold"
                  style={{ background: c.colorSoft, color: c.color }}>... + 39 autres spécialités</span>
              </div>
              <Link href="/specialites" className="mt-4 inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-bold"
                style={{ borderColor: BORDER, color: NAVY }}>
                Voir toutes les spécialités <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div>
              <h3 className="text-lg font-black" style={{ color: NAVY }}>Une plateforme pensée pour votre réussite</h3>
              <div className="mt-4 rounded-xl overflow-hidden border" style={{ borderColor: BORDER }}>
                <img src="/accueil.png" alt="Apercu plateforme" className="w-full" />
              </div>
              <ul className="mt-4 space-y-1.5">
                {['Tous les contenus réunis au même endroit', 'Accessible 24h/24 et 7j/7', 'Compatible ordinateur, tablette et mobile', 'Mises a jour pédagogiques régulières', 'Interface simple et intuitive'].map(b => (
                  <li key={b} className="flex items-center gap-2 text-sm" style={{ color: INK }}>
                    <Check className="h-4 w-4" style={{ color: c.color }} /> {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-xl font-black" style={{ color: NAVY }}>Quelle formule est faite pour vous ?</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              { v: 'essentielle' as Variant, name: 'FORMULE ESSENTIELLE', price: '495', color: '#2E7D32', bg: '#E8F5E9', desc: 'Travail en autonomie', sub: 'Organisez votre préparation a votre rythme avec les ressources essentielles.' },
              { v: 'intensive' as Variant, name: 'FORMULE INTENSIVE', price: '995', color: '#C0112E', bg: '#FDE8EC', desc: 'Consolidation avant les EVC', sub: 'Révisions guidées et corrections commentées pour consolider vos connaissances.' },
              { v: 'approfondi' as Variant, name: 'PROGRAMME APPROFONDI', price: '2 395', color: '#1E40AF', bg: '#DBEAFE', desc: 'Reprise structurée des spécialités majeures', sub: 'Accompagnement renforcé pour une remise a niveau complète et performante.' },
            ].map(p => (
              <div key={p.v} className={`rounded-2xl border p-5 ${p.v === variant ? 'ring-2 shadow-lg' : ''}`}
                style={{ borderColor: p.v === variant ? p.color : BORDER, ...(p.v === variant ? { ringColor: p.color } : {}) }}>
                {p.v === variant && (
                  <span className="mb-3 inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase text-white" style={{ background: p.color }}>
                    {p.v === 'approfondi' ? 'LA PRÉPARATION LA PLUS COMPLÈTE' : ''}
                  </span>
                )}
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: p.color }}>{p.name}</p>
                <p className="text-2xl font-black" style={{ color: p.color }}>{p.price} &euro;{p.v === 'approfondi' ? '*' : ''}</p>
                <p className="mt-2 text-sm font-bold" style={{ color: NAVY }}>{p.desc}</p>
                <p className="mt-1 text-xs" style={{ color: INK_SOFT }}>{p.sub}</p>
                <Link href={p.v === variant ? '#' : `/formules/${p.v === 'approfondi' ? 'programme-approfondi' : p.v}`}
                  className="mt-4 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white"
                  style={{ background: p.color }}>
                  {p.v === variant ? c.cta : p.v === 'approfondi' ? 'Découvrir le programme' : `Découvrir l'${p.name.split(' ')[1]}`}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-[#F8F9FC] py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-xl font-black" style={{ color: NAVY }}>Ils ont réussi les EVC avec Major ECN</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              { name: 'Dr Haykel Abdelbaki', spec: 'Radiologie', year: "Lauréat EVC", photo: '/temoignages/dr-haykel-abdelbaki.jpg', quote: "\"Sérieux, qualité et accompagnement : les clés de ma réussite.\"" },
              { name: "Dr Amélie Lamure", spec: "Anesthésie-Réanimation", year: "Lauréate EVC", photo: '/temoignages/dr-amelie-lamure.jpg', quote: "\"Une équipe présente, disponible et impliquée à chaque étape.\"" },
              { name: 'Dr Leila Bettaieb', spec: "Médecine générale", year: "Lauréate EVC", photo: '/temoignages/dr-leila-bettaieb.jpg', quote: "\"Une méthode claire, de bons supports et un véritable accompagnement.\"" },
            ].map(t => (
              <div key={t.name} className="rounded-2xl border bg-white p-5" style={{ borderColor: BORDER }}>
                <div className="flex items-center gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                    <img src={t.photo} alt={t.name} className="h-full w-full object-cover" />
                    <span className="absolute bottom-1 left-1 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow">
                      <Play className="h-2.5 w-2.5" style={{ color: c.color }} fill="currentColor" />
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-extrabold" style={{ color: NAVY }}>{t.name}</p>
                    <p className="text-xs" style={{ color: INK_SOFT }}>{t.spec}</p>
                    <p className="text-xs font-bold" style={{ color: c.color }}>{t.year}</p>
                    <div className="flex gap-0.5 mt-0.5">{[1,2,3,4,5].map(i => <Star key={i} className="h-2.5 w-2.5" style={{ color: '#F59E0B' }} fill="currentColor" />)}</div>
                  </div>
                </div>
                <p className="mt-3 text-sm italic leading-relaxed" style={{ color: INK_SOFT }}>{t.quote}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href="/temoignages" className="inline-flex items-center gap-2 text-sm font-bold" style={{ color: c.color }}>
              Voir plus de témoignages <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQSection />

      {/* CHOISIR CETTE FORMULE — checkout Stripe (essentielle, intensive)
          OU formulaire de rappel (programme approfondi sur-mesure) */}
      <section id="choisir-formule" className="py-14" style={{ background: variant === 'approfondi' ? '#1E40AF' : variant === 'intensive' ? '#C0112E' : '#2E7D32' }}>
        <div className="mx-auto grid max-w-5xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:gap-12 lg:px-8">
          {/* Gauche : récap formule */}
          <div className="text-center text-white lg:text-left">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-white/80">
              {c.label}
            </p>
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
              {variant === 'approfondi' ? 'Échanger avec un conseiller' : 'Choisir cette formule'}
            </h2>
            <p className="mt-3 text-sm text-white/85">
              {variant === 'approfondi'
                ? "Programme sur-mesure : un conseiller vous rappelle pour cadrer votre préparation."
                : "Accès immédiat à la plateforme après votre inscription et activation par email."}
            </p>
            <p className="mt-6 text-5xl font-black">{c.price} &euro;{variant === 'approfondi' ? '*' : ''}</p>
            {variant === 'approfondi' && (
              <p className="mt-2 text-xs text-white/70">*Tarif variable selon la spécialité préparée.</p>
            )}
            <ul className="mt-6 space-y-2 text-sm text-white/90">
              {variant === 'approfondi'
                ? [
                    'Reprise structurée des spécialités majeures',
                    'Échanges réguliers avec les enseignants',
                    'Épreuves blanches et suivi personnalisé',
                    'Un conseiller vous rappelle sous 24 h ouvrées',
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-white" /> {t}</li>
                  ))
                : [
                    'Accès complet à la Médecine Générale (Voie interne + Voie externe)',
                    'QCM, fiches, flashcards, méthodologie EVC',
                    'Email de confirmation + activation immédiate du compte',
                    'Paiement en 1, 3 ou 4 fois — sécurisé via Stripe',
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-white" /> {t}</li>
                  ))}
            </ul>
          </div>

          {/* Droite : carte paiement Stripe OU carte demande de rappel */}
          <div className="rounded-3xl bg-white p-6 shadow-2xl sm:p-7">
            {variant === 'approfondi' ? (
              <>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em]" style={{ color: '#52607A' }}>
                  Demande de rappel
                </p>
                <h3 className="mt-1 text-xl font-black" style={{ color: NAVY }}>
                  Soyez rappelé sous 24 h ouvrées
                </h3>
                <p className="mt-1 text-[12.5px]" style={{ color: INK_SOFT }}>
                  Un conseiller pédagogique vous appelle au numéro indiqué pour
                  établir un programme sur-mesure et répondre à vos questions.
                </p>
                <div className="mt-5">
                  <CallbackRequestForm
                    color={{ deep: '#1E3A8A', main: '#1E40AF' }}
                  />
                </div>
              </>
            ) : (
              <>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em]" style={{ color: '#52607A' }}>
                  Inscription &amp; paiement
                </p>
                <h3 className="mt-1 text-xl font-black" style={{ color: NAVY }}>
                  Créez votre compte en 30 secondes
                </h3>
                <p className="mt-1 text-[12.5px]" style={{ color: INK_SOFT }}>
                  Vos informations servent à créer votre compte étudiant et à vous envoyer
                  votre lien d&rsquo;activation par email.
                </p>
                <div className="mt-5">
                  <CheckoutButton
                    formuleId={VARIANT_TO_FORMULE_ID[variant]}
                    label={`Payer ${c.price} € et créer mon compte`}
                    color={{ deep: variant === 'intensive' ? '#8B0E22' : '#1B5E20', main: c.color }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="bg-white py-6 border-t" style={{ borderColor: BORDER }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-6 text-center text-xs" style={{ color: INK_SOFT }}>
            {["Accès immédiat après inscription", 'Paiement sécurisé en 1x ou 3x', 'Satisfait ou remboursé sous 14 jours', 'Sans engagement', 'Support réactif 7j/7'].map(b => (
              <span key={b} className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5" style={{ color: c.color }} /> {b}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

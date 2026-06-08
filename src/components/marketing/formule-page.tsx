'use client';
/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import {
  ArrowRight, BookOpen, Calendar, Check, CheckCircle2, ClipboardCheck, Clock,
  FileText, GraduationCap, Heart, Layers3, LineChart, MessageCircle, Phone, Play,
  Shield, ShieldCheck, Star, Stethoscope, Target, TrendingUp, Trophy, Users, Video,
} from 'lucide-react';
import { Reveal } from './reveal';

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
    label: 'FORMULE ESSENTIELLE', tagline: 'Preparez les EVC avec une methode\nstructuree et des ressources concues\npour les medecins diplomes\nhors Union Europeenne.',
    price: '495', hero: '/formules/hero-formule-essentielle.jpg',
    desc: 'Travaillez en autonomie grace a une plateforme complete regroupant QCM, dossiers cliniques, flashcards, fiches pedagogiques et methodologie EVC.',
    cta: 'Commencer maintenant',
    features: ['QCM, dossiers, fiches, flashcards', 'Methodologie EVC (voies interne et externe)', 'Ideal pour les candidats autonomes'],
    contentItems: [
      { Icon: ClipboardCheck, t: 'QCM d\'entrainement', d: 'Series ciblees pour travailler efficacement' },
      { Icon: FileText, t: 'Dossiers cliniques', d: 'Situations inspirees des EVC' },
      { Icon: Layers3, t: 'Fiches pedagogiques', d: 'Informations cles a retenir' },
      { Icon: BookOpen, t: 'Flashcards', d: 'Revisez rapidement les notions essentielles' },
      { Icon: Target, t: 'Methodologie EVC', d: 'Seances dediees pour comprendre ce qui est attendu aux EVC' },
      { Icon: LineChart, t: 'Suivi de progression', d: 'Visualisez vos acquis et vos points a ameliorer' },
    ],
  },
  intensive: {
    color: '#C0112E', colorSoft: '#FDE8EC',
    label: 'FORMULE INTENSIVE', tagline: 'Finalisez votre preparation\ndans les derniers mois avant les EVC',
    price: '995', hero: '/formules/hero-formule-intensive.jpg',
    desc: 'Pour les candidats disposant deja de bases solides et souhaitant beneficier de revisions guidees, de corrections detaillees et de rappels cibles avant l\'examen.',
    cta: 'Commencer maintenant', badge: 'LA PLUS CHOISIE AVANT LES EVC',
    features: ['Parcours adapte a votre voie (interne ou externe)', 'Seances de revision thematiques', 'Corrections commentees avec rappels cibles', 'Ideal dans les derniers mois avant les EVC'],
    contentItems: [
      { Icon: ClipboardCheck, t: 'QCM d\'entrainement', d: 'Series ciblees par specialite et thematique' },
      { Icon: CheckCircle2, t: 'Corrections commentees', d: 'Explications detaillees par des experts' },
      { Icon: BookOpen, t: 'Seances de revision guidees', d: 'Rappels des points cles et astuces' },
      { Icon: FileText, t: 'Fiches & dossiers cliniques', d: 'Cas pratiques et situations inspirees des EVC' },
      { Icon: Target, t: 'Methodologie EVC', d: 'Conseils et strategies pour repondre aux attentes du jury' },
      { Icon: LineChart, t: 'Suivi de progression', d: 'Tableau de bord et recommandations' },
    ],
  },
  approfondi: {
    color: '#1E40AF', colorSoft: '#DBEAFE',
    label: 'PROGRAMME APPROFONDI', tagline: 'Approfondissez votre preparation\navec un accompagnement structure\njusqu\'aux EVC',
    price: '2 395', pricePrefix: 'A partir de', hero: '/formules/hero-programme-approfondi.jpg',
    desc: 'Le Programme Approfondi est concu pour vous offrir une reprise structuree des specialites essentielles, des seances interactives, des echanges reguliers avec les enseignants et un suivi pedagogique renforce.',
    cta: 'Echanger avec un conseiller', ctaSecondary: 'Planifier un echange',
    features: ['Approfondissement des specialites majeures', 'Echanges avec les enseignants', 'Epreuves blanches et suivi personnalise', 'Ideal pour une reprise complete et progressive'],
    contentItems: [
      { Icon: Users, t: 'Seances interactives', d: 'Reprise des notions cles a partir de dossiers cliniques guides' },
      { Icon: FileText, t: 'Fiches & dossiers', d: 'Cas pratiques et situations cliniques inspirees des EVC' },
      { Icon: BookOpen, t: 'Rappels cibles au bon moment', d: 'Consolidation des points essentiels' },
      { Icon: MessageCircle, t: 'Echanges avec les enseignants', d: 'Reponses a vos questions et conseils personnalises' },
      { Icon: ClipboardCheck, t: 'Epreuves blanches', d: 'Entrainements en conditions reelles et corrections detaillees' },
      { Icon: LineChart, t: 'Suivi pedagogique', d: 'Accompagnement tout au long de votre preparation' },
    ],
  },
};

const SPECIALTIES = ['Medecine Generale', 'Pediatrie', 'Cardiologie', 'Pneumologie', 'Neurologie', 'Gynecologie'];

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
                  { Icon: Users, t: '+ 9 000', s: 'medecins\naccompagnes' },
                  { Icon: GraduationCap, t: '45+', s: 'specialites\npreparees' },
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
                <div className="flex items-center gap-1">
                  <p className="text-sm font-bold" style={{ color: NAVY }}>4,8/5</p>
                  <div className="flex">{[1,2,3,4,5].map(i => <Star key={i} className="h-3 w-3" style={{ color: '#F59E0B' }} fill="currentColor" />)}</div>
                  <p className="text-[10px]" style={{ color: INK_SOFT }}>sur plus de 500 avis</p>
                </div>
              </div>

              {/* Price */}
              <div className="mt-6">
                {c.pricePrefix && <p className="text-sm" style={{ color: INK_SOFT }}>{c.pricePrefix}</p>}
                <p className="text-4xl font-black" style={{ color: c.color }}>{c.price} &euro;{variant === 'approfondi' ? '*' : ''}</p>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/inscription" className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white"
                  style={{ background: c.color }}>
                  {c.cta} <ArrowRight className="h-4 w-4" />
                </Link>
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
                <p className="mt-2 text-xs" style={{ color: INK_SOFT }}>*Tarif variable selon la specialite preparee.</p>
              )}
            </div>
            <div className="relative hidden lg:block">
              <img src={c.hero} alt="" className="absolute inset-0 h-full w-full object-cover" />
              {/* Side badges */}
              <div className="absolute right-4 top-8 flex flex-col gap-2">
                {['Acces 24h/24\n7j/7', 'Plateforme\nweb & mobile', 'Paiement\nsecurise', 'Support reactif\n7j/7'].map(b => (
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

      {/* SPECIALTIES */}
      <section className="bg-[#F8F9FC] py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-xl font-black" style={{ color: NAVY }}>Plus de 45 specialites preparees</h2>
              <div className="mt-5 flex flex-wrap gap-3">
                {SPECIALTIES.map(s => (
                  <span key={s} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold"
                    style={{ borderColor: BORDER, color: NAVY }}>
                    <Stethoscope className="h-4 w-4" style={{ color: c.color }} /> {s}
                  </span>
                ))}
                <span className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-bold"
                  style={{ background: c.colorSoft, color: c.color }}>... + 39 autres specialites</span>
              </div>
              <Link href="/specialites" className="mt-4 inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-bold"
                style={{ borderColor: BORDER, color: NAVY }}>
                Voir toutes les specialites <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div>
              <h3 className="text-lg font-black" style={{ color: NAVY }}>Une plateforme pensee pour votre reussite</h3>
              <div className="mt-4 rounded-xl overflow-hidden border" style={{ borderColor: BORDER }}>
                <img src="/accueil.png" alt="Apercu plateforme" className="w-full" />
              </div>
              <ul className="mt-4 space-y-1.5">
                {['Tous les contenus reunis au meme endroit', 'Accessible 24h/24 et 7j/7', 'Compatible ordinateur, tablette et mobile', 'Mises a jour pedagogiques regulieres', 'Interface simple et intuitive'].map(b => (
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
              { v: 'essentielle' as Variant, name: 'FORMULE ESSENTIELLE', price: '495', color: '#2E7D32', bg: '#E8F5E9', desc: 'Travail en autonomie', sub: 'Organisez votre preparation a votre rythme avec les ressources essentielles.' },
              { v: 'intensive' as Variant, name: 'FORMULE INTENSIVE', price: '995', color: '#C0112E', bg: '#FDE8EC', desc: 'Consolidation avant les EVC', sub: 'Revisions guidees et corrections commentees pour consolider vos connaissances.' },
              { v: 'approfondi' as Variant, name: 'PROGRAMME APPROFONDI', price: '2 395', color: '#1E40AF', bg: '#DBEAFE', desc: 'Reprise structuree des specialites majeures', sub: 'Accompagnement renforce pour une remise a niveau complete et performante.' },
            ].map(p => (
              <div key={p.v} className={`rounded-2xl border p-5 ${p.v === variant ? 'ring-2 shadow-lg' : ''}`}
                style={{ borderColor: p.v === variant ? p.color : BORDER, ...(p.v === variant ? { ringColor: p.color } : {}) }}>
                {p.v === variant && (
                  <span className="mb-3 inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase text-white" style={{ background: p.color }}>
                    {p.v === 'intensive' ? 'LA PLUS CHOISIE AVANT LES EVC' : p.v === 'approfondi' ? 'LA PREPARATION LA PLUS COMPLETE' : ''}
                  </span>
                )}
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: p.color }}>{p.name}</p>
                <p className="text-2xl font-black" style={{ color: p.color }}>{p.price} &euro;{p.v === 'approfondi' ? '*' : ''}</p>
                <p className="mt-2 text-sm font-bold" style={{ color: NAVY }}>{p.desc}</p>
                <p className="mt-1 text-xs" style={{ color: INK_SOFT }}>{p.sub}</p>
                <Link href={p.v === variant ? '#' : `/formules/${p.v === 'approfondi' ? 'programme-approfondi' : p.v}`}
                  className="mt-4 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white"
                  style={{ background: p.color }}>
                  {p.v === variant ? c.cta : p.v === 'approfondi' ? 'Decouvrir le programme' : `Decouvrir l'${p.name.split(' ')[1]}`}
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
          <h2 className="text-center text-xl font-black" style={{ color: NAVY }}>Ils ont reussi les EVC avec Major ECN</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              { name: 'Dr Faten Hnania', spec: 'Radiologie', year: 'Laureate EVC 2024', photo: '/temoignages/drfaten.png', quote: '"Une methode claire, des ressources completes et un vrai suivi de progression. Je recommande !"' },
              { name: 'Dr Samy Kabaweh', spec: 'Cardiologie', year: 'Laureat EVC 2023', photo: '/temoignages/drsamy.jpg', quote: '"Les corrections detaillees m\'ont permis de comprendre mes erreurs et de gagner enormement en efficacite."' },
              { name: 'Dr Nada Al Ali', spec: 'Pediatrie', year: 'Laureate EVC 2023', photo: '/temoignages/dr-leila-bettaieb.jpg', quote: '"L\'accompagnement des enseignants et la qualite des dossiers cliniques font vraiment la difference."' },
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
              Voir plus de temoignages <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-12" style={{ background: variant === 'approfondi' ? '#1E40AF' : variant === 'intensive' ? '#C0112E' : '#2E7D32' }}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center text-white">
          <p className="text-sm font-semibold text-white/80">
            Acces immediat a la plateforme apres votre inscription.
          </p>
          <p className="mt-2 text-4xl font-black">{c.price} &euro;{variant === 'approfondi' ? '*' : ''}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="/inscription" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold"
              style={{ color: c.color }}>
              {c.cta} <ArrowRight className="h-4 w-4" />
            </Link>
            {c.ctaSecondary && (
              <Link href="/contact" className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-6 py-3 text-sm font-bold text-white">
                {c.ctaSecondary}
              </Link>
            )}
          </div>
          {variant === 'approfondi' && (
            <p className="mt-3 text-xs text-white/70">*Tarif variable selon la specialite preparee.</p>
          )}
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="bg-white py-6 border-t" style={{ borderColor: BORDER }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-6 text-center text-xs" style={{ color: INK_SOFT }}>
            {['Acces immediat apres inscription', 'Paiement securise en 1x ou 3x', 'Satisfait ou rembourse sous 14 jours', 'Sans engagement', 'Support reactif 7j/7'].map(b => (
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

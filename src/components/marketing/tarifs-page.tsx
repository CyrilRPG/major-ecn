'use client';
/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import {
  ArrowRight, BookOpen, Calendar, Check, CheckCircle2, ClipboardCheck, Clock,
  FileText, GraduationCap, Heart, Layers3, LineChart, MessageCircle, Play, Shield, ShieldCheck,
  Smartphone, Sparkles, Star, Stethoscope, Target, TrendingUp, Trophy, Users, Video, Zap,
} from 'lucide-react';
import { Reveal } from './reveal';

const NAVY = '#0F1F4D';
const RED = '#C0112E';
const RED_SOFT = '#FDE8EC';
const INK = '#1F2937';
const INK_SOFT = '#5B6478';
const BORDER = '#E5E9F0';
const FONT = "'Plus Jakarta Sans', sans-serif";

const SPECIALTIES = [
  { name: 'Médecine Générale', Icon: Stethoscope },
  { name: 'Radiologie', Icon: Target },
  { name: 'Gériatrie', Icon: Heart },
  { name: 'Pédiatrie', Icon: Users },
  { name: 'Psychiatrie', Icon: MessageCircle },
  { name: 'Cardiologie', Icon: Heart },
  { name: 'Pneumologie', Icon: Stethoscope },
  { name: 'Néphrologie', Icon: Shield },
];

export function TarifsPageContent() {
  return (
    <div style={{ fontFamily: FONT }}>
      {/* HERO */}
      <section className="bg-white pt-8 pb-0">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Top banner */}
          <div className="flex flex-wrap items-center justify-center gap-4 rounded-full border px-6 py-2.5 text-[12px] font-bold" style={{ borderColor: BORDER, color: NAVY }}>
            <span className="flex items-center gap-1.5"><GraduationCap className="h-4 w-4" style={{ color: RED }} /> 45 SPÉCIALITÉS EVC</span>
            <span style={{ color: RED }}>·</span>
            <span className="flex items-center gap-1.5"><Users className="h-4 w-4" style={{ color: RED }} /> PLUS DE 9 000 MÉDECINS ACCOMPAGNÉS</span>
            <span style={{ color: RED }}>·</span>
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" style={{ color: RED }} /> DEPUIS 2011</span>
          </div>

          <h1 className="mt-8 text-center text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl" style={{ color: NAVY }}>
            Tarifs des préparations <span style={{ color: RED }}>EVC (PAE)</span>
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-center text-base leading-relaxed" style={{ color: INK_SOFT }}>
            Préparations destinées aux médecins diplômés hors Union Européenne préparant les{' '}
            <strong style={{ color: NAVY }}>Épreuves de Vérification des Connaissances (EVC)</strong> dans le cadre de la{' '}
            Procédure d'Autorisation d'Exercice (PAE).
          </p>

          {/* Stats */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-8 text-center">
            {[
              { Icon: Users, big: 'Plus de 9 000', sub: 'médecins accompagnés' },
              { Icon: GraduationCap, big: '45 spécialités', sub: 'préparées' },
              { Icon: Calendar, big: 'Depuis 2011', sub: 'à vos côtés' },
            ].map(s => (
              <div key={s.big} className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: RED_SOFT, color: RED }}>
                  <s.Icon className="h-5 w-5" />
                </span>
                <div className="text-left">
                  <p className="text-sm font-extrabold" style={{ color: RED }}>{s.big}</p>
                  <p className="text-xs" style={{ color: INK_SOFT }}>{s.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SPECIALTIES BAR */}
      <section className="bg-white py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border p-6" style={{ borderColor: BORDER }}>
            <p className="text-center text-sm font-extrabold uppercase tracking-[0.14em]" style={{ color: NAVY }}>
              <Stethoscope className="mr-2 inline h-4 w-4" style={{ color: RED }} />
              Plus de 45 spécialités préparées
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              {SPECIALTIES.map(s => (
                <span key={s.name} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-semibold"
                  style={{ borderColor: BORDER, color: NAVY }}>
                  <s.Icon className="h-4 w-4" style={{ color: RED }} /> {s.name}
                </span>
              ))}
              <span className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-[13px] font-bold" style={{ background: RED_SOFT, color: RED }}>
                + 37 autres spécialités
              </span>
            </div>
            <div className="mt-5 text-center">
              <Link href="/specialites" className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold text-white" style={{ background: RED }}>
                Découvrir les 45 spécialités préparées <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* IMPORTANT NOTICE */}
      <section className="bg-white pb-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4 rounded-2xl border-l-4 bg-[#F8F9FC] p-6" style={{ borderColor: NAVY }}>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full" style={{ background: '#E8EDF5', color: NAVY }}>
              <Shield className="h-6 w-6" />
            </span>
            <div>
              <p className="text-base font-extrabold" style={{ color: RED }}>IMPORTANT</p>
              <p className="mt-1 text-sm leading-relaxed" style={{ color: INK }}>
                Les tarifs et programmes varient selon les spécialités préparées.<br />
                La Médecine Générale est présentée ci-dessous à titre d'exemple détaillé de préparation et de tarification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* EXAMPLE HEADER */}
      <section className="bg-white pb-6">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg font-extrabold" style={{ color: NAVY }}>
            Exemple détaillé : Préparation <span style={{ color: RED }}>EVC Médecine Générale (PAE)</span>
          </p>
        </div>
      </section>

      {/* 3 FORMULAS */}
      <section className="bg-white pb-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3 items-start">
            {/* Essentielle */}
            <div className="rounded-2xl border p-6" style={{ borderColor: BORDER }}>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: '#E8F5E9', color: '#2E7D32' }}>
                  <BookOpen className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#2E7D32' }}>FORMULE</p>
                  <p className="text-lg font-black" style={{ color: '#2E7D32' }}>ESSENTIELLE</p>
                </div>
              </div>
              <p className="mt-2 text-sm" style={{ color: INK_SOFT }}>S'entraîner efficacement aux EVC</p>
              <p className="mt-4 text-4xl font-black" style={{ color: '#2E7D32' }}>495 €</p>
              <ul className="mt-5 space-y-2">
                {['Plateforme EVC accès illimité', 'QCM d'entraînement', 'Dossiers et exercices corrigés', 'Fiches de synthèse', 'Suivi de progression', '1 séance vidéo de méthodologie EVC'].map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm" style={{ color: INK }}>
                    <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: '#2E7D32' }} /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/inscription" className="mt-6 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white" style={{ background: '#2E7D32' }}>
                Commencer avec Essentielle <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="mt-2 text-center text-xs" style={{ color: INK_SOFT }}>7 jours d'essai gratuit · Sans engagement</p>
            </div>

            {/* Intensive — highlighted */}
            <div className="relative rounded-2xl border-2 p-6 shadow-lg" style={{ borderColor: RED }}>
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full px-4 py-1 text-[11px] font-bold uppercase text-white" style={{ background: RED }}>
                <Star className="h-3 w-3" fill="currentColor" /> LA PLUS CHOISIE
              </span>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: RED_SOFT, color: RED }}>
                  <Target className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: RED }}>FORMULE</p>
                  <p className="text-lg font-black" style={{ color: RED }}>INTENSIVE</p>
                </div>
              </div>
              <p className="mt-2 text-sm" style={{ color: INK_SOFT }}>Révisions ciblées EVC</p>
              <p className="mt-1 text-sm font-semibold" style={{ color: INK }}>Deux parcours au choix :</p>
              <div className="mt-2 flex gap-2">
                <span className="rounded-full border px-3 py-1 text-xs font-bold" style={{ borderColor: RED, color: RED }}>VOIE INTERNE →</span>
                <span className="rounded-full border px-3 py-1 text-xs font-bold" style={{ borderColor: RED, color: RED }}>VOIE EXTERNE →</span>
              </div>
              <p className="mt-4 text-4xl font-black" style={{ color: RED }}>995 €</p>
              <ul className="mt-5 space-y-2">
                {['Tout le contenu de la formule Essentielle', 'Environ 20 heures de révision ciblée', 'QCM supplémentaires expliqués', 'Méthodologie avancée EVC', '2 épreuves blanches', 'Corrections détaillées', 'Supports de révision téléchargeables'].map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm" style={{ color: INK }}>
                    <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: RED }} /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/inscription" className="mt-6 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white" style={{ background: RED }}>
                Choisir Intensive <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Programme Approfondi */}
            <div className="rounded-2xl border p-6" style={{ borderColor: BORDER }}>
              <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold uppercase text-white" style={{ background: '#F59E0B' }}>
                <Star className="h-3 w-3" fill="currentColor" /> REMISE À NIVEAU APPROFONDIE
              </span>
              <div className="mt-3 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: '#EDE9FE', color: '#7C3AED' }}>
                  <GraduationCap className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#7C3AED' }}>PROGRAMME</p>
                  <p className="text-lg font-black" style={{ color: '#7C3AED' }}>APPROFONDI</p>
                </div>
              </div>
              <p className="mt-2 text-sm" style={{ color: INK_SOFT }}>Remise à niveau approfondie et préparation complète</p>
              <p className="mt-4 text-sm" style={{ color: INK_SOFT }}>À partir de</p>
              <p className="text-4xl font-black" style={{ color: '#7C3AED' }}>2 395 €</p>
              <ul className="mt-5 space-y-2">
                {['Remise à niveau et préparation complète', 'Reprise approfondie des spécialités majeures', 'Cours de remise à niveau associés à des dossiers cliniques', 'Résolution progressive de dossiers inspirés des EVC', 'Interrogations régulières pour évaluer la progression', 'Épreuves blanches', 'Séances de révision dédiées', 'Accompagnement pédagogique personnalisé'].map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm" style={{ color: INK }}>
                    <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: '#7C3AED' }} /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/contact" className="mt-6 flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-bold" style={{ borderColor: '#7C3AED', color: '#7C3AED' }}>
                Découvrir le programme <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="bg-[#F8F9FC] py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-6 text-center">
            {[
              { Icon: Zap, t: 'Accès immédiat', sub: 'après inscription' },
              { Icon: Shield, t: 'Sans carte', sub: 'bancaire' },
              { Icon: Check, t: 'Sans', sub: 'engagement' },
              { Icon: Clock, t: 'Annulation', sub: 'instantanée' },
              { Icon: ShieldCheck, t: 'Paiement', sub: 'sécurisé' },
            ].map(b => (
              <div key={b.t} className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: RED_SOFT, color: RED }}>
                  <b.Icon className="h-4 w-4" />
                </span>
                <div className="text-left">
                  <p className="text-sm font-bold" style={{ color: NAVY }}>{b.t}</p>
                  <p className="text-xs" style={{ color: INK_SOFT }}>{b.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUELLE FORMULE CHOISIR */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-black tracking-tight sm:text-3xl" style={{ color: NAVY }}>
            QUELLE FORMULE CHOISIR ?
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { color: '#2E7D32', bg: '#E8F5E9', title: 'Je souhaite principalement m'entraîner', desc: 'Je possède déjà de bonnes bases et je veux m'entraîner avec des QCM, exercices et dossiers corrigés.', cta: 'Essentielle' },
              { color: RED, bg: RED_SOFT, title: 'Je souhaite réviser de façon ciblée', desc: 'Je veux consolider mes connaissances avec des révisions structurées et des entraînements ciblés.', cta: 'Intensive' },
              { color: '#7C3AED', bg: '#EDE9FE', title: 'Je souhaite reprendre les spécialités en profondeur', desc: 'Je souhaite reprendre les spécialités en profondeur avec un accompagnement complet et personnalisé.', cta: 'Programme approfondi' },
            ].map(c => (
              <div key={c.title} className="rounded-2xl border p-6 text-center" style={{ borderColor: BORDER }}>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full" style={{ background: c.bg, color: c.color }}>
                  <Target className="h-6 w-6" />
                </span>
                <p className="mt-4 text-base font-extrabold leading-tight" style={{ color: NAVY }}>{c.title}</p>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: INK_SOFT }}>{c.desc}</p>
                <span className="mt-4 inline-block rounded-full border px-4 py-1.5 text-sm font-bold" style={{ borderColor: c.color, color: c.color }}>
                  {c.cta}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INCLUS DANS TOUTES LES FORMULES */}
      <section className="bg-[#F8F9FC] py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-xl font-black uppercase tracking-wider" style={{ color: NAVY }}>
            INCLUS DANS TOUTES LES FORMULES
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { Icon: Smartphone, t: 'Plateforme en ligne', d: 'QCM, dossiers cliniques, fiches de cours et ressources synthétiques.' },
              { Icon: LineChart, t: 'Suivi pédagogique', d: 'Tableau de bord, statistiques et suivi personnalisé de votre progression.' },
              { Icon: Target, t: 'Méthodologie EVC', d: 'Approche dédiée aux attentes des jurys et aux spécificités des EVC.' },
              { Icon: TrendingUp, t: 'Mises à jour régulières', d: 'Contenus actualisés en fonction des dernières évolutions aux EVC.' },
              { Icon: MessageCircle, t: 'Support réactif', d: 'Un tuteur disponible pour répondre à toutes vos questions.' },
              { Icon: Clock, t: 'Accès 24h/24, 7j/7', d: 'Apprenez à votre rythme, sans contrainte horaire.' },
            ].map(f => (
              <div key={f.t} className="flex items-start gap-3 rounded-xl border bg-white p-4" style={{ borderColor: BORDER }}>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: RED_SOFT, color: RED }}>
                  <f.Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-bold" style={{ color: NAVY }}>{f.t}</p>
                  <p className="mt-1 text-xs leading-relaxed" style={{ color: INK_SOFT }}>{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DÉCOUVREZ LA PLATEFORME */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-black tracking-tight" style={{ color: NAVY }}>DÉCOUVREZ LA PLATEFORME MAJOR ECN</h2>
          <div className="mt-8 rounded-2xl border bg-[#F8F9FC] p-6 lg:p-10" style={{ borderColor: BORDER }}>
            <img src="/accueil.png" alt="Aperçu plateforme Major ECN" className="w-full rounded-xl shadow-lg" />
          </div>
        </div>
      </section>

      {/* POURQUOI CHOISIR MAJOR ECN */}
      <section className="bg-[#F8F9FC] py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-black tracking-tight" style={{ color: NAVY }}>POURQUOI CHOISIR MAJOR ECN ?</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { Icon: Calendar, t: '15 ANS', sub: 'D'EXPÉRIENCE', d: 'Depuis 2011, au service des médecins étrangers.' },
              { Icon: Users, t: '+ DE 9 000', sub: 'MÉDECINS ACCOMPAGNÉS', d: 'Toutes spécialités confondues.' },
              { Icon: GraduationCap, t: '45 SPÉCIALITÉS', sub: 'PRÉPARÉES', d: 'Médecine générale et spécialités médicales, chirurgicales, odontologiques et pharmaceutiques.' },
              { Icon: Trophy, t: 'ENSEIGNANTS', sub: 'EXPÉRIMENTÉS', d: 'Enseignants expérimentés présents depuis plusieurs années dans nos préparations.' },
              { Icon: ClipboardCheck, t: 'DOSSIERS CLINIQUES,', sub: 'QCM ET ÉVALUATIONS', d: 'Contenus fiables, à jour et conformes aux EVC.' },
            ].map(s => (
              <div key={s.t} className="rounded-xl border bg-white p-4 text-center" style={{ borderColor: BORDER }}>
                <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full" style={{ background: RED_SOFT, color: RED }}>
                  <s.Icon className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-black" style={{ color: RED }}>{s.t}</p>
                <p className="text-xs font-bold" style={{ color: NAVY }}>{s.sub}</p>
                <p className="mt-2 text-xs leading-relaxed" style={{ color: INK_SOFT }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS VIDEO */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-xl font-black" style={{ color: NAVY }}>PLUS DE 9 000 MÉDECINS ACCOMPAGNÉS DEPUIS 2007</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              { name: 'Dr Faten Hnania', spec: 'Radiologie', year: 'Lauréate EVC 2024', photo: '/temoignages/drfaten.png', quote: '"Une méthode claire, des ressources complètes et un vrai suivi de progression. Je recommande !"' },
              { name: 'Dr Samy Kabaweh', spec: 'Cardiologie', year: 'Lauréat EVC 2023', photo: '/temoignages/drsamy.jpg', quote: '"Les corrections détaillées m'ont permis de comprendre mes erreurs et de gagner énormément en efficacité."' },
              { name: 'Dr Nada Al Ali', spec: 'Pédiatrie', year: 'Lauréate EVC 2023', photo: '/temoignages/dr-leila-bettaieb.jpg', quote: '"L'accompagnement des enseignants et la qualité des dossiers cliniques font vraiment la différence."' },
            ].map(t => (
              <div key={t.name} className="rounded-2xl border p-5" style={{ borderColor: BORDER }}>
                <div className="flex items-center gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                    <img src={t.photo} alt={t.name} className="h-full w-full object-cover" />
                    <span className="absolute bottom-1 left-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow">
                      <Play className="h-3 w-3" style={{ color: RED }} fill="currentColor" />
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-extrabold" style={{ color: NAVY }}>{t.name}</p>
                    <p className="text-xs" style={{ color: INK_SOFT }}>{t.spec}</p>
                    <p className="text-xs font-bold" style={{ color: RED }}>{t.year}</p>
                    <div className="flex gap-0.5 mt-0.5">{[1,2,3,4,5].map(i => <Star key={i} className="h-3 w-3" style={{ color: '#F59E0B' }} fill="currentColor" />)}</div>
                  </div>
                </div>
                <p className="mt-3 text-sm italic leading-relaxed" style={{ color: INK_SOFT }}>{t.quote}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href="/temoignages" className="inline-flex items-center gap-2 rounded-full border px-6 py-2.5 text-sm font-bold" style={{ borderColor: RED, color: RED }}>
              Voir tous les témoignages <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#F8F9FC] py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-xl font-black" style={{ color: NAVY }}>QUESTIONS FRÉQUENTES</h2>
              <ul className="mt-4 space-y-3">
                {[
                  'À qui s'adressent les préparations EVC ?',
                  'Combien de temps avant les EVC faut-il commencer ?',
                  'Les épreuves blanches sont-elles corrigées ?',
                  'Les contenus sont-ils mis à jour régulièrement ?',
                  'Y a-t-il un accompagnement personnalisé ?',
                  'Quelle différence entre la voie interne et la voie externe ?',
                ].map(q => (
                  <li key={q} className="flex items-start gap-2 text-sm" style={{ color: INK }}>
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0" style={{ color: RED }} /> {q}
                  </li>
                ))}
              </ul>
              <Link href="/faq" className="mt-4 inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-bold" style={{ borderColor: BORDER, color: NAVY }}>
                Voir toutes les questions <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* TRIAL CTA */}
            <div className="rounded-2xl border bg-white p-6" style={{ borderColor: BORDER }}>
              <h3 className="text-lg font-black" style={{ color: RED }}>TESTEZ MAJOR ECN GRATUITEMENT PENDANT 7 JOURS</h3>
              <ul className="mt-4 space-y-2">
                {['Accès illimité à la plateforme', '7 jours d'essai gratuit', 'Sans carte bancaire', 'Annulation à tout moment'].map(b => (
                  <li key={b} className="flex items-center gap-2 text-sm" style={{ color: INK }}>
                    <Check className="h-4 w-4" style={{ color: '#2E7D32' }} /> {b}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm" style={{ color: INK_SOFT }}>
                Découvrez la plateforme, les ressources pédagogiques et notre méthodologie sans engagement.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <input placeholder="Prénom" className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: BORDER }} />
                <input placeholder="Nom" className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: BORDER }} />
                <input placeholder="Email" className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: BORDER }} />
                <input placeholder="Téléphone" className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: BORDER }} />
                <select className="rounded-lg border px-3 py-2 text-sm col-span-2" style={{ borderColor: BORDER, color: INK_SOFT }}>
                  <option>Spécialité principale</option>
                </select>
              </div>
              <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white" style={{ background: RED }}>
                Démarrer mon essai gratuit <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

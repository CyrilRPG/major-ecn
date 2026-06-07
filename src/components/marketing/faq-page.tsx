'use client';
/**
 * Page FAQ — refonte pixel-perfect (maquette designer).
 * Header titre + sous-titre + 4 mini-cartes + carte rouge "?"
 * Layout 2 colonnes : grand accordéon (14 catégories) + sidebar (3 cartes).
 * En-bas : "Questions les plus posées" (5 cartes), CTA final.
 */

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowRight, BookOpen, Calendar, Check, CheckCircle2, ChevronDown, ChevronRight,
  GraduationCap, HelpCircle, Layers3, MessageCircle, Sparkles, Stethoscope, TrendingUp,
  Users,
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
   Données — 14 catégories
   ============================================================ */
type QA = { q: string; a: string };
type Category = { id: string; title: string; intro?: string; qas: QA[] };

const CATEGORIES: Category[] = [
  {
    id: 'evc',
    title: 'Questions sur les EVC',
    qas: [
      { q: "Qu'est-ce que les Épreuves de Vérification des Connaissances (EVC) ?",
        a: "Les Épreuves de Vérification des Connaissances (EVC) constituent une étape essentielle de la Procédure d'Autorisation d'Exercice (PAE). Elles permettent aux médecins, chirurgiens-dentistes, pharmaciens et sages-femmes diplômés hors Union européenne de poursuivre leur parcours vers l'exercice en France. Les EVC évaluent les connaissances médicales, le raisonnement clinique, la capacité d'analyse et la compréhension des pratiques professionnelles françaises." },
      { q: "À qui s'adressent les EVC ?",
        a: "Les EVC concernent principalement les professionnels de santé diplômés hors Union européenne souhaitant exercer en France dans le cadre de la PAE. Les conditions exactes d'accès dépendent de la réglementation en vigueur et de la profession concernée." },
      { q: "Pourquoi les EVC sont-ils réputés difficiles ?",
        a: "Les EVC évaluent non seulement les connaissances médicales mais également la capacité à raisonner, hiérarchiser les informations, appliquer les recommandations françaises et répondre selon les attentes du jury." },
      { q: "Quel est le niveau attendu aux EVC ?",
        a: "Le niveau attendu correspond à celui d'un professionnel capable de prendre en charge des situations cliniques conformes aux standards médicaux français et aux recommandations actuelles." },
      { q: "Peut-on réussir les EVC sans préparation ?",
        a: "Certaines personnes y parviennent, mais une préparation structurée permet généralement de gagner du temps, de mieux cibler les révisions et d'optimiser ses chances de réussite." },
      { q: "Quels sont les pièges les plus fréquents aux EVC ?",
        a: "Les erreurs les plus fréquentes concernent la méthodologie, la mauvaise hiérarchisation des réponses, les oublis d'éléments importants et la gestion du temps." },
      { q: "Les EVC évaluent-ils uniquement les connaissances médicales ?",
        a: "Non. Le raisonnement clinique, l'organisation de la réponse et la capacité à appliquer les bonnes conduites à tenir sont également évalués." },
      { q: "Quelle différence existe-t-il entre les EVC et les examens classiques ?",
        a: "Les EVC sont davantage centrés sur la pratique clinique, les situations réelles et la prise de décision médicale." },
    ],
  },
  {
    id: 'preparation',
    title: 'Questions sur la préparation',
    qas: [
      { q: "Pourquoi suivre une préparation EVC ?",
        a: "Une préparation permet de structurer les révisions, de s'entraîner régulièrement et de comprendre les attentes spécifiques de l'examen." },
      { q: "Combien de temps faut-il préparer les EVC ?",
        a: "La durée dépend du niveau initial, de la spécialité et du temps disponible. De nombreux candidats commencent plusieurs mois avant l'examen." },
      { q: "Les QCM suffisent-ils pour réussir les EVC ?",
        a: "Non. Les QCM doivent être complétés par des cas cliniques, des concours blancs, des fiches de révision et un travail méthodologique." },
      { q: "Faut-il connaître les recommandations HAS par cœur ?",
        a: "Les recommandations sont importantes mais doivent être comprises et appliquées dans un raisonnement clinique cohérent." },
      { q: "Comment organiser ses révisions ?",
        a: "Il est recommandé d'associer apprentissage théorique, entraînement pratique, révisions espacées et évaluations régulières." },
      { q: "Comment préparer les EVC lorsqu'on travaille ?",
        a: "Une organisation rigoureuse, un planning réaliste et des outils accessibles à distance permettent généralement de concilier activité professionnelle et préparation." },
    ],
  },
  {
    id: 'major-ecn',
    title: 'Questions sur Major ECN',
    qas: [
      { q: "Pourquoi choisir Major ECN ?",
        a: "Depuis 2011, Major ECN accompagne les professionnels de santé préparant les EVC grâce à une méthodologie dédiée, des outils pédagogiques modernes et une préparation structurée." },
      { q: "Qu'est-ce qui différencie Major ECN des autres préparations ?",
        a: "La méthodologie EVC, les révisions transversales, les flashcards, les concours blancs, les outils de suivi de progression et la plateforme pédagogique constituent des éléments différenciants." },
      { q: "Depuis quand Major ECN prépare-t-il les EVC ?",
        a: "Major ECN accompagne les candidats depuis 2011." },
      { q: "Les contenus sont-ils régulièrement mis à jour ?",
        a: "Les contenus évoluent afin de tenir compte des besoins pédagogiques et des évolutions de la pratique médicale." },
      { q: "Existe-t-il des entraînements corrigés ?",
        a: "Oui. Les préparations comprennent des QCM, cas cliniques et concours blancs avec corrections détaillées." },
    ],
  },
  {
    id: 'specialites',
    title: 'Questions sur les spécialités',
    qas: [
      { q: "Quelles spécialités sont préparées ?",
        a: "Plus de 45 spécialités médicales, chirurgicales, odontologiques, pharmaceutiques et de maïeutique sont préparées." },
      { q: "Ma spécialité n'apparaît pas sur le site. Que faire ?",
        a: "Nous vous invitons à contacter notre équipe afin d'obtenir des informations sur votre spécialité." },
      { q: "Préparez-vous la médecine générale ?",
        a: "Oui. La médecine générale fait partie des spécialités préparées par Major ECN." },
      { q: "Préparez-vous les spécialités chirurgicales ?",
        a: "Oui. Plusieurs spécialités chirurgicales sont proposées." },
      { q: "Préparez-vous l'odontologie ?",
        a: "Oui. Des préparations sont proposées aux chirurgiens-dentistes." },
    ],
  },
  {
    id: 'inscription',
    title: "Questions sur l'inscription",
    qas: [
      { q: "Comment s'inscrire à une préparation Major ECN ?",
        a: "L'inscription peut être réalisée directement en ligne ou après échange avec un membre de l'équipe." },
      { q: "Puis-je être accompagné avant de choisir une formule ?",
        a: "Oui. Notre équipe peut vous orienter vers la formule la plus adaptée." },
      { q: "Puis-je suivre la préparation depuis l'étranger ?",
        a: "Oui. La plateforme est accessible depuis la France et l'international." },
      { q: "Puis-je tester la plateforme avant de m'inscrire ?",
        a: "Oui. Un accès découverte est proposé afin de découvrir l'environnement pédagogique." },
    ],
  },
  {
    id: 'organisation',
    title: 'Questions pratiques et organisation',
    qas: [
      { q: "Comment rester motivé pendant plusieurs mois de préparation ?",
        a: "Il est recommandé de se fixer des objectifs progressifs et de suivre régulièrement sa progression." },
      { q: "Combien d'heures faut-il travailler chaque semaine ?",
        a: "Le volume dépend du niveau initial et des objectifs du candidat." },
      { q: "Comment savoir si mon niveau est suffisant ?",
        a: "Les évaluations et concours blancs permettent généralement d'obtenir une vision précise de sa progression." },
    ],
  },
  {
    id: 'plateforme',
    title: 'Questions sur la plateforme',
    qas: [
      { q: "Comment fonctionne la plateforme Major ECN ?",
        a: "La plateforme centralise cours, fiches, QCM, cas cliniques, flashcards, concours blancs et outils de suivi." },
      { q: "Puis-je accéder à la plateforme sur mobile ?", a: "Oui." },
      { q: "Existe-t-il un suivi de progression ?", a: "Oui." },
      { q: "Puis-je travailler à mon rythme ?", a: "Oui." },
    ],
  },
  {
    id: 'outils',
    title: 'Questions sur les outils pédagogiques',
    qas: [
      { q: "À quoi servent les flashcards ?",
        a: "Elles facilitent la mémorisation active et la consolidation des acquis." },
      { q: "Les cas cliniques sont-ils corrigés ?", a: "Oui." },
      { q: "Les concours blancs sont-ils utiles ?",
        a: "Ils permettent de reproduire les conditions réelles de l'examen." },
    ],
  },
  {
    id: 'methodologie',
    title: 'Questions sur la méthodologie',
    qas: [
      { q: "Pourquoi la méthodologie est-elle importante aux EVC ?",
        a: "Elle permet de valoriser les connaissances et de répondre selon les attentes du jury." },
      { q: "Comment répondre efficacement à un dossier clinique ?",
        a: "Il faut identifier les éléments importants, hiérarchiser les hypothèses et justifier les décisions." },
      { q: "Comment gérer son temps pendant les EVC ?",
        a: "L'entraînement régulier en conditions réelles permet de développer des automatismes." },
    ],
  },
  {
    id: 'recommandations',
    title: 'Questions sur les recommandations et le système de santé français',
    qas: [
      { q: "Les recommandations françaises sont-elles importantes ?", a: "Oui." },
      { q: "Est-il nécessaire d'avoir exercé en France pour réussir les EVC ?", a: "Non." },
      { q: "Les EVC évaluent-ils la connaissance du système de santé français ?",
        a: "Certaines notions peuvent être utiles selon les situations abordées." },
    ],
  },
  {
    id: 'resultats',
    title: 'Questions sur les résultats et la suite de la procédure',
    qas: [
      { q: "Que se passe-t-il après la réussite des EVC ?",
        a: "La réussite constitue une étape importante de la Procédure d'Autorisation d'Exercice. Les démarches suivantes dépendent du parcours du candidat et de la réglementation applicable." },
      { q: "Les EVC garantissent-ils automatiquement l'autorisation d'exercice ?",
        a: "Les EVC constituent une étape majeure du parcours mais ne résument pas à elles seules l'ensemble de la procédure." },
    ],
  },
  {
    id: 'financement',
    title: 'Questions sur le financement',
    qas: [
      { q: "Peut-on financer sa préparation ?",
        a: "Les modalités de financement dépendent de la situation du candidat et de la réglementation applicable." },
      { q: "Existe-t-il des facilités de paiement ?",
        a: "Selon les formules proposées, différentes solutions peuvent être envisagées." },
    ],
  },
  {
    id: 'padhue',
    title: 'Questions pour les PADHUE / médecins étrangers',
    qas: [
      { q: "La préparation est-elle adaptée aux PADHUE ?",
        a: "Oui. Elle a été conçue pour répondre aux besoins des professionnels de santé diplômés hors Union européenne." },
      { q: "Est-elle adaptée aux médecins exerçant déjà en France ?", a: "Oui." },
      { q: "Est-elle adaptée aux candidats vivant à l'étranger ?", a: "Oui." },
    ],
  },
  {
    id: 'par-specialite',
    title: 'Questions fréquentes par spécialité',
    qas: [
      { q: "Préparez-vous la gériatrie ?", a: "Oui." },
      { q: "Préparez-vous la pédiatrie ?", a: "Oui." },
      { q: "Préparez-vous la psychiatrie ?", a: "Oui." },
      { q: "Préparez-vous la cardiologie ?", a: "Oui." },
      { q: "Préparez-vous la pneumologie ?", a: "Oui." },
      { q: "Préparez-vous la néphrologie ?", a: "Oui." },
      { q: "Préparez-vous l'endocrinologie ?", a: "Oui." },
      { q: "Préparez-vous l'hématologie ?", a: "Oui." },
      { q: "Préparez-vous l'hépato-gastroentérologie ?", a: "Oui." },
      { q: "Préparez-vous la réanimation ?", a: "Oui." },
      { q: "Préparez-vous plus de 45 spécialités ?",
        a: "Oui. Major ECN accompagne les candidats dans plus de 45 spécialités médicales, chirurgicales, odontologiques, pharmaceutiques et de maïeutique." },
    ],
  },
];

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
  const [open, setOpen] = useState<string>('evc');

  return (
    <section className="relative pt-2 pb-14 sm:pb-16 lg:pb-20" style={{ fontFamily: FONT, background: SOFT_BG }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.55fr_1fr] lg:gap-8">

          {/* ============ LEFT — Accordéon ============ */}
          <Reveal>
            <div className="overflow-hidden rounded-3xl border bg-white shadow-[0_30px_80px_-30px_rgba(15,31,77,0.20)]" style={{ borderColor: BORDER }}>
              <div className="border-b px-5 py-4 sm:px-6 sm:py-5" style={{ borderColor: BORDER }}>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em]" style={{ color: RED }}>Sommaire complet</p>
                <p className="text-lg font-extrabold sm:text-xl" style={{ color: NAVY }}>
                  Toutes les réponses à vos questions
                </p>
              </div>

              <ul className="divide-y" style={{ borderColor: BORDER }}>
                {CATEGORIES.map((cat, idx) => {
                  const isOpen = open === cat.id;
                  return (
                    <li key={cat.id} className="group">
                      <button
                        type="button"
                        onClick={() => setOpen((cur) => (cur === cat.id ? '' : cat.id))}
                        aria-expanded={isOpen}
                        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-[#FFF8F9] sm:px-6"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[12.5px] font-black tabular-nums"
                          style={{ background: isOpen ? RED : '#FCEAEC', color: isOpen ? 'white' : RED }}>
                          {idx + 1}
                        </span>
                        <span className="flex-1 text-[14px] font-extrabold sm:text-[15px]"
                          style={{ color: isOpen ? RED : NAVY }}>
                          {cat.title}
                        </span>
                        <ChevronDown className={'h-4 w-4 shrink-0 transition-transform ' + (isOpen ? 'rotate-180' : '')}
                          style={{ color: isOpen ? RED : INK_MUTED }} />
                      </button>

                      {/* Panel ouvert */}
                      {isOpen && (
                        <div className="border-t bg-[#FFFCFD] px-5 pb-6 pt-2 sm:px-6" style={{ borderColor: BORDER }}>
                          <ul className="space-y-4">
                            {cat.qas.map((qa, i) => (
                              <li key={i} className="rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: BORDER }}>
                                <p className="flex items-start gap-2 text-[13.5px] font-extrabold leading-snug" style={{ color: NAVY }}>
                                  <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: RED }} />
                                  <span>{qa.q}</span>
                                </p>
                                <p className="mt-2 pl-6 text-[13px] leading-relaxed" style={{ color: INK_SOFT }}>
                                  {qa.a}
                                </p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
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

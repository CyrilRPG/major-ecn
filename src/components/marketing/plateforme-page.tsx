'use client';
/* eslint-disable @next/next/no-img-element */
/**
 * Page Plateforme — refonte pixel-perfect (maquette designer).
 * 8 sections : mock dashboard, comment j'utilise, comprendre attentes,
 * révision transversale, cours enregistrés, équipe, outils, CTA.
 */
import {
  ArrowRight, Award, Bell, BookOpen, Brain, Calendar, CalendarCheck, CalendarDays,
  Check, CheckCircle2, ChevronRight, ClipboardCheck, ClipboardList, Clock,
  Compass, FileText, Folder, GraduationCap, Heart, LayoutDashboard, Layers3,
  Library, LineChart, ListChecks, MapPin, MessageCircle, Play, Quote, Radio,
  Rocket, Settings, Sparkles, Stethoscope, Target, TrendingUp, Trophy,
  UserCheck, Users, Video,
} from 'lucide-react';
import { Reveal } from './reveal';

const RED = '#C0112E';
const RED_DEEP = '#8B0E22';
const NAVY = '#0F1F4D';
const NAVY_DEEP = '#0A1838';
const INK = '#0F172A';
const INK_SOFT = '#52607A';
const INK_MUTED = '#7A8499';
const BORDER = '#E5E9F0';
const SOFT_BG = '#F7F8FB';
const FONT = "'Plus Jakarta Sans', sans-serif";

/* Dégradés titres — palette Major ECN (rouge bordeaux + accents) */
const GRAD_BURGUNDY = 'linear-gradient(90deg, #6B1A2A 0%, #C0112E 55%, #E8742C 100%)';
const GRAD_RED_BLUE = 'linear-gradient(90deg, #C0112E 0%, #7C3AED 50%, #2563EB 100%)';
const GRAD_NAVY_RED = 'linear-gradient(90deg, #0F1F4D 0%, #6B1A2A 50%, #C0112E 100%)';
const GRAD_RED_PURPLE = 'linear-gradient(90deg, #C0112E 0%, #BE185D 50%, #7C3AED 100%)';
const gradientText = (grad: string) => ({
  backgroundImage: grad,
  WebkitBackgroundClip: 'text' as const,
  backgroundClip: 'text' as const,
  WebkitTextFillColor: 'transparent' as const,
  color: 'transparent',
});


/* ============ HERO — capture réelle de la plateforme ============ */
function PlateformeHero() {
  return (
    <section className="bg-white pt-10 pb-10 sm:pt-14 sm:pb-12 lg:pt-16 lg:pb-16" style={{ fontFamily: FONT }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em]"
            style={{ background: '#FCEAEC', borderColor: 'rgba(192,17,46,0.22)', color: RED }}>
            <Sparkles className="h-3.5 w-3.5" /> Plateforme pédagogique
          </span>
          <h1 className="mx-auto mt-5 max-w-4xl text-3xl font-black leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl" style={{ color: NAVY }}>
            La plateforme conçue pour <span style={{ color: RED }}>réussir les EVC (PAE)</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed sm:text-[17px]" style={{ color: INK_SOFT }}>
            Tableau de bord, QCM corrigés, cas cliniques, révision transversale intelligente,
            cours enregistrés et accompagnement personnalisé — tout en un seul endroit.
          </p>
        </div>

        {/* Capture réelle de l'accueil étudiant */}
        <div className="relative mx-auto mt-10 max-w-6xl">
          <div className="overflow-hidden rounded-2xl border bg-white shadow-[0_40px_120px_-30px_rgba(15,31,77,0.35)]"
            style={{ borderColor: BORDER }}>
            <img
              src="/accueil.png"
              alt="Aperçu de la plateforme Major ECN — tableau de bord étudiant"
              className="block h-auto w-full"
              loading="eager"
            />
          </div>
          {/* Pastilles flottantes — décor */}
          <span aria-hidden className="absolute -left-3 top-6 hidden items-center gap-2 rounded-full border bg-white px-3 py-2 text-xs font-bold shadow-2xl sm:inline-flex"
            style={{ borderColor: BORDER, color: RED }}>
            <Stethoscope className="h-4 w-4" /> 45 spécialités
          </span>
          <span aria-hidden className="absolute -right-3 bottom-6 hidden items-center gap-2 rounded-full px-3 py-2 text-xs font-bold text-white shadow-2xl sm:inline-flex"
            style={{ background: `linear-gradient(90deg, ${RED_DEEP}, ${RED})` }}>
            <CheckCircle2 className="h-4 w-4" /> Méthodologie EVC
          </span>
        </div>
      </div>
    </section>
  );
}

/* ============ COMMENT J'UTILISE ============ */
function HowDailySection() {
  const steps = [
    { Icon: LayoutDashboard, bg: '#DBEAFE', fg: '#2563EB', t: 'Je consulte mon tableau de bord',        d: "Vue d'ensemble claire de ma préparation." },
    { Icon: Target,          bg: '#FCEAEC', fg: RED,       t: 'Je vois mes priorités de révision',      d: 'La plateforme identifie ce que je dois travailler en priorité.' },
    { Icon: ClipboardCheck,  bg: '#EDE9FE', fg: '#6D28D9', t: 'Je travaille les QCM et cas cliniques',  d: "Des milliers de QCM et cas cliniques pour m'entraîner efficacement." },
    { Icon: FileText,        bg: '#FFEDD5', fg: '#EA580C', t: 'Je corrige mes erreurs et comprends',    d: 'Des corrections détaillées pour apprendre de chaque erreur.' },
    { Icon: Layers3,         bg: '#CCFBF1', fg: '#0F766E', t: 'Je consolide avec les flashcards',       d: 'Mémorisation active et intelligente pour des révisions durables.' },
    { Icon: TrendingUp,      bg: '#DCFCE7', fg: '#16A34A', t: 'Je suis ma progression en temps réel',   d: 'Des statistiques précises pour rester motivé et progresser.' },
  ];
  return (
    <section className="bg-white py-12 sm:py-16" style={{ fontFamily: FONT }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-black tracking-tight sm:text-[1.7rem]" style={gradientText(GRAD_RED_BLUE)}>
          Comment j&rsquo;utilise Major EVC au quotidien ?
        </h2>
        <div className="relative mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 xl:gap-2">
          {steps.map((s, i) => (
            <div key={s.t} className="relative text-center">
              <div className="flex items-center justify-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-black"
                  style={{ background: '#FCEAEC', color: RED }}>
                  {i + 1}
                </span>
                <p className="text-left text-[12px] font-extrabold leading-tight" style={{ color: NAVY }}>{s.t}</p>
              </div>
              <div className="mx-auto mt-3 flex h-24 w-full max-w-[180px] items-center justify-center rounded-xl border" style={{ background: s.bg, borderColor: BORDER }}>
                <s.Icon className="h-10 w-10" style={{ color: s.fg }} />
              </div>
              <p className="mt-2 text-[11.5px] leading-relaxed" style={{ color: INK_SOFT }}>{s.d}</p>
              {i < steps.length - 1 && (
                <span className="absolute right-[-8px] top-[18px] hidden xl:inline-flex items-center justify-center" style={{ color: INK_MUTED }}>
                  <ChevronRight className="h-4 w-4" />
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ COMPRENDRE LES ATTENTES — exemple cas ============ */
function CorrectorExampleSection() {
  const responses = [
    { L: 'ECG',                  ok: false },
    { L: 'Échocardiographie',    ok: true },
    { L: 'Scanner thoracique',   ok: false },
    { L: "Épreuve d'effort",     ok: false },
    { L: 'Radiographie thoracique', ok: false },
  ];
  const corrige = ['Évaluation de la fonction systolique', 'Appréciation des valvulopathies', 'Mesure des pressions pulmonaires'];
  const oublies = ["Préciser l'utilité de l'échocardiographie"];
  const pieges = ["Prescrire l'embolie en urgence"];
  return (
    <section className="bg-white py-10 sm:py-12" style={{ fontFamily: FONT }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border bg-white p-5 sm:p-6 grid gap-6 lg:grid-cols-2" style={{ borderColor: BORDER }}>
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: '#FCEAEC', color: RED }}>
                <Stethoscope className="h-5 w-5" />
              </span>
              <h2 className="text-xl font-black tracking-tight" style={gradientText(GRAD_BURGUNDY)}>
                Comprendre ce qu&rsquo;attend le correcteur des EVC
              </h2>
            </div>
            <p className="mt-3 text-[13px]" style={{ color: INK_SOFT }}>
              Chaque QCM et cas clinique est corrigé selon les attentes officielles des EVC.
            </p>

            <div className="mt-5 rounded-xl border p-4" style={{ borderColor: BORDER, background: SOFT_BG }}>
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: RED }}>Cardiologie – Item 234</p>
              <p className="mt-1 text-[13px] font-bold" style={{ color: NAVY }}>Question</p>
              <p className="text-[12.5px]" style={{ color: INK }}>
                Un homme de 65 ans consulte pour dyspnée d&rsquo;effort et œdèmes des membres inférieurs.
                Quel est l&rsquo;examen complémentaire de première intention ?
              </p>
              <p className="mt-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: INK_MUTED }}>Réponse du candidat</p>
              <ul className="mt-1.5 space-y-1">
                {responses.map((r) => (
                  <li key={r.L} className="flex items-center justify-between rounded-md bg-white px-2.5 py-1.5 text-[12px]" style={{ border: `1px solid ${BORDER}`, color: INK }}>
                    <span className="flex items-center gap-2">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-white" style={{ background: r.ok ? '#16A34A' : RED }}>
                        {r.ok ? '✓' : '✕'}
                      </span>
                      {r.L}
                    </span>
                    <span className={r.ok ? 'text-[#16A34A]' : ''} style={{ color: r.ok ? '#16A34A' : RED }}>
                      {r.ok ? <CheckCircle2 className="h-4 w-4" /> : '✕'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <button className="mt-3 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-bold" style={{ borderColor: RED, color: RED }}>
              Masquer la correction <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          {/* Right — Correction détaillée */}
          <div className="rounded-xl border p-4" style={{ borderColor: BORDER, background: SOFT_BG }}>
            <p className="text-sm font-extrabold" style={{ color: NAVY }}>Correction détaillée</p>
            <p className="mt-2 text-[11px] font-bold uppercase tracking-wider" style={{ color: INK_MUTED }}>Réponse attendue : B</p>
            <p className="text-[13px] font-bold" style={{ color: NAVY }}>Échocardiographie</p>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: INK_MUTED }}>Mots-clés attendus</p>
            <ul className="mt-1 space-y-1">
              {corrige.map((c) => (
                <li key={c} className="flex items-start gap-2 text-[12.5px]" style={{ color: INK }}>
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: '#16A34A' }} />{c}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: INK_MUTED }}>Éléments souvent oubliés</p>
            <ul className="mt-1 space-y-1">
              {oublies.map((c) => (
                <li key={c} className="flex items-start gap-2 text-[12.5px]" style={{ color: INK }}>
                  <span className="mt-0.5 text-[10px]" style={{ color: '#F59E0B' }}>!</span>{c}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: INK_MUTED }}>Pièges fréquents</p>
            <ul className="mt-1 space-y-1">
              {pieges.map((c) => (
                <li key={c} className="flex items-start gap-2 text-[12.5px]" style={{ color: INK }}>
                  <span className="mt-0.5 text-[10px]" style={{ color: RED }}>⚠</span>{c}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: INK_MUTED }}>Commentaire du correcteur</p>
            <p className="mt-1 text-[12px] leading-relaxed" style={{ color: INK_SOFT }}>
              L&rsquo;échocardiographie est l&rsquo;examen clé pour rechercher une insuffisance cardiaque
              et en déterminer la cause.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ RÉVISION TRANSVERSALE INTELLIGENTE ============ */
function TransversalRevisionSection() {
  const bullets = [
    'Détecte automatiquement les liens entre les spécialités',
    'Priorise les révisions selon vos faiblesses',
    'Calcule le risque d\'oubli par notion',
    'Optimise votre temps de révision',
  ];
  const orbits = [
    { x: 50, y: 12, l: 'Médecine d\'urgence', c: '#2563EB' },
    { x: 88, y: 30, l: 'Pneumologie',         c: '#16A34A' },
    { x: 88, y: 62, l: 'Néphrologie',         c: '#2563EB' },
    { x: 70, y: 85, l: 'Neurologie',          c: '#7C3AED' },
    { x: 35, y: 85, l: 'Pédiatrie',           c: '#0F766E' },
    { x: 14, y: 60, l: 'Infectiologie',       c: '#DB2777' },
    { x: 14, y: 30, l: 'Médecine d\'urgence', c: '#EA580C' },
    { x: 50, y: 50, l: 'EVC\n(PAE)',          center: true },
  ];
  return (
    <section className="bg-white py-10 sm:py-12" style={{ fontFamily: FONT }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border bg-white p-5 sm:p-7" style={{ borderColor: BORDER }}>
          <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: '#DCFCE7', color: '#16A34A' }}>
                  <Compass className="h-5 w-5" />
                </span>
                <h2 className="text-xl font-black tracking-tight" style={gradientText(GRAD_RED_PURPLE)}>
                  Révision transversale intelligente
                </h2>
              </div>
              <p className="mt-3 text-[13px]" style={{ color: INK_SOFT }}>
                Notre système identifie automatiquement les liens entre plus de 45 spécialités
                pour optimiser votre préparation.
              </p>
              <ul className="mt-5 space-y-2.5">
                {bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-[13px]" style={{ color: INK }}>
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full" style={{ background: '#DCFCE7', color: '#16A34A' }}>
                      <Check className="h-2.5 w-2.5" strokeWidth={4} />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            {/* Mind-map mock */}
            <div className="relative h-[300px] rounded-2xl bg-[#F8FAFC]">
              <svg className="absolute inset-0 h-full w-full">
                {orbits.filter((o) => !o.center).map((o, i) => (
                  <line key={i} x1="50%" y1="50%" x2={`${o.x}%`} y2={`${o.y}%`} stroke={BORDER} strokeWidth="1" strokeDasharray="2 3" />
                ))}
              </svg>
              {orbits.map((o, i) => (
                <span key={i}
                  className={'absolute -translate-x-1/2 -translate-y-1/2 whitespace-pre text-center font-bold ' + (o.center ? 'rounded-full text-white text-[13px] px-4 py-3' : 'text-[10px] rounded-full bg-white px-2 py-1')}
                  style={o.center
                    ? { left: `${o.x}%`, top: `${o.y}%`, background: RED }
                    : { left: `${o.x}%`, top: `${o.y}%`, color: o.c, border: `1px solid ${o.c}40` }}>
                  {o.l}
                </span>
              ))}
              <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-[10px] font-bold" style={{ color: NAVY, border: `1px solid ${BORDER}` }}>
                + 35 autres spécialités
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ COURS ENREGISTRÉS ============ */
function RecordedCoursesSection() {
  const items = [
    'Cours enregistrés accessibles 24h/24',
    'Sessions en direct avec nos enseignants',
    'Replays disponibles',
    'Supports de cours téléchargeables',
  ];
  const schedule = [
    { t: 'Cardiologie',     d: 'Sam. 24/05 – 14h00' },
    { t: 'Néphrologie',     d: 'Dim. 25/05 – 10h00' },
    { t: 'Méthodologie EVC',d: 'Mar. 27/05 – 18h00' },
  ];
  return (
    <section className="bg-white py-10 sm:py-12" style={{ fontFamily: FONT }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border bg-white p-5 sm:p-7" style={{ borderColor: BORDER }}>
          <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: '#EDE9FE', color: '#6D28D9' }}>
                  <Play className="h-5 w-5" />
                </span>
                <h2 className="text-xl font-black tracking-tight" style={gradientText(GRAD_NAVY_RED)}>
                  Cours enregistrés et/ou en direct<span style={{ color: RED }}>*</span>
                </h2>
              </div>
              <p className="mt-2 text-[13px]" style={{ color: INK_SOFT }}>
                Des cours clairs et structurés pour comprendre, approfondir et gagner en efficacité.
              </p>
              {/* Video mock */}
              <div className="mt-4 relative aspect-video w-full overflow-hidden rounded-2xl" style={{ background: `linear-gradient(135deg, ${NAVY_DEEP}, ${NAVY})` }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95">
                    <Play className="h-6 w-6" style={{ color: RED }} fill="currentColor" />
                  </span>
                </div>
                <div className="absolute left-3 top-3 rounded-md bg-black/40 px-2 py-1 text-[9px] font-bold text-white">
                  Cardiologie · Insuffisance cardiaque
                </div>
                <div className="absolute bottom-2 left-3 right-3 flex items-center gap-2 text-white text-[10px]">
                  <span>36:17 / 1:06:40</span>
                  <span className="h-1 flex-1 rounded-full bg-white/30">
                    <span className="block h-full w-[55%] rounded-full bg-white" />
                  </span>
                </div>
              </div>
              <ul className="mt-4 space-y-2">
                {items.map((i) => (
                  <li key={i} className="flex items-center gap-2 text-[13px]" style={{ color: INK }}>
                    <CheckCircle2 className="h-4 w-4" style={{ color: '#16A34A' }} /> {i}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[10px] italic" style={{ color: INK_MUTED }}>* Disponibles selon la formule choisie.</p>
            </div>
            {/* Right — planning */}
            <div className="rounded-2xl border p-4" style={{ borderColor: BORDER, background: SOFT_BG }}>
              <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: NAVY }}>Prochaines sessions live</p>
              <ul className="mt-3 space-y-3">
                {schedule.map((s) => (
                  <li key={s.t} className="flex items-center gap-3 rounded-xl bg-white p-3" style={{ border: `1px solid ${BORDER}` }}>
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: '#EDE9FE', color: '#6D28D9' }}>
                      <CalendarDays className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-extrabold" style={{ color: NAVY }}>{s.t}</p>
                      <p className="text-[12px]" style={{ color: INK_SOFT }}>{s.d}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <button className="mt-4 w-full rounded-xl border-2 px-3 py-2 text-[13px] font-bold" style={{ borderColor: '#6D28D9', color: '#6D28D9' }}>
                Voir tout le planning
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ ÉQUIPE ============ */
function TeamSection() {
  const pillars = [
    { Icon: GraduationCap, bg: '#FCEAEC', fg: RED,         t: 'Enseignants spécialistes' },
    { Icon: FileText,      bg: '#FFEDD5', fg: '#EA580C',   t: 'Corrections détaillées' },
    { Icon: MessageCircle, bg: '#EDE9FE', fg: '#6D28D9',   t: 'Réponses aux questions' },
    { Icon: MapPin,        bg: '#DBEAFE', fg: '#2563EB',   t: 'Méthodologie EVC' },
    { Icon: TrendingUp,    bg: '#DCFCE7', fg: '#16A34A',   t: 'Suivi personnalisé de votre progression' },
  ];
  return (
    <section className="bg-white py-10 sm:py-12" style={{ fontFamily: FONT }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-6 lg:grid-cols-[0.9fr_1.4fr_0.7fr]">
        <div>
          <h2 className="text-2xl font-black tracking-tight" style={gradientText(GRAD_BURGUNDY)}>
            Une équipe à vos côtés
          </h2>
          <p className="mt-3 text-[13.5px]" style={{ color: INK_SOFT }}>
            Vous n&rsquo;êtes pas seul dans votre préparation. Derrière la plateforme,
            une équipe d&rsquo;enseignants et de correcteurs spécialistes des EVC
            vous accompagne à chaque étape.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {pillars.map((p) => (
            <div key={p.t} className="rounded-2xl border bg-white p-3 text-center" style={{ borderColor: BORDER }}>
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: p.bg, color: p.fg }}>
                <p.Icon className="h-5 w-5" />
              </span>
              <p className="mt-2 text-[11.5px] font-extrabold leading-tight" style={{ color: NAVY }}>{p.t}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-3">
          <div className="flex -space-x-3">
            {['DG', 'AB', 'FH', 'SM'].map((i, idx) => (
              <span key={idx} className="flex h-12 w-12 items-center justify-center rounded-full text-xs font-black text-white ring-2 ring-white"
                style={{ background: `linear-gradient(135deg, ${RED_DEEP}, ${RED})` }}>
                {i}
              </span>
            ))}
          </div>
          <div>
            <p className="text-lg font-black" style={{ color: NAVY }}>+20</p>
            <p className="text-[10.5px] font-semibold" style={{ color: INK_SOFT }}>Experts mobilisés<br />pour votre réussite</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ OUTILS DE PRÉPARATION ============ */
function PlatformToolsSection() {
  const tools = [
    { Icon: ClipboardList, bg: '#FCEAEC', fg: RED,         t: 'QCM corrigés',          d: 'Des milliers de QCM classés par thèmes et sujets récents.' },
    { Icon: Users,         bg: '#FFEDD5', fg: '#EA580C',   t: 'Cas cliniques corrigés',d: 'Des cas cliniques complets et réalistes, corrigés et commentés.' },
    { Icon: Layers3,       bg: '#FEF3C7', fg: '#A16207',   t: 'Flashcards',            d: 'Des cartes de révision intelligentes pour mémoriser efficacement.' },
    { Icon: Trophy,        bg: '#EDE9FE', fg: '#6D28D9',   t: 'Concours blancs',       d: 'Entraînez-vous dans les conditions réelles des épreuves.' },
    { Icon: TrendingUp,    bg: '#DCFCE7', fg: '#16A34A',   t: 'Statistiques & progression', d: 'Suivez vos performances et identifiez vos axes d\'amélioration.' },
    { Icon: Bell,          bg: '#DBEAFE', fg: '#2563EB',   t: 'Actualités CNG',        d: 'Toutes les informations officielles mises à jour en temps réel.' },
    { Icon: FileText,      bg: '#CCFBF1', fg: '#0F766E',   t: 'Ressources & guides',   d: 'Guides, fiches mémo et ressources utiles à votre préparation.' },
    { Icon: BookOpen,      bg: '#FCE7F3', fg: '#DB2777',   t: 'Référentiel EVC',       d: 'Le référentiel officiel structuré pour faciliter vos révisions.' },
  ];
  return (
    <section className="bg-white py-12 sm:py-16" style={{ fontFamily: FONT }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-black tracking-tight sm:text-[1.7rem]" style={gradientText(GRAD_RED_BLUE)}>
          Tous les outils de préparation aux EVC (PAE) pour les médecins étrangers et PADHUE
        </h2>
        <p className="mt-3 text-[14px] max-w-4xl" style={{ color: INK_SOFT }}>
          Tout ce dont vous avez besoin pour réussir les Épreuves de Vérification des Connaissances (EVC)
          dans le cadre de la Procédure d&rsquo;Autorisation d&rsquo;Exercice (PAE).
        </p>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {tools.map((t) => (
            <Reveal key={t.t}>
              <div className="flex h-full flex-col rounded-2xl border bg-white p-4" style={{ borderColor: BORDER }}>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: t.bg, color: t.fg }}>
                  <t.Icon className="h-5 w-5" />
                </span>
                <p className="mt-3 text-[14px] font-extrabold" style={{ color: NAVY }}>{t.t}</p>
                <p className="mt-1.5 text-[12px] leading-relaxed" style={{ color: INK_SOFT }}>{t.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ CTA banner final ============ */
function PlateformeCta() {
  return (
    <section className="px-4 sm:px-6 lg:px-8" style={{ fontFamily: FONT }}>
      <div className="mx-auto max-w-7xl my-10 rounded-3xl p-6 sm:p-8 text-white"
        style={{ background: `linear-gradient(120deg, ${RED_DEEP} 0%, ${RED} 100%)` }}>
        <div className="grid items-center gap-5 lg:grid-cols-[auto_1fr_auto]">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
            <Rocket className="h-6 w-6 text-white" />
          </span>
          <div>
            <h2 className="text-xl font-black sm:text-2xl">
              Découvrez la plateforme utilisée par les candidats admis aux EVC (PAE)
            </h2>
            <p className="mt-2 text-[14px] text-white/90">
              Accédez à l&rsquo;espace membre et profitez de tous les outils pour réussir
              les Épreuves de Vérification des Connaissances.
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-[12.5px] font-bold text-white/90">
              <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Accès immédiat</span>
              <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Sans engagement</span>
              <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Annulation en 1 clic</span>
            </div>
          </div>
          <a href="/inscription" className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-extrabold transition-transform hover:scale-[1.02]" style={{ color: RED }}>
            Accéder à l&rsquo;espace membre <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ============ PAGE ============ */
export function PlateformePageContent() {
  return (
    <>
      <PlateformeHero />
      <HowDailySection />
      <CorrectorExampleSection />
      <TransversalRevisionSection />
      <RecordedCoursesSection />
      <TeamSection />
      <PlatformToolsSection />
      <PlateformeCta />
    </>
  );
}

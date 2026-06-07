'use client';
/* eslint-disable @next/next/no-img-element */
/**
 * Page Spécialités — catalogue pixel-perfect (maquette designer).
 * 7 sections : hero + bandeau "toutes proposées", strip métriques,
 * filtres + recherche, grille spécialités (45+), pourquoi Major ECN,
 * témoignages multi-spécialités, CTA final.
 */

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  Activity, Apple, ArrowRight, Award, Baby, Bandage, Beaker, Bone, Brain, BriefcaseMedical,
  Check, CheckCircle2, ChevronRight, Compass, Dna, Droplet, Ear, Eye,
  FlaskConical, Footprints, Gauge, GraduationCap, Heart, HeartPulse, Hospital, Layers3,
  Microscope, Pill, Pipette, Quote, Radio, Scissors, ScanSearch, Search, Shield, Smile,
  Sparkles, Stethoscope, Syringe, Target, TestTube, TrendingUp, Trophy,
  UserCheck, Users, Wind, Zap,
  type LucideIcon,
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
   Données — 45+ spécialités, classées par famille
   ============================================================ */
type Family =
  | 'Médecine'
  | 'Chirurgie'
  | 'Pédiatrie'
  | 'Imagerie'
  | 'Biologie'
  | 'Pharmacie'
  | 'Santé publique';

type Speciality = {
  slug: string;
  name: string;
  family: Family;
  Icon: LucideIcon;
  accent: string;       // couleur de l'icône
  bullets: string[];    // 4 puces "Programme couvert"
};

const ACCENTS = {
  red: '#C0112E', rose: '#BE185D', orange: '#E8742C', amber: '#D97706',
  green: '#16A34A', emerald: '#0F8A6A', teal: '#0E7C7B', cyan: '#0891B2',
  blue: '#2563EB', indigo: '#4F46E5', violet: '#7C3AED', fuchsia: '#A21CAF',
  slate: '#475569', navy: '#0F1F4D',
};

const SPECIALITIES: Speciality[] = [
  // Médecine
  { slug: 'medecine-generale', name: 'Médecine Générale', family: 'Médecine', Icon: Stethoscope, accent: ACCENTS.red,
    bullets: ['Référentiels CMG & HAS', 'Cas cliniques en consultation', 'QCM EVC ciblés', 'Prévention & soins primaires'] },
  { slug: 'cardiologie', name: 'Cardiologie', family: 'Médecine', Icon: HeartPulse, accent: ACCENTS.red,
    bullets: ['ECG en autonomie', 'Insuffisance cardiaque', 'SCA & urgences', 'Hypertension & arythmies'] },
  { slug: 'pneumologie', name: 'Pneumologie', family: 'Médecine', Icon: Wind, accent: ACCENTS.cyan,
    bullets: ['Asthme & BPCO', 'Cancer bronchique', 'Pneumopathies', 'EFR & imagerie thoracique'] },
  { slug: 'gastro-enterologie', name: 'Gastro-entérologie', family: 'Médecine', Icon: Apple, accent: ACCENTS.orange,
    bullets: ['MICI & hépatites', 'Cancers digestifs', 'Endoscopie raisonnée', 'Urgences abdominales'] },
  { slug: 'endocrinologie', name: 'Endocrinologie', family: 'Médecine', Icon: Gauge, accent: ACCENTS.amber,
    bullets: ['Diabète T1 / T2', 'Thyroïde & surrénales', 'Obésité & nutrition', 'Hormonologie clinique'] },
  { slug: 'nephrologie', name: 'Néphrologie', family: 'Médecine', Icon: Droplet, accent: ACCENTS.blue,
    bullets: ['IRA & IRC', 'Dialyse & greffe', 'HTA secondaire', 'Désordres hydro-électrolytiques'] },
  { slug: 'neurologie', name: 'Neurologie', family: 'Médecine', Icon: Brain, accent: ACCENTS.violet,
    bullets: ['AVC & épilepsies', 'Sclérose en plaques', 'Démences', 'Pathologies du mouvement'] },
  { slug: 'hematologie', name: 'Hématologie', family: 'Médecine', Icon: TestTube, accent: ACCENTS.fuchsia,
    bullets: ['Anémies & cytopénies', 'Hémopathies malignes', 'Hémostase', 'Transfusion raisonnée'] },
  { slug: 'rhumatologie', name: 'Rhumatologie', family: 'Médecine', Icon: Bone, accent: ACCENTS.slate,
    bullets: ['Arthrites & arthroses', 'PR & spondyloarthrites', 'Ostéoporose', 'Lombalgies & sciatiques'] },
  { slug: 'dermatologie', name: 'Dermatologie', family: 'Médecine', Icon: Bandage, accent: ACCENTS.rose,
    bullets: ['Cancers cutanés', 'Eczéma & psoriasis', 'IST', 'Urgences dermatologiques'] },
  { slug: 'infectiologie', name: 'Infectiologie', family: 'Médecine', Icon: Beaker, accent: ACCENTS.emerald,
    bullets: ['Antibiothérapie raisonnée', 'VIH & hépatites', 'Tropicales & émergentes', 'Hygiène & BMR'] },
  { slug: 'oncologie', name: 'Oncologie', family: 'Médecine', Icon: Target, accent: ACCENTS.indigo,
    bullets: ['Cancers fréquents', 'Chimio & immunothérapie', 'Soins de support', 'RCP & parcours patient'] },
  { slug: 'medecine-interne', name: 'Médecine interne', family: 'Médecine', Icon: Compass, accent: ACCENTS.navy,
    bullets: ['Maladies systémiques', 'AEG & démarche', 'Auto-immunité', 'Fièvre prolongée'] },
  { slug: 'allergologie', name: 'Allergologie', family: 'Médecine', Icon: Activity, accent: ACCENTS.amber,
    bullets: ['Rhinite & asthme', 'Allergies alimentaires', 'Anaphylaxie', 'Tests & désensibilisation'] },
  { slug: 'medecine-vasculaire', name: 'Médecine vasculaire', family: 'Médecine', Icon: Activity, accent: ACCENTS.red,
    bullets: ['MTEV & embolies', 'AOMI', 'Lymphoedème', 'Echo-doppler raisonné'] },
  { slug: 'urgences', name: 'Médecine d’urgence', family: 'Médecine', Icon: Zap, accent: ACCENTS.red,
    bullets: ['Triage & déchocage', 'Détresse vitale', 'Toxicologie', 'Polytraumatisé'] },
  { slug: 'reanimation', name: 'Médecine intensive — Réanimation', family: 'Médecine', Icon: Activity, accent: ACCENTS.red,
    bullets: ['Sepsis & SDRA', 'Ventilation', 'États de choc', 'Défaillances multi-organes'] },
  { slug: 'geriatrie', name: 'Gériatrie', family: 'Médecine', Icon: Users, accent: ACCENTS.orange,
    bullets: ['Évaluation gériatrique', 'Chutes & fragilité', 'Démences', 'Polymédication'] },
  { slug: 'mpr', name: 'Médecine physique & réadaptation', family: 'Médecine', Icon: Footprints, accent: ACCENTS.teal,
    bullets: ['AVC & lésions médullaires', 'Rééducation locomotrice', 'Handicap & autonomie', 'Appareillage'] },
  { slug: 'medecine-du-travail', name: 'Médecine du travail', family: 'Médecine', Icon: BriefcaseMedical, accent: ACCENTS.slate,
    bullets: ['Aptitude & visites', 'Risques professionnels', 'TMS & RPS', 'Maladies pro'] },
  { slug: 'medecine-legale', name: 'Médecine légale', family: 'Médecine', Icon: Shield, accent: ACCENTS.slate,
    bullets: ['Coups & blessures', 'ITT & certificats', 'Décès & autopsies', 'Violences sexuelles'] },
  { slug: 'psychiatrie', name: 'Psychiatrie', family: 'Médecine', Icon: Brain, accent: ACCENTS.violet,
    bullets: ['Troubles de l’humeur', 'Schizophrénies', 'Conduites addictives', 'Urgences psy'] },

  // Pédiatrie
  { slug: 'pediatrie', name: 'Pédiatrie', family: 'Pédiatrie', Icon: Baby, accent: ACCENTS.rose,
    bullets: ['Néonatologie', 'Vaccinations', 'Urgences pédiatriques', 'Suivi & dépistages'] },
  { slug: 'chirurgie-pediatrique', name: 'Chirurgie pédiatrique', family: 'Pédiatrie', Icon: Scissors, accent: ACCENTS.rose,
    bullets: ['Urgences viscérales', 'Malformations', 'Orthopédie pédiatrique', 'Cancérologie'] },

  // Chirurgie
  { slug: 'chirurgie-generale-viscerale', name: 'Chirurgie générale & viscérale', family: 'Chirurgie', Icon: Scissors, accent: ACCENTS.red,
    bullets: ['Urgences digestives', 'Cancers digestifs', 'Pariétale & proctologie', 'Coelioscopie'] },
  { slug: 'chirurgie-orthopedique', name: 'Chirurgie orthopédique', family: 'Chirurgie', Icon: Bone, accent: ACCENTS.amber,
    bullets: ['Fractures & luxations', 'Prothèses', 'Arthroscopies', 'Traumato sportive'] },
  { slug: 'chirurgie-cardio-thoracique', name: 'Chirurgie cardio-thoracique', family: 'Chirurgie', Icon: HeartPulse, accent: ACCENTS.red,
    bullets: ['Coronaires & valvulaires', 'Aorte', 'Chirurgie pulmonaire', 'Soins post-op'] },
  { slug: 'chirurgie-vasculaire', name: 'Chirurgie vasculaire', family: 'Chirurgie', Icon: Activity, accent: ACCENTS.red,
    bullets: ['Anévrismes', 'AOMI', 'Carotides', 'Endovasculaire'] },
  { slug: 'neurochirurgie', name: 'Neurochirurgie', family: 'Chirurgie', Icon: Brain, accent: ACCENTS.violet,
    bullets: ['Traumatismes crâniens', 'Tumeurs cérébrales', 'Rachis', 'Hydrocéphalie'] },
  { slug: 'chirurgie-plastique', name: 'Chirurgie plastique', family: 'Chirurgie', Icon: Smile, accent: ACCENTS.fuchsia,
    bullets: ['Brûlés', 'Reconstruction', 'Microchirurgie', 'Esthétique raisonnée'] },
  { slug: 'chirurgie-maxillo-faciale', name: 'Chirurgie maxillo-faciale', family: 'Chirurgie', Icon: Smile, accent: ACCENTS.indigo,
    bullets: ['Fractures faciales', 'Pathologie ATM', 'Tumeurs ORL', 'Implantologie'] },
  { slug: 'urologie', name: 'Urologie', family: 'Chirurgie', Icon: Pipette, accent: ACCENTS.blue,
    bullets: ['Lithiases & infections', 'Cancers urologiques', 'Troubles mictionnels', 'Andrologie'] },
  { slug: 'gyneco-obstetrique', name: 'Gynécologie-obstétrique', family: 'Chirurgie', Icon: Heart, accent: ACCENTS.rose,
    bullets: ['Suivi de grossesse', 'Urgences obstétricales', 'Cancers gynécologiques', 'Contraception'] },
  { slug: 'orl', name: 'ORL', family: 'Chirurgie', Icon: Ear, accent: ACCENTS.cyan,
    bullets: ['Surdités & vertiges', 'Cancers tête & cou', 'Pathologie sinusienne', 'Voix & déglutition'] },
  { slug: 'ophtalmologie', name: 'Ophtalmologie', family: 'Chirurgie', Icon: Eye, accent: ACCENTS.blue,
    bullets: ['DMLA & glaucome', 'Cataracte', 'Rétinopathie diabétique', 'Urgences oculaires'] },
  { slug: 'stomatologie', name: 'Stomatologie', family: 'Chirurgie', Icon: Smile, accent: ACCENTS.amber,
    bullets: ['Pathologies bucco-dentaires', 'Tumeurs', 'Foyers infectieux', 'Implantologie'] },

  // Imagerie
  { slug: 'radiologie', name: 'Radiologie', family: 'Imagerie', Icon: ScanSearch, accent: ACCENTS.indigo,
    bullets: ['Radio standard & TDM', 'IRM ciblée', 'Echographie', 'Radiologie interventionnelle'] },
  { slug: 'medecine-nucleaire', name: 'Médecine nucléaire', family: 'Imagerie', Icon: Radio, accent: ACCENTS.violet,
    bullets: ['Scintigraphies', 'TEP-TDM', 'Radiothérapie interne', 'Dosimétrie clinique'] },

  // Biologie
  { slug: 'biologie-medicale', name: 'Biologie médicale', family: 'Biologie', Icon: FlaskConical, accent: ACCENTS.emerald,
    bullets: ['Hémato & biochimie', 'Microbiologie', 'Immunologie', 'Qualité & accréditation'] },
  { slug: 'anatomie-pathologique', name: 'Anatomie & cytologie pathologiques', family: 'Biologie', Icon: Microscope, accent: ACCENTS.teal,
    bullets: ['Cancers fréquents', 'Cytologie', 'Immuno-histochimie', 'Biologie moléculaire'] },
  { slug: 'genetique', name: 'Génétique médicale', family: 'Biologie', Icon: Dna, accent: ACCENTS.fuchsia,
    bullets: ['Conseil génétique', 'Maladies héréditaires', 'Oncogénétique', 'Diagnostic prénatal'] },
  { slug: 'pharmacologie', name: 'Pharmacologie clinique', family: 'Biologie', Icon: Beaker, accent: ACCENTS.blue,
    bullets: ['Pharmacocinétique', 'Pharmacovigilance', 'Interactions', 'Essais cliniques'] },

  // Pharmacie
  { slug: 'pharmacie-hospitaliere', name: 'Pharmacie hospitalière', family: 'Pharmacie', Icon: Pill, accent: ACCENTS.green,
    bullets: ['Dispensation', 'Préparations & stérilisation', 'Pharmacie clinique', 'Bon usage du médicament'] },
  { slug: 'pharmacie-officine', name: 'Pharmacie d’officine', family: 'Pharmacie', Icon: Pill, accent: ACCENTS.emerald,
    bullets: ['Conseil & dispensation', 'Vaccination', 'Tests rapides', 'Coopération ville-hôpital'] },

  // Santé publique
  { slug: 'sante-publique', name: 'Santé publique', family: 'Santé publique', Icon: Users, accent: ACCENTS.indigo,
    bullets: ['Épidémiologie', 'Économie de la santé', 'Prévention & dépistage', 'Politiques publiques'] },
  { slug: 'anesthesie-reanimation', name: 'Anesthésie & Réanimation', family: 'Médecine', Icon: Syringe, accent: ACCENTS.violet,
    bullets: ['Consultation pré-op', 'ALR & AG', 'Choc & arrêt circulatoire', 'Post-op & SSPI'] },
];

const FAMILIES: Family[] = ['Médecine', 'Chirurgie', 'Pédiatrie', 'Imagerie', 'Biologie', 'Pharmacie', 'Santé publique'];

/* ============================================================
   1. HERO + bandeau "toutes proposées"
   ============================================================ */
function SpecialitesHero() {
  return (
    <section className="relative overflow-hidden bg-white pt-12 pb-10 sm:pt-16 sm:pb-12 lg:pt-20" style={{ fontFamily: FONT }}>
      <div aria-hidden className="pointer-events-none absolute -left-40 -top-40 -z-10 h-[480px] w-[480px] rounded-full bg-[#C0112E]/6 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-32 top-20 -z-10 h-[420px] w-[420px] rounded-full bg-[#0F1F4D]/5 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
          {/* LEFT */}
          <Reveal>
            <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl border px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] sm:rounded-full sm:text-[11px]"
              style={{ background: '#FCEAEC', borderColor: 'rgba(192,17,46,0.22)', color: RED }}>
              <Sparkles className="h-3.5 w-3.5" />
              Toutes les spécialités EVC (PAE)
              <span className="opacity-50">·</span>
              <span>PADHUE</span>
            </span>

            <h1 className="mt-5 text-4xl font-black leading-[1.02] tracking-tight sm:text-5xl lg:text-[3.6rem]"
              style={gradientText(GRAD_NAVY_RED)}>
              Préparations EVC dans{' '}
              <span style={gradientText(GRAD_BURGUNDY)}>45+&nbsp;spécialités</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed sm:text-[17px]" style={{ color: INK_SOFT }}>
              Major ECN couvre l’intégralité des spécialités proposées aux EVC&nbsp;:
              médecine, chirurgie, pédiatrie, imagerie, biologie, pharmacie et santé
              publique. Pour chacune, un programme complet, des cas cliniques inédits
              et des correcteurs spécialistes.
            </p>

            {/* Mini-chips familles */}
            <div className="mt-6 flex flex-wrap items-center gap-1.5 text-[11.5px] font-bold" style={{ color: INK_SOFT }}>
              {['Médecine', 'Chirurgie', 'Cardiologie', 'Pharmacie', 'Pédiatrie'].map((c, i) => (
                <span key={c} className="inline-flex items-center">
                  <span>{c}</span>
                  {i < 4 && <span className="mx-2 opacity-40">•</span>}
                </span>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/inscription"
                className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-[0_18px_40px_-18px_rgba(192,17,46,0.55)] transition-transform hover:scale-[1.02]"
                style={{ background: `linear-gradient(135deg, ${RED} 0%, ${RED_DEEP} 100%)` }}>
                Démarrer ma préparation <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="#liste"
                className="inline-flex items-center gap-2 rounded-2xl border bg-white px-5 py-3 text-sm font-bold transition-transform hover:scale-[1.02]"
                style={{ borderColor: BORDER, color: NAVY }}>
                Explorer toutes les spécialités
              </Link>
            </div>
          </Reveal>

          {/* RIGHT — carte d’info "toutes proposées" */}
          <Reveal delay={0.1}>
            <div className="relative rounded-3xl border bg-white p-6 shadow-[0_30px_80px_-30px_rgba(15,31,77,0.30)] sm:p-7"
              style={{ borderColor: BORDER }}>
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ background: '#FCEAEC', color: RED }}>
                  <CheckCircle2 className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.18em]" style={{ color: RED }}>
                    100% disponibles
                  </p>
                  <p className="text-base font-extrabold" style={{ color: NAVY }}>
                    Toutes les spécialités présentées sur cette page sont déjà proposées par Major ECN.
                  </p>
                </div>
              </div>

              <p className="mt-4 text-[13.5px] leading-relaxed" style={{ color: INK_SOFT }}>
                Les inscriptions sont ouvertes dès maintenant chez l’ensemble des
                spécialités proposées. Que vous prépariez la médecine générale, la
                chirurgie orthopédique ou la pharmacie hospitalière, vous bénéficiez
                du même cadre&nbsp;: programme exhaustif, correcteurs spécialistes,
                suivi personnalisé.
              </p>

              <ul className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {[
                  'Programmes officiels',
                  'Cas cliniques inédits',
                  'Corrigés EVC ciblés',
                  'Suivi personnalisé',
                ].map((it) => (
                  <li key={it} className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: NAVY }}>
                    <Check className="h-4 w-4" style={{ color: RED }} /> {it}
                  </li>
                ))}
              </ul>

              {/* Mini visuel plateforme */}
              <div className="mt-5 overflow-hidden rounded-2xl border" style={{ borderColor: BORDER }}>
                <img src="/accueil.png" alt="Aperçu plateforme Major ECN" className="block aspect-[16/9] w-full object-cover object-top" />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   2. Strip métriques
   ============================================================ */
function MetricsStrip() {
  const metrics = [
    { Icon: Trophy,        big: '45+',   label: 'spécialités couvertes', tone: RED },
    { Icon: GraduationCap, big: '100%',  label: 'des programmes officiels', tone: '#0F8A6A' },
    { Icon: UserCheck,     big: '100%',  label: 'correcteurs spécialistes', tone: '#2563EB' },
    { Icon: TrendingUp,    big: '+18 ans', label: 'd’expérience PADHUE', tone: '#7C3AED' },
    { Icon: Award,         big: '100%',  label: 'préparation EVC officielle', tone: '#E8742C' },
  ];
  return (
    <section className="relative" style={{ fontFamily: FONT, background: SOFT_BG }}>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Reveal>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {metrics.map((m, i) => (
              <div key={i} className="flex items-center gap-3 rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: BORDER }}>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: `${m.tone}14`, color: m.tone }}>
                  <m.Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-lg font-black leading-tight" style={{ color: NAVY }}>{m.big}</p>
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
   3. Filtre + recherche + grille
   ============================================================ */
function SpecialitesGrid() {
  const [q, setQ] = useState('');
  const [fam, setFam] = useState<Family | 'Toutes'>('Toutes');

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return SPECIALITIES.filter((s) => {
      if (fam !== 'Toutes' && s.family !== fam) return false;
      if (!needle) return true;
      return s.name.toLowerCase().includes(needle) || s.family.toLowerCase().includes(needle);
    });
  }, [q, fam]);

  return (
    <section id="liste" className="relative scroll-mt-24 bg-white py-12 sm:py-16 lg:py-20" style={{ fontFamily: FONT }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Recherche + tabs */}
        <Reveal>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: INK_MUTED }} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher une spécialité…"
                className="w-full rounded-2xl border bg-white py-3 pl-10 pr-4 text-sm font-medium outline-none transition-shadow placeholder:font-normal focus:ring-2"
                style={{ borderColor: BORDER, color: NAVY }}
              />
            </div>
            <div className="-mx-1 flex flex-wrap items-center gap-1.5 lg:mx-0">
              {(['Toutes', ...FAMILIES] as const).map((f) => {
                const active = fam === f;
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFam(f)}
                    className="rounded-full border px-3.5 py-1.5 text-[12.5px] font-bold transition-colors"
                    style={{
                      background: active ? RED : 'white',
                      borderColor: active ? RED : BORDER,
                      color: active ? 'white' : NAVY,
                    }}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          </div>
          <p className="mt-3 text-[12px] font-semibold" style={{ color: INK_MUTED }}>
            {list.length} spécialité{list.length > 1 ? 's' : ''} trouvée{list.length > 1 ? 's' : ''}
          </p>
        </Reveal>

        {/* Grille */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((s, i) => (
            <Reveal key={s.slug} delay={Math.min(0.04 * (i % 8), 0.32)}>
              <SpecCard s={s} />
            </Reveal>
          ))}
          {list.length === 0 && (
            <div className="col-span-full rounded-2xl border bg-white p-8 text-center" style={{ borderColor: BORDER }}>
              <p className="text-sm font-bold" style={{ color: NAVY }}>Aucune spécialité ne correspond.</p>
              <p className="mt-1 text-[13px]" style={{ color: INK_SOFT }}>Réinitialisez les filtres ou contactez-nous pour toute demande.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function SpecCard({ s }: { s: Speciality }) {
  const href = s.slug === 'medecine-generale' ? '/specialites/medecine-generale' : `/specialites#${s.slug}`;
  return (
    <Link href={href}
      className="group relative flex h-full flex-col gap-3 rounded-2xl border bg-white p-4 shadow-[0_8px_28px_-18px_rgba(15,31,77,0.20)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-20px_rgba(15,31,77,0.35)]"
      style={{ borderColor: BORDER }}>
      <span aria-hidden className="absolute inset-x-4 top-0 h-[3px] rounded-b-full opacity-90"
        style={{ background: s.accent }} />
      <div className="mt-1 flex items-center gap-2.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: `${s.accent}14`, color: s.accent }}>
          <s.Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[14.5px] font-extrabold leading-tight" style={{ color: NAVY }}>{s.name}</p>
          <p className="text-[10.5px] font-bold uppercase tracking-wider" style={{ color: INK_MUTED }}>{s.family}</p>
        </div>
      </div>
      <ul className="space-y-1.5 text-[12.5px]" style={{ color: INK_SOFT }}>
        {s.bullets.map((b) => (
          <li key={b} className="flex items-start gap-1.5">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: s.accent }} />
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <span className="mt-auto inline-flex items-center gap-1 text-[12.5px] font-bold transition-colors group-hover:underline"
        style={{ color: s.accent }}>
        Découvrir <ChevronRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}

/* ============================================================
   4. Pourquoi choisir Major ECN
   ============================================================ */
function WhyChoose() {
  const items = [
    {
      Icon: Stethoscope, tone: RED,
      title: 'Programmes officiels',
      text: "Chaque spécialité suit le référentiel officiel EVC mis à jour pour la session en cours, avec rappels-clés, fiches synthèse et schémas de raisonnement.",
    },
    {
      Icon: UserCheck, tone: '#2563EB',
      title: 'Correcteurs spécialistes',
      text: "Vos copies sont corrigées par des praticiens hospitaliers ou enseignants reconnus de la spécialité visée, qui maîtrisent les attentes du jury.",
    },
    {
      Icon: Hospital, tone: '#0F8A6A',
      title: 'Cas cliniques inédits',
      text: "Banque de cas cliniques exclusifs, calibrés au format EVC, qui couvrent les situations les plus discriminantes de chaque spécialité.",
    },
    {
      Icon: Layers3, tone: '#7C3AED',
      title: 'Révision transversale',
      text: "Notre moteur intelligent vous fait réviser dans l’ordre les notions où vous êtes le plus fragile, toutes spécialités confondues.",
    },
  ];
  return (
    <section className="relative bg-white py-14 sm:py-16 lg:py-20" style={{ fontFamily: FONT }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em]"
            style={{ background: '#FCEAEC', borderColor: 'rgba(192,17,46,0.22)', color: RED }}>
            <Sparkles className="h-3 w-3" /> Pourquoi choisir Major ECN
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl" style={gradientText(GRAD_NAVY_RED)}>
            Quatre piliers, valables dans chaque spécialité
          </h2>
          <p className="mt-3 text-[15px]" style={{ color: INK_SOFT }}>
            Quels que soient votre parcours et la spécialité visée, Major ECN vous
            offre la même rigueur académique et le même accompagnement.
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

        {/* Aperçu plateforme */}
        <Reveal delay={0.1}>
          <div className="mt-10 overflow-hidden rounded-3xl border bg-white shadow-[0_30px_80px_-30px_rgba(15,31,77,0.30)]" style={{ borderColor: BORDER }}>
            <img src="/entrainement.png" alt="Aperçu de l’entraînement Major ECN" className="block w-full object-cover" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   5. Témoignages multi-spécialités
   ============================================================ */
function MultiSpecTestimonials() {
  const tm = [
    {
      name: 'Dr Samy K.', spe: 'Cardiologie', photo: '/temoignages/drsamy.jpg',
      quote: "J’ai pu reprendre les bases cardiologiques avec des cas calibrés EVC. Les corrigés étaient d’une précision impressionnante.",
    },
    {
      name: 'Dr Leila B.', spe: 'Pédiatrie', photo: '/temoignages/dr-leila-bettaieb.jpg',
      quote: "La banque de cas pédiatriques couvre vraiment tout — vaccinations, urgences, neuro-pédiatrie. Une mine.",
    },
    {
      name: 'Dr Amélie L.', spe: 'Médecine Générale', photo: '/temoignages/dr-amelie-lamure.jpg',
      quote: "Le suivi individualisé fait la différence. J’ai eu l’impression d’avoir un mentor à chaque étape.",
    },
    {
      name: 'Dr Haykel A.', spe: 'Anesthésie-Réanimation', photo: '/temoignages/dr-haykel-abdelbaki.jpg',
      quote: "Les cas de déchocage et la révision transversale m’ont permis d’arriver très serein aux EVC.",
    },
  ];
  return (
    <section className="relative bg-[#F7F8FB] py-14 sm:py-16 lg:py-20" style={{ fontFamily: FONT }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl" style={gradientText(GRAD_NAVY_RED)}>
            Ils préparent l’EVC dans différentes spécialités
          </h2>
          <p className="mt-3 text-[15px]" style={{ color: INK_SOFT }}>
            Des candidats de toute la France et d’ailleurs racontent leur préparation
            avec Major ECN, dans leur spécialité de cœur.
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tm.map((t, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <div className="flex h-full flex-col rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: BORDER }}>
                <Quote className="h-5 w-5" style={{ color: RED }} />
                <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: INK_SOFT }}>
                  « {t.quote} »
                </p>
                <div className="mt-auto flex items-center gap-3 pt-4">
                  <img src={t.photo} alt="" className="h-10 w-10 rounded-full object-cover" />
                  <div>
                    <p className="text-[13px] font-extrabold" style={{ color: NAVY }}>{t.name}</p>
                    <p className="text-[11.5px] font-semibold" style={{ color: RED }}>{t.spe}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   6. CTA final
   ============================================================ */
function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-14 sm:py-16 lg:py-20" style={{ fontFamily: FONT, background: `linear-gradient(135deg, ${NAVY_DEEP} 0%, ${NAVY} 60%, ${RED_DEEP} 100%)` }}>
      <span aria-hidden className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full"
        style={{ background: 'radial-gradient(closest-side, rgba(232,116,44,0.30), rgba(255,255,255,0))' }} />
      <span aria-hidden className="pointer-events-none absolute -left-32 -bottom-20 h-[360px] w-[360px] rounded-full"
        style={{ background: 'radial-gradient(closest-side, rgba(212,175,55,0.25), rgba(255,255,255,0))' }} />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.22em] text-white backdrop-blur">
            <Sparkles className="h-3 w-3" /> Inscription ouverte
          </span>
          <h2 className="mt-5 text-3xl font-black leading-[1.05] tracking-tight text-white sm:text-4xl lg:text-5xl"
            style={{ letterSpacing: '-0.02em' }}>
            Prêt à réussir les EVC <span style={{ color: '#F5D597' }}>dans votre spécialité&nbsp;?</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-white/85">
            Rejoignez la plateforme de référence des PADHUE. Programme complet,
            correcteurs spécialistes, suivi personnalisé&nbsp;: tout est déjà prêt
            pour vous accompagner.
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
export function SpecialitesPageContent() {
  return (
    <main className="bg-white">
      <SpecialitesHero />
      <MetricsStrip />
      <SpecialitesGrid />
      <WhyChoose />
      <MultiSpecTestimonials />
      <FinalCTA />
    </main>
  );
}

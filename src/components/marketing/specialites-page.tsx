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
  Activity, Apple, ArrowRight, Award, Baby, Bandage, Beaker, Bone, BookOpen, Brain, BriefcaseMedical,
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
  description: string;  // paragraphe descriptif (1-3 phrases)
};

const ACCENTS = {
  red: '#C0112E', rose: '#BE185D', orange: '#E8742C', amber: '#D97706',
  green: '#16A34A', emerald: '#0F8A6A', teal: '#0E7C7B', cyan: '#0891B2',
  blue: '#2563EB', indigo: '#4F46E5', violet: '#7C3AED', fuchsia: '#A21CAF',
  slate: '#475569', navy: '#0F1F4D',
};

const SPECIALITIES: Speciality[] = [
  // ====== MÉDECINE ======
  { slug: "medecine-generale", name: "Médecine générale", family: "Médecine", Icon: Stethoscope, accent: ACCENTS.red,
    description: "Préparation complète aux EVC en médecine générale, calibrée sur le référentiel CMG et les recommandations HAS. Cas cliniques de consultation, suivi des maladies chroniques, prévention et coordination ville-hôpital." },
  { slug: "cardiologie-et-maladies-vasculaires", name: "Cardiologie et maladies vasculaires", family: "Médecine", Icon: HeartPulse, accent: ACCENTS.red,
    description: "Programme cardiovasculaire couvrant les syndromes coronariens, l'insuffisance cardiaque, les arythmies, l'HTA et les maladies vasculaires périphériques selon les recommandations actualisées." },
  { slug: "pneumologie", name: "Pneumologie", family: "Médecine", Icon: Wind, accent: ACCENTS.cyan,
    description: "Préparation aux EVC en pneumologie : asthme, BPCO, cancers bronchiques, pneumopathies infectieuses. Lecture de l'imagerie thoracique et interprétation des EFR." },
  { slug: "gastro-enterologie-et-hepatologie", name: "Gastro-entérologie et hépatologie", family: "Médecine", Icon: Apple, accent: ACCENTS.orange,
    description: "Programme gastro-hépatologique complet : MICI, hépatites virales et chroniques, cancers digestifs, hémorragies digestives et conduites endoscopiques raisonnées." },
  { slug: "endocrinologie-et-metabolisme", name: "Endocrinologie et métabolisme", family: "Médecine", Icon: Gauge, accent: ACCENTS.amber,
    description: "Préparation endocrinologique couvrant le diabète, les pathologies thyroïdiennes et surrénaliennes, l'obésité et les troubles nutritionnels avec conduite à tenir précise." },
  { slug: "nephrologie", name: "Néphrologie", family: "Médecine", Icon: Droplet, accent: ACCENTS.blue,
    description: "Programme couvrant l'insuffisance rénale aiguë et chronique, la dialyse, la transplantation, l'HTA secondaire et les désordres hydro-électrolytiques." },
  { slug: "neurologie", name: "Neurologie", family: "Médecine", Icon: Brain, accent: ACCENTS.violet,
    description: "Préparation aux EVC en neurologie : AVC, épilepsies, sclérose en plaques, démences et pathologies du mouvement avec démarche diagnostique structurée." },
  { slug: "hematologie", name: "Hématologie", family: "Médecine", Icon: TestTube, accent: ACCENTS.fuchsia,
    description: "Programme hématologique complet : anémies, cytopénies, hémopathies malignes, troubles de l'hémostase et indications de transfusion conformes aux protocoles français." },
  { slug: "rhumatologie", name: "Rhumatologie", family: "Médecine", Icon: Bone, accent: ACCENTS.slate,
    description: "Préparation rhumatologique sur arthrites, arthroses, polyarthrite rhumatoïde, spondyloarthrites et ostéoporose. Démarche diagnostique des lombalgies et des sciatiques." },
  { slug: "dermatologie-et-venereologie", name: "Dermatologie et vénéréologie", family: "Médecine", Icon: Bandage, accent: ACCENTS.rose,
    description: "Programme dermatologique sur les cancers cutanés, eczéma, psoriasis, infections sexuellement transmissibles et urgences dermatologiques avec iconographie clinique." },
  { slug: "oncologie", name: "Oncologie", family: "Médecine", Icon: Target, accent: ACCENTS.indigo,
    description: "Programme oncologique couvrant les cancers fréquents, les protocoles de chimiothérapie et d'immunothérapie, les soins de support et l'organisation des RCP." },
  { slug: "medecine-interne", name: "Médecine interne", family: "Médecine", Icon: Compass, accent: ACCENTS.navy,
    description: "Préparation transversale sur les maladies systémiques, les pathologies auto-immunes, la fièvre prolongée et l'altération de l'état général avec démarche diagnostique rigoureuse." },
  { slug: "reanimation-medicale", name: "Réanimation médicale", family: "Médecine", Icon: Activity, accent: ACCENTS.red,
    description: "Préparation à la médecine intensive : sepsis, SDRA, ventilation mécanique, états de choc et défaillances multi-organes selon les recommandations SRLF actualisées." },
  { slug: "geriatrie", name: "Gériatrie", family: "Médecine", Icon: Users, accent: ACCENTS.orange,
    description: "Programme gériatrique sur l'évaluation gériatrique standardisée, les chutes, la fragilité, les démences et la polymédication en parcours hospitaliers et ambulatoires." },
  { slug: "medecine-physique-et-de-readaptation", name: "Médecine physique et de réadaptation", family: "Médecine", Icon: Footprints, accent: ACCENTS.teal,
    description: "Préparation aux EVC en MPR : rééducation post-AVC, lésions médullaires, prise en charge locomotrice, handicap et appareillage selon les standards SOFMER." },
  { slug: "medecine-du-travail", name: "Médecine du travail", family: "Médecine", Icon: BriefcaseMedical, accent: ACCENTS.slate,
    description: "Programme médecine du travail couvrant les visites d'aptitude, les risques professionnels, les TMS, les risques psychosociaux et les maladies professionnelles." },
  { slug: "psychiatrie", name: "Psychiatrie", family: "Médecine", Icon: Brain, accent: ACCENTS.violet,
    description: "Programme psychiatrique sur les troubles de l'humeur, schizophrénies, conduites addictives et urgences psychiatriques avec démarche diagnostique structurée." },
  { slug: "anesthesie-reanimation", name: "Anesthésie-réanimation", family: "Médecine", Icon: Syringe, accent: ACCENTS.violet,
    description: "Programme anesthésie-réanimation sur la consultation pré-opératoire, l'ALR et l'AG, les états de choc, l'arrêt circulatoire et les soins post-opératoires en SSPI." },
  { slug: "gynecologie-medicale", name: "Gynécologie médicale", family: "Médecine", Icon: Heart, accent: ACCENTS.rose,
    description: "Préparation à la gynécologie médicale : contraception, ménopause, endométriose, pathologies du sein et dépistages selon les recommandations actualisées." },
  { slug: "sante-publique-et-medecine-sociale", name: "Santé publique et médecine sociale", family: "Médecine", Icon: Users, accent: ACCENTS.indigo,
    description: "Préparation aux EVC en santé publique : épidémiologie, économie de la santé, prévention, dépistage, politiques publiques et organisation du système de soins." },

  // ====== CHIRURGIE ======
  { slug: "chirurgie-generale", name: "Chirurgie générale", family: "Chirurgie", Icon: Scissors, accent: ACCENTS.red,
    description: "Préparation à la chirurgie générale couvrant les urgences abdominales, les hernies, la chirurgie pariétale, proctologique et endocrinienne avec techniques coelioscopiques." },
  { slug: "chirurgie-viscerale-et-digestive", name: "Chirurgie viscérale et digestive", family: "Chirurgie", Icon: Scissors, accent: ACCENTS.red,
    description: "Programme couvrant les cancers digestifs, les MICI opérées, la chirurgie hépato-bilio-pancréatique et les urgences viscérales avec techniques coelioscopiques modernes." },
  { slug: "chirurgie-orthopedique-et-traumatologie", name: "Chirurgie orthopédique et traumatologie", family: "Chirurgie", Icon: Bone, accent: ACCENTS.amber,
    description: "Programme orthopédie-traumatologie couvrant fractures, luxations, prothèses articulaires, arthroscopies et traumatologie sportive selon les protocoles SOFCOT." },
  { slug: "chirurgie-thoracique-et-cardio-vasculaire", name: "Chirurgie thoracique et cardio-vasculaire", family: "Chirurgie", Icon: HeartPulse, accent: ACCENTS.red,
    description: "Préparation à la chirurgie cardio-thoracique : pathologies coronaires et valvulaires, chirurgie de l'aorte, résections pulmonaires et soins post-opératoires spécifiques." },
  { slug: "chirurgie-vasculaire", name: "Chirurgie vasculaire", family: "Chirurgie", Icon: Activity, accent: ACCENTS.red,
    description: "Programme couvrant la prise en charge des anévrismes aortiques, de l'AOMI, des pathologies carotidiennes et des techniques endovasculaires actuelles." },
  { slug: "chirurgie-urologique", name: "Chirurgie urologique", family: "Chirurgie", Icon: Pipette, accent: ACCENTS.blue,
    description: "Programme urologique sur les lithiases, infections urinaires, cancers urologiques, troubles mictionnels et andrologie selon les recommandations AFU actuelles." },
  { slug: "neurochirurgie", name: "Neurochirurgie", family: "Chirurgie", Icon: Brain, accent: ACCENTS.violet,
    description: "Préparation aux EVC en neurochirurgie : traumatismes crâniens, tumeurs cérébrales, pathologie rachidienne et hydrocéphalie avec indications opératoires précises." },
  { slug: "chirurgie-plastique-reconstructrice-et-esthetique", name: "Chirurgie plastique, reconstructrice et esthétique", family: "Chirurgie", Icon: Smile, accent: ACCENTS.fuchsia,
    description: "Programme chirurgie plastique couvrant la prise en charge des brûlés, la reconstruction post-traumatique ou oncologique, la microchirurgie et l'esthétique raisonnée." },
  { slug: "chirurgie-maxillo-faciale-et-stomatologie", name: "Chirurgie maxillo-faciale et stomatologie", family: "Chirurgie", Icon: Smile, accent: ACCENTS.indigo,
    description: "Préparation couvrant les fractures faciales, la pathologie de l'ATM, les tumeurs cervico-faciales et la stomatologie selon les standards de la SFSCMFCO." },
  { slug: "chirurgie-infantile", name: "Chirurgie infantile", family: "Chirurgie", Icon: Baby, accent: ACCENTS.rose,
    description: "Programme couvrant les urgences viscérales pédiatriques, les malformations congénitales, l'orthopédie de l'enfant et les cancers pédiatriques avec leur prise en charge." },
  { slug: "chirurgie-orale", name: "Chirurgie orale", family: "Chirurgie", Icon: Smile, accent: ACCENTS.amber,
    description: "Programme couvrant la chirurgie buccale, les extractions complexes, les pathologies bucco-dentaires et les implants selon les standards français." },
  { slug: "gynecologie-obstetrique", name: "Gynécologie obstétrique", family: "Chirurgie", Icon: Heart, accent: ACCENTS.rose,
    description: "Préparation complète au suivi de grossesse, aux urgences obstétricales, aux cancers gynécologiques et à la contraception selon les recommandations CNGOF." },
  { slug: "orl-et-chirurgie-cervico-faciale", name: "ORL et chirurgie cervico-faciale", family: "Chirurgie", Icon: Ear, accent: ACCENTS.cyan,
    description: "Programme ORL sur les surdités, vertiges, cancers de la tête et du cou, pathologies sinusiennes et chirurgie cervico-faciale." },
  { slug: "ophtalmologie", name: "Ophtalmologie", family: "Chirurgie", Icon: Eye, accent: ACCENTS.blue,
    description: "Préparation aux EVC en ophtalmologie : DMLA, glaucome, cataracte, rétinopathie diabétique et urgences oculaires avec démarche clinique structurée." },

  // ====== PÉDIATRIE ======
  { slug: "pediatrie", name: "Pédiatrie", family: "Pédiatrie", Icon: Baby, accent: ACCENTS.rose,
    description: "Préparation aux EVC en pédiatrie : néonatologie, calendrier vaccinal, urgences pédiatriques, suivi du nourrisson et dépistages systématiques selon les recommandations SFP." },

  // ====== IMAGERIE ======
  { slug: "radiodiagnostic-et-imagerie-medicale", name: "Radiodiagnostic et imagerie médicale", family: "Imagerie", Icon: ScanSearch, accent: ACCENTS.indigo,
    description: "Préparation aux EVC en radiodiagnostic : radiographies standard, scanner, IRM ciblée, échographie et radiologie interventionnelle avec interprétation systématique." },
  { slug: "medecine-nucleaire", name: "Médecine nucléaire", family: "Imagerie", Icon: Radio, accent: ACCENTS.violet,
    description: "Programme médecine nucléaire sur les scintigraphies, la TEP-TDM, la radiothérapie interne vectorisée et la dosimétrie clinique actualisée." },

  // ====== BIOLOGIE ======
  { slug: "biologie-medicale-medecin", name: "Biologie médicale (médecin)", family: "Biologie", Icon: FlaskConical, accent: ACCENTS.emerald,
    description: "Préparation médecin biologiste : hématologie biologique, biochimie, microbiologie, immunologie, qualité et accréditation des laboratoires." },
  { slug: "biologie-medicale-pharmacien", name: "Biologie médicale (pharmacien)", family: "Biologie", Icon: FlaskConical, accent: ACCENTS.green,
    description: "Préparation pharmacien biologiste : hématologie biologique, biochimie, microbiologie, immunologie, qualité et accréditation des laboratoires." },
  { slug: "anatomie-et-cytologie-pathologiques", name: "Anatomie et cytologie pathologiques", family: "Biologie", Icon: Microscope, accent: ACCENTS.teal,
    description: "Programme anatomopathologique sur les cancers fréquents, la cytologie, l'immuno-histochimie et la biologie moléculaire intégrées aux RCP." },
  { slug: "genetique-medicale", name: "Génétique médicale", family: "Biologie", Icon: Dna, accent: ACCENTS.fuchsia,
    description: "Préparation aux EVC en génétique médicale : conseil génétique, maladies héréditaires, oncogénétique et diagnostic prénatal avec les indications validées." },

  // ====== PHARMACIE ======
  { slug: "pharmacie-polyvalente", name: "Pharmacie polyvalente", family: "Pharmacie", Icon: Pill, accent: ACCENTS.green,
    description: "Préparation aux EVC en pharmacie polyvalente : dispensation, préparations stériles, pharmacie clinique, bon usage du médicament et conseil officinal." },

  // ====== ODONTOLOGIE & MAÏEUTIQUE ======
  { slug: "odontologie", name: "Odontologie", family: "Médecine", Icon: Smile, accent: ACCENTS.rose,
    description: "Préparation aux EVC en odontologie : pathologies bucco-dentaires, chirurgie orale, parodontologie et prothèse dentaire." },
  { slug: "orthopedie-dento-faciale", name: "Orthopédie dento-faciale", family: "Médecine", Icon: Smile, accent: ACCENTS.fuchsia,
    description: "Préparation à l'orthopédie dento-faciale : diagnostic orthodontique, traitement des malocclusions, contention et suivi pluridisciplinaire." },
  { slug: "sage-femme", name: "Sage-femme", family: "Médecine", Icon: Baby, accent: ACCENTS.rose,
    description: "Préparation aux EVC sage-femme : suivi de grossesse, accouchement, post-partum, gynécologie de prévention et néonatologie." },
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
    { Icon: Trophy,     big: '45+',                 sub: 'spécialités couvertes',                       tone: RED },
    { Icon: BookOpen,   big: 'Référentiels\nactualisés', sub: 'HAS, collèges et recommandations récentes', tone: '#0F8A6A' },
    { Icon: UserCheck,  big: '100%',                sub: 'correcteurs spécialistes',                    tone: '#2563EB' },
    { Icon: TrendingUp, big: '+15 ans',             sub: 'd’expérience PADHUE',                         tone: '#7C3AED' },
    { Icon: Target,     big: 'Méthodologie\nEVC',   sub: '15 ans d’amélioration continue',              tone: '#E8742C' },
  ];
  return (
    <section className="relative" style={{ fontFamily: FONT, background: SOFT_BG }}>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Reveal>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {metrics.map((m, i) => (
              <div key={i} className="flex flex-col gap-4 rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: BORDER }}>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ background: `${m.tone}14`, color: m.tone }}>
                  <m.Icon className="h-6 w-6" strokeWidth={2.2} />
                </span>
                <div className="min-w-0">
                  <p className="whitespace-pre-line text-[20px] font-black leading-tight tracking-tight" style={{ color: NAVY }}>
                    {m.big}
                  </p>
                  <p className="mt-1.5 text-[13px] font-medium leading-snug" style={{ color: INK_SOFT }}>
                    {m.sub}
                  </p>
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
/* Nombre de spécialités affichées avant le bouton « Voir toutes les spécialités ». */
const SPEC_INITIAL_COUNT = 20;

function SpecialitesGrid() {
  const [q, setQ] = useState('');
  const [fam, setFam] = useState<Family | 'Toutes'>('Toutes');
  const [showAll, setShowAll] = useState(false);

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
        <div className="mt-8 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {(showAll ? list : list.slice(0, SPEC_INITIAL_COUNT)).map((s, i) => (
            <Reveal key={s.slug} delay={Math.min(0.03 * (i % 10), 0.30)}>
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

        {/* Bouton "Voir toutes les spécialités" */}
        {list.length > SPEC_INITIAL_COUNT && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="inline-flex items-center gap-2 rounded-2xl border bg-white px-5 py-2.5 text-[13.5px] font-bold transition-transform hover:scale-[1.02]"
              style={{ borderColor: BORDER, color: NAVY, fontFamily: FONT }}
            >
              {showAll
                ? `Réduire la liste`
                : `Voir toutes les spécialités (${list.length - SPEC_INITIAL_COUNT} de plus)`}
              <ChevronRight className={'h-4 w-4 transition-transform ' + (showAll ? 'rotate-90' : '')} />
            </button>
          </div>
        )}

      </div>
    </section>
  );
}

function SpecCard({ s }: { s: Speciality }) {
  const isMG = s.slug === 'medecine-generale';
  const href = isMG ? '/specialites/medecine-generale' : '/contact';
  return (
    <Link href={href}
      className="group relative flex h-full flex-col gap-2.5 rounded-2xl border bg-white p-4 shadow-[0_8px_28px_-18px_rgba(15,31,77,0.20)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-20px_rgba(15,31,77,0.35)]"
      style={{ borderColor: BORDER, fontFamily: FONT }}>
      <span aria-hidden className="absolute inset-x-4 top-0 h-[3px] rounded-b-full opacity-90"
        style={{ background: s.accent }} />

      {/* 1. Titre + icone */}
      <div className="mt-1 flex items-center gap-2.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: `${s.accent}14`, color: s.accent }}>
          <s.Icon className="h-5 w-5" />
        </span>
        <p className="text-[14.5px] font-extrabold leading-tight" style={{ color: s.accent }}>{s.name}</p>
      </div>

      {/* 2. Check items : preparation existante + inscriptions ouvertes */}
      <ul className="space-y-1 text-[11.5px] font-semibold" style={{ color: '#0F172A' }}>
        <li className="flex items-center gap-1.5">
          <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-[#16A34A] text-white">
            <Check className="h-2.5 w-2.5" strokeWidth={3} />
          </span>
          Préparation existante
        </li>
        <li className="flex items-center gap-1.5">
          <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-[#16A34A] text-white">
            <Check className="h-2.5 w-2.5" strokeWidth={3} />
          </span>
          Inscriptions ouvertes
        </li>
      </ul>

      {/* 3. Paragraphe descriptif tronqué */}
      <p className="text-[12px] leading-relaxed [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:4] overflow-hidden"
        style={{ color: '#475569' }}>
        {s.description}
      </p>

      {/* 4. CTA bas de carte */}
      <span className="mt-auto inline-flex items-center gap-1 text-[11.5px] font-bold transition-colors group-hover:underline"
        style={{ color: isMG ? s.accent : '#7A8499' }}>
        {isMG ? 'Découvrir la préparation' : 'Nous contacter pour s’inscrire'} <ChevronRight className="h-3.5 w-3.5" />
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
      name: 'Dr Samy KABAWEH', spe: 'Radiologie', photo: '/temoignages/drsamy.jpg',
      quote: "Cette préparation m'a vraiment permis de franchir un cap.",
    },
    {
      name: 'Dr Leila Bettaieb', spe: 'Médecine générale', photo: '/temoignages/dr-leila-bettaieb.jpg',
      quote: "Une méthode claire, de bons supports et un véritable accompagnement.",
    },
    {
      name: 'Dr Bill Baron WANKPO', spe: 'Médecine générale', photo: '/temoignages/drbilly.png',
      quote: "Une préparation structurée et ciblée, utile bien au-delà du concours.",
    },
    {
      name: 'Dr Haykel Abdelbaki', spe: 'Radiologie', photo: '/temoignages/dr-haykel-abdelbaki.jpg',
      quote: "Sérieux, qualité et accompagnement : les clés de ma réussite.",
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

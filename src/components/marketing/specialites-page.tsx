'use client';
import Image from 'next/image';
/**
 * Page Spécialités — catalogue pixel-perfect (maquette designer).
 * 7 sections : hero + bandeau "toutes proposées", strip métriques,
 * filtres + recherche, grille spécialités (45+), pourquoi Major ECN,
 * témoignages multi-spécialités, CTA final.
 */

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { specialtyByName } from '@/lib/data/enrollable-colleges';
import {
  Activity, Apple, Baby, Bandage, Bone, Brain, BriefcaseMedical, Compass, Dna,
  Droplet, Ear, Eye, FlaskConical, Footprints, Gauge, Heart, HeartPulse,
  Microscope, Pill, Pipette, Radio, Scissors, ScanSearch, Siren, Smile,
  Stethoscope, Syringe, Target, TestTube, Users, Wind,
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

/** Minuscules, sans accents, apostrophes unifiées — pour les recherches. */
const normaliser = (t: string) =>
  t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, "'");
const gradientText = (grad: string) => ({
  backgroundImage: grad,
  WebkitBackgroundClip: 'text' as const,
  backgroundClip: 'text' as const,
  WebkitTextFillColor: 'transparent' as const,
  color: 'transparent',
});

/* ============================================================
   Données — toutes les spécialités, classées par famille
   ============================================================ */
type Family =
  | 'Médecine'
  | 'Chirurgie'
  | 'Pédiatrie'
  | 'Imagerie'
  | 'Biologie'
  | 'Pharmacie'
  | 'Odontologie'
  | 'Maïeutique'
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
  { slug: "medecine-d-urgence", name: "Médecine d’urgence", family: "Médecine", Icon: Siren, accent: ACCENTS.red,
    description: "Préparation complète aux EVC en médecine d’urgence : prise en charge des urgences vitales, pathologies aiguës, traumatologie, régulation médicale et protocoles de prise en charge." },
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
  { slug: "medecine-interne", name: "Médecine interne polyvalente", family: "Médecine", Icon: Compass, accent: ACCENTS.navy,
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
  { slug: "odontologie", name: "Odontologie", family: "Odontologie", Icon: Smile, accent: ACCENTS.rose,
    description: "Préparation aux EVC en odontologie : pathologies bucco-dentaires, chirurgie orale, parodontologie et prothèse dentaire." },
  { slug: "orthopedie-dento-faciale", name: "Orthopédie dento-faciale", family: "Odontologie", Icon: Smile, accent: ACCENTS.fuchsia,
    description: "Préparation à l'orthopédie dento-faciale : diagnostic orthodontique, traitement des malocclusions, contention et suivi pluridisciplinaire." },
  { slug: "sage-femme", name: "Sage-femme", family: "Maïeutique", Icon: Baby, accent: ACCENTS.rose,
    description: "Préparation aux EVC sage-femme : suivi de grossesse, accouchement, post-partum, gynécologie de prévention et néonatologie." },
];

const FAMILIES: Family[] = ['Médecine', 'Chirurgie', 'Pédiatrie', 'Imagerie', 'Biologie', 'Pharmacie', 'Odontologie', 'Maïeutique', 'Santé publique'];

/** Libellé affiché des familles quand il diffère du nom interne. */
const FAMILY_LABEL: Partial<Record<Family, string>> = { Biologie: 'Biologie médicale' };

/* ============================================================
   Éléments partagés
   ============================================================ */

/** Marqueur de liste : un filet court, jamais un pictogramme. */
function Puce({ color, className = 'mt-[10px]' }: { color: string; className?: string }) {
  return <span aria-hidden className={`${className} h-px w-3 shrink-0`} style={{ background: color, opacity: 0.8 }} />;
}

/** Pastille d'introduction de section. */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex max-w-full rounded-full px-5 py-2 text-[11px] font-black uppercase tracking-[0.16em] sm:text-[12px]"
      style={{ background: '#FDEDEF', color: RED }}>
      {children}
    </span>
  );
}

/** Logo Major ECN posé sur fond sombre — le vrai logo, jamais un substitut. */
function LogoSombre({ className = 'h-9' }: { className?: string }) {
  return (
    <Image src="/major-ecn-logo.png" alt="Major ECN" width={1024} height={1024}
      className={`${className} w-auto object-contain [filter:brightness(0)_invert(1)]`} />
  );
}

/* ============================================================
   BLOC 1 — Préparations EVC dans toutes les spécialités
   ============================================================ */

const HERO_POINTS = [
  { fort: 'QCM / QROC', suite: 'adaptés à votre voie' },
  { fort: 'Accompagnement', suite: 'personnalisé' },
  { fort: 'Plateforme complète', suite: 'de préparation' },
];

const HERO_STRIP = [
  { fort: 'QCM & QROC adaptés', suite: 'Contenus ciblés et actualisés selon votre spécialité.' },
  { fort: 'Accompagnement personnalisé', suite: 'Une équipe pédagogique à vos côtés tout au long de votre préparation.' },
  { fort: 'Plateforme complète', suite: 'Cours, fiches, cas cliniques, statistiques et suivi de progression.' },
  { fort: 'Préparation jusqu’aux EVC', suite: 'Des entraînements exigeants pour vous mener à la réussite.' },
];

const MOCK_KPIS = [
  { label: 'Ma progression globale', valeur: '72%', note: 'Très bon rythme', sous: '+9% cette semaine', lien: 'Voir mes statistiques', anneau: true },
  { label: 'Révisions à venir', valeur: '14', sous: 'Dans les 7 prochains jours', lien: 'Voir mon planning' },
  { label: 'QCM réalisés', valeur: '1 243', note: '87% de réussite', lien: 'Voir mes QCM' },
  { label: 'Épreuves blanches', valeur: '2 / 4', sous: 'Épreuves complétées', lien: 'Voir mes résultats' },
];

const MOCK_NAV = ['Tableau de bord', 'Mes révisions', 'QCM & QROC', 'Fiches & dossiers', 'Cas cliniques', 'Épreuves blanches', 'Messagerie', 'Mon profil'];

const MOCK_REVISIONS = [
  { t: 'Néphrologie', s: 'QCM – 25 min' },
  { t: 'Cardiologie', s: 'Cas clinique' },
  { t: 'Pharmacologie', s: 'Fiche – 15 min' },
];

const MOCK_THEMES = [
  { t: 'Cardiologie', pct: 40, c: '#C0112E' },
  { t: 'Néphrologie', pct: 25, c: '#7C3AED' },
  { t: 'Pharmacologie', pct: 20, c: '#E8742C' },
  { t: 'Autres', pct: 15, c: '#2563EB' },
];

/** Anneau de progression du tableau de bord d'illustration. */
function Anneau({ pct, couleur, taille = 'h-[68px] w-[68px]' }: { pct: number; couleur: string; taille?: string }) {
  const r = 40, c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 100 100" className={taille} aria-hidden>
      <circle cx="50" cy="50" r={r} fill="none" stroke="#E9EDF5" strokeWidth="12" />
      <circle cx="50" cy="50" r={r} fill="none" stroke={couleur} strokeWidth="12" strokeLinecap="round"
        strokeDasharray={`${c * pct / 100} ${c}`} transform="rotate(-90 50 50)" />
      <text x="50" y="56" textAnchor="middle" fontSize="24" fontWeight="800" fill={NAVY}>{pct}%</text>
    </svg>
  );
}

/** Camembert de répartition par thème. */
function Camembert({ data }: { data: { pct: number; c: string }[] }) {
  const r = 34, c = 2 * Math.PI * r;
  const arcs = data.reduce<{ c: string; len: number; off: number }[]>((acc, d) => {
    const prev = acc[acc.length - 1];
    acc.push({ c: d.c, len: (d.pct / 100) * c, off: prev ? prev.off + prev.len : 0 });
    return acc;
  }, []);
  return (
    <svg viewBox="0 0 100 100" className="h-[88px] w-[88px] shrink-0" aria-hidden>
      {arcs.map((a) => (
        <circle key={a.c} cx="50" cy="50" r={r} fill="none" stroke={a.c} strokeWidth="16"
          strokeDasharray={`${a.len} ${c - a.len}`} strokeDashoffset={-a.off} transform="rotate(-90 50 50)" />
      ))}
    </svg>
  );
}

/** Aperçu de l'espace élève reconstruit en HTML — texte net et vrai logo. */
function MockEspace() {
  return (
    <div className="overflow-hidden rounded-[1.25rem] bg-white" style={{ border: `1px solid ${BORDER}`, boxShadow: '0 50px 120px -60px rgba(15,31,77,0.65)' }}>
      <div className="grid grid-cols-[128px_1fr] sm:grid-cols-[164px_1fr]">
        <div className="flex flex-col px-3 py-5 sm:px-4" style={{ background: NAVY_DEEP }}>
          <LogoSombre className="h-8 self-center sm:h-10" />
          <ul className="mt-6 space-y-1">
            {MOCK_NAV.map((n, i) => (
              <li key={n}
                className={'truncate rounded-lg px-2.5 py-2 text-[10.5px] font-semibold ' + (i === 0 ? 'text-white' : 'text-white/70')}
                style={i === 0 ? { background: 'linear-gradient(90deg,#E4002B 0%,#F97316 100%)' } : undefined}>
                {n}
              </li>
            ))}
          </ul>
          <div className="mt-auto rounded-xl px-3 py-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <p className="text-[10px] font-black text-white">Besoin d’aide&nbsp;?</p>
            <p className="mt-1 text-[9.5px] text-white/65">Contacter l’équipe</p>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-black" style={{ color: NAVY }}>Bonjour, Alice</p>
              <p className="mt-0.5 text-[10.5px]" style={{ color: INK_MUTED }}>Prêt(e) à avancer aujourd’hui&nbsp;? Vous êtes sur la bonne voie.</p>
            </div>
            <span className="hidden rounded-full px-3 py-1.5 text-[10px] sm:inline-flex" style={{ background: SOFT_BG, color: INK_MUTED }}>Rechercher&nbsp;&nbsp;⌘K</span>
            <span className="rounded-lg px-3 py-1.5 text-[10px] font-black text-white" style={{ background: RED }}>Reprendre ma révision</span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5 xl:grid-cols-4">
            {MOCK_KPIS.map((k) => (
              <div key={k.label} className="rounded-xl px-3 py-3" style={{ border: `1px solid ${BORDER}` }}>
                <p className="text-[9.5px] font-black" style={{ color: NAVY }}>{k.label}</p>
                {k.anneau ? (
                  <div className="mt-2 flex items-center gap-2">
                    <Anneau pct={72} couleur="#2563EB" taille="h-12 w-12" />
                    <span>
                      <span className="block text-[9px] font-bold" style={{ color: '#16A34A' }}>{k.note}</span>
                      <span className="block text-[9px]" style={{ color: INK_MUTED }}>{k.sous}</span>
                    </span>
                  </div>
                ) : (
                  <>
                    <p className="mt-2 text-[22px] font-black leading-none tabular-nums" style={{ color: NAVY }}>{k.valeur}</p>
                    <p className="mt-1 text-[9px]" style={{ color: k.note ? '#16A34A' : INK_MUTED }}>{k.note ?? k.sous}</p>
                  </>
                )}
                <p className="mt-2 text-[9px] font-bold" style={{ color: '#2563EB' }}>{k.lien} →</p>
              </div>
            ))}
          </div>

          <div className="mt-2.5 grid grid-cols-1 gap-2.5 lg:grid-cols-3">
            <div className="rounded-xl px-3 py-3" style={{ border: `1px solid ${BORDER}` }}>
              <p className="text-[9.5px] font-black" style={{ color: NAVY }}>Révisions du jour</p>
              <ul className="mt-2.5 space-y-2.5">
                {MOCK_REVISIONS.map((r) => (
                  <li key={r.t}>
                    <p className="text-[10px] font-black" style={{ color: NAVY }}>{r.t}</p>
                    <p className="text-[9px]" style={{ color: INK_MUTED }}>{r.s}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[9px] font-bold" style={{ color: '#2563EB' }}>Voir tout mon planning →</p>
            </div>

            <div className="rounded-xl px-3 py-3" style={{ border: `1px solid ${BORDER}` }}>
              <p className="text-[9.5px] font-black" style={{ color: NAVY }}>Évolution de ma performance</p>
              <svg viewBox="0 0 200 80" className="mt-2 h-20 w-full" aria-hidden>
                <polyline fill="none" stroke={RED} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                  points="8,70 30,52 52,44 74,50 96,30 118,34 140,22 162,10 190,20" />
                {[[8, 70], [30, 52], [52, 44], [74, 50], [96, 30], [118, 34], [140, 22], [162, 10], [190, 20]].map(([x, y]) => (
                  <circle key={`${x}`} cx={x} cy={y} r="2.6" fill={RED} />
                ))}
              </svg>
              <p className="mt-1.5 rounded-md px-2 py-1.5 text-[9px]" style={{ background: SOFT_BG, color: INK_MUTED }}>
                Progression moyenne&nbsp;: +12% sur les 4 dernières semaines
              </p>
            </div>

            <div className="rounded-xl px-3 py-3" style={{ border: `1px solid ${BORDER}` }}>
              <p className="text-[9.5px] font-black" style={{ color: NAVY }}>Répartition par thème</p>
              <div className="mt-2 flex flex-col items-start gap-3 min-[420px]:flex-row min-[420px]:items-center">
                <Camembert data={MOCK_THEMES} />
                <ul className="space-y-1.5">
                  {MOCK_THEMES.map((t) => (
                    <li key={t.t} className="flex items-center gap-1.5 text-[9px]" style={{ color: NAVY }}>
                      <span className="h-2 w-2 rounded-full" style={{ background: t.c }} />
                      {t.t} <span className="tabular-nums" style={{ color: INK_MUTED }}>{t.pct}%</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-2.5 text-[9px] font-black" style={{ color: NAVY }}>Total QCM&nbsp;: 1 243</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpecialitesHero() {
  return (
    <section className="pt-10 sm:pt-14" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-12">
          <Reveal>
            <Eyebrow>Toutes les spécialités EVC (PAE) • PADHUE</Eyebrow>
            <h1 className="mt-6 text-[2.3rem] font-black leading-[1.06] tracking-tight sm:text-[3.2rem]" style={{ letterSpacing: '-0.03em' }}>
              <span className="block" style={{ color: NAVY }}>Préparations EVC</span>
              <span className="block" style={gradientText(GRAD_BURGUNDY)}>dans toutes</span>
              <span className="block" style={gradientText(GRAD_BURGUNDY)}>les spécialités</span>
            </h1>
            <span aria-hidden className="mt-6 block h-1 w-16 rounded-full" style={{ background: RED }} />
            <p className="mt-6 max-w-lg text-[15px] leading-relaxed" style={{ color: INK_SOFT }}>
              Major ECN propose des <strong style={{ color: NAVY }}>préparations EVC</strong> dans
              l’ensemble des spécialités, conçues pour vous accompagner efficacement jusqu’aux épreuves.
            </p>

            <ul className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {HERO_POINTS.map((p) => (
                <li key={p.fort} className="flex items-start gap-3">
                  <Puce color={RED} className="mt-[9px]" />
                  <span className="text-[12.5px] leading-snug" style={{ color: INK_SOFT }}>
                    <span className="block font-black" style={{ color: NAVY }}>{p.fort}</span>
                    {p.suite}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/tarifs"
                className="inline-flex items-center justify-center rounded-xl px-7 py-4 text-[14.5px] font-black tracking-tight text-white transition-transform duration-300 hover:scale-[1.02]"
                style={{ background: `linear-gradient(90deg, ${RED_DEEP} 0%, ${RED} 100%)`, boxShadow: '0 18px 42px -20px rgba(139,14,34,0.65)' }}>
                Démarrer ma préparation
              </Link>
              <Link href="#liste"
                className="inline-flex items-center justify-center rounded-xl bg-white px-7 py-4 text-[14.5px] font-black tracking-tight transition-colors hover:bg-[#F7F8FB]"
                style={{ border: `1.5px solid ${BORDER}`, color: NAVY }}>
                Explorer toutes les spécialités
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.1}><MockEspace /></Reveal>
        </div>

        <Reveal delay={0.15} className="mt-12">
          <div className="grid grid-cols-1 gap-y-6 rounded-[1.25rem] px-7 py-8 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x"
            style={{ background: SOFT_BG, borderColor: BORDER }}>
            {HERO_STRIP.map((h) => (
              <div key={h.fort} className="text-center lg:px-6" style={{ borderColor: BORDER }}>
                <p className="text-[14px] font-black" style={{ color: NAVY }}>{h.fort}</p>
                <p className="mt-2 text-[13px] leading-snug" style={{ color: INK_SOFT }}>{h.suite}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   BLOC 2 — Trouvez votre spécialité
   ============================================================ */

const SPEC_INITIAL_COUNT = 20;

const GRID_STRIP = [
  { fort: 'Inscriptions ouvertes toute l’année', suite: 'Rejoignez-nous quand vous le souhaitez.' },
  { fort: 'Préparations adaptées à votre voie (interne / externe)', suite: 'Un accompagnement sur mesure.' },
  { fort: 'Accompagnement personnalisé', suite: 'Enseignants référents et coaching régulier.' },
  { fort: 'Plateforme complète de préparation', suite: 'Cours, QCM, cas cliniques et suivi de progression.' },
];

/** Spécialités disposant d'une page dédiée (les autres renvoient vers les
    tarifs ou le formulaire de contact). */
const PAGES_DEDIEES = new Set(['medecine-generale', 'chirurgie-orthopedique-et-traumatologie']);

function SpecCard({ s }: { s: Speciality }) {
  const aSaPage = PAGES_DEDIEES.has(s.slug);
  const enrollable = aSaPage || specialtyByName(s.name) != null;
  const href = aSaPage ? `/specialites/${s.slug}` : enrollable ? '/tarifs' : '/contact';
  return (
    <Link href={href}
      className="group flex h-full flex-col rounded-[1.1rem] bg-white px-6 py-6 transition-transform duration-300 hover:-translate-y-1"
      style={{ border: `1px solid ${BORDER}`, boxShadow: '0 24px 60px -58px rgba(15,31,77,0.55)' }}>
      <span aria-hidden className="block h-[3px] w-9 rounded-full" style={{ background: s.accent }} />
      <p className="mt-4 text-[15px] font-black leading-tight tracking-tight" style={{ color: NAVY }}>{s.name}</p>
      <p className="mt-2 flex items-center gap-2 text-[11.5px] font-bold" style={{ color: '#16A34A' }}>
        <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: '#16A34A' }} />
        Inscriptions ouvertes
      </p>
      <p className="mt-3 flex-1 text-[12.5px] leading-relaxed" style={{ color: INK_SOFT }}>{s.description}</p>
      <p className="mt-5 text-[12.5px] font-black tracking-tight" style={{ color: RED }}>
        {aSaPage ? 'Découvrir la préparation' : enrollable ? 'S’inscrire en ligne' : 'Nous contacter pour s’inscrire'} →
      </p>
    </Link>
  );
}

function SpecialitesGrid() {
  const [q, setQ] = useState('');
  const [famille, setFamille] = useState<Family | 'Toutes'>('Toutes');
  const [tout, setTout] = useState(false);

  const filtrees = useMemo(() => {
    const n = normaliser(q.trim());
    return SPECIALITIES.filter((s) => {
      if (famille !== 'Toutes' && s.family !== famille) return false;
      if (n.length < 2) return true;
      return normaliser(`${s.name} ${s.description} ${s.family}`).includes(n);
    });
  }, [q, famille]);

  const cherche = normaliser(q.trim()).length >= 2 || famille !== 'Toutes';
  const visibles = cherche || tout ? filtrees : filtrees.slice(0, SPEC_INITIAL_COUNT);
  const restantes = SPECIALITIES.slice(SPEC_INITIAL_COUNT).map((s) => s.name);

  return (
    <section id="liste" className="py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: SOFT_BG }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            <div>
              <h2 className="text-[1.9rem] font-black tracking-tight sm:text-[2.3rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
                Trouvez votre spécialité
              </h2>
              <p className="mt-4 text-[13.5px] font-black" style={{ color: RED }}>
                Toutes les spécialités EVC / PAE sont proposées par Major ECN.
              </p>
              <p className="mt-1.5 text-[13.5px] leading-relaxed" style={{ color: INK_SOFT }}>
                Recherchez directement la vôtre ou découvrez ci-dessous nos principales préparations.
              </p>
            </div>

            <div>
              <input
                type="search"
                value={q}
                onChange={(e) => { setQ(e.target.value); setTout(false); }}
                placeholder="Rechercher une spécialité..."
                aria-label="Rechercher une spécialité"
                className="w-full rounded-full bg-white px-6 py-4 text-[14px] outline-none transition-shadow focus:ring-2 focus:ring-[#C0112E]/25"
                style={{ border: `1px solid ${BORDER}`, color: NAVY }}
              />
              <div className="mt-4 flex flex-wrap gap-2.5">
                {(['Toutes', ...FAMILIES] as const).map((f) => {
                  const actif = famille === f;
                  return (
                    <button key={f} type="button" onClick={() => { setFamille(f); setTout(false); }}
                      className="rounded-full px-4 py-2 text-[12.5px] font-black tracking-tight transition-colors"
                      style={actif
                        ? { background: RED, color: '#FFFFFF', border: `1px solid ${RED}` }
                        : { background: '#FFFFFF', color: NAVY, border: `1px solid ${BORDER}` }}>
                      {f === 'Toutes' ? 'Toutes' : FAMILY_LABEL[f] ?? f}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.06} className="mt-10">
          <p className="text-[17px] font-black tracking-tight" style={{ color: NAVY }}>
            {cherche ? `${filtrees.length} préparation${filtrees.length > 1 ? 's' : ''}` : 'Nos principales préparations EVC'}
          </p>
        </Reveal>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibles.map((s, i) => (
            <Reveal key={s.slug} delay={Math.min(i, 8) * 0.03}><SpecCard s={s} /></Reveal>
          ))}
          {visibles.length === 0 && (
            <p className="col-span-full rounded-[1.1rem] bg-white px-6 py-10 text-center text-[13.5px]"
              style={{ border: `1px solid ${BORDER}`, color: INK_SOFT }}>
              Aucune spécialité ne correspond à votre recherche. Toutes les spécialités EVC / PAE
              restent proposées&nbsp;: contactez-nous pour la vôtre.
            </p>
          )}
        </div>

        {!cherche && !tout && (
          <Reveal delay={0.1} className="mt-6">
            <div className="rounded-[1.25rem] bg-white px-7 py-8 sm:px-9" style={{ border: `1px solid ${BORDER}` }}>
              <p className="text-[18px] font-black tracking-tight" style={{ color: NAVY }}>
                Vous ne voyez pas encore votre spécialité&nbsp;?
              </p>
              <p className="mt-2 text-[13.5px] font-black" style={{ color: RED }}>
                Major ECN propose des préparations dans toutes les spécialités EVC / PAE.
              </p>
              <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px]" style={{ color: INK_SOFT }}>
                {restantes.map((n, i) => (
                  <span key={n} className="flex items-center gap-3">
                    {i > 0 && <span aria-hidden className="h-1 w-1 rounded-full" style={{ background: RED }} />}
                    {n}
                  </span>
                ))}
                <span className="font-black" style={{ color: NAVY }}>et toutes les autres spécialités.</span>
              </p>
              <button type="button" onClick={() => setTout(true)}
                className="mt-6 inline-flex items-center justify-center rounded-xl px-7 py-3.5 text-[13.5px] font-black tracking-tight text-white transition-transform duration-300 hover:scale-[1.02]"
                style={{ background: `linear-gradient(90deg, ${RED_DEEP} 0%, ${RED} 100%)` }}>
                Voir toutes les spécialités →
              </button>
            </div>
          </Reveal>
        )}

        <Reveal delay={0.14} className="mt-8">
          <div className="grid grid-cols-1 gap-y-5 border-t pt-7 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x" style={{ borderColor: BORDER }}>
            {GRID_STRIP.map((g) => (
              <div key={g.fort} className="lg:px-6" style={{ borderColor: BORDER }}>
                <p className="text-[13px] font-black leading-snug" style={{ color: NAVY }}>{g.fort}</p>
                <p className="mt-1.5 text-[12.5px] leading-snug" style={{ color: INK_SOFT }}>{g.suite}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   BLOC 3 — Quatre piliers
   ============================================================ */

const PILIERS = [
  { n: 1, c: '#C0112E', titre: '+15 ans d’expérience', texte: 'Une préparation affinée année après année pour cibler l’essentiel et maîtriser les exigences des EVC.', chute: '+ de 9 000 médecins accompagnés' },
  { n: 2, c: '#2563EB', titre: 'Enseignants médecins spécialistes', texte: 'Des spécialistes expérimentés et pédagogues pour expliquer, répondre à vos questions et vous guider.', chute: 'Pédagogie • Expérience • Disponibilité' },
  { n: 3, c: '#16793C', titre: 'Préparation ciblée et actualisée', texte: 'Fiches, recommandations, QCM/QROC, annales, cas cliniques et sujets inédits adaptés à votre spécialité et à votre voie.', chute: 'Contenus fiables et mis à jour' },
  { n: 4, c: '#7C3AED', titre: 'Accompagnement jusqu’au jour J', texte: 'Suivi de votre progression, révisions, épreuves blanches, réponses rapides à vos questions et soutien motivationnel : vous êtes accompagné jusqu’aux EVC.', chute: 'Méthode • Suivi • Progression' },
];

const MOCK_ENTRAINEMENT_NAV = ['Accueil', 'Entraînement ciblé', 'Révisions transversales', 'Fiches de cours', 'Cas cliniques', 'Épreuves blanches', 'Statistiques'];

/** Aperçu « Entraînement ciblé » — reconstruit en HTML, avec le vrai logo. */
function MockEntrainement() {
  return (
    <div className="overflow-hidden rounded-[1.25rem] bg-white" style={{ border: `1px solid ${BORDER}`, boxShadow: '0 50px 120px -60px rgba(15,31,77,0.6)' }}>
      <div className="grid grid-cols-[128px_1fr] sm:grid-cols-[178px_1fr]">
        <div className="px-3 py-5 sm:px-4" style={{ background: `linear-gradient(180deg, ${NAVY_DEEP} 0%, #2A1130 100%)` }}>
          <LogoSombre className="h-8 self-center sm:h-10" />
          <ul className="mt-6 space-y-1">
            {MOCK_ENTRAINEMENT_NAV.map((n, i) => (
              <li key={n}
                className={'truncate rounded-lg px-2.5 py-2 text-[10.5px] font-semibold ' + (i === 1 ? 'text-white' : 'text-white/70')}
                style={i === 1 ? { background: 'linear-gradient(90deg,#E4002B 0%,#F97316 100%)' } : undefined}>
                {n}
              </li>
            ))}
          </ul>
          <p className="mt-6 px-2.5 text-[9px] font-black tracking-[0.16em] text-white/40">MES SPÉCIALITÉS</p>
          <ul className="mt-2 space-y-1">
            {[['Médecine générale', '19'], ['Cardiologie', '22']].map(([l, n]) => (
              <li key={l} className="flex items-center justify-between gap-1 rounded-lg px-2.5 py-2 text-[10px] font-semibold text-white/75">
                <span className="truncate">{l}</span>
                <span className="rounded bg-white/10 px-1.5 text-[9px]">{n}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.1em]" style={{ color: RED }}>Entraînement ciblé</p>
          <p className="mt-3 text-[17px] font-black tracking-tight sm:text-[20px]" style={{ color: NAVY }}>
            Travaille en priorité ce que tu rates le plus.
          </p>
          <p className="mt-2.5 text-[11px] leading-relaxed" style={{ color: INK_SOFT }}>
            Une session sur-mesure&nbsp;: les QCM des collèges où tu fais le plus d’erreurs, en commençant
            par les questions échouées le plus souvent. Correction et justification à chaque item.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
            <div>
              <p className="text-[10px]" style={{ color: INK_MUTED }}>Cochez les collèges à inclure dans la session (1/1 sélectionnés)</p>
              <div className="mt-2 flex items-center gap-2.5 rounded-lg px-3 py-2.5" style={{ border: `1px solid rgba(192,17,46,0.35)` }}>
                <span className="h-4 w-4 shrink-0 rounded" style={{ background: RED }} />
                <span className="flex-1 truncate text-[11px] font-black" style={{ color: NAVY }}>Médecine générale</span>
                <span className="shrink-0 rounded-md px-2 py-0.5 text-[9px] font-bold" style={{ background: '#FFF4E8', color: '#B45309' }}>850 QCM · 28 erreurs</span>
              </div>
              <p className="mt-2 rounded-lg px-3 py-2 text-[9.5px]" style={{ background: '#F1EEFE', color: '#5B21B6' }}>
                Session prévue&nbsp;: 12 questions (sur 850 disponibles, plafonnée à 12)
              </p>
              <p className="mt-3 rounded-lg px-3 py-3 text-center text-[12px] font-black text-white"
                style={{ background: 'linear-gradient(90deg,#C0112E 0%,#F97316 100%)' }}>
                Lancer l’entraînement (12 questions)
              </p>
            </div>

            <ul className="space-y-2.5">
              {[
                { v: '12', l: 'questions dans la session', c: '#7C3AED' },
                { v: '18', l: 'questions ratées à revoir', c: '#2563EB' },
                { v: '1', l: 'collèges à renforcer', c: '#16793C' },
              ].map((x) => (
                <li key={x.l} className="rounded-lg px-3 py-2.5" style={{ border: `1px solid ${BORDER}` }}>
                  <p className="text-[17px] font-black leading-none tabular-nums" style={{ color: x.c }}>{x.v}</p>
                  <p className="mt-1 text-[9.5px]" style={{ color: INK_MUTED }}>{x.l}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { t: 'Collèges à renforcer', d: 'Classés par nombre d’erreurs pour cibler tes révisions efficacement.' },
              { t: 'Comment fonctionne la session', d: 'Trois étapes, automatiquement adaptées à ta progression.' },
            ].map((x) => (
              <div key={x.t} className="rounded-lg px-3 py-3" style={{ border: `1px solid ${BORDER}` }}>
                <p className="text-[10.5px] font-black" style={{ color: NAVY }}>{x.t}</p>
                <p className="mt-1 text-[9.5px] leading-snug" style={{ color: INK_MUTED }}>{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function WhyChoose() {
  return (
    <section className="py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-4xl text-center">
          <Eyebrow>Pourquoi choisir Major ECN</Eyebrow>
          <h2 className="mt-5 text-[2rem] font-black leading-[1.1] tracking-tight sm:text-[2.7rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
            Quatre piliers pour vous accompagner
            <br />
            <span style={gradientText(GRAD_BURGUNDY)}>jusqu’aux EVC</span>
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-[15px] leading-relaxed" style={{ color: INK_SOFT }}>
            Quelle que soit votre spécialité, Major ECN associe expérience, expertise médicale,
            outils pédagogiques et accompagnement humain pour vous aider à{' '}
            <strong style={{ color: NAVY }}>travailler efficacement jusqu’au jour J.</strong>
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6 lg:divide-x" style={{ borderColor: BORDER }}>
          {PILIERS.map((p, i) => (
            <Reveal key={p.n} delay={i * 0.06}>
              <div className="lg:px-7 first:lg:pl-0 last:lg:pr-0" style={{ borderColor: BORDER }}>
                <div className="flex items-start gap-3.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[14px] font-black text-white" style={{ background: p.c }}>
                    {p.n}
                  </span>
                  <p className="pt-1 text-[14px] font-black uppercase leading-snug tracking-[0.02em]" style={{ color: NAVY }}>{p.titre}</p>
                </div>
                <p className="mt-4 text-[13.5px] leading-relaxed" style={{ color: INK_SOFT }}>{p.texte}</p>
                <span aria-hidden className="mt-5 block h-[2px] w-10" style={{ background: p.c }} />
                <p className="mt-4 text-[12.5px] font-black" style={{ color: p.c }}>{p.chute}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.12} className="mt-12"><MockEntrainement /></Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   BLOC 4 — Ils témoignent + appel final
   ============================================================ */

const TEMOIGNAGES = [
  { photo: '/temoignages/drsamy.jpg', nom: 'Dr Samy KABAWEH', spec: 'Radiologie', titre: 'Lauréat EVC',
    avant: 'Grâce à la qualité des cours et à la méthodologie enseignée, j’ai abordé les épreuves avec confiance et je suis ', fort: 'lauréat', apres: '.' },
  { photo: '/temoignages/dr-leila-bettaieb.jpg', nom: 'Dr Leila Bettaieb', spec: 'Médecine générale', titre: 'Lauréate EVC',
    avant: 'Une méthode claire, des supports complets et des enseignants disponibles : un ', fort: 'accompagnement précieux', apres: ' tout au long de ma préparation.' },
  { photo: '/temoignages/drbilly.png', nom: 'Dr Bill Baron WANKPO', spec: 'Médecine générale', titre: 'Lauréat EVC',
    avant: 'Une préparation structurée, ciblée et exigeante qui m’a permis de prendre du recul et d’aller ', fort: 'au-delà du concours', apres: '.' },
  { photo: '/temoignages/dr-haykel-abdelbaki.jpg', nom: 'Dr Haykel Abdelbaki', spec: 'Radiologie', titre: 'Lauréat EVC',
    avant: 'Sérieux, exigence, qualité des enseignants et suivi personnalisé : ', fort: 'les clés qui m’ont permis de réussir les EVC', apres: '.' },
];

const CTA_STATS = [
  { fort: '+15 ans d’expérience', suite: 'au service de votre réussite' },
  { fort: '+9 000 médecins accompagnés', suite: 'dans toutes les spécialités' },
  { fort: 'Des lauréats chaque année', suite: 'dans de nombreuses spécialités' },
  { fort: 'Une préparation 100% dédiée', suite: 'aux EVC / PAE' },
];

function MultiSpecTestimonials() {
  return (
    <section className="py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: SOFT_BG }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-4xl text-center">
          <Eyebrow>Ils témoignent</Eyebrow>
          <h2 className="mt-5 text-[2rem] font-black leading-[1.1] tracking-tight sm:text-[2.7rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
            Ils ont préparé les <span style={gradientText(GRAD_BURGUNDY)}>EVC avec Major ECN</span>
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-[15px] leading-relaxed" style={{ color: INK_SOFT }}>
            Des médecins de différentes spécialités partagent leur expérience de la préparation Major ECN.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TEMOIGNAGES.map((t, i) => (
            <Reveal key={t.nom} delay={i * 0.06}>
              <figure className="flex h-full flex-col rounded-[1.25rem] bg-white px-6 py-7" style={{ border: `1px solid ${BORDER}` }}>
                <span aria-hidden className="text-[2.4rem] font-black leading-none" style={{ color: RED_DEEP }}>&ldquo;</span>
                <blockquote className="mt-2 flex-1 text-[13.5px] leading-relaxed" style={{ color: NAVY }}>
                  {t.avant}<strong style={{ color: RED_DEEP }}>{t.fort}</strong>{t.apres}
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3.5 border-t pt-5" style={{ borderColor: BORDER }}>
                  <Image src={t.photo} alt={`${t.nom}, ${t.spec}`} width={112} height={112}
                    className="h-12 w-12 shrink-0 rounded-full object-cover" />
                  <span className="min-w-0">
                    <span className="block truncate text-[13.5px] font-black" style={{ color: NAVY }}>{t.nom}</span>
                    <span className="mt-1 inline-flex rounded-full px-2.5 py-0.5 text-[10.5px] font-bold" style={{ background: '#FDEDEF', color: RED }}>{t.titre}</span>
                    <span className="mt-1 block text-[12px] font-bold" style={{ color: RED }}>{t.spec}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20" style={{ fontFamily: FONT, background: `linear-gradient(105deg, ${NAVY_DEEP} 0%, ${NAVY} 45%, #4A0E1E 100%)` }}>
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <Reveal>
          <span className="inline-flex rounded-full border px-5 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-white/85" style={{ borderColor: 'rgba(255,255,255,0.35)' }}>
            Inscriptions ouvertes
          </span>
          <h2 className="mt-6 text-[2rem] font-black leading-[1.08] tracking-tight text-white sm:text-[2.9rem]" style={{ letterSpacing: '-0.025em' }}>
            Prêt à réussir les EVC
            <br />
            dans <span style={{ color: '#F0C15A' }}>votre spécialité&nbsp;?</span>
          </h2>
          <span aria-hidden className="mx-auto mt-4 block h-[3px] w-24" style={{ background: RED }} />
          <p className="mx-auto mt-6 max-w-2xl text-[15px] leading-relaxed text-white/80">
            Une préparation adaptée à votre spécialité, des <strong className="text-white">enseignants médecins spécialistes</strong>
            {' '}et un <strong className="text-white">accompagnement jusqu’au jour J.</strong>
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/tarifs"
              className="inline-flex items-center justify-center rounded-xl px-8 py-4 text-[14.5px] font-black tracking-tight text-white transition-transform duration-300 hover:scale-[1.02]"
              style={{ background: `linear-gradient(90deg, ${RED_DEEP} 0%, ${RED} 100%)` }}>
              Démarrer ma préparation
            </Link>
            <Link href="/contact"
              className="inline-flex items-center justify-center rounded-xl border px-8 py-4 text-[14.5px] font-black tracking-tight text-white transition-colors hover:bg-white/10"
              style={{ borderColor: 'rgba(255,255,255,0.4)' }}>
              Parler à un conseiller
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.12} className="mt-12">
          <div className="grid grid-cols-1 gap-y-6 border-t pt-8 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-white/15" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
            {CTA_STATS.map((s) => (
              <div key={s.fort} className="lg:px-5">
                <p className="text-[14px] font-black text-white">{s.fort}</p>
                <p className="mt-1.5 text-[12.5px] text-white/70">{s.suite}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   BLOC 5 — Foire aux questions
   ============================================================ */

type Faq = { q: string; a: (string | { liste: string[] } | { fort: string })[] };

/** Texte brut d'une réponse — sert au moteur de recherche. */
function faqTexte(f: Faq) {
  return f.a.map((b) => (typeof b === 'string' ? b : 'liste' in b ? b.liste.join(' ') : b.fort)).join(' ');
}

/** FAQ « Préparation EVC / PAE » — version complète. Les réponses restent
    fermées par défaut ; la recherche porte sur les questions ET sur le texte
    intégral des réponses. */
const FAQ_SPECIALITES: Faq[] = [
  {
    q: 'Major ECN propose-t-il une préparation dans toutes les spécialités EVC / PAE ?',
    a: [
      'Oui. Major ECN propose des préparations aux EVC dans l’ensemble des spécialités concernées.',
      'Nous accompagnons les candidats dans les spécialités médicales et chirurgicales, mais également en odontologie, pharmacie, biologie médicale, maïeutique et dans les autres disciplines concernées par les EVC / PAE.',
      'Médecine générale, médecine d’urgence, gériatrie, médecine interne polyvalente et immunologie clinique, psychiatrie, anesthésie-réanimation, médecine intensive-réanimation, cardiologie, pneumologie, néphrologie, neurologie, endocrinologie et métabolisme, pédiatrie, radiologie et imagerie médicale, chirurgie orthopédique, ophtalmologie, gynécologie-obstétrique, ORL, rhumatologie, dermatologie, gastro-entérologie, urologie, médecine physique et réadaptation, médecine et santé au travail… la préparation couvre l’ensemble des spécialités proposées.',
      { fort: 'Mais proposer toutes les spécialités ne signifie pas proposer la même préparation à tout le monde.' },
      'Chaque spécialité bénéficie de contenus, d’exercices et d’un accompagnement adaptés à ses propres exigences.',
      'Vous pouvez utiliser le moteur de recherche présent sur la page pour retrouver directement votre spécialité et découvrir la préparation correspondante.',
    ],
  },
  {
    q: 'La préparation Major ECN est-elle réellement adaptée à ma spécialité ?',
    a: [
      'Oui. C’est précisément l’un des principes fondamentaux de Major ECN : vous ne suivez pas une préparation EVC générique.',
      'Chaque spécialité possède ses propres connaissances prioritaires, ses recommandations, ses difficultés, ses raisonnements et ses situations cliniques.',
      'Une préparation en cardiologie ne peut donc pas être construite comme une préparation en psychiatrie, en pédiatrie, en radiologie, en chirurgie orthopédique ou en odontologie.',
      'Les contenus sont adaptés à votre discipline : fiches, recommandations françaises, QCM ou QROC, annales corrigées, cas cliniques, dossiers, sujets inédits et entraînements ciblés.',
      'Les enseignements sont également assurés par des médecins spécialistes de la discipline concernée, qui interviennent chez Major ECN depuis de nombreuses années.',
      'Cette expérience permet de vous aider à déterminer :',
      {
        liste: [
          'ce que vous devez absolument maîtriser ;',
          'les items qui doivent être travaillés en priorité ;',
          'jusqu’où approfondir certaines notions ;',
          'les recommandations françaises importantes ;',
          'les difficultés qui reviennent régulièrement ;',
          'les erreurs à éviter ;',
          'et les connaissances susceptibles de faire la différence entre deux candidats.',
        ],
      },
      'L’objectif n’est pas de vous demander d’apprendre toute votre spécialité de manière encyclopédique.',
      'Notre rôle est de vous aider à concentrer votre temps et votre mémoire sur les connaissances réellement importantes pour votre préparation aux EVC.',
    ],
  },
  {
    q: 'Quelle est la différence entre la préparation EVC voie interne et voie externe ?',
    a: [
      'Les connaissances médicales sont fondamentales dans les deux voies, mais la manière dont elles sont évaluées est différente. La préparation doit donc l’être également.',
      { fort: 'Pour la voie interne' },
      'La préparation est notamment orientée vers les QCM.',
      'Il ne suffit pas de connaître son cours. Il faut apprendre à :',
      {
        liste: [
          'analyser précisément l’énoncé ;',
          'comprendre ce qui est réellement demandé ;',
          'examiner chaque proposition ;',
          'identifier les informations discriminantes ;',
          'raisonner selon les recommandations françaises ;',
          'éliminer les propositions incorrectes ;',
          'repérer les formulations susceptibles de constituer un piège ;',
          'et gérer efficacement son temps.',
        ],
      },
      'Même lorsqu’un candidat a déjà travaillé sur des QCM dans son pays d’origine, l’approche française et la manière de raisonner face aux propositions peuvent être différentes.',
      { fort: 'Pour la voie externe' },
      'La préparation porte davantage sur les QROC et les réponses rédactionnelles.',
      'Il faut apprendre à analyser l’énoncé avant même de rédiger.',
      'Certains mots ou certaines informations présents dans la question permettent d’identifier ce que le correcteur recherche réellement.',
      'Il faut ensuite savoir :',
      {
        liste: [
          'sélectionner les mots-clés ;',
          'hiérarchiser sa réponse ;',
          'être suffisamment précis sans perdre de temps ;',
          'connaître les éléments indispensables ;',
          'et ne pas oublier les PMZ (« pas mis = zéro ») lorsqu’ils s’appliquent.',
        ],
      },
      'Un candidat peut avoir compris la situation médicale et pourtant perdre une partie importante des points s’il ne restitue pas ses connaissances de la manière attendue.',
      'Major ECN vous apprend donc non seulement quoi savoir, mais également comment transformer vos connaissances en réponses efficaces le jour J.',
    ],
  },
  {
    q: 'J’ai déjà un bon niveau médical : qu’est-ce que Major ECN peut réellement m’apporter ?',
    a: [
      'Avoir un bon niveau médical et savoir réussir les EVC sont deux choses différentes.',
      'Un médecin peut posséder une excellente expérience clinique et beaucoup de connaissances, mais perdre des points parce qu’il n’a pas identifié précisément ce que l’épreuve attendait de lui.',
      'C’est particulièrement vrai pour les médecins ayant été formés à l’étranger.',
      'Les pratiques, les recommandations, les habitudes de prescription, les formats de QCM et la manière de rédiger une réponse peuvent différer d’un pays à l’autre.',
      'Major ECN vous aide donc à adapter vos connaissances aux exigences des épreuves françaises.',
      'Pour les QCM, il faut notamment apprendre à analyser les propositions, repérer les nuances, comprendre les pièges et raisonner selon les recommandations françaises.',
      'Pour les QROC, il faut savoir analyser l’énoncé, identifier les mots-clés attendus, structurer sa réponse et ne pas oublier les éléments indispensables ou les PMZ.',
      'Mais notre rôle va plus loin.',
      'Nous vous aidons également à déterminer ce qu’il faut réellement apprendre et jusqu’où approfondir.',
      'On peut connaître énormément de choses et pourtant ne pas connaître précisément celles qui permettront de répondre correctement le jour J.',
      'L’objectif est donc de cibler vos révisions, éliminer le superflu, consolider les connaissances essentielles et travailler les points susceptibles de faire la différence.',
      'Enfin, vous disposez d’enseignants auxquels poser vos questions.',
      'Lorsqu’une notion vous bloque, vous n’avez pas besoin de passer plusieurs heures à rechercher seul une réponse parmi différents sites, forums ou documents.',
      'Vous obtenez une explication claire qui vous permet de reprendre rapidement votre travail.',
      'C’est aussi cela, le gain de temps apporté par une préparation structurée.',
    ],
  },
  {
    q: 'Je travaille à l’hôpital et j’ai une vie de famille : puis-je quand même préparer les EVC ?',
    a: [
      'Oui. C’est d’ailleurs la situation de nombreux candidats que nous accompagnons.',
      'Préparer les EVC lorsqu’on travaille, que l’on effectue éventuellement des gardes et que l’on doit gérer une famille est évidemment différent de préparer un concours lorsqu’on est étudiant à temps plein.',
      'La première priorité est donc d’optimiser le temps disponible.',
      'Deux heures de travail parfaitement ciblées peuvent parfois vous faire gagner énormément de temps par rapport à un travail solitaire pendant lequel vous devez d’abord rechercher les bons supports, vérifier les recommandations, essayer de comprendre seul un point difficile puis déterminer ce qui est réellement important.',
      'Major ECN cherche justement à supprimer une grande partie de ce temps perdu.',
      'Les contenus sont sélectionnés et organisés. Les connaissances prioritaires sont identifiées. Les exercices sont disponibles. Et lorsqu’une question vous bloque, vous pouvez solliciter un enseignant.',
      'La plateforme vous permet également de profiter de petites périodes de disponibilité : le matin avant d’aller travailler, entre midi et deux, en soirée, pendant un moment libre ou le week-end.',
      'Fiches, flashcards, QCM, QROC et exercices permettent d’adapter votre travail au temps dont vous disposez.',
      { fort: 'La régularité est cependant essentielle.' },
      'Il vaut souvent mieux travailler régulièrement sur des périodes relativement courtes que d’attendre plusieurs jours pour disposer d’une longue journée de révision.',
      'Au début, les progrès peuvent parfois sembler lents. Mais avec la répétition, l’entraînement et la consolidation progressive des connaissances, les acquis s’accumulent et la progression devient de plus en plus visible.',
      'Major ECN vous apporte l’organisation, les contenus et l’accompagnement.',
      'Votre régularité et votre travail personnel restent ensuite déterminants.',
    ],
  },
  {
    q: 'Je commence tard ma préparation : est-il encore possible de réussir les EVC ?',
    a: [
      'Oui. Commencer tard ne signifie pas nécessairement qu’il est trop tard.',
      'Nous avons déjà accompagné des candidats ayant commencé leur préparation seulement quelques mois avant les épreuves et ayant obtenu de très bons résultats.',
      'Le nombre de mois disponibles ne constitue pas à lui seul la qualité d’une préparation.',
      'Lorsqu’une échéance paraît très éloignée, il est parfois facile de reporter : demain, la semaine prochaine, le mois prochain…',
      'À l’inverse, lorsqu’un candidat dispose de moins de temps mais qu’il est motivé, déterminé, régulier et parfaitement organisé, il peut progresser extrêmement rapidement.',
      'Lorsque le temps est limité, il faut cependant éviter de se disperser.',
      'Il devient essentiel de déterminer :',
      {
        liste: [
          'quels items travailler en premier ;',
          'quelles connaissances sont incontournables ;',
          'quels supports utiliser ;',
          'quels exercices réaliser ;',
          'quelles lacunes corriger en priorité ;',
          'quand apprendre ;',
          'quand s’entraîner ;',
          'quand réviser ;',
          'et ce qu’il est raisonnable de laisser de côté.',
        ],
      },
      'C’est précisément dans ce contexte qu’un accompagnement peut faire gagner énormément de temps.',
      'Major ECN vous aide à hiérarchiser votre travail et à concentrer vos efforts là où ils peuvent avoir le plus d’impact.',
      'Bien entendu, commencer tard ne constitue jamais une garantie de réussite. Le niveau initial, la spécialité, le nombre d’heures disponibles et surtout l’investissement personnel restent déterminants.',
      'Mais un candidat sérieux, régulier et correctement guidé peut réaliser des progrès considérables en quelques semaines ou quelques mois.',
    ],
  },
  {
    q: 'Les contenus et recommandations médicales sont-ils régulièrement actualisés ?',
    a: [
      'Oui. C’est indispensable pour une préparation médicale sérieuse.',
      'Les recommandations évoluent régulièrement et une préparation aux EVC ne peut pas reposer sur des contenus figés pendant plusieurs années.',
      'Les contenus Major ECN sont donc réactualisés au fur et à mesure de l’évolution des recommandations françaises et des bonnes pratiques.',
      'Lorsqu’une recommandation importante évolue dans une spécialité, les contenus concernés peuvent être adaptés afin que les candidats travaillent avec des informations pertinentes pour leur préparation.',
      'Cela concerne notamment les fiches, les enseignements, les corrections, les QCM/QROC et les dossiers lorsque l’évolution d’une recommandation a une incidence sur leur contenu.',
      'C’est particulièrement important pour les médecins ayant été formés dans un autre pays ou ayant interrompu leur pratique pendant plusieurs années.',
      'Une connaissance parfaitement correcte il y a quelques années peut avoir évolué.',
      'Notre objectif est que vous puissiez consacrer votre temps à apprendre et à vous entraîner, plutôt qu’à vérifier en permanence si les informations sur lesquelles vous travaillez sont encore d’actualité.',
    ],
  },
  {
    q: 'Quelle est la différence entre les formations Essentielle, Intensive et Approfondie ?',
    a: [
      'Les trois formules donnent accès à une préparation Major ECN, mais le niveau d’accompagnement et la profondeur du travail sont différents.',
      { fort: 'Formation Essentielle' },
      'La formation Essentielle est destinée au candidat qui souhaite principalement travailler de manière autonome grâce à la plateforme.',
      'Vous disposez notamment de fiches, flashcards, QCM ou QROC selon votre voie, cas cliniques, entraînements et outils de révision et de progression.',
      'La plateforme permet de structurer votre travail, de vous entraîner et de revenir régulièrement sur les connaissances afin de favoriser leur mémorisation.',
      { fort: 'Essentielle = une préparation principalement autonome avec une plateforme complète et structurée.' },
      { fort: 'Formation Intensive' },
      'La formation Intensive associe la plateforme à 18 heures d’enseignement.',
      'Elle est particulièrement adaptée aux candidats qui souhaitent bénéficier d’un accompagnement humain et balayer relativement rapidement les principaux points clés.',
      'Les séances permettent notamment de travailler des rappels de cours, dossiers, exercices, raisonnements et points importants avec les enseignants.',
      'L’objectif est d’avancer rapidement sur un grand nombre de notions prioritaires.',
      'Les cours sont également mis à disposition en replay, ce qui vous permet de revoir les séances ou de les regarder lorsque vous n’avez pas pu assister au direct.',
      { fort: 'Intensive = plateforme + 18 heures de cours pour revoir efficacement les principaux points clés avec les enseignants.' },
      { fort: 'Formation Approfondie' },
      'La formation Approfondie correspond au niveau d’accompagnement pédagogique le plus complet.',
      'L’objectif est de reprendre la préparation de manière beaucoup plus structurée et approfondie, afin de réduire au maximum les angles morts.',
      'Les enseignants reprennent les connaissances fondamentales, les recommandations, les items importants, les difficultés, la méthodologie et les dossiers.',
      'L’idée est de faire un tour très complet de la préparation afin d’éviter, autant que possible, d’arriver le jour J devant un sujet important qui aurait été laissé de côté ou insuffisamment compris.',
      'C’est la formule destinée au candidat qui souhaite mettre toutes les chances de son côté et bénéficier d’un accompagnement humain beaucoup plus important.',
      'Les enseignements sont également disponibles en replay.',
      { fort: 'Approfondie = une préparation très complète et structurée pour réduire au maximum les zones d’incertitude avant les EVC.' },
    ],
  },
  {
    q: 'Puis-je rejoindre la préparation si les cours ont déjà commencé ?',
    a: [
      'Oui. Il n’est pas nécessaire d’avoir rejoint Major ECN dès le premier cours.',
      'Lorsque vous vous inscrivez en cours de préparation, vous accédez aux contenus déjà disponibles sur la plateforme.',
      'Si votre formule comprend des enseignements, les séances déjà dispensées sont disponibles en replay.',
      'Vous pouvez donc reprendre progressivement les cours auxquels vous n’avez pas assisté tout en poursuivant la préparation en cours.',
      'Vous retrouvez également les fiches, flashcards, QCM ou QROC, cas cliniques, annales, dossiers et autres ressources correspondant à votre préparation.',
      'L’objectif n’est toutefois pas nécessairement de regarder immédiatement chaque minute de cours déjà dispensée.',
      'Si l’échéance approche, il faut être stratégique.',
      'Il faut commencer par les connaissances prioritaires, utiliser les replays de manière ciblée et organiser intelligemment le temps restant.',
      'L’équipe et les enseignants peuvent également répondre à vos questions afin que vous ne restiez pas bloqué sur une difficulté.',
      'Vous pouvez donc intégrer Major ECN alors que la préparation a déjà commencé et rattraper progressivement les contenus tout en avançant avec la suite du programme.',
    ],
  },
  {
    q: 'Pourquoi choisir Major ECN pour préparer les EVC ?',
    a: [
      'Choisir Major ECN, ce n’est pas simplement acheter l’accès à une plateforme ou à une banque de QCM.',
      'C’est bénéficier de plus de 15 années d’expérience dans la préparation médicale, associées aujourd’hui à des outils pédagogiques modernes et à un accompagnement humain.',
      'Au fil des années, les cours, supports, exercices et méthodologies ont été travaillés, enrichis et affinés.',
      'Cette expérience permet notamment de mieux identifier :',
      {
        liste: [
          'les connaissances réellement indispensables ;',
          'les points sur lesquels il faut insister ;',
          'les notions qui doivent être approfondies ;',
          'les difficultés régulièrement rencontrées par les candidats ;',
          'la manière de répondre aux différents formats d’épreuves ;',
          'et les éléments susceptibles de faire la différence le jour J.',
        ],
      },
      'Mais l’expérience ne suffit pas.',
      'Nos enseignants sont des médecins spécialistes de leur discipline, dont plusieurs interviennent chez Major ECN depuis de nombreuses années.',
      'Ils sont choisis non seulement pour leurs connaissances, mais également pour leur pédagogie.',
      'Leur rôle est de rendre claires des connaissances parfois complexes, de répondre à vos questions et de vous permettre de comprendre ce qui vous paraissait auparavant difficile.',
      'Major ECN met également à votre disposition tout un environnement de préparation : contenus théoriques, fiches, recommandations actualisées, flashcards, QCM, QROC, annales corrigées, cas cliniques, dossiers et sujets inédits, entraînements, outils de mémorisation, suivi de progression, épreuves blanches, méthodologie et accompagnement.',
      'Lorsqu’une difficulté apparaît, notre rôle est de vous aider à la résoudre rapidement.',
      'Lorsque vous vous dispersez, notre rôle est de vous aider à retrouver les priorités.',
      'Lorsque votre motivation diminue, l’accompagnement humain permet également de vous aider à maintenir une dynamique de travail.',
      'En revanche, nous ne pouvons pas travailler à votre place.',
      { fort: 'Votre travail personnel reste indispensable.' },
      'Notre rôle est de vous éviter de travailler seul, de vous donner les contenus indispensables, de vous montrer la bonne direction, de vous guider, de répondre à vos questions, de vous proposer des exercices ciblés et inédits, de vous transmettre la méthodologie et les astuces utiles, d’organiser votre préparation et de vous accompagner jusqu’au jour J.',
      'Major ECN met ainsi tout en œuvre pour vous permettre de travailler dans les meilleures conditions, progresser efficacement et mettre toutes les chances de votre côté.',
      'La réussite repose alors sur une association indispensable :',
      { fort: 'une préparation très solide + un accompagnement de grande qualité + votre travail personnel.' },
    ],
  },
];

function FaqSection() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<number | null>(null);

  const n = normaliser(q.trim());
  const cherche = n.length >= 2;
  const resultats = useMemo(
    () => (cherche ? FAQ_SPECIALITES.filter((f) => normaliser(`${f.q} ${faqTexte(f)}`).includes(n)) : FAQ_SPECIALITES),
    [cherche, n],
  );

  return (
    <section id="faq" className="py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <Eyebrow>Foire aux questions</Eyebrow>
          <h2 className="mt-5 text-[2rem] font-black leading-[1.1] tracking-tight sm:text-[2.5rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
            Préparation EVC / PAE&nbsp;: <span style={gradientText(GRAD_BURGUNDY)}>vos questions</span>
          </h2>
        </Reveal>

        <Reveal delay={0.06} className="mt-8">
          <input
            type="search"
            value={q}
            onChange={(e) => { setQ(e.target.value); setOpen(null); }}
            placeholder="Rechercher dans les questions et les réponses..."
            aria-label="Rechercher dans la foire aux questions"
            className="w-full rounded-full bg-white px-6 py-4 text-[14px] outline-none transition-shadow focus:ring-2 focus:ring-[#C0112E]/25"
            style={{ border: `1px solid ${BORDER}`, color: NAVY }}
          />
          <p className="mt-2.5 px-2 text-[12px]" style={{ color: INK_MUTED }}>
            {cherche
              ? `${resultats.length} question${resultats.length > 1 ? 's' : ''} sur ${FAQ_SPECIALITES.length}`
              : 'La recherche porte sur les questions et sur le texte complet des réponses.'}
          </p>
        </Reveal>

        <div className="mt-6 space-y-3">
          {resultats.map((f) => {
            const i = FAQ_SPECIALITES.indexOf(f);
            const ouvert = open === i;
            return (
              <div key={f.q} className="overflow-hidden rounded-xl bg-white" style={{ border: `1px solid ${ouvert ? 'rgba(192,17,46,0.28)' : BORDER}` }}>
                <button type="button" onClick={() => setOpen(ouvert ? null : i)} aria-expanded={ouvert}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left sm:px-6">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[12px] font-black tabular-nums"
                    style={{ background: ouvert ? RED : SOFT_BG, color: ouvert ? '#FFFFFF' : INK_MUTED, border: `1px solid ${ouvert ? RED : BORDER}` }}>
                    {i + 1}
                  </span>
                  <span className="flex-1 text-[14.5px] font-black leading-snug tracking-tight" style={{ color: ouvert ? RED : NAVY }}>{f.q}</span>
                  <span aria-hidden className="shrink-0 text-[15px] font-black" style={{ color: ouvert ? RED : INK_MUTED }}>{ouvert ? '−' : '+'}</span>
                </button>
                {ouvert && (
                  <div className="space-y-3.5 px-5 pb-6 pl-16 sm:px-6 sm:pl-[4.5rem]">
                    {f.a.map((b, j) => {
                      if (typeof b === 'string') {
                        return <p key={j} className="text-[13.5px] leading-relaxed" style={{ color: INK_SOFT }}>{b}</p>;
                      }
                      if ('fort' in b) {
                        return <p key={j} className="text-[13.5px] font-black leading-relaxed" style={{ color: NAVY }}>{b.fort}</p>;
                      }
                      return (
                        <ul key={j} className="space-y-2">
                          {b.liste.map((it) => (
                            <li key={it} className="flex items-start gap-3">
                              <Puce color={RED} className="mt-[9px]" />
                              <span className="text-[13.5px] leading-relaxed" style={{ color: INK_SOFT }}>{it}</span>
                            </li>
                          ))}
                        </ul>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          {resultats.length === 0 && (
            <p className="rounded-xl bg-white px-6 py-10 text-center text-[13.5px]" style={{ border: `1px solid ${BORDER}`, color: INK_SOFT }}>
              Aucune question ne correspond à votre recherche.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

/* ============================================================ */

export function SpecialitesPageContent() {
  return (
    <div className="overflow-x-hidden" style={{ background: '#FFFFFF' }}>
      <SpecialitesHero />
      <SpecialitesGrid />
      <WhyChoose />
      <MultiSpecTestimonials />
      <FinalCTA />
      <FaqSection />
    </div>
  );
}

// Mapping collège → ambiance flashcard (couleur pastel + icône lucide).
// Utilisé par flashcard-session pour habiller chaque carte avec une
// identité visuelle distincte. Fallback rouge pour les collèges non
// explicitement listés.
//
// Préparé pour TOUS les collèges EDN — quand les flashcards de Cardiologie,
// Néphrologie etc. seront créées, l'ambiance sera automatiquement appliquée.

import {
  Layers3, type LucideProps,
} from 'lucide-react';
import type { ComponentType } from 'react';
import {
  LungsArt, HeartArt, KidneyArt, StomachArt, BloodCellsArt,
  EarArt, EyeArt, BrainArt, UterusArt, PregnantWomanArt, ChildArt,
  ElderlyArt, HeartbeatArt, VirusArt, ThyroidArt, JointArt,
  HumanBodyArt, PillArt, StethoscopeArt,
} from './organ-illustrations';

/** Type icône compatible Lucide + nos illustrations anatomiques custom. */
type IconComponent = ComponentType<LucideProps>;

export type FlashcardTheme = {
  /** Fond de la zone de carte (clair, ≤ 10 % saturation). */
  bg: string;
  /** Accent (badge collège, halo). */
  accent: string;
  /** Icône organe à fader en arrière-plan (fallback SVG). */
  Icon: IconComponent;
  /** Image client adaptée à la spécialité (prioritaire si présente). */
  image?: string;
};

const THEMES: Record<string, FlashcardTheme> = {
  // Mapping cours → image client (uploadée par l'utilisateur) + couleurs.
  // Le fond `bg` reprend la teinte dominante de l'icône utilisée.
  // Si pas d'image → fallback SVG anatomique.
  'Cardiologie':               { bg: '#FCEAEC', accent: '#C0112E', Icon: HeartArt,           image: '/flashcards-decor/cardio.png' },
  'Pneumologie':               { bg: '#DBEAFE', accent: '#2563EB', Icon: LungsArt,          image: '/flashcards-decor/pneumo.png' },
  'Néphrologie':               { bg: '#DCFCE7', accent: '#16A34A', Icon: KidneyArt,         image: '/flashcards-decor/nephro.png' },
  'Urologie':                  { bg: '#ECFCCB', accent: '#65A30D', Icon: KidneyArt },
  'Gastro-entérologie':        { bg: '#FEF3C7', accent: '#A16207', Icon: StomachArt,        image: '/flashcards-decor/hepato.png' },
  'Gastroentérologie':         { bg: '#FEF3C7', accent: '#A16207', Icon: StomachArt,        image: '/flashcards-decor/hepato.png' },
  'Hépato-gastro':             { bg: '#FEF3C7', accent: '#A16207', Icon: StomachArt,        image: '/flashcards-decor/hepato.png' },
  'Hépato-gastro-entérologie': { bg: '#FEF3C7', accent: '#A16207', Icon: StomachArt,        image: '/flashcards-decor/hepato.png' },
  'Hématologie':               { bg: '#FFE4E6', accent: '#9F1239', Icon: BloodCellsArt,     image: '/flashcards-decor/hematologie.png' },
  'ORL':                       { bg: '#E0F2FE', accent: '#0284C7', Icon: EarArt,            image: '/flashcards-decor/orl.png' },
  'Ophtalmologie':             { bg: '#CFFAFE', accent: '#0891B2', Icon: EyeArt,            image: '/flashcards-decor/ophtalmo.png' },
  'Gériatrie':                 { bg: '#FFEDD5', accent: '#EA580C', Icon: ElderlyArt,        image: '/flashcards-decor/geriatrie.png' },
  'Gynécologie':               { bg: '#FCE7F3', accent: '#DB2777', Icon: UterusArt,         image: '/flashcards-decor/gyneco.png' },
  'Obstétrique':               { bg: '#FCE7F3', accent: '#DB2777', Icon: PregnantWomanArt,  image: '/flashcards-decor/gyneco.png' },
  'Médecine interne':          { bg: '#E2E8F0', accent: '#475569', Icon: HumanBodyArt,      image: '/flashcards-decor/medecine-interne.png' },
  'Médecine générale':         { bg: '#DBEAFE', accent: '#1E40AF', Icon: StethoscopeArt },
  'Infectiologie':             { bg: '#FFE4E6', accent: '#BE123C', Icon: VirusArt,          image: '/flashcards-decor/infectio.png' },
  'Maladies infectieuses':     { bg: '#FFE4E6', accent: '#BE123C', Icon: VirusArt,          image: '/flashcards-decor/infectio.png' },
  'Pédiatrie':                 { bg: '#FCE7F3', accent: '#DB2777', Icon: ChildArt },
  'Endocrinologie':            { bg: '#CCFBF1', accent: '#0F766E', Icon: ThyroidArt },
  'Neurologie':                { bg: '#EDE9FE', accent: '#7C3AED', Icon: BrainArt,          image: '/flashcards-decor/neuro.png' },
  'Psychiatrie':               { bg: '#EDE9FE', accent: '#8B5CF6', Icon: BrainArt,          image: '/flashcards-decor/psychiatrie.png' },
  'Rhumatologie':              { bg: '#FEF3C7', accent: '#D97706', Icon: JointArt },
  'Réanimation':               { bg: '#FEE2E2', accent: '#DC2626', Icon: HeartbeatArt,      image: '/flashcards-decor/reanimation.png' },
  'Reanimation':               { bg: '#FEE2E2', accent: '#DC2626', Icon: HeartbeatArt,      image: '/flashcards-decor/reanimation.png' },
  'Pharmacologie':             { bg: '#EDE9FE', accent: '#6D28D9', Icon: PillArt,           image: '/flashcards-decor/pharmaco.png' },
  'Dermatologie':              { bg: '#FFEDD5', accent: '#EA580C', Icon: HumanBodyArt,      image: '/flashcards-decor/dermato.png' },
};

const DEFAULT_THEME: FlashcardTheme = {
  bg: '#FCEAEC',
  accent: '#C0112E',
  Icon: Layers3 as unknown as IconComponent,
};

export function themeFor(collegeName: string | null | undefined): FlashcardTheme {
  if (!collegeName) return DEFAULT_THEME;
  // Match exact d'abord
  if (THEMES[collegeName]) return THEMES[collegeName];
  // Match permissif : ignore la casse et les diacritiques
  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const target = norm(collegeName);
  for (const [k, v] of Object.entries(THEMES)) {
    if (norm(k) === target) return v;
  }
  return DEFAULT_THEME;
}

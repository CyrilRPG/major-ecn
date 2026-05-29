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
  /** Icône organe à fader en arrière-plan. */
  Icon: IconComponent;
};

const THEMES: Record<string, FlashcardTheme> = {
  // Mapping cours → illustration anatomique détaillée.
  // Chaque cours a SA propre illustration multi-paths (organe ou symbole
  // médical canonique) — beaucoup plus fouillé que des icônes Lucide.
  'Cardiologie':            { bg: '#FDE7E9', accent: '#C0001F', Icon: HeartArt },
  'Pneumologie':            { bg: '#E5F1FF', accent: '#1E4D8B', Icon: LungsArt },
  'Néphrologie':            { bg: '#F1E8FD', accent: '#5B2BB8', Icon: KidneyArt },
  'Urologie':               { bg: '#E5F0FA', accent: '#1F4F88', Icon: KidneyArt },
  'Gastro-entérologie':     { bg: '#E7F6EC', accent: '#16793C', Icon: StomachArt },
  'Gastroentérologie':      { bg: '#E7F6EC', accent: '#16793C', Icon: StomachArt },
  'Hépato-gastro':          { bg: '#E7F6EC', accent: '#16793C', Icon: StomachArt },
  'Hépato-gastro-entérologie': { bg: '#E7F6EC', accent: '#16793C', Icon: StomachArt },
  'Hématologie':            { bg: '#FBE6E6', accent: '#9F1F1F', Icon: BloodCellsArt },
  'ORL':                    { bg: '#FFEAD9', accent: '#A24F00', Icon: EarArt },
  'Ophtalmologie':          { bg: '#E0F2EF', accent: '#0F6F66', Icon: EyeArt },
  'Gériatrie':              { bg: '#EEF6E2', accent: '#3E6F1A', Icon: ElderlyArt },
  'Gynécologie':            { bg: '#FBE4F0', accent: '#8C1A55', Icon: UterusArt },
  'Obstétrique':            { bg: '#FCE7F1', accent: '#8C1A55', Icon: PregnantWomanArt },
  'Médecine interne':       { bg: '#E4ECF8', accent: '#244C8C', Icon: HumanBodyArt },
  // « Médecine générale » : matière conteneur, fallback stéthoscope.
  'Médecine générale':      { bg: '#FFF1E6', accent: '#B35900', Icon: StethoscopeArt },
  // Infectiologie & Maladies infectieuses : virus cluster.
  'Infectiologie':          { bg: '#E7F6EC', accent: '#16793C', Icon: VirusArt },
  'Maladies infectieuses':  { bg: '#E7F6EC', accent: '#16793C', Icon: VirusArt },
  'Pédiatrie':              { bg: '#E7F4F8', accent: '#0E5A75', Icon: ChildArt },
  'Endocrinologie':         { bg: '#F1E8FD', accent: '#5B2BB8', Icon: ThyroidArt },
  'Neurologie':             { bg: '#EDE6F8', accent: '#4C2A8A', Icon: BrainArt },
  'Psychiatrie':            { bg: '#F0E8F8', accent: '#5A2B8E', Icon: BrainArt },
  'Rhumatologie':           { bg: '#F0EDE5', accent: '#6B5B43', Icon: JointArt },
  // Réanimation : ambiance moniteur ECG + rouge marque (intensité, urgence vitale).
  'Réanimation':            { bg: '#FDE7E9', accent: '#C0001F', Icon: HeartbeatArt },
  'Reanimation':            { bg: '#FDE7E9', accent: '#C0001F', Icon: HeartbeatArt },
  // Pharmacologie : pastille ambrée + gélule (PillArt).
  'Pharmacologie':          { bg: '#FCEDD9', accent: '#A85F00', Icon: PillArt },
};

const DEFAULT_THEME: FlashcardTheme = {
  bg: '#FDE7E9',
  accent: '#C0001F',
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

// Mapping collège → ambiance flashcard (couleur pastel + icône lucide).
// Utilisé par flashcard-session pour habiller chaque carte avec une
// identité visuelle distincte. Fallback rouge pour les collèges non
// explicitement listés.
//
// Préparé pour TOUS les collèges EDN — quand les flashcards de Cardiologie,
// Néphrologie etc. seront créées, l'ambiance sera automatiquement appliquée.

import {
  Heart, Activity, Brain, Eye, Ear, Bone, Droplet, Baby,
  Stethoscope, ShieldAlert, Layers3, FlaskConical, Microscope,
  Sparkles, Pill, type LucideIcon,
} from 'lucide-react';

export type FlashcardTheme = {
  /** Fond de la zone de carte (clair, ≤ 10 % saturation). */
  bg: string;
  /** Accent (badge collège, halo). */
  accent: string;
  /** Icône organe à fader en arrière-plan. */
  Icon: LucideIcon;
};

const THEMES: Record<string, FlashcardTheme> = {
  // Disciplines médicales (= cours dans la matière « Médecine générale »).
  // Couleurs alignées sur la maquette de référence.
  'Cardiologie':            { bg: '#FDE7E9', accent: '#C0001F', Icon: Heart },
  'Pneumologie':            { bg: '#E5F1FF', accent: '#1E4D8B', Icon: Activity },
  'Néphrologie':            { bg: '#F1E8FD', accent: '#5B2BB8', Icon: Droplet },
  'Gastro-entérologie':     { bg: '#E7F6EC', accent: '#16793C', Icon: Pill },
  'Gastroentérologie':      { bg: '#E7F6EC', accent: '#16793C', Icon: Pill },
  'Hépato-gastro':          { bg: '#E7F6EC', accent: '#16793C', Icon: Pill },
  'Hématologie':            { bg: '#FBE6E6', accent: '#9F1F1F', Icon: Droplet },
  'Dermatologie':           { bg: '#E0F2EF', accent: '#0F6F66', Icon: Sparkles },
  'ORL':                    { bg: '#FFEAD9', accent: '#A24F00', Icon: Ear },
  'Ophtalmologie':          { bg: '#E0F2EF', accent: '#0F6F66', Icon: Eye },
  'Allergologie':           { bg: '#FFF7DC', accent: '#A65500', Icon: ShieldAlert },
  'Gériatrie':              { bg: '#EEF6E2', accent: '#3E6F1A', Icon: Stethoscope },
  'Gynécologie':            { bg: '#FBE4F0', accent: '#8C1A55', Icon: Sparkles },
  'Obstétrique':            { bg: '#FCE7F1', accent: '#8C1A55', Icon: Baby },
  'Urologie':               { bg: '#E5F0FA', accent: '#1F4F88', Icon: Stethoscope },
  'Médecine interne':       { bg: '#E4ECF8', accent: '#244C8C', Icon: Stethoscope },
  // « Médecine générale » apparaît en tant que matière conteneur :
  // pas de cours portant ce nom — on garde une entrée pour cohérence.
  'Médecine générale':      { bg: '#FFF1E6', accent: '#B35900', Icon: Stethoscope },
  // Maladies infectieuses & Infectiologie partagent le même thème vert.
  'Infectiologie':          { bg: '#E7F6EC', accent: '#16793C', Icon: Microscope },
  'Maladies infectieuses':  { bg: '#E7F6EC', accent: '#16793C', Icon: Microscope },
  'Pédiatrie':              { bg: '#E7F4F8', accent: '#0E5A75', Icon: Baby },
  'Endocrinologie':         { bg: '#F1E8FD', accent: '#5B2BB8', Icon: FlaskConical },
  'Neurologie':             { bg: '#EDE6F8', accent: '#4C2A8A', Icon: Brain },
  'Psychiatrie':            { bg: '#F0E8F8', accent: '#5A2B8E', Icon: Brain },
  'Rhumatologie':           { bg: '#F0EDE5', accent: '#6B5B43', Icon: Bone },
  'Urgences':               { bg: '#FFEED5', accent: '#A65500', Icon: Activity },
  'Cancérologie':           { bg: '#F3E8F8', accent: '#7A2A8E', Icon: Microscope },
  'Oncologie':              { bg: '#F3E8F8', accent: '#7A2A8E', Icon: Microscope },
  'Pharmacologie':          { bg: '#FCEDD9', accent: '#A85F00', Icon: Pill },
};

const DEFAULT_THEME: FlashcardTheme = {
  bg: '#FDE7E9',
  accent: '#C0001F',
  Icon: Layers3,
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

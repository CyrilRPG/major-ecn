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
  // Mapping cours → image client + couleurs.
  // Les valeurs bg / accent sont calibrées sur la teinte dominante détectée
  // dans l'image (analyse Pillow) pour garantir cohérence visuelle.
  'Cardiologie':               { bg: '#F7CACB', accent: '#A53134', Icon: HeartArt,           image: '/flashcards-decor/cardio.png' },
  'Pneumologie':               { bg: '#CADEF7', accent: '#3164A5', Icon: LungsArt,          image: '/flashcards-decor/pneumo.png' },
  'Néphrologie':               { bg: '#F7DFCA', accent: '#A56831', Icon: KidneyArt,         image: '/flashcards-decor/nephro.png' },
  'Urologie':                  { bg: '#F7DFCA', accent: '#A56831', Icon: KidneyArt,         image: '/flashcards-decor/nephro.png' },
  'Gastro-entérologie':        { bg: '#CAF7CE', accent: '#31A53A', Icon: StomachArt,        image: '/flashcards-decor/hepato.png' },
  'Gastroentérologie':         { bg: '#CAF7CE', accent: '#31A53A', Icon: StomachArt,        image: '/flashcards-decor/hepato.png' },
  'Hépato-gastro':             { bg: '#CAF7CE', accent: '#31A53A', Icon: StomachArt,        image: '/flashcards-decor/hepato.png' },
  'Hépato-gastro-entérologie': { bg: '#CAF7CE', accent: '#31A53A', Icon: StomachArt,        image: '/flashcards-decor/hepato.png' },
  'Hématologie':               { bg: '#F7CACF', accent: '#A5313C', Icon: BloodCellsArt,     image: '/flashcards-decor/hematologie.png' },
  'ORL':                       { bg: '#CADCF7', accent: '#315FA5', Icon: EarArt,            image: '/flashcards-decor/orl.png' },
  'Ophtalmologie':             { bg: '#CAF7F3', accent: '#31A59C', Icon: EyeArt,            image: '/flashcards-decor/ophtalmo.png' },
  'Gériatrie':                 { bg: '#CAF7E3', accent: '#31A571', Icon: ElderlyArt,        image: '/flashcards-decor/geriatrie.png' },
  'Gynécologie':               { bg: '#F7CAD3', accent: '#A53149', Icon: UterusArt,         image: '/flashcards-decor/gyneco.png' },
  'Obstétrique':               { bg: '#F7CAD3', accent: '#A53149', Icon: PregnantWomanArt,  image: '/flashcards-decor/gyneco.png' },
  'Médecine interne':          { bg: '#CAF5F7', accent: '#31A0A5', Icon: HumanBodyArt,      image: '/flashcards-decor/medecine-interne.png' },
  'Médecine générale':         { bg: '#DBEAFE', accent: '#1E40AF', Icon: StethoscopeArt },
  'Infectiologie':             { bg: '#E4CAF7', accent: '#7331A5', Icon: VirusArt,          image: '/flashcards-decor/infectio.png' },
  'Maladies infectieuses':     { bg: '#E4CAF7', accent: '#7331A5', Icon: VirusArt,          image: '/flashcards-decor/infectio.png' },
  'Pédiatrie':                 { bg: '#CADEF7', accent: '#3165A5', Icon: ChildArt,          image: '/flashcards-decor/pediatrie.png' },
  'Endocrinologie':            { bg: '#F7DBCA', accent: '#A55C31', Icon: ThyroidArt,        image: '/flashcards-decor/endocrino.png' },
  'Neurologie':                { bg: '#E1CAF7', accent: '#6C31A5', Icon: BrainArt,          image: '/flashcards-decor/neuro.png' },
  'Psychiatrie':               { bg: '#E1CAF7', accent: '#6C31A5', Icon: BrainArt,          image: '/flashcards-decor/neuro.png' },
  'Rhumatologie':              { bg: '#CADDF7', accent: '#3162A5', Icon: JointArt,          image: '/flashcards-decor/rhumato.png' },
  'Réanimation':               { bg: '#CADEF7', accent: '#3165A5', Icon: HeartbeatArt,      image: '/flashcards-decor/reanimation.png' },
  'Reanimation':               { bg: '#CADEF7', accent: '#3165A5', Icon: HeartbeatArt,      image: '/flashcards-decor/reanimation.png' },
  'Pharmacologie':             { bg: '#F7CAD5', accent: '#A5314C', Icon: PillArt,           image: '/flashcards-decor/pharmaco.png' },
  'Dermatologie':              { bg: '#DFCAF7', accent: '#6831A5', Icon: HumanBodyArt,      image: '/flashcards-decor/dermato.png' },
  'Allergologie':              { bg: '#E3CAF7', accent: '#7331A5', Icon: VirusArt,          image: '/flashcards-decor/allergo.png' },
};

const DEFAULT_THEME: FlashcardTheme = {
  bg: '#FCEAEC',
  accent: '#C0112E',
  Icon: Layers3 as unknown as IconComponent,
};

export function themeFor(
  collegeName: string | null | undefined,
  fallbackName?: string | null,
): FlashcardTheme {
  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const tryMatch = (n: string | null | undefined): FlashcardTheme | null => {
    if (!n) return null;
    if (THEMES[n]) return THEMES[n];
    const target = norm(n);
    for (const [k, v] of Object.entries(THEMES)) {
      if (norm(k) === target) return v;
    }
    return null;
  };
  return tryMatch(collegeName) ?? tryMatch(fallbackName) ?? DEFAULT_THEME;
}

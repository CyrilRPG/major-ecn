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
  // bg / accent calibrés sur la teinte dominante de chaque illustration (analyse Pillow).
  'Cardiologie':               { bg: '#FBCCCC', accent: '#840000', Icon: HeartArt,           image: '/flashcards-decor/cardio.png' },
  'Pneumologie':               { bg: '#D8E6F9', accent: '#214980', Icon: LungsArt,          image: '/flashcards-decor/pneumo.png' },
  'Néphrologie':               { bg: '#C2E7D6', accent: '#00572F', Icon: KidneyArt,         image: '/flashcards-decor/nephro.png' },
  'Urologie':                  { bg: '#C2E7D6', accent: '#00572F', Icon: KidneyArt,         image: '/flashcards-decor/urologie.png' },
  'Gastro-entérologie':        { bg: '#E1F4E1', accent: '#3D743F', Icon: StomachArt,        image: '/flashcards-decor/hepato.png' },
  'Gastroentérologie':         { bg: '#E1F4E1', accent: '#3D743F', Icon: StomachArt,        image: '/flashcards-decor/hepato.png' },
  'Hépato-gastro':             { bg: '#E1F4E1', accent: '#3D743F', Icon: StomachArt,        image: '/flashcards-decor/hepato.png' },
  'Hépato-gastro-entérologie': { bg: '#E1F4E1', accent: '#3D743F', Icon: StomachArt,        image: '/flashcards-decor/hepato.png' },
  'Hématologie':               { bg: '#FBD6D9', accent: '#841A23', Icon: BloodCellsArt,     image: '/flashcards-decor/hematologie.png' },
  'ORL':                       { bg: '#D2E2F9', accent: '#103D80', Icon: EarArt,            image: '/flashcards-decor/orl.png' },
  'Ophtalmologie':             { bg: '#D9F3F0', accent: '#28716A', Icon: EyeArt,            image: '/flashcards-decor/ophtalmo.png' },
  'Gériatrie':                 { bg: '#DAF0E7', accent: '#2D6B51', Icon: ElderlyArt,        image: '/flashcards-decor/geriatrie.png' },
  'Gynécologie':               { bg: '#FBD6DF', accent: '#841933', Icon: UterusArt,         image: '/flashcards-decor/gyneco.png' },
  'Obstétrique':               { bg: '#FBD6DF', accent: '#841933', Icon: PregnantWomanArt,  image: '/flashcards-decor/obstetrique.png' },
  // Collège top-level « Gynécologie-obstétrique » (col-gynecologie) : icône +
  // décor de la gynécologie, couleur associée (rose/bordeaux gynéco).
  'Gynécologie-obstétrique':   { bg: '#FBD6DF', accent: '#841933', Icon: UterusArt,         image: '/flashcards-decor/gyneco.png' },
  'Gynécologie obstétrique':   { bg: '#FBD6DF', accent: '#841933', Icon: UterusArt,         image: '/flashcards-decor/gyneco.png' },
  'Gynécologie-Obstétrique':   { bg: '#FBD6DF', accent: '#841933', Icon: UterusArt,         image: '/flashcards-decor/gyneco.png' },
  'Médecine interne':          { bg: '#D8F2F3', accent: '#266E72', Icon: HumanBodyArt,      image: '/flashcards-decor/medecine-interne.png' },
  'Médecine interne polyvalente': { bg: '#D8F2F3', accent: '#266E72', Icon: HumanBodyArt,   image: '/flashcards-decor/medecine-interne.png' },
  'Médecine générale':         { bg: '#DBEAFE', accent: '#1E40AF', Icon: StethoscopeArt,    image: '/flashcards-decor/medecine-generale.png' },
  'Infectiologie':             { bg: '#EFE4F7', accent: '#63437C', Icon: VirusArt,          image: '/flashcards-decor/infectio.png' },
  'Maladies infectieuses':     { bg: '#EFE4F7', accent: '#63437C', Icon: VirusArt,          image: '/flashcards-decor/infectio.png' },
  'Immunologie':               { bg: '#EFE4F7', accent: '#63437C', Icon: VirusArt,          image: '/flashcards-decor/infectio.png' },
  'Pédiatrie':                 { bg: '#DEEBFB', accent: '#315684', Icon: ChildArt,          image: '/flashcards-decor/pediatrie.png' },
  'Endocrinologie':            { bg: '#FBEDE3', accent: '#845D40', Icon: ThyroidArt,        image: '/flashcards-decor/endocrino.png' },
  'Neurologie':                { bg: '#EADEF4', accent: '#583474', Icon: BrainArt,          image: '/flashcards-decor/neuro.png' },
  'Psychiatrie':               { bg: '#DAC9F3', accent: '#2D0073', Icon: BrainArt,          image: '/flashcards-decor/psychiatrie.png' },
  'Rhumatologie':              { bg: '#DDEAFB', accent: '#2F5484', Icon: JointArt,          image: '/flashcards-decor/rhumato.png' },
  'Réanimation':               { bg: '#D1E3FA', accent: '#0D3F81', Icon: HeartbeatArt,      image: '/flashcards-decor/reanimation.png' },
  'Reanimation':               { bg: '#D1E3FA', accent: '#0D3F81', Icon: HeartbeatArt,      image: '/flashcards-decor/reanimation.png' },
  // Collège top-level « Médecine d'urgence » (col-mir) : même ambiance flashcard
  // que la Réanimation de médecine générale (icône + couleur associées). Les
  // anciens libellés « Médecine Intensive-Réanimation » restent référencés :
  // ils peuvent subsister dans des contenus ou des exports antérieurs.
  'Médecine d’urgence':             { bg: '#D1E3FA', accent: '#0D3F81', Icon: HeartbeatArt, image: '/flashcards-decor/reanimation.png' },
  "Médecine d'urgence":             { bg: '#D1E3FA', accent: '#0D3F81', Icon: HeartbeatArt, image: '/flashcards-decor/reanimation.png' },
  'Médecine Intensive-Réanimation': { bg: '#D1E3FA', accent: '#0D3F81', Icon: HeartbeatArt, image: '/flashcards-decor/reanimation.png' },
  'Médecine Intensive Réanimation': { bg: '#D1E3FA', accent: '#0D3F81', Icon: HeartbeatArt, image: '/flashcards-decor/reanimation.png' },
  'Médecine intensive-réanimation': { bg: '#D1E3FA', accent: '#0D3F81', Icon: HeartbeatArt, image: '/flashcards-decor/reanimation.png' },
  'Urgences':                  { bg: '#FBDECC', accent: '#843200', Icon: HeartbeatArt,      image: '/flashcards-decor/urgences.png' },
  'Pharmacologie':             { bg: '#FBE4EA', accent: '#844354', Icon: PillArt,           image: '/flashcards-decor/pharmaco.png' },
  'Dermatologie':              { bg: '#E5DAF0', accent: '#4D2D6C', Icon: HumanBodyArt,      image: '/flashcards-decor/dermato.png' },
  'Allergologie':              { bg: '#E8F5E9', accent: '#527653', Icon: VirusArt,          image: '/flashcards-decor/allergo.png' },
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

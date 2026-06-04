import {
  Activity, Baby, Bone, Brain, Bug, Droplets, Ear, Eye, FlaskConical,
  Hand, Heart, HeartPulse, Layers3, Microscope, Pill, Smile, Stethoscope,
  TestTube, Users, Wind, type LucideIcon,
} from 'lucide-react';

/** Icône + couleur adaptées à chaque spécialité.
 *  Le `bg` est utilisé comme fond pastel ; `accent` est la couleur de l'icône. */
export type SpecialtyTheme = {
  Icon: LucideIcon;
  accent: string;
  bg: string;
};

const FALLBACK: SpecialtyTheme = { Icon: Layers3, accent: '#7C3AED', bg: '#EDE9FE' };

/** Normalise pour matching tolérant (accents/casse). */
function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const MAP: { keys: string[]; theme: SpecialtyTheme }[] = [
  { keys: ['cardiologie', 'cardio'],          theme: { Icon: HeartPulse,    accent: '#C0112E', bg: '#FCEAEC' } },
  { keys: ['pneumologie', 'pneumo'],          theme: { Icon: Wind,          accent: '#2563EB', bg: '#DBEAFE' } },
  { keys: ['nephrologie', 'nephro'],          theme: { Icon: Droplets,      accent: '#16A34A', bg: '#DCFCE7' } },
  { keys: ['neurologie', 'neuro'],            theme: { Icon: Brain,         accent: '#7C3AED', bg: '#EDE9FE' } },
  { keys: ['endocrinologie', 'endocrino', 'diabeto'], theme: { Icon: Activity, accent: '#0F766E', bg: '#CCFBF1' } },
  { keys: ['geriatrie', 'geriatrique'],       theme: { Icon: Users,         accent: '#EA580C', bg: '#FFEDD5' } },
  { keys: ['pediatrie', 'pediatrique'],       theme: { Icon: Baby,          accent: '#DB2777', bg: '#FCE7F3' } },
  { keys: ['hepato', 'gastro'],               theme: { Icon: Microscope,    accent: '#A16207', bg: '#FEF3C7' } },
  { keys: ['infectiologie', 'infectio'],      theme: { Icon: Bug,           accent: '#BE123C', bg: '#FFE4E6' } },
  { keys: ['pharmacologie', 'pharmaco'],      theme: { Icon: Pill,          accent: '#6D28D9', bg: '#EDE9FE' } },
  { keys: ['medecine interne', 'interne'],    theme: { Icon: Stethoscope,   accent: '#475569', bg: '#E2E8F0' } },
  { keys: ['rhumatologie', 'rhumato'],        theme: { Icon: Bone,          accent: '#D97706', bg: '#FEF3C7' } },
  { keys: ['orl'],                            theme: { Icon: Ear,           accent: '#0284C7', bg: '#E0F2FE' } },
  { keys: ['ophtalmologie', 'ophtalmo'],      theme: { Icon: Eye,           accent: '#0891B2', bg: '#CFFAFE' } },
  { keys: ['urologie', 'uro'],                theme: { Icon: TestTube,      accent: '#65A30D', bg: '#ECFCCB' } },
  { keys: ['hematologie', 'hemato'],          theme: { Icon: Droplets,      accent: '#9F1239', bg: '#FFE4E6' } },
  { keys: ['gynecologie', 'gyneco'],          theme: { Icon: Heart,         accent: '#DB2777', bg: '#FCE7F3' } },
  { keys: ['psychiatrie', 'psy'],             theme: { Icon: Smile,         accent: '#8B5CF6', bg: '#EDE9FE' } },
  { keys: ['reanimation', 'rea'],             theme: { Icon: HeartPulse,    accent: '#DC2626', bg: '#FEE2E2' } },
  { keys: ['dermatologie', 'dermato'],        theme: { Icon: Hand,          accent: '#EA580C', bg: '#FFEDD5' } },
  { keys: ['medecine generale', 'medecine'],  theme: { Icon: Stethoscope,   accent: '#1E40AF', bg: '#DBEAFE' } },
];

export function getSpecialtyTheme(courseName: string | null | undefined): SpecialtyTheme {
  if (!courseName) return FALLBACK;
  const n = norm(courseName);
  for (const m of MAP) {
    if (m.keys.some((k) => n.includes(k))) return m.theme;
  }
  return FALLBACK;
}

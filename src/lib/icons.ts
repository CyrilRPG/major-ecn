import {
  Apple, Atom, Baby, BarChart3, Bone, Brain, Bug, Dna, Droplets, Ear, FlaskConical,
  GraduationCap, HeartPulse, HelpCircle, Layers, Microscope, Pill, Stethoscope,
  Syringe, Users, Waves, Wind,
  type LucideIcon,
} from 'lucide-react';

// `Ear` était référencée par col-mg-orl sans figurer dans la map : le collège
// retombait silencieusement sur Stethoscope. Le collège ORL l'utilise aussi.
const map: Record<string, LucideIcon> = {
  Apple, Atom, Baby, BarChart3, Bone, Brain, Bug, Dna, Droplets, Ear, FlaskConical,
  GraduationCap, HeartPulse, Layers, Microscope, Pill, Stethoscope, Syringe,
  Users, Waves, Wind,
};

export function iconFromKey(key: string | null | undefined): LucideIcon {
  if (!key) return Stethoscope;
  return map[key] ?? Stethoscope;
}

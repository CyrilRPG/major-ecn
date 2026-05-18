import {
  Apple, Atom, Baby, BarChart3, Bone, Dna, FlaskConical,
  GraduationCap, HelpCircle, Layers, Microscope, Pill, Users, Waves,
  type LucideIcon,
} from 'lucide-react';

const map: Record<string, LucideIcon> = {
  Apple, Atom, Baby, BarChart3, Bone, Dna, FlaskConical, GraduationCap,
  Layers, Microscope, Pill, Users, Waves,
};

export function iconFromKey(key: string | null | undefined): LucideIcon {
  if (!key) return HelpCircle;
  return map[key] ?? HelpCircle;
}

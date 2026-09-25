import {
  Activity, Apple, Atom, Baby, BarChart3, Bone, Brain, BriefcaseMedical, Bug, Clock, Dna,
  Droplet, Droplets, Ear, Eye, FlaskConical, Flower2, Footprints, GraduationCap, Hand, Heart,
  HeartPulse, Layers, Microscope, PersonStanding, Pill, Radio, Scan, Scissors,
  Smile, Stethoscope, Syringe, Target, Users, Utensils, Waves, Wind,
  type LucideIcon,
} from 'lucide-react';

// `Ear` était référencée par col-mg-orl sans figurer dans la map : le collège
// retombait silencieusement sur Stethoscope. Le collège ORL l'utilise aussi.
// 25/09/2026 : clés des collèges créés pour chaque spécialité de la vitrine
// (Scissors, Radio, Footprints…) et de collèges existants qui retombaient
// eux aussi sur Stethoscope (Activity, Eye, Scan, Clock, Hand…).
const map: Record<string, LucideIcon> = {
  Activity, Apple, Atom, Baby, BarChart3, Bone, Brain, BriefcaseMedical, Bug, Clock, Dna,
  Droplet, Droplets, Ear, Eye, FlaskConical, Flower2, Footprints, GraduationCap, Hand, Heart,
  HeartPulse, Layers, Microscope, PersonStanding, Pill, Radio, Scan, Scissors, Smile,
  Stethoscope, Syringe, Target, Users, Utensils, Waves, Wind,
};

export function iconFromKey(key: string | null | undefined): LucideIcon {
  if (!key) return Stethoscope;
  return map[key] ?? Stethoscope;
}

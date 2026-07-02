'use client';

import {
  Activity, AlertCircle, Award, BadgeCheck, BookMarked, BookOpen, CalendarCheck,
  ClipboardList, Clock, Compass, Flame, GitCommitHorizontal, GraduationCap,
  HeartHandshake, Layers, Lightbulb, Lock, MapPin, Megaphone, Rocket, Ruler, ShieldCheck,
  Stethoscope, Target, TrendingUp, UserCheck, Users, type LucideIcon,
} from 'lucide-react';

const MAP: Record<string, LucideIcon> = {
  Activity, AlertCircle, Award, BadgeCheck, BookMarked, BookOpen, CalendarCheck,
  ClipboardList, Clock, Compass, Flame, GitCommitHorizontal, GraduationCap,
  HeartHandshake, Layers, Lightbulb, Lock, MapPin, Megaphone, Rocket, Ruler, ShieldCheck,
  Stethoscope, Target, TrendingUp, UserCheck, Users,
};

export function DiagIcon({ name, className, strokeWidth }: { name: string; className?: string; strokeWidth?: number }) {
  const Icon = MAP[name] ?? Target;
  return <Icon className={className} strokeWidth={strokeWidth} />;
}

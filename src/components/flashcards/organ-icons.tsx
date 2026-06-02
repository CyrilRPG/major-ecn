// Icônes d'organes anatomiques personnalisées (Lucide n'en propose pas).
// Composants React qui suivent l'API de Lucide : props `className`,
// `strokeWidth`, etc. Utilisées dans flashcard-theme pour donner une
// icône cohérente à chaque cours.

import type { LucideProps } from 'lucide-react';

type IconProps = LucideProps;

const baseProps = (p: IconProps) => ({
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  strokeWidth: p.strokeWidth ?? 2,
  ...p,
});

/** Poumons stylisés — Pneumologie. */
export function Lungs(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M12 4v10" />
      <path d="M12 11c-1.5-2-3.5-3-5-3-1.7 0-2.8 1.2-3 3-.3 2.5-.1 5 .5 7.5.3 1.4 1.6 2 2.9 1.6 1.4-.5 2.6-1.6 3.6-3.1.8-1.2 1-2.6 1-4V11Z" />
      <path d="M12 11c1.5-2 3.5-3 5-3 1.7 0 2.8 1.2 3 3 .3 2.5.1 5-.5 7.5-.3 1.4-1.6 2-2.9 1.6-1.4-.5-2.6-1.6-3.6-3.1-.8-1.2-1-2.6-1-4V11Z" />
    </svg>
  );
}

/** Rein stylisé — Néphrologie / Urologie. */
export function Kidney(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M15.5 3.5c-2.4 0-3.7 1.6-3.5 3.7.2 2.5 2 4 2 6.3 0 2.4-2 4-5 4-1.6 0-3-1-3-2.7 0-1.4 1-2.5 2.4-2.5.4 0 .8.1 1.2.3" />
      <path d="M15.5 3.5c2.4 0 4.5 2 4.5 5.2 0 4.7-3 7.3-5.5 9.3-1.7 1.4-3.4 2.5-5 2.5-2 0-3.5-1.3-3.5-3.2" />
      <circle cx="9" cy="14.5" r="0.7" fill="currentColor" />
    </svg>
  );
}

/** Estomac stylisé — Hépato-gastro-entérologie. */
export function Stomach(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M9 3v3" />
      <path d="M9 6c-3 0-5 2.5-5 6 0 4 2.5 8 7 8 4.5 0 7-3 7-6.5 0-2-1-3.5-2.5-3.5-1.2 0-1.8.8-2.5 1.8-.6.9-1.2 1.7-2 1.7-1.5 0-2-2-2-3.5 0-2.5 1-4 0-4Z" />
    </svg>
  );
}

/** Utérus stylisé — Gynécologie. */
export function Uterus(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M7 3v3c0 5 1.5 8 5 8s5-3 5-8V3" />
      <path d="M7 6c-2 0-3 1.5-3 3" />
      <path d="M17 6c2 0 3 1.5 3 3" />
      <path d="M12 14v6" />
      <path d="M9 20h6" />
    </svg>
  );
}

/** Foie stylisé — Hépato. */
export function Liver(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M4 9c0-3 2-5 6-5 4 0 6 1 9 1 2 0 3 1 3 3 0 5-4 12-10 12C7 20 4 14 4 9Z" />
      <path d="M14 7c-1 2-2 3-4 4" />
    </svg>
  );
}

/** Crâne d'enfant stylisé — alternative Pédiatrie. */
export function ChildHead(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <circle cx="12" cy="9" r="5" />
      <path d="M9 14c-.5 2-1.5 4-1.5 6h9c0-2-1-4-1.5-6" />
      <circle cx="10" cy="8.5" r="0.5" fill="currentColor" />
      <circle cx="14" cy="8.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

/** Œil — pris dans Lucide mais re-styled comme outline organe. */
export { Eye as EyeOrgan } from 'lucide-react';
/** Oreille — idem. */
export { Ear as EarOrgan } from 'lucide-react';

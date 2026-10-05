/**
 * Pictogrammes de la maquette « Mon planning » (trait arrondi, 1,9 px à 24 px),
 * dessinés quand la bibliothèque d'icônes n'a pas l'équivalent exact.
 */
type P = { className?: string; strokeWidth?: number };

/** Trois barres pleines croissantes (onglet Suivi, maîtrise moyenne). */
export function BarsSolid({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <rect x="3.5" y="13" width="4.2" height="8" rx="1.1" /><rect x="9.9" y="8.5" width="4.2" height="12.5" rx="1.1" /><rect x="16.3" y="3.5" width="4.2" height="17.5" rx="1.1" />
    </svg>
  );
}
/** Trois barres au trait (titre du graphique). */
export function BarsOutline({ className, strokeWidth = 2 }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" className={className} aria-hidden>
      <rect x="3" y="12.5" width="4.4" height="8.5" rx="0.6" /><rect x="9.8" y="8" width="4.4" height="13" rx="0.6" /><rect x="16.6" y="3" width="4.4" height="18" rx="0.6" />
    </svg>
  );
}
/** Cible et flèche (objectifs, régularité). */
export function TargetArrow({ className, strokeWidth = 2.2 }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" className={className} aria-hidden>
      <path d="M20.6 9.4a9 9 0 1 1-6-6" /><path d="M16.2 11.4a4.6 4.6 0 1 1-3.6-3.6" />
      <circle cx="11.6" cy="12.4" r="0.9" fill="currentColor" /><path d="M11.6 12.4 20 4" /><path d="M16.6 3.6 20 4l.4 3.4" />
    </svg>
  );
}
/** Cible pleine (KPI « programme réalisé »). */
export function TargetBold({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" className={className} aria-hidden>
      <path d="M20.3 10a8.5 8.5 0 1 1-6.3-6.3" /><path d="M15.9 11.7a4.1 4.1 0 1 1-3.6-3.6" />
      <path d="M12.1 12 19.3 4.8" /><path d="M16.4 4.5 19.4 4.7 19.6 7.6" />
    </svg>
  );
}
/** Camembert entamé (répartition). */
export function PieSlice({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M11 3.1A9 9 0 1 0 20.9 13H11Z" /><path d="M13 1.2V11h9.8A9.9 9.9 0 0 0 13 1.2Z" />
    </svg>
  );
}
/** Croissant de lune plein (jour OFF). */
export function MoonSolid({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M20.2 14.6A8.3 8.3 0 0 1 9.4 3.8a.6.6 0 0 0-.8-.7A9.3 9.3 0 1 0 20.9 15.4a.6.6 0 0 0-.7-.8Z" />
    </svg>
  );
}
/** Guillemet ouvrant typographique. */
export function QuoteMark({ className }: P) {
  return (
    <svg viewBox="0 0 32 24" fill="currentColor" className={className} aria-hidden>
      <path d="M0 24V14.2C0 6.4 4 1.6 11.6 0l1.3 2.6C9 3.9 7 6.6 6.8 10.2H12.6V24Zm18.4 0V14.2C18.4 6.4 22.4 1.6 30 0l1.3 2.6c-3.9 1.3-5.9 4-6.1 7.6H31V24Z" />
    </svg>
  );
}
/** Quatre barres pleines croissantes (KPI « maîtrise moyenne »). */
export function BarsFour({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <rect x="2.5" y="14" width="3.6" height="7" rx="0.9" /><rect x="7.6" y="11" width="3.6" height="10" rx="0.9" /><rect x="12.7" y="7.5" width="3.6" height="13.5" rx="0.9" /><rect x="17.8" y="4" width="3.6" height="17" rx="0.9" />
    </svg>
  );
}

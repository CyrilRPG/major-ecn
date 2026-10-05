import { cn } from '@/lib/utils';
import { planScript, planSerif } from './fonts';
import { LaurelMark } from './laurel';

export { LaurelMark };

/**
 * Identité de l'espace « Mon planning » d'après la maquette : couronne de
 * laurier + « Major ECN », accroche manuscrite sur trait de pinceau.
 */

/** Logo complet : couronne + « Major ECN » + accroche « Plus qu'une préparation, à vos côtés vers l'avenir ». */
export function MajorEcnLogo({ className, size = 'md' }: { className?: string; size?: 'md' | 'sm' }) {
  const sm = size === 'sm';
  return (
    <div className={cn('flex items-center text-[#7d1a2e] dark:text-(--pl-bordeaux)', sm ? 'gap-[7px]' : 'gap-[9px]', className)}>
      <LaurelMark className={sm ? 'h-[44px] w-[48px]' : 'h-[56px] w-[62px]'} />
      <div className="leading-none">
        <p className={cn(planSerif.className, 'font-bold tracking-[-0.01em]', sm ? 'text-[22px]' : 'text-[30px]')}>Major ECN</p>
        <p className={cn('mt-[5px] font-semibold uppercase text-[#5b2a33] dark:text-(--pl-muted)', sm ? 'text-[6.2px] tracking-[0.16em]' : 'text-[8.1px] tracking-[0.155em]')}>
          Plus qu’une préparation,<br />à vos côtés vers l’avenir
        </p>
      </div>
    </div>
  );
}

/** Accroche manuscrite « Discipline aujourd'hui, réussite demain. » sur un trait de pinceau beige. */
export function BrushTagline({ className }: { className?: string }) {
  return (
    <div className={cn('relative flex h-[62px] w-[282px] items-center justify-center', className)} aria-label="Discipline aujourd’hui, réussite demain.">
      <svg viewBox="0 0 282 62" className="absolute inset-0 h-full w-full" aria-hidden="true" preserveAspectRatio="none">
        <defs>
          <filter id="pl-brush" x="-5%" y="-20%" width="110%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035 0.6" numOctaves="2" seed="7" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="9" />
            <feGaussianBlur stdDeviation="0.6" />
          </filter>
        </defs>
        <path filter="url(#pl-brush)" style={{ fill: 'var(--pl-brush)' }} opacity="0.95"
          d="M8 30 C 30 10, 90 8, 150 9 C 205 10, 250 8, 276 18 C 280 26, 274 40, 262 46 C 220 56, 150 55, 95 54 C 55 53, 20 52, 10 44 C 4 39, 4 34, 8 30 Z" />
      </svg>
      <p className={cn(planScript.className, 'relative -rotate-[5deg] text-center text-[25px] leading-[1.05] text-[#2a2328] [-webkit-text-stroke:0.25px_currentColor] dark:text-(--pl-ink)')}>
        Discipline aujourd’hui,<br /><span className="ml-[54px]">réussite demain.</span>
      </p>
    </div>
  );
}

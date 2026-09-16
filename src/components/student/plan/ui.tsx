import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { PRIORITY_TIER_LABEL, REMINDER_SHORT, SESSION_KIND_LABEL, type PriorityTier, type SessionKind } from '@/lib/plan/types';
import { fmtMinutes } from '@/lib/plan/analytics';

/** Éléments d'affichage partagés du planificateur (composants serveur). */

const TIER_VARIANT: Record<PriorityTier, 'danger' | 'warning' | 'primary' | 'muted'> = {
  tres_elevee: 'danger', elevee: 'warning', normale: 'primary', secondaire: 'muted',
};
export function PriorityBadge({ tier }: { tier: PriorityTier | string | null | undefined }) {
  const t = (tier ?? 'normale') as PriorityTier;
  return <Badge variant={TIER_VARIANT[t] ?? 'muted'}>{PRIORITY_TIER_LABEL[t] ?? 'Priorité normale'}</Badge>;
}

const KIND_VARIANT: Record<SessionKind, 'primary' | 'success' | 'warning' | 'outline' | 'muted'> = {
  apprentissage: 'primary', consolidation: 'warning', evaluation: 'success', reactivation: 'outline', revision_finale: 'muted',
};
export function KindBadge({ kind }: { kind: SessionKind }) {
  return <Badge variant={KIND_VARIANT[kind]}>{SESSION_KIND_LABEL[kind]}</Badge>;
}

/** Rappel court, présent sur chaque écran du planning (complément §3). */
export function ProgramReminder({ className }: { className?: string }) {
  return (
    <p className={cn('rounded-lg border border-(--color-border) bg-(--color-surface-soft) px-3 py-2 text-xs text-(--color-ink-soft)', className)}>
      {REMINDER_SHORT}{' '}
      <Link href="/planificateur/programme" className="font-medium text-(--color-primary) underline-offset-4 hover:underline">Voir le programme complet</Link>
    </p>
  );
}

export function Stat({ label, value, hint, className }: { label: string; value: string | number; hint?: string; className?: string }) {
  return (
    <div className={cn('rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-4', className)}>
      <p className="text-xs font-medium text-(--color-ink-muted)">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-(--color-ink)">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-(--color-ink-soft)">{hint}</p>}
    </div>
  );
}

export function MasteryBar({ score, className }: { score: number | null; className?: string }) {
  const v = score === null ? 0 : Math.max(0, Math.min(100, Math.round(score)));
  const color = score === null ? 'bg-(--color-border)' : v >= 80 ? 'bg-emerald-500' : v >= 60 ? 'bg-amber-500' : 'bg-(--color-primary)';
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span className="h-2 w-24 overflow-hidden rounded-full bg-(--color-surface-soft)"><span className={cn('block h-full', color)} style={{ width: `${v}%` }} /></span>
      <span className="text-xs tabular-nums text-(--color-ink-soft)">{score === null ? 'non évalué' : `${v} %`}</span>
    </span>
  );
}

export { fmtMinutes };

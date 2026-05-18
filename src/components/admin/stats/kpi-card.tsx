import { type LucideIcon } from 'lucide-react';

export function KpiCard({
  Icon, label, value, accent = '#0F6E4E', hint,
}: {
  Icon: LucideIcon; label: string; value: string | number; accent?: string; hint?: string;
}) {
  return (
    <div className="surface-card relative overflow-hidden">
      <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-15" style={{ backgroundColor: accent }} aria-hidden />
      <div className="relative flex items-start gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: `color-mix(in srgb, ${accent} 18%, transparent)`, color: accent }}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wider text-(--color-ink-soft) font-medium">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
          {hint && <p className="mt-0.5 text-xs text-(--color-ink-soft)">{hint}</p>}
        </div>
      </div>
    </div>
  );
}

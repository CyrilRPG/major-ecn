'use client';

import * as React from 'react';
import { Download, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fetchAuthentifie } from '@/lib/auth/fresh-token';
import {
  ACTION_STATUS_LABEL, APPOINTMENT_STATUS_LABEL, MEMBER_STATUS_LABEL,
  type ActionStatus, type AppointmentStatus, type MemberStatus,
} from '@/lib/suivi/types';

/** Petits composants partagés du module de suivi. */

export function NativeSelect({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'h-10 w-full rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) px-3 text-sm text-(--color-ink) focus-ring disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn('flex flex-col gap-1.5', className)}>
      <span className="text-sm font-medium text-(--color-ink)">{label}</span>
      {children}
      {hint && <span className="text-xs text-(--color-ink-muted)">{hint}</span>}
    </label>
  );
}

/** Message d'état inline (pas de système de toast dans le dépôt). */
export function InlineStatus({ error, status }: { error?: string | null; status?: string | null }) {
  if (error) return <p className="text-sm text-(--color-danger)" role="alert">{error}</p>;
  if (status) return <p className="text-sm text-emerald-700 dark:text-emerald-300">{status}</p>;
  return null;
}

const APPT_VARIANT: Record<AppointmentStatus, 'primary' | 'success' | 'danger' | 'warning' | 'muted' | 'outline'> = {
  planned: 'primary', done: 'success', no_show: 'danger', cancelled: 'muted', to_recall: 'warning', postponed: 'outline',
};
export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  return <Badge variant={APPT_VARIANT[status] ?? 'muted'}>{APPOINTMENT_STATUS_LABEL[status] ?? status}</Badge>;
}

const MEMBER_VARIANT: Record<MemberStatus, 'primary' | 'success' | 'danger' | 'warning' | 'muted' | 'outline'> = {
  targeted: 'muted', invited: 'outline', booked: 'primary', done: 'success', no_show: 'danger', to_recall: 'warning', unreachable: 'danger', cancelled: 'muted',
};
export function MemberStatusBadge({ status }: { status: MemberStatus }) {
  return <Badge variant={MEMBER_VARIANT[status] ?? 'muted'}>{MEMBER_STATUS_LABEL[status] ?? status}</Badge>;
}

const ACTION_VARIANT: Record<ActionStatus, 'primary' | 'success' | 'muted' | 'warning'> = {
  todo: 'warning', in_progress: 'primary', done: 'success', na: 'muted',
};
export function ActionStatusBadge({ status }: { status: ActionStatus }) {
  return <Badge variant={ACTION_VARIANT[status] ?? 'muted'}>{ACTION_STATUS_LABEL[status] ?? status}</Badge>;
}

export function SpecialtyDot({ color, className }: { color: string; className?: string }) {
  return <span aria-hidden className={cn('inline-block h-2.5 w-2.5 shrink-0 rounded-full', className)} style={{ background: color }} />;
}

/**
 * Téléchargement authentifié (Bearer frais) d'une route d'export : un simple
 * lien enverrait un cookie potentiellement périmé sur une page restée ouverte.
 */
export function DownloadButton({ href, filename, label, variant = 'outline', size = 'sm', disabled }: {
  href: string; filename: string; label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'; size?: 'sm' | 'md'; disabled?: boolean;
}) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  async function run() {
    setBusy(true); setError(null);
    try {
      const res = await fetchAuthentifie(href);
      if (!res.ok) {
        const j = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(j.error ?? `Erreur ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Téléchargement impossible');
    } finally {
      setBusy(false);
    }
  }
  return (
    <span className="inline-flex flex-col gap-1">
      <Button type="button" variant={variant} size={size} onClick={run} disabled={busy || disabled}>
        {busy ? <Loader2 className="animate-spin" /> : <Download />}
        {label}
      </Button>
      {error && <span className="text-xs text-(--color-danger)">{error}</span>}
    </span>
  );
}

export function SectionCard({ title, description, action, children, className, id }: {
  title: string; description?: string; action?: React.ReactNode; children: React.ReactNode; className?: string; id?: string;
}) {
  return (
    <section id={id} className={cn('rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft)', className)}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-(--color-ink)">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-(--color-ink-soft)">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Kpi({ label, value, hint, tone }: { label: string; value: number | string; hint?: string; tone?: 'danger' | 'warning' | 'success' }) {
  const color = tone === 'danger' ? 'text-(--color-danger)' : tone === 'warning' ? 'text-amber-600 dark:text-amber-300' : tone === 'success' ? 'text-emerald-700 dark:text-emerald-300' : 'text-(--color-ink)';
  return (
    <div className="rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-soft)">
      <p className="text-xs font-medium uppercase tracking-wide text-(--color-ink-muted)">{label}</p>
      <p className={cn('mt-1 text-2xl font-semibold tabular-nums', color)}>{value}</p>
      {hint && <p className="mt-0.5 text-xs text-(--color-ink-soft)">{hint}</p>}
    </div>
  );
}

'use client';

import { useState, useTransition } from 'react';
import { AlertTriangle, CheckCircle2, Clock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { resolveAlert } from './actions';

type Alert = {
  id: string;
  user_id: string;
  priority: number;
  motif: string;
  details: Record<string, unknown>;
  created_at: Date;
  resolved_at: string | null;
  resolved_by: string | null;
  studentName: string;
  studentEmail: string;
};

export function AlertsPanel({ alerts: initialAlerts }: { alerts: Alert[] }) {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('pending');
  const [pending, startTransition] = useTransition();

  const filtered = alerts.filter((a) => {
    if (filter === 'pending') return !a.resolved_at;
    if (filter === 'resolved') return !!a.resolved_at;
    return true;
  });

  const handleResolve = (id: string) => {
    startTransition(async () => {
      const res = await resolveAlert(id);
      if (res.ok) {
        setAlerts((prev) =>
          prev.map((a) => a.id === id ? { ...a, resolved_at: new Date().toISOString() } : a),
        );
      }
    });
  };

  return (
    <div>
      <div className="mb-6 flex gap-2">
        {(['pending', 'all', 'resolved'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
              filter === f ? 'bg-(--color-ink) text-white' : 'bg-(--color-surface) text-(--color-ink-soft) hover:bg-(--color-border)',
            )}
          >
            {f === 'pending' ? 'En attente' : f === 'all' ? 'Toutes' : 'Résolues'}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-(--color-border) p-8 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-(--color-ink-muted)" />
          <p className="mt-2 text-sm text-(--color-ink-soft)">Aucune alerte.</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((a) => (
          <div
            key={a.id}
            className={cn(
              'rounded-xl border p-4',
              a.priority === 1 ? 'border-[#A91D2C]/30 bg-[#FCEAEC]/30' : 'border-[#E8742C]/30 bg-[#FFF7E6]/30',
              a.resolved_at && 'opacity-60',
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                  a.priority === 1 ? 'bg-[#A91D2C] text-white' : 'bg-[#E8742C] text-white',
                )}>
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'text-xs font-bold uppercase',
                      a.priority === 1 ? 'text-[#A91D2C]' : 'text-[#E8742C]',
                    )}>
                      Priorité {a.priority}
                    </span>
                    {a.resolved_at && (
                      <span className="flex items-center gap-1 text-xs text-[#16793C]">
                        <CheckCircle2 className="h-3 w-3" /> Résolue
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm font-medium text-(--color-ink)">{a.studentName}</p>
                  <p className="text-xs text-(--color-ink-soft)">{a.studentEmail}</p>
                  <p className="mt-1 text-sm text-(--color-ink-soft)">{a.motif}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-(--color-ink-muted)">
                    <Clock className="h-3 w-3" />
                    {a.created_at.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
              {!a.resolved_at && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => handleResolve(a.id)}
                    disabled={pending}
                  >
                    <CheckCircle2 className="mr-1 h-3 w-3" /> Résoudre
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    asChild
                  >
                    <a href={`mailto:${a.studentEmail}?subject=MAJOR EVC – Suivi pédagogique`}>
                      <Mail className="mr-1 h-3 w-3" /> Contacter
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useState, useTransition } from 'react';
import {
  AlertTriangle, Bell, CheckCircle2, Clock, Mail, Shield, TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { resolveAlert } from './actions';

type Offer = 'essentiel' | 'intensif' | 'approfondi';

type Alert = {
  id: string;
  user_id: string;
  priority: number;
  motif: string;
  offer: Offer | null;
  details: Record<string, unknown>;
  created_at: Date;
  resolved_at: string | null;
  resolved_by: string | null;
  studentName: string;
  studentEmail: string;
};

type Stats = {
  total: number;
  pending: number;
  priority1: number;
  resolved: number;
};

const OFFER_COLORS: Record<Offer, { bg: string; text: string; dot: string }> = {
  essentiel: { bg: '#ECFDF5', text: '#047857', dot: '#10B981' },
  intensif: { bg: '#FFF7ED', text: '#C2410C', dot: '#F97316' },
  approfondi: { bg: '#EDE9FE', text: '#6D28D9', dot: '#8B5CF6' },
};

function StatCard({ icon: Icon, label, value, accent }: {
  icon: typeof Bell; label: string; value: number; accent: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ background: accent }}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs font-medium text-white/70">{label}</p>
      </div>
    </div>
  );
}

export function AlertsPanel({ alerts: initialAlerts, stats }: { alerts: Alert[]; stats: Stats }) {
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
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-10">
      {/* Hero header */}
      <div
        className="relative overflow-hidden rounded-2xl px-6 py-8 sm:px-8 sm:py-10"
        style={{ background: 'linear-gradient(135deg, #1E1145 0%, #C0112E 50%, #E4002B 100%)' }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_80%_120%,rgba(249,115,22,0.2),transparent)]" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Alertes Pédagogiques</h1>
              <p className="text-sm text-white/60">Signaux de suivi des élèves inscrits</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard icon={Bell} label="Total alertes" value={stats.total} accent="rgba(255,255,255,0.15)" />
            <StatCard icon={AlertTriangle} label="En attente" value={stats.pending} accent="rgba(228,0,43,0.5)" />
            <StatCard icon={Shield} label="Priorité critique" value={stats.priority1} accent="rgba(169,29,44,0.7)" />
            <StatCard icon={TrendingUp} label="Résolues" value={stats.resolved} accent="rgba(16,185,129,0.5)" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex items-center gap-2">
        {([
          { key: 'pending' as const, label: 'En attente', count: alerts.filter((a) => !a.resolved_at).length },
          { key: 'all' as const, label: 'Toutes', count: alerts.length },
          { key: 'resolved' as const, label: 'Résolues', count: alerts.filter((a) => !!a.resolved_at).length },
        ]).map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'rounded-full px-4 py-2 text-xs font-bold transition-all',
              filter === f.key
                ? 'bg-gradient-to-r from-[#E4002B] to-[#F97316] text-white shadow-md'
                : 'bg-white text-gray-600 shadow-sm hover:shadow-md',
            )}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Alert cards */}
      <div className="mt-4 space-y-3">
        {filtered.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
            <p className="mt-3 text-sm font-medium text-gray-500">
              {filter === 'pending' ? 'Aucune alerte en attente' : 'Aucune alerte'}
            </p>
          </div>
        )}

        {filtered.map((a) => {
          const isCritical = a.priority === 1;
          const offer = a.offer;
          const oc = offer ? OFFER_COLORS[offer] : null;

          return (
            <div
              key={a.id}
              className={cn(
                'overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md',
                a.resolved_at && 'opacity-60',
              )}
              style={{
                borderLeftWidth: 4,
                borderLeftColor: isCritical ? '#DC2626' : '#F97316',
              }}
            >
              <div className="flex items-start justify-between gap-3 p-5">
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
                    style={{
                      background: isCritical
                        ? 'linear-gradient(135deg, #DC2626, #991B1B)'
                        : 'linear-gradient(135deg, #F97316, #EA580C)',
                    }}
                  >
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                        style={{
                          background: isCritical
                            ? 'linear-gradient(90deg, #DC2626, #991B1B)'
                            : 'linear-gradient(90deg, #F97316, #EA580C)',
                        }}
                      >
                        Priorité {a.priority}
                      </span>
                      {a.resolved_at && (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" /> Résolue
                        </span>
                      )}
                      {oc && (
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                          style={{ background: oc.bg, color: oc.text }}
                        >
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: oc.dot }} />
                          {offer}
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-sm font-semibold text-gray-900">{a.studentName}</p>
                    <p className="text-xs text-gray-500">{a.studentEmail}</p>
                    <p className="mt-2 text-sm text-gray-700">{a.motif}</p>
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      {a.created_at.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                {!a.resolved_at && (
                  <div className="flex shrink-0 gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleResolve(a.id)}
                      disabled={pending}
                      className="text-xs text-white"
                      style={{ background: 'linear-gradient(90deg, #10B981, #059669)' }}
                    >
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Résoudre
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs" asChild>
                      <a href={`mailto:${a.studentEmail}?subject=MAJOR EVC – Suivi pédagogique`}>
                        <Mail className="mr-1 h-3.5 w-3.5" /> Contacter
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

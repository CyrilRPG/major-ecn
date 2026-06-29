'use client';

import { useMemo, useState } from 'react';
import {
  BookOpen, Brain, ChevronDown, ChevronUp, FileText,
  GraduationCap, Search, Users, Video, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type AnyOffer = 'decouverte' | 'essentiel' | 'intensif' | 'approfondi';

export type GeneralStudent = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  offer: AnyOffer;
  colleges: string[];
  videosWatched: number;
  fichesRead: number;
  qcmDone: number;
  flashcardsDone: number;
  lastActivity: string | null;
};

export type GeneralStats = {
  total: number;
  decouverte: number;
  essentiel: number;
  intensif: number;
  approfondi: number;
};

export type College = { id: string; nom: string };

const OFFER_COLORS: Record<AnyOffer, { bg: string; text: string; border: string; dot: string }> = {
  decouverte: { bg: '#F0F9FF', text: '#0369A1', border: '#BAE6FD', dot: '#0EA5E9' },
  essentiel: { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0', dot: '#10B981' },
  intensif: { bg: '#FFF7ED', text: '#C2410C', border: '#FDBA74', dot: '#F97316' },
  approfondi: { bg: '#EDE9FE', text: '#6D28D9', border: '#C4B5FD', dot: '#8B5CF6' },
};

function OfferBadge({ offer }: { offer: AnyOffer }) {
  const c = OFFER_COLORS[offer];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.dot }} />
      {offer}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: typeof Users; label: string; value: number; color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ background: color }}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs font-medium text-white/70">{label}</p>
      </div>
    </div>
  );
}

function MetricPill({ icon: Icon, label, value, color }: {
  icon: typeof Video; label: string; value: number; color: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
      <Icon className="h-4 w-4 shrink-0" style={{ color }} />
      <div>
        <p className="text-sm font-bold text-gray-900">{value}</p>
        <p className="text-[10px] text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return 'Hier';
  return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
}

export function CrmGeneral({
  students,
  stats,
  colleges,
}: {
  students: GeneralStudent[];
  stats: GeneralStats;
  colleges: College[];
}) {
  const [search, setSearch] = useState('');
  const [offerFilter, setOfferFilter] = useState<AnyOffer | 'all'>('all');
  const [collegeFilter, setCollegeFilter] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      if (offerFilter !== 'all' && s.offer !== offerFilter) return false;
      if (collegeFilter !== 'all' && !s.colleges.includes(collegeFilter)) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          (s.first_name ?? '').toLowerCase().includes(q) ||
          (s.last_name ?? '').toLowerCase().includes(q) ||
          (s.email ?? '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [students, offerFilter, collegeFilter, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aTotal = a.videosWatched + a.fichesRead + a.qcmDone + a.flashcardsDone;
      const bTotal = b.videosWatched + b.fichesRead + b.qcmDone + b.flashcardsDone;
      if (aTotal !== bTotal) return bTotal - aTotal;
      return (a.last_name ?? '').localeCompare(b.last_name ?? '');
    });
  }, [filtered]);

  const collegeMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of colleges) m.set(c.id, c.nom);
    return m;
  }, [colleges]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-10">
      {/* Hero */}
      <div
        className="relative overflow-hidden rounded-2xl px-6 py-8 sm:px-8 sm:py-10"
        style={{ background: 'linear-gradient(135deg, #1E1145 0%, #E4002B 50%, #F97316 100%)' }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_120%,rgba(255,255,255,0.08),transparent)]" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Vue Générale</h1>
              <p className="text-sm text-white/60">Progression de tous les élèves</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <StatCard icon={Users} label="Total" value={stats.total} color="rgba(255,255,255,0.15)" />
            <StatCard icon={Users} label="Découverte" value={stats.decouverte} color="rgba(14,165,233,0.5)" />
            <StatCard icon={Users} label="Essentiel" value={stats.essentiel} color="rgba(16,185,129,0.5)" />
            <StatCard icon={Users} label="Intensif" value={stats.intensif} color="rgba(249,115,22,0.5)" />
            <StatCard icon={Users} label="Approfondi" value={stats.approfondi} color="rgba(139,92,246,0.5)" />
          </div>
        </div>
      </div>

      {/* Offer filter pills */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setOfferFilter('all')}
          className={cn(
            'rounded-full px-4 py-2 text-xs font-bold transition-all',
            offerFilter === 'all'
              ? 'bg-gradient-to-r from-[#E4002B] to-[#F97316] text-white shadow-md'
              : 'bg-white text-gray-600 shadow-sm hover:shadow-md',
          )}
        >
          Tous ({stats.total})
        </button>
        {(['decouverte', 'essentiel', 'intensif', 'approfondi'] as const).map((o) => {
          const c = OFFER_COLORS[o];
          return (
            <button
              key={o}
              onClick={() => setOfferFilter(offerFilter === o ? 'all' : o)}
              className={cn(
                'rounded-full px-4 py-2 text-xs font-bold transition-all',
                offerFilter === o ? 'shadow-md ring-2' : 'shadow-sm hover:shadow-md',
              )}
              style={{
                background: offerFilter === o ? c.bg : '#fff',
                color: c.text,
                ...(offerFilter === o ? { ringColor: c.border } : {}),
              }}
            >
              <span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ background: c.dot }} />
              {o.charAt(0).toUpperCase() + o.slice(1)} ({stats[o]})
            </button>
          );
        })}
      </div>

      {/* College filter + Search */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <select
          value={collegeFilter}
          onChange={(e) => setCollegeFilter(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition-shadow focus:shadow-md focus:ring-2 focus:ring-[#E4002B]/20 sm:w-72"
        >
          <option value="all">Tous les collèges</option>
          {colleges
            .filter((c) => c.id !== 'col-decouverte')
            .map((c) => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
        </select>
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un élève par nom ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm shadow-sm outline-none transition-shadow focus:shadow-md focus:ring-2 focus:ring-[#E4002B]/20"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-gray-100"
            >
              <X className="h-3.5 w-3.5 text-gray-400" />
            </button>
          )}
        </div>
      </div>
      <p className="mt-2 text-xs text-gray-500">
        {sorted.length} élève{sorted.length > 1 ? 's' : ''} affiché{sorted.length > 1 ? 's' : ''}
      </p>

      {/* Student list */}
      <div className="mt-4 space-y-3">
        {sorted.map((s) => {
          const isExpanded = expanded === s.id;
          const oc = OFFER_COLORS[s.offer];
          const totalActivity = s.videosWatched + s.fichesRead + s.qcmDone + s.flashcardsDone;

          return (
            <div
              key={s.id}
              className="overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md"
              style={{ borderLeftWidth: 4, borderLeftColor: oc.dot }}
            >
              <button
                onClick={() => setExpanded(isExpanded ? null : s.id)}
                className="flex w-full items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${oc.dot}, ${oc.text})` }}
                  >
                    {(s.first_name?.[0] ?? '').toUpperCase()}
                    {(s.last_name?.[0] ?? '').toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {s.first_name} {s.last_name}
                      </p>
                      <OfferBadge offer={s.offer} />
                    </div>
                    <p className="truncate text-xs text-gray-500">{s.email ?? '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {totalActivity === 0 && (
                    <span className="hidden rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500 sm:inline-block">
                      Aucune activité
                    </span>
                  )}
                  {totalActivity > 0 && s.lastActivity && (
                    <span className="hidden text-xs text-gray-400 sm:inline-block">
                      {formatRelative(s.lastActivity)}
                    </span>
                  )}
                  <div className="hidden items-center gap-3 sm:flex">
                    <span className="flex items-center gap-1 text-xs text-gray-600">
                      <Video className="h-3 w-3 text-blue-500" /> {s.videosWatched}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-600">
                      <FileText className="h-3 w-3 text-emerald-500" /> {s.fichesRead}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-600">
                      <BookOpen className="h-3 w-3 text-orange-500" /> {s.qcmDone}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-600">
                      <Brain className="h-3 w-3 text-purple-500" /> {s.flashcardsDone}
                    </span>
                  </div>
                  {isExpanded
                    ? <ChevronUp className="h-4 w-4 text-gray-400" />
                    : <ChevronDown className="h-4 w-4 text-gray-400" />}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-100 px-4 py-5">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <MetricPill icon={Video} label="Vidéos vues" value={s.videosWatched} color="#3B82F6" />
                    <MetricPill icon={FileText} label="Fiches lues" value={s.fichesRead} color="#10B981" />
                    <MetricPill icon={BookOpen} label="QCM terminés" value={s.qcmDone} color="#F97316" />
                    <MetricPill icon={Brain} label="Flashcards" value={s.flashcardsDone} color="#8B5CF6" />
                  </div>
                  {s.lastActivity ? (
                    <p className="mt-3 text-xs text-gray-500">
                      Dernière activité : {formatRelative(s.lastActivity)}
                      {' — '}
                      {new Date(s.lastActivity).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'long', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  ) : (
                    <p className="mt-3 text-xs text-gray-400">Aucune activité enregistrée</p>
                  )}
                  <div className="mt-3">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                      Collèges accessibles
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {s.colleges.map((cid) => (
                        <span key={cid} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                          {collegeMap.get(cid) ?? cid.replace('col-', '').replace(/-/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {sorted.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
            <Users className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm font-medium text-gray-500">Aucun élève trouvé</p>
            <p className="mt-1 text-xs text-gray-400">Modifiez vos critères de recherche</p>
          </div>
        )}
      </div>
    </div>
  );
}

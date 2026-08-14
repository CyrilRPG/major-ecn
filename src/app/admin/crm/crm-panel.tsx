'use client';

import { useState, useTransition } from 'react';
import {
  AlertTriangle, Calendar, ChevronDown, ChevronUp, Clock, GraduationCap,
  Mail, MessageSquare, Phone, Plus, Search, ShieldAlert, TrendingDown,
  User, Users, Video, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { addNote } from './actions';

type Note = {
  id: string;
  user_id: string;
  contact_type: string;
  motif: string;
  observations: string | null;
  difficultes: string | null;
  actions_recommandees: string | null;
  relance_date: string | null;
  created_at: string;
};

type Offer = 'essentiel' | 'intensif' | 'approfondi';

type Student = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  promotion: string | null;
  offer: Offer;
  lastRevision: Date | null;
  revisions30d: number;
  alertsPending: number;
  redSpecs: number;
  orangeSpecs: number;
  epreuvesBlanches: number;
  lastSignIn: Date | null;
  notes: Note[];
};

type Stats = {
  total: number;
  essentiel: number;
  intensif: number;
  approfondi: number;
  alertsPending: number;
  redSpecs: number;
  inactive30d: number;
};

const OFFER_COLORS: Record<Offer, { bg: string; text: string; border: string; dot: string }> = {
  essentiel: { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0', dot: '#10B981' },
  intensif: { bg: '#FFF7ED', text: '#C2410C', border: '#FDBA74', dot: '#F97316' },
  approfondi: { bg: '#EDE9FE', text: '#6D28D9', border: '#C4B5FD', dot: '#8B5CF6' },
};

const CONTACT_TYPES = [
  { value: 'telephone', label: 'Téléphone', Icon: Phone },
  { value: 'visio', label: 'Visio', Icon: Video },
  { value: 'email', label: 'Email', Icon: Mail },
  { value: 'whatsapp', label: 'WhatsApp', Icon: MessageSquare },
];

function OfferBadge({ offer }: { offer: Offer }) {
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

function StatCard({ icon: Icon, label, value, color, sub }: {
  icon: typeof Users; label: string; value: number; color: string; sub?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ background: color }}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs font-medium text-white/70">{label}</p>
        {sub && <p className="text-[10px] text-white/50">{sub}</p>}
      </div>
    </div>
  );
}

export function CrmPanel({ students: initialStudents, stats }: { students: Student[]; stats: Stats }) {
  const [search, setSearch] = useState('');
  const [offerFilter, setOfferFilter] = useState<Offer | 'all'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<string | null>(null);
  const [students, setStudents] = useState(initialStudents);

  const filtered = students.filter((s) => {
    if (offerFilter !== 'all' && s.offer !== offerFilter) return false;
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      (s.first_name ?? '').toLowerCase().includes(q) ||
      (s.last_name ?? '').toLowerCase().includes(q) ||
      (s.email ?? '').toLowerCase().includes(q)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    if (a.alertsPending !== b.alertsPending) return b.alertsPending - a.alertsPending;
    if (a.redSpecs !== b.redSpecs) return b.redSpecs - a.redSpecs;
    return (a.last_name ?? '').localeCompare(b.last_name ?? '');
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-10">
      {/* Hero header */}
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
              <h1 className="text-2xl font-bold text-white">CRM Pédagogique</h1>
              <p className="text-sm text-white/60">Suivi personnalisé des élèves inscrits</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard icon={Users} label="Élèves inscrits" value={stats.total} color="rgba(255,255,255,0.15)" />
            <StatCard icon={AlertTriangle} label="Alertes en attente" value={stats.alertsPending} color="rgba(228,0,43,0.5)" />
            <StatCard icon={ShieldAlert} label="Spé. rouges" value={stats.redSpecs} color="rgba(169,29,44,0.6)" />
            <StatCard icon={TrendingDown} label="Inactifs > 30j" value={stats.inactive30d} color="rgba(249,115,22,0.5)" />
          </div>
        </div>
      </div>

      {/* Offer breakdown pills */}
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
        {(['essentiel', 'intensif', 'approfondi'] as const).map((o) => {
          const c = OFFER_COLORS[o];
          const count = stats[o];
          return (
            <button
              key={o}
              onClick={() => setOfferFilter(offerFilter === o ? 'all' : o)}
              className={cn(
                'rounded-full px-4 py-2 text-xs font-bold transition-all',
                offerFilter === o
                  ? 'shadow-md ring-2'
                  : 'shadow-sm hover:shadow-md',
              )}
              style={{
                background: offerFilter === o ? c.bg : '#fff',
                color: c.text,
                ...(offerFilter === o ? { ringColor: c.border } : {}),
              }}
            >
              <span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ background: c.dot }} />
              {o.charAt(0).toUpperCase() + o.slice(1)} ({count})
            </button>
          );
        })}
      </div>

      {/* Search bar */}
      <div className="mt-4">
        <div className="relative">
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
        <p className="mt-2 text-xs text-gray-500">
          {sorted.length} élève{sorted.length > 1 ? 's' : ''} affiché{sorted.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Students list */}
      <div className="mt-4 space-y-3">
        {sorted.map((s) => (
          <StudentCard
            key={s.id}
            student={s}
            isExpanded={expanded === s.id}
            showNoteForm={showForm === s.id}
            onToggle={() => setExpanded(expanded === s.id ? null : s.id)}
            onToggleForm={() => setShowForm(showForm === s.id ? null : s.id)}
            onNoteAdded={(note) => {
              setStudents((prev) =>
                prev.map((st) => st.id === s.id ? { ...st, notes: [note, ...st.notes] } : st),
              );
              setShowForm(null);
            }}
          />
        ))}
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

function StudentCard({
  student: s, isExpanded, showNoteForm, onToggle, onToggleForm, onNoteAdded,
}: {
  student: Student;
  isExpanded: boolean;
  showNoteForm: boolean;
  onToggle: () => void;
  onToggleForm: () => void;
  onNoteAdded: (n: Note) => void;
}) {
  const daysSince = s.lastRevision
    ? Math.floor((Date.now() - s.lastRevision.getTime()) / 86_400_000)
    : null;

  const isInactive = daysSince === null || daysSince > 30;
  const offerColor = OFFER_COLORS[s.offer];

  return (
    <div
      className="overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md"
      style={{ borderLeftWidth: 4, borderLeftColor: offerColor.dot }}
    >
      <button onClick={onToggle} className="flex w-full items-center justify-between p-4 text-left">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ background: `linear-gradient(135deg, ${offerColor.dot}, ${offerColor.text})` }}
          >
            {(s.first_name?.[0] ?? '').toUpperCase()}{(s.last_name?.[0] ?? '').toUpperCase()}
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
          {s.alertsPending > 0 && (
            <span className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold"
              style={{ background: '#FEE2E2', color: '#DC2626' }}>
              <AlertTriangle className="h-3 w-3" /> {s.alertsPending}
            </span>
          )}
          {s.redSpecs > 0 && (
            <span className="rounded-full px-2 py-1 text-xs font-bold"
              style={{ background: '#FEE2E2', color: '#DC2626' }}>
              {s.redSpecs} rouge{s.redSpecs > 1 ? 's' : ''}
            </span>
          )}
          {s.orangeSpecs > 0 && (
            <span className="rounded-full px-2 py-1 text-xs font-bold"
              style={{ background: '#FFF7ED', color: '#EA580C' }}>
              {s.orangeSpecs} orange{s.orangeSpecs > 1 ? 's' : ''}
            </span>
          )}
          <span className={cn(
            'hidden rounded-full px-2 py-1 text-xs font-medium sm:inline-block',
            isInactive ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700',
          )}>
            {s.revisions30d} rév./30j
          </span>
          {isExpanded
            ? <ChevronUp className="h-4 w-4 text-gray-400" />
            : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-100 px-4 py-5">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <InfoCell label="Dernière connexion" value={
              s.lastSignIn
                ? new Date(s.lastSignIn).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
                : 'Jamais'
            } warn={!s.lastSignIn} />
            <InfoCell label="Dernière révision" value={
              s.lastRevision
                ? `Il y a ${daysSince} jour${daysSince !== 1 ? 's' : ''}`
                : 'Jamais'
            } warn={isInactive} />
            {/* Seuil du cahier des charges : alerte P2 sous 15 révisions / 30 j. */}
            <InfoCell label="Révisions / 30j" value={String(s.revisions30d)} warn={s.revisions30d < 15} />
            <InfoCell label="Épreuves blanches réalisées" value={String(s.epreuvesBlanches)} warn={s.epreuvesBlanches === 0} />
            <InfoCell label="Promotion" value={s.promotion ?? '—'} />
            <InfoCell label="Téléphone" value={s.phone ?? '—'} />
          </div>

          <div className="mt-5 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Historique des contacts ({s.notes.length})
            </p>
            <Button
              size="sm"
              onClick={onToggleForm}
              className="text-xs text-white"
              style={{ background: 'linear-gradient(90deg, #E4002B, #F97316)' }}
            >
              <Plus className="mr-1 h-3 w-3" /> Nouvelle note
            </Button>
          </div>

          {showNoteForm && <NoteForm userId={s.id} onSaved={onNoteAdded} onCancel={onToggleForm} />}

          {s.notes.length === 0 && !showNoteForm && (
            <p className="mt-3 text-xs text-gray-400">Aucun contact enregistré.</p>
          )}
          {s.notes.map((n) => (
            <NoteCard key={n.id} note={n} />
          ))}
        </div>
      )}
    </div>
  );
}

function InfoCell({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">{label}</p>
      <p className={cn('mt-0.5 text-sm font-semibold', warn ? 'text-red-600' : 'text-gray-900')}>
        {value}
      </p>
    </div>
  );
}

function NoteCard({ note: n }: { note: Note }) {
  const typeLabel = CONTACT_TYPES.find((ct) => ct.value === n.contact_type)?.label ?? n.contact_type;
  return (
    <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50/50 p-4">
      <div className="flex items-center gap-2">
        <Calendar className="h-3.5 w-3.5 text-gray-400" />
        <span className="text-xs text-gray-500">
          {new Date(n.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
          style={{ background: 'linear-gradient(90deg, #E4002B, #F97316)', color: '#fff' }}
        >
          {typeLabel}
        </span>
      </div>
      <p className="mt-2 text-sm font-medium text-gray-900">{n.motif}</p>
      {n.observations && <p className="mt-1 text-xs text-gray-600">{n.observations}</p>}
      {n.difficultes && (
        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
          <AlertTriangle className="h-3 w-3" /> {n.difficultes}
        </p>
      )}
      {n.actions_recommandees && (
        <p className="mt-1 text-xs font-medium text-emerald-700">Actions : {n.actions_recommandees}</p>
      )}
      {n.relance_date && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-gray-500">
          <Clock className="h-3 w-3" /> Relance : {new Date(n.relance_date).toLocaleDateString('fr-FR')}
        </p>
      )}
    </div>
  );
}

function NoteForm({
  userId, onSaved, onCancel,
}: {
  userId: string;
  onSaved: (n: Note) => void;
  onCancel: () => void;
}) {
  const [contactType, setContactType] = useState('telephone');
  const [motif, setMotif] = useState('');
  const [observations, setObservations] = useState('');
  const [difficultes, setDifficultes] = useState('');
  const [actions, setActions] = useState('');
  const [relance, setRelance] = useState('');
  const [pending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!motif.trim()) return;
    startTransition(async () => {
      const res = await addNote({
        user_id: userId,
        contact_type: contactType,
        motif: motif.trim(),
        observations: observations.trim() || null,
        difficultes: difficultes.trim() || null,
        actions_recommandees: actions.trim() || null,
        relance_date: relance || null,
      });
      if (res.ok && res.note) onSaved(res.note);
    });
  };

  const inputCls = 'w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-shadow focus:shadow-md focus:ring-2 focus:ring-[#E4002B]/20';

  return (
    <div className="mt-4 space-y-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Nouveau contact</p>
      <div className="flex flex-wrap gap-2">
        {CONTACT_TYPES.map((ct) => (
          <button
            key={ct.value}
            onClick={() => setContactType(ct.value)}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition-all',
              contactType === ct.value
                ? 'text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            )}
            style={contactType === ct.value ? { background: 'linear-gradient(90deg, #E4002B, #F97316)' } : undefined}
          >
            <ct.Icon className="h-3.5 w-3.5" /> {ct.label}
          </button>
        ))}
      </div>
      <input placeholder="Motif du contact *" value={motif} onChange={(e) => setMotif(e.target.value)} className={inputCls} />
      <textarea placeholder="Observations" value={observations} onChange={(e) => setObservations(e.target.value)} rows={2} className={inputCls} />
      <input placeholder="Difficultés identifiées" value={difficultes} onChange={(e) => setDifficultes(e.target.value)} className={inputCls} />
      <input placeholder="Actions recommandées" value={actions} onChange={(e) => setActions(e.target.value)} className={inputCls} />
      <div className="flex items-center gap-3">
        <label className="text-xs font-medium text-gray-500">Date de relance :</label>
        <input type="date" value={relance} onChange={(e) => setRelance(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs outline-none" />
      </div>
      <div className="flex gap-2 pt-1">
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={pending || !motif.trim()}
          className="text-xs text-white"
          style={{ background: 'linear-gradient(90deg, #E4002B, #F97316)' }}
        >
          {pending ? 'Enregistrement...' : 'Enregistrer la note'}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel} className="text-xs text-gray-500">
          Annuler
        </Button>
      </div>
    </div>
  );
}

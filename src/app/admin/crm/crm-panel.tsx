'use client';

import { useState, useTransition } from 'react';
import {
  AlertTriangle, Calendar, ChevronDown, ChevronUp, Clock, Mail, MessageSquare,
  Phone, Plus, Search, User, Video,
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

type Student = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  promotion: string | null;
  lastRevision: Date | null;
  revisions30d: number;
  alertsPending: number;
  redSpecs: number;
  orangeSpecs: number;
  notes: Note[];
};

const CONTACT_TYPES = [
  { value: 'telephone', label: 'Téléphone', Icon: Phone },
  { value: 'visio', label: 'Visio', Icon: Video },
  { value: 'email', label: 'Email', Icon: Mail },
  { value: 'whatsapp', label: 'WhatsApp', Icon: MessageSquare },
];

export function CrmPanel({ students: initialStudents }: { students: Student[] }) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<string | null>(null);
  const [students, setStudents] = useState(initialStudents);

  const filtered = students.filter((s) => {
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
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-ink-muted)" />
          <input
            type="text"
            placeholder="Rechercher un candidat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border bg-white py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#6D28D9]/30"
          />
        </div>
      </div>

      <div className="space-y-2">
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

  return (
    <div className="rounded-xl border bg-white">
      <button onClick={onToggle} className="flex w-full items-center justify-between p-4 text-left">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-(--color-surface)">
            <User className="h-4 w-4 text-(--color-ink-soft)" />
          </div>
          <div>
            <p className="text-sm font-medium text-(--color-ink)">
              {s.first_name} {s.last_name}
            </p>
            <p className="text-xs text-(--color-ink-muted)">{s.email ?? '—'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {s.alertsPending > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-[#FCEAEC] px-2 py-0.5 text-xs font-bold text-[#A91D2C]">
              <AlertTriangle className="h-3 w-3" /> {s.alertsPending}
            </span>
          )}
          {s.redSpecs > 0 && (
            <span className="rounded-full bg-[#FCEAEC] px-2 py-0.5 text-xs font-bold text-[#A91D2C]">
              {s.redSpecs} rouge{s.redSpecs > 1 ? 's' : ''}
            </span>
          )}
          {s.orangeSpecs > 0 && (
            <span className="rounded-full bg-[#FFF7E6] px-2 py-0.5 text-xs font-bold text-[#E8742C]">
              {s.orangeSpecs} orange{s.orangeSpecs > 1 ? 's' : ''}
            </span>
          )}
          <span className="text-xs tabular-nums text-(--color-ink-muted)">
            {s.revisions30d}/30j
          </span>
          {isExpanded ? <ChevronUp className="h-4 w-4 text-(--color-ink-muted)" /> : <ChevronDown className="h-4 w-4 text-(--color-ink-muted)" />}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t px-4 py-4">
          <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
            <div>
              <p className="text-(--color-ink-muted)">Dernière révision</p>
              <p className="mt-0.5 font-medium text-(--color-ink)">
                {s.lastRevision
                  ? `Il y a ${daysSince} jour${daysSince !== 1 ? 's' : ''}`
                  : 'Jamais'}
              </p>
            </div>
            <div>
              <p className="text-(--color-ink-muted)">Révisions / 30j</p>
              <p className="mt-0.5 font-medium text-(--color-ink)">{s.revisions30d}</p>
            </div>
            <div>
              <p className="text-(--color-ink-muted)">Promotion</p>
              <p className="mt-0.5 font-medium text-(--color-ink)">{s.promotion ?? '—'}</p>
            </div>
            <div>
              <p className="text-(--color-ink-muted)">Téléphone</p>
              <p className="mt-0.5 font-medium text-(--color-ink)">{s.phone ?? '—'}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-(--color-ink-muted)">Historique contacts</p>
            <Button size="sm" variant="outline" className="text-xs" onClick={onToggleForm}>
              <Plus className="mr-1 h-3 w-3" /> Ajouter une note
            </Button>
          </div>

          {showNoteForm && <NoteForm userId={s.id} onSaved={onNoteAdded} onCancel={onToggleForm} />}

          {s.notes.length === 0 && !showNoteForm && (
            <p className="mt-3 text-xs text-(--color-ink-muted)">Aucun contact enregistré.</p>
          )}
          {s.notes.map((n) => (
            <div key={n.id} className="mt-3 rounded-lg bg-(--color-surface) p-3 text-xs">
              <div className="flex items-center gap-2 text-(--color-ink-muted)">
                <Calendar className="h-3 w-3" />
                {new Date(n.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                <span className="rounded bg-(--color-border) px-1.5 py-0.5 text-[10px] font-medium uppercase">
                  {n.contact_type}
                </span>
              </div>
              <p className="mt-1 font-medium text-(--color-ink)">{n.motif}</p>
              {n.observations && <p className="mt-1 text-(--color-ink-soft)">{n.observations}</p>}
              {n.difficultes && <p className="mt-1 text-[#A91D2C]">Difficultés : {n.difficultes}</p>}
              {n.actions_recommandees && <p className="mt-1 text-[#16793C]">Actions : {n.actions_recommandees}</p>}
              {n.relance_date && (
                <p className="mt-1 flex items-center gap-1 text-(--color-ink-muted)">
                  <Clock className="h-3 w-3" /> Relance : {new Date(n.relance_date).toLocaleDateString('fr-FR')}
                </p>
              )}
            </div>
          ))}
        </div>
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

  return (
    <div className="mt-3 space-y-3 rounded-lg border p-3">
      <div className="flex gap-2">
        {CONTACT_TYPES.map((ct) => (
          <button
            key={ct.value}
            onClick={() => setContactType(ct.value)}
            className={cn(
              'flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors',
              contactType === ct.value ? 'bg-[#6D28D9] text-white' : 'bg-(--color-surface) text-(--color-ink-soft)',
            )}
          >
            <ct.Icon className="h-3 w-3" /> {ct.label}
          </button>
        ))}
      </div>
      <input placeholder="Motif *" value={motif} onChange={(e) => setMotif(e.target.value)}
        className="w-full rounded-lg border px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#6D28D9]/30" />
      <textarea placeholder="Observations" value={observations} onChange={(e) => setObservations(e.target.value)} rows={2}
        className="w-full rounded-lg border px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#6D28D9]/30" />
      <input placeholder="Difficultés identifiées" value={difficultes} onChange={(e) => setDifficultes(e.target.value)}
        className="w-full rounded-lg border px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#6D28D9]/30" />
      <input placeholder="Actions recommandées" value={actions} onChange={(e) => setActions(e.target.value)}
        className="w-full rounded-lg border px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#6D28D9]/30" />
      <div className="flex items-center gap-2">
        <label className="text-xs text-(--color-ink-muted)">Relance :</label>
        <input type="date" value={relance} onChange={(e) => setRelance(e.target.value)}
          className="rounded-lg border px-2 py-1 text-xs outline-none" />
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSubmit} disabled={pending || !motif.trim()} className="text-xs" style={{ background: '#6D28D9' }}>
          Enregistrer
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel} className="text-xs">Annuler</Button>
      </div>
    </div>
  );
}

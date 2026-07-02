'use client';

import { useEffect } from 'react';
import {
  X, Stethoscope, Route, CalendarClock, Mail, Phone, AlertTriangle, ListChecks,
} from 'lucide-react';
import { QUESTIONS, PROFILES } from '@/lib/diagnostic/scoring';
import type { UnifiedLead } from './unified-leads-table';

const NAVY = '#0F1F4D';
const INK_SOFT = '#52607A';

export function DiagnosticDetailsDialog({ lead, onClose }: { lead: UnifiedLead | null; onClose: () => void }) {
  useEffect(() => {
    if (!lead) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [lead, onClose]);

  if (!lead) return null;

  const answers = lead.answers ?? {};
  const meta = PROFILES.find((p) => p.key === lead.profile_key);
  const color = meta?.color ?? '#6D28D9';
  const soft = meta?.colorSoft ?? '#EDE7FA';

  // Réponses ordonnées par numéro de question (celles réellement répondues).
  const rows = QUESTIONS.filter((q) => answers[q.id]).map((q) => ({
    index: q.index,
    title: q.title,
    answer: answers[q.id],
    multi: q.multi === true,
  }));

  const metaItems = [
    { Icon: Stethoscope, label: 'Spécialité', value: lead.specialty || '—' },
    { Icon: Route, label: 'Voie', value: lead.voie || '—' },
    { Icon: CalendarClock, label: 'Session EVC visée', value: lead.session_evc || '—' },
    {
      Icon: CalendarClock,
      label: 'Date du diagnostic',
      value: new Date(lead.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto p-3 sm:p-6"
      style={{ background: 'rgba(15,31,77,0.55)', backdropFilter: 'blur(3px)' }}
      role="dialog"
      aria-modal="true"
      aria-label="Détails du diagnostic"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative my-auto w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="relative px-6 py-6 text-white sm:px-8" style={{ background: `linear-gradient(150deg, ${NAVY} 0%, #241042 100%)` }}>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-white/50">Diagnostic Profil EVC</p>
          <h2 className="mt-1 text-[22px] font-black leading-tight">{lead.first_name} {lead.last_name}</h2>
          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-extrabold" style={{ background: soft, color }}>
              {lead.profile_label || '—'}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-white/75">
            <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-1.5 hover:text-white"><Mail className="h-3.5 w-3.5" /> {lead.email}</a>
            {lead.phone && <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {lead.phone}</span>}
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[62vh] overflow-y-auto px-6 py-5 sm:px-8">
          {/* Méta */}
          <div className="grid grid-cols-2 gap-3">
            {metaItems.map((m) => (
              <div key={m.label} className="rounded-xl border border-(--color-border) bg-(--color-surface-soft) px-3 py-2.5">
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-(--color-ink-muted)">
                  <m.Icon className="h-3.5 w-3.5" /> {m.label}
                </p>
                <p className="mt-0.5 text-[13px] font-semibold text-(--color-ink)">{m.value}</p>
              </div>
            ))}
          </div>

          {/* Obstacles */}
          {lead.obstacle && (
            <div className="mt-4 rounded-xl border px-4 py-3" style={{ borderColor: '#F5D7B8', background: '#FEF6EC' }}>
              <p className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide" style={{ color: '#B45309' }}>
                <AlertTriangle className="h-3.5 w-3.5" /> Principaux obstacles
              </p>
              <p className="mt-1 text-[13.5px] font-semibold" style={{ color: '#8A5A1E' }}>{lead.obstacle}</p>
            </div>
          )}

          {/* Réponses */}
          <p className="mt-5 flex items-center gap-2 text-[13px] font-black uppercase tracking-wide" style={{ color: NAVY }}>
            <ListChecks className="h-4 w-4" style={{ color }} /> Réponses au diagnostic
          </p>
          {rows.length === 0 ? (
            <p className="mt-2 text-[13px] text-(--color-ink-soft)">Aucune réponse détaillée enregistrée pour ce lead.</p>
          ) : (
            <ol className="mt-3 space-y-2.5">
              {rows.map((r) => (
                <li key={r.index} className="flex items-start gap-3 rounded-xl border border-(--color-border) px-3.5 py-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[12px] font-black text-white" style={{ background: NAVY }}>
                    {r.index}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold leading-snug" style={{ color: INK_SOFT }}>{r.title}</p>
                    <p className="mt-1 text-[13.5px] font-bold leading-snug" style={{ color }}>{r.answer}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-(--color-border) px-6 py-4 sm:px-8">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
            style={{ background: `linear-gradient(90deg, #8B0E22, #C0112E)` }}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

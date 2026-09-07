'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field, InlineStatus, NativeSelect } from './ui';
import { createReport, type ReportInput } from '@/app/admin/suivi/candidats/actions';
import { fmtDateTime, toLocalInputValue, fromLocalInputValue } from '@/lib/suivi/format';
import {
  ACTION_CATEGORIES, ACTION_LABEL, ACTION_STATUSES, ACTION_STATUS_LABEL, CONTACT_TYPE_LABEL, DIFFICULTY_CATEGORIES, DIFFICULTY_LABEL,
  type ActionCategory, type ActionStatus, type AppointmentRow, type ContactType, type DifficultyCategory,
} from '@/lib/suivi/types';

type Diff = { category: DifficultyCategory; details: string; no_action: boolean };
type Act = { category: ActionCategory; comment: string; owner_id: string; due_date: string; status: ActionStatus; difficulty_index: number | null };

/** Nouveau compte rendu (§12) : résumé, difficultés (constat sans action), actions rattachées. */
export function ReportForm({ userId, appointments, staff, selfId, canInternalNotes }: {
  userId: string;
  appointments: AppointmentRow[];
  staff: { id: string; name: string }[];
  selfId: string;
  canInternalNotes: boolean;
}) {
  const router = useRouter();
  const candidates = appointments.filter((a) => a.status !== 'cancelled').sort((a, b) => b.starts_at.localeCompare(a.starts_at));
  const nowIso = new Date().toISOString();
  const defaultAppt = candidates.find((a) => a.status === 'planned' && a.starts_at <= nowIso) ?? candidates.find((a) => a.status === 'planned') ?? null;

  const [appointmentId, setAppointmentId] = useState(defaultAppt?.id ?? '');
  const [occurredAt, setOccurredAt] = useState(toLocalInputValue(defaultAppt?.starts_at ?? new Date()));
  const [contactType, setContactType] = useState<ContactType>('rendez_vous');
  const [summary, setSummary] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [nextStep, setNextStep] = useState('');
  const [markDone, setMarkDone] = useState(true);
  const [diffs, setDiffs] = useState<Diff[]>([]);
  const [acts, setActs] = useState<Act[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit() {
    setError(null); setStatus(null);
    const occurred = fromLocalInputValue(occurredAt);
    if (!occurred) { setError('Date du contact invalide.'); return; }
    const payload: ReportInput = {
      user_id: userId, appointment_id: appointmentId || null, occurred_at: occurred, contact_type: contactType,
      summary, internal_notes: canInternalNotes ? internalNotes : null, next_step: nextStep,
      difficulties: diffs, mark_done: markDone,
      actions: acts.map((a) => ({ ...a, owner_id: a.owner_id || null, difficulty_index: a.difficulty_index })),
    };
    start(async () => {
      const r = await createReport(payload);
      if (!r.ok) { setError(r.error); return; }
      setStatus('Compte rendu enregistré.');
      setSummary(''); setInternalNotes(''); setNextStep(''); setDiffs([]); setActs([]);
      router.refresh();
    });
  }

  const addDiff = () => setDiffs([...diffs, { category: 'qcm', details: '', no_action: false }]);
  const addAct = () => setActs([...acts, { category: 'exercices_cibles', comment: '', owner_id: selfId, due_date: '', status: 'todo', difficulty_index: null }]);
  const setDiff = (i: number, p: Partial<Diff>) => setDiffs(diffs.map((d, k) => (k === i ? { ...d, ...p } : d)));
  const setAct = (i: number, p: Partial<Act>) => setActs(acts.map((a, k) => (k === i ? { ...a, ...p } : a)));
  const removeDiff = (i: number) => {
    setDiffs(diffs.filter((_, k) => k !== i));
    setActs(acts.map((a) => (a.difficulty_index === null ? a : a.difficulty_index === i ? { ...a, difficulty_index: null } : a.difficulty_index > i ? { ...a, difficulty_index: a.difficulty_index - 1 } : a)));
  };

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Rendez-vous concerné">
          <NativeSelect value={appointmentId} onChange={(e) => { setAppointmentId(e.target.value); const a = candidates.find((x) => x.id === e.target.value); if (a) setOccurredAt(toLocalInputValue(a.starts_at)); }}>
            <option value="">Aucun (contact hors rendez-vous)</option>
            {candidates.map((a) => <option key={a.id} value={a.id}>{fmtDateTime(a.starts_at)} · {a.status}</option>)}
          </NativeSelect>
        </Field>
        <Field label="Date et heure du contact"><Input type="datetime-local" value={occurredAt} onChange={(e) => setOccurredAt(e.target.value)} /></Field>
        <Field label="Mode de contact">
          <NativeSelect value={contactType} onChange={(e) => setContactType(e.target.value as ContactType)}>
            {(Object.keys(CONTACT_TYPE_LABEL) as ContactType[]).map((k) => <option key={k} value={k}>{CONTACT_TYPE_LABEL[k]}</option>)}
          </NativeSelect>
        </Field>
        {appointmentId && (
          <label className="flex items-center gap-2 self-end pb-3 text-sm text-(--color-ink)">
            <Checkbox checked={markDone} onCheckedChange={(v) => setMarkDone(v === true)} /> Marquer le rendez-vous « Réalisé »
          </label>
        )}
      </div>
      <Field label="Compte rendu"><Textarea rows={4} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Ce qui a été constaté et discuté…" /></Field>

      <div className="rounded-lg border border-(--color-border) p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-(--color-ink)">Difficultés identifiées</p>
          <Button type="button" size="sm" variant="outline" onClick={addDiff}><Plus /> Difficulté</Button>
        </div>
        {diffs.length === 0 && <p className="text-xs text-(--color-ink-muted)">Aucune difficulté ajoutée.</p>}
        <div className="space-y-3">
          {diffs.map((d, i) => (
            <div key={i} className="grid gap-2 rounded-md bg-(--color-surface-soft) p-3 sm:grid-cols-[220px_1fr_auto]">
              <NativeSelect className="h-9" value={d.category} onChange={(e) => setDiff(i, { category: e.target.value as DifficultyCategory })}>
                {DIFFICULTY_CATEGORIES.map((c) => <option key={c} value={c}>{DIFFICULTY_LABEL[c]}</option>)}
              </NativeSelect>
              <Input className="h-9" value={d.details} onChange={(e) => setDiff(i, { details: e.target.value })} placeholder="Précisions" />
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs text-(--color-ink)" title="Reste visible dans l’historique et au suivi suivant, sans action ouverte ni en retard">
                  <Checkbox checked={d.no_action} onCheckedChange={(v) => setDiff(i, { no_action: v === true })} /> Constat sans action
                </label>
                <button type="button" onClick={() => removeDiff(i)} className="text-(--color-ink-muted) hover:text-(--color-danger)" aria-label="Retirer"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-(--color-border) p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-(--color-ink)">Actions décidées</p>
          <Button type="button" size="sm" variant="outline" onClick={addAct}><Plus /> Action</Button>
        </div>
        {acts.length === 0 && <p className="text-xs text-(--color-ink-muted)">Aucune action ajoutée.</p>}
        <div className="space-y-3">
          {acts.map((a, i) => (
            <div key={i} className="grid gap-2 rounded-md bg-(--color-surface-soft) p-3 sm:grid-cols-2 lg:grid-cols-6">
              <NativeSelect className="h-9 lg:col-span-2" value={a.category} onChange={(e) => setAct(i, { category: e.target.value as ActionCategory })}>
                {ACTION_CATEGORIES.map((c) => <option key={c} value={c}>{ACTION_LABEL[c]}</option>)}
              </NativeSelect>
              <NativeSelect className="h-9" value={a.owner_id} onChange={(e) => setAct(i, { owner_id: e.target.value })}>
                <option value="">Responsable : —</option>
                {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </NativeSelect>
              <Input className="h-9" type="date" value={a.due_date} onChange={(e) => setAct(i, { due_date: e.target.value })} title="Échéance" />
              <NativeSelect className="h-9" value={a.status} onChange={(e) => setAct(i, { status: e.target.value as ActionStatus })}>
                {ACTION_STATUSES.map((s) => <option key={s} value={s}>{ACTION_STATUS_LABEL[s]}</option>)}
              </NativeSelect>
              <NativeSelect className="h-9" value={a.difficulty_index === null ? '' : String(a.difficulty_index)} onChange={(e) => setAct(i, { difficulty_index: e.target.value === '' ? null : Number(e.target.value) })} title="Difficulté rattachée">
                <option value="">Sans difficulté liée</option>
                {diffs.map((d, k) => <option key={k} value={k}>Liée à : {DIFFICULTY_LABEL[d.category]}</option>)}
              </NativeSelect>
              <div className="flex gap-2 sm:col-span-2 lg:col-span-6">
                <Input className="h-9" value={a.comment} onChange={(e) => setAct(i, { comment: e.target.value })} placeholder="Commentaire" />
                <button type="button" onClick={() => setActs(acts.filter((_, k) => k !== i))} className="text-(--color-ink-muted) hover:text-(--color-danger)" aria-label="Retirer"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Field label="Prochaine étape (optionnel)"><Input value={nextStep} onChange={(e) => setNextStep(e.target.value)} placeholder="Ex. point dans 3 semaines après la série QCM cardio" /></Field>
      {canInternalNotes && (
        <Field label="Notes internes" hint="Réservées aux rôles habilités ; jamais visibles du candidat.">
          <Textarea rows={3} value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} className="border-amber-300" />
        </Field>
      )}
      <div className="flex items-center gap-3">
        <Button type="button" onClick={submit} disabled={pending}>{pending && <Loader2 className="animate-spin" />} Enregistrer le compte rendu</Button>
        <InlineStatus error={error} status={status} />
      </div>
    </div>
  );
}

'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, InlineStatus, NativeSelect } from './ui';
import { createCampaign, previewAudience, updateCampaign, type CampaignInput } from '@/app/admin/suivi/campagnes/actions';
import { OFFER_KEYS, OFFER_SHORT_LABEL, SELECTION_MODE_LABEL, VOIE_LABEL, type SelectionMode } from '@/lib/suivi/types';

export type StudentOption = { id: string; name: string; email: string; specialty: string };

type FormState = {
  name: string; description: string; specialties: string[]; offers: string[]; voies: string[];
  evc_session_id: string; selection_mode: SelectionMode; manual_user_ids: string[];
  period_start: string; period_end: string; slot_minutes: string;
};

/** Éditeur de ciblage (§2) avec aperçu en direct de l'audience. */
export function CampaignForm({ initial, campaignId, specialties, sessions, students, defaultSlotMinutes, readOnly }: {
  initial?: Partial<FormState>;
  campaignId?: string;
  specialties: string[];
  sessions: { id: string; label: string }[];
  students: StudentOption[];
  defaultSlotMinutes: number;
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [f, setF] = useState<FormState>({
    name: '', description: '', specialties: [], offers: [], voies: [], evc_session_id: '', selection_mode: 'all',
    manual_user_ids: [], period_start: '', period_end: '', slot_minutes: '', ...initial,
  });
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [preview, setPreview] = useState<{ count: number; sample: string[] } | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [studentQuery, setStudentQuery] = useState('');
  const previewSeq = useRef(0);

  const payload = useMemo<CampaignInput>(() => ({
    name: f.name, description: f.description, specialties: f.specialties,
    offers: f.offers as CampaignInput['offers'], voies: f.voies as CampaignInput['voies'],
    evc_session_id: f.evc_session_id || null, selection_mode: f.selection_mode, manual_user_ids: f.manual_user_ids,
    period_start: f.period_start, period_end: f.period_end,
    slot_minutes: f.slot_minutes ? Number(f.slot_minutes) : null,
  }), [f]);

  // Aperçu de l'audience recalculé après une courte pause de saisie. L'état
  // n'est modifié que dans la réponse asynchrone (jamais dans le corps de l'effet).
  useEffect(() => {
    const seq = ++previewSeq.current;
    const t = setTimeout(async () => {
      setPreviewing(true);
      const r = await previewAudience(payload);
      if (seq !== previewSeq.current) return;
      setPreviewing(false);
      if (r.ok) setPreview({ count: r.count, sample: r.sample });
    }, 450);
    return () => clearTimeout(t);
  }, [payload]);

  const toggle = (key: 'specialties' | 'offers' | 'voies' | 'manual_user_ids', value: string) =>
    setF((p) => ({ ...p, [key]: p[key].includes(value) ? p[key].filter((x) => x !== value) : [...p[key], value] }));

  function submit() {
    setError(null); setStatus(null);
    start(async () => {
      const r = campaignId ? await updateCampaign(campaignId, payload) : await createCampaign(payload);
      if (!r.ok) { setError(r.error); return; }
      if (!campaignId && 'id' in r) { router.push(`/admin/suivi/campagnes/${r.id}`); return; }
      setStatus('Campagne enregistrée, audience mise à jour.');
      router.refresh();
    });
  }

  const filteredStudents = useMemo(() => {
    const q = studentQuery.trim().toLowerCase();
    const list = q ? students.filter((s) => `${s.name} ${s.email} ${s.specialty}`.toLowerCase().includes(q)) : students;
    return list.slice(0, 60);
  }, [students, studentQuery]);
  const selectedStudents = useMemo(() => students.filter((s) => f.manual_user_ids.includes(s.id)), [students, f.manual_user_ids]);

  return (
    <fieldset disabled={readOnly || pending} className="grid gap-5 disabled:opacity-90">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nom de la campagne" className="md:col-span-2">
          <Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Ex. Suivi Psychiatrie – octobre" />
        </Field>
        <Field label="Description (interne)" className="md:col-span-2">
          <Textarea rows={2} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
        </Field>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div>
          <p className="mb-2 text-sm font-medium text-(--color-ink)">Spécialités <span className="font-normal text-(--color-ink-muted)">(aucune = toutes)</span></p>
          <div className="max-h-56 space-y-1.5 overflow-auto rounded-lg border border-(--color-border) p-3">
            {specialties.map((s) => (
              <label key={s} className="flex cursor-pointer items-center gap-2 text-sm text-(--color-ink)">
                <Checkbox checked={f.specialties.includes(s)} onCheckedChange={() => toggle('specialties', s)} />
                {s}
              </label>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium text-(--color-ink)">Formules</p>
            <div className="space-y-1.5">
              {OFFER_KEYS.map((o) => (
                <label key={o} className="flex cursor-pointer items-center gap-2 text-sm text-(--color-ink)">
                  <Checkbox checked={f.offers.includes(o)} onCheckedChange={() => toggle('offers', o)} />
                  {OFFER_SHORT_LABEL[o]}
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-(--color-ink)">Voie</p>
            <div className="space-y-1.5">
              {Object.entries(VOIE_LABEL).map(([k, v]) => (
                <label key={k} className="flex cursor-pointer items-center gap-2 text-sm text-(--color-ink)">
                  <Checkbox checked={f.voies.includes(k)} onCheckedChange={() => toggle('voies', k)} />
                  {v}
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <Field label="Cohorte (session EVC)">
            <NativeSelect value={f.evc_session_id} onChange={(e) => setF({ ...f, evc_session_id: e.target.value })}>
              <option value="">Toutes les sessions</option>
              {sessions.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Sélection">
            <NativeSelect value={f.selection_mode} onChange={(e) => setF({ ...f, selection_mode: e.target.value as SelectionMode })}>
              {(Object.keys(SELECTION_MODE_LABEL) as SelectionMode[]).map((m) => <option key={m} value={m}>{SELECTION_MODE_LABEL[m]}</option>)}
            </NativeSelect>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Début de période"><Input type="date" value={f.period_start} onChange={(e) => setF({ ...f, period_start: e.target.value })} /></Field>
            <Field label="Fin de période"><Input type="date" value={f.period_end} onChange={(e) => setF({ ...f, period_end: e.target.value })} /></Field>
          </div>
          <Field label="Durée des créneaux (min)" hint={`Vide = réglage par défaut (${defaultSlotMinutes} min)`}>
            <Input type="number" min={5} max={180} value={f.slot_minutes} onChange={(e) => setF({ ...f, slot_minutes: e.target.value })} />
          </Field>
        </div>
      </div>

      {f.selection_mode === 'manual' && (
        <div className="rounded-lg border border-(--color-border) p-3">
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <p className="text-sm font-medium text-(--color-ink)">Sélection manuelle · {f.manual_user_ids.length} candidat(s)</p>
            <Input value={studentQuery} onChange={(e) => setStudentQuery(e.target.value)} placeholder="Rechercher un nom, un email…" className="h-9 max-w-xs" />
          </div>
          {selectedStudents.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {selectedStudents.map((s) => (
                <button key={s.id} type="button" onClick={() => toggle('manual_user_ids', s.id)} className="rounded-full bg-(--color-primary-soft) px-2.5 py-0.5 text-xs text-(--color-primary-deep) hover:opacity-80" title="Retirer">
                  {s.name} ×
                </button>
              ))}
            </div>
          )}
          <div className="max-h-56 overflow-auto">
            {filteredStudents.map((s) => (
              <label key={s.id} className="flex cursor-pointer items-center gap-2 py-1 text-sm text-(--color-ink)">
                <Checkbox checked={f.manual_user_ids.includes(s.id)} onCheckedChange={() => toggle('manual_user_ids', s.id)} />
                <span>{s.name}</span>
                <span className="text-xs text-(--color-ink-muted)">{s.email} · {s.specialty || '—'}</span>
              </label>
            ))}
            {filteredStudents.length === 0 && <p className="text-sm text-(--color-ink-soft)">Aucun candidat ne correspond.</p>}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-(--color-surface-soft) p-3">
        <p className="flex items-center gap-2 text-sm text-(--color-ink)">
          <Users className="h-4 w-4 text-(--color-primary)" />
          {previewing ? 'Calcul de l’audience…' : preview ? <><strong>{preview.count}</strong>&nbsp;candidat(s) ciblé(s){preview.sample.length > 0 && <span className="text-(--color-ink-muted)"> · {preview.sample.join(', ')}{preview.count > preview.sample.length ? '…' : ''}</span>}</> : 'Audience non calculée'}
        </p>
        {!readOnly && (
          <Button type="button" onClick={submit} disabled={pending || f.name.trim().length < 2}>
            {pending && <Loader2 className="animate-spin" />}
            {campaignId ? 'Enregistrer le ciblage' : 'Créer la campagne'}
          </Button>
        )}
      </div>
      <InlineStatus error={error} status={status} />
    </fieldset>
  );
}

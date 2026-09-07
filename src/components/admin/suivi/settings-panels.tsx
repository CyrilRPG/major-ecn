'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field, InlineStatus, NativeSelect, SectionCard } from './ui';
import { resetTemplateAction, saveSettingsAction, saveSpecialtyColors, saveTemplateAction, setStaffRoleAction } from '@/app/admin/suivi/reglages/actions';
import { TEMPLATE_VARIABLES } from '@/lib/suivi/templates';
import { STAFF_ROLE_LABEL, type SuiviSettings } from '@/lib/suivi/types';

function useRun() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const run = (label: string, fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setError(null); setStatus(null);
    start(async () => {
      const r = await fn();
      if (!r.ok) { setError(r.error ?? 'Erreur'); return; }
      setStatus(label);
      router.refresh();
    });
  };
  return { run, error, status, pending };
}

/** Réglages généraux (§6 durée / tampon, §9 rappel, §18 conservation et suppression). */
export function SettingsForm({ settings }: { settings: SuiviSettings }) {
  const { run, error, status, pending } = useRun();
  const [f, setF] = useState({
    default_slot_minutes: String(settings.default_slot_minutes), buffer_minutes: String(settings.buffer_minutes),
    reminder_hours: String(settings.reminder_hours), reminder_preset: [48, 24, 2].includes(settings.reminder_hours) ? String(settings.reminder_hours) : 'custom',
    retention_months: String(settings.retention_months), alert_email: settings.alert_email ?? '', deletion_policy: settings.deletion_policy,
  });
  return (
    <SectionCard title="Réglages généraux">
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Durée d’un créneau (min)"><Input type="number" min={5} max={180} value={f.default_slot_minutes} onChange={(e) => setF({ ...f, default_slot_minutes: e.target.value })} /></Field>
        <Field label="Temps tampon (min)"><Input type="number" min={0} max={60} value={f.buffer_minutes} onChange={(e) => setF({ ...f, buffer_minutes: e.target.value })} /></Field>
        <Field label="Rappel avant rendez-vous" hint="Modifiable rendez-vous par rendez-vous.">
          <div className="flex gap-2">
            <NativeSelect value={f.reminder_preset} onChange={(e) => setF({ ...f, reminder_preset: e.target.value, reminder_hours: e.target.value === 'custom' ? f.reminder_hours : e.target.value })}>
              <option value="48">48 h avant</option><option value="24">24 h avant (la veille)</option><option value="2">2 h avant</option><option value="custom">Personnalisé</option>
            </NativeSelect>
            {f.reminder_preset === 'custom' && <Input type="number" min={1} max={168} className="w-24" value={f.reminder_hours} onChange={(e) => setF({ ...f, reminder_hours: e.target.value })} />}
          </div>
        </Field>
        <Field label="Email du responsable des alertes" hint="Vide = boîte contact de Major ECN."><Input type="email" value={f.alert_email} onChange={(e) => setF({ ...f, alert_email: e.target.value })} /></Field>
        <Field label="Durée de conservation (mois)" hint="Au-delà, comptes rendus et rendez-vous sont supprimés."><Input type="number" min={1} max={120} value={f.retention_months} onChange={(e) => setF({ ...f, retention_months: e.target.value })} /></Field>
        <Field label="À la suppression d’un compte candidat">
          <NativeSelect value={f.deletion_policy} onChange={(e) => setF({ ...f, deletion_policy: e.target.value as 'delete' | 'anonymize' })}>
            <option value="anonymize">Anonymiser (statistiques conservées sans identité)</option>
            <option value="delete">Supprimer complètement</option>
          </NativeSelect>
        </Field>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <Button disabled={pending} onClick={() => run('Réglages enregistrés.', () => saveSettingsAction({
          default_slot_minutes: Number(f.default_slot_minutes), buffer_minutes: Number(f.buffer_minutes), reminder_hours: Number(f.reminder_hours),
          retention_months: Number(f.retention_months), alert_email: f.alert_email || null, deletion_policy: f.deletion_policy,
        }))}>{pending && <Loader2 className="animate-spin" />} Enregistrer</Button>
        <InlineStatus error={error} status={status} />
      </div>
    </SectionCard>
  );
}

export function SpecialtyColorsForm({ specialties, colors }: { specialties: string[]; colors: Record<string, string> }) {
  const { run, error, status, pending } = useRun();
  const [c, setC] = useState<Record<string, string>>(colors);
  return (
    <SectionCard title="Couleurs des spécialités" description="Utilisées dans l’agenda.">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {specialties.map((s) => (
          <label key={s} className="flex items-center gap-2 text-sm text-(--color-ink)">
            <input type="color" value={c[s] ?? '#9AA1AE'} onChange={(e) => setC({ ...c, [s]: e.target.value })} className="h-8 w-10 cursor-pointer rounded border border-(--color-border) bg-transparent" />
            {s}
          </label>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <Button disabled={pending} onClick={() => run('Couleurs enregistrées.', () => saveSpecialtyColors(c))}>{pending && <Loader2 className="animate-spin" />} Enregistrer</Button>
        <InlineStatus error={error} status={status} />
      </div>
    </SectionCard>
  );
}

export function TemplatesEditor({ templates }: { templates: { key: string; name: string; subject: string; body: string; customized: boolean }[] }) {
  const { run, error, status, pending } = useRun();
  const [current, setCurrent] = useState(templates[0]?.key ?? '');
  const [drafts, setDrafts] = useState<Record<string, { subject: string; body: string }>>(Object.fromEntries(templates.map((t) => [t.key, { subject: t.subject, body: t.body }])));
  const t = templates.find((x) => x.key === current);
  const d = drafts[current];
  return (
    <SectionCard title="Bibliothèque d’emails" description="Sept modèles, modifiables ici et encore avant chaque envoi.">
      <div className="grid gap-4 md:grid-cols-[240px_1fr]">
        <ul className="space-y-1">
          {templates.map((x) => (
            <li key={x.key}>
              <button type="button" onClick={() => setCurrent(x.key)} className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm ${x.key === current ? 'bg-(--color-primary-soft) text-(--color-primary-deep)' : 'text-(--color-ink) hover:bg-(--color-surface-soft)'}`}>
                {x.name}{x.customized && <Badge variant="outline">modifié</Badge>}
              </button>
            </li>
          ))}
        </ul>
        {t && d && (
          <div className="grid gap-3">
            <Field label="Objet"><Input value={d.subject} onChange={(e) => setDrafts({ ...drafts, [current]: { ...d, subject: e.target.value } })} /></Field>
            <Field label="Message" hint={`Variables : ${TEMPLATE_VARIABLES.map((v) => `{{${v.key}}} (${v.label.toLowerCase()})`).join(' · ')}`}>
              <Textarea rows={12} value={d.body} onChange={(e) => setDrafts({ ...drafts, [current]: { ...d, body: e.target.value } })} className="font-mono text-[13px]" />
            </Field>
            <div className="flex flex-wrap items-center gap-3">
              <Button disabled={pending} onClick={() => run('Modèle enregistré.', () => saveTemplateAction(current, d.subject, d.body))}>{pending && <Loader2 className="animate-spin" />} Enregistrer</Button>
              {t.customized && <Button variant="outline" disabled={pending} onClick={() => run('Modèle réinitialisé.', () => resetTemplateAction(current))}>Revenir au texte par défaut</Button>}
              <InlineStatus error={error} status={status} />
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  );
}

export function StaffRolesPanel({ professors, roles }: { professors: { id: string; name: string; email: string | null }[]; roles: Record<string, string> }) {
  const { run, error, status, pending } = useRun();
  return (
    <SectionCard title="Rôles du module" description="Administrateur : tout. Responsable pédagogique : tout sauf réglages. Intervenant : agenda, ses rendez-vous, comptes rendus, sans notes internes. Lecture seule : consultation, sans notes internes.">
      {professors.length === 0 ? <p className="text-sm text-(--color-ink-soft)">Aucun compte professeur.</p> : (
        <ul className="divide-y divide-(--color-border)">
          {professors.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-3 py-2 text-sm">
              <span className="min-w-0 flex-1"><span className="font-medium text-(--color-ink)">{p.name}</span> <span className="text-xs text-(--color-ink-muted)">{p.email}</span></span>
              <NativeSelect className="h-9 w-56" value={roles[p.id] ?? ''} disabled={pending} onChange={(e) => run('Rôle mis à jour.', () => setStaffRoleAction(p.id, (e.target.value || null) as 'responsable' | 'intervenant' | 'lecture' | null))}>
                <option value="">Aucun accès</option>
                {(Object.keys(STAFF_ROLE_LABEL) as (keyof typeof STAFF_ROLE_LABEL)[]).map((r) => <option key={r} value={r}>{STAFF_ROLE_LABEL[r]}</option>)}
              </NativeSelect>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-2"><InlineStatus error={error} status={status} /></div>
    </SectionCard>
  );
}

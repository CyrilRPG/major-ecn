'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BellPlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field, InlineStatus, NativeSelect, SectionCard } from './ui';
import { createAlert, deleteAlert, postponeAlert, setAlertStatus, type AlertInput } from '@/app/admin/suivi/alertes/actions';
import { fmtDateTime, toLocalInputValue } from '@/lib/suivi/format';
import { ALERT_STATUS_LABEL, type AlertRow } from '@/lib/suivi/types';

type Kind = 'date' | 'week' | 'before' | 'custom';

/** Alertes administrateur (§4) : création, liste persistante, actions rapides. */
export function AlertsPanel({ alerts, campaigns, staff, defaultEmail, canManage }: {
  alerts: AlertRow[];
  campaigns: { id: string; name: string }[];
  staff: { id: string; name: string }[];
  defaultEmail: string;
  canManage: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState<AlertInput>({ title: '', note: '', kind: 'date', date: '', time: '09:00', week: '', deadline: '', before_value: 7, before_unit: 'days', custom: '', campaign_id: '', recipient_email: '', owner_id: '' });
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [postponeFor, setPostponeFor] = useState<AlertRow | null>(null);
  const [postponeAt, setPostponeAt] = useState('');
  const [showClosed, setShowClosed] = useState(false);
  const now = new Date().toISOString();

  function run(label: string, fn: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null); setStatus(null);
    start(async () => {
      const r = await fn();
      if (!r.ok) { setError(r.error ?? 'Erreur'); return; }
      setStatus(label);
      router.refresh();
    });
  }
  const campaignName = (id: string | null) => (id ? campaigns.find((c) => c.id === id)?.name ?? null : null);
  const ownerName = (id: string | null) => (id ? staff.find((s) => s.id === id)?.name ?? null : null);

  const open = alerts.filter((a) => a.status === 'open' || a.status === 'postponed').sort((a, b) => a.due_at.localeCompare(b.due_at));
  const closed = alerts.filter((a) => a.status === 'done' || a.status === 'closed').sort((a, b) => b.updated_at.localeCompare(a.updated_at));

  return (
    <div className="space-y-6">
      {canManage && (
        <SectionCard title="Programmer une alerte" description="L’alerte apparaît ici à l’échéance et un email part au responsable défini. Elle reste affichée jusqu’à son traitement, son report ou sa clôture.">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Titre" className="md:col-span-2"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex. Créer la campagne Psychiatrie de novembre" /></Field>
            <Field label="Note" className="md:col-span-2"><Textarea rows={2} value={form.note ?? ''} onChange={(e) => setForm({ ...form, note: e.target.value })} /></Field>
            <Field label="Type d’échéance">
              <NativeSelect value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as Kind })}>
                <option value="date">À une date précise</option>
                <option value="week">Une semaine donnée</option>
                <option value="before">X jours / semaines avant une échéance</option>
                <option value="custom">Date et heure personnalisées</option>
              </NativeSelect>
            </Field>
            {form.kind === 'date' && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date"><Input type="date" value={form.date ?? ''} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
                <Field label="Heure"><Input type="time" value={form.time ?? ''} onChange={(e) => setForm({ ...form, time: e.target.value })} /></Field>
              </div>
            )}
            {form.kind === 'week' && <Field label="Semaine (lundi 9 h)"><Input type="week" value={form.week ?? ''} onChange={(e) => setForm({ ...form, week: e.target.value })} /></Field>}
            {form.kind === 'before' && (
              <div className="grid grid-cols-3 gap-3">
                <Field label="Échéance"><Input type="date" value={form.deadline ?? ''} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></Field>
                <Field label="Prévenir"><Input type="number" min={1} value={form.before_value ?? ''} onChange={(e) => setForm({ ...form, before_value: Number(e.target.value) })} /></Field>
                <Field label="Unité"><NativeSelect value={form.before_unit ?? 'days'} onChange={(e) => setForm({ ...form, before_unit: e.target.value as 'days' | 'weeks' })}><option value="days">jours avant</option><option value="weeks">semaines avant</option></NativeSelect></Field>
              </div>
            )}
            {form.kind === 'custom' && <Field label="Date et heure"><Input type="datetime-local" value={form.custom ?? ''} onChange={(e) => setForm({ ...form, custom: e.target.value })} /></Field>}
            <Field label="Campagne liée (optionnel)">
              <NativeSelect value={form.campaign_id ?? ''} onChange={(e) => setForm({ ...form, campaign_id: e.target.value })}>
                <option value="">Aucune</option>{campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Responsable (affichage)">
              <NativeSelect value={form.owner_id ?? ''} onChange={(e) => setForm({ ...form, owner_id: e.target.value })}>
                <option value="">—</option>{staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Email du responsable" hint={`Vide = ${defaultEmail}`}><Input type="email" value={form.recipient_email ?? ''} onChange={(e) => setForm({ ...form, recipient_email: e.target.value })} /></Field>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Button disabled={pending || !form.title.trim()} onClick={() => run('Alerte programmée.', async () => { const r = await createAlert(form); if (r.ok) setForm({ ...form, title: '', note: '' }); return r; })}>
              {pending ? <Loader2 className="animate-spin" /> : <BellPlus />} Programmer
            </Button>
            <InlineStatus error={error} status={status} />
          </div>
        </SectionCard>
      )}

      <SectionCard title={`Alertes en cours (${open.length})`} description="Triées par échéance. Les alertes échues sont mises en avant.">
        {open.length === 0 ? <p className="text-sm text-(--color-ink-soft)">Aucune alerte en cours.</p> : (
          <ul className="space-y-2">
            {open.map((al) => {
              const due = al.due_at <= now;
              return (
                <li key={al.id} className={`rounded-lg border p-3 ${due ? 'border-(--color-danger) bg-red-50/60 dark:bg-red-900/10' : 'border-(--color-border)'}`}>
                  <div className="flex flex-wrap items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 font-medium text-(--color-ink)">
                        {al.title}
                        <Badge variant={due ? 'danger' : al.status === 'postponed' ? 'warning' : 'outline'}>{due ? 'Échue' : ALERT_STATUS_LABEL[al.status]}</Badge>
                      </p>
                      <p className="text-xs text-(--color-ink-soft)">
                        Échéance {fmtDateTime(al.due_at)}{al.emailed_at ? ` · email envoyé le ${fmtDateTime(al.emailed_at)}` : ' · email à l’échéance'}
                        {ownerName(al.owner_id) ? ` · ${ownerName(al.owner_id)}` : ''}{campaignName(al.campaign_id) ? ` · ${campaignName(al.campaign_id)}` : ''}
                      </p>
                      {al.note && <p className="mt-1 whitespace-pre-line text-sm text-(--color-ink-soft)">{al.note}</p>}
                    </div>
                    {canManage && (
                      <div className="flex flex-wrap gap-1.5">
                        <Link href={`/admin/suivi/campagnes/nouvelle?alert=${al.id}`} className="inline-flex h-9 items-center rounded-(--radius-button) bg-(--color-primary) px-3 text-sm font-medium text-(--color-primary-fg)">Créer la campagne</Link>
                        <Link href={al.campaign_id ? `/admin/suivi/campagnes/${al.campaign_id}#creneaux` : '/admin/suivi/campagnes'} className="inline-flex h-9 items-center rounded-(--radius-button) border border-(--color-border) px-3 text-sm text-(--color-ink)">Ouvrir les créneaux</Link>
                        <Button size="sm" variant="outline" disabled={pending} onClick={() => { setPostponeFor(al); setPostponeAt(toLocalInputValue(new Date(Date.now() + 7 * 86_400_000))); }}>Reporter</Button>
                        <Button size="sm" variant="secondary" disabled={pending} onClick={() => run('Alerte traitée.', () => setAlertStatus(al.id, 'done'))}>Marquer comme traité</Button>
                        <Button size="sm" variant="ghost" disabled={pending} onClick={() => run('Alerte clôturée.', () => setAlertStatus(al.id, 'closed'))}>Clôturer</Button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>

      <SectionCard title={`Alertes traitées ou clôturées (${closed.length})`} action={<button type="button" className="text-sm text-(--color-primary) hover:underline" onClick={() => setShowClosed((v) => !v)}>{showClosed ? 'Masquer' : 'Afficher'}</button>}>
        {showClosed && (closed.length === 0 ? <p className="text-sm text-(--color-ink-soft)">Aucune.</p> : (
          <ul className="divide-y divide-(--color-border) text-sm">
            {closed.map((al) => (
              <li key={al.id} className="flex flex-wrap items-center gap-2 py-2">
                <Badge variant="muted">{ALERT_STATUS_LABEL[al.status]}</Badge>
                <span className="text-(--color-ink)">{al.title}</span>
                <span className="text-xs text-(--color-ink-muted)">échéance {fmtDateTime(al.due_at)}</span>
                {canManage && (
                  <span className="ml-auto flex gap-1">
                    <Button size="sm" variant="ghost" disabled={pending} onClick={() => run('Alerte rouverte.', () => setAlertStatus(al.id, 'open'))}>Rouvrir</Button>
                    <Button size="sm" variant="ghost" disabled={pending} onClick={() => { if (confirm('Supprimer définitivement cette alerte ?')) run('Alerte supprimée.', () => deleteAlert(al.id)); }}>Supprimer</Button>
                  </span>
                )}
              </li>
            ))}
          </ul>
        ))}
      </SectionCard>

      <Dialog open={!!postponeFor} onOpenChange={(o) => { if (!o) setPostponeFor(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reporter l’alerte</DialogTitle></DialogHeader>
          <Field label="Nouvelle échéance"><Input type="datetime-local" value={postponeAt} onChange={(e) => setPostponeAt(e.target.value)} /></Field>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPostponeFor(null)}>Annuler</Button>
            <Button disabled={pending || !postponeAt} onClick={() => { const id = postponeFor!.id; run('Alerte reportée.', async () => { const r = await postponeAlert(id, postponeAt); if (r.ok) setPostponeFor(null); return r; }); }}>Reporter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

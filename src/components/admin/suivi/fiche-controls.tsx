'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, Plus, PhoneCall, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field, InlineStatus, NativeSelect } from './ui';
import { EmailComposeDialog } from './email-compose-dialog';
import {
  createAction, deleteReport, logContactAttempt, sendActionEmail, sendAfterMeetingEmail, setActionStatus, updateAction,
} from '@/app/admin/suivi/candidats/actions';
import {
  ACTION_CATEGORIES, ACTION_LABEL, ACTION_STATUSES, ACTION_STATUS_LABEL, type ActionCategory, type ActionRow, type ActionStatus,
} from '@/lib/suivi/types';

/** Petits contrôles interactifs de la fiche candidat (îlots client dans une page serveur). */

export function ActionStatusControl({ action, staff, editable }: { action: ActionRow; staff: { id: string; name: string }[]; editable: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => start(async () => {
    setError(null);
    const r = await fn();
    if (!r.ok) setError(r.error ?? 'Erreur'); else router.refresh();
  });
  if (!editable) return <span className="text-xs text-(--color-ink-soft)">{ACTION_STATUS_LABEL[action.status]}</span>;
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <NativeSelect className="h-8 w-36 text-xs" value={action.status} disabled={pending} onChange={(e) => run(() => setActionStatus(action.id, e.target.value as ActionStatus))}>
        {ACTION_STATUSES.map((s) => <option key={s} value={s}>{ACTION_STATUS_LABEL[s]}</option>)}
      </NativeSelect>
      <NativeSelect className="h-8 w-36 text-xs" value={action.owner_id ?? ''} disabled={pending} onChange={(e) => run(() => updateAction(action.id, { owner_id: e.target.value || null }))}>
        <option value="">Responsable : —</option>
        {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
      </NativeSelect>
      <Input className="h-8 w-36 text-xs" type="date" value={action.due_date ?? ''} disabled={pending} onChange={(e) => run(() => updateAction(action.id, { due_date: e.target.value }))} title="Échéance" />
      {pending && <Loader2 className="h-3.5 w-3.5 animate-spin text-(--color-ink-muted)" />}
      {error && <span className="text-xs text-(--color-danger)">{error}</span>}
    </span>
  );
}

export function ActionEmailButton({ action, template }: { action: ActionRow; template: { subject: string; body: string } }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const prefilled = { subject: template.subject, body: template.body.replace(/\n\n\n\n/, `\n\n${ACTION_LABEL[action.category]}${action.comment ? ` : ${action.comment}` : ''}\n\n`) };
  return (
    <>
      <Button size="sm" variant="ghost" onClick={() => setOpen(true)} title="Envoyer un message lié à cette action"><Mail /></Button>
      {open && (
        <EmailComposeDialog open onOpenChange={setOpen} title="Message lié à une action" description={ACTION_LABEL[action.category]} template={prefilled}
          onSend={async (ov) => { const r = await sendActionEmail(action.id, ov); if (r.ok) router.refresh(); return r; }} />
      )}
    </>
  );
}

export function AfterMeetingEmailButton({ userId, appointmentId, template }: { userId: string; appointmentId: string | null; template: { subject: string; body: string } }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}><Mail /> Email après entretien</Button>
      {open && (
        <EmailComposeDialog open onOpenChange={setOpen} title="Email après entretien" description="Relisez et complétez le message avant l’envoi." template={template}
          onSend={async (ov) => { const r = await sendAfterMeetingEmail(userId, appointmentId, ov); if (r.ok) router.refresh(); return r; }} />
      )}
    </>
  );
}

export function DeleteReportButton({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button type="button" disabled={pending} className="text-(--color-ink-muted) hover:text-(--color-danger)" title="Supprimer ce compte rendu"
      onClick={() => { if (confirm('Supprimer ce compte rendu et ses difficultés / actions ?')) start(async () => { const r = await deleteReport(reportId); if (r.ok) router.refresh(); else alert(r.error); }); }}>
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

export function ContactAttemptForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [channel, setChannel] = useState('telephone');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}><PhoneCall /> Consigner une tentative de contact</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tentative de contact</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <Field label="Canal">
              <NativeSelect value={channel} onChange={(e) => setChannel(e.target.value)}>
                <option value="telephone">Téléphone</option><option value="sms">SMS</option><option value="whatsapp">WhatsApp</option><option value="email">Email</option><option value="autre">Autre</option>
              </NativeSelect>
            </Field>
            <Field label="Note"><Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex. messagerie, rappel demandé demain matin" /></Field>
            <InlineStatus error={error} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button disabled={pending} onClick={() => start(async () => { setError(null); const r = await logContactAttempt(userId, channel, note); if (!r.ok) { setError(r.error); return; } setNote(''); setOpen(false); router.refresh(); })}>
              {pending && <Loader2 className="animate-spin" />} Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function QuickActionDialog({ userId, staff, selfId }: { userId: string; staff: { id: string; name: string }[]; selfId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<ActionCategory>('exercices_cibles');
  const [comment, setComment] = useState('');
  const [owner, setOwner] = useState(selfId);
  const [due, setDue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}><Plus /> Ajouter une action</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nouvelle action</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <Field label="Type">
              <NativeSelect value={category} onChange={(e) => setCategory(e.target.value as ActionCategory)}>
                {ACTION_CATEGORIES.map((c) => <option key={c} value={c}>{ACTION_LABEL[c]}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Commentaire"><Textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Responsable">
                <NativeSelect value={owner} onChange={(e) => setOwner(e.target.value)}>
                  <option value="">—</option>{staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </NativeSelect>
              </Field>
              <Field label="Échéance"><Input type="date" value={due} onChange={(e) => setDue(e.target.value)} /></Field>
            </div>
            <InlineStatus error={error} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button disabled={pending} onClick={() => start(async () => { setError(null); const r = await createAction(userId, { category, comment, owner_id: owner || null, due_date: due, status: 'todo', difficulty_index: null }); if (!r.ok) { setError(r.error); return; } setComment(''); setOpen(false); router.refresh(); })}>
              {pending && <Loader2 className="animate-spin" />} Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

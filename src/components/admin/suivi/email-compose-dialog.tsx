'use client';

import { useState, useTransition } from 'react';
import { Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field, InlineStatus } from './ui';
import { TEMPLATE_VARIABLES } from '@/lib/suivi/templates';

export type ComposeResult = { ok: true; sent?: number; failed?: number } | { ok: false; error: string };

/**
 * Prévisualisation / modification d'un email de la bibliothèque avant envoi
 * (§15). Les variables sont remplacées par destinataire au moment de l'envoi.
 */
export function EmailComposeDialog({ open, onOpenChange, title, description, template, onSend, sendLabel = 'Envoyer' }: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description?: string;
  template: { subject: string; body: string };
  onSend: (override: { subject: string; body: string }) => Promise<ComposeResult>;
  sendLabel?: string;
}) {
  const [subject, setSubject] = useState(template.subject);
  const [body, setBody] = useState(template.body);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function reset(o: boolean) {
    if (o) { setSubject(template.subject); setBody(template.body); setError(null); setStatus(null); }
    onOpenChange(o);
  }

  function send() {
    setError(null); setStatus(null);
    start(async () => {
      const r = await onSend({ subject, body });
      if (!r.ok) { setError(r.error); return; }
      setStatus(r.sent !== undefined ? `${r.sent} email(s) envoyé(s)${r.failed ? `, ${r.failed} en échec` : ''}.` : 'Email envoyé.');
      setTimeout(() => onOpenChange(false), 900);
    });
  }

  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="grid gap-4">
          <Field label="Objet">
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
          </Field>
          <Field label="Message" hint={`Variables : ${TEMPLATE_VARIABLES.map((v) => `{{${v.key}}}`).join(' ')}`}>
            <Textarea rows={12} value={body} onChange={(e) => setBody(e.target.value)} className="font-mono text-[13px]" />
          </Field>
          <InlineStatus error={error} status={status} />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button type="button" onClick={send} disabled={pending || !subject.trim() || !body.trim()}>
            {pending ? <Loader2 className="animate-spin" /> : <Send />}
            {sendLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

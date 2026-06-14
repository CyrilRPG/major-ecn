'use client';

import { useState, useTransition } from 'react';
import { CheckCircle2, Loader2, MailWarning } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ResendActivationButton({ userId, displayName }: { userId: string; displayName: string }) {
  const [pending, start] = useTransition();
  const [done, setDone] = useState<null | 'ok' | 'error'>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const onClick = () => {
    setDone(null);
    setMsg(null);
    start(async () => {
      const res = await fetch('/api/admin/resend-activation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const j = (await res.json().catch(() => ({}))) as { ok?: boolean; via?: string; error?: string };
      if (!res.ok || !j.ok) {
        setDone('error');
        setMsg(j.error ?? `Échec (${res.status})`);
        return;
      }
      setDone('ok');
      setMsg(`Envoyé via ${j.via ?? '?'}`);
      setTimeout(() => { setDone(null); setMsg(null); }, 4000);
    });
  };

  return (
    <div className="inline-flex items-center gap-2">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        title={`Renvoyer l'email d'activation à ${displayName}`}
        aria-label="Renvoyer l'email d'activation"
        onClick={onClick}
        disabled={pending}
      >
        {pending
          ? <Loader2 className="h-4 w-4 animate-spin" />
          : done === 'ok'
          ? <CheckCircle2 className="h-4 w-4 text-(--color-success)" />
          : <MailWarning className="h-4 w-4 text-[#B26A00]" />}
      </Button>
      {msg && (
        <span className={`text-[10.5px] font-semibold ${done === 'ok' ? 'text-(--color-success)' : 'text-(--color-danger)'}`}>
          {msg}
        </span>
      )}
    </div>
  );
}

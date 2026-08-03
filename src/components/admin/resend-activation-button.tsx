'use client';

import { useState, useTransition } from 'react';
import { CheckCircle2, Copy, Loader2, MailWarning, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Reponse = {
  ok?: boolean;
  via?: string;
  error?: string;
  reason?: 'quota' | 'autre';
  to?: string;
  setupUrl?: string;
};

/**
 * Renvoi du lien d'activation. Si aucun canal d'envoi n'est disponible (quota
 * d'e-mails du jour atteint chez Resend, SMTP Supabase temporisé), on n'affiche
 * plus l'erreur technique brute : on donne le LIEN D'ACTIVATION à copier, pour
 * que l'équipe puisse débloquer l'élève par un autre moyen.
 */
export function ResendActivationButton({ userId, displayName }: { userId: string; displayName: string }) {
  const [pending, start] = useTransition();
  const [done, setDone] = useState<null | 'ok' | 'error'>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [lien, setLien] = useState<string | null>(null);
  const [copie, setCopie] = useState(false);

  const onClick = () => {
    setDone(null);
    setMsg(null);
    setLien(null);
    setCopie(false);
    start(async () => {
      const res = await fetch('/api/admin/resend-activation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const j = (await res.json().catch(() => ({}))) as Reponse;

      // Le lien est TOUJOURS affiché, envoi réussi ou non : c'est le moyen le
      // plus sûr de débloquer un élève (à transmettre par un autre canal si
      // l'e-mail n'arrive pas). Il est valable 1 heure et à usage unique.
      setLien(j.setupUrl ?? null);

      if (j.ok) {
        setDone('ok');
        setMsg(`Envoyé via ${j.via ?? '?'} — lien à transmettre au besoin :`);
        return;
      }

      setDone('error');
      setMsg(
        j.setupUrl
          ? j.reason === 'quota'
            ? 'Quota d’e-mails du jour atteint — transmettez ce lien à l’élève :'
            : 'Envoi impossible pour le moment — transmettez ce lien à l’élève :'
          : j.error ?? `Échec (${res.status})`,
      );
    });
  };

  return (
    <div className="inline-flex flex-col items-start gap-1">
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
          <span className={`max-w-[22rem] text-[10.5px] font-semibold ${done === 'ok' ? 'text-(--color-success)' : 'text-(--color-danger)'}`}>
            {msg}
          </span>
        )}
        {lien && (
          <button
            type="button"
            onClick={() => { setDone(null); setMsg(null); setLien(null); }}
            aria-label="Fermer"
            className="rounded p-0.5 text-(--color-ink-muted) hover:bg-(--color-sand-100)"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {lien && (
        <div className="flex max-w-[26rem] items-center gap-1.5 rounded-lg border border-(--color-border) bg-(--color-surface-soft) px-2 py-1">
          <input
            readOnly
            value={lien}
            onFocus={(e) => e.currentTarget.select()}
            className="min-w-0 flex-1 bg-transparent font-mono text-[10px] text-(--color-ink-soft) outline-none"
          />
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => {
              navigator.clipboard?.writeText(lien).then(() => {
                setCopie(true);
                setTimeout(() => setCopie(false), 2000);
              }).catch(() => { /* presse-papiers indisponible : le champ reste sélectionnable */ });
            }}
          >
            {copie ? <CheckCircle2 /> : <Copy />}
            {copie ? 'Copié' : 'Copier'}
          </Button>
        </div>
      )}
    </div>
  );
}

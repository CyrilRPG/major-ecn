'use client';

import { useState, useTransition } from 'react';
import { Check, Eye, EyeOff, KeyRound, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function PasswordChanger() {
  const [open, setOpen] = useState(false);
  const [pwd, setPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const reset = () => {
    setPwd('');
    setConfirm('');
    setError(null);
    setOpen(false);
  };

  const submit = () => {
    setError(null);
    setSuccess(false);
    if (pwd.length < 8) {
      setError('Mot de passe trop court (8 caractères minimum).');
      return;
    }
    if (pwd !== confirm) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }
    start(async () => {
      const res = await fetch('/api/profile/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(j.error ?? 'Erreur lors du changement de mot de passe.');
        return;
      }
      setSuccess(true);
      reset();
      setTimeout(() => setSuccess(false), 3000);
    });
  };

  if (!open) {
    return (
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(true)}>
          <KeyRound className="h-3.5 w-3.5" />
          Changer mon mot de passe
        </Button>
        {success && (
          <span className="inline-flex items-center gap-1 text-xs text-(--color-success)">
            <Check className="h-3.5 w-3.5" /> Mot de passe mis à jour
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-3 rounded-xl border border-(--color-border) bg-(--color-surface-soft) p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-[11px] font-medium uppercase tracking-wide text-(--color-ink-muted)">Nouveau mot de passe</span>
          <div className="relative mt-1">
            <Input
              type={show ? 'text' : 'password'}
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              placeholder="8 caractères minimum"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-(--color-ink-muted) hover:text-(--color-ink)"
              aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </label>
        <label className="block">
          <span className="text-[11px] font-medium uppercase tracking-wide text-(--color-ink-muted)">Confirmation</span>
          <Input
            type={show ? 'text' : 'password'}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-1"
            autoComplete="new-password"
          />
        </label>
      </div>
      {error && (
        <p className="rounded-lg border border-(--color-danger)/30 bg-red-50 px-3 py-2 text-sm text-(--color-danger)">{error}</p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="primary" size="sm" onClick={submit} disabled={pending}>
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <KeyRound className="h-3.5 w-3.5" />}
          Mettre à jour
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={reset} disabled={pending}>
          <X className="h-3.5 w-3.5" />
          Annuler
        </Button>
      </div>
    </div>
  );
}

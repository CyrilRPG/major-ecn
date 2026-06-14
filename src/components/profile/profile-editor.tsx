'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2, Pencil, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Initial = {
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
};

export function ProfileEditor({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(initial.first_name ?? '');
  const [lastName, setLastName] = useState(initial.last_name ?? '');
  const [phone, setPhone] = useState(initial.phone ?? '');
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const cancel = () => {
    setFirstName(initial.first_name ?? '');
    setLastName(initial.last_name ?? '');
    setPhone(initial.phone ?? '');
    setEditing(false);
    setError(null);
  };

  const save = () => {
    setError(null);
    setSuccess(false);
    start(async () => {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name: firstName, last_name: lastName, phone }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(j.error ?? 'Erreur lors de la mise à jour.');
        return;
      }
      setEditing(false);
      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    });
  };

  if (!editing) {
    return (
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(true)}>
          <Pencil className="h-3.5 w-3.5" />
          Modifier mes informations
        </Button>
        {success && (
          <span className="inline-flex items-center gap-1 text-xs text-(--color-success)">
            <Check className="h-3.5 w-3.5" /> Mis à jour
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-3 rounded-xl border border-(--color-border) bg-(--color-surface-soft) p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-[11px] font-medium uppercase tracking-wide text-(--color-ink-muted)">Prénom</span>
          <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1" />
        </label>
        <label className="block">
          <span className="text-[11px] font-medium uppercase tracking-wide text-(--color-ink-muted)">Nom</span>
          <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1" />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-[11px] font-medium uppercase tracking-wide text-(--color-ink-muted)">Téléphone</span>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+33 6 12 34 56 78" className="mt-1" />
        </label>
      </div>
      {error && (
        <p className="rounded-lg border border-(--color-danger)/30 bg-red-50 px-3 py-2 text-sm text-(--color-danger)">{error}</p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="primary" size="sm" onClick={save} disabled={pending}>
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          Enregistrer
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={cancel} disabled={pending}>
          <X className="h-3.5 w-3.5" />
          Annuler
        </Button>
      </div>
      <p className="text-[11px] text-(--color-ink-muted)">
        Pour modifier votre email, écrivez à{' '}
        <a className="font-semibold text-(--color-primary)" href="mailto:contact@major-ecn.fr">contact@major-ecn.fr</a>.
      </p>
    </div>
  );
}

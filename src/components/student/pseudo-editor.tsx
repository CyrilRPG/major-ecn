'use client';

import { useState, useTransition } from 'react';
import { AlertCircle, Check, Loader2, RotateCcw, Save } from 'lucide-react';
import { updatePseudoAction, regeneratePseudoAction } from '@/app/(student)/profil/actions';

export function PseudoEditor({ initial }: { initial: string }) {
  const [value, setValue] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData();
    fd.set('pseudo', value);
    setError(null);
    setSaved(false);
    start(async () => {
      const res = await updatePseudoAction(fd);
      if ('error' in res) setError(res.error);
      else {
        setSaved(true);
        setTimeout(() => setSaved(false), 1800);
      }
    });
  };

  const onRegenerate = () => {
    setError(null);
    setSaved(false);
    start(async () => {
      const res = await regeneratePseudoAction();
      if ('error' in res) setError(res.error);
      else {
        setSaved(true);
        setTimeout(() => setSaved(false), 1800);
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="pseudo"
          name="pseudo"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="prenom.nom.promo"
          className="flex-1 rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-2.5 font-mono text-sm text-(--color-ink) outline-none transition-colors focus:border-(--color-primary)"
        />
        <button
          type="submit"
          disabled={pending || value.trim().toLowerCase() === initial}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-(--color-primary) px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Enregistrer
        </button>
        <button
          type="button"
          onClick={onRegenerate}
          disabled={pending}
          title="Regénérer un pseudo à partir de prénom + nom + promo"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-(--color-border) bg-(--color-surface) px-3.5 py-2.5 text-sm font-medium text-(--color-ink-soft) hover:border-(--color-primary)/40 hover:text-(--color-ink) disabled:opacity-50"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
      <p className="text-xs text-(--color-ink-muted)">
        3 à 40 caractères. Lettres, chiffres, point, tiret ou underscore. Visible sur le forum
        des questions/réponses. <span className="font-semibold">Salut prénom</span> reste utilisé partout ailleurs.
      </p>
      {error && (
        <p className="flex items-center gap-1.5 text-sm text-(--color-danger)">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}
      {saved && (
        <p className="flex items-center gap-1.5 text-sm text-[#1F6B43]">
          <Check className="h-4 w-4 shrink-0" />
          Pseudo enregistré.
        </p>
      )}
    </form>
  );
}

'use client';

/**
 * Sélecteur d'avatar « dessin » : aperçu en grand, grille de propositions
 * aléatoires (régénérables) et enregistrement de la graine choisie.
 */
import { useState } from 'react';
import { Check, Loader2, RefreshCw } from 'lucide-react';
import { DrawnAvatar } from '@/components/avatar/drawn-avatar';
import { randomAvatarSeed } from '@/lib/avatar';

function freshOptions(n: number): string[] {
  return Array.from({ length: n }, () => randomAvatarSeed());
}

export function AvatarPicker({ initialSeed }: { initialSeed: string }) {
  const [current, setCurrent] = useState(initialSeed);
  const [selected, setSelected] = useState(initialSeed);
  const [options, setOptions] = useState<string[]>(() => freshOptions(11));
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const choices = [current, ...options.filter((o) => o !== current)].slice(0, 12);

  async function save() {
    if (selected === current) return;
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch('/api/profile/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed: selected }),
      });
      if (res.ok) {
        setCurrent(selected);
        setMsg('Avatar enregistré.');
      } else {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setMsg(j.error ?? 'Échec de l’enregistrement.');
      }
    } catch {
      setMsg('Erreur réseau.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
      <div className="flex flex-col items-center gap-2">
        <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-2">
          <DrawnAvatar seed={selected} size={96} className="rounded-2xl" />
        </div>
        <span className="text-xs text-(--color-ink-soft)">Aperçu</span>
      </div>

      <div className="flex-1">
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
          {choices.map((seed) => {
            const active = seed === selected;
            return (
              <button
                key={seed}
                type="button"
                onClick={() => setSelected(seed)}
                className={`relative rounded-xl border-2 p-0.5 transition ${
                  active ? 'border-(--color-primary)' : 'border-transparent hover:border-(--color-border)'
                }`}
                aria-label="Choisir cet avatar"
              >
                <DrawnAvatar seed={seed} size={44} className="rounded-lg" />
                {active && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-(--color-primary) text-white">
                    <Check className="h-2.5 w-2.5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOptions(freshOptions(11))}
            className="inline-flex items-center gap-1.5 rounded-lg border border-(--color-border) px-3 py-1.5 text-xs font-bold text-(--color-ink) hover:bg-(--color-sand-100)"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Régénérer
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving || selected === current}
            className="inline-flex items-center gap-1.5 rounded-lg bg-(--color-primary) px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            Enregistrer
          </button>
          {msg && <span className="text-xs text-(--color-ink-soft)">{msg}</span>}
        </div>
      </div>
    </div>
  );
}

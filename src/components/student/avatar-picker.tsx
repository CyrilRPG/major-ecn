'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2, Undo2 } from 'lucide-react';
import { AvatarParcours } from '@/components/avatar/avatar-parcours';
import { canoniserAvatar } from '@/lib/avatars/portraits';

/**
 * Choix de l'avatar d'un compte Major ECN, trait par trait.
 *
 * Aucune unicité ici : plusieurs comptes de la plateforme peuvent porter le
 * même portrait. Seule EVC Arena réserve un portrait à un participant.
 */
export function AvatarPicker({ initialSeed }: { initialSeed: string }) {
  const router = useRouter();
  const depart = canoniserAvatar(initialSeed);
  const [current, setCurrent] = useState(depart);
  const [selected, setSelected] = useState(depart);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

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
        router.refresh();
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
    <AvatarParcours
      valeur={selected}
      onChange={(seed) => { setSelected(seed); setMsg(null); }}
      legende="Chaque choix se voit tout de suite. Les deux petites vignettes montrent votre avatar aux tailles du forum et du classement."
      actions={
        <>
          <button
            type="button"
            onClick={() => { setSelected(current); setMsg(null); }}
            disabled={saving || selected === current}
            className="inline-flex items-center gap-1.5 rounded-lg border border-(--color-border) px-3 py-1.5 text-xs font-bold text-(--color-ink) hover:bg-(--color-sand-100) disabled:opacity-50"
          >
            <Undo2 className="h-3.5 w-3.5" /> Annuler
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
          <span role="status" className="text-xs text-(--color-ink-soft)">{msg}</span>
        </>
      }
    />
  );
}

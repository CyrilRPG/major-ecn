'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2, Undo2 } from 'lucide-react';
import { AvatarAtelier } from '@/components/avatar/avatar-atelier';
import { avatarDepuisChaine, estAvatarCompose } from '@/lib/avatars/traits';

/**
 * Choix du médaillon d'un compte Major ECN.
 *
 * L'unicité est celle de Major ECN et d'elle seule : deux comptes de la
 * plateforme ne portent jamais le même médaillon, mais un participant d'EVC
 * Arena peut avoir exactement le même sans que cela gêne personne.
 */
export function AvatarPicker({ initialSeed }: { initialSeed: string }) {
  const router = useRouter();
  const depart = estAvatarCompose(initialSeed)
    ? initialSeed
    : avatarDepuisChaine(initialSeed, 'plateforme');
  const [current, setCurrent] = useState(initialSeed);
  const [selected, setSelected] = useState(depart);
  const [dispo, setDispo] = useState<'inconnu' | 'verification' | 'libre' | 'pris'>('inconnu');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const verifierDisponibilite = useCallback(async (seeds: string[]) => {
    const res = await fetch('/api/profile/avatar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seeds }),
    });
    if (!res.ok) return [];
    const j = (await res.json()) as { pris?: string[] };
    return j.pris ?? [];
  }, []);

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
        setMsg('Médaillon enregistré.');
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
    <AvatarAtelier
      valeur={selected}
      onChange={(seed) => { setSelected(seed); setMsg(null); }}
      perimetre="plateforme"
      verifierDisponibilite={verifierDisponibilite}
      onDisponibilite={setDispo}
      legende="Chaque réglage se voit tout de suite. Les deux petites vignettes montrent votre médaillon aux tailles du forum et du classement."
      actions={
        <>
          <button
            type="button"
            onClick={() => { setSelected(depart); setMsg(null); }}
            disabled={saving || selected === depart}
            className="inline-flex items-center gap-1.5 rounded-lg border border-(--color-border) px-3 py-1.5 text-xs font-bold text-(--color-ink) hover:bg-(--color-sand-100) disabled:opacity-50"
          >
            <Undo2 className="h-3.5 w-3.5" /> Revenir au départ
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving || selected === current || dispo === 'pris' || dispo === 'verification'}
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

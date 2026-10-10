'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** Ajout d'un document justificatif (fichier du seau privé `qualite` ou lien). */
export function FormulaireDocument({ action }: { action: (form: FormData) => Promise<{ ok: boolean; error?: string; message?: string }> }) {
  const router = useRouter();
  const [ouvert, setOuvert] = React.useState(false);
  const [occupe, setOccupe] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);
  return (
    <span className="inline-flex flex-col items-end gap-1">
      <Button type="button" size="sm" variant="ghost" onClick={() => setOuvert((o) => !o)}><Paperclip />Justificatif</Button>
      {ouvert && (
        <form className="flex w-72 flex-col gap-2 rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) p-3 text-xs"
          onSubmit={async (e) => {
            e.preventDefault();
            setOccupe(true); setMsg(null);
            const r = await action(new FormData(e.currentTarget)).catch((err) => ({ ok: false, error: String(err) }));
            setOccupe(false);
            if (r.ok) { setOuvert(false); router.refresh(); } else setMsg(r.error ?? 'Échec');
          }}>
          <label className="flex flex-col gap-1">Nom<input name="nom" className="h-8 rounded border border-(--color-border) px-2" /></label>
          <label className="flex flex-col gap-1">Fichier (4 Mo max)<input name="fichier" type="file" /></label>
          <label className="flex flex-col gap-1">ou lien<input name="url" type="url" placeholder="https://…" className="h-8 rounded border border-(--color-border) px-2" /></label>
          <Button type="submit" size="sm" disabled={occupe}>{occupe && <Loader2 className="animate-spin" />}Ajouter</Button>
          {msg && <span className="text-(--color-danger)">{msg}</span>}
        </form>
      )}
    </span>
  );
}

'use client';

/**
 * Téléversement direct d'un document professeur (CV, certificat, carte pro)
 * dans le bucket privé `prof-docs`, puis enregistrement du chemin en base via
 * `/api/profile/document`. Utilisable par le prof lui-même (son dossier) ou par
 * un admin pour un prof donné (`targetUserId`).
 */

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ExternalLink, FileText, Loader2, Upload } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Props = {
  kind: 'cv' | 'certificat' | 'carte_pro';
  label: string;
  /** UUID du profil propriétaire du document (dossier de stockage). */
  targetUserId: string;
  /** Valeur actuelle en base (chemin de stockage ou URL legacy), si présente. */
  currentValue?: string | null;
  accept?: string;
};

export function ProfDocumentUpload({ kind, label, targetUserId, currentValue, accept = '.pdf,image/*' }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justDone, setJustDone] = useState(false);
  const has = !!currentValue;

  async function handle(file: File) {
    setError(null);
    if (file.size > 15 * 1024 * 1024) { setError('Fichier trop volumineux (max 15 Mo).'); return; }
    setBusy(true);
    try {
      const ext = (file.name.split('.').pop() || 'pdf').toLowerCase().replace(/[^a-z0-9]/g, '');
      const path = `${targetUserId}/${kind}-${Date.now()}.${ext}`;
      const supabase = createClient();
      const { error: upErr } = await supabase.storage.from('prof-docs').upload(path, file, { upsert: true });
      if (upErr) { setError(upErr.message); return; }
      const res = await fetch('/api/profile/document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, path, userId: targetUserId }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(j.error ?? 'Échec de l’enregistrement.');
        return;
      }
      setJustDone(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur réseau');
    } finally { setBusy(false); }
  }

  return (
    <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-3">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 shrink-0 text-(--color-ink-soft)" />
        <span className="text-sm font-medium text-(--color-ink)">{label}</span>
        {(has || justDone) && (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" /> Déposé
          </span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handle(f); }}
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-(--color-border) px-3 py-1.5 text-xs font-semibold text-(--color-ink) hover:bg-(--color-sand-100) disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {has || justDone ? 'Remplacer' : 'Téléverser'}
        </button>
        {(has || justDone) && (
          <a
            href={`/api/profile/document?kind=${kind}&userId=${targetUserId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-(--color-primary) hover:bg-(--color-sand-100)"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Voir
          </a>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-(--color-danger)">{error}</p>}
      <p className="mt-1.5 text-[11px] text-(--color-ink-muted)">PDF ou image, 15 Mo max. Stockage privé.</p>
    </div>
  );
}

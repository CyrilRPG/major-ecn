'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Download, FileText, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchAuthentifie } from '@/lib/auth/fresh-token';
import { createClient } from '@/lib/supabase/client';
import { attachCorrectionsPdf, prepareCorrectionsUpload, removeCorrectionsPdf } from '@/app/admin/arena/pdf-actions';
import type { RoundRow } from '@/lib/arena/types';

/** PDF de corrections par manche : généré par la plateforme ou fourni par Major ECN (§12.1). */
export function PdfPanel({ rounds }: { rounds: RoundRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const generate = async (r: RoundRow) => {
    setBusy(r.id); setError(null); setMsg(null);
    try {
      const res = await fetchAuthentifie(`/api/admin/arena/rounds/${r.id}/pdf`, { method: 'POST' });
      const j = await res.json();
      if (!res.ok) setError(j.error ?? 'Génération impossible.'); else setMsg(`PDF de la manche ${r.number} généré.`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setBusy(null);
    }
  };

  const download = async (r: RoundRow) => {
    const res = await fetchAuthentifie(`/api/admin/arena/rounds/${r.id}/pdf`);
    if (!res.ok) { setError('Téléchargement impossible.'); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const upload = async (r: RoundRow, file: File) => {
    if (file.type !== 'application/pdf') { setError('Fichier PDF attendu.'); return; }
    if (file.size > 20 * 1024 * 1024) { setError('20 Mo maximum.'); return; }
    setBusy(r.id); setError(null); setMsg(null);
    try {
      const prep = await prepareCorrectionsUpload(r.id);
      if (!prep.ok) { setError(prep.error); return; }
      const supabase = createClient();
      const { error: upErr } = await supabase.storage.from('arena').uploadToSignedUrl(prep.path, prep.token, file, { contentType: 'application/pdf' });
      if (upErr) { setError(upErr.message); return; }
      const att = await attachCorrectionsPdf(r.id, prep.path);
      if (!att.ok) setError(att.error); else setMsg(`PDF fourni rattaché à la manche ${r.number}.`);
      router.refresh();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      {error && <p className="text-sm font-semibold text-(--color-danger)">{error}</p>}
      {msg && <p className="text-sm font-semibold text-emerald-700">{msg}</p>}
      {rounds.map((r) => (
        <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-soft)">
          <div>
            <p className="text-sm font-bold">Manche {r.number}{r.theme ? ` · ${r.theme}` : ''}</p>
            <p className="text-xs text-(--color-ink-soft)">
              {r.corrections_pdf_path ? `${r.corrections_pdf_source === 'uploaded' ? 'PDF fourni' : 'PDF généré'} le ${r.corrections_pdf_generated_at ? new Date(r.corrections_pdf_generated_at).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }) : ''} — usage interne uniquement.` : 'Aucun PDF — usage interne uniquement.'}
              {' '}Les participants consultent leur correction détaillée dans la visionneuse de leur espace (filigrane nominatif, sans téléchargement) ; aucun fichier n’est joint aux emails.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" disabled={busy === r.id} onClick={() => generate(r)}><FileText className="mr-1 h-4 w-4" /> {busy === r.id ? 'Génération…' : 'Générer depuis le contenu'}</Button>
            <label className="inline-flex cursor-pointer items-center rounded-(--radius-button) border border-(--color-border) px-3 py-1.5 text-sm font-semibold hover:bg-(--color-surface-soft)">
              <Upload className="mr-1 h-4 w-4" /> Téléverser un PDF fourni
              <input type="file" accept="application/pdf" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(r, f); e.target.value = ''; }} />
            </label>
            {r.corrections_pdf_path && <>
              <Button size="sm" variant="ghost" onClick={() => download(r)}><Download className="mr-1 h-4 w-4" /> Voir</Button>
              <Button size="sm" variant="ghost" disabled={pending} onClick={() => start(async () => { const x = await removeCorrectionsPdf(r.id); if (!x.ok) setError(x.error); router.refresh(); })}><Trash2 className="h-4 w-4" /></Button>
            </>}
          </div>
        </div>
      ))}
    </div>
  );
}

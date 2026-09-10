'use client';

import Image from 'next/image';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ImagePlus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { prepareCoverUpload, setCoverImage } from '@/app/admin/arena/cover-actions';
import { coverImageUrl, specialtyVisual } from '@/lib/arena/specialty-visual';

/**
 * Visuel de la carte du tournoi : aperçu (visuel déposé ou visuel par défaut
 * de la spécialité), dépôt d'une image (PNG / JPEG / WebP, 4 Mo max, envoyée
 * par le navigateur dans le bucket public), retrait.
 */
export function CoverField({ tournamentId, specialty, specialtyId, coverPath }: { tournamentId: string; specialty: string; specialtyId: string | null; coverPath: string | null }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pending, start] = useTransition();
  const custom = coverImageUrl(process.env.NEXT_PUBLIC_SUPABASE_URL, coverPath);
  const fallback = specialtyVisual(specialty, specialtyId);

  const upload = async (file: File) => {
    setError(null);
    if (file.size > 4 * 1024 * 1024) { setError('4 Mo maximum.'); return; }
    setBusy(true);
    try {
      const prep = await prepareCoverUpload(tournamentId, file.type);
      if (!prep.ok) { setError(prep.error); return; }
      const { error: upErr } = await createClient().storage.from('arena-public').uploadToSignedUrl(prep.path, prep.token, file, { contentType: file.type });
      if (upErr) { setError(upErr.message); return; }
      const r = await setCoverImage(tournamentId, prep.path);
      if (!r.ok) setError(r.error); else router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-5">
      <span className="relative block h-24 w-28 shrink-0 overflow-hidden rounded-xl" style={{ background: 'linear-gradient(180deg, #141A22, #0B0F14)', boxShadow: 'inset 0 0 0 1px rgba(212,169,74,0.35)' }}>
        <Image src={custom ?? fallback.src} alt="" fill sizes="112px" className="object-contain p-1" unoptimized={Boolean(custom)} />
      </span>
      <div className="min-w-0 flex-1 space-y-2 text-sm">
        <p className="text-(--color-ink-soft)">{custom ? 'Visuel déposé pour ce tournoi.' : `Visuel par défaut de la spécialité (${fallback.alt}). Déposez une image pour le remplacer.`}</p>
        <div className="flex flex-wrap gap-2">
          <label className="inline-flex cursor-pointer items-center rounded-(--radius-button) border border-(--color-border) px-3 py-1.5 text-sm font-semibold hover:bg-(--color-surface-soft)">
            <ImagePlus className="mr-1.5 h-4 w-4" /> {busy ? 'Envoi…' : custom ? 'Remplacer le visuel' : 'Déposer un visuel'}
            <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" disabled={busy} onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ''; }} />
          </label>
          {custom && (
            <Button size="sm" variant="ghost" disabled={pending || busy} onClick={() => start(async () => { const r = await setCoverImage(tournamentId, null); if (!r.ok) setError(r.error); else router.refresh(); })}>
              <Trash2 className="mr-1 h-4 w-4" /> Retirer
            </Button>
          )}
        </div>
        <p className="text-xs text-(--color-ink-muted)">PNG, JPEG ou WebP, 4 Mo max. Idéal : sujet détouré sur fond sombre ou transparent, format paysage (environ 440 × 370 px), comme les visuels de spécialité.</p>
        {error && <p className="text-xs font-semibold text-(--color-danger)">{error}</p>}
      </div>
    </div>
  );
}

'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as tus from 'tus-js-client';
import { CheckCircle2, Loader2, UploadCloud, Video } from 'lucide-react';

/**
 * Upload d'une vidéo de cours directement vers Bunny Stream (TUS résumable).
 * Le navigateur envoie le fichier à Bunny avec une signature pré-calculée côté
 * serveur (la clé API reste serveur). Gros fichiers OK (pas de limite Vercel).
 */
export function BunnyVideoUpload({
  coursId, defaultTitle, type = 'cours', onDone,
}: {
  coursId: string;
  defaultTitle: string;
  /** Catégorie de la vidéo créée — elle porte la permission côté élève. */
  type?: 'cours' | 'seance_approfondie';
  /** Appelé après l'envoi (la bibliothèque recharge sa liste elle-même). */
  onDone?: () => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<'idle' | 'creating' | 'uploading' | 'done'>('idle');
  const [pct, setPct] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function onFile(file: File | null) {
    if (!file) return;
    setError(null);
    setPct(0);
    setPhase('creating');
    try {
      // 1) Crée le conteneur Bunny + récupère l'autorisation TUS.
      const res = await fetch('/api/admin/videos/bunny/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coursId, title: defaultTitle, type }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? 'Création de la vidéo échouée.');

      // 2) Upload TUS direct vers Bunny.
      setPhase('uploading');
      await new Promise<void>((resolve, reject) => {
        const upload = new tus.Upload(file, {
          endpoint: j.endpoint,
          retryDelays: [0, 2000, 5000, 10000, 20000],
          headers: {
            AuthorizationSignature: j.signature,
            AuthorizationExpire: String(j.expire),
            VideoId: j.videoId,
            LibraryId: String(j.libraryId),
          },
          metadata: { filetype: file.type, title: defaultTitle.slice(0, 200) },
          onError: (err) => reject(err),
          onProgress: (sent, total) => setPct(total ? Math.round((sent / total) * 100) : 0),
          onSuccess: () => resolve(),
        });
        upload.start();
      });

      setPhase('done');
      if (onDone) onDone(); else router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors du téléversement.');
      setPhase('idle');
    } finally {
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  const busy = phase === 'creating' || phase === 'uploading';

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-(--color-border) bg-(--color-surface) px-4 py-6 text-sm font-semibold text-(--color-ink-soft) transition-colors hover:border-(--color-primary) hover:text-(--color-primary) disabled:opacity-70"
      >
        {phase === 'creating' && <><Loader2 className="h-4 w-4 animate-spin" /> Préparation…</>}
        {phase === 'uploading' && <><Loader2 className="h-4 w-4 animate-spin" /> Téléversement vers Bunny… {pct}%</>}
        {phase === 'done' && <><CheckCircle2 className="h-4 w-4 text-[#16A34A]" /> Vidéo envoyée — encodage Bunny en cours</>}
        {phase === 'idle' && <><UploadCloud className="h-4 w-4" /> Téléverser une vidéo (Bunny Stream)</>}
      </button>

      {phase === 'uploading' && (
        <div className="h-2 w-full overflow-hidden rounded-full bg-(--color-surface-soft)">
          <div className="h-full rounded-full bg-(--color-primary) transition-all" style={{ width: `${pct}%` }} />
        </div>
      )}

      <p className="flex items-center gap-1.5 text-[12px] text-(--color-ink-muted)">
        <Video className="h-3.5 w-3.5" />
        MP4 / MOV / WebM. Envoi direct vers le CDN Bunny (pas de limite de taille) : la vidéo
        s’ajoute à la fin de la liste, vous pouvez ensuite la renommer et la déplacer.
      </p>

      {error && <p className="rounded-lg bg-(--color-primary-soft) px-3 py-2 text-xs text-(--color-primary-deep)">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm,video/x-matroska"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        disabled={busy}
      />
    </div>
  );
}

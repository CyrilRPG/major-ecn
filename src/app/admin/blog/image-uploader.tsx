'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { uploadBlogImage } from './actions';

export function ImageUploader({
  value,
  onChange,
  label = 'Image',
  aspClass = 'aspect-[16/9]',
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  aspClass?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await uploadBlogImage(fd);
      if (res.ok) onChange(res.url);
      else setError(res.error);
    } catch {
      setError('Échec de l’envoi.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {value ? (
        <div className={`relative w-full overflow-hidden rounded-lg border border-(--color-border) ${aspClass}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
            title="Retirer l’image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className={`flex w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-(--color-border) bg-(--color-surface-soft) text-(--color-ink-muted) hover:border-[#E4002B] hover:text-[#E4002B] ${aspClass}`}
        >
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
          <span className="text-xs font-medium">{busy ? 'Envoi…' : `Ajouter ${label.toLowerCase()}`}</span>
        </button>
      )}
      <div className="mt-1.5 flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = '';
          }}
        />
        <input
          type="url"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value || null)}
          placeholder="…ou coller une URL d’image"
          className="min-w-0 flex-1 rounded-md border border-(--color-border) px-2 py-1 text-xs text-(--color-ink)"
        />
      </div>
      {error && <p className="mt-1 text-xs text-[#C0001F]">{error}</p>}
    </div>
  );
}

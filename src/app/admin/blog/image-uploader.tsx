'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { uploadBlogImageFromBrowser } from './upload-image-browser';
import { useImageDrop } from './use-image-drop';

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
    // Le fichier part directement vers Supabase Storage : passer par une server
    // action le faisait buter sur le plafond de 4,5 Mo des corps de requête.
    const res = await uploadBlogImageFromBrowser(file);
    setBusy(false);
    if (res.ok) onChange(res.url);
    else setError(res.error);
  }

  const drop = useImageDrop((files) => void handleFile(files[0]));

  return (
    <div>
      <div
        {...drop.dropProps}
        className={`relative w-full overflow-hidden rounded-lg border ${aspClass} ${
          drop.over ? 'border-[#E4002B] ring-2 ring-[#E4002B]/25' : 'border-(--color-border)'
        }`}
      >
        {value ? (
          <>
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
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="flex h-full w-full flex-col items-center justify-center gap-1.5 border-dashed bg-(--color-surface-soft) text-(--color-ink-muted) hover:text-[#E4002B]"
          >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
            <span className="text-xs font-medium">
              {busy ? 'Envoi…' : `Déposer ${label.toLowerCase()} ou cliquer`}
            </span>
          </button>
        )}
        {drop.over && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#E4002B]/10 text-xs font-bold text-[#C0001F]">
            Déposez l’image
          </div>
        )}
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
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

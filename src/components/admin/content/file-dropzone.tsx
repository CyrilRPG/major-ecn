'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

type Props = {
  bucket: 'videos' | 'fiches';
  coursId: string;
  rowId?: string;
  existingPath?: string | null;
  table: 'videos' | 'fiches';
  accept: string;
  label: string;
  hint?: string;
};

export function FileDropzone({ bucket, coursId, rowId, existingPath, table, accept, label, hint }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const upload = (file: File) => {
    setError(null);
    setProgress(0);
    start(async () => {
      const supabase = createClient();
      const path = `${coursId}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
      if (upErr) {
        setError(upErr.message);
        setProgress(null);
        return;
      }
      // Update DB row
      if (rowId) {
        await supabase.from(table).update({ storage_path: path }).eq('id', rowId);
      } else {
        await supabase.from(table).insert({ cours_id: coursId, storage_path: path, titre: label });
      }
      setProgress(100);
      router.refresh();
    });
  };

  const remove = () => {
    start(async () => {
      const supabase = createClient();
      if (existingPath) await supabase.storage.from(bucket).remove([existingPath]);
      if (rowId) await supabase.from(table).update({ storage_path: null }).eq('id', rowId);
      router.refresh();
    });
  };

  return (
    <div
      onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files?.[0];
        if (f) upload(f);
      }}
      className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition ${
        dragging ? 'border-(--color-primary) bg-(--color-primary-soft)' : 'border-(--color-border) bg-(--color-surface-soft)'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }}
      />
      <Upload className="mx-auto h-8 w-8 text-(--color-primary) mb-2" />
      <p className="font-medium text-(--color-ink)">{label}</p>
      {hint && <p className="text-xs text-(--color-ink-soft) mt-1">{hint}</p>}
      <div className="mt-4 flex items-center justify-center gap-3">
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={pending}>
          {pending && progress !== 100 ? <Loader2 className="animate-spin" /> : <Upload />}
          {existingPath ? 'Remplacer' : 'Choisir un fichier'}
        </Button>
        {existingPath && (
          <Button type="button" variant="ghost" size="sm" onClick={remove} disabled={pending} className="text-(--color-danger)">
            <Trash2 />
            Supprimer
          </Button>
        )}
      </div>
      {progress === 100 && (
        <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-600">
          <CheckCircle2 className="h-3.5 w-3.5" /> Téléversement terminé
        </p>
      )}
      {error && <p className="mt-3 text-xs text-(--color-danger)">{error}</p>}
    </div>
  );
}

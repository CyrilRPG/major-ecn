'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, FileUp, Loader2, SkipForward } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { submitSatisfactionAction, skipSatisfactionAction } from '@/app/(student)/formulaires/[id]/actions';
import type { FormField } from '@/lib/schemas/satisfaction';

export function StudentForm({
  formId, fields, mandatory, userId, allowUpload, uploadLabel,
}: {
  formId: string;
  fields: FormField[];
  mandatory: boolean;
  userId: string;
  allowUpload: boolean;
  uploadLabel: string | null;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [uploading, setUploading] = useState(false);

  const setField = (k: string, v: string | number) => setAnswers((a) => ({ ...a, [k]: v }));

  const onSubmit = async () => {
    setError(null);
    let filePath: string | null = null;
    if (file) {
      setUploading(true);
      const supabase = createClient();
      const safe = file.name.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 80);
      const path = `${userId}/${formId}/${Date.now()}_${safe}`;
      const { error: upErr } = await supabase.storage
        .from('satisfaction-uploads')
        .upload(path, file, { upsert: true });
      setUploading(false);
      if (upErr) { setError('Échec de l’upload : ' + upErr.message); return; }
      filePath = path;
    }

    start(async () => {
      const res = await submitSatisfactionAction(formId, answers, filePath);
      if ('error' in res) { setError(res.error); return; }
      router.push('/accueil?form_sent=1');
      router.refresh();
    });
  };

  const onSkip = () => {
    if (mandatory) return;
    start(async () => {
      const res = await skipSatisfactionAction(formId);
      if ('error' in res) { setError(res.error); return; }
      router.push('/accueil');
      router.refresh();
    });
  };

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
      className="space-y-5 rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft) sm:p-6"
    >
      {fields.map((f) => (
        <FieldInput key={f.key} field={f} value={answers[f.key] ?? ''} onChange={(v) => setField(f.key, v)} />
      ))}

      {allowUpload && (
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-(--color-ink)">
            <FileUp className="h-4 w-4 text-(--color-primary)" />
            {uploadLabel ?? 'Fichier à joindre'}
          </label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="mt-2 block w-full rounded-xl border border-dashed border-(--color-border) bg-(--color-surface-soft) px-3 py-3 text-sm text-(--color-ink-soft) file:mr-3 file:rounded-lg file:border-0 file:bg-(--color-primary) file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white"
          />
          {file && (
            <p className="mt-1.5 text-xs text-(--color-ink-muted)">
              {file.name} — {(file.size / 1024).toFixed(1)} ko
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-(--color-danger)/10 px-3 py-2 text-sm text-(--color-danger)">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
        {!mandatory && (
          <button
            type="button"
            onClick={onSkip}
            disabled={pending || uploading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-2.5 text-sm font-medium text-(--color-ink-soft) hover:text-(--color-ink)"
          >
            <SkipForward className="h-4 w-4" />
            Passer
          </button>
        )}
        <button
          type="submit"
          disabled={pending || uploading}
          className="inline-flex items-center gap-2 rounded-xl bg-(--color-primary) px-5 py-2.5 text-sm font-semibold text-white shadow-(--shadow-soft) transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {pending || uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          {uploading ? 'Téléversement…' : pending ? 'Envoi…' : 'Envoyer mes réponses'}
        </button>
      </div>
    </form>
  );
}

function FieldInput({
  field, value, onChange,
}: { field: FormField; value: string | number; onChange: (v: string | number) => void }) {
  if (field.type === 'textarea') {
    return (
      <div className="space-y-1.5">
        <Label field={field} />
        <textarea
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          rows={4}
          className="w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm outline-none focus:border-(--color-primary)"
        />
      </div>
    );
  }
  if (field.type === 'select') {
    return (
      <div className="space-y-1.5">
        <Label field={field} />
        <select
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          className="w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-3 py-2.5 text-sm outline-none focus:border-(--color-primary)"
        >
          <option value="">— Sélectionner —</option>
          {(field.options ?? []).map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>
    );
  }
  if (field.type === 'rating') {
    const current = Number(value) || 0;
    return (
      <div className="space-y-1.5">
        <Label field={field} />
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={`h-10 w-10 rounded-lg border text-sm font-semibold transition-colors ${
                current >= n
                  ? 'border-(--color-primary) bg-(--color-primary) text-white'
                  : 'border-(--color-border) bg-(--color-surface) text-(--color-ink-soft) hover:border-(--color-primary)/50'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-1.5">
      <Label field={field} />
      <input
        type="text"
        value={String(value)}
        onChange={(e) => onChange(e.target.value)}
        required={field.required}
        className="w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-3 py-2.5 text-sm outline-none focus:border-(--color-primary)"
      />
    </div>
  );
}

function Label({ field }: { field: FormField }) {
  return (
    <label className="text-sm font-medium text-(--color-ink)">
      {field.label}
      {field.required && <span className="ml-1 text-(--color-danger)">*</span>}
    </label>
  );
}

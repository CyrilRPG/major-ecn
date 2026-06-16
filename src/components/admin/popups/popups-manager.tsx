'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Trash2, Upload, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { createPopup, deletePopup, togglePopup } from '@/app/admin/popups/actions';

export type CoursOption = { id: string; titre: string; college: string };
export type PopupRow = {
  id: string;
  cours_id: string;
  title: string | null;
  active: boolean;
  coursTitre: string;
  college: string;
  videoUrl: string;
};

export function PopupsManager({ cours, popups }: { cours: CoursOption[]; popups: PopupRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [coursId, setCoursId] = useState('');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    if (!coursId) { setError('Choisissez l’item associé.'); return; }
    if (!file) { setError('Sélectionnez une vidéo mp4.'); return; }
    if (file.type !== 'video/mp4' && !file.name.toLowerCase().endsWith('.mp4')) {
      setError('Le fichier doit être un mp4.'); return;
    }
    setUploading(true);
    try {
      const supabase = createClient();
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `${coursId}/${Date.now()}-${safe}`;
      const { error: upErr } = await supabase.storage
        .from('item-popups')
        .upload(path, file, { contentType: 'video/mp4', upsert: false });
      if (upErr) { setError(upErr.message); setUploading(false); return; }
      const r = await createPopup({ coursId, title, videoPath: path });
      if (!r.ok) { setError(r.error ?? 'Erreur'); setUploading(false); return; }
      setCoursId(''); setTitle(''); setFile(null);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur réseau');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Formulaire de création */}
      <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft)">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-(--color-ink-muted)">Nouvelle popup</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-(--color-ink-soft)">Item associé</span>
            <select
              value={coursId}
              onChange={(e) => setCoursId(e.target.value)}
              className="w-full rounded-lg border border-(--color-border) bg-white px-3 py-2 text-sm"
            >
              <option value="">Choisir un item…</option>
              {cours.map((c) => (
                <option key={c.id} value={c.id}>{c.college} · {c.titre}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-(--color-ink-soft)">Titre (optionnel)</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex. À regarder avant de commencer"
              className="w-full rounded-lg border border-(--color-border) bg-white px-3 py-2 text-sm"
            />
          </label>
        </div>

        <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-(--color-border) px-4 py-3 text-sm hover:bg-(--color-sand-100)">
          <Upload className="h-4 w-4 text-(--color-ink-soft)" />
          <span className="text-(--color-ink-soft)">{file ? file.name : 'Sélectionner une vidéo mp4…'}</span>
          <input
            type="file"
            accept="video/mp4"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>

        {error && <p className="mt-2 text-xs font-medium text-(--color-danger)">{error}</p>}

        <button
          type="button"
          onClick={submit}
          disabled={uploading}
          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {uploading ? 'Téléversement…' : 'Créer la popup'}
        </button>
      </section>

      {/* Liste */}
      <section className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wide text-(--color-ink-muted)">
          Popups existantes ({popups.length})
        </p>
        {popups.length === 0 && (
          <p className="rounded-xl border border-dashed border-(--color-border) p-6 text-center text-sm text-(--color-ink-muted)">
            Aucune popup pour l’instant.
          </p>
        )}
        {popups.map((p) => (
          <article key={p.id} className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-3 sm:flex-row sm:items-center">
            <video src={p.videoUrl} controls className="h-24 w-40 shrink-0 rounded-lg bg-black object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-(--color-ink)">{p.title || 'Popup vidéo'}</p>
              <p className="truncate text-xs text-(--color-ink-soft)">{p.college} · {p.coursTitre}</p>
              <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${p.active ? 'bg-green-100 text-green-700' : 'bg-(--color-sand-100) text-(--color-ink-soft)'}`}>
                {p.active ? 'Active' : 'Désactivée'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => startTransition(async () => { await togglePopup(p.id, !p.active); router.refresh(); })}
                disabled={pending}
                className="flex h-8 w-8 items-center justify-center rounded-md text-(--color-ink-soft) hover:bg-(--color-sand-100)"
                title={p.active ? 'Désactiver' : 'Activer'}
              >
                {p.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <button
                onClick={() => { if (confirm('Supprimer cette popup ?')) startTransition(async () => { await deletePopup(p.id); router.refresh(); }); }}
                disabled={pending}
                className="flex h-8 w-8 items-center justify-center rounded-md text-(--color-danger) hover:bg-red-50"
                title="Supprimer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

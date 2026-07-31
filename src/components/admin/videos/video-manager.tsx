'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronDown, ChevronUp, FileText, Link2, Loader2, Paperclip, Pencil,
  Plus, Trash2, Video, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { extractBunnyVideoId } from '@/lib/bunny-link';
import {
  addVideoAction, deleteVideoAction, moveVideoAction, removeVideoSupportAction,
  renameVideoAction, replaceVideoLinkAction, setVideoSupportAction, type VideoType,
} from '@/app/admin/videos/actions';

export type ManagedVideo = {
  id: string;
  titre: string;
  bunny_video_id: string | null;
  order_index: number;
  support_path: string | null;
};

const COPY: Record<VideoType, { titre: string; unite: string; audience: string; exemple: string }> = {
  cours: {
    titre: 'Cours vidéo',
    unite: 'vidéo',
    audience: 'Visible par la Formule Intensive.',
    exemple: 'Cours vidéo 1 — Introduction',
  },
  seance_approfondie: {
    titre: 'Séances approfondies',
    unite: 'séance',
    audience: 'Visible par le Programme Approfondi.',
    exemple: 'Séance 1 — Cardiologie',
  },
};

/**
 * Gestion complète des vidéos d'un item : ajouter (lien Bunny.net collé),
 * réordonner, renommer, remplacer la vidéo, supprimer — et attacher un support
 * PDF facultatif qui devient un onglet chez l'élève.
 *
 * Le fichier de support part DIRECTEMENT du navigateur vers le bucket privé
 * `supports` (comme les fiches) : aucune limite de taille de requête serveur.
 * La ligne en base n'est mise à jour qu'ensuite, par une action serveur qui
 * revérifie les droits et le chemin.
 */
export function VideoManager({
  coursId,
  type,
  videos,
  onChanged,
}: {
  coursId: string;
  type: VideoType;
  videos: ManagedVideo[];
  /** Appelé après chaque modification. Fourni par la bibliothèque vidéo, qui
   *  charge sa liste côté client : un simple router.refresh() ne suffirait pas. */
  onChanged?: () => void;
}) {
  const router = useRouter();
  const copy = COPY[type];
  const apresModification = onChanged ?? (() => router.refresh());
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);

  // Formulaire d'ajout
  const [adding, setAdding] = useState(false);
  const [titre, setTitre] = useState('');
  const [lien, setLien] = useState('');
  const [position, setPosition] = useState('');
  const [withSupport, setWithSupport] = useState(false);
  const supportInput = useRef<HTMLInputElement>(null);
  const [supportFile, setSupportFile] = useState<File | null>(null);

  /** Dépose le PDF dans le bucket privé et l'attache à la vidéo. */
  async function uploadSupport(videoId: string, file: File): Promise<string | null> {
    const supabase = createClient();
    const safe = file.name.replace(/[^\w.\-]+/g, '_').slice(-80);
    const path = `${coursId}/${videoId}-${Date.now()}-${safe}`;
    const { error: upErr } = await supabase.storage.from('supports').upload(path, file, {
      upsert: false,
      contentType: file.type || 'application/pdf',
    });
    if (upErr) return upErr.message;
    const res = await setVideoSupportAction({ videoId, path, fileName: file.name });
    return 'error' in res ? res.error : null;
  }

  function resetAdd() {
    setTitre('');
    setLien('');
    setPosition('');
    setWithSupport(false);
    setSupportFile(null);
    setAdding(false);
  }

  function handleAdd() {
    setError(null);
    if (!titre.trim()) return setError('Donnez un titre.');
    if (!extractBunnyVideoId(lien)) {
      return setError('Lien Bunny.net non reconnu. Collez le lien de la vidéo depuis bunny.net.');
    }
    if (withSupport && !supportFile) return setError('Choisissez le PDF du support, ou décochez la case.');
    start(async () => {
      const rang = position.trim() ? Number(position) : null;
      const res = await addVideoAction({
        coursId, type, titre, lien,
        position: rang && Number.isFinite(rang) ? rang : null,
      });
      if ('error' in res) return setError(res.error);
      if (withSupport && supportFile) {
        const err = await uploadSupport(res.videoId, supportFile);
        if (err) setError(`Vidéo ajoutée, mais le support a échoué : ${err}`);
      }
      resetAdd();
      apresModification();
    });
  }

  function run(fn: () => Promise<{ ok: true } | { error: string }>) {
    setError(null);
    start(async () => {
      const res = await fn();
      if ('error' in res) setError(res.error);
      else apresModification();
    });
  }

  return (
    <div className="space-y-4">
      <p className="text-[12.5px] text-(--color-ink-soft)">
        {copy.audience} L’ordre ci-dessous est celui que voient les élèves.
      </p>

      {videos.length === 0 ? (
        <p className="rounded-xl border border-dashed border-(--color-border) bg-(--color-surface-soft) px-3 py-4 text-sm text-(--color-ink-muted)">
          Aucune {copy.unite} pour l’instant.
        </p>
      ) : (
        <ul className="space-y-2">
          {videos.map((v, i) => (
            <li key={v.id} className="rounded-xl border border-(--color-border) bg-(--color-surface)">
              <div className="flex items-center gap-2 px-3 py-2.5">
                <div className="flex flex-col">
                  <button
                    type="button"
                    aria-label="Monter"
                    disabled={pending || i === 0}
                    onClick={() => run(() => moveVideoAction({ videoId: v.id, direction: 'up' }))}
                    className="rounded p-0.5 text-(--color-ink-muted) hover:bg-(--color-sand-100) hover:text-(--color-ink) disabled:opacity-30"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Descendre"
                    disabled={pending || i === videos.length - 1}
                    onClick={() => run(() => moveVideoAction({ videoId: v.id, direction: 'down' }))}
                    className="rounded p-0.5 text-(--color-ink-muted) hover:bg-(--color-sand-100) hover:text-(--color-ink) disabled:opacity-30"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
                <span className="w-6 shrink-0 text-center text-xs font-bold tabular-nums text-(--color-ink-muted)">
                  {i + 1}
                </span>
                <Video className="h-4 w-4 shrink-0 text-[#7C3AED]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-(--color-ink)">{v.titre}</p>
                  <p className="mt-0.5 flex items-center gap-2 text-[11px] text-(--color-ink-muted)">
                    <span className="font-mono">
                      {v.bunny_video_id ? `${v.bunny_video_id.slice(0, 8)}…` : 'aucune vidéo'}
                    </span>
                    {v.support_path ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600">
                        <Paperclip className="h-3 w-3" /> support
                      </span>
                    ) : (
                      <span className="text-(--color-ink-muted)">sans support</span>
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditing(editing === v.id ? null : v.id)}
                  className="rounded-lg p-1.5 text-(--color-ink-muted) hover:bg-(--color-sand-100) hover:text-(--color-ink)"
                  aria-label="Modifier"
                >
                  {editing === v.id ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    if (confirm(`Supprimer « ${v.titre} » ?${v.support_path ? ' Son support sera également supprimé.' : ''}`)) {
                      run(() => deleteVideoAction({ videoId: v.id }));
                    }
                  }}
                  className="rounded-lg p-1.5 text-(--color-ink-muted) hover:bg-red-50 hover:text-red-600"
                  aria-label="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {editing === v.id && (
                <VideoEditPanel
                  video={v}
                  pending={pending}
                  onRename={(t) => run(() => renameVideoAction({ videoId: v.id, titre: t }))}
                  onReplaceLink={(l) => run(() => replaceVideoLinkAction({ videoId: v.id, lien: l }))}
                  onSupport={(file) =>
                    run(async () => {
                      const err = await uploadSupport(v.id, file);
                      return err ? { error: err } : { ok: true };
                    })
                  }
                  onRemoveSupport={() => run(() => removeVideoSupportAction({ videoId: v.id }))}
                />
              )}
            </li>
          ))}
        </ul>
      )}

      {adding ? (
        <div className="rounded-xl border border-dashed border-(--color-border) bg-(--color-surface) p-4">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-(--color-ink)">
            <Link2 className="h-4 w-4 text-[#7C3AED]" />
            Nouvelle {copy.unite}
          </p>
          <div className="space-y-2">
            <input
              type="text"
              placeholder={`Nom affiché aux élèves — ex. « ${copy.exemple} »`}
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm focus:border-[#7C3AED] focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
            />
            <input
              type="text"
              placeholder="Collez ici le lien Bunny.net Stream de la vidéo"
              value={lien}
              onChange={(e) => setLien(e.target.value)}
              className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 font-mono text-sm focus:border-[#7C3AED] focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
            />
            <label className="flex flex-wrap items-center gap-2 pt-1 text-sm text-(--color-ink)">
              Position dans la liste
              <input
                type="number"
                min={1}
                max={videos.length + 1}
                placeholder={`${videos.length + 1}`}
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-20 rounded-lg border border-(--color-border) bg-(--color-surface) px-2 py-1.5 text-sm"
              />
              <span className="text-xs text-(--color-ink-muted)">
                (vide = à la fin ; 1 = en tête)
              </span>
            </label>
            <label className="flex items-center gap-2 pt-1 text-sm text-(--color-ink)">
              <input
                type="checkbox"
                checked={withSupport}
                onChange={(e) => {
                  setWithSupport(e.target.checked);
                  if (!e.target.checked) setSupportFile(null);
                }}
                className="h-4 w-4 accent-[#7C3AED]"
              />
              Ajouter un support (PDF) — crée un onglet « Support de la séance » chez l’élève
            </label>
            {withSupport && (
              <div className="flex items-center gap-2 pl-6">
                <input
                  ref={supportInput}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => setSupportFile(e.target.files?.[0] ?? null)}
                />
                <Button type="button" variant="outline" size="sm" onClick={() => supportInput.current?.click()}>
                  <FileText />
                  {supportFile ? 'Changer de PDF' : 'Choisir le PDF'}
                </Button>
                {supportFile && (
                  <span className="truncate text-xs text-(--color-ink-soft)">{supportFile.name}</span>
                )}
              </div>
            )}
            <div className="flex items-center gap-2 pt-1">
              <Button type="button" size="sm" onClick={handleAdd} disabled={pending}>
                {pending ? <Loader2 className="animate-spin" /> : <Plus />}
                Ajouter
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={resetAdd} disabled={pending}>
                Annuler
              </Button>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-(--color-ink-muted)">
            Déposez d’abord la vidéo sur bunny.net (Stream), puis collez son lien ici.
          </p>
        </div>
      ) : (
        <Button type="button" variant="outline" size="sm" onClick={() => { setAdding(true); setError(null); }}>
          <Plus />
          Ajouter une {copy.unite}
        </Button>
      )}

      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function VideoEditPanel({
  video,
  pending,
  onRename,
  onReplaceLink,
  onSupport,
  onRemoveSupport,
}: {
  video: ManagedVideo;
  pending: boolean;
  onRename: (titre: string) => void;
  onReplaceLink: (lien: string) => void;
  onSupport: (file: File) => void;
  onRemoveSupport: () => void;
}) {
  const [titre, setTitre] = useState(video.titre);
  const [lien, setLien] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-3 border-t border-(--color-border) bg-(--color-surface-soft) px-3 py-3">
      <div>
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">
          Nom
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-sm"
          />
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={pending || !titre.trim() || titre.trim() === video.titre}
            onClick={() => onRename(titre)}
          >
            Renommer
          </Button>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">
          Remplacer la vidéo
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={lien}
            placeholder="Nouveau lien Bunny.net"
            onChange={(e) => setLien(e.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-1.5 font-mono text-sm"
          />
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={pending || !lien.trim()}
            onClick={() => { onReplaceLink(lien); setLien(''); }}
          >
            Remplacer
          </Button>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">
          Support de séance (PDF)
        </label>
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onSupport(f); }}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => fileRef.current?.click()}>
            <FileText />
            {video.support_path ? 'Remplacer le support' : 'Ajouter un support'}
          </Button>
          {video.support_path && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={pending}
              onClick={() => { if (confirm('Retirer le support de cette séance ?')) onRemoveSupport(); }}
              className="text-(--color-danger)"
            >
              <Trash2 />
              Retirer
            </Button>
          )}
        </div>
        <p className="mt-1 text-[11px] text-(--color-ink-muted)">
          Le support apparaît comme un onglet chez l’élève, filigrané à son nom et non téléchargeable.
        </p>
      </div>
    </div>
  );
}

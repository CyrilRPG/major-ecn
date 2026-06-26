'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Link2, Loader2, Trash2, Video } from 'lucide-react';

/**
 * Coller un lien Bunny.net Stream pour une vidéo de séance approfondie.
 * Accepte les formats :
 *  - https://player.mediadelivery.net/play/{libraryId}/{videoId}
 *  - https://iframe.mediadelivery.net/embed/{libraryId}/{videoId}
 *  - UUID seul
 */
function extractBunnyId(input: string): string | null {
  const trimmed = input.trim();
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRe.test(trimmed)) return trimmed;
  const urlRe = /mediadelivery\.net\/(?:play|embed)\/\d+\/([0-9a-f-]{36})/i;
  const m = trimmed.match(urlRe);
  return m?.[1] ?? null;
}

export function BunnyLinkPaste({
  coursId,
  videoType,
  existingVideos,
}: {
  coursId: string;
  videoType: 'cours' | 'seance_approfondie';
  existingVideos: { id: string; titre: string; bunny_video_id: string | null }[];
}) {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSave() {
    const bunnyId = extractBunnyId(url);
    if (!bunnyId) {
      setError('Lien invalide. Collez un lien Bunny.net Stream ou un UUID de vidéo.');
      return;
    }
    if (!title.trim()) {
      setError('Veuillez saisir un titre pour la vidéo.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const res = await fetch('/api/admin/videos/bunny-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coursId, bunnyVideoId: bunnyId, titre: title.trim(), type: videoType }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? 'Erreur lors de la sauvegarde.');
      setSuccess(true);
      setUrl('');
      setTitle('');
      setTimeout(() => { setSuccess(false); router.refresh(); }, 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(videoId: string) {
    if (!confirm('Supprimer cette vidéo ?')) return;
    try {
      await fetch('/api/admin/videos/bunny-link', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId }),
      });
      router.refresh();
    } catch { /* best-effort */ }
  }

  return (
    <div className="space-y-4">
      {existingVideos.length > 0 && (
        <ul className="space-y-2">
          {existingVideos.map((v) => (
            <li key={v.id} className="flex items-center justify-between rounded-xl border border-(--color-border) bg-(--color-surface-soft) px-3 py-2 text-sm">
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-[#7C3AED]" />
                <span className="font-medium">{v.titre}</span>
                {v.bunny_video_id && (
                  <span className="font-mono text-xs text-(--color-ink-muted)">
                    {v.bunny_video_id.slice(0, 8)}...
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(v.id)}
                className="rounded-lg p-1.5 text-(--color-ink-muted) hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="rounded-xl border border-dashed border-(--color-border) bg-(--color-surface) p-4">
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-(--color-ink)">
          <Link2 className="h-4 w-4 text-[#7C3AED]" />
          Ajouter une vidéo via lien Bunny.net
        </p>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Titre de la vidéo"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm focus:border-[#7C3AED] focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
          />
          <input
            type="text"
            placeholder="Collez le lien Bunny.net Stream ou l'UUID de la vidéo"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm font-mono focus:border-[#7C3AED] focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !url.trim() || !title.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-[#7C3AED] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#6D28D9] disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : success ? <CheckCircle2 className="h-4 w-4" /> : <Video className="h-4 w-4" />}
            {saving ? 'Enregistrement...' : success ? 'Vidéo ajoutée !' : 'Ajouter la vidéo'}
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        <p className="mt-2 text-[11px] text-(--color-ink-muted)">
          Formats acceptés : lien player Bunny.net, lien embed Bunny.net, ou UUID seul.
        </p>
      </div>
    </div>
  );
}

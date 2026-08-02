'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronDown, ChevronUp, FileText, Loader2, Lock, Pencil, Plus, Trash2, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { ficheLabel } from '@/lib/fiches/documents';
import {
  addFichePdfAction, deleteFicheAction, moveFicheAction, renameFicheAction,
  replaceFichePdfAction,
} from '@/app/admin/contenu/[cours]/fiche-pdf-actions';

export type ManagedFiche = {
  id: string;
  titre: string;
  storage_path: string | null;
  pages: number | null;
  content_format: string | null;
};

/**
 * Gestion des fiches de cours d'un item : plusieurs fiches possibles, dans
 * l'ordre choisi ici — c'est celui que voient les élèves, toutes dans le MÊME
 * onglet « Fiche de cours ».
 *
 * Le fichier part DIRECTEMENT du navigateur vers le bucket `fiches` (comme les
 * supports de séance) : aucune limite de taille de requête serveur. La ligne en
 * base n'est écrite qu'ensuite, par une action qui revérifie droits et chemin.
 *
 * La première fiche de la liste est la « fiche principale » : c'est celle
 * qu'ouvre l'éditeur en ligne et qui alimente la fiche éclair.
 */
export function FichesManager({
  coursId,
  fiches,
}: {
  coursId: string;
  fiches: ManagedFiche[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const ajoutRef = useRef<HTMLInputElement>(null);

  /** Dépose un PDF dans le bucket et renvoie son chemin, ou une erreur. */
  async function upload(file: File): Promise<{ path: string } | { error: string }> {
    const supabase = createClient();
    const safe = file.name.replace(/[^\w.\-]+/g, '_').slice(-80);
    const path = `${coursId}/${Date.now()}-${safe}`;
    const { error: upErr } = await supabase.storage.from('fiches').upload(path, file, {
      upsert: false,
      contentType: file.type || 'application/pdf',
    });
    if (upErr) return { error: upErr.message };
    return { path };
  }

  function run(fn: () => Promise<{ ok: true } | { error: string }>) {
    setError(null);
    start(async () => {
      const res = await fn();
      if ('error' in res) setError(res.error);
      else router.refresh();
    });
  }

  /** Ajoute plusieurs PDF à la suite ; s'arrête à la première erreur. */
  function ajouter(files: File[]) {
    run(async () => {
      for (const f of files) {
        const up = await upload(f);
        if ('error' in up) return up;
        const res = await addFichePdfAction({ coursId, path: up.path, fileName: f.name });
        if ('error' in res) return res;
      }
      return { ok: true };
    });
  }

  function remplacer(ficheId: string, file: File) {
    run(async () => {
      const up = await upload(file);
      if ('error' in up) return up;
      return replaceFichePdfAction({ ficheId, path: up.path, fileName: file.name });
    });
  }

  return (
    <div className="space-y-3">
      <p className="text-[12.5px] text-(--color-ink-soft)">
        L’ordre ci-dessous est celui que voient les élèves : toutes ces fiches apparaissent
        dans le même onglet « Fiche de cours », la première étant ouverte par défaut.
      </p>

      {fiches.length === 0 ? (
        <p className="rounded-xl border border-dashed border-(--color-border) bg-(--color-surface-soft) px-3 py-4 text-sm text-(--color-ink-muted)">
          Aucune fiche pour l’instant.
        </p>
      ) : (
        <ul className="space-y-2">
          {fiches.map((f, i) => {
            const estPdf = f.content_format === 'pdf';
            return (
              <li key={f.id} className="rounded-xl border border-(--color-border) bg-(--color-surface)">
                <div className="flex items-center gap-2 px-3 py-2.5">
                  <div className="flex flex-col">
                    <button
                      type="button"
                      aria-label="Monter"
                      disabled={pending || i === 0}
                      onClick={() => run(() => moveFicheAction({ ficheId: f.id, direction: 'up' }))}
                      className="rounded p-0.5 text-(--color-ink-muted) hover:bg-(--color-sand-100) hover:text-(--color-ink) disabled:opacity-30"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Descendre"
                      disabled={pending || i === fiches.length - 1}
                      onClick={() => run(() => moveFicheAction({ ficheId: f.id, direction: 'down' }))}
                      className="rounded p-0.5 text-(--color-ink-muted) hover:bg-(--color-sand-100) hover:text-(--color-ink) disabled:opacity-30"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="w-6 shrink-0 text-center text-xs font-bold tabular-nums text-(--color-ink-muted)">
                    {i + 1}
                  </span>
                  <FileText className="h-4 w-4 shrink-0 text-(--color-primary)" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-(--color-ink)">
                      {ficheLabel(f, i)}
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-(--color-ink-muted)">
                      {i === 0 && <span className="font-semibold text-(--color-primary-deep)">principale</span>}
                      {estPdf ? (
                        <span className="inline-flex items-center gap-1">
                          <Lock className="h-3 w-3" /> PDF déposé — non éditable en ligne
                        </span>
                      ) : (
                        <span>éditable en ligne</span>
                      )}
                      {f.pages ? <span>{f.pages} pages</span> : null}
                      {!f.storage_path && <span className="text-amber-600">aucun fichier</span>}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditing(editing === f.id ? null : f.id)}
                    className="rounded-lg p-1.5 text-(--color-ink-muted) hover:bg-(--color-sand-100) hover:text-(--color-ink)"
                    aria-label="Modifier"
                  >
                    {editing === f.id ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      if (confirm(`Supprimer la fiche « ${ficheLabel(f, i)} » ? Le fichier sera également supprimé.`)) {
                        run(() => deleteFicheAction({ ficheId: f.id }));
                      }
                    }}
                    className="rounded-lg p-1.5 text-(--color-ink-muted) hover:bg-red-50 hover:text-red-600"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {editing === f.id && (
                  <FicheEditPanel
                    fiche={f}
                    index={i}
                    pending={pending}
                    onRename={(t) => run(() => renameFicheAction({ ficheId: f.id, titre: t }))}
                    onReplace={(file) => remplacer(f.id, file)}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}

      <input
        ref={ajoutRef}
        type="file"
        accept="application/pdf"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length > 0) ajouter(files);
          e.target.value = '';
        }}
      />
      <Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => ajoutRef.current?.click()}>
        {pending ? <Loader2 className="animate-spin" /> : <Plus />}
        Ajouter une ou plusieurs fiches PDF
      </Button>

      <p className="flex items-start gap-1.5 text-[12px] leading-relaxed text-(--color-ink-soft)">
        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>
          Une fiche déposée en PDF <strong className="text-(--color-ink)">ne sera pas éditable en
          ligne</strong> : pour la modifier, remplacez le fichier depuis le crayon. Comme les autres
          fiches, elle est servie aux élèves filigranée à leur nom.
        </span>
      </p>

      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function FicheEditPanel({
  fiche,
  index,
  pending,
  onRename,
  onReplace,
}: {
  fiche: ManagedFiche;
  index: number;
  pending: boolean;
  onRename: (titre: string) => void;
  onReplace: (file: File) => void;
}) {
  const [titre, setTitre] = useState(fiche.titre ?? '');
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-3 border-t border-(--color-border) bg-(--color-surface-soft) px-3 py-3">
      <div>
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">
          Nom affiché à l’élève
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={titre}
            placeholder={ficheLabel(fiche, index)}
            onChange={(e) => setTitre(e.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-sm"
          />
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={pending || !titre.trim() || titre.trim() === fiche.titre}
            onClick={() => onRename(titre)}
          >
            Renommer
          </Button>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">
          Remplacer le fichier (PDF)
        </label>
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onReplace(f);
            e.target.value = '';
          }}
        />
        <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => fileRef.current?.click()}>
          <FileText />
          Choisir un PDF
        </Button>
        <p className="mt-1 text-[11px] text-(--color-ink-muted)">
          Le PDF remplacé est supprimé du stockage. Le nom et la position ne changent pas.
        </p>
      </div>
    </div>
  );
}

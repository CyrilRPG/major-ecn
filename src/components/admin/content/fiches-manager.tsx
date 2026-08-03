'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronDown, ChevronUp, FileText, Loader2, Lock, Pencil, Plus, Trash2, Upload, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { ficheLabel, titreDepuisFichier } from '@/lib/fiches/documents';
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

/** Fichier en attente d'envoi, avec le titre choisi par l'administrateur. */
type EnAttente = { file: File; titre: string };

const ACCEPT = '.pdf,.html,.htm,application/pdf,text/html';

function estHtml(file: File): boolean {
  const n = file.name.toLowerCase();
  return n.endsWith('.html') || n.endsWith('.htm') || file.type === 'text/html';
}

/**
 * Gestion des fiches de cours d'un item : plusieurs fiches possibles, dans
 * l'ordre choisi ici — c'est celui que voient les élèves, toutes dans le MÊME
 * onglet « Fiche de cours ».
 *
 * On dépose indifféremment des PDF et des HTML, plusieurs à la fois, et on
 * choisit le TITRE de chacune avant l'envoi : c'est ce titre qui s'affiche
 * au-dessus de la fiche côté élève.
 *   - PDF  → part directement du navigateur vers le bucket `fiches` (aucune
 *     limite de taille de requête serveur) ; la ligne en base est écrite
 *     ensuite par une action qui revérifie droits et chemin.
 *   - HTML → converti en PDF (charte Major ECN) par `/render-html`, et reste
 *     modifiable dans l'éditeur en ligne.
 */
export function FichesManager({
  coursId,
  nomCours,
  annee,
  fiches,
}: {
  coursId: string;
  nomCours: string;
  annee: string;
  fiches: ManagedFiche[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [enAttente, setEnAttente] = useState<EnAttente[]>([]);
  const [dragging, setDragging] = useState(false);
  const ajoutRef = useRef<HTMLInputElement>(null);

  /** Dépose un PDF dans le bucket et renvoie son chemin, ou une erreur. */
  async function uploadPdf(file: File): Promise<{ path: string } | { error: string }> {
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

  /** Convertit un HTML en PDF côté serveur, sur une fiche neuve ou existante. */
  async function envoyerHtml(
    file: File,
    cible: { ficheId: string } | { createNew: true; titre: string },
  ): Promise<{ ok: true } | { error: string }> {
    const content_html = await file.text();
    const res = await fetch(`/api/fiches/${coursId}/render-html`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content_html, save: true, nom_cours: nomCours, annee, ...cible }),
    });
    const j = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (!res.ok || !j.ok) return { error: j.error ?? `Échec de la conversion HTML → PDF (${res.status})` };
    return { ok: true };
  }

  function run(fn: () => Promise<{ ok: true } | { error: string }>) {
    setError(null);
    start(async () => {
      const res = await fn();
      if ('error' in res) setError(res.error);
      else router.refresh();
    });
  }

  function choisir(files: File[]) {
    setError(null);
    if (files.length === 0) return;
    setEnAttente((prev) => [
      ...prev,
      ...files.map((file) => ({ file, titre: titreDepuisFichier(file.name) })),
    ]);
  }

  /** Envoie la file d'attente dans l'ordre ; s'arrête à la première erreur. */
  function ajouterTout() {
    const vide = enAttente.find((e) => !e.titre.trim());
    if (vide) return setError(`Donnez un titre à « ${vide.file.name} ».`);
    run(async () => {
      for (const { file, titre } of enAttente) {
        if (estHtml(file)) {
          const res = await envoyerHtml(file, { createNew: true, titre: titre.trim() });
          if ('error' in res) return res;
        } else {
          const up = await uploadPdf(file);
          if ('error' in up) return up;
          const res = await addFichePdfAction({
            coursId, path: up.path, fileName: file.name, titre: titre.trim(),
          });
          if ('error' in res) return res;
        }
      }
      setEnAttente([]);
      return { ok: true };
    });
  }

  function remplacer(ficheId: string, file: File) {
    run(async () => {
      if (estHtml(file)) return envoyerHtml(file, { ficheId });
      const up = await uploadPdf(file);
      if ('error' in up) return up;
      return replaceFichePdfAction({ ficheId, path: up.path, fileName: file.name });
    });
  }

  return (
    <div className="space-y-3">
      <p className="text-[12.5px] text-(--color-ink-soft)">
        L’ordre ci-dessous est celui que voient les élèves : toutes ces fiches apparaissent
        dans le même onglet « Fiche de cours », la première étant ouverte par défaut. Le titre
        de chaque fiche est affiché au-dessus du document.
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
                    coursId={coursId}
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

      {/* Zone de dépôt : PDF et HTML, plusieurs à la fois. */}
      <div
        onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          choisir(Array.from(e.dataTransfer.files ?? []));
        }}
        className={`rounded-2xl border-2 border-dashed p-5 text-center transition ${
          dragging
            ? 'border-(--color-primary) bg-(--color-primary-soft)'
            : 'border-(--color-border) bg-(--color-surface-soft)'
        }`}
      >
        <input
          ref={ajoutRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={(e) => {
            choisir(Array.from(e.target.files ?? []));
            e.target.value = '';
          }}
        />
        <Upload className="mx-auto mb-2 h-7 w-7 text-(--color-primary)" />
        <p className="text-sm font-medium text-(--color-ink)">
          Glissez ici une ou plusieurs fiches (PDF ou HTML)
        </p>
        <p className="mt-1 text-xs text-(--color-ink-soft)">
          Vous choisirez le titre de chacune avant l’envoi. Un fichier <code>.html</code> est
          converti en PDF (charte Major ECN) et reste modifiable dans l’éditeur en ligne.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3"
          disabled={pending}
          onClick={() => ajoutRef.current?.click()}
        >
          <Plus />
          Choisir des fichiers
        </Button>
      </div>

      {enAttente.length > 0 && (
        <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">
            Titre de chaque fiche (affiché à l’élève au-dessus du document)
          </p>
          <ul className="space-y-2">
            {enAttente.map((e, i) => (
              <li key={`${e.file.name}-${i}`} className="flex items-center gap-2">
                <span className="w-14 shrink-0 rounded bg-(--color-sand-100) px-1.5 py-0.5 text-center text-[10px] font-bold uppercase text-(--color-ink-muted)">
                  {estHtml(e.file) ? 'HTML' : 'PDF'}
                </span>
                <input
                  type="text"
                  value={e.titre}
                  placeholder="Titre affiché à l’élève"
                  onChange={(ev) => {
                    const v = ev.target.value;
                    setEnAttente((prev) => prev.map((x, j) => (j === i ? { ...x, titre: v } : x)));
                  }}
                  className="min-w-0 flex-1 rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-sm"
                />
                <span className="hidden max-w-[10rem] truncate text-[11px] text-(--color-ink-muted) sm:block">
                  {e.file.name}
                </span>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setEnAttente((prev) => prev.filter((_, j) => j !== i))}
                  aria-label="Retirer ce fichier"
                  className="rounded-lg p-1 text-(--color-ink-muted) hover:bg-red-50 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center gap-2">
            <Button type="button" size="sm" disabled={pending} onClick={ajouterTout}>
              {pending ? <Loader2 className="animate-spin" /> : <Plus />}
              Ajouter {enAttente.length} fiche{enAttente.length > 1 ? 's' : ''}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={pending}
              onClick={() => { setEnAttente([]); setError(null); }}
            >
              Annuler
            </Button>
          </div>
        </div>
      )}

      <p className="flex items-start gap-1.5 text-[12px] leading-relaxed text-(--color-ink-soft)">
        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>
          Une fiche déposée en PDF <strong className="text-(--color-ink)">n’est pas éditable en
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
  coursId,
  fiche,
  index,
  pending,
  onRename,
  onReplace,
}: {
  coursId: string;
  fiche: ManagedFiche;
  index: number;
  pending: boolean;
  onRename: (titre: string) => void;
  onReplace: (file: File) => void;
}) {
  const [titre, setTitre] = useState(fiche.titre ?? '');
  const fileRef = useRef<HTMLInputElement>(null);
  const editable = fiche.content_format !== 'pdf';

  return (
    <div className="space-y-3 border-t border-(--color-border) bg-(--color-surface-soft) px-3 py-3">
      <div>
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">
          Titre affiché à l’élève
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
          Remplacer le fichier (PDF ou HTML)
        </label>
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onReplace(f);
            e.target.value = '';
          }}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => fileRef.current?.click()}>
            <FileText />
            Choisir un fichier
          </Button>
          {editable && (
            <Link
              href={`/cours/${coursId}/fiche/edit?doc=${fiche.id}`}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-(--color-ink) hover:bg-(--color-sand-100)"
            >
              <Pencil className="h-4 w-4" /> Éditer en ligne
            </Link>
          )}
        </div>
        <p className="mt-1 text-[11px] text-(--color-ink-muted)">
          Le titre et la position ne changent pas. Un HTML est reconverti en PDF et redevient
          éditable en ligne ; un PDF remplace le fichier tel quel.
        </p>
      </div>
    </div>
  );
}

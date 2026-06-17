'use client';

/**
 * Dépôt d'une fiche au format **HTML** (remplace l'ancien upload PDF).
 *
 * Le professeur dépose un fichier `.html` (autoporté ou fragment de corps) :
 *   1. On lit son contenu texte.
 *   2. POST `/api/fiches/[cours]/render-html` avec `save:true` — cette route
 *      stocke `content_html`, le convertit en PDF via Chromium (charte +
 *      en-têtes/pieds), upload le PDF dans Storage et met à jour la fiche.
 * Le PDF servi aux étudiants est ainsi toujours régénéré depuis le HTML.
 *
 * Le professeur peut ensuite affiner visuellement via l'éditeur WYSIWYG.
 */

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Loader2, Pencil, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FicheHtmlUpload({
  coursId, nomCours, annee, existing, pages,
}: {
  coursId: string;
  nomCours: string;
  annee: string;
  existing: boolean;
  pages?: number | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handle(file: File) {
    setError(null); setDone(null);
    const name = file.name.toLowerCase();
    if (!name.endsWith('.html') && !name.endsWith('.htm') && file.type !== 'text/html') {
      setError('Merci de déposer un fichier .html'); return;
    }
    setBusy(true);
    try {
      const html = await file.text();
      const res = await fetch(`/api/fiches/${coursId}/render-html`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_html: html, save: true, nom_cours: nomCours, annee }),
      });
      const j = (await res.json().catch(() => ({}))) as { ok?: boolean; pages?: number; error?: string };
      if (res.ok && j.ok) {
        setDone(`Fiche convertie en PDF (${j.pages ?? '?'} pages).`);
        router.refresh();
      } else {
        setError(j.error ?? 'Échec de la conversion HTML → PDF');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur réseau');
    } finally { setBusy(false); }
  }

  return (
    <div className="space-y-3">
      <div
        onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) handle(f); }}
        className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition ${
          dragging ? 'border-(--color-primary) bg-(--color-primary-soft)' : 'border-(--color-border) bg-(--color-surface-soft)'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".html,.htm,text/html"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handle(f); }}
        />
        <Upload className="mx-auto mb-2 h-8 w-8 text-(--color-primary)" />
        <p className="font-medium text-(--color-ink)">
          {existing ? 'Fiche HTML présente, la remplacer' : 'Glisse un fichier .html ici'}
        </p>
        <p className="mt-1 text-xs text-(--color-ink-soft)">
          Le HTML est converti automatiquement en PDF (charte Major ECN) pour les étudiants.
          {pages ? ` ${pages} pages actuellement.` : ''}
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={busy}>
            {busy ? <Loader2 className="animate-spin" /> : <Upload />}
            {existing ? 'Remplacer le HTML' : 'Choisir un fichier'}
          </Button>
          <Link
            href={`/cours/${coursId}/fiche/edit`}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-(--color-ink) hover:bg-(--color-sand-100)"
          >
            <Pencil className="h-4 w-4" /> Éditer dans l’éditeur
          </Link>
        </div>
        {done && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" /> {done}
          </p>
        )}
        {error && <p className="mt-3 text-xs text-(--color-danger)">{error}</p>}
      </div>
    </div>
  );
}

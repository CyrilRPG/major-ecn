'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loader2, Plus, Stethoscope, Trash2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { upsertQcmQuestionAction, uploadQcmImageAction, updateSerieVignetteAction } from '@/app/admin/contenu/[cours]/qcm-actions';

export type QcmItemDraft = {
  lettre: 'A' | 'B' | 'C' | 'D' | 'E';
  enonce: string;
  is_correct: boolean;
  justification: string;
  images: string[];
};
export type QcmQuestionDraft = {
  id?: string;
  enonce: string;
  correction_generale: string;
  images: string[];
  items: QcmItemDraft[];
};

const EMPTY_ITEM = (l: QcmItemDraft['lettre']): QcmItemDraft => ({
  lettre: l, enonce: '', is_correct: false, justification: '', images: [],
});

function defaultDraft(): QcmQuestionDraft {
  return {
    enonce: '',
    correction_generale: '',
    images: [],
    items: ['A', 'B', 'C', 'D', 'E'].map((l) => EMPTY_ITEM(l as QcmItemDraft['lettre'])),
  };
}

export function QcmQuestionEditor({
  open, onOpenChange, coursId, serieId, initial, vignette, showVignette,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  coursId: string;
  serieId: string;
  initial?: QcmQuestionDraft | null;
  /** Contexte clinique partagé du DP/série (édité ici, depuis le bouton unique). */
  vignette?: string | null;
  /** Affiche la section « contexte clinique » (DP / série). */
  showVignette?: boolean;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<QcmQuestionDraft>(initial ?? defaultDraft());
  const [vignetteText, setVignetteText] = useState(vignette ?? '');
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDraft(initial ? { ...initial, items: initial.items.map((i) => ({ ...i, images: i.images ?? [] })) } : defaultDraft());
      setVignetteText(vignette ?? '');
      setErr(null);
    }
  }, [open, initial, vignette]);

  const updateItem = (idx: number, patch: Partial<QcmItemDraft>) => {
    setDraft((d) => ({ ...d, items: d.items.map((it, i) => i === idx ? { ...it, ...patch } : it) }));
  };
  const removeItem = (idx: number) => {
    setDraft((d) => ({ ...d, items: d.items.filter((_, i) => i !== idx) }));
  };
  const addItem = () => {
    if (draft.items.length >= 5) return;
    const used = new Set(draft.items.map((i) => i.lettre));
    const next = (['A', 'B', 'C', 'D', 'E'] as const).find((l) => !used.has(l));
    if (!next) return;
    setDraft((d) => ({ ...d, items: [...d.items, EMPTY_ITEM(next)] }));
  };

  const onSubmit = () => {
    setErr(null);
    start(async () => {
      const res = await upsertQcmQuestionAction({
        questionId: draft.id,
        serieId,
        coursId,
        question: {
          enonce: draft.enonce.trim(),
          correction_generale: draft.correction_generale.trim() || null,
          images: draft.images,
          items: draft.items
            .filter((it) => it.enonce.trim().length > 0)
            .map((it) => ({
              lettre: it.lettre,
              enonce: it.enonce.trim(),
              is_correct: it.is_correct,
              justification: it.justification.trim(),
              images: it.images,
            })),
        },
      });
      if ('error' in res) { setErr(res.error); return; }
      // Sauvegarde du contexte clinique partagé (DP) si modifié — même bouton.
      if (showVignette && (vignetteText ?? '').trim() !== (vignette ?? '').trim()) {
        const vres = await updateSerieVignetteAction({ serieId, coursId, vignette: vignetteText });
        if ('error' in vres) {
          setErr('Question enregistrée, mais erreur sur le contexte clinique : ' + vres.error);
          return;
        }
      }
      router.refresh();
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{draft.id ? 'Modifier la question' : 'Nouvelle question'}</DialogTitle>
          <DialogDescription>
            Énoncé, items A-E, justifications, corrigé général et images (arbres décisionnels, schémas, ECG…).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Contexte clinique partagé du DP (édité depuis le même bouton). */}
          {showVignette && (
            <div className="space-y-1.5 rounded-xl border border-(--color-primary)/30 bg-(--color-primary-soft)/30 p-3">
              <Label htmlFor="q-vignette" className="flex items-center gap-1.5">
                <Stethoscope className="h-3.5 w-3.5 text-(--color-primary)" />
                Contexte clinique du dossier (optionnel)
              </Label>
              <Textarea
                id="q-vignette"
                rows={4}
                value={vignetteText}
                onChange={(e) => setVignetteText(e.target.value)}
                placeholder="Vignette commune à toutes les questions du DP, affichée au-dessus de chaque question. Laissez vide pour la retirer."
                className="bg-white"
              />
              <p className="text-[11px] text-(--color-ink-muted)">
                Partagé par toutes les questions de cette série (DP). Modifié ici pour tout le dossier.
              </p>
            </div>
          )}

          {/* Énoncé */}
          <div className="space-y-1.5">
            <Label htmlFor="q-enonce">Énoncé</Label>
            <Textarea
              id="q-enonce"
              rows={3}
              value={draft.enonce}
              onChange={(e) => setDraft((d) => ({ ...d, enonce: e.target.value }))}
              placeholder="Concernant l'asthme aigu grave, quelles affirmations sont vraies ?"
            />
          </div>

          {/* Images niveau question */}
          <ImageList
            images={draft.images}
            onChange={(imgs) => setDraft((d) => ({ ...d, images: imgs }))}
            label="Images de la question (arbres décisionnels, ECG, scanners, schémas…)"
          />

          {/* Items A-E */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label>Items (réponses A-E)</Label>
              {draft.items.length < 5 && (
                <Button type="button" variant="ghost" size="sm" onClick={addItem}>
                  <Plus className="h-3.5 w-3.5" /> Ajouter un item
                </Button>
              )}
            </div>
            {draft.items.map((it, idx) => (
              <div key={idx} className="rounded-xl border border-(--color-border) bg-(--color-surface-soft) p-3">
                <div className="flex items-start gap-3">
                  <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white font-mono text-xs font-bold text-(--color-ink)">
                    {it.lettre}
                  </span>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      rows={2}
                      value={it.enonce}
                      onChange={(e) => updateItem(idx, { enonce: e.target.value })}
                      placeholder={`Énoncé de l'item ${it.lettre}…`}
                      className="text-sm"
                    />
                    <Textarea
                      rows={2}
                      value={it.justification}
                      onChange={(e) => updateItem(idx, { justification: e.target.value })}
                      placeholder="Justification (explication détaillée affichée au corrigé)"
                      className="text-xs bg-white"
                    />
                    <ImageList
                      images={it.images}
                      onChange={(imgs) => updateItem(idx, { images: imgs })}
                      label={`Images de l'item ${it.lettre}`}
                      compact
                    />
                    <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-(--color-ink)">
                      <input
                        type="checkbox"
                        checked={it.is_correct}
                        onChange={(e) => updateItem(idx, { is_correct: e.target.checked })}
                        className="h-4 w-4 rounded border-(--color-border)"
                      />
                      Cet item est <strong className="text-(--color-primary)">VRAI</strong>
                    </label>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(idx)}
                    className="text-(--color-danger)"
                    title="Supprimer l'item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Corrigé général */}
          <div className="space-y-1.5">
            <Label htmlFor="q-correction">Corrigé général (optionnel)</Label>
            <Textarea
              id="q-correction"
              rows={5}
              value={draft.correction_generale}
              onChange={(e) => setDraft((d) => ({ ...d, correction_generale: e.target.value }))}
              placeholder="Explication globale de la question, points clés, rappels physiopathologiques, arbre décisionnel textuel…"
              className="bg-white"
            />
            <p className="text-[11px] text-(--color-ink-muted)">
              Apparaît sous l&apos;ensemble des items au moment du corrigé, en plus des justifications par item.
            </p>
          </div>
        </div>

        {err && (
          <p className="rounded-lg bg-(--color-primary-soft) px-3 py-2 text-xs text-(--color-primary-deep)">
            {err}
          </p>
        )}

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-(--color-border)">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={pending}>
            Annuler
          </Button>
          <Button type="button" onClick={onSubmit} disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : <Plus />}
            {draft.id ? 'Mettre à jour' : 'Créer la question'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ────────── Image list + upload ────────── */

function ImageList({
  images, onChange, label, compact = false,
}: {
  images: string[];
  onChange: (imgs: string[]) => void;
  label: string;
  compact?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = async (file: File | null) => {
    if (!file) return;
    setErr(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await uploadQcmImageAction(fd);
      if ('error' in res) setErr(res.error);
      else onChange([...images, res.url]);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-1.5">
      <p className={compact ? 'text-[11px] font-medium text-(--color-ink-soft)' : 'text-xs font-medium text-(--color-ink-soft)'}>{label}</p>
      {images.length > 0 && (
        <div className={`grid gap-2 ${compact ? 'grid-cols-4' : 'grid-cols-3 sm:grid-cols-4'}`}>
          {images.map((src, i) => (
            <div key={src} className="relative aspect-square overflow-hidden rounded-lg border border-(--color-border) bg-white">
              <Image src={src} alt="" fill sizes="120px" className="object-contain p-1" unoptimized />
              <button
                type="button"
                onClick={() => onChange(images.filter((_, j) => j !== i))}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-(--color-danger) shadow-sm hover:bg-white"
                title="Retirer"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-(--color-border) bg-white px-3 py-1.5 text-xs font-medium text-(--color-ink-soft) hover:border-(--color-primary) hover:text-(--color-primary)">
        {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
        {uploading ? 'Envoi…' : 'Ajouter une image'}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          disabled={uploading}
        />
      </label>
      {err && <p className="text-[11px] text-(--color-danger)">{err}</p>}
    </div>
  );
}

/* ────────── Public wrapper : trigger button + dialog state ────────── */

export function QcmQuestionEditorButton({
  coursId, serieId, initial, label, variant = 'primary', size = 'md',
  className,
}: {
  coursId: string;
  serieId: string;
  initial?: QcmQuestionDraft | null;
  label: string;
  variant?: 'primary' | 'ghost' | 'outline' | 'secondary';
  size?: 'sm' | 'md';
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={() => setOpen(true)}
        className={className}
      >
        <Plus className="h-3.5 w-3.5" />
        {label}
      </Button>
      <QcmQuestionEditor
        open={open}
        onOpenChange={setOpen}
        coursId={coursId}
        serieId={serieId}
        initial={initial ?? null}
      />
    </>
  );
}

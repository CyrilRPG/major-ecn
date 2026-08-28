'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import Image from 'next/image';
import { Loader2, Plus, Trash2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { FlashcardRichField } from './flashcard-rich-field';
import { upsertQcmQuestionAction, uploadQcmImageAction, updateSerieVignetteAction } from '@/app/admin/contenu/[cours]/qcm-actions';
import { flashcardHasContent } from '@/lib/flashcards/rich-text';

export type QcmItemDraft = {
  lettre: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K';
  enonce: string;
  is_correct: boolean;
  justification: string;
  images: string[];
};
export type QcmQuestionDraft = {
  id?: string;
  /** 'qcm' = items A-E à cocher ; 'qroc' = question rédactionnelle courte (réponse attendue). */
  format: 'qcm' | 'qroc';
  enonce: string;
  /** QROC uniquement : réponse-modèle. Variantes acceptées séparées par « | ». */
  reponse_attendue: string;
  correction_generale: string;
  /** Rubrique libre de l'enseignant, affichée en plus du corrigé. */
  commentaire_enseignant: string;
  images: string[];
  items: QcmItemDraft[];
};

const EMPTY_ITEM = (l: QcmItemDraft['lettre']): QcmItemDraft => ({
  lettre: l, enonce: '', is_correct: false, justification: '', images: [],
});

function defaultDraft(): QcmQuestionDraft {
  return {
    format: 'qcm',
    enonce: '',
    reponse_attendue: '',
    correction_generale: '',
    commentaire_enseignant: '',
    images: [],
    items: ['A', 'B', 'C', 'D', 'E'].map((l) => EMPTY_ITEM(l as QcmItemDraft['lettre'])),
  };
}

export function QcmQuestionEditor({
  open, onOpenChange, coursId, serieId, initial, initialVignette, insertAnchor, onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  coursId: string;
  serieId: string;
  initial?: QcmQuestionDraft | null;
  /** Vignette clinique actuelle de la série (partagée entre ses questions). */
  initialVignette?: string | null;
  /** En création : question à côté de laquelle insérer (choix de position). */
  insertAnchor?: { questionId: string; position: number } | null;
  onSaved?: () => void;
}) {
  const [draft, setDraft] = useState<QcmQuestionDraft>(initial ?? defaultDraft());
  const [vignetteEnabled, setVignetteEnabled] = useState(!!initialVignette);
  const [vignette, setVignette] = useState(initialVignette ?? '');
  const [atEnd, setAtEnd] = useState(false); // false = insérer ici, true = à la fin
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const isCreate = !draft.id;
  const showPositionChoice = isCreate && !!insertAnchor;
  const isQroc = draft.format === 'qroc';

  useEffect(() => {
    if (open) {
      setDraft(initial
        ? {
            ...initial,
            format: initial.format ?? 'qcm',
            reponse_attendue: initial.reponse_attendue ?? '',
            commentaire_enseignant: initial.commentaire_enseignant ?? '',
            items: initial.items.map((i) => ({ ...i, images: i.images ?? [] })),
          }
        : defaultDraft());
      setVignetteEnabled(!!initialVignette);
      setVignette(initialVignette ?? '');
      setAtEnd(false);
      setErr(null);
    }
  }, [open, initial, initialVignette]);

  const updateItem = (idx: number, patch: Partial<QcmItemDraft>) => {
    setDraft((d) => ({ ...d, items: d.items.map((it, i) => i === idx ? { ...it, ...patch } : it) }));
  };
  const removeItem = (idx: number) => {
    setDraft((d) => ({ ...d, items: d.items.filter((_, i) => i !== idx) }));
  };
  const addItem = () => {
    // A-K : la base accepte jusqu'à 11 propositions (banques hémato / EVC 2025).
    if (draft.items.length >= 11) return;
    const used = new Set(draft.items.map((i) => i.lettre));
    const next = (['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'] as const).find((l) => !used.has(l));
    if (!next) return;
    setDraft((d) => ({ ...d, items: [...d.items, EMPTY_ITEM(next)] }));
  };

  const onSubmit = () => {
    setErr(null);
    if (!flashcardHasContent(draft.enonce)) { setErr('L’énoncé est requis.'); return; }

    const items = draft.items
      .filter((it) => flashcardHasContent(it.enonce))
      .map((it) => ({
        lettre: it.lettre,
        enonce: it.enonce,
        is_correct: it.is_correct,
        justification: it.justification,
        images: it.images,
      }));

    if (isQroc) {
      if (!draft.reponse_attendue.trim()) { setErr('La réponse attendue est requise pour une QROC.'); return; }
    } else {
      if (items.length < 2) { setErr('Au moins 2 items avec un énoncé.'); return; }
      if (items.filter((i) => i.is_correct).length < 1) { setErr('Au moins un item doit être marqué comme correct.'); return; }
    }

    start(async () => {
      const res = await upsertQcmQuestionAction({
        questionId: draft.id,
        serieId,
        coursId,
        question: {
          format: draft.format,
          enonce: draft.enonce,
          reponse_attendue: isQroc ? draft.reponse_attendue.trim() : null,
          correction_generale: draft.correction_generale || null,
          commentaire_enseignant: draft.commentaire_enseignant || null,
          images: draft.images,
          items: isQroc ? [] : items,
        },
        insertAfterQuestionId: showPositionChoice && !atEnd ? insertAnchor!.questionId : undefined,
      });
      if ('error' in res) { setErr(res.error); return; }

      // Vignette clinique (niveau série) : mise à jour si l'état a changé.
      const nextVig = vignetteEnabled ? vignette.trim() : '';
      const prevVig = (initialVignette ?? '').trim();
      if (nextVig !== prevVig) {
        const vr = await updateSerieVignetteAction({ serieId, coursId, vignette: nextVig });
        if ('error' in vr) { setErr(vr.error); return; }
      }

      onSaved?.();
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{draft.id ? 'Modifier la question' : 'Nouvelle question'}</DialogTitle>
          <DialogDescription>
            {isQroc
              ? 'Question rédactionnelle courte (QROC) : énoncé, réponse attendue, corrigé et schémas. Mise en forme possible (gras, italique, souligné, couleur, image).'
              : 'Énoncé, items A-E, justifications, corrigé général et images. Mise en forme possible (gras, italique, souligné, couleur, image).'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Type de question : QCM (items à cocher) ou QROC (réponse rédigée) */}
          <div className="space-y-1.5">
            <Label>Type de question</Label>
            <div className="flex gap-2">
              {(['qcm', 'qroc'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, format: f }))}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors ${
                    draft.format === f
                      ? 'border-(--color-primary) bg-(--color-primary-soft) text-(--color-primary-deep)'
                      : 'border-(--color-border) text-(--color-ink-soft) hover:bg-(--color-surface-soft)'
                  }`}
                >
                  {f === 'qcm' ? 'QCM (items A-E)' : 'QROC (réponse courte)'}
                </button>
              ))}
            </div>
          </div>

          {/* Vignette clinique (optionnelle, niveau série / DP) */}
          <div className="rounded-xl border border-(--color-border) bg-(--color-surface-soft) p-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-(--color-ink)">
              <input
                type="checkbox"
                checked={vignetteEnabled}
                onChange={(e) => setVignetteEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-(--color-border)"
              />
              Vignette clinique (contexte partagé — dossier progressif)
            </label>
            {vignetteEnabled && (
              <div className="mt-2">
                <FlashcardRichField
                  coursId={coursId}
                  value={vignette}
                  onChange={setVignette}
                  placeholder="Patient de 62 ans, tabagique, se présente aux urgences pour…"
                  minHeight={96}
                />
              </div>
            )}
          </div>

          {/* Énoncé */}
          <div className="space-y-1.5">
            <Label>Énoncé</Label>
            <FlashcardRichField
              coursId={coursId}
              value={draft.enonce}
              onChange={(html) => setDraft((d) => ({ ...d, enonce: html }))}
              placeholder="Concernant l'asthme aigu grave, quelles affirmations sont vraies ?"
            />
          </div>

          {/* Images niveau question */}
          <ImageList
            images={draft.images}
            onChange={(imgs) => setDraft((d) => ({ ...d, images: imgs }))}
            label="Images de la question (arbres décisionnels, ECG, scanners, schémas…)"
          />

          {/* QROC : réponse attendue */}
          {isQroc && (
            <div className="space-y-1.5">
              <Label>Réponse attendue</Label>
              <Textarea
                rows={3}
                value={draft.reponse_attendue}
                onChange={(e) => setDraft((d) => ({ ...d, reponse_attendue: e.target.value }))}
                placeholder="Ex : Embolie pulmonaire | EP"
              />
              <p className="text-[11px] text-(--color-ink-muted)">
                Réponse-modèle affichée à l&apos;étudiant. Séparez les variantes acceptées par «&nbsp;|&nbsp;» (ex.&nbsp;: «&nbsp;Embolie pulmonaire | EP&nbsp;»).
              </p>
            </div>
          )}

          {/* Items A-E (QCM uniquement) */}
          {!isQroc && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label>Items (réponses A-E)</Label>
              {draft.items.length < 11 && (
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
                    <FlashcardRichField
                      coursId={coursId}
                      value={it.enonce}
                      onChange={(html) => updateItem(idx, { enonce: html })}
                      placeholder={`Énoncé de l'item ${it.lettre}…`}
                      minHeight={56}
                    />
                    <FlashcardRichField
                      coursId={coursId}
                      value={it.justification}
                      onChange={(html) => updateItem(idx, { justification: html })}
                      placeholder="Justification (explication détaillée affichée au corrigé)"
                      minHeight={56}
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
          )}

          {/* Corrigé — deux sections indépendantes, toutes deux en texte riche */}
          <div className="space-y-4 rounded-xl border border-(--color-border) bg-(--color-surface-soft) p-3">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-(--color-ink-muted)">
              Corrigé affiché à l’étudiant
            </p>

            <div className="space-y-1.5">
              <Label>1 · Corrigé général (optionnel)</Label>
              <FlashcardRichField
                coursId={coursId}
                value={draft.correction_generale}
                onChange={(html) => setDraft((d) => ({ ...d, correction_generale: html }))}
                placeholder="Explication globale, points clés, rappels physiopathologiques… Insérez un schéma avec le bouton image."
                minHeight={160}
              />
              <p className="text-[11px] text-(--color-ink-muted)">
                {isQroc
                  ? 'Affiché après la réponse au moment du corrigé. Utilisez le bouton image de la barre d’outils pour insérer un schéma (arbre décisionnel, ECG, illustration…).'
                  : 'Apparaît sous l’ensemble des items au moment du corrigé, en plus des justifications par item. Le bouton image permet d’insérer un schéma.'}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>2 · Commentaire de l’enseignant (optionnel)</Label>
              <FlashcardRichField
                coursId={coursId}
                value={draft.commentaire_enseignant}
                onChange={(html) => setDraft((d) => ({ ...d, commentaire_enseignant: html }))}
                placeholder="Rappel, remise en contexte, notion à réexpliquer, schéma… Mise en forme et images disponibles."
                minHeight={160}
              />
              <p className="text-[11px] text-(--color-ink-muted)">
                Rubrique distincte du corrigé, affichée à l’étudiant sous la correction. Mêmes outils de mise en forme
                que le corrigé général (gras, italique, surlignage, couleur, image).
              </p>
            </div>
          </div>

          {/* Position (en création à côté d'une question existante) */}
          {showPositionChoice && (
            <div className="space-y-1.5">
              <Label>Position</Label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <label className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm ${!atEnd ? 'border-(--color-primary) bg-(--color-primary-soft)' : 'border-(--color-border)'}`}>
                  <input type="radio" name="q-pos" checked={!atEnd} onChange={() => setAtEnd(false)} className="h-4 w-4" />
                  Insérer ici (après la question n°{insertAnchor!.position + 1})
                </label>
                <label className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm ${atEnd ? 'border-(--color-primary) bg-(--color-primary-soft)' : 'border-(--color-border)'}`}>
                  <input type="radio" name="q-pos" checked={atEnd} onChange={() => setAtEnd(true)} className="h-4 w-4" />
                  À la fin de la série
                </label>
              </div>
            </div>
          )}
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

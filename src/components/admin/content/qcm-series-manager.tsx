'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronRight, ClipboardList, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { QcmQuestionEditor, type QcmQuestionDraft } from './qcm-question-editor';
import {
  createQcmSerieAction,
  deleteQcmQuestionAction,
  deleteQcmSerieAction,
} from '@/app/admin/contenu/[cours]/qcm-actions';

export type QcmSerieFull = {
  id: string;
  label: string;
  questions: QcmQuestionDraft[];
};

export function QcmSeriesManager({
  coursId, series,
}: { coursId: string; series: QcmSerieFull[] }) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<{ serieId: string; q?: QcmQuestionDraft } | null>(null);
  const [openSerie, setOpenSerie] = useState<Set<string>>(new Set());
  const [pending, start] = useTransition();

  const toggle = (id: string) => {
    setOpenSerie((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const removeSerie = (id: string) => {
    if (!confirm('Supprimer cette série et toutes ses questions ?')) return;
    start(async () => {
      await deleteQcmSerieAction(id, coursId);
      router.refresh();
    });
  };
  const removeQuestion = (id: string) => {
    if (!confirm('Supprimer cette question ? Elle pourra être restaurée depuis les logs.')) return;
    start(async () => {
      await deleteQcmQuestionAction(id, coursId);
      router.refresh();
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-(--color-ink)">Édition manuelle des QCM</h3>
        <Button type="button" onClick={() => setCreateOpen(true)} disabled={pending}>
          <Plus className="h-3.5 w-3.5" /> Nouvelle série
        </Button>
      </div>

      {series.length === 0 ? (
        <p className="rounded-xl border border-dashed border-(--color-border) bg-(--color-surface-soft) px-4 py-6 text-center text-sm text-(--color-ink-soft)">
          Aucune série QCM. Créez-en une pour commencer à ajouter des questions.
        </p>
      ) : (
        <ul className="space-y-2">
          {series.map((s) => {
            const open = openSerie.has(s.id);
            return (
              <li key={s.id} className="rounded-xl border border-(--color-border) bg-(--color-surface)">
                <div className="flex items-center gap-2 px-3 py-2">
                  <button
                    type="button"
                    onClick={() => toggle(s.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-(--color-ink-soft) hover:bg-(--color-sand-100)"
                  >
                    {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                  </button>
                  <ClipboardList className="h-4 w-4 text-(--color-ink-soft)" />
                  <span className="flex-1 text-sm font-semibold text-(--color-ink)">{s.label}</span>
                  <span className="rounded-full bg-(--color-sand-100) px-2 py-0.5 text-[11px] font-semibold text-(--color-ink-soft)">
                    {s.questions.length} Q
                  </span>
                  <Button
                    type="button" variant="ghost" size="sm"
                    onClick={() => setEditingQuestion({ serieId: s.id, q: undefined })}
                    title="Ajouter une question"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button" variant="ghost" size="sm"
                    onClick={() => removeSerie(s.id)} disabled={pending}
                    className="text-(--color-danger)"
                    title="Supprimer la série"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {open && (
                  <div className="space-y-1.5 border-t border-(--color-border) bg-(--color-surface-soft) p-2">
                    {s.questions.length === 0 ? (
                      <p className="py-3 text-center text-xs text-(--color-ink-soft) italic">
                        Aucune question.
                      </p>
                    ) : (
                      s.questions.map((q, i) => (
                        <div key={q.id ?? i} className="flex items-start gap-2 rounded-lg bg-white p-2 text-sm">
                          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded bg-(--color-sand-100) font-mono text-[10px] font-bold text-(--color-ink-soft)">
                            {i + 1}
                          </span>
                          <p className="flex-1 text-(--color-ink) leading-snug">
                            {q.enonce}
                            <span className="ml-2 inline-flex items-center gap-1 text-[10px] text-(--color-ink-muted)">
                              {q.items.length} items · {q.items.filter((it) => it.is_correct).length} vrais
                              {(q.images?.length ?? 0) > 0 && ` · ${q.images.length} image${q.images.length > 1 ? 's' : ''}`}
                              {q.correction_generale && ' · corrigé'}
                            </span>
                          </p>
                          <Button
                            type="button" variant="ghost" size="sm"
                            onClick={() => setEditingQuestion({ serieId: s.id, q })}
                            title="Modifier"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          {q.id && (
                            <Button
                              type="button" variant="ghost" size="sm"
                              onClick={() => removeQuestion(q.id!)} disabled={pending}
                              className="text-(--color-danger)"
                              title="Supprimer la question"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <CreateSerieDialog open={createOpen} onOpenChange={setCreateOpen} coursId={coursId} />
      {editingQuestion && (
        <QcmQuestionEditor
          open={!!editingQuestion}
          onOpenChange={(v) => { if (!v) setEditingQuestion(null); }}
          coursId={coursId}
          serieId={editingQuestion.serieId}
          initial={editingQuestion.q ?? null}
        />
      )}
    </div>
  );
}

/* ────────── Dialog : créer une série ────────── */

function CreateSerieDialog({
  open, onOpenChange, coursId,
}: { open: boolean; onOpenChange: (v: boolean) => void; coursId: string }) {
  const router = useRouter();
  const [label, setLabel] = useState('');
  const [kind, setKind] = useState<'qcm' | 'dp'>('qcm');
  const [vignette, setVignette] = useState('');
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const submit = () => {
    setErr(null);
    start(async () => {
      const res = await createQcmSerieAction({ coursId, label, kind, vignette });
      if ('error' in res) setErr(res.error);
      else {
        onOpenChange(false);
        setLabel(''); setVignette(''); setKind('qcm');
        router.refresh();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nouvelle série QCM</DialogTitle>
          <DialogDescription>
            Choisissez entre une série d&apos;entraînement classique (QCM isolés) ou un Dossier Progressif (vignette clinique commune).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="serie-label">Intitulé</Label>
            <Input
              id="serie-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={kind === 'dp' ? 'DP 1 · Exacerbation de BPCO chez un fumeur sevré' : 'Entraînement n°3'}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Type</Label>
            <div className="flex gap-2">
              {(['qcm', 'dp'] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors ${
                    kind === k
                      ? 'border-(--color-primary) bg-(--color-primary-soft) text-(--color-primary-deep)'
                      : 'border-(--color-border) text-(--color-ink-soft) hover:bg-(--color-surface-soft)'
                  }`}
                >
                  {k === 'qcm' ? 'QCM (questions isolées)' : 'DP (dossier progressif)'}
                </button>
              ))}
            </div>
          </div>

          {kind === 'dp' && (
            <div className="space-y-1.5">
              <Label htmlFor="vignette">Vignette clinique</Label>
              <Textarea
                id="vignette" rows={4}
                value={vignette}
                onChange={(e) => setVignette(e.target.value)}
                placeholder="Mme R., 68 ans, BPCO post-tabagique, consulte aux urgences pour une dyspnée d'aggravation progressive…"
              />
              <p className="text-[11px] text-(--color-ink-muted)">
                Affichée au-dessus de chaque question du DP côté étudiant.
              </p>
            </div>
          )}

          {err && <p className="rounded-lg bg-(--color-primary-soft) px-3 py-2 text-xs text-(--color-primary-deep)">{err}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-(--color-border)">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={pending}>
            Annuler
          </Button>
          <Button type="button" onClick={submit} disabled={pending || !label.trim()}>
            {pending ? <Loader2 className="animate-spin" /> : <Plus />}
            Créer la série
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

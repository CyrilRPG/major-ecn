'use client';

import { useState, useTransition } from 'react';
import { Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { upsertExamQuestion } from '@/app/admin/epreuves-blanches/actions';
import type { CollegeOption, ExamQuestionData } from './exam-editor';

const inputCls = 'w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-ink) outline-none focus:border-(--color-primary)';
const LETTERS = ['A', 'B', 'C', 'D', 'E'];
type Item = { lettre: string; enonce: string; is_correct: boolean; justification: string };

type Keyword = { label: string; points: number; mandatory: boolean };

export function ExamQuestionDialog({
  examId, colleges, initial, format, qrocMode = 'self', onClose,
}: {
  examId: string;
  colleges: CollegeOption[];
  initial: ExamQuestionData | null;
  format: 'qcm' | 'qroc';
  qrocMode?: 'self' | 'ai';
  onClose: () => void;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [enonce, setEnonce] = useState(initial?.enonce ?? '');
  const [collegeId, setCollegeId] = useState(initial?.college_id ?? '');
  const [points, setPoints] = useState<string>((initial?.points ?? 1).toString());
  const [correction, setCorrection] = useState(initial?.correction_generale ?? '');
  const [reponse, setReponse] = useState(initial?.reponse_attendue ?? '');
  // Critères de correction IA (QROC)
  const [keywords, setKeywords] = useState<Keyword[]>(
    (initial?.keywords ?? []).map((k) => ({ label: k.label, points: k.points, mandatory: !!k.mandatory })),
  );
  const [zeroIfMissing, setZeroIfMissing] = useState<string>((initial?.zero_if_missing ?? []).join('\n'));
  const [majorErrors, setMajorErrors] = useState<string>((initial?.major_errors ?? []).join('\n'));
  const [corrigeComplet, setCorrigeComplet] = useState(initial?.corrige_complet ?? '');
  const showAi = format === 'qroc' && qrocMode === 'ai';
  const splitLines = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean);
  const [items, setItems] = useState<Item[]>(
    initial?.items?.length
      ? initial.items.map((it) => ({ lettre: it.lettre, enonce: it.enonce, is_correct: it.is_correct, justification: it.justification ?? '' }))
      : [
          { lettre: 'A', enonce: '', is_correct: false, justification: '' },
          { lettre: 'B', enonce: '', is_correct: false, justification: '' },
          { lettre: 'C', enonce: '', is_correct: false, justification: '' },
          { lettre: 'D', enonce: '', is_correct: false, justification: '' },
          { lettre: 'E', enonce: '', is_correct: false, justification: '' },
        ],
  );

  const updateItem = (i: number, patch: Partial<Item>) => setItems((p) => p.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const addItem = () => setItems((p) => (p.length >= 5 ? p : [...p, { lettre: LETTERS[p.length], enonce: '', is_correct: false, justification: '' }]));

  const submit = () => {
    setError(null);
    if (!enonce.trim()) { setError('Énoncé requis'); return; }
    start(async () => {
      const res = await upsertExamQuestion(examId, {
        id: initial?.id,
        format,
        enonce: enonce.trim(),
        correction_generale: correction || null,
        points: Number(points) || (format === 'qcm' ? 1 : 1),
        college_id: collegeId || null,
        items: format === 'qcm' ? items.filter((it) => it.enonce.trim()) : [],
        reponse_attendue: format === 'qroc' ? reponse : null,
        keywords: showAi ? keywords.filter((k) => k.label.trim()) : [],
        zero_if_missing: showAi ? splitLines(zeroIfMissing) : [],
        major_errors: showAi ? splitLines(majorErrors) : [],
        corrige_complet: showAi ? corrigeComplet : null,
      });
      if (!res.ok) { setError(res.error); return; }
      onClose();
    });
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? 'Modifier' : 'Ajouter'} une question {format.toUpperCase()}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-(--color-ink)">Énoncé</span>
            <textarea rows={3} value={enonce} onChange={(e) => setEnonce(e.target.value)} className={inputCls} placeholder="Énoncé de la question…" />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-(--color-ink)">Spécialité (analyse)</span>
              <select value={collegeId} onChange={(e) => setCollegeId(e.target.value)} className={inputCls}>
                <option value="">— Aucune —</option>
                {colleges.map((c) => <option key={c.id} value={c.id}>{c.nom}{c.parentId ? ' (MG)' : ''}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-(--color-ink)">Points (barème personnalisé)</span>
              <input type="number" min={0} step="0.5" value={points} onChange={(e) => setPoints(e.target.value)} className={inputCls} />
            </label>
          </div>

          {format === 'qcm' ? (
            <div>
              <p className="mb-1.5 text-xs font-semibold text-(--color-ink)">Propositions (cocher les bonnes réponses)</p>
              <div className="space-y-2">
                {items.map((it, i) => (
                  <div key={i} className="rounded-lg border border-(--color-border) p-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded bg-(--color-sand-100) text-xs font-bold">{it.lettre}</span>
                      <input value={it.enonce} onChange={(e) => updateItem(i, { enonce: e.target.value })} className={inputCls} placeholder={`Proposition ${it.lettre}`} />
                      <label className="flex shrink-0 items-center gap-1 text-xs font-semibold text-(--color-ink-soft)">
                        <input type="checkbox" checked={it.is_correct} onChange={(e) => updateItem(i, { is_correct: e.target.checked })} /> Vrai
                      </label>
                    </div>
                    <input value={it.justification} onChange={(e) => updateItem(i, { justification: e.target.value })} className={inputCls + ' mt-1.5 text-xs'} placeholder="Justification (optionnelle)" />
                  </div>
                ))}
              </div>
              {items.length < 5 && (
                <button type="button" onClick={addItem} className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold text-(--color-primary)"><Plus className="h-3.5 w-3.5" /> Ajouter une proposition</button>
              )}
            </div>
          ) : (
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-(--color-ink)">Réponse(s) attendue(s) — variantes séparées par « | »</span>
              <input value={reponse} onChange={(e) => setReponse(e.target.value)} className={inputCls} placeholder="spirométrie|EFR|explorations fonctionnelles respiratoires" />
            </label>
          )}

          {showAi && (
            <div className="space-y-3 rounded-xl border border-dashed border-[#8B5CF6]/40 bg-[#8B5CF6]/5 p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-[#6D28D9]">Barème de correction IA</p>
              <p className="text-[11px] text-(--color-ink-soft)">L’IA attribue les points EXCLUSIVEMENT selon ces critères — elle n’invente rien, elle reconnaît seulement les formulations équivalentes.</p>

              <div>
                <p className="mb-1 text-xs font-semibold text-(--color-ink)">Mots-clés attendus (points + obligatoire)</p>
                <div className="space-y-1.5">
                  {keywords.map((k, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input value={k.label} onChange={(e) => setKeywords((p) => p.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} className={inputCls} placeholder="ex. antibiothérapie" />
                      <input type="number" min={0} step="0.5" value={k.points} onChange={(e) => setKeywords((p) => p.map((x, j) => j === i ? { ...x, points: Number(e.target.value) } : x))} className="w-16 rounded-md border border-(--color-border) px-2 py-1.5 text-sm" />
                      <label className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-(--color-ink-soft)">
                        <input type="checkbox" checked={k.mandatory} onChange={(e) => setKeywords((p) => p.map((x, j) => j === i ? { ...x, mandatory: e.target.checked } : x))} /> oblig.
                      </label>
                      <button type="button" onClick={() => setKeywords((p) => p.filter((_, j) => j !== i))} className="text-(--color-danger)"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => setKeywords((p) => [...p, { label: '', points: 1, mandatory: false }])} className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-[#6D28D9]"><Plus className="h-3.5 w-3.5" /> Ajouter un mot-clé</button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-(--color-ink)">« Pas mis = 0 » (un par ligne)</span>
                  <textarea rows={3} value={zeroIfMissing} onChange={(e) => setZeroIfMissing(e.target.value)} className={inputCls} placeholder={'antibiothérapie\nhospitalisation'} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-(--color-ink)">Erreurs majeures = 0 (une par ligne)</span>
                  <textarea rows={3} value={majorErrors} onChange={(e) => setMajorErrors(e.target.value)} className={inputCls} placeholder={'prescription contre-indiquée\ntraitement dangereux'} />
                </label>
              </div>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-(--color-ink)">Corrigé complet (référence pour l’IA)</span>
                <textarea rows={3} value={corrigeComplet} onChange={(e) => setCorrigeComplet(e.target.value)} className={inputCls} placeholder="Corrigé type détaillé…" />
              </label>
            </div>
          )}

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-(--color-ink)">Correction / explication</span>
            <textarea rows={2} value={correction} onChange={(e) => setCorrection(e.target.value)} className={inputCls} placeholder="Explication de la correction…" />
          </label>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-(--color-danger)">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={pending}>Annuler</Button>
          <Button onClick={submit} disabled={pending}>{pending ? <Loader2 className="animate-spin" /> : <Save />} Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

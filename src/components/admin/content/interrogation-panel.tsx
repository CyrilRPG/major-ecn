'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardList, Loader2, PenLine, Plus, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ensureInterrogation, listInterrogationQuestions, setInterrogationQrocMode,
  deleteExamQuestion, type InterrogationInfo,
} from '@/app/admin/epreuves-blanches/actions';
import { ExamQuestionDialog } from '@/components/admin/epreuves/exam-question-dialog';
import { ExamAiGenerateDialog } from '@/components/admin/epreuves/exam-ai-generate-dialog';
import type { CollegeOption, ExamQuestionData } from '@/components/admin/epreuves/exam-editor';

/**
 * Onglet « Interrogations » d'un item. L'interrogation de fin de parcours est
 * une épreuve rattachée à l'item : elle réutilise tout le moteur d'épreuve
 * (QCM/QROC, dossiers progressifs, correction auto ou IA).
 */
export function InterrogationPanel({
  coursId,
  colleges,
}: {
  coursId: string;
  colleges: CollegeOption[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [info, setInfo] = useState<InterrogationInfo | null>(null);
  const [questions, setQuestions] = useState<ExamQuestionData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [creatingFormat, setCreatingFormat] = useState<'qcm' | 'qroc' | null>(null);
  const [editing, setEditing] = useState<ExamQuestionData | null>(null);
  const [aiOpen, setAiOpen] = useState(false);

  const load = () => {
    start(async () => {
      const res = await ensureInterrogation(coursId);
      if (!res.ok) { setError(res.error); return; }
      setInfo(res.info);
      const qs = await listInterrogationQuestions(res.info.id);
      if (qs.ok) setQuestions(qs.questions as unknown as ExamQuestionData[]);
    });
  };

  useEffect(load, [coursId]); // eslint-disable-line react-hooks/exhaustive-deps

  const changeMode = (mode: 'self' | 'ai') => {
    if (!info) return;
    setInfo({ ...info, qroc_mode: mode });
    start(async () => { await setInterrogationQrocMode(info.id, mode); });
  };

  const removeQuestion = (qid: string) => {
    if (!info) return;
    start(async () => { await deleteExamQuestion(info.id, qid); load(); });
  };

  if (!info) {
    return (
      <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-8 text-center">
        {error
          ? <p className="text-sm text-(--color-danger)">{error}</p>
          : <p className="flex items-center justify-center gap-2 text-sm text-(--color-ink-soft)"><Loader2 className="h-4 w-4 animate-spin" /> Chargement de l’interrogation…</p>}
      </div>
    );
  }

  const dpCount = new Set(questions.filter((q) => q.vignette).map((q) => q.vignette)).size;

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5">
        <h2 className="flex items-center gap-2 text-base font-bold text-(--color-ink)">
          <ClipboardList className="h-5 w-5 text-(--color-primary)" /> Interrogation de fin de parcours
        </h2>
        <p className="mt-1 text-sm text-(--color-ink-soft)">
          Les questions ci-dessous constituent l’interrogation passée par l’élève à la fin du parcours de cet item.
          Tant qu’aucune question n’est définie, l’élève passe l’interrogation automatique
          (15 QCM tirés au hasard parmi les QCM de l’item).
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-(--color-surface-soft) px-3 py-1 text-sm font-semibold text-(--color-ink)">
            {questions.length} question{questions.length > 1 ? 's' : ''}
            {dpCount > 0 ? ` · ${dpCount} DP` : ''}
          </span>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-(--color-ink-soft)">Correction QROC :</span>
            <select
              value={info.qroc_mode}
              onChange={(e) => changeMode(e.target.value as 'self' | 'ai')}
              className="rounded-lg border border-(--color-border) bg-(--color-surface) px-2 py-1 text-sm"
            >
              <option value="self">Auto-évaluation</option>
              <option value="ai">Correction par IA</option>
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setCreatingFormat('qcm')}><Plus className="h-4 w-4" /> QCM</Button>
          <Button variant="outline" size="sm" onClick={() => setCreatingFormat('qroc')}><Plus className="h-4 w-4" /> QROC</Button>
          <Button
            variant="outline" size="sm" onClick={() => setAiOpen(true)}
            className="border-[#8B5CF6]/40 text-[#6D28D9] hover:bg-[#F3EAFF]"
          >
            <Sparkles className="h-4 w-4" /> Générer par IA
          </Button>
          {pending && <Loader2 className="h-4 w-4 animate-spin text-(--color-ink-muted)" />}
        </div>
      </section>

      <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5">
        {questions.length === 0 ? (
          <p className="py-8 text-center text-sm text-(--color-ink-soft)">
            Aucune question. Ajoutez-en à la main ou générez-les par IA à partir de la fiche de ce cours.
          </p>
        ) : (
          <ul className="space-y-2">
            {questions.map((q, i) => (
              <li key={q.id} className="flex items-start gap-3 rounded-xl border border-(--color-border) px-3 py-2.5">
                <span className="mt-0.5 shrink-0 rounded-md bg-(--color-surface-soft) px-2 py-0.5 text-[11px] font-bold text-(--color-ink-soft)">
                  {i + 1} · {q.format === 'qroc' ? 'QROC' : 'QCM'}{q.vignette ? ' · DP' : ''}
                </span>
                <p
                  className="min-w-0 flex-1 truncate text-sm text-(--color-ink)"
                  dangerouslySetInnerHTML={{ __html: String(q.enonce ?? '').replace(/<[^>]+>/g, ' ').slice(0, 160) }}
                />
                <button type="button" onClick={() => setEditing(q)} className="shrink-0 text-(--color-ink-soft) hover:text-(--color-primary)" title="Éditer">
                  <PenLine className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => removeQuestion(q.id)} className="shrink-0 text-(--color-ink-soft) hover:text-(--color-danger)" title="Supprimer">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {(editing || creatingFormat) && (
        <ExamQuestionDialog
          examId={info.id}
          colleges={colleges}
          initial={editing}
          format={editing?.format ?? creatingFormat ?? 'qcm'}
          qrocMode={info.qroc_mode}
          onClose={() => { setEditing(null); setCreatingFormat(null); load(); router.refresh(); }}
        />
      )}
      {aiOpen && (
        <ExamAiGenerateDialog
          examId={info.id}
          colleges={colleges}
          qrocMode={info.qroc_mode}
          scope="interrogation"
          lockedCoursId={coursId}
          onClose={() => { setAiOpen(false); load(); router.refresh(); }}
        />
      )}
    </div>
  );
}

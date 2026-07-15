'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Loader2, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ExamResults } from '@/components/student/exam-results';
import { getExamCopy, deleteExamResultsForUser } from '@/app/admin/epreuves-blanches/actions';

export type ResultRow = {
  submissionId: string;
  userId: string;
  name: string;
  email: string;
  status: string;
  score: number | null;
  maxScore: number | null;
  percentage: number | null;
  timeSpentSeconds: number | null;
  submittedAt: string | null;
  hasAiReport: boolean;
};

type Copy = { submission: Record<string, unknown>; answers: Record<string, unknown>[] };

const STATUS_LABEL: Record<string, { label: string; bg: string; fg: string }> = {
  graded: { label: 'Corrigée', bg: '#E7F6EC', fg: '#16793C' },
  submitted: { label: 'Remise', bg: '#E5F1FF', fg: '#1E4D8B' },
  absent: { label: 'Absent', bg: '#FEE2E2', fg: '#B42318' },
};

function scoreTheme(pct: number | null) {
  if (pct == null) return { bg: '#F1F1F4', fg: '#5B6478' };
  if (pct < 50) return { bg: '#FDE7E9', fg: '#C0001F' };
  if (pct < 80) return { bg: '#FEF3E2', fg: '#B26A00' };
  return { bg: '#E7F6EC', fg: '#16793C' };
}

export function AdminExamResults({
  exam,
  questions,
  rows,
  collegeNames,
}: {
  exam: { id: string; title: string; qroc_mode: 'self' | 'ai' };
  questions: Record<string, unknown>[];
  rows: ResultRow[];
  collegeNames: Record<string, string>;
}) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copies, setCopies] = useState<Record<string, Copy>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [, startDelete] = useTransition();

  const toggle = (row: ResultRow) => {
    setError(null);
    if (expandedId === row.submissionId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(row.submissionId);
    if (!copies[row.submissionId]) {
      setLoadingId(row.submissionId);
      getExamCopy(row.submissionId).then((res) => {
        setLoadingId(null);
        if (res.ok) setCopies((c) => ({ ...c, [row.submissionId]: { submission: res.submission, answers: res.answers } }));
        else setError(res.error);
      });
    }
  };

  const remove = (row: ResultRow) => {
    if (!confirm(`Supprimer les résultats de ${row.name} pour cette épreuve ?\nSa copie sera effacée et il pourra refaire l’épreuve.`)) return;
    setError(null);
    setDeletingId(row.submissionId);
    startDelete(async () => {
      const res = await deleteExamResultsForUser(exam.id, row.userId);
      setDeletingId(null);
      if (!res.ok) { setError(res.error); return; }
      if (expandedId === row.submissionId) setExpandedId(null);
      router.refresh();
    });
  };

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-(--color-border) bg-(--color-surface-soft) px-4 py-12 text-center text-sm text-(--color-ink-soft)">
        Aucun élève n’a encore composé cette épreuve.
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {error && (
        <p className="rounded-lg border border-(--color-danger)/30 bg-red-50 px-3 py-2 text-sm text-(--color-danger)">{error}</p>
      )}
      {rows.map((row) => {
        const st = STATUS_LABEL[row.status] ?? STATUS_LABEL.submitted;
        const sc = scoreTheme(row.percentage);
        const open = expandedId === row.submissionId;
        const copy = copies[row.submissionId];
        return (
          <div key={row.submissionId} className="overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-(--shadow-soft)">
            <div className="flex flex-wrap items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold text-(--color-ink)">{row.name}</p>
                <p className="truncate text-xs text-(--color-ink-muted)">
                  {row.email}
                  {row.submittedAt ? ` · remis le ${new Date(row.submittedAt).toLocaleString('fr-FR')}` : ''}
                  {row.timeSpentSeconds ? ` · ${Math.floor(row.timeSpentSeconds / 60)} min` : ''}
                </p>
              </div>

              <span className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: st.bg, color: st.fg }}>
                {st.label}
              </span>
              <span className="shrink-0 rounded-full px-2.5 py-1 text-sm font-bold tabular-nums" style={{ background: sc.bg, color: sc.fg }}>
                {row.percentage != null ? `${Math.round(row.percentage)}%` : '—'}
              </span>

              <div className="flex shrink-0 items-center gap-1.5">
                <Button type="button" variant="outline" size="sm" onClick={() => toggle(row)}>
                  {loadingId === row.submissionId ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />}
                  Détails
                  <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                  disabled={deletingId === row.submissionId}
                  onClick={() => remove(row)}
                >
                  {deletingId === row.submissionId ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  Supprimer
                </Button>
              </div>
            </div>

            {open && (
              <div className="border-t border-(--color-border) bg-(--color-surface-soft) p-4">
                {loadingId === row.submissionId && !copy ? (
                  <p className="flex items-center gap-2 text-sm text-(--color-ink-soft)"><Loader2 className="h-4 w-4 animate-spin" /> Chargement de la copie…</p>
                ) : copy ? (
                  <ExamResults
                    readOnly
                    exam={exam}
                    submission={copy.submission}
                    questions={questions}
                    answers={copy.answers}
                    collegeNames={collegeNames}
                    leaderboard={null}
                  />
                ) : (
                  <p className="text-sm text-(--color-ink-soft)">Copie indisponible.</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

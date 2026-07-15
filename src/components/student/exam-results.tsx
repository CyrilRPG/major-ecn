'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Loader2, Sparkles, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { sanitizeFlashcardHtml } from '@/lib/flashcards/rich-text';
import { examLevel, weakColleges, type PerCollege } from '@/lib/exams/scoring';
import { selfGradeAnswer, finalizeExamCorrection } from '@/app/(student)/epreuves-blanches/actions';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = Record<string, any>;

export function ExamResults({
  exam, submission, questions, answers, collegeNames = {}, leaderboard = null, readOnly = false,
}: {
  exam: { id: string; title: string; qroc_mode: 'self' | 'ai' };
  submission: AnyRow;
  questions: AnyRow[];
  answers: AnyRow[];
  collegeNames?: Record<string, string>;
  leaderboard?: AnyRow | null;
  /** Vue admin en lecture seule : masque les boutons de correction/auto-évaluation. */
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [grading, setGrading] = useState<string | null>(null);
  const [aiGrading, setAiGrading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [pct, setPct] = useState<number>(submission.percentage ?? 0);

  const ansByQ = new Map(answers.map((x) => [x.question_id, x]));
  const perCollege = (submission.per_college ?? {}) as PerCollege;
  const level = examLevel(pct);
  const weak = weakColleges(perCollege);
  const aiReport = submission.ai_report as AnyRow | null;
  const hasQroc = questions.some((q) => q.format === 'qroc');
  const pendingSelf = exam.qroc_mode === 'self' && questions.some((q) => q.format === 'qroc' && !ansByQ.get(q.id)?.self_grade);
  const canAiGrade = !readOnly && exam.qroc_mode === 'ai' && hasQroc && !aiReport;

  const runAiGrading = () => {
    setAiGrading(true); setAiError(null);
    finalizeExamCorrection({ submissionId: submission.id }).then((res) => {
      setAiGrading(false);
      if (res.ok) router.refresh();
      else setAiError(res.error);
    });
  };

  const grade = (questionId: string, g: 'correct' | 'partial' | 'incorrect') => {
    setGrading(questionId);
    selfGradeAnswer({ submissionId: submission.id, questionId, grade: g }).then((res) => {
      setGrading(null);
      if (res.ok) { setPct(res.percentage); router.refresh(); }
    });
  };

  const tierColor = level.tier === 'bon' ? '#16793C' : level.tier === 'intermediaire' ? '#B26A00' : '#C0112E';

  return (
    <div className="space-y-6 pb-8">
      {/* En-tête score */}
      <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 text-center shadow-(--shadow-soft)">
        <p className="text-sm text-(--color-ink-soft)">{exam.title}</p>
        <p className="mt-2 font-display text-5xl font-black tabular-nums" style={{ color: tierColor }}>{pct}%</p>
        <p className="mt-1 text-sm text-(--color-ink-soft)">
          {Math.round((submission.score ?? 0) * 100) / 100} / {Math.round((submission.max_score ?? 0) * 100) / 100} points
          {submission.time_spent_seconds ? ` · ${Math.floor(submission.time_spent_seconds / 60)} min` : ''}
        </p>
        <div className="mx-auto mt-4 max-w-md rounded-xl px-4 py-3 text-left" style={{ background: `${tierColor}14` }}>
          <p className="text-sm font-bold" style={{ color: tierColor }}>{level.title}</p>
          <p className="mt-1 text-[13px] leading-relaxed text-(--color-ink)">{level.body}</p>
          {weak.length > 0 && (
            <p className="mt-2 text-[13px] text-(--color-ink-soft)">Priorités : <strong className="text-(--color-ink)">{weak.slice(0, 4).map((w) => collegeNames[w.name] ?? w.name).join(', ')}</strong>.</p>
          )}
        </div>
        {pendingSelf && (
          <p className="mt-3 text-xs font-medium text-[#B45B00]">Auto-évaluez vos QROC ci-dessous pour finaliser votre note.</p>
        )}
        {canAiGrade && (
          <div className="mt-4">
            <Button onClick={runAiGrading} disabled={aiGrading} className="bg-[linear-gradient(90deg,#7C3AED,#8B5CF6)]">
              {aiGrading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Corriger ma copie
            </Button>
            {aiGrading && <p className="mt-2 text-xs text-(--color-ink-soft)">Correction en cours…</p>}
            {aiError && <p className="mt-2 text-xs text-(--color-danger)">{aiError}</p>}
          </div>
        )}
      </div>

      {/* Rapport de correction IA */}
      {aiReport && (
        <div className="rounded-2xl border-2 border-[#8B5CF6]/30 bg-[#8B5CF6]/5 p-5">
          <div className="flex items-center gap-2 text-[#6D28D9]">
            <Sparkles className="h-4 w-4" />
            <p className="text-sm font-bold">Rapport de correction — Niveau : {String(aiReport.niveau ?? '')}</p>
          </div>
          {aiReport.avis_general ? <p className="mt-2 text-[13px] leading-relaxed text-(--color-ink)">{String(aiReport.avis_general)}</p> : null}
          {Array.isArray(aiReport.plan_de_travail) && aiReport.plan_de_travail.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-bold uppercase tracking-wide text-[#6D28D9]">Plan de travail</p>
              <ul className="mt-1 list-inside list-disc space-y-0.5 text-[13px] text-(--color-ink)">
                {aiReport.plan_de_travail.map((p: string, i: number) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Classement & statistiques comparatives */}
      {leaderboard && Number(leaderboard.count) > 0 && (
        <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5">
          <p className="mb-3 text-sm font-bold text-(--color-ink)">Classement</p>
          {leaderboard.me && (
            <div className="mb-3 rounded-xl bg-(--color-primary-soft)/40 px-4 py-3 text-center">
              <p className="text-sm text-(--color-ink)">
                <strong className="text-(--color-primary)">{String(leaderboard.me.rank)}ᵉ</strong> sur {String(leaderboard.me.n)} candidat{Number(leaderboard.me.n) > 1 ? 's' : ''}
              </p>
              {Number(leaderboard.me.better_than_pct) > 0 && (
                <p className="mt-0.5 text-xs text-(--color-ink-soft)">Vous obtenez un score supérieur à {String(leaderboard.me.better_than_pct)}% des candidats{Number(leaderboard.me.better_than_pct) >= 90 ? ' — top 10 % !' : ''}.</p>
              )}
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 text-center text-sm sm:grid-cols-4">
            <Stat label="Moyenne" value={`${leaderboard.average ?? '—'}%`} />
            <Stat label="Médiane" value={`${leaderboard.median ?? '—'}%`} />
            <Stat label="Meilleure" value={`${leaderboard.best ?? '—'}%`} />
            <Stat label="Candidats" value={String(leaderboard.count)} />
          </div>
          {Array.isArray(leaderboard.top) && leaderboard.top.length > 0 && (
            <ol className="mt-3 space-y-1 text-sm">
              {leaderboard.top.map((t: AnyRow, i: number) => (
                <li key={i} className="flex items-center justify-between rounded-lg bg-(--color-surface-soft) px-3 py-1.5">
                  <span className="text-(--color-ink-soft)">{String(t.rank)}ᵉ</span>
                  <span className="font-bold tabular-nums text-(--color-ink)">{String(t.percentage)}%</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      {/* Analyse par spécialité */}
      {Object.keys(perCollege).length > 1 && (
        <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5">
          <p className="mb-3 text-sm font-bold text-(--color-ink)">Analyse par spécialité</p>
          <ul className="space-y-2">
            {Object.entries(perCollege).sort((a, b) => a[1].pct - b[1].pct).map(([cid, c]) => (
              <li key={cid} className="flex items-center gap-3 text-sm">
                <span className="w-40 shrink-0 truncate text-(--color-ink)">{collegeNames[cid] ?? cid}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-(--color-sand-200)">
                  <span className="block h-full rounded-full" style={{ width: `${c.pct}%`, background: c.pct >= 75 ? '#16A34A' : c.pct >= 50 ? '#E8742C' : '#C0112E' }} />
                </span>
                <span className="w-10 shrink-0 text-right font-bold tabular-nums text-(--color-ink)">{c.pct}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Corrigé question par question */}
      <div className="space-y-4">
        <p className="text-sm font-bold text-(--color-ink)">Correction détaillée</p>
        {questions.map((q, i) => {
          const ans = ansByQ.get(q.id);
          const selected = new Set<string>((ans?.selected_items ?? []) as string[]);
          return (
            <div key={q.id} className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-soft)">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs font-bold text-(--color-ink-muted)">Q{i + 1} · {q.format === 'qroc' ? 'QROC' : 'QCM'}</span>
                <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-bold', ans?.is_correct ? 'bg-[#E7F6EC] text-[#16793C]' : 'bg-[#FCEAEC] text-[#C0112E]')}>
                  {Math.round((ans?.points_awarded ?? 0) * 100) / 100} / {Math.round((ans?.max_points ?? 0) * 100) / 100} pt
                </span>
              </div>
              <p className="text-sm font-semibold text-(--color-ink)" dangerouslySetInnerHTML={{ __html: sanitizeFlashcardHtml(q.enonce) }} />

              {q.format === 'qcm' ? (
                <div className="mt-2 space-y-1.5">
                  {(q.items ?? []).map((it: AnyRow) => {
                    const chosen = selected.has(it.lettre);
                    return (
                      <div key={it.lettre} className={cn('rounded-lg border px-3 py-2 text-sm', it.is_correct ? 'border-[#16793C]/30 bg-[#E7F6EC]' : chosen ? 'border-(--color-danger)/30 bg-[#FCEAEC]' : 'border-(--color-border)')}>
                        <div className="flex items-start gap-2">
                          <span className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold', it.is_correct ? 'bg-[#16793C] text-white' : chosen ? 'bg-(--color-danger) text-white' : 'bg-(--color-sand-100) text-(--color-ink-muted)')}>{it.lettre}</span>
                          <div className="min-w-0">
                            <p className={cn(it.is_correct ? 'font-medium text-[#16793C]' : 'text-(--color-ink)')}>{it.enonce}{chosen ? ' · (votre choix)' : ''}</p>
                            {it.justification && <p className="mt-0.5 text-xs text-(--color-ink-soft)">{it.justification}</p>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-2 space-y-2">
                  <div className="rounded-lg border border-(--color-border) bg-(--color-surface-soft) px-3 py-2 text-sm">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-(--color-ink-muted)">Votre réponse</p>
                    <p className="mt-0.5 whitespace-pre-line text-(--color-ink)">{ans?.text_answer || <em className="text-(--color-ink-muted)">(vide)</em>}</p>
                  </div>
                  {q.reponse_attendue && (
                    <div className="rounded-lg border border-[#00695C]/30 bg-[#E0F2F1]/50 px-3 py-2 text-sm">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-[#00695C]">Réponse attendue</p>
                      <p className="mt-0.5 text-(--color-ink)">{String(q.reponse_attendue).split('|').map((s: string) => s.trim()).join(' ou ')}</p>
                    </div>
                  )}
                  {/* Auto-évaluation (mode self) */}
                  {exam.qroc_mode === 'self' && (
                    ans?.self_grade ? (
                      <p className="text-xs font-semibold text-(--color-ink-soft)">Auto-évaluation : {ans.self_grade === 'correct' ? 'Correct' : ans.self_grade === 'partial' ? 'Partiellement correct' : 'Incorrect'}</p>
                    ) : readOnly ? (
                      <p className="text-xs font-semibold text-(--color-ink-muted)">QROC non auto-évaluée par l’élève.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" className="border-red-300 text-red-600" disabled={grading === q.id} onClick={() => grade(q.id, 'incorrect')}><XCircle className="h-3.5 w-3.5" /> Incorrect</Button>
                        <Button size="sm" variant="outline" className="border-[#E8742C]/40 text-[#B45B00]" disabled={grading === q.id} onClick={() => grade(q.id, 'partial')}>Partiel</Button>
                        <Button size="sm" className="bg-[#2E8B57]" disabled={grading === q.id} onClick={() => grade(q.id, 'correct')}>{grading === q.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />} Correct</Button>
                      </div>
                    )
                  )}
                  {/* Retour IA (mode ai) */}
                  {exam.qroc_mode === 'ai' && ans?.ai_grade && (
                    <div className="rounded-lg border border-[#8B5CF6]/30 bg-[#8B5CF6]/5 px-3 py-2 text-[13px]">
                      {ans.ai_grade.feedback && <p className="text-(--color-ink)">{ans.ai_grade.feedback}</p>}
                      {Array.isArray(ans.ai_grade.gaps) && ans.ai_grade.gaps.length > 0 && (
                        <p className="mt-1 text-(--color-ink-soft)"><span className="font-semibold">Éléments oubliés :</span> {ans.ai_grade.gaps.join(', ')}</p>
                      )}
                      {Array.isArray(ans.ai_grade.major_errors_found) && ans.ai_grade.major_errors_found.length > 0 && (
                        <p className="mt-1 text-(--color-danger)"><span className="font-semibold">Erreur majeure :</span> {ans.ai_grade.major_errors_found.join(', ')}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {q.correction_generale && (
                <div className="mt-3 rounded-lg border border-(--color-border) bg-(--color-primary-soft)/30 px-3 py-2">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-(--color-primary-deep)">Correction</p>
                  <div className="mt-0.5 whitespace-pre-line text-sm text-(--color-ink)" dangerouslySetInnerHTML={{ __html: sanitizeFlashcardHtml(q.correction_generale) }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Button asChild variant="outline" className="w-full">
        <Link href="/epreuves-blanches"><ArrowLeft className="h-4 w-4" /> Retour aux épreuves</Link>
      </Button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-(--color-border) px-2 py-2">
      <p className="text-lg font-black tabular-nums text-(--color-ink)">{value}</p>
      <p className="text-[11px] text-(--color-ink-muted)">{label}</p>
    </div>
  );
}

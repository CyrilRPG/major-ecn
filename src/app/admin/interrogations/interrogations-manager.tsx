'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Award, CheckCircle2, ClipboardList, Loader2, PenLine, Plus, Sparkles, Trash2, Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ensureSpecialtyInterrogation, seedSpecialtyInterrogation, setSpecialtyInterrogationStatus,
  listInterrogationQuestions, setInterrogationQrocMode, deleteExamQuestion,
  type SpecialtyInterrogationInfo,
} from '@/app/admin/epreuves-blanches/actions';
import { ExamQuestionDialog } from '@/components/admin/epreuves/exam-question-dialog';
import { ExamAiGenerateDialog } from '@/components/admin/epreuves/exam-ai-generate-dialog';
import type { CollegeOption, ExamQuestionData } from '@/components/admin/epreuves/exam-editor';

type CollegeRow = {
  id: string;
  nom: string;
  parentId: string | null;
  exam: { id: string; status: string; nQuestions: number } | null;
};

export function InterrogationsManager({ colleges }: { colleges: CollegeRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [info, setInfo] = useState<SpecialtyInterrogationInfo | null>(null);
  const [questions, setQuestions] = useState<ExamQuestionData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [creatingFormat, setCreatingFormat] = useState<'qcm' | 'qroc' | null>(null);
  const [editing, setEditing] = useState<ExamQuestionData | null>(null);
  const [aiOpen, setAiOpen] = useState(false);

  const collegeOptions: CollegeOption[] = colleges.map((c) => ({ id: c.id, nom: c.nom, parentId: c.parentId }));
  const current = colleges.find((c) => c.id === selected) ?? null;

  const load = (matiereId: string) => {
    setError(null);
    start(async () => {
      const res = await ensureSpecialtyInterrogation(matiereId);
      if (!res.ok) { setError(res.error); setInfo(null); return; }
      setInfo(res.info);
      const qs = await listInterrogationQuestions(res.info.id);
      if (qs.ok) setQuestions(qs.questions as unknown as ExamQuestionData[]);
    });
  };

  useEffect(() => {
    if (selected) { setInfo(null); setQuestions([]); load(selected); }
  }, [selected]); // eslint-disable-line react-hooks/exhaustive-deps

  const nQcm = questions.filter((q) => q.format === 'qcm').length;
  const nQroc = questions.filter((q) => q.format === 'qroc').length;
  const conforme = nQcm >= 15 && nQroc >= 2;

  const seed = () => {
    if (!info || !selected) return;
    start(async () => {
      const res = await seedSpecialtyInterrogation(info.id, selected);
      if (!res.ok) { setError(res.error); return; }
      load(selected);
      router.refresh();
    });
  };

  const togglePublish = () => {
    if (!info || !selected) return;
    const publish = info.status !== 'published';
    start(async () => {
      const res = await setSpecialtyInterrogationStatus(info.id, publish);
      if (!res.ok) { setError(res.error); return; }
      setInfo({ ...info, status: publish ? 'published' : 'draft' });
      router.refresh();
    });
  };

  const removeQuestion = (qid: string) => {
    if (!info || !selected) return;
    start(async () => { await deleteExamQuestion(info.id, qid); load(selected); });
  };

  const changeMode = (mode: 'self' | 'ai') => {
    if (!info) return;
    setInfo({ ...info, qroc_mode: mode });
    start(async () => { await setInterrogationQrocMode(info.id, mode); });
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-10">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-xl font-black tracking-tight text-(--color-ink)">
          <Award className="h-5 w-5 text-(--color-primary)" /> Interrogations officielles de spécialité
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-(--color-ink-soft)">
          Interrogation Major EVC de fin de spécialité (15 QCM + 2 questions ouvertes, mini-cas
          clinique possible). Seule une interrogation <strong>publiée</strong> est proposée aux
          élèves — sans elle, la spécialité terminée reste en « Validation en attente ».
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* ── Liste des collèges ── */}
        <aside className="h-fit rounded-2xl border border-(--color-border) bg-(--color-surface) p-2">
          <ul className="max-h-[70vh] space-y-1 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
            {colleges.map((c) => {
              const st = c.exam?.status;
              const n = c.exam?.nQuestions ?? 0;
              return (
                <li key={c.id}>
                  <button
                    onClick={() => setSelected(c.id)}
                    className={cn(
                      'flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors',
                      selected === c.id ? 'bg-(--color-primary-soft) font-bold text-(--color-primary)' : 'hover:bg-(--color-sand-100)',
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate">{c.parentId ? `↳ ${c.nom}` : c.nom}</span>
                    {st === 'published' ? (
                      <span className="shrink-0 rounded-full bg-[#E7F6EC] px-2 py-0.5 text-[10px] font-bold text-[#16793C]">Publiée · {n}</span>
                    ) : st ? (
                      <span className="shrink-0 rounded-full bg-[#FFF7E6] px-2 py-0.5 text-[10px] font-bold text-[#B45B00]">Brouillon · {n}</span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-(--color-sand-100) px-2 py-0.5 text-[10px] font-semibold text-(--color-ink-muted)">À créer</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* ── Panneau de composition ── */}
        <section className="space-y-4">
          {!current ? (
            <div className="rounded-2xl border border-dashed border-(--color-border) bg-(--color-surface) p-10 text-center text-sm text-(--color-ink-soft)">
              Sélectionnez une spécialité pour composer son interrogation officielle.
            </div>
          ) : !info ? (
            <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-8 text-center">
              {error
                ? <p className="text-sm text-(--color-danger)">{error}</p>
                : <p className="flex items-center justify-center gap-2 text-sm text-(--color-ink-soft)"><Loader2 className="h-4 w-4 animate-spin" /> Chargement de l&apos;interrogation…</p>}
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="flex items-center gap-2 text-base font-bold text-(--color-ink)">
                      <ClipboardList className="h-5 w-5 text-(--color-primary)" /> Interrogation — {current.nom}
                    </h2>
                    <p className="mt-1 text-sm text-(--color-ink-soft)">
                      {nQcm} QCM · {nQroc} question{nQroc > 1 ? 's' : ''} ouverte{nQroc > 1 ? 's' : ''}
                      {!conforme && questions.length > 0 && (
                        <span className="ml-2 font-semibold text-[#B45B00]">— format cible : 15 QCM + 2 questions ouvertes</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {info.status === 'published' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#E7F6EC] px-2.5 py-1 text-xs font-bold text-[#16793C]">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Publiée
                      </span>
                    ) : (
                      <span className="rounded-full bg-[#FFF7E6] px-2.5 py-1 text-xs font-bold text-[#B45B00]">Brouillon</span>
                    )}
                    <Button
                      size="sm"
                      onClick={togglePublish}
                      disabled={pending || (info.status !== 'published' && questions.length === 0)}
                      className={info.status === 'published' ? '' : 'bg-[#16793C] text-white hover:bg-[#0F5A2C]'}
                      variant={info.status === 'published' ? 'outline' : 'primary'}
                    >
                      {info.status === 'published' ? 'Dépublier' : 'Publier'}
                    </Button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {questions.length === 0 && (
                    <Button variant="outline" size="sm" onClick={seed} disabled={pending}>
                      <Wand2 className="h-4 w-4" /> Pré-remplir depuis la banque (15 QCM + 2 ouvertes)
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => setCreatingFormat('qcm')}><Plus className="h-4 w-4" /> QCM</Button>
                  <Button variant="outline" size="sm" onClick={() => setCreatingFormat('qroc')}><Plus className="h-4 w-4" /> Question ouverte</Button>
                  <Button
                    variant="outline" size="sm" onClick={() => setAiOpen(true)}
                    className="border-[#8B5CF6]/40 text-[#6D28D9] hover:bg-[#F3EAFF]"
                  >
                    <Sparkles className="h-4 w-4" /> Générer par IA
                  </Button>
                  <label className="ml-auto flex items-center gap-2 text-sm">
                    <span className="text-(--color-ink-soft)">Correction des questions ouvertes :</span>
                    <select
                      value={info.qroc_mode}
                      onChange={(e) => changeMode(e.target.value as 'self' | 'ai')}
                      className="rounded-lg border border-(--color-border) bg-(--color-surface) px-2 py-1 text-sm"
                    >
                      <option value="self">Auto-évaluation</option>
                      <option value="ai">Correction par IA</option>
                    </select>
                  </label>
                  {pending && <Loader2 className="h-4 w-4 animate-spin text-(--color-ink-muted)" />}
                </div>
                {error && <p className="mt-3 text-sm text-(--color-danger)">{error}</p>}
              </div>

              <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5">
                {questions.length === 0 ? (
                  <p className="py-8 text-center text-sm text-(--color-ink-soft)">
                    Aucune question. Pré-remplissez depuis la banque du collège, ajoutez-les à la main
                    ou générez-les par IA — puis relisez et publiez.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {questions.map((q, i) => (
                      <li key={q.id} className="flex items-start gap-3 rounded-xl border border-(--color-border) px-3 py-2.5">
                        <span className="mt-0.5 shrink-0 rounded-md bg-(--color-surface-soft) px-2 py-0.5 text-[11px] font-bold text-(--color-ink-soft)">
                          {i + 1} · {q.format === 'qroc' ? 'Ouverte' : 'QCM'}{q.vignette ? ' · Cas clinique' : ''}
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
              </div>

              {(editing || creatingFormat) && (
                <ExamQuestionDialog
                  examId={info.id}
                  colleges={collegeOptions}
                  initial={editing}
                  format={editing?.format ?? creatingFormat ?? 'qcm'}
                  qrocMode={info.qroc_mode}
                  onClose={() => { setEditing(null); setCreatingFormat(null); if (selected) load(selected); router.refresh(); }}
                />
              )}
              {aiOpen && (
                <ExamAiGenerateDialog
                  examId={info.id}
                  colleges={collegeOptions}
                  qrocMode={info.qroc_mode}
                  scope="interrogation"
                  onClose={() => { setAiOpen(false); if (selected) load(selected); router.refresh(); }}
                />
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ClipboardList, Download, Loader2, PenLine, Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { updateExam, deleteExamQuestion } from '@/app/admin/epreuves-blanches/actions';
import { DEFAULT_DISCORDANCE_TABLE } from '@/lib/exams/scoring';
import { ExamQuestionDialog } from './exam-question-dialog';
import { ContentPickerDialog } from './content-picker-dialog';

export type CollegeOption = { id: string; nom: string; parentId: string | null };
export type ExamKeyword = { label: string; points: number; mandatory?: boolean };
export type ExamQuestionData = {
  id: string; order_index: number; format: 'qcm' | 'qroc'; enonce: string;
  vignette: string | null; correction_generale: string | null; points: number;
  college_id: string | null; items: { lettre: string; enonce: string; is_correct: boolean; justification?: string }[];
  reponse_attendue: string | null;
  keywords?: ExamKeyword[]; zero_if_missing?: string[]; major_errors?: string[]; corrige_complet?: string | null;
};
export type ExamData = {
  id: string; title: string; college_id: string | null; duration_minutes: number | null; instructions: string;
  qcm_bareme_mode: 'classic' | 'custom' | 'discordance'; discordance_table: { d: number; p: number }[];
  qroc_mode: 'self' | 'ai'; question_order: 'fixed' | 'random';
  min_offer: string | null; target_colleges: string[]; voies: string[]; target_promos: string[];
};

const inputCls = 'w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-ink) outline-none transition-colors focus:border-(--color-primary)';

export function ExamEditor({ exam, questions, colleges, promos }: { exam: ExamData; questions: ExamQuestionData[]; colleges: CollegeOption[]; promos: string[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const [title, setTitle] = useState(exam.title);
  const [collegeId, setCollegeId] = useState(exam.college_id ?? '');
  const [duration, setDuration] = useState<string>(exam.duration_minutes?.toString() ?? '');
  const [instructions, setInstructions] = useState(exam.instructions ?? '');
  const [bareme, setBareme] = useState(exam.qcm_bareme_mode);
  const [discTable, setDiscTable] = useState<{ d: number; p: number }[]>(
    exam.discordance_table?.length ? exam.discordance_table : DEFAULT_DISCORDANCE_TABLE,
  );
  const [qrocMode, setQrocMode] = useState(exam.qroc_mode);
  const [order, setOrder] = useState(exam.question_order);
  const [minOffer, setMinOffer] = useState(exam.min_offer ?? '');
  const [voies, setVoies] = useState<Set<string>>(new Set(exam.voies ?? []));
  const [targetColleges, setTargetColleges] = useState<Set<string>>(new Set(exam.target_colleges ?? []));
  const [targetPromos, setTargetPromos] = useState<Set<string>>(new Set(exam.target_promos ?? []));

  // Dialogs
  const [editing, setEditing] = useState<ExamQuestionData | null>(null);
  const [creatingFormat, setCreatingFormat] = useState<'qcm' | 'qroc' | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const topColleges = colleges.filter((c) => !c.parentId);
  const mgSubs = colleges.filter((c) => c.parentId === 'col-medecine-generale');
  const collegeName = new Map(colleges.map((c) => [c.id, c.nom]));

  const toggle = (set: React.Dispatch<React.SetStateAction<Set<string>>>, v: string) =>
    set((prev) => { const n = new Set(prev); if (n.has(v)) n.delete(v); else n.add(v); return n; });

  const save = () => {
    setMsg(null);
    start(async () => {
      const res = await updateExam(exam.id, {
        title: title.trim(),
        college_id: collegeId || null,
        duration_minutes: duration ? Number(duration) : null,
        instructions,
        qcm_bareme_mode: bareme,
        discordance_table: bareme === 'discordance' ? discTable : [],
        qroc_mode: qrocMode,
        question_order: order,
        min_offer: minOffer || null,
        target_colleges: Array.from(targetColleges),
        voies: Array.from(voies),
        target_promos: Array.from(targetPromos),
      });
      setMsg(res.ok ? 'Enregistré ✓' : (res.error ?? 'Erreur'));
      if (res.ok) router.refresh();
    });
  };

  const removeQuestion = (qid: string) =>
    start(async () => { await deleteExamQuestion(exam.id, qid); router.refresh(); });

  return (
    <div className="space-y-6">
      {/* ── Réglages ── */}
      <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5">
        <h2 className="mb-4 text-base font-bold text-(--color-ink)">Réglages de l’épreuve</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Titre" className="sm:col-span-2">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="Épreuve blanche de Cardiologie" />
          </Field>
          <Field label="Spécialité (thème)">
            <select value={collegeId} onChange={(e) => setCollegeId(e.target.value)} className={inputCls}>
              <option value="">— Aucune —</option>
              {topColleges.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </Field>
          <Field label="Durée (minutes) — vide = sans limite">
            <input type="number" min={1} value={duration} onChange={(e) => setDuration(e.target.value)} className={inputCls} placeholder="60" />
          </Field>
          <Field label="Consignes" className="sm:col-span-2">
            <textarea rows={2} value={instructions} onChange={(e) => setInstructions(e.target.value)} className={inputCls} placeholder="Instructions affichées avant le début de l’épreuve…" />
          </Field>
          <Field label="Ordre des questions">
            <select value={order} onChange={(e) => setOrder(e.target.value as 'fixed' | 'random')} className={inputCls}>
              <option value="fixed">Fixe</option>
              <option value="random">Aléatoire</option>
            </select>
          </Field>
          <Field label="Correction QROC">
            <select value={qrocMode} onChange={(e) => setQrocMode(e.target.value as 'self' | 'ai')} className={inputCls}>
              <option value="self">Auto-évaluation par le candidat</option>
              <option value="ai">Correction par IA (Phase 2)</option>
            </select>
          </Field>
        </div>

        {/* Barème */}
        <div className="mt-4 rounded-xl border border-dashed border-(--color-border) bg-(--color-sand-100)/40 p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-(--color-ink-muted)">Barème des QCM</p>
          <div className="flex flex-wrap gap-2">
            {([
              { v: 'classic', l: 'Classique (+1 / 0)' },
              { v: 'custom', l: 'Points par question' },
              { v: 'discordance', l: 'Par discordances' },
            ] as const).map((o) => (
              <label key={o.v} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm ${bareme === o.v ? 'border-(--color-primary) bg-(--color-primary-soft)' : 'border-(--color-border)'}`}>
                <input type="radio" name="bareme" checked={bareme === o.v} onChange={() => setBareme(o.v)} className="accent-(--color-primary)" />
                {o.l}
              </label>
            ))}
          </div>
          {bareme === 'custom' && (
            <p className="mt-2 text-xs text-(--color-ink-soft)">Définissez les points de chaque question dans son éditeur.</p>
          )}
          {bareme === 'discordance' && (
            <div className="mt-3">
              <p className="mb-1.5 text-xs font-semibold text-(--color-ink)">Table de discordances (jusqu’à N discordances → points)</p>
              <div className="space-y-1.5">
                {discTable.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="text-(--color-ink-soft)">≤</span>
                    <input type="number" min={0} value={t.d} onChange={(e) => setDiscTable((p) => p.map((x, j) => j === i ? { ...x, d: Number(e.target.value) } : x))} className="w-16 rounded-md border border-(--color-border) px-2 py-1" />
                    <span className="text-(--color-ink-soft)">discordance(s) →</span>
                    <input type="number" min={0} value={t.p} onChange={(e) => setDiscTable((p) => p.map((x, j) => j === i ? { ...x, p: Number(e.target.value) } : x))} className="w-16 rounded-md border border-(--color-border) px-2 py-1" />
                    <span className="text-(--color-ink-soft)">pts</span>
                    <button type="button" onClick={() => setDiscTable((p) => p.filter((_, j) => j !== i))} className="text-(--color-danger)"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setDiscTable((p) => [...p, { d: (p.at(-1)?.d ?? -1) + 1, p: 0 }])} className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold text-(--color-primary)">
                <Plus className="h-3.5 w-3.5" /> Ajouter un palier
              </button>
            </div>
          )}
        </div>

        {/* Ciblage */}
        <div className="mt-4 rounded-xl border border-dashed border-(--color-border) bg-(--color-primary-soft)/10 p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-(--color-ink-muted)">Qui peut composer ?</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Offre minimale">
              <select value={minOffer} onChange={(e) => setMinOffer(e.target.value)} className={inputCls}>
                <option value="">Toutes les offres</option>
                <option value="essentiel">Essentielle ou +</option>
                <option value="intensif">Intensive ou +</option>
                <option value="approfondi">Approfondi uniquement</option>
              </select>
            </Field>
            <Field label="Voie de concours (vide = toutes)">
              <div className="flex gap-2">
                {['interne', 'externe'].map((v) => (
                  <label key={v} className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-2 text-sm ${voies.has(v) ? 'border-(--color-primary) bg-(--color-primary-soft)' : 'border-(--color-border)'}`}>
                    <input type="checkbox" checked={voies.has(v)} onChange={() => toggle(setVoies, v)} /> {v}
                  </label>
                ))}
              </div>
            </Field>
          </div>
          <div className="mt-3">
            <p className="mb-1.5 text-xs font-semibold text-(--color-ink)">Promotions ciblées (vide = toutes)</p>
            <div className="flex flex-wrap gap-1.5">
              {promos.map((p) => (
                <label key={p} className={`flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs ${targetPromos.has(p) ? 'border-(--color-primary) bg-(--color-primary-soft)' : 'border-(--color-border)'}`}>
                  <input type="checkbox" checked={targetPromos.has(p)} onChange={() => toggle(setTargetPromos, p)} /> {p}
                </label>
              ))}
            </div>
          </div>
          <div className="mt-3">
            <p className="mb-1.5 text-xs font-semibold text-(--color-ink)">Collèges ciblés (vide = tous les accessibles)</p>
            <div className="grid max-h-40 grid-cols-1 gap-1 overflow-y-auto rounded-lg border border-(--color-border) p-2 sm:grid-cols-2">
              {[...topColleges, ...mgSubs].map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-[13px]">
                  <input type="checkbox" checked={targetColleges.has(c.id)} onChange={() => toggle(setTargetColleges, c.id)} />
                  <span className="truncate">{c.nom}{c.parentId ? ' (MG)' : ''}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Button onClick={save} disabled={pending}>{pending ? <Loader2 className="animate-spin" /> : <Save />} Enregistrer les réglages</Button>
          {msg && <span className="text-sm font-medium text-(--color-ink-soft)">{msg}</span>}
        </div>
      </section>

      {/* ── Questions ── */}
      <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold text-(--color-ink)">Questions ({questions.length})</h2>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setCreatingFormat('qcm')}><Plus className="h-4 w-4" /> QCM</Button>
            <Button variant="outline" size="sm" onClick={() => setCreatingFormat('qroc')}><Plus className="h-4 w-4" /> QROC</Button>
            <Button variant="outline" size="sm" onClick={() => setPickerOpen(true)}><Download className="h-4 w-4" /> Piocher dans le contenu</Button>
          </div>
        </div>
        {questions.length === 0 ? (
          <p className="py-6 text-center text-sm text-(--color-ink-soft)">Aucune question. Ajoutez-en ou importez depuis le contenu existant.</p>
        ) : (
          <ul className="space-y-2">
            {questions.map((q, i) => (
              <li key={q.id} className="flex items-start gap-3 rounded-xl border border-(--color-border) p-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-(--color-sand-100) text-[11px] font-bold text-(--color-ink-soft)">{i + 1}</span>
                <span className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${q.format === 'qroc' ? 'bg-[#E0F2F1] text-[#00695C]' : 'bg-(--color-primary-soft) text-(--color-primary)'}`}>{q.format}</span>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm text-(--color-ink)" dangerouslySetInnerHTML={{ __html: q.enonce || '<em>(énoncé vide)</em>' }} />
                  <p className="mt-0.5 text-[11px] text-(--color-ink-muted)">
                    {q.college_id ? (collegeName.get(q.college_id) ?? q.college_id) + ' · ' : ''}{q.points} pt{q.points > 1 ? 's' : ''}
                    {q.format === 'qcm' ? ` · ${q.items.length} propositions` : ''}
                  </p>
                </div>
                <button type="button" onClick={() => setEditing(q)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-(--color-ink-soft) hover:bg-(--color-sand-100)"><PenLine className="h-4 w-4" /></button>
                <button type="button" onClick={() => { if (confirm('Supprimer cette question ?')) removeQuestion(q.id); }} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-(--color-ink-soft) hover:text-(--color-danger)"><Trash2 className="h-4 w-4" /></button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {(editing || creatingFormat) && (
        <ExamQuestionDialog
          examId={exam.id}
          colleges={colleges}
          initial={editing}
          format={editing?.format ?? creatingFormat ?? 'qcm'}
          qrocMode={qrocMode}
          onClose={() => { setEditing(null); setCreatingFormat(null); router.refresh(); }}
        />
      )}
      {pickerOpen && (
        <ContentPickerDialog examId={exam.id} colleges={colleges} onClose={() => { setPickerOpen(false); router.refresh(); }} />
      )}
    </div>
  );
}

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-semibold text-(--color-ink)">{label}</span>
      {children}
    </label>
  );
}

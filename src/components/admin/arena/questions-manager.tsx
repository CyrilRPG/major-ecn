'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowDown, ArrowUp, Ban, Download, ExternalLink, FileUp, Library, Lock, PenLine, Pencil, Plus, RotateCcw, Search, Shuffle, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  deleteQuestion, importFromBank, importQuestions, importSerieFromBank, listArenaBankColleges, listPublishedAiImports, neutralizeQuestion, reorderQuestions, restoreQuestion, saveQuestion,
  type AiImportSerie, type ArenaBankCollege, type QuestionInput,
} from '@/app/admin/arena/questions-actions';
import { listContentQuestions, listContentTree, type ContentTree, type PickerQuestion } from '@/app/admin/epreuves-blanches/actions';
import { importTemplateCsv } from '@/lib/arena/import';
import type { QType } from '@/lib/arena/scoring';
import { LETTERS, questionIssues, type QuestionRow, type RoundRow } from '@/lib/arena/types';
import { ADMIN_ARENA, ADMIN_DISPLAY, ArenaCard, ArenaProgress, GoldBadge, SectionLabel, StatusPill } from './admin-ui';

/**
 * Questions d'une manche (§20).
 *
 * Trois sources, présentées en cartes d'option : la banque de QCM de la
 * plateforme (cascade collège → sous-collège → item → série, pioche au
 * hasard), la saisie manuelle (formulaire complet), l'outil d'import par IA
 * (inchangé, appelé avec `?arena=<manche>` ; ses séries publiées se copient
 * ici). L'import CSV/tableur reste disponible en lien discret.
 *
 * Règle métier : une manche qui a des tentatives réelles n'accepte plus ni
 * ajout ni modification — neutralisation seulement (§10).
 */
type Source = 'bank' | 'manual' | 'ai' | 'csv';

export function QuestionsManager({ round, questions, expected, started, specialtyId, defaultSeconds, aiSourceIds = [] }: {
  round: RoundRow; questions: QuestionRow[]; expected: number; started: boolean; specialtyId: string | null;
  /** Durée par défaut d'une question, réglée sur le tournoi. */
  defaultSeconds: number;
  /** Identifiants `qcm_questions` provenant d'une série publiée par l'import IA (pour l'étiquette de provenance). */
  aiSourceIds?: string[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<QuestionInput | null>(null);
  const [panel, setPanel] = useState<Source | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const blank = (): QuestionInput => ({
    round_id: round.id, type: 'QRM', expected_count: null, weight: 1, duration_seconds: null, enonce: '', vignette: '', images: [],
    items: Array.from({ length: 5 }, () => ({ enonce: '', is_correct: false, indispensable: false, inacceptable: false, justification: '' })),
    explanation: '', pieges: '', erreurs_frequentes: '', references_text: '',
  });
  const toInput = (q: QuestionRow): QuestionInput => ({
    id: q.id, round_id: q.round_id, type: q.type, expected_count: q.expected_count, weight: q.weight, duration_seconds: q.duration_seconds,
    enonce: q.enonce, vignette: q.vignette ?? '', images: q.images,
    items: q.items.map((i) => ({ enonce: i.enonce, is_correct: i.is_correct, indispensable: i.indispensable, inacceptable: i.inacceptable, justification: i.justification })),
    explanation: q.explanation, pieges: q.pieges, erreurs_frequentes: q.erreurs_frequentes, references_text: q.references_text,
  });

  const move = (i: number, dir: -1 | 1) => {
    const ids = questions.map((q) => q.id);
    const j = i + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    start(async () => { const r = await reorderQuestions(round.id, ids); if (!r.ok) setError(r.error); router.refresh(); });
  };

  const active = questions.filter((q) => !q.neutralized_at).length;
  const remaining = Math.max(0, expected - active);
  const complete = active === expected;
  const existingSources = useMemo(() => new Set(questions.map((q) => q.source_question_id).filter((x): x is string => Boolean(x))), [questions]);
  const aiSet = useMemo(() => new Set(aiSourceIds), [aiSourceIds]);

  const choose = (s: Source) => {
    setError(null); setInfo(null);
    if (s === 'manual') { setEditing(blank()); setPanel('manual'); return; }
    setEditing(null);
    setPanel(panel === s ? null : s);
  };
  const done = (m: string) => { setInfo(m); setError(null); setPanel(null); router.refresh(); };

  return (
    <ArenaCard
      number={`M${round.number}`}
      title={<>Manche {round.number}{round.theme ? <span className="text-(--color-ink-soft)"> · {round.theme}</span> : null}</>}
      description={started ? <span className="inline-flex items-center gap-1 font-semibold text-(--color-danger)"><Lock className="h-3 w-3" /> Manche démarrée : questions figées, neutralisation seulement.</span> : complete ? 'Effectif complet. Vérifiez les corrigés avant la publication.' : `${remaining} question${remaining > 1 ? 's' : ''} à ajouter pour atteindre ${expected}.`}
      tone={started ? 'locked' : 'default'}
      aside={
        <div className="w-52">
          <p className="text-right text-2xl leading-none tabular-nums text-(--color-ink)" style={{ fontFamily: ADMIN_DISPLAY, fontWeight: 600 }}>
            <span style={{ color: complete ? ADMIN_ARENA.ok : active > expected ? ADMIN_ARENA.red : undefined }}>{active}</span>
            <span className="text-(--color-ink-muted)"> / {expected}</span>
            <span className="ml-1.5 text-xs font-semibold tracking-[0.12em] text-(--color-ink-muted)">QUESTIONS</span>
          </p>
          <ArenaProgress value={active} max={expected} className="mt-2" />
        </div>
      }
    >
      {!started && (
        <>
          <SectionLabel hint={remaining > 0 ? `${remaining} restante${remaining > 1 ? 's' : ''}` : 'complet'}>Source des questions</SectionLabel>
          <div className="grid gap-3 md:grid-cols-3">
            <OptionCard active={panel === 'bank'} icon={<Library className="h-5 w-5" />} title="Piocher dans la banque" text="Collège, sous-collège, item, série : cochez ou tirez au hasard parmi les QCM de la plateforme." onClick={() => choose('bank')} />
            <OptionCard active={panel === 'manual'} icon={<PenLine className="h-5 w-5" />} title="Créer à la main" text="QRM, QRU ou QRP, propositions A à K, règles indispensable / inacceptable, corrections." onClick={() => choose('manual')} />
            <OptionCard active={panel === 'ai'} icon={<Sparkles className="h-5 w-5" />} title="Importer par IA" text="Un PDF, un Word ou un texte analysé et vérifié par l'outil d'import ; la série publiée se copie ici." onClick={() => choose('ai')} />
          </div>
          <div className="mt-2 flex justify-end">
            <button type="button" onClick={() => choose('csv')} className={`inline-flex items-center gap-1 text-xs underline-offset-4 hover:underline ${panel === 'csv' ? 'font-semibold text-(--color-ink)' : 'text-(--color-ink-muted)'}`}>
              <FileUp className="h-3.5 w-3.5" /> Importer un fichier CSV / tableur
            </button>
          </div>
        </>
      )}

      {error && <p className="mt-3 rounded-(--radius-button) border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-(--color-danger)">{error}</p>}
      {info && <p className="mt-3 rounded-(--radius-button) border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">{info}</p>}

      {!started && panel === 'bank' && <BankPanel roundId={round.id} specialtyId={specialtyId} remaining={remaining} existingSources={existingSources} onDone={done} onError={setError} />}
      {!started && panel === 'ai' && <AiPanel roundId={round.id} onDone={done} onError={setError} />}
      {!started && panel === 'csv' && <ImportPanel roundId={round.id} onDone={done} onError={setError} />}

      {!started && editing && (
        <QuestionForm
          value={editing}
          defaultSeconds={defaultSeconds}
          onCancel={() => { setEditing(null); if (panel === 'manual') setPanel(null); }}
          onSaved={(issues) => { setEditing(null); setPanel(null); setInfo(issues.length ? `Enregistrée avec avertissements : ${issues.join(' ')}` : 'Question enregistrée.'); router.refresh(); }}
          onError={setError}
        />
      )}

      <SectionLabel hint={questions.length ? `${questions.length} ligne${questions.length > 1 ? 's' : ''}${questions.length !== active ? ` · ${questions.length - active} neutralisée${questions.length - active > 1 ? 's' : ''}` : ''}` : undefined}>Questions de la manche</SectionLabel>
      <ol className="divide-y divide-(--color-border) overflow-hidden rounded-(--radius-button) border border-(--color-border)">
        {questions.length === 0 && <li className="bg-(--color-surface-soft) py-8 text-center text-sm text-(--color-ink-soft)">Aucune question pour l&rsquo;instant. Choisissez une source ci-dessus.</li>}
        {questions.map((q, i) => {
          const issues = questionIssues(q);
          const answer = q.items.filter((x) => x.is_correct).map((x) => x.lettre).join('') || '—';
          const source = q.source_question_id ? (aiSet.has(q.source_question_id) ? 'IA' : 'banque') : 'saisie';
          return (
            <li key={q.id} className={`flex items-start gap-3 px-3 py-3 transition-colors hover:bg-(--color-surface-soft) ${q.neutralized_at ? 'opacity-60' : ''}`}>
              <GoldBadge tone={q.neutralized_at ? 'muted' : issues.length ? 'red' : 'gold'} className="mt-0.5">{i + 1}</GoldBadge>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-md px-1.5 py-0.5 text-[11px] font-bold tracking-[0.06em]" style={{ background: 'var(--color-surface-sunken)', fontFamily: ADMIN_DISPLAY }}>{q.type}{q.type === 'QRP' ? ` n=${q.expected_count ?? q.items.filter((x) => x.is_correct).length}` : ''}</span>
                  <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-bold text-emerald-700">Réponse {answer}</span>
                  <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${source === 'IA' ? 'bg-violet-50 text-violet-700' : source === 'banque' ? 'bg-blue-50 text-blue-700' : 'bg-(--color-surface-sunken) text-(--color-ink-soft)'}`}>{source}</span>
                  <span className="text-[11px] text-(--color-ink-muted)">{q.items.length} propositions · {q.duration_seconds ?? defaultSeconds} s{q.duration_seconds ? '' : ' (tournoi)'}{q.weight !== 1 ? ` · coef ${q.weight}` : ''}</span>
                  {q.items.some((x) => x.indispensable) && <span className="text-[11px] text-(--color-ink-muted)">· indispensable {q.items.filter((x) => x.indispensable).map((x) => x.lettre).join('')}</span>}
                  {q.items.some((x) => x.inacceptable) && <span className="text-[11px] text-(--color-ink-muted)">· inacceptable {q.items.filter((x) => x.inacceptable).map((x) => x.lettre).join('')}</span>}
                  {q.neutralized_at && <StatusPill tone="red">Neutralisée{q.neutralized_reason ? ` · ${q.neutralized_reason}` : ''}</StatusPill>}
                </div>
                <p className="mt-1 text-sm font-medium text-(--color-ink)">{q.enonce.slice(0, 180)}{q.enonce.length > 180 ? '…' : ''}</p>
                {issues.length > 0 && !q.neutralized_at && <p className="mt-0.5 text-xs font-semibold text-(--color-danger)">{issues.join(' ')}</p>}
                {!q.explanation && !q.neutralized_at && <p className="mt-0.5 text-xs text-amber-700">Explication détaillée manquante (corrections §12).</p>}
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                {!started && <>
                  <Button variant="ghost" size="sm" disabled={pending || i === 0} onClick={() => move(i, -1)} title="Monter"><ArrowUp className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" disabled={pending || i === questions.length - 1} onClick={() => move(i, 1)} title="Descendre"><ArrowDown className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => { setEditing(toInput(q)); setPanel('manual'); setError(null); setInfo(null); }} title="Modifier"><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" disabled={pending} onClick={() => { if (confirm('Supprimer cette question ?')) start(async () => { const r = await deleteQuestion(q.id); if (!r.ok) setError(r.error); router.refresh(); }); }} title="Supprimer"><Trash2 className="h-4 w-4" /></Button>
                </>}
                {started && !q.neutralized_at && (
                  <Button variant="ghost" size="sm" disabled={pending} title="Neutraliser" onClick={() => { const reason = prompt('Motif de neutralisation (communiqué aux participants) :'); if (reason === null) return; start(async () => { const r = await neutralizeQuestion(q.id, reason); if (r.ok) setInfo(`Question neutralisée : ${r.recomputed} tentative(s) recalculée(s), ${r.notified} participant(s) informé(s).`); else setError(r.error); router.refresh(); }); }}><Ban className="h-4 w-4" /></Button>
                )}
                {q.neutralized_at && (
                  <Button variant="ghost" size="sm" disabled={pending} title="Rétablir" onClick={() => start(async () => { const r = await restoreQuestion(q.id); if (!r.ok) setError(r.error); router.refresh(); })}><RotateCcw className="h-4 w-4" /></Button>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </ArenaCard>
  );
}

/* ------------------------------------------------------------------ */

function OptionCard({ active, icon, title, text, onClick }: { active: boolean; icon: React.ReactNode; title: string; text: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group flex items-start gap-3 rounded-(--radius-card) border p-4 text-left transition-all ${active ? 'border-transparent bg-(--color-surface)' : 'border-(--color-border) bg-(--color-surface-soft) hover:border-(--color-border-strong) hover:bg-(--color-surface)'}`}
      style={active ? { boxShadow: `0 0 0 2px ${ADMIN_ARENA.gold}, 0 12px 32px -16px rgba(212,169,74,0.55)` } : undefined}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={active ? { background: 'linear-gradient(180deg, #E8C878 0%, #D4A94A 55%, #B8892E 100%)', color: '#1A1205' } : { background: 'var(--color-surface-sunken)', color: 'var(--color-ink-soft)' }}>{icon}</span>
      <span className="min-w-0">
        <span className="block text-[15px] uppercase leading-tight text-(--color-ink)" style={{ fontFamily: ADMIN_DISPLAY, fontWeight: 600, letterSpacing: '0.05em' }}>{title}</span>
        <span className="mt-1 block text-xs leading-relaxed text-(--color-ink-soft)">{text}</span>
      </span>
    </button>
  );
}

function Panel({ title, hint, children, onClose }: { title: string; hint?: string; children: React.ReactNode; onClose?: () => void }) {
  return (
    <div className="mt-4 rounded-(--radius-card) border border-(--color-border-strong) bg-(--color-surface-soft) p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-base uppercase leading-tight text-(--color-ink)" style={{ fontFamily: ADMIN_DISPLAY, fontWeight: 600, letterSpacing: '0.05em' }}>{title}</p>
          {hint && <p className="mt-0.5 text-xs text-(--color-ink-soft)">{hint}</p>}
        </div>
        {onClose && <Button variant="ghost" size="sm" onClick={onClose}>Fermer</Button>}
      </div>
      {children}
    </div>
  );
}

const selectClass = 'h-10 w-full rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) px-3 text-sm text-(--color-ink) disabled:opacity-50';

/* ------------------------------------------------------------------ */

function QuestionForm({ value, defaultSeconds, onCancel, onSaved, onError }: { value: QuestionInput; defaultSeconds: number; onCancel: () => void; onSaved: (issues: string[]) => void; onError: (e: string) => void }) {
  const [q, setQ] = useState<QuestionInput>(value);
  const [pending, start] = useTransition();
  const set = <K extends keyof QuestionInput>(k: K, v: QuestionInput[K]) => setQ((x) => ({ ...x, [k]: v }));
  const items = q.items ?? [];
  const setItem = (i: number, patch: Partial<QuestionInput['items'][number]>) => set('items', items.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  const nExact = items.filter((i) => i.is_correct).length;
  return (
    <Panel title={q.id ? 'Modifier la question' : 'Créer une question à la main'} hint="Le type est vérifié à l'enregistrement : une QRU n'a qu'une exacte, une QRP annonce n réponses." onClose={onCancel}>
      <SectionLabel hint="pondération 1 par défaut ; durée vide = celle du tournoi">Format et chronomètre</SectionLabel>
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="space-y-1"><Label>Type</Label>
          <select value={q.type} onChange={(e) => set('type', e.target.value as QType)} className={selectClass}>
            <option value="QRM">QRM — plusieurs exactes</option><option value="QRU">QRU — une seule exacte</option><option value="QRP">QRP — n réponses annoncées</option>
          </select>
        </div>
        {q.type === 'QRP' && <div className="space-y-1"><Label>n attendu</Label><Input type="number" min={1} max={11} value={q.expected_count ?? ''} onChange={(e) => set('expected_count', e.target.value ? Number(e.target.value) : null)} placeholder={`= ${nExact} exacte(s)`} /></div>}
        <div className="space-y-1"><Label>Pondération</Label><Input type="number" step="0.5" min={0.5} max={10} value={q.weight ?? 1} onChange={(e) => set('weight', Number(e.target.value) || 1)} /></div>
        {/* Chronomètre propre à la question. Vide = durée par défaut du tournoi. */}
        <div className="space-y-1">
          <Label>Durée (s)</Label>
          <Input type="number" min={5} max={3600} value={q.duration_seconds ?? ''} placeholder={`${defaultSeconds} (tournoi)`}
            onChange={(e) => set('duration_seconds', e.target.value ? Number(e.target.value) : null)} />
        </div>
      </div>

      <div className="mt-5"><SectionLabel hint="la vignette s'affiche au-dessus de l'énoncé">Énoncé</SectionLabel></div>
      <div className="grid gap-3">
        <div className="space-y-1"><Label>Vignette clinique (facultatif)</Label><Textarea rows={2} value={q.vignette ?? ''} onChange={(e) => set('vignette', e.target.value)} placeholder="Une patiente de 62 ans consulte pour…" /></div>
        <div className="space-y-1"><Label>Énoncé</Label><Textarea rows={2} value={q.enonce} onChange={(e) => set('enonce', e.target.value)} placeholder="Quelle(s) est (sont) la (les) proposition(s) exacte(s) ?" /></div>
        <div className="space-y-1"><Label>Images (URL publiques, une par ligne)</Label><Textarea rows={1} value={(q.images ?? []).join('\n')} onChange={(e) => set('images', e.target.value.split('\n').map((s) => s.trim()).filter(Boolean))} /></div>
      </div>

      <div className="mt-5"><SectionLabel hint={`${nExact} exacte${nExact > 1 ? 's' : ''} · indispensable / inacceptable facultatifs (§6.9)`}>Propositions</SectionLabel></div>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className={`grid items-start gap-2 rounded-(--radius-button) border p-2 sm:grid-cols-[2.25rem_1fr_auto] ${it.is_correct ? 'border-emerald-200 bg-emerald-50/60' : 'border-(--color-border) bg-(--color-surface)'}`}>
            <GoldBadge tone={it.is_correct ? 'ok' : 'muted'} className="mt-1">{LETTERS[i]}</GoldBadge>
            <div className="space-y-1">
              <Input value={it.enonce} onChange={(e) => setItem(i, { enonce: e.target.value })} placeholder={`Proposition ${LETTERS[i]}`} />
              <Input value={it.justification ?? ''} onChange={(e) => setItem(i, { justification: e.target.value })} placeholder="Justification (affichée dans les corrections)" className="text-xs" />
            </div>
            <div className="flex flex-wrap gap-2 pt-2 text-xs">
              <label className="flex items-center gap-1 font-semibold"><input type="checkbox" checked={Boolean(it.is_correct)} onChange={(e) => setItem(i, { is_correct: e.target.checked })} /> exacte</label>
              <label className="flex items-center gap-1" title="Oubli = 0 à la question"><input type="checkbox" checked={Boolean(it.indispensable)} onChange={(e) => setItem(i, { indispensable: e.target.checked, inacceptable: e.target.checked ? false : it.inacceptable })} /> indisp.</label>
              <label className="flex items-center gap-1" title="Cochée = 0 à la question"><input type="checkbox" checked={Boolean(it.inacceptable)} onChange={(e) => setItem(i, { inacceptable: e.target.checked, indispensable: e.target.checked ? false : it.indispensable })} /> inacc.</label>
              <Button variant="ghost" size="sm" onClick={() => set('items', items.filter((_, j) => j !== i))} disabled={items.length <= 2} title="Retirer">×</Button>
            </div>
          </div>
        ))}
        {items.length < LETTERS.length && <Button variant="ghost" size="sm" onClick={() => set('items', [...items, { enonce: '', is_correct: false, indispensable: false, inacceptable: false, justification: '' }])}><Plus className="h-4 w-4" /> Proposition {LETTERS[items.length]}</Button>}
      </div>

      <details className="mt-5 rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) p-3" open={Boolean(q.explanation)}>
        <summary className="cursor-pointer text-sm font-semibold text-(--color-ink)">Corrections (§12) : explication, pièges, erreurs fréquentes, références</summary>
        <p className="mt-1 text-xs text-(--color-ink-muted)">L&rsquo;explication détaillée est affichée aux participants après la clôture ; sans elle, la question est signalée dans la liste.</p>
        <div className="mt-3 grid gap-3">
          <div className="space-y-1"><Label>Explication détaillée</Label><Textarea rows={3} value={q.explanation ?? ''} onChange={(e) => set('explanation', e.target.value)} /></div>
          <div className="space-y-1"><Label>Pièges de l’énoncé</Label><Textarea rows={2} value={q.pieges ?? ''} onChange={(e) => set('pieges', e.target.value)} /></div>
          <div className="space-y-1"><Label>Erreurs les plus fréquentes (sans effectif)</Label><Textarea rows={2} value={q.erreurs_frequentes ?? ''} onChange={(e) => set('erreurs_frequentes', e.target.value)} /></div>
          <div className="space-y-1"><Label>Références</Label><Input value={q.references_text ?? ''} onChange={(e) => set('references_text', e.target.value)} /></div>
        </div>
      </details>

      <div className="mt-4 flex gap-2">
        <Button disabled={pending} onClick={() => start(async () => { const r = await saveQuestion(q); if (r.ok) onSaved(r.issues); else onError(r.error); })}>{pending ? 'Enregistrement…' : 'Enregistrer la question'}</Button>
        <Button variant="ghost" onClick={onCancel}>Annuler</Button>
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */

function ImportPanel({ roundId, onDone, onError }: { roundId: string; onDone: (m: string) => void; onError: (e: string) => void }) {
  const [rows, setRows] = useState<Record<string, unknown>[] | null>(null);
  const [fileName, setFileName] = useState('');
  const [replace, setReplace] = useState(false);
  const [rejected, setRejected] = useState<{ line: number; reason: string }[]>([]);
  const [pending, start] = useTransition();

  const parseFile = async (file: File) => {
    setFileName(file.name);
    setRejected([]);
    try {
      if (/\.(xlsx|xls)$/i.test(file.name)) {
        const XLSX = await import('xlsx');
        const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        setRows(XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' }));
      } else {
        const Papa = (await import('papaparse')).default;
        const text = await file.text();
        const res = Papa.parse<Record<string, unknown>>(text.replace(/^﻿/, ''), { header: true, skipEmptyLines: true, delimiter: '' });
        setRows(res.data);
      }
    } catch (e) {
      onError(`Lecture impossible : ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const template = () => {
    const blob = new Blob([importTemplateCsv()], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'modele-questions-evc-arena.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Panel title="Importer un fichier CSV / tableur" hint="Le fichier est lu dans le navigateur ; les lignes invalides sont rejetées avec leur motif, les autres importées.">
      <div className="flex flex-wrap items-center gap-3">
        <input type="file" accept=".csv,.xlsx,.xls,text/csv" onChange={(e) => { const f = e.target.files?.[0]; if (f) parseFile(f); }} className="text-sm" />
        <Button variant="ghost" size="sm" onClick={template}><Download className="mr-1 h-4 w-4" /> Modèle de fichier vierge</Button>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={replace} onChange={(e) => setReplace(e.target.checked)} /> Remplacer les questions existantes</label>
      </div>
      <p className="mt-2 text-xs text-(--color-ink-muted)">Colonnes : type (QRM/QRU/QRP), n, ponderation, vignette, enonce, A…K, reponses (ex. « A, C, D »), indispensables, inacceptables, justification_A…, explication, pieges, erreurs, references. Séparateur « ; » ou « , ».</p>
      {rows && (
        <div className="mt-3 flex items-center gap-3">
          <span className="text-sm">{fileName} : {rows.length} ligne(s) lue(s)</span>
          <Button size="sm" disabled={pending || rows.length === 0} onClick={() => start(async () => { const r = await importQuestions(roundId, rows, replace); if (r.ok) { setRejected(r.rejected); if (r.rejected.length === 0) onDone(`${r.inserted} question(s) importée(s).`); } else onError(r.error); })}>{pending ? 'Import…' : 'Importer'}</Button>
        </div>
      )}
      {rejected.length > 0 && (
        <div className="mt-3 rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          <p className="font-bold">Lignes rejetées ({rejected.length}) — les autres ont été importées :</p>
          <ul className="mt-1 list-disc pl-5">{rejected.map((r) => <li key={r.line}>Ligne {r.line} : {r.reason}</li>)}</ul>
        </div>
      )}
    </Panel>
  );
}

/* ------------------------------------------------------------------ */

const TYPE_LABEL: Record<string, string> = { qcm: 'QCM', dp_qcm: 'DP · QCM', qroc: 'QROC', dp_qroc: 'DP · QROC' };

/**
 * Pioche dans la banque : cascade Collège → Sous-collège (si le collège en
 * a) → Item → Série, recherche plein texte en base, cases à cocher, tirage
 * au hasard de N questions.
 */
function BankPanel({ roundId, specialtyId, remaining, existingSources, onDone, onError }: { roundId: string; specialtyId: string | null; remaining: number; existingSources: Set<string>; onDone: (m: string) => void; onError: (e: string) => void }) {
  const [colleges, setColleges] = useState<ArenaBankCollege[] | null>(null);
  const [collegeId, setCollegeId] = useState('');
  const [subId, setSubId] = useState('');
  const [tree, setTree] = useState<ContentTree['cours']>([]);
  const [coursId, setCoursId] = useState('');
  const [serieId, setSerieId] = useState('');
  const [search, setSearch] = useState('');
  const [list, setList] = useState<PickerQuestion[]>([]);
  const [tronque, setTronque] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [n, setN] = useState(Math.max(1, remaining));
  const [pending, start] = useTransition();

  /* 1. Collèges (une fois), avec présélection sur la spécialité du tournoi. */
  useEffect(() => {
    let alive = true;
    listArenaBankColleges().then((r) => {
      if (!alive) return;
      if (!r.ok) { onError(r.error); return; }
      setColleges(r.colleges);
      const hit = specialtyId ? r.colleges.find((c) => c.id === specialtyId) : null;
      if (hit) { setCollegeId(hit.parentId ?? hit.id); setSubId(hit.parentId ? hit.id : ''); }
    });
    return () => { alive = false; };
  }, [specialtyId, onError]);

  const tops = useMemo(() => (colleges ?? []).filter((c) => !c.parentId), [colleges]);
  const subs = useMemo(() => (colleges ?? []).filter((c) => c.parentId === collegeId), [colleges, collegeId]);
  const matiereId = subId || collegeId;

  /* 2. Items et séries du collège (ou sous-collège) retenu. */
  useEffect(() => {
    if (!matiereId) return;
    let alive = true;
    listContentTree(matiereId).then((t) => {
      if (!alive) return;
      if (t.ok) setTree(t.tree.cours); else onError(t.error);
    });
    return () => { alive = false; };
  }, [matiereId, onError]);

  /* 3. Questions, filtrées EN BASE (plafond 2 000), avec un léger délai sur la saisie. */
  useEffect(() => {
    if (!matiereId) return;
    let alive = true;
    const h = setTimeout(async () => {
      setLoading(true);
      const r = await listContentQuestions({ matiereId, coursId: coursId || null, serieId: serieId || null, types: ['qcm', 'dp_qcm'], search: search || null });
      if (!alive) return;
      setLoading(false);
      if (r.ok) { setList(r.questions); setTronque(r.tronque); setSelected(new Set()); } else onError(r.error);
    }, 300);
    return () => { alive = false; clearTimeout(h); };
  }, [matiereId, coursId, serieId, search, onError]);

  const series = useMemo(() => tree.find((c) => c.id === coursId)?.series ?? [], [tree, coursId]);
  const candidates = useMemo(() => list.filter((q) => !existingSources.has(q.id)), [list, existingSources]);

  const toggle = (id: string, on: boolean) => setSelected((s) => { const next = new Set(s); if (on) next.add(id); else next.delete(id); return next; });
  const pickRandom = () => {
    const pool = [...candidates];
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    setSelected(new Set(pool.slice(0, Math.max(0, n)).map((q) => q.id)));
  };
  const add = () => start(async () => {
    const r = await importFromBank(roundId, [...selected]);
    if (r.ok) onDone(`${r.inserted} question(s) ajoutée(s) à la manche depuis la banque${r.ignored ? ` (${r.ignored} ignorée(s) : QROC ou propositions invalides)` : ''}. Type déduit (QRU si une seule exacte, sinon QRM) ; à compléter si besoin : corrections, règles, QRP.`);
    else onError(r.error);
  });

  const resetBelow = (level: 'college' | 'sub' | 'cours') => {
    if (level === 'college') setSubId('');
    if (level !== 'cours') { setCoursId(''); }
    setSerieId(''); setTree(level === 'cours' ? tree : []); setList([]); setSelected(new Set());
  };

  return (
    <Panel title="Piocher dans la banque" hint="Les QCM de la plateforme (QROC exclues). La copie est figée : modifier la question dans la banque ne change pas la manche.">
      <div className={`grid gap-3 ${subs.length ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
        <div className="space-y-1">
          <Label>Collège</Label>
          <select value={collegeId} onChange={(e) => { setCollegeId(e.target.value); resetBelow('college'); }} className={selectClass} disabled={!colleges}>
            <option value="">{colleges ? 'Sélectionner un collège' : 'Chargement…'}</option>
            {tops.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
        </div>
        {subs.length > 0 && (
          <div className="space-y-1">
            <Label>Sous-collège</Label>
            <select value={subId} onChange={(e) => { setSubId(e.target.value); resetBelow('sub'); }} className={selectClass}>
              <option value="">{tops.find((c) => c.id === collegeId)?.nCours ? 'Tronc commun du collège' : 'Sélectionner un sous-collège'}</option>
              {subs.map((c) => <option key={c.id} value={c.id}>{c.nom}{c.nCours ? ` (${c.nCours})` : ''}</option>)}
            </select>
          </div>
        )}
        <div className="space-y-1">
          <Label>Item</Label>
          <select value={coursId} onChange={(e) => { setCoursId(e.target.value); resetBelow('cours'); }} className={selectClass} disabled={!matiereId}>
            <option value="">Tous les items{tree.length ? ` (${tree.length})` : ''}</option>
            {tree.map((c) => <option key={c.id} value={c.id}>{c.titre}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <Label>Série <span className="font-normal text-(--color-ink-muted)">(facultatif)</span></Label>
          <select value={serieId} onChange={(e) => { setSerieId(e.target.value); setSelected(new Set()); }} className={selectClass} disabled={!coursId}>
            <option value="">Toutes les séries{series.length ? ` (${series.length})` : ''}</option>
            {series.map((s) => <option key={s.id} value={s.id}>{s.label}{s.is_dp ? ' · DP' : ''}</option>)}
          </select>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <div className="min-w-56 flex-1 space-y-1">
          <Label>Recherche dans l&rsquo;énoncé</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-3 left-3 h-4 w-4 text-(--color-ink-muted)" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="mot-clé…" className="pl-9" disabled={!matiereId} />
          </div>
        </div>
        <div className="flex items-end gap-2">
          <div className="space-y-1">
            <Label>Au hasard</Label>
            <Input type="number" min={1} max={200} value={n} onChange={(e) => setN(Math.max(1, Number(e.target.value) || 1))} className="w-20" />
          </div>
          <Button variant="outline" size="md" disabled={candidates.length === 0} onClick={pickRandom} title="Coche N questions au hasard parmi la liste (hors celles déjà dans la manche)"><Shuffle className="h-4 w-4" /> Piocher {n} au hasard</Button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-(--color-ink-soft)">
        <span>
          {loading ? 'Chargement…' : matiereId ? `${list.length} question(s)${candidates.length !== list.length ? ` · ${list.length - candidates.length} déjà dans la manche` : ''}` : 'Choisissez un collège pour afficher ses QCM.'}
          {tronque && <span className="ml-2 font-semibold text-amber-700">Liste tronquée à 2 000 : affinez par item, série ou recherche.</span>}
        </span>
        <span className="flex gap-3">
          <button type="button" className="underline-offset-4 hover:underline disabled:opacity-50" disabled={candidates.length === 0} onClick={() => setSelected(new Set(candidates.map((q) => q.id)))}>Tout sélectionner</button>
          <button type="button" className="underline-offset-4 hover:underline disabled:opacity-50" disabled={selected.size === 0} onClick={() => setSelected(new Set())}>Aucune</button>
        </span>
      </div>

      <ul className="mt-2 max-h-96 divide-y divide-(--color-border) overflow-auto rounded-(--radius-button) border border-(--color-border) bg-(--color-surface)">
        {list.map((q) => {
          const already = existingSources.has(q.id);
          const on = selected.has(q.id);
          return (
            <li key={q.id} className={`flex items-start gap-3 px-3 py-2 text-sm ${on ? 'bg-amber-50/60' : ''} ${already ? 'opacity-55' : ''}`}>
              <input type="checkbox" className="mt-1" checked={on} disabled={already} onChange={(e) => toggle(q.id, e.target.checked)} aria-label="Sélectionner" />
              <div className="min-w-0 flex-1">
                <p className="text-(--color-ink)">{q.enonce}</p>
                <p className="mt-0.5 text-[11px] text-(--color-ink-muted)">
                  <span className="mr-1.5 rounded bg-(--color-surface-sunken) px-1 py-0.5 font-semibold">{TYPE_LABEL[q.type] ?? q.type}</span>
                  {q.cours_titre} · {q.serie_label}{already ? ' · déjà dans la manche' : ''}
                </p>
              </div>
            </li>
          );
        })}
        {list.length === 0 && <li className="px-3 py-6 text-center text-xs text-(--color-ink-muted)">{loading ? 'Chargement…' : matiereId ? 'Aucun QCM ne correspond.' : 'Aucune question affichée.'}</li>}
      </ul>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button disabled={pending || selected.size === 0} onClick={add}><Plus className="h-4 w-4" /> {pending ? 'Ajout…' : `Ajouter ${selected.size} question${selected.size > 1 ? 's' : ''} à la manche`}</Button>
        {selected.size > remaining && remaining >= 0 && <span className="text-xs font-semibold text-amber-700">La manche dépassera l&rsquo;effectif attendu ({remaining} restante{remaining > 1 ? 's' : ''}).</span>}
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */

/** Import par IA : explication, lien vers l'outil (inchangé), séries déjà publiées à copier. */
function AiPanel({ roundId, onDone, onError }: { roundId: string; onDone: (m: string) => void; onError: (e: string) => void }) {
  const [imports, setImports] = useState<AiImportSerie[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    let alive = true;
    listPublishedAiImports().then((r) => {
      if (!alive) return;
      if (r.ok) setImports(r.imports); else onError(r.error);
    });
    return () => { alive = false; };
  }, [onError]);

  const copy = (s: AiImportSerie) => {
    setBusy(s.serieId);
    start(async () => {
      const r = await importSerieFromBank(roundId, s.serieId);
      setBusy(null);
      if (r.ok) onDone(`${r.inserted} question(s) de la série « ${r.label} » copiée(s) dans la manche${r.ignored ? ` (${r.ignored} ignorée(s))` : ''}.`);
      else onError(r.error);
    });
  };

  return (
    <Panel title="Importer par IA" hint="L'outil d'import d'exercices reste identique ; la manche est simplement renseignée pour la copie finale.">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) p-4">
          <p className="text-sm text-(--color-ink)">
            L&rsquo;outil d&rsquo;import d&rsquo;exercices analyse un PDF, un Word ou un texte, vérifie les corrigés sur le document et publie une série dans la banque ;
            la série est ensuite copiée dans cette manche au format EVC Arena (QRU si une seule exacte, sinon QRM ; QROC exclues).
          </p>
          <ol className="mt-3 space-y-1 text-xs text-(--color-ink-soft)">
            <li><b>1.</b> Ouvrez l&rsquo;outil : la manche et le collège du tournoi sont pré-renseignés.</li>
            <li><b>2.</b> Importez, relisez le rapport de fiabilité, publiez.</li>
            <li><b>3.</b> Vous revenez ici automatiquement, la série copiée dans la manche.</li>
          </ol>
          <Button asChild className="mt-4">
            <Link href={`/admin/import-exercices?arena=${roundId}`}><Sparkles className="h-4 w-4" /> Ouvrir l&rsquo;outil d&rsquo;import <ExternalLink className="h-3.5 w-3.5 opacity-70" /></Link>
          </Button>
        </div>
        <div>
          <SectionLabel hint="30 dernières">Séries déjà importées par IA</SectionLabel>
          <ul className="max-h-72 divide-y divide-(--color-border) overflow-auto rounded-(--radius-button) border border-(--color-border) bg-(--color-surface)">
            {imports === null && <li className="px-3 py-4 text-xs text-(--color-ink-muted)">Chargement…</li>}
            {imports?.length === 0 && <li className="px-3 py-4 text-xs text-(--color-ink-muted)">Aucune série publiée par l&rsquo;import IA pour le moment.</li>}
            {imports?.map((s) => (
              <li key={s.id} className="flex items-center gap-3 px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-(--color-ink)">{s.title}</p>
                  <p className="truncate text-[11px] text-(--color-ink-muted)">{s.coursTitre} · {s.nQcm} QCM · {new Date(s.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
                <Button size="sm" variant="outline" disabled={pending || s.nQcm === 0} onClick={() => copy(s)}>{busy === s.serieId && pending ? 'Copie…' : 'Copier dans la manche'}</Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Panel>
  );
}

'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowDown, ArrowUp, Ban, Download, FileUp, Library, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { deleteQuestion, importFromBank, importQuestions, neutralizeQuestion, reorderQuestions, restoreQuestion, saveQuestion, type QuestionInput } from '@/app/admin/arena/questions-actions';
import { listContentQuestions, listContentTree } from '@/app/admin/epreuves-blanches/actions';
import { importTemplateCsv } from '@/lib/arena/import';
import type { QType } from '@/lib/arena/scoring';
import { LETTERS, questionIssues, type QuestionRow, type RoundRow } from '@/lib/arena/types';

/**
 * Questions d'une manche (§20) : liste ordonnée avec contrôle d'intégrité,
 * saisie unitaire, import CSV/tableur (parsé dans le navigateur : aucun
 * fichier ne transite par une action serveur), pioche dans la banque de QCM,
 * neutralisation (§10) quand la manche a déjà des participants.
 */
export function QuestionsManager({ round, questions, expected, started, specialtyId, defaultSeconds }: { round: RoundRow; questions: QuestionRow[]; expected: number; started: boolean; specialtyId: string | null; /** Durée par défaut d'une question, réglée sur le tournoi. */ defaultSeconds: number }) {
  const router = useRouter();
  const [editing, setEditing] = useState<QuestionInput | null>(null);
  const [panel, setPanel] = useState<null | 'import' | 'bank'>(null);
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

  return (
    <section className="rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft)">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-(--color-ink)">Manche {round.number}{round.theme ? ` · ${round.theme}` : ''}</h3>
          <p className={`text-xs ${active === expected ? 'text-emerald-700' : 'text-(--color-danger)'}`}>{active} / {expected} questions actives{started ? ' · manche démarrée : modification impossible, neutralisation seulement' : ''}</p>
        </div>
        {!started && (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => { setEditing(blank()); setPanel(null); }}><Plus className="mr-1 h-4 w-4" /> Question</Button>
            <Button size="sm" variant="outline" onClick={() => setPanel(panel === 'import' ? null : 'import')}><FileUp className="mr-1 h-4 w-4" /> Importer (CSV / tableur)</Button>
            <Button size="sm" variant="outline" onClick={() => setPanel(panel === 'bank' ? null : 'bank')}><Library className="mr-1 h-4 w-4" /> Piocher dans la banque</Button>
          </div>
        )}
      </div>

      {error && <p className="mt-3 text-sm font-semibold text-(--color-danger)">{error}</p>}
      {info && <p className="mt-3 text-sm font-semibold text-emerald-700">{info}</p>}

      {panel === 'import' && <ImportPanel roundId={round.id} onDone={(m) => { setInfo(m); setPanel(null); router.refresh(); }} onError={setError} />}
      {panel === 'bank' && <BankPanel roundId={round.id} specialtyId={specialtyId} onDone={(m) => { setInfo(m); setPanel(null); router.refresh(); }} onError={setError} />}

      {editing && (
        <QuestionForm
          value={editing}
          defaultSeconds={defaultSeconds}
          onCancel={() => setEditing(null)}
          onSaved={(issues) => { setEditing(null); setInfo(issues.length ? `Enregistrée avec avertissements : ${issues.join(' ')}` : 'Question enregistrée.'); router.refresh(); }}
          onError={setError}
        />
      )}

      <ol className="mt-4 divide-y divide-(--color-border)">
        {questions.length === 0 && <li className="py-6 text-center text-sm text-(--color-ink-soft)">Aucune question.</li>}
        {questions.map((q, i) => {
          const issues = questionIssues(q);
          return (
            <li key={q.id} className={`flex items-start gap-3 py-3 ${q.neutralized_at ? 'opacity-60' : ''}`}>
              <span className="w-7 shrink-0 text-right text-sm font-bold text-(--color-ink-muted)">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-(--color-ink)">
                  <span className="mr-2 rounded bg-(--color-surface-sunken) px-1.5 py-0.5 text-[11px] font-bold">{q.type}{q.type === 'QRP' ? ` n=${q.expected_count ?? q.items.filter((x) => x.is_correct).length}` : ''}</span>
                  {q.enonce.slice(0, 160)}{q.enonce.length > 160 ? '…' : ''}
                </p>
                <p className="mt-0.5 text-xs text-(--color-ink-soft)">
                  {q.items.length} propositions · réponse {q.items.filter((x) => x.is_correct).map((x) => x.lettre).join('') || '—'}
                  {q.items.some((x) => x.indispensable) ? ` · indispensable ${q.items.filter((x) => x.indispensable).map((x) => x.lettre).join('')}` : ''}
                  {q.items.some((x) => x.inacceptable) ? ` · inacceptable ${q.items.filter((x) => x.inacceptable).map((x) => x.lettre).join('')}` : ''}
                  {q.weight !== 1 ? ` · coef ${q.weight}` : ''}
                  {` · ${q.duration_seconds ?? defaultSeconds} s`}{q.duration_seconds ? '' : ' (tournoi)'}
                  {q.source_question_id ? ' · banque' : ''}
                  {q.neutralized_at ? ` · NEUTRALISÉE${q.neutralized_reason ? ` (${q.neutralized_reason})` : ''}` : ''}
                </p>
                {issues.length > 0 && !q.neutralized_at && <p className="mt-0.5 text-xs font-semibold text-(--color-danger)">{issues.join(' ')}</p>}
                {!q.explanation && !q.neutralized_at && <p className="mt-0.5 text-xs text-amber-700">Explication détaillée manquante (corrections §12).</p>}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {!started && <>
                  <Button variant="ghost" size="sm" disabled={pending || i === 0} onClick={() => move(i, -1)} title="Monter"><ArrowUp className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" disabled={pending || i === questions.length - 1} onClick={() => move(i, 1)} title="Descendre"><ArrowDown className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => { setEditing(toInput(q)); setPanel(null); }} title="Modifier"><Pencil className="h-4 w-4" /></Button>
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
    </section>
  );
}

/* ------------------------------------------------------------------ */

function QuestionForm({ value, defaultSeconds, onCancel, onSaved, onError }: { value: QuestionInput; defaultSeconds: number; onCancel: () => void; onSaved: (issues: string[]) => void; onError: (e: string) => void }) {
  const [q, setQ] = useState<QuestionInput>(value);
  const [pending, start] = useTransition();
  const set = <K extends keyof QuestionInput>(k: K, v: QuestionInput[K]) => setQ((x) => ({ ...x, [k]: v }));
  const items = q.items ?? [];
  const setItem = (i: number, patch: Partial<QuestionInput['items'][number]>) => set('items', items.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  return (
    <div className="mt-4 rounded-(--radius-button) border border-(--color-border-strong) bg-(--color-surface-soft) p-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="space-y-1"><Label>Type</Label>
          <select value={q.type} onChange={(e) => set('type', e.target.value as QType)} className="h-10 w-full rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) px-3 text-sm">
            <option value="QRM">QRM</option><option value="QRU">QRU</option><option value="QRP">QRP</option>
          </select>
        </div>
        {q.type === 'QRP' && <div className="space-y-1"><Label>n attendu</Label><Input type="number" min={1} max={11} value={q.expected_count ?? ''} onChange={(e) => set('expected_count', e.target.value ? Number(e.target.value) : null)} placeholder="= nb exactes" /></div>}
        <div className="space-y-1"><Label>Pondération</Label><Input type="number" step="0.5" min={0.5} max={10} value={q.weight ?? 1} onChange={(e) => set('weight', Number(e.target.value) || 1)} /></div>
        {/* Chronomètre propre à la question. Vide = durée par défaut du tournoi. */}
        <div className="space-y-1">
          <Label>Durée (s)</Label>
          <Input type="number" min={5} max={3600} value={q.duration_seconds ?? ''} placeholder={`${defaultSeconds} (tournoi)`}
            onChange={(e) => set('duration_seconds', e.target.value ? Number(e.target.value) : null)} />
        </div>
      </div>
      <div className="mt-3 space-y-1"><Label>Vignette clinique (facultatif)</Label><Textarea rows={2} value={q.vignette ?? ''} onChange={(e) => set('vignette', e.target.value)} /></div>
      <div className="mt-3 space-y-1"><Label>Énoncé</Label><Textarea rows={2} value={q.enonce} onChange={(e) => set('enonce', e.target.value)} /></div>
      <div className="mt-3 space-y-1"><Label>Images (URL publiques, une par ligne)</Label><Textarea rows={1} value={(q.images ?? []).join('\n')} onChange={(e) => set('images', e.target.value.split('\n').map((s) => s.trim()).filter(Boolean))} /></div>

      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-(--color-ink-muted)">Propositions — cochez les exactes ; marquages indispensable / inacceptable facultatifs (§6.9)</p>
      <div className="mt-2 space-y-2">
        {items.map((it, i) => (
          <div key={i} className="grid items-start gap-2 sm:grid-cols-[2rem_1fr_auto]">
            <span className="pt-2 text-sm font-bold">{LETTERS[i]}</span>
            <div className="space-y-1">
              <Input value={it.enonce} onChange={(e) => setItem(i, { enonce: e.target.value })} placeholder={`Proposition ${LETTERS[i]}`} />
              <Input value={it.justification ?? ''} onChange={(e) => setItem(i, { justification: e.target.value })} placeholder="Justification (corrections)" className="text-xs" />
            </div>
            <div className="flex flex-wrap gap-2 pt-2 text-xs">
              <label className="flex items-center gap-1"><input type="checkbox" checked={Boolean(it.is_correct)} onChange={(e) => setItem(i, { is_correct: e.target.checked })} /> exacte</label>
              <label className="flex items-center gap-1"><input type="checkbox" checked={Boolean(it.indispensable)} onChange={(e) => setItem(i, { indispensable: e.target.checked, inacceptable: e.target.checked ? false : it.inacceptable })} /> indisp.</label>
              <label className="flex items-center gap-1"><input type="checkbox" checked={Boolean(it.inacceptable)} onChange={(e) => setItem(i, { inacceptable: e.target.checked, indispensable: e.target.checked ? false : it.indispensable })} /> inacc.</label>
              <Button variant="ghost" size="sm" onClick={() => set('items', items.filter((_, j) => j !== i))} disabled={items.length <= 2}>×</Button>
            </div>
          </div>
        ))}
        {items.length < LETTERS.length && <Button variant="ghost" size="sm" onClick={() => set('items', [...items, { enonce: '', is_correct: false, indispensable: false, inacceptable: false, justification: '' }])}>+ proposition</Button>}
      </div>

      <details className="mt-4" open={Boolean(q.explanation)}>
        <summary className="cursor-pointer text-sm font-semibold">Corrections (§12) : explication, pièges, erreurs fréquentes, références</summary>
        <div className="mt-2 grid gap-3">
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
    </div>
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
    <div className="mt-4 rounded-(--radius-button) border border-(--color-border-strong) bg-(--color-surface-soft) p-4">
      <div className="flex flex-wrap items-center gap-3">
        <input type="file" accept=".csv,.xlsx,.xls,text/csv" onChange={(e) => { const f = e.target.files?.[0]; if (f) parseFile(f); }} className="text-sm" />
        <Button variant="ghost" size="sm" onClick={template}><Download className="mr-1 h-4 w-4" /> Modèle de fichier vierge</Button>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={replace} onChange={(e) => setReplace(e.target.checked)} /> Remplacer les questions existantes</label>
      </div>
      <p className="mt-2 text-xs text-(--color-ink-muted)">Colonnes : type (QRM/QRU/QRP), n, ponderation, vignette, enonce, A…K, reponses (ex. « A, C, D »), indispensables, inacceptables, justification_A…, explication, pieges, erreurs, references. Séparateur « ; » ou « , ». Les lignes invalides sont rejetées avec leur motif, les autres importées.</p>
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
    </div>
  );
}

/* ------------------------------------------------------------------ */

type BankQuestion = { id: string; enonce: string; type: string; cours_titre: string; serie_label: string };

function BankPanel({ roundId, specialtyId, onDone, onError }: { roundId: string; specialtyId: string | null; onDone: (m: string) => void; onError: (e: string) => void }) {
  const [matiereId, setMatiereId] = useState(specialtyId ?? '');
  const [tree, setTree] = useState<{ id: string; titre: string; series: { id: string; label: string }[] }[]>([]);
  const [coursId, setCoursId] = useState('');
  const [search, setSearch] = useState('');
  const [list, setList] = useState<BankQuestion[]>([]);
  const [tronque, setTronque] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, start] = useTransition();

  const load = () => start(async () => {
    const t = await listContentTree(matiereId);
    if (t.ok) setTree(t.tree.cours as typeof tree); else onError(t.error);
    const r = await listContentQuestions({ matiereId, coursId: coursId || null, types: ['qcm', 'dp_qcm'], search: search || null });
    if (r.ok) { setList(r.questions as BankQuestion[]); setTronque(r.tronque); } else onError(r.error);
  });

  return (
    <div className="mt-4 rounded-(--radius-button) border border-(--color-border-strong) bg-(--color-surface-soft) p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1"><Label>Collège (id matière)</Label><Input value={matiereId} onChange={(e) => setMatiereId(e.target.value)} placeholder="col-medecine-interne" className="w-56" /></div>
        <div className="space-y-1"><Label>Cours</Label>
          <select value={coursId} onChange={(e) => setCoursId(e.target.value)} className="h-10 w-64 rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) px-3 text-sm">
            <option value="">Tous</option>{tree.map((c) => <option key={c.id} value={c.id}>{c.titre}</option>)}
          </select>
        </div>
        <div className="space-y-1"><Label>Recherche</Label><Input value={search} onChange={(e) => setSearch(e.target.value)} className="w-56" /></div>
        <Button size="sm" variant="outline" disabled={pending || !matiereId} onClick={load}>Charger</Button>
        <Button size="sm" disabled={pending || selected.size === 0} onClick={() => start(async () => { const r = await importFromBank(roundId, [...selected]); if (r.ok) onDone(`${r.inserted} question(s) copiée(s) depuis la banque (QRU si une seule exacte, sinon QRM ; à compléter : corrections, règles, QRP).`); else onError(r.error); })}>Copier {selected.size} question(s)</Button>
      </div>
      {tronque && <p className="mt-2 text-xs text-amber-700">Liste tronquée à 2 000 : affinez par cours ou recherche.</p>}
      <ul className="mt-3 max-h-80 divide-y divide-(--color-border) overflow-auto rounded border border-(--color-border) bg-(--color-surface)">
        {list.map((q) => (
          <li key={q.id} className="flex items-start gap-2 px-3 py-2 text-sm">
            <input type="checkbox" className="mt-1" checked={selected.has(q.id)} onChange={(e) => setSelected((s) => { const n = new Set(s); if (e.target.checked) n.add(q.id); else n.delete(q.id); return n; })} />
            <div><p>{q.enonce}</p><p className="text-xs text-(--color-ink-muted)">{q.cours_titre} · {q.serie_label} · {q.type}</p></div>
          </li>
        ))}
        {list.length === 0 && <li className="px-3 py-4 text-xs text-(--color-ink-muted)">Chargez un collège pour afficher ses QCM (les QROC sont exclues).</li>}
      </ul>
    </div>
  );
}

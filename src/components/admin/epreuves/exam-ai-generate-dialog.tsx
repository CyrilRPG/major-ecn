'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateExamQuestionsWithAI, listContentTree } from '@/app/admin/epreuves-blanches/actions';
import type { CollegeOption } from './exam-editor';

type Item = { id: string; titre: string };

/**
 * Génération d'une épreuve par IA : choix des collèges (et sous-collèges MG),
 * puis des items, de la voie et du volume de questions. Les DP font ~7 questions
 * et sont insérés groupés (questions consécutives partageant la vignette).
 */
export function ExamAiGenerateDialog({
  examId,
  colleges,
  qrocMode,
  onClose,
  scope = 'epreuve',
  lockedCoursId,
}: {
  examId: string;
  colleges: CollegeOption[];
  qrocMode: 'self' | 'ai';
  onClose: () => void;
  /** Facturation IA : 1,30 € pour une épreuve blanche, 0,30 € pour une interrogation. */
  scope?: 'epreuve' | 'interrogation';
  /** Interrogation : l'item est imposé, on masque le choix collège/items. */
  lockedCoursId?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const [collegeIds, setCollegeIds] = useState<Set<string>>(new Set());
  const [items, setItems] = useState<Item[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [coursIds, setCoursIds] = useState<Set<string>>(new Set());
  const [voie, setVoie] = useState<'interne' | 'externe'>('interne');
  const [nbKnowledge, setNbKnowledge] = useState(10);
  const [nbDpQuestions, setNbDpQuestions] = useState(14);

  const topColleges = colleges.filter((c) => !c.parentId);
  const mgSubs = colleges.filter((c) => c.parentId === 'col-medecine-generale');
  const mgSelected = collegeIds.has('col-medecine-generale');

  const toggle = (set: React.Dispatch<React.SetStateAction<Set<string>>>, v: string) =>
    set((prev) => { const n = new Set(prev); if (n.has(v)) n.delete(v); else n.add(v); return n; });

  // Charge les items des collèges sélectionnés (sous-collèges MG inclus).
  useEffect(() => {
    if (lockedCoursId) return; // interrogation : l'item est imposé
    const ids = Array.from(collegeIds).filter((id) => id !== 'col-medecine-generale');
    if (ids.length === 0) { setItems([]); setCoursIds(new Set()); return; }
    let cancelled = false;
    setLoadingItems(true);
    Promise.all(ids.map((id) => listContentTree(id)))
      .then((results) => {
        if (cancelled) return;
        const all: Item[] = [];
        for (const r of results) {
          if (r.ok) for (const c of r.tree.cours) all.push({ id: c.id, titre: c.titre });
        }
        setItems(all);
        setCoursIds((prev) => new Set(Array.from(prev).filter((id) => all.some((i) => i.id === id))));
      })
      .finally(() => { if (!cancelled) setLoadingItems(false); });
    return () => { cancelled = true; };
  }, [collegeIds]);

  const targetCoursIds = lockedCoursId ? [lockedCoursId] : Array.from(coursIds);

  const submit = () => {
    setError(null); setResult(null);
    if (targetCoursIds.length === 0) { setError('Sélectionnez au moins un item.'); return; }
    start(async () => {
      const res = await generateExamQuestionsWithAI({
        examId, coursIds: targetCoursIds, voie, nbKnowledge, nbDpQuestions, scope,
      });
      if (!res.ok) { setError(res.error); return; }
      setResult(`${res.inserted} question(s) générée(s) · ${res.dps} dossier(s) progressif(s) · coût ≈ ${(res.costUsd).toFixed(3)} $`);
      router.refresh();
    });
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-start justify-center overflow-y-auto bg-(--color-ink)/50 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-2xl rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-lifted)">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-base font-bold text-(--color-ink)">
              <Sparkles className="h-5 w-5 text-[#7C3AED]" /> Générer l’épreuve par IA
            </h2>
            <p className="mt-0.5 text-xs text-(--color-ink-soft)">
              Les questions sont générées uniquement à partir des cours de la plateforme et inspirées des annales.
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-(--color-ink-soft) hover:bg-(--color-sand-100)">
            <X className="h-4 w-4" />
          </button>
        </div>

        {lockedCoursId ? (
          <p className="rounded-lg border border-(--color-border) bg-(--color-surface-soft) px-3 py-2 text-xs text-(--color-ink-soft)">
            Les questions seront générées à partir de la <strong>fiche de ce cours</strong> et de ses annales.
          </p>
        ) : (
        <>
        {/* 1. Collèges */}
        <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-(--color-ink-muted)">1 · Collèges</p>
        <div className="grid max-h-32 grid-cols-1 gap-1 overflow-y-auto rounded-lg border border-(--color-border) p-2 sm:grid-cols-2">
          {topColleges.map((c) => (
            <label key={c.id} className="flex items-center gap-2 text-[13px]">
              <input type="checkbox" checked={collegeIds.has(c.id)} onChange={() => toggle(setCollegeIds, c.id)} />
              <span className="truncate">{c.nom}</span>
            </label>
          ))}
        </div>

        {/* 1b. Sous-collèges MG */}
        {mgSelected && (
          <div className="mt-2 rounded-lg border border-dashed border-(--color-border) bg-(--color-primary-soft)/10 p-2">
            <p className="mb-1 text-[11px] font-semibold text-(--color-ink)">Sous-collèges de Médecine générale</p>
            <div className="grid max-h-32 grid-cols-1 gap-1 overflow-y-auto sm:grid-cols-2">
              {mgSubs.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-[13px]">
                  <input type="checkbox" checked={collegeIds.has(c.id)} onChange={() => toggle(setCollegeIds, c.id)} />
                  <span className="truncate">{c.nom}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* 2. Items */}
        <p className="mb-1.5 mt-4 text-xs font-bold uppercase tracking-wider text-(--color-ink-muted)">
          2 · Items {loadingItems && <Loader2 className="ml-1 inline h-3 w-3 animate-spin" />}
        </p>
        {items.length === 0 ? (
          <p className="rounded-lg border border-dashed border-(--color-border) px-3 py-4 text-center text-xs text-(--color-ink-muted)">
            Choisissez d’abord un collège.
          </p>
        ) : (
          <>
            <div className="mb-1 flex gap-2">
              <button type="button" className="text-[11px] font-bold text-(--color-primary)" onClick={() => setCoursIds(new Set(items.map((i) => i.id)))}>Tout sélectionner</button>
              <button type="button" className="text-[11px] font-bold text-(--color-ink-soft)" onClick={() => setCoursIds(new Set())}>Tout désélectionner</button>
            </div>
            <div className="grid max-h-44 grid-cols-1 gap-1 overflow-y-auto rounded-lg border border-(--color-border) p-2">
              {items.map((i) => (
                <label key={i.id} className="flex items-center gap-2 text-[13px]">
                  <input type="checkbox" checked={coursIds.has(i.id)} onChange={() => toggle(setCoursIds, i.id)} />
                  <span className="truncate">{i.titre}</span>
                </label>
              ))}
            </div>
            <p className="mt-1 text-[11px] text-(--color-ink-muted)">{coursIds.size} item(s) sélectionné(s) · 15 maximum</p>
          </>
        )}
        </>
        )}

        {/* 3. Voie + volumes */}
        <p className="mb-1.5 mt-4 text-xs font-bold uppercase tracking-wider text-(--color-ink-muted)">3 · Format</p>
        <div className="flex flex-wrap gap-2">
          {(['interne', 'externe'] as const).map((v) => (
            <label key={v} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm ${voie === v ? 'border-(--color-primary) bg-(--color-primary-soft)' : 'border-(--color-border)'}`}>
              <input type="radio" name="voie-ia" checked={voie === v} onChange={() => setVoie(v)} className="accent-(--color-primary)" />
              Voie {v} — {v === 'interne' ? 'QCM' : 'QROC'}
            </label>
          ))}
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-[11px] font-medium uppercase tracking-wide text-(--color-ink-muted)">Questions de connaissances</span>
            <input type="number" min={0} max={60} value={nbKnowledge} onChange={(e) => setNbKnowledge(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-[11px] font-medium uppercase tracking-wide text-(--color-ink-muted)">Questions de DP</span>
            <input type="number" min={0} max={60} value={nbDpQuestions} onChange={(e) => setNbDpQuestions(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm" />
            <span className="mt-0.5 block text-[11px] text-(--color-ink-muted)">
              ≈ {Math.max(0, Math.round(nbDpQuestions / 7))} dossier(s) de ~7 questions, groupées et progressives.
            </span>
          </label>
        </div>
        <p className="mt-2 rounded-lg bg-(--color-surface-soft) px-3 py-2 text-[11px] text-(--color-ink-soft)">
          Correction des QROC : <strong>{qrocMode === 'ai' ? 'par IA' : 'auto-évaluation'}</strong> — réglée dans les paramètres de l’épreuve.
          {qrocMode === 'ai' && voie === 'externe' ? ' Le barème de correction IA sera généré automatiquement.' : ''}
        </p>

        {error && <p className="mt-3 rounded-lg border border-(--color-danger)/30 bg-red-50 px-3 py-2 text-sm text-(--color-danger)">{error}</p>}
        {result && <p className="mt-3 rounded-lg border border-(--color-border) bg-(--color-surface-soft) px-3 py-2 text-sm font-semibold text-(--color-ink)">{result}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={pending}>Fermer</Button>
          <Button type="button" onClick={submit} disabled={pending || targetCoursIds.length === 0} className="bg-[linear-gradient(90deg,#7C3AED,#8B5CF6)]">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {pending ? 'Génération en cours…' : 'Générer'}
          </Button>
        </div>
      </div>
    </div>
  );
}

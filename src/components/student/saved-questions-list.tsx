'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Star, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

export type SavedQuestion = {
  questionId: string;
  coursId: string;
  serieId: string;
  college: string;
  coursTitre: string;
  serieLabel: string;
  format: 'qcm' | 'qroc';
  preview: string;
  createdAt: string;
};

export function SavedQuestionsList({ questions }: { questions: SavedQuestion[] }) {
  const [items, setItems] = useState(questions);
  const [removing, setRemoving] = useState<Set<string>>(new Set());

  // Regroupement par collège puis par item (cours), pour une lecture claire.
  const groups = useMemo(() => {
    const byCollege = new Map<string, SavedQuestion[]>();
    for (const q of items) {
      const key = q.college || 'Autres';
      if (!byCollege.has(key)) byCollege.set(key, []);
      byCollege.get(key)!.push(q);
    }
    return [...byCollege.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [items]);

  const remove = async (q: SavedQuestion) => {
    if (removing.has(q.questionId)) return;
    setRemoving((prev) => new Set(prev).add(q.questionId));
    // Optimiste
    setItems((prev) => prev.filter((x) => x.questionId !== q.questionId));
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabase = createClient() as any;
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('student_saved_questions')
          .delete()
          .eq('user_id', user.id)
          .eq('question_id', q.questionId);
      }
    } catch {
      // rollback
      setItems((prev) => [q, ...prev]);
    } finally {
      setRemoving((prev) => { const n = new Set(prev); n.delete(q.questionId); return n; });
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-dashed border-(--color-border) bg-(--color-surface) px-6 py-16 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-(--color-primary-soft) text-(--color-primary)">
          <Star className="h-6 w-6" />
        </span>
        <p className="font-display text-lg font-semibold text-(--color-ink)">Aucune question enregistrée</p>
        <p className="text-sm text-(--color-ink-soft)">
          Pendant un dossier, cliquez sur l’étoile en haut à droite d’une question pour la retrouver ici et la réviser facilement.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {groups.map(([college, qs]) => (
        <section key={college}>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-(--color-ink-muted)">{college}</h2>
          <ul className="space-y-2">
            {qs.map((q) => (
              <li
                key={q.questionId}
                className="group flex items-start gap-3 rounded-xl border border-(--color-border) bg-(--color-surface) p-3.5 shadow-(--shadow-soft)"
              >
                <span
                  className={cn(
                    'mt-0.5 shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                    q.format === 'qroc'
                      ? 'bg-[#E0F2F1] text-[#00695C]'
                      : 'bg-(--color-primary-soft) text-(--color-primary)',
                  )}
                >
                  {q.format === 'qroc' ? 'QROC' : 'QCM'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-(--color-ink-muted)">
                    {q.coursTitre}{q.serieLabel ? ` · ${q.serieLabel}` : ''}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-sm text-(--color-ink)">{q.preview || 'Question'}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Link
                    href={`/cours/${q.coursId}/qcm/${q.serieId}?q=${q.questionId}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-(--color-primary) px-2.5 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                  >
                    Revoir <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(q)}
                    disabled={removing.has(q.questionId)}
                    title="Retirer des questions à revoir"
                    className="inline-flex items-center justify-center rounded-lg border border-(--color-border) bg-white p-1.5 text-(--color-ink-soft) hover:border-(--color-danger) hover:text-(--color-danger)"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

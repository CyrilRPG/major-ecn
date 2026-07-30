'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Star, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { getVerifiedUser } from '@/lib/auth/verified-user';
import { cn } from '@/lib/utils';

export type SavedQuestion = {
  questionId: string;
  coursId: string;
  serieId: string;
  college: string;
  /** Sous-collège (ex. spécialités de Médecine générale). null pour les collèges
   *  de 1er niveau sans hiérarchie. */
  sousCollege?: string | null;
  coursTitre: string;
  serieLabel: string;
  format: 'qcm' | 'qroc';
  preview: string;
  createdAt: string;
};

type SubGroup = { name: string | null; qs: SavedQuestion[] };
type CollegeGroup = { college: string; subs: SubGroup[]; count: number };

export function SavedQuestionsList({ questions }: { questions: SavedQuestion[] }) {
  const [items, setItems] = useState(questions);
  const [removing, setRemoving] = useState<Set<string>>(new Set());

  // Regroupement à deux niveaux : collège → (sous-collège pour la Médecine
  // générale, sinon liste directe). Lecture claire et hiérarchisée.
  const groups = useMemo<CollegeGroup[]>(() => {
    const byCollege = new Map<string, SavedQuestion[]>();
    for (const q of items) {
      const key = q.college || 'Autres';
      if (!byCollege.has(key)) byCollege.set(key, []);
      byCollege.get(key)!.push(q);
    }
    return [...byCollege.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([college, qs]) => {
        const bySub = new Map<string, SavedQuestion[]>();
        for (const q of qs) {
          const k = q.sousCollege ?? '';
          if (!bySub.has(k)) bySub.set(k, []);
          bySub.get(k)!.push(q);
        }
        const subs: SubGroup[] = [...bySub.entries()]
          // Les questions sans sous-collège ('') d'abord, puis les sous-collèges triés.
          .sort((a, b) => (a[0] === '' ? -1 : b[0] === '' ? 1 : a[0].localeCompare(b[0])))
          .map(([name, list]) => ({ name: name === '' ? null : name, qs: list }));
        return { college, subs, count: qs.length };
      });
  }, [items]);

  const remove = async (q: SavedQuestion) => {
    if (removing.has(q.questionId)) return;
    setRemoving((prev) => new Set(prev).add(q.questionId));
    // Optimiste
    setItems((prev) => prev.filter((x) => x.questionId !== q.questionId));
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabase = createClient() as any;
      const user = await getVerifiedUser(supabase);
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
      <div className="mx-auto max-w-xl overflow-hidden rounded-3xl border border-(--color-border) bg-(--color-surface) shadow-(--shadow-soft)">
        {/* Bandeau décoratif dégradé façon cartes premium de la plateforme. */}
        <div
          aria-hidden
          className="h-1.5 w-full"
          style={{ background: 'linear-gradient(90deg, var(--color-primary), color-mix(in srgb, var(--color-primary) 45%, transparent))' }}
        />
        <div className="flex flex-col items-center px-6 py-14 text-center sm:px-10">
          <div className="relative">
            <div className="absolute inset-0 -m-3 rounded-full bg-(--color-primary-soft) animate-[pulse-soft_3s_ease-in-out_infinite]" aria-hidden />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-(--color-primary-soft) text-(--color-primary) shadow-(--shadow-soft)">
              <Star className="h-7 w-7" />
            </div>
          </div>
          <h3 className="mt-6 font-display text-xl font-bold text-(--color-ink)">Aucune question à revoir… pour l’instant</h3>
          <p className="mt-2.5 max-w-md text-sm leading-relaxed text-(--color-ink-soft)">
            Pendant un dossier, touchez l’<span className="inline-flex translate-y-0.5"><Star className="h-3.5 w-3.5 text-(--color-primary)" /></span> en haut à droite
            d’une question pour l’épingler ici. Vous retrouverez vos questions clés,
            <span className="font-semibold text-(--color-ink)"> classées par collège</span>, pour les réviser en un clin d’œil.
          </p>
          <Link
            href="/facultes"
            className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-(--color-primary) px-5 py-3 text-sm font-bold text-white shadow-(--shadow-soft) transition-transform hover:scale-[1.02]"
          >
            <Sparkles className="h-4 w-4" />
            Découvrir les dossiers
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {groups.map((g) => (
        <section key={g.college}>
          <div className="mb-3 flex items-center gap-2.5">
            <h2 className="text-sm font-bold tracking-tight text-(--color-ink)">{g.college}</h2>
            <span className="rounded-full bg-(--color-sand-100) px-2 py-0.5 text-[11px] font-semibold text-(--color-ink-soft)">
              {g.count}
            </span>
          </div>
          <div className="space-y-5">
            {g.subs.map((sub, si) => (
              <div key={sub.name ?? `__${si}`}>
                {sub.name && (
                  <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-(--color-ink-muted)">
                    <span aria-hidden className="h-3 w-0.5 rounded-full bg-(--color-primary)/50" />
                    {sub.name}
                  </h3>
                )}
                <ul className="space-y-2">
                  {sub.qs.map((q) => (
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
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

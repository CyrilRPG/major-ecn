'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Archive, Copy, Eye, EyeOff, Loader2, Pencil, Trash2 } from 'lucide-react';
import { setExamStatus, duplicateExam, deleteExam } from '@/app/admin/epreuves-blanches/actions';

export function ExamRowActions({ id, status }: { id: string; status: 'draft' | 'published' | 'archived' }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const act = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => {
      const res = await fn();
      if (!res.ok) alert(res.error ?? 'Erreur');
      else router.refresh();
    });

  const btn = 'inline-flex h-8 w-8 items-center justify-center rounded-lg text-(--color-ink-soft) hover:bg-(--color-sand-100)';

  return (
    <div className="flex shrink-0 items-center gap-0.5">
      {pending && <Loader2 className="mr-1 h-4 w-4 animate-spin text-(--color-ink-muted)" />}
      <a href={`/admin/epreuves-blanches/${id}`} className={btn} title="Éditer" aria-label="Éditer">
        <Pencil className="h-4 w-4" />
      </a>
      {status === 'published' ? (
        <button type="button" className={btn} title="Repasser en brouillon" onClick={() => act(() => setExamStatus(id, 'draft'))}>
          <EyeOff className="h-4 w-4" />
        </button>
      ) : (
        <button type="button" className={btn} title="Publier" onClick={() => act(() => setExamStatus(id, 'published'))}>
          <Eye className="h-4 w-4" />
        </button>
      )}
      <button type="button" className={btn} title="Dupliquer" onClick={() => act(() => duplicateExam(id))}>
        <Copy className="h-4 w-4" />
      </button>
      {status !== 'archived' && (
        <button type="button" className={btn} title="Archiver" onClick={() => act(() => setExamStatus(id, 'archived'))}>
          <Archive className="h-4 w-4" />
        </button>
      )}
      <button
        type="button"
        className={btn + ' hover:text-(--color-danger)'}
        title="Supprimer"
        onClick={() => { if (confirm('Supprimer définitivement cette épreuve et ses copies ?')) act(() => deleteExam(id)); }}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

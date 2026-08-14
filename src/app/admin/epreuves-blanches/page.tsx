import Link from 'next/link';
import { PencilRuler, Plus } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { NewExamButton } from '@/components/admin/epreuves/new-exam-button';
import { ExamRowActions } from '@/components/admin/epreuves/exam-row-actions';

export const metadata = { title: 'Épreuves blanches' };
export const dynamic = 'force-dynamic';

type Row = {
  id: string;
  title: string;
  college_id: string | null;
  status: 'draft' | 'published' | 'archived';
  exam_mode: 'free' | 'scheduled';
  qroc_mode: 'self' | 'ai';
  voies: string[] | null;
  duration_minutes: number | null;
  n_questions: number;
};

const STATUS_BADGE: Record<Row['status'], { label: string; bg: string; fg: string }> = {
  draft: { label: 'Brouillon', bg: '#F1F1F4', fg: '#5B6478' },
  published: { label: 'Publiée', bg: '#E7F6EC', fg: '#16793C' },
  archived: { label: 'Archivée', bg: '#FEF3E2', fg: '#B26A00' },
};

export default async function AdminEpreuvesPage() {
  await requireAdmin();
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = admin as any;

  const { data: examsRaw } = await a
    .from('mock_exams')
    .select('id, title, college_id, status, exam_mode, qroc_mode, voies, duration_minutes, mock_exam_questions(count)')
    // Les interrogations (rattachées à un item via cours_id) se gèrent depuis
    // l'onglet « Interrogations » du contenu, et les interrogations officielles
    // de spécialité depuis /admin/interrogations — pas dans cette liste.
    .is('cours_id', null)
    .is('specialite_id', null)
    .order('created_at', { ascending: false });
  const { data: colsRaw } = await a.from('matieres').select('id, nom');
  const collegeName = new Map<string, string>(((colsRaw ?? []) as { id: string; nom: string }[]).map((c) => [c.id, c.nom]));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: Row[] = ((examsRaw ?? []) as any[]).map((e) => ({
    id: e.id, title: e.title, college_id: e.college_id, status: e.status, exam_mode: e.exam_mode,
    qroc_mode: e.qroc_mode, voies: e.voies, duration_minutes: e.duration_minutes,
    n_questions: e.mock_exam_questions?.[0]?.count ?? 0,
  }));

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3 border-b border-(--color-border) pb-5">
        <div>
          <p className="text-xs font-medium text-(--color-ink-muted)">Administration</p>
          <h1 className="mt-1 flex items-center gap-2 text-xl font-semibold tracking-tight text-(--color-ink)">
            <PencilRuler className="h-5 w-5 text-(--color-primary)" />
            Épreuves blanches
          </h1>
          <p className="mt-0.5 text-sm text-(--color-ink-soft)">
            Créez et gérez un nombre illimité d’épreuves blanches (QCM auto-corrigés, QROC), avec barèmes et ciblage.
          </p>
        </div>
        <NewExamButton />
      </header>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-(--color-border) bg-(--color-surface-soft) px-4 py-12 text-center text-sm text-(--color-ink-soft)">
          Aucune épreuve pour le moment. Cliquez sur « Nouvelle épreuve » pour commencer.
        </div>
      ) : (
        <ul className="space-y-2.5">
          {rows.map((r) => {
            const badge = STATUS_BADGE[r.status];
            return (
              <li key={r.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) px-4 py-3 shadow-(--shadow-soft)">
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/epreuves-blanches/${r.id}`} className="truncate text-[15px] font-semibold text-(--color-ink) hover:text-(--color-primary)">
                    {r.title}
                  </Link>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-(--color-ink-muted)">
                    {r.college_id && <span>{collegeName.get(r.college_id) ?? r.college_id}</span>}
                    <span>· {r.n_questions} question{r.n_questions > 1 ? 's' : ''}</span>
                    {r.duration_minutes ? <span>· {r.duration_minutes} min</span> : null}
                    {r.voies && r.voies.length > 0 ? <span>· {r.voies.join('/')}</span> : null}
                    {r.exam_mode === 'scheduled' ? <span>· programmée</span> : null}
                  </p>
                </div>
                <span className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: badge.bg, color: badge.fg }}>
                  {badge.label}
                </span>
                <ExamRowActions id={r.id} status={r.status} />
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

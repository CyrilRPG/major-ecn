import { MessagesSquare } from 'lucide-react';
import { requireStaff } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { QaRow, type QaQuestionView } from '@/components/admin/qa/qa-row';

export const metadata = { title: 'Questions / Réponses' };

type SearchParams = { status?: string };

export default async function AdminQaPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireStaff();
  const sp = await searchParams;
  const status: 'pending' | 'answered' | 'archived' | 'all' =
    sp.status === 'answered' || sp.status === 'archived' || sp.status === 'all'
      ? sp.status : 'pending';
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from('forum_questions')
    .select('id, body, ai_context, created_at, student_pseudo, cours_titre, matiere_nom, status, is_public, forum_answers(id, body, created_at, professor_name)')
    .order('created_at', { ascending: false });
  if (status !== 'all') query = query.eq('status', status);
  const { data } = await query;
  const rows = ((data ?? []) as Array<{
    id: string; body: string; ai_context: string | null; created_at: string;
    student_pseudo: string; cours_titre: string | null; matiere_nom: string | null;
    status: 'pending' | 'answered' | 'archived'; is_public: boolean;
    forum_answers: Array<{ id: string; body: string; created_at: string; professor_name: string }>;
  }>).map<QaQuestionView>((r) => ({
    id: r.id,
    body: r.body,
    ai_context: r.ai_context,
    created_at: r.created_at,
    student_pseudo: r.student_pseudo,
    cours_titre: r.cours_titre,
    matiere_nom: r.matiere_nom,
    status: r.status,
    is_public: r.is_public,
    answers: (r.forum_answers ?? []).sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    ),
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: pendingCount } = await (supabase as any)
    .from('forum_questions').select('id', { count: 'exact', head: true }).eq('status', 'pending');

  const TABS: Array<{ key: typeof status; label: string }> = [
    { key: 'pending',  label: `En attente${pendingCount ? ` (${pendingCount})` : ''}` },
    { key: 'answered', label: 'Répondues' },
    { key: 'archived', label: 'Archivées' },
    { key: 'all',      label: 'Toutes' },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <header className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-(--color-primary-soft) text-(--color-primary)">
          <MessagesSquare className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-(--color-ink)">
            Questions / Réponses
          </h1>
          <p className="text-sm text-(--color-ink-soft)">
            Répondez aux questions des élèves. Cochez « Publier sur le forum » pour rendre la
            réponse visible dans le forum public.
          </p>
        </div>
      </header>

      {/* Filter tabs */}
      <div className="mb-5 flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <a
            key={t.key}
            href={t.key === 'pending' ? '/admin/qa' : `/admin/qa?status=${t.key}`}
            className={
              'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ' +
              (status === t.key
                ? 'bg-(--color-primary) text-white'
                : 'bg-(--color-surface) text-(--color-ink-soft) hover:text-(--color-ink) border border-(--color-border)')
            }
          >
            {t.label}
          </a>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) px-5 py-12 text-center text-sm text-(--color-ink-soft)">
          Aucune question dans cette catégorie pour l’instant.
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((q) => <QaRow key={q.id} q={q} />)}
        </div>
      )}
    </div>
  );
}

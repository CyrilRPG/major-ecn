import { Bot, MessagesSquare } from 'lucide-react';
import { requireStaff } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { QaRow, type QaQuestionView } from '@/components/admin/qa/qa-row';
import { AiQuestionsTable, type AiQuestionRow } from '@/components/admin/qa/ai-questions-table';

export const metadata = { title: 'Questions / Réponses' };

type SearchParams = { section?: string; status?: string };

export default async function AdminQaPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireStaff();
  const sp = await searchParams;
  const section: 'forum' | 'ia' = sp.section === 'ia' ? 'ia' : 'forum';
  const supabase = await createClient();

  // ─── Section Forum ───
  let forumRows: QaQuestionView[] = [];
  let pendingCount = 0;
  let forumStatus: 'pending' | 'answered' | 'archived' | 'all' = 'pending';

  if (section === 'forum') {
    forumStatus =
      sp.status === 'answered' || sp.status === 'archived' || sp.status === 'all'
        ? sp.status : 'pending';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from('forum_questions')
      .select('id, body, ai_context, created_at, student_pseudo, cours_titre, matiere_nom, status, is_public, forum_answers(id, body, created_at, professor_name)')
      .order('created_at', { ascending: false });
    if (forumStatus !== 'all') query = query.eq('status', forumStatus);
    const { data } = await query;
    forumRows = ((data ?? []) as Array<{
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
    const { count } = await (supabase as any)
      .from('forum_questions').select('id', { count: 'exact', head: true }).eq('status', 'pending');
    pendingCount = count ?? 0;
  }

  // ─── Section Questions IA ───
  let aiRows: AiQuestionRow[] = [];

  if (section === 'ia') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('ai_generations')
      .select('id, user_pseudo, user_offer, cours_titre, user_question, ai_answer, created_at')
      .eq('feature', 'assistant_chat')
      .eq('status', 'success')
      .not('user_question', 'is', null)
      .order('created_at', { ascending: false })
      .limit(200);
    aiRows = (data ?? []) as AiQuestionRow[];
  }

  const FORUM_TABS: Array<{ key: typeof forumStatus; label: string }> = [
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
            {section === 'forum'
              ? 'Répondez aux questions des élèves. Cochez « Publier sur le forum » pour rendre la réponse visible dans le forum public.'
              : 'Historique des questions posées à l’assistant IA par les élèves.'}
          </p>
        </div>
      </header>

      {/* Section tabs */}
      <div className="mb-5 flex gap-1 rounded-xl bg-(--color-surface-soft) p-1 border border-(--color-border)">
        <a
          href="/admin/qa"
          className={
            'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors '
            + (section === 'forum'
              ? 'bg-(--color-surface) text-(--color-ink) shadow-sm'
              : 'text-(--color-ink-soft) hover:text-(--color-ink)')
          }
        >
          <MessagesSquare className="h-4 w-4" />
          Forum
        </a>
        <a
          href="/admin/qa?section=ia"
          className={
            'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors '
            + (section === 'ia'
              ? 'bg-(--color-surface) text-(--color-ink) shadow-sm'
              : 'text-(--color-ink-soft) hover:text-(--color-ink)')
          }
        >
          <Bot className="h-4 w-4" />
          Questions IA
        </a>
      </div>

      {section === 'forum' ? (
        <>
          {/* Forum status filter tabs */}
          <div className="mb-5 flex flex-wrap gap-1.5">
            {FORUM_TABS.map((t) => (
              <a
                key={t.key}
                href={t.key === 'pending' ? '/admin/qa' : `/admin/qa?status=${t.key}`}
                className={
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ' +
                  (forumStatus === t.key
                    ? 'bg-(--color-primary) text-white'
                    : 'bg-(--color-surface) text-(--color-ink-soft) hover:text-(--color-ink) border border-(--color-border)')
                }
              >
                {t.label}
              </a>
            ))}
          </div>

          {forumRows.length === 0 ? (
            <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) px-5 py-12 text-center text-sm text-(--color-ink-soft)">
              Aucune question dans cette catégorie pour l'instant.
            </div>
          ) : (
            <div className="space-y-4">
              {forumRows.map((q) => <QaRow key={q.id} q={q} />)}
            </div>
          )}
        </>
      ) : (
        <AiQuestionsTable rows={aiRows} />
      )}
    </div>
  );
}

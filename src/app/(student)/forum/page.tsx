import Link from 'next/link';
import { MessagesSquare, Sparkles } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Forum questions / réponses' };

type SearchParams = { matiere?: string; q?: string };

export default async function ForumPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireUser();
  const sp = await searchParams;
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from('forum_questions')
    .select('id, body, created_at, student_pseudo, cours_titre, matiere_nom, matiere_id, forum_answers(id, body, created_at, professor_name)')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(200);
  if (sp.matiere) query = query.eq('matiere_id', sp.matiere);

  const { data } = await query;
  let rows = (data ?? []) as Array<{
    id: string; body: string; created_at: string;
    student_pseudo: string; cours_titre: string | null; matiere_nom: string | null;
    matiere_id: string | null;
    forum_answers: Array<{ id: string; body: string; created_at: string; professor_name: string }>;
  }>;

  if (sp.q) {
    const needle = sp.q.toLowerCase();
    rows = rows.filter((r) => r.body.toLowerCase().includes(needle));
  }

  // Get distinct matieres for filter chips.
  const matieres = Array.from(
    new Map(rows.filter((r) => r.matiere_id && r.matiere_nom).map((r) => [r.matiere_id!, r.matiere_nom!])).entries(),
  );

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <header className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-(--color-primary-soft) text-(--color-primary)">
          <MessagesSquare className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-(--color-ink)">
            Forum questions / réponses
          </h1>
          <p className="text-sm text-(--color-ink-soft)">
            Les questions des élèves auxquelles l’équipe pédagogique a répondu, rendues publiques.
          </p>
        </div>
      </header>

      {/* Filters */}
      <form method="GET" className="mb-5 flex flex-col gap-2 sm:flex-row">
        <input
          type="search"
          name="q"
          defaultValue={sp.q ?? ''}
          placeholder="Rechercher dans les questions…"
          className="flex-1 rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-2.5 text-sm text-(--color-ink) outline-none transition-colors focus:border-(--color-primary)"
        />
        {sp.matiere && <input type="hidden" name="matiere" value={sp.matiere} />}
        <button
          type="submit"
          className="rounded-xl bg-(--color-primary) px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
        >
          Filtrer
        </button>
      </form>

      {matieres.length > 1 && (
        <div className="mb-5 flex flex-wrap gap-1.5">
          <Link
            href={sp.q ? `/forum?q=${encodeURIComponent(sp.q)}` : '/forum'}
            className={
              'rounded-full px-3 py-1 text-xs font-semibold ' +
              (!sp.matiere ? 'bg-(--color-primary) text-white' : 'border border-(--color-border) bg-(--color-surface) text-(--color-ink-soft)')
            }
          >
            Toutes matières
          </Link>
          {matieres.map(([id, nom]) => (
            <Link
              key={id}
              href={`/forum?matiere=${id}${sp.q ? `&q=${encodeURIComponent(sp.q)}` : ''}`}
              className={
                'rounded-full px-3 py-1 text-xs font-semibold ' +
                (sp.matiere === id ? 'bg-(--color-primary) text-white' : 'border border-(--color-border) bg-(--color-surface) text-(--color-ink-soft) hover:text-(--color-ink)')
              }
            >
              {nom}
            </Link>
          ))}
        </div>
      )}

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) px-5 py-16 text-center">
          <Sparkles className="mx-auto h-7 w-7 text-(--color-primary)" />
          <p className="mt-3 text-sm font-medium text-(--color-ink)">Le forum est encore vide.</p>
          <p className="mt-1 text-xs text-(--color-ink-soft)">
            Posez votre première question depuis un cours — vous pouvez cliquer sur « Appeler un
            professeur » après une réponse de l’IA pour transférer la conversation.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <article key={r.id} className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft) sm:p-6">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-mono font-semibold text-(--color-ink)">{r.student_pseudo}</span>
                <span className="text-(--color-ink-muted)">·</span>
                <span className="text-(--color-ink-muted)">
                  {new Date(r.created_at).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
                {(r.cours_titre || r.matiere_nom) && (
                  <>
                    <span className="text-(--color-ink-muted)">·</span>
                    <span className="rounded-full bg-(--color-primary-soft) px-2 py-0.5 text-[11px] font-semibold text-(--color-primary)">
                      {r.cours_titre ?? r.matiere_nom}
                    </span>
                  </>
                )}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-(--color-ink)">{r.body}</p>

              {(r.forum_answers ?? []).map((a) => (
                <div key={a.id} className="mt-4 rounded-xl border border-(--color-primary)/20 bg-(--color-primary-soft)/40 p-3.5">
                  <p className="text-[11px] font-semibold text-(--color-primary)">
                    Réponse — {a.professor_name}
                    <span className="ml-2 font-normal text-(--color-ink-muted)">
                      {new Date(a.created_at).toLocaleString('fr-FR', { day: '2-digit', month: 'short' })}
                    </span>
                  </p>
                  <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-(--color-ink)">{a.body}</p>
                </div>
              ))}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

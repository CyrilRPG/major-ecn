import Link from 'next/link';
import {
  CheckCircle2, Clock, GraduationCap, MessageCircleQuestion,
  MessagesSquare, Search, Sparkles, Stethoscope,
} from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { Markdown } from '@/components/ui/markdown';
import { ForumQuestionForm } from '@/components/student/forum-question-form';
import { parseScope, canAccessCollege, canAccessCours } from '@/lib/auth/permissions';
import { EDN_FACULTE_ID } from '@/lib/data/navigator';

export const metadata = { title: 'Forum questions / réponses' };

type SearchParams = { matiere?: string; q?: string };

type Row = {
  id: string;
  body: string;
  created_at: string;
  student_pseudo: string;
  cours_titre: string | null;
  matiere_nom: string | null;
  matiere_id: string | null;
  forum_answers: Array<{
    id: string;
    body: string;
    created_at: string;
    professor_name: string;
  }>;
};

export default async function ForumPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { profile } = await requireUser();
  const scope = parseScope(profile.permission_scope);
  const sp = await searchParams;
  const supabase = await createClient();

  // Récupère l'arborescence collège/items pour le formulaire de question.
  const { data: facRaw } = await supabase
    .from('facultes')
    .select('semestres(matieres(id, nom, order_index, cours(id, titre, order_index)))')
    .eq('id', EDN_FACULTE_ID)
    .maybeSingle();
  type FacRow = { semestres?: { matieres?: Array<{ id: string; nom: string; order_index: number | null;
    cours?: { id: string; titre: string; order_index: number | null }[] | null }> }[] };
  const collegesForForm = ((facRaw as unknown as FacRow | null)?.semestres ?? [])
    .flatMap((s) => s.matieres ?? [])
    .filter((m) => canAccessCollege(scope, m.id))
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .map((m) => ({
      id: m.id,
      nom: m.nom,
      cours: (m.cours ?? [])
        .filter((c) => canAccessCours(scope, m.id, c.id))
        .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
        .map((c) => ({ id: c.id, titre: c.titre })),
    }))
    .filter((m) => m.cours.length > 0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from('forum_questions')
    .select('id, body, created_at, student_pseudo, cours_titre, matiere_nom, matiere_id, forum_answers(id, body, created_at, professor_name)')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(200);
  if (sp.matiere) query = query.eq('matiere_id', sp.matiere);

  const { data } = await query;
  let rows = (data ?? []) as Row[];
  if (sp.q) {
    const needle = sp.q.toLowerCase();
    rows = rows.filter((r) => r.body.toLowerCase().includes(needle));
  }

  const matieres = Array.from(
    new Map(
      rows.filter((r) => r.matiere_id && r.matiere_nom).map((r) => [r.matiere_id!, r.matiere_nom!]),
    ).entries(),
  );

  const totalAnswered = rows.filter((r) => (r.forum_answers ?? []).length > 0).length;

  // Helpers d'affichage
  const ago = (iso: string) => {
    const ms = Date.now() - new Date(iso).getTime();
    const h = Math.round(ms / 3600_000);
    if (h < 1) return "à l'instant";
    if (h < 24) return `il y a ${h} h`;
    const d = Math.round(h / 24);
    if (d < 7) return d === 1 ? 'hier' : `il y a ${d} j`;
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };
  const initials = (s: string) =>
    s.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?';

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* ─────────────── Hero ─────────────── */}
      <section
        className="relative overflow-hidden rounded-3xl border border-(--color-border) p-6 shadow-(--shadow-soft) sm:p-8"
        style={{
          background:
            'linear-gradient(135deg, #FFFFFF 0%, #FFF3F4 45%, #F0EAFF 100%)',
        }}
      >
        <span aria-hidden className="pointer-events-none absolute -right-12 -top-10 h-52 w-52 rounded-full bg-[#E4002B] opacity-[0.08] blur-3xl" />
        <span aria-hidden className="pointer-events-none absolute -bottom-16 -left-8 h-52 w-52 rounded-full bg-[#7C3AED] opacity-[0.08] blur-3xl" />

        <div className="relative grid gap-5 lg:grid-cols-[1.5fr_1fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-(--color-primary) backdrop-blur">
              <MessageCircleQuestion className="h-3.5 w-3.5" />
              Forum Q&amp;R
            </span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-(--color-ink) sm:text-3xl">
              Pose ta question, un prof te répond.
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-(--color-ink-soft)">
              Toutes les questions des élèves auxquelles l’équipe pédagogique a
              répondu, rendues publiques pour que tout le monde en profite.
            </p>
          </div>

          {/* Mini KPIs */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { Icon: MessagesSquare, label: 'questions publiques', value: rows.length, accent: '#E4002B', bg: '#FDE7E9' },
              { Icon: CheckCircle2,   label: 'avec réponse de prof', value: totalAnswered, accent: '#16A34A', bg: '#E7F6EC' },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-2.5 rounded-2xl border border-white/60 bg-white/85 px-3 py-2.5 shadow-(--shadow-soft) backdrop-blur"
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: s.bg, color: s.accent }}
                >
                  <s.Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xl font-bold leading-none tabular-nums" style={{ color: s.accent }}>
                    {s.value}
                  </p>
                  <p className="mt-1 text-[10px] leading-tight text-(--color-ink-muted)">
                    {s.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── Formulaire pour poser une question ─────────────── */}
      <ForumQuestionForm colleges={collegesForForm} />

      {/* ─────────────── Search ─────────────── */}
      <form method="GET" className="mt-6 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-ink-muted)" />
          <input
            type="search"
            name="q"
            defaultValue={sp.q ?? ''}
            placeholder="Rechercher dans les questions…"
            className="w-full rounded-2xl border border-(--color-border) bg-(--color-surface) px-4 py-2.5 pl-10 text-sm text-(--color-ink) outline-none transition-colors focus:border-(--color-primary)"
          />
        </div>
        {sp.matiere && <input type="hidden" name="matiere" value={sp.matiere} />}
        <button
          type="submit"
          className="rounded-2xl bg-[linear-gradient(90deg,#E4002B_0%,#F97316_100%)] px-5 py-2.5 text-sm font-semibold text-white shadow-(--shadow-soft) transition-transform hover:scale-[1.02]"
        >
          Rechercher
        </button>
      </form>

      {/* ─────────────── Matières pills ─────────────── */}
      {matieres.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          <Link
            href={sp.q ? `/forum?q=${encodeURIComponent(sp.q)}` : '/forum'}
            className={
              'rounded-full px-3 py-1 text-xs font-semibold transition-colors ' +
              (!sp.matiere
                ? 'bg-[linear-gradient(90deg,#E4002B_0%,#F97316_100%)] text-white shadow-(--shadow-soft)'
                : 'border border-(--color-border) bg-(--color-surface) text-(--color-ink-soft) hover:text-(--color-ink)')
            }
          >
            Toutes matières
          </Link>
          {matieres.map(([id, nom]) => (
            <Link
              key={id}
              href={`/forum?matiere=${id}${sp.q ? `&q=${encodeURIComponent(sp.q)}` : ''}`}
              className={
                'rounded-full px-3 py-1 text-xs font-semibold transition-colors ' +
                (sp.matiere === id
                  ? 'bg-[linear-gradient(90deg,#E4002B_0%,#F97316_100%)] text-white shadow-(--shadow-soft)'
                  : 'border border-(--color-border) bg-(--color-surface) text-(--color-ink-soft) hover:text-(--color-ink)')
              }
            >
              {nom}
            </Link>
          ))}
        </div>
      )}

      {/* ─────────────── Empty / List ─────────────── */}
      {rows.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-(--color-border) bg-(--color-surface)/60 px-5 py-16 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-(--color-primary-soft) text-(--color-primary)">
            <Sparkles className="h-6 w-6" />
          </span>
          <p className="mt-3 text-sm font-semibold text-(--color-ink)">
            Le forum est encore vide.
          </p>
          <p className="mt-1 text-xs text-(--color-ink-muted)">
            Pose ta première question depuis un cours — clique sur « Appeler un
            professeur » après une réponse de l’IA pour transférer la conversation.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {rows.map((r) => {
            const answered = (r.forum_answers ?? []).length > 0;
            return (
              <article
                key={r.id}
                className="group relative overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-(--shadow-soft) transition-shadow hover:shadow-(--shadow-lifted)"
              >
                {/* Ruban gauche : rouge si en attente, vert si répondue. */}
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 w-1"
                  style={{
                    background: answered
                      ? 'linear-gradient(180deg,#16A34A 0%,#84CC16 100%)'
                      : 'linear-gradient(180deg,#E4002B 0%,#F97316 100%)',
                  }}
                />

                {/* Bloc question */}
                <div className="flex gap-3.5 p-5 sm:gap-4 sm:p-6">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#FDE7E9,#FFEAD9)] text-sm font-bold text-(--color-primary)">
                    {initials(r.student_pseudo)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-semibold text-(--color-ink)">{r.student_pseudo}</span>
                      <span className="flex items-center gap-1 text-(--color-ink-muted)">
                        <Clock className="h-3 w-3" />
                        {ago(r.created_at)}
                      </span>
                      {(r.cours_titre || r.matiere_nom) && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-(--color-primary-soft) px-2 py-0.5 text-[11px] font-semibold text-(--color-primary-deep)">
                          <Stethoscope className="h-3 w-3" />
                          {r.cours_titre ?? r.matiere_nom}
                        </span>
                      )}
                      {!answered && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF3E2] px-2 py-0.5 text-[11px] font-semibold text-[#B26A00]">
                          En attente
                        </span>
                      )}
                      {answered && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#E7F6EC] px-2 py-0.5 text-[11px] font-semibold text-[#16793C]">
                          <CheckCircle2 className="h-3 w-3" />
                          Répondue
                        </span>
                      )}
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-(--color-ink)">
                      {r.body}
                    </p>
                  </div>
                </div>

                {/* Réponses prof */}
                {(r.forum_answers ?? []).map((a) => (
                  <div
                    key={a.id}
                    className="border-t border-(--color-border) px-5 py-4 sm:px-6"
                    style={{
                      background:
                        'linear-gradient(135deg, #F0FDF4 0%, #F5F3FF 100%)',
                    }}
                  >
                    <div className="flex gap-3.5 sm:gap-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#E7F6EC,#F1E8FD)] text-[#16793C]">
                        <GraduationCap className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-semibold text-(--color-ink)">
                            {a.professor_name}
                          </span>
                          <span className="rounded-full bg-[#E7F6EC] px-2 py-0.5 text-[11px] font-semibold text-[#16793C]">
                            Professeur
                          </span>
                          <span className="flex items-center gap-1 text-(--color-ink-muted)">
                            <Clock className="h-3 w-3" />
                            {ago(a.created_at)}
                          </span>
                        </div>
                        <Markdown className="mt-2 text-sm text-(--color-ink)">
                          {a.body}
                        </Markdown>
                      </div>
                    </div>
                  </div>
                ))}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

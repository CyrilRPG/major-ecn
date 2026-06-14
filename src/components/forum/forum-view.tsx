'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import {
  CheckCircle2, ChevronDown, ChevronUp, Clock, Eye, EyeOff, GraduationCap, Lock,
  Loader2, MessageCircleQuestion, MessagesSquare, Pencil, Reply, Search, Send,
  Sparkles, Stethoscope, Unlock, Users,
} from 'lucide-react';
import { Markdown } from '@/components/ui/markdown';
import { ForumQuestionForm } from '@/components/student/forum-question-form';
import {
  addReplyAction, postProfessorAnswerAction, toggleQuestionPublicAction,
} from '@/app/(student)/forum/actions';

export type ForumCollege = { id: string; nom: string; cours: { id: string; titre: string }[] };
export type ForumAnswer = { id: string; body: string; created_at: string; professor_name: string };
export type ForumReply = {
  id: string;
  body: string;
  created_at: string;
  author_role: 'student' | 'professor' | 'admin';
  author_name: string;
};
export type ForumQuestionRow = {
  id: string;
  body: string;
  ai_context?: string | null;
  created_at: string;
  student_id: string;
  student_pseudo: string;
  cours_id?: string | null;
  cours_titre: string | null;
  matiere_id: string | null;
  matiere_nom: string | null;
  is_public: boolean;
  status: 'pending' | 'answered' | 'archived' | string;
  forum_answers: ForumAnswer[];
  forum_replies?: ForumReply[];
};

type Role = 'student' | 'professor' | 'admin';
type Tab = 'public' | 'private';

export function ForumView({
  role, currentUserId, rows, matieres, collegesForForm,
  activeMatiere, activeQuery, activeFilter, activeTab,
}: {
  role: Role;
  currentUserId: string;
  rows: ForumQuestionRow[];
  matieres: [string, string][];
  collegesForForm: ForumCollege[];
  activeMatiere: string | null;
  activeQuery: string | null;
  activeFilter: 'all' | 'pending' | 'answered' | 'public' | 'private';
  activeTab: Tab;
}) {
  const totalAnswered = rows.filter((r) => (r.forum_answers ?? []).length > 0).length;
  const totalPending = rows.length - totalAnswered;
  const totalThread = rows.reduce(
    (acc, r) => acc + (r.forum_answers?.length ?? 0) + (r.forum_replies?.length ?? 0),
    0,
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <Hero role={role} stats={{ total: rows.length, answered: totalAnswered, pending: totalPending, threadMessages: totalThread }} />

      {role === 'student' && <ForumQuestionForm colleges={collegesForForm} />}

      <TabsBar role={role} activeTab={activeTab} activeMatiere={activeMatiere} activeQuery={activeQuery} activeFilter={activeFilter} />

      <FiltersBar
        role={role}
        activeFilter={activeFilter}
        activeQuery={activeQuery}
        activeMatiere={activeMatiere}
        activeTab={activeTab}
        matieres={matieres}
      />

      {rows.length === 0 ? (
        <EmptyState role={role} activeTab={activeTab} />
      ) : (
        <div className="mt-6 space-y-3">
          {rows.map((r) => (
            <QuestionCard key={r.id} q={r} role={role} currentUserId={currentUserId} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ───────────────────── Hero ───────────────────── */
function Hero({ role, stats }: { role: Role; stats: { total: number; answered: number; pending: number; threadMessages: number } }) {
  const isStudent = role === 'student';
  const title = isStudent
    ? 'Posez votre question, un prof vous répond.'
    : role === 'professor'
    ? 'Vos questions à traiter'
    : 'Modération du forum';
  const subtitle = isStudent
    ? 'Choisissez l’onglet « Public » pour parcourir toutes les questions de la promo, ou « Mes questions » pour retrouver vos propres discussions.'
    : 'Onglet « Public » : ce que voient tous les élèves. Onglet « Privé » : questions encore privées (1‑à‑1). Vous pouvez promouvoir une question privée en publique à tout moment.';

  const kpis = isStudent
    ? [
        { Icon: MessagesSquare, label: 'questions visibles', value: stats.total, accent: '#E4002B', bg: '#FDE7E9' },
        { Icon: CheckCircle2,   label: 'avec réponse',       value: stats.answered, accent: '#16A34A', bg: '#E7F6EC' },
        { Icon: Reply,          label: 'messages au total',  value: stats.threadMessages, accent: '#1E4D8B', bg: '#E5F1FF' },
      ]
    : [
        { Icon: Clock,          label: 'en attente',  value: stats.pending,  accent: '#B26A00', bg: '#FEF3E2' },
        { Icon: CheckCircle2,   label: 'répondues',   value: stats.answered, accent: '#16A34A', bg: '#E7F6EC' },
        { Icon: Reply,          label: 'échanges',    value: stats.threadMessages, accent: '#1E4D8B', bg: '#E5F1FF' },
      ];

  return (
    <section
      className="relative overflow-hidden rounded-3xl border border-(--color-border) p-6 shadow-(--shadow-soft) sm:p-8"
      style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF3F4 45%, #F0EAFF 100%)' }}
    >
      <span aria-hidden className="pointer-events-none absolute -right-12 -top-10 h-52 w-52 rounded-full bg-[#E4002B] opacity-[0.08] blur-3xl" />
      <span aria-hidden className="pointer-events-none absolute -bottom-16 -left-8 h-52 w-52 rounded-full bg-[#7C3AED] opacity-[0.08] blur-3xl" />
      <div className="relative grid gap-5 lg:grid-cols-[1.5fr_1fr] lg:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-(--color-primary) backdrop-blur">
            <MessageCircleQuestion className="h-3.5 w-3.5" />
            Forum Q&amp;R · {role === 'student' ? 'Élève' : role === 'professor' ? 'Espace prof' : 'Modération'}
          </span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-(--color-ink) sm:text-3xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-(--color-ink-soft)">{subtitle}</p>
        </div>
        <div className="grid gap-3 grid-cols-3">
          {kpis.map((s) => (
            <div key={s.label} className="flex items-center gap-2.5 rounded-2xl border border-white/60 bg-white/85 px-3 py-2.5 shadow-(--shadow-soft) backdrop-blur">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: s.bg, color: s.accent }}>
                <s.Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xl font-bold leading-none tabular-nums" style={{ color: s.accent }}>{s.value}</p>
                <p className="mt-1 text-[10px] leading-tight text-(--color-ink-muted)">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── Tabs Public / Privé ───────────────────── */
function TabsBar({
  role, activeTab, activeMatiere, activeQuery, activeFilter,
}: {
  role: Role;
  activeTab: Tab;
  activeMatiere: string | null;
  activeQuery: string | null;
  activeFilter: 'all' | 'pending' | 'answered' | 'public' | 'private';
}) {
  const tabs: { key: Tab; label: string; Icon: typeof Users; description: string }[] = role === 'student'
    ? [
        { key: 'public',  label: 'Forum public', Icon: Users,   description: 'Visible par toute la promo' },
        { key: 'private', label: 'Mes questions', Icon: Lock,   description: 'Vos discussions, publiques ou non' },
      ]
    : [
        { key: 'public',  label: 'Public', Icon: Eye,  description: 'Questions visibles par les élèves' },
        { key: 'private', label: 'Privé',  Icon: Lock, description: 'Questions privées (1‑à‑1)' },
      ];

  const hrefFor = (t: Tab) => {
    const p = new URLSearchParams();
    if (t !== 'public') p.set('tab', t);
    if (activeMatiere) p.set('matiere', activeMatiere);
    if (activeQuery) p.set('q', activeQuery);
    if (activeFilter !== 'all') p.set('filter', activeFilter);
    return `/forum${p.toString() ? `?${p}` : ''}`;
  };

  return (
    <div className="mt-6 inline-flex rounded-2xl border border-(--color-border) bg-(--color-surface) p-1 shadow-(--shadow-soft)">
      {tabs.map((t) => {
        const active = activeTab === t.key;
        return (
          <Link
            key={t.key}
            href={hrefFor(t.key)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
              active
                ? 'bg-[linear-gradient(90deg,#E4002B_0%,#F97316_100%)] text-white shadow-sm'
                : 'text-(--color-ink-soft) hover:text-(--color-ink)'
            }`}
            title={t.description}
          >
            <t.Icon className="h-4 w-4" />
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}

/* ───────────────────── Filtres + recherche ───────────────────── */
function FiltersBar({
  role, activeFilter, activeQuery, activeMatiere, activeTab, matieres,
}: {
  role: Role;
  activeFilter: 'all' | 'pending' | 'answered' | 'public' | 'private';
  activeQuery: string | null;
  activeMatiere: string | null;
  activeTab: Tab;
  matieres: [string, string][];
}) {
  // L'onglet public/privé remplace les filtres public/private — on les retire.
  const filters: { key: typeof activeFilter; label: string }[] = role === 'student'
    ? [
        { key: 'all',      label: 'Tout' },
        { key: 'answered', label: 'Avec réponse' },
        { key: 'pending',  label: 'En attente' },
      ]
    : [
        { key: 'all',      label: 'Toutes' },
        { key: 'pending',  label: 'En attente' },
        { key: 'answered', label: 'Répondues' },
      ];

  const tabParam = activeTab !== 'public' ? `tab=${activeTab}` : '';
  const buildHref = (extra: URLSearchParams) => {
    if (activeTab !== 'public') extra.set('tab', activeTab);
    return `/forum${extra.toString() ? `?${extra}` : ''}`;
  };

  return (
    <div className="mt-4 space-y-3">
      <form method="GET" className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-ink-muted)" />
          <input
            type="search"
            name="q"
            defaultValue={activeQuery ?? ''}
            placeholder="Rechercher dans les questions…"
            className="w-full rounded-2xl border border-(--color-border) bg-(--color-surface) px-4 py-2.5 pl-10 text-sm text-(--color-ink) outline-none transition-colors focus:border-(--color-primary)"
          />
        </div>
        {activeMatiere && <input type="hidden" name="matiere" value={activeMatiere} />}
        {activeFilter !== 'all' && <input type="hidden" name="filter" value={activeFilter} />}
        {activeTab !== 'public' && <input type="hidden" name="tab" value={activeTab} />}
        <button
          type="submit"
          className="rounded-2xl bg-[linear-gradient(90deg,#E4002B_0%,#F97316_100%)] px-5 py-2.5 text-sm font-semibold text-white shadow-(--shadow-soft) transition-transform hover:scale-[1.02]"
        >
          Rechercher
        </button>
      </form>

      <div className="flex flex-wrap gap-1.5">
        {filters.map((f) => {
          const active = activeFilter === f.key;
          const params = new URLSearchParams();
          if (f.key !== 'all') params.set('filter', f.key);
          if (activeMatiere) params.set('matiere', activeMatiere);
          if (activeQuery) params.set('q', activeQuery);
          const href = buildHref(params);
          return (
            <Link
              key={f.key}
              href={href}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                active
                  ? 'bg-[linear-gradient(90deg,#E4002B_0%,#F97316_100%)] text-white shadow-(--shadow-soft)'
                  : 'border border-(--color-border) bg-(--color-surface) text-(--color-ink-soft) hover:text-(--color-ink)'
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {matieres.length > 1 && (
        <div className="flex flex-wrap gap-1.5 border-t border-(--color-border)/60 pt-3">
          <Link
            href={(() => {
              const p = new URLSearchParams();
              if (activeQuery) p.set('q', activeQuery);
              if (activeFilter !== 'all') p.set('filter', activeFilter);
              return buildHref(p);
            })()}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              !activeMatiere
                ? 'bg-(--color-primary) text-white shadow-sm'
                : 'border border-(--color-border) bg-(--color-surface) text-(--color-ink-soft) hover:text-(--color-ink)'
            }`}
          >
            Toutes matières
          </Link>
          {matieres.map(([id, nom]) => {
            const p = new URLSearchParams({ matiere: id });
            if (activeQuery) p.set('q', activeQuery);
            if (activeFilter !== 'all') p.set('filter', activeFilter);
            const href = buildHref(p);
            return (
              <Link
                key={id}
                href={href}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  activeMatiere === id
                    ? 'bg-(--color-primary) text-white shadow-sm'
                    : 'border border-(--color-border) bg-(--color-surface) text-(--color-ink-soft) hover:text-(--color-ink)'
                }`}
              >
                {nom}
              </Link>
            );
          })}
        </div>
      )}
      {tabParam && <input type="hidden" value={tabParam} aria-hidden />}
    </div>
  );
}

/* ───────────────────── Empty state ───────────────────── */
function EmptyState({ role, activeTab }: { role: Role; activeTab: Tab }) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-(--color-border) bg-(--color-surface)/60 px-5 py-16 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-(--color-primary-soft) text-(--color-primary)">
        <Sparkles className="h-6 w-6" />
      </span>
      <p className="mt-3 text-sm font-semibold text-(--color-ink)">
        {activeTab === 'private'
          ? role === 'student'
            ? 'Vous n’avez pas encore posé de question.'
            : 'Aucune question privée pour ce périmètre.'
          : 'Aucune question publique pour le moment.'}
      </p>
      <p className="mt-1 text-xs text-(--color-ink-muted)">
        {role === 'student' && activeTab === 'private'
          ? 'Posez votre première question depuis un cours — cliquez sur « Appeler un professeur » après une réponse de l’IA.'
          : 'Les nouvelles questions des élèves apparaîtront ici.'}
      </p>
    </div>
  );
}

/* ───────────────────── Carte question (repliable) ───────────────────── */
type ThreadItem =
  | { kind: 'answer'; data: ForumAnswer }
  | { kind: 'reply'; data: ForumReply };

function QuestionCard({
  q, role, currentUserId,
}: { q: ForumQuestionRow; role: Role; currentUserId: string }) {
  const answers = q.forum_answers ?? [];
  const replies = q.forum_replies ?? [];
  const answered = answers.length > 0;
  const isOwn = q.student_id === currentUserId;
  const isStaff = role === 'professor' || role === 'admin';
  const canReply = isStaff || (role === 'student' && isOwn);

  // Fusion réponses prof + replies, triés chronologiquement.
  const thread: ThreadItem[] = [
    ...answers.map<ThreadItem>((a) => ({ kind: 'answer', data: a })),
    ...replies.map<ThreadItem>((r) => ({ kind: 'reply', data: r })),
  ].sort((a, b) => new Date(a.data.created_at).getTime() - new Date(b.data.created_at).getTime());

  const messageCount = thread.length;

  // Repliable : par défaut fermé, sauf si pas de réponse (carte plus simple).
  const [open, setOpen] = useState(messageCount === 0);
  const [replyMode, setReplyMode] = useState<null | 'answer' | 'reply'>(null);

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-(--shadow-soft) transition-shadow hover:shadow-(--shadow-lifted)">
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1"
        style={{
          background: answered
            ? 'linear-gradient(180deg,#16A34A 0%,#84CC16 100%)'
            : 'linear-gradient(180deg,#E4002B 0%,#F97316 100%)',
        }}
      />

      {/* Bloc question + bouton repliable */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start gap-3.5 p-5 text-left transition-colors hover:bg-(--color-surface-soft) sm:gap-4 sm:p-6"
        aria-expanded={open}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#FDE7E9,#FFEAD9)] text-sm font-bold text-(--color-primary)">
          {initials(q.student_pseudo)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-(--color-ink)">{q.student_pseudo}</span>
            {isOwn && (
              <span className="rounded-full bg-(--color-primary-soft) px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-(--color-primary-deep)">
                Vous
              </span>
            )}
            <span className="flex items-center gap-1 text-(--color-ink-muted)">
              <Clock className="h-3 w-3" />
              {ago(q.created_at)}
            </span>
            {(q.cours_titre || q.matiere_nom) && (
              <span className="inline-flex items-center gap-1 rounded-full bg-(--color-primary-soft) px-2 py-0.5 text-[11px] font-semibold text-(--color-primary-deep)">
                <Stethoscope className="h-3 w-3" />
                {q.cours_titre ?? q.matiere_nom}
              </span>
            )}
            {!answered ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF3E2] px-2 py-0.5 text-[11px] font-semibold text-[#B26A00]">
                En attente
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#E7F6EC] px-2 py-0.5 text-[11px] font-semibold text-[#16793C]">
                <CheckCircle2 className="h-3 w-3" />
                Répondue
              </span>
            )}
            {isStaff && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  q.is_public ? 'bg-[#E5F1FF] text-[#1E4D8B]' : 'bg-(--color-sand-100) text-(--color-ink-soft)'
                }`}
              >
                {q.is_public ? <Eye className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                {q.is_public ? 'Publique' : 'Privée'}
              </span>
            )}
          </div>
          <p className="mt-2 line-clamp-2 whitespace-pre-wrap text-sm leading-relaxed text-(--color-ink)">
            {q.body}
          </p>
          {/* Compteur de réponses */}
          <div className="mt-2.5 flex items-center gap-2 text-[11.5px] text-(--color-ink-muted)">
            <Reply className="h-3.5 w-3.5" />
            <span>
              {messageCount === 0
                ? 'Aucune réponse pour l’instant'
                : messageCount === 1
                ? '1 message dans la discussion'
                : `${messageCount} messages dans la discussion`}
            </span>
          </div>
        </div>
        <span
          className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-ink-soft) transition-transform"
          aria-hidden
        >
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>

      {/* Bloc déplié : question complète + thread + actions */}
      {open && (
        <>
          {/* Question complète (si tronquée) */}
          <div className="border-t border-(--color-border) px-5 pb-2 pt-4 text-sm leading-relaxed text-(--color-ink) sm:px-6">
            <p className="whitespace-pre-wrap">{q.body}</p>
          </div>

          {/* Thread : réponses prof + replies, chronologique */}
          {thread.map((it) => (
            <ThreadMessage key={`${it.kind}-${it.data.id}`} item={it} />
          ))}

          {/* Footer actions */}
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-(--color-border) bg-(--color-surface-soft) px-5 py-3 sm:px-6">
            {/* Élève : peut répondre dans son propre thread */}
            {role === 'student' && isOwn && replyMode === null && (
              <button
                type="button"
                onClick={() => setReplyMode('reply')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-(--color-border) bg-white px-3 py-1.5 text-xs font-semibold text-(--color-ink) hover:border-(--color-primary)"
              >
                <Reply className="h-3 w-3" /> Répondre
              </button>
            )}
            {/* Staff : répondre officiellement (forum_answers) */}
            {isStaff && replyMode === null && (
              <>
                <button
                  type="button"
                  onClick={() => setReplyMode('answer')}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[linear-gradient(90deg,#E4002B_0%,#F97316_100%)] px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:scale-[1.02]"
                >
                  <Pencil className="h-3 w-3" /> {answered ? 'Ajouter une réponse' : 'Répondre officiellement'}
                </button>
                <button
                  type="button"
                  onClick={() => setReplyMode('reply')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-(--color-border) bg-white px-3 py-1.5 text-xs font-semibold text-(--color-ink) hover:border-(--color-primary)"
                >
                  <Reply className="h-3 w-3" /> Message rapide
                </button>
                <TogglePublicButton questionId={q.id} isPublic={q.is_public} />
              </>
            )}
          </div>

          {/* Formulaires */}
          {replyMode === 'answer' && isStaff && (
            <AnswerForm
              questionId={q.id}
              currentIsPublic={q.is_public}
              onClose={() => setReplyMode(null)}
            />
          )}
          {replyMode === 'reply' && canReply && (
            <ReplyForm
              questionId={q.id}
              onClose={() => setReplyMode(null)}
            />
          )}
        </>
      )}
    </article>
  );
}

/* ───────────────────── Thread message ───────────────────── */
function ThreadMessage({ item }: { item: ThreadItem }) {
  if (item.kind === 'answer') {
    const a = item.data;
    return (
      <div
        className="border-t border-(--color-border) px-5 py-4 sm:px-6"
        style={{ background: 'linear-gradient(135deg, #F0FDF4 0%, #F5F3FF 100%)' }}
      >
        <div className="flex gap-3.5 sm:gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#E7F6EC,#F1E8FD)] text-[#16793C]">
            <GraduationCap className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-(--color-ink)">{a.professor_name}</span>
              <span className="rounded-full bg-[#E7F6EC] px-2 py-0.5 text-[11px] font-semibold text-[#16793C]">Professeur</span>
              <span className="flex items-center gap-1 text-(--color-ink-muted)">
                <Clock className="h-3 w-3" />
                {ago(a.created_at)}
              </span>
            </div>
            <Markdown className="mt-2 text-sm text-(--color-ink)">{a.body}</Markdown>
          </div>
        </div>
      </div>
    );
  }
  const r = item.data;
  const isStaff = r.author_role === 'professor' || r.author_role === 'admin';
  return (
    <div
      className="border-t border-(--color-border) px-5 py-4 sm:px-6"
      style={{
        background: isStaff
          ? 'linear-gradient(135deg, #FFF8EC 0%, #F5F3FF 100%)'
          : '#FFFFFF',
      }}
    >
      <div className="flex gap-3.5 sm:gap-4">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          isStaff
            ? 'bg-[linear-gradient(135deg,#FEF3E2,#F1E8FD)] text-[#B26A00]'
            : 'bg-[linear-gradient(135deg,#FDE7E9,#FFEAD9)] text-(--color-primary)'
        }`}>
          {initials(r.author_name)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-(--color-ink)">{r.author_name}</span>
            {r.author_role === 'student' && (
              <span className="rounded-full bg-(--color-primary-soft) px-2 py-0.5 text-[11px] font-semibold text-(--color-primary-deep)">
                Étudiant
              </span>
            )}
            {r.author_role === 'professor' && (
              <span className="rounded-full bg-[#E7F6EC] px-2 py-0.5 text-[11px] font-semibold text-[#16793C]">
                Professeur
              </span>
            )}
            {r.author_role === 'admin' && (
              <span className="rounded-full bg-[#E5F1FF] px-2 py-0.5 text-[11px] font-semibold text-[#1E4D8B]">
                Admin
              </span>
            )}
            <span className="flex items-center gap-1 text-(--color-ink-muted)">
              <Clock className="h-3 w-3" />
              {ago(r.created_at)}
            </span>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-(--color-ink)">{r.body}</p>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── Toggle public ───────────────────── */
function TogglePublicButton({ questionId, isPublic }: { questionId: string; isPublic: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const onClick = () => {
    setErr(null);
    start(async () => {
      const res = await toggleQuestionPublicAction(questionId);
      if ('error' in res) setErr(res.error);
      else router.refresh();
    });
  };
  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
          isPublic
            ? 'border-[#E5F1FF] bg-[#E5F1FF] text-[#1E4D8B] hover:border-[#1E4D8B]'
            : 'border-(--color-border) bg-white text-(--color-ink) hover:border-[#16A34A] hover:text-[#16793C]'
        } disabled:opacity-50`}
        title={isPublic ? 'Repasser la question en privé' : 'Rendre la question publique pour toute la promo'}
      >
        {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : isPublic ? <EyeOff className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
        {isPublic ? 'Repasser en privé' : 'Rendre publique'}
      </button>
      {err && <p className="text-[11px] text-(--color-danger)">{err}</p>}
    </>
  );
}

/* ───────────────────── Form de réponse (prof, forum_answers) ───────────────────── */
function AnswerForm({
  questionId, currentIsPublic, onClose,
}: { questionId: string; currentIsPublic: boolean; onClose: () => void }) {
  const router = useRouter();
  const [body, setBody] = useState('');
  const [makePublic, setMakePublic] = useState(!currentIsPublic);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const submit = () => {
    setErr(null);
    start(async () => {
      const res = await postProfessorAnswerAction({ questionId, body, makePublic });
      if ('error' in res) setErr(res.error);
      else { setBody(''); onClose(); router.refresh(); }
    });
  };

  return (
    <div className="border-t border-(--color-border) bg-[#F8FAFF] p-4 sm:p-5">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-(--color-ink-muted)">
        Réponse officielle (Markdown supporté)
      </p>
      <textarea
        rows={6}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Rédigez votre réponse pédagogique. Vous pouvez utiliser **gras**, *italique*, listes, citations…"
        className="w-full resize-y rounded-xl border border-(--color-border) bg-white px-3 py-2.5 text-sm text-(--color-ink) outline-none focus:border-(--color-primary)"
      />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <label className="inline-flex cursor-pointer items-center gap-2 text-[12.5px] text-(--color-ink)">
          <input
            type="checkbox"
            checked={makePublic}
            onChange={(e) => setMakePublic(e.target.checked)}
            className="h-4 w-4 rounded border-(--color-border)"
          />
          Rendre la question + ma réponse <strong className="text-(--color-primary)">publiques</strong> pour toute la promo
        </label>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-(--color-border) bg-white px-3 py-1.5 text-xs font-semibold text-(--color-ink-soft) hover:text-(--color-ink)">
            Annuler
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={pending || body.trim().length < 8}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[linear-gradient(90deg,#E4002B_0%,#F97316_100%)] px-3.5 py-1.5 text-xs font-bold text-white disabled:opacity-50"
          >
            {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
            Publier la réponse
          </button>
        </div>
      </div>
      {err && <p className="mt-2 text-[11px] text-(--color-danger)">{err}</p>}
    </div>
  );
}

/* ───────────────────── Form de reply (élève ou prof, forum_replies) ───────────────────── */
function ReplyForm({
  questionId, onClose,
}: { questionId: string; onClose: () => void }) {
  const router = useRouter();
  const [body, setBody] = useState('');
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const submit = () => {
    setErr(null);
    start(async () => {
      const res = await addReplyAction({ questionId, body });
      if ('error' in res) setErr(res.error);
      else { setBody(''); onClose(); router.refresh(); }
    });
  };

  return (
    <div className="border-t border-(--color-border) bg-[#FFFCF5] p-4 sm:p-5">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-(--color-ink-muted)">
        Ajouter à la discussion
      </p>
      <textarea
        rows={4}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Continuez l’échange directement ici — pas besoin de recréer une nouvelle question."
        className="w-full resize-y rounded-xl border border-(--color-border) bg-white px-3 py-2.5 text-sm text-(--color-ink) outline-none focus:border-(--color-primary)"
      />
      <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
        <button type="button" onClick={onClose} className="rounded-lg border border-(--color-border) bg-white px-3 py-1.5 text-xs font-semibold text-(--color-ink-soft) hover:text-(--color-ink)">
          Annuler
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={pending || body.trim().length < 1}
          className="inline-flex items-center gap-1.5 rounded-lg bg-(--color-primary) px-3.5 py-1.5 text-xs font-bold text-white disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
          Envoyer
        </button>
      </div>
      {err && <p className="mt-2 text-[11px] text-(--color-danger)">{err}</p>}
    </div>
  );
}

/* ───────────────────── Helpers ───────────────────── */
function ago(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const h = Math.round(ms / 3600_000);
  if (h < 1) return "à l'instant";
  if (h < 24) return `il y a ${h} h`;
  const d = Math.round(h / 24);
  if (d < 7) return d === 1 ? 'hier' : `il y a ${d} j`;
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function initials(s: string): string {
  return s.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?';
}

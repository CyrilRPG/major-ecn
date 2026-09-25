import { Bot, MessagesSquare } from 'lucide-react';
import { requireOnglet } from '@/lib/auth/require-role';
import { ongletsDe, scopeEquipeResolu } from '@/lib/auth/onglets-equipe';
import { collegesDesQuestions, questionDansPerimetre } from '@/lib/auth/collaborateurs';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { identitePourLecteur, loadStudentIdentities, loadStudentScopes, type LecteurIdentite } from '@/lib/admin/student-identity';
import { QaRow, type QaQuestionView } from '@/components/admin/qa/qa-row';
import { AiQuestionsTable, type AiQuestionRow } from '@/components/admin/qa/ai-questions-table';

export const metadata = { title: 'Questions / Réponses' };

type SearchParams = { section?: string; status?: string };

export default async function AdminQaPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // Réservé aux enseignants (et aux administrateurs) : un monteur vidéo, un
  // commercial ou un rédacteur n'ont pas à lire ni à répondre au forum.
  const { profile, isAdmin } = await requireOnglet('qa');
  // Périmètre d'un enseignant : les questions des collèges qui lui sont
  // ouverts (colonne `matiere_id` de la question). 'toutes' = sans filtre ;
  // une question hors cours suit la spécialité de l'élève (même règle que le
  // mail « Nouvelle question » et les actions : `questionDansPerimetre`).
  const scopeEquipe = isAdmin ? null : await scopeEquipeResolu(profile);
  const perimetre = isAdmin ? 'toutes' : collegesDesQuestions(scopeEquipe);
  // Filtre SQL : collèges du périmètre + questions hors cours (triées ensuite).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filtreSql = (q: any) => (perimetre === 'toutes' ? q
    : q.or(perimetre.length > 0 ? `matiere_id.in.(${perimetre.join(',')}),matiere_id.is.null` : 'matiere_id.is.null'));
  const garderHorsCours = async <T extends { matiere_id: string | null; student_id: string | null }>(rows: T[]): Promise<T[]> => {
    if (perimetre === 'toutes') return rows;
    const scopes = await loadStudentScopes(createAdminClient(), rows.filter((r) => !r.matiere_id).map((r) => r.student_id));
    return rows.filter((r) => r.matiere_id || questionDansPerimetre(scopeEquipe, null, r.student_id ? scopes.get(r.student_id) : undefined));
  };
  // Identité de l'élève : nom et prénom pour tous ; l'e-mail reste réservé aux
  // administrateurs, le lien vers la fiche à qui a le module Suivi élèves.
  const lecteur: LecteurIdentite = { admin: isAdmin, suivi: isAdmin || (await ongletsDe(profile)).suivi };
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
      .select('id, body, ai_context, created_at, student_id, student_pseudo, matiere_id, cours_titre, matiere_nom, status, is_public, forum_answers(id, body, created_at, professor_name)')
      .order('created_at', { ascending: false });
    if (forumStatus !== 'all') query = query.eq('status', forumStatus);
    query = filtreSql(query);
    const { data: brut } = await query;
    type LigneForum = {
      id: string; body: string; ai_context: string | null; created_at: string;
      student_id: string | null; student_pseudo: string; matiere_id: string | null; cours_titre: string | null; matiere_nom: string | null;
      status: 'pending' | 'answered' | 'archived'; is_public: boolean;
      forum_answers: Array<{ id: string; body: string; created_at: string; professor_name: string }>;
    };
    const data = await garderHorsCours((brut ?? []) as LigneForum[]);
    // Le pseudo automatique ne dit pas QUI écrit : l'équipe doit pouvoir
    // répondre par mail et ouvrir le profil (spécialité, voie, formule).
    const identites = await loadStudentIdentities(
      createAdminClient(),
      data.map((r) => r.student_id),
    );
    forumRows = data.map<QaQuestionView>((r) => ({
      id: r.id,
      body: r.body,
      ai_context: r.ai_context,
      created_at: r.created_at,
      student_pseudo: r.student_pseudo,
      student: r.student_id && identites.get(r.student_id) ? identitePourLecteur(identites.get(r.student_id)!, lecteur) : null,
      cours_titre: r.cours_titre,
      matiere_nom: r.matiere_nom,
      status: r.status,
      is_public: r.is_public,
      answers: (r.forum_answers ?? []).sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      ),
    }));

    if (perimetre === 'toutes') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { count } = await (supabase as any)
        .from('forum_questions').select('id', { count: 'exact', head: true }).eq('status', 'pending');
      pendingCount = count ?? 0;
    } else {
      // Enseignant : compté après le tri des questions hors cours.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: attente } = await filtreSql((supabase as any)
        .from('forum_questions').select('id, matiere_id, student_id').eq('status', 'pending'));
      pendingCount = (await garderHorsCours((attente ?? []) as Array<{ matiere_id: string | null; student_id: string | null }>)).length;
    }
  }

  // ─── Section Questions IA ───
  let aiRows: AiQuestionRow[] = [];

  if (section === 'ia') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('ai_generations')
      .select('id, user_id, user_pseudo, user_offer, cours_id, cours_titre, user_question, ai_answer, created_at')
      .eq('feature', 'assistant_chat')
      .eq('status', 'success')
      .not('user_question', 'is', null)
      .order('created_at', { ascending: false })
      .limit(perimetre === 'toutes' ? 200 : 500);
    let brut = (data ?? []) as Array<Omit<AiQuestionRow, 'student'> & { user_id: string | null; cours_id: string | null }>;
    if (perimetre !== 'toutes') {
      // Même périmètre que le forum : les questions posées sur un item d'un
      // collège de l'enseignant, ou sans item par un élève de sa spécialité.
      // Collège de chaque item lu par tranches de 200.
      const coursIds = [...new Set(brut.map((r) => r.cours_id).filter((id): id is string => !!id))];
      const collegeDe = new Map<string, string>();
      for (let i = 0; i < coursIds.length; i += 200) {
        const { data: cours } = await createAdminClient()
          .from('cours').select('id, matiere_id').in('id', coursIds.slice(i, i + 200));
        for (const c of (cours ?? []) as { id: string; matiere_id: string }[]) collegeDe.set(c.id, c.matiere_id);
      }
      // Question sans item : elle suit la spécialité de l'élève.
      const scopes = await loadStudentScopes(createAdminClient(), brut.filter((r) => !(r.cours_id && collegeDe.get(r.cours_id))).map((r) => r.user_id));
      brut = brut.filter((r) => {
        const college = r.cours_id ? collegeDe.get(r.cours_id) ?? null : null;
        return questionDansPerimetre(scopeEquipe, college, r.user_id ? scopes.get(r.user_id) : undefined);
      }).slice(0, 200);
    }
    const identites = await loadStudentIdentities(createAdminClient(), brut.map((r) => r.user_id));
    aiRows = brut.map((r) => {
      const id = r.user_id ? identites.get(r.user_id) : undefined;
      return { ...r, student: id ? identitePourLecteur(id, lecteur) : null };
    });
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
              Aucune question dans cette catégorie pour l’instant.
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

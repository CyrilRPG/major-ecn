import { requireUser, getProfessorScope } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { parseScope, canAccessCollege, canAccessCours } from '@/lib/auth/permissions';
import { canRead, canWrite } from '@/lib/schemas/professor';
import { EDN_FACULTE_ID } from '@/lib/data/navigator';
import { ForumView, type ForumQuestionRow, type ForumCollege } from '@/components/forum/forum-view';

export const metadata = { title: 'Forum questions / réponses' };

type SearchParams = { matiere?: string; q?: string; filter?: string };

export default async function ForumPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { user, profile } = await requireUser();
  const sp = await searchParams;
  const supabase = await createClient();
  const role = profile.role as 'student' | 'admin' | 'professor';

  // ─── Arborescence collèges accessibles (pour le formulaire élève) ───
  const { data: facRaw } = await supabase
    .from('facultes')
    .select('semestres(matieres(id, nom, order_index, cours(id, titre, order_index)))')
    .eq('id', EDN_FACULTE_ID)
    .maybeSingle();
  type FacRow = { semestres?: { matieres?: Array<{
    id: string; nom: string; order_index: number | null;
    cours?: { id: string; titre: string; order_index: number | null }[] | null;
  }> }[] };
  const studentScope = parseScope(profile.permission_scope);
  const collegesForForm: ForumCollege[] = role === 'student'
    ? ((facRaw as unknown as FacRow | null)?.semestres ?? [])
        .flatMap((s) => s.matieres ?? [])
        .filter((m) => canAccessCollege(studentScope, m.id))
        .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
        .map((m) => ({
          id: m.id,
          nom: m.nom,
          cours: (m.cours ?? [])
            .filter((c) => canAccessCours(studentScope, m.id, c.id))
            .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
            .map((c) => ({ id: c.id, titre: c.titre })),
        }))
        .filter((m) => m.cours.length > 0)
    : [];

  // ─── Périmètre prof : ids de collèges accessibles avec ≥ une permission ───
  let profAccessibleMatiereIds: string[] | 'all' | null = null;
  if (role === 'professor') {
    const ps = getProfessorScope(profile.permission_scope);
    if (ps) {
      const hasAnyPerm = (['qcm', 'fiche', 'video', 'annale', 'flashcards'] as const)
        .some((t) => canRead(ps, t) || canWrite(ps, t));
      if (!hasAnyPerm) profAccessibleMatiereIds = [];
      else if (ps.type === 'all') profAccessibleMatiereIds = 'all';
      else profAccessibleMatiereIds = ps.colleges;
    } else {
      profAccessibleMatiereIds = [];
    }
  }

  // ─── Récupération des questions selon le rôle ───
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = (supabase as any)
    .from('forum_questions')
    .select('id, body, ai_context, created_at, student_id, student_pseudo, cours_id, cours_titre, matiere_nom, matiere_id, is_public, status, forum_answers(id, body, created_at, professor_name)')
    .order('created_at', { ascending: false })
    .limit(500);

  if (role === 'student') {
    // Élève : ses propres questions OU les questions publiques
    query = query.or(`student_id.eq.${user.id},is_public.eq.true`);
  } else if (role === 'professor') {
    // Prof : questions des collèges accessibles (matiere_id IN profIds)
    if (profAccessibleMatiereIds === null || (Array.isArray(profAccessibleMatiereIds) && profAccessibleMatiereIds.length === 0)) {
      // Aucun collège accessible : aucune question
      query = query.eq('id', '00000000-0000-0000-0000-000000000000');
    } else if (Array.isArray(profAccessibleMatiereIds)) {
      query = query.in('matiere_id', profAccessibleMatiereIds);
    }
    // 'all' → pas de filtre supplémentaire (admin-like)
  }
  // Admin : tout (pas de filtre)

  if (sp.matiere) query = query.eq('matiere_id', sp.matiere);

  const { data } = await query;
  let rows = (data ?? []) as ForumQuestionRow[];

  // Filtre client-side : recherche texte
  if (sp.q) {
    const needle = sp.q.toLowerCase();
    rows = rows.filter((r) => r.body.toLowerCase().includes(needle));
  }

  // Filtre client-side : "en attente" / "répondue" / "publiques" pour profs/admins
  if (sp.filter === 'pending') {
    rows = rows.filter((r) => (r.forum_answers ?? []).length === 0);
  } else if (sp.filter === 'answered') {
    rows = rows.filter((r) => (r.forum_answers ?? []).length > 0);
  } else if (sp.filter === 'public') {
    rows = rows.filter((r) => r.is_public);
  } else if (sp.filter === 'private') {
    rows = rows.filter((r) => !r.is_public);
  }

  // Liste des matières représentées (pour les chips)
  const matieres = Array.from(
    new Map(
      rows.filter((r) => r.matiere_id && r.matiere_nom).map((r) => [r.matiere_id!, r.matiere_nom!]),
    ).entries(),
  );

  return (
    <ForumView
      role={role}
      currentUserId={user.id}
      rows={rows}
      matieres={matieres}
      collegesForForm={collegesForForm}
      activeMatiere={sp.matiere ?? null}
      activeQuery={sp.q ?? null}
      activeFilter={(sp.filter as 'all' | 'pending' | 'answered' | 'public' | 'private' | undefined) ?? 'all'}
    />
  );
}

import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { parseScope, canAccessCollege, canAccessCours } from '@/lib/auth/permissions';
import { porteeQuestions, questionsDansPortee, type PorteeQuestions } from '@/lib/forum/routage';
import { EDN_FACULTE_ID } from '@/lib/data/navigator';
import { ForumView, type ForumQuestionRow, type ForumCollege } from '@/components/forum/forum-view';
import { lireQcmJoint } from '@/lib/forum/qcm-joint';

export const metadata = { title: 'Forum questions / réponses' };

type SearchParams = { matiere?: string; q?: string; filter?: string; tab?: string };

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
    .select('semestres(matieres(id, nom, order_index, parent_matiere_id, cours(id, titre, order_index)))')
    .eq('id', EDN_FACULTE_ID)
    .maybeSingle();
  type FacRow = { semestres?: { matieres?: Array<{
    id: string; nom: string; order_index: number | null; parent_matiere_id: string | null;
    cours?: { id: string; titre: string; order_index: number | null }[] | null;
  }> }[] };
  const studentScope = parseScope(profile.permission_scope);
  const toutesMatieres = ((facRaw as unknown as FacRow | null)?.semestres ?? []).flatMap((s) => s.matieres ?? []);
  const nomDe = new Map(toutesMatieres.map((m) => [m.id, m.nom]));
  // Un collège qui a des sous-collèges (médecine générale) : l'élève choisit le
  // sous-collège, qui désigne les professeurs référents de sa question.
  const parents = new Set(toutesMatieres.map((m) => m.parent_matiere_id).filter((id): id is string => !!id));
  const collegesForForm: ForumCollege[] = role === 'student'
    ? toutesMatieres
        .filter((m) => canAccessCollege(studentScope, m.id))
        .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
        .map((m) => ({
          id: m.id,
          nom: m.nom,
          parentNom: m.parent_matiere_id ? nomDe.get(m.parent_matiere_id) ?? null : parents.has(m.id) ? m.nom : null,
          estParent: parents.has(m.id),
          cours: (m.cours ?? [])
            .filter((c) => canAccessCours(studentScope, m.id, c.id))
            .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
            .map((c) => ({ id: c.id, titre: c.titre })),
        }))
        .filter((m) => m.cours.length > 0)
    : [];

  // ─── Périmètre prof : collèges dont il est professeur référent ───
  // Même règle que la page Q&R et le mail « Nouvelle question »
  // (`porteeQuestions`) : professeurs référents seulement — un monteur vidéo,
  // un commercial, un rédacteur blog ou un enseignant non référent ne voit
  // aucune question — bornés à leurs spécialités (en médecine générale, au
  // sous-collège ; questions hors collège : spécialité de l'élève).
  let profAccessibleMatiereIds: string[] | 'all' | null = null;
  let portee: PorteeQuestions | null = null;
  if (role === 'professor') {
    portee = await porteeQuestions(profile);
    profAccessibleMatiereIds = portee.specialites === 'toutes' ? 'all' : portee.specialites;
  }

  // ─── Onglet public/privé ───
  // - student : 'public' = questions publiques (de tout le monde), 'private' = MES questions à moi
  // - staff : 'public' = questions publiques, 'private' = questions privées (toutes confondues)
  const tab: 'public' | 'private' = sp.tab === 'private' ? 'private' : 'public';

  // ─── Récupération des questions selon le rôle ───
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = (supabase as any)
    .from('forum_questions')
    .select('id, body, ai_context, qcm_contexte, created_at, student_id, student_pseudo, cours_id, cours_titre, matiere_nom, matiere_id, is_public, status, forum_answers(id, body, created_at, professor_id, professor_name), forum_replies(id, body, created_at, author_id, author_role, author_name)')
    .order('created_at', { ascending: false })
    .limit(500);

  if (role === 'student') {
    // Élève :
    //  - onglet "public" : les questions publiques (de tout le monde, dont les siennes promues)
    //  - onglet "privé"  : SES propres questions, qu'elles soient publiques ou non
    if (tab === 'public') {
      query = query.eq('is_public', true);
    } else {
      query = query.eq('student_id', user.id);
    }
  } else if (role === 'professor') {
    // Prof : questions des collèges accessibles (matiere_id IN profIds)
    if (profAccessibleMatiereIds === null || (Array.isArray(profAccessibleMatiereIds) && profAccessibleMatiereIds.length === 0)) {
      // Aucun collège accessible : aucune question
      query = query.eq('id', '00000000-0000-0000-0000-000000000000');
    } else if (Array.isArray(profAccessibleMatiereIds)) {
      // Collèges du périmètre + questions hors cours, triées plus bas.
      query = query.or(`matiere_id.in.(${profAccessibleMatiereIds.join(',')}),matiere_id.is.null`);
    }
    // 'all' → pas de filtre supplémentaire (admin-like)
    // Onglet appliqué aussi pour le prof : public seul / privé seul.
    if (tab === 'public') query = query.eq('is_public', true);
    else query = query.eq('is_public', false);
  } else {
    // Admin : tout, filtré par l'onglet (public uniquement / privé uniquement).
    if (tab === 'public') query = query.eq('is_public', true);
    else query = query.eq('is_public', false);
  }

  if (sp.matiere) query = query.eq('matiere_id', sp.matiere);

  const { data } = await query;
  let rows = (data ?? []) as ForumQuestionRow[];

  // Question jointe d'un AUTRE élève (question rendue publique) : ni corrigé ni
  // réponse de son auteur dans la page — une question d'épreuve blanche ne
  // doit pas livrer ses réponses à qui ne l'a pas encore passée.
  if (role === 'student') {
    rows = rows.map((r) => {
      const joint = r.student_id !== user.id ? lireQcmJoint(r.qcm_contexte) : null;
      return joint
        ? { ...r, qcm_contexte: { ...joint, items: joint.items.map((it) => ({ ...it, correct: false })), reponseAttendue: null, reponseEleve: null } }
        : r;
    });
  }

  // Référent restreint : une question hors collège n'est gardée que si elle
  // relève de la spécialité de l'élève (`questionsDansPortee`).
  if (portee) {
    rows = await questionsDansPortee(portee, rows, (r) => ({ matiereId: r.matiere_id, eleveId: r.student_id }));
  }

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

  // Seulement les avatars des auteurs de messages déjà autorisés par la RLS.
  // Aucun autre champ de profil n'est exposé aux lecteurs du forum.
  const authorIds = [...new Set(rows.flatMap(row => [
    row.student_id,
    ...(row.forum_answers ?? []).map(answer => answer.professor_id),
    ...(row.forum_replies ?? []).map(reply => reply.author_id),
  ]).filter((id): id is string => !!id))];
  const admin = createAdminClient();
  const avatarMap = new Map<string, string | null>();
  for (let offset = 0; offset < authorIds.length; offset += 200) {
    const { data: avatars, error } = await admin.from('profiles')
      .select('id, avatar_seed').in('id', authorIds.slice(offset, offset + 200));
    if (error) throw error;
    for (const avatar of avatars ?? []) avatarMap.set(avatar.id, avatar.avatar_seed);
  }
  rows = rows.map(row => ({
    ...row,
    student_avatar_seed: avatarMap.get(row.student_id),
    forum_answers: row.forum_answers.map(answer => ({ ...answer, avatar_seed: avatarMap.get(answer.professor_id ?? '') })),
    forum_replies: row.forum_replies?.map(reply => ({ ...reply, avatar_seed: avatarMap.get(reply.author_id ?? '') })),
  }));

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
      activeTab={tab}
    />
  );
}

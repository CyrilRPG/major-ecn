import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { parseScope, canAccessCollege } from '@/lib/auth/permissions';
import { EDN_FACULTE_ID } from '@/lib/data/navigator';
import {
  TransversalSession,
  type TransversalQuestion,
} from '@/components/student/transversal-session';

type Kind = 'daily' | 'recommended' | 'intensive' | 'reevaluation';

/** Tailles de session selon le `kind` demandé et le nb de spé étudiées. */
function sessionSize(kind: Kind, nbSpecs: number): number {
  if (kind === 'intensive') return 120;
  if (kind === 'reevaluation') return 75;
  if (kind === 'recommended') {
    if (nbSpecs <= 5) return 30;
    if (nbSpecs <= 10) return 50;
    if (nbSpecs <= 15) return 60;
    return 75;
  }
  // daily
  if (nbSpecs <= 5) return 25;
  if (nbSpecs <= 10) return 30;
  if (nbSpecs <= 15) return 35;
  return 40;
}

type AttemptRow = {
  question_id: string;
  is_correct: boolean;
  qcm_questions: {
    qcm_series: { cours_id: string; cours: { matieres: { id: string; semestres: { faculte_id: string } } } };
  };
};
type QRow = {
  id: string;
  enonce: string;
  order_index: number;
  qcm_items: { id: string; lettre: string; enonce: string; justification: string; is_correct: boolean }[] | null;
  qcm_series: {
    cours_id: string;
    cours: { matieres: { id: string; nom: string; semestres: { faculte_id: string } } };
  };
};

export default async function TransversalSessionPage({
  searchParams,
}: { searchParams: Promise<{ kind?: string }> }) {
  const { user, profile } = await requireUser();
  const scope = parseScope(profile.permission_scope);
  const sp = await searchParams;
  const kind: Kind = (['daily', 'recommended', 'intensive', 'reevaluation'].includes(sp.kind ?? '')
    ? sp.kind
    : 'daily') as Kind;

  const supabase = await createClient();

  /* 1) Cours « étudiés » : ceux où l'élève a activité (progress, attempts ou reviews). */
  const [{ data: progressRaw }, { data: attemptsRaw }] = await Promise.all([
    supabase
      .from('course_progress')
      .select('cours_id, video_watched, fiche_read')
      .eq('user_id', user.id),
    supabase
      .from('qcm_attempts')
      .select('question_id, is_correct, qcm_questions!inner(qcm_series!inner(cours_id, cours!inner(matieres!inner(id, semestres!inner(faculte_id)))))')
      .eq('user_id', user.id),
  ]);

  const studiedCoursIds = new Set<string>();
  for (const p of (progressRaw ?? []) as { cours_id: string; video_watched: boolean | null; fiche_read: boolean | null }[]) {
    if (p.video_watched || p.fiche_read) studiedCoursIds.add(p.cours_id);
  }

  /* 2) Compte les échecs par question (uniquement EDN + scope autorisé). */
  const failCount = new Map<string, number>();
  for (const a of ((attemptsRaw ?? []) as unknown as AttemptRow[])) {
    const m = a.qcm_questions.qcm_series.cours.matieres;
    if (m.semestres.faculte_id !== EDN_FACULTE_ID || !canAccessCollege(scope, m.id)) continue;
    studiedCoursIds.add(a.qcm_questions.qcm_series.cours_id);
    if (!a.is_correct) failCount.set(a.question_id, (failCount.get(a.question_id) ?? 0) + 1);
  }

  /* 3) Si aucune spécialité étudiée → on retourne sur la page d'accueil
        des révisions transversales (rien à réviser pour le moment). */
  if (studiedCoursIds.size === 0) redirect('/revisions-transversales');

  /* 4) Toutes les questions EDN accessibles dans les cours étudiés. */
  const { data: allQRaw } = await supabase
    .from('qcm_questions')
    .select('id, enonce, order_index, qcm_items(id, lettre, enonce, justification, is_correct), qcm_series!inner(cours_id, cours!inner(matieres!inner(id, nom, semestres!inner(faculte_id))))')
    .order('order_index');

  const allQ = ((allQRaw ?? []) as unknown as QRow[]).filter((q) => {
    const m = q.qcm_series.cours.matieres;
    if (m.semestres.faculte_id !== EDN_FACULTE_ID) return false;
    if (!canAccessCollege(scope, m.id)) return false;
    return studiedCoursIds.has(q.qcm_series.cours_id);
  });

  if (allQ.length === 0) redirect('/revisions-transversales');

  const N = Math.min(sessionSize(kind, studiedCoursIds.size), allQ.length);

  /* 5) Sélection : priorité aux questions déjà ratées (tri par nb d'échecs),
        puis on complète avec des questions du périmètre étudié.
        On mélange légèrement pour ne pas servir toujours la même séquence. */
  const byId = new Map(allQ.map((q) => [q.id, q]));
  const prioritized = [...failCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id)
    .filter((id) => byId.has(id));

  const picked = new Set<string>();
  const ordered: QRow[] = [];
  for (const id of prioritized) {
    if (ordered.length >= N) break;
    const q = byId.get(id);
    if (q && !picked.has(id)) { ordered.push(q); picked.add(id); }
  }
  if (ordered.length < N) {
    // Shuffle les non-piochées (Fisher-Yates simple) pour varier les sessions.
    const rest = allQ.filter((q) => !picked.has(q.id));
    for (let i = rest.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rest[i], rest[j]] = [rest[j], rest[i]];
    }
    for (const q of rest) {
      if (ordered.length >= N) break;
      ordered.push(q); picked.add(q.id);
    }
  }

  const questions: TransversalQuestion[] = ordered.slice(0, N).map((q) => ({
    id: q.id,
    enonce: q.enonce,
    college: q.qcm_series.cours.matieres.nom,
    cours_id: q.qcm_series.cours_id,
    items: [...(q.qcm_items ?? [])]
      .map((it) => ({ id: it.id, lettre: it.lettre, enonce: it.enonce, justification: it.justification, is_correct: it.is_correct }))
      .sort((a, b) => a.lettre.localeCompare(b.lettre)),
  }));

  return <TransversalSession questions={questions} kind={kind} />;
}

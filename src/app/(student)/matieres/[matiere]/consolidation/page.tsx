import { redirect, notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { canAccessCollege, parseScope } from '@/lib/auth/permissions';
import { EDN_FACULTE_ID } from '@/lib/data/navigator';
import { ConsolidationFlow } from './consolidation-flow';

export const metadata = { title: 'Consolidation' };

type QRow = {
  id: string;
  enonce: string;
  order_index: number;
  qcm_items: { id: string; lettre: string; enonce: string; justification: string; is_correct: boolean }[] | null;
  qcm_series: { cours_id: string };
};
type AttemptRow = { question_id: string; is_correct: boolean };

export default async function ConsolidationPage({ params }: { params: Promise<{ matiere: string }> }) {
  const { matiere } = await params;
  const { user, profile } = await requireUser();
  const supabase = await createClient();
  const scope = parseScope(profile.permission_scope);
  if (!canAccessCollege(scope, matiere)) redirect('/facultes');

  const { data: mat } = await supabase
    .from('matieres')
    .select('id, nom, semestres!inner(faculte_id)')
    .eq('id', matiere)
    .maybeSingle();
  if (!mat) notFound();
  const sem = mat.semestres as unknown as { faculte_id: string };
  if (sem.faculte_id !== EDN_FACULTE_ID) notFound();

  const matiereName = (mat as unknown as { nom: string }).nom;

  const { data: coursRaw } = await supabase
    .from('cours')
    .select('id')
    .eq('matiere_id', matiere);
  const coursIds = (coursRaw ?? []).map((c) => c.id);
  if (coursIds.length === 0) redirect(`/matieres/${matiere}`);

  const { data: seriesRaw } = await supabase
    .from('qcm_series')
    .select('id')
    .in('cours_id', coursIds);
  const serieIds = (seriesRaw ?? []).map((s) => s.id);
  if (serieIds.length === 0) redirect(`/matieres/${matiere}`);

  const [{ data: allQRaw }, { data: attemptsRaw }] = await Promise.all([
    supabase
      .from('qcm_questions')
      .select('id, enonce, order_index, qcm_items(id, lettre, enonce, justification, is_correct), qcm_series!inner(cours_id)')
      .in('serie_id', serieIds)
      .order('order_index'),
    supabase
      .from('qcm_attempts')
      .select('question_id, is_correct')
      .eq('user_id', user.id),
  ]);

  const allQ = ((allQRaw ?? []) as unknown as QRow[]).filter(
    (q) => q.qcm_items && q.qcm_items.length >= 3,
  );

  const failCount = new Map<string, number>();
  const qIds = new Set(allQ.map((q) => q.id));
  for (const a of ((attemptsRaw ?? []) as unknown as AttemptRow[])) {
    if (qIds.has(a.question_id) && !a.is_correct) {
      failCount.set(a.question_id, (failCount.get(a.question_id) ?? 0) + 1);
    }
  }

  const prioritized = [...failCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id);

  const byId = new Map(allQ.map((q) => [q.id, q]));
  const picked = new Set<string>();
  const consolidationQs: QRow[] = [];
  for (const id of prioritized) {
    if (consolidationQs.length >= 40) break;
    const q = byId.get(id);
    if (q && !picked.has(id)) { consolidationQs.push(q); picked.add(id); }
  }
  const rest = allQ.filter((q) => !picked.has(q.id));
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  for (const q of rest) {
    if (consolidationQs.length >= 40) break;
    consolidationQs.push(q); picked.add(q.id);
  }

  const miniEvalPool = allQ.filter((q) => !picked.has(q.id));
  for (let i = miniEvalPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [miniEvalPool[i], miniEvalPool[j]] = [miniEvalPool[j], miniEvalPool[i]];
  }
  const miniEvalQs = miniEvalPool.slice(0, Math.min(20, miniEvalPool.length));

  const mapQ = (q: QRow) => ({
    id: q.id,
    enonce: q.enonce,
    cours_id: q.qcm_series.cours_id,
    college: matiereName,
    items: [...(q.qcm_items ?? [])]
      .sort((a, b) => a.lettre.localeCompare(b.lettre))
      .map((it) => ({ id: it.id, lettre: it.lettre, enonce: it.enonce, justification: it.justification, is_correct: it.is_correct })),
  });

  return (
    <ConsolidationFlow
      matiereId={matiere}
      matiereName={matiereName}
      consolidationQuestions={consolidationQs.map(mapQ)}
      miniEvalQuestions={miniEvalQs.map(mapQ)}
    />
  );
}

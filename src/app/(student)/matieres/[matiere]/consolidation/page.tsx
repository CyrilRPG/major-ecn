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
type AttemptRow = { question_id: string; is_correct: boolean; attempted_at: string };

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
      .select('question_id, is_correct, attempted_at')
      .eq('user_id', user.id),
  ]);

  const allQ = ((allQRaw ?? []) as unknown as QRow[]).filter(
    (q) => q.qcm_items && q.qcm_items.length >= 3,
  );

  // Historique par question : nb d'échecs, jamais vue, ancienneté.
  const qIds = new Set(allQ.map((q) => q.id));
  const attemptStat = new Map<string, { fails: number; last: number }>();
  for (const a of ((attemptsRaw ?? []) as unknown as AttemptRow[])) {
    if (!qIds.has(a.question_id)) continue;
    const cur = attemptStat.get(a.question_id) ?? { fails: 0, last: 0 };
    if (!a.is_correct) cur.fails++;
    const t = new Date(a.attempted_at).getTime();
    if (t > cur.last) cur.last = t;
    attemptStat.set(a.question_id, cur);
  }

  // Sélection des 40 QCM ciblés — priorités de la spec section 11 :
  // 1. QCM ratés (les plus ratés d'abord) ; 2. jamais vus ; 3. anciens
  // (> 30 jours) ; 4. le reste. Bruit aléatoire léger pour varier les sessions.
  const now = Date.now();
  const days30Ms = 30 * 86_400_000;
  const scored = allQ.map((q) => {
    const st = attemptStat.get(q.id);
    let bucket: number;
    if (st && st.fails > 0) bucket = 0;
    else if (!st) bucket = 1;
    else if (now - st.last > days30Ms) bucket = 2;
    else bucket = 3;
    const failBoost = st ? Math.min(0.9, st.fails * 0.3) : 0;
    return { q, score: bucket * 10 - failBoost + Math.random() * 1.5 };
  });
  scored.sort((a, b) => a.score - b.score);

  const picked = new Set<string>();
  const consolidationQs: QRow[] = [];
  for (const { q } of scored) {
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

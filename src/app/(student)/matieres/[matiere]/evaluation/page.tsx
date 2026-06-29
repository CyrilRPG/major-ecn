import { redirect, notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { canAccessCollege, parseScope } from '@/lib/auth/permissions';
import { EDN_FACULTE_ID } from '@/lib/data/navigator';
import { SpecialtyEvaluation } from './specialty-evaluation';

export const metadata = { title: 'Évaluation de spécialité' };

type QRow = {
  id: string;
  enonce: string;
  order_index: number;
  qcm_items: { id: string; lettre: string; enonce: string; justification: string; is_correct: boolean }[] | null;
  qcm_series: { cours_id: string; cours: { titre: string; matieres: { id: string; nom: string; semestres: { faculte_id: string } } } };
};

export default async function EvaluationPage({ params }: { params: Promise<{ matiere: string }> }) {
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

  const { data: coursRaw } = await supabase
    .from('cours')
    .select('id, titre')
    .eq('matiere_id', matiere);
  const coursIds = (coursRaw ?? []).map((c) => c.id);
  if (coursIds.length === 0) redirect(`/matieres/${matiere}`);

  const { data: seriesRaw } = await supabase
    .from('qcm_series')
    .select('id')
    .in('cours_id', coursIds);
  const serieIds = (seriesRaw ?? []).map((s) => s.id);
  if (serieIds.length === 0) redirect(`/matieres/${matiere}`);

  const { data: allQRaw } = await supabase
    .from('qcm_questions')
    .select('id, enonce, order_index, qcm_items(id, lettre, enonce, justification, is_correct), qcm_series!inner(cours_id, cours!inner(titre, matieres!inner(id, nom, semestres!inner(faculte_id))))')
    .in('serie_id', serieIds)
    .order('order_index');

  const allQ = ((allQRaw ?? []) as unknown as QRow[]).filter(
    (q) => q.qcm_items && q.qcm_items.length >= 3,
  );

  const shuffled = [...allQ];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const N = Math.min(15, shuffled.length);
  const picked = shuffled.slice(0, N);

  const questions = picked.map((q) => ({
    id: q.id,
    enonce: q.enonce,
    cours_id: q.qcm_series.cours_id,
    college: (mat as unknown as { nom: string }).nom,
    items: [...(q.qcm_items ?? [])]
      .sort((a, b) => a.lettre.localeCompare(b.lettre))
      .map((it) => ({ id: it.id, lettre: it.lettre, enonce: it.enonce, justification: it.justification, is_correct: it.is_correct })),
  }));

  return (
    <SpecialtyEvaluation
      matiereId={matiere}
      matiereName={(mat as unknown as { nom: string }).nom}
      questions={questions}
    />
  );
}

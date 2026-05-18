import { notFound, redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { IndexHeader, IndexList, RowIcon, type IndexRow } from '@/components/shell/index-view';
import { iconFromKey } from '@/lib/icons';
import { canAccessCollege, parseScope } from '@/lib/auth/permissions';

export default async function MatierePage({ params }: { params: Promise<{ matiere: string }> }) {
  const { matiere } = await params;
  const { user, profile } = await requireUser();
  const supabase = await createClient();

  const { data: m } = await supabase
    .from('matieres')
    .select('id, nom, color_hex, icon_key, semestre_id, semestres(id, label, faculte_id, facultes(id, nom))')
    .eq('id', matiere)
    .maybeSingle();

  if (!m || !m.semestres) notFound();
  const scope = parseScope(profile.permission_scope);
  if (!canAccessCollege(scope, m.id)) redirect('/facultes');

  const { data: cours } = await supabase
    .from('cours')
    .select('id, titre, description, order_index, course_progress(video_watched, fiche_read), qcm_series(id), flashcards(id)')
    .eq('matiere_id', matiere)
    .order('order_index');

  const coursIds = (cours ?? []).map((c) => c.id);
  const { data: attempts } = coursIds.length
    ? await supabase
        .from('qcm_attempts')
        .select('id, question_id, qcm_questions!inner(serie_id, qcm_series!inner(cours_id))')
        .eq('user_id', user.id)
        .in('qcm_questions.qcm_series.cours_id', coursIds)
    : { data: [] as unknown as { qcm_questions: { qcm_series: { cours_id: string } } }[] };

  const { data: reviews } = coursIds.length
    ? await supabase
        .from('flashcard_reviews')
        .select('id, flashcard_id, flashcards!inner(cours_id)')
        .eq('user_id', user.id)
        .in('flashcards.cours_id', coursIds)
    : { data: [] as unknown as { flashcards: { cours_id: string } }[] };

  const coursQcmHit = new Set<string>();
  for (const a of attempts ?? []) coursQcmHit.add(a.qcm_questions.qcm_series.cours_id);
  const coursFlashHit = new Set<string>();
  for (const r of reviews ?? []) coursFlashHit.add(r.flashcards.cours_id);

  const Icon = iconFromKey(m.icon_key);

  const rows: IndexRow[] = (cours ?? []).map((c, idx) => {
    const p = c.course_progress?.[0];
    const hasContent = (c.qcm_series?.length ?? 0) > 0 || (c.flashcards?.length ?? 0) > 0;
    const steps =
      (p?.video_watched ? 1 : 0) +
      (p?.fiche_read ? 1 : 0) +
      (coursQcmHit.has(c.id) ? 1 : 0) +
      (coursFlashHit.has(c.id) ? 1 : 0);
    return {
      id: c.id,
      href: `/cours/${c.id}`,
      title: c.titre,
      subtitle: c.description ?? undefined,
      leading: (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--color-primary) font-mono text-xs font-semibold text-white">
          {String(idx + 1).padStart(2, '0')}
        </span>
      ),
      badge: hasContent && !p ? 'Nouveau' : undefined,
      progress: Math.round((steps / 4) * 100),
    };
  });

  return (
    <>
      <IndexHeader context="Collège EDN" title={m.nom} meta={`${rows.length} item${rows.length > 1 ? 's' : ''}`} />
      <div className="flex w-full items-center gap-3 px-5 pt-6 lg:px-10">
        <RowIcon Icon={Icon} color={m.color_hex ?? undefined} />
        <p className="text-sm text-(--color-ink-muted)">Sélectionnez un item pour ouvrir la console d’étude.</p>
      </div>
      <IndexList rows={rows} />
    </>
  );
}

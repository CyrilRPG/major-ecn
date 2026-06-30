import { notFound, redirect } from 'next/navigation';
import { CheckCircle2, ClipboardCheck, History, RefreshCcw, ShieldCheck } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { IndexHeader, IndexList, RowIcon, type IndexRow } from '@/components/shell/index-view';
import { iconFromKey } from '@/lib/icons';
import { canAccessCollege, canAccessCours, parseScope } from '@/lib/auth/permissions';

export default async function MatierePage({ params }: { params: Promise<{ matiere: string }> }) {
  const { matiere } = await params;
  const { user, profile } = await requireUser();
  const supabase = await createClient();

  const { data: m } = await supabase
    .from('matieres')
    .select('id, nom, color_hex, icon_key, access_type, semestre_id, semestres(id, label, faculte_id, facultes(id, nom))')
    .eq('id', matiere)
    .maybeSingle();

  if (!m || !m.semestres) notFound();
  const scope = parseScope(profile.permission_scope);
  const collegeAccess = ((m as { access_type?: 'all' | 'specific' }).access_type ?? 'all');
  if (!canAccessCollege(scope, m.id, collegeAccess)) redirect('/facultes');

  const { data: coursAll } = await supabase
    .from('cours')
    .select('id, titre, description, order_index, access_type, course_progress(video_watched, fiche_read), qcm_series(id), flashcards(id)')
    .eq('matiere_id', matiere)
    .order('order_index');

  // Filtrage fin : un prof peut être limité à un sous-ensemble de cours
  // (scope.cours). Cours marqués 'specific' : exige listing explicite.
  const cours = (coursAll ?? []).filter((c) =>
    canAccessCours(scope, matiere, c.id, (c as { access_type?: 'all' | 'specific' }).access_type ?? 'all')
  );
  const coursIds = cours.map((c) => c.id);
  const [{ data: attempts }, { data: reviews }] = coursIds.length
    ? await Promise.all([
        supabase
          .from('qcm_attempts')
          .select('id, question_id, qcm_questions!inner(serie_id, qcm_series!inner(cours_id))')
          .eq('user_id', user.id)
          .in('qcm_questions.qcm_series.cours_id', coursIds),
        supabase
          .from('flashcard_reviews')
          .select('id, flashcard_id, flashcards!inner(cours_id)')
          .eq('user_id', user.id)
          .in('flashcards.cours_id', coursIds),
      ])
    : [
        { data: [] as unknown as { qcm_questions: { qcm_series: { cours_id: string } } }[] },
        { data: [] as unknown as { flashcards: { cours_id: string } }[] },
      ];

  const coursQcmHit = new Set<string>();
  for (const a of attempts ?? []) coursQcmHit.add(a.qcm_questions.qcm_series.cours_id);
  const coursFlashHit = new Set<string>();
  for (const r of reviews ?? []) coursFlashHit.add(r.flashcards.cours_id);

  const { data: videoRows } = coursIds.length
    ? await supabase.from('videos').select('cours_id').not('storage_path', 'is', null).in('cours_id', coursIds)
    : { data: [] as { cours_id: string }[] };
  const videoAvailSet = new Set((videoRows ?? []).map((r) => r.cours_id));

  const Icon = iconFromKey(m.icon_key);

  const coursRows: IndexRow[] = cours.map((c, idx) => {
    const p = c.course_progress?.[0];
    const hasContent = (c.qcm_series?.length ?? 0) > 0 || (c.flashcards?.length ?? 0) > 0;
    const hasVideo = videoAvailSet.has(c.id);
    const qcmDone = coursQcmHit.has(c.id) ? 1 : 0;
    const ficheDone = p?.fiche_read ? 1 : 0;
    const flashDone = coursFlashHit.has(c.id) ? 1 : 0;
    const videoDone = p?.video_watched ? 1 : 0;
    const progress = hasVideo
      ? qcmDone * 60 + ficheDone * 10 + flashDone * 15 + videoDone * 15
      : qcmDone * 70 + ficheDone * 10 + flashDone * 20;
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
      progress,
    };
  });

  // Check specialty evaluation status for this matière
  const { data: evalData } = await (supabase as unknown as {
    from: (t: string) => {
      select: (s: string) => {
        eq: (k: string, v: string) => {
          eq: (k2: string, v2: string) => {
            order: (k: string, o: { ascending: boolean }) => {
              limit: (n: number) => Promise<{
                data: { status: string; eval_type: string }[] | null;
              }>;
            };
          };
        };
      };
    };
  }).from('specialty_evaluations')
    .select('status, eval_type')
    .eq('user_id', user.id)
    .eq('matiere_id', matiere)
    .order('created_at', { ascending: false })
    .limit(1);
  const latestEval = evalData?.[0] ?? null;
  const evalStatus = latestEval?.status as string | null;

  // Sous-onglet « Annales » en tête de Médecine générale.
  const annaleRow: IndexRow = {
    id: '__annales__',
    href: `/matieres/${matiere}/annales`,
    title: 'Annales EVC',
    subtitle: 'Tous les sujets officiels, accessibles par année.',
    leading: <RowIcon Icon={History} color="#6B1A2A" />,
    badge: 'Officiel',
  };

  // Evaluation / Consolidation / Renforcement cards based on status
  const evalRow: IndexRow = {
    id: '__evaluation__',
    href: `/matieres/${matiere}/evaluation`,
    title: 'Évaluation de fin de spécialité',
    subtitle: evalStatus === 'validee'
      ? 'Spécialité validée — vous pouvez repasser l\'évaluation.'
      : 'Testez vos connaissances sur l\'ensemble de la spécialité.',
    leading: <RowIcon Icon={ClipboardCheck} color="#6D28D9" />,
    badge: evalStatus === 'validee' ? 'Validée' : evalStatus ? 'À refaire' : 'Nouveau',
  };

  const actionRows: IndexRow[] = [evalRow];

  if (evalStatus === 'consolider') {
    actionRows.push({
      id: '__consolidation__',
      href: `/matieres/${matiere}/consolidation`,
      title: 'Consolidation',
      subtitle: 'Revoyez les points faibles et repassez une mini-évaluation.',
      leading: <RowIcon Icon={RefreshCcw} color="#E8742C" />,
      badge: 'Recommandé',
    });
  }

  if (evalStatus === 'renforcer') {
    actionRows.push({
      id: '__renforcement__',
      href: `/matieres/${matiere}/renforcement`,
      title: 'Renforcement approfondi',
      subtitle: 'Parcours complet : fiches, flashcards, QCM et évaluation finale.',
      leading: <RowIcon Icon={ShieldCheck} color="#A91D2C" />,
      badge: 'Prioritaire',
    });
  }

  if (evalStatus === 'validee') {
    actionRows.push({
      id: '__validated__',
      href: '#',
      title: 'Spécialité validée',
      subtitle: 'Vous maîtrisez cette spécialité. Continuez les révisions transversales.',
      leading: <RowIcon Icon={CheckCircle2} color="#16793C" />,
      badge: 'Validée',
      progress: 100,
    });
  }

  const rows = [annaleRow, ...actionRows, ...coursRows];

  return (
    <>
      <IndexHeader context="Collège EVC" title={m.nom} meta={`${rows.length} item${rows.length > 1 ? 's' : ''}`} />
      <div className="flex w-full items-center gap-3 px-5 pt-6 lg:px-10">
        <RowIcon Icon={Icon} color={m.color_hex ?? undefined} />
        <p className="text-sm text-(--color-ink-muted)">Sélectionnez un item pour ouvrir la console d’étude.</p>
      </div>
      <IndexList rows={rows} />
    </>
  );
}

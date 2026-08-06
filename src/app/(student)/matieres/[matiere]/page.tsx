import { notFound, redirect } from 'next/navigation';
import { CheckCircle2, ClipboardCheck, History, RefreshCcw, ShieldCheck } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { IndexHeader, IndexList, RowIcon, type IndexRow } from '@/components/shell/index-view';
import { iconFromKey } from '@/lib/icons';
import {
  ANNALES_EVC_COLLEGE_ID,
  canAccessAnnalesEvc,
  canAccessCollege,
  canAccessCours,
  parseScope,
} from '@/lib/auth/permissions';

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
  const [{ data: attempts }, { data: reviews }, { data: qcmTotalRows }] = coursIds.length
    ? await Promise.all([
        supabase
          .from('qcm_attempts')
          // on ajoute le type de série pour ne compter QUE les vraies séries QCM
          // (pas les annales/séances) dans la progression.
          .select('id, question_id, qcm_questions!inner(serie_id, qcm_series!inner(cours_id, type))')
          .eq('user_id', user.id)
          .in('qcm_questions.qcm_series.cours_id', coursIds),
        supabase
          .from('flashcard_reviews')
          .select('id, flashcard_id, flashcards!inner(cours_id)')
          .eq('user_id', user.id)
          .in('flashcards.cours_id', coursIds),
        // Nombre total de questions de type QCM par cours (dénominateur).
        supabase
          .from('qcm_questions')
          .select('id, qcm_series!inner(cours_id, type)')
          .eq('qcm_series.type', 'qcm')
          .in('qcm_series.cours_id', coursIds),
      ])
    : [
        { data: [] as unknown as { question_id: string; qcm_questions: { qcm_series: { cours_id: string; type: string } } }[] },
        { data: [] as unknown as { flashcards: { cours_id: string } }[] },
        { data: [] as unknown as { id: string; qcm_series: { cours_id: string; type: string } }[] },
      ];

  const coursFlashHit = new Set<string>();
  for (const r of reviews ?? []) coursFlashHit.add(r.flashcards.cours_id);

  // Progression QCM = questions QCM DISTINCTES tentées / questions QCM totales.
  // (On dédoublonne par question_id pour ne pas gonfler avec les re-tentatives,
  //  et on exclut les annales du numérateur comme du dénominateur.)
  const qcmDoneByCourse = new Map<string, Set<string>>();
  for (const a of (attempts ?? []) as unknown as { question_id: string; qcm_questions: { qcm_series: { cours_id: string; type: string } } }[]) {
    const cid = a.qcm_questions?.qcm_series?.cours_id;
    if (!cid || a.qcm_questions?.qcm_series?.type !== 'qcm') continue;
    if (!qcmDoneByCourse.has(cid)) qcmDoneByCourse.set(cid, new Set());
    qcmDoneByCourse.get(cid)!.add(a.question_id);
  }
  const qcmTotalByCourse = new Map<string, number>();
  for (const row of (qcmTotalRows ?? []) as unknown as { qcm_series: { cours_id: string } }[]) {
    const cid = row.qcm_series?.cours_id;
    if (!cid) continue;
    qcmTotalByCourse.set(cid, (qcmTotalByCourse.get(cid) ?? 0) + 1);
  }

  const { data: videoRows } = coursIds.length
    ? await supabase.from('videos').select('cours_id').not('storage_path', 'is', null).in('cours_id', coursIds)
    : { data: [] as { cours_id: string }[] };
  const videoAvailSet = new Set((videoRows ?? []).map((r) => r.cours_id));

  const Icon = iconFromKey(m.icon_key);

  const coursRows: IndexRow[] = cours.map((c, idx) => {
    const p = c.course_progress?.[0];
    const hasContent = (c.qcm_series?.length ?? 0) > 0 || (c.flashcards?.length ?? 0) > 0;
    const hasVideo = videoAvailSet.has(c.id);
    const ficheDone = p?.fiche_read ? 1 : 0;
    const flashDone = coursFlashHit.has(c.id) ? 1 : 0;
    const videoDone = p?.video_watched ? 1 : 0;
    // Progression fiable = ratio de QCM faits (majoritaire, 85 %). Le reste
    // (fiche + flashcards + vidéo) ne pèse que 15 %. Pour un cours SANS QCM, on
    // retombe sur une couverture simple fiche/flashcards/vidéo.
    const qcmTotal = qcmTotalByCourse.get(c.id) ?? 0;
    const qcmDoneCount = qcmDoneByCourse.get(c.id)?.size ?? 0;
    let progress: number;
    if (qcmTotal > 0) {
      const qcmRatio = Math.min(1, qcmDoneCount / qcmTotal); // 0..1
      const otherSteps = hasVideo ? 3 : 2; // fiche + flashcards (+ vidéo)
      const otherDone = ficheDone + flashDone + (hasVideo ? videoDone : 0);
      const otherRatio = otherSteps > 0 ? otherDone / otherSteps : 0;
      progress = Math.round(qcmRatio * 85 + otherRatio * 15);
    } else {
      const steps = hasVideo ? 3 : 2;
      progress = Math.round(((ficheDone + flashDone + (hasVideo ? videoDone : 0)) / steps) * 100);
    }
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

  // Annales EVC : uniquement sous Médecine générale (et pour les élèves qui y ont accès).
  const rows: IndexRow[] = [
    ...(matiere === ANNALES_EVC_COLLEGE_ID && canAccessAnnalesEvc(scope)
      ? [{
          id: '__annales__',
          href: `/matieres/${matiere}/annales`,
          title: 'Annales EVC',
          subtitle: 'Tous les sujets officiels, accessibles par année.',
          leading: <RowIcon Icon={History} color="#6B1A2A" />,
          badge: 'Officiel',
        } satisfies IndexRow]
      : []),
    ...actionRows,
    ...coursRows,
  ];

  // ── Date d'épreuve de cette spécialité ──────────────────────────────────
  // On réutilise les annonces « countdown » ciblées sur ce collège (target_scope
  // 'college' + target_colleges contenant ce collège), avec une date. Le compteur
  // de jours restants est ainsi géré par le même système (et ses permissions).
  const OFFER_RANK: Record<string, number> = { decouverte: 0, essentiel: 1, intensif: 2, approfondi: 3 };
  const { data: examAnns } = await supabase
    .from('homepage_announcements')
    .select('id, title, data, min_offer, target_scope, target_colleges, kind, visible')
    .eq('visible', true)
    .eq('kind', 'countdown');
  type ExamAnn = {
    title: string; data: { target_date?: string; suffix_bottom?: string } | null;
    min_offer: string | null; target_scope: string | null; target_colleges: string[] | null;
  };
  const examBanner = ((examAnns ?? []) as unknown as ExamAnn[])
    .filter((a) => {
      const date = a.data?.target_date;
      if (!date || Number.isNaN(new Date(date).getTime())) return false;
      if (a.min_offer && (OFFER_RANK[scope.offer] ?? 0) < (OFFER_RANK[a.min_offer] ?? 0)) return false;
      // Ciblée précisément sur ce collège.
      return (a.target_scope === 'college') && (a.target_colleges ?? []).includes(m.id);
    })
    .map((a) => ({
      title: a.title,
      date: a.data!.target_date as string,
      note: a.data?.suffix_bottom ?? null,
      days: Math.max(0, Math.ceil((new Date(a.data!.target_date as string).getTime() - Date.now()) / 86_400_000)),
    }))
    .sort((x, y) => new Date(x.date).getTime() - new Date(y.date).getTime())[0] ?? null;

  const fmtExam = (iso: string) => {
    try { return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }); }
    catch { return iso; }
  };

  return (
    <>
      <IndexHeader context="Collège EVC" title={m.nom} meta={`${rows.length} item${rows.length > 1 ? 's' : ''}`} />
      {examBanner && (
        <div className="mx-5 mt-4 flex items-center gap-4 rounded-2xl border border-(--color-primary)/25 bg-(--color-primary-soft)/40 px-4 py-3 lg:mx-10">
          <div className="flex flex-col items-center justify-center rounded-xl bg-(--color-primary) px-3 py-1.5 text-white">
            <span className="text-[10px] font-semibold uppercase leading-none tracking-wide opacity-80">Jours</span>
            <span className="text-xl font-black leading-tight tabular-nums">{examBanner.days === 0 ? 'J' : `J−${examBanner.days}`}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-(--color-ink)">{examBanner.title}</p>
            <p className="text-xs text-(--color-ink-soft)">
              {examBanner.note ?? `Épreuve le ${fmtExam(examBanner.date)}`}
            </p>
          </div>
        </div>
      )}
      <div className="flex w-full items-center gap-3 px-5 pt-6 lg:px-10">
        <RowIcon Icon={Icon} color={m.color_hex ?? undefined} />
        <p className="text-sm text-(--color-ink-muted)">Sélectionnez un item pour ouvrir la console d’étude.</p>
      </div>
      <IndexList rows={rows} />
    </>
  );
}

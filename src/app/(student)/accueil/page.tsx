import Link from 'next/link';
import { ArrowRight, Activity, GraduationCap, Layers3, Target } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { parseScope, canAccessCollege, offerLabel } from '@/lib/auth/permissions';
import { EDN_FACULTE_ID } from '@/lib/data/navigator';
import { CollegesGrid } from '@/components/student/colleges-grid';
import { ActivityArea, SuccessRateBar } from '@/components/admin/stats/charts';
import { DIFFICULTY_SCORE, FLASHCARD_MASTERY_THRESHOLD, type Difficulty } from '@/types/domain';
import { initials } from '@/lib/utils';

export const metadata = { title: 'Accueil' };

type AttemptRow = {
  is_correct: boolean;
  attempted_at: string;
  qcm_questions: { qcm_series: { cours: { matieres: { id: string; nom: string; semestres: { faculte_id: string } } } } };
};
type CollegeRow = {
  id: string;
  nom: string;
  cours?: { course_progress: { video_watched: boolean | null; fiche_read: boolean | null }[] | null }[] | null;
};
type ReviewRow = { flashcard_id: string; difficulty: string; flashcards: { cours: { matieres: { semestres: { faculte_id: string } } } } };

export default async function AccueilPage() {
  const { user, profile } = await requireUser();
  const scope = parseScope(profile.permission_scope);
  const supabase = await createClient();

  const [{ data: attemptsRaw }, { data: edn }, { data: reviewsRaw }, { count: flashcardsTotal }] =
    await Promise.all([
      supabase
        .from('qcm_attempts')
        .select(
          'is_correct, attempted_at, qcm_questions!inner(qcm_series!inner(cours!inner(matieres!inner(id, nom, semestres!inner(faculte_id)))))',
        )
        .eq('user_id', user.id),
      supabase
        .from('facultes')
        .select('semestres(matieres(id, nom, order_index, cours(id, course_progress(video_watched, fiche_read))))')
        .eq('id', EDN_FACULTE_ID)
        .maybeSingle(),
      supabase
        .from('flashcard_reviews')
        .select('flashcard_id, difficulty, flashcards!inner(cours!inner(matieres!inner(semestres!inner(faculte_id))))')
        .eq('user_id', user.id),
      supabase.from('flashcards').select('id', { count: 'exact', head: true }),
    ]);

  const attempts = ((attemptsRaw ?? []) as unknown as AttemptRow[]).filter(
    (a) => a.qcm_questions.qcm_series.cours.matieres.semestres.faculte_id === EDN_FACULTE_ID,
  );

  // Global success
  const totalAttempts = attempts.length;
  const correct = attempts.filter((a) => a.is_correct).length;
  const successRate = totalAttempts > 0 ? Math.round((correct / totalAttempts) * 100) : 0;

  // Per-college success
  const perCollege = new Map<string, { nom: string; total: number; correct: number }>();
  for (const a of attempts) {
    const m = a.qcm_questions.qcm_series.cours.matieres;
    const e = perCollege.get(m.id) ?? { nom: m.nom, total: 0, correct: 0 };
    e.total++;
    if (a.is_correct) e.correct++;
    perCollege.set(m.id, e);
  }

  // Progression across accessible colleges
  const colleges = (
    ((edn as unknown as { semestres?: { matieres?: CollegeRow[] }[] } | null)?.semestres ?? [])
  )
    .flatMap((s) => s.matieres ?? [])
    .filter((m) => canAccessCollege(scope, m.id));

  let stepsDone = 0;
  let stepsTotal = 0;
  for (const m of colleges) {
    for (const c of m.cours ?? []) {
      const cp = c.course_progress?.[0];
      stepsTotal += 2;
      stepsDone += (cp?.video_watched ? 1 : 0) + (cp?.fiche_read ? 1 : 0);
    }
  }
  const globalProgress = stepsTotal > 0 ? Math.round((stepsDone / stepsTotal) * 100) : 0;

  // Flashcards mastered
  const reviews = ((reviewsRaw ?? []) as unknown as ReviewRow[]).filter(
    (r) => r.flashcards.cours.matieres.semestres.faculte_id === EDN_FACULTE_ID,
  );
  const fcScore = new Map<string, number>();
  for (const r of reviews) {
    fcScore.set(r.flashcard_id, (fcScore.get(r.flashcard_id) ?? 0) + (DIFFICULTY_SCORE[r.difficulty as Difficulty] ?? 0));
  }
  let fcMastered = 0;
  for (const v of fcScore.values()) if (v >= FLASHCARD_MASTERY_THRESHOLD) fcMastered++;

  // Success-rate chart + weak colleges
  const successByCollege = [...perCollege.values()]
    .filter((c) => c.total > 0)
    .map((c) => ({ label: c.nom, value: Math.round((c.correct / c.total) * 100) }))
    .sort((a, b) => a.value - b.value);

  const toReview = successByCollege.filter((c) => c.value < 70).slice(0, 4);

  // Activity (14 days) of attempts
  const days: { label: string; value: number }[] = [];
  const idxByKey = new Map<string, number>();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400_000);
    const key = d.toISOString().slice(0, 10);
    idxByKey.set(key, days.length);
    days.push({ label: d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }), value: 0 });
  }
  for (const a of attempts) {
    const i = idxByKey.get(new Date(a.attempted_at).toISOString().slice(0, 10));
    if (i !== undefined) days[i].value++;
  }

  const firstName = profile.first_name || 'étudiant';

  const kpis = [
    { Icon: GraduationCap, label: 'Progression globale', value: `${globalProgress}%` },
    { Icon: Target, label: 'Taux de réussite', value: `${successRate}%` },
    { Icon: Activity, label: 'Questions tentées', value: totalAttempts },
    { Icon: Layers3, label: 'Flashcards acquises', value: `${fcMastered}/${flashcardsTotal ?? 0}` },
  ];

  return (
    <div className="px-5 py-7 lg:px-10">
      {/* Profile hero */}
      <section className="overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-(--shadow-soft)">
        <div className="relative bg-gradient-to-br from-(--color-primary) to-(--color-accent) px-6 py-7 text-white sm:px-8">
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          <div className="relative flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-xl font-semibold ring-1 ring-white/25">
              {initials(profile.first_name, profile.last_name)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/70">Tableau de bord</p>
              <h1 className="font-display text-3xl leading-tight sm:text-4xl">Bonjour, {firstName}.</h1>
              <p className="mt-1 text-sm text-white/75">
                Formule {offerLabel(scope.offer)} ·{' '}
                {scope.type === 'all' ? 'Tous les collèges' : `${scope.colleges.length} collège(s)`}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px bg-(--color-border) lg:grid-cols-4">
          {kpis.map((k) => (
            <div key={k.label} className="bg-(--color-surface) px-5 py-5">
              <k.Icon className="h-5 w-5 text-(--color-accent)" />
              <p className="mt-3 font-display text-2xl text-(--color-ink)">{k.value}</p>
              <p className="mt-0.5 text-xs text-(--color-ink-muted)">{k.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Charts + weak colleges */}
      <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft)">
          <h2 className="text-sm font-semibold text-(--color-ink)">Réussite par collège</h2>
          <p className="mb-3 text-xs text-(--color-ink-muted)">Sur l’ensemble de vos tentatives.</p>
          {successByCollege.length > 0 ? (
            <SuccessRateBar data={successByCollege} />
          ) : (
            <p className="py-10 text-center text-sm text-(--color-ink-muted)">
              Lancez vos premiers QCM pour voir vos statistiques.
            </p>
          )}
        </div>
        <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft)">
          <h2 className="text-sm font-semibold text-(--color-ink)">Collèges à retravailler</h2>
          <p className="mb-3 text-xs text-(--color-ink-muted)">Réussite inférieure à 70 %.</p>
          {toReview.length > 0 ? (
            <ul className="space-y-2">
              {toReview.map((c) => (
                <li
                  key={c.label}
                  className="flex items-center justify-between rounded-xl border border-(--color-border) bg-(--color-surface-soft) px-3.5 py-2.5"
                >
                  <span className="truncate text-sm font-medium text-(--color-ink)">{c.label}</span>
                  <span className="shrink-0 rounded-full bg-(--color-primary-soft) px-2 py-0.5 text-xs font-semibold text-(--color-primary-deep)">
                    {c.value}%
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-10 text-center text-sm text-(--color-ink-muted)">
              Rien à signaler — continuez comme ça.
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft)">
        <h2 className="text-sm font-semibold text-(--color-ink)">Votre activité (14 jours)</h2>
        <p className="mb-3 text-xs text-(--color-ink-muted)">Questions tentées par jour.</p>
        <ActivityArea data={days} />
      </div>

      {/* Colleges access */}
      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-(--color-ink)">Vos collèges</h2>
          <Link
            href="/facultes"
            className="inline-flex items-center gap-1 text-sm text-(--color-accent-deep) hover:underline"
          >
            Tout voir <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <CollegesGrid scope={scope} />
      </div>
    </div>
  );
}

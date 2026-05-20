import Link from 'next/link';
import { ArrowRight, ClipboardCheck, GraduationCap, History, Layers3, Target } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { parseScope, canAccessCollege } from '@/lib/auth/permissions';
import { EDN_FACULTE_ID } from '@/lib/data/navigator';
import { ActivityArea, ActivityDonut } from '@/components/admin/stats/charts';
import { DIFFICULTY_SCORE, FLASHCARD_MASTERY_THRESHOLD, type Difficulty } from '@/types/domain';

export const metadata = { title: 'Accueil' };


type AttemptRow = {
  is_correct: boolean;
  attempted_at: string;
  qcm_questions: { qcm_series: { type: string; cours: { matieres: { id: string; nom: string; semestres: { faculte_id: string } } } } };
};
type SessionRow = {
  score_correct: number; score_total: number; finished_at: string | null;
  qcm_series: { label: string; type: string; cours: { matieres: { id: string; nom: string; semestres: { faculte_id: string } } } };
};
type ReviewRow = { difficulty: string; reviewed_at: string; flashcards: { cours: { matieres: { id: string; nom: string; semestres: { faculte_id: string } } } } };
type CollegeRow = { id: string; nom: string; cours?: { course_progress: { video_watched: boolean | null; fiche_read: boolean | null }[] | null }[] | null };

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-(--color-border) bg-(--color-surface) p-3.5 shadow-(--shadow-soft) ${className}`}>
      {children}
    </div>
  );
}

export default async function AccueilPage() {
  const { user, profile } = await requireUser();
  const scope = parseScope(profile.permission_scope);
  const supabase = await createClient();

  const [{ data: attemptsRaw }, { data: sessionsRaw }, { data: reviewsRaw }, { data: edn }, { count: flashcardsTotal }] =
    await Promise.all([
      supabase
        .from('qcm_attempts')
        .select('is_correct, attempted_at, qcm_questions!inner(qcm_series!inner(type, cours!inner(matieres!inner(id, nom, semestres!inner(faculte_id)))))')
        .eq('user_id', user.id),
      supabase
        .from('qcm_sessions')
        .select('score_correct, score_total, finished_at, qcm_series!inner(label, type, cours!inner(matieres!inner(id, nom, semestres!inner(faculte_id))))')
        .eq('user_id', user.id)
        .not('finished_at', 'is', null)
        .order('finished_at', { ascending: false }),
      supabase
        .from('flashcard_reviews')
        .select('difficulty, reviewed_at, flashcards!inner(cours!inner(matieres!inner(id, nom, semestres!inner(faculte_id))))')
        .eq('user_id', user.id)
        .order('reviewed_at', { ascending: false }),
      supabase
        .from('facultes')
        .select('semestres(matieres(id, nom, order_index, cours(id, course_progress(video_watched, fiche_read))))')
        .eq('id', EDN_FACULTE_ID)
        .maybeSingle(),
      supabase.from('flashcards').select('id', { count: 'exact', head: true }),
    ]);

  const inEdn = (f: string) => f === EDN_FACULTE_ID;
  const attempts = ((attemptsRaw ?? []) as unknown as AttemptRow[]).filter((a) =>
    inEdn(a.qcm_questions.qcm_series.cours.matieres.semestres.faculte_id),
  );
  const sessions = ((sessionsRaw ?? []) as unknown as SessionRow[]).filter((s) =>
    inEdn(s.qcm_series.cours.matieres.semestres.faculte_id),
  );
  const reviews = ((reviewsRaw ?? []) as unknown as ReviewRow[]).filter((r) =>
    inEdn(r.flashcards.cours.matieres.semestres.faculte_id),
  );

  const now = Date.now();
  const totalAttempts = attempts.length;
  const correct = attempts.filter((a) => a.is_correct).length;
  const successRate = totalAttempts > 0 ? Math.round((correct / totalAttempts) * 100) : 0;

  // Progression
  const colleges = (
    ((edn as unknown as { semestres?: { matieres?: CollegeRow[] }[] } | null)?.semestres ?? [])
  )
    .flatMap((s) => s.matieres ?? [])
    .filter((m) => canAccessCollege(scope, m.id));
  let stepsDone = 0, stepsTotal = 0;
  for (const m of colleges) {
    for (const c of m.cours ?? []) {
      const cp = c.course_progress?.[0];
      stepsTotal += 2;
      stepsDone += (cp?.video_watched ? 1 : 0) + (cp?.fiche_read ? 1 : 0);
    }
  }
  const globalProgress = stepsTotal > 0 ? Math.round((stepsDone / stepsTotal) * 100) : 0;

  // Flashcards mastered (cumulative score per card, EDN scope)
  const { data: fr2 } = await supabase
    .from('flashcard_reviews')
    .select('flashcard_id, difficulty, flashcards!inner(cours!inner(matieres!inner(semestres!inner(faculte_id))))')
    .eq('user_id', user.id);
  const scoreByCard = new Map<string, number>();
  for (const r of ((fr2 ?? []) as unknown as { flashcard_id: string; difficulty: string; flashcards: { cours: { matieres: { semestres: { faculte_id: string } } } } }[])) {
    if (!inEdn(r.flashcards.cours.matieres.semestres.faculte_id)) continue;
    scoreByCard.set(r.flashcard_id, (scoreByCard.get(r.flashcard_id) ?? 0) + (DIFFICULTY_SCORE[r.difficulty as Difficulty] ?? 0));
  }
  let fcMastered = 0;
  for (const v of scoreByCard.values()) if (v >= FLASHCARD_MASTERY_THRESHOLD) fcMastered++;

  // Per-college success
  const perCollege = new Map<string, { nom: string; total: number; correct: number }>();
  for (const a of attempts) {
    const m = a.qcm_questions.qcm_series.cours.matieres;
    const e = perCollege.get(m.id) ?? { nom: m.nom, total: 0, correct: 0 };
    e.total++; if (a.is_correct) e.correct++;
    perCollege.set(m.id, e);
  }
  const matieres = [...perCollege.entries()]
    .map(([id, c]) => ({ id, nom: c.nom, value: Math.round((c.correct / c.total) * 100) }))
    .sort((a, b) => a.value - b.value);
  const toReview = matieres.filter((m) => m.value < 70).slice(0, 4);

  // Performance area (30 days, attempts/day)
  const days: { label: string; value: number }[] = [];
  const idxByKey = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now - i * 86400_000);
    idxByKey.set(d.toISOString().slice(0, 10), days.length);
    days.push({ label: d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }), value: 0 });
  }
  for (const a of attempts) {
    const i = idxByKey.get(new Date(a.attempted_at).toISOString().slice(0, 10));
    if (i !== undefined) days[i].value++;
  }

  // Répartition par type d'activité
  const qcmCount = attempts.filter((a) => a.qcm_questions.qcm_series.type === 'qcm').length;
  const annaleCount = attempts.filter((a) => a.qcm_questions.qcm_series.type === 'annale').length;
  const repartition = [
    { label: 'QCM', value: qcmCount, color: '#E11D48' },
    { label: 'Annales', value: annaleCount, color: '#8B5CF6' },
    { label: 'Flashcards', value: reviews.length, color: '#F59E0B' },
    { label: 'Items vus', value: stepsDone, color: '#5B8DEF' },
  ].filter((s) => s.value > 0);

  // Activité récente
  type Recent = { kind: string; label: string; college: string; when: number; score?: string };
  const recent: Recent[] = [
    ...sessions.slice(0, 6).map((s) => ({
      kind: s.qcm_series.type === 'annale' ? 'Annale' : 'QCM',
      label: s.qcm_series.label,
      college: s.qcm_series.cours.matieres.nom,
      when: s.finished_at ? new Date(s.finished_at).getTime() : 0,
      score: `${s.score_correct}/${s.score_total}`,
    })),
    ...reviews.slice(0, 4).map((r) => ({
      kind: 'Flashcards',
      label: 'Révision',
      college: r.flashcards.cours.matieres.nom,
      when: new Date(r.reviewed_at).getTime(),
    })),
  ]
    .sort((a, b) => b.when - a.when)
    .slice(0, 6);

  const firstName = profile.first_name || 'étudiant';
  const ago = (t: number) => {
    const h = Math.round((now - t) / 3600_000);
    if (h < 1) return "à l'instant";
    if (h < 24) return `il y a ${h} h`;
    const d = Math.round(h / 24);
    return d === 1 ? 'hier' : `il y a ${d} j`;
  };
  const kpis = [
    { Icon: GraduationCap, label: 'Progression globale', value: `${globalProgress}%` },
    { Icon: Target, label: 'Taux de réussite', value: `${successRate}%` },
    { Icon: ClipboardCheck, label: 'QCM réalisés', value: sessions.length },
    { Icon: Layers3, label: 'Flashcards acquises', value: `${fcMastered}/${flashcardsTotal ?? 0}` },
  ];

  const barColor = (v: number) => (v < 50 ? '#E11D48' : v < 75 ? '#F59E0B' : '#22C55E');

  return (
    <div className="flex flex-col gap-3 px-4 py-3 lg:h-full lg:overflow-hidden lg:px-6">
      {/* Greeting */}
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="text-lg font-bold tracking-tight text-(--color-ink) sm:text-xl">
          Bonjour, {firstName} 👋{' '}
          <span className="text-sm font-normal text-(--color-ink-soft)">Prêt(e) à cartonner aujourd’hui ? 💪</span>
        </h1>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <div className="flex items-center gap-2 text-(--color-ink-muted)">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-(--color-primary-soft) text-(--color-primary)">
                <k.Icon className="h-3.5 w-3.5" />
              </span>
              <span className="text-xs">{k.label}</span>
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-(--color-ink)">{k.value}</p>
          </Card>
        ))}
      </div>

      {/* Main grid — fills remaining height, no scroll */}
      <div className="grid gap-3 lg:min-h-0 lg:flex-1 lg:grid-cols-3">
        {/* Performance */}
        <Card className="flex min-h-0 flex-col lg:col-span-2">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-(--color-ink)">Évolution de ta performance</h2>
            <span className="rounded-md border border-(--color-border) px-2 py-0.5 text-[11px] text-(--color-ink-soft)">
              30 j
            </span>
          </div>
          <div className="min-h-0 flex-1">
            <ActivityArea data={days} height={150} />
          </div>
        </Card>

        {/* Matières à prioriser */}
        <Card className="flex min-h-0 flex-col">
          <h2 className="text-sm font-semibold text-(--color-ink)">Matières à prioriser</h2>
          {matieres.length > 0 ? (
            <ul className="mt-2 space-y-2">
              {matieres.slice(0, 5).map((m) => (
                <li key={m.id}>
                  <div className="mb-0.5 flex items-center justify-between text-xs">
                    <span className="truncate text-(--color-ink)">{m.nom}</span>
                    <span className="font-semibold tabular-nums text-(--color-ink-soft)">{m.value}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-(--color-sand-200)">
                    <div className="h-full rounded-full" style={{ width: `${m.value}%`, background: barColor(m.value) }} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-xs text-(--color-ink-muted)">Lancez vos premiers QCM.</p>
          )}
        </Card>

        {/* Activité récente */}
        <Card className="flex min-h-0 flex-col lg:col-span-2">
          <h2 className="text-sm font-semibold text-(--color-ink)">Activité récente</h2>
          {recent.length > 0 ? (
            <ul className="mt-1 divide-y divide-(--color-border)">
              {recent.slice(0, 5).map((r, i) => (
                <li key={i} className="flex items-center gap-2.5 py-1.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-(--color-sand-100) text-(--color-primary)">
                    {r.kind === 'Flashcards' ? <Layers3 className="h-3.5 w-3.5" /> : r.kind === 'Annale' ? <History className="h-3.5 w-3.5" /> : <ClipboardCheck className="h-3.5 w-3.5" />}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-xs font-medium text-(--color-ink)">
                    {r.kind} — {r.college}
                  </span>
                  <span className="shrink-0 text-[11px] text-(--color-ink-muted)">{ago(r.when)}</span>
                  {r.score && (
                    <span className="shrink-0 rounded-full bg-(--color-primary-soft) px-1.5 py-0.5 text-[11px] font-semibold text-(--color-primary-deep)">
                      {r.score}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-xs text-(--color-ink-muted)">Aucune activité.</p>
          )}
        </Card>

        {/* Répartition */}
        <Card className="flex min-h-0 flex-col">
          <h2 className="text-sm font-semibold text-(--color-ink)">Répartition</h2>
          {repartition.length > 0 ? (
            <div className="flex flex-1 items-center">
              <ActivityDonut data={repartition} size={120} />
            </div>
          ) : (
            <p className="py-6 text-center text-xs text-(--color-ink-muted)">Pas encore de données.</p>
          )}
        </Card>

        {/* À réviser + collèges (compact strip) */}
        <Card className="lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-(--color-ink)">
              {toReview.length > 0 ? 'À réviser en priorité' : 'Vos collèges'}
            </h2>
            <Link href="/facultes" className="inline-flex items-center gap-1 text-xs text-(--color-accent-deep) hover:underline">
              Tous les collèges <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {(toReview.length > 0 ? toReview : matieres).slice(0, 8).map((m) => (
              <Link
                key={m.id}
                href={`/matieres/${m.id}`}
                className="group inline-flex items-center gap-2 rounded-full border border-(--color-border) bg-(--color-surface-soft) py-1.5 pl-3 pr-2 text-xs transition-colors hover:border-(--color-accent)"
              >
                <span className="font-medium text-(--color-ink)">{m.nom}</span>
                <span
                  className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums"
                  style={
                    m.value < 50
                      ? { background: '#FFE4E9', color: '#BE123C' }
                      : m.value < 75
                        ? { background: '#FEF3E2', color: '#B26A00' }
                        : { background: '#E7F6EC', color: '#16793C' }
                  }
                >
                  {m.value}%
                </span>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

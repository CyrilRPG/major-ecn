import Link from 'next/link';
import { ArrowRight, ClipboardCheck, GraduationCap, History, Layers3, Target } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { parseScope, canAccessCollege } from '@/lib/auth/permissions';
import { EDN_FACULTE_ID } from '@/lib/data/navigator';
import { CollegesGrid } from '@/components/student/colleges-grid';
import { ActivityArea, ActivityDonut } from '@/components/admin/stats/charts';
import { DIFFICULTY_SCORE, FLASHCARD_MASTERY_THRESHOLD, type Difficulty } from '@/types/domain';

export const metadata = { title: 'Accueil' };

const WEEK = 7 * 86400_000;

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
    <div className={`rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft) ${className}`}>
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

  // Week-over-week
  const wk = (ts: string) => now - new Date(ts).getTime();
  const aThis = attempts.filter((a) => wk(a.attempted_at) <= WEEK);
  const aPrev = attempts.filter((a) => wk(a.attempted_at) > WEEK && wk(a.attempted_at) <= 2 * WEEK);
  const rate = (arr: AttemptRow[]) => (arr.length ? Math.round((arr.filter((x) => x.is_correct).length / arr.length) * 100) : 0);
  const successDelta = rate(aThis) - rate(aPrev);
  const sessionsThisWeek = sessions.filter((s) => s.finished_at && wk(s.finished_at) <= WEEK).length;
  const reviewsThisWeek = reviews.filter((r) => wk(r.reviewed_at) <= WEEK).length;

  // Progression
  const colleges = (
    ((edn as unknown as { semestres?: { matieres?: CollegeRow[] }[] } | null)?.semestres ?? [])
  )
    .flatMap((s) => s.matieres ?? [])
    .filter((m) => canAccessCollege(scope, m.id));
  let stepsDone = 0, stepsTotal = 0, coursSeen7d = 0;
  for (const m of colleges) {
    for (const c of m.cours ?? []) {
      const cp = c.course_progress?.[0];
      stepsTotal += 2;
      stepsDone += (cp?.video_watched ? 1 : 0) + (cp?.fiche_read ? 1 : 0);
    }
  }
  const globalProgress = stepsTotal > 0 ? Math.round((stepsDone / stepsTotal) * 100) : 0;
  coursSeen7d = sessionsThisWeek; // proxy: items travaillés via sessions cette semaine

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
    { label: 'QCM', value: qcmCount, color: '#E4002B' },
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
  const sign = (n: number) => (n >= 0 ? `+${n}` : `${n}`);

  const kpis = [
    { Icon: GraduationCap, label: 'Progression globale', value: `${globalProgress}%`, delta: `${sign(coursSeen7d)} cette semaine` },
    { Icon: Target, label: 'Taux de réussite', value: `${successRate}%`, delta: `${sign(successDelta)} pts cette semaine` },
    { Icon: ClipboardCheck, label: 'QCM réalisés', value: sessions.length, delta: `${sign(sessionsThisWeek)} cette semaine` },
    { Icon: Layers3, label: 'Flashcards acquises', value: `${fcMastered}/${flashcardsTotal ?? 0}`, delta: `${sign(reviewsThisWeek)} révisées` },
  ];

  const barColor = (v: number) => (v < 50 ? '#E4002B' : v < 75 ? '#F59E0B' : '#22C55E');

  return (
    <div className="px-5 py-7 lg:px-10">
      {/* Greeting */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-(--color-ink) sm:text-3xl">
          Bonjour, {firstName} 👋
        </h1>
        <p className="mt-1 text-sm text-(--color-ink-soft)">Prêt(e) à cartonner aujourd’hui ? 💪</p>
      </header>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <div className="flex items-center gap-2 text-(--color-ink-muted)">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--color-primary-soft) text-(--color-primary)">
                <k.Icon className="h-4 w-4" />
              </span>
              <span className="text-sm">{k.label}</span>
            </div>
            <p className="mt-3 text-3xl font-bold tracking-tight text-(--color-ink)">{k.value}</p>
            <p className="mt-1 text-xs font-medium text-(--color-success)">{k.delta}</p>
          </Card>
        ))}
      </div>

      {/* Row 1 */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-(--color-ink)">Évolution de ta performance</h2>
              <p className="text-xs text-(--color-ink-muted)">Questions tentées par jour.</p>
            </div>
            <span className="rounded-lg border border-(--color-border) px-2.5 py-1 text-xs text-(--color-ink-soft)">
              30 derniers jours
            </span>
          </div>
          <ActivityArea data={days} />
        </Card>

        <Card>
          <h2 className="font-semibold text-(--color-ink)">Matières à prioriser</h2>
          <p className="mb-4 text-xs text-(--color-ink-muted)">Basé sur tes performances.</p>
          {matieres.length > 0 ? (
            <ul className="space-y-3">
              {matieres.slice(0, 6).map((m) => (
                <li key={m.id}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="truncate text-(--color-ink)">{m.nom}</span>
                    <span className="font-semibold tabular-nums text-(--color-ink-soft)">{m.value}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-(--color-sand-200)">
                    <div className="h-full rounded-full" style={{ width: `${m.value}%`, background: barColor(m.value) }} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-8 text-center text-sm text-(--color-ink-muted)">Lancez vos premiers QCM.</p>
          )}
        </Card>
      </div>

      {/* Row 2 */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="font-semibold text-(--color-ink)">Activité récente</h2>
          <p className="mb-3 text-xs text-(--color-ink-muted)">Vos dernières sessions de travail.</p>
          {recent.length > 0 ? (
            <ul className="divide-y divide-(--color-border)">
              {recent.map((r, i) => (
                <li key={i} className="flex items-center gap-3 py-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-(--color-sand-100) text-(--color-primary)">
                    {r.kind === 'Flashcards' ? <Layers3 className="h-4 w-4" /> : r.kind === 'Annale' ? <History className="h-4 w-4" /> : <ClipboardCheck className="h-4 w-4" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-(--color-ink)">{r.kind} — {r.college}</span>
                    <span className="block truncate text-xs text-(--color-ink-muted)">{r.label}</span>
                  </span>
                  <span className="shrink-0 text-xs text-(--color-ink-muted)">{ago(r.when)}</span>
                  {r.score && (
                    <span className="shrink-0 rounded-full bg-(--color-primary-soft) px-2 py-0.5 text-xs font-semibold text-(--color-primary-deep)">
                      {r.score}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-8 text-center text-sm text-(--color-ink-muted)">Aucune activité pour le moment.</p>
          )}
        </Card>

        <Card>
          <h2 className="font-semibold text-(--color-ink)">Répartition par type d’activité</h2>
          <p className="mb-4 text-xs text-(--color-ink-muted)">Sur l’ensemble de votre travail.</p>
          {repartition.length > 0 ? (
            <ActivityDonut data={repartition} />
          ) : (
            <p className="py-8 text-center text-sm text-(--color-ink-muted)">Pas encore de données.</p>
          )}
        </Card>
      </div>

      {/* À réviser */}
      {toReview.length > 0 && (
        <Card className="mt-4">
          <h2 className="font-semibold text-(--color-ink)">À réviser en priorité</h2>
          <p className="mb-3 text-xs text-(--color-ink-muted)">Collèges où votre réussite est inférieure à 70 %.</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {toReview.map((m) => (
              <Link
                key={m.id}
                href={`/matieres/${m.id}`}
                className="group flex items-center justify-between rounded-xl border border-(--color-border) bg-(--color-surface-soft) px-3.5 py-3 transition-colors hover:border-(--color-accent)"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-(--color-ink)">{m.nom}</span>
                  <span
                    className="mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={
                      m.value < 50
                        ? { background: '#FDE7E9', color: '#C0001F' }
                        : { background: '#FEF3E2', color: '#B26A00' }
                    }
                  >
                    {m.value < 50 ? 'Priorité haute' : 'Priorité moyenne'}
                  </span>
                </span>
                <span className="flex items-center gap-1 text-sm font-semibold text-(--color-ink-soft)">
                  {m.value}%
                  <ArrowRight className="h-3.5 w-3.5 text-(--color-ink-muted) transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {/* Colleges */}
      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-(--color-ink)">Vos collèges</h2>
          <Link href="/facultes" className="inline-flex items-center gap-1 text-sm text-(--color-accent-deep) hover:underline">
            Tout voir <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <CollegesGrid scope={scope} />
      </div>
    </div>
  );
}

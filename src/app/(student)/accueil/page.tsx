import Link from 'next/link';
import { ArrowRight, ClipboardCheck, GraduationCap, History, Layers3, Target } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { parseScope, canAccessCollege } from '@/lib/auth/permissions';
import { UpgradeBanner } from '@/components/student/upgrade-banner';
import { CollegesGrid } from '@/components/student/colleges-grid';
import { EDN_FACULTE_ID } from '@/lib/data/navigator';
import { ActivityArea, ActivityDonut } from '@/components/admin/stats/charts';
import { DIFFICULTY_SCORE, FLASHCARD_MASTERY_THRESHOLD, type Difficulty } from '@/types/domain';

export const metadata = { title: 'Accueil' };


// Le « cours » (Pédiatrie, Pneumologie…) est l'unité de progression
// affichée à l'utilisateur. La matière (« Médecine générale ») n'est
// qu'un conteneur — on ne l'utilise plus pour agréger sur le dashboard.
type CoursRef = { id: string; titre: string };
type AttemptRow = {
  is_correct: boolean;
  attempted_at: string;
  qcm_questions: {
    qcm_series: {
      type: string;
      cours: CoursRef & {
        matieres: { id: string; nom: string; semestres: { faculte_id: string } };
      };
    };
  };
};
type SessionRow = {
  score_correct: number;
  score_total: number;
  finished_at: string | null;
  qcm_series: {
    label: string;
    type: string;
    cours: CoursRef & {
      matieres: { id: string; nom: string; semestres: { faculte_id: string } };
    };
  };
};
type ReviewRow = {
  difficulty: string;
  reviewed_at: string;
  flashcards: {
    cours: CoursRef & {
      matieres: { id: string; nom: string; semestres: { faculte_id: string } };
    };
  };
};
type CollegeRow = {
  id: string;
  nom: string;
  cours?: {
    id: string;
    titre: string;
    course_progress: { video_watched: boolean | null; fiche_read: boolean | null }[] | null;
  }[] | null;
};

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
        .select('is_correct, attempted_at, qcm_questions!inner(qcm_series!inner(type, cours!inner(id, titre, matieres!inner(id, nom, semestres!inner(faculte_id)))))')
        .eq('user_id', user.id),
      supabase
        .from('qcm_sessions')
        .select('score_correct, score_total, finished_at, qcm_series!inner(label, type, cours!inner(id, titre, matieres!inner(id, nom, semestres!inner(faculte_id))))')
        .eq('user_id', user.id)
        .not('finished_at', 'is', null)
        .order('finished_at', { ascending: false }),
      supabase
        .from('flashcard_reviews')
        .select('difficulty, reviewed_at, flashcards!inner(cours!inner(id, titre, matieres!inner(id, nom, semestres!inner(faculte_id))))')
        .eq('user_id', user.id)
        .order('reviewed_at', { ascending: false }),
      supabase
        .from('facultes')
        .select('semestres(matieres(id, nom, order_index, cours(id, titre, order_index, course_progress(video_watched, fiche_read))))')
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
  const weekAgo = now - 7 * 86400_000;
  const twoWeeksAgo = now - 14 * 86400_000;
  const totalAttempts = attempts.length;
  const correct = attempts.filter((a) => a.is_correct).length;
  const successRate = totalAttempts > 0 ? Math.round((correct / totalAttempts) * 100) : 0;

  // Deltas hebdo (semaine S vs S-1)
  const inWindow = (t: string | null, from: number, to: number) => {
    if (!t) return false;
    const v = new Date(t).getTime();
    return v >= from && v < to;
  };
  const attemptsThisWeek = attempts.filter((a) => inWindow(a.attempted_at, weekAgo, now)).length;
  const attemptsPrevWeek = attempts.filter((a) => inWindow(a.attempted_at, twoWeeksAgo, weekAgo)).length;
  const sessionsThisWeek = sessions.filter((s) => inWindow(s.finished_at, weekAgo, now)).length;
  const reviewsThisWeek = reviews.filter((r) => inWindow(r.reviewed_at, weekAgo, now)).length;
  const correctThisWeek = attempts.filter((a) => a.is_correct && inWindow(a.attempted_at, weekAgo, now)).length;
  const successThisWeek = attemptsThisWeek > 0 ? Math.round((correctThisWeek / attemptsThisWeek) * 100) : 0;
  const correctPrevWeek = attempts.filter((a) => a.is_correct && inWindow(a.attempted_at, twoWeeksAgo, weekAgo)).length;
  const successPrevWeek = attemptsPrevWeek > 0 ? Math.round((correctPrevWeek / attemptsPrevWeek) * 100) : 0;
  const successDelta = successThisWeek - successPrevWeek;

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

  // Progression PAR COURS (Pédiatrie, Pneumologie…) — pas par matière.
  // Chaque cours est l'unité visible côté élève sur la sidebar.
  // Combine taux de réussite QCM + couverture vidéo/fiche pour donner
  // un % unifié par item.
  type CoursStats = {
    id: string; titre: string; matiereNom: string;
    attempts: number; correct: number;
    videoDone: boolean; ficheDone: boolean;
  };
  const perCours = new Map<string, CoursStats>();

  // Pré-remplit avec TOUS les cours accessibles (mêmes ceux sans attempt),
  // pour qu'ils apparaissent à 0 % au lieu d'être absents.
  for (const m of colleges) {
    for (const c of m.cours ?? []) {
      const cp = c.course_progress?.[0];
      perCours.set(c.id, {
        id: c.id, titre: c.titre, matiereNom: m.nom,
        attempts: 0, correct: 0,
        videoDone: !!cp?.video_watched,
        ficheDone: !!cp?.fiche_read,
      });
    }
  }
  for (const a of attempts) {
    const c = a.qcm_questions.qcm_series.cours;
    const e = perCours.get(c.id);
    if (!e) continue;
    e.attempts++;
    if (a.is_correct) e.correct++;
  }

  // Score par item = moyenne pondérée : 50 % taux de réussite QCM,
  // 25 % vidéo vue, 25 % fiche lue. Si pas encore de QCM, on prend la
  // couverture vidéo+fiche seule.
  const matieres = [...perCours.values()]
    .map((c) => {
      const successPct = c.attempts > 0 ? (c.correct / c.attempts) * 100 : 0;
      const coverage = ((c.videoDone ? 1 : 0) + (c.ficheDone ? 1 : 0)) / 2 * 100;
      const value = c.attempts > 0
        ? Math.round(successPct * 0.5 + coverage * 0.5)
        : Math.round(coverage);
      return { id: c.id, nom: c.titre, value, matiereNom: c.matiereNom };
    })
    .sort((a, b) => a.value - b.value);
  // Regroupement par collège pour le panneau « Progression cours par cours »
  // (ordre alphabétique du collège, cours triés du plus faible au plus fort).
  type Group = { matiereNom: string; cours: typeof matieres; avg: number };
  const byMatiere = new Map<string, typeof matieres>();
  for (const c of matieres) {
    const arr = byMatiere.get(c.matiereNom) ?? [];
    arr.push(c);
    byMatiere.set(c.matiereNom, arr);
  }
  const coursByMatiere: Group[] = [...byMatiere.entries()]
    .map(([matiereNom, list]) => ({
      matiereNom,
      cours: [...list].sort((a, b) => a.value - b.value),
      avg: Math.round(list.reduce((s, c) => s + c.value, 0) / list.length),
    }))
    .sort((a, b) => a.matiereNom.localeCompare(b.matiereNom, 'fr'));

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
      college: s.qcm_series.cours.titre,
      when: s.finished_at ? new Date(s.finished_at).getTime() : 0,
      score: `${s.score_correct}/${s.score_total}`,
    })),
    ...reviews.slice(0, 4).map((r) => ({
      kind: 'Flashcards',
      label: 'Révision',
      college: r.flashcards.cours.titre,
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
    {
      Icon: GraduationCap, label: 'Progression globale', value: `${globalProgress}%`,
      hint: `${stepsDone} / ${stepsTotal} items revus`,
      delta: null as null | string,
      accent: '#5B8DEF',
    },
    {
      Icon: Target, label: 'Taux de réussite', value: `${successRate}%`,
      hint: `${correct} / ${totalAttempts} QCM réussis`,
      delta: successDelta !== 0 ? `${successDelta > 0 ? '+' : ''}${successDelta} pts cette semaine` : null,
      accent: '#22C55E',
    },
    {
      Icon: ClipboardCheck, label: 'QCM réalisés', value: sessions.length,
      hint: `sur ${Math.max(totalAttempts, 0)} QCM`,
      delta: sessionsThisWeek > 0 ? `+${sessionsThisWeek} cette semaine` : null,
      accent: '#E4002B',
    },
    {
      Icon: Layers3, label: 'Flashcards acquises', value: `${fcMastered} / ${flashcardsTotal ?? 0}`,
      hint: flashcardsTotal ? `${Math.round((fcMastered / flashcardsTotal) * 100)}% du deck étudié` : '—',
      delta: reviewsThisWeek > 0 ? `+${reviewsThisWeek} révisions cette semaine` : null,
      accent: '#8B5CF6',
    },
  ];

  const barColor = (v: number) => (v < 50 ? '#E4002B' : v < 75 ? '#F59E0B' : '#22C55E');

  const priorityPill = (v: number) => {
    if (v < 50) return { label: 'Urgent', bg: '#FDE7E9', fg: '#C0001F' };
    if (v < 75) return { label: 'À revoir', bg: '#FEF3E2', fg: '#B26A00' };
    return { label: 'En progrès', bg: '#E7F6EC', fg: '#16793C' };
  };

  return (
    <div className="flex flex-col gap-3 px-3 py-3 sm:px-4 lg:px-6 lg:py-4">
      {/* Greeting — sur mobile, l'encouragement passe sur une 2e ligne pour rester lisible */}
      <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
        <h1 className="text-base font-bold tracking-tight text-(--color-ink) sm:text-xl">
          Bonjour, {firstName} <span aria-hidden>👋</span>
        </h1>
        <p className="text-xs font-normal text-(--color-ink-soft) sm:text-sm">
          Prêt(e) à cartonner aujourd’hui ? <span aria-hidden>💪</span>
        </p>
      </div>

      {/* KPI row — chaque carte a un trait coloré en haut + une pastille
          d'icône assortie. */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="relative overflow-hidden rounded-xl border border-(--color-border) bg-(--color-surface) p-3 shadow-(--shadow-soft) sm:p-4"
          >
            <div
              className="absolute inset-x-0 top-0 h-[3px]"
              style={{ background: k.accent }}
              aria-hidden
            />
            <div className="flex items-center gap-2 text-(--color-ink-muted)">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg sm:h-8 sm:w-8"
                style={{ background: `${k.accent}1A`, color: k.accent }}
              >
                <k.Icon className="h-4 w-4" />
              </span>
              <span className="text-[11px] font-medium leading-tight sm:text-xs">{k.label}</span>
            </div>
            <p className="mt-1.5 text-xl font-bold tracking-tight text-(--color-ink) sm:mt-2 sm:text-2xl lg:text-3xl">{k.value}</p>
            <p className="mt-0.5 text-[11px] text-(--color-ink-muted)">{k.hint}</p>
            {k.delta && (
              <p className="mt-1 text-[11px] font-semibold text-[#16793C]">{k.delta}</p>
            )}
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid gap-3 lg:grid-cols-3">
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

        {/* Progression cours par cours — panneau scrollable groupé par collège.
            Tout est visible d'un coup d'œil, on défile à la souris pour voir l'ensemble. */}
        <Card className="lg:col-span-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-(--color-ink)">Progression cours par cours</h2>
              <p className="mt-0.5 text-[11px] text-(--color-ink-muted)">
                {matieres.length} cours · groupés par collège · faites défiler pour tout voir
              </p>
            </div>
            <Link href="/facultes" className="inline-flex shrink-0 items-center gap-1 text-xs text-(--color-accent-deep) hover:underline">
              Tous les collèges <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {matieres.length === 0 ? (
            <p className="py-8 text-center text-xs text-(--color-ink-muted)">
              Lancez vos premiers QCM ou ouvrez un cours pour voir votre progression apparaître ici.
            </p>
          ) : (
            <div
              className="max-h-[460px] overflow-y-auto pr-2"
              style={{ scrollbarWidth: 'thin' }}
            >
              <div className="space-y-4">
                {coursByMatiere.map((group) => (
                  <section key={group.matiereNom}>
                    <header className="sticky top-0 z-10 -mx-1 mb-2 flex items-center gap-2 bg-(--color-surface) px-1 py-1.5">
                      <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-(--color-ink-soft)">
                        {group.matiereNom}
                      </h3>
                      <span className="text-[11px] text-(--color-ink-muted)">·</span>
                      <span className="text-[11px] tabular-nums text-(--color-ink-muted)">
                        {group.cours.length} cours
                      </span>
                      <span className="ml-auto flex items-center gap-2">
                        <span className="text-[11px] font-semibold tabular-nums text-(--color-ink-soft)">
                          {group.avg}%
                        </span>
                        <span className="h-1.5 w-24 overflow-hidden rounded-full bg-(--color-sand-200)">
                          <span
                            className="block h-full rounded-full"
                            style={{ width: `${group.avg}%`, background: barColor(group.avg) }}
                          />
                        </span>
                      </span>
                    </header>
                    <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                      {group.cours.map((c) => {
                        const pill = priorityPill(c.value);
                        return (
                          <li key={c.id}>
                            <Link
                              href={`/cours/${c.id}`}
                              className="group flex items-center gap-2.5 rounded-lg border border-(--color-border) bg-(--color-surface) p-2.5 transition-colors hover:border-(--color-accent) hover:bg-(--color-primary-soft)/40"
                            >
                              <span className="min-w-0 flex-1 truncate text-xs font-medium text-(--color-ink)">
                                {c.nom}
                              </span>
                              <span className="hidden h-1.5 w-20 shrink-0 overflow-hidden rounded-full bg-(--color-sand-200) sm:block">
                                <span
                                  className="block h-full rounded-full"
                                  style={{ width: `${c.value}%`, background: barColor(c.value) }}
                                />
                              </span>
                              <span className="w-9 shrink-0 text-right text-xs font-semibold tabular-nums text-(--color-ink)">
                                {c.value}%
                              </span>
                              <span
                                className="hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold sm:inline"
                                style={{ background: pill.bg, color: pill.fg }}
                              >
                                {pill.label}
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Activité récente */}
        <Card className="flex min-h-0 flex-col lg:col-span-3">
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
      </div>

      {/* Vos collèges — grille complète (toutes les matières EDN accessibles) */}
      <section className="mt-2">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-(--color-ink)">Vos collèges</h2>
          <Link
            href="/facultes"
            className="inline-flex items-center gap-1 text-xs text-(--color-accent-deep) hover:underline"
          >
            Tout voir <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <CollegesGrid scope={scope} />
      </section>

      {/* CTA passage à l'abonnement (caché pour les abonnés) */}
      <div className="mt-8">
        <UpgradeBanner context="default" profile={profile} />
      </div>
    </div>
  );
}

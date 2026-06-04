import Link from 'next/link';
import {
  ArrowRight, BookOpen, Calendar, ClipboardCheck, Clock, FileText, GraduationCap,
  Layers3, Play, RefreshCcw, Target, TrendingUp, Zap,
} from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { parseScope, canAccessCollege } from '@/lib/auth/permissions';
import { AnnouncementsWidget } from '@/components/student/announcements-widget';
import { EDN_FACULTE_ID } from '@/lib/data/navigator';
import { DIFFICULTY_SCORE, FLASHCARD_MASTERY_THRESHOLD, type Difficulty } from '@/types/domain';

export const metadata = { title: 'Accueil' };

/* ============================================================
   Types
   ============================================================ */
type AttemptRow = {
  is_correct: boolean;
  attempted_at: string;
  time_spent_seconds: number | null;
  qcm_questions: {
    qcm_series: {
      type: string;
      cours: { id: string; titre: string; matieres: { id: string; nom: string; semestres: { faculte_id: string } } };
    };
  };
};
type SessionRow = {
  finished_at: string | null;
  qcm_series: { cours: { id: string; titre: string; matieres: { id: string; semestres: { faculte_id: string } } } };
};
type ReviewRow = {
  difficulty: string;
  reviewed_at: string;
  flashcards: { cours: { id: string; titre: string; matieres: { id: string; nom: string; semestres: { faculte_id: string } } } };
};
type CollegeRow = {
  id: string;
  nom: string;
  order_index: number | null;
  cours?: { id: string; titre: string; order_index: number | null; course_progress: { video_watched: boolean | null; fiche_read: boolean | null }[] | null }[] | null;
};

/* ============================================================
   PAGE
   ============================================================ */
export default async function AccueilPage() {
  const { user, profile } = await requireUser();
  const scope = parseScope(profile.permission_scope);
  const supabase = await createClient();

  const [
    { data: attemptsRaw },
    { data: sessionsRaw },
    { data: reviewsRaw },
    { data: edn },
    { count: flashcardsTotal },
    { count: qcmQuestionsTotal },
    { data: countdownAnn },
  ] = await Promise.all([
    supabase
      .from('qcm_attempts')
      .select('is_correct, attempted_at, time_spent_seconds, qcm_questions!inner(qcm_series!inner(type, cours!inner(id, titre, matieres!inner(id, nom, semestres!inner(faculte_id)))))')
      .eq('user_id', user.id),
    supabase
      .from('qcm_sessions')
      .select('finished_at, qcm_series!inner(cours!inner(id, titre, matieres!inner(id, semestres!inner(faculte_id))))')
      .eq('user_id', user.id)
      .not('finished_at', 'is', null),
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
    // Totaux scopés au programme EDN (les comptes globaux remontaient toute la
    // base, y compris contenu héritage hors EDN — d'où les chiffres faux affichés).
    supabase.from('flashcards')
      .select('id, cours!inner(matieres!inner(semestres!inner(faculte_id)))', { count: 'exact', head: true })
      .eq('cours.matieres.semestres.faculte_id', EDN_FACULTE_ID),
    supabase.from('qcm_questions')
      .select('id, qcm_series!inner(cours!inner(matieres!inner(semestres!inner(faculte_id))))', { count: 'exact', head: true })
      .eq('qcm_series.cours.matieres.semestres.faculte_id', EDN_FACULTE_ID),
    (supabase as unknown as {
      from: (t: string) => {
        select: (s: string) => {
          eq: (c: string, v: string) => {
            eq: (c: string, v: boolean) => {
              order: (c: string, o: { ascending: boolean }) => {
                limit: (n: number) => { maybeSingle: () => Promise<{ data: { data: Record<string, unknown> } | null }> };
              };
            };
          };
        };
      };
    })
      .from('homepage_announcements')
      .select('data')
      .eq('kind', 'countdown')
      .eq('visible', true)
      .order('order_index', { ascending: true })
      .limit(1)
      .maybeSingle(),
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
  const weekAgo = now - 7 * 86_400_000;
  const twoWeeksAgo = now - 14 * 86_400_000;
  const yearLabel = '2027'; // affiché dans EVC (PAE) 2027

  /* ---- Compte à rebours EVC ---- */
  const countdownData = (countdownAnn?.data ?? null) as Record<string, unknown> | null;
  const targetIso = typeof countdownData?.target_date === 'string'
    ? countdownData.target_date
    : '2027-10-12';
  const daysUntilExam = Math.max(0, Math.ceil((new Date(targetIso).getTime() - now) / 86_400_000));

  /* ---- Périmètre EDN ---- */
  const colleges = (
    ((edn as unknown as { semestres?: { matieres?: CollegeRow[] }[] } | null)?.semestres ?? [])
  )
    .flatMap((s) => s.matieres ?? [])
    .filter((m) => canAccessCollege(scope, m.id))
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

  /* ---- Progression couverture (vidéo + fiche) ---- */
  let stepsDone = 0, stepsTotal = 0;
  for (const m of colleges) {
    for (const c of m.cours ?? []) {
      const cp = c.course_progress?.[0];
      stepsTotal += 2;
      stepsDone += (cp?.video_watched ? 1 : 0) + (cp?.fiche_read ? 1 : 0);
    }
  }
  const globalProgress = stepsTotal > 0 ? Math.round((stepsDone / stepsTotal) * 100) : 0;

  /* ---- Statistiques attempts ---- */
  const totalAttempts = attempts.length;
  const correctTotal = attempts.filter((a) => a.is_correct).length;
  const inWindow = (t: string | null, from: number, to: number) => {
    if (!t) return false;
    const v = new Date(t).getTime();
    return v >= from && v < to;
  };
  const attemptsThisWeek = attempts.filter((a) => inWindow(a.attempted_at, weekAgo, now)).length;
  const sessionsCount = sessions.length;
  const sessionsThisWeek = sessions.filter((s) => inWindow(s.finished_at, weekAgo, now)).length;

  /* ---- Temps de révision (estimé à partir de time_spent_seconds + reviews) ---- */
  const secondsThisWeek =
    attempts.filter((a) => inWindow(a.attempted_at, weekAgo, now))
      .reduce((s, a) => s + (a.time_spent_seconds ?? 0), 0)
    + reviews.filter((r) => inWindow(r.reviewed_at, weekAgo, now)).length * 15; // ~15s/flashcard
  const hoursThisWeek = Math.floor(secondsThisWeek / 3600);
  const minsThisWeek = Math.floor((secondsThisWeek % 3600) / 60);
  const goalSeconds = 6 * 3600;

  /* ---- Flashcards maîtrisées ---- */
  const { data: fr2 } = await supabase
    .from('flashcard_reviews')
    .select('flashcard_id, difficulty, flashcards!inner(cours!inner(matieres!inner(semestres!inner(faculte_id))))')
    .eq('user_id', user.id);
  const scoreByCard = new Map<string, number>();
  type FR2 = { flashcard_id: string; difficulty: string; flashcards: { cours: { matieres: { semestres: { faculte_id: string } } } } };
  for (const r of ((fr2 ?? []) as unknown as FR2[])) {
    if (!inEdn(r.flashcards.cours.matieres.semestres.faculte_id)) continue;
    scoreByCard.set(r.flashcard_id, (scoreByCard.get(r.flashcard_id) ?? 0) + (DIFFICULTY_SCORE[r.difficulty as Difficulty] ?? 0));
  }
  let fcMastered = 0;
  for (const v of scoreByCard.values()) if (v >= FLASHCARD_MASTERY_THRESHOLD) fcMastered++;

  /* ---- Score par cours (priorité de révision) ---- */
  type CoursStats = {
    id: string; titre: string; matiereNom: string;
    attempts: number; correct: number;
    videoDone: boolean; ficheDone: boolean;
  };
  const perCours = new Map<string, CoursStats>();
  for (const m of colleges) {
    for (const c of m.cours ?? []) {
      const cp = c.course_progress?.[0];
      perCours.set(c.id, {
        id: c.id, titre: c.titre, matiereNom: m.nom,
        attempts: 0, correct: 0,
        videoDone: !!cp?.video_watched, ficheDone: !!cp?.fiche_read,
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
  const coursScored = [...perCours.values()].map((c) => {
    const successPct = c.attempts > 0 ? (c.correct / c.attempts) * 100 : 0;
    const coverage = ((c.videoDone ? 1 : 0) + (c.ficheDone ? 1 : 0)) / 2 * 100;
    const value = c.attempts > 0
      ? Math.round(successPct * 0.5 + coverage * 0.5)
      : Math.round(coverage);
    return { id: c.id, titre: c.titre, matiereNom: c.matiereNom, value, attempts: c.attempts };
  });

  // À travailler en priorité : 5 cours les plus faibles (en privilégiant ceux
  // qui ont déjà été abordés pour fournir un signal pertinent ; sinon tirés).
  const priorities = [...coursScored]
    .sort((a, b) => a.value - b.value)
    .slice(0, 5);
  const nextPriority = priorities[0] ?? null;

  /* ---- Items maîtrisés (cours ≥ 75 %) ---- */
  const itemsMastered = coursScored.filter((c) => c.value >= 75).length;
  const itemsTotal = qcmQuestionsTotal ?? 0;
  // Total cours du programme (= dénominateur cohérent pour « items maîtrisés »)
  const coursTotalEdn = coursScored.length;
  const flashcardsTotalEdn = flashcardsTotal ?? 0;

  /* ---- Progression par cours groupée par collège ---- */
  type Group = { matiereNom: string; cours: typeof coursScored };
  const byMatiere = new Map<string, typeof coursScored>();
  for (const c of coursScored) {
    const arr = byMatiere.get(c.matiereNom) ?? [];
    arr.push(c);
    byMatiere.set(c.matiereNom, arr);
  }
  const coursByMatiere: Group[] = [...byMatiere.entries()]
    .map(([matiereNom, list]) => ({
      matiereNom,
      cours: [...list].sort((a, b) => a.value - b.value),
    }))
    .sort((a, b) => a.matiereNom.localeCompare(b.matiereNom, 'fr'));

  /* ---- Évolution 30 jours ---- */
  const days: { dayLabel: string; value: number }[] = [];
  const idxByKey = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now - i * 86_400_000);
    idxByKey.set(d.toISOString().slice(0, 10), days.length);
    days.push({
      dayLabel: d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      value: 0,
    });
  }
  for (const a of attempts) {
    const i = idxByKey.get(new Date(a.attempted_at).toISOString().slice(0, 10));
    if (i !== undefined) days[i].value++;
  }
  // Pour la jauge de la courbe : valeur max sur les 30j (au moins 4)
  const maxDay = Math.max(4, ...days.map((d) => d.value));

  /* ---- Répartition révisions (QCM vs Flashcards) ---- */
  const totalRevisions = totalAttempts + reviews.length;
  const qcmPct = totalRevisions > 0 ? Math.round((totalAttempts / totalRevisions) * 100) : 0;
  const fcPct  = totalRevisions > 0 ? Math.round((reviews.length / totalRevisions) * 100) : 0;

  /* ---- Cette semaine (3 stats) ---- */
  const reviewsThisWeek = reviews.filter((r) => inWindow(r.reviewed_at, weekAgo, now)).length;
  const coursTouchedThisWeek = new Set<string>();
  for (const a of attempts) if (inWindow(a.attempted_at, weekAgo, now)) coursTouchedThisWeek.add(a.qcm_questions.qcm_series.cours.id);
  for (const r of reviews) if (inWindow(r.reviewed_at, weekAgo, now)) coursTouchedThisWeek.add(r.flashcards.cours.id);
  const itemsConsolidatedThisWeek = coursTouchedThisWeek.size;
  // Progression delta hebdo (≈ items revus cette semaine / total)
  const totalCoursCount = coursScored.length;
  const progDeltaPct = totalCoursCount > 0 ? Math.round((itemsConsolidatedThisWeek / totalCoursCount) * 100) : 0;

  const firstName = profile.first_name || 'étudiant';
  const ago = (t: number) => {
    const h = Math.round((now - t) / 3_600_000);
    if (h < 1) return "à l'instant";
    if (h < 24) return `il y a ${h} h`;
    const d = Math.round(h / 24);
    return d === 1 ? 'hier' : `il y a ${d} j`;
  };

  /* ---- Activité récente ---- */
  type Recent = { kind: string; college: string; when: number };
  const recent: Recent[] = [
    ...sessions.slice(0, 6).map((s) => ({
      kind: 'QCM',
      college: s.qcm_series.cours.titre,
      when: s.finished_at ? new Date(s.finished_at).getTime() : 0,
    })),
    ...reviews.slice(0, 4).map((r) => ({
      kind: 'Flashcards',
      college: r.flashcards.cours.titre,
      when: new Date(r.reviewed_at).getTime(),
    })),
  ].sort((a, b) => b.when - a.when).slice(0, 5);

  /* ---- Aujourd'hui — objectif du jour ---- */
  const todayQcmTarget = 15;
  const todayCasTarget = 1;
  const todayFcTarget = 10;
  const todayEstMin = 35;

  return (
    <div className="mx-auto grid w-full max-w-[1640px] gap-5 px-3 py-4 sm:px-4 lg:px-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      {/* ============ COLONNE PRINCIPALE ============ */}
      <div className="flex min-w-0 flex-col gap-5">

        {/* ---- Bandeau de bienvenue ---- */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-(--color-ink) sm:text-3xl">
              Bonjour, {firstName} <span aria-hidden>👋</span>
            </h1>
            <p className="mt-1 text-sm text-(--color-ink-soft) sm:text-[15px]">
              Plus que <span className="font-bold text-(--color-primary)">{daysUntilExam} jours</span> avant
              les EVC (PAE {yearLabel}) — Chaque jour compte ! <span aria-hidden>💪</span>
            </p>
          </div>
          <div className="flex items-end gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-xs text-(--color-ink-soft)">Prêt(e) à avancer aujourd&rsquo;hui ?</p>
            </div>
            <Link
              href="/revisions-transversales"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1E40AF] px-4 py-2.5 text-sm font-bold text-white shadow-(--shadow-soft) transition-transform hover:scale-[1.02]"
            >
              <Play className="h-4 w-4" /> Reprendre l&rsquo;entraînement
            </Link>
          </div>
        </header>

        {/* ---- KPI cards (4) ---- */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* 1. Progression globale */}
          <KpiCard accent="#2563EB" Icon={Target} label="Progression globale">
            <div className="flex items-center gap-3">
              <ProgressRing pct={globalProgress} />
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-(--color-ink-muted)">Prochaine priorité</p>
                <p className="truncate text-sm font-extrabold text-(--color-ink)">
                  {nextPriority?.titre ?? '—'}
                </p>
                <p className="mt-0.5 text-[11px] text-(--color-ink-soft)">Temps estimé : 2h15</p>
              </div>
            </div>
            <Link href="/matieres" className="mt-auto inline-flex items-center gap-1 pt-2 text-[12px] font-bold text-[#2563EB] hover:underline">
              Voir mon plan de travail <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </KpiCard>

          {/* 2. Temps de révision */}
          <KpiCard accent="#16A34A" Icon={Clock} label="Temps de révision">
            <p className="text-4xl font-black tabular-nums text-(--color-ink)">
              {hoursThisWeek}h <span className="text-2xl">{minsThisWeek.toString().padStart(2, '0')}</span>
            </p>
            <p className="text-xs text-(--color-ink-soft)">cette semaine</p>
            <div className="mt-auto">
              <p className="rounded-md bg-[#DCFCE7] px-2 py-1 text-center text-[11px] font-bold text-[#16793C]">
                Objectif conseillé : 6h / semaine
              </p>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-(--color-sand-200)">
                <div className="h-full rounded-full bg-[#16A34A]" style={{ width: `${Math.min(100, (secondsThisWeek / goalSeconds) * 100)}%` }} />
              </div>
            </div>
          </KpiCard>

          {/* 3. QCM réalisés */}
          <KpiCard accent="#C0112E" Icon={ClipboardCheck} label="QCM réalisés">
            <p className="text-4xl font-black tabular-nums text-(--color-ink)">{sessionsCount}</p>
            <p className="text-xs text-(--color-ink-soft)">sur {itemsTotal} QCM</p>
            <Link href="/entrainement" className="mt-auto inline-flex items-center justify-center gap-1 rounded-md bg-[#FCEAEC] px-2 py-1.5 text-[12px] font-bold text-[#C0112E] hover:bg-[#FAD1D6]">
              Commencer un entraînement <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </KpiCard>

          {/* 4. Items maîtrisés (cours ≥ 75 % de réussite) */}
          <KpiCard accent="#7C3AED" Icon={Layers3} label="Items maîtrisés">
            <p className="text-3xl font-black tabular-nums text-(--color-ink)">
              {itemsMastered} <span className="text-xl text-(--color-ink-soft)">/ {coursTotalEdn}</span>
            </p>
            <p className="text-xs text-(--color-ink-soft)">
              {coursTotalEdn > 0 ? Math.round((itemsMastered / coursTotalEdn) * 100) : 0}% des cours maîtrisés
            </p>
            <Link href="/matieres" className="mt-auto inline-flex items-center justify-center gap-1 rounded-md bg-[#EDE9FE] px-2 py-1.5 text-[12px] font-bold text-[#7C3AED] hover:bg-[#DDD3FB]">
              Voir mes lacunes <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </KpiCard>
        </section>

        {/* ---- 3 cartes : Aujourd'hui + Évolution + Répartition ---- */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[0.85fr_1.4fr_0.95fr]">
          {/* Aujourd'hui */}
          <Card>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EDE9FE] text-[#7C3AED]">
                <Target className="h-4 w-4" />
              </span>
              <p className="text-sm font-bold text-(--color-ink)">Aujourd&rsquo;hui</p>
            </div>
            <p className="mt-1 text-[11px] text-(--color-ink-soft)">
              Objectif du jour pour avancer sereinement
            </p>
            <ul className="mt-3 space-y-2">
              <TodayRow Icon={ClipboardCheck} bg="#FCEAEC" fg="#C0112E" title={`${todayQcmTarget} QCM ciblés`} sub={nextPriority?.matiereNom ?? 'Cardiologie'} />
              <TodayRow Icon={FileText}       bg="#DBEAFE" fg="#2563EB" title={`${todayCasTarget} cas clinique`} sub="Analyse et raisonnement" />
              <TodayRow Icon={Layers3}        bg="#EDE9FE" fg="#7C3AED" title={`${todayFcTarget} flashcards`} sub="Révision active" />
              <TodayRow Icon={Clock}          bg="#FEF3C7" fg="#D97706" title="Temps estimé" sub={`${todayEstMin} min`} />
            </ul>
            <Link href="/revisions-transversales" className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-[#1E40AF] px-3 py-2 text-sm font-bold text-white hover:scale-[1.01]">
              <Play className="h-4 w-4" /> Commencer maintenant
            </Link>
          </Card>

          {/* Évolution */}
          <Card>
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-bold text-(--color-ink)">Évolution de ta performance</p>
              <span className="rounded-md border border-(--color-border) px-2 py-0.5 text-[11px] text-(--color-ink-soft)">30 jours</span>
            </div>
            <Sparkline days={days} max={maxDay} />
            <div className="mt-3 flex items-start gap-2 rounded-xl bg-[#F5F3FF] p-3">
              <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-[#7C3AED]" />
              <p className="text-[12px] leading-relaxed text-(--color-ink)">
                <strong>Vos résultats s&rsquo;amélioreront avec la régularité.</strong>{' '}
                Continuez vos entraînements !
              </p>
            </div>
          </Card>

          {/* Répartition révisions */}
          <Card>
            <p className="text-sm font-bold text-(--color-ink)">Répartition de tes révisions</p>
            <div className="mt-3 flex items-center gap-4">
              <DonutChart qcmPct={qcmPct} fcPct={fcPct} />
              <div className="flex-1 space-y-2 text-[12px]">
                <LegendRow color="#C0112E" label="QCM" count={totalAttempts} pct={qcmPct} />
                <LegendRow color="#7C3AED" label="Flashcards" count={reviews.length} pct={fcPct} />
              </div>
            </div>
            <p className="mt-3 border-t border-(--color-border) pt-2 text-[11px] text-(--color-ink-soft)">
              Total étudié : <span className="font-bold text-(--color-ink)">{totalRevisions} / {itemsTotal + flashcardsTotalEdn}</span>
            </p>
          </Card>
        </section>

        {/* ---- À travailler en priorité ---- */}
        <Card>
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-(--color-ink)">À travailler en priorité</p>
              <p className="mt-0.5 text-[11px] text-(--color-ink-soft)">Basé sur vos résultats</p>
            </div>
          </div>
          {priorities.length === 0 ? (
            <p className="mt-4 text-center text-xs text-(--color-ink-muted)">
              Lancez vos premiers QCM pour voir vos priorités apparaître ici.
            </p>
          ) : (
            <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {priorities.map((p, i) => {
                const pill = p.value < 50
                  ? { label: 'Priorité haute',   bg: '#FCEAEC', fg: '#C0112E' }
                  : { label: 'Priorité moyenne', bg: '#FFEDD5', fg: '#B45B00' };
                return (
                  <li key={p.id}>
                    <Link
                      href={`/cours/${p.id}`}
                      className="flex items-center gap-2.5 rounded-xl border border-(--color-border) bg-(--color-surface) p-2.5 hover:border-(--color-primary)/40 hover:bg-(--color-primary-soft)/30"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-(--color-sand-100) text-[12px] font-black text-(--color-ink-soft)">
                        {i + 1}
                      </span>
                      <span className="flex-1 truncate text-sm font-bold text-(--color-ink)">{p.titre}</span>
                      <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: pill.bg, color: pill.fg }}>
                        {pill.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="mt-3 flex justify-center">
            <Link href="/matieres" className="inline-flex items-center gap-1 rounded-md bg-[#EDE9FE] px-3 py-1.5 text-[12px] font-bold text-[#7C3AED] hover:bg-[#DDD3FB]">
              Voir toutes mes lacunes <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Card>

        {/* ---- Progression par cours ---- */}
        <Card>
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-(--color-ink)">Progression par cours</p>
              <p className="mt-0.5 text-[11px] text-(--color-ink-soft)">
                {coursScored.length} cours · Groupés par collège · Faites défiler pour tout voir
              </p>
            </div>
          </div>
          <div className="max-h-[300px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
            {coursByMatiere.map((g) => (
              <section key={g.matiereNom}>
                <p className="sticky top-0 bg-(--color-surface) py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-(--color-ink-muted)">
                  {g.matiereNom}
                </p>
                <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {g.cours.map((c) => {
                    const pill = c.value < 50
                      ? { label: 'Urgent', bg: '#FCEAEC', fg: '#C0112E' }
                      : c.value < 75
                      ? { label: 'À revoir', bg: '#FEF3C7', fg: '#A16207' }
                      : { label: 'En progrès', bg: '#DCFCE7', fg: '#16A34A' };
                    return (
                      <li key={c.id}>
                        <Link href={`/cours/${c.id}`} className="flex items-center gap-2 rounded-lg border border-(--color-border) bg-(--color-surface) px-2.5 py-1.5 hover:border-(--color-primary)/40">
                          <span className="min-w-0 flex-1 truncate text-[12.5px] text-(--color-ink)">{c.titre}</span>
                          <span className="hidden h-1 w-16 shrink-0 overflow-hidden rounded-full bg-(--color-sand-200) sm:block">
                            <span className="block h-full rounded-full" style={{ width: `${c.value}%`, background: pill.fg }} />
                          </span>
                          <span className="w-8 shrink-0 text-right text-[11px] font-bold tabular-nums text-(--color-ink)">{c.value}%</span>
                          <span className="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold" style={{ background: pill.bg, color: pill.fg }}>
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
        </Card>

        {/* ---- Activité récente + Cette semaine ---- */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-(--color-sand-100) text-(--color-ink-soft)">
                <RefreshCcw className="h-3.5 w-3.5" />
              </span>
              <p className="text-sm font-bold text-(--color-ink)">Activité récente</p>
            </div>
            {recent.length === 0 ? (
              <p className="mt-3 text-[12.5px] text-(--color-ink-soft)">
                Aucune activité récente. Lancez votre premier entraînement !
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {recent.map((r, i) => (
                  <li key={i} className="flex items-center gap-2 text-[12px]">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-(--color-sand-100) text-(--color-ink-soft)">
                      {r.kind === 'QCM' ? <ClipboardCheck className="h-3 w-3" /> : <Layers3 className="h-3 w-3" />}
                    </span>
                    <span className="flex-1 truncate text-(--color-ink)">{r.kind} · {r.college}</span>
                    <span className="shrink-0 text-(--color-ink-muted)">{ago(r.when)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#DCFCE7] text-[#16A34A]">
                <Zap className="h-3.5 w-3.5" />
              </span>
              <p className="text-sm font-bold text-(--color-ink)">Cette semaine</p>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <WeekStat Icon={TrendingUp} value={`+${progDeltaPct}%`} label="Progression" color="#16A34A" />
              <WeekStat Icon={Layers3}    value={`+${reviewsThisWeek}`} label="Flashcards révisées" color="#7C3AED" />
              <WeekStat Icon={Target}     value={`+${itemsConsolidatedThisWeek}`} label="Items consolidés" color="#2563EB" />
            </div>
          </Card>
        </section>
      </div>

      {/* ============ SIDEBAR DROITE ============ */}
      <aside className="space-y-3">
        <AnnouncementsWidget />
      </aside>
    </div>
  );
}

/* ============================================================
   Sub-components
   ============================================================ */
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-soft) ${className}`}>
      {children}
    </div>
  );
}

function KpiCard({
  accent, Icon, label, children,
}: {
  accent: string;
  Icon: typeof Target;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col gap-2 overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface) p-3.5 shadow-(--shadow-soft)">
      <span aria-hidden className="absolute inset-x-0 top-0 h-[3px]" style={{ background: accent }} />
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: `${accent}1A`, color: accent }}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        <p className="text-[12px] font-bold text-(--color-ink)">{label}</p>
      </div>
      {children}
    </div>
  );
}

function ProgressRing({ pct }: { pct: number }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  return (
    <span className="relative inline-flex h-14 w-14 shrink-0 items-center justify-center">
      <svg viewBox="0 0 60 60" className="h-14 w-14 -rotate-90">
        <defs>
          <linearGradient id="kpi-prog-arc" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#3B5BFF" stopOpacity="1" />
            <stop offset="60%"  stopColor="#7C93FF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#C7D2FF" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <circle cx="30" cy="30" r={r} fill="none" stroke="#EEF1FB" strokeWidth="5" />
        <circle cx="30" cy="30" r={r} fill="none" stroke="url(#kpi-prog-arc)" strokeWidth="5" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ - (circ * pct) / 100} />
      </svg>
      <span className="absolute text-sm font-black tabular-nums text-[#0F1F4D]">{pct}%</span>
    </span>
  );
}

function TodayRow({ Icon, bg, fg, title, sub }: { Icon: typeof Target; bg: string; fg: string; title: string; sub: string }) {
  return (
    <li className="flex items-center gap-2.5">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: bg, color: fg }}>
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[12.5px] font-bold text-(--color-ink)">{title}</p>
        <p className="text-[11px] text-(--color-ink-soft)">{sub}</p>
      </div>
    </li>
  );
}

function Sparkline({ days, max }: { days: { dayLabel: string; value: number }[]; max: number }) {
  const W = 600, H = 110, P = 6;
  const points = days.map((d, i) => {
    const x = P + (i * (W - 2 * P)) / (days.length - 1);
    const y = H - P - ((d.value / max) * (H - 2 * P));
    return { x, y };
  });
  const poly = points.map((p) => `${p.x},${p.y}`).join(' ');
  return (
    <div className="relative mt-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-28 w-full">
        {[0.25, 0.5, 0.75, 1].map((g, i) => (
          <line key={i} x1={P} y1={H - P - g * (H - 2 * P)} x2={W - P} y2={H - P - g * (H - 2 * P)} stroke="#F1F5F9" strokeWidth="1" />
        ))}
        <polyline points={poly} fill="none" stroke="#C0112E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="2.2" fill="#C0112E" />
        ))}
      </svg>
      {/* Quelques labels d'axe (4) */}
      <div className="mt-1 grid grid-cols-4 text-[9px] text-(--color-ink-muted)">
        {[0, 9, 19, 29].map((i) => <span key={i}>{days[i]?.dayLabel}</span>)}
      </div>
    </div>
  );
}

function DonutChart({ qcmPct, fcPct }: { qcmPct: number; fcPct: number }) {
  const r = 26;
  const circ = 2 * Math.PI * r;
  const qcmLen = (circ * qcmPct) / 100;
  const fcLen  = (circ * fcPct) / 100;
  return (
    <span className="relative inline-flex h-20 w-20 items-center justify-center">
      <svg viewBox="0 0 70 70" className="h-20 w-20 -rotate-90">
        <circle cx="35" cy="35" r={r} fill="none" stroke="#F1F5F9" strokeWidth="9" />
        <circle cx="35" cy="35" r={r} fill="none" stroke="#C0112E" strokeWidth="9"
          strokeDasharray={`${qcmLen} ${circ - qcmLen}`} />
        <circle cx="35" cy="35" r={r} fill="none" stroke="#7C3AED" strokeWidth="9"
          strokeDasharray={`${fcLen} ${circ - fcLen}`} strokeDashoffset={-qcmLen} />
      </svg>
    </span>
  );
}

function LegendRow({ color, label, count, pct }: { color: string; label: string; count: number; pct: number }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
        <span className="text-(--color-ink)">{label} ({count})</span>
      </span>
      <span className="font-bold tabular-nums text-(--color-ink-soft)">{pct}%</span>
    </div>
  );
}

function WeekStat({ Icon, value, label, color }: { Icon: typeof Target; value: string; label: string; color: string }) {
  return (
    <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-2.5 text-center">
      <span className="mx-auto flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: `${color}1A`, color }}>
        <Icon className="h-3.5 w-3.5" />
      </span>
      <p className="mt-1.5 text-base font-black tabular-nums" style={{ color }}>{value}</p>
      <p className="text-[10px] leading-tight text-(--color-ink-soft)">{label}</p>
    </div>
  );
}

import Link from 'next/link';
import {
  AlertTriangle, ArrowRight, BookOpen, Calendar, CheckCircle2, ClipboardList,
  HelpCircle, History, Lightbulb, RefreshCcw, Sparkles, Target, TrendingUp,
} from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { parseScope, canAccessCollege } from '@/lib/auth/permissions';
import { EDN_FACULTE_ID } from '@/lib/data/navigator';

export const metadata = { title: 'Révisions transversales' };

/* ------------------------------------------------------------------
   STATE — calcule tout ce qui est affiché à partir des données réelles.
------------------------------------------------------------------ */
type SpecRow = {
  cours_id: string;
  titre: string;
  matiere_nom: string;
  last_revision: Date | null;
  revisions_30d: number;
  total_attempts: number;
  correct_ratio: number;       // 0..1
  status: 'validee' | 'consolider' | 'renforcer' | 'non_evaluee';
};

type State = {
  firstName: string;
  /** Compteur 30 jours glissants. */
  revisions30d: number;
  /** Date de dernière révision transversale. */
  lastRevision: Date | null;
  /** Nombre total de révisions transversales depuis le début. */
  totalRevisions: number;
  /** "Meilleure période" — fixe par défaut tant qu'on n'a pas de streak réel. */
  bestStreakDays: number;
  /** Jours écoulés depuis la dernière révision (Infinity si jamais). */
  daysSinceLast: number;
  /** Spécialités déjà étudiées (au moins un cours commencé). */
  specs: SpecRow[];
  /** Niveau de session adapté selon le nb de spé étudiées. */
  sessionSizes: { daily: number; recommended: number | null; intensive: number | null };
  /** Historique : les 4-5 dernières sessions. */
  recentSessions: { kind: string; completed_at: Date; score_pct: number }[];
};

async function buildState(userId: string, firstName: string): Promise<State> {
  const supabase = await createClient();
  const now = Date.now();
  const days30Ago = new Date(now - 30 * 86_400_000).toISOString();

  // 1) Sessions de révision transversale
  const { data: sessRaw } = await supabase
    .from('transversal_sessions')
    .select('completed_at, qcm_count, score_correct, kind')
    .eq('user_id', userId)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false });

  const sessions = (sessRaw ?? []) as { completed_at: string; qcm_count: number; score_correct: number; kind: string }[];
  const revisions30d = sessions.filter((s) => s.completed_at >= days30Ago).length;
  const lastRevision = sessions.length > 0 ? new Date(sessions[0].completed_at) : null;
  const totalRevisions = sessions.length;
  const daysSinceLast = lastRevision
    ? Math.floor((now - lastRevision.getTime()) / 86_400_000)
    : Number.POSITIVE_INFINITY;
  const recentSessions = sessions.slice(0, 5).map((s) => ({
    kind: s.kind,
    completed_at: new Date(s.completed_at),
    score_pct: s.qcm_count > 0 ? Math.round((s.score_correct / s.qcm_count) * 100) : 0,
  }));

  // 2) Spécialités déjà étudiées : on regarde les cours avec une activité.
  const { data: profileScope } = await supabase
    .from('profiles')
    .select('permission_scope')
    .eq('id', userId)
    .maybeSingle();
  const scope = parseScope(profileScope?.permission_scope);

  // course_progress → cours abordés
  const { data: progressRaw } = await supabase
    .from('course_progress')
    .select('cours_id, video_watched, fiche_read, last_seen_at')
    .eq('user_id', userId);
  const progress = (progressRaw ?? []) as { cours_id: string; video_watched: boolean | null; fiche_read: boolean | null; last_seen_at: string | null }[];
  const studiedCoursIds = new Set(
    progress.filter((p) => p.video_watched || p.fiche_read).map((p) => p.cours_id),
  );

  // attempts → ratio de réussite par cours
  const { data: attemptsRaw } = await supabase
    .from('qcm_attempts')
    .select('is_correct, attempted_at, qcm_questions!inner(qcm_series!inner(cours_id))')
    .eq('user_id', userId);
  type AttemptRow = { is_correct: boolean; attempted_at: string; qcm_questions: { qcm_series: { cours_id: string } } };
  const attempts = (attemptsRaw ?? []) as unknown as AttemptRow[];

  const perCours = new Map<string, { total: number; correct: number; last: Date | null; revisions30d: number }>();
  for (const a of attempts) {
    const cid = a.qcm_questions.qcm_series.cours_id;
    const cur = perCours.get(cid) ?? { total: 0, correct: 0, last: null, revisions30d: 0 };
    cur.total++;
    if (a.is_correct) cur.correct++;
    const at = new Date(a.attempted_at);
    if (!cur.last || at > cur.last) cur.last = at;
    if (a.attempted_at >= days30Ago) cur.revisions30d++;
    perCours.set(cid, cur);
    studiedCoursIds.add(cid);
  }

  // Récupère les titres + collège
  const { data: coursRaw } = await supabase
    .from('cours')
    .select('id, titre, matiere_id, matieres!inner(nom, semestres!inner(faculte_id))')
    .in('id', Array.from(studiedCoursIds));
  type CoursRow = { id: string; titre: string; matiere_id: string; matieres: { nom: string; semestres: { faculte_id: string } } };
  const coursMap = new Map<string, CoursRow>();
  for (const c of (coursRaw ?? []) as unknown as CoursRow[]) coursMap.set(c.id, c);

  // Official status from specialty_evaluations table (sections 9-12)
  const { data: evalRows } = await (supabase as unknown as {
    from: (t: string) => {
      select: (s: string) => {
        eq: (k: string, v: string) => {
          order: (k: string, o: { ascending: boolean }) => Promise<{
            data: { matiere_id: string; status: string; created_at: string }[] | null;
          }>;
        };
      };
    };
  }).from('specialty_evaluations')
    .select('matiere_id, status, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  const officialStatus = new Map<string, string>();
  for (const e of evalRows ?? []) {
    if (!officialStatus.has(e.matiere_id)) officialStatus.set(e.matiere_id, e.status);
  }

  const specs: SpecRow[] = [];
  for (const cid of studiedCoursIds) {
    const c = coursMap.get(cid);
    if (!c) continue;
    if (c.matieres.semestres.faculte_id !== EDN_FACULTE_ID) continue;
    if (!canAccessCollege(scope, c.matiere_id)) continue;
    const stat = perCours.get(cid);
    const total = stat?.total ?? 0;
    const ratio = total > 0 ? (stat!.correct / total) : 0;

    // Use official evaluation status if available, fallback to computed
    const evalStatus = officialStatus.get(c.matiere_id);
    let status: SpecRow['status'];
    if (evalStatus === 'validee' || evalStatus === 'consolider' || evalStatus === 'renforcer') {
      status = evalStatus;
    } else {
      status =
        total === 0 ? 'non_evaluee' :
        ratio >= 0.75 ? 'validee' :
        ratio >= 0.5  ? 'consolider' :
                         'renforcer';
    }
    specs.push({
      cours_id: cid,
      titre: c.titre,
      matiere_nom: c.matieres.nom,
      last_revision: stat?.last ?? null,
      revisions_30d: stat?.revisions30d ?? 0,
      total_attempts: total,
      correct_ratio: ratio,
      status,
    });
  }
  // Tri : à renforcer d'abord, puis à consolider, puis le reste
  specs.sort((a, b) => {
    const order = { renforcer: 0, consolider: 1, non_evaluee: 2, validee: 3 } as const;
    return order[a.status] - order[b.status];
  });

  // Tailles de session selon nb de spé étudiées
  const n = specs.length;
  const sessionSizes =
    n <= 5  ? { daily: 25, recommended: null,  intensive: null  } :
    n <= 10 ? { daily: 30, recommended: 50,    intensive: null  } :
    n <= 15 ? { daily: 35, recommended: 60,    intensive: null  } :
              { daily: 40, recommended: 75,    intensive: 120   };

  // Meilleure période de régularité : on calcule la plus longue série
  // de jours consécutifs avec au moins une session complétée.
  let bestStreakDays = 0;
  if (sessions.length > 0) {
    const sessionDates = new Set(
      sessions.map((s) => s.completed_at.slice(0, 10)),
    );
    const sortedDates = [...sessionDates].sort();
    let streak = 1;
    let maxStreak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const prev = new Date(sortedDates[i - 1]).getTime();
      const curr = new Date(sortedDates[i]).getTime();
      if (curr - prev === 86_400_000) {
        streak++;
        if (streak > maxStreak) maxStreak = streak;
      } else {
        streak = 1;
      }
    }
    bestStreakDays = maxStreak;
  }

  return {
    firstName,
    revisions30d,
    lastRevision,
    totalRevisions,
    bestStreakDays,
    daysSinceLast,
    specs,
    sessionSizes,
    recentSessions,
  };
}

/* ------------------------------------------------------------------
   PAGE
------------------------------------------------------------------ */
export default async function RevisionsTransversalesPage() {
  const { user, profile } = await requireUser();
  const firstName = profile.first_name || 'étudiant';
  const s = await buildState(user.id, firstName);

  // États visuels selon les jours d'absence (spec section 5)
  const isBilanGlobal     = s.daysSinceLast >= 60;
  const isAbsenceProlongee = !isBilanGlobal && s.daysSinceLast >= 30;
  const isInterrupted     = !isBilanGlobal && !isAbsenceProlongee && s.daysSinceLast >= 14;
  const isWeekAlert       = !isBilanGlobal && !isAbsenceProlongee && !isInterrupted && s.daysSinceLast >= 7;
  const isAlert           = !isBilanGlobal && !isAbsenceProlongee && !isInterrupted && !isWeekAlert && s.daysSinceLast >= 2;
  const isUpToDate        = s.daysSinceLast <= 1 && s.totalRevisions > 0;
  const needsReevaluation = isBilanGlobal || isAbsenceProlongee || isInterrupted;

  return (
    <div className="mx-auto grid w-full max-w-[1640px] gap-6 px-3 py-4 sm:px-4 lg:px-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      {/* ============ COLONNE PRINCIPALE ============ */}
      <div className="flex min-w-0 flex-col gap-5">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-(--color-ink)">Révisions transversales</h1>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-(--color-ink-soft)">
              Entretenez vos acquis et consolidez durablement les spécialités déjà étudiées.
              La révision transversale ne modifie pas le statut officiel des spécialités.
            </p>
          </div>
          <Link href="#help" className="hidden shrink-0 items-center gap-1 text-xs font-semibold text-(--color-primary) hover:underline sm:inline-flex">
            <HelpCircle className="h-3.5 w-3.5" />
            Comment ça fonctionne ?
          </Link>
        </header>

        {/* ============ KPI 4 cards — spec section 2 zone 2 ============ */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard
            Icon={Calendar}
            iconBg="#F1E8FD" iconFg="#6D28D9"
            label="Révisions transversales"
            value={`${s.revisions30d} / 30`}
            hint="derniers jours"
            bar={Math.min(100, (s.revisions30d / 30) * 100)}
            barColor={needsReevaluation ? '#A91D2C' : isWeekAlert || isAlert ? '#E8742C' : '#6D28D9'}
            footer={
              needsReevaluation ? <span className="text-(--color-danger) font-bold">Régularité interrompue</span> :
              isWeekAlert || isAlert ? <span className="text-[#B45B00] font-bold">À reprendre rapidement</span> :
                              <span className="text-(--color-success) font-bold">Excellente régularité</span>
            }
          />
          <KpiCard
            Icon={History}
            iconBg="#E7F6EC" iconFg="#16793C"
            label="Dernière révision"
            value={lastRevisionLabel(s.lastRevision, s.daysSinceLast)}
            hint={s.lastRevision ? s.lastRevision.toLocaleDateString('fr-FR') : '—'}
            footer={
              needsReevaluation ? <span className="text-(--color-danger) font-bold">Seuil dépassé</span> :
              isWeekAlert || isAlert ? <span className="text-[#B45B00] font-bold">Une reprise s&apos;impose</span> :
              isUpToDate    ? <span className="text-(--color-success) font-bold">Parfait, continuez !</span> :
                              <span className="text-(--color-ink-muted)">—</span>
            }
          />
          <KpiCard
            Icon={TrendingUp}
            iconBg="#EAF1FB" iconFg="#1E40AF"
            label="Meilleure période"
            value={`${s.bestStreakDays} jours`}
            hint="consécutifs"
            footer={<span className="text-(--color-ink-muted) font-medium">Votre record actuel</span>}
          />
          <KpiCard
            Icon={RefreshCcw}
            iconBg="#F1E8FD" iconFg="#6D28D9"
            label="Total révisions"
            value={`${s.totalRevisions}`}
            hint="depuis le début"
            footer={<span className="text-(--color-ink-muted) font-medium">&nbsp;</span>}
          />
        </section>

        {/* ============ BANDEAU D'ÉTAT — spec section 5 ============ */}
        {isBilanGlobal ? (
          <BannerBilanGlobal days={s.daysSinceLast} />
        ) : isAbsenceProlongee ? (
          <BannerAbsenceProlongee days={s.daysSinceLast} />
        ) : isInterrupted ? (
          <BannerInterrupted days={s.daysSinceLast} />
        ) : isWeekAlert ? (
          <BannerWeekAlert days={s.daysSinceLast} hasIntensive={s.sessionSizes.intensive != null} />
        ) : isAlert ? (
          <BannerAlert days={s.daysSinceLast} />
        ) : isUpToDate ? (
          <BannerUpToDate />
        ) : null}

        {/* ============ CARDS RÉVISION + TABLE SPÉCIALITÉS ============ */}
        {needsReevaluation ? (
          <section className="grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start">
            <RevisionCard
              kind={isBilanGlobal ? 'bilan_global' : isAbsenceProlongee ? 'reevaluation_deep' : 'reevaluation'}
              tint="#FCEAEC" tintFg="#A91D2C"
              title={isBilanGlobal ? 'Bilan global' : isAbsenceProlongee ? 'Réévaluation approfondie' : 'Réévaluation'}
              count={isBilanGlobal ? 75 : isAbsenceProlongee ? 50 : 30}
              estMin={isBilanGlobal ? 60 : isAbsenceProlongee ? 40 : 20}
              cta={isBilanGlobal ? 'Lancer le bilan global' : isAbsenceProlongee ? 'Lancer la réévaluation approfondie' : 'Lancer la réévaluation'}
              ctaTone="red"
              hint={isBilanGlobal
                ? 'Pour faire le point sur votre niveau actuel'
                : isAbsenceProlongee
                ? 'Pour évaluer votre niveau après cette interruption'
                : 'Pour vérifier le maintien de vos acquis'}
              tags={s.specs.filter((sp) => sp.status !== 'validee').slice(0, 3).map((sp) => sp.titre)}
            />
            <SpecialtiesPanel specs={s.specs} />
          </section>
        ) : (
          <>
            <section className="grid gap-4 lg:grid-cols-[1.05fr_1.4fr]">
              <RevisionCard
                kind="daily"
                tint="#F1E8FD" tintFg="#6D28D9"
                title="Révision du jour"
                count={s.sessionSizes.daily}
                estMin={s.sessionSizes.daily}
                cta="Commencer ma révision du jour"
                ctaTone="purple"
              />
              {s.sessionSizes.recommended && (
                <RevisionCard
                  kind="recommended"
                  tint="#FFEAD9" tintFg="#E8742C"
                  title="Révision recommandée"
                  count={s.sessionSizes.recommended}
                  estMin={35}
                  cta="Faire la révision recommandée"
                  ctaTone="orange"
                  hint="Recommandée à ce stade de votre progression"
                  tags={s.specs.filter((sp) => sp.status !== 'validee').slice(0, 3).map((sp) => sp.titre)}
                />
              )}
            </section>

            {s.sessionSizes.intensive && (
              <RevisionCard
                kind="intensive"
                tint="#FCEAEC" tintFg="#A91D2C"
                title="Révision intensive"
                count={s.sessionSizes.intensive}
                estMin={Math.round(s.sessionSizes.intensive * 0.6)}
                cta="Lancer la révision intensive"
                ctaTone="red"
                hint="Pour les périodes de révision approfondie ou les week-ends"
              />
            )}

            <SpecialtiesPanel specs={s.specs} />
          </>
        )}
      </div>

      {/* ============ SIDEBAR DROITE ============ */}
      <aside className="space-y-4">
        {/* Priorités pédagogiques */}
        <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-soft) sm:p-5">
          <h3 className="flex items-center gap-2 text-sm font-bold text-(--color-ink)">
            <Target className="h-4 w-4 text-(--color-primary)" /> Priorités pédagogiques
          </h3>
          <div className="mt-3">
            {priorities(s.specs)}
          </div>
          <Link href="#priorites" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-(--color-primary) hover:underline">
            Voir toutes mes priorités <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Conseil du jour */}
        <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-soft) sm:p-5">
          <h3 className="flex items-center gap-2 text-sm font-bold text-(--color-ink)">
            <Lightbulb className="h-4 w-4 text-[#E8742C]" /> Conseil du jour
          </h3>
          <p className="mt-2 text-sm font-semibold text-(--color-ink)">La régularité est la clé !</p>
          <p className="mt-1.5 text-xs leading-relaxed text-(--color-ink-soft)">
            {needsReevaluation
              ? 'Reprenez une révision transversale dès aujourd\'hui pour entretenir durablement vos connaissances.'
              : isWeekAlert || isAlert
              ? 'Vous êtes sur la bonne voie. Une révision quotidienne permet de mieux retenir sur le long terme.'
              : 'Révisez chaque jour un peu pour mieux retenir sur le long terme.'}
          </p>
        </div>

        {/* Historique récent */}
        <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-soft) sm:p-5">
          <h3 className="flex items-center gap-2 text-sm font-bold text-(--color-ink)">
            <ClipboardList className="h-4 w-4 text-(--color-primary)" /> Historique récent
          </h3>
          {s.recentSessions.length === 0 ? (
            <p className="mt-3 text-xs text-(--color-ink-muted)">
              Aucune session terminée pour le moment.
            </p>
          ) : (
            <ul className="mt-3 space-y-2.5">
              {s.recentSessions.map((r, i) => (
                <li key={i} className="flex items-center justify-between text-xs">
                  <span className="truncate text-(--color-ink)">{kindLabel(r.kind)}</span>
                  <span className="text-(--color-ink-muted)">{relativeDate(r.completed_at)}</span>
                  <span
                    className="ml-2 font-bold tabular-nums"
                    style={{ color: r.score_pct >= 75 ? '#16793C' : r.score_pct >= 50 ? '#E8742C' : '#A91D2C' }}
                  >
                    {r.score_pct}%
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link href="#history" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-(--color-primary) hover:underline">
            Voir tout l&apos;historique <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </aside>
    </div>
  );
}

/* ============================================================
   Composants
   ============================================================ */

function KpiCard({
  Icon, iconBg, iconFg, label, value, hint, bar, barColor, footer,
}: {
  Icon: typeof Calendar; iconBg: string; iconFg: string;
  label: string; value: string; hint: string;
  bar?: number; barColor?: string;
  footer?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-soft)">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: iconBg, color: iconFg }}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">{label}</p>
          <p className="mt-1 text-2xl font-black leading-none tabular-nums text-(--color-ink)">{value}</p>
          <p className="mt-1 text-[11px] text-(--color-ink-soft)">{hint}</p>
        </div>
      </div>
      {typeof bar === 'number' && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-(--color-sand-100)">
          <div className="h-full rounded-full transition-all" style={{ width: `${bar}%`, background: barColor }} />
        </div>
      )}
      {footer && <p className="mt-2 text-[12px]">{footer}</p>}
    </div>
  );
}

function BannerUpToDate() {
  return (
    <section className="rounded-2xl border bg-[#E7F6EC]/40 p-5 sm:p-6" style={{ borderColor: '#A2D5B2' }}>
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: '#16793C', color: 'white' }}>
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <div>
            <p className="text-base font-bold text-[#16793C]">Vous êtes à jour !</p>
            <p className="mt-1 text-sm text-(--color-ink-soft)">
              Excellente régularité, vos acquis sont bien entretenus.
              Continuez ainsi pour garder vos connaissances solides sur le long terme.
            </p>
          </div>
        </div>
        <Link
          href="/revisions-transversales/session?kind=daily"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#16793C] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-transform hover:scale-[1.02]"
        >
          Commencer ma révision du jour <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <p className="mt-4 flex items-center justify-center gap-2 border-t border-[#A2D5B2]/50 pt-3 text-xs text-[#16793C]">
        <Lightbulb className="h-3.5 w-3.5" />
        Une révision quotidienne est idéale pour garder vos connaissances actives.
      </p>
    </section>
  );
}

function BannerAlert({ days }: { days: number }) {
  return (
    <section className="rounded-2xl border bg-[#FFF7E6] p-5 sm:p-6" style={{ borderColor: '#F5D596' }}>
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: '#E8742C', color: 'white' }}>
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div>
            <p className="text-base font-bold text-(--color-ink)">
              Vous n&apos;avez pas effectué de révision transversale depuis{' '}
              <span className="text-[#E8742C]">{days} jours</span>.
            </p>
            <p className="mt-1 text-sm text-(--color-ink-soft)">
              Une reprise est recommandée pour maintenir vos acquis.
            </p>
          </div>
        </div>
        <Link
          href="/revisions-transversales/session?kind=daily"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#E8742C] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-transform hover:scale-[1.02]"
        >
          Reprendre ma révision du jour <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function BannerWeekAlert({ days, hasIntensive }: { days: number; hasIntensive: boolean }) {
  return (
    <section className="rounded-2xl border bg-[#FFF7E6] p-5 sm:p-6" style={{ borderColor: '#F5D596' }}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: '#A91D2C', color: 'white' }}>
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div>
            <p className="text-base font-bold text-(--color-ink)">
              Attention : aucune révision transversale depuis <span className="text-[#A91D2C]">{days} jours</span>.
            </p>
            <p className="mt-1 text-sm text-(--color-ink-soft)">
              Vous continuez peut-être à avancer dans la formation, mais vos anciennes spécialités ne sont plus suffisamment entretenues.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <Link
            href="/revisions-transversales/session?kind=daily"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#A91D2C] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-transform hover:scale-[1.02]"
          >
            Reprendre ma révision du jour <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/revisions-transversales/session?kind=recommended"
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-bold transition-colors hover:bg-white"
            style={{ borderColor: '#E8742C', color: '#E8742C' }}
          >
            Faire une révision recommandée <ArrowRight className="h-4 w-4" />
          </Link>
          {hasIntensive && (
            <Link
              href="/revisions-transversales/session?kind=intensive"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-bold transition-colors hover:bg-white"
              style={{ borderColor: '#A91D2C', color: '#A91D2C' }}
            >
              Faire une révision intensive <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function BannerInterrupted({ days }: { days: number }) {
  return (
    <section className="rounded-2xl border bg-[#FCEAEC] p-5 sm:p-6" style={{ borderColor: '#F3B5BC' }}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: '#A91D2C', color: 'white' }}>
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div>
            <p className="text-base font-bold text-(--color-ink)">Maintien des acquis interrompu</p>
            <p className="mt-1 text-sm text-(--color-ink-soft)">
              Vous n&apos;avez pas entretenu vos acquis depuis plus de{' '}
              <span className="font-bold text-[#A91D2C]">{Number.isFinite(days) ? `${days} jours` : 'longtemps'}</span>.
              <br />
              Une réévaluation est nécessaire avant de débloquer de nouveaux contenus.
            </p>
          </div>
        </div>
        <Link
          href="/revisions-transversales/session?kind=reevaluation"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#A91D2C] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-transform hover:scale-[1.02]"
        >
          Lancer la réévaluation <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function BannerAbsenceProlongee({ days }: { days: number }) {
  return (
    <section className="rounded-2xl border bg-[#FCEAEC] p-5 sm:p-6" style={{ borderColor: '#F3B5BC' }}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: '#A91D2C', color: 'white' }}>
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div>
            <p className="text-base font-bold text-(--color-ink)">Absence prolongée de révision transversale</p>
            <p className="mt-1 text-sm text-(--color-ink-soft)">
              Vous n&apos;avez pas entretenu vos acquis depuis plus de{' '}
              <span className="font-bold text-[#A91D2C]">{days} jours</span>.
              <br />
              Une réévaluation approfondie est nécessaire pour faire le point sur votre niveau actuel.
            </p>
          </div>
        </div>
        <Link
          href="/revisions-transversales/session?kind=reevaluation_deep"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#A91D2C] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-transform hover:scale-[1.02]"
        >
          Lancer la réévaluation approfondie <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function BannerBilanGlobal({ days }: { days: number }) {
  return (
    <section className="rounded-2xl border bg-[#FCEAEC] p-5 sm:p-6" style={{ borderColor: '#F3B5BC' }}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: '#A91D2C', color: 'white' }}>
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div>
            <p className="text-base font-bold text-(--color-ink)">Bilan global recommandé</p>
            <p className="mt-1 text-sm text-(--color-ink-soft)">
              Vous n&apos;avez pas entretenu vos acquis depuis plus de{' '}
              <span className="font-bold text-[#A91D2C]">{Number.isFinite(days) ? `${days} jours` : 'longtemps'}</span>.
              <br />
              Un bilan global est recommandé afin d&apos;identifier les spécialités à reprendre en priorité.
            </p>
          </div>
        </div>
        <Link
          href="/revisions-transversales/session?kind=bilan_global"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#A91D2C] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-transform hover:scale-[1.02]"
        >
          Lancer le bilan global <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function RevisionCard({
  kind, tint, tintFg, title, count, estMin, cta, ctaTone, hint, tags,
}: {
  kind: string;
  tint: string; tintFg: string;
  title: string; count: number; estMin: number;
  cta: string; ctaTone: 'purple' | 'orange' | 'red';
  hint?: string;
  tags?: string[];
}) {
  const tones = {
    purple: { bg: '#6D28D9', shadow: 'shadow-[0_10px_24px_-12px_rgba(109,40,217,0.55)]' },
    orange: { bg: '#E8742C', shadow: 'shadow-[0_10px_24px_-12px_rgba(232,116,44,0.55)]' },
    red:    { bg: '#A91D2C', shadow: 'shadow-[0_10px_24px_-12px_rgba(169,29,44,0.55)]' },
  }[ctaTone];

  const isReeval = kind === 'reevaluation' || kind === 'reevaluation_deep' || kind === 'bilan_global';

  return (
    <article className="flex flex-col rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft) sm:p-6">
      <header className="flex items-start gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: tint, color: tintFg }}>
          {kind === 'daily' && <Sparkles className="h-6 w-6" />}
          {kind === 'recommended' && <Target className="h-6 w-6" />}
          {kind === 'intensive' && <BookOpen className="h-6 w-6" />}
          {isReeval && <AlertTriangle className="h-6 w-6" />}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-(--color-ink)">{title}</p>
          <p className="mt-1 text-3xl font-black tabular-nums text-(--color-ink)">
            {count} QCM
          </p>
          {hint && <p className="mt-1 text-xs text-(--color-ink-soft)">{hint}</p>}
        </div>
      </header>

      {tags && tags.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-(--color-ink-soft)">Spécialités les moins entretenues :</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span key={t} className="rounded-full bg-[#FFEAD9] px-2.5 py-1 text-xs font-bold text-[#B45B00]">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {!tags && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-(--color-ink-soft)">
          <Calendar className="h-3.5 w-3.5" /> Temps estimé : {estMin} minutes
        </p>
      )}

      <Link
        href={`/revisions-transversales/session?kind=${kind}`}
        className={`mt-5 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.01] ${tones.shadow}`}
        style={{ background: tones.bg }}
      >
        {cta} <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}

function SpecialtiesPanel({ specs }: { specs: SpecRow[] }) {
  return (
    <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-soft) sm:p-6">
      <h2 className="text-base font-bold text-(--color-ink)">Mes spécialités déjà étudiées</h2>
      {specs.length === 0 ? (
        <p className="mt-6 text-center text-sm text-(--color-ink-muted)">
          Aucune spécialité étudiée pour le moment. Commencez un cours pour la voir apparaître ici.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-(--color-border) text-left text-xs font-medium uppercase tracking-wider text-(--color-ink-muted)">
                <th className="pb-2.5 pr-3">Spécialité</th>
                <th className="pb-2.5 px-3">Dernière révision</th>
                <th className="pb-2.5 px-3">Révisions (30j)</th>
                <th className="pb-2.5 px-3">Régularité</th>
                <th className="pb-2.5 px-3">Statut officiel</th>
                <th className="pb-2.5 pl-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {specs.slice(0, 8).map((sp) => (
                <SpecRowRender key={sp.cours_id} sp={sp} />
              ))}
            </tbody>
          </table>
        </div>
      )}
      {specs.length > 8 && (
        <div className="mt-4 flex justify-center">
          <Link href="/matieres" className="inline-flex items-center gap-1 text-sm font-semibold text-(--color-primary) hover:underline">
            Voir toutes mes spécialités étudiées <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </section>
  );
}

function SpecRowRender({ sp }: { sp: SpecRow }) {
  const StatusBadge = ({ status }: { status: SpecRow['status'] }) => {
    const map = {
      validee:     { dot: '#16793C', label: 'Validée'    },
      consolider:  { dot: '#E8742C', label: 'À consolider' },
      renforcer:   { dot: '#A91D2C', label: 'À renforcer' },
      non_evaluee: { dot: '#9AA1AE', label: 'Non évaluée' },
    }[status];
    return (
      <span className="inline-flex items-center gap-1.5 text-xs">
        <span className="h-2 w-2 rounded-full" style={{ background: map.dot }} />
        {map.label}
      </span>
    );
  };

  const ActionBtn = () => {
    if (sp.status === 'renforcer') {
      return <Link href={`/cours/${sp.cours_id}`} className="inline-flex items-center rounded-lg border border-[#A91D2C] px-2.5 py-1 text-xs font-bold text-[#A91D2C] hover:bg-[#FCEAEC]">Renforcement</Link>;
    }
    if (sp.status === 'consolider') {
      return <Link href={`/cours/${sp.cours_id}`} className="inline-flex items-center rounded-lg border border-[#E8742C] px-2.5 py-1 text-xs font-bold text-[#E8742C] hover:bg-[#FFEAD9]">Consolider</Link>;
    }
    return <Link href={`/cours/${sp.cours_id}`} className="inline-flex items-center rounded-lg border border-(--color-border) px-2.5 py-1 text-xs font-bold text-(--color-primary) hover:bg-(--color-primary-soft)">Réviser</Link>;
  };

  const ratioPct = Math.round(sp.correct_ratio * 100);
  const regulLabel = ratioPct >= 75 ? 'Excellente' : ratioPct >= 60 ? 'Bonne' : ratioPct >= 40 ? 'À améliorer' : 'Faible';
  const regulColor = ratioPct >= 75 ? '#16793C' : ratioPct >= 60 ? '#16793C' : ratioPct >= 40 ? '#E8742C' : '#A91D2C';

  return (
    <tr className="border-b border-(--color-border)/50 last:border-b-0">
      <td className="py-3 pr-3 font-medium text-(--color-ink)">{sp.titre}</td>
      <td className="py-3 px-3 text-(--color-ink-soft)">
        {sp.last_revision ? relativeDate(sp.last_revision) : '—'}
      </td>
      <td className="py-3 px-3 tabular-nums text-(--color-ink)">{sp.revisions_30d}</td>
      <td className="py-3 px-3">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-16 overflow-hidden rounded-full bg-(--color-sand-100)">
            <span className="block h-full rounded-full" style={{ width: `${ratioPct}%`, background: regulColor }} />
          </span>
          <span className="text-xs font-medium" style={{ color: regulColor }}>{regulLabel}</span>
        </div>
      </td>
      <td className="py-3 px-3">
        <StatusBadge status={sp.status} />
      </td>
      <td className="py-3 pl-3 text-right">
        <ActionBtn />
      </td>
    </tr>
  );
}

/* ============================================================
   helpers
   ============================================================ */
function priorities(specs: SpecRow[]): React.ReactNode {
  const top = specs.filter((s) => s.status === 'renforcer' || s.status === 'consolider').slice(0, 3);
  if (top.length === 0) {
    return (
      <div className="flex items-start gap-2.5">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-(--color-success)" />
        <div>
          <p className="text-sm font-medium text-(--color-ink)">Aucune priorité particulière</p>
          <p className="mt-0.5 text-xs text-(--color-ink-soft)">Continuez votre régularité !</p>
        </div>
      </div>
    );
  }
  return (
    <ul className="space-y-3">
      {top.map((s) => {
        const tone = s.status === 'renforcer' ? '#A91D2C' : '#E8742C';
        return (
          <li key={s.cours_id} className="flex items-start gap-2.5">
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: tone }} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-(--color-ink)">{s.titre}</p>
              <p className="text-xs text-(--color-ink-soft)">
                Spécialité {s.status === 'renforcer' ? 'fragile' : 'peu entretenue'}
                {s.last_revision && <> · Dernière révision : {relativeDate(s.last_revision)}</>}
              </p>
            </div>
            <Link
              href={`/cours/${s.cours_id}`}
              className="inline-flex shrink-0 items-center rounded-lg border px-2 py-0.5 text-[11px] font-bold"
              style={{ borderColor: tone, color: tone }}
            >
              {s.status === 'renforcer' ? 'Renforcement' : 'Consolider'}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function lastRevisionLabel(d: Date | null, daysSince: number): string {
  if (!d) return 'Jamais';
  if (daysSince === 0) return 'Aujourd\'hui';
  if (daysSince === 1) return 'Hier';
  return `Il y a ${daysSince} jours`;
}

function relativeDate(d: Date): string {
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (days === 0) return 'Aujourd\'hui';
  if (days === 1) return 'Hier';
  if (days < 7)   return `Il y a ${days} jours`;
  if (days < 30)  return `Il y a ${Math.floor(days / 7)} sem.`;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

function kindLabel(k: string): string {
  return {
    daily: 'Révision du jour',
    recommended: 'Révision recommandée',
    intensive: 'Révision intensive',
    reevaluation: 'Réévaluation',
    reevaluation_deep: 'Réévaluation approfondie',
    bilan_global: 'Bilan global',
  }[k] ?? 'Révision';
}

import Link from 'next/link';
import {
  AlertTriangle, ArrowRight, BookOpen, Calendar, CheckCircle2, ClipboardList,
  HelpCircle, History, Lightbulb, RefreshCcw, Sparkles, Target, TrendingUp,
} from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { parseScope } from '@/lib/auth/permissions';
import { getMaintienStats, getStudiedSpecialties, type MaintienStats, type StudiedSpecialty } from '@/lib/pedago/maintien';
import { sessionSizesFor, STATUS_META } from '@/lib/pedago/status';

export const metadata = { title: 'Révisions transversales' };

/* ------------------------------------------------------------------
   STATE — calcule tout ce qui est affiché à partir des données réelles.
   Une « spécialité » est une MATIÈRE (collège : cardiologie, pneumologie…),
   conformément au cahier des charges — pas un item de cours.
------------------------------------------------------------------ */
type State = {
  firstName: string;
  stats: MaintienStats;
  specs: StudiedSpecialty[];
  sessionSizes: { daily: number; recommended: number | null; intensive: number | null };
  recentSessions: { kind: string; completed_at: Date; score_pct: number }[];
  unit: 'QCM' | 'QROC';
};

async function buildState(userId: string, firstName: string): Promise<State> {
  const supabase = await createClient();

  const { data: profileScope } = await supabase
    .from('profiles')
    .select('permission_scope')
    .eq('id', userId)
    .maybeSingle();
  const scope = parseScope(profileScope?.permission_scope);
  // Voie externe : l'unité de question accessible est le QROC.
  const unit = scope.voie === 'externe' ? 'QROC' : 'QCM';

  const [stats, specs, { data: sessRaw }] = await Promise.all([
    getMaintienStats(supabase as never, userId),
    getStudiedSpecialties(supabase as never, userId, scope),
    supabase
      .from('transversal_sessions')
      .select('completed_at, qcm_count, score_correct, kind')
      .eq('user_id', userId)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(5) as never,
  ]);

  const sessions = ((sessRaw ?? []) as { completed_at: string; qcm_count: number; score_correct: number; kind: string }[]);
  const recentSessions = sessions.map((s) => ({
    kind: s.kind,
    completed_at: new Date(s.completed_at),
    score_pct: s.qcm_count > 0 ? Math.round((s.score_correct / s.qcm_count) * 100) : 0,
  }));

  return {
    firstName,
    stats,
    specs,
    sessionSizes: sessionSizesFor(specs.length),
    recentSessions,
    unit,
  };
}

/* ------------------------------------------------------------------
   PAGE
------------------------------------------------------------------ */
export default async function RevisionsTransversalesPage() {
  const { user, profile } = await requireUser();
  const firstName = profile.first_name || 'étudiant';
  const s = await buildState(user.id, firstName);

  // États visuels selon les jours d'absence (spec section 5).
  // « Jamais révisé » est un état DISTINCT : pas de bandeau d'absence — l'élève
  // découvre le module, on ne l'accueille pas avec « 60 jours d'absence ».
  const days = s.stats.daysSinceLast;
  const never            = days === null;
  const isBilanGlobal     = !never && days >= 60;
  const isAbsenceProlongee = !never && !isBilanGlobal && days >= 30;
  const isInterrupted     = !never && !isBilanGlobal && !isAbsenceProlongee && days >= 14;
  const isWeekAlert       = !never && !isBilanGlobal && !isAbsenceProlongee && !isInterrupted && days >= 7;
  const isAlert           = !never && !isBilanGlobal && !isAbsenceProlongee && !isInterrupted && !isWeekAlert && days >= 2;
  const isYesterday       = !never && days === 1;
  const isUpToDate        = !never && days === 0;
  const needsReevaluation = isBilanGlobal || isAbsenceProlongee || isInterrupted;
  const hasSpecs          = s.specs.length > 0;

  const weakTags = s.specs
    .filter((sp) => sp.officialStatus === 'insuffisante' || sp.officialStatus === 'fragile')
    .slice(0, 3)
    .map((sp) => sp.nom);

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
          <a href="#priorites" className="hidden shrink-0 items-center gap-1 text-xs font-semibold text-(--color-primary) hover:underline sm:inline-flex">
            <HelpCircle className="h-3.5 w-3.5" />
            Mes priorités
          </a>
        </header>

        {/* ============ KPI — Maintien des acquis (spec section 5) ============ */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard
            Icon={Calendar}
            iconBg="#F1E8FD" iconFg="#6D28D9"
            label="Révisions transversales"
            value={`${s.stats.revisions30d} / 30`}
            hint="derniers jours"
            bar={Math.min(100, (s.stats.revisions30d / 30) * 100)}
            barColor={needsReevaluation ? '#A91D2C' : isWeekAlert || isAlert ? '#E8742C' : '#6D28D9'}
            footer={
              never ? <span className="text-(--color-ink-muted)">Commencez aujourd&apos;hui</span> :
              needsReevaluation ? <span className="text-(--color-danger) font-bold">Régularité interrompue</span> :
              isWeekAlert || isAlert ? <span className="text-[#B45B00] font-bold">À reprendre rapidement</span> :
                              <span className="text-(--color-success) font-bold">Excellente régularité</span>
            }
          />
          <KpiCard
            Icon={History}
            iconBg="#E7F6EC" iconFg="#16793C"
            label="Dernière révision"
            value={lastRevisionLabel(s.stats.lastRevision, days)}
            hint={s.stats.lastRevision ? s.stats.lastRevision.toLocaleDateString('fr-FR') : '—'}
            footer={
              never ? <span className="text-(--color-ink-muted)">Votre révision du jour est disponible</span> :
              needsReevaluation ? <span className="text-(--color-danger) font-bold">Seuil dépassé</span> :
              isWeekAlert || isAlert ? <span className="text-[#B45B00] font-bold">Une reprise s&apos;impose</span> :
              isUpToDate    ? <span className="text-(--color-success) font-bold">Parfait, continuez !</span> :
              isYesterday   ? <span className="text-(--color-ink-soft)">Votre révision du jour est disponible</span> :
                              <span className="text-(--color-ink-muted)">—</span>
            }
          />
          <KpiCard
            Icon={RefreshCcw}
            iconBg="#EAF1FB" iconFg="#1E40AF"
            label="Régularité en cours"
            value={`${s.stats.currentStreak} jour${s.stats.currentStreak > 1 ? 's' : ''}`}
            hint="consécutifs de révision"
            footer={<span className="text-(--color-ink-muted) font-medium">{s.stats.totalRevisions} révision{s.stats.totalRevisions > 1 ? 's' : ''} au total</span>}
          />
          <KpiCard
            Icon={TrendingUp}
            iconBg="#F1E8FD" iconFg="#6D28D9"
            label="Meilleure période"
            value={`${s.stats.bestStreak} jour${s.stats.bestStreak > 1 ? 's' : ''}`}
            hint="consécutifs"
            footer={<span className="text-(--color-ink-muted) font-medium">Votre record</span>}
          />
        </section>

        {/* ============ BANDEAU D'ÉTAT — spec section 5 ============ */}
        {!hasSpecs ? null
          : isBilanGlobal ? <BannerBilanGlobal days={days!} />
          : isAbsenceProlongee ? <BannerAbsenceProlongee days={days!} />
          : isInterrupted ? <BannerInterrupted days={days!} />
          : isWeekAlert ? <BannerWeekAlert days={days!} hasIntensive={s.sessionSizes.intensive != null} />
          : isAlert ? <BannerAlert days={days!} />
          : isYesterday ? <BannerYesterday />
          : isUpToDate ? <BannerUpToDate />
          : null}

        {/* ============ CARDS RÉVISION + TABLE SPÉCIALITÉS ============ */}
        {!hasSpecs ? (
          <EmptyState unit={s.unit} />
        ) : needsReevaluation ? (
          <section className="grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start">
            <RevisionCard
              kind={isBilanGlobal ? 'bilan_global' : isAbsenceProlongee ? 'reevaluation_deep' : 'reevaluation'}
              tint="#FCEAEC" tintFg="#A91D2C"
              title={isBilanGlobal ? 'Bilan global' : isAbsenceProlongee ? 'Réévaluation approfondie' : 'Réévaluation'}
              count={isBilanGlobal ? 75 : isAbsenceProlongee ? 50 : 30}
              estMin={isBilanGlobal ? 60 : isAbsenceProlongee ? 40 : 20}
              cta={isBilanGlobal ? 'Lancer le bilan global' : isAbsenceProlongee ? 'Lancer la réévaluation approfondie' : 'Lancer la réévaluation'}
              ctaTone="red"
              unit={s.unit}
              hint={isBilanGlobal
                ? 'Pour faire le point sur votre niveau actuel'
                : isAbsenceProlongee
                ? 'Pour évaluer votre niveau après cette interruption'
                : 'Pour vérifier le maintien de vos acquis'}
              tags={weakTags}
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
                estMin={dailyEstMin(s.sessionSizes.daily)}
                estLabel={dailyEstLabel(s.sessionSizes.daily)}
                cta="Commencer ma révision du jour"
                ctaTone="purple"
                unit={s.unit}
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
                  unit={s.unit}
                  hint={recommendedHint(s.specs.length)}
                  tags={weakTags}
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
                unit={s.unit}
                hint="Pour les périodes de révision approfondie ou les week-ends — jamais obligatoire"
              />
            )}

            <SpecialtiesPanel specs={s.specs} />
          </>
        )}
      </div>

      {/* ============ SIDEBAR DROITE ============ */}
      <aside className="space-y-4">
        {/* Priorités pédagogiques */}
        <div id="priorites" className="scroll-mt-20 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-soft) sm:p-5">
          <h3 className="flex items-center gap-2 text-sm font-bold text-(--color-ink)">
            <Target className="h-4 w-4 text-(--color-primary)" /> Priorités pédagogiques
          </h3>
          <div className="mt-3">
            {priorities(s.specs)}
          </div>
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
        <div id="history" className="scroll-mt-20 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-soft) sm:p-5">
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
        </div>
      </aside>
    </div>
  );
}

/* ============================================================
   Composants
   ============================================================ */

function dailyEstMin(count: number): number {
  // Spec section 2 : 25 → 15 min ; 30 → 15-20 ; 35 → 20 ; 40 → 20-25.
  if (count <= 25) return 15;
  if (count <= 30) return 18;
  if (count <= 35) return 20;
  return 23;
}
function dailyEstLabel(count: number): string {
  if (count <= 25) return '15 minutes';
  if (count <= 30) return '15-20 minutes';
  if (count <= 35) return '20 minutes';
  return '20-25 minutes';
}
function recommendedHint(nSpecs: number): string {
  if (nSpecs <= 10) return 'Pour renforcer davantage vos acquis';
  if (nSpecs <= 15) return 'Recommandée à ce stade de votre progression';
  return 'Pour entretenir plus largement les spécialités déjà étudiées';
}

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

function EmptyState({ unit }: { unit: string }) {
  return (
    <section className="rounded-2xl border border-dashed border-(--color-border) bg-(--color-surface) px-6 py-14 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F1E8FD] text-[#6D28D9]">
        <BookOpen className="h-6 w-6" />
      </span>
      <p className="mt-4 text-lg font-bold text-(--color-ink)">Aucune spécialité étudiée pour le moment</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-(--color-ink-soft)">
        Les révisions transversales piochent des {unit} dans les spécialités que vous avez déjà étudiées.
        Commencez par regarder un cours, lire une fiche ou faire une série de {unit} : votre première
        révision du jour se débloquera automatiquement.
      </p>
      <Link
        href="/facultes"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#6D28D9] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-transform hover:scale-[1.02]"
      >
        Découvrir les spécialités <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
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

/** Après 1 jour sans révision : message léger, pas d'alerte forte (section 5). */
function BannerYesterday() {
  return (
    <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 sm:p-5">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F1E8FD] text-[#6D28D9]">
            <Sparkles className="h-4.5 w-4.5" />
          </span>
          <p className="text-sm font-semibold text-(--color-ink)">Votre révision du jour est disponible.</p>
        </div>
        <Link
          href="/revisions-transversales/session?kind=daily"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#6D28D9] px-4 py-2 text-sm font-bold text-white shadow-sm transition-transform hover:scale-[1.02]"
        >
          Commencer ma révision du jour <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
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
              <span className="font-bold text-[#A91D2C]">{days} jours</span>.
              <br />
              Une réévaluation est nécessaire avant de débloquer de nouveaux contenus.
              Vos anciens contenus, fiches, flashcards et corrections restent accessibles.
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
              <span className="font-bold text-[#A91D2C]">{days} jours</span>.
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
  kind, tint, tintFg, title, count, estMin, estLabel, cta, ctaTone, hint, tags, unit = 'QCM',
}: {
  kind: string;
  tint: string; tintFg: string;
  title: string; count: number; estMin: number;
  estLabel?: string;
  cta: string; ctaTone: 'purple' | 'orange' | 'red';
  hint?: string;
  tags?: string[];
  unit?: string;
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
            {count} {unit}
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
          <Calendar className="h-3.5 w-3.5" /> Temps estimé : {estLabel ?? `${estMin} minutes`}
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

function SpecialtiesPanel({ specs }: { specs: StudiedSpecialty[] }) {
  return (
    <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-soft) sm:p-6">
      <h2 className="text-base font-bold text-(--color-ink)">Mes spécialités déjà étudiées</h2>
      <p className="mt-0.5 text-xs text-(--color-ink-soft)">
        {specs.length} spécialité{specs.length > 1 ? 's' : ''} — le statut officiel n&apos;évolue que par une évaluation officielle.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-(--color-border) text-left text-xs font-medium uppercase tracking-wider text-(--color-ink-muted)">
              <th className="pb-2.5 pr-3">Spécialité</th>
              <th className="pb-2.5 px-3">Avancement</th>
              <th className="pb-2.5 px-3">Dernière activité</th>
              <th className="pb-2.5 px-3">Statut officiel</th>
              <th className="pb-2.5 pl-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {specs.map((sp) => (
              <SpecRowRender key={sp.matiereId} sp={sp} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SpecRowRender({ sp }: { sp: StudiedSpecialty }) {
  const meta = STATUS_META[sp.officialStatus ?? 'non_evaluee'];

  const ActionBtn = () => {
    if (sp.officialStatus === 'insuffisante') {
      return <Link href={`/matieres/${sp.matiereId}/renforcement`} className="inline-flex items-center rounded-lg border border-[#A91D2C] px-2.5 py-1 text-xs font-bold text-[#A91D2C] hover:bg-[#FCEAEC]">Renforcement approfondi</Link>;
    }
    if (sp.officialStatus === 'fragile') {
      return <Link href={`/matieres/${sp.matiereId}/consolidation`} className="inline-flex items-center rounded-lg border border-[#E8742C] px-2.5 py-1 text-xs font-bold text-[#E8742C] hover:bg-[#FFEAD9]">Consolider</Link>;
    }
    if (sp.awaitingValidation) {
      return <Link href={`/matieres/${sp.matiereId}/evaluation`} className="inline-flex items-center rounded-lg border border-[#6D28D9] px-2.5 py-1 text-xs font-bold text-[#6D28D9] hover:bg-[#F1E8FD]">Passer l&apos;interrogation</Link>;
    }
    return <Link href={`/matieres/${sp.matiereId}`} className="inline-flex items-center rounded-lg border border-(--color-border) px-2.5 py-1 text-xs font-bold text-(--color-primary) hover:bg-(--color-primary-soft)">Réviser</Link>;
  };

  const pctDone = sp.coursTotal > 0 ? Math.round((sp.coursStudied / sp.coursTotal) * 100) : 0;

  return (
    <tr className="border-b border-(--color-border)/50 last:border-b-0">
      <td className="py-3 pr-3 font-medium text-(--color-ink)">{sp.nom}</td>
      <td className="py-3 px-3">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-16 overflow-hidden rounded-full bg-(--color-sand-100)">
            <span className="block h-full rounded-full" style={{ width: `${pctDone}%`, background: pctDone >= 100 ? '#16793C' : '#6D28D9' }} />
          </span>
          <span className="text-xs tabular-nums text-(--color-ink-soft)">{sp.coursStudied}/{sp.coursTotal}</span>
        </div>
      </td>
      <td className="py-3 px-3 text-(--color-ink-soft)">
        {sp.lastActivity ? relativeDate(sp.lastActivity) : '—'}
      </td>
      <td className="py-3 px-3">
        <span className="inline-flex items-center gap-1.5 text-xs">
          <span className="h-2 w-2 rounded-full" style={{ background: meta.dot }} />
          {sp.awaitingValidation ? 'Validation en attente' : meta.label}
        </span>
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
function priorities(specs: StudiedSpecialty[]): React.ReactNode {
  const top = [
    ...specs.filter((s) => s.officialStatus === 'insuffisante'),
    ...specs.filter((s) => s.officialStatus === 'fragile'),
    ...specs.filter((s) => s.awaitingValidation),
  ].slice(0, 4);
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
        const isRed = s.officialStatus === 'insuffisante';
        const isOrange = s.officialStatus === 'fragile';
        const tone = isRed ? '#A91D2C' : isOrange ? '#E8742C' : '#6D28D9';
        const href = isRed
          ? `/matieres/${s.matiereId}/renforcement`
          : isOrange
          ? `/matieres/${s.matiereId}/consolidation`
          : `/matieres/${s.matiereId}/evaluation`;
        const label = isRed ? 'Renforcement' : isOrange ? 'Consolider' : 'Interrogation';
        const sub = isRed
          ? 'Niveau insuffisant — action recommandée : renforcement approfondi'
          : isOrange
          ? 'Spécialité fragile — action recommandée : consolidation'
          : `${s.nom} terminée — interrogation non réalisée`;
        return (
          <li key={s.matiereId} className="flex items-start gap-2.5">
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: tone }} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-(--color-ink)">{s.nom}</p>
              <p className="text-xs text-(--color-ink-soft)">{sub}</p>
            </div>
            <Link
              href={href}
              className="inline-flex shrink-0 items-center rounded-lg border px-2 py-0.5 text-[11px] font-bold"
              style={{ borderColor: tone, color: tone }}
            >
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function lastRevisionLabel(d: Date | null, daysSince: number | null): string {
  if (!d || daysSince === null) return 'Jamais';
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

import { Suspense, cache } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight, ClipboardCheck, Clock, FileText, Home, Layers3, Play, RefreshCcw, Sunrise, Target,
  TrendingUp, Zap,
} from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { parseScope, canAccessCollege, canAccessCours, hasMedecineGeneraleAccess } from '@/lib/auth/permissions';
import { AnnouncementsWidget } from '@/components/student/announcements-widget';
import { Planning30Jours, Planning30JoursSkeleton } from '@/components/student/planning-30-jours';
import { NouveauxContenusBanner } from '@/components/espace-decouverte/nouveaux-contenus-modal';
import { DiscoveryUpgradeCta } from '@/components/espace-decouverte/discovery-upgrade-cta';
import { DiscoveryGateLink } from '@/components/espace-decouverte/discovery-gate-link';
import { EDN_FACULTE_ID, getNavigatorTree } from '@/lib/data/navigator';
import { getFaculteContentTotals } from '@/lib/data/faculte-totals';
import { ProfWelcome } from '@/components/professor/prof-welcome';
import { ongletsDe } from '@/lib/auth/onglets-equipe';
import { getMaintienStats, getStudiedSpecialties } from '@/lib/pedago/maintien';
import { sessionSizesFor } from '@/lib/pedago/status';
import { chargerProgressionCours } from '@/lib/progress/course-progress-data';
import { ActiviteChart } from '@/components/student/activite-chart';
import { PEDAGO_ENGINE_STUDENT_ENABLED } from '@/lib/modules-flags';
import { moteurOuvert } from '@/lib/moteur/access';
import { todayFor } from '@/lib/moteur/server/today';
import { STATUS_LABEL } from '@/lib/moteur/types';
import { AccueilHeroAction, AccueilHeroStats, AccueilHeroStatsSkeleton, PedagoToday, PedagoTodaySkeleton, ResponsabiliteAccueil } from './pedago-today';
import { activiteQuotidienne, secondesSemaine } from './donnees';
import { SectionTitle, StudentHero, StudentPage, heroCta } from '@/components/student/ui/page-kit';
import { BienDemarrer } from '@/components/student/guide/bien-demarrer';
import { chargerPriseEnMain } from '@/lib/student/prise-en-main';
import { chargerConseil } from '@/lib/student/conseil';
import type { Conseil, ConseilCle } from '@/lib/student/conseil-core';
import type { PriseEnMain } from '@/lib/student/prise-en-main-core';
import { ConseilDuJour } from '@/components/student/guide/conseil-du-jour';
import { fetchContentAccessForScope } from '@/lib/auth/formula-permissions';
import { CHECKUP_STUDENT_ENABLED, PLAN_STUDENT_ENABLED } from '@/lib/modules-flags';
import { planAvailableFor } from '@/lib/plan/service';

export const metadata = { title: 'Accueil' };

/* ============================================================
   Types
   ============================================================ */
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

  // Page d'accueil dédiée pour les professeurs : visuel des collèges
  // accessibles + items + accès rapide au forum. Pas de dashboard
  // QCM/flashcards (qui n'a aucun sens pour un prof).
  if (profile.role === 'professor') {
    // Cette page d'accueil est celle des enseignants (collèges, items, forum).
    // Un monteur vidéo, un commercial ou un rédacteur blog repart vers la
    // première page que ses modules lui ouvrent dans l'administration.
    if (!(await ongletsDe(profile)).contenu) redirect('/admin');
    const tree = await getNavigatorTree(profile);
    return <ProfWelcome profile={profile} tree={tree} />;
  }

  const scope = parseScope(profile.permission_scope);
  const isPaidFormula = scope.offer !== 'decouverte';
  const isDecouverte = !isPaidFormula && scope.type === 'college' && scope.colleges.includes('col-decouverte');
  const firstName = profile.first_name || 'étudiant';
  const voieLabel = scope.voie === 'interne' ? 'Voie interne' : scope.voie === 'externe' ? 'Voie externe' : null;
  // Moteur pédagogique central : programme du jour unique et alertes (hors offre Découverte).
  const engine = moteurOuvert(profile, PEDAGO_ENGINE_STUDENT_ENABLED) && !isDecouverte;

  // Date du jour à Paris (le serveur est en UTC), en tête de l'accueil.
  const dateDuJour = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Paris' });

  // Coque instantanée : l'en-tête + la structure s'affichent immédiatement ;
  // pastilles, programme du jour, prise en main et tableau de bord sont
  // streamés via <Suspense>. Tout l'essentiel tient au-dessus de la ligne de
  // flottaison : en-tête (chiffres clés + « Commencer ma journée »), « Bien
  // démarrer », programme du jour compact, tuiles de pilotage ; le détail de
  // la progression vient ensuite.
  return (
    <StudentPage width="wide" className="gap-4">
      <StudentHero
        aide="accueil"
        icon={Home}
        watermark={<Sunrise strokeWidth={1.2} />}
        eyebrow={voieLabel ? <>Tableau de bord <span aria-hidden className="text-white/35">·</span> {voieLabel}</> : 'Tableau de bord'}
        title={<>Bonjour, {firstName}</>}
        subtitle={<><span className="font-semibold text-white/90">{dateDuJour.charAt(0).toUpperCase() + dateDuJour.slice(1)}</span> · Voici votre journée.</>}
        actions={engine ? (
          <Suspense fallback={<span aria-hidden className="h-11 w-56 animate-pulse rounded-xl bg-white/10" />}>
            <AccueilHeroAction userId={user.id} />
          </Suspense>
        ) : (
          <DiscoveryGateLink
            href="/revisions-transversales"
            locked={isDecouverte}
            className={heroCta}
            ariaLabel="Reprendre l'entraînement — Découverte verrouillé"
          >
            <Play className="h-4 w-4" aria-hidden /> Reprendre l&rsquo;entraînement
          </DiscoveryGateLink>
        )}
        stats={
          <Suspense fallback={<AccueilHeroStatsSkeleton />}>
            <AccueilHeroStats userId={user.id} engine={engine} />
          </Suspense>
        }
      />

      {/* Prise en main (« Bien démarrer ») tant qu'elle n'est pas terminée ni masquée. */}
      <Suspense fallback={null}>
        <BienDemarrerAccueil />
      </Suspense>

      <div className="grid w-full gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* ============ COLONNE PRINCIPALE ============ */}
        <div className="flex min-w-0 flex-col gap-4">
          {/* Conseil du jour : ici sur téléphone et tablette, dans la colonne de droite sur ordinateur. */}
          <Suspense fallback={null}>
            <ConseilAccueil variante="bande" className="xl:hidden" />
          </Suspense>
          {engine && (
            <Suspense fallback={<PedagoTodaySkeleton />}>
              <PedagoToday userId={user.id} />
            </Suspense>
          )}

          <Suspense fallback={<DashboardSkeleton />}>
            <Dashboard userId={user.id} scope={scope} isDecouverte={isDecouverte} engine={engine} />
          </Suspense>

          {engine && (
            <Suspense fallback={null}>
              <ResponsabiliteAccueil userId={user.id} />
            </Suspense>
          )}
        </div>

        {/* ============ SIDEBAR DROITE ============ */}
        <aside className="space-y-3">
          <Suspense fallback={null}>
            <ConseilAccueil variante="carte" className="hidden xl:block" />
          </Suspense>
          {/* Planning « Mes 30 prochains jours » : séances en direct ciblées
              (mêmes règles que /agenda) + évènements personnels. Streamé à part. */}
          <Suspense fallback={<Planning30JoursSkeleton />}>
            <Planning30Jours userId={user.id} scope={scope} />
          </Suspense>
          <Suspense fallback={<SidebarSkeleton />}>
            <AnnouncementsWidget scope={scope} />
          </Suspense>
          {isDecouverte && <DiscoveryUpgradeCta />}
          {isDecouverte && <NouveauxContenusBanner />}
        </aside>
      </div>
    </StudentPage>
  );
}

/**
 * Guide de l'accueil, calculé une fois par affichage (React `cache`) :
 * - « Bien démarrer » tant que la prise en main n'est pas terminée ni masquée ;
 * - « Le conseil du jour », TOUJOURS proposé (automatique, d'après l'activité
 *   de l'élève). Tant que la bande est là, il évite les étapes qu'elle porte
 *   déjà : les deux se complètent, sans se répéter.
 * Élèves des formules payantes seulement (l'offre Découverte a son parcours).
 */
const guideAccueil = cache(async (): Promise<{ p: PriseEnMain | null; conseil: Conseil | null }> => {
  const { user, profile } = await requireUser();
  const scope = parseScope(profile.permission_scope);
  const decouverte = scope.offer === 'decouverte' && scope.type === 'college' && scope.colleges.includes('col-decouverte');
  if (profile.role !== 'student' || decouverte) return { p: null, conseil: null };
  const engine = moteurOuvert(profile, PEDAGO_ENGINE_STUDENT_ENABLED);
  const checkup = moteurOuvert(profile, CHECKUP_STUDENT_ENABLED);
  const [planning, parcours] = await Promise.all([
    PLAN_STUDENT_ENABLED ? planAvailableFor(profile.permission_scope).catch(() => false) : Promise.resolve(false),
    fetchContentAccessForScope(scope).then((a) => a.parcoursMajor && hasMedecineGeneraleAccess(profile.permission_scope)).catch(() => false),
  ]);
  const p = await chargerPriseEnMain(user.id, {
    tutorielVu: !!(profile as { tutoriel_video_vu_at?: string | null }).tutoriel_video_vu_at,
    ouverts: { checkup, moteur: engine, planning },
  }).catch(() => null);
  const exclure = (p?.etapes ?? []).filter((e) => !e.fait && e.cle !== 'tutoriel').map((e) => e.cle as ConseilCle);
  const conseil = await chargerConseil(user.id, {
    permissionScope: profile.permission_scope,
    promotion: (profile as { promotion?: string | null }).promotion ?? null,
    engine, checkup, planning, parcours, exclure,
  }).catch((e) => {
    console.error('[guide] conseil du jour :', e instanceof Error ? e.message : e);
    return null;
  });
  return { p, conseil };
});

async function BienDemarrerAccueil() {
  const { p } = await guideAccueil();
  return p ? <BienDemarrer p={p} /> : null;
}

async function ConseilAccueil({ variante, className }: { variante: 'bande' | 'carte'; className?: string }) {
  const { conseil } = await guideAccueil();
  return conseil ? <ConseilDuJour conseil={conseil} variante={variante} className={className} /> : null;
}

/* ============================================================
   DASHBOARD (streamé) — 1 RPC agrégé + arbre EDN, en parallèle
   ============================================================ */
type StatsResp = {
  totals: {
    attempts_total: number; attempts_correct: number; attempts_week: number;
    sessions_total: number; sessions_week: number;
    reviews_total: number; reviews_week: number;
    fc_mastered: number; flashcards_total: number;
    platform_seconds_week: number; cours_touched_week: number;
    attempts_distinct?: number;
  };
  per_cours: { cours_id: string; attempts: number; correct: number; has_fc: boolean; distinct_done?: number }[];
  qcm_counts: { cours_id: string; n: number; n_qroc?: number }[];
  fc_counts?: { cours_id: string; n: number }[];
  daily: { d: string; n: number }[];
  recent: { kind: string; titre: string; at: string }[];
};

async function Dashboard({
  userId, scope, isDecouverte, engine,
}: {
  userId: string;
  scope: ReturnType<typeof parseScope>;
  isDecouverte: boolean;
  /** Moteur pédagogique actif : priorités et maîtrise viennent de l'état central (un seul état par item). */
  engine: boolean;
}) {
  const supabase = await createClient();

  // Appels parallèles : agrégats par-utilisateur, arbre du programme, totaux de
  // contenu partagés, compteur hebdomadaire, et les données des zones 1-3 du
  // cahier des charges (progression par spécialité + maintien des acquis).
  const [statsRes, ednRes, cachedTotals, secondsThisWeek, maintien, studiedSpecs, activite, pedago] = await Promise.all([
    // RPC hors types générés (database.ts) : cast ciblé, cf. incident schema drift.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).rpc('get_accueil_stats', { p_faculte_id: EDN_FACULTE_ID }) as Promise<{ data: StatsResp | null }>,
    supabase
      .from('facultes')
      .select('semestres(matieres(id, nom, order_index, cours(id, titre, order_index, course_progress(video_watched, fiche_read))))')
      .eq('id', EDN_FACULTE_ID)
      .maybeSingle(),
    // Totaux de contenu (identiques pour tous) mis en cache global — P4.
    getFaculteContentTotals(EDN_FACULTE_ID),
    // Temps de la semaine (lundi → aujourd'hui), partagé avec les pastilles de l'en-tête.
    secondesSemaine(userId),
    getMaintienStats(supabase as never, userId),
    getStudiedSpecialties(supabase as never, userId, scope),
    // « Votre activité » : un point par jour civil (Paris) sur 90 jours —
    // le sélecteur 7 / 30 / 90 jours filtre côté client (partagé avec l'en-tête).
    activiteQuotidienne(),
    // Même vue que le bloc du jour (dédupliquée par requête) : statuts et priorités du moteur central.
    engine ? todayFor(userId).catch(() => null) : Promise.resolve(null),
  ]);

  const stats = (statsRes.data as StatsResp | null) ?? {
    totals: {
      attempts_total: 0, attempts_correct: 0, attempts_week: 0,
      sessions_total: 0, sessions_week: 0, reviews_total: 0, reviews_week: 0,
      fc_mastered: 0, flashcards_total: 0, platform_seconds_week: 0, cours_touched_week: 0,
    },
    per_cours: [], qcm_counts: [], daily: [], recent: [],
  };
  const t = stats.totals;
  const now = Date.now();

  // Voie externe : le contenu QCM accessible est en réalité des QROC. On relabel
  // « QCM » → « QROC » dans les libellés visibles (le KPI, la répartition, etc.).
  const isExterne = scope.voie === 'externe';
  const qLabel = isExterne ? 'QROC' : 'QCM';

  /* ---- Périmètre EDN ---- */
  const colleges = (
    ((ednRes.data as unknown as { semestres?: { matieres?: CollegeRow[] }[] } | null)?.semestres ?? [])
  )
    .flatMap((s) => s.matieres ?? [])
    .filter((m) => canAccessCollege(scope, m.id))
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

  const accessibleCoursIds = colleges.flatMap((m) =>
    (m.cours ?? []).filter((c) => canAccessCours(scope, m.id, c.id)).map((c) => c.id),
  );

  /* ---- Progression par cours : LA formule commune (lib/progress) ----
     Questions accessibles pour la voie/formule de l'élève (mêmes règles que
     l'onglet DP · QI : QROC pour la voie externe, QCM/DP pour l'interne,
     annales et « Révisions » exemptées) et questions distinctes faites parmi
     elles. Même chiffre par item que le navigateur et la bague de l'item. */
  const progression = await chargerProgressionCours({
    userId,
    faculteId: EDN_FACULTE_ID,
    scope,
    cours: colleges.flatMap((m) => m.cours ?? []),
  });
  // Nombre de questions ACCESSIBLES pour un cours (dénominateur « QCM/QROC réalisés »).
  const accessibleCount = (id: string) => progression.get(id)?.input.questionsAccessibles ?? 0;
  const itemsTotal = accessibleCoursIds.reduce((s, id) => s + accessibleCount(id), 0);

  /* ---- Agrégats par cours (attempts / correct / flashcards) ---- */
  const aggByCours = new Map(stats.per_cours.map((p) => [p.cours_id, p]));
  const coursWithFc = new Set(stats.per_cours.filter((p) => p.has_fc).map((p) => p.cours_id));

  /* ---- Progression globale = questions faites / questions accessibles ----
     Rebasée sur le nombre de questions distinctes réellement tentées rapporté
     au total accessible (fiable, ne « monte » plus dès le 1er QCM). */
  const globalQcmDone = accessibleCoursIds.reduce(
    (s, id) => s + (progression.get(id)?.input.questionsFaites ?? 0), 0,
  );
  const globalProgress = itemsTotal > 0 ? Math.round((globalQcmDone / itemsTotal) * 100) : 0;

  /* ---- Statistiques attempts ----
     « QCM/QROC réalisés » = questions DISTINCTES tentées sur le périmètre
     accessible (pas les re-tentatives) → le ratio X/total reste ≤ 100 %. */
  const totalAttempts = globalQcmDone;
  const sessionsCount = t.sessions_total;

  /* ---- Temps de révision (mesuré par le heartbeat plateforme) ---- */
  const hoursThisWeek = Math.floor(secondsThisWeek / 3600);
  const minsThisWeek = Math.floor((secondsThisWeek % 3600) / 60);
  const goalSeconds = 25 * 3600;

  /* ---- Score par cours (priorité de révision) ---- */
  type CoursStats = {
    id: string; titre: string; matiereNom: string;
    attempts: number; correct: number;
    videoDone: boolean; ficheDone: boolean;
    hasFc: boolean;
  };
  const perCours = new Map<string, CoursStats>();
  for (const m of colleges) {
    for (const c of m.cours ?? []) {
      const cp = c.course_progress?.[0];
      const agg = aggByCours.get(c.id);
      perCours.set(c.id, {
        id: c.id, titre: c.titre, matiereNom: m.nom,
        attempts: agg?.attempts ?? 0, correct: agg?.correct ?? 0,
        videoDone: !!cp?.video_watched, ficheDone: !!cp?.fiche_read,
        hasFc: agg?.has_fc ?? false,
      });
    }
  }
  const coursScored = [...perCours.values()].map((c) => {
    // Avancement = formule commune (questions accessibles faites 85 % +
    // couverture fiche/flashcards/vidéo 15 %), cf. lib/progress.
    const value = progression.get(c.id)?.progression ?? 0;
    return { id: c.id, titre: c.titre, matiereNom: c.matiereNom, value, attempts: c.attempts };
  });

  // À travailler en priorité — sélection « intelligente » qui SUIT l'activité
  // réelle de l'élève (et ne reste pas figée / arbitraire) :
  //  1. cours réellement travaillés mais faibles (score bas) → vrais points
  //     faibles ; le classement bouge quand l'élève progresse ;
  //  2. cours non commencés dans les spécialités DÉJÀ entamées → on approfondit
  //     ce que l'élève a commencé plutôt que de proposer du hasard ;
  //  3. cours non commencés des autres spécialités → ouverture.
  const engagedMatieres = new Set(
    coursScored.filter((c) => c.attempts > 0).map((c) => c.matiereNom),
  );
  const engagedWeak = coursScored
    .filter((c) => c.attempts > 0)
    .sort((a, b) => a.value - b.value);
  const untouchedInStarted = coursScored
    .filter((c) => c.attempts === 0 && engagedMatieres.has(c.matiereNom))
    .sort((a, b) => a.value - b.value);
  const untouchedOther = coursScored
    .filter((c) => c.attempts === 0 && !engagedMatieres.has(c.matiereNom))
    .sort((a, b) => a.value - b.value);
  const priorities = [...engagedWeak, ...untouchedInStarted, ...untouchedOther].slice(0, 5);
  const nextPriority = priorities[0] ?? null;

  /* ---- Items maîtrisés (cours ≥ 75 %) ---- */
  const itemsMastered = coursScored.filter((c) => c.value >= 75).length;
  const coursTotalEdn = coursScored.length;
  // Flashcards ACCESSIBLES : somme par cours accessible (au lieu du total faculté).
  const fcCounts = (cachedTotals.fc_counts.length > 0 ? cachedTotals.fc_counts : stats.fc_counts) ?? [];
  const fcCountByCours = new Map(fcCounts.map((f) => [f.cours_id, f.n]));
  const accessibleFcSet = new Set(accessibleCoursIds);
  const flashcardsTotalEdn = fcCounts.length > 0
    ? [...accessibleFcSet].reduce((s, id) => s + (fcCountByCours.get(id) ?? 0), 0)
    : (cachedTotals.flashcards_total || t.flashcards_total);

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

  /* ---- Répartition révisions (QCM vs Flashcards) ---- */
  const reviewsTotal = t.reviews_total;
  const totalRevisions = totalAttempts + reviewsTotal;
  const qcmPct = totalRevisions > 0 ? Math.round((totalAttempts / totalRevisions) * 100) : 0;
  const fcPct  = totalRevisions > 0 ? Math.round((reviewsTotal / totalRevisions) * 100) : 0;

  /* ---- Cette semaine (3 stats) ---- */
  const reviewsThisWeek = t.reviews_week;
  const itemsConsolidatedThisWeek = t.cours_touched_week;
  const progDeltaPct = coursTotalEdn > 0 ? Math.round((itemsConsolidatedThisWeek / coursTotalEdn) * 100) : 0;

  const ago = (ts: number) => {
    const h = Math.round((now - ts) / 3_600_000);
    if (h < 1) return "à l'instant";
    if (h < 24) return `il y a ${h} h`;
    const d = Math.round(h / 24);
    return d === 1 ? 'hier' : `il y a ${d} j`;
  };

  /* ---- Activité récente ---- */
  const recent = stats.recent
    .map((r) => ({ kind: r.kind, college: r.titre, when: new Date(r.at).getTime() }))
    .sort((a, b) => b.when - a.when)
    .slice(0, 5);

  /* ---- Aujourd'hui — objectif du jour ---- */
  const todayQcmTarget = 15;
  const todayCasTarget = 1;
  const todayFcTarget = 10;
  const todayEstMin = 35;

  /* ---- Zones 1-3 du cahier des charges révisions transversales ---- */
  const specsFinished = studiedSpecs.filter((s) => s.isFinished).length;
  const specsInProgress = studiedSpecs.length - specsFinished;
  const validationsPending = studiedSpecs.filter((s) => s.awaitingValidation).length;
  const nextAccessible = Math.max(0, colleges.length - studiedSpecs.length);
  const sizes = sessionSizesFor(studiedSpecs.length);
  const dailyEst = sizes.daily <= 25 ? '15 minutes' : sizes.daily <= 30 ? '15-20 minutes' : sizes.daily <= 35 ? '20 minutes' : '20-25 minutes';
  const lastRevLabel = maintien.daysSinceLast === null
    ? 'Jamais'
    : maintien.daysSinceLast === 0
    ? 'Aujourd\'hui'
    : maintien.daysSinceLast === 1
    ? 'Hier'
    : `Il y a ${maintien.daysSinceLast} jours`;

  return (
    <>
      <SectionTitle className="mt-3" eyebrow="Ma progression" title="Où j’en suis" description="Votre avancée sur le programme, votre temps de travail et votre maîtrise des items." />

      {/* ---- KPI cards (4) — accents caractéristiques de la plateforme ---- */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard accent="#2563EB" Icon={Target} label="Progression globale">
          <div className="flex items-center gap-3">
            <ProgressRing pct={globalProgress} />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-(--color-ink-muted)">Prochaine priorité</p>
              <p className="truncate text-sm font-extrabold text-(--color-ink)">
                {nextPriority?.titre ?? '—'}
              </p>
            </div>
          </div>
          <DiscoveryGateLink
            href="/revisions-transversales"
            locked={isDecouverte}
            className="mt-auto inline-flex items-center gap-1 pt-2 text-[12px] font-bold text-[#2563EB] hover:underline"
          >
            Voir mon plan de travail <ArrowRight className="h-3.5 w-3.5" />
          </DiscoveryGateLink>
        </KpiCard>

        <KpiCard accent="#16A34A" Icon={Clock} label="Temps de révision">
          <p className="text-4xl font-black tabular-nums text-(--color-ink)">
            {hoursThisWeek}h <span className="text-2xl">{minsThisWeek.toString().padStart(2, '0')}</span>
          </p>
          <p className="text-xs text-(--color-ink-soft)">cette semaine</p>
          <div className="mt-auto">
            <p className="rounded-md bg-[#DCFCE7] px-2 py-1 text-center text-[11px] font-bold text-[#16793C]">
              Objectif min. conseillé : 25h / semaine
            </p>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-(--color-sand-200)">
              <div className="h-full rounded-full bg-[#16A34A]" style={{ width: `${Math.min(100, (secondsThisWeek / goalSeconds) * 100)}%` }} />
            </div>
          </div>
        </KpiCard>

        <KpiCard accent="#C0112E" Icon={ClipboardCheck} label={`${qLabel} réalisés`}>
          <p className="text-4xl font-black tabular-nums text-(--color-ink)">
            {totalAttempts}<span className="text-lg font-bold text-(--color-ink-soft)">/{itemsTotal}</span>
          </p>
          <p className="text-xs text-(--color-ink-soft)">questions réalisées · {sessionsCount} séries</p>
          <DiscoveryGateLink
            href="/entrainement"
            locked={isDecouverte}
            className="mt-auto inline-flex items-center justify-center gap-1 rounded-md bg-[#FCEAEC] px-2 py-1.5 text-[12px] font-bold text-[#C0112E] hover:bg-[#FAD1D6]"
          >
            Commencer un entraînement <ArrowRight className="h-3.5 w-3.5" />
          </DiscoveryGateLink>
        </KpiCard>

        {pedago ? (
          <KpiCard accent="#7C3AED" Icon={Layers3} label="Maîtrise consolidée">
            <p className="text-3xl font-black tabular-nums text-(--color-ink)">
              {pedago.counts.maitrise_consolidee} <span className="text-xl text-(--color-ink-soft)">/ {coursTotalEdn}</span>
            </p>
            <p className="text-xs text-(--color-ink-soft)">
              En bonne voie : {pedago.counts.en_bonne_voie} · À consolider : {pedago.counts.a_consolider} · À revoir : {pedago.counts.a_revoir}
            </p>
            <Link
              href="/mes-priorites"
              className="mt-auto inline-flex items-center justify-center gap-1 rounded-md bg-[#EDE9FE] px-2 py-1.5 text-[12px] font-bold text-[#7C3AED] hover:bg-[#DDD3FB]"
            >
              Voir mes priorités <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </KpiCard>
        ) : (
          <KpiCard accent="#7C3AED" Icon={Layers3} label="Items maîtrisés">
            <p className="text-3xl font-black tabular-nums text-(--color-ink)">
              {itemsMastered} <span className="text-xl text-(--color-ink-soft)">/ {coursTotalEdn}</span>
            </p>
            <p className="text-xs text-(--color-ink-soft)">
              {coursTotalEdn > 0 ? Math.round((itemsMastered / coursTotalEdn) * 100) : 0}% des cours maîtrisés
            </p>
            <DiscoveryGateLink
              href="/entrainement"
              locked={isDecouverte}
              className="mt-auto inline-flex items-center justify-center gap-1 rounded-md bg-[#EDE9FE] px-2 py-1.5 text-[12px] font-bold text-[#7C3AED] hover:bg-[#DDD3FB]"
            >
              Voir mes lacunes <ArrowRight className="h-3.5 w-3.5" />
            </DiscoveryGateLink>
          </KpiCard>
        )}
      </section>

      {/* ---- 3 cartes : Aujourd'hui + Évolution + Répartition ---- */}
      <section className={`grid grid-cols-1 gap-4 ${pedago ? 'lg:grid-cols-[1.4fr_0.95fr]' : 'lg:grid-cols-[0.85fr_1.4fr_0.95fr]'}`}>
        {/* Aujourd'hui — sans moteur seulement : avec lui, le programme du jour unique est affiché en tête (I§52). */}
        {!pedago && (
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
            <TodayRow Icon={ClipboardCheck} bg="#FCEAEC" fg="#C0112E" title={`${todayQcmTarget} ${qLabel} ciblés`} sub={nextPriority?.matiereNom ?? 'Cardiologie'} />
            <TodayRow Icon={FileText}       bg="#DBEAFE" fg="#2563EB" title={`${todayCasTarget} cas clinique`} sub="Analyse et raisonnement" />
            <TodayRow Icon={Layers3}        bg="#EDE9FE" fg="#7C3AED" title={`${todayFcTarget} flashcards`} sub="Révision active" />
            <TodayRow Icon={Clock}          bg="#FEF3C7" fg="#D97706" title="Temps estimé" sub={`${todayEstMin} min`} />
          </ul>
          <DiscoveryGateLink
            href="/revisions-transversales"
            locked={isDecouverte}
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-white transition-transform hover:scale-[1.01]"
            style={{ background: 'linear-gradient(90deg,#E4002B 0%,#F97316 100%)' }}
          >
            <Play className="h-4 w-4" /> Commencer maintenant
          </DiscoveryGateLink>
        </Card>
        )}

        {/* Votre activité (temps de travail réel, jour par jour) */}
        <Card>
          <ActiviteChart jours={activite} />
        </Card>

        {/* Répartition révisions */}
        <Card>
          <p className="text-sm font-bold text-(--color-ink)">Répartition des révisions</p>
          <div className="mt-3 flex items-center gap-4">
            <DonutChart qcmPct={qcmPct} fcPct={fcPct} />
            <div className="flex-1 space-y-2 text-[12px]">
              <LegendRow color="#C0112E" label={qLabel} count={totalAttempts} pct={qcmPct} />
              <LegendRow color="#7C3AED" label="Flashcards" count={reviewsTotal} pct={fcPct} />
            </div>
          </div>
          <p className="mt-3 border-t border-(--color-border) pt-2 text-[11px] text-(--color-ink-soft)">
            Total étudié : <span className="font-bold text-(--color-ink)">{totalRevisions}</span> / {itemsTotal + flashcardsTotalEdn}
          </p>
        </Card>
      </section>

      <SectionTitle className="mt-3" eyebrow="Mes révisions" title="Spécialités et maintien des acquis" />

      {/* ---- Zones 1-3 (cahier des charges section 2) ---- */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Zone 1 — Progression dans la formation */}
        <Card>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#DBEAFE] text-[#2563EB]">
              <TrendingUp className="h-4 w-4" />
            </span>
            <p className="text-sm font-bold text-(--color-ink)">Progression</p>
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-center justify-between">
              <span className="text-(--color-ink-soft)">Spécialités terminées</span>
              <span className="font-black tabular-nums text-(--color-ink)">{specsFinished}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-(--color-ink-soft)">Spécialités en cours</span>
              <span className="font-black tabular-nums text-(--color-ink)">{specsInProgress}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-(--color-ink-soft)">Prochaines spécialités accessibles</span>
              <span className="font-black tabular-nums text-(--color-ink)">{nextAccessible}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-(--color-ink-soft)">Validations en attente</span>
              <span className={`font-black tabular-nums ${validationsPending > 0 ? 'text-[#6D28D9]' : 'text-(--color-ink)'}`}>{validationsPending}</span>
            </li>
          </ul>
          {validationsPending > 0 && (
            <p className="mt-3 rounded-lg bg-[#F5F3FF] px-2.5 py-1.5 text-[11px] font-semibold text-[#6D28D9]">
              {studiedSpecs.filter((s) => s.awaitingValidation).slice(0, 2).map((s) => `${s.nom} terminée — interrogation non réalisée.`).join(' ')}
            </p>
          )}
        </Card>

        {/* Zone 2 — Maintien des acquis (révisions transversales uniquement) */}
        <Card>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EDE9FE] text-[#7C3AED]">
              <RefreshCcw className="h-4 w-4" />
            </span>
            <p className="text-sm font-bold text-(--color-ink)">Maintien des acquis</p>
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-center justify-between gap-2">
              <span className="text-(--color-ink-soft)">Révisions transversales réalisées</span>
              <span className="font-black tabular-nums text-(--color-ink)">{maintien.revisions30d} / 30 derniers jours</span>
            </li>
            <li className="flex items-center justify-between gap-2">
              <span className="text-(--color-ink-soft)">Dernière révision transversale</span>
              <span className="font-black tabular-nums text-(--color-ink)">{lastRevLabel}</span>
            </li>
            <li className="flex items-center justify-between gap-2">
              <span className="text-(--color-ink-soft)">Meilleure période de régularité</span>
              <span className="font-black tabular-nums text-(--color-ink)">{maintien.bestStreak} jour{maintien.bestStreak > 1 ? 's' : ''} consécutifs</span>
            </li>
          </ul>
          {maintien.daysSinceLast !== null && maintien.daysSinceLast >= 2 && maintien.daysSinceLast < 7 && (
            <p className="mt-3 rounded-lg bg-[#FFF7E6] px-2.5 py-1.5 text-[11px] font-semibold text-[#B45B00]">
              Vous n&apos;avez pas effectué de révision transversale depuis {maintien.daysSinceLast} jours.
              Une reprise est recommandée pour maintenir vos acquis.
            </p>
          )}
          {maintien.daysSinceLast !== null && maintien.daysSinceLast >= 7 && (
            <p className="mt-3 rounded-lg bg-[#FCEAEC] px-2.5 py-1.5 text-[11px] font-semibold text-[#A91D2C]">
              Attention : aucune révision transversale depuis {maintien.daysSinceLast} jours.
              {maintien.daysSinceLast >= 14 ? ' Une réévaluation est nécessaire avant de débloquer de nouveaux contenus.' : ' Vos anciennes spécialités ne sont plus suffisamment entretenues.'}
            </p>
          )}
          {(maintien.daysSinceLast === null || maintien.daysSinceLast === 1) && (
            <p className="mt-3 rounded-lg bg-(--color-sand-100) px-2.5 py-1.5 text-[11px] font-semibold text-(--color-ink-soft)">
              Votre révision du jour est disponible.
            </p>
          )}
        </Card>

        {/* Zone 3 — Révision du jour (formats selon le nb de spécialités étudiées) */}
        <Card>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FCEAEC] text-[#C0112E]">
              <Play className="h-4 w-4" />
            </span>
            <p className="text-sm font-bold text-(--color-ink)">Révision du jour</p>
          </div>
          <p className="mt-2 text-2xl font-black tabular-nums text-(--color-ink)">
            {sizes.daily} {qLabel}
          </p>
          <p className="text-xs text-(--color-ink-soft)">Temps estimé : {dailyEst}</p>
          <DiscoveryGateLink
            href="/revisions-transversales/session?kind=daily"
            locked={isDecouverte}
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-white transition-transform hover:scale-[1.01]"
            style={{ background: 'linear-gradient(90deg,#E4002B 0%,#F97316 100%)' }}
          >
            <Play className="h-4 w-4" /> Commencer ma révision du jour
          </DiscoveryGateLink>
          {sizes.recommended && (
            <div className="mt-3 border-t border-(--color-border) pt-3">
              <p className="text-sm font-bold text-(--color-ink)">Révision recommandée · {sizes.recommended} {qLabel}</p>
              <p className="text-[11px] text-(--color-ink-soft)">
                {studiedSpecs.length <= 10 ? 'Pour renforcer davantage vos acquis' : studiedSpecs.length <= 15 ? 'Recommandée à ce stade de votre progression' : 'Pour entretenir plus largement les spécialités déjà étudiées'}
              </p>
              <DiscoveryGateLink
                href="/revisions-transversales/session?kind=recommended"
                locked={isDecouverte}
                className="mt-1.5 inline-flex items-center gap-1 text-[12px] font-bold text-[#E8742C] hover:underline"
              >
                Faire la révision recommandée <ArrowRight className="h-3.5 w-3.5" />
              </DiscoveryGateLink>
            </div>
          )}
          {sizes.intensive && (
            <div className="mt-3 border-t border-(--color-border) pt-3">
              <p className="text-sm font-bold text-(--color-ink)">Révision intensive · {sizes.intensive} {qLabel}</p>
              <p className="text-[11px] text-(--color-ink-soft)">Pour les périodes de révision approfondie ou les week-ends — jamais obligatoire</p>
              <DiscoveryGateLink
                href="/revisions-transversales/session?kind=intensive"
                locked={isDecouverte}
                className="mt-1.5 inline-flex items-center gap-1 text-[12px] font-bold text-[#A91D2C] hover:underline"
              >
                Lancer la révision intensive <ArrowRight className="h-3.5 w-3.5" />
              </DiscoveryGateLink>
            </div>
          )}
        </Card>
      </section>

      <SectionTitle className="mt-3" eyebrow="Mes items" title="Ce qu’il faut travailler" />

      {/* ---- À travailler en priorité ---- */}
      {pedago && pedago.priorities.length > 0 ? (
        <Card>
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-(--color-ink)">À travailler en priorité</p>
              <p className="mt-0.5 text-[11px] text-(--color-ink-soft)">
                {pedago.attention} item{pedago.attention > 1 ? 's' : ''} nécessite{pedago.attention > 1 ? 'nt' : ''} actuellement votre attention
              </p>
            </div>
            <Link href="/mes-priorites" className="text-[12px] font-bold text-[#C0112E] hover:underline">
              Voir mes priorités <ArrowRight className="ml-0.5 inline h-3.5 w-3.5" />
            </Link>
          </div>
          <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {pedago.priorities.map((p, i) => {
              const pill = p.status === 'a_revoir'
                ? { bg: '#FCEAEC', fg: '#C0112E' }
                : p.status === 'a_consolider'
                ? { bg: '#FEF3C7', fg: '#A16207' }
                : { bg: '#E0F2FE', fg: '#0369A1' };
              return (
                <li key={p.itemId}>
                  <Link
                    href={`/mes-priorites/${p.itemId}`}
                    className="flex items-center gap-2.5 rounded-xl border border-(--color-border) bg-(--color-surface) p-2.5 transition-colors hover:border-[#C0112E]/40 hover:bg-[#FCEAEC]/40"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-(--color-sand-100) text-[12px] font-black text-(--color-ink-soft)">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-(--color-ink)">{p.name}</span>
                      {p.reason && <span className="block truncate text-[11px] text-(--color-ink-soft)">{p.reason}</span>}
                    </span>
                    <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: pill.bg, color: pill.fg }}>
                      {STATUS_LABEL[p.status]}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      ) : (
      <Card>
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-(--color-ink)">À travailler en priorité</p>
            <p className="mt-0.5 text-[11px] text-(--color-ink-soft)">Basé sur vos résultats récents</p>
          </div>
          <DiscoveryGateLink
            href="/entrainement"
            locked={isDecouverte}
            className="hidden text-[12px] font-bold text-[#C0112E] hover:underline sm:inline-flex"
          >
            Voir mes lacunes <ArrowRight className="ml-0.5 h-3.5 w-3.5" />
          </DiscoveryGateLink>
        </div>
        {priorities.length === 0 ? (
          <p className="mt-4 text-center text-xs text-(--color-ink-muted)">
            Lancez vos premiers {qLabel} pour voir vos priorités apparaître ici.
          </p>
        ) : (
          <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {priorities.map((p, i) => {
              const pill = p.value < 50
                ? { label: 'Priorité haute',   bg: '#FCEAEC', fg: '#C0112E' }
                : { label: 'Priorité moyenne', bg: '#FEF3C7', fg: '#A16207' };
              return (
                <li key={p.id}>
                  <Link
                    href={`/cours/${p.id}`}
                    className="flex items-center gap-2.5 rounded-xl border border-(--color-border) bg-(--color-surface) p-2.5 transition-colors hover:border-[#C0112E]/40 hover:bg-[#FCEAEC]/40"
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
      </Card>
      )}

      {/* ---- Progression par cours ---- */}
      <Card>
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-(--color-ink)">Progression par cours</p>
            <p className="mt-0.5 text-[11px] text-(--color-ink-soft)">
              {coursScored.length} cours · groupés par collège
            </p>
          </div>
        </div>
        <div className="max-h-[320px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
          {coursByMatiere.map((g) => (
            <section key={g.matiereNom}>
              <p className="sticky top-0 bg-(--color-surface) py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-(--color-ink-muted)">
                {g.matiereNom}
              </p>
              <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {g.cours.map((c) => {
                  const pill = c.value < 50
                    ? { label: 'Urgent',     bg: '#FCEAEC', fg: '#C0112E' }
                    : c.value < 75
                    ? { label: 'À revoir',   bg: '#FEF3C7', fg: '#A16207' }
                    : { label: 'En progrès', bg: '#DCFCE7', fg: '#16A34A' };
                  return (
                    <li key={c.id}>
                      <Link href={`/cours/${c.id}`} className="flex items-center gap-2 rounded-lg border border-(--color-border) bg-(--color-surface) px-2.5 py-1.5 transition-colors hover:border-[#C0112E]/30">
                        <span className="min-w-0 flex-1 truncate text-[12.5px] text-(--color-ink)">{c.titre}</span>
                        <span className="hidden h-1 w-16 shrink-0 overflow-hidden rounded-full sm:block" style={{ background: '#ECEEF1' }}>
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
              Aucune activité récente. Lancez votre premier entraînement&nbsp;!
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {recent.map((r, i) => (
                <li key={i} className="flex items-center gap-2 text-[12px]">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-(--color-sand-100) text-(--color-ink-soft)">
                    {r.kind === 'QCM' ? <ClipboardCheck className="h-3 w-3" /> : <Layers3 className="h-3 w-3" />}
                  </span>
                  <span className="flex-1 truncate text-(--color-ink)">{isExterne && r.kind === 'QCM' ? 'QROC' : r.kind} · {r.college}</span>
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
            <WeekStat Icon={TrendingUp} value={`+${progDeltaPct}%`}           label="Progression"          color="#16A34A" />
            <WeekStat Icon={Layers3}    value={`+${reviewsThisWeek}`}          label="Flashcards révisées" color="#7C3AED" />
            <WeekStat Icon={Target}     value={`+${itemsConsolidatedThisWeek}`}label="Items consolidés"     color="#2563EB" />
          </div>
        </Card>
      </section>
    </>
  );
}

/* Skeleton du tableau de bord pendant le streaming du RPC. */
function DashboardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-4">
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-2xl border border-(--color-border) bg-(--color-surface) p-3.5">
            <div className="h-4 w-2/3 rounded bg-(--color-sand-100)" />
            <div className="mt-4 h-8 w-1/2 rounded bg-(--color-sand-100)" />
            <div className="mt-4 h-3 w-full rounded bg-(--color-sand-100)" />
          </div>
        ))}
      </section>
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[0.85fr_1.4fr_0.95fr]">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-52 rounded-2xl border border-(--color-border) bg-(--color-surface)" />
        ))}
      </section>
      <div className="h-40 rounded-2xl border border-(--color-border) bg-(--color-surface)" />
      <div className="h-64 rounded-2xl border border-(--color-border) bg-(--color-surface)" />
    </div>
  );
}

/* ============================================================
   Sub-components
   ============================================================ */

function SidebarSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="rounded-3xl border border-(--color-border) bg-(--color-surface) p-5">
        <div className="flex items-start gap-3.5">
          <div className="h-11 w-11 shrink-0 rounded-2xl bg-(--color-sand-100)" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-(--color-sand-100)" />
            <div className="h-4 w-1/2 rounded bg-(--color-sand-100)" />
          </div>
        </div>
        <div className="mt-4 h-3 w-12 rounded-full bg-(--color-sand-100)" />
        <div className="mt-4 space-y-2">
          <div className="h-3 w-1/3 rounded bg-(--color-sand-100)" />
          <div className="h-4 w-full rounded bg-(--color-sand-100)" />
          <div className="h-4 w-4/5 rounded bg-(--color-sand-100)" />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-(--color-border) pt-4">
          <div className="rounded-2xl border border-(--color-border) px-3 py-2.5">
            <div className="h-3 w-2/3 rounded bg-(--color-sand-100)" />
            <div className="mt-1 h-6 w-1/2 rounded bg-(--color-sand-100)" />
          </div>
          <div className="rounded-2xl border border-(--color-border) px-3 py-2.5">
            <div className="h-3 w-2/3 rounded bg-(--color-sand-100)" />
            <div className="mt-1 h-6 w-1/2 rounded bg-(--color-sand-100)" />
          </div>
        </div>
      </div>
    </div>
  );
}

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

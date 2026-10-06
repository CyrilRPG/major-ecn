import 'server-only';
import Link from 'next/link';
import {
  ArrowRight, CalendarDays, CheckCircle2, ClipboardCheck, Clock, Flame, Gauge, Layers3, LineChart, PencilRuler, RadioTower,
  RefreshCcw, Star, Target, TrendingUp, Trophy, BookOpen, Sparkles, Crosshair, AlertTriangle,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { chargerPlanning } from '@/lib/agenda/planning-server';
import { todayFor } from '@/lib/moteur/server/today';
import { DiscoveryGateLink } from '@/components/espace-decouverte/discovery-gate-link';
import { LaurelMark } from '@/components/student/plan/v4/laurel';
import { EngagementAlert, PlannerAlert, RecoveredBanner } from '@/components/student/moteur/alert-banners';
import { TEXTS as ENGAGEMENT_TEXTS, type EngagementLevel } from '@/lib/engagement/types';
import type { TodayProgramData } from '@/components/student/moteur/today-program';
import type { PermissionScope } from '@/types/domain';
import { cn } from '@/lib/utils';
import {
  activiteQuotidienne, aujourdhuiParis, coursConsultes, derniersResultats, etatEngagement, joursActifs7,
  reactivationsParDelai, regularite, secondesSemaine,
} from './donnees';
import { syntheseProgression } from './synthese';
import { MaJournee, type ConseilLigne } from './ma-journee';
import { MesStatistiques } from './statistiques';
import { Anneau, Bloc, Carte, PointsSemaine, TitreCarte, boutonCarte, displayFont, lienBloc, lienCarte } from './ui';

/**
 * Blocs de l'accueil élève (maquette du 06/10/2026), chacun streamé dans son
 * propre <Suspense> : en-tête « J-N », bandeau de chiffres, « Ma journée »,
 * « Où j'en suis ? », colonne de droite (cours en direct, EVC Check-up, état
 * de préparation), « Mes statistiques », « Consolider mes acquis », « Je veux
 * travailler librement » et le bandeau d'objectif.
 */

/** Vue du jour du moteur central (dédupliquée par requête : `todayFor` est mis en cache). */
const vueDuJour = (userId: string, engine: boolean) => (engine ? todayFor(userId).catch((e) => {
  console.error('[moteur] programme du jour :', e instanceof Error ? e.message : e);
  return null;
}) : Promise.resolve(null));

const fmtDuree = (minutes: number) => `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, '0')}`;
const fmtSecondes = (s: number) => fmtDuree(Math.floor(Math.max(0, s) / 60));
const MOIS_COURT = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const JOUR_COURT = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
/** « 5 octobre » (heure de Paris). */
const jourMois = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', timeZone: 'Europe/Paris' });
const carteBlanche = 'rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-(--shadow-soft)';

/* ─── En-tête : compte à rebours EVC ─── */
export async function CarteEvc({ userId, engine }: { userId: string; engine: boolean }) {
  const view = await vueDuJour(userId, engine);
  const aujourdhui = aujourdhuiParis();
  const exam = view?.ctx.examDate ?? null;
  const restants = exam ? Math.round((Date.parse(`${exam}T12:00:00Z`) - Date.parse(`${aujourdhui}T12:00:00Z`)) / 86_400_000) : null;
  const date = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' });
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-inset ring-white/15">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10 text-[#F5C84B]" aria-hidden><CalendarDays className="h-5 w-5" /></span>
      <span className="leading-tight">
        {restants !== null && restants >= 0 ? (
          <>
            <span className={cn(displayFont, 'block text-[24px] font-extrabold tabular-nums')}>J-{restants}</span>
            <span className="block text-[13px] font-semibold text-white/90">avant l’EVC {exam!.slice(0, 4)}</span>
          </>
        ) : (
          <span className={cn(displayFont, 'block text-[17px] font-extrabold')}>Votre EVC</span>
        )}
        <span className="mt-0.5 block text-[12px] text-white/60">{date.charAt(0).toUpperCase() + date.slice(1)}</span>
      </span>
    </div>
  );
}

export function CarteEvcSkeleton() {
  return <span aria-hidden className="block h-[76px] w-56 animate-pulse rounded-2xl bg-white/10" />;
}

/* ─── État de préparation (bandeau et colonne de droite) ─── */
type Rythme = { titre: string; court: string; texte: string; ok: boolean };
const RYTHME: Record<EngagementLevel, Rythme> = {
  vert: { titre: 'Dans le rythme', court: 'Votre régularité est bonne !', texte: 'Votre régularité et vos résultats sont cohérents avec votre objectif.', ok: true },
  jaune: { titre: 'Rythme à surveiller', court: 'Gardez un rythme régulier.', texte: 'Votre rythme ralentit : quelques séances régulières suffisent à rester dans les temps.', ok: false },
  orange: { titre: 'Rythme insuffisant', court: 'Reprenez dès aujourd’hui.', texte: 'Votre activité est en dessous de ce que demande votre objectif : votre programme du jour vous aide à reprendre.', ok: false },
  rouge: { titre: 'Reprise nécessaire', court: 'Reprenez pas à pas.', texte: 'Vous avez décroché ces derniers jours : reprenez pas à pas avec votre programme du jour.', ok: false },
};
const DEMARRAGE: Rythme = { titre: 'Démarrage', court: 'Votre préparation commence.', texte: 'Votre préparation commence : votre programme du jour vous guide pas à pas.', ok: true };
async function rythme(userId: string): Promise<Rythme> {
  const [etat, jours] = await Promise.all([etatEngagement(userId), activiteQuotidienne()]);
  // Aucune activité mesurée depuis 90 jours : préparation qui démarre, pas un décrochage.
  if (jours && !jours.some((j) => j.s > 0 || j.qcm + j.cas + j.fc + j.transv > 0)) return DEMARRAGE;
  if (etat?.niveau) return RYTHME[etat.niveau];
  // Sans état d'engagement (moteur fermé, compte récent) : la régularité des 7 derniers jours.
  const actifs = joursActifs7(jours, aujourdhuiParis());
  return actifs >= 4 ? RYTHME.vert : actifs >= 2 ? RYTHME.jaune : actifs === 1
    ? { titre: 'Prise de rythme', court: 'Un bon début : continuez demain.', texte: 'Votre préparation démarre : une séance par jour installe le rythme.', ok: false }
    : RYTHME.orange;
}

/* ─── Bandeau de chiffres ─── */
export async function BandeauChiffres({ userId, engine }: { userId: string; engine: boolean }) {
  const aujourdhui = aujourdhuiParis();
  const [view, jours, r] = await Promise.all([vueDuJour(userId, engine), activiteQuotidienne(), rythme(userId)]);
  const reg = regularite(jours, aujourdhui);
  const aFaire = view?.program.remainingMinutes ?? 0;
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <div className={cn(carteBlanche, 'flex items-center gap-4 p-4')}>
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#FDF4F5] text-[#C0112E] ring-1 ring-[#F6D9DD]" aria-hidden><Clock className="h-7 w-7" /></span>
        <span className="min-w-0 leading-tight">
          <span className={cn(displayFont, 'block text-[26px] font-extrabold tabular-nums text-[#14254E] dark:text-(--color-ink)')}>{fmtDuree(aFaire)}</span>
          <span className="block text-[13px] text-(--color-ink-soft)">à faire aujourd’hui<br />sur votre planning</span>
        </span>
      </div>
      <div className={cn(carteBlanche, 'flex items-center gap-4 p-4')}>
        <span className={cn('grid h-14 w-14 shrink-0 place-items-center rounded-full ring-1', r.ok ? 'bg-green-50 text-green-600 ring-green-100 dark:bg-green-500/10 dark:ring-green-500/20' : 'bg-amber-50 text-amber-600 ring-amber-100 dark:bg-amber-500/10 dark:ring-amber-500/20')} aria-hidden>
          {r.ok ? <TrendingUp className="h-7 w-7" /> : <AlertTriangle className="h-6 w-6" />}
        </span>
        <span className="min-w-0 leading-tight">
          <span className={cn(displayFont, 'block text-[17px] font-extrabold text-[#14254E] dark:text-(--color-ink)')}>{r.titre}</span>
          <span className={cn('mt-0.5 block text-[13px] font-semibold', reg.evolution === null ? 'text-(--color-ink-soft)' : reg.evolution < 0 ? 'text-[#C0112E]' : 'text-green-700 dark:text-green-400')}>
            {reg.evolution !== null ? `${reg.evolution >= 0 ? '+' : '−'} ${Math.abs(reg.evolution)} % cette semaine` : `${fmtSecondes(reg.secondes7)} sur 7 jours`}
          </span>
          <span className="mt-0.5 block text-[12px] text-(--color-ink-soft)">{r.court}</span>
        </span>
      </div>
      <div className={cn(carteBlanche, 'flex flex-wrap items-center gap-4 p-4')}>
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-orange-50 text-orange-500 ring-1 ring-orange-100 dark:bg-orange-500/10 dark:ring-orange-500/20" aria-hidden><Flame className="h-7 w-7" /></span>
        <span className="leading-tight">
          <span className={cn(displayFont, 'block text-[26px] font-extrabold tabular-nums text-[#14254E] dark:text-(--color-ink)')}>{reg.consecutifs} / 7</span>
          <span className="block text-[13px] text-(--color-ink-soft)">jours consécutifs</span>
        </span>
        <PointsSemaine semaine={reg.semaine} className="ml-auto" />
      </div>
    </div>
  );
}

export function BandeauChiffresSkeleton() {
  return <div className="grid grid-cols-1 gap-3 md:grid-cols-3" aria-hidden>{Array.from({ length: 3 }).map((_, i) => <div key={i} className={cn(carteBlanche, 'h-[90px] animate-pulse')} />)}</div>;
}

/* ─── Alertes du moteur central (au-dessus de « Ma journée », seulement si besoin) ─── */
export async function AlertesMoteur({ userId, engine }: { userId: string; engine: boolean }) {
  const view = await vueDuJour(userId, engine);
  if (!view) return null;
  if (!view.alert && !view.recovered && !view.plannerAlert) return null;
  return (
    <div className="flex flex-col gap-3">
      {view.alert && <EngagementAlert alert={view.alert} />}
      {!view.alert && view.recovered && <RecoveredBanner text={ENGAGEMENT_TEXTS.recovery.confirmed} />}
      {view.plannerAlert && <PlannerAlert alert={view.plannerAlert} />}
    </div>
  );
}

/* ─── 1. Ma journée ─── */
export async function MaJourneeBloc({ userId, engine, conseil }: { userId: string; engine: boolean; conseil: Promise<ConseilLigne | null> }) {
  const [view, c] = await Promise.all([vueDuJour(userId, engine), conseil]);
  if (!view) {
    return (
      <MaJournee
        conseil={c}
        data={{
          activities: [], totalMinutes: 0, remainingMinutes: 0, backlog: 0, start: null, attention: 0, plannerDay: null, plannerStatus: 'absent',
          transversal: null, lastCheckup: null, pendingCorrection: null, recommendation: { recommend: false, reason: null }, notifications: [],
          examInvite: false, examDate: null, responsibility: '', stale: false,
        }}
      />
    );
  }
  const plan = view.ctx.plan;
  const data: TodayProgramData = {
    activities: view.program.activities, totalMinutes: view.program.totalMinutes, remainingMinutes: view.program.remainingMinutes,
    backlog: view.program.backlog, start: view.start, attention: view.attention, plannerDay: view.plannerDay,
    plannerStatus: plan && plan.onboarding_done ? plan.planner_status : 'absent', transversal: view.transversal,
    lastCheckup: view.lastCheckup ? { id: view.lastCheckup.id, score: view.lastCheckup.score, at: view.lastCheckup.at, scope: view.lastCheckup.scope } : null,
    pendingCorrection: view.pendingCorrection, recommendation: view.recommendation,
    notifications: view.notifications.map((n) => ({ id: n.id, title: n.title, body: n.body, cta_label: n.cta_label, cta_href: n.cta_href })),
    examInvite: view.examInvite, examDate: view.ctx.examDate, responsibility: view.responsibility, stale: view.stale,
  };
  return <MaJournee data={data} conseil={c} />;
}

export function BlocSkeleton({ hauteur = 'h-80' }: { hauteur?: string }) {
  return <div aria-hidden className={cn(carteBlanche, 'animate-pulse', hauteur)} />;
}

/* ─── 2. Où j'en suis ? ─── */
export async function OuJenSuisBloc({ userId, scope, engine }: { userId: string; scope: PermissionScope; engine: boolean }) {
  const aujourdhui = aujourdhuiParis();
  const [s, view, secondes, jours] = await Promise.all([
    syntheseProgression(userId, scope), vueDuJour(userId, engine), secondesSemaine(userId), activiteQuotidienne(),
  ]);
  const reg = regularite(jours, aujourdhui);
  const maitrises = view ? view.counts.maitrise_consolidee : s.itemsMaitrises;
  const pctMaitrise = s.itemsTotal > 0 ? Math.round((maitrises / s.itemsTotal) * 100) : 0;
  const nf = (n: number) => n.toLocaleString('fr-FR');
  return (
    <Bloc
      numero={2} id="ou-j-en-suis" icon={TrendingUp} titre="Où j’en suis ?"
      description="Une vue d’ensemble de votre progression et de votre régularité."
      action={<Link href={engine ? '/mes-priorites' : '/facultes'} className={lienBloc}>Voir le détail <ArrowRight className="h-3.5 w-3.5" aria-hidden /></Link>}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Carte>
          <TitreCarte icon={TrendingUp} couleur="#2563EB">Progression globale</TitreCarte>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
            <Anneau pct={s.progressionGlobale} couleur="#2563EB"><span className={cn(displayFont, 'text-[17px] font-extrabold tabular-nums text-[#14254E] dark:text-(--color-ink)')}>{s.progressionGlobale} %</span></Anneau>
            <p className="text-[12px] leading-snug text-(--color-ink-soft)">Programme parcouru<br /><strong className="text-[15px] tabular-nums text-[#14254E] dark:text-(--color-ink)">{nf(s.itemsParcourus)} / {nf(s.itemsTotal)}</strong> items</p>
          </div>
        </Carte>
        <Carte>
          <TitreCarte icon={Gauge}>Maîtrise consolidée</TitreCarte>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
            <Anneau pct={pctMaitrise} couleur="#C0112E"><span className={cn(displayFont, 'text-[17px] font-extrabold tabular-nums text-[#14254E] dark:text-(--color-ink)')}>{pctMaitrise} %</span></Anneau>
            <p className="text-[12px] leading-snug text-(--color-ink-soft)">Items maîtrisés<br /><strong className="text-[15px] tabular-nums text-[#14254E] dark:text-(--color-ink)">{nf(maitrises)} / {nf(s.itemsTotal)}</strong> items</p>
          </div>
        </Carte>
        <Carte>
          <TitreCarte icon={Clock}>Temps de travail</TitreCarte>
          <p className={cn(displayFont, 'mt-3 text-[26px] font-extrabold tabular-nums text-[#14254E] dark:text-(--color-ink)')}>{fmtSecondes(secondes)}</p>
          <p className="text-[12px] text-(--color-ink-soft)">cette semaine</p>
          <p className="mt-auto self-start whitespace-nowrap rounded-lg bg-green-50 px-2 py-1.5 text-[11px] font-semibold text-green-700 ring-1 ring-inset ring-green-100 dark:bg-green-500/10 dark:text-green-300 dark:ring-green-500/20">
            Objectif : 25 h / semaine
          </p>
        </Carte>
        <Carte>
          <TitreCarte icon={Flame} couleur="#F97316">Jours actifs</TitreCarte>
          <p className={cn(displayFont, 'mt-3 text-[26px] font-extrabold tabular-nums text-[#14254E] dark:text-(--color-ink)')}>{reg.consecutifs} / 7</p>
          <p className="text-[12px] text-(--color-ink-soft)">jours consécutifs</p>
          <PointsSemaine semaine={reg.semaine} className="mt-auto pt-2" />
        </Carte>
      </div>
    </Bloc>
  );
}

/* ─── Colonne de droite : cours en direct ─── */
export async function CoursEnDirectBloc({ userId, scope }: { userId: string; scope: PermissionScope }) {
  const donnees = await chargerPlanning(await createClient(), userId, scope).catch(() => null);
  const aujourdhui = aujourdhuiParis();
  const maintenant = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' });
  const cours = (donnees?.evenements ?? [])
    .filter((e) => e.genre === 'direct' && (e.date > aujourdhui || (e.date === aujourdhui && (e.fin ?? e.debut ?? '23:59') >= maintenant)))
    .sort((a, b) => a.date.localeCompare(b.date) || (a.debut ?? '').localeCompare(b.debut ?? ''));
  const heure = (h: string | null) => (h ? h.replace(':', 'h') : null);
  return (
    <section aria-labelledby="cours-direct" className={cn(carteBlanche, 'p-4')}>
      <div className="flex items-center justify-between gap-2">
        <h2 id="cours-direct" className="flex items-center gap-2 text-[14px] font-bold text-[#14254E] dark:text-(--color-ink)">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#FDF4F5] text-[#C0112E] ring-1 ring-[#F6D9DD] dark:bg-white/5 dark:ring-(--color-border)" aria-hidden><RadioTower className="h-4 w-4" /></span>
          Mes prochains cours en direct
        </h2>
        <Link href="/agenda" className={lienCarte}>Voir tout <ArrowRight className="h-3.5 w-3.5" aria-hidden /></Link>
      </div>
      {cours.length === 0 ? (
        <p className="mt-3 text-[12.5px] text-(--color-ink-soft)">Aucun cours en direct prévu dans les 30 prochains jours.</p>
      ) : (
        <ul className="mt-3 divide-y divide-(--color-border)">
          {cours.slice(0, 3).map((c) => {
            const d = new Date(`${c.date}T12:00:00Z`);
            const enDirect = c.date === aujourdhui && !!c.debut && c.debut <= maintenant && (c.fin ?? '23:59') >= maintenant;
            return (
              <li key={c.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <span className="w-[84px] shrink-0 text-[12px] leading-tight">
                  <span className="block font-bold text-[#14254E] dark:text-(--color-ink)">{JOUR_COURT[d.getUTCDay()]} {d.getUTCDate()} {MOIS_COURT[d.getUTCMonth()]}</span>
                  {c.debut && <span className="block text-(--color-ink-soft)">{heure(c.debut)}{c.fin ? ` – ${heure(c.fin)}` : ''}</span>}
                </span>
                <span className="min-w-0 flex-1 text-[12px] leading-tight">
                  <span className="block truncate font-bold text-[#14254E] dark:text-(--color-ink)" title={c.titre}>{c.titre}</span>
                  {c.intervenant && <span className="block truncate text-(--color-ink-soft)">{c.intervenant}</span>}
                </span>
                <span className={cn('shrink-0 rounded-md px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide', enDirect ? 'bg-[#E4002B] text-white' : 'bg-(--color-surface-soft) text-(--color-ink-soft)')}>
                  {enDirect ? 'En direct' : 'À venir'}
                </span>
              </li>
            );
          })}
        </ul>
      )}
      <Link href="/agenda" className={cn(boutonCarte, 'mt-3')}>
        {cours.length > 0 ? `Voir les ${cours.length} prochains cours` : 'Voir mon agenda'} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </Link>
    </section>
  );
}

/* ─── Colonne de droite : EVC Check-up ─── */
export async function CheckupBloc({ userId, ouvert }: { userId: string; ouvert: boolean }) {
  const resultats = (await derniersResultats(userId)).filter((r) => r.checkup);
  if (!ouvert && resultats.length === 0) return null;
  const [dernier, precedent] = resultats;
  const pct = dernier ? Math.round(dernier.pourcentage) : null;
  const ecart = dernier && precedent ? Math.round(dernier.pourcentage - precedent.pourcentage) : null;
  return (
    <section aria-labelledby="mon-checkup" className={cn(carteBlanche, 'flex flex-1 flex-col p-4')}>
      <h2 id="mon-checkup" className={cn(displayFont, 'flex items-center gap-2 text-[16px] font-extrabold text-[#14254E] dark:text-(--color-ink)')}>
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#FDF4F5] text-[#C0112E] ring-1 ring-[#F6D9DD] dark:bg-white/5 dark:ring-(--color-border)" aria-hidden><Crosshair className="h-4 w-4" /></span>
        Mon EVC Check-up
      </h2>
      <div className="flex flex-1 items-center gap-4 py-3">
        <Anneau pct={pct ?? 0} couleur="#7C3AED" taille={96} epaisseur={10}>
          <span className={cn(displayFont, 'block text-[22px] font-extrabold tabular-nums text-[#14254E] dark:text-(--color-ink)')}>{pct !== null ? `${pct} %` : '—'}</span>
          {dernier && <span className="block text-[10.5px] text-(--color-ink-soft)">le {jourMois(dernier.date)}</span>}
        </Anneau>
        {ecart !== null ? (
          <div className="min-w-0">
            <p className={cn('inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[18px] font-extrabold tabular-nums', ecart >= 0 ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300' : 'bg-[#FDF4F5] text-[#C0112E]')}>
              {ecart >= 0 ? '↑' : '↓'} {ecart >= 0 ? '+' : '−'}{Math.abs(ecart)} pts
            </p>
            <p className="mt-1 text-[12.5px] text-(--color-ink-soft)">par rapport<br />au précédent</p>
          </div>
        ) : (
          <p className="min-w-0 text-[12.5px] leading-snug text-(--color-ink-soft)">
            {dernier ? 'Votre premier Check-up : refaites-en un pour mesurer votre évolution.' : 'Mesurez votre niveau sur l’ensemble du programme.'}
          </p>
        )}
      </div>
      <Link href={dernier ? '/evaluations' : '/checkup'} className={boutonCarte}>
        {dernier ? 'Voir mon évolution' : 'Faire mon Check-up'} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </Link>
    </section>
  );
}

/* ─── Colonne de droite : état de préparation ─── */
export async function EtatPreparationBloc({ userId }: { userId: string }) {
  const r = await rythme(userId);
  return (
    <section aria-labelledby="etat-preparation" className={cn(carteBlanche, 'flex gap-3 p-4')}>
      <span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-full', r.ok ? 'bg-green-50 text-green-600 dark:bg-green-500/10' : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10')} aria-hidden>
        {r.ok ? <CheckCircle2 className="h-6 w-6" /> : <AlertTriangle className="h-5 w-5" />}
      </span>
      <div className="min-w-0">
        <h2 id="etat-preparation" className="text-[14px] font-bold text-[#14254E] dark:text-(--color-ink)">État de préparation</h2>
        <p className={cn('mt-2 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[14px] font-bold', r.ok ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300')}>
          {r.ok ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : <AlertTriangle className="h-4 w-4" aria-hidden />} {r.titre}
        </p>
        <p className="mt-2 text-[12.5px] leading-snug text-(--color-ink-soft)">{r.texte}</p>
      </div>
    </section>
  );
}

/* ─── 3. Mes statistiques ─── */
export async function StatistiquesBloc({ userId, scope }: { userId: string; scope: PermissionScope }) {
  const [jours, cours, s] = await Promise.all([activiteQuotidienne(), coursConsultes(userId), syntheseProgression(userId, scope)]);
  return (
    <MesStatistiques
      jours={jours} cours={cours} aujourdhui={aujourdhuiParis()} specialites={s.parSpecialite}
      contenuTotal={s.contenuTotal} qLabel={scope.voie === 'externe' ? 'QROC' : 'QCM'}
    />
  );
}

/* ─── 4. Consolider mes acquis ─── */
const DELAIS = [7, 14, 30, 60];

export async function ConsoliderBloc({ userId, engine, isDecouverte }: { userId: string; engine: boolean; isDecouverte: boolean }) {
  const [view, etat, delais, resultats] = await Promise.all([vueDuJour(userId, engine), etatEngagement(userId), reactivationsParDelai(userId), derniersResultats(userId)]);
  const proposees = etat?.transversalesProposees ?? view?.transversal?.assigned ?? 0;
  const faites = Math.min(proposees, etat?.transversalesFaites ?? view?.transversal?.completed ?? 0);
  const cercles = Math.min(10, Math.max(proposees, 7));
  const c = view?.counts;
  const priorites = c ? c.a_revoir + c.a_consolider + c.en_bonne_voie : 0;
  return (
    <Bloc numero={4} id="consolider" icon={Layers3} titre="Consolider mes acquis" description="Les révisions et les priorités pour maximiser votre score.">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Carte>
          <TitreCarte icon={RefreshCcw} couleur="#7C3AED">Révisions transversales</TitreCarte>
          <div className="mt-3 flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-violet-50 text-violet-600 dark:bg-violet-500/10" aria-hidden><Clock className="h-5 w-5" /></span>
            <span className="leading-tight">
              <span className={cn(displayFont, 'block text-[24px] font-extrabold tabular-nums text-[#14254E] dark:text-(--color-ink)')}>{faites} / {proposees}</span>
              <span className="block text-[12px] text-(--color-ink-soft)">réalisées sur 14 jours</span>
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2" aria-label={`${faites} révisions transversales réalisées sur ${proposees}`}>
            {Array.from({ length: cercles }).map((_, i) => (
              <span key={i} aria-hidden className={cn('h-5 w-5 rounded-full border-2', i < faites ? 'border-violet-500 bg-violet-500' : 'border-(--color-border) bg-(--color-surface)')} />
            ))}
          </div>
          <p className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-[11.5px] text-(--color-ink-soft)">
            {DELAIS.map((d) => <span key={d}>J+{d} ({delais.get(d) ?? 0})</span>)}
          </p>
          <div aria-hidden className="min-h-3 flex-1" />
          <DiscoveryGateLink href="/revisions-transversales" locked={isDecouverte} className={boutonCarte}>
            Commencer mes révisions <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </DiscoveryGateLink>
        </Carte>

        <Carte>
          <TitreCarte icon={ClipboardCheck} action={engine ? <Link href="/mes-priorites" className={lienCarte}>Voir toutes <ArrowRight className="h-3.5 w-3.5" aria-hidden /></Link> : undefined}>Mes priorités</TitreCarte>
          {c ? (
            <ul className="mt-3 space-y-1.5 text-[13px]">
              <li className="flex items-baseline gap-2.5">
                <span className={cn(displayFont, 'w-10 shrink-0 text-right text-[28px] font-extrabold tabular-nums text-[#C0112E]')}>{priorites}</span>
                <span className="text-(--color-ink-soft)">items à retravailler</span>
              </li>
              {([
                ['a_revoir', 'items très prioritaires', 'bg-[#FDF4F5] text-[#C0112E]'],
                ['a_consolider', 'items intermédiaires', 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'],
                ['en_bonne_voie', 'items à surveiller', 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300'],
              ] as const).map(([k, label, cls]) => (
                <li key={k} className="flex items-center gap-2.5">
                  <span className={cn('w-10 shrink-0 rounded-md py-0.5 text-center text-[13px] font-bold tabular-nums', cls)}>{c[k]}</span>
                  <span className="text-(--color-ink-soft)">{label}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-[12.5px] text-(--color-ink-soft)">Vos priorités apparaîtront ici dès vos premiers entraînements.</p>
          )}
          <div aria-hidden className="min-h-3 flex-1" />
          <Link href={engine ? '/mes-priorites' : '/entrainement'} className={boutonCarte}>
            {engine ? 'Voir mes priorités' : 'Commencer un entraînement'} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </Carte>

        <Carte>
          <TitreCarte icon={LineChart} action={<Link href="/evaluations" className={lienCarte}>Voir tout <ArrowRight className="h-3.5 w-3.5" aria-hidden /></Link>}>Derniers résultats</TitreCarte>
          {resultats.length === 0 ? (
            <p className="mt-3 text-[12.5px] text-(--color-ink-soft)">Vos résultats apparaîtront ici après votre premier Check-up ou entraînement.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {resultats.slice(0, 4).map((r) => {
                const corps = (
                  <>
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#FDF4F5] text-[#C0112E] dark:bg-white/5" aria-hidden>
                      {r.checkup ? <Crosshair className="h-3.5 w-3.5" /> : <Target className="h-3.5 w-3.5" />}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[12.5px] text-(--color-ink)" title={r.intitule}>{r.intitule}</span>
                    <span className="w-11 shrink-0 text-right text-[13px] font-bold tabular-nums text-[#14254E] dark:text-(--color-ink)">{Math.round(r.pourcentage)} %</span>
                    <span className="w-[74px] shrink-0 text-right text-[11.5px] text-(--color-ink-soft)">{jourMois(r.date)}</span>
                  </>
                );
                return (
                  <li key={r.cle}>
                    {r.href ? <Link href={r.href} className="flex items-center gap-2.5 rounded-lg hover:bg-(--color-surface-soft) focus-ring">{corps}</Link> : <span className="flex items-center gap-2.5">{corps}</span>}
                  </li>
                );
              })}
            </ul>
          )}
        </Carte>
      </div>
    </Bloc>
  );
}

/* ─── 5. Je veux travailler librement ─── */
export function TravaillerLibrementBloc({ isDecouverte, flashcardsHref }: { isDecouverte: boolean; flashcardsHref: string }) {
  const outils: { href: string; titre: string; sous: string; Icon: typeof Target; verrou?: boolean }[] = [
    { href: '/entrainement', titre: 'Entraînement ciblé', sous: 'QCM, QROC, cas cliniques', Icon: Target, verrou: true },
    { href: '/revisions-transversales', titre: 'Révisions transversales', sous: 'Spaced repetition', Icon: RefreshCcw, verrou: true },
    { href: '/epreuves-blanches', titre: 'Épreuves blanches', sous: 'Conditions réelles', Icon: PencilRuler, verrou: true },
    { href: '/arena', titre: 'EVC Arena', sous: 'Défis et classements', Icon: Trophy },
    { href: '/facultes', titre: 'Mes cours', sous: 'Fiches, annales, dossiers', Icon: BookOpen },
    { href: flashcardsHref, titre: 'Flashcards', sous: 'Révision espacée', Icon: Layers3 },
    { href: '/revoir', titre: 'Questions à revoir', sous: 'Mes erreurs', Icon: Star },
  ];
  const tuile = 'group relative flex h-full flex-col gap-2 rounded-xl border border-(--color-border) bg-(--color-surface) p-3 transition-colors hover:border-[#C0112E]/35 hover:bg-[#FDF4F5]/50 focus-ring';
  return (
    <Bloc numero={5} id="travailler-librement" icon={Sparkles} titre="Je veux travailler librement" description="Accédez à tous les outils de la plateforme.">
      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 xl:grid-cols-7">
        {outils.map((o) => {
          const corps = (
            <>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#FDF4F5] text-[#C0112E] ring-1 ring-[#F6D9DD] dark:bg-white/5 dark:ring-(--color-border)" aria-hidden><o.Icon className="h-[18px] w-[18px]" /></span>
              <span className="min-w-0 pr-4">
                <span className="block text-[12.5px] font-bold leading-tight text-[#14254E] dark:text-(--color-ink)">{o.titre}</span>
                <span className="mt-0.5 block text-[11px] leading-tight text-(--color-ink-soft)">{o.sous}</span>
              </span>
              <ArrowRight className="absolute bottom-3 right-3 h-3.5 w-3.5 text-[#C0112E] transition-transform group-hover:translate-x-0.5" aria-hidden />
            </>
          );
          return (
            <li key={o.titre}>
              {o.verrou ? <DiscoveryGateLink href={o.href} locked={isDecouverte} className={tuile}>{corps}</DiscoveryGateLink> : <Link href={o.href} className={tuile}>{corps}</Link>}
            </li>
          );
        })}
      </ul>
    </Bloc>
  );
}

/* ─── Bandeau d'objectif (pied de page) ─── */
export async function BandeauObjectif({ userId, engine }: { userId: string; engine: boolean }) {
  const view = await vueDuJour(userId, engine);
  return (
    <section className="relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-[#F6D9DD] bg-[linear-gradient(120deg,#FDF4F5_0%,#FFFFFF_60%,#FFFBEB_100%)] p-5 shadow-(--shadow-soft) md:flex-row md:items-center md:gap-6 dark:border-(--color-border) dark:bg-(--color-surface)">
      <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-white text-[#C0112E] shadow-(--shadow-xs) ring-1 ring-[#F6D9DD] dark:bg-white/10 dark:ring-(--color-border)" aria-hidden><Crosshair className="h-8 w-8" /></span>
      <div className="min-w-0 flex-1">
        <h2 className={cn(displayFont, 'text-[19px] font-extrabold text-[#8B0E22] dark:text-[#F89BA3]')}>Votre objectif est à portée de main.</h2>
        <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-(--color-ink-soft)">Major vous accompagne à chaque étape, avec les meilleurs enseignants et une méthode qui a fait ses preuves.</p>
      </div>
      <Link href={view?.start?.href ?? '/planificateur'} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(90deg,#E4002B_0%,#F97316_100%)] px-5 text-sm font-bold text-white shadow-[0_10px_28px_-12px_rgba(228,0,43,0.9)] transition-transform hover:scale-[1.02] focus-ring">
        Continuer ma progression <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
      <span className="relative grid h-[124px] w-[136px] shrink-0 place-items-center self-center text-[#8B0E22] dark:text-[#F89BA3]">
        <LaurelMark className="absolute inset-0 h-full w-full opacity-90" />
        <span className="relative -mt-3 max-w-[74px] text-center text-[8px] font-extrabold uppercase leading-[1.25] tracking-wide">Plus de<br />9 000 élèves<br />déjà<br />accompagnés</span>
      </span>
    </section>
  );
}

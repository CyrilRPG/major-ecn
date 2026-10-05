/**
 * Adhérence au planificateur (moteur B, §6, §28 à §31) — module PUR.
 *
 * Statut DISTINCT de l'activité générale (§2, §30) :
 *  - activité verte + planning orange = candidat actif mais plus lent que
 *    prévu → proposer d'adapter le programme, jamais parler de décrochage ;
 *  - activité rouge + planning rouge = décrochage général → c'est l'alerte
 *    d'engagement qui parle (pas de double message) ;
 *  - un candidat actif qui travaille ailleurs sur Major ECN n'est jamais
 *    classé inactif (§31).
 * Les activités faites en avance comptent comme réalisées (§41), les jours de
 * pause et le jour d'un recalcul récent ne créent aucun retard (§18, §49).
 */
import { addDays } from './engine';
import { LEVEL_SEVERITY, type AdherenceLevel, type EngagementConfig, type EngagementLevel } from './types';

export type AdherenceSession = {
  day: string;
  planned_day: string | null;
  status: 'planifiee' | 'en_cours' | 'terminee' | 'reportee' | 'sautee' | 'annulee';
  origin: 'planning' | 'avance' | 'temps_supplementaire';
  minutes: number;
  actual_minutes: number | null;
};

export type AdherenceInput = {
  today: string;
  sessions: AdherenceSession[];
  /** Jours de pause et d'indisponibilité déclarée : exclus du calcul. */
  excludedDays?: Set<string>;
  /** Raisons de journée incomplète des 14 derniers jours (§24). */
  recentReasons?: { day: string; reason: string | null }[];
  /**
   * Dernière reconfiguration voulue par le candidat (création, disponibilités,
   * réactivation, fin de pause, adaptation) : pas d'alerte de retard dans les
   * heures qui suivent (§49 « recalcul récent »). Le recalcul quotidien
   * automatique n'en est pas une.
   */
  lastReconfigAt?: string | null;
  nowIso: string;
  engagementLevel: EngagementLevel;
  /** Jours actifs (activité significative) sur la fenêtre « planificateur ignoré ». */
  activeDaysInWindow: number;
  lowAdherenceChoiceAt?: string | null;
  config: EngagementConfig;
};

export type DayAdherence = { planned: number; done: number; deferred: number; cancelled: number; doneInAdvance: number; plannedMinutes: number; doneMinutes: number };

export type AdherenceResult = {
  rate7: number | null;
  rate30: number | null;
  level: AdherenceLevel | null;
  last7: DayAdherence;
  yesterday: DayAdherence & { day: string; incomplete: boolean };
  /** Jours de travail planifié non réalisé (minutes manquées / charge moyenne d'un jour). */
  delayDays: number;
  /** §28 : veille incomplète à signaler à la prochaine ouverture. */
  j1Alert: boolean;
  /** §29 : retard répété → proposer d'adapter (jamais « Accélérez »). */
  delayAlert: boolean;
  /** §24 : « planning trop chargé » répété → proposer d'alléger. */
  overloadRepeated: boolean;
  /** §31 : actif ailleurs, planning ignoré. */
  plannerIgnored: boolean;
  /** §30 : lecture combinée activité × planning. */
  situation: 'ras' | 'actif_plus_lent' | 'decrochage_general' | 'planning_ignore';
  suppressedReason: null | 'recalcul_recent';
};

function bucket(sessions: AdherenceSession[], from: string, to: string, excluded: Set<string>): DayAdherence {
  const out: DayAdherence = { planned: 0, done: 0, deferred: 0, cancelled: 0, doneInAdvance: 0, plannedMinutes: 0, doneMinutes: 0 };
  for (const s of sessions) {
    if (s.origin === 'temps_supplementaire') continue; // bonus : jamais une dette, jamais un retard
    // Jour de référence : le jour PRÉVU (une activité faite en avance compte pour son jour prévu).
    const ref = s.origin === 'avance' && s.planned_day ? s.planned_day : s.day;
    if (ref < from || ref > to || excluded.has(ref)) continue;
    if (s.status === 'annulee') { out.cancelled++; continue; }
    out.planned++;
    out.plannedMinutes += s.minutes;
    if (s.status === 'terminee') {
      out.done++;
      out.doneMinutes += s.actual_minutes ?? s.minutes;
      if (s.origin === 'avance') out.doneInAdvance++;
    } else if (s.status === 'reportee') out.deferred++;
  }
  return out;
}

const rate = (d: DayAdherence) => (d.planned > 0 ? Math.round((d.done / d.planned) * 100) : null);

export function computeAdherence(input: AdherenceInput): AdherenceResult {
  const cfg = input.config.planner;
  const excluded = input.excludedDays ?? new Set<string>();
  const today = input.today;
  const yesterdayKey = addDays(today, -1);
  // Les jours écoulés seulement : la journée en cours n'est pas encore un retard.
  const last7 = bucket(input.sessions, addDays(today, -7), yesterdayKey, excluded);
  const last30 = bucket(input.sessions, addDays(today, -30), yesterdayKey, excluded);
  const y = bucket(input.sessions, yesterdayKey, yesterdayKey, excluded);
  const rate7 = rate(last7);
  const rate30 = rate(last30);
  const level: AdherenceLevel | null = rate7 === null ? null : rate7 >= cfg.adherence_vert ? 'vert' : rate7 >= cfg.adherence_orange ? 'orange' : 'rouge';
  const avgDay = last30.planned > 0 ? last30.plannedMinutes / Math.max(1, new Set(input.sessions.map((s) => s.day)).size) : 0;
  const missedMinutes = Math.max(0, last7.plannedMinutes - last7.doneMinutes);
  const delayDays = avgDay > 0 ? Math.round((missedMinutes / avgDay) * 10) / 10 : 0;

  const recent = !!input.lastReconfigAt && Date.parse(input.nowIso) - Date.parse(input.lastReconfigAt) < cfg.recent_recalc_hours * 3_600_000;
  const yesterdayIncomplete = y.planned > 0 && y.done < y.planned;
  const overloadCount = (input.recentReasons ?? []).filter((r) => r.reason === 'planning_trop_charge' && r.day >= addDays(today, -14)).length;

  // §31 : faible adhérence sur la fenêtre, mais activité réelle ailleurs.
  const win = bucket(input.sessions, addDays(today, -cfg.low_adherence_days), yesterdayKey, excluded);
  const winRate = rate(win);
  const askedRecently = !!input.lowAdherenceChoiceAt && Date.parse(input.nowIso) - Date.parse(input.lowAdherenceChoiceAt) < cfg.low_adherence_cooldown_days * 86_400_000;
  const plannerIgnored = win.planned >= 3 && winRate !== null && winRate <= cfg.low_adherence_rate && input.activeDaysInWindow >= 3 && !askedRecently;

  const delayAlert = last7.planned >= cfg.delay_min_planned && rate7 !== null && rate7 < cfg.delay_rate_7d;
  const activityBad = LEVEL_SEVERITY[input.engagementLevel] >= LEVEL_SEVERITY.rouge;
  let situation: AdherenceResult['situation'] = 'ras';
  if (plannerIgnored) situation = 'planning_ignore';
  else if (level === 'rouge' && activityBad) situation = 'decrochage_general';
  else if ((level === 'orange' || level === 'rouge') && !activityBad) situation = 'actif_plus_lent';

  return {
    rate7, rate30, level, last7,
    yesterday: { ...y, day: yesterdayKey, incomplete: yesterdayIncomplete },
    delayDays,
    j1Alert: yesterdayIncomplete && !recent,
    delayAlert: delayAlert && situation !== 'decrochage_general',
    overloadRepeated: overloadCount >= cfg.overload_repeat,
    plannerIgnored,
    situation,
    suppressedReason: recent ? 'recalcul_recent' : null,
  };
}

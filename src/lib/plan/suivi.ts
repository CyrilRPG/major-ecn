/**
 * Tableau de bord « Suivi » de « Mon planning » — module PUR.
 *
 * Ce que le candidat a RÉELLEMENT effectué : réalisation (unités validées,
 * jamais le temps passé), journées planifiées travaillées, activités
 * réalisées, maîtrise observée sur les activités effectuées, évolution sur
 * 7 / 30 / 90 jours (jour OFF ≠ journée planifiée non réalisée), répartition
 * nouveaux contenus / consolidation selon la charge pédagogique prévue,
 * régularité et conseil personnalisé (complément « réalisation » §11).
 */
import { addDays, daysBetween, type DayKey } from './clock';
import { periodCompletion, type DayCompletion } from './completion';

export type SuiviDay = DayCompletion & {
  /** Charge prévue de progression / de révision ce jour-là (min). */
  progressionWeight: number;
  revisionWeight: number;
};

export type SuiviInput = {
  today: DayKey;
  days: SuiviDay[];
  /** Résultats (0–1) des unités évaluées des activités réalisées, avec leur jour. */
  unitResults: { day: DayKey; result: number }[];
  /** Part de progression visée par la phase en cours (0,70 / 0,60 / 0,50 / 0,35). */
  targetProgression: number;
  /** Premier jour du planificateur : la courbe ne montre jamais de « jours OFF » antérieurs à son utilisation. */
  startDay?: DayKey | null;
};

export type ChartPoint = { day: DayKey; rate: number | null; off: boolean; future: boolean };

export type Suivi = {
  week: { from: DayKey; to: DayKey };
  completionWeek: number | null;
  plannedDaysWeek: number;
  workedDaysWeek: number;
  activitiesPlannedWeek: number;
  activitiesDoneWeek: number;
  masteryWeek: number | null;
  regularityWeek: number | null;
  regularityPrevious: number | null;
  regularityDelta: number | null;
  series: Record<7 | 30 | 90, ChartPoint[]>;
  distribution: Record<7 | 30 | 90, { progression: number; revision: number; total: number }>;
  advice: { title: string; text: string; tone: 'good' | 'effort' | 'load' | 'restart' | 'start' };
};

/** Une journée compte dans la semaine si elle est passée, ou si c'est aujourd'hui et qu'on y a déjà travaillé. */
function counted(d: SuiviDay, today: DayKey): boolean {
  return d.day < today || (d.day === today && d.worked);
}

function regularity(days: SuiviDay[], from: DayKey, to: DayKey, today: DayKey): { planned: number; worked: number; rate: number | null } {
  const list = days.filter((d) => d.day >= from && d.day <= to && !d.off && counted(d, today));
  const worked = list.filter((d) => d.worked).length;
  return { planned: list.length, worked, rate: list.length > 0 ? worked / list.length : null };
}

export function computeSuivi(i: SuiviInput): Suivi {
  // « Cette semaine » = les 7 derniers jours (aujourd'hui compris) : jamais un tableau vide le lundi matin ;
  // « la semaine précédente » = les 7 jours d'avant.
  const from = addDays(i.today, -6);
  const to = i.today;
  const inWeek = i.days.filter((d) => d.day >= from && d.day <= to && counted(d, i.today));
  const reg = regularity(i.days, from, to, i.today);
  const prevFrom = addDays(from, -7);
  const prevTo = addDays(from, -1);
  const prev = regularity(i.days, prevFrom, prevTo, i.today);
  const weekResults = i.unitResults.filter((u) => u.day >= from && u.day <= to);

  const series = {} as Suivi['series'];
  const distribution = {} as Suivi['distribution'];
  const byDay = new Map(i.days.map((d) => [d.day, d]));
  for (const n of [7, 30, 90] as const) {
    const pts: ChartPoint[] = [];
    let prog = 0; let rev = 0;
    for (let k = n - 1; k >= 0; k--) {
      const day = addDays(i.today, -k);
      if (i.startDay && day < i.startDay) continue;
      const d = byDay.get(day);
      const off = !d || d.off;
      // Aujourd'hui non encore travaillé : pas de point « 0 % » prématuré.
      const pending = day === i.today && !!d && !d.worked;
      pts.push({ day, rate: off || pending ? null : d!.rate, off, future: pending });
      if (d && !d.off) { prog += d.progressionWeight; rev += d.revisionWeight; }
    }
    series[n] = pts;
    const total = prog + rev;
    distribution[n] = { progression: total > 0 ? prog / total : 0, revision: total > 0 ? rev / total : 0, total };
  }

  const completionWeek = periodCompletion(inWeek);
  const masteryWeek = weekResults.length > 0 ? weekResults.reduce((s, u) => s + u.result, 0) / weekResults.length : null;
  // Le conseil juge des journées CLOSES (aujourd'hui est encore en cours), à partir de deux journées planifiées.
  const closed = i.days.filter((d) => d.day >= from && d.day < i.today && !d.off);
  const adviceCompletion = closed.length >= 2 ? periodCompletion(closed) : null;
  return {
    week: { from, to },
    completionWeek,
    plannedDaysWeek: reg.planned,
    workedDaysWeek: reg.worked,
    activitiesPlannedWeek: inWeek.reduce((s, d) => s + d.activitiesPlanned, 0),
    activitiesDoneWeek: inWeek.reduce((s, d) => s + d.activitiesCompleted, 0),
    masteryWeek,
    regularityWeek: reg.rate,
    regularityPrevious: prev.rate,
    regularityDelta: reg.rate !== null && prev.rate !== null ? Math.round((reg.rate - prev.rate) * 100) : null,
    series,
    distribution,
    advice: adviceFor(adviceCompletion, masteryWeek, closed.length),
  };
}

/**
 * Conseil personnalisé : réalisation et maîtrise sont deux dimensions
 * indépendantes (complément §11).
 */
export function adviceFor(completion: number | null, mastery: number | null, plannedDays: number): Suivi['advice'] {
  const pct = completion === null ? null : Math.round(completion * 100);
  if (plannedDays === 0 || completion === null) {
    return { tone: 'start', title: 'C’est parti !', text: 'Votre suivi se construit au fil des activités réalisées : commencez votre programme du jour, chaque question soumise et chaque carte traitée comptent.' };
  }
  const goodCompletion = completion >= 0.7;
  const goodMastery = mastery === null ? true : mastery >= 0.7;
  if (goodCompletion && goodMastery) {
    return { tone: 'good', title: 'Bonne dynamique !', text: `Vous avez réalisé ${pct} % de votre programme sur les jours planifiés. Continuez sur ce rythme et pensez à intégrer vos révisions transversales.` };
  }
  if (goodCompletion && !goodMastery) {
    return { tone: 'effort', title: 'Vous travaillez avec régularité', text: `Vous avez réalisé ${pct} % de votre programme. Certains contenus demandent encore de la consolidation : vos réactivations et vos erreurs prioritaires vont être renforcées.` };
  }
  if (!goodCompletion && goodMastery) {
    return { tone: 'load', title: 'Vous réussissez ce que vous traitez', text: `Vous avez réalisé ${pct} % de votre programme sur les jours planifiés. La charge proposée est peut-être trop importante : ajustez vos disponibilités dans « Mes objectifs », le planning s’adaptera.` };
  }
  return { tone: 'restart', title: 'Reprenons pas à pas', text: `Vous avez réalisé ${pct} % de votre programme. Le planning se recentre sur l’essentiel : commencez par les activités prioritaires du jour, même courtes.` };
}

/** Libellé d'un écart de régularité (« + 12 % »). */
export function deltaLabel(delta: number | null): string | null {
  if (delta === null) return null;
  if (delta === 0) return '= 0 %';
  return `${delta > 0 ? '+' : '−'} ${Math.abs(delta)} %`;
}

export { daysBetween };

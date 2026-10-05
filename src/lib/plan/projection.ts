/**
 * Projection jusqu'à l'EVC (§19, §31) — module PUR.
 *
 * Vue SYNTHÉTIQUE, pas un calendrier rigide : à partir du backlog de
 * l'orchestrateur, de la disponibilité et de la part de progression de chaque
 * phase, estime la couverture du programme atteignable avant l'épreuve, le
 * backlog P1 et la capacité des 21 prochains jours.
 */
import { workFactor, type PlanParams } from './config';
import { addDays, daysBetween, type DayKey } from './clock';
import { dayAvailability, phaseOf, type Availability } from './composer';
import { isCoveredView, isWorkedView, type PlanItemView, type WorkLevel } from './items';
import type { EngineItem } from './matrix';
import type { Need } from './needs';

export type ProjectionInput = {
  today: DayKey;
  examDate: DayKey;
  availability: Availability;
  unavailableDays: Set<DayKey>;
  items: EngineItem[];
  views: Map<string, PlanItemView>;
  needs: Need[];
  noveltyFactor: number;
  speedLearn: number;
  /** Disponibilité exceptionnellement réduite (« Alertes » §27) et charge maximale (§33). */
  availabilityOverrides?: Map<DayKey, number>;
  maxMinutesPerDay?: number;
  params: PlanParams;
};

export type Projection = {
  totalItems: number;
  coveredNow: number;
  /** Couverture projetée à la date de l'EVC (0–1). */
  projectedCoverage: number;
  /** Jour où tout le programme serait couvert (null si jamais avant l'EVC). */
  fullCoverageOn: DayKey | null;
  p1Total: number;
  p1Covered: number;
  p1BacklogMinutes: number;
  p1CapacityMinutes: number;
  p1Absorbable: boolean;
  /** Capacité totale (min) jusqu'à l'EVC et part prévue en progression. */
  capacityMinutes: number;
  progressionCapacityMinutes: number;
  learnBacklogMinutes: number;
  byDomain: { domainId: string | null; total: number; covered: number; projected: number }[];
};

export function project(i: ProjectionInput, horizonP1Days: number): Projection {
  const p = i.params;
  const total = i.items.length;
  const levelOf = (id: string): WorkLevel => i.views.get(id)?.workLevel ?? 'NEW';
  const covered = new Set(i.items.filter((it) => { const v = i.views.get(it.id); return !!v && isCoveredView(v); }).map((it) => it.id));
  const workedShare = total > 0 ? i.items.filter((it) => { const v = i.views.get(it.id); return !!v && isWorkedView(v); }).length / total : 0;
  const availOf = (day: DayKey) => Math.min(dayAvailability(day, i.availability, i.unavailableDays, i.availabilityOverrides), i.maxMinutesPerDay ?? Infinity);

  // Acquisitions restantes, dans l'ordre de priorité de l'orchestrateur.
  const learnNeeds = i.needs.filter((n) => n.type === 'LEARN' && n.itemId).sort((a, b) => b.priorityScore - a.priorityScore || a.key.localeCompare(b.key));
  const itemById = new Map(i.items.map((it) => [it.id, it]));
  const learnMinutes = (id: string) => {
    const it = itemById.get(id);
    if (!it) return 0;
    const v = i.views.get(id);
    const totalM = it.learnMinutes * workFactor(p, levelOf(id)) * (v?.shortVersion ? p.durations.short_version_share : 1) * i.speedLearn;
    return Math.max(0, totalM - (v?.learnDone ?? 0));
  };

  // Capacité de progression jour par jour (part de la phase × nouveauté, bornée).
  const daysLeft = Math.max(0, daysBetween(i.today, i.examDate));
  let capacity = 0;
  let progCapacity = 0;
  let coveredCount = covered.size;
  let queueIdx = 0;
  let pending = learnNeeds.length > 0 ? learnMinutes(learnNeeds[0].itemId!) : 0;
  let fullOn: DayKey | null = learnNeeds.length === 0 ? i.today : null;
  const projectedCovered = new Set(covered);
  for (let k = 0; k < daysLeft; k++) {
    const day = addDays(i.today, k);
    const avail = availOf(day);
    if (avail <= 0) continue;
    capacity += avail;
    const ph = phaseOf(daysBetween(day, i.examDate), workedShare, coveredCount / Math.max(1, total), p);
    let prog = avail * Math.max(0, Math.min(p.composition.max_progression_share, ph.share * i.noveltyFactor));
    progCapacity += prog;
    while (prog > 0 && queueIdx < learnNeeds.length) {
      const use = Math.min(prog, pending);
      prog -= use; pending -= use;
      if (pending <= 1e-6) {
        projectedCovered.add(learnNeeds[queueIdx].itemId!);
        coveredCount++;
        queueIdx++;
        pending = queueIdx < learnNeeds.length ? learnMinutes(learnNeeds[queueIdx].itemId!) : 0;
        if (queueIdx >= learnNeeds.length && !fullOn) fullOn = day;
      }
    }
  }

  // Backlog P1 : minutes des besoins ouverts des items P1 (acquisition, consolidation, diagnostic, erreurs, réactivations de l'horizon).
  const horizonEnd = addDays(i.today, horizonP1Days);
  let p1Backlog = 0;
  for (const n of i.needs) {
    if (!n.itemId || n.level !== 'P1' || n.dueOn >= horizonEnd) continue;
    const st = levelOf(n.itemId);
    switch (n.type) {
      case 'LEARN': p1Backlog += learnMinutes(n.itemId); break;
      case 'CONSOLIDATE': p1Backlog += p.durations.reference.CONSOLIDATE * workFactor(p, st); break;
      case 'REACTIVATE': p1Backlog += p.durations.reference.REACTIVATE * workFactor(p, st); break;
      case 'ERROR_REVIEW': p1Backlog += p.durations.reference.ERROR_REVIEW; break;
      case 'DIAGNOSTIC': p1Backlog += p.durations.reference.DIAGNOSTIC; break;
      default: break;
    }
  }
  let p1Capacity = 0;
  for (let k = 0; k < Math.min(horizonP1Days, daysLeft); k++) p1Capacity += availOf(addDays(i.today, k));

  const p1Items = i.items.filter((it) => it.level === 'P1');
  const domains = new Map<string | null, { total: number; covered: number; projected: number }>();
  for (const it of i.items) {
    const d = domains.get(it.domainId) ?? { total: 0, covered: 0, projected: 0 };
    d.total++;
    if (covered.has(it.id)) d.covered++;
    if (projectedCovered.has(it.id)) d.projected++;
    domains.set(it.domainId, d);
  }
  return {
    totalItems: total,
    coveredNow: covered.size,
    projectedCoverage: total > 0 ? Math.min(1, projectedCovered.size / total) : 1,
    fullCoverageOn: fullOn,
    p1Total: p1Items.length,
    p1Covered: p1Items.filter((it) => covered.has(it.id)).length,
    p1BacklogMinutes: Math.round(p1Backlog),
    p1CapacityMinutes: Math.round(p1Capacity),
    p1Absorbable: p1Backlog <= p1Capacity,
    capacityMinutes: Math.round(capacity),
    progressionCapacityMinutes: Math.round(progCapacity),
    learnBacklogMinutes: Math.round(learnNeeds.reduce((s, n) => s + learnMinutes(n.itemId!), 0)),
    byDomain: Array.from(domains.entries()).map(([domainId, v]) => ({ domainId, ...v })),
  };
}

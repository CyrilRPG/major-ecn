import 'server-only';
import { fetchAllRows } from '@/lib/supabase/fetch-all';
import { addDays, parisDay, type DayKey } from './clock';
import {
  collegeFamily, getParameterSet, listActivities, listColleges, listDayMetrics, listDomains, listGenerations, listItems, listItemsByIds, listLogs, listPreparations, listProfiles,
  listStudentsByIds, planDb,
  type GenerationRow, type LogRow, type PlanActivityRow,
} from './db';
import { hardPriorityStatus } from './matrix';
import type { PlanPreparation, PlanProfile } from './types';

/**
 * Back-office du planificateur (§34, §35) : préparations et structure,
 * compteurs hard_priority (alerte 5 %, blocage 10 %), statistiques de
 * planification et de réalisation, fiche d'un candidat.
 */

export type PreparationStat = PlanPreparation & {
  name: string;
  domains: number;
  items: number;
  itemsWithoutDomain: number;
  hard: number;
  hardShare: number;
  hardAlert: boolean;
  hardBlocked: boolean;
};

export async function preparationStats(): Promise<PreparationStat[]> {
  const [preps, colleges, items, params] = await Promise.all([listPreparations(), listColleges(), listItems({ activeOnly: true }), getParameterSet()]);
  const out: PreparationStat[] = [];
  for (const p of preps) {
    const family = new Set(collegeFamily(p.specialite_id, colleges));
    const its = items.filter((i) => family.has(i.specialite_id));
    const domains = p.curriculum_structure === 'HIERARCHICAL' ? await listDomains(p.specialite_id) : [];
    const hard = its.filter((i) => i.hard_priority).length;
    const st = hardPriorityStatus(its.length, hard, params.params);
    out.push({
      ...p, name: p.label ?? colleges.find((c) => c.id === p.specialite_id)?.nom ?? p.specialite_id, domains: domains.length, items: its.length,
      itemsWithoutDomain: p.curriculum_structure === 'HIERARCHICAL' ? its.filter((i) => !i.domain_id).length : 0, hard, hardShare: st.share, hardAlert: st.alert, hardBlocked: st.blocked,
    });
  }
  return out;
}

type MetricRow = { user_id: string; day: DayKey; off: boolean; completion_rate: number | null; planned_weight: number; validated_weight: number; worked: boolean; progression_weight: number; revision_weight: number; minutes_planned: number; actual_minutes: number | null; postponements: number; activities_planned: number; activities_completed: number; priority_mode: boolean };

export type AdminOverview = {
  preparations: PreparationStat[];
  paramVersion: number;
  paramDate: string | null;
  candidates: { total: number; actif: number; en_pause: number; desactive: number; a_reconfigurer: number; priorityMode: number; migrated: number };
  realisation: { completion7: number | null; completion30: number | null; workedShare30: number | null; postponeRate30: number | null; plannedMinutes30: number; actualMinutes30: number; progressionShare30: number | null };
  usage: { advance30: number; extra30: number; added30: number; preferencesUsed: number; avoided: { label: string; count: number }[]; coachings: Record<'coaching_vu' | 'coaching_ignore' | 'planifies' | 'termines', number>; priorityEntries30: number; priorityExits30: number };
};

export async function adminOverview(): Promise<AdminOverview> {
  const [preparations, params, profiles] = await Promise.all([preparationStats(), getParameterSet(), listProfiles({ onboarded: true })]);
  const today = parisDay(new Date());
  const since30 = addDays(today, -30);
  const metrics = await fetchAllRows<MetricRow>((f, t) => planDb().from('plan_day_metrics').select('user_id, day, off, completion_rate, planned_weight, validated_weight, worked, progression_weight, revision_weight, minutes_planned, actual_minutes, postponements, activities_planned, activities_completed, priority_mode')
    .gte('day', since30).order('day').order('user_id').range(f, t));
  const planned = (rows: MetricRow[]) => rows.filter((m) => !m.off);
  const rate = (rows: MetricRow[]) => { const p = planned(rows); const w = p.reduce((s, m) => s + Number(m.planned_weight), 0); return w > 0 ? p.reduce((s, m) => s + Number(m.validated_weight), 0) / w : null; };
  const last7 = metrics.filter((m) => m.day >= addDays(today, -7));
  const p30 = planned(metrics);
  const prog = p30.reduce((s, m) => s + Number(m.progression_weight), 0);
  const rev = p30.reduce((s, m) => s + Number(m.revision_weight), 0);
  const acts = await fetchAllRows<{ origin: string; resource_ids: { coachingId?: string | null } | null; status: string }>((f, t) => planDb().from('plan_activities').select('origin, resource_ids, status').gte('scheduled_date', since30).order('id').range(f, t));
  const logs = await fetchAllRows<{ kind: string }>((f, t) => planDb().from('plan_activity').select('kind').gte('created_at', `${since30}T00:00:00Z`).in('kind', ['coaching_vu', 'coaching_ignore', 'mode_prioritaire_entree', 'mode_prioritaire_sortie']).order('id').range(f, t));
  const count = (k: string) => logs.filter((l) => l.kind === k).length;
  const avoidedCount = new Map<string, number>();
  for (const p of profiles) for (const d of p.preferences?.avoided_domains ?? []) avoidedCount.set(d, (avoidedCount.get(d) ?? 0) + 1);
  const domainNames = new Map<string, string>();
  for (const prep of preparations) if (prep.curriculum_structure === 'HIERARCHICAL') for (const d of await listDomains(prep.specialite_id)) domainNames.set(d.id, d.label);
  const byStatus = (s: string) => profiles.filter((p) => (p.planner_status ?? 'actif') === s).length;
  return {
    preparations, paramVersion: params.version, paramDate: params.created_at,
    candidates: {
      total: profiles.length, actif: byStatus('actif'), en_pause: byStatus('en_pause'), desactive: byStatus('desactive'), a_reconfigurer: byStatus('a_reconfigurer'),
      priorityMode: profiles.filter((p) => p.priority_mode).length, migrated: profiles.filter((p) => !!p.v41_migrated_at).length,
    },
    realisation: {
      completion7: rate(last7), completion30: rate(metrics), workedShare30: p30.length > 0 ? p30.filter((m) => m.worked).length / p30.length : null,
      postponeRate30: p30.reduce((s, m) => s + m.activities_planned, 0) > 0 ? p30.reduce((s, m) => s + m.postponements, 0) / p30.reduce((s, m) => s + m.activities_planned, 0) : null,
      plannedMinutes30: p30.reduce((s, m) => s + m.minutes_planned, 0), actualMinutes30: p30.reduce((s, m) => s + (m.actual_minutes ?? 0), 0),
      progressionShare30: prog + rev > 0 ? prog / (prog + rev) : null,
    },
    usage: {
      advance30: acts.filter((a) => a.origin === 'ADVANCE').length, extra30: acts.filter((a) => a.origin === 'EXTRA').length, added30: acts.filter((a) => a.origin === 'ADDED' || a.origin === 'REPLACEMENT').length,
      preferencesUsed: profiles.filter((p) => p.preferences && !p.preferences.none && (p.preferences.liked_domains.length + p.preferences.avoided_domains.length + p.preferences.consolidate_domains.length + p.preferences.liked_items.length + p.preferences.avoided_items.length + p.preferences.consolidate_items.length) > 0).length,
      avoided: Array.from(avoidedCount.entries()).map(([id, c]) => ({ label: domainNames.get(id) ?? 'Item', count: c })).sort((a, b) => b.count - a.count).slice(0, 8),
      coachings: {
        coaching_vu: count('coaching_vu'), coaching_ignore: count('coaching_ignore'),
        planifies: acts.filter((a) => a.resource_ids?.coachingId).length, termines: acts.filter((a) => a.resource_ids?.coachingId && a.status === 'COMPLETED').length,
      },
      priorityEntries30: count('mode_prioritaire_entree'), priorityExits30: count('mode_prioritaire_sortie'),
    },
  };
}

export type CandidateRow = {
  userId: string; name: string; email: string | null; specialite: string | null; status: string; priorityMode: boolean; lastGenerated: string | null;
  completion7: number | null; migrated: boolean; examDate: string | null;
};
export async function candidatesList(): Promise<CandidateRow[]> {
  const [profiles, colleges] = await Promise.all([listProfiles({ onboarded: true }), listColleges()]);
  const students = new Map((await listStudentsByIds(profiles.map((p) => p.user_id))).map((s) => [s.id, s]));
  const today = parisDay(new Date());
  const metrics = await fetchAllRows<{ user_id: string; off: boolean; planned_weight: number; validated_weight: number }>((f, t) => planDb().from('plan_day_metrics').select('user_id, off, planned_weight, validated_weight').gte('day', addDays(today, -7)).order('user_id').order('day').range(f, t));
  const byUser = new Map<string, { p: number; v: number }>();
  for (const m of metrics) { if (m.off) continue; const c = byUser.get(m.user_id) ?? { p: 0, v: 0 }; c.p += Number(m.planned_weight); c.v += Number(m.validated_weight); byUser.set(m.user_id, c); }
  return profiles.map((p) => {
    const s = students.get(p.user_id);
    const c = byUser.get(p.user_id);
    return {
      userId: p.user_id, name: [s?.first_name, s?.last_name].filter(Boolean).join(' ') || '—', email: s?.email ?? null,
      specialite: p.specialite_id ? colleges.find((x) => x.id === p.specialite_id)?.nom ?? p.specialite_id : null, status: p.planner_status ?? 'actif', priorityMode: !!p.priority_mode,
      lastGenerated: p.last_generated_at, completion7: c && c.p > 0 ? c.v / c.p : null, migrated: !!p.v41_migrated_at, examDate: p.exam_date,
    };
  }).sort((a, b) => (b.lastGenerated ?? '').localeCompare(a.lastGenerated ?? ''));
}

export type CandidateDetail = {
  profile: PlanProfile;
  name: string;
  email: string | null;
  activities: PlanActivityRow[];
  metrics: Awaited<ReturnType<typeof listDayMetrics>>;
  generations: GenerationRow[];
  logs: LogRow[];
  statusHistory: { old_status: string | null; new_status: string; reason: string | null; comment: string | null; created_at: string }[];
  dayPlans: { day: string; version: number; status: string; entries: number; reason: string | null; created_at: string }[];
  itemNames: Map<string, string>;
};
export async function candidateDetail(userId: string): Promise<CandidateDetail | null> {
  const profiles = await listProfiles();
  const profile = profiles.find((p) => p.user_id === userId);
  if (!profile) return null;
  const today = parisDay(new Date());
  const [student, activities, metrics, generations, logs, { data: hist }, { data: plans }] = await Promise.all([
    listStudentsByIds([userId]).then((r) => r[0]),
    listActivities(userId, { from: addDays(today, -14), to: addDays(today, 8) }),
    listDayMetrics(userId, addDays(today, -30), today),
    listGenerations(userId, 15),
    listLogs(userId, { limit: 80 }),
    planDb().from('plan_status_history').select('old_status, new_status, reason, comment, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(30),
    planDb().from('plan_day_plans').select('day, version, status, entries, reason, created_at').eq('user_id', userId).gte('day', addDays(today, -7)).order('day', { ascending: false }).order('version', { ascending: false }).limit(60),
  ]);
  const ids = Array.from(new Set(activities.flatMap((a) => (a.item_ids.length > 0 ? a.item_ids : a.item_id ? [a.item_id] : []))));
  const itemNames = new Map((await listItemsByIds(ids)).map((i) => [i.id, i.nom_item]));
  return {
    profile, name: [student?.first_name, student?.last_name].filter(Boolean).join(' ') || '—', email: student?.email ?? null, activities, metrics, generations, logs,
    statusHistory: (hist ?? []) as CandidateDetail['statusHistory'],
    dayPlans: ((plans ?? []) as { day: string; version: number; status: string; entries: unknown[]; reason: string | null; created_at: string }[]).map((p) => ({ ...p, entries: Array.isArray(p.entries) ? p.entries.length : 0 })),
    itemNames,
  };
}

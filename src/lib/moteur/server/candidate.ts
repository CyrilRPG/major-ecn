import 'server-only';
import { parseScope, canAccessCollege } from '@/lib/auth/permissions';
import type { PermissionScope } from '@/types/domain';
import { todayKey } from '@/lib/suivi/format';
import { getProfile as getPlanProfile } from '@/lib/plan/db';
import { coursCatalog, getCandidateProfile, moteurDb, upsertCandidateProfile } from './db';
import type { PlanProfile } from '@/lib/plan/types';

/**
 * Contexte d'un candidat pour le moteur central : formule, voie, spécialités
 * accessibles, date d'EVC pertinente (§50 du cahier « Alertes »), planificateur.
 */
export type CandidateContext = {
  userId: string;
  email: string | null;
  role: string;
  isActive: boolean;
  scope: PermissionScope;
  voie: 'interne' | 'externe' | null;
  /** Date d'activation effective (§48). */
  activationDay: string;
  /** Spécialités (collèges de premier niveau) accessibles. */
  specialties: string[];
  mainSpecialty: string | null;
  examDate: string | null;
  examDateSource: 'calendrier' | 'planificateur' | 'candidat' | null;
  plan: PlanProfile | null;
  /** Planificateur réellement utilisé (créé, non désactivé, non en pause). */
  plannerActive: boolean;
  today: string;
};

type ProfileRow = { id: string; role: string; email: string | null; is_active: boolean | null; permission_scope: unknown; access_start: string | null; created_at: string; faculte_id: string | null };

export async function loadProfileRow(userId: string): Promise<ProfileRow | null> {
  const { data } = await moteurDb().from('profiles').select('id, role, email, is_active, permission_scope, access_start, created_at, faculte_id').eq('id', userId).maybeSingle();
  return (data as ProfileRow | null) ?? null;
}

export async function candidateContext(userId: string, opts: { now?: Date; profile?: ProfileRow | null } = {}): Promise<CandidateContext | null> {
  const profile = opts.profile ?? await loadProfileRow(userId);
  if (!profile) return null;
  const now = opts.now ?? new Date();
  const today = todayKey(now);
  const scope = parseScope(profile.permission_scope);
  const { parentOf } = await coursCatalog();
  const tops = Array.from(parentOf.entries()).filter(([id, p]) => !p && id !== 'col-decouverte').map(([id]) => id);
  const specialties = tops.filter((id) => canAccessCollege(scope, id));
  const [cp, plan] = await Promise.all([getCandidateProfile(userId), getPlanProfile(userId).catch(() => null)]);
  const plannerActive = !!plan && plan.onboarding_done && ((plan as PlanProfile & { planner_status?: string }).planner_status ?? 'actif') === 'actif';
  let mainSpecialty = cp?.main_specialite_id ?? (plan?.specialite_id ?? null);
  if (!mainSpecialty || !specialties.includes(mainSpecialty)) mainSpecialty = specialties.length === 1 ? specialties[0] : await mostWorkedSpecialty(userId, specialties);
  let examDate: string | null = null;
  let examDateSource: CandidateContext['examDateSource'] = null;
  if (cp?.exam_date && cp.exam_date_source === 'candidat' && cp.exam_date >= today) { examDate = cp.exam_date; examDateSource = 'candidat'; }
  else if (plannerActive && plan?.exam_date) { examDate = plan.exam_date; examDateSource = 'planificateur'; }
  else if (mainSpecialty) {
    // Import différé : le planificateur importe lui-même le moteur central.
    const { examDateForCollege } = await import('@/lib/plan/service');
    const d = await examDateForCollege(mainSpecialty);
    if (d) { examDate = d; examDateSource = 'calendrier'; }
  }
  if (mainSpecialty && mainSpecialty !== cp?.main_specialite_id) {
    await upsertCandidateProfile(userId, { main_specialite_id: mainSpecialty }).catch(() => undefined);
  }
  const activation = (profile.access_start ?? profile.created_at).slice(0, 10);
  return {
    userId, email: profile.email, role: profile.role, isActive: profile.is_active !== false, scope, voie: scope.voie ?? null,
    activationDay: activation, specialties, mainSpecialty, examDate, examDateSource, plan, plannerActive, today,
  };
}

/** Spécialité la plus travaillée sur 60 jours (signaux du moteur), à défaut la première accessible. */
async function mostWorkedSpecialty(userId: string, specialties: string[]): Promise<string | null> {
  if (specialties.length === 0) return null;
  const since = new Date(Date.now() - 60 * 86_400_000).toISOString();
  const { data } = await moteurDb().from('pedago_signals').select('item_id').eq('user_id', userId).gte('created_at', since).not('item_id', 'is', null).limit(1000);
  const { byId } = await coursCatalog();
  const counts = new Map<string, number>();
  for (const r of (data ?? []) as { item_id: string }[]) {
    const s = byId.get(r.item_id)?.specialityId;
    if (s && specialties.includes(s)) counts.set(s, (counts.get(s) ?? 0) + 1);
  }
  const best = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0];
  return best?.[0] ?? specialties[0];
}

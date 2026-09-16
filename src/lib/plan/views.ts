import 'server-only';
import { RELIABLE_CONFIDENCE } from './mastery';
import type { StudentContext } from './service';
import type { PlanSession } from './types';
import type { SessionView } from '@/components/student/plan/session-card';

/** Projection d'une séance pour les écrans candidat (jamais d'autre candidat). */
export function toSessionView(ctx: StudentContext, s: PlanSession, coursIds: Map<string, string | null>): SessionView {
  const item = s.item_id ? ctx.items.find((i) => i.id === s.item_id) ?? null : null;
  const m = s.item_id ? ctx.mastery.get(s.item_id) : undefined;
  return {
    id: s.id, day: s.day, minutes: s.minutes, kind: s.kind, status: s.status, reason: s.reason, priorityTier: s.priority_tier,
    part: s.part, parts: s.parts, itemId: s.item_id, itemName: item?.nom_item ?? 'Item du programme',
    coursId: s.item_id ? coursIds.get(s.item_id) ?? null : null,
    masteryScore: m && Number(m.confidence) > 0 ? Number(m.mastery_score) : null,
    canEvaluate: !!item,
  };
}

export function coursIdMap(ctx: StudentContext): Map<string, string | null> {
  return new Map(ctx.items.map((i) => [i.id, i.cours_id]));
}

/** Un item validé de façon fiable n'a plus besoin d'évaluation immédiate. */
export function isReliablyMastered(ctx: StudentContext, itemId: string): boolean {
  const m = ctx.mastery.get(itemId);
  return !!m && Number(m.confidence) >= RELIABLE_CONFIDENCE && Number(m.mastery_score) >= ctx.config.thresholds.maitrise;
}

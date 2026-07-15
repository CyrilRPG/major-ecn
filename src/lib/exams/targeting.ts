import type { PermissionScope } from '@/types/domain';
import { OFFER_RANK, type Offer } from '@/types/domain';
import { scopeOffers } from '@/lib/auth/permissions';

/** Sous-ensemble des colonnes de ciblage d'une épreuve. */
export type ExamTargeting = {
  min_offer?: string | null;
  target_colleges?: string[] | null;
  voies?: string[] | null;
  target_promos?: string[] | null;
  /** Ciblage nominatif : si non vide, seuls ces élèves voient l'épreuve. */
  target_user_ids?: string[] | null;
};

/**
 * Une épreuve est-elle visible pour un candidat ? Ciblage par formule (offre
 * minimale, sur l'union multi-formules), voie de concours, collège et promotion.
 * Une liste vide = pas de restriction sur ce critère.
 *
 * Cas particulier : si `target_user_ids` est non vide, l'épreuve est réservée à
 * ces élèves précis et TOUS les autres critères sont ignorés.
 */
export function isExamTargeted(
  exam: ExamTargeting,
  scope: PermissionScope,
  promotion: string | null | undefined,
  userId?: string | null,
): boolean {
  // Ciblage nominatif prioritaire : réservé à une liste d'élèves.
  const targetedUsers = exam.target_user_ids ?? [];
  if (targetedUsers.length > 0) return !!userId && targetedUsers.includes(userId);
  // Offre minimale (comparée au meilleur rang détenu)
  if (exam.min_offer) {
    const maxRank = Math.max(0, ...scopeOffers(scope).map((o) => OFFER_RANK[o as Offer] ?? 0));
    if (maxRank < (OFFER_RANK[exam.min_offer as Offer] ?? 0)) return false;
  }
  // Voie de concours
  const vs = exam.voies ?? [];
  if (vs.length > 0 && (!scope.voie || !vs.includes(scope.voie))) return false;
  // Collèges (un compte « toute l'offre » voit tout)
  const cols = exam.target_colleges ?? [];
  if (cols.length > 0 && scope.type !== 'all') {
    if (!cols.some((c) => scope.colleges.includes(c))) return false;
  }
  // Promotion
  const promos = exam.target_promos ?? [];
  if (promos.length > 0 && (!promotion || !promos.includes(promotion))) return false;
  return true;
}

import 'server-only';
import { getCurrentUserAndProfile } from '@/lib/auth/get-profile';
import { ARENA_PUBLIC_ENABLED } from '@/lib/modules-flags';
import { getTournamentBySlug, loadTournamentSnapshot, type TournamentSnapshot } from './db';
import { PUBLIC_STATUSES } from './time';
import type { TournamentRow } from './types';

/**
 * EVC Arena — visibilité d'un tournoi.
 *
 * Rien n'est accessible au public tant que le tournoi est Brouillon ou
 * Programmé (§15.1) : ni la landing, ni l'inscription, ni l'URL devinée. Le
 * personnel (admin, professeur) voit tout, à tout statut, pour la
 * prévisualisation (§15.2).
 */

export type StaffInfo = { id: string; role: string; label: string } | null;

export async function currentStaff(): Promise<StaffInfo> {
  try {
    const { user, profile } = await getCurrentUserAndProfile();
    if (!user || !profile) return null;
    if (profile.role !== 'admin' && profile.role !== 'professor') return null;
    const label = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.email || 'staff';
    return { id: user.id, role: profile.role, label };
  } catch {
    return null;
  }
}

/** Statut public ET module mis en service (mode test : personnel uniquement, cf. modules-flags.ts). */
export function isPublic(t: TournamentRow): boolean {
  return ARENA_PUBLIC_ENABLED && PUBLIC_STATUSES.has(t.status);
}

/** Statut public au sens du cycle de vie (§15.1), indépendamment du mode test. */
export function isPublicStatus(t: TournamentRow): boolean {
  return PUBLIC_STATUSES.has(t.status);
}

/** Tournoi visible pour le visiteur courant, ou null (→ 404). */
export async function visibleTournament(slug: string): Promise<{ tournament: TournamentRow; staff: StaffInfo } | null> {
  const t = await getTournamentBySlug(slug);
  if (!t) return null;
  const staff = await currentStaff();
  if (!isPublic(t) && !staff) return null;
  return { tournament: t, staff };
}

export async function visibleSnapshot(slug: string): Promise<{ snap: TournamentSnapshot; staff: StaffInfo } | null> {
  const v = await visibleTournament(slug);
  if (!v) return null;
  return { snap: await loadTournamentSnapshot(v.tournament), staff: v.staff };
}

/** Inscription possible (§2.3) : tournoi public et non terminé. */
export function registrationOpen(snap: TournamentSnapshot): boolean {
  return isPublicStatus(snap.tournament) && snap.status !== 'finished' && snap.status !== 'archived';
}

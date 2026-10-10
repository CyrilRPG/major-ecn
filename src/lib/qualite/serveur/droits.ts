import 'server-only';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/require-role';
import { requireAdminRequest } from '@/lib/auth/api-guard';
import { getCurrentUserAndProfile, type Profile } from '@/lib/auth/get-profile';
import { nomComplet } from './base';

/**
 * Droits du module « Qualité & Suivi des candidats » (§18, §25) : réservé aux
 * administrateurs de la plateforme. Les enseignants et collaborateurs n'y ont
 * pas accès — ils ne doivent pas consulter librement les réponses nominatives.
 */

export type ActeurQualite = { id: string; nom: string; profile: Profile };

export async function requireQualitePage(): Promise<ActeurQualite> {
  const { user, profile } = await requireAdmin();
  return { id: user.id, nom: nomComplet(profile as Profile & { email?: string | null }), profile: profile as Profile };
}

/** Garde de server action : lève une erreur (jamais de redirection). */
export async function requireQualiteAction(): Promise<ActeurQualite> {
  const { user, profile } = await getCurrentUserAndProfile();
  if (!user || !profile) throw new Error('Non authentifié');
  if (profile.is_active === false) throw new Error('Compte désactivé');
  if (profile.role !== 'admin') throw new Error('Module réservé aux administrateurs');
  return { id: user.id, nom: nomComplet(profile as Profile & { email?: string | null }), profile };
}

export async function requireQualiteRequest(req: Request): Promise<{ ok: true; userId: string } | { ok: false; error: NextResponse }> {
  const g = await requireAdminRequest(req);
  if (!g.ok) return g;
  return { ok: true, userId: g.auth.user.id };
}

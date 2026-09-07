import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import { requireStaff } from '@/lib/auth/require-role';
import { requireStaffRequest } from '@/lib/auth/api-guard';
import { getCurrentUserAndProfile, type Profile } from '@/lib/auth/get-profile';
import { createAdminClient } from '@/lib/supabase/admin';
import { roleCan, type SuiviCapability, type SuiviRole } from './types';

/**
 * Rôles du module (§18). L'administrateur de la plateforme a tous les droits ;
 * un professeur n'accède au module que s'il figure dans `suivi_staff_roles`.
 * Mémoïsé par requête : le layout et la page appellent tous deux ce résolveur.
 */
export const getSuiviRole = cache(async (profile: Pick<Profile, 'id' | 'role'>): Promise<SuiviRole | null> => {
  if (profile.role === 'admin') return 'admin';
  if (profile.role !== 'professor') return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any;
  const { data } = await db.from('suivi_staff_roles').select('role').eq('user_id', profile.id).maybeSingle();
  const r = (data as { role?: string } | null)?.role;
  return r === 'responsable' || r === 'intervenant' || r === 'lecture' ? r : null;
});

export type SuiviActor = { user: { id: string }; profile: Profile; role: SuiviRole };

/**
 * Garde de PAGE : redirige les comptes sans rôle (professeur hors module) vers
 * leur panneau Q&R, et un rôle insuffisant vers le tableau de bord du module.
 */
export async function requireSuiviPage(cap: SuiviCapability = 'view'): Promise<SuiviActor> {
  const { user, profile } = await requireStaff();
  const role = await getSuiviRole(profile);
  if (!role) redirect('/admin/qa');
  if (!roleCan(role, cap)) redirect('/admin/suivi');
  return { user, profile, role };
}

/**
 * Garde de SERVER ACTION : ne redirige jamais, lève une erreur que l'action
 * transforme en `{ ok: false, error }`. Toute action du module DOIT l'appeler :
 * les actions passent par le client service-role, la RLS ne les protège pas.
 */
export async function requireSuiviAction(cap: SuiviCapability): Promise<SuiviActor> {
  const { user, profile } = await getCurrentUserAndProfile();
  if (!user || !profile) throw new Error('Non authentifié');
  if (profile.is_active === false) throw new Error('Compte désactivé');
  const role = await getSuiviRole(profile);
  if (!role) throw new Error('Accès au module de suivi refusé');
  if (!roleCan(role, cap)) throw new Error('Vos droits ne permettent pas cette opération');
  return { user, profile, role };
}

/**
 * Garde de ROUTE API (exports) : staff authentifié (cookie ou Bearer frais)
 * puis rôle du module. `!guard.ok` ⇒ renvoyer `guard.error`.
 */
export async function requireSuiviRequest(req: Request, cap: SuiviCapability = 'view'): Promise<
  { ok: true; userId: string; role: SuiviRole } | { ok: false; error: NextResponse }
> {
  const guard = await requireStaffRequest(req);
  if (!guard.ok) return guard;
  const role = await getSuiviRole({ id: guard.auth.user.id, role: guard.auth.role });
  if (!role || !roleCan(role, cap)) {
    return { ok: false, error: NextResponse.json({ error: 'Accès au module de suivi refusé' }, { status: 403 }) };
  }
  return { ok: true, userId: guard.auth.user.id, role };
}

/** Un intervenant ne rédige que sur SES rendez-vous (§18). */
export function assertOwnsAppointment(actor: SuiviActor, staffUserId: string | null | undefined) {
  if (actor.role !== 'intervenant') return;
  if (staffUserId && staffUserId !== actor.profile.id) {
    throw new Error('Ce rendez-vous est attribué à un autre intervenant');
  }
}

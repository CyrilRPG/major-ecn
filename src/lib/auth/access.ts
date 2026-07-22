import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Période d'accès (sessions EVC).
 *
 * Fin d'accès effective d'un étudiant :
 *   profiles.access_end (date individuelle) sinon evc_sessions.default_access_end
 *   de sa session, sinon aucune (pas d'expiration).
 * Ne concerne QUE les étudiants — admins et professeurs n'expirent jamais.
 * Miroir SQL : public.effective_access_end() / public.access_expired().
 */

export type AccessInfo = { accessEnd: string | null; expired: boolean };

type ProfileLike = {
  role?: string | null;
  access_end?: string | null;
  evc_session?: { default_access_end: string } | null;
} | null | undefined;

export function getAccessInfo(profile: ProfileLike): AccessInfo {
  if (!profile || profile.role !== 'student') return { accessEnd: null, expired: false };
  const end = profile.access_end ?? profile.evc_session?.default_access_end ?? null;
  return { accessEnd: end, expired: !!end && new Date(end).getTime() < Date.now() };
}

/** Charge la période d'accès d'un utilisateur (routes API n'ayant que l'id). */
export async function fetchAccessInfoFor(
  supabase: SupabaseClient,
  userId: string,
): Promise<AccessInfo> {
  const { data } = await supabase
    .from('profiles')
    .select('role, access_end, evc_session:evc_sessions(default_access_end)')
    .eq('id', userId)
    .maybeSingle();
  // L'embed FK revient en objet (relation N→1) ; on tolère le format tableau.
  const raw = data as { role?: string; access_end?: string | null; evc_session?: unknown } | null;
  const session = Array.isArray(raw?.evc_session) ? raw?.evc_session[0] : raw?.evc_session;
  return getAccessInfo(raw ? { ...raw, evc_session: session as { default_access_end: string } | null } : null);
}

/**
 * Garde de route API : 403 { code: 'ACCESS_EXPIRED' } si l'accès de l'étudiant
 * est expiré, null sinon. À appeler juste après l'authentification.
 */
export async function assertAccessActive(
  supabase: SupabaseClient,
  userId: string,
): Promise<NextResponse | null> {
  const { expired, accessEnd } = await fetchAccessInfoFor(supabase, userId);
  if (!expired) return null;
  return NextResponse.json(
    { code: 'ACCESS_EXPIRED', error: 'Votre accès a expiré.', access_end: accessEnd },
    { status: 403 },
  );
}

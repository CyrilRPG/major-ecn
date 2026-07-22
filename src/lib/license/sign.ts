import 'server-only';
import { createPrivateKey, sign as cryptoSign } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { parseScope, scopeOffers, type ContentAccess } from '@/lib/auth/permissions';
import { fetchContentAccessForScopeWith } from '@/lib/auth/formula-permissions';
import type { Offer, Voie } from '@/types/domain';

/**
 * Licence hors ligne signée (Ed25519) — le contrat de sécurité de l'app mobile.
 *
 * Le serveur signe { droits, fin d'accès, heure serveur, échéance de pointage } ;
 * l'app vérifie la signature avec la clé publique embarquée et applique les
 * règles hors ligne (blocage à expiration, re-pointage obligatoire tous les
 * GRACE_DAYS jours, détection de recul d'horloge).
 *
 * Env requises (générées par scripts/generate-license-keys.ts) :
 *   LICENSE_PRIVATE_KEY — PKCS8 DER en base64 (Ed25519)
 *   LICENSE_KEY_ID      — identifiant de clé (kid), ex. '2026-07'
 */

/** Fenêtre de re-pointage en ligne (jours). Au-delà, l'app exige une connexion. */
export const LICENSE_GRACE_DAYS = 10;

export type LicenseEntitlements = {
  offers: Offer[];
  type: 'all' | 'college';
  colleges: string[];
  cours: string[] | null;
  voie: Voie | null;
  content: ContentAccess;
};

export type LicensePayload = {
  v: 1;
  kid: string;
  user_id: string;
  device_id: string;
  entitlements: LicenseEntitlements;
  /** Fin d'accès effective (ISO) — null = pas d'expiration. */
  access_end: string | null;
  /** Heure serveur faisant foi (ancre anti-recul d'horloge côté app). */
  issued_at: string;
  /** issued_at + GRACE_DAYS : au-delà, l'app exige une revalidation en ligne. */
  checkin_deadline: string;
};

function b64url(buf: Buffer): string {
  return buf.toString('base64url');
}

export function licenseKeysConfigured(): boolean {
  return !!process.env.LICENSE_PRIVATE_KEY;
}

/** Signe le payload → 'base64url(json).base64url(signature)'. null si clés absentes. */
export function signLicense(payload: LicensePayload): string | null {
  const privB64 = process.env.LICENSE_PRIVATE_KEY;
  if (!privB64) return null;
  const key = createPrivateKey({ key: Buffer.from(privB64, 'base64'), format: 'der', type: 'pkcs8' });
  const body = Buffer.from(JSON.stringify(payload), 'utf8');
  // Ed25519 : l'algorithme de hash est intrinsèque → null.
  const sig = cryptoSign(null, body, key);
  return `${b64url(body)}.${b64url(sig)}`;
}

/**
 * Construit et signe la licence d'un utilisateur/appareil.
 * `client` : client admin (service-role) — la licence est émise par des routes
 * qui ont déjà authentifié l'utilisateur et vérifié le créneau appareil.
 * Renvoie null si les clés de signature ne sont pas configurées.
 */
export async function buildLicense(
  client: SupabaseClient,
  userId: string,
  deviceId: string,
): Promise<{ license: string | null; accessEnd: string | null; expired: boolean }> {
  const { data: profile } = await client
    .from('profiles')
    .select('role, permission_scope, access_end, evc_session_id, evc_session:evc_sessions(default_access_end)')
    .eq('id', userId)
    .maybeSingle();

  const raw = profile as {
    role?: string;
    permission_scope?: unknown;
    access_end?: string | null;
    evc_session?: { default_access_end: string } | { default_access_end: string }[] | null;
  } | null;
  const session = Array.isArray(raw?.evc_session) ? raw?.evc_session[0] : raw?.evc_session;
  const accessEnd = raw?.role === 'student'
    ? raw?.access_end ?? session?.default_access_end ?? null
    : null;
  const expired = !!accessEnd && new Date(accessEnd).getTime() < Date.now();

  const scope = parseScope(raw?.permission_scope);
  const content = await fetchContentAccessForScopeWith(client, scope);

  const now = new Date();
  const payload: LicensePayload = {
    v: 1,
    kid: process.env.LICENSE_KEY_ID ?? 'default',
    user_id: userId,
    device_id: deviceId,
    entitlements: {
      offers: Array.from(new Set(scopeOffers(scope))),
      type: scope.type,
      colleges: scope.type === 'college' ? scope.colleges : [],
      cours: scope.type === 'college' && scope.cours && scope.cours.length > 0 ? scope.cours : null,
      voie: scope.voie ?? null,
      content,
    },
    access_end: accessEnd,
    issued_at: now.toISOString(),
    checkin_deadline: new Date(now.getTime() + LICENSE_GRACE_DAYS * 86_400_000).toISOString(),
  };

  return { license: signLicense(payload), accessEnd, expired };
}

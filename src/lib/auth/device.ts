import 'server-only';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Session unique (« un compte = un appareil ») — même créneau que le web :
 * `profiles.active_session_id` contient l'UUID du SEUL appareil autorisé.
 * L'app mobile envoie le sien dans le header `X-Device-Id` ; un mismatch
 * signifie qu'un autre appareil (ou le web) s'est connecté depuis.
 *
 * Contrat côté app : sur 401 { code: 'DEVICE_REVOKED' } → déconnexion locale
 * + effacement du cache hors ligne + retour à l'écran de connexion.
 */

export const DEVICE_HEADER = 'x-device-id';

export type DeviceCheck =
  | { ok: true }
  | { ok: false; response: NextResponse };

export async function assertDeviceSlot(userId: string, deviceId: string | null | undefined): Promise<DeviceCheck> {
  if (!deviceId) {
    return {
      ok: false,
      response: NextResponse.json({ code: 'DEVICE_MISSING', error: 'Header X-Device-Id requis' }, { status: 400 }),
    };
  }

  const admin = createAdminClient();
  const { data: profile, error } = await admin
    .from('profiles')
    .select('active_session_id, is_active')
    .eq('id', userId)
    .maybeSingle();

  // Fail-open sur erreur infra (comme le middleware web) pour ne pas verrouiller
  // les étudiants sur un incident passager.
  if (error) return { ok: true };

  // Compte désactivé : code DEVICE_REVOKED, le seul que les versions déjà
  // installées de l'app savent traiter (purge du hors ligne + déconnexion).
  // Avec `ACCOUNT_DISABLED`, l'app avalait l'erreur et restait utilisable,
  // cours téléchargés compris. `reason` permet aux nouvelles versions
  // d'afficher le bon message.
  if (profile?.is_active === false) {
    return {
      ok: false,
      response: NextResponse.json(
        { code: 'DEVICE_REVOKED', reason: 'ACCOUNT_DISABLED', error: 'Ce compte a été désactivé.' },
        { status: 401 },
      ),
    };
  }
  if (!profile || profile.active_session_id !== deviceId) {
    return {
      ok: false,
      response: NextResponse.json(
        { code: 'DEVICE_REVOKED', error: 'Votre compte a été connecté sur un autre appareil.' },
        { status: 401 },
      ),
    };
  }

  // Trace de vie de l'appareil (best-effort, non bloquant).
  void admin.from('devices').update({ last_seen_at: new Date().toISOString() }).eq('id', deviceId)
    .then(() => undefined, () => undefined);

  return { ok: true };
}

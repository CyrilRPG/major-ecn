'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe';
import {
  createPromoCode as createInStripe,
  setPromoCodeActive,
  type PromoCodeInput,
} from '@/lib/stripe/promo-codes';

/** Vérifie que l'appelant est admin. Les codes vivent dans Stripe : aucun
 *  client service-role n'est nécessaire, seulement la garantie du rôle. */
async function requireAdminUser(): Promise<{ id: string; email: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');
  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (me?.role !== 'admin') throw new Error('Réservé aux administrateurs');
  return { id: user.id, email: user.email ?? '' };
}

export async function createPromoCodeAction(
  input: PromoCodeInput,
): Promise<{ ok: boolean; error?: string; code?: string; alsoCovered?: string[] }> {
  try {
    const admin = await requireAdminUser();
    const result = await createInStripe(getStripe(), input, admin.email || admin.id);
    if (!result.ok) {
      // `alsoCovered` : le périmètre déborderait des offres choisies. L'UI
      // demande confirmation et rejoue avec `confirmBroaderScope`.
      return {
        ok: false,
        error: result.error,
        ...('alsoCovered' in result ? { alsoCovered: result.alsoCovered } : {}),
      };
    }
    revalidatePath('/admin/codes-promo');
    return { ok: true, code: result.code };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Erreur' };
  }
}

export async function togglePromoCodeAction(
  id: string,
  active: boolean,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdminUser();
    const result = await setPromoCodeActive(getStripe(), id, active);
    if (!result.ok) return { ok: false, error: result.error };
    revalidatePath('/admin/codes-promo');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Erreur' };
  }
}

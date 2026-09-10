'use server';

import { headers } from 'next/headers';
import { arenaDb } from '@/lib/arena/db';
import { normalizeEmail } from '@/lib/arena/types';

/**
 * Encart « Autres spécialités à venir » de l'accueil EVC Arena : l'adresse est
 * conservée avec l'horodatage du consentement (case cochée obligatoire).
 * Idempotent : une adresse déjà connue est simplement confirmée.
 */
export async function subscribeArenaNews(input: { email: string; consent: boolean; source?: string }): Promise<{ ok: true } | { ok: false; error: string }> {
  const email = normalizeEmail(String(input?.email ?? ''));
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 200) return { ok: false, error: 'Adresse e-mail invalide.' };
  if (!input.consent) return { ok: false, error: 'Cochez la case pour recevoir les informations sur les prochains tournois.' };
  const h = await headers();
  const source = String(input.source ?? h.get('referer') ?? 'arena').slice(0, 120);
  const { error } = await arenaDb()
    .from('arena_news_leads')
    .upsert({ faculte_id: 'major-ecn', email, consent_at: new Date().toISOString(), source }, { onConflict: 'faculte_id,email' });
  if (error) {
    console.error('[arena] inscription aux nouvelles impossible', error);
    return { ok: false, error: 'Enregistrement impossible pour le moment. Réessayez dans un instant.' };
  }
  return { ok: true };
}

'use client';

import type { Destination, Postit, PreferencesPostit, Tache } from '@/lib/postits/regles';
import type { TacheAgenda } from '@/lib/postits/agenda';

/**
 * Appels de l'interface « Mes Post-it » vers /api/postits (cookie de session,
 * même origine). Les erreurs remontent sous forme d'`Error` au message lisible.
 */

async function lire<T>(res: Response): Promise<T> {
  const json = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) {
    throw new Error(res.status === 401 ? 'Votre session a expiré : rechargez la page.' : json.error ?? 'Opération impossible.');
  }
  return json;
}

export async function chargerEmplacement(cle: string, postitId?: string | null, signal?: AbortSignal) {
  const q = new URLSearchParams({ emplacement: cle });
  if (postitId) q.set('postit', postitId);
  return lire<{ postits: Postit[]; cible: Postit | null; contexte: { coursTitre: string | null; matiereNom: string | null } | null }>(
    await fetch(`/api/postits?${q}`, { cache: 'no-store', signal }),
  );
}

export async function chargerBibliotheque() {
  return lire<{ postits: Postit[]; preferences: PreferencesPostit }>(await fetch('/api/postits?vue=bibliotheque', { cache: 'no-store' }));
}

export async function chargerPostitsCours(coursId: string) {
  return lire<{ postits: Postit[] }>(await fetch(`/api/postits?cours=${encodeURIComponent(coursId)}`, { cache: 'no-store' }));
}

export async function chargerDestinations() {
  return lire<{ specialites: Destination[] }>(await fetch('/api/postits/destinations'));
}

export type ReponseAction = { postit?: Postit; tache?: Tache; preferences?: PreferencesPostit; ok?: boolean };

export async function actionPostit(corps: Record<string, unknown> & { action: string }): Promise<ReponseAction> {
  return lire<ReponseAction>(await fetch('/api/postits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corps),
  }));
}

export type { TacheAgenda };

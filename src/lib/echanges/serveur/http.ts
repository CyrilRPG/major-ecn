import 'server-only';
import { NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';
import type { ErreurEchanges } from '../types';
import { accesGroupe, chargerActeur, compteOuvert, REFUS, type AccesGroupe, type Acteur } from './acces';
import { journaliser } from './base';

/**
 * Socle des routes /api/echanges/* — web (cookie) ET application mobile
 * (Bearer + X-Device-Id, verrou « un compte = un appareil »). Toute route
 * commence par `authentifier` puis, pour un groupe, `groupeOuRefus`.
 */

const SANS_CACHE = { 'Cache-Control': 'private, no-store' };

export function ok<T>(corps: T, status = 200) {
  return NextResponse.json(corps, { status, headers: SANS_CACHE });
}

export function erreur(e: ErreurEchanges | string, status?: number) {
  const corps = typeof e === 'string' ? { error: e } : e;
  const s = status ?? (corps.code === 'DROITS' ? 403 : corps.code === 'INTROUVABLE' ? 404 : corps.code === 'QUOTA' ? 429 : corps.code === 'BLOQUE' ? 422 : 400);
  return NextResponse.json(corps, { status: s, headers: SANS_CACHE });
}

export async function authentifier(req: Request): Promise<{ acteur: Acteur } | { reponse: NextResponse }> {
  const a = await getRequestUser(req);
  if (!a) return { reponse: NextResponse.json({ error: 'Non authentifié' }, { status: 401, headers: SANS_CACHE }) };
  // Application : verrou « un compte = un appareil ». Le site, lui, envoie un
  // Bearer frais quand le cookie a expiré (page de conversation restée
  // ouverte) : une requête du navigateur sur le même site n'a pas d'appareil.
  const web = req.headers.get('sec-fetch-site') === 'same-origin' && !req.headers.get(DEVICE_HEADER);
  if (a.via === 'bearer' && !web) {
    const check = await assertDeviceSlot(a.user.id, req.headers.get(DEVICE_HEADER));
    if (!check.ok) return { reponse: check.response };
  }
  const acteur = await chargerActeur(a.user.id);
  if (!acteur) return { reponse: NextResponse.json({ error: 'Compte introuvable' }, { status: 403, headers: SANS_CACHE }) };
  if (!compteOuvert(acteur)) return { reponse: NextResponse.json({ error: 'Accès fermé', code: 'ACCESS_EXPIRED' }, { status: 403, headers: SANS_CACHE }) };
  return { acteur };
}

export async function groupeOuRefus(acteur: Acteur, groupeId: string, opts: { lecture?: boolean } = {}): Promise<{ acces: AccesGroupe } | { reponse: NextResponse }> {
  const acces = await accesGroupe(acteur, groupeId);
  if (!acces) {
    await journaliser('info', 'permission', 'Accès refusé à un groupe', { acteur: acteur.id, groupe: groupeId.slice(0, 40) });
    return { reponse: erreur(REFUS, 404) };
  }
  if (opts.lecture !== false && !acces.droits.lire) return { reponse: erreur({ error: acces.droits.motif ?? REFUS.error, code: 'DROITS' }, 403) };
  return { acces };
}

export async function lireJson<T = Record<string, unknown>>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    return {} as T;
  }
}

/** Enveloppe d'erreur inattendue : journalisée, message neutre (§142). */
export async function garde(nom: string, f: () => Promise<NextResponse>): Promise<NextResponse> {
  try {
    return await f();
  } catch (e) {
    await journaliser('erreur', 'publication', `Erreur serveur : ${nom}`, { erreur: String(e).slice(0, 500) });
    return NextResponse.json({ error: 'Une erreur est survenue. Réessayez dans un instant.' }, { status: 500, headers: SANS_CACHE });
  }
}

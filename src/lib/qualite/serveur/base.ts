import 'server-only';
import { cache } from 'react';
import { createAdminClient } from '@/lib/supabase/admin';
import { normaliserParametres, type Parametres } from '../parametres';

/**
 * Accès base du module Qualité (service-role : aucune policy RLS sur les
 * tables `qualite_*`). Toute action d'administration DOIT passer par une garde
 * (`requireQualiteAction`) avant d'appeler ces fonctions.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Db = any;

export function qdb(): Db {
  return createAdminClient() as Db;
}

export type EntreeJournal = {
  objet_type: string;
  objet_id?: string | null;
  action: string;
  user_id?: string | null;
  auteur_id?: string | null;
  auteur_nom?: string | null;
  details?: Record<string, unknown>;
};

/** Journal de traçabilité (append-only). Jamais bloquant pour l'appelant. */
export async function journaliser(entrees: EntreeJournal | EntreeJournal[]): Promise<void> {
  const lignes = (Array.isArray(entrees) ? entrees : [entrees]).map((e) => ({
    objet_type: e.objet_type,
    objet_id: e.objet_id ?? null,
    action: e.action,
    user_id: e.user_id ?? null,
    auteur_id: e.auteur_id ?? null,
    auteur_nom: e.auteur_nom ?? (e.auteur_id ? null : 'Traitement automatique'),
    details: e.details ?? {},
  }));
  if (!lignes.length) return;
  for (let i = 0; i < lignes.length; i += 500) {
    const { error } = await qdb().from('qualite_journal').insert(lignes.slice(i, i + 500));
    if (error) console.error('[qualite] journal :', error.message);
  }
}

/** Paramètres en vigueur (une ligne absente = valeurs du code). Mémoïsé par requête. */
export const chargerParametres = cache(async (): Promise<Parametres> => {
  const { data, error } = await qdb().from('qualite_parametres').select('config').eq('id', 1).maybeSingle();
  if (error) console.error('[qualite] paramètres :', error.message);
  return normaliserParametres((data as { config?: unknown } | null)?.config ?? {});
});

/** Lecture non mémoïsée (balayage, après écriture). */
export async function lireParametres(): Promise<Parametres> {
  const { data } = await qdb().from('qualite_parametres').select('config').eq('id', 1).maybeSingle();
  return normaliserParametres((data as { config?: unknown } | null)?.config ?? {});
}

/** Lit toutes les lignes d'une requête paginée (PostgREST tronque à 1 000). */
export async function toutesLesLignes<T>(construire: (from: number, to: number) => PromiseLike<{ data: unknown; error: { message: string } | null }>): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await construire(from, from + 999);
    if (error) throw new Error(error.message);
    const rows = (data ?? []) as T[];
    out.push(...rows);
    if (rows.length < 1000) break;
  }
  return out;
}

/** Découpe une liste d'identifiants pour les filtres `in` (URL PostgREST bornée). */
export function tranches<T>(liste: T[], taille = 150): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < liste.length; i += taille) out.push(liste.slice(i, i + taille));
  return out;
}

export function nomComplet(p: { first_name?: string | null; last_name?: string | null; email?: string | null } | null | undefined): string {
  if (!p) return 'Candidat supprimé';
  const n = `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim();
  return n || p.email || 'Candidat';
}

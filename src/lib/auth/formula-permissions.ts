import { cache } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { CONTENT_ACCESS_LABELS, getContentAccess, mergeAccess, scopeOffers, type ContentAccess } from './permissions';
import type { Offer, PermissionScope } from '@/types/domain';

type Row = {
  fiche: boolean;
  fiche_express: boolean;
  video: boolean;
  qcm: boolean;
  entrainement: boolean;
  seance_prof: boolean;
  flashcards: boolean;
  interrogation: boolean;
  seance_approfondie: boolean;
  notes: boolean;
  parcours_major: boolean;
};

function rowToAccess(row: Row): ContentAccess {
  return {
    fiche: row.fiche,
    ficheExpress: row.fiche_express,
    video: row.video,
    qcm: row.qcm,
    entrainement: row.entrainement,
    seanceProf: row.seance_prof,
    flashcards: row.flashcards,
    interrogation: row.interrogation,
    seanceApprofondie: row.seance_approfondie,
    notes: row.notes,
    parcoursMajor: row.parcours_major,
  };
}

export function applyContentOverrides(base: ContentAccess, overrides: Record<string, boolean>): ContentAccess {
  const result = { ...base };
  for (const [key, value] of Object.entries(overrides)) {
    if (key in result) {
      (result as Record<string, boolean>)[key] = value;
    }
  }
  return result;
}

/**
 * Variante à client injecté — utilisable hors contexte React (routes /api/mobile,
 * émission de licence avec le client service-role, etc.). Pas de mémoïsation.
 */
export async function fetchContentAccessWith(client: SupabaseClient, offer: Offer): Promise<ContentAccess> {
  if (offer === 'decouverte') return getContentAccess(offer);
  try {
    const { data } = await client
      .from('formula_permissions')
      .select('fiche, fiche_express, video, qcm, entrainement, seance_prof, flashcards, interrogation, seance_approfondie, notes, parcours_major')
      .eq('offer', offer)
      .maybeSingle();
    if (data) return rowToAccess(data as unknown as Row);
  } catch {
    // fallback to hardcoded
  }
  return getContentAccess(offer);
}

/** Union multi-formules avec client injeté (miroir de fetchContentAccessForScope). */
export async function fetchContentAccessForScopeWith(
  client: SupabaseClient,
  scope: PermissionScope,
): Promise<ContentAccess> {
  const offers = Array.from(new Set(scopeOffers(scope)));
  if (offers.length === 0) return getContentAccess('decouverte');
  const list = await Promise.all(offers.map((o) => fetchContentAccessWith(client, o)));
  const base = list.reduce(mergeAccess);
  if (!scope.content_overrides) return base;
  return applyContentOverrides(base, scope.content_overrides);
}

/**
 * Mémoïsé par requête (React `cache`), keyé par `offer` : appelé depuis ~18
 * endroits (layout + page + sous-pages d'un cours) qui interrogeaient tous
 * `formula_permissions`. Le cache réduit à un seul accès DB par offre/requête.
 */
export const fetchContentAccess = cache(async (offer: Offer): Promise<ContentAccess> => {
  const supabase = await createClient();
  return fetchContentAccessWith(supabase, offer);
});

/**
 * Accès combiné (UNION) de plusieurs formules détenues. Un élève « approfondi +
 * essentiel » cumule les contenus des deux. Chaque offre est résolue via
 * `fetchContentAccess` (config DB `formula_permissions`) puis OR-mergée.
 */
export const fetchContentAccessMulti = cache(async (offersKey: string): Promise<ContentAccess> => {
  const offers = offersKey.split(',').filter(Boolean) as Offer[];
  if (offers.length === 0) return getContentAccess('decouverte');
  const list = await Promise.all(offers.map((o) => fetchContentAccess(o)));
  return list.reduce(mergeAccess);
});

/** Accès (union) pour un scope, tenant compte du multi-formules (`offers`)
 *  et des éventuelles surcharges individuelles (`content_overrides`). */
export async function fetchContentAccessForScope(scope: PermissionScope): Promise<ContentAccess> {
  // Clé de cache stable : liste triée et dédoublonnée.
  const key = Array.from(new Set(scopeOffers(scope))).sort().join(',');
  const base = await fetchContentAccessMulti(key);
  if (!scope.content_overrides) return base;
  return applyContentOverrides(base, scope.content_overrides);
}

/** Libellés des formules (offres) — alignés sur la page Config Permissions. */
export const OFFER_LABELS: Record<Offer, string> = {
  decouverte: 'Espace Découverte',
  essentiel: 'Formule Essentielle',
  intensif: 'Formule Intensive',
  approfondi: 'Programme Approfondi',
};

/** Réexport de commodité : la constante vit dans `permissions.ts` (client-safe). */
export { CONTENT_ACCESS_LABELS } from './permissions';

/** Liste des contenus débloqués par une formule (d'après la config). */
export function unlockedLabels(access: ContentAccess): string[] {
  return CONTENT_ACCESS_LABELS.filter(({ key }) => access[key]).map(({ label }) => label);
}

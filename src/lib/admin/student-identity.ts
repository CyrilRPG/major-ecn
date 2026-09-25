import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { identityFromProfile, type StudentIdentity } from './student-identity-pure';

/**
 * Chargeur service-role des identités d'élèves pour l'espace staff. Le type,
 * la construction et le FILTRE par lecteur (`identitePourLecteur` : l'e-mail
 * est réservé aux administrateurs) vivent dans `student-identity-pure.ts`,
 * importable côté client.
 */
export {
  ELEVE_SANS_NOM, identityContext, identityFromProfile, identitePourLecteur,
} from './student-identity-pure';
export type { LecteurIdentite, StudentIdentity } from './student-identity-pure';

/**
 * `permission_scope` brut d'un lot d'élèves (par tranches de 200) : sert à
 * router une question HORS COURS vers les enseignants de la spécialité de
 * l'élève (`questionDansPerimetre(scope, null, scopeEleve)`).
 */
export async function loadStudentScopes(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: SupabaseClient<any, any, any>,
  ids: Iterable<string | null | undefined>,
): Promise<Map<string, unknown>> {
  const uniques = [...new Set([...ids].filter((id): id is string => !!id))];
  const out = new Map<string, unknown>();
  for (let i = 0; i < uniques.length; i += 200) {
    const { data } = await admin.from('profiles').select('id, permission_scope').in('id', uniques.slice(i, i + 200));
    for (const p of (data ?? []) as { id: string; permission_scope: unknown }[]) out.set(p.id, p.permission_scope);
  }
  return out;
}

/** Identités d'un lot d'élèves, lues en service-role par tranches (PostgREST
 *  plafonne à 1 000 lignes et une liste `in` trop longue fait échouer la
 *  requête). Identités COMPLÈTES : passer par `identitePourLecteur` avant de
 *  les transmettre à un collaborateur. */
export async function loadStudentIdentities(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: SupabaseClient<any, any, any>,
  ids: Iterable<string | null | undefined>,
): Promise<Map<string, StudentIdentity>> {
  const uniques = [...new Set([...ids].filter((id): id is string => !!id))];
  const out = new Map<string, StudentIdentity>();
  for (let i = 0; i < uniques.length; i += 200) {
    const { data } = await admin
      .from('profiles')
      .select('id, first_name, last_name, email, permission_scope')
      .in('id', uniques.slice(i, i + 200));
    for (const p of (data ?? []) as Parameters<typeof identityFromProfile>[0][]) {
      out.set(p.id, identityFromProfile(p));
    }
  }
  return out;
}

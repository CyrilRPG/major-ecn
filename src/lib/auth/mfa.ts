import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { lireScopeEquipe } from './collaborateurs';

/**
 * Double authentification (2FA) du personnel — cahier des charges 18/09/2026, §8.
 *
 * Mise en œuvre par les facteurs TOTP de Supabase Auth : le membre du
 * personnel enrôle une application d'authentification depuis « Sécurité »,
 * puis chaque session doit être ÉLEVÉE (AAL2) par un code avant d'atteindre
 * l'administration. Deux exigences distinctes :
 *  - `verifier` : un facteur est enrôlé mais la session courante n'a pas
 *    encore été vérifiée → page de saisie du code ;
 *  - `activer`  : l'administrateur a rendu la 2FA OBLIGATOIRE pour ce compte
 *    (scope `mfa_obligatoire`) et aucun facteur n'est enrôlé → page
 *    d'activation, sans autre issue.
 */
export type ExigenceMfa = 'verifier' | 'activer' | null;

export type EtatMfa = {
  facteurs: { id: string; nom: string | null; cree: string }[];
  /** Niveau courant de la session (aal1 = mot de passe seul, aal2 = code vérifié). */
  niveau: 'aal1' | 'aal2' | null;
  obligatoire: boolean;
};

export async function etatMfa(profile: { role?: string | null; permission_scope?: unknown }): Promise<EtatMfa> {
  const supabase = await createClient();
  const obligatoire = profile.role === 'professor'
    ? !!lireScopeEquipe(profile.permission_scope)?.mfa_obligatoire
    : false;
  try {
    const [{ data: facteurs }, { data: aal }] = await Promise.all([
      supabase.auth.mfa.listFactors(),
      supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
    ]);
    const verifies = (facteurs?.totp ?? []).filter((f) => f.status === 'verified');
    return {
      facteurs: verifies.map((f) => ({ id: f.id, nom: f.friendly_name ?? null, cree: f.created_at })),
      niveau: (aal?.currentLevel as 'aal1' | 'aal2' | null) ?? null,
      obligatoire,
    };
  } catch {
    // Auth injoignable : on ne bloque pas l'administration sur une panne du
    // service MFA — la page Sécurité affichera l'état indisponible.
    return { facteurs: [], niveau: null, obligatoire };
  }
}

/**
 * Ce que la session doit faire avant d'entrer dans l'administration.
 * Les pages de Sécurité elles-mêmes sont exemptées (sinon boucle).
 */
export async function exigenceMfa(
  profile: { role?: string | null; permission_scope?: unknown },
  pathname: string,
): Promise<ExigenceMfa> {
  if (pathname.startsWith('/admin/securite')) return null;
  const etat = await etatMfa(profile);
  if (etat.facteurs.length > 0 && etat.niveau === 'aal1') return 'verifier';
  if (etat.obligatoire && etat.facteurs.length === 0) return 'activer';
  return null;
}

import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { OFFER_LABEL, type Offer } from '@/types/domain';

/**
 * Identité d'un élève telle que l'équipe doit la voir à côté d'une question :
 * le pseudo automatique (« ibo-X-mnv ») ne permet ni de savoir qui écrit, ni
 * de lui répondre par mail. Données sérialisables, destinées aux composants
 * client de l'espace staff.
 */
export type StudentIdentity = {
  id: string;
  /** « Prénom NOM », ou l'adresse e-mail si le profil n'a pas de nom. */
  name: string;
  email: string | null;
  specialty: string | null;
  /** 'interne' | 'externe' | null */
  voie: string | null;
  /** Libellé de la formule (« Formule Intensive »). */
  offer: string | null;
  /** Page de suivi individuel de l'élève dans l'espace admin. */
  href: string;
};

type RawScope = {
  offer?: string;
  paid_specialty?: string | null;
  paid_voie?: string | null;
  voie?: string | null;
} | null;

function isOffer(value: string | undefined): value is Offer {
  return value === 'decouverte' || value === 'essentiel' || value === 'intensif' || value === 'approfondi';
}

export function identityFromProfile(p: {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  permission_scope: unknown;
}): StudentIdentity {
  const scope = (p.permission_scope ?? null) as RawScope;
  const name = [p.first_name, p.last_name].map((s) => (s ?? '').trim()).filter(Boolean).join(' ');
  const offer = scope?.offer;
  return {
    id: p.id,
    name: name || p.email || 'Élève',
    email: p.email,
    specialty: scope?.paid_specialty?.trim() || null,
    voie: scope?.paid_voie ?? scope?.voie ?? null,
    offer: isOffer(offer) ? OFFER_LABEL[offer] : offer ?? null,
    href: `/admin/suivi/candidats/${p.id}`,
  };
}

/** Identités d'un lot d'élèves, lues en service-role par tranches (PostgREST
 *  plafonne à 1 000 lignes et une liste `in` trop longue fait échouer la
 *  requête). */
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

/** Ligne de contexte pour un e-mail ou un journal : « Gériatrie · voie interne · Formule Intensive ». */
export function identityContext(s: Pick<StudentIdentity, 'specialty' | 'voie' | 'offer'>): string {
  return [s.specialty, s.voie ? `voie ${s.voie}` : null, s.offer].filter(Boolean).join(' · ');
}

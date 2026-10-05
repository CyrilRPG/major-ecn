import 'server-only';
import { cache } from 'react';
import { createAdminClient } from '@/lib/supabase/admin';
import { loadStudentScopes } from '@/lib/admin/student-identity';
import { scopeEquipeResolu } from '@/lib/auth/onglets-equipe';
import {
  questionDansPortee, specialitesReferent,
  type CollegeDeItem, type ContexteRoutage, type ParentDe, type ScopeEquipe,
} from '@/lib/auth/collaborateurs';

/**
 * Routage des questions d'élèves — côté serveur. Les règles vivent dans
 * `collaborateurs.ts` (module pur : `specialitesReferent`,
 * `questionDansPortee`, `recoitQuestionEleve`) ; ce module lit en base ce
 * qu'elles demandent : la hiérarchie des collèges (sous-collège → parent) et
 * le collège des items des professeurs à restriction `cours[]`. Le mail
 * « Nouvelle question », la page Questions / Réponses, le forum côté équipe et
 * les gardes des actions passent tous par ici.
 */

type ProfilEquipe = { id: string; role?: string | null; permission_scope?: unknown };

/** Sous-collège → collège parent (médecine générale, imagerie…), lu une fois par requête. */
export const parentDesColleges = cache(async (): Promise<ParentDe> => {
  const { data, error } = await createAdminClient()
    .from('matieres').select('id, parent_matiere_id').not('parent_matiere_id', 'is', null);
  if (error) throw new Error(error.message);
  return Object.fromEntries(((data ?? []) as { id: string; parent_matiere_id: string }[]).map((m) => [m.id, m.parent_matiere_id]));
});

/** Collège de chaque item, par tranches : une longue liste in() dépasse la taille d'URL admise. */
export async function collegesDesItems(ids: Iterable<string>): Promise<CollegeDeItem> {
  const uniques = [...new Set(ids)];
  const out: Record<string, string> = {};
  for (let i = 0; i < uniques.length; i += 150) {
    const { data, error } = await createAdminClient()
      .from('cours').select('id, matiere_id').in('id', uniques.slice(i, i + 150));
    if (error) throw new Error(error.message);
    for (const c of (data ?? []) as { id: string; matiere_id: string }[]) out[c.id] = c.matiere_id;
  }
  return out;
}

/** Contexte de routage d'un lot de collaborateurs : hiérarchie des collèges + collèges de leurs items. */
export async function contexteRoutage(scopes: Iterable<ScopeEquipe | null>): Promise<Required<ContexteRoutage>> {
  const items = [...scopes].flatMap((s) => s?.cours ?? []);
  const [parentDe, collegeDeItem] = await Promise.all([parentDesColleges(), collegesDesItems(items)]);
  return { parentDe, collegeDeItem };
}

export type PorteeQuestions = {
  /** `'toutes'` (administrateur, référent de toutes les spécialités) ou les collèges dont la personne est référente. */
  specialites: 'toutes' | string[];
  parentDe: ParentDe;
};

/** Portée des questions d'un membre connecté : tout pour l'administrateur, ses spécialités de référent sinon. */
export async function porteeQuestions(profile: ProfilEquipe): Promise<PorteeQuestions> {
  if (profile.role === 'admin') return { specialites: 'toutes', parentDe: await parentDesColleges() };
  const scope = await scopeEquipeResolu(profile);
  const { parentDe, collegeDeItem } = await contexteRoutage([scope]);
  return { specialites: specialitesReferent(scope, collegeDeItem), parentDe };
}

/**
 * Garde les questions de la portée : une question avec collège passe si ce
 * collège est couvert, une question hors collège suit la spécialité de
 * l'élève (profils lus par tranches, seulement pour celles-ci).
 */
export async function questionsDansPortee<T>(
  portee: PorteeQuestions,
  rows: T[],
  cle: (r: T) => { matiereId: string | null; eleveId: string | null },
): Promise<T[]> {
  if (portee.specialites === 'toutes') return rows;
  if (portee.specialites.length === 0) return [];
  const sansCollege = rows.map(cle).filter((k) => !k.matiereId).map((k) => k.eleveId);
  const scopes = sansCollege.length > 0 ? await loadStudentScopes(createAdminClient(), sansCollege) : new Map<string, unknown>();
  return rows.filter((r) => {
    const { matiereId, eleveId } = cle(r);
    return questionDansPortee(portee.specialites, matiereId, eleveId ? scopes.get(eleveId) : undefined, portee.parentDe);
  });
}

/** Une question précise relève-t-elle de ce membre du personnel ? Gardes des actions (répondre, publier, archiver…). */
export async function questionPourMembre(
  profile: ProfilEquipe,
  q: { matiere_id: string | null; student_id?: string | null },
): Promise<boolean> {
  const portee = await porteeQuestions(profile);
  const gardees = await questionsDansPortee(portee, [q], (x) => ({ matiereId: x.matiere_id, eleveId: x.student_id ?? null }));
  return gardees.length === 1;
}

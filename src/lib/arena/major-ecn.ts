import 'server-only';
import { arenaDb } from './db';
import { getAccessInfo } from '@/lib/auth/access';
import { parseScope } from '@/lib/auth/permissions';
import type { MajorEcnStatus, ParticipantRow } from './types';
import type { PasserelleAudience } from './passerelle';
import { normalizeEmail } from './types';

/**
 * EVC Arena — statut Major ECN d'un participant (cahier des charges
 * complémentaire §12, §15, §19) : élève déjà inscrit ou prospect.
 *
 * Un participant Arena n'a pas de compte Auth ; la reconnaissance passe par
 * son adresse e-mail, rapprochée des profils Major ECN. « Élève » = profil
 * étudiant de Major ECN, formule payante (l'Espace Découverte gratuit reste
 * un prospect) et accès non expiré. L'administration peut forcer le statut
 * par participant (`arena_participants.major_ecn_status`).
 *
 * Lecture en service role, par tranches : PostgREST plafonne à 1 000 lignes
 * et une liste `in` trop longue fait échouer la requête.
 */

type ProfileRow = {
  email: string | null;
  role: string | null;
  faculte_id: string | null;
  permission_scope: unknown;
  access_end: string | null;
  evc_session: { default_access_end: string } | { default_access_end: string }[] | null;
};

function isActiveStudent(p: ProfileRow): boolean {
  if (p.role !== 'student') return false;
  if (p.faculte_id && p.faculte_id !== 'major-ecn') return false;
  if (parseScope(p.permission_scope).offer === 'decouverte') return false;
  const session = Array.isArray(p.evc_session) ? p.evc_session[0] ?? null : p.evc_session;
  return !getAccessInfo({ role: p.role, access_end: p.access_end, evc_session: session }).expired;
}

/** Adresses (normalisées) qui correspondent à un élève Major ECN actif. */
export async function majorEcnStudentEmails(emails: Iterable<string>): Promise<Set<string>> {
  const wanted = [...new Set([...emails].map(normalizeEmail).filter((e) => e && !e.endsWith('@anonymise.invalid')))];
  const found = new Set<string>();
  for (let from = 0; from < wanted.length; from += 100) {
    const slice = wanted.slice(from, from + 100);
    // Les profils peuvent porter l'adresse avec sa casse d'origine : `ilike`
    // n'accepte pas de liste, on filtre en minuscules côté application après
    // une requête `in` sur les deux formes les plus probables.
    const variants = [...new Set(slice.flatMap((e) => [e, e.toUpperCase(), e.charAt(0).toUpperCase() + e.slice(1)]))];
    const { data, error } = await arenaDb()
      .from('profiles')
      .select('email, role, faculte_id, permission_scope, access_end, evc_session:evc_sessions(default_access_end)')
      .in('email', variants);
    if (error) {
      console.error('[arena] statut Major ECN', error);
      continue;
    }
    for (const p of (data ?? []) as ProfileRow[]) {
      if (p.email && isActiveStudent(p)) found.add(normalizeEmail(p.email));
    }
  }
  return found;
}

/** Statut effectif : forçage administratif, sinon détection par l'adresse. */
export function resolveAudience(override: MajorEcnStatus | null | undefined, detected: boolean): PasserelleAudience {
  if (override === 'student') return 'student';
  if (override === 'prospect') return 'prospect';
  return detected ? 'student' : 'prospect';
}

export async function participantAudience(p: Pick<ParticipantRow, 'email' | 'major_ecn_status'>): Promise<PasserelleAudience> {
  const override = p.major_ecn_status ?? 'auto';
  if (override !== 'auto') return resolveAudience(override, false);
  const students = await majorEcnStudentEmails([p.email]);
  return resolveAudience(override, students.has(normalizeEmail(p.email)));
}

import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { parseScope, scopeOffers } from '@/lib/auth/permissions';
import { getProfessorScope } from '@/lib/auth/prof-content-access';
import { canRead } from '@/lib/schemas/professor';
import { GERIATRIE_COLLEGE_ID, MG_COLLEGE_ID } from '@/lib/auth/geriatrie-mg-bonus';
import type { QcmAccessContext } from './qcm-access-rules';

// Les règles elles-mêmes vivent dans `qcm-access-rules.ts` (pures, testées) ;
// ce module y ajoute la seule partie qui a besoin de la base : le contexte de
// l'élève courant. Voir l'en-tête de `qcm-access-rules.ts` pour l'incident RLS
// 42P17 du 2026-08-11 et le détail des policies rejouées.
export {
  SERIE_ACCESS_COLUMNS,
  canStudentReadSerie,
  type SerieAccessRow,
  type QcmAccessContext,
} from './qcm-access-rules';

type ProfileLike = { role?: string | null; permission_scope?: unknown };

/**
 * Contexte d'accès de l'élève courant pour un item donné.
 * `matiereId` = collège de l'item (déjà lu par les pages appelantes).
 */
export async function buildQcmAccessContext(
  profile: ProfileLike,
  matiereId: string | null | undefined,
): Promise<QcmAccessContext> {
  const isStaff = profile.role === 'admin' || profile.role === 'professor';
  const scope = parseScope(profile.permission_scope);
  // Professeur : ses propres droits de lecture par sous-type. L'admin (scope
  // non professeur) n'est jamais restreint.
  const profScope = profile.role === 'professor' ? getProfessorScope(profile.permission_scope) : null;
  const ctx: QcmAccessContext = {
    isStaff,
    ...(profScope
      ? {
          staffKinds: {
            qcm: canRead(profScope, 'qcm'),
            dp: canRead(profScope, 'dp'),
            qroc: canRead(profScope, 'qroc'),
          },
        }
      : {}),
    voie: scope.voie ?? null,
    offers: new Set<string>(scopeOffers(scope)),
    geriatrieMgBonus: false,
  };
  if (isStaff || !matiereId) return ctx;

  // `current_is_geriatrie()` regarde `permission_scope->'colleges'` quel que
  // soit le type de portée : on lit la valeur brute pour rester identique.
  const rawColleges = (profile.permission_scope as { colleges?: unknown } | null)?.colleges;
  const colleges = Array.isArray(rawColleges) ? rawColleges : [];
  if (!colleges.includes(GERIATRIE_COLLEGE_ID)) return ctx;

  // Le blocage ne vise que les items rattachés à Médecine générale (collège
  // parent ou l'un de ses sous-collèges), comme la policy SQL.
  if (matiereId === MG_COLLEGE_ID) {
    ctx.geriatrieMgBonus = true;
    return ctx;
  }
  const { data: matiere } = await createAdminClient()
    .from('matieres')
    .select('id, parent_matiere_id')
    .eq('id', matiereId)
    .maybeSingle();
  ctx.geriatrieMgBonus = matiere?.parent_matiere_id === MG_COLLEGE_ID;
  return ctx;
}

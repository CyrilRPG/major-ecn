import 'server-only';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { ensureFresh } from '@/lib/plan/engine';
import { migrateLegacyProfile } from '@/lib/plan/operations';
import { plannerEnv, type PlannerEnv } from '@/lib/plan/pages';

/**
 * Contexte d'une page « Mon planning » : profil migré vers la V4.1 si besoin,
 * planning remis à jour (journée changée, recalcul demandé par le moteur
 * central), sinon premier lancement.
 */
export async function pageEnv(): Promise<PlannerEnv> {
  const { user } = await requireUser();
  await migrateLegacyProfile(user.id).catch((e) => console.error('[plan] migration V4.1 :', e instanceof Error ? e.message : e));
  await ensureFresh(user.id);
  const env = await plannerEnv(user.id);
  if (!env) redirect('/planificateur/onboarding');
  return env;
}

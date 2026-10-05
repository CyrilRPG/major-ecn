import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { priseEnMain, type Ouverts, type PriseEnMain } from './prise-en-main-core';

/**
 * Faits de la carte « Bien démarrer » (lib/student/prise-en-main-core), lus en
 * base en parallèle — une ligne au plus par requête. `null` : carte masquée
 * par l'élève, ou prise en main terminée.
 */
export async function chargerPriseEnMain(
  userId: string,
  opts: { tutorielVu: boolean; ouverts: Ouverts },
): Promise<PriseEnMain | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- tables hors types générés
  const db = createAdminClient() as any;
  const une = (q: PromiseLike<{ data: unknown[] | null; error: unknown }>) =>
    Promise.resolve(q).then((r) => !r.error && (r.data?.length ?? 0) > 0).catch(() => false);

  const [reperes, checkup, planning, ciblee, transversale] = await Promise.all([
    Promise.resolve(db.from('student_guide_marks').select('cle').eq('user_id', userId).in('cle', ['vu:priorites', 'bien-demarrer:masque']))
      .then((r: { data: { cle: string }[] | null }) => new Set((r.data ?? []).map((x) => x.cle)))
      .catch(() => new Set<string>()),
    opts.ouverts.checkup
      ? une(db.from('checkup_sessions').select('id').eq('user_id', userId).in('status', ['completed', 'expired', 'pending_self_review']).limit(1))
      : Promise.resolve(false),
    opts.ouverts.planning
      ? une(db.from('plan_profiles').select('user_id').eq('user_id', userId).eq('onboarding_done', true).limit(1))
      : Promise.resolve(false),
    opts.ouverts.moteur
      ? une(db.from('qcm_attempts').select('id').eq('user_id', userId).eq('origin', 'revision_ciblee').limit(1))
      : Promise.resolve(false),
    une(db.from('transversal_sessions').select('id').eq('user_id', userId).not('completed_at', 'is', null).limit(1)),
  ]);

  if (reperes.has('bien-demarrer:masque')) return null;
  const p = priseEnMain(
    { tutoriel: opts.tutorielVu, checkup, priorites: reperes.has('vu:priorites'), planning, ciblee, transversale },
    opts.ouverts,
  );
  return p.terminee ? null : p;
}

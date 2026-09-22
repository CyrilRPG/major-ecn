import { NextResponse } from 'next/server';
import { getBearerUser } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';
import { createAdminClient } from '@/lib/supabase/admin';
import { interrogationEnAttente } from '@/lib/pedago/interrogation';
import { isUserTargeted, type SatisfactionForm } from '@/lib/schemas/satisfaction';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/mobile/gates — verrous du parcours élève, calculés SERVEUR.
 *
 * Le layout étudiant du web (`(student)/layout.tsx`) impose deux redirections
 * qu'une SPA Capacitor n'a aucun moyen de reproduire seule :
 *  - un formulaire de satisfaction OBLIGATOIRE non répondu ;
 *  - l'INTERROGATION obligatoire d'un cours terminé dont le certificat n'a pas
 *    encore été signé.
 *
 * Sans cette route, un élève travaillant uniquement sur mobile passait à côté
 * des deux : il ne voyait jamais les formulaires obligatoires et n'était jamais
 * conduit à son interrogation de fin de parcours.
 *
 * Le formulaire obligatoire est recopié du layout web. L'interrogation est
 * choisie par le MÊME helper que le layout (`interrogationEnAttente`), qui rejoue
 * les contrôles de la page et de l'écran de l'app (`/api/mobile/interrogation`) :
 * un cours retenu ici s'ouvre toujours là-bas, avec des questions.
 */
export async function GET(req: Request) {
  const auth = await getBearerUser(req);
  if (!auth) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const check = await assertDeviceSlot(auth.user.id, req.headers.get(DEVICE_HEADER));
  if (!check.ok) return check.response;

  const userId = auth.user.id;
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;

  const { data: profile } = await db
    .from('profiles').select('role, promotion, permission_scope').eq('id', userId).maybeSingle();

  // Les verrous ne visent que les ÉLÈVES : un professeur ou un administrateur
  // qui parcourt l'espace élève ne doit jamais être bloqué (boucle au login).
  if (profile?.role !== 'student') {
    return NextResponse.json({ mandatory_form_id: null, pending_interrogation_cours_id: null });
  }

  const [{ data: forms }, { data: responses }] = await Promise.all([
    db.from('satisfaction_forms')
      .select('id, mandatory, target_promo, target_offer, target_college')
      .eq('active', true)
      .order('created_at', { ascending: false }),
    db.from('satisfaction_responses').select('form_id').eq('user_id', userId),
  ]);
  const repondus = new Set(((responses ?? []) as { form_id: string }[]).map((r) => r.form_id));
  type FormLite = Pick<SatisfactionForm, 'target_promo' | 'target_offer' | 'target_college'> & { id: string; mandatory: boolean };
  const mandatoryForm = ((forms ?? []) as FormLite[])
    .filter((f) => !repondus.has(f.id) && f.mandatory)
    .find((f) => isUserTargeted(f, {
      promotion: profile?.promotion ?? null,
      permission_scope: profile?.permission_scope ?? null,
    })) ?? null;

  // ── Interrogation obligatoire ──
  // Le helper du layout web, avec le client de l'ÉLÈVE (RLS) : c'est celui de
  // la page et de l'écran d'interrogation de l'app. En service-role, le verrou
  // compterait des réponses et des séries que la RLS masque à l'élève, et le
  // conduirait sur un écran qu'il ne peut pas terminer.
  const pendingInterrogation = await interrogationEnAttente(auth.supabase, {
    id: userId,
    role: profile.role,
    permission_scope: profile.permission_scope,
  });

  return NextResponse.json({
    mandatory_form_id: mandatoryForm?.id ?? null,
    pending_interrogation_cours_id: pendingInterrogation,
  });
}

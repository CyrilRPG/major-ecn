import { NextResponse } from 'next/server';
import { getBearerUser } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';
import { createAdminClient } from '@/lib/supabase/admin';
import { interrogationEnAttente } from '@/lib/pedago/interrogation';
import { isUserTargeted, type SatisfactionForm } from '@/lib/schemas/satisfaction';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Jours sans révision transversale au-delà desquels les NOUVEAUX contenus se ferment (section 15). */
const JOURS_REVISION_TRANSVERSALE = 14;

/**
 * GET /api/mobile/gates — verrous du parcours élève, calculés SERVEUR : le
 * pendant des redirections et bandeaux du layout étudiant web
 * (`(student)/layout.tsx`).
 *
 * Réponse :
 *  - `mandatory_form_id`  : formulaire de satisfaction OBLIGATOIRE non répondu ;
 *  - `optional_form`      : premier formulaire FACULTATIF en attente (bandeau
 *    non bloquant, `SatisfactionBanner` du web) ;
 *  - `pending_interrogation_cours_id` : interrogation obligatoire d'un cours
 *    terminé dont le certificat n'est pas signé (`interrogationEnAttente`, le
 *    helper du layout) ;
 *  - `revision_transversale` : `{ en_retard, jours }` — plus de 14 jours sans
 *    révision transversale pour un élève qui en a déjà fait une ; l'app ferme
 *    alors les cours jamais ouverts et les spécialités jamais commencées ;
 *  - `profil_incomplet` : prénom, nom ou téléphone manquant (popup obligatoire
 *    `ProfileCompletionGate`), avec les valeurs connues pour pré-remplir.
 *
 * Les verrous ne visent que les ÉLÈVES : un professeur ou un administrateur
 * n'est jamais bloqué.
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
    .from('profiles').select('role, promotion, permission_scope, first_name, last_name, phone').eq('id', userId).maybeSingle();

  if (profile?.role !== 'student') {
    return NextResponse.json({
      mandatory_form_id: null,
      optional_form: null,
      pending_interrogation_cours_id: null,
      revision_transversale: { en_retard: false, jours: null },
      profil_incomplet: null,
    });
  }

  const [{ data: forms }, { data: responses }, { data: stats }] = await Promise.all([
    db.from('satisfaction_forms')
      .select('id, title, mandatory, target_promo, target_offer, target_college')
      .eq('active', true)
      .order('created_at', { ascending: false }),
    db.from('satisfaction_responses').select('form_id').eq('user_id', userId),
    db.from('user_revision_stats').select('last_transversal_revision_date').eq('user_id', userId).maybeSingle(),
  ]);
  const repondus = new Set(((responses ?? []) as { form_id: string }[]).map((r) => r.form_id));
  type FormLite = Pick<SatisfactionForm, 'target_promo' | 'target_offer' | 'target_college'> & { id: string; title: string; mandatory: boolean };
  const pending = ((forms ?? []) as FormLite[])
    .filter((f) => !repondus.has(f.id))
    .filter((f) => isUserTargeted(f, {
      promotion: profile?.promotion ?? null,
      permission_scope: profile?.permission_scope ?? null,
    }));
  const mandatoryForm = pending.find((f) => f.mandatory) ?? null;
  const optionalForm = pending.find((f) => !f.mandatory) ?? null;

  // ── Section 15 : 14 jours sans révision transversale ──
  // Même calcul que le layout web (jours entiers depuis la dernière révision).
  const derniere = (stats as { last_transversal_revision_date?: string | null } | null)?.last_transversal_revision_date ?? null;
  const jours = derniere ? Math.floor((Date.now() - new Date(derniere).getTime()) / 86_400_000) : null;

  // ── Interrogation obligatoire ──
  // Le helper du layout web, avec le client de l'ÉLÈVE (RLS) : c'est celui de
  // la page et de l'écran d'interrogation de l'app.
  const pendingInterrogation = await interrogationEnAttente(auth.supabase, {
    id: userId,
    role: profile.role,
    permission_scope: profile.permission_scope,
  });

  const vide = (v: unknown) => typeof v !== 'string' || v.trim() === '';
  const incomplet = vide(profile.first_name) || vide(profile.last_name) || vide(profile.phone);

  return NextResponse.json({
    mandatory_form_id: mandatoryForm?.id ?? null,
    optional_form: optionalForm ? { id: optionalForm.id, title: optionalForm.title } : null,
    pending_interrogation_cours_id: pendingInterrogation,
    revision_transversale: { en_retard: jours !== null && jours >= JOURS_REVISION_TRANSVERSALE, jours },
    profil_incomplet: incomplet
      ? { first_name: profile.first_name ?? null, last_name: profile.last_name ?? null, phone: profile.phone ?? null }
      : null,
  });
}

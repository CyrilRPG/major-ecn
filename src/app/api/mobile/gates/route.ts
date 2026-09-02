import { NextResponse } from 'next/server';
import { getBearerUser } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';
import { createAdminClient } from '@/lib/supabase/admin';
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
 * La logique est recopiée du layout web, y compris le contournement Pneumologie.
 */
const PNEUMO_COURS_ID = '33579977-020e-4c94-a561-dee9d3c7bc70';

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
  const [{ data: progressRows }, { data: completionsRows }] = await Promise.all([
    db.from('course_progress')
      .select('cours_id, video_watched, fiche_read')
      .eq('user_id', userId).eq('video_watched', true).eq('fiche_read', true),
    db.from('parcours_completions').select('cours_id, certificate_signed_at').eq('user_id', userId),
  ]);
  const signes = new Set(
    ((completionsRows ?? []) as { cours_id: string; certificate_signed_at: string | null }[])
      .filter((r) => !!r.certificate_signed_at)
      .map((r) => r.cours_id),
  );
  const candidats = new Set<string>(
    ((progressRows ?? []) as { cours_id: string }[])
      .map((r) => r.cours_id)
      .filter((id) => !signes.has(id)),
  );
  // Contournement Pneumologie : on ne force le passage QUE si l'élève a au
  // moins une trace d'activité sur cet item (pas dès la première connexion).
  const activitePneumo = ((progressRows ?? []) as { cours_id: string }[])
    .some((r) => r.cours_id === PNEUMO_COURS_ID);
  if (activitePneumo && !signes.has(PNEUMO_COURS_ID)) candidats.add(PNEUMO_COURS_ID);

  let pendingInterrogation: string | null = null;
  if (candidats.size > 0) {
    const ids = [...candidats];
    const [{ data: atts }, { data: revs }] = await Promise.all([
      db.from('qcm_attempts')
        .select('id, qcm_questions!inner(qcm_series!inner(cours_id))')
        .eq('user_id', userId).in('qcm_questions.qcm_series.cours_id', ids),
      db.from('flashcard_reviews')
        .select('id, flashcards!inner(cours_id)')
        .eq('user_id', userId).in('flashcards.cours_id', ids),
    ]);
    const avecQcm = new Set(
      ((atts ?? []) as unknown as { qcm_questions: { qcm_series: { cours_id: string } } }[])
        .map((a) => a.qcm_questions.qcm_series.cours_id),
    );
    const avecRevisions = new Set(
      ((revs ?? []) as unknown as { flashcards: { cours_id: string } }[])
        .map((r) => r.flashcards.cours_id),
    );
    for (const id of ids) {
      const bypassPneumo = id === PNEUMO_COURS_ID && activitePneumo;
      if (bypassPneumo || (avecQcm.has(id) && avecRevisions.has(id))) {
        pendingInterrogation = id;
        break;
      }
    }
  }

  return NextResponse.json({
    mandatory_form_id: mandatoryForm?.id ?? null,
    pending_interrogation_cours_id: pendingInterrogation,
  });
}

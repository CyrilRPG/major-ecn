import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getBearerUser } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkAlertsAfterTransversalSession } from '@/lib/pedago/alerts';
import { TABLE_REPRISE } from '@/lib/pedago/reprise-transversale';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/mobile/revisions — pendant mobile de la server action
 * `recordTransversalSession` (`(student)/revisions-transversales/session/actions.ts`).
 *
 * L'app insérait la session elle-même, sous RLS : la chaîne d'alertes admin
 * (réévaluation ou bilan rouge → Priorité 1 + e-mail, orange → Priorité 2,
 * révisions ratées en série → Priorité 2) ne se déclenchait JAMAIS depuis le
 * téléphone, `matiere_scores` restait vide et `specialty_scores` était indexé
 * par matière au lieu de l'être par cours comme sur le web.
 *
 * Mêmes effets que la server action :
 *  - la session est insérée dans `transversal_sessions` (les compteurs de
 *    maintien des acquis suivent par trigger) ;
 *  - la ligne de reprise entre appareils (`transversal_progress`) du même type
 *    est effacée ;
 *  - la chaîne d'alertes est déroulée (best-effort, jamais bloquante).
 *
 * IDEMPOTENCE. L'app met l'envoi en file quand elle est hors ligne et le
 * rejoue au retour du réseau : un rejeu (réponse perdue, double tentative)
 * ne doit ni dupliquer la session ni relancer les alertes. Une session est
 * identifiée par (élève, type, started_at) ; si elle existe déjà, la route
 * répond `{ ok: true, duplicate: true }` sans rien refaire.
 *
 * L'identité vient du Bearer, jamais du corps. Les professeurs n'ont pas
 * accès aux révisions transversales (layout web) : refusés ici aussi.
 */
const Ratio = z.number().min(0).max(1);
const Cle = z.string().min(1).max(120);

const BodySchema = z.object({
  kind: z.enum(['daily', 'recommended', 'intensive', 'reevaluation', 'reevaluation_deep', 'bilan_global']),
  qcm_count: z.number().int().min(1).max(500), // une session vide n'est pas une révision (28/09/2026)
  score_correct: z.number().int().min(0).max(500),
  /** Ratio correct/total par cours_id (clé historique du web). */
  specialty_scores: z.record(Cle, Ratio).default({}),
  /** Ratio correct/total par matiere_id (spécialité). */
  matiere_scores: z.record(Cle, Ratio).default({}),
  /** Nom des spécialités, par matiere_id (lignes des e-mails d'alerte). */
  matiere_names: z.record(Cle, z.string().max(200)).default({}),
  /** Début de la session (ISO) : sert aussi de clé d'idempotence. */
  started_at: z.string().datetime({ offset: true }),
}).refine((b) => b.score_correct <= b.qcm_count, { message: 'Score supérieur au nombre de questions' });

export async function POST(req: Request) {
  const auth = await getBearerUser(req);
  if (!auth) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const deviceId = req.headers.get(DEVICE_HEADER);
  const check = await assertDeviceSlot(auth.user.id, deviceId);
  if (!check.ok) return check.response;

  const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Données invalides' }, { status: 400 });
  }
  const body = parsed.data;
  const userId = auth.user.id;
  const admin = createAdminClient();
  // Tables hors des types générés : client non typé ciblé.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;

  const { data: profil } = await db.from('profiles').select('role').eq('id', userId).maybeSingle();
  if ((profil as { role?: string } | null)?.role === 'professor') {
    return NextResponse.json({ error: 'Révisions transversales réservées aux élèves' }, { status: 403 });
  }

  // Rejeu d'un envoi déjà appliqué : rien à refaire (ni insertion, ni alertes).
  const { data: existante } = await db
    .from('transversal_sessions')
    .select('id')
    .eq('user_id', userId)
    .eq('kind', body.kind)
    .eq('started_at', new Date(body.started_at).toISOString())
    .limit(1);
  if ((existante ?? []).length > 0) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const { error } = await db.from('transversal_sessions').insert({
    user_id: userId,
    started_at: body.started_at,
    completed_at: new Date().toISOString(),
    qcm_count: body.qcm_count,
    score_correct: body.score_correct,
    kind: body.kind,
    specialty_scores: body.specialty_scores,
    matiere_scores: body.matiere_scores,
  });
  if (error) {
    // Envoi concurrent de la même session (deux essais de la file) : l'index
    // unique (user_id, kind, started_at) garde le premier — rejeu, sans
    // relancer les alertes.
    if (error.code === '23505') return NextResponse.json({ ok: true, duplicate: true });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Session achevée : plus rien à reprendre sur un autre appareil.
  await db.from(TABLE_REPRISE).delete().eq('user_id', userId).eq('kind', body.kind);

  // Chaîne d'alertes — mêmes calculs que la server action.
  try {
    const pct = body.qcm_count > 0 ? Math.round((body.score_correct / body.qcm_count) * 100) : 0;
    const weakMatieres = Object.entries(body.matiere_scores)
      .map(([matiereId, ratio]) => ({
        matiereId,
        nom: body.matiere_names[matiereId] ?? matiereId,
        pct: Math.round(ratio * 100),
      }))
      .filter((w) => w.pct < 75)
      .sort((a, b) => a.pct - b.pct);
    await checkAlertsAfterTransversalSession(userId, { kind: body.kind, pct, weakMatieres }, admin as never);
  } catch (err) {
    console.error('[mobile/revisions] chaîne d\'alertes en échec', err);
  }

  return NextResponse.json({ ok: true });
}

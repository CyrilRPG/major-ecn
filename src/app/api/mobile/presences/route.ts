import { titreFeuille } from '@/lib/emargement';
import { NextResponse } from 'next/server';
import { getBearerUser } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  construireFeuilles,
  type LigneAttendance,
  type LigneCompletion,
  type LignePresence,
} from '@/lib/agenda/feuilles-emargement';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/mobile/presences — toutes les feuilles d'émargement de l'élève
 * (vidéos de cours, séances approfondies, interrogations signées, sessions
 * Zoom), assemblées comme la page web « Mes présences ».
 *
 * POURQUOI UNE ROUTE. La page web lit ces trois tables en service-role filtré
 * sur l'élève (mêmes lectures que la vue admin) pour ne dépendre ni de la RLS
 * ni des jointures `cours(...)` ; l'app ne lisait que `session_presences` et
 * affichait « Aucune présence » à un élève qui avait signé des dizaines de
 * feuilles vidéo. Réponse : { feuilles } triées de la plus récente à la plus
 * ancienne (cf. lib/agenda/feuilles-emargement, copie partagée dans l'app).
 */
export async function GET(req: Request) {
  const auth = await getBearerUser(req);
  if (!auth) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const check = await assertDeviceSlot(auth.user.id, req.headers.get(DEVICE_HEADER));
  if (!check.ok) return check.response;
  const userId = auth.user.id;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any;
  const [a, p, m, c] = await Promise.all([
    db.from('course_attendances')
      .select('id, cours_id, cours_titre, video_titre, matiere_id, kind, required_at, signed_at, signature_png')
      .eq('user_id', userId),
    db.from('session_presences')
      .select('id, event_title, event_date, start_time, end_time, college, intervenant, marked_at, signature_png')
      .eq('user_id', userId),
    db.from('matieres').select('id, nom'),
    db.from('parcours_completions')
      .select('cours_id, certificate_signed_at, signature_data_url, qcm_test_score, qcm_test_total, cours(titre, matiere_id)')
      .eq('user_id', userId).not('certificate_signed_at', 'is', null),
  ]);
  const erreur = [a, p, m, c].find((r) => r.error)?.error;
  if (erreur) {
    console.error('[mobile/presences] lecture impossible :', erreur);
    return NextResponse.json({ error: 'Présences indisponibles pour le moment.' }, { status: 503 });
  }

  const feuilles = construireFeuilles({
    // Feuille par séance : la séance s'ajoute au titre de l'item.
    attendances: ((a.data ?? []) as (LigneAttendance & { video_titre: string | null })[])
      .map((r) => ({ ...r, cours_titre: titreFeuille(r.cours_titre, r.video_titre) })),
    completions: (c.data ?? []) as LigneCompletion[],
    presences: (p.data ?? []) as LignePresence[],
    matieres: (m.data ?? []) as { id: string; nom: string }[],
  });
  return NextResponse.json({ feuilles }, { headers: { 'Cache-Control': 'private, no-store' } });
}

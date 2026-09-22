import { NextResponse } from 'next/server';
import { getBearerUser } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';
import { createAdminClient } from '@/lib/supabase/admin';
import { parseScope, canAccessCollege, canAccessCours } from '@/lib/auth/permissions';
import { EDN_FACULTE_ID } from '@/lib/data/faculte';
import { chargerProgressionCours } from '@/lib/progress/course-progress-data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/mobile/progression — LA progression de l'élève, calculée SERVEUR.
 *
 * POURQUOI UNE ROUTE. La formule commune (questions accessibles faites 85 % +
 * couverture fiche / flashcards / vidéo 15 %, cf. `lib/progress`) a besoin du
 * catalogue complet des séries de la faculté et des règles d'accès par voie et
 * par formule. Côté web, `chargerProgressionCours` s'appuie sur le client
 * service-role et le cache Next ; une SPA Capacitor ne peut ni l'un ni l'autre.
 * Sans cette route, l'app affichait sa PROPRE définition de la progression
 * (« cours commencés / cours accessibles ») : deux chiffres différents pour le
 * même élève selon qu'il ouvrait son téléphone ou son navigateur.
 *
 * Réponse : la progression par item (0-100) et ses composantes, plus les
 * totaux globaux servant aux compteurs de l'accueil.
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
    .from('profiles').select('role, permission_scope').eq('id', userId).maybeSingle();
  const scope = parseScope(profile?.permission_scope);
  const staff = profile?.role === 'admin' || profile?.role === 'professor';

  // Périmètre EDN accessible à cet élève (mêmes clés de permission que le web).
  const [{ data: matieresRaw }, { data: coursRaw }, { data: progressRaw }] = await Promise.all([
    db.from('matieres')
      .select('id, access_type, semestres!inner(faculte_id)')
      .eq('semestres.faculte_id', EDN_FACULTE_ID),
    db.from('cours').select('id, matiere_id, access_type'),
    db.from('course_progress')
      .select('cours_id, video_watched, fiche_read')
      .eq('user_id', userId),
  ]);

  type MatRow = { id: string; access_type: 'all' | 'specific' };
  type CoursRow = { id: string; matiere_id: string; access_type: 'all' | 'specific' };
  const matieresOk = new Set(
    ((matieresRaw ?? []) as MatRow[])
      .filter((m) => staff || canAccessCollege(scope, m.id, m.access_type))
      .map((m) => m.id),
  );
  const coursAccessibles = ((coursRaw ?? []) as CoursRow[])
    .filter((c) => matieresOk.has(c.matiere_id))
    .filter((c) => staff || canAccessCours(scope, c.matiere_id, c.id, c.access_type));

  const progressParCours = new Map(
    ((progressRaw ?? []) as { cours_id: string; video_watched: boolean | null; fiche_read: boolean | null }[])
      .map((p) => [p.cours_id, p]),
  );

  const progression = await chargerProgressionCours({
    userId,
    faculteId: EDN_FACULTE_ID,
    scope,
    staff,
    cours: coursAccessibles.map((c) => {
      const cp = progressParCours.get(c.id);
      return {
        id: c.id,
        course_progress: cp ? [{ video_watched: cp.video_watched, fiche_read: cp.fiche_read }] : [],
      };
    }),
  });

  let questionsAccessibles = 0;
  let questionsFaites = 0;
  const cours: Record<string, {
    pct: number; questionsAccessibles: number; questionsFaites: number;
    ficheLue: boolean; flashcardsFaites: boolean; videoVue: boolean; aVideo: boolean;
  }> = {};
  for (const [coursId, p] of progression) {
    questionsAccessibles += p.input.questionsAccessibles;
    questionsFaites += p.input.questionsFaites;
    cours[coursId] = {
      pct: p.progression,
      questionsAccessibles: p.input.questionsAccessibles,
      questionsFaites: p.input.questionsFaites,
      ficheLue: p.input.ficheLue,
      flashcardsFaites: p.input.flashcardsFaites,
      videoVue: p.input.videoVue,
      aVideo: p.input.aVideo,
    };
  }

  return NextResponse.json({
    cours,
    global: {
      questionsAccessibles,
      questionsFaites,
      // Progression globale du web : questions distinctes faites / accessibles.
      pct: questionsAccessibles > 0 ? Math.round((questionsFaites / questionsAccessibles) * 100) : 0,
      coursAccessibles: coursAccessibles.length,
      itemsMaitrises: Object.values(cours).filter((c) => c.pct >= 75).length,
    },
  });
}

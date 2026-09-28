import { NextResponse } from 'next/server';
import { getBearerUser } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';
import { createAdminClient } from '@/lib/supabase/admin';
import { parseScope, canAccessCollege, canAccessCours } from '@/lib/auth/permissions';
import { EDN_FACULTE_ID } from '@/lib/data/faculte';
import { chargerProgressionCours } from '@/lib/progress/course-progress-data';
import { fetchAllRows } from '@/lib/supabase/fetch-all';

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
  // Seul l'administrateur voit tout (parité web : `staff: isAdmin`). Un
  // professeur garde sa formule et son périmètre de collèges / d'items.
  const isAdmin = profile?.role === 'admin';

  type MatRow = { id: string; access_type: 'all' | 'specific' };
  type CoursRow = { id: string; matiere_id: string; access_type: 'all' | 'specific' };
  type ProgressRow = { cours_id: string; video_watched: boolean | null; fiche_read: boolean | null };

  // Périmètre EDN accessible (mêmes clés de permission que le web). Lectures
  // INTÉGRALES : la faculté compte plus de 1 000 items et PostgREST tronque en
  // silence au-delà — les derniers collèges disparaissaient de la progression.
  const [matieresRaw, coursRaw, progressRaw] = await Promise.all([
    fetchAllRows<MatRow>((from, to) => db.from('matieres')
      .select('id, access_type, semestres!inner(faculte_id)')
      .eq('semestres.faculte_id', EDN_FACULTE_ID)
      .order('id')
      .range(from, to)),
    fetchAllRows<CoursRow>((from, to) => db.from('cours')
      .select('id, matiere_id, access_type')
      .order('id')
      .range(from, to)),
    fetchAllRows<ProgressRow>((from, to) => db.from('course_progress')
      .select('cours_id, video_watched, fiche_read')
      .eq('user_id', userId)
      .order('cours_id')
      .range(from, to)),
  ]);

  const matieresOk = new Set(
    matieresRaw
      .filter((m) => isAdmin || canAccessCollege(scope, m.id, m.access_type))
      .map((m) => m.id),
  );
  const coursAccessibles = coursRaw
    .filter((c) => matieresOk.has(c.matiere_id))
    .filter((c) => isAdmin || canAccessCours(scope, c.matiere_id, c.id, c.access_type));

  const progressParCours = new Map(progressRaw.map((p) => [p.cours_id, p]));

  const progression = await chargerProgressionCours({
    userId,
    faculteId: EDN_FACULTE_ID,
    scope,
    staff: isAdmin,
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

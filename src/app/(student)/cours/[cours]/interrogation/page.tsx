import { notFound, redirect } from 'next/navigation';
import { requireUser, profPageReadGuard } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  interrogationsComposees,
  ouverturesInterrogation,
  questionsDuTirage,
  redirectionDuRefus,
  viviersInterrogation,
} from '@/lib/pedago/interrogation';
import { InterrogationSession } from './interrogation-session';
import { InterrogationExamFlow } from './interrogation-exam-flow';

export default async function InterrogationPage({ params }: { params: Promise<{ cours: string }> }) {
  const { cours: coursId } = await params;
  const { user, profile } = await requireUser();
  const supabase = await createClient();

  // Cours lisible, accès (collège, item, formule), parcours terminé — vidéo,
  // fiche, ≥ 1 QCM, ≥ 1 flashcard, sauf contournement Pneumologie. Le verrou de
  // fin de parcours (layout, /api/mobile/gates) rejoue CES contrôles par la
  // même fonction : un cours refusé ici n'y retient jamais l'élève, sinon cette
  // redirection et celle du layout se le renverraient à l'infini.
  const ouverture = (await ouverturesInterrogation(
    supabase,
    { id: user.id, role: profile.role, permission_scope: profile.permission_scope },
    [coursId],
  )).get(coursId) ?? { ok: false as const, refus: 'introuvable' as const };
  if (!ouverture.ok) {
    const cible = redirectionDuRefus(ouverture);
    if (!cible) notFound();
    redirect(cible);
  }
  profPageReadGuard(profile, 'qcm', `/cours/${coursId}`);
  const c = ouverture.cours;

  // Si déjà signé, on saute directement vers le certificat.
  const { data: completion } = await (supabase as unknown as {
    from: (t: string) => {
      select: (s: string) => {
        eq: (k: string, v: string) => {
          eq: (k: string, v: string) => { maybeSingle: () => Promise<{ data: { qcm_test_score: number | null; qcm_test_total: number | null; certificate_signed_at: string | null } | null }> };
        };
      };
    };
  }).from('parcours_completions')
    .select('qcm_test_score, qcm_test_total, certificate_signed_at')
    .eq('user_id', user.id).eq('cours_id', coursId).maybeSingle();

  // ── Interrogation configurée par l'admin (moteur d'épreuve) ──
  // Si l'item a une interrogation avec des questions, elle prime sur le tirage
  // automatique de 15 QCM. Elle est rendue ICI (même URL) : aucune redirection,
  // donc aucun conflit avec le verrou de fin de parcours du layout, qui la lit
  // par le même helper (lib/pedago/interrogation).
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ad = admin as any;
  const interro = (await interrogationsComposees([coursId])).get(coursId);

  if (interro) {
    const { data: iqs } = await ad
      .from('mock_exam_questions')
      .select('id, order_index, format, enonce, vignette, images, points, items, reponse_attendue, correction_generale, college_id')
      .eq('exam_id', interro.id).order('order_index');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const iQuestions = (iqs ?? []) as any[];
    if (iQuestions.length > 0) {
      const { data: sub } = await ad
        .from('mock_exam_submissions').select('*')
        .eq('exam_id', interro.id).eq('user_id', user.id)
        .in('status', ['submitted', 'graded'])
        .order('submitted_at', { ascending: false }).limit(1).maybeSingle();
      const { data: ans } = sub
        ? await ad.from('mock_exam_answers').select('*').eq('submission_id', sub.id)
        : { data: [] };
      const { data: colsRaw } = await ad.from('matieres').select('id, nom');
      const collegeNames: Record<string, string> = Object.fromEntries(
        ((colsRaw ?? []) as { id: string; nom: string }[]).map((x) => [x.id, x.nom]),
      );
      // En passation, on n'expose jamais les corrigés (is_correct/justification).
      const forRunner = iQuestions.map((q) => ({
        id: q.id, format: q.format as 'qcm' | 'qroc', enonce: q.enonce,
        vignette: q.vignette ?? null, images: (q.images ?? []) as string[], points: q.points,
        items: q.format === 'qcm'
          ? (q.items ?? []).map((it: { lettre: string; enonce: string }) => ({ lettre: it.lettre, enonce: it.enonce }))
          : [],
      }));
      return (
        <InterrogationExamFlow
          coursId={coursId}
          coursTitre={c.titre}
          firstName={profile.first_name ?? ''}
          lastName={profile.last_name ?? ''}
          exam={interro}
          questions={sub ? iQuestions : forRunner}
          submission={sub ?? null}
          answers={(ans ?? []) as Record<string, unknown>[]}
          collegeNames={collegeNames}
          alreadySigned={!!completion?.certificate_signed_at}
        />
      );
    }
  }

  // ── Repli : interrogation automatique (15 QCM tirés au hasard) ──
  // Des questions ISOLÉES seulement. L'interrogation n'affiche que l'énoncé,
  // sans vignette : une question de dossier progressif, d'annale,
  // d'entraînement ou de séance y est intraitable (« Quel examen d'imagerie est
  // indiqué dans cette situation ? »). Règle commune à tous les tirages :
  // lib/pedago/dossiers. Un item qui compte moins de N questions isolées en
  // sert moins, sans compléter avec des questions de dossier.
  //
  // Le vivier est lu par le même helper que le verrou de fin de parcours
  // (layout, /api/mobile/gates) et que l'écran de l'app : un item dont le
  // vivier est vide n'y retient jamais l'élève. Seules les N questions tirées
  // sont chargées en entier.
  const vivier = (await viviersInterrogation(supabase, [coursId])).get(coursId)
    ?? { series: [], questions: [] };
  const questions = await questionsDuTirage(supabase, vivier);

  return (
    <InterrogationSession
      coursId={coursId}
      coursTitre={c.titre}
      questions={questions}
      previousScore={completion?.qcm_test_score ?? null}
      previousTotal={completion?.qcm_test_total ?? null}
      alreadySigned={!!completion?.certificate_signed_at}
      firstName={profile.first_name ?? ''}
      lastName={profile.last_name ?? ''}
    />
  );
}

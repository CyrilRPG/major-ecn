import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { ArrowLeft, ClipboardList } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { canAccessCollege, parseScope } from '@/lib/auth/permissions';
import { EDN_FACULTE_ID } from '@/lib/data/navigator';
import { SpecialtyEvaluation, type InterrogationQuestion } from './specialty-evaluation';

export const metadata = { title: 'Interrogation officielle' };

/**
 * Interrogation officielle Major EVC de fin de spécialité (spec section 9).
 *
 * Elle est CRÉÉE PAR L'ÉQUIPE PÉDAGOGIQUE (admin → Interrogations de
 * spécialité) : 15 QCM + 2 questions ouvertes + mini-cas clinique éventuel.
 * Elle n'est jamais générée automatiquement : tant qu'aucune interrogation
 * n'est publiée pour la spécialité, l'élève voit un écran « en préparation »
 * et la spécialité reste en « Validation en attente ».
 */
export default async function EvaluationPage({ params }: { params: Promise<{ matiere: string }> }) {
  const { matiere } = await params;
  const { user, profile } = await requireUser();
  const supabase = await createClient();
  const scope = parseScope(profile.permission_scope);
  if (!canAccessCollege(scope, matiere)) redirect('/facultes');

  const { data: mat } = await supabase
    .from('matieres')
    .select('id, nom, semestres!inner(faculte_id)')
    .eq('id', matiere)
    .maybeSingle();
  if (!mat) notFound();
  const sem = mat.semestres as unknown as { faculte_id: string };
  if (sem.faculte_id !== EDN_FACULTE_ID) notFound();
  const matiereName = (mat as unknown as { nom: string }).nom;

  // Parcours terminé ? (tous les cours abordés : fiche/vidéo/QCM)
  const [{ data: coursRaw }, { data: progressRaw }, { data: attemptsRaw }] = await Promise.all([
    supabase.from('cours').select('id').eq('matiere_id', matiere),
    supabase
      .from('course_progress')
      .select('cours_id, video_watched, fiche_read')
      .eq('user_id', user.id),
    supabase
      .from('qcm_attempts')
      .select('question_id, qcm_questions!inner(qcm_series!inner(cours_id))')
      .eq('user_id', user.id),
  ]);
  const coursIds = new Set((coursRaw ?? []).map((c) => c.id));
  const touched = new Set<string>();
  for (const p of (progressRaw ?? []) as { cours_id: string; video_watched: boolean | null; fiche_read: boolean | null }[]) {
    if ((p.video_watched || p.fiche_read) && coursIds.has(p.cours_id)) touched.add(p.cours_id);
  }
  for (const a of ((attemptsRaw ?? []) as unknown as { qcm_questions: { qcm_series: { cours_id: string } } }[])) {
    const cid = a.qcm_questions.qcm_series.cours_id;
    if (coursIds.has(cid)) touched.add(cid);
  }
  const finishedParcours = coursIds.size > 0 && touched.size >= coursIds.size;

  // Interrogation composée par l'équipe (mock_exams.specialite_id, publiée).
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ad = admin as any;
  const { data: interro } = await ad
    .from('mock_exams')
    .select('id, title, status')
    .eq('specialite_id', matiere)
    .eq('status', 'published')
    .maybeSingle();

  let questions: InterrogationQuestion[] = [];
  if (interro) {
    const { data: iqs } = await ad
      .from('mock_exam_questions')
      .select('id, order_index, format, enonce, vignette, items, reponse_attendue, correction_generale')
      .eq('exam_id', interro.id)
      .order('order_index');
    type IQ = {
      id: string; order_index: number; format: 'qcm' | 'qroc'; enonce: string;
      vignette: string | null;
      items: { lettre: string; enonce: string; is_correct: boolean; justification?: string }[] | null;
      reponse_attendue: string | null; correction_generale: string | null;
    };
    questions = ((iqs ?? []) as IQ[]).map((iq) => ({
      id: iq.id,
      format: iq.format === 'qroc' ? 'qroc' : 'qcm',
      enonce: iq.enonce,
      vignette: iq.vignette,
      items: (iq.items ?? [])
        .map((it, i) => ({
          id: `${iq.id}-${it.lettre ?? i}`,
          lettre: it.lettre,
          enonce: it.enonce,
          justification: it.justification ?? '',
          is_correct: !!it.is_correct,
        }))
        .sort((a, b) => a.lettre.localeCompare(b.lettre)),
      reponse_attendue: iq.reponse_attendue,
      correction_generale: iq.correction_generale,
    }));
  }

  if (!interro || questions.length === 0) {
    // Pas d'interrogation publiée : conforme à la spec, on ne tire RIEN au
    // hasard — la spécialité reste « Validation en attente ».
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EEF2FF] text-[#6D28D9]">
          <ClipboardList className="h-7 w-7" />
        </span>
        <h1 className="mt-6 text-xl font-black tracking-tight text-(--color-ink)">
          {finishedParcours
            ? `Vous avez terminé le parcours ${matiereName}`
            : `Interrogation officielle — ${matiereName}`}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-(--color-ink-soft)">
          L&apos;interrogation officielle Major EVC de cette spécialité est en cours de
          préparation par l&apos;équipe pédagogique. Elle sera disponible ici très
          prochainement pour évaluer votre niveau et valider la spécialité.
        </p>
        {finishedParcours && (
          <p className="mt-3 text-xs font-semibold text-[#6D28D9]">
            Statut actuel : Validation en attente — vous pouvez continuer à travailler.
          </p>
        )}
        <div className="mt-8 flex flex-col gap-3">
          <Link
            href={`/matieres/${matiere}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6D28D9] px-4 py-3 text-sm font-bold text-white shadow-sm transition-transform hover:scale-[1.01]"
          >
            <ArrowLeft className="h-4 w-4" /> Retour à la spécialité
          </Link>
        </div>
      </div>
    );
  }

  return (
    <SpecialtyEvaluation
      matiereId={matiere}
      matiereName={matiereName}
      questions={questions}
      finishedParcours={finishedParcours}
    />
  );
}

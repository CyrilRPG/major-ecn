import { notFound, redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { CHECKUP_STUDENT_ENABLED } from '@/lib/modules-flags';
import { moteurOuvert } from '@/lib/moteur/access';
import { CheckupError, resultView } from '@/lib/checkup/server/service';
import { SelfReview, type ReviewItem } from '@/components/student/checkup/self-review';
import { TEXTS } from '@/lib/checkup/types';

export const metadata = { title: 'Correction de mes QROC — EVC Check-up' };
export const dynamic = 'force-dynamic';

/**
 * pending_self_review (§16) : le statut reste en attente sans limite de
 * durée ; le score définitif, l'analyse des items et le plan de reprise sont
 * calculés à la fin de l'auto-correction seulement.
 */
export default async function CheckupCorrectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, profile } = await requireUser();
  if (!moteurOuvert(profile, CHECKUP_STUDENT_ENABLED)) redirect('/accueil');
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  let view;
  try { view = await resultView(user.id, id); } catch (e) { if (e instanceof CheckupError) notFound(); throw e; }
  const s = view.session;
  if (s.status === 'active') redirect(`/checkup/${id}`);
  if (s.status !== 'pending_self_review') redirect(`/checkup/${id}/resultat`);
  const written = view.questions.filter((q) => q.question_type === 'QROC' && q.origin !== 'vide');
  const empty = view.questions.filter((q) => q.question_type === 'QROC' && q.origin === 'vide').length;
  const items: ReviewItem[] = written.map((q) => ({
    position: q.position, enonce: q.snapshot.enonce, images: q.snapshot.images ?? [], vignette: q.dossier_id ? q.snapshot.vignette : null,
    dossierLabel: q.dossier_id ? `Dossier · question ${q.question_order}/${q.dossier_size}` : null, answer: q.answer?.text ?? '',
    reponseAttendue: q.snapshot.reponse_attendue, correction: q.snapshot.correction_generale, commentaire: q.snapshot.commentaire_enseignant, grade: q.self_grade,
  }));
  return (
    <main className="mx-auto w-full max-w-4xl space-y-4 px-3 py-5 sm:px-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-(--color-primary)">{TEXTS.name}</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-(--color-ink)">{TEXTS.pendingTitle}</h1>
        <p className="mt-1 text-sm text-(--color-ink-soft)">
          Vos réponses rédigées sont figées. Comparez chacune à la correction Major ECN et notez-la honnêtement : votre plan de reprise en dépend.
          {s.qcm_points_possible ? ` Vos QCM sont déjà notés (${Number(s.qcm_points_obtained ?? 0).toString().replace('.', ',')}/${s.qcm_points_possible}) et ont déjà alimenté votre profil.` : ''}
        </p>
      </header>
      <SelfReview sessionId={id} items={items} emptyCount={empty} />
    </main>
  );
}

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { ImpersonationBanner } from '@/components/impersonation-banner';
import { AppShell } from '@/components/shell/app-shell';
import { SatisfactionBanner } from '@/components/student/satisfaction-banner';
import { ConseilsCenter } from '@/components/student/conseils-center';
import { getNavigatorTree } from '@/lib/data/navigator';
import { isUserTargeted } from '@/lib/schemas/satisfaction';

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await requireUser();
  const cookieStore = await cookies();
  const isImpersonating = cookieStore.has('impersonator_id');
  const impersonatedName = cookieStore.get('impersonator_target_name')?.value;
  const tree = await getNavigatorTree(profile);

  // Delta hebdo « +X% cette semaine » pour la carte Progression globale :
  // ratio des cours touchés dans les 7 derniers jours sur le total des cours
  // visibles, arrondi à l'entier le plus proche (0 si pas d'activité).
  const supabase = await createClient();
  const totalCours = tree.reduce((acc, c) => acc + c.cours.length, 0);
  const days7Ago = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const { data: recentProgress } = await supabase
    .from('course_progress')
    .select('cours_id')
    .eq('user_id', user.id)
    .gte('last_seen_at', days7Ago);
  const touchedThisWeek = new Set((recentProgress ?? []).map((r) => r.cours_id)).size;
  const weeklyProgressDelta = totalCours > 0
    ? Math.min(100, Math.round((touchedThisWeek / totalCours) * 100))
    : 0;

  // Détection des formulaires en attente pour cet utilisateur
  const [{ data: forms }, { data: responses }] = await Promise.all([
    supabase
      .from('satisfaction_forms')
      .select('id, title, intro_text, mandatory, target_promo, target_offer, target_college')
      .eq('active', true)
      .order('created_at', { ascending: false }),
    supabase
      .from('satisfaction_responses')
      .select('form_id')
      .eq('user_id', user.id),
  ]);
  const answeredIds = new Set((responses ?? []).map((r) => r.form_id));
  const pending = (forms ?? [])
    .filter((f) => !answeredIds.has(f.id))
    .filter((f) => isUserTargeted(f, {
      promotion: profile.promotion,
      permission_scope: profile.permission_scope,
    }));

  const mandatoryPending = pending.find((f) => f.mandatory);
  const optionalPending = pending.filter((f) => !f.mandatory);

  // Si formulaire obligatoire et utilisateur pas déjà sur sa page → redirection
  const h = await headers();
  const pathname = h.get('x-invoke-path') ?? h.get('x-pathname') ?? '';
  const onFormPage = pathname.startsWith('/formulaires/');
  if (mandatoryPending && !onFormPage) {
    redirect(`/formulaires/${mandatoryPending.id}`);
  }

  // ───────────────────────────────────────────────────────────────
  // Restriction prof côté vue étudiant : un professeur ne doit accéder
  // qu'aux pages de contenu (collèges + cours). Tout le reste (Accueil,
  // Agenda, Révisions transversales, Entraînement ciblé, Forum) est
  // redirigé vers /facultes (la racine du contenu pédagogique).
  // ───────────────────────────────────────────────────────────────
  if (profile.role === 'professor') {
    // /accueil et /forum sont autorisés : le prof y a sa page d'accueil
    // adaptée et l'accès au forum d'entraide entre profs/élèves.
    const blockedPrefixes = [
      '/agenda',
      '/revisions-transversales',
      '/entrainement',
    ];
    if (blockedPrefixes.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
      redirect('/accueil');
    }
  }

  // ───────────────────────────────────────────────────────────────
  // Interrogation obligatoire : dès qu'un parcours est terminé
  // (vidéo + fiche + ≥1 QCM + ≥1 flashcard review) et que le certificat
  // n'a pas encore été signé, l'élève est redirigé vers l'interrogation
  // et bloqué sur celle-ci jusqu'à l'avoir terminée + signée.
  // Exceptions : la page d'interrogation elle-même, le téléchargement du
  // certificat, les pages d'auth, et la déconnexion.
  //
  // S'APPLIQUE UNIQUEMENT AUX ÉTUDIANTS — les profs/admins qui empruntent
  // les routes de la couche (student) pour passer en mode "Vue étudiant"
  // ne doivent jamais être bloqués (sinon : boucle de redirection au login).
  // ───────────────────────────────────────────────────────────────
  if (profile.role === 'student') {
    const PNEUMO_COURS_ID = '33579977-020e-4c94-a561-dee9d3c7bc70';
    const [{ data: progressRows }, { data: completionsRows }] = await Promise.all([
      supabase
        .from('course_progress')
        .select('cours_id, video_watched, fiche_read, last_seen_at')
        .eq('user_id', user.id)
        .eq('video_watched', true)
        .eq('fiche_read', true),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any).from('parcours_completions')
        .select('cours_id, certificate_signed_at')
        .eq('user_id', user.id),
    ]);
    const signedSet = new Set(
      ((completionsRows ?? []) as Array<{ cours_id: string; certificate_signed_at: string | null }>)
        .filter((r) => !!r.certificate_signed_at)
        .map((r) => r.cours_id)
    );
    // Cours candidats : vidéo + fiche OK, pas encore signés.
    const candidateIds = new Set<string>(
      ((progressRows ?? []) as Array<{ cours_id: string }>)
        .map((r) => r.cours_id)
        .filter((id) => !signedSet.has(id))
    );
    // Bypass Pneumologie : on ne force le passage QUE si l'élève a au moins
    // une trace d'activité sur Pneumo (pas dès la première connexion).
    const hasPneumoActivity = ((progressRows ?? []) as Array<{ cours_id: string }>)
      .some((r) => r.cours_id === PNEUMO_COURS_ID);
    if (hasPneumoActivity && !signedSet.has(PNEUMO_COURS_ID)) {
      candidateIds.add(PNEUMO_COURS_ID);
    }

    let pendingInterrogationId: string | null = null;
    if (candidateIds.size > 0) {
      const ids = [...candidateIds];
      const [{ data: atts }, { data: revs }] = await Promise.all([
        supabase
          .from('qcm_attempts')
          .select('id, qcm_questions!inner(qcm_series!inner(cours_id))')
          .eq('user_id', user.id)
          .in('qcm_questions.qcm_series.cours_id', ids),
        supabase
          .from('flashcard_reviews')
          .select('id, flashcards!inner(cours_id)')
          .eq('user_id', user.id)
          .in('flashcards.cours_id', ids),
      ]);
      type AttRow = { qcm_questions: { qcm_series: { cours_id: string } } };
      type RevRow = { flashcards: { cours_id: string } };
      const withQcm = new Set(
        ((atts ?? []) as unknown as AttRow[]).map((a) => a.qcm_questions.qcm_series.cours_id)
      );
      const withRev = new Set(
        ((revs ?? []) as unknown as RevRow[]).map((r) => r.flashcards.cours_id)
      );
      for (const id of ids) {
        const isPneumoBypass = id === PNEUMO_COURS_ID && hasPneumoActivity;
        if (isPneumoBypass || (withQcm.has(id) && withRev.has(id))) {
          pendingInterrogationId = id;
          break;
        }
      }
    }

    if (pendingInterrogationId) {
      const interroPath = `/cours/${pendingInterrogationId}/interrogation`;
      const isOnInterrogation = pathname.startsWith(interroPath);
      const isCertDownload = pathname.startsWith('/api/certificate/');
      const isLogout = pathname.startsWith('/logout');
      const isApi = pathname.startsWith('/api/');
      if (!isOnInterrogation && !isCertDownload && !isLogout && !isApi) {
        redirect(interroPath);
      }
    }
  }

  return (
    <div className="flex h-screen flex-col">
      {isImpersonating && <ImpersonationBanner targetName={impersonatedName} />}
      <div className="min-h-0 flex-1">
        <AppShell profile={profile} tree={tree} weeklyProgressDelta={weeklyProgressDelta}>
          {optionalPending.length > 0 && !onFormPage && (
            <SatisfactionBanner form={optionalPending[0]} />
          )}
          {children}
        </AppShell>
      </div>
      <ConseilsCenter />
    </div>
  );
}

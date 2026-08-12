import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { ImpersonationBanner } from '@/components/impersonation-banner';
import { AppShell } from '@/components/shell/app-shell';
import { SatisfactionBanner } from '@/components/student/satisfaction-banner';
import { ConseilsCenter } from '@/components/student/conseils-center';
import { StudentTutorialPopup } from '@/components/student/student-tutorial-popup';
import { OnboardingTour } from '@/components/student/onboarding-tour';
import { ProfileCompletionGate } from '@/components/student/profile-completion-gate';
import { getNavigatorTree } from '@/lib/data/navigator';
import { hasMedecineGeneraleAccess, parseScope } from '@/lib/auth/permissions';
import { fetchContentAccessForScope } from '@/lib/auth/formula-permissions';
import { isUserTargeted } from '@/lib/schemas/satisfaction';
import {
  resolveWelcomeConfig, WELCOME_PAR_DEFAUT,
  type WelcomePopupRow, type WelcomeSpecialite,
} from '@/lib/student/welcome';

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await requireUser();
  const cookieStore = await cookies();
  const isImpersonating = cookieStore.has('impersonator_id');
  const impersonatedName = cookieStore.get('impersonator_target_name')?.value;
  // Ne jamais afficher une vue élève « impersonnée » avec les droits de
  // l'administrateur si la session cible n'a pas été installée ou a expiré.
  // C'était trompeur (bandeau cible + « Bonjour, Cyril ») et surtout fail-open.
  if (isImpersonating && profile.role === 'admin') redirect('/admin/eleves');
  const treePromise = getNavigatorTree(profile);
  // Détection mode Découverte : utilisé pour verrouiller Entraînement,
  // Révisions, Agenda et Annales EVC dans le menu sidebar + afficher
  // l'encadré Découverte au-dessus d'Accueil.
  // Critère : un user est Découverte SSI il a accès à col-decouverte ET
  // n'a aucune formule payée (paid_formule absent). Les acheteurs ont la
  // formule sur leur profil → on ne leur affiche pas les locks « Découverte ».
  const scopeForNav = parseScope(profile.permission_scope);
  const parcoursAccessPromise = profile.role === 'admin'
    ? Promise.resolve(true)
    : fetchContentAccessForScope(scopeForNav).then(
        (access) => access.parcoursMajor && hasMedecineGeneraleAccess(profile.permission_scope),
      );
  const isDecouverte =
    scopeForNav.offer === 'decouverte' &&
    scopeForNav.type === 'college' &&
    scopeForNav.colleges.includes('col-decouverte');

  // Delta hebdo « +X% cette semaine » pour la carte Progression globale :
  // ratio des cours touchés dans les 7 derniers jours sur le total des cours
  // visibles, arrondi à l'entier le plus proche (0 si pas d'activité).
  const supabase = await createClient();
  const days7Ago = new Date(Date.now() - 7 * 86_400_000).toISOString();

  // Popup d'accueil : lancée ICI, attendue tout en bas.
  //
  // Elle ne dépend d'aucun des blocs qui suivent (révisions transversales,
  // interrogation obligatoire), mais elle était exécutée APRÈS eux, en fin de
  // chaîne — soit deux allers-retours de plus ajoutés à la latence de CHAQUE
  // page de la plateforme. On la met en vol tout de suite ; son résultat n'est
  // consommé qu'au moment du rendu.
  const popupAccueilPromise = profile.role === 'student'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? (supabase as any)
        .from('welcome_popups')
        .select('id, college_id, active, titre, accroche, intro, demarrage_actif, demarrage_intro, demarrage_colleges')
        .then((r: { data: unknown }) => r.data)
    : Promise.resolve(null);
  // Une promesse rejetée et non consommée ferait tomber le processus : on la
  // neutralise dès maintenant, la valeur `null` étant déjà le cas de repli.
  popupAccueilPromise.catch?.(() => null);

  // Arbre de navigation et données du bandeau chargés EN PARALLÈLE : on
  // n'attend plus la fin de l'arbre avant de lancer les requêtes de
  // satisfaction/progrès (elles en sont indépendantes) → moins de latence.
  const [tree, canAccessParcoursMajor, [{ data: recentProgress }, { data: forms }, { data: responses }]] = await Promise.all([
    treePromise,
    parcoursAccessPromise,
    Promise.all([
      supabase
        .from('course_progress')
        .select('cours_id')
        .eq('user_id', user.id)
        .gte('last_seen_at', days7Ago),
      supabase
        .from('satisfaction_forms')
        .select('id, title, intro_text, mandatory, target_promo, target_offer, target_college')
        .eq('active', true)
        .order('created_at', { ascending: false }),
      supabase
        .from('satisfaction_responses')
        .select('form_id')
        .eq('user_id', user.id),
    ]),
  ]);
  const totalCours = tree.reduce((acc, c) => acc + c.cours.length, 0);
  const touchedThisWeek = new Set((recentProgress ?? []).map((r) => r.cours_id)).size;
  const weeklyProgressDelta = totalCours > 0
    ? Math.min(100, Math.round((touchedThisWeek / totalCours) * 100))
    : 0;
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
      '/notes',
      '/revisions-transversales',
      '/entrainement',
      '/revoir',
    ];
    if (blockedPrefixes.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
      redirect('/accueil');
    }
  }

  // ───────────────────────────────────────────────────────────────
  // Section 15 — Blocage contenu : si l'étudiant n'a pas fait de
  // révision transversale depuis 14+ jours et qu'il a déjà commencé
  // au moins une session, seuls les NOUVEAUX contenus sont bloqués.
  // Restent accessibles : accueil, agenda, dashboard révisions,
  // évaluations/consolidation/renforcement, corrections, fiches et
  // flashcards de cours déjà ouverts, contact, formulaires.
  // ───────────────────────────────────────────────────────────────
  if (profile.role === 'student') {
    const alwaysAllowed = [
      '/revisions-transversales', '/formulaires/', '/api/', '/logout',
      '/accueil', '/agenda', '/notes', '/contact', '/entrainement', '/revoir',
    ];
    const isOnAllowed = alwaysAllowed.some((p) => pathname === p || pathname.startsWith(p + '/') || pathname.startsWith(p));
    const isOnMatieresSubpage = pathname.match(/^\/matieres\/[^/]+\/(evaluation|consolidation|renforcement)/);

    if (!isOnAllowed && !isOnMatieresSubpage) {
      const { data: lastSession } = await (supabase as unknown as {
        from: (t: string) => {
          select: (s: string) => {
            eq: (k: string, v: string) => {
              not: (k: string, op: string, v: null) => {
                order: (k: string, o: { ascending: boolean }) => {
                  limit: (n: number) => Promise<{
                    data: { completed_at: string }[] | null;
                  }>;
                };
              };
            };
          };
        };
      }).from('transversal_sessions')
        .select('completed_at')
        .eq('user_id', user.id)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(1);
      const lastCompletedAt = lastSession?.[0]?.completed_at;
      if (lastCompletedAt) {
        const daysSince = Math.floor((Date.now() - new Date(lastCompletedAt).getTime()) / 86_400_000);
        if (daysSince >= 14) {
          const coursMatch = pathname.match(/^\/cours\/([^/]+)/);
          if (coursMatch) {
            const { data: hasProgress } = await supabase
              .from('course_progress')
              .select('cours_id')
              .eq('user_id', user.id)
              .eq('cours_id', coursMatch[1])
              .maybeSingle();
            if (!hasProgress) {
              redirect('/revisions-transversales');
            }
          } else {
            redirect('/revisions-transversales');
          }
        }
      }
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

  // Popup d'accueil : configuration de la spécialité de l'élève, à défaut la
  // configuration générale. Un élève de psychiatrie ne doit pas recevoir les
  // conseils de démarrage écrits pour la médecine générale.
  // Les conseils de démarrage d'origine sont ceux de la médecine générale : on
  // ne les sert qu'aux élèves concernés (ou en accès intégral).
  const couvreMg = scopeForNav.type === 'all'
    || scopeForNav.colleges.some((c) => c === 'col-medecine-generale' || c.startsWith('col-mg-'));
  let welcome = couvreMg
    ? WELCOME_PAR_DEFAUT
    : { ...WELCOME_PAR_DEFAUT, demarrageActif: false, specialites: [] };
  if (profile.role === 'student') {
    // Requête lancée en début de rendu (cf. popupAccueilPromise) : à ce stade
    // elle est déjà revenue, on ne fait qu'en récupérer le résultat.
    const welcomeRows = await popupAccueilPromise.catch(() => null);
    const rows = (welcomeRows ?? []) as WelcomePopupRow[];
    if (rows.length > 0) {
      const ids = rows.flatMap((r) => r.demarrage_colleges ?? []);
      const specialites = new Map<string, WelcomeSpecialite>();
      if (ids.length > 0) {
        const { data: mats } = await supabase
          .from('matieres')
          .select('id, nom, color_hex')
          .in('id', Array.from(new Set(ids)));
        for (const m of ((mats ?? []) as { id: string; nom: string; color_hex: string | null }[])) {
          const couleur = m.color_hex ?? '#E4002B';
          specialites.set(m.id, {
            label: m.nom,
            color: couleur,
            bg: `color-mix(in srgb, ${couleur} 16%, white)`,
          });
        }
      }
      const scopeColleges = scopeForNav.type === 'college' ? scopeForNav.colleges : [];
      welcome = resolveWelcomeConfig(rows, scopeColleges, specialites, couvreMg);
    }
  }

  return (
    <div className="flex h-screen flex-col">
      {isImpersonating && <ImpersonationBanner targetName={impersonatedName} />}
      <div className="min-h-0 flex-1">
        <AppShell
          profile={profile}
          tree={tree}
          weeklyProgressDelta={weeklyProgressDelta}
          isDecouverte={isDecouverte}
          canAccessParcoursMajor={canAccessParcoursMajor}
        >
          {optionalPending.length > 0 && !onFormPage && (
            <SatisfactionBanner form={optionalPending[0]} />
          )}
          {children}
        </AppShell>
      </div>
      {/* Popup obligatoire de complétion de profil. En mode « se connecter en
          tant que », il s'affiche aussi mais expose un bouton retour au panel. */}
      {profile.role === 'student' && (
        <ProfileCompletionGate
          initialFirstName={(profile as { first_name?: string | null }).first_name ?? null}
          initialLastName={(profile as { last_name?: string | null }).last_name ?? null}
          initialPhone={(profile as { phone?: string | null }).phone ?? null}
          impersonating={isImpersonating}
        />
      )}
      {profile.role === 'student' && <ConseilsCenter isDecouverte={isDecouverte} welcome={welcome} />}
      {profile.role === 'student' && <OnboardingTour />}
      {!isDecouverte && profile.role === 'student' && scopeForNav.offer !== 'decouverte' && (
        <StudentTutorialPopup offer={scopeForNav.offer as 'essentiel' | 'intensif' | 'approfondi'} />
      )}
    </div>
  );
}

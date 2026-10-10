import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { enImpersonation } from '@/lib/auth/impersonation-marqueur';
import { createClient } from '@/lib/supabase/server';
import { ImpersonationBanner } from '@/components/impersonation-banner';
import { AppShell } from '@/components/shell/app-shell';
import { SatisfactionBanner } from '@/components/student/satisfaction-banner';
import { ConseilsCenter } from '@/components/student/conseils-center';
import { TutorielVideo } from '@/components/student/tutoriel-video';
import { videoTutoriel } from '@/lib/student/tutoriel-video';
import { bunnyEmbedUrl } from '@/lib/bunny';
import { ProfileCompletionGate } from '@/components/student/profile-completion-gate';
import { EmargementsEnAttente, type FeuilleEnAttente } from '@/components/student/emargements-en-attente';
import { GardeEnquetes } from '@/components/qualite/garde-enquetes';
import { chargerGardeEnquetes } from '@/lib/qualite/serveur/garde';
import { ChargeurPostits } from '@/components/postits/chargeur';
import { getNavigatorTree } from '@/lib/data/navigator';
import { hasMedecineGeneraleAccess, parseScope } from '@/lib/auth/permissions';
import { PLAN_STUDENT_ENABLED } from '@/lib/modules-flags';
import { planAvailableFor } from '@/lib/plan/service';
import { fetchContentAccessForScope } from '@/lib/auth/formula-permissions';
import { isUserTargeted } from '@/lib/schemas/satisfaction';
import { interrogationEnAttente } from '@/lib/pedago/interrogation';
import {
  resolveWelcomeConfig, WELCOME_PAR_DEFAUT,
  type WelcomePopupRow, type WelcomeSpecialite,
} from '@/lib/student/welcome';

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await requireUser();
  const cookieStore = await cookies();
  // Marqueur SIGNÉ et lié à ce compte (lib/auth/impersonation-marqueur.ts) : un
  // cookie posé à la main par l'élève ne lui fait plus sauter formulaires
  // obligatoires ni questionnaires bloquants.
  const isImpersonating = await enImpersonation(cookieStore, user.id);
  const impersonatedName = cookieStore.get('impersonator_target_name')?.value;
  // Ne jamais afficher une vue élève « impersonnée » avec les droits de
  // l'administrateur si la session cible n'a pas été installée ou a expiré.
  // C'était trompeur (bandeau cible + « Bonjour, Cyril ») et surtout fail-open.
  if (isImpersonating && profile.role === 'admin') redirect('/admin/eleves');
  // Élève à formule payante : plus aucun accès à l'espace Découverte (demande
  // de Cyril, 08/10/2026), même en accès intégral.
  const payant = profile.role === 'student'
    && ['essentiel', 'intensif', 'approfondi'].includes(parseScope(profile.permission_scope).offer);
  const treePromise = getNavigatorTree(profile)
    .then((t) => (payant ? t.filter((c) => c.id !== 'col-decouverte') : t));
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

  // Gardes de contenu lancées ICI, attendues plus bas à leur place habituelle
  // (l'ordre des redirections ne change pas). Elles ne dépendent ni de l'arbre
  // ni des formulaires, mais s'exécutaient APRÈS eux : jusqu'à quatre
  // allers-retours de plus, en série, sur CHAQUE page élève (audit de lenteur
  // du 29/09/2026).
  const hEarly = await headers();
  const pathnameEarly = hEarly.get('x-invoke-path') ?? hEarly.get('x-pathname') ?? '';
  const pageDeContenu = /^\/cours\/[^/]+/.test(pathnameEarly) || /^\/matieres\/[^/]+\/?$/.test(pathnameEarly);
  const revisionStatsPromise = profile.role === 'student' && pageDeContenu
    ? (supabase as unknown as {
        from: (t: string) => {
          select: (s: string) => {
            eq: (k: string, v: string) => {
              maybeSingle: () => Promise<{ data: { last_transversal_revision_date: string | null } | null }>;
            };
          };
        };
      }).from('user_revision_stats')
        .select('last_transversal_revision_date')
        .eq('user_id', user.id)
        .maybeSingle()
    : Promise.resolve({ data: null });
  revisionStatsPromise.catch?.(() => null);
  const interrogationPromise = profile.role === 'student'
    ? interrogationEnAttente(supabase, {
        id: user.id,
        role: profile.role,
        permission_scope: profile.permission_scope,
      })
    : Promise.resolve(null);
  interrogationPromise.catch?.(() => null);
  // Questionnaires qualité (enquêtes de satisfaction, bilans) : garde lancée ici,
  // attendue au rendu. Jamais bloquante en cas d'erreur.
  const gardeEnquetesPromise = profile.role === 'student'
    ? chargerGardeEnquetes(user.id)
    : Promise.resolve({ bloquant: null, enAttente: null });

  // Émargements dus : toute vidéo visionnée (seuil franchi) sans feuille signée.
  // Une signature par vidéo est exigée à l'ouverture de la plateforme, quelle
  // que soit la page (fenêtre non fermable, cf. EmargementsEnAttente). Jamais
  // pour un administrateur connecté « en tant que » : il ne signe pas à la
  // place de l'élève.
  const feuillesDuesPromise: Promise<FeuilleEnAttente[]> = profile.role === 'student' && !isImpersonating
    ? (async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (supabase as any)
          .from('course_attendances')
          .select('cours_id, kind, video_id, video_titre, cours_titre, matiere_id, required_at')
          .eq('user_id', user.id)
          .is('signed_at', null)
          .order('required_at', { ascending: true });
        const lignes = (data ?? []) as {
          cours_id: string; kind: string | null; video_id: string | null; video_titre: string | null;
          cours_titre: string | null; matiere_id: string | null;
        }[];
        if (lignes.length === 0) return [];
        const ids = Array.from(new Set(lignes.map((l) => l.matiere_id).filter((m): m is string => !!m)));
        const { data: mats } = ids.length
          ? await supabase.from('matieres').select('id, nom').in('id', ids)
          : { data: [] as { id: string; nom: string }[] };
        const noms = new Map(((mats ?? []) as { id: string; nom: string }[]).map((m) => [m.id, m.nom]));
        return lignes.map((l) => ({
          coursId: l.cours_id,
          kind: l.kind === 'seance' ? 'seance' as const : 'video' as const,
          videoId: l.video_id,
          videoTitre: l.video_titre,
          coursTitre: l.cours_titre ?? 'Cours',
          college: l.matiere_id ? noms.get(l.matiere_id) ?? null : null,
        }));
      })()
    : Promise.resolve([]);
  feuillesDuesPromise.catch?.(() => []);

  // Arbre de navigation et données du bandeau chargés EN PARALLÈLE : on
  // n'attend plus la fin de l'arbre avant de lancer les requêtes de
  // satisfaction/progrès (elles en sont indépendantes) → moins de latence.
  // « Mon planning » : le personnel toujours ; un élève si le module est ouvert et
  // qu'une spécialité de sa formule a son programme dans le planificateur.
  const planAccessPromise: Promise<boolean> = profile.role !== 'student'
    ? Promise.resolve(true)
    : PLAN_STUDENT_ENABLED ? planAvailableFor(profile.permission_scope).catch(() => false) : Promise.resolve(false);
  const [tree, canAccessParcoursMajor, canAccessPlan, [{ data: recentProgress }, { data: forms }, { data: responses }]] = await Promise.all([
    treePromise,
    parcoursAccessPromise,
    planAccessPromise,
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
      '/mes-rendez-vous',
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
  // Section 15 — Blocage contenu : après 14 jours sans révision
  // transversale (pour un élève qui en a déjà fait au moins une),
  // SEULS les NOUVEAUX contenus sont bloqués : un cours jamais ouvert,
  // ou la page d'une spécialité jamais commencée. Tout le reste —
  // dashboard, agenda, anciens cours, fiches, flashcards, QCM déjà
  // accessibles, corrections, épreuves, évaluations/consolidation/
  // renforcement — reste accessible. Le blocage est levé dès que la
  // réévaluation est réalisée (la page de session force la réévaluation
  // exigée au-delà de 14 jours).
  // ───────────────────────────────────────────────────────────────
  if (profile.role === 'student') {
    const coursMatch = pathname.match(/^\/cours\/([^/]+)/);
    const matiereRootMatch = pathname.match(/^\/matieres\/([^/]+)\/?$/);

    if (coursMatch || matiereRootMatch) {
      const { data: statsRow } = await revisionStatsPromise;
      const lastDate = statsRow?.last_transversal_revision_date ?? null;
      const daysSince = lastDate
        ? Math.floor((Date.now() - new Date(lastDate).getTime()) / 86_400_000)
        : null;

      if (daysSince !== null && daysSince >= 14) {
        if (coursMatch) {
          const { data: hasProgress } = await supabase
            .from('course_progress')
            .select('cours_id')
            .eq('user_id', user.id)
            .eq('cours_id', coursMatch[1])
            .maybeSingle();
          // Cours jamais ouvert = nouveau contenu → réévaluation d'abord.
          if (!hasProgress) redirect('/revisions-transversales');
        } else if (matiereRootMatch) {
          const { data: matActivity } = await supabase
            .from('course_progress')
            .select('cours_id, cours!inner(matiere_id)')
            .eq('user_id', user.id)
            .eq('cours.matiere_id', matiereRootMatch[1])
            .limit(1);
          // Spécialité jamais commencée = nouveau contenu → réévaluation d'abord.
          if (!matActivity || matActivity.length === 0) redirect('/revisions-transversales');
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
  // Le cours est choisi par `interrogationEnAttente` (lib/pedago/interrogation),
  // le même helper que /api/mobile/gates, et qui rejoue les contrôles de la
  // page : un cours dont l'élève a perdu l'accès, ou dont l'interrogation n'a
  // aucune question, est passé — sinon le layout et la page se renverraient
  // l'élève à l'infini, ou le laisseraient devant un écran sans question.
  //
  // S'APPLIQUE UNIQUEMENT AUX ÉTUDIANTS — les profs/admins qui empruntent
  // les routes de la couche (student) pour passer en mode "Vue étudiant"
  // ne doivent jamais être bloqués (sinon : boucle de redirection au login).
  // ───────────────────────────────────────────────────────────────
  if (profile.role === 'student') {
    const pendingInterrogationId = await interrogationPromise;

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

  // Tutoriel vidéo du profil : ne montre que ce à quoi l'élève a accès.
  const tutoriel = videoTutoriel({
    offer: scopeForNav.offer,
    isDecouverte,
    medecineGenerale: hasMedecineGeneraleAccess(profile.permission_scope),
    planning: canAccessPlan,
    voie: scopeForNav.voie,
  });
  const tutorielEmbed = tutoriel ? bunnyEmbedUrl(tutoriel.videoId) : null;

  const feuillesDues = await feuillesDuesPromise.catch(() => [] as FeuilleEnAttente[]);
  const gardeEnquetes = await gardeEnquetesPromise;
  const studentName = `${(profile as { first_name?: string | null }).first_name ?? ''} ${(profile as { last_name?: string | null }).last_name ?? ''}`.trim()
    || (user.email ?? '');

  // Vue partagée (iframe du panneau, cf. middleware `x-embed`) : le contenu
  // seul. Ni menu, ni barre, ni popups, ni tutoriel — l'élève a déjà tout cela
  // dans la fenêtre principale. Les gardes ci-dessus (formulaire obligatoire,
  // restriction prof, blocage section 15, interrogation) restent appliquées.
  if (h.get('x-embed') === '1') {
    return (
      <div className="min-h-dvh bg-(--color-surface)" data-embed="1" data-onboarding-user={user.id}>
        {children}
      </div>
    );
  }

  return (
    // `data-onboarding-user` : les étapes du tutoriel déjà vues sont mémorisées
    // PAR COMPTE (cf. lib/student/onboarding). Auparavant elles l'étaient par
    // navigateur, si bien qu'un élève ouvert en « se connecter en tant que »
    // héritait des fermetures de l'administrateur et ne voyait plus rien.
    //
    // `h-screen` (100vh) mesure le viewport « barres masquées » des navigateurs
    // mobiles : quand la barre d'adresse est affichée, le bas du cadre
    // (`overflow-hidden` dans AppShell) est repoussé hors de l'écran, et la fin
    // de la zone défilante devient inatteignable — l'élève ne voyait plus le
    // bouton « Valider » sous la dernière proposition d'un QCM (tablette,
    // 2026-09-02). `100dvh` suit la hauteur réellement visible.
    <div className="flex h-screen flex-col supports-[height:100dvh]:h-dvh" data-onboarding-user={user.id}>
      {isImpersonating && <ImpersonationBanner targetName={impersonatedName} />}
      <div className="min-h-0 flex-1">
        <AppShell
          profile={profile}
          tree={tree}
          weeklyProgressDelta={weeklyProgressDelta}
          isDecouverte={isDecouverte}
          canAccessParcoursMajor={canAccessParcoursMajor}
          canAccessPlan={canAccessPlan}
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
      {feuillesDues.length > 0 && (
        <EmargementsEnAttente feuilles={feuillesDues} studentName={studentName} />
      )}
      {profile.role === 'student' && <ConseilsCenter welcome={welcome} />}
      {/* Questionnaires qualité : fenêtre bloquante selon le périmètre, sinon simple rappel ;
          les émargements dus passent avant. */}
      {profile.role === 'student' && feuillesDues.length === 0 && (
        <GardeEnquetes bloquant={gardeEnquetes.bloquant} enAttente={gardeEnquetes.enAttente} lectureSeule={isImpersonating} />
      )}
      {/* Mes Post-it : accueil, spécialités, items (chargés après la page, jamais sur une épreuve). */}
      {profile.role === 'student' && <ChargeurPostits userId={user.id} />}
      {/* Accueil = UNE fenêtre : le tutoriel vidéo du profil, avec sous la vidéo
          le texte d'accueil de l'administration. Le personnel la voit aussi,
          mais seulement sur demande (bouton « Tutoriel »), pour contrôler ce
          que voient les élèves. */}
      <TutorielVideo
        embedUrl={tutorielEmbed}
        welcome={isDecouverte || !welcome.active ? null : welcome}
        replayOnly={profile.role !== 'student' || isImpersonating}
        dejaVu={!!(profile as { tutoriel_video_vu_at?: string | null }).tutoriel_video_vu_at}
      />
    </div>
  );
}

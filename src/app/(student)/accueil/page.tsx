import { CarteEchanges } from '@/components/echanges/raccourcis';
import { Suspense, cache } from 'react';
import { redirect } from 'next/navigation';
import { Home, Sunrise } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { parseScope, hasMedecineGeneraleAccess } from '@/lib/auth/permissions';
import { AnnouncementsWidget } from '@/components/student/announcements-widget';
import { NouveauxContenusBanner } from '@/components/espace-decouverte/nouveaux-contenus-modal';
import { DiscoveryUpgradeCta } from '@/components/espace-decouverte/discovery-upgrade-cta';
import { getNavigatorTree } from '@/lib/data/navigator';
import { ProfWelcome } from '@/components/professor/prof-welcome';
import { ongletsDe } from '@/lib/auth/onglets-equipe';
import { CHECKUP_STUDENT_ENABLED, PEDAGO_ENGINE_STUDENT_ENABLED, PLAN_STUDENT_ENABLED } from '@/lib/modules-flags';
import { moteurOuvert } from '@/lib/moteur/access';
import { StudentHero, StudentPage } from '@/components/student/ui/page-kit';
import { BienDemarrer } from '@/components/student/guide/bien-demarrer';
import { chargerPriseEnMain } from '@/lib/student/prise-en-main';
import { chargerConseil } from '@/lib/student/conseil';
import type { Conseil, ConseilCle } from '@/lib/student/conseil-core';
import type { PriseEnMain } from '@/lib/student/prise-en-main-core';
import { fetchContentAccessForScope } from '@/lib/auth/formula-permissions';
import { planAvailableFor } from '@/lib/plan/service';
import type { PermissionScope } from '@/types/domain';
import { ResponsabiliteAccueil } from './pedago-today';
import {
  AlertesMoteur, BandeauChiffres, BandeauChiffresSkeleton, BandeauObjectif, BlocSkeleton, CarteEvc, CarteEvcSkeleton, CheckupBloc,
  ConsoliderBloc, CoursEnDirectBloc, EtatPreparationBloc, MaJourneeBloc, OuJenSuisBloc, StatistiquesBloc, TravaillerLibrementBloc,
} from './sections';
import { syntheseProgression } from './synthese';
import type { ConseilLigne } from './ma-journee';

export const metadata = { title: 'Accueil' };

/**
 * Accueil élève (maquette du 06/10/2026), au design de l'application :
 *  - en-tête : salutation, citation, compte à rebours de l'EVC ;
 *  - bandeau : temps à faire aujourd'hui, rythme de la semaine, jours consécutifs ;
 *  - 1. Ma journée et 2. Où j'en suis ?, avec en colonne de droite les cours
 *    en direct, l'EVC Check-up et l'état de préparation ;
 *  - 3. Mes statistiques, 4. Consolider mes acquis, 5. Je veux travailler
 *    librement, puis le bandeau d'objectif.
 * Chaque bloc est streamé dans son propre <Suspense> : la coque s'affiche tout
 * de suite. Restent, seulement quand ils ont quelque chose à dire : « Bien
 * démarrer » (prise en main), les alertes du moteur central, les annonces
 * (fiches concours, messages de l'administration) et l'offre Découverte.
 */
export default async function AccueilPage() {
  const { user, profile } = await requireUser();

  // Page d'accueil dédiée pour les professeurs : collèges accessibles, items, forum.
  if (profile.role === 'professor') {
    // Un monteur vidéo, un commercial ou un rédacteur blog repart vers la
    // première page que ses modules lui ouvrent dans l'administration.
    if (!(await ongletsDe(profile)).contenu) redirect('/admin');
    const tree = await getNavigatorTree(profile);
    return <ProfWelcome profile={profile} tree={tree} />;
  }

  const scope = parseScope(profile.permission_scope);
  const isDecouverte = scope.offer === 'decouverte' && scope.type === 'college' && scope.colleges.includes('col-decouverte');
  const firstName = profile.first_name || 'étudiant';
  const voieLabel = scope.voie === 'interne' ? 'Voie interne' : scope.voie === 'externe' ? 'Voie externe' : null;
  // Moteur pédagogique central : programme du jour unique et alertes (hors offre Découverte).
  const engine = moteurOuvert(profile, PEDAGO_ENGINE_STUDENT_ENABLED) && !isDecouverte;
  const checkup = moteurOuvert(profile, CHECKUP_STUDENT_ENABLED) && !isDecouverte;

  return (
    <StudentPage width="wide" className="gap-4">
      <StudentHero
        aide="accueil"
        icon={Home}
        watermark={<Sunrise strokeWidth={1.2} />}
        eyebrow={voieLabel ? <>Tableau de bord <span aria-hidden className="text-white/35">·</span> {voieLabel}</> : 'Tableau de bord'}
        title={<>Bonjour, {firstName} <span aria-hidden>👋</span></>}
        subtitle="Votre réussite se construit aujourd’hui, pas demain."
        actions={(
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 sm:pt-12">
            <p className="hidden max-w-[250px] text-right font-serif text-[15px] italic leading-snug text-white/80 lg:block">
              « Les efforts d’aujourd’hui font les réussites de demain. »
            </p>
            <Suspense fallback={<CarteEvcSkeleton />}>
              <CarteEvc userId={user.id} engine={engine} />
            </Suspense>
          </div>
        )}
      />

      <Suspense fallback={<BandeauChiffresSkeleton />}>
        <BandeauChiffres userId={user.id} engine={engine} />
      </Suspense>

      {/* Prise en main (« Bien démarrer ») tant qu'elle n'est pas terminée ni masquée. */}
      <Suspense fallback={null}>
        <BienDemarrerAccueil />
      </Suspense>

      <div className="grid w-full gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-4">
          <Suspense fallback={null}>
            <AlertesMoteur userId={user.id} engine={engine} />
          </Suspense>
          <Suspense fallback={<BlocSkeleton />}>
            <MaJourneeBloc userId={user.id} engine={engine} conseil={conseilLigne()} />
          </Suspense>
        </div>

        <aside className="flex min-w-0 flex-col gap-4">
          {/* Échanges : nouveaux messages, réponses de l'enseignant (CDC §3) — rien si aucun groupe n'est ouvert. */}
          {!isDecouverte && <CarteEchanges />}
          <Suspense fallback={<BlocSkeleton hauteur="h-64" />}>
            <CoursEnDirectBloc userId={user.id} scope={scope} />
          </Suspense>
          <Suspense fallback={<BlocSkeleton hauteur="h-52" />}>
            <CheckupBloc userId={user.id} ouvert={checkup} />
          </Suspense>
          <Suspense fallback={<BlocSkeleton hauteur="h-32" />}>
            <EtatPreparationBloc userId={user.id} />
          </Suspense>
          {isDecouverte && <DiscoveryUpgradeCta />}
          {isDecouverte && <NouveauxContenusBanner />}
        </aside>
      </div>

      <Suspense fallback={<BlocSkeleton hauteur="h-56" />}>
        <OuJenSuisBloc userId={user.id} scope={scope} engine={engine} />
      </Suspense>
      <Suspense fallback={<BlocSkeleton hauteur="h-72" />}>
        <StatistiquesBloc userId={user.id} scope={scope} />
      </Suspense>
      <Suspense fallback={<BlocSkeleton hauteur="h-72" />}>
        <ConsoliderBloc userId={user.id} engine={engine} isDecouverte={isDecouverte} />
      </Suspense>
      <Suspense fallback={<BlocSkeleton hauteur="h-40" />}>
        <TravaillerLibrementAccueil userId={user.id} scope={scope} isDecouverte={isDecouverte} />
      </Suspense>
      {/* Annonces (fiches concours, messages de l'administration) : seulement s'il y en a, en grille. */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-4 empty:hidden [&>div]:contents">
        <Suspense fallback={null}>
          <AnnouncementsWidget scope={scope} />
        </Suspense>
      </div>
      <Suspense fallback={<BlocSkeleton hauteur="h-28" />}>
        <BandeauObjectif userId={user.id} engine={engine} />
      </Suspense>

      {engine && (
        <Suspense fallback={null}>
          <ResponsabiliteAccueil userId={user.id} />
        </Suspense>
      )}
    </StudentPage>
  );
}

/** Outils libres : les flashcards ouvrent celles de l'item à travailler en premier. */
async function TravaillerLibrementAccueil({ userId, scope, isDecouverte }: { userId: string; scope: PermissionScope; isDecouverte: boolean }) {
  const s = await syntheseProgression(userId, scope).catch(() => null);
  return <TravaillerLibrementBloc isDecouverte={isDecouverte} flashcardsHref={s?.prochainCours ? `/cours/${s.prochainCours}/flashcards` : '/facultes'} />;
}

/**
 * Guide de l'accueil, calculé une fois par affichage (React `cache`) :
 * - « Bien démarrer » tant que la prise en main n'est pas terminée ni masquée ;
 * - « Le conseil du jour », TOUJOURS proposé (automatique, d'après l'activité
 *   de l'élève), en pied de « Ma journée ». Tant que la bande est là, il évite
 *   les étapes qu'elle porte déjà.
 * Élèves des formules payantes seulement (l'offre Découverte a son parcours).
 */
const guideAccueil = cache(async (): Promise<{ p: PriseEnMain | null; conseil: Conseil | null }> => {
  const { user, profile } = await requireUser();
  const scope = parseScope(profile.permission_scope);
  const decouverte = scope.offer === 'decouverte' && scope.type === 'college' && scope.colleges.includes('col-decouverte');
  if (profile.role !== 'student' || decouverte) return { p: null, conseil: null };
  const engine = moteurOuvert(profile, PEDAGO_ENGINE_STUDENT_ENABLED);
  const checkup = moteurOuvert(profile, CHECKUP_STUDENT_ENABLED);
  const [planning, parcours] = await Promise.all([
    PLAN_STUDENT_ENABLED ? planAvailableFor(profile.permission_scope).catch(() => false) : Promise.resolve(false),
    fetchContentAccessForScope(scope).then((a) => a.parcoursMajor && hasMedecineGeneraleAccess(profile.permission_scope)).catch(() => false),
  ]);
  const p = await chargerPriseEnMain(user.id, {
    tutorielVu: !!(profile as { tutoriel_video_vu_at?: string | null }).tutoriel_video_vu_at,
    ouverts: { checkup, moteur: engine, planning },
  }).catch(() => null);
  const exclure = (p?.etapes ?? []).filter((e) => !e.fait && e.cle !== 'tutoriel').map((e) => e.cle as ConseilCle);
  const conseil = await chargerConseil(user.id, {
    permissionScope: profile.permission_scope,
    promotion: (profile as { promotion?: string | null }).promotion ?? null,
    engine, checkup, planning, parcours, exclure,
  }).catch((e) => {
    console.error('[guide] conseil du jour :', e instanceof Error ? e.message : e);
    return null;
  });
  return { p, conseil };
});

async function BienDemarrerAccueil() {
  const { p } = await guideAccueil();
  return p ? <BienDemarrer p={p} /> : null;
}

async function conseilLigne(): Promise<ConseilLigne | null> {
  const { conseil } = await guideAccueil().catch(() => ({ conseil: null }));
  return conseil ? { cle: conseil.cle, texte: conseil.texte, href: conseil.href } : null;
}

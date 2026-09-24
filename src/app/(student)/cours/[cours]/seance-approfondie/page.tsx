import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, ArrowRight, Lock, Pencil, Video } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { canAccessCollege, parseScope } from '@/lib/auth/permissions';
import { fetchContentAccessForScope } from '@/lib/auth/formula-permissions';
import { blocVideoOuvert } from '@/lib/videos/audience';
import { estOuverte } from '@/lib/videos/unlock';
import { grouperParRubrique, rubriqueCommune, rubriqueDeVideo } from '@/lib/videos/rubriques';
import { CATEGORIES_VIDEO, titreCategorie } from '@/lib/videos/categories';
import { chargerReplays, compterReplays, type ReplayVideo } from '@/lib/videos/replays';
import { BunnyVideoPlayer } from '@/components/student/bunny-video-player';
import { EmargementGate } from '@/components/student/emargement-gate';
import { bunnyEmbedUrl } from '@/lib/bunny';
import { EmptyState } from '@/components/empty-state';
import { RubriqueEditor } from '@/components/student/rubrique-editor';
import { CategorieSwitch, type CategorieSwitchItem } from '@/components/student/replays/categorie-switch';
import { SeanceListe, type SeanceListeItem } from '@/components/student/replays/seance-liste';
import { SupportsDeSeance } from '@/components/student/replays/supports-de-seance';
import { SeanceAVenir } from '@/components/student/replays/seance-a-venir';
import { estSeanceAVenir, seanceMontrable } from '@/lib/videos/a-venir';

const CAT = CATEGORIES_VIDEO.seance_approfondie;

export default async function SeanceApprofondiePage({
  params,
  searchParams,
}: {
  params: Promise<{ cours: string }>;
  searchParams: Promise<{ v?: string; embed?: string }>;
}) {
  const { cours: coursId } = await params;
  const { v: onlyVideoId, embed } = await searchParams;
  // Le split view rend cette page en iframe avec `?embed=1` : les liens du
  // choix doivent conserver le paramètre, sinon la navigation interne à
  // l'iframe repasserait en pleine mise en page.
  const embedQs = embed ? `&embed=${encodeURIComponent(embed)}` : '';
  const { user, profile } = await requireUser();
  const supabase = await createClient();
  const isAdmin = profile.role === 'admin';
  const staffRubriques = isAdmin || profile.role === 'professor';

  const scope = parseScope(profile.permission_scope);
  const access = isAdmin ? undefined : await fetchContentAccessForScope(scope);

  // Cours, replays (les deux catégories, chaque vidéo avec SES supports,
  // filtrés pour cet élève — même point d'entrée que l'aperçu et la page des
  // séances intensives) et séances du professeur, en parallèle.
  const [{ data: c }, replays, { data: seanceSeries }] = await Promise.all([
    supabase
      .from('cours')
      .select('id, titre, matiere_id, matieres(nom)')
      .eq('id', coursId)
      .maybeSingle(),
    chargerReplays(supabase, coursId, { userId: user.id, scope, access, isAdmin }),
    // Déblocage PROGRESSIF : une vidéo RELIÉE à une séance du professeur
    // (videos.serie_id) s'ouvre avec CETTE séance. Faire la séance 1 ouvre la
    // vidéo 1, sans exiger d'avoir fait les séances 2 à 12. Une vidéo qui n'est
    // reliée à aucune séance n'a pas de déblocage : elle est ouverte (cf.
    // `estOuverte`).
    supabase
      .from('qcm_series')
      .select('id, label')
      .eq('cours_id', coursId)
      .eq('type', 'seance'),
  ]);
  if (!c) notFound();

  const seances = seanceSeries ?? [];
  const seanceIds = seances.map((s) => s.id);
  const labelById = new Map(seances.map((s) => [s.id, s.label]));

  let completedSerieIds = new Set<string>();
  if (seanceIds.length > 0) {
    const { data: completedSessions } = await supabase
      .from('qcm_sessions')
      .select('serie_id')
      .eq('user_id', user.id)
      .in('serie_id', seanceIds)
      .not('finished_at', 'is', null);
    completedSerieIds = new Set((completedSessions ?? []).map((s) => s.serie_id));
  }

  // L'audience portée par la vidéo fait foi (voies + formules + listes
  // nominatives) : `chargerReplays` a déjà écarté ce que l'élève ne doit pas
  // voir, y compris en navigation directe.
  const allSaVideos = replays.seance_approfondie;
  // Redirections tardives : on ne coupe la route qu'une fois qu'on sait
  // qu'aucune vidéo n'autorise l'élève à voir cette page. Sans cela, une
  // autorisation nominative sur une formule inférieure serait sabotée par le
  // droit global (access.seanceApprofondie), et l'accès au collège serait
  // bloqué avant même de connaître les autorisations.
  if (!isAdmin && !canAccessCollege(scope, c.matiere_id) && !replays.autoriseParVideo) redirect('/facultes');
  // Le droit de la formule ne ferme JAMAIS un bloc qui a du contenu ciblé
  // (cf. `blocVideoOuvert`) : une séance cochée « Formule Intensive » s'ouvre
  // pour un élève intensif, même si sa formule n'inclut pas les séances
  // approfondies. L'onglet et les cartes de l'aperçu suivent déjà cette règle —
  // la couper ici renvoyait l'élève sur l'item à chaque clic.
  if (!isAdmin && access && !blocVideoOuvert(allSaVideos, access.seanceApprofondie)) {
    redirect(`/cours/${coursId}`);
  }
  // `?v=<id>` : la page du cours propose une carte par séance approfondie et
  // pointe ici avec l'identifiant. On n'affiche alors QUE cette vidéo. Sans le
  // paramètre (ou s'il ne correspond à rien), on garde la liste complète.
  const saVideos = onlyVideoId
    ? allSaVideos.filter((v) => v.id === onlyVideoId)
    : allSaVideos;
  if (onlyVideoId && saVideos.length === 0) notFound();

  const isUnlocked = (v: ReplayVideo) => estOuverte(v, completedSerieIds, isAdmin);
  const motifFermeture = (v: ReplayVideo) => {
    const gate = v.serie_id ? labelById.get(v.serie_id) : null;
    return gate
      ? `Terminez « ${gate} » pour débloquer cette vidéo.`
      : 'Terminez les séances du professeur de ce cours pour débloquer cette vidéo.';
  };
  const watermarkText = `Accès réservé à ${profile.first_name} ${profile.last_name} — ${user.email}`;
  // Titre de page : la rubrique quand toutes les vidéos affichées la partagent,
  // sinon le libellé générique et un sous-groupe par rubrique.
  const rubriqueTitre = rubriqueCommune(saVideos) ?? 'Séances approfondies';

  // Sélecteur de catégorie : proposé dès que l'élève a AUSSI accès aux
  // séances intensives de cet item.
  // Même règle que la page « Séance intensive » : une vidéo, ou une séance à
  // venir qui a déjà des documents à préparer.
  const coursAvecSource = replays.cours.filter((v) => seanceMontrable(v, v.supports.length));
  const categories: CategorieSwitchItem[] = [
    { type: 'cours' as const, titre: titreCategorie('cours', rubriqueCommune(coursAvecSource)), ...compterReplays(coursAvecSource) },
    { type: 'seance_approfondie' as const, titre: titreCategorie('seance_approfondie', rubriqueCommune(allSaVideos)), ...compterReplays(allSaVideos) },
  ].filter((k) => k.seances > 0);
  const switchCategories = (
    <CategorieSwitch coursId={coursId} active="seance_approfondie" categories={categories} embedQs={embedQs} />
  );
  const surTitre = `${c.matieres?.nom} · ${CAT.formule}`;

  if (saVideos.length === 0) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6 lg:px-8">
        {switchCategories}
        <div className="rounded-xl border border-(--color-border) bg-(--color-surface) py-2">
          <EmptyState
            icon={Video}
            title="Vidéos bientôt disponibles"
            description="Les séances approfondies pour ce cours sont en cours de préparation."
          />
        </div>
      </div>
    );
  }

  // Plusieurs séances et aucune choisie : le PROGRAMME de la catégorie — une
  // ligne par séance, avec ses supports sous son titre — plutôt que d'empiler
  // tous les lecteurs. C'est l'entrée naturelle depuis le split view (iframe
  // sans `?v=`), et c'est plus lisible dès qu'il y a plus d'une séance.
  if (!onlyVideoId && allSaVideos.length > 1) {
    const commune = rubriqueCommune(allSaVideos);
    const groupes = grouperParRubrique(allSaVideos);
    const items = (videos: ReplayVideo[]): SeanceListeItem[] => videos.map((video) => {
      const ouverte = isUnlocked(video);
      return { video, ouverte, motifFermeture: ouverte ? null : motifFermeture(video) };
    });
    const nb = compterReplays(allSaVideos);
    const relie = allSaVideos.some((v) => !!v.serie_id && !v.unlock_direct);
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6 lg:px-8">
        {switchCategories}
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: CAT.accent }}>
          {surTitre}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-(--color-ink)">{commune ?? 'Séances approfondies'}</h1>
          {staffRubriques && commune && <RubriqueEditor coursId={coursId} type="seance_approfondie" value={commune} />}
        </div>
        <p className="mt-1 text-sm text-(--color-ink-soft)">
          {nb.seances} séance{nb.seances > 1 ? 's' : ''}
          {nb.supports > 0 ? ` · ${nb.supports} support${nb.supports > 1 ? 's' : ''}` : ''}
          {' — choisissez la séance à regarder ; ses supports sont listés sous son titre.'}
          {relie ? ' Celles qui sont reliées à une séance du professeur s’ouvrent une fois cette séance terminée.' : ''}
        </p>
        {commune ? (
          <div className="mt-6"><SeanceListe coursId={coursId} type="seance_approfondie" items={items(allSaVideos)} embedQs={embedQs} /></div>
        ) : (
          <div className="mt-6 space-y-8">
            {groupes.map((g) => (
              <section key={g.rubrique} aria-label={g.rubrique}>
                <h2 className="mb-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-(--color-ink-soft)">
                  {g.rubrique}
                  {staffRubriques && <RubriqueEditor coursId={coursId} type="seance_approfondie" value={g.rubrique} />}
                </h2>
                <SeanceListe coursId={coursId} type="seance_approfondie" items={items(g.videos)} embedQs={embedQs} />
              </section>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Émargement du cours : même obligation que sur la page vidéo, l'état vient
  // de la base pour résister au rechargement.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: attendance } = await (supabase as any)
    .from('course_attendances')
    .select('signed_at')
    .eq('user_id', user.id)
    .eq('cours_id', coursId)
    .eq('kind', 'seance')
    .maybeSingle();

  const hrefListe = `/cours/${coursId}/seance-approfondie${embed ? `?embed=${encodeURIComponent(embed)}` : ''}`;
  const hrefVideo = (v: ReplayVideo) => `/cours/${coursId}/seance-approfondie?v=${v.id}${embedQs}`;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 lg:px-8">
      {profile.role === 'student' && (
        <EmargementGate
          coursId={coursId}
          coursTitre={c.titre}
          kind="seance"
          studentName={`${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() || (user.email ?? '')}
          initialPending={!!attendance && !attendance.signed_at}
          initialSigned={!!attendance?.signed_at}
        />
      )}
      {allSaVideos.length > 1 && (
        <Link
          href={hrefListe}
          className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-(--color-ink-soft) underline-offset-2 hover:text-(--color-ink) hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Toutes les séances
        </Link>
      )}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: CAT.accent }}>
            {surTitre}
          </p>
          <h1 className="mt-1 text-lg font-bold tracking-tight text-(--color-ink) sm:text-xl">
            {rubriqueTitre}
          </h1>
        </div>
        {isAdmin && (
          <Link
            href={`/admin/contenu/${coursId}`}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-xs font-semibold text-(--color-ink-soft) transition-colors hover:bg-(--color-sand-100) hover:text-(--color-ink)"
          >
            <Pencil className="h-3.5 w-3.5" />
            Modifier
          </Link>
        )}
      </div>

      <div className="space-y-8">
        {saVideos.map((v) => {
          const bunnyId = v.bunny_video_id;
          const embedUrl = bunnyId ? bunnyEmbedUrl(bunnyId) : null;
          const unlocked = isUnlocked(v);
          const position = allSaVideos.indexOf(v);
          const precedente = position > 0 ? allSaVideos[position - 1] : null;
          const suivante = position < allSaVideos.length - 1 ? allSaVideos[position + 1] : null;
          return (
            <section key={v.id}>
              <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-(--color-ink)">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={unlocked
                    ? { background: CAT.fond, color: CAT.accent }
                    : { background: 'var(--color-sand-100)', color: 'var(--color-ink-soft)' }}
                >
                  {unlocked ? <Video className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                </span>
                <span className="min-w-0">
                  {/* Rubrique rappelée seulement si elle diffère du titre de page. */}
                  {rubriqueDeVideo(v) !== rubriqueTitre && (
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-(--color-ink-soft)">
                      {rubriqueDeVideo(v)}
                    </span>
                  )}
                  {allSaVideos.length > 1 && (
                    <span className="mr-2 font-mono text-sm font-bold text-(--color-ink-muted)">{String(position + 1).padStart(2, '0')}</span>
                  )}
                  {v.titre}
                </span>
              </h2>
              {!unlocked ? (
                <div className="rounded-xl border border-(--color-border) bg-(--color-surface) py-2">
                  <EmptyState
                    icon={Lock}
                    title="Séance à terminer d'abord"
                    description={motifFermeture(v)}
                  />
                </div>
              ) : estSeanceAVenir(v) ? (
                // Séance en direct pas encore filmée : l'annonce, puis les
                // dossiers à préparer juste en dessous.
                <SeanceAVenir liveAt={v.live_at} nbSupports={v.supports.length} accent={CAT.accent} fond={CAT.fond} />
              ) : embedUrl ? (
                <BunnyVideoPlayer embedUrl={embedUrl} coursId={coursId} watermarkText={watermarkText} />
              ) : (
                <div className="rounded-xl border border-(--color-border) bg-(--color-surface) py-2">
                  <EmptyState
                    icon={Video}
                    title="Vidéo bientôt disponible"
                    description="Cette séance approfondie est en cours de post-production."
                  />
                </div>
              )}

              {/* Les supports de CETTE séance, sous son lecteur (une séance
                  verrouillée garde ses supports verrouillés avec elle). */}
              {unlocked && (
                <SupportsDeSeance
                  coursId={coursId}
                  videoId={v.id}
                  supports={v.supports}
                  accent={CAT.accent}
                  fond={CAT.fond}
                  embedQs={embedQs}
                  embed={!!embed}
                />
              )}

              {(precedente || suivante) && (
                <nav aria-label="Séance précédente / suivante" className="mt-5 flex items-center justify-between gap-3">
                  {precedente ? (
                    <Link href={hrefVideo(precedente)} className="inline-flex min-w-0 items-center gap-1.5 text-sm font-semibold text-(--color-ink-soft) hover:text-(--color-ink)">
                      <ArrowLeft className="h-4 w-4 shrink-0" />
                      <span className="truncate">{precedente.titre}</span>
                    </Link>
                  ) : <span />}
                  {suivante && (
                    <Link href={hrefVideo(suivante)} className="inline-flex min-w-0 items-center gap-1.5 text-sm font-semibold hover:underline" style={{ color: CAT.accent }}>
                      <span className="truncate">{suivante.titre}</span>
                      <ArrowRight className="h-4 w-4 shrink-0" />
                    </Link>
                  )}
                </nav>
              )}
            </section>
          );
        })}
      </div>

      {allSaVideos.length === 1 && <div className="mt-6">{switchCategories}</div>}
    </div>
  );
}

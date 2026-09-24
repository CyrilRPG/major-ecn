import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, ArrowRight, FileText, PlayCircle } from 'lucide-react';
import { requireUser, profPageReadGuard } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/empty-state';
import { VideoPlayer } from '@/components/student/video-player';
import { BunnyVideoPlayer } from '@/components/student/bunny-video-player';
import { EmargementGate } from '@/components/student/emargement-gate';
import { bunnyEmbedUrl } from '@/lib/bunny';
import { canAccessCollege, parseScope } from '@/lib/auth/permissions';
import { fetchContentAccessForScope } from '@/lib/auth/formula-permissions';
import { blocVideoOuvert } from '@/lib/videos/audience';
import { grouperParRubrique, rubriqueCommune, rubriqueDeVideo, rubriqueParDefaut } from '@/lib/videos/rubriques';
import { CATEGORIES_VIDEO, titreCategorie } from '@/lib/videos/categories';
import { chargerReplays, compterReplays, type ReplayVideo } from '@/lib/videos/replays';
import { RubriqueEditor } from '@/components/student/rubrique-editor';
import { CategorieSwitch, type CategorieSwitchItem } from '@/components/student/replays/categorie-switch';
import { SeanceListe } from '@/components/student/replays/seance-liste';
import { SupportsDeSeance } from '@/components/student/replays/supports-de-seance';
import { SeanceAVenir } from '@/components/student/replays/seance-a-venir';
import { estSeanceAVenir, seanceMontrable } from '@/lib/videos/a-venir';

const CAT = CATEGORIES_VIDEO.cours;

export default async function CoursVideoPage({
  params,
  searchParams,
}: {
  params: Promise<{ cours: string }>;
  searchParams: Promise<{ v?: string; embed?: string }>;
}) {
  const { cours: coursId } = await params;
  const { v: onlyVideoId, embed } = await searchParams;
  // Le split view rend cette page en iframe avec `?embed=1` : les liens de la
  // liste doivent conserver le paramètre.
  const embedQs = embed ? `&embed=${encodeURIComponent(embed)}` : '';
  const { user, profile } = await requireUser();
  const supabase = await createClient();

  const scope = parseScope(profile.permission_scope);
  const isAdmin = profile.role === 'admin';
  // Crayon de renommage de la rubrique (vue étudiant du personnel).
  const staffRubriques = isAdmin || profile.role === 'professor';
  const access = isAdmin ? undefined : await fetchContentAccessForScope(scope);

  // Cours + replays en parallèle : le contrôle d'accès au collège dépend
  // AUSSI des autorisations nominatives portées par les vidéos, qu'il faut
  // donc connaître avant de rediriger. Les replays sont chargés par le même
  // point d'entrée que l'aperçu et la page des séances approfondies : les
  // deux catégories, chaque vidéo avec SES supports, filtrés pour cet élève.
  const [{ data: c }, replays] = await Promise.all([
    supabase
      .from('cours')
      .select(`
        id, titre, matiere_id,
        matieres(id, nom, semestre_id, semestres(id, label, faculte_id, facultes(id, nom)))
      `)
      .eq('id', coursId)
      .maybeSingle(),
    chargerReplays(supabase, coursId, { userId: user.id, scope, access, isAdmin }),
  ]);
  if (!c || !c.matieres?.semestres) notFound();
  if (!isAdmin && !canAccessCollege(scope, c.matiere_id) && !replays.autoriseParVideo) redirect('/facultes');
  profPageReadGuard(profile, 'video', `/cours/${coursId}`);

  // Une vidéo sans source (ni Bunny ni fichier) n'est pas encore regardable :
  // elle ne se montre que comme « séance à venir », quand l'élève a déjà au
  // moins un document à préparer (cf. `seanceMontrable`).
  const allVideos = replays.cours.filter((v) => seanceMontrable(v, v.supports.length));
  // Ni droit de formule, ni vidéo ciblant cet élève : la page n'a rien à
  // montrer et n'aurait pas dû être atteignable (règle commune à tous les
  // blocs vidéo, cf. `blocVideoOuvert`).
  if (!isAdmin && access && !blocVideoOuvert(allVideos, access.video)) redirect(`/cours/${coursId}`);

  // Sélecteur de catégorie : proposé dès que l'élève a AUSSI accès aux
  // séances approfondies de cet item. Chaque catégorie ne montre que son
  // contenu, l'élève choisit d'abord laquelle il travaille.
  const categories: CategorieSwitchItem[] = [
    { type: 'cours' as const, titre: titreCategorie('cours', rubriqueCommune(allVideos)), ...compterReplays(allVideos) },
    { type: 'seance_approfondie' as const, titre: titreCategorie('seance_approfondie', rubriqueCommune(replays.seance_approfondie)), ...compterReplays(replays.seance_approfondie) },
  ].filter((k) => k.seances > 0);
  const switchCategories = (
    <CategorieSwitch coursId={coursId} active="cours" categories={categories} embedQs={embedQs} />
  );
  const surTitre = `${c.matieres?.nom} · ${CAT.formule}`;

  const watermarkText = `Accès réservé à ${profile.first_name} ${profile.last_name} — ${user.email}`;

  // Émargement : l'état fait autorité côté serveur, pour qu'un rechargement ne
  // permette pas de contourner la signature. Les admins et professeurs
  // consultent les cours sans être soumis à l'obligation.
  const isStudent = profile.role === 'student';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: attendance } = await (supabase as any)
    .from('course_attendances')
    .select('signed_at')
    .eq('user_id', user.id)
    .eq('cours_id', coursId)
    .eq('kind', 'video')
    .maybeSingle();

  const gate = isStudent ? (
    <EmargementGate
      coursId={coursId}
      coursTitre={c.titre}
      studentName={`${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() || (user.email ?? '')}
      initialPending={!!attendance && !attendance.signed_at}
      initialSigned={!!attendance?.signed_at}
    />
  ) : null;

  if (allVideos.length === 0) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6 lg:px-8">
        {switchCategories}
        <div className="rounded-xl border border-(--color-border) bg-(--color-surface) py-2">
          <EmptyState
            icon={PlayCircle}
            title="Vidéo bientôt disponible"
            description="L’enregistrement de ce cours est en cours de post-production. En attendant, ouvrez la fiche de cours exhaustive pour avancer votre préparation."
            action={
              <Button asChild>
                <Link href={`/cours/${coursId}/fiche`}>
                  <FileText />
                  Ouvrir la fiche de cours exhaustive
                </Link>
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  // Plusieurs vidéos et aucune choisie : le PROGRAMME de la catégorie — une
  // ligne par séance, avec ses supports sous son titre — plutôt que d'empiler
  // les lecteurs.
  if (!onlyVideoId && allVideos.length > 1) {
    // Rubriques : une seule commune à toutes les vidéos ⇒ elle devient le titre
    // de la page ; plusieurs ⇒ un sous-groupe par rubrique, dans l'ordre décidé
    // (Préparation intensive d'abord), pour que l'élève sache quoi travailler
    // et dans quel ordre.
    const commune = rubriqueCommune(allVideos);
    const groupes = grouperParRubrique(allVideos);
    const items = (videos: ReplayVideo[]) => videos.map((video) => ({ video, ouverte: true }));
    const nb = compterReplays(allVideos);
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6 lg:px-8">
        {switchCategories}
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: CAT.accent }}>
          {surTitre}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-(--color-ink)">{commune ?? rubriqueParDefaut('cours')}</h1>
          {staffRubriques && commune && <RubriqueEditor coursId={coursId} type="cours" value={commune} />}
        </div>
        <p className="mt-1 text-sm text-(--color-ink-soft)">
          {nb.seances} séance{nb.seances > 1 ? 's' : ''}
          {nb.supports > 0 ? ` · ${nb.supports} support${nb.supports > 1 ? 's' : ''}` : ''}
          {' — choisissez la séance à regarder ; ses supports sont listés sous son titre.'}
        </p>
        {commune ? (
          <div className="mt-6"><SeanceListe coursId={coursId} type="cours" items={items(allVideos)} embedQs={embedQs} /></div>
        ) : (
          <div className="mt-6 space-y-8">
            {groupes.map((g) => (
              <section key={g.rubrique} aria-label={g.rubrique}>
                <h2 className="mb-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-(--color-ink-soft)">
                  {g.rubrique}
                  {staffRubriques && <RubriqueEditor coursId={coursId} type="cours" value={g.rubrique} />}
                </h2>
                <SeanceListe coursId={coursId} type="cours" items={items(g.videos)} embedQs={embedQs} />
              </section>
            ))}
          </div>
        )}
      </div>
    );
  }

  const video = onlyVideoId ? allVideos.find((v) => v.id === onlyVideoId) : allVideos[0];
  if (!video) notFound();
  // Séance à venir : ni lecteur ni émargement (rien à regarder), les dossiers
  // à préparer sous l'annonce.
  const aVenir = estSeanceAVenir(video);
  const position = allVideos.indexOf(video);
  const precedente = position > 0 ? allVideos[position - 1] : null;
  const suivante = position < allVideos.length - 1 ? allVideos[position + 1] : null;

  // L'embed ne dépend d'aucune configuration serveur (cf. bunny.ts) : quand la
  // clé API manquait en production, cette page affichait « Vidéo bientôt
  // disponible » pour TOUS les cours alors que les vidéos existaient.
  const bunnyId = video.bunny_video_id;
  const embedUrl = bunnyId ? bunnyEmbedUrl(bunnyId) : null;
  let signedUrl: string | null = null;
  if (!embedUrl && video.storage_path) {
    const { data } = await supabase.storage.from('videos').createSignedUrl(video.storage_path, 60 * 60);
    signedUrl = data?.signedUrl ?? null;
  }
  const hrefListe = `/cours/${coursId}/video${embed ? `?embed=${encodeURIComponent(embed)}` : ''}`;
  const hrefVideo = (v: ReplayVideo) => `/cours/${coursId}/video?v=${v.id}${embedQs}`;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 lg:px-8">
      {!aVenir && gate}
      {allVideos.length > 1 && (
        <Link
          href={hrefListe}
          className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-(--color-ink-soft) underline-offset-2 hover:text-(--color-ink) hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Toutes les séances
        </Link>
      )}
      <div className="mb-4">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: CAT.accent }}>
          {rubriqueDeVideo(video)}
          {staffRubriques && <RubriqueEditor coursId={coursId} type="cours" value={rubriqueDeVideo(video)} />}
        </p>
        <h1 className="text-lg font-bold tracking-tight text-(--color-ink) sm:text-xl">
          {allVideos.length > 1 && (
            <span className="mr-2 font-mono text-sm font-bold text-(--color-ink-muted)">{String(position + 1).padStart(2, '0')}</span>
          )}
          {video.titre}
        </h1>
      </div>
      {aVenir ? (
        <SeanceAVenir liveAt={video.live_at} nbSupports={video.supports.length} accent={CAT.accent} fond={CAT.fond} />
      ) : embedUrl ? (
        <BunnyVideoPlayer embedUrl={embedUrl} coursId={coursId} watermarkText={watermarkText} />
      ) : signedUrl ? (
        <VideoPlayer src={signedUrl} coursId={coursId} />
      ) : (
        <div className="rounded-xl border border-(--color-border) bg-(--color-surface) py-2">
          <EmptyState
            icon={PlayCircle}
            title="Vidéo bientôt disponible"
            description="L’enregistrement de ce cours est en cours de post-production. En attendant, ouvrez la fiche de cours exhaustive pour avancer votre préparation."
            action={
              <Button asChild>
                <Link href={`/cours/${coursId}/fiche`}>
                  <FileText />
                  Ouvrir la fiche de cours exhaustive
                </Link>
              </Button>
            }
          />
        </div>
      )}

      {/* Les supports de CETTE séance, sous son lecteur. */}
      <SupportsDeSeance
        coursId={coursId}
        videoId={video.id}
        supports={video.supports}
        accent={CAT.accent}
        fond={CAT.fond}
        embedQs={embedQs}
        embed={!!embed}
      />

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

      {allVideos.length === 1 && <div className="mt-6">{switchCategories}</div>}
    </div>
  );
}

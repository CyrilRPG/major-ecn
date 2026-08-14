import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { FileText, PlayCircle } from 'lucide-react';
import { requireUser, profPageReadGuard } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/empty-state';
import { VideoPlayer } from '@/components/student/video-player';
import { BunnyVideoPlayer } from '@/components/student/bunny-video-player';
import { EmargementGate } from '@/components/student/emargement-gate';
import { bunnyEmbedUrl } from '@/lib/bunny';
import { canAccessCollege, parseScope, scopeOffers } from '@/lib/auth/permissions';
import { fetchContentAccessForScope } from '@/lib/auth/formula-permissions';
import { videoVisible, eleveAutorise, eleveExclu } from '@/lib/videos/audience';

type CoursVideo = {
  id: string;
  titre: string;
  bunny_video_id: string | null;
  storage_path: string | null;
  voies: string[] | null;
  offers: string[] | null;
  denied_user_ids: string[] | null;
  allowed_user_ids: string[] | null;
};

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

  // Cours + vidéos en parallèle : le contrôle d'accès au collège dépend
  // maintenant AUSSI des autorisations nominatives portées par les vidéos,
  // qu'il faut donc connaître avant de rediriger.
  const [{ data: c }, { data: videoRows }] = await Promise.all([
    supabase
      .from('cours')
      .select(`
        id, titre, matiere_id,
        matieres(id, nom, semestre_id, semestres(id, label, faculte_id, facultes(id, nom)))
      `)
      .eq('id', coursId)
      .maybeSingle(),
    // Un item peut porter plusieurs cours vidéo, dans l'ordre choisi par
    // l'administrateur (Contenu › Cours vidéo).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from('videos')
      .select('id, titre, bunny_video_id, storage_path, voies, offers, denied_user_ids, allowed_user_ids')
      .eq('cours_id', coursId)
      .eq('type', 'cours')
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: true }),
  ]);
  if (!c || !c.matieres?.semestres) notFound();
  const allVideosRaw = (videoRows ?? []) as CoursVideo[];
  const autoriseParVideo = allVideosRaw.some(
    (v) => eleveAutorise(v, user.id) && !eleveExclu(v, user.id),
  );
  if (!isAdmin && !canAccessCollege(scope, c.matiere_id) && !autoriseParVideo) redirect('/facultes');
  const access = isAdmin ? undefined : await fetchContentAccessForScope(scope);
  profPageReadGuard(profile, 'video', `/cours/${coursId}`);
  // L'audience est portée par la vidéo (voies + formules cochées à l'ajout, plus
  // les listes nominatives) ; le droit global de la formule ne sert que de repli.
  const offresEleve = scopeOffers(scope);
  const allVideos = allVideosRaw.filter(
    (v) => (!!v.bunny_video_id || !!v.storage_path)
      && (isAdmin || videoVisible(v, {
        offres: offresEleve, voie: scope.voie ?? null, droitFormule: !access || access.video, userId: user.id,
      })),
  );
  // Ni droit de formule, ni vidéo ciblant cet élève : la page n'a rien à
  // montrer et n'aurait pas dû être atteignable.
  if (!isAdmin && access && !access.video && allVideos.length === 0) redirect(`/cours/${coursId}`);

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

  // Plusieurs vidéos et aucune choisie : on présente la liste plutôt que
  // d'empiler les lecteurs.
  if (!onlyVideoId && allVideos.length > 1) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6 lg:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-(--color-primary-deep)">
          {c.matieres?.nom} · Cours vidéo
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-(--color-ink)">Cours vidéo</h1>
        <p className="mt-1 text-sm text-(--color-ink-soft)">Choisissez la vidéo à regarder.</p>
        <ul className="mt-6 space-y-3">
          {allVideos.map((v, i) => (
            <li key={v.id}>
              <Link
                href={`/cours/${coursId}/video?v=${v.id}${embedQs}`}
                className="flex items-center gap-3 rounded-xl border border-(--color-border) bg-(--color-surface) p-3 transition-colors hover:bg-(--color-sand-100)"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--color-primary-soft) text-(--color-primary-deep)">
                  <PlayCircle className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-(--color-ink)">
                    {v.titre?.trim() || `Cours vidéo ${i + 1}`}
                  </span>
                  <span className="mt-0.5 block text-xs text-(--color-ink-soft)">
                    Disponible — cliquez pour lancer la vidéo.
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const video = onlyVideoId ? allVideos.find((v) => v.id === onlyVideoId) : allVideos[0];
  if (!video) notFound();

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

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 lg:px-8">
      {gate}
      {allVideos.length > 1 && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <h1 className="min-w-0 truncate text-lg font-bold tracking-tight text-(--color-ink)">
            {video.titre}
          </h1>
          <Link
            href={`/cours/${coursId}/video${embed ? `?embed=${encodeURIComponent(embed)}` : ''}`}
            className="shrink-0 text-xs font-semibold text-(--color-ink-soft) underline underline-offset-2 hover:text-(--color-ink)"
          >
            Toutes les vidéos
          </Link>
        </div>
      )}
      {embedUrl ? (
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
    </div>
  );
}

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
import { bunnyEmbedUrl, getBunnyConfig } from '@/lib/bunny';
import { canAccessCollege, parseScope } from '@/lib/auth/permissions';
import { fetchContentAccessForScope } from '@/lib/auth/formula-permissions';

type CoursVideo = {
  id: string;
  titre: string;
  bunny_video_id: string | null;
  storage_path: string | null;
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

  const { data: c } = await supabase
    .from('cours')
    .select(`
      id, titre, matiere_id,
      matieres(id, nom, semestre_id, semestres(id, label, faculte_id, facultes(id, nom)))
    `)
    .eq('id', coursId)
    .maybeSingle();
  if (!c || !c.matieres?.semestres) notFound();
  const scope = parseScope(profile.permission_scope);
  if (!canAccessCollege(scope, c.matiere_id)) redirect('/facultes');
  if (profile.role !== 'admin' && !(await fetchContentAccessForScope(scope)).video) redirect(`/cours/${coursId}`);
  profPageReadGuard(profile, 'video', `/cours/${coursId}`);

  // Un item peut porter plusieurs cours vidéo, dans l'ordre choisi par
  // l'administrateur (Contenu › Cours vidéo).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: videoRows } = await (supabase as any)
    .from('videos')
    .select('id, titre, bunny_video_id, storage_path')
    .eq('cours_id', coursId)
    .eq('type', 'cours')
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true });
  const allVideos = ((videoRows ?? []) as CoursVideo[]).filter(
    (v) => !!v.bunny_video_id || !!v.storage_path,
  );

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

  const bunnyId = video.bunny_video_id;
  const embedUrl = bunnyId && getBunnyConfig() ? bunnyEmbedUrl(bunnyId) : null;
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

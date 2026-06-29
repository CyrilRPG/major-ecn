import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { FileText, PlayCircle } from 'lucide-react';
import { requireUser, profPageReadGuard } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/empty-state';
import { VideoPlayer } from '@/components/student/video-player';
import { BunnyVideoPlayer } from '@/components/student/bunny-video-player';
import { bunnyEmbedUrl, getBunnyConfig } from '@/lib/bunny';
import { canAccessCollege, parseScope } from '@/lib/auth/permissions';
import { fetchContentAccess } from '@/lib/auth/formula-permissions';

export default async function CoursVideoPage({ params }: { params: Promise<{ cours: string }> }) {
  const { cours: coursId } = await params;
  const { user, profile } = await requireUser();
  const supabase = await createClient();

  const { data: c } = await supabase
    .from('cours')
    .select(`
      id, titre, matiere_id,
      matieres(id, nom, semestre_id, semestres(id, label, faculte_id, facultes(id, nom))),
      videos(id, storage_path, bunny_video_id)
    `)
    .eq('id', coursId)
    .maybeSingle();
  if (!c || !c.matieres?.semestres) notFound();
  const scope = parseScope(profile.permission_scope);
  if (!canAccessCollege(scope, c.matiere_id)) redirect('/facultes');
  if (profile.role !== 'admin' && !(await fetchContentAccess(scope.offer)).video) redirect(`/cours/${coursId}`);
  profPageReadGuard(profile, 'video', `/cours/${coursId}`);

  const video = c.videos?.[0] as { storage_path?: string | null; bunny_video_id?: string | null } | undefined;
  // Priorité à Bunny Stream si une vidéo y est associée ; sinon bucket Supabase.
  const bunnyId = video?.bunny_video_id ?? null;
  const embedUrl = bunnyId && getBunnyConfig() ? bunnyEmbedUrl(bunnyId) : null;
  const watermarkText = `Accès réservé à ${profile.first_name} ${profile.last_name} — ${user.email}`;
  let signedUrl: string | null = null;
  if (!bunnyId && video?.storage_path) {
    const { data } = await supabase.storage.from('videos').createSignedUrl(video.storage_path, 60 * 60);
    signedUrl = data?.signedUrl ?? null;
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 lg:px-8">
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

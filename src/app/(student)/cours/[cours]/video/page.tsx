import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { FileText, PlayCircle } from 'lucide-react';
import { requireUser, profPageReadGuard } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/empty-state';
import { VideoPlayer } from '@/components/student/video-player';
import { canAccessCollege, parseScope } from '@/lib/auth/permissions';

export default async function CoursVideoPage({ params }: { params: Promise<{ cours: string }> }) {
  const { cours: coursId } = await params;
  const { profile } = await requireUser();
  const supabase = await createClient();

  const { data: c } = await supabase
    .from('cours')
    .select(`
      id, titre, matiere_id,
      matieres(id, nom, semestre_id, semestres(id, label, faculte_id, facultes(id, nom))),
      videos(id, storage_path)
    `)
    .eq('id', coursId)
    .maybeSingle();
  if (!c || !c.matieres?.semestres) notFound();
  if (!canAccessCollege(parseScope(profile.permission_scope), c.matiere_id)) redirect('/facultes');
  profPageReadGuard(profile, 'video', `/cours/${coursId}`);

  const video = c.videos?.[0];
  let signedUrl: string | null = null;
  if (video?.storage_path) {
    const { data } = await supabase.storage.from('videos').createSignedUrl(video.storage_path, 60 * 60);
    signedUrl = data?.signedUrl ?? null;
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 lg:px-8">
      {signedUrl ? (
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
